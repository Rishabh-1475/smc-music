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
          <h1 className="text-xl font-bold text-white tracking-tight">Liked Songs</h1>
          <p className="text-xs text-[#B3B3B3] mt-0.5">{likedSongs.length} songs</p>
        </div>
        {likedSongs.length > 0 && (
          <button
            onClick={() => playTrack(likedSongs[0])}
            className="w-11 h-11 rounded-full bg-[#1DB954] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-xl"
            title="Play All"
          >
            <Play className="w-5 h-5 fill-black stroke-black translate-x-0.5" />
          </button>
        )}
      </div>

      {likedSongs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-14 h-14 rounded-full bg-[#282828] flex items-center justify-center text-[#B3B3B3] mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-white">Songs you like will appear here</p>
          <p className="text-xs text-[#B3B3B3] mt-1 max-w-[220px]">
            Save songs by tapping the heart icon.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {likedSongs.map((song) => {
            const isCurrent = currentTrack?.id === song.id;
            return (
              <div
                key={song.id}
                className={`flex items-center justify-between p-2 rounded-md transition ${
                  isCurrent ? 'bg-[#282828]' : 'hover:bg-[#181818]'
                }`}
              >
                <div onClick={() => playTrack(song)} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer pr-2">
                  <img
                    src={song.imageUrl}
                    alt={song.name}
                    className="w-11 h-11 rounded object-cover flex-shrink-0 bg-[#181818]"
                    onError={(e) => {
                      e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                      {song.name}
                    </p>
                    <p className="text-[11px] text-[#B3B3B3] truncate mt-0.5">{song.primaryArtists}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => playTrack(song)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                      isCurrent && isPlaying ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause className="w-4 h-4 fill-current stroke-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current stroke-current ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => toggleLike(song)}
                    className="w-8 h-8 rounded-full text-[#1DB954] hover:text-red-400 flex items-center justify-center transition"
                    title="Remove from Liked"
                  >
                    <Trash2 className="w-4 h-4" />
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
