"use client";

import React from "react";
import { CategoryMood } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

interface CategoryChipsProps {
  activeCategory?: string;
  onSelectCategory?: (category: CategoryMood | string) => void;
}

const CATEGORIES: CategoryMood[] = [
  "All",
  "Energize",
  "Workout",
  "Relax",
  "Focus",
  "Commute",
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

  const handleSelect = (cat: CategoryMood) => {
    setActiveMood(cat);
    if (onSelectCategory) {
      onSelectCategory(cat === "All" ? "" : cat);
    }
  };

  return (
    <nav
      aria-label="YouTube Music Mood Filters"
      className="w-full overflow-x-auto no-scrollbar scroll-smooth flex items-center space-x-2.5 py-3 px-4 md:px-8 bg-[#030303]/90 backdrop-blur-md sticky top-[57px] z-20 border-b border-white/5"
    >
      {CATEGORIES.map((cat) => {
        const isSelected =
          currentMood.toLowerCase() === cat.toLowerCase() ||
          (cat === "All" && (!currentMood || currentMood === ""));

        return (
          <button
            key={cat}
            onClick={() => handleSelect(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? "bg-white text-black shadow-md shadow-white/10 scale-[1.02]"
                : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-white/10"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </nav>
  );
}
