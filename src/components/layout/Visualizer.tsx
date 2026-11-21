import React, { useEffect, useRef } from 'react';
import { audioEngine } from '@/services/audioEngine';

const BARS = 26;

interface VisualizerProps {
  playing?: boolean;
}

/** Mirrored equalizer bars. Runs its animation loop only while audio is playing. */
export default function Visualizer({ playing = false }: VisualizerProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const vals = new Array(BARS).fill(0);
    let raf = 0;
    let alive = true;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();

    const ro = new ResizeObserver(() => {
      fit();
      draw();
    });
    ro.observe(canvas);

    function draw() {
      if (!canvas || !ctx) return;
      const { width: w, height: h } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, w, h);
      const gap = 3;
      const bw = Math.max(2, (w - gap * (BARS - 1)) / BARS);
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#FF2348');
      grad.addColorStop(0.5, '#B50925');
      grad.addColorStop(1, '#FF2348');
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(255, 35, 72, 0.55)';
      ctx.shadowBlur = 8;

      for (let i = 0; i < BARS; i++) {
        const bh = Math.max(2, vals[i] * h);
        const x = i * (bw + gap);
        const y = (h - bh) / 2;
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(x, y, bw, bh, bw / 2);
        } else {
          ctx.rect(x, y, bw, bh);
        }
        ctx.fill();
      }
    }

    function frame() {
      if (!alive) return;
      const target = playing && !reduce ? audioEngine.getLevels(BARS) : new Array(BARS).fill(playing ? 0.12 : 0.04);
      let peak = 0;
      for (let i = 0; i < BARS; i++) {
        vals[i] += (target[i] - vals[i]) * 0.32;
        peak = Math.max(peak, vals[i]);
      }
      draw();
      if (playing || peak > 0.02) {
        raf = requestAnimationFrame(frame);
      }
    }
    frame();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [playing]);

  return <canvas ref={ref} className="visualizer" aria-hidden="true" />;
}
