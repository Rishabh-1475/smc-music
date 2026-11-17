"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Search, X, Loader2 } from "lucide-react";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isSearching?: boolean;
}

export default function Header({
  searchQuery = "",
  onSearchChange,
  isSearching = false,
}: HeaderProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // 250ms debounce on input change
  useEffect(() => {
    if (!onSearchChange) return;
    const timer = setTimeout(() => {
      onSearchChange(localQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [localQuery, onSearchChange]);

  const handleClear = () => {
    setLocalQuery("");
    if (onSearchChange) onSearchChange("");
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#030303]/95 border-b border-white/10 px-4 md:px-8 py-2.5 flex items-center justify-between gap-3 md:gap-6">
      {/* Left: YouTube Music Pill Logo with SMC Icon and "SMC Music" */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        <Link
          href="/"
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

      {/* Center: Functional Search Input with Debounce, Search Icon, and Clear "X" Button */}
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
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search songs, albums, artists..."
            className="w-full pl-10 pr-9 py-2 bg-[#212121]/90 hover:bg-[#282828] text-white placeholder-neutral-400 text-sm rounded-full border border-white/10 focus:border-emerald-500 focus:bg-[#212121] focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-inner"
          />
          {localQuery.length > 0 && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Creator Circular Avatar (/creator.jpg) inside 44px container with ring-2 ring-emerald-500/50 */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <Link
          href="https://www.instagram.com/rish4bhsiingh/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center space-x-3 bg-[#181818]/90 hover:bg-[#212121] transition-all border border-white/10 hover:border-emerald-500/50 rounded-full pl-1 pr-3.5 py-1 shadow-md"
          title="Rishabh Singh • Founder & Lead Dev"
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
        </Link>
      </div>
    </header>
  );
}
