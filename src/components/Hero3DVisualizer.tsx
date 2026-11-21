'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Play, Pause, Heart, Sparkles, Disc3 } from 'lucide-react';
import { Song } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  song: Song;
}

export const Hero3DVisualizer: React.FC<Props> = ({ song }) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { playTrack, togglePlay, currentTrack, isPlaying, toggleLike, likedSongs } = usePlayerStore();

  const isCurrent = currentTrack?.id === song.id;
  const isLiked = likedSongs.some((s) => s.id === song.id);

  // --- Real-time Three.js 3D Holographic Disc & Crimson Laser Engine ---
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = 130;
    const height = 130;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Lighting Setup for Shiny Obsidian Black ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const redRimLight = new THREE.PointLight(0xef4444, 4, 10);
    redRimLight.position.set(2, 2, 2);
    scene.add(redRimLight);

    const redBackLight = new THREE.PointLight(0x991b1b, 3, 10);
    redBackLight.position.set(-2, -2, -1);
    scene.add(redBackLight);

    // --- Shiny 3D Vinyl Disc Geometry ---
    const discGroup = new THREE.Group();
    discGroup.rotation.x = 0.35; // Isometric tilt
    discGroup.rotation.y = -0.25;
    scene.add(discGroup);

    // Texture Loader for Track Cover
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
    
    // Main Vinyl Disc Material: Ultra-Shiny Obsidian (#030305)
    const vinylGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.05, 64);
    const vinylMat = new THREE.MeshPhysicalMaterial({
      color: 0x050508,
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9
    });
    const vinylMesh = new THREE.Mesh(vinylGeo, vinylMat);
    vinylMesh.rotation.x = Math.PI / 2;
    discGroup.add(vinylMesh);

    // Center Album Art Sticker (Texture or fallback)
    const labelGeo = new THREE.CircleGeometry(0.85, 48);
    const labelMat = new THREE.MeshBasicMaterial({ color: 0x1f1f2e });

    textureLoader.load(
      song.imageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        labelMat.map = tex;
        labelMat.needsUpdate = true;
      },
      undefined,
      () => {
        // Fallback color if blocked
        labelMat.color.setHex(0xef4444);
      }
    );

    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.z = 0.03;
    discGroup.add(labelMesh);

    // Center Spindle Hole
    const spindleGeo = new THREE.CircleGeometry(0.18, 32);
    const spindleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const spindleMesh = new THREE.Mesh(spindleGeo, spindleMat);
    spindleMesh.position.z = 0.035;
    discGroup.add(spindleMesh);

    // Crimson Laser Orbit Ring
    const ringGeo = new THREE.RingGeometry(1.55, 1.58, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    discGroup.add(ringMesh);

    // Orbiting Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const angle = (i / 3 / particleCount) * Math.PI * 2;
      const r = 1.7 + Math.random() * 0.3;
      posArray[i] = Math.cos(angle) * r;
      posArray[i + 1] = Math.sin(angle) * r;
      posArray[i + 2] = (Math.random() - 0.5) * 0.4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xef4444,
      size: 0.05,
      transparent: true,
      opacity: 0.85
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    discGroup.add(particleSystem);

    // --- Render Loop ---
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isCurrent && isPlaying) {
        discGroup.rotation.z -= delta * 2.5; // Smooth rotation when playing
        ringMesh.rotation.z += delta * 1.5;
        particleSystem.rotation.z -= delta * 0.8;
      } else {
        discGroup.rotation.z -= delta * 0.4; // Idle float
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

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(song);
    }
  };

  return (
    <div className="py-4 px-4 select-none">
      {/* Top Section Tag */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-[10px] font-mono font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
          ASTRA SPATIAL SHOWCASE
        </p>
        <span className="text-[10px] font-mono text-[#EF4444] bg-[#EF4444]/15 px-2.5 py-0.5 rounded-full border border-[#EF4444]/30 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#EF4444]" /> 3D WEBGL ENGINE
        </span>
      </div>

      {/* Glossy Obsidian & Crimson 3D Stage Card */}
      <div
        onClick={handleAction}
        className="relative rounded-3xl overflow-hidden cursor-pointer border border-[#EF4444]/40 bg-gradient-to-br from-[#120306] via-[#08080C] to-[#020204] p-5 shadow-[0_20px_45px_rgba(0,0,0,0.95),0_0_30px_rgba(239,68,68,0.25)] transition-all duration-300 hover:border-[#EF4444]/70 active:scale-[0.99]"
      >
        {/* Specular Radial Sheen */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#EF4444]/25 via-transparent to-transparent pointer-events-none blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-950/40 pointer-events-none blur-2xl" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          {/* Left Metadata & Controls */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-black text-[#EF4444] bg-[#EF4444]/20 border border-[#EF4444]/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                FEATURED MASTER
              </span>
              {isCurrent && isPlaying && (
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-1 bg-[#EF4444] rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                  <span className="w-1 bg-[#EF4444] rounded-full animate-[bounce_0.8s_ease-in-out_0.2s_infinite]" />
                  <span className="w-1 bg-[#EF4444] rounded-full animate-[bounce_0.5s_ease-in-out_0.4s_infinite]" />
                </div>
              )}
            </div>

            <h3 className="text-lg font-black text-white mt-2 truncate tracking-tight drop-shadow-lg">
              {song.name}
            </h3>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{song.primaryArtists}</p>

            <div className="mt-4 flex items-center gap-2.5">
              <button
                onClick={handleAction}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#EF4444] via-rose-600 to-amber-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:scale-105 active:scale-95 transition cursor-pointer"
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
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:border-[#EF4444]/50 transition cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#EF4444] text-[#EF4444]' : 'text-zinc-400'}`} />
              </button>
            </div>
          </div>

          {/* Right Interactive 3D WebGL Canvas Disc */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <div
              ref={canvasContainerRef}
              className="w-[130px] h-[130px] flex items-center justify-center drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero3DVisualizer;
