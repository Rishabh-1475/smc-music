"use client";

import React from "react";
import { Play, Pause, Sparkles, Volume2, Disc, Radio } from "lucide-react";
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
  const { currentTrack, isPlaying, togglePlay, playSong } = usePlayerStore();

  const activeTrack = currentTrack || featuredTrack;
  const isCurrentActive =
    Boolean(currentTrack && activeTrack && currentTrack.id === activeTrack.id);
  const trackIsPlaying = isCurrentActive && isPlaying;

  const handleAction = () => {
    if (!activeTrack) return;
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

  if (!activeTrack) return null;

  return (
    <section className="relative px-3 sm:px-6 md:px-8 my-5 gpu-layer">
      {/* Asymmetric Magazine-Style Horizontal Showcase Card */}
      <div className="relative rhythmx-glass rounded-3xl overflow-hidden p-5 sm:p-7 md:p-9">
        {/* Soft Radial Ambient Background Glow */}
        <div
          className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 ${
            trackIsPlaying ? "bg-[#00FF87]/15 opacity-100" : "bg-[#7928CA]/15 opacity-60"
          }`}
        />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#121217]/80 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          {/* Left Side: 3D Vinyl Disc Art that Smoothly Rotates ONLY when Audio is Actively Playing */}
          <div className="relative group w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 flex-shrink-0 flex items-center justify-center">
            {/* Outer Vinyl Disc Body with Realistic Metallic Grooves */}
            <div
              className={`relative w-full h-full rounded-full metallic-grooves border-2 border-neutral-700/60 shadow-[0_15px_40px_rgba(0,0,0,0.95)] flex items-center justify-center ${
                trackIsPlaying ? "animate-vinyl" : ""
              }`}
            >
              {/* Center Record Label (Album Artwork) */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[#00FF87]/40 shadow-inner">
                <img
                  src={activeTrack.imageUrl || FALLBACK_VINYL}
                  alt={activeTrack.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                  }}
                />
                {/* Spindle Hole */}
                <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-[#050507] border-2 border-white/60 shadow-lg" />
              </div>
            </div>

            {/* Tap-to-play center hover overlay */}
            <button
              onClick={handleAction}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/70 border border-[#00FF87]/80 flex items-center justify-center text-white cursor-pointer transition-all duration-300 hover:scale-110 shadow-[0_0_20px_rgba(0,255,135,0.5)] z-20"
              aria-label={trackIsPlaying ? "Pause Track" : "Stream Track"}
            >
              {trackIsPlaying ? (
                <Pause className="w-6 h-6 fill-[#00FF87] text-[#00FF87]" />
              ) : (
                <Play className="w-6 h-6 fill-[#00FF87] text-[#00FF87] ml-0.5" />
              )}
            </button>
          </div>

          {/* Right Side: Oversized Modern Display Typography & Stream Now Action */}
          <div className="flex-1 text-center md:text-left min-w-0">
            {/* Lossless 320 KBPS Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87] text-xs font-mono font-bold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 fill-[#00FF87]" />
              <span>LOSSLESS 320 KBPS • TITANIUM-VOID</span>
            </div>

            {/* Oversized Modern Display Typography */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight truncate">
              {activeTrack.name}
            </h1>
            <p className="text-base sm:text-lg font-bold text-[#8F90A6] mt-1.5 truncate">
              {activeTrack.primaryArtists}
            </p>
            <p className="text-xs text-neutral-400 font-mono mt-1 truncate">
              {activeTrack.album || "Single"} • High-Fidelity Audio
            </p>

            {/* Bold One-Tap Kinetic "STREAM NOW" Pill Button */}
            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3.5">
              <button
                onClick={handleAction}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-[#00FF87] to-[#10B981] hover:opacity-95 text-black font-black text-sm tracking-wide flex items-center space-x-2.5 transition shadow-[0_0_25px_rgba(0,255,135,0.45)] active:scale-95 cursor-pointer"
              >
                {trackIsPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-black text-black" />
                    <span>PAUSE STREAM</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                    <span>STREAM NOW</span>
                  </>
                )}
              </button>

              <div className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full bg-[#121217] border border-white/10 text-xs font-mono font-semibold text-[#8F90A6]">
                <Volume2 className="w-4 h-4 text-[#00FF87]" />
                <span>320kbps Uncompressed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
