'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Mic, MicOff, Sparkles, Send } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { fetchSongsByQuery } from '@/services/api';

import { astraVoiceEngine } from '@/services/astraVoiceEngine';

export const AstraSphere3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<any>(null);
  const debounceTimerRef = useRef<any>(null);
  const hasGreetedRef = useRef(false);

  const { isPlaying, currentTrack, playTrack, togglePlay, playNext, playPrev } = usePlayerStore();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('TAP SPHERE OR MIC TO ACTIVATE');
  const [userName, setUserName] = useState('Rishabh');
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    const unsub = astraVoiceEngine.subscribe((st) => {
      setIsListening(st.mode === 'listening');
      setIsSpeaking(st.mode === 'speaking');
      if (st.statusText) setStatusText(st.statusText.toUpperCase());
    });
    return unsub;
  }, []);

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

  const speakAI = useCallback((text: string, onDone?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onDone) onDone();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const assistantVoice = voices.find(v =>
        (v.name.includes('Google') && v.name.includes('US English')) ||
        v.name.includes('Samantha') ||
        v.name.includes('Jenny') ||
        v.name.includes('Karen') ||
        v.lang.startsWith('en')
      ) || null;

      if (assistantVoice) utterance.voice = assistantVoice;
      utterance.rate = 1.04;
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
    } catch {
      setIsSpeaking(false);
      if (onDone) onDone();
    }
  }, []);

  const executeVoiceIntent = useCallback(async (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    if (!text) return;

    setStatusText(`HEARD: "${text.toUpperCase()}"`);

    if (text.includes('pause') || text.includes('stop')) {
      if (isPlaying) togglePlay();
      speakAI('Playback paused.');
      setStatusText('PAUSED');
      return;
    }

    if (text.includes('resume') || text.includes('continue')) {
      if (!isPlaying) togglePlay();
      speakAI('Resuming playback.');
      setStatusText('PLAYING');
      return;
    }

    if (text.includes('next') || text.includes('skip')) {
      playNext();
      speakAI('Skipping track.');
      setStatusText('SKIPPED');
      return;
    }

    if (text.includes('previous') || text.includes('back')) {
      playPrev();
      speakAI('Playing previous track.');
      setStatusText('PREVIOUS TRACK');
      return;
    }

    let query = text
      .replace(/^(astra|hey astra|ok astra|alexa|siri|computer)\s+/i, '')
      .replace(/^(play|stream|listen to|find|put on|start)\s+/i, '')
      .replace(/\s+(song|track|audio|music)$/i, '')
      .trim();

    if (!query) {
      speakAI("I didn't catch the title. Say play followed by a song name.");
      setStatusText('TRY: "PLAY [SONG]"');
      return;
    }

    setStatusText(`SEARCHING MASTER: "${query.toUpperCase()}"...`);

    try {
      const results = await fetchSongsByQuery(query);
      if (results && results.length > 0) {
        const topSong = results[0];
        setStatusText(`PLAYING: ${topSong.name.toUpperCase()}`);
        speakAI(`Playing ${topSong.name}`, () => {
          playTrack(topSong, results);
        });
      } else {
        speakAI(`Sorry, I could not find ${query}.`);
        setStatusText('NO TRACK FOUND');
      }
    } catch {
      speakAI('Network error while searching.');
      setStatusText('SEARCH FAILED');
    }
  }, [isPlaying, togglePlay, playNext, playPrev, playTrack, speakAI]);

  const stopListening = useCallback(() => {
    astraVoiceEngine.stopActiveListening();
  }, []);

  const startListening = useCallback(() => {
    astraVoiceEngine.startActiveListening();
  }, []);

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const cmd = textInput.trim();
    setTextInput('');
    executeVoiceIntent(cmd);
  };

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const redPoint = new THREE.PointLight(0xff2348, 6, 15);
    redPoint.position.set(0, 0, 3);
    scene.add(redPoint);

    // Simplex Noise GLSL Functions
    const simplexNoiseGLSL = `
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
    `;

    const vertexShader = `
      uniform float uTime;
      uniform float uAudio;
      varying vec3 vNormal;
      varying vec3 vPos;
      varying float vNoise;

      ${simplexNoiseGLSL}

      void main() {
        vNormal = normal;
        vPos = position;
        float noise = snoise(position * 1.8 + vec3(uTime * 0.3));
        vNoise = noise;
        // Very subtle displacement for silky smooth glossy plasma orb
        vec3 displaced = position + normal * (noise * (0.025 + uAudio * 0.055));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform float uAudio;
      varying vec3 vNormal;
      varying vec3 vPos;
      varying float vNoise;

      ${simplexNoiseGLSL}

      float fbm(vec3 p) {
        float f = 0.0;
        f += 0.500 * snoise(p);
        f += 0.250 * snoise(p * 2.0);
        f += 0.125 * snoise(p * 4.0);
        return f;
      }

      void main() {
        vec3 viewDir = normalize(cameraPosition - vPos);
        float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
        fresnel = pow(fresnel, 2.5);

        // Deep obsidian/ruby palette
        vec3 deepCore = vec3(0.086, 0.008, 0.031);   // #160208
        vec3 midCrimson = vec3(0.408, 0.016, 0.094);  // #680418
        vec3 hotRuby = vec3(1.0, 0.137, 0.282);       // #FF2348

        // FBM magma veins
        float veins = fbm(vPos * 2.5 + vec3(uTime * 0.2));
        veins = smoothstep(0.1, 0.65, veins);

        vec3 color = mix(deepCore, midCrimson, vNoise * 0.5 + 0.5);
        color = mix(color, hotRuby, veins * 0.45 + (uAudio * 0.3));
        
        // Specular & Fresnel Rim Glow
        color += hotRuby * fresnel * (0.55 + uAudio * 0.5);
        color += vec3(1.0, 0.9, 0.95) * pow(fresnel, 4.5) * 0.4;

        gl_FragColor = vec4(color, 0.96);
      }
    `;

    const uniforms = { uTime: { value: 0 }, uAudio: { value: 0.1 } };
    uniformsRef.current = uniforms;

    // High-resolution smooth sphere
    const coreGeo = new THREE.SphereGeometry(1.35, 96, 96);
    const coreMat = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    astraGroup.add(coreMesh);

    // Orbital Rings
    const ring1Geo = new THREE.TorusGeometry(1.95, 0.012, 16, 120);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xFF2348, transparent: true, opacity: 0.45 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    astraGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.15, 0.012, 16, 120);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xB50925, transparent: true, opacity: 0.35 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    astraGroup.add(ring2);

    // Star particles
    const starCount = 120;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 3.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = radius * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xFF2348, size: 0.035, transparent: true, opacity: 0.6 });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      uniforms.uTime.value = elapsed;

      let targetAudio = 0.1;
      if (isSpeaking) targetAudio = 0.55 + Math.sin(elapsed * 12) * 0.25;
      else if (isListening) targetAudio = 0.7 + Math.sin(elapsed * 8) * 0.25;
      else if (isPlaying) targetAudio = 0.4 + Math.sin(elapsed * 4) * 0.15;

      uniforms.uAudio.value = THREE.MathUtils.lerp(uniforms.uAudio.value, targetAudio, 0.06);

      coreMesh.rotation.y += 0.004;
      ring1.rotation.z += 0.008;
      ring2.rotation.z -= 0.006;
      starPoints.rotation.y += 0.0008;

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
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 select-none relative max-w-2xl mx-auto">
      <div className="text-center z-10 mb-2">
        <span className="text-[10px] font-mono font-extrabold tracking-widest text-[#FF2348] bg-[#B50925]/20 border border-[#B50925]/50 px-3 py-1 rounded-full uppercase flex items-center gap-1.5 mx-auto w-fit shadow-[0_0_15px_rgba(255,35,72,0.3)]">
          <Sparkles className="w-3 h-3 text-[#FF2348]" /> NOIR//SOUND ASTRA SPATIAL AI
        </span>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-wide mt-2 font-['Space_Grotesk']">
          {currentTrack ? currentTrack.name : `Hi, ${userName}`}
        </h2>
        <p className="text-[11px] font-mono text-[#FF2348] tracking-widest mt-1">
          {statusText}
        </p>
      </div>

      {/* WebGL Canvas Container */}
      <div
        onClick={toggleListening}
        ref={containerRef}
        className="w-[360px] h-[380px] relative z-10 flex items-center justify-center cursor-pointer transition hover:scale-105 active:scale-95"
      />

      {/* Mic Control Bar */}
      <div className="z-10 flex items-center gap-4 bg-[#151518]/90 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.9)] mt-1">
        <button
          onClick={toggleListening}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg cursor-pointer ${
            isListening
              ? 'bg-[#FF2348] text-white animate-pulse shadow-[0_0_25px_rgba(255,35,72,0.8)]'
              : 'bg-white/10 text-white hover:bg-[#B50925]'
          }`}
        >
          {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-5 h-5 text-gray-400" />}
        </button>
        <div>
          <p className="text-xs font-bold text-white">
            {isListening ? 'Listening in real-time...' : isSpeaking ? 'Astra is speaking...' : 'Tap Sphere or Mic to Talk'}
          </p>
          <p className="text-[10px] text-gray-400 font-mono">
            Commands: &quot;Play [song]&quot;, &quot;Pause&quot;, &quot;Next&quot;
          </p>
        </div>
      </div>

      {/* Text Command Input Fallback */}
      <form onSubmit={handleTextSubmit} className="z-10 w-full max-w-md flex items-center gap-2 mt-4 px-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder='Type command: e.g. "Play Arijit Singh" or "Next"...'
          className="flex-1 bg-[#151518]/90 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF2348] transition font-sans"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B50925] to-[#FF2348] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
