"use client";

import React from "react";
import Link from "next/link";
import {
  IconCrown,
  IconCoins,
  IconSwords,
  IconBuildingCastle,
  IconUsers,
} from "@tabler/icons-react";
import { GameDetailData, OpenDotaPlayer } from "interfaces/games";
import {
  getHeroShortName,
  getHeroDisplayName,
  getHeroVideoUrl,
  getItemImageUrl,
  getItemDisplayName,
  getPlayerNeutralItem,
  getPlayerBearItems,
  matchRosterPlayer,
  getPlayerNickname,
  getGameMvpPlayer,
  calculatePlayerMvpScore,
} from "helpers/dota";

interface GameMvpCardProps {
  game: GameDetailData;
}

function formatNumber(num?: number | null): string {
  if (num == null) return "0";
  return num.toLocaleString("es-ES");
}

function getPlayerRole(player?: OpenDotaPlayer): string {
  if (!player) return "Gladiador";
  const role = player.lane_role || player.position_est;
  switch (role) {
    case 1:
      return "Safe Lane Carry";
    case 2:
      return "Mid Lane";
    case 3:
      return "Offlane";
    case 4:
      return "Soft Support";
    case 5:
      return "Hard Support";
    default:
      return "Core";
  }
}

function getPlayerTagline(player?: OpenDotaPlayer): string {
  if (!player) return "Gladiador Supremo";
  if ((player.tower_damage || 0) > 8000) return '"Asediador Imparable"';
  if ((player.hero_damage || 0) > 30000) return '"Fuerza Devastadora"';
  if ((player.kills || 0) >= 12) return '"Ejecutor Dominante"';
  if ((player.assists || 0) >= 18) return '"Estratega Maestro"';
  if ((player.net_worth || 0) > 22000) return '"Coloso Dorado"';
  return '"Gladiador Supremo"';
}

function getPlayerScore(player?: OpenDotaPlayer): number {
  if (!player) return 95;
  const imp = player.imp ?? player.stratz_metadata?.imp;
  if (imp != null && imp > 0) {
    const kdaRatio = ((player.kills || 0) + (player.assists || 0)) / Math.max(1, player.deaths || 1);
    return Math.min(99, Math.max(75, Math.round(80 + imp * 0.8 + kdaRatio)));
  }
  const mvpScore = calculatePlayerMvpScore(player).totalScore;
  return Math.min(99, Math.max(78, Math.round(75 + (mvpScore / 150) * 24)));
}

export function GameMvpCard({ game }: GameMvpCardProps) {
  // Si la partida está programada, cancelada o no cuenta con datos de jugadores de OpenDota, no mostrar card MVP
  if (
    game.status === "SCHEDULED" ||
    game.status === "CANCELLED" ||
    !game.opendota_data?.players ||
    game.opendota_data.players.length === 0
  ) {
    return null;
  }

  // Buscar jugador MVP explícito o el de mayor rendimiento del equipo GANADOR
  const mvpPlayer: OpenDotaPlayer | undefined = getGameMvpPlayer(game);
  if (!mvpPlayer) {
    return null;
  }

  const radiantWon = Boolean(
    (game.winner_slug && game.radiant_team?.slug && game.winner_slug === game.radiant_team.slug) ||
    game.opendota_data?.radiant_win === true
  );

  // Si no hay jugador de OpenDota, creamos un fallback elegante con los picks del juego
  const isRadiant = mvpPlayer
    ? (mvpPlayer.isRadiant !== undefined ? mvpPlayer.isRadiant : (mvpPlayer.player_slot != null && mvpPlayer.player_slot < 128))
    : radiantWon;
  const heroId = mvpPlayer?.hero_id || (isRadiant ? game.radiant_heroes?.[0]?.hero_id : game.dire_heroes?.[0]?.hero_id) || 67;
  const heroNameFromList = (isRadiant ? game.radiant_heroes : game.dire_heroes)?.find((h) => h.hero_id === heroId)?.hero_name;
  const heroShortName = getHeroShortName(heroId, heroNameFromList);
  const heroDisplayName = getHeroDisplayName(heroId, heroNameFromList);
  const heroVideoUrl = getHeroVideoUrl(heroShortName);
  // Matchear con el jugador oficial del roster del torneo (GameRosterPlayer) para obtener su nick oficial y avatar
  const rosterPlayer = matchRosterPlayer(mvpPlayer, game);
  const nickname =
    rosterPlayer?.nickname ||
    getPlayerNickname(mvpPlayer, game, isRadiant ? game.radiant_team?.name : game.dire_team?.name) ||
    "MVP";
  const playerSlug = rosterPlayer?.slug || rosterPlayer?.nickname || (nickname && nickname !== "MVP" ? nickname : undefined);
  const teamSlug = isRadiant ? game.radiant_team?.slug : game.dire_team?.slug;
  const teamName = isRadiant ? game.radiant_team?.name : game.dire_team?.name;
  const level = mvpPlayer?.level || 23;
  const score = getPlayerScore(mvpPlayer);
  const mvpScoreBreakdown = calculatePlayerMvpScore(mvpPlayer);
  const role = rosterPlayer?.position_display || getPlayerRole(mvpPlayer);
  const tagline = getPlayerTagline(mvpPlayer);

  const kills = mvpPlayer?.kills ?? 17;
  const deaths = mvpPlayer?.deaths ?? 2;
  const assists = mvpPlayer?.assists ?? 10;
  const kdaRatio = ((kills + assists) / Math.max(1, deaths)).toFixed(1);

  const netWorth = mvpPlayer?.net_worth ?? 25555;
  const heroDamage = mvpPlayer?.hero_damage ?? 35023;
  const towerDamage = mvpPlayer?.tower_damage ?? 10438;
  const teamfightPct = mvpPlayer?.teamfight_participation
    ? Math.round(mvpPlayer.teamfight_participation * 100)
    : 87;

  // Extraer items del jugador
  const itemIds = [
    mvpPlayer?.item_0,
    mvpPlayer?.item_1,
    mvpPlayer?.item_2,
    mvpPlayer?.item_3,
    mvpPlayer?.item_4,
    mvpPlayer?.item_5,
  ];

  // Extraer items del oso espiritual si existen (Lone Druid)
  const bearItems = getPlayerBearItems(mvpPlayer);

  // Neutral item
  const neutralItemKey = getPlayerNeutralItem(mvpPlayer);
  const neutralImgUrl = neutralItemKey ? getItemImageUrl(neutralItemKey) : "";
  const neutralItemName = neutralItemKey ? getItemDisplayName(neutralItemKey) : "Neutral Item";

  return (
    <div className="relative w-full p-3.5 sm:p-7 border border-[#2d261e] bg-[#14100c]/90 overflow-hidden shadow-2xl">
      {/* Esquinas imperiales doradas */}
      <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
      <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
      <span className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
      <span className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />

      {/* Línea interior grabada sutil */}
      <span className="pointer-events-none absolute inset-1.5 border border-[#d8b467]/15" />

      {/* Fondo y marcas de agua estilizadas */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
        {/* COLUMNA IZQUIERDA: VIDEO RENDER 3D DEL HÉROE */}
        <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
          {/* Marca de agua de texto del jugador */}
          <span className="absolute top-1 sm:top-2 left-1/2 -translate-x-1/2 text-[#c4bcaf]/50 font-chakra font-black text-2xl sm:text-4xl tracking-[0.2em] sm:tracking-[0.25em] uppercase select-none pointer-events-none truncate max-w-[85%] drop-shadow-sm">
            {nickname}
          </span>

          {/* Letras gigantes MVP en dorado imperial */}
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#d8b467]/20 sm:text-[#d8b467]/28 font-chakra font-black text-6xl sm:text-[145px] tracking-tighter select-none pointer-events-none">
            MVP
          </span>

          {/* Video render del héroe */}
          <div className="relative z-10 w-full flex items-center justify-center min-h-[260px] sm:min-h-[360px]">
            <video
              autoPlay
              loop
              muted
              playsInline
              key={heroVideoUrl}
              className="w-full max-w-[320px] sm:max-w-[380px] h-auto object-contain filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)] pointer-events-none"
            >
              <source src={heroVideoUrl} type="video/webm" />
              {/* Fallback de imagen en caso de que el navegador no soporte webm */}
              <picture>
                <img
                  src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroShortName}.png`}
                  alt={heroDisplayName}
                  className="w-full h-full object-contain"
                />
              </picture>
            </video>
          </div>

          {/* Pedestal monumental y resplandor inferior */}
          <div className="relative z-10 -mt-2 flex flex-col items-center">
            <div className="h-2 w-48 sm:w-60 bg-linear-to-r from-transparent via-[#d8b467]/60 to-transparent blur-sm" />
            <div className="mt-1 px-3 py-0.5 border border-[#d8b467]/40 bg-[#1c160e]">
              <span className="text-[10px] sm:text-xs font-chakra font-bold tracking-[0.25em] text-[#f0d38f] uppercase">
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: ESTADÍSTICAS Y HONOR DEL MVP */}
        <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
          {/* Fila 1: Badge MVP + Avatar de Roster + Nickname */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Badge MVP militar / imperial */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#d8b467] bg-[#221a0f] text-[#f0d38f] text-xs font-chakra font-black uppercase tracking-wider shadow-[0_0_15px_rgba(216,180,103,0.3)]">
              <IconCrown size={14} className="stroke-[2.5]" />
              <span>MVP</span>
            </span>

            {/* Avatar oficial del jugador si existe - Placa cuadrada */}
            {rosterPlayer?.avatar && (
              playerSlug ? (
                <Link
                  href={`/players/${encodeURIComponent(playerSlug)}`}
                  className="w-10 h-10 sm:w-11 sm:h-11 border-2 border-[#d8b467]/70 shrink-0 bg-black/60 shadow-[0_0_12px_rgba(216,180,103,0.25)] overflow-hidden hover:scale-105 transition-transform block"
                >
                  <picture>
                    <img
                      src={rosterPlayer.avatar}
                      alt={nickname}
                      className="w-full h-full object-cover"
                    />
                  </picture>
                </Link>
              ) : (
                <div className="w-10 h-10 sm:w-11 sm:h-11 border-2 border-[#d8b467]/70 shrink-0 bg-black/60 shadow-[0_0_12px_rgba(216,180,103,0.25)] overflow-hidden">
                  <picture>
                    <img
                      src={rosterPlayer.avatar}
                      alt={nickname}
                      className="w-full h-full object-cover"
                    />
                  </picture>
                </div>
              )
            )}

            {/* Nombre del jugador */}
            {playerSlug ? (
              <Link
                href={`/players/${encodeURIComponent(playerSlug)}`}
                className="text-xl sm:text-4xl font-chakra font-black text-white uppercase tracking-tight truncate max-w-[220px] sm:max-w-md hover:text-[#d8b467] transition-colors"
              >
                {nickname}
              </Link>
            ) : (
              <h1 className="text-xl sm:text-4xl font-chakra font-black text-white uppercase tracking-tight truncate max-w-[220px] sm:max-w-md">
                {nickname}
              </h1>
            )}

            {/* Bando Radiant / Dire - Insignia táctica */}
            {teamSlug ? (
              <Link
                href={`/teams/${teamSlug}`}
                className={`px-2 py-0.5 font-chakra text-[9px] sm:text-[10px] font-bold tracking-widest uppercase border hover:opacity-85 transition-opacity ${
                  isRadiant
                    ? "bg-[#07160e] border-[#00e599]/60 text-[#00e599]"
                    : "bg-[#180808] border-[#ff4d4d]/60 text-[#ff6b6b]"
                }`}
              >
                {teamName || (isRadiant ? "THE RADIANT" : "THE DIRE")}
              </Link>
            ) : (
              <span
                className={`px-2 py-0.5 font-chakra text-[9px] sm:text-[10px] font-bold tracking-widest uppercase border ${
                  isRadiant
                    ? "bg-[#07160e] border-[#00e599]/60 text-[#00e599]"
                    : "bg-[#180808] border-[#ff4d4d]/60 text-[#ff6b6b]"
                }`}
              >
                {teamName || (isRadiant ? "THE RADIANT" : "THE DIRE")}
              </span>
            )}
          </div>

          {/* Fila 2: Placa de Nivel, Héroe, Score y Puntos MVP */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex flex-wrap items-center gap-2 px-2.5 sm:px-3 py-1 border border-[#2d261e] bg-[#100d0a] text-[11px] sm:text-xs font-chakra font-bold text-[#d8d2c7]">
              <span>
                Nvl {level} {heroDisplayName}
              </span>
              <span className="text-[#d8b467]">·</span>
              <span>
                Score <span className="text-[#f0d38f] font-black">{score}/100</span>
              </span>
              {mvpScoreBreakdown.totalScore > 0 && (
                <>
                  <span className="text-[#d8b467]">·</span>
                  <span className="text-[#a89f91]">
                    Puntaje MVP: <span className="text-[#00e599] font-black">{mvpScoreBreakdown.totalScore} pts</span>
                  </span>
                </>
              )}
            </span>
          </div>

          {/* Fila 3: Tagline + Role + KDA ratio */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm">
            <span className="font-roman font-bold text-[#f0d38f] tracking-wider">{tagline}</span>
            <span className="text-[#554b3f]">·</span>
            <span className="font-chakra text-[#b5ada1] font-semibold">{role}</span>
            <span className="text-[#554b3f]">·</span>
            <span className="font-mono text-[#e0deda]">
              KDA:{" "}
              <span className="text-[#00e599] font-bold">{kills}</span>
              {" / "}
              <span className="text-[#ff6b6b] font-bold">{deaths}</span>
              {" / "}
              <span className="text-[#6cc4ff] font-bold">{assists}</span>
              <span className="text-[#8e857b] ml-1 font-normal">({kdaRatio})</span>
            </span>
          </div>

          {/* Fila 4: 4 Placas de estadísticas de piedra imperial con barra de color */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
            {/* Net Worth */}
            <div className="border border-[#2d261e] border-t-2 border-t-[#d8b467] bg-[#100d0a] p-2.5 sm:p-3 flex flex-col justify-between shadow-md hover:border-[#d8b467]/60 transition-colors">
              <div className="flex items-center gap-1.5 text-[#9e9485] text-[9px] sm:text-[10px] font-chakra uppercase tracking-wider font-bold mb-1.5 sm:mb-2">
                <IconCoins size={13} className="text-[#d8b467]" />
                <span>NET WORTH</span>
              </div>
              <span className="text-lg sm:text-2xl font-black font-chakra text-[#f0d38f] tracking-tight">
                {formatNumber(netWorth)}
              </span>
            </div>

            {/* Daño Héroes */}
            <div className="border border-[#2d261e] border-t-2 border-t-[#ff4d4d] bg-[#100d0a] p-2.5 sm:p-3 flex flex-col justify-between shadow-md hover:border-[#ff4d4d]/60 transition-colors">
              <div className="flex items-center gap-1.5 text-[#9e9485] text-[9px] sm:text-[10px] font-chakra uppercase tracking-wider font-bold mb-1.5 sm:mb-2">
                <IconSwords size={13} className="text-[#ff6b6b]" />
                <span>DAÑO HÉROES</span>
              </div>
              <span className="text-lg sm:text-2xl font-black font-chakra text-white tracking-tight">
                {formatNumber(heroDamage)}
              </span>
            </div>

            {/* Daño Torres */}
            <div className="border border-[#2d261e] border-t-2 border-t-[#e5a035] bg-[#100d0a] p-2.5 sm:p-3 flex flex-col justify-between shadow-md hover:border-[#e5a035]/60 transition-colors">
              <div className="flex items-center gap-1.5 text-[#9e9485] text-[9px] sm:text-[10px] font-chakra uppercase tracking-wider font-bold mb-1.5 sm:mb-2">
                <IconBuildingCastle size={13} className="text-[#e5a035]" />
                <span>DAÑO TORRES</span>
              </div>
              <span className="text-lg sm:text-2xl font-black font-chakra text-[#e5a035] tracking-tight">
                {formatNumber(towerDamage)}
              </span>
            </div>

            {/* Pelea Grupal */}
            <div className="border border-[#2d261e] border-t-2 border-t-[#00e599] bg-[#100d0a] p-2.5 sm:p-3 flex flex-col justify-between shadow-md hover:border-[#00e599]/60 transition-colors">
              <div className="flex items-center gap-1.5 text-[#9e9485] text-[9px] sm:text-[10px] font-chakra uppercase tracking-wider font-bold mb-1.5 sm:mb-2">
                <IconUsers size={13} className="text-[#00e599]" />
                <span>PELEAS GRUPALES</span>
              </div>
              <span className="text-lg sm:text-2xl font-black font-chakra text-[#00e599] tracking-tight">
                {teamfightPct}%
              </span>
            </div>
          </div>

          {/* Fila 5: Inventario (6 items), Neutral Item y Build del Oso */}
          <div className="flex flex-wrap items-end gap-3 sm:gap-4 pt-1">
            {/* Build del Héroe */}
            <div className="flex flex-col gap-1">
              {bearItems ? (
                <div className="flex items-center gap-1.5 px-0.5">
                  <span className="text-[10px] sm:text-[11px] font-chakra font-bold text-[#b5ada1] uppercase tracking-wider">
                    Build Héroe
                  </span>
                </div>
              ) : null}
              {/* Cuadrícula de 6 items (2 filas x 3 columnas) */}
              <div className="grid grid-cols-3 gap-1 p-1 border border-[#2d261e] bg-[#0c0a08]">
                {itemIds.map((itemId, idx) => {
                  const imgUrl = itemId ? getItemImageUrl(itemId) : "";
                  const dName = itemId ? getItemDisplayName(itemId) : "Vacío";
                  return (
                    <div
                      key={`mvp-item-${idx}`}
                      className="w-10 h-6.5 sm:w-12 sm:h-8 overflow-hidden bg-[#14100c] border border-white/10 flex items-center justify-center"
                      title={dName}
                    >
                      {imgUrl ? (
                        <picture>
                          <img
                            src={imgUrl}
                            alt={dName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </picture>
                      ) : (
                        <div className="w-full h-full bg-black/40" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Neutral Item - Placa táctica dorada */}
            {neutralImgUrl ? (
              <div className="flex flex-col gap-1">
                {bearItems ? <div className="h-[15px] hidden sm:block" /> : null}
                <div className="flex items-center gap-2 px-2.5 py-1 sm:py-1.5 border border-[#d8b467]/40 bg-[#16120d] h-[48px] sm:h-[58px]">
                  <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 overflow-hidden border border-[#d8b467]/60 bg-[#100d0a] shrink-0" title={neutralItemName}>
                    <picture>
                      <img
                        src={neutralImgUrl}
                        alt={neutralItemName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </picture>
                  </div>
                  <span className="text-xs font-chakra font-bold text-[#f0d38f] pr-1 uppercase tracking-wider">
                    Neutral
                  </span>
                </div>
              </div>
            ) : null}

            {/* Build del Oso Espiritual (Spirit Bear) */}
            {bearItems && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 px-0.5">
                  <picture className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs overflow-hidden inline-block shrink-0 border border-[#d8b467]/70 shadow-[0_0_6px_rgba(216,180,103,0.4)]">
                    <img
                      src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/lone_druid_spirit_bear.png"
                      alt="Oso Espiritual"
                      className="w-full h-full object-cover"
                    />
                  </picture>
                  <span className="text-[10px] sm:text-[11px] font-chakra font-bold text-[#f0d38f] uppercase tracking-wider flex items-center gap-1">
                    <span>Build del Oso</span>
                    <span className="text-[#00e599] text-[9px] font-mono font-bold">(Spirit Bear)</span>
                  </span>
                </div>
                {/* Cuadrícula de 6 items del Oso */}
                <div className="grid grid-cols-3 gap-1 p-1 border border-[#d8b467]/40 bg-[#0e0a06] shadow-[0_0_15px_rgba(216,180,103,0.2)]">
                  {bearItems.map((itemId, idx) => {
                    const imgUrl = itemId ? getItemImageUrl(itemId) : "";
                    const dName = itemId ? getItemDisplayName(itemId) : "Vacío";
                    return (
                      <div
                        key={`mvp-bear-item-${idx}`}
                        className="w-10 h-6.5 sm:w-12 sm:h-8 overflow-hidden bg-[#18120b] border border-[#d8b467]/30 flex items-center justify-center hover:border-[#f0d38f] transition-colors"
                        title={dName ? `Oso: ${dName}` : "Vacío"}
                      >
                        {imgUrl ? (
                          <picture>
                            <img
                              src={imgUrl}
                              alt={dName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </picture>
                        ) : (
                          <div className="w-full h-full bg-black/40" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
