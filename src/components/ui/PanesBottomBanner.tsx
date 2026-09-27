"use client";

import { motion } from "framer-motion";
import { IconBrandWhatsapp, IconHandClick } from "@tabler/icons-react";
import { trackPlausibleEvent } from "helpers/plausible";
import { ENABLE_ADS } from "constants/ads";
import tioChuntalaImg from "assets/tio-chuntala.webp";
import panesBannerBg from "assets/panes_banner.webp";

export function PanesBottomBanner() {
  if (!ENABLE_ADS) return null;

  return (
    <motion.aside
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      aria-label="Panes del Tío Chúntala"
      className="fixed bottom-0 left-0 right-0 z-40 w-full select-none pointer-events-none"
    >
      {/* Outer Banner Wrapper with fixed height 46px on mobile and 50px on desktop */}
      <div className="relative w-full h-[46px] sm:h-[50px] max-h-[50px] border-t border-[#d8b467] bg-[#120c07] shadow-[0_-4px_25px_rgba(0,0,0,0.95),0_0_15px_rgba(216,180,103,0.3)] overflow-hidden pointer-events-auto flex items-center">
        {/* Background Breads Image */}
        <picture className="pointer-events-none absolute inset-0 block h-full w-full">
          <img
            src={panesBannerBg.src}
            alt="Fondo Panadería Artesanal Tío Chúntala"
            width={panesBannerBg.width}
            height={panesBannerBg.height}
            className="h-full w-full object-cover object-center opacity-40 select-none"
          />
        </picture>

        {/* Dark Warm Hearth Overlay with Vignette for High Contrast & Legibility */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(14, 9, 5, 0.96) 0%, rgba(26, 14, 7, 0.72) 30%, rgba(35, 18, 8, 0.65) 50%, rgba(26, 14, 7, 0.72) 70%, rgba(14, 9, 5, 0.96) 100%)",
          }}
        />

        {/* Ambient Warm Oven Radial Glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 60% 100% at 50% 50%, rgba(245, 158, 11, 0.22) 0%, rgba(180, 83, 9, 0.12) 50%, transparent 80%)",
          }}
        />

        {/* Imperial Golden Light Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#f0d38f] to-transparent shadow-[0_0_12px_rgba(240,211,143,0.9)]" />

        {/* Corner Diamond Accents */}
        <span className="pointer-events-none absolute -top-1 left-4 h-2 w-2 rotate-45 border border-[#f0d38f] bg-[#d8b467] shadow-[0_0_6px_rgba(240,211,143,0.8)]" />
        <span className="pointer-events-none absolute -top-1 right-4 h-2 w-2 rotate-45 border border-[#f0d38f] bg-[#d8b467] shadow-[0_0_6px_rgba(240,211,143,0.8)]" />

        {/* Container Centered & Responsive */}
        <div className="mx-auto max-w-7xl w-full px-2 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <a
            href="https://chat.whatsapp.com/KFzibiw05Z6IQ204tjGHCa"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackPlausibleEvent("Click WhatsApp", { props: { origen: "fixed_bottom_banner" } });
            }}
            title="Únete al grupo de WhatsApp de Panes del Tío Chúntala 1.8x"
            aria-label="Únete al grupo de WhatsApp de Panes del Tío Chúntala 1.8x"
            className="group relative z-10 flex w-full sm:w-fit max-w-full items-center justify-between sm:justify-center gap-1.5 sm:gap-4 md:gap-6 rounded-full border border-[#d8b467]/40 bg-black/60 px-2 sm:px-4 py-0.5 sm:py-1 backdrop-blur-xs transition-all duration-300 hover:border-[#f0d38f] hover:bg-black/75 hover:shadow-[0_0_20px_rgba(216,180,103,0.4)] cursor-pointer plausible-event-name=Click+WhatsApp+Fixed+Banner"
          >
            {/* LEFT: Tío Chúntala Circular Avatar */}
            <div className="relative shrink-0 flex items-center">
              <picture className="block">
                <img
                  src={tioChuntalaImg.src}
                  alt="Tío Chúntala"
                  width={tioChuntalaImg.width}
                  height={tioChuntalaImg.height}
                  className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full object-cover object-center border-[1.5px] border-[#f0d38f] shadow-[0_0_10px_rgba(240,211,143,0.6)] transition-transform duration-300 group-hover:scale-108 group-hover:rotate-2"
                />
              </picture>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
                <span className="relative inline-flex rounded-full h-full w-full bg-[#25D366] border border-[#120c07]" />
              </span>
            </div>

            {/* CENTER: 3D Title + Ribbon with Responsive Text */}
            <div className="flex flex-col items-center justify-center text-center min-w-0 flex-1 sm:flex-initial">
              {/* Title with Gold Gradient */}
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 leading-none">
                <h3
                  className="font-chakra text-[10px] xs:text-[11px] sm:text-xs md:text-sm lg:text-base font-black uppercase tracking-wide bg-gradient-to-b from-[#fff6d6] via-[#f7d984] to-[#b38025] bg-clip-text text-transparent whitespace-nowrap leading-tight"
                  style={{
                    filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.95)) drop-shadow(0 0 8px rgba(216,180,103,0.35))",
                  }}
                >
                  Panes del Tío Chúntala
                </h3>
                <div className="hidden xs:flex items-center text-[#f0d38f] transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                  <IconHandClick size={13} className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" />
                </div>
              </div>

              {/* Golden Wheat Ribbon with Fitted Text (No ellipsis) */}
              <div className="mt-0.5 inline-flex items-center gap-1 rounded-full border border-[#f0d38f]/70 bg-gradient-to-r from-[#856829] via-[#d8b467] to-[#856829] px-2 py-0 shadow-[0_1px_4px_rgba(0,0,0,0.7)] leading-tight max-w-full">
                <span className="text-[6.5px] xs:text-[7.5px] sm:text-[9px] shrink-0">🌾</span>
                <span className="font-chakra text-[6.5px] xs:text-[7.5px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-wider text-[#1a0e05] text-center leading-tight whitespace-nowrap">
                  <span className="sm:hidden">MÉTELE TUS PANES A LAS PARTIDAS</span>
                  <span className="hidden sm:inline">MÉTELE TUS PANES A LAS PARTIDAS DEL COLISEO</span>
                </span>
                <span className="text-[6.5px] xs:text-[7.5px] sm:text-[9px] shrink-0">🌾</span>
              </div>
            </div>

            {/* RIGHT: Glossy WhatsApp Button */}
            <div className="shrink-0">
              <div className="relative inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-[#86efac]/80 bg-gradient-to-r from-[#25D366] via-[#22c55e] to-[#16a34a] px-2 sm:px-3.5 py-0.5 sm:py-1 font-chakra text-[10px] sm:text-xs font-black text-white shadow-[0_0_14px_rgba(37,211,102,0.6)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_22px_rgba(37,211,102,0.95)] group-active:scale-95 leading-none">
                <div className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                  <IconBrandWhatsapp size={14} stroke={2.4} className="drop-shadow sm:size-[16px]" />
                </div>
                <div className="flex items-center gap-1 leading-tight">
                  <span className="hidden sm:inline">Únete al</span>
                  <span>Grupo <span className="font-mono text-[#fef08a] font-black">1.8x</span></span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </motion.aside>
  );
}
