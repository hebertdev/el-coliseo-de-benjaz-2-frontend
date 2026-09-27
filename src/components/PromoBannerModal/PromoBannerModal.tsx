"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IconX } from "@tabler/icons-react";
import { trackPlausibleEvent } from "helpers/plausible";
import { ENABLE_ADS } from "constants/ads";
import panesPc from "assets/panes_web_pc.webp";
import panesMovil from "assets/panes_web_movil.webp";

const emptySubscribe = () => () => {};

export function PromoBannerModal() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!ENABLE_ADS) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
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
  }, [isOpen]);

  if (!ENABLE_ADS || !isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
          {/* Backdrop Overlay with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative z-10 w-auto max-w-[360px] sm:max-w-xl md:max-w-4xl max-h-[92vh] flex flex-col items-center justify-center border border-[#d8b467]/50 bg-[#120f0a] shadow-[0_0_60px_rgba(216,180,103,0.25)] rounded-xs my-auto"
          >
            {/* Imperial Corner Diamond Accents */}
            <span className="pointer-events-none absolute -top-1.5 -left-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#f0d38f] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />
            <span className="pointer-events-none absolute -top-1.5 -right-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#f0d38f] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />
            <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#f0d38f] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />
            <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#f0d38f] bg-[#d8b467] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />

            {/* Subtle Inner Golden Border */}
            <span className="pointer-events-none absolute inset-1 sm:inset-1.5 border border-[#d8b467]/30 z-20" />

            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              aria-label="Cerrar banner publicitario"
              className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xs border border-[#d8b467]/60 bg-[#120f0a]/90 text-[#f0d38f] backdrop-blur-md shadow-lg transition-all duration-200 hover:border-[#f0d38f] hover:bg-[#d8b467] hover:text-black hover:scale-105 active:scale-95 cursor-pointer"
            >
              <IconX size={20} stroke={2.2} />
            </button>

            {/* Clickable Image Container with HTML <picture> and <source> responsive */}
            <a
              href="https://chat.whatsapp.com/KFzibiw05Z6IQ204tjGHCa"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackPlausibleEvent("Click WhatsApp", { props: { origen: "modal_banner" } });
              }}
              className="group relative z-10 w-full flex items-center justify-center bg-black/40 overflow-hidden cursor-pointer plausible-event-name=Click+WhatsApp+Modal"
            >
              <picture className="w-full flex items-center justify-center">
                <source media="(max-width: 640px)" srcSet={panesMovil.src} />
                <img
                  src={panesPc.src}
                  alt="Panadería del Coliseo - Especial"
                  className="w-full h-auto max-h-[85vh] object-contain block select-none transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </picture>
            </a>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
