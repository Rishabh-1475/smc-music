"use client";

import React from "react";
import { Home, Disc3, Compass, Library, User } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";

export type NavTab = "home" | "galaxy" | "library" | "profile";

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export default function BottomNav({
  activeTab = "home",
  onSelectTab,
}: BottomNavProps) {
  const { togglePlayerOpen, isPlayerOpen, isPlaying } = usePlayerStore();

  const handlePlayerClick = () => {
    togglePlayerOpen(!isPlayerOpen);
  };

  return (
    <nav
      aria-label="Bottom Navigation Dock"
      className="h-16 fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40 bg-[#0A0A0C]/95 backdrop-blur-lg border-t border-white/10 flex items-center justify-around px-4 select-none"
    >
      {/* 1. Home */}
      <button
        onClick={() => onSelectTab("home")}
        className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
          activeTab === "home"
            ? "w-11 h-11 rounded-full bg-[#D4FF00] text-black shadow-lg shadow-[#D4FF00]/30"
            : "w-11 h-11 rounded-full text-gray-400 hover:text-white hover:bg-white/5"
        }`}
        title="Home"
        aria-label="Home"
      >
        <Home className="w-5 h-5" />
      </button>

      {/* 2. Audio Player / Track Disc */}
      <button
        onClick={handlePlayerClick}
        className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
          isPlayerOpen
            ? "w-11 h-11 rounded-full bg-[#D4FF00] text-black shadow-lg shadow-[#D4FF00]/30"
            : "w-11 h-11 rounded-full text-gray-400 hover:text-white hover:bg-white/5"
        }`}
        title="Now Playing"
        aria-label="Now Playing"
      >
        <Disc3 className={`w-5 h-5 ${isPlaying ? "animate-spin-slow text-white" : ""}`} />
      </button>

      {/* 3. Discover Galaxy */}
      <button
        onClick={() => onSelectTab("galaxy")}
        className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
          activeTab === "galaxy"
            ? "w-11 h-11 rounded-full bg-[#D4FF00] text-black shadow-lg shadow-[#D4FF00]/30"
            : "w-11 h-11 rounded-full text-gray-400 hover:text-white hover:bg-white/5"
        }`}
        title="Galaxy Discovery"
        aria-label="Galaxy Discovery"
      >
        <Compass className="w-5 h-5" />
      </button>

      {/* 4. Library */}
      <button
        onClick={() => onSelectTab("library")}
        className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
          activeTab === "library"
            ? "w-11 h-11 rounded-full bg-[#D4FF00] text-black shadow-lg shadow-[#D4FF00]/30"
            : "w-11 h-11 rounded-full text-gray-400 hover:text-white hover:bg-white/5"
        }`}
        title="My Music"
        aria-label="My Music"
      >
        <Library className="w-5 h-5" />
      </button>

      {/* 5. Profile */}
      <button
        onClick={() => onSelectTab("profile")}
        className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
          activeTab === "profile"
            ? "w-11 h-11 rounded-full bg-[#D4FF00] text-black shadow-lg shadow-[#D4FF00]/30"
            : "w-11 h-11 rounded-full text-gray-400 hover:text-white hover:bg-white/5"
        }`}
        title="Profile"
        aria-label="Profile"
      >
        <User className="w-5 h-5" />
      </button>
    </nav>
  );
}
