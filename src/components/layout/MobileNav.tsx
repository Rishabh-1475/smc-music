import React from 'react';
import Icon from '../ui/Icon';
import { usePlayerStore, AppView } from '@/store/playerStore';

export const NAV_ITEMS: { id: AppView; label: string; short: string; icon: string }[] = [
  { id: 'home', label: 'Home / Discover', short: 'Home', icon: 'home' },
  { id: 'search', label: 'Search & Explore', short: 'Search', icon: 'search' },
  { id: 'astra', label: 'ASTRA AI Planet', short: 'ASTRA', icon: 'astra' },
  { id: 'library', label: 'Library & Playlists', short: 'Library', icon: 'library' },
  { id: 'liked', label: 'Liked Songs', short: 'Liked', icon: 'heart' }
];

export default function MobileNav() {
  const { currentView, navigate, setCreatorOpen, isCreatorOpen } = usePlayerStore();

  return (
    <nav className="mobile-nav glass" aria-label="Mobile Navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={currentView === item.id && !isCreatorOpen ? 'is-active' : ''}
          aria-current={currentView === item.id && !isCreatorOpen ? 'page' : undefined}
          onClick={() => navigate(item.id)}
        >
          <Icon name={item.icon} size={20} />
          <span>{item.short}</span>
        </button>
      ))}

      {/* Dedicated Creator / Profile Tab */}
      <button
        type="button"
        className={isCreatorOpen ? 'is-active' : ''}
        onClick={() => setCreatorOpen(true)}
        aria-label="View Creator Dossier — Rishabh Singh"
        title="Creator Dossier"
      >
        <span className="w-[30px] h-[30px] rounded-full overflow-hidden border-[1.5px] border-[#FF2348] shadow-[0_0_10px_rgba(255,35,72,0.5)] shrink-0 bg-neutral-900 inline-flex items-center justify-center">
          <img
            src="/creator.jpg?v=4"
            alt="Rishabh Singh"
            className="w-full h-full object-cover object-[50%_18%]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('creator.jpeg')) {
                target.src = '/creator.jpeg?v=4';
              }
            }}
          />
        </span>
        <span className="text-[10px]">Creator</span>
      </button>
    </nav>
  );
}
