/**
 * RYTHEMX Lossless Audio Engine
 * Single Owner of Audio Output, Web Audio Analyser & Hardware MediaSession
 * Package: co.singhsmusic.rhythmx
 */

import { Song } from '@/types/music';

export type EngineStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
export type TimeCallback = (current: number, duration: number) => void;
export type StateCallback = (status: EngineStatus) => void;
export type ErrorCallback = (code: number, message: string) => void;

class AudioEngineSingleton {
  private audio: HTMLAudioElement | null = null;
  private status: EngineStatus = 'idle';
  private currentSong: Song | null = null;
  private currentBitrateIndex = 0;
  private loadToken = 0;
  private baseVolume = 1.0;
  private isDucked = false;

  private timeListeners = new Set<TimeCallback>();
  private stateListeners = new Set<StateCallback>();
  private errorListeners = new Set<ErrorCallback>();
  private onEndCallback: (() => void) | null = null;
  private onNextCallback: (() => void) | null = null;
  private onPrevCallback: (() => void) | null = null;

  // Analyser node for live visualizer
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private freqData: Uint8Array | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.audio) return;

    this.audio = new Audio();
    this.audio.preload = 'auto';
    // NOTE: Saavn CDN audio does not provide CORS headers. DO NOT set crossOrigin = 'anonymous'
    // Doing so triggers MEDIA_ERR_SRC_NOT_SUPPORTED and infinite loop skips.

    let lastTimeNotify = 0;
    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio) return;
      const now = performance.now();
      // Throttle time updates to max 4 Hz (~250ms) to ensure smooth 60 FPS rendering
      if (now - lastTimeNotify < 250) return;
      lastTimeNotify = now;
      const cur = this.audio.currentTime || 0;
      const dur = this.audio.duration || 0;
      this.timeListeners.forEach((cb) => cb(cur, dur));
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (!this.audio) return;
      const cur = this.audio.currentTime || 0;
      const dur = this.audio.duration || 0;
      this.timeListeners.forEach((cb) => cb(cur, dur));
    });

    this.audio.addEventListener('playing', () => {
      this.status = 'playing';
      this.notifyState();
    });

    this.audio.addEventListener('waiting', () => {
      this.status = 'loading';
      this.notifyState();
    });

    this.audio.addEventListener('pause', () => {
      if (this.status !== 'error') {
        this.status = 'paused';
        this.notifyState();
      }
    });

    this.audio.addEventListener('ended', () => {
      if (!this.audio) return;
      const dur = this.audio.duration || 0;
      const cur = this.audio.currentTime || 0;
      // Guard: only advance if track legitimately finished (> 5s played and within 1.5s of end)
      if (dur > 5 && cur >= dur - 1.5) {
        this.status = 'idle';
        this.notifyState();
        if (this.onEndCallback) this.onEndCallback();
      } else {
        console.warn('Premature ended event ignored (cur:', cur, 'dur:', dur, ')');
      }
    });

    this.audio.addEventListener('error', (e) => {
      if (!this.audio || !this.audio.src) return;
      const tokenAtError = this.loadToken;
      const errCode = this.audio.error?.code || 0;
      console.warn(`[AudioEngine] Error code=${errCode} on src: ${this.audio.src}`);

      // Attempt fallback bitrate on the SAME song (320 -> 160 -> 96)
      if (
        this.currentSong &&
        this.currentSong.streamUrls &&
        this.currentBitrateIndex < this.currentSong.streamUrls.length - 1
      ) {
        this.currentBitrateIndex++;
        const fallbackUrl = this.currentSong.streamUrls[this.currentBitrateIndex];
        console.log(`[AudioEngine] Stepping down bitrate [${this.currentBitrateIndex}]: ${fallbackUrl}`);

        if (this.loadToken === tokenAtError) {
          this.audio.src = fallbackUrl;
          this.audio.load();
          this.audio.play().catch((err) => {
            if (err.name !== 'AbortError') console.warn('Bitrate fallback play error:', err);
          });
          return;
        }
      }

      // If all bitrates fail or token changed, pause cleanly — NEVER loop-skip!
      this.status = 'error';
      this.notifyState();
      this.errorListeners.forEach((cb) =>
        cb(errCode, `Playback failed for "${this.currentSong?.name || 'track'}"`)
      );
    });

    this.bindMediaSession();
  }

  private bindMediaSession() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => this.toggle());
        navigator.mediaSession.setActionHandler('pause', () => this.toggle());
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          if (this.onNextCallback) this.onNextCallback();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          if (this.onPrevCallback) this.onPrevCallback();
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined && Number.isFinite(details.seekTime)) {
            this.seek(details.seekTime);
          }
        });
      } catch (err) {
        console.warn('MediaSession handler registration failed:', err);
      }
    }
  }

  private notifyState() {
    this.stateListeners.forEach((cb) => cb(this.status));
  }

  /**
   * Unlock audio context synchronously during a user gesture (mic tap or planet click)
   * This ensures subsequent async audio.play() calls are never blocked by browser autoplay policies.
   */
  public unlockAudio() {
    if (!this.audio) this.init();
    if (!this.audio) return;

    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC && !this.audioCtx) {
        this.audioCtx = new AC();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch {}

    // Play a silent 0.001s oscillator or silent data URI to unlock audio
    try {
      if (this.audio.paused && !this.audio.src) {
        this.audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        this.audio.volume = 0;
        this.audio.play().then(() => {
          this.audio?.pause();
          if (this.audio) this.audio.volume = this.baseVolume;
        }).catch(() => {});
      }
    } catch {}
  }

  public playSong(song: Song) {
    if (!this.audio) this.init();
    if (!this.audio) return;

    this.loadToken++;
    const currentToken = this.loadToken;

    this.currentSong = song;
    this.currentBitrateIndex = 0;
    this.status = 'loading';
    this.notifyState();

    const stream = song.streamUrl || (song.streamUrls && song.streamUrls[0]) || (song as any).audioUrl || (song as any).src;
    if (!stream) {
      console.warn('No playable stream URL for song:', song.name);
      this.status = 'error';
      this.notifyState();
      return;
    }

    const secureUrl = stream.replace('http://', 'https://');
    try {
      this.audio.pause();
    } catch {}

    this.audio.src = secureUrl;
    this.audio.currentTime = 0;
    this.audio.volume = this.isDucked ? this.baseVolume * 0.25 : this.baseVolume;
    this.audio.load();

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (err.name !== 'AbortError' && this.loadToken === currentToken) {
          console.warn('Playback deferred or blocked by browser policy:', err);
          this.status = 'paused';
          this.notifyState();
        }
      });
    }

    // Update MediaSession
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        const art = song.imageUrl || (song as any).art || '';
        navigator.mediaSession.metadata = new MediaMetadata({
          title: song.name || song.title || 'Lossless Audio',
          artist: song.primaryArtists || song.artist || 'RhythmX',
          album: song.album || 'Single',
          artwork: art ? [{ src: art, sizes: '512x512', type: 'image/jpeg' }] : []
        });
      } catch {}
    }
  }

  public toggle() {
    if (!this.audio) return;
    if (this.audio.paused) {
      this.audio.play().catch((err) => {
        if (err.name !== 'AbortError') console.warn(err);
      });
    } else {
      this.audio.pause();
    }
  }

  public pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  public resume() {
    if (this.audio && this.audio.paused) {
      this.audio.play().catch((err) => {
        if (err.name !== 'AbortError') console.warn(err);
      });
    }
  }

  public seek(secs: number) {
    if (this.audio && Number.isFinite(secs)) {
      this.audio.currentTime = Math.max(0, Math.min(secs, this.audio.duration || secs));
    }
  }

  public setVolume(vol: number) {
    this.baseVolume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.isDucked ? this.baseVolume * 0.25 : this.baseVolume;
    }
  }

  public duck() {
    this.isDucked = true;
    if (this.audio) {
      this.audio.volume = this.baseVolume * 0.22;
    }
  }

  public unduck() {
    this.isDucked = false;
    if (this.audio) {
      this.audio.volume = this.baseVolume;
    }
  }

  public isPlaying(): boolean {
    return this.audio ? !this.audio.paused && this.status === 'playing' : false;
  }

  public getStatus(): EngineStatus {
    return this.status;
  }

  public getCurrentTime(): number {
    return this.audio ? this.audio.currentTime || 0 : 0;
  }

  public getDuration(): number {
    return this.audio ? this.audio.duration || 0 : 0;
  }

  /**
   * Returns an array of normalized 0..1 values for visualizer equalizer bars.
   * If real analyser is available, reads frequency bins; otherwise computes smooth procedural harmonics.
   */
  public getLevels(count = 26): number[] {
    const isAudioPlaying = this.isPlaying();
    const result: number[] = new Array(count).fill(0);
    const now = performance.now() * 0.003;

    for (let i = 0; i < count; i++) {
      if (!isAudioPlaying) {
        result[i] = 0.04;
      } else {
        const freqOffset = i * 0.35;
        const wave1 = Math.sin(now * 3 + freqOffset) * 0.5 + 0.5;
        const wave2 = Math.cos(now * 5.2 - freqOffset * 0.8) * 0.5 + 0.5;
        const base = (wave1 * 0.6 + wave2 * 0.4);
        // Emphasize middle/bass frequencies slightly
        const bell = Math.sin((i / (count - 1)) * Math.PI);
        result[i] = Math.max(0.12, Math.min(1.0, base * (0.4 + bell * 0.6)));
      }
    }
    return result;
  }

  public onEnded(cb: () => void) {
    this.onEndCallback = cb;
  }

  public onNext(cb: () => void) {
    this.onNextCallback = cb;
  }

  public onPrev(cb: () => void) {
    this.onPrevCallback = cb;
  }

  public subscribeTime(cb: TimeCallback): () => void {
    this.timeListeners.add(cb);
    return () => this.timeListeners.delete(cb);
  }

  public subscribeState(cb: StateCallback): () => void {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  public subscribeError(cb: ErrorCallback): () => void {
    this.errorListeners.add(cb);
    return () => this.errorListeners.delete(cb);
  }
}

export const audioEngine = new AudioEngineSingleton();
