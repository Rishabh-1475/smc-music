"use client";

import React from "react";
import { Play, Pause, SkipForward, Heart } from "lucide-react";
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
      aria-label="Open Now Playing"
      className="fixed bottom-[68px] left-3 right-3 max-w-[406px] mx-auto z-50 rounded-2xl bg-[#141418]/95 backdrop-blur-md border border-white/10 px-3 py-2 shadow-2xl select-none cursor-pointer transition-all duration-200 hover:border-[#D4FF00]/40 overflow-hidden gpu-layer"
    >
      {/* Hairline Lime Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.05]">
        <div
          className="h-full bg-[#D4FF00] transition-all duration-150"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Thumbnail + Details */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-neutral-900 shadow">
            <img
              src={currentTrack.imageUrl || FALLBACK_VINYL}
              alt={currentTrack.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
              }}
            />
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <h5 className="text-xs font-bold text-white truncate leading-tight">
              {currentTrack.name}
            </h5>
            <p className="text-[10px] text-gray-400 truncate mt-0.5 font-medium">
              {currentTrack.primaryArtists}
            </p>
          </div>
        </div>

        {/* Controls: Like, Play/Pause, Skip */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(currentTrack);
            }}
            className={`p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer ${
              isLiked ? "text-[#D4FF00]" : "text-gray-400 hover:text-white"
            }`}
            aria-label="Like"
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-[#D4FF00]" : ""}`} />
          </button>

          {/* Lime Circular Play/Pause */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-8 h-8 rounded-full bg-[#D4FF00] hover:bg-[#bceb15] text-black flex items-center justify-center transition shadow-md shadow-[#D4FF00]/30 active:scale-95 cursor-pointer"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-black stroke-black" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-black stroke-black ml-0.5" />
            )}
          </button>

          {/* Skip Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playNext();
            }}
            className="p-1.5 text-gray-400 hover:text-white transition cursor-pointer"
            aria-label="Next song"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
