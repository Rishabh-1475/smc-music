"use client";

import React from "react";
import { Play, Pause, SkipBack, SkipForward, Heart } from "lucide-react";
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
  const isTitleLong = (currentTrack.name || "").length > 25;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-6 pb-3 pointer-events-none">
      {/* Floating Curved Dock Suspended Above Bottom Edge */}
      <div
        onClick={() => togglePlayerOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Open Full Player"
        className="pointer-events-auto max-w-5xl mx-auto relative glass-card rounded-2xl border border-white/10 px-4 py-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] cursor-pointer select-none transition-all duration-300 hover:border-[#00FF87]/40 overflow-hidden"
      >
        {/* Thin 2px Gradient Progress Scrubber Across Top Edge */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-neutral-900/80">
          <div
            className="h-full bg-gradient-to-r from-[#00FF87] via-[#00F0FF] to-[#7928CA] transition-all duration-150 shadow-[0_0_10px_#00FF87]"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: 48x48 Rounded-lg Spinning Vinyl Artwork or Cover with Ambient Glow */}
          <div className="flex items-center space-x-3.5 min-w-0 flex-1">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900 shadow-[0_4px_15px_rgba(0,255,135,0.25)] border border-white/15">
              <img
                src={currentTrack.imageUrl || FALLBACK_VINYL}
                alt={currentTrack.name}
                className={`w-full h-full object-cover ${
                  isPlaying ? "animate-spin-slow" : ""
                }`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                }}
              />
              {/* Center Vinyl Spindle Hole */}
              <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-black border border-white/40 shadow-inner" />
            </div>

            {/* Center: Track Title with Auto-marquee / Truncate + Artist Name */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="overflow-hidden whitespace-nowrap">
                <h5
                  className={`text-sm font-bold text-white leading-tight ${
                    isTitleLong ? "hover:animate-marquee" : ""
                  }`}
                >
                  {currentTrack.name}
                </h5>
              </div>
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                {currentTrack.primaryArtists}
              </p>
            </div>
          </div>

          {/* Right: Tactile Transport Buttons (Previous, Play/Pause circle button in neon emerald, Next, Like heart) */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
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

            {/* Play/Pause Circle Button in Neon Emerald */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00FF87] to-[#10B981] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-[0_0_16px_rgba(0,255,135,0.45)] cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black text-black" />
              ) : (
                <Play className="w-5 h-5 fill-black text-black ml-0.5" />
              )}
            </button>

            {/* Next */}
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
