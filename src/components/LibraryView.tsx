'use client';
import React from 'react';
import { Play, Trash2, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

export const LibraryView: React.FC = () => {
  const { likedSongs, toggleLike, playTrack, currentTrack, isPlaying } = usePlayerStore();

  return (
    <div className="px-5 py-4 min-h-[60vh] select-none">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">SAVED COLLECTION</p>
          <h1 className="text-base font-bold text-white tracking-wide">Liked Songs</h1>
        </div>
        {likedSongs.length > 0 && (
          <button
            onClick={() => playTrack(likedSongs[0])}
            className="px-4 py-1.5 rounded-full bg-white text-black font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition"
          >
            <Play className="w-3.5 h-3.5 fill-black stroke-black" /> Play All
          </button>
        )}
      </div>

      {likedSongs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0D0D11] border border-white/10 flex items-center justify-center text-zinc-500 mb-3">
            <Heart className="w-6 h-6 text-zinc-600" />
          </div>
          <p className="text-xs font-semibold text-white">No liked tracks yet</p>
          <p className="text-[11px] text-zinc-500 mt-1 max-w-[220px]">
            Tap the heart icon on any track to save it to your local Philomela library.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {likedSongs.map((song) => {
            const isCurrent = currentTrack?.id === song.id;
            return (
              <div
                key={song.id}
                className={`flex items-center justify-between p-2 rounded-xl transition border ${
                  isCurrent ? 'bg-[#0D0D11] border-white/15' : 'bg-transparent border-transparent hover:bg-white/[0.03]'
                }`}
              >
                <div onClick={() => playTrack(song)} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer pr-2">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-[#0D0D11]">
                    <img
                      src={song.imageUrl}
                      alt={song.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-white font-bold' : 'text-zinc-200'}`}>
                      {song.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">{song.primaryArtists}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playTrack(song)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                      isCurrent && isPlaying ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <span className="w-2 h-2 bg-black rounded-sm" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => toggleLike(song)}
                    className="w-8 h-8 rounded-full bg-white/5 text-zinc-400 hover:text-[#E11D48] hover:bg-[#E11D48]/10 flex items-center justify-center transition"
                    title="Remove from Liked"
                  >
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

export default LibraryView;
