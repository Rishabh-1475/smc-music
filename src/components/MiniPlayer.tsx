"use client";

import React from "react";
import { Play, Pause, SkipForward, Heart, Maximize2 } from "lucide-react";
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
    isLiked,
    isPlayerOpen,
  } = usePlayerStore();

  if (!currentTrack || isPlayerOpen) return null;

  const liked = isLiked[currentTrack.id];

  return (
    <div
      onClick={() => togglePlayerOpen(true)}
      role="button"
      tabIndex={0}
      aria-label="Open Full Player"
      className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-2xl border-t border-white/10 px-4 md:px-8 py-2 pb-safe cursor-pointer transition-all duration-300 hover:bg-neutral-900/95 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
    >
      {/* Subtle Progress Bar across the Top Border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-neutral-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Track Artwork & Meta */}
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

        {/* Controls: Like, Play/Pause, Next, Expand */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(currentTrack.id);
            }}
            className={`p-2 rounded-full hover:bg-neutral-800 transition hidden sm:inline-flex ${
              liked ? "text-emerald-400" : "text-neutral-400 hover:text-white"
            }`}
            aria-label="Like Track"
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-emerald-400" : ""}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black text-black" />
            ) : (
              <Play className="w-5 h-5 fill-black text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              playNext();
            }}
            className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800 transition active:scale-95"
            aria-label="Next Track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayerOpen(true);
            }}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition hidden md:inline-flex"
            aria-label="Expand Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
