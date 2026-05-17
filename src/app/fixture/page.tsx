'use client';

import React, { useState, useEffect } from 'react';
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
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 ${
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
    <span className={`${c.bg} ${c.text} text-[9px] font-black px-1.5 py-0.5 rounded`}>
      {c.label}
    </span>
  );
}

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

  // Haftalara göre grupla
  const fixturesByTur = new Map<number, FixtureItem[]>();
  for (const f of fixtures) {
    const list = fixturesByTur.get(f.tur) ?? [];
    list.push(f);
    fixturesByTur.set(f.tur, list);
  }

  const sortedTurs = [...fixturesByTur.entries()].sort((a, b) => a[0] - b[0]);

  // Filter fixtures based on activeWeekFilter
  const getFilteredTurs = () => {
    if (activeWeekFilter === 'all') return sortedTurs;
    return sortedTurs.map(([tur, matches]) => {
      const filtered = matches.filter(m => {
        const isFinished = m.status === 'completed' || m.status === 'finished' || m.home_score !== null;
        return activeWeekFilter === 'upcoming' ? !isFinished : isFinished;
      });
      return [tur, filtered] as [number, FixtureItem[]];
    }).filter(([, matches]) => matches.length > 0);
  };

  const filteredTurs = getFilteredTurs();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Üst Bar */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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

      {/* Filter tabs */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          {(['all', 'upcoming', 'played'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveWeekFilter(f)}
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
      </div>

      {/* Fikstür Listesi */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTurs.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-8 h-8 text-white/10 mx-auto mb-3" />
              <p className="text-xs text-white/25">Fikstür bulunamadı</p>
            </div>
          ) : (
            filteredTurs.map(([tur, matches]) => {
              const hasScheduled = matches.some(m => m.status === 'scheduled');
              const allCompleted = matches.every(m => m.home_score !== null && m.away_score !== null);
              const hasUserMatch = matches.some(m => m.is_home || m.home_team === teamName || m.away_team === teamName);

              return (
                <motion.div
                  key={`${tur}-${activeWeekFilter}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-xl border overflow-hidden ${
                    hasScheduled && !allCompleted
                      ? 'border-amber-500/25 bg-gradient-to-b from-amber-500/[0.04] to-transparent'
                      : 'border-white/[0.06] bg-white/[0.01]'
                  }`}
                >
                  {/* Hafta başlığı */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
                    <Shield className={`w-3.5 h-3.5 ${hasScheduled && !allCompleted ? 'text-amber-400' : 'text-white/20'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${hasScheduled && !allCompleted ? 'text-amber-300' : 'text-white/30'}`}>
                      {tur}. Hafta
                    </span>
                    <span className="text-[9px] text-white/15 font-semibold">— {matches.length} Maç</span>
                    {hasScheduled && !allCompleted && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">
                        Mevcut
                      </span>
                    )}
                    {hasUserMatch && allCompleted && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold uppercase tracking-wider ml-auto">
                        Tamamlandı
                      </span>
                    )}
                  </div>

                  {/* Maçlar */}
                  <div className="divide-y divide-white/[0.03]">
                    {matches.map((match) => {
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
                        <div
                          key={match.id}
                          className={`relative ${
                            isUserMatch
                              ? isLive
                                ? 'bg-red-500/[0.04] border-l-2 border-l-red-500'
                                : isScheduled
                                  ? 'bg-amber-500/[0.03] border-l-2 border-l-amber-500'
                                  : userResult === 'W'
                                    ? 'bg-emerald-500/[0.03] border-l-2 border-l-emerald-500'
                                    : userResult === 'L'
                                      ? 'bg-red-500/[0.02] border-l-2 border-l-red-500/60'
                                      : 'bg-amber-500/[0.02] border-l-2 border-l-amber-500/50'
                              : ''
                          }`}
                        >
                          <button
                            onClick={() => router.push(`/match/${match.id}`)}
                            className="w-full text-left px-4 py-3 transition-all hover:bg-white/[0.03] flex items-center gap-3"
                          >
                            {/* Skor / Durum */}
                            <div className="w-16 shrink-0 text-center">
                              {isFinished ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className={`text-[11px] font-black tabular-nums ${
                                    resultColor === 'emerald' ? 'text-emerald-400' :
                                    resultColor === 'amber' ? 'text-amber-400' :
                                    resultColor === 'red' ? 'text-red-400' : 'text-white/30'
                                  }`}>
                                    {match.home_score} - {match.away_score}
                                  </span>
                                  <ResultPill result={userResult} />
                                </div>
                              ) : isLive ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                  <span className="text-[9px] font-black text-red-400 uppercase">Canlı</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-white/25 font-semibold font-mono">
                                  {match.match_time || '--:--'}
                                </span>
                              )}
                            </div>

                            {/* Takımlar */}
                            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <TeamShield name={match.home_team} isUser={match.home_team === teamName} />
                                <span className={`text-[11px] font-bold truncate ${match.home_team === teamName ? 'text-amber-300' : 'text-white/60'}`}>
                                  {match.home_team}
                                </span>
                                {isUserMatch && match.home_team === teamName && <VenueBadge isHome={true} />}
                              </div>
                              <div className="flex items-center gap-2">
                                <TeamShield name={match.away_team} isUser={match.away_team === teamName} />
                                <span className={`text-[11px] font-bold truncate ${match.away_team === teamName ? 'text-amber-300' : 'text-white/60'}`}>
                                  {match.away_team}
                                </span>
                                {isUserMatch && match.away_team === teamName && <VenueBadge isHome={false} />}
                              </div>
                            </div>

                            {/* Tarih + Aksiyon */}
                            <div className="shrink-0 flex flex-col items-end gap-1.5">
                              <span className="text-[9px] text-white/20">{formatDate(match.match_date)}</span>
                              {isUserMatch && isScheduled && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/match/${match.id}`);
                                  }}
                                  className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-600/90 to-emerald-500/90 hover:from-emerald-500 hover:to-emerald-400 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all hover:scale-105 active:scale-95"
                                >
                                  <Play size={8} className="fill-current" />
                                  Maçı İzle
                                </button>
                              )}
                              {isUserMatch && isLive && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/match/${match.id}`);
                                  }}
                                  className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-red-600/90 to-red-500/90 hover:from-red-500 hover:to-red-400 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all hover:scale-105 active:scale-95 animate-pulse"
                                >
                                  <Eye size={8} />
                                  İzle
                                </button>
                              )}
                              {!isUserMatch && (
                                <ChevronRight className="w-3.5 h-3.5 text-white/10" />
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
