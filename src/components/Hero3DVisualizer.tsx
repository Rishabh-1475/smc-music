'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, Heart, Sparkles, Radio } from 'lucide-react';
import { Song } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  song: Song;
}

export const Hero3DVisualizer: React.FC<Props> = ({ song }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  const { playTrack, togglePlay, currentTrack, isPlaying, toggleLike, likedSongs } = usePlayerStore();
  const isCurrent = currentTrack?.id === song.id;
  const isLiked = likedSongs.some((s) => s.id === song.id);

  // --- Real-time WebGL 3D Holographic Turntable & Astra Wave Ring ---
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const width = 160;
    const height = 160;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Dynamic Studio Lights for Shiny Obsidian Finish ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const crimsonNeonLight = new THREE.PointLight(0xef4444, 5, 8);
    crimsonNeonLight.position.set(-1, -1, 2);
    scene.add(crimsonNeonLight);

    // Group for 3D Turntable Disc
    const turntableGroup = new THREE.Group();
    turntableGroup.rotation.x = 0.45; // 3D Isometric projection
    turntableGroup.rotation.y = -0.3;
    scene.add(turntableGroup);

    // High-Gloss Obsidian Vinyl Disc
    const discGeo = new THREE.CylinderGeometry(1.35, 1.35, 0.06, 64);
    const discMat = new THREE.MeshPhysicalMaterial({
      color: 0x050508,
      metalness: 0.95,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 1.0
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.rotation.x = Math.PI / 2;
    turntableGroup.add(discMesh);

    // Track Album Artwork Center Label
    const labelGeo = new THREE.CircleGeometry(0.8, 64);
    const labelMat = new THREE.MeshBasicMaterial({ color: 0x1f1f2e });
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    textureLoader.load(
      song.imageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        labelMat.map = tex;
        labelMat.needsUpdate = true;
      },
      undefined,
      () => {
        labelMat.color.setHex(0xef4444);
      }
    );

    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.z = 0.035;
    turntableGroup.add(labelMesh);

    // Metallic Center Spindle
    const spindleGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 32);
    const spindleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9, roughness: 0.2 });
    const spindleMesh = new THREE.Mesh(spindleGeo, spindleMat);
    spindleMesh.rotation.x = Math.PI / 2;
    spindleMesh.position.z = 0.05;
    turntableGroup.add(spindleMesh);

    // Astra Harmonic Laser Orbit Ring
    const ringGeo = new THREE.TorusGeometry(1.58, 0.025, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.85
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    turntableGroup.add(ringMesh);

    // Orbiting 3D Particle Cloud
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const posArr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const angle = (i / 3 / particleCount) * Math.PI * 2;
      const radius = 1.75 + Math.random() * 0.35;
      posArr[i] = Math.cos(angle) * radius;
      posArr[i + 1] = Math.sin(angle) * radius;
      posArr[i + 2] = (Math.random() - 0.5) * 0.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xff3b5c,
      size: 0.045,
      transparent: true,
      opacity: 0.9
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    turntableGroup.add(particleSystem);

    // --- Animation Render Loop ---
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isCurrent && isPlaying) {
        turntableGroup.rotation.z -= delta * 2.8;
        ringMesh.rotation.z += delta * 1.5;
        particleSystem.rotation.z -= delta * 0.9;
        crimsonNeonLight.intensity = 4.5 + Math.sin(clock.getElapsedTime() * 8) * 1.5;
      } else {
        turntableGroup.rotation.z -= delta * 0.5; // Idle breathing rotation
        crimsonNeonLight.intensity = 2.5;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [song.imageUrl, isCurrent, isPlaying]);

  // Parallax Pointer Handler
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: -y * 14, y: x * 14 });
  };

  const handlePointerLeave = () => {
    setIsInteracting(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(song);
    }
  };

  return (
    <div className="py-4 px-4 select-none perspective-[1200px]">
      {/* HUD Header */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <p className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
          ASTRA SPATIAL SHOWCASE
        </p>
        <span className="text-[10px] font-mono text-[#EF4444] bg-[#EF4444]/15 px-2.5 py-0.5 rounded-full border border-[#EF4444]/40 flex items-center gap-1 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
          <Sparkles className="w-3 h-3 text-[#EF4444]" /> 3D WEBGL CORE
        </span>
      </div>

      {/* Glossy Obsidian 3D Master Card */}
      <div
        ref={cardRef}
        onPointerEnter={() => setIsInteracting(true)}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleAction}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isInteracting ? 1.02 : 1}, ${isInteracting ? 1.02 : 1}, 1)`,
          transformStyle: 'preserve-3d',
          transition: isInteracting ? 'transform 0.08s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
        className="relative rounded-[28px] overflow-hidden cursor-pointer border border-[#EF4444]/40 bg-gradient-to-br from-[#1C060B] via-[#09080E] to-[#020204] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(239,68,68,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)]"
      >
        {/* Specular Liquid Light Sheen */}
        <div
          style={{
            transform: 'translateZ(30px)',
            background: `radial-gradient(circle at ${(tilt.y / 14 + 1) * 50}% ${(-tilt.x / 14 + 1) * 50}%, rgba(255, 255, 255, 0.3), transparent 60%)`
          }}
          className="absolute inset-0 rounded-[28px] pointer-events-none z-30 opacity-70"
        />

        {/* Ambient Volumetric Flare */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#EF4444]/25 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-950/40 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-20 flex items-center justify-between gap-2">
          {/* Left Metadata & Controls on Z-Elevation */}
          <div style={{ transform: 'translateZ(35px)' }} className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-black text-[#EF4444] bg-[#EF4444]/20 border border-[#EF4444]/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                <Radio className="w-2.5 h-2.5" /> FEATURED MASTER
              </span>
              {isCurrent && isPlaying && (
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-1 bg-[#EF4444] rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                  <span className="w-1 bg-[#EF4444] rounded-full animate-[bounce_0.8s_ease-in-out_0.2s_infinite]" />
                  <span className="w-1 bg-[#EF4444] rounded-full animate-[bounce_0.5s_ease-in-out_0.4s_infinite]" />
                </div>
              )}
            </div>

            <h3 className="text-lg font-black text-white mt-2 truncate tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {song.name}
            </h3>
            <p className="text-xs text-zinc-300 truncate mt-0.5 drop-shadow">{song.primaryArtists}</p>

            <div className="mt-4 flex items-center gap-2.5">
              <button
                onClick={handleAction}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#EF4444] via-rose-600 to-amber-500 text-white font-black text-xs flex items-center gap-2 shadow-[0_0_25px_rgba(239,68,68,0.7)] hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                {isCurrent && isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-white" />
                    <span>PAUSE 3D</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                    <span>STREAM 3D</span>
                  </>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(song);
                }}
                className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:border-[#EF4444] transition shadow-lg cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#EF4444] text-[#EF4444]' : 'text-zinc-300'}`} />
              </button>
            </div>
          </div>

          {/* Right WebGL 3D Holographic Viewport */}
          <div
            style={{ transform: 'translateZ(50px)' }}
            className="relative flex-shrink-0 flex items-center justify-center"
          >
            <div
              ref={canvasRef}
              className="w-[160px] h-[160px] flex items-center justify-center drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero3DVisualizer;
