'use client';
import React, { useState, useEffect } from 'react';
import { Search, Heart, Play, Pause, MoreVertical, Sparkles } from 'lucide-react';
import { OnboardingModal } from '@/components/OnboardingModal';
import { NowPlayingView } from '@/components/NowPlayingView';
import { GalaxyVisualizer } from '@/components/GalaxyVisualizer';
import { LibraryView } from '@/components/LibraryView';
import { MiniPlayer } from '@/components/MiniPlayer';
import { BottomNav, NavTab } from '@/components/BottomNav';
import { fetchSongsByQuery, Song, FALLBACK_CATALOG } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

export default function Home() {
  const [userName, setUserName] = useState('Rishabh');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [philomelaTab, setPhilomelaTab] = useState<'Songs' | 'Albums' | 'Artists' | 'Recent'>('Songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>(FALLBACK_CATALOG);
  const [loading, setLoading] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const { currentTrack, isPlaying, playTrack, setQueue, historyIds } = usePlayerStore();

  const philomelaTabs = ['Songs', 'Albums', 'Artists', 'Recent'] as const;

  const tabQueries: Record<string, string> = {
    Songs: 'Bollywood Trending Hits',
    Albums: 'Top Hindi Movie Albums',
    Artists: 'Arijit Singh, Shreya Ghoshal Hits',
    Recent: 'Top Viral Hits India'
  };

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
    setLoading(true);

    const query = searchQuery.trim() || (tabQueries[philomelaTab] || 'Bollywood Trending Hits');
    fetchSongsByQuery(query).then((res) => {
      if (active) {
        const list = res.length > 0 ? res : FALLBACK_CATALOG;
        setSongs(list);
        setQueue(list);
        setLoading(false);
      }
    }).catch(() => {
      if (active) {
        setSongs(FALLBACK_CATALOG);
        setQueue(FALLBACK_CATALOG);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [philomelaTab, searchQuery, setQueue]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (activeTab !== 'home') setActiveTab('home');
  };

  const featuredSong = songs[0] || FALLBACK_CATALOG[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex justify-center selection:bg-[#E11D48] selection:text-white">
      <OnboardingModal onComplete={(name) => setUserName(name)} />

      {/* Philomela Viewport: Max-width 430px centered shell */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#050505] border-x border-white/10 relative flex flex-col pb-36 overflow-x-hidden">
        
        {/* Philomela Top Header */}
        <header className="px-5 pt-7 pb-2 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg p-0.5 border border-white/10 bg-[#0D0D11] flex items-center justify-center font-mono font-bold text-xs tracking-wider text-white">
              RX
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">PHILOMELA AUDIO</p>
              <h1 className="text-xs font-bold text-white tracking-wide">Hi, {userName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('library')}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition active:scale-95"
              title="Liked Tracks"
            >
              <Heart className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Integrated Philomela Search Bar */}
        <div className="px-5 py-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search songs, albums, artists..."
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#0D0D11] border border-white/10 text-white placeholder-zinc-600 text-xs font-sans focus:outline-none focus:border-white/30 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-xs text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: HOME (Philomela Views) */}
        {activeTab === 'home' && (
          <div className="flex-1">
            {/* Philomela Horizontal Section Sub-Nav */}
            <div className="px-5 flex gap-6 border-b border-white/5 pt-1 pb-2">
              {philomelaTabs.map((tab) => {
                const isActive = philomelaTab === tab && !searchQuery;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setSearchQuery('');
                      setPhilomelaTab(tab);
                    }}
                    className={`text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'text-white border-b-2 border-white pb-1 font-bold'
                        : 'text-zinc-500 hover:text-zinc-300 pb-1 border-b-2 border-transparent'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Featured Release Showcase (Reference & Philomela Suite) */}
            {!searchQuery && philomelaTab === 'Songs' && (
              <div className="px-5 py-3.5">
                <p className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-2">FEATURED RELEASE</p>
                <div className="relative overflow-hidden rounded-2xl bg-[#0D0D11] border border-white/10 p-4 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                  <div className="flex-1 pr-3">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase">
                      320 KBPS LOSSLESS
                    </span>
                    <h3 className="text-sm font-bold text-white mt-2 line-clamp-1">{featuredSong.name}</h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{featuredSong.primaryArtists}</p>
                    <button
                      onClick={() => playTrack(featuredSong)}
                      className="mt-3.5 px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5 hover:scale-105 active:scale-95 transition shadow-lg"
                    >
                      <Play className="w-3.5 h-3.5 fill-black stroke-black" /> Play Now
                    </button>
                  </div>
                  <img
                    src={featuredSong.imageUrl}
                    alt={featuredSong.name}
                    className="w-24 h-24 rounded-xl object-cover border border-white/10 shadow-xl flex-shrink-0 bg-neutral-900"
                    onError={(e) => {
                      e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Philomela Track Listing View */}
            <div className="px-5 py-3">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-400 font-mono">
                  {searchQuery ? `Results for "${searchQuery}"` : `${philomelaTab} Catalog`}
                </h2>
                <span className="text-[10px] font-mono text-zinc-500">{songs.length} Tracks</span>
              </div>

              {loading ? (
                <div className="py-16 text-center text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                  STREAMING PHILOMELA LOSSLESS...
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {songs.map((song, index) => {
                    const isCurrent = currentTrack?.id === song.id;
                    const durationMins = song.duration
                      ? `${Math.floor(Number(song.duration) / 60)}:${(Number(song.duration) % 60).toString().padStart(2, '0')}`
                      : '3:30';

                    return (
                      <div
                        key={song.id}
                        onClick={() => playTrack(song)}
                        className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer border ${
                          isCurrent
                            ? 'bg-[#0D0D11] border-white/15'
                            : 'bg-transparent border-transparent hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-[#0D0D11]">
                            <img
                              src={song.imageUrl}
                              alt={song.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                              }}
                            />
                            {isCurrent && isPlaying && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-white font-bold' : 'text-zinc-200'}`}>
                              {song.name}
                            </p>
                            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                              {song.primaryArtists} {song.album ? `• ${song.album}` : ''} • {durationMins}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playTrack(song);
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition flex-shrink-0 ${
                            isCurrent && isPlaying ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-black stroke-black" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GALAXY CONSTELLATION */}
        {activeTab === 'galaxy' && <GalaxyVisualizer songs={songs} />}

        {/* TAB 3: LIKED SONGS */}
        {activeTab === 'library' && <LibraryView />}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <div className="p-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-xl border border-white/15 overflow-hidden mb-3 bg-[#0D0D11] p-0.5">
              <img
                src="/creator.jpg"
                alt="Profile"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
                }}
              />
            </div>
            <h2 className="text-base font-bold text-white">{userName}</h2>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5 uppercase tracking-wider">Philomela Lead Architect</p>

            <div className="w-full mt-6 bg-[#0D0D11] border border-white/10 rounded-2xl p-4 flex justify-around text-center">
              <div>
                <p className="text-sm font-mono font-bold text-white">320 KBPS</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Fidelity</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-sm font-mono font-bold text-white">{songs.length}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Catalog</p>
              </div>
            </div>

            <a
              href="https://www.instagram.com/rish4bhsiingh/"
              target="_blank"
              rel="noreferrer"
              className="w-full mt-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs text-center shadow-lg active:scale-95 transition"
            >
              Follow on Instagram (@rish4bhsiingh)
            </a>
          </div>
        )}

        {/* Philomela Docked MiniPlayer */}
        <MiniPlayer onOpenNowPlaying={() => setIsPlayerOpen(true)} />

        {/* Philomela Fixed Bottom Tab Bar */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Philomela Full-Screen Now Playing View Modal */}
        {isPlayerOpen && <NowPlayingView onClose={() => setIsPlayerOpen(false)} />}
      </div>
    </div>
  );
}
