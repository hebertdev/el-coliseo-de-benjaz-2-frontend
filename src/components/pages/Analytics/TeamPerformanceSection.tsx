"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconUsers,
  IconArrowUpRight,
} from "@tabler/icons-react";
import type { TeamPerformance } from "interfaces/analytics";

interface TeamPerformanceSectionProps {
  teams: TeamPerformance[];
}

type TeamSortKey = "win_rate" | "kill_death_ratio" | "total_kills" | "avg_duration_seconds";

export function TeamPerformanceSection({ teams }: TeamPerformanceSectionProps) {
  const [sortKey, setSortKey] = useState<TeamSortKey>("win_rate");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: TeamSortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false); // Default descending for stats
    }
  };

  const sortedTeams = useMemo(() => {
    const list = [...teams];
    list.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      // Secondary tie breaker: wins then kill_death_ratio
      if (valA === valB) {
        valA = a.wins;
        valB = b.wins;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [teams, sortKey, sortAsc]);

  return (
    <section id="teams" className="mt-14 sm:mt-16 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#2d261e]">
        <div>
          <div className="flex items-center gap-2 font-chakra text-xs font-bold uppercase tracking-[0.2em] text-[#d8b467]">
            <IconUsers size={16} className="text-[#d8b467]" />
            <span>TABLA GENERAL DE EQUIPOS</span>
          </div>
          <h2 className="mt-1 font-cinzel text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
            RENDIMIENTO DE <span className="text-[#f0d38f]">EQUIPOS</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-chakra text-[#a89f91]">
            Estadísticas consolidadas de las 16 escuadras oficiales que compiten en El Coliseo II.
          </p>
        </div>
      </div>

      {/* Table of 16 Teams */}
      <div className="mt-6 overflow-hidden border border-[#2d261e] bg-[#16120d] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-[#2d261e] bg-[#1f1912] font-chakra text-[11px] font-bold uppercase tracking-wider text-[#8e857b]">
                <th className="py-3 px-4 text-center w-12">#</th>
                <th className="py-3 px-4 sticky left-0 bg-[#1f1912] z-10">Equipo</th>
                <th
                  onClick={() => handleSort("win_rate")}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Win Rate</span>
                    {sortKey === "win_rate" && (
                      <span className="text-[#d8b467]">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Partidas (V-D)</th>
                <th
                  onClick={() => handleSort("kill_death_ratio")}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>K/D Ratio</span>
                    {sortKey === "kill_death_ratio" && (
                      <span className="text-[#d8b467]">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("total_kills")}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Bajas / Muertes</span>
                    {sortKey === "total_kills" && (
                      <span className="text-[#d8b467]">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("avg_duration_seconds")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Duración Prom.</span>
                    {sortKey === "avg_duration_seconds" && (
                      <span className="text-[#d8b467]">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#241e17] font-chakra text-xs">
              {sortedTeams.map((team, idx) => {
                const isUndefeated = team.win_rate === 100;
                const isHighWinrate = team.win_rate >= 66;

                return (
                  <tr
                    key={team.slug}
                    className={`hover:bg-[#1f1912]/80 transition-colors ${
                      isUndefeated ? "bg-[#d8b467]/5" : ""
                    }`}
                  >
                    {/* Position */}
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span
                        className={`inline-flex items-center justify-center h-6 w-6 rounded-xs ${
                          idx === 0
                            ? "bg-[#d8b467] text-black font-black"
                            : idx < 4
                            ? "bg-[#2e9df0]/30 text-[#6cc4ff]"
                            : "text-[#8e857b]"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>

                    {/* Team Info */}
                    <td className="py-3 px-4 sticky left-0 bg-[#16120d] z-10 shadow-[2px_0_6px_rgba(0,0,0,0.6)]">
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden border border-[#2d261e] bg-[#120f0a] p-0.5">
                          {team.logo_url ? (
                            <picture>
                              <img
                                src={team.logo_url}
                                alt={team.name}
                                className="h-full w-full object-contain"
                              />
                            </picture>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-cinzel text-xs font-bold text-[#8e857b]">
                              {team.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div>
                          <Link
                            href={`/teams/${encodeURIComponent(team.slug)}`}
                            className="font-bold text-white uppercase hover:text-[#d8b467] transition-colors flex items-center gap-1.5"
                          >
                            <span>{team.name}</span>
                            <IconArrowUpRight size={13} className="text-[#7e756b]" />
                          </Link>
                          <span className="text-[10px] text-[#8e857b] uppercase">{team.tag}</span>
                        </div>
                      </div>
                    </td>

                    {/* Win Rate */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-mono text-sm font-bold ${
                          isUndefeated
                            ? "text-emerald-400"
                            : isHighWinrate
                            ? "text-[#6cc4ff]"
                            : team.win_rate >= 50
                            ? "text-amber-400"
                            : "text-[#ff7373]"
                        }`}
                      >
                        {team.win_rate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Games played (W-L) */}
                    <td className="py-3 px-3 text-center font-mono">
                      <span className="text-white font-semibold">
                        {team.wins}V - {team.losses}D
                      </span>
                      <span className="text-[#7e756b] text-[11px] block">
                        ({team.games_played} jugadas)
                      </span>
                    </td>

                    {/* K/D Ratio */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-cinzel text-sm font-black ${
                          team.kill_death_ratio >= 1.4
                            ? "text-[#f0d38f]"
                            : team.kill_death_ratio >= 1.0
                            ? "text-[#6cc4ff]"
                            : "text-[#8e857b]"
                        }`}
                      >
                        {team.kill_death_ratio.toFixed(2)}
                      </span>
                    </td>

                    {/* Kills / Deaths */}
                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      <span className="text-white font-bold">{team.total_kills}</span>
                      <span className="text-[#7e756b]"> / </span>
                      <span className="text-[#ff7373]">{team.total_deaths}</span>
                    </td>

                    {/* Avg Duration */}
                    <td className="py-3 px-4 text-center font-mono text-white">
                      {team.avg_duration_formatted}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
