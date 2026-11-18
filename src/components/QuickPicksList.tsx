"use client";

import React from "react";
import { Play, Pause, ThumbsUp, ThumbsDown } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

interface QuickPicksListProps {
  title?: string;
  subtitle?: string;
  songs: Song[];
}

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

const formatDuration = (secs: number | string): string => {
  const n = typeof secs === "string" ? parseInt(secs, 10) : secs;
  if (isNaN(n) || n <= 0) return "3:24";
  const m = Math.floor(n / 60);
  const s = Math.floor(n % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export default function QuickPicksList({
  title = "Quick Picks",
  subtitle = "START RADIO FROM A SONG",
  songs = [],
}: QuickPicksListProps) {
  const {
    currentTrack,
    isPlaying,
    progress,
    playSong,
    togglePlay,
    toggleLike,
    toggleDislike,
    likedSongIds,
    dislikedSongIds,
  } = usePlayerStore();

  if (!songs || songs.length === 0) return null;

  return (
    <section className="my-6">
      {/* Shelf Header */}
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
      </div>

      {/* 4-Row Horizontal Carousel typical of YouTube Music */}
      <div className="w-full overflow-x-auto no-scrollbar scroll-smooth px-4 md:px-8">
        <div className="grid grid-rows-4 grid-flow-col auto-cols-[300px] sm:auto-cols-[340px] md:auto-cols-[380px] gap-x-5 gap-y-2 pb-2">
          {songs.map((song) => {
            const isCurrent = currentTrack?.id === song.id;
            const isCardPlaying = isCurrent && isPlaying;
            const isLiked = Boolean(likedSongIds[song.id]);
            const isDisliked = Boolean(dislikedSongIds[song.id]);

            return (
              <div
                key={song.id}
                onClick={() => {
                  if (isCurrent) {
                    togglePlay();
                  } else {
                    playSong(song, songs);
                  }
                }}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 cursor-pointer overflow-hidden ${
                  isCurrent
                    ? "bg-[#141418] text-white shadow-[0_0_15px_rgba(0,255,135,0.2)] border border-[#00FF87]/40"
                    : "hover:bg-[#121216] text-neutral-300 border border-white/5"
                }`}
              >
                {/* Hairline Progress Glow Bar for Currently Playing Track */}
                {isCurrent && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-800">
                    <div
                      className="h-full bg-gradient-to-r from-[#00FF87] to-[#00F0FF] transition-all duration-150"
                      style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                    />
                  </div>
                )}

                {/* Left: Thumbnail with Dark Overlay and Play Icon */}
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  <div className="relative w-12 h-12 md:w-13 md:h-13 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900 shadow-md">
                    <img
                      src={song.imageUrl || FALLBACK_VINYL}
                      alt={song.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                      }}
                    />
                    <div
                      className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-200 ${
                        isCardPlaying
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {isCardPlaying ? (
                        <div className="flex items-center space-x-0.5">
                          <span className="w-1 h-3.5 bg-[#00FF87] rounded-full animate-bounce" />
                          <span className="w-1 h-2 bg-[#00F0FF] rounded-full animate-bounce [animation-delay:0.15s]" />
                          <span className="w-1 h-3.5 bg-[#00FF87] rounded-full animate-bounce [animation-delay:0.3s]" />
                        </div>
                      ) : (
                        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Title & Artist & Album */}
                  <div className="truncate min-w-0 flex-1">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isCurrent ? "text-[#00FF87]" : "text-white"
                      }`}
                    >
                      {song.name}
                    </h4>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {song.primaryArtists} • {song.album || "Single"}
                    </p>
                  </div>
                </div>

                {/* Right: Duration & Quick Thumbs Up/Down */}
                <div className="flex items-center space-x-2.5 ml-3 flex-shrink-0">
                  <span className="text-xs text-neutral-400 font-mono">
                    {formatDuration(song.duration)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song);
                    }}
                    className={`p-1.5 rounded-full hover:bg-white/10 transition ${
                      isLiked ? "text-[#00FF87]" : "text-neutral-400 hover:text-white"
                    }`}
                    aria-label={isLiked ? "Unlike" : "Like"}
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${isLiked ? "fill-[#00FF87] stroke-[#00FF87]" : ""}`}
                    />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDislike(song);
                    }}
                    className={`p-1.5 rounded-full hover:bg-white/10 transition ${
                      isDisliked ? "text-red-400" : "text-neutral-400 hover:text-white"
                    }`}
                    aria-label="Dislike"
                  >
                    <ThumbsDown
                      className={`w-3.5 h-3.5 ${isDisliked ? "fill-red-400 stroke-red-400" : ""}`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
