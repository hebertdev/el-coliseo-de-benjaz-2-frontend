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
  IconUserCheck,
  IconUserCode,
  IconInfoCircle,
  IconSwords,
  IconUser,
  IconDeviceGamepad2,
  IconChevronRight,
  IconX,
  IconZoomIn,
} from "@tabler/icons-react";
import { CountryFlag } from "components/ui/CountryFlag";
import type { TeamData, TeamRosterMemberData } from "interfaces/teams";
import type { TeamSeriesHistoryResponse } from "interfaces/matches";
import { TeamSeriesHistory } from "./TeamSeriesHistory";

const DEFAULT_POSITIONS = [
  {
    pos: 1,
    label: "POS 1",
    name: "Carry",
    desc: "Gladiador de Posición 1 • Escalado & Daño Núcleo",
    accent: "border-[#d8b467]/40 text-[#f0d38f] bg-[#d8b467]/10",
  },
  {
    pos: 2,
    label: "POS 2",
    name: "Midlane",
    desc: "Gladiador de Posición 2 • Creador de Espacio & Tempo",
    accent: "border-[#00c8f8]/40 text-[#00c8f8] bg-[#00c8f8]/10",
  },
  {
    pos: 3,
    label: "POS 3",
    name: "Offlane",
    desc: "Gladiador de Posición 3 • Iniciador & Primera Línea",
    accent: "border-[#e49b38]/40 text-[#e49b38] bg-[#e49b38]/10",
  },
  {
    pos: 4,
    label: "POS 4",
    name: "Soft Support",
    desc: "Gladiador de Posición 4 • Roaming, Utilidad & Gankeo",
    accent: "border-[#9146ff]/40 text-[#b580ff] bg-[#9146ff]/10",
  },
  {
    pos: 5,
    label: "POS 5",
    name: "Hard Support",
    desc: "Gladiador de Posición 5 • Visión, Capitán & Soporte Vital",
    accent: "border-[#53fc18]/40 text-[#53fc18] bg-[#53fc18]/10",
  },
];

interface TeamDetailsProps {
  team: TeamData;
  roster: TeamRosterMemberData[];
  seriesHistory?: TeamSeriesHistoryResponse | null;
}

export function TeamDetails({ team, roster, seriesHistory }: TeamDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const corePlayers = roster.filter(
    (m) => m.role !== "COACH" && m.role !== "STANDIN"
  );
  const coachMembers = roster.filter((m) => m.role === "COACH");
  const standinMembers = roster.filter((m) => m.role === "STANDIN");

  const captain = roster.find((m) => m.role === "CAPTAIN");
  const captainName = captain?.player?.nickname;
  const displayTag = captainName
    ? (captainName.toLowerCase().startsWith("team ") ? captainName : `Team ${captainName}`)
    : (team.tag || "EQP");

  const displayLogo =
    team.logo ||
    captain?.player?.avatar ||
    roster.find((m) => m.player?.avatar)?.player?.avatar ||
    null;

  return (
    <div className="min-h-screen bg-[#120f0a] text-[#f3f3f5] selection:bg-[#00c8f8]/30 selection:text-white">
      {/* Background ambient texture & glows */}
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#2d261e_1px,transparent_1px)] bg-size-[24px_24px] opacity-30" />
        <div className="pointer-events-none absolute -top-32 left-1/4 h-112.5 w-112.5 rounded-full bg-[#00c8f8]/5 blur-3xl" />
        <div className="pointer-events-none absolute top-20 right-1/4 h-100 w-100 rounded-full bg-[#d8b467]/5 blur-3xl" />

        {/* ================= UNIFIED CENTERED CONTAINER ================= */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Breadcrumbs & Back link */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <nav className="flex items-center gap-2 font-chakra text-xs text-[#8e857b]">
              <Link href="/" className="transition-colors hover:text-[#00c8f8]">
                INICIO
              </Link>
              <span>/</span>
              <Link href="/teams" className="transition-colors hover:text-[#00c8f8]">
                EQUIPOS
              </Link>
              <span>/</span>
              <span className="text-[#d8b467] font-semibold truncate max-w-50 sm:max-w-none">
                {team.name}
              </span>
            </nav>

            <Link
              href="/teams"
              className="inline-flex items-center gap-1.5 border border-[#2d261e] bg-[#14100c] px-3 py-1.5 font-chakra text-xs font-bold uppercase tracking-wider text-[#a8a197] transition-all hover:border-[#00c8f8] hover:bg-[#00c8f8]/10 hover:text-[#00c8f8]"
            >
              <IconArrowLeft size={14} />
              Volver a Equipos
            </Link>
          </div>

          {/* Main Team Banner Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative border border-[#2d261e] bg-linear-to-r from-[#18140f] via-[#1c1712] to-[#18140f] p-6 sm:p-8 backdrop-blur-md shadow-2xl"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
              {/* Large Team Emblem / Logo */}
              <button
                type="button"
                onClick={() => displayLogo && setIsLogoModalOpen(true)}
                disabled={!displayLogo}
                className={`group relative flex h-28 w-28 sm:h-36 sm:w-36 shrink-0 items-center justify-center border-2 border-[#3d3328] bg-[#14100c] p-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden transition-all ${
                  displayLogo
                    ? "cursor-pointer hover:border-[#00c8f8] hover:shadow-[0_0_20px_rgba(0,200,248,0.4)] hover:scale-105"
                    : "cursor-default"
                }`}
                title={displayLogo ? "Haz clic para ampliar la imagen" : team.name}
              >
                {displayLogo ? (
                  <>
                    <picture>
                      <img
                        src={displayLogo}
                        alt={team.name}
                        width={140}
                        height={140}
                        className="h-full w-full object-cover filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] transition-transform group-hover:scale-105"
                      />
                    </picture>
                    <div className="absolute inset-0 bg-[#00c8f8]/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                      <IconZoomIn size={28} className="text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]" />
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#d8b467]">
                    <IconShield size={68} className="drop-shadow-[0_4px_16px_rgba(216,180,103,0.35)]" />
                  </div>
                )}
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 border border-[#d8b467]/60 bg-[#2d261e] px-2 py-0.5 font-mono text-[9px] font-bold text-[#d8b467] tracking-wider uppercase z-10 whitespace-nowrap">
                  [{displayTag}]
                </div>
              </button>

              {/* Team Info & Actions */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="border border-[#00c8f8]/40 bg-[#00c8f8]/10 px-2.5 py-0.5 font-mono text-xs font-bold text-[#00c8f8] uppercase tracking-wider">
                    {team.region_display || team.region}
                  </span>

                  {team.status && (
                    <span className="border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      {team.status_display || team.status}
                    </span>
                  )}

                  {captain?.player && (
                    <span className="flex items-center gap-1 border border-[#d8b467]/40 bg-[#d8b467]/10 px-2.5 py-0.5 font-mono text-xs font-bold text-[#f0d38f]">
                      <IconCrown size={12} />
                      Capitán: {captain.player.nickname}
                    </span>
                  )}
                </div>

                <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#f3f3f5]">
                  {team.name}
                </h1>

                {/* Location & Metadata info */}
                <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-chakra text-[#a8a197]">
                  {team.country && (
                    <div className="flex items-center gap-1.5">
                      <CountryFlag countryCode={team.country} size="sm" />
                      <span>{team.city ? `${team.city}, ` : ""}{team.country}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <IconSwords size={14} className="text-[#d8b467]" />
                    <span>Torneo: El Coliseo II</span>
                  </div>

                  {team.opendota_team_id && (
                    <div className="flex items-center gap-1">
                      <IconDeviceGamepad2 size={14} className="text-[#53fc18]" />
                      <span>OpenDota ID: {team.opendota_team_id}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 border border-[#2d261e] bg-[#14100c] px-3.5 py-2 font-chakra text-xs font-bold uppercase tracking-wider text-[#d8d2c7] hover:border-[#00c8f8] hover:text-[#00c8f8] transition-all"
                  >
                    {copied ? <IconCheck size={14} className="text-emerald-400" /> : <IconCopy size={14} />}
                    <span>{copied ? "¡Enlace Copiado!" : "Compartir Equipo"}</span>
                  </button>

                  {team.opendota_team_id && (
                    <a
                      href={`https://www.opendota.com/teams/${team.opendota_team_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 border border-[#2d261e] bg-[#14100c] px-3.5 py-2 font-chakra text-xs font-bold uppercase tracking-wider text-[#00c8f8] hover:border-[#00c8f8] hover:bg-[#00c8f8]/10 transition-all"
                    >
                      <span>Ver en OpenDota</span>
                      <IconExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ================= ROSTER SECTION ================= */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main 5 Positions Roster (Left 2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between border-b border-[#2d261e] pb-4">
                <div>
                  <h2 className="font-cinzel text-xl sm:text-2xl font-bold uppercase text-[#f3f3f5] flex items-center gap-2">
                    <IconSwords size={20} className="text-[#d8b467]" />
                    ROSTER TITULAR (5 GLADIADORES)
                  </h2>
                  <p className="font-chakra text-xs text-[#8e857b] mt-0.5">
                    Alineación oficial registrada para la fase de grupos y playoffs
                  </p>
                </div>
                <span className="border border-[#2d261e] bg-[#18140f] px-3 py-1 font-mono text-xs font-bold text-[#d8b467]">
                  {corePlayers.length} / 5 ACTIVOS
                </span>
              </div>

              {/* Position Cards */}
              <div className="space-y-3">
                {DEFAULT_POSITIONS.map((defPos) => {
                  const member = roster.find(
                    (m) =>
                      m.competitive_position === defPos.pos &&
                      m.role !== "COACH" &&
                      m.role !== "STANDIN"
                  );

                  if (member) {
                    const isCaptain = member.role === "CAPTAIN";
                    const p = member.player;
                    const playerSlug = p?.slug || p?.nickname;

                    if (playerSlug) {
                      return (
                        <motion.div
                          key={defPos.pos}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: defPos.pos * 0.05 }}
                        >
                          <Link
                            href={`/players/${encodeURIComponent(playerSlug)}`}
                            className={`group/playercard relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border p-4 transition-all block hover:border-[#00c8f8] hover:bg-[#00c8f8]/5 ${
                              isCaptain
                                ? "border-[#d8b467]/50 bg-linear-to-r from-[#241c14] to-[#18140f] shadow-[0_0_20px_rgba(216,180,103,0.12)]"
                                : "border-[#2d261e] bg-[#18140f]"
                            }`}
                          >
                            {/* Left: Position Badge & Avatar & Nickname */}
                            <div className="flex items-center gap-3.5">
                              <div
                                className="relative flex h-12 w-12 shrink-0 items-center justify-center border border-[#3d3328] bg-[#14100c] group-hover/playercard:border-[#00c8f8] group-hover/playercard:scale-105 transition-all"
                                title={`Ver perfil de ${p.nickname}`}
                              >
                                {p?.avatar ? (
                                  <picture>
                                    <img
                                      src={p.avatar}
                                      alt={p.nickname}
                                      width={48}
                                      height={48}
                                      className="h-full w-full object-cover"
                                    />
                                  </picture>
                                ) : (
                                  <IconUser size={24} className="text-[#8e857b]" />
                                )}
                                {isCaptain && (
                                  <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#d8b467] text-black shadow-md">
                                    <IconCrown size={12} />
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${defPos.accent}`}
                                  >
                                    {defPos.label} • {defPos.name}
                                  </span>
                                  {isCaptain && (
                                    <span className="font-mono text-[10px] font-bold text-[#f0d38f] uppercase">
                                      CAPITÁN
                                    </span>
                                  )}
                                </div>

                                <h3 className="mt-1 font-chakra text-lg font-bold text-white group-hover/playercard:text-[#00c8f8] transition-colors flex items-center gap-2">
                                  <span>{p.nickname}</span>
                                  {p?.country && (
                                    <CountryFlag countryCode={p.country} showCode size="xs" />
                                  )}
                                </h3>

                                <p className="font-chakra text-xs text-[#8e857b]">
                                  {member.position_display || defPos.desc}
                                </p>
                              </div>
                            </div>

                            {/* Right: Steam ID / Account ID / Details & Button */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-[#241e17] pt-3 sm:pt-0">
                              <div className="flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto gap-1 text-[10px] font-mono">
                                {p?.account_id && (
                                  <span className="text-[#8e857b]">
                                    Dota ID: <span className="text-[#00c8f8] font-bold">{p.account_id}</span>
                                  </span>
                                )}
                                {p?.steam_id && (
                                  <span className="text-[#8e857b]">
                                    Steam: <span className="text-[#a8a197]">{p.steam_id}</span>
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 text-emerald-400">
                                  <IconUserCheck size={12} />
                                  Activo
                                </span>
                              </div>

                              <div className="inline-flex items-center justify-center gap-1.5 border border-[#2d261e] bg-[#14100c] px-3 py-1.5 font-chakra text-xs font-bold uppercase tracking-wider text-[#d8d2c7] group-hover/playercard:border-[#00c8f8] group-hover/playercard:bg-[#00c8f8]/10 group-hover/playercard:text-[#00c8f8] transition-all whitespace-nowrap">
                                <span>Ver Perfil</span>
                                <IconChevronRight size={13} />
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={defPos.pos}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: defPos.pos * 0.05 }}
                        className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border p-4 transition-all ${
                          isCaptain
                            ? "border-[#d8b467]/50 bg-linear-to-r from-[#241c14] to-[#18140f] shadow-[0_0_20px_rgba(216,180,103,0.12)]"
                            : "border-[#2d261e] bg-[#18140f]"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#3d3328] bg-[#14100c]">
                            <IconUser size={24} className="text-[#8e857b]" />
                          </div>
                          <div>
                            <span className={`border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${defPos.accent}`}>
                              {defPos.label} • {defPos.name}
                            </span>
                            <h3 className="mt-1 font-chakra text-lg font-bold text-white">
                              Gladiador
                            </h3>
                            <p className="font-chakra text-xs text-[#8e857b]">
                              {member.position_display || defPos.desc}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }

                  // Posición vacía / TBD
                  return (
                    <div
                      key={defPos.pos}
                      className="flex items-center justify-between border border-dashed border-[#241e17] bg-[#14100c]/40 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="border border-[#2d261e] bg-[#18140f] px-2 py-1 font-mono text-xs text-[#635a50]">
                          {defPos.label}
                        </span>
                        <div>
                          <div className="font-chakra text-sm font-semibold text-[#8e857b]">
                            {defPos.name} (Por Confirmar)
                          </div>
                          <div className="font-chakra text-xs text-[#635a50]">
                            Slot pendiente de anuncio oficial
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-[#635a50] uppercase">
                        TBD
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Coach & Stand-ins Section */}
              {(coachMembers.length > 0 || standinMembers.length > 0) && (
                <div className="mt-8 pt-6 border-t border-[#2d261e] space-y-4">
                  <h3 className="font-cinzel text-lg font-bold uppercase text-[#d8b467]">
                    CUERPO TÉCNICO & SUPLENTES
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {coachMembers.map((coach, idx) => (
                      <Link
                        key={`coach-${idx}`}
                        href={coach.player?.slug || coach.player?.nickname ? `/players/${encodeURIComponent(coach.player.slug || coach.player.nickname)}` : "#"}
                        className="group flex items-center justify-between border border-[#3d3328] bg-[#18140f] p-3.5 hover:border-[#d8b467] hover:bg-[#241c14] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#d8b467]/40 bg-[#2d261e] text-[#d8b467] group-hover:scale-105 transition-transform">
                            <IconUserCode size={20} />
                          </div>
                          <div>
                            <span className="border border-[#d8b467]/40 bg-[#d8b467]/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-[#d8b467] uppercase">
                              ENTRENADOR / COACH
                            </span>
                            <div className="font-chakra text-sm font-bold text-white group-hover:text-[#f0d38f] transition-colors mt-0.5">
                              {coach.player?.nickname || "Coach Oficial"}
                            </div>
                            {coach.player?.country && (
                              <CountryFlag countryCode={coach.player.country} showCode size="xs" />
                            )}
                          </div>
                        </div>
                        <IconChevronRight size={16} className="text-[#8e857b] group-hover:text-[#d8b467] transition-colors" />
                      </Link>
                    ))}

                    {standinMembers.map((st, idx) => (
                      <Link
                        key={`standin-${idx}`}
                        href={st.player?.slug || st.player?.nickname ? `/players/${encodeURIComponent(st.player.slug || st.player.nickname)}` : "#"}
                        className="group flex items-center justify-between border border-[#2d261e] bg-[#18140f] p-3.5 hover:border-[#00c8f8] hover:bg-[#141c24] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#00c8f8]/40 bg-[#14100c] text-[#00c8f8] group-hover:scale-105 transition-transform">
                            <IconShield size={20} />
                          </div>
                          <div>
                            <span className="border border-[#00c8f8]/40 bg-[#00c8f8]/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-[#00c8f8] uppercase">
                              STAND-IN / SUPLENTE
                            </span>
                            <div className="font-chakra text-sm font-bold text-white group-hover:text-[#00c8f8] transition-colors mt-0.5">
                              {st.player?.nickname || "Stand-in Oficial"}
                            </div>
                            {st.player?.country && (
                              <CountryFlag countryCode={st.player.country} showCode size="xs" />
                            )}
                          </div>
                        </div>
                        <IconChevronRight size={16} className="text-[#8e857b] group-hover:text-[#00c8f8] transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Series History */}
              <TeamSeriesHistory seriesHistory={seriesHistory} />
            </div>

            {/* Team Sidebar (Right column) */}
            <div className="space-y-6">
              {/* Meta Card */}
              <div className="border border-[#2d261e] bg-[#18140f] p-6 space-y-4">
                <h3 className="font-cinzel text-lg font-bold uppercase text-[#f3f3f5] border-b border-[#241e17] pb-3 flex items-center gap-2">
                  <IconInfoCircle size={18} className="text-[#00c8f8]" />
                  INFORMACIÓN DEL EQUIPO
                </h3>

                <div className="space-y-3 font-chakra text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-[#241e17]">
                    <span className="text-[#8e857b]">Nombre Oficial:</span>
                    <span className="font-semibold text-white">{team.name}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#241e17]">
                    <span className="text-[#8e857b]">Tag del Equipo:</span>
                    <span className="font-mono font-bold text-[#00c8f8]">[{team.tag}]</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#241e17]">
                    <span className="text-[#8e857b]">Región Competitiva:</span>
                    <span className="font-semibold text-[#d8b467]">
                      {team.region_display || team.region}
                    </span>
                  </div>

                  {team.country && (
                    <div className="flex justify-between items-center py-1 border-b border-[#241e17]">
                      <span className="text-[#8e857b]">País Origen:</span>
                      <span className="flex items-center gap-1.5 font-semibold text-white">
                        <CountryFlag countryCode={team.country} showCode size="sm" />
                      </span>
                    </div>
                  )}

                  {team.opendota_team_id && (
                    <div className="flex justify-between items-center py-1 border-b border-[#241e17]">
                      <span className="text-[#8e857b]">OpenDota ID:</span>
                      <span className="font-mono text-[#00c8f8]">{team.opendota_team_id}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1 border-b border-[#241e17]">
                    <span className="text-[#8e857b]">Estado de Inscripción:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {team.status_display || "CONFIRMADO"}
                    </span>
                  </div>

                  {team.created_at && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[#8e857b]">Registro en Coliseo:</span>
                      <span className="font-mono text-[#a8a197]">
                        {new Date(team.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tournament Rules / Coliseo Card */}
              <div className="border border-[#d8b467]/30 bg-linear-to-b from-[#241c14] to-[#18140f] p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#d8b467]">
                  <IconCrown size={20} />
                  <h4 className="font-cinzel text-base font-bold uppercase">
                    EL COLISEO II DE BENJAZ
                  </h4>
                </div>
                <p className="font-chakra text-xs text-[#c7bcab] leading-relaxed">
                  Este equipo compite bajo el formato Suizo de 16 equipos con bracket de doble eliminación en Playoffs. Todos los partidos son casteados en vivo.
                </p>
                <div className="pt-2">
                  <Link
                    href="/#formato"
                    className="inline-flex items-center gap-1 font-chakra text-xs font-bold text-[#00c8f8] hover:underline"
                  >
                    <span>Ver formato del torneo</span>
                    <IconExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LOGO MODAL ================= */}
      <AnimatePresence>
        {isLogoModalOpen && displayLogo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLogoModalOpen(false)}
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
                onClick={() => setIsLogoModalOpen(false)}
                className="absolute top-4 right-4 z-30 flex h-8 w-8 items-center justify-center border border-[#3d3328] bg-[#14100c] text-[#a8a197] hover:border-[#00c8f8] hover:text-white transition-colors"
                title="Cerrar modal"
              >
                <IconX size={18} />
              </button>

              {/* Modal Header */}
              <div className="relative z-10 flex items-center gap-2 border-b border-[#241e17] pb-3 pr-10">
                <span className="font-mono text-xs font-bold text-[#00c8f8]">
                  [{team.tag}]
                </span>
                <h3 className="font-cinzel text-lg font-bold text-white truncate">
                  {team.name}
                </h3>
              </div>

              {/* Modal Image Display */}
              <div className="relative z-10 mt-5 flex items-center justify-center border border-[#3d3328] bg-[#0e0b08] p-3 shadow-inner">
                <picture>
                  <img
                    src={displayLogo}
                    alt={`Logo ampliado de ${team.name}`}
                    className="max-h-[60vh] w-auto max-w-full object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
                  />
                </picture>
              </div>

              {/* Modal Footer Label */}
              <div className="relative z-10 mt-4 flex items-center justify-between text-xs font-chakra text-[#8e857b]">
                <span className="truncate pr-2">
                  {team.logo
                    ? "Emblema oficial del equipo"
                    : captain?.player?.nickname
                    ? `Foto del Capitán (${captain.player.nickname})`
                    : "Imagen de perfil"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(false)}
                  className="shrink-0 border border-[#d8b467]/40 bg-[#d8b467]/10 px-3 py-1 font-chakra text-xs font-bold uppercase tracking-wider text-[#d8b467] hover:bg-[#d8b467] hover:text-black transition-colors"
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
