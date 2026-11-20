'use client';
import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
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
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest text-[#E11D48] uppercase font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ORBITAL FREQUENCY ENGINE</span>
        </div>
        <h2 className="text-white font-bold text-lg tracking-tight mt-0.5">Music Galaxy</h2>
        <p className="text-xs text-[#94A3B8] mt-0.5">{satellites.length} connected planetary nodes</p>
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
                stroke="rgba(225, 29, 72, 0.35)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            );
          })}
        </svg>

        {/* Center Playing Node */}
        {centerSong && (
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#E11D48] to-[#EF4444] shadow-[0_0_35px_rgba(225,29,72,0.5)] overflow-hidden animate-pulse">
              <img
                src={centerSong.imageUrl}
                alt={centerSong.name}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                }}
              />
            </div>
            <p className="text-xs font-bold text-white text-center truncate max-w-[140px] mt-2 drop-shadow">
              {centerSong.name}
            </p>
            <p className="text-[10px] text-[#94A3B8] text-center truncate max-w-[120px]">
              {centerSong.primaryArtists}
            </p>
          </div>
        )}

        {/* Orbiting Satellite Songs */}
        {satellites.map((song, i) => {
          const angle = (i / satellites.length) * 2 * Math.PI - Math.PI / 2;
          const x = centerCoord + radius * Math.cos(angle);
          const y = centerCoord + radius * Math.sin(angle);

          return (
            <div
              key={song.id}
              onClick={() => playTrack(song)}
              style={{
                position: 'absolute',
                left: `${x - 24}px`,
                top: `${y - 24}px`
              }}
              className="z-10 w-12 h-12 rounded-full p-0.5 bg-[#121217] border border-[#262633] hover:border-[#E11D48] hover:scale-110 active:scale-95 transition cursor-pointer shadow-lg overflow-hidden group"
              title={`${song.name} - ${song.primaryArtists}`}
            >
              <img
                src={song.imageUrl}
                alt={song.name}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GalaxyVisualizer;
