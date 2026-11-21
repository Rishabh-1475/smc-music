import React from 'react';
import Icon from '../components/ui/Icon';
import TrackRow, { fmtTime } from '../components/ui/TrackRow';
import { EmptyState, SectionHead } from '../components/ui/Section';
import { usePlayerStore } from '@/store/playerStore';

export default function LikedSongsView() {
  const { likedSongs, playTrack, navigate } = usePlayerStore();

  const totalSecs = likedSongs.reduce((acc, s) => acc + (Number(s.duration) || 210), 0);
  const totalMins = Math.round(totalSecs / 60);

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playTrack(likedSongs[0], { source: 'liked', queue: likedSongs, sourceLabel: 'Liked Songs' });
    }
  };

  return (
    <div className="liked-view space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <section className="relative p-6 md:p-10 rounded-3xl bg-gradient-to-br from-[var(--crimson)]/30 via-[#151518] to-[#080809] border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center sm:items-end gap-6 overflow-hidden">
        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl bg-gradient-to-br from-[var(--crimson)] to-[var(--ruby)] shadow-[0_10px_40px_rgba(255,35,72,0.4)] flex items-center justify-center flex-shrink-0">
          <Icon name="heart" size={64} className="icon--filled text-white" />
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <span className="text-xs font-mono font-semibold tracking-wider text-[var(--ruby)] uppercase">
            PLAYLIST
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-1 mb-2">
            Liked Songs
          </h1>
          <p className="text-xs text-white/60 font-medium">
            Saved favorites • {likedSongs.length} songs • ~{totalMins} minutes
          </p>

          <div className="mt-5 flex items-center justify-center sm:justify-start gap-4">
            <button
              type="button"
              className="btn btn--glow"
              onClick={handlePlayAll}
              disabled={likedSongs.length === 0}
            >
              <Icon name="play" size={18} /> PLAY ALL
            </button>
          </div>
        </div>
      </section>

      {/* Tracks Table */}
      {likedSongs.length === 0 ? (
        <EmptyState
          title="No liked songs yet"
          body="Tap the heart icon on any 320kbps track to save it here for instant playback."
        >
          <button
            type="button"
            className="btn btn--ghost mt-4"
            onClick={() => navigate('home')}
          >
            Explore Music
          </button>
        </EmptyState>
      ) : (
        <section>
          <SectionHead title="Saved Tracks" note={`${likedSongs.length} TRACKS`} />
          <ul className="rows">
            {likedSongs.map((song, idx) => (
              <TrackRow
                key={`${song.id}-${idx}`}
                track={song}
                list={likedSongs}
                source="liked"
                index={idx}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
