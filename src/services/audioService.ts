declare global {
  interface Window {
    __rhythmx_audio?: HTMLAudioElement;
  }
}

export type AudioCallback = () => void;
export type TimeCallback = (current: number, duration: number) => void;

class GlobalAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private timeCbs: Set<TimeCallback> = new Set();
  private stateCbs: Set<AudioCallback> = new Set();
  private onEndCb: (() => void) | null = null;
  private onNextCb: (() => void) | null = null;
  private onPrevCb: (() => void) | null = null;
  private stallTimeout: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Reuse existing window singleton or initialize persistent instance
      if (window.__rhythmx_audio) {
        this.audio = window.__rhythmx_audio;
      } else {
        this.audio = new Audio();
        this.audio.preload = 'auto';
        this.audio.crossOrigin = 'anonymous';
        window.__rhythmx_audio = this.audio;
      }

      this.setupEventListeners();
      this.setupMediaSession();
    }
  }

  private setupEventListeners() {
    if (!this.audio) return;

    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio) return;
      const cur = this.audio.currentTime || 0;
      const dur = this.audio.duration || 0;
      this.timeCbs.forEach((cb) => cb(cur, dur));
    });

    this.audio.addEventListener('play', () => this.notifyState());
    this.audio.addEventListener('pause', () => this.notifyState());

    this.audio.addEventListener('ended', () => {
      this.notifyState();
      if (this.onEndCb) this.onEndCb();
    });

    this.audio.addEventListener('waiting', () => {
      // Auto recovery if waiting takes too long
      this.clearStall();
      this.stallTimeout = setTimeout(() => {
        this.recoverStream();
      }, 5000);
    });

    this.audio.addEventListener('stalled', () => {
      this.clearStall();
      this.stallTimeout = setTimeout(() => {
        this.recoverStream();
      }, 5000);
    });

    this.audio.addEventListener('playing', () => {
      this.clearStall();
      this.notifyState();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('[RhythmX Audio] Stream playback error, triggering auto-recovery:', e);
      this.recoverStream();
    });
  }

  private clearStall() {
    if (this.stallTimeout) {
      clearTimeout(this.stallTimeout);
      this.stallTimeout = null;
    }
  }

  private recoverStream() {
    if (!this.audio || !this.audio.src) return;
    try {
      const currentPos = this.audio.currentTime || 0;
      const currentSrc = this.audio.src;
      this.audio.load();
      this.audio.currentTime = currentPos;
      this.audio.play().catch((err) => console.warn('[RhythmX Audio] Auto-recovery resume failed:', err));
    } catch (err) {
      console.warn('[RhythmX Audio] Stream recovery error:', err);
    }
  }

  private setupMediaSession() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        this.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (this.onPrevCb) this.onPrevCb();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (this.onNextCb) this.onNextCb();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime != null) {
          this.seek(details.seekTime);
        }
      });
    } catch (err) {
      console.warn('[RhythmX Audio] MediaSession handlers setup error:', err);
    }
  }

  private notifyState() {
    this.stateCbs.forEach((cb) => cb());
  }

  public setOnEnded(cb: () => void) {
    this.onEndCb = cb;
  }

  public setOnNext(cb: () => void) {
    this.onNextCb = cb;
  }

  public setOnPrev(cb: () => void) {
    this.onPrevCb = cb;
  }

  public playTrack(url: string, title?: string, artist?: string, art?: string, album?: string) {
    if (!this.audio) return;
    const secureUrl = url.replace('http://', 'https://');
    if (this.audio.src !== secureUrl) {
      this.audio.src = secureUrl;
      this.audio.load();
    }

    this.audio.play().catch((err) => {
      console.warn('[RhythmX Audio] Play interrupted:', err);
    });

    if ('mediaSession' in navigator && title) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist: artist || 'RhythmX Lossless',
        album: album || 'RhythmX',
        artwork: art
          ? [
              { src: art, sizes: '96x96', type: 'image/jpeg' },
              { src: art, sizes: '128x128', type: 'image/jpeg' },
              { src: art, sizes: '256x256', type: 'image/jpeg' },
              { src: art, sizes: '512x512', type: 'image/jpeg' }
            ]
          : []
      });
    }
  }

  public play() {
    if (!this.audio) return;
    this.audio.play().catch(console.warn);
  }

  public pause() {
    if (!this.audio) return;
    this.audio.pause();
  }

  public toggle() {
    if (!this.audio) return;
    if (this.audio.paused) {
      this.audio.play().catch(console.warn);
    } else {
      this.audio.pause();
    }
  }

  public seek(secs: number) {
    if (this.audio && Number.isFinite(secs)) {
      this.audio.currentTime = secs;
    }
  }

  public setVolume(vol: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, vol));
    }
  }

  public getVolume(): number {
    return this.audio ? this.audio.volume : 1;
  }

  public isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }

  public subscribeTime(cb: TimeCallback) {
    this.timeCbs.add(cb);
    return () => this.timeCbs.delete(cb);
  }

  public subscribeState(cb: AudioCallback) {
    this.stateCbs.add(cb);
    return () => this.stateCbs.delete(cb);
  }
}

export const audioEngine = new GlobalAudioEngine();
