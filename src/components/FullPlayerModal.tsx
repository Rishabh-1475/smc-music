"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Volume2,
  VolumeX,
  Trash2,
  Music2,
  ListMusic,
  FileText,
  Sparkles,
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

export default function FullPlayerModal() {
  const {
    currentTrack,
    queue,
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    isPlayerOpen,
    isShuffled,
    repeatMode,
    isLiked,
    activeTab,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    setVolume,
    togglePlayerOpen,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    removeFromQueue,
    setActiveTab,
    playSong,
  } = usePlayerStore();

  const [disliked, setDisliked] = useState<Record<string, boolean>>({});
  const [lyricsText, setLyricsText] = useState<string>("Loading lyrics...");
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  // Fetch lyrics dynamically when tab is 'lyrics' or song changes
  useEffect(() => {
    if (!currentTrack || activeTab !== "lyrics") return;
    let active = true;

    async function fetchLyrics() {
      setLoadingLyrics(true);
      try {
        const text = await getLyrics(currentTrack!.id);
        if (active) setLyricsText(text);
      } catch {
        if (active) setLyricsText("[00:00.00] ♪ Instrumental / Lyrics not available ♪");
      } finally {
        if (active) setLoadingLyrics(false);
      }
    }

    fetchLyrics();
    return () => {
      active = false;
    };
  }, [currentTrack?.id, activeTab]);

  if (!isPlayerOpen || !currentTrack) return null;

  const isCurrentLiked = isLiked[currentTrack.id];
  const isCurrentDisliked = disliked[currentTrack.id];

  const handleDislike = () => {
    setDisliked((prev) => ({
      ...prev,
      [currentTrack.id]: !prev[currentTrack.id],
    }));
  };

  const albumName =
    typeof currentTrack.album === "string"
      ? currentTrack.album
      : currentTrack.album?.name || "Single";

  const remainingTime = Math.max(0, duration - currentTime);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white flex flex-col justify-between overflow-hidden select-none animate-in slide-in-from-bottom duration-300">
      {/* Top Navigation Bar */}
      <div className="px-4 md:px-8 py-3.5 flex items-center justify-between border-b border-white/5">
        <button
          onClick={() => togglePlayerOpen(false)}
          className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition active:scale-95"
          aria-label="Dismiss Player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <p className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
            PLAYING FROM PLAYLIST
          </p>
          <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
            {albumName}
          </p>
        </div>

        <button
          className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition"
          aria-label="More Options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area: Switchable by Active Tab */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-12 py-4 flex flex-col justify-center items-center">
        {/* Tab 1: UP NEXT View (Artwork + Player Controls OR Queue List) */}
        {activeTab === "up_next" && (
          <div className="w-full max-w-md mx-auto flex flex-col items-center">
            {/* Centered Large Album Artwork */}
            <div className="relative aspect-square w-64 sm:w-72 md:w-80 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 mb-6 bg-neutral-900">
              <img
                src={currentTrack.imageUrl || FALLBACK_VINYL}
                alt={currentTrack.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                }}
              />
            </div>

            {/* Song Meta & Thumbs Actions */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="min-w-0 flex-1 pr-3">
                <h3 className="text-xl md:text-2xl font-bold text-white truncate leading-tight">
                  {currentTrack.name}
                </h3>
                <p className="text-sm text-neutral-400 truncate mt-1">
                  {currentTrack.primaryArtists}
                </p>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={handleDislike}
                  className={`p-2.5 rounded-full hover:bg-white/10 transition ${
                    isCurrentDisliked ? "text-red-400" : "text-neutral-400"
                  }`}
                  aria-label="Thumbs down"
                >
                  <ThumbsDown
                    className={`w-5 h-5 ${isCurrentDisliked ? "fill-red-400" : ""}`}
                  />
                </button>

                <button
                  onClick={() => toggleLike(currentTrack.id)}
                  className={`p-2.5 rounded-full hover:bg-white/10 transition ${
                    isCurrentLiked ? "text-emerald-400" : "text-neutral-400"
                  }`}
                  aria-label="Thumbs up"
                >
                  <ThumbsUp
                    className={`w-5 h-5 ${isCurrentLiked ? "fill-emerald-400" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Precision Time Scrubber */}
            <div className="w-full mb-4">
              <div
                role="slider"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                tabIndex={0}
                className="relative w-full h-3 cursor-pointer flex items-center group py-2"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickPos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                  const pct = (clickPos / rect.width) * 100;
                  seekTo(pct);
                }}
              >
                <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white group-hover:bg-emerald-400 transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div
                  className="absolute w-3 h-3 bg-white rounded-full -ml-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-neutral-400 font-mono mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>-{formatTime(remainingTime)}</span>
              </div>
            </div>

            {/* Main Playback Transport Bar */}
            <div className="w-full flex items-center justify-between mb-4 px-2">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition ${
                  isShuffled ? "text-emerald-400" : "text-neutral-400 hover:text-white"
                }`}
                aria-label="Toggle Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={playPrev}
                className="p-3 rounded-full text-white hover:bg-white/10 transition active:scale-95"
                aria-label="Previous Track"
              >
                <SkipBack className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-black text-black" />
                ) : (
                  <Play className="w-7 h-7 fill-black text-black ml-1" />
                )}
              </button>

              <button
                onClick={playNext}
                className="p-3 rounded-full text-white hover:bg-white/10 transition active:scale-95"
                aria-label="Next Track"
              >
                <SkipForward className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition ${
                  repeatMode !== "off"
                    ? "text-emerald-400"
                    : "text-neutral-400 hover:text-white"
                }`}
                aria-label="Toggle Repeat"
              >
                {repeatMode === "one" ? (
                  <Repeat1 className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Volume Control */}
            <div className="w-full max-w-xs flex items-center space-x-3 px-2">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 1)}
                className="text-neutral-400 hover:text-white"
                aria-label="Mute toggle"
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
                className="w-full h-1 bg-neutral-800 accent-emerald-500 rounded-lg cursor-pointer"
                aria-label="Volume slider"
              />
            </div>
          </div>
        )}

        {/* Tab 2: LYRICS View */}
        {activeTab === "lyrics" && (
          <div className="w-full max-w-lg mx-auto py-4 text-center">
            <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-6 flex items-center justify-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Synchronized Lyrics</span>
            </h4>
            {loadingLyrics ? (
              <p className="text-neutral-400 text-sm animate-pulse">
                Fetching verified lyrics...
              </p>
            ) : (
              <div className="space-y-4 font-sans text-neutral-200 text-base md:text-lg leading-relaxed whitespace-pre-line">
                {lyricsText}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: RELATED / QUEUE View */}
        {activeTab === "related" && (
          <div className="w-full max-w-xl mx-auto py-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
                <ListMusic className="w-4 h-4 text-emerald-400" />
                <span>Up Next Queue ({queue.length})</span>
              </h4>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto no-scrollbar pr-1">
              {queue.map((track, idx) => {
                const isTrackCurrent = track.id === currentTrack.id;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playSong(track, queue)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                      isTrackCurrent
                        ? "bg-neutral-800 text-emerald-400 font-semibold"
                        : "hover:bg-neutral-850 text-neutral-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <img
                        src={track.imageUrl || FALLBACK_VINYL}
                        alt={track.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="truncate min-w-0 flex-1">
                        <p className="text-sm truncate">{track.name}</p>
                        <p className="text-xs text-neutral-400 truncate">
                          {track.primaryArtists}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {isTrackCurrent ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(idx);
                          }}
                          className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                          aria-label="Remove from queue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tab Switcher (YouTube Music 3-Pill Bottom Dock) */}
      <div className="border-t border-white/10 bg-black/60 backdrop-blur-md px-6 py-2 pb-safe flex items-center justify-around">
        <button
          onClick={() => setActiveTab("up_next")}
          className={`px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition ${
            activeTab === "up_next"
              ? "text-white border-b-2 border-white"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          UP NEXT
        </button>

        <button
          onClick={() => setActiveTab("lyrics")}
          className={`px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition ${
            activeTab === "lyrics"
              ? "text-white border-b-2 border-white"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          LYRICS
        </button>

        <button
          onClick={() => setActiveTab("related")}
          className={`px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition ${
            activeTab === "related"
              ? "text-white border-b-2 border-white"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          QUEUE &amp; RELATED
        </button>
      </div>
    </div>
  );
}
