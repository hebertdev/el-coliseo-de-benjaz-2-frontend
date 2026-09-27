"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconCrown,
  IconShield,
  IconExternalLink,
  IconCopy,
  IconCheck,
  IconArrowLeft,
  IconDeviceGamepad2,
  IconBrandTwitch,
  IconBrandKick,
  IconBrandYoutube,
  IconBrandX,
  IconBrandInstagram,
  IconBrandFacebook,
  IconSwords,
  IconSparkles,
  IconQuote,
  IconX,
  IconZoomIn,
  IconUser,
} from "@tabler/icons-react";
import { CountryFlag } from "components/ui/CountryFlag";
import type { PlayerDetailData } from "interfaces/players";
import type { PlayerMatchHistoryResponse } from "interfaces/matches";
import { PlayerMatchHistory } from "./PlayerMatchHistory";

const POSITION_MAP: Record<
  number,
  { label: string; name: string; accent: string; badgeBg: string }
> = {
  1: {
    label: "POS 1",
    name: "Carry",
    accent: "border-[#d8b467]/40 text-[#f0d38f]",
    badgeBg: "bg-[#d8b467]/15",
  },
  2: {
    label: "POS 2",
    name: "Midlane",
    accent: "border-[#00c8f8]/40 text-[#00c8f8]",
    badgeBg: "bg-[#00c8f8]/15",
  },
  3: {
    label: "POS 3",
    name: "Offlane",
    accent: "border-[#e49b38]/40 text-[#e49b38]",
    badgeBg: "bg-[#e49b38]/15",
  },
  4: {
    label: "POS 4",
    name: "Soft Support",
    accent: "border-[#9146ff]/40 text-[#b580ff]",
    badgeBg: "bg-[#9146ff]/15",
  },
  5: {
    label: "POS 5",
    name: "Hard Support",
    accent: "border-[#53fc18]/40 text-[#53fc18]",
    badgeBg: "bg-[#53fc18]/15",
  },
};

interface PlayerDetailsProps {
  player: PlayerDetailData;
  matchHistory?: PlayerMatchHistoryResponse | null;
}

export function PlayerDetails({ player, matchHistory }: PlayerDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Encontrar membresía activa principal
  const activeMembership =
    player.memberships.find((m) => m.is_active) || player.memberships[0] || null;

  const currentPosition = activeMembership?.competitive_position
    ? POSITION_MAP[activeMembership.competitive_position]
    : null;

  const isCaptain = activeMembership?.role === "CAPTAIN";
  const displayAvatar = player.avatar || activeMembership?.team?.logo || null;

  const socialLinks = [
    {
      name: "Twitch",
      url: player.twitch_url,
      icon: IconBrandTwitch,
      color: "hover:text-[#9146ff] hover:border-[#9146ff]/60 hover:bg-[#9146ff]/10",
    },
    {
      name: "Kick",
      url: player.kick_url,
      icon: IconBrandKick,
      color: "hover:text-[#53fc18] hover:border-[#53fc18]/60 hover:bg-[#53fc18]/10",
    },
    {
      name: "YouTube",
      url: player.youtube_url,
      icon: IconBrandYoutube,
      color: "hover:text-[#ff0000] hover:border-[#ff0000]/60 hover:bg-[#ff0000]/10",
    },
    {
      name: "X (Twitter)",
      url: player.twitter_url,
      icon: IconBrandX,
      color: "hover:text-white hover:border-white/60 hover:bg-white/10",
    },
    {
      name: "Instagram",
      url: player.instagram_url,
      icon: IconBrandInstagram,
      color: "hover:text-[#e1306c] hover:border-[#e1306c]/60 hover:bg-[#e1306c]/10",
    },
    {
      name: "Facebook",
      url: player.facebook_url,
      icon: IconBrandFacebook,
      color: "hover:text-[#1877f2] hover:border-[#1877f2]/60 hover:bg-[#1877f2]/10",
    },
  ].filter((s) => s.url && s.url.trim() !== "");

  return (
    <div className="min-h-screen bg-[#120f0a] text-[#f3f3f5] selection:bg-[#00c8f8]/30 selection:text-white">
      {/* Ambient background glows */}
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#2d261e_1px,transparent_1px)] bg-size-[24px_24px] opacity-30" />
        <div className="pointer-events-none absolute -top-32 left-1/4 h-112.5 w-112.5 rounded-full bg-[#00c8f8]/5 blur-3xl" />
        <div className="pointer-events-none absolute top-20 right-1/4 h-100 w-100 rounded-full bg-[#d8b467]/5 blur-3xl" />

        {/* ================= UNIFIED CONTAINER ================= */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Breadcrumbs & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <nav className="flex items-center gap-2 font-chakra text-xs text-[#8e857b]">
              <Link href="/" className="transition-colors hover:text-[#00c8f8]">
                INICIO
              </Link>
              <span>/</span>
              {activeMembership?.team ? (
                <>
                  <Link
                    href={`/teams/${activeMembership.team.slug}`}
                    className="transition-colors hover:text-[#00c8f8] truncate max-w-37.5 sm:max-w-none"
                  >
                    {activeMembership.team.name}
                  </Link>
                  <span>/</span>
                </>
              ) : (
                <>
                  <Link href="/teams" className="transition-colors hover:text-[#00c8f8]">
                    EQUIPOS
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-[#d8b467] font-semibold">{player.nickname}</span>
            </nav>

            <Link
              href={activeMembership?.team ? `/teams/${activeMembership.team.slug}` : "/teams"}
              className="inline-flex items-center gap-1.5 border border-[#2d261e] bg-[#14100c] px-3 py-1.5 font-chakra text-xs font-bold uppercase tracking-wider text-[#a8a197] transition-all hover:border-[#00c8f8] hover:bg-[#00c8f8]/10 hover:text-[#00c8f8]"
            >
              <IconArrowLeft size={14} />
              {activeMembership?.team ? `Volver a ${activeMembership.team.name}` : "Volver a Equipos"}
            </Link>
          </div>

          {/* ================= MAIN PLAYER BANNER CARD ================= */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative border border-[#2d261e] bg-linear-to-r from-[#18140f] via-[#1c1712] to-[#18140f] p-6 sm:p-8 backdrop-blur-md shadow-2xl"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
              {/* Player Avatar */}
              <button
                type="button"
                onClick={() => displayAvatar && setIsAvatarModalOpen(true)}
                disabled={!displayAvatar}
                className={`group relative flex h-28 w-28 sm:h-36 sm:w-36 shrink-0 items-center justify-center border-2 border-[#3d3328] bg-[#14100c] shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden transition-all ${
                  displayAvatar
                    ? "cursor-pointer hover:border-[#00c8f8] hover:shadow-[0_0_20px_rgba(0,200,248,0.4)] hover:scale-105"
                    : "cursor-default"
                }`}
                title={displayAvatar ? "Haz clic para ampliar la imagen de perfil" : player.nickname}
              >
                {displayAvatar ? (
                  <>
                    <picture>
                      <img
                        src={displayAvatar}
                        alt={player.nickname}
                        width={140}
                        height={140}
                        className={`h-full w-full ${
                          player.avatar ? "object-cover" : "object-contain p-3"
                        } transition-transform group-hover:scale-105`}
                      />
                    </picture>

                    <div className="absolute inset-0 bg-[#00c8f8]/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                      <IconZoomIn size={28} className="text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]" />
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#d8b467]">
                    <IconUser size={68} className="drop-shadow-[0_4px_16px_rgba(216,180,103,0.35)]" />
                  </div>
                )}

                {/* Captain Crown Overlay */}
                {isCaptain && (
                  <div className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#d8b467] text-black shadow-lg" title="Capitán del Equipo">
                    <IconCrown size={16} />
                  </div>
                )}
              </button>

              {/* Player Info & Titles */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                  {/* Position Pill */}
                  {currentPosition && (
                    <span
                      className={`border px-2.5 py-0.5 font-mono text-xs font-bold uppercase tracking-wider ${currentPosition.accent} ${currentPosition.badgeBg}`}
                    >
                      {currentPosition.label} • {currentPosition.name}
                    </span>
                  )}

                  {/* Role Display */}
                  {activeMembership?.role_display && (
                    <span className="border border-[#2d261e] bg-[#14100c] px-2.5 py-0.5 font-mono text-xs text-[#a8a197] uppercase">
                      {activeMembership.role_display}
                    </span>
                  )}

                  {/* Region Badge */}
                  <span className="border border-[#00c8f8]/40 bg-[#00c8f8]/10 px-2.5 py-0.5 font-mono text-xs font-bold text-[#00c8f8] uppercase tracking-wider">
                    {player.region_display || player.region}
                  </span>

                  {/* Country Badge with Flag */}
                  {player.country && (
                    <span className="flex items-center border border-[#2d261e] bg-[#14100c] px-2.5 py-0.5 font-mono text-xs text-[#f3f3f5] uppercase font-bold">
                      <CountryFlag countryCode={player.country} showCode size="xs" />
                    </span>
                  )}
                </div>

                <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#f3f3f5]">
                  {player.nickname}
                </h1>

                {/* Location & Team Subtitle */}
                <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-chakra text-[#a8a197]">
                  {player.city && (
                    <div className="flex items-center gap-1.5">
                      <CountryFlag countryCode={player.country} size="xs" />
                      <span>{player.city}, {player.country}</span>
                    </div>
                  )}

                  {activeMembership?.team && (
                    <div className="flex items-center gap-1.5">
                      <IconShield size={14} className="text-[#d8b467]" />
                      <span>
                        Equipo:{" "}
                        <Link
                          href={`/teams/${activeMembership.team.slug}`}
                          className="text-[#f0d38f] font-bold hover:underline"
                        >
                          {activeMembership.team.name} [{activeMembership.team.tag}]
                        </Link>
                      </span>
                    </div>
                  )}

                  {activeMembership?.tournament_name && (
                    <div className="flex items-center gap-1 text-[#8e857b]">
                      <IconSwords size={14} />
                      <span>{activeMembership.tournament_name}</span>
                    </div>
                  )}
                </div>

                {/* Player Bio / Quote */}
                {player.bio && (
                  <div className="mt-4 flex items-start gap-2 border-l-2 border-[#d8b467]/60 bg-[#14100c]/60 p-3 text-xs font-chakra italic text-[#c7bcab]">
                    <IconQuote size={16} className="text-[#d8b467] shrink-0 mt-0.5" />
                    <span>{player.bio}</span>
                  </div>
                )}

                {/* Social Networks & Action Buttons */}
                <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  {/* Share button */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 border border-[#2d261e] bg-[#14100c] px-3.5 py-2 font-chakra text-xs font-bold uppercase tracking-wider text-[#d8d2c7] hover:border-[#00c8f8] hover:text-[#00c8f8] transition-all"
                  >
                    {copied ? <IconCheck size={14} className="text-emerald-400" /> : <IconCopy size={14} />}
                    <span>{copied ? "¡Copiado!" : "Compartir Gladiador"}</span>
                  </button>

                  {/* OpenDota Player Profile */}
                  {player.account_id && (
                    <a
                      href={`https://www.opendota.com/players/${player.account_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 border border-[#2d261e] bg-[#14100c] px-3.5 py-2 font-chakra text-xs font-bold uppercase tracking-wider text-[#00c8f8] hover:border-[#00c8f8] hover:bg-[#00c8f8]/10 transition-all"
                    >
                      <IconDeviceGamepad2 size={14} />
                      <span>OpenDota</span>
                      <IconExternalLink size={12} />
                    </a>
                  )}

                  {/* Dotabuff */}
                  {player.account_id && (
                    <a
                      href={`https://www.dotabuff.com/players/${player.account_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 border border-[#2d261e] bg-[#14100c] px-3.5 py-2 font-chakra text-xs font-bold uppercase tracking-wider text-[#e49b38] hover:border-[#e49b38] hover:bg-[#e49b38]/10 transition-all"
                    >
                      <span>Dotabuff</span>
                      <IconExternalLink size={12} />
                    </a>
                  )}

                  {/* Social Icons */}
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        className={`flex h-9 w-9 items-center justify-center border border-[#2d261e] bg-[#14100c] text-[#a8a197] transition-all duration-200 ${social.color}`}
                        title={social.name}
                      >
                        <Icon size={16} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ================= MEMBERSHIPS & TOURNAMENT DETAILS ================= */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Torneo & Equipo Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between border-b border-[#2d261e] pb-4">
                <h2 className="font-cinzel text-xl sm:text-2xl font-bold uppercase text-[#f3f3f5] flex items-center gap-2">
                  <IconSwords size={20} className="text-[#d8b467]" />
                  EQUIPO & MEMBRESÍA EN EL COLISEO
                </h2>
                <span className="border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-400 uppercase">
                  ACTIVO
                </span>
              </div>

              {player.memberships.map((membership, idx) => {
                const team = membership.team;
                const pos = membership.competitive_position
                  ? POSITION_MAP[membership.competitive_position]
                  : null;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-[#2d261e] bg-[#18140f] p-6 space-y-5"
                  >
                    {/* Team Header Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#241e17] pb-4">
                      <div className="flex items-center gap-3.5">
                        <Link
                          href={`/teams/${team.slug}`}
                          className="relative flex h-14 w-14 shrink-0 items-center justify-center border border-[#3d3328] bg-[#14100c] p-2 hover:border-[#00c8f8] transition-colors"
                        >
                          {team.logo ? (
                            <picture>
                              <img
                                src={team.logo}
                                alt={team.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-contain"
                              />
                            </picture>
                          ) : (
                            <IconShield size={28} className="text-[#d8b467]" />
                          )}
                        </Link>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-[#00c8f8]">
                              [{team.tag}]
                            </span>
                            <span className="border border-[#00c8f8]/30 bg-[#00c8f8]/10 px-1.5 py-0.2 font-mono text-[9px] text-[#00c8f8]">
                              {team.region_display || team.region}
                            </span>
                          </div>
                          <Link
                            href={`/teams/${team.slug}`}
                            className="font-cinzel text-lg font-bold text-white hover:text-[#00c8f8] transition-colors"
                          >
                            {team.name}
                          </Link>
                          <p className="font-chakra text-xs text-[#8e857b] flex items-center gap-1 mt-0.5">
                            {team.city ? `${team.city}, ` : ""}
                            {team.country && (
                              <CountryFlag countryCode={team.country} showCode size="xs" />
                            )}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/teams/${team.slug}`}
                        className="inline-flex items-center gap-1 border border-[#2d261e] bg-[#14100c] px-3 py-1.5 font-chakra text-xs font-bold uppercase tracking-wider text-[#d8d2c7] hover:border-[#00c8f8] hover:text-[#00c8f8] transition-colors"
                      >
                        <span>Ver Equipo</span>
                        <IconExternalLink size={12} />
                      </Link>
                    </div>

                    {/* Membership Meta Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-chakra text-xs">
                      <div className="border border-[#241e17] bg-[#14100c]/60 p-3 space-y-1">
                        <span className="text-[#8e857b] font-mono text-[10px] uppercase">
                          POSICIÓN OFICIAL
                        </span>
                        <div className="font-bold text-white flex items-center gap-2">
                          {pos && (
                            <span className={`border px-1.5 py-0.2 font-mono text-[9px] ${pos.accent} ${pos.badgeBg}`}>
                              {pos.label}
                            </span>
                          )}
                          <span>{membership.position_display || pos?.name || "Sin definir"}</span>
                        </div>
                      </div>

                      <div className="border border-[#241e17] bg-[#14100c]/60 p-3 space-y-1">
                        <span className="text-[#8e857b] font-mono text-[10px] uppercase">
                          ROL EN EL EQUIPO
                        </span>
                        <div className="font-bold text-[#f0d38f] flex items-center gap-1.5">
                          {membership.role === "CAPTAIN" && <IconCrown size={14} />}
                          <span>{membership.role_display}</span>
                        </div>
                      </div>

                      <div className="border border-[#241e17] bg-[#14100c]/60 p-3 space-y-1">
                        <span className="text-[#8e857b] font-mono text-[10px] uppercase">
                          TORNEO
                        </span>
                        <div className="font-semibold text-white">
                          {membership.tournament_name || "El Coliseo de Benjaz"}
                        </div>
                      </div>

                      <div className="border border-[#241e17] bg-[#14100c]/60 p-3 space-y-1">
                        <span className="text-[#8e857b] font-mono text-[10px] uppercase">
                          ESTADO DE INSCRIPCIÓN
                        </span>
                        <div className="font-mono text-emerald-400 font-bold">
                          {membership.is_active ? "CONFIRMADO Y ACTIVO" : "INACTIVO"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Match History Section */}
              <PlayerMatchHistory matchHistory={matchHistory} />
            </div>

            {/* Right Column: Player Technical Identifiers & Steam Info */}
            <div className="space-y-6">
              <div className="border border-[#2d261e] bg-[#18140f] p-6 space-y-4">
                <h3 className="font-cinzel text-lg font-bold uppercase text-[#f3f3f5] border-b border-[#241e17] pb-3 flex items-center gap-2">
                  <IconDeviceGamepad2 size={18} className="text-[#00c8f8]" />
                  IDENTIFICADORES DOTA 2
                </h3>

                <div className="space-y-3 font-chakra text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#241e17]">
                    <span className="text-[#8e857b]">Nickname:</span>
                    <span className="font-bold text-white">{player.nickname}</span>
                  </div>

                  {player.account_id && (
                    <div className="flex justify-between items-center py-1.5 border-b border-[#241e17]">
                      <span className="text-[#8e857b]">Dota Account ID:</span>
                      <span className="font-mono font-bold text-[#00c8f8]">
                        {player.account_id}
                      </span>
                    </div>
                  )}

                  {player.steam_id && (
                    <div className="flex flex-col gap-1 py-1.5 border-b border-[#241e17]">
                      <span className="text-[#8e857b]">Steam 64 ID:</span>
                      <span className="font-mono text-[11px] text-[#d8d2c7] break-all">
                        {player.steam_id}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1.5 border-b border-[#241e17]">
                    <span className="text-[#8e857b]">Región del Gladiador:</span>
                    <span className="font-semibold text-[#d8b467]">
                      {player.region_display || player.region}
                    </span>
                  </div>

                  {player.country && (
                    <div className="flex justify-between items-center py-1.5 border-b border-[#241e17]">
                      <span className="text-[#8e857b]">Nacionalidad:</span>
                      <span className="flex items-center gap-1.5 font-semibold text-white">
                        <CountryFlag countryCode={player.country} showCode size="sm" />
                      </span>
                    </div>
                  )}

                  {player.city && (
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-[#8e857b]">Ciudad:</span>
                      <span className="font-semibold text-[#a8a197]">{player.city}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Arena Info Card */}
              <div className="border border-[#d8b467]/30 bg-linear-to-b from-[#241c14] to-[#18140f] p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#d8b467]">
                  <IconSparkles size={18} />
                  <h4 className="font-cinzel text-base font-bold uppercase">
                    GLADIADOR DEL COLISEO
                  </h4>
                </div>
                <p className="font-chakra text-xs text-[#c7bcab] leading-relaxed">
                  Este jugador cuenta con perfil verificado en la arena competitiva de El Coliseo II.
                  Todos los partidos son retransmitidos y analizados en vivo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= AVATAR MODAL ================= */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAvatarModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full border-2 border-[#d8b467]/60 bg-linear-to-b from-[#1c1712] via-[#16120e] to-[#120f0a] p-6 shadow-[0_0_50px_rgba(216,180,103,0.25)]"
            >
              {/* Imperial Corner Gem Accents */}
              <span className="pointer-events-none absolute -top-1.5 -left-1.5 z-20 h-3 w-3 rotate-45 border border-[#6cc4ff] bg-[#2e9df0] shadow-[0_0_10px_rgba(46,157,240,0.9)]" />
              <span className="pointer-events-none absolute -top-1.5 -right-1.5 z-20 h-3 w-3 rotate-45 border border-[#6cc4ff] bg-[#2e9df0] shadow-[0_0_10px_rgba(46,157,240,0.9)]" />
              <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 z-20 h-3 w-3 rotate-45 border border-[#6cc4ff] bg-[#2e9df0] shadow-[0_0_10px_rgba(46,157,240,0.9)]" />
              <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 z-20 h-3 w-3 rotate-45 border border-[#6cc4ff] bg-[#2e9df0] shadow-[0_0_10px_rgba(46,157,240,0.9)]" />

              {/* Inner Gold Border */}
              <span className="pointer-events-none absolute inset-1 border border-[#d8b467]/25" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="absolute top-4 right-4 z-30 flex h-8 w-8 items-center justify-center border border-[#3d3328] bg-[#14100c] text-[#a8a197] hover:border-[#00c8f8] hover:text-white transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <IconX size={18} />
              </button>

              {/* Modal Header */}
              <div className="relative z-10 flex items-center gap-2 border-b border-[#241e17] pb-3 pr-10">
                <h3 className="font-cinzel text-lg font-bold text-white truncate flex items-center gap-2">
                  <span>{player.nickname}</span>
                  {player.country && (
                    <CountryFlag countryCode={player.country} showCode size="xs" />
                  )}
                </h3>
              </div>

              {/* Modal Image Display */}
              <div className="relative z-10 mt-5 flex items-center justify-center border border-[#3d3328] bg-[#0e0b08] p-3 shadow-inner">
                <picture>
                  <img
                    src={displayAvatar || ""}
                    alt={`Foto de perfil ampliada de ${player.nickname}`}
                    className="max-h-[60vh] w-auto max-w-full object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
                  />
                </picture>
              </div>

              {/* Modal Footer Label */}
              <div className="relative z-10 mt-4 flex items-center justify-between text-xs font-chakra text-[#8e857b]">
                <span className="truncate pr-2">
                  {isCaptain ? "Capitán • " : ""}Foto oficial de Gladiador
                </span>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="shrink-0 border border-[#d8b467]/40 bg-[#d8b467]/10 px-3 py-1 font-chakra text-xs font-bold uppercase tracking-wider text-[#d8b467] hover:bg-[#d8b467] hover:text-black transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
