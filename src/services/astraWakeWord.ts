/**
 * RYTHEMX Hands-Free "Hey Astra" Wake-Word Engine
 * Background continuous listener with one-breath command execution & WebAudio chime
 * Package: co.singhsmusic.rhythmx
 */

import { audioEngine } from './audioEngine';
import { parseAstraIntent, NLUResult } from './astraNLU';
import { fetchSongsByQuery } from './api';
import { usePlayerStore } from '@/store/playerStore';

export interface WakeWordState {
  isEnabled: boolean;
  isListening: boolean;
  isAwake: boolean;
  transcript: string;
  statusText: string;
}

type WakeListener = (state: WakeWordState) => void;

class AstraWakeEngine {
  private recognition: any = null;
  private isEnabled = false;
  private isAwake = false;
  private isListening = false;
  private transcript = '';
  private statusText = '';
  private listeners: Set<WakeListener> = new Set();
  private restartTimer: any = null;
  private wakeTimeoutTimer: any = null;
  private audioContext: AudioContext | null = null;
  private wakeRegex = /(hey|hi|ok|he|ae)\s*(astra|extra|aastha|astha|aster)|हे\s*एस्ट्रा|एस्ट्रा/i;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rythemx_wake_word_enabled');
      this.isEnabled = saved === 'true';
    }
  }

  public init() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[ASTRA Wake] SpeechRecognition not supported.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = 'hi-IN'; // Dual Hindi/English support

      this.recognition.onstart = () => {
        this.isListening = true;
        this.notify();
      };

      this.recognition.onresult = (event: any) => {
        // Anti-self-trigger: Ignore mic while TTS is speaking
        if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
          return;
        }

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += text;
          } else {
            interim += text;
          }
        }

        const heard = (final || interim).trim();
        if (!heard) return;

        this.handleHeardSpeech(heard, Boolean(final));
      };

      this.recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('[ASTRA Wake] Recognition error:', e.error);
        }
        this.isListening = false;
        this.notify();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.notify();

        // Graceful restart if enabled
        if (this.isEnabled) {
          clearTimeout(this.restartTimer);
          this.restartTimer = setTimeout(() => {
            if (this.isEnabled) {
              this.start();
            }
          }, 350);
        }
      };

      if (this.isEnabled) {
        this.start();
      }
    } catch (err) {
      console.warn('[ASTRA Wake] Init error:', err);
    }
  }

  public subscribe(listener: WakeListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState(): WakeWordState {
    return {
      isEnabled: this.isEnabled,
      isListening: this.isListening,
      isAwake: this.isAwake,
      transcript: this.transcript,
      statusText: this.statusText
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public setEnabled(enable: boolean) {
    this.isEnabled = enable;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rythemx_wake_word_enabled', String(enable));
    }
    if (enable) {
      this.start();
    } else {
      this.stop();
    }
    this.notify();
  }

  public start() {
    if (!this.recognition) {
      this.init();
      return;
    }
    try {
      this.recognition.start();
    } catch (e) {
      // Already running
    }
  }

  public stop() {
    clearTimeout(this.restartTimer);
    clearTimeout(this.wakeTimeoutTimer);
    this.isAwake = false;
    this.statusText = '';
    this.transcript = '';
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.notify();
  }

  public dismissWake() {
    clearTimeout(this.wakeTimeoutTimer);
    this.isAwake = false;
    this.transcript = '';
    this.statusText = '';
    audioEngine.restoreVolume();
    this.notify();
  }

  /**
   * Synthesize a two-tone 120ms acoustic chime on wake detection
   */
  private playWakeChime() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }
      const ctx = this.audioContext;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      // Audio context restricted or muted
    }
  }

  private handleHeardSpeech(text: string, isFinal: boolean) {
    // Check if user spoke wake word
    const match = text.match(this.wakeRegex);

    if (match) {
      const matchIndex = match.index || 0;
      const afterWake = text.slice(matchIndex + match[0].length).trim();

      // If user said "Hey Astra [command]" in one breath:
      if (afterWake.length > 2) {
        this.transcript = afterWake;
        this.statusText = 'Executing command...';
        this.notify();
        this.executeCommand(afterWake);
        return;
      }

      // Otherwise: Two-step wake ("Hey Astra")
      if (!this.isAwake) {
        this.isAwake = true;
        this.transcript = 'Listening...';
        this.statusText = 'How can I assist you?';
        this.playWakeChime();
        audioEngine.duck(0.15);
        this.notify();

        // 8-second auto-timeout if no command follows
        clearTimeout(this.wakeTimeoutTimer);
        this.wakeTimeoutTimer = setTimeout(() => {
          this.dismissWake();
        }, 8000);
      }
      return;
    }

    // If already awake in two-step flow, capture command
    if (this.isAwake) {
      this.transcript = text;
      this.notify();

      if (isFinal || text.split(' ').length >= 2) {
        this.executeCommand(text);
      }
    }
  }

  private async executeCommand(rawCommand: string) {
    clearTimeout(this.wakeTimeoutTimer);
    this.statusText = 'Processing...';
    this.notify();

    const intent: NLUResult = parseAstraIntent(rawCommand);
    const store = usePlayerStore.getState();

    switch (intent.action) {
      case 'play': {
        if (intent.query) {
          this.statusText = `Searching: ${intent.query}`;
          this.notify();
          this.speak(`Playing ${intent.query}`);

          try {
            const results = await fetchSongsByQuery(intent.query, 1, 15);
            if (results && results.length > 0) {
              store.playTrack(results[0], { source: 'astra', sourceLabel: `ASTRA: ${intent.query}` });
              this.statusText = `Playing ${results[0].name}`;
            } else {
              this.statusText = 'No tracks found';
              this.speak('Sorry, I could not find that track.');
            }
          } catch (err) {
            this.statusText = 'Search error';
          }
        } else {
          store.togglePlay();
          this.speak('Resuming playback');
        }
        break;
      }

      case 'pause': {
        store.togglePlay();
        this.speak('Playback paused');
        this.statusText = 'Paused';
        break;
      }

      case 'next': {
        store.playNext();
        this.speak('Skipping track');
        this.statusText = 'Next Track';
        break;
      }

      case 'prev': {
        store.playPrev();
        this.speak('Previous track');
        this.statusText = 'Previous Track';
        break;
      }

      case 'volume_up': {
        const nextVol = Math.min(1, store.volume + 0.2);
        store.setVolume(nextVol);
        this.statusText = `Volume ${(nextVol * 100).toFixed(0)}%`;
        break;
      }

      case 'volume_down': {
        const nextVol = Math.max(0, store.volume - 0.2);
        store.setVolume(nextVol);
        this.statusText = `Volume ${(nextVol * 100).toFixed(0)}%`;
        break;
      }

      case 'like': {
        if (store.currentTrack) {
          store.toggleLike(store.currentTrack);
          this.speak('Track added to liked songs');
          this.statusText = 'Liked';
        }
        break;
      }

      default: {
        // Fallback search
        if (rawCommand.trim().length > 2) {
          this.statusText = `Playing: ${rawCommand}`;
          this.notify();
          try {
            const results = await fetchSongsByQuery(rawCommand, 1, 15);
            if (results && results.length > 0) {
              store.playTrack(results[0], { source: 'astra', sourceLabel: `ASTRA: ${rawCommand}` });
              this.speak(`Playing ${results[0].name}`);
            }
          } catch (e) {}
        }
        break;
      }
    }

    // Auto-dismiss HUD after 2.5 seconds
    setTimeout(() => {
      this.dismissWake();
    }, 2500);
  }

  private speak(phrase: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }
}

export const astraWakeWord = new AstraWakeEngine();
