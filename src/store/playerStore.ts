import { create } from "zustand";
import { Song, CategoryMood, UserTasteProfile } from "@/types/music";
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
  userTasteProfile: UserTasteProfile;
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
  getTopAffinityGenre: () => string | null;
  getTopArtists: () => string[];
  getPersonalizedSpeedDial: (pool?: Song[]) => Song[];

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

// Genre & Mood detection helper
const detectGenres = (song: Song): string[] => {
  const text = `${song.name} ${song.title || ""} ${song.primaryArtists || ""} ${song.album || ""}`.toLowerCase();
  const genres: string[] = [];

  if (/workout|gym|hype|beast mode|motivation|cardio|pump|fitness/i.test(text)) {
    genres.push("workout");
  }
  if (/phonk|drift|kordhell|brazilian|montagem|gigachad/i.test(text)) {
    genres.push("phonk");
  }
  if (/punjabi|sidhu|moose wala|aujla|diljit|shubh|ap dhillon|bhangra|amrit maan/i.test(text)) {
    genres.push("punjabi");
  }
  if (/bollywood|arijit|hindi|pritam|shreya|sachin-jigar|vishal|kishore|sonu/i.test(text)) {
    genres.push("bollywood");
  }
  if (/chill|lofi|relax|acoustic|midnight|ambient|study|peaceful/i.test(text)) {
    genres.push("chill");
  }
  if (/party|club|dance|remix|electronic|edm|dj|bass/i.test(text)) {
    genres.push("party");
  }
  if (/romance|love|romantic|ishq|dil|pyaar|sanam/i.test(text)) {
    genres.push("romance");
  }

  return genres;
};

// Initial state loader
const getInitialTasteProfile = (): UserTasteProfile => {
  return loadStorage<UserTasteProfile>("smc_user_taste_profile", {
    artistWeights: {},
    genreWeights: {},
    recentlyPlayedMoods: [],
    likedTrackIds: {},
    dislikedTrackIds: {},
  });
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

  // Next track progression handler with Repeat, Shuffle & Dislike filtering
  const handleNextTrack = () => {
    const { queue, currentTrack, isShuffled, repeatMode, autoplay, dislikedSongIds } = get();
    if (!queue || queue.length === 0) return;

    if (repeatMode === "one" && currentTrack && globalAudio) {
      globalAudio.currentTime = 0;
      globalAudio.play().catch(() => {});
      return;
    }

    // Filter out any disliked tracks from playback
    const playableQueue = queue.filter((t) => !dislikedSongIds[t.id]);
    if (playableQueue.length === 0) {
      set({ isPlaying: false });
      return;
    }

    if (isShuffled && playableQueue.length > 1) {
      const currentIdx = playableQueue.findIndex((t) => t.id === currentTrack?.id);
      let randIdx = Math.floor(Math.random() * playableQueue.length);
      while (randIdx === currentIdx && playableQueue.length > 1) {
        randIdx = Math.floor(Math.random() * playableQueue.length);
      }
      get().playSong(playableQueue[randIdx], playableQueue);
      return;
    }

    const currentIdx = playableQueue.findIndex((t) => t.id === currentTrack?.id);
    const nextIdx = currentIdx + 1;

    if (nextIdx < playableQueue.length) {
      get().playSong(playableQueue[nextIdx], playableQueue);
    } else {
      if (repeatMode === "all" || (autoplay && repeatMode !== "off")) {
        get().playSong(playableQueue[0], playableQueue);
      } else if (repeatMode === "off") {
        set({ isPlaying: false });
      }
    }
  };

  // Previous track handler (>3s restarts current track)
  const handlePrevTrack = () => {
    const { queue, currentTrack, currentTime, dislikedSongIds } = get();
    if (!queue || queue.length === 0) return;

    if (currentTime > 3 && globalAudio) {
      globalAudio.currentTime = 0;
      set({ currentTime: 0, progress: 0 });
      return;
    }

    const playableQueue = queue.filter((t) => !dislikedSongIds[t.id]);
    const currentIdx = playableQueue.findIndex((t) => t.id === currentTrack?.id);
    const prevIdx = currentIdx - 1 >= 0 ? currentIdx - 1 : playableQueue.length - 1;
    if (playableQueue[prevIdx]) {
      get().playSong(playableQueue[prevIdx], playableQueue);
    }
  };

  // Initial persistent state from localStorage
  const initialLikes = loadStorage<Record<string, boolean>>("smc_liked_song_ids", {});
  const initialDislikes = loadStorage<Record<string, boolean>>("smc_disliked_song_ids", {});
  const initialHistory = loadStorage<Song[]>("smc_listening_history", []);
  const initialTaste = getInitialTasteProfile();

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
    userTasteProfile: initialTaste,
    isLiked: initialLikes,
    autoplay: true,

    playSong: (song: Song, contextQueue?: Song[]) => {
      if (!song?.audioUrl) return;

      // 1. Maintain queue (filter out disliked songs)
      const { dislikedSongIds, userTasteProfile } = get();
      if (dislikedSongIds[song.id]) return;

      const activeQueue =
        contextQueue && contextQueue.length > 0
          ? contextQueue.filter((t) => !dislikedSongIds[t.id])
          : get().queue.length > 0
          ? get().queue.filter((t) => !dislikedSongIds[t.id])
          : [song];

      const exists = activeQueue.some((s) => s.id === song.id);
      const finalQueue = exists ? activeQueue : [song, ...activeQueue];

      // 2. Self-learning: update taste profile affinity (+2 for artist & detected genres)
      const updatedArtistWeights = { ...userTasteProfile.artistWeights };
      const artists = (song.primaryArtists || "")
        .split(",")
        .map((a) => a.trim().toLowerCase())
        .filter(Boolean);

      for (const a of artists) {
        updatedArtistWeights[a] = (updatedArtistWeights[a] || 0) + 2;
      }

      const updatedGenreWeights = { ...userTasteProfile.genreWeights };
      const detected = detectGenres(song);
      for (const g of detected) {
        updatedGenreWeights[g] = (updatedGenreWeights[g] || 0) + 2;
      }

      const updatedMoods = [
        ...detected,
        ...(userTasteProfile.recentlyPlayedMoods || []).filter((m) => !detected.includes(m)),
      ].slice(0, 10);

      const updatedTaste: UserTasteProfile = {
        ...userTasteProfile,
        artistWeights: updatedArtistWeights,
        genreWeights: updatedGenreWeights,
        recentlyPlayedMoods: updatedMoods,
      };

      saveStorage("smc_user_taste_profile", updatedTaste);

      // 3. Update listening history & playCount
      const currentHistory = get().listeningHistory || [];
      const updatedHistory = [
        song,
        ...currentHistory.filter((s) => s.id !== song.id && !dislikedSongIds[s.id]),
      ].slice(0, 30);
      saveStorage("smc_listening_history", updatedHistory);

      const updatedSong: Song = {
        ...song,
        playCount: (song.playCount || 0) + 1,
        isLiked: Boolean(get().likedSongIds[song.id]),
        isDisliked: false,
      };

      set({
        currentTrack: updatedSong,
        queue: finalQueue,
        originalQueue: finalQueue,
        listeningHistory: updatedHistory,
        userTasteProfile: updatedTaste,
        isPlaying: true,
      });

      // 4. Audio stream initialization
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

      // 5. Auto-generate "Related / Up Next" queue using the artist/genre if queue is short
      if (finalQueue.length <= 2) {
        getRadioForTrack(song.primaryArtists || song.name)
          .then((radioTracks) => {
            if (radioTracks.length > 0) {
              const currentQ = get().queue;
              const newTracks = radioTracks.filter(
                (t) => !currentQ.some((q) => q.id === t.id) && !dislikedSongIds[t.id]
              );
              if (newTracks.length > 0) {
                set({ queue: [...currentQ, ...newTracks] });
              }
            }
          })
          .catch(() => {});
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
      const targetSong = typeof songOrId === "string" ? get().currentTrack : songOrId;
      const { likedSongIds, dislikedSongIds, currentTrack, userTasteProfile } = get();

      const isCurrentlyLiked = Boolean(likedSongIds[songId]);
      const nextLiked = { ...likedSongIds };
      const nextDisliked = { ...dislikedSongIds };

      const updatedArtistWeights = { ...userTasteProfile.artistWeights };
      const updatedGenreWeights = { ...userTasteProfile.genreWeights };

      if (isCurrentlyLiked) {
        delete nextLiked[songId];
      } else {
        nextLiked[songId] = true;
        delete nextDisliked[songId];

        // Automatic Affinity Learning: Thumbs Up boosts artist & genres by +5
        if (targetSong) {
          const artists = (targetSong.primaryArtists || "")
            .split(",")
            .map((a) => a.trim().toLowerCase())
            .filter(Boolean);

          for (const a of artists) {
            updatedArtistWeights[a] = (updatedArtistWeights[a] || 0) + 5;
          }

          const genres = detectGenres(targetSong);
          for (const g of genres) {
            updatedGenreWeights[g] = (updatedGenreWeights[g] || 0) + 5;
          }
        }
      }

      const updatedTaste: UserTasteProfile = {
        ...userTasteProfile,
        artistWeights: updatedArtistWeights,
        genreWeights: updatedGenreWeights,
        likedTrackIds: nextLiked,
        dislikedTrackIds: nextDisliked,
      };

      saveStorage("smc_liked_song_ids", nextLiked);
      saveStorage("smc_disliked_song_ids", nextDisliked);
      saveStorage("smc_user_taste_profile", updatedTaste);

      set({
        likedSongIds: nextLiked,
        dislikedSongIds: nextDisliked,
        isLiked: nextLiked,
        userTasteProfile: updatedTaste,
        currentTrack:
          currentTrack?.id === songId
            ? { ...currentTrack, isLiked: !isCurrentlyLiked, isDisliked: false }
            : currentTrack,
      });
    },

    toggleDislike: (songOrId: Song | string) => {
      const songId = typeof songOrId === "string" ? songOrId : songOrId.id;
      const targetSong = typeof songOrId === "string" ? get().currentTrack : songOrId;
      const { likedSongIds, dislikedSongIds, currentTrack, userTasteProfile, queue } = get();

      const isCurrentlyDisliked = Boolean(dislikedSongIds[songId]);
      const nextLiked = { ...likedSongIds };
      const nextDisliked = { ...dislikedSongIds };

      const updatedArtistWeights = { ...userTasteProfile.artistWeights };
      const updatedGenreWeights = { ...userTasteProfile.genreWeights };

      if (isCurrentlyDisliked) {
        delete nextDisliked[songId];
      } else {
        nextDisliked[songId] = true;
        delete nextLiked[songId];

        // Automatic Affinity Learning: Thumbs Down penalizes artist & genres by -10
        if (targetSong) {
          const artists = (targetSong.primaryArtists || "")
            .split(",")
            .map((a) => a.trim().toLowerCase())
            .filter(Boolean);

          for (const a of artists) {
            updatedArtistWeights[a] = Math.max(0, (updatedArtistWeights[a] || 0) - 10);
          }

          const genres = detectGenres(targetSong);
          for (const g of genres) {
            updatedGenreWeights[g] = Math.max(0, (updatedGenreWeights[g] || 0) - 10);
          }
        }
      }

      const updatedTaste: UserTasteProfile = {
        ...userTasteProfile,
        artistWeights: updatedArtistWeights,
        genreWeights: updatedGenreWeights,
        likedTrackIds: nextLiked,
        dislikedTrackIds: nextDisliked,
      };

      saveStorage("smc_liked_song_ids", nextLiked);
      saveStorage("smc_disliked_song_ids", nextDisliked);
      saveStorage("smc_user_taste_profile", updatedTaste);

      // Purge from active queue
      const purgedQueue = queue.filter((t) => t.id !== songId);

      set({
        likedSongIds: nextLiked,
        dislikedSongIds: nextDisliked,
        isLiked: nextLiked,
        queue: purgedQueue,
        userTasteProfile: updatedTaste,
        currentTrack:
          currentTrack?.id === songId
            ? { ...currentTrack, isDisliked: !isCurrentlyDisliked, isLiked: false }
            : currentTrack,
      });

      // If disliked the currently playing song, auto-advance to next track
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

    // Evaluates highest-affinity genre from userTasteProfile
    getTopAffinityGenre: () => {
      const { userTasteProfile } = get();
      const genreWeights = userTasteProfile?.genreWeights || {};
      let topGenre: string | null = null;
      let maxWeight = 0;

      for (const [genre, weight] of Object.entries(genreWeights)) {
        if (weight > maxWeight && weight >= 4) {
          maxWeight = weight;
          topGenre = genre;
        }
      }

      return topGenre;
    },

    // Returns top 5 preferred artists based on weighted playback and likes
    getTopArtists: () => {
      const { userTasteProfile } = get();
      const artistWeights = userTasteProfile?.artistWeights || {};
      return Object.entries(artistWeights)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([artist]) => artist);
    },

    // Populates 3x3 Speed Dial grid based on taste profile, history, and affinity
    getPersonalizedSpeedDial: (pool: Song[] = []) => {
      const { listeningHistory, userTasteProfile, dislikedSongIds } = get();
      const history = (listeningHistory || []).filter((s) => !dislikedSongIds[s.id]);
      const combined: Song[] = [...history];

      // Add pool songs matching top artists or genres
      const topArtists = Object.keys(userTasteProfile?.artistWeights || {});
      const topGenres = Object.keys(userTasteProfile?.genreWeights || {});

      for (const song of pool) {
        if (dislikedSongIds[song.id] || combined.some((s) => s.id === song.id)) {
          continue;
        }

        const songArtists = (song.primaryArtists || "").toLowerCase();
        const matchesArtist = topArtists.some((a) => songArtists.includes(a));
        const songGenres = detectGenres(song);
        const matchesGenre = songGenres.some((g) => topGenres.includes(g));

        if (matchesArtist || matchesGenre) {
          combined.push(song);
        }

        if (combined.length >= 9) break;
      }

      // If still fewer than 9, fill with pool tracks
      for (const song of pool) {
        if (!combined.some((s) => s.id === song.id) && !dislikedSongIds[song.id]) {
          combined.push(song);
        }
        if (combined.length >= 9) break;
      }

      return combined.slice(0, 9);
    },
  };
});
