'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
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
  Info,
} from 'lucide-react';
import type { Player } from '@/lib/fm/types';

import { toTitleCase } from '@/lib/fm/ui-helpers';
import { useFM } from '@/lib/fm/GameContext';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import LiveMatchAlert from '@/components/fm/LiveMatchAlert';
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
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Dumbbell size={14} className="text-emerald-400" />
          </div>
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/30">SON ANTRENMAN RAPORU</h3>
        </div>
        <div className="flex items-center gap-2 py-4 text-white/20 text-xs">
          <Clock size={14} className="opacity-50" />
          <span>Bugünkü antrenman henüz yapılmadı. Antrenman yaptığınızda form ve moral etkileri otomatik uygulanır; yapmazsanız form ve moral düşer.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <Dumbbell size={14} className="text-emerald-400" />
        </div>
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/30">SON ANTRENMAN RAPORU</h3>
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
          <div key={training.id} className="bg-black/30 border border-white/[0.04] rounded-xl p-4 space-y-3">
            {/* Başlık */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-white/25" />
                <span className="text-xs font-bold text-white/60">{sessionLabel}</span>
              </div>
              <span className="text-[9px] text-white/20 font-semibold">{formattedDate}</span>
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
  const { profile: ctxProfile } = useFM();

  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/fixture/${profileId}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.nextMatch) {
            setNextMatch(data.nextMatch);
          }
        }
      } catch (err) {
        console.error('[NextMatchCard] Error:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [profileId]);

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

  if (!nextMatch) return null;

  const formattedDate = (() => {
    try {
      return new Date(nextMatch.match_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    } catch {
      return nextMatch.match_date;
    }
  })();

  return (
    <div className="bg-gradient-to-br from-amber-500/[0.06] to-transparent border border-amber-500/15 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <Swords size={14} className="text-amber-400" />
        </div>
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/30">SONRAKİ MAÇ</h3>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
              nextMatch.is_home ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
            }`}>
              {nextMatch.is_home ? 'EV SAHİBİ' : 'DEPLASMAN'}
            </span>
            <span className="text-[9px] text-white/20">{nextMatch.tur}. Hafta</span>
          </div>
          <p className="text-sm font-bold text-white/80 truncate">{nextMatch.opponent}</p>
          <div className="flex items-center gap-2 mt-1">
            <CalendarDays size={10} className="text-white/20" />
            <span className="text-[10px] text-white/30">{formattedDate} • {nextMatch.match_time || '--:--'}</span>
          </div>
        </div>
        {nextMatch.status === 'live' || nextMatch.status === 'finished' ? (
          <button
            onClick={() => {
              window.location.href = `/match/${nextMatch.id}`;
            }}
            className="px-4 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-300 transition-all active:scale-95 shrink-0"
          >
            {nextMatch.status === 'live' ? 'Canlı İzle' : 'Maçı İzle'}
          </button>
        ) : (
          <span className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/20 shrink-0">
            Planlanmış
          </span>
        )}
      </div>

      {/* ── Attendance & Revenue Preview (Ev sahibi maçlar için) ── */}
      {attendancePreview && (
        <div className="mt-4 pt-4 border-t border-amber-500/10">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={12} className="text-emerald-400/60" />
            <span className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest">Bilet Geliri Tahmini</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
              <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest">Kapasite</span>
              <p className="text-sm font-black font-mono text-white/60 mt-1">{attendancePreview.capacity.toLocaleString('tr-TR')}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
              <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest">Tahmini Seyirci</span>
              <p className="text-sm font-black font-mono text-emerald-400 mt-1">{attendancePreview.attendance.toLocaleString('tr-TR')}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
              <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest">Doluluk</span>
              <p className="text-sm font-black font-mono text-amber-400 mt-1">%{attendancePreview.fillRate}</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
              <span className="text-[8px] text-emerald-400/40 uppercase font-bold tracking-widest">Bilet Geliri</span>
              <p className="text-sm font-black font-mono text-emerald-400 mt-1">{attendancePreview.revenue.toLocaleString('tr-TR')} €</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
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

  // ═══ Son Antrenman Raporu State ═══
  const [recentTrainings, setRecentTrainings] = useState<TrainingRecord[]>([]);

  // ═══ Oynanan Maç Sayısı State ═══
  const [matchesPlayed, setMatchesPlayed] = useState(0);

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
    <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
       
       {/* ── Canlı Maç Uyarısı ── */}
       {profile?.id && profile?.team_name && (
         <LiveMatchAlert profileId={profile.id} teamName={profile.team_name} />
       )}

       {/* Cache & Reset — Yalnızca Admin */}
       {isAdmin && (
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="flex justify-end gap-2"
       >
          <button
            onClick={() => {
              const keysToKeep = ['sb-auth-token'];
              Object.keys(localStorage).forEach(key => {
                if (!keysToKeep.some(k => key.includes(k)) && !key.includes('fm_')) {
                   localStorage.removeItem(key);
                }
              });
              alert('ÖN BELLEK VE GEREKSİZ VERİLER TEMİZLENDİ. PROJENİZ VE TAKIMINIZ KORUNDU.');
              window.location.reload();
            }}
            className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 hover:text-emerald-400 transition-colors bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10"
          >
             [ ÖN BELLEĞİ TEMİZLE ]
          </button>
          <button
            onClick={() => {
              if (confirm('TÜM VERİLERİN SİLİNECEK VE RASTGELE YENİ BİR TAKIM VERİLECEK. ONAYLIYOR MUSUN?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-red-500 transition-colors"
          >
             [ VERİLERİ SIFIRLA VE RASTGELE BAŞLA ]
          </button>
       </motion.div>
       )}

       {/* Developer Panel */}
       {isAdmin && (
         <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="bg-red-600/10 border border-red-600/30 p-6 rounded-3xl shadow-[0_0_30px_rgba(220,38,38,0.1)] relative overflow-hidden"
         >
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <Settings size={64} className="animate-spin-slow" />
           </div>
           <div className="flex items-center gap-4 mb-6">
             <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
               <Zap size={20} className="text-white" fill="white" />
             </div>
             <div>
               <h3 className="text-lg font-black italic tracking-tighter text-white uppercase">GELİŞTİRİCİ PANELİ (ADMIN)</h3>
               <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em]">Yetkili Yönetici Girişi</p>
             </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <button 
               onClick={() => {
                 if (profile) {
                   setProfile({ ...profile, money: (profile.money || 0) + 100000000 });
                   alert('HESABA 100M € EKLENDİ!');
                 }
               }}
               className="bg-black/40 border border-red-600/20 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-red-600/20 transition-all text-xs font-black uppercase tracking-widest text-red-400"
             >
               <Wallet size={16} /> +100M €
             </button>
             <button 
               onClick={() => {
                 setSquad(squad.map(p => ({ ...p, fitness: 100, cond: 100 })));
                 alert('TÜM KADRO FİTNESS %100 YAPILDI!');
               }}
               className="bg-black/40 border border-red-600/20 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-red-600/20 transition-all text-xs font-black uppercase tracking-widest text-red-400"
             >
               <Activity size={16} /> FULL FİTNESS
             </button>
             <button
               onClick={async () => {
                 try {
                   const res = await fetch('/api/cron/weekly-evolution', {
                     headers: { 'Authorization': 'Bearer manual-dev-trigger' },
                   });
                   const data = await res.json();
                   alert('HAFTALIK EVRİM: ' + (data.updated || 0) + '/' + (data.total || 0) + ' oyuncu güncellendi!');
                 } catch (err) { alert('EVRİM HATASI: ' + err); }
               }}
               className="bg-black/40 border border-red-600/20 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-red-600/20 transition-all text-xs font-black uppercase tracking-widest text-red-400"
             >
               <CalendarDays size={16} /> HAFTALIK EVRİM
             </button>
             <button 
               onClick={() => {
                 setSquad(squad.map(p => ({ ...p, rating: Math.min(99, (p.rating || 50) + 5) })));
                 alert('TÜM KADROYA +5 GENEL YETENEK EKLENDİ!');
               }}
               className="bg-black/40 border border-red-600/20 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-red-600/20 transition-all text-xs font-black uppercase tracking-widest text-red-400"
             >
               <TrendingUp size={16} /> +5 BOOST
             </button>
             {/* Lig Bakımı butonu kaldırıldı — /api/league/maintenance CRON_SECRET korumalıdır.
                 Admin işlemleri doğrudan cron job ile veya /api/cron/match-simulator üzerinden yapılmalıdır. */}
           </div>
         </motion.div>
       )}
       
       {/* Retirement Notification Board */}
       {retiredLog && retiredLog.retired.length > 0 && (
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="relative overflow-hidden bg-zinc-900 border-2 border-amber-500/50 p-6 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.1)]"
         >
           <div className="absolute top-0 right-0 p-4">
             <button onClick={onClearRetiredLog} className="text-white/20 hover:text-white transition-colors">✕</button>
           </div>
           <div className="flex items-start gap-6">
             <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20">
               <CalendarDays className="text-amber-500" size={32} />
             </div>
             <div className="space-y-4 flex-1">
               <div>
                 <h3 className="text-xl font-black italic tracking-tight text-white uppercase">Yeni Sezon Başladı!</h3>
                 <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Kulüp Sekreterliği Bildirimi</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Emekli Olanlar</p>
                    <div className="space-y-1">
                      {retiredLog.retired.filter(p => !!p).map((p, idx) => (
                         <div key={`ret-${p.id || idx}`} className="text-xs font-bold text-white/80">• {toTitleCase(p.name)} ({p.age} Yaş, {(p as any).specificPosition || (p as any).specific_position || p.position})</div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Altyapıdan Gelenler</p>
                    <div className="space-y-1">
                      {retiredLog.talents.filter(p => !!p).map((p, idx) => (
                         <div key={`tal-${p.id || idx}`} className="text-xs font-bold text-white/80">• {toTitleCase(p.name)} (17 Yaş, {(p as any).specificPosition || (p as any).specific_position || p.position}) -Pot: {p.potential}</div>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="pt-4 border-t border-white/5 flex gap-4">
                  <button 
                    onClick={onClearRetiredLog}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                  >
                    Anladım
                  </button>
               </div>
             </div>
           </div>
         </motion.div>
       )}
       {/* Stats Cards Grid */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: 'Kadro Genişliği', value: squad.length, icon: Users, sub: 'Oyuncu' },
           { label: 'Takım Kalitesi', value: teamAvgStats.rating, icon: TrendingUp, sub: 'Genel Ort.' },
           { label: 'Finansal Durum', value: `${((profile?.money || 0) / 1000000).toFixed(1)}M €`, icon: Wallet, sub: 'Kullanılabilir' },
           { label: 'Sezon İlerlemesi', value: profile?.current_day || 1, icon: CalendarDays, sub: 'Mevcut Gün' }
         ].map((stat, i) => (
           <div key={i} className="fm-card p-5 group relative overflow-hidden">
             <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
               <stat.icon size={80} />
             </div>
             <div className="flex items-center gap-2 mb-4">
               <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:border-besiktas-red/30 transition-colors">
                 <stat.icon size={14} className="text-white/60 group-hover:text-besiktas-red" />
               </div>
               <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">{stat.label}</span>
             </div>
             <div className="flex items-baseline gap-2">
               <p className="text-3xl font-black font-mono tracking-tighter text-white">
                 {typeof stat.value === 'number' && isNaN(stat.value) ? '0' : stat.value}
               </p>
               <span className="text-[9px] uppercase font-bold text-white/20 tracking-widest">{stat.sub}</span>
             </div>
           </div>
         ))}
       </div>

       {/* Oyun Rehberi — Yeni başlayanlar için */}
       {(profile?.current_day || 0) < 14 && (
         <div className="bg-amber-500/[0.06] border border-amber-500/15 rounded-2xl p-5 space-y-3">
           <div className="flex items-center gap-2">
             <Info size={14} className="text-amber-400" />
             <p className="text-[10px] font-black uppercase tracking-widest text-amber-400/60">
               Oyun Rehberi — Yeni Başlıyorsunuz
             </p>
           </div>
           <div className="space-y-2 text-[9px] text-white/40">
             <p>⚽ <span className="text-white/60 font-bold">Lig Maçları</span> — Pazartesi-Cuma 12:00 ve 18:00 saatlerinde oynanır</p>
             <p>🏆 <span className="text-white/60 font-bold">Kupa Maçları</span> — Cumartesi ve Pazar, Kupa sekmesinden 5 krediyle oluşturun</p>
             <p>💪 <span className="text-white/60 font-bold">Antrenman</span> — Hafta içi 15:00 ve 21:00 saatlerinde yapılabilir</p>
             <p>📅 <span className="text-white/60 font-bold">Sezon</span> — 34 hafta (238 gün). 4. haftanın Salısında sona erer</p>
           </div>
           <button
             onClick={() => {
               if (profile?.id) {
                 import('@/lib/supabase').then(({ getSupabase }) => {
                   const supabase = getSupabase();
                   if (supabase) {
                     supabase.from('profiles').update({ current_day: Math.max(14, profile.current_day || 1) }).eq('id', profile.id).then();
                   }
                 });
               }
             }}
             className="text-[8px] text-white/20 hover:text-white/40 transition-colors"
           >
             Rehberi Kapat
           </button>
         </div>
       )}

       {/* Transfer Offers Panel */}
       {/* Lig Durumu Kartı */}
       {profile?.id && (
         <LeagueInfoCard profileId={profile.id} />
       )}

       <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
         <div className="flex items-center gap-3 mb-4">
           <div className="p-2 bg-white/5 rounded-lg border border-white/5">
             <ArrowRightLeft size={14} className="text-white/60" />
           </div>
           <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/30">TRANSFER TEKLİFLERİ</h3>
         </div>
         {!transferOffers || transferOffers.length === 0 ? (
           <div className="flex items-center gap-2 py-4 text-white/20 text-xs">
             <Clock size={14} className="opacity-50" />
             <span>Gelen transfer teklifi bulunmuyor.</span>
           </div>
         ) : (
           <div className="space-y-2 max-h-64 overflow-y-auto">
             {transferOffers.map((offer) => {
               const statusConfig = {
                 pending: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'Beklemede', icon: <Clock size={10} /> },
                 accepted: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Kabul', icon: <CheckCircle size={10} /> },
                 rejected: { color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'Red', icon: <XCircle size={10} /> },
               };
               const sc = statusConfig[offer.status];
               return (
                 <div key={offer.id} className="flex items-center justify-between gap-4 p-3 bg-black/30 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                   <div className="flex items-center gap-3 min-w-0">
                     <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                       <AlertTriangle size={14} className={offer.status === 'pending' ? 'text-amber-400' : 'text-white/20'} />
                     </div>
                     <div className="min-w-0">
                       <div className="text-[10px] font-bold text-white/80 truncate">{offer.fromTeam} → {toTitleCase(offer.playerName)}</div>
                       <div className="text-[8px] text-white/25 font-bold uppercase tracking-widest">{offer.playerPosition} • {offer.date}</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-3 shrink-0">
                     <span className="text-xs font-black text-emerald-400">{(offer.amount / 1000000).toFixed(1)}M €</span>
                     <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border rounded-full ${sc.color}`}>
                       {sc.icon} {sc.label}
                     </span>
                   </div>
                 </div>
               );
             })}
           </div>
         )}
       </div>

       {/* Son Antrenman Raporu */}
       <TrainingReportCard trainings={recentTrainings} />

       {/* Sonraki Maç Kartı */}
       <NextMatchCard profileId={profile?.id || ''} onNavigate={onNavigate} />

       {/* Hero/Visual Section */}
       <div className="grid grid-cols-1 gap-6">
         <div 
           className="relative overflow-hidden p-10 rounded-3xl h-72 flex flex-col justify-end group transition-all shadow-2xl"
           style={{ 
             backgroundColor: profile?.primary_color || '#ffffff',
             color: profile?.secondary_color || '#000000'
           }}
         >
            <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white via-white/50 to-transparent" />
            
            {/* Decorative Patterns */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.05] pointer-events-none">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            </div>

            <div className="absolute top-8 right-8 flex items-center gap-3">
              <div className="text-right">
                <p className="text-[9px] uppercase font-black tracking-widest opacity-40">Gelecek Maç</p>
                <p className="text-sm font-black italic">DERBİ HAFTASI</p>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform shadow-xl"
                style={{ backgroundColor: profile?.secondary_color || '#000000', color: profile?.primary_color || '#ffffff' }}
              >
                <Trophy size={20} />
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block text-[9px] font-black px-3 py-1 rounded-full tracking-[0.2em] border border-current uppercase">
                  {profile?.league_name?.toUpperCase() || 'SÜPER LİG'}
                </span>
                {profile?.philosophy && (
                  <span className="inline-block text-[9px] font-black px-3 py-1 rounded-full tracking-[0.2em] border border-current uppercase opacity-60">
                    FILSEFE: {profile.philosophy === 'balanced' ? 'Dengeli' : 
                             profile.philosophy === 'financial' ? 'Zengin Başkan' :
                             profile.philosophy === 'youth' ? 'Altyapı Ekolü' :
                             profile.philosophy === 'squad' ? 'Yıldızlar Karması' :
                             profile.philosophy === 'reputation' ? 'Marka Değeri' : 'Efsane Adayı'}
                  </span>
                )}
              </div>
              <h2 className="text-7xl font-black italic uppercase tracking-tighter leading-[0.8] mb-3">
                {profile?.team_name?.toUpperCase() || 'ZAFERE'} <br /> 
                <span className="opacity-80">
                  {profile?.manager_name ? `${profile.manager_name.toUpperCase()} DÖNEMİ` : 'INAN.'}
                </span>
              </h2>
              <div className="flex items-center justify-between gap-6">
                <p className="text-xs uppercase font-bold tracking-[0.3em] opacity-60 max-w-sm">
                  Kulüp binasında heyecan dorukta. {profile?.team_name} için yeni bir şafak söküyor.
                </p>
                <button 
                  onClick={() => onNavigate('tactics')}
                  className="bg-current px-8 py-4 rounded-xl transform hover:scale-[1.05] active:scale-95 shadow-2xl transition-all"
                  style={{ color: profile?.primary_color || '#ffffff' }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest filter invert">KADROYU YÖNET</span>
                </button>
              </div>
            </div>
         </div>
       </div>

       {/* Quick Actions Container */}
       <div className="space-y-4">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30">Hızlı Aksiyonlar</h3>
            <div className="h-px flex-1 bg-white/5 mx-6" />
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
           {[
             { id: 'matchday', label: 'Maç Oyna', icon: Swords, color: 'hover:bg-besiktas-red', action: () => onNavigate('matchday') },
             { id: 'stadium', label: 'Yerleşke', icon: Building2, color: 'hover:bg-zinc-800', action: () => onNavigate('stadium') },
             { id: 'league', label: 'Puan Durumu', icon: Trophy, color: 'hover:bg-zinc-800', action: () => onNavigate('league') },
             { id: 'fixtures', label: 'Maç Takvimi', icon: CalendarDays, color: 'hover:bg-zinc-800', action: () => onNavigate('fixtures') },
             { id: 'training', label: 'Antrenman', icon: Dumbbell, color: 'hover:bg-zinc-800', action: () => onRunTraining('morning') },
             { id: 'tactics', label: 'Taktik Masası', icon: Settings, color: 'hover:bg-zinc-800', action: () => onNavigate('tactics') },
            ...( matchesPlayed >= 34 ? [{
              id: 'evolve',
              label: 'Yeni Sezon',
              icon: CalendarDays,
              color: 'hover:bg-amber-600',
              action: onNextSeason || (() => {}),
            }] : matchesPlayed > 0 ? [{
              id: 'evolve',
              label: `Yeni Sezon (${34 - matchesPlayed} maç kaldı)`,
              icon: CalendarDays,
              color: 'hover:bg-zinc-800 opacity-40',
              action: () => {}, // disabled — henüz 34 maç oynanmadı
            }] : []),
           ].map((btn) => (
             <button 
               key={btn.id}
               onClick={btn.action}
               className={`fm-card p-6 flex flex-col items-center gap-4 transition-all group active:scale-95 border-b-2 border-b-transparent ${btn.color} hover:border-b-white hover:-translate-y-1`}
             >
               <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-white group-hover:text-black transition-all shadow-xl">
                 <btn.icon size={24} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{btn.label}</span>
             </button>
           ))}
         </div>
       </div>
    </motion.div>
  );
}
