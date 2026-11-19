"use client";

import React from "react";
import { Play, Pause } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

interface TopDailyPlaylistsProps {
  songs: Song[];
  onSeeAll?: () => void;
}

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

export default function TopDailyPlaylists({
  songs = [],
  onSeeAll,
}: TopDailyPlaylistsProps) {
  const { currentTrack, isPlaying, playSong, togglePlay } = usePlayerStore();

  if (!songs || songs.length === 0) return null;

  return (
    <section className="w-full my-3 select-none gpu-layer">
      {/* Header matching Reference 1: px-4 pt-4 pb-2 */}
      <div className="px-4 pt-4 pb-2 flex justify-between items-center">
        <h2 className="text-sm font-bold text-white tracking-tight">
          Top daily playlists
        </h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-xs text-gray-400 hover:text-white transition cursor-pointer"
          >
            See all
          </button>
        )}
      </div>

      {/* List rows: flex flex-col gap-3 px-4 */}
      <div className="flex flex-col gap-2.5 px-4">
        {songs.slice(0, 5).map((song, idx) => {
          const isCurrent = currentTrack?.id === song.id;
          const isCardPlaying = isCurrent && isPlaying;
          const songCount = ((idx * 7 + 8) % 24) + 8; // e.g. 8 Songs, 15 Songs, 24 Songs matching reference

          return (
            <div
              key={song.id}
              onClick={() => {
                if (isCurrent) togglePlay();
                else playSong(song, songs);
              }}
              className={`flex items-center justify-between p-2 rounded-2xl transition cursor-pointer select-none ${
                isCurrent
                  ? "bg-white/10 border border-[#D4FF00]/40 shadow-sm"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              {/* Left: 48x48 rounded-full album image with crisp object-cover */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/10 shadow-sm">
                <img
                  src={song.imageUrl || FALLBACK_VINYL}
                  alt={song.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                  }}
                />
              </div>

              {/* Center (flex-1 px-3 min-w-0) */}
              <div className="flex-1 px-3 min-w-0">
                <h4
                  className={`text-xs font-semibold truncate ${
                    isCurrent ? "text-[#D4FF00]" : "text-white"
                  }`}
                >
                  {song.name}
                </h4>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">
                  By {song.primaryArtists || "Waveform"} • {songCount} Songs
                </p>
              </div>

              {/* Right: 30px circular dark play button with white triangle (bg-white/10) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCurrent) togglePlay();
                  else playSong(song, songs);
                }}
                className={`w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 cursor-pointer ${
                  isCardPlaying
                    ? "bg-[#D4FF00] text-black shadow-md shadow-[#D4FF00]/30"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                aria-label={isCardPlaying ? "Pause" : "Play"}
              >
                {isCardPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current stroke-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current stroke-current ml-0.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
