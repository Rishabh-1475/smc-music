"use client";

import React from "react";
import { Play, Pause, Volume2, Sparkles, Disc } from "lucide-react";
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
  const { currentTrack, isPlaying, progress, togglePlay, playSong } =
    usePlayerStore();

  const activeTrack = currentTrack || featuredTrack;
  const isCurrentActive = Boolean(
    currentTrack && activeTrack && currentTrack.id === activeTrack.id
  );
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
      {/* Sleek BMW M-Performance Dark Luxury Showcase Card */}
      <div className="relative m-card rounded-2xl overflow-hidden p-5 sm:p-7 md:p-8 bg-[#111116] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
        {/* Precision Progress Line in Crimson Red along the top edge */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.05]">
          <div
            className="h-full bg-[#E10600] transition-all duration-200"
            style={{
              width: `${Math.max(0, Math.min(100, isCurrentActive ? progress : 0))}%`,
            }}
          />
        </div>

        {/* Ambient Subtle Burgundy Undertone */}
        <div className="absolute -right-24 -bottom-24 w-80 h-80 bg-[#4A0000]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#16161C]/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Large High-Definition Album Art with Precision 1px Border */}
          <div className="relative group w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 rounded-xl overflow-hidden border border-white/10 shadow-2xl flex-shrink-0 bg-[#08080A]">
            <img
              src={activeTrack.imageUrl || FALLBACK_VINYL}
              alt={activeTrack.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
              }}
            />

            {/* Direct Tap Play Overlay */}
            <button
              onClick={handleAction}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white flex items-center justify-center shadow-lg shadow-[#E10600]/40 transition-transform active:scale-95 cursor-pointer"
              aria-label={trackIsPlaying ? "Pause Track" : "Play Track"}
            >
              {trackIsPlaying ? (
                <Pause className="w-6 h-6 fill-white text-white" />
              ) : (
                <Play className="w-6 h-6 fill-white text-white ml-0.5" />
              )}
            </button>
          </div>

          {/* Industrial Typography & Minimalist Action Deck */}
          <div className="flex-1 text-center md:text-left min-w-0">
            {/* Precision Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-[#16161C] border border-white/[0.08] text-xs font-mono font-medium text-[#8A8A93] uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
              <span>BMW M-PERFORMANCE AUDIO</span>
            </div>

            {/* Pure Industrial Typography */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight truncate">
              {activeTrack.name}
            </h1>
            <p className="text-base sm:text-lg font-medium text-[#8A8A93] mt-1.5 truncate">
              {activeTrack.primaryArtists}
            </p>
            <p className="text-xs text-neutral-500 font-mono mt-1 truncate">
              {activeTrack.album || "Single"} • High-Definition Stream
            </p>

            {/* Action Buttons: Solid Crimson "PLAY NOW" + "LOSSLESS AUDIO" */}
            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={handleAction}
                className="px-7 py-3 rounded-xl bg-[#E10600] hover:bg-[#C20500] text-white font-bold text-sm tracking-wide flex items-center space-x-2.5 transition active:scale-95 shadow-[0_4px_16px_rgba(225,6,0,0.35)] cursor-pointer"
              >
                {trackIsPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-white text-white" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    <span>PLAY NOW</span>
                  </>
                )}
              </button>

              <div className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-[#16161C] border border-white/[0.08] text-xs font-mono font-medium text-[#8A8A93]">
                <Volume2 className="w-4 h-4 text-[#E10600]" />
                <span>LOSSLESS AUDIO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
