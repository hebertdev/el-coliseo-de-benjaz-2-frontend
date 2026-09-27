"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import bannerBg from "assets/banner_el_coliseo.webp";
import { ColosseumEmbers } from "components/ui/ColosseumEmbers";
import { TrueSightModal } from "./TrueSightModal";
import { PlayerOfTheDayModal } from "./PlayerOfTheDayModal";
import type { PlayerOfTheDayResponse } from "interfaces/playerOfTheDay";
import {
  IconSwords,
  IconCalendarEvent,
  IconCrown,
  IconPlayerPlayFilled,
  IconTrophy,
} from "@tabler/icons-react";

import logo1xBet from "assets/sponsors/logo_1xbet.webp";
import logoDota2 from "assets/sponsors/logo_dota2.webp";
import logoHebertdev from "assets/sponsors/logo_hebertdev.webp";
import logoKick from "assets/sponsors/logo_kick.webp";


const sponsors = [
  {
    name: "1xBet",
    logo: logo1xBet.src,
    url: "https://1xbet.pe/",
  },
  {
    name: "Dota2",
    logo: logoDota2.src,
    url: "https://www.dota2.com/home",
  },
  {
    name: "Kick.com",
    logo: logoKick.src,
    url: "https://kick.com",
  },
  {
    name: "Benjaz",
    icon: IconCrown,
    url: "https://kick.com/benjaz",
  },
  {
    name: "Hebertdev",
    logo: logoHebertdev.src,
    url: "https://hebertdev.com",
  },
];

const STORAGE_KEY_POTD_TOP3 = "coliseo_potd_seen_top3";

function getTop3Signature(data?: PlayerOfTheDayResponse | null): string | null {
  if (!data?.top_3_players || data.top_3_players.length === 0) return null;
  const jornadaKey = data.jornada?.id || data.jornada?.date || "jornada";
  const top3 = data.top_3_players.slice(0, 3);
  const playersSignature = top3
    .map((p) => `${p.rank}:${p.steam_id || p.account_id || p.player_slug}`)
    .join("|");
  return `${jornadaKey}:${playersSignature}`;
}

interface BannerProps {
  initialPlayerOfTheDay?: PlayerOfTheDayResponse | null;
}

export function Banner({ initialPlayerOfTheDay }: BannerProps = {}) {
  const [isTrueSightOpen, setIsTrueSightOpen] = useState(false);
  const [isPlayerOfTheDayOpen, setIsPlayerOfTheDayOpen] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const marqueeSponsors = [...sponsors, ...sponsors, ...sponsors, ...sponsors];
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const currentSignature = getTop3Signature(initialPlayerOfTheDay);
    if (!currentSignature) return;

    try {
      const savedSignature = localStorage.getItem(STORAGE_KEY_POTD_TOP3);

      // Si no coincide la firma guardada (primera visita, cambió el orden, o cambiaron los SteamIDs de los 3 tops)
      if (savedSignature !== currentSignature) {
        const timer = setTimeout(() => {
          setIsPlayerOfTheDayOpen(true);
          try {
            localStorage.setItem(STORAGE_KEY_POTD_TOP3, currentSignature);
          } catch {
            // Ignorar errores en modo incógnito/privado
          }
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignorar fallo de acceso a localStorage
    }
  }, [initialPlayerOfTheDay]);

  const handleClosePlayerOfTheDay = () => {
    setIsPlayerOfTheDayOpen(false);
    const currentSignature = getTop3Signature(initialPlayerOfTheDay);
    if (currentSignature) {
      try {
        localStorage.setItem(STORAGE_KEY_POTD_TOP3, currentSignature);
      } catch {
        // Ignorar
      }
    }
  };


  // Parallax on Scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.22]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  // 3D Mouse Parallax Tilt for Hero
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex h-[calc(100dvh-80px)] min-h-[580px] w-full flex-col justify-between overflow-hidden bg-[#120f0a] text-white perspective-[1000px]"
    >
      {/* Background Video with Multi-layer Parallax */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 z-0 select-none will-change-transform overflow-hidden"
      >
        {/* Instant Fallback Image for Slow Connections / Mobile */}
        <picture>
          <img
            src={bannerBg.src}
            alt="El Coliseo de Benjaz II - Torneo Dota 2"
            className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
          />
        </picture>

        {/* Video Layer (Fades in smoothly when ready to play) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={bannerBg.src}
          onLoadedData={() => setIsVideoLoaded(true)}
          onPlaying={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover object-center pointer-events-none transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/video_banner_1xbet_compress.mp4" type="video/mp4" />
        </video>

        {/* Ambient Dark Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-linear-to-t from-[#120f0a] via-[#120f0a]/40 to-[#120f0a]/50" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#120f0a]/30 to-[#120f0a]/75" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,200,248,0.15)_0%,transparent_70%)]" />
      </motion.div>

      {/* Floating Arena Embers & Sparks */}
      <ColosseumEmbers count={65} />

      {/* Hero Content (Centered) with 3D Mouse Tilt & Spring Physics */}
      <motion.div
        style={{
          y: contentY,
          opacity: contentOpacity,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-3 sm:py-6 lg:py-4 text-center sm:px-6 lg:px-8"
      >
        {/* Imperial Laurel Lines Header (No boxes, clean gold lines fading out) */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-3 sm:mb-5 flex items-center justify-center gap-2 sm:gap-4 w-full max-w-xl px-2"
        >
          <div className="hidden sm:block h-px flex-1 bg-linear-to-r from-transparent via-[#d8b467]/60 to-[#d8b467]" />
          <div className="flex items-center gap-1.5 sm:gap-2 font-chakra text-[9px] xs:text-[11px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-[0.28em] text-[#f0d38f] drop-shadow-[0_2px_12px_rgba(216,180,103,0.45)] whitespace-nowrap">
            <IconSwords size={13} className="text-[#f0d38f] shrink-0 sm:size-[15px]" />
            <span>TEMPORADA II · CAMPEONATO DE DOTA 2</span>
            <IconSwords size={13} className="text-[#f0d38f] shrink-0 sm:size-[15px]" />
          </div>
          <div className="hidden sm:block h-px flex-1 bg-linear-to-l from-transparent via-[#d8b467]/60 to-[#d8b467]" />
        </motion.div>

        {/* Main Tournament Title */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="font-coliseo-title text-3xl sm:text-5xl md:text-7xl lg:text-[84px] font-black uppercase tracking-wider text-white drop-shadow-[0_4px_35px_rgba(0,0,0,0.95)] leading-[1.1] sm:leading-[1.05]"
        >
          EL GRAN <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-[#6cc4ff] to-[#00c8f8]">COLISEO II</span>
        </motion.h1>

        {/* Subtitle / Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-3 sm:mt-4 max-w-2xl text-xs sm:text-sm md:text-base font-normal leading-relaxed text-[#d4cdc4] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
        >
          Donde los mejores <span className="font-semibold text-[#6cc4ff]">streamers y pro players</span> de{" "}
          <span className="font-semibold text-white">Dota 2</span> forjan sus equipos mediante un intenso{" "}
          <span className="font-semibold text-[#f0d38f]">draft en vivo</span>. Estrategia, rivalidad y puro show en la arena de Benjaz.
        </motion.p>

        {/* Action Buttons (Dual CTAs) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2.5 w-full"
        >
          {/* Primary CTA 1: Brackets & Torneo (Cyan Glass Frame) */}
          <Link
            href="/swiss-stage"
            className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 overflow-hidden border border-[#00c8f8]/80 bg-[#00c8f8]/15 px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#6cc4ff] backdrop-blur-md transition-all duration-200 hover:border-[#00c8f8] hover:bg-[#00c8f8] hover:text-black hover:shadow-[0_0_25px_rgba(0,200,248,0.6)] hover:scale-[1.02] active:scale-[0.98]"
            style={{
              clipPath: "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)",
            }}
          >
            {/* Shimmer Light Reflection */}
            <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <IconSwords size={17} className="relative z-10 transition-transform duration-300 group-hover:rotate-12 shrink-0 text-[#00c8f8] group-hover:text-black" />
            <span className="relative z-10">Ver Brackets &amp; Torneo</span>
          </Link>

          {/* Primary CTA 2: True Sight I Video Modal (Golden Red Glass Frame) */}
          <button
            type="button"
            onClick={() => setIsTrueSightOpen(true)}
            className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 overflow-hidden border border-[#d8b467]/80 bg-[#251b11]/80 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#f0d38f] backdrop-blur-md transition-all duration-200 hover:border-[#f0d38f] hover:bg-[#d8b467] hover:text-black hover:shadow-[0_0_25px_rgba(216,180,103,0.6)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={{
              clipPath: "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)",
            }}
          >
            {/* Red Pulsing Play Icon */}
            <div className="relative flex h-4 w-4 items-center justify-center shrink-0">
              <IconPlayerPlayFilled size={15} className="relative z-10 text-red-500 group-hover:text-black transition-colors" />
            </div>
            <span className="relative z-10">Ver True Sight I</span>
          </button>

          {/* Primary CTA 3: Jugador del Día Modal (Imperial Gold Glowing Frame) */}
          <button
            type="button"
            onClick={() => setIsPlayerOfTheDayOpen(true)}
            className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 overflow-hidden border border-[#f0d38f] bg-[#291e12]/90 px-5 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#f0d38f] backdrop-blur-md transition-all duration-200 hover:border-[#f0d38f] hover:bg-[#d8b467] hover:text-black hover:shadow-[0_0_25px_rgba(240,211,143,0.8)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={{
              clipPath: "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)",
            }}
          >
            <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <div className="relative flex h-4 w-4 items-center justify-center shrink-0">
              <IconTrophy size={16} className="relative z-10 text-[#f0d38f] group-hover:text-black transition-colors" />
            </div>
            <span className="relative z-10 font-chakra font-black">Jugador del Día</span>
            <span className="relative z-10 rounded-[2px] bg-[#f0d38f]/25 group-hover:bg-black/20 px-1.5 py-0.5 text-[9px] font-black text-[#f0d38f] group-hover:text-black tracking-wider border border-[#f0d38f]/40 group-hover:border-black/30">
              TOP 3
            </span>
          </button>
        </motion.div>


        {/* Tournament Date Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: "easeOut" }}
          className="mt-4 sm:mt-6 inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 border-y border-[#d8b467]/30 bg-linear-to-r from-transparent via-[#1c160f]/90 to-transparent px-3 sm:px-8 py-2 font-chakra"
        >
          <IconCalendarEvent size={15} className="text-[#f0d38f] shrink-0" />
          <span className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider text-[#d4cdc4]">
            FECHA OFICIAL:
          </span>
          <span className="text-[#f0d38f] font-black tracking-widest bg-[#d8b467]/15 border border-[#d8b467]/40 px-2 py-0.5 text-[10px] sm:text-xs">
            03 AL 13 DE SETIEMBRE
          </span>
        </motion.div>

        {/* Fan-made Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          className="mt-2 text-[9px] sm:text-[10px] text-[#9c9389] font-mono uppercase tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
        >
          * Sitio no oficial · Creado por un fan de Dota 2 por falta de información del torneo
        </motion.p>
      </motion.div>

      {/* Bottom Sponsors Bar - Carrusel infinito animado */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full shrink-0 border-t border-[#2d261e] bg-[#0d0b08]/90 backdrop-blur-md shadow-2xl"
      >
        <div className="mx-auto flex h-14 sm:h-16 md:h-20 max-w-7xl items-center px-3 sm:px-6 lg:px-8">
          {/* Left Fixed Label */}
          <div className="relative z-20 flex shrink-0 items-center border-r border-[#2d261e] pr-3 sm:pr-6 md:pr-8 bg-[#0d0b08]/90">
            <span className="font-chakra text-xs sm:text-sm md:text-base font-bold uppercase tracking-wider md:tracking-widest text-[#f3f3f5]">
              Sponsors
            </span>
          </div>

          {/* Infinite Animated Sponsors Carousel Track */}
          <div className="relative flex-1 overflow-hidden">
            {/* Left fade shadow */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 sm:w-12 bg-linear-to-r from-[#0d0b08] to-transparent" />
            {/* Right fade shadow */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 sm:w-12 bg-linear-to-l from-[#0d0b08] to-transparent" />

            <div className="animate-marquee items-center gap-8 sm:gap-12 md:gap-16 pl-4 sm:pl-6 hover:[animation-play-state:paused]">
              {marqueeSponsors.map((sponsor, index) => {
                const Icon = sponsor.icon;
                return (
                  <a
                    key={`${sponsor.name}-${index}`}
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex shrink-0 cursor-pointer items-center gap-2.5 sm:gap-3 text-[#9c9389] transition-all duration-200 hover:text-white"
                    title={`Visitar sitio oficial de ${sponsor.name}`}
                  >
                    {sponsor.logo ? (
                      <picture>
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          className="h-3.5 sm:h-[18px] md:h-5 w-auto object-contain opacity-65 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
                        />
                      </picture>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[#d8b467] opacity-70 group-hover:opacity-100 group-hover:text-[#f0d38f] transition-all duration-300">
                        {Icon && (
                          <Icon
                            size={16}
                            className="transition-transform duration-300 group-hover:scale-110 sm:size-[18px]"
                          />
                        )}
                        <span className="font-chakra text-[11px] sm:text-xs font-bold tracking-wider">
                          {sponsor.name}
                        </span>
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* True Sight Video Lightbox Modal */}
      <TrueSightModal
        isOpen={isTrueSightOpen}
        onClose={() => setIsTrueSightOpen(false)}
      />

      {/* Jugador del Día Modal */}
      <PlayerOfTheDayModal
        isOpen={isPlayerOfTheDayOpen}
        onClose={handleClosePlayerOfTheDay}
        initialData={initialPlayerOfTheDay}
      />
    </section>
  );
}