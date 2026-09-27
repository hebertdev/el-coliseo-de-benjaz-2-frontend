"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.75 pointer-events-none bg-transparent">
      <motion.div
        className="h-full w-full origin-left bg-linear-to-r from-[#00c8f8] via-[#2e9df0] to-[#f0d38f] shadow-[0_0_12px_rgba(0,200,248,0.8)]"
        style={{ scaleX }}
      />
    </div>
  );
}
