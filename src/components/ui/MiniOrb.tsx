import React from 'react';

interface MiniOrbProps {
  mode?: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
  size?: number;
  className?: string;
}

export default function MiniOrb({ mode = 'idle', size = 16, className = '' }: MiniOrbProps) {
  return (
    <span
      className={`mini-orb ${className}`}
      data-mode={mode}
      style={{ '--s': `${size}px` } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className="mini-orb__halo" />
      <span className="mini-orb__core" />
      <span className="mini-orb__ring" />
    </span>
  );
}
