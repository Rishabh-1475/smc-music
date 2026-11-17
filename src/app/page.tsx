"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Music,
  Flame,
  Zap,
  Coffee,
  Heart,
  ExternalLink,
  Play,
  CheckCircle2,
  Headphones,
} from "lucide-react";
import Header from "@/components/Header";
import CategoryChips from "@/components/CategoryChips";
import QuickPicksGrid from "@/components/QuickPicksGrid";
import HorizontalShelf from "@/components/HorizontalShelf";
import SongCard from "@/components/SongCard";
import MiniPlayer from "@/components/MiniPlayer";
import FullPlayerModal from "@/components/FullPlayerModal";
import { searchSongs, getYTMusicHomeFeeds, getLiveCategory } from "@/services/api";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");

  const { playSong } = usePlayerStore();

  // YouTube Music Categorized Home Feeds
  const [feeds, setFeeds] = useState<{
    quickPicks: Song[];
    trendingHits: Song[];
    moodStations: Song[];
    workoutHype: Song[];
    chillVibes: Song[];
  }>({
    quickPicks: [],
    trendingHits: [],
    moodStations: [],
    workoutHype: [],
    chillVibes: [],
  });

  const [loadingFeeds, setLoadingFeeds] = useState(true);

  // Load YouTube Music Home Feeds on Mount
  useEffect(() => {
    let active = true;

    async function loadFeeds() {
      setLoadingFeeds(true);
      try {
        const data = await getYTMusicHomeFeeds();
        if (active) {
          setFeeds(data);
        }
      } catch (err) {
        console.error("Failed to load YouTube Music home feeds:", err);
      } finally {
        if (active) setLoadingFeeds(false);
      }
    }

    loadFeeds();
    return () => {
      active = false;
    };
  }, []);

  // Category filter selection handler
  const handleCategorySelect = async (category: string) => {
    setActiveCategory(category);
    if (!category) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await getLiveCategory(category);
      setSearchResults(results);
    } catch (err) {
      console.error("Category query error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // 250ms debounced search effect
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      if (!activeCategory) {
        setSearchResults([]);
      }
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
  }, [searchQuery, activeCategory]);

  // YouTube Music smooth pulse skeleton loaders
  const renderSkeletons = (count = 6) => (
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

  const hasSearchOrFilter =
    searchQuery.trim().length > 0 || activeCategory.length > 0;

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* 1. Header at the Top */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={isSearching}
      />

      {/* 2. Sticky CategoryChips Bar beneath Header */}
      <CategoryChips
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
      />

      <main className="flex-1 w-full mx-auto pb-36">
        {/* Dynamic Search / Mood Filter Results View */}
        {hasSearchOrFilter ? (
          <section className="px-4 md:px-8 py-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                {activeCategory ? `${activeCategory} Mix` : "Search Results"}
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
              <div className="text-center py-20 text-neutral-400">
                <Music className="w-12 h-12 mx-auto text-neutral-600 mb-3" />
                <p className="text-base font-medium">
                  No tracks found for &ldquo;{searchQuery || activeCategory}&rdquo;
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Try searching for another artist, track, or mood.
                </p>
              </div>
            )}
          </section>
        ) : loadingFeeds ? (
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
          /* Default YouTube Music Home Feed */
          <div className="space-y-4">
            {/* Section 1: "Quick Picks" (Listen again / Start radio grid) */}
            <QuickPicksGrid
              title="Quick picks"
              subtitle="START RADIO FROM A SONG"
              songs={feeds.quickPicks}
            />

            {/* Section 2: "Mixed for You" (Horizontal cards with play overlays) */}
            <HorizontalShelf
              title="Mixed for you"
              subtitle="RECOMMENDED FOR YOU"
              songs={feeds.trendingHits}
              variant="square"
            />

            {/* Section 3: "Trending & New Releases" (Carousel) */}
            <HorizontalShelf
              title="Trending &amp; New Releases"
              subtitle="TOP CHARTS &amp; VIRAL HITS"
              songs={feeds.moodStations}
              variant="square"
            />

            {/* Section 4: "Moods & Genres" (Interactive Pill Cards) */}
            <section className="my-8 px-4 md:px-8">
              <div className="mb-4">
                <p className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  EXPLORE VIBES
                </p>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
                  Moods &amp; Genres
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div
                  onClick={() => handleCategorySelect("Party")}
                  className="group relative h-28 rounded-2xl p-4 bg-gradient-to-br from-amber-600/90 to-orange-700/80 hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg"
                >
                  <Flame className="w-6 h-6 text-white/90 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="font-bold text-base text-white">Party &amp; Dance</h3>
                    <p className="text-[11px] text-white/80">Club beats &amp; bass</p>
                  </div>
                </div>

                <div
                  onClick={() => handleCategorySelect("Chill")}
                  className="group relative h-28 rounded-2xl p-4 bg-gradient-to-br from-indigo-700/90 to-cyan-800/80 hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg"
                >
                  <Coffee className="w-6 h-6 text-white/90 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="font-bold text-base text-white">Chill &amp; Lo-Fi</h3>
                    <p className="text-[11px] text-white/80">Late night relaxation</p>
                  </div>
                </div>

                <div
                  onClick={() => handleCategorySelect("Workout")}
                  className="group relative h-28 rounded-2xl p-4 bg-gradient-to-br from-emerald-600/90 to-teal-800/80 hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg"
                >
                  <Zap className="w-6 h-6 text-white/90 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="font-bold text-base text-white">Energy &amp; Gym</h3>
                    <p className="text-[11px] text-white/80">High tempo motivators</p>
                  </div>
                </div>

                <div
                  onClick={() => handleCategorySelect("Romance")}
                  className="group relative h-28 rounded-2xl p-4 bg-gradient-to-br from-rose-600/90 to-pink-800/80 hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg"
                >
                  <Heart className="w-6 h-6 text-white/90 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="font-bold text-base text-white">Romance &amp; Love</h3>
                    <p className="text-[11px] text-white/80">Soulful acoustic ballads</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Additional Thematic Shelf: Energy & Workout */}
            <HorizontalShelf
              title="Energy &amp; Workout Hype"
              subtitle="CARDIO &amp; STRENGTH"
              songs={feeds.workoutHype}
              variant="square"
            />

            {/* Additional Thematic Shelf: Chill Vibes */}
            <HorizontalShelf
              title="Chill &amp; Focus"
              subtitle="DEEP WORK &amp; STUDY"
              songs={feeds.chillVibes}
              variant="square"
            />

            {/* Section 5: "Singhs Music Co Originals & Creator Spotlight" */}
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
                      Architected <strong>SMC Singhs Music Co</strong> to deliver lossless 320kbps audio streaming, instant multi-mirror failover, and a fluid YouTube Music experience on mobile WebViews.
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
                    className="w-full sm:w-auto px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-500/25 active:scale-95"
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

      {/* Global Persistent FullPlayerModal with Lyrics & Up Next Tabs */}
      <FullPlayerModal />
    </div>
  );
}
