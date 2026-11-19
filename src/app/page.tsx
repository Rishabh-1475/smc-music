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
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import Header from "@/components/Header";
import CategoryChips from "@/components/CategoryChips";
import HeroVisualizer from "@/components/HeroVisualizer";
import TopDailyPlaylists from "@/components/TopDailyPlaylists";
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
  const [libraryFilter, setLibraryFilter] = useState<string>("All");
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
    <>
      {/* 1. Mandatory First-Load Onboarding Modal */}
      <OnboardingModal />

      {/* Main Mobile App Pane */}
      <main className="flex-1 w-full pb-36 flex flex-col">
        {/* TAB 1: HOME */}
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
              <div className="w-full px-4 py-4 gpu-layer">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[9px] font-mono font-bold text-[#D4FF00] tracking-widest uppercase">
                      CATALOG RESULTS
                    </p>
                    <h2 className="text-base font-bold text-white mt-0.5">
                      Results for &ldquo;{searchQuery}&rdquo;
                    </h2>
                  </div>
                  {searchResults.length > 0 && (
                    <span className="text-[10px] font-mono text-gray-400">
                      {searchResults.length} tracks
                    </span>
                  )}
                </div>

                {isSearching && (
                  <div className="flex flex-col gap-2.5 animate-pulse">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5"
                      >
                        <div className="w-12 h-12 rounded-full bg-neutral-800 flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 bg-neutral-800 rounded w-3/4" />
                          <div className="h-2.5 bg-neutral-800/60 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isSearching && searchResults.length === 0 && (
                  <div className="text-center py-16 flex flex-col items-center justify-center bg-white/[0.02] border border-white/10 rounded-3xl p-6 mx-2 my-6">
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                      <SearchX className="w-6 h-6 text-[#D4FF00]" />
                    </div>
                    <h3 className="text-sm font-bold text-white">No tracks located</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Try searching for artist names, titles, or phonk.
                    </p>
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    {searchResults.map((song) => {
                      const isCurrent = currentTrack?.id === song.id;
                      return (
                        <div
                          key={song.id}
                          onClick={() => playSong(song, searchResults)}
                          className={`flex items-center justify-between p-2 rounded-2xl transition cursor-pointer select-none ${
                            isCurrent
                              ? "bg-white/10 border border-[#D4FF00]/40 shadow-sm"
                              : "hover:bg-white/5 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/10 shadow-sm">
                              <img
                                src={song.imageUrl || FALLBACK_VINYL}
                                alt={song.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1 pr-2">
                              <h4
                                className={`text-xs font-semibold truncate ${
                                  isCurrent ? "text-[#D4FF00]" : "text-white"
                                }`}
                              >
                                {song.name}
                              </h4>
                              <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                {song.primaryArtists}
                              </p>
                            </div>
                          </div>
                          <div className="w-[30px] h-[30px] rounded-full bg-white/10 hover:bg-[#D4FF00] hover:text-black text-white flex items-center justify-center flex-shrink-0">
                            <Play className="w-3.5 h-3.5 fill-current stroke-current ml-0.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : isFavoritesActive ? (
              /* B. Favorites View */
              <div className="w-full px-4 py-4 gpu-layer">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[9px] font-mono font-bold text-[#D4FF00] tracking-widest uppercase">
                      OFFLINE VAULT
                    </p>
                    <h2 className="text-base font-bold text-white mt-0.5">
                      Vault Favourites
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    {favoriteSongs.length} tracks
                  </span>
                </div>

                {favoriteSongs.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center justify-center bg-white/[0.02] border border-white/10 rounded-3xl p-6 mx-2 my-6">
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                      <Heart className="w-6 h-6 text-[#D4FF00]" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Vault is empty</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Tap the heart icon on any song to save it here.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {favoriteSongs.map((song) => (
                      <div
                        key={song.id}
                        onClick={() => playSong(song, favoriteSongs)}
                        className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/5 transition cursor-pointer select-none"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <img
                            src={song.imageUrl || FALLBACK_VINYL}
                            alt={song.name}
                            className="w-12 h-12 rounded-full object-cover bg-neutral-900 border border-white/10"
                          />
                          <div className="min-w-0 flex-1 pr-2">
                            <h4 className="text-xs font-semibold text-white truncate">
                              {song.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">
                              {song.primaryArtists}
                            </p>
                          </div>
                        </div>
                        <div className="w-[30px] h-[30px] rounded-full bg-white/10 hover:bg-[#D4FF00] hover:text-black text-white flex items-center justify-center flex-shrink-0">
                          <Play className="w-3.5 h-3.5 fill-current stroke-current ml-0.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : isCategoryActive ? (
              /* C. Category Filter View */
              <div className="w-full px-4 py-4 gpu-layer">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-white">
                    {activeCategory} Feed
                  </h2>
                </div>

                {loadingCategory ? (
                  <div className="flex flex-col gap-2.5 animate-pulse">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5"
                      >
                        <div className="w-12 h-12 rounded-full bg-neutral-800" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 bg-neutral-800 rounded w-3/4" />
                          <div className="h-2.5 bg-neutral-800/60 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {categoryFeed.map((song) => (
                      <div
                        key={song.id}
                        onClick={() => playSong(song, categoryFeed)}
                        className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/5 transition cursor-pointer select-none"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <img
                            src={song.imageUrl || FALLBACK_VINYL}
                            alt={song.name}
                            className="w-12 h-12 rounded-full object-cover bg-neutral-900 border border-white/10"
                          />
                          <div className="min-w-0 flex-1 pr-2">
                            <h4 className="text-xs font-semibold text-white truncate">
                              {song.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">
                              {song.primaryArtists}
                            </p>
                          </div>
                        </div>
                        <div className="w-[30px] h-[30px] rounded-full bg-white/10 hover:bg-[#D4FF00] hover:text-black text-white flex items-center justify-center flex-shrink-0">
                          <Play className="w-3.5 h-3.5 fill-current stroke-current ml-0.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* D. Standard Home Page Experience (Reference 1 exact layout) */
              <>
                {/* 1. Curated & Trending Hero Card (Reference 1: h-48 rounded-[28px]) */}
                <HeroVisualizer
                  featuredTrack={shelves.heroTrending[0] || null}
                  onPlay={(track) => playSong(track, shelves.heroTrending)}
                />

                {/* 2. Top Daily Playlists (Reference 1: round art, 30px play button) */}
                <TopDailyPlaylists
                  songs={shelves.quickPicks.length > 0 ? shelves.quickPicks : shelves.heroTrending}
                  onSeeAll={() => handleCategorySelect("Top")}
                />

                {/* 3. Personal Activity Decks */}
                <UserShelves
                  onSelectSearchQuery={(query) => setSearchQuery(query)}
                />
              </>
            )}
          </>
        )}

        {/* TAB 2: INTERACTIVE MUSIC GALAXY / CONSTELLATION NODE GRAPH (Reference 2) */}
        {activeTab === "galaxy" && (
          <div className="w-full px-4 pt-4">
            <GalaxyVisualizer />
          </div>
        )}

        {/* TAB 3: MY MUSIC / LIBRARY (Reference 3 Screen 3) */}
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

            {/* Filter Pills matching Reference 3 Screen 3: "All", "Playlists", "Liked Songs", "Downloads" */}
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

            {/* Track List rows matching Reference 3 Screen 3 */}
            <div className="flex flex-col gap-2.5 mt-3">
              {(libraryFilter === "Liked Songs"
                ? likedSongs
                : libraryFilter === "Playlists"
                ? shelves.speedDial
                : [...likedSongs, ...shelves.heroTrending]
              )
                .slice(0, 8)
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
                        className="w-12 h-12 rounded-full object-cover bg-neutral-900 border border-white/10 shadow-sm"
                      />
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {song.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          By {song.primaryArtists || "Alexiao"} • {((idx * 7 + 8) % 24) + 8} Songs
                        </p>
                      </div>
                    </div>
                    <div className="w-[30px] h-[30px] rounded-full bg-white/10 hover:bg-[#D4FF00] hover:text-black text-white flex items-center justify-center flex-shrink-0">
                      <Play className="w-3.5 h-3.5 fill-current stroke-current ml-0.5" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE (Reference 2 Screen 2 - Oliver Bennet Glass Style) */}
        {activeTab === "profile" && (
          <div className="w-full px-4 pt-6 gpu-layer text-center flex flex-col items-center">
            {/* 3D Glass Profile Card */}
            <div className="w-full bg-[#14141B] border border-white/10 rounded-[28px] p-6 shadow-2xl relative overflow-hidden text-left">
              {/* Soft Ambient Radiance */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4FF00]/10 rounded-full blur-2xl pointer-events-none" />

              {/* Avatar + Handle */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4FF00] shadow-md bg-neutral-900">
                  <img
                    src="/creator.jpg"
                    alt={userName || "Samantha"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => resetOnboarding()}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs text-white font-medium cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                {userName || "Samantha"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                @{userName ? userName.toLowerCase().replace(/\s+/g, "_") : "samantha_music"}
              </p>
              <p className="text-xs text-gray-300 mt-2.5 leading-relaxed">
                Audiophile exploring high-fidelity slow instrumental playlists &amp; visual soundscapes.
              </p>

              {/* Stats Row matching Reference 2 Screen 2 */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 text-center">
                <div>
                  <p className="text-base font-bold text-white">521</p>
                  <p className="text-[10px] text-gray-400">Followers</p>
                </div>
                <div>
                  <p className="text-base font-bold text-white">345</p>
                  <p className="text-[10px] text-gray-400">Following</p>
                </div>
                <div>
                  <p className="text-base font-bold text-white">{likedSongs.length}</p>
                  <p className="text-[10px] text-gray-400">Liked Songs</p>
                </div>
              </div>
            </div>

            {/* Creator Attribution & Instagram Connection */}
            <div className="w-full mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
              <p className="text-xs text-gray-400 mb-2.5">
                Engineered by <strong>Rishabh Singh</strong> • Lead Mobile Architect
              </p>
              <Link
                href="https://www.instagram.com/rish4bhsiingh/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#D4FF00] hover:bg-[#bceb15] text-black font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-md shadow-[#D4FF00]/25 active:scale-95"
              >
                <span>Follow on Instagram (@rish4bhsiingh)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* MiniPlayer: Fixed floating directly above the bottom nav within the 430px frame */}
      <MiniPlayer />

      {/* Now Playing View: Fixed overlay within the 430px frame */}
      <NowPlayingView />

      {/* Floating Bottom Nav: Anchored within the 430px frame */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </>
  );
}
