"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCw,
  Compass,
  Volume2,
} from "lucide-react";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";
import { getDynamicAutoplayQueue, getRadioForTrack } from "@/services/api";

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

const formatTime = (secs: number): string => {
  if (isNaN(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export default function GalaxyVisualizer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    togglePlay,
    playSong,
    playNext,
    playPrev,
    seekTo,
    queue,
  } = usePlayerStore();

  const [clusterNodes, setClusterNodes] = useState<Song[]>([]);
  const [loadingCluster, setLoadingCluster] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 400, height: 500 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track the center seed track
  const activeSeed =
    currentTrack ||
    queue[0] || {
      id: "seed_galaxy",
      name: "RhythmX Constellation",
      title: "RhythmX Constellation",
      album: "Galaxy Mix",
      primaryArtists: "Sonic Discovery",
      duration: 210,
      imageUrl: FALLBACK_VINYL,
      audioUrl: "",
    };

  // Measure container dimensions for responsive SVG lines
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Fetch 6 to 8 surrounding related tracks when activeSeed changes
  useEffect(() => {
    let active = true;

    async function loadCluster() {
      if (!activeSeed || !activeSeed.id) return;
      setLoadingCluster(true);
      try {
        const fresh = await getDynamicAutoplayQueue(activeSeed);
        if (active) {
          const filtered = fresh
            .filter((t) => t.id !== activeSeed.id && t.imageUrl)
            .slice(0, 7);
          setClusterNodes(filtered);
        }
      } catch (err) {
        console.warn("Galaxy cluster fetch error:", err);
        if (active) {
          const fallback = queue.filter((t) => t.id !== activeSeed.id).slice(0, 7);
          setClusterNodes(fallback);
        }
      } finally {
        if (active) setLoadingCluster(false);
      }
    }

    loadCluster();
    return () => {
      active = false;
    };
  }, [activeSeed.id]);

  // Center coordinates in pixels
  const cx = dimensions.width / 2;
  const cy = (dimensions.height - 110) / 2; // leave room for bottom dock
  const radius = Math.min(dimensions.width, dimensions.height) * 0.36;

  // Calculate coordinates for each outer node in cluster
  const nodePositions = clusterNodes.map((song, i) => {
    const total = clusterNodes.length || 1;
    // Distribute angles evenly with an aesthetic offset
    const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
    // Slight organic jitter
    const rVar = radius + (i % 2 === 0 ? 12 : -12);
    const x = cx + rVar * Math.cos(angle);
    const y = cy + rVar * Math.sin(angle);
    return { song, x, y, angle };
  });

  const handleNodeClick = (nodeSong: Song) => {
    playSong(nodeSong);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-140px)] min-h-[550px] max-h-[780px] bg-[#0A0A0C] overflow-hidden rounded-3xl border border-white/[0.06] flex flex-col justify-between select-none shadow-2xl gpu-layer my-2"
    >
      {/* Background Starlight & Ambient Nebulae */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e2d_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#7c3aed]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#D2FF1F]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[#D2FF1F]/10 border border-[#D2FF1F]/30 flex items-center justify-center text-[#D2FF1F]">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight leading-tight">
              Music Galaxy
            </h3>
            <p className="text-[10px] font-mono text-[#D2FF1F] uppercase tracking-wider">
              {clusterNodes.length} Linked Constellations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {loadingCluster && (
            <span className="flex items-center space-x-1 text-[11px] font-mono text-neutral-400">
              <RotateCw className="w-3 h-3 animate-spin text-[#D2FF1F]" />
              <span>Mapping nodes...</span>
            </span>
          )}
        </div>
      </div>

      {/* Interactive Spider-Web Node Graph Canvas */}
      <div className="relative flex-1 w-full h-full">
        {/* SVG Curved Organic Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="limeLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D2FF1F" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {nodePositions.map((pos, idx) => {
            // Subtle curve calculation
            const midX = (cx + pos.x) / 2 + (idx % 2 === 0 ? 15 : -15);
            const midY = (cy + pos.y) / 2 + (idx % 2 === 0 ? -15 : 15);

            return (
              <g key={`svg-line-${idx}`}>
                {/* Organic curved connector */}
                <path
                  d={`M ${cx} ${cy} Q ${midX} ${midY} ${pos.x} ${pos.y}`}
                  fill="none"
                  stroke="url(#limeLineGrad)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
                {/* Micro orbit particle */}
                <circle cx={midX} cy={midY} r="2" fill="#D2FF1F" opacity="0.6" />
              </g>
            );
          })}
        </svg>

        {/* Center Seed Node (Active Song) */}
        <div
          style={{
            position: "absolute",
            left: `${cx}px`,
            top: `${cy}px`,
            transform: "translate(-50%, -50%)",
          }}
          className="z-20 flex flex-col items-center cursor-pointer group"
          onClick={togglePlay}
        >
          {/* Animated Pulsing Orbit Ring */}
          <div className="relative">
            <div
              className={`absolute -inset-3 rounded-full border-2 border-[#D2FF1F]/40 pointer-events-none ${
                isPlaying ? "animate-ping opacity-60" : "opacity-20"
              }`}
            />
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-[#D2FF1F] shadow-[0_0_35px_rgba(210,255,31,0.45)] bg-neutral-900 flex items-center justify-center">
              <img
                src={activeSeed.imageUrl || FALLBACK_VINYL}
                alt={activeSeed.name}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? "animate-spin-slow" : ""
                }`}
              />
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-white text-white" />
                ) : (
                  <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                )}
              </div>
            </div>
          </div>

          {/* Center Track Label */}
          <div className="mt-2.5 px-3 py-1 rounded-full bg-[#121217]/90 border border-white/10 backdrop-blur-md text-center max-w-[160px] shadow-lg">
            <p className="text-xs font-bold text-white truncate leading-tight">
              {activeSeed.name}
            </p>
            <p className="text-[10px] text-[#D2FF1F] truncate font-medium">
              {activeSeed.primaryArtists}
            </p>
          </div>
        </div>

        {/* Branching Outer Nodes */}
        {nodePositions.map(({ song, x, y }, i) => (
          <div
            key={`node-${song.id}-${i}`}
            style={{
              position: "absolute",
              left: `${x}px`,
              top: `${y}px`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => handleNodeClick(song)}
            className="z-10 flex flex-col items-center cursor-pointer group transition-transform duration-300 hover:scale-115 active:scale-95"
          >
            {/* Outer Circular Artwork Node */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-[#D2FF1F] group-hover:ring-4 group-hover:ring-[#D2FF1F]/30 shadow-xl bg-neutral-900 transition-all">
              <img
                src={song.imageUrl || FALLBACK_VINYL}
                alt={song.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-4 h-4 fill-[#D2FF1F] text-[#D2FF1F] ml-0.5" />
              </div>
            </div>

            {/* Micro Badge */}
            <div className="mt-1 px-2 py-0.5 rounded-md bg-[#0D0D14]/90 border border-white/10 max-w-[100px] text-center shadow-md">
              <p className="text-[10px] font-semibold text-neutral-200 group-hover:text-[#D2FF1F] truncate transition-colors">
                {song.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Mini-Dock matching Reference 2 */}
      <div className="relative z-20 px-4 sm:px-6 py-3.5 bg-[#121217]/95 border-t border-white/[0.08] backdrop-blur-xl flex flex-col gap-2">
        {/* Hairline Waveform Scrubber */}
        <div className="w-full">
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#D2FF1F]"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Transport Controls Row */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-3">
            <h4 className="text-sm font-bold text-white truncate leading-tight">
              {activeSeed.name}
            </h4>
            <p className="text-xs text-neutral-400 truncate mt-0.5 font-medium">
              {activeSeed.primaryArtists}
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={playPrev}
              className="p-2 rounded-full text-neutral-400 hover:text-white transition cursor-pointer"
              aria-label="Previous"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[#D2FF1F] hover:bg-[#bceb15] text-black flex items-center justify-center transition shadow-md shadow-[#D2FF1F]/30 active:scale-95 cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black text-black" />
              ) : (
                <Play className="w-4 h-4 fill-black text-black ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-2 rounded-full text-neutral-400 hover:text-white transition cursor-pointer"
              aria-label="Next"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
