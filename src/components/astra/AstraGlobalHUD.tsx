'use client';

import React, { useEffect, useState } from 'react';
import MiniOrb from '../ui/MiniOrb';
import Icon from '../ui/Icon';
import { astraVoiceEngine, AstraVoiceState } from '@/services/astraVoiceEngine';

export default function AstraGlobalHUD() {
  const [voiceState, setVoiceState] = useState<AstraVoiceState>(astraVoiceEngine.getState());

  useEffect(() => {
    const unsub = astraVoiceEngine.subscribe((st) => {
      setVoiceState(st);
    });
    return unsub;
  }, []);

  // Display HUD when actively listening, wake awake, thinking, or displaying feedback status
  const isVisible =
    voiceState.mode === 'listening' ||
    voiceState.mode === 'thinking' ||
    voiceState.isWakeAwake ||
    Boolean(voiceState.statusText && voiceState.mode !== 'idle');

  if (!isVisible) {
    return null;
  }

  const displayText =
    voiceState.transcript ||
    voiceState.interimTranscript ||
    voiceState.statusText ||
    (voiceState.mode === 'thinking' ? 'Processing command...' : 'Listening...');

  return (
    <aside
      className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-[9990] flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0d0d12]/92 backdrop-blur-2xl border border-[var(--ruby)]/75 shadow-[0_8px_32px_rgba(255,35,72,0.4),0_0_25px_rgba(0,0,0,0.85)] animate-bounce-in max-w-[92vw] sm:max-w-md select-none"
      role="status"
      aria-live="polite"
      aria-label="ASTRA Voice Assistant HUD"
    >
      {/* Glowing Pulsing Mini Orb */}
      <div className="shrink-0 flex items-center justify-center">
        <MiniOrb mode={voiceState.mode === 'listening' ? 'listening' : voiceState.mode === 'thinking' ? 'thinking' : 'idle'} size={24} />
      </div>

      {/* Transcript / Status Text */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--ruby)] font-bold">
            ASTRA AI // {voiceState.mode.toUpperCase()}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="text-xs sm:text-sm text-white font-medium truncate mt-0.5">
          {displayText}
        </p>
      </div>

      {/* Audio Waveform Indicator */}
      <div className="hidden xs:flex items-center gap-0.5 h-4 shrink-0 px-1">
        <span className="w-0.5 h-2 bg-[var(--ruby)] rounded-full animate-pulse" />
        <span className="w-0.5 h-4 bg-[var(--ruby)] rounded-full animate-pulse [animation-delay:150ms]" />
        <span className="w-0.5 h-3 bg-[var(--ruby)] rounded-full animate-pulse [animation-delay:300ms]" />
      </div>

      {/* Dismiss / Stop Button */}
      <button
        type="button"
        className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center shrink-0 transition-colors active:scale-95 cursor-pointer"
        onClick={() => {
          astraVoiceEngine.stopActiveListening();
          astraVoiceEngine.dismissWake();
        }}
        aria-label="Stop ASTRA Voice Input"
        title="Stop"
      >
        <Icon name="x" size={14} />
      </button>
    </aside>
  );
}
