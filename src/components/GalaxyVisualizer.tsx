'use client';
import React, { useMemo } from 'react';
import { Song } from '@/services/api';
import { usePlayerStore } from '@/store/playerStore';

interface Props {
  songs: Song[];
}

export const GalaxyVisualizer: React.FC<Props> = ({ songs }) => {
  const { currentTrack, playTrack } = usePlayerStore();

  const centerSong = currentTrack || (songs && songs.length > 0 ? songs[0] : null);

  const satellites = useMemo(() => {
    if (!songs || songs.length === 0) return [];
    return songs.filter((s) => s.id !== centerSong?.id).slice(0, 7);
  }, [songs, centerSong]);

  const radius = 135;
  const centerCoord = 175;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 select-none relative">
      <div className="text-center mb-4">
        <h2 className="text-white font-bold text-sm">Music Galaxy</h2>
        <p className="text-[#CCFF00] text-[10px] font-mono tracking-wider mt-0.5">
          {satellites.length} LINKED CONSTELLATIONS
        </p>
      </div>

      <div className="relative w-[350px] h-[350px] flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {satellites.map((_, i) => {
            const angle = (i / satellites.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerCoord + radius * Math.cos(angle);
            const y = centerCoord + radius * Math.sin(angle);
            return (
              <g key={i}>
                <line
                  x1={centerCoord}
                  y1={centerCoord}
                  x2={x}
                  y2={y}
                  stroke="rgba(204, 255, 0, 0.25)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle cx={x} cy={y} r="2" fill="#CCFF00" />
              </g>
            );
          })}
        </svg>

        {centerSong && (
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-r from-[#CCFF00] via-emerald-400 to-purple-500 shadow-[0_0_30px_rgba(204,255,0,0.35)] animate-pulse">
              <img
                src={centerSong.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80'}
                alt={centerSong.name}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80') {
                    target.src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80';
                  }
                }}
              />
            </div>
            <div className="mt-2 text-center max-w-[160px] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <p className="text-white text-xs font-bold truncate">{centerSong.name}</p>
              <p className="text-gray-400 text-[10px] truncate">{centerSong.primaryArtists}</p>
            </div>
          </div>
        )}

        {satellites.map((sat, i) => {
          const angle = (i / satellites.length) * 2 * Math.PI - Math.PI / 2;
          const left = centerCoord + radius * Math.cos(angle) - 24;
          const top = centerCoord + radius * Math.sin(angle) - 24;

          return (
            <button
              key={sat.id}
              onClick={() => playTrack(sat)}
              style={{ left: `${left}px`, top: `${top}px` }}
              className="absolute z-20 w-12 h-12 rounded-full overflow-hidden border-2 border-[#CCFF00]/50 hover:scale-125 hover:border-[#CCFF00] transition transform active:scale-95 shadow-lg group cursor-pointer"
            >
              <img
                src={sat.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80'}
                alt={sat.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80') {
                    target.src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80';
                  }
                }}
              />
            </button>
          );
        })}
      </div>

      <p className="text-gray-500 text-[11px] mt-6">
        Tap any satellite node to pivot the galaxy &amp; stream
      </p>
    </div>
  );
};

export default GalaxyVisualizer;
