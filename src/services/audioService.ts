export type AudioCallback = () => void;
export type TimeCallback = (current: number, duration: number) => void;

class GlobalAudioService {
  private audio: HTMLAudioElement | null = null;
  private onTimeUpdateCbs: Set<TimeCallback> = new Set();
  private onStateChangeCbs: Set<AudioCallback> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.crossOrigin = 'anonymous';

      this.audio.addEventListener('timeupdate', () => {
        if (!this.audio) return;
        this.onTimeUpdateCbs.forEach((cb) =>
          cb(this.audio!.currentTime, this.audio!.duration || 0)
        );
      });

      this.audio.addEventListener('play', () => this.notifyState());
      this.audio.addEventListener('pause', () => this.notifyState());
      this.audio.addEventListener('ended', () => this.notifyState());
      this.audio.addEventListener('error', (e) => {
        console.warn('Audio stream error, attempting fallback recovery:', e);
      });
    }
  }

  private notifyState() {
    this.onStateChangeCbs.forEach((cb) => cb());
  }

  public playTrack(url: string, title?: string, artist?: string, art?: string) {
    if (!this.audio) return;
    
    // Ensure clean HTTPS protocol
    const secureUrl = url.replace('http://', 'https://');
    if (this.audio.src !== secureUrl) {
      this.audio.src = secureUrl;
      this.audio.load();
    }

    this.audio.play().catch((err) => {
      console.warn('Playback error (waiting for user interaction):', err);
    });

    if ('mediaSession' in navigator && title) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist: artist || 'RhythmX Lossless',
        artwork: art ? [{ src: art, sizes: '512x512', type: 'image/jpeg' }] : []
      });
    }
  }

  public toggle() {
    if (!this.audio) return;
    if (this.audio.paused) {
      this.audio.play().catch(console.warn);
    } else {
      this.audio.pause();
    }
  }

  public seek(seconds: number) {
    if (this.audio && Number.isFinite(seconds)) {
      this.audio.currentTime = seconds;
    }
  }

  public setVolume(val: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, val));
    }
  }

  public isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }

  public subscribeTime(cb: TimeCallback) {
    this.onTimeUpdateCbs.add(cb);
    return () => this.onTimeUpdateCbs.delete(cb);
  }

  public subscribeState(cb: AudioCallback) {
    this.onStateChangeCbs.add(cb);
    return () => this.onStateChangeCbs.delete(cb);
  }
}

export const audioEngine = new GlobalAudioService();
