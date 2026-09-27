"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import logoElColiseo from "assets/logo_el_coliseo.webp";
import { useUser } from "contexts/UserContext";
import { UserMenu } from "./UserMenu";
import { IconMenu2, IconX, IconBrandSteam } from "@tabler/icons-react";

export function Header() {
  const pathname = usePathname();
  const { user, loadingUser } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  interface NavItem {
    label: string;
    href: string;
    isDrafting?: boolean;
    isNew?: boolean;
    isPrize?: boolean;
    prizeBadge?: string;
  }

  const leftNavItems: NavItem[] = [
    { label: "INICIO", href: "/" },
    {
      label: "PREDICCIONES",
      href: "/predictions",
      isPrize: true,
    },
    { label: "EQUIPOS", href: "/teams" },
  ];

  const rightNavItems: NavItem[] = [
    { label: "FASES", href: "/swiss-stage", isDrafting: true },
    { label: "ESTADÍSTICAS", href: "/analytics", isNew: true },
    { label: "PATROCINADORES", href: "/#sponsors" },
  ];

  const mobileNavItems: NavItem[] = [
    { label: "INICIO", href: "/" },
    {
      label: "PREDICCIONES",
      href: "/predictions",
      isPrize: true,
    },
    { label: "EQUIPOS", href: "/teams" },
    { label: "FASES", href: "/swiss-stage", isDrafting: true },
    { label: "ESTADÍSTICAS", href: "/analytics", isNew: true },
    { label: "PATROCINADORES", href: "/#sponsors" },
  ];

  const isItemActive = (item: { label: string; href: string }) => {
    if (item.href === "/") {
      return pathname === "/" && !activeTab;
    }
    if (item.href === "/predictions") {
      return pathname.startsWith("/predictions") || pathname.startsWith("/predicciones");
    }
    if (item.href === "/teams") {
      return pathname.startsWith("/teams");
    }
    if (item.href === "/swiss-stage") {
      return pathname.startsWith("/swiss-stage");
    }
    if (item.href === "/analytics") {
      return pathname.startsWith("/analytics");
    }
    if (item.href.startsWith("/#")) {
      return pathname === "/" && activeTab === item.label;
    }
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full select-none">
      {/* Imperial Roman Header Background */}
      <div className="relative w-full border-b border-[#2d261e] bg-[#120f0a]/95 backdrop-blur-xl shadow-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ================= DESKTOP HEADER ================= */}
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center h-20 gap-2 xl:gap-4">
            {/* Left Section: Brand on far-left, Nav right-aligned towards logo */}
            <div className="flex items-center justify-between min-w-0">
              <Link
                href="/"
                onClick={() => setActiveTab("")}
                className="mr-2 xl:mr-4 flex items-center shrink-0"
              >
                <span className="font-coliseo-title text-sm xl:text-base font-black uppercase tracking-wider text-white hover:opacity-90 transition-opacity">
                  COLISEO <span className="text-[#2e9df0]">II</span>
                </span>
              </Link>

              <nav className="flex items-center gap-0.5 xl:gap-1.5 justify-end">
                {leftNavItems.map((item) => {
                  const isActive = isItemActive(item);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      scroll={true}
                      onClick={() => {
                        setActiveTab(item.label);
                        if (item.href === "/predictions") {
                          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                        }
                      }}
                      className={`relative px-3 xl:px-4 py-2 font-chakra text-xs font-bold uppercase tracking-widest transition-all ${
                        isActive
                          ? item.isPrize
                            ? "text-[#f0d38f] drop-shadow-[0_0_15px_rgba(240,211,143,0.9)]"
                            : "text-[#2e9df0] drop-shadow-[0_0_12px_rgba(46,157,240,0.7)]"
                          : item.isPrize
                          ? "text-[#f0d38f] hover:text-[#ffd700] drop-shadow-[0_0_8px_rgba(240,211,143,0.5)]"
                          : "text-[#c7bcab] hover:text-white"
                      }`}
                    >
                      <span className="relative inline-flex items-center whitespace-nowrap">
                        <span>{item.label}</span>
                        {item.isNew && (
                          <span className="absolute -top-2 right-0 -translate-y-1/2 translate-x-1/4 inline-flex items-center px-1 py-0.5 text-[7.5px] font-chakra font-black tracking-widest text-[#00c8f8] bg-[#0a1824] border border-[#00c8f8]/80 shadow-[0_0_8px_rgba(0,200,248,0.6)] rounded-[2px] leading-none animate-pulse">
                            NEW
                          </span>
                        )}
                        {item.isDrafting && (
                          <span className="ml-1.5 relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00c8f8] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00c8f8]" />
                          </span>
                        )}
                      </span>
                      {isActive && (
                        <span
                          className={`absolute -bottom-px left-1/2 h-0.75 w-8 -translate-x-1/2 ${
                            item.isPrize
                              ? "bg-[#f0d38f] shadow-[0_0_12px_rgba(240,211,143,0.9)]"
                              : "bg-[#2e9df0] shadow-[0_0_12px_rgba(46,157,240,0.85)]"
                          }`}
                          style={{
                            clipPath:
                              "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)",
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Center Monumental Logo */}
            <div className="flex items-center justify-center px-2 sm:px-4">
              <Link
                href="/"
                onClick={() => setActiveTab("")}
                className="group relative flex items-center justify-center p-2 transition-transform duration-300 hover:scale-105"
                aria-label="El Coliseo de Benjaz"
              >
                <div className="pointer-events-none absolute h-16 w-16 rounded-full bg-[#2e9df0]/10 blur-xl transition-all duration-300 group-hover:bg-[#2e9df0]/25" />
                <picture>
                  <img
                    src={logoElColiseo.src}
                    alt="El Coliseo de Benjaz Logo"
                    width={56}
                    height={56}
                    className="h-14 w-14 object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
                  />
                </picture>
              </Link>
            </div>

            {/* Right Section: Nav left-aligned from logo, Auth on far-right */}
            <div className="flex items-center justify-between min-w-0">
              <nav className="flex items-center gap-0.5 xl:gap-1.5 justify-start">
                {rightNavItems.map((item) => {
                  const isActive = isItemActive(item);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setActiveTab(item.label)}
                      className={`relative px-3 xl:px-4 py-2 font-chakra text-xs font-bold uppercase tracking-widest transition-all ${
                        isActive
                          ? "text-[#2e9df0] drop-shadow-[0_0_12px_rgba(46,157,240,0.7)]"
                          : "text-[#c7bcab] hover:text-white"
                      }`}
                    >
                      <span className="relative inline-flex items-center whitespace-nowrap">
                        <span>{item.label}</span>
                        {item.isNew && (
                          <span className="absolute -top-2 right-0 -translate-y-1/2 translate-x-1/4 inline-flex items-center px-1 py-0.5 text-[7.5px] font-chakra font-black tracking-widest text-[#00c8f8] bg-[#0a1824] border border-[#00c8f8]/80 shadow-[0_0_8px_rgba(0,200,248,0.6)] rounded-[2px] leading-none animate-pulse">
                            NEW
                          </span>
                        )}
                        {item.isDrafting && (
                          <span className="ml-1.5 relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00c8f8] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00c8f8]" />
                          </span>
                        )}
                      </span>
                      {isActive && (
                        <span
                          className="absolute -bottom-px left-1/2 h-0.75 w-8 -translate-x-1/2 bg-[#2e9df0] shadow-[0_0_12px_rgba(46,157,240,0.85)]"
                          style={{
                            clipPath:
                              "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)",
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="pl-2 shrink-0">
                <button
                  type="button"
                  disabled
                  title="Inicio de sesión cerrado (Edición Concluida)"
                  className="relative inline-flex items-center gap-1.5 whitespace-nowrap border border-zinc-700 bg-zinc-900/70 px-3 py-1.5 font-chakra text-[11px] font-bold uppercase tracking-wider text-zinc-400 opacity-70 cursor-not-allowed select-none"
                  style={{
                    clipPath: "polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%)",
                  }}
                >
                  <IconBrandSteam size={13} className="shrink-0 text-zinc-500" />
                  <span>Steam (Cerrado)</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= MOBILE HEADER TOP ROW ================= */}
          <div className="relative flex w-full items-center justify-between lg:hidden h-20">
            {/* Left: Text Brand */}
            <Link href="/" className="flex items-center gap-1 text-left z-10 shrink-0">
              <span className="font-chakra text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                COLISEO <span className="text-[#2e9df0]">II</span>
              </span>
            </Link>

            {/* Center: Logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 pointer-events-auto">
              <Link
                href="/"
                onClick={() => {
                  setActiveTab("");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center p-2 transition-transform active:scale-95"
                aria-label="El Coliseo de Benjaz"
              >
                <picture>
                  <img
                    src={logoElColiseo.src}
                    alt="El Coliseo de Benjaz Logo"
                    width={46}
                    height={46}
                    className="h-11 w-11 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
                  />
                </picture>
              </Link>
            </div>

            {/* Right: Menu Toggle Button */}
            <div className="flex items-center gap-2 z-10 shrink-0">
              {!loadingUser && user && (
                <UserMenu user={user} compact />
              )}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center border border-[#2d261e] bg-[#241e17] text-[#e0deda] transition-colors hover:border-[#2e9df0] hover:text-[#2e9df0] active:scale-95 cursor-pointer"
                aria-label="Abrir Menú"
              >
                <IconMenu2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE MENU SLIDE-OVER DRAWER ================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden"
            />

            {/* Sliding Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-50 flex w-[85vw] max-w-xs sm:max-w-sm flex-col justify-between border-l border-[#2d261e] bg-[#120f0a]/98 p-6 text-white shadow-2xl backdrop-blur-xl lg:hidden overflow-y-auto touch-scroll"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-[#241e17] pb-4">
                  <div className="flex items-center gap-2">
                    <picture>
                      <img
                        src={logoElColiseo.src}
                        alt="El Coliseo de Benjaz Logo"
                        className="h-8 w-8 object-contain"
                      />
                    </picture>
                    <span className="font-chakra text-xs font-black uppercase tracking-wider text-white">
                      COLISEO <span className="text-[#2e9df0]">II</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-9 w-9 items-center justify-center border border-[#2d261e] bg-[#241e17] text-[#e0deda] transition-colors hover:border-[#2e9df0] hover:text-[#2e9df0] active:scale-95 cursor-pointer"
                    aria-label="Cerrar Menú"
                  >
                    <IconX size={18} />
                  </button>
                </div>

                {/* Navigation Items */}
                <div className="mt-6 flex flex-col space-y-1.5">
                  <div className="mb-2 font-chakra text-[11px] font-bold uppercase tracking-widest text-[#7e766c]">
                    Navegación del Coliseo
                  </div>

                  {mobileNavItems.map((item) => {
                    const isActive = isItemActive(item);
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        scroll={true}
                        onClick={() => {
                          setActiveTab(item.label);
                          setMobileMenuOpen(false);
                          if (item.href === "/predictions") {
                            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                          }
                        }}
                        className={`flex items-center min-h-11 py-2.5 px-3 font-chakra text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
                          isActive
                            ? item.isPrize
                              ? "text-[#f0d38f] bg-[#f0d38f]/15 border-l-2 border-l-[#f0d38f] shadow-[0_0_15px_rgba(240,211,143,0.2)]"
                              : "text-[#2e9df0] bg-[#2e9df0]/15 border-l-2 border-l-[#2e9df0] shadow-[0_0_15px_rgba(46,157,240,0.15)]"
                            : item.isPrize
                            ? "text-[#f0d38f] hover:text-[#ffd700] hover:bg-white/5"
                            : "text-[#e0deda] hover:text-[#6cc4ff] hover:bg-white/5"
                        }`}
                      >
                        <span className="flex items-center justify-between w-full">
                          <span className="relative inline-flex items-center gap-1.5">
                            <span>{item.label}</span>
                            {item.isNew && (
                              <span className="absolute -top-2 right-0 -translate-y-1/2 translate-x-1/4 inline-flex items-center px-1 py-0.5 text-[7.5px] font-chakra font-black tracking-widest text-[#00c8f8] bg-[#0a1824] border border-[#00c8f8]/80 shadow-[0_0_8px_rgba(0,200,248,0.6)] rounded-[2px] leading-none animate-pulse">
                                NEW
                              </span>
                            )}
                          </span>
                          {item.isDrafting && (
                            <span className="relative flex h-2 w-2 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00c8f8] opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00c8f8]" />
                            </span>
                          )}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-[#241e17] pt-5 mt-6">
                <button
                  type="button"
                  disabled
                  title="Inicio de sesión cerrado (Edición Concluida)"
                  className="flex items-center justify-center gap-2 w-full min-h-11 border border-zinc-700/80 bg-zinc-900/80 py-3 text-center font-chakra text-xs font-bold uppercase tracking-widest text-zinc-400 opacity-70 cursor-not-allowed select-none"
                >
                  <IconBrandSteam size={16} className="text-zinc-500" />
                  <span>Login con Steam (Deshabilitado)</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
