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
        const tracks = await getRadioForTrack(currentTrack!.primaryArtists || currentTrack!.name);
        if (active) setRelatedTracks(tracks);
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
    const val = parseFloat(e.target.value);
    seekTo(val);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#08080A]/95 backdrop-blur-2xl text-white flex flex-col justify-between overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300 gpu-layer select-none"
    >
      {/* Subtle Burgundy Ambient Background Light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#4A0000]/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Header: Down Chevron, Title & Lossless Audio Badge */}
      <div className="w-full flex items-center justify-between px-4 sm:px-6 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={() => togglePlayerOpen(false)}
          className="p-2 rounded-full hover:bg-white/[0.08] text-neutral-400 hover:text-white transition cursor-pointer"
          aria-label="Collapse player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A8A93]">
            NOW STREAMING
          </p>
          <p className="text-xs font-bold text-white uppercase tracking-wider">
            RHYTHMX /// M-PERFORMANCE
          </p>
        </div>

        <div className="p-2 text-[#E10600]">
          <span className="w-2 h-2 rounded-full bg-[#E10600] inline-block" />
        </div>
      </div>

      {/* Center Artwork & Core Controls Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full py-4">
        {/* Large Crisp Album Artwork */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#08080A] flex-shrink-0">
          <img
            src={currentTrack.imageUrl || FALLBACK_VINYL}
            alt={currentTrack.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
            }}
          />
        </div>

        {/* Track Title, Artist & Like/Dislike Row */}
        <div className="w-full flex items-center justify-between mt-6">
          <div className="min-w-0 flex-1 pr-3">
            <h2 className="text-xl sm:text-2xl font-black text-white truncate leading-tight">
              {currentTrack.name}
            </h2>
            <p className="text-sm font-medium text-[#8A8A93] truncate mt-1">
              {currentTrack.primaryArtists}
            </p>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={() => toggleLike(currentTrack)}
              className={`p-2.5 rounded-full hover:bg-white/[0.08] transition cursor-pointer ${
                isLiked ? "text-[#E10600]" : "text-neutral-400 hover:text-white"
              }`}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <ThumbsUp
                className={`w-5 h-5 ${isLiked ? "fill-[#E10600] stroke-[#E10600]" : ""}`}
              />
            </button>

            <button
              onClick={() => toggleDislike(currentTrack)}
              className={`p-2.5 rounded-full hover:bg-white/[0.08] transition cursor-pointer ${
                isDisliked ? "text-neutral-300" : "text-neutral-500 hover:text-white"
              }`}
              aria-label="Dislike"
            >
              <ThumbsDown
                className={`w-5 h-5 ${isDisliked ? "fill-neutral-300 stroke-neutral-300" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Interactive Progress Scrubber & Timers */}
        <div className="w-full mt-5">
          <div className="relative flex items-center group">
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E10600] hover:h-2 transition-all"
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-[#8A8A93] mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Primary Playback Controls: Shuffle, Prev, Play/Pause, Next, Repeat */}
        <div className="w-full flex items-center justify-between mt-4 px-2">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full hover:bg-white/[0.08] transition cursor-pointer ${
              isShuffled ? "text-[#E10600]" : "text-neutral-400 hover:text-white"
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={playPrev}
            className="p-2 text-white hover:text-neutral-300 hover:bg-white/[0.08] rounded-full transition active:scale-95 cursor-pointer"
            aria-label="Previous track"
          >
            <SkipBack className="w-7 h-7 fill-white" />
          </button>

          {/* Solid Crimson Play/Pause Center Hub */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white flex items-center justify-center transition shadow-lg shadow-[#E10600]/40 active:scale-95 cursor-pointer"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-white text-white" />
            ) : (
              <Play className="w-8 h-8 fill-white text-white ml-1" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={playNext}
            className="p-2 text-white hover:text-neutral-300 hover:bg-white/[0.08] rounded-full transition active:scale-95 cursor-pointer"
            aria-label="Next track"
          >
            <SkipForward className="w-7 h-7 fill-white" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full hover:bg-white/[0.08] transition cursor-pointer ${
              repeatMode !== "off"
                ? "text-[#E10600]"
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
            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E10600]"
          />
        </div>
      </div>

      {/* 3-Tab Bottom Drawer: [UP NEXT] • [LYRICS] • [RELATED] */}
      <div className="w-full max-w-xl mx-auto px-4 pb-6 flex-shrink-0">
        <div className="flex items-center justify-around border-b border-white/[0.08] pb-2 mb-3">
          <button
            onClick={() => setActiveTab("up_next")}
            className={`flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider py-1.5 cursor-pointer transition ${
              activeTab === "up_next"
                ? "text-white border-b-2 border-[#E10600]"
                : "text-[#8A8A93] hover:text-white"
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Up Next</span>
          </button>

          <button
            onClick={() => setActiveTab("lyrics")}
            className={`flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider py-1.5 cursor-pointer transition ${
              activeTab === "lyrics"
                ? "text-white border-b-2 border-[#E10600]"
                : "text-[#8A8A93] hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => setActiveTab("related")}
            className={`flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider py-1.5 cursor-pointer transition ${
              activeTab === "related"
                ? "text-white border-b-2 border-[#E10600]"
                : "text-[#8A8A93] hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Related</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="max-h-48 overflow-y-auto no-scrollbar rounded-xl bg-[#111116] border border-white/[0.08] p-3">
          {/* UP NEXT TAB */}
          {activeTab === "up_next" && (
            <div className="space-y-1.5">
              {queue.map((song, idx) => {
                const isItemCurrent = currentTrack.id === song.id;
                return (
                  <div
                    key={`${song.id}-${idx}`}
                    onClick={() => playSong(song, queue)}
                    className={`flex items-center justify-between p-2 rounded-lg transition cursor-pointer ${
                      isItemCurrent
                        ? "bg-[#181822] text-[#E10600] border border-[#E10600]/30"
                        : "hover:bg-[#14141C] text-neutral-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="relative w-9 h-9 rounded-md overflow-hidden flex-shrink-0 bg-[#08080A]">
                        <img
                          src={song.imageUrl || FALLBACK_VINYL}
                          alt={song.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate min-w-0">
                        <p className="text-xs font-bold truncate">{song.name}</p>
                        <p className="text-[10px] text-[#8A8A93] truncate">
                          {song.primaryArtists}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(idx);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-[#E10600] transition"
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
                  Fetching lyrics...
                </p>
              ) : (
                <pre className="text-xs font-mono text-[#F0F0F2] whitespace-pre-wrap leading-relaxed">
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
                  Discovering similar tracks...
                </p>
              ) : (
                relatedTracks.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, relatedTracks)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[#16161C] transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="relative w-9 h-9 rounded-md overflow-hidden flex-shrink-0 bg-[#08080A]">
                        <img
                          src={song.imageUrl || FALLBACK_VINYL}
                          alt={song.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate min-w-0">
                        <p className="text-xs font-bold text-white truncate">{song.name}</p>
                        <p className="text-[10px] text-[#8A8A93] truncate">
                          {song.primaryArtists}
                        </p>
                      </div>
                    </div>
                    <Play className="w-3.5 h-3.5 text-[#E10600]" />
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
