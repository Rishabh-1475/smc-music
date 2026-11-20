import { create } from 'zustand';
import { Song, FALLBACK_CATALOG, fetchRecommendations } from '@/services/api';
import { audioEngine } from '@/services/audioService';

export interface PlayerState {
  currentTrack: Song | null;
  isPlaying: boolean;
  queue: Song[];
  recents: Song[];
  history: Song[]; // Backwards compatibility alias
  likedSongs: Song[];
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';

  // Actions
  playTrack: (song: Song, customQueue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleLike: (song: Song) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  cycleRepeatMode: () => void;
  replenishQueue: () => Promise<void>;
  autoPopulateRadio: (song: Song) => Promise<void>;
  setQueue: (songs: Song[]) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Safe SSR / Client localStorage initialization
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

  // Wire up Persistent Audio Engine Callbacks
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
    audioEngine.setOnNext(() => {
      get().playNext();
    });
    audioEngine.setOnPrev(() => {
      get().playPrev();
    });
  }

  let prevVolume = 1;

  return {
    currentTrack: null,
    isPlaying: false,
    queue: FALLBACK_CATALOG,
    recents: initialRecents,
    history: initialRecents,
    likedSongs: initialLiked,
    volume: 1,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    isShuffle: false,
    repeatMode: 'all',

    playTrack: (song: Song, customQueue?: Song[]) => {
      const { recents, queue } = get();

      // LRU Recents Management: Prepend and deduplicate, max 30 items
      const filtered = recents.filter((s) => s.id !== song.id);
      const updatedRecents = [song, ...filtered].slice(0, 30);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('rhythmx_recents', JSON.stringify(updatedRecents));
        } catch (err) {
          console.warn('[RhythmX Store] Failed saving recents:', err);
        }
      }

      // Determine active queue
      let activeQueue = customQueue || queue;
      if (!customQueue && !queue.some((s) => s.id === song.id)) {
        activeQueue = [...queue, song];
      }

      set({
        currentTrack: song,
        isPlaying: true,
        recents: updatedRecents,
        history: updatedRecents,
        queue: activeQueue
      });

      audioEngine.playTrack(song.streamUrl, song.name, song.primaryArtists, song.imageUrl, song.album);

      // Trigger background queue replenishment if near end of queue (<= 2 tracks remaining)
      const currentIndex = activeQueue.findIndex((s) => s.id === song.id);
      if (currentIndex === -1 || currentIndex >= activeQueue.length - 2) {
        get().replenishQueue();
      }
    },

    togglePlay: () => {
      const { currentTrack, queue } = get();
      if (!currentTrack) {
        if (queue.length > 0) {
          get().playTrack(queue[0]);
        }
        return;
      }
      audioEngine.toggle();
      set({ isPlaying: audioEngine.isPlaying() });
    },

    playNext: () => {
      const { queue, currentTrack, repeatMode, isShuffle } = get();
      if (queue.length === 0) return;

      // Repeat current track
      if (repeatMode === 'one' && currentTrack) {
        audioEngine.seek(0);
        set({ currentTime: 0 });
        audioEngine.playTrack(currentTrack.streamUrl, currentTrack.name, currentTrack.primaryArtists, currentTrack.imageUrl, currentTrack.album);
        return;
      }

      // Shuffle logic
      if (isShuffle && queue.length > 1) {
        let randIdx = Math.floor(Math.random() * queue.length);
        if (currentTrack && queue[randIdx].id === currentTrack.id) {
          randIdx = (randIdx + 1) % queue.length;
        }
        get().playTrack(queue[randIdx]);
        return;
      }

      // Normal queue advancement
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

      // Check if we need to replenish
      if (idx >= queue.length - 3) {
        get().replenishQueue();
      }
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

    seek: (seconds: number) => {
      audioEngine.seek(seconds);
      set({ currentTime: seconds });
    },

    setVolume: (val: number) => {
      const clamped = Math.max(0, Math.min(1, val));
      if (clamped > 0) prevVolume = clamped;
      audioEngine.setVolume(clamped);
      set({ volume: clamped, isMuted: clamped === 0 });
    },

    toggleMute: () => {
      const { volume } = get();
      if (volume === 0) {
        const restore = prevVolume || 1;
        audioEngine.setVolume(restore);
        set({ volume: restore, isMuted: false });
      } else {
        prevVolume = volume;
        audioEngine.setVolume(0);
        set({ volume: 0, isMuted: true });
      }
    },

    toggleLike: (song: Song) => {
      const { likedSongs } = get();
      const exists = likedSongs.some((s) => s.id === song.id);
      const updated = exists ? likedSongs.filter((s) => s.id !== song.id) : [song, ...likedSongs];
      set({ likedSongs: updated });

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('rhythmx_liked_songs', JSON.stringify(updated));
        } catch (err) {
          console.warn('[RhythmX Store] Failed saving liked songs:', err);
        }
      }
    },

    toggleShuffle: () => {
      set({ isShuffle: !get().isShuffle });
    },

    toggleRepeat: () => {
      const { repeatMode } = get();
      const nextMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
      set({ repeatMode: nextMode });
    },

    cycleRepeatMode: () => {
      get().toggleRepeat();
    },

    replenishQueue: async () => {
      const { currentTrack, queue, recents } = get();
      if (!currentTrack) return;

      try {
        const query = currentTrack.primaryArtists || currentTrack.language || currentTrack.name;
        const fresh = await fetchRecommendations(query);
        const existingIds = new Set([...queue.map((q) => q.id), ...recents.map((r) => r.id)]);
        const deduplicated = fresh.filter((s) => !existingIds.has(s.id));

        if (deduplicated.length > 0) {
          set({ queue: [...queue, ...deduplicated.slice(0, 15)] });
        }
      } catch (err) {
        console.warn('[RhythmX Store] Replenish queue error:', err);
      }
    },

    autoPopulateRadio: async () => {
      return get().replenishQueue();
    },

    setQueue: (songs: Song[]) => set({ queue: songs })
  };
});
