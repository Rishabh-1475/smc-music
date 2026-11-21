import React, { useEffect, useRef, useState } from 'react';
import AstraPlanet3D from '../components/astra/AstraPlanet3D';
import Icon from '../components/ui/Icon';
import Cover from '../components/ui/Cover';
import { usePlayerStore } from '@/store/playerStore';
import { fetchSongsByQuery } from '@/services/api';
import { astraVoice, AstraMode } from '@/services/astraVoice';
import { astraWakeWord } from '@/services/astraWakeWord';
import {
  SUPPORTED_LANGUAGES,
  LanguageOption,
  parseAstraIntent,
  NLUResult
} from '@/services/astraNLU';

const SUGGESTIONS = [
  'Play Kaali Gaadi',
  'Arijit Singh ke gaane chalao',
  'Play Kalyani Remix',
  'Sidhu Moose Wala ke top songs',
  'Volume tez karo',
  'Next track'
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'astra';
  text: string;
  trackPreview?: any;
}

export default function AstraView() {
  const {
    playTrack,
    togglePlay,
    playNext,
    playPrev,
    setVolume,
    volume,
    toggleLike,
    currentTrack,
    addToast
  } = usePlayerStore();

  const [mode, setMode] = useState<AstraMode>('idle');
  const [selectedLang, setSelectedLang] = useState('hi-IN');
  const [wakeEnabled, setWakeEnabled] = useState(astraWakeWord.getState().isEnabled);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'astra',
      text: 'नमस्ते, मैं एस्ट्रा हूँ। आप क्या सुनना चाहेंगे? (Tap the mic or select a command below)'
    }
  ]);

  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, mode]);

  useEffect(() => {
    astraVoice.setLanguage(selectedLang);
  }, [selectedLang]);

  // Connect voice engine callbacks
  useEffect(() => {
    astraVoice.setCallbacks({
      onModeChange: (m) => setMode(m),
      onTranscript: (t, isFinal) => {
        setTranscript(t);
        if (isFinal) {
          addMessage('user', t);
        }
      },
      onCommand: (result) => handleCommand(result),
      onError: (msg) => {
        addToast(msg, 'error');
        addMessage('astra', `Error: ${msg}`);
      }
    });

    return () => {
      astraVoice.stopListening();
    };
  }, [selectedLang, currentTrack, volume]);

  const addMessage = (sender: 'user' | 'astra', text: string, trackPreview?: any) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}_${Math.random()}`,
        sender,
        text,
        trackPreview
      }
    ]);
  };

  const handleCommand = async (result: NLUResult) => {
    addMessage('astra', result.response);

    switch (result.intent) {
      case 'PAUSE':
      case 'RESUME':
        togglePlay();
        break;

      case 'NEXT':
        playNext();
        break;

      case 'PREV':
        playPrev();
        break;

      case 'VOLUME_UP':
        setVolume(Math.min(1.0, volume + 0.2));
        break;

      case 'VOLUME_DOWN':
        setVolume(Math.max(0.1, volume - 0.2));
        break;

      case 'LIKE':
        if (currentTrack) toggleLike(currentTrack);
        break;

      case 'PLAY':
      case 'SEARCH':
        if (result.query) {
          try {
            const songs = await fetchSongsByQuery(result.query);
            if (songs && songs.length > 0) {
              const song = songs[0];
              playTrack(song, { source: 'astra' });
              addMessage(
                'astra',
                `Streaming "${song.name || song.title}" in 320kbps Master Lossless...`,
                song
              );
            } else {
              addMessage('astra', `Could not find "${result.query}". Try another song name.`);
            }
          } catch (err) {
            addMessage('astra', 'Failed to retrieve audio stream. Please check connection.');
          }
        }
        break;
    }
  };

  const handleMicClick = () => {
    if (mode === 'listening') {
      astraVoice.stopListening();
    } else {
      setTranscript('');
      astraVoice.startListening();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const query = textInput.trim();
    setTextInput('');
    addMessage('user', query);

    const result = parseAstraIntent(query, selectedLang);
    handleCommand(result);
  };

  const handleLanguageChange = (lang: LanguageOption) => {
    setSelectedLang(lang.code);
    addMessage('astra', `${lang.greeting} (${lang.name} activated)`);
    astraVoice.speak(lang.greeting);
  };

  return (
    <div className="astra-view space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* 3D Planet Stage */}
      <section className="relative rounded-3xl bg-gradient-to-b from-[#111114] via-[#0d0d10] to-[#080809] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_60px_rgba(255,35,72,0.12)] p-6 md:p-8 flex flex-col items-center justify-center overflow-hidden">
        {/* Language Selector Dropdown */}
        <div className="w-full flex items-center justify-between z-10 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--ruby)] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-white/80 uppercase">
              ASTRA 3D PLANET // {mode.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-white/50 hidden sm:inline">Language:</label>
            <select
              value={selectedLang}
              onChange={(e) => {
                const found = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
                if (found) handleLanguageChange(found);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-[var(--ruby)] cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#111114] text-white">
                  {lang.native} — {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real Three.js WebGL Planet Scene */}
        <div className="w-full h-[320px] md:h-[400px] flex items-center justify-center relative">
          <AstraPlanet3D state={mode} />
        </div>

        {/* Live Speech Feedback */}
        <div className="z-10 text-center max-w-lg mt-2 min-h-[48px]">
          {mode === 'listening' ? (
            <p className="text-sm font-semibold text-[var(--ruby)] animate-pulse">
              {transcript || 'Listening... Speak in Hindi, Punjabi, Bhojpuri, English...'}
            </p>
          ) : mode === 'thinking' ? (
            <p className="text-sm font-semibold text-amber-400">
              Processing command & querying JioSaavn 320kbps catalog...
            </p>
          ) : mode === 'speaking' ? (
            <p className="text-sm font-semibold text-emerald-400">
              Astra speaking...
            </p>
          ) : (
            <p className="text-xs text-white/50">
              Tap the microphone to speak, or pick a one-touch suggestion below.
            </p>
          )}
        </div>

        {/* Microphone Button */}
        <div className="z-10 mt-4 flex items-center justify-center">
          <button
            type="button"
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              mode === 'listening'
                ? 'bg-[var(--ruby)] text-white scale-110 shadow-[0_0_35px_rgba(255,35,72,0.6)] animate-pulse'
                : 'bg-white/10 hover:bg-white/15 border border-white/15 text-white hover:border-[var(--ruby)] hover:scale-105'
            }`}
            onClick={handleMicClick}
            aria-label={mode === 'listening' ? 'Stop listening' : 'Start voice recognition'}
          >
            <Icon name="mic" size={26} />
          </button>
        </div>

        {/* Hands-Free "Hey Astra" Wake-Word Toggle */}
        <div className="z-10 mt-3 flex items-center justify-center">
          <button
            type="button"
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all ${
              wakeEnabled
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
            }`}
            onClick={() => {
              const next = !wakeEnabled;
              setWakeEnabled(next);
              astraWakeWord.setEnabled(next);
              addToast(
                next
                  ? 'Hands-Free "Hey Astra" Wake-Word Activated!'
                  : 'Hands-Free Wake-Word Paused',
                next ? 'success' : 'info'
              );
            }}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                wakeEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'
              }`}
            />
            Hands-Free "Hey Astra": {wakeEnabled ? 'ALWAYS-ON' : 'OFF'}
          </button>
        </div>
      </section>

      {/* Suggested Command Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SUGGESTIONS.map((sug) => (
          <button
            key={sug}
            type="button"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/10 hover:border-[var(--ruby)]/50 hover:bg-white/[0.08] text-white/80 hover:text-white transition-all flex items-center gap-1.5"
            onClick={() => {
              addMessage('user', sug);
              const res = parseAstraIntent(sug, selectedLang);
              handleCommand(res);
            }}
          >
            <Icon name="bolt" size={12} className="text-[var(--ruby)]" />
            {sug}
          </button>
        ))}
      </div>

      {/* Interactive Chat & Command Panel */}
      <section className="rounded-2xl bg-[#111114] border border-white/10 p-4 md:p-6 shadow-xl flex flex-col h-[280px]">
        <div
          ref={logRef}
          className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-[var(--crimson)] to-[var(--ruby)] text-white'
                    : 'bg-white/[0.05] border border-white/10 text-white/90'
                }`}
              >
                {m.text}
              </div>

              {/* Attached Song Preview Card */}
              {m.trackPreview && (
                <div
                  onClick={() => playTrack(m.trackPreview, { source: 'astra' })}
                  className="mt-2 flex items-center gap-2.5 p-2 rounded-xl bg-black/40 border border-white/10 hover:border-[var(--ruby)]/40 cursor-pointer transition-colors max-w-[80%]"
                >
                  <Cover track={m.trackPreview} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">
                      {m.trackPreview.name || m.trackPreview.title}
                    </div>
                    <div className="text-[10px] text-white/60 truncate">
                      {m.trackPreview.primaryArtists}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[var(--ruby)]/20 text-[var(--ruby)]">
                    PLAY
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Text Command Input Bar */}
        <form onSubmit={handleTextSubmit} className="mt-4 flex items-center gap-2 pt-2 border-t border-white/5">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type a command or song name (e.g. Play Kesariya, Volume 80%)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-[var(--ruby)]"
          />
          <button
            type="submit"
            disabled={!textInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--crimson)] to-[var(--ruby)] text-white text-xs font-semibold hover:brightness-110 disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <Icon name="send" size={14} /> Send
          </button>
        </form>
      </section>
    </div>
  );
}
