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
  Volume2,
  VolumeX,
  Trash2,
  Radio,
  FileText,
  ListMusic,
  Share2,
} from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { getLyrics, getRadioForTrack } from "@/services/api";
import { Song } from "@/types/music";

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
    likedSongIds,
    dislikedSongIds,
    activeTab = "up_next",
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    setVolume,
    togglePlayerOpen,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    toggleDislike,
    removeFromQueue,
    setActiveTab,
    playSong,
  } = usePlayerStore();

  const [lyricsText, setLyricsText] = useState<string>("Loading lyrics...");
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [relatedTracks, setRelatedTracks] = useState<Song[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Fetch dynamic lyrics on song change or when tab is open
  useEffect(() => {
    if (!currentTrack) return;
    let active = true;

    async function fetchLyrics() {
      setLoadingLyrics(true);
      try {
        const text = await getLyrics(currentTrack!.name, currentTrack!.primaryArtists);
        if (active) setLyricsText(text);
      } catch {
        if (active) setLyricsText("[00:00.00] ♪ Instrumental / Lyrics not available ♪");
      } finally {
        if (active) setLoadingLyrics(false);
      }
    }

    if (activeTab === "lyrics") {
      fetchLyrics();
    }

    return () => {
      active = false;
    };
  }, [currentTrack?.id, activeTab]);

  // Fetch related artist radio when Related tab is selected
  useEffect(() => {
    if (!currentTrack) return;
    let active = true;

    async function fetchRelated() {
      setLoadingRelated(true);
      try {
        const artist =
          currentTrack!.primaryArtists?.split(",")[0]?.trim() || currentTrack!.name;
        const radio = await getRadioForTrack(artist);
        if (active) setRelatedTracks(radio);
      } catch {
        if (active) setRelatedTracks([]);
      } finally {
        if (active) setLoadingRelated(false);
      }
    }

    if (activeTab === "related") {
      fetchRelated();
    }

    return () => {
      active = false;
    };
  }, [currentTrack?.id, activeTab]);

  if (!isPlayerOpen || !currentTrack) return null;

  const isLiked = Boolean(likedSongIds[currentTrack.id]);
  const isDisliked = Boolean(dislikedSongIds[currentTrack.id]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(parseFloat(e.target.value));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#050508]/98 backdrop-blur-3xl flex flex-col justify-between overflow-y-auto pt-safe pb-safe animate-in slide-in-from-bottom duration-300"
    >
      {/* Top Header: Collapse chevron + Track Context */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
        <button
          onClick={() => togglePlayerOpen(false)}
          className="p-2 -ml-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          aria-label="Collapse player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center truncate px-4">
          <p className="text-[10px] uppercase tracking-widest text-[#00FF87] font-bold">
            PLAYING FROM RHYTHMX ENGINE
          </p>
          <p className="text-xs font-semibold text-white truncate mt-0.5">
            {currentTrack.album || "Single"}
          </p>
        </div>

        <div className="w-8" />
      </div>

      {/* Center Body: 3D Artwork + Controls + Scrubber */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full px-6 py-4">
        {/* Large 3D Rounded-3xl Album Cover with Dynamic Ambient Color Glow */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 my-3 flex-shrink-0 group">
          {/* Ambient Glow Underlay */}
          <div
            className="absolute inset-0 rounded-3xl blur-2xl opacity-60 bg-gradient-to-tr from-[#00FF87] via-[#00F0FF] to-[#7928CA] transition-all duration-700 pointer-events-none"
            style={{
              transform: isPlaying ? "scale(1.08)" : "scale(0.95)",
            }}
          />

          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/15 bg-neutral-900">
            <img
              src={currentTrack.imageUrl || FALLBACK_VINYL}
              alt={currentTrack.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
              }}
            />
          </div>
        </div>

        {/* Track Metadata & Quick Thumbs Up/Down */}
        <div className="w-full flex items-center justify-between mt-4">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
              {currentTrack.name}
            </h2>
            <p className="text-sm font-semibold text-neutral-400 truncate mt-1">
              {currentTrack.primaryArtists}
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => toggleLike(currentTrack)}
              className={`p-2.5 rounded-full hover:bg-white/10 transition cursor-pointer ${
                isLiked ? "text-[#00FF87]" : "text-neutral-400 hover:text-white"
              }`}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <ThumbsUp
                className={`w-5 h-5 ${isLiked ? "fill-[#00FF87] stroke-[#00FF87]" : ""}`}
              />
            </button>

            <button
              onClick={() => toggleDislike(currentTrack)}
              className={`p-2.5 rounded-full hover:bg-white/10 transition cursor-pointer ${
                isDisliked ? "text-red-400" : "text-neutral-400 hover:text-white"
              }`}
              aria-label="Dislike"
            >
              <ThumbsDown
                className={`w-5 h-5 ${isDisliked ? "fill-red-400 stroke-red-400" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Interactive Waveform Scrubber & Timers */}
        <div className="w-full mt-5">
          <div className="relative flex items-center group">
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#00FF87] hover:h-2 transition-all"
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-neutral-400 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Primary Playback Controls: Shuffle, Prev, Play/Pause, Next, Repeat */}
        <div className="w-full flex items-center justify-between mt-4 px-2">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full hover:bg-white/10 transition cursor-pointer ${
              isShuffled ? "text-[#00FF87]" : "text-neutral-400 hover:text-white"
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={playPrev}
            className="p-2 text-white hover:text-neutral-300 hover:bg-white/10 rounded-full transition active:scale-95 cursor-pointer"
            aria-label="Previous track"
          >
            <SkipBack className="w-7 h-7 fill-white" />
          </button>

          {/* 3D Play/Pause Center Hub */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00FF87] to-[#00F0FF] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-[0_0_25px_rgba(0,255,135,0.5)] cursor-pointer"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-black text-black" />
            ) : (
              <Play className="w-8 h-8 fill-black text-black ml-1" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={playNext}
            className="p-2 text-white hover:text-neutral-300 hover:bg-white/10 rounded-full transition active:scale-95 cursor-pointer"
            aria-label="Next track"
          >
            <SkipForward className="w-7 h-7 fill-white" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full hover:bg-white/10 transition cursor-pointer ${
              repeatMode !== "off"
                ? "text-[#00FF87]"
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

        {/* Volume Slider */}
        <div className="w-full flex items-center space-x-3 mt-4 px-4 max-w-xs">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 1)}
            className="text-neutral-400 hover:text-white transition"
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#00FF87]"
          />
        </div>
      </div>

      {/* 3-Tab Bottom Drawer: [UP NEXT] • [LYRICS] • [RELATED] */}
      <div className="w-full max-w-xl mx-auto px-4 pb-6 flex-shrink-0">
        <div className="flex items-center justify-around border-b border-white/10 pb-2 mb-3">
          <button
            onClick={() => setActiveTab("up_next")}
            className={`flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider py-1.5 cursor-pointer transition ${
              activeTab === "up_next"
                ? "text-[#00FF87] border-b-2 border-[#00FF87]"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Up Next</span>
          </button>

          <button
            onClick={() => setActiveTab("lyrics")}
            className={`flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider py-1.5 cursor-pointer transition ${
              activeTab === "lyrics"
                ? "text-[#00FF87] border-b-2 border-[#00FF87]"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => setActiveTab("related")}
            className={`flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider py-1.5 cursor-pointer transition ${
              activeTab === "related"
                ? "text-[#00FF87] border-b-2 border-[#00FF87]"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Related</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="max-h-48 overflow-y-auto no-scrollbar rounded-2xl bg-[#0D0D12] border border-white/5 p-3">
          {/* UP NEXT TAB */}
          {activeTab === "up_next" && (
            <div className="space-y-1.5">
              {queue.map((song, idx) => {
                const isItemCurrent = currentTrack.id === song.id;
                return (
                  <div
                    key={`${song.id}-${idx}`}
                    onClick={() => playSong(song, queue)}
                    className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer ${
                      isItemCurrent
                        ? "bg-[#181820] text-[#00FF87] border border-[#00FF87]/30"
                        : "hover:bg-[#14141A] text-neutral-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900">
                        <img
                          src={song.imageUrl || FALLBACK_VINYL}
                          alt={song.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate min-w-0">
                        <p className="text-xs font-bold truncate">{song.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {song.primaryArtists}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(idx);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-red-400 transition"
                      aria-label="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* LYRICS TAB */}
          {activeTab === "lyrics" && (
            <div className="text-center py-3">
              {loadingLyrics ? (
                <p className="text-xs text-neutral-400 animate-pulse">
                  Fetching synchronized lyrics...
                </p>
              ) : (
                <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {lyricsText}
                </pre>
              )}
            </div>
          )}

          {/* RELATED TAB */}
          {activeTab === "related" && (
            <div className="space-y-1.5">
              {loadingRelated ? (
                <p className="text-xs text-neutral-400 text-center py-4 animate-pulse">
                  Discovering artist radio &amp; similar hits...
                </p>
              ) : (
                relatedTracks.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, relatedTracks)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#14141A] transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900">
                        <img
                          src={song.imageUrl || FALLBACK_VINYL}
                          alt={song.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate min-w-0">
                        <p className="text-xs font-bold text-white truncate">{song.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {song.primaryArtists}
                        </p>
                      </div>
                    </div>
                    <Play className="w-3.5 h-3.5 text-[#00FF87]" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
