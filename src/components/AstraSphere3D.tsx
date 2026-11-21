'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Mic, MicOff, Sparkles, Volume2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { fetchSongsByQuery, Song } from '@/services/api';

export const AstraSphere3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const debounceTimerRef = useRef<any>(null);
  const hasGreetedRef = useRef(false);

  const { isPlaying, currentTrack, playTrack, togglePlay, playNext, playPrev } = usePlayerStore();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('TAP SPHERE OR MIC TO ACTIVATE');
  const [userName, setUserName] = useState('Rishabh');

  // Load User Name
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rhythmx_user_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name) setUserName(parsed.name);
        } catch {}
      }
    }
  }, []);

  // Natural AI Voice Synthesis (Alexa/GPT Cadence)
  const speakAI = useCallback((text: string, onDone?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onDone) onDone();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      const naturalVoice = voices.find(v => 
        (v.name.includes('Google') && v.name.includes('US English')) ||
        v.name.includes('Samantha') ||
        v.name.includes('Jenny') ||
        v.name.includes('Zira') ||
        v.lang === 'en-US'
      ) || voices.find(v => v.lang.startsWith('en')) || null;

      if (naturalVoice) utterance.voice = naturalVoice;
      utterance.rate = 1.05;
      utterance.pitch = 1.02;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onDone) onDone();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        if (onDone) onDone();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
      if (onDone) onDone();
    }
  }, []);

  // Voice Command Execution Engine
  const executeCommand = useCallback(async (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    if (!text) return;

    setStatusText(`PARSING: "${text.toUpperCase()}"`);

    // 1. Playback controls
    if (text.includes('pause') || text.includes('stop')) {
      if (isPlaying) togglePlay();
      speakAI('Paused playback');
      setStatusText('PAUSED');
      return;
    }

    if (text.includes('resume') || text.includes('continue')) {
      if (!isPlaying) togglePlay();
      speakAI('Resuming playback');
      setStatusText('PLAYING');
      return;
    }

    if (text.includes('next') || text.includes('skip')) {
      playNext();
      speakAI('Playing next track');
      setStatusText('SKIPPED');
      return;
    }

    if (text.includes('previous') || text.includes('back')) {
      playPrev();
      speakAI('Playing previous track');
      setStatusText('PREVIOUS TRACK');
      return;
    }

    // 2. Music Search & Playback
    let query = text
      .replace(/^(astra|hey astra|ok astra|alexa|siri|computer)\s+/i, '')
      .replace(/^(play|stream|listen to|find|put on|start)\s+/i, '')
      .replace(/\s+(song|track|audio|music)$/i, '')
      .trim();

    if (!query) {
      speakAI("I didn't catch the title. Please say it again.");
      setStatusText('TRY: "PLAY [SONG]"');
      return;
    }

    setStatusText(`SEARCHING MASTER: "${query.toUpperCase()}"...`);

    try {
      const results = await fetchSongsByQuery(query);
      if (results && results.length > 0) {
        // Select official / top popular track
        const topSong = results[0];
        setStatusText(`PLAYING: ${topSong.name.toUpperCase()}`);
        speakAI(`Playing ${topSong.name}`, () => {
          playTrack(topSong, results);
        });
      } else {
        speakAI(`Sorry, I couldn't find ${query}.`);
        setStatusText('NO TRACK FOUND');
      }
    } catch {
      speakAI('Network connection issue. Please try again.');
      setStatusText('SEARCH FAILED');
    }
  }, [isPlaying, togglePlay, playNext, playPrev, playTrack, speakAI]);

  // Stop Microphone
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setStatusText('TAP SPHERE OR MIC TO ACTIVATE');
  }, []);

  // Start Microphone with Real-Time Interim Parser
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setStatusText('SPEECH RECOGNITION NOT SUPPORTED');
      speakAI('Speech recognition is not supported in this browser.');
      return;
    }

    // Greet user on first interaction
    if (!hasGreetedRef.current) {
      hasGreetedRef.current = true;
      speakAI(`Hi ${userName}, I am Astra. Say play followed by any song name.`, () => {
        startListening();
      });
      return;
    }

    window.speechSynthesis.cancel();
    stopListening();

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-IN';

      rec.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setStatusText('LISTENING... SAY "PLAY [SONG]"');
      };

      rec.onresult = (e: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = e.resultIndex; i < e.results.length; ++i) {
          const trans = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalText += trans;
          } else {
            interimText += trans;
          }
        }

        const candidate = (finalText || interimText).trim();
        if (candidate) {
          setStatusText(`HEARD: "${candidate.toUpperCase()}"`);

          // Quick trigger if direct command word is heard
          const lower = candidate.toLowerCase();
          if (lower.startsWith('play ') || lower.startsWith('stream ') || lower.startsWith('pause') || lower.startsWith('next')) {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
              stopListening();
              executeCommand(candidate);
            }, 600);
          } else {
            // Debounce natural sentence
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
              stopListening();
              executeCommand(candidate);
            }, 1400);
          }
        }
      };

      rec.onerror = (err: any) => {
        if (err.error !== 'no-speech') {
          console.warn('Speech recognition status:', err.error);
        }
      };

      rec.onend = () => {
        if (isListeningRef.current) {
          try {
            rec.start();
          } catch {}
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
    }
  }, [userName, stopListening, executeCommand, speakAI]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // WebGL 3D Plasma Sphere
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 360;
    const height = containerRef.current.clientHeight || 380;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const astraGroup = new THREE.Group();
    scene.add(astraGroup);

    const vertexShader = `
      uniform float uTime;
      uniform float uAudio;
      varying vec3 vNormal;
      varying vec3 vPos;
      varying float vNoise;

      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0 );
        vec4 p = permute( permute( permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
      }

      void main() {
        vNormal = normal;
        vPos = position;
        float noise = snoise(position * 1.8 + vec3(uTime * 0.45));
        vNoise = noise;
        vec3 displaced = position + normal * (noise * (0.12 + uAudio * 0.4));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform float uAudio;
      varying vec3 vNormal;
      varying vec3 vPos;
      varying float vNoise;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vPos);
        float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
        fresnel = pow(fresnel, 2.8);

        vec3 deepVoid = vec3(0.04, 0.01, 0.02);
        vec3 crimson = vec3(0.71, 0.04, 0.15); // #B50925
        vec3 ruby = vec3(1.0, 0.14, 0.28);    // #FF2348

        vec3 col = mix(deepVoid, crimson, vNoise * 0.5 + 0.5);
        col = mix(col, ruby, fresnel + uAudio * 0.45);

        gl_FragColor = vec4(col, 0.95);
      }
    `;

    const uniforms = { uTime: { value: 0 }, uAudio: { value: 0.1 } };
    uniformsRef.current = uniforms;

    const coreGeo = new THREE.IcosahedronGeometry(1.25, 64);
    const coreMat = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    astraGroup.add(coreMesh);

    // Smoked Glass Shell
    const shellGeo = new THREE.IcosahedronGeometry(1.45, 32);
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0x111116,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    astraGroup.add(shellMesh);

    // Orbital Laser Rings
    const ring1Geo = new THREE.TorusGeometry(1.9, 0.015, 16, 120);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xFF2348 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    astraGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.1, 0.015, 16, 120);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xB50925 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    astraGroup.add(ring2);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      uniforms.uTime.value = elapsed;

      let targetAudio = 0.05;
      if (isSpeaking) targetAudio = 0.65 + Math.sin(elapsed * 14) * 0.35;
      else if (isListening) targetAudio = 0.85 + Math.sin(elapsed * 8) * 0.25;
      else if (isPlaying) targetAudio = 0.4 + Math.sin(elapsed * 5) * 0.2;

      uniforms.uAudio.value = THREE.MathUtils.lerp(uniforms.uAudio.value, targetAudio, 0.08);

      coreMesh.rotation.y += 0.005;
      ring1.rotation.z += 0.01;
      ring2.rotation.z -= 0.008;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isPlaying, isListening, isSpeaking]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 select-none relative">
      <div className="text-center z-10 mb-2">
        <span className="text-[10px] font-mono font-extrabold tracking-widest text-[#FF2348] bg-[#B50925]/15 border border-[#B50925]/40 px-3 py-1 rounded-full uppercase flex items-center gap-1.5 mx-auto w-fit">
          <Sparkles className="w-3 h-3 text-[#FF2348]" /> ASTRA SPATIAL INTELLIGENCE
        </span>
        <h2 className="text-xl font-black text-white tracking-wide mt-2">
          {currentTrack ? currentTrack.name : `Hi, ${userName}`}
        </h2>
        <p className="text-[11px] font-mono text-[#FF2348] tracking-widest mt-1">
          {statusText}
        </p>
      </div>

      {/* 3D Sphere Interactive Canvas */}
      <div
        onClick={toggleListening}
        ref={containerRef}
        className="w-[360px] h-[380px] relative z-10 flex items-center justify-center cursor-pointer transition hover:scale-105 active:scale-95"
      />

      {/* Control HUD */}
      <div className="z-10 flex items-center gap-4 bg-[#151518]/90 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.9)] mt-2">
        <button
          onClick={toggleListening}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${
            isListening ? 'bg-[#FF2348] text-white animate-pulse shadow-[0_0_25px_rgba(255,35,72,0.8)]' : 'bg-white/10 text-white hover:bg-[#B50925]'
          }`}
        >
          {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-5 h-5 text-gray-400" />}
        </button>
        <div>
          <p className="text-xs font-bold text-white">
            {isListening ? 'Listening in real-time...' : (isSpeaking ? 'Astra is speaking...' : 'Tap Sphere to Talk')}
          </p>
          <p className="text-[10px] text-gray-400 font-mono">
            Commands: &quot;Play 295&quot;, &quot;Pause&quot;, &quot;Next track&quot;
          </p>
        </div>
      </div>
    </div>
  );
};
