'use client';
import React from 'react';
import { Play } from 'lucide-react';
import { Song } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  title: string;
  songs: Song[];
  onSeeAll?: () => void;
}

export const decodeHtmlEntities = (str: string): string => {
  if (!str) return '';
  if (typeof window === 'undefined') return str;
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
};

export const TopDailyPlaylists: React.FC<Props> = ({ title, songs, onSeeAll }) => {
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();

  if (!songs || songs.length === 0) return null;

  return (
    <section className="px-4 py-3">
      <div className="flex justify-between items-center mb-2.5">
        <h2 className="text-white font-bold text-sm tracking-wide">{title}</h2>
        {onSeeAll && (
          <button onClick={onSeeAll} className="text-xs text-gray-400 hover:text-white transition">
            See all
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {songs.map((song) => {
          const isCurrent = currentTrack?.id === song.id;
          return (
            <div
              key={song.id}
              onClick={() => playTrack(song)}
              className={`flex items-center justify-between p-2 rounded-2xl transition cursor-pointer ${
                isCurrent ? 'bg-white/10 border border-white/15' : 'hover:bg-white/5'
              }`}
            >
              <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border border-white/10 bg-zinc-900">
                <img
                  src={song.imageUrl}
                  alt={song.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 px-3 min-w-0">
                <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#CCFF00]' : 'text-white'}`}>
                  {song.name}
                </p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">
                  By {song.primaryArtists} • {song.duration ? `${song.duration}s` : '320kbps'}
                </p>
              </div>

              <button
                className={`w-8 h-8 rounded-full flex items-center justify-center transition flex-shrink-0 ${
                  isCurrent && isPlaying ? 'bg-[#CCFF00] text-black' : 'bg-white/10 text-white'
                }`}
              >
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TopDailyPlaylists;
