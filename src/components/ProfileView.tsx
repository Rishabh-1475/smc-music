"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, RotateCcw, Heart, History, Radio } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { usePlayerStore } from "@/store/playerStore";

interface ProfileViewProps {
  onBackToHome?: () => void;
}

export default function ProfileView({ onBackToHome }: ProfileViewProps) {
  const { userName, resetOnboarding } = useUserStore();
  const { likedSongs, recentlyPlayed, clearHistory } = usePlayerStore();

  const displayName = userName?.trim() || "Samantha";
  const displayHandle = userName
    ? userName.toLowerCase().replace(/\s+/g, "_")
    : "samantha_music";

  return (
    <div className="w-full px-4 pt-6 gpu-layer text-center flex flex-col items-center select-none">
      {/* 3D Glass Profile Card */}
      <div className="w-full bg-[#14141B] border border-white/10 rounded-[28px] p-6 shadow-2xl relative overflow-hidden text-left">
        {/* Soft Ambient Radiance */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4FF00]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top: Avatar + Handle */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4FF00] shadow-md bg-neutral-900">
            <img
              src="/creator.jpg"
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80";
              }}
            />
          </div>
          <button
            onClick={() => resetOnboarding()}
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs text-white font-medium cursor-pointer transition active:scale-95"
          >
            Edit Profile
          </button>
        </div>

        {/* Name & Handle */}
        <h2 className="text-xl font-bold text-white tracking-tight">
          {displayName}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">@{displayHandle}</p>
        <p className="text-xs text-gray-300 mt-2.5 leading-relaxed">
          Audiophile exploring high-fidelity 320kbps lossless soundscapes &amp; continuous autoplay radio.
        </p>

        {/* Honest, Real User Stats Grid (No Fake Numbers) */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
          <div className="p-2 rounded-xl bg-white/[0.03]">
            <p className="text-lg font-bold text-[#D4FF00]">{likedSongs.length}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Liked Tracks</p>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.03]">
            <p className="text-lg font-bold text-white">{recentlyPlayed.length}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Recently Played</p>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.03]">
            <p className="text-lg font-bold text-lime-400">320 KBPS</p>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Audio Engine</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => clearHistory()}
            className="text-[11px] text-gray-400 hover:text-white flex items-center space-x-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Clear History</span>
          </button>

          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
            RhythmX Pro v2.0
          </span>
        </div>
      </div>

      {/* Official Instagram Connection & Creator Attribution */}
      <div className="w-full mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
        <p className="text-xs text-gray-400 mb-2.5">
          Engineered by <strong>Rishabh Singh</strong> • Lead Mobile Architect
        </p>
        <Link
          href="https://www.instagram.com/rish4bhsiingh/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-xl bg-[#D4FF00] hover:bg-[#bceb15] text-black font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-md shadow-[#D4FF00]/25 active:scale-95"
        >
          <span>Follow on Instagram (@rish4bhsiingh)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
