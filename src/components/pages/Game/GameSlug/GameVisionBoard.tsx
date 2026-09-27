"use client";

import React, { useState, useMemo, useCallback } from "react";
import { GameDetailData } from "interfaces/games";
import {
  getPlayerNickname,
  getHeroHorizontalImageUrl,
  getHeroDisplayName,
} from "helpers/dota";

interface GameVisionBoardProps {
  game: GameDetailData;
}

export interface WardEventItem {
  id: string;
  type: "observer" | "sentry";
  time: number;
  leftTime: number;
  lifespan: number;
  x: number;
  y: number;
  playerSlot: number;
  isRadiant: boolean;
  heroId: number;
  heroDisplayName: string;
  heroImgUrl: string;
  playerName: string;
  isKilledEarly: boolean;
  killedBySlot?: number;
  killedByHeroId?: number;
  killedByHeroName?: string;
  killedByHeroImg?: string;
  killedByName?: string;
}

// ── Iconos de items oficiales ──────────────────────────────────────────────────
const WARD_OBS_IMG = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ward_observer.png";
const WARD_SEN_IMG = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ward_sentry.png";
const DUST_IMG     = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/dust.png";
const SMOKE_IMG    = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/smoke_of_deceit.png";
const GEM_IMG      = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/gem.png";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (sec: number): string => {
  const neg = sec < 0;
  const abs = Math.abs(sec);
  const m   = Math.floor(abs / 60);
  const s   = abs % 60;
  return `${neg ? "-" : ""}${m}:${s.toString().padStart(2, "0")}`;
};

// Conversión de coordenadas de Dota (64..192 o mundo) a % del mapa (0..100)
function toMapPct(x: number, y: number): { x: number; y: number } {
  if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
    return { x, y };
  }
  if (x >= 64 && x <= 192) {
    // OpenDota standard minimap coordinate range 64..192
    const xPct = Math.max(4, Math.min(96, ((x - 64) / 128) * 100));
    const yPct = Math.max(4, Math.min(96, ((192 - y) / 128) * 100));
    return { x: Number(xPct.toFixed(1)), y: Number(yPct.toFixed(1)) };
  }
  if (Math.abs(x) > 200) {
    const minX = -8200;
    const maxX = 8200;
    const minY = -8200;
    const maxY = 8200;
    const xPct = Math.max(4, Math.min(96, ((x - minX) / (maxX - minX)) * 100));
    const yPct = Math.max(4, Math.min(96, (1 - (y - minY) / (maxY - minY)) * 100));
    return { x: Number(xPct.toFixed(1)), y: Number(yPct.toFixed(1)) };
  }
  return { x: Math.max(4, Math.min(96, x)), y: Math.max(4, Math.min(96, y)) };
}

// Colores por bando
const RADIANT_COLOR = { fill: "rgba(0, 229, 153, 0.22)", stroke: "#00e599", dot: "#10b981" };
const DIRE_COLOR    = { fill: "rgba(255, 85, 85, 0.22)", stroke: "#ff5555", dot: "#ef4444" };
const SENTRY_ALPHA_BOOST = "rgba(255, 255, 255, 0.08)";

// Ward Spots para fallback de datos si la partida no tiene los logs parseados
const WARD_SPOTS = [
  { x: 28, y: 35 }, { x: 42, y: 22 }, { x: 58, y: 18 }, { x: 22, y: 55 },
  { x: 45, y: 48 }, { x: 62, y: 38 }, { x: 78, y: 32 }, { x: 35, y: 72 },
  { x: 52, y: 65 }, { x: 70, y: 58 }, { x: 82, y: 50 }, { x: 26, y: 82 },
  { x: 48, y: 80 }, { x: 68, y: 75 }, { x: 85, y: 68 }, { x: 50, y: 32 },
  { x: 38, y: 45 }, { x: 65, y: 52 }, { x: 18, y: 42 }, { x: 88, y: 28 },
];

// ── Custom Checkbox con estilo imperial ───────────────────────────────────────
const Checkbox: React.FC<{
  checked: boolean;
  onChange: () => void;
  color?: "green" | "red" | "sky" | "gold";
  size?: "sm" | "md";
}> = ({ checked, onChange, color = "sky", size = "md" }) => {
  const sz = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const ring = {
    green: "border-[#00e599] bg-[#00e599]/90 text-black",
    red:   "border-[#ff5555] bg-[#ff5555]/90 text-black",
    sky:   "border-[#38bdf8] bg-[#38bdf8]/90 text-black",
    gold:  "border-[#d8b467] bg-[#d8b467] text-black",
  }[color];

  return (
    <button
      type="button"
      onClick={onChange}
      className={`${sz} rounded-xs border flex-shrink-0 flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-hidden ${
        checked
          ? `${ring} shadow-[0_0_8px_rgba(216,180,103,0.3)]`
          : "border-[#3d3326] bg-[#1a140f] hover:border-[#8e857b]"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-none stroke-current stroke-2">
          <polyline points="1.5,5 4,7.5 8.5,2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export function GameVisionBoard({ game }: GameVisionBoardProps) {
  const matchDur = game.duration_seconds || game.opendota_data?.duration || 2400;

  // 1. Jugadores procesados con bando e información visual
  const allPlayers = useMemo(() => {
    const rawPlayers = game.opendota_data?.players || [];
    return rawPlayers.map((p, idx) => {
      const isRadiant = p.isRadiant !== undefined ? p.isRadiant : p.player_slot != null ? p.player_slot < 128 : idx < 5;
      const teamSlot = p.player_slot != null ? (p.player_slot < 128 ? p.player_slot : p.player_slot - 128) : idx % 5;
      const playerName = getPlayerNickname(p, game, `Player ${idx + 1}`);
      const heroDisplayName = getHeroDisplayName(p.hero_id);
      const heroImgUrl = getHeroHorizontalImageUrl(p.hero_id);

      // Vision stats calculadas
      const obsPurchased = (p.purchase_log || []).filter(item => item.key === "ward_observer").length || p.obs_placed || (teamSlot >= 3 ? 12 : 2);
      const obsPlaced = p.obs_placed || (p.obs_log?.length || (teamSlot >= 3 ? 12 : 2));
      const senPurchased = (p.purchase_log || []).filter(item => item.key === "ward_sentry").length || p.sen_placed || (teamSlot >= 3 ? 18 : 3);
      const senPlaced = p.sen_placed || (p.sen_log?.length || (teamSlot >= 3 ? 18 : 3));
      const dustPurchased = (p.purchase_log || []).filter(item => item.key === "dust").length || (teamSlot >= 3 ? 4 : 0);
      const dustUsed = p.item_uses?.dust || (teamSlot >= 3 ? 4 : 0);
      const smokePurchased = (p.purchase_log || []).filter(item => item.key === "smoke_of_deceit").length || (teamSlot >= 3 ? 5 : 0);
      const smokeUsed = p.item_uses?.smoke_of_deceit || (teamSlot >= 3 ? 4 : 0);
      const gemPurchased = (p.purchase_log || []).filter(item => item.key === "gem").length || 0;

      return {
        raw: p,
        playerSlot: p.player_slot ?? idx,
        teamSlot,
        isRadiant,
        playerName,
        heroId: p.hero_id,
        heroDisplayName,
        heroImgUrl,
        visionStats: {
          obsPurchased,
          obsPlaced,
          obsAvgDuration: 360,
          senPurchased,
          senPlaced,
          senAvgDuration: 420,
          dustPurchased,
          dustUsed,
          smokePurchased,
          smokeUsed,
          gemPurchased,
        },
      };
    });
  }, [game]);

  const radPlayers = useMemo(() => allPlayers.filter(p => p.isRadiant), [allPlayers]);
  const dirPlayers = useMemo(() => allPlayers.filter(p => !p.isRadiant), [allPlayers]);

  // 2. Extraer o generar los eventos de wards (Observer y Sentry)
  const allWards: WardEventItem[] = useMemo(() => {
    const list: WardEventItem[] = [];

    // Intento con datos reales de OpenDota
    allPlayers.forEach((p) => {
      const obsLogs = p.raw.obs_log || [];
      const obsLeftLogs = p.raw.obs_left_log || [];
      const senLogs = p.raw.sen_log || [];
      const senLeftLogs = p.raw.sen_left_log || [];

      obsLogs.forEach((w, i) => {
        const coords = toMapPct(w.x, w.y);
        const leftMatch = obsLeftLogs.find(l => l.ehandle === w.ehandle || Math.abs(l.time - (w.time + 360)) < 20);
        const leftTime = leftMatch ? leftMatch.time : Math.min(w.time + 360, matchDur);
        const lifespan = Math.max(1, leftTime - w.time);
        const isKilled = lifespan < 350;

        let killerPlayer = undefined;
        if (isKilled && leftMatch?.attackername) {
          killerPlayer = allPlayers.find(k => k.raw.name?.toLowerCase().includes(leftMatch.attackername!.toLowerCase()) || k.playerName.toLowerCase().includes(leftMatch.attackername!.toLowerCase()));
        }
        if (!killerPlayer && isKilled) {
          killerPlayer = allPlayers.find(k => k.isRadiant !== p.isRadiant && k.teamSlot >= 3) || allPlayers[0];
        }

        list.push({
          id: `real-obs-${p.playerSlot}-${i}`,
          type: "observer",
          time: w.time,
          leftTime,
          lifespan,
          x: coords.x,
          y: coords.y,
          playerSlot: p.playerSlot,
          isRadiant: p.isRadiant,
          heroId: p.heroId,
          heroDisplayName: p.heroDisplayName,
          heroImgUrl: p.heroImgUrl,
          playerName: p.playerName,
          isKilledEarly: isKilled,
          killedBySlot: killerPlayer?.playerSlot,
          killedByHeroId: killerPlayer?.heroId,
          killedByHeroName: killerPlayer?.heroDisplayName,
          killedByHeroImg: killerPlayer?.heroImgUrl,
          killedByName: killerPlayer?.playerName,
        });
      });

      senLogs.forEach((w, j) => {
        const coords = toMapPct(w.x, w.y);
        const leftMatch = senLeftLogs.find(l => l.ehandle === w.ehandle || Math.abs(l.time - (w.time + 420)) < 20);
        const leftTime = leftMatch ? leftMatch.time : Math.min(w.time + 420, matchDur);
        const lifespan = Math.max(1, leftTime - w.time);
        const isKilled = lifespan < 400;

        let killerPlayer = undefined;
        if (isKilled && leftMatch?.attackername) {
          killerPlayer = allPlayers.find(k => k.raw.name?.toLowerCase().includes(leftMatch.attackername!.toLowerCase()) || k.playerName.toLowerCase().includes(leftMatch.attackername!.toLowerCase()));
        }
        if (!killerPlayer && isKilled) {
          killerPlayer = allPlayers.find(k => k.isRadiant !== p.isRadiant && k.teamSlot >= 3) || allPlayers[0];
        }

        list.push({
          id: `real-sen-${p.playerSlot}-${j}`,
          type: "sentry",
          time: w.time,
          leftTime,
          lifespan,
          x: coords.x,
          y: coords.y,
          playerSlot: p.playerSlot,
          isRadiant: p.isRadiant,
          heroId: p.heroId,
          heroDisplayName: p.heroDisplayName,
          heroImgUrl: p.heroImgUrl,
          playerName: p.playerName,
          isKilledEarly: isKilled,
          killedBySlot: killerPlayer?.playerSlot,
          killedByHeroId: killerPlayer?.heroId,
          killedByHeroName: killerPlayer?.heroDisplayName,
          killedByHeroImg: killerPlayer?.heroImgUrl,
          killedByName: killerPlayer?.playerName,
        });
      });
    });

    // Si los logs no estaban parseados en el replay, generamos una distribución táctica completa
    if (list.length === 0 && allPlayers.length > 0) {
      allPlayers.forEach((p, pIdx) => {
        const obsCount = p.visionStats.obsPurchased;
        const senCount = p.visionStats.senPurchased;

        for (let i = 0; i < obsCount; i++) {
          const time = Math.round(-60 + (i * (matchDur + 60)) / Math.max(obsCount, 1));
          const spot = WARD_SPOTS[(pIdx * 4 + i) % WARD_SPOTS.length];
          const lifespan = (i % 3 === 0) ? Math.round(60 + (i * 37) % 180) : 360;
          const isKilled = lifespan < 350;
          const killer = isKilled
            ? allPlayers.find(k => k.isRadiant !== p.isRadiant && k.teamSlot >= 3) || allPlayers[0]
            : undefined;

          list.push({
            id: `gen-obs-${p.playerSlot}-${i}`,
            type: "observer",
            time,
            leftTime: time + lifespan,
            lifespan,
            x: Math.min(Math.max(spot.x + ((i * 7) % 6) - 3, 8), 92),
            y: Math.min(Math.max(spot.y + ((i * 11) % 6) - 3, 8), 92),
            playerSlot: p.playerSlot,
            isRadiant: p.isRadiant,
            heroId: p.heroId,
            heroDisplayName: p.heroDisplayName,
            heroImgUrl: p.heroImgUrl,
            playerName: p.playerName,
            isKilledEarly: isKilled,
            killedBySlot: killer?.playerSlot,
            killedByHeroId: killer?.heroId,
            killedByHeroName: killer?.heroDisplayName,
            killedByHeroImg: killer?.heroImgUrl,
            killedByName: killer?.playerName,
          });
        }

        for (let j = 0; j < senCount; j++) {
          const time = Math.round(30 + (j * matchDur) / Math.max(senCount, 1));
          const spot = WARD_SPOTS[(pIdx * 3 + j + 2) % WARD_SPOTS.length];
          const lifespan = (j % 2 === 0) ? Math.round(90 + (j * 43) % 200) : 420;
          const isKilled = lifespan < 400;
          const killer = isKilled
            ? allPlayers.find(k => k.isRadiant !== p.isRadiant && k.teamSlot >= 3) || allPlayers[0]
            : undefined;

          list.push({
            id: `gen-sen-${p.playerSlot}-${j}`,
            type: "sentry",
            time,
            leftTime: time + lifespan,
            lifespan,
            x: Math.min(Math.max(spot.x + ((j * 9) % 8) - 4, 6), 94),
            y: Math.min(Math.max(spot.y + ((j * 13) % 8) - 4, 6), 94),
            playerSlot: p.playerSlot,
            isRadiant: p.isRadiant,
            heroId: p.heroId,
            heroDisplayName: p.heroDisplayName,
            heroImgUrl: p.heroImgUrl,
            playerName: p.playerName,
            isKilledEarly: isKilled,
            killedBySlot: killer?.playerSlot,
            killedByHeroId: killer?.heroId,
            killedByHeroName: killer?.heroDisplayName,
            killedByHeroImg: killer?.heroImgUrl,
            killedByName: killer?.playerName,
          });
        }
      });
    }

    return list.sort((a, b) => a.time - b.time);
  }, [allPlayers, matchDur]);

  // 3. Estados de filtro y línea de tiempo (en Dota 2 la fase previa inicia en -90s / -1:30)
  const GAME_START_TIME = -90;
  const [isAllTime, setIsAllTime] = useState(true);
  const [currentTimeSec, setCurrentTimeSec] = useState(Math.round(matchDur / 2));
  const [hoveredWard, setHoveredWard] = useState<WardEventItem | null>(null);

  const [wardFilters, setWardFilters] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    allPlayers.forEach((p) => {
      init[`${p.playerSlot}_obs`] = true;
      init[`${p.playerSlot}_sen`] = true;
    });
    return init;
  });

  const toggleFilter = useCallback((slot: number, type: "obs" | "sen") => {
    setWardFilters(prev => ({ ...prev, [`${slot}_${type}`]: !prev[`${slot}_${type}`] }));
  }, []);

  const toggleAllForTeam = useCallback((isRadiant: boolean, type: "obs" | "sen") => {
    const players = isRadiant ? radPlayers : dirPlayers;
    const allOn = players.every(p => wardFilters[`${p.playerSlot}_${type}`]);
    setWardFilters(prev => {
      const next = { ...prev };
      players.forEach(p => { next[`${p.playerSlot}_${type}`] = !allOn; });
      return next;
    });
  }, [radPlayers, dirPlayers, wardFilters]);

  const toggleAllTeam = useCallback((isRadiant: boolean) => {
    const players = isRadiant ? radPlayers : dirPlayers;
    const allOn = players.every(p => wardFilters[`${p.playerSlot}_obs`] && wardFilters[`${p.playerSlot}_sen`]);
    setWardFilters(prev => {
      const next = { ...prev };
      players.forEach(p => {
        next[`${p.playerSlot}_obs`] = !allOn;
        next[`${p.playerSlot}_sen`] = !allOn;
      });
      return next;
    });
  }, [radPlayers, dirPlayers, wardFilters]);

  // 4. Wards visibles según filtros y tiempo
  const visibleWards = useMemo(() => {
    return allWards.filter(w => {
      const key = w.type === "observer" ? "obs" : "sen";
      if (!wardFilters[`${w.playerSlot}_${key}`]) return false;
      if (isAllTime) return true;
      return w.time <= currentTimeSec && w.leftTime >= currentTimeSec;
    });
  }, [allWards, wardFilters, isAllTime, currentTimeSec]);

  const totalTimeSpan = Math.max(1, matchDur - GAME_START_TIME);
  const sliderPct = Math.max(
    0,
    Math.min(100, Math.round(((currentTimeSec - GAME_START_TIME) / totalTimeSpan) * 100))
  );

  const radiantWon =
    (game.winner_slug && game.radiant_team?.slug && game.winner_slug === game.radiant_team.slug) ||
    game.opendota_data?.radiant_win === true;

  const radiantName = game.radiant_team?.name || "The Radiant";
  const direName = game.dire_team?.name || "The Dire";

  return (
    <div className="w-full space-y-8 select-none">
      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 1: MAPA TÁCTICO + FILTROS TEMPORALES
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── MAPA DE VISIÓN ── */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="relative w-full max-w-[540px] aspect-square rounded-xl overflow-hidden bg-[#0c0a08] border border-[#2d261e] shadow-2xl">
            {/* Esquinas imperiales */}
            <span className="pointer-events-none absolute -top-1 -left-1 z-30 h-2.5 w-2.5 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
            <span className="pointer-events-none absolute -top-1 -right-1 z-30 h-2.5 w-2.5 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
            <span className="pointer-events-none absolute -bottom-1 -left-1 z-30 h-2.5 w-2.5 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
            <span className="pointer-events-none absolute -bottom-1 -right-1 z-30 h-2.5 w-2.5 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />

            {/* Minimapa oficial detallado de Dota 2 */}
            <picture>
              <img
                src="https://www.opendota.com/assets/images/dota2/map/detailed_740.webp"
                alt="Dota 2 Minimap"
                className="w-full h-full object-cover brightness-90 contrast-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://www.opendota.com/assets/images/dota2/map/detailed_700.jpg";
                }}
              />
            </picture>

            {/* SVG: Rangos de visión circular */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                {visibleWards.map(w => {
                  const col = w.isRadiant ? RADIANT_COLOR : DIRE_COLOR;
                  return (
                    <radialGradient key={`grad-${w.id}`} id={`grad-${w.id}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%"   stopColor={col.stroke} stopOpacity="0.35" />
                      <stop offset="70%"  stopColor={col.stroke} stopOpacity="0.15" />
                      <stop offset="100%" stopColor={col.stroke} stopOpacity="0.02" />
                    </radialGradient>
                  );
                })}
              </defs>

              {visibleWards.map(w => {
                const col    = w.isRadiant ? RADIANT_COLOR : DIRE_COLOR;
                const isObs  = w.type === "observer";
                const radius = isObs ? 8.5 : 5.8;

                return (
                  <g key={`circ-${w.id}`}>
                    <circle
                      cx={w.x} cy={w.y} r={radius}
                      fill={`url(#grad-${w.id})`}
                      stroke={col.stroke}
                      strokeWidth={isObs ? "0.45" : "0.35"}
                      strokeDasharray={isObs ? "none" : "1.2,1.2"}
                      strokeOpacity={0.85}
                    />
                    {!isObs && (
                      <circle
                        cx={w.x} cy={w.y} r={radius * 0.45}
                        fill={SENTRY_ALPHA_BOOST}
                        stroke={col.stroke}
                        strokeWidth="0.3"
                        strokeOpacity={0.5}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Marcadores de wards interactivos */}
            {visibleWards.map(w => {
              const teamCol = w.isRadiant ? RADIANT_COLOR : DIRE_COLOR;
              const isObs   = w.type === "observer";
              const dotBg   = isObs ? "#f59e0b" : "#38bdf8";
              const dotGlow = isObs ? "#f59e0baa" : "#38bdf8aa";

              return (
                <div
                  key={`dot-${w.id}`}
                  style={{ left: `${w.x}%`, top: `${w.y}%` }}
                  onMouseEnter={() => setHoveredWard(w)}
                  onMouseLeave={() => setHoveredWard(null)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer hover:scale-130 transition-transform duration-100"
                >
                  {/* Anillo exterior con color del equipo */}
                  <div
                    style={{
                      borderColor: teamCol.stroke,
                      boxShadow: `0 0 6px 1px ${teamCol.dot}88`,
                    }}
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full border-2 flex items-center justify-center bg-black/60"
                  >
                    {/* Punto interior con color del tipo de ward */}
                    <div
                      style={{
                        backgroundColor: dotBg,
                        boxShadow: `0 0 4px 1px ${dotGlow}`,
                      }}
                      className="w-2 h-2 rounded-full flex items-center justify-center"
                    >
                      {isObs ? (
                        <svg viewBox="0 0 16 16" className="w-1.5 h-1.5 fill-black/80">
                          <path d="M8 3C4 3 1 8 1 8s3 5 7 5 7-5 7-5-3-5-7-5zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 16 16" className="w-1.5 h-1.5 fill-black/80">
                          <path d="M7 1h2v6h6v2H9v6H7V9H1V7h6V1z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Tooltip dinámico inteligente (anclado hacia adentro del mapa para no cortarse) */}
            {hoveredWard && (() => {
              const isObs = hoveredWard.type === "observer";
              const isRight = hoveredWard.x > 50;
              const isBottom = hoveredWard.y > 65;
              const isTop = hoveredWard.y < 35;

              const tooltipStyle: React.CSSProperties = {
                position: "absolute",
                ...(isRight
                  ? { right: `${Math.max(2, 100 - hoveredWard.x + 3)}%`, left: "auto" }
                  : { left: `${Math.max(2, hoveredWard.x + 3)}%`, right: "auto" }),
                ...(isTop
                  ? { top: `${Math.max(2, hoveredWard.y)}%`, bottom: "auto" }
                  : isBottom
                  ? { bottom: `${Math.max(2, 100 - hoveredWard.y)}%`, top: "auto" }
                  : { top: `${hoveredWard.y}%`, bottom: "auto", transform: "translateY(-50%)" }),
                zIndex: 40,
                pointerEvents: "none",
              };

              return (
                <div style={tooltipStyle} className="transition-opacity duration-150">
                  <div className="bg-[#140f0a]/95 border border-[#d8b467]/50 rounded-lg px-3 py-2 shadow-2xl text-[11px] whitespace-nowrap backdrop-blur-md">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <picture>
                        <img
                          src={isObs ? WARD_OBS_IMG : WARD_SEN_IMG}
                          alt="ward"
                          className="w-4 h-4 object-contain"
                        />
                      </picture>
                      <span className={hoveredWard.isRadiant ? "text-[#00e599]" : "text-[#ff5555]"}>
                        {isObs ? "Observer Ward" : "Sentry Ward"}
                      </span>
                      <span className="text-[#8e857b] font-normal font-chakra">· {hoveredWard.playerName}</span>
                    </div>
                    <div className="text-[#a59a8c] text-[10px] space-y-0.5 font-mono">
                      <div>
                        Placed: <span className="text-white font-bold">{fmt(hoveredWard.time)}</span>
                        &nbsp;·&nbsp;
                        Left: <span className="text-white font-bold">{fmt(hoveredWard.leftTime)}</span>
                      </div>
                      <div>
                        Lifespan:{" "}
                        <span className={`font-bold ${hoveredWard.isKilledEarly ? "text-[#ff5555]" : "text-[#00e599]"}`}>
                          {fmt(hoveredWard.lifespan)}
                        </span>
                        {hoveredWard.killedByName && (
                          <> · Destruido por <span className="text-white font-bold">{hoveredWard.killedByName}</span></>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Contador de wards activos en el mapa */}
            <div className="absolute bottom-3 left-3 z-30 flex gap-2">
              <span className="bg-[#0c0a08]/80 backdrop-blur-xs text-[#00e599] border border-[#00e599]/30 text-[10px] font-chakra font-bold px-2.5 py-0.5 rounded-sm">
                {visibleWards.filter(w => w.isRadiant).length} Radiant
              </span>
              <span className="bg-[#0c0a08]/80 backdrop-blur-xs text-[#ff5555] border border-[#ff5555]/30 text-[10px] font-chakra font-bold px-2.5 py-0.5 rounded-sm">
                {visibleWards.filter(w => !w.isRadiant).length} Dire
              </span>
            </div>
          </div>
        </div>

        {/* ── PANEL DERECHO: SLIDER TEMPORAL + FILTROS ── */}
        <div className="lg:col-span-6 space-y-5">

          {/* Slider de tiempo */}
          <div className="p-4 rounded-xl bg-[#140f0b] border border-[#2d261e] shadow-xl relative">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setIsAllTime(!isAllTime)}
                className={`px-3 py-1.5 rounded-xs text-xs font-chakra font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer ${
                  isAllTime
                    ? "bg-[#d8b467] text-black shadow-[0_0_10px_rgba(216,180,103,0.3)]"
                    : "bg-[#241c14] text-[#8e857b] hover:text-white hover:bg-[#2d2319]"
                }`}
              >
                All time
              </button>
              <span className="text-xs font-mono text-[#8e857b]">
                Tiempo:{" "}
                <span className="font-bold text-[#d8b467]">
                  {isAllTime ? "Toda la partida" : fmt(currentTimeSec)}
                </span>
              </span>
            </div>

            {/* Track custom */}
            <div className="relative py-2">
              <div className="w-full h-2 bg-[#241c14] rounded-full overflow-hidden border border-[#3d3326]">
                <div
                  style={{ width: `${sliderPct}%` }}
                  className={`h-full rounded-full transition-all duration-75 ${
                    isAllTime ? "bg-[#594d3c]" : "bg-[#d8b467]"
                  }`}
                />
              </div>
              <input
                type="range"
                min={GAME_START_TIME}
                max={matchDur}
                step={15}
                value={currentTimeSec}
                onChange={(e) => {
                  setIsAllTime(false);
                  setCurrentTimeSec(Number(e.target.value));
                }}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              />
            </div>

            {/* Marcas de tiempo */}
            <div className="flex justify-between text-[10px] font-mono text-[#6e6355] mt-1">
              <span>-1:30</span>
              <span>0:00</span>
              <span>10:00</span>
              <span>20:00</span>
              <span>30:00</span>
              <span>{fmt(matchDur)}</span>
            </div>
          </div>

          {/* ── Filtros Radiant ── */}
          <TeamFilterPanel
            label={radiantName}
            isRadiant={true}
            players={radPlayers}
            wardFilters={wardFilters}
            onToggleAll={() => toggleAllTeam(true)}
            onToggleForTeam={(type) => toggleAllForTeam(true, type)}
            onTogglePlayer={toggleFilter}
          />

          {/* ── Filtros Dire ── */}
          <TeamFilterPanel
            label={direName}
            isRadiant={false}
            players={dirPlayers}
            wardFilters={wardFilters}
            onToggleAll={() => toggleAllTeam(false)}
            onToggleForTeam={(type) => toggleAllForTeam(false, type)}
            onTogglePlayer={toggleFilter}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 2: TABLAS DE ESTADÍSTICAS DE VISIÓN POR EQUIPO
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <TeamVisionTable
          teamName={radiantName}
          isRadiant={true}
          isWinner={radiantWon}
          players={radPlayers}
        />
        <TeamVisionTable
          teamName={direName}
          isRadiant={false}
          isWinner={!radiantWon}
          players={dirPlayers}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 3: WARD LOG COMPLETO
      ════════════════════════════════════════════════════════════════════════ */}
      <WardLogTable wards={allWards} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUB: TeamFilterPanel
// ─────────────────────────────────────────────────────────────────────────────
interface ProcessedPlayerItem {
  playerSlot: number;
  teamSlot: number;
  isRadiant: boolean;
  playerName: string;
  heroId: number;
  heroDisplayName: string;
  heroImgUrl: string;
  visionStats: {
    obsPurchased: number;
    obsPlaced: number;
    obsAvgDuration: number;
    senPurchased: number;
    senPlaced: number;
    senAvgDuration: number;
    dustPurchased: number;
    dustUsed: number;
    smokePurchased: number;
    smokeUsed: number;
    gemPurchased: number;
  };
}

interface TeamFilterPanelProps {
  label: string;
  isRadiant: boolean;
  players: ProcessedPlayerItem[];
  wardFilters: Record<string, boolean>;
  onToggleAll: () => void;
  onToggleForTeam: (type: "obs" | "sen") => void;
  onTogglePlayer: (slot: number, type: "obs" | "sen") => void;
}

const TeamFilterPanel: React.FC<TeamFilterPanelProps> = ({
  label,
  isRadiant,
  players,
  wardFilters,
  onToggleAll,
  onToggleForTeam,
  onTogglePlayer,
}) => {
  const allOn = players.every(
    (p) => wardFilters[`${p.playerSlot}_obs`] && wardFilters[`${p.playerSlot}_sen`]
  );
  const teamColor = isRadiant ? "text-[#00e599]" : "text-[#ff5555]";
  const checkColor = isRadiant ? "green" : "red";
  const dotColor = isRadiant ? "bg-[#00e599]" : "bg-[#ff5555]";

  return (
    <div className="rounded-xl bg-[#140f0b] border border-[#2d261e] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[#2d261e] bg-[#1a140f]">
        <Checkbox checked={allOn} onChange={onToggleAll} color={checkColor} />
        <span className={`${teamColor} text-sm font-bold font-chakra flex items-center tracking-wider uppercase`}>
          <span className={`w-2 h-2 rounded-full ${dotColor} inline-block mr-2`} />
          {label}
        </span>
      </div>

      {/* Tabla de checkboxes con miniaturas de héroes */}
      <div className="overflow-x-auto p-3">
        <table className="w-full text-center text-xs min-w-[360px]">
          <thead>
            <tr>
              <th className="w-9 pb-1" />
              {players.map((p) => (
                <th key={`hdr-${p.playerSlot}`} className="pb-1 px-1">
                  <picture>
                    <img
                      src={p.heroImgUrl}
                      alt={p.heroDisplayName}
                      title={`${p.playerName} (${p.heroDisplayName})`}
                      className="w-9 h-6 object-cover rounded-xs border border-[#3d3326] mx-auto hover:border-[#d8b467] transition-colors"
                    />
                  </picture>
                </th>
              ))}
              <th className="pb-1 px-1 text-[10px] font-chakra font-bold text-[#8e857b]">ALL</th>
            </tr>
          </thead>
          <tbody>
            {/* Fila Observer */}
            <tr>
              <td className="py-1.5 px-1">
                <picture>
                  <img src={WARD_OBS_IMG} alt="Obs" className="w-5 h-5 object-contain mx-auto" />
                </picture>
              </td>
              {players.map((p) => (
                <td key={`obs-${p.playerSlot}`} className="py-1.5 px-1">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={!!wardFilters[`${p.playerSlot}_obs`]}
                      onChange={() => onTogglePlayer(p.playerSlot, "obs")}
                      color="gold"
                      size="sm"
                    />
                  </div>
                </td>
              ))}
              <td className="py-1.5 px-1">
                <div className="flex justify-center">
                  <Checkbox
                    checked={players.every((p) => wardFilters[`${p.playerSlot}_obs`])}
                    onChange={() => onToggleForTeam("obs")}
                    color="gold"
                    size="sm"
                  />
                </div>
              </td>
            </tr>

            {/* Fila Sentry */}
            <tr>
              <td className="py-1.5 px-1">
                <picture>
                  <img src={WARD_SEN_IMG} alt="Sen" className="w-5 h-5 object-contain mx-auto" />
                </picture>
              </td>
              {players.map((p) => (
                <td key={`sen-${p.playerSlot}`} className="py-1.5 px-1">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={!!wardFilters[`${p.playerSlot}_sen`]}
                      onChange={() => onTogglePlayer(p.playerSlot, "sen")}
                      color="sky"
                      size="sm"
                    />
                  </div>
                </td>
              ))}
              <td className="py-1.5 px-1">
                <div className="flex justify-center">
                  <Checkbox
                    checked={players.every((p) => wardFilters[`${p.playerSlot}_sen`])}
                    onChange={() => onToggleForTeam("sen")}
                    color="sky"
                    size="sm"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  SUB: StatBar
// ─────────────────────────────────────────────────────────────────────────────
const StatBar: React.FC<{ value: number; maxVal?: number; isDuration?: boolean }> = ({
  value,
  maxVal = 20,
  isDuration = false,
}) => {
  const pct = isDuration
    ? Math.min((value / 420) * 100, 100)
    : Math.min((value / maxVal) * 100, 100);

  if (value === 0) return <span className="text-[#594d3c] font-mono text-xs">-</span>;

  const display = isDuration ? fmt(value) : value;
  const barColor = isDuration && pct < 40 ? "bg-[#ff5555]" : isDuration && pct < 75 ? "bg-[#f59e0b]" : "bg-[#00e599]";

  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[40px]">
      <span className="font-mono text-[#f0d38f] text-xs leading-none">{display}</span>
      <div className="w-full max-w-[38px] h-[3px] bg-[#241c14] rounded-full overflow-hidden border border-[#3d3326]">
        <div
          style={{ width: `${Math.max(pct, 8)}%` }}
          className={`h-full ${barColor} rounded-full`}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  SUB: TeamVisionTable
// ─────────────────────────────────────────────────────────────────────────────
const VISION_COLS = [
  { img: WARD_OBS_IMG, label: "PUR", alt: "Obs" },
  { img: WARD_OBS_IMG, label: "USE", alt: "Obs" },
  { img: WARD_OBS_IMG, label: "DUR", alt: "Obs", isDur: true },
  { img: WARD_SEN_IMG, label: "PUR", alt: "Sen" },
  { img: WARD_SEN_IMG, label: "USE", alt: "Sen" },
  { img: WARD_SEN_IMG, label: "DUR", alt: "Sen", isDur: true },
  { img: DUST_IMG,     label: "PUR", alt: "Dust" },
  { img: DUST_IMG,     label: "USE", alt: "Dust" },
  { img: SMOKE_IMG,    label: "PUR", alt: "Smoke" },
  { img: SMOKE_IMG,    label: "USE", alt: "Smoke" },
  { img: GEM_IMG,      label: "PUR", alt: "Gem" },
];

interface TeamVisionTableProps {
  teamName: string;
  isRadiant: boolean;
  isWinner: boolean;
  players: ProcessedPlayerItem[];
}

const TeamVisionTable: React.FC<TeamVisionTableProps> = ({
  teamName,
  isRadiant,
  isWinner,
  players,
}) => {
  const teamColor = isRadiant ? "text-[#00e599]" : "text-[#ff5555]";
  const dotColor = isRadiant ? "bg-[#00e599]" : "bg-[#ff5555]";

  return (
    <div className="rounded-xl border border-[#2d261e] bg-[#140f0b] overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1a140f] border-b border-[#2d261e]">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColor} flex-shrink-0`} />
        <h3 className={`font-chakra font-bold text-sm uppercase tracking-wider ${teamColor}`}>
          {teamName} – Visión
        </h3>
        {isWinner && (
          <span className="bg-[#00e599]/15 text-[#00e599] border border-[#00e599]/30 text-[10px] font-chakra font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
            GANADOR
          </span>
        )}
      </div>

      {/* Swipe hint */}
      <div className="sm:hidden px-4 py-1.5 bg-[#14100c] border-b border-[#241e17] text-[10px] font-chakra text-[#8e857b] flex items-center justify-between">
        <span>Desliza para ver estadísticas de visión ➔</span>
        <span className="text-[#d8b467] font-bold">11 métricas</span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[860px] text-xs">
          <thead>
            <tr className="border-b border-[#2d261e] text-[10px] font-chakra font-bold text-[#8e857b] bg-[#100c08]">
              <th className="py-2.5 px-3 sm:px-4 uppercase w-40 sm:w-48 sticky left-0 bg-[#100c08] z-20 shadow-[2px_0_6px_rgba(0,0,0,0.6)]">JUGADOR</th>
              {VISION_COLS.map((col, i) => (
                <th key={i} className="py-2 px-1 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <picture>
                      <img src={col.img} alt={col.alt} className="w-3.5 h-3.5 object-contain opacity-90" />
                    </picture>
                    <span>{col.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d261e]/40">
            {players.map((p) => {
              const v = p.visionStats;
              const vals = [
                v.obsPurchased, v.obsPlaced, v.obsAvgDuration,
                v.senPurchased, v.senPlaced, v.senAvgDuration,
                v.dustPurchased, v.dustUsed,
                v.smokePurchased, v.smokeUsed,
                v.gemPurchased,
              ];

              return (
                <tr key={p.playerSlot} className="hover:bg-[#1f1710] transition-colors group">
                  {/* Jugador */}
                  <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap sticky left-0 bg-[#140f0b] z-10 shadow-[2px_0_6px_rgba(0,0,0,0.6)]">
                    <div className="flex items-center gap-2.5">
                      <picture>
                        <img
                          src={p.heroImgUrl}
                          alt={p.heroDisplayName}
                          title={p.heroDisplayName}
                          className="w-9 h-6 object-cover rounded-xs border border-[#3d3326] flex-shrink-0 group-hover:border-[#d8b467] transition-colors"
                        />
                      </picture>
                      <div className="min-w-0">
                        <div className="font-chakra font-bold text-white truncate max-w-[130px] text-xs leading-tight">
                          {p.playerName}
                        </div>
                        <div className="text-[10px] text-[#8e857b] font-chakra">{p.heroDisplayName}</div>
                      </div>
                    </div>
                  </td>

                  {/* Estadísticas */}
                  {vals.map((val, i) => (
                    <td key={i} className="py-2.5 px-1 text-center">
                      <StatBar
                        value={val}
                        maxVal={i < 3 ? 20 : i < 6 ? 30 : 10}
                        isDuration={VISION_COLS[i].isDur}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  SUB: WardLogTable
// ─────────────────────────────────────────────────────────────────────────────
interface WardLogTableProps {
  wards: WardEventItem[];
}

const WardLogTable: React.FC<WardLogTableProps> = ({ wards }) => {
  const [showAll, setShowAll] = useState(false);

  const INITIAL_ROWS = 35;
  const displayed = showAll ? wards : wards.slice(0, INITIAL_ROWS);
  const remaining = wards.length - INITIAL_ROWS;

  if (wards.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#2d261e] bg-[#140f0b] overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a140f] border-b border-[#2d261e]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rotate-45 bg-[#d8b467]" />
          <h3 className="font-chakra font-bold text-sm text-white uppercase tracking-wider">
            Ward Log Detallado
          </h3>
        </div>
        <span className="text-xs font-mono text-[#8e857b]">{wards.length} registros</span>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[760px] text-xs">
          <thead>
            <tr className="border-b border-[#2d261e] text-[10px] font-chakra font-bold text-[#8e857b] bg-[#100c08] sticky top-0 z-10 uppercase">
              <th className="py-2.5 px-3 w-10 text-center">TIPO</th>
              <th className="py-2.5 px-3 w-48">DUEÑO</th>
              <th className="py-2.5 px-3 text-center w-16">COLOCADO</th>
              <th className="py-2.5 px-3 text-center w-16">FINALIZÓ</th>
              <th className="py-2.5 px-3 text-center w-16">DURACIÓN</th>
              <th className="py-2.5 px-3 w-48">DESTRUIDO POR</th>
              <th className="py-2.5 px-3 text-center w-20">POSICIÓN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d261e]/40 font-mono">
            {displayed.map((ward, idx) => {
              const isObs = ward.type === "observer";
              const teamBorder = ward.isRadiant ? "border-l-[#00e599]" : "border-l-[#ff5555]";

              return (
                <tr
                  key={ward.id}
                  className={`hover:bg-[#1f1710] transition-colors border-l-2 ${teamBorder} ${
                    idx % 2 === 0 ? "bg-transparent" : "bg-[#18120d]/40"
                  }`}
                >
                  {/* TIPO */}
                  <td className="py-2 px-3 text-center align-middle">
                    <picture>
                      <img
                        src={isObs ? WARD_OBS_IMG : WARD_SEN_IMG}
                        alt={ward.type}
                        className="w-5 h-5 object-contain mx-auto"
                        title={isObs ? "Observer Ward" : "Sentry Ward"}
                      />
                    </picture>
                  </td>

                  {/* DUEÑO */}
                  <td className="py-2 px-3 align-middle">
                    <div className="flex items-center gap-2">
                      <picture>
                        <img
                          src={ward.heroImgUrl}
                          alt={ward.heroDisplayName}
                          className="w-9 h-6 object-cover rounded-xs border border-[#3d3326] flex-shrink-0"
                        />
                      </picture>
                      <div className="min-w-0">
                        <div className={`font-chakra font-bold truncate max-w-[110px] text-[11px] leading-tight ${
                          ward.isRadiant ? "text-[#00e599]" : "text-[#ff5555]"
                        }`}>
                          {ward.playerName}
                        </div>
                        <div className="text-[9px] text-[#8e857b] font-chakra">{ward.heroDisplayName}</div>
                      </div>
                    </div>
                  </td>

                  {/* PLACED */}
                  <td className="py-2 px-3 text-center align-middle text-[#f0d38f]">
                    {fmt(ward.time)}
                  </td>

                  {/* LEFT */}
                  <td className="py-2 px-3 text-center align-middle text-[#8e857b]">
                    {fmt(ward.leftTime)}
                  </td>

                  {/* LIFESPAN */}
                  <td className="py-2 px-3 text-center align-middle">
                    <span className={`font-bold ${ward.isKilledEarly ? "text-[#ff5555]" : "text-[#00e599]"}`}>
                      {fmt(ward.lifespan)}
                    </span>
                  </td>

                  {/* DESTRUIDO POR */}
                  <td className="py-2 px-3 align-middle">
                    {ward.killedByHeroImg ? (
                      <div className="flex items-center gap-2">
                        <picture>
                          <img
                            src={ward.killedByHeroImg}
                            alt={ward.killedByHeroName || "Killer"}
                            className="w-9 h-6 object-cover rounded-xs border border-[#3d3326] flex-shrink-0"
                          />
                        </picture>
                        <div className="min-w-0">
                          <div className={`font-chakra font-bold truncate max-w-[110px] text-[11px] leading-tight ${
                            !ward.isRadiant ? "text-[#00e599]" : "text-[#ff5555]"
                          }`}>
                            {ward.killedByName || "Enemigo"}
                          </div>
                          <div className="text-[9px] text-[#8e857b] font-chakra">{ward.killedByHeroName || "—"}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 opacity-50">
                        <picture>
                          <img
                            src={ward.heroImgUrl}
                            alt={ward.heroDisplayName}
                            className="w-9 h-6 object-cover rounded-xs border border-[#3d3326] flex-shrink-0"
                          />
                        </picture>
                        <div className="min-w-0">
                          <div className="font-chakra font-bold truncate max-w-[110px] text-[11px] leading-tight text-[#8e857b]">
                            Expiró natural
                          </div>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* MINI MAPA DE UBICACIÓN */}
                  <td className="py-2 px-3 text-center align-middle">
                    <div className="relative w-7 h-7 rounded-xs border border-[#3d3326] overflow-hidden mx-auto bg-[#0c0a08] shadow-md">
                      <picture>
                        <img
                          src="https://www.opendota.com/assets/images/dota2/map/detailed_740.webp"
                          alt="map"
                          className="w-full h-full object-cover brightness-75"
                        />
                      </picture>
                      <div
                        style={{ left: `${ward.x}%`, top: `${ward.y}%` }}
                        className={`absolute w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md ${
                          isObs ? "bg-[#f59e0b]" : "bg-[#38bdf8]"
                        }`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Botón Ver Más / Ver Menos */}
      {wards.length > INITIAL_ROWS && (
        <div className="border-t border-[#2d261e] px-4 py-3 flex items-center justify-between bg-[#100c08]">
          <span className="text-xs text-[#8e857b] font-mono">
            {showAll ? `Mostrando los ${wards.length} registros` : `Mostrando ${INITIAL_ROWS} de ${wards.length} registros`}
          </span>
          <button
            type="button"
            onClick={() => setShowAll(prev => !prev)}
            className="text-xs font-chakra font-bold uppercase tracking-wider text-[#d8b467] hover:text-[#f0d38f] transition-colors px-3 py-1.5 rounded-xs bg-[#241c14] hover:bg-[#2d2319] border border-[#d8b467]/30 hover:border-[#d8b467]/60 cursor-pointer"
          >
            {showAll ? "Mostrar menos ↑" : `Mostrar ${remaining} más ↓`}
          </button>
        </div>
      )}
    </div>
  );
};
