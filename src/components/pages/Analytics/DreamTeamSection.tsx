"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconCrown,
  IconShieldCheck,
  IconInfoCircle,
  IconX,
  IconAward,
  IconFlame,
  IconScale,
  IconTrophy,
} from "@tabler/icons-react";
import type { DreamTeam, PositionPlayer } from "interfaces/analytics";
import { CountryFlag } from "components/ui/CountryFlag";
import { getRankMedalUrl, formatSpanishCompact } from "helpers/dota";
import { normalizeMediaUrl } from "lib/config";

interface DreamTeamSectionProps {
  dreamTeam: DreamTeam;
  dreamTeamSecondary?: DreamTeam;
}

const POSITION_ROLES = [
  { key: "carry", label: "Pos 1 · Carry", roleName: "Carry", icon: "⚔️" },
  { key: "mid", label: "Pos 2 · Mid", roleName: "Mid", icon: "👑" },
  { key: "offlane", label: "Pos 3 · Offlane", roleName: "Offlane", icon: "🛡️" },
  { key: "soft_support", label: "Pos 4 · Soft Supp", roleName: "Soft Support", icon: "⚡" },
  { key: "hard_support", label: "Pos 5 · Hard Supp", roleName: "Hard Support", icon: "👁️" },
] as const;

function getPlacementBadge(status?: string) {
  if (!status) return null;
  switch (status) {
    case "CHAMPION":
      return { label: "Campeón", color: "border-amber-400/60 bg-amber-500/15 text-amber-300" };
    case "RUNNER_UP":
      return { label: "Subcampeón", color: "border-sky-400/60 bg-sky-500/15 text-sky-300" };
    case "GF":
      return { label: "Gran Final", color: "border-amber-400/60 bg-amber-500/15 text-amber-300" };
    case "THIRD":
      return { label: "3er Lugar", color: "border-orange-400/60 bg-orange-500/15 text-orange-300" };
    case "FOURTH":
      return { label: "4to Lugar", color: "border-orange-300/40 bg-orange-500/10 text-orange-200" };
    case "TOP_4":
      return { label: "Top 4", color: "border-purple-400/60 bg-purple-500/15 text-purple-300" };
    case "TOP_8":
      return { label: "Playoffs", color: "border-indigo-400/50 bg-indigo-500/15 text-indigo-300" };
    default:
      return null;
  }
}

function DreamTeamPlayerCard({
  player,
  positionRole,
  index,
  tier = "first",
}: {
  player: PositionPlayer;
  positionRole: (typeof POSITION_ROLES)[number];
  index: number;
  tier?: "first" | "second";
}) {
  const medalUrl = getRankMedalUrl(player.medal.rank_tier);
  const isGold = tier === "first";
  const placement = getPlacementBadge(player.placement_status);
  const mvpCount = player.stats.mvp_count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className={`relative flex flex-col justify-between border bg-[#16120d] p-3.5 sm:p-4 shadow-xl transition-all duration-300 group overflow-hidden ${
        isGold
          ? "border-[#d8b467]/35 hover:border-[#d8b467] hover:shadow-[0_0_25px_rgba(216,180,103,0.22)]"
          : "border-[#8e9ca8]/35 hover:border-[#b8c6d4] hover:shadow-[0_0_25px_rgba(168,180,192,0.18)]"
      }`}
    >
      {/* Top Pedestal Header Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity ${
          isGold ? "via-[#d8b467]" : "via-[#a8b8c8]"
        }`}
      />

      {/* Position & Tier Badges Header */}
      <div className="flex items-center justify-between border-b border-[#2d261e] pb-2.5 gap-1.5 flex-wrap">
        <div
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#1f1912] border font-chakra text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${
            isGold
              ? "border-[#d8b467]/40 text-[#f0d38f]"
              : "border-[#8e9ca8]/40 text-[#c8d4e0]"
          }`}
        >
          <span>{positionRole.icon}</span>
          <span>{positionRole.label}</span>
        </div>

        {/* Status / Placement & MVP Badge */}
        <div className="flex items-center gap-1 shrink-0">
          {placement && (
            <span
              className={`px-1.5 py-0.5 border text-[9px] font-chakra font-black uppercase tracking-wider shrink-0 ${placement.color}`}
            >
              {placement.label}
            </span>
          )}
          {mvpCount > 0 && (
            <div
              className={`flex items-center gap-1 font-chakra text-[9px] font-bold px-1.5 py-0.5 border shrink-0 ${
                isGold
                  ? "text-[#f0d38f] bg-[#d8b467]/10 border-[#d8b467]/30"
                  : "text-[#c8d4e0] bg-[#8e9ca8]/10 border-[#8e9ca8]/30"
              }`}
              title={`${mvpCount} MVP${mvpCount > 1 ? "s" : ""} conseguido${mvpCount > 1 ? "s" : ""}`}
            >
              <IconCrown size={11} className="text-[#f0d38f]" />
              <span>{mvpCount} MVP</span>
            </div>
          )}
        </div>
      </div>

      {/* Player Identity Block */}
      <div className="mt-3.5 flex items-center gap-3">
        {/* Player Avatar */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xs border border-[#d8b467]/50 bg-[#1f1912] shadow-md group-hover:border-[#f0d38f] transition-colors">
          {player.avatar ? (
            <picture>
              <img
                src={normalizeMediaUrl(player.avatar) || player.avatar}
                alt={player.nickname}
                className="h-full w-full object-cover"
              />
            </picture>
          ) : (
            <div className="flex h-full w-full items-center justify-center font-cinzel text-lg font-black text-[#d8b467]">
              {player.nickname.slice(0, 2).toUpperCase()}
            </div>
          )}
          {/* Country Flag overlay */}
          {player.country && (
            <div className="absolute bottom-0.5 right-0.5 bg-black/70 p-0.5 rounded-xs">
              <CountryFlag countryCode={player.country} size="xs" />
            </div>
          )}
        </div>

        {/* Nickname & Medal & Team */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 min-w-0">
            <Link
              href={`/players/${encodeURIComponent(player.player_slug)}`}
              className="font-chakra text-sm sm:text-base font-black uppercase tracking-tight text-white hover:text-[#d8b467] transition-colors truncate block min-w-0"
              title={player.nickname}
            >
              {player.nickname}
            </Link>
            <IconShieldCheck size={14} className="text-[#d8b467] shrink-0 fill-[#d8b467]/20" />
          </div>

          {/* Medal Title */}
          <div className="mt-0.5 flex items-center gap-1.5 font-chakra text-xs text-[#c7bcab]">
            {medalUrl && (
              <picture className="shrink-0">
                <img src={medalUrl} alt="Medal" className="h-3.5 w-3.5 object-contain" />
              </picture>
            )}
            <span className="truncate text-[#f0d38f] font-semibold text-[10px]">
              {player.medal.medal_title || "Immortal"}
            </span>
          </div>

          {/* Team Tag & Logo */}
          <div className="mt-1 flex items-center gap-1.5">
            {player.team.logo_url && (
              <picture className="shrink-0">
                <img
                  src={normalizeMediaUrl(player.team.logo_url) || player.team.logo_url}
                  alt={player.team.name}
                  className="h-3.5 w-3.5 object-contain"
                />
              </picture>
            )}
            <Link
              href={`/teams/${encodeURIComponent(player.team.slug)}`}
              className="font-chakra text-[10px] font-bold text-[#8e857b] uppercase hover:text-white transition-colors truncate"
              title={player.team.name}
            >
              {player.team.name}
            </Link>
          </div>
        </div>
      </div>

      {/* High-Impact Stat Grid */}
      <div className="mt-4 grid grid-cols-3 gap-1.5 border-t border-[#2d261e] pt-3 text-center">
        {/* KDA */}
        <div className="border border-[#241e17] bg-[#120f0a] py-1.5 px-1 flex flex-col justify-between">
          <div className="font-chakra text-[9px] font-bold uppercase text-[#8e857b]">KDA</div>
          <div className="my-0.5 font-cinzel text-sm sm:text-base font-black text-[#f0d38f]">
            {player.stats.kda.toFixed(1)}
          </div>
          <div
            className="text-[9px] font-mono text-[#a89f91] truncate"
            title={`Promedio exacto: ${player.stats.avg_kills} kills / ${player.stats.avg_deaths} deaths / ${player.stats.avg_assists} assists`}
          >
            {Math.round(player.stats.avg_kills)}/{Math.round(player.stats.avg_deaths)}/{Math.round(player.stats.avg_assists)}
          </div>
        </div>

        {/* GPM / XPM */}
        <div className="border border-[#241e17] bg-[#120f0a] py-1.5 px-1 flex flex-col justify-between">
          <div className="font-chakra text-[9px] font-bold uppercase text-[#8e857b]">GPM / XPM</div>
          <div className="my-0.5 font-cinzel text-sm sm:text-base font-black text-[#2e9df0]">
            {player.stats.avg_gpm}
          </div>
          <div className="text-[9px] font-mono text-[#6cc4ff]">
            {player.stats.avg_xpm} <span className="text-[8px] text-[#8e857b]">XPM</span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="border border-[#241e17] bg-[#120f0a] py-1.5 px-1 flex flex-col justify-between">
          <div className="font-chakra text-[9px] font-bold uppercase text-[#8e857b]">WIN RATE</div>
          <div
            className={`my-0.5 font-cinzel text-sm sm:text-base font-black ${
              player.stats.win_rate >= 60 ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {player.stats.win_rate.toFixed(0)}%
          </div>
          <div
            className="text-[9px] font-mono text-[#a89f91] truncate"
            title={`${player.stats.games_played} partidas disputadas`}
          >
            {player.stats.wins}V - {player.stats.losses}D
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-[#241e17] pt-2 font-chakra text-[10px] sm:text-[11px] text-[#c7bcab]">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[#7e756b]">Daño Prom:</span>
          <span className="font-bold text-white">
            {formatSpanishCompact(player.stats.avg_hero_damage)}
          </span>
        </div>
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[#7e756b]">
            {player.position <= 2 ? "Last Hits:" : player.position === 3 ? "Stuns:" : "Wards:"}
          </span>
          <span className={`font-bold ${isGold ? "text-[#f0d38f]" : "text-[#c8d4e0]"}`}>
            {player.position <= 2
              ? player.stats.avg_last_hits.toFixed(0)
              : player.position === 3
              ? `${player.stats.avg_stuns_seconds.toFixed(0)}s`
              : player.stats.avg_wards_placed.toFixed(1)}
          </span>
        </div>
      </div>

      {/* CRI Score Footer */}
      {player.score && (
        <div className="mt-2 flex items-center justify-between border-t border-[#241e17]/80 pt-2 px-0.5 font-chakra text-[11px]">
          <span className="text-[#7e756b] flex items-center gap-1 text-[10px]">
            <IconFlame size={12} className={isGold ? "text-amber-400" : "text-slate-400"} />
            Impacto CRI:
          </span>
          <span
            className={`font-black font-cinzel text-xs sm:text-sm ${
              isGold ? "text-[#f0d38f]" : "text-[#c8d4e0]"
            }`}
          >
            {Math.round(player.score).toLocaleString()} pts
          </span>
        </div>
      )}
    </motion.div>
  );
}

export function DreamTeamSection({ dreamTeam, dreamTeamSecondary }: DreamTeamSectionProps) {
  const [selectedTier, setSelectedTier] = useState<"first" | "second">("first");
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const hasSecondary = Boolean(dreamTeamSecondary && Object.keys(dreamTeamSecondary).length > 0);
  const activeTeam = selectedTier === "first" ? dreamTeam : (dreamTeamSecondary || dreamTeam);

  return (
    <section id="dream-team" className="mt-14 sm:mt-16 scroll-mt-24">
      {/* Section Header with Golden Imperial Crown */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#2d261e]">
        <div>
          <div className="flex items-center gap-2 font-chakra text-xs font-bold uppercase tracking-[0.2em] text-[#f0d38f]">
            <IconCrown size={16} className="text-[#f0d38f]" />
            <span>LA ALINEACIÓN SUPREMA</span>
            <IconCrown size={16} className="text-[#f0d38f]" />
          </div>
          <h2 className="mt-1 font-cinzel text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
            DREAM TEAM DE LA <span className="text-[#f0d38f]">ARENA</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-chakra text-[#a89f91]">
            Los gladiadores con mayor impacto y rendimiento competitivo, ponderados por el algoritmo oficial CRI.
          </p>
        </div>

        {/* Action Controls: Tier Selector & CRI Guide Button */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* 1st / 2nd Dream Team Tabs */}
          {hasSecondary && (
            <div className="inline-flex border border-[#2d261e] bg-[#120f0a] p-0.5">
              <button
                type="button"
                onClick={() => setSelectedTier("first")}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-chakra text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedTier === "first"
                    ? "bg-[#251b0f] border border-[#d8b467] text-[#f0d38f] shadow-sm"
                    : "text-[#8e857b] hover:text-white"
                }`}
              >
                <IconCrown size={14} className={selectedTier === "first" ? "text-[#f0d38f]" : "text-[#8e857b]"} />
                <span>Dream Team 1 (Oro)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier("second")}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-chakra text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedTier === "second"
                    ? "bg-[#1c2229] border border-[#8e9ca8] text-[#c8d4e0] shadow-sm"
                    : "text-[#8e857b] hover:text-white"
                }`}
              >
                <IconAward size={14} className={selectedTier === "second" ? "text-[#c8d4e0]" : "text-[#8e857b]"} />
                <span>Dream Team 2 (Plata)</span>
              </button>
            </div>
          )}

          {/* Guide Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="inline-flex items-center gap-1.5 border border-[#d8b467]/40 bg-[#1a150e] px-3.5 py-1.5 font-chakra text-xs font-bold text-[#f0d38f] hover:bg-[#251d13] hover:border-[#f0d38f] transition-all cursor-pointer"
          >
            <IconInfoCircle size={15} className="text-[#f0d38f]" />
            <span>¿CÓMO SE CALCULA?</span>
          </button>
        </div>
      </div>

      {/* 5-Hero Dream Team Pedestal Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {POSITION_ROLES.map((role, idx) => {
          const player = activeTeam[role.key];
          if (!player) return null;
          return (
            <DreamTeamPlayerCard
              key={`${role.key}-${selectedTier}-${player.player_slug}`}
              player={player}
              positionRole={role}
              index={idx}
              tier={selectedTier}
            />
          );
        })}
      </div>

      {/* Guide Modal Backdrop */}
      <AnimatePresence>
        {isGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl border border-[#d8b467]/40 bg-[#16120d] p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-[#2d261e] pb-3">
                <div className="flex items-center gap-2">
                  <IconScale size={20} className="text-[#f0d38f]" />
                  <h3 className="font-cinzel text-lg font-black text-white uppercase">
                    Guía de Cálculo del Índice CRI
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(false)}
                  className="text-[#8e857b] hover:text-white transition-colors cursor-pointer"
                >
                  <IconX size={20} />
                </button>
              </div>

              <div className="mt-4 space-y-4 font-chakra text-xs sm:text-sm text-[#c7bcab] leading-relaxed">
                <div>
                  <h4 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                    <IconTrophy size={16} className="text-[#f0d38f]" />
                    ¿Qué es el Coliseum Rating Index (CRI)?
                  </h4>
                  <p className="mt-1 text-[#a89f91]">
                    El CRI es la métrica oficial diseñada para coronar al Dream Team de la arena de forma justa y transparente.
                    Combina el rendimiento individual específico de cada posición, la consistencia por volumen de partidas
                    y el éxito competitivo del equipo en el torneo.
                  </p>
                </div>

                <div className="border border-[#2d261e] bg-[#120f0a] p-3.5 space-y-3">
                  <div>
                    <span className="font-bold text-[#f0d38f]">1. Suavizado Bayesiano del Win Rate:</span>
                    <p className="text-xs text-[#8e857b] mt-0.5">
                      Evita que un jugador o suplente con solo 1 o 2 partidas ganadas (100% Win Rate) supere a quienes
                      disputaron 6, 8 o 10 partidas contra rivales de élite. Se ajusta matemáticamente con una base de
                      confianza de 2.5 partidas.
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-[#f0d38f]">2. Factor de Consistencia por Volumen:</span>
                    <p className="text-xs text-[#8e857b] mt-0.5">
                      Se requiere disputar un mínimo de 3 partidas para que el puntaje rinda al 100%. Quien jugó 1 sola
                      partida ve su impacto escalado (~58%) para prevenir distorsiones estadísticas.
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-[#f0d38f]">3. Bonificación por Puesto y Fase de Torneo:</span>
                    <p className="text-xs text-[#8e857b] mt-0.5">
                      Alcanzar instancias decisivas premia a los gladiadores que compitieron bajo máxima presión:
                      Gran Campeón (+20%), Subcampeón (+15%), 3er Lugar (+10%), 4to Lugar (+6%) y Cuartos de Final (+3%).
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-[#f0d38f]">4. Métricas Específicas por Posición:</span>
                    <ul className="text-xs text-[#8e857b] mt-1 space-y-1 list-disc list-inside">
                      <li><strong className="text-white">Pos 1 Carry:</strong> GPM, daño a estructuras, daño a héroes, KDA y supervivencia.</li>
                      <li><strong className="text-white">Pos 2 Midlane:</strong> Kills, daño masivo a héroes, KDA y control de ritmo (GPM/XPM).</li>
                      <li><strong className="text-white">Pos 3 Offlane:</strong> Duración de Stuns, presencia en peleas, daño y asistencias.</li>
                      <li><strong className="text-white">Pos 4 Soft Support:</strong> Asistencias, stuns, visión, dewarding y campamentos apilados.</li>
                      <li><strong className="text-white">Pos 5 Hard Support:</strong> Guerra de visión (wards/dewards), salvadas/healing, stacks y asistencias.</li>
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-[#f0d38f]">5. Elegibilidad del Dream Team:</span>
                    <p className="text-xs text-[#8e857b] mt-0.5">
                      Para coronarse en el 1er Dream Team se exige un mínimo de 2 partidas disputadas en el torneo y pertenecer
                      al roster oficial activo, protegiendo el mérito de los titulares regulares frente a reemplazos aislados.
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <button
                    type="button"
                    onClick={() => setIsGuideOpen(false)}
                    className="px-4 py-2 border border-[#d8b467] bg-[#1f1912] font-chakra text-xs font-bold text-[#f0d38f] hover:bg-[#2a2218] transition-colors cursor-pointer"
                  >
                    ENTENDIDO
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
