'use client';

import React, { useEffect, useState } from 'react';
import MiniOrb from '../ui/MiniOrb';
import Icon from '../ui/Icon';
import { astraWakeWord, WakeWordState } from '@/services/astraWakeWord';

export default function AstraGlobalHUD() {
  const [wakeState, setWakeState] = useState<WakeWordState>(astraWakeWord.getState());

  useEffect(() => {
    const unsub = astraWakeWord.subscribe((st) => {
      setWakeState(st);
    });
    return unsub;
  }, []);

  if (!wakeState.isAwake && !wakeState.statusText) {
    return null;
  }

  return (
    <aside
      className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0d0d12]/90 backdrop-blur-xl border border-[var(--ruby)]/70 shadow-[0_8px_32px_rgba(255,35,72,0.35),0_0_20px_rgba(0,0,0,0.8)] animate-bounce-in max-w-[90vw] sm:max-w-md"
      role="status"
      aria-live="polite"
      aria-label="ASTRA Voice Assistant HUD"
    >
      {/* Glowing Pulsing Mini Orb */}
      <div className="shrink-0 flex items-center justify-center">
        <MiniOrb mode={wakeState.isAwake ? 'listening' : 'idle'} size={24} />
      </div>

      {/* Transcript / Status Text */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--ruby)] font-bold">
            ASTRA AI
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="text-xs sm:text-sm text-white font-medium truncate mt-0.5">
          {wakeState.statusText || wakeState.transcript || 'Listening for command...'}
        </p>
      </div>

      {/* Audio Waveform Indicator */}
      <div className="hidden xs:flex items-center gap-0.5 h-4 shrink-0 px-1">
        <span className="w-0.5 h-2 bg-[var(--ruby)] rounded-full animate-pulse" />
        <span className="w-0.5 h-4 bg-[var(--ruby)] rounded-full animate-pulse [animation-delay:150ms]" />
        <span className="w-0.5 h-3 bg-[var(--ruby)] rounded-full animate-pulse [animation-delay:300ms]" />
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center shrink-0 transition-colors"
        onClick={() => astraWakeWord.dismissWake()}
        aria-label="Dismiss ASTRA HUD"
      >
        <Icon name="x" size={14} />
      </button>
    </aside>
  );
}
