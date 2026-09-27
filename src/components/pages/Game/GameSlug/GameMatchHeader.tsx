"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { IconShield, IconFlame, IconTrophy, IconArrowLeft } from "@tabler/icons-react";
import { GameDetailData, GameHeroData, GameRosterPlayer, GameTeamData, OpenDotaPlayer } from "interfaces/games";
import { GameSeriesSwitcher } from "./GameSeriesSwitcher";

interface GameMatchHeaderProps {
  game: GameDetailData;
}

function getTeamCaptainTag(
  teamRoster?: GameRosterPlayer[] | null,
  teamData?: GameTeamData | null,
  openDotaPlayers?: OpenDotaPlayer[] | null,
  gameSlug?: string,
  isRadiant?: boolean
): string | null {
  // 1. Buscar en el roster oficial del equipo el jugador con rol CAPTAIN
  const captainPlayer = teamRoster?.find(
    (p) => p.role?.toUpperCase() === "CAPTAIN" || (p as { is_captain?: boolean }).is_captain === true
  );
  if (captainPlayer?.nickname) {
    const nick = captainPlayer.nickname.trim();
    return nick.toLowerCase().startsWith("team ") ? nick : `Team ${nick}`;
  }

  // 2. Buscar en OpenDota players con flag is_captain
  const odCaptain = openDotaPlayers?.find((p) => p.is_captain === true);
  if (odCaptain) {
    const matched = teamRoster?.find(
      (r) =>
        (odCaptain.account_id && Number(r.account_id) === Number(odCaptain.account_id)) ||
        (r.nickname && odCaptain.personaname && r.nickname.toLowerCase() === odCaptain.personaname.toLowerCase())
    );
    const nick = matched?.nickname || odCaptain.personaname || odCaptain.name;
    if (nick && nick.trim()) {
      const cleanNick = nick.trim();
      return cleanNick.toLowerCase().startsWith("team ") ? cleanNick : `Team ${cleanNick}`;
    }
  }

  // 3. Team Tag si especifica capitán (ej. "T-MATTHEW" o "MATTHEW")
  if (
    teamData?.tag &&
    teamData.tag.length >= 2 &&
    teamData.tag.length <= 25 &&
    teamData.tag.toLowerCase() !== teamData.name?.toLowerCase()
  ) {
    const cleanTag = teamData.tag.replace(/^T-/i, "").replace(/^TEAM\s+/i, "").trim();
    if (cleanTag) {
      return `Team ${cleanTag}`;
    }
  }

  // 4. Extracción desde el slug de la partida / serie (ej: "...-t-matthew-vs-team-pakaz-game-1")
  if (gameSlug) {
    const vsMatch = gameSlug.match(/(?:^|-)t(?:eam)?-([a-z0-9_-]+)-vs-(?:team|t)-([a-z0-9_-]+)(?:-game|-|$)/i);
    if (vsMatch) {
      const rawCaptainSlug = isRadiant ? vsMatch[1] : vsMatch[2];
      if (rawCaptainSlug) {
        const formatted = rawCaptainSlug
          .split(/[-_]/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
        return `Team ${formatted}`;
      }
    }
  }

  return null;
}

function renderHeaderHeroPicks(heroes: GameHeroData[] = [], isRadiant: boolean, customClass?: string) {
  const displayHeroes = heroes && heroes.length > 0 ? [...heroes] : [];
  while (displayHeroes.length < 5) {
    displayHeroes.push({ has_hero: false, hero_id: null, hero_name: null, image_url: null });
  }

  return (
    <div className={`grid grid-cols-5 gap-1 ${customClass || "w-32 sm:w-36 mt-2"}`}>
      {displayHeroes.slice(0, 5).map((h, idx) => {
        const hasHero = Boolean(h.has_hero && (h.image_url || h.hero_id));
        const heroUrl = h.image_url;
        const heroName = h.hero_name || "Por elegir";

        return (
          <div
            key={idx}
            title={heroName}
            className={`group relative aspect-[4/3] w-full overflow-hidden border ${
              hasHero
                ? isRadiant
                  ? "border-[#00e599]/50 bg-[#07160e]"
                  : "border-[#ff4d4d]/50 bg-[#160808]"
                : "border-[#241e17] bg-[#0c0a08]/80 flex items-center justify-center"
            } shadow-xs`}
          >
            {hasHero && heroUrl ? (
              <picture>
                <img
                  src={heroUrl}
                  alt={heroName}
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
              </picture>
            ) : (
              <span className="w-1 h-1 rounded-full bg-[#42372a]" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatEndedTime(endedAtStr: string | null, startedAtStr: string | null): string {
  const targetDateStr = endedAtStr || startedAtStr;
  if (!targetDateStr) return "FINALIZADO";

  try {
    const targetDate = new Date(targetDateStr);
    const now = new Date();
    const diffMs = now.getTime() - targetDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60 && diffMins >= 0) {
      return `FINALIZADO HACE ${diffMins} MINUTO${diffMins === 1 ? "" : "S"}`;
    }
    if (diffHours < 24 && diffHours >= 0) {
      return `FINALIZADO HACE ${diffHours} HORA${diffHours === 1 ? "" : "S"}`;
    }
    if (diffDays < 30 && diffDays >= 0) {
      return `FINALIZADO HACE ${diffDays} DÍA${diffDays === 1 ? "" : "S"}`;
    }
    return `FINALIZADO EL ${targetDate.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }).toUpperCase()}`;
  } catch {
    return "FINALIZADO";
  }
}

export function GameMatchHeader({ game }: GameMatchHeaderProps) {
  const players = game.opendota_data?.players || [];
  const radiantPlayers = players.filter(
    (p) => p.isRadiant || (p.player_slot != null && p.player_slot < 128)
  );
  const direPlayers = players.filter(
    (p) => p.isRadiant === false || (p.player_slot != null && p.player_slot >= 128)
  );

  const hasPlayerData = players.length > 0;
  const radiantKills =
    game.opendota_data?.radiant_score != null
      ? game.opendota_data.radiant_score
      : hasPlayerData
      ? radiantPlayers.reduce((acc, p) => acc + (p.kills || 0), 0)
      : null;

  const direKills =
    game.opendota_data?.dire_score != null
      ? game.opendota_data.dire_score
      : hasPlayerData
      ? direPlayers.reduce((acc, p) => acc + (p.kills || 0), 0)
      : null;

  const durationSec = game.duration_seconds || game.opendota_data?.duration || null;

  const isOngoing = game.status === "ONGOING";
  const isScheduled = game.status === "SCHEDULED";
  const isCancelled = game.status === "CANCELLED";
  const isCompleted = game.status === "COMPLETED" || game.status === "FINISHED";

  // Determinación de ganador (únicamente si la partida ha finalizado o tiene ganador explícito)
  const radiantWon = Boolean(
    !isScheduled &&
    ((game.winner_slug && game.radiant_team?.slug && game.winner_slug === game.radiant_team.slug) ||
      (isCompleted && game.opendota_data?.radiant_win === true))
  );
  const direWon = Boolean(
    !isScheduled &&
    ((game.winner_slug && game.dire_team?.slug && game.winner_slug === game.dire_team.slug) ||
      (isCompleted && game.opendota_data?.radiant_win === false))
  );

  const radiantName = game.radiant_team?.name || "Radiant";
  const direName = game.dire_team?.name || "Dire";

  const radiantRoster = game.radiant_players || game.radiant_team?.players || [];
  const direRoster = game.dire_players || game.dire_team?.players || [];

  const radiantCaptainTag = getTeamCaptainTag(
    radiantRoster,
    game.radiant_team,
    radiantPlayers,
    game.slug || game.series_slug,
    true
  );

  const direCaptainTag = getTeamCaptainTag(
    direRoster,
    game.dire_team,
    direPlayers,
    game.slug || game.series_slug,
    false
  );

  const statusSubtitle = isOngoing
    ? "EN VIVO"
    : isScheduled
    ? "PARTIDA PROGRAMADA"
    : isCancelled
    ? "PARTIDA CANCELADA"
    : isCompleted || game.ended_at || game.started_at
    ? formatEndedTime(game.ended_at, game.started_at)
    : "PROGRAMADO";

  const hasDraftHeroes = Boolean(
    game.radiant_heroes?.some((h) => h.has_hero) ||
    game.dire_heroes?.some((h) => h.has_hero) ||
    game.radiant_picks?.length ||
    game.dire_picks?.length
  );

  const radiantHeroesToRender: GameHeroData[] = useMemo(() => {
    if (game.radiant_heroes && game.radiant_heroes.some((h) => h.has_hero)) {
      return game.radiant_heroes;
    }
    if (game.radiant_picks && game.radiant_picks.length > 0) {
      return (game.radiant_picks as unknown[]).map((p) =>
        typeof p === "object" && p !== null && "has_hero" in p
          ? (p as GameHeroData)
          : { has_hero: Boolean(p), hero_id: Number(p) || null, hero_name: null, image_url: null }
      );
    }
    return [];
  }, [game.radiant_heroes, game.radiant_picks]);

  const direHeroesToRender: GameHeroData[] = useMemo(() => {
    if (game.dire_heroes && game.dire_heroes.some((h) => h.has_hero)) {
      return game.dire_heroes;
    }
    if (game.dire_picks && game.dire_picks.length > 0) {
      return (game.dire_picks as unknown[]).map((p) =>
        typeof p === "object" && p !== null && "has_hero" in p
          ? (p as GameHeroData)
          : { has_hero: Boolean(p), hero_id: Number(p) || null, hero_name: null, image_url: null }
      );
    }
    return [];
  }, [game.dire_heroes, game.dire_picks]);

  // Información de la serie
  const seriesGames = game.series?.games || game.series_games || [];
  const hasMultipleGames = seriesGames.length > 1;
  const bestOfTag = game.series_best_of || game.series?.best_of || (hasMultipleGames ? "BO3" : null);

  const radiantSlug = game.radiant_team?.slug;
  const direSlug = game.dire_team?.slug;

  let radiantSeriesScore: number | null = null;
  let direSeriesScore: number | null = null;
  if (game.series) {
    if (radiantSlug && game.series.team_a_slug === radiantSlug) {
      radiantSeriesScore = game.series.score_a;
    } else if (radiantSlug && game.series.team_b_slug === radiantSlug) {
      radiantSeriesScore = game.series.score_b;
    }

    if (direSlug && game.series.team_a_slug === direSlug) {
      direSeriesScore = game.series.score_a;
    } else if (direSlug && game.series.team_b_slug === direSlug) {
      direSeriesScore = game.series.score_b;
    }
  }
  if (hasMultipleGames && radiantSeriesScore == null && radiantSlug) {
    radiantSeriesScore = seriesGames.filter((g) => g.winner_slug === radiantSlug).length;
  }
  if (hasMultipleGames && direSeriesScore == null && direSlug) {
    direSeriesScore = seriesGames.filter((g) => g.winner_slug === direSlug).length;
  }

  const stageBadgeText = game.stage_name
    ? hasMultipleGames && bestOfTag
      ? `${game.stage_name.toUpperCase()} · ${bestOfTag.toUpperCase()} · JUEGO ${game.game_number} DE ${seriesGames.length}`
      : `${game.stage_name.toUpperCase()} · JUEGO ${game.game_number}`
    : hasMultipleGames && bestOfTag
    ? `${bestOfTag.toUpperCase()} · JUEGO ${game.game_number} DE ${seriesGames.length}`
    : "CAPTAINS MODE";

  return (
    <div className="w-full">
      {/* Botón de retorno e info de torneo con estética imperial */}
      <div className="mb-4 flex items-center justify-between gap-2 sm:gap-4">
        <Link
          href="/swiss-stage"
          className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 border border-[#2d261e] bg-[#14100c] text-[11px] sm:text-xs font-chakra font-bold uppercase tracking-wider text-[#a89f91] hover:text-[#f0d38f] hover:border-[#d8b467]/60 hover:bg-[#1a1510] transition-all shadow-sm shrink-0"
        >
          <IconArrowLeft size={14} />
          <span className="hidden sm:inline">Volver a Fase Suiza</span>
          <span className="sm:hidden">Fase Suiza</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 border border-[#d8b467]/30 bg-[#18140e] text-[#f0d38f] text-[10px] sm:text-[11px] font-chakra font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(216,180,103,0.1)] truncate max-w-[200px] sm:max-w-none">
          <span className="w-1.5 h-1.5 rotate-45 bg-[#d8b467] shrink-0" />
          <span className="truncate">{game.tournament_name || "El Gran Coliseo II"}</span>
          <span className="w-1.5 h-1.5 rotate-45 bg-[#d8b467] shrink-0" />
        </div>
      </div>

      {/* Barra principal de enfrentamiento con placa de piedra sutil */}
      <div className="relative w-full py-4 sm:py-6 px-3.5 sm:px-6 border border-[#2d261e] bg-[#14100c]/80 backdrop-blur-xs">
        {/* Delicados acentos en las 4 esquinas de la placa */}
        <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />
        <span className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#d8b467]/50 bg-[#d8b467]" />

        {/* Glows ambientales sutiles integrados */}
        <div className="pointer-events-none absolute -left-12 top-1/2 -translate-y-1/2 h-32 w-48 bg-[#00e599]/8 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 top-1/2 -translate-y-1/2 h-32 w-48 bg-[#ff4d4d]/8 blur-3xl" />

        {/* ======================================================== */}
        {/* VISTA MÓVIL (HEAD-TO-HEAD BATTLE CLASH)                  */}
        {/* ======================================================== */}
        <div className="md:hidden flex flex-col gap-3.5">
          {/* Sub-header de Etapa */}
          <div className="flex items-center justify-center gap-2">
            <span className="w-1 h-1 bg-[#d8b467]" />
            <span className="text-[10px] font-chakra uppercase tracking-[0.2em] text-[#d8b467] font-bold">
              {stageBadgeText}
            </span>
            <span className="w-1 h-1 bg-[#d8b467]" />
          </div>

          {/* Fila Principal de Enfrentamiento: Radiant | Reloj & Kills | Dire */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            {/* LADO RADIANT */}
            <div className="flex flex-col items-center text-center min-w-0">
              {game.radiant_team?.slug ? (
                <Link
                  href={`/teams/${game.radiant_team.slug}`}
                  className={`relative flex h-14 w-14 shrink-0 items-center justify-center border transition-all ${
                    radiantWon
                      ? "border-[#00e599] bg-[#07160e] shadow-[0_0_18px_rgba(0,229,153,0.35)]"
                      : "border-[#223026] bg-[#09110c]"
                  }`}
                >
                  <span className={`pointer-events-none absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rotate-45 ${radiantWon ? "bg-[#00e599]" : "bg-[#00e599]/40"}`} />
                  {game.radiant_team?.logo_url ? (
                    <picture>
                      <img
                        src={game.radiant_team.logo_url}
                        alt={radiantName}
                        className="h-10 w-10 object-contain"
                      />
                    </picture>
                  ) : (
                    <IconShield size={26} className={radiantWon ? "text-[#00e599]" : "text-[#00e599]/60"} />
                  )}
                </Link>
              ) : (
                <div
                  className={`relative flex h-14 w-14 shrink-0 items-center justify-center border ${
                    radiantWon
                      ? "border-[#00e599] bg-[#07160e] shadow-[0_0_18px_rgba(0,229,153,0.35)]"
                      : "border-[#223026] bg-[#09110c]"
                  }`}
                >
                  <span className={`pointer-events-none absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rotate-45 ${radiantWon ? "bg-[#00e599]" : "bg-[#00e599]/40"}`} />
                  {game.radiant_team?.logo_url ? (
                    <picture>
                      <img
                        src={game.radiant_team.logo_url}
                        alt={radiantName}
                        className="h-10 w-10 object-contain"
                      />
                    </picture>
                  ) : (
                    <IconShield size={26} className={radiantWon ? "text-[#00e599]" : "text-[#00e599]/60"} />
                  )}
                </div>
              )}

              <span className="text-[9px] font-chakra font-bold tracking-widest text-[#00e599] uppercase mt-1.5">
                THE RADIANT
              </span>
              <h2 className={`text-[11px] min-[380px]:text-xs sm:text-sm font-chakra font-black uppercase tracking-tight leading-tight break-words w-full px-0.5 ${
                radiantWon ? "text-[#00e599]" : "text-white"
              }`}>
                {game.radiant_team?.slug ? (
                  <Link href={`/teams/${game.radiant_team.slug}`} className="hover:text-[#00e599] transition-colors">
                    {radiantName}
                  </Link>
                ) : (
                  radiantName
                )}
              </h2>

              {radiantCaptainTag && (
                <span className="text-[9px] sm:text-[10px] font-chakra font-semibold tracking-wider text-[#d8b467] mt-0.5">
                  [{radiantCaptainTag}]
                </span>
              )}

              {radiantWon && (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#00e599] bg-[#00e599]/15 text-[#00e599] text-[9px] font-chakra font-black tracking-wider uppercase shadow-[0_0_10px_rgba(0,229,153,0.2)]">
                    <IconTrophy size={10} className="stroke-[2.5]" />
                    <span>VICTORY</span>
                  </span>
                </div>
              )}
            </div>

            {/* CENTRO: MARCADOR & RELOJ */}
            <div className="flex flex-col items-center justify-center px-1">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl sm:text-3xl font-black font-chakra text-[#00e599] tabular-nums drop-shadow-[0_0_12px_rgba(0,229,153,0.4)]">
                  {radiantKills !== null ? radiantKills : (radiantWon ? "1" : "-")}
                </span>
                <span className="h-4 w-px bg-[#4a3e2e]" />
                <span className="text-lg sm:text-xl font-black font-mono text-white tracking-wider tabular-nums">
                  {formatDuration(durationSec)}
                </span>
                <span className="h-4 w-px bg-[#4a3e2e]" />
                <span className="text-2xl sm:text-3xl font-black font-chakra text-[#ff6b6b] tabular-nums drop-shadow-[0_0_12px_rgba(255,107,107,0.4)]">
                  {direKills !== null ? direKills : (direWon ? "1" : "-")}
                </span>
              </div>

              <span className="text-[9px] font-chakra uppercase tracking-widest text-[#8e857b] font-semibold mt-1 text-center">
                {statusSubtitle}
              </span>
              {hasMultipleGames && (radiantSeriesScore !== null || direSeriesScore !== null) && (
                <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#d8b467]/30 bg-[#16120c] text-[9px] font-chakra font-bold tracking-wider text-[#d8b467]">
                  <span className="text-[#8e857b]">SERIE:</span>
                  <span className="text-white">{radiantSeriesScore ?? 0}</span>
                  <span className="text-[#8e857b]">-</span>
                  <span className="text-white">{direSeriesScore ?? 0}</span>
                </div>
              )}
            </div>

            {/* LADO DIRE */}
            <div className="flex flex-col items-center text-center min-w-0">
              {game.dire_team?.slug ? (
                <Link
                  href={`/teams/${game.dire_team.slug}`}
                  className={`relative flex h-14 w-14 shrink-0 items-center justify-center border transition-all ${
                    direWon
                      ? "border-[#ff4d4d] bg-[#220909] shadow-[0_0_18px_rgba(255,77,77,0.35)]"
                      : "border-[#301616] bg-[#140808]"
                  }`}
                >
                  <span className={`pointer-events-none absolute -top-0.5 -left-0.5 w-1.5 h-1.5 rotate-45 ${direWon ? "bg-[#ff4d4d]" : "bg-[#ff4d4d]/40"}`} />
                  {game.dire_team?.logo_url ? (
                    <picture>
                      <img
                        src={game.dire_team.logo_url}
                        alt={direName}
                        className="h-10 w-10 object-contain"
                      />
                    </picture>
                  ) : (
                    <IconFlame size={26} className={direWon ? "text-[#ff6b6b]" : "text-[#ff6b6b]/50"} />
                  )}
                </Link>
              ) : (
                <div
                  className={`relative flex h-14 w-14 shrink-0 items-center justify-center border ${
                    direWon
                      ? "border-[#ff4d4d] bg-[#220909] shadow-[0_0_18px_rgba(255,77,77,0.35)]"
                      : "border-[#301616] bg-[#140808]"
                  }`}
                >
                  <span className={`pointer-events-none absolute -top-0.5 -left-0.5 w-1.5 h-1.5 rotate-45 ${direWon ? "bg-[#ff4d4d]" : "bg-[#ff4d4d]/40"}`} />
                  {game.dire_team?.logo_url ? (
                    <picture>
                      <img
                        src={game.dire_team.logo_url}
                        alt={direName}
                        className="h-10 w-10 object-contain"
                      />
                    </picture>
                  ) : (
                    <IconFlame size={26} className={direWon ? "text-[#ff6b6b]" : "text-[#ff6b6b]/50"} />
                  )}
                </div>
              )}

              <span className="text-[9px] font-chakra font-bold tracking-widest text-[#ff6b6b] uppercase mt-1.5">
                THE DIRE
              </span>
              <h2 className={`text-[11px] min-[380px]:text-xs sm:text-sm font-chakra font-black uppercase tracking-tight leading-tight break-words w-full px-0.5 ${
                direWon ? "text-[#ff6b6b]" : "text-[#ff6b6b]/90"
              }`}>
                {game.dire_team?.slug ? (
                  <Link href={`/teams/${game.dire_team.slug}`} className="hover:text-[#ff4d4d] transition-colors">
                    {direName}
                  </Link>
                ) : (
                  direName
                )}
              </h2>

              {direCaptainTag && (
                <span className="text-[9px] sm:text-[10px] font-chakra font-semibold tracking-wider text-[#d8b467] mt-0.5">
                  [{direCaptainTag}]
                </span>
              )}

              {direWon && (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#ff4d4d] bg-[#ff4d4d]/15 text-[#ff6b6b] text-[9px] font-chakra font-black tracking-wider uppercase shadow-[0_0_10px_rgba(255,77,77,0.2)]">
                    <IconTrophy size={10} className="stroke-[2.5]" />
                    <span>VICTORY</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Fila de Draft de Héroes en Móvil */}
          {hasDraftHeroes && (
            <div className="pt-2.5 border-t border-[#241c14] flex items-center justify-between gap-3">
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[8px] font-chakra font-bold text-[#00e599] tracking-widest uppercase mb-1">
                  PICKS RADIANT
                </span>
                {renderHeaderHeroPicks(radiantHeroesToRender, true, "w-28 sm:w-32")}
              </div>
              <div className="flex flex-col items-end min-w-0">
                <span className="text-[8px] font-chakra font-bold text-[#ff6b6b] tracking-widest uppercase mb-1">
                  PICKS DIRE
                </span>
                {renderHeaderHeroPicks(direHeroesToRender, false, "w-28 sm:w-32")}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* VISTA ESCRITORIO (MD Y SUPERIOR)                         */}
        {/* ======================================================== */}
        <div className="relative hidden md:flex flex-row items-center justify-between gap-4">
          {/* LADO RADIANT */}
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-5/12 justify-start">
            {/* Logo Radiant - Placa afilada */}
            {game.radiant_team?.slug ? (
              <Link
                href={`/teams/${game.radiant_team.slug}`}
                className={`relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center border transition-all hover:scale-105 ${
                  radiantWon
                    ? "border-[#00e599] bg-[#07160e] shadow-[0_0_24px_rgba(0,229,153,0.35)]"
                    : "border-[#223026] bg-[#09110c] hover:border-[#00e599]/60"
                }`}
              >
                <span className={`pointer-events-none absolute -top-0.5 -right-0.5 w-2 h-2 rotate-45 ${radiantWon ? "bg-[#00e599]" : "bg-[#00e599]/40"}`} />
                {game.radiant_team?.logo_url ? (
                  <picture>
                    <img
                      src={game.radiant_team.logo_url}
                      alt={radiantName}
                      className="h-11 w-11 sm:h-14 sm:w-14 object-contain"
                    />
                  </picture>
                ) : (
                  <IconShield
                    size={32}
                    className={radiantWon ? "text-[#00e599]" : "text-[#00e599]/60"}
                  />
                )}
              </Link>
            ) : (
              <div
                className={`relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center border transition-all ${
                  radiantWon
                    ? "border-[#00e599] bg-[#07160e] shadow-[0_0_24px_rgba(0,229,153,0.35)]"
                    : "border-[#223026] bg-[#09110c]"
                }`}
              >
                <span className={`pointer-events-none absolute -top-0.5 -right-0.5 w-2 h-2 rotate-45 ${radiantWon ? "bg-[#00e599]" : "bg-[#00e599]/40"}`} />
                {game.radiant_team?.logo_url ? (
                  <picture>
                    <img
                      src={game.radiant_team.logo_url}
                      alt={radiantName}
                      className="h-11 w-11 sm:h-14 sm:w-14 object-contain"
                    />
                  </picture>
                ) : (
                  <IconShield
                    size={32}
                    className={radiantWon ? "text-[#00e599]" : "text-[#00e599]/60"}
                  />
                )}
              </div>
            )}

            {/* Info Radiant */}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-chakra font-bold tracking-[0.2em] text-[#00e599] uppercase">
                THE RADIANT
              </span>
              <h2
                className={`text-lg sm:text-2xl font-chakra font-black uppercase tracking-wide truncate ${
                  radiantWon ? "text-[#00e599] drop-shadow-[0_0_12px_rgba(0,229,153,0.3)]" : "text-white"
                }`}
              >
                {game.radiant_team?.slug ? (
                  <Link href={`/teams/${game.radiant_team.slug}`} className="hover:text-[#00e599] transition-colors">
                    {radiantName}
                  </Link>
                ) : (
                  radiantName
                )}
              </h2>

              {radiantCaptainTag && (
                <span className="text-xs font-chakra font-semibold tracking-wider text-[#d8b467] mt-0.5">
                  [{radiantCaptainTag}]
                </span>
              )}

              {radiantWon && (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-[#00e599] bg-[#00e599]/15 text-[#00e599] text-[10px] font-chakra font-black tracking-widest uppercase shadow-[0_0_12px_rgba(0,229,153,0.25)]">
                    <IconTrophy size={12} className="stroke-[2.5]" />
                    <span>VICTORY</span>
                  </span>
                </div>
              )}

              {hasDraftHeroes && renderHeaderHeroPicks(radiantHeroesToRender, true)}
            </div>
          </div>

          {/* CENTRO: MODO, KILLS, DURACIÓN Y ESTADO */}
          <div className="flex flex-col items-center justify-center text-center w-full md:w-auto shrink-0 py-1">
            {/* Modo de juego / Stage */}
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-[#d8b467]" />
              <span className="text-[10px] sm:text-[11px] font-chakra uppercase tracking-[0.25em] text-[#d8b467] font-bold">
                {stageBadgeText}
              </span>
              <span className="w-1 h-1 bg-[#d8b467]" />
            </div>

            {/* Fila central: Radiant Kills | Duración | Dire Kills */}
            <div className="my-1.5 flex items-center justify-center gap-4 sm:gap-6">
              {/* Radiant Kills */}
              <span className="text-3xl sm:text-5xl font-black font-chakra text-[#00e599] tracking-tight tabular-nums drop-shadow-[0_0_14px_rgba(0,229,153,0.4)]">
                {radiantKills !== null ? radiantKills : (radiantWon ? "1" : "-")}
              </span>

              {/* Separador */}
              <span className="h-7 w-px bg-linear-to-b from-transparent via-[#4a3e2e] to-transparent" />

              {/* Duración */}
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-4xl font-black font-mono text-white tracking-wider tabular-nums">
                  {formatDuration(durationSec)}
                </span>
              </div>

              {/* Separador */}
              <span className="h-7 w-px bg-linear-to-b from-transparent via-[#4a3e2e] to-transparent" />

              {/* Dire Kills */}
              <span className="text-3xl sm:text-5xl font-black font-chakra text-[#ff6b6b] tracking-tight tabular-nums drop-shadow-[0_0_14px_rgba(255,107,107,0.4)]">
                {direKills !== null ? direKills : (direWon ? "1" : "-")}
              </span>
            </div>

            {/* Subtítulo: tiempo transcurrido */}
            <span className="text-[9px] sm:text-[10px] font-chakra uppercase tracking-[0.2em] text-[#8e857b] font-semibold">
              {statusSubtitle}
            </span>
            {hasMultipleGames && (radiantSeriesScore !== null || direSeriesScore !== null) && (
              <div className="mt-1.5 inline-flex items-center gap-2 px-2.5 py-0.5 border border-[#d8b467]/30 bg-[#16120c] text-[10px] font-chakra font-bold tracking-widest text-[#d8b467] shadow-xs">
                <span className="text-[#8e857b]">SERIE:</span>
                <span className="font-mono font-black text-white">{radiantSeriesScore ?? 0}</span>
                <span className="text-[#8e857b]">-</span>
                <span className="font-mono font-black text-white">{direSeriesScore ?? 0}</span>
              </div>
            )}
          </div>

          {/* LADO DIRE */}
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-5/12 justify-end flex-row-reverse md:flex-row text-right">
            {/* Info Dire */}
            <div className="flex flex-col items-end min-w-0 flex-1">
              <span className="text-[10px] font-chakra font-bold tracking-[0.2em] text-[#ff6b6b] uppercase">
                THE DIRE
              </span>
              <h2
                className={`text-lg sm:text-2xl font-chakra font-black uppercase tracking-wide truncate ${
                  direWon ? "text-[#ff6b6b] drop-shadow-[0_0_12px_rgba(255,107,107,0.3)]" : "text-[#ff6b6b]/90"
                }`}
              >
                {game.dire_team?.slug ? (
                  <Link href={`/teams/${game.dire_team.slug}`} className="hover:text-[#ff4d4d] transition-colors">
                    {direName}
                  </Link>
                ) : (
                  direName
                )}
              </h2>

              {direCaptainTag && (
                <span className="text-xs font-chakra font-semibold tracking-wider text-[#d8b467] mt-0.5">
                  [{direCaptainTag}]
                </span>
              )}

              {direWon && (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-[#ff4d4d] bg-[#ff4d4d]/15 text-[#ff6b6b] text-[10px] font-chakra font-black tracking-widest uppercase shadow-[0_0_12px_rgba(255,77,77,0.25)]">
                    <IconTrophy size={12} className="stroke-[2.5]" />
                    <span>VICTORY</span>
                  </span>
                </div>
              )}

              {hasDraftHeroes && renderHeaderHeroPicks(direHeroesToRender, false)}
            </div>

            {/* Logo Dire - Placa afilada */}
            {game.dire_team?.slug ? (
              <Link
                href={`/teams/${game.dire_team.slug}`}
                className={`relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center border transition-all hover:scale-105 ${
                  direWon
                    ? "border-[#ff4d4d] bg-[#220909] shadow-[0_0_24px_rgba(255,77,77,0.35)]"
                    : "border-[#301616] bg-[#140808] hover:border-[#ff4d4d]/60"
                }`}
              >
                <span className={`pointer-events-none absolute -top-0.5 -left-0.5 w-2 h-2 rotate-45 ${direWon ? "bg-[#ff4d4d]" : "bg-[#ff4d4d]/40"}`} />

                {game.dire_team?.logo_url ? (
                  <picture>
                    <img
                      src={game.dire_team.logo_url}
                      alt={direName}
                      className="h-11 w-11 sm:h-14 sm:w-14 object-contain"
                    />
                  </picture>
                ) : (
                  <IconFlame
                    size={32}
                    className={direWon ? "text-[#ff6b6b]" : "text-[#ff6b6b]/50"}
                  />
                )}
              </Link>
            ) : (
              <div
                className={`relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center border transition-all ${
                  direWon
                    ? "border-[#ff4d4d] bg-[#220909] shadow-[0_0_24px_rgba(255,77,77,0.35)]"
                    : "border-[#301616] bg-[#140808]"
                }`}
              >
                <span className={`pointer-events-none absolute -top-0.5 -left-0.5 w-2 h-2 rotate-45 ${direWon ? "bg-[#ff4d4d]" : "bg-[#ff4d4d]/40"}`} />

                {game.dire_team?.logo_url ? (
                  <picture>
                    <img
                      src={game.dire_team.logo_url}
                      alt={direName}
                      className="h-11 w-11 sm:h-14 sm:w-14 object-contain"
                    />
                  </picture>
                ) : (
                  <IconFlame
                    size={32}
                    className={direWon ? "text-[#ff6b6b]" : "text-[#ff6b6b]/50"}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selector de Partidas de la Serie (sólo si hay más de 1 partida) */}
        <GameSeriesSwitcher game={game} />
      </div>
    </div>
  );
}
