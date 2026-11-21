import React, { useState } from 'react';
import Cover from '../ui/Cover';
import Icon from '../ui/Icon';
import Visualizer from './Visualizer';
import QueuePanel from './QueuePanel';
import { fmtTime } from '../ui/TrackRow';
import { usePlayerStore } from '@/store/playerStore';

function ProgressBar({ disabled }: { disabled: boolean }) {
  const { currentTime, duration, seek } = usePlayerStore();
  const [drag, setDrag] = useState<number | null>(null);

  const shown = drag ?? currentTime;
  const pct = duration > 0 ? Math.min(100, (shown / duration) * 100) : 0;

  const commit = () => {
    if (drag != null) {
      seek(drag);
      setDrag(null);
    }
  };

  return (
    <div className="progress">
      <span className="progress__time">{fmtTime(shown)}</span>
      <input
        type="range"
        className="range range--progress"
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(shown, duration || 0)}
        disabled={disabled || !duration}
        style={{ '--p': `${pct}%` } as React.CSSProperties}
        onChange={(e) => setDrag(Number(e.target.value))}
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={commit}
        aria-label="Seek"
        aria-valuetext={`${fmtTime(shown)} of ${fmtTime(duration)}`}
      />
      <span className="progress__time">{fmtTime(duration)}</span>
    </div>
  );
}

export default function PlayerDock() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    status,
    isShuffle,
    repeatMode,
    volume,
    isMuted,
    isQueueOpen,
    playNext,
    playPrev,
    togglePlay,
    toggleShuffle,
    cycleRepeat,
    setVolume,
    toggleMute,
    toggleLike,
    isLiked,
    setQueueOpen,
    setFullPlayerOpen
  } = usePlayerStore();

  const errored = status === 'error';
  const idle = !currentTrack;
  const volIcon = isMuted || volume === 0 ? 'mute' : volume < 0.5 ? 'volumeLow' : 'volume';
  const liked = currentTrack ? isLiked(currentTrack.id) : false;

  const title = currentTrack?.name || currentTrack?.title || 'Nothing playing';
  const artist = currentTrack?.primaryArtists || (currentTrack as any)?.artist || 'Pick a track to begin';

  return (
    <footer className="dock-wrap">
      {isQueueOpen && <QueuePanel />}

      <div
        className={`dock glass ${isPlaying ? 'is-playing' : ''}`}
        role="region"
        aria-label="Audio player dock"
      >
        {/* Left: Track Info & Artwork */}
        <div className="dock__track">
          {currentTrack ? (
            <>
              <div
                className="cursor-pointer group relative flex-shrink-0"
                onClick={() => setFullPlayerOpen(true)}
                title="Expand Full 3D Player"
              >
                <Cover track={currentTrack} className="cover--dock" />
                <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                  <Icon name="maximize" size={14} className="text-white" />
                </span>
              </div>
              <div
                className="dock__meta cursor-pointer"
                onClick={() => setFullPlayerOpen(true)}
                title="Expand Full 3D Player"
              >
                <strong title={title}>{title}</strong>
                <span className={errored ? 'is-error' : ''} title={artist}>
                  {errored ? 'Playback failed. Press play to retry.' : artist}
                </span>
              </div>
              <button
                type="button"
                className={`icon-btn ${liked ? 'is-on' : ''}`}
                onClick={() => toggleLike(currentTrack)}
                aria-pressed={liked}
                aria-label={liked ? 'Remove from liked tracks' : 'Save to liked tracks'}
              >
                <Icon name="heart" size={18} className={liked ? 'icon--filled' : ''} />
              </button>
            </>
          ) : (
            <div className="dock__meta dock__meta--idle">
              <strong>Nothing playing</strong>
              <span>Pick a track to begin</span>
            </div>
          )}
        </div>

        {/* Center: Controls & Seekbar */}
        <div className="dock__center">
          <div className="transport">
            <button
              type="button"
              className={`icon-btn ${isShuffle ? 'is-on' : ''}`}
              onClick={toggleShuffle}
              aria-pressed={isShuffle}
              aria-label="Shuffle"
              title="Shuffle"
            >
              <Icon name="shuffle" size={18} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={playPrev}
              disabled={idle}
              aria-label="Previous track"
              title="Previous Track"
            >
              <Icon name="prev" size={20} />
            </button>
            <button
              type="button"
              className="play-btn"
              onClick={togglePlay}
              disabled={idle}
              aria-label={isPlaying || isLoading ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <span className="spinner" />
              ) : (
                <Icon name={isPlaying ? 'pause' : 'play'} size={22} />
              )}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={playNext}
              disabled={idle}
              aria-label="Next track"
              title="Next Track"
            >
              <Icon name="next" size={20} />
            </button>
            <button
              type="button"
              className={`icon-btn ${repeatMode !== 'off' ? 'is-on' : ''} relative`}
              onClick={cycleRepeat}
              aria-label={`Repeat: ${repeatMode}`}
              title={`Repeat: ${repeatMode}`}
            >
              <Icon name="repeat" size={18} />
              {repeatMode === 'one' && <span className="repeat-one">1</span>}
            </button>
          </div>

          <ProgressBar disabled={idle} />
        </div>

        {/* Right: Visualizer, Expand, Queue & Volume */}
        <div className="dock__right">
          <Visualizer playing={isPlaying} />

          <button
            type="button"
            className="icon-btn hidden sm:flex"
            onClick={() => setFullPlayerOpen(true)}
            aria-label="Full 3D Player"
            title="Expand Full 3D Player"
          >
            <Icon name="maximize" size={18} />
          </button>

          <button
            type="button"
            className={`icon-btn ${isQueueOpen ? 'is-on' : ''}`}
            onClick={() => setQueueOpen()}
            aria-pressed={isQueueOpen}
            aria-label="Queue"
            title="Toggle Queue"
          >
            <Icon name="queue" size={18} />
          </button>

          <div className="volume">
            <button
              type="button"
              className="icon-btn"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              <Icon name={volIcon} size={18} />
            </button>
            <input
              type="range"
              className="range range--volume"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              style={{ '--p': `${(isMuted ? 0 : volume) * 100}%` } as React.CSSProperties}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
