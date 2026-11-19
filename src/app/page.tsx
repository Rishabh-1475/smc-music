"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ExternalLink,
  Play,
  Heart,
  SearchX,
  Compass,
  CheckCircle2,
  Trash2,
  RotateCcw,
  User,
  Music2,
} from "lucide-react";
import Header from "@/components/Header";
import CategoryChips from "@/components/CategoryChips";
import HeroVisualizer from "@/components/HeroVisualizer";
import TopDailyPlaylists from "@/components/TopDailyPlaylists";
import ShelfCarousel from "@/components/ShelfCarousel";
import UserShelves from "@/components/UserShelves";
import GalaxyVisualizer from "@/components/GalaxyVisualizer";
import NowPlayingView from "@/components/NowPlayingView";
import MiniPlayer from "@/components/MiniPlayer";
import BottomNav, { NavTab } from "@/components/BottomNav";
import OnboardingModal from "@/components/OnboardingModal";
import { useUserStore } from "@/store/userStore";
import { usePlayerStore } from "@/store/playerStore";
import {
  searchSongsWithRadio,
  getHomeShelves,
  getCategoryFeed,
} from "@/services/api";
import { Song } from "@/types/music";

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searchRadioQueue, setSearchRadioQueue] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const [categoryFeed, setCategoryFeed] = useState<Song[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(false);

  const searchReqIdRef = useRef<number>(0);
  const { userName, userAge, resetOnboarding } = useUserStore();
  const {
    playSong,
    currentTrack,
    likedSongIds,
    likedSongs,
    recentlyPlayed,
    recordSearchQuery,
  } = usePlayerStore();

  // Home shelves state
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

  // Fetch initial curated shelves
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
        console.error("Failed to load shelves:", err);
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
    }, 250);

    return () => clearTimeout(handler);
  }, [searchQuery, recordSearchQuery]);

  const isSearchActive = searchQuery.trim().length > 0;
  const isFavoritesActive = activeCategory.toLowerCase() === "favorites";
  const isCategoryActive =
    activeCategory && activeCategory !== "All" && !isFavoritesActive;

  // Deduplicated liked songs list
  const allKnownSongs = [
    ...(likedSongs || []),
    ...(shelves.heroTrending || []),
    ...(shelves.quickPicks || []),
    ...(shelves.gymPhonk || []),
    ...(shelves.midnightChill || []),
  ];
  const favoriteSongs = allKnownSongs.filter(
    (s, idx, arr) =>
      Boolean(likedSongIds[s.id]) && arr.findIndex((x) => x.id === s.id) === idx
  );

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F0F0F2] flex flex-col selection:bg-[#D2FF1F] selection:text-black relative">
      {/* 1. Mandatory First-Load Onboarding Modal */}
      <OnboardingModal />

      {/* Main Content Pane */}
      <main className="flex-1 pb-44">
        {activeTab === "home" && (
          <>
            {/* Header with Circular User Avatar & Greeting */}
            <Header
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearching={isSearching}
              onOpenFavorites={() => handleCategorySelect("Favorites")}
              onOpenProfile={() => setActiveTab("profile")}
            />

            {/* Pill Filter Chips Bar */}
            {!isSearchActive && (
              <CategoryChips
                activeCategory={activeCategory}
                onSelectCategory={handleCategorySelect}
              />
            )}

            {/* A. Search Active View */}
            {isSearchActive ? (
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 gpu-layer">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-[#D2FF1F] tracking-widest uppercase">
                      CATALOG RESULTS
                    </p>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                      Results for &ldquo;{searchQuery}&rdquo;
                    </h2>
                  </div>
                  {searchResults.length > 0 && (
                    <span className="text-xs font-mono text-neutral-400">
                      {searchResults.length} tracks
                    </span>
                  )}
                </div>

                {isSearching && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-pulse">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5"
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

                {!isSearching && searchResults.length === 0 && (
                  <div className="text-center py-20 flex flex-col items-center justify-center bg-white/[0.02] border border-white/10 rounded-3xl p-8 max-w-md mx-auto my-8">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                      <SearchX className="w-8 h-8 text-[#D2FF1F]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">No tracks located</h3>
                    <p className="text-xs text-neutral-400 font-medium mt-1">
                      Try searching for artist names, titles, or subgenres like &ldquo;phonk&rdquo; or &ldquo;punjabi&rdquo;.
                    </p>
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                      {searchResults.map((song) => {
                        const isCurrent = currentTrack?.id === song.id;
                        return (
                          <div
                            key={song.id}
                            onClick={() => playSong(song, searchResults)}
                            className={`group relative p-3 flex items-center cursor-pointer rounded-2xl transition-all duration-200 ${
                              isCurrent
                                ? "bg-white/10 border border-[#D2FF1F]/50 shadow-lg shadow-[#D2FF1F]/10"
                                : "bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]"
                            }`}
                          >
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900 shadow">
                              <img
                                src={song.imageUrl || FALLBACK_VINYL}
                                alt={song.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                                }}
                              />
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                              </div>
                            </div>

                            <div className="ml-3.5 min-w-0 flex-1 pr-2">
                              <h4
                                className={`text-sm font-semibold truncate leading-tight ${
                                  isCurrent ? "text-[#D2FF1F]" : "text-white"
                                }`}
                              >
                                {song.name}
                              </h4>
                              <p className="text-xs text-neutral-400 truncate mt-0.5">
                                {song.primaryArtists}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {searchRadioQueue.length > 0 && (
                      <div className="mt-8">
                        <ShelfCarousel
                          title="Related Radio Stream"
                          subtitle="CONTINUOUS AUTOPLAY"
                          songs={searchRadioQueue}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : isFavoritesActive ? (
              /* B. Favorites View */
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 gpu-layer">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-[#D2FF1F] tracking-widest uppercase">
                      OFFLINE COLLECTION
                    </p>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                      Vault Favourites
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    {favoriteSongs.length} tracks
                  </span>
                </div>

                {favoriteSongs.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center justify-center bg-white/[0.02] border border-white/10 rounded-3xl p-8 max-w-md mx-auto my-8">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                      <Heart className="w-8 h-8 text-[#D2FF1F]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Vault is empty</h3>
                    <p className="text-xs text-neutral-400 font-medium mt-1">
                      Tap the heart icon on any song to store it in your Favorites collection.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {favoriteSongs.map((song) => (
                      <div
                        key={song.id}
                        onClick={() => playSong(song, favoriteSongs)}
                        className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] p-3 flex items-center cursor-pointer rounded-2xl transition"
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
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                          </div>
                        </div>

                        <div className="ml-3.5 min-w-0 flex-1 pr-2">
                          <h4 className="text-sm font-semibold text-white truncate leading-tight">
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
              /* C. Category Filter View */
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 gpu-layer">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-[#D2FF1F] tracking-widest uppercase">
                      CURATED FEED
                    </p>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                      {activeCategory} Feed
                    </h2>
                  </div>
                </div>

                {loadingCategory ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-pulse">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5"
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
                        className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] p-3 flex items-center cursor-pointer rounded-2xl transition"
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
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                          </div>
                        </div>

                        <div className="ml-3.5 min-w-0 flex-1 pr-2">
                          <h4 className="text-sm font-semibold text-white truncate leading-tight">
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
              /* D. Standard Home Page Experience (Matching Reference 1) */
              <>
                {/* 1. Curated & Trending Hero Card */}
                <HeroVisualizer
                  featuredTrack={shelves.heroTrending[0] || null}
                  onPlay={(track) => playSong(track, shelves.heroTrending)}
                />

                {/* 2. Top Daily Playlists & Track Rows */}
                <TopDailyPlaylists
                  songs={shelves.quickPicks.length > 0 ? shelves.quickPicks : shelves.heroTrending}
                  onSeeAll={() => handleCategorySelect("Top Hits")}
                />

                {/* 3. Global Velocity Trends Carousel */}
                <ShelfCarousel
                  title="Global Velocity Trends"
                  subtitle="LOSSLESS 320 KBPS"
                  songs={shelves.heroTrending}
                />

                {/* 4. Cyber Phonk & Bass Carousel */}
                <ShelfCarousel
                  title="Cyber Phonk & Bassline"
                  subtitle="HIGH-BPM DRIFT"
                  songs={shelves.gymPhonk}
                />

                {/* 5. Personal Activity Decks (Heavy Rotation, Vault, Rewind) */}
                <UserShelves
                  onSelectSearchQuery={(query) => setSearchQuery(query)}
                />
              </>
            )}
          </>
        )}

        {/* Tab 2: Interactive Music Constellation Galaxy Discovery */}
        {activeTab === "galaxy" && (
          <div className="px-3 sm:px-6 md:px-8 pt-4">
            <GalaxyVisualizer />
          </div>
        )}

        {/* Tab 3: My Library */}
        {activeTab === "library" && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 gpu-layer">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#D2FF1F]/10 border border-[#D2FF1F]/30 flex items-center justify-center text-[#D2FF1F]">
                <Music2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  My Library
                </h2>
                <p className="text-xs text-neutral-400">
                  {likedSongs.length} saved songs • {recentlyPlayed.length} in history
                </p>
              </div>
            </div>

            {/* Saved Songs List */}
            <div className="mb-8">
              <h3 className="text-sm font-mono font-bold text-neutral-300 uppercase tracking-wider mb-3">
                Liked Songs ({likedSongs.length})
              </h3>
              {likedSongs.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-neutral-400">
                  No liked songs yet. Heart your favorite tracks to save them here.
                </div>
              ) : (
                <div className="space-y-2">
                  {likedSongs.map((song) => (
                    <div
                      key={`lib-liked-${song.id}`}
                      onClick={() => playSong(song, likedSongs)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] cursor-pointer transition"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <img
                          src={song.imageUrl || FALLBACK_VINYL}
                          alt={song.name}
                          className="w-11 h-11 rounded-xl object-cover bg-neutral-900"
                        />
                        <div className="min-w-0 truncate">
                          <p className="text-sm font-semibold text-white truncate">{song.name}</p>
                          <p className="text-xs text-neutral-400 truncate">{song.primaryArtists}</p>
                        </div>
                      </div>
                      <Play className="w-4 h-4 text-[#D2FF1F]" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recently Played */}
            <div>
              <h3 className="text-sm font-mono font-bold text-neutral-300 uppercase tracking-wider mb-3">
                Recently Streamed
              </h3>
              <div className="space-y-2">
                {recentlyPlayed.slice(0, 10).map((song, i) => (
                  <div
                    key={`lib-rec-${song.id}-${i}`}
                    onClick={() => playSong(song, recentlyPlayed)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] cursor-pointer transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <img
                        src={song.imageUrl || FALLBACK_VINYL}
                        alt={song.name}
                        className="w-11 h-11 rounded-xl object-cover bg-neutral-900"
                      />
                      <div className="min-w-0 truncate">
                        <p className="text-sm font-semibold text-white truncate">{song.name}</p>
                        <p className="text-xs text-neutral-400 truncate">{song.primaryArtists}</p>
                      </div>
                    </div>
                    <RotateCcw className="w-4 h-4 text-neutral-400 hover:text-white" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Profile & Creator Attribution */}
        {activeTab === "profile" && (
          <div className="max-w-md mx-auto px-4 pt-6 gpu-layer text-center flex flex-col items-center">
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#D2FF1F] shadow-[0_0_30px_rgba(210,255,31,0.3)] mb-4 bg-neutral-900">
              <img
                src="/creator.jpg"
                alt={userName || "User"}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-center space-x-1.5 mb-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {userName || "Guest Listener"}
              </h2>
              <CheckCircle2 className="w-5 h-5 text-[#D2FF1F]" />
            </div>

            <p className="text-xs font-mono font-semibold text-[#D2FF1F] uppercase tracking-wider mb-4">
              Age: {userAge || "21"} • RhythmX VIP Member
            </p>

            <div className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-6 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Audio Engine:</span>
                <span className="text-white font-mono font-bold">HTML5 Singleton (320kbps)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Discovery Mode:</span>
                <span className="text-[#D2FF1F] font-mono font-bold">Organic Constellation Graph</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Background Playback:</span>
                <span className="text-white font-mono font-bold">Android MediaSession Active</span>
              </div>
            </div>

            {/* Reset Onboarding Option */}
            <button
              onClick={() => resetOnboarding()}
              className="text-xs text-neutral-400 hover:text-red-400 transition py-2 flex items-center space-x-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Edit Name / Re-trigger Onboarding</span>
            </button>

            {/* Creator Attribution */}
            <div className="w-full mt-8 pt-6 border-t border-white/[0.08] flex flex-col items-center">
              <p className="text-xs text-neutral-400 mb-3">
                Crafted by <strong>Rishabh Singh</strong> • Lead Systems Architect
              </p>
              <Link
                href="https://www.instagram.com/rish4bhsiingh/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-5 rounded-2xl bg-[#D2FF1F] hover:bg-[#bceb15] text-black font-extrabold text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-[#D2FF1F]/20 active:scale-95"
              >
                <span>Follow on Instagram (@rish4bhsiingh)</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* MiniPlayer: Suspended directly above bottom nav */}
      <MiniPlayer />

      {/* Full Immersive Now Playing View (Matching Reference 1 Middle Mockup) */}
      <NowPlayingView />

      {/* Floating Bottom Navigation Bar (Home, Galaxy, Library, Profile) */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}
