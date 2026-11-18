"use client";

import React, { useMemo } from "react";
import { Play, Pause, Sparkles, Volume2, Flame, Disc } from "lucide-react";
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

  // 36-bar dynamic equalizer heights for SVG visualizer
  const soundwavePoints = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const envelope = Math.sin((i / 40) * Math.PI);
      const minH = 8;
      const maxH = 52;
      const height = Math.round(minH + envelope * (maxH - minH));
      return {
        id: i,
        baseH: height,
      };
    });
  }, []);

  if (!activeTrack) return null;

  return (
    <section className="relative px-4 md:px-8 my-6">
      {/* 3D Floating Showcase Centerpiece */}
      <div className="relative glass-card hero-glow overflow-hidden p-6 md:p-8 backdrop-blur-2xl">
        {/* Holographic Ambient Glow Mesh */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#00FF87]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#7928CA]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          {/* Centered 3D Floating Showcase Card with Rounded-3xl Album Cover & Tilt */}
          <div className="relative group w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-3xl overflow-hidden flex-shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/15 bg-neutral-900 transition-all duration-500 hover:scale-[1.03] hover:rotate-1">
            <img
              src={activeTrack.imageUrl || FALLBACK_VINYL}
              alt={activeTrack.name}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                trackIsPlaying ? "scale-105" : ""
              }`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
              }}
            />

            {/* Holographic Edge Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/20 pointer-events-none" />

            {/* Prominent One-Tap Play/Pause Button Overlay */}
            <button
              onClick={handleAction}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-[#00FF87]/60 flex items-center justify-center text-white transition-all duration-300 cursor-pointer hover:scale-110 shadow-[0_0_25px_rgba(0,255,135,0.5)] group-hover:opacity-100 opacity-90"
              aria-label={trackIsPlaying ? "Pause Track" : "Play Track"}
            >
              {trackIsPlaying ? (
                <Pause className="w-7 h-7 fill-[#00FF87] text-[#00FF87]" />
              ) : (
                <Play className="w-7 h-7 fill-[#00FF87] text-[#00FF87] ml-1" />
              )}
            </button>
          </div>

          {/* Track Details & High-Fidelity Badge */}
          <div className="flex-1 text-center md:text-left min-w-0">
            {/* High Fidelity 320 KBPS Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87] text-xs font-bold tracking-wider uppercase mb-3.5 shadow-[0_0_12px_rgba(0,255,135,0.25)]">
              <Sparkles className="w-3.5 h-3.5 fill-[#00FF87]" />
              <span>High Fidelity 320 KBPS</span>
            </div>

            {/* Bold Display Font Title */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight truncate">
              {activeTrack.name}
            </h1>
            <p className="text-base sm:text-lg font-semibold text-neutral-300 mt-1.5 truncate">
              {activeTrack.primaryArtists}
            </p>
            <p className="text-xs text-neutral-400 mt-1 truncate">
              {activeTrack.album || "Single"} • {activeTrack.year || "2026"}
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3.5">
              <button
                onClick={handleAction}
                className="px-7 py-3 rounded-full bg-gradient-to-r from-[#00FF87] to-[#10B981] hover:opacity-95 text-black font-extrabold text-sm flex items-center space-x-2.5 transition shadow-[0_0_22px_rgba(0,255,135,0.45)] active:scale-95 cursor-pointer"
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

              <div className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-neutral-300">
                <Volume2 className="w-4 h-4 text-[#00FF87]" />
                <span>Lossless 320kbps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Animated SVG Soundwave Equalizer Bar pulsing with Neon Lime & Electric Purple */}
        <div className="mt-7 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between gap-1.5 h-14 px-2 overflow-hidden">
            {soundwavePoints.map((point) => {
              const dynamicHeight = trackIsPlaying
                ? Math.min(54, Math.max(8, point.baseH + (point.id % 3 === 0 ? 12 : -8)))
                : 6;

              return (
                <div
                  key={point.id}
                  className="flex-1 rounded-full transition-all duration-300"
                  style={{
                    height: `${dynamicHeight}px`,
                    background:
                      "linear-gradient(to top, #00FF87 0%, #00F0FF 50%, #7928CA 100%)",
                    boxShadow: trackIsPlaying
                      ? "0 0 8px rgba(0, 255, 135, 0.4)"
                      : "none",
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
