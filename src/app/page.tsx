'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Heart, Play, Pause, Settings, BarChart2 } from 'lucide-react';
import { OnboardingModal } from '@/components/OnboardingModal';
import { NowPlayingView } from '@/components/NowPlayingView';
import { GalaxyVisualizer } from '@/components/GalaxyVisualizer';
import { LibraryView } from '@/components/LibraryView';
import { MiniPlayer } from '@/components/MiniPlayer';
import { BottomNav } from '@/components/BottomNav';
import { fetchSongsByQuery, Song, FALLBACK_CATALOG } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

export default function Home() {
  const [userName, setUserName] = useState('Rishabh');
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'galaxy' | 'library'>('home');
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>(FALLBACK_CATALOG);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const { currentTrack, isPlaying, playTrack, setQueue, history } = usePlayerStore();

  const filterChips = ['All', 'Music', 'Podcasts', 'Gym Phonk', 'Punjabi', 'Bhojpuri'];

  const categoryQueries: Record<string, string> = {
    All: 'Bollywood Trending Hits',
    Music: 'Top Hindi Movie Songs',
    Podcasts: 'Best Motivation Podcasts',
    'Gym Phonk': 'Phonk Gym Workout',
    Punjabi: 'Punjabi Top Hits',
    Bhojpuri: 'Bhojpuri Superhits'
  };

  // Dynamic Time-of-Day Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Quick Access Tiles: LRU Recents from playerStore, fallback to first 6 songs
  const quickAccessSongs = useMemo(() => {
    if (history && history.length >= 6) {
      return history.slice(0, 6);
    }
    const combined = [...(history || []), ...songs];
    const unique = Array.from(new Map(combined.map((s) => [s.id, s])).values());
    return unique.slice(0, 6);
  }, [history, songs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rhythmx_user_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name) setUserName(parsed.name);
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    const q = searchQuery.trim() || (categoryQueries[category] || `${category} Hits`);
    fetchSongsByQuery(q).then((res) => {
      if (active) {
        const list = res.length > 0 ? res : FALLBACK_CATALOG;
        setSongs(list);
        setQueue(list);
      }
    }).catch(() => {
      if (active) {
        setSongs(FALLBACK_CATALOG);
        setQueue(FALLBACK_CATALOG);
      }
    });

    return () => {
      active = false;
    };
  }, [category, searchQuery, setQueue]);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex justify-center selection:bg-[#1DB954] selection:text-black">
      <OnboardingModal onComplete={(name) => setUserName(name)} />

      {/* Strict Carlos Han Spotify Centered Mobile Shell */}
      <div className="w-full max-w-[430px] md:max-w-md min-h-screen bg-[#121212] border-x border-[#292929] relative flex flex-col pb-36 select-none overflow-x-hidden">
        
        {/* Top App Bar with Time-Based Greeting */}
        <header className="px-4 pt-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-[#1DB954] to-emerald-400">
              <img
                src="/creator.jpg"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
                }}
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                {greeting}, {userName}
              </h1>
              <p className="text-[11px] text-[#B3B3B3]">RhythmX Premium</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#B3B3B3]">
            <button
              onClick={() => setActiveTab('library')}
              className="p-2 hover:text-white transition active:scale-90"
              title="Liked Songs"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('profile' as any)}
              className="p-2 hover:text-white transition active:scale-90"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* TAB 1: HOME (Carlos Han Spotify Feed) */}
        {activeTab === 'home' && (
          <div className="flex-1 px-4">
            {/* Filter Chips */}
            <div className="py-2 flex gap-2 overflow-x-auto no-scrollbar">
              {filterChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setSearchQuery('');
                    setCategory(chip);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    category === chip && !searchQuery
                      ? 'bg-[#1DB954] text-black font-bold shadow-md'
                      : 'bg-[#282828] text-white hover:bg-[#333333]'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* 2-Column Quick Access Grid (The Spotify Signature, h-14, 56px art) */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              {quickAccessSongs.map((song) => {
                const isCurrent = currentTrack?.id === song.id;
                return (
                  <div
                    key={`qa_${song.id}`}
                    onClick={() => playTrack(song)}
                    className="flex items-center h-14 bg-[#282828]/85 hover:bg-[#333333] rounded-md overflow-hidden cursor-pointer transition shadow group relative"
                  >
                    <img
                      src={song.imageUrl}
                      alt={song.name}
                      className="w-14 h-14 object-cover flex-shrink-0 bg-[#181818]"
                      onError={(e) => {
                        e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                      }}
                    />
                    <div className="px-2.5 min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                        {song.name}
                      </p>
                    </div>

                    {/* Equalizer Wave Indicator if playing */}
                    {isCurrent && isPlaying && (
                      <div className="absolute right-2 flex items-end gap-0.5 h-3">
                        <span className="w-0.5 bg-[#1DB954] h-full animate-[bounce_0.8s_infinite]" />
                        <span className="w-0.5 bg-[#1DB954] h-2/3 animate-[bounce_0.6s_infinite]" />
                        <span className="w-0.5 bg-[#1DB954] h-4/5 animate-[bounce_0.7s_infinite]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Shelf: Recently Played (Horizontal Carousel, 120px cards) */}
            {history && history.length > 0 && (
              <div className="mt-6">
                <h2 className="text-base font-bold text-white mb-3">Recently Played</h2>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {history.slice(0, 10).map((song) => (
                    <div
                      key={`recent_${song.id}`}
                      onClick={() => playTrack(song)}
                      className="w-[120px] flex-shrink-0 bg-[#181818] p-2 rounded-lg hover:bg-[#282828] transition cursor-pointer"
                    >
                      <img
                        src={song.imageUrl}
                        alt={song.name}
                        className="w-full h-[104px] object-cover rounded-md bg-[#242424]"
                        onError={(e) => {
                          e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                        }}
                      />
                      <p className="text-xs font-bold text-white truncate mt-2">{song.name}</p>
                      <p className="text-[10px] text-[#B3B3B3] truncate mt-0.5">{song.primaryArtists}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shelf: Made For You (Horizontal Carousel) */}
            <div className="mt-6">
              <h2 className="text-base font-bold text-white mb-3">Made For You</h2>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {songs.slice(0, 8).map((song) => (
                  <div
                    key={`shelf_${song.id}`}
                    onClick={() => playTrack(song)}
                    className="w-32 flex-shrink-0 bg-[#181818] p-2.5 rounded-lg hover:bg-[#282828] transition cursor-pointer"
                  >
                    <img
                      src={song.imageUrl}
                      alt={song.name}
                      className="w-full h-28 object-cover rounded-md bg-[#242424]"
                      onError={(e) => {
                        e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                      }}
                    />
                    <p className="text-xs font-bold text-white truncate mt-2">{song.name}</p>
                    <p className="text-[10px] text-[#B3B3B3] truncate mt-0.5">{song.primaryArtists}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shelf: Jump Back In (Vertical Feed) */}
            <div className="mt-6 mb-4">
              <h2 className="text-base font-bold text-white mb-3">Jump Back In</h2>
              <div className="flex flex-col gap-2">
                {songs.slice(6).map((song) => {
                  const isCurrent = currentTrack?.id === song.id;
                  return (
                    <div
                      key={`list_${song.id}`}
                      onClick={() => playTrack(song)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-[#181818] transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={song.imageUrl}
                          alt={song.name}
                          className="w-11 h-11 rounded object-cover flex-shrink-0 bg-[#181818]"
                          onError={(e) => {
                            e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                          }}
                        />
                        <div className="min-w-0 flex-1 pr-2">
                          <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                            {song.name}
                          </p>
                          <p className="text-[11px] text-[#B3B3B3] truncate mt-0.5">{song.primaryArtists}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(song);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCurrent && isPlaying ? 'text-[#1DB954]' : 'text-[#B3B3B3]'
                        }`}
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="w-4 h-4 fill-current stroke-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current stroke-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SEARCH */}
        {activeTab === 'search' && (
          <div className="flex-1 px-4 pt-2">
            <h1 className="text-xl font-bold text-white mb-3 tracking-tight">Search</h1>
            <div className="relative flex items-center mb-4">
              <Search className="absolute left-3.5 w-4 h-4 text-black" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to listen to?"
                className="w-full pl-10 pr-10 py-3 rounded-md bg-white text-black font-medium text-xs placeholder-neutral-500 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 text-xs text-black">✕</button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {songs.map((song) => {
                const isCurrent = currentTrack?.id === song.id;
                return (
                  <div
                    key={`search_${song.id}`}
                    onClick={() => playTrack(song)}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-[#181818] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={song.imageUrl}
                        alt={song.name}
                        className="w-11 h-11 rounded object-cover flex-shrink-0 bg-[#181818]"
                        onError={(e) => {
                          e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                        }}
                      />
                      <div className="min-w-0 flex-1 pr-2">
                        <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                          {song.name}
                        </p>
                        <p className="text-[11px] text-[#B3B3B3] truncate mt-0.5">{song.primaryArtists}</p>
                      </div>
                    </div>
                    <button className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCurrent && isPlaying ? 'text-[#1DB954]' : 'text-[#B3B3B3]'
                    }`}>
                      {isCurrent && isPlaying ? (
                        <Pause className="w-4 h-4 fill-current stroke-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current stroke-current ml-0.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: GALAXY */}
        {activeTab === 'galaxy' && <GalaxyVisualizer songs={songs} />}

        {/* TAB 4: YOUR LIBRARY */}
        {activeTab === 'library' && <LibraryView />}

        {/* Floating Carlos Han MiniPlayer */}
        <MiniPlayer onOpenNowPlaying={() => setIsPlayerOpen(true)} />

        {/* Bottom Navigation Dock */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Full-Screen Now Playing View Modal */}
        {isPlayerOpen && <NowPlayingView onClose={() => setIsPlayerOpen(false)} />}
      </div>
    </div>
  );
}
