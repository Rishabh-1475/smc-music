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
import { fetchSongsByQuery, Song } from '@/services/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'galaxy' | 'library' | 'profile'>('home');
  const [category, setCategory] = useState('All');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Engine State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

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
    fetchSongsByQuery(q, 1).then((res) => {
      if (isMounted) {
        setSongs(res);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [category]);

  const handleSearchResults = (results: Song[], query: string) => {
    setSearchQuery(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setIsSearching(false);
  };

  const handleSelectCategory = (cat: string) => {
    // If searching, selecting a category chip resets back to category feed
    if (searchResults !== null) {
      handleClearSearch();
    }
    setCategory(cat);
  };

  const isSearchActive = searchResults !== null && searchQuery.trim().length > 0;
  const activeSongs = isSearchActive ? searchResults : songs;

  return (
    <main className="min-h-screen bg-[#050505] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-[#0A0A0C] border-x border-white/5 relative flex flex-col pb-36">
        <OnboardingModal />
        <NowPlayingView />

        <Header
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (!q.trim()) handleClearSearch();
          }}
          onSearchResults={handleSearchResults}
          onClearSearch={handleClearSearch}
          isSearching={isSearching}
        />

        {activeTab === 'home' && (
          <>
            <CategoryChips
              activeCategory={isSearchActive ? '' : category}
              onSelectCategory={handleSelectCategory}
            />

            {isSearchActive ? (
              <div className="px-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-400">
                    Results for <span className="text-[#CCFF00] font-semibold">&quot;{searchQuery}&quot;</span> ({searchResults.length} songs)
                  </p>
                  <button
                    onClick={handleClearSearch}
                    className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer"
                  >
                    Clear search
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-xs text-center px-6">
                    <p>No songs found for &quot;{searchQuery}&quot;.</p>
                    <p className="text-[10px] text-gray-500 mt-1">Try another artist, album, or track name.</p>
                  </div>
                ) : (
                  <>
                    <HeroVisualizer featuredSong={searchResults[0]} />
                    <TopDailyPlaylists
                      title="Search Results"
                      songs={searchResults.slice(1)}
                    />
                  </>
                )}
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-48 text-gray-500 text-xs">
                Fetching lossless feed...
              </div>
            ) : (
              <>
                <HeroVisualizer featuredSong={songs[0] || null} />
                <TopDailyPlaylists
                  title={category === 'All' ? 'Top daily playlists' : `${category} Feed`}
                  songs={songs.slice(1)}
                />
              </>
            )}
          </>
        )}

        {activeTab === 'galaxy' && <GalaxyVisualizer songs={activeSongs} />}
        {activeTab === 'library' && (
          <div className="px-1 py-2">
            <TopDailyPlaylists title="Your Library" songs={activeSongs} />
          </div>
        )}
        {activeTab === 'profile' && <ProfileView />}

        <MiniPlayer />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </main>
  );
}
