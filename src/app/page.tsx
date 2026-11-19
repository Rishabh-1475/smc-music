'use client';
import React, { useState, useEffect } from 'react';
import { Search, Heart, Play, Pause, User, Compass, Music, Home as HomeIcon } from 'lucide-react';
import { OnboardingModal } from '@/components/OnboardingModal';
import { NowPlayingView } from '@/components/NowPlayingView';
import { GalaxyVisualizer } from '@/components/GalaxyVisualizer';
import { LibraryView } from '@/components/LibraryView';
import { MiniPlayer } from '@/components/MiniPlayer';
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

  const { currentTrack, isPlaying, playTrack, setQueue } = usePlayerStore();

  const categories = ['All', 'New Release', 'Trending', 'Top', 'Gym Phonk', 'Punjabi', 'Bhojpuri'];

  const categoryQueries: Record<string, string> = {
    All: 'Bollywood Trending Hits',
    'New Release': 'Latest Hindi Songs',
    Trending: 'Trending Songs India',
    Top: 'Top Hindi Songs',
    'Gym Phonk': 'Phonk Gym Workout',
    Punjabi: 'Punjabi Top Hits',
    Bhojpuri: 'Bhojpuri Superhits'
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

    const query = searchQuery.trim() || (categoryQueries[category] || `${category} Songs`);
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
  }, [category, searchQuery, setQueue]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (activeTab !== 'home') setActiveTab('home');
  };

  const featuredSong = songs[0] || FALLBACK_CATALOG[0];

  return (
    <div className="min-h-screen bg-[#070709] text-white flex select-none">
      <OnboardingModal onComplete={(name) => setUserName(name)} />

      {/* DESKTOP SPOTIFY SIDEBAR (Visible on md screens and up) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0A0A0E] border-r border-white/5 p-5 justify-between">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#CCFF00] text-black font-extrabold flex items-center justify-center text-sm shadow-[0_0_15px_rgba(204,255,0,0.4)]">
              RX
            </div>
            <span className="font-extrabold tracking-wider text-base text-white">RhythmX</span>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'home' ? 'bg-white/10 text-[#CCFF00]' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <HomeIcon className="w-4 h-4" /> Home
            </button>
            <button
              onClick={() => setActiveTab('galaxy')}
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'galaxy' ? 'bg-white/10 text-[#CCFF00]' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4" /> Music Galaxy
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'library' ? 'bg-white/10 text-[#CCFF00]' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Music className="w-4 h-4" /> Liked Songs
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'profile' ? 'bg-white/10 text-[#CCFF00]' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" /> Profile
            </button>
          </nav>
        </div>

        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[10px] text-gray-400 uppercase font-mono">Hi-Res Engine</p>
          <p className="text-xs font-bold text-[#CCFF00] mt-0.5">320kbps Lossless</p>
        </div>
      </aside>

      {/* MAIN CONTENT VIEW (Responsive wrapper) */}
      <main className="flex-1 flex flex-col min-h-screen bg-[#0A0A0C] relative pb-36 overflow-y-auto">
        {/* Top Header */}
        <header className="px-5 pt-6 pb-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#CCFF00] to-purple-600">
              <img
                src="/creator.jpg"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'; }}
              />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-extrabold text-white">Hi, {userName}</h1>
              <p className="text-[10px] md:text-xs text-gray-400">Ready to explore lossless sound</p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('library')}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-[#CCFF00] transition"
              title="Liked Songs"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-[#CCFF00] transition md:hidden"
              title="Profile"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Global Search Bar */}
        <div className="px-5 py-3">
          <div className="relative flex items-center max-w-xl">
            <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search songs, artists, Punjabi, Bhojpuri, Phonk..."
              className="w-full pl-10 pr-10 py-2.5 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#CCFF00] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* TAB: HOME FEED */}
        {activeTab === 'home' && (
          <div className="flex-1 px-5">
            {/* Category Filter Chips */}
            <div className="py-2 flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => { setSearchQuery(''); setCategory(c); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    category === c && !searchQuery
                      ? 'bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] font-bold'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Curated Hero Card (Reference 1) */}
            {!searchQuery && (
              <div className="py-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Curated &amp; trending</p>
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#401258] via-[#210D3D] to-[#0A0A0D] border border-white/10 p-5 flex items-center justify-between shadow-2xl">
                  <div className="flex-1 pr-3">
                    <span className="text-[9px] font-bold text-purple-200 bg-white/10 px-2 py-0.5 rounded-full uppercase">
                      Discover weekly
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-2 line-clamp-1">{featuredSong.name}</h3>
                    <p className="text-[11px] text-gray-300 line-clamp-1 mt-0.5">By {featuredSong.primaryArtists}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">The original high-fidelity sound curated for you.</p>
                    <button
                      onClick={() => playTrack(featuredSong)}
                      className="mt-3.5 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg"
                    >
                      <Play className="w-5 h-5 fill-black translate-x-0.5" />
                    </button>
                  </div>
                  <img
                    src={featuredSong.imageUrl}
                    alt={featuredSong.name}
                    className="w-28 h-28 rounded-2xl object-cover border border-white/10 shadow-2xl flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_CATALOG[0].imageUrl;
                    }}
                  />
                </div>
              </div>
            )}

            {/* Track Feed Section */}
            <div className="py-3">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  {searchQuery ? `Results for "${searchQuery}"` : (category === 'All' ? 'Top daily playlists' : `${category} Feed`)}
                </h2>
                <span className="text-xs text-[#CCFF00] font-mono">{songs.length} Tracks</span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-gray-500 font-mono">
                  STREAMING CATALOG...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {songs.map((song) => {
                    const isCurrent = currentTrack?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playTrack(song)}
                        className={`flex items-center justify-between p-2.5 rounded-2xl transition cursor-pointer border ${
                          isCurrent ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <img
                          src={song.imageUrl}
                          alt={song.name}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0 bg-neutral-900"
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_CATALOG[0].imageUrl;
                          }}
                        />
                        <div className="flex-1 px-3 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#CCFF00]' : 'text-white'}`}>
                            {song.name}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">By {song.primaryArtists}</p>
                        </div>
                        <button
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCurrent && isPlaying ? 'bg-[#CCFF00] text-black' : 'bg-white/10 text-white'
                          }`}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
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

        {/* TAB: GALAXY CONSTELLATION */}
        {activeTab === 'galaxy' && <GalaxyVisualizer songs={songs} />}

        {/* TAB: LIKED SONGS */}
        {activeTab === 'library' && <LibraryView />}

        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div className="p-6 max-w-md mx-auto flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-2 border-[#CCFF00] overflow-hidden mb-3">
              <img
                src="/creator.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
                }}
              />
            </div>
            <h2 className="text-lg font-bold text-white">{userName}</h2>
            <p className="text-xs text-gray-400 mt-1">Lead Developer &amp; Architect</p>
            <div className="w-full mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-around text-center">
              <div>
                <p className="text-lg font-extrabold text-[#CCFF00]">320 KBPS</p>
                <p className="text-[10px] text-gray-400">Lossless Master</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-lg font-extrabold text-white">{songs.length}</p>
                <p className="text-[10px] text-gray-400">Catalog Streamed</p>
              </div>
            </div>
            <a
              href="https://www.instagram.com/rish4bhsiingh/"
              target="_blank"
              rel="noreferrer"
              className="w-full mt-6 py-3 rounded-2xl bg-[#CCFF00] text-black font-bold text-xs text-center shadow-lg active:scale-95 transition"
            >
              Follow on Instagram (@rish4bhsiingh)
            </a>
          </div>
        )}

        {/* PERSISTENT FLOATING MINIPLAYER */}
        <MiniPlayer onOpenNowPlaying={() => setIsPlayerOpen(true)} />

        {/* MOBILE BOTTOM NAVIGATION DOCK (Hidden on desktop) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0A0A0E]/95 backdrop-blur-lg border-t border-white/10 flex items-center justify-around z-30 px-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`text-xs flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#CCFF00]' : 'text-gray-400'}`}
          >
            <HomeIcon className="w-4 h-4" />
            <span className="text-[10px]">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('galaxy')}
            className={`text-xs flex flex-col items-center gap-1 ${activeTab === 'galaxy' ? 'text-[#CCFF00]' : 'text-gray-400'}`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px]">Galaxy</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`text-xs flex flex-col items-center gap-1 ${activeTab === 'library' ? 'text-[#CCFF00]' : 'text-gray-400'}`}
          >
            <Music className="w-4 h-4" />
            <span className="text-[10px]">Library</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`text-xs flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-[#CCFF00]' : 'text-gray-400'}`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px]">Profile</span>
          </button>
        </nav>

        {/* NOW PLAYING FULL SCREEN DRAWER */}
        {isPlayerOpen && <NowPlayingView onClose={() => setIsPlayerOpen(false)} />}
      </main>
    </div>
  );
}
