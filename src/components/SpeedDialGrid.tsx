"use client";

import React from "react";
import { Play, Pause, Zap } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

interface SpeedDialGridProps {
  songs?: Song[];
  fallbackSongs?: Song[];
}

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

export default function SpeedDialGrid({
  songs,
  fallbackSongs = [],
}: SpeedDialGridProps) {
  const { currentTrack, isPlaying, playSong, togglePlay, getPersonalizedSpeedDial } =
    usePlayerStore();

  const speedDialItems =
    songs && songs.length > 0
      ? songs.slice(0, 9)
      : getPersonalizedSpeedDial
      ? getPersonalizedSpeedDial(fallbackSongs)
      : fallbackSongs.slice(0, 9);

  if (speedDialItems.length === 0) return null;

  return (
    <section className="my-6 px-4 md:px-8">
      {/* Speed Dial Header */}
      <div className="flex items-center space-x-2 mb-3">
        <Zap className="w-4 h-4 text-[#00FF87] fill-[#00FF87]" />
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
          Speed Dial
        </h2>
      </div>

      {/* 3-Row Horizontal Scrolling Grid */}
      <div className="w-full overflow-x-auto no-scrollbar scroll-smooth pb-2">
        <div className="grid grid-rows-3 grid-flow-col auto-cols-[260px] sm:auto-cols-[300px] md:auto-cols-[330px] gap-2.5">
          {speedDialItems.map((song) => {
            const isCurrent = currentTrack?.id === song.id;
            const isCardPlaying = isCurrent && isPlaying;

            return (
              <div
                key={`speed-dial-${song.id}`}
                onClick={() => {
                  if (isCurrent) {
                    togglePlay();
                  } else {
                    playSong(song, speedDialItems);
                  }
                }}
                className={`group relative flex items-center p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? "bg-[#14141A] text-white shadow-[0_0_15px_rgba(0,255,135,0.2)] border border-[#00FF87]/40"
                    : "bg-[#101014]/90 hover:bg-[#181820] text-neutral-300 border border-white/5"
                }`}
              >
                {/* Thumbnail with Hover / Tap Play Overlay */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900 shadow">
                  <img
                    src={song.imageUrl || FALLBACK_VINYL}
                    alt={song.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                    }}
                  />
                  <div
                    className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-200 ${
                      isCardPlaying
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {isCardPlaying ? (
                      <Pause className="w-5 h-5 fill-white text-white" />
                    ) : (
                      <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Track Title and Artist */}
                <div className="ml-3 min-w-0 flex-1 pr-2">
                  <h4
                    className={`text-sm font-semibold truncate ${
                      isCurrent
                        ? "text-[#00FF87] font-bold"
                        : "text-white group-hover:text-white"
                    }`}
                  >
                    {song.name}
                  </h4>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    {song.primaryArtists}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
