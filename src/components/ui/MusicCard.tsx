import React, { useRef } from 'react';
import Cover from './Cover';
import Icon from './Icon';
import Equalizer from './Equalizer';
import { Song } from '@/types/music';
import { usePlayerStore } from '@/store/playerStore';

interface MusicCardProps {
  track: Song;
  list?: Song[];
}

export default function MusicCard({ track, list }: MusicCardProps) {
  const { currentTrack, isPlaying, isLoading, playTrack, togglePlay, toggleLike, isLiked } = usePlayerStore();
  const ref = useRef<HTMLElement>(null);
  const active = currentTrack?.id === track.id;
  const liked = isLiked(track.id);

  const title = track.name || track.title || 'Lossless Audio';
  const artist = track.primaryArtists || (track as any).artist || 'RhythmX';

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
    el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    ['--ry', '--rx', '--gx', '--gy'].forEach((p) => el.style.removeProperty(p));
  };

  const activate = () => {
    if (active) {
      togglePlay();
    } else {
      playTrack(track, list || [track]);
    }
  };

  return (
    <article
      ref={ref}
      className={`card3d ${active ? 'is-active' : ''}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <button
        type="button"
        className="card3d__body"
        onClick={activate}
        aria-label={`${active && isPlaying ? 'Pause' : 'Play'} ${title} by ${artist}`}
      >
        <span className="card3d__art">
          <Cover track={track} />
          <span className="card3d__sheen" />
          <span className="card3d__play">
            {active && isLoading ? (
              <span className="spinner" />
            ) : (
              <Icon name={active && isPlaying ? 'pause' : 'play'} size={22} />
            )}
          </span>
          {active && (
            <span className="card3d__eq">
              <Equalizer paused={!isPlaying} />
            </span>
          )}
        </span>
        <span className="card3d__reflect" aria-hidden="true">
          <Cover track={track} />
        </span>
        <span className="card3d__meta">
          <span className="card3d__title" title={title}>{title}</span>
          <span className="card3d__artist" title={artist}>{artist}</span>
        </span>
      </button>
      <button
        type="button"
        className={`card3d__like ${liked ? 'is-on' : ''}`}
        onClick={() => toggleLike(track)}
        aria-pressed={liked}
        aria-label={liked ? `Remove ${title} from liked tracks` : `Save ${title} to liked tracks`}
      >
        <Icon name="heart" size={16} className={liked ? 'icon--filled' : ''} />
      </button>
    </article>
  );
}
