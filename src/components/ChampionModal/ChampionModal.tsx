"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  IconX,
  IconCrown,
  IconTrophy,
  IconConfetti,
  IconFlame,
  IconSwords,
  IconShield,
  IconSparkles,
  IconBrandKick,
  IconBrandInstagram,
  IconArrowRight,
  IconHeartHandshake,
  IconExternalLink,
  IconMedal,
} from "@tabler/icons-react";
import { CountryFlag } from "components/ui/CountryFlag";
import { normalizeMediaUrl } from "lib/config";
import { fireChampionConfetti } from "./confetti";
import { getTeamRosterAPI, getTeamBySlugAPI } from "services/teams";
import { getRankMedalUrl } from "helpers/dota";
import type { TeamRosterMemberData, TeamData } from "interfaces/teams";

const emptySubscribe = () => () => {};

export interface ChampionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentSlug?: string;
  teamSlug?: string;
  teamLogo?: string | null;
  teamName?: string;
}

interface RosterMember {
  position: number;
  positionLabel: string;
  roleName: string;
  nickname: string;
  slug: string;
  isCaptain?: boolean;
  avatar: string | null;
  country: string;
  accountId: number | string;
  rankTier?: number | null;
  medalUrl?: string;
  leaderboardRank?: number | string | null;
  themeColor: string;
  themeBorder: string;
  themeBg: string;
  icon: typeof IconSwords;
  socials?: {
    kick?: string;
    instagram?: string;
  };
}

const DEFAULT_CHAMPION_ROSTER: RosterMember[] = [
  {
    position: 1,
    positionLabel: "Pos 1",
    roleName: "Carry",
    nickname: "Kotaro",
    slug: "kotaro",
    avatar: null,
    country: "PE",
    accountId: "185202677",
    rankTier: 80,
    medalUrl: "https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_8.png",
    leaderboardRank: 1153,
    themeColor: "text-[#00c8f8]",
    themeBorder: "border-[#00c8f8]/40 group-hover:border-[#00c8f8]",
    themeBg: "bg-[#00c8f8]/10",
    icon: IconSwords,
  },
  {
    position: 2,
    positionLabel: "Pos 2",
    roleName: "Midlane",
    nickname: "LeoStyle",
    slug: "leostyle",
    isCaptain: true,
    avatar: "/media/players/avatars/leostyle.jpeg",
    country: "PE",
    accountId: "59463394",
    rankTier: 80,
    medalUrl: "https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_8.png",
    leaderboardRank: 1811,
    themeColor: "text-[#f0d38f]",
    themeBorder: "border-[#f0d38f]/60 group-hover:border-[#ffe28a]",
    themeBg: "bg-[#d8b467]/20",
    icon: IconCrown,
    socials: {
      kick: "https://kick.com/leostyledota",
      instagram: "https://www.instagram.com/leostyledota/?hl=es-la",
    },
  },
  {
    position: 3,
    positionLabel: "Pos 3",
    roleName: "Offlane",
    nickname: "Chavalito",
    slug: "chavalito",
    avatar: null,
    country: "PE",
    accountId: "784126074",
    rankTier: 0,
    medalUrl: "https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_0.png",
    leaderboardRank: null,
    themeColor: "text-[#f59e0b]",
    themeBorder: "border-[#f59e0b]/40 group-hover:border-[#f59e0b]",
    themeBg: "bg-[#f59e0b]/10",
    icon: IconShield,
  },
  {
    position: 4,
    positionLabel: "Pos 4",
    roleName: "Soft Support",
    nickname: "Soe",
    slug: "soe",
    avatar: null,
    country: "PY",
    accountId: "197439394",
    rankTier: 50,
    medalUrl: "https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_5.png",
    leaderboardRank: null,
    themeColor: "text-[#10b981]",
    themeBorder: "border-[#10b981]/40 group-hover:border-[#10b981]",
    themeBg: "bg-[#10b981]/10",
    icon: IconSparkles,
    socials: {
      kick: "https://kick.com/soez3",
      instagram: "https://www.instagram.com/soez3",
    },
  },
  {
    position: 5,
    positionLabel: "Pos 5",
    roleName: "Hard Support",
    nickname: "Angelukin",
    slug: "angelukin",
    avatar: null,
    country: "PE",
    accountId: "355264850",
    rankTier: 30,
    medalUrl: "https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_3.png",
    leaderboardRank: null,
    themeColor: "text-[#a855f7]",
    themeBorder: "border-[#a855f7]/40 group-hover:border-[#a855f7]",
    themeBg: "bg-[#a855f7]/10",
    icon: IconHeartHandshake,
  },
];

export function ChampionModal({
  isOpen,
  onClose,
  tournamentSlug = "el-gran-coliseo-ii",
  teamSlug = "rising-rage",
  teamLogo,
  teamName = "Rising Rage",
}: ChampionModalProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [roster, setRoster] = useState<RosterMember[]>(DEFAULT_CHAMPION_ROSTER);
  const [dynamicTeam, setDynamicTeam] = useState<TeamData | null>(null);

  const [hasLogoError, setHasLogoError] = useState(false);

  // Logo con resolución garantizada a media backend
  const effectiveLogo =
    teamLogo ||
    dynamicTeam?.logo ||
    "/media/teams/logos/rising-rage.webp";

  const resolvedTeamLogo = hasLogoError
    ? "http://localhost:8000/media/teams/logos/rising-rage.webp"
    : (normalizeMediaUrl(effectiveLogo) || "http://localhost:8000/media/teams/logos/rising-rage.webp");

  // Disparar confeti épico en cuanto el modal se abra
  useEffect(() => {
    if (isOpen) {
      fireChampionConfetti();
      // Un segundo estallido suave después de 1.8 segundos para mantener la emoción
      const timer = setTimeout(() => {
        fireChampionConfetti();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cierre mediante la tecla Escape y bloqueo de scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Sincronización opcional con API de roster y equipo
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    async function syncData() {
      try {
        const [liveRoster, liveTeam] = await Promise.allSettled([
          getTeamRosterAPI(teamSlug, tournamentSlug),
          getTeamBySlugAPI(teamSlug),
        ]);

        if (!isCancelled && liveTeam.status === "fulfilled" && liveTeam.value) {
          setDynamicTeam(liveTeam.value);
        }

        if (
          !isCancelled &&
          liveRoster.status === "fulfilled" &&
          Array.isArray(liveRoster.value) &&
          liveRoster.value.length > 0
        ) {
          const liveData = liveRoster.value;
          const updated = DEFAULT_CHAMPION_ROSTER.map((def) => {
            const match = liveData.find(
              (m: TeamRosterMemberData) =>
                m.competitive_position === def.position ||
                m.player?.nickname?.toLowerCase() === def.nickname.toLowerCase()
            );
            if (match && match.player) {
              return {
                ...def,
                nickname: match.player.nickname || def.nickname,
                avatar: match.player.avatar || def.avatar,
                country: match.player.country || def.country,
                accountId: match.player.account_id || def.accountId,
                slug: match.player.slug || def.slug,
              };
            }
            return def;
          });
          setRoster(updated);
        }
      } catch {
        // En caso de fallo de red, conservamos la data predeterminada precisa
      }
    }

    syncData();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, teamSlug, tournamentSlug]);

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop con Blur y opacidad rebajada */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container Principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 25 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="champion-modal-title"
            className="relative z-10 w-full max-w-5xl max-h-[92vh] flex flex-col border-2 border-[#d8b467] bg-gradient-to-b from-[#241c13] via-[#14100c] to-[#0c0906] shadow-[0_0_80px_rgba(216,180,103,0.4)] rounded-xs my-auto"
          >
            {/* Gemas Imperiales en las 4 esquinas */}
            <span className="pointer-events-none absolute -top-1.5 -left-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#ffe28a] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />
            <span className="pointer-events-none absolute -top-1.5 -right-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#ffe28a] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />
            <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#ffe28a] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />
            <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#ffe28a] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />

            {/* Borde sutil interior dorado */}
            <span className="pointer-events-none absolute inset-1 sm:inset-1.5 border border-[#d8b467]/30 z-20" />

            {/* Resplandor radial dorado central de fondo */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 bg-[radial-gradient(ellipse_at_top,rgba(240,211,143,0.22)_0%,transparent_70%)]" />

            {/* Botón de Cierre Superior */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Cerrar modal de campeón"
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-40 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xs border border-[#d8b467]/60 bg-[#16120e]/90 text-[#f0d38f] backdrop-blur-md shadow-lg transition-all duration-200 hover:border-[#f0d38f] hover:bg-[#d8b467] hover:text-black hover:scale-105 active:scale-95 cursor-pointer"
            >
              <IconX size={20} stroke={2.2} />
            </button>

            {/* Área scrolleable interna con scrollbar estilizada */}
            <div className="relative z-10 w-full overflow-y-auto overflow-x-hidden px-4 sm:px-6 md:px-8 py-6 sm:py-7 space-y-6 max-h-[calc(92vh-10px)]">
              {/* ================= ENCABEZADO CORONACIÓN ================= */}
              <div className="text-center space-y-3 pt-2">
                {/* Cintillo Superior */}
                <div className="inline-flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-1 border border-[#f0d38f]/40 bg-[#d8b467]/15 rounded-xs font-chakra text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#f0d38f] shadow-[0_0_15px_rgba(240,211,143,0.25)]">
                  <IconCrown size={15} className="text-[#f0d38f] animate-pulse shrink-0" />
                  <span>¡HABEMUS CAMPEÓN IMPERIAL!</span>
                  <IconCrown size={15} className="text-[#f0d38f] animate-pulse shrink-0" />
                </div>

                {/* Título Principal */}
                <h2
                  id="champion-modal-title"
                  className="font-chakra text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ffe494] to-white drop-shadow-[0_2px_18px_rgba(240,211,143,0.55)]"
                >
                  RISING RAGE
                </h2>

                <p className="font-chakra text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#d4cdc4]">
                  Emperadores de <span className="text-[#f0d38f]">El Gran Coliseo II</span> · [t leostyle]
                </p>
              </div>

              {/* ================= HERO SPOTLIGHT (ESCUDO Y MÉTRICAS) ================= */}
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-5 p-4 sm:p-5 border border-[#d8b467]/40 bg-gradient-to-r from-[#1c160f]/90 via-[#261d13]/80 to-[#1c160f]/90 rounded-xs shadow-[0_0_30px_rgba(216,180,103,0.15)] overflow-hidden">
                {/* Halo decorativo de victoria */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(240,211,143,0.15),transparent_65%)]" />

                {/* Left: Escudo / Logo del Equipo con Laureles */}
                <div className="relative z-10 flex items-center gap-4 sm:gap-5">
                  <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-xs border-2 border-[#f0d38f] bg-[#14100c] shadow-[0_0_25px_rgba(240,211,143,0.5)] p-2">
                    {/* Corona flotante en la cima del logo */}
                    <div className="absolute -top-3 -right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[#f0d38f] text-black shadow-[0_0_10px_rgba(240,211,143,0.9)]">
                      <IconCrown size={17} stroke={2.5} />
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolvedTeamLogo}
                      alt={`${teamName} Logo`}
                      onError={() => {
                        setHasLogoError(true);
                      }}
                      className="h-full w-full object-contain filter drop-shadow-md select-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-chakra text-lg sm:text-xl font-black text-white">
                        Rising Rage
                      </span>
                      <CountryFlag countryCode="PE" showCode size="xs" />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#c7bcab]">
                      <span className="text-[#f0d38f] font-bold">Capitán: LeoStyle</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">Invicto en Playoffs</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 font-chakra text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-[#d8b467]/60 bg-[#d8b467]/20 text-[#ffe494]">
                        <IconTrophy size={12} className="text-[#f0d38f]" />
                        1ER LUGAR OFICIAL
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Marcador de Gran Final & Recompensa Imperial */}
                <div className="relative z-10 flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 border-[#2d261e] pt-3 md:pt-0">
                  {/* Score BO5 Card */}
                  <div className="flex flex-col items-center md:items-end border border-[#d8b467]/30 bg-[#14100c]/80 px-3.5 py-2 rounded-xs">
                    <span className="font-chakra text-[10px] uppercase tracking-wider text-[#8e857b] font-bold">
                      GRAN FINAL BO5
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-sm sm:text-base font-black text-[#f0d38f]">
                        Rising Rage 3
                      </span>
                      <span className="font-mono text-xs text-[#8e857b]">-</span>
                      <span className="font-mono text-sm sm:text-base font-black text-[#d4cdc4]">
                        2 The Fat Bears
                      </span>
                    </div>
                  </div>

                  {/* Prize Badge */}
                  <div className="flex flex-col items-center md:items-end border border-[#f0d38f]/60 bg-gradient-to-r from-[#2a2012] via-[#352714] to-[#2a2012] px-4 py-2 rounded-xs shadow-[0_0_18px_rgba(240,211,143,0.3)]">
                    <span className="font-chakra text-[10px] uppercase tracking-wider text-[#f0d38f] font-black flex items-center gap-1">
                      <IconMedal size={13} className="text-[#f0d38f]" />
                      PREMIO IMPERIAL
                    </span>
                    <span className="mt-0.5 font-chakra text-sm sm:text-base font-black text-white tracking-wide">
                      S/ 60,000 PEN
                    </span>
                  </div>
                </div>
              </div>

              {/* ================= ROSTER DE LOS 5 GLADIADORES ================= */}
              <div className="space-y-3">
                {/* Separador con título */}
                <div className="flex items-center justify-between gap-3 border-b border-[#d8b467]/30 pb-2">
                  <div className="flex items-center gap-2 font-chakra text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-[#f0d38f]">
                    <IconSwords size={16} className="text-[#f0d38f]" />
                    <span>ALINEACIÓN CAMPEONA · LOS 5 GLADIADORES</span>
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs text-[#8e857b]">
                    ROSTER OFICIAL DOTA 2
                  </span>
                </div>

                {/* Grid de 5 Jugadores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-3.5 items-stretch">
                  {roster.map((player) => {
                    const RoleIcon = player.icon;
                    const avatarSrc = player.avatar ? normalizeMediaUrl(player.avatar) : null;

                    return (
                      <div
                        key={player.position}
                        className={`group relative flex flex-col justify-between p-3.5 sm:p-4 border transition-all duration-300 rounded-xs bg-[#16120e] hover:scale-[1.02] ${
                          player.isCaptain
                            ? "border-[#f0d38f] bg-gradient-to-b from-[#241c13] to-[#14100c] shadow-[0_0_20px_rgba(240,211,143,0.25)] hover:border-[#ffe28a] hover:shadow-[0_0_28px_rgba(240,211,143,0.4)]"
                            : "border-[#2d261e] hover:border-[#d8b467]/60 shadow-md"
                        }`}
                      >
                        {/* Top: Posición & Rol */}
                        <div className="flex items-center justify-between gap-1 mb-3">
                          <span
                            className={`inline-flex items-center gap-1 font-chakra text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-xs ${player.themeColor} ${player.themeBorder} ${player.themeBg}`}
                          >
                            <RoleIcon size={12} />
                            {player.positionLabel} · {player.roleName}
                          </span>

                          {player.isCaptain && (
                            <span className="inline-flex items-center gap-0.5 font-chakra text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-[#f0d38f] bg-[#f0d38f] text-black rounded-xs shadow-sm">
                              <IconCrown size={11} stroke={2.5} />
                              CAP
                            </span>
                          )}
                        </div>

                        {/* Center: Avatar / Icono Gladiador */}
                        <div className="my-2 flex flex-col items-center text-center">
                          <Link
                            href={`/players/${encodeURIComponent(player.slug)}`}
                            onClick={onClose}
                            title={`Ver perfil de ${player.nickname}`}
                            className={`relative flex h-18 w-18 sm:h-20 sm:w-20 items-center justify-center rounded-xs border-2 transition-transform duration-300 hover:scale-105 cursor-pointer ${
                              player.isCaptain
                                ? "border-[#f0d38f] bg-[#1c160f] shadow-[0_0_18px_rgba(240,211,143,0.4)]"
                                : `${player.themeBorder} bg-[#14100c]`
                            }`}
                          >
                            {avatarSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={avatarSrc}
                                alt={player.nickname}
                                className="h-full w-full object-cover object-center rounded-xs"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-center p-2">
                                <RoleIcon size={28} className={player.themeColor} />
                                <span className="mt-1 font-mono text-[8px] uppercase tracking-widest text-[#7e756b]">
                                  {player.roleName}
                                </span>
                              </div>
                            )}

                            {/* Badge de Capitán sobre el avatar */}
                            {player.isCaptain && (
                              <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#f0d38f] text-black shadow-md">
                                <IconCrown size={14} stroke={2.5} />
                              </div>
                            )}
                          </Link>

                          {/* Nickname & Bandera con Link al perfil */}
                          <div className="mt-3 flex items-center justify-center gap-1.5 w-full">
                            <Link
                              href={`/players/${encodeURIComponent(player.slug)}`}
                              onClick={onClose}
                              title={`Ver perfil de ${player.nickname}`}
                              className="font-chakra text-base sm:text-lg font-black text-white hover:text-[#f0d38f] transition-colors truncate"
                            >
                              {player.nickname}
                            </Link>
                            <CountryFlag countryCode={player.country} size="xs" />
                          </div>

                          {/* Account ID / Dota ID */}
                          <span className="mt-1 font-mono text-[10px] text-[#8e857b]">
                            ID: <span className="text-[#c7bcab] font-bold">{player.accountId}</span>
                          </span>

                          {/* Medalla de Rango de Dota 2 */}
                          <div className="relative flex flex-col items-center justify-center mt-2 pt-1.5 border-t border-[#241e17] w-full">
                            <div className="relative h-10 w-10 flex items-center justify-center">
                              <picture>
                                <img
                                  src={player.medalUrl || getRankMedalUrl(player.rankTier)}
                                  alt="Medalla de Rango Dota 2"
                                  className="h-9 w-9 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] filter group-hover:scale-110 transition-transform duration-300 select-none"
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

                        {/* Bottom: Redes Sociales o Ver Perfil */}
                        <div className="mt-3 pt-2.5 border-t border-[#241e17] flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {player.socials?.kick && (
                              <a
                                href={player.socials.kick}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Kick Stream"
                                className="flex h-6 w-6 items-center justify-center rounded-xs border border-[#2d261e] bg-[#14100c] text-[#53fc18] hover:border-[#53fc18] hover:bg-[#53fc18]/15 transition-all"
                              >
                                <IconBrandKick size={13} />
                              </a>
                            )}
                            {player.socials?.instagram && (
                              <a
                                href={player.socials.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Instagram"
                                className="flex h-6 w-6 items-center justify-center rounded-xs border border-[#2d261e] bg-[#14100c] text-[#e1306c] hover:border-[#e1306c] hover:bg-[#e1306c]/15 transition-all"
                              >
                                <IconBrandInstagram size={13} />
                              </a>
                            )}
                          </div>

                          <Link
                            href={`/players/${encodeURIComponent(player.slug)}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-1 font-chakra text-[10px] font-bold text-[#8e857b] hover:text-[#00c8f8] transition-colors"
                          >
                            <span>Perfil</span>
                            <IconArrowRight size={11} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ================= FOOTER / ACCIONES DE CELEBRACIÓN ================= */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#d8b467]/30">
                {/* Botón para relanzar confeti */}
                <button
                  type="button"
                  onClick={() => fireChampionConfetti()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#f0d38f]/60 bg-[#d8b467]/15 hover:bg-[#d8b467]/30 hover:border-[#f0d38f] text-[#f0d38f] font-chakra text-xs font-black uppercase tracking-wider rounded-xs shadow-[0_0_15px_rgba(240,211,143,0.2)] hover:scale-105 transition-all cursor-pointer"
                >
                  <IconConfetti size={16} className="text-[#f0d38f]" />
                  <span>¡Lanzar Más Confeti!</span>
                </button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {/* Link al detalle del equipo */}
                  <Link
                    href={`/teams/${teamSlug}`}
                    onClick={onClose}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[#2d261e] bg-[#16120e] hover:border-[#d8b467]/60 hover:text-white text-[#d4cdc4] font-chakra text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
                  >
                    <span>Ver Equipo</span>
                    <IconExternalLink size={14} />
                  </Link>

                  {/* Continuar en la arena (Cerrar) */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-[#f0d38f] bg-gradient-to-r from-[#d8b467] to-[#f0d38f] hover:from-[#ffe28a] hover:to-[#ffd700] text-black font-chakra text-xs font-black uppercase tracking-wider rounded-xs shadow-[0_0_20px_rgba(240,211,143,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Entrar a la Arena</span>
                    <IconFlame size={15} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
