'use client';

/**
 * BUG-3: Canlı Maç İzleme Sayfası
 *
 * Features:
 * - Supabase Realtime subscription to match_live_state changes
 * - Score display, minute counter, event feed (scrollable list)
 * - "Taktik Müdahale" button when paused (3 uses, 20s timer)
 * - Match completion shows final stats
 * - Auto-simulation with 30s interval
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import type { ActiveTactic } from '@/lib/fm/types';
import MatchProgressBar from '@/components/match/MatchProgressBar';

// ─── Event Icons ──────────────────────────────────────────────────────────
const EVENT_ICONS: Record<string, string> = {
  goal: '⚽',
  penalty_goal: '⚽(P)',
  yellow_card: '🟨',
  red_card: '🟥',
  second_yellow: '🟨🟥',
  injury: '🏥',
  substitution: '🔄',
  halftime: '⏸️',
  fulltime: '🏁',
  offside: '🚩',
  corner: '🚩',
  foul: '⚠️',
  chance: '🔥',
  shot_saved: '🧤',
  shot_wide: '💨',
  shot_post: '🎯',
  save: '🧤',
  tackle: '🛡️',
  interception: '✋',
  var_review: '📺',
  goal_overturned: '📺❌',
  TACTICAL_CHANGE: '📋',
  free_kick: '🎯',
  penalty: '⚡',
};

// ─── Interfaces ───────────────────────────────────────────────────────────
interface MatchEvent {
  id?: string;
  type: string;
  minute: number;
  team: string;
  playerName?: string;
  playerId?: string;
  assistPlayerName?: string;
  description: string;
  x?: number;
  y?: number;
  ratingImpact?: number;
}

interface MatchStats {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passAccuracy: number;
  tackles: number;
  interceptions: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  corners: number;
  freeKicks: number;
  offsides: number;
  injuries: number;
  saves: number;
}

interface PlayerMatchRating {
  playerId: string;
  playerName: string;
  position: string;
  rating: number;
  goals: number;
  assists: number;
}

interface LiveState {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeProfileId?: string | null;
  awayProfileId?: string | null;
  currentMinute: number;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  isPaused: boolean;
  isCompleted: boolean;
  halftime?: boolean;
  homeTactic?: ActiveTactic;
  awayTactic?: ActiveTactic;
  homeStats?: MatchStats;
  awayStats?: MatchStats;
  homePlayerRatings?: PlayerMatchRating[];
  awayPlayerRatings?: PlayerMatchRating[];
  manOfTheMatch?: string;
  homeTacticInterventions?: number;
  awayTacticInterventions?: number;
  pendingTacticChange?: {
    teamSide: 'home' | 'away';
    tactics: any;
    effectiveAtMinute: number;
  } | null;
  currentSegment?: number;
  totalSegments?: number;
}

const MAX_TACTIC_USES = 3;
const TACTIC_TIMER_SECONDS = 20;
const SEGMENT_REAL_WAIT = 30; // seconds between auto-simulate steps

export default function LiveMatchPage() {
  const params = useParams();
  const matchId = params?.id as string;

  const [state, setState] = useState<LiveState | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tacticModalOpen, setTacticModalOpen] = useState(false);
  const [tacticCountdown, setTacticCountdown] = useState(TACTIC_TIMER_SECONDS);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [teamSide, setTeamSide] = useState<'home' | 'away' | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [tacticApplied, setTacticApplied] = useState(false);
  const [pendingTacticInfo, setPendingTacticInfo] = useState<string | null>(null);

  const tacticTimerRef = useRef<NodeJS.Timeout | null>(null);
  const eventsEndRef = useRef<HTMLDivElement | null>(null);
  const simulateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Profile ID'yi localStorage'dan al ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fm_profile');
      if (stored) {
        const p = JSON.parse(stored);
        setProfileId(p?.id || null);
      }
    } catch {}
  }, []);

  // ─── Team side tespiti ──
  useEffect(() => {
    if (!profileId || !state) return;
    if (state.homeProfileId === profileId) setTeamSide('home');
    else if (state.awayProfileId === profileId) setTeamSide('away');
  }, [profileId, state?.homeProfileId, state?.awayProfileId]);

  // ─── Maçı başlat ──
  const startMatch = useCallback(async () => {
    if (!matchId) return;
    try {
      const res = await fetch('/api/match/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', matchId }),
      });
      const data = await res.json();
      if (data.success && data.state) {
        setState(data.state);
        setEvents(data.state.events || []);
        setLoading(false);
      } else {
        setError(data.error || 'Maç başlatılamadı');
        setLoading(false);
      }
    } catch (err) {
      setError('Bağlantı hatası');
      setLoading(false);
    }
  }, [matchId]);

  // ─── Simülasyon adımı ──
  const simulateStep = useCallback(async () => {
    if (!matchId || !state || state.isCompleted || isSimulating) return;
    setIsSimulating(true);
    try {
      const res = await fetch('/api/match/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate_step', matchId }),
      });
      const data = await res.json();
      if (data.success && data.state) {
        setState(data.state);
        setEvents(data.state.events || []);
        // Pending tactic info güncelle
        if (data.state.pendingTacticChange) {
          setPendingTacticInfo(
            `Taktik ${data.state.pendingTacticChange.effectiveAtMinute}. dakikada etkili olacak`
          );
        } else {
          setPendingTacticInfo(null);
        }
      }
    } catch (err) {
      console.error('Simülasyon adımı hatası:', err);
    } finally {
      setIsSimulating(false);
    }
  }, [matchId, state?.isCompleted, isSimulating]);

  // ─── Devam et (duraklamadan) ──
  const resumeMatch = useCallback(async () => {
    if (!matchId) return;
    try {
      const res = await fetch('/api/match/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume', matchId }),
      });
      const data = await res.json();
      if (data.success && data.state) {
        setState(data.state);
      }
    } catch (err) {
      console.error('Devam hatası:', err);
    }
  }, [matchId]);

  // ─── Taktik müdahalesi ──
  const applyTactics = useCallback(async (tactics: Partial<ActiveTactic>) => {
    if (!matchId || !profileId) return;
    try {
      const res = await fetch('/api/match/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply_tactics',
          matchId,
          profileId,
          tactics,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTacticModalOpen(false);
        setTacticApplied(true);
        setTimeout(() => setTacticApplied(false), 3000);
        if (tacticTimerRef.current) clearInterval(tacticTimerRef.current);
        // State'i güncelle
        if (data.state) {
          setState(data.state);
          setEvents(data.state.events || []);
        } else {
          // State yoksa tekrar fetch et
          simulateStep();
        }
      } else {
        alert(data.error || 'Taktik uygulanamadı');
      }
    } catch (err) {
      console.error('Taktik müdahale hatası:', err);
    }
  }, [matchId, profileId, simulateStep]);

  // ─── İlk yükleme ──
  useEffect(() => {
    startMatch();
  }, [startMatch]);

  // ─── Realtime aboneliği — match_live_state tablosu ──
  useEffect(() => {
    if (!matchId) return;

    let supabaseClient: any = null;
    try {
      supabaseClient = createBrowserClient();
    } catch {
      return;
    }
    if (!supabaseClient) return;

    const channel = supabaseClient
      .channel(`match_live:${matchId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'match_live_state',
        filter: `match_id=eq.${matchId}`,
      }, (payload: any) => {
        if (payload.new?.state_json) {
          const newState = typeof payload.new.state_json === 'string'
            ? JSON.parse(payload.new.state_json)
            : payload.new.state_json;
          setState(prev => {
            // Sadece daha yeni bir state ise güncelle
            if (!prev || (newState.currentMinute >= prev.currentMinute)) {
              return newState;
            }
            return prev;
          });
          setEvents(newState.events || []);
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'match_events',
        filter: `fixture_id=eq.${matchId}`,
      }, (payload: any) => {
        const newEvent: MatchEvent = {
          id: payload.new?.id,
          type: payload.new?.event_type,
          minute: payload.new?.minute,
          team: payload.new?.team,
          playerName: payload.new?.player_name,
          description: payload.new?.detail || '',
        };
        setEvents(prev => {
          // Tekrar eklemeyi önle
          if (prev.some(e => e.minute === newEvent.minute && e.type === newEvent.type && e.playerName === newEvent.playerName)) {
            return prev;
          }
          return [...prev, newEvent];
        });
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [matchId]);

  // ─── Otomatik simülasyon ──
  useEffect(() => {
    if (!state || state.isCompleted) return;

    // Temizle
    if (simulateIntervalRef.current) {
      clearInterval(simulateIntervalRef.current);
      simulateIntervalRef.current = null;
    }

    if (state.isPaused) return; // Duraklamada simüle etme

    simulateIntervalRef.current = setInterval(() => {
      simulateStep();
    }, SEGMENT_REAL_WAIT * 1000);

    return () => {
      if (simulateIntervalRef.current) {
        clearInterval(simulateIntervalRef.current);
      }
    };
  }, [state?.isCompleted, state?.isPaused, state?.currentMinute, simulateStep]);

  // ─── Taktik müdahale geri sayımı ──
  useEffect(() => {
    if (!tacticModalOpen) return;

    setTacticCountdown(TACTIC_TIMER_SECONDS);
    tacticTimerRef.current = setInterval(() => {
      setTacticCountdown(prev => {
        if (prev <= 1) {
          setTacticModalOpen(false);
          if (tacticTimerRef.current) clearInterval(tacticTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (tacticTimerRef.current) clearInterval(tacticTimerRef.current);
    };
  }, [tacticModalOpen]);

  // ─── Olay listesini otomatik kaydır ──
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  // ─── Müdahale sayısı ──
  const interventionsUsed = teamSide === 'home'
    ? (state?.homeTacticInterventions || 0)
    : (state?.awayTacticInterventions || 0);
  const canIntervene = state?.isPaused && !state?.isCompleted && interventionsUsed < MAX_TACTIC_USES;

  // ─── Render ──────────────────────────────────────────────────────────────

  // ─── Auto-scroll to analysis section on match completion ──
  const analysisRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (state?.isCompleted && analysisRef.current) {
      setTimeout(() => {
        analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [state?.isCompleted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 max-w-4xl mx-auto">
        {/* Loading skeleton */}
        <div className="animate-pulse space-y-4">
          {/* Scoreboard skeleton */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-center gap-6">
              <div className="flex-1 text-right space-y-2">
                <div className="h-3 bg-gray-800 rounded w-12 ml-auto" />
                <div className="h-5 bg-gray-800 rounded w-24 ml-auto" />
              </div>
              <div className="text-center space-y-2">
                <div className="h-10 bg-gray-800 rounded w-20 mx-auto" />
                <div className="h-3 bg-gray-800 rounded w-16 mx-auto" />
              </div>
              <div className="flex-1 text-left space-y-2">
                <div className="h-3 bg-gray-800 rounded w-12" />
                <div className="h-5 bg-gray-800 rounded w-24" />
              </div>
            </div>
            <div className="mt-4 h-2 bg-gray-800 rounded-full" />
          </div>
          {/* Progress bar skeleton */}
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 bg-gray-800 rounded w-16" />
              <div className="h-4 bg-gray-800 rounded w-20" />
            </div>
            <div className="h-8 bg-gray-800 rounded-full" />
          </div>
          {/* Stats skeleton */}
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 space-y-3">
            <div className="h-4 bg-gray-800 rounded w-24" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-3 bg-gray-800 rounded w-full" />
              ))}
            </div>
          </div>
          {/* Events skeleton */}
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 space-y-2">
            <div className="h-4 bg-gray-800 rounded w-24" />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 bg-gray-800 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={startMatch}
            className="px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!state) return null;

  const progressPercent = Math.min(100, (state.currentMinute / 90) * 100);

  // ─── Gol olaylarını hesapla ──
  const homeGoals = events.filter(e => e.type === 'goal' && e.team === 'home');
  const awayGoals = events.filter(e => e.type === 'goal' && e.team === 'away');

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 max-w-4xl mx-auto">
      {/* ── Maç İlerleme Çubuğu ── */}
      <MatchProgressBar
        currentMinute={state.currentMinute}
        isCompleted={state.isCompleted}
        isPaused={state.isPaused || false}
        events={events.map(e => ({
          type: e.type,
          minute: e.minute,
          team: (e.team === 'home' ? 'home' : 'away') as 'home' | 'away',
          playerName: e.playerName,
        }))}
        homeTeamName={state.homeTeamName}
        awayTeamName={state.awayTeamName}
      />

      {/* ── Skor Tabelası ── */}
      <div className="bg-gray-900 rounded-xl p-4 sm:p-6 mb-4 text-center border border-gray-800">
        <div className="flex items-center justify-center gap-2 sm:gap-6">
          <div className="flex-1 text-right min-w-0">
            <p className="text-sm text-gray-400">Ev Sahibi</p>
            <p className="text-lg sm:text-xl font-bold truncate">{state.homeTeamName}</p>
            {/* Gol atan oyuncular */}
            <div className="text-xs text-gray-500 mt-1">
              {homeGoals.map((g, i) => (
                <div key={i}>{g.playerName} {g.minute}&apos;</div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-black">
              <span className="text-emerald-400">{state.homeScore}</span>
              <span className="text-gray-600 mx-2">-</span>
              <span className="text-sky-400">{state.awayScore}</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {state.isCompleted ? (
                <span className="text-amber-400 font-bold">MAÇ BİTTİ</span>
              ) : state.isPaused ? (
                <span className="text-amber-400 font-bold">DEVRE ARASI</span>
              ) : (
                <span>Dk. {state.currentMinute}&apos;</span>
              )}
            </p>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm text-gray-400">Deplasman</p>
            <p className="text-lg sm:text-xl font-bold truncate">{state.awayTeamName}</p>
            {/* Gol atan oyuncular */}
            <div className="text-xs text-gray-500 mt-1">
              {awayGoals.map((g, i) => (
                <div key={i}>{g.playerName} {g.minute}&apos;</div>
              ))}
            </div>
          </div>
        </div>

        {/* İlerleme çubuğu */}
        <div className="mt-4 relative">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -top-1 text-xs text-gray-500">45&apos;</div>
        </div>

        {/* Durum bilgisi */}
        {state.isPaused && !state.isCompleted && (
          <div className="mt-3 bg-amber-900/20 border border-amber-700/30 rounded-lg p-2">
            <p className="text-amber-400 text-sm font-medium">
              ⏸️ Devre Arası — Taktik müdahalesi yapabilirsiniz
            </p>
            {interventionsUsed > 0 && (
              <p className="text-amber-400/60 text-xs mt-1">
                Müdahale hakkı: {interventionsUsed}/{MAX_TACTIC_USES}
              </p>
            )}
          </div>
        )}

        {/* Bekleyen taktik değişikliği bilgisi */}
        {pendingTacticInfo && !state.isCompleted && (
          <div className="mt-2 bg-blue-900/20 border border-blue-700/30 rounded-lg p-2">
            <p className="text-blue-400 text-sm">{pendingTacticInfo}</p>
          </div>
        )}

        {/* Taktik uygulandı bildirimi */}
        {tacticApplied && (
          <div className="mt-2 bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-2">
            <p className="text-emerald-400 text-sm font-medium">✅ Taktik değişikliği uygulandı!</p>
          </div>
        )}
      </div>

      {/* ── İstatistik Özet Çubuğu ── */}
      {state.homeStats && state.awayStats && (
        <div className="bg-gray-900 rounded-xl p-4 mb-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">İstatistikler</h3>
            <button
              onClick={() => setShowStats(!showStats)}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {showStats ? 'Gizle' : 'Detay'}
            </button>
          </div>

          {/* Kısa istatistik çubukları */}
          <div className="space-y-2">
            <StatBar
              homeValue={state.homeStats.possession}
              awayValue={state.awayStats.possession}
              label="Top Kaydı %"
              isPercent
            />
            <StatBar
              homeValue={state.homeStats.shots}
              awayValue={state.awayStats.shots}
              label="Şut"
            />
            <StatBar
              homeValue={state.homeStats.shotsOnTarget}
              awayValue={state.awayStats.shotsOnTarget}
              label="İsabetli Şut"
            />
          </div>

          {/* Detaylı istatistikler */}
          {showStats && (
            <div className="mt-3 space-y-2 border-t border-gray-800 pt-3">
              <StatBar homeValue={state.homeStats.passes} awayValue={state.awayStats.passes} label="Pas" />
              <StatBar homeValue={state.homeStats.passAccuracy} awayValue={state.awayStats.passAccuracy} label="Pas İsabeti %" isPercent />
              <StatBar homeValue={state.homeStats.tackles} awayValue={state.awayStats.tackles} label="Top Kapma" />
              <StatBar homeValue={state.homeStats.interceptions} awayValue={state.awayStats.interceptions} label="Kesme" />
              <StatBar homeValue={state.homeStats.fouls} awayValue={state.awayStats.fouls} label="Faul" />
              <StatBar homeValue={state.homeStats.corners} awayValue={state.awayStats.corners} label="Korner" />
              <StatBar homeValue={state.homeStats.yellowCards} awayValue={state.awayStats.yellowCards} label="Sarı Kart" />
              <StatBar homeValue={state.homeStats.redCards} awayValue={state.awayStats.redCards} label="Kırmızı Kart" />
              <StatBar homeValue={state.homeStats.saves} awayValue={state.awayStats.saves} label="Kurtarış" />
            </div>
          )}
        </div>
      )}

      {/* ── Olay Akışı ── */}
      <div className="bg-gray-900 rounded-xl p-4 mb-4 border border-gray-800 max-h-96 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Maç Olayları</h3>
        {events.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Henüz olay yok</p>
        ) : (
          <div className="space-y-1">
            {events.map((event, i) => (
              <div
                key={event.id || `${event.minute}-${event.type}-${i}`}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  event.type === 'goal'
                    ? 'bg-emerald-900/30 border border-emerald-700/30'
                    : event.type === 'red_card'
                    ? 'bg-red-900/30 border border-red-700/30'
                    : event.type === 'yellow_card'
                    ? 'bg-yellow-900/20 border border-yellow-700/20'
                    : event.type === 'injury'
                    ? 'bg-orange-900/20 border border-orange-700/20'
                    : event.type === 'TACTICAL_CHANGE'
                    ? 'bg-blue-900/20 border border-blue-700/20'
                    : event.type === 'chance'
                    ? 'bg-amber-900/15 border border-amber-700/15'
                    : 'bg-gray-800/30'
                }`}
              >
                <span className="text-xs text-gray-500 w-10 text-right font-mono">{event.minute}&apos;</span>
                <span className="text-sm w-8 text-center">
                  {EVENT_ICONS[event.type] || '•'}
                </span>
                <span className="flex-1 text-sm">
                  {event.playerName && (
                    <span className="font-medium">{event.playerName}</span>
                  )}
                  {event.assistPlayerName && (
                    <span className="text-gray-500 text-xs ml-1">(asist: {event.assistPlayerName})</span>
                  )}
                  {event.description && (
                    <span className="text-gray-400 ml-1">{event.description}</span>
                  )}
                </span>
                <span className="text-xs text-gray-600">
                  {event.team === 'home' ? state.homeTeamName : state.awayTeamName}
                </span>
              </div>
            ))}
            <div ref={eventsEndRef} />
          </div>
        )}
      </div>

      {/* ── Taktik Müdahale Butonu ── */}
      {!state.isCompleted && (
        <div className="text-center mb-4">
          {state.isPaused ? (
            <>
              <button
                onClick={() => {
                  if (canIntervene) {
                    setTacticModalOpen(true);
                  }
                }}
                disabled={!canIntervene}
                className={`w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                  canIntervene
                    ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canIntervene ? (
                  <>📋 Taktik Müdahale Et! ({MAX_TACTIC_USES - interventionsUsed} hak kaldı)</>
                ) : (
                  <>🚫 Müdahale hakkı kalmadı ({interventionsUsed}/{MAX_TACTIC_USES})</>
                )}
              </button>
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  onClick={resumeMatch}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-colors"
                >
                  ▶️ Devam Et
                </button>
                <p className="text-xs text-gray-600">
                  Devre arası — taktik değiştirin veya devam edin
                </p>
              </div>
            </>
          ) : (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-sm">
                ⏳ Maç devam ediyor — Dk. {state.currentMinute}&apos;
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Taktik müdahalesi sadece devre arası ve duraklamalarda yapılabilir
              </p>
              {interventionsUsed > 0 && (
                <p className="text-gray-600 text-xs mt-1">
                  Müdahale hakkı: {interventionsUsed}/{MAX_TACTIC_USES} kullanıldı
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Maç Sonu İstatistikleri ── */}
      {state.isCompleted && (
        <div ref={analysisRef} className="bg-gray-900 rounded-xl p-4 sm:p-6 mb-4 border border-amber-700/30">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-black text-amber-400 mb-2">Maç Sona Erdi</h2>
            <p className="text-lg">
              <span className="text-emerald-400 font-bold">{state.homeTeamName}</span>
              {' '}
              <span className="text-3xl font-black">
                {state.homeScore} - {state.awayScore}
              </span>
              {' '}
              <span className="text-sky-400 font-bold">{state.awayTeamName}</span>
            </p>
            {state.manOfTheMatch && (
              <p className="text-amber-300 text-sm mt-2">
                ⭐ Maçın Adamı: {state.manOfTheMatch}
              </p>
            )}
          </div>

          {/* Detaylı istatistik tablosu */}
          {state.homeStats && state.awayStats && (
            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Maç İstatistikleri</h3>
              <StatBar homeValue={state.homeStats.possession} awayValue={state.awayStats.possession} label="Top Kaydı %" isPercent />
              <StatBar homeValue={state.homeStats.shots} awayValue={state.awayStats.shots} label="Şut" />
              <StatBar homeValue={state.homeStats.shotsOnTarget} awayValue={state.awayStats.shotsOnTarget} label="İsabetli Şut" />
              <StatBar homeValue={state.homeStats.passes} awayValue={state.awayStats.passes} label="Pas" />
              <StatBar homeValue={state.homeStats.passAccuracy} awayValue={state.awayStats.passAccuracy} label="Pas İsabeti %" isPercent />
              <StatBar homeValue={state.homeStats.tackles} awayValue={state.awayStats.tackles} label="Top Kapma" />
              <StatBar homeValue={state.homeStats.interceptions} awayValue={state.awayStats.interceptions} label="Kesme" />
              <StatBar homeValue={state.homeStats.fouls} awayValue={state.awayStats.fouls} label="Faul" />
              <StatBar homeValue={state.homeStats.corners} awayValue={state.awayStats.corners} label="Korner" />
              <StatBar homeValue={state.homeStats.yellowCards} awayValue={state.awayStats.yellowCards} label="Sarı Kart" />
              <StatBar homeValue={state.homeStats.redCards} awayValue={state.awayStats.redCards} label="Kırmızı Kart" />
              <StatBar homeValue={state.homeStats.saves} awayValue={state.awayStats.saves} label="Kurtarış" />
            </div>
          )}

          {/* Oyuncu rating'leri */}
          {state.homePlayerRatings && state.awayPlayerRatings && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-emerald-400 mb-2">{state.homeTeamName}</h4>
                <PlayerRatingsList ratings={state.homePlayerRatings} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-sky-400 mb-2">{state.awayTeamName}</h4>
                <PlayerRatingsList ratings={state.awayPlayerRatings} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Taktik Müdahale Modal ── */}
      {tacticModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Taktik Müdahale</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {interventionsUsed + 1}/{MAX_TACTIC_USES}
                </span>
                <span className="text-amber-400 font-mono text-lg bg-amber-900/30 px-2 py-1 rounded">
                  {tacticCountdown}s
                </span>
              </div>
            </div>

            <div className="mb-3 bg-amber-900/20 border border-amber-700/30 rounded-lg p-2">
              <p className="text-amber-400 text-xs">
                ⏱️ Süre dolduğunda modal kapanır. Taktik değişikliği 2 dakikalık oyun gecikmesiyle uygulanır.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Formasyon</label>
                <select
                  id="tactic-formation"
                  className="w-full bg-gray-800 rounded-lg p-2 mt-1 border border-gray-700 focus:border-emerald-500 focus:outline-none"
                  defaultValue={teamSide === 'home' ? state.homeTactic?.formation : state.awayTactic?.formation || '4-4-2'}
                >
                  <option value="4-4-2">4-4-2</option>
                  <option value="4-3-3">4-3-3</option>
                  <option value="3-5-2">3-5-2</option>
                  <option value="5-3-2">5-3-2</option>
                  <option value="4-2-3-1">4-2-3-1</option>
                  <option value="3-4-3">3-4-3</option>
                  <option value="4-5-1">4-5-1</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400">
                  Mentalite: <span id="mentality-label" className="text-emerald-400">Dengeli</span>
                </label>
                <input
                  id="tactic-mentality"
                  type="range"
                  min="1"
                  max="5"
                  defaultValue={teamSide === 'home' ? state.homeTactic?.mentality : state.awayTactic?.mentality || 3}
                  className="w-full mt-1"
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    const labels: Record<number, string> = {
                      1: 'Çok Defansif',
                      2: 'Defansif',
                      3: 'Dengeli',
                      4: 'Hücum',
                      5: 'Çok Hücum',
                    };
                    const label = document.getElementById('mentality-label');
                    if (label) label.textContent = labels[val] || 'Dengeli';
                  }}
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Defansif</span>
                  <span>Dengeli</span>
                  <span>Hücum</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="tactic-pressing"
                  type="checkbox"
                  className="rounded accent-emerald-500"
                  defaultChecked={teamSide === 'home' ? state.homeTactic?.pressing : state.awayTactic?.pressing || false}
                />
                <label className="text-sm">Pressing</label>
              </div>

              <div>
                <label className="text-sm text-gray-400">Oyun Stili</label>
                <select
                  id="tactic-playstyle"
                  className="w-full bg-gray-800 rounded-lg p-2 mt-1 border border-gray-700 focus:border-emerald-500 focus:outline-none"
                  defaultValue={teamSide === 'home' ? state.homeTactic?.playStyle : state.awayTactic?.playStyle || 'dengeli'}
                >
                  <option value="dengeli">Dengeli</option>
                  <option value="hucum">Hücum</option>
                  <option value="savunma">Savunma</option>
                  <option value="kontra">Kontra Atak</option>
                  <option value="tikitaka">Tiki-Taka</option>
                </select>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    const formation = (document.getElementById('tactic-formation') as HTMLSelectElement)?.value || '4-4-2';
                    const mentality = parseInt((document.getElementById('tactic-mentality') as HTMLInputElement)?.value || '3');
                    const pressing = (document.getElementById('tactic-pressing') as HTMLInputElement)?.checked || false;
                    const playStyle = (document.getElementById('tactic-playstyle') as HTMLSelectElement)?.value || 'dengeli';
                    applyTactics({ formation, mentality, pressing, playStyle } as Partial<ActiveTactic>);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Uygula
                </button>
                <button
                  onClick={() => setTacticModalOpen(false)}
                  className="px-4 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Yardımcı Bileşenler ──────────────────────────────────────────────────

function StatBar({
  homeValue,
  awayValue,
  label,
  isPercent = false,
}: {
  homeValue: number;
  awayValue: number;
  label: string;
  isPercent?: boolean;
}) {
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`w-10 text-right font-mono ${homeValue > awayValue ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}>
        {homeValue}{isPercent ? '%' : ''}
      </span>
      <div className="flex-1 flex items-center gap-1">
        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${homePercent}%` }}
          />
        </div>
        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full transition-all float-right"
            style={{ width: `${100 - homePercent}%` }}
          />
        </div>
      </div>
      <span className={`w-10 text-left font-mono ${awayValue > homeValue ? 'text-sky-400 font-bold' : 'text-gray-400'}`}>
        {awayValue}{isPercent ? '%' : ''}
      </span>
    </div>
  );
}

function PlayerRatingsList({ ratings }: { ratings: PlayerMatchRating[] }) {
  if (!ratings || ratings.length === 0) return null;

  // Rating'e göre sırala
  const sorted = [...ratings].sort((a, b) => b.rating - a.rating);

  return (
    <div className="space-y-1 max-h-48 overflow-y-auto">
      {sorted.map((player) => (
        <div
          key={player.playerId}
          className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${
            player.rating >= 8
              ? 'bg-emerald-900/20'
              : player.rating >= 6.5
              ? 'bg-gray-800/30'
              : 'bg-red-900/10'
          }`}
        >
          <span className={`font-mono font-bold w-8 ${
            player.rating >= 8
              ? 'text-emerald-400'
              : player.rating >= 6.5
              ? 'text-gray-300'
              : 'text-red-400'
          }`}>
            {player.rating.toFixed(1)}
          </span>
          <span className="flex-1 truncate">{player.playerName}</span>
          <span className="text-gray-500">{player.position}</span>
          {player.goals > 0 && <span className="text-emerald-400">⚽{player.goals}</span>}
          {player.assists > 0 && <span className="text-sky-400">🅰️{player.assists}</span>}
        </div>
      ))}
    </div>
  );
}
