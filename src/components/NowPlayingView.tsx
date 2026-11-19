"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Menu,
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Clock,
  Radio,
  Bookmark,
} from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { getLyrics } from "@/services/api";
import { decodeHtmlEntities } from "./TopDailyPlaylists";

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
  const trackTitle = decodeHtmlEntities(currentTrack.name || "Calm your soul");
  const trackArtist = decodeHtmlEntities(currentTrack.primaryArtists || "Goodeech Design");

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(parseFloat(e.target.value));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 md:inset-auto md:top-0 md:bottom-0 md:left-1/2 md:-translate-x-1/2 md:w-[430px] z-50 bg-[#070B14] md:border-x md:border-white/10 text-white flex flex-col justify-between overflow-hidden select-none shadow-2xl gpu-layer animate-in fade-in duration-300"
    >
      {/* Background: Exact Moody Silhouette from Reference Image 5 */}
      <div className="absolute inset-0 z-0">
        <img
          src="/showcase/now_playing_silhouette.jpg"
          alt="Atmospheric Silhouette"
          className="w-full h-full object-cover object-center opacity-85"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-black/40 to-[#050811]/70" />
      </div>

      {/* Top Bar: Down Chevron & Bookmark (Image 5) */}
      <div className="relative z-10 w-full flex items-center justify-between px-6 pt-7">
        <button
          onClick={() => togglePlayerOpen(false)}
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition cursor-pointer"
          aria-label="Collapse player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <h3 className="text-xs font-bold uppercase tracking-widest text-white/80">
          Now Playing
        </h3>

        <div className="w-10 h-10 rounded-full bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white">
          <Bookmark className="w-4 h-4" />
        </div>
      </div>

      {/* Center: Exact Floating Glass HUD from Reference Image 5 */}
      <div className="relative z-10 mx-5 my-auto">
        <div className="w-full rounded-[32px] border-2 border-white/80 bg-black/30 backdrop-blur-xl p-6 shadow-[0_0_50px_rgba(255,255,255,0.2)] flex flex-col justify-between">
          {/* Top HUD Row: Menu */}
          <div className="flex items-center justify-between pb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4FF00]">
              Lossless Master
            </span>
            <Menu className="w-4 h-4 text-white/80" />
          </div>

          {/* Title & Artist */}
          <div className="my-3">
            <h2 className="text-xl font-extrabold text-white tracking-tight line-clamp-1">
              {trackTitle}
            </h2>
            <p className="text-xs text-gray-300 font-medium mt-1 truncate">
              {trackArtist}
            </p>
          </div>

          {/* Minimalist Scrubber with 1:10 and 2:47 matching Image 5 */}
          <div className="w-full my-3">
            <div className="relative flex items-center">
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={progress}
                onChange={handleSeek}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-gray-300 mt-2">
              <span>{formatTime(currentTime) || "1:10"}</span>
              <span>{formatTime(duration) || "2:47"}</span>
            </div>
          </div>

          {/* Main Controls Row: Heart, Prev, Big White Play Button, Next, Like */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => toggleLike(currentTrack)}
              className="text-white/80 hover:text-white transition active:scale-95 cursor-pointer"
              aria-label="Like"
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>

            <button
              onClick={playPrev}
              className="text-white hover:text-neutral-300 transition active:scale-95 cursor-pointer"
              aria-label="Previous"
            >
              <SkipBack className="w-6 h-6 fill-white" />
            </button>

            {/* Large Circular White Button with Black Pause/Play Icon */}
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition shadow-2xl active:scale-95 cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-black stroke-black" />
              ) : (
                <Play className="w-6 h-6 fill-black stroke-black ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="text-white hover:text-neutral-300 transition active:scale-95 cursor-pointer"
              aria-label="Next"
            >
              <SkipForward className="w-6 h-6 fill-white" />
            </button>

            <button
              onClick={toggleShuffle}
              className={`transition cursor-pointer ${
                isShuffled ? "text-[#D4FF00]" : "text-white/80 hover:text-white"
              }`}
              aria-label="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>

          {/* Secondary Auxiliary Row matching Image 5: Repeat, HQ, Timer, Shuffle */}
          <div className="flex items-center justify-around pt-6 border-t border-white/10 mt-5 text-gray-300">
            <button
              onClick={toggleRepeat}
              className={`p-1.5 transition cursor-pointer ${
                repeatMode !== "off" ? "text-[#D4FF00]" : "hover:text-white"
              }`}
              title="Repeat"
            >
              {repeatMode === "one" ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>

            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/30 text-white">
              HQ
            </span>

            <button
              onClick={() => {}}
              className="p-1.5 hover:text-white transition cursor-pointer"
              title="Sleep Timer"
            >
              <Clock className="w-4 h-4" />
            </button>

            <button
              onClick={() => {}}
              className="p-1.5 hover:text-white transition cursor-pointer"
              title="Radio Station"
            >
              <Radio className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Padding */}
      <div className="relative z-10 w-full pb-6 text-center">
        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
          RhythmX 320kbps Atmospheric Engine
        </p>
      </div>
    </div>
  );
}
