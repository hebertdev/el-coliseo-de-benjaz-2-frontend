import { getJwtMaxAgeSeconds } from "lib/jwt";
import { getApiUrl } from "lib/config";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Obtener y validar datos
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ message: "Email y contraseña requeridos" }, { status: 400 });
  }

  // 2. Petición al Backend
  let apiUrl: string;
  try {
    apiUrl = getApiUrl();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("Config Error:", errorMessage);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
  
  const res = await fetch(`${apiUrl}/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { 
        message: data.detail || "Credenciales inválidas",
        ...data 
      }, 
      { status: res.status }
    );
  }

  // 3. Preparar Cookies
  const response = NextResponse.json({ user: data.user }, { status: 200 });
  
  const secure = process.env.NODE_ENV === "production";
  const opts = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };
  
  // Calculamos tiempos de expiración
  const accessMaxAge = getJwtMaxAgeSeconds(data.access, 15 * 60); // 15 min
  const refreshMaxAge = getJwtMaxAgeSeconds(data.refresh, 7 * 24 * 60 * 60); // 7 días

  // 4. Guardar Cookies
  response.cookies.set("ps_access", data.access, { ...opts, maxAge: accessMaxAge });
  response.cookies.set("ps_refresh", data.refresh, { ...opts, maxAge: refreshMaxAge });

  if (data.user) {
    // Codificamos usuario en Base64Url (nativo de Node)
    const userStr = Buffer.from(JSON.stringify(data.user)).toString("base64url");
    response.cookies.set("ps_user", userStr, { ...opts, httpOnly: false, maxAge: refreshMaxAge });
  }

  return response;
}