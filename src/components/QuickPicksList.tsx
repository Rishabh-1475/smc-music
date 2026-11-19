"use client";

import React from "react";
import { Play, Pause, Flame, Sparkles, Compass } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

interface QuickPicksListProps {
  title?: string;
  subtitle?: string;
  songs: Song[];
  speedDialSongs?: Song[];
}

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

export default function QuickPicksList({
  title = "Trending Now",
  subtitle = "CURATED CHARTS",
  songs = [],
  speedDialSongs = [],
}: QuickPicksListProps) {
  const { currentTrack, isPlaying, playSong, togglePlay, getFrequentlyPlayed } =
    usePlayerStore();

  const frequentlyPlayed = getFrequentlyPlayed();

  if (!songs || songs.length === 0) return null;

  // Slices for the 3 distinct dynamic shelves
  const trendingNow = songs.slice(0, 12);
  const heavyRotation =
    frequentlyPlayed.length > 0
      ? frequentlyPlayed
      : speedDialSongs.length > 0
      ? speedDialSongs
      : songs.slice(4, 16);
  const relatedTaste =
    songs.length > 12 ? songs.slice(12, 24) : songs.slice(0, 10);

  const renderShelf = (
    shelfTitle: string,
    shelfSubtitle: string,
    shelfIcon: React.ReactNode,
    trackList: Song[]
  ) => {
    if (!trackList || trackList.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center space-x-2.5 mb-3.5 px-3 sm:px-6 md:px-8">
          <div className="w-6 h-6 rounded-md bg-[#16161C] border border-white/[0.08] flex items-center justify-center text-[#E10600]">
            {shelfIcon}
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-[#8A8A93] uppercase tracking-wider">
              {shelfSubtitle}
            </p>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              {shelfTitle}
            </h2>
          </div>
        </div>

        {/* Horizontal Scroll Shelf with Generous Spacing and 140x140 Square Cards */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-3 sm:px-6 md:px-8 pb-2 smooth-scroll">
          {trackList.map((song) => {
            const isCurrent = currentTrack?.id === song.id;
            const isCardPlaying = isCurrent && isPlaying;

            return (
              <div
                key={`${shelfTitle}-${song.id}`}
                onClick={() => {
                  if (isCurrent) togglePlay();
                  else playSong(song, trackList);
                }}
                className={`group relative flex-shrink-0 w-[140px] m-card p-2 rounded-xl cursor-pointer transition-all duration-200 select-none ${
                  isCurrent
                    ? "border-[#E10600] shadow-[0_4px_20px_rgba(225,6,0,0.35)] bg-[#16161C]"
                    : "border-white/[0.08] hover:border-white/20"
                }`}
              >
                {/* 140x140 Square Album Art with Crisp 12px Rounded Corners */}
                <div className="relative w-[124px] h-[124px] rounded-xl overflow-hidden bg-[#08080A] shadow-md">
                  <img
                    src={song.imageUrl || FALLBACK_VINYL}
                    alt={song.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                    }}
                  />

                  {/* Instant Tap Feedback & Ambient Play Overlay */}
                  <div
                    className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
                      isCardPlaying
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#E10600] text-white flex items-center justify-center shadow-lg shadow-[#E10600]/40 transition-transform active:scale-90">
                      {isCardPlaying ? (
                        <Pause className="w-4 h-4 fill-white text-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Typography: Song Title in Bold White, Artists in Muted Smoke Grey */}
                <div className="mt-2.5 px-0.5">
                  <h4
                    className={`text-xs font-bold truncate leading-tight ${
                      isCurrent ? "text-[#E10600]" : "text-white"
                    }`}
                  >
                    {song.name}
                  </h4>
                  <p className="text-[11px] text-[#8A8A93] truncate mt-0.5 font-medium">
                    {song.primaryArtists}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="my-6 gpu-layer">
      {/* 1. Trending Now Shelf */}
      {renderShelf(
        "Trending Now",
        "GLOBAL HIT RADAR",
        <Sparkles className="w-3.5 h-3.5 text-[#E10600]" />,
        trendingNow
      )}

      {/* 2. Heavy Rotation Shelf */}
      {renderShelf(
        "Heavy Rotation",
        "FREQUENTLY STREAMED",
        <Flame className="w-3.5 h-3.5 text-[#E10600]" />,
        heavyRotation
      )}

      {/* 3. Related to Your Taste Shelf */}
      {renderShelf(
        "Related to Your Taste",
        "DYNAMIC ALGORITHMIC MIX",
        <Compass className="w-3.5 h-3.5 text-[#E10600]" />,
        relatedTaste
      )}
    </section>
  );
}
