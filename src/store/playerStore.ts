import { create } from "zustand";
import { Song } from "@/types/music";

declare global {
  interface Window {
    __smc_audio?: HTMLAudioElement;
  }
}

/**
 * Permanent HTML5 Audio Singleton outside React's lifecycle.
 * Bound to window.__smc_audio to prevent garbage collection in Mobile WebViews.
 */
let globalAudio: HTMLAudioElement | null = null;

if (typeof window !== "undefined") {
  if (!window.__smc_audio) {
    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    window.__smc_audio = audio;
  }
  globalAudio = window.__smc_audio;
}

const CLEAN_VINYL_COVER =
  "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=600&q=80";

export interface PlayerState {
  currentTrack: Song | null;
  queue: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  isPlayerOpen: boolean;
  isShuffled: boolean;
  repeatMode: "off" | "all" | "one";
  isLiked: Record<string, boolean>;
  activeTab: "up_next" | "lyrics" | "related";

  // Actions
  playSong: (track: Song, playlistContext?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  nextTrack: () => void;
  playPrev: () => void;
  prevTrack: () => void;
  seekTo: (percent: number) => void;
  setVolume: (level: number) => void;
  togglePlayerOpen: (open?: boolean) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (id: string) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  setActiveTab: (tab: "up_next" | "lyrics" | "related") => void;

  [key: string]: any;
}

// Initial liked tracks from localStorage if available
const loadInitialLikes = (): Record<string, boolean> => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("smc_liked_tracks");
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore storage errors
    }
  }
  return {};
};

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Sync MediaSession with lockscreen action handlers & artwork
  const syncMediaSession = (track: Song, isPlayingState: boolean = true) => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    const artworkUrl = track.imageUrl || CLEAN_VINYL_COVER;
    const albumName =
      typeof track.album === "string"
        ? track.album
        : track.album?.name || "SMC Music";

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name || track.title || "Track",
        artist: track.primaryArtists || "Singhs Music Co",
        album: albumName,
        artwork: [
          { src: artworkUrl, sizes: "96x96", type: "image/jpeg" },
          { src: artworkUrl, sizes: "192x192", type: "image/jpeg" },
          { src: artworkUrl, sizes: "512x512", type: "image/jpeg" },
        ],
      });

      navigator.mediaSession.playbackState = isPlayingState ? "playing" : "paused";

      navigator.mediaSession.setActionHandler("play", () => {
        get().togglePlay();
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        get().togglePlay();
      });

      navigator.mediaSession.setActionHandler("nexttrack", () => {
        get().playNext();
      });

      navigator.mediaSession.setActionHandler("previoustrack", () => {
        get().playPrev();
      });

      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined && globalAudio) {
          globalAudio.currentTime = details.seekTime;
          const dur = globalAudio.duration || 0;
          const prog = dur > 0 ? (details.seekTime / dur) * 100 : 0;
          set({ currentTime: details.seekTime, progress: prog });
        }
      });
    } catch (err) {
      console.warn("[MediaSession Sync Error]", err);
    }
  };

  // Wire singleton audio event listeners once outside React
  if (typeof window !== "undefined" && globalAudio) {
    globalAudio.ontimeupdate = () => {
      const cur = globalAudio?.currentTime || 0;
      const dur = globalAudio?.duration || 0;
      const prog = dur > 0 ? (cur / dur) * 100 : 0;
      set({ currentTime: cur, duration: dur, progress: prog });
    };

    globalAudio.onended = () => {
      const { repeatMode, currentTrack } = get();
      if (repeatMode === "one" && currentTrack && globalAudio) {
        globalAudio.currentTime = 0;
        globalAudio.play().catch(console.error);
        return;
      }
      get().playNext();
    };

    globalAudio.onerror = (e) => {
      console.error("[SMC Audio Stream Error]", e, globalAudio?.error);
      set({ isPlaying: false });
      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "none";
      }
    };
  }

  // Next track progression handler with Repeat & Shuffle awareness
  const handleNextTrack = () => {
    const { queue, currentTrack, isShuffled, repeatMode } = get();
    if (!queue || queue.length === 0) return;

    if (repeatMode === "one" && currentTrack && globalAudio) {
      globalAudio.currentTime = 0;
      globalAudio.play().catch(console.error);
      return;
    }

    if (isShuffled && queue.length > 1) {
      const currentIdx = queue.findIndex((t) => t.id === currentTrack?.id);
      let randIdx = Math.floor(Math.random() * queue.length);
      while (randIdx === currentIdx && queue.length > 1) {
        randIdx = Math.floor(Math.random() * queue.length);
      }
      get().playSong(queue[randIdx], queue);
      return;
    }

    const currentIdx = queue.findIndex((t) => t.id === currentTrack?.id);
    const nextIdx = currentIdx + 1;

    if (nextIdx < queue.length) {
      get().playSong(queue[nextIdx], queue);
    } else {
      // End of queue: loop if repeat is 'all' or default
      if (repeatMode === "all" || repeatMode === "off") {
        get().playSong(queue[0], queue);
      }
    }
  };

  // Previous track handler with track restart logic (>3 seconds)
  const handlePrevTrack = () => {
    const { queue, currentTrack, currentTime } = get();
    if (!queue || queue.length === 0) return;

    // If song is more than 3 seconds in, restart track
    if (currentTime > 3 && globalAudio) {
      globalAudio.currentTime = 0;
      set({ currentTime: 0, progress: 0 });
      return;
    }

    const currentIdx = queue.findIndex((t) => t.id === currentTrack?.id);
    const prevIdx = currentIdx - 1 >= 0 ? currentIdx - 1 : queue.length - 1;
    get().playSong(queue[prevIdx], queue);
  };

  return {
    currentTrack: null,
    queue: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    volume: 1,
    isPlayerOpen: false,
    isShuffled: false,
    repeatMode: "off",
    isLiked: loadInitialLikes(),
    activeTab: "up_next",

    setQueue: (tracks: Song[]) => set({ queue: tracks }),

    playSong: (track: Song, playlistContext?: Song[]) => {
      if (!track?.audioUrl) {
        console.warn("[SMC Playback] Ignored song without valid audioUrl:", track);
        return;
      }

      const activeQueue =
        playlistContext && playlistContext.length > 0
          ? playlistContext
          : get().queue;
      const exists = activeQueue.some((s) => s.id === track.id);
      const finalQueue = exists ? activeQueue : [track, ...activeQueue];

      set({ currentTrack: track, queue: finalQueue, isPlaying: true });

      if (globalAudio) {
        // Sequential reset for mobile WebView audio pipeline
        globalAudio.pause();
        globalAudio.currentTime = 0;
        globalAudio.src = track.audioUrl;
        globalAudio.load();

        const playPromise = globalAudio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              set({ isPlaying: true });
              syncMediaSession(track, true);
            })
            .catch((err) => {
              console.error("Audio play failed:", err);
              set({ isPlaying: false });
              if (typeof window !== "undefined" && "mediaSession" in navigator) {
                navigator.mediaSession.playbackState = "paused";
              }
            });
        }
      }
    },

    togglePlay: () => {
      const { isPlaying, currentTrack, queue } = get();
      if (!currentTrack) {
        if (queue.length > 0) {
          get().playSong(queue[0]);
        }
        return;
      }

      if (globalAudio) {
        if (isPlaying) {
          globalAudio.pause();
          set({ isPlaying: false });
          if (typeof window !== "undefined" && "mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "paused";
          }
        } else {
          const playPromise = globalAudio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                set({ isPlaying: true });
                if (typeof window !== "undefined" && "mediaSession" in navigator) {
                  navigator.mediaSession.playbackState = "playing";
                }
              })
              .catch((err) => {
                console.error("Audio play failed:", err);
                set({ isPlaying: false });
              });
          }
        }
      }
    },

    // Aliased actions
    playNext: handleNextTrack,
    nextTrack: handleNextTrack,
    playPrev: handlePrevTrack,
    prevTrack: handlePrevTrack,

    seekTo: (percent: number) => {
      if (!globalAudio || !globalAudio.duration) return;
      const target = Math.max(
        0,
        Math.min(globalAudio.duration, (percent / 100) * globalAudio.duration)
      );
      globalAudio.currentTime = target;
      set({ currentTime: target, progress: percent });
    },

    setVolume: (level: number) => {
      const clamped = Math.max(0, Math.min(1, level));
      if (globalAudio) {
        globalAudio.volume = clamped;
      }
      set({ volume: clamped });
    },

    togglePlayerOpen: (open?: boolean) => {
      set({ isPlayerOpen: open !== undefined ? open : !get().isPlayerOpen });
    },

    toggleShuffle: () => {
      set({ isShuffled: !get().isShuffled });
    },

    toggleRepeat: () => {
      const { repeatMode } = get();
      const nextMode: "off" | "all" | "one" =
        repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off";
      set({ repeatMode: nextMode });
    },

    toggleLike: (id: string) => {
      const nextLikes = { ...get().isLiked, [id]: !get().isLiked[id] };
      set({ isLiked: nextLikes });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("smc_liked_tracks", JSON.stringify(nextLikes));
        } catch {
          // Ignore storage failures
        }
      }
    },

    removeFromQueue: (index: number) => {
      const newQueue = [...get().queue];
      newQueue.splice(index, 1);
      set({ queue: newQueue });
    },

    reorderQueue: (startIndex: number, endIndex: number) => {
      const newQueue = Array.from(get().queue);
      const [removed] = newQueue.splice(startIndex, 1);
      newQueue.splice(endIndex, 0, removed);
      set({ queue: newQueue });
    },

    setActiveTab: (tab: "up_next" | "lyrics" | "related") => {
      set({ activeTab: tab });
    },
  };
});
