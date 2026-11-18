"use client";

import React, { useState } from "react";
import { Play, Pause, ThumbsUp, ThumbsDown, MoreVertical, Radio, Share2, Sparkles, Heart } from "lucide-react";
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
  speedDialSongs = [],
}: QuickPicksListProps) {
  const {
    currentTrack,
    isPlaying,
    playSong,
    togglePlay,
    toggleLike,
    toggleDislike,
    likedSongIds,
    dislikedSongIds,
  } = usePlayerStore();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Speed Dial tracks (9 items for 3x3 layout)
  const stationCards = (speedDialSongs.length > 0 ? speedDialSongs : songs).slice(0, 9);

  if (!songs || songs.length === 0) return null;

  return (
    <section className="my-8 px-4 md:px-8">
      {/* ================================================================ */}
      {/* 1. 3x3 SPEED DIAL STATION CARDS                                   */}
      {/* ================================================================ */}
      {stationCards.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center space-x-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-ping" />
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Speed Dial Stations
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {stationCards.map((song) => {
              const isCurrent = currentTrack?.id === song.id;
              const isCardPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={`station-${song.id}`}
                  onClick={() => {
                    if (isCurrent) {
                      togglePlay();
                    } else {
                      playSong(song, stationCards);
                    }
                  }}
                  className={`group relative glass-card p-3 flex items-center space-x-3.5 cursor-pointer overflow-hidden ${
                    isCurrent ? "border-[#00FF87]/50 shadow-[0_0_20px_rgba(0,255,135,0.25)]" : ""
                  }`}
                >
                  {/* Big Vibrant Square Album Art with Rounded-2xl corners */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-900 shadow-md">
                    <img
                      src={song.imageUrl || FALLBACK_VINYL}
                      alt={song.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                      }}
                    />

                    {/* Dark frosted caption gradient overlay & Instant Emerald Play Button */}
                    <div
                      className={`absolute inset-0 bg-black/55 flex items-center justify-center transition-all duration-300 ${
                        isCardPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00FF87] to-[#10B981] flex items-center justify-center text-black shadow-[0_0_12px_rgba(0,255,135,0.5)]">
                        {isCardPlaying ? (
                          <Pause className="w-4 h-4 fill-black text-black" />
                        ) : (
                          <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1 pr-1">
                    <h4
                      className={`text-sm sm:text-base font-bold truncate leading-tight ${
                        isCurrent ? "text-[#00FF87]" : "text-white"
                      }`}
                    >
                      {song.name}
                    </h4>
                    <p className="text-xs text-neutral-400 truncate mt-1">
                      {song.primaryArtists}
                    </p>
                    <span className="inline-block text-[10px] text-neutral-400 font-mono mt-1">
                      Station Mix
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 2. QUICK PICKS TRACK LIST (MODERN HORIZONTAL GLASS ROWS)         */}
      {/* ================================================================ */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            {subtitle && (
              <p className="text-[11px] font-bold text-[#00FF87] tracking-wider uppercase">
                {subtitle}
              </p>
            )}
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white mt-0.5">
              {title}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {songs.slice(0, 10).map((song) => {
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
                className={`group relative glass-card p-3.5 flex items-center justify-between cursor-pointer ${
                  isCurrent ? "border-[#00FF87]/50 shadow-[0_0_20px_rgba(0,255,135,0.25)]" : ""
                }`}
              >
                {/* Left: High-Res 64x64 Album Art with Rounded-xl Corners */}
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900 shadow-md">
                    <img
                      src={song.imageUrl || FALLBACK_VINYL}
                      alt={song.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                      }}
                    />

                    {/* Hover/Playing Play Icon */}
                    <div
                      className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${
                        isCardPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {isCardPlaying ? (
                        <div className="flex items-center space-x-0.5">
                          <span className="w-1 h-4 bg-[#00FF87] rounded-full animate-bounce" />
                          <span className="w-1 h-2.5 bg-[#00F0FF] rounded-full animate-bounce [animation-delay:0.15s]" />
                          <span className="w-1 h-4 bg-[#00FF87] rounded-full animate-bounce [animation-delay:0.3s]" />
                        </div>
                      ) : (
                        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Bold Song Title, Secondary Artist */}
                  <div className="truncate min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h4
                        className={`text-sm sm:text-base font-bold truncate leading-tight ${
                          isCurrent ? "text-[#00FF87]" : "text-white"
                        }`}
                      >
                        {song.name}
                      </h4>
                      {isCardPlaying && (
                        <span className="flex-shrink-0 flex items-center space-x-0.5">
                          <span className="w-1 h-2.5 bg-[#00FF87] rounded-full animate-pulse" />
                          <span className="w-1 h-4 bg-[#00FF87] rounded-full animate-pulse [animation-delay:0.2s]" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 truncate mt-1">
                      {song.primaryArtists}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {song.album || "Single"}
                    </p>
                  </div>
                </div>

                {/* Right: Duration in Monospaced Font & Responsive Micro-actions */}
                <div className="flex items-center space-x-2 sm:space-x-3 ml-3 flex-shrink-0">
                  <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
                    {formatDuration(song.duration)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song);
                    }}
                    className={`p-2 rounded-full hover:bg-white/10 transition cursor-pointer ${
                      isLiked ? "text-[#00FF87]" : "text-neutral-400 hover:text-white"
                    }`}
                    aria-label={isLiked ? "Unlike" : "Like"}
                  >
                    <ThumbsUp
                      className={`w-4 h-4 ${isLiked ? "fill-[#00FF87] stroke-[#00FF87]" : ""}`}
                    />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDislike(song);
                    }}
                    className={`p-2 rounded-full hover:bg-white/10 transition cursor-pointer ${
                      isDisliked ? "text-red-400" : "text-neutral-400 hover:text-white"
                    }`}
                    aria-label="Dislike"
                  >
                    <ThumbsDown
                      className={`w-4 h-4 ${isDisliked ? "fill-red-400 stroke-red-400" : ""}`}
                    />
                  </button>

                  {/* Context Menu Button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === song.id ? null : song.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
                      aria-label="Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === song.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-8 z-30 w-44 rounded-2xl bg-[#14141A] border border-white/10 p-2 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150"
                      >
                        <button
                          onClick={() => {
                            playSong(song, songs);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-white/10 transition text-left"
                        >
                          <Play className="w-3.5 h-3.5 text-[#00FF87]" />
                          <span>Play Next</span>
                        </button>
                        <button
                          onClick={() => {
                            toggleLike(song);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-white/10 transition text-left"
                        >
                          <Heart className="w-3.5 h-3.5 text-[#00FF87]" />
                          <span>{isLiked ? "Remove Favorite" : "Save Favorite"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
