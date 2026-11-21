'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type AstraVisualState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

interface Props {
  state?: AstraVisualState;
  onTap?: () => void;
}

export const AstraPlanet3D: React.FC<Props> = ({ state = 'idle', onTap }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 420;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    // Planet tilt (approx 26 degrees like Saturn/Earth)
    planetGroup.rotation.z = THREE.MathUtils.degToRad(-22);
    planetGroup.rotation.x = THREE.MathUtils.degToRad(14);

    // Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(5, 3, 4);
    scene.add(sunLight);

    const crimsonBacklight = new THREE.PointLight(0xff2348, 6, 20);
    crimsonBacklight.position.set(-3, -2, -2);
    scene.add(crimsonBacklight);

    // 1. Planet Core with Volcanic Continents & City Lights Shader
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

    const coreVertexShader = `
      varying vec3 vNormal;
      varying vec3 vPos;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const coreFragmentShader = `
      uniform float uTime;
      uniform float uStateGlow;
      uniform float uPulse;
      varying vec3 vNormal;
      varying vec3 vPos;
      varying vec2 vUv;

      ${simplexNoiseGLSL}

      float fbm(vec3 p) {
        float total = 0.0;
        total += 0.500 * snoise(p);
        total += 0.250 * snoise(p * 2.0);
        total += 0.125 * snoise(p * 4.0);
        return total;
      }

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(cameraPosition - vPos);
        vec3 lightDir = normalize(vec3(5.0, 3.0, 4.0));

        // Diffuse lighting
        float diff = max(dot(normal, lightDir), 0.0);

        // Volcanic surface noise
        vec3 p = vPos * 2.2 + vec3(uTime * 0.05, 0.0, uTime * 0.03);
        float land = fbm(p);

        // Obsidian base rock
        vec3 obsidianDark = vec3(0.031, 0.015, 0.024);
        vec3 obsidianMid = vec3(0.08, 0.02, 0.04);
        vec3 baseColor = mix(obsidianDark, obsidianMid, smoothstep(-0.2, 0.4, land));

        // Molten Crimson Continents
        vec3 moltenCrimson = vec3(0.71, 0.035, 0.145); // #b50925
        vec3 laserRuby = vec3(1.0, 0.137, 0.282);       // #ff2348
        float continentMask = smoothstep(0.08, 0.45, land);
        vec3 continentColor = mix(moltenCrimson, laserRuby, land * 0.5 + 0.5);

        // Twinkling micro city lights on dark side
        float cityNoise = snoise(vPos * 18.0);
        float cityMask = step(0.68, cityNoise) * (1.0 - diff);
        vec3 cityLightColor = vec3(1.0, 0.65, 0.75) * 1.8;

        // Combine surface
        vec3 col = mix(baseColor, continentColor, continentMask);
        col *= (diff * 0.85 + 0.15);
        col += cityMask * cityLightColor * uStateGlow;

        // Atmosphere Fresnel Rim Glow
        float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
        fresnel = pow(fresnel, 2.8);
        vec3 atmoColor = mix(moltenCrimson, laserRuby, fresnel);
        col += atmoColor * (fresnel * (0.8 + uStateGlow * 0.8 + uPulse * 0.4));

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const coreUniforms = {
      uTime: { value: 0 },
      uStateGlow: { value: 0.8 },
      uPulse: { value: 0 }
    };

    const coreGeo = new THREE.SphereGeometry(1.35, 96, 96);
    const coreMat = new THREE.ShaderMaterial({
      vertexShader: coreVertexShader,
      fragmentShader: coreFragmentShader,
      uniforms: coreUniforms
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    planetGroup.add(coreMesh);

    // 2. Secondary Smoky Translucent Cloud Layer
    const cloudVertexShader = `
      varying vec3 vNormal;
      varying vec3 vPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const cloudFragmentShader = `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vPos;
      ${simplexNoiseGLSL}

      void main() {
        vec3 viewDir = normalize(cameraPosition - vPos);
        float fresnel = 1.0 - max(dot(viewDir, normalize(vNormal)), 0.0);
        float cloud = snoise(vPos * 1.8 + vec3(uTime * 0.08, uTime * 0.04, 0.0));
        float alpha = smoothstep(0.15, 0.6, cloud) * 0.35 * (1.0 - fresnel * 0.5);
        vec3 cloudColor = vec3(0.9, 0.3, 0.4);
        gl_FragColor = vec4(cloudColor, alpha);
      }
    `;

    const cloudUniforms = { uTime: { value: 0 } };
    const cloudGeo = new THREE.SphereGeometry(1.385, 64, 64);
    const cloudMat = new THREE.ShaderMaterial({
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      uniforms: cloudUniforms,
      transparent: true,
      depthWrite: false
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    planetGroup.add(cloudMesh);

    // 3. Multi-Band Planetary Saturn-Like Ring Disc
    const ringVertexShader = `
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        vUv = uv;
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const ringFragmentShader = `
      uniform float uTime;
      uniform float uRingSpeed;
      varying vec2 vUv;
      varying vec3 vPos;

      void main() {
        // Distance from ring center
        float dist = length(vPos.xy);
        float normDist = (dist - 1.8) / (3.2 - 1.8);

        // Concentric gaps and bands
        float bands = sin(normDist * 42.0) * 0.5 + 0.5;
        float gap1 = smoothstep(0.28, 0.32, normDist) * (1.0 - smoothstep(0.35, 0.39, normDist));
        float gap2 = smoothstep(0.65, 0.68, normDist) * (1.0 - smoothstep(0.72, 0.75, normDist));
        float gaps = 1.0 - (gap1 * 0.8 + gap2 * 0.9);

        // Crimson to rose-silver gradient
        vec3 innerCrimson = vec3(0.71, 0.035, 0.145);
        vec3 outerLaser = vec3(1.0, 0.137, 0.282);
        vec3 silverShimmer = vec3(0.95, 0.85, 0.9);
        vec3 ringColor = mix(innerCrimson, outerLaser, normDist);
        ringColor = mix(ringColor, silverShimmer, bands * 0.3);

        // Edge fade
        float edgeFade = smoothstep(0.0, 0.08, normDist) * (1.0 - smoothstep(0.92, 1.0, normDist));
        float alpha = edgeFade * gaps * (0.35 + bands * 0.35);

        gl_FragColor = vec4(ringColor, alpha);
      }
    `;

    const ringUniforms = {
      uTime: { value: 0 },
      uRingSpeed: { value: 1.0 }
    };

    const ringGeo = new THREE.RingGeometry(1.8, 3.2, 96);
    const ringMat = new THREE.ShaderMaterial({
      vertexShader: ringVertexShader,
      fragmentShader: ringFragmentShader,
      uniforms: ringUniforms,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    planetGroup.add(ringMesh);

    // 2 Outer Orbital Path Lines
    const orbitPath1Geo = new THREE.TorusGeometry(3.55, 0.008, 8, 96);
    const orbitPath1Mat = new THREE.MeshBasicMaterial({ color: 0xff2348, transparent: true, opacity: 0.25 });
    const orbitPath1 = new THREE.Mesh(orbitPath1Geo, orbitPath1Mat);
    orbitPath1.rotation.x = Math.PI / 2.2;
    planetGroup.add(orbitPath1);

    const orbitPath2Geo = new THREE.TorusGeometry(3.85, 0.006, 8, 96);
    const orbitPath2Mat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.2 });
    const orbitPath2 = new THREE.Mesh(orbitPath2Geo, orbitPath2Mat);
    orbitPath2.rotation.x = -Math.PI / 2.4;
    orbitPath2.rotation.y = Math.PI / 8;
    planetGroup.add(orbitPath2);

    // 4. Orbiting Metallic Moon
    const moonGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.2
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    planetGroup.add(moonMesh);

    // 5. Background Starfield
    const starCount = 180;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 16;
      starPositions[i + 1] = (Math.random() - 0.5) * 16;
      starPositions[i + 2] = -4 - Math.random() * 8;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.035,
      transparent: true,
      opacity: 0.65
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Animation Loop with 5 States
    let animId = 0;
    let isVisible = true;
    let isIntersecting = true;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible || !isIntersecting) return;
      const t = clock.getElapsedTime();
      const st = stateRef.current;

      coreUniforms.uTime.value = t;
      cloudUniforms.uTime.value = t;
      ringUniforms.uTime.value = t;

      // State parameter targets
      let targetRotSpeed = 0.003;
      let targetGlow = 0.8;
      let targetPulse = 0.0;
      let targetRingSpeed = 1.0;

      if (st === 'listening') {
        targetRotSpeed = 0.006;
        targetGlow = 1.4;
        targetPulse = Math.sin(t * 8.0) * 0.5 + 0.5;
        targetRingSpeed = 1.5;
      } else if (st === 'thinking') {
        targetRotSpeed = 0.012;
        targetGlow = 1.3;
        targetPulse = Math.sin(t * 14.0) * 0.4 + 0.6;
        targetRingSpeed = 3.0;
      } else if (st === 'speaking') {
        targetRotSpeed = 0.005;
        targetGlow = 1.6;
        targetPulse = Math.sin(t * 10.0) * 0.7 + 0.3;
        targetRingSpeed = 1.8;
      } else if (st === 'error') {
        targetRotSpeed = 0.001;
        targetGlow = 0.3;
        targetPulse = 0.0;
        targetRingSpeed = 0.2;
      }

      coreUniforms.uStateGlow.value = THREE.MathUtils.lerp(coreUniforms.uStateGlow.value, targetGlow, 0.08);
      coreUniforms.uPulse.value = THREE.MathUtils.lerp(coreUniforms.uPulse.value, targetPulse, 0.1);

      // Core & Cloud rotation
      coreMesh.rotation.y += targetRotSpeed;
      cloudMesh.rotation.y += targetRotSpeed * 1.35;
      ringMesh.rotation.z += targetRotSpeed * 0.6 * targetRingSpeed;

      // Orbiting Moon
      const moonAngle = t * 0.45;
      moonMesh.position.set(
        Math.cos(moonAngle) * 3.4,
        Math.sin(moonAngle) * 0.6,
        Math.sin(moonAngle) * 2.8
      );

      // Slow drift for stars
      starPoints.rotation.z += 0.0003;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 420;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => {
        isIntersecting = entry.isIntersecting;
      }, { threshold: 0.05 });
      observer.observe(container);
    }

    return () => {
      cancelAnimationFrame(animId);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      orbitPath1Geo.dispose();
      orbitPath1Mat.dispose();
      orbitPath2Geo.dispose();
      orbitPath2Mat.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      onClick={onTap}
      ref={containerRef}
      className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] mx-auto flex items-center justify-center select-none cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300"
    />
  );
};

export default AstraPlanet3D;

