'use client';
import React from 'react';
import { X, ExternalLink, ShieldCheck, Code, Music2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 select-none">
      <div className="relative w-full max-w-sm bg-gradient-to-br from-[#1C090E] via-[#101015] to-[#070709] border border-[#B50925]/50 rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(255,35,72,0.35)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#FF2348] p-1 shadow-[0_0_25px_rgba(255,35,72,0.5)] mb-3">
            <img
              src="/creator.jpeg"
              alt="Rishabh Singh"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                e.currentTarget.src = '/creator.jpg';
              }}
            />
          </div>

          <h3 className="text-xl font-black text-white flex items-center gap-1.5 font-['Space_Grotesk']">
            Rishabh Singh <ShieldCheck className="w-4 h-4 text-[#FF2348]" />
          </h3>
          <p className="text-[10px] font-mono text-[#FF2348] tracking-widest mt-0.5 uppercase">
            Lead Systems Architect • B.Tech CSE
          </p>
          <p className="text-xs text-zinc-400 mt-2 max-w-xs leading-relaxed">
            Software Developer and Systems Architect. Creator of RhythmX (Lossless Spatial Audio Engine) and the NOIR//SOUND ASTRA 3D interactive visualizer.
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4 w-full">
            <div className="bg-[#151518]/90 border border-white/5 p-2.5 rounded-xl flex items-center gap-2">
              <Code className="w-4 h-4 text-[#FF2348]" />
              <div className="text-left">
                <p className="text-[9px] text-zinc-400 font-mono">Stack</p>
                <p className="text-xs font-bold text-white">Next.js • Three.js</p>
              </div>
            </div>
            <div className="bg-[#151518]/90 border border-white/5 p-2.5 rounded-xl flex items-center gap-2">
              <Music2 className="w-4 h-4 text-[#FF2348]" />
              <div className="text-left">
                <p className="text-[9px] text-zinc-400 font-mono">Audio Core</p>
                <p className="text-xs font-bold text-white">320 KBPS AAC</p>
              </div>
            </div>
          </div>

          <a
            href="https://www.instagram.com/rish4bhsiingh/"
            target="_blank"
            rel="noreferrer"
            className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-[#B50925] via-[#E11D48] to-[#FF2348] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,35,72,0.6)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <span>Follow on Instagram (@rish4bhsiingh)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
