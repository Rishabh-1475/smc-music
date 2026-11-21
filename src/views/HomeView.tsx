import React, { useEffect, useState } from 'react';
import Hero from './Hero';
import MusicCard from '../components/ui/MusicCard';
import Icon from '../components/ui/Icon';
import Cover from '../components/ui/Cover';
import { CardSkeletons, EmptyState, SectionHead } from '../components/ui/Section';
import { fetchSongsByQuery } from '@/services/api';
import { Song } from '@/types/music';
import { usePlayerStore } from '@/store/playerStore';
import { tasteEngine, AutoPlaylist } from '@/services/tasteEngine';
import curatedData from '@/services/curatedTracks.json';

const POPULAR_ARTISTS = [
  { name: 'Arijit Singh', img: 'https://c.saavncdn.com/artists/Arijit_Singh_002_20230323062147_500x500.jpg' },
  { name: 'Sidhu Moose Wala', img: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_004_20231019080755_500x500.jpg' },
  { name: 'Karan Aujla', img: 'https://c.saavncdn.com/artists/Karan_Aujla_005_20240103102345_500x500.jpg' },
  { name: 'Pritam', img: 'https://c.saavncdn.com/artists/Pritam_Chakraborty_004_20231114065406_500x500.jpg' },
  { name: 'Anirudh Ravichander', img: 'https://c.saavncdn.com/artists/Anirudh_Ravichander_004_20231114065337_500x500.jpg' },
  { name: 'Diljit Dosanjh', img: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_004_20231019080649_500x500.jpg' },
  { name: 'Yo Yo Honey Singh', img: 'https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_002_20221130053256_500x500.jpg' },
  { name: 'Shreya Ghoshal', img: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_004_20231114065434_500x500.jpg' }
];

export default function HomeView() {
  const { activeCategory, playTrack, navigate, autoPlaylists } = usePlayerStore();
  const [loading, setLoading] = useState(true);
  const [heroTrack, setHeroTrack] = useState<Song | null>(null);
  const [madeForYou, setMadeForYou] = useState<Song[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [quickPicks, setQuickPicks] = useState<Song[]>([]);
  const [becauseYouLiked, setBecauseYouLiked] = useState<{ title: string; subtitle: string; tracks: Song[] } | null>(null);
  const [replayFavorites, setReplayFavorites] = useState<Song[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const getQueryForCategory = (cat: string) => {
      switch (cat) {
        case 'music':
          return 'Trending Bollywood Hits 2026';
        case 'punjabi':
          return 'Latest Punjabi Hits 2026';
        case 'bhojpuri':
          return 'Bhojpuri Top Dhamaka 2026';
        case 'phonk':
          return 'Drift Phonk Workout';
        case 'podcasts':
          return 'Technology Science Podcasts';
        default:
          return 'Top Viral Hits 2026';
      }
    };

    const query = getQueryForCategory(activeCategory);

    // Fetch primary feed
    fetchSongsByQuery(query)
      .then((songs) => {
        if (!alive) return;
        if (songs && songs.length >= 6) {
          setHeroTrack(songs[0]);
          setQuickPicks(songs.slice(1, 7));
          setMadeForYou(songs.slice(7, 13));
          setTrending(songs.slice(13, 25));
        } else {
          loadCuratedFallback();
        }
      })
      .catch(() => {
        if (alive) loadCuratedFallback();
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    // Fetch personalized taste shelves in background
    tasteEngine.getPersonalizedShelves().then((shelves) => {
      if (!alive) return;
      setBecauseYouLiked(shelves.becauseYouLiked);
      setReplayFavorites(shelves.replayFavorites);
    }).catch(() => {});

    return () => {
      alive = false;
    };
  }, [activeCategory]);

  const loadCuratedFallback = () => {
    const raw = (curatedData as any)?.quickPicks || [];
    const formatted: Song[] = raw.map((item: any) => ({
      id: item.id,
      name: item.title || item.name,
      title: item.title || item.name,
      primaryArtists: item.primaryArtists || 'Various Artists',
      album: item.album || 'Single',
      duration: Number(item.duration) || 210,
      imageUrl: item.imageUrl,
      streamUrl: item.audioUrl || (item.downloadUrl && item.downloadUrl[0]?.url) || '',
      streamUrls: item.downloadUrl ? item.downloadUrl.map((d: any) => d.url) : [item.audioUrl],
      language: 'hindi'
    }));

    if (formatted.length > 0) {
      setHeroTrack(formatted[0]);
      setQuickPicks(formatted.slice(1, 7));
      setMadeForYou(formatted.slice(7, 13));
      setTrending(formatted.slice(13));
    }
  };

  if (loading && !heroTrack) {
    return (
      <div className="home">
        <div className="hero hero--skeleton skeleton" aria-hidden="true" />
        <SectionHead title="Quick Picks" note="320 KBPS MASTER" />
        <CardSkeletons count={6} />
        <SectionHead title="Trending Now" />
        <CardSkeletons count={6} />
      </div>
    );
  }

  if (!heroTrack) {
    return (
      <div className="home">
        <EmptyState
          title="Audio catalog loading"
          body="Connecting to JioSaavn 320kbps Lossless audio mirrors..."
        />
      </div>
    );
  }

  const allQueue = [heroTrack, ...quickPicks, ...madeForYou, ...trending];

  return (
    <div className="home space-y-8 animate-fade-in">
      {/* Layered 3D Hero */}
      <Hero track={heroTrack} list={allQueue} />

      {/* Smart Auto-Mixes Shelf (Made from User Likes) */}
      {autoPlaylists.length > 0 && (
        <section aria-label="Smart Auto-Mixes">
          <SectionHead
            title="Your Auto-Mixes"
            note="AUTO-CURATED FROM YOUR LIKES"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {autoPlaylists.map((mix) => (
              <div
                key={mix.id}
                onClick={() => navigate('playlist', { playlist: mix })}
                className="group relative p-4 rounded-2xl bg-gradient-to-br from-[#15151b] to-[#0c0c0e] border border-white/10 hover:border-[var(--ruby)]/50 shadow-lg cursor-pointer transition-all duration-300 flex flex-col justify-between h-48 overflow-hidden hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shadow-md border border-white/10 flex-shrink-0">
                    <img
                      src={mix.coverArt}
                      alt={mix.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[var(--ruby)]/20 text-[var(--ruby)] border border-[var(--ruby)]/30 flex items-center gap-1">
                    <Icon name="bolt" size={10} /> AUTO
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[var(--ruby)] transition-colors truncate">
                    {mix.name}
                  </h3>
                  <p className="text-xs text-white/50 truncate mt-0.5">
                    {mix.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2x3 Quick Picks Speed Dial */}
      {quickPicks.length > 0 && (
        <section aria-label="Quick picks">
          <SectionHead title="Quick Picks" note="ONE-TOUCH 320KBPS PLAYBACK" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickPicks.map((t) => (
              <div
                key={t.id}
                onClick={() => playTrack(t, { source: 'single' })}
                className="group relative flex items-center gap-3 p-2.5 rounded-xl bg-[#111114]/80 hover:bg-white/[0.08] border border-white/5 hover:border-[var(--ruby)]/40 cursor-pointer transition-all duration-300 shadow-md hover:shadow-[0_4px_20px_rgba(255,35,72,0.15)] overflow-hidden"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <Cover track={t} className="w-full h-full object-cover" />
                  <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Icon name="play" size={20} className="text-[var(--ruby)]" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[var(--ruby)] truncate transition-colors">
                    {t.name || t.title}
                  </h3>
                  <p className="text-xs text-white/50 truncate mt-0.5">
                    {t.primaryArtists}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-white/40 group-hover:text-[var(--ruby)] border border-white/5 group-hover:border-[var(--ruby)]/30">
                  320K
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Because You Liked Shelf */}
      {becauseYouLiked && becauseYouLiked.tracks.length > 0 && (
        <section aria-label="Because You Liked">
          <SectionHead
            title={becauseYouLiked.title}
            note={becauseYouLiked.subtitle}
          />
          <div className="grid3d">
            {becauseYouLiked.tracks.map((t) => (
              <MusicCard key={t.id} track={t} list={becauseYouLiked.tracks} />
            ))}
          </div>
        </section>
      )}

      {/* Replay Your Favorites */}
      {replayFavorites.length > 0 && (
        <section aria-label="Replay Your Favorites">
          <SectionHead
            title="Replay Your Favorites"
            note="TOP REPLAYED & SAVED"
          />
          <div className="grid3d">
            {replayFavorites.map((t) => (
              <MusicCard key={t.id} track={t} list={replayFavorites} />
            ))}
          </div>
        </section>
      )}

      {/* Made For You 3D Cards */}
      {madeForYou.length > 0 && (
        <section aria-label="Made For You">
          <SectionHead title="Made For You" note="LOSSLESS SPATIAL AUDIO" />
          <div className="grid3d">
            {madeForYou.map((t) => (
              <MusicCard key={t.id} track={t} list={madeForYou} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Hits */}
      {trending.length > 0 && (
        <section aria-label="Trending Hits">
          <SectionHead title="Trending Across India" note="POPULAR CHARTS 2026" />
          <div className="grid3d">
            {trending.map((t) => (
              <MusicCard key={t.id} track={t} list={trending} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Artists Shelf */}
      <section aria-label="Popular Artists">
        <SectionHead title="Popular Artists" note="CURATED DISCOGRAPHIES" />
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
          {POPULAR_ARTISTS.map((art) => (
            <div
              key={art.name}
              onClick={() => navigate('artist', { artist: art.name })}
              className="flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[var(--ruby)] shadow-md group-hover:shadow-[0_0_20px_rgba(255,35,72,0.3)] transition-all duration-300">
                <img
                  src={art.img}
                  alt={art.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as any).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-white/80 group-hover:text-white mt-2.5 truncate max-w-full">
                {art.name}
              </span>
              <span className="text-[10px] text-white/40">Artist</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
