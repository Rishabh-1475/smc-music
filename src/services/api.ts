import { Song } from "@/types/music";
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import CryptoJS from "crypto-js";
import curatedTracks from "./curatedTracks.json";

/**
 * RhythmX - Next-Generation Dynamic Media Engine
 * Dynamic Pagination • Seed Discovery • Endless Autoplay Radio • Fault-Tolerant Mirror Racing
 */

const HIGH_RES_VINYL_COVER =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

// Renowned Hitmakers & Artists for Popularity Scoring
const RENOWNED_HITMAKERS = new Set([
  "arijit singh",
  "sidhu moose wala",
  "diljit dosanjh",
  "karan aujla",
  "shubh",
  "ap dhillon",
  "badshah",
  "yo yo honey singh",
  "pritam",
  "atif aslam",
  "neha kakkar",
  "shreya ghoshal",
  "jubin nautiyal",
  "b praak",
  "sonu nigam",
  "anirudh ravichander",
  "a.r. rahman",
  "ar rahman",
  "pawan singh",
  "khesari lal yadav",
  "diler kharkiya",
  "gulzaar chhaniwala",
  "renuka panwar",
  "the weeknd",
  "drake",
  "eminem",
  "imagine dragons",
  "kordhell",
  "alan walker",
  "taylor swift",
  "bts",
  "justin bieber",
  "ed sheeran",
  "martin garrix",
  "david guetta",
  "dua lipa",
  "travis scott",
  "post malone",
  "kendrick lamar",
]);

// Dynamic Curated Rotation Pools for Regional & Genre Seeds
const DYNAMIC_ROTATION_POOLS: Record<string, string[]> = {
  punjabi: [
    "Trending Punjabi 2026",
    "Latest Punjabi Hits",
    "Punjabi Pop Classics",
    "Sidhu Moose Wala Radio",
    "AP Dhillon Radio",
    "Karan Aujla Essentials",
    "Shubh Punjabi Hits",
    "Diljit Dosanjh Essentials",
  ],
  bhojpuri: [
    "Bhojpuri Superhits",
    "Pawan Singh Radio",
    "Khesari Lal Hits",
    "Bhojpuri Trending Viral",
    "Bhojpuri Acoustic Melodies",
    "Bhojpuri Dance Dhamaka",
  ],
  haryanvi: [
    "Haryanvi Top Hits 2026",
    "Diler Kharkiya Radio",
    "Renuka Panwar Hits",
    "Haryanvi Ragni Mashup",
    "Gulzaar Chhaniwala Hype",
  ],
  hindi: [
    "Arijit Singh Radio",
    "Bollywood Romance Hits",
    "Trending Hindi Melodies 2026",
    "Pritam Essentials",
    "KK Soulful Radio",
    "Atif Aslam Hits",
    "Shreya Ghoshal Melodies",
  ],
  phonk: [
    "Brazilian Phonk 2026",
    "Drift Phonk Essentials",
    "Kordhell Phonk Radio",
    "Montagem Phonk Velocity",
    "GigaChad Phonk",
  ],
  fonk: [
    "Brazilian Phonk 2026",
    "Drift Phonk Essentials",
    "Montagem Phonk Velocity",
  ],
  gym: [
    "Gym Motivation Hindi Punjabi 2026",
    "Beast Mode Gym Hype",
    "High Energy Workout Phonk",
    "Hardstyle Gym Motivation",
    "Sidhu Moose Wala Gym Hype",
  ],
  workout: [
    "Gym Motivation Hindi Punjabi 2026",
    "Beast Mode Gym Hype",
    "High Energy Workout Phonk",
    "Hardstyle Gym Motivation",
  ],
  chill: [
    "Midnight Lo-Fi Hindi",
    "Bollywood Acoustic Chill",
    "Arijit Singh Soulful Chill",
    "Slowed and Reverb Trending",
    "Indian Indie Chill",
  ],
  relax: [
    "Midnight Lo-Fi Hindi",
    "Bollywood Acoustic Chill",
    "Arijit Singh Soulful Chill",
    "Peaceful Acoustic Guitar Hindi",
  ],
  global: [
    "Global Top 50 Hits",
    "The Weeknd Radio",
    "Billboard Hot 100",
    "EDM Dance Anthems",
    "Drake Radio",
    "Travis Scott Radio",
  ],
  party: [
    "Trending Club Bollywood Party",
    "Punjabi Hype Party Hits",
    "Commercial EDM Top Hits",
    "Bollywood Dance Mix 2026",
  ],
  romance: [
    "Top Bollywood Romance Hits",
    "Soulful Love Anthems",
    "Acoustic Romantic Hindi",
    "Arijit Singh Love Songs",
  ],
  kalyani: [
    "Kalyani Ragam Hits",
    "Kalyani Vachane",
    "Alaipayuthey Kalyani",
    "Kalyani Classical Renditions",
  ],
};

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
    .replace(/&copy;/g, "©")
    .replace(/&reg;/g, "®")
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
 * Sanitizes input queries while preserving unicode and multilingual characters.
 */
export const sanitizeQuery = (query: string): string => {
  if (!query || typeof query !== "string") return "";
  return query
    .trim()
    .replace(
      /[^\w\s\u0900-\u097F\u0A00-\u0A7F\u0B80-\u0BFF\u0C00-\u0C7F\u0D00-\u0D7F\uAC00-\uD7AF\u4E00-\u9FFF-]/gi,
      " "
    )
    .replace(/\s+/g, " ")
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
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedMediaUrl.trim()) },
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
 * Normalizes and extracts highest-fidelity 320kbps audio URL (falling back to 160kbps).
 * Forces 'https://' across all stream URLs to eliminate mixed-content blocks.
 */
const resolveAudioUrl = (item: any): string => {
  if (!item) return "";

  // 1. Direct or nested encrypted_media_url via DES-ECB decryption
  const cipher =
    item.encrypted_media_url ||
    item.more_info?.encrypted_media_url ||
    item.encrypted_drm_media_url;

  if (cipher && typeof cipher === "string") {
    const directUrl = decryptMediaUrl(cipher);
    if (directUrl) {
      return directUrl.replace(/_96\.mp4|_48\.mp4|_12\.mp4|_160\.mp4/g, "_320.mp4");
    }
  }

  // 2. downloadUrl array / objects
  const downloadSources = [
    item.downloadUrl,
    item.download_url,
    item.downloadUrls,
    item.more_info?.downloadUrl,
    item.media_url,
    item.mediaUrl,
    item.url,
  ];

  for (const src of downloadSources) {
    if (!src) continue;

    if (Array.isArray(src) && src.length > 0) {
      const highestQuality =
        src.find(
          (u: any) =>
            u?.quality === "320kbps" ||
            u?.bitrate === "320" ||
            u?.link?.includes("_320") ||
            u?.url?.includes("_320")
        ) ||
        src.find(
          (u: any) =>
            u?.quality === "160kbps" ||
            u?.bitrate === "160" ||
            u?.link?.includes("_160") ||
            u?.url?.includes("_160")
        ) ||
        src[src.length - 1];

      const url =
        typeof highestQuality === "string"
          ? highestQuality
          : highestQuality?.url || highestQuality?.link;

      if (url && typeof url === "string" && url.startsWith("http")) {
        return url
          .replace("http://", "https://")
          .replace(/_96\.mp4|_48\.mp4|_12\.mp4/g, "_320.mp4");
      }
    }

    if (typeof src === "string" && src.startsWith("http")) {
      return src
        .replace("http://", "https://")
        .replace(/_96\.mp4|_48\.mp4|_12\.mp4/g, "_320.mp4");
    }
  }

  // 3. Fallback preview stream
  if (item.media_preview_url && typeof item.media_preview_url === "string") {
    return item.media_preview_url
      .replace("http://", "https://")
      .replace(/_96\.mp4|_48\.mp4|_12\.mp4/g, "_320.mp4");
  }

  return "";
};

/**
 * Normalizes high-resolution artwork (500x500) and enforces HTTPS.
 * Never uses creator avatar for songs. Fallback to clean dark vinyl cover.
 */
const resolveImageUrl = (item: any): string => {
  if (!item) return HIGH_RES_VINYL_COVER;

  const imageSources = [
    item.image,
    item.images,
    item.imageUrl,
    item.more_info?.image,
    item.album_image,
  ];

  for (const src of imageSources) {
    if (!src) continue;

    if (Array.isArray(src) && src.length > 0) {
      const highestQuality =
        src.find((img: any) => img?.quality === "500x500" || img?.url?.includes("500x500")) ||
        src[src.length - 1];

      const url =
        typeof highestQuality === "string"
          ? highestQuality
          : highestQuality?.url || highestQuality?.link;

      if (url && typeof url === "string" && url.startsWith("http")) {
        return url
          .replace("http://", "https://")
          .replace(/150x150|50x50/g, "500x500");
      }
    }

    if (typeof src === "string" && src.startsWith("http")) {
      return src
        .replace("http://", "https://")
        .replace(/150x150|50x50/g, "500x500");
    }
  }

  return HIGH_RES_VINYL_COVER;
};

/**
 * Robust Song Object Normalizer with strict HTML cleaning and playable audio validation.
 */
const normalizeSong = (item: any): Song | null => {
  if (!item || typeof item !== "object") return null;

  const rawTitle =
    item.name ||
    item.title ||
    item.song ||
    item.more_info?.song ||
    item.more_info?.album ||
    "";
  const title = sanitizeHtml(rawTitle);
  if (!title) return null;

  const rawArtists =
    item.primaryArtists ||
    item.primary_artists ||
    item.singers ||
    item.more_info?.primary_artists ||
    item.more_info?.singers ||
    item.artist ||
    item.music ||
    "RhythmX Artist";
  const primaryArtists = sanitizeHtml(rawArtists);

  const rawAlbum =
    (typeof item.album === "object" ? item.album?.name : item.album) ||
    item.more_info?.album ||
    "Single";
  const album = sanitizeHtml(rawAlbum);

  const audioUrl = resolveAudioUrl(item);
  if (!audioUrl || !audioUrl.startsWith("http")) {
    return null;
  }

  const imageUrl = resolveImageUrl(item);
  const durationSec =
    parseInt(item.duration || item.more_info?.duration || "215", 10) || 215;

  const id = String(
    item.id || item.song_id || `${title}-${primaryArtists}`.replace(/\s+/g, "_")
  );

  return {
    id,
    name: title,
    title,
    album,
    primaryArtists,
    duration: durationSec,
    imageUrl,
    audioUrl,
    hasLyrics: Boolean(item.hasLyrics || item.more_info?.has_lyrics === "true"),
    lyrics: item.lyrics || "",
    year: String(item.year || item.more_info?.year || new Date().getFullYear()),
    playCount: parseInt(item.playCount || item.more_info?.play_count || "0", 10) || 0,
    language: String(item.language || item.more_info?.language || "").toLowerCase(),
  };
};

/**
 * Universal JSON Fetcher with 3500ms timeout via AbortController and Capacitor Native support.
 */
async function fetchWithTimeout(url: string, timeoutMs = 3500): Promise<any> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      const nativeResponse = await Promise.race([
        CapacitorHttp.get({
          url,
          headers: {
            Accept: "application/json, text/plain, */*",
            "User-Agent": "Mozilla/5.0 RhythmX Mobile Player",
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Native request timed out")), timeoutMs)
        ),
      ]);

      const data = (nativeResponse as any)?.data;
      if (typeof data === "string") {
        try {
          return JSON.parse(data);
        } catch {
          return null;
        }
      }
      return data;
    } catch {
      // Fall through to standard fetch
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fault-Tolerant API Racing across JioSaavn mirrors with dynamic pagination.
 * Timeout: 3500ms.
 */
async function queryEndpoints(query: string, page: number = 1, limit: number = 40): Promise<Song[]> {
  const encoded = encodeURIComponent(query);

  const endpointList = [
    {
      name: "Mirror 1 (saavn.dev)",
      url: `https://saavn.dev/api/search/songs?query=${encoded}&page=${page}&limit=${limit}`,
      parser: (json: any) => json?.data?.results || json?.data || [],
    },
    {
      name: "Fallback 1 (privatecvc2)",
      url: `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encoded}&page=${page}`,
      parser: (json: any) => json?.data?.results || json?.results || json?.data || [],
    },
    {
      name: "Fallback 2 (JioSaavn Official Gateway)",
      url: `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&n=${limit}&p=${page}&q=${encoded}`,
      parser: (json: any) => json?.results || [],
    },
    {
      name: "Fallback 3 (saavn-api.vercel.app)",
      url: `https://saavn-api.vercel.app/api/search/songs?query=${encoded}&page=${page}`,
      parser: (json: any) => json?.data?.results || json?.data || [],
    },
  ];

  for (const ep of endpointList) {
    try {
      const data = await fetchWithTimeout(ep.url, 3500);
      if (data) {
        const rawItems = ep.parser(data);
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          const songs: Song[] = [];
          for (const item of rawItems) {
            const normalized = normalizeSong(item);
            if (normalized) songs.push(normalized);
          }
          if (songs.length > 0) {
            return songs;
          }
        }
      }
    } catch {
      // Continue to next mirror on failure or timeout
    }
  }

  return [];
}

/**
 * Popularity & Relevance Ranking Engine with duplicate suppression.
 */
function rankAndSortSongs(songs: Song[], rawQuery: string): Song[] {
  if (!songs || songs.length === 0) return [];

  const query = rawQuery.toLowerCase().trim();
  const queryTokens = query.split(/\s+/).filter(Boolean);

  const scored = songs.map((song) => {
    let score = 0;
    const nameLower = song.name.toLowerCase();
    const artistsLower = song.primaryArtists.toLowerCase();
    const albumLower = song.album.toLowerCase();

    // Exact title match: +100
    if (nameLower === query) score += 100;
    else if (nameLower.startsWith(query)) score += 60;
    else if (nameLower.includes(query)) score += 40;

    // Token match
    for (const token of queryTokens) {
      if (nameLower.includes(token)) score += 20;
      if (artistsLower.includes(token)) score += 25;
      if (albumLower.includes(token)) score += 10;
    }

    // Artist prestige boost
    for (const hitmaker of RENOWNED_HITMAKERS) {
      if (artistsLower.includes(hitmaker)) {
        score += 35;
        break;
      }
    }

    // Play count weighting
    const plays = typeof song.playCount === "number" ? song.playCount : 0;
    if (plays > 10000000) score += 25;
    else if (plays > 1000000) score += 15;
    else if (plays > 100000) score += 8;

    return { ...song, score };
  });

  scored.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Deduplicate by normalized title & primary artist
  const seen = new Set<string>();
  const deduplicated: Song[] = [];

  for (const song of scored) {
    const key = `${song.name.toLowerCase()}-${song.primaryArtists.toLowerCase()}`.replace(
      /[^\w]/g,
      ""
    );
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(song);
    }
  }

  return deduplicated;
}

/**
 * Helper to pick a random item from an array.
 */
function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Helper to shuffle an array.
 */
function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ================================================================
// EXPORTS: RECOMMENDATION & ENDLESS AUTOPLAY RADIO ENGINE
// ================================================================

/**
 * A & C. searchSongs(query: string, page: number = 1): Promise<Song[]>
 * Supports infinite scrolling pagination and dynamic seeds for generic regional terms.
 */
export async function searchSongs(query: string, page: number = 1): Promise<Song[]> {
  const sanitized = sanitizeQuery(query);
  if (!sanitized) return [];

  const lowerQuery = sanitized.toLowerCase();

  // Check if query is a regional/subgenre seed keyword (e.g. "punjabi", "bhojpuri", "haryanvi", "phonk")
  let targetQueries: string[] = [sanitized];
  let pageOffset = page;

  for (const [key, pool] of Object.entries(DYNAMIC_ROTATION_POOLS)) {
    if (lowerQuery === key || (lowerQuery.length > 2 && lowerQuery.includes(key))) {
      // Pick dynamic rotating queries from the pool
      const shuffledPool = shuffleArray(pool);
      targetQueries = [shuffledPool[0], shuffledPool[1] || sanitized];
      // Jitter page offset slightly on page 1 so it never serves the exact same static list
      if (page === 1) {
        pageOffset = Math.floor(Math.random() * 3) + 1; // 1 to 3
      }
      break;
    }
  }

  // Fetch queries in parallel
  const promises = targetQueries.map((q) => queryEndpoints(q, pageOffset, 40));
  const settled = await Promise.allSettled(promises);

  const combined: Song[] = [];
  for (const res of settled) {
    if (res.status === "fulfilled" && res.value.length > 0) {
      combined.push(...res.value);
    }
  }

  if (combined.length > 0) {
    return rankAndSortSongs(combined, sanitized);
  }

  // Fallback if network drops completely
  if (lowerQuery.includes("punjabi") && curatedTracks.punjabi) {
    return curatedTracks.punjabi as unknown as Song[];
  }
  if ((lowerQuery.includes("phonk") || lowerQuery.includes("gym")) && curatedTracks.workoutHype) {
    return curatedTracks.workoutHype as unknown as Song[];
  }
  if (lowerQuery.includes("chill") && curatedTracks.chillVibes) {
    return curatedTracks.chillVibes as unknown as Song[];
  }

  return [];
}

/**
 * B. getDynamicAutoplayQueue(currentTrack: Song): Promise<Song[]>
 * Endless radio generator: creates an automated continuous 25+ track queue.
 * Never loops the same 2 songs.
 */
export async function getDynamicAutoplayQueue(currentTrack: Song): Promise<Song[]> {
  if (!currentTrack) {
    const shelves = await getHomeShelves();
    return shelves.heroTrending;
  }

  const leadArtist =
    currentTrack.primaryArtists?.split(",")[0]?.trim() || currentTrack.name;
  const cleanTitle = currentTrack.name || "";
  const lang = (currentTrack.language || "").toLowerCase();

  // 1. Parallel queries: Artist Radio, Similar Vibe, and Regional/Genre Seed
  const queriesToRun: { q: string; p: number }[] = [];

  if (leadArtist) {
    queriesToRun.push({ q: `${leadArtist} Radio`, p: Math.floor(Math.random() * 2) + 1 });
    queriesToRun.push({ q: `${leadArtist} Top Hits`, p: 1 });
  }

  // Detect regional or genre pool
  let matchingPool: string[] | null = null;
  const textContext = `${currentTrack.name} ${currentTrack.album || ""} ${leadArtist}`.toLowerCase();

  for (const [key, pool] of Object.entries(DYNAMIC_ROTATION_POOLS)) {
    if (lang.includes(key) || textContext.includes(key)) {
      matchingPool = pool;
      break;
    }
  }

  if (matchingPool) {
    const pickedSeed = pickRandom(matchingPool);
    queriesToRun.push({ q: pickedSeed, p: Math.floor(Math.random() * 3) + 1 });
  } else {
    // Default dynamic trending radio seed
    const defaultSeeds = [
      "Trending Global Hits 2026",
      "Arijit Singh Radio",
      "Sidhu Moose Wala Radio",
      "Bollywood Acoustic Melodies",
      "The Weeknd Radio",
    ];
    queriesToRun.push({ q: pickRandom(defaultSeeds), p: Math.floor(Math.random() * 3) + 1 });
  }

  // Run queries in parallel
  const settled = await Promise.allSettled(
    queriesToRun.map((item) => queryEndpoints(item.q, item.p, 30))
  );

  const pool: Song[] = [];
  for (const res of settled) {
    if (res.status === "fulfilled" && res.value.length > 0) {
      pool.push(...res.value);
    }
  }

  // Filter out current track and deduplicate
  const seenIds = new Set<string>([currentTrack.id]);
  const seenKeys = new Set<string>([
    `${currentTrack.name.toLowerCase()}-${currentTrack.primaryArtists.toLowerCase()}`.replace(
      /[^\w]/g,
      ""
    ),
  ]);

  const uniqueQueue: Song[] = [];

  for (const s of pool) {
    const key = `${s.name.toLowerCase()}-${s.primaryArtists.toLowerCase()}`.replace(
      /[^\w]/g,
      ""
    );
    if (!seenIds.has(s.id) && !seenKeys.has(key)) {
      seenIds.add(s.id);
      seenKeys.add(key);
      uniqueQueue.push(s);
    }
  }

  // If we have fewer than 25 tracks, query general trending fallback to top up
  if (uniqueQueue.length < 25) {
    const trendingFallback = await queryEndpoints("Trending Global Velocity 2026", 1, 30);
    for (const s of trendingFallback) {
      const key = `${s.name.toLowerCase()}-${s.primaryArtists.toLowerCase()}`.replace(
        /[^\w]/g,
        ""
      );
      if (!seenIds.has(s.id) && !seenKeys.has(key)) {
        seenIds.add(s.id);
        seenKeys.add(key);
        uniqueQueue.push(s);
      }
      if (uniqueQueue.length >= 25) break;
    }
  }

  // Offline fallback if network dropped
  if (uniqueQueue.length === 0) {
    return (curatedTracks.trendingHits as unknown as Song[]).filter(
      (s) => s.id !== currentTrack.id
    );
  }

  return uniqueQueue.slice(0, 30);
}

/**
 * getRadioForTrack(artistOrTitle: string): Promise<Song[]>
 * Backwards-compatible radio generator routing to getDynamicAutoplayQueue.
 */
export async function getRadioForTrack(artistOrTitle: string): Promise<Song[]> {
  const sanitized = sanitizeQuery(artistOrTitle);
  if (!sanitized) {
    const shelves = await getHomeShelves();
    return shelves.heroTrending;
  }

  // Create a minimal Song stub to seed getDynamicAutoplayQueue
  const stub: Song = {
    id: `stub_${Date.now()}`,
    name: sanitized,
    title: sanitized,
    primaryArtists: sanitized,
    album: "Radio",
    duration: 215,
    imageUrl: HIGH_RES_VINYL_COVER,
    audioUrl: "",
  };

  return getDynamicAutoplayQueue(stub);
}

/**
 * getCategoryFeed(category: string, page: number = 1): Promise<Song[]>
 * Dynamic category explorer with rotation pools and random page offsets.
 */
export async function getCategoryFeed(category: string, page: number = 1): Promise<Song[]> {
  const sanitized = sanitizeQuery(category).toLowerCase();
  if (!sanitized || sanitized === "all") {
    const home = await getHomeShelves();
    return home.heroTrending;
  }

  let queryPool = DYNAMIC_ROTATION_POOLS[sanitized];
  if (!queryPool) {
    for (const [key, pool] of Object.entries(DYNAMIC_ROTATION_POOLS)) {
      if (sanitized.includes(key)) {
        queryPool = pool;
        break;
      }
    }
  }

  const queries = queryPool || [category];
  const pageOffset = page === 1 ? Math.floor(Math.random() * 3) + 1 : page;

  const promises = queries.slice(0, 3).map((q) => queryEndpoints(q, pageOffset, 30));
  const settled = await Promise.allSettled(promises);

  const pool: Song[] = [];
  for (const res of settled) {
    if (res.status === "fulfilled" && res.value.length > 0) {
      pool.push(...res.value);
    }
  }

  if (pool.length > 0) {
    return rankAndSortSongs(pool, category).slice(0, 40);
  }

  // Curated fallbacks if offline
  if (sanitized.includes("gym") || sanitized.includes("phonk") || sanitized.includes("workout")) {
    return curatedTracks.workoutHype as unknown as Song[];
  }
  if (sanitized.includes("chill") || sanitized.includes("relax")) {
    return curatedTracks.chillVibes as unknown as Song[];
  }
  if (sanitized.includes("party")) {
    return curatedTracks.moodStations as unknown as Song[];
  }
  if (sanitized.includes("punjabi")) {
    return curatedTracks.punjabi as unknown as Song[];
  }
  if (sanitized.includes("romance")) {
    return curatedTracks.romance as unknown as Song[];
  }

  return curatedTracks.trendingHits as unknown as Song[];
}

/**
 * getHomeShelves(): Promise<{
 *   heroTrending: Song[];
 *   speedDial: Song[];
 *   quickPicks: Song[];
 *   gymPhonk: Song[];
 *   midnightChill: Song[];
 * }>
 * Dynamic homepage generator with rotating seeds and randomized page offsets.
 */
export async function getHomeShelves(): Promise<{
  heroTrending: Song[];
  speedDial: Song[];
  quickPicks: Song[];
  gymPhonk: Song[];
  midnightChill: Song[];
}> {
  const randOffset1 = Math.floor(Math.random() * 3) + 1;
  const randOffset2 = Math.floor(Math.random() * 3) + 1;
  const phonkSeed = pickRandom(DYNAMIC_ROTATION_POOLS.phonk);
  const chillSeed = pickRandom(DYNAMIC_ROTATION_POOLS.chill);
  const punjabiSeed = pickRandom(DYNAMIC_ROTATION_POOLS.punjabi);

  const [heroTrendingRes, quickPicksRes, gymPhonkRes, midnightChillRes] =
    await Promise.allSettled([
      queryEndpoints("Trending Global Velocity 2026", randOffset1, 30),
      queryEndpoints(punjabiSeed, randOffset2, 30),
      queryEndpoints(phonkSeed, 1, 30),
      queryEndpoints(chillSeed, 1, 30),
    ]);

  const heroTrending =
    heroTrendingRes.status === "fulfilled" && heroTrendingRes.value.length > 0
      ? heroTrendingRes.value
      : (curatedTracks.trendingHits as unknown as Song[]);

  const quickPicks =
    quickPicksRes.status === "fulfilled" && quickPicksRes.value.length > 0
      ? quickPicksRes.value
      : (curatedTracks.quickPicks as unknown as Song[]);

  const gymPhonk =
    gymPhonkRes.status === "fulfilled" && gymPhonkRes.value.length > 0
      ? gymPhonkRes.value
      : (curatedTracks.workoutHype as unknown as Song[]);

  const midnightChill =
    midnightChillRes.status === "fulfilled" && midnightChillRes.value.length > 0
      ? midnightChillRes.value
      : (curatedTracks.chillVibes as unknown as Song[]);

  const speedDial = heroTrending.slice(0, 9);

  return {
    heroTrending,
    speedDial,
    quickPicks: quickPicks.slice(0, 16),
    gymPhonk: gymPhonk.slice(0, 20),
    midnightChill: midnightChill.slice(0, 20),
  };
}

/**
 * searchSongsWithRadio(query: string, page?: number): Promise<{ results: Song[]; radioQueue: Song[] }>
 */
export async function searchSongsWithRadio(query: string, page: number = 1): Promise<{
  results: Song[];
  radioQueue: Song[];
}> {
  const results = await searchSongs(query, page);

  let radioQueue: Song[] = [];
  if (results.length > 0) {
    const leadTrack = results[0];
    radioQueue = await getDynamicAutoplayQueue(leadTrack);
  }

  return { results, radioQueue };
}

/**
 * Compatibility exports
 */
export async function getLiveCategory(query: string): Promise<Song[]> {
  return getCategoryFeed(query);
}

export async function getMoodCategoryBundle(mood: string): Promise<Song[]> {
  return getCategoryFeed(mood);
}

export async function getHomeFeed(): Promise<{
  quickPicks: Song[];
  trending: Song[];
  international: Song[];
  punjabiBollywood: Song[];
  workout: Song[];
  chill: Song[];
  party: Song[];
}> {
  const shelves = await getHomeShelves();
  return {
    quickPicks: shelves.quickPicks,
    trending: shelves.heroTrending,
    international: shelves.quickPicks,
    punjabiBollywood: shelves.speedDial,
    workout: shelves.gymPhonk,
    chill: shelves.midnightChill,
    party: shelves.heroTrending,
  };
}

export async function getLyrics(songTitle: string, artist?: string): Promise<string> {
  if (!songTitle) {
    return "[00:00.00] ♪ Instrumental / Lyrics not available ♪";
  }

  const cleanTitle = encodeURIComponent(sanitizeQuery(songTitle));
  const cleanArtist = artist ? encodeURIComponent(sanitizeQuery(artist)) : "";

  // Query LRCLIB API
  try {
    const lrcUrl = `https://lrclib.net/api/get?track_name=${cleanTitle}${
      cleanArtist ? `&artist_name=${cleanArtist}` : ""
    }`;
    const res = await fetchWithTimeout(lrcUrl, 3000);
    if (res?.syncedLyrics) return res.syncedLyrics;
    if (res?.plainLyrics) return res.plainLyrics;
  } catch {
    // Continue
  }

  // Saavn lyrics endpoint
  try {
    const data = await fetchWithTimeout(
      `https://saavn.dev/api/lyrics?id=${cleanTitle}`,
      3000
    );
    if (data?.data?.lyrics) {
      return sanitizeHtml(data.data.lyrics);
    }
  } catch {
    // Continue
  }

  return `[00:00.00] ♪ ${sanitizeHtml(songTitle)} ♪\n[00:04.00] Artist: ${
    artist ? sanitizeHtml(artist) : "RhythmX Music"
  }\n[00:08.00] Streaming in lossless 320kbps on RhythmX\n\n[00:15.00] ♪ High-fidelity sound experience ♪`;
}
