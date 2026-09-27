"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "contexts/UserContext";
import {
  getPlayoffHubAPI,
  submitSeriesPredictionAPI,
} from "services/predictions";
import type { PlayoffHubResponse } from "interfaces/predictions";
import {
  IconFlame,
  IconCrown,
  IconSwords,
  IconCheck,
  IconLock,
  IconAlertCircle,
  IconBrandSteam,
  IconSparkles,
  IconChartBar,
  IconInfoCircle,
  IconMail,
  IconHistory,
  IconChevronDown,
} from "@tabler/icons-react";
import { Loader } from "@mantine/core";

export default function PrediccionesPage() {
  const { user, loadingUser } = useUser();
  const [hubData, setHubData] = useState<PlayoffHubResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Match prediction loading state per series
  const [votingSeriesSlug, setVotingSeriesSlug] = useState<string | null>(null);
  // Accordion state for completed matches (closed by default)
  const [showCompletedMatches, setShowCompletedMatches] = useState(false);

  // Load hub data
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        const data = await getPlayoffHubAPI("el-gran-coliseo-ii", Boolean(user));
        if (!isCancelled && data) {
          setHubData(data);
        }
      } catch (err) {
        console.error("Error loading predictions hub:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [user]);

  // Asegurar que siempre inicie en el scroll 0 al entrar o navegar a la página
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // Asegurar scroll 0 cuando termine de cargar la data y se renderice el contenido completo
  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading]);



  // Handle Series Vote
  const handleVoteSeries = async (seriesSlug: string, teamSlug: string) => {
    if (!user) {
      setErrorMsg("Debes iniciar sesión con Steam para votar en este match.");
      return;
    }

    try {
      setVotingSeriesSlug(seriesSlug);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await submitSeriesPredictionAPI({
        series_slug: seriesSlug,
        team_slug: teamSlug,
      });

      if ("error" in res) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(res.message || "¡Voto registrado!");
        // Update the match in local state optimistically
        if (res.community_votes && hubData) {
          setHubData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              matches: prev.matches.map((m) =>
                m.slug === seriesSlug
                  ? { ...m, community_votes: res.community_votes! }
                  : m
              ),
            };
          });
        }
      }
    } catch {
      setErrorMsg("Ocurrió un error al registrar tu voto.");
    } finally {
      setVotingSeriesSlug(null);
    }
  };

  const allMatches = hubData?.matches || [];
  const openMatches = allMatches.filter((m) => m.status === "SCHEDULED");
  const completedMatches = allMatches.filter((m) => m.status !== "SCHEDULED");

  const renderMatchCard = (match: (typeof allMatches)[number]) => {
    const isVoting = votingSeriesSlug === match.slug;
    const userVote = match.community_votes.user_prediction;
    const canVote = match.status === "SCHEDULED" && Boolean(match.team_a && match.team_b);
    const isMatchLocked = match.status !== "SCHEDULED";

    return (
      <div
        key={match.slug}
        className="group relative border border-[#2d261e] bg-[#130f0a]/90 p-5 sm:p-6 backdrop-blur-md shadow-xl transition-all hover:border-[#d8b467]/50"
      >
        {/* Match Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#241e17] pb-3">
          <div className="flex items-center gap-2">
            <span className="font-chakra text-[10px] font-black uppercase tracking-widest text-[#f0d38f] bg-[#d8b467]/15 border border-[#d8b467]/30 px-2 py-0.5">
              {match.round_name}
            </span>
            <span className="font-chakra text-[10px] font-bold text-[#8e857b] uppercase">
              {match.best_of}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-chakra text-[#9e968a]">
            {isMatchLocked ? (
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <IconLock size={12} />
                <span>{match.status === "COMPLETED" ? "Finalizada" : "En Juego"}</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">
                Votación Abierta (+10 pts)
              </span>
            )}
          </div>
        </div>

        {/* Versus Matchups & Live Percentage Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-6">
          {/* Team A */}
          <div className="flex items-center justify-between sm:justify-start gap-4 p-3 bg-[#17130e] border border-[#2d261e]">
            <div className="flex items-center gap-3">
              {match.team_a?.logo ? (
                <picture>
                  <img
                    src={match.team_a.logo}
                    alt={match.team_a.name}
                    className="h-10 w-10 object-contain"
                  />
                </picture>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center bg-black/40 text-[#f0d38f] font-bold">
                  {match.team_a?.tag || "A"}
                </div>
              )}
              <div className="text-left">
                <h4 className="font-chakra text-sm sm:text-base font-black text-white">
                  {match.team_a?.name || "TBD"}
                </h4>
                <span className="font-chakra text-xs text-[#a89f91]">
                  {match.community_votes.team_a_percentage}% de preferencia
                </span>
              </div>
            </div>

            {/* Team A Vote Button */}
            {match.team_a && (
              <button
                type="button"
                disabled={!canVote || isVoting}
                onClick={() => handleVoteSeries(match.slug, match.team_a!.slug)}
                className={`shrink-0 px-4 py-2 font-chakra text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  userVote?.predicted_winner_slug === match.team_a.slug
                    ? "bg-[#2e9df0] text-black border border-[#6cc4ff] shadow-[0_0_15px_rgba(46,157,240,0.6)]"
                    : "border border-[#2e9df0]/60 text-[#6cc4ff] bg-[#2e9df0]/10 hover:bg-[#2e9df0] hover:text-black"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {userVote?.predicted_winner_slug === match.team_a.slug ? "Elegido ✓" : "Votar"}
              </button>
            )}
          </div>

          {/* Center VS */}
          <div className="text-center font-chakra text-xs font-black tracking-widest text-[#7e766c]">
            VS
          </div>

          {/* Team B */}
          <div className="flex items-center justify-between sm:justify-end gap-4 p-3 bg-[#17130e] border border-[#2d261e]">
            {/* Team B Vote Button */}
            {match.team_b && (
              <button
                type="button"
                disabled={!canVote || isVoting}
                onClick={() => handleVoteSeries(match.slug, match.team_b!.slug)}
                className={`shrink-0 px-4 py-2 font-chakra text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  userVote?.predicted_winner_slug === match.team_b.slug
                    ? "bg-[#f0d38f] text-black border border-[#ffe5a3] shadow-[0_0_15px_rgba(240,211,143,0.6)]"
                    : "border border-[#f0d38f]/60 text-[#f0d38f] bg-[#f0d38f]/10 hover:bg-[#f0d38f] hover:text-black"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {userVote?.predicted_winner_slug === match.team_b.slug ? "Elegido ✓" : "Votar"}
              </button>
            )}

            <div className="flex items-center gap-3 text-right">
              <div>
                <h4 className="font-chakra text-sm sm:text-base font-black text-white">
                  {match.team_b?.name || "TBD"}
                </h4>
                <span className="font-chakra text-xs text-[#a89f91]">
                  {match.community_votes.team_b_percentage}% de preferencia
                </span>
              </div>
              {match.team_b?.logo ? (
                <picture>
                  <img
                    src={match.team_b.logo}
                    alt={match.team_b.name}
                    className="h-10 w-10 object-contain"
                  />
                </picture>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center bg-black/40 text-[#f0d38f] font-bold">
                  {match.team_b?.tag || "B"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Community Percentage Comparison Bar */}
        <div className="mt-4">
          <div className="flex justify-between font-chakra text-[11px] font-bold uppercase text-[#9e968a] mb-1">
            <span className="text-[#6cc4ff]">
              {match.community_votes.team_a_percentage}% {match.team_a?.tag}
            </span>
            <span className="text-[#7e766c]">Tendencia de la Comunidad</span>
            <span className="text-[#f0d38f]">
              {match.community_votes.team_b_percentage}% {match.team_b?.tag}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden bg-[#1f1a14] rounded-full flex">
            <div
              className="h-full bg-linear-to-r from-[#00c8f8] to-[#2e9df0] transition-all duration-500"
              style={{ width: `${match.community_votes.team_a_percentage}%` }}
            />
            <div
              className="h-full bg-linear-to-l from-[#ffd700] to-[#f0d38f] transition-all duration-500"
              style={{ width: `${match.community_votes.team_b_percentage}%` }}
            />
          </div>
        </div>

        {/* User Prediction Status Notice */}
        {userVote && (
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-[#1f1a14] font-chakra text-xs">
            <div className="flex items-center gap-2 text-[#e0deda]">
              <IconCheck size={14} className="text-emerald-400" />
              <span>
                Tu predicción actual:{" "}
                <strong className="text-white">{userVote.predicted_winner_name}</strong>
              </span>
            </div>
            {userVote.is_correct === true && (
              <span className="text-emerald-400 font-bold">+10 PUNTOS GANADOS</span>
            )}
            {userVote.is_correct === false && (
              <span className="text-zinc-500">0 puntos (Falló)</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="relative min-h-[calc(100dvh-5rem)] w-full overflow-hidden bg-[#0a0806] pt-24 pb-20 text-white select-none">
      {/* Roman Radial Glow Backgrounds */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(216,180,103,0.12)_0%,rgba(10,8,6,0.95)_60%,rgba(10,8,6,1)_100%)]" />
      <div className="pointer-events-none absolute top-40 -left-40 h-96 w-96 rounded-full bg-[#2e9df0]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-80 -right-40 h-96 w-96 rounded-full bg-[#d8b467]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= HERO SECTION ================= */}
        <section className="text-center">
          {/* Imperial Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 border border-[#f0d38f]/60 bg-[#241a10]/90 px-4 py-1.5 shadow-[0_0_20px_rgba(240,211,143,0.3)] backdrop-blur-md"
            style={{ clipPath: "polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%)" }}
          >
            <IconFlame size={16} className="text-[#f0d38f] animate-pulse" />
            <span className="font-chakra text-xs font-black uppercase tracking-[0.25em] text-[#f0d38f]">
              GRAN DINÁMICA DE PLAYOFFS · EL GRAN COLISEO II
            </span>
            <IconFlame size={16} className="text-[#f0d38f] animate-pulse" />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 font-cinzel text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]"
          >
            EL ORÁCULO DE LOS <span className="text-transparent bg-clip-text bg-linear-to-r from-[#f0d38f] via-[#ffd700] to-[#e5a93c]">PLAYOFFS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-3 max-w-2xl font-chakra text-sm sm:text-base text-[#bfb7aa] leading-relaxed"
          >
            Demuestra tu sabiduría en la Arena. Vota con tu cuenta de Steam, acierta las partidas y participa en el sorteo en vivo en el stream oficial de <strong className="text-white">Benjaz</strong>.
          </motion.p>

          {/* Prize Pool Highlights (S/ 50 Soles) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            {/* Prize Card: Match por Match */}
            <div className="relative group border border-[#2e9df0]/40 bg-[#0d141a]/85 p-6 backdrop-blur-md shadow-2xl transition-all hover:border-[#00c8f8] hover:shadow-[0_0_30px_rgba(46,157,240,0.25)] text-left">
              <div className="absolute top-0 right-0 bg-linear-to-l from-[#00c8f8]/20 to-transparent p-3 text-right">
                <span className="font-chakra text-2xl sm:text-3xl font-black text-[#6cc4ff]">S/ 50</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#2e9df0]/60 bg-[#122230] text-[#6cc4ff]">
                  <IconSwords size={22} />
                </div>
                <div>
                  <span className="font-chakra text-[10px] font-bold uppercase tracking-widest text-[#8ea3b8]">DINÁMICA OFICIAL</span>
                  <h3 className="font-cinzel text-lg font-bold text-white">Match por Match</h3>
                </div>
              </div>
              <p className="mt-3 font-chakra text-xs text-[#9eb2c5] leading-relaxed">
                Vota en cada serie programada. Cada victoria acertada te suma <strong className="text-zinc-200">+10 puntos</strong> (¡no pierdes puntos si fallas!). Los <strong className="text-[#6cc4ff]">Top 10</strong> con más puntos entrarán al sorteo por los <strong className="text-[#6cc4ff]">50 Soles</strong>.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] font-chakra text-[#6cc4ff]">
                <IconChartBar size={13} />
                <span>Votación abierta match a match</span>
              </div>
            </div>
          </motion.div>

          {/* Minimum Participation Threshold Warning / Incentive */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 max-w-4xl mx-auto border border-[#d8b467]/40 bg-[#1a140d]/95 px-4 py-3.5 sm:px-6 sm:py-4 backdrop-blur-md text-left flex items-center gap-3.5 shadow-xl"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#ffd700]/15 border border-[#ffd700]/40 text-[#ffd700]">
              <IconFlame size={22} className="animate-pulse" />
            </div>
            <div className="font-chakra text-xs sm:text-[13px] leading-relaxed text-[#d4cdc4]">
              <span className="font-black text-[#f0d38f] uppercase tracking-wide">
                Condición de Activación de Premios:
              </span>{" "}
              Se requiere una participación de <strong className="text-white font-black underline decoration-[#ffd700]">más de 20 personas registradas</strong> para que las predicciones sean válidas y el sorteo oficial de S/ 50 se ejecute en vivo. ¡Invita a la comunidad a participar!
            </div>
          </motion.div>

          {/* User Auth Status Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-6 max-w-4xl mx-auto"
          >
            {!loadingUser && !user ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#e5a93c]/50 bg-[#1a140d]/90 p-4 sm:p-5 backdrop-blur-md">
                <div className="flex items-center gap-3 text-left">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0d38f]/20 text-[#f0d38f]">
                    <IconAlertCircle size={22} />
                  </div>
                  <div>
                    <h4 className="font-chakra text-xs sm:text-sm font-bold uppercase tracking-wider text-[#f0d38f]">
                      Inicia sesión para participar
                    </h4>
                    <p className="font-chakra text-xs text-[#a89f91]">
                      Tu cuenta de Steam es requerida para vincular tus predicciones y validar tu participación en los sorteos.
                    </p>
                  </div>
                </div>
                <Link
                  href="/auth/login?next=/predictions"
                  className="shrink-0 flex items-center gap-2 border border-[#2e9df0] bg-linear-to-r from-[#171a21] to-[#2a475e] px-5 py-2.5 font-chakra text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_15px_rgba(46,157,240,0.4)] hover:brightness-110 cursor-pointer"
                  style={{ clipPath: "polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%)" }}
                >
                  <IconBrandSteam size={18} className="text-[#66c0f4]" />
                  <span>Acceder con Steam</span>
                </Link>
              </div>
            ) : user ? (
              <div className="flex flex-wrap items-center justify-between gap-4 border border-[#2d261e] bg-[#120f0a]/90 p-4 sm:p-5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  {user.profile?.avatar ? (
                    <picture>
                      <img
                        src={user.profile.avatar}
                        alt={user.player_profile?.nickname || user.username}
                        className="h-10 w-10 rounded-full border border-[#f0d38f]/60 object-cover"
                      />
                    </picture>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#241e17] border border-[#d8b467]/40 text-[#d8b467]">
                      <IconBrandSteam size={18} />
                    </div>
                  )}
                  <div className="text-left">
                    <span className="font-chakra text-[10px] font-bold uppercase tracking-wider text-[#9e968a]">
                      Gladiador Conectado
                    </span>
                    <h4 className="font-chakra text-sm font-black text-white">
                      {user.player_profile?.nickname || user.first_name || user.username}
                    </h4>
                  </div>
                </div>

                {/* User Stats Pill */}
                <div className="flex items-center gap-4 sm:gap-6 text-left">
                  <div className="border-l border-[#2d261e] pl-4">
                    <span className="block font-chakra text-[10px] uppercase tracking-wider text-[#9e968a]">
                      Tus Puntos
                    </span>
                    <span className="font-chakra text-base font-black text-[#f0d38f]">
                      {hubData?.user_stats?.total_points ?? 0} pts
                    </span>
                  </div>
                  <div className="border-l border-[#2d261e] pl-4">
                    <span className="block font-chakra text-[10px] uppercase tracking-wider text-[#9e968a]">
                      Aciertos
                    </span>
                    <span className="font-chakra text-base font-black text-white">
                      {hubData?.user_stats?.correct_predictions ?? 0} / {hubData?.user_stats?.total_predictions ?? 0}
                    </span>
                  </div>
                  <div className="border-l border-[#2d261e] pl-4">
                    <span className="block font-chakra text-[10px] uppercase tracking-wider text-[#9e968a]">
                      Estado
                    </span>
                    <span className="font-chakra text-base font-black text-[#6cc4ff]">
                      {hubData?.user_stats?.total_predictions ? "En Carrera" : "Registrado"}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </section>

        {/* Global Notifications Alert */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 max-w-4xl mx-auto flex items-center justify-between gap-3 border border-red-500/50 bg-red-950/80 p-4 text-red-200"
            >
              <div className="flex items-center gap-2">
                <IconAlertCircle size={18} className="text-red-400 shrink-0" />
                <span className="font-chakra text-xs sm:text-sm font-semibold">{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-red-400 hover:text-white text-xs font-chakra uppercase font-bold"
              >
                Cerrar
              </button>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 max-w-4xl mx-auto flex items-center justify-between gap-3 border border-emerald-500/50 bg-emerald-950/80 p-4 text-emerald-200"
            >
              <div className="flex items-center gap-2">
                <IconCheck size={18} className="text-emerald-400 shrink-0" />
                <span className="font-chakra text-xs sm:text-sm font-semibold">{successMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                className="text-emerald-400 hover:text-white text-xs font-chakra uppercase font-bold"
              >
                Cerrar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Spinner */}
        {loading && (
          <div className="mt-16 flex flex-col items-center justify-center gap-3">
            <Loader color="#d8b467" size="lg" />
            <span className="font-chakra text-xs uppercase tracking-widest text-[#a8a197]">
              Consultando el Oráculo del Coliseo...
            </span>
          </div>
        )}

        {!loading && (
          <>
            {/* ================= SECCIÓN: ARENA DE PREDICCIONES MATCH POR MATCH ================= */}
            <section className="mt-12 sm:mt-16">
              <div className="flex items-center justify-between border-b border-[#2d261e] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#2e9df0]/15 border border-[#2e9df0]/40 text-[#6cc4ff]">
                    <IconSwords size={20} />
                  </div>
                  <div>
                    <h2 className="font-cinzel text-xl sm:text-2xl font-black text-white">
                      ARENA DE PREDICCIONES MATCH POR MATCH
                    </h2>
                    <span className="font-chakra text-xs text-[#a89f91]">
                      Sorteo de S/ 50 Soles entre el Top 10 · Suma +10 pts por victoria acertada
                    </span>
                  </div>
                </div>
              </div>

              {/* Matches List */}
              <div className="mt-8 space-y-6">
                {/* Partidas Abiertas */}
                {openMatches.length === 0 ? (
                  <div className="border border-[#2d261e] bg-[#120f0a] p-6 sm:p-8 text-center shadow-lg">
                    <IconSwords size={32} className="mx-auto text-[#7e766c]" />
                    <h4 className="mt-2 font-chakra text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                      No hay partidas abiertas para votar en este momento
                    </h4>
                    <p className="mt-1 font-chakra text-xs text-[#a89f91] max-w-md mx-auto">
                      Las próximas series programadas de Playoffs se habilitarán automáticamente a medida que avance el torneo.
                    </p>
                  </div>
                ) : (
                  openMatches.map((match) => renderMatchCard(match))
                )}

                {/* Acordeón de Partidas Finalizadas */}
                {completedMatches.length > 0 && (
                  <div className="mt-10 border border-[#2d261e] bg-[#120f0a]/90 overflow-hidden shadow-xl">
                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowCompletedMatches((prev) => !prev)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-[#16120d] hover:bg-[#1d1711] transition-colors border-b border-transparent data-[open=true]:border-[#2d261e] text-left cursor-pointer group"
                      data-open={showCompletedMatches}
                      aria-expanded={showCompletedMatches}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#d8b467]/10 border border-[#d8b467]/30 text-[#f0d38f]">
                          <IconHistory size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-chakra text-sm sm:text-base font-bold text-white uppercase tracking-wide">
                              Partidas Finalizadas
                            </span>
                            <span className="rounded-full bg-[#2d261e] px-2 py-0.2 text-[11px] font-chakra font-bold text-[#c7bcab]">
                              {completedMatches.length}
                            </span>
                          </div>
                          <span className="font-chakra text-xs text-[#8e857b]">
                            Historial de series y resultados ya cerrados
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-chakra font-bold text-[#f0d38f] group-hover:text-white transition-colors">
                        <span className="hidden sm:inline">
                          {showCompletedMatches ? "Ocultar partidas" : "Ver partidas finalizadas"}
                        </span>
                        <IconChevronDown
                          size={18}
                          className={`transition-transform duration-300 ${
                            showCompletedMatches ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Collapsible Content */}
                    <AnimatePresence>
                      {showCompletedMatches && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-[#0e0b08]/80 border-t border-[#2d261e]">
                            {completedMatches.map((match) => renderMatchCard(match))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </section>

            {/* ================= SECCIÓN 3: TABLA DE HONOR (LEADERBOARD) ================= */}
            <section className="mt-16 sm:mt-24">
              <div className="flex items-center justify-between border-b border-[#2d261e] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#ffd700]/15 border border-[#ffd700]/40 text-[#ffd700]">
                    <IconCrown size={20} />
                  </div>
                  <div>
                    <h2 className="font-cinzel text-xl sm:text-2xl font-black text-white">
                      3. TABLA DE HONOR · TOP 10 PREDICTORES
                    </h2>
                    <span className="font-chakra text-xs text-[#a89f91]">
                      Los 10 mejores gladiadores clasificarán al sorteo en vivo de los S/ 50 Soles
                    </span>
                  </div>
                </div>
              </div>

              {/* Leaderboard Hidden Placeholder */}
              <div className="mt-6 border border-[#d8b467]/30 bg-radial-[at_top] from-[#1a140c] via-[#120f0a] to-[#0a0806] p-8 sm:p-12 text-center backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-[#ffd700]/10 blur-3xl" />

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#f0d38f]/60 bg-[#291e12] text-[#f0d38f] shadow-[0_0_25px_rgba(240,211,143,0.3)]">
                  <IconCrown size={32} className="text-[#ffd700]" />
                </div>

                <h3 className="mt-5 font-cinzel text-lg sm:text-xl font-black uppercase text-white tracking-wide">
                  Clasificación Oficial en Reserva
                </h3>

                <p className="mx-auto mt-2 max-w-xl font-chakra text-xs sm:text-sm text-[#b8afa2] leading-relaxed">
                  La tabla oficial y las posiciones del <strong className="text-[#f0d38f]">Top 10</strong> se revelarán públicamente durante el desarrollo de los <strong className="text-white">Playoffs</strong> una vez superada la meta de participación.
                </p>

                <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 border border-[#d8b467]/30 bg-[#16120c]/90 px-5 py-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-chakra font-bold text-[#ffd700]">
                    <IconFlame size={14} />
                    <span>Meta: Más de 20 Participantes</span>
                  </div>
                  <span className="text-[#5e564c] hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5 text-xs font-chakra text-[#a8a197]">
                    <IconSwords size={14} className="text-[#6cc4ff]" />
                    <span>+10 pts por victoria acertada</span>
                  </div>
                </div>

                {user && (
                  <div className="mt-6 border-t border-[#241e17] pt-5 max-w-md mx-auto">
                    <span className="font-chakra text-[11px] uppercase tracking-wider text-[#8e857b] block mb-2">
                      Tu Registro Privado de Puntos
                    </span>
                    <div className="flex items-center justify-center gap-6 font-chakra">
                      <div>
                        <span className="text-xs text-[#a89f91]">Puntos Acumulados: </span>
                        <strong className="text-[#f0d38f] text-sm font-black">{hubData?.user_stats?.total_points ?? 0} pts</strong>
                      </div>
                      <div className="h-3 w-px bg-[#2d261e]" />
                      <div>
                        <span className="text-xs text-[#a89f91]">Partidas Votadas: </span>
                        <strong className="text-white text-sm font-black">{hubData?.user_stats?.total_predictions ?? 0}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ================= SECCIÓN 4: REGLAS Y TRANSPARENCIA ================= */}
            <section className="mt-16 sm:mt-24 border border-[#2d261e] bg-[#110e0a]/95 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-[#f0d38f] pb-3 border-b border-[#241e17]">
                <IconInfoCircle size={20} />
                <h3 className="font-cinzel text-lg font-black uppercase tracking-wider text-white">
                  REGLAS OFICIALES Y CONDICIONES DEL SORTEO
                </h3>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 font-chakra text-xs text-[#a89f91] leading-relaxed">
                {/* 20+ Participants Core Rule */}
                <div className="md:col-span-2 border border-[#ffd700]/50 bg-linear-to-r from-[#291e12] via-[#20170d] to-[#291e12] p-5 sm:p-6 shadow-[0_0_20px_rgba(240,211,143,0.15)]">
                  <h4 className="font-bold uppercase text-[#ffd700] flex items-center gap-2 mb-2 font-chakra text-sm sm:text-base">
                    <IconFlame size={20} className="text-[#ffd700] animate-pulse" />
                    ★ REGLA DE PREMIOS: MÁS DE 20 PARTICIPANTES REQUERIDOS
                  </h4>
                  <p className="text-[#e2dbcf] text-xs sm:text-sm font-chakra font-medium leading-relaxed">
                    Para que las predicciones sean contabilizadas y el sorteo oficial en vivo de <strong className="text-[#6cc4ff]">S/ 50 Soles (Top 10 Match por Match)</strong> se ejecute, debe haber <strong className="text-white font-bold underline decoration-[#ffd700]">más de 20 participantes registrados</strong> en la plataforma. Si no se alcanza este umbral mínimo de participación comunitaria, el sorteo quedará desierto o se reprogramará para una siguiente fase del torneo. ¡Invita a la comunidad de Benjaz a registrarse y participar!
                  </p>
                </div>

                <div>
                  <h4 className="font-bold uppercase text-white flex items-center gap-2 mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f0d38f]" />
                    ¿Quiénes pueden participar?
                  </h4>
                  <p>
                    Cualquier usuario con una cuenta válida de Steam. No se permite el uso de múltiples cuentas; el sistema valida la identidad a través de Valve Corporation.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold uppercase text-white flex items-center gap-2 mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2e9df0]" />
                    Dinámica Match por Match (S/ 50 Soles)
                  </h4>
                  <p>
                    Cada serie acertada otorga +10 puntos. No hay penalización por series falladas. Al concluir la Gran Final, los 10 mejores de la tabla entrarán a la ruleta del sorteo por los 50 Soles.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold uppercase text-white flex items-center gap-2 mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Entrega de Premios en Vivo
                  </h4>
                  <p>
                    Los sorteos se realizarán en vivo durante la transmisión oficial en Kick (<strong className="text-zinc-200">kick.com/benjaz</strong>). Los pagos se coordinarán directamente por Yape, Plin o transferencia bancaria.
                  </p>
                </div>
              </div>
            </section>

            {/* ================= SECCIÓN 5: APOYAR POZO DE PREMIOS ================= */}
            <section className="mt-8 sm:mt-10 border border-[#ffd700]/30 bg-linear-to-r from-[#1c150c] via-[#14100b] to-[#1c150c] p-6 sm:p-8 text-center shadow-[0_0_25px_rgba(240,211,143,0.1)] relative overflow-hidden">
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ffd700]/40 bg-[#ffd700]/10 text-[#ffd700] text-xs font-chakra font-bold uppercase tracking-wider">
                  <IconSparkles size={14} />
                  <span>Comunidad & Patrocinios</span>
                </div>
                <h3 className="font-cinzel text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                  ¿Quieres apoyar a aumentar el premio?
                </h3>
                <p className="font-chakra text-xs sm:text-sm text-[#c7bcab] leading-relaxed">
                  Si eres seguidor, creador de contenido, comunidad o patrocinador y deseas sumar tu aporte para incrementar el pozo oficial de los sorteos en vivo para los participantes, ¡escríbenos directamente y coordinamos!
                </p>
                <div className="pt-2">
                  <a
                    href="mailto:hebertdev@outlook.com?subject=Apoyo%20Pozo%20de%20Premios%20-%20El%20Coliseo%20de%20Benjaz"
                    className="inline-flex items-center gap-2 border border-[#ffd700] bg-linear-to-r from-[#ffd700] via-[#f0d38f] to-[#e5a93c] px-6 py-3 font-chakra text-xs font-black uppercase tracking-widest text-[#14100c] shadow-[0_0_20px_rgba(240,211,143,0.5)] hover:brightness-115 transition-all cursor-pointer"
                    style={{ clipPath: "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)" }}
                  >
                    <IconMail size={16} className="shrink-0" />
                    <span>Escríbenos a hebertdev@outlook.com</span>
                  </a>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
