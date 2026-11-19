"use client";

import React from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, MessageSquare, ListMusic } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { getSongCover, decodeHtmlEntities } from "./TopDailyPlaylists";

const formatTime = (secs: number): string => {
  if (isNaN(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    progress,
    togglePlay,
    playNext,
    playPrev,
    togglePlayerOpen,
    isPlayerOpen,
  } = usePlayerStore();

  if (!currentTrack || isPlayerOpen) return null;

  const title = decodeHtmlEntities(currentTrack.name || "Track");
  const artist = decodeHtmlEntities(currentTrack.primaryArtists || "Artist");
  const coverUrl = getSongCover(currentTrack);

  return (
    <div
      onClick={() => togglePlayerOpen(true)}
      role="button"
      tabIndex={0}
      aria-label="Open Now Playing"
      className="fixed bottom-[68px] left-2.5 right-2.5 max-w-[412px] mx-auto z-50 rounded-full bg-[#121217]/90 backdrop-blur-2xl border border-white/15 px-3 py-2 shadow-[0_12px_45px_rgba(0,0,0,0.9)] select-none cursor-pointer transition-all duration-300 hover:border-[#D4FF00]/40 overflow-hidden gpu-layer"
    >
      {/* Top Hairline Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.08]">
        <div
          className="h-full bg-[#D4FF00] transition-all duration-150"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>

      {/* Floating Capsule matching Image 1, 3, 4 */}
      <div className="flex items-center justify-between gap-2.5">
        {/* Left: Previous, Play/Pause, Next */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playPrev();
            }}
            className="p-1 text-gray-400 hover:text-white transition cursor-pointer"
            aria-label="Previous"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center transition shadow-md active:scale-95 cursor-pointer hover:bg-neutral-200"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-black stroke-black" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-black stroke-black ml-0.5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              playNext();
            }}
            className="p-1 text-gray-400 hover:text-white transition cursor-pointer"
            aria-label="Next"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Center: Thumbnail + Title + Animated Soundwave + Time */}
        <div className="flex items-center space-x-2.5 min-w-0 flex-1 px-1">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20 flex-shrink-0 bg-neutral-900 shadow">
            <img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-bold text-white truncate leading-tight">
              {title}
            </h5>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-[10px] text-gray-400 truncate max-w-[90px]">
                {artist}
              </span>
              {/* Animated Soundwave Equalizer */}
              {isPlaying && (
                <div className="flex items-end space-x-0.5 h-2.5 flex-shrink-0">
                  <span className="w-0.5 h-2 bg-[#D4FF00] animate-pulse rounded-full" />
                  <span className="w-0.5 h-3 bg-[#D4FF00] animate-pulse delay-75 rounded-full" />
                  <span className="w-0.5 h-1.5 bg-[#D4FF00] animate-pulse delay-150 rounded-full" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Time + Volume Speaker / Queue icon */}
        <div className="flex items-center space-x-2 flex-shrink-0 pr-1 text-gray-400">
          <span className="text-[10px] font-mono text-gray-300">
            {formatTime(currentTime)} / {formatTime(duration) || "2:21"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayerOpen(true);
            }}
            className="hover:text-white transition cursor-pointer"
            aria-label="Expand player"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
