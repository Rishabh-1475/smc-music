'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, Music2 } from 'lucide-react';

interface Props {
  onComplete: (name: string, age: string) => void;
}

export const OnboardingModal: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rhythmx_user_profile');
      if (!saved) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age.trim()) return;
    const profile = { name: name.trim(), age: age.trim() };
    if (typeof window !== 'undefined') {
      localStorage.setItem('rhythmx_user_profile', JSON.stringify(profile));
    }
    setIsOpen(false);
    onComplete(name.trim(), age.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 select-none">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#121217] border border-[#262633] rounded-2xl p-6 shadow-[0_0_50px_rgba(225,29,72,0.15)] flex flex-col relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#E11D48]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Brand Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#E11D48] to-[#EF4444] text-white flex items-center justify-center font-bold shadow-[0_0_20px_rgba(225,29,72,0.5)]">
            <Music2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#E11D48] uppercase font-bold">
              <Sparkles className="w-3 h-3 text-[#E11D48]" />
              <span>RHYTHMX INITIALIZATION</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">Welcome to RhythmX</h2>
          </div>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed mb-5">
          Calibrate your audiophile stream experience. Enter your details to activate high-fidelity 320kbps playback.
        </p>

        {/* Inputs */}
        <div className="flex flex-col gap-3.5">
          <div>
            <label className="text-[10px] font-mono tracking-wider text-[#94A3B8] uppercase block mb-1">
              YOUR NAME
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rishabh Singh"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-[#262633] text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-[#E11D48] transition"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono tracking-wider text-[#94A3B8] uppercase block mb-1">
              YOUR AGE
            </label>
            <input
              type="number"
              required
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 19"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-[#262633] text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-[#E11D48] transition"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#EF4444] text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-[0_0_25px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Launch Stream Deck</span>
        </button>
      </form>
    </div>
  );
};

export default OnboardingModal;
