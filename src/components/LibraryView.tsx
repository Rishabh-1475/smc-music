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
          <p className="text-xs text-[#94A3B8] mt-0.5">{likedSongs.length} songs in collection</p>
        </div>
        {likedSongs.length > 0 && (
          <button
            onClick={() => playTrack(likedSongs[0], likedSongs)}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#E11D48] to-[#EF4444] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-[0_0_20px_rgba(225,29,72,0.4)] cursor-pointer"
            title="Play All"
          >
            <Play className="w-5 h-5 fill-white stroke-white translate-x-0.5" />
          </button>
        )}
      </div>

      {likedSongs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#121217] border border-[#262633] flex items-center justify-center text-[#94A3B8] mb-3">
            <Heart className="w-6 h-6 text-[#94A3B8]" />
          </div>
          <p className="text-sm font-bold text-white">Songs you like will appear here</p>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-[220px]">
            Save tracks by tapping the heart icon on any player or track row.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {likedSongs.map((song) => {
            const isCurrent = currentTrack?.id === song.id;
            return (
              <div
                key={song.id}
                className={`flex items-center justify-between p-2 rounded-xl transition border border-transparent ${
                  isCurrent ? 'bg-[#181822] border-[#262633]' : 'bg-[#121217]/50 hover:bg-[#121217] hover:border-[#262633]'
                }`}
              >
                <div
                  onClick={() => playTrack(song, likedSongs)}
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer pr-2"
                >
                  <img
                    src={song.imageUrl}
                    alt={song.name}
                    className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-[#050505] border border-white/5"
                    onError={(e) => {
                      e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#E11D48]' : 'text-white'}`}>
                      {song.name}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">{song.primaryArtists}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleLike(song)}
                    className="p-2 text-[#94A3B8] hover:text-[#E11D48] transition active:scale-90 cursor-pointer"
                    title="Remove from Liked"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => playTrack(song, likedSongs)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                      isCurrent && isPlaying ? 'text-[#E11D48]' : 'text-[#94A3B8] hover:text-white'
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
