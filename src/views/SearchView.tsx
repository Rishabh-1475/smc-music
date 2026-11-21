import React, { useEffect, useState } from 'react';
import Cover from '../components/ui/Cover';
import Icon from '../components/ui/Icon';
import TrackRow from '../components/ui/TrackRow';
import { RowSkeletons, EmptyState, SectionHead } from '../components/ui/Section';
import { fetchSongsByQuery } from '@/services/api';
import { Song } from '@/types/music';
import { usePlayerStore } from '@/store/playerStore';

const BROWSE_GENRES = [
  { name: 'Bollywood Hits', query: 'Bollywood Hits 2026', grad: 'from-rose-600 to-amber-700' },
  { name: 'Punjabi Virsa', query: 'Latest Punjabi Hits 2026', grad: 'from-amber-600 to-red-800' },
  { name: 'Bhojpuri Dhamaka', query: 'Bhojpuri Top Dhamaka 2026', grad: 'from-orange-600 to-yellow-700' },
  { name: 'Gym Phonk', query: 'Drift Phonk Workout', grad: 'from-purple-900 to-red-900' },
  { name: 'Arijit Singh Soul', query: 'Arijit Singh Romantic Hits', grad: 'from-blue-700 to-indigo-950' },
  { name: 'Desi Hip-Hop', query: 'Desi Hip Hop Underground', grad: 'from-neutral-800 to-zinc-950' },
  { name: 'Sidhu Moose Wala', query: 'Sidhu Moose Wala All Hits', grad: 'from-red-950 to-neutral-900' },
  { name: 'Tamil Top 50', query: 'Tamil Top Hits 2026', grad: 'from-teal-800 to-emerald-950' },
  { name: 'Telugu Masala', query: 'Telugu Blockbuster Hits 2026', grad: 'from-yellow-700 to-orange-900' },
  { name: 'Chill Lofi Vibes', query: 'Midnight Chill Lofi Beats', grad: 'from-sky-800 to-indigo-900' },
  { name: 'Sufi & Ghazal', query: 'Best of Sufi and Ghazals', grad: 'from-emerald-800 to-teal-950' },
  { name: 'Haryanvi Ragni', query: 'Haryanvi Top Hits 2026', grad: 'from-amber-800 to-orange-950' },
  { name: 'Karan Aujla', query: 'Karan Aujla Latest Songs', grad: 'from-zinc-800 to-stone-900' },
  { name: 'Global Top Viral', query: 'Top Global Viral Songs', grad: 'from-fuchsia-800 to-purple-950' },
  { name: 'Acoustic Unplugged', query: 'Indian Acoustic Unplugged', grad: 'from-stone-700 to-neutral-900' },
  { name: 'Devotional Bhakti', query: 'Devotional Bhakti Songs', grad: 'from-orange-700 to-amber-900' }
];

export default function SearchView() {
  const { searchQuery, setSearchQuery, playTrack } = usePlayerStore();
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setError(false);

    fetchSongsByQuery(searchQuery)
      .then((songs) => {
        if (!alive) return;
        setResults(songs || []);
      })
      .catch(() => {
        if (!alive) return;
        setError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [searchQuery]);

  const topSong = results[0];
  const listSongs = results.slice(1);

  return (
    <div className="search-view space-y-8 animate-fade-in">
      {/* Active Search Results */}
      {searchQuery.trim() ? (
        <>
          {loading ? (
            <div>
              <SectionHead title={`Searching for "${searchQuery}"`} note="QUERYING 320KBPS CATALOG" />
              <RowSkeletons count={8} />
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              title={`No tracks found for "${searchQuery}"`}
              body="Try searching by artist name (e.g. Arijit Singh, Sidhu Moose Wala) or movie title."
            />
          ) : (
            <div className="space-y-8">
              {/* Top Result Split Card */}
              {topSong && (
                <section>
                  <SectionHead title="Top Result" note="320 KBPS LOSSLESS" />
                  <div
                    onClick={() => playTrack(topSong, results)}
                    className="group relative p-6 rounded-2xl bg-[#111114] border border-white/10 hover:border-[var(--ruby)]/40 shadow-xl cursor-pointer transition-all duration-300 flex flex-col md:flex-row items-center md:items-start gap-6 overflow-hidden"
                  >
                    <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
                      <Cover track={topSong} className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="w-14 h-14 rounded-full bg-[var(--ruby)] text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                          <Icon name="play" size={24} />
                        </span>
                      </span>
                    </div>

                    <div className="flex-1 text-center md:text-left min-w-0">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--ruby)]/15 text-[var(--ruby)] border border-[var(--ruby)]/30 mb-2">
                        BEST MATCH • 320 KBPS
                      </span>
                      <h2 className="text-2xl font-bold text-white group-hover:text-[var(--ruby)] transition-colors truncate">
                        {topSong.name || topSong.title}
                      </h2>
                      <p className="text-sm text-white/70 font-medium truncate mt-1">
                        {topSong.primaryArtists}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {topSong.album} • {topSong.year || '2026'}
                      </p>

                      <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
                        <button
                          type="button"
                          className="btn btn--glow"
                          onClick={(e) => {
                            e.stopPropagation();
                            playTrack(topSong, results);
                          }}
                        >
                          <Icon name="play" size={16} /> STREAM MASTER
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Matching Songs List */}
              {listSongs.length > 0 && (
                <section>
                  <SectionHead title="Matching Songs" note={`${results.length} TRACKS FOUND`} />
                  <ul className="rows">
                    {listSongs.map((t, idx) => (
                      <TrackRow key={`${t.id}-${idx}`} track={t} list={results} index={idx} />
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </>
      ) : (
        /* Browse All Genres Grid */
        <section>
          <SectionHead title="Browse All Genres" note="DISCOVER ACROSS INDIA" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {BROWSE_GENRES.map((g) => (
              <div
                key={g.name}
                onClick={() => setSearchQuery(g.query)}
                className={`relative h-28 md:h-32 rounded-2xl p-4 bg-gradient-to-br ${g.grad} border border-white/10 shadow-lg cursor-pointer hover:scale-[1.02] hover:border-white/30 transition-all duration-300 flex flex-col justify-between overflow-hidden group`}
              >
                <span className="text-base md:text-lg font-bold text-white tracking-tight drop-shadow">
                  {g.name}
                </span>
                <span className="text-[11px] font-mono text-white/60 group-hover:text-white uppercase tracking-wider transition-colors flex items-center gap-1">
                  Explore <Icon name="play" size={12} />
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
