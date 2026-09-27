import { getJwtMaxAgeSeconds } from "lib/jwt";
import { getApiUrl } from "lib/config";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const REFRESH_COOKIE = "ps_refresh";
const ACCESS_COOKIE = "ps_access";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  let apiUrl: string;
  try {
    apiUrl = getApiUrl();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
  
  const res = await fetch(`${apiUrl}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    const response = NextResponse.json({ message: "Sesión expirada" }, { status: 401 });
    response.cookies.delete(REFRESH_COOKIE);
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete("ps_user");
    return response;
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  const secure = process.env.NODE_ENV === "production";
  const opts = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };

  // Guardar Access Token (Django devuelve 'access')
  if (data.access) {
      response.cookies.set(ACCESS_COOKIE, data.access, { 
          ...opts, 
          maxAge: getJwtMaxAgeSeconds(data.access, 15 * 60) 
      });
  }

  // Guardar Refresh Token (Si hay rotación)
  if (data.refresh) {
    response.cookies.set(REFRESH_COOKIE, data.refresh, { 
        ...opts, 
        maxAge: getJwtMaxAgeSeconds(data.refresh, 7 * 24 * 60 * 60) 
    });
  }

  return response;
}