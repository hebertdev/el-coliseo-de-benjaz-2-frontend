"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconCrown,
  IconTrophy,
  IconFlame,
  IconAward,
  IconShieldCheck,
  IconSwords,
  IconSparkles,
} from "@tabler/icons-react";
import type { TournamentMvpData } from "interfaces/analytics";
import { CountryFlag } from "components/ui/CountryFlag";
import { getRankMedalUrl, formatSpanishCompact } from "helpers/dota";
import { normalizeMediaUrl } from "lib/config";

interface TournamentMvpSectionProps {
  mvp?: TournamentMvpData | null;
}

export function TournamentMvpSection({ mvp }: TournamentMvpSectionProps) {
  if (!mvp) return null;

  const medalUrl = getRankMedalUrl(mvp.medal.rank_tier);
  const teamLogo = mvp.team.logo_url
    ? normalizeMediaUrl(mvp.team.logo_url) || mvp.team.logo_url
    : null;

  return (
    <motion.section
      id="tournament-mvp"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full mt-10 scroll-mt-24"
    >
      {/* Container Principal Imperial con Resplandor Dorado */}
      <div className="relative w-full overflow-hidden rounded-xs border-2 border-[#d8b467]/50 bg-gradient-to-br from-[#1c160e] via-[#14100b] to-[#0a0805] p-5 sm:p-7 lg:p-8 shadow-[0_0_60px_rgba(216,180,103,0.18)]">
        {/* Adornos en las 4 esquinas de estilo gladiador romano */}
        <div className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-[#f0d38f]" />
        <div className="pointer-events-none absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-[#f0d38f]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#f0d38f]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#f0d38f]" />

        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#d8b467]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#f0d38f]/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d8b467_0.75px,transparent_0.75px)] bg-size-[20px_20px] opacity-10" />

        {/* Top Header Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#2d261e] pb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Status Pill Badge */}
            {mvp.is_provisional ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-500/60 text-amber-300 font-chakra text-[11px] sm:text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                <IconTrophy size={15} className="text-amber-300" />
                <span>LÍDER MVP HASTA EL MOMENTO</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-gradient-to-r from-amber-500/25 via-yellow-500/35 to-amber-500/25 border-2 border-[#f0d38f] text-[#f0d38f] font-chakra text-xs sm:text-sm font-black uppercase tracking-widest shadow-[0_0_25px_rgba(240,211,143,0.4)]">
                <IconCrown size={18} className="text-[#f0d38f]" />
                <span>MVP OFICIAL DEL TORNEO</span>
              </span>
            )}

            {/* Placement / Champion distinction */}
            {mvp.is_champion ? (
              <span className="px-2.5 py-1 border border-amber-400 bg-amber-500/20 text-amber-300 font-chakra text-[10px] sm:text-xs font-black uppercase tracking-wider">
                🏆 Campeón de la Arena
              </span>
            ) : (
              <span className="px-2.5 py-1 border border-[#3a3024] bg-[#1a140d] text-[#c7bcab] font-chakra text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Líder en Rendimiento General
              </span>
            )}
          </div>

          {/* CRI Impact Score Badge */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#100d08] border border-[#d8b467]/40 shadow-inner">
            <IconFlame size={18} className="text-[#f0d38f] animate-pulse" />
            <span className="font-chakra text-[10px] sm:text-xs uppercase text-[#8e857b] font-bold">
              Impacto CRI:
            </span>
            <span className="font-cinzel text-base sm:text-lg font-black text-[#f0d38f]">
              {Math.round(mvp.score).toLocaleString()} PTS
            </span>
          </div>
        </div>

        {/* Master Content Grid: Todo el largo del contenedor */}
        <div className="relative z-10 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Columna Izquierda: Identidad del Jugador y Justificación (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-start gap-4">
              {/* Giant Avatar */}
              <div className="relative h-22 w-22 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xs border-2 border-[#d8b467] bg-[#1f1912] shadow-[0_0_30px_rgba(216,180,103,0.35)]">
                {mvp.avatar ? (
                  <picture>
                    <img
                      src={normalizeMediaUrl(mvp.avatar) || mvp.avatar}
                      alt={mvp.nickname}
                      className="h-full w-full object-cover"
                    />
                  </picture>
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-cinzel text-2xl sm:text-3xl font-black text-[#d8b467]">
                    {mvp.nickname.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {/* Bandera del país */}
                {mvp.country && (
                  <div className="absolute bottom-1 right-1 bg-black/80 p-0.5 rounded-xs border border-[#2d261e]">
                    <CountryFlag countryCode={mvp.country} size="xs" />
                  </div>
                )}
              </div>

              {/* Player Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Link
                    href={`/players/${encodeURIComponent(mvp.player_slug)}`}
                    className="font-cinzel text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white hover:text-[#d8b467] transition-colors truncate block"
                    title={mvp.nickname}
                  >
                    {mvp.nickname}
                  </Link>
                  <IconShieldCheck size={18} className="text-[#d8b467] shrink-0 fill-[#d8b467]/20" />
                </div>

                {/* Team Info */}
                <div className="mt-1 flex items-center gap-2">
                  {teamLogo && (
                    <picture className="shrink-0">
                      <img
                        src={teamLogo}
                        alt={mvp.team.name}
                        className="h-4 w-4 object-contain"
                      />
                    </picture>
                  )}
                  <Link
                    href={`/teams/${encodeURIComponent(mvp.team.slug)}`}
                    className="font-chakra text-xs font-bold text-[#f0d38f] hover:text-white uppercase tracking-wider transition-colors truncate"
                  >
                    {mvp.team.name} {mvp.team.tag && `[${mvp.team.tag}]`}
                  </Link>
                </div>

                {/* Position and Role Badge */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#261f16] border border-[#d8b467]/40 font-chakra text-[11px] font-black uppercase tracking-wider text-[#f0d38f]">
                    <IconSwords size={13} className="text-[#f0d38f]" />
                    <span>{mvp.position_display}</span>
                  </span>

                  {/* Medal */}
                  {medalUrl && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#17130e] border border-[#2d261e] font-chakra text-[10px] text-[#c7bcab] font-bold">
                      <picture className="shrink-0">
                        <img src={medalUrl} alt="Medal" className="h-3.5 w-3.5 object-contain" />
                      </picture>
                      <span>{mvp.medal.medal_title || "Immortal"}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Recognition / Justificación de Elección */}
            <div className="relative border-l-2 border-[#d8b467] bg-[#18130d]/90 p-4 border-y border-r border-[#2d261e] shadow-sm">
              <div className="flex items-center gap-1.5 font-chakra text-xs font-bold uppercase tracking-wider text-[#f0d38f]">
                <IconAward size={16} className="text-[#f0d38f]" />
                <span>¿Por qué es el MVP del Torneo?</span>
              </div>
              <p className="mt-2 font-chakra text-xs sm:text-[13px] leading-relaxed text-[#c7bcab]">
                {mvp.reason}
              </p>
            </div>
          </div>

          {/* Columna Derecha: Matriz Completa de Estadísticas y Top Héroes (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* High-Impact Stat Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {/* KDA */}
              <div className="border border-[#2d261e] bg-[#110e09] p-3 flex flex-col justify-between hover:border-[#d8b467]/40 transition-colors">
                <div className="font-chakra text-[10px] font-bold uppercase text-[#8e857b]">
                  Promedio KDA
                </div>
                <div className="my-1 font-cinzel text-xl sm:text-2xl font-black text-[#f0d38f]">
                  {mvp.stats.kda.toFixed(1)}
                </div>
                <div
                  className="text-[10px] font-mono text-[#a89f91] truncate"
                  title={`${mvp.stats.avg_kills} kills / ${mvp.stats.avg_deaths} deaths / ${mvp.stats.avg_assists} assists`}
                >
                  {Math.round(mvp.stats.avg_kills)}/{Math.round(mvp.stats.avg_deaths)}/{Math.round(mvp.stats.avg_assists)}
                </div>
              </div>

              {/* Win Rate */}
              <div className="border border-[#2d261e] bg-[#110e09] p-3 flex flex-col justify-between hover:border-[#d8b467]/40 transition-colors">
                <div className="font-chakra text-[10px] font-bold uppercase text-[#8e857b]">
                  Win Rate
                </div>
                <div
                  className={`my-1 font-cinzel text-xl sm:text-2xl font-black ${
                    mvp.stats.win_rate >= 60 ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {mvp.stats.win_rate.toFixed(0)}%
                </div>
                <div className="text-[10px] font-mono text-[#a89f91] truncate">
                  {mvp.stats.wins}V - {mvp.stats.losses}D ({mvp.stats.games_played} PJ)
                </div>
              </div>

              {/* GPM / XPM */}
              <div className="border border-[#2d261e] bg-[#110e09] p-3 flex flex-col justify-between hover:border-[#d8b467]/40 transition-colors">
                <div className="font-chakra text-[10px] font-bold uppercase text-[#8e857b]">
                  GPM / XPM
                </div>
                <div className="my-1 font-cinzel text-xl sm:text-2xl font-black text-[#2e9df0]">
                  {mvp.stats.avg_gpm}
                </div>
                <div className="text-[10px] font-mono text-[#6cc4ff]">
                  {mvp.stats.avg_xpm} <span className="text-[9px] text-[#8e857b]">XPM</span>
                </div>
              </div>

              {/* MVPs de Serie */}
              <div className="border border-[#2d261e] bg-[#110e09] p-3 flex flex-col justify-between hover:border-[#d8b467]/40 transition-colors">
                <div className="font-chakra text-[10px] font-bold uppercase text-[#8e857b]">
                  Series MVP
                </div>
                <div className="my-1 font-cinzel text-xl sm:text-2xl font-black text-amber-300">
                  {mvp.stats.mvp_count || 0}
                </div>
                <div className="text-[10px] font-mono text-amber-400/80 truncate">
                  {mvp.stats.mvp_count === 1 ? "1 Galardón" : `${mvp.stats.mvp_count || 0} Galardones`}
                </div>
              </div>
            </div>

            {/* Secondary Combat Metrics Row */}
            <div className="grid grid-cols-3 gap-2 border border-[#2d261e] bg-[#120f0a] p-2.5 sm:p-3 text-center">
              <div className="px-1 border-r border-[#241e17]">
                <div className="font-chakra text-[9px] sm:text-[10px] text-[#8e857b] uppercase font-bold">
                  Daño a Héroes
                </div>
                <div className="mt-0.5 font-chakra text-xs sm:text-sm font-bold text-white">
                  {formatSpanishCompact(mvp.stats.avg_hero_damage)}
                </div>
              </div>

              <div className="px-1 border-r border-[#241e17]">
                <div className="font-chakra text-[9px] sm:text-[10px] text-[#8e857b] uppercase font-bold">
                  Daño a Torres
                </div>
                <div className="mt-0.5 font-chakra text-xs sm:text-sm font-bold text-white">
                  {formatSpanishCompact(mvp.stats.avg_tower_damage)}
                </div>
              </div>

              <div className="px-1">
                <div className="font-chakra text-[9px] sm:text-[10px] text-[#8e857b] uppercase font-bold">
                  {mvp.position <= 2 ? "Last Hits Prom" : mvp.position === 3 ? "Stuns Prom" : "Wards Prom"}
                </div>
                <div className="mt-0.5 font-chakra text-xs sm:text-sm font-bold text-[#f0d38f]">
                  {mvp.position <= 2
                    ? mvp.stats.avg_last_hits.toFixed(0)
                    : mvp.position === 3
                    ? `${mvp.stats.avg_stuns_seconds.toFixed(0)}s`
                    : mvp.stats.avg_wards_placed.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Top Héroes Más Determinantes */}
            {mvp.top_heroes && mvp.top_heroes.length > 0 && (
              <div className="border border-[#2d261e] bg-[#120f0a] p-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#241e17]">
                  <div className="flex items-center gap-1.5 font-chakra text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#a89f91]">
                    <IconSparkles size={14} className="text-[#f0d38f]" />
                    <span>Héroes más jugados por el MVP en el Torneo</span>
                  </div>
                  <span className="font-chakra text-[9px] text-[#7e756b] uppercase">
                    Efectividad
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {mvp.top_heroes.map((hero) => (
                    <div
                      key={hero.hero_id}
                      className="flex items-center gap-2 bg-[#17130e] border border-[#241e17] p-1.5 hover:border-[#d8b467]/40 transition-colors"
                    >
                      <picture className="shrink-0">
                        <img
                          src={hero.image_url}
                          alt={hero.hero_name}
                          className="h-8 w-12 object-cover border border-[#2d261e]"
                        />
                      </picture>
                      <div className="min-w-0 flex-1">
                        <div className="font-chakra text-[11px] font-bold text-white truncate">
                          {hero.hero_name}
                        </div>
                        <div className="font-mono text-[9px] text-[#a89f91]">
                          {hero.games_played} {hero.games_played === 1 ? "partida" : "partidas"}
                          {hero.win_rate !== undefined && (
                            <span
                              className={`ml-1 font-bold ${
                                hero.win_rate >= 50 ? "text-emerald-400" : "text-amber-400"
                              }`}
                            >
                              · {hero.win_rate.toFixed(0)}% WR
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
