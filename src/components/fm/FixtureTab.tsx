'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { FootballLoader } from '@/components/ui/FootballLoader';
import {
  Calendar,
  Clock,
  Trophy,
  RefreshCw,
  Eye,
  Radio,
  Play,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loadFixtures, loadMatchHistory } from '@/lib/fm/persistence';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

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

function FormGuide({ results }: { results: FormResult[] }) {
  const colorMap: Record<FormResult, string> = {
    W: 'bg-emerald-500',
    D: 'bg-amber-500',
    L: 'bg-red-500',
  };
  return (
    <div className="flex items-center gap-1">
      {results.length === 0 ? (
        <span className="text-[8px] text-white/20 font-bold uppercase tracking-wider">—</span>
      ) : results.map((r, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${colorMap[r]}`} />
      ))}
    </div>
  );
}

// Mackolik-tarzı EV / DY rozeti
function VenueBadge({ isHome }: { isHome: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-5 rounded text-[9px] font-black tracking-wider ${
        isHome
          ? 'bg-emerald-500 text-white'
          : 'bg-amber-500 text-black'
      }`}
    >
      {isHome ? 'EV' : 'DY'}
    </span>
  );
}

// Sonuç rozeti (G/B/M)
function ResultPill({ result }: { result: FormResult | null }) {
  if (!result) return null;
  const cfg: Record<FormResult, { bg: string; text: string; label: string }> = {
    W: { bg: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-400', label: 'G' },
    D: { bg: 'bg-amber-500/20 border-amber-500/40', text: 'text-amber-400', label: 'B' },
    L: { bg: 'bg-red-500/20 border-red-500/40', text: 'text-red-400', label: 'M' },
  };
  const c = cfg[result];
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded border ${c.bg} ${c.text} text-[10px] font-black`}>
      {c.label}
    </span>
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

  // Cycle status
  const cycleStatus = (() => {
    const now = new Date();
    const trDate = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const day = trDate.getDay();
    const hour = trDate.getHours();
    const minute = trDate.getMinutes();
    const isWeekday = day >= 1 && day <= 5;
    const isLiveMatch = isWeekday && (hour === 12 || hour === 18) && minute < 30;
    return { phase: isLiveMatch ? 'LIVE_MATCH' as const : 'IDLE' as const };
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
        .maybeSingle();
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

  // ─── Stats ───
  const currentGameweek = useMemo(() => {
    const playedTurs = fixtures.filter(f => isFixtureFinished(f.status)).map(f => f.tur);
    return playedTurs.length > 0 ? Math.max(...playedTurs) : 0;
  }, [fixtures]);

  const seasonProgress = useMemo(() => {
    const totalWeeks = 34;
    const played = new Set(fixtures.filter(f => isFixtureFinished(f.status)).map(f => f.tur)).size;
    return Math.round((played / totalWeeks) * 100);
  }, [fixtures]);

  const totalWeeks = 34;
  const remainingWeeks = Math.max(0, totalWeeks - currentGameweek);

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

  // ─── Grouped by month (Mackolik tarzı) ───
  const groupedByMonth = useMemo(() => {
    const map = new Map<string, Fixture[]>();
    filteredFixtures.forEach(f => {
      const key = f.match_date ? getMonthYear(f.match_date) : 'BİLİNMİYOR';
      const list = map.get(key) || [];
      list.push(f);
      map.set(key, list);
    });
    return map;
  }, [filteredFixtures]);

  const monthKeys = useMemo(() => Array.from(groupedByMonth.keys()), [groupedByMonth]);

  // ═══════════════════════════════════════════════════════════════════
  //  RENDER — Mackolik-tarzı fikstür ekranı
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-2xl overflow-hidden border border-white/10">
      {/* ── ÜST BAR: Takım + Lig + Gün (Mackolik tarzı) ─────────── */}
      <div className="px-5 py-4 bg-gradient-to-r from-zinc-900 via-zinc-800/80 to-zinc-900 border-b border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Sol: Takım adı + Lig + Gün */}
          <div className="flex items-center gap-4">
            <div className="w-1 h-12 bg-amber-500 rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">{teamName}</h2>
                <span className="px-1.5 py-0.5 bg-amber-500 text-black text-[9px] font-black rounded">PRO</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Trophy size={11} className="text-amber-500" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">4. LİG</span>
                <span className="text-white/10">·</span>
                <span className="text-[10px] font-black text-amber-500/90 uppercase tracking-[0.2em]">
                  {currentGameweek > 0 ? `${currentGameweek}. GÜN` : '1. GÜN'}
                </span>
                <span className="text-white/10">·</span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                  KALAN: {remainingWeeks} GÜN
                </span>
              </div>
            </div>
          </div>

          {/* Sağ: Form + Canlı + Filtre */}
          <div className="flex items-center gap-3">
            {userForm.length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/30 border border-white/5 rounded-lg">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">FORM</span>
                <FormGuide results={userForm} />
              </div>
            )}
            {cycleStatus.phase === 'LIVE_MATCH' && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/15 border border-red-500/30 rounded-md animate-pulse">
                <Radio size={10} className="text-red-500" />
                <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">CANLI</span>
              </div>
            )}
            <div className="flex items-center gap-0.5 bg-black/40 p-1 rounded-lg border border-white/5">
              {(['all', 'upcoming', 'played'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-wider transition-all ${
                    filter === f ? 'bg-amber-500 text-black' : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f === 'all' ? 'TÜMÜ' : f === 'upcoming' ? 'GELEN' : 'OYNANAN'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mini season progress bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${seasonProgress}%` }} />
          </div>
          <span className="text-[9px] font-bold text-white/30">{seasonProgress}%</span>
        </div>
      </div>

      {/* ── İÇERİK ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <FootballLoader size={56} label="Fikstür Yükleniyor" />
          </div>
        ) : filteredFixtures.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
            <Calendar size={40} className="text-white/10" />
            <p className="text-xs text-white/30 text-center">Bu filtrede maç bulunmuyor.</p>
          </div>
        ) : (
          <div className="p-3 md:p-4 space-y-5">
            {/* ════════════════════════════════════════════
                NEXT MATCH SPOTLIGHT (üstte)
                ════════════════════════════════════════════ */}
            {nextMatch && filter !== 'played' && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 border border-amber-500/40 rounded-xl overflow-hidden"
              >
                <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">SIRADAKİ MAÇ</span>
                  {nextMatch.status === 'live' && (
                    <span className="ml-auto px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded text-[8px] font-black text-red-400 uppercase animate-pulse">CANLI</span>
                  )}
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] text-white/40 mb-1.5">
                      <Calendar size={10} />
                      <span className="font-bold">
                        {nextMatch.match_date ? format(new Date(nextMatch.match_date), 'd MMM yyyy', { locale: tr }) : 'Tarih yok'}
                      </span>
                      <Clock size={10} className="ml-1" />
                      <span className="font-black text-amber-500">{nextMatch.match_time || '12:00'}</span>
                      <span className="text-white/20">·</span>
                      <span className="text-white/40">{nextMatch.tur}. HAFTA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <VenueBadge isHome={isNextMatchHome} />
                      <span className="text-sm font-black text-white truncate">
                        {isNextMatchHome ? teamName : nextOpponentName}
                      </span>
                      <span className="text-white/20 text-xs mx-1">vs</span>
                      <span className="text-sm font-black text-white truncate">
                        {!isNextMatchHome ? teamName : nextOpponentName}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateToMatch?.()}
                    className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-md font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all"
                  >
                    <Play size={11} className="fill-current" /> MAÇA GİT
                  </button>
                </div>
              </motion.div>
            )}

            {/* ════════════════════════════════════════════
                MAÇLAR — AY BAZINDA GRUPLU (Mackolik tarzı)
                ════════════════════════════════════════════ */}
            {monthKeys.map(monthKey => {
              const monthFixtures = groupedByMonth.get(monthKey) || [];
              return (
                <div key={monthKey}>
                  {/* Ay Başlığı — sarı, kalın, takvim ikonu */}
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <Calendar size={13} className="text-amber-500" />
                    <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.25em]">{monthKey}</h3>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">
                      ({monthFixtures.length} maç)
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-amber-500/20 to-transparent ml-1" />
                  </div>

                  {/* Maç satırları */}
                  <div className="space-y-1.5">
                    {monthFixtures.map((f, idx) => {
                      const isHome = f.home_team_id === userTeamId;
                      const homeName = isHome ? teamName : sanitizeName(f.home?.name);
                      const awayName = !isHome ? teamName : sanitizeName(f.away?.name);
                      const isPlayed = isFixtureFinished(f.status);
                      const isLive = f.status === 'live';
                      const result = getUserResult(f);
                      const matchDate = f.match_date ? new Date(f.match_date) : null;
                      const isToday = matchDate && matchDate.toDateString() === new Date().toDateString();
                      const isPast = matchDate && matchDate < new Date() && !isToday;

                      // Renk kodları (Mackolik tarzı)
                      const borderColor = isLive
                        ? 'border-l-red-500'
                        : isToday && !isPlayed
                        ? 'border-l-amber-500'
                        : isPlayed
                        ? (result === 'W' ? 'border-l-emerald-500' : result === 'L' ? 'border-l-red-500/50' : 'border-l-zinc-500')
                        : 'border-l-zinc-700';

                      return (
                        <motion.div
                          key={f.id || idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: Math.min(idx * 0.015, 0.2) }}
                          className={`group bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 ${borderColor} border-l-4 rounded-md overflow-hidden transition-all`}
                        >
                          {/* Satır 1: Tarih + Saat + Tur + Status badge */}
                          <div className="flex items-center gap-2 px-3 py-1 bg-black/30 border-b border-white/5">
                            <span className={`text-[9px] font-black uppercase tracking-wider ${isToday ? 'text-amber-500' : 'text-white/40'}`}>
                              {matchDate ? format(matchDate, 'EEE', { locale: tr }) : '—'}
                            </span>
                            <span className="text-[9px] font-bold text-white/40">
                              {matchDate ? format(matchDate, 'd MMM', { locale: tr }) : 'TBD'}
                            </span>
                            <span className="text-white/10">·</span>
                            <span className="text-[9px] font-bold text-amber-500/80">{f.match_time || '12:00'}</span>
                            <span className="text-white/10">·</span>
                            <span className="text-[9px] font-bold text-white/30 uppercase">{f.tur}. Hafta</span>

                            <div className="ml-auto flex items-center gap-1.5">
                              {isLive && (
                                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 rounded text-[8px] font-black uppercase tracking-wider animate-pulse">
                                  CANLI
                                </span>
                              )}
                              {isToday && !isPlayed && !isLive && (
                                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded text-[8px] font-black uppercase tracking-wider">
                                  BUGÜN
                                </span>
                              )}
                              {isPast && !isPlayed && (
                                <span className="px-1.5 py-0.5 bg-zinc-500/20 text-white/40 border border-zinc-500/30 rounded text-[8px] font-black uppercase tracking-wider">
                                  BEKLEMEDE
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Satır 2: Takımlar + Skor + Buton */}
                          <div className="px-3 py-2.5 flex items-center gap-2.5">
                            {/* Sol: Ev sahibi takım + EV rozeti */}
                            <div className="flex-1 min-w-0 flex items-center gap-2 justify-end text-right">
                              <span className={`text-sm font-black truncate ${isHome ? 'text-amber-400' : 'text-white/90'}`}>
                                {homeName}
                              </span>
                              <VenueBadge isHome={true} />
                            </div>

                            {/* Orta: Skor / vs + Result pill */}
                            <div className="shrink-0 flex flex-col items-center gap-0.5 min-w-[60px]">
                              {isPlayed ? (
                                <>
                                  <span className="text-base font-black text-white tabular-nums tracking-wide">
                                    {f.home_score} - {f.away_score}
                                  </span>
                                  <ResultPill result={result} />
                                </>
                              ) : isLive ? (
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-wider animate-pulse">CANLI</span>
                              ) : (
                                <span className="text-xs font-black text-white/20 tracking-widest">VS</span>
                              )}
                            </div>

                            {/* Sağ: DY rozeti + Deplasman takımı */}
                            <div className="flex-1 min-w-0 flex items-center gap-2 text-left">
                              <VenueBadge isHome={false} />
                              <span className={`text-sm font-black truncate ${!isHome ? 'text-amber-400' : 'text-white/90'}`}>
                                {awayName}
                              </span>
                            </div>

                            {/* En sağ: Aksiyon butonu */}
                            <div className="shrink-0 flex items-center gap-1.5 ml-1">
                              {isLive && (
                                <button
                                  onClick={() => onNavigateToMatch?.()}
                                  className="px-2.5 py-1.5 bg-red-500 hover:bg-red-400 text-white rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all animate-pulse"
                                >
                                  <Radio size={9} /> İZLE
                                </button>
                              )}
                              {isPlayed && (
                                <button
                                  onClick={() => router.push(`/match/${f.id}`)}
                                  className="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                                >
                                  <Eye size={10} /> TEKRAR
                                </button>
                              )}
                              {!isPlayed && !isLive && isToday && (
                                <button
                                  onClick={() => onNavigateToMatch?.()}
                                  className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-500 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                                >
                                  <ChevronRight size={10} /> HAZIR
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
