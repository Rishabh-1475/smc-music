'use client';
import React, { useState, useEffect } from 'react';
import { Search, Compass, Music, Disc, Home as HomeIcon, Play, Pause, Sparkles, ExternalLink } from 'lucide-react';
import { fetchSongsByQuery, Song, FALLBACK_CATALOG } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';
import { AstraSphere3D } from '@/components/AstraSphere3D';
import { Hero3DVisualizer } from '@/components/Hero3DVisualizer';
import { CreatorModal } from '@/components/CreatorModal';
import { LibraryView } from '@/components/LibraryView';
import { NowPlayingView } from '@/components/NowPlayingView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'galaxy' | 'library'>('home');
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>(FALLBACK_CATALOG);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const { currentTrack, playTrack, togglePlay, isPlaying, setQueue } = usePlayerStore();
  const chips = ['All', 'Music', 'Podcasts', 'Gym Phonk', 'Punjabi', 'Bhojpuri'];

  useEffect(() => {
    let active = true;
    const q = searchQuery.trim() || (category === 'All' ? 'Trending Indian Hits 2026' : `${category} Hits`);
    fetchSongsByQuery(q).then((res) => {
      if (active) {
        const list = res.length > 0 ? res : FALLBACK_CATALOG;
        setSongs(list);
        setQueue(list);
      }
    });
    return () => { active = false; };
  }, [category, searchQuery, setQueue]);

  const featuredSong = songs[0] || FALLBACK_CATALOG[0];

  return (
    <div className="bg-[#070708] text-[#f4f0f2] min-h-screen">
      <div className="ambient" />

      <div className="shell">
        {/* DESKTOP SIDEBAR CONSOLE (BLUEPRINT PAGE 03) */}
        <aside className="sidebar glass">
          <div className="brand">
            <div className="brand-mark">R</div>
            <div>
              NOIR<span>//</span>SOUND
              <small>ASTRA 3D ENGINE</small>
            </div>
          </div>

          <div className="nav-label">Navigation</div>
          <button
            onClick={() => setActiveTab('home')}
            className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
          >
            <HomeIcon className="w-4 h-4" />
            <span>Home / Discover</span>
          </button>
          <button
            onClick={() => setActiveTab('galaxy')}
            className={`nav-btn ${activeTab === 'galaxy' ? 'active' : ''}`}
          >
            <Compass className="w-4 h-4" />
            <span>ASTRA Spatial AI</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`nav-btn ${activeTab === 'library' ? 'active' : ''}`}
          >
            <Music className="w-4 h-4" />
            <span>Library & Liked</span>
          </button>

          {/* RISHABH SINGH CREATOR DOSSIER TRIGGER */}
          <div onClick={() => setIsCreatorOpen(true)} className="side-bottom group">
            <div className="avatar">
              <img
                src="/creator.jpeg"
                alt="Rishabh Singh"
                onError={(e) => { e.currentTarget.src = '/creator.jpg'; }}
              />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-white text-xs group-hover:text-[#ff2447] transition block truncate">
                Rishabh Singh
              </span>
              <small className="text-[10px] text-gray-400 font-mono block">Lead Architect</small>
            </div>
          </div>
        </aside>

        {/* MAIN LUXURY DISPLAY SURFACE */}
        <main className="main">
          {/* TOP BAR */}
          <header className="top">
            <div className="search">
              <Search className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search artists, tracks, or soundscapes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={() => setActiveTab('galaxy')} className="upgrade-btn">
              <Sparkles className="w-3.5 h-3.5 text-[#ff2447]" />
              <span>ASTRA 3D</span>
            </button>
          </header>

          {activeTab === 'home' && (
            <div className="p-2 md:p-4 max-w-6xl">
              {/* FILTER CHIPS */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => { setSearchQuery(''); setCategory(chip); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                      category === chip && !searchQuery
                        ? 'bg-[#b20c2b] text-white shadow-[0_0_15px_rgba(255,36,71,0.4)]'
                        : 'bg-[#151416] text-[#878387] border border-white/5 hover:text-white'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* CINEMATIC HERO STAGE */}
              <Hero3DVisualizer song={featuredSong} />

              {/* MADE FOR YOU ALBUM TILES */}
              <div className="mt-8">
                <h3 className="text-sm font-extrabold tracking-widest text-[#878387] uppercase mb-4">
                  Made For You
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {songs.slice(0, 12).map((song) => (
                    <div
                      key={song.id}
                      onClick={() => playTrack(song, songs)}
                      className="card-noir"
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#111114]">
                        <img src={song.imageUrl} alt={song.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-bold text-white truncate">{song.name}</p>
                      <p className="text-[11px] text-[#878387] truncate mt-0.5">{song.primaryArtists}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'galaxy' && <AstraSphere3D />}
          {activeTab === 'library' && <LibraryView />}
        </main>
      </div>

      {/* NOIR GLASS PLAYER DOCK */}
      {currentTrack && (
        <div
          onClick={() => setIsPlayerOpen(true)}
          className="player-dock glass cursor-pointer group hover:border-[#ff2447]/40 transition"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img src={currentTrack.imageUrl} alt={currentTrack.name} className="w-12 h-12 rounded-xl object-cover shadow-md" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-[#ff2447] transition">{currentTrack.name}</p>
              <p className="text-[11px] text-[#878387] truncate">{currentTrack.primaryArtists}</p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-[#b20c2b] to-[#ff2447] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,36,71,0.5)] transition hover:scale-105 active:scale-95 flex-shrink-0"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white translate-x-0.5" />}
          </button>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#070708]/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around z-30">
        <button onClick={() => setActiveTab('home')} className={`text-xs flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#ff2447]' : 'text-gray-400'}`}>
          <HomeIcon className="w-4 h-4" /> Home
        </button>
        <button onClick={() => setActiveTab('galaxy')} className={`text-xs flex flex-col items-center gap-1 ${activeTab === 'galaxy' ? 'text-[#ff2447]' : 'text-gray-400'}`}>
          <Compass className="w-4 h-4" /> ASTRA
        </button>
        <button onClick={() => setActiveTab('library')} className={`text-xs flex flex-col items-center gap-1 ${activeTab === 'library' ? 'text-[#ff2447]' : 'text-gray-400'}`}>
          <Music className="w-4 h-4" /> Library
        </button>
        <button onClick={() => setIsCreatorOpen(true)} className="text-xs flex flex-col items-center gap-1 text-gray-400">
          <div className="w-5 h-5 rounded-full overflow-hidden border border-[#ff2447]">
            <img src="/creator.jpeg" alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/creator.jpg'; }} />
          </div>
          Creator
        </button>
      </nav>

      {/* RISHABH SINGH CREATOR PROFILE MODAL */}
      <CreatorModal isOpen={isCreatorOpen} onClose={() => setIsCreatorOpen(false)} />
      {isPlayerOpen && <NowPlayingView onClose={() => setIsPlayerOpen(false)} />}
    </div>
  );
}
