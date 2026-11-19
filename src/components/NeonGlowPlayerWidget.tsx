"use client";

import React from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, MoreHorizontal } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { Song } from "@/types/music";

const LABON_KO_TRACK: Song = {
  id: "labon_ko_widget_01",
  name: "Labon Ko",
  title: "Labon Ko",
  primaryArtists: "Pritam, K.K., Sayeed Quadri",
  album: "Bhool Bhulaiyaa",
  duration: 341,
  imageUrl: "https://c.saavncdn.com/024/Bhool-Bhulaiyaa-Hindi-2007-20220914170601-500x500.jpg",
  audioUrl: "https://aac.saavncdn.com/675/1456dc2903d0fb4465d2d2904008803b_320.mp4",
};

const formatTime = (secs: number): string => {
  if (isNaN(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export default function NeonGlowPlayerWidget() {
  const { currentTrack, isPlaying, togglePlay, playSong, currentTime, duration, progress, seekTo } =
    usePlayerStore();

  const activeSong = currentTrack || LABON_KO_TRACK;
  const isLabonKoPlaying = currentTrack?.name?.toLowerCase().includes("labon") && isPlaying;

  const handleAction = () => {
    if (currentTrack?.id === activeSong.id) {
      togglePlay();
    } else {
      playSong(activeSong);
    }
  };

  return (
    <section className="w-full my-3 px-4 select-none gpu-layer">
      {/* Container matching Reference Image 2: Glowing White Frame on Deep Obsidian Backdrop */}
      <div className="relative w-full rounded-[28px] bg-white/[0.04] p-5 border-2 border-white/80 shadow-[0_0_35px_rgba(255,255,255,0.25)] backdrop-blur-xl overflow-hidden text-white">
        {/* Soft Ambient Radiance */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-start space-x-3.5">
          {/* Album Cover Art */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-white/20 flex-shrink-0 bg-neutral-900">
            <img
              src={activeSong.imageUrl}
              alt={activeSong.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://c.saavncdn.com/024/Bhool-Bhulaiyaa-Hindi-2007-20220914170601-500x500.jpg";
              }}
            />
          </div>

          {/* Title + Artist + Heart */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white truncate leading-tight">
                {activeSong.name}
              </h3>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-300 truncate mt-1">
              {activeSong.primaryArtists}
            </p>
          </div>
        </div>

        {/* Minimalist Scrubber with 3:41 and 5:41 matching Image 2 */}
        <div className="mt-4">
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-gray-300 mt-1.5">
            <span>{formatTime(currentTime) || "3:41"}</span>
            <span>{formatTime(duration) || "5:41"}</span>
          </div>
        </div>

        {/* Playback Controls Row matching Image 2 */}
        <div className="flex items-center justify-between mt-3 px-2">
          {/* Shuffle */}
          <button className="text-gray-400 hover:text-white transition cursor-pointer" aria-label="Shuffle">
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Prev */}
          <button className="text-gray-300 hover:text-white transition cursor-pointer" aria-label="Previous">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Large Black Play/Pause Button inside Glowing White HUD */}
          <button
            onClick={handleAction}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transition shadow-lg active:scale-95 cursor-pointer hover:bg-neutral-200"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black stroke-black" />
            ) : (
              <Play className="w-5 h-5 fill-black stroke-black ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button className="text-gray-300 hover:text-white transition cursor-pointer" aria-label="Next">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button className="text-gray-400 hover:text-white transition cursor-pointer" aria-label="Repeat">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
