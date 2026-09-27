"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  IconX,
  IconSwords,
  IconShield,
  IconClock,
  IconArrowRight,
} from "@tabler/icons-react";
import type {
  PlayoffBracketMatch,
  PlayoffThirdPlaceMatch,
  StageGameData,
} from "interfaces/stages";
import type { SeriesLiveMatchData } from "interfaces/matches";
import { getSeriesLiveAPI } from "services/games";

interface PlayoffMatchModalProps {
  match: PlayoffBracketMatch | PlayoffThirdPlaceMatch | null;
  roundName?: string;
  onClose: () => void;
}

const emptySubscribe = () => () => {};

function formatDateString(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

function isStatusOngoing(status?: string | null): boolean {
  if (!status) return false;
  const s = status.trim().toUpperCase();
  return (
    s === "ONGOING" ||
    s === "LIVE" ||
    s === "IN_PROGRESS" ||
    s === "EN CURSO" ||
    s === "PLAYING"
  );
}

function isStatusCompleted(status?: string | null): boolean {
  if (!status) return false;
  const s = status.trim().toUpperCase();
  return s === "COMPLETED" || s === "FINISHED" || s === "DONE";
}

export function PlayoffMatchModal({
  match,
  roundName,
  onClose,
}: PlayoffMatchModalProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isCompleted = isStatusCompleted(match?.status);
  const [liveSeriesData, setLiveSeriesData] = useState<SeriesLiveMatchData | null>(null);

  const seriesSlug =
    match?.slug ||
    (match?.games && match.games.length > 0 && match.games[0]?.slug
      ? match.games[0].slug.replace(/-game-\d+$/, "")
      : null);

  // Polling automático cada 2.5 segundos si la serie está en curso y modal abierto
  useEffect(() => {
    if (!seriesSlug || isCompleted) return;

    let isMountedLocal = true;

    const fetchLive = async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      try {
        const data = await getSeriesLiveAPI(seriesSlug);
        if (isMountedLocal && data) {
          setLiveSeriesData(data);
        }
      } catch {
        // Ignorar fallos transitorios durante polling
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 2500);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchLive();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isMountedLocal = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [seriesSlug, isCompleted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isMounted || !match) return null;

  const isOngoing = isStatusOngoing(match.status);
  const isScheduled = match.status === "SCHEDULED";

  const teamA = match.slot_a.team;
  const teamB = match.slot_b.team;

  const nameA = teamA?.name || match.slot_a.placeholder || "Por determinar";
  const nameB = teamB?.name || match.slot_b.placeholder || "Por determinar";

  const scoreA = liveSeriesData ? liveSeriesData.score_a : (match.slot_a.score !== null ? match.slot_a.score : 0);
  const scoreB = liveSeriesData ? liveSeriesData.score_b : (match.slot_b.score !== null ? match.slot_b.score : 0);

  const matchTitle =
    (match as PlayoffThirdPlaceMatch).match_name ||
    `${roundName || "Playoffs"} · ${match.identifier}`;

  const formattedDate = formatDateString(match.scheduled_at);

  // Generate fallback games list if empty
  const gamesList: StageGameData[] =
    match.games && match.games.length > 0
      ? match.games
      : [
          {
            game_number: 1,
            status: match.status || "SCHEDULED",
            opendota_match_id: null,
            radiant_team: teamA,
            dire_team: teamB,
            radiant_picks: [],
            dire_picks: [],
            radiant_heroes: Array(5).fill({
              has_hero: false,
              hero_id: null,
              hero_name: null,
              image_url: null,
            }),
            dire_heroes: Array(5).fill({
              has_hero: false,
              hero_id: null,
              hero_name: null,
              image_url: null,
            }),
            winner_slug: null,
            duration_seconds: null,
            started_at: null,
            ended_at: null,
          },
        ];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8"
      onClick={onClose}
    >
      {/* Fullscreen Backdrop Overlay (0.5 opacity with blur) */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Modal Card with Imperial Format Style matching TrueSightModal */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#2a231b] bg-[#120f0c] p-4 sm:p-6 shadow-[0_0_60px_rgba(0,0,0,0.95)] transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Roman Imperial Delicate Frame Corner Cyan Gems */}
        <span className="pointer-events-none absolute -top-1.5 -left-1.5 z-20 h-3 w-3 sm:h-3.5 sm:w-3.5 rotate-45 border border-[#6cc4ff] bg-[#2e9df0] shadow-[0_0_10px_rgba(46,157,240,0.9)]" />
        <span className="pointer-events-none absolute -top-1.5 -right-1.5 z-20 h-3 w-3 sm:h-3.5 sm:w-3.5 rotate-45 border border-[#6cc4ff] bg-[#2e9df0] shadow-[0_0_10px_rgba(46,157,240,0.9)]" />
        <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 z-20 h-3 w-3 sm:h-3.5 sm:w-3.5 rotate-45 border border-[#6cc4ff] bg-[#2e9df0] shadow-[0_0_10px_rgba(46,157,240,0.9)]" />
        <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 z-20 h-3 w-3 sm:h-3.5 sm:w-3.5 rotate-45 border border-[#6cc4ff] bg-[#2e9df0] shadow-[0_0_10px_rgba(46,157,240,0.9)]" />

        {/* Inner Delicate Gold Engraved Line */}
        <span className="pointer-events-none absolute inset-1.5 sm:inset-2 border border-[#d8b467]/30" />

        {/* Tactical Matrix Grid Background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1f1913_1px,transparent_1px),linear-gradient(to_bottom,#1f1913_1px,transparent_1px)] bg-[size:32px_32px] opacity-35" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between pb-3 sm:pb-4 border-b border-[#2d261e]">
          <div className="flex items-center gap-2 font-chakra text-xs sm:text-sm font-bold uppercase tracking-wider text-[#f0d38f]">
            <IconSwords size={18} className="text-[#6cc4ff]" />
            <span>{matchTitle}</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 border border-[#6cc4ff]/40 text-[#6cc4ff] bg-[#6cc4ff]/10">
              {match.best_of}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            {isOngoing ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#53fc18] font-bold px-2 py-0.5 bg-[#53fc18]/15 border border-[#53fc18]/50 rounded-xs animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-[#53fc18] animate-ping" />
                EN VIVO (LIVE)
              </span>
            ) : isCompleted ? (
              <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xs">
                COMPLETADO
              </span>
            ) : isScheduled ? (
              <span className="text-[10px] font-mono text-amber-400 font-bold px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-xs">
                PROGRAMADO
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[#8e857b] font-normal px-2 py-0.5 bg-[#241e17] border border-[#3a3126] rounded-xs">
                PENDIENTE
              </span>
            )}

            <button
              onClick={onClose}
              className="text-[#8e857b] hover:text-white p-1 transition-colors rounded-xs border border-transparent hover:border-[#3a3126]"
              title="Cerrar modal"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="relative z-10 p-2 sm:p-4 overflow-y-auto space-y-4 font-mono text-xs text-[#c7bcab]">
          {/* Scheduled Date Banner if present */}
          {formattedDate && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8e857b] bg-[#16120e] border border-[#241e17] py-1.5 px-3">
              <IconClock size={14} className="text-[#6cc4ff]" />
              <span>Programado: {formattedDate}</span>
            </div>
          )}

          {/* Teams Header Score Card */}
          <div className="border border-[#2d261e] bg-[#16120e] p-4 flex items-center justify-between gap-4">
            {/* Team A */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 shrink-0 flex items-center justify-center border border-[#2d261e] bg-[#1a1511]">
                {teamA?.logo_url ? (
                  <picture>
                    <img
                      src={teamA.logo_url}
                      alt={nameA}
                      className="h-8 w-8 object-contain"
                    />
                  </picture>
                ) : (
                  <IconShield size={20} className="text-[#8e857b]" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white text-sm sm:text-base truncate">
                  {nameA}
                </div>
                {teamA?.region && (
                  <div className="text-[10px] text-[#8e857b]">
                    {teamA.region} {teamA.tag ? `· ${teamA.tag}` : ""}
                  </div>
                )}
              </div>
            </div>

            {/* Score Center */}
            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`font-chakra text-2xl sm:text-3xl font-black ${
                  isOngoing ? "text-[#53fc18]" : "text-[#f0d38f]"
                }`}
              >
                {scoreA}
              </span>
              <span className="text-[#8e857b] font-bold text-lg">:</span>
              <span
                className={`font-chakra text-2xl sm:text-3xl font-black ${
                  isOngoing ? "text-[#53fc18]" : "text-[#f0d38f]"
                }`}
              >
                {scoreB}
              </span>
            </div>

            {/* Team B */}
            <div className="flex items-center justify-end gap-3 min-w-0 flex-1 text-right">
              <div className="min-w-0">
                <div className="font-bold text-white text-sm sm:text-base truncate">
                  {nameB}
                </div>
                {teamB?.region && (
                  <div className="text-[10px] text-[#8e857b]">
                    {teamB.tag ? `${teamB.tag} · ` : ""}
                    {teamB.region}
                  </div>
                )}
              </div>
              <div className="h-10 w-10 shrink-0 flex items-center justify-center border border-[#2d261e] bg-[#1a1511]">
                {teamB?.logo_url ? (
                  <picture>
                    <img
                      src={teamB.logo_url}
                      alt={nameB}
                      className="h-8 w-8 object-contain"
                    />
                  </picture>
                ) : (
                  <IconShield size={20} className="text-[#8e857b]" />
                )}
              </div>
            </div>
          </div>

          {/* Games List Subpanels */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-chakra font-bold text-[#f0d38f] uppercase tracking-wider flex items-center gap-2 border-b border-[#2d261e] pb-1.5">
              <IconSwords size={14} className="text-[#6cc4ff]" />
              <span>Partidas de la Serie ({gamesList.length})</span>
            </div>

            {gamesList.map((g, gIdx) => {
              const gameNum = g.game_number || gIdx + 1;
              const isThisLiveGame =
                liveSeriesData?.current_game &&
                (liveSeriesData.current_game.game_number === gameNum ||
                  liveSeriesData.current_game.slug === g.slug);

              const effectiveStatus = isThisLiveGame && liveSeriesData?.current_game
                ? liveSeriesData.current_game.status
                : g.status;

              const isDirectOngoing = isStatusOngoing(effectiveStatus);
              const gCompleted =
                effectiveStatus === "COMPLETED" ||
                effectiveStatus === "FINISHED" ||
                Boolean(g.winner_slug);

              const radName =
                g.radiant_team?.name || teamA?.name || "Equipo Radiant";
              const direName =
                g.dire_team?.name || teamB?.name || "Equipo Dire";

              let radHeroes = g.radiant_heroes || Array(5).fill({});
              let direHeroes = g.dire_heroes || Array(5).fill({});

              if (isThisLiveGame && liveSeriesData?.current_game) {
                const cg = liveSeriesData.current_game;
                if (cg.radiant_picks && cg.radiant_picks.length > 0) {
                  radHeroes = Array(5).fill({}).map((empty, idx) => {
                    const pick = cg.radiant_picks[idx];
                    return pick
                      ? { has_hero: true, hero_id: pick.hero_id, hero_name: pick.hero_name, image_url: pick.image_url }
                      : empty;
                  });
                }
                if (cg.dire_picks && cg.dire_picks.length > 0) {
                  direHeroes = Array(5).fill({}).map((empty, idx) => {
                    const pick = cg.dire_picks[idx];
                    return pick
                      ? { has_hero: true, hero_id: pick.hero_id, hero_name: pick.hero_name, image_url: pick.image_url }
                      : empty;
                  });
                }
              }

              const winner = g.winner_slug || match.winner_slug || null;
              const radSlug = g.radiant_team?.slug || teamA?.slug;
              const direSlug = g.dire_team?.slug || teamB?.slug;

              const isRadWinner = Boolean(
                gCompleted &&
                  winner &&
                  radSlug &&
                  winner.trim() === radSlug.trim()
              );
              const isDireWinner = Boolean(
                gCompleted &&
                  winner &&
                  direSlug &&
                  winner.trim() === direSlug.trim()
              );

              const isRadLoser = Boolean(
                gCompleted &&
                  winner &&
                  radSlug &&
                  winner.trim() !== radSlug.trim()
              );
              const isDireLoser = Boolean(
                gCompleted &&
                  winner &&
                  direSlug &&
                  winner.trim() !== direSlug.trim()
              );

              const effectiveMatchId = isThisLiveGame && liveSeriesData?.current_game?.opendota_match_id
                ? liveSeriesData.current_game.opendota_match_id
                : g.opendota_match_id;

              const gameSlug =
                (isThisLiveGame && liveSeriesData?.current_game?.slug) ||
                g.slug ||
                (match.slug ? `${match.slug}-game-${gameNum}` : null);

              return (
                <div
                  key={gIdx}
                  className={`border p-3 space-y-2.5 text-[11px] ${
                    isDirectOngoing
                      ? "bg-[#091508] border-[#53fc18]/50 shadow-xs"
                      : "bg-[#0c0907] border-[#241e17]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[#8e857b] font-mono flex-wrap gap-1.5 border-b border-[#241e17] pb-1.5">
                    <span className="flex items-center gap-1.5 font-bold text-[#e0deda]">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isDirectOngoing
                            ? "bg-[#53fc18] animate-ping"
                            : gCompleted
                            ? "bg-emerald-400"
                            : "bg-amber-500"
                        }`}
                      />
                      JUEGO {gameNum} ·{" "}
                      {isDirectOngoing ? (
                        <span className="inline-flex items-center gap-1 text-[#53fc18] font-bold px-1.5 py-0.2 bg-[#53fc18]/10 border border-[#53fc18]/50 rounded-xs animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#53fc18] animate-ping" />
                          EN VIVO (LIVE)
                        </span>
                      ) : (
                        <span
                          className={
                            gCompleted ? "text-emerald-400" : "text-amber-500"
                          }
                        >
                          {effectiveStatus}
                        </span>
                      )}
                    </span>

                    {effectiveMatchId && (
                      <span className="text-[#6cc4ff] flex items-center gap-1">
                        ID: {effectiveMatchId}
                      </span>
                    )}
                  </div>

                  {/* Hero Picks - Radiant Team */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={isRadWinner ? "font-bold text-[#53fc18]" : "font-bold text-[#53fc18]"}>
                        Radiant: {radName}
                      </span>
                      {isRadWinner && (
                        <span className="text-[#53fc18] font-bold">
                          ✓ GANADOR
                        </span>
                      )}
                      {isRadLoser && (
                        <span className="text-[#ff7373] font-bold">
                          DERROTADO
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {radHeroes.slice(0, 5).map((h, hIdx) => (
                        <div
                          key={hIdx}
                          className={`aspect-[4/3] w-full border bg-[#14100c] relative overflow-hidden flex items-center justify-center group ${
                            isRadLoser ? "border-red-500/40" : "border-[#2d261e]"
                          }`}
                          title={h?.hero_name || "Pick por seleccionar"}
                        >
                          {h?.image_url ? (
                            <>
                              <picture className="w-full h-full">
                                <img
                                  src={h.image_url}
                                  alt={h.hero_name || "Hero"}
                                  className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                                    isRadLoser ? "opacity-90 brightness-95" : ""
                                  }`}
                                />
                              </picture>
                              {isRadLoser && (
                                <div className="absolute inset-0 bg-red-950/15 border border-red-500/25 pointer-events-none" />
                              )}
                            </>
                          ) : (
                            <IconShield
                              size={14}
                              className="text-[#3a3126]"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hero Picks - Dire Team */}
                  <div className="space-y-1 pt-1 border-t border-[#1e1913]">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={isDireWinner ? "font-bold text-[#53fc18]" : "font-bold text-[#ff5252]"}>
                        Dire: {direName}
                      </span>
                      {isDireWinner && (
                        <span className="text-[#53fc18] font-bold">
                          ✓ GANADOR
                        </span>
                      )}
                      {isDireLoser && (
                        <span className="text-[#ff7373] font-bold">
                          DERROTADO
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {direHeroes.slice(0, 5).map((h, hIdx) => (
                        <div
                          key={hIdx}
                          className={`aspect-[4/3] w-full border bg-[#14100c] relative overflow-hidden flex items-center justify-center group ${
                            isDireLoser ? "border-red-500/40" : "border-[#2d261e]"
                          }`}
                          title={h?.hero_name || "Pick por seleccionar"}
                        >
                          {h?.image_url ? (
                            <>
                              <picture className="w-full h-full">
                                <img
                                  src={h.image_url}
                                  alt={h.hero_name || "Hero"}
                                  className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                                    isDireLoser ? "opacity-90 brightness-95" : ""
                                  }`}
                                />
                              </picture>
                              {isDireLoser && (
                                <div className="absolute inset-0 bg-red-950/15 border border-red-500/25 pointer-events-none" />
                              )}
                            </>
                          ) : (
                            <IconShield
                              size={14}
                              className="text-[#3a3126]"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botón Ver Detalle después de Dire */}
                  {gameSlug && (
                    <div className="pt-1.5">
                      <Link
                        href={`/game/${gameSlug}`}
                        onClick={onClose}
                        className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 text-[10px] font-chakra font-bold uppercase tracking-wider text-[#e5b869] bg-[#e5b869]/10 hover:bg-[#e5b869] hover:text-black border border-[#e5b869]/30 hover:border-[#e5b869] rounded-xs transition-all duration-200 group/btn shadow-xs"
                        title="Ver detalles de la partida"
                      >
                        <span>VER DETALLE</span>
                        <IconArrowRight size={11} className="transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
