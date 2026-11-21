export type AudioCallback = () => void;
export type TimeCallback = (current: number, duration: number) => void;

class GlobalAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private timeCbs: Set<TimeCallback> = new Set();
  private stateCbs: Set<AudioCallback> = new Set();
  private onEndCb: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio) return;
      this.timeCbs.forEach((cb) => cb(this.audio!.currentTime, this.audio!.duration || 0));
    });

    this.audio.addEventListener('play', () => this.notifyState());
    this.audio.addEventListener('pause', () => this.notifyState());
    this.audio.addEventListener('ended', () => {
      this.notifyState();
      if (this.onEndCb) this.onEndCb();
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio playback error on stream URL:', this.audio?.src, e);
      this.notifyState();
    });
  }

  private notifyState() {
    this.stateCbs.forEach((cb) => cb());
  }

  public setOnEnded(cb: () => void) {
    this.onEndCb = cb;
  }

  public playTrack(url: string, title?: string, artist?: string, art?: string) {
    if (!this.audio) this.initAudio();
    if (!this.audio) return;

    if (!url) {
      console.warn('Empty stream URL provided to audioEngine');
      return;
    }

    // Force secure HTTPS protocol to prevent mixed-content blocks on Vercel
    const secureUrl = url.replace('http://', 'https://');

    if (this.audio.src !== secureUrl) {
      this.audio.src = secureUrl;
      this.audio.load();
    }

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Playback deferred or blocked by browser policy:', err);
      });
    }

    if ('mediaSession' in navigator && title) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist: artist || 'RhythmX Lossless',
        artwork: art ? [{ src: art, sizes: '512x512', type: 'image/jpeg' }] : []
      });
    }
  }

  public toggle() {
    if (!this.audio) this.initAudio();
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
