"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconX,
  IconBrandKick,
  IconExternalLink,
  IconBroadcast,
} from "@tabler/icons-react";

interface KickStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName?: string;
  title?: string;
}

const emptySubscribe = () => () => {};

export function KickStreamModal({
  isOpen,
  onClose,
  channelName = "benjaz",
  title = "TRANSMISIÓN EN VIVO · EL GRAN COLISEO II",
}: KickStreamModalProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-8">
          {/* Fullscreen Backdrop Blur & Overlay (50% opacity, matching True Sight modal) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Card with Imperial Format Style & Kick Neon Accents */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-5xl border border-[#1f481b] bg-[#0c120a] p-4 sm:p-6 md:p-7 shadow-[0_0_60px_rgba(0,0,0,0.95)] rounded-xs text-white"
          >
            {/* Roman Imperial Frame Corner Gems (Kick Neon Green #53fc18) */}
            <span className="pointer-events-none absolute -top-1.5 -left-1.5 z-20 h-3 w-3 sm:h-3.5 sm:w-3.5 rotate-45 border border-[#53fc18] bg-[#53fc18] shadow-[0_0_10px_rgba(83,252,24,0.9)]" />
            <span className="pointer-events-none absolute -top-1.5 -right-1.5 z-20 h-3 w-3 sm:h-3.5 sm:w-3.5 rotate-45 border border-[#53fc18] bg-[#53fc18] shadow-[0_0_10px_rgba(83,252,24,0.9)]" />
            <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 z-20 h-3 w-3 sm:h-3.5 sm:w-3.5 rotate-45 border border-[#53fc18] bg-[#53fc18] shadow-[0_0_10px_rgba(83,252,24,0.9)]" />
            <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 z-20 h-3 w-3 sm:h-3.5 sm:w-3.5 rotate-45 border border-[#53fc18] bg-[#53fc18] shadow-[0_0_10px_rgba(83,252,24,0.9)]" />

            {/* Inner Delicate Line in Kick Green */}
            <span className="pointer-events-none absolute inset-1.5 sm:inset-2 border border-[#53fc18]/25" />

            {/* Tactical Matrix Grid Background */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#142911_1px,transparent_1px),linear-gradient(to_bottom,#142911_1px,transparent_1px)] bg-size-[32px_32px] opacity-30" />

            {/* Header Row: Icon Box + Title (Left) & Controls (Right) */}
            <div className="relative z-10 flex flex-wrap items-start justify-between gap-3 pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                {/* Icon Box */}
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-[2px] border border-[#53fc18]/40 bg-[#132c10] text-[#53fc18] shrink-0 shadow-[0_0_15px_rgba(83,252,24,0.3)]">
                  <IconBrandKick size={24} />
                </div>

                <div>
                  <div className="font-chakra text-sm sm:text-lg md:text-xl font-black uppercase tracking-wide text-[#53fc18] leading-tight flex items-center gap-2">
                    <span>TRANSMISIÓN EN VIVO</span>
                    <span className="text-white">&middot; COLISEO II</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#a8b8a5] font-mono tracking-wider uppercase mt-0.5">
                    CANAL OFICIAL DE BENJAZ EN KICK.COM/{channelName.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Right Side Badges & Controls */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Live Indicator Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-[2px] border border-[#53fc18]/50 bg-[#53fc18]/10 px-2.5 sm:px-3 py-1 font-chakra text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#53fc18] animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#53fc18] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#53fc18]" />
                  </span>
                  <span>EN VIVO</span>
                </div>

                {/* External Kick Link */}
                <a
                  href={`https://kick.com/${channelName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-[2px] border border-[#53fc18]/40 bg-[#132810] px-2.5 py-1 text-[11px] font-semibold text-[#53fc18] transition-colors hover:bg-[#53fc18]/20 hover:text-white"
                >
                  <IconBrandKick size={14} className="text-[#53fc18]" />
                  <span>Abrir en Kick</span>
                  <IconExternalLink size={12} />
                </a>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  aria-label="Cerrar reproductor"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[2px] border border-white/15 bg-white/5 text-[#d4cdc4] transition-all hover:border-[#53fc18] hover:bg-[#53fc18]/20 hover:text-[#53fc18]"
                >
                  <IconX size={18} />
                </button>
              </div>
            </div>

            {/* Video Player Wrapper (16:9) */}
            <div className="relative z-10 aspect-video w-full overflow-hidden border border-[#53fc18]/30 bg-black shadow-2xl">
              <iframe
                src={`https://player.kick.com/${channelName}`}
                title={title}
                allow="autoplay; fullscreen"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>

            {/* Footer Row in Imperial Kick Card Style */}
            <div className="relative z-10 mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#1b3518] pt-3 font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] text-[#86ab82]">
              <div className="flex items-center gap-2">
                <IconBroadcast size={14} className="shrink-0 text-[#53fc18]" />
                <span>COBERTURA OFICIAL EN DIRECTO · KICK.COM/{channelName.toUpperCase()}</span>
              </div>
              <span className="text-[#53fc18]">EL COLISEO DE BENJAZ</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
