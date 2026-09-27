"use client";

import React from "react";
import Link from "next/link";
import {
  IconShieldCheck,
  IconCrown,
} from "@tabler/icons-react";
import {
  GameDetailData,
  OpenDotaPlayer,
  OpenDotaPickBan,
  GameRosterPlayer,
} from "interfaces/games";
import {
  getHeroHorizontalImageUrl,
  getItemImageUrl,
  getItemDisplayName,
  getPlayerNeutralItem,
  getPlayerBearItems,
  getRankMedalUrl,
  matchRosterPlayer,
  getPlayerNickname,
  BUFF_IMAGES,
  getGameMvpPlayer,
} from "helpers/dota";

interface GameTeamOverviewBoardProps {
  game: GameDetailData;
}

interface TeamTablePlayer {
  raw: OpenDotaPlayer;
  roster?: GameRosterPlayer;
  nickname: string;
  playerSlug?: string;
  heroId: number;
  heroImgUrl: string;
  position: number;
  level: number;
  kills: number;
  deaths: number;
  assists: number;
  lastHits: number;
  denies: number;
  netWorth: number;
  gpm: number;
  xpm: number;
  heroDamage: number;
  towerDamage: number;
  heroHealing: number;
  items: (number | undefined)[];
  backpack: (number | undefined)[];
  neutralItemKey?: string | number;
  bearItems?: (number | undefined)[] | null;
  hasScepter: boolean;
  hasShard: boolean;
  hasMoonshard: boolean;
  isMvp: boolean;
  rankTier?: number;
}

function formatK(val?: number | null): string {
  if (val == null || isNaN(val) || val === 0) return "-";
  if (val >= 1000000) {
    return `${(val / 1000000).toFixed(1)}M`;
  }
  if (val >= 1000) {
    const kVal = val / 1000;
    return kVal >= 100 ? `${Math.round(kVal)}k` : `${kVal.toFixed(1)}k`;
  }
  return val.toString();
}

function formatStat(val?: number | null): string {
  if (val == null || isNaN(val) || val === 0) return "-";
  return formatK(val);
}

export function GameTeamOverviewBoard({ game }: GameTeamOverviewBoardProps) {
  const opendotaPlayers = game.opendota_data?.players || [];
  const picksBans = game.opendota_data?.picks_bans || [];

  const radiantWon = Boolean(
    (game.winner_slug && game.radiant_team?.slug && game.winner_slug === game.radiant_team.slug) ||
    game.opendota_data?.radiant_win === true
  );
  const direWon = Boolean(
    (game.winner_slug && game.dire_team?.slug && game.winner_slug === game.dire_team.slug) ||
    game.opendota_data?.radiant_win === false
  );
  const mvpPlayer = getGameMvpPlayer(game);

  // Procesar jugadores de ambos bandos
  const processTeamPlayers = (isRadiantTarget: boolean): TeamTablePlayer[] => {
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
      const heroImgUrl = getHeroHorizontalImageUrl(heroId);
      const position = roster?.competitive_position || p.lane_role || p.position_est || idx + 1;
      const isMvp = mvpPlayer
        ? p.player_slot === mvpPlayer.player_slot
        : (p.award === "MVP" || p.stratz_metadata?.award === "MVP");

      const items = [p.item_0, p.item_1, p.item_2, p.item_3, p.item_4, p.item_5];
      const backpack = [p.backpack_0, p.backpack_1, p.backpack_2];
      const neutralItemKey = getPlayerNeutralItem(p);
      const bearItems = getPlayerBearItems(p);

      const hasScepter = Boolean(p.aghanims_scepter === 1);
      const hasShard = Boolean(p.aghanims_shard === 1);
      const hasMoonshard = Boolean(p.moonshard === 1);

      return {
        raw: p,
        roster,
        nickname,
        playerSlug,
        heroId,
        heroImgUrl,
        position,
        level: p.level || 1,
        kills: p.kills || 0,
        deaths: p.deaths || 0,
        assists: p.assists || 0,
        lastHits: p.last_hits || 0,
        denies: p.denies || 0,
        netWorth: p.net_worth || 0,
        gpm: p.gold_per_min || 0,
        xpm: p.xp_per_min || 0,
        heroDamage: p.hero_damage || 0,
        towerDamage: p.tower_damage || 0,
        heroHealing: p.hero_healing || 0,
        items,
        backpack,
        neutralItemKey,
        bearItems,
        hasScepter,
        hasShard,
        hasMoonshard,
        isMvp,
        rankTier: p.rank_tier,
      };
    }).sort((a, b) => a.position - b.position);
  };

  const radiantPlayers = processTeamPlayers(true);
  const direPlayers = processTeamPlayers(false);

  // Extraer picks y bans para cada bando
  // En OpenDota: team 0 = Radiant, team 1 = Dire
  const getTeamDraft = (teamIndex: number, heroFallbackList: number[]) => {
    if (picksBans && picksBans.length > 0) {
      const teamItems = picksBans.filter((pb) => pb.team === teamIndex);
      if (teamItems.length > 0) {
        return teamItems.sort((a, b) => a.order - b.order);
      }
    }
    // Fallback con los picks de los héroes si picks_bans no está disponible
    return heroFallbackList.map((hId, i) => ({
      is_pick: true,
      hero_id: hId,
      team: teamIndex,
      order: i * 2 + (teamIndex === 0 ? 1 : 2),
    }));
  };

  const radiantDraft = getTeamDraft(0, radiantPlayers.map((p) => p.heroId));
  const direDraft = getTeamDraft(1, direPlayers.map((p) => p.heroId));

  return (
    <div className="w-full space-y-10 pt-4">
      {/* 1. EQUIPO RADIANT OVERVIEW */}
      <TeamOverviewCard
        teamName={game.radiant_team?.name || "The Radiant"}
        teamSlug={game.radiant_team?.slug}
        isWinner={radiantWon}
        players={radiantPlayers}
        draftSequence={radiantDraft}
        isRadiant={true}
      />

      {/* 2. EQUIPO DIRE OVERVIEW */}
      <TeamOverviewCard
        teamName={game.dire_team?.name || "The Dire"}
        teamSlug={game.dire_team?.slug}
        isWinner={direWon}
        players={direPlayers}
        draftSequence={direDraft}
        isRadiant={false}
      />
    </div>
  );
}

interface TeamOverviewCardProps {
  teamName: string;
  teamSlug?: string;
  isWinner: boolean;
  players: TeamTablePlayer[];
  draftSequence: OpenDotaPickBan[];
  isRadiant: boolean;
}

function TeamOverviewCard({
  teamName,
  teamSlug,
  isWinner,
  players,
  draftSequence,
  isRadiant,
}: TeamOverviewCardProps) {
  const totals = {
    level: players.reduce((acc, p) => acc + p.level, 0),
    kills: players.reduce((acc, p) => acc + p.kills, 0),
    deaths: players.reduce((acc, p) => acc + p.deaths, 0),
    assists: players.reduce((acc, p) => acc + p.assists, 0),
    lastHits: players.reduce((acc, p) => acc + p.lastHits, 0),
    denies: players.reduce((acc, p) => acc + p.denies, 0),
    netWorth: players.reduce((acc, p) => acc + p.netWorth, 0),
    gpm: players.reduce((acc, p) => acc + p.gpm, 0),
    xpm: players.reduce((acc, p) => acc + p.xpm, 0),
    heroDamage: players.reduce((acc, p) => acc + p.heroDamage, 0),
    towerDamage: players.reduce((acc, p) => acc + p.towerDamage, 0),
    heroHealing: players.reduce((acc, p) => acc + p.heroHealing, 0),
  };

  return (
    <div
      className={`border ${
        isRadiant ? "border-[#24352b]" : "border-[#382222]"
      } bg-[#120f0c] shadow-2xl relative`}
    >
      {/* Esquinas imperiales doradas */}
      <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
      <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />

      {/* Header del Bloque del Equipo */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#2d261e] bg-[#16120d]">
        <div className="flex items-center gap-3">
          <h3 className="text-base sm:text-lg font-chakra font-black text-white uppercase tracking-wider">
            {teamSlug ? (
              <Link href={`/teams/${teamSlug}`} className="hover:text-[#d8b467] transition-colors">
                {teamName}
              </Link>
            ) : (
              teamName
            )}{" "}
            - <span className="text-[#a89f91] font-bold">Overview</span>
          </h3>
          {isWinner && (
            <span className="px-2.5 py-0.5 border border-[#00e599] bg-[#00e599]/15 text-[#00e599] text-[10px] font-chakra font-black tracking-widest uppercase shadow-[0_0_12px_rgba(0,229,153,0.2)]">
              WINNER
            </span>
          )}
        </div>
      </div>

      {/* Indicador de scroll táctil en móvil */}
      <div className="sm:hidden px-4 py-1.5 bg-[#14100c] border-b border-[#241e17] text-[10px] font-chakra text-[#8e857b] flex items-center justify-between">
        <span>Desliza para ver estadísticas ➔</span>
        <span className="text-[#d8b467] font-bold">14 columnas</span>
      </div>

      {/* Tabla detallada del equipo */}
      <div className="overflow-x-auto select-none">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-[#241e17] text-[10px] text-[#8e857b] uppercase font-chakra tracking-wider bg-[#14100c]">
              <th className="py-2.5 px-2.5 sm:px-3 font-bold min-w-[150px] sm:min-w-[170px] sticky left-0 bg-[#14100c] z-20 shadow-[2px_0_6px_rgba(0,0,0,0.6)]">PLAYER</th>
              <th className="py-2.5 px-1 text-center font-bold w-9 sm:w-10">POS</th>
              <th className="py-2.5 px-1 text-center font-bold w-9 sm:w-10">LVL</th>
              <th className="py-2.5 px-1 text-center font-bold w-8 text-[#00e599]">K</th>
              <th className="py-2.5 px-1 text-center font-bold w-8 text-[#ff6b6b]">D</th>
              <th className="py-2.5 px-1 text-center font-bold w-8 text-[#d8d2c7]">A</th>
              <th className="py-2.5 px-1.5 text-center font-bold min-w-[65px] sm:min-w-[75px]">LH / DN</th>
              <th className="py-2.5 px-1.5 text-right font-bold text-[#f0d38f] min-w-[50px] sm:min-w-[58px]">NET</th>
              <th className="py-2.5 px-1.5 text-center font-bold min-w-[70px] sm:min-w-[80px]">GPM / XPM</th>
              <th className="py-2.5 px-1.5 text-right font-bold min-w-[50px] sm:min-w-[58px]">HD</th>
              <th className="py-2.5 px-1.5 text-right font-bold min-w-[42px] sm:min-w-[50px]">TD</th>
              <th className="py-2.5 px-1.5 text-right font-bold min-w-[40px] sm:min-w-[48px]">HH</th>
              <th className="py-2.5 px-2 sm:px-2.5 font-bold min-w-[210px] sm:min-w-[230px]">ITEMS</th>
              <th className="py-2.5 px-1.5 text-center font-bold w-14 sm:w-16 min-w-[52px]">BUFFS</th>
            </tr>
          </thead>

          <tbody>
            {players.map((player) => (
              <PlayerTableRow key={`row-${player.heroId}-${player.position}`} player={player} />
            ))}
          </tbody>

          {/* Fila de Totales de la Tabla */}
          <tfoot>
            <tr className="border-t border-[#2d261e] bg-[#16120e] text-[#d8d2c7] font-chakra font-bold text-xs">
              <td className="py-2.5 px-2.5 sm:px-3 sticky left-0 bg-[#16120e] z-10 shadow-[2px_0_6px_rgba(0,0,0,0.6)]">
                <span className="text-white font-chakra font-black uppercase tracking-wider text-[11px]">Total</span>
              </td>
              <td className="py-2.5 px-1 text-center text-[#8e857b]"></td>
              <td className="py-2.5 px-1 text-center text-white">{totals.level}</td>
              <td className="py-2.5 px-1 text-center text-[#00e599] font-black">{totals.kills}</td>
              <td className="py-2.5 px-1 text-center text-[#ff6b6b] font-black">{totals.deaths}</td>
              <td className="py-2.5 px-1 text-center text-white">{totals.assists}</td>
              <td className="py-2.5 px-1.5 text-center font-mono text-[10px] sm:text-[11px] text-[#b5ada1] whitespace-nowrap">
                {formatK(totals.lastHits)} / {totals.denies}
              </td>
              <td className="py-2.5 px-1.5 text-right text-[#f0d38f] font-black whitespace-nowrap">
                {formatK(totals.netWorth)}
              </td>
              <td className="py-2.5 px-1.5 text-center font-mono text-[10px] sm:text-[11px] text-[#b5ada1] whitespace-nowrap">
                {formatK(totals.gpm)} / {formatK(totals.xpm)}
              </td>
              <td className="py-2.5 px-1.5 text-right text-white font-black whitespace-nowrap">{formatK(totals.heroDamage)}</td>
              <td className="py-2.5 px-1.5 text-right text-[#d8d2c7] whitespace-nowrap">{formatK(totals.towerDamage)}</td>
              <td className="py-2.5 px-1.5 text-right text-emerald-400 whitespace-nowrap">
                {totals.heroHealing > 0 ? formatK(totals.heroHealing) : "-"}
              </td>
              <td className="py-2.5 px-2" colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Fila de Picks y Bans al pie de la tabla (secuencia completa) */}
      <div className="border-t border-[#241e17] bg-[#0e0c09] p-3 sm:px-6 sm:py-3.5">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          {draftSequence.map((item, idx) => (
            <PickBanCard key={`draft-${item.hero_id}-${idx}-${item.order}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Subcomponente: Fila de jugador en la tabla
function PlayerTableRow({ player }: { player: TeamTablePlayer }) {
  const medalUrl = getRankMedalUrl(player.rankTier);

  return (
    <tr className="border-b border-[#1f1a14] hover:bg-[#18140f]/80 transition-colors">
      {/* 1. PLAYER: Héroe + Nickname + Verified Check + Immortal + MVP */}
      <td className="py-2 px-2.5 sm:px-3 sticky left-0 bg-[#120f0c] z-10 shadow-[2px_0_6px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Avatar de héroe */}
          <div className="relative w-8 h-5.5 sm:w-9 sm:h-6 overflow-hidden border border-[#2d261e] shrink-0 bg-black/50">
            <picture>
              <img
                src={player.heroImgUrl}
                alt="Hero"
                className="w-full h-full object-cover"
              />
            </picture>
          </div>

          {/* Info del jugador */}
          <div className="flex flex-col min-w-0 max-w-[95px] sm:max-w-[115px]">
            <div className="flex items-center gap-1 truncate">
              {/* Laurel / Verified check */}
              <IconShieldCheck size={11} className="text-[#d8b467] shrink-0 fill-[#d8b467]/20" />
              {player.playerSlug ? (
                <Link
                  href={`/players/${encodeURIComponent(player.playerSlug)}`}
                  className="font-chakra font-bold text-white text-[11px] sm:text-xs truncate uppercase tracking-tight hover:text-[#d8b467] transition-colors"
                >
                  {player.nickname}
                </Link>
              ) : (
                <span className="font-chakra font-bold text-white text-[11px] sm:text-xs truncate uppercase tracking-tight">
                  {player.nickname}
                </span>
              )}
              {player.isMvp && (
                <span className="inline-flex items-center gap-0.5 px-0.5 py-0.2 border border-[#d8b467] bg-[#221a0f] text-[#f0d38f] text-[8px] font-chakra font-black uppercase shrink-0">
                  <IconCrown size={8} className="stroke-[2.5]" />
                  <span>MVP</span>
                </span>
              )}
            </div>

            {/* Rango */}
            <div className="flex items-center gap-1 mt-0.5">
              <picture>
                <img src={medalUrl} alt="Rank" className="w-3 h-3 object-contain opacity-80" />
              </picture>
              <span className="text-[9px] font-mono text-[#8e857b]">Immortal</span>
            </div>
          </div>
        </div>
      </td>

      {/* 2. POS */}
      <td className="py-2 px-1 text-center">
        <span className="font-chakra font-bold text-white/80 text-xs">{player.position}</span>
      </td>

      {/* 3. LVL: Caja de nivel afilada */}
      <td className="py-2 px-1 text-center">
        <span className="inline-flex items-center justify-center w-5 h-4.5 sm:w-5.5 sm:h-5 border border-[#3d3328] bg-[#1a140e] text-[10px] sm:text-[11px] font-chakra font-bold text-[#d8d2c7]">
          {player.level}
        </span>
      </td>

      {/* 4. KILLS */}
      <td className="py-2 px-1 text-center font-chakra font-bold text-xs text-[#00e599]">
        {player.kills}
      </td>

      {/* 5. DEATHS */}
      <td className="py-2 px-1 text-center font-chakra font-bold text-xs text-[#ff6b6b]">
        {player.deaths}
      </td>

      {/* 6. ASSISTS */}
      <td className="py-2 px-1 text-center font-chakra font-bold text-xs text-white">
        {player.assists}
      </td>

      {/* 7. LH / DN */}
      <td className="py-2 px-1.5 text-center font-mono text-[10px] sm:text-[11px] text-[#b5ada1] whitespace-nowrap">
        {player.lastHits} <span className="text-[#554b3f]">/</span> {player.denies}
      </td>

      {/* 8. NET: Valor neto dorado */}
      <td className="py-2 px-1.5 text-right font-chakra font-bold text-xs text-[#f0d38f] whitespace-nowrap">
        {formatK(player.netWorth)}
      </td>

      {/* 9. GPM / XPM */}
      <td className="py-2 px-1.5 text-center font-mono text-[10px] sm:text-[11px] text-[#b5ada1] whitespace-nowrap">
        {player.gpm} <span className="text-[#554b3f]">/</span> {player.xpm}
      </td>

      {/* 10. HD */}
      <td className="py-2 px-1.5 text-right font-chakra font-bold text-xs text-white whitespace-nowrap">
        {formatK(player.heroDamage)}
      </td>

      {/* 11. TD */}
      <td className="py-2 px-1.5 text-right font-chakra font-bold text-xs text-[#d8d2c7] whitespace-nowrap">
        {formatStat(player.towerDamage)}
      </td>

      {/* 12. HH */}
      <td className="py-2 px-1.5 text-right font-chakra font-bold text-xs text-emerald-400 whitespace-nowrap">
        {formatStat(player.heroHealing)}
      </td>

      {/* 13. ITEMS: 6 items inventario + 3 backpack + 1 neutral item (+ Oso Espiritual si aplica) */}
      <td className="py-2 px-2 sm:px-2.5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* 6 items principales */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {player.items.map((itemId, idx) => {
                const hasItem = itemId && itemId > 0;
                const imgUrl = hasItem ? getItemImageUrl(itemId) : undefined;
                const dName = hasItem ? getItemDisplayName(itemId) : undefined;
                return (
                  <div
                    key={`inv-${idx}`}
                    className="w-5.5 h-4 sm:w-6.5 sm:h-4.5 bg-[#0a0806] border border-[#2d261e] overflow-hidden flex items-center justify-center shrink-0"
                    title={dName}
                  >
                    {hasItem && imgUrl ? (
                      <picture>
                        <img src={imgUrl} alt={dName || "Item"} className="w-full h-full object-cover" />
                      </picture>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Separador de puntos */}
            <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-[#3d3328]" />

            {/* 3 items de backpack */}
            <div className="flex items-center gap-0.5 sm:gap-1 opacity-70">
              {player.backpack.map((itemId, idx) => {
                const hasItem = itemId && itemId > 0;
                const imgUrl = hasItem ? getItemImageUrl(itemId) : undefined;
                return (
                  <div
                    key={`backpack-${idx}`}
                    className="w-4 h-3 sm:w-4.5 sm:h-3.5 bg-[#080605] border border-white/5 overflow-hidden flex items-center justify-center shrink-0"
                  >
                    {hasItem && imgUrl ? (
                      <picture>
                        <img src={imgUrl} alt="Backpack Item" className="w-full h-full object-cover" />
                      </picture>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Separador de puntos */}
            <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-[#3d3328]" />

            {/* Neutral Item */}
            <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 border border-[#d8b467]/60 bg-[#16120d] overflow-hidden flex items-center justify-center shrink-0">
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

          {/* Fila del Oso Espiritual si tiene items */}
          {player.bearItems && (
            <div className="flex items-center gap-1 sm:gap-1.5 pt-0.5 border-t border-[#d8b467]/25">
              <div className="flex items-center gap-1 text-[8px] font-chakra font-bold text-[#f0d38f] shrink-0" title="Spirit Bear">
                <picture className="w-3 h-3 rounded-xs overflow-hidden inline-block shrink-0 border border-[#d8b467]/60 shadow-[0_0_4px_rgba(216,180,103,0.3)]">
                  <img
                    src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lone_druid_spirit_bear.png"
                    alt="Spirit Bear"
                    className="w-full h-full object-cover"
                  />
                </picture>
                <span className="text-[8px] uppercase tracking-wider text-[#f0d38f]">Oso</span>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {player.bearItems.map((itemId, idx) => {
                  const hasItem = itemId && itemId > 0;
                  const imgUrl = hasItem ? getItemImageUrl(itemId) : undefined;
                  const dName = hasItem ? getItemDisplayName(itemId) : undefined;
                  return (
                    <div
                      key={`bear-inv-${idx}`}
                      className="w-5.5 h-4 sm:w-6.5 sm:h-4.5 bg-[#0e0a06] border border-[#d8b467]/40 overflow-hidden flex items-center justify-center shrink-0 hover:border-[#f0d38f] transition-colors"
                      title={dName ? `Oso: ${dName}` : undefined}
                    >
                      {hasItem && imgUrl ? (
                        <picture>
                          <img src={imgUrl} alt={dName || "Item"} className="w-full h-full object-cover" />
                        </picture>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </td>

      {/* 14. BUFFS: Aghanim's Scepter, Aghanim's Shard, Moon Shard */}
      <td className="py-2 px-1.5 text-center">
        <div className="flex items-center justify-center gap-1">
          {player.hasScepter && (
            <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 border border-[#4dabf7]/60 bg-black/60 overflow-hidden shrink-0" title="Aghanim's Scepter">
              <picture>
                <img src={BUFF_IMAGES.scepter} alt="Scepter" className="w-full h-full object-cover" />
              </picture>
            </div>
          )}
          {player.hasShard && (
            <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 border border-[#74c0fc]/60 bg-black/60 overflow-hidden shrink-0" title="Aghanim's Shard">
              <picture>
                <img src={BUFF_IMAGES.shard} alt="Shard" className="w-full h-full object-cover" />
              </picture>
            </div>
          )}
          {player.hasMoonshard && (
            <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 border border-[#ffd43b]/60 bg-black/60 overflow-hidden shrink-0" title="Moon Shard">
              <picture>
                <img src={BUFF_IMAGES.moonshard} alt="Moon Shard" className="w-full h-full object-cover" />
              </picture>
            </div>
          )}
          {!player.hasScepter && !player.hasShard && !player.hasMoonshard && (
            <span className="text-[#4a4035]">-</span>
          )}
        </div>
      </td>
    </tr>
  );
}

// Subcomponente: Card individual de Pick / Ban en la barra inferior
function PickBanCard({ item }: { item: OpenDotaPickBan }) {
  const isBan = !item.is_pick;
  const heroImgUrl = getHeroHorizontalImageUrl(item.hero_id);

  return (
    <div
      className={`relative flex flex-col items-center w-11 sm:w-12 border ${
        isBan
          ? "border-[#ff4d4d]/40 bg-[#160808]"
          : "border-[#d8b467] bg-[#1a140e] shadow-[0_0_8px_rgba(216,180,103,0.25)]"
      } shrink-0 overflow-hidden`}
    >
      {/* Imagen del Héroe */}
      <div className="relative w-full h-7 sm:h-8 overflow-hidden bg-black/60">
        <picture>
          <img
            src={heroImgUrl}
            alt={`Hero ${item.hero_id}`}
            className={`w-full h-full object-cover ${isBan ? "grayscale contrast-125 brightness-75" : ""}`}
          />
        </picture>

        {/* Si es BAN: diagonal roja tachada */}
        {isBan && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-0.5 bg-[#ff4d4d] rotate-[-40deg] shadow-[0_0_4px_rgba(255,77,77,0.9)]" />
          </div>
        )}
      </div>

      {/* Etiqueta inferior con número de orden */}
      <div
        className={`w-full text-center py-0.5 text-[9px] font-chakra font-black tracking-tight ${
          isBan ? "bg-[#250909] text-[#ff6b6b]" : "bg-[#221708] text-[#f0d38f]"
        }`}
      >
        {isBan ? `BAN ${item.order}` : `PICK ${item.order}`}
      </div>
    </div>
  );
}
