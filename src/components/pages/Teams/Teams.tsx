"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TextInput } from "@mantine/core";
import {
  IconSwords,
  IconFlame,
  IconSearch,
  IconShield,
} from "@tabler/icons-react";
import { TeamCard, type TeamStandingInfo } from "./TeamCard";
import type { TeamData, TeamRosterMemberData } from "interfaces/teams";
import type { StageStandingData } from "interfaces/stages";

const ROMAN_NUMERALS = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII",
  "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"
];

const TOTAL_SLOTS = 16;

interface TeamsProps {
  initialTeams: TeamData[];
  initialRosters?: Record<string, TeamRosterMemberData[]>;
  initialStandings?: StageStandingData[];
}

export function Teams({
  initialTeams,
  initialRosters = {},
  initialStandings = [],
}: TeamsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Mapa de rendimiento y clasificación / eliminación por equipo
  const standingMap = useMemo(() => {
    const map: Record<string, TeamStandingInfo> = {};
    (initialStandings || []).forEach((s) => {
      if (s.team?.slug) {
        map[s.team.slug] = {
          wins: s.wins,
          losses: s.losses,
          status: s.status,
          isEliminated: s.losses >= 3 || s.status?.toUpperCase() === "ELIMINATED",
          isQualified: s.wins >= 3 || s.status?.toUpperCase() === "QUALIFIED",
        };
      }
    });
    return map;
  }, [initialStandings]);

  // Construcción de los 16 cupos oficiales
  const slots = useMemo(() => {
    return Array.from({ length: TOTAL_SLOTS }, (_, index) => {
      const team = initialTeams[index] || null;
      const roster = team ? initialRosters[team.slug] || [] : [];
      return {
        slotNumber: index + 1,
        romanId: ROMAN_NUMERALS[index] || `${index + 1}`,
        isRevealed: !!team,
        team,
        roster,
      };
    });
  }, [initialTeams, initialRosters]);

  // Filtrado de cupos por término de búsqueda inteligente
  const filteredSlots = useMemo(() => {
    if (!searchTerm.trim()) return slots;
    const term = searchTerm.toLowerCase().trim();

    return slots.filter((slot) => {
      const team = slot.team;

      if (!slot.isRevealed || !team) {
        return (
          "por anunciar".includes(term) ||
          "tbd".includes(term) ||
          `cupo ${slot.slotNumber}`.includes(term)
        );
      }

      const st = standingMap[team.slug];

      if (term === "eliminado" || term === "eliminados") {
        return Boolean(st?.isEliminated || team.status?.toUpperCase() === "ELIMINATED");
      }
      if (term === "clasificado" || term === "clasificados") {
        return Boolean(st?.isQualified || team.status?.toUpperCase() === "QUALIFIED");
      }
      if (term === "activo" || term === "activos") {
        return !st?.isEliminated;
      }

      const matchesTeam =
        team.name.toLowerCase().includes(term) ||
        team.tag.toLowerCase().includes(term) ||
        (team.country && team.country.toLowerCase().includes(term)) ||
        (team.city && team.city.toLowerCase().includes(term));

      const matchesRoster = slot.roster.some(
        (m) =>
          m.player?.nickname?.toLowerCase().includes(term) ||
          m.role_display?.toLowerCase().includes(term) ||
          m.player?.country?.toLowerCase().includes(term)
      );

      return matchesTeam || matchesRoster;
    });
  }, [slots, searchTerm, standingMap]);

  const revealedCount = initialTeams.length;

  return (
    <div className="min-h-screen bg-[#120f0a] text-[#f3f3f5] selection:bg-[#00c8f8]/30 selection:text-white">
      {/* Background ambient texture & subtle glows */}
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#2d261e_1px,transparent_1px)] bg-size-[24px_24px] opacity-30" />
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[450px] w-full max-w-5xl rounded-full bg-[#00c8f8]/5 blur-3xl" />
        <div className="pointer-events-none absolute top-40 right-10 h-72 w-72 rounded-full bg-[#d8b467]/5 blur-3xl" />

        {/* ================= UNIFIED CENTERED CONTAINER ================= */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Breadcrumbs */}
          <nav className="mb-8 flex items-center gap-2 font-chakra text-xs text-[#8e857b]">
            <Link href="/" className="transition-colors hover:text-[#00c8f8]">
              INICIO
            </Link>
            <span>/</span>
            <span className="text-[#d8b467] font-semibold">EQUIPOS</span>
          </nav>

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#2d261e]"
          >
            <div>
              <div className="mb-3 sm:mb-4 flex items-center gap-2.5 sm:gap-3 w-fit max-w-xl">
                <div className="flex items-center gap-2 font-chakra text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#f0d38f] drop-shadow-[0_2px_10px_rgba(216,180,103,0.4)]">
                  <IconSwords size={15} className="text-[#f0d38f] shrink-0" />
                  <span>TEMPORADA II · 16 EQUIPOS OFICIALES</span>
                  <IconSwords size={15} className="text-[#f0d38f] shrink-0" />
                </div>
                <div className="h-px w-16 sm:w-28 bg-linear-to-r from-[#d8b467] via-[#d8b467]/60 to-transparent" />
              </div>

              <h1 className="mt-4 font-cinzel text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
                EQUIPOS DE LA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d8b467] via-[#f0d38f] to-[#e49b38]">ARENA</span>
              </h1>

              <p className="mt-3 max-w-2xl font-chakra text-xs sm:text-sm font-normal leading-relaxed text-[#c7bcab]">
                Conoce a los 16 equipos oficiales de Dota 2 y sus gladiadores que batallarán por el título de campeones
                y el pozo acumulado en El Coliseo II.
              </p>
            </div>

            {/* Quick Search & Counter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
              <TextInput
                placeholder="Buscar equipo, tag, jugador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                leftSection={<IconSearch size={16} className="text-[#d8b467]" />}
                size="sm"
                styles={{
                  root: { width: "100%" },
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
                  section: { color: "#7e756b" },
                }}
                classNames={{ root: "w-full sm:w-64" }}
              />

              <div className="flex items-center justify-center gap-2 border border-[#d8b467]/30 bg-[#1c1712] px-4 py-2 text-xs font-mono text-[#f0d38f] shadow-[0_0_15px_rgba(216,180,103,0.15)] whitespace-nowrap">
                <IconFlame size={16} className="text-[#f0d38f] animate-pulse" />
                <span className="font-bold">
                  {revealedCount} / {TOTAL_SLOTS} REVELADOS
                </span>
              </div>
            </div>
          </motion.div>

          {/* ================= 16 TEAMS GRID ================= */}
          <div className="mt-8">
            {filteredSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center border border-dashed border-[#2d261e] bg-[#18140f]/50 p-6 sm:p-8">
                <IconShield size={48} className="text-[#8e857b] mb-4 stroke-1" />
                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#f3f3f5]">
                  No se encontraron equipos
                </h3>
                <p className="mt-1 max-w-md font-chakra text-xs text-[#8e857b]">
                  No hay coincidencias para el término de búsqueda. Intenta con otro nombre o jugador.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-5 border border-[#d8b467]/40 bg-[#d8b467]/10 px-4 py-2 font-chakra text-xs font-bold uppercase tracking-wider text-[#d8b467] hover:bg-[#d8b467] hover:text-black transition-colors"
                >
                  Limpiar Búsqueda
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              >
                <AnimatePresence mode="popLayout">
                  {filteredSlots.map((slot) => (
                    <TeamCard
                      key={slot.team?.slug || `slot-${slot.slotNumber}`}
                      slotNumber={slot.slotNumber}
                      romanId={slot.romanId}
                      team={slot.team}
                      roster={slot.roster}
                      isRevealed={slot.isRevealed}
                      standing={slot.team ? standingMap[slot.team.slug] : undefined}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
