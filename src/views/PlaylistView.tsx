import React from 'react';
import Icon from '../components/ui/Icon';
import Cover from '../components/ui/Cover';
import TrackRow from '../components/ui/TrackRow';
import { EmptyState, SectionHead } from '../components/ui/Section';
import { usePlayerStore } from '@/store/playerStore';

export default function PlaylistView() {
  const { selectedPlaylist, playTrack, navigate } = usePlayerStore();

  if (!selectedPlaylist) {
    return (
      <div className="p-8">
        <EmptyState title="No playlist selected" body="Return to your library to select or create a playlist.">
          <button type="button" className="btn btn--glow mt-4" onClick={() => navigate('library')}>
            Go to Library
          </button>
        </EmptyState>
      </div>
    );
  }

  const tracks = selectedPlaylist.tracks || [];

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <div className="playlist-view space-y-8 animate-fade-in">
      {/* Playlist Header Banner */}
      <section className="relative p-6 md:p-10 rounded-3xl bg-[#111114] border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center sm:items-end gap-6 overflow-hidden">
        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {tracks.length > 0 ? (
            <Cover track={tracks[0]} className="w-full h-full object-cover" />
          ) : (
            <div className="text-4xl text-[var(--ruby)] font-bold">#</div>
          )}
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <span className="text-xs font-mono font-semibold tracking-wider text-[var(--ruby)] uppercase">
            PLAYLIST
          </span>
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight mt-1 mb-2 truncate">
            {selectedPlaylist.name}
          </h1>
          <p className="text-xs text-white/60 font-medium">
            {selectedPlaylist.description || 'Custom Lossless Audio Playlist'} • {tracks.length} tracks
          </p>

          <div className="mt-5 flex items-center justify-center sm:justify-start gap-4">
            <button
              type="button"
              className="btn btn--glow"
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
            >
              <Icon name="play" size={18} /> PLAY ALL
            </button>
          </div>
        </div>
      </section>

      {/* Tracks */}
      {tracks.length === 0 ? (
        <EmptyState
          title="This playlist is empty"
          body="Search for tracks and add them to this playlist."
        >
          <button type="button" className="btn btn--ghost mt-4" onClick={() => navigate('search')}>
            Find Tracks
          </button>
        </EmptyState>
      ) : (
        <section>
          <SectionHead title="Tracks" note={`${tracks.length} SONGS`} />
          <ul className="rows">
            {tracks.map((song, idx) => (
              <TrackRow
                key={`${song.id}-${idx}`}
                track={song}
                list={tracks}
                index={idx}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
