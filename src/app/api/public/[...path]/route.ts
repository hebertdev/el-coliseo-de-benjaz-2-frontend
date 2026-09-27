export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getApiUrl } from "lib/config";
import { NextResponse } from "next/server";

function buildUpstreamUrl(requestUrl: string, path: string): string {
  const incoming = new URL(requestUrl);
  let cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  // Ensure trailing slash for Django, unless it looks like a file extension
  if (!cleanPath.endsWith("/") && !cleanPath.split("/").pop()?.includes(".")) {
    cleanPath += "/";
  }

  const upstream = new URL(`${getApiUrl()}${cleanPath}`);
  upstream.search = incoming.search;
  return upstream.toString();
}

async function forward(request: Request, method: string) {
  const incoming = new URL(request.url);
  const prefix = "/api/public";
  
  // Validación básica de ruta
  if (!incoming.pathname.startsWith(prefix)) {
    return NextResponse.json({ message: "Ruta inválida" }, { status: 400 });
  }

  const joined = incoming.pathname.slice(prefix.length) || "/";
  if (joined.includes("..")) {
    return NextResponse.json({ message: "Ruta inválida" }, { status: 400 });
  }

  let upstreamUrl: string;
  try {
    upstreamUrl = buildUpstreamUrl(request.url, joined);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }

  const headers = new Headers();
  // No inyectamos Authorization porque es público

  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const cacheControlHeader = request.headers.get("cache-control");
  const isLiveRequest = Boolean(
    incoming.searchParams.has("live") ||
    incoming.pathname.includes("/live")
  );
  const isForceRefresh = Boolean(
    incoming.searchParams.has("refresh") ||
    cacheControlHeader?.includes("no-cache") ||
    isLiveRequest
  );

  const isReadMethod = method === "GET" || method === "HEAD";
  
  // Si es lectura en vivo (?live=1 o /live) o forzada, no almacenar caché (no-store)
  // para reflejar drafts y estados de partida en tiempo real.
  let fetchInit: RequestInit;
  if (!isReadMethod || isForceRefresh) {
    fetchInit = { method, headers, cache: "no-store" };
  } else {
    fetchInit = { method, headers, next: { revalidate: 15 } };
  }

  if (!isReadMethod) {
    fetchInit.body = await request.arrayBuffer();
  }

  try {
    const upstream = await fetch(upstreamUrl, fetchInit);
    const upstreamBody = await upstream.arrayBuffer();

    const responseHeaders = new Headers();
    const upstreamContentType = upstream.headers.get("content-type");
    if (upstreamContentType) responseHeaders.set("content-type", upstreamContentType);

    if (isReadMethod && upstream.ok && !isForceRefresh) {
      responseHeaders.set(
        "Cache-Control",
        "public, s-maxage=15, stale-while-revalidate=30"
      );
    } else {
      responseHeaders.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, max-age=0"
      );
      responseHeaders.set("Pragma", "no-cache");
    }


    return new NextResponse(upstreamBody, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Public Proxy Error:", error);
    return NextResponse.json({ message: "Error de conexión con el backend" }, { status: 502 });
  }
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  await context.params;
  return forward(request, "GET");
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  await context.params;
  return forward(request, "POST");
}

// PUT, PATCH, DELETE no están disponibles en rutas públicas (sin autenticación)
