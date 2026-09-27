"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconCoins,
  IconSwords,
  IconEye,
  IconFlame,
  IconAward,
  IconCrown,
} from "@tabler/icons-react";
import type { IndividualLeaders, LeaderPlayer } from "interfaces/analytics";
import { getRankMedalUrl } from "helpers/dota";
import { normalizeMediaUrl } from "lib/config";

interface IndividualLeadersSectionProps {
  leaders: IndividualLeaders;
}

const CATEGORIES = [
  {
    key: "mvps",
    title: "Reyes del MVP",
    subtitle: "Partidas dominadas",
    icon: IconCrown,
    color: "#f0d38f",
    accentColor: "text-[#f0d38f]",
    borderColor: "border-[#d8b467]/40",
    getValue: (p: LeaderPlayer) => `${p.mvp_count || 0}`,
    getValueLabel: (p: LeaderPlayer) => `${p.mvp_count === 1 ? "MVP ganado" : "MVPs ganados"}`,
  },
  {
    key: "kda",
    title: "Mayor KDA",
    subtitle: "Eficiencia de combate",
    icon: IconFlame,
    color: "#e51b24",
    accentColor: "text-[#ff7373]",
    borderColor: "border-[#e51b24]/40",
    getValue: (p: LeaderPlayer) => `${p.kda?.toFixed(2)}`,
    getValueLabel: () => "Ratio KDA",
  },
  {
    key: "gpm",
    title: "Mayor GPM",
    subtitle: "Economía y farmeo",
    icon: IconCoins,
    color: "#d8b467",
    accentColor: "text-[#f0d38f]",
    borderColor: "border-[#d8b467]/40",
    getValue: (p: LeaderPlayer) => `${p.avg_gpm}`,
    getValueLabel: () => "Oro / Min",
  },
  {
    key: "killers",
    title: "Top Asesinos",
    subtitle: "Promedio de bajas",
    icon: IconSwords,
    color: "#2e9df0",
    accentColor: "text-[#6cc4ff]",
    borderColor: "border-[#2e9df0]/40",
    getValue: (p: LeaderPlayer) => `${p.avg_kills?.toFixed(1)}`,
    getValueLabel: (p: LeaderPlayer) => `${p.total_kills} totales`,
  },
  {
    key: "vision",
    title: "Reyes de Visión",
    subtitle: "Wards colocados / prom",
    icon: IconEye,
    color: "#00c8f8",
    accentColor: "text-[#00c8f8]",
    borderColor: "border-[#00c8f8]/40",
    getValue: (p: LeaderPlayer) => `${p.avg_wards_placed?.toFixed(1)}`,
    getValueLabel: (p: LeaderPlayer) => `${p.avg_wards_dewarded?.toFixed(1)} dewards`,
  },
] as const;

function LeaderRow({
  player,
  rank,
  category,
  maxVal,
}: {
  player: LeaderPlayer;
  rank: number;
  category: (typeof CATEGORIES)[number];
  maxVal: number;
}) {
  const medalUrl = getRankMedalUrl(player.medal?.rank_tier);
  const rawNum =
    category.key === "mvps"
      ? player.mvp_count || 0
      : category.key === "kda"
      ? player.kda || 0
      : category.key === "gpm"
      ? player.avg_gpm || 0
      : category.key === "killers"
      ? player.avg_kills || 0
      : player.avg_wards_placed || 0;

  const percent = maxVal > 0 ? Math.min(100, Math.round((rawNum / maxVal) * 100)) : 0;

  const isTop1 = rank === 1;
  const isTop2 = rank === 2;
  const isTop3 = rank === 3;

  return (
    <div
      className={`group flex items-center justify-between gap-3 py-2.5 px-2.5 rounded-[2px] transition-all duration-200 border-b border-[#241e17]/60 last:border-0 ${
        isTop1
          ? "bg-[#d8b467]/[0.06] hover:bg-[#d8b467]/[0.12] border-b-[#d8b467]/20"
          : "hover:bg-[#1a1510]"
      }`}
    >
      {/* Left section: Rank + Avatar + Name & Details */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Rank Number */}
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center font-chakra text-[11px] font-black rounded-[2px] ${
            isTop1
              ? "bg-gradient-to-br from-[#f5d77f] to-[#b8860b] text-black shadow-[0_0_8px_rgba(216,180,103,0.35)]"
              : isTop2
              ? "bg-gradient-to-br from-[#e0e0e0] to-[#9e9e9e] text-black"
              : isTop3
              ? "bg-gradient-to-br from-[#cd7f32] to-[#8c501e] text-white"
              : "bg-[#18130e] text-[#8e857b] border border-[#2d261e]"
          }`}
        >
          {rank}
        </div>

        {/* Player Avatar */}
        <div
          className={`relative h-8 w-8 shrink-0 overflow-hidden rounded-[2px] border bg-[#0e0a07] transition-colors ${
            isTop1 ? "border-[#d8b467]/70 ring-1 ring-[#d8b467]/30" : "border-[#2d261e] group-hover:border-[#d8b467]/40"
          }`}
        >
          {player.avatar ? (
            <picture>
              <img
                src={normalizeMediaUrl(player.avatar) || player.avatar}
                alt={player.nickname}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </picture>
          ) : (
            <div className="flex h-full w-full items-center justify-center font-cinzel text-[11px] font-bold text-[#8e857b]">
              {player.nickname.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name & Subtitle */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link
              href={`/players/${encodeURIComponent(player.player_slug)}`}
              className="font-chakra text-xs sm:text-[13px] font-bold text-white uppercase hover:text-[#d8b467] transition-colors truncate block min-w-0"
              title={player.nickname}
            >
              {player.nickname}
            </Link>
            {medalUrl && (
              <picture className="shrink-0">
                <img src={medalUrl} alt="Medal" className="h-3.5 w-3.5 object-contain" />
              </picture>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-chakra text-[10px] text-[#7e756b] mt-0.5 min-w-0">
            {player.team_logo_url && (
              <picture className="shrink-0">
                <img
                  src={normalizeMediaUrl(player.team_logo_url) || player.team_logo_url}
                  alt="Team"
                  className="h-3 w-3 object-contain rounded-xs"
                />
              </picture>
            )}
            <span className="text-[#a89f91] font-medium truncate">
              {player.team_tag || player.team_name || `Pos ${player.position}`}
            </span>
            {(player.team_tag || player.team_name) && (
              <>
                <span className="text-[#3d3328]">·</span>
                <span className="text-[#7e756b] shrink-0 font-medium">Pos {player.position}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right section: Value, Label, Progress Bar */}
      <div className="flex flex-col items-end shrink-0 text-right pl-2">
        <span className={`font-cinzel text-sm sm:text-base font-black tracking-tight leading-none ${category.accentColor}`}>
          {category.getValue(player)}
        </span>
        <span className="font-chakra text-[9px] text-[#8e857b] tracking-wider uppercase mt-0.5 whitespace-nowrap">
          {category.getValueLabel(player)}
        </span>
        <div className="w-14 h-1 bg-[#1a140f] mt-1 rounded-full overflow-hidden border border-[#2d261e]/40">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, backgroundColor: category.color }}
          />
        </div>
      </div>
    </div>
  );
}

export function IndividualLeadersSection({ leaders }: IndividualLeadersSectionProps) {
  const getPlayersByCategory = (catKey: (typeof CATEGORIES)[number]["key"]) => {
    switch (catKey) {
      case "mvps":
        return leaders.top_mvps || [];
      case "kda":
        return leaders.top_kda || [];
      case "gpm":
        return leaders.top_gpm || [];
      case "killers":
        return leaders.top_killers || [];
      case "vision":
        return leaders.top_vision || [];
    }
  };

  const availableCategories = CATEGORIES.filter((cat) => {
    const list = getPlayersByCategory(cat.key);
    return list && list.length > 0;
  });

  const gridColsClass =
    availableCategories.length === 1
      ? "grid-cols-1 max-w-xl mx-auto"
      : availableCategories.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="leaders" className="mt-14 sm:mt-16 scroll-mt-24 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#2d261e] w-full">
        <div>
          <div className="flex items-center gap-2 font-chakra text-xs font-bold uppercase tracking-[0.2em] text-[#d8b467]">
            <IconAward size={16} className="text-[#d8b467]" />
            <span>LÍDERES ESTADÍSTICOS</span>
          </div>
          <h2 className="mt-1 font-cinzel text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
            TOP 5 <span className="text-[#f0d38f]">INDIVIDUAL</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-chakra text-[#a89f91]">
            Los gladiadores que encabezan cada una de las tablas maestras de combate.
          </p>
        </div>
      </div>

      {/* Category Leaderboard Columns: Dynamically spans 100% of container width */}
      <div className={`mt-6 grid w-full gap-4 ${gridColsClass}`}>
        {availableCategories.map((cat, idx) => {
          const players = getPlayersByCategory(cat.key);
          const Icon = cat.icon;
          const maxVal =
            players.length > 0
              ? cat.key === "mvps"
                ? players[0].mvp_count || 1
                : cat.key === "kda"
                ? players[0].kda || 1
                : cat.key === "gpm"
                ? players[0].avg_gpm || 1
                : cat.key === "killers"
                ? players[0].avg_kills || 1
                : players[0].avg_wards_placed || 1
              : 1;

          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="relative flex flex-col justify-between border border-[#2d261e] bg-[#14100c] p-3.5 sm:p-4 shadow-lg hover:border-[#3d3328] transition-all rounded-[2px] w-full"
            >
              {/* Category Color Accent Stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)`,
                }}
              />

              {/* Category Card Header */}
              <div className="flex items-center justify-between border-b border-[#241e17] pb-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="p-2 rounded-[2px] border shrink-0"
                    style={{
                      borderColor: `${cat.color}40`,
                      backgroundColor: `${cat.color}15`,
                    }}
                  >
                    <Icon size={20} style={{ color: cat.color }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-cinzel text-sm sm:text-base md:text-lg font-black uppercase text-white tracking-wide truncate">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-chakra text-[#a89f91] truncate mt-0.5">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Player Rows */}
              <div className="mt-2 flex flex-col divide-y divide-[#241e17]/40">
                {players.slice(0, 5).map((player, pIdx) => (
                  <LeaderRow
                    key={`${cat.key}-${player.player_slug}-${pIdx}`}
                    player={player}
                    rank={pIdx + 1}
                    category={cat}
                    maxVal={maxVal}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
