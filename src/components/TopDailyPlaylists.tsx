"use client";

import React from "react";
import { Play, Pause } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

interface TopDailyPlaylistsProps {
  songs: Song[];
  title?: string;
  onSeeAll?: () => void;
  maxItems?: number;
}

const FALLBACK_VINYL =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

export const getSongCover = (song: any): string => {
  if (!song) return FALLBACK_VINYL;
  if (Array.isArray(song.image) && song.image.length > 0) {
    const last = song.image[song.image.length - 1];
    return typeof last === "string"
      ? last
      : last?.url || last?.link || song.image[0]?.url || song.image[0]?.link || FALLBACK_VINYL;
  }
  if (Array.isArray(song.images) && song.images.length > 0) {
    const last = song.images[song.images.length - 1];
    return typeof last === "string"
      ? last
      : last?.url || last?.link || song.images[0]?.url || FALLBACK_VINYL;
  }
  return song.imageUrl || song.image || FALLBACK_VINYL;
};

export const decodeHtmlEntities = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&copy;/g, "©")
    .replace(/&reg;/g, "®")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch {
        return "";
      }
    })
    .trim();
};

export default function TopDailyPlaylists({
  songs = [],
  title = "Top daily playlists",
  onSeeAll,
  maxItems = 5,
}: TopDailyPlaylistsProps) {
  const { currentTrack, isPlaying, playSong, togglePlay } = usePlayerStore();

  if (!songs || songs.length === 0) return null;

  return (
    <section className="w-full my-2 select-none gpu-layer">
      {/* Section Header: flex justify-between items-center px-4 mb-2 */}
      <div className="flex justify-between items-center px-4 mb-2">
        <h2 className="font-bold text-white text-sm tracking-tight">
          {title}
        </h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-xs text-lime-400 font-medium hover:text-white transition cursor-pointer"
          >
            See all
          </button>
        )}
      </div>

      {/* List items matching Reference 1 */}
      <div className="flex flex-col gap-1.5 px-2">
        {songs.slice(0, maxItems).map((song) => {
          const isCurrent = currentTrack?.id === song.id;
          const isCardPlaying = isCurrent && isPlaying;
          const songTitle = decodeHtmlEntities(song.name || song.title || "Track");
          const songArtist = decodeHtmlEntities(song.primaryArtists || "Waveform");
          const coverUrl = getSongCover(song);

          return (
            <div
              key={song.id}
              onClick={() => {
                if (isCurrent) togglePlay();
                else playSong(song, songs);
              }}
              className={`px-4 py-2 flex items-center justify-between hover:bg-white/5 rounded-2xl transition cursor-pointer select-none ${
                isCurrent
                  ? "bg-white/[0.08] border border-[#D4FF00]/30 shadow-sm"
                  : "border border-transparent"
              }`}
            >
              {/* Left: 12x12 (48px) circular image with actual song cover */}
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/10 shadow-sm">
                <img
                  src={coverUrl}
                  alt={songTitle}
                  loading="lazy"
                  className="w-12 h-12 rounded-full object-cover border border-white/10 flex-shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_VINYL;
                  }}
                />
              </div>

              {/* Center (flex-1 px-3 min-w-0): Real decoded string */}
              <div className="flex-1 px-3 min-w-0">
                <h4
                  className={`text-xs font-semibold truncate ${
                    isCurrent ? "text-lime-400" : "text-white"
                  }`}
                >
                  {songTitle}
                </h4>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">
                  By {songArtist} • Lossless
                </p>
              </div>

              {/* Right: 28px rounded-full bg-white/5 border border-white/10 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCurrent) togglePlay();
                  else playSong(song, songs);
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 cursor-pointer ${
                  isCardPlaying
                    ? "bg-[#D4FF00] text-black shadow-md shadow-[#D4FF00]/30 border border-[#D4FF00]"
                    : "bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10"
                }`}
                aria-label={isCardPlaying ? "Pause" : "Play"}
              >
                {isCardPlaying ? (
                  <Pause className="w-3 h-3 fill-current stroke-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current stroke-current ml-0.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
