"use client";

import React from "react";
import { usePlayerStore } from "@/store/playerStore";

interface CategoryChipsProps {
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

const CATEGORIES = [
  "All",
  "Gym Phonk",
  "Cyber Hype",
  "Midnight Chill",
  "Party",
  "Romance",
];

export default function CategoryChips({
  activeCategory = "All",
  onSelectCategory,
}: CategoryChipsProps) {
  const { activeMood, setActiveMood } = usePlayerStore();

  const currentMood =
    activeCategory && activeCategory !== "" ? activeCategory : activeMood || "All";

  const handleSelect = (cat: string) => {
    setActiveMood(cat);
    if (onSelectCategory) {
      onSelectCategory(cat === "All" ? "" : cat);
    }
  };

  return (
    <nav
      aria-label="RhythmX Mood Filters"
      className="w-full overflow-x-auto no-scrollbar scroll-smooth flex items-center space-x-3 py-3 px-4 md:px-8 bg-black/70 backdrop-blur-xl sticky top-[65px] z-20 border-b border-white/5"
    >
      {CATEGORIES.map((cat) => {
        const isSelected =
          currentMood.toLowerCase() === cat.toLowerCase() ||
          (cat === "All" && (!currentMood || currentMood === "" || currentMood === "All"));

        return (
          <button
            key={cat}
            onClick={() => handleSelect(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? "bg-gradient-to-r from-[#00FF87] to-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,255,135,0.4)] scale-[1.02]"
                : "bg-[#141418] hover:bg-[#1E1E24] text-neutral-300 border border-white/10 hover:border-white/20"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </nav>
  );
}
