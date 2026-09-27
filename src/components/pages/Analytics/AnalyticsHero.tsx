"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconSwords,
  IconClock,
  IconSkull,
  IconFlame,
  IconSparkles,
} from "@tabler/icons-react";
import type { TournamentInfo, AnalyticsSummary } from "interfaces/analytics";

interface AnalyticsHeroProps {
  tournament: TournamentInfo;
  summary: AnalyticsSummary;
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
  onOpenFollowModal?: () => void;
}

const NAV_SHORTCUTS = [
  { id: "tournament-mvp", label: "MVP Torneo", icon: "🏆" },
  { id: "dream-team", label: "Dream Team", icon: "🌟" },
  { id: "records", label: "Récords", icon: "👑" },
  { id: "leaders", label: "Líderes", icon: "⚔️" },
  { id: "positions", label: "Por Posición", icon: "🛡️" },
  { id: "hero-meta", label: "Meta Héroes", icon: "🔮" },
  { id: "teams", label: "Equipos", icon: "🏛️" },
  { id: "highlights", label: "Curiosidades", icon: "📜" },
];

export function AnalyticsHero({
  tournament,
  summary,
  activeSection,
  onNavigateSection,
  onOpenFollowModal,
}: AnalyticsHeroProps) {
  const avgKillsPerGame = summary.total_games_analyzed > 0
    ? (summary.total_kills / summary.total_games_analyzed).toFixed(1)
    : "0";

  return (
    <div className="relative border-b border-[#2d261e] pb-10">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-full max-w-4xl bg-[#2e9df0]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-10 h-64 w-64 bg-[#d8b467]/10 blur-3xl" />

      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 font-chakra text-xs text-[#8e857b]">
        <Link href="/" className="transition-colors hover:text-[#2e9df0]">
          INICIO
        </Link>
        <span>/</span>
        <span className="text-[#d8b467] font-semibold uppercase">ESTADÍSTICAS &amp; ANALÍTICAS</span>
      </nav>

      {/* Main Header Title */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex items-center gap-2 border border-[#d8b467]/40 bg-[#1c1712] px-3 py-1 font-chakra text-[11px] font-bold uppercase tracking-[0.2em] text-[#f0d38f] shadow-[0_0_15px_rgba(216,180,103,0.15)]">
              <IconSparkles size={14} className="text-[#f0d38f] animate-pulse" />
              <span>DATA OFICIAL DEL TORNEO</span>
            </div>
            <div className="h-px w-16 sm:w-28 bg-linear-to-r from-[#d8b467] via-[#d8b467]/50 to-transparent" />
          </div>

          <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white">
            ESTADÍSTICAS DEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d8b467] via-[#f0d38f] to-[#e49b38]">COLISEO</span>
          </h1>

          <p className="mt-3 max-w-3xl font-chakra text-xs sm:text-sm font-normal leading-relaxed text-[#c7bcab]">
            Métricas oficiales, Dream Team, héroes más dominantes y récords individuales de los gladiadores
            en <span className="text-white font-semibold">{tournament.name}</span>.
          </p>
        </div>

        {/* Action Badges on the right */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end">
          {/* Support / Follow Modal Trigger */}
          {onOpenFollowModal && (
            <button
              type="button"
              onClick={onOpenFollowModal}
              className="group inline-flex items-center gap-2 border border-[#d8b467]/60 bg-gradient-to-r from-[#1f170f] via-[#241c13] to-[#1a140d] px-3.5 py-2 font-chakra text-xs font-bold uppercase tracking-wider text-[#f0d38f] shadow-[0_0_15px_rgba(216,180,103,0.2)] hover:border-[#00c8f8] hover:text-white hover:shadow-[0_0_20px_rgba(0,200,248,0.3)] transition-all cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f0d38f] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f0d38f] group-hover:bg-[#00c8f8]" />
              </span>
              <span>Data &amp; IA por <strong className="text-white group-hover:text-[#00c8f8]">@hebertdev.ai</strong></span>
            </button>
          )}

          {/* Live sync badge */}
          <div className="flex items-center gap-2 border border-[#2d261e] bg-[#16120d] px-4 py-2 font-chakra text-xs text-[#a89f91]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00c8f8] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00c8f8]" />
            </span>
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              {summary.total_games_analyzed} Batallas
            </span>
          </div>
        </div>
      </motion.div>

      {/* 4 Key Metric Master Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        {/* Card 1: Partidas Analizadas */}
        <div className="relative overflow-hidden border border-[#2d261e] bg-[#16120d]/90 p-4 sm:p-5 transition-all hover:border-[#2e9df0]/60 hover:shadow-[0_0_20px_rgba(46,157,240,0.15)] group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#2e9df0]/5 rounded-bl-full pointer-events-none group-hover:bg-[#2e9df0]/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="font-chakra text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8e857b]">
              Partidas Totales
            </span>
            <IconSwords size={18} className="text-[#2e9df0]" />
          </div>
          <div className="mt-2 font-cinzel text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            {summary.total_games_analyzed}
          </div>
          <div className="mt-1 font-chakra text-[10px] sm:text-[11px] text-[#6cc4ff]">
            Fase Suiza &amp; Playoffs
          </div>
        </div>

        {/* Card 2: Kills Totales */}
        <div className="relative overflow-hidden border border-[#2d261e] bg-[#16120d]/90 p-4 sm:p-5 transition-all hover:border-[#e51b24]/60 hover:shadow-[0_0_20px_rgba(229,27,36,0.15)] group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#e51b24]/5 rounded-bl-full pointer-events-none group-hover:bg-[#e51b24]/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="font-chakra text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8e857b]">
              Bajas Totales
            </span>
            <IconSkull size={18} className="text-[#e51b24]" />
          </div>
          <div className="mt-2 font-cinzel text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            {summary.total_kills.toLocaleString("es-ES")}
          </div>
          <div className="mt-1 font-chakra text-[10px] sm:text-[11px] text-[#ff7373]">
            {avgKillsPerGame} bajas por partida
          </div>
        </div>

        {/* Card 3: Duración Promedio */}
        <div className="relative overflow-hidden border border-[#2d261e] bg-[#16120d]/90 p-4 sm:p-5 transition-all hover:border-[#d8b467]/60 hover:shadow-[0_0_20px_rgba(216,180,103,0.15)] group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#d8b467]/5 rounded-bl-full pointer-events-none group-hover:bg-[#d8b467]/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="font-chakra text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8e857b]">
              Duración Promedio
            </span>
            <IconClock size={18} className="text-[#d8b467]" />
          </div>
          <div className="mt-2 font-cinzel text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            {summary.avg_game_duration_formatted}
          </div>
          <div className="mt-1 font-chakra text-[10px] sm:text-[11px] text-[#f0d38f]">
            {summary.avg_game_duration_seconds} segundos
          </div>
        </div>

        {/* Card 4: Ritmo de Sangre */}
        <div className="relative overflow-hidden border border-[#2d261e] bg-[#16120d]/90 p-4 sm:p-5 transition-all hover:border-[#00c8f8]/60 hover:shadow-[0_0_20px_rgba(0,200,248,0.15)] group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#00c8f8]/5 rounded-bl-full pointer-events-none group-hover:bg-[#00c8f8]/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="font-chakra text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8e857b]">
              Intensidad de Arena
            </span>
            <IconFlame size={18} className="text-[#00c8f8]" />
          </div>
          <div className="mt-2 font-cinzel text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            1.38
          </div>
          <div className="mt-1 font-chakra text-[10px] sm:text-[11px] text-[#6cc4ff]">
            Bajas por minuto
          </div>
        </div>
      </motion.div>

      {/* Quick Navigation Scroll Tabs */}
      <div className="mt-8 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="font-chakra text-[11px] font-bold uppercase tracking-wider text-[#7e756b] mr-2 shrink-0 hidden sm:inline-block">
          Explorar:
        </span>
        {NAV_SHORTCUTS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigateSection(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-chakra text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                isActive
                  ? "border-[#d8b467] bg-[#d8b467]/20 text-[#f0d38f] shadow-[0_0_12px_rgba(216,180,103,0.3)]"
                  : "border-[#2d261e] bg-[#18140f] text-[#a89f91] hover:border-[#2e9df0]/60 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
