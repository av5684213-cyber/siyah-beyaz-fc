'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Clock,
  Eye,
  Swords,
  Trophy,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface FriendlyMatchRecord {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  played_at: string;
  home_team_name?: string;
  away_team_name?: string;
}

type ResultFilter = 'all' | 'wins' | 'draws' | 'losses';

// ═══════════════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════════════

export default function FriendlyMatchHistoryPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<FriendlyMatchRecord[]>([]);
  const [profileId, setProfileId] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  useEffect(() => {
    const loadData = async () => {
      try {
        // [BUG-17] Önce localStorage, sonra Supabase Auth
        let profile: any = null;
        const profileStr = typeof window !== 'undefined' ? localStorage.getItem('fm_profile') : null;
        if (profileStr) {
          try { profile = JSON.parse(profileStr); } catch (e) { console.warn("[silent-catch]", e); }
        }

        if (!profile?.id && isSupabaseConfigured()) {
          const supabase = getSupabase();
          if (supabase) {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user?.id) {
                const { data: profileRow } = await supabase
                  .from('profiles')
                  .select('id, team_name')
                  .eq('id', user.id)
                  .maybeSingle();
                if (profileRow) {
                  profile = profileRow;
                  try { localStorage.setItem('fm_profile', JSON.stringify(profileRow)); } catch (e) { console.warn("[silent-catch]", e); }
                }
              }
            } catch (authErr) {
              console.warn('[friendly-history] Supabase auth failed:', authErr);
            }
          }
        }

        if (!profile?.id) {
          setError('Profil bulunamadı.');
          setLoading(false);
          return;
        }
        setProfileId(profile.id);
        setTeamName(profile.team_name || '');

        if (!isSupabaseConfigured()) {
          setError('Supabase yapılandırılmamış.');
          setLoading(false);
          return;
        }

        const supabase = getSupabase();
        if (!supabase) {
          setError('Supabase bağlantısı kurulamadı.');
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('friendly_matches')
          .select('*')
          .or(`home_team_id.eq.${profile.id},away_team_id.eq.${profile.id}`)
          .order('played_at', { ascending: false })
          .limit(50);

        if (fetchError) {
          console.error('[FriendlyHistory] Fetch error:', fetchError.message);
          setError('Maçlar yüklenirken hata oluştu.');
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          // Enrich with team names
          const enriched = await Promise.all((data as FriendlyMatchRecord[]).map(async (m) => {
            let homeName = 'Bilinmeyen';
            let awayName = 'Bilinmeyen';

            try {
              if (m.home_team_id === profile.id) {
                homeName = profile.team_name || 'Benim Takımım';
              } else {
                const { data: hp } = await supabase
                  .from('profiles')
                  .select('team_name')
                  .eq('id', m.home_team_id)
                  .maybeSingle();
                if (hp) homeName = hp.team_name || homeName;
              }

              if (m.away_team_id === profile.id) {
                awayName = profile.team_name || 'Benim Takımım';
              } else {
                const { data: ap } = await supabase
                  .from('profiles')
                  .select('team_name')
                  .eq('id', m.away_team_id)
                  .maybeSingle();
                if (ap) awayName = ap.team_name || awayName;
              }
            } catch {
              // Use fallback
            }

            return { ...m, home_team_name: homeName, away_team_name: awayName };
          }));

          setMatches(enriched);
        }
      } catch (err) {
        console.error('[FriendlyHistory] Exception:', err);
        setError('Bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ── Helpers ──
  const getMatchResult = (m: FriendlyMatchRecord): 'W' | 'D' | 'L' | null => {
    if (!profileId) return null;
    const isHome = m.home_team_id === profileId;
    const myScore = isHome ? m.home_score : m.away_score;
    const oppScore = isHome ? m.away_score : m.home_score;
    if (myScore > oppScore) return 'W';
    if (myScore === oppScore) return 'D';
    return 'L';
  };

  const filteredMatches = matches.filter(m => {
    const result = getMatchResult(m);
    if (resultFilter === 'all') return true;
    if (resultFilter === 'wins') return result === 'W';
    if (resultFilter === 'draws') return result === 'D';
    if (resultFilter === 'losses') return result === 'L';
    return true;
  });

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.played_at).getTime() - new Date(a.played_at).getTime();
    // Sort by total goals
    const totalA = a.home_score + a.away_score;
    const totalB = b.home_score + b.away_score;
    return totalB - totalA;
  });

  // Stats
  const totalWins = matches.filter(m => getMatchResult(m) === 'W').length;
  const totalDraws = matches.filter(m => getMatchResult(m) === 'D').length;
  const totalLosses = matches.filter(m => getMatchResult(m) === 'L').length;
  const totalGoals = matches.reduce((acc, m) => {
    const isHome = m.home_team_id === profileId;
    return acc + (isHome ? m.home_score : m.away_score);
  }, 0);
  const totalConceded = matches.reduce((acc, m) => {
    const isHome = m.home_team_id === profileId;
    return acc + (isHome ? m.away_score : m.home_score);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-500/40 rounded-full animate-spin" />
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Maçlar Yükleniyor</p>
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
      {/* Header */}
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
            <Swords className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-black uppercase tracking-wider text-white/70">Geçmiş Hazırlık Maçları</span>
          </div>
          <div className="flex items-center gap-2 text-white/20">
            <Trophy size={14} />
            <span className="text-[10px] font-semibold">{matches.length} maç</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="grid grid-cols-5 gap-2 mb-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
            <p className="text-[8px] text-white/30 font-black uppercase tracking-wider">Maç</p>
            <p className="text-lg font-black text-white">{matches.length}</p>
          </div>
          <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-3 text-center">
            <p className="text-[8px] text-emerald-400/60 font-black uppercase tracking-wider">Galibiyet</p>
            <p className="text-lg font-black text-emerald-400">{totalWins}</p>
          </div>
          <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-3 text-center">
            <p className="text-[8px] text-amber-400/60 font-black uppercase tracking-wider">Beraberlik</p>
            <p className="text-lg font-black text-amber-400">{totalDraws}</p>
          </div>
          <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl p-3 text-center">
            <p className="text-[8px] text-red-400/60 font-black uppercase tracking-wider">Mağlubiyet</p>
            <p className="text-lg font-black text-red-400">{totalLosses}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
            <p className="text-[8px] text-white/30 font-black uppercase tracking-wider">Averaj</p>
            <p className={`text-lg font-black ${totalGoals - totalConceded >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalGoals - totalConceded >= 0 ? '+' : ''}{totalGoals - totalConceded}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            {([
              { key: 'all', label: 'Tümü' },
              { key: 'wins', label: 'G' },
              { key: 'draws', label: 'B' },
              { key: 'losses', label: 'M' },
            ] as { key: ResultFilter; label: string }[]).map(f => (
              <button
                key={f.key}
                onClick={() => setResultFilter(f.key)}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  resultFilter === f.key
                    ? 'bg-amber-500/15 text-amber-300'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortBy(sortBy === 'date' ? 'score' : 'date')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] rounded-xl border border-white/[0.06] text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white/50 transition-all"
          >
            <Filter size={10} />
            {sortBy === 'date' ? 'Tarih' : 'Gol'}
          </button>
        </div>
      </div>

      {/* Match List */}
      <div className="max-w-4xl mx-auto px-4 pb-8 space-y-2">
        <AnimatePresence mode="popLayout">
          {sortedMatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Swords className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-xs text-white/25 mb-1">
                {resultFilter === 'all' ? 'Henüz hazırlık maçı oynamadınız' : 'Bu filtreye uygun maç bulunamadı'}
              </p>
              <p className="text-[10px] text-white/15">
                Ana menüden &quot;Hazırlık Maçı Teklifi Ver&quot; butonu ile sıraya girin
              </p>
            </motion.div>
          ) : (
            sortedMatches.map((m, idx) => {
              const result = getMatchResult(m);
              const isHome = m.home_team_id === profileId;
              const homeName = m.home_team_name || (isHome ? teamName : 'Rakip');
              const awayName = m.away_team_name || (!isHome ? teamName : 'Rakip');

              return (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className={`rounded-xl border overflow-hidden transition-all hover:bg-white/[0.02] ${
                    result === 'W' ? 'border-emerald-500/20 bg-emerald-500/[0.02]' :
                    result === 'L' ? 'border-red-500/15 bg-red-500/[0.02]' :
                    'border-white/[0.06] bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-center gap-4 px-4 py-3">
                    {/* Date & Result */}
                    <div className="flex flex-col items-center gap-1 w-14 shrink-0">
                      <span className="text-[9px] text-white/30 font-bold">
                        {new Date(m.played_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </span>
                      {result && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          result === 'W' ? 'bg-emerald-500/20 text-emerald-400' :
                          result === 'D' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {result === 'W' ? 'G' : result === 'D' ? 'B' : 'M'}
                        </span>
                      )}
                    </div>

                    {/* Teams */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[11px] font-bold truncate ${isHome ? 'text-amber-300' : 'text-white/50'}`}>
                          {homeName}
                        </span>
                        <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                          isHome ? 'bg-emerald-500/15 text-emerald-400' : 'bg-sky-500/15 text-sky-400'
                        }`}>EV</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold truncate ${!isHome ? 'text-amber-300' : 'text-white/50'}`}>
                          {awayName}
                        </span>
                        <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                          !isHome ? 'bg-emerald-500/15 text-emerald-400' : 'bg-sky-500/15 text-sky-400'
                        }`}>DEP</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/10 shrink-0">
                      <span className={`text-base font-black font-mono ${
                        m.home_score > m.away_score
                          ? (isHome ? 'text-emerald-400' : 'text-white/60')
                          : 'text-white/60'
                      }`}>{m.home_score}</span>
                      <span className="text-white/20 text-xs">-</span>
                      <span className={`text-base font-black font-mono ${
                        m.away_score > m.home_score
                          ? (!isHome ? 'text-emerald-400' : 'text-white/60')
                          : 'text-white/60'
                      }`}>{m.away_score}</span>
                    </div>

                    {/* Replay Button */}
                    <button
                      onClick={() => router.push(`/match/${m.id}`)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-all shrink-0"
                    >
                      <Eye size={10} />
                      Tekrar İzle
                    </button>
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
