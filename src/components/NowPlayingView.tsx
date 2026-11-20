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
    <div className="fixed inset-0 z-50 bg-[#08080B] flex flex-col justify-between max-w-[430px] md:max-w-md mx-auto select-none overflow-hidden">
      {/* VIVID AMBIENT COVER BLUR */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 blur-2xl scale-125 transition-all duration-700 pointer-events-none"
        style={{ backgroundImage: `url(${currentTrack.imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-[#08080B] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-10 pb-2">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-95 transition">
          <ChevronDown className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-widest text-[#CCFF00] uppercase">PLAYING FROM FEED</p>
          <p className="text-xs font-semibold text-white/90 truncate max-w-[180px]">{currentTrack.album || 'RhythmX'}</p>
        </div>
        <button onClick={() => toggleLike(currentTrack)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white transition">
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>
      </div>

      {/* Center Rotating Vinyl Disc Visual */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto px-6">
        <div className="relative w-64 h-64 rounded-full p-2 bg-gradient-to-tr from-white/20 via-transparent to-white/10 border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
          <img
            src={currentTrack.imageUrl}
            alt={currentTrack.name}
            className={`w-full h-full rounded-full object-cover shadow-2xl ${isPlaying ? 'animate-[spin_20s_linear_infinite]' : ''}`}
            onError={(e) => {
              e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
            }}
          />
          <div className="absolute inset-0 rounded-full border-4 border-black/40 pointer-events-none" />
          <div className="absolute w-8 h-8 rounded-full bg-black/90 border border-white/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Floating Control Deck */}
      <div className="relative z-10 mx-4 mb-6 bg-[#121217]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1 pr-3">
            <span className="text-[9px] font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded-full uppercase">
              LOSSLESS 320 KBPS
            </span>
            <h2 className="text-white font-extrabold text-base truncate mt-1.5">{currentTrack.name}</h2>
            <p className="text-gray-400 text-xs truncate mt-0.5">{currentTrack.primaryArtists}</p>
          </div>
          <button onClick={() => toggleLike(currentTrack)} className="p-2">
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Progress Scrubber */}
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
            <span>{format(currentTime)}</span>
            <span>{format(duration)}</span>
          </div>
        </div>

        {/* Transport Actions */}
        <div className="flex items-center justify-between mt-3 px-2">
          <button className="text-gray-400 hover:text-white"><Shuffle className="w-4 h-4" /></button>
          <button onClick={playPrev} className="text-white hover:scale-110 active:scale-95 transition"><SkipBack className="w-6 h-6 fill-white" /></button>
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-xl"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black translate-x-0.5" />}
          </button>
          <button onClick={playNext} className="text-white hover:scale-110 active:scale-95 transition"><SkipForward className="w-6 h-6 fill-white" /></button>
          <button className="text-gray-400 hover:text-white"><Repeat className="w-4 h-4" /></button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/10 px-1">
          <button onClick={handleMute} className="text-gray-400 hover:text-white">
            {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]"
          />
          <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingView;
