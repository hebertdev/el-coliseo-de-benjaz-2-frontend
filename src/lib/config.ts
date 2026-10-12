export function getApiUrl(): string {
  const apiUrl = process.env.API_URL;
  
  if (!apiUrl) {
    throw new Error("API_URL is not defined in environment variables. Please check your .env file.");
  }

  // Remove trailing slash if present to ensure consistency
  return apiUrl.replace(/\/$/, "");
}

/**
 * Resolves backed-up media to files served from public/media.
 * Keeps unrelated external image URLs unchanged.
 */
export function normalizeMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const legacyMediaUrl = /^https?:\/\/(?:elcoliseoapi\.hebertdev\.com|localhost:8000|127\.0\.0\.1:8000)(\/media\/.*)$/;
  const legacyMatch = url.match(legacyMediaUrl);
  if (legacyMatch) return legacyMatch[1];

  if (url.startsWith("/media/")) {
    return url;
  }

  if (url.startsWith("media/")) {
    return `/${url}`;
  }

  if (url.startsWith("teams/") || url.startsWith("players/") || url.startsWith("sponsors/")) {
    return `/media/${url}`;
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
