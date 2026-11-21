'use client';
import React from 'react';
import { Home as HomeIcon, Compass, Library, User } from 'lucide-react';

export type NavTab = 'home' | 'galaxy' | 'library' | 'profile';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md md:max-w-5xl mx-auto h-16 bg-[#070709]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around z-30 px-2 select-none">
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center gap-1 transition cursor-pointer ${
          activeTab === 'home' ? 'text-[#E11D48] font-bold' : 'text-[#94A3B8] hover:text-white'
        }`}
      >
        <HomeIcon className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-tight">Home</span>
      </button>

      <button
        onClick={() => onTabChange('galaxy')}
        className={`flex flex-col items-center gap-1 transition cursor-pointer ${
          activeTab === 'galaxy' ? 'text-[#E11D48] font-bold' : 'text-[#94A3B8] hover:text-white'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-tight">Galaxy</span>
      </button>

      <button
        onClick={() => onTabChange('library')}
        className={`flex flex-col items-center gap-1 transition cursor-pointer ${
          activeTab === 'library' ? 'text-[#E11D48] font-bold' : 'text-[#94A3B8] hover:text-white'
        }`}
      >
        <Library className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-tight">Library</span>
      </button>

      <button
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center gap-1 transition cursor-pointer ${
          activeTab === 'profile' ? 'text-[#E11D48] font-bold' : 'text-[#94A3B8] hover:text-white'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-tight">Profile</span>
      </button>
    </nav>
  );
};

export default BottomNav;
