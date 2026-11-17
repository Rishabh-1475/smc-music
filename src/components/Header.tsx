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

  // 250ms debounce on local query change if onSearchChange is supplied
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
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-black/90 border-b border-white/10 px-4 md:px-8 py-2.5 flex items-center justify-between gap-4">
      {/* Left: YouTube Music Styled Pill Logo */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center">
              <Play className="w-3 h-3 fill-black text-black ml-0.5" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-lg md:text-xl font-black tracking-tight text-white">
              SMC
            </span>
            <span className="text-lg md:text-xl font-normal tracking-tight text-neutral-300">
              Music
            </span>
            <span className="ml-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
              Co
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Integrated Search Bar with 250ms debounce & clear */}
      <div className="flex-1 max-w-xl mx-auto hidden sm:block">
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
            placeholder="Search songs, albums, artists, podcasts..."
            className="w-full pl-10 pr-9 py-2 bg-neutral-900/90 text-white placeholder-neutral-500 text-sm rounded-full border border-white/10 focus:border-emerald-500 focus:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
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

      {/* Right: Creator Profile Badge with /creator.jpg inside 40px circular ring */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        <Link
          href="https://www.instagram.com/rish4bhsiingh/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center space-x-3 bg-neutral-900/90 hover:bg-neutral-800/90 transition-all border border-white/10 hover:border-emerald-500/40 rounded-full pl-1 pr-3.5 py-1 shadow-md"
          title="Lead Developer: Rishabh Singh"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-emerald-500 group-hover:ring-emerald-400 transition-all flex-shrink-0 bg-neutral-800 flex items-center justify-center">
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
          <div className="text-left hidden md:block">
            <p className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors leading-tight">
              Rishabh Singh
            </p>
            <p className="text-[10px] text-neutral-400 font-medium leading-none mt-0.5">
              Founder &amp; Lead Dev
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
