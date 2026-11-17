"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

interface SongCardProps {
  track?: Song;
  song?: Song;
  tracks?: Song[];
  allSongs?: Song[];
}

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=600&q=80";

export default function SongCard({
  track,
  song,
  tracks,
  allSongs,
}: SongCardProps) {
  const activeSong = track || song;
  const contextList = tracks || allSongs || (activeSong ? [activeSong] : []);

  const [imgSrc, setImgSrc] = useState<string>(
    activeSong?.imageUrl || FALLBACK_VINYL
  );

  useEffect(() => {
    setImgSrc(activeSong?.imageUrl || FALLBACK_VINYL);
  }, [activeSong?.imageUrl, activeSong?.id]);

  const { currentTrack, isPlaying, playSong, togglePlay } = usePlayerStore();

  if (!activeSong) return null;

  const isCurrent = currentTrack?.id === activeSong.id;
  const isCardPlaying = isCurrent && isPlaying;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(activeSong, contextList);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
      className={`group relative p-3 rounded-2xl bg-neutral-900/40 hover:bg-neutral-800/70 border transition-all duration-300 cursor-pointer flex flex-col ${
        isCurrent
          ? "border-emerald-500/50 bg-neutral-900/90 shadow-xl shadow-emerald-500/10"
          : "border-white/5 hover:border-white/10"
      }`}
    >
      {/* Artwork Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-950 mb-3 shadow-md">
        <img
          src={imgSrc}
          alt={activeSong.name || "Track artwork"}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isCurrent ? "ring-2 ring-emerald-500" : ""
          }`}
          onError={() => setImgSrc(FALLBACK_VINYL)}
        />

        {/* Hover / Active Play-Pause Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${
            isCardPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/40 transform transition-transform duration-200 group-hover:scale-110 active:scale-95">
            {isCardPlaying ? (
              <Pause className="w-5 h-5 fill-black stroke-black" />
            ) : (
              <Play className="w-5 h-5 fill-black stroke-black ml-0.5" />
            )}
          </div>
        </div>
      </div>

      {/* Track Meta */}
      <div className="flex flex-col min-w-0">
        <h4
          className={`text-sm font-semibold truncate transition-colors ${
            isCurrent ? "text-emerald-400" : "text-white group-hover:text-emerald-400"
          }`}
        >
          {activeSong.name}
        </h4>
        <p className="text-xs text-neutral-400 truncate mt-1">
          {activeSong.primaryArtists || "Singhs Music Co"}
        </p>
      </div>
    </div>
  );
}
