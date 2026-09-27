"use client";

import React from "react";
import {
  IconStack2,
  IconBook,
  IconEye,
  IconSwords,
  IconTrendingUp,
} from "@tabler/icons-react";

export type GameTabType =
  | "scoreboard"
  | "skills"
  | "vision"
  | "teamfights"
  | "graphs";

interface GameNavigationTabsProps {
  activeTab: GameTabType;
  onChangeTab: (tab: GameTabType) => void;
  teamfightsCount?: number;
}

export function GameNavigationTabs({
  activeTab,
  onChangeTab,
  teamfightsCount = 6,
}: GameNavigationTabsProps) {
  const tabs: {
    id: GameTabType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "scoreboard",
      label: "SCOREBOARD & RESUMEN",
      icon: (
        <IconStack2
          size={16}
          className={
            activeTab === "scoreboard"
              ? "text-[#d8b467]"
              : "text-[#8e857b] group-hover:text-white"
          }
        />
      ),
    },
    {
      id: "skills",
      label: "HABILIDADES & TALENTOS",
      icon: (
        <IconBook
          size={16}
          className={
            activeTab === "skills"
              ? "text-[#d8b467]"
              : "text-[#8e857b] group-hover:text-white"
          }
        />
      ),
    },
    {
      id: "vision",
      label: "VISIÓN",
      icon: (
        <IconEye
          size={16}
          className={
            activeTab === "vision"
              ? "text-[#00e599]"
              : "text-[#00e599]/70 group-hover:text-[#00e599]"
          }
        />
      ),
    },
    {
      id: "teamfights",
      label: `TEAMFIGHTS (${teamfightsCount})`,
      icon: (
        <IconSwords
          size={16}
          className={
            activeTab === "teamfights"
              ? "text-[#ff6b6b]"
              : "text-[#ff6b6b]/70 group-hover:text-[#ff6b6b]"
          }
        />
      ),
    },
    {
      id: "graphs",
      label: "GRÁFICOS & VENTAJAS",
      icon: (
        <IconTrendingUp
          size={16}
          className={
            activeTab === "graphs"
              ? "text-[#2e9df0]"
              : "text-[#2e9df0]/70 group-hover:text-[#2e9df0]"
          }
        />
      ),
    },
  ];

  return (
    <div className="relative w-full border-b border-[#2d261e] bg-[#100d0a]/70 backdrop-blur-xs">
      <div className="w-full overflow-x-auto select-none no-scrollbar scroll-smooth">
        <div className="flex items-center gap-1 sm:gap-2 min-w-max px-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 text-[11px] sm:text-[13px] font-chakra font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-[#1c1712] text-[#f0d38f] border-b-2 border-b-[#d8b467] border-t border-t-[#d8b467]/60 shadow-[0_0_12px_rgba(216,180,103,0.15)]"
                    : "text-[#8e857b] hover:text-white hover:bg-[#18140e] border-b-2 border-b-transparent border-t border-t-transparent"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
