import { Song } from "@/types/music";

/**
 * SMC Singhs Music Co - Production Live Mirror Engine
 * Strict Zero-Mock: Pure dynamic network mirror aggregation.
 */

// Clean high-resolution vinyl cover fallback from Unsplash (never creator artwork)
const CLEAN_VINYL_COVER =
  "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=600&q=80";

/**
 * Decodes and sanitizes common HTML entities and numerical escape sequences.
 */
export const sanitizeHtml = (str: string = ""): string => {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#38;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch {
        return "";
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return "";
      }
    })
    .trim();
};

/**
 * Resolves the highest quality audio URL (preferring 320kbps, then 160kbps, then highest available).
 */
const resolveAudioUrl = (item: any): string => {
  if (!item) return "";

  if (Array.isArray(item.downloadUrl) && item.downloadUrl.length > 0) {
    // 1. Look for 320kbps
    const stream320 = item.downloadUrl.find(
      (d: any) =>
        d &&
        (d.quality === "320kbps" ||
          d.quality === "320" ||
          String(d.quality).includes("320"))
    );
    const url320 = stream320?.url || stream320?.link;
    if (url320 && typeof url320 === "string" && url320.startsWith("http")) {
      return url320;
    }

    // 2. Fallback to 160kbps
    const stream160 = item.downloadUrl.find(
      (d: any) =>
        d &&
        (d.quality === "160kbps" ||
          d.quality === "160" ||
          String(d.quality).includes("160"))
    );
    const url160 = stream160?.url || stream160?.link;
    if (url160 && typeof url160 === "string" && url160.startsWith("http")) {
      return url160;
    }

    // 3. Fallback to highest available quality in the array (last element)
    for (let i = item.downloadUrl.length - 1; i >= 0; i--) {
      const candidate = item.downloadUrl[i]?.url || item.downloadUrl[i]?.link;
      if (candidate && typeof candidate === "string" && candidate.startsWith("http")) {
        return candidate;
      }
    }
  } else if (typeof item.downloadUrl === "string" && item.downloadUrl.startsWith("http")) {
    return item.downloadUrl;
  } else if (typeof item.media_url === "string" && item.media_url.startsWith("http")) {
    return item.media_url;
  } else if (
    typeof item.url === "string" &&
    item.url.startsWith("http") &&
    (item.url.includes(".mp4") || item.url.includes(".mp3"))
  ) {
    return item.url;
  }

  return "";
};

/**
 * Resolves the highest resolution album/track artwork (fallback to clean vinyl).
 */
const resolveCoverImage = (item: any): string => {
  if (!item) return CLEAN_VINYL_COVER;

  if (Array.isArray(item.image) && item.image.length > 0) {
    // Prefer 500x500
    const img500 = item.image.find(
      (img: any) =>
        img &&
        (img.quality === "500x500" ||
          img.quality === "500" ||
          String(img.quality).includes("500"))
    );
    const url500 = img500?.url || img500?.link;
    if (url500 && typeof url500 === "string" && url500.startsWith("http")) {
      return url500;
    }

    // Fallback to highest element in array
    const highestImg = item.image[item.image.length - 1];
    const candidate = highestImg?.url || highestImg?.link;
    if (candidate && typeof candidate === "string" && candidate.startsWith("http")) {
      return candidate;
    }
  } else if (typeof item.image === "string" && item.image.startsWith("http")) {
    // Upgrade Saavn standard 150x150 CDN images to 500x500 if applicable
    return item.image.replace(/150x150\.jpg/gi, "500x500.jpg");
  }

  return CLEAN_VINYL_COVER;
};

/**
 * Parses raw API items into validated Song objects.
 * Drops any song where audioUrl is missing or invalid.
 */
export const parseSongs = (items: any[]): Song[] => {
  if (!Array.isArray(items)) return [];
  const songs: Song[] = [];

  for (const item of items) {
    if (!item) continue;

    // Resolve audio stream (320kbps -> 160kbps -> highest)
    const audioUrl = resolveAudioUrl(item);

    // Drop any song where audioUrl is missing or invalid
    if (!audioUrl || typeof audioUrl !== "string" || !audioUrl.startsWith("http")) {
      continue;
    }

    // Resolve cover artwork
    const imageUrl = resolveCoverImage(item);

    // Sanitize title & artist metadata
    const rawTitle = item.name || item.title || item.song || "Unknown Track";
    const title = sanitizeHtml(String(rawTitle));

    const rawArtists =
      item.primaryArtists ||
      item.primary_artists ||
      item.artists ||
      item.more_info?.singers ||
      "Singhs Music Co";
    const primaryArtists = sanitizeHtml(String(rawArtists));

    const rawAlbum =
      typeof item.album === "object"
        ? item.album?.name || "Single"
        : item.album || "Single";
    const albumName = sanitizeHtml(String(rawAlbum));

    const songId = String(
      item.id || `smc-${Math.random().toString(36).substring(2, 10)}`
    );

    songs.push({
      ...item,
      id: songId,
      name: title,
      title: title,
      primaryArtists: primaryArtists,
      artists: primaryArtists,
      album: albumName,
      imageUrl: imageUrl,
      audioUrl: audioUrl,
      duration: item.duration || 0,
      image: item.image || imageUrl,
      downloadUrl: item.downloadUrl || audioUrl,
    });
  }

  return songs;
};

/**
 * Multi-Mirror Endpoints fallback list:
 * saavn.me, saavn.dev, and jiosavan-api.vercel.app
 */
const MIRROR_ENDPOINTS = [
  (q: string) =>
    `https://saavn.me/api/search/songs?query=${encodeURIComponent(q)}&page=1&limit=30`,
  (q: string) =>
    `https://saavn.me/search/songs?query=${encodeURIComponent(q)}&page=1&limit=30`,
  (q: string) =>
    `https://saavn.dev/api/search/songs?query=${encodeURIComponent(q)}&page=1&limit=30`,
  (q: string) =>
    `https://jiosavan-api.vercel.app/api/search/songs?query=${encodeURIComponent(q)}`,
  (q: string) =>
    `https://jiosavan-api.vercel.app/search/songs?query=${encodeURIComponent(q)}`,
];

/**
 * Live search across mirrors with zero hardcoded mocks.
 */
export async function searchSongs(query: string): Promise<Song[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  for (let i = 0; i < MIRROR_ENDPOINTS.length; i++) {
    const buildUrl = MIRROR_ENDPOINTS[i];
    const url = buildUrl(cleanQuery);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const data = await res.json();
      const rawResults =
        data?.data?.results ||
        data?.data ||
        data?.results ||
        [];

      if (Array.isArray(rawResults) && rawResults.length > 0) {
        const parsed = parseSongs(rawResults);
        if (parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`[SMC Mirror Fail: ${url}]`, err);
    }
  }

  return [];
}

/**
 * Queries category/shelf tracks dynamically from live mirrors with cache: 'no-store'.
 */
export async function getLiveCategory(categoryQuery: string): Promise<Song[]> {
  return await searchSongs(categoryQuery);
}
