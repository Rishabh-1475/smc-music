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
  ArrowUp,
  ArrowDown,
  ListMusic,
  FileText,
  Radio,
  Sparkles,
  Share2,
} from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { getLyrics, searchSongs } from "@/services/api";
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
    isLiked,
    autoplay,
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
    removeFromQueue,
    setActiveTab,
    playSong,
    reorderQueue,
    toggleAutoplay,
  } = usePlayerStore();

  const [disliked, setDisliked] = useState<Record<string, boolean>>({});
  const [lyricsText, setLyricsText] = useState<string>("Loading lyrics...");
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [relatedTracks, setRelatedTracks] = useState<Song[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // Fetch dynamic lyrics on track change or lyrics tab activation
  useEffect(() => {
    if (!currentTrack) return;
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

    if (activeTab === "lyrics" || showDrawer) {
      fetchLyrics();
    }

    return () => {
      active = false;
    };
  }, [currentTrack?.id, activeTab, showDrawer]);

  // Fetch related tracks when related tab is activated
  useEffect(() => {
    if (!currentTrack) return;
    let active = true;

    async function fetchRelated() {
      setLoadingRelated(true);
      try {
        const query = currentTrack!.primaryArtists?.split(",")[0]?.trim() || currentTrack!.name;
        const results = await searchSongs(query);
        if (active) {
          setRelatedTracks(results.filter((s) => s.id !== currentTrack!.id));
        }
      } catch {
        if (active) setRelatedTracks([]);
      } finally {
        if (active) setLoadingRelated(false);
      }
    }

    if (activeTab === "related" || showDrawer) {
      fetchRelated();
    }

    return () => {
      active = false;
    };
  }, [currentTrack?.id, activeTab, showDrawer]);

  if (!isPlayerOpen || !currentTrack) return null;

  const isCurrentLiked = isLiked?.[currentTrack.id] || false;
  const isCurrentDisliked = disliked[currentTrack.id] || false;

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

  const handleTabClick = (tab: "up_next" | "lyrics" | "related") => {
    setActiveTab(tab);
    setShowDrawer(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030303] text-white flex flex-col justify-between overflow-hidden select-none animate-in slide-in-from-bottom duration-300">
      {/* 1. Top Bar: Down Chevron, Header Title, Menu */}
      <div className="px-4 md:px-8 py-3.5 flex items-center justify-between border-b border-white/5 bg-[#030303]/80 backdrop-blur-md z-10">
        <button
          onClick={() => {
            setShowDrawer(false);
            togglePlayerOpen(false);
          }}
          className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition active:scale-95"
          aria-label="Dismiss Player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center px-4">
          <p className="text-[10px] md:text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
            PLAYING FROM PLAYLIST
          </p>
          <p className="text-xs md:text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {albumName}
          </p>
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: currentTrack.name,
                text: `Listening to ${currentTrack.name} by ${currentTrack.primaryArtists} on SMC Music`,
                url: window.location.href,
              });
            }
          }}
          className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition"
          aria-label="Share Track"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Middle Content Area: Artwork & Controls OR Sliding Drawer */}
      <div className="relative flex-1 overflow-y-auto no-scrollbar px-6 md:px-12 py-4 flex flex-col items-center justify-center">
        {/* Main Artwork & Controls View */}
        <div
          className={`w-full max-w-md mx-auto flex flex-col items-center transition-opacity duration-300 ${
            showDrawer ? "opacity-0 pointer-events-none absolute" : "opacity-100"
          }`}
        >
          {/* Centered Large Rounded Album Cover with Subtle Drop Shadow */}
          <div className="relative aspect-square w-64 sm:w-72 md:w-80 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] ring-1 ring-white/10 mb-6 bg-neutral-900 group">
            <img
              src={currentTrack.imageUrl || FALLBACK_VINYL}
              alt={currentTrack.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
              }}
            />
          </div>

          {/* Controls: Track Title, Artist, Thumbs Up / Thumbs Down */}
          <div className="w-full flex items-center justify-between mb-4">
            <div className="min-w-0 flex-1 pr-3">
              <h3 className="text-xl md:text-2xl font-bold text-white truncate leading-tight">
                {currentTrack.name}
              </h3>
              <p className="text-sm text-neutral-400 truncate mt-1">
                {currentTrack.primaryArtists}
              </p>
            </div>

            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <button
                onClick={handleDislike}
                className={`p-2.5 rounded-full hover:bg-white/10 transition ${
                  isCurrentDisliked ? "text-red-400" : "text-neutral-400 hover:text-white"
                }`}
                aria-label="Thumbs Down"
              >
                <ThumbsDown
                  className={`w-5 h-5 ${isCurrentDisliked ? "fill-red-400 stroke-red-400" : ""}`}
                />
              </button>

              <button
                onClick={() => toggleLike(currentTrack.id)}
                className={`p-2.5 rounded-full hover:bg-white/10 transition ${
                  isCurrentLiked ? "text-emerald-400" : "text-neutral-400 hover:text-white"
                }`}
                aria-label="Thumbs Up"
              >
                <ThumbsUp
                  className={`w-5 h-5 ${isCurrentLiked ? "fill-emerald-400 stroke-emerald-400" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Interactive Seek Slider with Elapsed and Remaining Timestamps */}
          <div className="w-full mb-4">
            <div
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              tabIndex={0}
              className="relative w-full h-4 cursor-pointer flex items-center group py-2"
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
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
              </div>
              <div
                className="absolute w-3.5 h-3.5 bg-white rounded-full -ml-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-neutral-400 font-mono mt-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>-{formatTime(remainingTime)}</span>
            </div>
          </div>

          {/* Main Playback Controls: Shuffle, Prev, Play/Pause, Next, Repeat */}
          <div className="w-full flex items-center justify-between mb-4 px-2">
            {/* Shuffle Toggle */}
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition ${
                isShuffled ? "text-emerald-400" : "text-neutral-400 hover:text-white"
              }`}
              aria-label="Toggle Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Next / Prev Buttons */}
            <button
              onClick={playPrev}
              className="p-3 rounded-full text-white hover:bg-white/10 transition active:scale-95"
              aria-label="Previous Track"
            >
              <SkipBack className="w-7 h-7 fill-current" />
            </button>

            {/* Large Play/Pause Button */}
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

            {/* Next Button */}
            <button
              onClick={playNext}
              className="p-3 rounded-full text-white hover:bg-white/10 transition active:scale-95"
              aria-label="Next Track"
            >
              <SkipForward className="w-7 h-7 fill-current" />
            </button>

            {/* Repeat Toggle */}
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
              className="text-neutral-400 hover:text-white transition"
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

        {/* Sliding Drawer View when an interactive Tab is open */}
        {showDrawer && (
          <div className="w-full max-w-xl mx-auto h-full flex flex-col justify-start py-2 animate-in fade-in duration-200">
            {/* Drawer Close / Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {activeTab === "up_next"
                  ? "Playing Queue"
                  : activeTab === "lyrics"
                  ? "Song Lyrics"
                  : "Related Recommendations"}
              </span>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded bg-[#212121] transition"
              >
                Back to Player
              </button>
            </div>

            {/* TAB 1: UP NEXT Interactive Queue with Reorder, Remove & Autoplay Switch */}
            {activeTab === "up_next" && (
              <div className="w-full flex-1 flex flex-col min-h-0">
                {/* Autoplay Toggle Switch */}
                <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#181818] border border-white/5 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Autoplay</p>
                    <p className="text-[11px] text-neutral-400">
                      Similar songs will keep playing automatically
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (toggleAutoplay) toggleAutoplay();
                    }}
                    role="switch"
                    aria-checked={autoplay}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      autoplay ? "bg-emerald-500" : "bg-neutral-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        autoplay ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Queue List with Re-order & Remove Options */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 max-h-[380px] pr-1">
                  {queue.map((track, idx) => {
                    const isTrackCurrent = track.id === currentTrack.id;
                    return (
                      <div
                        key={`${track.id}-${idx}`}
                        onClick={() => playSong(track, queue)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                          isTrackCurrent
                            ? "bg-[#212121] text-emerald-400 font-semibold shadow"
                            : "hover:bg-[#181818] text-neutral-300"
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

                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          {isTrackCurrent ? (
                            <div className="flex items-center space-x-1 px-2">
                              <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-pulse" />
                              <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse delay-75" />
                              <span className="w-1.5 h-2 bg-emerald-400 rounded-full animate-pulse delay-150" />
                            </div>
                          ) : (
                            <>
                              {/* Re-order Up */}
                              {idx > 0 && reorderQueue && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    reorderQueue(idx, idx - 1);
                                  }}
                                  className="p-1 text-neutral-400 hover:text-white transition"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Re-order Down */}
                              {idx < queue.length - 1 && reorderQueue && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    reorderQueue(idx, idx + 1);
                                  }}
                                  className="p-1 text-neutral-400 hover:text-white transition"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Remove from Queue */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromQueue(idx);
                                }}
                                className="p-1 text-neutral-500 hover:text-red-400 transition"
                                title="Remove from queue"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: LYRICS Synchronized / Formatted Typography */}
            {activeTab === "lyrics" && (
              <div className="w-full flex-1 overflow-y-auto no-scrollbar py-4 text-center">
                <div className="mb-4 flex items-center justify-center space-x-2 text-emerald-400 text-sm font-semibold uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Synchronized Lyrics</span>
                </div>
                {loadingLyrics ? (
                  <p className="text-neutral-400 text-sm animate-pulse my-8">
                    Fetching verified lyrics...
                  </p>
                ) : (
                  <div className="space-y-4 font-sans text-neutral-200 text-base md:text-lg leading-relaxed whitespace-pre-line px-4">
                    {lyricsText}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: RELATED Dynamic Suggestions */}
            {activeTab === "related" && (
              <div className="w-full flex-1 overflow-y-auto no-scrollbar py-2">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-white text-sm font-semibold">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Recommended for You</span>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">
                    {relatedTracks.length} tracks
                  </span>
                </div>

                {loadingRelated ? (
                  <div className="space-y-2 py-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-12 bg-neutral-900 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : relatedTracks.length > 0 ? (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar">
                    {relatedTracks.map((song) => (
                      <div
                        key={song.id}
                        onClick={() => playSong(song, [song, ...relatedTracks])}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-[#181818] cursor-pointer transition"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <img
                            src={song.imageUrl || FALLBACK_VINYL}
                            alt={song.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="truncate min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">
                              {song.name}
                            </p>
                            <p className="text-xs text-neutral-400 truncate">
                              {song.primaryArtists}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playSong(song, [song, ...relatedTracks]);
                          }}
                          className="p-2 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 transition"
                          aria-label="Play Track"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-neutral-400">
                    <Radio className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
                    <p className="text-sm">No related recommendations found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Bottom Sliding Tabs (YouTube Music 3-Pill Switcher) */}
      <div className="border-t border-white/10 bg-[#030303]/90 backdrop-blur-md px-6 py-2.5 pb-safe flex items-center justify-around z-10">
        <button
          onClick={() => handleTabClick("up_next")}
          className={`px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition cursor-pointer ${
            showDrawer && activeTab === "up_next"
              ? "text-white border-b-2 border-white scale-105"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          UP NEXT
        </button>

        <button
          onClick={() => handleTabClick("lyrics")}
          className={`px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition cursor-pointer ${
            showDrawer && activeTab === "lyrics"
              ? "text-white border-b-2 border-white scale-105"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          LYRICS
        </button>

        <button
          onClick={() => handleTabClick("related")}
          className={`px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition cursor-pointer ${
            showDrawer && activeTab === "related"
              ? "text-white border-b-2 border-white scale-105"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          RELATED
        </button>
      </div>
    </div>
  );
}
