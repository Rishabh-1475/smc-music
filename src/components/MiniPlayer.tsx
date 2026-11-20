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
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      onClick={onOpenNowPlaying}
      className="fixed bottom-[68px] left-3 right-3 max-w-[406px] mx-auto z-40 bg-[#181822]/95 backdrop-blur-2xl border border-white/10 rounded-xl p-2.5 shadow-2xl flex flex-col justify-between cursor-pointer select-none overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img
            src={currentTrack.imageUrl}
            alt={currentTrack.name}
            className="w-[42px] h-[42px] rounded-lg object-cover flex-shrink-0 bg-[#050505] shadow-md border border-white/5"
            onError={(e) => {
              e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
            }}
          />
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-xs font-bold text-white truncate">{currentTrack.name}</p>
            <p className="text-[11px] text-[#94A3B8] truncate">{currentTrack.primaryArtists}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(currentTrack);
            }}
            className="p-2 text-[#94A3B8] hover:text-[#E11D48] transition active:scale-90"
            title="Like"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#E11D48] text-[#E11D48]' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black stroke-black" />
            ) : (
              <Play className="w-4 h-4 fill-black stroke-black translate-x-0.5" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playNext();
            }}
            className="p-1.5 text-[#94A3B8] hover:text-white transition active:scale-90"
            title="Next"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2px Hairline Crimson Progress Bar */}
      <div className="w-full bg-[#262633] h-[2px] mt-2 rounded-full overflow-hidden">
        <div
          className="bg-[#E11D48] h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

export default MiniPlayer;
