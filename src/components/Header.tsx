"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Music2 } from "lucide-react";

export default function Header() {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-black/80 border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* SMC Emerald Brand Logo */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Music2 className="w-5 h-5 md:w-6 md:h-6 text-black" strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-lg md:text-xl font-extrabold tracking-tight text-white block leading-tight">
            SMC
          </span>
          <span className="text-[11px] md:text-xs font-semibold text-emerald-400 tracking-wider block uppercase">
            Singhs Music Co
          </span>
        </div>
      </div>

      {/* Creator Spotlight */}
      <div className="flex items-center space-x-3">
        <Link
          href="https://www.instagram.com/rish4bhsiingh/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center space-x-3 bg-neutral-900/90 hover:bg-neutral-800 transition-all border border-white/10 hover:border-emerald-500/40 rounded-full pl-1.5 pr-4 py-1.5 shadow-md"
          title="Lead Developer: Rishabh Singh"
        >
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden ring-2 ring-emerald-500/50 group-hover:ring-emerald-400 transition-all flex-shrink-0 bg-neutral-800 flex items-center justify-center">
            {!imgError ? (
              <img
                src="/creator.jpg"
                alt="Rishabh Singh"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-xs font-bold text-emerald-400">RS</span>
            )}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs md:text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
              Rishabh Singh
            </p>
            <p className="text-[10px] md:text-xs text-neutral-400 font-medium leading-none mt-0.5">
              Founder &amp; Lead Dev
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
