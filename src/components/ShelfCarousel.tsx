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
            <p className="text-[10px] font-mono font-bold text-[#8A8A93] tracking-wider uppercase">
              {subtitle}
            </p>
          )}
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white mt-0.5">
            {title}
          </h2>
        </div>

        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={() => handleScroll("left")}
            className="w-8 h-8 rounded-full border border-white/[0.08] hover:border-white/20 bg-[#121216] flex items-center justify-center text-neutral-300 hover:text-white transition active:scale-95 cursor-pointer"
            aria-label="Previous items"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="w-8 h-8 rounded-full border border-white/[0.08] hover:border-white/20 bg-[#121216] flex items-center justify-center text-neutral-300 hover:text-white transition active:scale-95 cursor-pointer"
            aria-label="Next items"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto no-scrollbar scroll-smooth px-4 md:px-8 flex space-x-4 md:space-x-5 pb-2 smooth-scroll"
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
              className={`group flex-shrink-0 cursor-pointer flex flex-col transition-all duration-200 select-none ${
                isCircle
                  ? "w-32 sm:w-36 md:w-40 text-center items-center"
                  : "w-36 sm:w-40 md:w-44"
              }`}
            >
              {/* Media Thumbnail Container with Precision Borders */}
              <div
                className={`relative overflow-hidden bg-[#08080A] shadow-xl mb-2.5 transition-transform duration-200 group-hover:scale-[1.02] ${
                  isCircle
                    ? "rounded-full aspect-square w-full ring-2 ring-transparent group-hover:ring-[#E10600]/60"
                    : "rounded-xl aspect-square w-full border border-white/[0.08] group-hover:border-[#E10600]/50 shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
                } ${isCurrent ? "border-[#E10600] shadow-[0_0_15px_rgba(225,6,0,0.35)]" : ""}`}
              >
                <img
                  src={song.imageUrl || FALLBACK_VINYL}
                  alt={song.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                  }}
                />

                {/* Ambient Hover Play Button Overlay in Solid Crimson */}
                <div
                  className={`absolute inset-0 bg-black/55 flex items-center justify-center transition-opacity duration-200 ${
                    isCardPlaying
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-[#E10600] flex items-center justify-center text-white shadow-lg shadow-[#E10600]/40 transition-transform active:scale-90">
                    {isCardPlaying ? (
                      <Pause className="w-5 h-5 fill-white text-white" />
                    ) : (
                      <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Artist */}
              <h3
                className={`text-xs sm:text-sm font-bold truncate ${
                  isCurrent ? "text-[#E10600]" : "text-white"
                } ${isCircle ? "w-full" : ""}`}
              >
                {song.name}
              </h3>
              <p
                className={`text-[11px] text-[#8A8A93] truncate mt-0.5 font-medium ${
                  isCircle ? "w-full" : ""
                }`}
              >
                {song.primaryArtists}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
