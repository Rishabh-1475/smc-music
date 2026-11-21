import React, { useEffect } from 'react';
import Cover from '../ui/Cover';
import Icon from '../ui/Icon';
import Equalizer from '../ui/Equalizer';
import { usePlayerStore } from '@/store/playerStore';

export default function QueuePanel() {
  const { queue, queueIndex, isPlaying, playTrack, removeFromQueue, clearQueue, setQueueOpen } = usePlayerStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQueueOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setQueueOpen]);

  return (
    <section className="queue glass" role="dialog" aria-label="Queue">
      <header className="queue__head">
        <h2>Queue</h2>
        <span>{queue.length} tracks</span>
        <button
          type="button"
          className="ghost-btn"
          onClick={clearQueue}
          disabled={queue.length <= 1}
        >
          Clear queue
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setQueueOpen(false)}
          aria-label="Close queue"
        >
          <Icon name="x" size={16} />
        </button>
      </header>

      {queue.length === 0 ? (
        <p className="queue__empty">Your queue is empty. Play a track to start one.</p>
      ) : (
        <ol className="queue__list">
          {queue.map((t, i) => {
            const isCurrent = i === queueIndex;
            const title = t.name || t.title || 'Lossless Audio';
            const artist = t.primaryArtists || (t as any).artist || 'RhythmX';

            return (
              <li key={`${t.id}-${i}`} className={isCurrent ? 'is-active' : ''}>
                <button
                  type="button"
                  onClick={() => playTrack(t, queue)}
                  aria-label={`Play ${title}`}
                >
                  <Cover track={t} className="cover--tiny" />
                  <span className="queue__text">
                    <b>{title}</b>
                    <small>{artist}</small>
                  </span>
                  {isCurrent && <Equalizer paused={!isPlaying} />}
                </button>
                {!isCurrent && (
                  <button
                    type="button"
                    className="icon-btn icon-btn--bare"
                    onClick={() => removeFromQueue(i)}
                    aria-label={`Remove ${title} from queue`}
                  >
                    <Icon name="x" size={14} />
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
