"use client";

import Link from "next/link";
import {
  IconSwords,
  IconArrowUpRight,
  IconClock,
  IconShield,
} from "@tabler/icons-react";
import type { PlayerMatchHistoryResponse, PlayerMatchItem } from "interfaces/matches";

interface PlayerMatchHistoryProps {
  matchHistory?: PlayerMatchHistoryResponse | null;
}

export function PlayerMatchHistory({ matchHistory }: PlayerMatchHistoryProps) {
  if (!matchHistory || !matchHistory.matches || matchHistory.matches.length === 0) {
    return (
      <div className="border border-[#2d261e] bg-[#18140f] p-6 text-center rounded-xs">
        <IconSwords size={32} className="mx-auto mb-2 text-[#d8b467]/40" />
        <h4 className="font-cinzel text-sm font-bold uppercase text-white">
          Sin Partidas Registradas
        </h4>
        <p className="font-chakra text-xs text-[#8e857b] mt-1">
          Este gladiador aún no ha disputado partidas oficiales con telemetría en el torneo.
        </p>
      </div>
    );
  }

  const { total_matches, wins, losses, win_rate, grouped_by_date } = matchHistory;

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="border border-[#2d261e] bg-[#18140f] p-4 sm:p-5 rounded-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#241e17] pb-4">
          <div>
            <h3 className="font-cinzel text-lg sm:text-xl font-bold uppercase text-white flex items-center gap-2">
              <IconSwords size={20} className="text-[#d8b467]" />
              HISTORIAL DE PARTIDAS
            </h3>
            <p className="font-chakra text-xs text-[#8e857b] mt-0.5">
              Partidas disputadas ordenadas cronológicamente desde la más reciente.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 font-chakra text-xs">
            <div className="border border-[#2d261e] bg-[#120f0a] px-3 py-1.5 rounded-xs text-center">
              <span className="block text-[10px] uppercase text-[#8e857b]">Partidas</span>
              <span className="font-bold text-white text-sm">{total_matches}</span>
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

      {/* Grouped Match List */}
      <div className="space-y-6">
        {grouped_by_date.map((group) => (
          <div key={group.date} className="space-y-2.5">
            {/* Date Header (Image 2 style: MIÉRCOLES, AGOSTO 12.) */}
            <div className="text-center py-1">
              <span className="font-chakra text-xs font-bold uppercase tracking-[0.25em] text-[#8e857b]">
                {group.date_formatted || group.date}
              </span>
            </div>

            {/* Matches in this Date */}
            <div className="space-y-2">
              {group.matches.map((m) => (
                <PlayerMatchRow key={m.game_id} match={m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerMatchRow({ match }: { match: PlayerMatchItem }) {
  const isRadiant = match.player_side === "radiant";
  const won = match.player_won;

  return (
    <div
      className={`group relative border transition-all duration-200 ${
        won
          ? "border-emerald-500/30 bg-[#121813]/90 hover:border-emerald-500/60"
          : "border-red-950/40 bg-[#181212]/90 hover:border-red-800/50"
      } p-2.5 sm:p-3 rounded-xs shadow-md overflow-hidden`}
    >
      {/* Side Accent line */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          won ? "bg-emerald-500" : "bg-red-600"
        }`}
      />

      {/* ================= MOBILE LAYOUT (< sm) ================= */}
      <div className="flex flex-col gap-2.5 sm:hidden pl-1.5">
        {/* Top Tier: Hero Portrait + Name & Side + Result Badge + Action Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {match.hero.image_url ? (
              <picture>
                <img
                  src={match.hero.image_url}
                  alt={match.hero.name}
                  className="h-8 w-13 object-cover rounded-[2px] border border-black/80 shrink-0 shadow-xs"
                />
              </picture>
            ) : (
              <div className="h-8 w-13 bg-[#1e1913] flex items-center justify-center text-[9px] text-[#8e857b] rounded-[2px] shrink-0">
                Hero
              </div>
            )}
            <div className="min-w-0">
              <span className="font-chakra text-xs font-bold text-white block truncate leading-tight">
                {match.hero.name}
              </span>
              <div className="flex items-center gap-1 font-chakra text-[10px] text-[#8e857b]">
                <span className={isRadiant ? "text-[#00c8f8] font-semibold" : "text-rose-400 font-semibold"}>
                  {isRadiant ? "Radiant" : "Dire"}
                </span>
                <span>•</span>
                <span className="truncate">{match.round_name || "Match"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2 py-0.5 font-chakra text-[10px] font-black uppercase tracking-wider border rounded-xs whitespace-nowrap ${
                won
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                  : "border-rose-500/50 bg-rose-500/15 text-rose-300"
              }`}
            >
              {won ? "Victoria" : "Derrota"}
            </span>

            <Link
              href={`/game/${match.game_slug}`}
              title="Ver partida"
              className="inline-flex items-center gap-0.5 border border-[#00c8f8]/60 bg-[#00c8f8]/10 hover:bg-[#00c8f8] text-[#6cc4ff] hover:text-black px-2 py-0.5 text-[11px] font-chakra font-bold uppercase tracking-wider transition-all rounded-xs shrink-0"
              style={{ clipPath: "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)" }}
            >
              <span>Ver</span>
              <IconArrowUpRight size={12} stroke={2.5} />
            </Link>
          </div>
        </div>

        {/* Bottom Tier: Teams Matchup + KDA & Duration */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#241e17] text-xs font-chakra">
          {/* Teams */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {match.player_team.logo_url && (
              <picture>
                <img
                  src={match.player_team.logo_url}
                  alt={match.player_team.name}
                  className="h-5 w-5 rounded-full object-contain shrink-0"
                />
              </picture>
            )}
            <span className="font-bold text-[#f0d38f] truncate max-w-18">
              {match.player_team.name}
            </span>
            <span className="font-mono font-bold text-white shrink-0">
              {match.player_team.score}
            </span>
            <span className="text-[#8e857b] font-mono text-[10px] px-0.5 shrink-0">
              vs
            </span>
            <span className="font-mono font-bold text-zinc-400 shrink-0">
              {match.rival_team.score}
            </span>
            <span className="text-[#c7bcab] truncate max-w-18">
              {match.rival_team.name}
            </span>
            {match.rival_team.logo_url && (
              <picture>
                <img
                  src={match.rival_team.logo_url}
                  alt={match.rival_team.name}
                  className="h-5 w-5 rounded-full object-contain shrink-0"
                />
              </picture>
            )}
          </div>

          {/* KDA & Duration */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[11px] text-white">
              {match.stats.kills}/<span className="text-rose-400">{match.stats.deaths}</span>/{match.stats.assists}
            </span>
            <span className="font-mono text-[10px] text-[#8e857b] border-l border-[#2d261e] pl-2 flex items-center gap-1">
              <IconClock size={11} />
              <span>{match.duration_formatted}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ================= TABLET & DESKTOP LAYOUT (>= sm) ================= */}
      <div className="hidden sm:flex items-center justify-between gap-3 min-w-0 pl-1.5">
        {/* 1. Hero & Side & Round */}
        <div className="flex items-center gap-2.5 min-w-0 shrink-0 w-44 md:w-48">
          {match.hero.image_url ? (
            <picture>
              <img
                src={match.hero.image_url}
                alt={match.hero.name}
                className="h-8 w-14 object-cover rounded-[2px] border border-black/80 shrink-0 shadow-xs"
              />
            </picture>
          ) : (
            <div className="h-8 w-14 bg-[#1e1913] flex items-center justify-center text-[9px] text-[#8e857b] rounded-[2px] shrink-0">
              Hero
            </div>
          )}
          <div className="min-w-0">
            <span className="font-chakra text-xs font-bold text-white block truncate leading-tight">
              {match.hero.name}
            </span>
            <div className="flex items-center gap-1 font-chakra text-[10px] text-[#8e857b] mt-0.5">
              <span className={isRadiant ? "text-[#00c8f8] font-semibold" : "text-rose-400 font-semibold"}>
                {isRadiant ? "Radiant" : "Dire"}
              </span>
              <span>•</span>
              <span className="truncate">{match.round_name || "Match"}</span>
            </div>
          </div>
        </div>

        {/* 2. Result Badge */}
        <div className="shrink-0 text-center">
          <span
            className={`inline-block px-2.5 py-0.5 font-chakra text-[10px] font-black uppercase tracking-wider border rounded-xs whitespace-nowrap ${
              won
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                : "border-rose-500/50 bg-rose-500/15 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.15)]"
            }`}
          >
            {won ? "Victoria" : "Derrota"}
          </span>
        </div>

        {/* 3. Matchup: Player Team vs Rival Team */}
        <div className="flex-1 flex items-center justify-center gap-2 min-w-0 px-2">
          {/* Player Team (Left) */}
          <Link
            href={match.player_team.slug ? `/teams/${match.player_team.slug}` : "#"}
            title={`Ver equipo ${match.player_team.name}`}
            className="group/pt flex items-center gap-1.5 min-w-0 justify-end flex-1 hover:opacity-90 transition-opacity"
          >
            <span className="font-chakra text-xs font-bold uppercase text-[#f0d38f] group-hover/pt:text-[#ffd700] truncate text-right">
              {match.player_team.name}
            </span>
            {match.player_team.logo_url ? (
              <picture>
                <img
                  src={match.player_team.logo_url}
                  alt={match.player_team.name}
                  className="h-7 w-7 object-contain rounded-full border border-[#ffd700]/40 bg-[#120f0a] p-0.5 shrink-0 group-hover/pt:border-[#ffd700] transition-colors"
                />
              </picture>
            ) : (
              <div className="h-7 w-7 rounded-full border border-[#ffd700]/40 bg-[#120f0a] flex items-center justify-center shrink-0">
                <IconShield size={14} className="text-[#ffd700]" />
              </div>
            )}
          </Link>

          {/* Scores Pill */}
          <div className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 bg-[#100d0a] border border-[#2d261e] rounded-xs font-mono text-xs font-black shadow-inner">
            <span className="text-white">{match.player_team.score}</span>
            <span className="text-[#8e857b] font-normal text-[10px]">-</span>
            <span className="text-zinc-400">{match.rival_team.score}</span>
          </div>

          {/* Rival Team (Right) */}
          <Link
            href={match.rival_team.slug ? `/teams/${match.rival_team.slug}` : "#"}
            title={`Ver equipo ${match.rival_team.name}`}
            className="group/rt flex items-center gap-1.5 min-w-0 justify-start flex-1 hover:opacity-90 transition-opacity"
          >
            {match.rival_team.logo_url ? (
              <picture>
                <img
                  src={match.rival_team.logo_url}
                  alt={match.rival_team.name}
                  className="h-7 w-7 object-contain rounded-full border border-[#2d261e] bg-[#120f0a] p-0.5 shrink-0 group-hover/rt:border-[#00c8f8] transition-colors"
                />
              </picture>
            ) : (
              <div className="h-7 w-7 rounded-full border border-[#2d261e] bg-[#120f0a] flex items-center justify-center shrink-0">
                <IconShield size={14} className="text-[#8e857b]" />
              </div>
            )}
            <span className="font-chakra text-xs font-semibold uppercase text-[#c7bcab] group-hover/rt:text-white truncate text-left">
              {match.rival_team.name}
            </span>
          </Link>
        </div>

        {/* 4. Stats: KDA + Duration */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right font-chakra">
            <span className="block text-xs font-bold text-white tracking-wide whitespace-nowrap">
              <span className="text-emerald-400">{match.stats.kills}</span> /{" "}
              <span className="text-rose-400">{match.stats.deaths}</span> /{" "}
              <span className="text-[#f0d38f]">{match.stats.assists}</span>
            </span>
            <span className="text-[9px] font-mono font-bold text-[#8e857b] uppercase block">
              {match.stats.kda.toFixed(1)} KDA
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px] text-[#8e857b] border-l border-[#2d261e] pl-2.5 shrink-0 whitespace-nowrap">
            <IconClock size={12} />
            <span>{match.duration_formatted}</span>
          </div>
        </div>

        {/* 5. Button "Ver" */}
        <div className="shrink-0 pl-1">
          <Link
            href={`/game/${match.game_slug}`}
            title={`Ver detalles de la partida con ${match.hero.name}`}
            className="inline-flex items-center gap-1 border border-[#00c8f8]/60 bg-[#00c8f8]/10 hover:bg-[#00c8f8] text-[#6cc4ff] hover:text-black px-2.5 sm:px-3 py-1 text-[11px] font-chakra font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(0,200,248,0.15)] hover:shadow-[0_0_15px_rgba(0,200,248,0.4)] cursor-pointer"
            style={{ clipPath: "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)" }}
          >
            <span>Ver</span>
            <IconArrowUpRight size={13} stroke={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
