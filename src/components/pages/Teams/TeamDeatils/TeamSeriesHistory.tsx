"use client";

import Link from "next/link";
import {
  IconSwords,
  IconShield,
  IconArrowUpRight,
} from "@tabler/icons-react";
import type { TeamSeriesHistoryResponse, TeamSeriesItem } from "interfaces/matches";

interface TeamSeriesHistoryProps {
  seriesHistory?: TeamSeriesHistoryResponse | null;
}

export function TeamSeriesHistory({ seriesHistory }: TeamSeriesHistoryProps) {
  if (!seriesHistory || !seriesHistory.series || seriesHistory.series.length === 0) {
    return (
      <div className="border border-[#2d261e] bg-[#18140f] p-6 text-center rounded-xs">
        <IconSwords size={32} className="mx-auto mb-2 text-[#d8b467]/40" />
        <h4 className="font-cinzel text-sm font-bold uppercase text-white">
          Sin Series Registradas
        </h4>
        <p className="font-chakra text-xs text-[#8e857b] mt-1">
          Este equipo aún no tiene series programadas o disputadas en el torneo.
        </p>
      </div>
    );
  }

  const { total_series, wins, losses, win_rate, grouped_by_date } = seriesHistory;

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="border border-[#2d261e] bg-[#18140f] p-4 sm:p-5 rounded-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#241e17] pb-4">
          <div>
            <h3 className="font-cinzel text-lg sm:text-xl font-bold uppercase text-white flex items-center gap-2">
              <IconSwords size={20} className="text-[#d8b467]" />
              HISTORIAL DE SERIES
            </h3>
            <p className="font-chakra text-xs text-[#8e857b] mt-0.5">
              Series oficiales disputadas en el torneo, ordenadas cronológicamente desde la más reciente.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 font-chakra text-xs">
            <div className="border border-[#2d261e] bg-[#120f0a] px-3 py-1.5 rounded-xs text-center">
              <span className="block text-[10px] uppercase text-[#8e857b]">Series</span>
              <span className="font-bold text-white text-sm">{total_series}</span>
            </div>
            <div className="border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-xs text-center">
              <span className="block text-[10px] uppercase text-emerald-400">Victorias</span>
              <span className="font-bold text-emerald-400 text-sm">{wins}V</span>
            </div>
            <div className="border border-red-500/30 bg-red-500/10 px-3 py-1.5 rounded-xs text-center">
              <span className="block text-[10px] uppercase text-red-400">Derrotas</span>
              <span className="font-bold text-red-400 text-sm">{losses}D</span>
            </div>
            <div className="border border-[#d8b467]/30 bg-[#d8b467]/10 px-3 py-1.5 rounded-xs text-center">
              <span className="block text-[10px] uppercase text-[#f0d38f]">Winrate</span>
              <span className="font-bold text-[#f0d38f] text-sm">{win_rate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Series List (Matches Image 2 reference) */}
      <div className="space-y-6">
        {grouped_by_date.map((group) => (
          <div key={group.date} className="space-y-2.5">
            {/* Centered Date Header: MIÉRCOLES, AGOSTO 12. */}
            <div className="text-center py-1">
              <span className="font-chakra text-xs font-bold uppercase tracking-[0.25em] text-[#8e857b]">
                {group.date_formatted || group.date}
              </span>
            </div>

            {/* Series cards */}
            <div className="space-y-2">
              {group.series.map((s) => (
                <TeamSeriesRow key={s.series_id} series={s} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSeriesRow({ series }: { series: TeamSeriesItem }) {
  const isWinner = series.is_winner;
  const isCompleted = series.status === "COMPLETED" || series.status === "WALKOVER";

  return (
    <div className="group relative border border-[#26211a] bg-[#16130f] hover:border-[#3d3328] transition-all p-2.5 sm:p-3.5 rounded-xs shadow-md">
      {/* Subtle outcome highlight border */}
      {isCompleted && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            isWinner ? "bg-emerald-500" : "bg-red-600/70"
          }`}
        />
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-6 pl-1">
        {/* MATCHUP: [TEAM A 0-0] [LOGO]  2 - 1  [LOGO] [TEAM B 0-0] */}
        <div className="flex-1 w-full flex items-center justify-center md:justify-start gap-2 sm:gap-5 min-w-0">
          {/* TEAM A (Clickable Link) */}
          <Link
            href={series.team_a.slug ? `/teams/${series.team_a.slug}` : "#"}
            title={`Ver perfil de ${series.team_a.name}`}
            className="group/ta flex-1 flex items-center justify-end gap-2 sm:gap-2.5 text-right min-w-0 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="min-w-0 max-w-[120px] sm:max-w-[170px]">
              <span className="font-chakra text-xs sm:text-sm font-black uppercase text-white tracking-wide block leading-tight truncate whitespace-nowrap group-hover/ta:text-[#00c8f8] transition-colors">
                {series.team_a.name}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-[#8e857b] block whitespace-nowrap">
                {series.team_a.record}
              </span>
            </div>
            {series.team_a.logo_url ? (
              <picture>
                <img
                  src={series.team_a.logo_url}
                  alt={series.team_a.name}
                  className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-full border border-[#3d3328] bg-[#110e0a] p-1 shrink-0 shadow-sm group-hover/ta:border-[#00c8f8] transition-colors"
                />
              </picture>
            ) : (
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-[#3d3328] bg-[#110e0a] flex items-center justify-center shrink-0 group-hover/ta:border-[#00c8f8] transition-colors">
                <IconShield size={18} className="text-[#d8b467]" />
              </div>
            )}
          </Link>

          {/* SCORE CENTER */}
          <div className="shrink-0 px-2 sm:px-3 text-center">
            {isCompleted ? (
              <span className="font-chakra text-base sm:text-xl font-black tracking-widest text-white/95 whitespace-nowrap">
                {series.score_a} - {series.score_b}
              </span>
            ) : (
              <span className="font-chakra text-xs sm:text-sm font-bold uppercase tracking-wider text-[#8e857b] whitespace-nowrap">
                {series.best_of}
              </span>
            )}
          </div>

          {/* TEAM B (Clickable Link) */}
          <Link
            href={series.team_b.slug ? `/teams/${series.team_b.slug}` : "#"}
            title={`Ver perfil de ${series.team_b.name}`}
            className="group/tb flex-1 flex items-center justify-start gap-2 sm:gap-2.5 text-left min-w-0 hover:opacity-90 transition-opacity cursor-pointer"
          >
            {series.team_b.logo_url ? (
              <picture>
                <img
                  src={series.team_b.logo_url}
                  alt={series.team_b.name}
                  className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-full border border-[#3d3328] bg-[#110e0a] p-1 shrink-0 shadow-sm group-hover/tb:border-[#00c8f8] transition-colors"
                />
              </picture>
            ) : (
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-[#3d3328] bg-[#110e0a] flex items-center justify-center shrink-0 group-hover/tb:border-[#00c8f8] transition-colors">
                <IconShield size={18} className="text-[#8e857b]" />
              </div>
            )}
            <div className="min-w-0 max-w-[120px] sm:max-w-[170px]">
              <span className="font-chakra text-xs sm:text-sm font-black uppercase text-white tracking-wide block leading-tight truncate whitespace-nowrap group-hover/tb:text-[#00c8f8] transition-colors">
                {series.team_b.name}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-[#8e857b] block whitespace-nowrap">
                {series.team_b.record}
              </span>
            </div>
          </Link>
        </div>

        {/* BUTTON: DETALLES DE LA SERIE */}
        <div className="shrink-0 w-full md:w-auto text-center">
          {series.first_game_slug ? (
            <Link
              href={`/game/${series.first_game_slug}`}
              className="inline-flex w-full md:w-auto items-center justify-center gap-1.5 bg-[#4a5563] hover:bg-[#5b6877] text-white px-3.5 py-1.5 sm:py-2 text-xs font-chakra font-bold uppercase tracking-wider rounded-xs border border-white/10 transition-all hover:border-white/30 cursor-pointer shadow-sm whitespace-nowrap"
            >
              <span>Detalles de la serie</span>
              <IconArrowUpRight size={12} stroke={2.5} />
            </Link>
          ) : (
            <span className="inline-flex w-full md:w-auto items-center justify-center bg-[#25221d] text-[#8e857b] px-3.5 py-1.5 sm:py-2 text-xs font-chakra font-bold uppercase tracking-wider rounded-xs border border-[#3d3328] whitespace-nowrap">
              {series.status_display || "Programado"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
