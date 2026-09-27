"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  IconSwords,
  IconReload,
  IconHome,
  IconAlertTriangle,
  IconFlame,
} from "@tabler/icons-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors for diagnostics
    console.error("Critical Arena Exception:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-[calc(100dvh-5rem)] w-full flex-col items-center justify-center overflow-hidden bg-[#0c0a08] px-4 py-4 sm:py-6 text-white select-none">
      {/* Dark Crimson Arena Atmosphere Background Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.12)_0%,rgba(12,10,8,0.95)_70%,rgba(12,10,8,1)_100%)]" />

      {/* Ambient Red Glow Beam */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-900/15 blur-3xl" />

      <main className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Imperial Red Line Badge */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-red-400">
          <div className="h-px w-8 sm:w-12 bg-linear-to-r from-transparent to-red-500/70" />
          <IconSwords size={15} className="text-red-400 shrink-0" />
          <span className="font-chakra text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em]">
            ALERTA EN LA ARENA · INVOCACIÓN INTERRUMPIDA
          </span>
          <IconSwords size={15} className="text-red-400 shrink-0" />
          <div className="h-px w-8 sm:w-12 bg-linear-to-l from-transparent to-red-500/70" />
        </div>

        {/* Big Warning Heading */}
        <h1 className="mt-3 font-chakra text-3xl sm:text-5xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-linear-to-b from-white via-red-300 to-red-500 drop-shadow-[0_0_25px_rgba(220,38,38,0.5)]">
          GRIETA EN EL COLISEO
        </h1>

        {/* Delicate Roman Crimson Frame Container */}
        <div className="group relative mt-6 w-full border border-red-500/40 bg-[#160c0b]/90 p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-red-500/80 hover:shadow-[0_0_35px_rgba(220,38,38,0.25)]">
          {/* Roman Imperial Delicate Frame Corner Gems */}
          <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2.5 w-2.5 rotate-45 border border-red-400/80 bg-red-600 opacity-80 shadow-[0_0_8px_rgba(220,38,38,0.8)] transition-all duration-300 group-hover:scale-125" />
          <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2.5 w-2.5 rotate-45 border border-red-400/80 bg-red-600 opacity-80 shadow-[0_0_8px_rgba(220,38,38,0.8)] transition-all duration-300 group-hover:scale-125" />
          <span className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-2.5 w-2.5 rotate-45 border border-red-400/80 bg-red-600 opacity-80 shadow-[0_0_8px_rgba(220,38,38,0.8)] transition-all duration-300 group-hover:scale-125" />
          <span className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-2.5 w-2.5 rotate-45 border border-red-400/80 bg-red-600 opacity-80 shadow-[0_0_8px_rgba(220,38,38,0.8)] transition-all duration-300 group-hover:scale-125" />

          {/* Inner Delicate Line */}
          <span className="pointer-events-none absolute inset-1.5 border border-red-500/20 transition-colors group-hover:border-red-500/50" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center border border-red-500/50 bg-red-950/40 text-red-400">
              <IconAlertTriangle size={24} className="animate-pulse" />
            </div>

            <h2 className="mt-4 font-cinzel text-lg sm:text-xl font-bold uppercase tracking-wider text-red-200">
              Los dioses del Coliseo han detectado una falla
            </h2>

            <p className="mt-2 text-xs sm:text-sm font-chakra leading-relaxed text-[#d4b4b4]">
              Ha ocurrido una interrupción inesperada al invocar los datos o la transmisión de la arena.
            </p>

            {error.digest && (
              <div className="mt-4 flex items-center gap-1.5 border border-red-900/60 bg-red-950/60 px-3 py-1 font-mono text-[10px] text-red-300">
                <IconFlame size={12} className="text-red-400" />
                <span>CÓDIGO DE REGISTRO: {error.digest}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full">
          <button
            onClick={() => reset()}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 border border-red-500 bg-red-600 px-6 py-3 font-chakra text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all hover:bg-red-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] cursor-pointer"
            style={{
              clipPath: "polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%)",
            }}
          >
            <IconReload size={16} className="animate-spin" />
            <span>Reintentar Invocación</span>
          </button>

          <Link
            href="/"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 border border-[#d8b467]/50 bg-[#d8b467]/10 px-6 py-3 font-chakra text-xs font-bold uppercase tracking-widest text-[#f0d38f] transition-all hover:border-[#d8b467] hover:bg-[#d8b467] hover:text-black hover:shadow-[0_0_20px_rgba(216,180,103,0.4)]"
            style={{
              clipPath: "polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%)",
            }}
          >
            <IconHome size={16} />
            <span>Regresar al Inicio</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
