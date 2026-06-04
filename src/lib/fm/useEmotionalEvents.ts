'use client';

import { useState, useEffect } from 'react';
import { useMatchContext } from './MatchContext';
import { playSound } from '@/utils/sound';

/**
 * useEmotionalEvents — Duygusal katman: Gol kutlama ve diğer
 * maç içi duygusal olayları dinleyip animasyon state'ini yönetir.
 */
export function useEmotionalEvents() {
  const { matchState } = useMatchContext();

  // Gol kutlama state
  const [goalCelebrationTrigger, setGoalCelebrationTrigger] = useState(false);
  const [goalScorer, setGoalScorer] = useState<string | undefined>();
  const [goalMinute, setGoalMinute] = useState<number | undefined>();

  // Maç olaylarını dinle ve gol kutlamasını tetikle
  useEffect(() => {
    if (!matchState.isActive || !matchState.result?.events) return;
    const events = matchState.result.events as Array<{ type: string; player?: string; minute: number; team?: string }>;
    const lastEvent = events[events.length - 1];
    if (lastEvent?.type === 'GOAL' && lastEvent.team === 'HOME') {
      setGoalScorer(lastEvent.player);
      setGoalMinute(lastEvent.minute);
      setGoalCelebrationTrigger(true);
      playSound('goal');
      setTimeout(() => setGoalCelebrationTrigger(false), 2600);
    }
  }, [matchState.result?.events?.length, matchState.isActive]);

  return {
    goalCelebrationTrigger,
    setGoalCelebrationTrigger,
    goalScorer,
    goalMinute,
  };
}
