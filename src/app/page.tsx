"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Music,
  ExternalLink,
  Play,
  CheckCircle2,
  SearchX,
} from "lucide-react";
import Header from "@/components/Header";
import CategoryChips from "@/components/CategoryChips";
import SpeedDialGrid from "@/components/SpeedDialGrid";
import QuickPicksList from "@/components/QuickPicksList";
import ShelfCarousel from "@/components/ShelfCarousel";
import SongCard from "@/components/SongCard";
import MiniPlayer from "@/components/MiniPlayer";
import FullPlayerModal from "@/components/FullPlayerModal";
import { searchSongs, getHomeFeed, getLiveCategory } from "@/services/api";
import { Song, CategoryMood } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const searchReqIdRef = useRef<number>(0);
  const { playSong, likedSongIds, listeningHistory } = usePlayerStore();

  // YouTube Music Home Feed Sections
  const [feeds, setFeeds] = useState<{
    quickPicks: Song[];
    trending: Song[];
    international: Song[];
    punjabiBollywood: Song[];
    workout: Song[];
    chill: Song[];
    party: Song[];
  }>({
    quickPicks: [],
    trending: [],
    international: [],
    punjabiBollywood: [],
    workout: [],
    chill: [],
    party: [],
  });

  const [loadingFeeds, setLoadingFeeds] = useState(true);

  // Load home feeds on mount
  useEffect(() => {
    let active = true;

    async function loadFeeds() {
      setLoadingFeeds(true);
      try {
        const data = await getHomeFeed();
        if (active) {
          setFeeds(data);
        }
      } catch (err) {
        console.error("Failed to load YouTube Music home feed:", err);
      } finally {
        if (active) setLoadingFeeds(false);
      }
    }

    loadFeeds();
    return () => {
      active = false;
    };
  }, []);

  // Category Mood Chip Selection Handler
  const handleCategorySelect = async (category: CategoryMood | string) => {
    setActiveCategory(category);
    if (!category || category === "All") {
      return;
    }

    // When mood chip is selected while not searching, trigger live category update
    setLoadingFeeds(true);
    try {
      const results = await getLiveCategory(category);
      if (results.length > 0) {
        setFeeds((prev) => ({
          ...prev,
          quickPicks: results.slice(0, 12),
          trending: results,
        }));
      }
    } catch (err) {
      console.error("Category query error:", err);
    } finally {
      setLoadingFeeds(false);
    }
  };

  // 300ms Debounced Search Engine with Promise Cancellation
  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const currentReqId = ++searchReqIdRef.current;

    const handler = setTimeout(async () => {
      try {
        const results = await searchSongs(trimmed);
        // Only accept response if this is still the active search request
        if (currentReqId === searchReqIdRef.current) {
          setSearchResults(results);
        }
      } catch (err) {
        console.error("Search error:", err);
        if (currentReqId === searchReqIdRef.current) {
          setSearchResults([]);
        }
      } finally {
        if (currentReqId === searchReqIdRef.current) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Dynamically derive liked songs collection
  const likedSongs = useMemo(() => {
    const allPool: Song[] = [
      ...(listeningHistory || []),
      ...feeds.quickPicks,
      ...feeds.trending,
      ...feeds.international,
      ...feeds.punjabiBollywood,
      ...feeds.workout,
      ...feeds.chill,
      ...feeds.party,
      ...searchResults,
    ];

    const uniqueMap = new Map<string, Song>();
    for (const song of allPool) {
      if (likedSongIds[song.id] && !uniqueMap.has(song.id)) {
        uniqueMap.set(song.id, song);
      }
    }
    return Array.from(uniqueMap.values());
  }, [likedSongIds, listeningHistory, feeds, searchResults]);

  // YouTube Music Smooth Pulse Skeleton Loaders
  const renderSkeletons = (count = 12) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3 rounded-2xl bg-[#181818] border border-white/5 flex flex-col animate-pulse"
        >
          <div className="aspect-square w-full rounded-xl bg-[#282828] mb-3" />
          <div className="h-4 bg-[#282828] rounded w-3/4 mb-2" />
          <div className="h-3 bg-[#242424] rounded w-1/2" />
        </div>
      ))}
    </div>
  );

  // Distinct search state separation
  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* 1. Header with YouTube Music Search & Creator Spotlight */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearching={isSearching}
      />

      {/* 2. Top Mood Filter Chips (shown when search is not active) */}
      {!isSearchActive && (
        <CategoryChips
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
        />
      )}

      <main className="flex-1 w-full mx-auto pb-36">
        {/* WHEN isSearchActive IS TRUE: Show ONLY the Search Results Grid */}
        {isSearchActive ? (
          <section className="px-4 md:px-8 py-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Results for &ldquo;{searchQuery.trim()}&rdquo;
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
              /* Authentic No Results Found State - NEVER falls back to home screen songs */
              <div className="text-center py-24 text-neutral-400 max-w-md mx-auto px-4">
                <SearchX className="w-14 h-14 mx-auto text-neutral-600 mb-4 stroke-1" />
                <h3 className="text-lg font-bold text-white mb-1">
                  No results found for &ldquo;{searchQuery.trim()}&rdquo;
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Try checking the spelling or searching for another international artist, Bollywood track, or Punjabi single.
                </p>
              </div>
            )}
          </section>
        ) : loadingFeeds ? (
          /* Initial Home Skeletons */
          <div className="px-4 md:px-8 py-8 space-y-8">
            <div className="space-y-4">
              <div className="h-6 w-48 bg-[#212121] rounded-md animate-pulse" />
              {renderSkeletons(6)}
            </div>
            <div className="space-y-4">
              <div className="h-6 w-48 bg-[#212121] rounded-md animate-pulse" />
              {renderSkeletons(6)}
            </div>
          </div>
        ) : (
          /* WHEN isSearchActive IS FALSE: Render YouTube Music Complete Home Layout */
          <div className="space-y-2">
            {/* 1. Speed Dial / Quick Radios (3x3 grid derived from play history or trending) */}
            <SpeedDialGrid fallbackSongs={feeds.quickPicks} />

            {/* 2. Quick Picks (4-row vertical card layout with instant play) */}
            <QuickPicksList
              title="Quick picks"
              subtitle="START RADIO FROM A SONG"
              songs={feeds.quickPicks}
            />

            {/* 3. Trending Global & Indian Hits (Carousel) */}
            <ShelfCarousel
              title="Trending Global &amp; Indian Hits"
              subtitle="TOP CHARTS &amp; VIRAL HITS"
              songs={feeds.trending}
              variant="square"
            />

            {/* 4. International Pop & Hip-Hop (Carousel) */}
            <ShelfCarousel
              title="International Pop &amp; Hip-Hop"
              subtitle="BILLBOARD &amp; GLOBAL BANGERS"
              songs={feeds.international}
              variant="square"
            />

            {/* 5. Punjabi Hype & Bollywood Romance (Carousel) */}
            <ShelfCarousel
              title="Punjabi Hype &amp; Bollywood Romance"
              subtitle="DESI VIBES &amp; SOULFUL MELODIES"
              songs={feeds.punjabiBollywood}
              variant="square"
            />

            {/* 6. Liked Songs (Dynamically populated from playerStore.likedSongIds) */}
            {likedSongs.length > 0 && (
              <ShelfCarousel
                title="Liked Songs"
                subtitle="YOUR FAVORITES &amp; THUMBS UP"
                songs={likedSongs}
                variant="square"
              />
            )}

            {/* 7. Creator Spotlight Banner Honoring Rishabh Singh */}
            <section className="my-10 px-4 md:px-8">
              <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950/70 via-[#181818] to-[#121212] border border-emerald-500/25 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-5 flex-1 min-w-0">
                  <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-emerald-500/50 flex-shrink-0 shadow-2xl bg-neutral-900">
                    <img
                      src="/creator.jpg"
                      alt="Rishabh Singh"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-center sm:justify-start space-x-2 mb-1">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Creator Spotlight
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>

                    <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                      Rishabh Singh
                    </h3>
                    <p className="text-sm font-medium text-emerald-300/90 mb-2">
                      Founder &amp; Lead Systems Mobile Architect
                    </p>
                    <p className="text-xs md:text-sm text-neutral-300 max-w-xl leading-relaxed">
                      Architected <strong>SMC Singhs Music Co</strong> to deliver lossless 320kbps audio streaming, instant multi-mirror failover, and a fluid YouTube Music experience on mobile WebViews with zero mock placeholders.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-2.5 sm:space-y-0 sm:space-x-3 flex-shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => {
                      if (feeds.quickPicks.length > 0) {
                        playSong(feeds.quickPicks[0], feeds.quickPicks);
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-black stroke-black" />
                    <span>Play SMC Originals</span>
                  </button>

                  <Link
                    href="https://www.instagram.com/rish4bhsiingh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#212121] hover:bg-[#282828] text-white border border-white/10 font-semibold text-sm flex items-center justify-center space-x-2 transition active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-400" />
                    <span>Instagram Profile</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Global Persistent MiniPlayer */}
      <MiniPlayer />

      {/* Global Persistent FullPlayerModal */}
      <FullPlayerModal />
    </div>
  );
}
