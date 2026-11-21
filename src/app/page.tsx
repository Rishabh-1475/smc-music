'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import PlayerDock from '@/components/layout/PlayerDock';
import MobileNav from '@/components/layout/MobileNav';
import Toasts from '@/components/ui/Toasts';
import FullPlayerModal from '@/components/modals/FullPlayerModal';
import CreatorModal from '@/components/modals/CreatorModal';
import CreatePlaylistModal from '@/components/modals/CreatePlaylistModal';
import AstraGlobalHUD from '@/components/astra/AstraGlobalHUD';

import HomeView from '@/views/HomeView';
import SearchView from '@/views/SearchView';
import AstraView from '@/views/AstraView';
import LikedSongsView from '@/views/LikedSongsView';
import LibraryView from '@/views/LibraryView';
import PlaylistView from '@/views/PlaylistView';
import ArtistView from '@/views/ArtistView';

import { usePlayerStore } from '@/store/playerStore';
import { astraWakeWord } from '@/services/astraWakeWord';

export default function App() {
  // Narrow selectors: Avoid root App re-renders on 4 Hz currentTime ticks
  const currentView = usePlayerStore((s) => s.currentView);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const playNext = usePlayerStore((s) => s.playNext);
  const playPrev = usePlayerStore((s) => s.playPrev);
  const seek = usePlayerStore((s) => s.seek);

  // Initialize hands-free wake word engine
  useEffect(() => {
    astraWakeWord.init();
  }, []);

  // Keyboard navigation & playback shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight': {
          e.preventDefault();
          const cur = usePlayerStore.getState().currentTime;
          seek(cur + 5);
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          const cur = usePlayerStore.getState().currentTime;
          seek(Math.max(0, cur - 5));
          break;
        }
        case 'KeyJ':
          playPrev();
          break;
        case 'KeyL':
          playNext();
          break;
        case 'Slash':
          e.preventDefault();
          const searchInput = document.getElementById('global-search');
          if (searchInput) searchInput.focus();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, playNext, playPrev, seek]);

  return (
    <div className="app">
      {/* Dynamic Ambient Background */}
      <div className="ambient" />

      {/* Desktop Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Column */}
      <main className="column" role="main">
        <TopBar />

        <div className="view-content px-4 md:px-8 py-4">
          {currentView === 'home' && <HomeView />}
          {currentView === 'search' && <SearchView />}
          {currentView === 'astra' && <AstraView />}
          {currentView === 'liked' && <LikedSongsView />}
          {currentView === 'library' && <LibraryView />}
          {currentView === 'playlist' && <PlaylistView />}
          {currentView === 'artist' && <ArtistView />}
        </div>
      </main>

      {/* Floating 88px Bottom Dock */}
      <PlayerDock />

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* 3D Modals & Overlays */}
      <FullPlayerModal />
      <CreatorModal />
      <CreatePlaylistModal />
      <AstraGlobalHUD />
      <Toasts />
    </div>
  );
}
