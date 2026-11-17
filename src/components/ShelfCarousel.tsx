"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

interface ShelfCarouselProps {
  title: string;
  subtitle?: string;
  songs: Song[];
  variant?: "square" | "circle";
}

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

export default function ShelfCarousel({
  title,
  subtitle,
  songs = [],
  variant = "square",
}: ShelfCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { currentTrack, isPlaying, playSong, togglePlay } = usePlayerStore();

  const isCircle = variant === "circle";

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -420 : 420;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!songs || songs.length === 0) return null;

  return (
    <section className="my-8">
      {/* Shelf Header & Navigation Chevrons */}
      <div className="flex items-end justify-between mb-3.5 px-4 md:px-8">
        <div>
          {subtitle && (
            <p className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
              {subtitle}
            </p>
          )}
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
            {title}
          </h2>
        </div>

        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={() => handleScroll("left")}
            className="w-8 h-8 rounded-full border border-white/10 hover:border-white/30 bg-[#212121] flex items-center justify-center text-neutral-300 hover:text-white transition active:scale-95 cursor-pointer"
            aria-label="Previous items"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="w-8 h-8 rounded-full border border-white/10 hover:border-white/30 bg-[#212121] flex items-center justify-center text-neutral-300 hover:text-white transition active:scale-95 cursor-pointer"
            aria-label="Next items"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto no-scrollbar scroll-smooth px-4 md:px-8 flex space-x-4 md:space-x-5 pb-2"
      >
        {songs.map((song) => {
          const isCurrent = currentTrack?.id === song.id;
          const isCardPlaying = isCurrent && isPlaying;

          return (
            <div
              key={song.id}
              onClick={() => {
                if (isCurrent) togglePlay();
                else playSong(song, songs);
              }}
              className={`group flex-shrink-0 cursor-pointer flex flex-col transition-all duration-300 ${
                isCircle
                  ? "w-32 sm:w-36 md:w-40 text-center items-center"
                  : "w-36 sm:w-44 md:w-48"
              }`}
            >
              {/* Media Thumbnail Container with Gradient Overlay */}
              <div
                className={`relative overflow-hidden bg-neutral-900 shadow-lg mb-2.5 ${
                  isCircle
                    ? "rounded-full aspect-square w-full ring-2 ring-transparent group-hover:ring-emerald-500/50"
                    : "rounded-2xl aspect-square w-full"
                }`}
              >
                <img
                  src={song.imageUrl || FALLBACK_VINYL}
                  alt={song.name}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                    isCurrent ? "ring-2 ring-emerald-500" : ""
                  }`}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                  }}
                />

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Hover / Active Tap Play Button */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                    isCardPlaying
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-xl shadow-emerald-500/40 transform transition hover:scale-110 active:scale-95">
                    {isCardPlaying ? (
                      <Pause className="w-5 h-5 fill-black stroke-black" />
                    ) : (
                      <Play className="w-5 h-5 fill-black stroke-black ml-0.5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Meta: Title & Subtitle with High Contrast */}
              <div className={`w-full ${isCircle ? "text-center" : "text-left"}`}>
                <h4
                  className={`text-sm font-semibold truncate transition-colors ${
                    isCurrent
                      ? "text-emerald-400 font-bold"
                      : "text-white group-hover:text-emerald-400"
                  }`}
                >
                  {song.name}
                </h4>
                <p className="text-xs text-neutral-400 truncate mt-0.5">
                  {song.primaryArtists}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Export alias for backward compatibility
export { ShelfCarousel as HorizontalShelf };
