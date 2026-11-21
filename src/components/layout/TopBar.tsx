import React, { useRef, useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import MiniOrb from '../ui/MiniOrb';
import { BrandMark } from './Sidebar';
import { usePlayerStore } from '@/store/playerStore';
import { astraVoice, AstraMode } from '@/services/astraVoice';

export const CATEGORIES = [
  { id: 'all', label: 'All Hits' },
  { id: 'music', label: 'Bollywood 2026' },
  { id: 'punjabi', label: 'Punjabi Hits' },
  { id: 'bhojpuri', label: 'Bhojpuri Dhamaka' },
  { id: 'phonk', label: 'Gym Phonk' },
  { id: 'podcasts', label: 'Top Podcasts' }
];

export default function TopBar() {
  const {
    currentView,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setCategory,
    navigate,
    addToast
  } = usePlayerStore();

  const [astraMode, setAstraMode] = useState<AstraMode>('idle');
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceTimer = useRef<any>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchQuery(val);
    }, 280);
  };

  const handleVoiceMic = () => {
    if (astraMode === 'listening') {
      astraVoice.stopListening();
    } else {
      navigate('astra');
      astraVoice.setCallbacks({
        onModeChange: (m) => setAstraMode(m),
        onTranscript: (t) => {},
        onCommand: (res) => {
          if (res.query) setSearchQuery(res.query);
        },
        onError: (err) => addToast(err, 'error')
      });
      astraVoice.startListening();
    }
  };

  return (
    <header className="topbar">
      <div className="topbar__row">
        {/* Mobile Brand Button */}
        <button
          type="button"
          className="topbar__brand"
          onClick={() => navigate('home')}
          aria-label="RythemX Home"
        >
          <BrandMark size={36} />
        </button>

        {/* Global Search Bar */}
        <form
          className="search glass"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (localQuery.trim()) setSearchQuery(localQuery);
          }}
        >
          <Icon name="search" size={18} className="search__icon" />
          <input
            id="global-search"
            type="search"
            value={localQuery}
            onChange={onSearchChange}
            placeholder="Search tracks, artists, Bollywood, Punjabi..."
            autoComplete="off"
            spellCheck="false"
            aria-label="Search"
          />
          {localQuery && (
            <button
              type="button"
              className="icon-btn icon-btn--bare"
              onClick={() => {
                setLocalQuery('');
                setSearchQuery('');
              }}
              aria-label="Clear search"
            >
              <Icon name="x" size={16} />
            </button>
          )}
          <button
            type="button"
            className={`search__mic ${astraMode === 'listening' ? 'is-listening' : ''}`}
            onClick={handleVoiceMic}
            aria-pressed={astraMode === 'listening'}
            aria-label={astraMode === 'listening' ? 'Listening...' : 'Voice Search with ASTRA'}
            title="Search with ASTRA Voice"
          >
            <Icon name="mic" size={18} />
          </button>
        </form>

        {/* ASTRA 3D Planet Pill */}
        <button
          type="button"
          className={`astra-btn ${currentView === 'astra' ? 'is-open' : ''}`}
          data-mode={astraMode}
          onClick={() => navigate('astra')}
          aria-label="Open ASTRA 3D AI Planet"
          title="Open ASTRA 3D AI Planet"
        >
          <MiniOrb mode={astraMode} size={24} />
          <span className="astra-btn__text">
            <b>ASTRA</b>
            <small>{astraMode === 'idle' ? 'ONLINE' : astraMode.toUpperCase()}</small>
          </span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="pills" role="group" aria-label="Categories">
        {CATEGORIES.map((c) => {
          const isActive = currentView === 'home' && activeCategory === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className={`pill ${isActive ? 'is-active' : ''}`}
              aria-pressed={isActive}
              onClick={() => setCategory(c.id)}
            >
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
