import { Song } from "@/types/music";
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import CryptoJS from "crypto-js";
import curatedTracks from "./curatedTracks.json";

/**
 * SMC Singhs Music Co - YouTube Music Premium Streaming API Service
 * 3500ms Fast Failover • 320kbps Audio Pipeline • Parallel allSettled Feeds
 */

// High-resolution clean vinyl fallback (NEVER creator image for song artwork)
const HIGH_RES_VINYL_COVER =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

/**
 * Decodes and sanitizes HTML entities and numerical escape sequences.
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
  } catch {
    // Ignore invalid cipher
  }
  return "";
};

/**
 * Robust stream parser:
 * Extracts 320kbps audio (from downloadUrl array or media_url or url or DES decrypter).
 * Forces 'https://' across all stream URLs to avoid Android mixed-content blocks.
 */
const resolveAudioUrl = (item: any): string => {
  if (!item) return "";

  // 1. Direct DES decryption if encrypted_media_url is present
  if (item.encrypted_media_url) {
    const directUrl = decryptMediaUrl(item.encrypted_media_url);
    if (directUrl) {
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

      // Fallback to 160kbps
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
 * Resolves highest-resolution 500x500 cover art.
 * Fallback to high-res vinyl artwork (NEVER creator photo for song artwork).
 */
const resolveCoverImage = (item: any): string => {
  if (!item) return HIGH_RES_VINYL_COVER;

  const imageSources = [item.image, item.images, item.imageUrl, item.image_url];

  for (const src of imageSources) {
    if (!src) continue;

    if (Array.isArray(src) && src.length > 0) {
      // 500x500 at last index or matching quality
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

      // Last element is highest quality in Saavn APIs
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

  return HIGH_RES_VINYL_COVER;
};

/**
 * Unpacks response arrays across various mirror schemas.
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
 * Normalizes raw API items into validated Song models.
 * Filters out any track lacking a valid audio URL.
 */
export const parseSongs = (items: any[]): Song[] => {
  if (!Array.isArray(items)) return [];
  const songs: Song[] = [];

  for (const item of items) {
    if (!item) continue;

    const audioUrl = resolveAudioUrl(item);

    // Filter out any track lacking a valid audio URL
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
      hasLyrics: !!item.hasLyrics || !!item.lyrics,
      lyrics: item.lyrics || undefined,
      year: item.year || undefined,
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
 * Active JioSaavn Mirror Endpoints:
 * - Mirror 1: https://saavn.dev/api/search/songs?query=${cleanQuery}&limit=30
 * - Mirror 2: https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${cleanQuery}
 * - Mirror 3: https://saavn-api.vercel.app/api/search/songs?query=${cleanQuery}
 */
const buildEndpoints = (cleanQuery: string): string[] => [
  `https://saavn.dev/api/search/songs?query=${cleanQuery}&limit=30`,
  `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${cleanQuery}`,
  `https://saavn-api.vercel.app/api/search/songs?query=${cleanQuery}`,
  `https://saavn.dev/api/search?query=${cleanQuery}`,
  `https://jiosaavn-api-privatecvc2.vercel.app/api/search/songs?query=${cleanQuery}`,
  `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&n=30&p=1&q=${cleanQuery}`,
];

/**
 * Searches tracks with 3500ms AbortController timeout per request.
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
          connectTimeout: 3500,
          readTimeout: 3500,
        });

        if (capRes.status >= 200 && capRes.status < 300) {
          data = typeof capRes.data === "string" ? JSON.parse(capRes.data) : capRes.data;
        }
      } else {
        // Web standard fetch with 3500ms AbortController timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

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
    } catch {
      // Fast failover to next mirror
    }
  }

  // Fallback: search within curated high-bitrate tracks if mirrors are offline
  const allCurated: Song[] = [
    ...(curatedTracks.quickPicks as Song[]),
    ...(curatedTracks.trendingHits as Song[]),
    ...(curatedTracks.moodStations as Song[]),
    ...(curatedTracks.workoutHype as Song[]),
    ...(curatedTracks.chillVibes as Song[]),
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
  } catch {
    // proceed to curated baseline
  }

  // 2. High-bitrate baseline instant fallback (guarantees zero infinite loading skeletons)
  const lower = categoryQuery.toLowerCase();
  if (lower.includes("trending") || lower.includes("hindi") || lower.includes("quick")) {
    return (curatedTracks.quickPicks as Song[]) || (curatedTracks.hindi as Song[]);
  }
  if (lower.includes("arijit") || lower.includes("hits") || lower.includes("romance")) {
    return (curatedTracks.trendingHits as Song[]) || (curatedTracks.romance as Song[]);
  }
  if (lower.includes("sidhu") || lower.includes("punjabi") || lower.includes("mood") || lower.includes("party")) {
    return (curatedTracks.moodStations as Song[]) || (curatedTracks.punjabi as Song[]);
  }
  if (lower.includes("gym") || lower.includes("workout") || lower.includes("hype")) {
    return (curatedTracks.workoutHype as Song[]);
  }
  if (
    lower.includes("lo-fi") ||
    lower.includes("lofi") ||
    lower.includes("chill") ||
    lower.includes("midnight")
  ) {
    return (curatedTracks.chillVibes as Song[]);
  }

  return (curatedTracks.quickPicks as Song[]) || [];
}

/**
 * YouTube Music Premium Home Feed:
 * Fetches in parallel using Promise.allSettled:
 * - quickPicks: "Trending Hindi 2026"
 * - trending: "Arijit Singh Hits"
 * - workout: "Gym Workout Hype"
 * - chill: "Lo-Fi Midnight Beats"
 * - party: "Party Dance Hits"
 */
export async function getHomeFeed(): Promise<{
  quickPicks: Song[];
  trending: Song[];
  workout: Song[];
  chill: Song[];
  party: Song[];
}> {
  const settled = await Promise.allSettled([
    getLiveCategory("Trending Hindi 2026"),
    getLiveCategory("Arijit Singh Hits"),
    getLiveCategory("Gym Workout Hype"),
    getLiveCategory("Lo-Fi Midnight Beats"),
    getLiveCategory("Party Dance Hits"),
  ]);

  const [qp, tr, wo, ch, pa] = settled.map((res, idx) => {
    if (res.status === "fulfilled" && Array.isArray(res.value) && res.value.length > 0) {
      return res.value;
    }
    const fallbacks = [
      curatedTracks.quickPicks,
      curatedTracks.trendingHits,
      curatedTracks.workoutHype,
      curatedTracks.chillVibes,
      curatedTracks.moodStations,
    ];
    return (fallbacks[idx] as Song[]) || [];
  });

  return {
    quickPicks: qp.length > 0 ? qp : (curatedTracks.quickPicks as Song[]),
    trending: tr.length > 0 ? tr : (curatedTracks.trendingHits as Song[]),
    workout: wo.length > 0 ? wo : (curatedTracks.workoutHype as Song[]),
    chill: ch.length > 0 ? ch : (curatedTracks.chillVibes as Song[]),
    party: pa.length > 0 ? pa : (curatedTracks.moodStations as Song[]),
  };
}

/**
 * Backward compatibility alias for getHomeFeed
 */
export async function getYTMusicHomeFeeds(): Promise<{
  quickPicks: Song[];
  trendingHits: Song[];
  moodStations: Song[];
  workoutHype: Song[];
  chillVibes: Song[];
}> {
  const feed = await getHomeFeed();
  return {
    quickPicks: feed.quickPicks,
    trendingHits: feed.trending,
    moodStations: feed.party,
    workoutHype: feed.workout,
    chillVibes: feed.chill,
  };
}

/**
 * Fetches lyrics for a track, or returns synchronized formatted verses.
 */
export async function getLyrics(songId: string): Promise<string> {
  if (!songId) {
    return "[00:00.00] ♪ Instrumental / Lyrics not available ♪";
  }

  const cleanId = encodeURIComponent(songId.trim());
  const lyricEndpoints = [
    `https://saavn.dev/api/lyrics?id=${cleanId}`,
    `https://jiosaavn-api-privatecvc2.vercel.app/lyrics?id=${cleanId}`,
    `https://saavn-api.vercel.app/api/lyrics?id=${cleanId}`,
  ];

  for (const url of lyricEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const lyrics =
          json?.data?.lyrics ||
          json?.lyrics ||
          (typeof json?.data === "string" ? json.data : null);

        if (lyrics && typeof lyrics === "string" && lyrics.trim().length > 10) {
          return sanitizeHtml(lyrics.replace(/<br\s*\/?>/gi, "\n"));
        }
      }
    } catch {
      // Continue to next mirror
    }
  }

  // Synchronized fallback lyrics
  return [
    "[00:00.00] ♪ SMC Singhs Music Co ♪",
    "[00:08.00] High-Fidelity 320kbps Lossless Stream",
    "[00:20.00] Studio Master Quality Audio",
    "[00:35.00] Synchronized lyrics powered by SMC Music",
    "[00:50.00] Enjoy the listening experience",
    "[01:10.00] ♪ ♪ ♪",
  ].join("\n");
}
