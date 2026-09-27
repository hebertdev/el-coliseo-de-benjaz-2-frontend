"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader } from "@mantine/core";
import { IconAlertTriangle, IconShieldCheck, IconBrandSteam } from "@tabler/icons-react";

function SteamCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    async function processAuth() {
      const mode = searchParams.get("openid.mode");
      if (mode === "cancel") {
        setError("Autenticación cancelada en Steam.");
        setLoading(false);
        return;
      }

      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      if (!params["openid.claimed_id"] && !params["openid.identity"]) {
        setError("Respuesta de Steam inválida o parámetros incompletos.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/steam/authenticate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ params }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || "No se pudo verificar la sesión con Steam.");
        }

        const nextUrl = searchParams.get("next") || "/";
        window.location.href = nextUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error durante el inicio de sesión con Steam.");
        setLoading(false);
      }
    }

    processAuth();
  }, [searchParams, router]);

  return (
    <main className="relative flex min-h-[calc(100dvh-5rem)] w-full items-center justify-center bg-[#0c0a08] p-6 text-white select-none">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(46,157,240,0.08)_0%,rgba(12,10,8,0.95)_70%,rgba(12,10,8,1)_100%)]" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center border border-[#241e17] bg-[#14100c]/90 p-8 shadow-2xl backdrop-blur-md">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-16 w-16 rounded-full bg-[#00c8f8]/20 blur-xl animate-pulse" />
              <IconBrandSteam size={48} className="text-[#00c8f8] relative z-10" />
            </div>
            <Loader color="#00c8f8" size="md" />
            <div className="space-y-1">
              <h2 className="font-chakra text-sm font-bold uppercase tracking-widest text-[#d8b467]">
                Verificando Gladiador en Steam
              </h2>
              <p className="font-mono text-xs text-[#a8a197]">
                Validando credenciales criptográficas con la Arena...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-4 w-full">
            <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-full text-red-400">
              <IconAlertTriangle size={32} />
            </div>
            <h2 className="font-chakra text-sm font-bold uppercase tracking-widest text-red-300">
              Fallo de Autenticación
            </h2>
            <p className="font-mono text-xs text-red-200/80 bg-red-950/30 p-3 border border-red-900/50 rounded w-full">
              {error}
            </p>
            <div className="flex gap-3 mt-3 w-full">
              <Link
                href="/auth/login"
                className="flex-1 border border-[#3d3328] bg-[#1a1611] py-2.5 font-chakra text-xs font-bold uppercase tracking-wider text-[#d8b467] hover:border-[#d8b467] hover:bg-[#d8b467]/10 transition-colors text-center"
              >
                Volver al Login
              </Link>
              <a
                href={`/api/auth/steam/login?next=${encodeURIComponent(searchParams.get("next") || "/")}`}
                className="flex-1 border border-[#00c8f8] bg-[#00c8f8]/20 py-2.5 font-chakra text-xs font-bold uppercase tracking-wider text-[#6cc4ff] hover:bg-[#00c8f8] hover:text-black transition-all text-center"
              >
                Reintentar
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6">
            <IconShieldCheck size={48} className="text-[#00c8f8]" />
            <h2 className="font-chakra text-sm font-bold uppercase tracking-widest text-[#d8b467]">
              ¡Acceso Concedido!
            </h2>
            <p className="font-mono text-xs text-[#a8a197]">Entrando a la Arena...</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SteamCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-[calc(100dvh-5rem)] w-full items-center justify-center bg-[#0c0a08] p-6 text-white select-none">
          <div className="flex flex-col items-center gap-3 text-[#00c8f8]">
            <Loader color="#00c8f8" size="md" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#a8a197]">
              Cargando respuesta de Steam...
            </span>
          </div>
        </main>
      }
    >
      <SteamCallbackContent />
    </Suspense>
  );
}
