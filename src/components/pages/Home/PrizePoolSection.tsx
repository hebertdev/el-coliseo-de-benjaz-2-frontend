"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TiltCard } from "components/ui/TiltCard";
import {
  IconCrown,
  IconTrophy,
  IconAward,
  IconFlame,
  IconCheck,
} from "@tabler/icons-react";
import { getPlayoffsStageAPI } from "services/stages";
import type { PlayoffStageData, StageTeamData, PlayoffBracketMatch, PlayoffThirdPlaceMatch } from "interfaces/stages";

interface PrizePoolSectionProps {
  initialPlayoffsData?: PlayoffStageData | null;
}

interface PodiumSlotData {
  team: StageTeamData | null;
  status: "CONFIRMED" | "FINALIST" | "PENDING";
  label: string;
  scoreDisplay?: string | null;
}

function isStatusCompleted(status?: string | null): boolean {
  if (!status) return false;
  const s = status.trim().toUpperCase();
  return s === "FINISHED" || s === "COMPLETED" || s === "DONE";
}

export function PrizePoolSection({ initialPlayoffsData }: PrizePoolSectionProps) {
  const [fetchedPlayoffsData, setFetchedPlayoffsData] = useState<PlayoffStageData | null>(null);
  const playoffsData = initialPlayoffsData || fetchedPlayoffsData;

  useEffect(() => {
    if (initialPlayoffsData) return;

    let isMounted = true;
    async function loadPlayoffs() {
      try {
        const data = await getPlayoffsStageAPI("playoffs", "el-gran-coliseo-ii");
        if (isMounted && data) {
          setFetchedPlayoffsData(data);
        }
      } catch (err) {
        console.error("Error al cargar datos de playoffs para el fondo de premios:", err);
      }
    }
    loadPlayoffs();
    return () => {
      isMounted = false;
    };
  }, [initialPlayoffsData]);

  // Extraer información del podio (1er, 2do y 3er puesto) desde los playoffs
  const podium = useMemo(() => {
    // 1. Localizar Tercer Puesto (3RD - Batalla por el Honor)
    const match3rd: PlayoffThirdPlaceMatch | undefined = playoffsData?.third_place_match || undefined;
    let thirdTeam: StageTeamData | null = null;
    let thirdStatus: "CONFIRMED" | "FINALIST" | "PENDING" = "PENDING";
    let thirdLabel = "Por definir en Semifinales";
    let thirdScore: string | null = null;

    if (match3rd) {
      const is3rdDone = isStatusCompleted(match3rd.status);

      if (is3rdDone) {
        if (match3rd.winner_slug) {
          if (match3rd.slot_a?.team?.slug === match3rd.winner_slug) {
            thirdTeam = match3rd.slot_a.team;
            thirdScore = `Victoria ${match3rd.slot_a.score ?? 2} - ${match3rd.slot_b?.score ?? 0}`;
          } else if (match3rd.slot_b?.team?.slug === match3rd.winner_slug) {
            thirdTeam = match3rd.slot_b.team;
            thirdScore = `Victoria ${match3rd.slot_b.score ?? 2} - ${match3rd.slot_a?.score ?? 0}`;
          }
        }
        if (!thirdTeam) {
          if ((match3rd.slot_a?.score ?? 0) > (match3rd.slot_b?.score ?? 0)) {
            thirdTeam = match3rd.slot_a.team;
            thirdScore = `Victoria ${match3rd.slot_a.score} - ${match3rd.slot_b.score}`;
          } else if ((match3rd.slot_b?.score ?? 0) > (match3rd.slot_a?.score ?? 0)) {
            thirdTeam = match3rd.slot_b.team;
            thirdScore = `Victoria ${match3rd.slot_b.score} - ${match3rd.slot_a.score}`;
          }
        }

        if (thirdTeam) {
          thirdStatus = "CONFIRMED";
          thirdLabel = "3er Lugar Conquistado";
        }
      } else if (match3rd.slot_a?.team && match3rd.slot_b?.team) {
        thirdStatus = "FINALIST";
        thirdLabel = "Batalla por el Honor en Curso";
        thirdScore = `${match3rd.slot_a.team.name} vs ${match3rd.slot_b.team.name}`;
      }
    }

    // 2. Localizar Gran Final (GF)
    let gfMatch: PlayoffBracketMatch | undefined;
    if (playoffsData?.bracket) {
      for (const round of playoffsData.bracket) {
        for (const m of round.matches) {
          if (m.identifier === "GF" || m.node_type === "GF" || (round.round_name && round.round_name.toLowerCase().includes("final"))) {
            gfMatch = m;
          }
        }
      }
    }
    if (!gfMatch && playoffsData?.rounds) {
      for (const round of playoffsData.rounds) {
        if (round.matches) {
          for (const m of round.matches) {
            if (m.identifier === "GF" || m.node_type === "GF" || (round.name && round.name.toLowerCase().includes("final"))) {
              gfMatch = {
                identifier: m.identifier || "GF",
                node_type: m.node_type || "GF",
                best_of: m.best_of,
                status: m.status,
                winner_slug: m.winner_slug,
                slot_a: { team: m.team_a, score: m.score_a },
                slot_b: { team: m.team_b, score: m.score_b },
              };
            }
          }
        }
      }
    }

    let firstTeam: StageTeamData | null = null;
    let firstStatus: "CONFIRMED" | "FINALIST" | "PENDING" = "PENDING";
    let firstLabel = "Por definir en Playoffs";
    let firstScore: string | null = null;

    let secondTeam: StageTeamData | null = null;
    let secondStatus: "CONFIRMED" | "FINALIST" | "PENDING" = "PENDING";
    let secondLabel = "Por definir en Playoffs";
    let secondScore: string | null = null;

    if (gfMatch) {
      const isGfDone = isStatusCompleted(gfMatch.status);

      if (isGfDone) {
        if (gfMatch.winner_slug) {
          if (gfMatch.slot_a?.team?.slug === gfMatch.winner_slug) {
            firstTeam = gfMatch.slot_a.team;
            secondTeam = gfMatch.slot_b?.team || null;
            firstScore = `Victoria ${gfMatch.slot_a.score ?? 3} - ${gfMatch.slot_b?.score ?? 0}`;
          } else if (gfMatch.slot_b?.team?.slug === gfMatch.winner_slug) {
            firstTeam = gfMatch.slot_b.team;
            secondTeam = gfMatch.slot_a?.team || null;
            firstScore = `Victoria ${gfMatch.slot_b.score ?? 3} - ${gfMatch.slot_a?.score ?? 0}`;
          }
        }
        if (!firstTeam) {
          if ((gfMatch.slot_a?.score ?? 0) > (gfMatch.slot_b?.score ?? 0)) {
            firstTeam = gfMatch.slot_a.team;
            secondTeam = gfMatch.slot_b?.team || null;
            firstScore = `Victoria ${gfMatch.slot_a.score} - ${gfMatch.slot_b.score}`;
          } else if ((gfMatch.slot_b?.score ?? 0) > (gfMatch.slot_a?.score ?? 0)) {
            firstTeam = gfMatch.slot_b.team;
            secondTeam = gfMatch.slot_a?.team || null;
            firstScore = `Victoria ${gfMatch.slot_b.score} - ${gfMatch.slot_a.score}`;
          }
        }

        if (firstTeam) {
          firstStatus = "CONFIRMED";
          firstLabel = "Emperador Coronado";
        }
        if (secondTeam) {
          secondStatus = "CONFIRMED";
          secondLabel = "Subcampeón del Coliseo";
          secondScore = "Finalista Oficial";
        }
      } else if (gfMatch.slot_a?.team && gfMatch.slot_b?.team) {
        firstStatus = "FINALIST";
        firstLabel = "Gran Final en Disputa";
        firstScore = `${gfMatch.slot_a.team.name} vs ${gfMatch.slot_b.team.name}`;

        secondStatus = "FINALIST";
        secondLabel = "Puesto Asegurado en el Podio";
        secondScore = `${gfMatch.slot_a.team.name} vs ${gfMatch.slot_b.team.name}`;
      }
    }

    return {
      first: { team: firstTeam, status: firstStatus, label: firstLabel, scoreDisplay: firstScore },
      second: { team: secondTeam, status: secondStatus, label: secondLabel, scoreDisplay: secondScore },
      third: { team: thirdTeam, status: thirdStatus, label: thirdLabel, scoreDisplay: thirdScore },
    };
  }, [playoffsData]);

  // Renderizar la placa de equipo dentro de la tarjeta
  const renderPodiumTeamBadge = (slot: PodiumSlotData, theme: "gold" | "blue" | "bronze") => {
    if (slot.status === "CONFIRMED" && slot.team) {
      const isGold = theme === "gold";
      const isBronze = theme === "bronze";

      const borderColor = isGold
        ? "border-[#d4af37]/80 hover:border-[#f0d38f]"
        : isBronze
        ? "border-[#cd7f32]/70 hover:border-[#f5a767]"
        : "border-[#2e9df0]/70 hover:border-[#6cc4ff]";

      const bgGradient = isGold
        ? "bg-gradient-to-b from-[#241a0d]/95 via-[#171108]/95 to-[#100c06]"
        : isBronze
        ? "bg-gradient-to-b from-[#221308]/95 via-[#160d05]/95 to-[#0e0803]"
        : "bg-gradient-to-b from-[#0e1b27]/95 via-[#09121b]/95 to-[#060c12]";

      const gemColor = isGold
        ? "border-[#ffe28a] bg-[#d8b467]"
        : isBronze
        ? "border-[#f5a767] bg-[#cd7f32]"
        : "border-[#6cc4ff] bg-[#2e9df0]";

      const badgeColor = isGold
        ? "border-[#d8b467] bg-[#2a200f] text-[#ffe494]"
        : isBronze
        ? "border-[#cd7f32] bg-[#2d1a0c] text-[#f5a767]"
        : "border-[#2e9df0] bg-[#0f2338] text-[#6cc4ff]";

      const logoBorder = isGold
        ? "border-[#d8b467]/70 bg-[#120e07]"
        : isBronze
        ? "border-[#cd7f32]/70 bg-[#120803]"
        : "border-[#2e9df0]/70 bg-[#070e16]";

      const badgeText = isGold
        ? "GRAN CAMPEÓN"
        : isBronze
        ? "3ER LUGAR CONFIRMADO"
        : "SUBCAMPEÓN";

      const IconComponent = isGold ? IconCrown : isBronze ? IconAward : IconTrophy;

      return (
        <div
          className={`relative mt-5 border p-3 sm:p-3.5 text-left transition-all duration-300 group/team ${borderColor} ${bgGradient} shadow-md`}
        >
          {/* Esquinas imperiales de gema */}
          <span className={`pointer-events-none absolute -top-1 -left-1 z-20 h-2 w-2 rotate-45 border ${gemColor}`} />
          <span className={`pointer-events-none absolute -top-1 -right-1 z-20 h-2 w-2 rotate-45 border ${gemColor}`} />
          <span className={`pointer-events-none absolute -bottom-1 -left-1 z-20 h-2 w-2 rotate-45 border ${gemColor}`} />
          <span className={`pointer-events-none absolute -bottom-1 -right-1 z-20 h-2 w-2 rotate-45 border ${gemColor}`} />

          <div className="flex items-center gap-3 min-w-0">
            {/* Logo del Equipo */}
            <div className={`relative h-11 w-11 sm:h-13 sm:w-13 shrink-0 overflow-hidden border p-1 flex items-center justify-center ${logoBorder}`}>
              {slot.team.logo_url ? (
                <picture>
                  <img
                    src={slot.team.logo_url}
                    alt={slot.team.name}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover/team:scale-110"
                  />
                </picture>
              ) : (
                <IconComponent size={22} className={isGold ? "text-[#f0d38f]" : isBronze ? "text-[#cd7f32]" : "text-[#2e9df0]"} />
              )}
            </div>

            {/* Datos del Equipo */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 border text-[8px] sm:text-[9px] font-chakra font-black uppercase tracking-wider ${badgeColor}`}>
                  <IconCheck size={10} className="stroke-[3]" />
                  <span>{badgeText}</span>
                </span>
              </div>

              <Link
                href={`/teams/${slot.team.slug}`}
                className="font-chakra text-xs sm:text-sm font-black uppercase text-white hover:text-[#f0d38f] transition-colors truncate block"
                title={slot.team.name}
              >
                {slot.team.name}
              </Link>

              <div className="flex items-center gap-1.5 mt-0.5">
                {slot.team.tag && (
                  <span className={`font-chakra text-[10px] font-bold tracking-wider truncate ${
                    isGold ? "text-[#f0d38f]" : isBronze ? "text-[#cd7f32]" : "text-[#6cc4ff]"
                  }`}>
                    [{slot.team.tag.toUpperCase()}]
                  </span>
                )}
                {slot.scoreDisplay && (
                  <span className="font-mono text-[9px] text-[#00e599] font-semibold truncate">
                    &bull; {slot.scoreDisplay}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (slot.status === "FINALIST") {
      return (
        <div className="relative mt-5 border border-[#d8b467]/40 bg-[#16120b]/80 p-3 text-left">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f0d38f] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f0d38f]" />
            </span>
            <span className="text-[9px] font-chakra font-black uppercase tracking-widest text-[#f0d38f]">
              GRAN FINAL EN DISPUTA
            </span>
          </div>
          <p className="text-xs sm:text-sm font-chakra font-black text-white truncate">
            {slot.scoreDisplay}
          </p>
          <span className="text-[10px] font-mono text-[#8e857b] block mt-0.5">
            Definición del trono imperial (BO5)
          </span>
        </div>
      );
    }

    // PENDING
    return (
      <div className="mt-5 border border-white/5 bg-[#120f0a]/60 p-2.5 text-center">
        <span className="text-[10px] font-mono text-[#6e6559] uppercase tracking-wider block">
          {slot.label}
        </span>
      </div>
    );
  };

  const cards = [
    {
      id: "second",
      orderClass: "order-2 md:order-1",
      tagLeft: "FINALISTA",
      tagRight: "II · SUBCAMPEÓN",
      prize: "S/ 25,000",
      currency: "PEN",
      title: "LAURELES DE PLATA",
      subtitle: "Medalla Imperial de Honor",
      footer: podium.second.status === "CONFIRMED"
        ? "Subcampeón de El Gran Coliseo II · Premio Acreditado"
        : podium.second.status === "FINALIST"
        ? "Finalista asegurado en la Gran Final (BO5)"
        : "Acreditación directa post-final",
      icon: IconTrophy,
      isEmperor: false,
      glowColor: "rgba(46, 157, 240, 0.18)",
      slot: podium.second,
      theme: "blue" as const,
    },
    {
      id: "first",
      orderClass: "order-1 md:order-2",
      tagLeft: "EMPERADOR",
      tagRight: "I · GRAN CAMPEÓN",
      prize: "S/ 60,000",
      currency: "PEN",
      title: "EL TRONO DEL COLISEO",
      subtitle: "Trofeo Imperial + Corona de Laureles",
      footer: podium.first.status === "CONFIRMED"
        ? "Gran Campeón de El Gran Coliseo II · Premio Acreditado"
        : podium.first.status === "FINALIST"
        ? "Por coronarse en la Gran Final (BO5)"
        : "Acreditación directa post-final",
      icon: IconCrown,
      isEmperor: true,
      glowColor: "rgba(240, 211, 143, 0.35)",
      slot: podium.first,
      theme: "gold" as const,
    },
    {
      id: "third",
      orderClass: "order-3 md:order-3",
      tagLeft: "3ER LUGAR",
      tagRight: "III · TERCER PUESTO",
      prize: "S/ 15,000",
      currency: "PEN",
      title: "GLADIADOR DE BRONCE",
      subtitle: "Medalla de Bronce & Honor",
      footer: podium.third.status === "CONFIRMED"
        ? "Vencedor de la Batalla por el Honor (3er Puesto) · Premio Acreditado"
        : "Acreditación directa post-final",
      icon: IconAward,
      isEmperor: false,
      glowColor: "rgba(205, 127, 50, 0.2)",
      slot: podium.third,
      theme: "bronze" as const,
    },
  ];

  const listRows = [
    {
      rank: 1,
      tag: "EMPERADOR · GRAN CAMPEÓN",
      title: "EL TRONO DEL COLISEO",
      desc: "Trofeo Imperial + Corona de Laureles · Acreditación directa post-final",
      amount: "S/ 60,000",
      currency: "PEN",
      isGold: true,
      slot: podium.first,
    },
    {
      rank: 2,
      tag: "FINALISTA · SUBCAMPEÓN",
      title: "LAURELES DE PLATA",
      desc: "Medalla Imperial de Honor · Acreditación directa post-final",
      amount: "S/ 25,000",
      currency: "PEN",
      isGold: false,
      slot: podium.second,
    },
    {
      rank: 3,
      tag: "3ER LUGAR",
      title: "GLADIADOR DE BRONCE",
      desc: "Medalla de Bronce & Honor · Acreditación directa post-final",
      amount: "S/ 15,000",
      currency: "PEN",
      isGold: false,
      slot: podium.third,
    },
  ];

  return (
    <section
      id="premios"
      className="relative w-full border-t border-[#221c16] bg-[#090806] py-14 sm:py-20 lg:py-28 text-white overflow-hidden"
    >
      {/* Tactical Matrix Grid Background - Elegant & subtle */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1a1510_1px,transparent_1px),linear-gradient(to_bottom,#1a1510_1px,transparent_1px)] bg-size-[44px_44px] opacity-25" />
      <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 h-72 sm:h-80 w-72 sm:w-80 rounded-full bg-[#d8b467]/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-64 sm:h-72 w-64 sm:w-72 rounded-full bg-[#2e9df0]/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-3 sm:mb-4 flex items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto">
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-[#d8b467]/60 to-[#d8b467]" />
            <div className="flex items-center gap-2 font-chakra text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#f0d38f] drop-shadow-[0_2px_10px_rgba(216,180,103,0.45)]">
              <IconFlame size={15} className="text-[#f0d38f] shrink-0" />
              <span>TRIBUTO A LOS VENCEDORES</span>
              <IconFlame size={15} className="text-[#f0d38f] shrink-0" />
            </div>
            <div className="h-px flex-1 bg-linear-to-l from-transparent via-[#d8b467]/60 to-[#d8b467]" />
          </div>

          <h2 className="mt-4 sm:mt-5 font-coliseo-title text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
            Fondo de <span className="text-[#f0d38f]">Premios</span>
          </h2>

          {/* Prize Pool Highlight with Shimmer */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="my-5 sm:my-6 inline-block border-y border-[#d8b467]/30 bg-linear-to-r from-transparent via-[#1c160f]/90 to-transparent px-6 sm:px-10 py-3 relative overflow-hidden"
          >
            <div className="font-chakra text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#f0d38f] drop-shadow-[0_2px_15px_rgba(240,211,143,0.4)]">
              S/ 100,000 <span className="text-lg sm:text-2xl text-white font-bold">PEN</span>
            </div>
            <div className="mt-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#8e857b]">
              Pozo total oficial del torneo
            </div>
          </motion.div>
        </motion.div>

        {/* 1. TOP PODIUM 3 CARDS with 3D Tilt & Staggered Rise */}
        <div className="mt-10 sm:mt-14 grid gap-5 sm:gap-6 md:grid-cols-3 items-stretch">
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: card.isEmperor ? 50 : 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.7,
                  delay: card.isEmperor ? 0.1 : index * 0.15 + 0.2,
                  ease: "easeOut",
                }}
                className={`${card.orderClass} h-full`}
              >
                <TiltCard
                  glowColor={card.glowColor}
                  className="h-full"
                >
                  {card.isEmperor ? (
                    /* Center Emperor Card: Luxury Matte Resting -> Majestic Golden Radiance on Hover */
                    <div
                      className="group relative flex h-full flex-col justify-between bg-[#110e0a] border-2 border-[#d4af37]/70 p-6 sm:p-8 transition-all duration-400 ease-out hover:border-[#f0d38f] hover:bg-[#16120b] hover:shadow-[0_0_55px_rgba(216,180,103,0.35)]"
                    >
                      {/* Roman Imperial Delicate Frame Corner Gems */}
                      <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#ffe28a] bg-[#d8b467] shadow-[0_0_8px_rgba(240,211,143,0.8)]" />
                      <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#ffe28a] bg-[#d8b467] shadow-[0_0_8px_rgba(240,211,143,0.8)]" />
                      <span className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#ffe28a] bg-[#d8b467] shadow-[0_0_8px_rgba(240,211,143,0.8)]" />
                      <span className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#ffe28a] bg-[#d8b467] shadow-[0_0_8px_rgba(240,211,143,0.8)]" />

                      {/* Inner Delicate Gold Engraved Line */}
                      <span className="pointer-events-none absolute inset-1.25 border border-[#d4af37]/30 transition-colors group-hover:border-[#ffe28a]/60" />

                      <div>
                        {/* Top Header */}
                        <div className="flex items-center justify-between border-b border-[#2b2214] pb-4 transition-colors duration-300 group-hover:border-[#42341b]">
                          <span className="font-chakra text-xs font-bold uppercase tracking-[0.2em] text-[#f0d38f] transition-all duration-300 group-hover:tracking-[0.25em] group-hover:text-[#ffe494]">
                            {card.tagLeft}
                          </span>
                          <span className="font-mono text-xs uppercase tracking-wider text-[#9e854b] transition-colors duration-300 group-hover:text-[#d8b467]">
                            {card.tagRight}
                          </span>
                        </div>

                        {/* Crown Icon Box with Breathing Floating Animation */}
                        <div className="mt-6 sm:mt-8 flex justify-center">
                          <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-[2px] border border-[#d8b467]/70 bg-[#1e170c] text-[#f0d38f] transition-all duration-400 ease-out group-hover:scale-115 group-hover:border-[#ffe28a] group-hover:bg-[#2a200f] group-hover:text-[#fff1b8] group-hover:shadow-[0_0_30px_rgba(240,211,143,0.7)]"
                          >
                            <Icon size={32} stroke={1.8} />
                          </motion.div>
                        </div>

                        {/* Prize Amount */}
                        <div className="mt-5 sm:mt-6 text-center">
                          <div className="flex items-baseline justify-center gap-1 font-chakra text-4xl sm:text-5xl font-black text-white transition-all duration-300 group-hover:text-[#fffdfa]">
                            <span>{card.prize}</span>
                            <span className="font-mono text-xs font-bold text-[#f0d38f] transition-colors duration-300 group-hover:text-[#ffe28a]">
                              {card.currency}
                            </span>
                          </div>

                          <h3 className="mt-2.5 sm:mt-3 font-chakra text-base sm:text-lg font-black uppercase tracking-wider text-[#f0d38f] transition-colors duration-300 group-hover:text-[#ffe494]">
                            {card.title}
                          </h3>

                          <p className="mt-1 text-xs text-[#a89e90] transition-colors duration-300 group-hover:text-[#cfc4b4]">
                            {card.subtitle}
                          </p>
                        </div>

                        {/* Placa del Equipo en el Podio */}
                        {renderPodiumTeamBadge(card.slot, card.theme)}
                      </div>

                      {/* Footer */}
                      <div className="mt-6 sm:mt-8 border-t border-[#261e11] pt-4 text-center font-mono text-[11px] text-[#73685a] tracking-wider transition-colors duration-300 group-hover:border-[#382b18] group-hover:text-[#a89a84]">
                        {card.footer}
                      </div>
                    </div>
                  ) : (
                    /* Finalist & 3rd Place Cards: Stealth Resting -> Electric Azure / Bronze Glow on Hover */
                    <div
                      className={`group relative flex h-full flex-col justify-between bg-[#0e0c0a] border p-6 sm:p-8 transition-all duration-400 ease-out ${
                        card.id === "third"
                          ? "border-[#2d2218] hover:border-[#cd7f32] hover:bg-[#150f0a] hover:shadow-[0_0_40px_rgba(205,127,50,0.3)]"
                          : "border-[#221c16] hover:border-[#2e9df0] hover:bg-[#0c131a] hover:shadow-[0_0_40px_rgba(46,157,240,0.3)]"
                      }`}
                    >
                      {/* Top Light Shimmer on Hover */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-transparent to-transparent opacity-0 transition-all duration-400 ${
                          card.id === "third"
                            ? "group-hover:via-[#f5a767] group-hover:opacity-100 group-hover:shadow-[0_0_12px_#cd7f32]"
                            : "group-hover:via-[#6cc4ff] group-hover:opacity-100 group-hover:shadow-[0_0_12px_#2e9df0]"
                        }`}
                      />

                      {/* Tactical Corner Accents */}
                      <span
                        className={`pointer-events-none absolute -top-px -left-px h-2.5 w-2.5 border-t border-l border-white/10 transition-colors duration-300 ${
                          card.id === "third" ? "group-hover:border-[#f5a767]" : "group-hover:border-[#6cc4ff]"
                        }`}
                      />
                      <span
                        className={`pointer-events-none absolute -bottom-px -right-px h-2.5 w-2.5 border-b border-r border-white/10 transition-colors duration-300 ${
                          card.id === "third" ? "group-hover:border-[#f5a767]" : "group-hover:border-[#6cc4ff]"
                        }`}
                      />

                      <div>
                        {/* Top Header */}
                        <div
                          className={`flex items-center justify-between border-b pb-4 transition-colors duration-300 ${
                            card.id === "third"
                              ? "border-[#261c14] group-hover:border-[#382619]"
                              : "border-[#1c1712] group-hover:border-[#1e3245]"
                          }`}
                        >
                          <span
                            className={`font-chakra text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
                              card.id === "third"
                                ? "text-[#a89078] group-hover:text-[#f5a767]"
                                : "text-[#8e857b] group-hover:text-[#6cc4ff]"
                            }`}
                          >
                            {card.tagLeft}
                          </span>
                          <span
                            className={`font-mono text-xs uppercase tracking-wider transition-colors duration-300 ${
                              card.id === "third"
                                ? "text-[#7a6452] group-hover:text-[#cd7f32]"
                                : "text-[#544d44] group-hover:text-[#7bbde8]"
                            }`}
                          >
                            {card.tagRight}
                          </span>
                        </div>

                        {/* Icon Box */}
                        <div className="mt-6 sm:mt-8 flex justify-center">
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-[2px] border transition-all duration-400 ease-out ${
                              card.id === "third"
                                ? "border-[#332216] bg-[#160e08] text-[#a88265] group-hover:scale-110 group-hover:border-[#cd7f32] group-hover:bg-[#25150a] group-hover:text-[#f5a767] group-hover:shadow-[0_0_24px_rgba(205,127,50,0.5)]"
                                : "border-[#241e17] bg-[#14110d] text-[#6b6256] group-hover:scale-110 group-hover:border-[#2e9df0] group-hover:bg-[#0f2338] group-hover:text-[#6cc4ff] group-hover:shadow-[0_0_24px_rgba(46,157,240,0.55)]"
                            }`}
                          >
                            <Icon size={28} stroke={1.8} />
                          </div>
                        </div>

                        {/* Prize Amount */}
                        <div className="mt-5 sm:mt-6 text-center">
                          <div className="flex items-baseline justify-center gap-1 font-chakra text-3xl sm:text-4xl font-black text-white transition-colors duration-300 group-hover:text-white">
                            <span>{card.prize}</span>
                            <span
                              className={`font-mono text-xs transition-colors duration-300 ${
                                card.id === "third"
                                  ? "text-[#8a7260] group-hover:text-[#f5a767] group-hover:font-semibold"
                                  : "text-[#5c5449] group-hover:text-[#6cc4ff] group-hover:font-semibold"
                              }`}
                            >
                              {card.currency}
                            </span>
                          </div>

                          <h3
                            className={`mt-2.5 sm:mt-3 font-chakra text-sm sm:text-base font-bold uppercase tracking-wider text-white transition-colors duration-300 ${
                              card.id === "third" ? "group-hover:text-[#ffe4cb]" : "group-hover:text-[#e4f2ff]"
                            }`}
                          >
                            {card.title}
                          </h3>

                          <p
                            className={`mt-1 text-xs transition-colors duration-300 ${
                              card.id === "third"
                                ? "text-[#7a6f65] group-hover:text-[#c4a993]"
                                : "text-[#6e6559] group-hover:text-[#9bc2e0]"
                            }`}
                          >
                            {card.subtitle}
                          </p>
                        </div>

                        {/* Placa del Equipo en el Podio */}
                        {renderPodiumTeamBadge(card.slot, card.theme)}
                      </div>

                      {/* Footer */}
                      <div
                        className={`mt-6 sm:mt-8 border-t pt-4 text-center font-mono text-[11px] tracking-wider transition-colors duration-300 ${
                          card.id === "third"
                            ? "border-[#241a12] text-[#6e5d50] group-hover:border-[#382619] group-hover:text-[#b89578]"
                            : "border-[#18130e] text-[#524b41] group-hover:border-[#1a2d3e] group-hover:text-[#6d9bbd]"
                        }`}
                      >
                        {card.footer}
                      </div>
                    </div>
                  )}
                </TiltCard>
              </motion.div>
            );
          })}
        </div>

        {/* 2. DETAILED LIST BREAKDOWN WITH INTERACTIVE HOVER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 overflow-hidden border border-[#221c16] bg-[#0d0b09] shadow-2xl"
        >
          {listRows.map((row, idx) => (
            <motion.div
              key={row.rank}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`group relative flex flex-col justify-between gap-4 p-6 transition-all duration-300 ease-out md:flex-row md:items-center ${
                idx > 0 ? "border-t border-[#1a1510]" : ""
              } ${
                row.isGold
                  ? "border-l-4 border-l-[#d4af37]/60 hover:border-l-[#f0d38f] hover:bg-linear-to-r hover:from-[#221b0d]/90 hover:via-[#15120a] hover:to-[#0d0b09] hover:shadow-[0_0_30px_rgba(216,180,103,0.18)]"
                  : row.rank === 3
                  ? "border-l-4 border-l-[#cd7f32]/50 hover:border-l-[#f5a767] hover:bg-linear-to-r hover:from-[#24150a]/90 hover:via-[#160e06] hover:to-[#0d0b09] hover:shadow-[0_0_30px_rgba(205,127,50,0.2)]"
                  : "border-l-4 border-l-[#2e9df0]/40 hover:border-l-[#2e9df0] hover:bg-linear-to-r hover:from-[#0d1d2d]/90 hover:via-[#0f151c] hover:to-[#0d0b09] hover:shadow-[0_0_30px_rgba(46,157,240,0.2)]"
              }`}
            >
              {/* Left Rank & Title Info */}
              <div className="flex items-center gap-5 sm:gap-6">
                {/* Visual Rank Indicator */}
                {row.isGold ? (
                  <div className="flex h-11 w-1.5 shrink-0 rounded-full bg-[#d4af37]/70 transition-all duration-300 group-hover:bg-[#f0d38f] group-hover:shadow-[0_0_12px_rgba(240,211,143,0.7)]" />
                ) : row.rank === 2 ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <div className="h-9 w-1 rounded-sm bg-[#2e9df0]/60 transition-all duration-300 group-hover:bg-[#2e9df0] group-hover:shadow-[0_0_10px_rgba(46,157,240,0.7)]" />
                    <div className="h-9 w-1 rounded-sm bg-[#2e9df0]/60 transition-all duration-300 group-hover:bg-[#2e9df0] group-hover:shadow-[0_0_10px_rgba(46,157,240,0.7)]" />
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center gap-1">
                    <div className="h-9 w-1 rounded-sm bg-[#cd7f32]/60 transition-all duration-300 group-hover:bg-[#f5a767] group-hover:shadow-[0_0_10px_rgba(205,127,50,0.7)]" />
                    <div className="h-9 w-1 rounded-sm bg-[#cd7f32]/60 transition-all duration-300 group-hover:bg-[#f5a767] group-hover:shadow-[0_0_10px_rgba(205,127,50,0.7)]" />
                    <div className="h-9 w-1 rounded-sm bg-[#cd7f32]/60 transition-all duration-300 group-hover:bg-[#f5a767] group-hover:shadow-[0_0_10px_rgba(205,127,50,0.7)]" />
                  </div>
                )}

                {/* Details */}
                <div>
                  <div
                    className={`flex items-center gap-2 font-chakra text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
                      row.isGold
                        ? "text-[#d8b467] group-hover:text-[#ffe494]"
                        : row.rank === 3
                        ? "text-[#cd7f32] group-hover:text-[#f5a767]"
                        : "text-[#8e857b] group-hover:text-[#6cc4ff]"
                    }`}
                  >
                    {row.isGold && (
                      <IconCrown
                        size={15}
                        className="text-[#d8b467] transition-colors duration-300 group-hover:text-[#ffe494]"
                      />
                    )}
                    <span>{row.tag}</span>
                  </div>

                  <h4
                    className={`mt-1 font-chakra text-lg font-black uppercase tracking-wide transition-colors duration-300 sm:text-xl ${
                      row.isGold
                        ? "text-white group-hover:text-[#fff7df]"
                        : row.rank === 3
                        ? "text-white group-hover:text-[#ffe8d4]"
                        : "text-white group-hover:text-[#e4f2ff]"
                    }`}
                  >
                    {row.title}
                  </h4>

                  <p className="mt-1 text-xs text-[#736a5e] transition-colors duration-300 group-hover:text-[#a89f92] sm:text-[13px]">
                    {row.desc}
                  </p>

                  {/* Equipo vencedor o en disputa en el desglose */}
                  {row.slot?.team ? (
                    <div className="mt-2.5 inline-flex items-center gap-2.5 px-3 py-1 border border-[#3a2d1d] bg-[#140f0a] rounded-xs">
                      {row.slot.team.logo_url && (
                        <div className="h-5 w-5 shrink-0 overflow-hidden flex items-center justify-center">
                          <picture>
                            <img
                              src={row.slot.team.logo_url}
                              alt={row.slot.team.name}
                              className="h-full w-full object-contain"
                            />
                          </picture>
                        </div>
                      )}
                      <Link
                        href={`/teams/${row.slot.team.slug}`}
                        className="font-chakra text-xs sm:text-sm font-black uppercase text-white hover:text-[#f0d38f] transition-colors"
                      >
                        {row.slot.team.name}
                      </Link>
                      {row.slot.team.tag && (
                        <span className="font-mono text-[10px] text-[#8e857b]">
                          [{row.slot.team.tag.toUpperCase()}]
                        </span>
                      )}
                      {row.slot.scoreDisplay && (
                        <span className="font-mono text-[10px] text-[#00e599] font-bold">
                          &bull; {row.slot.scoreDisplay}
                        </span>
                      )}
                    </div>
                  ) : row.slot?.status === "FINALIST" ? (
                    <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 border border-[#d8b467]/30 bg-[#17120a] rounded-xs">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f0d38f] opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f0d38f]" />
                      </span>
                      <span className="text-[11px] font-chakra font-bold text-[#f0d38f] uppercase">
                        En disputa: {row.slot.scoreDisplay}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Right Prize Amount */}
              <div className="flex items-baseline justify-end gap-1.5 self-end font-chakra text-3xl font-black text-white transition-all duration-300 sm:text-4xl md:self-center">
                <span>{row.amount}</span>
                <span
                  className={`font-mono text-xs font-bold uppercase transition-colors duration-300 ${
                    row.isGold
                      ? "text-[#d8b467] group-hover:text-[#ffe494]"
                      : row.rank === 3
                      ? "text-[#cd7f32] group-hover:text-[#f5a767]"
                      : "text-[#544d44] group-hover:text-[#6cc4ff]"
                  }`}
                >
                  {row.currency}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
