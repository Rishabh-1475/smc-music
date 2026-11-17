import { Song } from "@/types/music";
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import CryptoJS from "crypto-js";
import curatedTracks from "./curatedTracks.json";

/**
 * SMC Singhs Music Co - Production Resilient Mirror Engine
 * Drop dead domains (purged saavn.me).
 * Multi-mirror fallbacks + DES audio decrypter + Robust unpacker.
 */

const CLEAN_VINYL_COVER =
  "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=600&q=80";

/**
 * Decodes and sanitizes HTML entities and escape sequences.
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
 * Decrypts JioSaavn DES-ECB encrypted media URLs into direct CDN streaming links.
 */
export const decryptMediaUrl = (encryptedMediaUrl: string): string => {
  if (!encryptedMediaUrl || typeof encryptedMediaUrl !== "string") return "";
  try {
    const key = CryptoJS.enc.Utf8.parse("38346591");
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedMediaUrl) },
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    const decryptedUrl = decrypted.toString(CryptoJS.enc.Utf8);
    if (decryptedUrl && decryptedUrl.startsWith("http")) {
      return decryptedUrl.replace("http://", "https://");
    }
  } catch (err) {
    // Silent fail if invalid cipher
  }
  return "";
};

/**
 * Flexible downloadUrl parser:
 * Inspects item.downloadUrl, item.media_url, item.url, item.download_url, and item.encrypted_media_url.
 * Extracts both 320kbps and 160kbps links.
 * Replaces 'http://' with 'https://' to avoid Android mixed-content blocks.
 */
const resolveAudioUrl = (item: any): string => {
  if (!item) return "";

  // 1. Direct DES decryption if encrypted_media_url is present
  if (item.encrypted_media_url) {
    const directUrl = decryptMediaUrl(item.encrypted_media_url);
    if (directUrl) {
      // Prioritize 320kbps, then 160kbps
      return directUrl.replace(/_96\.mp4|_48\.mp4|_12\.mp4|_160\.mp4/g, "_320.mp4");
    }
  }

  // 2. Inspect multiple potential download sources
  const downloadSources = [
    item.downloadUrl,
    item.download_url,
    item.downloadUrls,
    item.media_url,
    item.mediaUrl,
    item.url,
  ];

  for (const src of downloadSources) {
    if (!src) continue;

    // Array of quality/url objects
    if (Array.isArray(src) && src.length > 0) {
      // Look for 320kbps
      const q320 = src.find(
        (d: any) =>
          d &&
          (d.quality === "320kbps" ||
            d.quality === "320" ||
            String(d.quality).includes("320") ||
            String(d.bitrate).includes("320"))
      );
      const url320 = q320?.url || q320?.link;
      if (url320 && typeof url320 === "string" && url320.startsWith("http")) {
        return url320.replace("http://", "https://");
      }

      // Look for 160kbps
      const q160 = src.find(
        (d: any) =>
          d &&
          (d.quality === "160kbps" ||
            d.quality === "160" ||
            String(d.quality).includes("160") ||
            String(d.bitrate).includes("160"))
      );
      const url160 = q160?.url || q160?.link;
      if (url160 && typeof url160 === "string" && url160.startsWith("http")) {
        return url160.replace("http://", "https://");
      }

      // Fallback to highest quality available in array
      for (let i = src.length - 1; i >= 0; i--) {
        const candidate = src[i]?.url || src[i]?.link;
        if (candidate && typeof candidate === "string" && candidate.startsWith("http")) {
          return candidate.replace("http://", "https://");
        }
      }
    } else if (typeof src === "string" && src.startsWith("http")) {
      return src.replace("http://", "https://");
    }
  }

  return "";
};

/**
 * Resolves the highest resolution album/track artwork (fallback to clean vinyl).
 */
const resolveCoverImage = (item: any): string => {
  if (!item) return CLEAN_VINYL_COVER;

  const imageSources = [item.image, item.images, item.imageUrl, item.image_url];

  for (const src of imageSources) {
    if (!src) continue;

    if (Array.isArray(src) && src.length > 0) {
      const img500 = src.find(
        (img: any) =>
          img &&
          (img.quality === "500x500" ||
            img.quality === "500" ||
            String(img.quality).includes("500"))
      );
      const url500 = img500?.url || img500?.link;
      if (url500 && typeof url500 === "string" && url500.startsWith("http")) {
        return url500.replace("http://", "https://");
      }

      const highestImg = src[src.length - 1];
      const candidate = highestImg?.url || highestImg?.link;
      if (candidate && typeof candidate === "string" && candidate.startsWith("http")) {
        return candidate.replace("http://", "https://");
      }
    } else if (typeof src === "string" && src.startsWith("http")) {
      return src
        .replace(/150x150\.jpg/gi, "500x500.jpg")
        .replace(/50x50\.jpg/gi, "500x500.jpg")
        .replace("http://", "https://");
    }
  }

  return CLEAN_VINYL_COVER;
};

/**
 * Robust JSON Unpacker:
 * Checks across data structures:
 * res.data.results, res.data.songs?.results, res.data, res.results, res.songs?.results, res.data.songs
 */
const unpackResults = (json: any): any[] => {
  if (!json) return [];
  if (Array.isArray(json)) return json;

  if (Array.isArray(json.data?.results)) return json.data.results;
  if (Array.isArray(json.data?.songs?.results)) return json.data.songs.results;
  if (Array.isArray(json.data?.songs)) return json.data.songs;
  if (Array.isArray(json.data)) return json.data;
  if (Array.isArray(json.results)) return json.results;
  if (Array.isArray(json.songs?.results)) return json.songs.results;
  if (Array.isArray(json.songs)) return json.songs;

  return [];
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

    const audioUrl = resolveAudioUrl(item);

    // Drop any song where audioUrl is missing or invalid
    if (!audioUrl || typeof audioUrl !== "string" || !audioUrl.startsWith("http")) {
      continue;
    }

    const imageUrl = resolveCoverImage(item);

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
      downloadUrl: item.downloadUrl || [
        { quality: "320kbps", url: audioUrl },
        { quality: "160kbps", url: audioUrl.replace("_320.mp4", "_160.mp4") },
      ],
    });
  }

  return songs;
};

/**
 * Resilient Endpoints:
 * - Primary: https://saavn.dev/api/search/songs?query=${cleanQuery}
 * - Secondary: https://saavn.dev/api/search?query=${cleanQuery}
 * - Tertiary: https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${cleanQuery}
 * - Quaternary (Direct Unofficial Mirror): https://saavn-api.vercel.app/api/search/songs?query=${cleanQuery}
 * - Additional fallbacks for maximum resilience
 */
const buildEndpoints = (cleanQuery: string): string[] => [
  `https://saavn.dev/api/search/songs?query=${cleanQuery}`,
  `https://saavn.dev/api/search?query=${cleanQuery}`,
  `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${cleanQuery}`,
  `https://saavn-api.vercel.app/api/search/songs?query=${cleanQuery}`,
  `https://jiosaavn-api-privatecvc2.vercel.app/api/search/songs?query=${cleanQuery}`,
  `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&n=20&p=1&q=${cleanQuery}`,
];

/**
 * Live search across resilient mirrors with 4000ms fast failover.
 */
export async function searchSongs(query: string): Promise<Song[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const cleanQuery = encodeURIComponent(trimmed);
  const endpoints = buildEndpoints(cleanQuery);

  const isNative = typeof window !== "undefined" && Capacitor.isNativePlatform();

  for (const url of endpoints) {
    try {
      let data: any = null;

      if (isNative) {
        // Native mobile request via CapacitorHttp (Bypasses WebView CORS completely)
        const capRes = await CapacitorHttp.get({
          url,
          headers: {
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
          },
          connectTimeout: 4000,
          readTimeout: 4000,
        });

        if (capRes.status >= 200 && capRes.status < 300) {
          data = typeof capRes.data === "string" ? JSON.parse(capRes.data) : capRes.data;
        }
      } else {
        // Web standard fetch with 4000ms AbortController timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(url, {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          data = await res.json();
        }
      }

      if (data) {
        const rawResults = unpackResults(data);
        if (Array.isArray(rawResults) && rawResults.length > 0) {
          const parsed = parseSongs(rawResults);
          if (parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (err) {
      // Fast failover to next mirror
    }
  }

  // Fallback: search within curated high-bitrate tracks if mirrors are offline
  const allCurated: Song[] = [
    ...(curatedTracks.hindi as Song[]),
    ...(curatedTracks.punjabi as Song[]),
    ...(curatedTracks.romance as Song[]),
  ];

  const matched = allCurated.filter(
    (s) =>
      s.name.toLowerCase().includes(trimmed.toLowerCase()) ||
      s.primaryArtists.toLowerCase().includes(trimmed.toLowerCase()) ||
      (typeof s.album === "string" && s.album.toLowerCase().includes(trimmed.toLowerCase()))
  );

  return matched;
}

/**
 * Queries category/shelf tracks dynamically from live mirrors with curated baseline resilience.
 */
export async function getLiveCategory(categoryQuery: string): Promise<Song[]> {
  const cleanCategory = categoryQuery
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 1. Try querying mirrors live
  try {
    const liveSongs = await searchSongs(cleanCategory);
    if (liveSongs && liveSongs.length > 0) {
      return liveSongs;
    }
  } catch (e) {
    // proceed to curated baseline
  }

  // 2. High-bitrate baseline instant fallback (guarantees zero infinite loading skeletons)
  const lower = categoryQuery.toLowerCase();
  if (lower.includes("hindi") || lower.includes("trending")) {
    return curatedTracks.hindi as Song[];
  }
  if (lower.includes("punjabi") || lower.includes("hype")) {
    return curatedTracks.punjabi as Song[];
  }
  if (lower.includes("romance") || lower.includes("bollywood")) {
    return curatedTracks.romance as Song[];
  }

  return (curatedTracks.hindi as Song[]) || [];
}
