"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, Music, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import SongCard from "@/components/SongCard";
import BottomPlayer from "@/components/BottomPlayer";
import { searchSongs, getLiveCategory } from "@/services/api";
import { Song } from "@/types/music";

interface ShelfState {
  title: string;
  songs: Song[];
  loading: boolean;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Dynamic live shelves state
  const [shelves, setShelves] = useState<ShelfState[]>([
    { title: "🔥 Trending Hindi", songs: [], loading: true },
    { title: "⚡ Punjabi Hype 2026", songs: [], loading: true },
    { title: "✨ Bollywood Romance", songs: [], loading: true },
  ]);

  // Initial fetch for dynamic shelves on mount
  useEffect(() => {
    let active = true;

    async function loadShelves() {
      const categories = [
        { title: "🔥 Trending Hindi", query: "Trending Hindi" },
        { title: "⚡ Punjabi Hype 2026", query: "Punjabi Hype 2026" },
        { title: "✨ Bollywood Romance", query: "Bollywood Romance" },
      ];

      await Promise.all(
        categories.map(async (cat, idx) => {
          try {
            const songs = await getLiveCategory(cat.query);
            if (active) {
              setShelves((prev) => {
                const next = [...prev];
                next[idx] = { title: cat.title, songs, loading: false };
                return next;
              });
            }
          } catch (err) {
            console.error(`Failed to load category: ${cat.title}`, err);
            if (active) {
              setShelves((prev) => {
                const next = [...prev];
                next[idx] = { title: cat.title, songs: [], loading: false };
                return next;
              });
            }
          }
        })
      );
    }

    loadShelves();
    return () => {
      active = false;
    };
  }, []);

  // 250ms debounced search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const results = await searchSongs(trimmed);
        setSearchResults(results);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Render skeleton loaders for a shelf
  const renderSkeletons = (count = 6) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3 rounded-2xl bg-neutral-900/40 border border-white/5 flex flex-col animate-pulse"
        >
          <div className="aspect-square w-full rounded-xl bg-neutral-800/60 mb-3" />
          <div className="h-4 bg-neutral-800/80 rounded w-3/4 mb-2" />
          <div className="h-3 bg-neutral-800/50 rounded w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Sticky Header with Logo & Creator Spotlight */}
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 pb-32">
        {/* Search Bar with 250ms Debounce */}
        <section className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-5 h-5 text-neutral-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs, artists, or albums..."
              className="w-full pl-11 pr-11 py-3 bg-neutral-900/90 text-white placeholder-neutral-500 text-sm md:text-base rounded-full border border-white/10 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              </div>
            )}
          </div>
        </section>

        {/* Search Results Display */}
        {searchQuery.trim().length > 0 ? (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Search Results
              </h2>
            </div>

            {isSearching ? (
              renderSkeletons(12)
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {searchResults.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    allSongs={searchResults}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-neutral-400">
                <Music className="w-12 h-12 mx-auto text-neutral-600 mb-3" />
                <p className="text-base font-medium">
                  No tracks found for &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Try searching for another artist, track, or genre.
                </p>
              </div>
            )}
          </section>
        ) : (
          /* Dynamic Category Shelves */
          <div className="space-y-10">
            {shelves.map((shelf) => (
              <section key={shelf.title} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
                    {shelf.title}
                  </h2>
                  <span className="text-xs text-neutral-500 font-medium">
                    Live Mirrors
                  </span>
                </div>

                {shelf.loading ? (
                  renderSkeletons(6)
                ) : shelf.songs.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {shelf.songs.map((song) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        allSongs={shelf.songs}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-neutral-900/30 border border-white/5 text-center text-neutral-500 text-sm">
                    Connecting to live audio mirrors...
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Persistent Bottom Audio Player Dock */}
      <BottomPlayer />
    </div>
  );
}
