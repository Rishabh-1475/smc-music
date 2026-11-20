'use client';
import React, { useState } from 'react';
import { ChevronDown, Heart, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Share2, MoreHorizontal } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col justify-between max-w-[430px] md:max-w-md mx-auto select-none overflow-hidden text-white">
      {/* Background Gradient derived from Artwork */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-125 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${currentTrack.imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/70 via-[#121212]/90 to-[#121212] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-10 pb-2">
        <button onClick={onClose} className="p-2 text-[#B3B3B3] hover:text-white transition">
          <ChevronDown className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-widest text-[#B3B3B3] uppercase">PLAYING FROM PLAYLIST</p>
          <p className="text-xs font-bold text-white truncate max-w-[180px]">{currentTrack.album || 'RhythmX Lossless'}</p>
        </div>
        <button className="p-2 text-[#B3B3B3] hover:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 1:1 Large Square Artwork (Carlos Han Concept Spec) */}
      <div className="relative z-10 flex flex-col items-center justify-center px-8 my-auto">
        <div className="w-72 h-72 rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 bg-[#181818]">
          <img
            src={currentTrack.imageUrl}
            alt={currentTrack.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
            }}
          />
        </div>
      </div>

      {/* Controls Deck */}
      <div className="relative z-10 px-8 pb-10 flex flex-col">
        {/* Title & Heart Row */}
        <div className="flex justify-between items-center mb-6">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="text-xl font-bold text-white truncate">{currentTrack.name}</h2>
            <p className="text-[#B3B3B3] text-sm truncate mt-1">{currentTrack.primaryArtists}</p>
          </div>
          <button onClick={() => toggleLike(currentTrack)} className="p-2">
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-[#1DB954] text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`} />
          </button>
        </div>

        {/* Scrubber Progress Bar */}
        <div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 bg-[#4D4D4D] rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
          />
          <div className="flex justify-between text-[11px] text-[#B3B3B3] font-mono mt-1.5">
            <span>{format(currentTime)}</span>
            <span>{format(duration)}</span>
          </div>
        </div>

        {/* Transport Actions */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`transition ${isShuffled ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`}
          >
            <Shuffle className="w-5 h-5" />
          </button>
          <button onClick={playPrev} className="text-[#B3B3B3] hover:text-white active:scale-90 transition">
            <SkipBack className="w-7 h-7 fill-current" />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-2xl"
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-black stroke-black" /> : <Play className="w-7 h-7 fill-black stroke-black translate-x-0.5" />}
          </button>
          <button onClick={playNext} className="text-[#B3B3B3] hover:text-white active:scale-90 transition">
            <SkipForward className="w-7 h-7 fill-current" />
          </button>
          <button
            onClick={() => setIsRepeating(!isRepeating)}
            className={`transition ${isRepeating ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`}
          >
            <Repeat className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Slider Bar */}
        <div className="flex items-center gap-3 mt-6 pt-2">
          <button onClick={handleMute} className="text-[#B3B3B3] hover:text-white">
            {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#4D4D4D] rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
          />
          <span className="text-[10px] font-mono text-[#B3B3B3] w-8 text-right">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingView;
