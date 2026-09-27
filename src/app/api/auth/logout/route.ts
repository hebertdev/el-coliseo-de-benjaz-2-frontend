import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getApiUrl } from "lib/config";

const ACCESS_COOKIE = "ps_access";
const REFRESH_COOKIE = "ps_refresh";
const USER_COOKIE = "ps_user";

export async function POST() {
  // Blacklist el token en el backend si existe
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    try {
      const apiUrl = getApiUrl();
      await fetch(`${apiUrl}/token/blacklist/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
        cache: "no-store",
      });
    } catch (error) {
      console.error("Error blacklisting token on logout:", error);
      // Continuamos con el logout local incluso si el backend falla
    }
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set(USER_COOKIE, "", { httpOnly: false, path: "/", maxAge: 0 });
  
  return response;
}
