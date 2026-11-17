import { create } from "zustand";
import { Song } from "@/types/music";

/**
 * HTML5 Audio Singleton outside React's lifecycle.
 */
let globalAudio: HTMLAudioElement | null = null;

if (typeof window !== "undefined") {
  globalAudio = new Audio();
  globalAudio.preload = "auto";
  globalAudio.crossOrigin = "anonymous";
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
  setQueue: (tracks: Song[]) => void;
  playSong: (track: Song, playlistContext?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  nextTrack: () => void;
  playPrev: () => void;
  prevTrack: () => void;
  seekTo: (progressPercent: number) => void;
  setVolume: (level: number) => void;
  [key: string]: any;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Sync MediaSession metadata and remote command handlers
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

  // Bind audio lifecycle listeners once on singleton
  if (typeof window !== "undefined" && globalAudio) {
    globalAudio.ontimeupdate = () => {
      const cur = globalAudio?.currentTime || 0;
      const dur = globalAudio?.duration || 0;
      const prog = dur > 0 ? (cur / dur) * 100 : 0;
      set({ currentTime: cur, duration: dur, progress: prog });
    };

    globalAudio.onended = () => {
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

  // Next Track Action Handler
  const handleNextTrack = () => {
    const { queue, currentTrack } = get();
    if (!queue || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack?.id);
    const nextIdx = idx + 1 < queue.length ? idx + 1 : 0;
    get().playSong(queue[nextIdx], queue);
  };

  // Previous Track Action Handler
  const handlePrevTrack = () => {
    const { queue, currentTrack } = get();
    if (!queue || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack?.id);
    const prevIdx = idx - 1 >= 0 ? idx - 1 : queue.length - 1;
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
        globalAudio.src = track.audioUrl;
        globalAudio
          .play()
          .then(() => {
            syncMediaSession(track, true);
          })
          .catch((err) => {
            console.error("[SMC Playback Blocked]", err);
            set({ isPlaying: false });
            if (typeof window !== "undefined" && "mediaSession" in navigator) {
              navigator.mediaSession.playbackState = "paused";
            }
          });
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
          globalAudio
            .play()
            .then(() => {
              set({ isPlaying: true });
              if (typeof window !== "undefined" && "mediaSession" in navigator) {
                navigator.mediaSession.playbackState = "playing";
              }
            })
            .catch((err) => {
              console.error("[SMC Toggle Play Error]", err);
            });
        }
      }
    },

    // Aliased next track actions
    playNext: handleNextTrack,
    nextTrack: handleNextTrack,

    // Aliased previous track actions
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
  };
});
