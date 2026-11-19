'use client';
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { CategoryChips } from '@/components/CategoryChips';
import { HeroVisualizer } from '@/components/HeroVisualizer';
import { TopDailyPlaylists } from '@/components/TopDailyPlaylists';
import { GalaxyVisualizer } from '@/components/GalaxyVisualizer';
import { BottomNav } from '@/components/BottomNav';
import { MiniPlayer } from '@/components/MiniPlayer';
import { ProfileView } from '@/components/ProfileView';
import OnboardingModal from '@/components/OnboardingModal';
import NowPlayingView from '@/components/NowPlayingView';
import { fetchSongsByQuery, Song, DEFAULT_FALLBACK_TRACKS } from '@/services/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'galaxy' | 'library' | 'profile'>('home');
  const [category, setCategory] = useState('All');
  const [songs, setSongs] = useState<Song[]>(DEFAULT_FALLBACK_TRACKS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[] | null>(null);

  const categoryQueries: Record<string, string> = {
    All: 'Trending India Hits 2026',
    'New Release': 'Latest Hindi Releases 2026',
    Trending: 'Top Viral Hits India',
    Top: 'Global Billboard Top 50',
    'Gym Phonk': 'Aggressive Phonk Workout Gym',
    Punjabi: 'Trending Punjabi Hits',
    Bhojpuri: 'Bhojpuri Superhits'
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const q = categoryQueries[category] || 'Trending India Hits 2026';
    fetchSongsByQuery(q, 1)
      .then((res) => {
        if (isMounted) {
          setSongs(res.length > 0 ? res : DEFAULT_FALLBACK_TRACKS);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSongs(DEFAULT_FALLBACK_TRACKS);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [category]);

  const handleSearchResults = (results: Song[], query: string) => {
    setSearchQuery(query);
    setSearchResults(results.length > 0 ? results : null);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const handleSelectCategory = (cat: string) => {
    if (searchResults !== null) handleClearSearch();
    setCategory(cat);
  };

  const isSearchActive = searchResults !== null && searchQuery.trim().length > 0;
  const displaySongs = isSearchActive ? searchResults : songs;
  const heroSong = displaySongs[0] || DEFAULT_FALLBACK_TRACKS[0];
  const listSongs = displaySongs.length > 1 ? displaySongs.slice(1) : displaySongs;

  return (
    <main className="min-h-screen bg-[#050505] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-[#0A0A0C] border-x border-white/5 relative flex flex-col pb-36">
        <OnboardingModal />
        <NowPlayingView />

        <Header
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); if (!q.trim()) handleClearSearch(); }}
          onSearchResults={handleSearchResults}
          onClearSearch={handleClearSearch}
        />

        {activeTab === 'home' && (
          <>
            <CategoryChips
              activeCategory={isSearchActive ? '' : category}
              onSelectCategory={handleSelectCategory}
            />

            {loading && songs.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-500 text-xs">
                Loading lossless stream...
              </div>
            ) : (
              <>
                {isSearchActive && (
                  <div className="px-4 pt-2 pb-1 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Results for <span className="text-[#CCFF00] font-semibold">&quot;{searchQuery}&quot;</span>
                    </p>
                    <button onClick={handleClearSearch} className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer">
                      Clear
                    </button>
                  </div>
                )}
                <HeroVisualizer featuredSong={heroSong} />
                <TopDailyPlaylists
                  title={isSearchActive ? 'Search Results' : category === 'All' ? 'Top daily playlists' : `${category} Feed`}
                  songs={listSongs}
                />
              </>
            )}
          </>
        )}

        {activeTab === 'galaxy' && <GalaxyVisualizer songs={displaySongs} />}
        {activeTab === 'library' && (
          <div className="px-1 py-2">
            <TopDailyPlaylists title="Your Library" songs={displaySongs} />
          </div>
        )}
        {activeTab === 'profile' && <ProfileView />}

        <MiniPlayer />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </main>
  );
}
