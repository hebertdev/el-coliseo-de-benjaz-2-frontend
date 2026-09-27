export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getApiUrl } from "lib/config";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ACCESS_COOKIE = "ps_access";

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
  const access = (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
  if (!access) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const incoming = new URL(request.url);
  const prefix = "/api/backend";
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
  headers.set("authorization", `Bearer ${access}`);

  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const init: RequestInit = {
    method,
    headers,
    cache: "no-store",
  };

  if (method !== "GET" && method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const upstream = await fetch(upstreamUrl, init);
    const upstreamBody = await upstream.arrayBuffer();

    const responseHeaders = new Headers();
    const upstreamContentType = upstream.headers.get("content-type");
    if (upstreamContentType) responseHeaders.set("content-type", upstreamContentType);

    responseHeaders.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    responseHeaders.set("Pragma", "no-cache");
    responseHeaders.set("Expires", "0");

    return new NextResponse(upstreamBody, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy Error:", error);
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

export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> }) {
  await context.params;
  return forward(request, "PUT");
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  await context.params;
  return forward(request, "PATCH");
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  await context.params;
  return forward(request, "DELETE");
}
