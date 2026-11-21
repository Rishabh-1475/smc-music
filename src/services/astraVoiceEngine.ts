/**
 * ASTRA Unified Voice Engine
 * Single Global Voice Controller across Capacitor 6 Android Native & Web Browsers
 * Eliminates duplicate SpeechRecognition mic conflicts and "cannot input voice" errors
 * Package: co.singhsmusic.rhythmx
 */

import { Capacitor } from '@capacitor/core';
import { audioEngine } from './audioEngine';
import { parseAstraIntent, NLUResult, normalizeIndianQuery } from './astraNLU';
import { fetchSongsByQuery } from './api';
import { usePlayerStore } from '@/store/playerStore';
import { Song } from '@/types/music';

export type AstraVoiceMode = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface AstraVoiceState {
  mode: AstraVoiceMode;
  transcript: string;
  interimTranscript: string;
  statusText: string;
  selectedLang: string;
  wakeWordEnabled: boolean;
  voiceReplies: boolean;
  isWakeAwake: boolean;
  lastExecutedCommand?: string;
  lastResult?: NLUResult;
  lastTrack?: Song;
}

export type AstraVoiceListener = (state: AstraVoiceState) => void;

class AstraVoiceController {
  private mode: AstraVoiceMode = 'idle';
  private transcript = '';
  private interimTranscript = '';
  private statusText = '';
  private selectedLang = 'en-IN';
  private wakeWordEnabled = false;
  private voiceReplies = true;
  private isWakeAwake = false;
  private lastExecutedCommand = '';
  private lastResult?: NLUResult;
  private lastTrack?: Song;

  private listeners: Set<AstraVoiceListener> = new Set();

  // Web Speech API
  private webRecognition: any = null;
  private autoCommitTimer: any = null;
  private silenceTimer: any = null;
  private passiveRestartTimer: any = null;
  private wakeTimeoutTimer: any = null;
  private isProcessing = false;
  private isPassiveStandbyRunning = false;
  private audioContext: AudioContext | null = null;

  // Native Android Speech Recognition Plugin reference
  private nativePlugin: any = null;
  private isNativeListening = false;

  private wakeRegex = /(hey|hi|ok|he|ae)\s*(astra|extra|aastha|astha|aster)|हे\s*एस्ट्रा|एस्ट्रा/i;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedWake = localStorage.getItem('rythemx_wake_word_enabled');
      this.wakeWordEnabled = savedWake === 'true';
      const savedReplies = localStorage.getItem('rythemx_voice_replies');
      this.voiceReplies = savedReplies !== 'false';
      const savedLang = localStorage.getItem('rythemx_voice_lang');
      if (savedLang) this.selectedLang = savedLang;
    }
  }

  // ──────────────────────────────────────────────
  // State & Subscriptions
  // ──────────────────────────────────────────────

  public getState(): AstraVoiceState {
    return {
      mode: this.mode,
      transcript: this.transcript,
      interimTranscript: this.interimTranscript,
      statusText: this.statusText,
      selectedLang: this.selectedLang,
      wakeWordEnabled: this.wakeWordEnabled,
      voiceReplies: this.voiceReplies,
      isWakeAwake: this.isWakeAwake,
      lastExecutedCommand: this.lastExecutedCommand,
      lastResult: this.lastResult,
      lastTrack: this.lastTrack
    };
  }

  public subscribe(listener: AstraVoiceListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public setLanguage(langCode: string) {
    this.selectedLang = langCode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rythemx_voice_lang', langCode);
    }
    this.notify();
  }

  public setVoiceReplies(enabled: boolean) {
    this.voiceReplies = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rythemx_voice_replies', String(enabled));
    }
    this.notify();
  }

  public setWakeWordEnabled(enabled: boolean) {
    this.wakeWordEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rythemx_wake_word_enabled', String(enabled));
    }

    if (!enabled) {
      this.stopPassiveStandby();
    } else {
      // Arms passive standby safely
      this.startPassiveStandby();
    }
    this.notify();
  }

  // ──────────────────────────────────────────────
  // Native Platform Check
  // ──────────────────────────────────────────────

  private isNativePlatform(): boolean {
    try {
      return typeof window !== 'undefined' && Capacitor.isNativePlatform();
    } catch {
      return false;
    }
  }

  private async getNativeSpeechPlugin(): Promise<any> {
    if (this.nativePlugin) return this.nativePlugin;
    try {
      const mod = await import('@capacitor-community/speech-recognition');
      this.nativePlugin = mod.SpeechRecognition;
      return this.nativePlugin;
    } catch (err) {
      console.warn('[ASTRA] Native SpeechRecognition import failed:', err);
      return null;
    }
  }

  // ──────────────────────────────────────────────
  // ACTIVE LISTENING (Direct User Mic Tap)
  // ──────────────────────────────────────────────

  public async startActiveListening(): Promise<void> {
    // 1. Synchronously unlock WebAudio context so playback is never blocked
    audioEngine.unlockAudio();

    // 2. Duck playing music to 15% so mic hears clearly
    audioEngine.duck(0.15);

    // 3. If passive wake-word was running, stop it first to prevent collisions
    this.stopPassiveStandby();
    this.clearAllTimers();

    this.isProcessing = false;
    this.mode = 'listening';
    this.transcript = '';
    this.interimTranscript = '';
    this.statusText = 'Listening... Speak your command';
    this.notify();

    if (this.isNativePlatform()) {
      await this.startNativeActiveListening();
    } else {
      await this.startWebActiveListening();
    }
  }

  public stopActiveListening(): void {
    this.clearAllTimers();
    audioEngine.restoreVolume();

    if (this.isNativePlatform()) {
      this.stopNativeListening();
    } else {
      this.stopWebListening();
    }

    if (this.mode === 'listening') {
      this.mode = 'idle';
      this.statusText = '';
      this.notify();
    }

    // Resume passive standby if enabled
    if (this.wakeWordEnabled) {
      setTimeout(() => this.startPassiveStandby(), 600);
    }
  }

  // ──────────────────────────────────────────────
  // Native Android Speech Recognition Implementation
  // ──────────────────────────────────────────────

  private async startNativeActiveListening(): Promise<void> {
    const SpeechPlugin = await this.getNativeSpeechPlugin();
    if (!SpeechPlugin) {
      // Fallback to Web Speech if native plugin unavailable
      await this.startWebActiveListening();
      return;
    }

    try {
      const avail = await SpeechPlugin.available();
      if (!avail?.available) {
        console.warn('[ASTRA Native] Device speech recognition not available, falling back to Web Speech');
        await this.startWebActiveListening();
        return;
      }

      // Check & request permissions
      let perm = await SpeechPlugin.checkPermissions();
      if (perm.speechRecognition !== 'granted') {
        perm = await SpeechPlugin.requestPermissions();
        if (perm.speechRecognition !== 'granted') {
          this.handleVoiceError(
            'not-allowed',
            'Microphone permission blocked. Please allow Microphone in Android App Permissions.'
          );
          return;
        }
      }

      await SpeechPlugin.removeAllListeners();

      // Listen for streaming partial results
      await SpeechPlugin.addListener('partialResults', (data: { matches: string[] }) => {
        if (data?.matches && data.matches.length > 0) {
          const text = data.matches[0].trim();
          if (text) {
            this.interimTranscript = text;
            this.transcript = text;
            this.notify();

            // 1.1s debounce auto-commit on voice pause
            clearTimeout(this.autoCommitTimer);
            this.autoCommitTimer = setTimeout(() => {
              if (this.mode === 'listening' && !this.isProcessing) {
                this.commitCommand(text);
              }
            }, 1100);
          }
        }
      });

      this.isNativeListening = true;

      // Start recognition
      SpeechPlugin.start({
        language: this.selectedLang,
        maxResults: 3,
        partialResults: true,
        popup: false
      }).then((result: any) => {
        this.isNativeListening = false;
        if (result?.matches && result.matches.length > 0 && !this.isProcessing) {
          this.commitCommand(result.matches[0]);
        }
      }).catch((err: any) => {
        this.isNativeListening = false;
        const msg = String(err?.message || err || '');
        if (msg.includes('no match') || msg.includes('7') || msg.includes('speech')) {
          this.handleVoiceError('no-speech', '');
        } else {
          this.handleVoiceError('audio-capture', msg);
        }
      });
    } catch (err: any) {
      console.warn('[ASTRA Native] Exception during start:', err);
      // Fallback cleanly to web
      await this.startWebActiveListening();
    }
  }

  private async stopNativeListening(): Promise<void> {
    if (!this.nativePlugin || !this.isNativeListening) return;
    try {
      this.isNativeListening = false;
      await this.nativePlugin.stop();
      await this.nativePlugin.removeAllListeners();
    } catch {}
  }

  // ──────────────────────────────────────────────
  // Web Speech API Implementation (Website + Mobile Chrome)
  // ──────────────────────────────────────────────

  private async startWebActiveListening(): Promise<void> {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.handleVoiceError(
        'not-supported',
        'Voice recognition requires Chrome, Edge, or Safari (or type your command below).'
      );
      return;
    }

    try {
      // 1. Pre-check microphone access cleanly WITHOUT locking the mic stream!
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        try {
          if ('permissions' in navigator && (navigator.permissions as any).query) {
            const status = await (navigator.permissions as any).query({ name: 'microphone' }).catch(() => null);
            if (status && status.state === 'prompt') {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              // IMMEDIATELY stop all tracks so the mic is completely freed for SpeechRecognition!
              stream.getTracks().forEach((t) => t.stop());
            }
          }
        } catch (permErr: any) {
          if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
            this.handleVoiceError(
              'not-allowed',
              'Microphone permission blocked. Tap the lock icon in your address bar to allow Microphone.'
            );
            return;
          }
        }
      }

      // 2. Abort any previous instance and wait 120ms
      if (this.webRecognition) {
        try {
          this.webRecognition.onend = null;
          this.webRecognition.onerror = null;
          this.webRecognition.abort();
        } catch {}
      }
      await new Promise((r) => setTimeout(r, 120));

      const rec = new SpeechRecognition();
      rec.lang = this.selectedLang;
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      rec.continuous = false; // Single utterance for active command capture

      rec.onstart = () => {
        this.mode = 'listening';
        this.statusText = 'Listening...';
        this.notify();
      };

      rec.onresult = (event: any) => {
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

        const candidate = (final || interim).trim();
        if (candidate) {
          this.interimTranscript = interim;
          this.transcript = candidate;
          this.notify();

          // If isFinal arrives, commit immediately
          if (final && !this.isProcessing) {
            this.commitCommand(final);
            return;
          }

          // 1.2s silence auto-commit timer for interim speech
          clearTimeout(this.silenceTimer);
          this.silenceTimer = setTimeout(() => {
            if (this.mode === 'listening' && !this.isProcessing && candidate.length > 2) {
              this.commitCommand(candidate);
            }
          }, 1200);
        }
      };

      rec.onerror = (event: any) => {
        const errorType = event?.error || 'unknown';
        console.warn('[ASTRA Voice Error]', errorType, event?.message);

        if (errorType === 'no-speech') {
          this.handleVoiceError('no-speech', '');
        } else if (errorType === 'not-allowed' || errorType === 'service-not-allowed') {
          this.handleVoiceError(
            'not-allowed',
            'Microphone permission blocked. Tap the lock icon in your address bar (or Android App Permissions) to allow Microphone.'
          );
        } else if (errorType === 'audio-capture') {
          this.handleVoiceError(
            'audio-capture',
            'No microphone detected or mic is in use by another app. Close other mic apps and tap Retry.'
          );
        } else if (errorType === 'network') {
          this.handleVoiceError(
            'network',
            'Voice server unreachable (Brave/offline blocks browser voice API). Use Chrome/Edge or type your command below.'
          );
        } else if (errorType === 'aborted') {
          // Ignore cleanly if user canceled or switched modes
          if (this.mode === 'listening') {
            this.mode = 'idle';
            this.notify();
          }
        } else {
          this.handleVoiceError('unknown', `Voice input error: ${errorType}`);
        }
      };

      rec.onend = () => {
        this.clearAllTimers();
        if (this.mode === 'listening' && !this.isProcessing) {
          if (this.transcript.trim().length > 2) {
            this.commitCommand(this.transcript.trim());
          } else {
            this.mode = 'idle';
            this.statusText = '';
            audioEngine.restoreVolume();
            this.notify();
          }
        }
      };

      this.webRecognition = rec;
      rec.start();
    } catch (err: any) {
      console.warn('[ASTRA] Start exception:', err);
      this.handleVoiceError('audio-capture', 'Could not access microphone. Tap retry or use search.');
    }
  }

  private stopWebListening(): void {
    if (this.webRecognition) {
      try {
        this.webRecognition.onend = null;
        this.webRecognition.onerror = null;
        this.webRecognition.abort();
      } catch {}
      this.webRecognition = null;
    }
  }

  // ──────────────────────────────────────────────
  // Diagnostic Error Handling
  // ──────────────────────────────────────────────

  private handleVoiceError(code: string, message: string): void {
    this.clearAllTimers();
    audioEngine.restoreVolume();

    if (code === 'no-speech') {
      this.mode = 'idle';
      this.statusText = "Didn't hear anything — tap the mic and speak clearly.";
      this.notify();
      setTimeout(() => {
        if (this.mode === 'idle') {
          this.statusText = '';
          this.notify();
        }
      }, 3500);
      return;
    }

    this.mode = 'error';
    this.statusText = message;
    this.notify();

    // Push toast to user
    try {
      usePlayerStore.getState().addToast(message, 'error');
    } catch {}

    // Auto-reset from error after 5s
    setTimeout(() => {
      if (this.mode === 'error') {
        this.mode = 'idle';
        this.statusText = '';
        this.notify();
      }
    }, 5000);
  }

  // ──────────────────────────────────────────────
  // Command Execution & All-India NLU
  // ──────────────────────────────────────────────

  public async commitCommand(rawText: string): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.clearAllTimers();

    const clean = rawText.trim();
    if (!clean) {
      this.isProcessing = false;
      this.mode = 'idle';
      this.notify();
      return;
    }

    this.lastExecutedCommand = clean;
    this.mode = 'thinking';
    this.statusText = `Processing: "${clean}"`;
    this.notify();

    // Stop active recognition
    if (this.isNativePlatform()) {
      this.stopNativeListening();
    } else {
      this.stopWebListening();
    }

    try {
      const intent: NLUResult = parseAstraIntent(clean, this.selectedLang);
      this.lastResult = intent;
      const store = usePlayerStore.getState();

      switch (intent.intent) {
        case 'PAUSE': {
          store.togglePlay();
          this.finishCommand('Paused playback', 'संगीत रोक दिया गया है।');
          break;
        }

        case 'RESUME': {
          store.togglePlay();
          this.finishCommand('Resuming playback', 'संगीत फिर से शुरू कर रहे हैं।');
          break;
        }

        case 'NEXT': {
          store.playNext();
          this.finishCommand('Skipping to next track', 'अगला गाना चला रहे हैं।');
          break;
        }

        case 'PREV': {
          store.playPrev();
          this.finishCommand('Playing previous track', 'पिछला गाना चला रहे हैं।');
          break;
        }

        case 'VOLUME_UP': {
          const next = Math.min(1.0, store.volume + 0.2);
          store.setVolume(next);
          this.finishCommand(`Volume ${(next * 100).toFixed(0)}%`, `आवाज़ बढ़ा दी गई है`);
          break;
        }

        case 'VOLUME_DOWN': {
          const next = Math.max(0.1, store.volume - 0.2);
          store.setVolume(next);
          this.finishCommand(`Volume ${(next * 100).toFixed(0)}%`, `आवाज़ कम कर दी गई है`);
          break;
        }

        case 'LIKE': {
          if (store.currentTrack) {
            store.toggleLike(store.currentTrack);
            this.finishCommand('Added to Liked Songs', 'पसंदीदा गानों में जोड़ दिया।');
          } else {
            this.finishCommand('No track is currently playing', 'कोई गाना नहीं चल रहा है।');
          }
          break;
        }

        case 'SHUFFLE': {
          store.toggleShuffle();
          this.finishCommand('Shuffle mode toggled', 'शफ़ल ऑन कर दिया है।');
          break;
        }

        case 'PLAY':
        case 'SEARCH':
        default: {
          const query = intent.query || clean;
          this.statusText = `Searching: "${query}"...`;
          this.notify();

          let songs = await fetchSongsByQuery(query, 1, 15);

          // Transliteration retry if native script returns 0 results
          if ((!songs || songs.length === 0) && /[\u0900-\u0D7F]/.test(query)) {
            const transliterated = normalizeIndianQuery(query);
            if (transliterated && transliterated !== query) {
              songs = await fetchSongsByQuery(transliterated, 1, 15);
            }
          }

          if (songs && songs.length > 0) {
            const track = songs[0];
            this.lastTrack = track;
            // Immediate playback triggers Smart Related Radio queue automatically
            store.playTrack(track, { source: 'astra', sourceLabel: `ASTRA: ${query}` });
            const title = track.name || track.title;
            this.finishCommand(
              `Playing "${title}" in 320kbps Master Lossless`,
              `"${title}" चला रहे हैं...`
            );
          } else {
            this.finishCommand(
              `Could not find "${query}". Try another title or artist.`,
              `"${query}" नहीं मिला। दूसरा गाना बोलें।`
            );
          }
          break;
        }
      }
    } catch (err: any) {
      console.warn('[ASTRA] Command execution error:', err);
      this.handleVoiceError('unknown', 'Command failed. Please try again.');
    } finally {
      this.isProcessing = false;
      audioEngine.restoreVolume();
    }
  }

  private finishCommand(englishText: string, hindiText: string): void {
    const isHindi = this.selectedLang.startsWith('hi') || this.selectedLang.startsWith('bho');
    const spoken = isHindi ? hindiText : englishText;
    this.statusText = spoken;
    this.notify();

    if (this.voiceReplies) {
      this.mode = 'speaking';
      this.notify();
      this.speak(spoken, () => {
        this.mode = 'idle';
        this.notify();
        // Resume passive standby after speaking
        if (this.wakeWordEnabled) {
          setTimeout(() => this.startPassiveStandby(), 500);
        }
      });
    } else {
      this.mode = 'idle';
      this.notify();
      if (this.wakeWordEnabled) {
        setTimeout(() => this.startPassiveStandby(), 500);
      }
    }
  }

  private speak(text: string, onDone?: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onDone) onDone();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = this.selectedLang.startsWith('hi') ? 'hi-IN' : 'en-IN';

      utterance.onend = () => {
        if (onDone) onDone();
      };
      utterance.onerror = () => {
        if (onDone) onDone();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onDone) onDone();
    }
  }

  // ──────────────────────────────────────────────
  // Safe, Non-Conflicting Hands-Free "Hey Astra" Standby
  // ──────────────────────────────────────────────

  public startPassiveStandby(): void {
    if (!this.wakeWordEnabled) return;
    if (this.isPassiveStandbyRunning || this.mode === 'listening' || this.isProcessing) return;

    // NEVER auto-start without SpeechRecognition support
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      this.isPassiveStandbyRunning = true;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = 'hi-IN'; // Dual Hindi / English fuzzy match

      rec.onresult = (event: any) => {
        // Anti-self-trigger: Ignore mic while TTS is speaking
        if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
          return;
        }

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) final += t;
          else interim += t;
        }

        const heard = (final || interim).trim();
        if (!heard) return;

        this.handlePassiveHeard(heard, Boolean(final));
      };

      rec.onerror = (e: any) => {
        // If permission denied or network error, stop passive loop completely
        if (e.error === 'not-allowed' || e.error === 'network' || e.error === 'audio-capture') {
          console.warn('[ASTRA Passive] Disabling standby due to error:', e.error);
          this.isPassiveStandbyRunning = false;
          this.wakeWordEnabled = false;
          this.notify();
          return;
        }
      };

      rec.onend = () => {
        this.isPassiveStandbyRunning = false;
        // Debounced restart if still enabled and not actively listening
        if (this.wakeWordEnabled && this.mode !== 'listening' && !this.isProcessing) {
          clearTimeout(this.passiveRestartTimer);
          this.passiveRestartTimer = setTimeout(() => {
            this.startPassiveStandby();
          }, 450);
        }
      };

      rec.start();
    } catch {
      this.isPassiveStandbyRunning = false;
    }
  }

  public stopPassiveStandby(): void {
    this.isPassiveStandbyRunning = false;
    clearTimeout(this.passiveRestartTimer);
    clearTimeout(this.wakeTimeoutTimer);
  }

  private handlePassiveHeard(text: string, isFinal: boolean): void {
    const match = text.match(this.wakeRegex);

    if (match) {
      const matchIndex = match.index || 0;
      const afterWake = text.slice(matchIndex + match[0].length).trim();

      // One-Breath: "Hey Astra play Kaali Gaadi"
      if (afterWake.length > 2) {
        this.stopPassiveStandby();
        this.commitCommand(afterWake);
        return;
      }

      // Two-Step: "Hey Astra"
      if (!this.isWakeAwake) {
        this.isWakeAwake = true;
        this.statusText = 'How can I assist you?';
        this.playWakeChime();
        audioEngine.duck(0.15);
        this.notify();

        // 8-second auto timeout
        clearTimeout(this.wakeTimeoutTimer);
        this.wakeTimeoutTimer = setTimeout(() => {
          this.dismissWake();
        }, 8000);
      }
      return;
    }

    if (this.isWakeAwake) {
      this.transcript = text;
      this.notify();

      if (isFinal || text.split(' ').length >= 2) {
        this.isWakeAwake = false;
        this.commitCommand(text);
      }
    }
  }

  public dismissWake(): void {
    clearTimeout(this.wakeTimeoutTimer);
    this.isWakeAwake = false;
    this.transcript = '';
    this.statusText = '';
    audioEngine.restoreVolume();
    this.notify();
  }

  private playWakeChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }
      const ctx = this.audioContext;
      if (ctx.state === 'suspended') ctx.resume();

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
    } catch {}
  }

  private clearAllTimers(): void {
    clearTimeout(this.autoCommitTimer);
    clearTimeout(this.silenceTimer);
    clearTimeout(this.passiveRestartTimer);
    clearTimeout(this.wakeTimeoutTimer);
  }
}

export const astraVoiceEngine = new AstraVoiceController();
