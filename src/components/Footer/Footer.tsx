"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import wallpaperFooter from "assets/wallapaper_footer.webp";
import logoElColiseo from "assets/logo_el_coliseo.webp";
import {
  IconBrandYoutube,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandFacebook,
  IconBrandDiscord,
  IconWorld,
} from "@tabler/icons-react";

export function Footer() {
  const footerRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });

  const imgScale = useTransform(scrollYProgress, [0, 1], [1.15, 1.0]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["-5%", "0%"]);

  const socialLinks = [
    {
      name: "Instagram",
      href: "https://instagram.com/benjazdota",
      icon: IconBrandInstagram,
      color: "hover:text-[#e1306c] hover:border-[#e1306c]/60 hover:shadow-[0_0_15px_rgba(225,48,108,0.4)]",
    },
    {
      name: "Facebook",
      href: "https://facebook.com/BenjazDota",
      icon: IconBrandFacebook,
      color: "hover:text-[#1877f2] hover:border-[#1877f2]/60 hover:shadow-[0_0_15px_rgba(24,119,242,0.4)]",
    },
    {
      name: "YouTube",
      href: "https://youtube.com/benjazdota2",
      icon: IconBrandYoutube,
      color: "hover:text-[#ff0000] hover:border-[#ff0000]/60 hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]",
    },
    {
      name: "Discord",
      href: "https://discord.gg/benjaz6628",
      icon: IconBrandDiscord,
      color: "hover:text-[#5865f2] hover:border-[#5865f2]/60 hover:shadow-[0_0_15px_rgba(88,101,242,0.4)]",
    },
    {
      name: "TikTok",
      href: "https://tiktok.com/@benjaz.dota",
      icon: IconBrandTiktok,
      color: "hover:text-[#25f4ee] hover:border-[#25f4ee]/60 hover:shadow-[0_0_15px_rgba(37,244,238,0.4)]",
    },
    {
      name: "Hebertdev",
      href: "https://www.hebertdev.com/es",
      icon: IconWorld,
      color: "hover:text-[#00c8f8] hover:border-[#00c8f8]/60 hover:shadow-[0_0_15px_rgba(0,200,248,0.4)]",
    },
  ];

  return (
    <footer ref={footerRef} className="relative w-full overflow-hidden bg-[#0c0a08] text-white select-none min-h-[420px] sm:min-h-0">
      {/* Background Image: object-cover on mobile, natural w-full h-auto on sm (tablet/desktop) */}
      <motion.div
        style={{ scale: imgScale, y: imgY }}
        className="relative w-full min-h-[420px] sm:min-h-0 flex flex-col items-center justify-center overflow-hidden"
      >
        <picture className="absolute inset-0 sm:relative sm:inset-auto block w-full h-full sm:h-auto">
          <img
            src={wallpaperFooter.src}
            alt="El Gran Coliseo II de Benjaz - Dota 2"
            width={wallpaperFooter.width}
            height={wallpaperFooter.height}
            className="w-full h-full sm:h-auto object-cover sm:object-contain object-center block select-none pointer-events-none"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 12%, black 28%, black 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 12%, black 28%, black 100%)",
            }}
          />
        </picture>

        {/* Seamless Soft Fade Gradient Overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(12, 10, 8, 0.2) 25%, rgba(12, 10, 8, 0.78) 65%, rgba(12, 10, 8, 0.96) 100%)",
          }}
        />

        {/* Content Foreground Overlaid Over Background */}
        <div className="relative sm:absolute sm:inset-0 z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto w-full px-4 py-8 sm:py-10">
          {/* Big Prominent Logo on Top */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-3 sm:mb-6"
          >
            <picture>
              <img
                src={logoElColiseo.src}
                alt="El Gran Coliseo de Benjaz"
                width={180}
                height={180}
                className="h-16 w-16 sm:h-28 sm:w-28 md:h-36 md:w-36 lg:h-40 lg:w-40 object-contain drop-shadow-[0_8px_28px_rgba(0,0,0,0.95)] transition-transform duration-300 hover:scale-105"
              />
            </picture>
          </motion.div>

        {/* Benjaz Social Media Links */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-5">
          {socialLinks.map((social, idx) => {
            const Icon = social.icon;
            return (
              <motion.div
                key={social.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Link
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className={`group flex h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center border border-white/10 bg-black/70 text-[#d4cdc4] backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 shadow-[0_4px_14px_rgba(0,0,0,0.8)] ${social.color}`}
                  style={{
                    clipPath: "polygon(12% 0, 100% 0, 88% 100%, 0% 100%)",
                  }}
                >
                  <Icon size={18} className="transition-transform duration-200 group-hover:scale-110 sm:size-[19px]" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Copyright & Rights */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-1 font-chakra"
        >
          <p className="text-xs sm:text-sm font-bold tracking-wider text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
            © {new Date().getFullYear()} El Gran Coliseo II
          </p>
          <p className="text-[10px] sm:text-xs text-[#c7bcab] tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
            Todos los derechos reservados del código y web.{" "}
            <span className="text-[#f0d38f] font-bold">hebertdev</span>
          </p>
          <p className="text-[10px] sm:text-[11px] text-[#8e857b] tracking-wider italic pt-0.5 drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">
            * Sitio no oficial · Creado por un fan de Dota 2 por falta de información del torneo.
          </p>
          <p className="pt-1 text-[10px] text-[#8e857b] tracking-widest uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">
            Desarrollado por{" "}
            <a
              href="mailto:hebertdev@outlook.com"
              className="font-bold text-[#6cc4ff] transition-colors hover:text-white hover:underline"
            >
              hebertdev (hebertdev@outlook.com)
            </a>
          </p>
        </motion.div>
      </div>
    </motion.div>
  </footer>
);
}