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
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
    if (searchQuery) setShowSearchInput(true);
  }, [searchQuery]);

  const updateQuery = (value: string) => {
    setLocalQuery(value);
    if (setSearchQuery) setSearchQuery(value);
    if (onSearchChange) onSearchChange(value);
  };

  const handleToggleSearch = () => {
    setShowSearchInput((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        updateQuery("");
      }
      return next;
    });
  };

  const displayName = userName?.trim() || "Samantha";
  const favoritesCount = likedSongs?.length || 0;

  return (
    <header className="relative w-full bg-[#0A0A0C] px-4 pt-6 pb-2 flex flex-col gap-2 select-none overflow-hidden">
      {/* Ambient background glow matching Reference mockups */}
      <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-purple-800/25 via-pink-900/15 to-transparent pointer-events-none blur-3xl" />

      {/* Top Utility Row: Avatar on Left, Search & Heart on Right */}
      <div className="relative z-10 flex items-center justify-between">
        {/* Left Side: Circular 42px avatar with subtle ring */}
        <div
          onClick={onOpenProfile}
          className="relative w-[42px] h-[42px] rounded-full overflow-hidden border border-white/10 ring-2 ring-white/10 hover:ring-[#D4FF00] transition-all bg-neutral-900 flex-shrink-0 shadow-md cursor-pointer group"
          title="View profile"
        >
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

        {/* Right Side: Two clean circular 38px frosted buttons */}
        <div className="flex items-center space-x-2.5">
          {/* Search Icon Button (38px) */}
          <button
            onClick={handleToggleSearch}
            className={`w-[38px] h-[38px] rounded-full flex items-center justify-center transition-all cursor-pointer border ${
              showSearchInput || searchQuery
                ? "bg-[#D4FF00] text-black border-[#D4FF00] shadow-md shadow-[#D4FF00]/25"
                : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10"
            }`}
            aria-label="Toggle Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Liked Heart Icon Button (38px) */}
          <button
            onClick={onOpenFavorites}
            className="relative w-[38px] h-[38px] rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Favorites"
          >
            <Heart
              className={`w-4 h-4 ${
                favoritesCount > 0 ? "fill-[#D4FF00] text-[#D4FF00]" : ""
              }`}
            />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#D4FF00] text-black text-[8px] font-black flex items-center justify-center">
                {favoritesCount > 9 ? "9+" : favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Prominent Greeting Headline matching Reference 1 & Reference 3 */}
      <div className="relative z-10 pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Hi, {displayName}
        </h1>
      </div>

      {/* Expandable Search Input Row */}
      {showSearchInput && (
        <div className="relative z-10 w-full animate-in slide-in-from-top-1 duration-150 pt-1">
          <div className="relative w-full rounded-2xl bg-[#14141A] border border-white/10 focus-within:border-[#D4FF00] shadow-lg transition-all">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-[#D4FF00] animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5 text-gray-400" />
              )}
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={localQuery}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder="Search artists, tracks, phonk..."
              className="w-full pl-9 pr-9 py-2.5 bg-transparent text-white placeholder-gray-500 text-xs rounded-2xl focus:outline-none"
            />

            {localQuery.length > 0 && (
              <button
                onClick={() => updateQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5 hover:text-[#D4FF00]" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
