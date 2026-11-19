'use client';
import React, { useState, useEffect } from 'react';
import { Search, Heart, Play, Pause, User, Home as HomeIcon, Disc3, Library as LibraryIcon, Sparkles } from 'lucide-react';
import { OnboardingModal } from '@/components/OnboardingModal';
import { NowPlayingView } from '@/components/NowPlayingView';
import { GalaxyVisualizer } from '@/components/GalaxyVisualizer';
import { LibraryView } from '@/components/LibraryView';
import { fetchSongsByQuery, Song, BACKUP_SONGS } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

export default function Home() {
  const [userName, setUserName] = useState('Rishabh');
  const [activeTab, setActiveTab] = useState<'home' | 'galaxy' | 'library' | 'profile'>('home');
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>(BACKUP_SONGS);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { currentTrack, isPlaying, togglePlay, playTrack, setQueue } = usePlayerStore();

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
    let mounted = true;
    setLoading(true);

    const activeQuery = searchQuery.trim()
      ? searchQuery.trim()
      : (categoryQueries[category] || 'Bollywood Trending Hits');

    fetchSongsByQuery(activeQuery).then((res) => {
      if (mounted) {
        const list = res.length > 0 ? res : BACKUP_SONGS;
        setSongs(list);
        setQueue(list);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) {
        setSongs(BACKUP_SONGS);
        setQueue(BACKUP_SONGS);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [category, searchQuery, setQueue]);

  const featuredSong = songs[0] || BACKUP_SONGS[0];

  return (
    <main className="min-h-screen bg-[#070709] text-white flex justify-center selection:bg-[#CCFF00] selection:text-black">
      <OnboardingModal onComplete={(name) => setUserName(name)} />

      {/* DUAL CONTAINER: Responsive full width on desktop, compact native mobile frame on phone */}
      <div className="w-full max-w-md md:max-w-4xl min-h-screen bg-[#0A0A0D] border-x border-white/5 relative flex flex-col pb-36">
        
        {/* Header */}
        <header className="px-5 pt-8 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-[#CCFF00] to-purple-600">
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
              <p className="text-[11px] text-gray-400">Ready to explore lossless sound</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('library')}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-[#CCFF00] hover:bg-white/10 transition"
              title="Liked Songs"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-[#CCFF00] hover:bg-white/10 transition"
              title="Profile"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Global Search Bar */}
        <div className="px-5 py-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 50+ songs, artists, albums..."
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

        {/* Home Tab Feed */}
        {activeTab === 'home' && (
          <div className="flex-1">
            {/* Category Filter Chips */}
            <div className="px-5 py-2 flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSearchQuery('');
                    setCategory(c);
                  }}
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

            {/* Curated & Trending Hero Banner */}
            {!searchQuery && (
              <div className="px-5 py-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Curated &amp; trending</p>
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4A154B] via-[#210D3D] to-[#0A0A0D] border border-white/10 p-5 flex items-center justify-between shadow-2xl">
                  <div className="flex-1 pr-3">
                    <span className="text-[9px] font-bold text-purple-200 bg-white/10 px-2 py-0.5 rounded-full uppercase">
                      Discover Weekly
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-2 line-clamp-1">{featuredSong.name}</h3>
                    <p className="text-[11px] text-gray-300 line-clamp-1 mt-0.5">By {featuredSong.primaryArtists}</p>
                    <button
                      onClick={() => playTrack(featuredSong)}
                      className="mt-3 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg"
                    >
                      <Play className="w-5 h-5 fill-black translate-x-0.5" />
                    </button>
                  </div>
                  <img
                    src={featuredSong.imageUrl}
                    alt={featuredSong.name}
                    className="w-24 h-24 rounded-2xl object-cover border border-white/10 shadow-2xl flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = BACKUP_SONGS[0].imageUrl;
                    }}
                  />
                </div>
              </div>
            )}

            {/* Top Daily Playlists / Feed */}
            <div className="px-5 py-3">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  {searchQuery ? `Results for "${searchQuery}"` : (category === 'All' ? 'Top daily playlists' : `${category} Feed`)}
                </h2>
                <span className="text-xs text-[#CCFF00]">{songs.length} Tracks</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-40 text-gray-500 text-xs font-mono">
                  STREAMING LOSSLESS CATALOG...
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
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
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = BACKUP_SONGS[0].imageUrl;
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

        {/* Music Galaxy Tab */}
        {activeTab === 'galaxy' && <GalaxyVisualizer songs={songs} />}

        {/* Library Tab */}
        {activeTab === 'library' && <LibraryView />}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="p-6 flex flex-col items-center">
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
                <p className="text-[10px] text-gray-400">Audio Fidelity</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-lg font-extrabold text-white">Lossless</p>
                <p className="text-[10px] text-gray-400">Stream Engine</p>
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

        {/* Floating MiniPlayer Dock */}
        {currentTrack && (
          <div
            onClick={() => setIsPlayerOpen(true)}
            className="fixed bottom-[68px] left-3 right-3 max-w-[406px] md:max-w-2xl mx-auto z-40 bg-[#141418]/95 backdrop-blur-xl border border-white/15 rounded-2xl px-3 py-2 flex items-center justify-between shadow-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img
                src={currentTrack.imageUrl}
                alt={currentTrack.name}
                className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = BACKUP_SONGS[0].imageUrl;
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentTrack.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{currentTrack.primaryArtists}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-8 h-8 rounded-full bg-[#CCFF00] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black translate-x-0.5" />
              )}
            </button>
          </div>
        )}

        {/* Bottom Floating Navigation Dock */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md md:max-w-4xl mx-auto h-16 bg-[#0A0A0D]/95 backdrop-blur-lg border-t border-white/10 flex items-center justify-around z-30 px-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'home' ? 'text-[#CCFF00]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('galaxy')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'galaxy' ? 'text-[#CCFF00]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Disc3 className={`w-5 h-5 ${activeTab === 'galaxy' ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-medium">Galaxy</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'library' ? 'text-[#CCFF00]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LibraryIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Library</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'profile' ? 'text-[#CCFF00]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </nav>

        {/* Full-Screen Now Playing View Modal */}
        {isPlayerOpen && <NowPlayingView onClose={() => setIsPlayerOpen(false)} />}
      </div>
    </main>
  );
}
