'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Icon from '../ui/Icon';
import { usePlayerStore } from '@/store/playerStore';
import { CREATOR_CONFIG } from '@/config/creator';

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

  // Capacitor Android WebView external link opener
  const openExternalProfile = useCallback(async (url: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url, presentationStyle: 'popover' });
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  if (!isCreatorOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Creator Dossier — Rishabh Singh"
      onClick={() => setCreatorOpen(false)}
    >
      <div
        className="relative w-[92vw] max-w-md max-h-[88dvh] overflow-y-auto rounded-3xl bg-[#0b0b0e] border border-[#B50925]/40 p-5 sm:p-6 shadow-[0_24px_70px_rgba(0,0,0,0.95),0_0_50px_rgba(255,35,72,0.3)] my-auto scrollbar-thin pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glossy accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--ruby)] to-transparent" />

        {/* Touch-Friendly 44px Close Button */}
        <button
          type="button"
          className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer active:scale-95"
          onClick={() => setCreatorOpen(false)}
          aria-label="Close dossier"
        >
          <Icon name="x" size={20} />
        </button>

        {/* Top Hero: Big Square Portrait Photo */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative w-[220px] h-[220px] sm:w-[270px] sm:h-[270px] aspect-square rounded-2xl overflow-hidden border-2 border-[#FF2348]/85 shadow-[0_0_35px_rgba(255,35,72,0.4)] bg-neutral-900 mb-4 shrink-0">
            {!photoError ? (
              <img
                src={CREATOR_CONFIG.avatarUrl}
                alt={CREATOR_CONFIG.name}
                className="w-full h-full object-cover object-[50%_15%]"
                referrerPolicy="no-referrer"
                onError={() => {
                  const fallback = new Image();
                  fallback.src = CREATOR_CONFIG.avatarFallbackUrl;
                  fallback.onload = () => {};
                  fallback.onerror = () => setPhotoError(true);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-[var(--ruby)]">
                RS
              </div>
            )}
            <span className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/60 text-[10px] font-mono text-emerald-400 font-semibold shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>

          {/* Identity & Badges */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-[var(--ruby)]/15 text-[var(--ruby)] border border-[var(--ruby)]/40 mb-2 uppercase tracking-wider">
            <Icon name="bolt" size={13} /> DEVELOPER & ARCHITECT OF RYTHEMX
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <span>{CREATOR_CONFIG.name}</span>
            <span className="inline-flex text-[#FF2348]" title="Verified Creator">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-white/80 font-medium mt-1">
            {CREATOR_CONFIG.role}
          </p>
          <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">
            B.Tech CSE • Chandigarh University, UP
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-[var(--ruby)]">
            <span>co.singhsmusic.rhythmx</span>
            <span>•</span>
            <span>Spatial Audio v2.6.0</span>
          </div>
        </div>

        {/* Engineering Bio Card */}
        <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/5">
          <p className="text-xs sm:text-[13px] text-white/75 leading-relaxed text-center sm:text-left">
            {CREATOR_CONFIG.bio}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 mt-3.5 text-center">
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-sm sm:text-base font-bold text-[var(--ruby)]">320k</div>
            <div className="text-[9px] font-mono text-white/50 uppercase mt-0.5">Master AAC</div>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-sm sm:text-base font-bold text-white">WebGL</div>
            <div className="text-[9px] font-mono text-white/50 uppercase mt-0.5">3D Planet</div>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-sm sm:text-base font-bold text-emerald-400">12+</div>
            <div className="text-[9px] font-mono text-white/50 uppercase mt-0.5">Languages</div>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-sm sm:text-base font-bold text-sky-400">0s</div>
            <div className="text-[9px] font-mono text-white/50 uppercase mt-0.5">Zero-Lag</div>
          </div>
        </div>

        {/* Social Follow Prompt & 3 Tactile SVG Action Buttons */}
        <div className="mt-4">
          <p className="text-[11px] sm:text-xs text-center text-white/70 font-medium mb-2.5">
            Enjoying RythemX? Follow & connect with me below!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Instagram */}
            <a
              href={CREATOR_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => openExternalProfile(CREATOR_CONFIG.instagramUrl, e)}
              className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-[#E1306C] via-[#FD1D1D] to-[#F77737] text-white flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 shadow-[0_4px_18px_rgba(225,48,108,0.35)] transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </a>

            {/* LinkedIn */}
            <a
              href={CREATOR_CONFIG.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => openExternalProfile(CREATOR_CONFIG.linkedinUrl, e)}
              className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-[#0A66C2] text-white flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 shadow-[0_4px_18px_rgba(10,102,194,0.35)] transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span>LinkedIn</span>
            </a>

            {/* GitHub */}
            <a
              href={CREATOR_CONFIG.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => openExternalProfile(CREATOR_CONFIG.githubUrl, e)}
              className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-[#24292e] text-white border border-white/10 flex items-center justify-center gap-2 hover:bg-[#2f363d] active:scale-95 shadow-[0_4px_18px_rgba(0,0,0,0.4)] transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
