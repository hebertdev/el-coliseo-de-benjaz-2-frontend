import { isJwtExpired } from "lib/jwt";
import { NextResponse, type NextRequest } from "next/server";

const ACCESS_COOKIE = "ps_access";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const access = request.cookies.get(ACCESS_COOKIE)?.value ?? null;

  const hasValidAccess = access ? !isJwtExpired(access) : false;

  if (pathname.startsWith("/dashboard")) {
    if (!hasValidAccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/auth/login" && hasValidAccess) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login"],
};
