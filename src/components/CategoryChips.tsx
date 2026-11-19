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
  { label: "Top", key: "Top" },
  { label: "Gym Phonk", key: "Gym Phonk" },
  { label: "Punjabi", key: "Punjabi" },
  { label: "Bhojpuri", key: "Bhojpuri" },
];

export default function CategoryChips({
  activeCategory = "All",
  onSelectCategory,
}: CategoryChipsProps) {
  const { activeMood, setActiveMood } = usePlayerStore();

  const currentSelection = activeCategory || activeMood || "All";

  const handleSelect = (chipKey: string) => {
    setActiveMood(chipKey);
    if (onSelectCategory) {
      onSelectCategory(chipKey);
    }
  };

  return (
    <nav
      aria-label="Filter Chips"
      className="w-full px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar select-none"
    >
      {CATEGORY_CHIPS.map((chip) => {
        const isSelected =
          currentSelection.toLowerCase() === chip.key.toLowerCase();

        return (
          <button
            key={chip.key}
            onClick={() => handleSelect(chip.key)}
            className={`whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? "px-5 py-2 rounded-full text-xs font-bold bg-[#D4FF00] text-black shadow-md shadow-[#D4FF00]/25"
                : "px-4 py-2 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </nav>
  );
}

export { CategoryChips };
