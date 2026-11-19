"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Music2, ArrowRight } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function OnboardingModal() {
  const { isOnboarded, setOnboardingData } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid SSR hydration flash
  if (!mounted || isOnboarded) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedAge = age.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    const ageNum = parseInt(trimmedAge, 10);
    if (!trimmedAge || isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
      setError("Please enter a valid age.");
      return;
    }

    setError("");
    setOnboardingData(trimmedName, trimmedAge);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#0A0A0C]/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      {/* Soft Ambient Lime & Purple Glow Behind Card */}
      <div className="absolute w-72 h-72 bg-[#D2FF1F]/10 rounded-full blur-[100px] pointer-events-none -top-10 -left-10" />
      <div className="absolute w-72 h-72 bg-[#7c3aed]/15 rounded-full blur-[100px] pointer-events-none -bottom-10 -right-10" />

      {/* Dark Luxury Glass Card */}
      <div className="relative w-full max-w-sm bg-[#121217]/95 border border-white/10 rounded-3xl p-7 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
        {/* Animated Brand Icon */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1E1E26] to-[#121217] border border-white/15 flex items-center justify-center mb-5 shadow-inner">
          <div className="absolute inset-0 rounded-2xl bg-[#D2FF1F]/10 animate-pulse pointer-events-none" />
          <Music2 className="w-8 h-8 text-[#D2FF1F]" />
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
          Welcome to RhythmX
        </h2>
        <p className="text-xs text-neutral-400 font-medium mt-1.5 mb-6">
          Personalize your sound experience
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
          {/* Input 1: Your Name */}
          <div>
            <label
              htmlFor="onboarding-name"
              className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5"
            >
              Your Name
            </label>
            <input
              id="onboarding-name"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Alex"
              maxLength={32}
              className="w-full px-4 py-3 rounded-xl bg-[#1A1A22] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#D2FF1F] focus:ring-1 focus:ring-[#D2FF1F] transition"
            />
          </div>

          {/* Input 2: Your Age */}
          <div>
            <label
              htmlFor="onboarding-age"
              className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5"
            >
              Your Age
            </label>
            <input
              id="onboarding-age"
              type="number"
              min="5"
              max="120"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. 21"
              className="w-full px-4 py-3 rounded-xl bg-[#1A1A22] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#D2FF1F] focus:ring-1 focus:ring-[#D2FF1F] transition"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs text-red-400 font-medium pt-1 text-center animate-shake">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#D2FF1F] hover:bg-[#bceb15] active:scale-95 text-black font-extrabold text-sm tracking-wide flex items-center justify-center space-x-2 transition shadow-lg shadow-[#D2FF1F]/25 cursor-pointer"
          >
            <span>Enter RhythmX</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <p className="text-[10px] text-neutral-500 font-mono mt-5">
          Pure local profile • Stored safely on device
        </p>
      </div>
    </div>
  );
}
