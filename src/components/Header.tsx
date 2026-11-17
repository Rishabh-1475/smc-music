"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Search, X, Loader2, CheckCircle2, ExternalLink, Instagram } from "lucide-react";

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
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#030303]/95 border-b border-white/10 px-4 md:px-8 py-2.5 flex items-center justify-between gap-3 md:gap-6">
        {/* Left: YouTube Music Pill Logo with SMC Icon and "SMC Music" */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Link
            href="/"
            onClick={() => updateQuery("")}
            className="flex items-center space-x-2.5 group transition-transform active:scale-95"
            aria-label="SMC Music Home"
          >
            {/* YouTube Music Red/Emerald Icon */}
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-emerald-500 p-[2px] shadow-lg shadow-red-500/20 group-hover:shadow-emerald-500/30 transition-all">
              <div className="w-full h-full rounded-full bg-[#030303] flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                </div>
              </div>
            </div>

            {/* YouTube Music Style "SMC Music" Branding */}
            <div className="flex items-center">
              <span className="text-lg md:text-xl font-bold tracking-tight text-white">
                SMC
              </span>
              <span className="text-lg md:text-xl font-medium tracking-tight text-neutral-200 ml-1">
                Music
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search input with YouTube Music pill design, white/10 border, black/60 backdrop */}
        <div className="flex-1 max-w-xl mx-2 md:mx-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-neutral-400" />
              )}
            </div>
            <input
              type="text"
              value={localQuery}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder="Search songs, albums, artists, genres..."
              className="w-full pl-10 pr-9 py-2 bg-black/60 hover:bg-[#181818] text-white placeholder-neutral-400 text-sm rounded-full border border-white/10 focus:border-emerald-500 focus:bg-black/90 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-inner"
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

        {/* Right: Creator Circular Avatar (/creator.jpg) inside 44px container with ring-2 ring-emerald-500/50 */}
        {/* Clicking opens About Modal (does not directly redirect to Instagram) */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => setShowAboutModal(true)}
            className="group flex items-center space-x-3 bg-[#181818]/90 hover:bg-[#212121] transition-all border border-white/10 hover:border-emerald-500/50 rounded-full pl-1 pr-3.5 py-1 shadow-md cursor-pointer text-left"
            title="View About Rishabh Singh"
          >
            <div className="w-[44px] h-[44px] rounded-full overflow-hidden ring-2 ring-emerald-500/50 group-hover:ring-emerald-400 transition-all flex-shrink-0 bg-neutral-900 flex items-center justify-center shadow-lg">
              {!imgError ? (
                <img
                  src="/creator.jpg"
                  alt="Rishabh Singh"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-xs font-bold text-emerald-400">RS</span>
              )}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                Rishabh Singh
              </p>
              <p className="text-[10px] text-neutral-400 font-medium leading-tight mt-0.5">
                Founder &amp; Lead Dev
              </p>
            </div>
          </button>
        </div>
      </header>

      {/* About Creator Modal (Opens when photo is clicked; Instagram link is at the bottom) */}
      {showAboutModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAboutModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#181818] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/80 hover:bg-neutral-700 transition"
              aria-label="Close about modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Creator Avatar with Ring */}
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-emerald-500/60 shadow-2xl mb-4 bg-neutral-900">
              <img
                src="/creator.jpg"
                alt="Rishabh Singh"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Verified Badge & Creator Details */}
            <div className="flex items-center justify-center space-x-1.5 mb-1">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Rishabh Singh
              </h3>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>

            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              Founder &amp; Lead Dev • Systems Mobile Architect
            </p>

            <p className="text-sm text-neutral-300 leading-relaxed mb-6">
              Architected <strong>SMC Singhs Music Co</strong> to deliver lossless 320kbps audio streaming, instant multi-mirror failover, and a fluid YouTube Music experience on mobile WebViews with zero mock placeholders.
            </p>

            {/* Instagram Link at the Bottom */}
            <div className="w-full pt-4 border-t border-white/10 flex flex-col items-center space-y-2.5">
              <Link
                href="https://www.instagram.com/rish4bhsiingh/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                <Instagram className="w-4 h-4" />
                <span>Follow on Instagram (@rish4bhsiingh)</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Link>

              <button
                onClick={() => setShowAboutModal(false)}
                className="text-xs text-neutral-400 hover:text-neutral-200 transition py-1"
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
