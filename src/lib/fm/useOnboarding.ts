'use client';

import { useState, useEffect } from 'react';
import { shouldShowOnboarding } from '@/components/OnboardingTutorial';

export function useOnboarding(profileId: string | undefined) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (profileId) {
      void shouldShowOnboarding(profileId).then(setShowOnboarding);
    }
  }, [profileId]);

  return { showOnboarding, setShowOnboarding };
}
