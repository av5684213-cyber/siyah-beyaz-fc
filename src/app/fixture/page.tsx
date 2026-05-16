'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Calendar,
  Trophy,
  Clock,
  ChevronRight,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// Helper
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// Ana Bileşen
// ═══════════════════════════════════════════════════════════════

export default function FixturePage() {
  const router = useRouter();
  const [fixtures, setFixtures] = useState<FixtureItem[]>([]);
  const [teamName, setTeamName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Profil bilgisi al
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

        // Fikstür API'den çek
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
          <div className="w-10 h-10 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
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

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {sortedTurs.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-xs text-white/25">Fikstür bulunamadı</p>
          </div>
        ) : (
          sortedTurs.map(([tur, matches]) => {
            // Bu haftadaki kullanıcının maçı var mı
            const userMatch = matches.find(m => m.is_home || m.home_team === teamName || m.away_team === teamName);
            const isCurrentTur = matches.some(m => m.status === 'scheduled');
            const allCompleted = matches.every(m => m.home_score !== null && m.away_score !== null);

            return (
              <div
                key={tur}
                className={`rounded-xl border overflow-hidden ${
                  isCurrentTur && !allCompleted
                    ? 'border-amber-500/30 bg-amber-500/[0.02]'
                    : 'border-white/[0.06] bg-white/[0.01]'
                }`}
              >
                {/* Hafta başlığı */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.04] bg-white/[0.02]">
                  <Shield className={`w-3.5 h-3.5 ${isCurrentTur && !allCompleted ? 'text-amber-400' : 'text-white/20'}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isCurrentTur && !allCompleted ? 'text-amber-300' : 'text-white/30'}`}>
                    {tur}. Hafta
                  </span>
                  {isCurrentTur && !allCompleted && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">
                      Mevcut
                    </span>
                  )}
                </div>

                {/* Maçlar */}
                <div className="divide-y divide-white/[0.03]">
                  {matches.map((match) => {
                    const isFinished = match.status === 'completed' || match.status === 'finished' || match.home_score !== null;
                    const isLive = match.status === 'live';
                    const isUserMatch = match.is_home || match.home_team === teamName || match.away_team === teamName;
                    const resultColor = isFinished && isUserMatch
                      ? getResultColor(match.is_home || match.home_team === teamName, match.home_score, match.away_score)
                      : null;

                    return (
                      <button
                        key={match.id}
                        onClick={() => router.push(`/match/${match.id}`)}
                        className={`w-full text-left px-4 py-3 transition-all hover:bg-white/[0.03] flex items-center gap-3 ${
                          isUserMatch ? 'bg-amber-500/[0.03] border-l-2 border-l-amber-500' : ''
                        }`}
                      >
                        {/* Durum/Skor */}
                        <div className="w-14 shrink-0 text-right">
                          {isFinished ? (
                            <span className={`text-[10px] font-bold ${
                              resultColor === 'emerald' ? 'text-emerald-400' :
                              resultColor === 'amber' ? 'text-amber-400' :
                              resultColor === 'red' ? 'text-red-400' : 'text-white/30'
                            }`}>
                              {match.home_score} - {match.away_score}
                            </span>
                          ) : isLive ? (
                            <div className="flex items-center justify-end gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[10px] font-bold text-emerald-400">CANLI</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-white/25 font-semibold">
                              {match.match_time || '--:--'}
                            </span>
                          )}
                        </div>

                        {/* Takımlar */}
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-bold truncate ${match.home_team === teamName ? 'text-amber-300' : 'text-white/60'}`}>
                              {match.home_team}
                            </span>
                            {match.is_home && (
                              <span className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">EV</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-bold truncate ${match.away_team === teamName ? 'text-amber-300' : 'text-white/60'}`}>
                              {match.away_team}
                            </span>
                            {!match.is_home && match.away_team === teamName && (
                              <span className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/20">DEP</span>
                            )}
                          </div>
                        </div>

                        {/* Tarih */}
                        <div className="w-16 shrink-0 text-right">
                          <span className="text-[9px] text-white/20">{formatDate(match.match_date)}</span>
                        </div>

                        <ChevronRight className="w-3.5 h-3.5 text-white/10 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
