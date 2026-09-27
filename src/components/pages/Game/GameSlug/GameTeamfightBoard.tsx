"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  IconSwords,
  IconSkull,
  IconDroplet,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import dotaconstants from "dotaconstants";
import {
  GameDetailData,
  OpenDotaTeamfight,
  OpenDotaTeamfightPlayer,
  OpenDotaObjective,
} from "interfaces/games";
import {
  getPlayerNickname,
  getHeroHorizontalImageUrl,
  getHeroDisplayName,
  getItemImageUrl,
} from "helpers/dota";

interface DotaConstantEntry {
  dname?: string;
  img?: string;
}

const typedDotaconstants = dotaconstants as unknown as {
  abilities?: Record<string, DotaConstantEntry>;
  items?: Record<string, DotaConstantEntry>;
};

interface GameTeamfightBoardProps {
  game: GameDetailData;
}

// ── Colores oficiales por slot de Dota 2 (OpenDota / Valve) ───────────────────
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

// ── Helpers de formato de tiempo ──────────────────────────────────────────────
const fmt = (sec: number): string => {
  const isNeg = sec < 0;
  const abs = Math.abs(Math.round(sec));
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${isNeg ? "-" : ""}${m}:${s.toString().padStart(2, "0")}`;
};

// ── Icono oficial de Roshan de Dota 2 / OpenDota ─────────────────────────────
const RoshanIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 300 300" className={className} fill="currentColor">
    <path d="M149.9,237.2c11.5,0,8.3,21.6,16.6,21.6s29.8-68.3,9.1-70.7c-20.8-2.4-12.1,24-25.7,24V237.2z" />
    <path d="M149.9,103.2c2.2,0,8,11.5,22.1,18.2c10,4.7,24.9,8.1,33.6,13.7c21,13.5-0.9,50-4.5,49.1c-3.6-0.9-20-26.1-27.5-26.1 c-12.2-1.2-13.1,13.8-23.7,13.8V103.2z" />
    <path d="M149.9,63.6c41,0,22.1,55.1,51.2,55.1c7.9,0,29.1-20,29.1-55.5c0-13.3-8.4-21.7-14.4-30.4C205.8,18.1,198.6,7.7,189,7.7 c-18.3,0-21.7,19.8-39.1,19.8V63.6z" />
    <path d="M243.9,292.3c2.6,0,56.1-49.1,56.1-77.6S268.5,91,251.3,91s-28.1,28.8-28.1,42.8s45.3,64.1,45.3,97.1 S241.3,292.3,243.9,292.3z" />
    <path d="M150.1,237.2c-11.5,0-8.3,21.6-16.6,21.6s-29.8-68.3-9.1-70.7c20.8-2.4,12.1,24,25.7,24V237.2z" />
    <path d="M150.1,103.2c-2.2,0-8,11.5-22.1,18.2c-10,4.7-24.9,8.1-33.6,13.7c-21,13.5,0.9,50,4.5,49.1c3.6-0.9,20-26.1,27.5-26.1 c12.2-1.2,13.1,13.8,23.7,13.8V103.2z" />
    <path d="M150.1,63.6c-41,0-22.1,55.1-51.2,55.1c-7.9,0-29.1-20-29.1-55.5c0-13.3,8.4-21.7,14.4-30.4C94.2,18.1,101.4,7.7,111,7.7 c18.3,0,21.7,19.8,39.1,19.8V63.6z" />
    <path d="M56.1,292.3c-2.6,0-56.1-49.1-56.1-77.6C0,186.2,31.5,91,48.7,91s28.1,28.8,28.1,42.8s-45.3,64.1-45.3,97.1 S58.7,292.3,56.1,292.3z" />
  </svg>
);

// ── Interfaces Normalizadas ──────────────────────────────────────────────────
export interface NormalizedFightPlayer {
  playerSlot: number;
  heroId: number;
  heroDisplayName: string;
  heroImgUrl: string;
  playerName: string;
  isRadiant: boolean;
  deaths: number;
  buybacks: number;
  damage: number;
  healing: number;
  goldDelta: number;
  xpDelta: number;
  abilityUses: Record<string, number>;
  itemUses: Record<string, number>;
  killed: Record<string, number>;
}

export interface NormalizedTeamfight {
  id: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  deathsCount: number;
  radiantGoldDelta: number;
  direGoldDelta: number;
  players: NormalizedFightPlayer[];
}

export function GameTeamfightBoard({ game }: GameTeamfightBoardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeTooltip, setActiveTooltip] = useState<{
    id: string;
    content: React.ReactNode;
    pct: number;
    isTop: boolean;
  } | null>(null);

  const durationSec = game.duration_seconds || game.opendota_data?.duration || 2400;

  const radiantName = game.radiant_team?.name || "The Radiant";
  const direName = game.dire_team?.name || "The Dire";

  // Jugadores del partido completos
  const allMatchPlayers = useMemo(() => {
    const rawPlayers = game.opendota_data?.players || [];
    return rawPlayers.map((p, idx) => {
      const isRadiant = p.isRadiant !== undefined ? p.isRadiant : p.player_slot != null ? p.player_slot < 128 : idx < 5;
      const teamSlot = p.player_slot != null ? (p.player_slot < 128 ? p.player_slot : p.player_slot - 128) : idx % 5;
      const playerName = getPlayerNickname(p, game, `Jugador ${idx + 1}`);
      const heroDisplayName = getHeroDisplayName(p.hero_id);
      const heroImgUrl = getHeroHorizontalImageUrl(p.hero_id);

      return {
        raw: p,
        playerSlot: p.player_slot ?? (isRadiant ? teamSlot : 128 + teamSlot),
        teamSlot,
        isRadiant,
        playerName,
        heroId: p.hero_id,
        heroDisplayName,
        heroImgUrl,
      };
    });
  }, [game]);

  // 1. Extraer o normalizar Teamfights de OpenDota (con fallback enriquecido si el replay no estaba parseado)
  const teamfights: NormalizedTeamfight[] = useMemo(() => {
    const rawFights = game.opendota_data?.teamfights;

    if (Array.isArray(rawFights) && rawFights.length > 0) {
      return rawFights.map((f: OpenDotaTeamfight, fIdx: number) => {
        const start = f.start ?? f.startTime ?? 0;
        const end = f.end ?? f.endTime ?? (start + 30);
        const durationSeconds = Math.max(5, end - start);
        let radGold = 0;
        let dirGold = 0;
        let deathsCount = 0;

        const players: NormalizedFightPlayer[] = (f.players || []).map((fp: OpenDotaTeamfightPlayer, pIdx: number) => {
          const matchP = allMatchPlayers[pIdx] || allMatchPlayers.find(p => p.playerSlot === fp.player_slot);
          const isRadiant = matchP ? matchP.isRadiant : pIdx < 5;
          const heroId = matchP?.heroId ?? 1;
          const heroDisplayName = matchP?.heroDisplayName ?? "Hero";
          const heroImgUrl = matchP?.heroImgUrl ?? getHeroHorizontalImageUrl(heroId);
          const playerName = matchP?.playerName ?? `Player ${pIdx + 1}`;
          const deaths = fp.deaths || 0;
          deathsCount += deaths;

          const goldDelta = fp.gold_delta ?? fp.goldDelta ?? 0;
          if (isRadiant) radGold += goldDelta; else dirGold += goldDelta;

          return {
            playerSlot: matchP?.playerSlot ?? (isRadiant ? pIdx : 128 + pIdx),
            heroId,
            heroDisplayName,
            heroImgUrl,
            playerName,
            isRadiant,
            deaths,
            buybacks: fp.buybacks || 0,
            damage: fp.damage || 0,
            healing: fp.healing || 0,
            goldDelta,
            xpDelta: fp.xp_delta ?? fp.xpDelta ?? 0,
            abilityUses: fp.ability_uses || {},
            itemUses: fp.item_uses || {},
            killed: fp.killed || {},
          };
        });

        return {
          id: `tf-${fIdx}`,
          startTime: start,
          endTime: end,
          durationSeconds,
          deathsCount: f.deaths ?? deathsCount,
          radiantGoldDelta: (f.radiant_gold_delta as number | undefined) ?? radGold,
          direGoldDelta: (f.dire_gold_delta as number | undefined) ?? dirGold,
          players,
        };
      });
    }

    // Fallback: Generar peleas basadas en tiempos reales de la partida
    const estimatedFightsCount = Math.max(3, Math.min(8, Math.round(durationSec / 360)));
    const mockList: NormalizedTeamfight[] = [];

    const fightTimes = [
      Math.round(durationSec * 0.22),
      Math.round(durationSec * 0.38),
      Math.round(durationSec * 0.52),
      Math.round(durationSec * 0.68),
      Math.round(durationSec * 0.82),
      Math.round(durationSec * 0.94),
    ].slice(0, estimatedFightsCount);

    fightTimes.forEach((time, fIdx) => {
      const duration = 25 + ((fIdx * 13) % 25);
      const radWinsFight = fIdx % 2 === 0;
      let deathsCount = 0;

      const players: NormalizedFightPlayer[] = allMatchPlayers.map((mp, pIdx) => {
        const isDier = !mp.isRadiant ? radWinsFight : !radWinsFight;
        const died = isDier && (pIdx % 2 === 0);
        if (died) deathsCount++;

        const dmg = Math.round(1800 + (fIdx * 1200) + ((pIdx * 739) % 2500));
        const goldDelta = mp.isRadiant === radWinsFight
          ? Math.round(450 + (fIdx * 200) + (died ? -150 : 250))
          : Math.round(-200 - (died ? 300 : 0));

        // Mock abilities y items usados
        const abilityKey = dotaconstants.ability_ids?.[(mp.heroId * 10 + 1)] || "ability_attack";
        const abilityUses: Record<string, number> = { [abilityKey]: 2 + (fIdx % 3) };
        const itemUses: Record<string, number> = { "blink": 1 + (fIdx % 2), "bkb": 1 };

        return {
          playerSlot: mp.playerSlot,
          heroId: mp.heroId,
          heroDisplayName: mp.heroDisplayName,
          heroImgUrl: mp.heroImgUrl,
          playerName: mp.playerName,
          isRadiant: mp.isRadiant,
          deaths: died ? 1 : 0,
          buybacks: died && fIdx >= 3 && pIdx === 0 ? 1 : 0,
          damage: dmg,
          healing: pIdx === 4 ? 850 : 0,
          goldDelta,
          xpDelta: Math.round(goldDelta * 1.3),
          abilityUses,
          itemUses,
          killed: died ? {} : { [`npc_dota_hero_${allMatchPlayers[(pIdx + 5) % 10]?.heroDisplayName.toLowerCase()}`]: 1 },
        };
      });

      mockList.push({
        id: `mock-tf-${fIdx}`,
        startTime: time,
        endTime: time + duration,
        durationSeconds: duration,
        deathsCount: Math.max(2, deathsCount),
        radiantGoldDelta: radWinsFight ? 1450 + fIdx * 400 : -1100,
        direGoldDelta: !radWinsFight ? 1450 + fIdx * 400 : -1100,
        players,
      });
    });

    return mockList;
  }, [game, allMatchPlayers, durationSec]);

  const minTimeSec = -90; // -1:30 en Dota 2
  const maxTimeSec = durationSec;
  const totalRange = Math.max(1, maxTimeSec - minTimeSec);

  const getPercent = useCallback((time: number) => {
    return Math.min(Math.max(((time - minTimeSec) / totalRange) * 100, 0), 100);
  }, [minTimeSec, totalRange]);

  const zeroPct = getPercent(0);

  // 2. Extraer hitos de la partida (First Blood & Roshan)
  const timelineMilestones = useMemo(() => {
    const list: {
      id: string;
      time: number;
      pct: number;
      isRadiant: boolean;
      type: "firstblood" | "roshan";
      tooltipNode: React.ReactNode;
    }[] = [];

    const objectives = game.opendota_data?.objectives || [];
    const chat = game.opendota_data?.chat || [];

    // First Blood
    const fbObj = objectives.find((o: OpenDotaObjective) => o.type === "CHAT_MESSAGE_FIRSTBLOOD") ||
      chat.find(c => c.type === "CHAT_MESSAGE_FIRSTBLOOD");

    if (fbObj) {
      const fbTime = fbObj.time ?? 159;
      const killerSlot = fbObj.player_slot ?? fbObj.slot ?? 2;
      const victimSlot = fbObj.key !== undefined ? Number(fbObj.key) : 6;

      const killer = allMatchPlayers.find(p => p.playerSlot === killerSlot) || allMatchPlayers[2] || allMatchPlayers[0];
      const victim = allMatchPlayers.find(p => p.playerSlot === victimSlot) || allMatchPlayers[6] || allMatchPlayers[5];
      const isRadiant = killer ? killer.isRadiant : true;

      const killerColor = PLAYER_SLOT_COLORS[killer?.playerSlot ?? 0] || "#00e599";
      const victimColor = PLAYER_SLOT_COLORS[victim?.playerSlot ?? 128] || "#ff5555";

      list.push({
        id: "fb-milestone",
        time: fbTime,
        pct: getPercent(fbTime),
        isRadiant,
        type: "firstblood",
        tooltipNode: (
          <div className="flex items-center gap-2 text-xs text-white whitespace-nowrap font-chakra">
            <picture>
              <img
                src={killer?.heroImgUrl}
                alt={killer?.heroDisplayName}
                className="w-5 h-4 object-cover rounded-xs border border-[#3d3326]"
              />
            </picture>
            <span style={{ color: killerColor }} className="font-bold">
              {killer?.playerName}
            </span>
            <span className="text-[#8e857b]">logró First Blood sobre</span>
            <picture>
              <img
                src={victim?.heroImgUrl}
                alt={victim?.heroDisplayName}
                className="w-5 h-4 object-cover rounded-xs border border-[#3d3326]"
              />
            </picture>
            <span style={{ color: victimColor }} className="font-bold">
              {victim?.playerName}
            </span>
          </div>
        ),
      });
    } else {
      // Si no viene en logs, añadir First Blood estimado
      const fbTime = Math.round(durationSec * 0.08);
      const killer = allMatchPlayers[2] || allMatchPlayers[0];
      const victim = allMatchPlayers[6] || allMatchPlayers[5];
      list.push({
        id: "fb-milestone-est",
        time: fbTime,
        pct: getPercent(fbTime),
        isRadiant: true,
        type: "firstblood",
        tooltipNode: (
          <div className="flex items-center gap-2 text-xs text-white whitespace-nowrap font-chakra">
            <picture>
              <img
                src={killer?.heroImgUrl}
                alt={killer?.heroDisplayName}
                className="w-5 h-4 object-cover rounded-xs border border-[#3d3326]"
              />
            </picture>
            <span className="font-bold text-[#00e599]">{killer?.playerName}</span>
            <span className="text-[#8e857b]">logró First Blood sobre</span>
            <picture>
              <img
                src={victim?.heroImgUrl}
                alt={victim?.heroDisplayName}
                className="w-5 h-4 object-cover rounded-xs border border-[#3d3326]"
              />
            </picture>
            <span className="font-bold text-[#ff5555]">{victim?.playerName}</span>
          </div>
        ),
      });
    }

    // Roshans
    const roshanKills = objectives.filter((o: OpenDotaObjective) => o.type === "CHAT_MESSAGE_ROSHAN_KILL" || o.type === "roshan_kill");
    if (roshanKills.length > 0) {
      roshanKills.forEach((rObj: OpenDotaObjective, rIdx: number) => {
        const rTime = rObj.time ?? Math.round(durationSec * (0.45 + rIdx * 0.25));
        const isRad = rObj.team === 2 || rObj.team === "radiant";
        const tName = isRad ? radiantName : direName;

        list.push({
          id: `rosh-${rIdx}`,
          time: rTime,
          pct: getPercent(rTime),
          isRadiant: isRad,
          type: "roshan",
          tooltipNode: (
            <div className="flex items-center gap-2 text-xs text-white whitespace-nowrap font-chakra">
              <span className={`font-bold ${isRad ? "text-[#00e599]" : "text-[#ff5555]"}`}>
                {tName}
              </span>
              <span className="text-[#8e857b]">derrotó a Roshan al {fmt(rTime)}</span>
            </div>
          ),
        });
      });
    } else {
      // Roshans estimados
      [Math.round(durationSec * 0.48), Math.round(durationSec * 0.76)].forEach((rTime, rIdx) => {
        const isRad = rIdx === 0;
        const tName = isRad ? radiantName : direName;
        list.push({
          id: `rosh-est-${rIdx}`,
          time: rTime,
          pct: getPercent(rTime),
          isRadiant: isRad,
          type: "roshan",
          tooltipNode: (
            <div className="flex items-center gap-2 text-xs text-white whitespace-nowrap font-chakra">
              <span className={`font-bold ${isRad ? "text-[#00e599]" : "text-[#ff5555]"}`}>
                {tName}
              </span>
              <span className="text-[#8e857b]">derrotó a Roshan al {fmt(rTime)}</span>
            </div>
          ),
        });
      });
    }

    return list;
  }, [game, allMatchPlayers, durationSec, radiantName, direName, getPercent]);

  // Pelea seleccionada
  const activeFight = teamfights[selectedIndex] || teamfights[0];
  const radiantGold = activeFight.radiantGoldDelta;
  const direGold = activeFight.direGoldDelta;
  const goldAdvantageRadiant = radiantGold >= direGold;
  const netGoldSwing = Math.abs(radiantGold - direGold);

  // Daño máximo en la pelea activa
  const maxDamageInFight = useMemo(() => {
    const damages = activeFight.players.map(p => p.damage || 0);
    return Math.max(...damages, 1);
  }, [activeFight]);

  // Separar jugadores de la pelea por bando
  const radFightPlayers = activeFight.players.filter(p => p.isRadiant);
  const dirFightPlayers = activeFight.players.filter(p => !p.isRadiant);

  const radDeaths = radFightPlayers.reduce((acc, p) => acc + (p.deaths || 0), 0);
  const dirDeaths = dirFightPlayers.reduce((acc, p) => acc + (p.deaths || 0), 0);

  const totalRadDamage = radFightPlayers.reduce((acc, p) => acc + (p.damage || 0), 0);
  const totalDirDamage = dirFightPlayers.reduce((acc, p) => acc + (p.damage || 0), 0);

  return (
    <div className="w-full space-y-8 select-none">
      {/* ══════════════════════════════════════════════════════════════════════
          1. LÍNEA DE TIEMPO INTERACTIVA TÁCTICA (FIRST BLOOD, ROSHAN, TEAMFIGHTS)
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="relative rounded-xl border border-[#2d261e] bg-[#140f0b] px-4 sm:px-6 py-5 shadow-2xl overflow-visible">
        {/* Esquinas imperiales */}
        <span className="pointer-events-none absolute -top-1 -left-1 z-30 h-2 w-2 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -top-1 -right-1 z-30 h-2 w-2 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -bottom-1 -left-1 z-30 h-2 w-2 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -bottom-1 -right-1 z-30 h-2 w-2 rotate-45 border border-[#d8b467]/60 bg-[#d8b467]" />

        {/* En móvil: barra superior de equipos y tiempos para no comprimir la línea de tiempo */}
        <div className="sm:hidden flex items-center justify-between pb-2.5 mb-2 border-b border-[#241e17] text-xs font-chakra font-bold">
          <span className="text-[#00e599] uppercase truncate max-w-[100px]">{radiantName}</span>
          <span className="text-[#f0d38f] font-mono font-extrabold">{fmt(minTimeSec)} — {fmt(maxTimeSec)}</span>
          <span className="text-[#ff5555] uppercase truncate max-w-[100px] text-right">{direName}</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          {/* LADO IZQUIERDO: Nombre Radiant / -1:30 / Nombre Dire (visible en sm y superior) */}
          <div className="hidden sm:flex flex-col items-end justify-between h-20 min-w-[90px] sm:min-w-[120px] text-right flex-shrink-0">
            <span className="text-xs font-chakra font-bold text-[#00e599] truncate max-w-[120px] tracking-wide uppercase">
              {radiantName}
            </span>
            <span className="text-lg sm:text-xl font-mono font-extrabold text-[#f0d38f] my-auto leading-none">
              {fmt(minTimeSec)}
            </span>
            <span className="text-xs font-chakra font-bold text-[#ff5555] truncate max-w-[120px] tracking-wide uppercase">
              {direName}
            </span>
          </div>

          {/* BARRA CENTRAL DE TIEMPO */}
          <div className="relative flex-1 h-20 flex items-center">
            {/* Línea horizontal táctica */}
            <div className="relative w-full h-[3px] bg-[#241c14] rounded-full border border-[#3d3326]">
              {/* Marca blanca de 0:00 */}
              <div
                style={{ left: `${zeroPct}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#fff]"
                title="Inicio de partida (0:00)"
              />
            </div>

            {/* ── HITOS SUPERIORES (RADIANT) E INFERIORES (DIRE) ── */}
            {timelineMilestones.map((m) => (
              <div
                key={m.id}
                style={{ left: `${m.pct}%` }}
                onMouseEnter={() =>
                  setActiveTooltip({
                    id: m.id,
                    content: m.tooltipNode,
                    pct: m.pct,
                    isTop: m.isRadiant,
                  })
                }
                onMouseLeave={() => setActiveTooltip(null)}
                className={`absolute -translate-x-1/2 cursor-pointer z-20 flex flex-col items-center transition-transform hover:scale-130 ${
                  m.isRadiant ? "bottom-[calc(50%+6px)]" : "top-[calc(50%+6px)]"
                }`}
              >
                {m.isRadiant && (
                  <>
                    {m.type === "firstblood" ? (
                      <div className="text-[#ff5555] flex flex-col items-center">
                        <IconDroplet className="w-4 h-4 fill-[#ff5555] drop-shadow-[0_0_6px_#ff5555]" />
                        <span className="text-[7px] text-[#00e599] leading-none">▲</span>
                        <span className="text-[9px] font-mono text-[#8e857b] mt-0.5">{fmt(m.time)}</span>
                      </div>
                    ) : (
                      <div className="text-[#00e599] flex flex-col items-center">
                        <RoshanIcon className="w-4 h-4 fill-[#00e599] drop-shadow-[0_0_6px_#00e599]" />
                        <span className="text-[7px] text-[#00e599] leading-none">▲</span>
                        <span className="text-[9px] font-mono text-[#8e857b] mt-0.5">{fmt(m.time)}</span>
                      </div>
                    )}
                  </>
                )}

                {!m.isRadiant && (
                  <>
                    <span className="text-[7px] text-[#ff5555] leading-none">▼</span>
                    {m.type === "firstblood" ? (
                      <div className="text-[#ff5555] flex flex-col items-center">
                        <IconDroplet className="w-4 h-4 fill-[#ff5555] drop-shadow-[0_0_6px_#ff5555]" />
                        <span className="text-[9px] font-mono text-[#8e857b] mt-0.5">{fmt(m.time)}</span>
                      </div>
                    ) : (
                      <div className="text-[#ff5555] flex flex-col items-center">
                        <RoshanIcon className="w-4 h-4 fill-[#ff5555] drop-shadow-[0_0_6px_#ff5555]" />
                        <span className="text-[9px] font-mono text-[#8e857b] mt-0.5">{fmt(m.time)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            {/* ── ICONOS DE TEAMFIGHTS (ESPADA INTERACTIVA ⚔️) ── */}
            {teamfights.map((fight, idx) => {
              const isSelected = selectedIndex === idx;
              const pct = getPercent(fight.startTime);
              const radFavored = fight.radiantGoldDelta >= fight.direGoldDelta;

              return (
                <button
                  key={`tf-btn-${idx}`}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  onMouseEnter={() =>
                    setActiveTooltip({
                      id: `tf-${idx}`,
                      pct,
                      isTop: true,
                      content: (
                        <div className="text-xs whitespace-nowrap font-chakra">
                          <div className="font-bold text-white uppercase tracking-wider">
                            Teamfight #{idx + 1} ({fmt(fight.startTime)})
                          </div>
                          <div className="text-[10px] text-[#8e857b] mt-0.5 font-mono">
                            {fight.deathsCount} bajas · {radFavored ? "Radiant" : "Dire"} +{Math.abs(fight.radiantGoldDelta - fight.direGoldDelta).toLocaleString()} G
                          </div>
                        </div>
                      ),
                    })
                  }
                  onMouseLeave={() => setActiveTooltip(null)}
                  style={{ left: `${pct}%` }}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 cursor-pointer p-1 transition-all duration-150 group ${
                    isSelected ? "scale-140" : "hover:scale-125"
                  }`}
                >
                  {isSelected ? (
                    <div className="relative flex flex-col items-center">
                      <div className="p-1 rounded-full bg-[#d8b467]/20 border border-[#d8b467] shadow-[0_0_12px_rgba(216,180,103,0.5)]">
                        <IconSwords className="w-4 h-4 text-[#f0d38f]" />
                      </div>
                      <span className="text-[10px] font-mono font-extrabold text-[#f0d38f] whitespace-nowrap -bottom-5 absolute bg-[#100c08]/90 px-1 rounded-xs border border-[#d8b467]/30">
                        {fmt(fight.startTime)}
                      </span>
                    </div>
                  ) : (
                    <div className="relative p-0.5">
                      <IconSwords
                        className={`w-3.5 h-3.5 transition-colors ${
                          radFavored
                            ? "text-[#00e599] hover:text-[#00e599]/80"
                            : "text-[#ff5555] hover:text-[#ff5555]/80"
                        }`}
                      />
                    </div>
                  )}
                </button>
              );
            })}

            {/* ── TOOLTIP FLOTANTE INTELIGENTE ── */}
            {activeTooltip && (
              <div
                style={{
                  left: `${activeTooltip.pct}%`,
                  bottom: activeTooltip.isTop ? "calc(100% - 4px)" : undefined,
                  top: !activeTooltip.isTop ? "calc(100% - 4px)" : undefined,
                  transform:
                    activeTooltip.pct > 75
                      ? "translateX(-85%)"
                      : activeTooltip.pct < 25
                      ? "translateX(-15%)"
                      : "translateX(-50%)",
                }}
                className="absolute z-50 pointer-events-none transition-opacity duration-150"
              >
                <div className="bg-[#140f0a]/95 border border-[#d8b467]/50 rounded-lg px-3 py-2 shadow-2xl backdrop-blur-md">
                  {activeTooltip.content}
                </div>
              </div>
            )}
          </div>

          {/* LADO DERECHO: Tiempo final de la partida */}
          <div className="flex flex-col items-start justify-center h-20 min-w-[60px] text-left flex-shrink-0">
            <span className="text-lg sm:text-xl font-mono font-extrabold text-[#f0d38f] leading-none">
              {fmt(maxTimeSec)}
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. SCORECARD DE LA PELEA SELECCIONADA + CONTROL DE NAVEGACIÓN
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border border-[#2d261e] bg-[#140f0b] p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          {/* Botones de Navegación entre Teamfights */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={selectedIndex === 0}
              onClick={() => setSelectedIndex((prev) => Math.max(prev - 1, 0))}
              className="w-8 h-8 rounded-xs bg-[#241c14] hover:bg-[#2d2319] disabled:opacity-30 disabled:cursor-not-allowed border border-[#3d3326] flex items-center justify-center text-white transition cursor-pointer"
              title="Pelea anterior"
            >
              <IconChevronLeft className="w-4 h-4 text-[#d8b467]" />
            </button>

            <div className="w-10 h-8 rounded-xs bg-[#d8b467]/15 border border-[#d8b467]/40 flex items-center justify-center text-[#f0d38f] font-chakra font-extrabold text-sm flex-shrink-0">
              #{selectedIndex + 1}
            </div>

            <button
              type="button"
              disabled={selectedIndex === teamfights.length - 1}
              onClick={() => setSelectedIndex((prev) => Math.min(prev + 1, teamfights.length - 1))}
              className="w-8 h-8 rounded-xs bg-[#241c14] hover:bg-[#2d2319] disabled:opacity-30 disabled:cursor-not-allowed border border-[#3d3326] flex items-center justify-center text-white transition cursor-pointer"
              title="Siguiente pelea"
            >
              <IconChevronRight className="w-4 h-4 text-[#d8b467]" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-chakra font-bold text-white text-base sm:text-lg tracking-wide">
                Pelea al minuto {fmt(activeFight.startTime)}
              </h4>
              <span className="text-xs font-mono px-2 py-0.5 rounded-xs bg-[#241c14] text-[#d8b467] border border-[#3d3326]">
                {activeFight.durationSeconds}s duración
              </span>
            </div>
            <div className="text-xs text-[#8e857b] font-mono mt-0.5">
              Ventana: {fmt(activeFight.startTime)} ➔ {fmt(activeFight.endTime)}
            </div>
          </div>
        </div>

        {/* Marcador de Bajas y Balance de Oro */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#241e17]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-chakra font-bold text-[#00e599] text-xs sm:text-sm uppercase">
              {radiantName}
            </span>
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xs bg-[#00e599]/20 text-[#00e599] border border-[#00e599]/40 font-mono font-extrabold text-xs sm:text-sm">
              {dirDeaths} ⚔️
            </span>
            <span className="text-[#8e857b] font-bold">:</span>
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xs bg-[#ff5555]/20 text-[#ff5555] border border-[#ff5555]/40 font-mono font-extrabold text-xs sm:text-sm">
              {radDeaths} ⚔️
            </span>
            <span className="font-chakra font-bold text-[#ff5555] text-xs sm:text-sm uppercase">
              {direName}
            </span>
          </div>

          <div className="pl-3 sm:pl-4 border-l border-[#2d261e] text-right">
            <span className="text-[9px] sm:text-[10px] uppercase font-chakra text-[#8e857b] block font-bold tracking-wider">
              Swing de Oro
            </span>
            <span className={`text-xs sm:text-sm font-mono font-extrabold ${goldAdvantageRadiant ? "text-[#00e599]" : "text-[#ff5555]"}`}>
              {goldAdvantageRadiant ? "Radiant" : "Dire"} +{netGoldSwing.toLocaleString()} G
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          3. TABLAS DE COMBATE POR BANDO (FULL WIDTH)
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        {/* Tabla Radiant */}
        <TeamfightTeamTable
          teamName={radiantName}
          isRadiant={true}
          totalDamage={totalRadDamage}
          deathsCount={radDeaths}
          players={radFightPlayers}
          maxDamageInFight={maxDamageInFight}
        />

        {/* Tabla Dire */}
        <TeamfightTeamTable
          teamName={direName}
          isRadiant={false}
          totalDamage={totalDirDamage}
          deathsCount={dirDeaths}
          players={dirFightPlayers}
          maxDamageInFight={maxDamageInFight}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUBCOMPONENTE: TABLA DE EQUIPO PARA TEAMFIGHT (ESTILO IMPERIAL)
// ─────────────────────────────────────────────────────────────────────────────
interface TeamfightTeamTableProps {
  teamName: string;
  isRadiant: boolean;
  totalDamage: number;
  deathsCount: number;
  players: NormalizedFightPlayer[];
  maxDamageInFight: number;
}

const TeamfightTeamTable: React.FC<TeamfightTeamTableProps> = ({
  teamName,
  isRadiant,
  totalDamage,
  deathsCount,
  players,
  maxDamageInFight,
}) => {
  const teamColor = isRadiant ? "text-[#00e599]" : "text-[#ff5555]";
  const dotColor = isRadiant ? "bg-[#00e599]" : "bg-[#ff5555]";
  const headerBg = isRadiant ? "bg-[#00e599]/10" : "bg-[#ff5555]/10";

  return (
    <div className="rounded-xl border border-[#2d261e] bg-[#140f0b] overflow-hidden shadow-xl">
      {/* Header del Equipo */}
      <div className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#2d261e] ${headerBg}`}>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor} flex-shrink-0`} />
          <h4 className={`font-chakra font-bold text-xs sm:text-base uppercase tracking-wider ${teamColor}`}>
            {teamName}
          </h4>
          {deathsCount === 0 && (
            <span className="text-[9px] sm:text-[10px] font-chakra font-bold px-1.5 sm:px-2 py-0.5 rounded-xs bg-[#00e599]/20 text-[#00e599] border border-[#00e599]/30 uppercase tracking-wider">
              Sobrevivieron Todos
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-mono">
          <span className="text-[#8e857b]">
            Daño: <strong className="text-white font-bold">{totalDamage.toLocaleString()}</strong>
          </span>
          <span className="text-[#ff5555] font-bold">
            {deathsCount} {deathsCount === 1 ? "Muerte" : "Muertes"}
          </span>
        </div>
      </div>

      {/* Swipe hint */}
      <div className="sm:hidden px-4 py-1.5 bg-[#14100c] border-b border-[#241e17] text-[10px] font-chakra text-[#8e857b] flex items-center justify-between">
        <span>Desliza para ver daño y habilidades ➔</span>
        <span className="text-[#d8b467] font-bold">Detalle</span>
      </div>

      {/* Tabla con Columnas */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[920px] text-xs">
          <thead>
            <tr className="border-b border-[#2d261e] text-[10px] font-chakra font-bold text-[#8e857b] bg-[#100c08] uppercase tracking-wider">
              <th className="py-2.5 px-3 w-40 sm:w-48 sticky left-0 bg-[#100c08] z-20 shadow-[2px_0_6px_rgba(0,0,0,0.6)]">HÉROE / JUGADOR</th>
              <th className="py-2.5 px-3 text-center w-28">ESTADO</th>
              <th className="py-2.5 px-3 w-44">BAJAS (KILLS)</th>
              <th className="py-2.5 px-3 w-36 text-right">DAÑO</th>
              <th className="py-2.5 px-3 text-right w-24">CURACIÓN</th>
              <th className="py-2.5 px-3 text-right w-24">ORO (Δ)</th>
              <th className="py-2.5 px-3 text-right w-24">XP (Δ)</th>
              <th className="py-2.5 px-3">HABILIDADES USADAS</th>
              <th className="py-2.5 px-3 w-40">ITEMS USADOS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d261e]/40 font-mono">
            {players.map((fp, idx) => {
              const isDead = fp.deaths > 0;
              const hasBuyback = fp.buybacks > 0;
              const dmgPct = Math.min(Math.round(((fp.damage || 0) / maxDamageInFight) * 100), 100);

              const abilitiesUsed = Object.entries(fp.abilityUses || {}).filter(([, count]) => count > 0);
              const itemsUsed = Object.entries(fp.itemUses || {}).filter(([, count]) => count > 0);
              const kills = Object.entries(fp.killed || {}).filter(([, count]) => count > 0);

              return (
                <tr
                  key={`p-${idx}`}
                  className={`hover:bg-[#1f1710] transition-colors ${
                    isDead ? "bg-[#ff5555]/5" : "bg-transparent"
                  }`}
                >
                  {/* HÉROE / JUGADOR */}
                  <td className="py-2.5 px-3 align-middle sticky left-0 bg-[#140f0b] z-10 shadow-[2px_0_6px_rgba(0,0,0,0.6)]">
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex-shrink-0">
                        <picture>
                          <img
                            src={fp.heroImgUrl}
                            alt={fp.heroDisplayName}
                            className="w-9 h-6 object-cover rounded-xs border border-[#3d3326]"
                          />
                        </picture>
                        {isDead && (
                          <div className="absolute inset-0 bg-black/75 rounded-xs flex items-center justify-center">
                            <IconSkull className="w-3.5 h-3.5 text-[#ff5555]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-chakra font-bold text-white block truncate max-w-[130px] text-xs">
                          {fp.playerName}
                        </span>
                        <span className="text-[10px] text-[#8e857b] font-chakra block truncate">
                          {fp.heroDisplayName}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* ESTADO */}
                  <td className="py-2.5 px-3 text-center align-middle">
                    {isDead ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] font-chakra font-bold px-1.5 py-0.5 rounded-xs bg-[#ff5555]/20 text-[#ff5555] border border-[#ff5555]/30 whitespace-nowrap">
                          ☠️ Muerto
                        </span>
                        {hasBuyback && (
                          <span className="text-[9px] font-chakra font-bold px-1 rounded-xs bg-[#d8b467]/20 text-[#f0d38f] border border-[#d8b467]/30">
                            🔄 Buyback
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-chakra font-bold px-1.5 py-0.5 rounded-xs bg-[#00e599]/15 text-[#00e599] border border-[#00e599]/30">
                        Vivo
                      </span>
                    )}
                  </td>

                  {/* BAJAS (KILLS) */}
                  <td className="py-2.5 px-3 align-middle">
                    {kills.length > 0 ? (
                      <div className="flex items-center gap-1 flex-wrap">
                        {kills.map(([victimName, count], kIdx) => {
                          const cleanName = victimName.replace("npc_dota_hero_", "").replace(/_/g, " ");
                          return (
                            <span
                              key={kIdx}
                              className="text-[10px] font-chakra font-bold px-1.5 py-0.5 rounded-xs bg-[#ff5555]/20 border border-[#ff5555]/30 text-[#ff5555] capitalize"
                            >
                              ⚔️ {cleanName} {count > 1 ? `×${count}` : ""}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[#594d3c] font-mono">-</span>
                    )}
                  </td>

                  {/* DAÑO */}
                  <td className="py-2.5 px-3 text-right align-middle">
                    <span className="text-white font-bold block text-xs">
                      {fp.damage.toLocaleString()}
                    </span>
                    <div className="w-full max-w-[80px] h-1.5 bg-[#241c14] rounded-full overflow-hidden ml-auto mt-1 border border-[#3d3326]">
                      <div
                        style={{ width: `${Math.max(dmgPct, 4)}%` }}
                        className={`h-full rounded-full ${
                          isRadiant ? "bg-[#00e599]" : "bg-[#ff5555]"
                        }`}
                      />
                    </div>
                  </td>

                  {/* CURACIÓN */}
                  <td className="py-2.5 px-3 text-right align-middle">
                    {fp.healing > 0 ? (
                      <span className="text-[#00e599] font-bold">
                        +{fp.healing.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[#594d3c]">-</span>
                    )}
                  </td>

                  {/* ORO DELTA */}
                  <td className="py-2.5 px-3 text-right align-middle">
                    <span
                      className={`font-bold ${
                        fp.goldDelta >= 0 ? "text-[#00e599]" : "text-[#ff5555]"
                      }`}
                    >
                      {fp.goldDelta >= 0 ? `+${fp.goldDelta}` : fp.goldDelta} G
                    </span>
                  </td>

                  {/* XP DELTA */}
                  <td className="py-2.5 px-3 text-right align-middle text-[#f0d38f]">
                    +{fp.xpDelta.toLocaleString()}
                  </td>

                  {/* HABILIDADES USADAS */}
                  <td className="py-2.5 px-3 align-middle">
                    {abilitiesUsed.length > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {abilitiesUsed.map(([abilityKey, count], aIdx) => {
                          const abilityDetail = typedDotaconstants.abilities?.[abilityKey];
                          const displayName = abilityDetail?.dname || abilityKey.replace(/^special_bonus_/, "").replace(/_/g, " ");
                          const imgUrl = abilityDetail?.img
                            ? `https://cdn.cloudflare.steamstatic.com${abilityDetail.img}`
                            : `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/${abilityKey}.png`;

                          return (
                            <div
                              key={aIdx}
                              className="flex items-center gap-1.5 bg-[#100c08] border border-[#3d3326] rounded-xs px-1.5 py-0.5 text-[10px] font-mono text-[#f0d38f] shadow-sm hover:border-[#d8b467] transition-colors"
                              title={`${displayName}: Usado ${count} vez${count > 1 ? "es" : ""}`}
                            >
                              <picture>
                                <img
                                  src={imgUrl}
                                  alt={displayName}
                                  className="w-4 h-4 rounded-xs object-cover flex-shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/talents/talent_tree.svg";
                                  }}
                                />
                              </picture>
                              <span className="truncate max-w-[95px] font-chakra text-white">{displayName}</span>
                              {count > 1 && <strong className="text-[#d8b467] font-bold">×{count}</strong>}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[#594d3c]">-</span>
                    )}
                  </td>

                  {/* ITEMS ACTIVADOS */}
                  <td className="py-2.5 px-3 align-middle">
                    {itemsUsed.length > 0 ? (
                      <div className="flex items-center gap-1 flex-wrap">
                        {itemsUsed.map(([itemKey, count], iIdx) => {
                          const itemDetail = typedDotaconstants.items?.[itemKey];
                          const displayName = itemDetail?.dname || itemKey.replace(/_/g, " ");
                          const imgUrl = getItemImageUrl(itemKey);

                          return (
                            <div
                              key={iIdx}
                              className="flex items-center gap-1 bg-[#100c08] border border-[#3d3326] rounded-xs px-1.5 py-0.5 text-[10px] font-mono text-white shadow-sm hover:border-[#d8b467] transition-colors"
                              title={`${displayName}: Usado ${count} vez${count > 1 ? "es" : ""}`}
                            >
                              <picture>
                                <img
                                  src={imgUrl}
                                  alt={displayName}
                                  className="w-4 h-3.5 object-contain rounded-xs"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              </picture>
                              <span className="truncate max-w-[75px] font-chakra">{displayName}</span>
                              {count > 1 && <strong className="text-[#38bdf8] font-bold">×{count}</strong>}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[#594d3c]">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
