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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#1A0A0E] via-[#0E0E14] to-[#050508] border border-[#B50925]/40 rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(181,9,37,0.3)]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Creator Image with Crimson Frame */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#FF2348] p-1 shadow-[0_0_25px_rgba(255,35,72,0.5)]">
            <img
              src="/creator.jpeg"
              alt="Rishabh Singh"
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                e.currentTarget.src = '/creator.jpg';
              }}
            />
          </div>

          <h2 className="text-xl font-black text-white mt-4 flex items-center gap-1.5">
            Rishabh Singh
            <ShieldCheck className="w-4 h-4 text-[#FF2348]" />
          </h2>
          <p className="text-xs text-[#FF2348] font-mono tracking-wider mt-0.5">
            FOUNDER &amp; LEAD SYSTEMS ARCHITECT
          </p>
          <p className="text-xs text-zinc-400 mt-2 max-w-xs leading-relaxed">
            Software Developer &amp; B.Tech Computer Science student. Engineering high-performance spatial audio applications, WebGL shaders, and mobile architectures.
          </p>
        </div>

        {/* Credentials / Tech Badges */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          <div className="bg-[#151518]/90 border border-white/5 p-3 rounded-xl flex items-center gap-2.5">
            <Code className="w-4 h-4 text-[#FF2348]" />
            <div className="text-left">
              <p className="text-[10px] text-zinc-400">Stack</p>
              <p className="text-xs font-bold text-white">Next.js • Three.js</p>
            </div>
          </div>
          <div className="bg-[#151518]/90 border border-white/5 p-3 rounded-xl flex items-center gap-2.5">
            <Music2 className="w-4 h-4 text-[#FF2348]" />
            <div className="text-left">
              <p className="text-[10px] text-zinc-400">Audio Core</p>
              <p className="text-xs font-bold text-white">320 KBPS AAC</p>
            </div>
          </div>
        </div>

        {/* Direct Instagram Action */}
        <a
          href="https://www.instagram.com/rish4bhsiingh/"
          target="_blank"
          rel="noreferrer"
          className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#B50925] via-[#E11D48] to-[#FF2348] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,35,72,0.6)] hover:scale-[1.02] active:scale-[0.98] transition"
        >
          <span>Follow on Instagram (@rish4bhsiingh)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
