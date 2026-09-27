"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useUser } from "contexts/UserContext";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconSwords,
  IconShieldCheck,
  IconBrandSteam,
  IconThumbUp,
  IconChartBar,
  IconMessageCircle,
  IconLockCheck,
  IconArrowLeft,
} from "@tabler/icons-react";
import { Loader } from "@mantine/core";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loadingUser } = useUser();

  const nextUrl = searchParams.get("next") ?? "/";

  useEffect(() => {
    if (!loadingUser && user) {
      router.replace(nextUrl);
    }
  }, [user, loadingUser, router, nextUrl]);

  if (loadingUser || user) {
    return (
      <main className="relative flex min-h-[calc(100dvh-5rem)] w-full items-center justify-center bg-[#0c0a08] p-6 text-white select-none">
        <div className="flex flex-col items-center gap-3 text-[#d8b467]">
          <Loader color="#d8b467" size="md" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#a8a197]">
            Verificando credenciales de la Arena...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-[calc(100dvh-5rem)] w-full items-center justify-center overflow-hidden bg-[#0c0a08] px-4 py-8 text-white select-none">
      {/* Dark Roman Atmosphere Radial Glow */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(46,157,240,0.08)_0%,rgba(12,10,8,0.95)_70%,rgba(12,10,8,1)_100%)]" />

      {/* Decorative Gold Ambient Light Beam */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d8b467]/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg my-auto">
        {/* Imperial Gold Divider Line */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4 flex items-center justify-center gap-2 sm:gap-3 text-[#d8b467]"
        >
          <div className="h-px w-8 sm:w-12 bg-linear-to-r from-transparent to-[#d8b467]/70" />
          <IconSwords size={14} className="text-[#d8b467] shrink-0" />
          <span className="font-chakra text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em]">
            ACCESO A LA ARENA
          </span>
          <IconSwords size={14} className="text-[#d8b467] shrink-0" />
          <div className="h-px w-8 sm:w-12 bg-linear-to-l from-transparent to-[#d8b467]/70" />
        </motion.div>

        {/* Delicate Roman Frame Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="group relative border border-[#d8b467]/35 bg-[#14100c]/90 p-6 sm:p-8 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-[#d8b467]/70 hover:shadow-[0_0_35px_rgba(216,180,103,0.18)]"
        >
          {/* Roman Imperial Delicate Frame Corner Gems */}
          <span className="pointer-events-none absolute -top-1 -left-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#6cc4ff]/50 bg-[#2e9df0]/50 opacity-60 shadow-[0_0_5px_rgba(46,157,240,0.4)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:scale-125" />
          <span className="pointer-events-none absolute -top-1 -right-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#6cc4ff]/50 bg-[#2e9df0]/50 opacity-60 shadow-[0_0_5px_rgba(46,157,240,0.4)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:scale-125" />
          <span className="pointer-events-none absolute -bottom-1 -left-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#6cc4ff]/50 bg-[#2e9df0]/50 opacity-60 shadow-[0_0_5px_rgba(46,157,240,0.4)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:scale-125" />
          <span className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-2.5 w-2.5 rotate-45 border border-[#6cc4ff]/50 bg-[#2e9df0]/50 opacity-60 shadow-[0_0_5px_rgba(46,157,240,0.4)] transition-all duration-300 group-hover:opacity-100 group-hover:bg-[#2e9df0] group-hover:scale-125" />

          {/* Inner Delicate Gold Engraved Line */}
          <span className="pointer-events-none absolute inset-1.5 border border-[#d8b467]/20 transition-colors group-hover:border-[#d8b467]/45" />

          <div className="relative z-10">
            {/* Header Title */}
            <div className="text-center">
              <h1 className="font-cinzel text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#f3f3f5]">
                INICIAR SESIÓN
              </h1>
              <p className="mt-2 font-chakra text-xs text-[#a8a197] leading-relaxed">
                Ingresa con tu cuenta de Steam para participar e interactuar en El Gran Coliseo.
              </p>
            </div>

            {/* Steam Login Primary Button */}
            <div className="mt-6">
              <a
                href={`/api/auth/steam/login?next=${encodeURIComponent(nextUrl)}`}
                className="group/btn relative flex w-full items-center justify-center gap-3 overflow-hidden border border-[#2e9df0] bg-linear-to-r from-[#171a21] via-[#1b2838] to-[#2a475e] px-6 py-4 font-chakra text-xs sm:text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(46,157,240,0.35)] transition-all duration-200 hover:border-[#00c8f8] hover:shadow-[0_0_30px_rgba(0,200,248,0.7)] hover:brightness-110 cursor-pointer"
                style={{
                  clipPath: "polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%)",
                }}
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#00c8f8]/15 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                <IconBrandSteam
                  size={22}
                  className="shrink-0 text-[#66c0f4] group-hover/btn:text-white transition-colors"
                />
                <span className="relative z-10 font-black">Iniciar Sesión con Steam</span>
              </a>
            </div>

            {/* Transparency & Permissions Information Box */}
            <div className="mt-7 border border-[#2d261e] bg-[#0e0c0a]/80 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-[#d8b467] pb-2.5 border-b border-[#241e17]">
                <IconShieldCheck size={16} className="shrink-0 text-[#00c8f8]" />
                <span className="font-chakra text-xs font-bold uppercase tracking-wider text-[#f0d38f]">
                  Transparencia y Seguridad
                </span>
              </div>

              {/* What data we get */}
              <div className="mt-3 space-y-2.5 text-left">
                <div>
                  <h4 className="font-chakra text-[11px] font-bold uppercase tracking-wider text-[#e0deda] flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-[#00c8f8]" />
                    ¿Qué datos obtenemos de tu cuenta?
                  </h4>
                  <p className="mt-0.5 font-chakra text-[11px] text-[#9c9387] leading-relaxed pl-2.5">
                    Únicamente tu <strong className="text-zinc-200">SteamID64 público</strong> y los datos básicos de tu perfil público: tu <strong className="text-zinc-200">nickname</strong> y <strong className="text-zinc-200">avatar</strong>.
                  </p>
                </div>

                {/* What it is used for */}
                <div>
                  <h4 className="font-chakra text-[11px] font-bold uppercase tracking-wider text-[#e0deda] flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-[#d8b467]" />
                    ¿Para qué se utiliza?
                  </h4>
                  <p className="mt-0.5 font-chakra text-[11px] text-[#9c9387] leading-relaxed pl-2.5">
                    Te identifica como gladiador para habilitar funciones interactivas:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pl-2.5">
                    <div className="flex items-center gap-1.5 p-1.5 bg-[#17130f] border border-[#2d261e]">
                      <IconThumbUp size={13} className="text-[#00c8f8] shrink-0" />
                      <span className="font-chakra text-[10px] text-zinc-300 uppercase tracking-wider">
                        Votaciones
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 bg-[#17130f] border border-[#2d261e]">
                      <IconChartBar size={13} className="text-[#d8b467] shrink-0" />
                      <span className="font-chakra text-[10px] text-zinc-300 uppercase tracking-wider">
                        Predicciones
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 bg-[#17130f] border border-[#2d261e]">
                      <IconMessageCircle size={13} className="text-[#6cc4ff] shrink-0" />
                      <span className="font-chakra text-[10px] text-zinc-300 uppercase tracking-wider">
                        Comentarios
                      </span>
                    </div>
                  </div>
                </div>

                {/* Privacy Guarantee */}
                <div className="pt-2 border-t border-[#1f1a14] flex items-start gap-2">
                  <IconLockCheck size={15} className="shrink-0 text-emerald-400 mt-0.5" />
                  <p className="font-mono text-[10px] text-[#8e857b] leading-tight">
                    <strong className="text-zinc-300">100% Seguro:</strong> Nunca solicitamos ni tenemos acceso a tu contraseña, correo personal, inventario ni URLs de intercambio. La autenticación la realiza Valve directamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-chakra text-xs font-semibold uppercase tracking-wider text-[#8e857b] hover:text-[#6cc4ff] transition-colors"
          >
            <IconArrowLeft size={14} />
            <span>Volver a la portada principal</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-[calc(100dvh-5rem)] w-full items-center justify-center bg-[#0c0a08] p-6 text-white select-none">
          <div className="flex flex-col items-center gap-3 text-[#d8b467]">
            <Loader color="#d8b467" size="md" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#a8a197]">
              Cargando portal de inicio de sesión...
            </span>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
