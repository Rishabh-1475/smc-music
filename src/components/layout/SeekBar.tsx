'use client';

import React, { useState, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { fmtTime } from '../ui/TrackRow';

interface SeekBarProps {
  disabled?: boolean;
  className?: string;
  showLabels?: boolean;
}

export const SeekBar: React.FC<SeekBarProps> = React.memo(function SeekBar({
  disabled = false,
  className = '',
  showLabels = true
}) {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const seek = usePlayerStore((s) => s.seek);

  const [drag, setDrag] = useState<number | null>(null);

  const shown = drag ?? currentTime;
  const pct = duration > 0 ? Math.min(100, Math.max(0, (shown / duration) * 100)) : 0;

  const commit = useCallback(() => {
    if (drag != null) {
      seek(drag);
      setDrag(null);
    }
  }, [drag, seek]);

  return (
    <div className={`progress ${className}`}>
      {showLabels && <span className="progress__time">{fmtTime(shown)}</span>}
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
        aria-label="Seek track"
        aria-valuetext={`${fmtTime(shown)} of ${fmtTime(duration)}`}
      />
      {showLabels && <span className="progress__time">{fmtTime(duration)}</span>}
    </div>
  );
});

export default SeekBar;
