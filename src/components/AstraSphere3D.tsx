'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Mic, MicOff, Volume2, Sparkles, Radio } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { fetchSongsByQuery, Song } from '@/services/api';

export const AstraSphere3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  const { isPlaying, currentTrack, playTrack, togglePlay, playNext, playPrev, setVolume, volume } = usePlayerStore();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('TAP SPHERE OR MIC TO SPEAK');
  const [userName, setUserName] = useState('there');

  // --- Alexa / GPT Style Text-to-Speech Engine ---
  const speakAI = useCallback((text: string, onDone?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onDone) onDone();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Select natural AI assistant voices
    const targetVoice = voices.find(v => 
      (v.name.includes('Google') && v.name.includes('US English')) ||
      v.name.includes('Samantha') ||
      v.name.includes('Jenny') ||
      v.name.includes('Zira') ||
      (v.lang === 'en-US' && v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith('en')) || null;

    if (targetVoice) utterance.voice = targetVoice;
    utterance.rate = 1.02;
    utterance.pitch = 1.05;

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
  }, []);

  // --- Initial Personalized Greeting ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const profile = localStorage.getItem('rhythmx_user_profile');
    let name = 'there';
    if (profile) {
      try {
        const parsed = JSON.parse(profile);
        if (parsed.name) name = parsed.name;
      } catch {}
    }
    setUserName(name);

    const timer = setTimeout(() => {
      speakAI(`Hi ${name}, I am Astra. What would you like to listen to?`);
    }, 600);

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speakAI]);

  // --- Popularity & Relevance Filter ---
  const selectMostPopularTrack = (results: Song[], targetQuery: string): Song => {
    if (!results || results.length === 0) return results[0];
    const cleanTarget = targetQuery.toLowerCase().trim();

    const scored = results.map((song) => {
      let score = 0;
      const cleanName = song.name.toLowerCase();

      if (cleanName === cleanTarget) score += 60;
      else if (cleanName.startsWith(cleanTarget)) score += 35;
      else if (cleanName.includes(cleanTarget)) score += 20;

      if (!cleanTarget.includes('remix') && cleanName.includes('remix')) score -= 15;
      if (cleanName.includes('cover') || cleanName.includes('tribute') || cleanName.includes('karaoke')) score -= 30;
      if (song.primaryArtists && song.primaryArtists.length > 2) score += 10;

      return { song, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].song;
  };

  // --- Continuous Voice Command Dispatcher ---
  const handleVoiceCommand = useCallback(async (transcript: string) => {
    const raw = transcript.toLowerCase().trim();
    setStatusText(`HEARD: "${transcript}"`);

    // Transport command checks
    if (raw.includes('pause') || raw.includes('stop')) {
      if (isPlaying) togglePlay();
      speakAI('Paused playback');
      setStatusText('PAUSED');
      return;
    }
    if (raw.includes('resume') || raw.includes('continue') || (raw === 'play' && currentTrack)) {
      if (!isPlaying) togglePlay();
      speakAI('Resuming playback');
      setStatusText('PLAYING');
      return;
    }
    if (raw.includes('next song') || raw.includes('skip') || raw.includes('next track')) {
      playNext();
      speakAI('Playing next track');
      setStatusText('SKIPPED TO NEXT');
      return;
    }
    if (raw.includes('previous song') || raw.includes('go back')) {
      playPrev();
      speakAI('Playing previous track');
      setStatusText('PREVIOUS TRACK');
      return;
    }
    if (raw.includes('mute')) {
      setVolume(0);
      speakAI('Muted audio');
      return;
    }
    if (raw.includes('volume up')) {
      setVolume(Math.min(1, volume + 0.2));
      speakAI('Volume increased');
      return;
    }
    if (raw.includes('volume down')) {
      setVolume(Math.max(0, volume - 0.2));
      speakAI('Volume decreased');
      return;
    }
    if (raw.includes('who are you')) {
      speakAI('I am Astra, your 3D spatial intelligence system inside RhythmX.');
      return;
    }

    // Music Search & Play Execution
    let cleanQuery = transcript
      .replace(/^(astra|hey astra|ok astra|alexa|siri|google)\s+/i, '')
      .replace(/^(play|stream|listen to|search for|find|put on)\s+/i, '')
      .replace(/\s+(song|track|audio|music)$/i, '')
      .trim();

    if (!cleanQuery) {
      speakAI("I didn't catch the song name. Please try again.");
      setStatusText('TRY AGAIN: "PLAY [SONG]"');
      return;
    }

    setStatusText(`SEARCHING: "${cleanQuery.toUpperCase()}"`);
    try {
      const results = await fetchSongsByQuery(cleanQuery);
      if (results && results.length > 0) {
        const topSong = selectMostPopularTrack(results, cleanQuery);
        speakAI(`Playing ${topSong.name}`, () => {
          playTrack(topSong, results);
        });
        setStatusText(`STREAMING 3D: ${topSong.name.toUpperCase()}`);
      } else {
        speakAI(`Sorry, I couldn't find ${cleanQuery} right now.`);
        setStatusText('NO TRACK FOUND');
      }
    } catch {
      speakAI('Error connecting to the stream servers.');
      setStatusText('NETWORK ERROR');
    }
  }, [isPlaying, currentTrack, volume, togglePlay, playNext, playPrev, setVolume, playTrack, speakAI]);

  // --- Resilient Continuous Speech Recognition ---
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setStatusText('TAP SPHERE OR MIC TO SPEAK');
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusText('SPEECH RECOGNITION NOT AVAILABLE IN THIS BROWSER');
      speakAI('Speech recognition is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    stopListening();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setStatusText('LISTENING... SAY "PLAY [SONG]" OR "NEXT"');
      };

      recognition.onresult = (event: any) => {
        const lastIdx = event.results.length - 1;
        const transcript = event.results[lastIdx][0].transcript;
        stopListening();
        handleVoiceCommand(transcript);
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('Speech error:', e.error);
        }
      };

      recognition.onend = () => {
        // Watchdog: auto-restart if user still intended to keep listening
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {}
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  }, [stopListening, handleVoiceCommand, speakAI]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // --- Real-time WebGL Astra Sphere ---
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 340;
    const height = containerRef.current.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const vertexShader = `
      uniform float uTime;
      uniform float uAudioIntensity;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDistortion;

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
        vPosition = position;
        float noise = snoise(position * 1.6 + vec3(uTime * 0.45));
        vDistortion = noise;
        vec3 newPosition = position + normal * (noise * (0.18 + uAudioIntensity * 0.55));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform float uAudioIntensity;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDistortion;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vPosition);
        float fresnel = 1.0 - dot(viewDir, vNormal);
        fresnel = pow(fresnel, 2.5);

        vec3 coreColor = vec3(0.04, 0.01, 0.02);
        vec3 glowColor = vec3(0.94, 0.11, 0.28);
        vec3 edgeColor = vec3(1.0, 0.45, 0.55);

        vec3 color = mix(coreColor, glowColor, fresnel + (vDistortion * 0.35));
        color += edgeColor * pow(fresnel, 3.2) * (1.3 + uAudioIntensity * 1.6);

        gl_FragColor = vec4(color, 0.95);
      }
    `;

    const geometry = new THREE.IcosahedronGeometry(1.5, 64);
    const uniforms = {
      uTime: { value: 0 },
      uAudioIntensity: { value: 0.1 }
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true
    });

    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);

    // Orbital Halo Ring & Particles
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 2.2 + Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = radius * Math.cos(phi);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xef4444,
      size: 0.035,
      transparent: true,
      opacity: 0.75
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      uniforms.uTime.value = elapsedTime;

      let targetIntensity = 0.08;
      if (isSpeaking) {
        targetIntensity = 0.65 + Math.sin(elapsedTime * 14) * 0.35;
      } else if (isListening) {
        targetIntensity = 0.85 + Math.sin(elapsedTime * 10) * 0.3;
      } else if (isPlaying) {
        targetIntensity = 0.45 + Math.sin(elapsedTime * 6) * 0.25;
      }

      uniforms.uAudioIntensity.value = THREE.MathUtils.lerp(
        uniforms.uAudioIntensity.value,
        targetIntensity,
        0.08
      );

      sphereMesh.rotation.y += isListening ? 0.025 : (isSpeaking ? 0.018 : 0.005);
      particleSystem.rotation.y -= 0.002;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isPlaying, isListening, isSpeaking]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 select-none relative overflow-hidden">
      {/* Top Status */}
      <div className="text-center z-10 mb-2">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#EF4444] bg-[#EF4444]/15 px-3 py-1 rounded-full uppercase border border-[#EF4444]/30 inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <Sparkles className="w-3 h-3 text-[#EF4444]" /> ASTRA SPATIAL INTELLIGENCE
        </span>
        <h2 className="text-base font-black text-white tracking-wide mt-2">
          {currentTrack ? currentTrack.name : `Welcome, ${userName}`}
        </h2>
        <p className="text-[11px] font-mono text-[#EF4444] tracking-wider mt-1 drop-shadow-md">
          {statusText}
        </p>
      </div>

      {/* 3D Interactive WebGL Sphere Canvas */}
      <div
        onClick={toggleListening}
        ref={containerRef}
        className="w-[340px] h-[350px] relative z-10 flex items-center justify-center cursor-pointer transition hover:scale-105 active:scale-95"
      />

      {/* Action Controls HUD */}
      <div className="z-10 flex items-center gap-4 bg-[#121217]/90 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.95)] mt-2">
        <button
          onClick={toggleListening}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${
            isListening
              ? 'bg-[#EF4444] text-white animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.8)]'
              : 'bg-white/10 text-white hover:bg-[#EF4444]'
          }`}
        >
          {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-5 h-5 text-zinc-400" />}
        </button>

        <div className="flex flex-col">
          <span className="text-xs font-bold text-white">
            {isListening ? 'Listening continuously...' : (isSpeaking ? 'Astra is speaking...' : 'Tap Mic or Sphere to Command')}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            Commands: &quot;Play [song]&quot;, &quot;Pause&quot;, &quot;Next&quot;, &quot;Volume up&quot;
          </span>
        </div>
      </div>
    </div>
  );
};

export default AstraSphere3D;
