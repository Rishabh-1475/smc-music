'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  coverUrl?: string;
  isPlaying?: boolean;
}

export const HeroModel3D: React.FC<Props> = ({ coverUrl, isPlaying = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 540;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Root Group for pointer-reactive tilt
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const redLight = new THREE.PointLight(0xff2348, 6, 25);
    redLight.position.set(-2, 2, 4);
    scene.add(redLight);

    const rimLight = new THREE.DirectionalLight(0xe2e8f0, 2.5);
    rimLight.position.set(4, 5, -2);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(0xb50925, 4, 15);
    bottomGlow.position.set(0, -3, 2);
    scene.add(bottomGlow);

    // 1. Revolving Glossy Black Vinyl Disc
    const vinylGroup = new THREE.Group();
    rootGroup.add(vinylGroup);
    vinylGroup.rotation.x = Math.PI * 0.18;
    vinylGroup.rotation.y = -Math.PI * 0.15;

    // Procedural Vinyl Canvas Texture with concentric grooves
    const vinylCanvas = document.createElement('canvas');
    vinylCanvas.width = 512;
    vinylCanvas.height = 512;
    const vCtx = vinylCanvas.getContext('2d')!;
    vCtx.fillStyle = '#0a0a0c';
    vCtx.fillRect(0, 0, 512, 512);

    // Concentric grooves
    for (let r = 70; r < 250; r += 2.5) {
      vCtx.beginPath();
      vCtx.arc(256, 256, r, 0, Math.PI * 2);
      vCtx.strokeStyle = (r % 5 === 0) ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.5)';
      vCtx.lineWidth = 1;
      vCtx.stroke();
    }

    // Crimson Center Label (RYTHEMX)
    vCtx.beginPath();
    vCtx.arc(256, 256, 68, 0, Math.PI * 2);
    const grad = vCtx.createRadialGradient(256, 256, 5, 256, 256, 68);
    grad.addColorStop(0, '#ff4d6d');
    grad.addColorStop(0.5, '#b50925');
    grad.addColorStop(1, '#500210');
    vCtx.fillStyle = grad;
    vCtx.fill();
    vCtx.lineWidth = 2;
    vCtx.strokeStyle = '#ff2348';
    vCtx.stroke();

    // Spindle Hole
    vCtx.beginPath();
    vCtx.arc(256, 256, 12, 0, Math.PI * 2);
    vCtx.fillStyle = '#080809';
    vCtx.fill();

    // Brand Label Text
    vCtx.fillStyle = '#ffffff';
    vCtx.font = 'bold 15px sans-serif';
    vCtx.textAlign = 'center';
    vCtx.fillText('RYTHEMX', 256, 235);
    vCtx.font = '10px monospace';
    vCtx.fillStyle = 'rgba(255,255,255,0.7)';
    vCtx.fillText('MASTER 320K', 256, 282);

    const vinylTex = new THREE.CanvasTexture(vinylCanvas);
    const vinylGeo = new THREE.CylinderGeometry(2.35, 2.35, 0.045, 64);
    const vinylMat = new THREE.MeshStandardMaterial({
      map: vinylTex,
      roughness: 0.22,
      metalness: 0.85
    });
    const vinylMesh = new THREE.Mesh(vinylGeo, vinylMat);
    vinylMesh.rotation.x = Math.PI / 2;
    vinylGroup.add(vinylMesh);

    // 2. Floating 3D Album Cover Slab
    const coverGeo = new THREE.BoxGeometry(2.2, 2.2, 0.08);
    // Safe canvas fallback texture for album cover
    const coverCanvas = document.createElement('canvas');
    coverCanvas.width = 512;
    coverCanvas.height = 512;
    const cCtx = coverCanvas.getContext('2d')!;
    const cGrad = cCtx.createLinearGradient(0, 0, 512, 512);
    cGrad.addColorStop(0, '#2d0612');
    cGrad.addColorStop(1, '#0d0407');
    cCtx.fillStyle = cGrad;
    cCtx.fillRect(0, 0, 512, 512);
    cCtx.strokeStyle = 'rgba(255,35,72,0.4)';
    cCtx.lineWidth = 4;
    cCtx.strokeRect(16, 16, 480, 480);
    cCtx.fillStyle = '#ff2348';
    cCtx.font = 'bold 36px sans-serif';
    cCtx.textAlign = 'center';
    cCtx.fillText('RYTHEMX', 256, 256);
    cCtx.font = '16px monospace';
    cCtx.fillStyle = 'rgba(255,255,255,0.6)';
    cCtx.fillText('LOSSLESS 3D', 256, 290);

    const defaultCoverTex = new THREE.CanvasTexture(coverCanvas);
    const coverMat = new THREE.MeshStandardMaterial({
      map: defaultCoverTex,
      roughness: 0.35,
      metalness: 0.2
    });

    const coverMesh = new THREE.Mesh(coverGeo, coverMat);
    coverMesh.position.set(-2.4, 0.5, 0.8);
    coverMesh.rotation.set(0.12, 0.28, -0.08);
    rootGroup.add(coverMesh);

    // Dynamic texture loader with CORS safety
    if (coverUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const dynamicTex = new THREE.Texture(img);
          dynamicTex.needsUpdate = true;
          coverMat.map = dynamicTex;
          coverMat.needsUpdate = true;
        } catch {}
      };
      img.src = coverUrl;
    }

    // 3. Chrome Orbit Ring + Laser Crimson Ring
    const chromeRingGeo = new THREE.TorusGeometry(3.1, 0.032, 16, 120);
    const chromeRingMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.12
    });
    const chromeRing = new THREE.Mesh(chromeRingGeo, chromeRingMat);
    chromeRing.rotation.set(Math.PI / 2.3, 0.3, 0);
    rootGroup.add(chromeRing);

    const laserRingGeo = new THREE.TorusGeometry(3.35, 0.024, 16, 120);
    const laserRingMat = new THREE.MeshBasicMaterial({
      color: 0xff2348,
      transparent: true,
      opacity: 0.85
    });
    const laserRing = new THREE.Mesh(laserRingGeo, laserRingMat);
    laserRing.rotation.set(-Math.PI / 3, 0.45, 0.2);
    rootGroup.add(laserRing);

    // 4. Chrome Headphone Arc
    const headphoneCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-2.8, -0.5, -0.5),
      new THREE.Vector3(-2.5, 3.4, -0.5),
      new THREE.Vector3(2.5, 3.4, -0.5),
      new THREE.Vector3(2.8, -0.5, -0.5)
    );
    const headphoneGeo = new THREE.TubeGeometry(headphoneCurve, 40, 0.08, 12, false);
    const headphoneMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.96,
      roughness: 0.15
    });
    const headphoneMesh = new THREE.Mesh(headphoneGeo, headphoneMat);
    rootGroup.add(headphoneMesh);

    // 5. Glossy Ruby Orb
    const rubyOrbGeo = new THREE.SphereGeometry(0.48, 48, 48);
    const rubyOrbMat = new THREE.MeshPhysicalMaterial({
      color: 0xff2348,
      emissive: 0x680418,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.15,
      transmission: 0.6,
      ior: 1.5
    });
    const rubyOrb = new THREE.Mesh(rubyOrbGeo, rubyOrbMat);
    rootGroup.add(rubyOrb);

    // 6. 3D Equalizer Bar Field (20 translucent prism bars)
    const eqBars: THREE.Mesh[] = [];
    const eqCount = 20;
    const eqGroup = new THREE.Group();
    rootGroup.add(eqGroup);
    eqGroup.position.set(-2.8, -2.2, -0.5);

    for (let i = 0; i < eqCount; i++) {
      const barGeo = new THREE.BoxGeometry(0.16, 1.2, 0.16);
      const isRed = i % 2 === 0;
      const barMat = new THREE.MeshStandardMaterial({
        color: isRed ? 0xff2348 : 0xb50925,
        emissive: isRed ? 0x680418 : 0x30020a,
        roughness: 0.3,
        metalness: 0.6,
        transparent: true,
        opacity: 0.85
      });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.x = i * 0.28;
      bar.position.y = 0.6;
      eqGroup.add(bar);
      eqBars.push(bar);
    }

    // 7. Pointer-Reactive Tilt
    let targetTiltX = 0;
    let targetTiltY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetTiltX = -y * 0.35;
      targetTiltY = x * 0.45;
    };

    window.addEventListener('mousemove', handlePointerMove);

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const active = isPlayingRef.current;

      // Disc Spin
      const spinSpeed = active ? 0.035 : 0.008;
      vinylMesh.rotation.z -= spinSpeed;

      // Orbit Rings rotation
      chromeRing.rotation.z += 0.004;
      laserRing.rotation.z -= 0.007;

      // Ruby Orb orbit path
      const orbAngle = t * (active ? 0.8 : 0.4);
      rubyOrb.position.set(
        Math.cos(orbAngle) * 3.4,
        Math.sin(orbAngle * 0.8) * 1.5 - 0.2,
        Math.sin(orbAngle) * 2.2
      );

      // 3D Equalizer Bars animation
      for (let i = 0; i < eqCount; i++) {
        const bar = eqBars[i];
        const freq = t * (active ? 6.0 : 2.0) + i * 0.45;
        const scale = active
          ? 0.3 + (Math.sin(freq) * 0.5 + 0.5) * 1.4
          : 0.2 + (Math.sin(freq) * 0.5 + 0.5) * 0.4;
        bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, scale, 0.15);
        bar.position.y = (bar.scale.y * 1.2) / 2;
      }

      // Parallax Tilt Damping
      rootGroup.rotation.x = THREE.MathUtils.lerp(rootGroup.rotation.x, targetTiltX, 0.06);
      rootGroup.rotation.y = THREE.MathUtils.lerp(rootGroup.rotation.y, targetTiltY, 0.06);

      // Subtle cover floating bounce
      coverMesh.position.y = 0.5 + Math.sin(t * 1.5) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 540;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      vinylGeo.dispose();
      vinylMat.dispose();
      coverGeo.dispose();
      coverMat.dispose();
      chromeRingGeo.dispose();
      chromeRingMat.dispose();
      laserRingGeo.dispose();
      laserRingMat.dispose();
      headphoneGeo.dispose();
      headphoneMat.dispose();
      rubyOrbGeo.dispose();
      rubyOrbMat.dispose();
      eqBars.forEach((b) => {
        b.geometry.dispose();
        (b.material as THREE.Material).dispose();
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [coverUrl]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[360px] md:h-[440px] flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
    />
  );
};

export default HeroModel3D;

