"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Heart, X, Loader2 } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { usePlayerStore } from "@/store/playerStore";

interface HeaderProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onSearchChange?: (query: string) => void;
  isSearching?: boolean;
  onOpenFavorites?: () => void;
  onOpenProfile?: () => void;
}

export default function Header({
  searchQuery = "",
  setSearchQuery,
  onSearchChange,
  isSearching = false,
  onOpenFavorites,
  onOpenProfile,
}: HeaderProps) {
  const { userName } = useUserStore();
  const { likedSongs } = usePlayerStore();
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
    if (searchQuery) setShowSearchDrawer(true);
  }, [searchQuery]);

  const updateQuery = (value: string) => {
    setLocalQuery(value);
    if (setSearchQuery) setSearchQuery(value);
    if (onSearchChange) onSearchChange(value);
  };

  const handleToggleSearch = () => {
    setShowSearchDrawer((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        updateQuery("");
      }
      return next;
    });
  };

  const displayName = userName?.trim() || "Guest";
  const favoritesCount = likedSongs?.length || 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0A0A0C]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-6 md:px-8 py-3.5 flex flex-col gap-3">
      {/* Top Bar: Reference 1 Layout */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Circular Avatar with Soft Ring + Clean Greeting */}
        <div
          onClick={onOpenProfile}
          className="flex items-center space-x-3 cursor-pointer group select-none"
          title="View profile"
        >
          {/* Circular Avatar */}
          <div className="relative w-11 h-11 rounded-full overflow-hidden border border-white/10 ring-2 ring-[#D2FF1F]/30 group-hover:ring-[#D2FF1F] transition-all bg-neutral-900 flex-shrink-0">
            <img
              src="/creator.jpg"
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80";
              }}
            />
          </div>

          {/* Clean Greeting */}
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight group-hover:text-[#D2FF1F] transition-colors">
              Hi, {displayName}
            </h1>
            <span className="text-[11px] font-mono text-neutral-400 leading-none mt-0.5">
              Ready to explore
            </span>
          </div>
        </div>

        {/* Right: Minimalist Circular Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {/* Search Toggle Icon */}
          <button
            onClick={handleToggleSearch}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
              showSearchDrawer || searchQuery
                ? "bg-[#D2FF1F] text-black border-[#D2FF1F] shadow-lg shadow-[#D2FF1F]/20"
                : "bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border-white/10"
            }`}
            aria-label="Toggle search drawer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Heart / Favorites Button */}
          <button
            onClick={onOpenFavorites}
            className="relative w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-[#D2FF1F] border border-white/10 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Open Favorites"
            title="Favorites"
          >
            <Heart className={`w-4 h-4 ${favoritesCount > 0 ? "fill-[#D2FF1F] text-[#D2FF1F]" : ""}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D2FF1F] text-black text-[9px] font-black flex items-center justify-center">
                {favoritesCount > 9 ? "9+" : favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Floating / Expandable Search Drawer */}
      {showSearchDrawer && (
        <div className="w-full animate-in slide-in-from-top-2 duration-200 pt-1">
          <div className="relative w-full rounded-2xl bg-[#14141B] border border-white/15 focus-within:border-[#D2FF1F] focus-within:ring-1 focus-within:ring-[#D2FF1F] shadow-xl transition-all">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-[#D2FF1F] animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-neutral-400" />
              )}
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={localQuery}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder="Search tracks, phonk, artists, albums..."
              className="w-full pl-11 pr-10 py-3 bg-transparent text-white placeholder-neutral-500 text-sm rounded-2xl focus:outline-none"
            />

            {localQuery.length > 0 && (
              <button
                onClick={() => updateQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white transition cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 hover:text-[#D2FF1F]" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
