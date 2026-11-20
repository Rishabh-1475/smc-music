'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePlayerStore } from '@/store/playerStore';

export const AstraSphere3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isPlaying, currentTrack } = usePlayerStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const width = container.clientWidth || 340;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- GLSL Shaders for Astra 3D Fluid Sphere ---
    const vertexShader = `
      uniform float uTime;
      uniform float uAudioIntensity;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDistortion;

      // Classic Simplex 3D Noise function
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

        // Fluid noise wave modulation
        float noise = snoise(position * 1.5 + vec3(uTime * 0.4));
        vDistortion = noise;

        vec3 newPosition = position + normal * (noise * (0.2 + uAudioIntensity * 0.45));
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

        // BMW M-Performance Crimson Red and Deep Void Core
        vec3 coreColor = vec3(0.08, 0.02, 0.03);
        vec3 glowColor = vec3(0.94, 0.11, 0.28); // #EF4444
        vec3 edgeColor = vec3(1.0, 0.35, 0.45);

        vec3 color = mix(coreColor, glowColor, fresnel + (vDistortion * 0.3));
        color += edgeColor * pow(fresnel, 3.5) * (1.2 + uAudioIntensity);

        gl_FragColor = vec4(color, 0.95);
      }
    `;

    // --- Mesh & Shader Material ---
    const geometry = new THREE.IcosahedronGeometry(1.5, 64);
    const uniforms = {
      uTime: { value: 0 },
      uAudioIntensity: { value: 0.1 }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true
    });

    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);

    // --- Ambient Orbiting Particle Halo ---
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

    // --- Interactive Mouse Parallax ---
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.8;
      targetRotationX = y * 0.8;
    };

    window.addEventListener('mousemove', handlePointerMove);

    // --- Render Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      uniforms.uTime.value = elapsedTime;
      // Modulate intensity based on playback
      const targetIntensity = isPlaying ? 0.45 + Math.sin(elapsedTime * 6) * 0.2 : 0.08;
      uniforms.uAudioIntensity.value = THREE.MathUtils.lerp(
        uniforms.uAudioIntensity.value,
        targetIntensity,
        0.05
      );

      // Smooth damping rotation
      sphereMesh.rotation.y += 0.005;
      sphereMesh.rotation.x = THREE.MathUtils.lerp(sphereMesh.rotation.x, targetRotationX, 0.05);
      sphereMesh.rotation.y = THREE.MathUtils.lerp(sphereMesh.rotation.y, targetRotationY, 0.05);

      particleSystem.rotation.y -= 0.002;
      particleSystem.rotation.x += 0.001;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      renderer.dispose();
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[68vh] px-4 select-none relative overflow-hidden">
      <div className="text-center z-10 mb-2">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#EF4444] bg-[#EF4444]/15 px-3 py-1 rounded-full uppercase border border-[#EF4444]/30">
          ASTRA SPATIAL 3D KERNEL
        </span>
        <h2 className="text-lg font-black text-white tracking-wide mt-2">
          {currentTrack?.name || 'Astra Voice AI'}
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[260px]">
          {currentTrack?.primaryArtists || 'Interactive GLSL Mesh Waveform'}
        </p>
      </div>

      {/* WebGL Canvas Container */}
      <div ref={containerRef} className="w-[340px] h-[360px] relative z-10 flex items-center justify-center" />

      {/* Atmospheric Controls HUD */}
      <div className="z-10 flex items-center gap-3 bg-[#121217]/80 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] mt-2">
        <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-[#EF4444] animate-ping' : 'bg-zinc-600'}`} />
        <span className="text-[11px] font-mono text-zinc-300">
          {isPlaying ? 'ACTIVE FREQUENCY DISPLACEMENT' : 'IDLE HARMONIC EQUILIBRIUM'}
        </span>
      </div>
    </div>
  );
};

export default AstraSphere3D;
