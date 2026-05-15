'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, ChevronRight, Zap, RefreshCw, Trophy, MapPin, Activity, Eye, Radio } from 'lucide-react';
import { loadFixtures, loadMatchHistory } from '@/lib/fm/persistence';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { GameCycleManager } from '@/lib/fm/GameCycleManager';

function sanitizeName(raw: any): string {
  if (raw === null || raw === undefined) return 'Bilinmiyor';
  if (typeof raw !== 'string') return 'Bilinmiyor';
  const c = raw.trim();
  if (!c || c.toLowerCase().includes('undefined') || c.toLowerCase() === 'null') return 'Bilinmiyor';
  return c;
}

// ─── Form Guide Types ───────────────────────────────────────────────
type FormResult = 'W' | 'D' | 'L'; // G (Galibiyet), B (Beraberlik), M (Mağlubiyet)

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

// ─── Form Guide Component ───────────────────────────────────────────
function FormGuide({ results, size = 'sm' }: { results: FormResult[]; size?: 'sm' | 'lg' }) {
  const dotSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  const colorMap: Record<FormResult, string> = {
    W: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]',
    D: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]',
    L: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]',
  };

  const labelMap: Record<FormResult, string> = {
    W: 'G',
    D: 'B',
    M: 'M', // unused since key is 'L'
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
            <span className="text-[6px] font-black text-white">{r === 'W' ? 'G' : r === 'D' ? 'B' : 'M'}</span>
          )}
        </div>
      ))}
      {results.length === 0 && (
        <span className="text-[8px] text-white/20 font-bold uppercase tracking-wider">Form Yok</span>
      )}
    </div>
  );
}

// ─── Venue Badge ────────────────────────────────────────────────────
function VenueBadge({ isHome, size = 'sm' }: { isHome: boolean; size?: 'sm' | 'lg' }) {
  const cls = size === 'sm'
    ? 'px-1.5 py-0.5 text-[7px] font-black'
    : 'px-2.5 py-1 text-[8px] font-black';

  return (
    <span
      className={`${cls} uppercase tracking-widest rounded ${
        isHome
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
      }`}
    >
      {isHome ? 'E' : 'D'}
    </span>
  );
}

// ─── Match Status Badge ────────────────────────────────────────────
function StatusBadge({ status }: { status: Fixture['status'] }) {
  switch (status) {
    case 'live':
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/15 border border-red-500/30 rounded-full">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[7px] font-black text-red-400 uppercase tracking-widest">Devam Ediyor</span>
        </div>
      );
    case 'finished':
      return (
        <div className="px-2 py-0.5 bg-zinc-800 border border-white/5 rounded-full">
          <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Tamamlandı</span>
        </div>
      );
    case 'user_pending':
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-full">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-[7px] font-black text-amber-400 uppercase tracking-widest">Senin Sıran</span>
        </div>
      );
    default:
      return (
        <div className="px-2 py-0.5 bg-zinc-800 border border-white/5 rounded-full">
          <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Planlandı</span>
        </div>
      );
  }
}

// ─── Score Box (TV-Style) ──────────────────────────────────────────
function ScoreBox({
  fixture,
  isUserMatch,
}: {
  fixture: Fixture;
  isUserMatch: boolean;
}) {
  const isLive = fixture.status === 'live';
  const isScheduled = fixture.status === 'scheduled';
  const hasHT = fixture.homeScoreHT != null && fixture.awayScoreHT != null;

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      {/* Main Score */}
      <div
        className={`w-[88px] h-14 rounded-xl flex items-center justify-center gap-3 bg-black/80 border transition-all ${
          isLive
            ? 'border-red-500/50 ring-1 ring-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
            : isUserMatch
              ? 'border-white/15 shadow-inner'
              : 'border-white/5 shadow-inner'
        }`}
      >
        <span
          className={`text-2xl font-black tabular-nums min-w-[28px] text-right ${
            isScheduled ? 'text-white/10' : isLive ? 'text-white' : 'text-white/90'
          }`}
        >
          {isScheduled ? '-' : fixture.home_score}
        </span>
        <span className="text-white/15 font-black italic text-lg">:</span>
        <span
          className={`text-2xl font-black tabular-nums min-w-[28px] text-left ${
            isScheduled ? 'text-white/10' : isLive ? 'text-white' : 'text-white/90'
          }`}
        >
          {isScheduled ? '-' : fixture.away_score}
        </span>
      </div>

      {/* Half-time score */}
      {hasHT && !isScheduled && (
        <div className="flex items-center gap-1.5">
          <span className="text-[7px] font-bold text-white/25 uppercase tracking-widest">İY</span>
          <span className="text-[9px] font-black text-white/30 tabular-nums">
            {fixture.homeScoreHT} - {fixture.awayScoreHT}
          </span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function FixtureTab({ teamName, teamId, currentWeek, onNavigateToMatch }: FixtureTabProps) {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'played'>('all');
  const [selectedTur, setSelectedTur] = useState<number>(1);
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const cycleStatus = GameCycleManager.getStatus();

  // ─── Data Fetching ─────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        const history = await loadMatchHistory(teamId);
        const mapped: Fixture[] = (history || []).map((m: any) => ({
          id: m.id,
          tur: m.day || 1,
          home_team_id: m.homeTeam === teamName ? 'user' : 'ai',
          away_team_id: m.awayTeam === teamName ? 'user' : 'ai',
          match_date: m.date,
          match_time: '12:00',
          status: 'finished',
          home_score: m.homeScore,
          away_score: m.awayScore,
          homeScoreHT: null,
          awayScoreHT: null,
          home: { name: m.homeTeam },
          away: { name: m.awayTeam },
        }));
        setFixtures(mapped);
        setUserTeamId('user');
        setLoading(false);
        return;
      }

      const supabase = getSupabase();

      // 1. Find the user's team ID
      const { data: teamData } = await supabase
        .from('league_teams')
        .select('id')
        .eq('profile_id', teamId)
        .single();

      const targetTeamId = teamData?.id;
      setUserTeamId(targetTeamId);

      // 2. Load fixtures
      const allFixtures = await loadFixtures(targetTeamId || '');

      // FALLBACK: If no fixtures table entries but history exists, show history as played fixtures
      if (allFixtures.length === 0) {
        const history = await loadMatchHistory(teamId);
        const mapped: Fixture[] = (history || []).map((m: any) => ({
          id: m.id,
          tur: m.day || 1,
          home_team_id: m.homeTeam === teamName ? (targetTeamId || 'user') : 'ai',
          away_team_id: m.awayTeam === teamName ? (targetTeamId || 'user') : 'ai',
          match_date: m.date,
          match_time: '12:00',
          status: 'finished',
          home_score: parseInt(m.score?.split('-')[0] || m.homeScore || '0'),
          away_score: parseInt(m.score?.split('-')[1] || m.awayScore || '0'),
          homeScoreHT: null,
          awayScoreHT: null,
          home: { name: m.homeTeam },
          away: { name: m.awayTeam },
        }));
        setFixtures(mapped.sort((a, b) => a.tur - b.tur));

        const lastTur = mapped.length > 0 ? Math.max(...mapped.map(f => f.tur)) : 0;
        setSelectedTur(Math.min(34, lastTur + 1));
      } else {
        setFixtures(allFixtures);
        const playedTurs = allFixtures.filter(f => f.status === 'finished').map(f => f.tur);
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

  // ─── Computed: Form Guide (Last 5) ──────────────────────────────
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

  // ═══════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full bg-black rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
      {/* ── Competition Info Bar ──────────────────────────────────── */}
      <div className="px-8 py-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-white/5 flex items-center justify-between">
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
          {cycleStatus.phase === 'LIVE_MATCH' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded-full animate-pulse">
              <Radio size={8} className="text-red-500" />
              <span className="text-[7px] font-black text-red-400 uppercase tracking-widest">CANLI</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="px-8 pt-6 pb-5 bg-zinc-900/50 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-besiktas-red rounded-full shadow-[0_0_10px_#e30613]" />
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
                MAÇ TAKVİMİ
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">
                {teamName} · Sezon Fikstürü
              </p>
              {/* User team form guide in header */}
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
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
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

      {/* ── Week Selector ─────────────────────────────────────────── */}
      {filter === 'all' && (
        <div className="px-8 py-3 bg-zinc-900/30 border-b border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex gap-1.5 min-w-max">
            {turs.map(tur => (
              <button
                key={tur}
                onClick={() => setSelectedTur(tur)}
                className={`w-12 h-14 flex flex-col items-center justify-center rounded-xl border transition-all relative ${
                  selectedTur === tur
                    ? 'bg-besiktas-red border-besiktas-red text-white shadow-lg shadow-besiktas-red/30'
                    : 'bg-black/20 border-white/5 text-white/40 hover:border-white/20'
                }`}
              >
                <span className="text-[8px] font-black uppercase tracking-tighter opacity-50">HFT</span>
                <span className="text-sm font-black">{tur}</span>
                {fixtures.some(f => f.tur === tur && f.status === 'finished') && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/20 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-black via-zinc-900/40 to-black">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <RefreshCw className="w-8 h-8 text-besiktas-red animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              Veriler İşleniyor...
            </p>
          </div>
        ) : (
          <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
            {/* ══════════════════════════════════════════════════════
                NEXT MATCH SPOTLIGHT (Enhanced)
                ══════════════════════════════════════════════════════ */}
            {nextMatch && filter !== 'played' && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group mb-8"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-besiktas-red to-zinc-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
                <div className="relative bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-besiktas-red to-transparent opacity-50" />

                  <div className="px-8 md:px-10 py-8 md:py-10">
                    {/* Top: SIRADAKI badge + competition + venue */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-besiktas-red text-white text-[8px] font-black uppercase tracking-widest rounded-sm">
                          SIRADAKİ
                        </span>
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                          HAFTA {nextMatch.tur}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-white/30" />
                        <span className={`text-[8px] font-black uppercase tracking-widest ${isNextMatchHome ? 'text-emerald-400' : 'text-blue-400'}`}>
                          {isNextMatchHome ? 'Ev Sahası' : 'Deplasman'}
                        </span>
                        <VenueBadge isHome={isNextMatchHome} size="sm" />
                      </div>
                    </div>

                    {/* Main: Teams + Score area */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      {/* Home Team */}
                      <div className="flex-1 text-center md:text-right">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">
                          {sanitizeName(nextMatch.home?.name) === teamName ? 'Senin Takımın' : 'Ev Sahibi'}
                        </p>
                        <h3 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
                          {sanitizeName(nextMatch.home?.name) || '---'}
                        </h3>
                        {nextMatch.home_team_id === userTeamId && userForm.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 md:justify-end justify-center">
                            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Form:</span>
                            <FormGuide results={userForm} size="lg" />
                          </div>
                        )}
                      </div>

                      {/* Center: VS / Info */}
                      <div className="flex flex-col items-center gap-3 shrink-0">
                        {nextMatch.status === 'scheduled' || nextMatch.status === 'user_pending' ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center">
                              <span className="text-lg font-black italic text-white/20">VS</span>
                            </div>
                            <StatusBadge status={nextMatch.status} />
                          </div>
                        ) : nextMatch.status === 'live' ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-20 h-14 rounded-xl bg-black/80 border border-red-500/50 ring-1 ring-red-500/20 flex items-center justify-center gap-3">
                              <span className="text-2xl font-black text-white tabular-nums">{nextMatch.home_score}</span>
                              <span className="text-white/15 font-black italic text-lg">:</span>
                              <span className="text-2xl font-black text-white tabular-nums">{nextMatch.away_score}</span>
                            </div>
                            <StatusBadge status="live" />
                          </div>
                        ) : null}

                        {/* Date & Time */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-white/25" />
                            <span className="text-[9px] font-bold text-white/50 uppercase">
                              {nextMatch.match_date
                                ? format(new Date(nextMatch.match_date), 'd MMMM EEEE', { locale: tr })
                                : 'TBA'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-white/25" />
                            <span className="text-[9px] font-bold text-white/50 uppercase">{nextMatch.match_time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 text-center md:text-left">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">
                          {sanitizeName(nextMatch.away?.name) === teamName ? 'Senin Takımın' : 'Deplasman'}
                        </p>
                        <h3 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
                          {sanitizeName(nextMatch.away?.name) || '---'}
                        </h3>
                        {nextMatch.away_team_id === userTeamId && userForm.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 md:justify-start justify-center">
                            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Form:</span>
                            <FormGuide results={userForm} size="lg" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Rakip Analizi ──────────────────────────────── */}
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                          <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Son 5 Maç:</span>
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
                          className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-400 transition-all shadow-2xl flex items-center gap-3 group/btn"
                        >
                          <Zap size={14} className="group-hover:fill-current" /> MAÇ ODASINA GİT
                        </button>
                      ) : (
                        <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl">
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                            Maç Günü Bekleniyor
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                FIXTURE LIST (FM-Style)
                ══════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredFixtures.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-20 bg-zinc-900/20 rounded-[2rem] border border-dashed border-white/10">
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

                    return (
                      <motion.div
                        key={fixture.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`group rounded-xl border transition-all relative overflow-hidden ${
                          isUserMatch
                            ? 'bg-zinc-900/70 border-white/10 hover:border-besiktas-red/40'
                            : 'bg-black/30 border-white/5 opacity-50 hover:opacity-80'
                        }`}
                      >
                        {/* ── Row: Date/Time | Home - Score - Away | Status ── */}
                        <div className="flex items-center px-4 md:px-6 py-3.5 gap-3 md:gap-5">
                          {/* Left: Date & Time */}
                          <div className="w-20 md:w-24 shrink-0 flex flex-col items-center border-r border-white/5 pr-3 md:pr-5">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Clock
                                size={10}
                                className={fixture.status === 'live' ? 'text-red-400' : 'text-white/25'}
                              />
                              <span
                                className={`text-[10px] font-black font-mono ${
                                  fixture.status === 'live' ? 'text-red-400' : 'text-white/60'
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
                          </div>

                          {/* Center: Match Info */}
                          <div className="flex-1 flex items-center gap-3 md:gap-5 min-w-0">
                            {/* Home Team */}
                            <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                              <span
                                className={`text-xs md:text-sm font-black uppercase italic tracking-tighter truncate transition-all ${
                                  fixture.home_team_id === userTeamId
                                    ? 'text-white'
                                    : 'text-white/40 group-hover:text-white/60'
                                }`}
                              >
                                {sanitizeName(fixture.home?.name) || '---'}
                              </span>
                              {isUserHome && isUserMatch && (
                                <VenueBadge isHome={true} size="sm" />
                              )}
                            </div>

                            {/* Score */}
                            <ScoreBox fixture={fixture} isUserMatch={isUserMatch} />

                            {/* Away Team */}
                            <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
                              {isUserAway && isUserMatch && (
                                <VenueBadge isHome={false} size="sm" />
                              )}
                              <span
                                className={`text-xs md:text-sm font-black uppercase italic tracking-tighter truncate transition-all ${
                                  fixture.away_team_id === userTeamId
                                    ? 'text-white'
                                    : 'text-white/40 group-hover:text-white/60'
                                }`}
                              >
                                {sanitizeName(fixture.away?.name) || '---'}
                              </span>
                            </div>
                          </div>

                          {/* Right: Status + Form + Action */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            {isUserMatch && (
                              <FormGuide
                                results={computeForm(
                                  isUserHome ? fixture.home_team_id : fixture.away_team_id,
                                  5,
                                )}
                              />
                            )}
                            <div className="hidden md:block">
                              <StatusBadge status={fixture.status} />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                              <ChevronRight size={14} className="text-white/20 group-hover:text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Mobile-only status badge */}
                        {fixture.status === 'live' && (
                          <div className="md:hidden px-4 pb-2">
                            <StatusBadge status="live" />
                          </div>
                        )}
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
