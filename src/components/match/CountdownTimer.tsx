'use client';

import React, { useState, useEffect } from 'react';
import { calculateCountdown } from './matchHelpers';
import type { CountdownResult } from './matchTypes';

interface CountdownTimerProps {
  targetDate: string;
  targetTime: string;
}

export default function CountdownTimer({ targetDate, targetTime }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<CountdownResult>(() =>
    calculateCountdown(targetDate, targetTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(targetDate, targetTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  if (countdown.isPast) {
    return (
      <div className="text-center">
        <p className="text-amber-400 text-sm font-bold uppercase tracking-widest animate-pulse">
          Maç başlamak üzere!
        </p>
      </div>
    );
  }

  const blocks = [
    { value: countdown.days, label: 'Gün' },
    { value: countdown.hours, label: 'Saat' },
    { value: countdown.minutes, label: 'Dakika' },
    { value: countdown.seconds, label: 'Saniye' },
  ];

  return (
    <div className="flex items-center justify-center gap-3">
      {blocks.map((block, idx) => (
        <React.Fragment key={block.label}>
          {idx > 0 && <span className="text-white/20 text-lg font-black">:</span>}
          <div className="flex flex-col items-center">
            <div className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 min-w-[52px] text-center">
              <span className="text-xl font-black text-white tabular-nums">
                {String(block.value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/25 mt-1">
              {block.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
