"use client";

import React from "react";

interface CategoryChipsProps {
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

const CATEGORIES = [
  "Energize",
  "Relax",
  "Workout",
  "Focus",
  "Commute",
  "Romance",
  "Party",
];

export default function CategoryChips({
  activeCategory = "",
  onSelectCategory,
}: CategoryChipsProps) {
  return (
    <nav
      aria-label="Moods & Genres"
      className="w-full overflow-x-auto no-scrollbar scroll-smooth flex items-center space-x-2.5 py-3 px-4 md:px-8 bg-black/40 backdrop-blur-sm sticky top-[57px] z-20 border-b border-white/5"
    >
      <button
        onClick={() => onSelectCategory && onSelectCategory("")}
        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
          activeCategory === ""
            ? "bg-white text-black shadow-md shadow-white/10"
            : "bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-white/10"
        }`}
      >
        All
      </button>

      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory && onSelectCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-white text-black font-semibold shadow-md shadow-white/10"
                : "bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-white/10"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </nav>
  );
}
