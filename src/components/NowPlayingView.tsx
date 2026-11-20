'use client';
import React, { useState } from 'react';
import { ChevronDown, Heart, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX } from 'lucide-react';
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
    setVolume
  } = usePlayerStore();
  const [prevVol, setPrevVol] = useState(volume || 1);

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
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col justify-between max-w-[430px] mx-auto select-none overflow-hidden">
      {/* Philomela Backdrop: Heavy radial vignette over album art */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl opacity-35 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${currentTrack.imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/50 to-[#050505] pointer-events-none" />

      {/* Philomela Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-10 pb-3">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition"
        >
          <ChevronDown className="w-5 h-5 text-zinc-300" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">NOW PLAYING</p>
          <p className="text-xs font-semibold text-white/90 truncate max-w-[190px] mt-0.5">
            {currentTrack.album || 'Philomela Master'}
          </p>
        </div>
        <button
          onClick={() => toggleLike(currentTrack)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition active:scale-95"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#E11D48] text-[#E11D48]' : 'text-zinc-300'}`} />
        </button>
      </div>

      {/* Philomela Center Stage: Square Album Art Showcase */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto px-6">
        <div className="w-64 h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.95)] bg-[#0D0D11] relative">
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

      {/* Philomela Bottom Deck: Metadata, Progress & Transport */}
      <div className="relative z-10 mx-4 mb-6 bg-[#0D0D11]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1 pr-3">
            <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-400 uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded inline-block">
              320 KBPS LOSSLESS
            </span>
            <h2 className="text-white font-extrabold text-base truncate mt-2">{currentTrack.name}</h2>
            <p className="text-zinc-400 text-xs truncate mt-0.5">{currentTrack.primaryArtists}</p>
          </div>
          <button onClick={() => toggleLike(currentTrack)} className="p-2 active:scale-90 transition">
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#E11D48] text-[#E11D48]' : 'text-zinc-400 hover:text-white'}`} />
          </button>
        </div>

        {/* 2px Hairline Progress Scrubber with Mono Timestamps */}
        <div className="mt-5">
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-[2px] bg-white/15 rounded-full appearance-none cursor-pointer accent-white"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1.5">
            <span>{format(currentTime)}</span>
            <span>{format(duration)}</span>
          </div>
        </div>

        {/* Philomela Transport Deck */}
        <div className="flex items-center justify-between mt-4 px-2">
          <button className="text-zinc-500 hover:text-white transition active:scale-90">
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={playPrev}
            className="text-zinc-300 hover:text-white active:scale-95 transition"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-2xl"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black stroke-black" />
            ) : (
              <Play className="w-5 h-5 fill-black stroke-black translate-x-0.5" />
            )}
          </button>
          <button
            onClick={playNext}
            className="text-zinc-300 hover:text-white active:scale-95 transition"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button className="text-zinc-500 hover:text-white transition active:scale-90">
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Philomela Integrated Volume Bar */}
        <div className="flex items-center gap-3 mt-5 pt-3 border-t border-white/5 px-1">
          <button onClick={handleMute} className="text-zinc-400 hover:text-white transition">
            {volume === 0 ? <VolumeX className="w-4 h-4 text-[#E11D48]" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-[2px] bg-white/15 rounded-full appearance-none cursor-pointer accent-white"
          />
          <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingView;
