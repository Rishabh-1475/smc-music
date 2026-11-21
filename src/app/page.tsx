'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Heart, Play, User, Compass, Music, Home as HomeIcon } from 'lucide-react';
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

    // If user typed in search bar, prioritize live user search; otherwise pull from curated category map
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

  const quickAccessSongs = React.useMemo(() => {
    if (recents && recents.length >= 6) return recents.slice(0, 6);
    // Pick tracks with unique album covers
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
    <div className="min-h-screen bg-[#040406] text-white flex justify-center selection:bg-[#EF4444] selection:text-white select-none">
      <OnboardingModal onComplete={(name) => setUserName(name)} />

      {/* Responsive Desktop & Mobile Shell Frame */}
      <div className="w-full max-w-md md:max-w-5xl min-h-screen bg-[#070709] border-x border-[#1F1F2A] relative flex flex-col pb-36">
        
        {/* Top App Bar with Crimson Aura */}
        <header className="px-5 pt-8 pb-3 flex items-center justify-between border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#EF4444] via-rose-600 to-amber-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
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
              <p className="text-[11px] text-[#EF4444] font-mono tracking-wider">RHYTHMX 3D LOSSLESS</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('library')}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#EF4444] transition cursor-pointer"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#EF4444] transition cursor-pointer"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 3D Holographic Search Box */}
        <div className="px-5 py-3 relative z-10 w-full max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 50+ songs, artists, Punjabi, Bhojpuri, Phonk..."
              className="w-full pl-10 pr-10 py-2.5 rounded-full bg-[#121217] border border-[#EF4444]/25 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#EF4444] focus:shadow-[0_0_15px_rgba(239,68,68,0.25)] transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 text-xs text-gray-400 hover:text-white cursor-pointer">✕</button>
            )}
          </div>
        </div>

        {/* TAB 1: HOME FEED */}
        {activeTab === 'home' && (
          <div className="flex-1 px-5">
            {/* Filter Pills */}
            <div className="py-2 flex gap-2 overflow-x-auto no-scrollbar">
              {filterChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => { setSearchQuery(''); setCategory(chip); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    category === chip && !searchQuery
                      ? 'bg-gradient-to-r from-[#EF4444] to-rose-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* 3D GLOSSY OBSIDIAN QUICK-ACCESS TILES */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mt-3 px-1 perspective-[1000px]">
              {quickAccessSongs.map((song) => {
                const isCurrent = currentTrack?.id === song.id;
                return (
                  <div
                    key={`tile_${song.id}`}
                    onClick={() => playTrack(song)}
                    className={`group relative flex items-center rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform active:scale-95 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-[#2A0812] to-[#14060A] border border-[#EF4444] shadow-[0_10px_25px_rgba(239,68,68,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                        : 'bg-gradient-to-br from-[#181822]/90 via-[#0E0E16]/95 to-[#040407] border border-white/10 hover:border-[#EF4444]/60 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.18)] hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Specular Edge Top-Light */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                    {/* 3D Elevated Artwork Thumbnail */}
                    <div className="relative w-12 h-12 flex-shrink-0 m-1.5 rounded-xl overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.8)] border border-white/10 bg-black">
                      <img
                        src={song.imageUrl}
                        alt={song.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                        }}
                      />
                      {isCurrent && isPlaying && (
                        <div className="absolute inset-0 bg-[#EF4444]/30 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        </div>
                      )}
                    </div>

                    {/* Title with Glow */}
                    <p className={`text-xs font-black px-2 truncate flex-1 tracking-tight drop-shadow ${
                      isCurrent ? 'text-[#EF4444]' : 'text-white group-hover:text-[#EF4444] transition-colors'
                    }`}>
                      {song.name}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 3D Curated Hero Showcase Card */}
            {!searchQuery && (
              <Hero3DVisualizer song={featuredSong} />
            )}

            {/* Jump Back In Shelf (Horizontal 3D Carousel) */}
            <div className="mt-2">
              <h2 className="text-sm font-bold text-white mb-3">Jump Back In</h2>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 perspective-stage">
                {songs.slice(0, 8).map((song) => (
                  <TiltCard3D
                    key={`shelf_${song.id}`}
                    depth={12}
                    onClick={() => playTrack(song)}
                    className="w-32 flex-shrink-0 bg-[#0E0E14] p-2.5 rounded-2xl border border-white/5 hover:border-[#EF4444]/40"
                  >
                    <img src={song.imageUrl} alt={song.name} className="w-full h-28 object-cover rounded-xl shadow-lg" />
                    <p className="text-xs font-bold text-white truncate mt-2">{song.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5">{song.primaryArtists}</p>
                  </TiltCard3D>
                ))}
              </div>
            </div>

            {/* Vertical Playlist Feed */}
            <div className="mt-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  {searchQuery ? `Results for "${searchQuery}"` : (category === 'All' ? 'Top daily playlists' : `${category} Feed`)}
                </h2>
                <span className="text-xs text-[#EF4444] font-mono">{songs.length} Tracks</span>
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
                            ? 'bg-[#181218] border-[#EF4444]/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                            : 'bg-[#121217]/70 border-white/5 hover:border-white/15'
                        }`}
                      >
                        <img src={song.imageUrl} alt={song.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 px-3 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#EF4444]' : 'text-white'}`}>
                            {song.name}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">By {song.primaryArtists}</p>
                        </div>
                        <button className={`w-8 h-8 rounded-full flex items-center justify-center ${isCurrent && isPlaying ? 'text-[#EF4444]' : 'text-gray-400'}`}>
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

        {/* TAB 2: ASTRA 3D HOLOGRAPHIC SPHERE */}
        {activeTab === 'galaxy' && <AstraSphere3D />}

        {/* TAB 3: LIKED SONGS */}
        {activeTab === 'library' && <LibraryView />}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <div className="p-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-2 border-[#EF4444] overflow-hidden mb-3 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
              <img src="/creator.jpg" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-lg font-bold text-white">{userName}</h2>
            <p className="text-xs text-gray-400 mt-1">Lead Developer &amp; Architect</p>
            <div className="w-full mt-6 bg-[#121217] border border-white/10 rounded-2xl p-4 flex justify-around text-center">
              <div>
                <p className="text-lg font-extrabold text-[#EF4444]">320 KBPS</p>
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
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-[#EF4444] to-rose-600 text-white font-bold text-xs text-center shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 transition"
            >
              Follow on Instagram (@rish4bhsiingh)
            </a>
          </div>
        )}

        {/* Suspended 3D MiniPlayer Dock */}
        <MiniPlayer onOpenNowPlaying={() => setIsPlayerOpen(true)} />

        {/* Floating 3D Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md md:max-w-5xl mx-auto h-16 bg-[#070709]/95 backdrop-blur-xl border-t border-[#1F1F2A] flex items-center justify-around z-30 px-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`text-xs flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'home' ? 'text-[#EF4444]' : 'text-gray-400'}`}
          >
            <HomeIcon className="w-4 h-4" />
            <span className="text-[10px]">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('galaxy')}
            className={`text-xs flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'galaxy' ? 'text-[#EF4444]' : 'text-gray-400'}`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px]">Galaxy</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`text-xs flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'library' ? 'text-[#EF4444]' : 'text-gray-400'}`}
          >
            <Music className="w-4 h-4" />
            <span className="text-[10px]">Library</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`text-xs flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'profile' ? 'text-[#EF4444]' : 'text-gray-400'}`}
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
