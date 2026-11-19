'use client';
import React from 'react';
import { ChevronDown, Bookmark, Heart, Play, Pause, SkipBack, SkipForward, Shuffle } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  onClose: () => void;
}

export const NowPlayingView: React.FC<Props> = ({ onClose }) => {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrev, toggleLike, likedSongs, currentTime, duration, seek } = usePlayerStore();

  if (!currentTrack) return null;

  const isLiked = likedSongs?.some((s) => s.id === currentTrack.id);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#08080A] flex flex-col justify-between max-w-[430px] mx-auto overflow-hidden">
      {/* DYNAMIC AMBIENT BACKDROP: Uses current track artwork with high blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-125 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${currentTrack.imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#08080A] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-10 pb-4">
        <button onClick={onClose} className="p-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition cursor-pointer">
          <ChevronDown className="w-5 h-5" />
        </button>
        <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">Now Playing</span>
        <button className="p-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition cursor-pointer">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      {/* Center Artwork Disc */}
      <div className="relative z-10 flex flex-col items-center justify-center px-8 my-auto">
        <div className="w-64 h-64 rounded-full p-2 bg-gradient-to-b from-white/15 to-white/5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-neutral-900">
          <img 
            src={currentTrack.imageUrl} 
            alt={currentTrack.name} 
            className={`w-full h-full rounded-full object-cover shadow-inner ${isPlaying ? 'animate-[spin_20s_linear_infinite]' : ''}`} 
          />
        </div>
      </div>

      {/* Floating Card Deck for Controls */}
      <div className="relative z-10 mx-4 mb-8 bg-[#121217]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold tracking-wider text-[#CCFF00] uppercase">Lossless Master • 320kbps</span>
        </div>

        <h2 className="text-white font-extrabold text-lg truncate mt-1">{currentTrack.name}</h2>
        <p className="text-gray-400 text-xs truncate mt-0.5">{currentTrack.primaryArtists}</p>

        {/* Scrubber */}
        <div className="mt-4">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Transport Actions */}
        <div className="flex items-center justify-between mt-3 px-2">
          <button onClick={() => toggleLike(currentTrack)} className="text-gray-400 hover:text-white transition cursor-pointer">
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <button onClick={playPrev} className="text-white hover:scale-110 transition cursor-pointer">
            <SkipBack className="w-5 h-5 fill-white" />
          </button>
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg cursor-pointer"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black translate-x-0.5" />}
          </button>
          <button onClick={playNext} className="text-white hover:scale-110 transition cursor-pointer">
            <SkipForward className="w-5 h-5 fill-white" />
          </button>
          <button className="text-gray-400 hover:text-white transition cursor-pointer">
            <Shuffle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingView;
