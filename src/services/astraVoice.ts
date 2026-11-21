/**
 * ASTRA Voice Recognition & Text-To-Speech (TTS) Engine
 * Single-utterance SpeechRecognition, Watchdog Timers, Audio Ducking
 * Package: co.singhsmusic.rhythmx
 */

import { audioEngine } from './audioEngine';
import { parseAstraIntent, NLUResult } from './astraNLU';

export type AstraMode = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface VoiceCallbacks {
  onModeChange: (mode: AstraMode) => void;
  onTranscript: (interim: string, isFinal: boolean) => void;
  onCommand: (result: NLUResult) => void;
  onError: (message: string) => void;
}

class AstraVoiceEngine {
  private recognition: any = null;
  private mode: AstraMode = 'idle';
  private callbacks: VoiceCallbacks | null = null;
  private watchdogTimer: any = null;
  private selectedLang = 'hi-IN';
  private isProcessing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initRecognition();
    }
  }

  private initRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not available in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false; // Single utterance
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = this.selectedLang;

      this.recognition.onstart = () => {
        this.setMode('listening');
        this.resetWatchdog();
      };

      this.recognition.onresult = (event: any) => {
        this.resetWatchdog();
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        const currentText = (final || interim).trim();
        if (this.callbacks && currentText) {
          this.callbacks.onTranscript(currentText, Boolean(final));
        }

        // Active command detector: if final or recognized keywords match, execute immediately
        if (final && !this.isProcessing) {
          this.handleFinalTranscript(final);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[ASTRA] Recognition error:', event.error);
        this.clearWatchdog();
        if (event.error === 'no-speech') {
          this.setMode('idle');
        } else {
          this.setMode('error');
          if (this.callbacks) {
            this.callbacks.onError(`Voice input: ${event.error}`);
          }
        }
      };

      this.recognition.onend = () => {
        this.clearWatchdog();
        if (this.mode === 'listening') {
          this.setMode('idle');
        }
      };
    } catch (err) {
      console.warn('[ASTRA] Init error:', err);
    }
  }

  private resetWatchdog() {
    this.clearWatchdog();
    this.watchdogTimer = setTimeout(() => {
      if (this.mode === 'listening') {
        this.stopListening();
      }
    }, 5000);
  }

  private clearWatchdog() {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private setMode(mode: AstraMode) {
    this.mode = mode;
    if (this.callbacks) {
      this.callbacks.onModeChange(mode);
    }
  }

  private handleFinalTranscript(transcript: string) {
    this.isProcessing = true;
    this.setMode('thinking');

    try {
      this.recognition?.stop();
    } catch {}

    const result = parseAstraIntent(transcript, this.selectedLang);

    if (this.callbacks) {
      this.callbacks.onCommand(result);
    }

    // Speak response
    this.speak(result.response, () => {
      this.setMode('idle');
      this.isProcessing = false;
    });
  }

  public setLanguage(langCode: string) {
    this.selectedLang = langCode;
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  public setCallbacks(callbacks: VoiceCallbacks) {
    this.callbacks = callbacks;
  }

  public startListening() {
    // Unlock audio context on user gesture
    audioEngine.unlockAudio();

    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      this.setMode('error');
      if (this.callbacks) {
        this.callbacks.onError('Speech recognition not supported in this environment.');
      }
      return;
    }

    try {
      this.isProcessing = false;
      this.recognition.lang = this.selectedLang;
      this.recognition.start();
    } catch (err: any) {
      // If already started, stop and restart
      if (err.name === 'InvalidStateError') {
        try {
          this.recognition.stop();
          setTimeout(() => this.recognition.start(), 200);
        } catch {}
      } else {
        console.warn('[ASTRA] Start error:', err);
      }
    }
  }

  public stopListening() {
    this.clearWatchdog();
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.setMode('idle');
  }

  public speak(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      audioEngine.duck();
      this.setMode('speaking');

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.selectedLang;
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      utterance.onend = () => {
        audioEngine.unduck();
        this.setMode('idle');
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        audioEngine.unduck();
        this.setMode('idle');
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      audioEngine.unduck();
      this.setMode('idle');
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    audioEngine.unduck();
    this.setMode('idle');
  }
}

export const astraVoice = new AstraVoiceEngine();
