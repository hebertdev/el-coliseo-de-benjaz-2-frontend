"use client";

import { useMemo } from "react";
import { GameDetailData, OpenDotaPlayer, GameRosterPlayer } from "interfaces/games";
import {
  HERO_ID_MAP,
  getHeroShortName,
  getHeroDisplayName,
  getHeroIconUrl,
  getPlayerNickname,
  matchRosterPlayer,
} from "helpers/dota";
import Link from "next/link";
import { Tooltip } from "@mantine/core";
import { IconCircleCheckFilled, IconUsers } from "@tabler/icons-react";

interface GameKillMatrixBoardProps {
  game: GameDetailData;
}

interface MatrixPlayer {
  raw: OpenDotaPlayer;
  roster?: GameRosterPlayer;
  nickname: string;
  playerSlug?: string;
  heroId: number;
  heroDisplayName: string;
  heroIconUrl: string;
  position: number;
  kills: number;
  isRadiant: boolean;
  killedMap: Record<string, number>;
}

/**
 * Obtiene la cantidad de asesinatos que un jugador realizó sobre un héroe enemigo específico
 */
function getKillsOnHero(
  killedMap: Record<string, number>,
  killsLog: { key?: string }[] | undefined,
  enemyHeroId: number
): number {
  const shortName = HERO_ID_MAP[enemyHeroId]?.shortName || getHeroShortName(enemyHeroId);
  if (!shortName) return 0;

  const targetHeroKey = `npc_dota_hero_${shortName}`.toLowerCase();

  // 1. Buscar en el diccionario pre-calculado `killed` de OpenDota (exclusivo para héroes)
  if (killedMap) {
    if (killedMap[targetHeroKey] !== undefined) return killedMap[targetHeroKey];

    for (const [key, count] of Object.entries(killedMap)) {
      const lower = key.toLowerCase();
      // Asegurarse de que empiece con npc_dota_hero_ para no capturar invocaciones o creeps
      if (lower === targetHeroKey || (lower.startsWith("npc_dota_hero_") && lower.endsWith(`_${shortName.toLowerCase()}`))) {
        return count;
      }
    }
  }

  // 2. Fallback: Contar desde kills_log si está disponible
  if (killsLog && killsLog.length > 0) {
    let count = 0;
    for (const log of killsLog) {
      const key = (log.key || "").toLowerCase();
      if (key === targetHeroKey || (key.startsWith("npc_dota_hero_") && key.endsWith(`_${shortName.toLowerCase()}`))) {
        count++;
      }
    }
    return count;
  }

  return 0;
}

export function GameKillMatrixBoard({ game }: GameKillMatrixBoardProps) {
  const { radiantPlayers, direPlayers } = useMemo(() => {
    const opendotaPlayers = game.opendota_data?.players || [];
    const processTeam = (isRadiantTarget: boolean): MatrixPlayer[] => {
      const list = opendotaPlayers.filter((p) =>
        p.isRadiant !== undefined
          ? p.isRadiant === isRadiantTarget
          : isRadiantTarget
          ? p.player_slot < 128
          : p.player_slot >= 128
      );

      return list
        .map((p, idx) => {
          const roster = matchRosterPlayer(p, game);
          const nickname = getPlayerNickname(p, game);
          const playerSlug = roster?.slug || roster?.nickname || (nickname && nickname !== "Jugador" ? nickname : undefined);
          const heroId = p.hero_id;
          const heroDisplayName = getHeroDisplayName(heroId);
          const heroIconUrl = getHeroIconUrl(heroId);
          const position = roster?.competitive_position || p.lane_role || p.position_est || idx + 1;
          const kills = p.kills || 0;
          const killedMap = p.killed || {};

          return {
            raw: p,
            roster,
            nickname,
            playerSlug,
            heroId,
            heroDisplayName,
            heroIconUrl,
            position,
            kills,
            isRadiant: isRadiantTarget,
            killedMap,
          };
        })
        .sort((a, b) => a.position - b.position);
    };

    return {
      radiantPlayers: processTeam(true),
      direPlayers: processTeam(false),
    };
  }, [game]);

  // Si no hay suficientes jugadores, no renderizar
  if (radiantPlayers.length === 0 || direPlayers.length === 0) {
    return null;
  }

  const radiantTeamName = game.radiant_team?.name || "Radiant";
  const direTeamName = game.dire_team?.name || "Dire";

  const radiantTotalKills = radiantPlayers.reduce((acc, p) => acc + p.kills, 0);
  const direTotalKills = direPlayers.reduce((acc, p) => acc + p.kills, 0);

  return (
    <section className="relative w-full py-2">
      {/* Encabezado imperial de la sección */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-6 w-1 bg-[#d8b467]" />
        <div>
          <span className="text-[10px] font-chakra font-bold tracking-[0.25em] text-[#d8b467] uppercase block">
            DESGLOSE DE ENFRENTAMIENTOS
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-chakra">
            Estadísticas de asesinatos
          </h2>
        </div>
      </div>

      {/* Grid de 2 paneles (Radiant a la izquierda, Dire a la derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Radiant */}
        <KillMatrixTeamPanel
          teamName={radiantTeamName}
          teamSlug={game.radiant_team?.slug}
          logoUrl={game.radiant_team?.logo_url}
          isRadiant={true}
          killers={radiantPlayers}
          victims={direPlayers}
          teamTotalKills={radiantTotalKills}
          officialScore={game.opendota_data?.radiant_score}
        />

        {/* Panel Dire */}
        <KillMatrixTeamPanel
          teamName={direTeamName}
          teamSlug={game.dire_team?.slug}
          logoUrl={game.dire_team?.logo_url}
          isRadiant={false}
          killers={direPlayers}
          victims={radiantPlayers}
          teamTotalKills={direTotalKills}
          officialScore={game.opendota_data?.dire_score}
        />
      </div>
    </section>
  );
}

/**
 * Tarjeta individual de equipo para la matriz de asesinatos
 */
function KillMatrixTeamPanel({
  teamName,
  teamSlug,
  logoUrl,
  isRadiant,
  killers,
  victims,
  teamTotalKills,
  officialScore,
}: {
  teamName: string;
  teamSlug?: string;
  logoUrl?: string | null;
  isRadiant: boolean;
  killers: MatrixPlayer[];
  victims: MatrixPlayer[];
  teamTotalKills: number;
  officialScore?: number;
}) {
  // Calcular totales por cada víctima enemiga
  const victimTotals = useMemo(() => {
    return victims.map((victim) => {
      const total = killers.reduce((sum, killer) => {
        return sum + getKillsOnHero(killer.killedMap, killer.raw.kills_log, victim.heroId);
      }, 0);
      return {
        victim,
        total,
      };
    });
  }, [killers, victims]);

  const uncredited = officialScore != null && officialScore > teamTotalKills ? officialScore - teamTotalKills : 0;

  return (
    <div className="relative border border-[#2d261e] bg-[#120f0c] shadow-2xl overflow-hidden flex flex-col justify-between">
      {/* Esquinas imperiales doradas */}
      <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
      <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
      <span className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
      <span className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />

      {/* Header del equipo */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#241e17] bg-[#16120d]">
        <div className="flex items-center gap-2.5">
          {teamSlug ? (
            <Link
              href={`/teams/${teamSlug}`}
              className="flex items-center gap-2.5 group hover:opacity-90 transition-all"
            >
              {logoUrl ? (
                <div
                  className={`relative w-6 h-6 rounded border bg-black/60 overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-sm ${
                    isRadiant ? "border-emerald-500/40 group-hover:border-emerald-400" : "border-rose-500/40 group-hover:border-rose-400"
                  }`}
                >
                  <picture>
                    <img src={logoUrl} alt={teamName} className="w-full h-full object-contain" />
                  </picture>
                </div>
              ) : null}
              <span
                className={`flex items-center justify-center w-5 h-5 font-chakra font-bold text-[10px] border shrink-0 ${
                  isRadiant
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                }`}
              >
                {isRadiant ? "R" : "D"}
              </span>
              <span className="text-xs sm:text-sm font-chakra font-bold text-white uppercase tracking-wider group-hover:text-[#d8b467] transition-colors">
                {teamName}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <div
                  className={`relative w-6 h-6 rounded border bg-black/60 overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-sm ${
                    isRadiant ? "border-emerald-500/40" : "border-rose-500/40"
                  }`}
                >
                  <picture>
                    <img src={logoUrl} alt={teamName} className="w-full h-full object-contain" />
                  </picture>
                </div>
              ) : null}
              <span
                className={`flex items-center justify-center w-5 h-5 font-chakra font-bold text-[10px] border shrink-0 ${
                  isRadiant
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                }`}
              >
                {isRadiant ? "R" : "D"}
              </span>
              <span className="text-xs sm:text-sm font-chakra font-bold text-white uppercase tracking-wider">
                {teamName}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-chakra font-bold text-[#d8b467]">
            {teamTotalKills} asesinatos
          </span>
          {uncredited > 0 && (
            <Tooltip
              label={`Se registran ${teamTotalKills} asesinatos individuales de jugadores + ${uncredited} baja enemiga por torres/creeps sin héroe acreditado (Marcador total: ${officialScore})`}
              color="#15100c"
              withArrow
              position="top"
            >
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-[#261e16] border border-[#d8b467]/30 text-[#f0d38f] cursor-help">
                +{uncredited} neutral
              </span>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Contenido: Filas de asesinos vs víctimas */}
      <div className="p-2.5 sm:p-4 space-y-2 overflow-x-auto select-none no-scrollbar">
        <div className="min-w-[390px] sm:min-w-[480px] space-y-2">
          {killers.map((killer) => (
            <div
              key={`killer-${killer.heroId}-${killer.position}`}
              className="flex items-center justify-between gap-2 sm:gap-3 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded border border-[#231c15] bg-[#17120e]/90 hover:border-[#d8b467]/40 hover:bg-[#1c1611] transition-all"
            >
              {/* Info del jugador asesino */}
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 max-w-[125px] sm:max-w-[200px]">
                {/* Avatar del héroe */}
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded border border-[#2d261e] bg-black/60 shrink-0 overflow-hidden shadow-sm">
                  <picture>
                    <img
                      src={killer.heroIconUrl}
                      alt={killer.heroDisplayName}
                      className="w-full h-full object-cover"
                    />
                  </picture>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <IconUsers size={11} className="text-[#4dabf7] shrink-0" />
                    {killer.roster && (
                      <IconCircleCheckFilled size={11} className="text-[#d8b467] shrink-0" />
                    )}
                    {killer.playerSlug ? (
                      <Link
                        href={`/players/${encodeURIComponent(killer.playerSlug)}`}
                        className="text-xs font-chakra font-bold text-white truncate hover:text-[#d8b467] transition-colors"
                      >
                        {killer.nickname}
                      </Link>
                    ) : (
                      <span className="text-xs font-chakra font-bold text-white truncate group-hover:text-[#f0d38f]">
                        {killer.nickname}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-chakra text-[#8e857b]">
                    {killer.kills} {killer.kills === 1 ? "baja" : "bajas"}
                  </span>
                </div>
              </div>

              {/* 5 Casillas de enemigos abatidos */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {victims.map((victim) => {
                  const killsCount = getKillsOnHero(
                    killer.killedMap,
                    killer.raw.kills_log,
                    victim.heroId
                  );
                  const hasKills = killsCount > 0;

                  return (
                    <Tooltip
                      key={`k-${killer.heroId}-v-${victim.heroId}`}
                      label={
                        <div className="text-center font-chakra py-0.5">
                          <div className="text-xs font-bold text-[#f0d38f]">
                            {killer.nickname} → {victim.heroDisplayName}
                          </div>
                          <div className="text-[10px] text-[#8e857b]">
                            {killsCount} {killsCount === 1 ? "vez abatido" : "veces abatido"}
                          </div>
                        </div>
                      }
                      color="#15100c"
                      withArrow
                      position="top"
                    >
                      <div
                        className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded min-w-[40px] sm:min-w-[56px] h-6 sm:h-7 border transition-all ${
                          hasKills
                            ? "border-[#d8b467]/40 bg-[#211a13] text-[#f0d38f] shadow-xs"
                            : "border-transparent bg-[#14100c]/50 text-[#554b3f] opacity-35"
                        }`}
                      >
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full overflow-hidden shrink-0 border border-black/40">
                          <picture>
                            <img
                              src={victim.heroIconUrl}
                              alt={victim.heroDisplayName}
                              className="w-full h-full object-cover"
                            />
                          </picture>
                        </div>
                        <span className="font-chakra font-bold text-[11px] sm:text-xs">{killsCount}</span>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fila de totales al pie de la tarjeta */}
      <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-t border-[#241e17] bg-[#16120d] flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="min-w-max">
          <span className="font-chakra font-black text-xs sm:text-sm text-white tracking-wider">
            Total: {teamTotalKills}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {victimTotals.map(({ victim, total }) => {
            const hasKills = total > 0;
            return (
              <Tooltip
                key={`total-victim-${victim.heroId}`}
                label={
                  <div className="text-center font-chakra py-0.5">
                    <div className="text-xs font-bold text-[#f0d38f]">
                      Total sobre {victim.heroDisplayName}
                    </div>
                    <div className="text-[10px] text-[#8e857b]">{total} muertes en total</div>
                  </div>
                }
                color="#15100c"
                withArrow
                position="top"
              >
                <div
                  className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded min-w-[40px] sm:min-w-[56px] h-6 sm:h-7 border transition-all ${
                    hasKills
                      ? "border-[#d8b467]/60 bg-[#261e16] text-[#f0d38f] shadow-xs"
                      : "border-transparent bg-[#14100c]/50 text-[#554b3f] opacity-35"
                  }`}
                >
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full overflow-hidden shrink-0 border border-black/40">
                    <picture>
                      <img
                        src={victim.heroIconUrl}
                        alt={victim.heroDisplayName}
                        className="w-full h-full object-cover"
                      />
                    </picture>
                  </div>
                  <span className="font-chakra font-bold text-[11px] sm:text-xs">{total}</span>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
}
