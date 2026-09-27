"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconSparkles,
  IconClock,
  IconSkull,
  IconBolt,
  IconShoppingBag,
  IconArrowUpRight,
} from "@tabler/icons-react";
import type { CommunityHighlights } from "interfaces/analytics";
import { normalizeMediaUrl } from "lib/config";

interface CommunityHighlightsSectionProps {
  highlights: CommunityHighlights;
}

function getItemImg(itemName: string): string {
  const clean = itemName.toLowerCase().trim().replace(/\s+/g, "_");
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${clean}.png`;
}

export function CommunityHighlightsSection({ highlights }: CommunityHighlightsSectionProps) {
  return (
    <section id="highlights" className="mt-14 sm:mt-16 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#2d261e]">
        <div>
          <div className="flex items-center gap-2 font-chakra text-xs font-bold uppercase tracking-[0.2em] text-[#f0d38f]">
            <IconSparkles size={16} className="text-[#f0d38f]" />
            <span>DATOS CURIOSOS &amp; COMUNIDAD</span>
          </div>
          <h2 className="mt-1 font-cinzel text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
            DESTACADOS DE LA <span className="text-[#f0d38f]">ARENA</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-chakra text-[#a89f91]">
            Anécdotas, cazadores de mensajeros, momentos insólitos y los ítems favoritos de los jugadores.
          </p>
        </div>
      </div>

      {/* Grid of Fun Highlights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Top Courier Snipers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="border border-[#2d261e] bg-[#16120d] p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#241e17]">
              <span className="font-chakra text-xs font-bold uppercase tracking-wider text-[#f0d38f] flex items-center gap-1.5">
                <span>🦅</span> Cazadores de Burros
              </span>
              <span className="font-chakra text-[10px] text-[#8e857b]">Couriers</span>
            </div>

            <p className="mt-3 text-[11px] font-chakra text-[#c7bcab]">
              Los gladiadores más letales interceptando mensajeros rivales:
            </p>

            <div className="mt-3 space-y-2.5">
              {highlights.top_courier_snipers.map((sniper, sIdx) => (
                <div
                  key={`${sniper.player_slug}-${sIdx}`}
                  className="flex items-center justify-between font-chakra text-xs py-1 px-2 bg-[#120f0a] border border-[#241e17]"
                >
                  <div className="flex items-center gap-2 truncate">
                    {sniper.player_avatar ? (
                      <picture className="h-6 w-6 shrink-0 overflow-hidden rounded-xs border border-[#2d261e]">
                        <img
                          src={normalizeMediaUrl(sniper.player_avatar) || sniper.player_avatar}
                          alt={sniper.nickname}
                          className="h-full w-full object-cover"
                        />
                      </picture>
                    ) : (
                      <div className="h-6 w-6 shrink-0 bg-[#241e17] flex items-center justify-center font-bold text-[10px] text-[#8e857b]">
                        {sniper.nickname.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="truncate">
                      <Link
                        href={`/players/${encodeURIComponent(sniper.player_slug)}`}
                        className="font-bold text-white hover:text-[#d8b467] transition-colors truncate block"
                      >
                        {sniper.nickname}
                      </Link>
                      <span className="text-[10px] text-[#8e857b] truncate block">
                        {sniper.team_name}
                      </span>
                    </div>
                  </div>

                  <span className="font-cinzel text-sm font-black text-[#f0d38f] shrink-0 ml-2">
                    {sniper.couriers_killed} 🪓
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Card 2: Earliest First Blood */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="border border-[#2d261e] bg-[#16120d] p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#241e17]">
              <span className="font-chakra text-xs font-bold uppercase tracking-wider text-[#ff7373] flex items-center gap-1.5">
                <IconClock size={16} className="text-[#e51b24]" /> Primera Sangre Flash
              </span>
              <span className="font-chakra text-[10px] text-[#8e857b]">00:00</span>
            </div>

            <div className="mt-4">
              <div className="font-cinzel text-3xl sm:text-4xl font-black text-[#e51b24]">
                {highlights.earliest_first_blood.time_formatted}
              </div>
              <p className="mt-2 text-xs font-chakra text-[#c7bcab] leading-relaxed">
                Ejecución relámpago en el segundo cero del partido por parte de:
              </p>

              <div className="mt-4 flex items-center gap-3 p-3 bg-[#120f0a] border border-[#241e17]">
                {highlights.earliest_first_blood.player_avatar ? (
                  <picture className="h-10 w-10 shrink-0 overflow-hidden border border-[#d8b467]">
                    <img
                      src={normalizeMediaUrl(highlights.earliest_first_blood.player_avatar) || highlights.earliest_first_blood.player_avatar}
                      alt={highlights.earliest_first_blood.nickname}
                      className="h-full w-full object-cover"
                    />
                  </picture>
                ) : (
                  <div className="h-10 w-10 shrink-0 bg-[#241e17] flex items-center justify-center font-bold text-xs text-[#8e857b]">
                    {highlights.earliest_first_blood.nickname.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <Link
                    href={`/players/${encodeURIComponent(highlights.earliest_first_blood.player_slug)}`}
                    className="font-chakra font-bold text-white text-sm hover:text-[#d8b467] transition-colors"
                  >
                    {highlights.earliest_first_blood.nickname}
                  </Link>
                  <span className="font-chakra text-[10px] text-[#ff7373] block">
                    ¡Primera Sangre instantánea!
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#241e17]">
            <Link
              href={`/game/${encodeURIComponent(highlights.earliest_first_blood.game_slug)}`}
              className="inline-flex items-center gap-1 font-chakra text-xs font-bold text-[#ff7373] hover:text-white transition-colors"
            >
              <span>Ver la Sangre en el Juego</span>
              <IconArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Card 3: Most Deaths in Single Game */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="border border-[#2d261e] bg-[#16120d] p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#241e17]">
              <span className="font-chakra text-xs font-bold uppercase tracking-wider text-[#ff7373] flex items-center gap-1.5">
                <IconSkull size={16} className="text-[#e51b24]" /> Mártir de la Arena
              </span>
              <span className="font-chakra text-[10px] text-[#8e857b]">Muertes</span>
            </div>

            <div className="mt-4">
              <div className="font-cinzel text-3xl sm:text-4xl font-black text-white">
                {highlights.most_deaths_single_game.deaths}{" "}
                <span className="text-lg font-chakra text-[#ff7373]">Muertes</span>
              </div>
              <p className="mt-2 text-xs font-chakra text-[#c7bcab]">
                Mayor cantidad de caídas en un solo juego con su{" "}
                <strong className="text-white">
                  {highlights.most_deaths_single_game.hero.hero_name}
                </strong>
                :
              </p>

              <div className="mt-4 flex items-center justify-between p-3 bg-[#120f0a] border border-[#241e17]">
                <div>
                  <Link
                    href={`/players/${encodeURIComponent(highlights.most_deaths_single_game.player_slug)}`}
                    className="font-chakra font-bold text-white text-sm hover:text-[#d8b467] transition-colors"
                  >
                    {highlights.most_deaths_single_game.nickname}
                  </Link>
                  <span className="font-chakra text-[10px] text-[#8e857b] block">
                    Sacrificio heroico en batalla
                  </span>
                </div>

                <div className="h-12 w-10 border border-[#2d261e] overflow-hidden shrink-0">
                  <picture>
                    <img
                      src={highlights.most_deaths_single_game.hero.image_url}
                      alt={highlights.most_deaths_single_game.hero.hero_name}
                      className="h-full w-full object-cover"
                    />
                  </picture>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#241e17]">
            <Link
              href={`/game/${encodeURIComponent(highlights.most_deaths_single_game.game_slug)}`}
              className="inline-flex items-center gap-1 font-chakra text-xs font-bold text-[#ff7373] hover:text-white transition-colors"
            >
              <span>Ver la Partida</span>
              <IconArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Card 4: Top Stunner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.24 }}
          className="border border-[#2d261e] bg-[#16120d] p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#241e17]">
              <span className="font-chakra text-xs font-bold uppercase tracking-wider text-[#6cc4ff] flex items-center gap-1.5">
                <IconBolt size={16} className="text-[#2e9df0]" /> Rey del Aturdimiento
              </span>
              <span className="font-chakra text-[10px] text-[#8e857b]">Stuns</span>
            </div>

            <div className="mt-4">
              <div className="font-cinzel text-3xl sm:text-4xl font-black text-[#6cc4ff]">
                {highlights.top_stunner.avg_stuns_seconds.toFixed(1)}s
              </div>
              <p className="mt-2 text-xs font-chakra text-[#c7bcab]">
                Promedio de segundos de aturdimiento total infligidos a los rivales por partida.
              </p>

              <div className="mt-4 flex items-center gap-3 p-3 bg-[#120f0a] border border-[#241e17]">
                {highlights.top_stunner.team_logo_url && (
                  <picture className="h-8 w-8 shrink-0">
                    <img
                      src={normalizeMediaUrl(highlights.top_stunner.team_logo_url) || highlights.top_stunner.team_logo_url}
                      alt="Team"
                      className="h-full w-full object-contain"
                    />
                  </picture>
                )}
                <div>
                  <Link
                    href={`/players/${encodeURIComponent(highlights.top_stunner.player_slug)}`}
                    className="font-chakra font-bold text-white text-sm hover:text-[#2e9df0] transition-colors"
                  >
                    {highlights.top_stunner.nickname}
                  </Link>
                  <span className="font-chakra text-[10px] text-[#2e9df0] block">
                    Control de masas implacable
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#241e17]">
            <Link
              href={`/teams/${encodeURIComponent(highlights.top_stunner.team_slug)}`}
              className="inline-flex items-center gap-1 font-chakra text-xs font-bold text-[#2e9df0] hover:text-white transition-colors"
            >
              <span>Ver Equipo</span>
              <IconArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Most Purchased Items Strip */}
      <div className="mt-6 border border-[#2d261e] bg-[#16120d] p-5">
        <div className="flex items-center justify-between border-b border-[#241e17] pb-3">
          <div className="flex items-center gap-2 font-chakra text-xs font-bold uppercase tracking-wider text-[#d8b467]">
            <IconShoppingBag size={16} className="text-[#d8b467]" />
            <span>Ítems Más Comprados en la Arena</span>
          </div>
          <span className="font-chakra text-[10px] text-[#8e857b]">Economía &amp; Build</span>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {highlights.most_purchased_items.map((item) => (
            <div
              key={item.item_name}
              className="flex flex-col items-center justify-center p-3 bg-[#120f0a] border border-[#241e17] hover:border-[#d8b467]/60 transition-colors group"
            >
              <div className="relative h-11 w-14 overflow-hidden border border-[#2d261e] bg-black">
                <picture>
                  <img
                    src={getItemImg(item.item_name)}
                    alt={item.item_name}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </picture>
              </div>

              <span className="mt-2 font-chakra text-[11px] font-bold text-white text-center truncate max-w-full">
                {item.item_name}
              </span>

              <span className="mt-0.5 font-cinzel text-xs font-bold text-[#f0d38f]">
                {item.count} un.
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
