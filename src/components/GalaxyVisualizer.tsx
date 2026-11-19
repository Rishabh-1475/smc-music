"use client";

import React, { useState, useEffect, useRef } from "react";
import { Compass, RotateCw, Play, Pause, Sparkles } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";
import { getDynamicAutoplayQueue } from "@/services/api";
import { getSongCover, decodeHtmlEntities } from "./TopDailyPlaylists";
import curatedTracks from "@/services/curatedTracks.json";

const DEFAULT_CENTER_SONG: Song = {
  id: "galaxy_default_center",
  name: "Blinding Lights",
  title: "Blinding Lights",
  primaryArtists: "The Weeknd",
  album: "After Hours",
  duration: 200,
  imageUrl: "https://c.saavncdn.com/649/After-Hours-English-2020-20200320011002-500x500.jpg",
  audioUrl: "",
};

// Initial static seed pool to guarantee zero "0 linked constellations" on mount
const INITIAL_SEED_SATELLITES: Song[] = [
  {
    id: "seed_1",
    name: "Labon Ko",
    title: "Labon Ko",
    primaryArtists: "KK, Pritam",
    album: "Bhool Bhulaiyaa",
    duration: 341,
    imageUrl: "https://c.saavncdn.com/024/Bhool-Bhulaiyaa-Hindi-2007-20220914170601-500x500.jpg",
    audioUrl: "",
  },
  {
    id: "seed_2",
    name: "STAY",
    title: "STAY",
    primaryArtists: "The Kid LAROI, Justin Bieber",
    album: "F*CK LOVE 3",
    duration: 141,
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
    audioUrl: "",
  },
  {
    id: "seed_3",
    name: "Legends Never Die",
    title: "Legends Never Die",
    primaryArtists: "Juice WRLD",
    album: "Legends Never Die",
    duration: 196,
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80",
    audioUrl: "",
  },
  {
    id: "seed_4",
    name: "Tum Hi Ho",
    title: "Tum Hi Ho",
    primaryArtists: "Arijit Singh, Mithoon",
    album: "Aashiqui 2",
    duration: 261,
    imageUrl: "https://c.saavncdn.com/179/World-Music-Day-Best-Of-Bollywood-Hits-Hindi-2026-20260622111029-500x500.jpg",
    audioUrl: "",
  },
  {
    id: "seed_5",
    name: "Apna Bana Le",
    title: "Apna Bana Le",
    primaryArtists: "Arijit Singh, Sachin-Jigar",
    album: "Bhediya",
    duration: 261,
    imageUrl: "https://c.saavncdn.com/675/Trending-Love-Songs-Hindi-2026-20260506185328-500x500.jpg",
    audioUrl: "",
  },
  {
    id: "seed_6",
    name: "Starboy",
    title: "Starboy",
    primaryArtists: "The Weeknd, Daft Punk",
    album: "Starboy",
    duration: 230,
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
    audioUrl: "",
  },
  {
    id: "seed_7",
    name: "Calm Your Soul",
    title: "Calm Your Soul",
    primaryArtists: "Goodeech Design",
    album: "Synthwave Vibes",
    duration: 167,
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80",
    audioUrl: "",
  },
];

export default function GalaxyVisualizer() {
  const { currentTrack, isPlaying, togglePlay, playSong, queue } =
    usePlayerStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 390, height: 560 });
  const [satellites, setSatellites] = useState<Song[]>(INITIAL_SEED_SATELLITES);
  const [loadingNodes, setLoadingNodes] = useState(false);

  // If currentTrack is null, pick first song from playlist/queue as centerNode
  const centerSong: Song =
    currentTrack ||
    (queue.length > 0 ? queue[0] : null) ||
    ((curatedTracks.trendingHits as any)?.[0] as Song) ||
    DEFAULT_CENTER_SONG;

  // Measure container dimensions for responsive SVG layout
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 390,
          height: containerRef.current.clientHeight || 560,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Fetch or slice 6 to 8 outer satellite nodes when centerSong changes
  useEffect(() => {
    let active = true;

    async function generateSatellites() {
      if (!centerSong) return;
      setLoadingNodes(true);

      try {
        // Fetch dynamic radio queue related to center song
        const dynamicQueue = await getDynamicAutoplayQueue(centerSong);

        if (active) {
          const filtered = dynamicQueue
            .filter((s) => s.id !== centerSong.id && s.name)
            .slice(0, 7);

          if (filtered.length >= 4) {
            setSatellites(filtered);
          } else {
            // Slice from queue or fallback
            const fallback = (
              queue.length > 3 ? queue : INITIAL_SEED_SATELLITES
            )
              .filter((s) => s.id !== centerSong.id)
              .slice(0, 7);
            setSatellites(fallback.length > 0 ? fallback : INITIAL_SEED_SATELLITES);
          }
        }
      } catch (err) {
        console.warn("Galaxy satellite generation error:", err);
        if (active) {
          const fallback = (
            queue.length > 3 ? queue : INITIAL_SEED_SATELLITES
          )
            .filter((s) => s.id !== centerSong.id)
            .slice(0, 7);
          setSatellites(fallback.length > 0 ? fallback : INITIAL_SEED_SATELLITES);
        }
      } finally {
        if (active) setLoadingNodes(false);
      }
    }

    generateSatellites();
    return () => {
      active = false;
    };
  }, [centerSong.id]);

  // Constellation coordinate math
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const radius = Math.min(145, Math.min(dimensions.width, dimensions.height) * 0.36);

  const satellitePositions = satellites.map((song, i) => {
    const total = satellites.length || 1;
    const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { song, x, y };
  });

  // Clicking any satellite bubble smoothly promotes that song to centerNode, starts audio playback, and regenerates 6 new satellites
  const handleSatelliteClick = (nodeSong: Song) => {
    playSong(nodeSong, [nodeSong, ...satellites]);
  };

  const centerTitle = decodeHtmlEntities(centerSong.name || centerSong.title || "Center Track");
  const centerArtist = decodeHtmlEntities(centerSong.primaryArtists || "Waveform Audio");
  const centerCover = getSongCover(centerSong);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-170px)] min-h-[520px] max-h-[720px] bg-[#0A0A0C] overflow-hidden rounded-3xl border border-white/[0.08] flex flex-col justify-between select-none shadow-2xl gpu-layer my-2"
    >
      {/* Background Starlight & Ambient Cosmic Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e2d_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#3B0764]/35 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#D4FF00]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[#D4FF00]/10 border border-[#D4FF00]/30 flex items-center justify-center text-[#D4FF00]">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight leading-tight">
              Music Galaxy
            </h3>
            <p className="text-[10px] font-mono text-[#D4FF00] uppercase tracking-wider font-semibold">
              {satellites.length} Linked Constellations
            </p>
          </div>
        </div>

        {loadingNodes && (
          <span className="flex items-center space-x-1.5 text-[10px] font-mono text-gray-400">
            <RotateCw className="w-3 h-3 animate-spin text-[#D4FF00]" />
            <span>Harmonizing...</span>
          </span>
        )}
      </div>

      {/* Interactive Constellation Canvas */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* SVG Curved Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="galaxyLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4FF00" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {satellitePositions.map((pos, idx) => {
            const midX = (centerX + pos.x) / 2 + (idx % 2 === 0 ? 12 : -12);
            const midY = (centerY + pos.y) / 2 + (idx % 2 === 0 ? -12 : 12);

            return (
              <g key={`connector-${idx}`}>
                {/* SVG Curved Connector Line */}
                <path
                  d={`M ${centerX} ${centerY} Q ${midX} ${midY} ${pos.x} ${pos.y}`}
                  fill="none"
                  stroke="rgba(212,255,0,0.3)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
                {/* Micro Orbit Particle */}
                <circle cx={midX} cy={midY} r="2.5" fill="#D4FF00" opacity="0.8" />
              </g>
            );
          })}
        </svg>

        {/* Center Seed Node (Active Song) */}
        <div
          style={{
            position: "absolute",
            left: `${centerX}px`,
            top: `${centerY}px`,
            transform: "translate(-50%, -50%)",
          }}
          className="z-20 flex flex-col items-center cursor-pointer group"
          onClick={togglePlay}
        >
          {/* Animated Orbit Halo */}
          <div className="relative">
            <div
              className={`absolute -inset-3 rounded-full border-2 border-[#D4FF00]/40 pointer-events-none ${
                isPlaying ? "animate-ping opacity-60" : "opacity-20"
              }`}
            />
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-[#D4FF00] shadow-[0_0_35px_rgba(212,255,0,0.45)] bg-neutral-900 flex items-center justify-center">
              <img
                src={centerCover}
                alt={centerTitle}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? "animate-spin-slow" : ""
                }`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";
                }}
              />
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white text-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                )}
              </div>
            </div>
          </div>

          {/* Center Track Label */}
          <div className="mt-2 px-3 py-1 rounded-full bg-[#141418]/90 border border-white/10 backdrop-blur-md text-center max-w-[150px] shadow-lg">
            <p className="text-xs font-bold text-white truncate leading-tight">
              {centerTitle}
            </p>
            <p className="text-[10px] text-[#D4FF00] truncate font-medium">
              {centerArtist}
            </p>
          </div>
        </div>

        {/* 6 to 8 Branching Outer Satellite Nodes (54px Circular Bubbles) */}
        {satellitePositions.map(({ song, x, y }, i) => {
          const sTitle = decodeHtmlEntities(song.name || song.title || "Track");
          const sCover = getSongCover(song);

          return (
            <div
              key={`satellite-${song.id}-${i}`}
              style={{
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => handleSatelliteClick(song)}
              className="z-10 flex flex-col items-center cursor-pointer group transition-transform duration-300 hover:scale-115 active:scale-95"
            >
              {/* Outer 54px Circular Bubble with ACTUAL song cover */}
              <div className="relative w-[54px] h-[54px] rounded-full overflow-hidden border-2 border-white/20 group-hover:border-[#D4FF00] group-hover:ring-4 group-hover:ring-[#D4FF00]/30 shadow-xl bg-neutral-900 transition-all flex-shrink-0">
                <img
                  src={sCover}
                  alt={sTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 fill-[#D4FF00] text-[#D4FF00] ml-0.5" />
                </div>
              </div>

              {/* Satellite Micro Badge */}
              <div className="mt-1 px-1.5 py-0.5 rounded-md bg-[#0D0D14]/90 border border-white/10 max-w-[90px] text-center shadow-md">
                <p className="text-[9px] font-semibold text-neutral-200 group-hover:text-[#D4FF00] truncate transition-colors">
                  {sTitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
