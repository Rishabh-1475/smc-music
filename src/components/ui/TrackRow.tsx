import React from 'react';
import Cover from './Cover';
import Icon from './Icon';
import Equalizer from './Equalizer';
import { Song } from '@/types/music';
import { usePlayerStore, PlaybackSource } from '@/store/playerStore';

export const fmtTime = (s: number | string): string => {
  const n = typeof s === 'string' ? parseFloat(s) : s;
  if (!Number.isFinite(n) || n <= 0) return '3:30';
  const m = Math.floor(n / 60);
  const sec = Math.floor(n % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

interface TrackRowProps {
  track: Song;
  list?: Song[];
  index: number;
  source?: PlaybackSource;
}

export default function TrackRow({ track, list, index, source }: TrackRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleLike, isLiked, addToQueue } = usePlayerStore();
  const active = currentTrack?.id === track.id;
  const liked = isLiked(track.id);

  const title = track.name || track.title || 'Lossless Audio';
  const artist = track.primaryArtists || (track as any).artist || 'RhythmX';
  const album = track.album || 'Single';

  const handleClick = () => {
    if (active) {
      togglePlay();
    } else {
      if (source === 'search') {
        playTrack(track, { source: 'search' });
      } else {
        playTrack(track, { source: source || (list ? 'playlist' : 'single'), queue: list });
      }
    }
  };

  return (
    <li className={`row ${active ? 'is-active' : ''}`}>
      <button
        type="button"
        className="row__main"
        onClick={handleClick}
        aria-label={`${active && isPlaying ? 'Pause' : 'Play'} ${title} by ${artist}`}
      >
        <span className="row__index">
          {active ? <Equalizer paused={!isPlaying} /> : <span className="row__num">{index + 1}</span>}
          <Icon name="play" size={14} className="row__hoverplay" />
        </span>
        <Cover track={track} className="cover--row" />
        <span className="row__text">
          <span className="row__title" title={title}>{title}</span>
          <span className="row__artist" title={artist}>{artist}</span>
        </span>
        <span className="row__album" title={album}>{album}</span>
        <span className="row__time">{fmtTime(track.duration)}</span>
      </button>
      <div className="row__actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => addToQueue(track)}
          aria-label={`Add ${title} to queue`}
        >
          <Icon name="queue" size={16} />
        </button>
        <button
          type="button"
          className={`icon-btn ${liked ? 'is-on' : ''}`}
          onClick={() => toggleLike(track)}
          aria-pressed={liked}
          aria-label={liked ? `Remove ${title} from liked tracks` : `Save ${title} to liked tracks`}
        >
          <Icon name="heart" size={16} className={liked ? 'icon--filled' : ''} />
        </button>
      </div>
    </li>
  );
}
