"use client";

import React from "react";
import { Play, Pause, Heart, Plus, MoreHorizontal } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";
import { getSongCover, decodeHtmlEntities } from "./TopDailyPlaylists";

interface HeroVisualizerProps {
  featuredTrack?: Song | null;
  onPlay?: (track: Song) => void;
  badgeLabel?: string;
}

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

const DEFAULT_HERO_TRACK: Song = {
  id: "hero_curated_lossless",
  name: "Blinding Lights",
  title: "Blinding Lights",
  primaryArtists: "The Weeknd • Lossless Master",
  album: "After Hours",
  duration: 200,
  imageUrl: "https://c.saavncdn.com/649/After-Hours-English-2020-20200320011002-500x500.jpg",
  audioUrl: "",
};

export default function HeroVisualizer({
  featuredTrack,
  onPlay,
  badgeLabel = "DISCOVER WEEKLY",
}: HeroVisualizerProps) {
  const { currentTrack, isPlaying, togglePlay, playSong, toggleLike, likedSongIds } =
    usePlayerStore();

  const activeTrack = featuredTrack || currentTrack || DEFAULT_HERO_TRACK;
  const isCurrentActive = Boolean(
    currentTrack && activeTrack && currentTrack.id === activeTrack.id
  );
  const trackIsPlaying = isCurrentActive && isPlaying;
  const isLiked = Boolean(likedSongIds[activeTrack.id]);

  const songTitle = decodeHtmlEntities(activeTrack.name || activeTrack.title || "Featured Track");
  const songArtist = decodeHtmlEntities(activeTrack.primaryArtists || "Curated Audio");
  const coverUrl = getSongCover(activeTrack);

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
    <section className="w-full select-none gpu-layer">
      {/* Purple/Indigo gradient card matching Reference 1 */}
      <div className="rounded-3xl p-5 mx-4 my-2 flex justify-between items-center bg-gradient-to-br from-[#3B0764] to-[#1E1B4B] border border-white/10 shadow-xl relative overflow-hidden min-h-[170px]">
        {/* Soft Ambient Radial Lights */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#D4FF00]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Left column (60%) */}
        <div className="relative z-10 w-[60%] flex flex-col justify-between h-full pr-2">
          <div>
            {/* Pill badge: "DISCOVER WEEKLY" in lime */}
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#D4FF00] bg-white/10 px-2.5 py-0.5 rounded-full inline-block border border-white/5">
              {badgeLabel}
            </span>

            {/* Prominent Track Title */}
            <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1 mt-1.5 leading-tight">
              {songTitle}
            </h3>

            {/* Artist / Lossless Subtitle */}
            <p className="text-[11px] text-gray-300 line-clamp-1 mt-0.5">
              By {songArtist} • 320kbps Lossless
            </p>
          </div>

          {/* Action row (mt-3 flex items-center gap-3) */}
          <div className="mt-3 flex items-center gap-3">
            {/* 38px Circular Play Button */}
            <button
              onClick={handleAction}
              className="w-[38px] h-[38px] rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg flex-shrink-0 cursor-pointer"
              aria-label={trackIsPlaying ? "Pause" : "Play"}
            >
              {trackIsPlaying ? (
                <Pause className="w-4 h-4 fill-black stroke-black" />
              ) : (
                <Play className="w-4 h-4 fill-black stroke-black ml-0.5" />
              )}
            </button>

            {/* Heart Icon (♡) */}
            <button
              onClick={() => toggleLike(activeTrack)}
              className="text-gray-300 hover:text-white transition active:scale-95 cursor-pointer"
              aria-label="Like"
            >
              <Heart
                className={`w-4 h-4 ${
                  isLiked ? "fill-[#D4FF00] text-[#D4FF00]" : ""
                }`}
              />
            </button>

            {/* Plus Icon (+) */}
            <button
              onClick={() => playSong(activeTrack)}
              className="text-gray-300 hover:text-white transition active:scale-95 cursor-pointer"
              aria-label="Add to Queue"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Context Menu (···) */}
            <button
              onClick={() => togglePlay()}
              className="text-gray-300 hover:text-white transition active:scale-95 cursor-pointer"
              aria-label="Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right column (40%): Large rounded-2xl album art of the featured song */}
        <div className="relative z-10 w-[40%] flex justify-end">
          <div className="w-[105px] h-[105px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative flex-shrink-0 bg-neutral-900">
            <img
              src={coverUrl}
              alt={songTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
