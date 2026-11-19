"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
} from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { getLyrics } from "@/services/api";

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

const formatTime = (secs: number): string => {
  if (isNaN(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

const formatRemainingTime = (current: number, total: number): string => {
  if (isNaN(total) || total <= 0) return "-0:00";
  const rem = Math.max(0, total - (isNaN(current) ? 0 : current));
  return `-${formatTime(rem)}`;
};

export default function NowPlayingView() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    progress,
    isPlayerOpen,
    isShuffled,
    repeatMode,
    likedSongIds,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    togglePlayerOpen,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
  } = usePlayerStore();

  const [lyricsSnippet, setLyricsSnippet] = useState<string[]>([]);

  // Fetch lyrics preview when track changes
  useEffect(() => {
    if (!currentTrack) return;
    let active = true;

    async function loadLyricsPreview() {
      try {
        const fullLyrics = await getLyrics(currentTrack!.name, currentTrack!.primaryArtists);
        if (active) {
          const lines = fullLyrics
            .split("\n")
            .map((l) => l.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, "").trim())
            .filter((l) => l.length > 0 && !l.includes("♪"));

          setLyricsSnippet(
            lines.length >= 3
              ? lines.slice(0, 3)
              : [
                  "Whispers in the midnight breeze,",
                  "Carrying dreams across the seas,",
                  "I close my eyes, let go, and drift away",
                ]
          );
        }
      } catch {
        if (active) {
          setLyricsSnippet([
            "Whispers in the midnight breeze,",
            "Carrying dreams across the seas,",
            "I close my eyes, let go, and drift away",
          ]);
        }
      }
    }

    loadLyricsPreview();
    return () => {
      active = false;
    };
  }, [currentTrack?.id]);

  if (!isPlayerOpen || !currentTrack) return null;

  const isLiked = Boolean(likedSongIds[currentTrack.id]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(parseFloat(e.target.value));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 md:inset-auto md:top-0 md:bottom-0 md:left-1/2 md:-translate-x-1/2 md:w-[430px] z-50 bg-[#0A0A0C] md:border-x md:border-white/10 text-white flex flex-col justify-between overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300 gpu-layer select-none px-6 py-6 shadow-2xl"
    >
      {/* Background Soft Ambient Light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#D4FF00]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#7c3aed]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar: Back Arrow, "Now Playing", Heart (Matching Reference 3 Middle Mockup) */}
      <div className="relative z-10 w-full flex items-center justify-between">
        <button
          onClick={() => togglePlayerOpen(false)}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Now Playing
        </h3>

        <button
          onClick={() => toggleLike(currentTrack)}
          className={`w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition cursor-pointer ${
            isLiked ? "text-[#D4FF00] border-[#D4FF00]/40" : "text-neutral-300 hover:text-white"
          }`}
          aria-label="Like track"
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-[#D4FF00]" : ""}`} />
        </button>
      </div>

      {/* Center: Large Circular Rotating Disc Artwork matching Reference 1 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-4 w-full">
        <div className="relative group my-auto">
          <div
            className={`absolute -inset-4 rounded-full bg-[#D4FF00]/20 blur-2xl pointer-events-none transition-opacity duration-700 ${
              isPlaying ? "opacity-100 animate-pulse" : "opacity-30"
            }`}
          />
          {/* Circular Disc Artwork (240x240) */}
          <div className="w-60 h-60 rounded-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)] border-4 border-white/10 bg-neutral-900 flex items-center justify-center">
            <img
              src={currentTrack.imageUrl || FALLBACK_VINYL}
              alt={currentTrack.name}
              className={`w-full h-full object-cover ${
                isPlaying ? "animate-spin-slow" : ""
              }`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
              }}
            />
            {/* Center Spindle Accent Hole */}
            <div className="absolute w-5 h-5 rounded-full bg-[#0A0A0C] border-2 border-white/40 shadow-inner" />
          </div>
        </div>

        {/* Track Info */}
        <div className="w-full text-center mt-5">
          <h2 className="text-xl font-bold text-white tracking-tight leading-tight truncate px-2">
            {currentTrack.name}
          </h2>
          <p className="text-xs font-medium text-gray-400 mt-1 truncate">
            {currentTrack.primaryArtists}
          </p>
        </div>

        {/* Real-time Lyrics Preview: 3 lines centered with vertical fade */}
        <div className="w-full text-center my-4 py-2 px-3 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="space-y-1">
            {lyricsSnippet.map((line, idx) => (
              <p
                key={idx}
                className={`text-xs font-medium leading-relaxed transition-opacity ${
                  idx === 1
                    ? "text-[#D4FF00] font-bold"
                    : "text-gray-400 opacity-70"
                }`}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Controls Deck */}
      <div className="relative z-10 w-full space-y-4 pb-2">
        {/* Minimalist Hairline Scrubber with Lime dot */}
        <div className="w-full">
          <div className="relative flex items-center group">
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#D4FF00] hover:h-1.5 transition-all"
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-gray-400 mt-1.5 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatRemainingTime(currentTime, duration)}</span>
          </div>
        </div>

        {/* Controls: Shuffle, Prev, Large Circular Lime Play/Pause, Next, Repeat */}
        <div className="w-full flex items-center justify-between px-2 pt-1">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition cursor-pointer ${
              isShuffled ? "text-[#D4FF00]" : "text-gray-400 hover:text-white"
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous Track */}
          <button
            onClick={playPrev}
            className="p-2.5 text-white hover:text-neutral-300 transition active:scale-95 cursor-pointer"
            aria-label="Previous track"
          >
            <SkipBack className="w-6 h-6 fill-white" />
          </button>

          {/* Large Circular Play/Pause (Lime Accent #D4FF00) */}
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-[#D4FF00] hover:bg-[#bceb15] text-black flex items-center justify-center transition shadow-lg shadow-[#D4FF00]/35 active:scale-95 cursor-pointer"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-black stroke-black" />
            ) : (
              <Play className="w-6 h-6 fill-black stroke-black ml-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={playNext}
            className="p-2.5 text-white hover:text-neutral-300 transition active:scale-95 cursor-pointer"
            aria-label="Next track"
          >
            <SkipForward className="w-6 h-6 fill-white" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition cursor-pointer ${
              repeatMode !== "off"
                ? "text-[#D4FF00]"
                : "text-gray-400 hover:text-white"
            }`}
            aria-label="Repeat"
          >
            {repeatMode === "one" ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
