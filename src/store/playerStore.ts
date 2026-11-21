import { create } from 'zustand';
import { Song, fetchRadioRecommendations } from '@/services/api';
import { audioEngine, EngineStatus } from '@/services/audioEngine';

export type AppView = 'home' | 'search' | 'astra' | 'library' | 'liked' | 'playlist' | 'artist';
export type RepeatMode = 'off' | 'all' | 'one';

export interface ToastItem {
  id: number;
  message: string;
  tone?: 'info' | 'error' | 'success';
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverArt?: string;
  tracks: Song[];
  createdAt: number;
}

interface PlayerState {
  // Playback state
  currentTrack: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
  status: EngineStatus;
  queue: Song[];
  queueIndex: number;
  playedHistoryIds: string[];
  recents: Song[];
  likedSongs: Song[];
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isExpandingQueue: boolean;

  // Modals & Panels
  isQueueOpen: boolean;
  isFullPlayerOpen: boolean;
  isCreatorOpen: boolean;
  isCreatePlaylistOpen: boolean;

  // View & Navigation
  currentView: AppView;
  activeCategory: string;
  searchQuery: string;
  selectedArtist: string | null;
  selectedPlaylist: Playlist | null;
  userPlaylists: Playlist[];
  toasts: ToastItem[];

  // Actions
  playTrack: (song: Song, customQueue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (secs: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleLike: (song: Song) => void;
  isLiked: (songId: string) => boolean;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setQueueOpen: (open?: boolean) => void;
  setFullPlayerOpen: (open: boolean) => void;
  setCreatorOpen: (open: boolean) => void;
  setCreatePlaylistOpen: (open: boolean) => void;
  navigate: (view: AppView, extra?: { artist?: string; playlist?: Playlist }) => void;
  setCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  addToast: (message: string, tone?: 'info' | 'error' | 'success') => void;
  dismissToast: (id: number) => void;
  createPlaylist: (name: string, description?: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Song) => void;
  checkAndExpandQueue: () => Promise<void>;
}

let toastCounter = 0;

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Bind audio engine callbacks
  if (typeof window !== 'undefined') {
    audioEngine.subscribeState((status) => {
      set({
        status,
        isPlaying: status === 'playing',
        isLoading: status === 'loading'
      });
    });

    audioEngine.subscribeTime((current, dur) => {
      set((state) => ({
        currentTime: current,
        duration: dur > 0 ? dur : (state.duration || state.currentTrack?.duration || 0)
      }));
    });

    audioEngine.subscribeError((code, msg) => {
      console.warn(`[PlayerStore] Audio playback failed (${code}): ${msg}`);
      set({ isPlaying: false, isLoading: false, status: 'error' });
      get().addToast(`Playback error: ${msg}`, 'error');
    });

    audioEngine.onEnded(() => {
      const { repeatMode, currentTrack } = get();
      if (repeatMode === 'one' && currentTrack) {
        audioEngine.seek(0);
        audioEngine.playSong(currentTrack);
      } else {
        get().playNext();
      }
    });

    audioEngine.onNext(() => get().playNext());
    audioEngine.onPrev(() => get().playPrev());
  }

  // Load persisted data
  const initialLiked: Song[] =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('rythemx_liked_songs') || '[]')
      : [];

  const initialRecents: Song[] =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('rythemx_recents') || '[]')
      : [];

  const initialPlaylists: Playlist[] =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('rythemx_user_playlists') || '[]')
      : [
          {
            id: 'noir_night_drive',
            name: 'Noir Night Drive',
            description: 'Hypnotic dark electronic & synthwave beats',
            coverArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
            tracks: [],
            createdAt: Date.now()
          },
          {
            id: 'spatial_master',
            name: 'ASTRA Spatial Masters',
            description: '320kbps Lossless high dynamic range tracks',
            coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
            tracks: [],
            createdAt: Date.now()
          }
        ];

  return {
    currentTrack: null,
    isPlaying: false,
    isLoading: false,
    status: 'idle',
    queue: [],
    queueIndex: 0,
    playedHistoryIds: [],
    recents: initialRecents,
    likedSongs: initialLiked,
    volume: 1.0,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    isShuffle: false,
    repeatMode: 'off',
    isExpandingQueue: false,

    isQueueOpen: false,
    isFullPlayerOpen: false,
    isCreatorOpen: false,
    isCreatePlaylistOpen: false,

    currentView: 'home',
    activeCategory: 'all',
    searchQuery: '',
    selectedArtist: null,
    selectedPlaylist: null,
    userPlaylists: initialPlaylists,
    toasts: [],

    playTrack: (song: Song, customQueue?: Song[]) => {
      const { recents, queue, playedHistoryIds } = get();

      // Normalize song object
      const normalizedSong: Song = {
        ...song,
        name: song.name || song.title || 'Master Track',
        title: song.title || song.name || 'Master Track',
        primaryArtists: song.primaryArtists || (song as any).artist || 'RhythmX Lossless',
        artist: (song as any).artist || song.primaryArtists || 'RhythmX Lossless',
        imageUrl: song.imageUrl || (song as any).art || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
        art: (song as any).art || song.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
        duration: Number(song.duration) || 210,
        streamUrl: song.streamUrl || (song.streamUrls && song.streamUrls[0]) || (song as any).audioUrl || (song as any).src || '',
        streamUrls: song.streamUrls && song.streamUrls.length > 0 ? song.streamUrls : [song.streamUrl || (song as any).audioUrl || '']
      };

      const updatedRecents = [normalizedSong, ...recents.filter((s) => s.id !== normalizedSong.id)].slice(0, 50);
      const updatedPlayedIds = Array.from(new Set([normalizedSong.id, ...playedHistoryIds])).slice(0, 300);
      const activeQueue = customQueue && customQueue.length > 0 ? customQueue : (queue.length > 0 ? queue : [normalizedSong]);
      const idx = activeQueue.findIndex((s) => s.id === normalizedSong.id);

      set({
        currentTrack: normalizedSong,
        isPlaying: true,
        isLoading: false,
        status: 'loading',
        currentTime: 0,
        duration: normalizedSong.duration || 0,
        recents: updatedRecents,
        playedHistoryIds: updatedPlayedIds,
        queue: activeQueue,
        queueIndex: idx >= 0 ? idx : 0
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('rythemx_recents', JSON.stringify(updatedRecents));
      }

      audioEngine.playSong(normalizedSong);

      // Trigger automatic queue expansion if reaching the end of queue
      if (activeQueue.length <= 3 || (idx >= 0 && idx >= activeQueue.length - 2)) {
        get().checkAndExpandQueue();
      }
    },

    togglePlay: () => {
      const { currentTrack, isPlaying } = get();
      if (!currentTrack) return;
      if (isPlaying) {
        audioEngine.pause();
        set({ isPlaying: false });
      } else {
        audioEngine.resume();
        set({ isPlaying: true });
      }
    },

    playNext: () => {
      const { queue, queueIndex, isShuffle, repeatMode, currentTrack } = get();
      if (queue.length === 0) return;

      if (repeatMode === 'one' && currentTrack) {
        audioEngine.seek(0);
        audioEngine.playSong(currentTrack);
        return;
      }

      let nextIndex = queueIndex + 1;
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }

      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          // End of queue reached, try to dynamically expand
          get().checkAndExpandQueue();
          return;
        }
      }

      const nextTrack = queue[nextIndex];
      if (nextTrack) {
        get().playTrack(nextTrack, queue);
      }
    },

    playPrev: () => {
      const { queue, queueIndex, currentTime } = get();
      if (queue.length === 0) return;

      // If played for > 3 seconds, replay current song
      if (currentTime > 3) {
        audioEngine.seek(0);
        return;
      }

      const prevIndex = queueIndex - 1;
      if (prevIndex >= 0) {
        const prevTrack = queue[prevIndex];
        get().playTrack(prevTrack, queue);
      } else {
        audioEngine.seek(0);
      }
    },

    seek: (secs: number) => {
      audioEngine.seek(secs);
      set({ currentTime: secs });
    },

    setVolume: (vol: number) => {
      audioEngine.setVolume(vol);
      set({ volume: vol, isMuted: vol === 0 });
    },

    toggleMute: () => {
      const { isMuted, volume } = get();
      if (isMuted) {
        const restore = volume > 0 ? volume : 0.8;
        audioEngine.setVolume(restore);
        set({ isMuted: false, volume: restore });
      } else {
        audioEngine.setVolume(0);
        set({ isMuted: true });
      }
    },

    toggleLike: (song: Song) => {
      const { likedSongs } = get();
      const exists = likedSongs.some((s) => s.id === song.id);
      let updated: Song[];

      if (exists) {
        updated = likedSongs.filter((s) => s.id !== song.id);
        get().addToast(`Removed "${song.name || song.title}" from Liked Songs`);
      } else {
        const normalized: Song = {
          ...song,
          name: song.name || song.title || 'Master Track',
          title: song.title || song.name || 'Master Track',
          primaryArtists: song.primaryArtists || (song as any).artist || 'RhythmX',
          imageUrl: song.imageUrl || (song as any).art || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'
        };
        updated = [normalized, ...likedSongs];
        get().addToast(`Saved "${song.name || song.title}" to Liked Songs`, 'success');
      }

      set({ likedSongs: updated });
      if (typeof window !== 'undefined') {
        localStorage.setItem('rythemx_liked_songs', JSON.stringify(updated));
      }
    },

    isLiked: (songId: string) => {
      return get().likedSongs.some((s) => s.id === songId);
    },

    addToQueue: (song: Song) => {
      const { queue } = get();
      const updated = [...queue, song];
      set({ queue: updated });
      get().addToast(`Added "${song.name || song.title}" to queue`);
    },

    removeFromQueue: (index: number) => {
      const { queue, queueIndex } = get();
      const updated = queue.filter((_, i) => i !== index);
      let nextIndex = queueIndex;
      if (index < queueIndex) nextIndex--;
      set({ queue: updated, queueIndex: Math.max(0, nextIndex) });
    },

    clearQueue: () => {
      const { currentTrack } = get();
      set({ queue: currentTrack ? [currentTrack] : [], queueIndex: 0 });
      get().addToast('Queue cleared');
    },

    toggleShuffle: () => {
      const next = !get().isShuffle;
      set({ isShuffle: next });
      get().addToast(next ? 'Shuffle enabled' : 'Shuffle disabled');
    },

    cycleRepeat: () => {
      const current = get().repeatMode;
      const next: RepeatMode = current === 'off' ? 'all' : current === 'all' ? 'one' : 'off';
      set({ repeatMode: next });
      const label = next === 'off' ? 'Repeat off' : next === 'all' ? 'Repeat all' : 'Repeat one';
      get().addToast(label);
    },

    setQueueOpen: (open?: boolean) => {
      set((state) => ({ isQueueOpen: open !== undefined ? open : !state.isQueueOpen }));
    },

    setFullPlayerOpen: (open: boolean) => set({ isFullPlayerOpen: open }),
    setCreatorOpen: (open: boolean) => set({ isCreatorOpen: open }),
    setCreatePlaylistOpen: (open: boolean) => set({ isCreatePlaylistOpen: open }),

    navigate: (view: AppView, extra?: { artist?: string; playlist?: Playlist }) => {
      set({
        currentView: view,
        selectedArtist: extra?.artist || null,
        selectedPlaylist: extra?.playlist || null,
        searchQuery: view === 'search' ? get().searchQuery : ''
      });
      // Scroll to top
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    setCategory: (cat: string) => {
      set({ activeCategory: cat, currentView: 'home' });
    },

    setSearchQuery: (query: string) => {
      set({
        searchQuery: query,
        currentView: query.trim() ? 'search' : get().currentView
      });
    },

    addToast: (message: string, tone: 'info' | 'error' | 'success' = 'info') => {
      const id = ++toastCounter;
      set((state) => ({
        toasts: [...state.toasts.slice(-2), { id, message, tone }]
      }));
      setTimeout(() => {
        get().dismissToast(id);
      }, 3500);
    },

    dismissToast: (id: number) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    },

    createPlaylist: (name: string, description?: string) => {
      const newPlaylist: Playlist = {
        id: `pl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: name.trim(),
        description: description?.trim(),
        coverArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
        tracks: [],
        createdAt: Date.now()
      };
      const updated = [newPlaylist, ...get().userPlaylists];
      set({ userPlaylists: updated, isCreatePlaylistOpen: false });
      if (typeof window !== 'undefined') {
        localStorage.setItem('rythemx_user_playlists', JSON.stringify(updated));
      }
      get().addToast(`Created playlist "${name}"`, 'success');
    },

    addTrackToPlaylist: (playlistId: string, track: Song) => {
      const updated = get().userPlaylists.map((pl) => {
        if (pl.id === playlistId) {
          const exists = pl.tracks.some((t) => t.id === track.id);
          if (!exists) {
            return {
              ...pl,
              tracks: [...pl.tracks, track],
              coverArt: pl.tracks.length === 0 ? (track.imageUrl || (track as any).art) : pl.coverArt
            };
          }
        }
        return pl;
      });
      set({ userPlaylists: updated });
      if (typeof window !== 'undefined') {
        localStorage.setItem('rythemx_user_playlists', JSON.stringify(updated));
      }
      get().addToast(`Added to playlist`, 'success');
    },

    checkAndExpandQueue: async () => {
      const { currentTrack, queue, playedHistoryIds, isExpandingQueue } = get();
      if (!currentTrack || isExpandingQueue) return;

      set({ isExpandingQueue: true });
      try {
        const recommendations = await fetchRadioRecommendations(currentTrack, playedHistoryIds);
        if (recommendations && recommendations.length > 0) {
          const existingIds = new Set(queue.map((s) => s.id));
          const uniqueNewTracks = recommendations.filter((s) => !existingIds.has(s.id));
          if (uniqueNewTracks.length > 0) {
            set((state) => ({
              queue: [...state.queue, ...uniqueNewTracks.slice(0, 15)]
            }));
          }
        }
      } catch (err) {
        console.warn('Queue expansion error:', err);
      } finally {
        set({ isExpandingQueue: false });
      }
    }
  };
});
