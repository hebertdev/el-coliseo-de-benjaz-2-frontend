"use client";

import React from "react";
import Link from "next/link";
import {
  IconClock,
  IconCrown,
  IconShield,
  IconFlame,
  IconUser,
  IconInfoCircle,
  IconBroadcast,
  IconExternalLink,
  IconBrandKick,
} from "@tabler/icons-react";
import { GameDetailData, GameHeroData, GameRosterPlayer } from "interfaces/games";
import { CountryFlag } from "components/ui/CountryFlag";

interface GameScheduledBoardProps {
  game: GameDetailData;
}

interface PositionMeta {
  pos: number;
  label: string;
  roleName: string;
  lane: string;
}

const POSITIONS: PositionMeta[] = [
  { pos: 1, label: "POS 1", roleName: "Carry", lane: "Safe Lane" },
  { pos: 2, label: "POS 2", roleName: "Mid Lane", lane: "Mid Lane" },
  { pos: 3, label: "POS 3", roleName: "Offlane", lane: "Off Lane" },
  { pos: 4, label: "POS 4", roleName: "Soft Support", lane: "Roaming / Support" },
  { pos: 5, label: "POS 5", roleName: "Hard Support", lane: "Support" },
];

function getCaptainTag(roster?: GameRosterPlayer[] | null, teamTag?: string | null): string | null {
  const captain = roster?.find(
    (p) => p.role?.toUpperCase() === "CAPTAIN" || (p as { is_captain?: boolean }).is_captain === true
  );
  if (captain?.nickname) {
    const nick = captain.nickname.trim();
    return nick.toLowerCase().startsWith("team ") ? nick : `Team ${nick}`;
  }
  if (teamTag && teamTag.length >= 2 && teamTag.length <= 25) {
    const cleanTag = teamTag.replace(/^T-/i, "").replace(/^TEAM\s+/i, "").trim();
    if (cleanTag) return `Team ${cleanTag}`;
  }
  return null;
}

export function GameScheduledBoard({ game }: GameScheduledBoardProps) {
  const isOngoing = game.status === "ONGOING";

  const radiantRoster = game.radiant_players || game.radiant_team?.players || [];
  const direRoster = game.dire_players || game.dire_team?.players || [];

  const radiantName = game.radiant_team?.name || "Radiant";
  const direName = game.dire_team?.name || "Dire";

  const radiantCaptain = getCaptainTag(radiantRoster, game.radiant_team?.tag);
  const direCaptain = getCaptainTag(direRoster, game.dire_team?.tag);

  // Mapear por posición competitiva (1 a 5)
  const getPlayerForPos = (roster: GameRosterPlayer[], posNum: number): GameRosterPlayer | undefined => {
    return roster.find((p) => Number(p.competitive_position) === posNum) || roster[posNum - 1];
  };

  const getPaddedHeroes = (
    heroes?: GameHeroData[],
    picks?: unknown[]
  ): GameHeroData[] => {
    let list: GameHeroData[] = [];
    if (heroes && heroes.some((h) => h?.has_hero)) {
      list = [...heroes];
    } else if (picks && picks.length > 0) {
      list = picks.map((p) => {
        if (typeof p === "object" && p !== null && "has_hero" in p) {
          const heroObj = p as Partial<GameHeroData>;
          return {
            has_hero: Boolean(heroObj.has_hero),
            hero_id: heroObj.hero_id ?? null,
            hero_name: heroObj.hero_name ?? null,
            image_url: heroObj.image_url ?? null,
          };
        }
        const id = Number(p);
        return {
          has_hero: id > 0,
          hero_id: id > 0 ? id : null,
          hero_name: null,
          image_url: null,
        };
      });
    }
    while (list.length < 5) {
      list.push({ has_hero: false, hero_id: null, hero_name: null, image_url: null });
    }
    return list.slice(0, 5);
  };

  const radiantDraftPicks = getPaddedHeroes(game.radiant_heroes, game.radiant_picks);
  const direDraftPicks = getPaddedHeroes(game.dire_heroes, game.dire_picks);

  const hasDraftHeroes = Boolean(
    game.radiant_heroes?.some((h) => h.has_hero) ||
    game.dire_heroes?.some((h) => h.has_hero) ||
    game.radiant_picks?.length ||
    game.dire_picks?.length
  );

  return (
    <div className="w-full space-y-8">
      {/* ======================================================== */}
      {/* 1. CARTEL IMPERIAL: ESTADO DE LA PARTIDA                 */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden border border-[#d8b467]/30 bg-gradient-to-b from-[#18130e] via-[#14100c] to-[#0f0c09] p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
        {/* Esquinas imperiales de piedra */}
        <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#d8b467]/70 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#d8b467]/70 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#d8b467]/70 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#d8b467]/70 bg-[#d8b467]" />

        {/* Resplandor ambiental de fondo */}
        <div className={`pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 ${
          isOngoing
            ? "bg-[radial-gradient(ellipse_at_center,rgba(83,252,24,0.12)_0%,transparent_70%)]"
            : "bg-[radial-gradient(ellipse_at_center,rgba(216,180,103,0.12)_0%,transparent_70%)]"
        }`} />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-4">
          {/* Badge de Estado */}
          {isOngoing ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#53fc18]/60 bg-[#0c1a0c]/90 text-[#53fc18] text-[11px] sm:text-xs font-chakra font-black tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(83,252,24,0.25)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#53fc18] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#53fc18]" />
              </span>
              <span>EN VIVO · PARTIDA EN CURSO</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#d8b467]/40 bg-[#241c13]/90 text-[#f0d38f] text-[11px] sm:text-xs font-chakra font-black tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(216,180,103,0.15)]">
              <IconClock size={14} className="text-[#d8b467] animate-pulse" />
              <span>PARTIDA PROGRAMADA · NO INICIADA</span>
            </div>
          )}

          {/* Título */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-chakra font-black uppercase tracking-wide text-white drop-shadow-sm">
            {isOngoing
              ? "Partida en Vivo · Fase de Selección y Combate"
              : "Estadísticas y Resumen no Disponibles"}
          </h2>

          {/* Explicación */}
          <p className="text-xs sm:text-sm text-[#a89f91] leading-relaxed font-inter max-w-2xl">
            {isOngoing
              ? "El enfrentamiento se está disputando en estos momentos. A continuación puedes seguir la transmisión oficial en directo y consultar las alineaciones de gladiadores."
              : "Este enfrentamiento aún no se ha disputado o se encuentra a la espera de sincronización con Dota 2. Sigue la transmisión oficial a continuación."}
          </p>

          {/* Cuadro Stream Kick.com/benjaz */}
          <div className="w-full pt-3">
            <div className="w-full overflow-hidden border border-[#53fc18]/40 bg-[#070e06] shadow-[0_0_35px_rgba(83,252,24,0.15)]">
              {/* Barra superior de la transmisión */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-[#1b3518] bg-[#0c1a0c]">
                <div className="flex items-center gap-2">
                  <IconBroadcast size={15} className="text-[#53fc18] animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] font-chakra font-bold uppercase tracking-wider text-[#53fc18]">
                    COBERTURA OFICIAL EN DIRECTO · KICK.COM/BENJAZ
                  </span>
                </div>
                <a
                  href="https://kick.com/benjaz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-[#53fc18]/40 bg-[#132810] text-[10px] sm:text-[11px] font-chakra font-semibold text-[#53fc18] hover:bg-[#53fc18]/20 hover:text-white transition-colors"
                >
                  <IconBrandKick size={13} />
                  <span>Ver en Kick</span>
                  <IconExternalLink size={11} />
                </a>
              </div>

              {/* Reproductor iframe (16:9) */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src="https://player.kick.com/benjaz"
                  title="Transmisión Oficial Kick - Benjaz"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. ALINEACIONES CONFIRMADAS & DRAFT DE HÉROES           */}
      {/* ======================================================== */}
      <div className="relative border border-[#2d261e] bg-[#14100c]/90 backdrop-blur-xs p-4 sm:p-6 lg:p-8">
        {/* Esquinas imperiales */}
        <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />

        {/* Encabezado de Sección */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#2d261e] pb-5">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-[#d8b467]" />
            <div>
              <span className="text-[10px] font-chakra font-bold tracking-[0.25em] text-[#d8b467] uppercase block">
                {isOngoing ? "SELECCIONES DE HÉROES & ALINEACIONES" : "ROSTER OFICIAL DE COMBATE"}
              </span>
              <h3 className="text-base sm:text-lg md:text-xl font-chakra font-black tracking-wide uppercase text-white">
                Emparejamiento de Gladiadores
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-chakra text-[#8e857b] bg-[#1a140f] px-3 py-1.5 border border-[#2d261e]">
            <IconInfoCircle size={15} className="text-[#d8b467]" />
            <span>{isOngoing ? "Héroes elegidos durante el Draft en tiempo real" : "Alineaciones oficiales confirmadas para este juego"}</span>
          </div>
        </div>

        {/* Barra de Equipos Head-to-Head */}
        <div className="mb-6 pb-5 border-b border-[#241c14]">
          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            {/* Lado Radiant */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {game.radiant_team?.logo_url ? (
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 flex items-center justify-center border border-[#00e599]/40 bg-[#07160e]">
                  <picture>
                    <img
                      src={game.radiant_team.logo_url}
                      alt={radiantName}
                      className="h-9 w-9 sm:h-11 sm:w-11 object-contain"
                    />
                  </picture>
                </div>
              ) : (
                <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 flex items-center justify-center border border-[#00e599]/30 bg-[#07160e]">
                  <IconShield size={24} className="text-[#00e599]" />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-chakra font-bold tracking-widest text-[#00e599] uppercase block">
                  THE RADIANT
                </span>
                <h4 className="text-sm sm:text-base md:text-lg font-chakra font-black text-white uppercase truncate">
                  {game.radiant_team?.slug ? (
                    <Link href={`/teams/${game.radiant_team.slug}`} className="hover:text-[#00e599] transition-colors">
                      {radiantName}
                    </Link>
                  ) : (
                    radiantName
                  )}
                </h4>
                {radiantCaptain && (
                  <span className="text-[10px] sm:text-xs font-chakra text-[#d8b467] font-semibold">
                    [{radiantCaptain}]
                  </span>
                )}
              </div>
            </div>

            {/* Lado Dire */}
            <div className="flex items-center justify-end gap-3 sm:gap-4 min-w-0 text-right">
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-chakra font-bold tracking-widest text-[#ff6b6b] uppercase block">
                  THE DIRE
                </span>
                <h4 className="text-sm sm:text-base md:text-lg font-chakra font-black text-white uppercase truncate">
                  {game.dire_team?.slug ? (
                    <Link href={`/teams/${game.dire_team.slug}`} className="hover:text-[#ff6b6b] transition-colors">
                      {direName}
                    </Link>
                  ) : (
                    direName
                  )}
                </h4>
                {direCaptain && (
                  <span className="text-[10px] sm:text-xs font-chakra text-[#d8b467] font-semibold">
                    [{direCaptain}]
                  </span>
                )}
              </div>
              {game.dire_team?.logo_url ? (
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 flex items-center justify-center border border-[#ff4d4d]/40 bg-[#1e0a0a]">
                  <picture>
                    <img
                      src={game.dire_team.logo_url}
                      alt={direName}
                      className="h-9 w-9 sm:h-11 sm:w-11 object-contain"
                    />
                  </picture>
                </div>
              ) : (
                <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 flex items-center justify-center border border-[#ff4d4d]/30 bg-[#1e0a0a]">
                  <IconFlame size={24} className="text-[#ff6b6b]" />
                </div>
              )}
            </div>
          </div>

          {/* Fila de Héroes Seleccionados en el Draft (5 slots) */}
          {hasDraftHeroes && (
            <div className="mt-4 pt-3.5 border-t border-[#241c14]">
              {/* Encabezado del progreso de Draft */}
              <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#241c14]/70">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#53fc18] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#53fc18]" />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-chakra font-black tracking-widest text-[#53fc18] uppercase">
                    {((game.radiant_picks?.length || 0) + (game.dire_picks?.length || 0)) >= 10
                      ? "DRAFT COMPLETO (10/10 HÉROES SELECCIONADOS)"
                      : `FASE DE DRAFT EN VIVO · ${(game.radiant_picks?.length || 0) + (game.dire_picks?.length || 0)}/10 HÉROES`}
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono text-[#8e857b]">
                  Radiant: {game.radiant_picks?.length || 0}/5 &bull; Dire: {game.dire_picks?.length || 0}/5
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-8">
                {/* Picks Radiant */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-chakra font-bold tracking-widest text-[#00e599] uppercase">
                      HÉROES RADIANT
                    </span>
                    <span className="text-[9px] font-mono text-[#00e599]/80 font-bold">
                      {game.radiant_picks?.length || 0}/5
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                    {radiantDraftPicks.map((h, i) => (
                      <div
                        key={i}
                        title={h.hero_name || `Pick #${i + 1} Radiant (Por elegir)`}
                        className={`group relative aspect-[4/3] overflow-hidden border ${
                          h.has_hero && h.image_url
                            ? "border-[#00e599]/70 bg-[#07160e] shadow-[0_0_10px_rgba(0,229,153,0.2)]"
                            : "border-[#241e17] bg-[#0c0a08]/80 flex items-center justify-center"
                        } shadow-xs`}
                      >
                        {h.has_hero && h.image_url ? (
                          <picture>
                            <img
                              src={h.image_url}
                              alt={h.hero_name || "Hero"}
                              className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            />
                          </picture>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-[8px] font-mono text-[#554737] font-bold">#{i + 1}</span>
                            <span className="w-1 h-1 rounded-full bg-[#42372a] mt-0.5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Picks Dire */}
                <div className="text-right">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono text-[#ff6b6b]/80 font-bold">
                      {game.dire_picks?.length || 0}/5
                    </span>
                    <span className="text-[9px] font-chakra font-bold tracking-widest text-[#ff6b6b] uppercase">
                      HÉROES DIRE
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                    {direDraftPicks.map((h, i) => (
                      <div
                        key={i}
                        title={h.hero_name || `Pick #${i + 1} Dire (Por elegir)`}
                        className={`group relative aspect-[4/3] overflow-hidden border ${
                          h.has_hero && h.image_url
                            ? "border-[#ff4d4d]/70 bg-[#160808] shadow-[0_0_10px_rgba(255,77,77,0.2)]"
                            : "border-[#241e17] bg-[#0c0a08]/80 flex items-center justify-center"
                        } shadow-xs`}
                      >
                        {h.has_hero && h.image_url ? (
                          <picture>
                            <img
                              src={h.image_url}
                              alt={h.hero_name || "Hero"}
                              className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            />
                          </picture>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-[8px] font-mono text-[#554737] font-bold">#{i + 1}</span>
                            <span className="w-1 h-1 rounded-full bg-[#42372a] mt-0.5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Duelos 1v1 por Posición (1 a 5) */}
        <div className="space-y-3 sm:space-y-4">
          {POSITIONS.map((posMeta) => {
            const radPlayer = getPlayerForPos(radiantRoster, posMeta.pos);
            const direPlayer = getPlayerForPos(direRoster, posMeta.pos);

            const isRadCaptain =
              radPlayer?.role?.toUpperCase() === "CAPTAIN" ||
              radPlayer?.role_display?.toLowerCase() === "captain" ||
              (radPlayer as { is_captain?: boolean })?.is_captain === true;

            const isDireCaptain =
              direPlayer?.role?.toUpperCase() === "CAPTAIN" ||
              direPlayer?.role_display?.toLowerCase() === "captain" ||
              (direPlayer as { is_captain?: boolean })?.is_captain === true;

            return (
              <div
                key={posMeta.pos}
                className="relative border border-[#261f18] bg-[#17120d]/80 hover:border-[#d8b467]/40 hover:bg-[#1b1510] transition-all p-3 sm:p-4"
              >
                {/* Vista Escritorio / Tablet (MD y Superior): Radiant vs Dire en 3 columnas */}
                <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] items-center gap-4">
                  {/* Jugador Radiant */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Avatar Jugador */}
                    <div className="relative h-12 w-12 shrink-0 border border-[#00e599]/40 bg-[#09110c] overflow-hidden flex items-center justify-center">
                      {radPlayer?.avatar ? (
                        <picture>
                          <img
                            src={radPlayer.avatar}
                            alt={radPlayer.nickname}
                            className="h-full w-full object-cover"
                          />
                        </picture>
                      ) : (
                        <IconUser size={22} className="text-[#00e599]/60" />
                      )}
                      {isRadCaptain && (
                        <span className="absolute bottom-0 right-0 bg-[#07160e] border-t border-l border-[#d8b467] p-0.5">
                          <IconCrown size={11} className="text-[#d8b467]" />
                        </span>
                      )}
                    </div>

                    {/* Datos Jugador */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {radPlayer?.slug ? (
                          <Link
                            href={`/players/${radPlayer.slug}`}
                            className="text-sm font-chakra font-black text-white hover:text-[#00e599] transition-colors truncate"
                          >
                            {radPlayer.nickname}
                          </Link>
                        ) : (
                          <span className="text-sm font-chakra font-black text-white truncate">
                            {radPlayer?.nickname || `Gladiador ${posMeta.pos}`}
                          </span>
                        )}
                        {radPlayer?.country && (
                          <CountryFlag countryCode={radPlayer.country} size="xs" showCode />
                        )}
                        {isRadCaptain && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 border border-[#d8b467]/50 bg-[#241c13] text-[#f0d38f] text-[9px] font-chakra font-bold uppercase tracking-wider">
                            <IconCrown size={10} className="text-[#d8b467]" />
                            <span>CAPITÁN</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#8e857b] truncate">
                        {radPlayer?.position_display || posMeta.roleName}
                      </div>
                    </div>
                  </div>

                  {/* Centro: Insignia de Posición y VS */}
                  <div className="flex flex-col items-center justify-center px-4 py-1.5 border border-[#382d20] bg-[#140f0a] min-w-[150px] shrink-0 text-center">
                    <span className="text-[11px] font-chakra font-black uppercase tracking-[0.18em] text-[#d8b467]">
                      {posMeta.label} · {posMeta.roleName.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-chakra font-bold tracking-widest text-[#7a6f62] uppercase">
                      {posMeta.lane}
                    </span>
                  </div>

                  {/* Jugador Dire */}
                  <div className="flex items-center justify-end gap-3.5 min-w-0 text-right">
                    {/* Datos Jugador */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-end gap-2">
                        {isDireCaptain && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 border border-[#d8b467]/50 bg-[#241c13] text-[#f0d38f] text-[9px] font-chakra font-bold uppercase tracking-wider">
                            <IconCrown size={10} className="text-[#d8b467]" />
                            <span>CAPITÁN</span>
                          </span>
                        )}
                        {direPlayer?.country && (
                          <CountryFlag countryCode={direPlayer.country} size="xs" showCode />
                        )}
                        {direPlayer?.slug ? (
                          <Link
                            href={`/players/${direPlayer.slug}`}
                            className="text-sm font-chakra font-black text-white hover:text-[#ff6b6b] transition-colors truncate"
                          >
                            {direPlayer.nickname}
                          </Link>
                        ) : (
                          <span className="text-sm font-chakra font-black text-white truncate">
                            {direPlayer?.nickname || `Gladiador ${posMeta.pos}`}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#8e857b] truncate">
                        {direPlayer?.position_display || posMeta.roleName}
                      </div>
                    </div>

                    {/* Avatar Jugador */}
                    <div className="relative h-12 w-12 shrink-0 border border-[#ff4d4d]/40 bg-[#160a0a] overflow-hidden flex items-center justify-center">
                      {direPlayer?.avatar ? (
                        <picture>
                          <img
                            src={direPlayer.avatar}
                            alt={direPlayer.nickname}
                            className="h-full w-full object-cover"
                          />
                        </picture>
                      ) : (
                        <IconUser size={22} className="text-[#ff6b6b]/60" />
                      )}
                      {isDireCaptain && (
                        <span className="absolute bottom-0 left-0 bg-[#1e0a0a] border-t border-r border-[#d8b467] p-0.5">
                          <IconCrown size={11} className="text-[#d8b467]" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vista Móvil (debajo de MD) */}
                <div className="md:hidden space-y-2.5">
                  {/* Etiqueta de Posición */}
                  <div className="flex items-center justify-between border-b border-[#241c14] pb-1.5">
                    <span className="text-[10px] font-chakra font-black uppercase tracking-wider text-[#d8b467]">
                      {posMeta.label} · {posMeta.roleName.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-mono text-[#7a6f62]">
                      {posMeta.lane}
                    </span>
                  </div>

                  {/* Gladiador Radiant */}
                  <div className="flex items-center justify-between gap-2.5 min-w-0 bg-[#09110c]/60 p-2 border border-[#00e599]/20">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="relative h-10 w-10 shrink-0 border border-[#00e599]/40 bg-[#09110c] flex items-center justify-center overflow-hidden">
                        {radPlayer?.avatar ? (
                          <picture>
                            <img
                              src={radPlayer.avatar}
                              alt={radPlayer.nickname}
                              className="h-full w-full object-cover"
                            />
                          </picture>
                        ) : (
                          <IconUser size={18} className="text-[#00e599]/60" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-chakra font-bold text-[#00e599] uppercase">RAD</span>
                          <span className="text-xs font-chakra font-black text-white truncate">
                            {radPlayer?.nickname || `Gladiador ${posMeta.pos}`}
                          </span>
                          {isRadCaptain && <IconCrown size={11} className="text-[#d8b467]" />}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#8e857b]">
                          {radPlayer?.country && (
                            <CountryFlag countryCode={radPlayer.country} size="xs" showCode />
                          )}
                          <span className="truncate">{radPlayer?.position_display || posMeta.roleName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gladiador Dire */}
                  <div className="flex items-center justify-between gap-2.5 min-w-0 bg-[#160a0a]/60 p-2 border border-[#ff4d4d]/20">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="relative h-10 w-10 shrink-0 border border-[#ff4d4d]/40 bg-[#160a0a] flex items-center justify-center overflow-hidden">
                        {direPlayer?.avatar ? (
                          <picture>
                            <img
                              src={direPlayer.avatar}
                              alt={direPlayer.nickname}
                              className="h-full w-full object-cover"
                            />
                          </picture>
                        ) : (
                          <IconUser size={18} className="text-[#ff6b6b]/60" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-chakra font-bold text-[#ff6b6b] uppercase">DIRE</span>
                          <span className="text-xs font-chakra font-black text-white truncate">
                            {direPlayer?.nickname || `Gladiador ${posMeta.pos}`}
                          </span>
                          {isDireCaptain && <IconCrown size={11} className="text-[#d8b467]" />}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#8e857b]">
                          {direPlayer?.country && (
                            <CountryFlag countryCode={direPlayer.country} size="xs" showCode />
                          )}
                          <span className="truncate">{direPlayer?.position_display || posMeta.roleName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
