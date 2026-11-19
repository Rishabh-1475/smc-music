"use client";

import React from "react";
import { Home, Compass, Library, User } from "lucide-react";

export type NavTab = "home" | "galaxy" | "library" | "profile";

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export default function BottomNav({
  activeTab = "home",
  onSelectTab,
}: BottomNavProps) {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "home",
      label: "Home",
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: "galaxy",
      label: "Galaxy",
      icon: <Compass className="w-5 h-5" />,
    },
    {
      id: "library",
      label: "Library",
      icon: <Library className="w-5 h-5" />,
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-3.5 left-4 right-4 max-w-sm mx-auto z-40 bg-[#121217]/95 backdrop-blur-2xl border border-white/[0.08] rounded-full px-5 py-2.5 shadow-[0_15px_45px_rgba(0,0,0,0.95)] flex items-center justify-between select-none gpu-layer"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 cursor-pointer px-3 py-1 rounded-full ${
              isActive
                ? "text-[#D2FF1F] scale-105"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <div className={`transition-transform ${isActive ? "scale-110" : ""}`}>
              {item.icon}
            </div>
            <span
              className={`text-[10px] font-semibold tracking-wide ${
                isActive ? "text-[#D2FF1F] font-bold" : "text-neutral-400"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
