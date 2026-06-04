'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface MatchEvent {
  type: string;
  minute: number;
  team: 'home' | 'away';
  playerName?: string;
}

interface MatchProgressBarProps {
  currentMinute: number;
  isCompleted: boolean;
  isPaused: boolean;
  events: MatchEvent[];
  homeTeamName: string;
  awayTeamName: string;
}

// Event types that should show markers on the progress bar
const GOAL_TYPES = new Set(['goal', 'penalty_goal']);
const CARD_TYPES = new Set(['yellow_card', 'second_yellow']);
const RED_CARD_TYPES = new Set(['red_card']);

export default function MatchProgressBar({
  currentMinute,
  isCompleted,
  isPaused,
  events,
  homeTeamName,
  awayTeamName,
}: MatchProgressBarProps) {
  const [displayMinute, setDisplayMinute] = useState(currentMinute);
  const [countdown, setCountdown] = useState(90 - currentMinute);

  // Smooth animation between minute changes
  useEffect(() => {
    setDisplayMinute(currentMinute);
    setCountdown(Math.max(0, 90 - currentMinute));
  }, [currentMinute]);

  // Countdown timer ticks every second
  useEffect(() => {
    if (isCompleted || isPaused) return;
    const interval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted, isPaused, currentMinute]);

  const progressPercent = useMemo(() => {
    return Math.min(100, (displayMinute / 90) * 100);
  }, [displayMinute]);

  // Filter events for markers
  const keyEvents = useMemo(() => {
    return events.filter(
      e => GOAL_TYPES.has(e.type) || CARD_TYPES.has(e.type) || RED_CARD_TYPES.has(e.type)
    );
  }, [events]);

  const formatCountdown = (mins: number) => {
    const m = Math.floor(mins);
    const s = Math.floor((mins - m) * 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 rounded-xl p-3 sm:p-4 mb-4 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-400">
            {isCompleted ? (
              <span className="text-amber-400">MAÇ BİTTİ</span>
            ) : isPaused ? (
              <span className="text-amber-400">DEVRE ARASI</span>
            ) : (
              <>Dk. {displayMinute}&apos;</>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!isCompleted && (
            <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1 rounded-lg">
              <span className="text-xs text-gray-500">Kalan:</span>
              <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                {formatCountdown(countdown)}
              </span>
            </div>
          )}
          <span className="text-xs text-gray-600 font-mono tabular-nums">
            {displayMinute}/90
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden">
        {/* Background gradient for played time */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Half-time marker at 45' */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-gray-600/50 z-10" />
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 font-mono z-10 bg-gray-800 px-1 rounded">
          45&apos;
        </div>

        {/* Key event markers */}
        {keyEvents.map((event, i) => {
          const leftPercent = (event.minute / 90) * 100;
          const isGoal = GOAL_TYPES.has(event.type);
          const isYellowCard = CARD_TYPES.has(event.type);
          const isRedCard = RED_CARD_TYPES.has(event.type);
          const isHome = event.team === 'home';

          return (
            <div
              key={`${event.minute}-${event.type}-${i}`}
              className="absolute z-20 flex flex-col items-center"
              style={{
                left: `${leftPercent}%`,
                top: isHome ? '0' : '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold shadow-md ${
                  isGoal
                    ? 'bg-emerald-500 text-white ring-1 ring-emerald-300'
                    : isRedCard
                    ? 'bg-red-500 text-white ring-1 ring-red-300'
                    : isYellowCard
                    ? 'bg-yellow-400 text-black ring-1 ring-yellow-300'
                    : 'bg-gray-400'
                }`}
                title={`${event.minute}' ${event.type} ${event.playerName || ''}`}
              >
                {isGoal ? '⚽' : isRedCard ? '🔴' : isYellowCard ? '🟡' : '•'}
              </div>
              <span className="text-[7px] text-gray-400 font-mono mt-0.5">{event.minute}&apos;</span>
            </div>
          );
        })}

        {/* Current time indicator */}
        {!isCompleted && (
          <div
            className="absolute top-0 h-full w-0.5 bg-white z-30 shadow-lg shadow-white/50 transition-all duration-1000 ease-out"
            style={{ left: `${progressPercent}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg" />
          </div>
        )}
      </div>

      {/* Team labels */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-gray-500 truncate max-w-[45%]">{homeTeamName}</span>
        <span className="text-[10px] text-gray-600">0 — 90&apos;</span>
        <span className="text-[10px] text-gray-500 truncate max-w-[45%] text-right">{awayTeamName}</span>
      </div>

      {/* Event legend */}
      {keyEvents.length > 0 && (
        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-800">
          <div className="flex items-center gap-1">
            <span className="text-xs">⚽</span>
            <span className="text-[9px] text-gray-500">Gol</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-[9px] text-gray-500">Sarı Kart</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[9px] text-gray-500">Kırmızı Kart</span>
          </div>
        </div>
      )}
    </div>
  );
}
