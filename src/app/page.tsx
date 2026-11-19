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

  return (
    <main className="min-h-screen bg-[#050505] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-[#0A0A0C] border-x border-white/5 relative flex flex-col pb-36">
        <OnboardingModal />
        <NowPlayingView />

        <Header />

        {activeTab === 'home' && (
          <>
            <CategoryChips activeCategory={category} onSelectCategory={setCategory} />
            {loading ? (
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

        {activeTab === 'galaxy' && <GalaxyVisualizer songs={songs} />}
        {activeTab === 'library' && (
          <div className="px-1 py-2">
            <TopDailyPlaylists title="Your Library" songs={songs} />
          </div>
        )}
        {activeTab === 'profile' && <ProfileView />}

        <MiniPlayer />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </main>
  );
}
