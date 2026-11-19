'use client';
import React from 'react';
import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

interface MiniPlayerProps {
  onOpenNowPlaying?: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onOpenNowPlaying }) => {
  const { currentTrack, isPlaying, togglePlay, playNext, toggleLike, likedSongs } = usePlayerStore();

  if (!currentTrack) return null;

  const isLiked = likedSongs?.some((s) => s.id === currentTrack.id);

  return (
    <div className="fixed bottom-[72px] left-3 right-3 max-w-[406px] mx-auto z-40 bg-[#16161C]/95 backdrop-blur-xl border border-white/15 rounded-2xl px-3 py-2 flex items-center justify-between shadow-2xl">
      <div
        onClick={onOpenNowPlaying}
        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
      >
        <img
          src={currentTrack.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80'}
          alt={currentTrack.name}
          className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0 bg-zinc-900"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80') {
              target.src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80';
            }
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{currentTrack.name}</p>
          <p className="text-[10px] text-gray-400 truncate">{currentTrack.primaryArtists}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => toggleLike(currentTrack)}
          className="p-1.5 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-[#CCFF00] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black translate-x-0.5" />}
        </button>
        <button onClick={playNext} className="p-1.5 text-gray-400 hover:text-white transition cursor-pointer">
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;
