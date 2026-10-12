import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rutas que requieren estar logueado (Protegidas)
  const protectedRoutes: string[] = []
  
  // Rutas que NO debes ver si ya estás logueado (Solo invitados)
  const authRoutes = ['/auth/login']

  // Verificamos si existe la cookie de sesión (refresh token dura 7 días)
  // Usamos ps_refresh porque es el indicador más fiable de "sesión activa"
  const hasSession = request.cookies.has('ps_refresh')

  // CASO 1: Usuario NO logueado intenta entrar a ruta protegida
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!hasSession) {
      const url = new URL('/auth/login', request.url)
      // Guardamos la ruta a la que intentaba ir para redirigirlo allí después
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  // CASO 2: Usuario Logueado intenta entrar a páginas de login/registro
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (hasSession) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Only login currently needs session routing. Public pages and media can
  // be served directly without invoking the session proxy on every request.
  matcher: ['/auth/login'],
}
