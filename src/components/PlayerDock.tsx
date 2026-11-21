'use client';
import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  ListMusic,
  Maximize2,
  ChevronDown,
  X,
  Music2
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

export const PlayerDock: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    queue,
    currentTime,
    duration,
    volume,
    likedSongs,
    isShuffle,
    isRepeat,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    toggleLike,
    playTrack,
    toggleShuffle,
    toggleRepeat
  } = usePlayerStore();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume || 1);

  if (!currentTrack) return null;

  const isLiked = likedSongs.some((s) => s.id === currentTrack.id);

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMuteToggle = () => {
    if (volume === 0) {
      setVolume(prevVolume || 1);
    } else {
      setPrevVolume(volume);
      setVolume(0);
    }
  };

  return (
    <>
      {/* FLOATING MINI DOCK */}
      <div className="player-dock glass select-none">
        {/* Left: Track Details */}
        <div
          onClick={() => setIsFullPlayerOpen(true)}
          className="flex items-center gap-3 min-w-0 max-w-[240px] md:max-w-xs cursor-pointer group"
        >
          <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-md">
            <img
              src={currentTrack.imageUrl}
              alt={currentTrack.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate group-hover:text-[#FF2348] transition">
              {currentTrack.name}
            </p>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">
              {currentTrack.primaryArtists}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(currentTrack);
            }}
            className="p-1.5 text-gray-400 hover:text-[#FF2348] transition hidden sm:block"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#FF2348] text-[#FF2348]' : ''}`} />
          </button>
        </div>

        {/* Center: Controls & Scrubber */}
        <div className="flex-1 max-w-xl px-2 md:px-6 flex flex-col items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-full transition hidden sm:block ${
                isShuffle ? 'text-[#FF2348]' : 'text-gray-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={playPrev}
              className="text-gray-300 hover:text-white transition active:scale-95"
              title="Previous"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-r from-[#B50925] to-[#FF2348] flex items-center justify-center text-white crimson-glow transition hover:scale-105 active:scale-95 shadow-lg flex-shrink-0 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white stroke-none" />
              ) : (
                <Play className="w-5 h-5 fill-white stroke-none translate-x-0.5" />
              )}
            </button>
            <button
              onClick={playNext}
              className="text-gray-300 hover:text-white transition active:scale-95"
              title="Next"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-full transition hidden sm:block ${
                isRepeat ? 'text-[#FF2348]' : 'text-gray-400 hover:text-white'
              }`}
              title="Repeat"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Scrubber Bar */}
          <div className="w-full flex items-center gap-2 mt-1.5 hidden md:flex">
            <span className="text-[10px] text-gray-400 font-mono w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-gray-400 font-mono w-8 text-left">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume & Utilities */}
        <div className="flex items-center gap-3">
          <div className="items-center gap-2 hidden lg:flex">
            <button onClick={handleMuteToggle} className="text-gray-400 hover:text-white transition">
              {volume === 0 ? <VolumeX className="w-4 h-4 text-[#FF2348]" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isQueueOpen ? 'bg-[#FF2348] text-white shadow-[0_0_15px_rgba(255,35,72,0.5)]' : 'bg-white/5 text-gray-300 hover:text-white'
            }`}
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullPlayerOpen(true)}
            className="p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white transition cursor-pointer"
            title="Expand Full Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SLIDE-OVER QUEUE PANEL */}
      {isQueueOpen && (
        <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-[#111114]/98 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)] z-50 flex flex-col select-none">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-[#FF2348]" />
              <h3 className="font-bold text-white text-sm">Up Next Queue</h3>
              <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                {queue.length}
              </span>
            </div>
            <button
              onClick={() => setIsQueueOpen(false)}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <p className="text-[10px] font-mono uppercase text-gray-400 px-2 tracking-wider">Now Playing</p>
            <div className="p-2.5 rounded-xl bg-[#181218] border border-[#FF2348]/40 flex items-center gap-3">
              <img
                src={currentTrack.imageUrl}
                alt={currentTrack.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#FF2348] truncate">{currentTrack.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{currentTrack.primaryArtists}</p>
              </div>
            </div>

            <p className="text-[10px] font-mono uppercase text-gray-400 px-2 pt-3 tracking-wider">Upcoming Tracks</p>
            {queue
              .filter((s) => s.id !== currentTrack.id)
              .map((song, i) => (
                <div
                  key={`${song.id}-${i}`}
                  onClick={() => playTrack(song, queue)}
                  className="p-2 rounded-xl noir-row flex items-center gap-3 cursor-pointer group hover:border-[#FF2348]/40"
                >
                  <img
                    src={song.imageUrl}
                    alt={song.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate group-hover:text-[#FF2348] transition">
                      {song.name}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">{song.primaryArtists}</p>
                  </div>
                  <Play className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition flex-shrink-0 fill-current" />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* FULL PLAYER SHEET */}
      {isFullPlayerOpen && (
        <div className="fixed inset-0 z-50 bg-[#040406] flex flex-col justify-between max-w-md md:max-w-lg mx-auto select-none overflow-hidden text-white shadow-2xl md:border-x md:border-white/10">
          {/* Volumetric Red Fog Backdrop */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-125 pointer-events-none transition-all duration-700"
            style={{ backgroundImage: `url(${currentTrack.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#040406]/70 to-[#040406] pointer-events-none" />

          {/* Sheet Header */}
          <div className="relative z-10 flex items-center justify-between px-6 pt-10 pb-2">
            <button
              onClick={() => setIsFullPlayerOpen(false)}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white transition cursor-pointer"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="text-[10px] font-mono font-bold tracking-widest text-[#FF2348] uppercase">
                SPATIAL LOSSLESS 3D
              </p>
              <p className="text-xs font-bold text-white truncate max-w-[180px] font-['Space_Grotesk']">
                {currentTrack.album || 'RhythmX Master'}
              </p>
            </div>
            <button
              onClick={() => toggleLike(currentTrack)}
              className="p-2 rounded-full bg-white/5 border border-white/10 transition cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#FF2348] text-[#FF2348]' : 'text-gray-300'}`} />
            </button>
          </div>

          {/* 3D Floating Vinyl Disc */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto px-6 py-6">
            <div
              style={{
                transform: 'rotateX(18deg) rotateY(-6deg)',
                transformStyle: 'preserve-3d'
              }}
              className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2.5 bg-gradient-to-tr from-white/10 via-zinc-800 to-white/5 border-2 border-[#FF2348]/40 shadow-[0_35px_70px_rgba(0,0,0,0.95),0_0_50px_rgba(255,35,72,0.4)] transition-transform duration-700 hover:rotate-x-0"
            >
              <img
                src={currentTrack.imageUrl}
                alt={currentTrack.name}
                referrerPolicy="no-referrer"
                className={`w-full h-full rounded-full object-cover shadow-2xl ${
                  isPlaying ? 'animate-spin-slow' : ''
                }`}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                }}
              />
              {/* Concentric Vinyl Grooves */}
              <div className="absolute inset-3 rounded-full border border-black/40 pointer-events-none" />
              <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute w-12 h-12 rounded-full bg-[#040406] border-2 border-[#FF2348] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-inner pointer-events-none" />
            </div>
          </div>

          {/* Glass Transport Deck */}
          <div className="relative z-10 mx-4 mb-6 bg-[#121217]/95 backdrop-blur-2xl border border-[#FF2348]/25 rounded-3xl p-5 shadow-[0_20px_45px_rgba(0,0,0,0.9)]">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1 pr-3">
                <span className="text-[9px] font-mono font-bold tracking-wider text-[#FF2348] bg-[#FF2348]/15 px-2.5 py-0.5 rounded-full uppercase inline-block">
                  320 KBPS ATMOSPHERIC
                </span>
                <h2 className="text-white font-extrabold text-base truncate mt-2 font-['Space_Grotesk']">
                  {currentTrack.name}
                </h2>
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
                className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Transport Actions */}
            <div className="flex items-center justify-between mt-3 px-2">
              <button
                onClick={toggleShuffle}
                className={`transition cursor-pointer ${isShuffle ? 'text-[#FF2348]' : 'text-gray-400 hover:text-white'}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button onClick={playPrev} className="text-white hover:scale-110 active:scale-95 transition cursor-pointer">
                <SkipBack className="w-6 h-6 fill-white" />
              </button>
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-[#B50925] to-[#FF2348] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-[0_0_25px_rgba(255,35,72,0.5)] cursor-pointer"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-white stroke-none" /> : <Play className="w-6 h-6 fill-white stroke-none translate-x-0.5" />}
              </button>
              <button onClick={playNext} className="text-white hover:scale-110 active:scale-95 transition cursor-pointer">
                <SkipForward className="w-6 h-6 fill-white" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`transition cursor-pointer ${isRepeat ? 'text-[#FF2348]' : 'text-gray-400 hover:text-white'}`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/10 px-1">
              <button onClick={handleMuteToggle} className="text-gray-400 hover:text-white transition cursor-pointer">
                {volume === 0 ? <VolumeX className="w-4 h-4 text-[#FF2348]" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] font-mono text-gray-400 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
