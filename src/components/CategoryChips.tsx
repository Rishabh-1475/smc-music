"use client";

import React from "react";

interface CategoryChipsProps {
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

const CATEGORIES = [
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
  activeCategory = "",
  onSelectCategory,
}: CategoryChipsProps) {
  const currentSelection = !activeCategory || activeCategory.toLowerCase() === "all" ? "All" : activeCategory;

  return (
    <nav
      aria-label="YouTube Music Mood Filters"
      className="w-full overflow-x-auto no-scrollbar scroll-smooth flex items-center space-x-2.5 py-3 px-4 md:px-8 bg-[#030303]/90 backdrop-blur-md sticky top-[57px] z-20 border-b border-white/5"
    >
      {CATEGORIES.map((cat) => {
        const isSelected =
          cat === "All"
            ? currentSelection === "All"
            : currentSelection.toLowerCase() === cat.toLowerCase();

        return (
          <button
            key={cat}
            onClick={() => {
              if (onSelectCategory) {
                onSelectCategory(cat === "All" ? "" : cat);
              }
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? "bg-white text-black shadow-md shadow-white/10 scale-[1.02]"
                : "bg-[#212121] hover:bg-[#2a2a2a] text-neutral-300 border border-white/10"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </nav>
  );
}
