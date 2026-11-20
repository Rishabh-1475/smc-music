'use client';
import React, { useState } from 'react';
import { ChevronDown, Heart, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, VolumeX, MoreHorizontal } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  onClose: () => void;
}

export const NowPlayingView: React.FC<Props> = ({ onClose }) => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    toggleLike,
    likedSongs,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    repeatMode,
    cycleRepeatMode,
    isShuffle,
    toggleShuffle
  } = usePlayerStore();

  const [prevVol, setPrevVol] = useState(volume || 1);

  if (!currentTrack) return null;

  const isLiked = likedSongs.some((s) => s.id === currentTrack.id);

  const format = (sec: number) => {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const remaining = (dur: number, cur: number) => {
    if (!Number.isFinite(dur) || dur <= 0) return '-0:00';
    const rem = Math.max(0, dur - cur);
    return `-${format(rem)}`;
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
    <div className="fixed inset-0 z-50 bg-[#070709] flex flex-col justify-between max-w-[430px] md:max-w-md mx-auto select-none overflow-hidden text-white">
      {/* Blurred Cover Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35 blur-3xl scale-125 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${currentTrack.imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070709]/60 via-[#070709]/90 to-[#070709] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-10 pb-2">
        <button onClick={onClose} className="p-2 text-[#94A3B8] hover:text-white transition active:scale-90 cursor-pointer">
          <ChevronDown className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase font-mono">PLAYING FROM ALBUM</p>
          <p className="text-xs font-bold text-white truncate max-w-[200px] mt-0.5">{currentTrack.album || 'RhythmX Lossless'}</p>
        </div>
        <button className="p-2 text-[#94A3B8] hover:text-white transition active:scale-90 cursor-pointer">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 1:1 Sharp Square Artwork (w-72 h-72) */}
      <div className="relative z-10 flex flex-col items-center justify-center px-8 my-auto">
        <div className="w-72 h-72 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/10 bg-[#121217]">
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
            <h2 className="text-xl font-bold text-white truncate tracking-tight">{currentTrack.name}</h2>
            <p className="text-[#94A3B8] text-sm truncate mt-1">{currentTrack.primaryArtists}</p>
          </div>
          <button onClick={() => toggleLike(currentTrack)} className="p-2 active:scale-90 transition cursor-pointer">
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-[#E11D48] text-[#E11D48]' : 'text-[#94A3B8] hover:text-white'}`} />
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
            className="w-full h-1 bg-[#262633] rounded-lg appearance-none cursor-pointer accent-[#E11D48]"
          />
          <div className="flex justify-between text-[11px] text-[#94A3B8] font-mono mt-1.5">
            <span>{format(currentTime)}</span>
            <span>{remaining(duration, currentTime)}</span>
          </div>
        </div>

        {/* Transport Actions */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition active:scale-90 cursor-pointer ${isShuffle ? 'text-[#E11D48]' : 'text-[#94A3B8] hover:text-white'}`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>
          <button
            onClick={playPrev}
            className="p-2 text-[#94A3B8] hover:text-white active:scale-90 transition cursor-pointer"
            title="Previous"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-2xl cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black stroke-black" />
            ) : (
              <Play className="w-7 h-7 fill-black stroke-black translate-x-0.5" />
            )}
          </button>
          <button
            onClick={playNext}
            className="p-2 text-[#94A3B8] hover:text-white active:scale-90 transition cursor-pointer"
            title="Next"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>
          <button
            onClick={cycleRepeatMode}
            className={`p-2 transition active:scale-90 cursor-pointer ${repeatMode !== 'off' ? 'text-[#E11D48]' : 'text-[#94A3B8] hover:text-white'}`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume Slider Bar */}
        <div className="flex items-center gap-3 mt-6 pt-2">
          <button onClick={handleMute} className="text-[#94A3B8] hover:text-white transition cursor-pointer">
            {volume === 0 ? <VolumeX className="w-4 h-4 text-[#E11D48]" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#262633] rounded-lg appearance-none cursor-pointer accent-[#E11D48]"
          />
          <span className="text-[10px] font-mono text-[#94A3B8] w-8 text-right">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingView;
