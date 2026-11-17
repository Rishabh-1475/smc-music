"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=600&q=80";

const formatTime = (secs: number): string => {
  if (isNaN(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export default function BottomPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    progress,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    setVolume,
    volume,
  } = usePlayerStore();

  const [coverErr, setCoverErr] = useState(false);

  useEffect(() => {
    setCoverErr(false);
  }, [currentTrack?.imageUrl, currentTrack?.id]);

  if (!currentTrack) return null;

  return (
    <aside
      aria-label="Audio Player"
      className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-xl border-t border-white/10 px-4 md:px-8 py-3 pb-safe shadow-2xl transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
        {/* Track Artwork & Meta */}
        <div className="flex items-center space-x-3 w-full md:w-1/4 min-w-0">
          <img
            src={
              coverErr
                ? FALLBACK_VINYL
                : currentTrack.imageUrl || FALLBACK_VINYL
            }
            alt={currentTrack.name || "Now Playing"}
            className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover border border-white/10 shadow-md flex-shrink-0"
            onError={() => setCoverErr(true)}
          />
          <div className="truncate min-w-0">
            <h5 className="text-sm font-semibold text-white truncate">
              {currentTrack.name}
            </h5>
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {currentTrack.primaryArtists || "Singhs Music Co"}
            </p>
          </div>
        </div>

        {/* Central Controls & Interactive Scrubber */}
        <div className="flex flex-col items-center w-full md:w-2/4 max-w-xl">
          {/* Playback Toggles */}
          <div className="flex items-center space-x-6 mb-1.5">
            <button
              onClick={() => playPrev()}
              className="text-neutral-400 hover:text-white transition p-1"
              aria-label="Previous Track"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg shadow-emerald-500/30"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black stroke-black" />
              ) : (
                <Play className="w-5 h-5 fill-black stroke-black ml-0.5" />
              )}
            </button>
            <button
              onClick={() => playNext()}
              className="text-neutral-400 hover:text-white transition p-1"
              aria-label="Next Track"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Scrubber Bar & Time Display */}
          <div className="w-full flex items-center space-x-3 text-[11px] text-neutral-400 font-mono">
            <span className="w-9 text-right">{formatTime(currentTime)}</span>
            <div
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              tabIndex={0}
              className="relative w-full h-2 bg-neutral-800 rounded-full cursor-pointer overflow-hidden group py-1"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const percent = (clickPos / rect.width) * 100;
                seekTo(percent);
              }}
            >
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-75 group-hover:bg-emerald-400"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-9 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Controls (Desktop & Tablet) */}
        <div className="hidden md:flex items-center justify-end space-x-2.5 w-1/4">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 1)}
            className="text-neutral-400 hover:text-white transition p-1"
            aria-label={volume === 0 ? "Unmute" : "Mute"}
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-neutral-500" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1.5 bg-neutral-800 accent-emerald-500 rounded-lg cursor-pointer"
            aria-label="Volume Slider"
          />
        </div>
      </div>
    </aside>
  );
}
