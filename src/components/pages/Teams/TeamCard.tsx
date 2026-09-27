"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconCrown,
  IconShield,
  IconChevronRight,
  IconUserCheck,
  IconHelpCircle,
  IconSparkles,
  IconSkull,
  IconCheck,
} from "@tabler/icons-react";
import { CountryFlag } from "components/ui/CountryFlag";
import type { TeamData, TeamRosterMemberData } from "interfaces/teams";

const DEFAULT_POSITIONS = [
  { pos: 1, label: "POS 1", roleName: "Carry" },
  { pos: 2, label: "POS 2", roleName: "Midlane" },
  { pos: 3, label: "POS 3", roleName: "Offlane" },
  { pos: 4, label: "POS 4", roleName: "Soft Support" },
  { pos: 5, label: "POS 5", roleName: "Hard Support" },
];

export interface TeamStandingInfo {
  wins: number;
  losses: number;
  status?: string;
  isEliminated?: boolean;
  isQualified?: boolean;
}

export interface TeamCardProps {
  slotNumber: number;
  romanId: string;
  team: TeamData | null;
  roster?: TeamRosterMemberData[];
  isRevealed?: boolean;
  standing?: TeamStandingInfo;
}

export function TeamCard({
  slotNumber,
  romanId,
  team,
  roster = [],
  isRevealed = true,
  standing,
}: TeamCardProps) {
  // ================= CASO 1: EQUIPO CONFIRMADO =================
  if (isRevealed && team) {
    const isEliminated =
      Boolean(standing?.isEliminated) ||
      (standing?.losses ?? 0) >= 3 ||
      standing?.status?.toUpperCase() === "ELIMINATED" ||
      team.status?.toUpperCase() === "ELIMINATED";

    const isQualified =
      !isEliminated &&
      (Boolean(standing?.isQualified) ||
        (standing?.wins ?? 0) >= 3 ||
        standing?.status?.toUpperCase() === "QUALIFIED" ||
        team.status?.toUpperCase() === "QUALIFIED");

    const coachOrStandins = roster.filter(
      (m) => m.role === "COACH" || m.role === "STANDIN"
    );
    const coreActiveCount = roster.filter(
      (m) => m.role !== "COACH" && m.role !== "STANDIN"
    ).length;
    const captain = roster.find((m) => m.role === "CAPTAIN");
    const captainName = captain?.player?.nickname;
    const displayTag = captainName
      ? (captainName.toLowerCase().startsWith("team ") ? captainName : `Team ${captainName}`)
      : (team.tag || "EQP");

    const displayLogo =
      team.logo ||
      captain?.player?.avatar ||
      roster.find((m) => m.player?.avatar)?.player?.avatar ||
      null;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`group relative flex flex-col justify-between border p-4 transition-all duration-300 ${
          isEliminated
            ? "border-rose-950/50 bg-linear-to-b from-[#180f11] via-[#130b0d] to-[#0f090a] hover:border-rose-700/60 hover:shadow-[0_0_24px_rgba(225,29,72,0.18)]"
            : isQualified
            ? "border-emerald-700/40 bg-linear-to-b from-[#0f1812] via-[#0c140e] to-[#0a100c] hover:border-emerald-500/70 hover:shadow-[0_0_24px_rgba(16,185,129,0.2)]"
            : "border-[#d8b467]/35 bg-linear-to-b from-[#1c1712] via-[#16120e] to-[#120f0a] hover:border-[#d8b467]/80 hover:shadow-[0_0_24px_rgba(216,180,103,0.22)]"
        }`}
      >
        {/* Roman Imperial Delicate Frame Corner Gems */}
        <span
          className={`pointer-events-none absolute -top-1 -left-1 z-20 h-2 w-2 rotate-45 border transition-all duration-300 group-hover:scale-125 ${
            isEliminated
              ? "border-rose-700/40 bg-rose-900/40 opacity-60 shadow-[0_0_4px_rgba(225,29,72,0.3)] group-hover:opacity-100 group-hover:bg-rose-600 group-hover:border-rose-400 group-hover:shadow-[0_0_10px_rgba(225,29,72,0.8)]"
              : isQualified
              ? "border-emerald-500/40 bg-emerald-600/40 opacity-60 shadow-[0_0_4px_rgba(16,185,129,0.3)] group-hover:opacity-100 group-hover:bg-emerald-500 group-hover:border-emerald-300 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              : "border-[#6cc4ff]/40 bg-[#2e9df0]/40 opacity-50 shadow-[0_0_4px_rgba(46,157,240,0.3)] group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:border-[#6cc4ff] group-hover:shadow-[0_0_10px_rgba(46,157,240,0.9)]"
          }`}
        />
        <span
          className={`pointer-events-none absolute -top-1 -right-1 z-20 h-2 w-2 rotate-45 border transition-all duration-300 group-hover:scale-125 ${
            isEliminated
              ? "border-rose-700/40 bg-rose-900/40 opacity-60 shadow-[0_0_4px_rgba(225,29,72,0.3)] group-hover:opacity-100 group-hover:bg-rose-600 group-hover:border-rose-400 group-hover:shadow-[0_0_10px_rgba(225,29,72,0.8)]"
              : isQualified
              ? "border-emerald-500/40 bg-emerald-600/40 opacity-60 shadow-[0_0_4px_rgba(16,185,129,0.3)] group-hover:opacity-100 group-hover:bg-emerald-500 group-hover:border-emerald-300 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              : "border-[#6cc4ff]/40 bg-[#2e9df0]/40 opacity-50 shadow-[0_0_4px_rgba(46,157,240,0.3)] group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:border-[#6cc4ff] group-hover:shadow-[0_0_10px_rgba(46,157,240,0.9)]"
          }`}
        />
        <span
          className={`pointer-events-none absolute -bottom-1 -left-1 z-20 h-2 w-2 rotate-45 border transition-all duration-300 group-hover:scale-125 ${
            isEliminated
              ? "border-rose-700/40 bg-rose-900/40 opacity-60 shadow-[0_0_4px_rgba(225,29,72,0.3)] group-hover:opacity-100 group-hover:bg-rose-600 group-hover:border-rose-400 group-hover:shadow-[0_0_10px_rgba(225,29,72,0.8)]"
              : isQualified
              ? "border-emerald-500/40 bg-emerald-600/40 opacity-60 shadow-[0_0_4px_rgba(16,185,129,0.3)] group-hover:opacity-100 group-hover:bg-emerald-500 group-hover:border-emerald-300 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              : "border-[#6cc4ff]/40 bg-[#2e9df0]/40 opacity-50 shadow-[0_0_4px_rgba(46,157,240,0.3)] group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:border-[#6cc4ff] group-hover:shadow-[0_0_10px_rgba(46,157,240,0.9)]"
          }`}
        />
        <span
          className={`pointer-events-none absolute -bottom-1 -right-1 z-20 h-2 w-2 rotate-45 border transition-all duration-300 group-hover:scale-125 ${
            isEliminated
              ? "border-rose-700/40 bg-rose-900/40 opacity-60 shadow-[0_0_4px_rgba(225,29,72,0.3)] group-hover:opacity-100 group-hover:bg-rose-600 group-hover:border-rose-400 group-hover:shadow-[0_0_10px_rgba(225,29,72,0.8)]"
              : isQualified
              ? "border-emerald-500/40 bg-emerald-600/40 opacity-60 shadow-[0_0_4px_rgba(16,185,129,0.3)] group-hover:opacity-100 group-hover:bg-emerald-500 group-hover:border-emerald-300 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              : "border-[#6cc4ff]/40 bg-[#2e9df0]/40 opacity-50 shadow-[0_0_4px_rgba(46,157,240,0.3)] group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:border-[#6cc4ff] group-hover:shadow-[0_0_10px_rgba(46,157,240,0.9)]"
          }`}
        />

        {/* Inner Delicate Engraved Line */}
        <span
          className={`pointer-events-none absolute inset-1.25 border transition-colors ${
            isEliminated
              ? "border-rose-900/20 group-hover:border-rose-700/40"
              : isQualified
              ? "border-emerald-600/20 group-hover:border-emerald-500/40"
              : "border-[#d8b467]/20 group-hover:border-[#d8b467]/50"
          }`}
        />

        <div className="relative z-10">
          {/* Top Bar: Roman Badge + Status / Region */}
          <div
            className={`flex items-center justify-between border-b pb-3 ${
              isEliminated ? "border-rose-950/40" : "border-[#241e17]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center border font-cinzel text-xs font-black ${
                  isEliminated
                    ? "border-rose-900/40 bg-[#221013] text-rose-400/90"
                    : isQualified
                    ? "border-emerald-600/40 bg-[#122216] text-emerald-300"
                    : "border-[#d8b467]/40 bg-[#2d261e] text-[#d8b467]"
                }`}
              >
                {romanId}
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-wider ${
                  isEliminated ? "text-[#8e6e72]" : "text-[#8e857b]"
                }`}
              >
                CUPO {slotNumber}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {isEliminated ? (
                <div className="flex items-center gap-1 border border-rose-600/40 bg-rose-950/80 px-2 py-0.5 font-chakra text-[10px] font-bold text-rose-300 uppercase tracking-wider shadow-[0_0_8px_rgba(225,29,72,0.25)]">
                  <IconSkull size={12} className="text-rose-400 shrink-0" />
                  <span>
                    ELIMINADO{standing ? ` · ${standing.wins}-${standing.losses}` : ""}
                  </span>
                </div>
              ) : isQualified ? (
                <div className="flex items-center gap-1 border border-emerald-500/40 bg-emerald-950/80 px-2 py-0.5 font-chakra text-[10px] font-bold text-emerald-300 uppercase tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                  <IconCheck size={12} className="text-emerald-400 shrink-0" />
                  <span>
                    CLASIFICADO{standing ? ` · ${standing.wins}-${standing.losses}` : ""}
                  </span>
                </div>
              ) : (
                <>
                  {standing && (
                    <span className="border border-[#d8b467]/30 bg-[#d8b467]/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#f0d38f]">
                      {standing.wins}-{standing.losses}
                    </span>
                  )}
                  {team.region && (
                    <span className="border border-[#00c8f8]/30 bg-[#00c8f8]/10 px-2 py-0.5 font-mono text-[9px] font-bold text-[#00c8f8] uppercase">
                      {team.region}
                    </span>
                  )}
                  {team.country && (
                    <span className="flex items-center border border-[#2d261e] bg-[#14100c] px-1.5 py-0.5">
                      <CountryFlag countryCode={team.country} showCode size="xs" />
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Team Header & Logo */}
          <div className="mt-4 flex items-center gap-3.5">
            <Link
              href={`/teams/${team.slug}`}
              className={`relative flex h-14 w-14 shrink-0 items-center justify-center border p-1.5 transition-all overflow-hidden ${
                isEliminated
                  ? "border-rose-950/60 bg-[#140a0c] hover:border-rose-600/70 hover:shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:scale-105"
                  : "border-[#3d3328] bg-[#14100c] hover:border-[#00c8f8] hover:shadow-[0_0_15px_rgba(0,200,248,0.3)] hover:scale-105"
              }`}
              title={`Ver detalles de ${team.name}`}
            >
              {displayLogo ? (
                <picture className="relative h-full w-full">
                  <img
                    src={displayLogo}
                    alt={team.name}
                    width={48}
                    height={48}
                    className={`h-full w-full object-cover filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] transition-all duration-300 ${
                      isEliminated
                        ? "grayscale contrast-125 opacity-70 group-hover:grayscale-0 group-hover:opacity-100"
                        : ""
                    }`}
                  />
                  {isEliminated && (
                    <div className="pointer-events-none absolute inset-0 bg-rose-950/20 group-hover:opacity-0 transition-opacity" />
                  )}
                </picture>
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center transition-colors ${
                    isEliminated
                      ? "text-rose-400/60 group-hover:text-rose-400"
                      : "text-[#d8b467] group-hover:text-[#00c8f8]"
                  }`}
                >
                  <IconShield size={28} className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
                </div>
              )}

              {isEliminated && (
                <div
                  className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-900 border border-rose-600/80 text-rose-200 shadow-xs"
                  title="Equipo Eliminado"
                >
                  <IconSkull size={9} />
                </div>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-mono text-[10px] font-bold truncate max-w-full ${
                    isEliminated ? "text-rose-400/80" : "text-[#00c8f8]"
                  }`}
                >
                  [{displayTag}]
                </span>
                {team.status && !isEliminated && (
                  <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                )}
                {isEliminated && (
                  <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
              <Link href={`/teams/${team.slug}`} className="block">
                <h2
                  className={`truncate font-cinzel text-base font-bold transition-colors ${
                    isEliminated
                      ? "text-[#a89093] line-through decoration-rose-500/80 decoration-2 hover:text-rose-300 group-hover:text-rose-300"
                      : "text-[#f3f3f5] hover:text-[#00c8f8] group-hover:text-[#00c8f8]"
                  }`}
                  title={isEliminated ? `${team.name} (Eliminado)` : team.name}
                >
                  {team.name}
                </h2>
              </Link>
              <p
                className={`truncate font-chakra text-[11px] ${
                  isEliminated ? "text-[#8e7478]" : "text-[#8e857b]"
                }`}
              >
                {team.city ? `${team.city}, ` : ""}
                {team.region_display || team.region}
              </p>
            </div>
          </div>

          {/* Roster 5-Pos Grid */}
          <div
            className={`mt-4 space-y-1 border-t pt-3 ${
              isEliminated ? "border-rose-950/40" : "border-[#241e17]"
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <span
                className={`font-mono text-[9px] font-bold uppercase tracking-wider ${
                  isEliminated ? "text-[#8e7478]" : "text-[#8e857b]"
                }`}
              >
                ROSTER TITULAR (5 POS)
              </span>
              <span
                className={`font-mono text-[9px] ${
                  isEliminated ? "text-rose-400/80" : "text-[#d8b467]"
                }`}
              >
                {coreActiveCount}/5
              </span>
            </div>

            {DEFAULT_POSITIONS.map((defPos) => {
              const member = roster.find(
                (m) =>
                  m.competitive_position === defPos.pos &&
                  m.role !== "COACH" &&
                  m.role !== "STANDIN"
              );

              if (member) {
                const isCaptain = member.role === "CAPTAIN";
                const playerSlug = member.player?.slug || member.player?.nickname;

                if (playerSlug) {
                  return (
                    <Link
                      key={defPos.pos}
                      href={`/players/${encodeURIComponent(playerSlug)}`}
                      className={`group/player flex items-center justify-between border px-2 py-1 text-[11px] transition-all ${
                        isEliminated
                          ? "border-rose-950/40 bg-[#160a0d]/60 hover:border-rose-600/50 hover:bg-rose-950/30 opacity-85 group-hover:opacity-100"
                          : isCaptain
                          ? "border-[#d8b467]/30 bg-[#d8b467]/10 hover:border-[#00c8f8]/60 hover:bg-[#00c8f8]/10"
                          : "border-[#241e17] bg-[#14100c]/60 hover:border-[#00c8f8]/60 hover:bg-[#00c8f8]/10"
                      }`}
                      title={`Ver perfil de ${member.player?.nickname || playerSlug}`}
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                        <span
                          className={`shrink-0 px-1 py-0.2 font-mono text-[8px] font-bold ${
                            isEliminated
                              ? "border border-rose-900/40 bg-rose-950/40 text-rose-300/80"
                              : isCaptain
                              ? "border border-[#d8b467]/50 bg-[#d8b467]/20 text-[#f0d38f]"
                              : "border border-[#2d261e] bg-[#1c1712] text-[#a8a197]"
                          }`}
                        >
                          {defPos.label}
                        </span>
                        <span
                          className={`truncate font-chakra text-[11px] font-medium transition-colors ${
                            isEliminated
                              ? "text-[#c2a7aa] group-hover/player:text-rose-300 group-hover/player:underline"
                              : isCaptain
                              ? "text-[#f3f3f5] font-semibold group-hover/player:text-[#00c8f8] group-hover/player:underline"
                              : "text-[#d8d2c7] group-hover/player:text-[#00c8f8] group-hover/player:underline"
                          }`}
                        >
                          {member.player?.nickname || "Gladiador"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {member.player?.country && (
                          <CountryFlag countryCode={member.player.country} showCode size="xs" />
                        )}
                        {isCaptain ? (
                          <IconCrown
                            size={12}
                            className={isEliminated ? "text-rose-400/80" : "text-[#f0d38f]"}
                            title="Capitán"
                          />
                        ) : (
                          <IconUserCheck
                            size={11}
                            className={isEliminated ? "text-rose-400/60" : "text-[#6cc4ff]/80"}
                          />
                        )}
                      </div>
                    </Link>
                  );
                }

                return (
                  <div
                    key={defPos.pos}
                    className={`flex items-center justify-between border px-2 py-1 text-[11px] transition-colors ${
                      isEliminated
                        ? "border-rose-950/40 bg-[#160a0d]/60 opacity-85"
                        : isCaptain
                        ? "border-[#d8b467]/30 bg-[#d8b467]/10"
                        : "border-[#241e17] bg-[#14100c]/60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                      <span
                        className={`shrink-0 px-1 py-0.2 font-mono text-[8px] font-bold ${
                          isEliminated
                            ? "border border-rose-900/40 bg-rose-950/40 text-rose-300/80"
                            : isCaptain
                            ? "border border-[#d8b467]/50 bg-[#d8b467]/20 text-[#f0d38f]"
                            : "border border-[#2d261e] bg-[#1c1712] text-[#a8a197]"
                        }`}
                      >
                        {defPos.label}
                      </span>
                      <span
                        className={`truncate font-chakra text-[11px] font-medium ${
                          isEliminated ? "text-[#c2a7aa]" : "text-[#d8d2c7]"
                        }`}
                      >
                        Gladiador
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCaptain ? (
                        <IconCrown
                          size={12}
                          className={isEliminated ? "text-rose-400/80" : "text-[#f0d38f]"}
                          title="Capitán"
                        />
                      ) : (
                        <IconUserCheck
                          size={11}
                          className={isEliminated ? "text-rose-400/60" : "text-[#6cc4ff]/80"}
                        />
                      )}
                    </div>
                  </div>
                );
              }

              // Posición TBD
              return (
                <div
                  key={defPos.pos}
                  className="flex items-center justify-between border border-dashed border-[#241e17] bg-[#14100c]/30 px-2 py-1 text-[11px] text-[#635a50]"
                >
                  <span className="border border-[#241e17] bg-[#14100c] px-1 py-0.2 font-mono text-[8px] text-[#635a50]">
                    {defPos.label}
                  </span>
                  <span className="font-mono text-[9px] text-[#635a50]">
                    {defPos.roleName} (TBD)
                  </span>
                </div>
              );
            })}

            {/* Coach / Stand-in tags */}
            {coachOrStandins.length > 0 && (
              <div className="pt-1.5 flex flex-wrap gap-1">
                {coachOrStandins.map((extra, idx) => {
                  const playerSlug = extra.player?.slug || extra.player?.nickname;
                  return playerSlug ? (
                    <Link
                      key={idx}
                      href={`/players/${encodeURIComponent(playerSlug)}`}
                      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[9px] font-mono transition-colors group/extra ${
                        isEliminated
                          ? "border-rose-950/40 bg-[#180d10] text-[#a89093] hover:border-rose-600/50 hover:bg-rose-950/30"
                          : "border-[#3d3328] bg-[#181410] text-[#a8a197] hover:border-[#00c8f8] hover:bg-[#00c8f8]/10"
                      }`}
                      title={`Ver perfil de ${extra.player?.nickname || playerSlug}`}
                    >
                      <span className={`font-bold ${isEliminated ? "text-rose-400/80" : "text-[#d8b467]"}`}>
                        {extra.role_display || extra.role}:
                      </span>
                      {extra.player?.country && (
                        <CountryFlag countryCode={extra.player.country} size="xs" />
                      )}
                      <span
                        className={`truncate max-w-27.5 transition-colors ${
                          isEliminated
                            ? "text-[#d4b2b4] group-hover/extra:text-rose-300 group-hover/extra:underline"
                            : "text-[#f3f3f5] group-hover/extra:text-[#00c8f8] group-hover/extra:underline"
                        }`}
                      >
                        {extra.player?.nickname || "TBD"}
                      </span>
                    </Link>
                  ) : (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[9px] font-mono ${
                        isEliminated
                          ? "border-rose-950/40 bg-[#180d10] text-[#a89093]"
                          : "border-[#3d3328] bg-[#181410] text-[#a8a197]"
                      }`}
                    >
                      <span className={`font-bold ${isEliminated ? "text-rose-400/80" : "text-[#d8b467]"}`}>
                        {extra.role_display || extra.role}:
                      </span>
                      <span className={`truncate max-w-27.5 ${isEliminated ? "text-[#d4b2b4]" : "text-[#f3f3f5]"}`}>
                        TBD
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Link Button to /teams/[teamslug] */}
        <div
          className={`mt-4 pt-3 border-t ${
            isEliminated ? "border-rose-950/40" : "border-[#241e17]"
          }`}
        >
          <Link
            href={`/teams/${team.slug}`}
            className={`flex items-center justify-between w-full border px-3 py-2 font-chakra text-xs font-bold uppercase tracking-wider transition-all ${
              isEliminated
                ? "border-rose-950/50 bg-[#160b0e] text-[#b89fa2] hover:border-rose-600/70 hover:bg-rose-950/40 hover:text-rose-200"
                : "border-[#2d261e] bg-[#18140f] text-[#d8d2c7] hover:border-[#00c8f8] hover:bg-[#00c8f8]/10 hover:text-[#00c8f8]"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {isEliminated && <IconSkull size={13} className="text-rose-500/80 shrink-0" />}
              <span>{isEliminated ? "Historial y Stats" : "Ver Perfil y Stats"}</span>
            </span>
            <IconChevronRight size={14} className={isEliminated ? "text-rose-400" : ""} />
          </Link>
        </div>
      </motion.div>
    );
  }

  // ================= CASO 2: CUPO VACÍO / TBD =================
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex flex-col justify-between border border-[#d8b467]/25 bg-linear-to-b from-[#14100c]/80 to-[#0e0b08]/90 p-4 transition-all duration-300 hover:border-[#d8b467]/60 hover:shadow-[0_0_20px_rgba(216,180,103,0.15)]"
    >
      {/* Roman Imperial Delicate Frame Corner Gems */}
      <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#6cc4ff]/30 bg-[#2e9df0]/30 opacity-40 shadow-[0_0_3px_rgba(46,157,240,0.2)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:border-[#6cc4ff] group-hover:shadow-[0_0_8px_rgba(46,157,240,0.8)] group-hover:scale-125" />
      <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#6cc4ff]/30 bg-[#2e9df0]/30 opacity-40 shadow-[0_0_3px_rgba(46,157,240,0.2)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:border-[#6cc4ff] group-hover:shadow-[0_0_8px_rgba(46,157,240,0.8)] group-hover:scale-125" />
      <span className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#6cc4ff]/30 bg-[#2e9df0]/30 opacity-40 shadow-[0_0_3px_rgba(46,157,240,0.2)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:border-[#6cc4ff] group-hover:shadow-[0_0_8px_rgba(46,157,240,0.8)] group-hover:scale-125" />
      <span className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#6cc4ff]/30 bg-[#2e9df0]/30 opacity-40 shadow-[0_0_3px_rgba(46,157,240,0.2)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:border-[#6cc4ff] group-hover:shadow-[0_0_8px_rgba(46,157,240,0.8)] group-hover:scale-125" />

      {/* Inner Delicate Gold Engraved Line */}
      <span className="pointer-events-none absolute inset-1.25 border border-[#d8b467]/15 transition-colors group-hover:border-[#d8b467]/40" />

      <div className="relative z-10">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#241e17] pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center border border-[#2d261e] bg-[#18140f] font-cinzel text-xs font-bold text-[#635a50]">
              {romanId}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#635a50]">
              CUPO {slotNumber}
            </span>
          </div>
          <span className="border border-[#2d261e] bg-[#18140f] px-2 py-0.5 font-mono text-[9px] font-bold text-[#8e857b] uppercase">
            TBD
          </span>
        </div>

        {/* Misterio Draft Box */}
        <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center border border-[#2d261e] bg-[#18140f] text-[#635a50]">
            <IconHelpCircle size={28} className="animate-pulse" />
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d8b467]/20 text-[#d8b467]">
              <IconSparkles size={10} />
            </div>
          </div>

          <h3 className="mt-3 font-cinzel text-sm font-bold uppercase tracking-wider text-[#8e857b]">
            POR ANUNCIAR
          </h3>
          <p className="mt-1 max-w-45 font-chakra text-[11px] text-[#635a50]">
            Equipo clasificado o invitado pendiente de confirmación oficial.
          </p>
        </div>

        {/* Empty Roster Placeholders */}
        <div className="mt-4 space-y-1 border-t border-[#241e17] pt-3">
          {DEFAULT_POSITIONS.map((defPos) => (
            <div
              key={defPos.pos}
              className="flex items-center justify-between border border-dashed border-[#1f1913] bg-[#120f0a]/40 px-2 py-1 text-[11px] text-[#4d443b]"
            >
              <span className="font-mono text-[8px]">{defPos.label}</span>
              <span className="font-mono text-[9px]">EN DRAFT...</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#1f1913]">
        <div className="flex items-center justify-center py-1.5 font-mono text-[10px] text-[#635a50] uppercase tracking-wider">
          SORPRESA DEL DRAFT
        </div>
      </div>
    </motion.div>
  );
}

