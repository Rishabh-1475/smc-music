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
    <div className="fixed bottom-[74px] left-3 right-3 z-40 max-w-md mx-auto pointer-events-none gpu-layer">
      {/* Suspended Pill Dock Floating Directly Above Bottom Nav */}
      <div
        onClick={() => togglePlayerOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Open Now Playing"
        className="pointer-events-auto w-full relative bg-[#14141B]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.08] px-3.5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.95)] cursor-pointer select-none transition-all duration-200 hover:border-[#D2FF1F]/40 overflow-hidden"
      >
        {/* Hairline Lime Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.05]">
          <div
            className="h-full bg-[#D2FF1F] transition-all duration-150"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Thumbnail + Details */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-neutral-900 shadow">
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
              <h5 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                {currentTrack.name}
              </h5>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5 font-medium">
                {currentTrack.primaryArtists}
              </p>
            </div>
          </div>

          {/* Controls: Like, Play/Pause, Skip */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(currentTrack);
              }}
              className={`p-2 rounded-full hover:bg-white/10 transition cursor-pointer ${
                isLiked ? "text-[#D2FF1F]" : "text-neutral-400 hover:text-white"
              }`}
              aria-label="Like"
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-[#D2FF1F]" : ""}`} />
            </button>

            {/* Lime Circular Play/Pause */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-9 h-9 rounded-full bg-[#D2FF1F] hover:bg-[#bceb15] text-black flex items-center justify-center transition shadow-md shadow-[#D2FF1F]/30 active:scale-95 cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black stroke-black" />
              ) : (
                <Play className="w-4 h-4 fill-black stroke-black ml-0.5" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                playNext();
              }}
              className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
