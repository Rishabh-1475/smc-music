import React, { useState } from 'react';
import Cover from '../components/ui/Cover';
import Icon from '../components/ui/Icon';
import Equalizer from '../components/ui/Equalizer';
import HeroModel3D from '../components/three/HeroModel3D';
import { Song } from '@/types/music';
import { usePlayerStore } from '@/store/playerStore';

interface HeroProps {
  track: Song;
  list?: Song[];
}

export default function Hero({ track, list }: HeroProps) {
  const { currentTrack, isPlaying, isLoading, playTrack, togglePlay, toggleLike, isLiked } = usePlayerStore();
  const [show3D, setShow3D] = useState(true);

  const active = currentTrack?.id === track.id;
  const liked = isLiked(track.id);

  const title = track.name || track.title || 'Lossless Master';
  const artist = track.primaryArtists || (track as any)?.artist || 'RhythmX';
  const album = track.album || 'Featured Single';

  const len = title.length;
  const size = len > 34 ? 'xs' : len > 20 ? 'sm' : 'lg';

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty('--hx', `${(x * 8).toFixed(2)}deg`);
    e.currentTarget.style.setProperty('--hy', `${(-y * 6).toFixed(2)}deg`);
  };

  const onLeave = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.removeProperty('--hx');
    e.currentTarget.style.removeProperty('--hy');
  };

  const handleStream = () => {
    if (active) {
      togglePlay();
    } else {
      playTrack(track, list || [track]);
    }
  };

  return (
    <section
      className="hero glass"
      aria-label="Featured release"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="hero__mesh" aria-hidden="true" />

      {/* Copy / Details Column */}
      <div className="hero__copy">
        <p className="hero__kicker">FEATURED 320KBPS RELEASE</p>
        <h1 className="hero__title" data-size={size}>
          {title}
        </h1>
        <p className="hero__by">
          <strong>{artist}</strong>
          {album && album !== title ? <span>{album}</span> : null}
        </p>

        <ul className="hero__badges" aria-label="Audio quality">
          <li>
            <Icon name="wave" size={14} />
            320 KBPS AAC
          </li>
          <li>
            <Icon name="bolt" size={14} />
            Lossless Master Quality
          </li>
        </ul>

        <div className="hero__actions">
          <button
            type="button"
            className="btn btn--glow"
            onClick={handleStream}
          >
            {active && isLoading ? (
              <span className="spinner" />
            ) : active && isPlaying ? (
              <Equalizer />
            ) : (
              <Icon name="play" size={18} />
            )}
            {active && isPlaying
              ? 'NOW STREAMING'
              : active && !isPlaying && !isLoading
              ? 'RESUME MASTER'
              : 'STREAM MASTER'}
          </button>

          <button
            type="button"
            className={`btn btn--ghost ${liked ? 'is-on' : ''}`}
            onClick={() => toggleLike(track)}
            aria-pressed={liked}
            aria-label={liked ? 'Saved to library' : 'Save to library'}
          >
            <Icon name="heart" size={18} className={liked ? 'icon--filled' : ''} />
            {liked ? 'Saved' : 'Save'}
          </button>

          <button
            type="button"
            className="hidden lg:inline-flex text-xs text-white/50 hover:text-white items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/5 transition-colors"
            onClick={() => setShow3D(!show3D)}
            title="Toggle 3D WebGL Vinyl Scene"
          >
            3D WebGL: {show3D ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* 3D WebGL / Suspended Cover Stage */}
      <div className="hero__stage" aria-hidden="true">
        {show3D ? (
          <div className="w-full h-full min-h-[300px] flex items-center justify-center">
            <HeroModel3D />
          </div>
        ) : (
          <>
            <div className="hero__halo" />
            <div className="hero__float">
              <div className="hero__cover">
                <Cover track={track} />
                <span className="card3d__sheen" />
              </div>
              <div className="hero__reflect">
                <Cover track={track} />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
