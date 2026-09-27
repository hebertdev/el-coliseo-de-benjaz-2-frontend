"use client";

import Link from "next/link";
import logoElColiseo from "assets/logo_el_coliseo.webp";
import {
  IconShieldHalf,
  IconBrandTwitch,
  IconBrandYoutube,
  IconBrandTwitter,
  IconBrandDiscord,
  IconFlame,
} from "@tabler/icons-react";

export function ColosseumFooter() {
  return (
    <footer className="border-t border-[#2d261e] bg-[#0d0a08] text-white">
      {/* Top Banner with Roman Emperor / Main Sponsor Accent */}
      <div className="border-b border-[#2d261e] bg-[#14100c]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-[#d8b467]/40 bg-[#d8b467]/10 text-[#f0d38f]">
              <IconShieldHalf size={22} />
            </div>
            <div>
              <div className="font-chakra text-sm font-bold uppercase tracking-wider text-white">
                El Gran Coliseo II de Benjaz
              </div>
              <div className="text-[11px] text-[#8e857b]">
                Torneo de Exhibición Dota 2 · Pro Players &amp; Streamers
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border border-[#2d261e] bg-[#1c1712] px-4 py-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#8e857b]">
              Auspiciador Principal
            </span>
            <span className="bg-linear-to-b from-[#4db0ff] to-[#124a78] px-2.5 py-0.5 font-chakra text-xs font-black italic tracking-wider text-white shadow-[0_0_12px_rgba(46,157,240,0.5)]">
              1XBET
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand & Bio */}
          <div>
            <div className="flex items-center gap-3">
              <picture>
                <img
                  src={logoElColiseo.src}
                  alt="El Coliseo Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                />
              </picture>
              <span className="font-coliseo-title text-base font-black uppercase tracking-wider text-white">
                El Gran Coliseo <span className="text-[#2e9df0]">II</span>
              </span>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-[#8e857b]">
              El escenario supremo donde 16 streamers y los mejores gladiadores del Dota 2
              sudamericano y mundial luchan por el trono y la gloria eterna.
            </p>

            {/* Social Icons */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://twitch.tv"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center border border-[#2d261e] bg-[#181410] text-[#a8a197] transition-colors hover:border-[#9146ff] hover:text-[#9146ff]"
                aria-label="Twitch"
              >
                <IconBrandTwitch size={16} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center border border-[#2d261e] bg-[#181410] text-[#a8a197] transition-colors hover:border-[#ff0000] hover:text-[#ff0000]"
                aria-label="YouTube"
              >
                <IconBrandYoutube size={16} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center border border-[#2d261e] bg-[#181410] text-[#a8a197] transition-colors hover:border-[#1da1f2] hover:text-[#1da1f2]"
                aria-label="Twitter"
              >
                <IconBrandTwitter size={16} />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center border border-[#2d261e] bg-[#181410] text-[#a8a197] transition-colors hover:border-[#5865f2] hover:text-[#5865f2]"
                aria-label="Discord"
              >
                <IconBrandDiscord size={16} />
              </a>
            </div>
          </div>

          {/* Col 2: Torneo Links */}
          <div>
            <h4 className="font-chakra text-xs font-bold uppercase tracking-[0.2em] text-[#f0d38f]">
              Navegación
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#a8a197]">
              <li>
                <Link href="/#formato" className="transition-colors hover:text-white">
                  Reglas &amp; Draft en Vivo
                </Link>
              </li>
              <li>
                <Link href="/teams" className="transition-colors hover:text-white">
                  16 Equipos Gladiadores
                </Link>
              </li>
              <li>
                <Link href="/swiss-stage" className="transition-colors hover:text-white">
                  Fase Suiza (Swiss Stage)
                </Link>
              </li>
              <li>
                <Link href="/swiss-stage#playoffs" className="transition-colors hover:text-white">
                  La Arena (Bracket Final)
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="transition-colors hover:text-[#d8b467] font-semibold text-[#f0d38f]">
                  Estadísticas &amp; Analíticas
                </Link>
              </li>
              <li>
                <Link href="/#premios" className="transition-colors hover:text-white">
                  Fondo de Premios S/ 100,000
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Reglamentos */}
          <div>
            <h4 className="font-chakra text-xs font-bold uppercase tracking-[0.2em] text-[#6cc4ff]">
              Reglamento
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#a8a197]">
              <li>
                <Link href="/tournaments/rules" className="transition-colors hover:text-white">
                  Reglamento Oficial del Draft
                </Link>
              </li>
              <li>
                <Link href="/tournaments/rules" className="transition-colors hover:text-white">
                  Elegibilidad de Pro-Players
                </Link>
              </li>
              <li>
                <Link href="/tournaments/rules" className="transition-colors hover:text-white">
                  Fair Play &amp; Código de Conducta
                </Link>
              </li>
              <li>
                <Link href="/tournaments/rules" className="transition-colors hover:text-white">
                  Distribución de Premios
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Responsible Gaming */}
          <div className="border border-[#2d261e] bg-[#14110d] p-5">
            <div className="font-chakra text-xs font-bold uppercase tracking-wider text-[#ff7373] flex items-center gap-1.5">
              <IconFlame size={16} />
              <span>Juego Responsable</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-[#8e857b]">
              Contenido para mayores de 18 años (+18). Juega con moderación y responsabilidad.
            </p>
            <div className="mt-3 inline-block border border-[#ff7373]/30 bg-[#ff7373]/10 px-2 py-1 font-mono text-[10px] font-bold text-[#ff7373]">
              +18 JUEGA RESPONSABLEMENTE
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-[#2d261e] pt-6 font-mono text-[11px] text-[#635a50] sm:flex-row">
          <div>
            © {new Date().getFullYear()} El Gran Coliseo de Benjaz II. Todos los derechos reservados del código y web a hebertdev.
          </div>
          <div className="mt-2 sm:mt-0">
            Diseñado con motivo de Coliseo Romano &amp; Esports Dark UI.
          </div>
        </div>
      </div>
    </footer>
  );
}
