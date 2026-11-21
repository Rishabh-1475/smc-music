'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Compass,
  Music,
  Home as HomeIcon,
  Radio,
  Play,
  Pause,
  Sparkles,
  Heart,
  Clock,
  Trash2,
  Disc3,
  Flame,
  Zap
} from 'lucide-react';
import { fetchSongsByQuery, Song } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';
import { AstraSphere3D } from '@/components/AstraSphere3D';
import { Hero3DVisualizer } from '@/components/Hero3DVisualizer';
import { CreatorModal } from '@/components/CreatorModal';
import { PlayerDock } from '@/components/PlayerDock';
import { OnboardingModal } from '@/components/OnboardingModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'radio' | 'library' | 'galaxy'>('home');
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [exploreSongs, setExploreSongs] = useState<Song[]>([]);
  const [radioSongs, setRadioSongs] = useState<Song[]>([]);
  const [librarySubTab, setLibrarySubTab] = useState<'liked' | 'recents'>('liked');
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [userName, setUserName] = useState('Rishabh');

  const {
    currentTrack,
    playTrack,
    togglePlay,
    isPlaying,
    setQueue,
    likedSongs,
    recents,
    toggleLike
  } = usePlayerStore();

  const homeChips = ['All', 'Trending Hits', 'Punjabi', 'Bollywood', 'Gym Phonk', 'Bhojpuri', 'Lofi Soul'];
  const genres = ['Bollywood', 'Punjabi', 'Indie Pop', 'EDM Beats', 'Lofi Chill', 'Hip-Hop', 'Sufi', 'Bhojpuri'];

  const moodStations = [
    { name: 'Midnight Drive', query: 'Night Drive Phonk Lofi 2026', icon: '🌙', gradient: 'from-[#340813] to-[#151416]' },
    { name: 'Workout Beast', query: 'Gym Phonk Aggressive High Energy', icon: '⚡', gradient: 'from-[#4D0819] to-[#181115]' },
    { name: 'Desi Dance Party', query: 'Bollywood Punjabi Club Dance Hits', icon: '🔥', gradient: 'from-[#600C1F] to-[#1D1217]' },
    { name: 'Chill Acoustic', query: 'Acoustic Bollywood Indie Soft Hits', icon: '☕', gradient: 'from-[#2B0E17] to-[#121114]' },
    { name: 'Sufi & Soul', query: 'Sufi Rahat Nusrat Arijit Soul', icon: '✨', gradient: 'from-[#3A0612] to-[#141216]' },
    { name: 'Viral Global 50', query: 'Top Global Viral Pop Chart 2026', icon: '🌐', gradient: 'from-[#52091B] to-[#161318]' }
  ];

  // Load User profile name
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

  // Fetch Home feed
  useEffect(() => {
    let active = true;
    const q = category === 'All' ? 'Trending Indian Hits 2026' : `${category} Hits`;
    fetchSongsByQuery(q).then((res) => {
      if (active && res.length > 0) {
        setSongs(res);
        if (!currentTrack) {
          setQueue(res);
        }
      }
    });
    return () => {
      active = false;
    };
  }, [category, currentTrack, setQueue]);

  // Debounced search for Explore tab
  useEffect(() => {
    if (!searchQuery.trim()) {
      if (activeTab === 'explore' && exploreSongs.length === 0) {
        fetchSongsByQuery('Top New Music Releases 2026').then(setExploreSongs);
      }
      return;
    }

    const timer = setTimeout(() => {
      fetchSongsByQuery(searchQuery.trim()).then(setExploreSongs);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, exploreSongs.length]);

  // Fetch Radio on tab load
  useEffect(() => {
    if (activeTab === 'radio' && radioSongs.length === 0) {
      fetchSongsByQuery('Top Viral Radio Station Hits').then(setRadioSongs);
    }
  }, [activeTab, radioSongs.length]);

  const featuredSong = songs[0];

  const handleStationClick = async (query: string) => {
    const tracks = await fetchSongsByQuery(query);
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <div className="bg-[#070708] text-[#f4f0f2] min-h-screen">
      <div className="ambient" />

      <div className="shell">
        {/* DESKTOP SIDEBAR */}
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
            onClick={() => setActiveTab('explore')}
            className={`nav-btn ${activeTab === 'explore' ? 'active' : ''}`}
          >
            <Search className="w-4 h-4" />
            <span>Explore / Search</span>
          </button>
          <button
            onClick={() => setActiveTab('radio')}
            className={`nav-btn ${activeTab === 'radio' ? 'active' : ''}`}
          >
            <Radio className="w-4 h-4" />
            <span>Radio Stations</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`nav-btn ${activeTab === 'library' ? 'active' : ''}`}
          >
            <Music className="w-4 h-4" />
            <span>Library & Liked</span>
          </button>
          <button
            onClick={() => setActiveTab('galaxy')}
            className={`nav-btn ${activeTab === 'galaxy' ? 'active' : ''}`}
          >
            <Compass className="w-4 h-4" />
            <span>ASTRA Spatial AI</span>
          </button>

          {/* Creator Profile Dock */}
          <div onClick={() => setIsCreatorOpen(true)} className="side-bottom group">
            <div className="avatar">
              <img
                src="/creator.jpeg"
                alt="Rishabh Singh"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = '/creator.jpg';
                }}
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

        {/* MAIN VIEW AREA */}
        <main className="main">
          {/* Top Search & Astra Shortcut Header */}
          <header className="top">
            <div className="search">
              <Search className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search artists, tracks, or soundscapes..."
                value={searchQuery}
                onFocus={() => {
                  if (activeTab !== 'explore') setActiveTab('explore');
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'explore') setActiveTab('explore');
                }}
              />
            </div>
            <button onClick={() => setActiveTab('galaxy')} className="upgrade-btn">
              <Sparkles className="w-3.5 h-3.5 text-[#ff2447]" />
              <span>ASTRA 3D</span>
            </button>
          </header>

          {/* VIEW 1: HOME / DISCOVER */}
          {activeTab === 'home' && (
            <div className="p-2 md:p-4 max-w-6xl">
              {/* Category Filter Chips */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
                {homeChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setCategory(chip)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                      category === chip
                        ? 'bg-[#b20c2b] text-white shadow-[0_0_15px_rgba(255,36,71,0.4)]'
                        : 'bg-[#151416] text-[#878387] border border-white/5 hover:text-white'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* 3D Spatial Hero Stage */}
              {featuredSong && (
                <Hero3DVisualizer
                  song={featuredSong}
                  onOpenAstra={() => setActiveTab('galaxy')}
                />
              )}

              {/* MADE FOR YOU GRID */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold tracking-widest text-[#878387] uppercase flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#ff2447]" />
                    <span>Made For You</span>
                  </h3>
                  <span className="text-[11px] font-mono text-gray-500">Lossless 320K</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {songs.slice(1, 13).map((song) => (
                    <div
                      key={song.id}
                      onClick={() => playTrack(song, songs)}
                      className="card-noir group"
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#111114] relative">
                        <img
                          src={song.imageUrl}
                          alt={song.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <div className="w-10 h-10 rounded-full bg-[#ff2447] flex items-center justify-center text-white shadow-lg">
                            <Play className="w-4 h-4 fill-white stroke-none translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-white truncate group-hover:text-[#ff2447] transition">
                        {song.name}
                      </p>
                      <p className="text-[11px] text-[#878387] truncate mt-0.5">{song.primaryArtists}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENTLY PLAYED SECTION */}
              {recents.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-sm font-extrabold tracking-widest text-[#878387] uppercase mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#ff2447]" />
                    <span>Jump Back In</span>
                  </h3>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {recents.slice(0, 8).map((song) => (
                      <div
                        key={`recent-${song.id}`}
                        onClick={() => playTrack(song, recents)}
                        className="w-36 flex-shrink-0 card-noir cursor-pointer group"
                      >
                        <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#111114]">
                          <img
                            src={song.imageUrl}
                            alt={song.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <p className="text-xs font-bold text-white truncate">{song.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{song.primaryArtists}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: EXPLORE / SEARCH */}
          {activeTab === 'explore' && (
            <div className="p-2 md:p-4 max-w-6xl">
              <h2 className="text-xl font-black text-white mb-2 font-['Space_Grotesk']">
                Explore & Search Catalog
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                Browse through 50M+ Master Quality tracks powered by global CDN mirrors.
              </p>

              {/* Genre Pills */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setSearchQuery(g);
                      fetchSongsByQuery(`${g} Hits 2026`).then(setExploreSongs);
                    }}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#151416] border border-white/5 hover:border-[#ff2447] hover:text-white transition flex-shrink-0 cursor-pointer"
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {exploreSongs.map((song) => (
                  <div
                    key={`explore-${song.id}`}
                    onClick={() => playTrack(song, exploreSongs)}
                    className="card-noir group"
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#111114] relative">
                      <img
                        src={song.imageUrl}
                        alt={song.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Play className="w-6 h-6 fill-white stroke-none" />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-white truncate group-hover:text-[#ff2447] transition">
                      {song.name}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{song.primaryArtists}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: RADIO STATIONS */}
          {activeTab === 'radio' && (
            <div className="p-2 md:p-4 max-w-6xl">
              <h2 className="text-xl font-black text-white mb-2 font-['Space_Grotesk']">
                Viral Radio & Curated Frequencies
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                Infinite, non-repeating dynamic audio queues calibrated to your mood.
              </p>

              {/* Mood Stations Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {moodStations.map((station) => (
                  <div
                    key={station.name}
                    onClick={() => handleStationClick(station.query)}
                    className={`p-5 rounded-2xl bg-gradient-to-br ${station.gradient} border border-white/10 hover:border-[#ff2447]/60 transition cursor-pointer shadow-lg group hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{station.icon}</span>
                      <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-[#ff2447] flex items-center justify-center text-white transition">
                        <Play className="w-4 h-4 fill-current stroke-none translate-x-0.5" />
                      </div>
                    </div>
                    <h3 className="font-extrabold text-white text-base group-hover:text-[#ff2447] transition">
                      {station.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-1 font-mono">Continuous Auto-Flow</p>
                  </div>
                ))}
              </div>

              {/* Featured Radio Feed */}
              {radioSongs.length > 0 && (
                <div>
                  <h3 className="text-sm font-extrabold tracking-widest text-[#878387] uppercase mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#ff2447]" />
                    <span>Station Live Tracks</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {radioSongs.map((song) => (
                      <div
                        key={`radio-${song.id}`}
                        onClick={() => playTrack(song, radioSongs)}
                        className="card-noir group"
                      >
                        <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#111114]">
                          <img
                            src={song.imageUrl}
                            alt={song.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <p className="text-xs font-bold text-white truncate">{song.name}</p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{song.primaryArtists}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 4: LIBRARY & LIKED */}
          {activeTab === 'library' && (
            <div className="p-2 md:p-4 max-w-4xl">
              <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                <button
                  onClick={() => setLibrarySubTab('liked')}
                  className={`text-sm font-extrabold transition cursor-pointer pb-2 ${
                    librarySubTab === 'liked'
                      ? 'text-[#ff2447] border-b-2 border-[#ff2447]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Liked Songs ({likedSongs.length})
                </button>
                <button
                  onClick={() => setLibrarySubTab('recents')}
                  className={`text-sm font-extrabold transition cursor-pointer pb-2 ${
                    librarySubTab === 'recents'
                      ? 'text-[#ff2447] border-b-2 border-[#ff2447]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Recently Played ({recents.length})
                </button>
              </div>

              {librarySubTab === 'liked' ? (
                likedSongs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Heart className="w-12 h-12 text-gray-600 mb-3" />
                    <p className="text-base font-bold text-white">Your collection is empty</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">
                      Tap the heart icon anywhere on any song to curate your personal vault.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {likedSongs.map((song) => {
                      const isCurrent = currentTrack?.id === song.id;
                      return (
                        <div
                          key={`lib-liked-${song.id}`}
                          className={`flex items-center justify-between p-3 rounded-2xl transition ${
                            isCurrent
                              ? 'bg-[#181218] border border-[#ff2447]'
                              : 'noir-row'
                          }`}
                        >
                          <div
                            onClick={() => playTrack(song, likedSongs)}
                            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                          >
                            <img
                              src={song.imageUrl}
                              alt={song.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-bold truncate ${isCurrent ? 'text-[#ff2447]' : 'text-white'}`}>
                                {song.name}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate mt-0.5">{song.primaryArtists}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleLike(song)}
                              className="p-2 text-gray-400 hover:text-[#ff2447] transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => playTrack(song, likedSongs)}
                              className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#ff2447] flex items-center justify-center text-white transition"
                            >
                              {isCurrent && isPlaying ? (
                                <Pause className="w-4 h-4 fill-current stroke-none" />
                              ) : (
                                <Play className="w-4 h-4 fill-current stroke-none translate-x-0.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  {recents.map((song) => (
                    <div
                      key={`lib-recent-${song.id}`}
                      onClick={() => playTrack(song, recents)}
                      className="flex items-center justify-between p-3 rounded-2xl noir-row cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={song.imageUrl}
                          alt={song.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate group-hover:text-[#ff2447] transition">
                            {song.name}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">{song.primaryArtists}</p>
                        </div>
                      </div>
                      <Play className="w-4 h-4 text-gray-400 group-hover:text-white transition fill-current stroke-none" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 5: ASTRA SPATIAL 3D AI */}
          {activeTab === 'galaxy' && <AstraSphere3D />}
        </main>
      </div>

      {/* PERSISTENT FLOATING PLAYER DOCK */}
      <PlayerDock />

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#070708]/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around z-30 select-none">
        <button
          onClick={() => setActiveTab('home')}
          className={`text-[10px] font-bold flex flex-col items-center gap-1 ${
            activeTab === 'home' ? 'text-[#ff2447]' : 'text-gray-400'
          }`}
        >
          <HomeIcon className="w-4 h-4" /> Home
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`text-[10px] font-bold flex flex-col items-center gap-1 ${
            activeTab === 'explore' ? 'text-[#ff2447]' : 'text-gray-400'
          }`}
        >
          <Search className="w-4 h-4" /> Explore
        </button>
        <button
          onClick={() => setActiveTab('radio')}
          className={`text-[10px] font-bold flex flex-col items-center gap-1 ${
            activeTab === 'radio' ? 'text-[#ff2447]' : 'text-gray-400'
          }`}
        >
          <Radio className="w-4 h-4" /> Radio
        </button>
        <button
          onClick={() => setActiveTab('galaxy')}
          className={`text-[10px] font-bold flex flex-col items-center gap-1 ${
            activeTab === 'galaxy' ? 'text-[#ff2447]' : 'text-gray-400'
          }`}
        >
          <Compass className="w-4 h-4" /> ASTRA
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`text-[10px] font-bold flex flex-col items-center gap-1 ${
            activeTab === 'library' ? 'text-[#ff2447]' : 'text-gray-400'
          }`}
        >
          <Music className="w-4 h-4" /> Library
        </button>
        <button
          onClick={() => setIsCreatorOpen(true)}
          className="text-[10px] font-bold flex flex-col items-center gap-1 text-gray-400"
        >
          <div className="w-5 h-5 rounded-full overflow-hidden border border-[#ff2447]">
            <img
              src="/creator.jpeg"
              alt="Profile"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/creator.jpg';
              }}
            />
          </div>
          Creator
        </button>
      </nav>

      {/* MODALS */}
      <CreatorModal isOpen={isCreatorOpen} onClose={() => setIsCreatorOpen(false)} />
      <OnboardingModal onComplete={(name) => setUserName(name)} />
    </div>
  );
}
