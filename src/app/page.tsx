'use client';
import React, { useState, useEffect } from 'react';
import { Search, Compass, Music, Disc, Home as HomeIcon, Heart, User, Radio, Settings, Play } from 'lucide-react';
import { OnboardingModal } from '@/components/OnboardingModal';
import { NowPlayingView } from '@/components/NowPlayingView';
import { AstraSphere3D } from '@/components/AstraSphere3D';
import { LibraryView } from '@/components/LibraryView';
import { MiniPlayer } from '@/components/MiniPlayer';
import { Hero3DVisualizer } from '@/components/Hero3DVisualizer';
import { fetchSongsByQuery, fetchDynamicRadio, Song, FALLBACK_CATALOG } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

export default function App() {
  const [userName, setUserName] = useState('Rishabh');
  const [activeTab, setActiveTab] = useState<'home' | 'galaxy' | 'library' | 'radio'>('home');
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>(FALLBACK_CATALOG);
  const [loading, setLoading] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const { currentTrack, playTrack, setQueue, recents, isPlaying } = usePlayerStore();

  const filterChips = ['All', 'Music', 'Podcasts', 'Gym Phonk', 'Punjabi', 'Bhojpuri'];

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

    const q = searchQuery.trim() || (category === 'All' ? 'Trending India Hits 2026' : `${category} Hits`);
    fetchSongsByQuery(q).then((res) => {
      if (active) {
        const list = res.length > 0 ? res : FALLBACK_CATALOG;
        setSongs(list);
        setQueue(list);
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, [category, searchQuery, setQueue]);

  const featuredSong = songs[0] || FALLBACK_CATALOG[0];

  return (
    <div className="min-h-screen bg-[#080809] text-white flex select-none">
      <OnboardingModal onComplete={(name) => setUserName(name)} />

      {/* DESKTOP SIDEBAR (BLUEPRINT PAGE 03) */}
      <aside className="hidden md:flex w-64 bg-[#080809] border-r border-white/10 flex-col justify-between p-6 h-screen sticky top-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#B50925] to-[#FF2348] flex items-center justify-center font-black text-white shadow-lg">
              R
            </div>
            <div>
              <span className="text-sm font-black tracking-widest text-white uppercase">NOIR//SOUND</span>
              <p className="text-[10px] font-mono text-[#FF2348]">ASTRA 3D ENGINE</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'home' ? 'bg-[#151518] text-[#FF2348] border border-white/10' : 'text-gray-400 hover:text-white'
              }`}
            >
              <HomeIcon className="w-4 h-4" /> Home / Discover
            </button>
            <button
              onClick={() => setActiveTab('galaxy')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'galaxy' ? 'bg-[#151518] text-[#FF2348] border border-white/10' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" /> ASTRA AI Spatial
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'library' ? 'bg-[#151518] text-[#FF2348] border border-white/10' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" /> Library & Liked
            </button>
          </nav>
        </div>

        {/* User Card */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#B50925] to-[#FF2348]">
            <img src="/creator.jpg" alt="Profile" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <p className="text-[10px] text-gray-400 font-mono">Master Audio Plan</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-h-screen flex flex-col pb-32">
        {/* Top Bar */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 sticky top-0 bg-[#080809]/90 backdrop-blur-xl z-30">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artists, tracks, or soundscapes..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#151518] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#FF2348] transition"
            />
          </div>

          <div className="flex items-center gap-3 ml-4">
            <button onClick={() => setActiveTab('galaxy')} className="px-3.5 py-1.5 rounded-full bg-[#B50925]/20 border border-[#B50925]/40 text-[#FF2348] text-xs font-bold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> ASTRA
            </button>
          </div>
        </header>

        {/* HOME VIEW */}
        {activeTab === 'home' && (
          <div className="p-6 max-w-6xl w-full mx-auto">
            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
              {filterChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => { setSearchQuery(''); setCategory(chip); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition ${
                    category === chip && !searchQuery
                      ? 'bg-[#B50925] text-white crimson-glow'
                      : 'bg-[#151518] text-gray-400 border border-white/5 hover:text-white'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Featured Hero */}
            <Hero3DVisualizer song={featuredSong} />

            {/* Made For You (Horizontal Cards) */}
            <div className="mb-8">
              <h2 className="text-base font-extrabold text-white mb-4">Made For You</h2>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {songs.slice(0, 8).map((song) => (
                  <div
                    key={`mfy_${song.id}`}
                    onClick={() => playTrack(song)}
                    className="w-36 flex-shrink-0 noir-card p-3 rounded-xl cursor-pointer"
                  >
                    <img src={song.imageUrl} alt={song.name} className="w-full h-32 object-cover rounded-lg shadow-md" />
                    <p className="text-xs font-bold text-white truncate mt-2">{song.name}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{song.primaryArtists}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Played / Popular Tracks Feed */}
            <div>
              <h2 className="text-base font-extrabold text-white mb-4">Jump Back In</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {songs.slice(0, 10).map((song) => (
                  <div
                    key={`feed_${song.id}`}
                    onClick={() => playTrack(song)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#151518] border border-white/5 hover:border-[#B50925]/50 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={song.imageUrl} alt={song.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${currentTrack?.id === song.id ? 'text-[#FF2348]' : 'text-white'}`}>
                          {song.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{song.primaryArtists}</p>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-white">
                      <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ASTRA GALAXY VIEW */}
        {activeTab === 'galaxy' && <AstraSphere3D />}

        {/* LIBRARY VIEW */}
        {activeTab === 'library' && <LibraryView />}
      </main>

      {/* Persistent MiniPlayer */}
      <MiniPlayer onOpenNowPlaying={() => setIsPlayerOpen(true)} />

      {/* Mobile Bottom Dock (<768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#080809]/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around z-30">
        <button onClick={() => setActiveTab('home')} className={`text-xs flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#FF2348]' : 'text-gray-400'}`}>
          <HomeIcon className="w-4 h-4" /> Home
        </button>
        <button onClick={() => setActiveTab('galaxy')} className={`text-xs flex flex-col items-center gap-1 ${activeTab === 'galaxy' ? 'text-[#FF2348]' : 'text-gray-400'}`}>
          <Compass className="w-4 h-4" /> ASTRA
        </button>
        <button onClick={() => setActiveTab('library')} className={`text-xs flex flex-col items-center gap-1 ${activeTab === 'library' ? 'text-[#FF2348]' : 'text-gray-400'}`}>
          <Music className="w-4 h-4" /> Library
        </button>
      </nav>

      {isPlayerOpen && <NowPlayingView onClose={() => setIsPlayerOpen(false)} />}
    </div>
  );
}
