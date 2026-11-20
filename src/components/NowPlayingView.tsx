'use client';
import React, { useState } from 'react';
import { ChevronDown, Heart, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  onClose: () => void;
}

export const NowPlayingView: React.FC<Props> = ({ onClose }) => {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrev, toggleLike, likedSongs, currentTime, duration, seek, volume, setVolume } = usePlayerStore();
  const [prevVol, setPrevVol] = useState(volume || 1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  if (!currentTrack) return null;

  const isLiked = likedSongs.some((s) => s.id === currentTrack.id);

  const format = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMute = () => {
    if (volume === 0) {
      setVolume(prevVol || 1);
    } else {
      setPrevVol(volume);
      setVolume(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040406] flex flex-col justify-between max-w-[430px] md:max-w-md mx-auto select-none overflow-hidden text-white perspective-[1200px]">
      {/* 3D Volumetric Red Fog Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-125 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${currentTrack.imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#040406]/60 to-[#040406] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-10 pb-2">
        <button onClick={onClose} className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white transition cursor-pointer">
          <ChevronDown className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-widest text-[#EF4444] uppercase">SPATIAL LOSSLESS 3D</p>
          <p className="text-xs font-bold text-white truncate max-w-[180px]">{currentTrack.album || 'RhythmX Master'}</p>
        </div>
        <button onClick={() => toggleLike(currentTrack)} className="p-2 rounded-full bg-white/5 border border-white/10 transition cursor-pointer">
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#EF4444] text-[#EF4444]' : 'text-gray-300'}`} />
        </button>
      </div>

      {/* 3D Floating Stage with Tilted Vinyl Turntable */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto px-6 py-4">
        <div
          style={{ transform: 'rotateX(20deg) rotateZ(-6deg)' }}
          className="relative w-64 h-64 rounded-full p-2.5 bg-gradient-to-tr from-white/10 via-zinc-800 to-white/5 border-2 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(239,68,68,0.35)] transition-transform duration-500"
        >
          <img
            src={currentTrack.imageUrl}
            alt={currentTrack.name}
            className={`w-full h-full rounded-full object-cover shadow-2xl ${isPlaying ? 'animate-[spin_20s_linear_infinite]' : ''}`}
          />
          <div className="absolute inset-0 rounded-full border-4 border-black/50 pointer-events-none" />
          <div className="absolute w-10 h-10 rounded-full bg-[#040406] border-2 border-[#EF4444]/60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-inner pointer-events-none" />
        </div>
      </div>

      {/* 3D Glass Transport Deck */}
      <div className="relative z-10 mx-4 mb-6 bg-[#121217]/95 backdrop-blur-2xl border border-[#EF4444]/25 rounded-3xl p-5 shadow-[0_20px_45px_rgba(0,0,0,0.9)]">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1 pr-3">
            <span className="text-[9px] font-bold tracking-wider text-[#EF4444] bg-[#EF4444]/15 px-2.5 py-0.5 rounded-full uppercase inline-block">
              320 KBPS ATMOSPHERIC
            </span>
            <h2 className="text-white font-extrabold text-base truncate mt-2">{currentTrack.name}</h2>
            <p className="text-gray-400 text-xs truncate mt-0.5">{currentTrack.primaryArtists}</p>
          </div>
        </div>

        {/* Scrubber */}
        <div className="mt-4">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#EF4444]"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1.5">
            <span>{format(currentTime)}</span>
            <span>{format(duration)}</span>
          </div>
        </div>

        {/* Transport Actions */}
        <div className="flex items-center justify-between mt-3 px-2">
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`transition cursor-pointer ${isShuffled ? 'text-[#EF4444]' : 'text-gray-400 hover:text-white'}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={playPrev} className="text-white hover:scale-110 active:scale-95 transition cursor-pointer">
            <SkipBack className="w-6 h-6 fill-white" />
          </button>
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-[#EF4444] to-rose-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-[0_0_20px_rgba(239,68,68,0.5)] cursor-pointer"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white translate-x-0.5" />}
          </button>
          <button onClick={playNext} className="text-white hover:scale-110 active:scale-95 transition cursor-pointer">
            <SkipForward className="w-6 h-6 fill-white" />
          </button>
          <button
            onClick={() => setIsRepeating(!isRepeating)}
            className={`transition cursor-pointer ${isRepeating ? 'text-[#EF4444]' : 'text-gray-400 hover:text-white'}`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Hardware Volume Slider */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/10 px-1">
          <button onClick={handleMute} className="text-gray-400 hover:text-white transition cursor-pointer">
            {volume === 0 ? <VolumeX className="w-4 h-4 text-[#EF4444]" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#EF4444]"
          />
          <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
