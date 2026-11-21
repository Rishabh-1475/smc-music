export type AudioCallback = () => void;
export type TimeCallback = (current: number, duration: number) => void;
export type ErrorCallback = (code: number, message: string) => void;

declare global {
  interface Window {
    __rhythmx_audio?: HTMLAudioElement;
  }
}

class GlobalAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private timeCbs: Set<TimeCallback> = new Set();
  private stateCbs: Set<AudioCallback> = new Set();
  private errorCbs: Set<ErrorCallback> = new Set();
  private onEndCb: (() => void) | null = null;
  private onNextCb: (() => void) | null = null;
  private onPrevCb: (() => void) | null = null;

  // Monotonic token to ignore stale abort/error events from previously playing songs
  private loadToken = 0;
  private currentStreamUrls: string[] = [];
  private currentBitrateIndex = 0;
  private currentTitle = '';
  private currentArtist = '';
  private currentArt = '';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    if (typeof window === 'undefined') return;

    if (window.__rhythmx_audio) {
      this.audio = window.__rhythmx_audio;
      return;
    }

    this.audio = new Audio();
    this.audio.preload = 'auto';
    // CRITICAL: DO NOT set crossOrigin = 'anonymous' as Saavn CDN streams do not send CORS headers!
    window.__rhythmx_audio = this.audio;

    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio) return;
      this.timeCbs.forEach((cb) => cb(this.audio!.currentTime, this.audio!.duration || 0));
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (!this.audio) return;
      this.timeCbs.forEach((cb) => cb(this.audio!.currentTime, this.audio!.duration || 0));
    });

    this.audio.addEventListener('play', () => this.notifyState());
    this.audio.addEventListener('playing', () => this.notifyState());
    this.audio.addEventListener('pause', () => this.notifyState());
    this.audio.addEventListener('waiting', () => this.notifyState());

    this.audio.addEventListener('ended', () => {
      if (!this.audio) return;
      const dur = this.audio.duration;
      const cur = this.audio.currentTime;
      // Guard: ONLY trigger ended if track actually played to the end (> 5s total, and currentTime >= duration - 1.5s)
      if (dur > 5 && cur >= dur - 1.5) {
        this.notifyState();
        if (this.onEndCb) this.onEndCb();
      } else {
        console.warn('Premature ended event ignored (cur:', cur, 'dur:', dur, ')');
      }
    });

    this.audio.addEventListener('error', (e) => {
      if (!this.audio || !this.audio.src) return;
      const tokenAtError = this.loadToken;
      const errCode = this.audio.error?.code || 0;
      console.warn(`Audio error code=${errCode} on src: ${this.audio.src}`);

      // Try fallback bitrate on the SAME song (320kbps -> 160kbps -> 96kbps)
      if (
        this.currentStreamUrls.length > 0 &&
        this.currentBitrateIndex < this.currentStreamUrls.length - 1
      ) {
        this.currentBitrateIndex++;
        const fallbackUrl = this.currentStreamUrls[this.currentBitrateIndex];
        console.log(`Switching to fallback bitrate [${this.currentBitrateIndex}]: ${fallbackUrl}`);

        if (this.loadToken === tokenAtError) {
          this.audio.src = fallbackUrl;
          this.audio.load();
          this.audio.play().catch((err) => {
            if (err.name !== 'AbortError') {
              console.warn('Fallback play error:', err);
            }
          });
          return;
        }
      }

      // If all bitrates fail or token changed, stop playback — NEVER loop-skip!
      console.error(`Playback failed for track "${this.currentTitle}". Error code: ${errCode}`);
      this.notifyState();
      this.errorCbs.forEach((cb) => cb(errCode, `Playback failed for "${this.currentTitle}"`));
    });

    this.bindMediaSession();
  }

  private bindMediaSession() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          this.toggle();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          this.toggle();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          if (this.onNextCb) this.onNextCb();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          if (this.onPrevCb) this.onPrevCb();
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined && Number.isFinite(details.seekTime)) {
            this.seek(details.seekTime);
          }
        });
      } catch (err) {
        console.warn('MediaSession handler registration:', err);
      }
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

  public subscribeError(cb: ErrorCallback) {
    this.errorCbs.add(cb);
    return () => this.errorCbs.delete(cb);
  }

  public playTrack(
    url: string,
    streamUrls: string[] = [],
    title?: string,
    artist?: string,
    art?: string
  ) {
    if (!this.audio) this.initAudio();
    if (!this.audio) return;

    if (!url) {
      console.warn('Empty stream URL provided to audioEngine');
      return;
    }

    // Increment monotonic load token to invalidate pending errors from previous tracks
    this.loadToken++;
    const currentToken = this.loadToken;

    this.currentStreamUrls = streamUrls.length > 0 ? streamUrls : [url];
    this.currentBitrateIndex = 0;
    this.currentTitle = title || '';
    this.currentArtist = artist || '';
    this.currentArt = art || '';

    const secureUrl = url.replace('http://', 'https://');

    try {
      this.audio.pause();
    } catch {}

    this.audio.src = secureUrl;
    this.audio.currentTime = 0;
    this.audio.load();

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (err.name !== 'AbortError' && this.loadToken === currentToken) {
          console.warn('Playback deferred or blocked by browser policy:', err);
        }
      });
    }

    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && title) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title,
          artist: artist || 'RhythmX Lossless',
          artwork: art ? [{ src: art, sizes: '512x512', type: 'image/jpeg' }] : []
        });
      } catch (err) {
        console.warn('MediaMetadata sync:', err);
      }
    }
  }

  public toggle() {
    if (!this.audio) this.initAudio();
    if (!this.audio) return;

    if (this.audio.paused) {
      this.audio.play().catch((err) => {
        if (err.name !== 'AbortError') console.warn(err);
      });
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
