'use client';
import React from 'react';
import { Play, Trash2, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

export const LibraryView: React.FC = () => {
  const { likedSongs, toggleLike, playTrack, currentTrack } = usePlayerStore();

  return (
    <div className="px-4 py-4 min-h-[60vh]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Liked Songs</h1>
          <p className="text-xs text-[#CCFF00] font-mono mt-0.5">{likedSongs.length} SAVED TRACKS</p>
        </div>
        {likedSongs.length > 0 && (
          <button
            onClick={() => playTrack(likedSongs[0])}
            className="px-4 py-2 rounded-full bg-[#CCFF00] text-black font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition"
          >
            <Play className="w-3.5 h-3.5 fill-black" /> Play All
          </button>
        )}
      </div>

      {likedSongs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mb-3">
            <Heart className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold text-white">No liked songs yet</p>
          <p className="text-xs text-gray-400 mt-1 max-w-[220px]">
            Tap the heart icon on any track to save it to your local library.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {likedSongs.map((song) => {
            const isCurrent = currentTrack?.id === song.id;
            return (
              <div
                key={song.id}
                className={`flex items-center justify-between p-2 rounded-2xl transition border ${
                  isCurrent ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5'
                }`}
              >
                <div onClick={() => playTrack(song)} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                  <img src={song.imageUrl} alt={song.name} className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isCurrent ? 'text-[#CCFF00]' : 'text-white'}`}>{song.name}</p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{song.primaryArtists}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => playTrack(song)} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                  </button>
                  <button onClick={() => toggleLike(song)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
