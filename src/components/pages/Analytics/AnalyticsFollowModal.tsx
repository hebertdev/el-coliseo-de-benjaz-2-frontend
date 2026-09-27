"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconX,
  IconBrandInstagram,
  IconBrandTiktok,
  IconExternalLink,
  IconSparkles,
  IconShare,
  IconCheck,
  IconHeartHandshake,
  IconDeviceAnalytics,
} from "@tabler/icons-react";

interface AnalyticsFollowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emptySubscribe = () => () => {};

export function AnalyticsFollowModal({
  isOpen,
  onClose,
}: AnalyticsFollowModalProps) {
  const [copied, setCopied] = useState(false);

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
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    try {
      const url =
        typeof window !== "undefined"
          ? window.location.href
          : "https://elgrancoliseo.hebertdev.com/analytics";
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
    }
  };

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden">
          {/* Backdrop Blur & Lowered Dark Tint (50%) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col border border-[#d8b467]/40 bg-[#0f0c08] shadow-[0_0_60px_rgba(0,0,0,0.95)] rounded-xs text-white my-auto"
          >
            {/* Roman Imperial Corner Gems (Gold & Cyan Accents) */}
            <span className="pointer-events-none absolute -top-1.5 -left-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#d8b467] bg-[#f0d38f] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />
            <span className="pointer-events-none absolute -top-1.5 -right-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#d8b467] bg-[#f0d38f] shadow-[0_0_12px_rgba(240,211,143,0.9)]" />
            <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#00c8f8] bg-[#00c8f8] shadow-[0_0_12px_rgba(0,200,248,0.9)]" />
            <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 z-30 h-3.5 w-3.5 rotate-45 border border-[#00c8f8] bg-[#00c8f8] shadow-[0_0_12px_rgba(0,200,248,0.9)]" />

            {/* Inner Gold Framing Border */}
            <span className="pointer-events-none absolute inset-1.5 sm:inset-2 border border-[#d8b467]/20 z-20" />

            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 bg-[#e1306c]/15 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 bg-[#00c8f8]/15 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#2d261e_1px,transparent_1px),linear-gradient(to_bottom,#2d261e_1px,transparent_1px)] bg-size-[32px_32px] opacity-25" />

            {/* Inner Scrollable Container */}
            <div className="relative z-10 w-full overflow-y-auto p-4 sm:p-6 max-h-[85vh]">

            {/* Header with Close Button */}
            <div className="relative z-10 flex items-start justify-between gap-3 pb-3 border-b border-[#2d261e]">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center border border-[#d8b467]/50 bg-[#1c160e] text-[#f0d38f] shadow-[0_0_20px_rgba(216,180,103,0.3)] shrink-0">
                  <IconDeviceAnalytics size={24} className="text-[#f0d38f] animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-chakra font-bold tracking-[0.2em] uppercase text-[#00c8f8]">
                    <IconSparkles size={13} className="text-[#00c8f8]" />
                    <span>DATA SCIENCE &amp; ANALYTICS</span>
                  </div>
                  <h3 className="font-cinzel text-base sm:text-lg md:text-xl font-black uppercase text-white leading-tight truncate">
                    ¡Apoya el Proyecto de <span className="text-[#f0d38f]">Data</span>!
                  </h3>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                type="button"
                aria-label="Cerrar modal"
                className="flex h-8 w-8 cursor-pointer items-center justify-center border border-white/15 bg-white/5 text-[#d4cdc4] transition-all hover:border-[#f0d38f] hover:bg-[#d8b467]/20 hover:text-[#f0d38f] shrink-0"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Message Body */}
            <div className="relative z-10 py-3 sm:py-3.5 space-y-2 font-chakra">
              <p className="text-xs sm:text-sm text-[#d4cdc4] leading-relaxed">
                ¡Hola! 👋 Estoy recolectando y procesando toda la data en tiempo real de cada partida de{" "}
                <span className="text-white font-bold">El Gran Coliseo II</span> para extraer las estadísticas más completas, el <span className="text-[#f0d38f] font-semibold">Dream Team</span>, el meta de héroes y los récords del torneo.
              </p>
              <p className="text-xs sm:text-[13px] text-[#a89f91] leading-relaxed">
                Si te gusta este trabajo y quieres ver más proyectos de <span className="text-[#00c8f8] font-semibold">Análisis de Datos, IA y Esports</span>, ¡sígueme en mis redes sociales para no perderte nada! 🚀
              </p>
            </div>

            {/* Social Cards Section */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
              {/* Instagram Card */}
              <a
                href="https://www.instagram.com/hebertdev.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden border border-[#e1306c]/40 bg-[#161114]/90 p-3.5 sm:p-4 transition-all duration-300 hover:border-[#e1306c] hover:bg-[#201319] hover:shadow-[0_0_25px_rgba(225,48,108,0.35)] flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#e1306c]/20 via-[#f77737]/10 to-transparent pointer-events-none group-hover:scale-110 transition-transform" />
                
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-[0_0_15px_rgba(225,48,108,0.5)] shrink-0">
                    <IconBrandInstagram size={20} />
                  </div>
                  <div>
                    <div className="font-cinzel text-xs sm:text-sm font-bold text-white group-hover:text-[#f0d38f] transition-colors">
                      Instagram
                    </div>
                    <div className="font-mono text-xs text-[#e1306c] font-semibold">
                      @hebertdev.ai
                    </div>
                  </div>
                </div>

                <p className="text-[11px] font-chakra text-[#c7bcab] mb-2.5 leading-snug">
                  Behind the scenes, avances de analíticas, updates de IA y visualización de datos.
                </p>

                <div className="inline-flex items-center justify-center gap-2 border border-[#e1306c]/60 bg-[#e1306c]/15 px-3 py-1.5 text-xs font-chakra font-bold uppercase tracking-wider text-[#ff80a8] group-hover:bg-[#e1306c] group-hover:text-white transition-all">
                  <span>Seguir en Instagram</span>
                  <IconExternalLink size={13} />
                </div>
              </a>

              {/* TikTok Card */}
              <a
                href="https://www.tiktok.com/@hebertdev.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden border border-[#00f2fe]/40 bg-[#0d161a]/90 p-3.5 sm:p-4 transition-all duration-300 hover:border-[#00f2fe] hover:bg-[#101f26] hover:shadow-[0_0_25px_rgba(0,242,254,0.35)] flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#fe0979]/20 via-[#00f2fe]/10 to-transparent pointer-events-none group-hover:scale-110 transition-transform" />

                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#010101] border border-[#00f2fe]/50 text-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.5)] shrink-0">
                    <IconBrandTiktok size={20} className="text-[#00f2fe]" />
                  </div>
                  <div>
                    <div className="font-cinzel text-xs sm:text-sm font-bold text-white group-hover:text-[#00c8f8] transition-colors">
                      TikTok
                    </div>
                    <div className="font-mono text-xs text-[#00f2fe] font-semibold">
                      @hebertdev.ai
                    </div>
                  </div>
                </div>

                <p className="text-[11px] font-chakra text-[#c7bcab] mb-2.5 leading-snug">
                  Clips rápidos, curiosidades de esports, algoritmos de Dota 2 y tecnología.
                </p>

                <div className="inline-flex items-center justify-center gap-2 border border-[#00f2fe]/60 bg-[#00f2fe]/15 px-3 py-1.5 text-xs font-chakra font-bold uppercase tracking-wider text-[#6df5ff] group-hover:bg-[#00f2fe] group-hover:text-black transition-all">
                  <span>Seguir en TikTok</span>
                  <IconExternalLink size={13} />
                </div>
              </a>
            </div>

            {/* Quick Share Link & Footer Actions */}
            <div className="relative z-10 mt-3.5 pt-3 border-t border-[#2d261e] flex flex-col sm:flex-row items-center justify-between gap-2.5 font-chakra">
              {/* Share Page URL Button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#d8b467]/60 bg-[#1c160e] px-3.5 py-1.5 text-xs font-chakra font-bold uppercase tracking-wider text-[#f0d38f] transition-all hover:border-[#00c8f8] hover:text-white hover:shadow-[0_0_15px_rgba(0,200,248,0.25)] cursor-pointer"
              >
                {copied ? (
                  <>
                    <IconCheck size={14} className="text-[#00c8f8]" />
                    <span className="text-[#00c8f8]">¡Enlace copiado!</span>
                  </>
                ) : (
                  <>
                    <IconShare size={14} className="text-[#f0d38f]" />
                    <span>Compartir con amigos</span>
                  </>
                )}
              </button>

              {/* Continue Exploring Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#2d261e] bg-[#16120d] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#a89f91] hover:border-[#d8b467] hover:text-[#f0d38f] transition-all cursor-pointer"
              >
                <IconHeartHandshake size={14} />
                <span>Continuar viendo analíticas</span>
              </button>
            </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
