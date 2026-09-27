import Link from "next/link";
import {
  IconSwords,
  IconHome,
  IconShield,
  IconCompass,
  IconMapPinOff,
} from "@tabler/icons-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100dvh-5rem)] w-full flex-col items-center justify-center overflow-hidden bg-[#0c0a08] px-4 py-4 sm:py-6 text-white select-none">
      {/* Dark Roman Atmosphere Background Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(46,157,240,0.08)_0%,rgba(12,10,8,0.95)_70%,rgba(12,10,8,1)_100%)]" />

      {/* Decorative Gold Ambient Beam */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d8b467]/10 blur-3xl" />

      <main className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Imperial Gold Line Badge */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-[#d8b467]">
          <div className="h-px w-8 sm:w-12 bg-linear-to-r from-transparent to-[#d8b467]/70" />
          <IconSwords size={15} className="text-[#d8b467] shrink-0" />
          <span className="font-chakra text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em]">
            ERROR 404 · NIEBLA DE GUERRA
          </span>
          <IconSwords size={15} className="text-[#d8b467] shrink-0" />
          <div className="h-px w-8 sm:w-12 bg-linear-to-l from-transparent to-[#d8b467]/70" />
        </div>

        {/* Big Giant 404 Code */}
        <h1 className="mt-2 font-chakra text-7xl sm:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white via-[#6cc4ff] to-[#2e9df0] drop-shadow-[0_0_35px_rgba(46,157,240,0.4)]">
          404
        </h1>

        {/* Delicate Roman Frame Container */}
        <div className="group relative mt-6 w-full border border-[#d8b467]/35 bg-[#14100c]/90 p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-[#d8b467]/70 hover:shadow-[0_0_30px_rgba(216,180,103,0.18)]">
          {/* Roman Imperial Delicate Frame Corner Gems */}
          <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#6cc4ff]/50 bg-[#2e9df0]/50 opacity-60 shadow-[0_0_5px_rgba(46,157,240,0.4)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:scale-125" />
          <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#6cc4ff]/50 bg-[#2e9df0]/50 opacity-60 shadow-[0_0_5px_rgba(46,157,240,0.4)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:scale-125" />
          <span className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#6cc4ff]/50 bg-[#2e9df0]/50 opacity-60 shadow-[0_0_5px_rgba(46,157,240,0.4)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:scale-125" />
          <span className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#6cc4ff]/50 bg-[#2e9df0]/50 opacity-60 shadow-[0_0_5px_rgba(46,157,240,0.4)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:scale-125" />

          {/* Inner Delicate Gold Engraved Line */}
          <span className="pointer-events-none absolute inset-1.5 border border-[#d8b467]/20 transition-colors group-hover:border-[#d8b467]/45" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center border border-[#d8b467]/40 bg-[#1f1910] text-[#f0d38f]">
              <IconMapPinOff size={24} />
            </div>

            <h2 className="mt-4 font-cinzel text-lg sm:text-xl font-bold uppercase tracking-wider text-[#f3f3f5]">
              ¡Gladiador, te has extraviado fuera de la Arena!
            </h2>

            <p className="mt-2 text-xs sm:text-sm font-chakra leading-relaxed text-[#a89f92]">
              La ruta que intentas visitar ha caído en ruinas, fue destruida en combate por Roshan o aún no ha sido desbloqueada en esta temporada del Coliseo.
            </p>
          </div>
        </div>

        {/* Action Navigation Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full">
          <Link
            href="/"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 border border-[#00c8f8]/80 bg-[#00c8f8]/15 px-6 py-3 font-chakra text-xs font-bold uppercase tracking-widest text-[#6cc4ff] backdrop-blur-md transition-all hover:border-[#00c8f8] hover:bg-[#00c8f8] hover:text-black hover:shadow-[0_0_20px_rgba(0,200,248,0.5)]"
            style={{
              clipPath: "polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%)",
            }}
          >
            <IconHome size={16} />
            <span>Regresar al Inicio</span>
          </Link>

          <Link
            href="/teams"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 border border-[#d8b467]/50 bg-[#d8b467]/10 px-6 py-3 font-chakra text-xs font-bold uppercase tracking-widest text-[#f0d38f] transition-all hover:border-[#d8b467] hover:bg-[#d8b467] hover:text-black hover:shadow-[0_0_20px_rgba(216,180,103,0.4)]"
            style={{
              clipPath: "polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%)",
            }}
          >
            <IconShield size={16} />
            <span>Ver Equipos</span>
          </Link>

          <Link
            href="/swiss-stage"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 border border-[#3d3328] bg-[#18140f] px-6 py-3 font-chakra text-xs font-bold uppercase tracking-widest text-[#d8d2c7] transition-all hover:border-[#6cc4ff] hover:bg-[#00c8f8]/10 hover:text-[#6cc4ff]"
            style={{
              clipPath: "polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%)",
            }}
          >
            <IconCompass size={16} />
            <span>Ver Fases</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
