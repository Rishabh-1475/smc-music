'use client';
import React, { useState, useEffect } from 'react';
import { Search, Heart, Play, User, Compass, Music, Home as HomeIcon, Mic } from 'lucide-react';
import { OnboardingModal } from '@/components/OnboardingModal';
import { NowPlayingView } from '@/components/NowPlayingView';
import { AstraSphere3D } from '@/components/AstraSphere3D';
import { LibraryView } from '@/components/LibraryView';
import { MiniPlayer } from '@/components/MiniPlayer';
import { TiltCard3D } from '@/components/TiltCard3D';
import { Hero3DVisualizer } from '@/components/Hero3DVisualizer';
import { fetchSongsByQuery, Song, FALLBACK_CATALOG } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

export default function App() {
  const [userName, setUserName] = useState('Rishabh');
  const [activeTab, setActiveTab] = useState<'home' | 'galaxy' | 'library' | 'profile'>('home');
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>(FALLBACK_CATALOG);
  const [loading, setLoading] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const { currentTrack, isPlaying, playTrack, setQueue, recents } = usePlayerStore();

  const filterChips = ['All', 'Music', 'Podcasts', 'Gym Phonk', 'Punjabi', 'Bhojpuri'];

  const CATEGORY_MAP: Record<string, string> = {
    All: 'Top Bollywood India Trending Hits',
    Music: 'Latest Hindi Superhits 2026',
    Podcasts: 'Hindi Podcast Horror Stories Crime Motivation Audio Shows',
    'Gym Phonk': 'Aggressive Drift Phonk Gym Workout',
    Punjabi: 'Latest Trending Punjabi Hits',
    Bhojpuri: 'Top Trending Bhojpuri Hits'
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

    const query = searchQuery.trim()
      ? searchQuery.trim()
      : (CATEGORY_MAP[category] || 'Top Bollywood India Trending Hits');

    fetchSongsByQuery(query).then((res) => {
      if (active) {
        const list = res && res.length > 0 ? res : FALLBACK_CATALOG;
        setSongs(list);
        setQueue(list);
        setLoading(false);
      }
    }).catch(() => {
      if (active) {
        setSongs(FALLBACK_CATALOG);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [category, searchQuery, setQueue]);

  const featuredSong = songs[0] || FALLBACK_CATALOG[0];

  const recentlyPlayedSongs = React.useMemo(() => {
    if (recents && recents.length >= 6) return recents.slice(0, 6);
    const seenCovers = new Set<string>();
    const diverse: typeof songs = [];
    for (const s of songs) {
      if (!seenCovers.has(s.imageUrl)) {
        seenCovers.add(s.imageUrl);
        diverse.push(s);
      }
      if (diverse.length === 6) break;
    }
    return diverse.length >= 4 ? diverse : songs.slice(0, 6);
  }, [recents, songs]);

  return (
    <div className="min-h-screen bg-[#080809] text-white flex justify-center selection:bg-[#B50925] selection:text-white select-none">
      <OnboardingModal onComplete={(name) => setUserName(name)} />

      {/* Blueprint Responsive Shell Frame */}
      <div className="w-full max-w-md md:max-w-6xl min-h-screen bg-[#080809] border-x border-white/10 relative flex flex-col pb-36">
        
        {/* Top App Bar with Obsidian Surface & Smoked Accent */}
        <header className="px-5 pt-7 pb-3 flex items-center justify-between border-b border-white/10 relative z-10 bg-[#080809]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#B50925] via-[#E11D48] to-[#FF2348] shadow-[0_0_15px_rgba(181,9,37,0.4)]">
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
              <h1 className="text-base font-extrabold text-white">Hi, {userName}</h1>
              <p className="text-[11px] text-[#FF2348] font-mono tracking-widest uppercase">NOIR//SOUND 3D ASTRA</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('library')}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#FF2348] hover:border-[#FF2348]/40 transition cursor-pointer"
              title="Liked Library"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#FF2348] hover:border-[#FF2348]/40 transition cursor-pointer"
              title="Profile"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 3D Holographic Search Box with ASTRA Voice Trigger */}
        <div className="px-5 py-3 relative z-10 w-full max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 50+ songs, artists, Punjabi, Bhojpuri, Phonk..."
              className="w-full pl-10 pr-16 py-2.5 rounded-full bg-[#151518] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#B50925] focus:shadow-[0_0_15px_rgba(181,9,37,0.3)] transition"
            />
            <button
              onClick={() => setActiveTab('galaxy')}
              className="absolute right-9 text-gray-400 hover:text-[#FF2348] transition cursor-pointer p-1"
              title="Astra AI Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: HOME / DISCOVER TEMPLATE (Blueprint Page 03 & 04) */}
        {activeTab === 'home' && (
          <div className="flex-1 px-5">
            {/* Filter Chips: Minimal smoked-chrome chips */}
            <div className="py-2 flex gap-2 overflow-x-auto no-scrollbar">
              {filterChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => { setSearchQuery(''); setCategory(chip); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    category === chip && !searchQuery
                      ? 'bg-gradient-to-r from-[#B50925] to-[#FF2348] text-white shadow-[0_0_15px_rgba(181,9,37,0.4)]'
                      : 'bg-[#151518] text-gray-300 border border-white/10 hover:border-white/25 hover:bg-white/10'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* BLOCK 1: Featured Hero Stage (Blueprint Page 04) */}
            {!searchQuery && (
              <Hero3DVisualizer song={featuredSong} />
            )}

            {/* BLOCK 2: Made For You (Horizontal Carousel of 140px square album cards) */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-white tracking-wide">Made For You</h2>
                <span className="text-[10px] text-[#FF2348] font-mono uppercase tracking-wider">Spatial Audio</span>
              </div>
              <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-3 perspective-stage">
                {songs.slice(0, 10).map((song) => (
                  <TiltCard3D
                    key={`mfy_${song.id}`}
                    depth={14}
                    onClick={() => playTrack(song)}
                    className="w-[140px] flex-shrink-0 bg-[#151518]/90 p-2.5 rounded-2xl border border-white/10 hover:border-[#B50925]/60 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] transition"
                  >
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg bg-black">
                      <img
                        src={song.imageUrl}
                        alt={song.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <p className="text-xs font-bold text-white truncate mt-2">{song.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5">{song.primaryArtists}</p>
                  </TiltCard3D>
                ))}
              </div>
            </div>

            {/* BLOCK 3: Recently Played (Compact 2-column grid of obsidian glass tiles) */}
            <div className="mt-4">
              <h2 className="text-sm font-bold text-white mb-2 tracking-wide">Recently Played</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 perspective-[1000px]">
                {recentlyPlayedSongs.map((song) => {
                  const isCurrent = currentTrack?.id === song.id;
                  return (
                    <div
                      key={`recent_${song.id}`}
                      onClick={() => playTrack(song)}
                      className={`group relative flex items-center rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform active:scale-95 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-[#2A0812] to-[#151518] border border-[#FF2348] shadow-[0_10px_25px_rgba(255,35,72,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]'
                          : 'bg-gradient-to-br from-[#1c1c22]/90 via-[#151518]/95 to-[#080809] border border-white/10 hover:border-[#B50925]/60 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Specular Edge Top-Light */}
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                      {/* Elevated Left-Aligned Artwork Thumbnail */}
                      <div className="relative w-12 h-12 flex-shrink-0 m-1.5 rounded-xl overflow-hidden shadow-lg border border-white/10 bg-black">
                        <img
                          src={song.imageUrl}
                          alt={song.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                          }}
                        />
                        {isCurrent && isPlaying && (
                          <div className="absolute inset-0 bg-[#B50925]/50 backdrop-blur-[1px] flex items-center justify-center gap-0.5">
                            <span className="w-1 h-3.5 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                            <span className="w-1 h-5 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_0.2s_infinite]" />
                            <span className="w-1 h-2.5 bg-white rounded-full animate-[bounce_0.5s_ease-in-out_0.4s_infinite]" />
                          </div>
                        )}
                      </div>

                      {/* Title with Active Highlight */}
                      <p className={`text-xs font-black px-2 truncate flex-1 tracking-tight drop-shadow ${
                        isCurrent ? 'text-[#FF2348]' : 'text-white group-hover:text-[#FF2348] transition-colors'
                      }`}>
                        {song.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BLOCK 4: All Tracks / Search Results Responsive Feed */}
            <div className="mt-6 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  {searchQuery ? `Results for "${searchQuery}"` : (category === 'All' ? 'Top Daily Playlists' : `${category} Feed`)}
                </h2>
                <span className="text-xs text-[#FF2348] font-mono">{songs.length} Tracks</span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-gray-500 font-mono">
                  RETRIEVING SPATIAL FEEDS...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {songs.map((song) => {
                    const isCurrent = currentTrack?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playTrack(song)}
                        className={`flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer border ${
                          isCurrent
                            ? 'bg-[#1e1418] border-[#FF2348]/60 shadow-[0_0_15px_rgba(255,35,72,0.2)]'
                            : 'bg-[#151518]/70 border-white/5 hover:border-white/15'
                        }`}
                      >
                        <img src={song.imageUrl} alt={song.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 px-3 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#FF2348]' : 'text-white'}`}>
                            {song.name}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">By {song.primaryArtists}</p>
                        </div>
                        <button className={`w-8 h-8 rounded-full flex items-center justify-center ${isCurrent && isPlaying ? 'text-[#FF2348]' : 'text-gray-400'}`}>
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ASTRA 3D HOLOGRAPHIC SPHERE (Blueprint Page 09) */}
        {activeTab === 'galaxy' && <AstraSphere3D />}

        {/* TAB 3: LIKED SONGS (Blueprint Page 07) */}
        {activeTab === 'library' && <LibraryView />}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <div className="p-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-2 border-[#FF2348] overflow-hidden mb-3 shadow-[0_0_20px_rgba(255,35,72,0.4)]">
              <img src="/creator.jpg" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-lg font-bold text-white">{userName}</h2>
            <p className="text-xs text-gray-400 mt-1">Lead Developer &amp; Architect</p>
            <div className="w-full mt-6 bg-[#151518] border border-white/10 rounded-2xl p-4 flex justify-around text-center">
              <div>
                <p className="text-lg font-extrabold text-[#FF2348]">320 KBPS</p>
                <p className="text-[10px] text-gray-400">Audio Fidelity</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-lg font-extrabold text-white">Lossless 3D</p>
                <p className="text-[10px] text-gray-400">Spatial Stage</p>
              </div>
            </div>
            <a
              href="https://www.instagram.com/rish4bhsiingh/"
              target="_blank"
              rel="noreferrer"
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-[#B50925] to-[#FF2348] text-white font-bold text-xs text-center shadow-[0_0_20px_rgba(181,9,37,0.4)] active:scale-95 transition"
            >
              Follow on Instagram (@rish4bhsiingh)
            </a>
          </div>
        )}

        {/* Suspended 3D MiniPlayer Dock */}
        <MiniPlayer onOpenNowPlaying={() => setIsPlayerOpen(true)} />

        {/* Floating 3D Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md md:max-w-6xl mx-auto h-16 bg-[#080809]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around z-30 px-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`text-xs flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'home' ? 'text-[#FF2348]' : 'text-gray-400'}`}
          >
            <HomeIcon className="w-4 h-4" />
            <span className="text-[10px]">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('galaxy')}
            className={`text-xs flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'galaxy' ? 'text-[#FF2348]' : 'text-gray-400'}`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px]">Galaxy</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`text-xs flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'library' ? 'text-[#FF2348]' : 'text-gray-400'}`}
          >
            <Music className="w-4 h-4" />
            <span className="text-[10px]">Library</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`text-xs flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'profile' ? 'text-[#FF2348]' : 'text-gray-400'}`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px]">Profile</span>
          </button>
        </nav>

        {isPlayerOpen && <NowPlayingView onClose={() => setIsPlayerOpen(false)} />}
      </div>
    </div>
  );
}
