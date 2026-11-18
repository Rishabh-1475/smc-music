"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Music,
  ExternalLink,
  Play,
  CheckCircle2,
  SearchX,
  Radio,
  Flame,
  Zap,
  Heart,
} from "lucide-react";
import Header from "@/components/Header";
import CategoryChips from "@/components/CategoryChips";
import HeroVisualizer from "@/components/HeroVisualizer";
import UserShelves from "@/components/UserShelves";
import QuickPicksList from "@/components/QuickPicksList";
import ShelfCarousel from "@/components/ShelfCarousel";
import MiniPlayer from "@/components/MiniPlayer";
import FullPlayerModal from "@/components/FullPlayerModal";
import {
  searchSongsWithRadio,
  getHomeShelves,
  getCategoryFeed,
} from "@/services/api";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searchRadioQueue, setSearchRadioQueue] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const [categoryFeed, setCategoryFeed] = useState<Song[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(false);

  const searchReqIdRef = useRef<number>(0);
  const { playSong, currentTrack, likedSongIds, likedSongs, recordSearchQuery } =
    usePlayerStore();

  // RhythmX Home Shelves
  const [shelves, setShelves] = useState<{
    heroTrending: Song[];
    speedDial: Song[];
    quickPicks: Song[];
    gymPhonk: Song[];
    midnightChill: Song[];
  }>({
    heroTrending: [],
    speedDial: [],
    quickPicks: [],
    gymPhonk: [],
    midnightChill: [],
  });

  const [loadingShelves, setLoadingShelves] = useState(true);

  // Load home shelves on mount
  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoadingShelves(true);
      try {
        const data = await getHomeShelves();
        if (active) {
          setShelves(data);
        }
      } catch (err) {
        console.error("Failed to load RhythmX home shelves:", err);
      } finally {
        if (active) setLoadingShelves(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  // Category Chip Selection Handler
  const handleCategorySelect = async (category: string) => {
    setActiveCategory(category);
    if (!category || category === "All") {
      setCategoryFeed([]);
      setLoadingCategory(false);
      return;
    }

    // Special handling for Favorites filter
    if (category.toLowerCase() === "favorites") {
      setLoadingCategory(false);
      return;
    }

    setLoadingCategory(true);
    try {
      const feed = await getCategoryFeed(category);
      setCategoryFeed(feed);
    } catch (err) {
      console.error("Failed to load category feed:", err);
      setCategoryFeed([]);
    } finally {
      setLoadingCategory(false);
    }
  };

  // 300ms Debounced Search Engine with Cancellation & Radio Queue Generation
  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setSearchResults([]);
      setSearchRadioQueue([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const currentReqId = ++searchReqIdRef.current;

    const handler = setTimeout(async () => {
      // Record non-empty search query in playerStore
      recordSearchQuery(trimmed);

      try {
        const { results, radioQueue } = await searchSongsWithRadio(trimmed);
        if (currentReqId === searchReqIdRef.current) {
          setSearchResults(results);
          setSearchRadioQueue(radioQueue);
        }
      } catch (err) {
        console.error("Search error:", err);
        if (currentReqId === searchReqIdRef.current) {
          setSearchResults([]);
          setSearchRadioQueue([]);
        }
      } finally {
        if (currentReqId === searchReqIdRef.current) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, recordSearchQuery]);

  const isSearchActive = searchQuery.trim().length > 0;
  const isFavoritesActive = activeCategory.toLowerCase() === "favorites";
  const isCategoryActive =
    activeCategory && activeCategory !== "All" && !isFavoritesActive;

  // Derive favorite songs from stored likedSongs, falling back to loaded tracks with likedSongIds
  const allKnownSongs = [
    ...(likedSongs || []),
    ...(shelves.heroTrending || []),
    ...(shelves.speedDial || []),
    ...(shelves.quickPicks || []),
    ...(shelves.gymPhonk || []),
    ...(shelves.midnightChill || []),
  ];
  const favoriteSongs = allKnownSongs.filter(
    (s, idx, arr) =>
      Boolean(likedSongIds[s.id]) && arr.findIndex((x) => x.id === s.id) === idx
  );

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col selection:bg-[#00FF87] selection:text-black">
      {/* 1. Header with RhythmX Glowing Logo, Frosted Search Pill & Creator Avatar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearching={isSearching}
      />

      {/* 2. 3D Tactile Category Chips Bar */}
      {!isSearchActive && (
        <CategoryChips
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-32">
        {/* ================================================================ */}
        {/* SEARCH ACTIVE VIEW: STRICT SEARCH RESULTS GRID (NO HOME FALLBACK) */}
        {/* ================================================================ */}
        {isSearchActive ? (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-bold text-[#00FF87] tracking-wider uppercase">
                  GLOBAL CATALOG SEARCH
                </p>
                <h1 className="text-xl md:text-2xl font-black text-white mt-0.5">
                  Results for &ldquo;{searchQuery}&rdquo;
                </h1>
              </div>
              {searchResults.length > 0 && (
                <span className="text-xs font-mono text-neutral-400">
                  {searchResults.length} tracks found
                </span>
              )}
            </div>

            {/* Skeleton Pulse Loader */}
            {isSearching && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3.5 p-3 rounded-2xl glass-card"
                  >
                    <div className="w-14 h-14 rounded-xl bg-neutral-800 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-neutral-800 rounded w-3/4" />
                      <div className="h-3 bg-neutral-800/60 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty Search State */}
            {!isSearching && searchResults.length === 0 && (
              <div className="text-center py-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,135,0.2)]">
                  <SearchX className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-bold text-white">No tracks found</h3>
                <p className="text-xs text-neutral-400 max-w-sm mt-1">
                  Try searching by artist name, genre (&ldquo;phonk&rdquo;, &ldquo;gym&rdquo;, &ldquo;lo-fi&rdquo;), or alternative keywords.
                </p>
              </div>
            )}

            {/* Search Results Grid */}
            {!isSearching && searchResults.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {searchResults.map((song) => {
                    const isCurrent = currentTrack?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playSong(song, searchResults)}
                        className={`group relative glass-card p-3 flex items-center cursor-pointer overflow-hidden ${
                          isCurrent
                            ? "border-[#00FF87]/50 shadow-[0_0_20px_rgba(0,255,135,0.25)]"
                            : ""
                        }`}
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900 shadow">
                          <img
                            src={song.imageUrl || FALLBACK_VINYL}
                            alt={song.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                            }}
                          />
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                          </div>
                        </div>

                        <div className="ml-3.5 min-w-0 flex-1 pr-2">
                          <h4
                            className={`text-sm font-semibold truncate ${
                              isCurrent ? "text-[#00FF87]" : "text-white"
                            }`}
                          >
                            {song.name}
                          </h4>
                          <p className="text-xs text-neutral-400 truncate mt-0.5">
                            {song.primaryArtists}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate">
                            {song.album || "Single"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Related Radio Queue generated behind search */}
                {searchRadioQueue.length > 0 && (
                  <div className="mt-10">
                    <ShelfCarousel
                      title="Related Radio & Trending Mix"
                      subtitle="CONTINUE THE VIBE"
                      songs={searchRadioQueue}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ) : isFavoritesActive ? (
          /* ================================================================ */
          /* FAVORITES VIEW: USER'S LIKED TRACKS                              */
          /* ================================================================ */
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-bold text-[#00FF87] tracking-wider uppercase">
                  SAVED COLLECTION
                </p>
                <h1 className="text-xl md:text-2xl font-black text-white mt-0.5">
                  Your Favorites
                </h1>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                {favoriteSongs.length} saved tracks
              </span>
            </div>

            {favoriteSongs.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center glass-card p-8">
                <div className="w-16 h-16 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,135,0.2)]">
                  <Heart className="w-8 h-8 text-[#00FF87]" />
                </div>
                <h3 className="text-lg font-bold text-white">No favorites yet</h3>
                <p className="text-xs text-neutral-400 max-w-sm mt-1">
                  Tap the heart or thumbs-up icon on any track to save it to your personal favorites station.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {favoriteSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, favoriteSongs)}
                    className="group relative glass-card p-3 flex items-center cursor-pointer"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900 shadow">
                      <img
                        src={song.imageUrl || FALLBACK_VINYL}
                        alt={song.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    <div className="ml-3.5 min-w-0 flex-1 pr-2">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {song.name}
                      </h4>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {song.primaryArtists}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : isCategoryActive ? (
          /* ================================================================ */
          /* CATEGORY FILTERED VIEW: DYNAMIC MOOD BUNDLE                      */
          /* ================================================================ */
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-bold text-[#00FF87] tracking-wider uppercase">
                  MOOD EXPLORER
                </p>
                <h1 className="text-xl md:text-2xl font-black text-white mt-0.5">
                  {activeCategory} Radio
                </h1>
              </div>
            </div>

            {loadingCategory ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3.5 p-3 rounded-2xl glass-card"
                  >
                    <div className="w-14 h-14 rounded-xl bg-neutral-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-neutral-800 rounded w-3/4" />
                      <div className="h-3 bg-neutral-800/60 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {categoryFeed.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, categoryFeed)}
                    className="group relative glass-card p-3 flex items-center cursor-pointer"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900 shadow">
                      <img
                        src={song.imageUrl || FALLBACK_VINYL}
                        alt={song.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    <div className="ml-3.5 min-w-0 flex-1 pr-2">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {song.name}
                      </h4>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {song.primaryArtists}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ================================================================ */
          /* DEFAULT RHYTHMX HOME FEED:                                       */
          /* HeroVisualizer -> UserShelves -> QuickPicks -> Shelves -> Card   */
          /* ================================================================ */
          <>
            {/* 3. 3D Floating Hero Visualizer Showcase */}
            <HeroVisualizer
              featuredTrack={shelves.heroTrending[0] || null}
              onPlay={(track) => playSong(track, shelves.heroTrending)}
            />

            {/* 4. Dedicated Horizontally Scrollable Personal Activity Sections */}
            <UserShelves
              onSelectSearchQuery={(query) => setSearchQuery(query)}
            />

            {/* 5. Speed Dial Stations + Quick Picks Track Rows */}
            <QuickPicksList
              title="Quick Picks"
              subtitle="START RADIO FROM A SONG"
              songs={shelves.quickPicks}
              speedDialSongs={shelves.speedDial}
            />

            {/* 6. Trending Global Hits Carousel */}
            <ShelfCarousel
              title="Trending Global Hits"
              subtitle="TOP CHARTS • LOSSLESS STREAM"
              songs={shelves.heroTrending}
            />

            {/* 7. Gym Phonk & Cyber Hype Carousel */}
            <ShelfCarousel
              title="Gym Phonk & Cyber Hype"
              subtitle="HIGH ENERGY • 320KBPS"
              songs={shelves.gymPhonk}
            />

            {/* 8. Midnight Lo-Fi & Soulful Chill Carousel */}
            <ShelfCarousel
              title="Midnight Chill & Lo-Fi"
              subtitle="SLOWED & REVERB • FOCUS"
              songs={shelves.midnightChill}
            />

            {/* 9. Creator Spotlight Showcase Banner: Rishabh Singh */}
            <section className="px-4 md:px-8 my-10">
              <div className="relative glass-card overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_15px_40px_rgba(0,0,0,0.85)]">
                <div className="flex items-center space-x-4 sm:space-x-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-4 ring-[#00FF87]/80 shadow-[0_0_25px_rgba(0,255,135,0.4)] flex-shrink-0 bg-neutral-900">
                    <img
                      src="/creator.jpg"
                      alt="Rishabh Singh"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg sm:text-xl font-black text-white">
                        Rishabh Singh
                      </h3>
                      <CheckCircle2 className="w-4 h-4 text-[#00FF87]" />
                    </div>
                    <p className="text-xs font-semibold text-[#00FF87] mt-0.5">
                      Lead Dev &amp; Founder • Systems Mobile Architect
                    </p>
                    <p className="text-xs text-neutral-400 mt-1 max-w-md">
                      Engineered RhythmX with native MediaSession controls, zero-latency 320kbps failover, and hardware-accelerated 60fps mobile execution.
                    </p>
                  </div>
                </div>

                <Link
                  href="https://www.instagram.com/rish4bhsiingh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00FF87] to-[#10B981] text-black font-extrabold text-xs flex items-center space-x-2 transition shadow-lg shadow-[#00FF87]/25 hover:scale-105 active:scale-95 flex-shrink-0"
                >
                  <span>Connect with Rishabh</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Global Persistent MiniPlayer & FullPlayerModal */}
      <MiniPlayer />
      <FullPlayerModal />
    </div>
  );
}
