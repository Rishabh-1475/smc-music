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

  const radius = 130;
  const centerCoord = 175;

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 select-none">
      <div className="text-center mb-4">
        <h2 className="text-white font-bold text-sm tracking-wider uppercase">Music Galaxy</h2>
        <p className="text-[#CCFF00] text-[10px] font-mono mt-0.5">{satellites.length} LINKED CONSTELLATIONS</p>
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
                stroke="rgba(204, 255, 0, 0.3)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            );
          })}
        </svg>

        {/* Center Playing Node */}
        {centerSong && (
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-r from-[#CCFF00] to-emerald-400 shadow-[0_0_30px_rgba(204,255,0,0.4)] animate-pulse">
              <img src={centerSong.imageUrl} alt={centerSong.name} className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="mt-2 text-center max-w-[150px] bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <p className="text-white text-xs font-bold truncate">{centerSong.name}</p>
            </div>
          </div>
        )}

        {/* Satellites */}
        {satellites.map((sat, i) => {
          const angle = (i / satellites.length) * 2 * Math.PI - Math.PI / 2;
          const left = centerCoord + radius * Math.cos(angle) - 22;
          const top = centerCoord + radius * Math.sin(angle) - 22;
          return (
            <button
              key={sat.id}
              onClick={() => playTrack(sat)}
              style={{ left: `${left}px`, top: `${top}px` }}
              className="absolute z-20 w-11 h-11 rounded-full overflow-hidden border-2 border-[#CCFF00]/60 hover:scale-125 transition transform active:scale-95 shadow-lg"
            >
              <img src={sat.imageUrl} alt={sat.name} className="w-full h-full object-cover" />
            </button>
          );
        })}
      </div>
      <p className="text-gray-500 text-[11px] mt-4">Tap any outer satellite node to switch playback</p>
    </div>
  );
};
