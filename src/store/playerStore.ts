import { create } from 'zustand';
import { Song, FALLBACK_CATALOG, fetchSongsByQuery } from '@/services/api';
import { audioEngine } from '@/services/audioService';

interface PlayerState {
  currentTrack: Song | null;
  isPlaying: boolean;
  queue: Song[];
  historyIds: Set<string>;
  likedSongs: Song[];
  volume: number;
  currentTime: number;
  duration: number;
  playTrack: (song: Song) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (secs: number) => void;
  setVolume: (vol: number) => void;
  toggleLike: (song: Song) => void;
  setQueue: (songs: Song[]) => void;
  checkAndExpandQueue: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
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

  const initialLiked = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('rhythmx_liked_songs') || '[]')
    : [];

  return {
    currentTrack: null,
    isPlaying: false,
    queue: FALLBACK_CATALOG,
    historyIds: new Set<string>(),
    likedSongs: initialLiked,
    volume: 1,
    currentTime: 0,
    duration: 0,

    playTrack: (song: Song) => {
      const { historyIds } = get();
      const updatedHistory = new Set(historyIds).add(song.id);
      set({ currentTrack: song, isPlaying: true, historyIds: updatedHistory });
      audioEngine.playTrack(song.streamUrl, song.name, song.primaryArtists, song.imageUrl);
      get().checkAndExpandQueue();
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
      const { queue, currentTrack } = get();
      if (queue.length === 0) return;
      const idx = queue.findIndex((s) => s.id === currentTrack?.id);
      const nextSong = queue[(idx + 1) % queue.length];
      get().playTrack(nextSong);
    },

    playPrev: () => {
      const { queue, currentTrack } = get();
      if (queue.length === 0) return;
      const idx = queue.findIndex((s) => s.id === currentTrack?.id);
      const prevSong = queue[(idx - 1 + queue.length) % queue.length];
      get().playTrack(prevSong);
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
      const updated = exists ? likedSongs.filter((s) => s.id !== song.id) : [...likedSongs, song];
      set({ likedSongs: updated });
      if (typeof window !== 'undefined') {
        localStorage.setItem('rhythmx_liked_songs', JSON.stringify(updated));
      }
    },

    setQueue: (songs: Song[]) => set({ queue: songs }),

    checkAndExpandQueue: async () => {
      const { queue, currentTrack, historyIds } = get();
      if (!currentTrack) return;
      const currentIndex = queue.findIndex((s) => s.id === currentTrack.id);

      // When 2 or fewer songs remain in queue, fetch recommendations based on artist
      if (currentIndex >= queue.length - 2) {
        const query = currentTrack.primaryArtists.split(',')[0] || currentTrack.language || 'Trending India';
        const freshSongs = await fetchSongsByQuery(query);
        const deduplicated = freshSongs.filter((s) => !historyIds.has(s.id) && !queue.some((q) => q.id === s.id));

        if (deduplicated.length > 0) {
          set({ queue: [...queue, ...deduplicated] });
        }
      }
    }
  };
});
