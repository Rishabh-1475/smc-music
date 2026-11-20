'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Heart, Play, Pause, ExternalLink, Settings } from 'lucide-react';
import { OnboardingModal } from '@/components/OnboardingModal';
import { NowPlayingView } from '@/components/NowPlayingView';
import { GalaxyVisualizer } from '@/components/GalaxyVisualizer';
import { LibraryView } from '@/components/LibraryView';
import { ProfileView } from '@/components/ProfileView';
import { MiniPlayer } from '@/components/MiniPlayer';
import { BottomNav, NavTab } from '@/components/BottomNav';
import { fetchSongsByQuery, Song, FALLBACK_CATALOG } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

export default function Home() {
  const [userName, setUserName] = useState('Rishabh');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>(FALLBACK_CATALOG);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const { currentTrack, isPlaying, playTrack, setQueue, recents } = usePlayerStore();

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

  // Format Duration Helper
  const formatDuration = (sec: number | string) => {
    const num = typeof sec === 'number' ? sec : parseInt(String(sec), 10) || 210;
    const m = Math.floor(num / 60);
    const s = Math.floor(num % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Quick Access Tiles: LRU Recents from playerStore, fallback to first 6 songs
  const quickAccessSongs = useMemo(() => {
    if (recents && recents.length >= 6) {
      return recents.slice(0, 6);
    }
    const combined = [...(recents || []), ...songs];
    const unique = Array.from(new Map(combined.map((s) => [s.id, s])).values());
    return unique.slice(0, 6);
  }, [recents, songs]);

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

    fetchSongsByQuery(q)
      .then((res) => {
        if (active) {
          const list = res.length > 0 ? res : FALLBACK_CATALOG;
          setSongs(list);
          setQueue(list);
        }
      })
      .catch(() => {
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
    <div className="min-h-screen bg-[#050505] text-white flex justify-center selection:bg-[#E11D48] selection:text-white">
      <OnboardingModal onComplete={(name) => setUserName(name)} />

      {/* 430px Mobile Shell */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#070709] border-x border-[#262633] pb-36 relative select-none overflow-x-hidden flex flex-col">
        {/* Dynamic Header */}
        <header className="px-4 pt-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('profile')}
              className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#E11D48] to-[#EF4444] shadow-[0_0_15px_rgba(225,29,72,0.4)] cursor-pointer transition hover:scale-105 active:scale-95"
              title="View Profile"
            >
              <img
                src="/creator.jpg"
                alt="Profile"
                className="w-full h-full rounded-full object-cover bg-neutral-900"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
                }}
              />
            </button>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                {greeting}, {userName}
              </h1>
              <p className="text-[10px] font-mono tracking-wider text-[#94A3B8] uppercase">
                RHYTHMX LOSSLESS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <button
              onClick={() => setActiveTab('library')}
              className="p-2 hover:text-[#E11D48] transition active:scale-90 cursor-pointer"
              title="Liked Songs"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.open('https://www.instagram.com/rish4bhsiingh/', '_blank');
                }
              }}
              className="p-2 hover:text-white transition active:scale-90 cursor-pointer"
              title="Settings & Instagram"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="flex-1 px-4">
            {/* Live Search Input */}
            <div className="relative flex items-center my-2.5">
              <Search className="absolute left-3.5 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs, artists, or albums..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#121217] border border-[#262633] text-white text-xs placeholder-[#94A3B8]/60 focus:outline-none focus:border-[#E11D48] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-xs text-[#94A3B8] hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div className="py-2 flex gap-2 overflow-x-auto no-scrollbar">
              {filterChips.map((chip) => {
                const isActive = category === chip && !searchQuery;
                return (
                  <button
                    key={chip}
                    onClick={() => {
                      setSearchQuery('');
                      setCategory(chip);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-[#E11D48] text-white font-bold shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                        : 'bg-[#181822] text-[#94A3B8] hover:bg-[#1E1E26] hover:text-white border border-[#262633]'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            {/* Spotify 2-Column Quick Access Grid (6 Tiles, h-14) */}
            <div className="grid grid-cols-2 gap-2 mt-2.5">
              {quickAccessSongs.map((song) => {
                const isCurrent = currentTrack?.id === song.id;
                return (
                  <div
                    key={`qa_${song.id}`}
                    onClick={() => playTrack(song)}
                    className="flex items-center h-14 bg-[#121217] hover:bg-[#1E1E26] border border-[#262633]/60 rounded-lg overflow-hidden cursor-pointer transition shadow group relative"
                  >
                    <img
                      src={song.imageUrl}
                      alt={song.name}
                      className="w-14 h-14 object-cover flex-shrink-0 bg-[#050505]"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                      }}
                    />
                    <div className="px-2.5 min-w-0 flex-1">
                      <p
                        className={`text-xs font-bold truncate ${
                          isCurrent ? 'text-[#E11D48]' : 'text-white'
                        }`}
                      >
                        {song.name}
                      </p>
                    </div>

                    {/* Animated Crimson 3-bar equalizer indicator */}
                    {isCurrent && isPlaying && (
                      <div className="absolute right-2 flex items-end gap-0.5 h-3">
                        <span className="w-0.5 bg-[#E11D48] h-full animate-[bounce_0.8s_infinite]" />
                        <span className="w-0.5 bg-[#E11D48] h-2/3 animate-[bounce_0.6s_infinite]" />
                        <span className="w-0.5 bg-[#E11D48] h-4/5 animate-[bounce_0.7s_infinite]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Shelf: Recently Played (Horizontal Carousel, 130px cards) */}
            {recents && recents.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-bold text-white mb-2.5 tracking-tight flex items-center justify-between">
                  <span>Recently Played</span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">LRU CACHE</span>
                </h2>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {recents.slice(0, 10).map((song) => (
                    <div
                      key={`recent_${song.id}`}
                      onClick={() => playTrack(song)}
                      className="w-[130px] flex-shrink-0 bg-[#121217] hover:bg-[#1E1E26] border border-[#262633]/50 p-2.5 rounded-xl transition cursor-pointer shadow-md"
                    >
                      <img
                        src={song.imageUrl}
                        alt={song.name}
                        className="w-full h-[110px] object-cover rounded-lg bg-[#050505] shadow"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                        }}
                      />
                      <p className="text-xs font-bold text-white truncate mt-2">{song.name}</p>
                      <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">
                        {song.primaryArtists}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shelf: Made For You (Horizontal Carousel, 130px cards) */}
            <div className="mt-6">
              <h2 className="text-sm font-bold text-white mb-2.5 tracking-tight flex items-center justify-between">
                <span>Made For You</span>
                <span className="text-[10px] font-mono text-[#E11D48]">LOSSLESS 320</span>
              </h2>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {songs.slice(0, 8).map((song) => (
                  <div
                    key={`shelf_${song.id}`}
                    onClick={() => playTrack(song)}
                    className="w-[130px] flex-shrink-0 bg-[#121217] hover:bg-[#1E1E26] border border-[#262633]/50 p-2.5 rounded-xl transition cursor-pointer shadow-md"
                  >
                    <img
                      src={song.imageUrl}
                      alt={song.name}
                      className="w-full h-[110px] object-cover rounded-lg bg-[#050505] shadow"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                      }}
                    />
                    <p className="text-xs font-bold text-white truncate mt-2">{song.name}</p>
                    <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">
                      {song.primaryArtists}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Playlist Feed ("Jump Back In") */}
            <div className="mt-6 mb-4">
              <h2 className="text-sm font-bold text-white mb-3 tracking-tight">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Jump Back In'}
              </h2>
              <div className="flex flex-col gap-2">
                {songs.map((song, idx) => {
                  const isCurrent = currentTrack?.id === song.id;
                  return (
                    <div
                      key={`list_${song.id}_${idx}`}
                      onClick={() => playTrack(song)}
                      className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer border ${
                        isCurrent
                          ? 'bg-[#181822] border-[#262633]'
                          : 'bg-[#121217]/60 hover:bg-[#121217] border-transparent hover:border-[#262633]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={song.imageUrl}
                          alt={song.name}
                          className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-[#050505] border border-white/5"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                          }}
                        />
                        <div className="min-w-0 flex-1 pr-2">
                          <p
                            className={`text-xs font-semibold truncate ${
                              isCurrent ? 'text-[#E11D48]' : 'text-white'
                            }`}
                          >
                            {song.name}
                          </p>
                          <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                            {song.primaryArtists}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px] font-mono text-[#94A3B8]">
                          {formatDuration(song.duration)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playTrack(song);
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                            isCurrent && isPlaying ? 'text-[#E11D48]' : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="w-4 h-4 fill-current stroke-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current stroke-current translate-x-0.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GALAXY */}
        {activeTab === 'galaxy' && <GalaxyVisualizer songs={songs} />}

        {/* TAB 3: LIBRARY */}
        {activeTab === 'library' && <LibraryView />}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && <ProfileView />}

        {/* Carlos Han MiniPlayer */}
        <MiniPlayer onOpenNowPlaying={() => setIsPlayerOpen(true)} />

        {/* Bottom Navigation Dock */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Full-Screen Now Playing View Modal */}
        {isPlayerOpen && <NowPlayingView onClose={() => setIsPlayerOpen(false)} />}
      </div>
    </div>
  );
}
