"use client";

import React from "react";
import Link from "next/link";
import {
  IconSwords,
  IconTrophy,
  IconClock,
  IconChevronRight,
  IconShield,
  IconFlame,
} from "@tabler/icons-react";
import { GameDetailData, GameSeriesGameItem } from "interfaces/games";

interface GameSeriesSwitcherProps {
  game: GameDetailData;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function GameSeriesSwitcher({ game }: GameSeriesSwitcherProps) {
  const seriesGames: GameSeriesGameItem[] = game.series?.games || game.series_games || [];

  // Si no hay más de 1 partida en la serie, no mostramos el selector
  if (!seriesGames || seriesGames.length <= 1) {
    return null;
  }

  const series = game.series;
  const bestOf = series?.best_of || game.series_best_of || "BO3";
  const bestOfDisplay =
    series?.best_of_display ||
    game.series_best_of_display ||
    (bestOf.toUpperCase() === "BO3"
      ? "Mejor de 3"
      : bestOf.toUpperCase() === "BO5"
      ? "Mejor de 5"
      : bestOf.toUpperCase() === "BO1"
      ? "Mejor de 1"
      : bestOf);

  const radiantSlug = game.radiant_team?.slug;
  const direSlug = game.dire_team?.slug;
  const radiantName = game.radiant_team?.name || "Radiant";
  const direName = game.dire_team?.name || "Dire";

  // Determinación de marcador de la serie para cada equipo
  let radiantSeriesScore: number | null = null;
  let direSeriesScore: number | null = null;

  if (series) {
    if (radiantSlug && series.team_a_slug === radiantSlug) {
      radiantSeriesScore = series.score_a;
    } else if (radiantSlug && series.team_b_slug === radiantSlug) {
      radiantSeriesScore = series.score_b;
    }

    if (direSlug && series.team_a_slug === direSlug) {
      direSeriesScore = series.score_a;
    } else if (direSlug && series.team_b_slug === direSlug) {
      direSeriesScore = series.score_b;
    }
  }

  // Fallback calculando a partir de los juegos ganados si no estuvieran en score_a/score_b
  if (radiantSeriesScore == null && radiantSlug) {
    radiantSeriesScore = seriesGames.filter((g) => g.winner_slug === radiantSlug).length;
  }
  if (direSeriesScore == null && direSlug) {
    direSeriesScore = seriesGames.filter((g) => g.winner_slug === direSlug).length;
  }

  const seriesWinnerSlug = series?.winner_slug;
  const seriesWinnerName =
    seriesWinnerSlug === radiantSlug
      ? radiantName
      : seriesWinnerSlug === direSlug
      ? direName
      : null;

  const isSeriesCompleted =
    series?.status === "COMPLETED" ||
    series?.status === "FINISHED" ||
    Boolean(seriesWinnerSlug);

  return (
    <div className="w-full mt-4 sm:mt-5 pt-4 border-t border-[#2d261e]/90">
      {/* Barra superior de la serie: Formato, Estado y Marcador Global */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3 px-0.5">
        <div className="flex items-center flex-wrap gap-2">
          {/* Badge de formato de serie */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1a140d] border border-[#d8b467]/40 text-[#f0d38f] text-[10px] sm:text-[11px] font-chakra font-black tracking-wider uppercase shadow-xs">
            <IconSwords size={13} className="text-[#d8b467]" />
            <span>SERIE {bestOf.toUpperCase()}</span>
            <span className="text-[#8e857b] font-normal hidden min-[400px]:inline">·</span>
            <span className="text-[#c7baa8] font-medium hidden min-[400px]:inline">{bestOfDisplay}</span>
          </div>

          {/* Estado de la serie */}
          {seriesWinnerName ? (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#d8b467]/30 bg-[#d8b467]/10 text-[#f0d38f] text-[10px] font-chakra font-bold tracking-wider uppercase">
              <IconTrophy size={12} className="text-[#d8b467]" />
              <span className="truncate max-w-[200px]">GANADOR: {seriesWinnerName}</span>
            </div>
          ) : isSeriesCompleted ? (
            <span className="text-[10px] font-chakra font-bold uppercase tracking-wider text-[#8e857b]">
              SERIE FINALIZADA
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-chakra font-bold uppercase tracking-wider text-[#00e599]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e599] animate-pulse" />
              SERIE EN DISPUTA
            </span>
          )}
        </div>

        {/* Marcador Global de la Serie */}
        {(radiantSeriesScore !== null || direSeriesScore !== null) && (
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-chakra tracking-wider">
            <span className="text-[10px] uppercase font-bold text-[#8e857b] hidden sm:inline">
              MARCADOR SERIE:
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0e0b08] border border-[#3d3224] shadow-xs">
              <span className={`font-black ${radiantSeriesScore! > (direSeriesScore || 0) ? "text-[#00e599]" : "text-white"}`}>
                {radiantName}
              </span>
              <span className="font-mono font-black text-[#d8b467] px-1 bg-[#1a140e]">
                {radiantSeriesScore ?? 0} - {direSeriesScore ?? 0}
              </span>
              <span className={`font-black ${(direSeriesScore || 0) > (radiantSeriesScore || 0) ? "text-[#ff6b6b]" : "text-white"}`}>
                {direName}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Partidas de la Serie */}
      <div
        className={`grid gap-2 sm:gap-2.5 ${
          seriesGames.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : seriesGames.length === 3
            ? "grid-cols-1 sm:grid-cols-3"
            : seriesGames.length === 4
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        }`}
      >
        {seriesGames.map((g) => {
          const isCurrent = Boolean(g.is_current || g.slug === game.slug);

          // Determinar ganador de este juego específico
          const isGameCompleted = g.status === "COMPLETED" || g.status === "FINISHED";
          const isGameOngoing = g.status === "ONGOING";
          const hasWinner = Boolean(g.winner_slug);

          const gameWinnerSlug = g.winner_slug;
          const isRadiantWinner = Boolean(gameWinnerSlug && gameWinnerSlug === radiantSlug);
          const isDireWinner = Boolean(gameWinnerSlug && gameWinnerSlug === direSlug);

          let gameWinnerName: string | null = null;
          if (isRadiantWinner) gameWinnerName = radiantName;
          else if (isDireWinner) gameWinnerName = direName;
          else if (gameWinnerSlug) gameWinnerName = gameWinnerSlug;

          const durationText = formatDuration(g.duration_seconds);

          // Tarjeta de la partida
          const content = (
            <div
              className={`relative flex flex-col justify-between p-2.5 sm:p-3 transition-all h-full ${
                isCurrent
                  ? "border border-[#d8b467] bg-linear-to-b from-[#241c11] via-[#1b140d] to-[#120e09] shadow-[0_0_18px_rgba(216,180,103,0.22)] ring-1 ring-[#d8b467]/30"
                  : "border border-[#2a2219] bg-[#120e0a]/90 hover:border-[#d8b467]/70 hover:bg-[#1c150e] hover:shadow-[0_0_14px_rgba(216,180,103,0.15)] group cursor-pointer"
              }`}
            >
              {/* Esquinas decorativas de placa en el juego actual */}
              {isCurrent && (
                <>
                  <span className="pointer-events-none absolute -top-1 -left-1 w-1.5 h-1.5 rotate-45 bg-[#d8b467]" />
                  <span className="pointer-events-none absolute -top-1 -right-1 w-1.5 h-1.5 rotate-45 bg-[#d8b467]" />
                  <span className="pointer-events-none absolute -bottom-1 -left-1 w-1.5 h-1.5 rotate-45 bg-[#d8b467]" />
                  <span className="pointer-events-none absolute -bottom-1 -right-1 w-1.5 h-1.5 rotate-45 bg-[#d8b467]" />
                </>
              )}

              {/* Fila 1: Número de Juego y Estado Actual */}
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <span
                  className={`text-[10px] sm:text-[11px] font-chakra font-black tracking-widest uppercase ${
                    isCurrent ? "text-[#f0d38f]" : "text-[#c7baa8] group-hover:text-[#f0d38f]"
                  }`}
                >
                  JUEGO {g.game_number}
                </span>

                {isCurrent ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#d8b467] text-[#120f0a] text-[9px] font-chakra font-black tracking-wider uppercase shadow-xs">
                    <span className="w-1 h-1 rounded-full bg-[#120f0a] animate-ping" />
                    <span>VIENDO AHORA</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-chakra font-bold text-[#8e857b] group-hover:text-[#f0d38f] transition-colors">
                    <span>Ver partida</span>
                    <IconChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </div>

              {/* Fila 2: Resultado de la partida */}
              <div className="my-1">
                {isGameCompleted ? (
                  hasWinner ? (
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-chakra font-bold truncate">
                      {isRadiantWinner ? (
                        <IconShield size={13} className="text-[#00e599] shrink-0" />
                      ) : isDireWinner ? (
                        <IconFlame size={13} className="text-[#ff6b6b] shrink-0" />
                      ) : (
                        <IconTrophy size={13} className="text-[#d8b467] shrink-0" />
                      )}
                      <span className="text-[#8e857b] text-[9px] sm:text-[10px] uppercase">Gana:</span>
                      <span
                        className={`truncate font-black uppercase ${
                          isRadiantWinner
                            ? "text-[#00e599]"
                            : isDireWinner
                            ? "text-[#ff6b6b]"
                            : "text-[#f0d38f]"
                        }`}
                        title={gameWinnerName || "Ganador"}
                      >
                        {gameWinnerName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-chakra font-bold text-[#8e857b] uppercase">
                      Finalizada
                    </span>
                  )
                ) : isGameOngoing ? (
                  <div className="inline-flex items-center gap-1 text-[10px] font-chakra font-bold text-[#00e599] uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e599] animate-pulse" />
                    <span>En juego ahora</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-chakra font-medium text-[#6e665d] uppercase">
                    Por disputarse
                  </span>
                )}
              </div>

              {/* Fila 3: Duración y Match ID */}
              <div className="flex items-center justify-between pt-1 border-t border-[#241e17]/80 text-[9px] text-[#8e857b]">
                <div className="flex items-center gap-1 font-mono">
                  <IconClock size={11} className="text-[#6e665d]" />
                  <span>{durationText}</span>
                </div>
                {g.opendota_match_id ? (
                  <span className="text-[8px] font-mono text-[#d8b467]/70 uppercase">
                    Stats ✓
                  </span>
                ) : (
                  <span className="text-[8px] font-chakra text-[#5a5246] uppercase">
                    {isGameCompleted ? "Registrado" : "Programado"}
                  </span>
                )}
              </div>
            </div>
          );

          return isCurrent ? (
            <div key={g.slug} className="h-full">
              {content}
            </div>
          ) : (
            <Link key={g.slug} href={`/game/${g.slug}`} className="h-full block">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
