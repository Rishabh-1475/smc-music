"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, Loader2, CheckCircle2, ExternalLink, Instagram } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";

interface HeaderProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onSearchChange?: (query: string) => void;
  isSearching?: boolean;
}

const HOT_TAGS = ["#Phonk", "#Gym", "#Chill", "#Punjabi"];

export default function Header({
  searchQuery = "",
  setSearchQuery,
  onSearchChange,
  isSearching = false,
}: HeaderProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [imgError, setImgError] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const { isPlaying } = usePlayerStore();

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

  const handleTagClick = (tag: string) => {
    const cleanTag = tag.replace("#", "");
    updateQuery(cleanTag);
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#050507]/90 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 md:px-8 py-3 flex flex-col gap-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.85)] gpu-layer">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Left: "RX" Geometric Monogram in Neon Emerald + Dynamic Mini Spectrum Bar */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Link
              href="/"
              onClick={() => updateQuery("")}
              className="flex items-center space-x-2.5 group transition-transform active:scale-95 cursor-pointer"
              aria-label="RhythmX Home"
            >
              {/* RX Monogram Box */}
              <div className="relative w-10 h-10 rounded-xl bg-[#121217] border border-[#00FF87]/40 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,135,0.35)] group-hover:shadow-[0_0_25px_rgba(0,255,135,0.6)] transition-all">
                <span className="text-base font-black tracking-tighter text-[#00FF87] font-mono">
                  RX
                </span>
              </div>

              {/* Dynamic Mini Spectrum Bar that Moves when Music Plays */}
              <div className="flex items-end space-x-[2.5px] h-5 px-1">
                <span
                  className={`w-1 rounded-full bg-[#00FF87] transition-all duration-200 ${
                    isPlaying ? "h-5 animate-pulse" : "h-2 opacity-50"
                  }`}
                />
                <span
                  className={`w-1 rounded-full bg-[#00FF87] transition-all duration-200 ${
                    isPlaying ? "h-3 animate-[pulse_0.8s_infinite]" : "h-3.5 opacity-50"
                  }`}
                />
                <span
                  className={`w-1 rounded-full bg-[#00FF87] transition-all duration-200 ${
                    isPlaying ? "h-4 animate-[pulse_1.2s_infinite]" : "h-1.5 opacity-50"
                  }`}
                />
                <span
                  className={`w-1 rounded-full bg-[#7928CA] transition-all duration-200 ${
                    isPlaying ? "h-5 animate-pulse" : "h-3 opacity-50"
                  }`}
                />
              </div>

              {/* Wordmark */}
              <div className="hidden lg:flex items-baseline tracking-tight select-none">
                <span className="text-lg font-black text-white tracking-wider">
                  RHYTHM
                </span>
                <span className="text-lg font-black text-[#00FF87] ml-0.5 drop-shadow-[0_0_10px_#00FF87]">
                  X
                </span>
              </div>
            </Link>
          </div>

          {/* Center/Right: Wide, Curved Command Pill Search Input (16px text-base) */}
          <div className="flex-1 max-w-2xl mx-1 sm:mx-4">
            <div className="relative w-full rounded-full bg-[#121217] border border-white/15 focus-within:border-[#00FF87] focus-within:ring-2 focus-within:ring-[#00FF87]/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                {isSearching ? (
                  <Loader2 className="w-5 h-5 text-[#00FF87] animate-spin" />
                ) : (
                  <Search className="w-5 h-5 text-[#00FF87] drop-shadow-[0_0_8px_rgba(0,255,135,0.6)]" />
                )}
              </div>

              <input
                type="text"
                value={localQuery}
                onChange={(e) => updateQuery(e.target.value)}
                placeholder="Search catalog, phonk, artists, albums..."
                className="w-full pl-12 sm:pl-14 pr-11 py-2.5 sm:py-3 px-6 bg-transparent text-white placeholder-[#8F90A6] text-base rounded-full focus:outline-none"
              />

              {localQuery.length > 0 && (
                <button
                  onClick={handleClear}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-white transition cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5 hover:text-[#00FF87] transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Far Right: Developer Badge displaying /creator.jpg in neon-bordered circle */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setShowAboutModal(true)}
              className="group flex items-center space-x-2.5 bg-[#121217] hover:bg-[#181822] transition-all border border-white/10 hover:border-[#00FF87]/70 rounded-full pl-1 pr-2.5 sm:pr-3 py-1 shadow-lg cursor-pointer text-left"
              title="Rishabh Singh • Lead Dev & Founder"
            >
              <div className="w-[38px] h-[38px] sm:w-[40px] sm:h-[40px] rounded-full overflow-hidden ring-2 ring-[#00FF87] shadow-[0_0_12px_rgba(0,255,135,0.4)] group-hover:shadow-[0_0_18px_rgba(0,255,135,0.7)] transition-all flex-shrink-0 bg-neutral-900 flex items-center justify-center">
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
                <p className="text-[10px] text-[#8F90A6] font-mono leading-tight mt-0.5">
                  Lead Dev
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Dedicated Hot-Tags (#Phonk, #Gym, #Chill, #Punjabi) */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pt-0.5 pb-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8F90A6] flex-shrink-0 mr-1">
            HOT TAGS:
          </span>
          {HOT_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium text-[#8F90A6] hover:text-[#00FF87] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#00FF87]/30 transition-all flex-shrink-0 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </header>

      {/* About Creator Modal */}
      {showAboutModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAboutModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#121217] border border-white/15 rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-center flex flex-col items-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
              aria-label="Close about modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Avatar */}
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-[#00FF87] shadow-[0_0_30px_rgba(0,255,135,0.4)] mb-4 bg-neutral-900">
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

            <p className="text-xs font-semibold text-[#00FF87] uppercase tracking-wider mb-3 font-mono">
              Lead Dev &amp; Founder • Systems Mobile Architect
            </p>

            <p className="text-sm text-neutral-300 leading-relaxed mb-6">
              Architect of <strong>RhythmX Titanium-Void</strong>, engineered with locked 60fps GPU layer promotion, lossless 320kbps streams, continuous native background playback, and zero-compromise mobile responsiveness.
            </p>

            {/* Instagram Link */}
            <div className="w-full pt-4 border-t border-white/10 flex flex-col items-center space-y-2.5">
              <Link
                href="https://www.instagram.com/rish4bhsiingh/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-[#00FF87] to-[#10B981] hover:opacity-95 text-black font-extrabold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-[#00FF87]/25 active:scale-95"
              >
                <Instagram className="w-4 h-4" />
                <span>Follow on Instagram (@rish4bhsiingh)</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Link>

              <button
                onClick={() => setShowAboutModal(false)}
                className="text-xs text-[#8F90A6] hover:text-white transition py-1 cursor-pointer"
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
