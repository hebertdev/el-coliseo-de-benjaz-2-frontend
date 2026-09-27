"use client";

import { useState, useEffect } from "react";
import { GameDetailData } from "interfaces/games";
import { getGameBySlugClientAPI } from "services/games";
import { GameMatchHeader } from "./GameMatchHeader";
import { GameMvpCard } from "./GameMvpCard";
import { GameMatchupBoard } from "./GameMatchupBoard";
import { GameTeamOverviewBoard } from "./GameTeamOverviewBoard";
import { GameAdvantageAndMap } from "./GameAdvantageAndMap";
import { GameAbilityBuildBoard } from "./GameAbilityBuildBoard";
import { GameKillMatrixBoard } from "./GameKillMatrixBoard";
import { GameVisionBoard } from "./GameVisionBoard";
import { GameTeamfightBoard } from "./GameTeamfightBoard";
import { GameGraphsBoard } from "./GameGraphsBoard";
import { GameNavigationTabs, GameTabType } from "./GameNavigationTabs";

import { GameScheduledBoard } from "./GameScheduledBoard";

interface GameDetailsProps {
  game: GameDetailData;
}

export function GameDetails({ game: initialGame }: GameDetailsProps) {
  const [polledGame, setPolledGame] = useState<GameDetailData | null>(null);
  const [activeTab, setActiveTab] = useState<GameTabType>("scoreboard");

  const currentGame =
    polledGame && polledGame.slug === initialGame.slug ? polledGame : initialGame;

  // La partida se considera jugada/cerrada si el status es COMPLETED o tiene jugadores de OpenDota
  const isMatchCompleted =
    (currentGame.status === "COMPLETED" || currentGame.status === "FINISHED") &&
    Boolean(currentGame.opendota_data?.players && currentGame.opendota_data.players.length > 0);

  // La partida tiene su replay parseado completo si contiene versión o teamfights de OpenDota
  const isReplayParsed =
    (currentGame.status === "COMPLETED" || currentGame.status === "FINISHED") &&
    Boolean(
      currentGame.opendota_data?.version ||
      (currentGame.opendota_data?.teamfights && currentGame.opendota_data.teamfights.length > 0)
    );

  // Polling automático continuo: se mantiene activo en vivo durante draft, combate y parseo de OpenDota
  useEffect(() => {
    // Si la partida ya finalizó Y su replay está 100% parseado, no se requiere más sondeo
    if (isReplayParsed) return;

    let isMounted = true;

    const poll = async () => {
      // Si la pestaña está oculta, evitamos saturar la red (al volver se disparará inmediatamente)
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }

      try {
        const freshGame = await getGameBySlugClientAPI(initialGame.slug);
        if (isMounted && freshGame) {
          setPolledGame((prev) => {
            const current = prev && prev.slug === initialGame.slug ? prev : initialGame;
            // Comparación de snapshot completa: detecta picks, estado a COMPLETED, score de serie,
            // creación de Game 4, scores de OpenDota, teamfights, etc.
            if (JSON.stringify(current) !== JSON.stringify(freshGame)) {
              return freshGame;
            }
            return current;
          });
        }
      } catch {
        // Ignorar fallos transitorios de red durante polling
      }
    };

    // Ejecución inmediata en montaje para sincronizar sin esperar intervalo
    poll();
    const interval = setInterval(poll, 2500);

    // Cuando el usuario regresa a la pestaña activa, forzar un refresco inmediato
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        poll();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [initialGame, isReplayParsed]);

  const teamfightsCount =
    currentGame.opendota_data?.teamfights?.length ||
    Math.max(3, Math.min(8, Math.round((currentGame.duration_seconds || 2400) / 360)));

  return (
    <div className="relative w-full min-h-screen bg-[#120f0a] text-white overflow-hidden pb-16">
      {/* Tactical Matrix Grid Background - Estilo Coliseo */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1f1913_1px,transparent_1px),linear-gradient(to_bottom,#1f1913_1px,transparent_1px)] bg-size-[44px_44px] opacity-25" />

      {/* Resplandor ambiental de arena */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(216,180,103,0.08)_0%,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        <GameMatchHeader game={currentGame} />

        {/* Notificación sutil si el mapa finalizó pero el replay detallado sigue procesándose en OpenDota */}
        {isMatchCompleted && !isReplayParsed && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs sm:text-sm animate-pulse">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span>
                <strong>OpenDota Replay:</strong> Procesando análisis profundo de la partida (teamfights, ventaja de oro/XP y habilidades en camino)...
              </span>
            </div>
            <span className="text-[11px] text-amber-400/80 font-mono hidden sm:inline">
              Sondeo en vivo
            </span>
          </div>
        )}

        {/* Si la partida aún no se ha jugado o no tiene datos de combate, mostrar vista de programada / no disponible */}
        {!isMatchCompleted ? (
          <GameScheduledBoard game={currentGame} />
        ) : (
          <>
            <GameMvpCard game={currentGame} />
            
            {/* Barra de Tabs estilo templo imperial */}
            <GameNavigationTabs
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              teamfightsCount={teamfightsCount}
            />

            {/* Contenido según tab activo */}
            {activeTab === "scoreboard" && (
              <div className="space-y-10">
                <GameMatchupBoard game={currentGame} />
                <GameTeamOverviewBoard game={currentGame} />
                <GameAdvantageAndMap game={currentGame} />
                <GameKillMatrixBoard game={currentGame} />
              </div>
            )}

            {activeTab === "skills" && (
              <div className="space-y-10">
                <GameAbilityBuildBoard game={currentGame} />
              </div>
            )}

            {activeTab === "vision" && (
              <div className="space-y-10">
                <GameVisionBoard game={currentGame} />
              </div>
            )}

            {activeTab === "teamfights" && (
              <div className="space-y-10">
                <GameTeamfightBoard game={currentGame} />
              </div>
            )}

            {activeTab === "graphs" && (
              <div className="space-y-10">
                <GameGraphsBoard game={currentGame} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
