/**
 * ASTRA Wake-Word Facade (delegates to the single astraVoiceEngine singleton)
 * Prevents duplicate SpeechRecognition instances from colliding with active mic input
 */

import { astraVoiceEngine, AstraVoiceState } from './astraVoiceEngine';

export interface WakeWordState {
  isEnabled: boolean;
  isListening: boolean;
  isAwake: boolean;
  transcript: string;
  statusText: string;
}

type WakeListener = (state: WakeWordState) => void;

class AstraWakeFacade {
  public subscribe(listener: WakeListener): () => void {
    return astraVoiceEngine.subscribe((st: AstraVoiceState) => {
      listener({
        isEnabled: st.wakeWordEnabled,
        isListening: st.mode === 'listening',
        isAwake: st.isWakeAwake,
        transcript: st.transcript || st.interimTranscript,
        statusText: st.statusText
      });
    });
  }

  public getState(): WakeWordState {
    const st = astraVoiceEngine.getState();
    return {
      isEnabled: st.wakeWordEnabled,
      isListening: st.mode === 'listening',
      isAwake: st.isWakeAwake,
      transcript: st.transcript || st.interimTranscript,
      statusText: st.statusText
    };
  }

  public setEnabled(enable: boolean) {
    astraVoiceEngine.setWakeWordEnabled(enable);
  }

  public init() {
    // Intentional no-op on initial mount: Do NOT auto-start mic without user gesture
    // (Prevents browser 'not-allowed' / 'audio-capture' on ungestured page loads)
    const saved = typeof window !== 'undefined' && localStorage.getItem('rythemx_wake_word_enabled') === 'true';
    if (saved) {
      // User previously opted into wake-word: arm standby gently
      setTimeout(() => {
        astraVoiceEngine.startPassiveStandby();
      }, 1500);
    }
  }

  public dismissWake() {
    astraVoiceEngine.dismissWake();
  }
}

export const astraWakeWord = new AstraWakeFacade();
