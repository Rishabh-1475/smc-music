import { create } from "zustand";
import { Song, CategoryMood } from "@/types/music";
import { getRadioForTrack } from "@/services/api";

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
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

export interface PlayerState {
  // State
  currentTrack: Song | null;
  queue: Song[];
  originalQueue: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  isPlayerOpen: boolean;
  activeTab: "up_next" | "lyrics" | "related";
  isShuffled: boolean;
  repeatMode: "off" | "all" | "one";
  likedSongIds: Record<string, boolean>;
  dislikedSongIds: Record<string, boolean>;
  listeningHistory: Song[];
  activeMood: CategoryMood;
  isLiked?: Record<string, boolean>; // Compatibility alias
  autoplay: boolean;

  // Actions
  playSong: (song: Song, contextQueue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  nextTrack: () => void;
  playPrev: () => void;
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
  setActiveMood: (mood: CategoryMood) => void;
  clearQueue: () => void;
  toggleAutoplay?: () => void;
  setQueue?: (tracks: Song[]) => void;

  [key: string]: any;
}

// LocalStorage helpers
const loadStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(key);
      if (item) return JSON.parse(item);
    } catch {
      // Ignore parse failure
    }
  }
  return defaultValue;
};

const saveStorage = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota error
    }
  }
};

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Sync MediaSession API
  const syncMediaSession = (track: Song, isPlayingState = true) => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    const artworkUrl = track.imageUrl || CLEAN_VINYL_COVER;
    const albumTitle = track.album || "SMC Music";

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name || track.title || "Track",
        artist: track.primaryArtists || "Singhs Music Co",
        album: albumTitle,
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
    } catch {
      // Suppress MediaSession errors
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
      const { repeatMode, currentTrack, autoplay } = get();

      // Loop current if repeat is 'one'
      if (repeatMode === "one" && currentTrack && globalAudio) {
        globalAudio.currentTime = 0;
        globalAudio.play().catch(() => {});
        return;
      }

      // Auto-advance if autoplay is enabled
      if (autoplay) {
        get().playNext();
      } else {
        set({ isPlaying: false });
      }
    };

    globalAudio.onerror = () => {
      set({ isPlaying: false });
      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "none";
      }
    };
  }

  // Next track progression handler with Repeat & Shuffle awareness
  const handleNextTrack = () => {
    const { queue, currentTrack, isShuffled, repeatMode, autoplay } = get();
    if (!queue || queue.length === 0) return;

    if (repeatMode === "one" && currentTrack && globalAudio) {
      globalAudio.currentTime = 0;
      globalAudio.play().catch(() => {});
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
      if (repeatMode === "all" || (autoplay && repeatMode !== "off")) {
        get().playSong(queue[0], queue);
      } else if (repeatMode === "off") {
        set({ isPlaying: false });
      }
    }
  };

  // Previous track handler (>3s restarts current track)
  const handlePrevTrack = () => {
    const { queue, currentTrack, currentTime } = get();
    if (!queue || queue.length === 0) return;

    if (currentTime > 3 && globalAudio) {
      globalAudio.currentTime = 0;
      set({ currentTime: 0, progress: 0 });
      return;
    }

    const currentIdx = queue.findIndex((t) => t.id === currentTrack?.id);
    const prevIdx = currentIdx - 1 >= 0 ? currentIdx - 1 : queue.length - 1;
    get().playSong(queue[prevIdx], queue);
  };

  // Initial persistent state from localStorage
  const initialLikes = loadStorage<Record<string, boolean>>("smc_liked_song_ids", {});
  const initialDislikes = loadStorage<Record<string, boolean>>("smc_disliked_song_ids", {});
  const initialHistory = loadStorage<Song[]>("smc_listening_history", []);

  return {
    currentTrack: null,
    queue: [],
    originalQueue: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    volume: 1,
    isPlayerOpen: false,
    activeTab: "up_next",
    isShuffled: false,
    repeatMode: "off",
    likedSongIds: initialLikes,
    dislikedSongIds: initialDislikes,
    listeningHistory: initialHistory,
    activeMood: "All",
    isLiked: initialLikes, // Backward-compatibility alias
    autoplay: true,

    playSong: (song: Song, contextQueue?: Song[]) => {
      if (!song?.audioUrl) return;

      // 1. Maintain queue
      const activeQueue =
        contextQueue && contextQueue.length > 0
          ? contextQueue
          : get().queue.length > 0
          ? get().queue
          : [song];

      const exists = activeQueue.some((s) => s.id === song.id);
      const finalQueue = exists ? activeQueue : [song, ...activeQueue];

      // 2. Update listening history & playCount
      const currentHistory = get().listeningHistory || [];
      const updatedHistory = [
        song,
        ...currentHistory.filter((s) => s.id !== song.id),
      ].slice(0, 30);
      saveStorage("smc_listening_history", updatedHistory);

      const updatedSong: Song = {
        ...song,
        playCount: (song.playCount || 0) + 1,
        isLiked: Boolean(get().likedSongIds[song.id]),
        isDisliked: Boolean(get().dislikedSongIds[song.id]),
      };

      set({
        currentTrack: updatedSong,
        queue: finalQueue,
        originalQueue: finalQueue,
        listeningHistory: updatedHistory,
        isPlaying: true,
      });

      // 3. Audio stream initialization
      if (globalAudio) {
        globalAudio.pause();
        globalAudio.currentTime = 0;
        globalAudio.src = song.audioUrl;
        globalAudio.load();

        const playPromise = globalAudio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              set({ isPlaying: true });
              syncMediaSession(updatedSong, true);
            })
            .catch(() => {
              set({ isPlaying: false });
              if (typeof window !== "undefined" && "mediaSession" in navigator) {
                navigator.mediaSession.playbackState = "paused";
              }
            });
        }
      }

      // 4. Auto-generate "Related / Up Next" queue using the artist/genre if queue is short
      if (finalQueue.length <= 2) {
        getRadioForTrack(song.primaryArtists || song.name).then((radioTracks) => {
          if (radioTracks.length > 0) {
            const currentQ = get().queue;
            const newTracks = radioTracks.filter((t) => !currentQ.some((q) => q.id === t.id));
            if (newTracks.length > 0) {
              set({ queue: [...currentQ, ...newTracks] });
            }
          }
        }).catch(() => {});
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
              .catch(() => {
                set({ isPlaying: false });
              });
          }
        }
      }
    },

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

    setActiveTab: (tab: "up_next" | "lyrics" | "related") => {
      set({ activeTab: tab });
    },

    toggleShuffle: () => {
      const { isShuffled, queue, originalQueue, currentTrack } = get();
      if (!isShuffled) {
        // Shuffle queue keeping currentTrack first
        const remaining = queue.filter((t) => t.id !== currentTrack?.id);
        for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        set({
          isShuffled: true,
          queue: currentTrack ? [currentTrack, ...remaining] : remaining,
        });
      } else {
        // Restore original queue order
        set({
          isShuffled: false,
          queue: originalQueue.length > 0 ? originalQueue : queue,
        });
      }
    },

    toggleRepeat: () => {
      const { repeatMode } = get();
      const nextMode: "off" | "all" | "one" =
        repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off";
      set({ repeatMode: nextMode });
    },

    toggleLike: (songOrId: Song | string) => {
      const songId = typeof songOrId === "string" ? songOrId : songOrId.id;
      const { likedSongIds, dislikedSongIds, currentTrack } = get();

      const isCurrentlyLiked = Boolean(likedSongIds[songId]);
      const nextLiked = { ...likedSongIds };
      const nextDisliked = { ...dislikedSongIds };

      if (isCurrentlyLiked) {
        delete nextLiked[songId];
      } else {
        nextLiked[songId] = true;
        delete nextDisliked[songId]; // If liked, remove from disliked
      }

      saveStorage("smc_liked_song_ids", nextLiked);
      saveStorage("smc_disliked_song_ids", nextDisliked);

      set({
        likedSongIds: nextLiked,
        dislikedSongIds: nextDisliked,
        isLiked: nextLiked, // Compatibility alias
        currentTrack:
          currentTrack?.id === songId
            ? { ...currentTrack, isLiked: !isCurrentlyLiked, isDisliked: false }
            : currentTrack,
      });
    },

    toggleDislike: (songOrId: Song | string) => {
      const songId = typeof songOrId === "string" ? songOrId : songOrId.id;
      const { likedSongIds, dislikedSongIds, currentTrack } = get();

      const isCurrentlyDisliked = Boolean(dislikedSongIds[songId]);
      const nextLiked = { ...likedSongIds };
      const nextDisliked = { ...dislikedSongIds };

      if (isCurrentlyDisliked) {
        delete nextDisliked[songId];
      } else {
        nextDisliked[songId] = true;
        delete nextLiked[songId]; // If disliked, remove from liked
      }

      saveStorage("smc_liked_song_ids", nextLiked);
      saveStorage("smc_disliked_song_ids", nextDisliked);

      set({
        likedSongIds: nextLiked,
        dislikedSongIds: nextDisliked,
        isLiked: nextLiked,
        currentTrack:
          currentTrack?.id === songId
            ? { ...currentTrack, isDisliked: !isCurrentlyDisliked, isLiked: false }
            : currentTrack,
      });

      // If disliked currently playing song, auto-skip to next track
      if (!isCurrentlyDisliked && currentTrack?.id === songId) {
        get().playNext();
      }
    },

    removeFromQueue: (index: number) => {
      const newQueue = [...get().queue];
      newQueue.splice(index, 1);
      set({ queue: newQueue });
    },

    reorderQueue: (fromIndex: number, toIndex: number) => {
      const newQueue = Array.from(get().queue);
      const [movedItem] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedItem);
      set({ queue: newQueue });
    },

    setActiveMood: (mood: CategoryMood) => {
      set({ activeMood: mood });
    },

    clearQueue: () => {
      set({ queue: [] });
    },

    toggleAutoplay: () => {
      set((s) => ({ autoplay: !s.autoplay }));
    },

    setQueue: (tracks: Song[]) => {
      set({ queue: tracks, originalQueue: tracks });
    },
  };
});
