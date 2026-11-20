'use client';
import React from 'react';
import { Home, Compass, Library, User } from 'lucide-react';

export type NavTab = 'home' | 'galaxy' | 'library' | 'profile';

export interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Songs', icon: Home },
    { id: 'galaxy' as NavTab, label: 'Galaxy', icon: Compass },
    { id: 'library' as NavTab, label: 'Library', icon: Library },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Philomela Navigation Dock"
      className="h-16 fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40 bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-4 select-none"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={tab.label}
          >
            <Icon
              className={`w-5 h-5 transition-transform duration-200 ${
                isActive ? 'scale-110 stroke-[2.2] text-white' : 'stroke-[1.6]'
              }`}
            />
            <span
              className={`text-[9px] tracking-widest uppercase font-mono transition-colors ${
                isActive ? 'text-white font-bold' : 'text-zinc-500'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
