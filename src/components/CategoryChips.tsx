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
      className="w-full overflow-x-auto no-scrollbar scroll-smooth flex items-center space-x-2.5 py-3 px-4 md:px-8 bg-[#08080A]/95 backdrop-blur-xl sticky top-[65px] z-20 border-b border-white/[0.06]"
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
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? "bg-[#E10600] text-white font-bold shadow-md shadow-[#E10600]/30 scale-[1.02]"
                : "bg-[#121216] text-[#8A8A93] hover:text-white border border-white/[0.08] hover:border-white/20"
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </nav>
  );
}
