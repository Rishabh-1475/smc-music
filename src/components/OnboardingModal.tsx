'use client';
import React, { useState, useEffect } from 'react';

interface Props {
  onComplete: (name: string, age: string) => void;
}

export const OnboardingModal: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rhythmx_user_profile');
    if (!saved) {
      setIsOpen(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age.trim()) return;
    localStorage.setItem('rhythmx_user_profile', JSON.stringify({ name: name.trim(), age: age.trim() }));
    setIsOpen(false);
    onComplete(name.trim(), age.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-[#0D0D11] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="w-11 h-11 rounded-xl bg-white text-black font-mono font-bold flex items-center justify-center text-sm mb-4 shadow-lg">
          RX
        </div>
        <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">PHILOMELA INITIALIZATION</p>
        <h2 className="text-lg font-bold text-white mt-0.5">Welcome to RhythmX</h2>
        <p className="text-xs text-zinc-400 mt-1">Calibrate your audiophile stream experience.</p>

        <div className="mt-5 flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">YOUR NAME</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rishabh Singh"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#050505] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 transition"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">YOUR AGE</label>
            <input
              type="number"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 19"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#050505] border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:scale-[1.02] active:scale-95 transition shadow-lg"
        >
          Initialize Stream
        </button>
      </form>
    </div>
  );
};

export default OnboardingModal;
