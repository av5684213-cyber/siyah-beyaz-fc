import { useState, useEffect } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { CupSeason } from '@/lib/fm/cupSystem';

export function useCupSeasons(profileId: string | undefined, teamName: string) {
  const [cupSeasons, setCupSeasons] = useState<CupSeason[]>([]);

  useEffect(() => {
    if (!profileId || !isSupabaseConfigured()) return;
    fetch(`/api/cups/my-seasons?profileId=${profileId}&teamName=${encodeURIComponent(teamName || '')}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCupSeasons(data); })
      .catch(() => {});
  }, [profileId, teamName]);

  return {
    cupSeasons,
    setCupSeasons,
  };
}
