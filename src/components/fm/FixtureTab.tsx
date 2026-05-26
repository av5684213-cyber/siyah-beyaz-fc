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

// ─── Turkish Month Names ─────────────────────────────────────────
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

// ─── Referee Badge ────────────────────────────────────────────────
const REFEREE_LABELS: Record<string, { emoji: string; label: string; color: string }> = {
  katil: { emoji: '🟥', label: 'Katılcı', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  dengeci: { emoji: '⚖️', label: 'Dengeci', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  'hoşgörülü': { emoji: '🤝', label: 'Hoşgörülü', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  ev_sahibi: { emoji: '🏠', label: 'Ev Sahibi', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  'değişken': { emoji: '🎲', label: 'Değişken', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  var_sever: { emoji: '📺', label: 'VAR Sever', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
};

function RefereeBadge({ name, personality, strictness }: { name?: string | null; personality?: string | null; strictness?: number | null }) {
  if (!name && !personality) return null;
  const refInfo = personality ? REFEREE_LABELS[personality] : null;
  const strictnessLabel = !strictness ? null
    : strictness >= 75 ? 'Çok Sert'
    : strictness >= 55 ? 'Sert'
    : strictness >= 40 ? 'Dengeli'
    : strictness >= 25 ? 'Yumuşak'
    : 'Çok Yumuşak';

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${refInfo?.color || 'text-white/40 bg-white/5 border-white/10'}`}>
      {refInfo && <span className="text-xs">{refInfo.emoji}</span>}
      {name && <span className="text-[8px] font-bold text-white/60">{name}</span>}
      {refInfo && <span className="text-[7px] font-black uppercase tracking-wider opacity-70">{refInfo.label}</span>}
      {strictnessLabel && (
        <span className="text-[6px] font-black uppercase tracking-widest opacity-50">
          ({strictnessLabel})
        </span>
      )}
    </div>
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
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const cycleStatus = (() => {
    const now = new Date();
    const trDate = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const day = trDate.getDay();
    const hour = trDate.getHours();
    const minute = trDate.getMinutes();
    const isWeekday = day >= 1 && day <= 5;
    const isLiveMatch = isWeekday && (hour === 12 || hour === 18) && minute < 30;
    const isPreMatch = isWeekday && (
      (hour === 10 || hour === 11) || (hour === 16 || hour === 17 && minute < 30)
    );
    return {
      phase: isLiveMatch ? 'LIVE_MATCH' as const : isPreMatch ? 'PRE_MATCH' as const : 'IDLE' as const,
    };
  })();

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
      } else {
        setFixtures(allFixtures);
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
  const filteredFixtures = useMemo(() => {
    return fixtures.filter(f => {
      const isPlayed = f.status === 'finished';
      if (filter === 'upcoming') return !isPlayed;
      if (filter === 'played') return isPlayed;
      return true;
    });
  }, [fixtures, filter]);

  const nextMatch = fixtures.find(f => f.status === 'scheduled' || f.status === 'user_pending' || f.status === 'live');

  // ─── Grouped by month ──────────────────────────────────────────
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
                {f === 'all' ? 'Tümü' : f === 'upcoming' ? 'Gelenler' : 'Geçmiş'}
              </button>
            ))}
          </div>
        </div>
      </div>

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
                      {/* Referee info */}
                      {(nextMatch.referee_name || nextMatch.referee_personality) && (
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Hakem:</span>
                          <RefereeBadge
                            name={nextMatch.referee_name}
                            personality={nextMatch.referee_personality}
                            strictness={nextMatch.referee_strictness}
                          />
                        </div>
                      )}
                    </div>

                    {/* ── Action Button ───────────────────────────────── */}
                    <div className="mt-6 flex justify-center">
                      {onNavigateToMatch && (cycleStatus.phase === 'LIVE_MATCH' || cycleStatus.phase === 'PRE_MATCH') ? (
                        <button
                          onClick={onNavigateToMatch}
                          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-2xl shadow-amber-500/20 flex items-center gap-3 group/btn hover:scale-105 active:scale-95"
                        >
                          <Zap size={14} className="group-hover:fill-current" /> MAÇ ODASINA GİT
                        </button>
                      ) : nextMatch.status === 'live' && onNavigateToMatch ? (
                        <button
                          onClick={onNavigateToMatch}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600/90 to-red-500/90 hover:from-red-500 hover:to-red-400 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95 animate-pulse"
                        >
                          <Eye size={14} /> MAÇI İZLE
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
                FIXTURE LIST — Month-Grouped Match Cards
                ══════════════════════════════════════════════════════ */}
            {filteredFixtures.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 bg-zinc-900/20 rounded-2xl border border-dashed border-white/10">
                <Calendar className="w-12 h-12 text-white/5 mb-4" />
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
                  Maç bulunamadı
                </p>
              </div>
            ) : (
              monthKeys.map(monthKey => {
                const monthFixtures = groupedByMonth.get(monthKey) || [];
                return (
                  <div key={monthKey} className="space-y-3">
                    {/* ── Month Header ── */}
                    <div className="sticky top-0 z-10 backdrop-blur-md bg-black/90 border-b border-white/[0.06] px-4 py-2.5 flex items-center justify-between rounded-xl">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-amber-400/70" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80">
                          {monthKey}
                        </span>
                      </div>
                      <span className="text-[9px] text-white/20 font-semibold">{monthFixtures.length} maç</span>
                    </div>

                    {/* ── Match Cards for this month ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <AnimatePresence mode="popLayout">
                        {monthFixtures.map((fixture, idx) => {
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
                                  {/* HFT (İY) display removed */}
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
                            {/* No "İzle" button for scheduled matches - only show for live and finished */}
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
                  }
                </AnimatePresence>
              </div>
            </div>
          );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
