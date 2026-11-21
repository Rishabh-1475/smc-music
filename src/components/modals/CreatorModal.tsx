import React, { useEffect, useState } from 'react';
import Icon from '../ui/Icon';
import { usePlayerStore } from '@/store/playerStore';

export default function CreatorModal() {
  const { isCreatorOpen, setCreatorOpen } = usePlayerStore();
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCreatorOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setCreatorOpen]);

  if (!isCreatorOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Creator Dossier"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#0f0f13] border border-white/10 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(255,35,72,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glossy accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--ruby)] to-transparent" />

        {/* Close Button */}
        <button
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setCreatorOpen(false)}
          aria-label="Close"
        >
          <Icon name="x" size={16} />
        </button>

        {/* Creator Identity Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[var(--ruby)]/60 shadow-[0_0_20px_rgba(255,35,72,0.3)] flex-shrink-0 bg-neutral-900">
            {!photoError ? (
              <img
                src="/creator.jpeg"
                alt="Rishabh Singh"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => {
                  const fallback = new Image();
                  fallback.src = '/creator.jpg';
                  fallback.onload = () => {};
                  fallback.onerror = () => setPhotoError(true);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-[var(--ruby)]">
                RS
              </div>
            )}
            <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0f0f13]" />
          </div>

          <div className="text-center sm:text-left">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--ruby)]/15 text-[var(--ruby)] border border-[var(--ruby)]/30 mb-2">
              CREATOR & ARCHITECT
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">Rishabh Singh</h2>
            <p className="text-xs text-white/70 mt-0.5">
              Lead Systems Architect & Software Developer (B.Tech CSE)
            </p>
            <p className="text-xs text-[var(--crimson)] font-mono mt-1">
              co.singhsmusic.rhythmx • v2.6.0
            </p>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-2">
            Engineering Directive
          </h3>
          <p className="text-xs text-white/70 leading-relaxed">
            Designed and built <strong>RythemX</strong> from the ground up: featuring the 320kbps Lossless
            JioSaavn streaming engine, ASTRA 3D Planetary Voice AI with 12+ Indian language transliteration,
            and Three.js WebGL spatial audio visualizations. Engineered for zero compromises in acoustic fidelity.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-lg font-bold text-[var(--ruby)]">320k</div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">Bitrate</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-lg font-bold text-white">WebGL</div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">3D Planet</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-lg font-bold text-emerald-400">12+</div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">Languages</div>
          </div>
        </div>

        {/* Instagram CTA */}
        <div className="mt-6">
          <a
            href="https://www.instagram.com/rish4bhsiingh/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[var(--crimson)] to-[var(--ruby)] text-white flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_4px_20px_rgba(255,35,72,0.35)] transition-all"
          >
            <Icon name="external" size={16} />
            Connect on Instagram (@rish4bhsiingh)
          </a>
        </div>
      </div>
    </div>
  );
}
