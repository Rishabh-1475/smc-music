import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { usePlayerStore } from '@/store/playerStore';

export default function CreatePlaylistModal() {
  const { isCreatePlaylistOpen, setCreatePlaylistOpen, createPlaylist } = usePlayerStore();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCreatePlaylistOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setCreatePlaylistOpen]);

  if (!isCreatePlaylistOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createPlaylist(name, desc);
    setName('');
    setDesc('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Create Playlist"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#0f0f13] border border-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(255,35,72,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white"
          onClick={() => setCreatePlaylistOpen(false)}
          aria-label="Close"
        >
          <Icon name="x" size={16} />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">Create Playlist</h2>
        <p className="text-xs text-white/60 mb-5">
          Curate your favorite 320kbps Lossless tracks in one place.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
              Playlist Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Midnight Beats, Workout Phonk"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[var(--ruby)]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Give your playlist a vibe description..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[var(--ruby)] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white"
              onClick={() => setCreatePlaylistOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--crimson)] to-[var(--ruby)] text-white hover:brightness-110 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
