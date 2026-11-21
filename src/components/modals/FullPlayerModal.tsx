import React, { useEffect, useState } from 'react';
import Cover from '../ui/Cover';
import Icon from '../ui/Icon';
import Visualizer from '../layout/Visualizer';
import { fmtTime } from '../ui/TrackRow';
import { usePlayerStore } from '@/store/playerStore';

export default function FullPlayerModal() {
  const {
    isFullPlayerOpen,
    setFullPlayerOpen,
    currentTrack,
    isPlaying,
    isLoading,
    isShuffle,
    repeatMode,
    volume,
    currentTime,
    duration,
    togglePlay,
    playNext,
    playPrev,
    toggleShuffle,
    cycleRepeat,
    seek,
    setVolume,
    toggleLike,
    isLiked
  } = usePlayerStore();

  const [showLyrics, setShowLyrics] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullPlayerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setFullPlayerOpen]);

  if (!isFullPlayerOpen || !currentTrack) return null;

  const title = currentTrack.name || currentTrack.title || 'Lossless Audio';
  const artist = currentTrack.primaryArtists || (currentTrack as any)?.artist || 'RhythmX';
  const album = currentTrack.album || 'Single';
  const liked = isLiked(currentTrack.id);
  const shownTime = dragTime ?? currentTime;
  const progressPct = duration > 0 ? (shownTime / duration) * 100 : 0;

  const commitSeek = () => {
    if (dragTime !== null) {
      seek(dragTime);
      setDragTime(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#080809]/95 backdrop-blur-2xl text-white p-6 md:p-12 animate-fade-in overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Full Player"
    >
      {/* Background ambient glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center filter blur-3xl scale-125"
        style={{ backgroundImage: `url(${currentTrack.imageUrl || (currentTrack as any).art})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setFullPlayerOpen(false)}
            aria-label="Close"
          >
            <Icon name="x" size={20} />
          </button>
          <div>
            <div className="text-[11px] font-mono tracking-widest text-[var(--ruby)] uppercase">
              PLAYING FROM QUEUE
            </div>
            <div className="text-xs text-white/60 font-medium truncate max-w-[200px] md:max-w-md">
              {album}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--ruby)]/15 border border-[var(--ruby)]/30 text-[var(--ruby)]">
            <Icon name="wave" size={14} /> 320 KBPS LOSSLESS
          </span>
          <button
            type="button"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              showLyrics
                ? 'bg-[var(--ruby)] text-white border-[var(--ruby)]'
                : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
            }`}
            onClick={() => setShowLyrics(!showLyrics)}
          >
            Lyrics
          </button>
        </div>
      </header>

      {/* Center Stage: Spinning Vinyl / Lyrics */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-6">
        {!showLyrics ? (
          <div className="relative flex items-center justify-center">
            {/* Ambient Radial Glow */}
            <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-[var(--ruby)]/15 filter blur-3xl pointer-events-none" />

            {/* Vinyl Record */}
            <div
              className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-[#111114] border-4 border-[#222228] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_50px_rgba(255,35,72,0.2)] flex items-center justify-center transition-all ${
                isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''
              }`}
              style={{
                backgroundImage:
                  'radial-gradient(circle, #1a1a20 2px, transparent 2px), radial-gradient(circle, #0e0e12 20%, #15151b 50%, #080809 90%)',
                backgroundSize: '100% 100%'
              }}
            >
              {/* Concentric Grooves */}
              <div className="absolute inset-4 rounded-full border border-white/[0.04]" />
              <div className="absolute inset-10 rounded-full border border-white/[0.04]" />
              <div className="absolute inset-16 rounded-full border border-white/[0.04]" />
              <div className="absolute inset-24 rounded-full border border-white/[0.04]" />

              {/* Center Album Art Label */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-[#080809] shadow-inner relative flex items-center justify-center">
                <Cover track={currentTrack} className="w-full h-full object-cover" />
                {/* Spindle hole */}
                <div className="absolute w-4 h-4 rounded-full bg-[#080809] border border-white/20" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg h-72 md:h-96 rounded-2xl bg-white/[0.03] border border-white/10 p-6 overflow-y-auto text-center flex flex-col items-center justify-center">
            <h3 className="text-xs font-mono tracking-widest text-[var(--ruby)] uppercase mb-4">
              Synchronized Lyrics
            </h3>
            <p className="text-sm md:text-base text-white/80 leading-relaxed font-medium">
              {currentTrack.lyrics ||
                `[00:15.00] ${title}\n[00:30.00] Performed by ${artist}\n[00:45.00] Streaming in 320kbps Master Lossless Audio\n[01:00.00] Engineered by Rishabh Singh\n[01:15.00] RythemX Spatial Engine`}
            </p>
          </div>
        )}
      </main>

      {/* Bottom Controls Bar */}
      <footer className="relative z-10 w-full max-w-2xl mx-auto flex flex-col gap-4">
        {/* Track Title & Like Button */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h1 className="text-xl md:text-2xl font-bold truncate text-white">{title}</h1>
            <p className="text-sm text-white/60 truncate mt-0.5">{artist}</p>
          </div>
          <button
            type="button"
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
              liked
                ? 'bg-[var(--ruby)]/20 border-[var(--ruby)] text-[var(--ruby)]'
                : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
            }`}
            onClick={() => toggleLike(currentTrack)}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Icon name="heart" size={20} className={liked ? 'icon--filled' : ''} />
          </button>
        </div>

        {/* Progress Slider */}
        <div>
          <div className="progress !p-0">
            <input
              type="range"
              className="range range--progress w-full"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(shownTime, duration || 0)}
              style={{ '--p': `${progressPct}%` } as React.CSSProperties}
              onChange={(e) => setDragTime(Number(e.target.value))}
              onPointerUp={commitSeek}
              onKeyUp={commitSeek}
              onBlur={commitSeek}
              aria-label="Seek"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-white/50 font-mono mt-1.5">
            <span>{fmtTime(shownTime)}</span>
            <span>{fmtTime(duration)}</span>
          </div>
        </div>

        {/* Playback Transport Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className={`icon-btn ${isShuffle ? 'is-on' : ''}`}
            onClick={toggleShuffle}
            aria-label="Shuffle"
          >
            <Icon name="shuffle" size={20} />
          </button>

          <button
            type="button"
            className="icon-btn text-white/90 hover:text-white"
            onClick={playPrev}
            aria-label="Previous"
          >
            <Icon name="prev" size={24} />
          </button>

          <button
            type="button"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--crimson)] to-[var(--ruby)] text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,35,72,0.4)] hover:scale-105 active:scale-95 transition-all"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <span className="spinner" />
            ) : (
              <Icon name={isPlaying ? 'pause' : 'play'} size={28} />
            )}
          </button>

          <button
            type="button"
            className="icon-btn text-white/90 hover:text-white"
            onClick={playNext}
            aria-label="Next"
          >
            <Icon name="next" size={24} />
          </button>

          <button
            type="button"
            className={`icon-btn ${repeatMode !== 'off' ? 'is-on' : ''} relative`}
            onClick={cycleRepeat}
            aria-label="Repeat"
          >
            <Icon name="repeat" size={20} />
            {repeatMode === 'one' && <span className="repeat-one">1</span>}
          </button>
        </div>

        {/* Visualizer Footer Bar */}
        <div className="flex items-center justify-center pt-2">
          <div className="w-48 h-5">
            <Visualizer playing={isPlaying} />
          </div>
        </div>
      </footer>
    </div>
  );
}
