import React, { useEffect, useState } from 'react';
import Icon from '../components/ui/Icon';
import TrackRow from '../components/ui/TrackRow';
import { RowSkeletons, EmptyState, SectionHead } from '../components/ui/Section';
import { fetchSongsByQuery } from '@/services/api';
import { Song } from '@/types/music';
import { usePlayerStore } from '@/store/playerStore';

export default function ArtistView() {
  const { selectedArtist, playTrack, navigate } = usePlayerStore();
  const [tracks, setTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const artistName = selectedArtist || 'Arijit Singh';

  useEffect(() => {
    let alive = true;
    setLoading(true);

    fetchSongsByQuery(`${artistName} Hits`)
      .then((songs) => {
        if (!alive) return;
        setTracks(songs || []);
      })
      .catch(() => {
        if (alive) setTracks([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [artistName]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], { source: 'artist', queue: tracks, sourceLabel: `${artistName} Radio` });
    }
  };

  return (
    <div className="artist-view space-y-8 animate-fade-in">
      {/* Artist Hero Banner */}
      <section className="relative p-6 md:p-10 rounded-3xl bg-gradient-to-r from-[#151518] to-[#080809] border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center sm:items-end gap-6 overflow-hidden">
        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-neutral-900 border-2 border-[var(--ruby)]/40 shadow-[0_0_30px_rgba(255,35,72,0.3)] flex items-center justify-center flex-shrink-0 overflow-hidden">
          {tracks.length > 0 && tracks[0].imageUrl ? (
            <img
              src={tracks[0].imageUrl}
              alt={artistName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-4xl text-[var(--ruby)] font-bold">
              {artistName.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <span className="text-xs font-mono font-semibold tracking-wider text-[var(--ruby)] uppercase flex items-center justify-center sm:justify-start gap-1.5">
            <Icon name="check" size={14} /> VERIFIED ARTIST
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-1 mb-2 truncate">
            {artistName}
          </h1>
          <p className="text-xs text-white/60 font-medium">
            320kbps Master Discography • {tracks.length} releases available
          </p>

          <div className="mt-5 flex items-center justify-center sm:justify-start gap-4">
            <button
              type="button"
              className="btn btn--glow"
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
            >
              <Icon name="play" size={18} /> PLAY MASTER CATALOG
            </button>
          </div>
        </div>
      </section>

      {/* Top Releases */}
      <section>
        <SectionHead title="Top Releases" note="320 KBPS MASTER QUALITY" />
        {loading ? (
          <RowSkeletons count={8} />
        ) : tracks.length === 0 ? (
          <EmptyState
            title="No songs found"
            body={`Could not retrieve songs for ${artistName}.`}
          />
        ) : (
          <ul className="rows">
            {tracks.map((song, idx) => (
              <TrackRow
                key={`${song.id}-${idx}`}
                track={song}
                list={tracks}
                source="artist"
                index={idx}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
