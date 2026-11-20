'use client';
import React from 'react';
import { Play, Pause, Trash2, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

export const LibraryView: React.FC = () => {
  const { likedSongs, toggleLike, playTrack, currentTrack, isPlaying } = usePlayerStore();

  return (
    <div className="px-4 py-4 min-h-[60vh] select-none">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Liked Songs</h1>
          <p className="text-xs text-gray-400 mt-0.5">{likedSongs.length} tracks in collection</p>
        </div>
        {likedSongs.length > 0 && (
          <button
            onClick={() => playTrack(likedSongs[0], likedSongs)}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-[#EF4444] to-rose-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer"
            title="Play All"
          >
            <Play className="w-5 h-5 fill-white stroke-white translate-x-0.5" />
          </button>
        )}
      </div>

      {likedSongs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#121217] border border-white/10 flex items-center justify-center text-gray-400 mb-3 shadow-lg">
            <Heart className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-bold text-white">Your collection is empty</p>
          <p className="text-xs text-gray-400 mt-1 max-w-[220px]">
            Save tracks by tapping the heart icon anywhere in the player.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {likedSongs.map((song) => {
            const isCurrent = currentTrack?.id === song.id;
            return (
              <div
                key={song.id}
                className={`flex items-center justify-between p-2.5 rounded-xl transition border ${
                  isCurrent
                    ? 'bg-[#181218] border-[#EF4444]/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-[#121217]/70 border-white/5 hover:border-white/15'
                }`}
              >
                <div
                  onClick={() => playTrack(song, likedSongs)}
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer pr-2"
                >
                  <img
                    src={song.imageUrl}
                    alt={song.name}
                    className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-neutral-900 border border-white/5"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#EF4444]' : 'text-white'}`}>
                      {song.name}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{song.primaryArtists}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleLike(song)}
                    className="p-2 text-gray-400 hover:text-[#EF4444] transition active:scale-90 cursor-pointer"
                    title="Remove from Liked"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => playTrack(song, likedSongs)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                      isCurrent && isPlaying ? 'text-[#EF4444]' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause className="w-4 h-4 fill-current stroke-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current stroke-current translate-x-0.5" />
                    )}
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

export default LibraryView;
