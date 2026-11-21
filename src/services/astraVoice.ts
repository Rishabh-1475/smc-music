/**
 * ASTRA Voice Facade (delegates to the single astraVoiceEngine singleton)
 * Prevents multiple SpeechRecognition mic collisions
 */

import { astraVoiceEngine, AstraVoiceMode, AstraVoiceState } from './astraVoiceEngine';
import { NLUResult } from './astraNLU';

export type AstraMode = AstraVoiceMode;

export interface VoiceCallbacks {
  onModeChange: (mode: AstraMode) => void;
  onTranscript: (interim: string, isFinal: boolean) => void;
  onCommand: (result: NLUResult) => void;
  onError: (message: string) => void;
}

class AstraVoiceFacade {
  private callbacks: VoiceCallbacks | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.unsubscribe = astraVoiceEngine.subscribe((state: AstraVoiceState) => {
      if (this.callbacks) {
        this.callbacks.onModeChange(state.mode);
        if (state.interimTranscript || state.transcript) {
          this.callbacks.onTranscript(state.transcript, state.mode !== 'listening');
        }
        if (state.lastResult && state.mode === 'speaking') {
          this.callbacks.onCommand(state.lastResult);
        }
        if (state.mode === 'error' && state.statusText) {
          this.callbacks.onError(state.statusText);
        }
      }
    });
  }

  public setCallbacks(cbs: VoiceCallbacks) {
    this.callbacks = cbs;
    const current = astraVoiceEngine.getState();
    cbs.onModeChange(current.mode);
  }

  public setLanguage(lang: string) {
    astraVoiceEngine.setLanguage(lang);
  }

  public async startListening() {
    await astraVoiceEngine.startActiveListening();
  }

  public stopListening() {
    astraVoiceEngine.stopActiveListening();
  }
}

export const astraVoice = new AstraVoiceFacade();
