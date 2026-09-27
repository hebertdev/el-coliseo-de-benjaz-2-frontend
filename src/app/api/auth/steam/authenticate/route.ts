import { getJwtMaxAgeSeconds } from "lib/jwt";
import { getApiUrl } from "lib/config";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const params = body.params || body;

  if (!params || Object.keys(params).length === 0) {
    return NextResponse.json(
      { message: "Parámetros de OpenID requeridos" },
      { status: 400 }
    );
  }

  let apiUrl: string;
  try {
    apiUrl = getApiUrl();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("Config Error:", errorMessage);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }

  const res = await fetch(`${apiUrl}/users/steam/authenticate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ params }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg =
      data.detail ||
      (typeof data === "string" ? data : "Fallo en la autenticación con Steam");
    return NextResponse.json(
      { message: errorMsg, ...data },
      { status: res.status }
    );
  }

  const response = NextResponse.json(
    { user: data.user, player_profile: data.player_profile },
    { status: 200 }
  );

  const secure = process.env.NODE_ENV === "production";
  const opts = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };

  const accessMaxAge = getJwtMaxAgeSeconds(data.access, 15 * 60);
  const refreshMaxAge = getJwtMaxAgeSeconds(data.refresh, 7 * 24 * 60 * 60);

  response.cookies.set("ps_access", data.access, { ...opts, maxAge: accessMaxAge });
  response.cookies.set("ps_refresh", data.refresh, { ...opts, maxAge: refreshMaxAge });

  if (data.user) {
    const userStr = Buffer.from(JSON.stringify(data.user)).toString("base64url");
    response.cookies.set("ps_user", userStr, { ...opts, httpOnly: false, maxAge: refreshMaxAge });
  }

  return response;
}
