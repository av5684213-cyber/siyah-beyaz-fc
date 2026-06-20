'use client';

import React, { useState } from 'react';
import { localizePosFull } from '@/lib/fm/ui-helpers';

// ─── Position coordinates (percentage) ───
const POSITION_COORDS: Record<string, { left: number; top: number }> = {
  GK:  { left: 8,  top: 50 },
  CB:  { left: 22, top: 50 },
  LB:  { left: 20, top: 15 },
  RB:  { left: 20, top: 85 },
  LWB: { left: 32, top: 12 },
  RWB: { left: 32, top: 88 },
  CDM: { left: 38, top: 50 },
  CM:  { left: 50, top: 50 },
  CAM: { left: 60, top: 50 },
  LM:  { left: 50, top: 15 },
  RM:  { left: 50, top: 85 },
  LW:  { left: 65, top: 15 },
  RW:  { left: 65, top: 85 },
  CF:  { left: 75, top: 50 },
  ST:  { left: 85, top: 50 },
};

// ─── Turkish position labels for tooltip ───
const POS_LABELS_TR: Record<string, string> = {
  GK:  'Kaleci',
  CB:  'Stoper',
  LB:  'Sol Bek',
  RB:  'Sağ Bek',
  LWB: 'Sol Kanat Bek',
  RWB: 'Sağ Kanat Bek',
  CDM: 'Defansif Orta Saha',
  CM:  'Merkez Orta Saha',
  CAM: 'Ofansif Orta Saha',
  LM:  'Sol Orta Saha',
  RM:  'Sağ Orta Saha',
  LW:  'Sol Kanat',
  RW:  'Sağ Kanat',
  ST:  'Santrfor',
  CF:  'Forvet Arkası',
};

// ─── Size presets ───
const SIZE_MAP = {
  sm: { width: 'w-full', height: 'h-[140px]', dotPrimary: 'w-3 h-3', dotSecondary: 'w-2 h-2', labelSize: 'text-[10px]', tooltipSize: 'text-[10px]', padding: 'p-2' },
  md: { width: 'w-full', height: 'h-[200px]', dotPrimary: 'w-4 h-4', dotSecondary: 'w-2.5 h-2.5', labelSize: 'text-[10px]', tooltipSize: 'text-[10px]', padding: 'p-3' },
  lg: { width: 'w-full', height: 'h-[280px]', dotPrimary: 'w-5 h-5', dotSecondary: 'w-3 h-3', labelSize: 'text-[10px]', tooltipSize: 'text-[10px]', padding: 'p-4' },
};

interface PlayerPositionMapProps {
  specificPosition?: string;
  secondaryPositions?: string[];
  size?: 'sm' | 'md' | 'lg';
}

export default function PlayerPositionMap({
  specificPosition,
  secondaryPositions = [],
  size = 'md',
}: PlayerPositionMapProps) {
  const [hoveredPos, setHoveredPos] = useState<string | null>(null);
  const s = SIZE_MAP[size];
  const primary = specificPosition || 'CM';

  // Get primary coords
  const primaryCoords = POSITION_COORDS[primary] || POSITION_COORDS.CM;

  // Get secondary coords
  const secondaryCoords = secondaryPositions
    .filter(pos => pos !== primary)
    .map(pos => ({
      pos,
      coords: POSITION_COORDS[pos],
    }))
    .filter(item => item.coords);

  return (
    <div className={`${s.padding}`}>
      {/* Label */}
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-1.5">Saha Yerleşimi</div>

      {/* Pitch container */}
      <div
        className={`relative ${s.width} ${s.height} rounded-md overflow-hidden border border-white/[0.08]`}
        style={{
          background: 'linear-gradient(135deg, rgba(6,78,59,0.3) 0%, rgba(6,95,70,0.2) 50%, rgba(4,60,42,0.25) 100%)',
        }}
      >
        {/* ── Pitch markings (SVG) ── */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pitch outline */}
          <rect
            x="4" y="5" width="92" height="90"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.4"
            rx="0.3"
          />

          {/* Halfway line */}
          <line
            x1="50" y1="5" x2="50" y2="95"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.3"
          />

          {/* Center circle */}
          <circle
            cx="50" cy="50" r="12"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.3"
          />

          {/* Center dot */}
          <circle
            cx="50" cy="50" r="0.7"
            fill="rgba(255,255,255,0.15)"
          />

          {/* Left penalty area */}
          <rect
            x="4" y="26" width="14" height="48"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.3"
          />

          {/* Left goal area */}
          <rect
            x="4" y="36" width="6" height="28"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.3"
          />

          {/* Right penalty area */}
          <rect
            x="82" y="26" width="14" height="48"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.3"
          />

          {/* Right goal area */}
          <rect
            x="90" y="36" width="6" height="28"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.3"
          />

          {/* Left goal posts */}
          <line x1="4" y1="42" x2="1.5" y2="42" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
          <line x1="4" y1="58" x2="1.5" y2="58" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
          <line x1="1.5" y1="42" x2="1.5" y2="58" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />

          {/* Right goal posts */}
          <line x1="96" y1="42" x2="98.5" y2="42" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
          <line x1="96" y1="58" x2="98.5" y2="58" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
          <line x1="98.5" y1="42" x2="98.5" y2="58" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />

          {/* Left penalty arc */}
          <path
            d="M 18 39 A 10 10 0 0 1 18 61"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.3"
          />

          {/* Right penalty arc */}
          <path
            d="M 82 39 A 10 10 0 0 0 82 61"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.3"
          />

          {/* Penalty dots */}
          <circle cx="12" cy="50" r="0.5" fill="rgba(255,255,255,0.12)" />
          <circle cx="88" cy="50" r="0.5" fill="rgba(255,255,255,0.12)" />
        </svg>

        {/* ── Position zone highlights ── */}
        {/* Primary position zone glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${primaryCoords.left}%`,
            top: `${primaryCoords.top}%`,
            transform: 'translate(-50%, -50%)',
            width: size === 'sm' ? '36px' : size === 'md' ? '48px' : '60px',
            height: size === 'sm' ? '36px' : size === 'md' ? '48px' : '60px',
            background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0.05) 50%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* ── Secondary position dots ── */}
        {secondaryCoords.map(({ pos, coords }) => (
          <React.Fragment key={pos}>
            <div
              className={`absolute rounded-full border border-cyan-400/40 bg-cyan-400/20 cursor-pointer transition-transform duration-200 hover:scale-125 ${s.dotSecondary}`}
              style={{
                left: `${coords.left}%`,
                top: `${coords.top}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseEnter={() => setHoveredPos(pos)}
              onMouseLeave={() => setHoveredPos(null)}
            />
            {/* Tooltip for secondary */}
            {hoveredPos === pos && (
              <div
                className={`absolute z-50 px-2 py-1 rounded bg-zinc-900/95 border border-cyan-500/30 shadow-xl pointer-events-none whitespace-nowrap ${s.tooltipSize} font-bold text-cyan-300`}
                style={{
                  left: `${coords.left}%`,
                  top: `${coords.top}%`,
                  transform: 'translate(-50%, calc(-100% - 8px))',
                }}
              >
                {POS_LABELS_TR[pos] || localizePosFull(pos) || pos}
              </div>
            )}
          </React.Fragment>
        ))}

        {/* ── Primary position dot ── */}
        <div
          className={`absolute rounded-full bg-amber-400 border-2 border-amber-300/80 cursor-pointer z-10 ${s.dotPrimary}`}
          style={{
            left: `${primaryCoords.left}%`,
            top: `${primaryCoords.top}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 8px 2px rgba(251,191,36,0.4)',
            animation: 'positionPulse 2s ease-in-out infinite',
          }}
          onMouseEnter={() => setHoveredPos(primary)}
          onMouseLeave={() => setHoveredPos(null)}
        />
        {/* Pulse ring for primary */}
        <div
          className="absolute rounded-full bg-amber-400/20 pointer-events-none"
          style={{
            left: `${primaryCoords.left}%`,
            top: `${primaryCoords.top}%`,
            transform: 'translate(-50%, -50%)',
            width: size === 'sm' ? '20px' : size === 'md' ? '28px' : '36px',
            height: size === 'sm' ? '20px' : size === 'md' ? '28px' : '36px',
            animation: 'positionPulseRing 2s ease-in-out infinite',
          }}
        />

        {/* Tooltip for primary */}
        {hoveredPos === primary && (
          <div
            className={`absolute z-50 px-2.5 py-1 rounded bg-zinc-900/95 border border-amber-500/30 shadow-xl pointer-events-none whitespace-nowrap ${s.tooltipSize} font-bold text-amber-300`}
            style={{
              left: `${primaryCoords.left}%`,
              top: `${primaryCoords.top}%`,
              transform: 'translate(-50%, calc(-100% - 12px))',
            }}
          >
            {POS_LABELS_TR[primary] || localizePosFull(primary) || primary}
          </div>
        )}

        {/* ── Position abbreviation labels ── */}
        <span
          className={`absolute font-black uppercase ${s.labelSize} text-amber-400/70 pointer-events-none whitespace-nowrap`}
          style={{
            left: `${primaryCoords.left}%`,
            top: `calc(${primaryCoords.top}% + ${size === 'sm' ? '10' : size === 'md' ? '14' : '18'}px)`,
            transform: 'translateX(-50%)',
          }}
        >
          {primary}
        </span>
        {secondaryCoords.map(({ pos, coords }) => (
          <span
            key={`label-${pos}`}
            className={`absolute font-bold uppercase ${s.labelSize} text-cyan-400/50 pointer-events-none whitespace-nowrap`}
            style={{
              left: `${coords.left}%`,
              top: `calc(${coords.top}% + ${size === 'sm' ? '8' : size === 'md' ? '10' : '14'}px)`,
              transform: 'translateX(-50%)',
            }}
          >
            {pos}
          </span>
        ))}

        {/* ── CSS Keyframes (global for inline animation references) ── */}
        <style jsx global>{`
          @keyframes positionPulse {
            0%, 100% { box-shadow: 0 0 8px 2px rgba(251,191,36,0.4); }
            50% { box-shadow: 0 0 14px 4px rgba(251,191,36,0.6); }
          }
          @keyframes positionPulseRing {
            0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
          }
        `}</style>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-1.5">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-400 border border-amber-300/80" />
          <span className="text-[10px] text-white/30 font-bold uppercase">Ana Mevki</span>
        </div>
        {secondaryPositions.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 border border-cyan-400/40" />
            <span className="text-[10px] text-white/30 font-bold uppercase">Yan Mevki</span>
          </div>
        )}
      </div>
    </div>
  );
}
