'use client';
import React, { useMemo } from 'react';
import { Song } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  songs: Song[];
}

export const GalaxyVisualizer: React.FC<Props> = ({ songs }) => {
  const { currentTrack, playTrack } = usePlayerStore();
  const centerSong = currentTrack || songs[0];

  const satellites = useMemo(() => {
    return songs.filter((s) => s.id !== centerSong?.id).slice(0, 7);
  }, [songs, centerSong]);

  const radius = 125;
  const centerCoord = 175;

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 select-none">
      <div className="text-center mb-4">
        <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">ASTRAL FREQUENCIES</p>
        <h2 className="text-white font-bold text-sm tracking-wider uppercase mt-0.5">Music Galaxy</h2>
      </div>

      <div className="relative w-[350px] h-[350px] flex items-center justify-center">
        {/* SVG Connectors */}
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
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
            );
          })}
        </svg>

        {/* Center Playing Node */}
        {centerSong && (
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl p-1 bg-[#0D0D11] border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.15)] overflow-hidden">
              <img
                src={centerSong.imageUrl}
                alt={centerSong.name}
                className="w-full h-full rounded-xl object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                }}
              />
            </div>
            <div className="mt-2 text-center max-w-[150px] bg-[#0D0D11]/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <p className="text-white text-xs font-semibold truncate">{centerSong.name}</p>
            </div>
          </div>
        )}

        {/* Satellites */}
        {satellites.map((sat, i) => {
          const angle = (i / satellites.length) * 2 * Math.PI - Math.PI / 2;
          const left = centerCoord + radius * Math.cos(angle) - 20;
          const top = centerCoord + radius * Math.sin(angle) - 20;
          return (
            <button
              key={sat.id}
              onClick={() => playTrack(sat)}
              style={{ left: `${left}px`, top: `${top}px` }}
              className="absolute z-20 w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-[#0D0D11] hover:scale-125 transition transform active:scale-95 shadow-xl cursor-pointer"
            >
              <img
                src={sat.imageUrl}
                alt={sat.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                }}
              />
            </button>
          );
        })}
      </div>
      <p className="text-zinc-500 text-[10px] font-mono mt-4 uppercase tracking-widest">
        Tap node to switch playback
      </p>
    </div>
  );
};

export default GalaxyVisualizer;
