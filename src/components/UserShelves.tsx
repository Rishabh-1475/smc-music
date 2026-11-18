"use client";

import React from "react";
import {
  Heart,
  Clock,
  Flame,
  Search,
  X,
  Play,
  Pause,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

interface UserShelvesProps {
  onSelectSearchQuery?: (query: string) => void;
}

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

export default function UserShelves({ onSelectSearchQuery }: UserShelvesProps) {
  const {
    currentTrack,
    isPlaying,
    playSong,
    togglePlay,
    likedSongs,
    recentlyPlayed,
    playFrequency,
    recentSearches,
    clearRecentSearches,
    removeRecentSearch,
    getFrequentlyPlayed,
  } = usePlayerStore();

  const frequentlyPlayed = getFrequentlyPlayed();

  const hasAnyActivity =
    likedSongs.length > 0 ||
    recentlyPlayed.length > 0 ||
    frequentlyPlayed.length > 0 ||
    recentSearches.length > 0;

  if (!hasAnyActivity) return null;

  return (
    <div className="space-y-8 my-6">
      {/* ================================================================ */}
      {/* 4. RECENT SEARCHES PILLS                                         */}
      {/* ================================================================ */}
      {recentSearches.length > 0 && (
        <section className="px-4 md:px-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-[#00FF87]" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-neutral-300">
                Recent Searches
              </h3>
            </div>
            <button
              onClick={clearRecentSearches}
              className="text-[11px] text-neutral-400 hover:text-red-400 transition flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {recentSearches.map((term, idx) => (
              <div
                key={`search-${idx}-${term}`}
                className="group flex items-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00FF87]/40 rounded-full pl-3 pr-1.5 py-1 text-xs text-neutral-300 hover:text-white transition cursor-pointer flex-shrink-0"
              >
                <button
                  onClick={() => onSelectSearchQuery && onSelectSearchQuery(term)}
                  className="mr-1.5 focus:outline-none"
                >
                  {term}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentSearch(term);
                  }}
                  className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition"
                  aria-label={`Remove ${term}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* 1. LIKED TRACKS ("Your Favorites")                               */}
      {/* ================================================================ */}
      {likedSongs.length > 0 && (
        <section className="px-4 md:px-8">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                Your Favorites
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00FF87]/15 border border-[#00FF87]/30 text-[#00FF87] text-[11px] font-mono font-bold">
                {likedSongs.length}
              </span>
            </div>
          </div>

          <div
            className="flex gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollSnapType: "x mandatory",
            }}
          >
            {likedSongs.map((song) => {
              const isCurrent = currentTrack?.id === song.id;
              const isCardPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={`liked-${song.id}`}
                  onClick={() => {
                    if (isCurrent) togglePlay();
                    else playSong(song, likedSongs);
                  }}
                  className={`group relative flex-shrink-0 w-36 sm:w-40 p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isCurrent
                      ? "border border-[#00FF87]/60 shadow-[0_0_20px_rgba(0,255,135,0.3)] bg-[#121218]/90"
                      : "border border-white/10 hover:border-white/20 bg-[#121216]/70 hover:bg-[#181820]/90"
                  }`}
                  style={{
                    backdropFilter: "blur(14px)",
                    scrollSnapAlign: "start",
                  }}
                >
                  {/* 120x120 Rounded-2xl Album Cover with Subtle Ambient Glow */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-900 shadow-md mb-2.5">
                    <img
                      src={song.imageUrl || FALLBACK_VINYL}
                      alt={song.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                      }}
                    />

                    {/* Active playing soundwave badge */}
                    {isCardPlaying ? (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="flex items-center space-x-0.5">
                          <span className="w-1 h-4 bg-[#00FF87] rounded-full animate-bounce" />
                          <span className="w-1 h-2.5 bg-[#00F0FF] rounded-full animate-bounce [animation-delay:0.15s]" />
                          <span className="w-1 h-4 bg-[#00FF87] rounded-full animate-bounce [animation-delay:0.3s]" />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-[#00FF87] flex items-center justify-center text-black shadow-[0_0_15px_#00FF87]">
                          <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  <h4
                    className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                      isCurrent ? "text-[#00FF87]" : "text-white"
                    }`}
                  >
                    {song.name}
                  </h4>
                  <p className="text-[11px] text-neutral-400 truncate mt-1">
                    {song.primaryArtists}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* 2. RECENTLY PLAYED ("Jump Back In")                              */}
      {/* ================================================================ */}
      {recentlyPlayed.length > 0 && (
        <section className="px-4 md:px-8">
          <div className="flex items-center space-x-2.5 mb-3.5">
            <div className="w-7 h-7 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <Clock className="w-3.5 h-3.5 text-[#00F0FF]" />
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Jump Back In
            </h2>
          </div>

          <div
            className="flex gap-3.5 overflow-x-auto no-scrollbar py-2 scroll-smooth"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollSnapType: "x mandatory",
            }}
          >
            {recentlyPlayed.map((song, idx) => {
              const isCurrent = currentTrack?.id === song.id;
              const isCardPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={`recent-${song.id}-${idx}`}
                  onClick={() => {
                    if (isCurrent) togglePlay();
                    else playSong(song, recentlyPlayed);
                  }}
                  className={`group relative flex-shrink-0 w-44 sm:w-48 p-3 rounded-2xl cursor-pointer transition-all duration-300 flex items-center space-x-3 ${
                    isCurrent
                      ? "border border-[#00FF87]/60 shadow-[0_0_20px_rgba(0,255,135,0.3)] bg-[#121218]/90"
                      : "border border-white/10 hover:border-white/20 bg-[#121216]/70 hover:bg-[#181820]/90"
                  }`}
                  style={{
                    backdropFilter: "blur(14px)",
                    scrollSnapAlign: "start",
                  }}
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900 shadow">
                    <img
                      src={song.imageUrl || FALLBACK_VINYL}
                      alt={song.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                      }}
                    />
                    <div
                      className={`absolute inset-0 bg-black/55 flex items-center justify-center transition-opacity ${
                        isCardPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {isCardPlaying ? (
                        <Pause className="w-4 h-4 fill-white text-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 pr-1">
                    <h4
                      className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                        isCurrent ? "text-[#00FF87]" : "text-white"
                      }`}
                    >
                      {song.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {song.primaryArtists}
                    </p>
                    <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                      Recently played
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* 3. FREQUENTLY LISTENED ("On Heavy Rotation")                     */}
      {/* ================================================================ */}
      {frequentlyPlayed.length > 0 && (
        <section className="px-4 md:px-8">
          <div className="flex items-center space-x-2.5 mb-3.5">
            <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              On Heavy Rotation
            </h2>
          </div>

          <div
            className="flex gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollSnapType: "x mandatory",
            }}
          >
            {frequentlyPlayed.map((song) => {
              const isCurrent = currentTrack?.id === song.id;
              const isCardPlaying = isCurrent && isPlaying;
              const playCount = playFrequency[song.id]?.count || 1;

              return (
                <div
                  key={`freq-${song.id}`}
                  onClick={() => {
                    if (isCurrent) togglePlay();
                    else playSong(song, frequentlyPlayed);
                  }}
                  className={`group relative flex-shrink-0 w-36 sm:w-40 p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isCurrent
                      ? "border border-[#00FF87]/60 shadow-[0_0_20px_rgba(0,255,135,0.3)] bg-[#121218]/90"
                      : "border border-white/10 hover:border-white/20 bg-[#121216]/70 hover:bg-[#181820]/90"
                  }`}
                  style={{
                    backdropFilter: "blur(14px)",
                    scrollSnapAlign: "start",
                  }}
                >
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-900 shadow-md mb-2.5">
                    <img
                      src={song.imageUrl || FALLBACK_VINYL}
                      alt={song.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                      }}
                    />

                    {/* Mini Pill: Played X times */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-bold text-amber-400">
                      🔥 {playCount} plays
                    </div>

                    <div
                      className={`absolute inset-0 bg-black/55 flex items-center justify-center transition-opacity ${
                        isCardPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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

                  <h4
                    className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                      isCurrent ? "text-[#00FF87]" : "text-white"
                    }`}
                  >
                    {song.name}
                  </h4>
                  <p className="text-[11px] text-neutral-400 truncate mt-1">
                    {song.primaryArtists}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
