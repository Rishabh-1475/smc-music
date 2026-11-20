import { create } from 'zustand';
import { Song, FALLBACK_CATALOG, fetchArtistRadio, fetchSongsByQuery } from '@/services/api';
import { audioEngine } from '@/services/audioService';

interface PlayerState {
  currentTrack: Song | null;
  isPlaying: boolean;
  queue: Song[];
  history: Song[];
  likedSongs: Song[];
  volume: number;
  currentTime: number;
  duration: number;
  repeatMode: 'off' | 'all' | 'one';
  isShuffle: boolean;

  // Actions
  playTrack: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (secs: number) => void;
  setVolume: (vol: number) => void;
  toggleLike: (song: Song) => void;
  setQueue: (songs: Song[]) => void;
  cycleRepeatMode: () => void;
  toggleShuffle: () => void;
  autoPopulateRadio: (song: Song) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Attach Audio Engine Subscriptions
  if (typeof window !== 'undefined') {
    audioEngine.subscribeState(() => {
      set({ isPlaying: audioEngine.isPlaying() });
    });
    audioEngine.subscribeTime((current, dur) => {
      set({ currentTime: current, duration: dur });
    });
    audioEngine.setOnEnded(() => {
      get().playNext();
    });
  }

  // Load Persisted Local Storage State safely
  const initialLiked: Song[] = typeof window !== 'undefined'
    ? (() => {
        try {
          return JSON.parse(localStorage.getItem('rhythmx_liked_songs') || '[]');
        } catch {
          return [];
        }
      })()
    : [];

  const initialRecents: Song[] = typeof window !== 'undefined'
    ? (() => {
        try {
          return JSON.parse(localStorage.getItem('rhythmx_recents') || '[]');
        } catch {
          return [];
        }
      })()
    : [];

  return {
    currentTrack: null,
    isPlaying: false,
    queue: FALLBACK_CATALOG,
    history: initialRecents,
    likedSongs: initialLiked,
    volume: 1,
    currentTime: 0,
    duration: 0,
    repeatMode: 'all',
    isShuffle: false,

    playTrack: (song: Song, newQueue?: Song[]) => {
      const { history, queue } = get();

      // LRU Recents Management: Prepend and deduplicate, max 30 items
      const filtered = history.filter((s) => s.id !== song.id);
      const updatedHistory = [song, ...filtered].slice(0, 30);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('rhythmx_recents', JSON.stringify(updatedHistory));
        } catch {}
      }

      // Update queue if provided, or append song if not already in queue
      let activeQueue = newQueue || queue;
      if (!newQueue && !queue.some((s) => s.id === song.id)) {
        activeQueue = [...queue, song];
      }

      set({
        currentTrack: song,
        isPlaying: true,
        history: updatedHistory,
        queue: activeQueue
      });

      audioEngine.playTrack(song.streamUrl, song.name, song.primaryArtists, song.imageUrl);

      // Check autoplay recommendation queue
      get().autoPopulateRadio(song);
    },

    togglePlay: () => {
      const { currentTrack, queue } = get();
      if (!currentTrack) {
        if (queue.length > 0) get().playTrack(queue[0]);
        return;
      }
      audioEngine.toggle();
      set({ isPlaying: audioEngine.isPlaying() });
    },

    playNext: () => {
      const { queue, currentTrack, repeatMode, isShuffle, currentTime } = get();
      if (queue.length === 0) return;

      if (repeatMode === 'one' && currentTrack) {
        audioEngine.seek(0);
        set({ currentTime: 0 });
        audioEngine.playTrack(currentTrack.streamUrl, currentTrack.name, currentTrack.primaryArtists, currentTrack.imageUrl);
        return;
      }

      if (isShuffle && queue.length > 1) {
        let randIdx = Math.floor(Math.random() * queue.length);
        if (currentTrack && queue[randIdx].id === currentTrack.id) {
          randIdx = (randIdx + 1) % queue.length;
        }
        get().playTrack(queue[randIdx]);
        return;
      }

      const idx = queue.findIndex((s) => s.id === currentTrack?.id);
      if (idx === -1) {
        get().playTrack(queue[0]);
        return;
      }

      if (idx === queue.length - 1 && repeatMode === 'off') {
        set({ isPlaying: false });
        return;
      }

      const nextSong = queue[(idx + 1) % queue.length];
      get().playTrack(nextSong);
    },

    playPrev: () => {
      const { queue, currentTrack, currentTime } = get();
      if (currentTime > 3) {
        audioEngine.seek(0);
        set({ currentTime: 0 });
        return;
      }

      if (queue.length === 0) return;
      const idx = queue.findIndex((s) => s.id === currentTrack?.id);
      const prevIdx = idx > 0 ? idx - 1 : queue.length - 1;
      get().playTrack(queue[prevIdx]);
    },

    seek: (secs: number) => {
      audioEngine.seek(secs);
      set({ currentTime: secs });
    },

    setVolume: (vol: number) => {
      audioEngine.setVolume(vol);
      set({ volume: vol });
    },

    toggleLike: (song: Song) => {
      const { likedSongs } = get();
      const exists = likedSongs.some((s) => s.id === song.id);
      const updated = exists ? likedSongs.filter((s) => s.id !== song.id) : [song, ...likedSongs];
      set({ likedSongs: updated });

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('rhythmx_liked_songs', JSON.stringify(updated));
        } catch {}
      }
    },

    setQueue: (songs: Song[]) => set({ queue: songs }),

    cycleRepeatMode: () => {
      const { repeatMode } = get();
      const nextMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
      set({ repeatMode: nextMode });
    },

    toggleShuffle: () => {
      set({ isShuffle: !get().isShuffle });
    },

    autoPopulateRadio: async (song: Song) => {
      const { queue, history } = get();
      if (!song) return;

      const currentIndex = queue.findIndex((s) => s.id === song.id);

      // Trigger recommendation fetch when <= 2 songs remain
      if (currentIndex === -1 || currentIndex >= queue.length - 2) {
        try {
          const fresh = await fetchArtistRadio(song.primaryArtists || song.name);
          const historyIds = new Set(history.map((h) => h.id));
          const queueIds = new Set(queue.map((q) => q.id));

          const deduplicated = fresh.filter((s) => !historyIds.has(s.id) && !queueIds.has(s.id));

          if (deduplicated.length > 0) {
            set({ queue: [...queue, ...deduplicated.slice(0, 15)] });
          }
        } catch (err) {
          console.warn('Auto radio error:', err);
        }
      }
    }
  };
});
