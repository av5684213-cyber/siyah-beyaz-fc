'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Users, 
  Settings, 
  Zap,
  Swords, 
  Dumbbell,
  TrendingUp,
  Wallet,
  Target,
  CalendarDays,
  RefreshCw,
  Building2,
  Activity,
  ArrowRightLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flame,
  HeartPulse,
  Heart,
  Bell,
  Info,
} from 'lucide-react';
import type { Player } from '@/lib/fm/types';

import { toTitleCase } from '@/lib/fm/ui-helpers';
import { useFM } from '@/lib/fm/GameContext';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import LiveMatchAlert from '@/components/fm/LiveMatchAlert';
import AgentMessages from '@/components/fm/AgentMessages';
import LeagueInfoCard from '@/components/fm/LeagueInfoCard';
import { calculateAttendance, calculateStadiumCapacity, calculateMatchRevenueLegacy } from '@/lib/fm/financialModel';

interface TeamAvgStats {
  speed: number;
  power: number;
  passing: number;
  shooting: number;
  rating: number;
  defending: number;
}

interface TransferOffer {
  id: string;
  fromTeam: string;
  playerName: string;
  playerPosition: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
}

interface DashboardTabProps {
  squad: Player[];
  teamAvgStats: TeamAvgStats;
  profile: {
    team_name: string;
    league_name?: string;
    manager_name?: string;
    money: number;
    current_day: number;
    id: string;
    philosophy?: string;
    primary_color?: string;
    secondary_color?: string;
  } | null;
  retiredLog?: { retired: Player[], talents: Player[] } | null;
  onClearRetiredLog?: () => void;
  onNextSeason?: () => void;
  onNavigate: (tab: string) => void;
  onRunTraining: (type: 'morning' | 'afternoon') => void;
  isAdmin?: boolean;
  transferOffers?: TransferOffer[];
}

// ═══════════════════════════════════════════════════════════════
// Training Report Types
// ═══════════════════════════════════════════════════════════════

interface TrainingPlayerResult {
  player_id: string;
  player_name: string;
  position: string;
  stats_gained: Record<string, number>;
  cond_change: number;
  morale_change: number;
}

interface TrainingRecord {
  id: string;
  profile_id: string;
  team_name: string;
  session_type: string;
  training_date: string;
  training_time: string;
  player_results: TrainingPlayerResult[] | string;
  avg_cond_change: number;
  avg_morale_change: number;
  total_players: number;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════
// Stat adı Türkçe çevirisi
// ═══════════════════════════════════════════════════════════════

const STAT_LABELS: Record<string, string> = {
  speed: 'Hız', power: 'Güç', passing: 'Pas', shooting: 'Şut',
  defending: 'Savunma', vision: 'Algı', control: 'Top',
  heading: 'Kafa', goalkeeping: 'Kalecilik', stamina: 'Dayanıklılık',
  finishing: 'Bitiricilik', dribbling: 'Dribling', tackling: 'Top Kapma',
  crossing: 'Orta', marking: 'Markaj', technique: 'Teknik',
  longShots: 'Uzun Şut', agility: 'Çeviklik', strength: 'Kuvvet',
  acceleration: 'Hızlanma', jumping: 'Zıplama', composure: 'Soğukkanlılık',
  rating: 'OVR', cond: 'Kondisyon', morale: 'Moral',
};

function statLabel(key: string): string {
  return STAT_LABELS[key] || key;
}

// ═══════════════════════════════════════════════════════════════
// Alt bileşen: Antrenman Raporu Kartı
// ═══════════════════════════════════════════════════════════════

function TrainingReportCard({ trainings }: { trainings: TrainingRecord[] }) {
  if (trainings.length === 0) {
    return (
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-3 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
          <div className="p-1.5 sm:p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Dumbbell size={14} className="text-emerald-400" />
          </div>
          <h3 className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-white/30">SON ANTRENMAN RAPORU</h3>
        </div>
        <div className="flex items-center gap-2 py-2 sm:py-4 text-white/20 text-[10px] sm:text-xs">
          <Clock size={14} className="opacity-50 shrink-0" />
          <span>Bugünkü antrenman henüz yapılmadı. Antrenman yaptığınızda form ve moral etkileri otomatik uygulanır; yapmazsanız form ve moral düşer.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-3 sm:p-6 space-y-2 sm:space-y-4">
      <div className="flex items-center gap-2 sm:gap-3 mb-1">
        <div className="p-1.5 sm:p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <Dumbbell size={14} className="text-emerald-400" />
        </div>
        <h3 className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-white/30">SON ANTRENMAN RAPORU</h3>
      </div>

      {trainings.slice(0, 2).map((training) => {
        const playerResults: TrainingPlayerResult[] =
          typeof training.player_results === 'string'
            ? (() => { try { return JSON.parse(training.player_results); } catch { return []; } })()
            : training.player_results || [];

        const sessionLabel = training.session_type === 'morning' ? 'Sabah (15:00)' : 'Akşam (21:00)';
        const formattedDate = (() => {
          try {
            return new Date(training.training_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
          } catch { return training.training_date; }
        })();

        // En çok gelişen oyuncuları bul (toplam stat artışına göre)
        const topPlayers = [...playerResults]
          .map(p => ({
            ...p,
            totalGain: Object.values(p.stats_gained || {}).reduce((s: number, v: number) => s + v, 0),
          }))
          .sort((a, b) => b.totalGain - a.totalGain)
          .slice(0, 5);

        const otherCount = Math.max(0, playerResults.length - 5);

        return (
          <div key={training.id} className="bg-black/30 border border-white/[0.04] rounded-xl p-2 sm:p-4 space-y-2 sm:space-y-3">
            {/* Başlık */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Clock size={12} className="text-white/25 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-white/60 truncate">{sessionLabel}</span>
              </div>
              <span className="text-[9px] text-white/20 font-semibold shrink-0">{formattedDate}</span>
            </div>

            {/* Oyuncu gelişimleri */}
            {topPlayers.length > 0 ? (
              <div className="space-y-2">
                {topPlayers.map((p, idx) => {
                  const gains = Object.entries(p.stats_gained || {})
                    .filter(([, v]) => v > 0)
                    .slice(0, 3);

                  return (
                    <div key={p.player_id || idx} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center shrink-0">
                          <span className="text-[7px] font-black text-white/30">{(p as any).specificPosition || (p as any).specific_position || p.position?.slice(0, 2) || '?'}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-white/70 truncate">
                          {toTitleCase(p.player_name)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {gains.map(([stat, val]) => (
                          <span key={stat} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                            +{val.toFixed(1)} {statLabel(stat)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {otherCount > 0 && (
                  <p className="text-[9px] text-white/15 pl-7">ve diğer {otherCount} oyuncu</p>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-white/15 italic">Kayıtlı gelişim verisi yok</p>
            )}

            {/* Kondisyon ve Moral özeti */}
            <div className="flex items-center gap-4 pt-2 border-t border-white/[0.03]">
              <div className="flex items-center gap-1.5">
                <Flame size={10} className="text-orange-400/50" />
                <span className="text-[9px] font-bold text-white/25">Kondisyon:</span>
                <span className={`text-[9px] font-bold ${(training.avg_cond_change || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(training.avg_cond_change || 0) >= 0 ? '+' : ''}{Number(training.avg_cond_change || 0).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <HeartPulse size={10} className="text-pink-400/50" />
                <span className="text-[9px] font-bold text-white/25">Moral:</span>
                <span className={`text-[9px] font-bold ${(training.avg_morale_change || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(training.avg_morale_change || 0) >= 0 ? '+' : ''}{Number(training.avg_morale_change || 0).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <Users size={10} className="text-white/15" />
                <span className="text-[9px] text-white/20">{training.total_players || playerResults.length} oyuncu</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Alt bileşen: Sonraki Maç Kartı
// ═══════════════════════════════════════════════════════════════

interface NextMatchData {
  id: string;
  tur: number;
  match_date: string;
  match_time: string;
  opponent: string;
  is_home: boolean;
  status?: string; // 'scheduled' | 'live' | 'finished'
}

function NextMatchCard({ profileId, onNavigate }: { profileId: string; onNavigate: (tab: string) => void }) {
  const [nextMatch, setNextMatch] = useState<NextMatchData | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [fetchError, setFetchError] = useState(false);
  const { profile: ctxProfile } = useFM();

  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    (async () => {
      if (!cancelled) setFetchError(false);
      try {
        const res = await fetch(`/api/fixture/${profileId}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.nextMatch) {
            setNextMatch(data.nextMatch);
          }
        } else if (!res.ok && !cancelled) {
          setFetchError(true);
        }
      } catch (err) {
        console.error('[NextMatchCard] Error:', err);
        if (!cancelled) setFetchError(true);
      }
    })();
    return () => { cancelled = true; };
  }, [profileId]);

  useEffect(() => {
    if (!nextMatch?.match_date || !nextMatch?.match_time) return;
    const tick = () => {
      try {
        const [h, m] = (nextMatch.match_time || '12:00').split(':').map(Number);
        const target = new Date(`${nextMatch.match_date}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00+03:00`);
        const diff = target.getTime() - Date.now();
        if (diff <= 0) { setCountdown('BAŞLIYOR!'); return; }
        const hours   = Math.floor(diff / 3_600_000);
        const minutes = Math.floor((diff % 3_600_000) / 60_000);
        const seconds = Math.floor((diff % 60_000) / 1000);
        setCountdown(`${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`);
      } catch { setCountdown(''); }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextMatch?.match_date, nextMatch?.match_time]);

  // ── Attendance & Revenue Preview ──
  const attendancePreview = useMemo(() => {
    if (!nextMatch?.is_home || !ctxProfile) return null;
    try {
      const stadiumLevel = (ctxProfile.stadium_upgrades || {})['capacity'] || 0;
      const ticketPrice = ctxProfile.ticket_price ?? 35;
      const capacity = calculateStadiumCapacity(stadiumLevel);
      const attendance = calculateAttendance(stadiumLevel, 10, 18, ticketPrice);
      const revenue = calculateMatchRevenueLegacy(stadiumLevel, 10, 18, ticketPrice);
      const fillRate = capacity > 0 ? Math.round((attendance / capacity) * 100) : 0;
      return { capacity, attendance, revenue, fillRate, ticketPrice };
    } catch {
      return null;
    }
  }, [nextMatch?.is_home, ctxProfile]);

  if (!nextMatch) {
    if (fetchError) {
      return (
        <div className="bg-red-500/[0.04] border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg border bg-red-500/10 border-red-500/20">
              <Swords size={14} className="text-red-400" />
            </div>
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-red-400/70">
              SONRAKİ MAÇ
            </h3>
          </div>
          <p className="text-[11px] text-red-300/60 mt-1">Maç bilgisi yüklenemedi. Lütfen sayfayı yenileyin.</p>
        </div>
      );
    }
    return null;
  }

  const formattedDate = (() => {
    try {
      return new Date(nextMatch.match_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    } catch {
      return nextMatch.match_date;
    }
  })();

  // Slot bilgisi — 12:00 → ÖĞLE, 18:00 → AKŞAM
  const slotLabel = (() => {
    const t = nextMatch.match_time || '12:00';
    const [h] = t.split(':').map(Number);
    if (h === 12) return 'ÖĞLE SLOTU';
    if (h === 18) return 'AKŞAM SLOTU';
    return '';
  })();

  const isLive = nextMatch.status === 'live';

  return (
    <div className={`bg-gradient-to-br ${isLive ? 'from-red-500/[0.08] to-transparent border-red-500/30' : 'from-amber-500/[0.06] to-transparent border-amber-500/15'} border rounded-2xl p-3 sm:p-5`}>
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className={`p-2 rounded-lg border ${isLive ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
          <Swords size={14} className={isLive ? 'text-red-400' : 'text-amber-400'} />
        </div>
        <h3 className={`text-[10px] uppercase font-bold tracking-widest ${isLive ? 'text-red-400' : 'text-white/30'}`}>
          {isLive ? '● CANLI MAÇ' : 'SONRAKİ MAÇ'}
        </h3>
        {slotLabel && (
          <span className={`ml-auto text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
            isLive ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/10 text-amber-400/80'
          }`}>
            {slotLabel}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
              nextMatch.is_home ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
            }`}>
              {nextMatch.is_home ? 'EV SAHİBİ' : 'DEPLASMAN'}
            </span>
            <span className="text-[9px] text-white/20">{nextMatch.tur}. Hafta</span>
            {isLive && (
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                CANLI
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-white/80 truncate">{nextMatch.opponent}</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <CalendarDays size={10} className="text-white/20 shrink-0" />
            <span className="text-[10px] text-white/30 truncate">{formattedDate} • {nextMatch.match_time || '--:--'}</span>
          </div>
          {countdown && !isLive && (
            <p className={`text-sm font-black tabular-nums mt-1 ${(
              countdown === 'BAŞLIYOR!' ? 'text-red-400 animate-pulse' : 'text-amber-400'
            )}`}>
              ⏱ {countdown}
            </p>
          )}
        </div>
        {nextMatch.status === 'live' || nextMatch.status === 'finished' ? (
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.location.href = `/match/${nextMatch.id}`;
            }}
            className={`min-h-[44px] px-3 sm:px-4 py-2 ${isLive ? 'bg-red-500/20 hover:bg-red-500/30 border-red-500/40 text-red-300' : 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300'} border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shrink-0 ${isLive ? 'animate-pulse' : ''}`}
          >
            {nextMatch.status === 'live' ? '● Canlı İzle' : 'Maçı İzle'}
          </button>
        ) : (
          <span className="px-3 sm:px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/20 shrink-0">
            Planlanmış
          </span>
        )}
      </div>

      {/* ── Attendance & Revenue Preview (Ev sahibi maçlar için) ── */}
      {attendancePreview && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-amber-500/10">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Wallet size={12} className="text-emerald-400/60 shrink-0" />
            <span className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest">Bilet Geliri Tahmini</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 sm:p-3 text-center">
              <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest">Kapasite</span>
              <p className="text-xs sm:text-sm font-black font-mono text-white/60 mt-1">{attendancePreview.capacity.toLocaleString('tr-TR')}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 sm:p-3 text-center">
              <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest">Tahmini Seyirci</span>
              <p className="text-xs sm:text-sm font-black font-mono text-emerald-400 mt-1">{attendancePreview.attendance.toLocaleString('tr-TR')}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 sm:p-3 text-center">
              <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest">Doluluk</span>
              <p className="text-xs sm:text-sm font-black font-mono text-amber-400 mt-1">%{attendancePreview.fillRate}</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2 sm:p-3 text-center">
              <span className="text-[8px] text-emerald-400/40 uppercase font-bold tracking-widest">Bilet Geliri</span>
              <p className="text-xs sm:text-sm font-black font-mono text-emerald-400 mt-1">{attendancePreview.revenue.toLocaleString('tr-TR')} €</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-[7px] text-white/15 uppercase tracking-widest">Bilet: {attendancePreview.ticketPrice} €</span>
            <span className="text-[7px] text-white/10">•</span>
            <span className="text-[7px] text-white/15 uppercase tracking-widest">Yiyecek/İçecek: 15 €/kişi</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardTab({ 
  squad, 
  teamAvgStats, 
  profile, 
  retiredLog,
  onClearRetiredLog,
  onNextSeason,
  onNavigate, 
  onRunTraining, 
  isAdmin,
  transferOffers
}: DashboardTabProps) {
  const { setProfile, setSquad } = useFM();
  const router = useRouter();

  // ═══ Son Antrenman Raporu State ═══
  const [recentTrainings, setRecentTrainings] = useState<TrainingRecord[]>([]);

  // ═══ Oynanan Maç Sayısı State ═══
  const [matchesPlayed, setMatchesPlayed] = useState(0);

  // ═══ Kadro Sağlık Özeti ═══
  const squadHealth = useMemo(() => {
    if (!squad || squad.length === 0) return null;
    const fit      = squad.filter(p => !p.is_injured && (p.cond ?? 100) >= 70).length;
    const tired    = squad.filter(p => !p.is_injured && (p.cond ?? 100) < 70 && (p.cond ?? 100) >= 40).length;
    const injured  = squad.filter(p => p.is_injured).length;
    const lowMoral = squad.filter(p => (p.morale ?? 60) < 40).length;
    return { fit, tired, injured, lowMoral, total: squad.length };
  }, [squad]);

  // ═══ Son Maç Sonucu ═══
  const [lastResult, setLastResult] = useState<{
    score: string; result: 'W'|'D'|'L'; opponent: string; date: string;
  } | null>(null);

  useEffect(() => {
    if (!profile?.id) return;
    const supabase = getSupabase();
    if (!supabase) return;
    (async () => {
      try {
        const { data: teamRow } = await supabase.from('league_teams')
          .select('id').eq('profile_id', profile.id).maybeSingle();
        if (!teamRow) return;
        const { data: fixtures } = await supabase.from('fixtures')
          .select('home_team_id, away_team_id, home_score, away_score, match_date')
          .eq('status', 'completed')
          .or(`home_team_id.eq.${teamRow.id},away_team_id.eq.${teamRow.id}`)
          .order('match_date', { ascending: false })
          .limit(1);
        if (!fixtures || fixtures.length === 0) return;
        const f = fixtures[0];
        const isHome = f.home_team_id === teamRow.id;
        const my = isHome ? f.home_score : f.away_score;
        const opp = isHome ? f.away_score : f.home_score;
        const result: 'W'|'D'|'L' = my > opp ? 'W' : my === opp ? 'D' : 'L';
        setLastResult({ score: `${my}-${opp}`, result, opponent: 'Son Maç', date: f.match_date });
      } catch { /* sessizce geç */ }
    })();
  }, [profile?.id]);

  // Antrenman verilerini yükle
  const loadTrainings = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const res = await fetch(`/api/trainings?profileId=${profile.id}&limit=2`);
      if (res.ok) {
        const data = await res.json();
        if (data.trainings) {
          setRecentTrainings(data.trainings);
        }
      }
    } catch (err) {
      console.error('[DashboardTab] Training load error:', err);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadTrainings();
  }, [loadTrainings]);

  // Kullanıcının oynadığı maç sayısını çek (sezon bitiş kriteri için)
  useEffect(() => {
    if (!profile?.id || !isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const fetchMatchesPlayed = async () => {
      try {
        // Kullanıcının ligdeki takım ID'sini bul
        const { data: team } = await supabase
          .from('league_teams')
          .select('id')
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (!team?.id) return;

        // Bu sezon oynadığı maç sayısını al
        const { data: standing } = await supabase
          .from('league_standings')
          .select('played')
          .eq('team_id', team.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setMatchesPlayed(standing?.played || 0);
      } catch { /* sessizce geç */ }
    };

    fetchMatchesPlayed();
  }, [profile?.id]);

  return (
    <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2 sm:space-y-3 lg:space-y-4">

       {/* ── STATS BAR (4 kolon, tek satır — mobil+desktop) ── */}
       <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
         {[
           { label: 'Kadro', value: squad.length, icon: Users, sub: 'oyuncu' },
           { label: 'Takım', value: teamAvgStats.rating, icon: TrendingUp, sub: 'OVR' },
           { label: 'Bütçe', value: `${((profile?.money || 0) / 1000000).toFixed(1)}M`, icon: Wallet, sub: '€' },
           { label: 'Gün', value: profile?.current_day || 1, icon: CalendarDays, sub: '/238' }
         ].map((stat, i) => (
           <div key={i} className="fm-card p-1.5 sm:p-3 flex items-center gap-1.5 sm:gap-2 relative overflow-hidden min-w-0">
             <div className="p-1 sm:p-1.5 bg-white/5 rounded-md border border-white/5 shrink-0">
               <stat.icon size={12} className="text-white/60" />
             </div>
             <div className="min-w-0">
               <p className="text-[7px] sm:text-[8px] uppercase font-bold tracking-widest text-white/30 truncate">{stat.label}</p>
               <div className="flex items-baseline gap-1">
                 <p className="text-sm sm:text-lg font-black font-mono tracking-tighter text-white leading-none">
                   {typeof stat.value === 'number' && isNaN(stat.value) ? '0' : stat.value}
                 </p>
                 <span className="text-[7px] uppercase font-bold text-white/20 tracking-widest hidden sm:inline">{stat.sub}</span>
               </div>
             </div>
           </div>
         ))}
       </div>

       {/* ── HERO + NEXT MATCH (yan yana, kompakt) ── */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3">
         {/* Hero — mobilde kompakt, desktop'ta normal */}
         <div
           className="lg:col-span-2 relative overflow-hidden p-3 sm:p-5 rounded-2xl h-20 sm:h-40 flex flex-col justify-end group transition-all shadow-lg"
           style={{ backgroundColor: profile?.primary_color || '#ffffff', color: profile?.secondary_color || '#000000' }}
         >
           <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white via-white/50 to-transparent" />
           <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5 sm:gap-2">
             <span className="hidden sm:inline-block text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest border border-current uppercase">
               {profile?.league_name?.toUpperCase() || 'SÜPER LİG'}
             </span>
             <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center rotate-3" style={{ backgroundColor: profile?.secondary_color || '#000000', color: profile?.primary_color || '#ffffff' }}>
               <Trophy size={12} className="sm:hidden" />
               <Trophy size={14} className="hidden sm:block" />
             </div>
           </div>
           <div className="relative z-10 min-w-0">
             <h2 className="text-lg sm:text-3xl font-black italic uppercase tracking-tighter leading-[0.85] mb-0.5 sm:mb-1 truncate">
               {profile?.team_name?.toUpperCase() || 'TAKIM'}
             </h2>
             <p className="text-[7px] sm:text-[9px] uppercase font-bold tracking-[0.3em] opacity-60 truncate">
               {profile?.manager_name ? `${profile.manager_name.toUpperCase()} DÖNEMİ` : 'MENAJER'}
             </p>
             <button
               onClick={() => onNavigate('tactics')}
               className="hidden sm:mt-2 sm:block bg-current px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest filter invert hover:scale-105 active:scale-95 transition-all"
               style={{ color: profile?.primary_color || '#ffffff' }}
             >
               KADROYU YÖNET →
             </button>
           </div>
         </div>

         {/* Next Match — kompakt */}
         <NextMatchCard profileId={profile?.id || ''} onNavigate={onNavigate} />
       </div>

       {/* ── QUICK ACTIONS (mobilde 3'lü, daha geniş dokunma alanı) ── */}
       <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5 sm:gap-2">
         {[
           { id: 'matchday', label: 'Maç', icon: Swords, color: 'hover:bg-besiktas-red', action: () => onNavigate('matchday') },
           { id: 'stadium', label: 'Yerleşke', icon: Building2, color: 'hover:bg-zinc-800', action: () => onNavigate('stadium') },
           { id: 'league', label: 'Puan', icon: Trophy, color: 'hover:bg-zinc-800', action: () => onNavigate('league') },
           { id: 'fixtures', label: 'Fikstür', icon: CalendarDays, color: 'hover:bg-zinc-800', action: () => onNavigate('fixtures') },
           { id: 'training', label: 'Antrenman', icon: Dumbbell, color: 'hover:bg-zinc-800', action: () => onRunTraining('morning') },
           { id: 'tactics', label: 'Taktik', icon: Settings, color: 'hover:bg-zinc-800', action: () => onNavigate('tactics') },
          ...( matchesPlayed >= 34 ? [{
            id: 'evolve',
            label: 'Yeni Sezon',
            icon: CalendarDays,
            color: 'hover:bg-amber-600',
            action: onNextSeason || (() => {}),
          }] : matchesPlayed > 0 ? [{
            id: 'evolve',
            label: `Sezon (${34 - matchesPlayed})`,
            icon: CalendarDays,
            color: 'hover:bg-zinc-800 opacity-40',
            action: () => { toast('Sezon bitince (34 maç) açılacak', { icon: '⏳' }); },
            disabled: true,
            disabledReason: 'Bu özellik sezon bitince (34. maç) açılacak',
          }] : []),
         ].map((btn) => {
           const isDisabled = (btn as any).disabled;
           return (
           <button
             key={btn.id}
             onClick={isDisabled ? undefined : btn.action}
             disabled={isDisabled}
             title={isDisabled ? (btn as any).disabledReason : ''}
             className={`fm-card p-2 sm:p-2.5 min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all group border-b-2 border-b-transparent ${btn.color} ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 hover:border-b-white'}`}
           >
             <div className="p-1 sm:p-1.5 bg-white/5 rounded-lg group-hover:bg-white group-hover:text-black transition-all">
               <btn.icon size={14} />
             </div>
             <span className="text-[8px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors text-center leading-tight">{btn.label}</span>
           </button>
           );
         })}
       </div>

       {/* ═══════════════════════════════════════════════════════ */}
       {/* BİLDİRİM MERKEZİ — küçük pencereler halinde                */}
       {/* ═══════════════════════════════════════════════════════ */}
       <div>
         <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="text-[9px] uppercase font-black tracking-[0.3em] text-white/30 flex items-center gap-2">
              <Bell size={11} className="text-white/40 shrink-0" />
              BİLDİRİM MERKEZİ
            </h3>
            <div className="h-px flex-1 bg-white/5 mx-4" />
         </div>

         <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2">

           {/* 1. Canlı Maç Uyarısı */}
           {profile?.id && profile?.team_name && (
             <div className="rounded-xl overflow-hidden col-span-2 lg:col-span-1">
               <LiveMatchAlert profileId={profile.id} teamName={profile.team_name} />
             </div>
           )}

           {/* 2. Kadro Sağlık Özeti — kompakt pencere */}
           {squadHealth && (
             <div className="bg-white/[0.03] border border-white/8 rounded-xl p-2 sm:p-3 col-span-2 lg:col-span-1">
               <div className="flex items-center gap-2 mb-2">
                 <Heart size={11} className="text-rose-400/70 shrink-0" />
                 <p className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Kadro Durumu</p>
               </div>
               <div className="flex items-center justify-around">
                 <div className="text-center">
                   <p className="text-base font-black text-emerald-400 leading-none">{squadHealth.fit}</p>
                   <p className="text-[7px] text-white/30 mt-0.5">Fit</p>
                 </div>
                 <div className="w-px h-6 bg-white/5" />
                 <div className="text-center">
                   <p className="text-base font-black text-amber-400 leading-none">{squadHealth.tired}</p>
                   <p className="text-[7px] text-white/30 mt-0.5">Yorgun</p>
                 </div>
                 <div className="w-px h-6 bg-white/5" />
                 <div className="text-center">
                   <p className="text-base font-black text-red-400 leading-none">{squadHealth.injured}</p>
                   <p className="text-[7px] text-white/30 mt-0.5">Sakat</p>
                 </div>
                 {squadHealth.lowMoral > 0 && (
                   <>
                     <div className="w-px h-6 bg-white/5" />
                     <div className="text-center">
                       <p className="text-base font-black text-purple-400 leading-none">{squadHealth.lowMoral}</p>
                       <p className="text-[7px] text-white/30 mt-0.5">Moralsiz</p>
                     </div>
                   </>
                 )}
               </div>
             </div>
           )}

           {/* 3. Son Maç Sonucu — kompakt pencere */}
           {lastResult && (
             <div className={
               lastResult.result === 'W' ? 'border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-2 sm:p-3' :
               lastResult.result === 'D' ? 'border border-blue-500/20 bg-blue-500/5 rounded-xl p-2 sm:p-3' :
               'border border-red-500/20 bg-red-500/5 rounded-xl p-2 sm:p-3'
             }>
               <div className="flex items-center justify-between gap-2">
                 <div className="min-w-0">
                   <p className="text-[7px] uppercase tracking-widest text-white/30 font-bold">Son Maç</p>
                   <p className={
                     lastResult.result === 'W' ? 'text-[10px] font-black text-emerald-400 mt-0.5 truncate' :
                     lastResult.result === 'D' ? 'text-[10px] font-black text-blue-400 mt-0.5 truncate' :
                     'text-[10px] font-black text-red-400 mt-0.5 truncate'
                   }>
                     {lastResult.result === 'W' ? 'GALİBİYET' : lastResult.result === 'D' ? 'BERABERLİK' : 'MAĞLUBİYET'}
                   </p>
                 </div>
                 <p className={
                   lastResult.result === 'W' ? 'text-lg sm:text-xl font-black tabular-nums text-emerald-400 shrink-0' :
                   lastResult.result === 'D' ? 'text-lg sm:text-xl font-black tabular-nums text-blue-400 shrink-0' :
                   'text-lg sm:text-xl font-black tabular-nums text-red-400 shrink-0'
                 }>{lastResult.score}</p>
               </div>
             </div>
           )}

           {/* 4. Lig Durumu Kartı */}
           {profile?.id && (
             <div className="rounded-xl overflow-hidden">
               <LeagueInfoCard profileId={profile.id} />
             </div>
           )}

           {/* 5. Transfer Teklifleri — kompakt pencere */}
           <div className="bg-zinc-900 border border-white/5 rounded-xl p-2 sm:p-3">
             <div className="flex items-center gap-2 mb-2">
               <div className="p-1 bg-white/5 rounded border border-white/5 shrink-0">
                 <ArrowRightLeft size={10} className="text-white/60" />
               </div>
               <h4 className="text-[8px] uppercase font-bold tracking-widest text-white/30 truncate">Transfer Teklifleri</h4>
               {transferOffers && transferOffers.length > 0 && (
                 <span className="ml-auto text-[8px] font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                   {transferOffers.length}
                 </span>
               )}
             </div>
             {!transferOffers || transferOffers.length === 0 ? (
               <div className="flex items-center gap-2 py-2 text-white/20 text-[10px]">
                 <Clock size={11} className="opacity-50 shrink-0" />
                 <span>Gelen teklif yok.</span>
               </div>
             ) : (
               <div className="space-y-1.5 max-h-32 overflow-y-auto">
                 {transferOffers.slice(0, 5).map((offer) => {
                   const statusConfig = {
                     pending: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'Beklemede', icon: <Clock size={8} /> },
                     accepted: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Kabul', icon: <CheckCircle size={8} /> },
                     rejected: { color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'Red', icon: <XCircle size={8} /> },
                   };
                   const sc = statusConfig[offer.status];
                   return (
                     <div key={offer.id} className="flex items-center justify-between gap-2 p-1.5 bg-black/30 border border-white/5 rounded-lg">
                       <div className="min-w-0 flex-1">
                         <div className="text-[9px] font-bold text-white/80 truncate">{toTitleCase(offer.playerName)}</div>
                         <div className="text-[7px] text-white/25 font-bold uppercase tracking-wider truncate">{offer.playerPosition} • {offer.date}</div>
                       </div>
                       <div className="flex items-center gap-1.5 shrink-0">
                         <span className="text-[10px] font-black text-emerald-400">{(offer.amount / 1000000).toFixed(1)}M</span>
                         <span className={`inline-flex items-center gap-0.5 px-1 py-0.5 text-[7px] font-black uppercase tracking-wider border rounded-full ${sc.color}`}>
                           {sc.icon} {sc.label}
                         </span>
                       </div>
                     </div>
                   );
                 })}
                 {transferOffers.length > 5 && (
                   <p className="text-[8px] text-white/30 text-center pt-1">+{transferOffers.length - 5} teklif daha</p>
                 )}
               </div>
             )}
           </div>

           {/* 6. Antrenman Raporu — kompakt pencere */}
           <div className="rounded-xl overflow-hidden col-span-2 lg:col-span-1">
             <TrainingReportCard trainings={recentTrainings} />
           </div>

           {/* 7. Ajan Mesajları — kompakt pencere */}
           {profile?.id && (
             <div className="rounded-xl overflow-hidden col-span-2 lg:col-span-1">
               <AgentMessages userId={profile.id} onUpdate={() => {}} />
             </div>
           )}

           {/* 8. Oyun Rehberi — yeni başlayanlar için */}
           {(profile?.current_day || 0) < 14 && (
             <div className="bg-amber-500/[0.06] border border-amber-500/15 rounded-xl p-2 sm:p-3 col-span-2 lg:col-span-1">
               <div className="flex items-center gap-2 mb-2">
                 <Info size={10} className="text-amber-400 shrink-0" />
                 <p className="text-[8px] font-black uppercase tracking-widest text-amber-400/60">Oyun Rehberi</p>
               </div>
               <div className="space-y-1 text-[8px] text-white/40">
                 <p>⚽ <span className="text-white/60 font-bold">Lig Maçları</span> — Pzt-Cum 12:00 & 18:00</p>
                 <p>🏆 <span className="text-white/60 font-bold">Kupa</span> — Cmt-Paz, 5 krediyle</p>
                 <p>💪 <span className="text-white/60 font-bold">Antrenman</span> — Hafta içi günde 2 kez</p>
                 <p>📅 <span className="text-white/60 font-bold">Sezon</span> — 34 hafta (238 gün)</p>
               </div>
               <button
                 onClick={() => {
                   if (profile?.id) {
                     import('@/lib/supabase').then(({ getSupabase }) => {
                       const supabase = getSupabase();
                       if (supabase) {
                         supabase.rpc('rpc_update_profile', { p_profile_id: profile.id, p_updates: { current_day: Math.max(14, profile.current_day || 1) } }).then();
                       }
                     });
                   }
                 }}
                 className="mt-2 text-[7px] text-white/20 hover:text-white/40 transition-colors"
               >
                 Rehberi Kapat
               </button>
             </div>
           )}

           {/* 9. Yeni Sezon Bildirimi (emekli/altyapı) — kompakt pencere */}
           {retiredLog && retiredLog.retired.length > 0 && (
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative overflow-hidden bg-zinc-900 border border-amber-500/40 rounded-xl p-2 sm:p-3 col-span-2 lg:col-span-1"
             >
               <div className="absolute top-1 right-1">
                 <button onClick={onClearRetiredLog} className="text-white/20 hover:text-white text-[10px] min-w-[24px] min-h-[24px] flex items-center justify-center">✕</button>
               </div>
               <div className="flex items-center gap-2 mb-2">
                 <CalendarDays size={11} className="text-amber-500 shrink-0" />
                 <p className="text-[8px] font-black uppercase tracking-widest text-amber-500">Yeni Sezon Başladı</p>
               </div>
               <div className="space-y-1.5 max-h-32 overflow-y-auto">
                 <div>
                   <p className="text-[7px] font-black text-amber-500 uppercase tracking-wider mb-0.5">Emekli Olanlar</p>
                   {retiredLog.retired.filter(p => !!p).slice(0, 3).map((p, idx) => (
                     <div key={`ret-${p.id || idx}`} className="text-[8px] text-white/70">• {toTitleCase(p.name)} ({p.age})</div>
                   ))}
                 </div>
                 <div>
                   <p className="text-[7px] font-black text-emerald-500 uppercase tracking-wider mb-0.5">Altyapıdan Gelenler</p>
                   {retiredLog.talents.filter(p => !!p).slice(0, 3).map((p, idx) => (
                     <div key={`tal-${p.id || idx}`} className="text-[8px] text-white/70">• {toTitleCase(p.name)} (17) -Pot: {p.potential}</div>
                   ))}
                 </div>
               </div>
               <button
                 onClick={onClearRetiredLog}
                 className="mt-2 w-full px-2 py-1 bg-white/5 hover:bg-white/10 text-white text-[8px] font-black uppercase tracking-widest rounded transition-all min-h-[36px]"
               >
                 Anladım
               </button>
             </motion.div>
           )}

         </div>
       </div>

       {/* ── ADMIN PANEL (sadece admin, kompakt) ── */}
       {isAdmin && (
         <>
           <div className="flex justify-end gap-2">
             <button
               onClick={() => {
                 const keysToKeep = ['sb-auth-token'];
                 Object.keys(localStorage).forEach(key => {
                   if (!keysToKeep.some(k => key.includes(k)) && !key.includes('fm_')) {
                     if (typeof localStorage !== 'undefined') (typeof window !== "undefined" && localStorage).removeItem(key);
                   }
                 });
                 toast.success('Ön bellek temizlendi.');
                 router.refresh();
               }}
               className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60 hover:text-emerald-400 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10"
             >
               [ ÖN BELLEĞİ TEMİZLE ]
             </button>
             <button
               onClick={() => {
                 if (confirm('TÜM VERİLER SİLİNECEK. ONAYLIYOR MUSUN?')) {
                   if (typeof localStorage !== 'undefined') (typeof window !== "undefined" && localStorage).clear();
                   router.refresh();
                 }
               }}
               className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-red-500"
             >
               [ VERİLERİ SIFIRLA ]
             </button>
           </div>

           <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-red-600/10 border border-red-600/30 p-4 rounded-2xl relative overflow-hidden"
           >
             <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                 <Zap size={16} className="text-white" fill="white" />
               </div>
               <h3 className="text-sm font-black italic tracking-tight text-white uppercase">GELİŞTİRİCİ PANELİ</h3>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
               <button
                 onClick={() => { if (profile) { setProfile({ ...profile, money: (profile.money || 0) + 100000000 }); toast.success('+100M €'); } }}
                 className="bg-black/40 border border-red-600/20 p-2 rounded-lg flex flex-col items-center gap-1 hover:bg-red-600/20 transition-all text-[9px] font-black uppercase tracking-widest text-red-400"
               >
                 <Wallet size={14} />
                 +100M €
               </button>
             </div>
           </motion.div>
         </>
       )}

    </motion.div>
  );
}
