"use client";

import React from "react";
import { usePlayerStore } from "@/store/playerStore";

interface CategoryChipsProps {
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export const CATEGORY_CHIPS = [
  { label: "All", key: "All" },
  { label: "🏋️ Gym Phonk", key: "Gym Phonk" },
  { label: "⚡ Cyber Hype", key: "Cyber Hype" },
  { label: "🌙 Midnight Chill", key: "Midnight Chill" },
  { label: "🔥 Punjabi Hype", key: "Punjabi Hype" },
  { label: "❤️ Favorites", key: "Favorites" },
];

export default function CategoryChips({
  activeCategory = "All",
  onSelectCategory,
}: CategoryChipsProps) {
  const { activeMood, setActiveMood } = usePlayerStore();

  const currentSelection =
    activeCategory && activeCategory !== "" ? activeCategory : activeMood || "All";

  const handleSelect = (chip: { label: string; key: string }) => {
    setActiveMood(chip.key);
    if (onSelectCategory) {
      onSelectCategory(chip.key === "All" ? "" : chip.key);
    }
  };

  return (
    <nav
      aria-label="RhythmX Category Filters"
      className="w-full overflow-x-auto no-scrollbar scroll-smooth flex items-center space-x-3 py-3 px-4 md:px-8 bg-black/60 backdrop-blur-xl sticky top-[65px] z-20 border-b border-white/5"
    >
      {CATEGORY_CHIPS.map((chip) => {
        const isSelected =
          currentSelection.toLowerCase() === chip.key.toLowerCase() ||
          currentSelection.toLowerCase() === chip.label.toLowerCase() ||
          (chip.key === "All" && (!currentSelection || currentSelection === "" || currentSelection === "All"));

        return (
          <button
            key={chip.key}
            onClick={() => handleSelect(chip)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
              isSelected
                ? "bg-gradient-to-r from-[#00FF87] to-[#10B981] text-black font-semibold shadow-[0_0_18px_rgba(0,255,135,0.4)] scale-[1.03]"
                : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5 hover:border-white/15"
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </nav>
  );
}
