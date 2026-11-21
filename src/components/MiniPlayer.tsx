'use client';
import React from 'react';
import { Play, Pause, Heart, SkipForward } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  onOpenNowPlaying: () => void;
}

export const MiniPlayer: React.FC<Props> = ({ onOpenNowPlaying }) => {
  const { currentTrack, isPlaying, togglePlay, playNext, toggleLike, likedSongs, currentTime, duration } = usePlayerStore();

  if (!currentTrack) return null;

  const isLiked = likedSongs.some((s) => s.id === currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={onOpenNowPlaying}
      className="fixed bottom-[68px] left-3 right-3 max-w-md md:max-w-3xl mx-auto z-40 bg-[#121217]/90 backdrop-blur-2xl border border-[#EF4444]/25 rounded-2xl p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(239,68,68,0.15)] flex flex-col justify-between cursor-pointer select-none overflow-hidden transition hover:border-[#EF4444]/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-lg border border-white/10 flex-shrink-0 bg-neutral-900">
            <img
              src={currentTrack.imageUrl}
              alt={currentTrack.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
              }}
            />
          </div>
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-xs font-extrabold text-white truncate">{currentTrack.name}</p>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{currentTrack.primaryArtists}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(currentTrack);
            }}
            className="p-1.5 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#EF4444] text-[#EF4444]' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-9 h-9 rounded-full bg-gradient-to-r from-[#EF4444] to-rose-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playNext();
            }}
            className="p-1.5 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Crimson Laser Scrubber Line */}
      <div className="w-full bg-white/10 h-[2px] mt-2.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#EF4444] to-rose-500 h-full transition-all duration-300 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
