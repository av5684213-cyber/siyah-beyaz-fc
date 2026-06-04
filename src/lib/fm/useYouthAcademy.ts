'use client';

import { useState, useEffect, useRef } from 'react';
import { loadYouthPlayers, saveYouthPlayers, loadYouthFacilities, saveYouthFacilities } from '@/lib/fm/persistence';

export function useYouthAcademy(profileId: string | null) {
  const [youthPlayers, setYouthPlayers] = useState<any[]>([]);
  const [youthFacilities, setYouthFacilities] = useState<Record<string, number>>({});

  // Track whether initial load has completed to avoid saving empty state
  const youthFacilitiesLoadedRef = useRef(false);

  // Load youth players + facilities on profile load
  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    (async () => {
      try {
        const [loadedPlayers, loadedFacilities] = await Promise.all([
          loadYouthPlayers(profileId),
          loadYouthFacilities(profileId),
        ]);
        if (!cancelled) {
          if (loadedPlayers.length > 0) setYouthPlayers(loadedPlayers);
          // Always set loaded facilities (even empty) to sync state with DB
          setYouthFacilities(loadedFacilities);
          youthFacilitiesLoadedRef.current = true;
        }
      } catch (err) {
        console.error('[Youth Academy] Veri yükleme hatası:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [profileId]);

  // Auto-sync youthFacilities → Supabase when state changes (after initial load)
  useEffect(() => {
    if (!profileId) return;
    if (!youthFacilitiesLoadedRef.current) return; // Don't save before initial load completes
    if (Object.keys(youthFacilities).length === 0) return; // Don't save empty state
    saveYouthFacilities(youthFacilities, profileId);
  }, [youthFacilities, profileId]);

  return {
    youthPlayers,
    setYouthPlayers,
    youthFacilities,
    setYouthFacilities,
  };
}
