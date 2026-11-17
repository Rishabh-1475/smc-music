"use client";

import React from "react";
import { Play, Pause, SkipForward, Heart, ChevronUp } from "lucide-react";
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
    togglePlayerOpen,
    toggleLike,
    likedSongIds,
    isPlayerOpen,
  } = usePlayerStore();

  if (!currentTrack || isPlayerOpen) return null;

  const isLiked = Boolean(likedSongIds[currentTrack.id]);

  return (
    <div
      onClick={() => togglePlayerOpen(true)}
      role="button"
      tabIndex={0}
      aria-label="Open Full Player"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d0d]/95 backdrop-blur-2xl border-t border-white/10 px-4 md:px-8 py-2 pb-safe cursor-pointer transition-all duration-200 hover:bg-[#161616] shadow-[0_-8px_30px_rgba(0,0,0,0.8)] select-none"
    >
      {/* Hairline progress bar along the very top border showing current stream percentage */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-neutral-800/80">
        <div
          className="h-full bg-emerald-500 transition-all duration-150"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Track Thumbnail, Title, and Artist */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900 shadow-md">
            <img
              src={currentTrack.imageUrl || FALLBACK_VINYL}
              alt={currentTrack.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
              }}
            />
          </div>
          <div className="truncate min-w-0 flex-1">
            <h5 className="text-sm font-semibold text-white truncate">
              {currentTrack.name}
            </h5>
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {currentTrack.primaryArtists}
            </p>
          </div>
        </div>

        {/* Right Controls: Like, Play/Pause, Next, Expand */}
        <div className="flex items-center space-x-2 sm:space-x-3.5 flex-shrink-0">
          {/* Like Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(currentTrack);
            }}
            className={`p-2 rounded-full hover:bg-neutral-800 transition hidden sm:inline-flex ${
              isLiked ? "text-emerald-400" : "text-neutral-400 hover:text-white"
            }`}
            aria-label={isLiked ? "Unlike Track" : "Like Track"}
          >
            <Heart
              className={`w-5 h-5 ${isLiked ? "fill-emerald-400 stroke-emerald-400" : ""}`}
            />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg cursor-pointer"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black text-black" />
            ) : (
              <Play className="w-5 h-5 fill-black text-black ml-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playNext();
            }}
            className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800 transition active:scale-95 cursor-pointer"
            aria-label="Next Track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Expand Chevron Icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayerOpen(true);
            }}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            aria-label="Expand Player"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
