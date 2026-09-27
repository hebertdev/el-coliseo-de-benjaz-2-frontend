"use client";

import React, { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconX,
  IconSearch,
  IconFlame,
  IconShieldX,
  IconTrophy,
  IconSkull,
} from "@tabler/icons-react";
import type { HeroMetaEntry, LowestWinrateHero } from "interfaces/analytics";

export type MetaTabKey = "picked" | "banned" | "high_wr" | "low_wr";

interface HeroMetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: MetaTabKey;
  allHeroes: HeroMetaEntry[];
  lowestWinrateHeroes?: LowestWinrateHero[];
}

const MODAL_TABS = [
  { key: "picked", label: "Más Elegidos", icon: IconFlame, color: "#2e9df0" },
  { key: "banned", label: "Más Baneados", icon: IconShieldX, color: "#e51b24" },
  { key: "high_wr", label: "Mayor Win Rate", icon: IconTrophy, color: "#d8b467" },
  { key: "low_wr", label: "Menor Win Rate", icon: IconSkull, color: "#ff7373" },
] as const;

const emptySubscribe = () => () => {};

export function HeroMetaModal({
  isOpen,
  onClose,
  initialTab = "picked",
  allHeroes,
}: HeroMetaModalProps) {
  const [activeTab, setActiveTab] = useState<MetaTabKey>(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [prevProps, setPrevProps] = useState({ isOpen, initialTab });

  // Adjust state during render when props change (React recommended pattern to avoid cascading renders)
  if (prevProps.isOpen !== isOpen || prevProps.initialTab !== initialTab) {
    setPrevProps({ isOpen, initialTab });
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchTerm("");
    }
  }

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Keyboard navigation & full body/html scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isOpen, onClose]);

  // Prepare & sort hero list based on current active tab
  const processedHeroes = useMemo(() => {
    let list: HeroMetaEntry[] = [...allHeroes];

    if (activeTab === "picked") {
      list = list
        .filter((h) => h.picks > 0)
        .sort((a, b) => b.picks - a.picks || b.win_rate - a.win_rate);
    } else if (activeTab === "banned") {
      list = list
        .filter((h) => h.bans > 0)
        .sort((a, b) => b.bans - a.bans || b.picks - a.picks);
    } else if (activeTab === "high_wr") {
      list = list
        .filter((h) => h.picks > 0)
        .sort((a, b) => {
          if (b.win_rate !== a.win_rate) return b.win_rate - a.win_rate;
          return b.picks - a.picks;
        });
    } else if (activeTab === "low_wr") {
      // If we have lowestWinrateHeroes from community highlights, ensure they are prioritized or sort ascending
      list = list
        .filter((h) => h.picks > 0)
        .sort((a, b) => {
          if (a.win_rate !== b.win_rate) return a.win_rate - b.win_rate;
          return b.losses - a.losses;
        });
    }

    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase().trim();
    return list.filter((h) => h.hero_name.toLowerCase().includes(term));
  }, [allHeroes, activeTab, searchTerm]);

  if (!isMounted) return null;

  const currentTabObj = MODAL_TABS.find((t) => t.key === activeTab) || MODAL_TABS[0];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop with lowered opacity (50%) and soft blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
            className="relative z-10 flex flex-col w-full max-w-5xl max-h-[90vh] bg-[#14100c] border border-[#d8b467]/40 shadow-[0_0_60px_rgba(0,0,0,0.95)]"
          >
            {/* Roman Imperial Corner Gems */}
            <span className="pointer-events-none absolute -top-1.5 -left-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#ffe28a] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />
            <span className="pointer-events-none absolute -top-1.5 -right-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#ffe28a] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />
            <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#ffe28a] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />
            <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#ffe28a] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />

            {/* Inner Delicate Line */}
            <span className="pointer-events-none absolute inset-1.5 sm:inset-2 border border-[#d8b467]/25 pointer-events-none z-20" />
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#2d261e] bg-[#1a140f]/90">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div
                  className="p-2 rounded-xs border shrink-0"
                  style={{
                    borderColor: `${currentTabObj.color}40`,
                    backgroundColor: `${currentTabObj.color}15`,
                  }}
                >
                  <currentTabObj.icon size={20} style={{ color: currentTabObj.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 font-chakra text-xs font-bold uppercase tracking-widest text-[#d8b467]">
                    <span>META DEL TORNEO</span>
                    <span>•</span>
                    <span className="text-[#a89f91]">{processedHeroes.length} Héroes</span>
                  </div>
                  <h3 className="font-cinzel text-lg sm:text-xl md:text-2xl font-black uppercase text-white tracking-wide">
                    TODOS LOS HÉROES · <span style={{ color: currentTabObj.color }}>{currentTabObj.label}</span>
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-[#a89f91] hover:text-white bg-[#1f1912] hover:bg-[#2e2419] border border-[#3d3328] transition-colors cursor-pointer"
                title="Cerrar modal (Esc)"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Controls Bar: Tabs & Search */}
            <div className="p-4 sm:px-6 bg-[#16120d] border-b border-[#241e17] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {MODAL_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 font-chakra text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                        isActive
                          ? "border-[#2e9df0] bg-[#2e9df0]/15 text-[#6cc4ff] shadow-[0_0_10px_rgba(46,157,240,0.2)]"
                          : "border-[#2d261e] bg-[#120f0a] text-[#8e857b] hover:border-[#2e9df0]/40 hover:text-white"
                      }`}
                    >
                      <Icon size={14} style={{ color: tab.color }} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[220px] sm:w-64">
                <IconSearch
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e857b] pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Buscar héroe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#120f0a] border border-[#2d261e] pl-9 pr-3 py-1.5 font-chakra text-xs text-white placeholder-[#8e857b] focus:border-[#d8b467] focus:outline-none transition-colors"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8e857b] hover:text-white"
                  >
                    <IconX size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-[#2d261e]">
              <table className="w-full border-collapse text-left font-chakra text-xs">
                <thead className="sticky top-0 z-10 bg-[#19140f] border-b border-[#2d261e] text-[#a89f91] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 sm:px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-3 sm:px-4">Héroe</th>
                    <th className="py-2.5 px-3 sm:px-4 text-center">Picks</th>
                    <th className="py-2.5 px-3 sm:px-4 text-center">Bans</th>
                    <th className="py-2.5 px-3 sm:px-4 text-center w-36">Win Rate</th>
                    <th className="py-2.5 px-3 sm:px-4 text-center">Récord</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#241e17] bg-[#14100c]">
                  {processedHeroes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-[#8e857b] font-chakra">
                        No se encontraron héroes para esta categoría o criterio de búsqueda.
                      </td>
                    </tr>
                  ) : (
                    processedHeroes.map((hero, index) => {
                      const isTop3 = index < 3;
                      const winRateColor =
                        hero.win_rate >= 60
                          ? "text-emerald-400"
                          : hero.win_rate >= 50
                          ? "text-[#6cc4ff]"
                          : "text-[#ff7373]";

                      const barColor =
                        hero.win_rate >= 60
                          ? "bg-emerald-400"
                          : hero.win_rate >= 50
                          ? "bg-[#2e9df0]"
                          : "bg-[#e51b24]";

                      return (
                        <tr
                          key={hero.hero_id}
                          className="hover:bg-[#1a140f] transition-colors group"
                        >
                          {/* Rank # */}
                          <td className="py-2.5 px-3 sm:px-4 text-center font-mono font-bold">
                            <span
                              className={`inline-flex items-center justify-center h-6 w-6 rounded-xs ${
                                isTop3
                                  ? "bg-[#d8b467] text-black font-black"
                                  : "text-[#8e857b]"
                              }`}
                            >
                              {index + 1}
                            </span>
                          </td>

                          {/* Hero Picture & Name */}
                          <td className="py-2.5 px-3 sm:px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-8 shrink-0 overflow-hidden border border-[#2d261e] bg-black group-hover:border-[#d8b467]/60 transition-colors">
                                <picture>
                                  <img
                                    src={hero.image_url}
                                    alt={hero.hero_name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                </picture>
                              </div>
                              <span className="font-bold text-white uppercase text-xs sm:text-sm group-hover:text-[#d8b467] transition-colors">
                                {hero.hero_name}
                              </span>
                            </div>
                          </td>

                          {/* Picks */}
                          <td className="py-2.5 px-3 sm:px-4 text-center font-mono font-bold text-[#c7bcab]">
                            <span className="px-2 py-0.5 bg-[#120f0a] border border-[#241e17] rounded-xs">
                              {hero.picks}
                            </span>
                          </td>

                          {/* Bans */}
                          <td className="py-2.5 px-3 sm:px-4 text-center font-mono font-bold text-[#a89f91]">
                            <span className="px-2 py-0.5 bg-[#120f0a] border border-[#241e17] rounded-xs">
                              {hero.bans}
                            </span>
                          </td>

                          {/* Win Rate Progress Bar */}
                          <td className="py-2.5 px-3 sm:px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`font-mono font-bold ${winRateColor}`}>
                                {hero.win_rate.toFixed(1)}%
                              </span>
                              <div className="h-1.5 w-24 sm:w-28 bg-[#241e17] rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${barColor} rounded-full transition-all`}
                                  style={{ width: `${hero.win_rate}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Record (W - L) */}
                          <td className="py-2.5 px-3 sm:px-4 text-center font-mono text-[11px] text-[#8e857b]">
                            <span className="text-emerald-400 font-semibold">{hero.wins}V</span>
                            <span className="mx-1">·</span>
                            <span className="text-[#ff7373] font-semibold">{hero.losses}D</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 bg-[#120f0a] border-t border-[#241e17] flex items-center justify-between text-xs text-[#8e857b] font-chakra">
              <span>Mostrando {processedHeroes.length} de {allHeroes.length} héroes disputados</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-[#1f1912] hover:bg-[#2a2219] text-[#c7bcab] hover:text-white border border-[#3d3328] font-bold uppercase transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
