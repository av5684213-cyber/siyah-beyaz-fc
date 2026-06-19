/**
 * Canlı Maç Senkronizasyon Hook'u
 *
 * Maç durumunu sunucu ile senkronize eder.
 * Sayfa yenilendiğinde veya tarayıcı kapatıldığında maç durumu kaybolmaz.
 * Supabase Realtime ile match_sessions değişikliklerini dinler.
 *
 * Kullanım:
 *   const { matchState, isLoading, error, refetch } = useLiveMatchSync(matchId);
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabase } from '@/lib/supabase';

export interface LiveMatchState {
  id: string;
  home_score: number;
  away_score: number;
  current_minute: number;
  status: string; // 'upcoming' | 'live' | 'halftime' | 'completed'
  home_team_name: string;
  away_team_name: string;
  competition_type?: string;
  updated_at: string;
}

interface UseLiveMatchSyncOptions {
  /** Polling interval in ms (default: 10000 = 10 seconds) */
  pollInterval?: number;
  /** Enable Supabase Realtime subscription (default: true) */
  enableRealtime?: boolean;
  /** Auto-refetch on window focus (default: true) */
  refetchOnFocus?: boolean;
}

interface UseLiveMatchSyncResult {
  matchState: LiveMatchState | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
  isLive: boolean;
}

export function useLiveMatchSync(
  matchId: string | null,
  options: UseLiveMatchSyncOptions = {}
): UseLiveMatchSyncResult {
  const { pollInterval = 10000, enableRealtime = true, refetchOnFocus = true } = options;

  const [matchState, setMatchState] = useState<LiveMatchState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const subscriptionRef = useRef<any>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMatchState = useCallback(async () => {
    if (!matchId) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabase();
      if (!supabase) {
        setError('Supabase yapılandırılmamış');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('match_sessions')
        .select('id, home_score, away_score, current_minute, status, home_team_name, away_team_name, competition_type, updated_at')
        .eq('id', matchId)
        .maybeSingle();

      if (fetchError) {
        setError(`Maç durumu alınamadı: ${fetchError.message}`);
        return;
      }

      if (data) {
        setMatchState(data as LiveMatchState);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError(`Senkronizasyon hatası: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  // İlk yükleme
  useEffect(() => {
    if (matchId) {
      fetchMatchState();
    }
  }, [matchId, fetchMatchState]);

  // Polling — sadece maç canlıyken
  useEffect(() => {
    if (!matchId || !matchState) return;

    // Maç tamamlandıysa polling yapma
    if (matchState.status === 'completed') return;

    pollIntervalRef.current = setInterval(() => {
      fetchMatchState();
    }, pollInterval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [matchId, matchState?.status, pollInterval, fetchMatchState]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!matchId || !enableRealtime) return;

    const supabase = getSupabase();
    if (!supabase) return;

    try {
      subscriptionRef.current = supabase
        .channel(`match-${matchId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'match_sessions',
            filter: `id=eq.${matchId}`,
          },
          (payload: any) => {
            if (payload.new) {
              setMatchState(payload.new as LiveMatchState);
              setLastUpdated(new Date());
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[useLiveMatchSync] Realtime subscription failed:', err);
    }

    return () => {
      if (subscriptionRef.current) {
        try {
          supabase.removeChannel(subscriptionRef.current);
        } catch (e) { console.warn("[silent-catch]", e); }
        subscriptionRef.current = null;
      }
    };
  }, [matchId, enableRealtime]);

  // Window focus'ta yeniden yükle
  useEffect(() => {
    if (!refetchOnFocus || !matchId) return;

    const handleFocus = () => {
      fetchMatchState();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [matchId, refetchOnFocus, fetchMatchState]);

  const isLive = matchState?.status === 'live' || matchState?.status === 'halftime';

  return {
    matchState,
    isLoading,
    error,
    refetch: fetchMatchState,
    lastUpdated,
    isLive,
  };
}
