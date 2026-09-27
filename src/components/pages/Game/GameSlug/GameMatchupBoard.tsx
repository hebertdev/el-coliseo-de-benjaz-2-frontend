"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconLayoutGrid,
  IconList,
  IconSwords,
  IconFlame,
  IconShield,
  IconSparkles,
  IconPlant,
  IconCrown,
  IconMedal,
  IconCoin,
} from "@tabler/icons-react";
import { GameDetailData, OpenDotaPlayer, GameRosterPlayer } from "interfaces/games";
import {
  getHeroDisplayName,
  getHeroHorizontalImageUrl,
  getItemImageUrl,
  getItemDisplayName,
  getPlayerNeutralItem,
  getPlayerBearItems,
  getRankMedalUrl,
  matchRosterPlayer,
  getPlayerNickname,
  formatSpanishCompact,
  getGameMvpPlayer,
} from "helpers/dota";

interface GameMatchupBoardProps {
  game: GameDetailData;
}

interface ProcessedPlayer {
  raw: OpenDotaPlayer;
  roster?: GameRosterPlayer;
  nickname: string;
  playerSlug?: string;
  heroId: number;
  heroDisplayName: string;
  heroImgUrl: string;
  position: number;
  isRadiant: boolean;
  isMvp: boolean;
  award?: string;
  imp: number;
  level: number;
  kills: number;
  deaths: number;
  assists: number;
  netWorth: number;
  lastHits: number;
  denies: number;
  gpm: number;
  xpm: number;
  heroDamage: number;
  towerDamage: number;
  heroHealing: number;
  itemIds: (number | undefined)[];
  bearItemIds?: (number | undefined)[] | null;
  neutralItemKey?: string | number;
  rankTier?: number;
  leaderboardRank?: number | null;
}

// Icono según la posición competitiva oficial (1 a 5)
function getPositionIcon(position: number) {
  switch (position) {
    case 1:
      return <IconSwords size={14} className="text-[#4dabf7]" />;
    case 2:
      return <IconFlame size={14} className="text-[#20c997]" />;
    case 3:
      return <IconShield size={14} className="text-[#fcc419]" />;
    case 4:
      return <IconSparkles size={14} className="text-[#ff6b6b]" />;
    case 5:
    default:
      return <IconPlant size={14} className="text-[#51cf66]" />;
  }
}

// Barra de RPI / IMP táctica imperial
function ImpBar({ imp, isMvp, award }: { imp: number; isMvp?: boolean; award?: string }) {
  const isPositive = imp >= 0;
  const absImp = Math.abs(imp);
  const barWidth = Math.min(100, Math.max(12, absImp * 6));

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 border border-[#2d261e] bg-[#0c0a08] text-[11px] font-mono font-bold w-fit">
      <span className={isPositive ? "text-white" : "text-[#ff6b6b]"}>
        {isPositive ? `+${imp}` : `${imp}`}
      </span>
      <div className="w-9 h-1 bg-[#1c1712] overflow-hidden">
        <div
          className={`h-full transition-all ${
            isPositive ? "bg-[#d8b467]" : "bg-[#ff4d4d]"
          }`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      {isMvp && <IconCrown size={12} className="text-[#d8b467] shrink-0 fill-[#d8b467]/30" />}
      {!isMvp && award && <IconMedal size={12} className="text-[#9c88ff] shrink-0" />}
    </div>
  );
}

export function GameMatchupBoard({ game }: GameMatchupBoardProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const opendotaPlayers = game.opendota_data?.players || [];
  const mvpPlayer = getGameMvpPlayer(game);

  // Procesar jugadores de ambos bandos
  const processList = (isRadiantTarget: boolean): ProcessedPlayer[] => {
    const list = opendotaPlayers.filter((p) =>
      p.isRadiant !== undefined
        ? p.isRadiant === isRadiantTarget
        : isRadiantTarget
        ? p.player_slot < 128
        : p.player_slot >= 128
    );

    return list.map((p, idx) => {
      const roster = matchRosterPlayer(p, game);
      const nickname = getPlayerNickname(p, game);
      const playerSlug = roster?.slug || roster?.nickname || (nickname && nickname !== "Jugador" ? nickname : undefined);
      const heroId = p.hero_id;
      const heroDisplayName = getHeroDisplayName(heroId);
      const heroImgUrl = getHeroHorizontalImageUrl(heroId);
      const position = roster?.competitive_position || p.lane_role || p.position_est || idx + 1;
      const isMvp = mvpPlayer
        ? p.player_slot === mvpPlayer.player_slot
        : (p.award === "MVP" || p.stratz_metadata?.award === "MVP");
      const award = isMvp ? "MVP" : (p.award || p.stratz_metadata?.award);
      const imp = p.imp || p.stratz_metadata?.imp || 0;

      const itemIds = [p.item_0, p.item_1, p.item_2, p.item_3, p.item_4, p.item_5];
      const bearItemIds = getPlayerBearItems(p);
      const neutralItemKey = getPlayerNeutralItem(p);

      return {
        raw: p,
        roster,
        nickname,
        playerSlug,
        heroId,
        heroDisplayName,
        heroImgUrl,
        position,
        isRadiant: isRadiantTarget,
        isMvp,
        award,
        imp,
        level: p.level || 1,
        kills: p.kills || 0,
        deaths: p.deaths || 0,
        assists: p.assists || 0,
        netWorth: p.net_worth || 0,
        lastHits: p.last_hits || 0,
        denies: p.denies || 0,
        gpm: p.gold_per_min || 0,
        xpm: p.xp_per_min || 0,
        heroDamage: p.hero_damage || 0,
        towerDamage: p.tower_damage || 0,
        heroHealing: p.hero_healing || 0,
        itemIds,
        bearItemIds,
        neutralItemKey,
        rankTier: p.rank_tier,
        leaderboardRank: p.leaderboard_rank || p.stratz_metadata?.seasonLeaderboardRank,
      };
    }).sort((a, b) => a.position - b.position);
  };

  const radiantPlayers = processList(true);
  const direPlayers = processList(false);

  // Totales para la vista de tabla
  const maxNetWorth = Math.max(
    ...radiantPlayers.map((p) => p.netWorth),
    ...direPlayers.map((p) => p.netWorth),
    1
  );

  const calculateTotals = (list: ProcessedPlayer[]) => {
    return {
      levelTotal: list.reduce((acc, p) => acc + p.level, 0),
      kills: list.reduce((acc, p) => acc + p.kills, 0),
      deaths: list.reduce((acc, p) => acc + p.deaths, 0),
      assists: list.reduce((acc, p) => acc + p.assists, 0),
      netWorth: list.reduce((acc, p) => acc + p.netWorth, 0),
      avgImp: list.length ? Math.round(list.reduce((acc, p) => acc + p.imp, 0) / list.length) : 0,
      lastHits: list.reduce((acc, p) => acc + p.lastHits, 0),
      denies: list.reduce((acc, p) => acc + p.denies, 0),
      gpm: list.reduce((acc, p) => acc + p.gpm, 0),
      xpm: list.reduce((acc, p) => acc + p.xpm, 0),
      heroDamage: list.reduce((acc, p) => acc + p.heroDamage, 0),
      towerDamage: list.reduce((acc, p) => acc + p.towerDamage, 0),
      heroHealing: list.reduce((acc, p) => acc + p.heroHealing, 0),
    };
  };

  const radiantTotals = calculateTotals(radiantPlayers);
  const direTotals = calculateTotals(direPlayers);

  return (
    <section className="relative w-full py-4">
      {/* Header de la sección estilo imperial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-[#d8b467]" />
          <div>
            <span className="text-[10px] font-chakra font-bold tracking-[0.25em] text-[#d8b467] uppercase block">
              TABLERO DE BATALLA
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-chakra">
              Emparejamiento de Gladiadores
            </h2>
          </div>
        </div>

        {/* Toggle de vistas (Tarjetas vs Tabla) */}
        <div className="flex items-center gap-1 p-1 border border-[#2d261e] bg-[#100d0a]">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label="Vista de tarjetas"
            className={`flex items-center justify-center h-8 w-8 transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#1c1712] text-[#f0d38f] border border-[#d8b467]/60 shadow-sm"
                : "text-[#7b7588] hover:text-white"
            }`}
          >
            <IconLayoutGrid size={17} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            aria-label="Vista de tabla"
            className={`flex items-center justify-center h-8 w-8 transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-[#1c1712] text-[#f0d38f] border border-[#d8b467]/60 shadow-sm"
                : "text-[#7b7588] hover:text-white"
            }`}
          >
            <IconList size={17} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VISTA 1: GRID / TARJETAS DE EMPAREJAMIENTO               */}
      {/* ======================================================== */}
      {viewMode === "grid" ? (
        <>
          {/* Vista móvil: Matchup Cara a Cara por Roles (1 a 5) */}
          <div className="md:hidden flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((pos) => (
              <MobileMatchupLaneCard
                key={`lane-match-${pos}`}
                position={pos}
                radiantPlayer={radiantPlayers.find((p) => p.position === pos) || radiantPlayers[pos - 1]}
                direPlayer={direPlayers.find((p) => p.position === pos) || direPlayers[pos - 1]}
              />
            ))}
          </div>

          {/* Vista escritorio: 5 vs 5 tarjetas horizontales */}
          <div className="hidden md:block overflow-x-auto pb-4 pt-1">
            <div className="flex items-stretch justify-between gap-3 min-w-[1020px] px-1">
              {/* 5 Cartas Radiant */}
              <div className="flex-1 grid grid-cols-5 gap-2.5">
                {radiantPlayers.map((player) => (
                  <MatchupPlayerCard key={`radiant-${player.heroId}-${player.position}`} player={player} />
                ))}
              </div>

              {/* Divisor Central VS - Rombo imperial */}
              <div className="flex flex-col items-center justify-center px-1">
                <div className="h-full w-px bg-linear-to-b from-transparent via-[#4a3e2e] to-transparent mb-2" />
                <div className="flex items-center justify-center h-7 w-7 rotate-45 bg-[#1a140e] border border-[#d8b467]/60 shadow-[0_0_10px_rgba(216,180,103,0.2)] shrink-0">
                  <span className="rotate-[-45deg] text-[10px] font-chakra font-black text-[#f0d38f]">VS</span>
                </div>
                <div className="h-full w-px bg-linear-to-b from-transparent via-[#4a3e2e] to-transparent mt-2" />
              </div>

              {/* 5 Cartas Dire */}
              <div className="flex-1 grid grid-cols-5 gap-2.5">
                {direPlayers.map((player) => (
                  <MatchupPlayerCard key={`dire-${player.heroId}-${player.position}`} player={player} />
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ======================================================== */
        /* VISTA 2: TABLA DETALLADA DE EMPAREJAMIENTO               */
        /* ======================================================== */
        <div className="border border-[#2d261e] bg-[#120f0c] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-[#2d261e] text-[10px] text-[#9e9485] font-chakra uppercase tracking-wider bg-[#18140e]">
                  <th className="py-3 px-4 font-bold">Héroe</th>
                  <th className="py-3 px-3 font-bold">Jugador</th>
                  <th className="py-3 px-3 text-center font-bold">D / M / A</th>
                  <th className="py-3 px-3 font-bold min-w-[110px]">VN</th>
                  <th className="py-3 px-3 text-center font-bold">RPI</th>
                  <th className="py-3 px-3 text-center font-bold">LG / DN</th>
                  <th className="py-3 px-3 text-center font-bold">GPM / XPM</th>
                  <th className="py-3 px-3 text-right font-bold">DMH</th>
                  <th className="py-3 px-3 text-right font-bold">TD</th>
                  <th className="py-3 px-3 text-right font-bold">CH</th>
                  <th className="py-3 px-4 text-center font-bold">Inventario</th>
                </tr>
              </thead>

              <tbody>
                {/* 5 Jugadores Radiant */}
                {radiantPlayers.map((player) => (
                  <MatchupTableRow
                    key={`row-radiant-${player.heroId}-${player.position}`}
                    player={player}
                    maxNetWorth={maxNetWorth}
                  />
                ))}

                {/* 5 Jugadores Dire */}
                {direPlayers.map((player) => (
                  <MatchupTableRow
                    key={`row-dire-${player.heroId}-${player.position}`}
                    player={player}
                    maxNetWorth={maxNetWorth}
                  />
                ))}
              </tbody>

              {/* Fila de Totales de Equipos */}
              <tfoot>
                {/* Totales Radiant */}
                <tr className="border-t border-[#2d261e] bg-[#0c1610] text-[#d8d2c7] font-semibold">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-emerald-500/20 text-emerald-400 font-chakra font-bold text-[10px] border border-emerald-500/40">
                        R
                      </span>
                      {game.radiant_team?.slug ? (
                        <Link
                          href={`/teams/${game.radiant_team.slug}`}
                          className="text-[11px] font-chakra font-bold text-white/90 uppercase hover:text-[#00e599] transition-colors"
                        >
                          {game.radiant_team.name || "Radiant"}
                        </Link>
                      ) : (
                        <span className="text-[11px] font-chakra font-bold text-white/90 uppercase">Radiant</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-[#7b7588]">
                    {radiantTotals.levelTotal}
                  </td>
                  <td className="py-3 px-3 text-center text-white font-bold font-chakra">
                    {radiantTotals.kills} / {radiantTotals.deaths} / {radiantTotals.assists}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[#f0d38f] font-chakra font-bold">
                      {formatSpanishCompact(radiantTotals.netWorth)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-[#d8b467] font-bold font-mono">
                    {radiantTotals.avgImp >= 0 ? `+${radiantTotals.avgImp}` : radiantTotals.avgImp}
                  </td>
                  <td className="py-3 px-3 text-center text-[#b5ada1] font-mono">
                    {formatSpanishCompact(radiantTotals.lastHits)} / {radiantTotals.denies}
                  </td>
                  <td className="py-3 px-3 text-center text-[#b5ada1] font-mono">
                    {formatSpanishCompact(radiantTotals.gpm)} / {formatSpanishCompact(radiantTotals.xpm)}
                  </td>
                  <td className="py-3 px-3 text-right text-white font-bold font-chakra">
                    {formatSpanishCompact(radiantTotals.heroDamage)}
                  </td>
                  <td className="py-3 px-3 text-right text-[#d8d2c7] font-chakra font-bold">
                    {formatSpanishCompact(radiantTotals.towerDamage)}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-bold font-chakra">
                    {radiantTotals.heroHealing ? formatSpanishCompact(radiantTotals.heroHealing) : "0"}
                  </td>
                  <td className="py-3 px-4 text-center text-[#7b7588] font-chakra text-[10px] uppercase font-bold">Total</td>
                </tr>

                {/* Totales Dire */}
                <tr className="border-t border-[#2d261e] bg-[#160c0c] text-[#d8d2c7] font-semibold">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-rose-500/20 text-rose-400 font-chakra font-bold text-[10px] border border-rose-500/40">
                        D
                      </span>
                      {game.dire_team?.slug ? (
                        <Link
                          href={`/teams/${game.dire_team.slug}`}
                          className="text-[11px] font-chakra font-bold text-white/90 uppercase hover:text-[#ff4d4d] transition-colors"
                        >
                          {game.dire_team.name || "Dire"}
                        </Link>
                      ) : (
                        <span className="text-[11px] font-chakra font-bold text-white/90 uppercase">Dire</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-[#7b7588]">
                    {direTotals.levelTotal}
                  </td>
                  <td className="py-3 px-3 text-center text-white font-bold font-chakra">
                    {direTotals.kills} / {direTotals.deaths} / {direTotals.assists}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[#f0d38f] font-chakra font-bold">
                      {formatSpanishCompact(direTotals.netWorth)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-[#ff6b6b] font-bold font-mono">
                    {direTotals.avgImp >= 0 ? `+${direTotals.avgImp}` : direTotals.avgImp}
                  </td>
                  <td className="py-3 px-3 text-center text-[#b5ada1] font-mono">
                    {formatSpanishCompact(direTotals.lastHits)} / {direTotals.denies}
                  </td>
                  <td className="py-3 px-3 text-center text-[#b5ada1] font-mono">
                    {formatSpanishCompact(direTotals.gpm)} / {formatSpanishCompact(direTotals.xpm)}
                  </td>
                  <td className="py-3 px-3 text-right text-white font-bold font-chakra">
                    {formatSpanishCompact(direTotals.heroDamage)}
                  </td>
                  <td className="py-3 px-3 text-right text-[#d8d2c7] font-chakra font-bold">
                    {formatSpanishCompact(direTotals.towerDamage)}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-bold font-chakra">
                    {direTotals.heroHealing ? formatSpanishCompact(direTotals.heroHealing) : "0"}
                  </td>
                  <td className="py-3 px-4 text-center text-[#7b7588] font-chakra text-[10px] uppercase font-bold">Total</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

// Subcomponente: Tarjeta individual en Vista Grid (Placa de Gladiador)
function MatchupPlayerCard({ player }: { player: ProcessedPlayer }) {
  const medalUrl = getRankMedalUrl(player.rankTier);

  return (
    <div
      className={`flex flex-col justify-between border ${
        player.isRadiant
          ? "border-[#24352b] border-t-2 border-t-[#00e599]"
          : "border-[#382222] border-t-2 border-t-[#ff4d4d]"
      } bg-[#120f0c] hover:border-[#d8b467]/70 overflow-hidden transition-all duration-200 group shadow-lg relative`}
    >
      {/* 1. Header con banner de héroe */}
      <div className="relative w-full h-14 sm:h-16 overflow-hidden bg-black/50">
        <picture>
          <img
            src={player.heroImgUrl}
            alt={player.heroDisplayName}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </picture>
        <div className="absolute inset-0 bg-linear-to-t from-[#120f0c] via-transparent to-transparent opacity-85" />
      </div>

      {/* 2. Cuerpo con métricas */}
      <div className="p-2.5 flex flex-col items-center gap-2 text-center">
        {/* RPI / IMP Bar */}
        <ImpBar imp={player.imp} isMvp={player.isMvp} award={player.award} />

        {/* Icono de posición */}
        <div className="flex items-center justify-center my-0.5">
          {getPositionIcon(player.position)}
        </div>

        {/* K / D / A */}
        <span className="text-xs sm:text-sm font-chakra font-bold text-white tracking-tight">
          {player.kills} <span className="text-[#554b3f]">/</span> {player.deaths} <span className="text-[#554b3f]">/</span> {player.assists}
        </span>

        {/* Net Worth con icono de moneda */}
        <div className="flex items-center gap-1 text-[11px] font-chakra font-bold text-[#f0d38f]">
          <IconCoin size={13} className="text-[#d8b467] shrink-0 fill-[#d8b467]/20" />
          <span>{player.netWorth.toLocaleString("es-ES")}</span>
        </div>

        {/* Nickname del jugador oficial */}
        <div className="flex items-center gap-1.5 max-w-full truncate pt-1">
          <span
            className={`w-1.5 h-1.5 ${
              player.isRadiant ? "bg-emerald-400" : "bg-rose-400"
            } shrink-0 shadow-[0_0_6px_rgba(216,180,103,0.6)]`}
          />
          {player.playerSlug ? (
            <Link
              href={`/players/${encodeURIComponent(player.playerSlug)}`}
              className="text-[11px] font-chakra font-bold text-[#d8d2c7] hover:text-[#d8b467] truncate uppercase tracking-tight transition-colors"
            >
              {player.nickname}
            </Link>
          ) : (
            <span className="text-[11px] font-chakra font-bold text-[#d8d2c7] group-hover:text-[#f0d38f] truncate uppercase tracking-tight">
              {player.nickname}
            </span>
          )}
        </div>

        {/* Medalla de Rango de Dota 2 */}
        <div className="relative flex flex-col items-center justify-center mt-1 pt-1 border-t border-[#241e17] w-full">
          <div className="relative h-10 w-10 flex items-center justify-center">
            <picture>
              <img
                src={medalUrl}
                alt="Rank Medal"
                className="h-9 w-9 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              />
            </picture>
            {player.leaderboardRank != null && (
              <span className="absolute -bottom-1 px-1 bg-[#14100c] border border-[#d8b467]/70 text-[9px] font-chakra font-black text-[#f0d38f] shadow-xs">
                {player.leaderboardRank}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponente: Fila individual en Vista Tabla
function MatchupTableRow({
  player,
  maxNetWorth,
}: {
  player: ProcessedPlayer;
  maxNetWorth: number;
}) {
  const netWorthPct = Math.min(100, Math.max(10, Math.round((player.netWorth / maxNetWorth) * 100)));

  return (
    <tr className="border-b border-[#241e17] hover:bg-[#18140f]/90 transition-colors">
      {/* 1. HÉROE: Icono posición + avatar de héroe + nivel */}
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-2.5">
          <div className="shrink-0">{getPositionIcon(player.position)}</div>

          <div className="relative w-11 h-7 overflow-hidden border border-[#2d261e] shrink-0 bg-black/40">
            <picture>
              <img
                src={player.heroImgUrl}
                alt={player.heroDisplayName}
                className="w-full h-full object-cover"
              />
            </picture>
          </div>

          <div className="flex items-center justify-center w-5 h-5 border border-[#3d3328] bg-[#1a140e] text-[10px] text-[#d8d2c7] font-chakra font-bold shrink-0">
            {player.level}
          </div>
        </div>
      </td>

      {/* 2. JUGADOR: Indicador + Nickname oficial */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2 max-w-[140px] truncate">
          <span
            className={`w-1.5 h-1.5 ${
              player.isRadiant ? "bg-emerald-400" : "bg-rose-400"
            } shrink-0`}
          />
          {player.playerSlug ? (
            <Link
              href={`/players/${encodeURIComponent(player.playerSlug)}`}
              className="font-chakra font-bold text-white text-xs truncate uppercase tracking-tight hover:text-[#d8b467] transition-colors"
            >
              {player.nickname}
            </Link>
          ) : (
            <span className="font-chakra font-bold text-white text-xs truncate uppercase tracking-tight">
              {player.nickname}
            </span>
          )}
        </div>
      </td>

      {/* 3. D / M / A */}
      <td className="py-2.5 px-3 text-center">
        <span className="font-chakra font-bold text-white">
          {player.kills} <span className="text-[#554b3f]">/</span> {player.deaths} <span className="text-[#554b3f]">/</span> {player.assists}
        </span>
      </td>

      {/* 4. VN (Valor Neto) con barra dorada */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <span className="font-chakra font-bold text-[#f0d38f] min-w-[50px]">
            {formatSpanishCompact(player.netWorth)}
          </span>
          <div className="w-12 h-1 bg-[#1c1712] overflow-hidden">
            <div
              className="h-full bg-[#d8b467]"
              style={{ width: `${netWorthPct}%` }}
            />
          </div>
        </div>
      </td>

      {/* 5. RPI (IMP) */}
      <td className="py-2.5 px-3 text-center">
        <div className="flex justify-center">
          <ImpBar imp={player.imp} isMvp={player.isMvp} award={player.award} />
        </div>
      </td>

      {/* 6. LG / DN */}
      <td className="py-2.5 px-3 text-center text-[#b5ada1] font-mono">
        {player.lastHits} <span className="text-[#554b3f]">/</span> {player.denies}
      </td>

      {/* 7. GPM / XPM */}
      <td className="py-2.5 px-3 text-center text-[#b5ada1] font-mono">
        {player.gpm} <span className="text-[#554b3f]">/</span> {player.xpm}
      </td>

      {/* 8. DMH (Daño Héroes) */}
      <td className="py-2.5 px-3 text-right font-chakra font-bold text-white">
        {formatSpanishCompact(player.heroDamage)}
      </td>

      {/* 9. TD (Daño Torres) */}
      <td className="py-2.5 px-3 text-right text-[#d8d2c7] font-chakra font-bold">
        {formatSpanishCompact(player.towerDamage)}
      </td>

      {/* 10. CH (Curación Héroes) */}
      <td className="py-2.5 px-3 text-right">
        {player.heroHealing > 0 ? (
          <span className="font-chakra font-bold text-emerald-400">
            {formatSpanishCompact(player.heroHealing)}
          </span>
        ) : (
          <span className="text-[#554b3f]">0</span>
        )}
      </td>

      {/* 11. INVENTARIO (6 slots + Neutral + Oso Espiritual si aplica) */}
      <td className="py-2.5 px-4">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center gap-1.5">
            {/* Grid 2x3 de items principales */}
            <div className="grid grid-cols-3 gap-0.5 w-[72px]">
              {player.itemIds.map((itemId, idx) => {
                const hasItem = itemId && itemId > 0;
                const imgUrl = hasItem ? getItemImageUrl(itemId) : undefined;
                return (
                  <div
                    key={`item-${idx}`}
                    className="w-5 h-3.5 bg-[#0a0806] border border-[#2d261e] overflow-hidden flex items-center justify-center"
                  >
                    {hasItem && imgUrl && (
                      <picture>
                        <img src={imgUrl} alt="Item" className="w-full h-full object-cover" />
                      </picture>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Item Neutral */}
            <div className="w-5 h-5 border border-[#d8b467]/60 bg-[#14100c] overflow-hidden flex items-center justify-center shrink-0">
              {player.neutralItemKey && getItemImageUrl(player.neutralItemKey) ? (
                <picture>
                  <img
                    src={getItemImageUrl(player.neutralItemKey)}
                    alt={getItemDisplayName(player.neutralItemKey)}
                    title={getItemDisplayName(player.neutralItemKey)}
                    className="w-full h-full object-cover"
                  />
                </picture>
              ) : null}
            </div>
          </div>

          {/* Items del Oso Espiritual si existen */}
          {player.bearItemIds && (
            <div className="flex items-center justify-center gap-1 pt-0.5 border-t border-[#d8b467]/20 w-full">
              <picture className="w-3 h-3 rounded-xs overflow-hidden inline-block shrink-0 border border-[#d8b467]/60">
                <img
                  src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lone_druid_spirit_bear.png"
                  alt="Spirit Bear"
                  className="w-full h-full object-cover"
                />
              </picture>
              <div className="grid grid-cols-3 gap-0.5 w-[72px]">
                {player.bearItemIds.map((itemId, idx) => {
                  const hasItem = itemId && itemId > 0;
                  const imgUrl = hasItem ? getItemImageUrl(itemId) : undefined;
                  const dName = hasItem ? getItemDisplayName(itemId) : undefined;
                  return (
                    <div
                      key={`bear-item-${idx}`}
                      className="w-5 h-3.5 bg-[#0e0a06] border border-[#d8b467]/40 overflow-hidden flex items-center justify-center"
                      title={dName ? `Oso: ${dName}` : undefined}
                    >
                      {hasItem && imgUrl && (
                        <picture>
                          <img src={imgUrl} alt={dName || "Item"} className="w-full h-full object-cover" />
                        </picture>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// Subcomponente: Tarjeta de Enfrentamiento por Línea / Posición en Móvil
function MobileMatchupLaneCard({
  position,
  radiantPlayer,
  direPlayer,
}: {
  position: number;
  radiantPlayer?: ProcessedPlayer;
  direPlayer?: ProcessedPlayer;
}) {
  if (!radiantPlayer && !direPlayer) return null;

  const maxNet = Math.max(radiantPlayer?.netWorth || 0, direPlayer?.netWorth || 0, 1);
  const radPct = Math.round(((radiantPlayer?.netWorth || 0) / maxNet) * 100);
  const dirPct = Math.round(((direPlayer?.netWorth || 0) / maxNet) * 100);

  const getPositionLabel = (pos: number) => {
    switch (pos) {
      case 1:
        return "POSICIÓN 1 · HARD CARRY";
      case 2:
        return "POSICIÓN 2 · MID LANE";
      case 3:
        return "POSICIÓN 3 · OFFLANE";
      case 4:
        return "POSICIÓN 4 · SOFT SUPPORT";
      case 5:
        return "POSICIÓN 5 · HARD SUPPORT";
      default:
        return `POSICIÓN ${pos}`;
    }
  };

  return (
    <div className="border border-[#2d261e] bg-[#120f0c] p-3 shadow-lg relative overflow-hidden">
      {/* Header del Matchup por Posición */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#241e17]">
        <div className="flex items-center gap-1.5 text-[#d8b467] text-[10px] font-chakra font-black tracking-widest uppercase">
          {getPositionIcon(position)}
          <span>{getPositionLabel(position)}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-[#00e599] font-bold">{formatSpanishCompact(radiantPlayer?.netWorth || 0)}</span>
          <span className="text-[#554b3f]">vs</span>
          <span className="text-[#ff6b6b] font-bold">{formatSpanishCompact(direPlayer?.netWorth || 0)}</span>
        </div>
      </div>

      {/* Grid de 2 Gladiadores Cara a Cara */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {/* RADIANT */}
        {radiantPlayer ? (
          <div className="flex flex-col items-center text-center min-w-0">
            <div className="relative w-14 h-9 overflow-hidden border border-[#00e599]/40 bg-black/50">
              <picture>
                <img
                  src={radiantPlayer.heroImgUrl}
                  alt={radiantPlayer.heroDisplayName}
                  className="w-full h-full object-cover"
                />
              </picture>
              <span className="absolute bottom-0 right-0 px-1 bg-black/80 text-[9px] font-chakra font-bold text-[#d8d2c7]">
                {radiantPlayer.level}
              </span>
            </div>
            {radiantPlayer.playerSlug ? (
              <Link
                href={`/players/${encodeURIComponent(radiantPlayer.playerSlug)}`}
                className="text-[11px] font-chakra font-bold text-white truncate max-w-full mt-1 hover:text-[#d8b467] transition-colors"
              >
                {radiantPlayer.nickname}
              </Link>
            ) : (
              <span className="text-[11px] font-chakra font-bold text-white truncate max-w-full mt-1">
                {radiantPlayer.nickname}
              </span>
            )}
            <span className="text-[9px] font-chakra text-[#8e857b] truncate max-w-full">
              {radiantPlayer.heroDisplayName}
            </span>
            <div className="text-[10px] font-mono font-bold mt-0.5 text-white">
              <span className="text-[#00e599]">{radiantPlayer.kills}</span>/
              <span className="text-[#ff6b6b]">{radiantPlayer.deaths}</span>/
              <span className="text-[#6cc4ff]">{radiantPlayer.assists}</span>
            </div>
            {/* 6 Items + Neutral */}
            <div className="flex items-center gap-1 mt-1.5">
              <div className="grid grid-cols-3 gap-0.5 w-[51px]">
                {radiantPlayer.itemIds.slice(0, 6).map((itemId, idx) => (
                  <div key={`rad-m-${idx}`} className="w-4 h-2.5 bg-[#0a0806] border border-[#2d261e] overflow-hidden flex items-center justify-center">
                    {itemId && itemId > 0 ? (
                      <picture>
                        <img src={getItemImageUrl(itemId)} alt="Item" className="w-full h-full object-cover" />
                      </picture>
                    ) : null}
                  </div>
                ))}
              </div>
              {radiantPlayer.neutralItemKey && getItemImageUrl(radiantPlayer.neutralItemKey) ? (
                <div className="w-3.5 h-3.5 border border-[#d8b467]/60 bg-[#14100c] overflow-hidden flex items-center justify-center shrink-0">
                  <picture>
                    <img
                      src={getItemImageUrl(radiantPlayer.neutralItemKey)}
                      alt={getItemDisplayName(radiantPlayer.neutralItemKey)}
                      title={getItemDisplayName(radiantPlayer.neutralItemKey)}
                      className="w-full h-full object-cover"
                    />
                  </picture>
                </div>
              ) : null}
            </div>
            {/* Oso Espiritual si aplica */}
            {radiantPlayer.bearItemIds && (
              <div className="flex items-center gap-1 mt-1 pt-0.5 border-t border-[#d8b467]/20">
                <picture className="w-2.5 h-2.5 rounded-xs overflow-hidden inline-block shrink-0 border border-[#d8b467]/50">
                  <img
                    src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lone_druid_spirit_bear.png"
                    alt="Spirit Bear"
                    className="w-full h-full object-cover"
                  />
                </picture>
                <div className="grid grid-cols-3 gap-0.5 w-[51px]">
                  {radiantPlayer.bearItemIds.slice(0, 6).map((itemId, idx) => (
                    <div key={`rad-bear-m-${idx}`} className="w-4 h-2.5 bg-[#0e0a06] border border-[#d8b467]/30 overflow-hidden flex items-center justify-center">
                      {itemId && itemId > 0 ? (
                        <picture>
                          <img src={getItemImageUrl(itemId)} alt="Bear Item" className="w-full h-full object-cover" />
                        </picture>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : <div />}

        {/* VS CENTRAL */}
        <div className="flex flex-col items-center justify-center px-1">
          <div className="flex items-center justify-center h-6 w-6 rotate-45 bg-[#1a140e] border border-[#d8b467]/60 shadow-[0_0_8px_rgba(216,180,103,0.2)] shrink-0">
            <span className="rotate-[-45deg] text-[9px] font-chakra font-black text-[#f0d38f]">VS</span>
          </div>
        </div>

        {/* DIRE */}
        {direPlayer ? (
          <div className="flex flex-col items-center text-center min-w-0">
            <div className="relative w-14 h-9 overflow-hidden border border-[#ff4d4d]/40 bg-black/50">
              <picture>
                <img
                  src={direPlayer.heroImgUrl}
                  alt={direPlayer.heroDisplayName}
                  className="w-full h-full object-cover"
                />
              </picture>
              <span className="absolute bottom-0 right-0 px-1 bg-black/80 text-[9px] font-chakra font-bold text-[#d8d2c7]">
                {direPlayer.level}
              </span>
            </div>
            {direPlayer.playerSlug ? (
              <Link
                href={`/players/${encodeURIComponent(direPlayer.playerSlug)}`}
                className="text-[11px] font-chakra font-bold text-white truncate max-w-full mt-1 hover:text-[#ff4d4d] transition-colors"
              >
                {direPlayer.nickname}
              </Link>
            ) : (
              <span className="text-[11px] font-chakra font-bold text-white truncate max-w-full mt-1">
                {direPlayer.nickname}
              </span>
            )}
            <span className="text-[9px] font-chakra text-[#8e857b] truncate max-w-full">
              {direPlayer.heroDisplayName}
            </span>
            <div className="text-[10px] font-mono font-bold mt-0.5 text-white">
              <span className="text-[#00e599]">{direPlayer.kills}</span>/
              <span className="text-[#ff6b6b]">{direPlayer.deaths}</span>/
              <span className="text-[#6cc4ff]">{direPlayer.assists}</span>
            </div>
            {/* 6 Items + Neutral */}
            <div className="flex items-center gap-1 mt-1.5">
              <div className="grid grid-cols-3 gap-0.5 w-[51px]">
                {direPlayer.itemIds.slice(0, 6).map((itemId, idx) => (
                  <div key={`dir-m-${idx}`} className="w-4 h-2.5 bg-[#0a0806] border border-[#2d261e] overflow-hidden flex items-center justify-center">
                    {itemId && itemId > 0 ? (
                      <picture>
                        <img src={getItemImageUrl(itemId)} alt="Item" className="w-full h-full object-cover" />
                      </picture>
                    ) : null}
                  </div>
                ))}
              </div>
              {direPlayer.neutralItemKey && getItemImageUrl(direPlayer.neutralItemKey) ? (
                <div className="w-3.5 h-3.5 border border-[#d8b467]/60 bg-[#14100c] overflow-hidden flex items-center justify-center shrink-0">
                  <picture>
                    <img
                      src={getItemImageUrl(direPlayer.neutralItemKey)}
                      alt={getItemDisplayName(direPlayer.neutralItemKey)}
                      title={getItemDisplayName(direPlayer.neutralItemKey)}
                      className="w-full h-full object-cover"
                    />
                  </picture>
                </div>
              ) : null}
            </div>
            {/* Oso Espiritual si aplica */}
            {direPlayer.bearItemIds && (
              <div className="flex items-center gap-1 mt-1 pt-0.5 border-t border-[#d8b467]/20">
                <picture className="w-2.5 h-2.5 rounded-xs overflow-hidden inline-block shrink-0 border border-[#d8b467]/50">
                  <img
                    src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lone_druid_spirit_bear.png"
                    alt="Spirit Bear"
                    className="w-full h-full object-cover"
                  />
                </picture>
                <div className="grid grid-cols-3 gap-0.5 w-[51px]">
                  {direPlayer.bearItemIds.slice(0, 6).map((itemId, idx) => (
                    <div key={`dir-bear-m-${idx}`} className="w-4 h-2.5 bg-[#0e0a06] border border-[#d8b467]/30 overflow-hidden flex items-center justify-center">
                      {itemId && itemId > 0 ? (
                        <picture>
                          <img src={getItemImageUrl(itemId)} alt="Bear Item" className="w-full h-full object-cover" />
                        </picture>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : <div />}
      </div>

      {/* Barra de proporción de valor neto */}
      <div className="mt-2.5 pt-2 border-t border-[#1f1a14] flex items-center gap-2">
        <div className="w-full h-1 bg-[#1a140f] rounded-full overflow-hidden flex">
          <div style={{ width: `${radPct}%` }} className="bg-[#00e599]" />
          <div style={{ width: `${dirPct}%` }} className="bg-[#ff4d4d]" />
        </div>
      </div>
    </div>
  );
}
