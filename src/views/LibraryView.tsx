import React from 'react';
import Icon from '../components/ui/Icon';
import Cover from '../components/ui/Cover';
import TrackRow from '../components/ui/TrackRow';
import { SectionHead } from '../components/ui/Section';
import { usePlayerStore } from '@/store/playerStore';

export default function LibraryView() {
  const {
    likedSongs,
    recents,
    userPlaylists,
    navigate,
    setCreatePlaylistOpen
  } = usePlayerStore();

  return (
    <div className="library-view space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Your Library</h1>
          <p className="text-xs text-white/50 mt-1">Playlists, saved tracks and history</p>
        </div>
        <button
          type="button"
          className="btn btn--glow"
          onClick={() => setCreatePlaylistOpen(true)}
        >
          <Icon name="plus" size={16} /> New Playlist
        </button>
      </div>

      {/* Playlists Grid */}
      <section>
        <SectionHead title="Playlists" note={`${userPlaylists.length + 1} COLLECTIONS`} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Liked Songs Special Tile */}
          <div
            onClick={() => navigate('liked')}
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-[var(--crimson)]/50 to-[var(--ruby)]/30 border border-[var(--ruby)]/30 hover:border-[var(--ruby)] shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between h-44 overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Icon name="heart" size={24} className="icon--filled text-[var(--ruby)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white group-hover:text-[var(--ruby)] transition-colors">
                Liked Songs
              </h2>
              <p className="text-xs text-white/70 mt-0.5">
                {likedSongs.length} tracks
              </p>
            </div>
          </div>

          {/* User Custom Playlists */}
          {userPlaylists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => navigate('playlist', { playlist: pl })}
              className="group relative p-4 rounded-2xl bg-[#111114] border border-white/10 hover:border-[var(--ruby)]/40 shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between h-44 overflow-hidden"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                {pl.tracks.length > 0 ? (
                  <Cover track={pl.tracks[0]} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl text-[var(--ruby)] font-mono">
                    #
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-white group-hover:text-[var(--ruby)] transition-colors truncate">
                  {pl.name}
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  {pl.tracks.length} tracks
                </p>
              </div>
            </div>
          ))}

          {/* Create New Playlist Card */}
          <div
            onClick={() => setCreatePlaylistOpen(true)}
            className="border-2 border-dashed border-white/10 hover:border-[var(--ruby)]/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-44 group"
          >
            <span className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-[var(--ruby)]/20 flex items-center justify-center text-white/60 group-hover:text-[var(--ruby)] transition-colors mb-2">
              <Icon name="plus" size={20} />
            </span>
            <span className="text-sm font-semibold text-white/80 group-hover:text-white">
              Create Playlist
            </span>
          </div>
        </div>
      </section>

      {/* Recently Played History */}
      {recents.length > 0 && (
        <section>
          <SectionHead title="Recently Played History" note={`${recents.length} TRACKS`} />
          <ul className="rows">
            {recents.slice(0, 15).map((song, idx) => (
              <TrackRow
                key={`${song.id}-${idx}`}
                track={song}
                list={recents}
                index={idx}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
