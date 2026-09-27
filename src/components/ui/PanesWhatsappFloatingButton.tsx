"use client";

import { IconBrandWhatsapp } from "@tabler/icons-react";
import { trackPlausibleEvent } from "helpers/plausible";
import { ENABLE_ADS } from "constants/ads";

export function PanesWhatsappFloatingButton() {
  if (!ENABLE_ADS) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      <a
        href="https://chat.whatsapp.com/KFzibiw05Z6IQ204tjGHCa"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          trackPlausibleEvent("Click WhatsApp", { props: { origen: "floating_button" } });
        }}
        title="Únete a Panes x1.8 en WhatsApp"
        aria-label="Únete a Panes x1.8 en WhatsApp"
        className="group relative flex items-center gap-2 sm:gap-2.5 rounded-full border border-[#25D366]/40 bg-[#0c0a08]/90 px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-[0_4px_25px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#25D366] hover:shadow-[0_0_25px_rgba(37,211,102,0.45)] cursor-pointer plausible-event-name=Click+WhatsApp+Floating"
      >
        {/* Pulsing Emerald Dot Indicator */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]" />
        </span>

        {/* Text */}
        <div className="flex items-center gap-1.5 font-chakra text-xs sm:text-sm font-black uppercase tracking-wider text-white">
          <span>Panes</span>
          <span className="text-[#25D366] font-mono font-bold tracking-normal">x1.8</span>
        </div>

        {/* WhatsApp Icon */}
        <div className="flex items-center pl-1.5 border-l border-white/15 text-[#25D366] transition-transform duration-300 group-hover:scale-115">
          <IconBrandWhatsapp size={18} stroke={2.2} />
        </div>
      </a>
    </div>
  );
}
