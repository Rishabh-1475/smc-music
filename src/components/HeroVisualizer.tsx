"use client";

import React from "react";
import { Play, Pause, Heart, Plus, MoreHorizontal } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

interface HeroVisualizerProps {
  featuredTrack?: Song | null;
  onPlay?: (track: Song) => void;
}

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

export default function HeroVisualizer({
  featuredTrack,
  onPlay,
}: HeroVisualizerProps) {
  const { currentTrack, isPlaying, togglePlay, playSong, toggleLike, likedSongIds } =
    usePlayerStore();

  const activeTrack = currentTrack || featuredTrack;
  const isCurrentActive = Boolean(
    currentTrack && activeTrack && currentTrack.id === activeTrack.id
  );
  const trackIsPlaying = isCurrentActive && isPlaying;

  if (!activeTrack) return null;

  const isLiked = Boolean(likedSongIds[activeTrack.id]);

  const handleAction = () => {
    if (isCurrentActive) {
      togglePlay();
    } else {
      if (onPlay) {
        onPlay(activeTrack);
      } else {
        playSong(activeTrack);
      }
    }
  };

  return (
    <section className="px-4 md:px-8 my-5 gpu-layer">
      {/* Section Title matching Reference 1 */}
      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3">
        Curated &amp; trending
      </h2>

      {/* Featured Hero Card with Neon Purple-to-Dark Gradient */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#4c1d95] via-[#2e1065] to-[#0A0A0C] border border-white/10 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Soft Ambient Radiance */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-[#7c3aed]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-[#D2FF1F]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Side Content */}
        <div className="relative z-10 flex-1 min-w-0 text-left w-full">
          {/* Discover Weekly Pill */}
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-mono font-semibold uppercase text-white/90 tracking-wider mb-2.5">
            Discover weekly
          </span>

          {/* Heading */}
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight truncate">
            {activeTrack.name}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 font-medium mt-1 truncate">
            {activeTrack.primaryArtists}
          </p>
          <p className="text-xs text-neutral-400 mt-2 font-normal">
            The original sound curated for your taste.
          </p>

          {/* Action Row: Circular Lime Play Button + Heart + Plus + More */}
          <div className="flex items-center space-x-3 mt-6">
            {/* Circular High-Contrast Lime Play Button */}
            <button
              onClick={handleAction}
              className="w-12 h-12 rounded-full bg-[#D2FF1F] hover:bg-[#bceb15] text-black flex items-center justify-center shadow-lg shadow-[#D2FF1F]/30 active:scale-95 transition cursor-pointer"
              aria-label={trackIsPlaying ? "Pause" : "Play"}
            >
              {trackIsPlaying ? (
                <Pause className="w-5 h-5 fill-black stroke-black" />
              ) : (
                <Play className="w-5 h-5 fill-black stroke-black ml-0.5" />
              )}
            </button>

            {/* Heart (Like) Button */}
            <button
              onClick={() => toggleLike(activeTrack)}
              className={`w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center transition active:scale-95 cursor-pointer ${
                isLiked ? "text-[#D2FF1F]" : "text-white"
              }`}
              aria-label="Like track"
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-[#D2FF1F]" : ""}`} />
            </button>

            {/* Plus (Queue) Button */}
            <button
              onClick={() => playSong(activeTrack)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white transition active:scale-95 cursor-pointer"
              aria-label="Add to queue"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* More Options */}
            <button
              onClick={() => togglePlay()}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white transition active:scale-95 cursor-pointer"
              aria-label="Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side Visual: HD Artwork Visual */}
        <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex-shrink-0 bg-neutral-900">
          <img
            src={activeTrack.imageUrl || FALLBACK_VINYL}
            alt={activeTrack.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
            }}
          />
        </div>
      </div>
    </section>
  );
}
