"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  IconCheck,
  IconSkull,
  IconClock,
  IconShieldCheck,
  IconSwords,
  IconShield,
  IconCalendarEvent,
  IconBrandKick,
  IconArrowRight,
} from "@tabler/icons-react";
import { getStageBySlugAPI, getStageStandingsAPI, getStageBySlugClientAPI } from "services/stages";
import { getTeamsAPI } from "services/teams";
import type { SwissStageData, StageMatchData, StageGameData, StageGameHeroData, StageStandingData } from "interfaces/stages";
import { KickStreamModal } from "./KickStreamModal";

function getCaptainTag(
  team?: { slug?: string; tag?: string; name?: string } | null,
  map?: Record<string, string>,
  matchSlug?: string
): string | null {
  if (!team) return null;
  // 1. Desde el mapa cargado de rosters oficiales
  if (team.slug && map && map[team.slug]) {
    return map[team.slug];
  }
  // 2. Desde el team tag (ej. "T parker", "t matthew", "team iwo", "team k1", "t stinger")
  if (team.tag && team.tag.length >= 2 && team.tag.toLowerCase() !== team.name?.toLowerCase()) {
    const clean = team.tag.replace(/^(?:team|t)[\s\-_]+/i, "").trim();
    if (clean) {
      const formatted = clean
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
      return `Team ${formatted}`;
    }
  }
  // 3. Fallback desde el slug de la partida / cruce
  if (matchSlug && team.slug) {
    const vsMatch = matchSlug.match(/(?:^|-)t(?:eam)?-([a-z0-9_-]+)-vs-(?:team|t)-([a-z0-9_-]+)(?:-|$)/i);
    if (vsMatch) {
      const c1 = vsMatch[1];
      const c2 = vsMatch[2];
      if (team.slug.includes(c1)) {
        return `Team ${c1.charAt(0).toUpperCase() + c1.slice(1)}`;
      }
      if (team.slug.includes(c2)) {
        return `Team ${c2.charAt(0).toUpperCase() + c2.slice(1)}`;
      }
    }
  }
  return null;
}

function renderHeroPicks(heroes: StageGameHeroData[] = [], isLosingTeam: boolean = false) {
  const displayHeroes = heroes && heroes.length > 0 ? [...heroes] : [];
  while (displayHeroes.length < 5) {
    displayHeroes.push({ has_hero: false, hero_id: null, hero_name: null, image_url: null });
  }

  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-1.5 mt-1.5 w-full">
      {displayHeroes.slice(0, 5).map((h, idx) => {
        const heroUrl = h.has_hero && h.image_url ? h.image_url : null;
        const heroName = h.hero_name || "Por elegir";

        return (
          <div
            key={idx}
            title={heroName}
            className={`group relative aspect-[4/3] w-full overflow-hidden border ${
              heroUrl
                ? isLosingTeam
                  ? "border-rose-900/40 bg-[#160808]"
                  : "border-[#2d261e] bg-[#0d0b08]"
                : "border-[#1f1913] bg-[#0c0a08]/80 flex items-center justify-center"
            } shadow-xs`}
          >
            {heroUrl ? (
              <picture>
                <img
                  src={heroUrl}
                  alt={heroName}
                  className={`h-full w-full object-cover transition-transform group-hover:scale-110 ${
                    isLosingTeam ? "opacity-90 brightness-95" : ""
                  }`}
                />
              </picture>
            ) : (
              <IconShield size={12} className="text-[#42372a] opacity-60" />
            )}

            {/* Capa de superposición sutil y traslúcida para los héroes del equipo derrotado */}
            {isLosingTeam && heroUrl && (
              <div className="pointer-events-none absolute inset-0 bg-rose-950/15 border border-rose-500/20" />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface SwissStageSectionProps {
  initialData?: SwissStageData | null;
}

function formatDateString(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;

    const day = d.getDate().toString().padStart(2, "0");
    const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");

    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch {
    return null;
  }
}

function isStatusOngoing(status: string | null | undefined): boolean {
  if (!status) return false;
  const s = status.toUpperCase().trim().replace(/_/g, " ");
  return (
    s === "ONGOING" ||
    s === "IN PROGRESS" ||
    s === "LIVE" ||
    s === "EN CURSO" ||
    s === "PLAYING"
  );
}

// Helper para verificar si un partido de la ronda ya finalizó
function isMatchFinished(m: StageMatchData | null | undefined): boolean {
  if (!m) return false;
  if (m.winner_slug) return true;
  const ms = (m.status || "").toUpperCase();
  if (ms === "FINISHED" || ms === "COMPLETED" || ms === "DONE") return true;
  const bo = (m.best_of || "BO1").toUpperCase();
  const targetWins = bo === "BO3" ? 2 : bo === "BO5" ? 3 : 1;
  if (
    (typeof m.score_a === "number" && m.score_a >= targetWins) ||
    (typeof m.score_b === "number" && m.score_b >= targetWins)
  ) {
    return true;
  }
  return false;
}

function hasOngoingMatchInStage(data: SwissStageData | null | undefined): boolean {
  if (!data || !data.rounds) return false;
  return data.rounds.some((r) => {
    if (!r.matches || r.matches.length === 0) return false;
    return r.matches.some((m) => {
      // Si la serie ya finalizó, no hay partido en vivo
      if (isMatchFinished(m)) return false;

      // Si el partido está marcado explícitamente en curso/ONGOING/LIVE
      if (isStatusOngoing(m.status)) return true;

      // Si algún juego individual está en curso y no finalizado
      if (
        m.games &&
        m.games.some(
          (g) =>
            isStatusOngoing(g.status) &&
            g.status !== "COMPLETED" &&
            g.status !== "FINISHED"
        )
      ) {
        return true;
      }
      return false;
    });
  });
}

function isSwissStageComplete(
  stageData: SwissStageData | null | undefined,
  standingsData: StageStandingData[] | null | undefined
): boolean {
  if (!stageData) return false;

  // 1. Estado global de la etapa
  const stageStatus = (stageData.status || "").toUpperCase();
  if (stageStatus === "FINISHED" || stageStatus === "COMPLETED") {
    return true;
  }

  // 2. Si las 5 rondas existen y están todas terminadas
  if (stageData.rounds && stageData.rounds.length >= 5) {
    const allRoundsFinished = stageData.rounds.every((r) => {
      const rs = (r.status || "").toUpperCase();
      if (rs === "COMPLETED" || rs === "FINISHED" || rs === "FINALIZADO") return true;
      if (r.matches && r.matches.length > 0 && r.matches.every(isMatchFinished)) return true;
      return false;
    });
    if (allRoundsFinished) return true;
  }

  // 3. Si la tabla de posiciones tiene 8 clasificados (3 victorias) y 8 eliminados (3 derrotas)
  const standings = standingsData || stageData.standings;
  if (standings && standings.length >= 16) {
    const qualifiedCount = standings.filter(
      (s) => s.wins >= 3 || (s.status || "").toUpperCase() === "QUALIFIED"
    ).length;
    const eliminatedCount = standings.filter(
      (s) => s.losses >= 3 || (s.status || "").toUpperCase() === "ELIMINATED"
    ).length;
    if (qualifiedCount >= 8 && eliminatedCount >= 8) {
      return true;
    }
  }

  return false;
}

function getMatchWinnerSlug(m: StageMatchData | null | undefined): string | null {
  if (!m) return null;
  if (m.winner_slug) return m.winner_slug;
  if (!isMatchFinished(m)) return null;
  if (typeof m.score_a === "number" && typeof m.score_b === "number") {
    if (m.score_a > m.score_b) return m.team_a?.slug || null;
    if (m.score_b > m.score_a) return m.team_b?.slug || null;
  }
  return null;
}

// Determinar qué ronda debe tener el foco inicial (última si todo terminó, o la actual activa)
function getDefaultSelectedRound(data: SwissStageData | null): number {
  if (!data || !data.rounds || data.rounds.length === 0) {
    return data?.current_round_number || 1;
  }

  const rounds = data.rounds;
  const stageStatus = (data.status || "").toUpperCase();
  const isStageFinished = stageStatus === "FINISHED" || stageStatus === "COMPLETED";

  const allRoundsFinished = rounds.every((r) => {
    const rStatus = (r.status || "").toUpperCase();
    if (rStatus === "FINISHED" || rStatus === "COMPLETED") return true;
    return r.matches && r.matches.length > 0 && r.matches.every(isMatchFinished);
  });

  if (isStageFinished || allRoundsFinished) {
    const maxRound = Math.max(...rounds.map((r) => r.round_number || 1));
    return maxRound || 5;
  }

  if (data.current_round_number) {
    return data.current_round_number;
  }

  const ongoingRound = rounds.find((r) => {
    const st = (r.status || "").toUpperCase();
    return (
      st === "ONGOING" ||
      st === "IN_PROGRESS" ||
      (r.matches &&
        r.matches.some(
          (m) =>
            !isMatchFinished(m) &&
            ((m.status || "").toUpperCase() === "ONGOING" ||
              (typeof m.score_a === "number" && m.score_a > 0) ||
              (typeof m.score_b === "number" && m.score_b > 0))
        ))
    );
  });
  if (ongoingRound) return ongoingRound.round_number;

  const lastFinished = [...rounds]
    .reverse()
    .find((r) => r.matches && r.matches.some(isMatchFinished));
  if (lastFinished) return lastFinished.round_number;

  return 1;
}

export function SwissStageSection({ initialData }: SwissStageSectionProps) {
  const [stageData, setStageData] = useState<SwissStageData | null>(initialData || null);
  const [standingsData, setStandingsData] = useState<StageStandingData[] | null>(initialData?.standings || null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [captainMap, setCaptainMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadCaptains() {
      try {
        const teamsData = await getTeamsAPI("el-gran-coliseo-ii", true);
        const teams = teamsData?.results || [];
        const map: Record<string, string> = {};

        teams.forEach((t) => {
          const roster = t.roster || [];
          const cap = roster.find(
            (m) => m.role === "CAPTAIN" || (m as { is_captain?: boolean }).is_captain
          );
          const capName = cap?.player?.nickname;
          if (capName) {
            const clean = capName.trim();
            const tag = clean.toLowerCase().startsWith("team ") ? clean : `Team ${clean}`;
            map[t.slug] = tag;
          } else if (t.tag && t.tag.toLowerCase() !== t.name.toLowerCase()) {
            const cleanTag = t.tag.replace(/^T-/i, "").replace(/^TEAM\s+/i, "").trim();
            map[t.slug] = `Team ${cleanTag}`;
          }
        });

        if (isMounted) {
          setCaptainMap(map);
        }
      } catch {
        // ignore
      }
    }
    loadCaptains();
    return () => {
      isMounted = false;
    };
  }, []);
  
  const initialHasLive = hasOngoingMatchInStage(initialData || null);
  const [activeTab, setActiveTab] = useState<"STANDINGS" | "ROUNDS">(
    initialHasLive ? "ROUNDS" : "STANDINGS"
  );

  // Default selected round number: última ronda si finalizó o ronda activa
  const [selectedRoundNumber, setSelectedRoundNumber] = useState<number>(() =>
    getDefaultSelectedRound(initialData || null)
  );

  useEffect(() => {
    const syncTabFromUrl = () => {
      if (typeof window === "undefined") return;
      const search = window.location.search.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const tabVal = (params.get("tab") || "").toLowerCase();

      if (
        search.includes("rounds") ||
        search.includes("rondas") ||
        search.includes("round") ||
        tabVal === "rounds" ||
        tabVal === "rondas" ||
        tabVal === "round"
      ) {
        setActiveTab("ROUNDS");
      } else if (
        search.includes("standings") ||
        search.includes("tabla") ||
        search.includes("posiciones") ||
        tabVal === "standings" ||
        tabVal === "tabla" ||
        tabVal === "posiciones"
      ) {
        setActiveTab("STANDINGS");
      }
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, []);

  const handleTabChange = (tab: "STANDINGS" | "ROUNDS") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const newUrl = tab === "ROUNDS" ? "?rounds" : "?standings";
      window.history.replaceState(null, "", newUrl);
    }
  };

  useEffect(() => {
    if (initialData && initialData.rounds && initialData.rounds.length > 0) {
      return;
    }
    async function loadSwissData() {
      try {
        const [stageRes, standingsRes] = await Promise.allSettled([
          getStageBySlugAPI("fase-suiza", "el-gran-coliseo-ii"),
          getStageStandingsAPI("fase-suiza", "el-gran-coliseo-ii"),
        ]);

        if (stageRes.status === "fulfilled" && stageRes.value) {
          const stageVal = stageRes.value;
          setStageData(stageVal);
          setSelectedRoundNumber(getDefaultSelectedRound(stageVal));
          if (stageVal.standings) {
            setStandingsData(stageVal.standings);
          }

          // Si existe alguna partida en vivo/en curso, redirigir automáticamente al tab de RONDAS
          const search = typeof window !== "undefined" ? window.location.search.toLowerCase() : "";
          const isExplicitStandingsUrl = search.includes("standings") || search.includes("tabla") || search.includes("posiciones");
          if (hasOngoingMatchInStage(stageVal) && !isExplicitStandingsUrl) {
            setActiveTab("ROUNDS");
          }
        }

        if (standingsRes.status === "fulfilled" && standingsRes.value?.standings) {
          setStandingsData(standingsRes.value.standings);
        }
      } catch (err) {
        console.error("Error al cargar datos de fase suiza:", err);
      }
    }
    loadSwissData();
  }, [initialData]);

  // Auto-scroll a la sección de Playoffs si la Fase Suiza ha finalizado por completo
  useEffect(() => {
    if (isSwissStageComplete(stageData, standingsData)) {
      const timer = setTimeout(() => {
        const playoffsElem = document.getElementById("playoffs");
        if (playoffsElem) {
          playoffsElem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [stageData, standingsData]);

  // Polling activo para refrescar partidas en curso, scores y picks de la Fase Suiza
  useEffect(() => {
    if (isSwissStageComplete(stageData, standingsData)) {
      return;
    }

    const hasLive = hasOngoingMatchInStage(stageData);
    const pollInterval = hasLive ? 5000 : 25000;

    const timer = setInterval(async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const fresh = await getStageBySlugClientAPI("fase-suiza", "el-gran-coliseo-ii");
        if (fresh && fresh.rounds && fresh.rounds.length > 0) {
          setStageData(fresh);
          if (fresh.standings) {
            setStandingsData(fresh.standings);
          }
        }
      } catch {
        // Silencioso en background polling
      }
    }, pollInterval);

    return () => clearInterval(timer);
  }, [stageData, standingsData]);

  // Map each team slug to their current wins & losses record and status
  const teamRecordMap = useMemo(() => {
    const map: Record<
      string,
      { wins: number; losses: number; status?: string; isQualified: boolean; isEliminated: boolean }
    > = {};
    const list = standingsData ?? stageData?.standings;
    if (list) {
      list.forEach((s) => {
        if (s.team?.slug) {
          const isQualified = s.wins >= 3 || s.status === "QUALIFIED";
          const isEliminated = s.losses >= 3 || s.status === "ELIMINATED";
          map[s.team.slug] = {
            wins: s.wins,
            losses: s.losses,
            status: s.status,
            isQualified,
            isEliminated,
          };
        }
      });
    }
    return map;
  }, [standingsData, stageData]);

  // Cronología ronda a ronda: calcula el récord acumulado hasta cada ronda y si se clasificó/eliminó en esa ronda específica
  const roundMatchTeamInfoMap = useMemo(() => {
    const map: Record<
      string,
      { wins: number; losses: number; isQualified: boolean; isEliminated: boolean }
    > = {};

    if (!stageData?.rounds || stageData.rounds.length === 0) return map;

    const runningRecords: Record<string, { wins: number; losses: number }> = {};
    const sortedRounds = [...stageData.rounds].sort(
      (a, b) => (a.round_number || 0) - (b.round_number || 0)
    );

    sortedRounds.forEach((r) => {
      const roundNum = r.round_number;
      const matches = r.matches || [];

      matches.forEach((m) => {
        const slugA = m.team_a?.slug;
        const slugB = m.team_b?.slug;

        if (slugA && !runningRecords[slugA]) {
          runningRecords[slugA] = { wins: 0, losses: 0 };
        }
        if (slugB && !runningRecords[slugB]) {
          runningRecords[slugB] = { wins: 0, losses: 0 };
        }

        const prevWinsA = slugA ? runningRecords[slugA].wins : 0;
        const prevLossesA = slugA ? runningRecords[slugA].losses : 0;
        const prevWinsB = slugB ? runningRecords[slugB].wins : 0;
        const prevLossesB = slugB ? runningRecords[slugB].losses : 0;

        let postWinsA = prevWinsA;
        let postLossesA = prevLossesA;
        let postWinsB = prevWinsB;
        let postLossesB = prevLossesB;

        if (isMatchFinished(m)) {
          const winner = getMatchWinnerSlug(m);
          if (winner && slugA && winner.trim() === slugA.trim()) {
            postWinsA += 1;
            postLossesB += 1;
          } else if (winner && slugB && winner.trim() === slugB.trim()) {
            postWinsB += 1;
            postLossesA += 1;
          } else if (typeof m.score_a === "number" && typeof m.score_b === "number") {
            if (m.score_a > m.score_b) {
              postWinsA += 1;
              postLossesB += 1;
            } else if (m.score_b > m.score_a) {
              postWinsB += 1;
              postLossesA += 1;
            }
          }
        }

        if (slugA) {
          runningRecords[slugA] = { wins: postWinsA, losses: postLossesA };
          const isQualified = postWinsA >= 3 && prevWinsA < 3;
          const isEliminated = postLossesA >= 3 && prevLossesA < 3;

          map[`${roundNum}_${m.match_number}_${slugA}`] = {
            wins: postWinsA,
            losses: postLossesA,
            isQualified,
            isEliminated,
          };
        }

        if (slugB) {
          runningRecords[slugB] = { wins: postWinsB, losses: postLossesB };
          const isQualified = postWinsB >= 3 && prevWinsB < 3;
          const isEliminated = postLossesB >= 3 && prevLossesB < 3;

          map[`${roundNum}_${m.match_number}_${slugB}`] = {
            wins: postWinsB,
            losses: postLossesB,
            isQualified,
            isEliminated,
          };
        }
      });
    });

    return map;
  }, [stageData]);

  const romanNumerals = [
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII",
    "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"
  ];

  // Map real standings or fallback to 16 seeds
  const realStandings = standingsData ?? stageData?.standings ?? null;
  const hasRealStandings = Boolean(realStandings && realStandings.length > 0);
  
  const standings = hasRealStandings && realStandings
    ? realStandings.map((s) => {
        const diff = s.games_won - s.games_lost;
        const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
        const isTop8 = s.position <= (stageData?.teams_advancing || 8);
        const isQualified = s.wins >= 3 || s.status === "QUALIFIED";
        const isEliminated = s.losses >= 3 || s.status === "ELIMINATED";
        return {
          position: s.position,
          roman: romanNumerals[s.position - 1] || `${s.position}`,
          teamName: s.team.name,
          teamSlug: s.team.slug,
          teamTag: s.team.tag,
          teamLogo: s.team.logo_url,
          wins: s.wins,
          losses: s.losses,
          record: `${s.wins} - ${s.losses}`,
          differential: diffStr,
          status: s.status,
          isTop8,
          isQualified,
          isEliminated,
        };
      })
    : Array.from({ length: 16 }, (_, i) => {
        const isTop8 = i < 8;
        return {
          position: i + 1,
          roman: romanNumerals[i],
          teamName: `Equipo ${i + 1}`,
          teamSlug: `team-${i + 1}`,
          teamTag: `T${i + 1}`,
          teamLogo: null,
          wins: 0,
          losses: 0,
          record: "0 - 0",
          differential: "0",
          status: "ONGOING",
          isTop8,
          isQualified: false,
          isEliminated: false,
        };
      });

  // Map real rounds or fallback
  const realRounds = stageData?.rounds ?? null;
  const hasRealRounds = Boolean(realRounds && realRounds.length > 0);
  const currentRoundNum = stageData?.current_round_number || null;

  const getRoundDisplayStatus = (
    statusRaw: string | undefined,
    matches: StageMatchData[] | undefined,
    roundNum: number
  ): string => {
    // 1. Si la ronda tiene partidos y TODOS están terminados -> FINALIZADO
    if (matches && matches.length > 0 && matches.every(isMatchFinished)) {
      return "FINALIZADO";
    }

    // 2. Si la fase completa ya terminó
    const stageStatus = (stageData?.status || "").toUpperCase();
    if (stageStatus === "FINISHED" || stageStatus === "COMPLETED") {
      return "FINALIZADO";
    }

    // 3. Si hay al menos un partido terminado o con progreso en esta ronda
    if (matches && matches.length > 0) {
      const hasActivity = matches.some((m) => {
        const ms = (m.status || "").toUpperCase();
        return (
          isMatchFinished(m) ||
          ms === "ONGOING" ||
          ms === "IN_PROGRESS" ||
          ms === "LIVE" ||
          (typeof m.score_a === "number" && m.score_a > 0) ||
          (typeof m.score_b === "number" && m.score_b > 0)
        );
      });
      if (hasActivity) {
        return "EN CURSO";
      }
    }

    // 4. Estado explícito del backend
    const st = (statusRaw || "").toUpperCase();
    if (st === "FINISHED" || st === "COMPLETED") {
      return "FINALIZADO";
    }
    if (st === "ONGOING" || st === "IN_PROGRESS" || st === "LIVE") {
      return "EN CURSO";
    }

    // 5. Comparar con current_round_number
    if (currentRoundNum !== null && currentRoundNum > 0) {
      if (roundNum < currentRoundNum) {
        return "FINALIZADO";
      }
      if (roundNum === currentRoundNum) {
        return "EN CURSO";
      }
      if (roundNum > currentRoundNum) {
        return "PENDIENTE";
      }
    }

    return "PENDIENTE";
  };

  const empty5Heroes = Array.from({ length: 5 }, () => ({
    has_hero: false,
    hero_id: null,
    hero_name: null,
    image_url: null,
  }));

  const defaultRounds = [
    {
      name: "Ronda 1",
      desc: "16 Equipos · 8 Cruces Iniciales (BO1)",
      status: "EN CURSO",
      format: "BO1",
      matches: [
        {
          match_number: 1,
          best_of: "BO1",
          score_a: 0,
          score_b: 0,
          status: "SCHEDULED",
          winner_slug: null,
          team_a: { name: "Tundra Esports", slug: "tundra-esports", tag: "TUN", logo_url: null, region: "WEU", country: "", city: "" },
          team_b: { name: "Gaimin Gladiators", slug: "gaimin-gladiators", tag: "GG", logo_url: null, region: "WEU", country: "", city: "" },
          scheduled_at: null,
          games: [
            {
              game_number: 1,
              status: "SCHEDULED",
              opendota_match_id: null,
              radiant_team: { name: "Tundra Esports", slug: "tundra-esports", tag: "TUN", logo_url: null, region: "WEU", country: "", city: "" },
              dire_team: { name: "Gaimin Gladiators", slug: "gaimin-gladiators", tag: "GG", logo_url: null, region: "WEU", country: "", city: "" },
              radiant_picks: [],
              dire_picks: [],
              radiant_heroes: empty5Heroes,
              dire_heroes: empty5Heroes,
              winner_slug: null,
              duration_seconds: null,
              started_at: null,
              ended_at: null,
            },
          ],
        },
        {
          match_number: 2,
          best_of: "BO1",
          score_a: 0,
          score_b: 0,
          status: "SCHEDULED",
          winner_slug: null,
          team_a: { name: "PSG Quest", slug: "psg-quest", tag: "QUEST", logo_url: null, region: "WEU", country: "", city: "" },
          team_b: { name: "Team Spirit", slug: "team-spirit", tag: "TS", logo_url: null, region: "EEU", country: "", city: "" },
          scheduled_at: null,
          games: [
            {
              game_number: 1,
              status: "SCHEDULED",
              opendota_match_id: null,
              radiant_team: { name: "PSG Quest", slug: "psg-quest", tag: "QUEST", logo_url: null, region: "WEU", country: "", city: "" },
              dire_team: { name: "Team Spirit", slug: "team-spirit", tag: "TS", logo_url: null, region: "EEU", country: "", city: "" },
              radiant_picks: [],
              dire_picks: [],
              radiant_heroes: empty5Heroes,
              dire_heroes: empty5Heroes,
              winner_slug: null,
              duration_seconds: null,
              started_at: null,
              ended_at: null,
            },
          ],
        },
        {
          match_number: 3,
          best_of: "BO1",
          score_a: 0,
          score_b: 0,
          status: "SCHEDULED",
          winner_slug: null,
          team_a: { name: "Xtreme Gaming", slug: "xtreme-gaming", tag: "XG", logo_url: null, region: "CN", country: "", city: "" },
          team_b: { name: "Heroic", slug: "heroic", tag: "HERO", logo_url: null, region: "SA", country: "", city: "" },
          scheduled_at: null,
          games: [
            {
              game_number: 1,
              status: "SCHEDULED",
              opendota_match_id: null,
              radiant_team: { name: "Xtreme Gaming", slug: "xtreme-gaming", tag: "XG", logo_url: null, region: "CN", country: "", city: "" },
              dire_team: { name: "Heroic", slug: "heroic", tag: "HERO", logo_url: null, region: "SA", country: "", city: "" },
              radiant_picks: [],
              dire_picks: [],
              radiant_heroes: empty5Heroes,
              dire_heroes: empty5Heroes,
              winner_slug: null,
              duration_seconds: null,
              started_at: null,
              ended_at: null,
            },
          ],
        },
        {
          match_number: 4,
          best_of: "BO1",
          score_a: 0,
          score_b: 0,
          status: "SCHEDULED",
          winner_slug: null,
          team_a: { name: "BetBoom Team", slug: "betboom-team", tag: "BB", logo_url: null, region: "EEU", country: "", city: "" },
          team_b: { name: "beastcoast", slug: "beastcoast", tag: "BC", logo_url: null, region: "SA", country: "", city: "" },
          scheduled_at: null,
          games: [
            {
              game_number: 1,
              status: "SCHEDULED",
              opendota_match_id: null,
              radiant_team: { name: "BetBoom Team", slug: "betboom-team", tag: "BB", logo_url: null, region: "EEU", country: "", city: "" },
              dire_team: { name: "beastcoast", slug: "beastcoast", tag: "BC", logo_url: null, region: "SA", country: "", city: "" },
              radiant_picks: [],
              dire_picks: [],
              radiant_heroes: empty5Heroes,
              dire_heroes: empty5Heroes,
              winner_slug: null,
              duration_seconds: null,
              started_at: null,
              ended_at: null,
            },
          ],
        },
        {
          match_number: 5,
          best_of: "BO1",
          score_a: 1,
          score_b: 0,
          status: "COMPLETED",
          winner_slug: null,
          team_a: { name: "Team Liquid", slug: "team-liquid", tag: "TL", logo_url: null, region: "WEU", country: "", city: "" },
          team_b: { name: "Shopify Rebellion", slug: "shopify-rebellion", tag: "SR", logo_url: null, region: "NA", country: "", city: "" },
          scheduled_at: null,
          games: [
            {
              game_number: 1,
              status: "COMPLETED",
              opendota_match_id: null,
              radiant_team: { name: "Team Liquid", slug: "team-liquid", tag: "TL", logo_url: null, region: "WEU", country: "", city: "" },
              dire_team: { name: "Shopify Rebellion", slug: "shopify-rebellion", tag: "SR", logo_url: null, region: "NA", country: "", city: "" },
              radiant_picks: [1, 2, 3, 4, 5],
              dire_picks: [6, 7, 8, 9, 10],
              radiant_heroes: [
                { has_hero: true, hero_id: 1, hero_name: "Antimage", image_url: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png" },
                { has_hero: true, hero_id: 2, hero_name: "Axe", image_url: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/axe.png" },
                { has_hero: true, hero_id: 3, hero_name: "Bane", image_url: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bane.png" },
                { has_hero: true, hero_id: 4, hero_name: "Bloodseeker", image_url: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bloodseeker.png" },
                { has_hero: true, hero_id: 5, hero_name: "Crystal Maiden", image_url: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/crystal_maiden.png" },
              ],
              dire_heroes: [
                { has_hero: true, hero_id: 6, hero_name: "Drow Ranger", image_url: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/drow_ranger.png" },
                { has_hero: true, hero_id: 7, hero_name: "Earthshaker", image_url: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/earthshaker.png" },
                { has_hero: true, hero_id: 8, hero_name: "Juggernaut", image_url: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/juggernaut.png" },
                { has_hero: true, hero_id: 9, hero_name: "Mirana", image_url: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/mirana.png" },
                { has_hero: true, hero_id: 10, hero_name: "Morphling", image_url: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/morphling.png" },
              ],
              winner_slug: null,
              duration_seconds: null,
              started_at: "2026-09-03T12:00:00Z",
              ended_at: null,
            },
          ],
        },
        {
          match_number: 6,
          best_of: "BO1",
          score_a: 0,
          score_b: 0,
          status: "SCHEDULED",
          winner_slug: null,
          team_a: { name: "Team Falcons", slug: "team-falcons", tag: "FLCN", logo_url: null, region: "WEU", country: "", city: "" },
          team_b: { name: "Aurora", slug: "aurora", tag: "AUR", logo_url: null, region: "SEA", country: "", city: "" },
          scheduled_at: null,
          games: [
            {
              game_number: 1,
              status: "SCHEDULED",
              opendota_match_id: null,
              radiant_team: { name: "Team Falcons", slug: "team-falcons", tag: "FLCN", logo_url: null, region: "WEU", country: "", city: "" },
              dire_team: { name: "Aurora", slug: "aurora", tag: "AUR", logo_url: null, region: "SEA", country: "", city: "" },
              radiant_picks: [],
              dire_picks: [],
              radiant_heroes: empty5Heroes,
              dire_heroes: empty5Heroes,
              winner_slug: null,
              duration_seconds: null,
              started_at: null,
              ended_at: null,
            },
          ],
        },
        {
          match_number: 7,
          best_of: "BO1",
          score_a: 0,
          score_b: 0,
          status: "SCHEDULED",
          winner_slug: null,
          team_a: { name: "Natus Vincere", slug: "natus-vincere", tag: "NAVI", logo_url: null, region: "EEU", country: "", city: "" },
          team_b: { name: "Blacklist International", slug: "blacklist-international", tag: "BLCK", logo_url: null, region: "SEA", country: "", city: "" },
          scheduled_at: null,
          games: [
            {
              game_number: 1,
              status: "SCHEDULED",
              opendota_match_id: null,
              radiant_team: { name: "Natus Vincere", slug: "natus-vincere", tag: "NAVI", logo_url: null, region: "EEU", country: "", city: "" },
              dire_team: { name: "Blacklist International", slug: "blacklist-international", tag: "BLCK", logo_url: null, region: "SEA", country: "", city: "" },
              radiant_picks: [],
              dire_picks: [],
              radiant_heroes: empty5Heroes,
              dire_heroes: empty5Heroes,
              winner_slug: null,
              duration_seconds: null,
              started_at: null,
              ended_at: null,
            },
          ],
        },
        {
          match_number: 8,
          best_of: "BO1",
          score_a: 0,
          score_b: 0,
          status: "SCHEDULED",
          winner_slug: null,
          team_a: { name: "LGD Gaming", slug: "lgd-gaming", tag: "LGD", logo_url: null, region: "CN", country: "", city: "" },
          team_b: { name: "BOOM Esports", slug: "boom-esports", tag: "BOOM", logo_url: null, region: "SA", country: "", city: "" },
          scheduled_at: null,
          games: [
            {
              game_number: 1,
              status: "SCHEDULED",
              opendota_match_id: null,
              radiant_team: { name: "LGD Gaming", slug: "lgd-gaming", tag: "LGD", logo_url: null, region: "CN", country: "", city: "" },
              dire_team: { name: "BOOM Esports", slug: "boom-esports", tag: "BOOM", logo_url: null, region: "SA", country: "", city: "" },
              radiant_picks: [],
              dire_picks: [],
              radiant_heroes: empty5Heroes,
              dire_heroes: empty5Heroes,
              winner_slug: null,
              duration_seconds: null,
              started_at: null,
              ended_at: null,
            },
          ],
        },
      ],
    },
    { name: "Ronda 2", desc: "Pool 1-0 (Ganadores) vs Pool 0-1 (Perdedores)", status: "PENDIENTE", format: "BO1", matches: [] },
    { name: "Ronda 3", desc: "Cruces de Clasificación 2-0 (BO3) y Eliminación 0-2 (BO3)", status: "PENDIENTE", format: "BO3", matches: [] },
    { name: "Ronda 4", desc: "Pool 2-1 (Clasificación) y Pool 1-2 (Eliminación)", status: "PENDIENTE", format: "BO3", matches: [] },
    { name: "Ronda 5", desc: "La Batalla Final 2-2 · 3 Cruces BO3 a muerte súbita", status: "PENDIENTE", format: "BO3", matches: [] },
  ];

  const rounds = hasRealRounds && realRounds
    ? realRounds.map((r, idx) => {
        const roundNum = r.round_number || idx + 1;
        return {
          name: r.name || `Ronda ${roundNum}`,
          desc: `${r.matches.length > 0 ? `${r.matches.length} Enfrentamientos` : "Cruces de la ronda"} (${r.default_format || "BO1"})`,
          status: getRoundDisplayStatus(r.status, r.matches, roundNum),
          format: r.default_format || "BO1",
          matches: r.matches || [],
          roundNumber: roundNum,
        };
      })
    : defaultRounds.map((r, idx) => {
        const roundNum = idx + 1;
        return {
          ...r,
          status: getRoundDisplayStatus(r.status, r.matches, roundNum),
          roundNumber: roundNum,
        };
      });

  // Selected round for matches view
  const activeSelectedRound = rounds.find((r) => r.roundNumber === selectedRoundNumber) || rounds[0];

  return (
    <section
      id="swiss"
      className="relative w-full border-t border-[#2d261e] bg-[#120f0a] py-14 sm:py-20 lg:py-28 text-white overflow-hidden"
    >
      {/* Subtle Roman Background Grid & Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(46,157,240,0.06),transparent_50%)]" />
      <div className="pointer-events-none absolute right-10 bottom-10 h-72 sm:h-80 w-72 sm:w-80 rounded-full bg-[#d8b467]/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-3 sm:mb-4 flex items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto">
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-[#2e9df0]/60 to-[#2e9df0]" />
            <div className="flex items-center gap-2 font-chakra text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#6cc4ff] drop-shadow-[0_2px_10px_rgba(46,157,240,0.45)]">
              <IconShieldCheck size={15} className="text-[#6cc4ff] shrink-0" />
              <span>FASE 1 · EL FILTRO IMPERIAL</span>
              <IconShieldCheck size={15} className="text-[#6cc4ff] shrink-0" />
            </div>
            <div className="h-px flex-1 bg-linear-to-l from-transparent via-[#2e9df0]/60 to-[#2e9df0]" />
          </div>

          <h2 className="mt-4 sm:mt-5 font-coliseo-title text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
            La Swiss <span className="text-[#6cc4ff]">Stage</span>
          </h2>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base font-medium leading-relaxed text-[#c7bcab]">
            Cinco rondas de fuego donde cada serie cuenta. Con <span className="text-[#6cc4ff] font-bold">3 victorias</span> aseguran
            el pase a los Playoffs del Coliseo; con <span className="text-[#ff7373] font-bold">3 derrotas</span> quedan desterradas.
          </p>

          {/* Smooth Sliding Tab Switcher with layoutId */}
          <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:inline-flex w-full sm:w-auto border border-[#2d261e] bg-[#1c1712] p-1 relative">
            <button
              onClick={() => handleTabChange("STANDINGS")}
              className={`relative z-10 px-3 sm:px-5 py-2.5 font-chakra text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center ${
                activeTab === "STANDINGS" ? "text-white font-extrabold" : "text-[#a8a197] hover:text-white"
              }`}
            >
              {activeTab === "STANDINGS" && (
                <motion.div
                  layoutId="swissTabIndicator"
                  className="absolute inset-0 z-[-1] border border-[#2e9df0]/60 bg-[#2e9df0]/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              Tabla de Posiciones
            </button>
            <button
              onClick={() => handleTabChange("ROUNDS")}
              className={`relative z-10 px-3 sm:px-5 py-2.5 font-chakra text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center ${
                activeTab === "ROUNDS" ? "text-white font-extrabold" : "text-[#a8a197] hover:text-white"
              }`}
            >
              {activeTab === "ROUNDS" && (
                <motion.div
                  layoutId="swissTabIndicator"
                  className="absolute inset-0 z-[-1] border border-[#2e9df0]/60 bg-[#2e9df0]/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              Estructura de Rondas
            </button>
          </div>

          {/* Boton Ver Transmision en Vivo (visible solo si hay partidas ONGOING) */}
          {hasOngoingMatchInStage(stageData) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 flex justify-center"
            >
              <button
                onClick={() => setIsLiveModalOpen(true)}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 border border-[#53fc18]/60 bg-linear-to-r from-[#53fc18]/20 via-[#53fc18]/10 to-[#53fc18]/20 hover:from-[#53fc18]/30 hover:to-[#53fc18]/30 text-white font-chakra text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(83,252,24,0.35)] hover:shadow-[0_0_25px_rgba(83,252,24,0.6)] transition-all cursor-pointer rounded-xs group"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#53fc18] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#53fc18]" />
                </span>
                <span className="text-[#53fc18] font-black">VER TRANSMISIÓN EN VIVO</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#53fc18] bg-black/80 border border-[#53fc18]/50 px-2 py-0.5 rounded-xs">
                  <IconBrandKick size={12} className="text-[#53fc18]" />
                  KICK.COM/BENJAZ
                </span>
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Content Tabs with AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeTab === "STANDINGS" ? (
            <motion.div
              key="standings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-8 sm:mt-12"
            >
              {/* Standings Table Container */}
              <div className="overflow-hidden border border-[#2d261e] bg-[#16120e] shadow-2xl backdrop-blur-md">
                <div className="overflow-x-auto touch-scroll">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-[#2d261e] bg-[#1d1712] text-[11px] uppercase tracking-widest text-[#9c9389]">
                        <th className="py-3.5 pl-6 pr-4">Posición</th>
                        <th className="py-3.5 px-4">Equipo</th>
                        <th className="py-3.5 px-4 text-center">Récord (V - D)</th>
                        <th className="py-3.5 px-4 text-center">Dif. Mapas</th>
                        <th className="py-3.5 pr-6 pl-4 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#241e17]">
                      {standings.map((row) => {
                        const captainDisplay = getCaptainTag(
                          { slug: row.teamSlug, tag: row.teamTag, name: row.teamName },
                          captainMap
                        );

                        return (
                          <tr
                            key={row.position}
                            className={`transition-colors ${
                              row.isQualified
                                ? "bg-[#141d16]/70 hover:bg-[#1a261c] border-l-2 border-l-[#54a06d]"
                                : row.isEliminated
                                ? "bg-[#181112]/70 hover:bg-[#201618] border-l-2 border-l-[#a85359]"
                                : "bg-[#14110d] hover:bg-[#1f1913]"
                            }`}
                          >
                            {/* Position Badge */}
                            <td className="py-3.5 pl-6 pr-4 font-bold text-[#c7bcab]">
                              <span
                                className={`inline-flex h-6 w-6 items-center justify-center font-chakra text-xs font-bold ${
                                  row.isQualified
                                    ? "border border-[#3a5d45] bg-[#17261c] text-[#8cd49f]"
                                    : row.isEliminated
                                    ? "border border-[#5c373a] bg-[#26181a] text-[#d48c90]"
                                    : "border border-[#2d261e] bg-[#181410] text-[#8e857b]"
                                }`}
                              >
                                {row.position.toString().padStart(2, "0")}
                              </span>
                            </td>

                            {/* Team Name with Logo & Link */}
                            <td className="py-3 px-4 font-chakra font-bold text-white">
                              {row.teamSlug ? (
                                <Link
                                  href={`/teams/${row.teamSlug}`}
                                  className="group/team inline-flex items-center gap-3.5 hover:opacity-95 transition-all"
                                >
                                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center border border-[#2d261e] bg-[#14100c] p-1 group-hover/team:border-[#d8b467]/70 group-hover/team:shadow-[0_0_12px_rgba(216,180,103,0.25)] transition-all">
                                    {row.teamLogo ? (
                                      <picture>
                                        <img
                                          src={row.teamLogo}
                                          alt={row.teamName}
                                          className="h-full w-full object-contain group-hover/team:scale-105 transition-transform"
                                        />
                                      </picture>
                                    ) : (
                                      <IconShield size={20} className="text-[#8e857b]" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                    <span className="truncate text-sm sm:text-[15px] group-hover/team:text-[#f0d38f] transition-colors">{row.teamName}</span>
                                    {captainDisplay && (
                                      <span className="font-chakra font-semibold text-[10px] sm:text-xs text-[#d8b467] tracking-wider">
                                        [{captainDisplay}]
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              ) : (
                                <div className="flex items-center gap-3.5">
                                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center border border-[#2d261e] bg-[#14100c] p-1">
                                    {row.teamLogo ? (
                                      <picture>
                                        <img
                                          src={row.teamLogo}
                                          alt={row.teamName}
                                          className="h-full w-full object-contain"
                                        />
                                      </picture>
                                    ) : (
                                      <IconShield size={20} className="text-[#8e857b]" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                    <span className="truncate text-sm sm:text-[15px]">{row.teamName}</span>
                                    {captainDisplay && (
                                      <span className="font-chakra font-semibold text-[10px] sm:text-xs text-[#d8b467] tracking-wider">
                                        [{captainDisplay}]
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>

                          {/* Record */}
                          <td className="py-3.5 px-4 text-center font-bold">
                            <span className="text-[#8cd49f]">{row.wins}V</span>
                            <span className="mx-1 text-[#6b6257]">-</span>
                            <span className="text-[#d48c90]">{row.losses}D</span>
                          </td>

                          {/* Differential */}
                          <td
                            className={`py-3.5 px-4 text-center font-bold ${
                              parseInt(row.differential) > 0
                                ? "text-[#8cd49f]"
                                : parseInt(row.differential) < 0
                                ? "text-[#d48c90]"
                                : "text-[#7e756b]"
                            }`}
                          >
                            {row.differential}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 pr-6 pl-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-chakra font-bold tracking-wider uppercase ${
                                row.isQualified
                                  ? "border border-[#3a5d45] bg-[#17261c] text-[#8cd49f]"
                                  : row.isEliminated
                                  ? "border border-[#5c373a] bg-[#26181a] text-[#d48c90]"
                                  : row.isTop8
                                  ? "border border-[#2e9df0]/30 bg-[#2e9df0]/10 text-[#6cc4ff]"
                                  : "border border-[#3d3228] bg-[#1b1511] text-[#9c9083]"
                              }`}
                            >
                              {row.isQualified ? (
                                <>
                                  <IconCheck size={13} className="text-[#8cd49f]" />
                                  <span>CLASIFICADO</span>
                                </>
                              ) : row.isEliminated ? (
                                <>
                                  <IconSkull size={13} className="text-[#d48c90]" />
                                  <span>ELIMINADO</span>
                                </>
                              ) : row.isTop8 ? (
                                <>
                                  <IconCheck size={12} />
                                  <span>En Clasificación</span>
                                </>
                              ) : (
                                <>
                                  <IconSkull size={12} />
                                  <span>Zona Peligro</span>
                                </>
                              )}
                            </span>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Format Rounds Breakdown & Matches */
            <motion.div
              key="format-rounds"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-8 sm:mt-12 space-y-6"
            >
              {/* Interactive Round Selector Cards */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                {rounds.map((r, i) => {
                  const isPending = r.status === "PENDIENTE" || r.status === "PENDING";
                  const isOngoing = r.status === "EN CURSO" || r.status === "ONGOING";
                  const isFinished = r.status === "FINALIZADO" || r.status === "FINISHED";
                  const isSelected = r.roundNumber === selectedRoundNumber;

                  return (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedRoundNumber(r.roundNumber);
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className={`relative p-4 sm:p-5 text-left transition-all cursor-pointer outline-none ${
                        isSelected
                          ? "border-2 border-[#2e9df0] bg-linear-to-b from-[#1c222b] to-[#14100c]"
                          : isOngoing
                          ? "border border-[#2e9df0]/60 bg-linear-to-b from-[#181d24] to-[#14100c] hover:border-[#2e9df0]"
                          : isFinished
                          ? "border border-emerald-500/40 bg-linear-to-b from-[#121f17] to-[#14100c] hover:border-emerald-500/70"
                          : "border border-[#2d261e] bg-[#120f0a]/60 opacity-60 hover:opacity-100 hover:border-[#3d3328]"
                      }`}
                    >
                      {/* Ongoing indicator line */}
                      {isOngoing && !isSelected && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#2e9df0]" />
                      )}

                      <div className="flex items-center justify-between border-b pb-2.5 font-chakra border-[#2d261e]">
                        <span
                          className={`text-xs font-bold ${
                            isSelected
                              ? "text-[#6cc4ff] font-black"
                              : isPending
                              ? "text-[#8e857b]"
                              : isOngoing
                              ? "text-[#f0d38f] font-black"
                              : "text-emerald-400"
                          }`}
                        >
                          {r.name}
                        </span>
                        <span
                          className={`font-mono text-[9px] px-1.5 py-0.5 border ${
                            isSelected
                              ? "border-[#2e9df0]/60 bg-[#2e9df0]/15 text-[#6cc4ff]"
                              : isPending
                              ? "border-[#241e17] bg-[#14100c] text-[#7e756b]"
                              : isOngoing
                              ? "border-[#2e9df0]/40 bg-[#2e9df0]/10 text-[#6cc4ff]"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          ETAPA {r.roundNumber}
                        </span>
                      </div>

                      <p
                        className={`my-3 sm:my-4 text-xs leading-relaxed ${
                          isSelected
                            ? "text-white font-medium"
                            : isPending
                            ? "text-[#7e756b]"
                            : isOngoing
                            ? "text-[#e0deda]"
                            : "text-[#c7bcab]"
                        }`}
                      >
                        {r.desc}
                      </p>

                      <div
                        className={`flex items-center gap-1.5 border-t pt-2.5 sm:pt-3 font-mono text-[10px] ${
                          isSelected
                            ? "border-[#2e9df0]/40 text-[#6cc4ff]"
                            : isPending
                            ? "border-[#241e17] text-[#7e756b]"
                            : isOngoing
                            ? "border-[#2e9df0]/30 text-[#6cc4ff]"
                            : "border-emerald-500/30 text-emerald-400"
                        }`}
                      >
                        {isFinished ? (
                          <IconCheck size={12} className="text-emerald-400" />
                        ) : (
                          <IconClock size={12} className={isOngoing ? "animate-spin" : ""} />
                        )}
                        <span className="font-bold tracking-wider">{r.status}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Filtered Matches Section for Selected Round */}
              <div className="mt-6 sm:mt-8 border border-[#2d261e] bg-[#181410] p-4 sm:p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#2d261e] pb-4 mb-5 sm:mb-6 gap-3">
                  <div className="flex items-center gap-2">
                    <IconSwords size={20} className="text-[#6cc4ff] shrink-0" />
                    <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#f0d38f] uppercase tracking-wider">
                      Enfrentamientos - {activeSelectedRound?.name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="border border-[#2e9df0]/40 bg-[#2e9df0]/10 px-2.5 py-0.5 text-[#6cc4ff] font-bold">
                      FORMATO: {activeSelectedRound?.format}
                    </span>
                    <span className="border border-[#2d261e] bg-[#14100c] px-2.5 py-0.5 text-[#8e857b]">
                      ESTADO: {activeSelectedRound?.status}
                    </span>
                  </div>
                </div>

                {activeSelectedRound?.matches && activeSelectedRound.matches.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-start">
                    {activeSelectedRound.matches.map((m, idx) => {
                      const infoA = m.team_a?.slug
                        ? roundMatchTeamInfoMap[
                            `${activeSelectedRound?.roundNumber}_${m.match_number}_${m.team_a.slug}`
                          ]
                        : null;
                      const infoB = m.team_b?.slug
                        ? roundMatchTeamInfoMap[
                            `${activeSelectedRound?.roundNumber}_${m.match_number}_${m.team_b.slug}`
                          ]
                        : null;

                      const recA = infoA || (m.team_a?.slug ? teamRecordMap[m.team_a.slug] : null);
                      const recB = infoB || (m.team_b?.slug ? teamRecordMap[m.team_b.slug] : null);

                      const gamesList: StageGameData[] =
                        m.games && m.games.length > 0
                          ? m.games
                          : [
                              {
                                slug: (m as StageMatchData).slug ? `${(m as StageMatchData).slug}-game-1` : undefined,
                                game_number: 1,
                                status: m.status || "SCHEDULED",
                                radiant_picks: [],
                                dire_picks: [],
                                radiant_heroes: [],
                                dire_heroes: [],
                                radiant_team: m.team_a,
                                dire_team: m.team_b,
                                opendota_match_id: null,
                                winner_slug: null,
                                duration_seconds: null,
                                started_at: null,
                                ended_at: null,
                              },
                            ];

                      const matchDateFormatted = formatDateString(m.scheduled_at);
                      const isOngoingMatch = isStatusOngoing(m.status);
                      const matchSlug = "slug" in m ? (m.slug as string) : undefined;
                      const captainA = getCaptainTag(m.team_a, captainMap, matchSlug);
                      const captainB = getCaptainTag(m.team_b, captainMap, matchSlug);

                      return (
                        <div
                          key={idx}
                          className={`border p-4 text-xs font-mono space-y-3 transition-colors flex flex-col justify-start ${
                            isOngoingMatch
                              ? "border-[#53fc18]/60 bg-[#0d160b] shadow-[0_0_18px_rgba(83,252,24,0.2)]"
                              : "border-[#2d261e] bg-[#120f0a] hover:border-[#3a3126]"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-[#8e857b] border-b border-[#241e17] pb-2 flex-wrap gap-1">
                              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                <span className="font-bold text-[#e0deda]">PARTIDO #{m.match_number}</span>
                                {isOngoingMatch && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#53fc18] bg-[#53fc18]/10 border border-[#53fc18]/50 px-1.5 py-0.5 rounded-xs animate-pulse">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#53fc18] animate-ping" />
                                    EN VIVO (LIVE)
                                  </span>
                                )}
                                {matchDateFormatted && !isOngoingMatch && (
                                  <span className="text-[#9c9388] font-normal flex items-center gap-1">
                                    • {matchDateFormatted}
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-[#6cc4ff]">{m.best_of}</span>
                            </div>

                            <div className="space-y-3 font-chakra mt-3">
                              {/* Team A */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {m.team_a?.slug ? (
                                    <Link
                                      href={`/teams/${m.team_a.slug}`}
                                      className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#2d261e] bg-[#14100c] p-0.5 hover:border-[#d8b467]/70 transition-colors"
                                    >
                                      {m.team_a?.logo_url ? (
                                        <picture>
                                          <img
                                            src={m.team_a.logo_url}
                                            alt={m.team_a.name}
                                            className="h-full w-full object-contain"
                                          />
                                        </picture>
                                      ) : (
                                        <IconShield size={14} className="text-[#8e857b]" />
                                      )}
                                    </Link>
                                  ) : (
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#2d261e] bg-[#14100c] p-0.5">
                                      {m.team_a?.logo_url ? (
                                        <picture>
                                          <img
                                            src={m.team_a.logo_url}
                                            alt={m.team_a.name}
                                            className="h-full w-full object-contain"
                                          />
                                        </picture>
                                      ) : (
                                        <IconShield size={14} className="text-[#8e857b]" />
                                      )}
                                    </div>
                                  )}

                                  <div className="flex flex-col min-w-0 leading-tight">
                                    {m.team_a?.slug ? (
                                      <Link
                                        href={`/teams/${m.team_a.slug}`}
                                        className={`truncate hover:text-[#f0d38f] transition-colors ${
                                          m.winner_slug === m.team_a?.slug
                                            ? "text-[#53fc18] font-bold"
                                            : "text-white font-medium"
                                        }`}
                                      >
                                        {m.team_a?.name || "TBD"}
                                      </Link>
                                    ) : (
                                      <span
                                        className={`truncate ${
                                          m.winner_slug === m.team_a?.slug
                                            ? "text-[#53fc18] font-bold"
                                            : "text-white font-medium"
                                        }`}
                                      >
                                        {m.team_a?.name || "TBD"}
                                      </span>
                                    )}

                                    {captainA && (
                                      <span className="text-[9px] font-chakra font-semibold text-[#d8b467] tracking-wide mt-0.5">
                                        [{captainA}]
                                      </span>
                                    )}

                                    {m.team_a && (
                                      <div className="font-mono text-[9px] flex items-center gap-1.5 font-bold mt-0.5 flex-wrap">
                                        <div className="flex items-center gap-0.5">
                                          <span className="text-[#53fc18]">{recA ? recA.wins : 0}V</span>
                                          <span className="text-[#7e756b]">-</span>
                                          <span className="text-[#ff7373]">{recA ? recA.losses : 0}D</span>
                                        </div>

                                        {recA?.isQualified && (
                                          <span className="inline-flex items-center gap-0.5 border border-emerald-500/40 bg-emerald-950/50 px-1 py-0.2 text-[8px] font-chakra font-bold text-emerald-400 tracking-wider">
                                            <IconCheck size={8} className="stroke-[2.5]" />
                                            <span>CLASIFICADO</span>
                                          </span>
                                        )}

                                        {recA?.isEliminated && (
                                          <span className="inline-flex items-center gap-0.5 border border-rose-500/40 bg-rose-950/50 px-1 py-0.2 text-[8px] font-chakra font-bold text-rose-400 tracking-wider">
                                            <IconSkull size={8} />
                                            <span>ELIMINADO</span>
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <span className="font-bold text-[#f0d38f] text-base ml-2">
                                  {m.score_a}
                                </span>
                              </div>

                              {/* Team B */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {m.team_b?.slug ? (
                                    <Link
                                      href={`/teams/${m.team_b.slug}`}
                                      className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#2d261e] bg-[#14100c] p-0.5 hover:border-[#d8b467]/70 transition-colors"
                                    >
                                      {m.team_b?.logo_url ? (
                                        <picture>
                                          <img
                                            src={m.team_b.logo_url}
                                            alt={m.team_b.name}
                                            className="h-full w-full object-contain"
                                          />
                                        </picture>
                                      ) : (
                                        <IconShield size={14} className="text-[#8e857b]" />
                                      )}
                                    </Link>
                                  ) : (
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#2d261e] bg-[#14100c] p-0.5">
                                      {m.team_b?.logo_url ? (
                                        <picture>
                                          <img
                                            src={m.team_b.logo_url}
                                            alt={m.team_b.name}
                                            className="h-full w-full object-contain"
                                          />
                                        </picture>
                                      ) : (
                                        <IconShield size={14} className="text-[#8e857b]" />
                                      )}
                                    </div>
                                  )}

                                  <div className="flex flex-col min-w-0 leading-tight">
                                    {m.team_b?.slug ? (
                                      <Link
                                        href={`/teams/${m.team_b.slug}`}
                                        className={`truncate hover:text-[#f0d38f] transition-colors ${
                                          m.winner_slug === m.team_b?.slug
                                            ? "text-[#53fc18] font-bold"
                                            : "text-white font-medium"
                                        }`}
                                      >
                                        {m.team_b?.name || "TBD"}
                                      </Link>
                                    ) : (
                                      <span
                                        className={`truncate ${
                                          m.winner_slug === m.team_b?.slug
                                            ? "text-[#53fc18] font-bold"
                                            : "text-white font-medium"
                                        }`}
                                      >
                                        {m.team_b?.name || "TBD"}
                                      </span>
                                    )}

                                    {captainB && (
                                      <span className="text-[9px] font-chakra font-semibold text-[#d8b467] tracking-wide mt-0.5">
                                        [{captainB}]
                                      </span>
                                    )}

                                    {m.team_b && (
                                      <div className="font-mono text-[9px] flex items-center gap-1.5 font-bold mt-0.5 flex-wrap">
                                        <div className="flex items-center gap-0.5">
                                          <span className="text-[#53fc18]">{recB ? recB.wins : 0}V</span>
                                          <span className="text-[#7e756b]">-</span>
                                          <span className="text-[#ff7373]">{recB ? recB.losses : 0}D</span>
                                        </div>

                                        {recB?.isQualified && (
                                          <span className="inline-flex items-center gap-0.5 border border-emerald-500/40 bg-emerald-950/50 px-1 py-0.2 text-[8px] font-chakra font-bold text-emerald-400 tracking-wider">
                                            <IconCheck size={8} className="stroke-[2.5]" />
                                            <span>CLASIFICADO</span>
                                          </span>
                                        )}

                                        {recB?.isEliminated && (
                                          <span className="inline-flex items-center gap-0.5 border border-rose-500/40 bg-rose-950/50 px-1 py-0.2 text-[8px] font-chakra font-bold text-rose-400 tracking-wider">
                                            <IconSkull size={8} />
                                            <span>ELIMINADO</span>
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <span className="font-bold text-[#f0d38f] text-base ml-2">
                                  {m.score_b}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Seccion uniforme de Juegos y Picks ubicada en la parte inferior */}
                          <div className="mt-3 pt-2.5 border-t border-[#241e17] space-y-2">
                            {gamesList.map((g, gIdx) => {
                              const isCompleted = g.status === "COMPLETED" || g.status === "FINISHED" || (Boolean(g.winner_slug) && !isStatusOngoing(g.status));
                              const isGameOngoing = isStatusOngoing(g.status) && !isCompleted;

                              const radTeamName = g.radiant_team?.name || m.team_a?.name || "Equipo A";
                              const direTeamName = g.dire_team?.name || m.team_b?.name || "Equipo B";
                              const radHeroes = g.radiant_heroes || [];
                              const direHeroes = g.dire_heroes || [];

                              const gameWinner = g.winner_slug || m.winner_slug || null;
                              const radSlug = g.radiant_team?.slug || m.team_a?.slug;
                              const direSlug = g.dire_team?.slug || m.team_b?.slug;

                              const isRadWinner = Boolean(isCompleted && gameWinner && radSlug && gameWinner.trim() === radSlug.trim());
                              const isDireWinner = Boolean(isCompleted && gameWinner && direSlug && gameWinner.trim() === direSlug.trim());

                              const isRadLoser = Boolean(isCompleted && gameWinner && radSlug && gameWinner.trim() !== radSlug.trim());
                              const isDireLoser = Boolean(isCompleted && gameWinner && direSlug && gameWinner.trim() !== direSlug.trim());

                              const gameDateFormatted = formatDateString(g.started_at);
                              const gameSlug = g.slug || ((m as StageMatchData).slug ? `${(m as StageMatchData).slug}-game-${g.game_number || gIdx + 1}` : null);

                              return (
                                <div key={gIdx} className={`border p-2.5 text-[10px] space-y-2 ${
                                  isGameOngoing
                                    ? "bg-[#091508] border-[#53fc18]/50 shadow-xs"
                                    : "bg-[#0b0907] border-[#241e17]"
                                }`}>
                                  <div className="flex items-center justify-between text-[#8e857b] font-mono flex-wrap gap-1">
                                    <span className="flex items-center gap-1.5 font-bold text-[#e0deda] flex-wrap">
                                      <span className={`h-1.5 w-1.5 rounded-full ${
                                        isGameOngoing ? 'bg-[#53fc18] animate-ping' : isCompleted ? 'bg-emerald-400' : 'bg-amber-500'
                                      }`} />
                                      JUEGO {g.game_number || 1} · {
                                        isGameOngoing ? (
                                          <span className="inline-flex items-center gap-1 text-[#53fc18] font-bold px-1.5 py-0.2 bg-[#53fc18]/10 border border-[#53fc18]/50 rounded-xs animate-pulse">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#53fc18] animate-ping" />
                                            EN VIVO (LIVE)
                                          </span>
                                        ) : (
                                          <span className={isCompleted ? 'text-emerald-400' : 'text-amber-500'}>{g.status}</span>
                                        )
                                      }
                                      {gameDateFormatted && (
                                        <span className="text-[#8e857b] font-normal text-[9px] font-mono">
                                          • {gameDateFormatted}
                                        </span>
                                      )}
                                    </span>
                                    {g.opendota_match_id && (
                                      <span className="text-[#6cc4ff]">ID: {g.opendota_match_id}</span>
                                    )}
                                  </div>

                                  {/* Radiant Picks / Slots */}
                                  <div className="space-y-1 pt-1">
                                    <div className="text-[9px] text-[#8e857b] font-mono flex items-center justify-between">
                                      <span className="flex items-center gap-1.5">
                                        <span className={isRadWinner ? "text-[#53fc18] font-bold" : "text-[#e0deda]"}>{radTeamName}</span>
                                        <span className="text-[#53fc18] font-bold">(Radiant)</span>
                                      </span>
                                      {isRadWinner && (
                                        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-[#53fc18] border border-[#53fc18]/30 bg-[#53fc18]/10 px-1 py-0.2">
                                          <IconCheck size={9} className="stroke-[3]" />
                                          <span>GANADOR</span>
                                        </span>
                                      )}
                                      {isRadLoser && (
                                        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-[#ff7373] border border-[#ff7373]/30 bg-[#ff7373]/10 px-1 py-0.2">
                                          <span>DERROTADO</span>
                                        </span>
                                      )}
                                    </div>
                                    {renderHeroPicks(radHeroes, isRadLoser)}
                                  </div>

                                  {/* Dire Picks / Slots */}
                                  <div className="space-y-1 pt-1">
                                    <div className="text-[9px] text-[#8e857b] font-mono flex items-center justify-between">
                                      <span className="flex items-center gap-1.5">
                                        <span className={isDireWinner ? "text-[#53fc18] font-bold" : "text-[#e0deda]"}>{direTeamName}</span>
                                        <span className="text-[#ff7373] font-bold">(Dire)</span>
                                      </span>
                                      {isDireWinner && (
                                        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-[#53fc18] border border-[#53fc18]/30 bg-[#53fc18]/10 px-1 py-0.2">
                                          <IconCheck size={9} className="stroke-[3]" />
                                          <span>GANADOR</span>
                                        </span>
                                      )}
                                      {isDireLoser && (
                                        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-[#ff7373] border border-[#ff7373]/30 bg-[#ff7373]/10 px-1 py-0.2">
                                          <span>DERROTADO</span>
                                        </span>
                                      )}
                                    </div>
                                    {renderHeroPicks(direHeroes, isDireLoser)}
                                  </div>

                                  {/* Botón Ver Detalle después de Dire */}
                                  {gameSlug && (
                                    <div className="pt-1.5">
                                      <Link
                                        href={`/game/${gameSlug}`}
                                        className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 text-[10px] font-chakra font-bold uppercase tracking-wider text-[#e5b869] bg-[#e5b869]/10 hover:bg-[#e5b869] hover:text-black border border-[#e5b869]/30 hover:border-[#e5b869] rounded-xs transition-all duration-200 group/btn shadow-xs"
                                        title="Ver detalles de la partida"
                                      >
                                        <span>VER DETALLE</span>
                                        <IconArrowRight size={11} className="transition-transform group-hover/btn:translate-x-1" />
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="my-8 flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#2d261e] bg-[#120f0a]/60">
                    <IconCalendarEvent size={32} className="text-[#8e857b] mb-2 animate-bounce" />
                    <h4 className="font-chakra text-sm font-bold text-[#c7bcab] uppercase">
                      Enfrentamientos no disponibles
                    </h4>
                    <p className="font-chakra text-xs text-[#7e756b] mt-1 max-w-md">
                      Los cruces de {activeSelectedRound?.name} se generarán automáticamente una vez concluya la etapa previa.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Transmisión en Vivo (Kick) */}
      <KickStreamModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        channelName="benjaz"
      />
    </section>
  );
}
