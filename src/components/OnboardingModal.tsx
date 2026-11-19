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
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-[#121217] border border-white/15 rounded-3xl p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-black font-extrabold flex items-center justify-center text-xl mb-4">
          RX
        </div>
        <h2 className="text-xl font-bold text-white">Welcome to RhythmX</h2>
        <p className="text-xs text-gray-400 mt-1">Personalize your high-fidelity sound stream.</p>

        <div className="mt-5 flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-semibold text-gray-400">YOUR NAME</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rishabh Singh"
              className="w-full mt-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#CCFF00]"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-400">YOUR AGE</label>
            <input
              type="number"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 19"
              className="w-full mt-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#CCFF00]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 py-3 rounded-xl bg-[#CCFF00] text-black font-bold text-sm hover:scale-[1.02] active:scale-95 transition shadow-lg"
        >
          Enter RhythmX
        </button>
      </form>
    </div>
  );
};
