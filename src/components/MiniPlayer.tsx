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

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none gpu-layer">
      {/* Precision Floating Dock Anchored 12px Above Bottom Safe Area */}
      <div
        onClick={() => togglePlayerOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Open Full-Screen Player"
        className="pointer-events-auto max-w-4xl mx-auto relative bg-[#131318] rounded-2xl sm:rounded-full border border-white/[0.08] px-3.5 sm:px-5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.95)] cursor-pointer select-none transition-all duration-200 hover:border-[#E10600]/40 overflow-hidden"
      >
        {/* Razor-Thin 2px Crimson Progress Line along the Very Top Edge */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.05]">
          <div
            className="h-full bg-[#E10600] transition-all duration-150"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* High-Res Album Thumbnail + Typography */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-[#08080A]">
              <img
                src={currentTrack.imageUrl || FALLBACK_VINYL}
                alt={currentTrack.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                }}
              />
            </div>

            {/* Title & Artist */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <h5 className="text-sm font-bold text-white truncate leading-tight">
                {currentTrack.name}
              </h5>
              <p className="text-xs text-[#8A8A93] truncate mt-0.5 font-medium">
                {currentTrack.primaryArtists}
              </p>
            </div>
          </div>

          {/* Crisp Playback Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2.5 flex-shrink-0">
            {/* Previous Track */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playPrev();
              }}
              className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.06] transition hidden sm:inline-flex cursor-pointer"
              aria-label="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Button in Solid Crimson Red (#E10600) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-10 h-10 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white flex items-center justify-center transition shadow-md shadow-[#E10600]/30 active:scale-95 cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white text-white" />
              ) : (
                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
              )}
            </button>

            {/* Skip Next Track */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playNext();
              }}
              className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
              aria-label="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Like Heart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(currentTrack);
              }}
              className={`p-2 rounded-full hover:bg-white/[0.06] transition cursor-pointer ${
                isLiked ? "text-[#E10600]" : "text-neutral-400 hover:text-white"
              }`}
              aria-label={isLiked ? "Unlike Track" : "Like Track"}
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  isLiked ? "fill-[#E10600] stroke-[#E10600]" : ""
                }`}
              />
            </button>

            {/* Expand Drawer Chevron */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayerOpen(true);
              }}
              className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.06] transition hidden md:inline-flex cursor-pointer"
              aria-label="Expand Player"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
