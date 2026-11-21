'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { fetchSongsByQuery, Song } from '@/services/api';

export const AstraSphere3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<any>(null);

  const { isPlaying, currentTrack, playTrack } = usePlayerStore();
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState('TAP SPHERE OR MIC TO SPEAK');
  const [voiceSupported, setVoiceSupported] = useState(true);

  // --- Popularity Selection Engine ---
  const selectMostPopularTrack = (results: Song[], targetQuery: string): Song => {
    if (!results || results.length === 0) return results[0];

    const cleanTarget = targetQuery.toLowerCase().trim();

    // Score and rank candidates
    const scored = [...results].map((song) => {
      let score = 0;
      const cleanName = song.name.toLowerCase();

      // Exact title match gets massive boost
      if (cleanName === cleanTarget) score += 50;
      else if (cleanName.startsWith(cleanTarget)) score += 30;
      else if (cleanName.includes(cleanTarget)) score += 15;

      // Penalize fan covers / karaoke / remixes unless explicitly asked
      if (!cleanTarget.includes('remix') && cleanName.includes('remix')) score -= 10;
      if (cleanName.includes('cover') || cleanName.includes('tribute') || cleanName.includes('instrumental')) {
        score -= 25;
      }

      // Bonus for having primary artists metadata populated
      if (song.primaryArtists && song.primaryArtists.length > 3) score += 10;

      return { song, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].song;
  };

  // --- Voice Command Execution ---
  const handleVoiceCommand = useCallback(async (transcript: string) => {
    setStatusText(`PROCESSING: "${transcript}"`);

    // Clean trigger keywords: "Astra play X", "play X", "listen to X"
    let cleanQuery = transcript
      .replace(/^(astra|hey astra|ok astra|alexa|siri)\s+/i, '')
      .replace(/^(play|stream|listen to|put on|start)\s+/i, '')
      .replace(/\s+(song|track|audio|music)$/i, '')
      .trim();

    if (!cleanQuery) {
      setStatusText('COULD NOT HEAR SONG NAME');
      setTimeout(() => setStatusText('TAP SPHERE OR MIC TO SPEAK'), 2500);
      return;
    }

    setStatusText(`SEARCHING POPULAR MASTER: "${cleanQuery}"...`);

    try {
      const results = await fetchSongsByQuery(cleanQuery);
      if (results && results.length > 0) {
        const topSong = selectMostPopularTrack(results, cleanQuery);
        setStatusText(`PLAYING: ${topSong.name.toUpperCase()}`);
        playTrack(topSong, results);

        // Flash Shader intensity on success
        if (uniformsRef.current) {
          uniformsRef.current.uAudioIntensity.value = 1.0;
        }

        setTimeout(() => {
          setStatusText(`NOW STREAMING 3D: ${topSong.name}`);
        }, 3000);
      } else {
        setStatusText(`NO TRACKS FOUND FOR "${cleanQuery}"`);
        setTimeout(() => setStatusText('TAP SPHERE OR MIC TO SPEAK'), 3000);
      }
    } catch {
      setStatusText('VOICE ENGINE TIMEOUT - TRY AGAIN');
      setTimeout(() => setStatusText('TAP SPHERE OR MIC TO SPEAK'), 2500);
    }
  }, [playTrack]);

  // --- Speech Recognition Trigger ---
  const toggleListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setStatusText('SPEECH RECOGNITION NOT SUPPORTED ON THIS BROWSER');
      return;
    }

    if (isListening) {
      setIsListening(false);
      setStatusText('TAP SPHERE OR MIC TO SPEAK');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Optimized for Indian English & Hindi Phonetics

      recognition.onstart = () => {
        setIsListening(true);
        setStatusText('LISTENING... SAY "PLAY [SONG NAME]"');
      };

      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript;
        setIsListening(false);
        handleVoiceCommand(command);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setStatusText('MICROPHONE ACCESS DENIED OR TIMED OUT');
        setTimeout(() => setStatusText('TAP SPHERE OR MIC TO SPEAK'), 2500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition init error:', err);
      setIsListening(false);
    }
  };

  // --- WebGL Shader Canvas Setup ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

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
        vec3 newPosition = position + normal * (noise * (0.18 + uAudioIntensity * 0.5));
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

        vec3 coreColor = vec3(0.06, 0.02, 0.03);
        vec3 glowColor = vec3(0.94, 0.11, 0.28);
        vec3 edgeColor = vec3(1.0, 0.45, 0.55);

        vec3 color = mix(coreColor, glowColor, fresnel + (vDistortion * 0.35));
        color += edgeColor * pow(fresnel, 3.2) * (1.3 + uAudioIntensity * 1.5);

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

    // Particle Halo
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
      opacity: 0.7
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
      if (isListening) {
        targetIntensity = 0.8 + Math.sin(elapsedTime * 12) * 0.3; // High vibration when listening
      } else if (isPlaying) {
        targetIntensity = 0.45 + Math.sin(elapsedTime * 6) * 0.25; // Bass ripple
      }

      uniforms.uAudioIntensity.value = THREE.MathUtils.lerp(
        uniforms.uAudioIntensity.value,
        targetIntensity,
        0.06
      );

      sphereMesh.rotation.y += isListening ? 0.02 : 0.005;
      particleSystem.rotation.y -= 0.002;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isPlaying, isListening]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 select-none relative overflow-hidden">
      {/* Top Status */}
      <div className="text-center z-10 mb-2">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#EF4444] bg-[#EF4444]/15 px-3 py-1 rounded-full uppercase border border-[#EF4444]/30">
          ASTRA SPATIAL VOICE AI
        </span>
        <h2 className="text-base font-black text-white tracking-wide mt-2">
          {currentTrack ? currentTrack.name : 'Voice Navigation Active'}
        </h2>
        <p className="text-[11px] font-mono text-[#EF4444] tracking-wider mt-1 drop-shadow-md">
          {statusText}
        </p>
      </div>

      {/* 3D Sphere Interactive Canvas */}
      <div
        onClick={toggleListening}
        ref={containerRef}
        className="w-[340px] h-[350px] relative z-10 flex items-center justify-center cursor-pointer transition hover:scale-105 active:scale-95"
      />

      {/* Bottom Voice Action Bar */}
      <div className="z-10 flex items-center gap-4 bg-[#121217]/90 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.9)] mt-2">
        <button
          onClick={toggleListening}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg cursor-pointer ${
            isListening
              ? 'bg-[#EF4444] text-white animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.7)]'
              : 'bg-white/10 text-white hover:bg-[#EF4444]'
          }`}
        >
          {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-5 h-5 text-gray-400" />}
        </button>

        <div className="flex flex-col">
          <span className="text-xs font-bold text-white">
            {isListening ? 'Listening for command...' : 'Tap Mic or Sphere'}
          </span>
          <span className="text-[10px] text-gray-400 font-mono">
            Try: &quot;Astra play 295&quot; or &quot;Play Preet Re&quot;
          </span>
        </div>
      </div>
    </div>
  );
};

export default AstraSphere3D;
