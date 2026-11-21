'use client';
import React, { useRef, useState } from 'react';
import { Play, Pause, Heart, Sparkles, Volume2 } from 'lucide-react';
import { Song } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  song: Song;
}

export const Hero3DVisualizer: React.FC<Props> = ({ song }) => {
  const { playTrack, togglePlay, currentTrack, isPlaying, toggleLike, likedSongs } = usePlayerStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  const isCurrent = currentTrack?.id === song.id;
  const isLiked = likedSongs.some((s) => s.id === song.id);

  // Smooth GPU-accelerated touch/cursor parallax tilt
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: -y * 12, y: x * 12 });
  };

  const handlePointerLeave = () => {
    setIsInteracting(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleMainAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(song);
    }
  };

  return (
    <div className="py-4 px-4 perspective-[1200px] select-none">
      {/* Micro-HUD Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-[10px] font-mono font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
          ASTRA SPATIAL SHOWCASE
        </p>
        <span className="text-[10px] font-mono text-[#EF4444] bg-[#EF4444]/15 px-2 py-0.5 rounded-full border border-[#EF4444]/30 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#EF4444]" /> 3D HOLOGRAM
        </span>
      </div>

      {/* 3D Kinetic Hologram Stage */}
      <div
        ref={cardRef}
        onPointerEnter={() => setIsInteracting(true)}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isInteracting ? 1.02 : 1}, ${isInteracting ? 1.02 : 1}, 1)`,
          transformStyle: 'preserve-3d',
          transition: isInteracting ? 'transform 0.08s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
        className="relative rounded-3xl overflow-hidden cursor-pointer shadow-[0_25px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(239,68,68,0.25)] border border-[#EF4444]/30 bg-gradient-to-br from-[#1A060C] via-[#0D0508] to-[#040406] p-5"
      >
        {/* Volumetric Red Particle Fog (Astra Matching) */}
        <div className="absolute -top-14 -left-14 w-44 h-44 bg-[#EF4444]/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-14 -right-14 w-44 h-44 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Dynamic Specular Sheen */}
        <div
          style={{
            transform: 'translateZ(20px)',
            background: `radial-gradient(circle at ${(tilt.y / 12 + 1) * 50}% ${(-tilt.x / 12 + 1) * 50}%, rgba(255, 255, 255, 0.25), transparent 60%)`
          }}
          className="absolute inset-0 rounded-3xl pointer-events-none z-30 opacity-70"
        />

        <div className="relative z-20 flex items-center justify-between gap-4">
          {/* Left Metadata & Controls (Z-Elevation 30px) */}
          <div style={{ transform: 'translateZ(30px)' }} className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-extrabold text-[#EF4444] bg-[#EF4444]/20 border border-[#EF4444]/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                FEATURED MASTER
              </span>
              {isCurrent && isPlaying && (
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-1 bg-[#EF4444] rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                  <span className="w-1 bg-[#EF4444] rounded-full animate-[bounce_0.8s_ease-in-out_0.2s_infinite]" />
                  <span className="w-1 bg-[#EF4444] rounded-full animate-[bounce_0.5s_ease-in-out_0.4s_infinite]" />
                </div>
              )}
            </div>

            <h3 className="text-lg font-black text-white mt-2 truncate tracking-tight drop-shadow-md">
              {song.name}
            </h3>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{song.primaryArtists}</p>

            {/* Action Bar */}
            <div className="mt-4 flex items-center gap-2.5">
              <button
                onClick={handleMainAction}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#EF4444] via-rose-600 to-amber-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.55)] hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                {isCurrent && isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-white" />
                    <span>PAUSE 3D</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                    <span>STREAM 3D</span>
                  </>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(song);
                }}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:border-[#EF4444]/50 transition cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#EF4444] text-[#EF4444]' : 'text-zinc-400'}`} />
              </button>
            </div>
          </div>

          {/* Right Floating 3D Holographic Disc Stage (Z-Elevation 50px) */}
          <div
            style={{
              transform: 'translateZ(50px) rotateY(-12deg) rotateX(8deg)',
              transformStyle: 'preserve-3d'
            }}
            className="relative flex-shrink-0"
          >
            {/* Astra Matching Particle Laser Ring */}
            <div className="absolute -inset-3 rounded-full border border-[#EF4444]/50 shadow-[0_0_20px_rgba(239,68,68,0.4)] pointer-events-none animate-spin [animation-duration:16s]" />
            <div className="absolute -inset-1.5 rounded-full border border-dashed border-[#EF4444]/30 pointer-events-none animate-spin [animation-duration:8s] [animation-direction:reverse]" />

            {/* Suspended 3D Vinyl Showcase */}
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.95),0_0_25px_rgba(239,68,68,0.35)] bg-black">
              <img
                src={song.imageUrl}
                alt={song.name}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isCurrent && isPlaying ? 'animate-[spin_18s_linear_infinite]' : ''
                }`}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              {/* Center Hologram Spindle */}
              <div className="absolute w-5 h-5 rounded-full bg-black/90 border border-[#EF4444] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-inner pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero3DVisualizer;
