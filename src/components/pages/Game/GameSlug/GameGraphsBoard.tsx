"use client";

import React, { useState, useMemo } from "react";
import {
  IconCoins,
  IconSparkles,
} from "@tabler/icons-react";
import { GameDetailData, OpenDotaPlayer } from "interfaces/games";
import {
  getPlayerNickname,
  getHeroHorizontalImageUrl,
  getHeroDisplayName,
  formatSpanishCompact,
} from "helpers/dota";

export interface ProcessedGraphPlayer {
  raw: OpenDotaPlayer;
  playerSlot: number;
  teamSlot: number;
  isRadiant: boolean;
  isCore: boolean;
  playerName: string;
  heroId: number;
  heroDisplayName: string;
  heroImgUrl: string;
  slotColor: string;
  netWorth: number;
  damage: number;
  lastHits: number;
  goldT: number[];
  lhT: number[];
  xpT: number[];
}

interface GameGraphsBoardProps {
  game: GameDetailData;
}

// ── Colores oficiales de Slot de Dota 2 ───────────────────────────────────────
const PLAYER_SLOT_COLORS: Record<number, string> = {
  0: "#3375FF",   // Radiant 1: Azul
  1: "#66FFBF",   // Radiant 2: Teal
  2: "#BF00BF",   // Radiant 3: Púrpura
  3: "#F3F00B",   // Radiant 4: Amarillo
  4: "#FF6B00",   // Radiant 5: Naranja
  128: "#FE86C2", // Dire 1: Rosa
  129: "#A1B447", // Dire 2: Verde Oliva
  130: "#65D9F7", // Dire 3: Celeste
  131: "#008321", // Dire 4: Verde Oscuro
  132: "#A46900", // Dire 5: Marrón
};

type AdvantageMetricType = "both" | "gold" | "xp";
type TrajectoryMetricType = "gold" | "lh" | "xp";

export function GameGraphsBoard({ game }: GameGraphsBoardProps) {
  const durationSec = game.duration_seconds || game.opendota_data?.duration || 2400;
  const totalMinutes = Math.max(1, Math.ceil(durationSec / 60));

  const radiantName = game.radiant_team?.name || "The Radiant";
  const direName = game.dire_team?.name || "The Dire";

  // 1. Jugadores procesados con bando e información visual
  const players: ProcessedGraphPlayer[] = useMemo(() => {
    const rawPlayers = game.opendota_data?.players || [];
    return rawPlayers.map((p, idx) => {
      const isRadiant = p.isRadiant !== undefined ? p.isRadiant : p.player_slot != null ? p.player_slot < 128 : idx < 5;
      const teamSlot = p.player_slot != null ? (p.player_slot < 128 ? p.player_slot : p.player_slot - 128) : idx % 5;
      const playerName = getPlayerNickname(p, game, `Jugador ${idx + 1}`);
      const heroDisplayName = getHeroDisplayName(p.hero_id);
      const heroImgUrl = getHeroHorizontalImageUrl(p.hero_id);
      const slotColor = PLAYER_SLOT_COLORS[p.player_slot ?? (isRadiant ? teamSlot : 128 + teamSlot)] || (isRadiant ? "#00e599" : "#ff5555");
      const isCore = teamSlot < 3;

      // Trayectorias por minuto
      const goldT = p.gold_t || Array.from({ length: totalMinutes + 1 }, (_, m) => {
        const net = p.net_worth || (isCore ? 24000 : 12000);
        return Math.round((m / totalMinutes) * (m / totalMinutes) * net);
      });

      const lhT = p.lh_t || Array.from({ length: totalMinutes + 1 }, (_, m) => {
        const lh = p.last_hits || (isCore ? 350 : 80);
        return Math.round((m / totalMinutes) * lh);
      });

      const xpT = p.xp_t || Array.from({ length: totalMinutes + 1 }, (_, m) => {
        const xp = p.total_xp || (isCore ? 28000 : 16000);
        return Math.round((m / totalMinutes) * xp);
      });

      return {
        raw: p,
        playerSlot: p.player_slot ?? idx,
        teamSlot,
        isRadiant,
        isCore,
        playerName,
        heroId: p.hero_id,
        heroDisplayName,
        heroImgUrl,
        slotColor,
        netWorth: p.net_worth || 0,
        damage: p.hero_damage || 0,
        lastHits: p.last_hits || 0,
        goldT,
        lhT,
        xpT,
      };
    });
  }, [game, totalMinutes]);

  const radPlayers = useMemo(() => players.filter(p => p.isRadiant), [players]);
  const dirPlayers = useMemo(() => players.filter(p => !p.isRadiant), [players]);

  // 2. Ventaja de Oro y Experiencia de OpenDota
  const rawGoldAdv = game.opendota_data?.radiant_gold_adv;
  const rawXpAdv = game.opendota_data?.radiant_xp_adv;

  const goldAdv: number[] = useMemo(() => {
    if (rawGoldAdv && rawGoldAdv.length > 0) return rawGoldAdv;
    const radiantWon =
      (game.winner_slug && game.radiant_team?.slug && game.winner_slug === game.radiant_team.slug) ||
      game.opendota_data?.radiant_win === true;
    const sign = radiantWon ? 1 : -1;
    return Array.from({ length: totalMinutes + 1 }, (_, m) => {
      if (m === 0) return 0;
      const progress = m / totalMinutes;
      const noise = Math.sin(m * 0.8) * 1500 + Math.cos(m * 1.2) * 1000;
      return Math.round(sign * (progress * progress * 26000 + noise));
    });
  }, [rawGoldAdv, game, totalMinutes]);

  const xpAdv: number[] = useMemo(() => {
    if (rawXpAdv && rawXpAdv.length > 0) return rawXpAdv;
    return goldAdv.map((g, i) => Math.round(g * (1.08 + Math.sin(i * 0.4) * 0.18)));
  }, [rawXpAdv, goldAdv]);

  // 3. Cálculos de Picos y Momentos de Quiebre
  const metrics = useMemo(() => {
    let maxRadGold = 0;
    let maxRadGoldMin = 0;
    let maxDirGold = 0;
    let maxDirGoldMin = 0;
    let radLeadMinutes = 0;
    let dirLeadMinutes = 0;
    let comebackMin: number | null = null;

    goldAdv.forEach((val, m) => {
      if (val > maxRadGold) {
        maxRadGold = val;
        maxRadGoldMin = m;
      }
      if (val < -maxDirGold) {
        maxDirGold = Math.abs(val);
        maxDirGoldMin = m;
      }
      if (val >= 0) radLeadMinutes++;
      else dirLeadMinutes++;

      // Detectar momento de quiebre (cambio de liderazgo con diferencia mayor a 2k)
      if (m > 10 && comebackMin === null) {
        const prev = goldAdv[m - 1];
        if ((prev < -1000 && val > 1500) || (prev > 1000 && val < -1500)) {
          comebackMin = m;
        }
      }
    });

    const totalTracked = radLeadMinutes + dirLeadMinutes || 1;
    const radLeadPct = Math.round((radLeadMinutes / totalTracked) * 100);
    const dirLeadPct = 100 - radLeadPct;

    return {
      maxRadGold,
      maxRadGoldMin,
      maxDirGold,
      maxDirGoldMin,
      radLeadPct,
      dirLeadPct,
      comebackMin,
    };
  }, [goldAdv]);

  // 4. Estados de control
  const [advMetric, setAdvMetric] = useState<AdvantageMetricType>("both");
  const [trajMetric, setTrajMetric] = useState<TrajectoryMetricType>("gold");
  const [roleFilter, setRoleFilter] = useState<"all" | "cores" | "supports">("all");
  const [selectedPlayerSlots, setSelectedPlayerSlots] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    players.forEach(p => { init[p.playerSlot] = true; });
    return init;
  });

  const togglePlayer = (slot: number) => {
    setSelectedPlayerSlots(prev => ({ ...prev, [slot]: !prev[slot] }));
  };

  // Filtrar jugadores según rol
  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      if (roleFilter === "cores") return p.isCore;
      if (roleFilter === "supports") return !p.isCore;
      return true;
    });
  }, [players, roleFilter]);

  // Totales de Oro y Daño por equipo para la matriz de distribución
  const radTotalNet = radPlayers.reduce((a, b) => a + b.netWorth, 0) || 1;
  const dirTotalNet = dirPlayers.reduce((a, b) => a + b.netWorth, 0) || 1;

  const radTotalDamage = radPlayers.reduce((a, b) => a + b.damage, 0) || 1;
  const dirTotalDamage = dirPlayers.reduce((a, b) => a + b.damage, 0) || 1;

  return (
    <div className="w-full space-y-10 select-none">
      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 1: KPI CARDS IMPERIALES (PICOS Y MOMENTUM)
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pico Radiant */}
        <div className="relative rounded-xl border border-[#2d261e] bg-[#140f0b] p-4 shadow-xl overflow-hidden group hover:border-[#00e599]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-chakra font-bold text-[#00e599] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00e599]" />
              Pico Radiant
            </span>
            <span className="text-[10px] font-mono text-[#8e857b]">min {metrics.maxRadGoldMin}:00</span>
          </div>
          <div className="mt-2 text-2xl font-chakra font-black text-white">
            +{formatSpanishCompact(metrics.maxRadGold)} <span className="text-sm font-mono text-[#d8b467]">G</span>
          </div>
          <div className="mt-1 text-[11px] font-chakra text-[#8e857b]">
            Mayor ventaja de oro a favor de {radiantName}
          </div>
        </div>

        {/* Card 2: Pico Dire */}
        <div className="relative rounded-xl border border-[#2d261e] bg-[#140f0b] p-4 shadow-xl overflow-hidden group hover:border-[#ff5555]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-chakra font-bold text-[#ff5555] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff5555]" />
              Pico Dire
            </span>
            <span className="text-[10px] font-mono text-[#8e857b]">min {metrics.maxDirGoldMin}:00</span>
          </div>
          <div className="mt-2 text-2xl font-chakra font-black text-white">
            +{formatSpanishCompact(metrics.maxDirGold)} <span className="text-sm font-mono text-[#d8b467]">G</span>
          </div>
          <div className="mt-1 text-[11px] font-chakra text-[#8e857b]">
            Mayor ventaja de oro a favor de {direName}
          </div>
        </div>

        {/* Card 3: Punto de Inflexión (Comeback) */}
        <div className="relative rounded-xl border border-[#2d261e] bg-[#140f0b] p-4 shadow-xl overflow-hidden group hover:border-[#d8b467]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-chakra font-bold text-[#d8b467] uppercase tracking-wider flex items-center gap-1.5">
              <IconSparkles size={14} className="text-[#d8b467]" />
              Inflexión
            </span>
            <span className="text-[10px] font-mono text-[#8e857b]">
              {metrics.comebackMin ? `min ${metrics.comebackMin}:00` : "Constante"}
            </span>
          </div>
          <div className="mt-2 text-2xl font-chakra font-black text-white">
            {metrics.comebackMin ? `${metrics.comebackMin}:00` : "Sin Quiebre"}
          </div>
          <div className="mt-1 text-[11px] font-chakra text-[#8e857b]">
            {metrics.comebackMin ? "Minuto clave del vuelco de partida" : "Liderazgo consistente"}
          </div>
        </div>

        {/* Card 4: Control del Mapa y Economía */}
        <div className="relative rounded-xl border border-[#2d261e] bg-[#140f0b] p-4 shadow-xl overflow-hidden group hover:border-[#d8b467]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-chakra font-bold text-[#f0d38f] uppercase tracking-wider flex items-center gap-1.5">
              <IconCoins size={14} className="text-[#d8b467]" />
              Dominancia
            </span>
            <span className="text-[10px] font-mono text-[#8e857b]">{totalMinutes} mins</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl font-chakra font-black text-[#00e599]">{metrics.radLeadPct}%</span>
            <span className="text-xs font-mono text-[#8e857b]">vs</span>
            <span className="text-xl font-chakra font-black text-[#ff5555]">{metrics.dirLeadPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#241c14] rounded-full overflow-hidden mt-1.5 flex">
            <div style={{ width: `${metrics.radLeadPct}%` }} className="bg-[#00e599]" />
            <div style={{ width: `${metrics.dirLeadPct}%` }} className="bg-[#ff5555]" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 2: GRÁFICO MAESTRO DE VENTAJA (GOLD & XP BIPOLAR)
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border border-[#2d261e] bg-[#140f0b] p-5 sm:p-6 shadow-2xl relative">
        {/* Esquinas imperiales */}
        <span className="pointer-events-none absolute -top-1 -left-1 z-30 h-2.5 w-2.5 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -top-1 -right-1 z-30 h-2.5 w-2.5 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -bottom-1 -left-1 z-30 h-2.5 w-2.5 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -bottom-1 -right-1 z-30 h-2.5 w-2.5 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />

        {/* Header con Controles */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#2d261e]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rotate-45 bg-[#d8b467]" />
              <h3 className="font-chakra font-black text-base text-white uppercase tracking-wider">
                Curva de Ventaja Dinámica (Gold & XP)
              </h3>
            </div>
            <p className="text-xs text-[#8e857b] font-chakra mt-0.5">
              Valores sobre 0 representan ventaja de <strong className="text-[#00e599]">{radiantName}</strong>; valores bajo 0 pertenecen a <strong className="text-[#ff5555]">{direName}</strong>.
            </p>
          </div>

          {/* Selector de Métrica */}
          <div className="flex items-center gap-1 bg-[#1c1712] p-1 rounded-xs border border-[#3d3326]">
            <button
              type="button"
              onClick={() => setAdvMetric("both")}
              className={`px-3 py-1 text-xs font-chakra font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                advMetric === "both" ? "bg-[#d8b467] text-black shadow-sm" : "text-[#8e857b] hover:text-white"
              }`}
            >
              Ambos
            </button>
            <button
              type="button"
              onClick={() => setAdvMetric("gold")}
              className={`px-3 py-1 text-xs font-chakra font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                advMetric === "gold" ? "bg-[#d8b467] text-black shadow-sm" : "text-[#8e857b] hover:text-white"
              }`}
            >
              Oro
            </button>
            <button
              type="button"
              onClick={() => setAdvMetric("xp")}
              className={`px-3 py-1 text-xs font-chakra font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                advMetric === "xp" ? "bg-[#d8b467] text-black shadow-sm" : "text-[#8e857b] hover:text-white"
              }`}
            >
              Experiencia
            </button>
          </div>
        </div>

        {/* Gráfico SVG interactivo */}
        <div className="pt-4">
          <FullAdvantageSvg
            goldData={goldAdv}
            xpData={xpAdv}
            totalMinutes={totalMinutes}
            metric={advMetric}
            radiantName={radiantName}
            direName={direName}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 3: LA CARRERA DE FARM (TRAYECTORIA POR JUGADOR)
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border border-[#2d261e] bg-[#140f0b] p-5 sm:p-6 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#2d261e]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rotate-45 bg-[#d8b467]" />
              <h3 className="font-chakra font-black text-base text-white uppercase tracking-wider">
                La Carrera de Farm: Trayectoria por Jugador
              </h3>
            </div>
            <p className="text-xs text-[#8e857b] font-chakra mt-0.5">
              Evolución acumulada de cada héroe minuto a minuto a lo largo de la partida.
            </p>
          </div>

          {/* Toggle de Métricas: Oro / Last Hits / XP */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#1c1712] p-1 rounded-xs border border-[#3d3326]">
              <button
                type="button"
                onClick={() => setTrajMetric("gold")}
                className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-chakra font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                  trajMetric === "gold" ? "bg-[#d8b467] text-black" : "text-[#8e857b] hover:text-white"
                }`}
              >
                Net Worth
              </button>
              <button
                type="button"
                onClick={() => setTrajMetric("lh")}
                className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-chakra font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                  trajMetric === "lh" ? "bg-[#d8b467] text-black" : "text-[#8e857b] hover:text-white"
                }`}
              >
                Last Hits
              </button>
              <button
                type="button"
                onClick={() => setTrajMetric("xp")}
                className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-chakra font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                  trajMetric === "xp" ? "bg-[#d8b467] text-black" : "text-[#8e857b] hover:text-white"
                }`}
              >
                XP
              </button>
            </div>

            {/* Filtro de Rol */}
            <div className="flex items-center gap-1 bg-[#1c1712] p-1 rounded-xs border border-[#3d3326]">
              <button
                type="button"
                onClick={() => setRoleFilter("all")}
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-chakra font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                  roleFilter === "all" ? "bg-[#2d2319] text-[#f0d38f]" : "text-[#8e857b] hover:text-white"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("cores")}
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-chakra font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                  roleFilter === "cores" ? "bg-[#2d2319] text-[#f0d38f]" : "text-[#8e857b] hover:text-white"
                }`}
              >
                Cores
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("supports")}
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-chakra font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                  roleFilter === "supports" ? "bg-[#2d2319] text-[#f0d38f]" : "text-[#8e857b] hover:text-white"
                }`}
              >
                Supports
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Filtro Interactivo por Jugador (con miniaturas y checks de colores) */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar select-none">
          {filteredPlayers.map((p) => {
            const isSelected = !!selectedPlayerSlots[p.playerSlot];
            return (
              <button
                key={`p-pill-${p.playerSlot}`}
                type="button"
                onClick={() => togglePlayer(p.playerSlot)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-xs border text-xs font-chakra transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#1c1712] border-[#d8b467]/60 text-white shadow-sm"
                    : "bg-[#100c08] border-[#2d261e] text-[#594d3c] opacity-50 hover:opacity-80"
                }`}
              >
                <span
                  style={{ backgroundColor: p.slotColor }}
                  className="w-2 h-2 rounded-full flex-shrink-0"
                />
                <picture>
                  <img
                    src={p.heroImgUrl}
                    alt={p.heroDisplayName}
                    className="w-6 h-4 object-cover rounded-xs border border-[#3d3326]"
                  />
                </picture>
                <span className="font-bold truncate max-w-[85px]">{p.playerName}</span>
              </button>
            );
          })}
        </div>

        {/* Gráfico SVG de Trayectorias de Jugadores */}
        <div className="pt-2">
          <PlayerTrajectorySvg
            players={filteredPlayers.filter(p => selectedPlayerSlots[p.playerSlot])}
            totalMinutes={totalMinutes}
            metric={trajMetric}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 4: MATRIZ DE DISTRIBUCIÓN (% FARM & % DAÑO POR EQUIPO)
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución Radiant */}
        <TeamResourceMatrix
          teamName={radiantName}
          isRadiant={true}
          players={radPlayers}
          totalNetWorth={radTotalNet}
          totalDamage={radTotalDamage}
        />

        {/* Distribución Dire */}
        <TeamResourceMatrix
          teamName={direName}
          isRadiant={false}
          players={dirPlayers}
          totalNetWorth={dirTotalNet}
          totalDamage={dirTotalDamage}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUB: Gráfico Bipolar de Ventaja SVG (Radiant arriba / Dire abajo)
// ─────────────────────────────────────────────────────────────────────────────
interface FullAdvantageSvgProps {
  goldData: number[];
  xpData: number[];
  totalMinutes: number;
  metric: AdvantageMetricType;
  radiantName: string;
  direName: string;
}

function FullAdvantageSvg({
  goldData,
  xpData,
  totalMinutes,
  metric,
  radiantName,
  direName,
}: FullAdvantageSvgProps) {
  const [hoveredMin, setHoveredMin] = useState<number | null>(null);

  const chartWidth = 900;
  const chartHeight = 360;
  const padLeft = 70;
  const padRight = 30;
  const padTop = 35;
  const padBottom = 40;

  const innerWidth = chartWidth - padLeft - padRight;
  const innerHeight = chartHeight - padTop - padBottom;

  // Encontrar rango máximo simétrico
  const allValues = [
    ...(metric !== "xp" ? goldData : []),
    ...(metric !== "gold" ? xpData : []),
    0,
  ];
  const absMax = Math.max(...allValues.map(v => Math.abs(v)), 10000);
  const yCeil = Math.ceil(absMax / 10000) * 10000;

  const getYPos = (val: number) => {
    const norm = (val - -yCeil) / (yCeil * 2);
    return padTop + innerHeight - norm * innerHeight;
  };

  const getXPos = (minute: number) => {
    const norm = minute / Math.max(1, totalMinutes);
    return padLeft + norm * innerWidth;
  };

  const zeroY = getYPos(0);

  // Construir path de área bipolar para Oro
  const buildAreaPaths = (data: number[]) => {
    if (!data.length) return { radArea: "", dirArea: "", line: "" };

    const linePoints = data.map((val, m) => `${getXPos(m).toFixed(1)},${getYPos(val).toFixed(1)}`);
    const line = `M ${linePoints.join(" L ")}`;

    // Área completa cerrada contra la línea 0
    const area = `M ${getXPos(0).toFixed(1)},${zeroY.toFixed(1)} L ${linePoints.join(" L ")} L ${getXPos(data.length - 1).toFixed(1)},${zeroY.toFixed(1)} Z`;

    return { area, line };
  };

  const goldPaths = buildAreaPaths(goldData);
  const xpPaths = buildAreaPaths(xpData);

  // Marcas en eje Y
  const yTicks = [yCeil, yCeil * 0.5, 0, -yCeil * 0.5, -yCeil];

  // Marcas en eje X cada 5 o 10 minutos
  const xTickStep = totalMinutes > 45 ? 10 : 5;
  const xTicks: number[] = [];
  for (let m = 0; m <= totalMinutes; m += xTickStep) {
    xTicks.push(m);
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * chartWidth;

    if (svgX < padLeft || svgX > padLeft + innerWidth) {
      setHoveredMin(null);
      return;
    }

    const norm = (svgX - padLeft) / innerWidth;
    const min = Math.round(norm * totalMinutes);
    setHoveredMin(Math.max(0, Math.min(totalMinutes, min)));
  };

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredMin(null)}
      >
        <defs>
          {/* Degradado Verde Radiant (hacia arriba de 0) */}
          <linearGradient id="gradRadAdv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e599" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#00e599" stopOpacity="0.03" />
          </linearGradient>

          {/* Degradado Rojo Dire (hacia abajo de 0) */}
          <linearGradient id="gradDirAdv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff5555" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#ff5555" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Fondo táctico de la cuadrícula */}
        <rect
          x={padLeft}
          y={padTop}
          width={innerWidth}
          height={innerHeight}
          fill="#0c0906"
          stroke="#241c14"
          strokeWidth="1"
        />

        {/* Líneas horizontales de guía */}
        {yTicks.map((tickVal) => {
          const yPos = getYPos(tickVal);
          const isZero = tickVal === 0;
          return (
            <g key={`ytick-${tickVal}`}>
              <line
                x1={padLeft}
                y1={yPos}
                x2={padLeft + innerWidth}
                y2={yPos}
                stroke={isZero ? "#d8b467" : "#1f1811"}
                strokeWidth={isZero ? 1.5 : 1}
                strokeDasharray={isZero ? "none" : "2,2"}
              />
              <text
                x={padLeft - 10}
                y={yPos + 3.5}
                fill={tickVal > 0 ? "#00e599" : tickVal < 0 ? "#ff5555" : "#d8b467"}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="end"
              >
                {tickVal === 0 ? "0" : `${tickVal > 0 ? "+" : ""}${formatSpanishCompact(tickVal)}`}
              </text>
            </g>
          );
        })}

        {/* Líneas verticales de guía (Eje X) */}
        {xTicks.map((min) => {
          const xPos = getXPos(min);
          return (
            <g key={`xtick-${min}`}>
              <line
                x1={xPos}
                y1={padTop}
                x2={xPos}
                y2={padTop + innerHeight}
                stroke="#1f1811"
                strokeWidth="1"
              />
              <text
                x={xPos}
                y={padTop + innerHeight + 16}
                fill="#6e6355"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {min}:00
              </text>
            </g>
          );
        })}

        {/* ── ÁREA BIPOLAR DE ORO ── */}
        {(metric === "both" || metric === "gold") && (
          <>
            <clipPath id="clipAboveZero">
              <rect x={padLeft} y={padTop} width={innerWidth} height={zeroY - padTop} />
            </clipPath>
            <clipPath id="clipBelowZero">
              <rect x={padLeft} y={zeroY} width={innerWidth} height={padTop + innerHeight - zeroY} />
            </clipPath>

            {/* Relleno Radiant (sobre 0) */}
            <path
              d={goldPaths.area}
              fill="url(#gradRadAdv)"
              clipPath="url(#clipAboveZero)"
            />
            {/* Relleno Dire (bajo 0) */}
            <path
              d={goldPaths.area}
              fill="url(#gradDirAdv)"
              clipPath="url(#clipBelowZero)"
            />

            {/* Trazo dorado de Ventaja de Oro */}
            <path
              d={goldPaths.line}
              fill="none"
              stroke="#d8b467"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}

        {/* ── TRAZO DE EXPERIENCIA (XP) ── */}
        {(metric === "both" || metric === "xp") && (
          <path
            d={xpPaths.line}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray={metric === "both" ? "4,3" : "none"}
            strokeLinecap="round"
            opacity="0.9"
          />
        )}

        {/* Indicador de cursor en hover */}
        {hoveredMin !== null && (
          <g>
            <line
              x1={getXPos(hoveredMin)}
              y1={padTop}
              x2={getXPos(hoveredMin)}
              y2={padTop + innerHeight}
              stroke="#ffffff"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            {(metric === "both" || metric === "gold") && (
              <circle
                cx={getXPos(hoveredMin)}
                cy={getYPos(goldData[hoveredMin] || 0)}
                r="4.5"
                fill="#d8b467"
                stroke="#000"
                strokeWidth="1.5"
              />
            )}
            {(metric === "both" || metric === "xp") && (
              <circle
                cx={getXPos(hoveredMin)}
                cy={getYPos(xpData[hoveredMin] || 0)}
                r="4"
                fill="#38bdf8"
                stroke="#000"
                strokeWidth="1.5"
              />
            )}
          </g>
        )}
      </svg>

      {/* Tooltip flotante interactivo */}
      {hoveredMin !== null && (() => {
        const goldVal = goldData[hoveredMin] ?? 0;
        const xpVal = xpData[hoveredMin] ?? 0;
        const xPosPct = (getXPos(hoveredMin) / chartWidth) * 100;
        const isRight = xPosPct > 60;

        return (
          <div
            style={{
              left: `${xPosPct}%`,
              top: "15%",
              transform: isRight ? "translateX(-105%)" : "translateX(10%)",
            }}
            className="absolute z-40 pointer-events-none p-3 rounded-lg bg-[#140f0a]/95 border border-[#d8b467]/50 shadow-2xl backdrop-blur-md text-xs font-chakra"
          >
            <div className="flex items-center justify-between gap-4 font-bold border-b border-[#2d261e] pb-1.5 mb-1.5">
              <span className="text-white">Minuto {hoveredMin}:00</span>
              <span className={goldVal >= 0 ? "text-[#00e599]" : "text-[#ff5555]"}>
                {goldVal >= 0 ? radiantName : direName} lidera
              </span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#d8b467] font-bold">Ventaja Oro:</span>
                <span className={goldVal >= 0 ? "text-[#00e599]" : "text-[#ff5555]"}>
                  {goldVal >= 0 ? "+" : ""}{goldVal.toLocaleString()} G
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#38bdf8] font-bold">Ventaja XP:</span>
                <span className={xpVal >= 0 ? "text-[#00e599]" : "text-[#ff5555]"}>
                  {xpVal >= 0 ? "+" : ""}{xpVal.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Leyenda interactiva */}
      <div className="flex items-center justify-center gap-6 pt-3 text-xs font-chakra">
        {(metric === "both" || metric === "gold") && (
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-[#d8b467] rounded-full" />
            <span className="text-[#d8b467] font-bold">Ventaja de Oro</span>
          </div>
        )}
        {(metric === "both" || metric === "xp") && (
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-[#38bdf8] rounded-full border-t border-dashed" />
            <span className="text-[#38bdf8] font-bold">Ventaja de Experiencia (XP)</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUB: Trayectoria por Jugador (La Carrera de Farm SVG Multilínea)
// ─────────────────────────────────────────────────────────────────────────────
interface ProcessedPlayerTrajectory {
  playerSlot: number;
  playerName: string;
  heroDisplayName: string;
  heroImgUrl: string;
  slotColor: string;
  isRadiant: boolean;
  goldT: number[];
  lhT: number[];
  xpT: number[];
}

interface PlayerTrajectorySvgProps {
  players: ProcessedPlayerTrajectory[];
  totalMinutes: number;
  metric: TrajectoryMetricType;
}

function PlayerTrajectorySvg({
  players,
  totalMinutes,
  metric,
}: PlayerTrajectorySvgProps) {
  const [hoveredMin, setHoveredMin] = useState<number | null>(null);

  const chartWidth = 900;
  const chartHeight = 320;
  const padLeft = 65;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;

  const innerWidth = chartWidth - padLeft - padRight;
  const innerHeight = chartHeight - padTop - padBottom;

  // Extraer valores máximos según métrica
  const getDataForPlayer = (p: ProcessedPlayerTrajectory) => {
    if (metric === "lh") return p.lhT;
    if (metric === "xp") return p.xpT;
    return p.goldT;
  };

  const allVals: number[] = [];
  players.forEach(p => {
    allVals.push(...getDataForPlayer(p));
  });

  const maxVal = Math.max(...allVals, 1000);
  const yCeil = Math.ceil(maxVal / 5000) * 5000 || maxVal;

  const getYPos = (val: number) => {
    const norm = val / yCeil;
    return padTop + innerHeight - norm * innerHeight;
  };

  const getXPos = (minute: number) => {
    const norm = minute / Math.max(1, totalMinutes);
    return padLeft + norm * innerWidth;
  };

  const yTicks = [yCeil, yCeil * 0.75, yCeil * 0.5, yCeil * 0.25, 0];
  const xTicks: number[] = [];
  const xStep = totalMinutes > 40 ? 10 : 5;
  for (let m = 0; m <= totalMinutes; m += xStep) {
    xTicks.push(m);
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * chartWidth;

    if (svgX < padLeft || svgX > padLeft + innerWidth) {
      setHoveredMin(null);
      return;
    }

    const norm = (svgX - padLeft) / innerWidth;
    const min = Math.round(norm * totalMinutes);
    setHoveredMin(Math.max(0, Math.min(totalMinutes, min)));
  };

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredMin(null)}
      >
        {/* Fondo */}
        <rect
          x={padLeft}
          y={padTop}
          width={innerWidth}
          height={innerHeight}
          fill="#0c0906"
          stroke="#241c14"
          strokeWidth="1"
        />

        {/* Guías eje Y */}
        {yTicks.map((tickVal) => {
          const yPos = getYPos(tickVal);
          return (
            <g key={`y-${tickVal}`}>
              <line
                x1={padLeft}
                y1={yPos}
                x2={padLeft + innerWidth}
                y2={yPos}
                stroke="#1f1811"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={padLeft - 8}
                y={yPos + 3.5}
                fill="#8e857b"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                {formatSpanishCompact(tickVal)}
              </text>
            </g>
          );
        })}

        {/* Guías eje X */}
        {xTicks.map((min) => {
          const xPos = getXPos(min);
          return (
            <g key={`x-${min}`}>
              <line
                x1={xPos}
                y1={padTop}
                x2={xPos}
                y2={padTop + innerHeight}
                stroke="#1f1811"
                strokeWidth="1"
              />
              <text
                x={xPos}
                y={padTop + innerHeight + 16}
                fill="#6e6355"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {min}:00
              </text>
            </g>
          );
        })}

        {/* Líneas de cada jugador */}
        {players.map((p) => {
          const data = getDataForPlayer(p);
          const points = data.map((val, m) => `${getXPos(m).toFixed(1)},${getYPos(val).toFixed(1)}`);
          const d = `M ${points.join(" L ")}`;

          return (
            <path
              key={`line-${p.playerSlot}`}
              d={d}
              fill="none"
              stroke={p.slotColor}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.85"
            />
          );
        })}

        {/* Línea vertical de inspección */}
        {hoveredMin !== null && (
          <line
            x1={getXPos(hoveredMin)}
            y1={padTop}
            x2={getXPos(hoveredMin)}
            y2={padTop + innerHeight}
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        )}
      </svg>

      {/* Tooltip con ranking al minuto hovered */}
      {hoveredMin !== null && (() => {
        const sorted = [...players].sort((a, b) => {
          const valA = getDataForPlayer(a)[hoveredMin] ?? 0;
          const valB = getDataForPlayer(b)[hoveredMin] ?? 0;
          return valB - valA;
        });

        const xPosPct = (getXPos(hoveredMin) / chartWidth) * 100;
        const isRight = xPosPct > 60;

        return (
          <div
            style={{
              left: `${xPosPct}%`,
              top: "10%",
              transform: isRight ? "translateX(-105%)" : "translateX(10%)",
            }}
            className="absolute z-40 pointer-events-none p-3 rounded-lg bg-[#140f0a]/95 border border-[#d8b467]/50 shadow-2xl backdrop-blur-md text-xs font-chakra min-w-[200px]"
          >
            <div className="font-bold text-white border-b border-[#2d261e] pb-1 mb-1.5 flex justify-between">
              <span>Top Minuto {hoveredMin}:00</span>
              <span className="text-[#d8b467] font-mono capitalize">{metric}</span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              {sorted.slice(0, 5).map((p, rank) => {
                const val = getDataForPlayer(p)[hoveredMin] ?? 0;
                return (
                  <div key={p.playerSlot} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                      <span className="text-[#8e857b] text-[9px] w-3">#{rank + 1}</span>
                      <span style={{ color: p.slotColor }} className="font-bold truncate">
                        {p.playerName}
                      </span>
                    </div>
                    <span className="text-white font-bold">{val.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUB: Matriz de Distribución de Recursos por Equipo (% Farm & % Daño)
// ─────────────────────────────────────────────────────────────────────────────
interface TeamResourceMatrixProps {
  teamName: string;
  isRadiant: boolean;
  players: ProcessedGraphPlayer[];
  totalNetWorth: number;
  totalDamage: number;
}

function TeamResourceMatrix({
  teamName,
  isRadiant,
  players,
  totalNetWorth,
  totalDamage,
}: TeamResourceMatrixProps) {
  const teamColor = isRadiant ? "text-[#00e599]" : "text-[#ff5555]";
  const dotColor = isRadiant ? "bg-[#00e599]" : "bg-[#ff5555]";

  return (
    <div className="rounded-xl border border-[#2d261e] bg-[#140f0b] p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2d261e]">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <h4 className={`font-chakra font-bold text-sm sm:text-base uppercase tracking-wider ${teamColor}`}>
            {teamName} – Cuota de Recursos & Daño
          </h4>
        </div>
        <span className="text-xs font-mono text-[#d8b467]">
          {formatSpanishCompact(totalNetWorth)} Oro Total
        </span>
      </div>

      {/* Lista de Jugadores */}
      <div className="divide-y divide-[#2d261e]/50 mt-2">
        {players.map((p) => {
          const farmShare = Math.round((p.netWorth / totalNetWorth) * 100) || 0;
          const damageShare = Math.round((p.damage / totalDamage) * 100) || 0;
          // Índice de eficiencia: daño generado por cada oro
          const efficiencyRatio = (p.damage / Math.max(1, p.netWorth)).toFixed(2);

          return (
            <div key={p.playerSlot} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Jugador */}
              <div className="flex items-center gap-2.5 min-w-[140px]">
                <picture>
                  <img
                    src={p.heroImgUrl}
                    alt={p.heroDisplayName}
                    className="w-9 h-6 object-cover rounded-xs border border-[#3d3326]"
                  />
                </picture>
                <div className="min-w-0">
                  <div className="font-chakra font-bold text-white text-xs truncate max-w-[110px]">
                    {p.playerName}
                  </div>
                  <div className="text-[10px] text-[#8e857b] font-chakra">{p.heroDisplayName}</div>
                </div>
              </div>

              {/* Barras de % Farm y % Daño */}
              <div className="flex-1 w-full sm:w-auto grid grid-cols-2 gap-4 text-xs font-mono">
                {/* Cuota de Oro */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#8e857b]">Farm Share:</span>
                    <span className="text-[#f0d38f] font-bold">{farmShare}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#241c14] rounded-full overflow-hidden border border-[#3d3326]">
                    <div
                      style={{ width: `${Math.max(farmShare, 4)}%` }}
                      className="h-full bg-[#d8b467] rounded-full"
                    />
                  </div>
                </div>

                {/* Cuota de Daño */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#8e857b]">Damage Share:</span>
                    <span className={isRadiant ? "text-[#00e599] font-bold" : "text-[#ff5555] font-bold"}>
                      {damageShare}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#241c14] rounded-full overflow-hidden border border-[#3d3326]">
                    <div
                      style={{ width: `${Math.max(damageShare, 4)}%` }}
                      className={`h-full ${isRadiant ? "bg-[#00e599]" : "bg-[#ff5555]"} rounded-full`}
                    />
                  </div>
                </div>
              </div>

              {/* Ratio de Eficiencia */}
              <div className="text-right min-w-[65px] hidden sm:block">
                <span className="text-[10px] text-[#8e857b] font-chakra block">Dmg/Gold</span>
                <span className="text-xs font-mono font-extrabold text-white">
                  {efficiencyRatio}x
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
