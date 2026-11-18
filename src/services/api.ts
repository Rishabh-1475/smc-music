import { Song } from "@/types/music";
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import CryptoJS from "crypto-js";
import curatedTracks from "./curatedTracks.json";

/**
 * SMC Singhs Music Co - Search Intelligence & Dual-Layer JioSaavn Engine
 * Query Expander • Popularity & Relevance Ranker • Curated Mood Bundles • 320kbps Lossless
 */

const HIGH_RES_VINYL_COVER =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

// Renowned Hitmakers dictionary for ranking & relevance boosting
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

// Dynamic Query Expander & Alias Dictionary
const QUERY_EXPANSION_MAP: Record<string, string[]> = {
  phonk: [
    "Brazilian Phonk",
    "Drift Phonk",
    "Kordhell Phonk",
    "GigaChad Phonk",
    "Montagem Phonk",
  ],
  fonk: [
    "Brazilian Phonk",
    "Drift Phonk",
    "Montagem Phonk",
  ],
  gym: [
    "Hype Gym Workout Hindi Punjabi",
    "Beast Mode Workout",
    "Phonk Gym Motivation",
    "Hardstyle Gym Hits",
  ],
  workout: [
    "Gym Motivation Hindi Punjabi 2026",
    "Beast Mode Gym Hype",
    "High Energy Workout EDM & Phonk",
    "Punjabi Gym Hype Sidhu Karan Aujla",
  ],
  motivation: [
    "Gym Motivation Hindi Punjabi",
    "Beast Mode Workout",
    "Phonk Motivation",
  ],
  kalyani: [
    "Kalyani Ragam Hits",
    "Kalyani Vachane",
    "Alaipayuthey Kalyani",
    "Kalyani Classical Renditions",
  ],
  chill: [
    "Bollywood Acoustic Chill",
    "Midnight Lo-Fi Hindi",
    "Arijit Singh Soulful Chill",
    "Slowed and Reverb Trending",
  ],
  lofi: [
    "Midnight Lo-Fi Hindi",
    "Bollywood Lo-Fi Beats",
    "Lo-Fi Instrumental Work Study",
  ],
  party: [
    "Trending Club Bollywood Party",
    "Punjabi Hype Party Hits",
    "Commercial EDM Top Hits",
  ],
  sad: [
    "Heartbreak Hits Hindi",
    "Sad Melodies Arijit B Praak",
    "Soulful Sad Ballads",
  ],
  romance: [
    "Top Bollywood Romance Hits",
    "Soulful Love Anthems",
    "Acoustic Romantic Hindi",
  ],
  focus: [
    "Deep Focus Ambient Beats",
    "Lo-Fi Instrumental Work Study",
    "Calm Piano Focus",
  ],
};

// Curated Mood Query Bundles for Instant High-Energy Feeds
const MOOD_QUERY_BUNDLES: Record<string, string[]> = {
  workout: [
    "Gym Motivation Hindi Punjabi 2026",
    "Beast Mode Gym Hype",
    "High Energy Workout EDM & Phonk",
    "Punjabi Gym Hype Sidhu Karan Aujla",
  ],
  energize: [
    "Trending Club Bollywood Party",
    "Punjabi Hype Party Hits",
    "Commercial EDM Top Hits",
    "High Energy Dance Anthems",
  ],
  party: [
    "Trending Club Bollywood Party",
    "Punjabi Hype Party Hits",
    "Commercial EDM Top Hits",
  ],
  relax: [
    "Bollywood Acoustic Chill",
    "Midnight Lo-Fi Hindi",
    "Arijit Singh Soulful Chill",
    "Slowed and Reverb Trending",
  ],
  chill: [
    "Bollywood Acoustic Chill",
    "Midnight Lo-Fi Hindi",
    "Arijit Singh Soulful Chill",
    "Slowed and Reverb Trending",
  ],
  focus: [
    "Deep Focus Ambient Beats",
    "Lo-Fi Instrumental Work Study",
    "Calm Piano Focus Study",
  ],
  romance: [
    "Top Bollywood Romance Hits",
    "Soulful Love Anthems",
    "Acoustic Romantic Hindi",
  ],
  commute: [
    "Feel Good Road Trip Hits",
    "Easy Listening Acoustic Pop",
    "Indie Hindi Vibes",
  ],
};

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
 * Query Sanitization:
 * Trims strings, cleans noise while strictly preserving multilingual Unicode characters.
 */
export const sanitizeQuery = (query: string): string => {
  if (!query || typeof query !== "string") return "";
  return query
    .trim()
    .replace(/[^\w\s\u0900-\u097F\u0A00-\u0A7F\u0B80-\u0BFF\u0C00-\u0C7F\u0D00-\u0D7F\uAC00-\uD7AF\u4E00-\u9FFF-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Expands user query into subgenres or alternative search variants.
 */
export const expandQuery = (rawQuery: string): string[] => {
  const sanitized = sanitizeQuery(rawQuery).toLowerCase();
  const words = sanitized.split(" ");
  const expansions: string[] = [sanitized];

  for (const word of words) {
    if (QUERY_EXPANSION_MAP[word]) {
      for (const item of QUERY_EXPANSION_MAP[word]) {
        if (!expansions.includes(item.toLowerCase())) {
          expansions.push(item);
        }
      }
    }
  }

  return expansions.slice(0, 4);
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
 * Extracts 320kbps audio with strict priority:
 * 1. DES decrypted media URL upgraded to _320.mp4
 * 2. downloadUrl array (last item or 320kbps tag)
 * 3. media_url / media_preview_url / url
 * Forces 'https://' across all stream URLs to avoid Android WebView mixed-content blocking.
 */
const resolveAudioUrl = (item: any): string => {
  if (!item) return "";

  // 1. Direct or nested encrypted_media_url
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

  // 2. downloadUrl arrays
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
      const found320 = src.find(
        (d: any) =>
          d?.quality === "320kbps" ||
          d?.quality === 320 ||
          (typeof d?.link === "string" && d.link.includes("_320.mp4")) ||
          (typeof d?.url === "string" && d.url.includes("_320.mp4"))
      );
      if (found320) {
        const link = found320.link || found320.url;
        if (typeof link === "string" && link.startsWith("http")) {
          return link.replace("http://", "https://");
        }
      }

      // Last item in array
      const lastItem = src[src.length - 1];
      const candidate =
        typeof lastItem === "string" ? lastItem : lastItem?.link || lastItem?.url;
      if (typeof candidate === "string" && candidate.startsWith("http")) {
        return candidate.replace("http://", "https://");
      }
    }

    if (typeof src === "string" && src.startsWith("http")) {
      return src.replace("http://", "https://");
    }
  }

  // 3. Media preview / vlink fallback
  const preview =
    item.media_preview_url ||
    item.more_info?.media_preview_url ||
    item.vlink ||
    item.more_info?.vlink;

  if (typeof preview === "string" && preview.startsWith("http")) {
    return preview.replace("http://", "https://");
  }

  return "";
};

/**
 * Extracts 500x500 high-res cover art.
 * Fallback strictly to dark vinyl cover. Never use /creator.jpg for song cards.
 */
const resolveImageUrl = (item: any): string => {
  if (!item) return HIGH_RES_VINYL_COVER;

  const imageSources = [
    item.image,
    item.imageUrl,
    item.images,
    item.more_info?.image,
  ];

  for (const src of imageSources) {
    if (!src) continue;

    if (Array.isArray(src) && src.length > 0) {
      const found500 = src.find(
        (img: any) =>
          img?.quality === "500x500" ||
          (typeof img?.link === "string" && img.link.includes("500x500")) ||
          (typeof img?.url === "string" && img.url.includes("500x500"))
      );
      if (found500) {
        const link = found500.link || found500.url;
        if (typeof link === "string" && link.startsWith("http")) {
          return link.replace("http://", "https://");
        }
      }

      const lastImg = src[src.length - 1];
      const candidate =
        typeof lastImg === "string" ? lastImg : lastImg?.link || lastImg?.url;
      if (typeof candidate === "string" && candidate.startsWith("http")) {
        return candidate.replace("http://", "https://");
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
 * Resolves artist names across primaryArtists, singers, artists, primary_artists, and more_info.
 */
const resolveArtists = (item: any): string => {
  if (!item) return "Singhs Music Co";

  const candidates = [
    item.primaryArtists,
    item.primary_artists,
    item.more_info?.primary_artists,
    item.singers,
    item.more_info?.singers,
    item.artist,
    item.artists?.primary,
  ];

  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === "string" && c.trim()) {
      return sanitizeHtml(c);
    }
    if (Array.isArray(c) && c.length > 0) {
      const names = c
        .map((a: any) => (typeof a === "string" ? a : a?.name))
        .filter(Boolean);
      if (names.length > 0) {
        return sanitizeHtml(names.join(", "));
      }
    }
  }

  return "Singhs Music Co";
};

/**
 * Resolves album name cleanly.
 */
const resolveAlbum = (item: any): string => {
  if (!item) return "Single";
  if (typeof item.album === "string" && item.album.trim()) {
    return sanitizeHtml(item.album);
  }
  if (typeof item.album === "object" && item.album?.name) {
    return sanitizeHtml(item.album.name);
  }
  if (typeof item.more_info?.album === "string" && item.more_info.album.trim()) {
    return sanitizeHtml(item.more_info.album);
  }
  return "Single";
};

/**
 * Multi-Format JSON Normalizer:
 * Unpacks json.data.results, json.data.songs.results, json.data, json.results, json.songs.data.
 */
export const parseSongs = (rawJson: any): Song[] => {
  if (!rawJson) return [];

  let candidates: any[] = [];

  if (Array.isArray(rawJson)) {
    candidates = rawJson;
  } else if (rawJson.data) {
    if (Array.isArray(rawJson.data)) {
      candidates = rawJson.data;
    } else if (Array.isArray(rawJson.data.results)) {
      candidates = rawJson.data.results;
    } else if (Array.isArray(rawJson.data.songs?.results)) {
      candidates = rawJson.data.songs.results;
    } else if (Array.isArray(rawJson.data.songs?.data)) {
      candidates = rawJson.data.songs.data;
    } else if (Array.isArray(rawJson.data.songs)) {
      candidates = rawJson.data.songs;
    }
  } else if (Array.isArray(rawJson.results)) {
    candidates = rawJson.results;
  } else if (rawJson.songs && Array.isArray(rawJson.songs.data)) {
    candidates = rawJson.songs.data;
  }

  const parsedSongs: Song[] = [];

  for (const item of candidates) {
    if (!item) continue;

    const audioUrl = resolveAudioUrl(item);
    // Discard any entry that does not resolve to a playable audio URL
    if (!audioUrl || !audioUrl.startsWith("http")) continue;

    const cleanId = String(item.id || item.song_id || Math.random().toString(36).slice(2));
    const rawTitle = item.name || item.title || item.song || "Track";
    const cleanTitle = sanitizeHtml(rawTitle);
    const cleanArtists = resolveArtists(item);
    const cleanAlbum = resolveAlbum(item);
    const cleanCover = resolveImageUrl(item);
    const rawDur = item.duration;
    const duration = typeof rawDur === "number" ? rawDur : parseInt(rawDur, 10) || 210;

    // Parse play_count
    let playCountNum = 0;
    if (typeof item.play_count === "number") playCountNum = item.play_count;
    else if (typeof item.play_count === "string") playCountNum = parseInt(item.play_count, 10) || 0;
    else if (typeof item.playCount === "number") playCountNum = item.playCount;
    else if (typeof item.playCount === "string") playCountNum = parseInt(item.playCount, 10) || 0;

    parsedSongs.push({
      id: cleanId,
      name: cleanTitle,
      title: cleanTitle,
      album: cleanAlbum,
      primaryArtists: cleanArtists,
      duration: duration,
      imageUrl: cleanCover,
      audioUrl: audioUrl,
      hasLyrics: Boolean(item.hasLyrics || item.has_lyrics || item.more_info?.has_lyrics === "true"),
      lyrics: item.lyrics || undefined,
      year: item.year ? String(item.year) : undefined,
      playCount: playCountNum,
    });
  }

  return parsedSongs;
};

/**
 * Popularity & Relevance Ranking Filter (Rank & Sort Engine):
 * 1. Deduplicates near-identical tracks.
 * 2. Purges tracks with zero-duration streams or missing metadata.
 * 3. Ranks by playCount, modern release year, query match, and renowned hitmakers.
 */
export const rankAndSortSongs = (songs: Song[], originalQuery: string = ""): Song[] => {
  if (!songs || songs.length === 0) return [];

  const cleanQueryLower = originalQuery.toLowerCase().trim();
  const queryWords = cleanQueryLower.split(/\s+/).filter(Boolean);

  // 1. Deduplication using normalized signature
  const seenSignatures = new Set<string>();
  const uniqueSongs: Song[] = [];

  for (const song of songs) {
    if (!song.audioUrl || !song.name) continue;

    const normName = song.name.toLowerCase().replace(/[^\w]/g, "");
    const normArtist = song.primaryArtists.toLowerCase().split(",")[0].replace(/[^\w]/g, "");
    const sig = `${normName}__${normArtist}`;

    if (!seenSignatures.has(sig)) {
      seenSignatures.add(sig);
      uniqueSongs.push(song);
    }
  }

  // 2. Score calculation
  const scored = uniqueSongs.map((song) => {
    let score = 0;
    const nameLower = song.name.toLowerCase();
    const artistLower = song.primaryArtists.toLowerCase();
    const albumLower = song.album.toLowerCase();

    // Exact or starting match
    if (cleanQueryLower && nameLower === cleanQueryLower) score += 60;
    else if (cleanQueryLower && nameLower.startsWith(cleanQueryLower)) score += 35;
    else if (cleanQueryLower && nameLower.includes(cleanQueryLower)) score += 20;

    // Word matches
    for (const w of queryWords) {
      if (nameLower.includes(w)) score += 15;
      if (artistLower.includes(w)) score += 25;
      if (albumLower.includes(w)) score += 10;
    }

    // PlayCount popularity score (log scale)
    const pc = typeof song.playCount === "number" ? song.playCount : parseInt(String(song.playCount || 0), 10) || 0;
    if (pc > 0) {
      score += Math.min(35, Math.log10(pc) * 5);
    }

    // Renowned Hitmakers prominence bonus
    for (const hitmaker of RENOWNED_HITMAKERS) {
      if (artistLower.includes(hitmaker)) {
        score += 25;
        break;
      }
    }

    // Modern release year preference
    const yr = song.year ? parseInt(song.year, 10) : 0;
    if (yr >= 2024) score += 15;
    else if (yr >= 2021) score += 10;
    else if (yr >= 2016) score += 5;

    return { ...song, score };
  });

  // 3. Sort descending by score
  scored.sort((a, b) => (b.score || 0) - (a.score || 0));

  return scored;
};

/**
 * Robust fetcher with 3000ms AbortController timeout.
 */
async function fetchWithTimeout(url: string, timeoutMs = 3000): Promise<any> {
  if (Capacitor.isNativePlatform()) {
    try {
      const response = await CapacitorHttp.get({
        url,
        connectTimeout: timeoutMs,
        readTimeout: timeoutMs,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
      });
      if (response && response.status === 200) {
        return typeof response.data === "string" ? JSON.parse(response.data) : response.data;
      }
    } catch {
      // Fall through to standard fetch
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}

/**
 * Query multi-engine endpoints with 3000ms timeout per endpoint.
 */
async function queryEndpoints(cleanQuery: string): Promise<Song[]> {
  const encodedQuery = encodeURIComponent(cleanQuery);

  const endpoints = [
    // Layer 2: Direct Official JioSaavn Search Gateway
    `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&n=40&p=1&q=${encodedQuery}`,
    // Layer 1: High-capacity Unofficial Mirror
    `https://jiosaavn-api-unofficial.vercel.app/search/songs?query=${encodedQuery}`,
    // Layer 2: Official Autocomplete Gateway
    `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodedQuery}`,
    // Layer 1: Proxies
    `https://saavn.dev/api/search/songs?query=${encodedQuery}&page=1&limit=40`,
    `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodedQuery}`,
    `https://saavn-api.vercel.app/api/search/songs?query=${encodedQuery}`,
  ];

  for (const url of endpoints) {
    try {
      const data = await fetchWithTimeout(url, 3000);
      const parsed = parseSongs(data);
      if (parsed && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Failover to next mirror
    }
  }

  return [];
}

/**
 * searchSongs(query: string): Promise<Song[]>
 * Includes Dynamic Query Expansion & Ranking Filter.
 * If query is empty, returns []. Never falls back to home screen songs.
 */
export async function searchSongs(query: string): Promise<Song[]> {
  const sanitized = sanitizeQuery(query);
  if (!sanitized) return [];

  // 1. Dynamic Query Expander
  const expandedQueries = expandQuery(sanitized);

  // 2. Query primary search target
  const primaryResults = await queryEndpoints(sanitized);

  // 3. If primary results are sparse (< 6) and expansions exist, query subgenre expansions in parallel
  let additionalResults: Song[] = [];
  if (primaryResults.length < 6 && expandedQueries.length > 1) {
    const subQueries = expandedQueries.slice(1, 3);
    const subPromises = subQueries.map((sq) => queryEndpoints(sq));
    const settled = await Promise.allSettled(subPromises);

    for (const res of settled) {
      if (res.status === "fulfilled" && res.value.length > 0) {
        additionalResults.push(...res.value);
      }
    }
  }

  const combined = [...primaryResults, ...additionalResults];

  // 4. Rank & Sort Engine
  const ranked = rankAndSortSongs(combined, sanitized);

  return ranked;
}

/**
 * searchSongsWithRadio(query: string): Promise<{ results: Song[]; radioQueue: Song[] }>
 * For any single-track search, fetches direct song AND generates dynamic trending radio behind it.
 */
export async function searchSongsWithRadio(query: string): Promise<{
  results: Song[];
  radioQueue: Song[];
}> {
  const results = await searchSongs(query);

  let radioQueue: Song[] = [];
  if (results.length > 0) {
    const leadTrack = results[0];
    const artist = leadTrack.primaryArtists?.split(",")[0]?.trim() || leadTrack.name;
    radioQueue = await getRadioForTrack(artist);
  }

  return { results, radioQueue };
}

/**
 * getLiveCategory(query: string): Promise<Song[]>
 */
export async function getLiveCategory(query: string): Promise<Song[]> {
  const sanitized = sanitizeQuery(query);
  if (!sanitized) return curatedTracks.trendingHits as unknown as Song[];

  const songs = await queryEndpoints(sanitized);
  if (songs.length > 0) {
    return rankAndSortSongs(songs, sanitized);
  }

  // Fallback to categorized curated tracks ONLY for home categories, never for search
  const q = sanitized.toLowerCase();
  if (q.includes("workout") || q.includes("energy") || q.includes("gym") || q.includes("phonk")) {
    return curatedTracks.workoutHype as unknown as Song[];
  }
  if (q.includes("chill") || q.includes("relax") || q.includes("focus") || q.includes("lo-fi")) {
    return curatedTracks.chillVibes as unknown as Song[];
  }
  if (q.includes("party") || q.includes("dance") || q.includes("club")) {
    return curatedTracks.moodStations as unknown as Song[];
  }
  return curatedTracks.trendingHits as unknown as Song[];
}

/**
 * getMoodCategoryBundle(mood: string): Promise<Song[]>
 * Modern, trending, high-energy query bundles replacing stale categories.
 */
export async function getMoodCategoryBundle(mood: string): Promise<Song[]> {
  const normalizedMood = mood.toLowerCase().trim();
  const queryBundle = MOOD_QUERY_BUNDLES[normalizedMood] || [mood];

  const promises = queryBundle.map((q) => queryEndpoints(q));
  const settled = await Promise.allSettled(promises);

  const pool: Song[] = [];
  for (const res of settled) {
    if (res.status === "fulfilled" && res.value.length > 0) {
      pool.push(...res.value);
    }
  }

  if (pool.length > 0) {
    return rankAndSortSongs(pool, mood).slice(0, 30);
  }

  return getLiveCategory(mood);
}

/**
 * getRadioForTrack(artistOrTrack: string): Promise<Song[]>
 */
export async function getRadioForTrack(artistOrTrack: string): Promise<Song[]> {
  const sanitized = sanitizeQuery(artistOrTrack);
  if (!sanitized) {
    return curatedTracks.trendingHits as unknown as Song[];
  }

  const primaryQuery = sanitized.split(",")[0].trim() || sanitized;
  const results = await queryEndpoints(primaryQuery);

  if (results.length > 0) {
    return rankAndSortSongs(results, primaryQuery);
  }

  return curatedTracks.quickPicks as unknown as Song[];
}

/**
 * getLyrics(songTitle: string, artist?: string): Promise<string>
 */
export async function getLyrics(songTitle: string, artist?: string): Promise<string> {
  if (!songTitle) {
    return "[00:00.00] ♪ Instrumental / Lyrics not available ♪";
  }

  const cleanTitle = encodeURIComponent(sanitizeQuery(songTitle));
  const cleanArtist = artist ? encodeURIComponent(sanitizeQuery(artist)) : "";

  // 1. Query LRCLIB public API for synchronized or plain lyrics
  try {
    const lrcUrl = `https://lrclib.net/api/get?track_name=${cleanTitle}${
      cleanArtist ? `&artist_name=${cleanArtist}` : ""
    }`;
    const res = await fetchWithTimeout(lrcUrl, 3000);
    if (res?.syncedLyrics) {
      return res.syncedLyrics;
    }
    if (res?.plainLyrics) {
      return res.plainLyrics;
    }
  } catch {
    // Continue
  }

  // 2. Query Saavn lyrics endpoint
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
    artist ? sanitizeHtml(artist) : "Singhs Music Co"
  }\n[00:08.00] Streaming in lossless 320kbps on SMC Music\n\n[00:15.00] ♪ Enjoy the high-fidelity sound ♪`;
}

/**
 * Parallel YouTube Music Home Feed with Promise.allSettled
 */
export async function getHomeFeed(): Promise<{
  quickPicks: Song[];
  trending: Song[];
  international: Song[];
  punjabiBollywood: Song[];
  workout: Song[];
  chill: Song[];
  party: Song[];
}> {
  const settled = await Promise.allSettled([
    getMoodCategoryBundle("workout"),
    getLiveCategory("Trending Global Hits 2026"),
    getLiveCategory("International Pop Hip-Hop"),
    getLiveCategory("Punjabi Hype Bollywood Romance"),
    getMoodCategoryBundle("chill"),
    getMoodCategoryBundle("party"),
  ]);

  const [workout, trending, intl, pb, chill, party] = settled.map((res, idx) => {
    if (res.status === "fulfilled" && res.value.length > 0) {
      return res.value;
    }
    const fallbacks = [
      curatedTracks.workoutHype,
      curatedTracks.trendingHits,
      curatedTracks.quickPicks,
      curatedTracks.trendingHits,
      curatedTracks.chillVibes,
      curatedTracks.moodStations,
    ];
    return fallbacks[idx] as unknown as Song[];
  });

  return {
    quickPicks: trending.slice(0, 12),
    trending: trending,
    international: intl,
    punjabiBollywood: pb,
    workout: workout,
    chill: chill,
    party: party,
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
