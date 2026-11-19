import { create } from "zustand";
import { Song, CategoryMood, UserTasteProfile } from "@/types/music";
import { getRadioForTrack, getDynamicAutoplayQueue } from "@/services/api";

declare global {
  interface Window {
    __rhythmx_audio?: HTMLAudioElement;
    __smc_audio?: HTMLAudioElement;
  }
}

/**
 * Permanent HTML5 Audio Singleton outside React's lifecycle.
 * Bound to window.__rhythmx_audio to guarantee continuous background playback in Mobile WebViews.
 */
let globalAudio: HTMLAudioElement | null = null;
let wakeLockSentinel: any = null;

const requestWakeLock = async () => {
  if (typeof window !== "undefined" && "wakeLock" in navigator) {
    try {
      wakeLockSentinel = await (navigator as any).wakeLock.request("screen");
    } catch {
      // Screen wake lock optional
    }
  }
};

const releaseWakeLock = () => {
  if (wakeLockSentinel) {
    wakeLockSentinel.release().catch(() => {});
    wakeLockSentinel = null;
  }
};

if (typeof window !== "undefined") {
  if (!window.__rhythmx_audio) {
    const audio = new Audio();
    audio.preload = "auto";
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    audio.crossOrigin = "anonymous";
    (audio as any).playsInline = true;
    window.__rhythmx_audio = audio;
    window.__smc_audio = audio;
  }
  globalAudio = window.__rhythmx_audio;

  // Prevent Visibility Pausing:
  // Ensure no code or browser event calls audio.pause() when user switches apps or locks screen
  window.addEventListener(
    "visibilitychange",
    (e) => {
      e.stopImmediatePropagation();
    },
    true
  );

  window.addEventListener(
    "blur",
    (e) => {
      e.stopImmediatePropagation();
    },
    true
  );

  window.addEventListener(
    "pagehide",
    (e) => {
      e.stopImmediatePropagation();
    },
    true
  );
}

const CLEAN_VINYL_COVER =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

/**
 * Sanitize song object before storing to prevent circular references,
 * large payloads, or DOM references causing WebView memory pressure or quota crashes.
 */
const sanitizeSong = (s: Song): Song => {
  if (!s) return s;
  const audio = String(s.audioUrl || (s as any).streamUrl || "");
  const img = String(s.imageUrl || (s as any).image || CLEAN_VINYL_COVER);
  return {
    id: String(s.id || ""),
    name: String(s.name || s.title || ""),
    title: String(s.title || s.name || ""),
    album: String(s.album || ""),
    primaryArtists: String(s.primaryArtists || ""),
    duration: s.duration || 0,
    imageUrl: img,
    image: img,
    audioUrl: audio,
    streamUrl: audio,
    year: s.year ? String(s.year) : "",
    isLiked: Boolean(s.isLiked),
  };
};

/**
 * Resilient localStorage helpers with quota protection
 */
const loadStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(key);
      if (item) return JSON.parse(item);
    } catch {
      // Return default
    }
  }
  return defaultValue;
};

const saveStorage = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn("localStorage quota warning, attempting cache prune:", err);
      try {
        // Prune non-critical cache if quota hit
        localStorage.removeItem("rhythmx_taste_profile");
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Silent fallback
      }
    }
  }
};

/**
 * Extracts or derives alternate stream quality (160kbps or 96kbps)
 * for seamless fallback if the primary 320kbps URL fails or times out.
 */
function getAlternateStream(song: Song | null, quality: "160" | "96"): string | null {
  if (!song) return null;

  // 1. Check if song has explicit downloadUrl array
  const dlList =
    song.downloadUrl ||
    song.downloadUrls ||
    (song as any).more_info?.downloadUrl ||
    (song as any).download_url;

  if (Array.isArray(dlList) && dlList.length > 0) {
    const qStr = quality === "160" ? "160" : "96";
    const found = dlList.find(
      (u: any) =>
        (typeof u === "string" && u.includes(`_${qStr}.`)) ||
        u?.quality?.includes(qStr) ||
        u?.bitrate?.includes(qStr) ||
        u?.url?.includes(`_${qStr}.`) ||
        u?.link?.includes(`_${qStr}.`)
    );
    if (found) {
      const u = typeof found === "string" ? found : found.url || found.link;
      if (u && typeof u === "string") return u;
    }
  }

  // 2. Derive bitrate URL replacement for JioSaavn CDN formats
  const url = song.audioUrl;
  if (url && typeof url === "string") {
    if (quality === "160") {
      if (url.includes("_320.")) return url.replace(/_320\./g, "_160.");
    } else if (quality === "96") {
      if (url.includes("_320.")) return url.replace(/_320\./g, "_96.");
      if (url.includes("_160.")) return url.replace(/_160\./g, "_96.");
    }
  }

  return null;
}

// Genre & Mood detection helper
const detectGenres = (song: Song): string[] => {
  const text = `${song.name} ${song.title || ""} ${song.primaryArtists || ""} ${
    song.album || ""
  }`.toLowerCase();
  const genres: string[] = [];

  if (text.includes("phonk") || text.includes("drift") || text.includes("montagem")) {
    genres.push("Gym Phonk");
  }
  if (text.includes("gym") || text.includes("workout") || text.includes("hype") || text.includes("beast")) {
    genres.push("Workout");
  }
  if (text.includes("cyber") || text.includes("synth") || text.includes("edm") || text.includes("electro")) {
    genres.push("Cyber Hype");
  }
  if (text.includes("lo-fi") || text.includes("lofi") || text.includes("chill") || text.includes("relax")) {
    genres.push("Midnight Chill");
  }
  if (text.includes("party") || text.includes("club") || text.includes("dance")) {
    genres.push("Party");
  }
  if (text.includes("love") || text.includes("romance") || text.includes("romantic")) {
    genres.push("Romance");
  }
  if (genres.length === 0) genres.push("All");
  return genres;
};

export interface TasteProfile {
  artistWeights: Record<string, number>;
  genreWeights: Record<string, number>;
  recentlyPlayed: Song[];
}

export interface UserPersonalData {
  recentlyPlayed: Song[];
  likedSongs: Song[];
  playFrequency: Record<string, { song: Song; count: number }>;
  recentSearches: string[];
}

export interface PlayerStore {
  // State Interface
  currentTrack: Song | null;
  queue: Song[];
  originalQueue: Song[];
  history: Song[];
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  autoplayEnabled: boolean;
  autoplay: boolean;
  isPlayerOpen: boolean;
  activeTab: "up_next" | "lyrics" | "related";
  isShuffled: boolean;
  repeatMode: "off" | "all" | "one";
  likedSongIds: Record<string, boolean>;
  dislikedSongIds: Record<string, boolean>;
  userTasteProfile: TasteProfile;
  activeMood: CategoryMood | string;

  // Personal Activity Arrays (strictly capped at 50 for memory protection)
  recentlyPlayed: Song[];
  likedSongs: Song[];
  playFrequency: Record<string, { song: Song; count: number }>;
  recentSearches: string[];

  // Actions
  playSong: (song: Song, context?: Song[]) => void;
  playTrack: (song: Song, context?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (percent: number) => void;
  setVolume: (level: number) => void;
  togglePlayerOpen: (open?: boolean) => void;
  setActiveTab: (tab: "up_next" | "lyrics" | "related") => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (songOrId: Song | string) => void;
  toggleDislike: (songOrId: Song | string) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  setActiveMood: (mood: CategoryMood | string) => void;
  toggleAutoplay: () => void;
  setAutoplayEnabled: (enabled: boolean) => void;
  getTopAffinityGenre: () => string | null;
  getTopArtists: () => string[];
  getPersonalizedSpeedDial: (pool?: Song[]) => Song[];

  // User Activity Selectors & Actions
  addToRecentlyPlayed: (song: Song) => void;
  toggleLikeSong: (song: Song) => void;
  recordSearchQuery: (query: string) => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (query: string) => void;
  getFrequentlyPlayed: () => Song[];

  [key: string]: any;
}

const DEFAULT_TASTE_PROFILE: TasteProfile = {
  artistWeights: {
    "arijit singh": 10,
    "sidhu moose wala": 8,
    "diljit dosanjh": 8,
    "karan aujla": 7,
    "kordhell": 7,
  },
  genreWeights: {
    "Gym Phonk": 10,
    "Cyber Hype": 8,
    "Midnight Chill": 7,
  },
  recentlyPlayed: [],
};

const DEFAULT_USER_DATA: UserPersonalData = {
  recentlyPlayed: [],
  likedSongs: [],
  playFrequency: {},
  recentSearches: [],
};

export const usePlayerStore = create<PlayerStore>((set, get) => {
  // Load persisted user personal data under 'rhythmx_user_data' with 50-cap sanitization
  const rawUserData = loadStorage<UserPersonalData>(
    "rhythmx_user_data",
    DEFAULT_USER_DATA
  );

  const initialUserData: UserPersonalData = {
    recentlyPlayed: (rawUserData.recentlyPlayed || []).map(sanitizeSong).slice(0, 50),
    likedSongs: (rawUserData.likedSongs || []).map(sanitizeSong).slice(0, 50),
    playFrequency: rawUserData.playFrequency || {},
    recentSearches: (rawUserData.recentSearches || []).slice(0, 10),
  };

  // Backward compatibility loads
  const legacyLiked = loadStorage<Record<string, boolean>>("rhythmx_liked_songs", {});
  const initialDisliked = loadStorage<Record<string, boolean>>("rhythmx_disliked_songs", {});
  const initialTaste = loadStorage<TasteProfile>("rhythmx_taste_profile", DEFAULT_TASTE_PROFILE);

  // Merge likedSongIds from both likedSongs array and legacy storage
  const initialLikedIds: Record<string, boolean> = { ...legacyLiked };
  for (const s of initialUserData.likedSongs || []) {
    if (s?.id) initialLikedIds[s.id] = true;
  }

  // Persistent storage saver strictly capped at 50 items
  const persistUserData = (partial: Partial<UserPersonalData>) => {
    const current: UserPersonalData = {
      recentlyPlayed: (partial.recentlyPlayed || get().recentlyPlayed || [])
        .map(sanitizeSong)
        .slice(0, 50),
      likedSongs: (partial.likedSongs || get().likedSongs || [])
        .map(sanitizeSong)
        .slice(0, 50),
      playFrequency: partial.playFrequency || get().playFrequency || {},
      recentSearches: (partial.recentSearches || get().recentSearches || []).slice(0, 10),
    };
    saveStorage("rhythmx_user_data", current);
  };

  /**
   * ANDROID MEDIASESSION & LOCKSCREEN CONTROLS
   * Updates metadata on EVERY song change:
   * Title, Artist, Album, and multi-size artwork icons (96x96 to 512x512).
   * Registers play, pause, previoustrack, nexttrack, seekto, seekbackward, seekforward.
   */
  const syncMediaSession = (track: Song | null, playing: boolean) => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    if (!track) {
      navigator.mediaSession.playbackState = "none";
      return;
    }

    const artUrl = track.imageUrl || CLEAN_VINYL_COVER;
    const hiresArtwork = artUrl.replace(/150x150|50x50/g, "500x500");

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.name || track.title || "RhythmX Track",
      artist: track.primaryArtists || "RhythmX Stream",
      album: track.album || "RhythmX",
      artwork: [
        { src: hiresArtwork, sizes: "96x96", type: "image/jpeg" },
        { src: hiresArtwork, sizes: "128x128", type: "image/jpeg" },
        { src: hiresArtwork, sizes: "192x192", type: "image/jpeg" },
        { src: hiresArtwork, sizes: "256x256", type: "image/jpeg" },
        { src: hiresArtwork, sizes: "384x384", type: "image/jpeg" },
        { src: hiresArtwork, sizes: "512x512", type: "image/jpeg" },
      ],
    });

    navigator.mediaSession.playbackState = playing ? "playing" : "paused";

    try {
      navigator.mediaSession.setActionHandler("play", () => {
        globalAudio?.play().catch(() => {});
        set({ isPlaying: true });
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        globalAudio?.pause();
        set({ isPlaying: false });
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        get().playPrev();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        get().playNext();
      });
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime != null && globalAudio?.duration) {
          globalAudio.currentTime = details.seekTime;
        }
      });
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        const skip = details.seekOffset || 10;
        if (globalAudio) globalAudio.currentTime = Math.max(0, globalAudio.currentTime - skip);
      });
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const skip = details.seekOffset || 10;
        if (globalAudio && globalAudio.duration) {
          globalAudio.currentTime = Math.min(globalAudio.duration, globalAudio.currentTime + skip);
        }
      });
    } catch {
      // Ignore unsupported action handler registration
    }
  };

  /**
   * AUDIO SINGLETON & NETWORK RESILIENCE STATE
   */
  let currentFallbackStage: 0 | 1 | 2 = 0; // 0: 320kbps, 1: 160kbps, 2: 96kbps
  let stallTimeoutId: any = null;
  let isAutoplayFetching = false;

  /**
   * Seamless Fallback: if 320kbps fails or times out, immediately
   * falls back to 160kbps, then 96kbps, before advancing to next song.
   */
  const tryFallbackStream = () => {
    const currentSong = get().currentTrack;
    if (!currentSong || !globalAudio) {
      get().playNext();
      return;
    }

    if (currentFallbackStage === 0) {
      currentFallbackStage = 1;
      const fallback160 = getAlternateStream(currentSong, "160");
      if (fallback160 && fallback160 !== globalAudio.src) {
        console.warn("320kbps stream failed/stalled. Stepping down to 160kbps:", fallback160);
        const lastPos = globalAudio.currentTime || 0;
        globalAudio.src = fallback160;
        globalAudio.currentTime = lastPos;
        globalAudio.load();
        globalAudio.play().catch((err) => {
          console.warn("160kbps playback error:", err);
          tryFallbackStream();
        });
        return;
      }
    }

    if (currentFallbackStage === 1) {
      currentFallbackStage = 2;
      const fallback96 = getAlternateStream(currentSong, "96");
      if (fallback96 && fallback96 !== globalAudio.src) {
        console.warn("160kbps stream failed/stalled. Stepping down to 96kbps:", fallback96);
        const lastPos = globalAudio.currentTime || 0;
        globalAudio.src = fallback96;
        globalAudio.currentTime = lastPos;
        globalAudio.load();
        globalAudio.play().catch((err) => {
          console.warn("96kbps playback error:", err);
          tryFallbackStream();
        });
        return;
      }
    }

    // All fallback qualities exhausted; advance to next track
    console.warn("All stream qualities failed for track. Advancing to next track.");
    currentFallbackStage = 0;
    get().playNext();
  };

  /**
   * Background Endless Autoplay Queue Top-Up
   * When queue has <= 2 songs left, automatically fetch 15-20 similar songs
   * without interrupting active playback.
   */
  const checkAndTopUpQueue = async (track: Song | null) => {
    if (!track || isAutoplayFetching) return;
    const state = get();
    if (!state.autoplayEnabled && !state.autoplay) return;

    const currentIdx = state.queue.findIndex((s) => s.id === track.id);
    const remainingCount =
      currentIdx >= 0 ? state.queue.length - 1 - currentIdx : state.queue.length;

    if (remainingCount <= 2) {
      isAutoplayFetching = true;
      try {
        const freshTracks = await getDynamicAutoplayQueue(track);
        if (freshTracks && freshTracks.length > 0) {
          const latestState = get();
          const latestQueue = latestState.queue;
          const currentIds = new Set(latestQueue.map((s) => s.id));
          const historyIds = new Set(latestState.history.map((s) => s.id));
          const dislikedIds = latestState.dislikedSongIds;

          const candidateBatch = freshTracks
            .filter((t) => {
              if (!t || !t.id || !t.audioUrl) return false;
              if (t.id === track.id) return false;
              if (currentIds.has(t.id)) return false;
              if (historyIds.has(t.id)) return false;
              if (dislikedIds[t.id]) return false;
              return true;
            })
            .slice(0, 20);

          if (candidateBatch.length > 0) {
            const updated = [...latestQueue, ...candidateBatch];
            set({ queue: updated, originalQueue: updated });
          }
        }
      } catch (err) {
        console.warn("Background autoplay top-up error:", err);
      } finally {
        isAutoplayFetching = false;
      }
    }
  };

  /**
   * Wire HTML5 Audio element event listeners
   */
  if (globalAudio) {
    globalAudio.ontimeupdate = () => {
      const cur = globalAudio?.currentTime || 0;
      const dur = globalAudio?.duration || 0;
      const pct = dur > 0 ? (cur / dur) * 100 : 0;
      set({ currentTime: cur, duration: dur, progress: pct });

      // Update position state on Android notification scrubber
      if (
        typeof window !== "undefined" &&
        "mediaSession" in navigator &&
        "setPositionState" in navigator.mediaSession &&
        dur > 0 &&
        !isNaN(cur) &&
        !isNaN(dur)
      ) {
        try {
          navigator.mediaSession.setPositionState({
            duration: Math.max(0, dur),
            playbackRate: 1,
            position: Math.min(Math.max(0, cur), dur),
          });
        } catch {
          // Ignore invalid position updates
        }
      }
    };

    // Buffer resilience: handle waiting
    globalAudio.onwaiting = () => {
      set({ isLoading: true });
      if (stallTimeoutId) clearTimeout(stallTimeoutId);
      stallTimeoutId = setTimeout(() => {
        if (globalAudio && (globalAudio.paused || globalAudio.readyState < 3)) {
          console.warn("Audio buffer waiting > 3500ms; attempting smooth recovery...");
          globalAudio.play().catch(() => {
            tryFallbackStream();
          });
        }
      }, 3500);
    };

    // Buffer resilience: handle stalled
    globalAudio.onstalled = () => {
      set({ isLoading: true });
      if (stallTimeoutId) clearTimeout(stallTimeoutId);
      stallTimeoutId = setTimeout(() => {
        if (globalAudio && (globalAudio.paused || globalAudio.readyState < 3)) {
          console.warn("Audio network stalled > 4000ms; attempting fallback stream...");
          tryFallbackStream();
        }
      }, 4000);
    };

    globalAudio.oncanplay = () => {
      set({ isLoading: false });
    };

    globalAudio.onplaying = () => {
      if (stallTimeoutId) {
        clearTimeout(stallTimeoutId);
        stallTimeoutId = null;
      }
      set({ isPlaying: true, isLoading: false });
      requestWakeLock();
      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "playing";
      }
      syncMediaSession(get().currentTrack, true);
    };

    globalAudio.onplay = () => {
      set({ isPlaying: true });
      requestWakeLock();
      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "playing";
      }
      syncMediaSession(get().currentTrack, true);
    };

    globalAudio.onpause = () => {
      set({ isPlaying: false });
      releaseWakeLock();
      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused";
      }
      syncMediaSession(get().currentTrack, false);
    };

    // Resilient ended listener
    globalAudio.onended = () => {
      const state = get();
      if (state.repeatMode === "one") {
        if (globalAudio) {
          globalAudio.currentTime = 0;
          globalAudio.play().catch(() => {});
        }
      } else {
        state.playNext();
      }
    };

    // Resilient error listener
    globalAudio.onerror = (e) => {
      console.warn("Audio playback error encountered. Triggering fallback stream...", e);
      tryFallbackStream();
    };
  }

  return {
    currentTrack: null,
    queue: [],
    originalQueue: [],
    history: [],
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    volume: 1,
    autoplayEnabled: true,
    autoplay: true,
    isPlayerOpen: false,
    activeTab: "up_next",
    isShuffled: false,
    repeatMode: "off",
    likedSongIds: initialLikedIds,
    dislikedSongIds: initialDisliked,
    userTasteProfile: initialTaste,
    activeMood: "All",

    // Personal activity arrays (strictly capped at 50)
    recentlyPlayed: initialUserData.recentlyPlayed || [],
    likedSongs: initialUserData.likedSongs || [],
    playFrequency: initialUserData.playFrequency || {},
    recentSearches: initialUserData.recentSearches || [],

    addToRecentlyPlayed: (song: Song) => {
      if (!song || !song.id) return;
      const state = get();
      const sanitized = sanitizeSong(song);
      const updated = [
        sanitized,
        ...state.recentlyPlayed.filter((s) => s.id !== song.id),
      ].slice(0, 50);

      set({ recentlyPlayed: updated });
      persistUserData({ recentlyPlayed: updated });
    },

    playTrack: (song: Song, context?: Song[]) => {
      get().playSong(song, context);
    },

    playSong: (song: Song, context?: Song[]) => {
      const songAudio = song?.audioUrl || (song as any)?.streamUrl;
      if (!song || !songAudio) return;

      const state = get();
      let newQueue = state.queue;

      if (context && context.length > 0) {
        newQueue = context.filter((s) => !state.dislikedSongIds[s.id]);
      } else if (!newQueue.some((s) => s.id === song.id)) {
        newQueue = [song, ...newQueue];
      }

      const sanitized = sanitizeSong(song);

      // Record in history
      const prevTrack = state.currentTrack;
      let updatedHistory = state.history;
      if (prevTrack && prevTrack.id !== song.id) {
        updatedHistory = [
          sanitizeSong(prevTrack),
          ...state.history.filter((s) => s.id !== prevTrack.id),
        ].slice(0, 50);
      }

      // 1. Update recentlyPlayed (Max 50)
      const updatedRecentlyPlayed = [
        sanitized,
        ...state.recentlyPlayed.filter((s) => s.id !== song.id),
      ].slice(0, 50);

      // 2. Update playFrequency (Pruned to top 50)
      const currentFrequency = { ...state.playFrequency };
      const currentCount = (currentFrequency[song.id]?.count || 0) + 1;
      currentFrequency[song.id] = { song: sanitized, count: currentCount };

      const prunedFrequency: Record<string, { song: Song; count: number }> = {};
      Object.entries(currentFrequency)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 50)
        .forEach(([k, v]) => {
          prunedFrequency[k] = v;
        });

      // Persist in 'rhythmx_user_data'
      persistUserData({
        recentlyPlayed: updatedRecentlyPlayed,
        playFrequency: prunedFrequency,
      });

      // Update Taste Profile: +2 artist affinity, +3 genre affinity
      const artist = (song.primaryArtists || "").toLowerCase().trim();
      const taste = { ...state.userTasteProfile };
      if (artist) {
        taste.artistWeights[artist] = (taste.artistWeights[artist] || 0) + 2;
      }

      const genres = detectGenres(song);
      for (const g of genres) {
        taste.genreWeights[g] = (taste.genreWeights[g] || 0) + 3;
      }

      taste.recentlyPlayed = updatedRecentlyPlayed.slice(0, 25);
      saveStorage("rhythmx_taste_profile", taste);

      // Reset fallback quality stage for new track
      currentFallbackStage = 0;

      set({
        currentTrack: song,
        queue: newQueue,
        originalQueue: newQueue,
        history: updatedHistory,
        isPlaying: true,
        isLoading: true,
        userTasteProfile: taste,
        recentlyPlayed: updatedRecentlyPlayed,
        playFrequency: prunedFrequency,
      });

      if (globalAudio) {
        globalAudio.src = songAudio;
        globalAudio.currentTime = 0;
        globalAudio
          .play()
          .then(() => {
            syncMediaSession(song, true);
          })
          .catch((err) => {
            console.warn("Playback initial start warning:", err);
            tryFallbackStream();
          });
      }

      // Check and top up queue in background if <= 2 songs left
      checkAndTopUpQueue(song);
    },

    togglePlay: () => {
      const state = get();
      if (!globalAudio) return;

      if (!state.currentTrack && state.queue.length > 0) {
        state.playSong(state.queue[0]);
        return;
      }

      if (state.isPlaying) {
        globalAudio.pause();
      } else {
        globalAudio.play().catch((err) => {
          console.error("Audio resume error:", err);
        });
      }
    },

    playNext: () => {
      const state = get();
      const { queue, currentTrack, repeatMode } = state;
      if (!queue.length) return;

      const currentIndex = currentTrack
        ? queue.findIndex((s) => s.id === currentTrack.id)
        : -1;

      let nextIndex = currentIndex + 1;

      // Handle queue exhaustion with Endless Autoplay
      if (nextIndex >= queue.length) {
        if (repeatMode === "all") {
          nextIndex = 0;
        } else if ((state.autoplayEnabled || state.autoplay) && currentTrack) {
          set({ isLoading: true });
          getDynamicAutoplayQueue(currentTrack)
            .then((freshTracks) => {
              const latestQueue = get().queue;
              const currentIds = new Set(latestQueue.map((s) => s.id));
              const candidateBatch = freshTracks.filter(
                (t) =>
                  t &&
                  t.id &&
                  t.audioUrl &&
                  !currentIds.has(t.id) &&
                  !get().dislikedSongIds[t.id]
              );

              if (candidateBatch.length > 0) {
                const updatedQueue = [...latestQueue, ...candidateBatch];
                set({ queue: updatedQueue, originalQueue: updatedQueue });
                state.playSong(candidateBatch[0], updatedQueue);
              } else {
                set({ isPlaying: false, isLoading: false });
                if (globalAudio) globalAudio.pause();
              }
            })
            .catch(() => {
              set({ isPlaying: false, isLoading: false });
              if (globalAudio) globalAudio.pause();
            });
          return;
        } else {
          set({ isPlaying: false, isLoading: false });
          if (globalAudio) globalAudio.pause();
          return;
        }
      }

      const nextSong = queue[nextIndex];
      if (nextSong) {
        state.playSong(nextSong, queue);
      }
    },

    playPrev: () => {
      const state = get();
      if (globalAudio && globalAudio.currentTime > 3) {
        globalAudio.currentTime = 0;
        return;
      }

      const { queue, currentTrack, history } = state;

      // Pop previous song from history if available
      if (history.length > 0) {
        const lastPlayed = history[0];
        const newHistory = history.slice(1);
        set({ history: newHistory });
        state.playSong(lastPlayed);
        return;
      }

      if (!queue.length) return;

      const currentIndex = currentTrack
        ? queue.findIndex((s) => s.id === currentTrack.id)
        : -1;

      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = queue.length - 1;
      }

      const prevSong = queue[prevIndex];
      if (prevSong) {
        state.playSong(prevSong, queue);
      }
    },

    nextTrack: () => get().playNext(),
    prevTrack: () => get().playPrev(),

    seekTo: (percent: number) => {
      if (!globalAudio || !globalAudio.duration) return;
      const targetTime = (percent / 100) * globalAudio.duration;
      globalAudio.currentTime = targetTime;
      set({ currentTime: targetTime, progress: percent });
    },

    setVolume: (level: number) => {
      const clamped = Math.max(0, Math.min(1, level));
      if (globalAudio) {
        globalAudio.volume = clamped;
      }
      set({ volume: clamped });
    },

    togglePlayerOpen: (open?: boolean) => {
      set((state) => ({
        isPlayerOpen: open !== undefined ? open : !state.isPlayerOpen,
      }));
    },

    setActiveTab: (tab: "up_next" | "lyrics" | "related") => {
      set({ activeTab: tab });
    },

    toggleShuffle: () => {
      set((state) => {
        const isShuffled = !state.isShuffled;
        if (isShuffled) {
          const current = state.currentTrack;
          const remaining = state.queue.filter((s) => s.id !== current?.id);
          // Fisher-Yates shuffle
          for (let i = remaining.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
          }
          return {
            isShuffled: true,
            queue: current ? [current, ...remaining] : remaining,
          };
        } else {
          return {
            isShuffled: false,
            queue: state.originalQueue,
          };
        }
      });
    },

    toggleRepeat: () => {
      set((state) => {
        const nextMode =
          state.repeatMode === "off"
            ? "all"
            : state.repeatMode === "all"
            ? "one"
            : "off";
        return { repeatMode: nextMode };
      });
    },

    toggleLike: (songOrId: Song | string) => {
      const state = get();
      const song =
        typeof songOrId === "string"
          ? state.queue.find((s) => s.id === songOrId) ||
            state.likedSongs.find((s) => s.id === songOrId) ||
            state.recentlyPlayed.find((s) => s.id === songOrId) ||
            state.currentTrack
          : songOrId;

      if (!song) return;

      const sanitized = sanitizeSong(song);
      const likedIds = { ...state.likedSongIds };
      const dislikedIds = { ...state.dislikedSongIds };
      let updatedLikedSongs = [...state.likedSongs];

      const isCurrentlyLiked = Boolean(likedIds[song.id]);

      if (isCurrentlyLiked) {
        delete likedIds[song.id];
        updatedLikedSongs = updatedLikedSongs.filter((s) => s.id !== song.id);
      } else {
        likedIds[song.id] = true;
        delete dislikedIds[song.id];
        updatedLikedSongs = [
          sanitized,
          ...updatedLikedSongs.filter((s) => s.id !== song.id),
        ].slice(0, 50); // Strict max 50 items

        // Boost taste affinity (+5)
        const taste = { ...state.userTasteProfile };
        const artist = (song.primaryArtists || "").toLowerCase().trim();
        if (artist) {
          taste.artistWeights[artist] = (taste.artistWeights[artist] || 0) + 5;
        }
        const genres = detectGenres(song);
        for (const g of genres) {
          taste.genreWeights[g] = (taste.genreWeights[g] || 0) + 5;
        }
        saveStorage("rhythmx_taste_profile", taste);
      }

      persistUserData({ likedSongs: updatedLikedSongs });
      saveStorage("rhythmx_liked_songs", likedIds);
      saveStorage("rhythmx_disliked_songs", dislikedIds);

      set({
        likedSongIds: likedIds,
        dislikedSongIds: dislikedIds,
        likedSongs: updatedLikedSongs,
      });
    },

    toggleLikeSong: (song: Song) => {
      get().toggleLike(song);
    },

    recordSearchQuery: (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      const state = get();
      const updated = [
        trimmed,
        ...state.recentSearches.filter(
          (q) => q.toLowerCase() !== trimmed.toLowerCase()
        ),
      ].slice(0, 10);

      set({ recentSearches: updated });
      persistUserData({ recentSearches: updated });
    },

    clearRecentSearches: () => {
      set({ recentSearches: [] });
      persistUserData({ recentSearches: [] });
    },

    removeRecentSearch: (query: string) => {
      const state = get();
      const updated = state.recentSearches.filter(
        (q) => q.toLowerCase() !== query.toLowerCase()
      );
      set({ recentSearches: updated });
      persistUserData({ recentSearches: updated });
    },

    getFrequentlyPlayed: () => {
      const freq = get().playFrequency;
      return Object.values(freq)
        .sort((a, b) => b.count - a.count)
        .map((item) => item.song)
        .slice(0, 10);
    },

    toggleDislike: (songOrId: Song | string) => {
      const state = get();
      const song =
        typeof songOrId === "string"
          ? state.queue.find((s) => s.id === songOrId) || state.currentTrack
          : songOrId;
      if (!song) return;

      const disliked = { ...state.dislikedSongIds };
      const liked = { ...state.likedSongIds };
      disliked[song.id] = true;
      delete liked[song.id];

      const updatedLikedSongs = state.likedSongs.filter((s) => s.id !== song.id);

      // Penalize artist & genre affinity (-5)
      const taste = { ...state.userTasteProfile };
      const artist = (song.primaryArtists || "").toLowerCase().trim();
      if (artist && taste.artistWeights[artist]) {
        taste.artistWeights[artist] = Math.max(0, taste.artistWeights[artist] - 5);
      }
      const genres = detectGenres(song);
      for (const g of genres) {
        if (taste.genreWeights[g]) {
          taste.genreWeights[g] = Math.max(0, taste.genreWeights[g] - 5);
        }
      }

      saveStorage("rhythmx_taste_profile", taste);
      saveStorage("rhythmx_disliked_songs", disliked);
      saveStorage("rhythmx_liked_songs", liked);
      persistUserData({ likedSongs: updatedLikedSongs });

      // Remove from queue
      const updatedQueue = state.queue.filter((s) => s.id !== song.id);

      // If current track was disliked, skip to next immediately
      if (state.currentTrack?.id === song.id) {
        state.playNext();
      }

      set({
        dislikedSongIds: disliked,
        likedSongIds: liked,
        likedSongs: updatedLikedSongs,
        queue: updatedQueue,
        originalQueue: updatedQueue,
      });
    },

    removeFromQueue: (index: number) => {
      set((state) => {
        const newQueue = [...state.queue];
        newQueue.splice(index, 1);
        return { queue: newQueue };
      });
    },

    reorderQueue: (fromIndex: number, toIndex: number) => {
      set((state) => {
        const newQueue = [...state.queue];
        const [moved] = newQueue.splice(fromIndex, 1);
        newQueue.splice(toIndex, 0, moved);
        return { queue: newQueue };
      });
    },

    clearQueue: () => {
      set({ queue: [], originalQueue: [] });
    },

    setActiveMood: (mood: CategoryMood | string) => {
      set({ activeMood: mood });
    },

    toggleAutoplay: () => {
      set((state) => {
        const next = !state.autoplayEnabled;
        return { autoplay: next, autoplayEnabled: next };
      });
    },

    setAutoplayEnabled: (enabled: boolean) => {
      set({ autoplay: enabled, autoplayEnabled: enabled });
    },

    getTopAffinityGenre: () => {
      const weights = get().userTasteProfile.genreWeights;
      let topGenre = "Gym Phonk";
      let maxWeight = -1;
      for (const [genre, weight] of Object.entries(weights)) {
        if (weight > maxWeight) {
          maxWeight = weight;
          topGenre = genre;
        }
      }
      return topGenre;
    },

    getTopArtists: () => {
      const weights = get().userTasteProfile.artistWeights;
      return Object.entries(weights)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([artist]) => artist);
    },

    getPersonalizedSpeedDial: (pool?: Song[]) => {
      const state = get();
      const songs =
        pool && pool.length > 0 ? pool : state.userTasteProfile.recentlyPlayed;
      if (!songs || songs.length === 0) return [];

      const weights = state.userTasteProfile.artistWeights;
      const sorted = [...songs].sort((a, b) => {
        const weightA = weights[(a.primaryArtists || "").toLowerCase().trim()] || 0;
        const weightB = weights[(b.primaryArtists || "").toLowerCase().trim()] || 0;
        return weightB - weightA;
      });

      return sorted.slice(0, 9);
    },
  };
});
