"use client";

import React, { useState } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayerStore } from "@/store/playerStore";

interface CoverFlowTrack {
  id: string;
  name: string;
  primaryArtists: string;
  album: string;
  duration: number;
  imageUrl: string;
  audioUrl: string;
  referenceTag: string;
}

export const SHOWCASE_TRACKS: CoverFlowTrack[] = [
  {
    id: "showcase_theweeknd",
    name: "Blinding Lights",
    primaryArtists: "The Weeknd",
    album: "After Hours",
    duration: 200,
    imageUrl: "https://c.saavncdn.com/649/After-Hours-English-2020-20200320011002-500x500.jpg",
    audioUrl: "https://aac.saavncdn.com/179/ee99b14844e2699aad400fa1e946c0ed_320.mp4",
    referenceTag: "Reference 1 (The Weeknd)",
  },
  {
    id: "showcase_stay",
    name: "STAY (with Justin Bieber)",
    primaryArtists: "The Kid LAROI, Justin Bieber",
    album: "F*CK LOVE 3+: OVER YOU",
    duration: 141,
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
    audioUrl: "https://aac.saavncdn.com/675/1456dc2903d0fb4465d2d2904008803b_320.mp4",
    referenceTag: "Reference 3 (Spotify STAY)",
  },
  {
    id: "showcase_juicewrld",
    name: "Legends Never Die",
    primaryArtists: "Juice WRLD",
    album: "Legends Never Die",
    duration: 196,
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80",
    audioUrl: "https://aac.saavncdn.com/675/f1f48664e51db48f0d26a40d42d515a8_320.mp4",
    referenceTag: "Reference 4 (Juice WRLD 999)",
  },
  {
    id: "showcase_labonko",
    name: "Labon Ko",
    primaryArtists: "Pritam, K.K., Sayeed Quadri",
    album: "Bhool Bhulaiyaa",
    duration: 341,
    imageUrl: "https://c.saavncdn.com/024/Bhool-Bhulaiyaa-Hindi-2007-20220914170601-500x500.jpg",
    audioUrl: "https://aac.saavncdn.com/675/ff5cbe7f8c09da84cb039852eae36fce_320.mp4",
    referenceTag: "Reference 2 (Labon Ko)",
  },
  {
    id: "showcase_calmyoursoul",
    name: "Calm your soul",
    primaryArtists: "Goodeech Design",
    album: "Midnight Synthwave",
    duration: 167,
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80",
    audioUrl: "https://aac.saavncdn.com/675/967b4606fe77beb6b080abd334f5742d_320.mp4",
    referenceTag: "Reference 5 (Calm Your Soul)",
  },
];

export default function CoverFlowCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { currentTrack, isPlaying, playSong, togglePlay } = usePlayerStore();

  const handleSelect = (idx: number) => {
    setActiveIndex(idx);
    const track = SHOWCASE_TRACKS[idx];
    const songObj: Song = {
      id: track.id,
      name: track.name,
      title: track.name,
      primaryArtists: track.primaryArtists,
      album: track.album,
      duration: track.duration,
      imageUrl: track.imageUrl,
      audioUrl: track.audioUrl,
    };
    playSong(songObj, SHOWCASE_TRACKS as unknown as Song[]);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % SHOWCASE_TRACKS.length;
    handleSelect(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx =
      (activeIndex - 1 + SHOWCASE_TRACKS.length) % SHOWCASE_TRACKS.length;
    handleSelect(prevIdx);
  };

  return (
    <section className="w-full my-4 select-none gpu-layer">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-ping" />
          <h2 className="text-sm font-bold text-white tracking-tight uppercase">
            3D Cover Flow Showcase
          </h2>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrev}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Next card"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Cover Flow Stage matching Image 1, 3, 4 */}
      <div className="relative w-full h-[270px] flex items-center justify-center overflow-hidden py-2 [perspective:1000px]">
        {SHOWCASE_TRACKS.map((track, i) => {
          const offset = i - activeIndex;
          const isCenter = offset === 0;
          const isLeft1 = offset === -1 || (activeIndex === 0 && i === SHOWCASE_TRACKS.length - 1);
          const isRight1 = offset === 1 || (activeIndex === SHOWCASE_TRACKS.length - 1 && i === 0);
          const isFar = !isCenter && !isLeft1 && !isRight1;

          let transformStyle = "";
          let zIndex = 10;
          let opacity = 0.4;

          if (isCenter) {
            transformStyle = "translateX(0px) scale(1) rotateY(0deg) translateZ(50px)";
            zIndex = 30;
            opacity = 1;
          } else if (isLeft1) {
            transformStyle = "translateX(-85px) scale(0.84) rotateY(28deg) translateZ(0px)";
            zIndex = 20;
            opacity = 0.75;
          } else if (isRight1) {
            transformStyle = "translateX(85px) scale(0.84) rotateY(-28deg) translateZ(0px)";
            zIndex = 20;
            opacity = 0.75;
          } else {
            const sideSign = offset < 0 ? -1 : 1;
            transformStyle = `translateX(${sideSign * 140}px) scale(0.7) rotateY(${
              sideSign * -40
            }deg) translateZ(-50px)`;
            zIndex = 5;
            opacity = 0.3;
          }

          const isCurrentPlaying =
            currentTrack?.id === track.id && isPlaying;

          return (
            <div
              key={track.id}
              onClick={() => handleSelect(i)}
              style={{
                transform: transformStyle,
                zIndex,
                opacity,
              }}
              className="absolute w-[180px] h-[230px] rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-out shadow-[0_15px_35px_rgba(0,0,0,0.85)] bg-[#121218] border border-white/15 group flex flex-col justify-between p-2"
            >
              {/* Album Artwork */}
              <div className="relative w-full h-[145px] rounded-2xl overflow-hidden bg-neutral-900 shadow-inner">
                <img
                  src={track.imageUrl}
                  alt={track.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Center Play Overlay on Active */}
                {isCenter && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#D4FF00] text-black flex items-center justify-center shadow-lg shadow-[#D4FF00]/40 transition active:scale-95">
                      {isCurrentPlaying ? (
                        <Pause className="w-5 h-5 fill-black stroke-black" />
                      ) : (
                        <Play className="w-5 h-5 fill-black stroke-black ml-0.5" />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Track Metadata Card matching Image 1, 3, 4 */}
              <div className="p-1 text-center">
                <h4 className="text-xs font-bold text-white truncate leading-tight">
                  {track.name}
                </h4>
                <p className="text-[10px] text-gray-400 truncate mt-0.5 font-medium">
                  {track.primaryArtists}
                </p>
                {isCenter && (
                  <span className="inline-block mt-1 text-[8px] uppercase font-bold text-[#D4FF00] tracking-wider px-2 py-0.5 rounded-full bg-[#D4FF00]/10 border border-[#D4FF00]/20">
                    Now Staged
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
