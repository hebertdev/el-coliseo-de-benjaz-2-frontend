"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { TextInput } from "@mantine/core";
import {
  IconSearch,
  IconShield,
  IconCrown,
  IconFlame,
} from "@tabler/icons-react";
import type { PlayersByPosition, PositionPlayer } from "interfaces/analytics";
import { CountryFlag } from "components/ui/CountryFlag";
import { getRankMedalUrl, formatSpanishCompact } from "helpers/dota";
import { normalizeMediaUrl } from "lib/config";

interface PositionRankingsSectionProps {
  playersByPosition: PlayersByPosition;
}

const POSITIONS = [
  { key: "carry", label: "Pos 1 · Safe Lane Carry", shortLabel: "Pos 1 Carry", icon: "⚔️" },
  { key: "mid", label: "Pos 2 · Mid Lane", shortLabel: "Pos 2 Mid", icon: "👑" },
  { key: "offlane", label: "Pos 3 · Offlane", shortLabel: "Pos 3 Offlane", icon: "🛡️" },
  { key: "soft_support", label: "Pos 4 · Soft Support", shortLabel: "Pos 4 Soft Supp", icon: "⚡" },
  { key: "hard_support", label: "Pos 5 · Hard Support", shortLabel: "Pos 5 Hard Supp", icon: "👁️" },
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

type SortKey = "rank" | "score" | "win_rate" | "kda" | "avg_gpm" | "avg_hero_damage" | "avg_kills";

export function PositionRankingsSection({ playersByPosition }: PositionRankingsSectionProps) {
  const [selectedPos, setSelectedPos] = useState<(typeof POSITIONS)[number]["key"]>("carry");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "rank");
    }
  };

  const rawList: PositionPlayer[] = useMemo(() => {
    return playersByPosition[selectedPos] || [];
  }, [playersByPosition, selectedPos]);

  const filteredAndSortedList = useMemo(() => {
    let list = [...rawList];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.nickname.toLowerCase().includes(term) ||
          p.team.name.toLowerCase().includes(term) ||
          p.team.tag.toLowerCase().includes(term) ||
          (p.country && p.country.toLowerCase().includes(term))
      );
    }

    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      switch (sortKey) {
        case "rank":
          valA = a.rank;
          valB = b.rank;
          break;
        case "score":
          valA = a.score ?? 0;
          valB = b.score ?? 0;
          break;
        case "win_rate":
          valA = a.stats.win_rate;
          valB = b.stats.win_rate;
          break;
        case "kda":
          valA = a.stats.kda;
          valB = b.stats.kda;
          break;
        case "avg_gpm":
          valA = a.stats.avg_gpm;
          valB = b.stats.avg_gpm;
          break;
        case "avg_hero_damage":
          valA = a.stats.avg_hero_damage;
          valB = b.stats.avg_hero_damage;
          break;
        case "avg_kills":
          valA = a.stats.avg_kills;
          valB = b.stats.avg_kills;
          break;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [rawList, searchTerm, sortKey, sortAsc]);

  return (
    <section id="positions" className="mt-14 sm:mt-16 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#2d261e]">
        <div>
          <div className="flex items-center gap-2 font-chakra text-xs font-bold uppercase tracking-[0.2em] text-[#00c8f8]">
            <IconShield size={16} className="text-[#00c8f8]" />
            <span>TABLA DE POSICIONES</span>
          </div>
          <h2 className="mt-1 font-cinzel text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
            RANKING POR <span className="text-[#00c8f8]">ROL &amp; POSICIÓN</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-chakra text-[#a89f91]">
            Comparativa detallada con índice CRI ponderado por volumen de partidas, rendimiento de rol y fase alcanzada en el torneo.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72">
          <TextInput
            placeholder="Buscar jugador o equipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            leftSection={<IconSearch size={16} className="text-[#00c8f8]" />}
            size="sm"
            styles={{
              input: {
                background: "#1c1712",
                border: "1px solid #2d261e",
                color: "#ffffff",
                fontSize: "0.75rem",
                height: "2.5rem",
                "&::placeholder": { color: "#7e756b" },
                "&:focus": {
                  borderColor: "#00c8f8",
                  boxShadow: "0 0 0 1px #00c8f8",
                  outline: "none",
                },
              },
            }}
          />
        </div>
      </div>

      {/* Position Selector Tabs */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {POSITIONS.map((pos) => {
          const isActive = selectedPos === pos.key;
          const count = playersByPosition[pos.key]?.length || 0;
          return (
            <button
              key={pos.key}
              type="button"
              onClick={() => {
                setSelectedPos(pos.key);
                setSortKey("rank");
                setSortAsc(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 font-chakra text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                isActive
                  ? "border-[#00c8f8] bg-[#00c8f8]/15 text-[#6cc4ff] shadow-[0_0_15px_rgba(0,200,248,0.2)]"
                  : "border-[#2d261e] bg-[#16120d] text-[#a89f91] hover:border-[#2e9df0]/60 hover:text-white"
              }`}
            >
              <span>{pos.icon}</span>
              <span>{pos.shortLabel}</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-xs bg-[#241e17] text-[#8e857b]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Data Table */}
      <div className="mt-4 overflow-hidden border border-[#2d261e] bg-[#16120d] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="border-b border-[#2d261e] bg-[#1f1912] font-chakra text-[11px] font-bold uppercase tracking-wider text-[#8e857b]">
                <th
                  onClick={() => handleSort("rank")}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-center w-12"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>#</span>
                    {sortKey === "rank" && (
                      <span className="text-[#00c8f8]">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th className="py-3 px-4 sticky left-0 bg-[#1f1912] z-10">Jugador</th>
                <th className="py-3 px-3">Equipo</th>
                <th
                  onClick={() => handleSort("score")}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <IconFlame size={13} className="text-[#d8b467]" />
                    <span>Impacto CRI</span>
                    {sortKey === "score" && (
                      <span className="text-[#00c8f8]">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("win_rate")}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Win Rate</span>
                    {sortKey === "win_rate" && (
                      <span className="text-[#00c8f8]">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("kda")}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>KDA</span>
                    {sortKey === "kda" && (
                      <span className="text-[#00c8f8]">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("avg_kills")}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>K / D / A</span>
                    {sortKey === "avg_kills" && (
                      <span className="text-[#00c8f8]">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("avg_gpm")}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>GPM / XPM</span>
                    {sortKey === "avg_gpm" && (
                      <span className="text-[#00c8f8]">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("avg_hero_damage")}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Daño Héroe</span>
                    {sortKey === "avg_hero_damage" && (
                      <span className="text-[#00c8f8]">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Daño Torres</th>
                <th className="py-3 px-3 text-center">Visión (W/D)</th>
                <th className="py-3 px-3 text-center">Stuns / Stacks</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#241e17] font-chakra text-xs">
              {filteredAndSortedList.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-[#8e857b]">
                    No se encontraron jugadores que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredAndSortedList.map((player) => {
                  const medalUrl = getRankMedalUrl(player.medal.rank_tier);
                  const isRank1 = player.rank === 1;
                  const mvpCount = player.stats.mvp_count || 0;
                  const placementBadge = getPlacementBadge(player.placement_status);
                  const isLowVolume = player.is_standin || player.stats.games_played <= 2;

                  return (
                    <tr
                      key={player.player_slug}
                      className={`hover:bg-[#1f1912]/80 transition-colors ${
                        isRank1 ? "bg-[#d8b467]/5" : ""
                      }`}
                    >
                      {/* Rank Number */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-white">
                        <span
                          className={`inline-flex items-center justify-center h-6 w-6 rounded-xs ${
                            isRank1
                              ? "bg-[#d8b467] text-black font-black"
                              : player.rank <= 3
                              ? "bg-[#2e9df0]/30 text-[#6cc4ff]"
                              : "text-[#8e857b]"
                          }`}
                        >
                          {player.rank}
                        </span>
                      </td>

                      {/* Player Info (Sticky) */}
                      <td className="py-3 px-4 sticky left-0 bg-[#16120d] z-10 shadow-[2px_0_6px_rgba(0,0,0,0.6)] min-w-[190px]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden border border-[#2d261e] bg-[#120f0a]">
                            {player.avatar ? (
                              <picture>
                                <img
                                  src={normalizeMediaUrl(player.avatar) || player.avatar}
                                  alt={player.nickname}
                                  className="h-full w-full object-cover"
                                />
                              </picture>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-cinzel text-xs font-bold text-[#8e857b]">
                                {player.nickname.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {player.country && (
                                <CountryFlag countryCode={player.country} size="xs" />
                              )}
                              <Link
                                href={`/players/${encodeURIComponent(player.player_slug)}`}
                                className="font-bold text-white uppercase hover:text-[#d8b467] transition-colors truncate block min-w-0"
                              >
                                {player.nickname}
                              </Link>
                              {isLowVolume && (
                                <span
                                  className="inline-flex items-center px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[9px] font-bold rounded-xs shrink-0"
                                  title={`Jugador suplente o muestra reducida (${player.stats.games_played} PJ)`}
                                >
                                  {player.stats.games_played <= 2 ? `${player.stats.games_played}P` : "Suplente"}
                                </span>
                              )}
                              {mvpCount > 0 && (
                                <span
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#d8b467]/15 border border-[#d8b467]/35 text-[#f0d38f] text-[10px] font-bold rounded-xs shrink-0"
                                  title={`${mvpCount} MVP${mvpCount > 1 ? "s" : ""} conseguido${mvpCount > 1 ? "s" : ""}`}
                                >
                                  <IconCrown size={12} className="text-[#f0d38f] shrink-0" />
                                  <span>{mvpCount}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-[10px] text-[#8e857b] truncate">
                              {medalUrl && (
                                <picture className="shrink-0">
                                  <img
                                    src={medalUrl}
                                    alt="Medal"
                                    className="h-3 w-3 object-contain"
                                  />
                                </picture>
                              )}
                              <span className="truncate">{player.medal.medal_title || "Immortal"}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Team */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {player.team.logo_url && (
                            <picture className="shrink-0">
                              <img
                                src={normalizeMediaUrl(player.team.logo_url) || player.team.logo_url}
                                alt={player.team.name}
                                className="h-4 w-4 object-contain"
                              />
                            </picture>
                          )}
                          <Link
                            href={`/teams/${encodeURIComponent(player.team.slug)}`}
                            className="text-[#a89f91] hover:text-white transition-colors truncate text-[11px] font-semibold"
                          >
                            {player.team.name}
                          </Link>
                          {placementBadge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-xs border font-bold uppercase tracking-wider shrink-0 ${placementBadge.color}`}
                            >
                              {placementBadge.label}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Impacto CRI */}
                      <td className="py-3 px-3 text-center">
                        {player.score !== undefined ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#d8b467]/10 border border-[#d8b467]/30">
                            <IconFlame size={12} className="text-[#d8b467] shrink-0" />
                            <span className="font-mono font-black text-xs text-[#f0d38f]">
                              {player.score.toFixed(0)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#7e756b]">-</span>
                        )}
                      </td>

                      {/* Win Rate */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-mono font-bold ${
                            player.stats.win_rate >= 60
                              ? "text-emerald-400"
                              : player.stats.win_rate >= 50
                              ? "text-[#6cc4ff]"
                              : "text-[#ff7373]"
                          }`}
                        >
                          {player.stats.win_rate.toFixed(1)}%
                        </span>
                        <div className="text-[10px] text-[#7e756b]">
                          {player.stats.wins}V - {player.stats.losses}D
                        </div>
                      </td>

                      {/* KDA */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-cinzel font-black text-[#f0d38f] text-sm">
                          {player.stats.kda.toFixed(2)}
                        </span>
                      </td>

                      {/* K / D / A Avg */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-white text-[11px]">
                          {player.stats.avg_kills} / {player.stats.avg_deaths} /{" "}
                          {player.stats.avg_assists}
                        </span>
                        <div className="text-[10px] text-[#7e756b]">
                          {player.stats.total_kills} kills tot
                        </div>
                      </td>

                      {/* GPM / XPM */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-[#2e9df0]">
                          {player.stats.avg_gpm}
                        </span>
                        <span className="text-[#8e857b] text-[10px]"> / {player.stats.avg_xpm}</span>
                      </td>

                      {/* Hero Damage */}
                      <td className="py-3 px-3 text-center font-mono text-white">
                        {formatSpanishCompact(player.stats.avg_hero_damage)}
                      </td>

                      {/* Tower Damage */}
                      <td className="py-3 px-3 text-center font-mono text-[#c7bcab]">
                        {formatSpanishCompact(player.stats.avg_tower_damage)}
                      </td>

                      {/* Vision: Wards / Dewards */}
                      <td className="py-3 px-3 text-center font-mono text-[11px]">
                        <span className="text-[#00c8f8]">{player.stats.avg_wards_placed.toFixed(1)}</span>
                        <span className="text-[#7e756b]"> / </span>
                        <span className="text-[#ff7373]">{player.stats.avg_wards_dewarded.toFixed(1)}</span>
                      </td>

                      {/* Stuns / Stacks */}
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-[#c7bcab]">
                        <span>{player.stats.avg_stuns_seconds.toFixed(1)}s</span>
                        <span className="text-[#7e756b]"> | </span>
                        <span>{player.stats.avg_camps_stacked.toFixed(1)}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
