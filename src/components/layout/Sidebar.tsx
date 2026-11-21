import React, { useState } from 'react';
import Icon from '../ui/Icon';
import Cover from '../ui/Cover';
import MiniOrb from '../ui/MiniOrb';
import { usePlayerStore, AppView } from '@/store/playerStore';

export const SIDEBAR_NAV: { id: AppView; label: string; short: string; icon: string }[] = [
  { id: 'home', label: 'Home / Discover', short: 'Home', icon: 'home' },
  { id: 'search', label: 'Search & Explore', short: 'Search', icon: 'search' },
  { id: 'astra', label: 'ASTRA AI Planet', short: 'ASTRA', icon: 'astra' },
  { id: 'library', label: 'Your Library', short: 'Library', icon: 'library' },
  { id: 'liked', label: 'Liked Songs', short: 'Liked', icon: 'heart' }
];

export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <span className="brand__mark" style={{ '--s': `${size}px` } as React.CSSProperties} aria-hidden="true">
      <span>R</span>
    </span>
  );
}

export default function Sidebar() {
  const {
    currentView,
    navigate,
    likedSongs,
    recents,
    playTrack,
    userPlaylists,
    autoPlaylists,
    setCreatorOpen,
    setCreatePlaylistOpen
  } = usePlayerStore();

  const [avatarBroken, setAvatarBroken] = useState(false);
  const likedCount = likedSongs.length;

  return (
    <aside className="sidebar glass" aria-label="Sidebar">
      {/* Brand Header */}
      <div
        className="brand cursor-pointer"
        onClick={() => navigate('home')}
        title="RythemX — ASTRA 3D Spatial Audio"
      >
        <BrandMark />
        <div className="brand__text">
          <strong>
            RYTHEM <em>//</em> X
          </strong>
          <small>ASTRA 3D ENGINE</small>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="nav" aria-label="Primary Navigation">
        {SIDEBAR_NAV.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav__item ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} size={20} />
              <span className="nav__label">{item.label}</span>
              {item.id === 'astra' && <MiniOrb mode="idle" size={14} />}
              {item.id === 'liked' && likedCount > 0 && (
                <span className="nav__badge">{likedCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Smart Auto-Mixes */}
      {autoPlaylists.length > 0 && (
        <section className="recent !flex-none" aria-label="Smart Auto-Mixes">
          <div className="flex items-center justify-between mb-1.5 px-2">
            <h2 className="recent__title !p-0 !m-0 flex items-center gap-1.5 text-[11px] text-[var(--ruby)] font-bold">
              <Icon name="bolt" size={12} /> Auto-Mixes
            </h2>
            <span className="text-[9px] font-mono text-white/40">From likes</span>
          </div>
          <ul className="space-y-1">
            {autoPlaylists.slice(0, 3).map((mix) => (
              <li key={mix.id}>
                <button
                  type="button"
                  className="w-full text-left py-1 px-2 rounded flex items-center gap-2 hover:bg-white/[0.04] transition-colors"
                  onClick={() => navigate('playlist', { playlist: mix })}
                >
                  <span className="w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                    <img src={mix.coverArt} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </span>
                  <span className="text-xs text-white/90 truncate font-medium">
                    {mix.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* User Playlists */}
      <section className="recent" aria-label="Playlists">
        <div className="flex items-center justify-between mb-2">
          <h2 className="recent__title !mb-0">Playlists</h2>
          <button
            type="button"
            className="text-xs text-[var(--crimson)] hover:text-[var(--ruby)] font-medium flex items-center gap-1 transition-colors"
            onClick={() => setCreatePlaylistOpen(true)}
            title="Create new playlist"
          >
            <Icon name="plus" size={14} /> New
          </button>
        </div>
        {userPlaylists.length === 0 ? (
          <p className="recent__empty">Create your first playlist above.</p>
        ) : (
          <ul className="space-y-1">
            {userPlaylists.slice(0, 3).map((pl) => (
              <li key={pl.id}>
                <button
                  type="button"
                  className="w-full text-left py-1.5 px-2 rounded flex items-center gap-2 hover:bg-white/[0.04] transition-colors"
                  onClick={() => navigate('playlist', { playlist: pl })}
                >
                  <span className="w-5 h-5 rounded bg-white/[0.08] flex items-center justify-center text-[10px] text-[var(--ruby)]">
                    #
                  </span>
                  <span className="text-xs text-white/80 truncate font-medium">
                    {pl.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recently Played */}
      <section className="recent" aria-label="Recently played">
        <h2 className="recent__title">Recently played</h2>
        {recents.length === 0 ? (
          <p className="recent__empty">Tracks you play show up here.</p>
        ) : (
          <ul>
            {recents.slice(0, 4).map((t) => {
              const title = t.name || t.title || 'Lossless Audio';
              const artist = t.primaryArtists || (t as any).artist || 'RhythmX';
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => playTrack(t, recents)}
                    aria-label={`Play ${title} by ${artist}`}
                  >
                    <Cover track={t} className="cover--tiny" />
                    <span>
                      <b>{title}</b>
                      <small>{artist}</small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Creator Dossier Card */}
      <div
        className="dossier cursor-pointer hover:border-[var(--ruby)]/40 transition-all duration-300 group"
        onClick={() => setCreatorOpen(true)}
        title="View Creator Dossier — Rishabh Singh"
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[var(--ruby)]/40 flex-shrink-0 bg-neutral-900">
          {!avatarBroken ? (
            <img
              src="/creator.jpeg"
              alt="Rishabh Singh"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
              onError={() => {
                // try fallback to creator.jpg
                const img = new Image();
                img.src = '/creator.jpg';
                img.onload = () => {
                  // if jpg exists, let it be
                };
                img.onerror = () => setAvatarBroken(true);
              }}
            />
          ) : (
            <span className="dossier__avatar" aria-hidden="true">
              RS
            </span>
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#111114]" />
        </div>
        <div className="dossier__text">
          <strong className="group-hover:text-[var(--ruby)] transition-colors">
            Rishabh Singh
          </strong>
          <small>Lead Systems Architect</small>
        </div>
      </div>
    </aside>
  );
}
