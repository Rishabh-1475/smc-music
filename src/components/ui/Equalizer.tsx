import React from 'react';

interface EqualizerProps {
  paused?: boolean;
  className?: string;
}

export default function Equalizer({ paused = false, className = '' }: EqualizerProps) {
  return (
    <span className={`eq ${paused ? 'eq--paused' : ''} ${className}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
