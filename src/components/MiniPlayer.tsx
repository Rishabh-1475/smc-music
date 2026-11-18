"use client";

import React from "react";
import { Play, Pause, SkipForward, Shuffle, Heart, ChevronUp } from "lucide-react";
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
    toggleShuffle,
    isShuffled,
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
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0D]/90 backdrop-blur-2xl border-t border-white/10 px-4 md:px-8 py-2.5 pb-safe cursor-pointer transition-all duration-200 hover:bg-[#121216] shadow-[0_-10px_35px_rgba(0,0,0,0.9)] select-none"
    >
      {/* Hairline progress bar along the very top border */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-neutral-900">
        <div
          className="h-full bg-gradient-to-r from-[#00FF87] to-[#00F0FF] transition-all duration-150 shadow-[0_0_8px_#00FF87]"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Track Thumbnail, Title, and Artist with subtle ambient glow */}
        <div className="flex items-center space-x-3.5 min-w-0 flex-1">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900 shadow-[0_4px_15px_rgba(0,0,0,0.8)] border border-white/10 group">
            <img
              src={currentTrack.imageUrl || FALLBACK_VINYL}
              alt={currentTrack.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
              }}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                <span className="w-1.5 h-1.5 bg-[#00FF87] rounded-full animate-ping" />
              </div>
            )}
          </div>
          <div className="truncate min-w-0 flex-1">
            <h5 className="text-sm font-bold text-white truncate leading-tight">
              {currentTrack.name}
            </h5>
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {currentTrack.primaryArtists}
            </p>
          </div>
        </div>

        {/* 3D Tactile Control Buttons (Shuffle, Like, Play/Pause, Skip Next, Expand) */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Shuffle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleShuffle();
            }}
            className={`p-2 rounded-full hover:bg-white/10 transition hidden sm:inline-flex cursor-pointer ${
              isShuffled ? "text-[#00FF87]" : "text-neutral-400 hover:text-white"
            }`}
            aria-label="Toggle Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Like Button */}
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

          {/* 3D Tactile Play/Pause Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00FF87] to-[#00F0FF] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-[0_0_15px_rgba(0,255,135,0.4)] cursor-pointer"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black text-black" />
            ) : (
              <Play className="w-5 h-5 fill-black text-black ml-0.5" />
            )}
          </button>

          {/* Skip Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playNext();
            }}
            className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Next Track"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Expand Drawer Button */}
          <button
            onClick={() => togglePlayerOpen(true)}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition hidden md:inline-flex cursor-pointer"
            aria-label="Expand Player"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
