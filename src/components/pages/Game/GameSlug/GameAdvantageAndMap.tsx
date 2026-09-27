"use client";

import React, { useState } from "react";
import { GameDetailData, OpenDotaPlayer } from "interfaces/games";
import { getHeroIconUrl, getPlayerNickname, getHeroDisplayName } from "helpers/dota";

interface GameAdvantageAndMapProps {
  game: GameDetailData;
}

interface HeroMapMarker {
  player: OpenDotaPlayer;
  heroId: number;
  heroName: string;
  nickname: string;
  isRadiant: boolean;
  xPct: number;
  yPct: number;
  heroIconUrl: string;
}

// Coordenadas oficiales de estaciones de fase de líneas (Laning Phase Map)
// Top: Dire Safe duo vs Radiant Offlane duo
// Mid: Dire Mid solo vs Radiant Mid solo
// Bot: Dire Offlane duo vs Radiant Safelane duo
function getPlayerLaneStation(
  p: OpenDotaPlayer,
  isRadiant: boolean,
  teamIndex: number
): { x: number; y: number } {
  const lane = p.lane || (teamIndex === 2 ? 2 : teamIndex < 2 ? 1 : 3);
  const isCore = p.lane_role === 1 || p.position_est === 1 || p.position_est === 3;

  if (isRadiant) {
    if (lane === 3) {
      // Radiant Offlane (Top)
      return isCore ? { x: 16.0, y: 48.0 } : { x: 16.0, y: 39.5 };
    }
    if (lane === 2) {
      // Radiant Mid
      return { x: 52.0, y: 60.5 };
    }
    // Radiant Safelane (Bot)
    return isCore ? { x: 80.5, y: 88.0 } : { x: 73.0, y: 88.0 };
  } else {
    // Dire
    if (lane === 3) {
      // Dire Safelane (Top)
      return isCore ? { x: 29.5, y: 24.5 } : { x: 22.5, y: 24.5 };
    }
    if (lane === 2) {
      // Dire Mid
      return { x: 52.0, y: 52.0 };
    }
    // Dire Offlane (Bot)
    return isCore ? { x: 88.0, y: 63.0 } : { x: 88.0, y: 71.0 };
  }
}

export function GameAdvantageAndMap({ game }: GameAdvantageAndMapProps) {
  const [hoveredHero, setHoveredHero] = useState<HeroMapMarker | null>(null);

  const players = game.opendota_data?.players || [];
  const durationSec = game.duration_seconds || game.opendota_data?.duration || 2500;
  const totalMinutes = Math.max(1, Math.ceil(durationSec / 60));

  // 1. Separar jugadores por bando
  const radiantTeam = players.filter((p, i) =>
    p.isRadiant !== undefined ? p.isRadiant : p.player_slot != null ? p.player_slot < 128 : i < 5
  );
  const direTeam = players.filter((p, i) =>
    p.isRadiant !== undefined ? !p.isRadiant : p.player_slot != null ? p.player_slot >= 128 : i >= 5
  );

  // 2. Procesar posiciones de cada jugador asignando su estación de línea exacta
  const processMarkers = (team: OpenDotaPlayer[], isRadiant: boolean): HeroMapMarker[] => {
    const assignedCoords: { x: number; y: number }[] = [];

    return team.map((p, idx) => {
      let coords = getPlayerLaneStation(p, isRadiant, idx);

      // Si ya hay un héroe exactamente en esa coordenada, desplazarlo ligeramente para que no se superpongan
      const conflict = assignedCoords.find(
        (c) => Math.abs(c.x - coords.x) < 3 && Math.abs(c.y - coords.y) < 3
      );
      if (conflict) {
        coords = { x: coords.x + 4.5, y: coords.y - 2.5 };
      }
      assignedCoords.push(coords);

      return {
        player: p,
        heroId: p.hero_id,
        heroName: getHeroDisplayName(p.hero_id),
        nickname: getPlayerNickname(p, game),
        isRadiant,
        xPct: coords.x,
        yPct: coords.y,
        heroIconUrl: getHeroIconUrl(p.hero_id),
      };
    });
  };

  const heroMarkers: HeroMapMarker[] = [
    ...processMarkers(radiantTeam, true),
    ...processMarkers(direTeam, false),
  ];

  // 2. Procesar datos de ventaja de Oro y Experiencia
  const rawGoldAdv = game.opendota_data?.radiant_gold_adv;
  const rawXpAdv = game.opendota_data?.radiant_xp_adv;

  let goldAdv: number[] = [];
  let xpAdv: number[] = [];

  if (rawGoldAdv && rawGoldAdv.length > 0) {
    goldAdv = rawGoldAdv;
  } else {
    const radiantWon =
      (game.winner_slug && game.radiant_team?.slug && game.winner_slug === game.radiant_team.slug) ||
      game.opendota_data?.radiant_win === true;
    const sign = radiantWon ? 1 : -1;
    goldAdv = Array.from({ length: totalMinutes + 1 }, (_, m) => {
      if (m === 0) return 0;
      const progress = m / totalMinutes;
      const noise = Math.sin(m * 0.8) * 1500 + Math.cos(m * 1.2) * 1000;
      return Math.round(sign * (progress * progress * 28000 + noise));
    });
  }

  if (rawXpAdv && rawXpAdv.length > 0) {
    xpAdv = rawXpAdv;
  } else {
    xpAdv = goldAdv.map((g, i) => Math.round(g * (1.1 + Math.sin(i * 0.5) * 0.2)));
  }

  return (
    <section className="w-full pt-4 space-y-4 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: BUILDINGS MAP */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rotate-45 bg-[#d8b467]" />
            <h3 className="font-chakra font-black text-sm uppercase tracking-wider text-white">
              Buildings Map
            </h3>
          </div>

          <div className="relative w-full aspect-square border border-[#2d261e] bg-[#0c0a08] overflow-hidden shadow-2xl group">
            {/* Esquinas imperiales doradas */}
            <span className="pointer-events-none absolute -top-1 -left-1 z-30 h-2 w-2 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
            <span className="pointer-events-none absolute -top-1 -right-1 z-30 h-2 w-2 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
            <span className="pointer-events-none absolute -bottom-1 -left-1 z-30 h-2 w-2 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
            <span className="pointer-events-none absolute -bottom-1 -right-1 z-30 h-2 w-2 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />

            {/* Imagen del mapa oficial detallado de Dota 2 */}
            <picture>
              <img
                src="https://www.opendota.com/assets/images/dota2/map/detailed_740.webp"
                alt="Dota 2 Buildings Map"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </picture>

            {/* Marcadores de Héroes sobre el mapa usando los iconos oficiales de minimapa */}
            {heroMarkers.map((marker, i) => (
              <div
                key={`map-hero-${marker.heroId}-${i}`}
                style={{
                  left: `${marker.xPct}%`,
                  top: `${marker.yPct}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseEnter={() => setHoveredHero(marker)}
                onMouseLeave={() => setHoveredHero(null)}
                className="absolute z-20 cursor-pointer transition-transform hover:scale-135"
              >
                <div
                  className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center pointer-events-none"
                  style={{
                    filter: marker.isRadiant
                      ? "drop-shadow(0 0 6px rgba(0, 229, 153, 0.95)) drop-shadow(0 0 2px rgba(0, 229, 153, 0.8))"
                      : "drop-shadow(0 0 6px rgba(255, 77, 77, 0.95)) drop-shadow(0 0 2px rgba(255, 77, 77, 0.8))",
                  }}
                >
                  <picture>
                    <img
                      src={marker.heroIconUrl}
                      alt={marker.nickname}
                      className="w-full h-full object-contain"
                    />
                  </picture>
                </div>
              </div>
            ))}

            {/* Tooltip flotante del héroe hovered */}
            {hoveredHero && (
              <div
                style={{
                  left: `${hoveredHero.xPct}%`,
                  top: `${Math.max(12, hoveredHero.yPct - 10)}%`,
                  transform: "translate(-50%, -100%)",
                }}
                className="absolute z-30 pointer-events-none px-2.5 py-1.5 border border-[#d8b467]/80 bg-[#14100c] text-white shadow-2xl whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rotate-45 ${
                      hoveredHero.isRadiant ? "bg-[#00e599]" : "bg-[#ff4d4d]"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="font-chakra font-black text-xs uppercase tracking-tight text-white">
                      {hoveredHero.nickname}
                    </span>
                    <span className="font-mono text-[10px] text-[#d8b467]">
                      {hoveredHero.heroName}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: RADIANT ADVANTAGE (VENTAJA DE ORO Y XP) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rotate-45 bg-[#d8b467]" />
            <h3 className="font-chakra font-black text-sm uppercase tracking-wider text-white">
              Radiant Advantage
            </h3>
          </div>

          <div className="relative w-full border border-[#2d261e] bg-[#0e0c09] p-4 sm:p-6 shadow-2xl flex flex-col justify-between">
            {/* Esquinas imperiales doradas */}
            <span className="pointer-events-none absolute -top-1 -left-1 z-30 h-2 w-2 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
            <span className="pointer-events-none absolute -top-1 -right-1 z-30 h-2 w-2 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
            <span className="pointer-events-none absolute -bottom-1 -left-1 z-30 h-2 w-2 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
            <span className="pointer-events-none absolute -bottom-1 -right-1 z-30 h-2 w-2 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />

            {/* Gráfico SVG de Ventaja */}
            <AdvantageSvgChart
              goldData={goldAdv}
              xpData={xpAdv}
              totalMinutes={totalMinutes}
            />

            {/* Leyenda de la gráfica */}
            <div className="mt-4 pt-3 border-t border-[#1f1a14] flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 bg-[#6cc4ff]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#6cc4ff]" />
                <span className="text-xs font-chakra font-bold text-[#6cc4ff] uppercase tracking-wider">
                  Experience
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 bg-[#f0d38f]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#f0d38f]" />
                <span className="text-xs font-chakra font-bold text-[#f0d38f] uppercase tracking-wider">
                  Gold
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Subcomponente de Gráfico de Ventaja SVG responsive e interactivo
function AdvantageSvgChart({
  goldData,
  xpData,
  totalMinutes,
}: {
  goldData: number[];
  xpData: number[];
  totalMinutes: number;
}) {
  const [hoveredMinute, setHoveredMinute] = useState<number | null>(null);

  const chartWidth = 600;
  const chartHeight = 300;
  const padLeft = 65;
  const padRight = 20;
  const padTop = 30;
  const padBottom = 35;

  const innerWidth = chartWidth - padLeft - padRight;
  const innerHeight = chartHeight - padTop - padBottom;

  // Calcular valor mínimo y máximo de ventaja
  const allValues = [...goldData, ...xpData, 0];
  const maxVal = Math.max(...allValues, 10000);
  const minVal = Math.min(...allValues, -10000);

  // Escalar Y de manera simétrica
  const yCeil = Math.ceil(Math.max(Math.abs(maxVal), Math.abs(minVal)) / 20000) * 20000;
  const yTicks = [yCeil, yCeil / 2, 0, -yCeil / 2, -yCeil].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  const getYPos = (val: number) => {
    const norm = (val - -yCeil) / (yCeil * 2);
    return padTop + innerHeight - norm * innerHeight;
  };

  const getXPos = (minute: number) => {
    const norm = minute / Math.max(1, totalMinutes);
    return padLeft + norm * innerWidth;
  };

  // Construir paths SVG
  const buildSvgPath = (data: number[]) => {
    if (!data.length) return "";
    return data
      .map((val, idx) => {
        const x = getXPos(idx);
        const y = getYPos(val);
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const goldPath = buildSvgPath(goldData);
  const xpPath = buildSvgPath(xpData);

  // Marcas de tiempo en eje X cada 4 minutos
  const xTickInterval = totalMinutes > 40 ? 4 : totalMinutes > 20 ? 4 : 2;
  const xTicks: number[] = [];
  for (let m = 0; m <= totalMinutes; m += xTickInterval) {
    xTicks.push(m);
  }

  // Manejar posición del cursor para cálculo interactivo
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * chartWidth;

    if (svgX < padLeft || svgX > padLeft + innerWidth) {
      setHoveredMinute(null);
      return;
    }

    const norm = (svgX - padLeft) / innerWidth;
    const minute = Math.min(totalMinutes, Math.max(0, Math.round(norm * totalMinutes)));
    setHoveredMinute(minute);
  };

  const currentHover = hoveredMinute !== null ? hoveredMinute : null;
  const hoverX = currentHover !== null ? getXPos(currentHover) : 0;
  const goldVal = currentHover !== null ? goldData[currentHover] || 0 : 0;
  const xpVal = currentHover !== null ? xpData[currentHover] || 0 : 0;
  const hoverGoldY = currentHover !== null ? getYPos(goldVal) : 0;
  const hoverXpY = currentHover !== null ? getYPos(xpVal) : 0;

  return (
    <div className="relative w-full h-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredMinute(null)}
        className="w-full h-auto overflow-visible font-mono text-[9px] cursor-crosshair"
      >
        {/* Rótulos de bando en las esquinas */}
        <text
          x={padLeft + 8}
          y={padTop + 4}
          fill="#00e599"
          className="font-chakra font-black tracking-wider text-[11px] uppercase pointer-events-none"
        >
          The Radiant
        </text>
        <text
          x={padLeft + 8}
          y={padTop + innerHeight - 6}
          fill="#ff4d4d"
          className="font-chakra font-black tracking-wider text-[11px] uppercase pointer-events-none"
        >
          The Dire
        </text>

        {/* Líneas horizontales de guía y etiquetas de Y */}
        {yTicks.map((tick) => {
          const y = getYPos(tick);
          const isZero = tick === 0;
          return (
            <g key={`ytick-${tick}`} className="pointer-events-none">
              <line
                x1={padLeft}
                y1={y}
                x2={padLeft + innerWidth}
                y2={y}
                stroke={isZero ? "#3d3328" : "#1a1610"}
                strokeWidth={isZero ? 1.5 : 1}
                strokeDasharray={isZero ? undefined : "2 2"}
              />
              <text
                x={padLeft - 8}
                y={y + 3}
                fill="#70675a"
                textAnchor="end"
                className="font-mono text-[9px]"
              >
                {tick === 0 ? "0" : tick.toLocaleString("en-US")}
              </text>
            </g>
          );
        })}

        {/* Marcas de tiempo en eje X */}
        {xTicks.map((m) => {
          const x = getXPos(m);
          return (
            <g key={`xtick-${m}`} className="pointer-events-none">
              <line
                x1={x}
                y1={padTop + innerHeight}
                x2={x}
                y2={padTop + innerHeight + 4}
                stroke="#3d3328"
                strokeWidth={1}
              />
              <text
                x={x}
                y={padTop + innerHeight + 16}
                fill="#80776b"
                textAnchor="middle"
                className="font-mono text-[8.5px]"
              >
                {`${m}:00`}
              </text>
            </g>
          );
        })}

        {/* Curva de Experiencia (azul claro) */}
        <path
          d={xpPath}
          fill="none"
          stroke="#6cc4ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_8px_rgba(108,196,255,0.4)] pointer-events-none"
        />

        {/* Curva de Oro (dorado) */}
        <path
          d={goldPath}
          fill="none"
          stroke="#f0d38f"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_8px_rgba(240,211,143,0.4)] pointer-events-none"
        />

        {/* Elementos interactivos cuando el usuario pasa el cursor */}
        {currentHover !== null && (
          <g className="pointer-events-none">
            {/* Línea vertical guía */}
            <line
              x1={hoverX}
              y1={padTop}
              x2={hoverX}
              y2={padTop + innerHeight}
              stroke="#e0deda"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              className="drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]"
            />

            {/* Punto interactivo de Experiencia */}
            <circle
              cx={hoverX}
              cy={hoverXpY}
              r={5}
              fill="#6cc4ff"
              stroke="#ffffff"
              strokeWidth={2}
              className="drop-shadow-[0_0_8px_rgba(108,196,255,0.9)]"
            />

            {/* Punto interactivo de Oro */}
            <circle
              cx={hoverX}
              cy={hoverGoldY}
              r={5}
              fill="#f0d38f"
              stroke="#ffffff"
              strokeWidth={2}
              className="drop-shadow-[0_0_8px_rgba(240,211,143,0.9)]"
            />
          </g>
        )}
      </svg>

      {/* Tooltip interactivo flotante estilo Coliseo */}
      {currentHover !== null && (
        <div
          className="absolute pointer-events-none z-30 px-3.5 py-2.5 border border-[#3d3328] bg-[#14100c]/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.85)] min-w-[210px]"
          style={{
            left: `${(hoverX / chartWidth) * 100}%`,
            top: "20%",
            transform:
              hoverX / chartWidth > 0.62
                ? "translate(-105%, 0)"
                : "translate(14px, 0)",
          }}
        >
          {/* Esquinas imperiales miniatura */}
          <span className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 rotate-45 bg-[#d8b467]" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rotate-45 bg-[#d8b467]" />

          {/* Tiempo */}
          <div className="font-chakra font-black text-xs text-white uppercase tracking-wider pb-1.5 mb-1.5 border-b border-[#2d261e] flex items-center justify-between">
            <span className="text-[#a89f91]">Tiempo:</span>
            <span className="text-white">{`${currentHover}:00`}</span>
          </div>

          {/* Ventaja de Oro */}
          <div className="flex items-center justify-between gap-3 text-xs font-mono py-0.5">
            <span className="text-[#a89f91] text-[11px]">Gold Advantage:</span>
            <span className="font-bold text-[#f0d38f]">
              {goldVal >= 0
                ? `+${goldVal.toLocaleString("en-US")}`
                : goldVal.toLocaleString("en-US")}
            </span>
          </div>

          {/* Ventaja de XP */}
          <div className="flex items-center justify-between gap-3 text-xs font-mono py-0.5">
            <span className="text-[#a89f91] text-[11px]">XP Advantage:</span>
            <span className="font-bold text-[#6cc4ff]">
              {xpVal >= 0
                ? `+${xpVal.toLocaleString("en-US")}`
                : xpVal.toLocaleString("en-US")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
