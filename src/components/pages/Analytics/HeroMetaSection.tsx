"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconFlame,
  IconShieldX,
  IconTrophy,
  IconSkull,
  IconEye,
  IconArrowUpRight,
} from "@tabler/icons-react";
import type { HeroMeta, LowestWinrateHero, HeroMetaEntry } from "interfaces/analytics";
import { HeroMetaModal } from "./HeroMetaModal";

interface HeroMetaSectionProps {
  heroMeta: HeroMeta;
  lowestWinrateHeroes: LowestWinrateHero[];
}

const META_TABS = [
  { key: "picked", label: "Más Elegidos", icon: IconFlame, color: "#2e9df0" },
  { key: "banned", label: "Más Baneados", icon: IconShieldX, color: "#e51b24" },
  { key: "high_wr", label: "Mayor Win Rate", icon: IconTrophy, color: "#d8b467" },
  { key: "low_wr", label: "Menor Win Rate", icon: IconSkull, color: "#ff7373" },
] as const;

export function HeroMetaSection({ heroMeta, lowestWinrateHeroes }: HeroMetaSectionProps) {
  const [activeTab, setActiveTab] = useState<(typeof META_TABS)[number]["key"]>("picked");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allHeroesList = useMemo(() => {
    if (heroMeta.all_heroes && heroMeta.all_heroes.length > 0) {
      return heroMeta.all_heroes;
    }
    const map = new Map<number, HeroMetaEntry>();
    (heroMeta.most_picked || []).forEach((h) => map.set(h.hero_id, h));
    (heroMeta.most_banned || []).forEach((h) => {
      const existing = map.get(h.hero_id);
      if (existing) {
        map.set(h.hero_id, { ...existing, bans: h.bans });
      } else {
        map.set(h.hero_id, h);
      }
    });
    (heroMeta.highest_winrate || []).forEach((h) => {
      if (!map.has(h.hero_id)) map.set(h.hero_id, h);
    });
    (lowestWinrateHeroes || []).forEach((h) => {
      if (!map.has(h.hero_id)) {
        map.set(h.hero_id, {
          ...h,
          bans: 0,
        });
      }
    });
    return Array.from(map.values());
  }, [heroMeta, lowestWinrateHeroes]);

  return (
    <section id="hero-meta" className="mt-14 sm:mt-16 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#2d261e]">
        <div>
          <div className="flex items-center gap-2 font-chakra text-xs font-bold uppercase tracking-[0.2em] text-[#6cc4ff]">
            <IconFlame size={16} className="text-[#2e9df0]" />
            <span>META DEL COLISEO</span>
          </div>
          <h2 className="mt-1 font-cinzel text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
            HÉROES &amp; <span className="text-[#6cc4ff]">TENDENCIAS</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-chakra text-[#a89f91]">
            Los picks más disputados, bans letales y porcentajes de victoria en el torneo.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {META_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 font-chakra text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                isActive
                  ? "border-[#2e9df0] bg-[#2e9df0]/15 text-[#6cc4ff] shadow-[0_0_15px_rgba(46,157,240,0.2)]"
                  : "border-[#2d261e] bg-[#16120d] text-[#a89f91] hover:border-[#2e9df0]/60 hover:text-white"
              }`}
            >
              <Icon size={16} style={{ color: tab.color }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          {activeTab === "picked" && (
            <motion.div
              key="picked"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
            >
              {heroMeta.most_picked.map((hero, idx) => (
                <div
                  key={hero.hero_id}
                  className="flex flex-col justify-between border border-[#2d261e] bg-[#16120d] p-3 hover:border-[#2e9df0]/60 hover:shadow-[0_0_15px_rgba(46,157,240,0.15)] transition-all group"
                >
                  <div className="relative aspect-3/4 w-full overflow-hidden border border-[#2d261e] bg-black/60">
                    <picture>
                      <img
                        src={hero.image_url}
                        alt={hero.hero_name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </picture>
                    <div className="absolute top-1.5 left-1.5 bg-black/80 px-1.5 py-0.5 font-chakra text-[10px] font-bold text-[#f0d38f]">
                      #{idx + 1}
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-chakra text-xs font-bold uppercase text-white truncate">
                      {hero.hero_name}
                    </h4>
                    <div className="mt-2 flex items-center justify-between font-chakra text-[11px]">
                      <span className="text-[#a89f91]">{hero.picks} picks</span>
                      <span className="text-[#8e857b]">{hero.bans} bans</span>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <span
                        className={`font-mono text-xs font-bold ${
                          hero.win_rate >= 60
                            ? "text-emerald-400"
                            : hero.win_rate >= 50
                            ? "text-[#6cc4ff]"
                            : "text-[#ff7373]"
                        }`}
                      >
                        {hero.win_rate.toFixed(1)}% WR
                      </span>
                      <span className="text-[10px] font-mono text-[#7e756b]">
                        {hero.wins}V - {hero.losses}D
                      </span>
                    </div>

                    <div className="mt-2 h-1 w-full bg-[#241e17] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2e9df0] rounded-full transition-all"
                        style={{ width: `${hero.win_rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "banned" && (
            <motion.div
              key="banned"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
            >
              {heroMeta.most_banned.map((hero, idx) => (
                <div
                  key={hero.hero_id}
                  className="flex flex-col justify-between border border-[#2d261e] bg-[#16120d] p-3 hover:border-[#e51b24]/60 hover:shadow-[0_0_15px_rgba(229,27,36,0.15)] transition-all group"
                >
                  <div className="relative aspect-3/4 w-full overflow-hidden border border-[#2d261e] bg-black/60">
                    <picture>
                      <img
                        src={hero.image_url}
                        alt={hero.hero_name}
                        className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-105"
                      />
                    </picture>
                    <div className="absolute top-1.5 left-1.5 bg-[#e51b24]/90 text-white px-1.5 py-0.5 font-chakra text-[10px] font-bold">
                      #{idx + 1}
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-chakra text-xs font-bold uppercase text-white truncate">
                      {hero.hero_name}
                    </h4>
                    <div className="mt-2 flex items-center justify-between font-chakra text-[11px]">
                      <span className="text-[#ff7373] font-bold">{hero.bans} Baneos</span>
                      <span className="text-[#8e857b]">{hero.picks} picks</span>
                    </div>

                    <div className="mt-2 h-1 w-full bg-[#241e17] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#e51b24] rounded-full transition-all"
                        style={{ width: `${Math.min(100, (hero.bans / 15) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "high_wr" && (
            <motion.div
              key="high_wr"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
            >
              {heroMeta.highest_winrate.map((hero, idx) => (
                <div
                  key={hero.hero_id}
                  className="flex flex-col justify-between border border-[#2d261e] bg-[#16120d] p-3 hover:border-[#d8b467]/60 hover:shadow-[0_0_15px_rgba(216,180,103,0.15)] transition-all group"
                >
                  <div className="relative aspect-3/4 w-full overflow-hidden border border-[#2d261e] bg-black/60">
                    <picture>
                      <img
                        src={hero.image_url}
                        alt={hero.hero_name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </picture>
                    <div className="absolute top-1.5 left-1.5 bg-[#d8b467] text-black px-1.5 py-0.5 font-chakra text-[10px] font-black">
                      #{idx + 1}
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-chakra text-xs font-bold uppercase text-white truncate">
                      {hero.hero_name}
                    </h4>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-sm font-black text-emerald-400">
                        {hero.win_rate.toFixed(0)}% WR
                      </span>
                      <span className="text-[10px] font-mono text-[#8e857b]">
                        {hero.wins}V - {hero.losses}D
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 w-full bg-[#241e17] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{ width: `${hero.win_rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "low_wr" && (
            <motion.div
              key="low_wr"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
            >
              {lowestWinrateHeroes.map((hero) => (
                <div
                  key={hero.hero_id}
                  className="flex flex-col justify-between border border-[#2d261e] bg-[#16120d] p-3 hover:border-[#ff7373]/60 hover:shadow-[0_0_15px_rgba(255,115,115,0.15)] transition-all group"
                >
                  <div className="relative aspect-3/4 w-full overflow-hidden border border-[#2d261e] bg-black/60">
                    <picture>
                      <img
                        src={hero.image_url}
                        alt={hero.hero_name}
                        className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:scale-105"
                      />
                    </picture>
                    <div className="absolute top-1.5 left-1.5 bg-[#e51b24] text-white px-1.5 py-0.5 font-chakra text-[10px] font-bold">
                      0% WR
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-chakra text-xs font-bold uppercase text-white truncate">
                      {hero.hero_name}
                    </h4>
                    <div className="mt-2 flex items-center justify-between font-chakra text-[11px]">
                      <span className="text-[#ff7373] font-bold">{hero.losses} Derrotas</span>
                      <span className="text-[#8e857b]">{hero.picks} picks</span>
                    </div>

                    <div className="mt-2 h-1 w-full bg-[#241e17] rounded-full overflow-hidden">
                      <div className="h-full bg-[#ff7373] rounded-full w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* "Ver más / Ver todos los héroes" Button */}
      <div className="mt-8 flex items-center justify-center">
        {(() => {
          const currentTab = META_TABS.find((t) => t.key === activeTab) || META_TABS[0];
          return (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2.5 px-6 py-3 bg-[#16120d] hover:bg-[#201a13] border border-[#3d3328] hover:border-[#d8b467] text-[#c7bcab] hover:text-white font-chakra text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              <IconEye size={17} style={{ color: currentTab.color }} className="group-hover:scale-110 transition-transform" />
              <span>
                Ver todos los héroes · <span style={{ color: currentTab.color }}>{currentTab.label}</span>
              </span>
              <IconArrowUpRight size={15} className="text-[#8e857b] group-hover:text-white transition-colors" />
            </button>
          );
        })()}
      </div>

      {/* Hero Meta Modal */}
      <HeroMetaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={activeTab}
        allHeroes={allHeroesList}
        lowestWinrateHeroes={lowestWinrateHeroes}
      />
    </section>
  );
}
