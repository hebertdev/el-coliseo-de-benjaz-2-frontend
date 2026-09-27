"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconX,
  IconBrandYoutube,
  IconExternalLink,
  IconSkull,
  IconAlertTriangle,
} from "@tabler/icons-react";

interface TrueSightModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId?: string;
  title?: string;
  startTimeInSeconds?: number;
}

const emptySubscribe = () => () => {};

export function TrueSightModal({
  isOpen,
  onClose,
  videoId = "9RTGFWFt5hA",
  title = "TRUE SIGHT — EL GRAN COLISEO DE BENJAZ I",
  startTimeInSeconds = 294, // Inicia en el minuto 4:54 (294s)
}: TrueSightModalProps) {
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
          {/* Fullscreen Backdrop Blur & Overlay (covers header completely with 0.5 opacity) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Card with Imperial Format Style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-5xl border border-[#2a231b] bg-[#120f0c] p-4 sm:p-6 md:p-7 shadow-[0_0_60px_rgba(0,0,0,0.95)]"
          >
            {/* Roman Imperial Delicate Frame Corner Cyan Gems */}
            <span className="pointer-events-none absolute -top-1.5 -left-1.5 z-20 h-3 w-3 sm:h-3.5 sm:w-3.5 rotate-45 border border-[#6cc4ff] bg-[#2e9df0] shadow-[0_0_10px_rgba(46,157,240,0.9)]" />
            <span className="pointer-events-none absolute -top-1.5 -right-1.5 z-20 h-3 w-3 sm:h-3.5 sm:w-3.5 rotate-45 border border-[#6cc4ff] bg-[#2e9df0] shadow-[0_0_10px_rgba(46,157,240,0.9)]" />
            <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 z-20 h-3 w-3 sm:h-3.5 sm:w-3.5 rotate-45 border border-[#6cc4ff] bg-[#2e9df0] shadow-[0_0_10px_rgba(46,157,240,0.9)]" />
            <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 z-20 h-3 w-3 sm:h-3.5 sm:w-3.5 rotate-45 border border-[#6cc4ff] bg-[#2e9df0] shadow-[0_0_10px_rgba(46,157,240,0.9)]" />

            {/* Inner Delicate Gold Engraved Line */}
            <span className="pointer-events-none absolute inset-1.5 sm:inset-2 border border-[#d8b467]/30" />

            {/* Tactical Matrix Grid Background */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1f1913_1px,transparent_1px),linear-gradient(to_bottom,#1f1913_1px,transparent_1px)] bg-size-[32px_32px] opacity-35" />

            {/* Top Row: Icon Box + Title (Left) & Badges / Controls (Right) */}
            <div className="relative z-10 flex flex-wrap items-start justify-between gap-3 pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                {/* Icon Box */}
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-[2px] border border-[#522424] bg-[#1c0d0d] text-[#e06666] shrink-0">
                  <IconSkull size={22} stroke={2} />
                </div>

                <div>
                  <div className="font-chakra text-sm sm:text-lg md:text-xl font-black uppercase tracking-wide text-[#e06666] leading-tight">
                    TRUE SIGHT &middot; <span className="text-white">COLISEO I</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#a8a197] font-mono tracking-wider uppercase mt-0.5">
                    DOCUMENTAL OFICIAL DE LA PRIMERA EDICIÓN
                  </p>
                </div>
              </div>

              {/* Right Side Badges & Controls */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Phase / Tag Badge */}
                <div className="rounded-[2px] border border-[#482020] bg-[#241313] px-2.5 sm:px-3 py-1 font-chakra text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#c85252]">
                  DOCUMENTAL
                </div>

                {/* External YouTube Link */}
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}&t=${startTimeInSeconds}s`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-[2px] border border-[#d8b467]/30 bg-[#1e1810] px-2.5 py-1 text-[11px] font-semibold text-[#d4cdc4] transition-colors hover:border-[#d8b467] hover:text-white"
                >
                  <IconBrandYoutube size={14} className="text-red-500" />
                  <span>YouTube</span>
                  <IconExternalLink size={12} />
                </a>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  aria-label="Cerrar reproductor"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[2px] border border-white/15 bg-white/5 text-[#d4cdc4] transition-all hover:border-red-500 hover:bg-red-600/80 hover:text-white"
                >
                  <IconX size={18} />
                </button>
              </div>
            </div>

            {/* Video Player Wrapper (16:9) Starting at 5:00 (start=300) */}
            <div className="relative z-10 aspect-video w-full overflow-hidden border border-[#2a231b] bg-black shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&start=${startTimeInSeconds}&rel=0`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>

            {/* Footer Row in Card Style */}
            <div className="relative z-10 mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#1e1913] pt-3 font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] text-[#9e4242]">
              <div className="flex items-center gap-2">
                <IconAlertTriangle size={14} stroke={2} className="shrink-0 text-[#c85252]" />
                <span>CRÓNICA HISTÓRICA DEL COLISEO</span>
              </div>
              <span className="text-[#6e665a]">BENJAZ DOTA 2</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
