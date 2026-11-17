"use client";

import React, { useState } from "react";
import { Play, Pause, MoreVertical, ThumbsUp, ThumbsDown, Share2, Radio, Heart } from "lucide-react";
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
  title = "Quick picks",
  subtitle = "START RADIO FROM A SONG",
  songs = [],
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
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
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
            const albumName = song.album || "Single";

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
                className={`group relative flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? "bg-[#212121] text-white shadow-md shadow-black/40 border border-emerald-500/20"
                    : "hover:bg-[#181818] text-neutral-300"
                }`}
              >
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
                      className={`absolute inset-0 bg-black/55 flex items-center justify-center transition-opacity duration-200 ${
                        isCardPlaying
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {isCardPlaying ? (
                        <Pause className="w-5 h-5 fill-white text-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Title, Artist, and Duration in Clean Typography */}
                  <div className="min-w-0 flex-1 pr-2">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isCurrent
                          ? "text-emerald-400 font-bold"
                          : "text-white group-hover:text-white"
                      }`}
                    >
                      {song.name}
                    </h4>
                    <p className="text-xs text-neutral-400 truncate mt-0.5 flex items-center space-x-1.5">
                      <span className="truncate">{song.primaryArtists}</span>
                      <span className="text-neutral-500">•</span>
                      <span className="truncate">{albumName}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Duration, One-Tap Thumbs Up / Down, Three-Dot Menu */}
                <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
                  <span className="text-xs text-neutral-400 font-mono hidden sm:inline-block mr-1">
                    {formatDuration(song.duration)}
                  </span>

                  {/* Thumbs Down */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDislike(song);
                    }}
                    className={`p-1.5 rounded-full hover:bg-neutral-800 transition ${
                      isDisliked
                        ? "opacity-100 text-rose-500"
                        : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white"
                    }`}
                    aria-label="Thumbs Down"
                  >
                    <ThumbsDown
                      className={`w-3.5 h-3.5 ${isDisliked ? "fill-rose-500 stroke-rose-500" : ""}`}
                    />
                  </button>

                  {/* Thumbs Up */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song);
                    }}
                    className={`p-1.5 rounded-full hover:bg-neutral-800 transition ${
                      isLiked
                        ? "opacity-100 text-emerald-400"
                        : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white"
                    }`}
                    aria-label="Thumbs Up"
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${isLiked ? "fill-emerald-400 stroke-emerald-400" : ""}`}
                    />
                  </button>

                  {/* Three-Dot Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === song.id ? null : song.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                      aria-label="Action Menu"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover Dropdown Menu */}
                    {activeMenuId === song.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-8 z-30 w-48 bg-[#212121] border border-white/10 rounded-xl shadow-2xl py-1.5 text-xs text-neutral-200 animate-in fade-in zoom-in-95 duration-150"
                      >
                        <button
                          onClick={() => {
                            playSong(song, songs);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 flex items-center space-x-2.5 hover:bg-[#2a2a2a] text-left transition"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Play now</span>
                        </button>
                        <button
                          onClick={() => {
                            playSong(song, songs);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 flex items-center space-x-2.5 hover:bg-[#2a2a2a] text-left transition"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Start radio</span>
                        </button>
                        <button
                          onClick={() => {
                            toggleLike(song);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 flex items-center space-x-2.5 hover:bg-[#2a2a2a] text-left transition"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isLiked ? "text-emerald-400 fill-emerald-400" : ""
                            }`}
                          />
                          <span>
                            {isLiked ? "Remove from Liked" : "Add to Liked Songs"}
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: song.name,
                                text: `Listen to ${song.name} on SMC Singhs Music Co`,
                                url: window.location.href,
                              });
                            }
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 flex items-center space-x-2.5 hover:bg-[#2a2a2a] text-left transition"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
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

// Export aliases
export { QuickPicksList as QuickPicks, QuickPicksList as QuickPicksGrid };
