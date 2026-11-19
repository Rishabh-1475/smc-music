'use client';
import React from 'react';
import { Play, Heart, Plus, MoreHorizontal } from 'lucide-react';
import { Song } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  featuredSong: Song | null;
}

export const HeroVisualizer: React.FC<Props> = ({ featuredSong }) => {
  const { playTrack, toggleLike, likedSongs } = usePlayerStore();

  if (!featuredSong) return null;

  const isLiked = likedSongs?.some((s) => s.id === featuredSong.id);

  return (
    <section className="px-4 py-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-white font-bold text-sm tracking-wide">Curated &amp; trending</h2>
      </div>

      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#401258] via-[#210D3D] to-[#0E061E] border border-white/10 p-4 h-48 flex items-center justify-between shadow-2xl">
        <div className="absolute -top-10 -left-10 w-36 h-36 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex-1 pr-3 z-10 flex flex-col justify-between h-full py-1">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-[9px] font-bold tracking-wider text-purple-200 uppercase">
              Discover weekly
            </span>
            <h3 className="text-white font-extrabold text-base line-clamp-1 mt-2 leading-tight">
              {featuredSong.name}
            </h3>
            <p className="text-gray-300 text-[11px] line-clamp-1 mt-0.5">
              By {featuredSong.primaryArtists}
            </p>
            <p className="text-gray-400 text-[10px] line-clamp-1 mt-0.5">
              The original high-fidelity sound curated for you.
            </p>
          </div>

          <div className="flex items-center gap-3.5 mt-2">
            <button
              onClick={() => playTrack(featuredSong)}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black translate-x-0.5" />
            </button>
            <button
              onClick={() => toggleLike(featuredSong)}
              className="text-white/80 hover:text-white transition cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button className="text-white/80 hover:text-white transition cursor-pointer">
              <Plus className="w-5 h-5" />
            </button>
            <button className="text-white/80 hover:text-white transition cursor-pointer">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10">
          <img
            src={featuredSong.imageUrl}
            alt={featuredSong.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroVisualizer;
