'use client';
import React, { useState, useRef } from 'react';
import { Play, Pause, Heart, Sparkles, Compass } from 'lucide-react';
import { Song } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  song: Song;
  onOpenAstra?: () => void;
}

export const Hero3DVisualizer: React.FC<Props> = ({ song, onOpenAstra }) => {
  const { playTrack, togglePlay, currentTrack, isPlaying, toggleLike, likedSongs } = usePlayerStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const isCurrent = currentTrack?.id === song.id;
  const isLiked = likedSongs.some((s) => s.id === song.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) togglePlay();
    else playTrack(song);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out'
      }}
      className="relative w-full rounded-3xl overflow-hidden noir-panel border border-[#B50925]/30 p-6 md:p-8 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] select-none"
    >
      {/* Background Artist Ambient Flare */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 blur-3xl scale-125 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${song.imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080809] via-[#080809]/85 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex-1 max-w-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] font-mono font-extrabold text-[#FF2348] bg-[#B50925]/20 border border-[#B50925]/50 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,35,72,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2348] animate-ping" />
              FEATURED ARTIST RELEASE
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md font-['Space_Grotesk']">
            {song.name}
          </h1>
          <p className="text-sm md:text-base text-gray-300 font-medium mt-1">
            {song.primaryArtists}
          </p>
          <p className="text-xs text-gray-400 mt-2 font-mono flex items-center gap-2">
            <span>Lossless Master Quality</span>
            <span>•</span>
            <span className="text-[#FF2348]">320 KBPS AAC</span>
            <span>•</span>
            <span>Spatial Staging</span>
          </p>

          {/* 5-Bar CSS Equalizer */}
          <div className="flex items-end gap-1 h-5 mt-4">
            <span className={`w-1 bg-[#FF2348] rounded-full transition-all duration-300 ${isCurrent && isPlaying ? 'h-5 animate-pulse' : 'h-1.5 opacity-40'}`} />
            <span className={`w-1 bg-[#B50925] rounded-full transition-all duration-300 ${isCurrent && isPlaying ? 'h-3 animate-pulse delay-75' : 'h-2 opacity-40'}`} />
            <span className={`w-1 bg-[#FF2348] rounded-full transition-all duration-300 ${isCurrent && isPlaying ? 'h-4 animate-pulse delay-150' : 'h-1.5 opacity-40'}`} />
            <span className={`w-1 bg-[#E11D48] rounded-full transition-all duration-300 ${isCurrent && isPlaying ? 'h-5 animate-pulse delay-100' : 'h-2.5 opacity-40'}`} />
            <span className={`w-1 bg-[#FF2348] rounded-full transition-all duration-300 ${isCurrent && isPlaying ? 'h-3 animate-pulse delay-200' : 'h-1 opacity-40'}`} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={handleAction}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#B50925] via-[#E11D48] to-[#FF2348] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2.5 crimson-glow hover:scale-105 active:scale-95 transition cursor-pointer"
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
              className="w-12 h-12 rounded-full bg-[#151518] border border-white/10 flex items-center justify-center text-white hover:border-[#FF2348] transition cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#FF2348] text-[#FF2348]' : 'text-gray-400'}`} />
            </button>

            {onOpenAstra && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAstra();
                }}
                className="px-5 py-3 rounded-full bg-[#151518]/80 border border-[#B50925]/50 text-[#FF2348] font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#B50925]/20 hover:border-[#FF2348] transition cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#FF2348]" />
                <span>OPEN ASTRA</span>
              </button>
            )}
          </div>
        </div>

        {/* 3D Suspended Vinyl Album Card */}
        <div className="relative flex-shrink-0 group self-center md:self-auto">
          <div
            style={{
              transform: 'rotateY(-14deg) rotateX(4deg)',
              transformStyle: 'preserve-3d'
            }}
            className="relative w-48 h-48 md:w-60 md:h-60 rounded-2xl overflow-hidden border-2 border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.95)] transition-transform duration-500 group-hover:rotate-y-0 group-hover:rotate-x-0 group-hover:scale-105"
          >
            <img
              src={song.imageUrl}
              alt={song.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
              }}
            />
            {/* Glass Sheen Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/40 pointer-events-none" />
            <div className="absolute inset-0 border border-white/15 rounded-2xl pointer-events-none" />
          </div>

          {/* Faded Reflection */}
          <div
            style={{
              transform: 'rotateY(-14deg) rotateX(4deg) scaleY(-0.35) translateY(-20px)',
              transformOrigin: 'bottom',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)'
            }}
            className="w-48 h-48 md:w-60 md:h-60 rounded-2xl overflow-hidden blur-[2px] opacity-25 pointer-events-none absolute -bottom-16 left-0 -z-10"
          >
            <img
              src={song.imageUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Crimson Emissive Backlight */}
          <div className="absolute -inset-4 bg-[#B50925]/35 rounded-3xl blur-2xl -z-20 group-hover:bg-[#FF2348]/45 transition duration-500" />
        </div>
      </div>
    </div>
  );
};
