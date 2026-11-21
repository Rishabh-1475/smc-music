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
  const { currentView, navigate } = usePlayerStore();

  return (
    <nav className="mobile-nav glass" aria-label="Mobile Navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={currentView === item.id ? 'is-active' : ''}
          aria-current={currentView === item.id ? 'page' : undefined}
          onClick={() => navigate(item.id)}
        >
          <Icon name={item.icon} size={20} />
          <span>{item.short}</span>
        </button>
      ))}
    </nav>
  );
}
