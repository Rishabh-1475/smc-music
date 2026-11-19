"use client";

import React, { useRef } from "react";
import { Play, Pause, Heart, ArrowDownToLine, MoreHorizontal } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

interface HeroVisualizerProps {
  featuredTrack?: Song | null;
  onPlay?: (track: Song) => void;
}

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

const FALLBACK_SUNSET_GIRL =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80";

export default function HeroVisualizer({
  featuredTrack,
  onPlay,
}: HeroVisualizerProps) {
  const { currentTrack, isPlaying, togglePlay, playSong, toggleLike, likedSongIds } =
    usePlayerStore();
  const carouselRef = useRef<HTMLDivElement>(null);

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
    <section className="w-full my-2 select-none gpu-layer">
      {/* Section Header matching Reference 1 & 3 */}
      <div className="px-4 pb-2">
        <h2 className="text-sm font-bold text-white tracking-tight">
          Curated &amp; trending
        </h2>
      </div>

      {/* Horizontal Carousel with peek matching Reference mockups */}
      <div
        ref={carouselRef}
        className="flex gap-3 overflow-x-auto no-scrollbar px-4 snap-x snap-mandatory scroll-smooth"
      >
        {/* Card 1: Lavender Pastel Theme matching Reference 3 (Left Screen) */}
        <div className="w-[88%] min-w-[310px] max-w-[350px] snap-center relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#DEC0FD] via-[#CCA2FD] to-[#B983FA] p-5 h-48 flex justify-between items-center shadow-xl flex-shrink-0">
          {/* Subtle ambient light */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />

          {/* Left Content (65% width) */}
          <div className="relative z-10 w-[63%] flex flex-col justify-between h-full pr-1">
            <div>
              {/* Tag: Tiny frosted badge */}
              <span className="inline-block text-[9px] font-bold tracking-wider text-[#240B48] bg-black/10 backdrop-blur-md px-2.5 py-0.5 rounded-full uppercase">
                DISCOVER WEEKLY
              </span>

              {/* Title */}
              <h3 className="text-base font-extrabold text-[#180828] line-clamp-1 mt-2 leading-tight">
                {activeTrack.name}
              </h3>

              {/* Description */}
              <p className="text-[11px] font-medium text-[#3A1860] line-clamp-2 mt-1 leading-relaxed">
                The original slow instrumental best playlists.
              </p>
            </div>

            {/* Control Row matching Reference 3 */}
            <div className="flex items-center gap-3 mt-3">
              {/* Circular Play Button: 36px dark circle with white play triangle */}
              <button
                onClick={handleAction}
                className="w-9 h-9 rounded-full bg-[#180828] hover:bg-black active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform cursor-pointer flex-shrink-0"
                aria-label={trackIsPlaying ? "Pause" : "Play"}
              >
                {trackIsPlaying ? (
                  <Pause className="w-4 h-4 fill-white stroke-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white stroke-white ml-0.5" />
                )}
              </button>

              {/* Heart Icon (♡) */}
              <button
                onClick={() => toggleLike(activeTrack)}
                className="text-[#240B48] hover:text-black transition active:scale-95 cursor-pointer"
                aria-label="Like"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isLiked ? "fill-[#240B48] text-[#240B48]" : ""
                  }`}
                />
              </button>

              {/* Download Icon */}
              <button
                onClick={() => togglePlay()}
                className="text-[#240B48] hover:text-black transition active:scale-95 cursor-pointer"
                aria-label="Download"
              >
                <ArrowDownToLine className="w-4 h-4" />
              </button>

              {/* Three Dots (···) */}
              <button
                onClick={() => togglePlay()}
                className="text-[#240B48] hover:text-black transition active:scale-95 cursor-pointer"
                aria-label="Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Image (35% width): Crisp 110x110 album cover with rounded-2xl */}
          <div className="relative z-10 w-[110px] h-[110px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex-shrink-0 bg-neutral-900">
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

        {/* Card 2: Sunset Orange/Peach Theme matching Reference 1 */}
        <div className="w-[88%] min-w-[310px] max-w-[350px] snap-center relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FED7AA] via-[#FDBA74] to-[#FB923C] p-5 h-48 flex justify-between items-center shadow-xl flex-shrink-0">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />

          {/* Left Content */}
          <div className="relative z-10 w-[63%] flex flex-col justify-between h-full pr-1">
            <div>
              <span className="inline-block text-[9px] font-bold tracking-wider text-[#3D1A05] bg-black/10 backdrop-blur-md px-2.5 py-0.5 rounded-full uppercase">
                SOUNDTRACK OF THE WEEK
              </span>

              <h3 className="text-base font-extrabold text-[#230F03] line-clamp-1 mt-2 leading-tight">
                Fresh songs. Bold vibes.
              </h3>

              <p className="text-[11px] font-medium text-[#4D230A] line-clamp-2 mt-1 leading-relaxed">
                Made for your mood. Curated for locked-in flow.
              </p>
            </div>

            {/* Control Row */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={handleAction}
                className="w-9 h-9 rounded-full bg-[#230F03] hover:bg-black active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform cursor-pointer flex-shrink-0"
                aria-label={trackIsPlaying ? "Pause" : "Play"}
              >
                {trackIsPlaying ? (
                  <Pause className="w-4 h-4 fill-white stroke-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white stroke-white ml-0.5" />
                )}
              </button>

              <button
                onClick={() => toggleLike(activeTrack)}
                className="text-[#3D1A05] hover:text-black transition active:scale-95 cursor-pointer"
                aria-label="Like"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isLiked ? "fill-[#3D1A05] text-[#3D1A05]" : ""
                  }`}
                />
              </button>

              <button
                onClick={() => togglePlay()}
                className="text-[#3D1A05] hover:text-black transition active:scale-95 cursor-pointer"
                aria-label="Download"
              >
                <ArrowDownToLine className="w-4 h-4" />
              </button>

              <button
                onClick={() => togglePlay()}
                className="text-[#3D1A05] hover:text-black transition active:scale-95 cursor-pointer"
                aria-label="Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative z-10 w-[110px] h-[110px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex-shrink-0 bg-neutral-900">
            <img
              src={FALLBACK_SUNSET_GIRL}
              alt="Soundtrack of the week"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
