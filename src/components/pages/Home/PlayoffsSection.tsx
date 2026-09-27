"use client";

import { useState, useEffect } from "react";
import {
  IconCrown,
  IconSwords,
  IconFlame,
  IconMedal,
  IconShield,
  IconInfoCircle,
} from "@tabler/icons-react";
import { getPlayoffsStageAPI } from "services/stages";
import type {
  PlayoffStageData,
  PlayoffBracketMatch,
  PlayoffBracketSlot,
  PlayoffThirdPlaceMatch,
} from "interfaces/stages";
import { PlayoffMatchModal } from "./PlayoffMatchModal";
import { ChampionModal } from "components/ChampionModal";
import backgroundDecoration2 from "assets/background_decoration2.webp";

interface PlayoffsSectionProps {
  initialData?: PlayoffStageData | null;
}

function formatPlaceholder(placeholder?: string | null, seed?: number | null): string {
  if (!placeholder) {
    if (seed !== null && seed !== undefined) return `Clasificado #${seed} (Fase Suiza)`;
    return "Por determinar";
  }
  let str = placeholder;
  str = str.replace(/\bSeed\s+(\d+)/gi, "Clasificado #$1 (Fase Suiza)");
  str = str.replace(/\bSemilla\s+(\d+)/gi, "Clasificado #$1 (Fase Suiza)");
  str = str.replace(/\bTBD\b/gi, "Por determinar");
  return str;
}

function isStatusOngoing(status?: string | null): boolean {
  if (!status) return false;
  const s = status.trim().toUpperCase();
  return s === "ONGOING" || s === "LIVE" || s === "IN_PROGRESS" || s === "EN CURSO" || s === "PLAYING";
}

function isStatusCompleted(status?: string | null): boolean {
  if (!status) return false;
  const s = status.trim().toUpperCase();
  return s === "FINISHED" || s === "COMPLETED" || s === "DONE";
}

export function PlayoffsSection({ initialData }: PlayoffsSectionProps) {
  const [stageData, setStageData] = useState<PlayoffStageData | null>(initialData || null);
  const [activeTeamSlug, setActiveTeamSlug] = useState<string | null>(null);
  const [selectedModalMatch, setSelectedModalMatch] = useState<{
    match: PlayoffBracketMatch | PlayoffThirdPlaceMatch;
    roundName: string;
  } | null>(null);
  const [isChampionModalOpen, setIsChampionModalOpen] = useState(false);
  // Solo abrir modal de campeón si la URL contiene explícitamente ?campeon=1 o #campeon
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get("campeon") === "1" ||
        params.get("champion") === "1" ||
        window.location.hash === "#campeon" ||
        window.location.hash === "#champion"
      ) {
        setTimeout(() => {
          setIsChampionModalOpen(true);
        }, 100);
      }
    }
  }, []);

  useEffect(() => {
    if (initialData && initialData.rounds && initialData.rounds.length > 0) {
      return;
    }
    async function loadPlayoffs() {
      try {
        const data = await getPlayoffsStageAPI();
        if (data) setStageData(data);
      } catch (err) {
        console.error("Error al cargar playoffs:", err);
      }
    }
    loadPlayoffs();
  }, [initialData]);

  // Helper to merge bracket match with full round match data if available
  const findFullMatchDetails = (
    match: PlayoffBracketMatch | PlayoffThirdPlaceMatch
  ): PlayoffBracketMatch | PlayoffThirdPlaceMatch => {
    if (!stageData || !stageData.rounds) return match;
    for (const r of stageData.rounds) {
      if (r.matches) {
        const found = r.matches.find((m) => {
          if (m.identifier && m.identifier === match.identifier) return true;
          if (m.match_number && `${m.node_type || "QF"}${m.match_number}` === match.identifier) return true;
          return false;
        });
        if (found) {
          return {
            ...match,
            slug: found.slug || match.slug,
            status: found.status || match.status,
            winner_slug: found.winner_slug || match.winner_slug,
            scheduled_at: found.scheduled_at || match.scheduled_at,
            games: found.games && found.games.length > 0 ? found.games : match.games,
            slot_a: {
              ...match.slot_a,
              team: found.team_a || match.slot_a.team,
              score: found.score_a !== undefined && found.score_a !== null ? found.score_a : match.slot_a.score,
            },
            slot_b: {
              ...match.slot_b,
              team: found.team_b || match.slot_b.team,
              score: found.score_b !== undefined && found.score_b !== null ? found.score_b : match.slot_b.score,
            },
          };
        }
      }
    }
    return match;
  };

  const bracketRounds = stageData?.bracket || [];

  // Round 1: Cuartos
  const qfRound = bracketRounds.find((r) => r.round_number === 1);
  const qfMatches = qfRound?.matches || [
    {
      identifier: "QF1",
      node_type: "QF",
      best_of: "BO3",
      status: "PENDING",
      slot_a: { seed: 1, placeholder: "Clasificado #1 (Fase Suiza)", team: null, score: null },
      slot_b: { seed: 8, placeholder: "Clasificado #8 (Fase Suiza)", team: null, score: null },
    },
    {
      identifier: "QF2",
      node_type: "QF",
      best_of: "BO3",
      status: "PENDING",
      slot_a: { seed: 4, placeholder: "Clasificado #4 (Fase Suiza)", team: null, score: null },
      slot_b: { seed: 5, placeholder: "Clasificado #5 (Fase Suiza)", team: null, score: null },
    },
    {
      identifier: "QF3",
      node_type: "QF",
      best_of: "BO3",
      status: "PENDING",
      slot_a: { seed: 2, placeholder: "Clasificado #2 (Fase Suiza)", team: null, score: null },
      slot_b: { seed: 7, placeholder: "Clasificado #7 (Fase Suiza)", team: null, score: null },
    },
    {
      identifier: "QF4",
      node_type: "QF",
      best_of: "BO3",
      status: "PENDING",
      slot_a: { seed: 3, placeholder: "Clasificado #3 (Fase Suiza)", team: null, score: null },
      slot_b: { seed: 6, placeholder: "Clasificado #6 (Fase Suiza)", team: null, score: null },
    },
  ];

  // Round 2: Semifinales
  const sfRound = bracketRounds.find((r) => r.round_number === 2);
  const sfMatches = sfRound?.matches || [
    {
      identifier: "SF1",
      node_type: "SF",
      best_of: "BO3",
      status: "PENDING",
      slot_a: { seed: null, placeholder: "Ganador QF1", team: null, score: null },
      slot_b: { seed: null, placeholder: "Por determinar", team: null, score: null },
    },
    {
      identifier: "SF2",
      node_type: "SF",
      best_of: "BO3",
      status: "PENDING",
      slot_a: { seed: null, placeholder: "Ganador QF3", team: null, score: null },
      slot_b: { seed: null, placeholder: "Por determinar", team: null, score: null },
    },
  ];

  // Round 3: Gran Final
  const gfRound = bracketRounds.find((r) => r.round_number === 3);
  const gfMatch: PlayoffBracketMatch = gfRound?.matches?.[0] || {
    identifier: "GF",
    node_type: "GF",
    best_of: "BO5",
    status: "PENDING",
    slot_a: { seed: null, placeholder: "Ganador SF1", team: null, score: null },
    slot_b: { seed: null, placeholder: "Por determinar", team: null, score: null },
  };

  const getWinsRequired = (bestOf?: string | null): number => {
    const bo = (bestOf || "").toUpperCase().trim();
    if (bo === "BO5") return 3;
    if (bo === "BO3") return 2;
    if (bo === "BO1") return 1;
    return 1;
  };

  // Helper to determine winner
  const getSlotWinner = (match?: PlayoffBracketMatch | PlayoffThirdPlaceMatch | null) => {
    if (!match) return null;

    // 1. If backend explicitly defined winner_slug
    if (match.winner_slug && match.winner_slug.trim()) {
      const wSlug = match.winner_slug.trim().toLowerCase();
      if (match.slot_a.team?.slug?.trim().toLowerCase() === wSlug) return match.slot_a.team;
      if (match.slot_b.team?.slug?.trim().toLowerCase() === wSlug) return match.slot_b.team;
    }

    const st = (match.status || "").toUpperCase().trim();
    const isCompleted = st === "FINISHED" || st === "COMPLETED" || st === "DONE" || st === "WALKOVER";
    const winsRequired = getWinsRequired(match.best_of);

    const scoreA = match.slot_a.score;
    const scoreB = match.slot_b.score;

    // 2. Solo hay ganador si un equipo alcanza la cantidad de mapas requeridos para ganar la serie (ej: 3 en BO5, 2 en BO3)
    if (scoreA !== null && scoreA !== undefined && scoreA >= winsRequired) {
      return match.slot_a.team;
    }
    if (scoreB !== null && scoreB !== undefined && scoreB >= winsRequired) {
      return match.slot_b.team;
    }

    // 3. Si la serie fue cerrada oficialmente por el sistema
    if (isCompleted) {
      if (scoreA !== null && scoreA !== undefined && scoreB !== null && scoreB !== undefined) {
        if (scoreA > scoreB) return match.slot_a.team;
        if (scoreB > scoreA) return match.slot_b.team;
      }
      if (match.slot_a.team && !match.slot_b.team) return match.slot_a.team;
      if (match.slot_b.team && !match.slot_a.team) return match.slot_b.team;
    }

    // Mientras la serie esté en curso (ej: 1-0 en un BO5), NO hay ganador aún
    return null;
  };

  const fullGfMatch = findFullMatchDetails(gfMatch);
  const championTeam = getSlotWinner(fullGfMatch);

  // 3rd Place Match (Batalla por el Honor)
  const thirdPlaceMatch: PlayoffThirdPlaceMatch = stageData?.third_place_match || {
    identifier: "3RD",
    match_name: "Batalla por el Honor (3er Puesto)",
    best_of: "BO3",
    status: "SCHEDULED",
    winner_slug: null,
    slot_a: { seed: null, placeholder: "Perdedor SF 1", team: null, score: null },
    slot_b: { seed: null, placeholder: "Perdedor SF 2", team: null, score: null },
  };

  const isTeamActive = (teamSlug?: string | null, teamName?: string | null) => {
    if (!activeTeamSlug) return false;
    const target = activeTeamSlug.trim().toLowerCase();
    if (teamSlug && teamSlug.trim().toLowerCase() === target) return true;
    if (teamName && teamName.trim().toLowerCase() === target) return true;
    return false;
  };

  const renderSlot = (
    slot: PlayoffBracketSlot,
    match?: PlayoffBracketMatch | PlayoffThirdPlaceMatch,
    bgBase: string = "bg-[#1f1a14]",
    borderBase: string = ""
  ) => {
    const team = slot.team;
    const teamIdentifier = team?.slug || team?.name || null;
    const hasTeam = Boolean(teamIdentifier);
    const isActive = hasTeam && isTeamActive(team?.slug, team?.name);

    const winnerTeam = getSlotWinner(match);
    const isWinner = Boolean(
      winnerTeam &&
        team &&
        ((winnerTeam.slug && team.slug && winnerTeam.slug.trim() === team.slug.trim()) ||
          (winnerTeam.name && team.name && winnerTeam.name.trim() === team.name.trim()))
    );
    const isLoser = Boolean(winnerTeam && !isWinner && team);

    let slotClasses = `flex items-center justify-between px-2.5 py-1.5 transition-all duration-200 select-none ${bgBase} ${borderBase}`;

    if (hasTeam) {
      slotClasses += " cursor-pointer";
    }

    if (activeTeamSlug) {
      if (isActive) {
        slotClasses += ` bg-[#251e15] border-l-2 border-l-[#d8b467]/80 text-white font-bold`;
      } else {
        slotClasses += ` opacity-50`;
      }
    } else {
      if (isWinner) {
        slotClasses += ` bg-[#221c15] text-white border-l-2 border-l-[#53fc18]/60 hover:bg-[#2a2219]`;
      } else if (isLoser) {
        slotClasses += ` text-[#7e756b] hover:bg-[#201a14] hover:text-[#c7bcab]`;
      } else {
        slotClasses += ` text-[#c7bcab] hover:bg-[#282119] hover:text-white`;
      }
    }

    // Color del score
    const getScoreClasses = () => {
      if (activeTeamSlug) {
        return isActive ? "text-[#53fc18] font-black text-sm" : "text-[#8e857b]";
      }
      if (isWinner) {
        return "text-[#53fc18] font-bold";
      }
      if (isLoser) {
        return "text-[#5c544b]";
      }
      return "text-[#8e857b]";
    };

    return (
      <div
        className={slotClasses}
        onMouseEnter={() => hasTeam && teamIdentifier && setActiveTeamSlug(teamIdentifier)}
        onMouseLeave={() => setActiveTeamSlug(null)}
        onClick={(e) => {
          e.stopPropagation();
          if (hasTeam && teamIdentifier) {
            setActiveTeamSlug((prev) => (prev === teamIdentifier ? null : teamIdentifier));
          }
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {team?.logo_url ? (
            <picture>
              <img
                src={team.logo_url}
                alt={team.name}
                className="h-4 w-4 object-contain"
              />
            </picture>
          ) : (
            <IconShield
              size={12}
              className={`shrink-0 ${
                isActive
                  ? "text-[#f0d38f]"
                  : isWinner
                  ? "text-[#53fc18]/80"
                  : "text-[#8e857b]"
              }`}
            />
          )}
          <span
            className={`truncate ${
              isActive
                ? "font-extrabold text-[#f0d38f]"
                : isWinner
                ? "font-bold text-white"
                : isLoser
                ? "text-[#8a8073]"
                : "font-semibold text-[#c7bcab]"
            }`}
          >
            {team?.name || formatPlaceholder(slot.placeholder, slot.seed)}
          </span>
        </div>
        <span className={`font-mono ${getScoreClasses()}`}>
          {slot.score !== null ? slot.score : "-"}
        </span>
      </div>
    );
  };

  const getMatchCardClasses = (match: PlayoffBracketMatch | PlayoffThirdPlaceMatch, defaultBorder: string, defaultBg: string) => {
    const isSlotAActive = isTeamActive(match.slot_a.team?.slug, match.slot_a.team?.name);
    const isSlotBActive = isTeamActive(match.slot_b.team?.slug, match.slot_b.team?.name);
    const hasActiveTeamInMatch = isSlotAActive || isSlotBActive;
    const isOngoing = isStatusOngoing(match.status);

    if (activeTeamSlug) {
      if (hasActiveTeamInMatch) {
        return `border border-[#d8b467]/60 ${defaultBg} shadow-[0_0_10px_rgba(216,180,103,0.12)] transition-all duration-200`;
      }
      return `border border-[#2d261e] ${defaultBg} opacity-50 transition-all duration-200`;
    }

    if (isOngoing) {
      return `border border-[#53fc18]/60 bg-[#0d160b] transition-all hover:border-[#53fc18]`;
    }

    return `${defaultBorder} ${defaultBg} shadow-md transition-all hover:border-[#2e9df0]/60 hover:shadow-[0_4px_20px_rgba(46,157,240,0.2)]`;
  };

  const renderCardStatusBadge = (status?: string | null) => {
    if (isStatusOngoing(status)) {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#53fc18] font-bold px-1.5 py-0.2 bg-[#53fc18]/15 border border-[#53fc18]/50 rounded-xs animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-[#53fc18] animate-ping" />
          EN VIVO
        </span>
      );
    }
    if (isStatusCompleted(status)) {
      return <span className="text-[9px] font-mono text-emerald-400 font-bold">COMPLETADO</span>;
    }
    if (status === "SCHEDULED") {
      return <span className="text-[9px] font-mono text-amber-400 font-bold">PROGRAMADO</span>;
    }
    return <span className="text-[9px] font-mono text-[#7e756b]">PENDIENTE</span>;
  };

  return (
    <section
      id="playoffs"
      className="relative w-full border-t border-[#2d261e] bg-[#0c0a07] py-14 sm:py-20 lg:py-28 text-white overflow-hidden"
      onClick={() => setActiveTeamSlug(null)}
    >
      {/* Background Decorative Image */}
      <picture className="pointer-events-none absolute inset-0 block h-full w-full select-none overflow-hidden">
        <img
          src={backgroundDecoration2.src}
          alt="Fondo decorativo de la arena del Coliseo"
          className="h-full w-full object-cover object-center pointer-events-none opacity-85"
        />
      </picture>

      {/* Soft edge blend for smooth transition with surrounding sections */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#120f0a] via-transparent to-[#120f0a] opacity-75" />
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-72 sm:h-125 w-72 sm:w-125 rounded-full bg-[#2e9df0]/10 blur-[160px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-3 sm:mb-4 flex items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto">
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-[#d8b467]/60 to-[#d8b467]" />
            <div className="flex items-center gap-2 font-chakra text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#f0d38f] drop-shadow-[0_2px_10px_rgba(216,180,103,0.45)]">
              <IconCrown size={15} className="text-[#f0d38f] shrink-0" />
              <span>FASE FINAL · ELIMINACIÓN DIRECTA</span>
              <IconCrown size={15} className="text-[#f0d38f] shrink-0" />
            </div>
            <div className="h-px flex-1 bg-linear-to-l from-transparent via-[#d8b467]/60 to-[#d8b467]" />
          </div>

          <h2 className="mt-4 sm:mt-5 font-coliseo-title text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
            La Arena del <span className="text-[#f0d38f]">Gran Coliseo</span>
          </h2>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base font-medium leading-relaxed text-[#c7bcab]">
            Los 8 gladiadores sobrevivientes de la Fase Suiza entran al cuadro definitivo de eliminación directa.
            Solo un equipo se alzará con el Trono Imperial y la máxima gloria.
          </p>

          {/* Botón interactivo de coronación para ver o reabrir el modal */}
          <div className="mt-4 sm:mt-5 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsChampionModalOpen(true)}
              className="group inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2 sm:py-2.5 border border-[#f0d38f] bg-gradient-to-r from-[#281e13] via-[#3d2c18] to-[#281e13] hover:from-[#3d2c18] hover:to-[#523c21] text-[#ffe494] font-chakra text-xs sm:text-sm font-black uppercase tracking-widest rounded-xs shadow-[0_0_25px_rgba(240,211,143,0.35)] hover:shadow-[0_0_40px_rgba(240,211,143,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <IconCrown size={17} className="text-[#f0d38f] animate-pulse group-hover:rotate-12 transition-transform shrink-0" />
              <span>Ver Coronación del Campeón</span>
              <span className="rounded-xs bg-[#f0d38f]/20 px-2 py-0.5 text-[10px] font-black text-[#f0d38f] tracking-wider border border-[#f0d38f]/40">
                RISING RAGE 🏆
              </span>
            </button>
          </div>
        </div>

        {/* ================= TOURNAMENT BRACKET ================= */}
        <div className="mt-10 sm:mt-16">
          {/* Mobile Swipe Hint */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-4 font-mono text-[11px] text-[#f0d38f] bg-[#1c1712] border border-[#d8b467]/20 py-2 px-4 text-center">
            <span>↔ Desliza horizontalmente para ver todo el Bracket</span>
          </div>

          <div className="overflow-x-auto touch-scroll pb-6">
            <div className="min-w-[860px] lg:min-w-full">
              {/* Bracket Stage Headers */}
              <div className="grid grid-cols-4 gap-6 font-chakra text-xs font-bold uppercase tracking-widest pb-3.5">
                {/* Cuartos */}
                <div className="flex items-center gap-2 text-[#6cc4ff]">
                  <IconSwords size={16} className="text-[#00c8f8]" />
                  <span>Cuartos · {qfRound?.best_of || "BO3"}</span>
                </div>

                {/* Semifinales */}
                <div className="flex items-center gap-2 text-[#6cc4ff]">
                  <IconSwords size={16} className="text-[#00c8f8]" />
                  <span>Semifinales · {sfRound?.best_of || "BO3"}</span>
                </div>

                {/* Gran Final */}
                <div className="flex items-center gap-2 text-[#f0d38f]">
                  <IconFlame size={16} className="text-[#f0d38f]" />
                  <span>Gran Final · {gfMatch.best_of || "BO5"}</span>
                </div>

                {/* El Trono */}
                <div className="flex items-center gap-2 text-[#f0d38f]">
                  <IconCrown size={16} className="text-[#f0d38f]" />
                  <span>El Trono</span>
                </div>
              </div>

              {/* Refined Continuous Divider (Smooth Cyan to Gold Blend with Tapered Edges & Center Nexus Gem) */}
              <div className="relative w-full my-1">
                {/* Subtle base rail */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[#2d261e]/50" />
                {/* Main Smooth Gradient Line */}
                <div className="relative h-px w-full bg-gradient-to-r from-transparent via-[#00c8f8] via-25% via-[#6cc4ff] via-48% via-[#f0d38f] via-52% via-[#d8b467] via-75% to-transparent" />
                {/* Center Imperial Nexus Gem */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rotate-45 border border-[#d8b467] bg-[#16120e] shadow-[0_0_6px_rgba(216,180,103,0.4)]" />
                </div>
              </div>

              {/* Bracket Grid Columns */}
              <div className="mt-8 grid grid-cols-4 gap-6 items-stretch">
                {/* Column 1: Quarter Finals (4 Matchups) */}
                <div className="flex flex-col justify-between gap-6">
                  {qfMatches.map((m) => {
                    const match = findFullMatchDetails(m);
                    return (
                      <div
                        key={match.identifier}
                        className={`p-3.5 ${getMatchCardClasses(match, "border border-[#2d261e]", "bg-[#16120e]")}`}
                      >
                        <div className="mb-2 flex items-center justify-between border-b border-[#241e17] pb-1.5 font-mono text-[9px] text-[#7e756b] flex-wrap gap-1">
                          <span className="font-bold">{match.identifier}</span>
                          <div className="flex items-center gap-1.5">
                            {renderCardStatusBadge(match.status)}
                            <span className="text-[#6cc4ff]">{match.best_of}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedModalMatch({ match, roundName: "Cuartos de Final" });
                              }}
                              className="flex items-center gap-1 text-[9px] text-[#6cc4ff] hover:text-white bg-[#6cc4ff]/10 hover:bg-[#6cc4ff]/30 px-1.5 py-0.5 border border-[#6cc4ff]/40 rounded-xs transition-colors"
                              title="Ver detalle del partido"
                            >
                              <IconInfoCircle size={11} />
                              Detalle
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 font-mono text-xs">
                          {renderSlot(match.slot_a, match, "bg-[#1f1a14]")}
                          {renderSlot(match.slot_b, match, "bg-[#1f1a14]")}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Column 2: Semi Finals (2 Matchups) */}
                <div className="flex flex-col justify-around gap-12">
                  {sfMatches.map((m) => {
                    const match = findFullMatchDetails(m);
                    return (
                      <div
                        key={match.identifier}
                        className={`p-4 ${getMatchCardClasses(match, "border border-[#2d261e]", "bg-[#181410]")}`}
                      >
                        <div className="mb-2 flex items-center justify-between border-b border-[#241e17] pb-1.5 font-mono text-[9px] text-[#7e756b] flex-wrap gap-1">
                          <span className="font-bold">{match.identifier}</span>
                          <div className="flex items-center gap-1.5">
                            {renderCardStatusBadge(match.status)}
                            <span className="text-[#6cc4ff]">{match.best_of}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedModalMatch({ match, roundName: "Semifinales" });
                              }}
                              className="flex items-center gap-1 text-[9px] text-[#6cc4ff] hover:text-white bg-[#6cc4ff]/10 hover:bg-[#6cc4ff]/30 px-1.5 py-0.5 border border-[#6cc4ff]/40 rounded-xs transition-colors"
                              title="Ver detalle del partido"
                            >
                              <IconInfoCircle size={11} />
                              Detalle
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 font-mono text-xs">
                          {renderSlot(match.slot_a, match, "bg-[#241e17]")}
                          {renderSlot(match.slot_b, match, "bg-[#241e17]")}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Column 3: Grand Final (Bo5) */}
                {(() => {
                  const match = fullGfMatch;
                  const isOngoing = isStatusOngoing(match.status);
                  const isCompleted = isStatusCompleted(match.status);
                  return (
                    <div className="flex flex-col justify-center">
                      <div
                        className={`p-5 relative overflow-hidden transition-all duration-200 ${
                          activeTeamSlug
                            ? isTeamActive(match.slot_a.team?.slug, match.slot_a.team?.name) ||
                              isTeamActive(match.slot_b.team?.slug, match.slot_b.team?.name)
                              ? "border border-[#d8b467]/60 bg-linear-to-b from-[#241e17] to-[#14110c] shadow-[0_0_15px_rgba(216,180,103,0.15)]"
                              : "border border-[#2d261e] bg-[#14110c] opacity-50"
                            : isOngoing
                            ? "border-2 border-[#53fc18]/60 bg-[#0d160b]"
                            : isCompleted
                            ? "border-2 border-[#d8b467]/70 bg-linear-to-b from-[#241e17] to-[#14110c] shadow-[0_0_35px_rgba(216,180,103,0.25)]"
                            : "border border-[#2d261e] bg-[#120f0a] hover:border-[#3a3126]"
                        }`}
                      >
                        <div className="mb-3 flex items-center justify-between border-b border-[#d8b467]/30 pb-2 font-mono text-[10px] text-[#f0d38f] flex-wrap gap-1">
                          <span className="font-bold tracking-wider">GRAN FINAL IMPERIAL</span>
                          <div className="flex items-center gap-1.5">
                            {renderCardStatusBadge(match.status)}
                            <span className="border border-[#d8b467]/40 bg-[#d8b467]/20 px-1.5 py-0.5 font-black text-[#f0d38f]">
                              {match.best_of}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedModalMatch({ match, roundName: "Gran Final Imperial" });
                              }}
                              className="flex items-center gap-1 text-[9px] text-[#f0d38f] hover:text-white bg-[#d8b467]/10 hover:bg-[#d8b467]/30 px-1.5 py-0.5 border border-[#d8b467]/40 rounded-xs transition-colors"
                              title="Ver detalle de la Gran Final"
                            >
                              <IconInfoCircle size={11} />
                              Detalle
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2.5 font-mono text-xs">
                          {renderSlot(match.slot_a, match, "bg-[#1c1712]", "border border-[#d8b467]/20")}
                          {renderSlot(match.slot_b, match, "bg-[#1c1712]", "border border-[#d8b467]/20")}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Column 4: Emperor / Champion Podium Box ("EL TRONO") */}
                {(() => {
                  const hasChampion = Boolean(championTeam);
                  return (
                    <div className="flex flex-col items-center justify-center text-center">
                      <div
                        className={`group relative flex flex-col items-center justify-between p-6 sm:p-7 transition-all duration-300 cursor-pointer w-full ${
                          activeTeamSlug
                            ? isTeamActive(championTeam?.slug, championTeam?.name)
                              ? "border-2 border-[#f0d38f] bg-gradient-to-b from-[#2b2216] via-[#18130c] to-[#110e0a] shadow-[0_0_40px_rgba(240,211,143,0.45)] scale-[1.02]"
                              : "border border-[#2d261e] bg-[#120f0a] opacity-50"
                            : hasChampion
                            ? "border-2 border-[#d8b467]/70 bg-gradient-to-b from-[#241d13] via-[#16120b] to-[#0e0b08] shadow-[0_0_50px_rgba(216,180,103,0.35)] hover:border-[#f0d38f] hover:shadow-[0_0_65px_rgba(240,211,143,0.55)] hover:scale-[1.02]"
                            : "border border-[#2d261e] bg-[#120f0a] hover:border-[#3a3126]"
                        }`}
                        onMouseEnter={() =>
                          championTeam && (championTeam.slug || championTeam.name) &&
                          setActiveTeamSlug(championTeam.slug || championTeam.name)
                        }
                        onMouseLeave={() => setActiveTeamSlug(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (championTeam) {
                            setIsChampionModalOpen(true);
                          }
                        }}
                      >
                        {/* Ambient Radial Golden Aura (Visible only when champion is crowned) */}
                        <div
                          className={`pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_center,rgba(240,211,143,0.18),transparent_70%)] ${
                            hasChampion ? "block" : "hidden"
                          }`}
                        />

                        {/* Imperial Roman Corner Gems (Full Rhombus) */}
                        <span
                          className={`pointer-events-none absolute -top-1.5 -left-1.5 z-20 h-3.5 w-3.5 rotate-45 border ${
                            hasChampion
                              ? "border-[#ffe28a] bg-[#d8b467] shadow-[0_0_10px_rgba(240,211,143,0.9)]"
                              : "border-[#3a3126] bg-[#241e17]"
                          }`}
                        />
                        <span
                          className={`pointer-events-none absolute -top-1.5 -right-1.5 z-20 h-3.5 w-3.5 rotate-45 border ${
                            hasChampion
                              ? "border-[#ffe28a] bg-[#d8b467] shadow-[0_0_10px_rgba(240,211,143,0.9)]"
                              : "border-[#3a3126] bg-[#241e17]"
                          }`}
                        />
                        <span
                          className={`pointer-events-none absolute -bottom-1.5 -left-1.5 z-20 h-3.5 w-3.5 rotate-45 border ${
                            hasChampion
                              ? "border-[#ffe28a] bg-[#d8b467] shadow-[0_0_10px_rgba(240,211,143,0.9)]"
                              : "border-[#3a3126] bg-[#241e17]"
                          }`}
                        />
                        <span
                          className={`pointer-events-none absolute -bottom-1.5 -right-1.5 z-20 h-3.5 w-3.5 rotate-45 border ${
                            hasChampion
                              ? "border-[#ffe28a] bg-[#d8b467] shadow-[0_0_10px_rgba(240,211,143,0.9)]"
                              : "border-[#3a3126] bg-[#241e17]"
                          }`}
                        />

                        {/* Inner Delicate Line */}
                        <span
                          className={`pointer-events-none absolute inset-1.5 border transition-colors ${
                            hasChampion
                              ? "border-[#d8b467]/35 group-hover:border-[#f0d38f]/60"
                              : "border-[#2d261e]"
                          }`}
                        />

                        {/* Floating Crown Badge */}
                        <div
                          className={`relative z-10 my-1 inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-sm border-2 transition-transform duration-300 ${
                            hasChampion
                              ? "border-[#f0d38f] bg-gradient-to-b from-[#3a2c18] via-[#241a0d] to-[#140e07] text-[#f0d38f] shadow-[0_0_35px_rgba(240,211,143,0.6)] group-hover:scale-110"
                              : "border-[#2d261e] bg-[#16120e] text-[#6e655b]"
                          }`}
                        >
                          {championTeam?.logo_url ? (
                            <picture>
                              <img
                                src={championTeam.logo_url}
                                alt={championTeam.name}
                                className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                              />
                            </picture>
                          ) : (
                            <IconCrown
                              size={36}
                              className={`sm:size-10 ${
                                hasChampion
                                  ? "text-[#f0d38f] drop-shadow-[0_0_12px_rgba(240,211,143,0.8)]"
                                  : "text-[#6e655b]"
                              }`}
                            />
                          )}
                        </div>

                        {/* Imperial Subtitle */}
                        <span
                          className={`relative z-10 mt-3 font-chakra text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] ${
                            hasChampion
                              ? "text-[#f0d38f] drop-shadow-[0_2px_8px_rgba(216,180,103,0.5)]"
                              : "text-[#7e756b]"
                          }`}
                        >
                          EMPERADOR DEL COLISEO
                        </span>

                        {/* Champion Name or Por Coronar */}
                        <div
                          className={`relative z-10 my-3 font-chakra text-xl sm:text-2xl font-black uppercase tracking-wider ${
                            hasChampion
                              ? "text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ffe494] to-white drop-shadow-[0_2px_12px_rgba(240,211,143,0.4)]"
                              : "text-[#7e756b]"
                          }`}
                        >
                          {championTeam?.name || "POR CORONAR"}
                        </div>

                        {/* Imperial Prize Badge */}
                        <div
                          className={`relative z-10 mt-2 flex items-center gap-1.5 border px-4 py-1.5 font-chakra text-[11px] sm:text-xs font-extrabold uppercase tracking-widest transition-colors ${
                            hasChampion
                              ? "border-[#f0d38f]/70 bg-gradient-to-r from-[#2a2012] via-[#1c150b] to-[#2a2012] text-[#ffe494] shadow-[0_0_18px_rgba(240,211,143,0.35)] group-hover:border-[#f0d38f]"
                              : "border-[#2d261e] bg-[#14100c] text-[#7e756b]"
                          }`}
                        >
                          <IconCrown
                            size={14}
                            className={hasChampion ? "text-[#f0d38f] shrink-0" : "text-[#7e756b] shrink-0"}
                          />
                          <span>S/ 60,000 PEN + TROFEO</span>
                        </div>

                        {/* Botón interactivo para abrir el modal del campeón con su roster */}
                        {hasChampion && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsChampionModalOpen(true);
                            }}
                            className="relative z-10 mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#f0d38f] bg-[#f0d38f]/20 hover:bg-[#f0d38f]/40 text-[#ffe494] font-chakra text-[10px] font-black uppercase tracking-wider rounded-xs transition-all hover:scale-105 cursor-pointer shadow-[0_0_12px_rgba(240,211,143,0.3)]"
                          >
                            <IconCrown size={13} />
                            <span>Ver Roster Campeón</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* 3rd Place Match Card */}
        {(() => {
          const match = findFullMatchDetails(thirdPlaceMatch);
          const isOngoing = isStatusOngoing(match.status);
          return (
            <div
              className={`mt-10 sm:mt-14 mx-auto max-w-2xl border bg-linear-to-r from-[#1c1712] via-[#14110d] to-[#1c1712] p-4 sm:p-6 shadow-lg transition-all duration-200 ${
                activeTeamSlug
                  ? isTeamActive(match.slot_a.team?.slug, match.slot_a.team?.slug) ||
                    isTeamActive(match.slot_b.team?.slug, match.slot_b.team?.slug)
                    ? "border-[#ff7373]/60 shadow-[0_0_20px_rgba(255,115,115,0.15)]"
                    : "border-[#2d261e] opacity-50"
                  : isOngoing
                  ? "border border-[#53fc18]/60 bg-[#0c140b]"
                  : "border-[#2d261e] hover:border-[#ff7373]/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2d261e] pb-3 gap-2 flex-wrap">
                <div className="flex items-center gap-2 font-chakra text-xs font-bold uppercase tracking-wider text-[#ff7373]">
                  <IconMedal size={16} />
                  <span>
                    {(match as PlayoffThirdPlaceMatch).match_name || "Batalla por el Honor (3er Puesto)"} · {match.best_of || "BO3"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderCardStatusBadge(match.status)}
                  <span className="font-mono text-[10px] text-[#8e857b]">Premio: S/ 15,000 PEN</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedModalMatch({ match, roundName: "Batalla por el Honor (3er Puesto)" });
                    }}
                    className="flex items-center gap-1 text-[9px] text-[#ff7373] hover:text-white bg-[#ff7373]/10 hover:bg-[#ff7373]/30 px-1.5 py-0.5 border border-[#ff7373]/40 rounded-xs transition-colors"
                    title="Ver detalle de la Batalla por el Honor"
                  >
                    <IconInfoCircle size={11} />
                    Detalle
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 font-mono text-xs">
                {renderSlot(match.slot_a, match, "bg-[#1a1511]", "border border-[#2d261e] p-2.5")}
                {renderSlot(match.slot_b, match, "bg-[#1a1511]", "border border-[#2d261e] p-2.5")}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Render Playoff Match Detail Modal when clicked */}
      <PlayoffMatchModal
        match={selectedModalMatch?.match || null}
        roundName={selectedModalMatch?.roundName}
        onClose={() => setSelectedModalMatch(null)}
      />

      {/* Render Champion Modal con Roster Completo y Confeti */}
      <ChampionModal
        isOpen={isChampionModalOpen}
        onClose={() => setIsChampionModalOpen(false)}
        teamLogo={championTeam?.logo_url}
        teamName={championTeam?.name || "Rising Rage"}
      />
    </section>
  );
}
