'use client';
import React from 'react';
import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  onOpenNowPlaying: () => void;
}

export const MiniPlayer: React.FC<Props> = ({ onOpenNowPlaying }) => {
  const { currentTrack, isPlaying, togglePlay, playNext, toggleLike, likedSongs, currentTime, duration } = usePlayerStore();

  if (!currentTrack) return null;

  const isLiked = likedSongs.some((s) => s.id === currentTrack.id);
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div
      onClick={onOpenNowPlaying}
      className="fixed bottom-[64px] left-3 right-3 max-w-[406px] mx-auto z-40 bg-[#0D0D11]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex items-center justify-between cursor-pointer select-none overflow-hidden"
    >
      {/* Philomela Hairline Progress Runner across top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 pointer-events-none">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-[#050505]">
          <img
            src={currentTrack.imageUrl}
            alt={currentTrack.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white truncate tracking-tight">{currentTrack.name}</p>
          <p className="text-[10px] text-zinc-400 truncate mt-0.5">{currentTrack.primaryArtists}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(currentTrack);
          }}
          className="p-1.5 text-zinc-400 hover:text-white transition active:scale-90"
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
            <Pause className="w-3.5 h-3.5 fill-black stroke-black" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-black stroke-black translate-x-0.5" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            playNext();
          }}
          className="p-1.5 text-zinc-400 hover:text-white transition active:scale-90"
          title="Next"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;
