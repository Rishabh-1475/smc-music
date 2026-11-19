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

const formatDuration = (secs: number | string): string => {
  const n = typeof secs === "string" ? parseInt(secs, 10) : secs;
  if (isNaN(n) || n <= 0) return "3:20";
  const m = Math.floor(n / 60);
  const s = Math.floor(n % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export default function TopDailyPlaylists({
  songs = [],
  onSeeAll,
}: TopDailyPlaylistsProps) {
  const { currentTrack, isPlaying, playSong, togglePlay } = usePlayerStore();

  if (!songs || songs.length === 0) return null;

  return (
    <section className="px-4 md:px-8 my-7 gpu-layer">
      {/* Section Header matching Reference 1 */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Top daily playlists
        </h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-xs text-neutral-400 hover:text-[#D2FF1F] font-semibold transition cursor-pointer"
          >
            See all
          </button>
        )}
      </div>

      {/* Track Rows matching Reference 1 */}
      <div className="space-y-2.5">
        {songs.slice(0, 6).map((song) => {
          const isCurrent = currentTrack?.id === song.id;
          const isCardPlaying = isCurrent && isPlaying;

          return (
            <div
              key={song.id}
              onClick={() => {
                if (isCurrent) togglePlay();
                else playSong(song, songs);
              }}
              className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all duration-200 cursor-pointer select-none ${
                isCurrent
                  ? "bg-white/10 border border-[#D2FF1F]/40 shadow-lg shadow-[#D2FF1F]/10"
                  : "bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]"
              }`}
            >
              {/* Left: Circular Album Artwork (52x52) */}
              <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                <div className="relative w-[52px] h-[52px] rounded-full overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/10 shadow-md">
                  <img
                    src={song.imageUrl || FALLBACK_VINYL}
                    alt={song.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                    }}
                  />
                  {isCardPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D2FF1F] animate-ping" />
                    </div>
                  )}
                </div>

                {/* Center: Track Title + Subtitle */}
                <div className="min-w-0 flex-1 pr-2">
                  <h4
                    className={`text-sm font-semibold truncate leading-tight ${
                      isCurrent ? "text-[#D2FF1F]" : "text-white"
                    }`}
                  >
                    {song.name}
                  </h4>
                  <p className="text-xs text-neutral-400 truncate mt-1">
                    {song.primaryArtists || "Unknown Artist"} • {formatDuration(song.duration)}
                  </p>
                </div>
              </div>

              {/* Right: Small Circular Play Arrow Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCurrent) togglePlay();
                  else playSong(song, songs);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer ${
                  isCardPlaying
                    ? "bg-[#D2FF1F] text-black shadow-md shadow-[#D2FF1F]/30"
                    : "bg-white/5 border border-white/10 text-white hover:bg-[#D2FF1F] hover:text-black group-hover:border-transparent"
                }`}
                aria-label={isCardPlaying ? "Pause" : "Play"}
              >
                {isCardPlaying ? (
                  <Pause className="w-4 h-4 fill-current stroke-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current stroke-current ml-0.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
