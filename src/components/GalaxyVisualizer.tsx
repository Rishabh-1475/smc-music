'use client';
import React, { useMemo, useState } from 'react';
import { Song } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  songs: Song[];
}

export const GalaxyVisualizer: React.FC<Props> = ({ songs }) => {
  const { currentTrack, playTrack } = usePlayerStore();
  const [tilt, setTilt] = useState({ x: 15, y: -10 });

  const centerSong = currentTrack || songs[0];

  const satellites = useMemo(() => {
    return songs.filter((s) => s.id !== centerSong?.id).slice(0, 7);
  }, [songs, centerSong]);

  const radius = 130;
  const centerCoord = 160;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top) / rect.height - 0.5;
    const y = (e.clientX - rect.left) / rect.width - 0.5;
    setTilt({ x: -x * 25, y: y * 25 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 select-none perspective-[1000px]"
    >
      <div className="text-center mb-4">
        <h2 className="text-white font-extrabold text-sm tracking-widest uppercase">SPATIAL MUSIC GALAXY</h2>
        <p className="text-[#EF4444] text-[10px] font-mono tracking-wider mt-0.5">
          {satellites.length} 3D ORBITING SATELLITES
        </p>
      </div>

      <div
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
        className="relative w-[320px] h-[320px] transition-transform duration-200 ease-out flex items-center justify-center"
      >
        {/* Volumetric Laser Grid Background */}
        <div className="absolute inset-0 rounded-full border border-[#EF4444]/20 shadow-[0_0_50px_rgba(239,68,68,0.15)] pointer-events-none transform translate-z-[-40px]" />
        <div className="absolute inset-6 rounded-full border border-white/5 pointer-events-none transform translate-z-[-20px]" />

        {/* 3D SVG Connecting Web */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {satellites.map((_, i) => {
            const angle = (i / satellites.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerCoord + radius * Math.cos(angle);
            const y = centerCoord + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={centerCoord}
                y1={centerCoord}
                x2={x}
                y2={y}
                stroke="rgba(239, 68, 68, 0.35)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            );
          })}
        </svg>

        {/* Center Spatial Playing Node */}
        {centerSong && (
          <div
            style={{ transform: 'translateZ(35px)' }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#EF4444] via-rose-600 to-amber-500 shadow-[0_0_35px_rgba(239,68,68,0.6)] animate-pulse">
              <img
                src={centerSong.imageUrl}
                alt={centerSong.name}
                className="w-full h-full rounded-full object-cover shadow-2xl"
              />
            </div>
            <div className="mt-3 text-center max-w-[150px] bg-[#121217]/90 backdrop-blur-xl px-3 py-1 rounded-full border border-[#EF4444]/30 shadow-lg">
              <p className="text-white text-xs font-bold truncate">{centerSong.name}</p>
            </div>
          </div>
        )}

        {/* 3D Orbiting Satellites */}
        {satellites.map((sat, i) => {
          const angle = (i / satellites.length) * 2 * Math.PI - Math.PI / 2;
          const left = centerCoord + radius * Math.cos(angle) - 24;
          const top = centerCoord + radius * Math.sin(angle) - 24;
          const zDepth = Math.sin(angle) * 30;

          return (
            <button
              key={sat.id}
              onClick={() => playTrack(sat)}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                transform: `translateZ(${zDepth}px)`
              }}
              className="absolute z-20 w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#EF4444]/60 hover:scale-125 hover:border-[#EF4444] transition-all transform active:scale-95 shadow-[0_10px_25px_rgba(0,0,0,0.8)] cursor-pointer"
            >
              <img src={sat.imageUrl} alt={sat.name} className="w-full h-full object-cover" />
            </button>
          );
        })}
      </div>

      <p className="text-gray-500 text-[11px] mt-6 font-mono tracking-wider">
        TILT DEVICE OR CURSOR TO EXPLORE SPATIAL SOUND
      </p>
    </div>
  );
};
