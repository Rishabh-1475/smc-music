"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Play,
  Heart,
  SearchX,
  Compass,
  ArrowLeft,
  MoreVertical,
  Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import CategoryChips from "@/components/CategoryChips";
import HeroVisualizer from "@/components/HeroVisualizer";
import TopDailyPlaylists from "@/components/TopDailyPlaylists";
import CoverFlowCarousel from "@/components/CoverFlowCarousel";
import NeonGlowPlayerWidget from "@/components/NeonGlowPlayerWidget";
import UserShelves from "@/components/UserShelves";
import GalaxyVisualizer from "@/components/GalaxyVisualizer";
import NowPlayingView from "@/components/NowPlayingView";
import MiniPlayer from "@/components/MiniPlayer";
import BottomNav, { NavTab } from "@/components/BottomNav";
import ProfileView from "@/components/ProfileView";
import OnboardingModal from "@/components/OnboardingModal";
import { useUserStore } from "@/store/userStore";
import { usePlayerStore } from "@/store/playerStore";
import {
  searchSongs,
  searchSongsWithRadio,
  getHomeShelves,
} from "@/services/api";
import { Song } from "@/types/music";
import curatedTracks from "@/services/curatedTracks.json";

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

const CATEGORY_QUERY_MAP: Record<string, string> = {
  All: "Trending India Top 50",
  Trending: "Trending India Top 50",
  "New Release": "Latest Hindi Releases 2026",
  Top: "Global Top Hits",
  "Gym Phonk": "Gym Phonk Workout Aggressive",
  Punjabi: "Trending Punjabi Hits",
  Bhojpuri: "Bhojpuri Top Hits",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [libraryFilter, setLibraryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searchRadioQueue, setSearchRadioQueue] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const [categoryFeed, setCategoryFeed] = useState<Song[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const categoryCacheRef = useRef<Record<string, Song[]>>({});

  const searchReqIdRef = useRef<number>(0);
  const { userName, userAge } = useUserStore();
  const {
    playSong,
    currentTrack,
    likedSongs,
    recordSearchQuery,
  } = usePlayerStore();

  // Home shelves state initialized with instant curated data so Hero and Playlists never disappear
  const [shelves, setShelves] = useState<{
    heroTrending: Song[];
    speedDial: Song[];
    quickPicks: Song[];
    gymPhonk: Song[];
    midnightChill: Song[];
  }>({
    heroTrending: (curatedTracks.trendingHits as unknown as Song[]) || [],
    speedDial: ((curatedTracks.trendingHits as unknown as Song[]) || []).slice(0, 9),
    quickPicks: (curatedTracks.quickPicks as unknown as Song[]) || [],
    gymPhonk: (curatedTracks.workoutHype as unknown as Song[]) || [],
    midnightChill: (curatedTracks.chillVibes as unknown as Song[]) || [],
  });

  const [loadingShelves, setLoadingShelves] = useState(true);

  // Fetch initial curated shelves
  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoadingShelves(true);
      try {
        const data = await getHomeShelves();
        if (active) {
          setShelves(data);
          if (data.heroTrending && data.heroTrending.length > 0) {
            categoryCacheRef.current["All"] = data.heroTrending;
            categoryCacheRef.current["Trending"] = data.heroTrending;
          }
          if (data.gymPhonk && data.gymPhonk.length > 0) {
            categoryCacheRef.current["Gym Phonk"] = data.gymPhonk;
          }
          if (data.quickPicks && data.quickPicks.length > 0) {
            categoryCacheRef.current["Punjabi"] = data.quickPicks;
          }
        }
      } catch (err) {
        console.error("Failed to load initial shelves:", err);
      } finally {
        if (active) setLoadingShelves(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  // Category Chip Selection Handler: Dynamic Queries with Dedicated Feeds
  const handleCategorySelect = async (category: string) => {
    setActiveCategory(category);

    if (!category || category === "All") {
      setCategoryFeed([]);
      setLoadingCategory(false);
      return;
    }

    // Check memory cache first for instant responsiveness
    if (
      categoryCacheRef.current[category] &&
      categoryCacheRef.current[category].length > 0
    ) {
      setCategoryFeed(categoryCacheRef.current[category]);
    } else {
      setLoadingCategory(true);
    }

    try {
      const targetQuery =
        CATEGORY_QUERY_MAP[category] || `${category} Top Hits`;
      const songs = await searchSongs(targetQuery);
      if (songs && songs.length > 0) {
        categoryCacheRef.current[category] = songs;
        setCategoryFeed(songs);
      }
    } catch (err) {
      console.error(`Failed to load category ${category}:`, err);
    } finally {
      setLoadingCategory(false);
    }
  };

  // Debounced search engine
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
      recordSearchQuery(trimmed);

      try {
        const { results, radioQueue } = await searchSongsWithRadio(trimmed);
        if (currentReqId === searchReqIdRef.current) {
          setSearchResults(results);
          setSearchRadioQueue(radioQueue);
        }
      } catch (err) {
        if (currentReqId === searchReqIdRef.current) {
          console.error("Search failed:", err);
          setSearchResults([]);
          setSearchRadioQueue([]);
        }
      } finally {
        if (currentReqId === searchReqIdRef.current) {
          setIsSearching(false);
        }
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [searchQuery, recordSearchQuery]);

  return (
    <>
      {/* Onboarding Dialog for First Time Users */}
      <OnboardingModal />

      {/* Main App Container with pb-36 to eliminate MiniPlayer/BottomDock collisions */}
      <main className="w-full flex-1 flex flex-col pb-36 select-none">
        {/* TAB 1: HOME */}
        {activeTab === "home" && (
          <>
            {/* Header: Avatar, Greeting, 38px Frosted Search & Favorites */}
            <Header
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearching={isSearching}
              onOpenFavorites={() => {
                setActiveTab("library");
                setLibraryFilter("Liked Songs");
              }}
              onOpenProfile={() => setActiveTab("profile")}
            />

            {/* Category Filter Pills: All, New Release, Trending, Top, Gym Phonk, Punjabi, Bhojpuri */}
            <CategoryChips
              activeCategory={activeCategory}
              onSelectCategory={handleCategorySelect}
            />

            {/* Content Flow */}
            {searchQuery.trim().length > 0 ? (
              /* A. Search Active View */
              <div className="w-full px-4 pt-2">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400">
                    Results for &ldquo;{searchQuery}&rdquo;
                  </h3>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-[#D4FF00] font-semibold hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <Loader2 className="w-8 h-8 text-[#D4FF00] animate-spin" />
                    <p className="text-xs text-gray-400">
                      Searching across global loss-free servers...
                    </p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <SearchX className="w-12 h-12 text-gray-600 mb-3" />
                    <h4 className="text-sm font-bold text-white">
                      No matching songs found
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">
                      Try searching by track name, artist (e.g. &ldquo;Arijit
                      Singh&rdquo;, &ldquo;Sidhu Moose Wala&rdquo;), or genre.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {searchResults.map((song) => {
                      const isCurrent = currentTrack?.id === song.id;
                      return (
                        <div
                          key={song.id}
                          onClick={() =>
                            playSong(
                              song,
                              searchRadioQueue.length > 0
                                ? searchRadioQueue
                                : searchResults
                            )
                          }
                          className={`flex items-center justify-between p-2 rounded-2xl transition cursor-pointer select-none ${
                            isCurrent
                              ? "bg-white/[0.08] border border-[#D4FF00]/40 shadow-sm"
                              : "hover:bg-white/5 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 flex-shrink-0">
                              <img
                                src={song.imageUrl || FALLBACK_VINYL}
                                alt={song.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (
                                    e.currentTarget as HTMLImageElement
                                  ).src = FALLBACK_VINYL;
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1 pr-2">
                              <h4
                                className={`text-xs font-semibold truncate ${
                                  isCurrent ? "text-lime-400" : "text-white"
                                }`}
                              >
                                {song.name}
                              </h4>
                              <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                By {song.primaryArtists} • Lossless
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playSong(
                                song,
                                searchRadioQueue.length > 0
                                  ? searchRadioQueue
                                  : searchResults
                              );
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCurrent
                                ? "bg-[#D4FF00] text-black"
                                : "bg-white/10 hover:bg-white/20 text-white"
                            }`}
                            aria-label="Play"
                          >
                            <Play className="w-3 h-3 fill-current stroke-current ml-0.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : activeCategory !== "All" ? (
              /* B. Specific Category View: Dedicated Hero Track + 20+ Curated Category Tracks */
              <div className="w-full">
                {/* 1. Category #1 Hero Showcase Card */}
                <HeroVisualizer
                  featuredTrack={categoryFeed[0] || null}
                  badgeLabel={`${activeCategory.toUpperCase()} #1`}
                  onPlay={(track) => playSong(track, categoryFeed)}
                />

                {/* 2. Curated Category Song List */}
                {loadingCategory && categoryFeed.length === 0 ? (
                  <div className="px-4 py-6 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-neutral-800" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 bg-neutral-800 rounded w-3/4" />
                          <div className="h-2.5 bg-neutral-800/60 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <TopDailyPlaylists
                    songs={categoryFeed.slice(1)}
                    title={`${activeCategory} Essentials`}
                    maxItems={30}
                  />
                )}
              </div>
            ) : (
              /* C. Standard 'All' View: Hero Showcase + 3D Cover Flow + Neon Widget + Top Playlists + Personal Shelves */
              <>
                {/* 1. Curated & Trending Hero Card (Reference 1 Guaranteed Render) */}
                <HeroVisualizer
                  featuredTrack={
                    shelves.heroTrending[0] ||
                    (curatedTracks.trendingHits as any)[0]
                  }
                  badgeLabel="DISCOVER WEEKLY"
                  onPlay={(track) =>
                    playSong(track, shelves.heroTrending)
                  }
                />

                {/* 2. 3D Cover Flow Carousel (Direct Reference from User Uploaded Images 1, 3, 4) */}
                <CoverFlowCarousel />

                {/* 3. Glowing Neon Frosted Player Widget (Direct Reference from User Uploaded Image 2) */}
                <NeonGlowPlayerWidget />

                {/* 4. Top Daily Playlists (With Real Song Covers & HTML Decoded Titles) */}
                <TopDailyPlaylists
                  songs={
                    shelves.quickPicks.length > 0
                      ? shelves.quickPicks
                      : (curatedTracks.quickPicks as any)
                  }
                  title="Top daily playlists"
                  onSeeAll={() => handleCategorySelect("Top")}
                  maxItems={5}
                />

                {/* 5. Trending Global Hits Shelf */}
                {shelves.heroTrending.length > 5 && (
                  <TopDailyPlaylists
                    songs={shelves.heroTrending.slice(5, 20)}
                    title="Trending Global Hits"
                    maxItems={10}
                  />
                )}

                {/* 6. Personal Activity Shelves (Recently Played, Liked, Frequency) */}
                <UserShelves
                  onSelectSearchQuery={(query) => setSearchQuery(query)}
                />
              </>
            )}
          </>
        )}

        {/* TAB 2: INTERACTIVE MUSIC GALAXY / CONSTELLATION NODE GRAPH */}
        {activeTab === "galaxy" && (
          <div className="w-full px-4 pt-4">
            <GalaxyVisualizer />
          </div>
        )}

        {/* TAB 3: MY MUSIC / LIBRARY */}
        {activeTab === "library" && (
          <div className="w-full px-4 pt-5 gpu-layer">
            {/* Header: Back arrow, "My Music", Three dots */}
            <div className="flex items-center justify-between pb-3">
              <button
                onClick={() => setActiveTab("home")}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base font-bold text-white tracking-tight">
                My Music
              </h2>
              <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white cursor-pointer">
                <MoreVertical className="w-4 h-4" />
              </div>
            </div>

            {/* Filter Pills matching Reference 3: "All", "Playlists", "Liked Songs", "Downloads" */}
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-2">
              {["All", "Playlists", "Liked Songs", "Downloads"].map((item) => {
                const isSelected = libraryFilter === item;
                return (
                  <button
                    key={item}
                    onClick={() => setLibraryFilter(item)}
                    className={`whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "px-5 py-2 rounded-full text-xs font-bold bg-[#D4FF00] text-black shadow-md shadow-[#D4FF00]/25"
                        : "px-4 py-2 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {/* Track List rows matching Reference 3 */}
            <div className="flex flex-col gap-2.5 mt-3">
              {(libraryFilter === "Liked Songs"
                ? likedSongs
                : libraryFilter === "Playlists"
                ? shelves.speedDial
                : [...likedSongs, ...shelves.heroTrending]
              )
                .slice(0, 20)
                .map((song, idx) => (
                  <div
                    key={`lib-item-${song.id}-${idx}`}
                    onClick={() => playSong(song)}
                    className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/5 transition cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <img
                        src={song.imageUrl || FALLBACK_VINYL}
                        alt={song.name}
                        className="w-11 h-11 rounded-2xl object-cover bg-neutral-900 border border-white/10 shadow-sm"
                      />
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {song.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          By {song.primaryArtists || "Waveform"} • Lossless
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#D4FF00] hover:text-black text-white flex items-center justify-center flex-shrink-0">
                      <Play className="w-3 h-3 fill-current stroke-current ml-0.5" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === "profile" && (
          <ProfileView onBackToHome={() => setActiveTab("home")} />
        )}
      </main>

      {/* MiniPlayer: Fixed floating directly above the bottom nav (bottom-[68px]) */}
      <MiniPlayer />

      {/* Now Playing Full Screen Modal */}
      <NowPlayingView />

      {/* Floating Bottom Nav Dock (h-16 fixed bottom-0) */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </>
  );
}
