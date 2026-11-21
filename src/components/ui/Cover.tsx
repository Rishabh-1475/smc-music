import React, { useState } from 'react';
import { Song } from '@/types/music';

const initials = (title = '') =>
  title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

interface CoverProps {
  track: Song | any;
  className?: string;
  size?: number;
}

export default function Cover({ track, className = '' }: CoverProps) {
  const [broken, setBroken] = useState(false);
  const title = track?.name || track?.title || 'RYTHEMX';
  const artUrl = !broken ? (track?.imageUrl || track?.art || track?.coverArt) : null;
  const hue = track?.hue ?? (title.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) % 360);

  return (
    <div
      className={`cover ${className}`}
      style={{ '--h': hue } as React.CSSProperties}
    >
      <div className="cover__gen">
        <span className="cover__mark">{initials(title)}</span>
      </div>
      {artUrl && (
        <img
          src={artUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          draggable="false"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
        />
      )}
    </div>
  );
}
