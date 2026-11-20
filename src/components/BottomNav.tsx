'use client';
import React from 'react';
import { Home as HomeIcon, Search, Compass, Library } from 'lucide-react';

interface Props {
  activeTab: 'home' | 'search' | 'galaxy' | 'library';
  onTabChange: (tab: 'home' | 'search' | 'galaxy' | 'library') => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] md:max-w-md mx-auto h-16 bg-[#121212]/95 backdrop-blur-xl border-t border-[#292929] flex items-center justify-around z-30 px-2 select-none">
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center gap-1 transition ${activeTab === 'home' ? 'text-white font-bold' : 'text-[#B3B3B3] hover:text-white'}`}
      >
        <HomeIcon className="w-5 h-5" />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button
        onClick={() => onTabChange('search')}
        className={`flex flex-col items-center gap-1 transition ${activeTab === 'search' ? 'text-white font-bold' : 'text-[#B3B3B3] hover:text-white'}`}
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px] font-medium">Search</span>
      </button>

      <button
        onClick={() => onTabChange('galaxy')}
        className={`flex flex-col items-center gap-1 transition ${activeTab === 'galaxy' ? 'text-[#1DB954] font-bold' : 'text-[#B3B3B3] hover:text-white'}`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-medium">Galaxy</span>
      </button>

      <button
        onClick={() => onTabChange('library')}
        className={`flex flex-col items-center gap-1 transition ${activeTab === 'library' ? 'text-white font-bold' : 'text-[#B3B3B3] hover:text-white'}`}
      >
        <Library className="w-5 h-5" />
        <span className="text-[10px] font-medium">Your Library</span>
      </button>
    </nav>
  );
};

export default BottomNav;
