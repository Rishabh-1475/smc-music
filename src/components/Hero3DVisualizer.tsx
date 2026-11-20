'use client';
import React from 'react';
import { Play } from 'lucide-react';
import { Song } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';
import { TiltCard3D } from './TiltCard3D';

interface Props {
  song: Song;
}

export const Hero3DVisualizer: React.FC<Props> = ({ song }) => {
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const isCurrent = currentTrack?.id === song.id;

  return (
    <div className="py-4 px-5 perspective-stage">
      <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping" />
        SPATIAL SHOWCASE
      </p>

      <TiltCard3D depth={14} className="rounded-3xl card-3d-shadow overflow-hidden">
        <div className="relative bg-gradient-to-br from-[#1C060B] via-[#0E0608] to-[#040406] border border-[#EF4444]/30 p-6 flex items-center justify-between rounded-3xl">
          
          {/* Ambient Laser Core */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#EF4444]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Left Metadata on Z-Depth 25px */}
          <div style={{ transform: 'translateZ(25px)' }} className="flex-1 pr-4 z-10">
            <span className="text-[9px] font-mono font-extrabold text-[#EF4444] bg-[#EF4444]/15 border border-[#EF4444]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
              LOSSLESS 3D MASTER
            </span>
            <h3 className="text-lg font-black text-white mt-2 line-clamp-1 tracking-tight drop-shadow-md">
              {song.name}
            </h3>
            <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{song.primaryArtists}</p>

            <button
              onClick={() => playTrack(song)}
              className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-[#EF4444] to-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isCurrent && isPlaying ? 'PLAYING NOW' : 'STREAM 3D'}</span>
            </button>
          </div>

          {/* Right Holographic Disc Stage on Z-Depth 50px */}
          <div style={{ transform: 'translateZ(50px)' }} className="relative z-20 flex-shrink-0">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.9),0_0_25px_rgba(239,68,68,0.3)]">
              <img
                src={song.imageUrl}
                alt={song.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Orbiting Laser Ring */}
            <div className="absolute -inset-2 rounded-3xl border border-[#EF4444]/40 pointer-events-none animate-pulse" />
          </div>
        </div>
      </TiltCard3D>
    </div>
  );
};

export default Hero3DVisualizer;
