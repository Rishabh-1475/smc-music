"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  Share2,
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
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  // Fetch lyrics preview when track changes
  useEffect(() => {
    if (!currentTrack) return;
    let active = true;

    async function loadLyricsPreview() {
      setLoadingLyrics(true);
      try {
        const fullLyrics = await getLyrics(currentTrack!.name, currentTrack!.primaryArtists);
        if (active) {
          // Parse lines and pick 2-3 clean lines
          const lines = fullLyrics
            .split("\n")
            .map((l) => l.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, "").trim())
            .filter((l) => l.length > 0 && !l.includes("♪"));

          setLyricsSnippet(lines.slice(0, 3));
        }
      } catch {
        if (active) {
          setLyricsSnippet(["The original sound curated for your taste.", "High fidelity audio streaming."]);
        }
      } finally {
        if (active) setLoadingLyrics(false);
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
      className="fixed inset-0 z-50 bg-[#0A0A0C]/95 backdrop-blur-2xl text-white flex flex-col justify-between overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300 gpu-layer select-none px-6 py-6"
    >
      {/* Background Soft Ambient Light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D2FF1F]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#7c3aed]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar: Back Arrow, "Now Playing", Heart */}
      <div className="relative z-10 w-full flex items-center justify-between max-w-md mx-auto">
        <button
          onClick={() => togglePlayerOpen(false)}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition cursor-pointer"
          aria-label="Collapse player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Now Playing
        </h3>

        <button
          onClick={() => toggleLike(currentTrack)}
          className={`w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition cursor-pointer ${
            isLiked ? "text-[#D2FF1F] border-[#D2FF1F]/40" : "text-neutral-300 hover:text-white"
          }`}
          aria-label="Like track"
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-[#D2FF1F]" : ""}`} />
        </button>
      </div>

      {/* Center: Large Circular Rotating / Floating Disc Artwork matching Reference 1 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-6 max-w-md mx-auto w-full">
        {/* Soft Ambient Radiance around Artwork */}
        <div className="relative group my-auto">
          <div
            className={`absolute -inset-4 rounded-full bg-[#D2FF1F]/20 blur-2xl pointer-events-none transition-opacity duration-700 ${
              isPlaying ? "opacity-100 animate-pulse" : "opacity-30"
            }`}
          />
          {/* Circular Disc Artwork */}
          <div className="w-60 h-60 sm:w-68 sm:h-68 md:w-72 md:h-72 rounded-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-4 border-white/10 bg-neutral-900 flex items-center justify-center">
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
            <div className="absolute w-6 h-6 rounded-full bg-[#0A0A0C] border-2 border-white/40 shadow-inner" />
          </div>
        </div>

        {/* Track Info */}
        <div className="w-full text-center mt-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight truncate px-2">
            {currentTrack.name}
          </h2>
          <p className="text-sm font-medium text-neutral-400 mt-1 truncate">
            {currentTrack.primaryArtists}
          </p>
        </div>

        {/* Real-time Lyrics Preview: 2-3 lines centered with subtle vertical fade */}
        <div className="w-full max-w-xs text-center my-4 py-2 px-3 rounded-2xl bg-white/[0.03] border border-white/5">
          {lyricsSnippet.length > 0 ? (
            <div className="space-y-1">
              {lyricsSnippet.map((line, idx) => (
                <p
                  key={idx}
                  className={`text-xs font-medium leading-relaxed transition-opacity ${
                    idx === 1
                      ? "text-[#D2FF1F] font-bold"
                      : "text-neutral-400 opacity-70"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 font-mono">
              ♪ Lossless High-Fidelity Audio ♪
            </p>
          )}
        </div>
      </div>

      {/* Bottom Controls Deck */}
      <div className="relative z-10 w-full max-w-md mx-auto space-y-4 pb-2">
        {/* Minimalist Hairline Scrubber */}
        <div className="w-full">
          <div className="relative flex items-center group">
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#D2FF1F] hover:h-1.5 transition-all"
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-neutral-400 mt-1.5 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls: Shuffle, Prev, Large Circular Lime Play/Pause, Next, Repeat */}
        <div className="w-full flex items-center justify-between px-2 pt-2">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-full transition cursor-pointer ${
              isShuffled ? "text-[#D2FF1F]" : "text-neutral-400 hover:text-white"
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous Track */}
          <button
            onClick={playPrev}
            className="p-3 text-white hover:text-neutral-300 transition active:scale-95 cursor-pointer"
            aria-label="Previous track"
          >
            <SkipBack className="w-7 h-7 fill-white" />
          </button>

          {/* Large Circular Play/Pause (Lime Accent) */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-[#D2FF1F] hover:bg-[#bceb15] text-black flex items-center justify-center transition shadow-lg shadow-[#D2FF1F]/35 active:scale-95 cursor-pointer"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black stroke-black" />
            ) : (
              <Play className="w-7 h-7 fill-black stroke-black ml-1" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={playNext}
            className="p-3 text-white hover:text-neutral-300 transition active:scale-95 cursor-pointer"
            aria-label="Next track"
          >
            <SkipForward className="w-7 h-7 fill-white" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-2.5 rounded-full transition cursor-pointer ${
              repeatMode !== "off"
                ? "text-[#D2FF1F]"
                : "text-neutral-400 hover:text-white"
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
