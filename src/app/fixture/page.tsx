'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Trophy,
  Clock,
  ChevronRight,
  ArrowLeft,
  Shield,
  Play,
  Eye,
  MapPin,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════

interface FixtureItem {
  id: string;
  tur: number;
  match_date: string;
  match_time: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: string;
  away_team: string;
  is_home: boolean;
}

type FormResult = 'W' | 'D' | 'L';

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

function getResultColor(isHome: boolean, homeScore: number | null, awayScore: number | null): string | null {
  if (homeScore === null || awayScore === null) return null;
  const myScore = isHome ? homeScore : awayScore;
  const oppScore = isHome ? awayScore : homeScore;
  if (myScore > oppScore) return 'emerald';
  if (myScore === oppScore) return 'amber';
  return 'red';
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

function getUserResult(isHome: boolean, homeScore: number | null, awayScore: number | null): FormResult | null {
  if (homeScore === null || awayScore === null) return null;
  const myScore = isHome ? homeScore : awayScore;
  const oppScore = isHome ? awayScore : homeScore;
  if (myScore > oppScore) return 'W';
  if (myScore === oppScore) return 'D';
  return 'L';
}

// ═══════════════════════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════════════════════

function TeamShield({ name, isUser }: { name: string; isUser: boolean }) {
  return (
    <div
      className={`w-7 h-7 rounded-md flex items-center justify-center text-[8px] font-black shrink-0 ${
        isUser
          ? 'bg-gradient-to-br from-amber-500/30 to-amber-700/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
          : 'bg-white/[0.06] text-white/40 border border-white/10'
      }`}
    >
      {getTeamInitials(name)}
    </div>
  );
}

function ResultPill({ result }: { result: FormResult | null }) {
  if (!result) return null;
  const config: Record<FormResult, { bg: string; text: string; label: string }> = {
    W: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'G' },
    D: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'B' },
    L: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'M' },
  };
  const c = config[result];
  return (
    <span className={`${c.bg} ${c.text} text-[8px] font-black px-1 py-0.5 rounded`}>
      {c.label}
    </span>
  );
}

function VenueBadge({ isHome }: { isHome: boolean }) {
  return (
    <span
      className={`px-1 py-0.5 text-[6px] font-black uppercase tracking-widest rounded ${
        isHome
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
      }`}
    >
      {isHome ? 'EV' : 'DEP'}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Match Card Component (grid-friendly, ~300px)
// ═══════════════════════════════════════════════════════════════════════

function MatchCard({ match, teamName, onNavigate }: { match: FixtureItem; teamName: string; onNavigate: (id: string) => void }) {
  const isFinished = match.status === 'completed' || match.status === 'finished' || match.home_score !== null;
  const isLive = match.status === 'live';
  const isScheduled = !isFinished && !isLive;
  const isUserMatch = match.is_home || match.home_team === teamName || match.away_team === teamName;
  const isHomeTeam = match.is_home || match.home_team === teamName;
  const resultColor = isFinished && isUserMatch
    ? getResultColor(isHomeTeam, match.home_score, match.away_score)
    : null;
  const userResult = isFinished && isUserMatch
    ? getUserResult(isHomeTeam, match.home_score, match.away_score)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
        isUserMatch
          ? isLive
            ? 'border-red-500/30 bg-red-500/[0.04] shadow-[0_0_12px_rgba(239,68,68,0.1)]'
            : isScheduled
              ? 'border-amber-500/25 bg-amber-500/[0.03] shadow-[0_0_12px_rgba(245,158,11,0.06)]'
              : userResult === 'W'
                ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                : userResult === 'L'
                  ? 'border-red-500/15 bg-red-500/[0.02]'
                  : 'border-amber-500/15 bg-amber-500/[0.02]'
          : 'border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03]'
      }`}
      onClick={() => onNavigate(match.id)}
    >
      {/* Live / Status indicator */}
      {(isLive || isScheduled) && isUserMatch && (
        <div className={`px-3 py-1.5 border-b flex items-center justify-between ${
          isLive ? 'border-red-500/20 bg-red-500/[0.06]' : 'border-amber-500/15 bg-amber-500/[0.04]'
        }`}>
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] font-black text-red-400 uppercase tracking-wider">CANLI</span>
              </>
            ) : (
              <>
                <Clock size={8} className="text-amber-400" />
                <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider">{match.match_time || '--:--'}</span>
              </>
            )}
          </div>
          {isScheduled && isUserMatch && (
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate(match.id); }}
              className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600/80 hover:bg-emerald-500 text-white text-[7px] font-black uppercase tracking-widest rounded-md transition-all"
            >
              <Play size={7} className="fill-current" /> İzle
            </button>
          )}
          {isLive && isUserMatch && (
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate(match.id); }}
              className="flex items-center gap-1 px-2 py-0.5 bg-red-600/80 hover:bg-red-500 text-white text-[7px] font-black uppercase tracking-widest rounded-md transition-all animate-pulse"
            >
              <Eye size={7} /> İzle
            </button>
          )}
        </div>
      )}

      <div className="p-3">
        {/* Score / Time */}
        <div className="text-center mb-2.5">
          {isFinished ? (
            <div className="flex items-center justify-center gap-2">
              <span className={`text-lg font-black tabular-nums ${
                resultColor === 'emerald' ? 'text-emerald-400' :
                resultColor === 'amber' ? 'text-amber-400' :
                resultColor === 'red' ? 'text-red-400' : 'text-white/40'
              }`}>
                {match.home_score} - {match.away_score}
              </span>
              <ResultPill result={userResult} />
            </div>
          ) : !isUserMatch ? (
            <span className="text-[10px] text-white/25 font-semibold font-mono">
              {match.match_time || '--:--'}
            </span>
          ) : null}
        </div>

        {/* Teams */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <TeamShield name={match.home_team} isUser={match.home_team === teamName} />
            <span className={`text-[11px] font-bold truncate flex-1 ${match.home_team === teamName ? 'text-amber-300' : 'text-white/60'}`}>
              {match.home_team}
            </span>
            {isUserMatch && match.home_team === teamName && <VenueBadge isHome={true} />}
          </div>
          <div className="flex items-center gap-2">
            <TeamShield name={match.away_team} isUser={match.away_team === teamName} />
            <span className={`text-[11px] font-bold truncate flex-1 ${match.away_team === teamName ? 'text-amber-300' : 'text-white/60'}`}>
              {match.away_team}
            </span>
            {isUserMatch && match.away_team === teamName && <VenueBadge isHome={false} />}
          </div>
        </div>

        {/* Date */}
        <div className="mt-2 pt-1.5 border-t border-white/[0.04] flex items-center justify-between">
          <span className="text-[8px] text-white/20">{formatDate(match.match_date)}</span>
          <ChevronRight className="w-3 h-3 text-white/10" />
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Ana Bileşen
// ═══════════════════════════════════════════════════════════════════════

export default function FixturePage() {
  const router = useRouter();
  const [fixtures, setFixtures] = useState<FixtureItem[]>([]);
  const [teamName, setTeamName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeWeekFilter, setActiveWeekFilter] = useState<'all' | 'upcoming' | 'played'>('all');
  const [selectedTur, setSelectedTur] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileStr = localStorage.getItem('fm_profile');
        if (!profileStr) {
          setError('Profil bulunamadı.');
          setLoading(false);
          return;
        }
        const profile = JSON.parse(profileStr);
        const profileId = profile.id;
        setTeamName(profile.team_name || '');

        if (!isSupabaseConfigured()) {
          setError('Supabase yapılandırılmamış.');
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/fixture/${profileId}`);
        if (!res.ok) {
          setError('Fikstür yüklenirken hata oluştu.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setFixtures(data.fixtures || []);
      } catch (err) {
        console.error('[FixturePage] Error:', err);
        setError('Bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Haftalara göre grupla
  const fixturesByTur = useMemo(() => {
    const map = new Map<number, FixtureItem[]>();
    for (const f of fixtures) {
      const list = map.get(f.tur) ?? [];
      list.push(f);
      map.set(f.tur, list);
    }
    return map;
  }, [fixtures]);

  const sortedTurs = useMemo(() => {
    return [...fixturesByTur.entries()].sort((a, b) => a[0] - b[0]);
  }, [fixturesByTur]);

  // Filter fixtures based on activeWeekFilter
  const filteredTurs = useMemo(() => {
    if (activeWeekFilter === 'all') return sortedTurs;
    return sortedTurs.map(([tur, matches]) => {
      const filtered = matches.filter(m => {
        const isFinished = m.status === 'completed' || m.status === 'finished' || m.home_score !== null;
        return activeWeekFilter === 'upcoming' ? !isFinished : isFinished;
      });
      return [tur, filtered] as [number, FixtureItem[]];
    }).filter(([, matches]) => matches.length > 0);
  }, [sortedTurs, activeWeekFilter]);

  // Auto-select first available tur
  useEffect(() => {
    if (filteredTurs.length > 0 && selectedTur === null) {
      // Find the first tur with scheduled matches, otherwise first tur
      const currentTur = filteredTurs.find(([, matches]) =>
        matches.some(m => m.status === 'scheduled')
      );
      setSelectedTur(currentTur ? currentTur[0] : filteredTurs[0][0]);
    }
  }, [filteredTurs, selectedTur]);

  // Get matches for selected tur
  const selectedMatches = useMemo(() => {
    if (selectedTur === null) return [];
    return fixturesByTur.get(selectedTur) ?? [];
  }, [selectedTur, fixturesByTur]);

  // Navigation helpers
  const turList = filteredTurs.map(([tur]) => tur);
  const currentTurIdx = turList.indexOf(selectedTur ?? -1);
  const prevTur = currentTurIdx > 0 ? turList[currentTurIdx - 1] : null;
  const nextTur = currentTurIdx < turList.length - 1 ? turList[currentTurIdx + 1] : null;

  const handleNavigate = (id: string) => {
    router.push(`/match/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-amber-500/40 rounded-full animate-spin" />
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Fikstür Yükleniyor</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <p className="text-white/50 text-sm">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/10 transition-all"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Üst Bar */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Geri</span>
          </button>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-black uppercase tracking-wider text-white/70">Fikstür</span>
          </div>
          <div className="flex items-center gap-2 text-white/20">
            <Calendar size={14} />
            <span className="text-[10px] font-semibold">{fixtures.length} maç</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          {(['all', 'upcoming', 'played'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setActiveWeekFilter(f); setSelectedTur(null); }}
              className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeWeekFilter === f
                  ? 'bg-amber-500/15 text-amber-300 shadow-md shadow-amber-500/5'
                  : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'
              }`}
            >
              {f === 'all' ? 'Tümü' : f === 'upcoming' ? 'Gelen Maçlar' : 'Geçmiş'}
            </button>
          ))}
        </div>

        {/* Week selector buttons — horizontal scroll-free */}
        {filteredTurs.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Prev button */}
            <button
              onClick={() => prevTur !== null && setSelectedTur(prevTur)}
              disabled={prevTur === null}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                prevTur !== null
                  ? 'border-white/10 bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60'
                  : 'border-white/[0.04] bg-transparent text-white/10 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Week buttons — flex-wrap, no horizontal scroll */}
            <div className="flex-1 flex flex-wrap gap-1.5 justify-center">
              {filteredTurs.map(([tur, matches]) => {
                const hasScheduled = matches.some(m => m.status === 'scheduled');
                const hasUserMatch = matches.some(m => m.is_home || m.home_team === teamName || m.away_team === teamName);
                const allCompleted = matches.every(m => m.home_score !== null && m.away_score !== null);

                return (
                  <button
                    key={tur}
                    onClick={() => setSelectedTur(tur)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all relative ${
                      selectedTur === tur
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.12)]'
                        : hasScheduled && !allCompleted
                          ? 'bg-amber-500/[0.05] text-amber-400/50 border border-amber-500/10 hover:bg-amber-500/10'
                          : 'bg-white/[0.02] text-white/25 border border-white/[0.05] hover:bg-white/[0.04]'
                    }`}
                  >
                    H{tur}
                    {hasScheduled && !allCompleted && selectedTur !== tur && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                    {hasUserMatch && allCompleted && selectedTur !== tur && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <button
              onClick={() => nextTur !== null && setSelectedTur(nextTur)}
              disabled={nextTur === null}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                nextTur !== null
                  ? 'border-white/10 bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60'
                  : 'border-white/[0.04] bg-transparent text-white/10 cursor-not-allowed'
              }`}
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>
        )}

        {/* Selected week header */}
        {selectedTur !== null && selectedMatches.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${
                selectedMatches.some(m => m.status === 'scheduled')
                  ? 'text-amber-400'
                  : 'text-white/20'
              }`} />
              <span className={`text-xs font-black uppercase tracking-widest ${
                selectedMatches.some(m => m.status === 'scheduled')
                  ? 'text-amber-300'
                  : 'text-white/30'
              }`}>
                {selectedTur}. Hafta
              </span>
              <span className="text-[9px] text-white/15 font-semibold">— {selectedMatches.length} Maç</span>
            </div>
            <span className="text-[8px] text-white/15">
              {formatDate(selectedMatches[0]?.match_date || '')}
            </span>
          </div>
        )}

        {/* Match cards grid — NO horizontal scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-24">
          <AnimatePresence mode="popLayout">
            {selectedTur === null || selectedMatches.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Calendar className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-xs text-white/25">
                  {filteredTurs.length === 0 ? 'Fikstür bulunamadı' : 'Bir hafta seçin'}
                </p>
              </div>
            ) : (
              selectedMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  teamName={teamName}
                  onNavigate={handleNavigate}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
