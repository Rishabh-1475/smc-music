"use client";

import React from "react";
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronUp } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    togglePlay,
    playNext,
    playPrev,
    togglePlayerOpen,
    toggleLike,
    likedSongIds,
    isPlayerOpen,
  } = usePlayerStore();

  if (!currentTrack || isPlayerOpen) return null;

  const isLiked = Boolean(likedSongIds[currentTrack.id]);
  const isTitleLong = (currentTrack.name || "").length > 24;

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none gpu-layer">
      {/* Suspended Pill Dock Floating 12px Above the Bottom Screen Margin */}
      <div
        onClick={() => togglePlayerOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Open Full-Screen Player"
        className="pointer-events-auto max-w-4xl mx-auto relative rhythmx-glass rounded-full border border-white/15 px-3.5 sm:px-5 py-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.95)] cursor-pointer select-none transition-all duration-300 hover:border-[#00FF87]/50 overflow-hidden"
      >
        {/* Top Hairline Progress Scrubber */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-neutral-900">
          <div
            className="h-full bg-gradient-to-r from-[#00FF87] via-[#00F0FF] to-[#7928CA] transition-all duration-150 shadow-[0_0_10px_#00FF87]"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Track Thumbnail with Animated Glowing Ring */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden p-[2px] bg-gradient-to-tr from-[#00FF87] via-[#00F0FF] to-[#7928CA] shadow-[0_0_12px_rgba(0,255,135,0.4)] flex-shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-neutral-950">
                <img
                  src={currentTrack.imageUrl || FALLBACK_VINYL}
                  alt={currentTrack.name}
                  className={`w-full h-full object-cover ${
                    isPlaying ? "animate-vinyl" : ""
                  }`}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                  }}
                />
              </div>
            </div>

            {/* Marquee Track Title + Secondary Artist Tag */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="overflow-hidden whitespace-nowrap">
                <h5
                  className={`text-sm font-black text-white leading-tight ${
                    isTitleLong ? "hover:animate-marquee" : ""
                  }`}
                >
                  {currentTrack.name}
                </h5>
              </div>
              <p className="text-xs text-[#8F90A6] truncate mt-0.5 font-medium">
                {currentTrack.primaryArtists}
              </p>
            </div>
          </div>

          {/* Large Responsive Tactile Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2.5 flex-shrink-0">
            {/* Previous */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playPrev();
              }}
              className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition hidden sm:inline-flex cursor-pointer"
              aria-label="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Circle Button in #00FF87 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00FF87] to-[#10B981] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-[0_0_18px_rgba(0,255,135,0.45)] cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black text-black" />
              ) : (
                <Play className="w-5 h-5 fill-black text-black ml-0.5" />
              )}
            </button>

            {/* Skip Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playNext();
              }}
              className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Like Heart */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(currentTrack);
              }}
              className={`p-2 rounded-full hover:bg-white/10 transition cursor-pointer ${
                isLiked ? "text-[#00FF87]" : "text-neutral-400 hover:text-white"
              }`}
              aria-label={isLiked ? "Unlike Track" : "Like Track"}
            >
              <Heart
                className={`w-5 h-5 ${isLiked ? "fill-[#00FF87] stroke-[#00FF87]" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
