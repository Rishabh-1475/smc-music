"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, Loader2, CheckCircle2, ExternalLink, Instagram, Disc3 } from "lucide-react";

interface HeaderProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onSearchChange?: (query: string) => void;
  isSearching?: boolean;
}

export default function Header({
  searchQuery = "",
  setSearchQuery,
  onSearchChange,
  isSearching = false,
}: HeaderProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [imgError, setImgError] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const updateQuery = (value: string) => {
    setLocalQuery(value);
    if (setSearchQuery) setSearchQuery(value);
    if (onSearchChange) onSearchChange(value);
  };

  const handleClear = () => {
    updateQuery("");
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full backdrop-blur-2xl bg-black/85 border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between gap-3 md:gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        {/* Left: Futuristic "RhythmX" Logo Mark with Glowing 3D Equalizer Bars in Electric Neon Lime */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Link
            href="/"
            onClick={() => updateQuery("")}
            className="flex items-center space-x-3 group transition-transform active:scale-95 cursor-pointer"
            aria-label="RhythmX Home"
          >
            {/* Glowing 3D Equalizer Pill Icon */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FF87] via-[#00F0FF] to-[#7928CA] p-[1.5px] shadow-[0_0_15px_rgba(0,255,135,0.4)] group-hover:shadow-[0_0_25px_rgba(0,255,135,0.7)] transition-all">
              <div className="w-full h-full rounded-[10px] bg-[#0A0A0C] flex items-center justify-center space-x-[2.5px] px-2">
                <span className="w-1 h-3.5 bg-[#00FF87] rounded-full animate-pulse shadow-[0_0_8px_#00FF87]" />
                <span className="w-1 h-5 bg-[#00F0FF] rounded-full animate-[pulse_1.2s_infinite] shadow-[0_0_8px_#00F0FF]" />
                <span className="w-1 h-2.5 bg-[#00FF87] rounded-full animate-pulse shadow-[0_0_8px_#00FF87]" />
                <span className="w-1 h-4 bg-[#7928CA] rounded-full animate-[pulse_1.5s_infinite] shadow-[0_0_8px_#7928CA]" />
              </div>
            </div>

            {/* Typography: "Rhythm" + Gradient "X" */}
            <div className="flex items-baseline tracking-tight select-none">
              <span className="text-xl md:text-2xl font-black text-white tracking-wider">
                Rhythm
              </span>
              <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-[#00FF87] via-[#00F0FF] to-[#7928CA] bg-clip-text text-transparent ml-0.5 drop-shadow-[0_0_12px_rgba(0,255,135,0.5)]">
                X
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Floating Frosted Glass Search Pill with Instant Clear (X) */}
        <div className="flex-1 max-w-xl mx-2 md:mx-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-[#00FF87] animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-neutral-400" />
              )}
            </div>
            <input
              type="text"
              value={localQuery}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder="Search tracks, phonk, artists, albums, genres..."
              className="w-full pl-10 pr-9 py-2 bg-[#121216]/80 hover:bg-[#18181F] text-white placeholder-neutral-400 text-sm rounded-full border border-white/10 focus:border-[#00FF87] focus:bg-[#121216] focus:outline-none focus:ring-2 focus:ring-[#00FF87]/30 transition-all shadow-inner backdrop-blur-xl"
            />
            {localQuery.length > 0 && (
              <button
                onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Creator Profile Node displaying /creator.jpg inside 42px ring */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => setShowAboutModal(true)}
            className="group flex items-center space-x-2.5 bg-[#141418] hover:bg-[#1C1C22] transition-all border border-white/10 hover:border-[#00FF87]/60 rounded-full pl-1 pr-3 py-1 shadow-lg cursor-pointer text-left"
            title="Rishabh Singh • Lead Dev & Founder"
          >
            <div className="w-[42px] h-[42px] rounded-full overflow-hidden ring-2 ring-[#00FF87]/80 group-hover:ring-[#00FF87] group-hover:shadow-[0_0_12px_rgba(0,255,135,0.4)] transition-all flex-shrink-0 bg-neutral-900 flex items-center justify-center">
              {!imgError ? (
                <img
                  src="/creator.jpg"
                  alt="Rishabh Singh"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-xs font-bold text-[#00FF87]">RS</span>
              )}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-white group-hover:text-[#00FF87] transition-colors leading-tight">
                Rishabh Singh
              </p>
              <p className="text-[10px] text-neutral-400 font-medium leading-tight mt-0.5">
                Lead Dev &amp; Founder
              </p>
            </div>
          </button>
        </div>
      </header>

      {/* About Creator Modal */}
      {showAboutModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAboutModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#101014] border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-center flex flex-col items-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/80 hover:bg-neutral-700 transition cursor-pointer"
              aria-label="Close about modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Avatar */}
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-[#00FF87]/80 shadow-[0_0_30px_rgba(0,255,135,0.4)] mb-4 bg-neutral-900">
              <img
                src="/creator.jpg"
                alt="Rishabh Singh"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Creator Details */}
            <div className="flex items-center justify-center space-x-1.5 mb-1">
              <h3 className="text-2xl font-black text-white tracking-tight">
                Rishabh Singh
              </h3>
              <CheckCircle2 className="w-5 h-5 text-[#00FF87]" />
            </div>

            <p className="text-xs font-semibold text-[#00FF87] uppercase tracking-wider mb-3">
              Lead Dev &amp; Founder • Systems Mobile Architect
            </p>

            <p className="text-sm text-neutral-300 leading-relaxed mb-6">
              Architect of <strong>RhythmX</strong>, delivering high-fidelity 320kbps audio streaming, instant multi-mirror failover, smart phonk &amp; mood query expansions, and a fluid 60fps mobile experience without mock placeholders.
            </p>

            {/* Instagram Link */}
            <div className="w-full pt-4 border-t border-white/10 flex flex-col items-center space-y-2.5">
              <Link
                href="https://www.instagram.com/rish4bhsiingh/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-[#00FF87] to-[#00F0FF] hover:opacity-95 text-black font-extrabold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-[#00FF87]/25 active:scale-95"
              >
                <Instagram className="w-4 h-4" />
                <span>Follow on Instagram (@rish4bhsiingh)</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Link>

              <button
                onClick={() => setShowAboutModal(false)}
                className="text-xs text-neutral-400 hover:text-neutral-200 transition py-1 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
