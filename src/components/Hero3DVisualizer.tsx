'use client';
import React from 'react';
import { Play, Pause, Heart, Sparkles } from 'lucide-react';
import { Song } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  song: Song;
}

export const Hero3DVisualizer: React.FC<Props> = ({ song }) => {
  const { playTrack, togglePlay, currentTrack, isPlaying, toggleLike, likedSongs } = usePlayerStore();
  const isCurrent = currentTrack?.id === song.id;
  const isLiked = likedSongs.some((s) => s.id === song.id);

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) togglePlay();
    else playTrack(song);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden noir-panel border border-[#B50925]/30 p-6 md:p-8 mb-8">
      {/* Background Artist Ambient Flare */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 blur-3xl scale-125 pointer-events-none"
        style={{ backgroundImage: `url(${song.imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080809] via-[#080809]/80 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1 max-w-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] font-mono font-extrabold text-[#FF2348] bg-[#B50925]/20 border border-[#B50925]/50 px-2.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2348] animate-ping" />
              FEATURED ARTIST RELEASE
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {song.name}
          </h1>
          <p className="text-sm md:text-base text-gray-300 font-medium mt-1">
            {song.primaryArtists}
          </p>
          <p className="text-xs text-gray-400 mt-2 font-mono">
            Lossless Master Quality • 320 KBPS AAC • Spatial Staging
          </p>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleAction}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#B50925] to-[#FF2348] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2.5 crimson-glow hover:scale-105 active:scale-95 transition"
            >
              {isCurrent && isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>PAUSE STREAM</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white translate-x-0.5" />
                  <span>STREAM MASTER</span>
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(song);
              }}
              className="w-11 h-11 rounded-full bg-[#151518] border border-white/10 flex items-center justify-center text-white hover:border-[#FF2348] transition"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#FF2348] text-[#FF2348]' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>

        {/* 3D Suspended Vinyl Album Card */}
        <div className="relative flex-shrink-0 group">
          <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden border-2 border-white/15 shadow-[0_25px_50px_rgba(0,0,0,0.95)]">
            <img src={song.imageUrl} alt={song.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
          {/* Crimson Emissive Backlight */}
          <div className="absolute -inset-2 bg-[#B50925]/30 rounded-3xl blur-xl -z-10 group-hover:bg-[#FF2348]/40 transition" />
        </div>
      </div>
    </div>
  );
};
