"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { TextInput, Loader } from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconSwords,
  IconSearch,
  IconReload,
  IconAlertTriangle,
  IconChevronRight,
} from "@tabler/icons-react";

// Services, Interfaces & Reusable Card
import { getTeamsAPI, getTeamRosterAPI } from "services/teams";
import { getStageBySlugAPI } from "services/stages";
import { TeamCard, type TeamStandingInfo } from "components/pages/Teams";
import type { TeamData, TeamRosterMemberData } from "interfaces/teams";
import type { StageStandingData } from "interfaces/stages";

const ROMAN_NUMERALS = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII",
  "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"
];

const TOTAL_SLOTS = 16;

interface DisplaySlot {
  slotNumber: number;
  romanId: string;
  isRevealed: boolean;
  team: TeamData | null;
  roster: TeamRosterMemberData[];
}

interface TeamsSectionProps {
  initialTeams?: TeamData[];
  initialRosters?: Record<string, TeamRosterMemberData[]>;
  initialStandings?: StageStandingData[];
}

export function TeamsSection({
  initialTeams,
  initialRosters,
  initialStandings = [],
}: TeamsSectionProps = {}) {
  const [teams, setTeams] = useState<TeamData[]>(initialTeams || []);
  const [rosters, setRosters] = useState<Record<string, TeamRosterMemberData[]>>(initialRosters || {});
  const [standings, setStandings] = useState<StageStandingData[]>(initialStandings);
  const [loading, setLoading] = useState(!initialTeams || initialTeams.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Mapa de rendimiento y clasificación / eliminación por equipo
  const standingMap = useMemo(() => {
    const map: Record<string, TeamStandingInfo> = {};
    (standings || []).forEach((s) => {
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
  }, [standings]);

  useEffect(() => {
    const hasInitialData =
      initialTeams &&
      initialTeams.length > 0 &&
      initialRosters &&
      Object.keys(initialRosters).length > 0 &&
      initialStandings &&
      initialStandings.length > 0;

    if (hasInitialData && reloadKey === 0) {
      return;
    }

    let isMounted = true;

    async function loadTeamsAndRosters() {
      try {
        // Cargar equipos y fase suiza en paralelo
        const [teamsData, swissData] = await Promise.allSettled([
          getTeamsAPI("el-gran-coliseo-ii", true),
          getStageBySlugAPI("fase-suiza"),
        ]);

        if (!isMounted) return;

        if (swissData.status === "fulfilled" && swissData.value?.standings) {
          setStandings(swissData.value.standings);
        }

        const teamsList =
          teamsData.status === "fulfilled" && teamsData.value?.results
            ? teamsData.value.results
            : [];
        setTeams(teamsList);

        const rosterMap: Record<string, TeamRosterMemberData[]> = {};
        const missingRosters: TeamData[] = [];

        teamsList.forEach((t) => {
          if (t.roster && t.roster.length > 0) {
            rosterMap[t.slug] = t.roster;
          } else {
            missingRosters.push(t);
          }
        });

        // Fallback resiliente solo si faltaran rosters
        if (missingRosters.length > 0) {
          const rosterEntries = await Promise.allSettled(
            missingRosters.map(async (t) => {
              try {
                const roster = await getTeamRosterAPI(t.slug);
                return { slug: t.slug, roster };
              } catch {
                return { slug: t.slug, roster: [] };
              }
            })
          );
          if (!isMounted) return;
          rosterEntries.forEach((res) => {
            if (res.status === "fulfilled" && res.value) {
              rosterMap[res.value.slug] = res.value.roster;
            }
          });
        }

        setRosters(rosterMap);
      } catch (err) {
        console.error("Error al cargar los equipos:", err);
        if (isMounted) {
          setError("No se pudieron cargar los equipos en vivo. Mostrando ranuras de draft.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTeamsAndRosters();

    return () => {
      isMounted = false;
    };
  }, [initialTeams, initialRosters, initialStandings, reloadKey]);

  // Construcción de los 16 cupos oficiales
  const slots: DisplaySlot[] = useMemo(() => {
    return Array.from({ length: TOTAL_SLOTS }, (_, index) => {
      const team = teams[index] || null;
      const roster = team ? rosters[team.slug] || [] : [];
      return {
        slotNumber: index + 1,
        romanId: ROMAN_NUMERALS[index] || `${index + 1}`,
        isRevealed: !!team,
        team,
        roster,
      };
    });
  }, [teams, rosters]);

  // Filtrado por búsqueda inteligente
  const filteredSlots = useMemo(() => {
    if (!searchTerm.trim()) return slots;

    const term = searchTerm.toLowerCase().trim();
    return slots.filter((slot) => {
      if (!slot.isRevealed || !slot.team) {
        return "por anunciar".includes(term) || "tbd".includes(term) || `cupo ${slot.slotNumber}`.includes(term);
      }
      const t = slot.team;
      const st = standingMap[t.slug];

      if (term === "eliminado" || term === "eliminados") {
        return Boolean(st?.isEliminated || t.status?.toUpperCase() === "ELIMINATED");
      }
      if (term === "clasificado" || term === "clasificados") {
        return Boolean(st?.isQualified || t.status?.toUpperCase() === "QUALIFIED");
      }
      if (term === "activo" || term === "activos") {
        return !st?.isEliminated;
      }

      const matchesTeam =
        t.name.toLowerCase().includes(term) ||
        t.tag.toLowerCase().includes(term) ||
        t.region.toLowerCase().includes(term) ||
        (t.country && t.country.toLowerCase().includes(term)) ||
        (t.city && t.city.toLowerCase().includes(term));

      const matchesRoster = slot.roster.some(
        (m) =>
          m.player?.nickname?.toLowerCase().includes(term) ||
          m.role_display?.toLowerCase().includes(term) ||
          m.player?.country?.toLowerCase().includes(term)
      );

      return matchesTeam || matchesRoster;
    });
  }, [slots, searchTerm, standingMap]);

  const revealedCount = teams.length;

  return (
    <section id="equipos" className="relative w-full bg-[#120f0a] py-14 sm:py-20 lg:py-24 text-white overflow-hidden">
      {/* Background Ambience / Glows */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-72 sm:h-96 w-72 sm:w-96 rounded-full bg-[#d8b467]/5 blur-[140px]" />
      <div className="pointer-events-none absolute left-0 bottom-1/4 h-72 sm:h-96 w-72 sm:w-96 rounded-full bg-[#2e9df0]/5 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 sm:pb-12 border-b border-[#2d261e]"
        >
          <div>
            <div className="mb-3 sm:mb-4 flex items-center gap-3 sm:gap-4 w-full max-w-md">
              <div className="flex items-center gap-2 font-chakra text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#6cc4ff] drop-shadow-[0_2px_10px_rgba(46,157,240,0.45)]">
                <IconSwords size={15} className="text-[#6cc4ff] shrink-0" />
                <span>CONVOCATORIA DE GLADIADORES</span>
              </div>
              <div className="h-px flex-1 bg-linear-to-r from-[#2e9df0] via-[#2e9df0]/60 to-transparent" />
            </div>

            <h2 className="mt-4 font-coliseo-title text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
              Los 16 <span className="text-[#f0d38f]">Equipos</span>
            </h2>

            <p className="mt-3 max-w-2xl text-xs sm:text-sm font-normal leading-relaxed text-[#c7bcab]">
              16 equipos oficiales competirán en el Coliseo. Conforme avancen las fases y la noche del Draft,
              los capitanes y sus 4 Pro-Players se irán revelando progresivamente hasta completar el cuadro de honor.
            </p>
          </div>

          {/* Quick Counter / Badge & Search & Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            <TextInput
              placeholder="Buscar equipo, jugador, región..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftSection={<IconSearch size={16} />}
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
                    borderColor: "#2e9df0",
                    boxShadow: "0 0 0 1px #2e9df0",
                    outline: "none",
                  },
                },
                section: { color: "#7e756b" },
              }}
              classNames={{ root: "w-full sm:w-64 md:w-72" }}
            />

            <div className="flex items-center justify-center gap-2 border border-[#d8b467]/40 bg-[#1c1712] px-4 py-2 text-xs font-mono text-[#f0d38f] shadow-[0_0_15px_rgba(216,180,103,0.15)] whitespace-nowrap">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00c8f8] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00c8f8]" />
              </span>
              <span className="font-bold">
                {revealedCount < TOTAL_SLOTS
                  ? `DRAFT EN VIVO · ${revealedCount}/${TOTAL_SLOTS} CAPITANES`
                  : `16/16 EQUIPOS CONFIRMADOS`}
              </span>
            </div>

            <Link
              href="/teams"
              className="inline-flex items-center justify-center gap-1.5 border border-[#2e9df0]/60 bg-[#2e9df0]/15 px-3.5 py-2 font-chakra text-xs font-bold uppercase tracking-wider text-[#6cc4ff] transition-all hover:border-[#2e9df0] hover:bg-[#2e9df0] hover:text-white hover:shadow-[0_0_15px_rgba(46,157,240,0.5)] whitespace-nowrap"
              style={{
                clipPath: "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)",
              }}
            >
              <span>Ver Teams Completo</span>
              <IconChevronRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Error Notification Bar */}
        {error && (
          <div className="mt-6 flex items-center justify-between border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <IconAlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                setReloadKey((prev) => prev + 1);
              }}
              className="flex items-center gap-1 font-mono text-[11px] font-bold text-amber-200 hover:text-white cursor-pointer underline"
            >
              <IconReload size={13} />
              Reintentar
            </button>
          </div>
        )}

        {/* Loading Spinner Indicator */}
        {loading ? (
          <div className="my-20 flex flex-col items-center justify-center gap-4 text-[#d8b467]">
            <Loader color="#d8b467" size="md" />
            <span className="font-mono text-xs tracking-widest uppercase text-[#a8a197]">
              Invocando equipos y alineaciones del Coliseo...
            </span>
          </div>
        ) : (
          /* 16 Teams Grid with Framer Motion Stagger & AnimatePresence */
          <motion.div
            layout
            className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
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

        {/* Bottom Callout & Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-center"
        >
          <Link
            href="/teams"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 border border-[#d8b467]/50 bg-[#d8b467]/10 px-6 py-3 font-chakra text-xs font-bold uppercase tracking-widest text-[#f0d38f] transition-all hover:border-[#d8b467] hover:bg-[#d8b467] hover:text-black hover:shadow-[0_0_20px_rgba(216,180,103,0.4)]"
            style={{
              clipPath: "polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%)",
            }}
          >
            <IconSwords size={16} />
            <span>Ver Directorio Completo de Equipos</span>
            <IconChevronRight size={15} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
