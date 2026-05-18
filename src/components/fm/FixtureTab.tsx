'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Zap,
  RefreshCw,
  Trophy,
  MapPin,
  Activity,
  Eye,
  Radio,
  Play,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loadFixtures, loadMatchHistory } from '@/lib/fm/persistence';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { GameCycleManager } from '@/lib/fm/GameCycleManager';

// ═══════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════

type FormResult = 'W' | 'D' | 'L';

interface Fixture {
  id: string;
  tur: number;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  match_time: string;
  status: 'scheduled' | 'live' | 'finished' | 'user_pending';
  home_score: number;
  away_score: number;
  homeScoreHT?: number | null;
  awayScoreHT?: number | null;
  home?: { name: string };
  away?: { name: string };
}

interface FixtureTabProps {
  teamName: string;
  teamId: string;
  currentWeek: number;
  onNavigateToMatch?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

function sanitizeName(raw: unknown): string {
  try {
    if (raw === null || raw === undefined) return 'Bilinmiyor';
    if (typeof raw !== 'string') return 'Bilinmiyor';
    const c = raw.trim();
    if (!c || c.toLowerCase().includes('undefined') || c.toLowerCase() === 'null') return 'Bilinmiyor';
    return c;
  } catch {
    return 'Bilinmiyor';
  }
}

function getTeamInitials(name: string): string {
  try {
    const words = name.split(' ').filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  } catch {
    return '??';
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════════════════════

// ─── Form Guide ────────────────────────────────────────────────────
function FormGuide({ results, size = 'sm' }: { results: FormResult[]; size?: 'sm' | 'lg' }) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  const colorMap: Record<FormResult, string> = {
    W: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]',
    D: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]',
    L: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]',
  };

  return (
    <div className="flex items-center gap-1">
      {results.map((r, i) => (
        <div
          key={i}
          className={`${dotSize} rounded-full ${colorMap[r]} flex items-center justify-center`}
          title={r === 'W' ? 'Galibiyet' : r === 'D' ? 'Beraberlik' : 'Mağlubiyet'}
        >
          {size === 'lg' && (
            <span className="text-[6px] font-black text-white">
              {r === 'W' ? 'G' : r === 'D' ? 'B' : 'M'}
            </span>
          )}
        </div>
      ))}
      {results.length === 0 && (
        <span className="text-[8px] text-white/20 font-bold uppercase tracking-wider">—</span>
      )}
    </div>
  );
}

// ─── Venue Badge ───────────────────────────────────────────────────
function VenueBadge({ isHome }: { isHome: boolean }) {
  return (
    <span
      className={`px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest rounded ${
        isHome
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
      }`}
    >
      {isHome ? 'EV' : 'DEP'}
    </span>
  );
}

// ─── Result Indicator (W/D/L pill) ────────────────────────────────
function ResultIndicator({ result }: { result: 'W' | 'D' | 'L' | null }) {
  if (!result) return null;
  const config: Record<'W' | 'D' | 'L', { bg: string; text: string; label: string }> = {
    W: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'G' },
    D: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'B' },
    L: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'M' },
  };
  const c = config[result];
  return (
    <span className={`${c.bg} ${c.text} text-[9px] font-black px-1.5 py-0.5 rounded`}>
      {c.label}
    </span>
  );
}

// ─── Team Shield Icon ─────────────────────────────────────────────
function TeamShield({ name, isUser, size = 'sm' }: { name: string; isUser: boolean; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-10 h-10 text-[10px]' : 'w-8 h-8 text-[9px]';
  return (
    <div
      className={`${sz} rounded-lg flex items-center justify-center font-black shrink-0 ${
        isUser
          ? 'bg-gradient-to-br from-amber-500/30 to-amber-700/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
          : 'bg-white/[0.06] text-white/40 border border-white/10'
      }`}
    >
      {getTeamInitials(name)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function FixtureTab({ teamName, teamId, currentWeek, onNavigateToMatch }: FixtureTabProps) {
  const router = useRouter();
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'played'>('all');
  const [selectedTur, setSelectedTur] = useState<number>(1);
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const weekScrollRef = useRef<HTMLDivElement>(null);
  const cycleStatus = GameCycleManager.getStatus();

  // ─── Data Fetching ─────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        const history = await loadMatchHistory(teamId);
        const mapped: Fixture[] = (history || []).map((m: Record<string, unknown>) => ({
          id: m.id as string,
          tur: (m.day as number) || 1,
          home_team_id: (m.homeTeam as string) === teamName ? 'user' : 'ai',
          away_team_id: (m.awayTeam as string) === teamName ? 'user' : 'ai',
          match_date: (m.date as string) || '',
          match_time: '12:00',
          status: 'finished' as const,
          home_score: (m.homeScore as number) || 0,
          away_score: (m.awayScore as number) || 0,
          homeScoreHT: null,
          awayScoreHT: null,
          home: { name: (m.homeTeam as string) || 'Bilinmiyor' },
          away: { name: (m.awayTeam as string) || 'Bilinmiyor' },
        }));
        setFixtures(mapped);
        setUserTeamId('user');
        setLoading(false);
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: teamData } = await supabase
        .from('league_teams')
        .select('id')
        .eq('profile_id', teamId)
        .single();

      const targetTeamId = teamData?.id;
      setUserTeamId(targetTeamId);

      const allFixtures = await loadFixtures(targetTeamId || '');

      if (allFixtures.length === 0) {
        const history = await loadMatchHistory(teamId);
        const mapped: Fixture[] = (history || []).map((m: Record<string, unknown>) => ({
          id: m.id as string,
          tur: (m.day as number) || 1,
          home_team_id: (m.homeTeam as string) === teamName ? (targetTeamId || 'user') : 'ai',
          away_team_id: (m.awayTeam as string) === teamName ? (targetTeamId || 'user') : 'ai',
          match_date: (m.date as string) || '',
          match_time: '12:00',
          status: 'finished' as const,
          home_score: parseInt(String(m.score?.toString().split('-')[0] || m.homeScore || '0')),
          away_score: parseInt(String(m.score?.toString().split('-')[1] || m.awayScore || '0')),
          homeScoreHT: null,
          awayScoreHT: null,
          home: { name: (m.homeTeam as string) || 'Bilinmiyor' },
          away: { name: (m.awayTeam as string) || 'Bilinmiyor' },
        }));
        setFixtures(mapped.sort((a, b) => a.tur - b.tur));
        const lastTur = mapped.length > 0 ? Math.max(...mapped.map(f => f.tur)) : 0;
        setSelectedTur(Math.min(34, lastTur + 1));
      } else {
        setFixtures(allFixtures);
        const playedTurs = allFixtures.filter((f: Fixture) => f.status === 'finished').map((f: Fixture) => f.tur);
        const lastPlayedTur = playedTurs.length > 0 ? Math.max(...playedTurs) : 0;
        const initialTur = Math.min(34, lastPlayedTur + 1);
        setSelectedTur(initialTur);
      }
    } catch (err) {
      console.error('Fixture loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [teamId, teamName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Scroll to selected week ────────────────────────────────────
  useEffect(() => {
    if (weekScrollRef.current) {
      const container = weekScrollRef.current;
      const selectedEl = container.querySelector(`[data-week="${selectedTur}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedTur]);

  // ─── Computed: Form Guide ────────────────────────────────────────
  const computeForm = useCallback(
    (targetTeamId: string | null, count = 5): FormResult[] => {
      if (!targetTeamId) return [];
      return fixtures
        .filter(f => f.status === 'finished' && (f.home_team_id === targetTeamId || f.away_team_id === targetTeamId))
        .sort((a, b) => a.tur - b.tur)
        .slice(-count)
        .map(f => {
          const isHome = f.home_team_id === targetTeamId;
          const scored = isHome ? f.home_score : f.away_score;
          const conceded = isHome ? f.away_score : f.home_score;
          if (scored > conceded) return 'W';
          if (scored === conceded) return 'D';
          return 'L';
        });
    },
    [fixtures],
  );

  const userForm = useMemo(() => computeForm(userTeamId), [computeForm, userTeamId]);

  const computeTeamForm = useCallback(
    (teamIdToCheck: string | null, count = 5): FormResult[] => {
      if (!teamIdToCheck) return [];
      return fixtures
        .filter(f => f.status === 'finished' && (f.home_team_id === teamIdToCheck || f.away_team_id === teamIdToCheck))
        .sort((a, b) => a.tur - b.tur)
        .slice(-count)
        .map(f => {
          const isHome = f.home_team_id === teamIdToCheck;
          const scored = isHome ? f.home_score : f.away_score;
          const conceded = isHome ? f.away_score : f.home_score;
          if (scored > conceded) return 'W';
          if (scored === conceded) return 'D';
          return 'L';
        });
    },
    [fixtures],
  );

  // ─── Computed: Filtered fixtures ────────────────────────────────
  const filteredFixtures = fixtures.filter(f => {
    const isPlayed = f.status === 'finished';
    if (filter === 'upcoming') return !isPlayed;
    if (filter === 'played') return isPlayed;
    return f.tur === selectedTur;
  });

  const nextMatch = fixtures.find(f => f.status === 'scheduled' || f.status === 'user_pending' || f.status === 'live');
  const turs = Array.from({ length: 34 }, (_, i) => i + 1);

  // ─── Grouped by tur ──────────────────────────────────────────────
  const fixturesByTur = useMemo(() => {
    const map = new Map<number, Fixture[]>();
    fixtures.forEach(f => {
      const list = map.get(f.tur) || [];
      list.push(f);
      map.set(f.tur, list);
    });
    return map;
  }, [fixtures]);

  // ─── Week date range ──────────────────────────────────────────
  const weekDateRange = useMemo(() => {
    const weekFixtures = fixtures.filter(f => f.tur === selectedTur);
    const dates = weekFixtures
      .map(f => f.match_date)
      .filter((d): d is string => !!d)
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());
    if (dates.length === 0) return null;
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    return { minDate, maxDate };
  }, [fixtures, selectedTur]);

  const weekDateDisplay = useMemo(() => {
    if (!weekDateRange) return 'Tarih Belirlenmedi';
    const { minDate, maxDate } = weekDateRange;
    if (minDate.getTime() === maxDate.getTime()) {
      return format(minDate, 'd MMMM EEEE', { locale: tr });
    }
    return `${format(minDate, 'd MMMM', { locale: tr })} — ${format(maxDate, 'd MMMM', { locale: tr })}`;
  }, [weekDateRange]);

  const weekMatchCount = useMemo(() => {
    return fixtures.filter(f => f.tur === selectedTur).length;
  }, [fixtures, selectedTur]);

  // ─── Opponent form for next match spotlight ────────────────────
  const opponentForm = useMemo(() => {
    if (!nextMatch) return [];
    const opponentId = nextMatch.home_team_id === userTeamId ? nextMatch.away_team_id : nextMatch.home_team_id;
    return computeTeamForm(opponentId);
  }, [nextMatch, userTeamId, computeTeamForm]);

  const isNextMatchHome = nextMatch ? nextMatch.home_team_id === userTeamId : false;
  const nextOpponentName = nextMatch
    ? sanitizeName(nextMatch.home_team_id === userTeamId ? nextMatch.away?.name : nextMatch.home?.name)
    : '---';

  // ─── Current gameweek ──────────────────────────────────────────
  const currentGameweek = useMemo(() => {
    const playedTurs = fixtures.filter(f => f.status === 'finished').map(f => f.tur);
    return playedTurs.length > 0 ? Math.max(...playedTurs) : 0;
  }, [fixtures]);

  // ─── Get user result for a fixture ─────────────────────────────
  const getUserResult = useCallback(
    (fixture: Fixture): FormResult | null => {
      if (!userTeamId || fixture.status !== 'finished') return null;
      const isHome = fixture.home_team_id === userTeamId;
      const scored = isHome ? fixture.home_score : fixture.away_score;
      const conceded = isHome ? fixture.away_score : fixture.home_score;
      if (scored > conceded) return 'W';
      if (scored === conceded) return 'D';
      return 'L';
    },
    [userTeamId],
  );

  // ─── Get user match for a specific tur ─────────────────────────
  const getUserMatchForTur = useCallback(
    (tur: number): Fixture | null => {
      return fixtures.find(f => f.tur === tur && (f.home_team_id === userTeamId || f.away_team_id === userTeamId)) || null;
    },
    [fixtures, userTeamId],
  );

  // ─── Season progress ───────────────────────────────────────────
  const seasonProgress = useMemo(() => {
    const totalWeeks = 34;
    const played = new Set(fixtures.filter(f => f.status === 'finished').map(f => f.tur)).size;
    return Math.round((played / totalWeeks) * 100);
  }, [fixtures]);

  // ═══════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full bg-black rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
      {/* ── Competition Info Bar ──────────────────────────────────── */}
      <div className="px-6 md:px-8 py-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy size={13} className="text-amber-500" />
          <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.25em]">
            4. LİG · 2024-25 SEZONU
          </span>
          <span className="text-white/10">|</span>
          <span className="text-[9px] font-black text-amber-500/80 uppercase tracking-[0.25em]">
            {currentGameweek > 0 ? `Hafta ${currentGameweek} tamamlandı` : 'Sezon Başlıyor'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Season progress mini-bar */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${seasonProgress}%` }}
              />
            </div>
            <span className="text-[8px] font-black text-white/30">{seasonProgress}%</span>
          </div>
          {cycleStatus.phase === 'LIVE_MATCH' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded-full animate-pulse ml-2">
              <Radio size={8} className="text-red-500" />
              <span className="text-[7px] font-black text-red-400 uppercase tracking-widest">CANLI</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="px-6 md:px-8 pt-6 pb-5 bg-zinc-900/50 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-gradient-to-b from-amber-500 to-amber-700 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
                MAÇ TAKVİMİ
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">
                {teamName} · Sezon Fikstürü
              </p>
              {userForm.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Form:</span>
                  <FormGuide results={userForm} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
            {(['all', 'upcoming', 'played'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 md:px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {f === 'all' ? 'Haftalık' : f === 'upcoming' ? 'Gelenler' : 'Geçmiş'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Horizontal Week Cards ─────────────────────────────────── */}
      {filter === 'all' && (
        <div className="px-4 md:px-6 py-4 bg-gradient-to-b from-zinc-900/60 to-black/40 border-b border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={11} className="text-white/30" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">
              Hafta {selectedTur} — {weekDateDisplay}
            </span>
            <span className="text-white/10 mx-1">·</span>
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">
              {weekMatchCount} Maç
            </span>
          </div>
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => setSelectedTur(prev => Math.max(1, prev - 1))}
              disabled={selectedTur <= 1}
              className={`absolute left-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-r from-black/80 to-transparent transition-all ${
                selectedTur <= 1 ? 'opacity-0 pointer-events-none' : 'hover:from-black/90'
              }`}
            >
              <ChevronLeft size={16} className="text-white/60" />
            </button>

            {/* Week Cards Scroll */}
            <div
              ref={weekScrollRef}
              className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-6 py-1"
            >
              {turs.map(tur => {
                const isSelected = selectedTur === tur;
                const hasPlayed = fixtures.some(f => f.tur === tur && f.status === 'finished');
                const hasUserMatch = fixtures.some(f => f.tur === tur && (f.home_team_id === userTeamId || f.away_team_id === userTeamId));
                const hasLive = fixtures.some(f => f.tur === tur && f.status === 'live');
                const userMatch = getUserMatchForTur(tur);
                const userResult = userMatch ? getUserResult(userMatch) : null;

                // Compact score display for the week card
                const scoreDisplay = (() => {
                  if (!userMatch) return null;
                  if (userMatch.status === 'finished') {
                    return `${userMatch.home_score} - ${userMatch.away_score}`;
                  }
                  if (userMatch.status === 'live') {
                    return `${userMatch.home_score} - ${userMatch.away_score}`;
                  }
                  return 'VS';
                })();

                return (
                  <button
                    key={tur}
                    data-week={tur}
                    onClick={() => setSelectedTur(tur)}
                    className={`shrink-0 relative rounded-xl border transition-all duration-300 overflow-hidden ${
                      isSelected
                        ? 'w-36 bg-gradient-to-br from-amber-500/20 via-zinc-800/80 to-amber-700/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                        : hasLive
                          ? 'w-24 bg-gradient-to-b from-red-500/10 to-red-900/5 border-red-500/30 hover:border-red-500/50'
                          : hasPlayed
                            ? 'w-24 bg-gradient-to-b from-zinc-800/60 to-zinc-900/40 border-white/8 hover:border-white/15'
                            : hasUserMatch
                              ? 'w-24 bg-gradient-to-b from-zinc-800/40 to-zinc-900/20 border-amber-500/10 hover:border-amber-500/25'
                              : 'w-24 bg-zinc-900/30 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {/* Top accent line for selected */}
                    {isSelected && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                    )}
                    {/* Live pulse accent */}
                    {hasLive && !isSelected && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500 animate-pulse" />
                    )}

                    <div className="px-3 py-2.5 flex flex-col items-center gap-1">
                      {/* Week Number */}
                      <div className="flex items-center gap-1.5">
                        {hasLive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        )}
                        <span className={`text-[7px] font-black uppercase tracking-tighter ${
                          isSelected ? 'text-amber-400/70' : 'text-white/30'
                        }`}>
                          HFT
                        </span>
                      </div>
                      <span className={`text-base font-black ${
                        isSelected ? 'text-white' : 'text-white/60'
                      }`}>
                        {tur}
                      </span>

                      {/* User match mini-score */}
                      {hasUserMatch && userMatch && (
                        <div className={`flex flex-col items-center gap-0.5 mt-0.5 ${
                          isSelected ? 'opacity-100' : 'opacity-60'
                        }`}>
                          <span className={`text-[8px] font-mono font-bold ${
                            userMatch.status === 'live'
                              ? 'text-red-400'
                              : userResult === 'W'
                                ? 'text-emerald-400'
                                : userResult === 'L'
                                  ? 'text-red-400'
                                  : userResult === 'D'
                                    ? 'text-amber-400'
                                    : 'text-white/30'
                          }`}>
                            {scoreDisplay}
                          </span>
                          <span className="text-[6px] font-black uppercase tracking-wider text-white/20">
                            {userMatch.home_team_id === userTeamId ? 'EV' : 'DEP'}
                          </span>
                        </div>
                      )}

                      {/* Completed dot indicator for non-selected weeks */}
                      {hasPlayed && !isSelected && !hasUserMatch && (
                        <div className="w-1 h-1 bg-emerald-500/60 rounded-full mt-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => setSelectedTur(prev => Math.min(34, prev + 1))}
              disabled={selectedTur >= 34}
              className={`absolute right-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-l from-black/80 to-transparent transition-all ${
                selectedTur >= 34 ? 'opacity-0 pointer-events-none' : 'hover:from-black/90'
              }`}
            >
              <ChevronRight size={16} className="text-white/60" />
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-black via-zinc-900/40 to-black">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              Veriler İşleniyor...
            </p>
          </div>
        ) : (
          <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
            {/* ══════════════════════════════════════════════════════
                NEXT MATCH SPOTLIGHT
                ══════════════════════════════════════════════════════ */}
            {nextMatch && filter !== 'played' && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group mb-6"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-amber-700/10 rounded-[2rem] blur-lg opacity-30 group-hover:opacity-50 transition duration-700" />
                <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-amber-500/20 rounded-[2rem] overflow-hidden shadow-2xl">
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />

                  <div className="px-6 md:px-10 py-8 md:py-10">
                    {/* Top badge row */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest rounded">
                          SIRADAKİ
                        </span>
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                          HAFTA {nextMatch.tur}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-white/30" />
                        <span className={`text-[8px] font-black uppercase tracking-widest ${isNextMatchHome ? 'text-emerald-400' : 'text-sky-400'}`}>
                          {isNextMatchHome ? 'Ev Sahası' : 'Deplasman'}
                        </span>
                        <VenueBadge isHome={isNextMatchHome} />
                      </div>
                    </div>

                    {/* Main: Teams + Score area */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                      {/* Home Team */}
                      <div className="flex-1 text-center md:text-right">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">
                          {sanitizeName(nextMatch.home?.name) === teamName ? 'Senin Takımın' : 'Ev Sahibi'}
                        </p>
                        <div className="flex items-center gap-3 md:justify-end justify-center">
                          <TeamShield
                            name={sanitizeName(nextMatch.home?.name)}
                            isUser={nextMatch.home_team_id === userTeamId}
                            size="lg"
                          />
                          <h3 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter leading-none">
                            {sanitizeName(nextMatch.home?.name) || '---'}
                          </h3>
                        </div>
                        {nextMatch.home_team_id === userTeamId && userForm.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 md:justify-end justify-center">
                            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Form:</span>
                            <FormGuide results={userForm} size="lg" />
                          </div>
                        )}
                      </div>

                      {/* Center: VS / Info */}
                      <div className="flex flex-col items-center gap-3 shrink-0">
                        {(nextMatch.status === 'scheduled' || nextMatch.status === 'user_pending') ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center">
                              <span className="text-lg font-black italic text-white/20">VS</span>
                            </div>
                            {nextMatch.status === 'user_pending' && (
                              <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-full text-[7px] font-black text-amber-400 uppercase tracking-widest">
                                Senin Sıran
                              </span>
                            )}
                          </div>
                        ) : nextMatch.status === 'live' ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-3 px-5 py-2.5 bg-black/80 border border-red-500/40 ring-1 ring-red-500/20 rounded-xl">
                              <span className="text-2xl font-black text-white tabular-nums">{nextMatch.home_score}</span>
                              <span className="text-white/15 font-black italic text-lg">:</span>
                              <span className="text-2xl font-black text-white tabular-nums">{nextMatch.away_score}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/15 border border-red-500/30 rounded-full">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-[7px] font-black text-red-400 uppercase tracking-widest">Devam Ediyor</span>
                            </div>
                          </div>
                        ) : null}

                        {/* Date & Time */}
                        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={11} className="text-white/25" />
                            <span className="text-[9px] font-bold text-white/50 uppercase">
                              {nextMatch.match_date
                                ? format(new Date(nextMatch.match_date), 'd MMMM EEEE', { locale: tr })
                                : 'TBA'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={11} className="text-white/25" />
                            <span className="text-[9px] font-bold text-white/50 uppercase">{nextMatch.match_time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 text-center md:text-left">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">
                          {sanitizeName(nextMatch.away?.name) === teamName ? 'Senin Takımın' : 'Deplasman'}
                        </p>
                        <div className="flex items-center gap-3 md:justify-start justify-center">
                          <h3 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter leading-none">
                            {sanitizeName(nextMatch.away?.name) || '---'}
                          </h3>
                          <TeamShield
                            name={sanitizeName(nextMatch.away?.name)}
                            isUser={nextMatch.away_team_id === userTeamId}
                            size="lg"
                          />
                        </div>
                        {nextMatch.away_team_id === userTeamId && userForm.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 md:justify-start justify-center">
                            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Form:</span>
                            <FormGuide results={userForm} size="lg" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Rakip Analizi ──────────────────────────────── */}
                    <div className="mt-6 pt-5 border-t border-white/5">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Activity size={13} className="text-amber-500" />
                          <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">
                            Rakip Analizi
                          </span>
                          <span className="text-[9px] font-bold text-white/30">
                            — {nextOpponentName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Son 5:</span>
                          <FormGuide results={opponentForm} size="lg" />
                          {opponentForm.length > 0 && (
                            <span className="text-[8px] font-bold text-white/25">
                              {opponentForm.filter(r => r === 'W').length}G {opponentForm.filter(r => r === 'D').length}B {opponentForm.filter(r => r === 'L').length}M
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Action Button ───────────────────────────────── */}
                    <div className="mt-6 flex justify-center">
                      {onNavigateToMatch &&
                      (cycleStatus.phase === 'LIVE_MATCH' || cycleStatus.phase === 'PRE_MATCH') ? (
                        <button
                          onClick={onNavigateToMatch}
                          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-2xl shadow-amber-500/20 flex items-center gap-3 group/btn hover:scale-105 active:scale-95"
                        >
                          <Zap size={14} className="group-hover:fill-current" /> MAÇ ODASINA GİT
                        </button>
                      ) : (
                        nextMatch.status === 'scheduled' || nextMatch.status === 'user_pending' ? (
                          <button
                            onClick={onNavigateToMatch}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600/90 to-emerald-500/90 hover:from-emerald-500 hover:to-emerald-400 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                          >
                            <Play size={14} className="fill-current" />
                            Maçı İzle
                          </button>
                        ) : (
                          <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                              Maç Günü Bekleniyor
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                WEEK HEADER CARD
                ══════════════════════════════════════════════════════ */}
            {filter === 'all' && (
              <div className="bg-gradient-to-r from-zinc-900/80 via-zinc-800/60 to-zinc-900/80 rounded-2xl border border-white/5 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-b from-amber-500/20 to-amber-700/10 border border-amber-500/30">
                    <span className="text-[7px] font-black uppercase tracking-tighter text-amber-400/60">HFT</span>
                    <span className="text-2xl font-black text-amber-400">{selectedTur}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white/80">
                      Hafta {selectedTur}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={11} className="text-white/25" />
                      <span className="text-[10px] font-bold text-white/40">
                        {weekDateDisplay}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Trophy size={10} className="text-white/20" />
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">
                        {weekMatchCount} Maç
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTur(prev => Math.max(1, prev - 1))}
                    disabled={selectedTur <= 1}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
                      selectedTur <= 1
                        ? 'bg-black/10 border-white/5 text-white/10 cursor-not-allowed'
                        : 'bg-black/20 border-white/10 text-white/40 hover:bg-white/10 hover:text-white hover:border-amber-500/40 active:scale-95'
                    }`}
                  >
                    <ChevronLeft size={12} />
                    Önceki
                  </button>
                  <button
                    onClick={() => setSelectedTur(prev => Math.min(34, prev + 1))}
                    disabled={selectedTur >= 34}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
                      selectedTur >= 34
                        ? 'bg-black/10 border-white/5 text-white/10 cursor-not-allowed'
                        : 'bg-black/20 border-white/10 text-white/40 hover:bg-white/10 hover:text-white hover:border-amber-500/40 active:scale-95'
                    }`}
                  >
                    Sonraki
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════
                FIXTURE LIST — Modern Gradient Match Cards
                ══════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredFixtures.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-16 bg-zinc-900/20 rounded-2xl border border-dashed border-white/10">
                    <Calendar className="w-12 h-12 text-white/5 mb-4" />
                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
                      İlgili hafta için maç bulunamadı
                    </p>
                  </div>
                ) : (
                  filteredFixtures.map((fixture, idx) => {
                    const isUserMatch =
                      fixture.home_team_id === userTeamId || fixture.away_team_id === userTeamId;
                    const matchDate = fixture.match_date ? new Date(fixture.match_date) : null;
                    const isUserHome = fixture.home_team_id === userTeamId;
                    const isUserAway = fixture.away_team_id === userTeamId;
                    const isFinished = fixture.status === 'finished';
                    const isScheduled = fixture.status === 'scheduled' || fixture.status === 'user_pending';
                    const isLive = fixture.status === 'live';
                    const userResult = getUserResult(fixture);
                    const homeName = sanitizeName(fixture.home?.name) || '---';
                    const awayName = sanitizeName(fixture.away?.name) || '---';

                    // Gradient background based on match status & result
                    const cardGradient = isUserMatch
                      ? isLive
                        ? 'from-red-500/[0.08] via-zinc-900/80 to-red-500/[0.08]'
                        : isScheduled
                          ? 'from-amber-500/[0.05] via-zinc-900/80 to-amber-500/[0.05]'
                          : userResult === 'W'
                            ? 'from-emerald-500/[0.05] via-zinc-900/80 to-emerald-500/[0.05]'
                            : userResult === 'L'
                              ? 'from-red-500/[0.03] via-zinc-900/80 to-red-500/[0.03]'
                              : 'from-amber-500/[0.03] via-zinc-900/80 to-amber-500/[0.03]'
                      : 'from-zinc-900/50 via-zinc-900/30 to-zinc-900/50';

                    const borderColor = isUserMatch
                      ? isLive
                        ? 'border-red-500/30 hover:border-red-500/50'
                        : isScheduled
                          ? 'border-amber-500/25 hover:border-amber-500/45'
                          : userResult === 'W'
                            ? 'border-emerald-500/20 hover:border-emerald-500/40'
                            : userResult === 'L'
                              ? 'border-red-500/15 hover:border-red-500/30'
                              : 'border-amber-500/15 hover:border-amber-500/30'
                      : 'border-white/[0.06] hover:border-white/15';

                    const accentColor = isLive ? 'bg-red-500' : isScheduled ? 'bg-amber-500' : userResult === 'W' ? 'bg-emerald-500' : userResult === 'L' ? 'bg-red-500' : 'bg-amber-500/50';

                    return (
                      <motion.div
                        key={fixture.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`group rounded-xl border transition-all relative overflow-hidden bg-gradient-to-r ${cardGradient} ${borderColor} ${!isUserMatch ? 'opacity-40 hover:opacity-70' : ''}`}
                      >
                        {/* User match accent strip */}
                        {isUserMatch && (
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`} />
                        )}

                        <div className="flex items-center px-3 md:px-5 py-4 gap-3 md:gap-4">
                          {/* Left: Date/Time + Result column */}
                          <div className="w-[72px] md:w-20 shrink-0 flex flex-col items-center border-r border-white/5 pr-3 md:pr-4">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Clock
                                size={9}
                                className={isLive ? 'text-red-400' : 'text-white/25'}
                              />
                              <span
                                className={`text-[10px] font-black font-mono ${
                                  isLive ? 'text-red-400' : 'text-white/60'
                                }`}
                              >
                                {fixture.match_time || '--:--'}
                              </span>
                            </div>
                            {matchDate && (
                              <span className="text-[8px] font-bold text-white/30 uppercase tracking-tight">
                                {format(matchDate, 'd MMM', { locale: tr })}
                              </span>
                            )}
                            {/* Result indicator for finished user matches */}
                            {isUserMatch && isFinished && (
                              <div className="mt-1.5">
                                <ResultIndicator result={userResult} />
                              </div>
                            )}
                          </div>

                          {/* Center: Match Info */}
                          <div className="flex-1 flex items-center gap-2 md:gap-4 min-w-0">
                            {/* Home Team */}
                            <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                              <span
                                className={`text-[11px] md:text-xs font-black uppercase italic tracking-tighter truncate transition-all ${
                                  fixture.home_team_id === userTeamId
                                    ? 'text-white'
                                    : 'text-white/40 group-hover:text-white/60'
                                }`}
                              >
                                {homeName}
                              </span>
                              {isUserHome && <VenueBadge isHome={true} />}
                              <TeamShield name={homeName} isUser={fixture.home_team_id === userTeamId} />
                            </div>

                            {/* Score / VS area */}
                            <div className="flex flex-col items-center gap-0.5 shrink-0">
                              {isScheduled ? (
                                <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                  <span className="text-[10px] font-mono font-bold text-white/15">VS</span>
                                </div>
                              ) : (
                                <>
                                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                                    isLive
                                      ? 'bg-red-500/10 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                                      : isUserMatch
                                        ? 'bg-white/[0.06] border border-white/15'
                                        : 'bg-black/40 border border-white/[0.06]'
                                  }`}>
                                    <span className={`text-lg font-black tabular-nums ${isLive ? 'text-white' : 'text-white/80'}`}>
                                      {fixture.home_score}
                                    </span>
                                    <span className="text-white/15 font-bold text-xs">-</span>
                                    <span className={`text-lg font-black tabular-nums ${isLive ? 'text-white' : 'text-white/80'}`}>
                                      {fixture.away_score}
                                    </span>
                                  </div>
                                  {isLive && (
                                    <div className="flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                      <span className="text-[7px] font-black text-red-400 uppercase tracking-widest">Canlı</span>
                                    </div>
                                  )}
                                  {isFinished && fixture.homeScoreHT != null && fixture.awayScoreHT != null && (
                                    <span className="text-[8px] text-white/25 font-mono">
                                      İY: {fixture.homeScoreHT}-{fixture.awayScoreHT}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Away Team */}
                            <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
                              <TeamShield name={awayName} isUser={fixture.away_team_id === userTeamId} />
                              {isUserAway && <VenueBadge isHome={false} />}
                              <span
                                className={`text-[11px] md:text-xs font-black uppercase italic tracking-tighter truncate transition-all ${
                                  fixture.away_team_id === userTeamId
                                    ? 'text-white'
                                    : 'text-white/40 group-hover:text-white/60'
                                }`}
                              >
                                {awayName}
                              </span>
                            </div>
                          </div>

                          {/* Right: Action area */}
                          <div className="flex items-center gap-2 shrink-0">
                            {isUserMatch && isScheduled && onNavigateToMatch && (
                              <button
                                onClick={onNavigateToMatch}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600/90 to-emerald-500/90 hover:from-emerald-500 hover:to-emerald-400 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all hover:scale-105 active:scale-95"
                              >
                                <Play size={10} className="fill-current" />
                                Maçı İzle
                              </button>
                            )}
                            {isUserMatch && isLive && onNavigateToMatch && (
                              <button
                                onClick={onNavigateToMatch}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600/90 to-red-500/90 hover:from-red-500 hover:to-red-400 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-[0_0_12px_rgba(239,68,68,0.25)] transition-all hover:scale-105 active:scale-95 animate-pulse"
                              >
                                <Eye size={10} />
                                İzle
                              </button>
                            )}
                            {isUserMatch && isFinished && (
                              <div className="flex items-center gap-2">
                                <FormGuide results={computeForm(isUserHome ? fixture.home_team_id : fixture.away_team_id, 3)} />
                                <button
                                  onClick={() => router.push(`/match/${fixture.id}`)}
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-sky-600/80 to-sky-500/80 hover:from-sky-500 hover:to-sky-400 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-[0_0_8px_rgba(14,165,233,0.2)] transition-all hover:scale-105 active:scale-95"
                                >
                                  <Play size={9} className="fill-current" />
                                  Tekrar
                                </button>
                              </div>
                            )}
                            {!isUserMatch && (
                              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <ChevronRight size={12} className="text-white/20 group-hover:text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
