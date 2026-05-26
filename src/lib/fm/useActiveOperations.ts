'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook that manages the active operations (match preparations) state.
 * Loads match preparations from persistence whenever userId or activeTab changes.
 */
export function useActiveOperations(userId: string | null, activeTab: string) {
  const [activeOperations, setActiveOperations] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      import('@/lib/fm/persistence').then(({ getMatchPreparations }) => {
        getMatchPreparations(userId).then(preps => {
          if (preps) setActiveOperations(preps.filter(Boolean) as string[]);
        });
      });
    }
  }, [userId, activeTab]);

  return { activeOperations, setActiveOperations };
}
