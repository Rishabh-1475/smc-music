'use client';
import React from 'react';
import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  onOpenNowPlaying: () => void;
}

export const MiniPlayer: React.FC<Props> = ({ onOpenNowPlaying }) => {
  const { currentTrack, isPlaying, togglePlay, playNext, toggleLike, likedSongs } = usePlayerStore();

  if (!currentTrack) return null;

  const isLiked = likedSongs.some((s) => s.id === currentTrack.id);

  return (
    <div
      onClick={onOpenNowPlaying}
      className="fixed bottom-[68px] md:bottom-4 left-3 right-3 md:left-72 md:right-8 z-40 bg-[#141418]/95 backdrop-blur-xl border border-white/15 rounded-2xl px-3 py-2 flex items-center justify-between shadow-2xl cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <img
          src={currentTrack.imageUrl}
          alt={currentTrack.name}
          className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0 bg-neutral-800"
          onError={(e) => {
            e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{currentTrack.name}</p>
          <p className="text-[10px] text-gray-400 truncate">{currentTrack.primaryArtists}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(currentTrack);
          }}
          className="p-1.5 text-gray-400 hover:text-white transition"
          title="Like"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="w-8 h-8 rounded-full bg-[#CCFF00] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black translate-x-0.5" />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            playNext();
          }}
          className="p-1.5 text-gray-400 hover:text-white transition"
          title="Next"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;
