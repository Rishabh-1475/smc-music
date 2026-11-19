"use client";

import React from "react";
import { usePlayerStore } from "@/store/playerStore";

interface CategoryChipsProps {
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export const CATEGORY_CHIPS = [
  { label: "All", key: "All" },
  { label: "New Release", key: "New Release" },
  { label: "Trending", key: "Trending" },
  { label: "Top Hits", key: "Top Hits" },
  { label: "Gym Phonk", key: "Gym Phonk" },
  { label: "Punjabi", key: "Punjabi" },
  { label: "Bhojpuri", key: "Bhojpuri" },
  { label: "Favorites", key: "Favorites" },
];

export default function CategoryChips({
  activeCategory = "All",
  onSelectCategory,
}: CategoryChipsProps) {
  const { activeMood, setActiveMood } = usePlayerStore();

  const currentSelection =
    activeCategory && activeCategory !== "" ? activeCategory : activeMood || "All";

  const handleSelect = (chipKey: string) => {
    setActiveMood(chipKey);
    if (onSelectCategory) {
      onSelectCategory(chipKey === "All" ? "" : chipKey);
    }
  };

  return (
    <nav
      aria-label="Category Filters"
      className="w-full overflow-x-auto no-scrollbar scroll-smooth flex items-center space-x-2 py-3 px-4 md:px-8 bg-[#0A0A0C]/90 backdrop-blur-xl sticky top-[69px] z-20 border-b border-white/[0.04]"
    >
      {CATEGORY_CHIPS.map((chip) => {
        const isSelected =
          currentSelection.toLowerCase() === chip.key.toLowerCase() ||
          (chip.key === "All" && (!currentSelection || currentSelection === "" || currentSelection === "All"));

        return (
          <button
            key={chip.key}
            onClick={() => handleSelect(chip.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? "bg-[#D2FF1F] text-black font-extrabold shadow-md shadow-[#D2FF1F]/20 scale-[1.02]"
                : "bg-white/5 text-gray-300 hover:text-white border border-white/10 hover:bg-white/10"
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </nav>
  );
}
