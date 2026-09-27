"use client";

import Link from "next/link";
import {
  IconShieldCheck,
  IconMail,
  IconCrown,
} from "@tabler/icons-react";

import panesPc from "assets/panes_web_pc.webp";
import panesMovil from "assets/panes_web_movil.webp";
import { trackPlausibleEvent } from "helpers/plausible";
import { ENABLE_ADS } from "constants/ads";
import logo1xBet from "assets/sponsors/logo_1xbet.webp";
import logoDota2 from "assets/sponsors/logo_dota2.webp";
import logoHebertdev from "assets/sponsors/logo_hebertdev.webp";
import logoKick from "assets/sponsors/logo_kick.webp";

export function SponsorsSection() {
  const sponsorsList = [
    { name: "1xBet", logo: logo1xBet.src, url: "https://1xbet.pe/" },
    { name: "Dota2", logo: logoDota2.src, url: "https://www.dota2.com/home" },
    { name: "Kick.com", logo: logoKick.src, url: "https://kick.com" },
    { name: "Benjaz", icon: IconCrown, url: "https://kick.com/benjaz" },
    { name: "Hebertdev", logo: logoHebertdev.src, url: "https://hebertdev.com" },
  ];
  const marqueeSponsors = [...sponsorsList, ...sponsorsList, ...sponsorsList, ...sponsorsList];

  return (
    <section
      id="sponsors"
      className="relative w-full border-t border-[#221c16] bg-[#0c0a08] py-14 sm:py-20 lg:py-28 text-white overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-3 sm:mb-4 flex items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto">
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-[#2e9df0]/60 to-[#2e9df0]" />
            <div className="flex items-center gap-2 font-chakra text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#6cc4ff] drop-shadow-[0_2px_10px_rgba(46,157,240,0.45)]">
              <IconShieldCheck size={15} className="text-[#6cc4ff] shrink-0" />
              <span>ALIANZAS DEL IMPERIO</span>
              <IconShieldCheck size={15} className="text-[#6cc4ff] shrink-0" />
            </div>
            <div className="h-px flex-1 bg-linear-to-l from-transparent via-[#2e9df0]/60 to-[#2e9df0]" />
          </div>

          <h2 className="mt-4 sm:mt-5 font-coliseo-title text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
            Patrocinadores <span className="text-[#2e9df0]">Oficiales</span>
          </h2>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base font-medium leading-relaxed text-[#a89f92]">
            Marcas y patrocinadores que hacen posible este sitio web y mantienen viva toda la data,
            estadísticas en tiempo real y la experiencia competitiva de <span className="text-[#f0d38f] font-bold">El Coliseo</span>.
          </p>
        </div>

        {/* 1. VIP PRESENTING BANNER */}
        {ENABLE_ADS && (
          <div className="mt-10 sm:mt-14 max-w-sm sm:max-w-none mx-auto">
            <a
              href="https://chat.whatsapp.com/KFzibiw05Z6IQ204tjGHCa"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackPlausibleEvent("Click WhatsApp", { props: { origen: "sponsors_banner" } });
              }}
              className="group relative block overflow-hidden border border-[#d8b467]/40 bg-[#110e0b] p-1.5 sm:p-3 transition-all duration-300 hover:border-[#d8b467]/80 hover:shadow-[0_0_30px_rgba(216,180,103,0.25)] cursor-pointer plausible-event-name=Click+WhatsApp+Banner"
            >
              {/* Roman Imperial Corner Diamond Accents */}
              <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#f0d38f] bg-[#d8b467] shadow-[0_0_8px_rgba(240,211,143,0.8)] transition-transform duration-300 group-hover:scale-125" />
              <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#f0d38f] bg-[#d8b467] shadow-[0_0_8px_rgba(240,211,143,0.8)] transition-transform duration-300 group-hover:scale-125" />
              <span className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#f0d38f] bg-[#d8b467] shadow-[0_0_8px_rgba(240,211,143,0.8)] transition-transform duration-300 group-hover:scale-125" />
              <span className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#f0d38f] bg-[#d8b467] shadow-[0_0_8px_rgba(240,211,143,0.8)] transition-transform duration-300 group-hover:scale-125" />

              {/* Inner Delicate Gold Engraved Line */}
              <span className="pointer-events-none absolute inset-1.5 border border-[#d8b467]/25 transition-colors group-hover:border-[#d8b467]/50 z-20" />

              {/* Responsive Banner Image */}
              <div className="relative z-10 w-full flex items-center justify-center overflow-hidden bg-black/40">
                <picture className="w-full flex items-center justify-center">
                  <source media="(max-width: 640px)" srcSet={panesMovil.src} />
                  <img
                    src={panesPc.src}
                    alt="Panadería del Coliseo - Especial"
                    className="w-full h-auto object-contain block select-none transition-transform duration-500 group-hover:scale-[1.01]"
                  />
                </picture>
              </div>
            </a>
          </div>
        )}

        {/* 2. INFINITE LOGO MARQUEE RIBBON */}
        <div className="mt-10 sm:mt-14 overflow-hidden border border-[#1f1a14] bg-[#0a0806] py-3.5 sm:py-4">
          <div className="animate-marquee flex items-center gap-8 sm:gap-12 md:gap-16 hover:[animation-play-state:paused]">
            {marqueeSponsors.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex shrink-0 items-center gap-3 sm:gap-4 transition-all duration-200 hover:scale-105"
                title={`Visitar sitio oficial de ${item.name}`}
              >
                {item.logo ? (
                  <picture>
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="h-3.5 sm:h-[18px] md:h-5 w-auto object-contain opacity-65 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
                    />
                  </picture>
                ) : (
                  <div className="flex items-center gap-1.5 text-[#d8b467] opacity-70 group-hover:opacity-100 group-hover:text-[#f0d38f] transition-all duration-300">
                    {item.icon && <item.icon size={16} className="sm:size-[18px] transition-transform duration-300 group-hover:scale-110" />}
                    <span className="font-chakra text-[11px] sm:text-xs font-bold tracking-wider uppercase">
                      {item.name}
                    </span>
                  </div>
                )}
                <span className="text-[#4d453b] ml-4 sm:ml-6">◆</span>
              </a>
            ))}
          </div>
        </div>

        {/* 4. BECOME A SPONSOR CALLOUT BANNER */}
        <div className="mt-8 sm:mt-12 flex flex-col items-center justify-between gap-5 sm:gap-6 border border-[#2b2214] bg-[#14100b] p-5 sm:p-6 sm:flex-row sm:px-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#3d3020] bg-[#1f190f] text-[#f0d38f]">
              <IconMail size={22} />
            </div>
            <div>
              <div className="font-chakra text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                ¿Quieres que tu marca forme parte del Coliseo?
              </div>
              <div className="text-[11px] sm:text-xs text-[#8e857b] mt-0.5">
                Únete como patrocinador oficial y conecta con miles de espectadores de esports en vivo.
              </div>
            </div>
          </div>

          <Link
            href="mailto:hebertdev@outlook.com"
            className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 border border-[#d8b467]/60 bg-[#211a10] px-5 py-2.5 font-chakra text-xs font-bold uppercase tracking-wider text-[#f0d38f] transition-colors hover:bg-[#d8b467] hover:text-black"
          >
            <span>Alianzas &amp; Patrocinios</span>
            <IconMail size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
