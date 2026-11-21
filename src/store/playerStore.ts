import { create } from 'zustand';
import { Song, FALLBACK_CATALOG, fetchRadioRecommendations } from '@/services/api';
import { audioEngine } from '@/services/audioService';

interface PlayerState {
  currentTrack: Song | null;
  isPlaying: boolean;
  queue: Song[];
  playedHistoryIds: string[];
  recents: Song[];
  likedSongs: Song[];
  volume: number;
  currentTime: number;
  duration: number;
  isExpandingQueue: boolean;
  playTrack: (song: Song, customQueue?: Song[]) => void;
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
    audioEngine.setOnNext(() => {
      get().playNext();
    });
    audioEngine.setOnPrev(() => {
      get().playPrev();
    });
  }

  const initialLiked: Song[] = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('rhythmx_liked_songs') || '[]')
    : [];

  const initialRecents: Song[] = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('rhythmx_recents') || '[]')
    : [];

  const initialPlayedIds: string[] = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('rhythmx_played_ids') || '[]')
    : [];

  return {
    currentTrack: null,
    isPlaying: false,
    queue: FALLBACK_CATALOG,
    playedHistoryIds: initialPlayedIds,
    recents: initialRecents,
    likedSongs: initialLiked,
    volume: 1,
    currentTime: 0,
    duration: 0,
    isExpandingQueue: false,

    playTrack: (song: Song, customQueue?: Song[]) => {
      const { recents, queue, playedHistoryIds } = get();

      // LRU Deduplicated Recents
      const updatedRecents = [song, ...recents.filter((s) => s.id !== song.id)].slice(0, 30);

      // Played History Tracking
      const updatedPlayedIds = Array.from(new Set([song.id, ...playedHistoryIds])).slice(0, 200);

      const activeQueue = customQueue && customQueue.length > 0 ? customQueue : queue;

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
      const { queue, currentTrack } = get();
      if (queue.length === 0) return;

      const idx = queue.findIndex((s) => s.id === currentTrack?.id);
      const nextIndex = (idx + 1) % queue.length;
      const nextSong = queue[nextIndex];

      get().playTrack(nextSong);
      get().checkAndExpandQueue();
    },

    playPrev: () => {
      const { queue, currentTrack } = get();
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

    /**
     * Continuous Autoplay Loop (No-Repeat Engine):
     * Monitored during every playTrack and playNext call.
     * When current index is within 2 tracks of the queue end, fetches 20 viral recommendations
     * and appends deduplicated tracks. Audio NEVER stops.
     */
    checkAndExpandQueue: async () => {
      const { currentTrack, queue, playedHistoryIds, isExpandingQueue } = get();
      if (!currentTrack || isExpandingQueue) return;

      const currentIndex = queue.findIndex((s) => s.id === currentTrack.id);
      const remainingTracks = queue.length - 1 - currentIndex;

      // Expand when within 2 tracks of queue end
      if (remainingTracks <= 2) {
        set({ isExpandingQueue: true });
        try {
          const recommendations = await fetchRadioRecommendations(currentTrack);

          const existingQueueIds = new Set(queue.map((s) => s.id));
          const playedIdsSet = new Set(playedHistoryIds);

          const novelTracks = recommendations.filter(
            (s) => !existingQueueIds.has(s.id) && !playedIdsSet.has(s.id)
          );

          // If all recommended were played, at least append novel tracks not in current queue
          const finalTracksToAdd = novelTracks.length >= 3
            ? novelTracks
            : recommendations.filter((s) => !existingQueueIds.has(s.id));

          if (finalTracksToAdd.length > 0) {
            set((state) => ({
              queue: [...state.queue, ...finalTracksToAdd],
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
