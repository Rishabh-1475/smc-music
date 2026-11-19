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
      <header className="sticky top-0 z-30 w-full bg-[#08080A]/95 backdrop-blur-xl border-b border-white/[0.08] px-3 sm:px-6 md:px-8 py-3 flex flex-col gap-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.85)] gpu-layer">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Left: Sharp "RHYTHMX" wordmark with BMW M-Performance Crimson racing hash */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Link
              href="/"
              onClick={() => updateQuery("")}
              className="flex items-center space-x-2.5 group transition-transform active:scale-95 cursor-pointer"
              aria-label="RhythmX Home"
            >
              {/* Sharp Carbon-Slate Monogram Box with Crimson Accent */}
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#121216] border border-white/10 flex items-center justify-center shadow-md overflow-hidden group-hover:border-[#E10600]/60 transition-all">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#E10600]" />
                <span className="text-xs sm:text-sm font-black tracking-tight text-white font-mono ml-0.5">
                  RX
                </span>
              </div>

              {/* Dynamic Precision Mini Spectrum Bar */}
              <div className="flex items-end space-x-[2px] h-4 px-1">
                <span
                  className={`w-0.5 rounded-full bg-[#E10600] transition-all duration-200 ${
                    isPlaying ? "h-4 animate-pulse" : "h-1.5 opacity-40"
                  }`}
                />
                <span
                  className={`w-0.5 rounded-full bg-[#E10600] transition-all duration-200 ${
                    isPlaying ? "h-2.5 animate-[pulse_0.8s_infinite]" : "h-2 opacity-40"
                  }`}
                />
                <span
                  className={`w-0.5 rounded-full bg-[#E10600] transition-all duration-200 ${
                    isPlaying ? "h-3.5 animate-[pulse_1.2s_infinite]" : "h-1 opacity-40"
                  }`}
                />
                <span
                  className={`w-0.5 rounded-full bg-[#8A8A93] transition-all duration-200 ${
                    isPlaying ? "h-3 animate-pulse" : "h-2 opacity-40"
                  }`}
                />
              </div>

              {/* Wordmark with subtle M-Performance racing slash */}
              <div className="hidden lg:flex items-center space-x-1.5 tracking-wider select-none">
                <span className="text-[#E10600] font-black text-sm select-none tracking-tighter">///</span>
                <span className="text-lg font-black text-white tracking-widest">
                  RHYTHM<span className="text-[#E10600]">X</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Prominent, Wide, Spacious Command Search Deck (16px text-base) */}
          <div className="flex-1 max-w-2xl mx-1 sm:mx-4">
            <div className="relative w-full rounded-full bg-[#16161C] border border-white/10 focus-within:border-[#E10600] focus-within:ring-2 focus-within:ring-[#E10600]/25 shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                {isSearching ? (
                  <Loader2 className="w-5 h-5 text-[#E10600] animate-spin" />
                ) : (
                  <Search className="w-5 h-5 text-[#8A8A93] group-focus-within:text-[#E10600]" />
                )}
              </div>

              <input
                type="text"
                value={localQuery}
                onChange={(e) => updateQuery(e.target.value)}
                placeholder="Search tracks, phonk, artists, albums..."
                className="w-full pl-12 sm:pl-14 pr-11 py-3 px-6 bg-transparent text-[#F0F0F2] placeholder-[#8A8A93] text-base rounded-full focus:outline-none"
              />

              {localQuery.length > 0 && (
                <button
                  onClick={handleClear}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-white transition cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5 hover:text-[#E10600] transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Far Right: Subtle circular developer node (/creator.jpg) with clean crimson border */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setShowAboutModal(true)}
              className="group flex items-center space-x-2.5 bg-[#121216] hover:bg-[#181820] transition-all border border-white/[0.08] hover:border-[#E10600]/70 rounded-full pl-1 pr-2.5 sm:pr-3 py-1 shadow-md cursor-pointer text-left"
              title="Rishabh Singh • Lead Dev & Founder"
            >
              <div className="w-[36px] h-[36px] sm:w-[38px] sm:h-[38px] rounded-full overflow-hidden border-2 border-[#E10600] shadow-[0_0_10px_rgba(225,6,0,0.35)] flex-shrink-0 bg-neutral-900 flex items-center justify-center">
                {!imgError ? (
                  <img
                    src="/creator.jpg"
                    alt="Rishabh Singh"
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="text-xs font-bold text-[#E10600]">RS</span>
                )}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-white group-hover:text-[#E10600] transition-colors leading-tight">
                  Rishabh Singh
                </p>
                <p className="text-[10px] text-[#8A8A93] font-mono leading-tight mt-0.5">
                  Architect
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Dedicated Hot-Tags with Precision Brushed Slate Styling */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pt-0.5 pb-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A8A93] flex-shrink-0 mr-1">
            QUICK ACCESS:
          </span>
          {HOT_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="px-3 py-1 rounded-full text-xs font-mono font-medium text-[#8A8A93] hover:text-white bg-[#121216] hover:bg-[#181820] border border-white/[0.08] hover:border-[#E10600]/40 transition-all flex-shrink-0 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </header>

      {/* About Creator Modal with BMW M-Performance Dark Luxury */}
      {showAboutModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAboutModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#111116] border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-center flex flex-col items-center animate-in zoom-in-95 duration-200"
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

            {/* Avatar with Clean Crimson Ring */}
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-[#E10600] shadow-[0_0_20px_rgba(225,6,0,0.4)] mb-4 bg-neutral-900">
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
              <CheckCircle2 className="w-5 h-5 text-[#E10600]" />
            </div>

            <p className="text-xs font-semibold text-[#E10600] uppercase tracking-wider mb-3 font-mono">
              Lead Architect &amp; Founder • Systems Engineer
            </p>

            <p className="text-sm text-[#8A8A93] leading-relaxed mb-6">
              Architect of <strong className="text-white">RhythmX Crimson-Void</strong>, engineered with locked 60fps GPU acceleration, multi-bitrate fallback streams, continuous background playback, and bespoke dark luxury styling.
            </p>

            {/* Instagram Link */}
            <div className="w-full pt-4 border-t border-white/10 flex flex-col items-center space-y-2.5">
              <Link
                href="https://www.instagram.com/rish4bhsiingh/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-5 rounded-xl bg-[#E10600] hover:bg-[#C20500] text-white font-bold text-sm flex items-center justify-center space-x-2 transition shadow-md shadow-[#E10600]/25 active:scale-95"
              >
                <Instagram className="w-4 h-4" />
                <span>Follow on Instagram (@rish4bhsiingh)</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Link>

              <button
                onClick={() => setShowAboutModal(false)}
                className="text-xs text-[#8A8A93] hover:text-white transition py-1 cursor-pointer"
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
