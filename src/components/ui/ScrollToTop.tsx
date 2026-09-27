"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronUp, IconSwords } from "@tabler/icons-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 border border-[#d8b467]/40 bg-[#16120c]/90 px-3.5 py-2.5 backdrop-blur-md shadow-[0_0_20px_rgba(216,180,103,0.25)] text-[#f0d38f] transition-colors hover:border-[#f0d38f] hover:bg-[#221c13] hover:text-white"
          aria-label="Volver arriba"
        >
          <IconSwords size={16} className="rotate-45 text-[#00c8f8]" />
          <span className="font-chakra text-xs font-bold uppercase tracking-wider hidden sm:inline">
            Volver al Trono
          </span>
          <IconChevronUp size={16} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
