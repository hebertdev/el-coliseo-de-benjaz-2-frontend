"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  IconX,
  IconTrophy,
  IconSparkles,
  IconSwords,
  IconArrowRight,
  IconFlame,
  IconShieldCheck,
  IconBrandKick,
  IconBrandTwitch,
  IconBrandYoutube,
  IconBrandInstagram,
  IconBrandX,
  IconBrandSteam,
  IconChevronDown,
  IconArrowUpRight,
} from "@tabler/icons-react";


import type { PlayerOfTheDayResponse, DayPlayer } from "interfaces/playerOfTheDay";
import { getPlayerOfTheDayAPI } from "services/playerOfTheDay";
import { CountryFlag } from "components/ui/CountryFlag";

interface PlayerOfTheDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentSlug?: string;
  initialData?: PlayerOfTheDayResponse | null;
}

const emptySubscribe = () => () => {};

export function PlayerOfTheDayModal({
  isOpen,
  onClose,
  tournamentSlug = "el-gran-coliseo-ii",
  initialData = null,
}: PlayerOfTheDayModalProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [data, setData] = useState<PlayerOfTheDayResponse | null>(initialData);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [selectedRank, setSelectedRank] = useState<number>(1);
  const [selectedJornadaId, setSelectedJornadaId] = useState<string | undefined>(undefined);

  // Fetch data on open or jornada change
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    async function loadData() {
      try {
        const res = await getPlayerOfTheDayAPI(tournamentSlug, selectedJornadaId);
        if (!isCancelled && res) {
          setData(res);
          if (res.top_3_players && res.top_3_players.length > 0) {
            setSelectedRank((prev) => {
              const exists = res.top_3_players.some((p) => p.rank === prev);
              return exists ? prev : 1;
            });
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, tournamentSlug, selectedJornadaId]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const activePlayer: DayPlayer | null =
    data?.top_3_players?.find((p) => p.rank === selectedRank) ||
    data?.player_of_the_day ||
    null;

  const availableJornadas = data?.available_jornadas || [];
  const currentJornada = data?.jornada;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="relative z-10 w-full max-w-3xl max-h-[80vh] flex flex-col border border-[#d8b467]/40 bg-[#120f0a] shadow-[0_0_60px_rgba(216,180,103,0.18)] my-auto"
          >
            {/* Imperial Corner Accents */}
            <span className="pointer-events-none absolute -top-1.5 -left-1.5 z-20 h-3.5 w-3.5 rotate-45 border border-[#f0d38f] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />
            <span className="pointer-events-none absolute -top-1.5 -right-1.5 z-20 h-3.5 w-3.5 rotate-45 border border-[#f0d38f] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />
            <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 z-20 h-3.5 w-3.5 rotate-45 border border-[#f0d38f] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />
            <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 z-20 h-3.5 w-3.5 rotate-45 border border-[#f0d38f] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />

            {/* Subtle Inner Gold Line */}
            <span className="pointer-events-none absolute inset-1.5 border border-[#d8b467]/20" />

            {/* Matrix Texture Background */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1f1913_1px,transparent_1px),linear-gradient(to_bottom,#1f1913_1px,transparent_1px)] bg-size-[32px_32px] opacity-30" />

            {/* Ambient Gold Header Glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-44 w-80 rounded-full bg-[#d8b467]/15 blur-3xl" />

            {/* CLEAN COMPACT HEADER */}
            <div className="relative z-10 shrink-0 border-b border-[#2d261e] px-4 py-3 sm:px-6 sm:py-3.5 bg-[#16120c]/90 flex items-center justify-between gap-3">
              {/* Title & Badge */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xs border border-[#d8b467] bg-linear-to-b from-[#2a1e12] to-[#16110a] text-[#f0d38f] shadow-[0_0_15px_rgba(216,180,103,0.3)] shrink-0">
                  <IconTrophy size={20} stroke={2} className="text-[#f0d38f]" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-chakra text-base sm:text-xl font-black uppercase tracking-wide text-white leading-tight">
                      Jugador del Día
                    </h2>
                    {currentJornada && (
                      <span className="inline-flex items-center gap-1 rounded-[2px] border border-[#d8b467]/40 bg-[#d8b467]/15 px-2 py-0.5 text-[10px] font-chakra font-bold uppercase tracking-wider text-[#f0d38f]">
                        <IconSwords size={11} />
                        {currentJornada.title}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#8a7b6b] font-chakra uppercase tracking-wider">
                    {data?.tournament.name || "El Gran Coliseo"} · Top 3 por impacto &amp; MVPs
                  </p>
                </div>
              </div>

              {/* Right Controls: Jornada Dropdown + Close Button */}
              <div className="flex items-center gap-2">
                {availableJornadas.length > 1 && (
                  <div className="relative">
                    <select
                      value={selectedJornadaId || currentJornada?.id || ""}
                      onChange={(e) => setSelectedJornadaId(e.target.value)}
                      aria-label="Seleccionar jornada"
                      className="appearance-none bg-[#1a140d] border border-[#3d3326] text-[#f0d38f] text-[11px] font-chakra font-bold uppercase tracking-wider pl-2.5 pr-6 py-1.5 rounded-xs focus:outline-none focus:border-[#d8b467] cursor-pointer"
                    >
                      {availableJornadas.map((j) => (
                        <option key={j.id} value={j.id} className="bg-[#16120c] text-white">
                          {j.title} {j.is_completed ? "✓" : "(en juego)"}
                        </option>
                      ))}
                    </select>
                    <IconChevronDown
                      size={12}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#d8b467]"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar modal"
                  className="flex h-8 w-8 items-center justify-center rounded-xs border border-[#3d3326] bg-[#1a1510] text-[#a89c89] transition-all hover:border-[#d8b467] hover:bg-[#d8b467] hover:text-black shrink-0 cursor-pointer"
                >
                  <IconX size={16} stroke={2.2} />
                </button>
              </div>
            </div>

            {/* MODAL BODY */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-5 bg-[#0f0c08]/95 scrollbar-thin scrollbar-thumb-[#3d3326]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d8b467] border-t-transparent mb-2.5" />
                  <p className="font-chakra text-xs uppercase tracking-wider text-[#d8b467]">
                    Cargando estadísticas del día...
                  </p>
                </div>
              ) : !activePlayer ? (
                <div className="py-10 text-center text-[#9c8e7d]">
                  <IconSwords size={36} className="mx-auto mb-2 opacity-40 text-[#d8b467]" />
                  <p className="font-chakra text-sm uppercase text-white">
                    No hay estadísticas disponibles para esta jornada.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* MAIN SHOWCASE CARD */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border border-[#2d261e] bg-[#16120d]/80 p-4 sm:p-5 rounded-xs relative">
                    {/* Left Column: Avatar, Identity, Socials & Profile Button */}
                    <div className="md:col-span-4 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-[#2d261e] pb-4 md:pb-0 md:pr-4">
                      {/* Avatar */}
                      <div className="relative group">
                        <div
                          className={`relative h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-xs border-2 shadow-lg ${
                            activePlayer.rank === 1
                              ? "border-[#f0d38f] shadow-[0_0_20px_rgba(240,211,143,0.3)]"
                              : activePlayer.rank === 2
                              ? "border-[#dcdfe3] shadow-[0_0_15px_rgba(220,223,227,0.2)]"
                              : "border-[#e09867] shadow-[0_0_15px_rgba(224,152,103,0.2)]"
                          }`}
                        >
                          {activePlayer.avatar ? (
                            <picture>
                              <img
                                src={activePlayer.avatar}
                                alt={activePlayer.nickname}
                                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                              />
                            </picture>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#1c1610] text-[#8a7b6b] font-chakra text-xl font-bold uppercase">
                              {activePlayer.nickname.slice(0, 2)}
                            </div>
                          )}
                        </div>

                        {/* Rank Badge */}
                        <div
                          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center h-5 px-2.5 rounded-xs font-chakra text-[10px] font-black uppercase tracking-wider text-black border ${
                            activePlayer.rank === 1
                              ? "bg-[#f0d38f] border-[#f0d38f] shadow-[0_0_8px_rgba(240,211,143,0.7)]"
                              : activePlayer.rank === 2
                              ? "bg-[#dcdfe3] border-[#dcdfe3]"
                              : "bg-[#e09867] border-[#e09867]"
                          }`}
                        >
                          {activePlayer.rank === 1 ? "MVP #1" : `TOP #${activePlayer.rank}`}
                        </div>
                      </div>

                      {/* Nickname & Country */}
                      <div className="mt-3.5 flex items-center justify-center gap-1.5">
                        <h3 className="font-chakra text-lg sm:text-xl font-black uppercase text-white tracking-wide">
                          {activePlayer.nickname}
                        </h3>
                        {activePlayer.country && (
                          <CountryFlag countryCode={activePlayer.country} size="xs" />
                        )}
                      </div>

                      {/* Role & Dota Medal */}
                      <div className="mt-1 flex flex-wrap items-center justify-center gap-1">
                        {activePlayer.position_name && (
                          <span className="rounded-[2px] border border-[#d8b467]/30 bg-[#d8b467]/10 px-1.5 py-0.5 font-chakra text-[10px] font-bold uppercase text-[#f0d38f]">
                            {activePlayer.position_name}
                          </span>
                        )}
                        {activePlayer.medal?.medal_title && activePlayer.medal.medal_title !== "Unranked" && (
                          <span className="rounded-[2px] border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 font-chakra text-[10px] font-bold uppercase text-cyan-300">
                            {activePlayer.medal.medal_title}
                          </span>
                        )}
                      </div>

                      {/* Team Info */}
                      {activePlayer.team?.name && (
                        <div className="mt-2 flex items-center gap-1.5 border border-[#2d261e] bg-[#120e0a] px-2 py-1 rounded-xs w-full justify-center">
                          {activePlayer.team.logo_url && (
                            <picture>
                              <img
                                src={activePlayer.team.logo_url}
                                alt={activePlayer.team.name}
                                className="h-4 w-4 object-contain"
                              />
                            </picture>
                          )}
                          <span className="text-[11px] font-chakra font-semibold text-[#d4cdc4] truncate max-w-[150px]">
                            {activePlayer.team.name}
                          </span>
                        </div>
                      )}

                      {/* SOCIAL NETWORKS BAR (STREAM & REDES SOCIALES) */}
                      <div className="mt-3 w-full border-t border-[#2d261e]/60 pt-2.5">
                        <div className="text-[9px] font-chakra font-bold uppercase tracking-wider text-[#8a7b6b] mb-1.5">
                          Canales &amp; Redes
                        </div>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Kick */}
                          {activePlayer.social_links?.kick && (
                            <a
                              href={activePlayer.social_links.kick}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Ver stream en Kick"
                              className="flex h-7 w-7 items-center justify-center rounded-xs border border-[#2e4024] bg-[#142010] text-[#53fc18] transition-all hover:scale-110 hover:border-[#53fc18] hover:shadow-[0_0_10px_rgba(83,252,24,0.4)]"
                            >
                              <IconBrandKick size={14} />
                            </a>
                          )}

                          {/* Twitch */}
                          {activePlayer.social_links?.twitch && (
                            <a
                              href={activePlayer.social_links.twitch}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Ver canal de Twitch"
                              className="flex h-7 w-7 items-center justify-center rounded-xs border border-[#3b2752] bg-[#1a1124] text-[#a970ff] transition-all hover:scale-110 hover:border-[#a970ff] hover:shadow-[0_0_10px_rgba(169,112,255,0.4)]"
                            >
                              <IconBrandTwitch size={14} />
                            </a>
                          )}

                          {/* YouTube */}
                          {activePlayer.social_links?.youtube && (
                            <a
                              href={activePlayer.social_links.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Canal de YouTube"
                              className="flex h-7 w-7 items-center justify-center rounded-xs border border-[#4a1f1f] bg-[#210c0c] text-[#ff4e4e] transition-all hover:scale-110 hover:border-[#ff4e4e] hover:shadow-[0_0_10px_rgba(255,78,78,0.4)]"
                            >
                              <IconBrandYoutube size={14} />
                            </a>
                          )}

                          {/* Instagram */}
                          {activePlayer.social_links?.instagram && (
                            <a
                              href={activePlayer.social_links.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Instagram"
                              className="flex h-7 w-7 items-center justify-center rounded-xs border border-[#47223b] bg-[#210e1a] text-[#f265b5] transition-all hover:scale-110 hover:border-[#f265b5] hover:shadow-[0_0_10px_rgba(242,101,181,0.4)]"
                            >
                              <IconBrandInstagram size={14} />
                            </a>
                          )}

                          {/* Twitter / X */}
                          {activePlayer.social_links?.twitter && (
                            <a
                              href={activePlayer.social_links.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Twitter / X"
                              className="flex h-7 w-7 items-center justify-center rounded-xs border border-[#3a3f45] bg-[#14171a] text-white transition-all hover:scale-110 hover:border-white hover:shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                            >
                              <IconBrandX size={13} />
                            </a>
                          )}

                          {/* Steam */}
                          {(activePlayer.social_links?.steam || activePlayer.steam_id) && (
                            <a
                              href={
                                activePlayer.social_links?.steam ||
                                `https://steamcommunity.com/profiles/${activePlayer.steam_id}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Perfil de Steam"
                              className="flex h-7 w-7 items-center justify-center rounded-xs border border-[#2b3d4f] bg-[#101822] text-[#66c0f4] transition-all hover:scale-110 hover:border-[#66c0f4] hover:shadow-[0_0_10px_rgba(102,192,244,0.4)]"
                            >
                              <IconBrandSteam size={14} />
                            </a>
                          )}

                          {/* Dotabuff */}
                          {activePlayer.social_links?.dotabuff && (
                            <a
                              href={activePlayer.social_links.dotabuff}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Perfil en Dotabuff"
                              className="flex h-7 w-7 items-center justify-center rounded-xs border border-[#4a2618] bg-[#241109] text-[#ed3b1d] transition-all hover:scale-110 hover:border-[#ed3b1d] hover:shadow-[0_0_10px_rgba(237,59,29,0.4)] font-mono text-[10px] font-black"
                            >
                              D
                            </a>
                          )}

                          {/* Fallback if no socials set */}
                          {!activePlayer.social_links?.kick &&
                            !activePlayer.social_links?.twitch &&
                            !activePlayer.social_links?.youtube &&
                            !activePlayer.social_links?.instagram &&
                            !activePlayer.social_links?.twitter &&
                            !activePlayer.social_links?.steam && (
                              <span className="text-[10px] text-[#6e6153] italic">
                                Sin redes vinculadas
                              </span>
                            )}
                        </div>
                      </div>

                      {/* View Profile Link */}
                      <Link
                        href={`/players/${activePlayer.player_slug}`}
                        onClick={onClose}
                        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 border border-[#382e22] bg-[#1c160f] px-3 py-1.5 text-[11px] font-chakra font-bold uppercase tracking-wider text-[#d8b467] transition-all hover:border-[#d8b467] hover:bg-[#d8b467] hover:text-black cursor-pointer"
                      >
                        <span>Ver Perfil</span>
                        <IconArrowRight size={13} />
                      </Link>
                    </div>

                    {/* Right Column: Key Metrics, 4 Stats & Heroes */}
                    <div className="md:col-span-8 flex flex-col justify-between">
                      <div>
                        {/* Top Highlights Bar */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          {activePlayer.mvp_count > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-xs border border-[#f0d38f] bg-[#f0d38f]/20 px-2 py-0.5 text-[11px] font-chakra font-black uppercase text-[#f0d38f]">
                              <IconFlame size={13} className="text-amber-400" />
                              {activePlayer.mvp_count} MVP{activePlayer.mvp_count > 1 ? "s" : ""}
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1 rounded-xs border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-chakra font-bold uppercase text-emerald-400">
                            <IconShieldCheck size={13} />
                            {activePlayer.stats.wins}V - {activePlayer.stats.losses}D ({activePlayer.stats.win_rate}%)
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-xs border border-[#3d3326] bg-[#1a140d] px-2 py-0.5 text-[11px] font-chakra font-bold text-[#c7bcab] ml-auto">
                            <IconSparkles size={12} className="text-[#d8b467]" />
                            Score: <strong className="text-white font-mono">{activePlayer.score}</strong>
                          </span>
                        </div>

                        {/* 4 CORE STATS (CLEAN & PUNCHY) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                          {/* KDA */}
                          <div className="border border-[#2d261e] bg-[#100d09] p-2 rounded-xs">
                            <span className="text-[9px] uppercase tracking-wider text-[#8a7b6b] block">
                              KDA Ratio
                            </span>
                            <span className="font-chakra text-base sm:text-lg font-black text-[#f0d38f]">
                              {activePlayer.stats.kda.toFixed(2)}
                            </span>
                            <span className="text-[9px] text-[#a89c89] block">
                              {activePlayer.stats.kills}/{activePlayer.stats.deaths}/{activePlayer.stats.assists}
                            </span>
                          </div>

                          {/* GPM */}
                          <div className="border border-[#2d261e] bg-[#100d09] p-2 rounded-xs">
                            <span className="text-[9px] uppercase tracking-wider text-[#8a7b6b] block">
                              GPM Promedio
                            </span>
                            <span className="font-chakra text-base sm:text-lg font-black text-amber-300">
                              {activePlayer.stats.avg_gpm.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-[#a89c89] block">
                              Oro / min
                            </span>
                          </div>

                          {/* Daño a Héroes */}
                          <div className="border border-[#2d261e] bg-[#100d09] p-2 rounded-xs">
                            <span className="text-[9px] uppercase tracking-wider text-[#8a7b6b] block">
                              Daño a Héroes
                            </span>
                            <span className="font-chakra text-base sm:text-lg font-black text-rose-400">
                              {activePlayer.stats.avg_hero_damage.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-[#a89c89] block">
                              Promedio
                            </span>
                          </div>

                          {/* Aturdimientos */}
                          <div className="border border-[#2d261e] bg-[#100d09] p-2 rounded-xs">
                            <span className="text-[9px] uppercase tracking-wider text-[#8a7b6b] block">
                              Aturdimientos
                            </span>
                            <span className="font-chakra text-base sm:text-lg font-black text-cyan-300">
                              {activePlayer.stats.avg_stuns_seconds}s
                            </span>
                            <span className="text-[9px] text-[#a89c89] block">
                              Control / seg
                            </span>
                          </div>
                        </div>

                        {/* HEROES PLAYED */}
                        {activePlayer.heroes_played && activePlayer.heroes_played.length > 0 && (
                          <div className="mt-3.5 pt-2.5 border-t border-[#231c15]">
                            <span className="text-[10px] font-chakra uppercase tracking-widest text-[#8a7b6b] block mb-1.5 font-bold">
                              Héroes utilizados en la jornada:
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              {activePlayer.heroes_played.map((h) => (
                                <div
                                  key={h.hero_id}
                                  className="flex items-center gap-2 border border-[#2d261e] bg-[#100d08] p-1.5 pr-2.5 rounded-xs"
                                >
                                  {h.image_url ? (
                                    <picture>
                                      <img
                                        src={h.image_url}
                                        alt={h.hero_name}
                                        className="h-6 w-10 object-cover rounded-[1px] border border-black/60 shrink-0"
                                      />
                                    </picture>
                                  ) : (
                                    <div className="h-6 w-10 bg-[#1a140d] flex items-center justify-center text-[9px] text-[#7d7060]">
                                      Hero
                                    </div>
                                  )}
                                  <div className="text-left">
                                    <div className="text-xs font-chakra font-bold text-white leading-tight">
                                      {h.hero_name}
                                    </div>
                                    <div className="text-[9px] text-[#8a7b6b] leading-tight">
                                      {h.games_played} {h.games_played === 1 ? "partida" : "partidas"} ·{" "}
                                      <span className="text-emerald-400 font-semibold">{h.wins}V</span>
                                    </div>
                                    {h.game_slug && (
                                      <Link
                                        href={`/game/${h.game_slug}`}
                                        onClick={onClose}
                                        className="mt-1 flex items-center gap-0.5 text-[9px] font-chakra font-bold text-[#d8b467] transition-colors hover:text-white"
                                      >
                                        Ver partida
                                        <IconArrowUpRight size={10} stroke={2.5} />
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM PODIUM SWITCHER (THE ONLY TOP 3 SWITCHER) */}
                  {data?.top_3_players && data.top_3_players.length > 1 && (
                    <div className="border border-[#2d261e] bg-[#14100b] p-2.5 sm:p-3 rounded-xs">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-chakra text-[11px] font-black uppercase tracking-wider text-[#d8b467] flex items-center gap-1">
                          <IconTrophy size={13} />
                          Podio de la Jornada (Top 3)
                        </span>
                        <span className="text-[9px] text-[#7d7060]">
                          Haz clic para alternar de jugador
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {data.top_3_players.map((p) => {
                          const isCurrentActive = selectedRank === p.rank;

                          return (
                            <button
                              key={p.rank}
                              type="button"
                              onClick={() => setSelectedRank(p.rank)}
                              className={`flex items-center gap-2 p-2 rounded-xs border text-left transition-all cursor-pointer ${
                                isCurrentActive
                                  ? p.rank === 1
                                    ? "border-[#f0d38f] bg-[#221a11] shadow-[0_0_12px_rgba(240,211,143,0.25)]"
                                    : "border-white/60 bg-[#1c1a17]"
                                  : "border-[#2d261e] bg-[#100d09] hover:border-[#4d3f2e] opacity-75 hover:opacity-100"
                              }`}
                            >
                              {/* Rank medal */}
                              <div
                                className={`flex h-6 w-6 items-center justify-center rounded-xs font-chakra text-[11px] font-black shrink-0 ${
                                  p.rank === 1
                                    ? "bg-[#f0d38f] text-black"
                                    : p.rank === 2
                                    ? "bg-[#dcdfe3] text-black"
                                    : "bg-[#e09867] text-black"
                                }`}
                              >
                                {p.rank}
                              </div>

                              {/* Mini Avatar */}
                              <div className="h-8 w-8 rounded-xs overflow-hidden border border-[#3d3326] bg-[#18130d] shrink-0">
                                {p.avatar ? (
                                  <picture>
                                    <img
                                      src={p.avatar}
                                      alt={p.nickname}
                                      className="h-full w-full object-cover"
                                    />
                                  </picture>
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-[#8a7b6b]">
                                    {p.nickname.slice(0, 2)}
                                  </div>
                                )}
                              </div>

                              {/* Nickname & KDA */}
                              <div className="overflow-hidden flex-1">
                                <div className="text-xs font-chakra font-bold text-white truncate flex items-center gap-1">
                                  {p.nickname}
                                  {p.country && <CountryFlag countryCode={p.country} size="xs" />}
                                </div>
                                <div className="text-[9px] text-[#9c8e7d] truncate">
                                  KDA: <span className="text-[#f0d38f] font-mono">{p.stats.kda.toFixed(1)}</span> ·{" "}
                                  {p.mvp_count > 0 ? `${p.mvp_count} MVP` : `${p.stats.wins}V`}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* MINIMAL FOOTER */}
            <div className="relative z-10 shrink-0 flex items-center justify-between border-t border-[#2d261e] px-4 py-2 sm:px-6 bg-[#14100b] text-[10px] text-[#7d7060]">
              <span>
                Actualización automática al concluir la última partida de cada jornada.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 font-chakra font-bold uppercase tracking-wider border border-[#382e22] text-[#d4cdc4] hover:border-[#d8b467] hover:text-white transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
