'use client';
import React, { createContext, useContext, useState } from 'react';
import type { MatchState } from './types';

function getDefaultMatchState(): MatchState {
  return {
    minute: 0,
    score: { home: 0, away: 0 },
    result: null,
    visibleEvents: [],
    matchSummaryEvents: { home: [], away: [] },
    isActive: false,
    isFinished: false,
    isPaused: false,
    playerConditions: {},
  };
}

interface MatchContextValue {
  matchState: MatchState;
  setMatchState: React.Dispatch<React.SetStateAction<MatchState>>;
}

const MatchContext = createContext<MatchContextValue | null>(null);

export const MatchProvider = ({ children }: { children: React.ReactNode }) => {
  const [matchState, setMatchState] = useState<MatchState>(getDefaultMatchState());
  return (
    <MatchContext.Provider value={{ matchState, setMatchState }}>
      {children}
    </MatchContext.Provider>
  );
};

export const useMatchContext = (): MatchContextValue => {
  const ctx = useContext(MatchContext);
  if (!ctx) throw new Error('useMatchContext must be used within MatchProvider');
  return ctx;
};
