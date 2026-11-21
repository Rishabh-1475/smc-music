import { create } from 'zustand';
import { Song, fetchRadioRecommendations } from '@/services/api';
import { audioEngine } from '@/services/audioService';

interface PlayerState {
  currentTrack: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
  queue: Song[];
  playedHistoryIds: string[];
  recents: Song[];
  likedSongs: Song[];
  volume: number;
  currentTime: number;
  duration: number;
  isExpandingQueue: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  playTrack: (song: Song, customQueue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (secs: number) => void;
  setVolume: (vol: number) => void;
  toggleLike: (song: Song) => void;
  setQueue: (songs: Song[]) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
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
    audioEngine.setOnNext(() => {
      get().playNext();
    });
    audioEngine.setOnPrev(() => {
      get().playPrev();
    });
  }

  const initialLiked: Song[] =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('rhythmx_liked_songs') || '[]')
      : [];

  const initialRecents: Song[] =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('rhythmx_recents') || '[]')
      : [];

  const initialPlayedIds: string[] =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('rhythmx_played_ids') || '[]')
      : [];

  return {
    currentTrack: null,
    isPlaying: false,
    isLoading: false,
    queue: [],
    playedHistoryIds: initialPlayedIds,
    recents: initialRecents,
    likedSongs: initialLiked,
    volume: 1,
    currentTime: 0,
    duration: 0,
    isExpandingQueue: false,
    isShuffle: false,
    isRepeat: false,

    playTrack: (song: Song, customQueue?: Song[]) => {
      const { recents, queue, playedHistoryIds } = get();

      const updatedRecents = [song, ...recents.filter((s) => s.id !== song.id)].slice(0, 40);
      const updatedPlayedIds = Array.from(new Set([song.id, ...playedHistoryIds])).slice(0, 300);
      const activeQueue = customQueue && customQueue.length > 0 ? customQueue : (queue.length > 0 ? queue : [song]);

      set({
        currentTrack: song,
        isPlaying: true,
        recents: updatedRecents,
        playedHistoryIds: updatedPlayedIds,
        queue: activeQueue
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('rhythmx_recents', JSON.stringify(updatedRecents));
        localStorage.setItem('rhythmx_played_ids', JSON.stringify(updatedPlayedIds));
      }

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
      const { queue, currentTrack, isRepeat, isShuffle } = get();
      if (queue.length === 0) return;

      if (isRepeat && currentTrack) {
        audioEngine.seek(0);
        audioEngine.playTrack(currentTrack.streamUrl, currentTrack.name, currentTrack.primaryArtists, currentTrack.imageUrl);
        return;
      }

      if (isShuffle && queue.length > 1) {
        const otherTracks = queue.filter((s) => s.id !== currentTrack?.id);
        const randomSong = otherTracks[Math.floor(Math.random() * otherTracks.length)];
        get().playTrack(randomSong);
        return;
      }

      const idx = queue.findIndex((s) => s.id === currentTrack?.id);
      const nextIndex = idx >= 0 ? (idx + 1) % queue.length : 0;
      const nextSong = queue[nextIndex];

      get().playTrack(nextSong);
      get().checkAndExpandQueue();
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
      const prevIndex = (idx - 1 + queue.length) % queue.length;
      const prevSong = queue[prevIndex];

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
      const updated = exists
        ? likedSongs.filter((s) => s.id !== song.id)
        : [song, ...likedSongs];

      set({ likedSongs: updated });
      if (typeof window !== 'undefined') {
        localStorage.setItem('rhythmx_liked_songs', JSON.stringify(updated));
      }
    },

    setQueue: (songs: Song[]) => {
      if (songs && songs.length > 0) {
        set({ queue: songs });
      }
    },

    toggleShuffle: () => {
      set((state) => ({ isShuffle: !state.isShuffle }));
    },

    toggleRepeat: () => {
      set((state) => ({ isRepeat: !state.isRepeat }));
    },

    checkAndExpandQueue: async () => {
      const { currentTrack, queue, playedHistoryIds, isExpandingQueue } = get();
      if (!currentTrack || isExpandingQueue) return;

      const currentIndex = queue.findIndex((s) => s.id === currentTrack.id);
      const remainingTracks = queue.length - 1 - currentIndex;

      if (remainingTracks <= 2) {
        set({ isExpandingQueue: true });
        try {
          const recommendations = await fetchRadioRecommendations(currentTrack, playedHistoryIds);
          const existingQueueIds = new Set(queue.map((s) => s.id));

          const novelTracks = recommendations.filter((s) => !existingQueueIds.has(s.id));

          if (novelTracks.length > 0) {
            set((state) => ({
              queue: [...state.queue, ...novelTracks],
              isExpandingQueue: false
            }));
          } else {
            set({ isExpandingQueue: false });
          }
        } catch (err) {
          console.warn('Queue expansion failed:', err);
          set({ isExpandingQueue: false });
        }
      }
    }
  };
});
