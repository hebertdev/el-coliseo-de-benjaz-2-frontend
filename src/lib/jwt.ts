export type JwtPayload = {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
};

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const base64 = normalized + pad;

  if (typeof atob === "function") {
    return atob(base64);
  }

  return Buffer.from(base64, "base64").toString("binary");
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getJwtExpSeconds(token: string): number | null {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  return typeof exp === "number" ? exp : null;
}

export function getJwtMaxAgeSeconds(token: string, fallbackSeconds: number): number {
  const exp = getJwtExpSeconds(token);
  if (!exp) return fallbackSeconds;

  const nowSeconds = Math.floor(Date.now() / 1000);
  const maxAge = exp - nowSeconds;
  return maxAge > 0 ? maxAge : 0;
}

export function isJwtExpired(token: string, clockSkewSeconds = 15): boolean {
  const exp = getJwtExpSeconds(token);
  // Si no hay exp, el token es malformado → tratar como expirado (seguro por defecto)
  if (!exp) return true;

  const nowSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowSeconds + clockSkewSeconds;
}
