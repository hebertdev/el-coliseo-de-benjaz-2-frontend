"use client";

import { motion } from "framer-motion";
import {
  IconUsers,
  IconSwords,
  IconSkull,
  IconScript,
  IconShield,
  IconAlertTriangle,
} from "@tabler/icons-react";
import backgroundDecoration from "assets/background_decoration.webp";

export function FormatSection() {
  const steps = [
    {
      id: "fase-1",
      tag: "FASE 1",
      icon: IconUsers,
      titleLines: ["16 CAPITANES", "STREAMERS"],
      desc: "16 de los creadores de contenido y streamers más destacados toman el mando como líderes de equipo. Cada uno portará el estandarte de su equipo en el Coliseo.",
      footerText: "PROTOCOLO IMPERIAL OFICIAL",
      footerIcon: IconShield,
      badgeBg: "bg-[#14202e]",
      badgeBorder: "border-[#1e3852]",
      badgeText: "text-[#4a93d8]",
      iconBoxBg: "bg-[#101824]",
      iconBoxBorder: "border-[#204060]",
      iconColor: "text-[#4a93d8]",
      titleColor: "text-white",
      cardBorder: "border-[#2a231b]",
      footerColor: "text-[#6e665a]",
    },
    {
      id: "fase-2",
      tag: "FASE 2",
      icon: IconSwords,
      titleLines: ["EL MERCADO DEL", "DRAFT"],
      desc: "En una transmisión en vivo cargada de estrategia y drama, cada capitán elegirá por turnos a 4 Pro-Players de Dota 2 de élite para completar su equipo de 5 gladiadores.",
      footerText: "PROTOCOLO IMPERIAL OFICIAL",
      footerIcon: IconShield,
      badgeBg: "bg-[#211b0e]",
      badgeBorder: "border-[#3d3215]",
      badgeText: "text-[#c5a052]",
      iconBoxBg: "bg-[#18140a]",
      iconBoxBorder: "border-[#4a3d1a]",
      iconColor: "text-[#c5a052]",
      titleColor: "text-white",
      cardBorder: "border-[#2a231b]",
      footerColor: "text-[#6e665a]",
    },
    {
      id: "fase-3",
      tag: "FASE 3",
      icon: IconSkull,
      titleLines: ["LA ARENA &", "ELIMINACIÓN"],
      desc: "Los 16 equipos colisionarán en una Fase Suiza implacable. Solo 8 sobrevivirán para disputar el Trono del Coliseo en playoffs de eliminación directa al mejor de 3 y 5.",
      footerText: "RIESGO CRÍTICO",
      footerIcon: IconAlertTriangle,
      badgeBg: "bg-[#241313]",
      badgeBorder: "border-[#482020]",
      badgeText: "text-[#c85252]",
      iconBoxBg: "bg-[#1c0d0d]",
      iconBoxBorder: "border-[#522424]",
      iconColor: "text-[#c85252]",
      titleColor: "text-[#e06666]",
      cardBorder: "border-[#2a231b]",
      footerColor: "text-[#9e4242]",
    },
  ];

  return (
    <section
      id="formato"
      className="relative w-full border-t border-[#2d261e] bg-[#0c0a08] py-14 sm:py-20 lg:py-28 text-white overflow-hidden"
    >
      {/* Background Decorative Image */}
      <picture className="pointer-events-none absolute inset-0 block h-full w-full select-none overflow-hidden">
        <img
          src={backgroundDecoration.src}
          alt="Decoración de fondo del formato"
          className="h-full w-full object-cover object-center pointer-events-none opacity-85"
        />
      </picture>

      {/* Subtle blend edges & tactical grid */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#120f0a] via-transparent to-[#120f0a] opacity-75" />
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1f1913_1px,transparent_1px),linear-gradient(to_bottom,#1f1913_1px,transparent_1px)] bg-size-[44px_44px] opacity-15" />

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
            <div className="flex items-center gap-2 font-chakra text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#f0d38f] drop-shadow-[0_2px_10px_rgba(216,180,103,0.4)]">
              <IconScript size={15} className="text-[#f0d38f] shrink-0" />
              <span>LAS REGLAS DEL IMPERIO</span>
              <IconScript size={15} className="text-[#f0d38f] shrink-0" />
            </div>
            <div className="h-px flex-1 bg-linear-to-l from-transparent via-[#d8b467]/60 to-[#d8b467]" />
          </div>

          <h2 className="mt-4 sm:mt-5 font-coliseo-title text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
            El Formato del <span className="text-[#f0d38f]">Torneo</span>
          </h2>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base font-medium leading-relaxed text-[#c7bcab]">
            Una competencia única que fusiona el show de los streamers con la máxima destreza
            mecánica de los pro-players de Dota 2 en un draft en vivo sin precedentes.
          </p>
        </motion.div>

        {/* 3 Step Cards */}
        <div className="mt-10 sm:mt-14 grid gap-5 sm:gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const FooterIcon = step.footerIcon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: index * 0.18, ease: "easeOut" }}
                className="h-full"
              >
                <div
                  className={`group relative flex h-full flex-col justify-between bg-[#120f0c] border ${step.cardBorder} p-5 sm:p-7 md:p-8 transition-all duration-300 hover:border-[#d8b467]/70 hover:shadow-[0_0_24px_rgba(216,180,103,0.18)]`}
                >
                  {/* Roman Imperial Delicate Frame Corner Gems */}
                  <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#6cc4ff]/40 bg-[#2e9df0]/40 opacity-50 shadow-[0_0_4px_rgba(46,157,240,0.3)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:border-[#6cc4ff] group-hover:shadow-[0_0_10px_rgba(46,157,240,0.9)] group-hover:scale-125" />
                  <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#6cc4ff]/40 bg-[#2e9df0]/40 opacity-50 shadow-[0_0_4px_rgba(46,157,240,0.3)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:border-[#6cc4ff] group-hover:shadow-[0_0_10px_rgba(46,157,240,0.9)] group-hover:scale-125" />
                  <span className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-2 w-2 rotate-45 border border-[#6cc4ff]/40 bg-[#2e9df0]/40 opacity-50 shadow-[0_0_4px_rgba(46,157,240,0.3)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:border-[#6cc4ff] group-hover:shadow-[0_0_10px_rgba(46,157,240,0.9)] group-hover:scale-125" />
                  <span className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-2 w-2 rotate-45 border border-[#6cc4ff]/40 bg-[#2e9df0]/40 opacity-50 shadow-[0_0_4px_rgba(46,157,240,0.3)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:border-[#6cc4ff] group-hover:shadow-[0_0_10px_rgba(46,157,240,0.9)] group-hover:scale-125" />

                  {/* Inner Delicate Gold Engraved Line */}
                  <span className="pointer-events-none absolute inset-1.25 border border-[#d8b467]/20 transition-colors group-hover:border-[#d8b467]/50" />

                  {/* Top Row: Icon Box (Left) & Phase Badge (Right) */}
                  <div>
                    <div className="flex items-start justify-between">
                      {/* Icon Box */}
                      <div
                        className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-[2px] border ${step.iconBoxBorder} ${step.iconBoxBg} ${step.iconColor}`}
                      >
                        <Icon size={22} stroke={2} />
                      </div>

                      {/* Phase Badge */}
                      <div
                        className={`rounded-[2px] border ${step.badgeBorder} ${step.badgeBg} px-2.5 sm:px-3 py-1 font-chakra text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] ${step.badgeText}`}
                      >
                        {step.tag}
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className={`mt-5 sm:mt-7 font-chakra text-xl sm:text-2xl font-black uppercase tracking-wide leading-tight sm:text-[26px] ${step.titleColor}`}
                    >
                      {step.titleLines.map((line, idx) => (
                        <span key={idx} className="block">
                          {line}
                        </span>
                      ))}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 sm:mt-4 text-xs font-normal leading-relaxed text-[#9e9488] sm:text-[13px] md:text-sm">
                      {step.desc}
                    </p>
                  </div>

                  {/* Footer Tag */}
                  <div
                    className={`mt-6 sm:mt-8 flex items-center gap-2 border-t border-[#1e1913] pt-4 sm:pt-5 font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] ${step.footerColor}`}
                  >
                    <FooterIcon size={14} stroke={2} className="shrink-0" />
                    <span>{step.footerText}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
