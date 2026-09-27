"use client";

import { useState } from "react";
import {
  IconUsers,
  IconCircleCheckFilled,
  IconTrophy,
  IconChevronRight,
  IconMinus,
  IconPlus,
} from "@tabler/icons-react";
import { Tooltip } from "@mantine/core";
import { GameDetailData, OpenDotaPlayer, GameRosterPlayer } from "interfaces/games";
import {
  getHeroDisplayName,
  getHeroHorizontalImageUrl,
  getPlayerNickname,
  matchRosterPlayer,
  getAbilityInfo,
} from "helpers/dota";

interface GameAbilityBuildBoardProps {
  game: GameDetailData;
}

interface AbilityBuildPlayer {
  raw: OpenDotaPlayer;
  roster?: GameRosterPlayer;
  nickname: string;
  heroId: number;
  heroDisplayName: string;
  heroImgUrl: string;
  position: number;
  level: number;
  isRadiant: boolean;
  rankTier?: number;
  leaderboardRank?: number | null;
  abilityUpgrades: number[];
}

/**
 * SVG del árbol de talentos imperial con gradientes dorados de Dota 2
 */
function TalentTreeGlyph({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
        <defs>
          <linearGradient
            id="talent_gold_grad_1"
            gradientUnits="userSpaceOnUse"
            x1="-19.9316"
            y1="40.4932"
            x2="2.7414"
            y2="63.1662"
            gradientTransform="matrix(-1 0 0 1 26.8457 0)"
          >
            <stop offset="0.1257" stopColor="rgb(231, 189, 118)" />
            <stop offset="0.2466" stopColor="rgb(212, 142, 78)" />
            <stop offset="0.3803" stopColor="rgb(201, 108, 53)" />
            <stop offset="0.8908" stopColor="rgb(201, 109, 52)" />
            <stop offset="0.9891" stopColor="rgb(229, 185, 114)" />
          </linearGradient>
          <linearGradient
            id="talent_gold_grad_2"
            gradientUnits="userSpaceOnUse"
            x1="-21.8032"
            y1="28.7007"
            x2="8.0713"
            y2="58.5753"
            gradientTransform="matrix(-1 0 0 1 27.5703 0)"
          >
            <stop offset="0.0938" stopColor="rgb(231, 189, 118)" />
            <stop offset="0.3301" stopColor="rgb(201, 108, 53)" />
            <stop offset="0.7888" stopColor="rgb(217, 154, 89)" />
            <stop offset="1" stopColor="rgb(242, 214, 139)" />
          </linearGradient>
          <linearGradient
            id="talent_gold_grad_l1"
            gradientUnits="userSpaceOnUse"
            x1="-43.2212"
            y1="40.4932"
            x2="-20.5475"
            y2="63.1668"
            gradientTransform="matrix(1 0 0 1 47.457 0)"
          >
            <stop offset="0.1257" stopColor="rgb(231, 189, 118)" />
            <stop offset="0.3335" stopColor="rgb(204, 117, 59)" />
            <stop offset="0.8908" stopColor="rgb(201, 109, 52)" />
            <stop offset="1" stopColor="rgb(242, 214, 139)" />
          </linearGradient>
        </defs>
        <svg viewBox="0 0 51 63" height="23" y="4.45" style={{ width: "100%", height: "100%" }}>
          <path
            fill="url(#talent_gold_grad_1)"
            d="M51,44.716c0,0-6.586,6.584-9.823,6.805c-3.235,0.224-7.032,0-7.032,0s-7.024,1.732-7.024,7.368V63 l-3.195-0.014c0,0,0-3.782,0-5.571c0-6.857,10.052-7.567,10.052-7.567S39.057,41.979,51,44.716z"
          />
          <path
            fill="url(#talent_gold_grad_2)"
            d="M51,30.326c0,0-5.745,9.07-9.517,9.495c-3.1,0.348-6.542,0.107-8.12,0.262 c-3.069,0.301-6.257,1.351-6.257,5.667V63h-3.182c0,0,0-17.488,0-18.454c0-0.964,0.006-5.235,7.093-6.584 c1.208-0.232,3.688-0.281,4.913-0.281C35.931,37.681,40.451,29.951,51,30.326z"
          />
          <path
            fill="url(#talent_gold_grad_2)"
            d="M0,30.326c0,0,5.744,9.07,9.516,9.495c3.1,0.348,6.542,0.107,8.122,0.262 c3.068,0.301,6.256,1.351,6.256,5.667V63h3.181c0,0,0-17.488,0-18.454c0-0.964-0.006-5.235-7.093-6.584 c-1.207-0.232-3.687-0.281-4.913-0.281C15.068,37.681,10.547,29.951,0,30.326z"
          />
          <path
            fill="url(#talent_gold_grad_1)"
            d="M46.969,16.042c0,0-0.669,3.435-2.898,6.315c-2.232,2.878-4.147,4.891-6.489,4.891 c-2.344,0-6.208-0.01-7.68,0.868c-1.837,1.095-2.803,3.213-2.803,5.373c0,0.976,0,29.511,0,29.511h-3.174V33.489 c0,0,0.086-3.859,3.103-6.426c1.651-1.405,2.911-2.141,5.295-2.141c0.907,0,2.041-0.019,2.041-0.019s1.785-4.153,5.187-6.203 C42.954,16.651,46.969,16.042,46.969,16.042z"
          />
          <path
            fill="url(#talent_gold_grad_1)"
            d="M4.031,16.042c0,0,0.669,3.435,2.899,6.315c2.232,2.878,4.147,4.891,6.489,4.891 c2.344,0,6.208-0.01,7.68,0.868c1.837,1.095,2.803,3.213,2.803,5.373c0,0.976,0,29.511,0,29.511h3.173V33.489 c0,0-0.085-3.859-3.102-6.426c-1.651-1.405-2.911-2.141-5.294-2.141c-0.908,0-2.041-0.019-2.041-0.019s-1.785-4.153-5.188-6.203 C8.046,16.651,4.031,16.042,4.031,16.042z"
          />
          <path
            fill="url(#talent_gold_grad_2)"
            d="M39.967,0c0,0,0.803,7.891-2.625,11.654c-3.426,3.761-5.551,2.683-7.765,3.097 c-1.969,0.369-2.479,1.772-2.479,3.984c0,2.212,0,44.209,0,44.209h-3.101c0,0-0.073-43.305-0.073-44.209 c0-0.905,0.02-4.906,3.793-6.115c1.592-0.509,2.335-0.376,2.917-2.293C31.218,8.408,33.04,1.99,39.967,0z"
          />
          <path
            fill="url(#talent_gold_grad_2)"
            d="M11.033,0c0,0-0.802,7.891,2.625,11.654c3.426,3.761,5.55,2.683,7.765,3.097 c1.969,0.369,2.479,1.772,2.479,3.984c0,2.212,0,44.209,0,44.209h3.101c0,0,0.072-43.305,0.072-44.209 c0-0.905-0.019-4.906-3.792-6.115c-1.592-0.509-2.334-0.376-2.918-2.293C19.782,8.408,17.96,1.99,11.033,0z"
          />
          <path
            fill="url(#talent_gold_grad_l1)"
            d="M0.013,44.716c0,0,6.586,6.584,9.823,6.805c3.236,0.224,7.033,0,7.033,0s7.024,1.732,7.024,7.368V63 l3.195-0.014c0,0,0-3.782,0-5.571c0-6.857-10.053-7.567-10.053-7.567S11.957,41.979,0.013,44.716z"
          />
        </svg>
        <path
          d="M3.258 23.38c.295-.22.624-.303.992-.238.362.057.651.235.868.536.217.3.298.634.243 1.002-.05.376-.225.67-.52.891a1.24 1.24 0 01-1.002.244 1.275 1.275 0 01-.868-.535 1.315 1.315 0 01-.242-1.002c.05-.377.225-.671.529-.898z"
          fill="hsla(43,74%,60%,0.6)"
        />
        <path
          d="M6.244 26.987c.215-.301.503-.482.873-.534.361-.06.69.02.988.24.297.218.474.51.532.878.067.374-.012.708-.227 1.01-.221.31-.51.491-.88.544a1.263 1.263 0 01-.987-.24 1.302 1.302 0 01-.533-.879 1.291 1.291 0 01.234-1.019z"
          fill="hsla(43,74%,60%,0.6)"
        />
        <path
          d="M10.17 29.492c.114-.355.333-.617.669-.783a1.26 1.26 0 011.012-.082c.349.115.607.338.773.669.177.335.204.677.091 1.032a1.27 1.27 0 01-.671.793 1.26 1.26 0 01-1.012.082 1.284 1.284 0 01-.774-.669 1.294 1.294 0 01-.087-1.042z"
          fill="hsla(43,74%,60%,0.6)"
        />
        <path
          d="M14.684 30.638c0-.373.129-.69.398-.954.258-.264.57-.396.938-.396.366 0 .68.13.938.393.27.262.4.58.4.953.002.383-.127.701-.397.965a1.268 1.268 0 01-.937.396c-.367 0-.68-.13-.939-.393-.27-.263-.4-.58-.4-.964z"
          fill="hsla(43,74%,60%,0.6)"
        />
        <path
          d="M19.302 30.322a1.287 1.287 0 01.09-1.032c.165-.331.423-.555.771-.67a1.26 1.26 0 011.013.08c.336.166.556.428.67.782.116.365.09.708-.087 1.043a1.284 1.284 0 01-.772.67 1.26 1.26 0 01-1.013-.08 1.27 1.27 0 01-.672-.793z"
          fill="hsla(43,74%,60%,0.6)"
        />
        <path
          d="M23.614 28.564a1.284 1.284 0 01-.23-1.01c.058-.367.234-.66.53-.88.297-.219.626-.3.988-.241.37.051.659.231.874.532.223.31.302.645.236 1.019-.057.367-.234.66-.53.88-.297.219-.626.3-.988.241a1.252 1.252 0 01-.88-.541z"
          fill="hsla(43,74%,60%,0.6)"
        />
        <path
          d="M27.184 25.537a1.272 1.272 0 01-.523-.89 1.316 1.316 0 01.24-1.002c.215-.302.504-.48.866-.538.368-.067.697.015.993.234.305.226.481.52.531.896.057.368-.023.702-.239 1.003-.216.301-.505.48-.866.538a1.24 1.24 0 01-1.002-.241z"
          fill="hsla(43,74%,60%,0.6)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.974 21.886a15.733 15.733 0 01-1.307-6.302C.667 6.983 7.537 0 16 0c8.463 0 15.333 6.983 15.333 15.584 0 2.226-.46 4.343-1.288 6.259a3.35 3.35 0 00-.942-.549 14.626 14.626 0 001.152-5.71c0-7.996-6.387-14.488-14.255-14.488-7.867 0-14.255 6.492-14.255 14.488 0 2.042.417 3.986 1.169 5.75a3.36 3.36 0 00-.94.552z"
          fill="hsla(43,74%,60%,0.4)"
        />
      </svg>
    </div>
  );
}

function getRankText(rankTier?: number | null, leaderboardRank?: number | null): string {
  if (leaderboardRank) {
    return `Immortal #${leaderboardRank}`;
  }
  if (!rankTier) return "Immortal";
  const tier = Math.floor(rankTier / 10);
  switch (tier) {
    case 8:
      return "Immortal";
    case 7:
      return "Divine";
    case 6:
      return "Ancient";
    case 5:
      return "Legend";
    case 4:
      return "Archon";
    case 3:
      return "Crusader";
    case 2:
      return "Guardian";
    case 1:
      return "Herald";
    default:
      return "Immortal";
  }
}

export function GameAbilityBuildBoard({ game }: GameAbilityBuildBoardProps) {
  const [radiantCollapsed, setRadiantCollapsed] = useState(false);
  const [direCollapsed, setDireCollapsed] = useState(false);

  const opendotaPlayers = game.opendota_data?.players || [];

  const processTeamPlayers = (isRadiantTarget: boolean): AbilityBuildPlayer[] => {
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
        const heroId = p.hero_id;
        const heroDisplayName = getHeroDisplayName(heroId);
        const heroImgUrl = getHeroHorizontalImageUrl(heroId);
        const position = roster?.competitive_position || p.lane_role || p.position_est || idx + 1;
        const abilityUpgrades = p.ability_upgrades_arr || [];

        return {
          raw: p,
          roster,
          nickname,
          heroId,
          heroDisplayName,
          heroImgUrl,
          position,
          level: p.level || abilityUpgrades.length || 1,
          isRadiant: isRadiantTarget,
          rankTier: p.rank_tier,
          leaderboardRank: p.leaderboard_rank || p.stratz_metadata?.seasonLeaderboardRank,
          abilityUpgrades,
        };
      })
      .sort((a, b) => a.position - b.position);
  };

  const radiantPlayers = processTeamPlayers(true);
  const direPlayers = processTeamPlayers(false);

  // Niveles del 1 al 25 estándar de Dota 2
  const levelCols = Array.from({ length: 25 }, (_, i) => i + 1);

  const radiantTeamName = game.radiant_team?.name || "Radiant";
  const direTeamName = game.dire_team?.name || "Dire";

  return (
    <div className="space-y-6 w-full">
      {/* ======================================================== */}
      {/* EQUIPO RADIANT                                           */}
      {/* ======================================================== */}
      <div className="relative border border-[#2d261e] bg-[#120f0c] shadow-2xl overflow-hidden">
        {/* Esquinas imperiales doradas */}
        <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />

        {/* Header de Radiant */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#2d261e] bg-[#16120d]">
          <div className="flex items-center gap-3">
            {game.radiant_team?.logo_url ? (
              <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded border border-emerald-500/40 bg-black/60 overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-sm">
                <picture>
                  <img
                    src={game.radiant_team.logo_url}
                    alt={radiantTeamName}
                    className="w-full h-full object-contain"
                  />
                </picture>
              </div>
            ) : null}
            <span className="flex items-center justify-center w-5 h-5 bg-emerald-500/20 text-emerald-400 font-chakra font-bold text-[10px] border border-emerald-500/40 shrink-0">
              R
            </span>
            <h3 className="text-sm sm:text-base font-chakra font-black tracking-wide text-white uppercase flex items-center gap-2">
              <span>{radiantTeamName}</span>
              <span className="text-[#8e857b] font-normal">-</span>
              <span className="text-[#d8b467]">Ability Build</span>
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setRadiantCollapsed(!radiantCollapsed)}
            className="flex items-center gap-1.5 text-xs font-chakra font-bold text-[#8e857b] hover:text-[#f0d38f] transition-colors cursor-pointer uppercase tracking-wider"
          >
            <span>{radiantCollapsed ? "SHOW" : "HIDE"}</span>
            {radiantCollapsed ? <IconPlus size={14} /> : <IconMinus size={14} />}
          </button>
        </div>

        {/* Tabla de Habilidades Radiant */}
        {!radiantCollapsed && (
          <div>
            <div className="sm:hidden px-4 py-1.5 bg-[#14100c] border-b border-[#241e17] text-[10px] font-chakra text-[#8e857b] flex items-center justify-between">
              <span>Desliza para ver los 25 niveles ➔</span>
              <span className="text-[#d8b467] font-bold">Nvl 1 - 25</span>
            </div>
            <div className="overflow-x-auto select-none no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="border-b border-[#241e17] bg-[#15100c] text-[10px] sm:text-[11px] font-chakra text-[#8e857b] uppercase tracking-wider">
                    <th className="py-2.5 px-3 sm:px-4 font-bold min-w-[170px] sm:min-w-[200px] w-[180px] sm:w-[220px] sticky left-0 bg-[#15100c] z-20 shadow-[2px_0_6px_rgba(0,0,0,0.6)]">PLAYER</th>
                    {levelCols.map((lvl) => (
                      <th key={`rad-head-lvl-${lvl}`} className="py-2.5 px-1 text-center font-bold w-8 sm:w-9">
                        {lvl}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1913]">
                  {radiantPlayers.map((player) => (
                    <AbilityBuildRow
                      key={`rad-build-${player.heroId}-${player.position}`}
                      player={player}
                      levelCols={levelCols}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* EQUIPO DIRE                                              */}
      {/* ======================================================== */}
      <div className="relative border border-[#2d261e] bg-[#120f0c] shadow-2xl overflow-hidden">
        {/* Esquinas imperiales doradas */}
        <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />

        {/* Header de Dire */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#2d261e] bg-[#16120d]">
          <div className="flex items-center gap-3">
            {game.dire_team?.logo_url ? (
              <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded border border-rose-500/40 bg-black/60 overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-sm">
                <picture>
                  <img
                    src={game.dire_team.logo_url}
                    alt={direTeamName}
                    className="w-full h-full object-contain"
                  />
                </picture>
              </div>
            ) : null}
            <span className="flex items-center justify-center w-5 h-5 bg-rose-500/20 text-rose-400 font-chakra font-bold text-[10px] border border-rose-500/40 shrink-0">
              D
            </span>
            <h3 className="text-sm sm:text-base font-chakra font-black tracking-wide text-white uppercase flex items-center gap-2">
              <span>{direTeamName}</span>
              <span className="text-[#8e857b] font-normal">-</span>
              <span className="text-[#d8b467]">Ability Build</span>
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setDireCollapsed(!direCollapsed)}
            className="flex items-center gap-1.5 text-xs font-chakra font-bold text-[#8e857b] hover:text-[#f0d38f] transition-colors cursor-pointer uppercase tracking-wider"
          >
            <span>{direCollapsed ? "SHOW" : "HIDE"}</span>
            {direCollapsed ? <IconPlus size={14} /> : <IconMinus size={14} />}
          </button>
        </div>

        {/* Tabla de Habilidades Dire */}
        {!direCollapsed && (
          <div>
            <div className="sm:hidden px-4 py-1.5 bg-[#14100c] border-b border-[#241e17] text-[10px] font-chakra text-[#8e857b] flex items-center justify-between">
              <span>Desliza para ver los 25 niveles ➔</span>
              <span className="text-[#d8b467] font-bold">Nvl 1 - 25</span>
            </div>
            <div className="overflow-x-auto select-none no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="border-b border-[#241e17] bg-[#15100c] text-[10px] sm:text-[11px] font-chakra text-[#8e857b] uppercase tracking-wider">
                    <th className="py-2.5 px-3 sm:px-4 font-bold min-w-[170px] sm:min-w-[200px] w-[180px] sm:w-[220px] sticky left-0 bg-[#15100c] z-20 shadow-[2px_0_6px_rgba(0,0,0,0.6)]">PLAYER</th>
                    {levelCols.map((lvl) => (
                      <th key={`dire-head-lvl-${lvl}`} className="py-2.5 px-1 text-center font-bold w-8 sm:w-9">
                        {lvl}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1913]">
                  {direPlayers.map((player) => (
                    <AbilityBuildRow
                      key={`dire-build-${player.heroId}-${player.position}`}
                      player={player}
                      levelCols={levelCols}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Fila de un jugador con sus 25 slots de habilidades/talentos
 */
function AbilityBuildRow({
  player,
  levelCols,
}: {
  player: AbilityBuildPlayer;
  levelCols: number[];
}) {
  const isRadiant = player.isRadiant;
  const rankLabel = getRankText(player.rankTier, player.leaderboardRank);

  return (
    <tr className="hover:bg-[#18130e]/80 transition-colors">
      {/* Columna de Jugador (Avatar de Héroe + Nickname + Rango) */}
      <td className="py-2.5 px-3 sm:px-4 sticky left-0 bg-[#120f0c] z-10 shadow-[2px_0_6px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3">
          {/* Avatar del Héroe */}
          <div
            className={`relative w-11 h-7 rounded border shrink-0 overflow-hidden shadow-sm ${
              isRadiant ? "border-emerald-500/40" : "border-rose-500/40"
            }`}
          >
            <picture>
              <img
                src={player.heroImgUrl}
                alt={player.heroDisplayName}
                className="w-full h-full object-cover"
              />
            </picture>
          </div>

          {/* Info del Gladiador */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 max-w-[150px] truncate">
              <IconUsers size={12} className="text-[#4dabf7] shrink-0" />
              {player.roster && (
                <IconCircleCheckFilled size={12} className="text-[#d8b467] shrink-0" />
              )}
              <span className="font-chakra font-bold text-xs text-white truncate group-hover:text-[#f0d38f] transition-colors">
                {player.nickname}
              </span>
              <IconChevronRight size={11} className="text-[#6e6659] shrink-0" />
            </div>

            <div className="flex items-center gap-1 text-[10px] font-chakra text-[#9e9485] font-medium">
              <IconTrophy size={10} className="text-[#d8b467] shrink-0" />
              <span className="truncate">{rankLabel}</span>
            </div>
          </div>
        </div>
      </td>

      {/* 25 Niveles de Habilidades / Talentos */}
      {levelCols.map((lvl) => {
        const abilityId = player.abilityUpgrades[lvl - 1];

        if (!abilityId) {
          return (
            <td key={`slot-${player.heroId}-${lvl}`} className="py-2 px-1 text-center align-middle">
              <div className="w-7 h-7 sm:w-8 sm:h-8 mx-auto flex items-center justify-center">
                {lvl <= player.level && (
                  <span className="w-1 h-1 rounded-full bg-[#352c22]" />
                )}
              </div>
            </td>
          );
        }

        const ability = getAbilityInfo(abilityId);

        return (
          <td key={`slot-${player.heroId}-${lvl}`} className="py-2 px-1 text-center align-middle">
            <div className="w-7 h-7 sm:w-8 sm:h-8 mx-auto flex items-center justify-center">
              {ability.isTalent ? (
                /* Icono de Árbol de Talentos Imperial */
                <Tooltip
                  label={
                    <div className="py-1 px-1.5 text-center">
                      <div className="font-chakra font-bold text-xs text-[#f0d38f]">
                        {ability.displayName}
                      </div>
                      <div className="text-[10px] text-[#9e9485] font-chakra mt-0.5">
                        Nivel {lvl} • Talento
                      </div>
                    </div>
                  }
                  color="#15100c"
                  withArrow
                  position="top"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#d8b467]/50 bg-[#16110c] flex items-center justify-center relative hover:border-[#d8b467] hover:scale-105 hover:shadow-[0_0_12px_rgba(216,180,103,0.35)] transition-all cursor-pointer">
                    <TalentTreeGlyph className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                </Tooltip>
              ) : (
                /* Icono de Habilidad Regular */
                <Tooltip
                  label={
                    <div className="py-1 px-1.5 text-center">
                      <div className="font-chakra font-bold text-xs text-white">
                        {ability.displayName}
                      </div>
                      <div className="text-[10px] text-[#9e9485] font-chakra mt-0.5">
                        Nivel {lvl} • Habilidad
                      </div>
                    </div>
                  }
                  color="#15100c"
                  withArrow
                  position="top"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-[#2d261e] bg-[#18130e] overflow-hidden flex items-center justify-center hover:border-[#d8b467]/80 hover:scale-105 transition-all shadow-sm cursor-pointer">
                    {ability.imgUrl ? (
                      <picture>
                        <img
                          src={ability.imgUrl}
                          alt={ability.displayName}
                          className="w-full h-full object-cover"
                        />
                      </picture>
                    ) : (
                      <span className="text-[9px] font-chakra font-bold text-[#d8b467]">
                        {lvl}
                      </span>
                    )}
                  </div>
                </Tooltip>
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );
}
