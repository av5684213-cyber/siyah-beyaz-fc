'use client';

import React from 'react';

interface ScoreBoardProps {
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  minute?: number;
}

export default function ScoreBoard({
  homeName,
  awayName,
  homeScore,
  awayScore,
  status,
  minute,
}: ScoreBoardProps) {
  const isLive = status === 'live';

  return (
    <div className="bg-gradient-to-b from-zinc-900/90 to-black/90 border border-white/10 rounded-2xl p-6 md:p-8 text-center">
      {/* Canlı etiketi */}
      {isLive && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">CANLI</span>
          {minute != null && (
            <span className="text-white/40 text-xs font-bold ml-2">{minute}&apos;</span>
          )}
        </div>
      )}

      {/* Takımlar ve skor */}
      <div className="flex items-center justify-center gap-6 md:gap-12">
        {/* Ev sahibi */}
        <div className="flex flex-col items-center gap-2 min-w-[100px]">
          <div className="w-14 h-14 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
            <span className="text-lg font-black text-white/80">
              {homeName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-xs font-bold text-white/70 uppercase tracking-wider truncate max-w-[120px]">
            {homeName}
          </span>
        </div>

        {/* Skor */}
        <div className="flex items-center gap-4">
          <span className={`text-5xl md:text-7xl font-black tabular-nums ${isLive ? 'text-white' : 'text-white/80'}`}>
            {homeScore ?? '-'}
          </span>
          <span className="text-xl md:text-3xl font-black text-white/15">:</span>
          <span className={`text-5xl md:text-7xl font-black tabular-nums ${isLive ? 'text-white' : 'text-white/80'}`}>
            {awayScore ?? '-'}
          </span>
        </div>

        {/* Deplasman */}
        <div className="flex flex-col items-center gap-2 min-w-[100px]">
          <div className="w-14 h-14 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
            <span className="text-lg font-black text-white/80">
              {awayName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-xs font-bold text-white/70 uppercase tracking-wider truncate max-w-[120px]">
            {awayName}
          </span>
        </div>
      </div>
    </div>
  );
}
