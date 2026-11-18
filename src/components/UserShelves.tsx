"use client";

import React from "react";
import {
  Flame,
  Heart,
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  Search,
  X,
  Trash2,
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
    frequentlyPlayed.length > 0 ||
    likedSongs.length > 0 ||
    recentlyPlayed.length > 0 ||
    recentSearches.length > 0;

  if (!hasAnyActivity) return null;

  return (
    <div className="space-y-8 my-6 gpu-layer">
      {/* ================================================================ */}
      {/* 1. HEAVY ROTATION (Most frequently streamed tracks)             */}
      {/* ================================================================ */}
      {frequentlyPlayed.length > 0 && (
        <section className="px-3 sm:px-6 md:px-8">
          <div className="flex items-center space-x-2.5 mb-3.5">
            <div className="w-7 h-7 rounded-lg bg-[#00FF87]/15 border border-[#00FF87]/30 flex items-center justify-center">
              <Flame className="w-4 h-4 text-[#00FF87] fill-[#00FF87]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                Heavy Rotation
              </h2>
            </div>
          </div>

          <div
            className="flex gap-3.5 overflow-x-auto no-scrollbar py-1 smooth-scroll"
            style={{
              scrollSnapType: "x mandatory",
            }}
          >
            {frequentlyPlayed.map((song) => {
              const isCurrent = currentTrack?.id === song.id;
              const isCardPlaying = isCurrent && isPlaying;
              const count = playFrequency[song.id]?.count || 1;

              return (
                <div
                  key={`heavy-${song.id}`}
                  onClick={() => {
                    if (isCurrent) togglePlay();
                    else playSong(song, frequentlyPlayed);
                  }}
                  className={`group relative flex-shrink-0 w-[140px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border ${
                    isCurrent
                      ? "border-[#00FF87] shadow-[0_0_20px_rgba(0,255,135,0.4)]"
                      : "border-white/10 hover:border-white/25"
                  }`}
                  style={{
                    scrollSnapAlign: "start",
                  }}
                >
                  {/* Full-bleed 140x140 Album Art */}
                  <div className="relative w-[140px] h-[140px] bg-neutral-900 overflow-hidden">
                    <img
                      src={song.imageUrl || FALLBACK_VINYL}
                      alt={song.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                      }}
                    />

                    {/* Plays Count Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono font-bold text-[#00FF87]">
                      {count} {count === 1 ? "Play" : "Plays"}
                    </div>

                    {/* Subtle bottom gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />

                    {/* 1-Tap Play Glyph that pops on touch */}
                    <div
                      className={`absolute bottom-2 right-2 w-9 h-9 rounded-full bg-gradient-to-r from-[#00FF87] to-[#10B981] flex items-center justify-center text-black shadow-lg transition-transform duration-200 ${
                        isCardPlaying
                          ? "scale-100 opacity-100"
                          : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                      }`}
                    >
                      {isCardPlaying ? (
                        <Pause className="w-4 h-4 fill-black text-black" />
                      ) : (
                        <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Clean Title & Artist under image */}
                  <div className="p-2.5 bg-[#121217]">
                    <h4
                      className={`text-xs font-bold truncate leading-tight ${
                        isCurrent ? "text-[#00FF87]" : "text-white"
                      }`}
                    >
                      {song.name}
                    </h4>
                    <p className="text-[11px] text-[#8F90A6] truncate mt-0.5 font-medium">
                      {song.primaryArtists}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* 2. VAULT FAVOURITES (Liked songs in localStorage)               */}
      {/* ================================================================ */}
      {likedSongs.length > 0 && (
        <section className="px-3 sm:px-6 md:px-8">
          <div className="flex items-center space-x-2.5 mb-3.5">
            <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                Vault Favourites
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#121217] border border-white/10 text-[11px] font-mono text-[#8F90A6]">
              {likedSongs.length}
            </span>
          </div>

          <div
            className="flex gap-3.5 overflow-x-auto no-scrollbar py-1 smooth-scroll"
            style={{
              scrollSnapType: "x mandatory",
            }}
          >
            {likedSongs.map((song) => {
              const isCurrent = currentTrack?.id === song.id;
              const isCardPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={`vault-${song.id}`}
                  onClick={() => {
                    if (isCurrent) togglePlay();
                    else playSong(song, likedSongs);
                  }}
                  className={`group relative flex-shrink-0 w-[140px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border ${
                    isCurrent
                      ? "border-[#00FF87] shadow-[0_0_20px_rgba(0,255,135,0.4)]"
                      : "border-white/10 hover:border-white/25"
                  }`}
                  style={{
                    scrollSnapAlign: "start",
                  }}
                >
                  <div className="relative w-[140px] h-[140px] bg-neutral-900 overflow-hidden">
                    <img
                      src={song.imageUrl || FALLBACK_VINYL}
                      alt={song.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />

                    <div
                      className={`absolute bottom-2 right-2 w-9 h-9 rounded-full bg-gradient-to-r from-[#00FF87] to-[#10B981] flex items-center justify-center text-black shadow-lg transition-transform duration-200 ${
                        isCardPlaying
                          ? "scale-100 opacity-100"
                          : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                      }`}
                    >
                      {isCardPlaying ? (
                        <Pause className="w-4 h-4 fill-black text-black" />
                      ) : (
                        <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#121217]">
                    <h4
                      className={`text-xs font-bold truncate leading-tight ${
                        isCurrent ? "text-[#00FF87]" : "text-white"
                      }`}
                    >
                      {song.name}
                    </h4>
                    <p className="text-[11px] text-[#8F90A6] truncate mt-0.5 font-medium">
                      {song.primaryArtists}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* 3. REWIND (Recently played tracks with instant re-queue)         */}
      {/* ================================================================ */}
      {recentlyPlayed.length > 0 && (
        <section className="px-3 sm:px-6 md:px-8">
          <div className="flex items-center space-x-2.5 mb-3.5">
            <div className="w-7 h-7 rounded-lg bg-[#7928CA]/15 border border-[#7928CA]/30 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-[#7928CA]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                Rewind
              </h2>
            </div>
          </div>

          <div
            className="flex gap-3.5 overflow-x-auto no-scrollbar py-1 smooth-scroll"
            style={{
              scrollSnapType: "x mandatory",
            }}
          >
            {recentlyPlayed.map((song, idx) => {
              const isCurrent = currentTrack?.id === song.id;
              const isCardPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={`rewind-${song.id}-${idx}`}
                  onClick={() => {
                    if (isCurrent) togglePlay();
                    else playSong(song, recentlyPlayed);
                  }}
                  className={`group relative flex-shrink-0 w-[140px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border ${
                    isCurrent
                      ? "border-[#00FF87] shadow-[0_0_20px_rgba(0,255,135,0.4)]"
                      : "border-white/10 hover:border-white/25"
                  }`}
                  style={{
                    scrollSnapAlign: "start",
                  }}
                >
                  <div className="relative w-[140px] h-[140px] bg-neutral-900 overflow-hidden">
                    <img
                      src={song.imageUrl || FALLBACK_VINYL}
                      alt={song.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />

                    <div
                      className={`absolute bottom-2 right-2 w-9 h-9 rounded-full bg-gradient-to-r from-[#00FF87] to-[#10B981] flex items-center justify-center text-black shadow-lg transition-transform duration-200 ${
                        isCardPlaying
                          ? "scale-100 opacity-100"
                          : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                      }`}
                    >
                      {isCardPlaying ? (
                        <Pause className="w-4 h-4 fill-black text-black" />
                      ) : (
                        <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#121217]">
                    <h4
                      className={`text-xs font-bold truncate leading-tight ${
                        isCurrent ? "text-[#00FF87]" : "text-white"
                      }`}
                    >
                      {song.name}
                    </h4>
                    <p className="text-[11px] text-[#8F90A6] truncate mt-0.5 font-medium">
                      {song.primaryArtists}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* 4. RECENT SEARCHES CHIPS                                         */}
      {/* ================================================================ */}
      {recentSearches.length > 0 && (
        <section className="px-3 sm:px-6 md:px-8">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-[#00FF87]" />
              <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-[#8F90A6]">
                Recent Searches
              </h3>
            </div>
            <button
              onClick={clearRecentSearches}
              className="text-[11px] font-mono text-neutral-400 hover:text-red-400 transition flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {recentSearches.map((term, idx) => (
              <div
                key={`search-${idx}-${term}`}
                className="group flex items-center bg-[#121217] hover:bg-[#181822] border border-white/10 hover:border-[#00FF87]/40 rounded-full pl-3 pr-1.5 py-1 text-xs text-[#8F90A6] hover:text-white transition cursor-pointer flex-shrink-0"
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
    </div>
  );
}
