"use client";

import React, { useMemo } from "react";
import { Play, Pause, Sparkles, Volume2, Flame } from "lucide-react";
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
  const isCurrentActive = currentTrack && activeTrack && currentTrack.id === activeTrack.id;
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

  // Generate simulated dynamic soundwave bars
  const visualizerBars = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => {
      const heightMultiplier = Math.sin((i / 36) * Math.PI);
      const minHeight = 12;
      const maxHeight = 48;
      const calculated = Math.round(minHeight + heightMultiplier * (maxHeight - minHeight));
      return {
        id: i,
        baseHeight: calculated,
        delay: `${(i % 6) * 0.15}s`,
      };
    });
  }, []);

  if (!activeTrack) return null;

  return (
    <section className="relative px-4 md:px-8 my-6">
      {/* 3D Floating Hero Container */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121218] via-[#0E0E12] to-[#0A0A0E] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 md:p-8 backdrop-blur-2xl">
        {/* Holographic Ambient Glow Underlay */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#00FF87]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#7928CA]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          {/* Left: 3D Holographic Album Cover Art */}
          <div className="relative group w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-2xl overflow-hidden flex-shrink-0 shadow-[0_15px_35px_rgba(0,0,0,0.9)] border border-white/15 bg-neutral-900 transition-transform duration-300 hover:scale-[1.02]">
            <img
              src={activeTrack.imageUrl || FALLBACK_VINYL}
              alt={activeTrack.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
              }}
            />
            {/* Holographic Sheen Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/15 pointer-events-none" />

            {/* Overlay Play Button */}
            <button
              onClick={handleAction}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-[#00FF87]/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:scale-110 shadow-[0_0_20px_rgba(0,255,135,0.4)]"
              aria-label={trackIsPlaying ? "Pause Track" : "Play Track"}
            >
              {trackIsPlaying ? (
                <Pause className="w-6 h-6 fill-white text-white" />
              ) : (
                <Play className="w-6 h-6 fill-white text-white ml-0.5" />
              )}
            </button>
          </div>

          {/* Right: Track Information & Holographic Controls */}
          <div className="flex-1 text-center md:text-left min-w-0">
            {/* Tag */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87] text-[11px] font-bold tracking-wider uppercase mb-3 shadow-[0_0_10px_rgba(0,255,135,0.2)]">
              <Flame className="w-3.5 h-3.5 fill-[#00FF87]" />
              <span>RhythmX Featured Spot</span>
            </div>

            {/* Title & Artist */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight truncate">
              {activeTrack.name}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-neutral-300 mt-1 truncate">
              {activeTrack.primaryArtists}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5 truncate">
              {activeTrack.album || "Single"} • High-Fidelity 320kbps
            </p>

            {/* Play Button & Action Pills */}
            <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={handleAction}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00FF87] to-[#00F0FF] hover:opacity-95 text-black font-extrabold text-sm flex items-center space-x-2 transition shadow-[0_0_20px_rgba(0,255,135,0.4)] active:scale-95 cursor-pointer"
              >
                {trackIsPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-black text-black" />
                    <span>PAUSE STREAM</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black text-black" />
                    <span>PLAY NOW</span>
                  </>
                )}
              </button>

              <div className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-neutral-300">
                <Volume2 className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>Lossless Audio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Curved Sound Wave Equalizer Visualizer directly beneath hero card */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between gap-1 h-12 px-2 overflow-hidden">
            {visualizerBars.map((bar) => {
              const activeHeight = trackIsPlaying
                ? Math.min(48, Math.max(8, bar.baseHeight + (bar.id % 2 === 0 ? 10 : -6)))
                : 6;

              return (
                <div
                  key={bar.id}
                  className="flex-1 bg-gradient-to-t from-[#00FF87] via-[#00F0FF] to-[#7928CA] rounded-full transition-all duration-300 opacity-80"
                  style={{
                    height: `${activeHeight}px`,
                    animationDelay: bar.delay,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
