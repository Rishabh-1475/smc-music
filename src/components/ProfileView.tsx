'use client';
import React, { useState, useEffect } from 'react';
import { ExternalLink, RotateCcw, Heart, History, Radio, ShieldCheck } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

interface ProfileViewProps {
  onBackToHome?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = () => {
  const [profile, setProfile] = useState<{ name: string; age: string }>({ name: 'Rishabh Singh', age: '19' });
  const { likedSongs, recents } = usePlayerStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rhythmx_user_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name) setProfile(parsed);
        } catch {}
      }
    }
  }, []);

  const handleResetProfile = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rhythmx_user_profile');
      window.location.reload();
    }
  };

  const handleInstagram = () => {
    if (typeof window !== 'undefined') {
      window.open('https://www.instagram.com/rish4bhsiingh/', '_blank');
    }
  };

  return (
    <div className="w-full px-4 pt-4 text-center flex flex-col items-center select-none pb-8">
      {/* 3D Elevated Profile Card */}
      <div className="w-full bg-[#121217] border border-[#262633] rounded-2xl p-6 shadow-2xl relative overflow-hidden text-left">
        {/* Soft Ambient Radiance */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E11D48]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Avatar + Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#E11D48] to-[#EF4444] shadow-[0_0_20px_rgba(225,29,72,0.4)]">
            <img
              src="/creator.jpg"
              alt={profile.name}
              className="w-full h-full rounded-full object-cover bg-neutral-900"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120';
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-[10px] font-mono font-bold text-[#E11D48] tracking-widest uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#E11D48]" />
              PREMIUM
            </span>
            <button
              onClick={handleResetProfile}
              className="p-2 rounded-xl bg-[#050505] border border-[#262633] text-[#94A3B8] hover:text-white transition cursor-pointer"
              title="Reset Profile"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <h2 className="text-xl font-bold text-white tracking-tight">{profile.name}</h2>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Age: {profile.age} • Audiophile Member
        </p>
        <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
          Listening on RhythmX Lossless Audio Stream Engine with dynamic JioSaavn mirror resolution.
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-[#262633] text-center">
          <div className="p-2.5 rounded-xl bg-[#050505] border border-[#262633]/60">
            <div className="flex items-center justify-center gap-1 text-[#E11D48] mb-1">
              <Heart className="w-3.5 h-3.5 fill-current" />
            </div>
            <p className="text-lg font-bold text-white font-mono">{likedSongs.length}</p>
            <p className="text-[10px] text-[#94A3B8] uppercase font-mono tracking-wider">LIKED</p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#050505] border border-[#262633]/60">
            <div className="flex items-center justify-center gap-1 text-[#94A3B8] mb-1">
              <History className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold text-white font-mono">{recents.length}</p>
            <p className="text-[10px] text-[#94A3B8] uppercase font-mono tracking-wider">RECENTS</p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#050505] border border-[#262633]/60">
            <div className="flex items-center justify-center gap-1 text-[#E11D48] mb-1">
              <Radio className="w-3.5 h-3.5" />
            </div>
            <p className="text-sm font-bold text-[#E11D48] font-mono mt-1">320 KBPS</p>
            <p className="text-[10px] text-[#94A3B8] uppercase font-mono tracking-wider mt-0.5">STREAM</p>
          </div>
        </div>

        {/* Developer Credit Button */}
        <button
          onClick={handleInstagram}
          className="w-full mt-5 py-3 rounded-xl bg-[#050505] hover:bg-[#1E1E26] border border-[#262633] text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg group"
        >
          <span>Created by Rishabh Singh</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-white transition" />
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
