'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  ChevronRight,
  Zap,
  RefreshCw,
  Trophy,
  MapPin,
  Activity,
  Eye,
  Radio,
  Play,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loadFixtures, loadMatchHistory } from '@/lib/fm/persistence';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { isMatchDay, isMatchTime } from '@/lib/fm/schedule';

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
  referee_name?: string | null;
  referee_personality?: string | null;
  referee_strictness?: number | null;
}

interface FixtureTabProps {
  teamName: string;
  teamId: string;
  currentWeek: number;
  onNavigateToMatch?: () => void;
  onRivalClick?: (teamId: string, teamName: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

function isFixtureFinished(status: string): boolean {
  return status === 'finished' || status === 'completed';
}

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

const TURKISH_MONTHS: Record<number, string> = {
  1: 'OCAK', 2: 'ŞUBAT', 3: 'MART', 4: 'NİSAN', 5: 'MAYIS', 6: 'HAZİRAN',
  7: 'TEMMUZ', 8: 'AĞUSTOS', 9: 'EYLÜL', 10: 'EKİM', 11: 'KASIM', 12: 'ARALIK',
};

function getMonthYear(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const month = TURKISH_MONTHS[d.getMonth() + 1] || 'BİLİNMİYOR';
    return `${month} ${d.getFullYear()}`;
  } catch {
    return 'BİLİNMİYOR';
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════════════════════

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
        <div key={i} className={`${dotSize} rounded-full ${colorMap[r]}`} />
      ))}
      {results.length === 0 && (
        <span className="text-[8px] text-white/20 font-bold uppercase tracking-wider">—</span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function FixtureTab({ teamName, teamId, currentWeek, onNavigateToMatch, onRivalClick }: FixtureTabProps) {
  const router = useRouter();
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'played'>('all');
  const [userTeamId, setUserTeamId] = useState<string | null>(null);

  // ─── Cycle status (live/pre-match/idle) ───
  const cycleStatus = (() => {
    const now = new Date();
    const trDate = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const day = trDate.getDay();
    const hour = trDate.getHours();
    const minute = trDate.getMinutes();
    const isWeekday = day >= 1 && day <= 5;
    const isLiveMatch = isWeekday && (hour === 12 || hour === 18) && minute < 30;
    const isPreMatch = isWeekday && ((hour === 10 || hour === 11) || (hour === 16 || hour === 17));
    return {
      phase: isLiveMatch ? 'LIVE_MATCH' as const : isPreMatch ? 'PRE_MATCH' as const : 'IDLE' as const,
    };
  })();

  // ─── Data Fetching ───
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
      if (!supabase) { setLoading(false); return; }

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
      } else {
        setFixtures(allFixtures);
      }
    } catch (err) {
      console.error('Fixture loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [teamId, teamName]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Form guide ───
  const computeForm = useCallback(
    (targetTeamId: string | null, count = 5): FormResult[] => {
      if (!targetTeamId) return [];
      return fixtures
        .filter(f => isFixtureFinished(f.status) && (f.home_team_id === targetTeamId || f.away_team_id === targetTeamId))
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

  // ─── Filtered fixtures ───
  const filteredFixtures = useMemo(() => {
    return fixtures.filter(f => {
      const isPlayed = isFixtureFinished(f.status);
      if (filter === 'upcoming') return !isPlayed;
      if (filter === 'played') return isPlayed;
      return true;
    });
  }, [fixtures, filter]);

  const nextMatch = fixtures.find(f => f.status === 'scheduled' || f.status === 'user_pending' || f.status === 'live');

  const isNextMatchHome = nextMatch ? nextMatch.home_team_id === userTeamId : false;
  const nextOpponentName = nextMatch
    ? sanitizeName(nextMatch.home_team_id === userTeamId ? nextMatch.away?.name : nextMatch.home?.name)
    : '---';

  // ─── Current gameweek + season progress ───
  const currentGameweek = useMemo(() => {
    const playedTurs = fixtures.filter(f => isFixtureFinished(f.status)).map(f => f.tur);
    return playedTurs.length > 0 ? Math.max(...playedTurs) : 0;
  }, [fixtures]);

  const seasonProgress = useMemo(() => {
    const totalWeeks = 34;
    const played = new Set(fixtures.filter(f => isFixtureFinished(f.status)).map(f => f.tur)).size;
    return Math.round((played / totalWeeks) * 100);
  }, [fixtures]);

  // ─── User result for a fixture ───
  const getUserResult = useCallback(
    (fixture: Fixture): FormResult | null => {
      if (!userTeamId || !isFixtureFinished(fixture.status)) return null;
      const isHome = fixture.home_team_id === userTeamId;
      const scored = isHome ? fixture.home_score : fixture.away_score;
      const conceded = isHome ? fixture.away_score : fixture.home_score;
      if (scored > conceded) return 'W';
      if (scored === conceded) return 'D';
      return 'L';
    },
    [userTeamId],
  );

  // ═══════════════════════════════════════════════════════════════════
  //  RENDER — Sade, modern fikstür ekranı
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* ── Üst Bar: Lig + Sezon + Canlı ─────────────────────── */}
      <div className="px-5 md:px-6 py-3 bg-gradient-to-r from-zinc-900 to-zinc-800/80 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Trophy size={14} className="text-amber-500" />
          <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.25em]">4. LİG</span>
          <span className="text-white/10">·</span>
          <span className="text-[10px] font-black text-amber-500/80 uppercase tracking-[0.2em]">
            {currentGameweek > 0 ? `Hafta ${currentGameweek}` : 'Yeni Sezon'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${seasonProgress}%` }} />
            </div>
            <span className="text-[9px] font-bold text-white/30">{seasonProgress}%</span>
          </div>
          {cycleStatus.phase === 'LIVE_MATCH' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/15 border border-red-500/30 rounded-full">
              <Radio size={9} className="text-red-500 animate-pulse" />
              <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">CANLI</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Header: Başlık + Filtre ─────────────────────────── */}
      <div className="px-5 md:px-6 pt-5 pb-4 bg-zinc-900/30 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-amber-500 rounded-full" />
            <div>
              <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">MAÇ TAKVİMİ</h2>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.25em] mt-0.5">{teamName}</p>
            </div>
            {userForm.length > 0 && (
              <div className="hidden md:flex items-center gap-2 ml-2">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Form:</span>
                <FormGuide results={userForm} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            {(['all', 'upcoming', 'played'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  filter === f ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {f === 'all' ? 'Tümü' : f === 'upcoming' ? 'Gelen' : 'Geçmiş'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── İçerik ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <RefreshCw className="w-7 h-7 text-amber-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Yükleniyor...</p>
          </div>
        ) : filteredFixtures.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
            <Calendar size={40} className="text-white/10" />
            <p className="text-xs text-white/30 text-center">Bu filtrede maç bulunmuyor.</p>
          </div>
        ) : (
          <div className="p-3 md:p-5 space-y-3 max-w-4xl mx-auto">
            {/* ─── Sonraki Maç Vurgusu ─── */}
            {nextMatch && filter !== 'played' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30 rounded-2xl p-4 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
                <div className="relative flex items-center gap-2 mb-2">
                  <Zap size={11} className="text-amber-500" />
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">SONRAKİ MAÇ</span>
                  {nextMatch.status === 'live' && (
                    <span className="ml-auto px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded-full text-[8px] font-black text-red-400 uppercase tracking-wider animate-pulse">CANLI</span>
                  )}
                </div>
                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] text-white/40 mb-1">
                      <Calendar size={10} />
                      <span className="font-bold">
                        {nextMatch.match_date ? format(new Date(nextMatch.match_date), 'd MMM', { locale: tr }) : 'Tarih yok'}
                      </span>
                      <Clock size={10} className="ml-1" />
                      <span className="font-bold text-amber-500/80">{nextMatch.match_time || '12:00'}</span>
                      <span className="text-white/20">·</span>
                      <span className="text-white/40">Hafta {nextMatch.tur}</span>
                    </div>
                    <div className="flex items-center gap-2 font-black text-white text-sm md:text-base">
                      <span className={isNextMatchHome ? 'text-amber-400' : ''}>
                        {isNextMatchHome ? teamName : nextOpponentName}
                      </span>
                      <span className="text-white/30 text-[10px] font-bold uppercase">
                        {isNextMatchHome ? '(E)' : '(D)'}
                      </span>
                      <span className="text-white/20">vs</span>
                      <span className={!isNextMatchHome ? 'text-amber-400' : ''}>
                        {!isNextMatchHome ? teamName : nextOpponentName}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateToMatch?.()}
                    className="shrink-0 px-3 md:px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all"
                  >
                    <Play size={11} className="fill-current" /> MAÇA GİT
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── Maç Listesi ─── */}
            {filteredFixtures.map((f, idx) => {
              const isHome = f.home_team_id === userTeamId;
              const homeName = isHome ? teamName : sanitizeName(f.home?.name);
              const awayName = !isHome ? teamName : sanitizeName(f.away?.name);
              const isPlayed = isFixtureFinished(f.status);
              const isLive = f.status === 'live';
              const result = getUserResult(f);
              const matchDate = f.match_date ? new Date(f.match_date) : null;
              const isToday = matchDate && matchDate.toDateString() === new Date().toDateString();

              return (
                <motion.div
                  key={f.id || idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                  className={`group relative bg-zinc-900/40 hover:bg-zinc-900/70 border rounded-2xl p-3 md:p-4 transition-all ${
                    isLive ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]' :
                    isToday && !isPlayed ? 'border-amber-500/30' :
                    isPlayed ? 'border-white/5' :
                    'border-white/8'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Sol: Tarih + Saat */}
                    <div className="shrink-0 w-16 md:w-20 text-center">
                      <div className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${isToday ? 'text-amber-500' : 'text-white/40'}`}>
                        {matchDate ? format(matchDate, 'EEE', { locale: tr }) : '—'}
                      </div>
                      <div className="text-[11px] font-black text-white">
                        {matchDate ? format(matchDate, 'd MMM', { locale: tr }) : 'TBD'}
                      </div>
                      <div className="text-[10px] font-black text-amber-500/80 mt-0.5">
                        {f.match_time || '12:00'}
                      </div>
                    </div>

                    {/* Ayırıcı */}
                    <div className="w-px h-12 bg-white/5" />

                    {/* Orta: Maç bilgisi */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[10px] text-white/30 mb-1">
                        <span className="font-bold uppercase tracking-wider">Hafta {f.tur}</span>
                        {isHome && <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-black text-[8px]">EV</span>}
                        {!isHome && <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded font-black text-[8px]">DEP</span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm md:text-[15px] font-black text-white">
                        <span className={`truncate ${isHome ? 'text-amber-400' : ''}`}>{homeName}</span>
                        {isPlayed ? (
                          <span className="shrink-0 px-2 py-0.5 bg-black/40 border border-white/10 rounded-md font-black text-amber-400 tabular-nums">
                            {f.home_score} - {f.away_score}
                          </span>
                        ) : isLive ? (
                          <span className="shrink-0 px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded-md text-[10px] font-black text-red-400 uppercase animate-pulse">CANLI</span>
                        ) : (
                          <span className="shrink-0 text-white/20 text-xs">vs</span>
                        )}
                        <span className={`truncate ${!isHome ? 'text-amber-400' : ''}`}>{awayName}</span>
                      </div>
                    </div>

                    {/* Sağ: Status + İzle butonu */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      {isPlayed && result && (
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] ${
                          result === 'W' ? 'bg-emerald-500/20 text-emerald-400' :
                          result === 'D' ? 'bg-zinc-500/20 text-white/60' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {result}
                        </div>
                      )}
                      {isLive && (
                        <button
                          onClick={() => onNavigateToMatch?.()}
                          className="px-2.5 py-1.5 bg-red-500 hover:bg-red-400 text-white rounded-lg font-black text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all animate-pulse"
                        >
                          <Radio size={9} /> İZLE
                        </button>
                      )}
                      {isPlayed && (
                        <button
                          onClick={() => router.push(`/match/${f.id}`)}
                          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg font-black text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all"
                        >
                          <Eye size={10} /> TEKRAR
                        </button>
                      )}
                      {!isPlayed && !isLive && isToday && (
                        <button
                          onClick={() => onNavigateToMatch?.()}
                          className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 rounded-lg font-black text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all"
                        >
                          <Clock size={10} /> BEKLİYOR
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
