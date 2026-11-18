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
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white mt-0.5">
            {title}
          </h2>
        </div>

        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={() => handleScroll("left")}
            className="w-8 h-8 rounded-full border border-white/10 hover:border-white/30 bg-[#141418] flex items-center justify-center text-neutral-300 hover:text-white transition active:scale-95 cursor-pointer"
            aria-label="Previous items"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="w-8 h-8 rounded-full border border-white/10 hover:border-white/30 bg-[#141418] flex items-center justify-center text-neutral-300 hover:text-white transition active:scale-95 cursor-pointer"
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
                className={`relative overflow-hidden bg-neutral-900 shadow-xl mb-2.5 transition-transform duration-300 group-hover:scale-[1.03] ${
                  isCircle
                    ? "rounded-full aspect-square w-full ring-2 ring-transparent group-hover:ring-[#00FF87]/50"
                    : "rounded-2xl aspect-square w-full border border-white/10 group-hover:border-[#00FF87]/40 shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
                }`}
              >
                <img
                  src={song.imageUrl || FALLBACK_VINYL}
                  alt={song.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                  }}
                />

                {/* Ambient Hover Play Button Overlay */}
                <div
                  className={`absolute inset-0 bg-black/55 flex items-center justify-center transition-opacity duration-200 ${
                    isCardPlaying
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00FF87] to-[#00F0FF] flex items-center justify-center text-black shadow-[0_0_15px_rgba(0,255,135,0.4)]">
                    {isCardPlaying ? (
                      <Pause className="w-6 h-6 fill-black text-black" />
                    ) : (
                      <Play className="w-6 h-6 fill-black text-black ml-0.5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Artist */}
              <h3
                className={`text-sm font-semibold truncate ${
                  isCurrent ? "text-[#00FF87]" : "text-white group-hover:text-white"
                } ${isCircle ? "w-full" : ""}`}
              >
                {song.name}
              </h3>
              <p
                className={`text-xs text-neutral-400 truncate mt-0.5 ${
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
