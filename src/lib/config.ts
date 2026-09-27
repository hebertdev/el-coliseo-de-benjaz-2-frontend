export function getApiUrl(): string {
  const apiUrl = process.env.API_URL;
  
  if (!apiUrl) {
    throw new Error("API_URL is not defined in environment variables. Please check your .env file.");
  }

  // Remove trailing slash if present to ensure consistency
  return apiUrl.replace(/\/$/, "");
}

/**
 * Normalizes any media URL (player avatar, team logo, etc.):
 * - Replaces localhost:8000 with production domain when running in production or client side.
 * - Expands relative /media/... paths.
 */
export function normalizeMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const isBrowser = typeof window !== "undefined";
  const isLocalhost = isBrowser
    ? window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    : process.env.NODE_ENV !== "production";

  if (!isLocalhost && (url.includes("localhost:8000") || url.includes("127.0.0.1:8000"))) {
    const parts = url.split("/media/");
    if (parts.length > 1) {
      return `https://elcoliseoapi.hebertdev.com/media/${parts[1]}`;
    }
  }

  const base = isLocalhost ? "http://localhost:8000" : "https://elcoliseoapi.hebertdev.com";

  if (url.startsWith("/media/")) {
    return `${base}${url}`;
  }

  if (url.startsWith("media/")) {
    return `${base}/${url}`;
  }

  if (url.startsWith("teams/") || url.startsWith("players/") || url.startsWith("sponsors/")) {
    return `${base}/media/${url}`;
  }

  return url;
}

/**
 * Recursively normalizes all media URLs in an object or array.
 */
export function deepNormalizeMediaUrls<T>(obj: T): T {
  if (!obj || typeof obj !== "object") {
    if (typeof obj === "string") {
      return normalizeMediaUrl(obj) as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepNormalizeMediaUrls(item)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      if (
        key.includes("avatar") ||
        key.includes("logo") ||
        key.endsWith("_url") ||
        value.startsWith("/media/") ||
        value.includes("localhost:8000/media/") ||
        value.includes("127.0.0.1:8000/media/")
      ) {
        result[key] = normalizeMediaUrl(value);
      } else {
        result[key] = value;
      }
    } else if (typeof value === "object" && value !== null) {
      result[key] = deepNormalizeMediaUrls(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
