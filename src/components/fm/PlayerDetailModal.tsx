'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDraggableModal } from '@/hooks/useDraggableModal';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  X as XIcon, Star, ChevronDown, ChevronRight, User, Activity,
  Target, Shield, Footprints, ShoppingCart, BarChart2, Dumbbell, TrendingUp, AlertTriangle, AlertCircle, Zap,
  Ruler, Scale, Eye, Gavel, Timer, XCircle, Globe, Heart, HeartPulse, FileText
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { calculateMarketValue, getTransferCorridor, formatCurrency } from '@/lib/fm/valuation';
import { calculateLoanFeeEuro } from '@/lib/fm/inflation';
import { useToast } from '@/lib/fm/ToastContext';
import { traitDescriptions } from '@/lib/fm/traits';
import { TRAIT_LEVELS } from '@/lib/fm/traitsData';
import { useFM } from '@/lib/fm/GameContext';
import { getPlayStyleEffect } from '@/lib/fm/playStyles';
import { localizePosFull, getPosBadgeStyle, getPlayerPos } from '@/lib/fm/ui-helpers';
import { POS_LABELS } from '@/lib/fm/playerGenerator';
import { fmStatColor, fmStatBg, cap99, toTitleCase } from '@/lib/fm/ui-helpers';
import { calculatePhysioHealing } from '@/lib/fm/injuryManager';
import type { Player, TrainingState } from '@/lib/fm/types';
import type { MarketListing } from '@/lib/fm/multiplayer';
import PlayerStatsTab from './PlayerStatsTab';
import PlayerPositionMap from './PlayerPositionMap';
import PlayerFormChart from './PlayerFormChart';
import PlayerCareerSection from './PlayerCareerSection';

interface PlayerDetailModalProps {
  player: Player;
  onClose: () => void;
  teamStats: Record<string, number>;
  onSell?: (player: Player, price: number) => Promise<void>;
  marketListing?: MarketListing;
  onBuy?: (listing: MarketListing) => Promise<void>;
  onBid?: (listing: MarketListing) => Promise<void>;
  onSign?: (player: Player) => Promise<void>;
  trainingState?: TrainingState;
  onTrainingStateChange?: (state: TrainingState) => void;
  profileMoney?: number;
  profileTeamName?: string;
  profileId?: string;
  isAdmin?: boolean;
}

// ──────────── RadarChart Hata Sınırı (recharts + React 19 uyumsuzluk koruması) ────────────
// "Cannot access '$' before initialization" hatasını yakalar ve 
// grafik yerine basit bir metin gösterir. Bileşen çökmez.
class RadarChartErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn('[PlayerDetailModal] RadarChart render hatası yakalandı:', error.message);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px]">
          Grafik yüklenemedi
        </div>
      );
    }
    return this.props.children;
  }
}

// ──────────── Helpers ────────────

/** Personality object'ini okunabilir bir Türkçe etikete dönüştürür */
function getPersonalityLabel(p: Record<string, number>): string {
  const labels: string[] = [];
  if (p.ambition >= 15) labels.push('Hırslı');
  else if (p.ambition <= 5) labels.push('Mütevazı');
  if (p.professionalism >= 15) labels.push('Profesyonel');
  else if (p.professionalism <= 5) labels.push('Disiplinsiz');
  if (p.temperament >= 15) labels.push('Ateşli');
  else if (p.temperament <= 5) labels.push('Sakin');
  if (p.loyalty >= 15) labels.push('Sadık');
  else if (p.loyalty <= 5) labels.push('Vefasız');
  if (p.pressure_handling >= 15) labels.push('Baskı Altında Soğukkanlı');
  else if (p.pressure_handling <= 5) labels.push('Baskı Altında Ezilir');
  if (labels.length === 0) {
    // Orta seviye — en yüksek değeri göster
    const entries = Object.entries(p);
    const max = entries.reduce((a, b) => b[1] > a[1] ? b : a, entries[0]);
    const nameMap: Record<string, string> = { ambition: 'Azimli', professionalism: 'Düzenli', temperament: 'Dengeli', loyalty: 'Bağlı', pressure_handling: 'Dayanıklı' };
    labels.push(nameMap[max[0]] || 'Dengeli');
  }
  return labels.slice(0, 2).join(' • ');
}

// ──────────── Stat Row Component (FM Grid Style) ────────────
function StatRow({ label, value, isObserved = true }: { label: string; value: number | string; isObserved?: boolean }) {
  const displayVal = isObserved ? value : '??';
  const valNum = typeof value === 'number' ? value : 50;
  return (
    <div className={`flex items-center justify-between px-2 py-[3px] ${isObserved ? fmStatBg(valNum) : 'bg-white/[0.02]'} rounded-sm`}>
      <span className="text-[10px] text-white/50 font-medium">{label}</span>
      <span className={`text-[11px] font-bold font-mono ${isObserved ? fmStatColor(valNum) : 'text-white/20'}`}>{displayVal}</span>
    </div>
  );
}

// ──────────── Attribute Column Component ────────────
function AttrColumn({ title, icon, stats, isObserved = true }: { title: string; icon: React.ReactNode; stats: { label: string; val: number }[]; isObserved?: boolean }) {
  const avg = isObserved ? Math.round(stats.reduce((a, s) => a + s.val, 0) / stats.length) : '??';
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-t-sm mb-px">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">{title}</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className={`text-[11px] font-mono font-black ${isObserved && typeof avg === 'number' ? fmStatColor(avg) : 'text-white/20'}`}>{avg}</span>
      </div>
      <div className="space-px">
        {stats.map(s => (
          <StatRow key={s.label} label={s.label} value={s.val} isObserved={isObserved} />
        ))}
      </div>
    </div>
  );
}

// ──────────── Main Component ────────────

export default function PlayerDetailModal({ 
  player: initialPlayer, onClose, teamStats, onSell, marketListing, onBuy, onBid, onSign, trainingState, onTrainingStateChange, profileMoney, profileTeamName, profileId, isAdmin 
}: PlayerDetailModalProps) {
  const { scoutPlayer, watchlist, toggleWatchlist } = useFM();
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useToast();
  const [player, setPlayer] = useState<Player>(initialPlayer);
  const [activeTab, setActiveTab] = useState<'genel' | 'bilgi' | 'performans' | 'istatistikler' | 'market' | 'antrenman'>(marketListing ? 'market' : 'genel');
  const [devLog, setDevLog] = useState<any[]>([]);

  // Keep local state in sync
  React.useEffect(() => {
    setPlayer(initialPlayer);
  }, [initialPlayer]);

  // Fetch development log
  useEffect(() => {
    if (!initialPlayer?.id) return;
    fetch(`/api/players/${initialPlayer.id}/development-log?limit=10`)
      .then(r => r.json())
      .then(data => setDevLog(Array.isArray(data) ? data : []))
      .catch(() => setDevLog([]));
  }, [initialPlayer?.id]);

  const isOwned = profileTeamName && player.club === profileTeamName;
  const isScouted = player.scouted || isAdmin || isOwned;
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  // ── Eylemler dropdown: dışına tıklayınca kapat ──
  useEffect(() => {
    if (!showActions) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    // Küçük gecikme: butonun kendi click'i ile çakışmasını önle
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  const [sellPrice, setSellPrice] = useState<number>(0);
  const [isSelling, setIsSelling] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isRenewingContract, setIsRenewingContract] = useState(false);

  // ── Sözleşme uzatma slider display güncelleme ──
  useEffect(() => {
    if (!isRenewingContract) return;
    const slider = document.getElementById('contract-renew-weeks') as HTMLInputElement;
    const display = document.getElementById('contract-renew-weeks-display');
    if (!slider || !display) return;
    const update = () => { display.textContent = slider.value; };
    slider.addEventListener('input', update);
    return () => slider.removeEventListener('input', update);
  }, [isRenewingContract]);

  // ── Fizyoterapist tedavi state ──
  const [isPhysioTreating, setIsPhysioTreating] = useState(false);
  const [physioInfo, setPhysioInfo] = useState<{ stars: number[]; totalHealing: number } | null>(null);

  // ── Sakat oyuncunun fizyoterapist bilgilerini çek ──
  useEffect(() => {
    if (player.is_injured && isOwned && profileId) {
      const fetchPhysios = async () => {
        try {
          const res = await fetch(`/api/staff?userId=${profileId}`);
          const data = await res.json();
          if (data.staff && Array.isArray(data.staff)) {
            const physios = data.staff.filter((s: { type: string }) => s.type === 'physio');
            if (physios.length > 0) {
              const stars = physios.map((p: { stars: number }) => p.stars);
              const totalHealing = calculatePhysioHealing(stars);
              setPhysioInfo({ stars, totalHealing });
            }
          }
        } catch (err) {
          console.error('[PlayerDetailModal] Physio fetch error:', err);
        }
      };
      fetchPhysios();
    }
  }, [player.is_injured, isOwned, profileId]);

  // ── Kiralama form state ──
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanWeeks, setLoanWeeks] = useState<number>(17);
  const [loanFeeEuro, setLoanFeeEuro] = useState<number>(Math.round((player.market_value || 500000) * 0.15));
  const [isSendingLoan, setIsSendingLoan] = useState(false);

  // ── Auction countdown timer ──
  const [auctionTimeLeft, setAuctionTimeLeft] = React.useState('');
  React.useEffect(() => {
    if (!marketListing?.expires_at) return;
    const update = () => {
      const diff = new Date(marketListing.expires_at!).getTime() - Date.now();
      if (diff <= 0) { setAuctionTimeLeft('Sona Erdi'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setAuctionTimeLeft(h > 0 ? `${h}s ${m}dk ${s}sn` : `${m}dk ${s}sn`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [marketListing?.expires_at]);

  const isSeller = !!profileTeamName && !!marketListing && marketListing.seller_id === profileTeamName;
  const isHighestBidder = !!profileTeamName && !!marketListing && marketListing.highest_bidder_id === profileTeamName;

  const rating = cap99(player?.rating || 65);
  const ratingStart = (player as any).rating_start_of_season as number | undefined;
  const ratingDiff  = ratingStart && ratingStart > 0
    ? Math.round((player?.rating || 0) - ratingStart)
    : 0;
  const potential = cap99(player?.potential || 70);
  const playStyle = getPlayStyleEffect(player?.playStyle || '');
  const marketValue = calculateMarketValue(player);
  const corridor = getTransferCorridor(marketValue);
  const potentialDiff = potential - rating;
  
  const isWatched = watchlist?.includes(player.id);

  // Auto-set min price when entering market tab, and reset tab if not owned
  React.useEffect(() => {
    if (activeTab === 'market' && sellPrice === 0) {
      setSellPrice(corridor.min);
    }
    if (activeTab === 'antrenman' && !isOwned) {
      setActiveTab('genel');
    }
  }, [activeTab, corridor.min, sellPrice, isOwned]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // In a real app we'd upload to storage. Here we update state.
        // We'll need a way to notify parent if we want persistence.
        player.photo_url = base64String;
        // Trigger a re-render or notify context if possible
        // For now, it will work in this session.
        (e.target as any).value = null; // Reset input
        window.dispatchEvent(new CustomEvent('player-photo-updated', { detail: { playerId: player.id, photoUrl: base64String } }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Spesifik mevki bilgisini al
  const sp = getPlayerPos(player as Record<string, unknown>);
  const isGK = player.position === 'GK' || sp === 'GK';

  // ── Performans: Stat dizileri useMemo ile sarılıyor ──
  // Her render'da yeni dizi referansı oluşturmamak için useMemo kullanılır.
  // Bu sayede performansSection memo'su düzgün cache'lenir.

  // Technical or Goalkeeping — Doğrudan player attribute'leri, yoksa varsayılan 50
  const technicalStats = useMemo<{ label: string; val: number }[]>(() => isGK ? [
    { label: 'Refleksler', val: player.goalkeeping ?? 50 },
    { label: 'Top Tutma', val: cap99((player.goalkeeping ?? 50) * 0.95) },
    { label: 'Bire Bir', val: cap99((player.goalkeeping ?? 50) * 1.05) },
    { label: 'Hava Hakimiyeti', val: player.jumping ?? 50 },
    { label: 'Alan Hakimiyeti', val: player.positioning ?? 50 },
    { label: 'Degaj', val: player.passing ?? 50 },
    { label: 'Elle Oyun', val: cap99((player.passing ?? 50) * 1.1) },
    { label: 'İletişim', val: player.leadership ?? 50 },
    { label: 'Konsantrasyon', val: player.concentration ?? 50 },
    { label: 'Çeviklik', val: player.agility ?? 50 },
  ] : [
    { label: 'Bitiricilik', val: player.finishing ?? player.shooting ?? 50 },
    { label: 'Dribbling', val: player.dribbling ?? 50 },
    { label: 'İlk Kontrol', val: player.firstTouch ?? player.control ?? 50 },
    { label: 'Kafa Vuruşu', val: player.heading ?? player.power ?? 50 },
    { label: 'Markaj', val: player.marking ?? player.defending ?? 50 },
    { label: 'Orta Yapma', val: player.crossing ?? player.passing ?? 50 },
    { label: 'Pas', val: player.passing ?? 50 },
    { label: 'Teknik', val: player.technique ?? player.control ?? 50 },
    { label: 'Top Kapma', val: player.tackling ?? player.defending ?? 50 },
    { label: 'Uzaktan Şut', val: player.longShots ?? player.shooting ?? 50 },
  ], [player, isGK]);

  // ── Özet Skorları: Doğrudan player attribute'lerinden, yoksa varsayılan 50 ──
  // Özel Yetenek: traits/personalityTraits sayısından türetilir (0-100)
  const traitScore = useMemo(() => cap99(
    (player.flair) ||
    Math.min(100, 30 + (player.traits?.length || 0) * 12 + (player.personalityTraits?.length || 0) * 8)
  ), [player.flair, player.traits, player.personalityTraits]);

  // Mental — Her stat doğrudan kendi attribute'ünden, derived stats kullanılmaz
  const mentalStats = useMemo<{ label: string; val: number }[]>(() => [
    { label: 'Agresiflik', val: player.aggression ?? 50 },
    { label: 'Cesaret', val: player.bravery ?? 50 },
    { label: 'Çalışkanlık', val: player.workRate ?? 50 },
    { label: 'Karar Alma', val: player.decisions ?? 50 },
    { label: 'Kararlılık', val: player.determination ?? 50 },
    { label: 'Konsantrasyon', val: player.concentration ?? 50 },
    { label: 'Liderlik', val: player.leadership ?? 50 },
    { label: 'Önsez', val: player.anticipation ?? 50 },
    { label: 'Özel Yetenek', val: traitScore },
    { label: 'Pozisyon Alma', val: player.positioning ?? player.offTheBall ?? 50 },
    { label: 'Soğukkanlılık', val: player.composure ?? 50 },
    { label: 'Takım Oyunu', val: player.teamwork ?? 50 },
    { label: 'Vizyon', val: player.vision ?? 50 },
  ], [player, traitScore]);

  // Physical — Doğrudan player attribute'leri, yoksa varsayılan 50
  const physicalStats = useMemo<{ label: string; val: number }[]>(() => [
    { label: 'Çeviklik', val: player.agility ?? 50 },
    { label: 'Dayanıklılık', val: player.stamina ?? player.cond ?? 50 },
    { label: 'Denge', val: player.balance ?? 50 },
    { label: 'Güç', val: player.strength ?? player.power ?? 50 },
    { label: 'Hız', val: player.speed ?? 50 },
    { label: 'Hızlanma', val: player.acceleration ?? player.speed ?? 50 },
    { label: 'Zıplama', val: player.jumping ?? player.power ?? 50 },
    { label: 'Sol Ayak', val: player.leftFoot ?? (player.preferred_foot === 'Left' ? 80 : 50) },
    { label: 'Sağ Ayak', val: player.rightFoot ?? (player.preferred_foot === 'Right' ? 80 : 50) },
  ], [player]);

  // ── Radar — Evrensel 6 eksen (oyuncunun gerçek attribute'leri) ──
  // Her eksen doğrudan player objesindeki değerden alınır, derived stats kullanılmaz
  const chartData = [
    { subject: 'Şut', A: cap99(player.shooting || 0) },
    { subject: 'Pas', A: cap99(player.passing || 0) },
    { subject: 'Dribling', A: cap99(player.dribbling || 0) },
    { subject: 'Savunma', A: cap99(player.defending || 0) },
    { subject: 'Fizik', A: cap99(player.power || 0) },
    { subject: 'Hız', A: cap99(player.speed || 0) },
  ];

  // ── Position colors (spesifik mevki bazlı) ──
  const getGroup = (p: string) => {
    if (p === 'GK') return 'GK';
    if (['CB','LB','RB','LWB','RWB'].includes(p)) return 'DEF';
    if (['CDM','CM','CAM','LM','RM','LW','RW'].includes(p)) return 'MID';
    return 'FWD';
  };
  const posGroup = getGroup(sp);
  const posBadge = getPosBadgeStyle(posGroup);
  const posColor = posBadge.split(' ').find(c => c.startsWith('text-')) || 'text-[#9B9B9B]';
  const posBg = posBadge.split(' ').filter(c => !c.startsWith('text-')).join(' ');

  const tabs = [
    { id: 'genel' as const, label: 'Genel Bakış' },
    { id: 'bilgi' as const, label: 'Kişisel Bilgi' },
    { id: 'performans' as const, label: 'Performans' },
    { id: 'istatistikler' as const, label: 'İstatistikler' },
    ...(isOwned ? [{ id: 'antrenman' as const, label: 'Antrenman' }] : []),
    { id: 'market' as const, label: marketListing ? 'Satın Al' : 'Global Transfer' },
  ];

  const { modalRef, handleRef, position, isDragging } = useDraggableModal();

  // ── Memoized heavy tab sections ──

  const istatistiklerSection = useMemo(() => {
    if (activeTab !== 'istatistikler') return null;
    return (
      <div>
        <PlayerStatsTab player={player} />
        {devLog.length > 0 && (
          <div className="mt-4 px-4">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Gelişim Tarihi</p>
            <div className="space-y-1">
              {devLog.map((log, i) => (
                <div key={i} className="flex justify-between text-xs py-1 border-b border-white/5">
                  <span className="text-white/50">{log.week_label || `Hafta ${log.week}`}</span>
                  <span className={log.ovr_change > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {log.ovr_change > 0 ? '+' : ''}{log.ovr_change?.toFixed(1)} OVR
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {ratingStart && ratingStart > 0 && (
          <div className="mt-4 p-3 bg-white/[0.03] border border-white/10 rounded-xl mx-4">
            <p className="text-[9px] uppercase tracking-widest text-white/25 mb-3">Sezon Gelişimi</p>
            <div className="flex items-center gap-3">
              <div className="text-center w-12 shrink-0">
                <p className="text-[8px] text-white/30 mb-0.5">Başlangıç</p>
                <p className="text-base font-black text-white/50">{ratingStart}</p>
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, Math.abs(ratingDiff) * 8))}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${ratingDiff > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  />
                </div>
                <p className={`text-center text-[10px] font-black ${
                  ratingDiff > 0 ? 'text-emerald-400' :
                  ratingDiff < 0 ? 'text-red-400' : 'text-white/30'
                }`}>
                  {ratingDiff > 0
                    ? `+${ratingDiff} OVR gelişim`
                    : ratingDiff < 0
                    ? `${ratingDiff} OVR gerileme`
                    : 'Değişim yok'}
                </p>
              </div>
              <div className="text-center w-12 shrink-0">
                <p className="text-[8px] text-white/30 mb-0.5">Şimdi</p>
                <p className={`text-base font-black ${ratingDiff > 0 ? 'text-emerald-400' : 'text-white'}`}>
                  {rating}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [player, activeTab, devLog]);

  const performansSection = useMemo(() => {
    if (activeTab !== 'performans') return null;
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-[600px] mx-auto">
          <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6">
            <div className="px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-sm text-center">
              <div className="text-[22px] font-black text-white/90">{player.goals ?? 0}</div>
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5">Gol</div>
            </div>
            <div className="px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-sm text-center">
              <div className="text-[22px] font-black text-white/90">{player.assists ?? 0}</div>
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5">Asist</div>
            </div>
            <div className="px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-sm text-center">
              <div className="text-[22px] font-black text-amber-400">{player.last_match_rating?.toFixed(1) ?? '—'}</div>
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5">Son Maç RT</div>
            </div>
            <div className="px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-sm text-center">
              <div className={`text-[22px] font-black ${cap99(player.form || 50) >= 70 ? 'text-emerald-400' : cap99(player.form || 50) >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {cap99(player.form || 50)}%
              </div>
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5">Form</div>
              {/* Mini form sparkline — last 5 match ratings */}
              {player.match_ratings && player.match_ratings.length > 0 && (
                <div className="flex items-end justify-center gap-0.5 mt-1.5">
                  {player.match_ratings.slice(-5).map((r, i) => {
                    const h = Math.max(4, (r / 10) * 16);
                    const c = r >= 7 ? 'bg-emerald-500' : r >= 5 ? 'bg-yellow-500' : 'bg-red-500';
                    return (
                      <div key={i} className="flex flex-col items-center">
                        <div className={`w-2 rounded-sm ${c}`} style={{ height: `${h}px`, opacity: 0.75 }} title={`${r.toFixed(1)}`} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* All stats in bars */}
          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25 mb-2">Tüm Özellikler</div>
          <div className="space-y-1">
            {[
              ...technicalStats.map(s => ({ ...s, group: 'Teknik' })),
              ...mentalStats.map(s => ({ ...s, group: 'Zihinsel' })),
              ...physicalStats.map(s => ({ ...s, group: 'Fiziksel' })),
            ].map((s, idx) => (
              <div key={`${s.group}-${s.label}`} className="flex items-center gap-3 py-[2px]">
                <span className="w-[100px] shrink-0 text-[9px] font-medium text-white/40">{s.label}</span>
                <div className="flex-1 h-[5px] bg-white/[0.03] rounded-sm overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.val / 99) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.02 }}
                    className={`h-full rounded-sm ${
                      s.val >= 80 ? 'bg-green-500' :
                      s.val >= 65 ? 'bg-emerald-500' :
                      s.val >= 50 ? 'bg-yellow-500' :
                      s.val >= 35 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ opacity: 0.8 }}
                  />
                </div>
                <span className={`w-7 text-right text-[10px] font-mono font-bold ${fmStatColor(s.val)}`}>{s.val}</span>
              </div>
            ))}
          </div>

          {/* Player Form Chart */}
          <div className="mt-6">
            <PlayerFormChart playerId={player.id} />
          </div>
        </div>
      </div>
    );
  }, [player, activeTab, technicalStats, mentalStats, physicalStats]);

  const genelSection = useMemo(() => {
    if (activeTab !== 'genel') return null;
    return (
      <div>
      <div className="flex flex-col md:flex-row">
        {/* ─── LEFT PANEL: Info & Character ─── */}
        <div className="w-full md:w-[200px] md:shrink-0 md:border-r border-b md:border-b-0 border-white/[0.05] bg-[#0a0f15]">
          {/* Photo & Rating area */}
          <div className="px-3 py-4 border-b border-white/[0.05] text-center bg-gradient-to-b from-amber-500/[0.03] to-transparent">
              <div className="group relative w-24 h-24 mx-auto mb-3">
                <div className="w-full h-full rounded-2xl bg-[#0d1218] border-2 border-amber-500/20 flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden relative">
                  {player.photo_url ? (
                    <Image
                      src={player.photo_url}
                      alt={player.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <>
                      <User size={32} className="text-white/10 mb-1" />
                      <span className="text-[28px] font-display font-black italic text-amber-400 leading-none">{rating}</span>
                      <span className="text-[8px] font-black text-amber-500/50 uppercase mt-1">GENEL</span>
                      {ratingDiff !== 0 && ratingStart && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`text-[9px] font-black ${ratingDiff > 0 ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                          {ratingDiff > 0 ? `▲ +${ratingDiff}` : `▼ ${ratingDiff}`} bu sezon
                        </motion.span>
                      )}
                    </>
                  )}

                  {/* Photo Upload Overlay */}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer">
                    <Activity size={18} className="text-white mb-1" />
                    <span className="text-[8px] font-black text-white uppercase tracking-wider">FOTOĞRAF YÜKLE</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </div>

              <div className="mt-1 flex flex-col items-center gap-1.5">
                <span className={`px-4 py-1.5 rounded-sm border text-[12px] font-black uppercase tracking-[0.1em] ${posBg} ${posColor}`}>
                  {sp}
                </span>
                <span className="text-[10px] text-white/35 font-bold">{localizePosFull(sp)}</span>
                {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1">
                    {player.secondaryPositions.map((sec: string, si: number) => {
                      const secG = getGroup(sec);
                      const secBadge = getPosBadgeStyle(secG);
                      const secColor = secBadge.split(' ').find(c => c.startsWith('text-')) || 'text-[#9B9B9B]';
                      const secBg = secBadge.split(' ').filter(c => !c.startsWith('text-')).join(' ');
                      return <span key={si} className={`px-1.5 py-px rounded-full border text-[8px] font-bold uppercase tracking-wider ${secBg} ${secColor}`}>{sec} <span className="text-[6px] opacity-50">{localizePosFull(sec)}</span></span>;
                    })}
                    <span className="text-[7px] text-white/15 font-bold uppercase w-full text-center">yan mevki</span>
                  </div>
                )}
              </div>

              {/* Saha Yerleşimi */}
              <PlayerPositionMap
                specificPosition={getPlayerPos(player as Record<string, unknown>)}
                secondaryPositions={player.secondaryPositions}
                size="sm"
              />
          </div>

          {/* Professional Styles / Traits Section */}
          <div className="px-3 py-2 border-b border-white/[0.05]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25">Profesyonel Stiller & Yetenekler</div>
              {(!isScouted || (player.scouting_count || 0) < 3) && (
                <button
                  onClick={async () => {
                    const res = await scoutPlayer(player.id, player);
                    if (res.success && res.player) {
                      setPlayer(res.player);
                    } else if (!res.success) {
                      toastError(res.reason);
                    }
                  }}
                  className="text-[7px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-sm border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors uppercase font-bold"
                >
                  {player.scouted ? 'Yeniden Gözlem (150K)' : 'Gözlemle (150K)'}
                </button>
              )}
            </div>

            {isScouted ? (
              <div className="space-y-1.5">
                {/* Arketip */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-white/40">Arketip</span>
                  {isScouted ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-purple-500/10 border-purple-500/20 text-purple-400">
                      <span className="text-[10px] font-black uppercase tracking-wider">{player.archetype || POS_LABELS[sp] || sp}</span>
                    </div>
                  ) : (
                    <span className="text-[9px] font-bold text-white/20">???</span>
                  )}
                </div>

                {/* Play Style */}
                {playStyle ? (
                  <div className="flex items-center gap-2 px-2 py-1 bg-white/[0.03] border border-white/[0.06] rounded-sm">
                    <span className="text-[12px]">{playStyle.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-bold text-white/70 truncate">{playStyle.name}</div>
                      <div className="text-[7px] text-white/30 truncate">{playStyle.short}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[9px] text-white/10 italic px-2">Stil Yok</div>
                )}

                {/* Traits as Capsules */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {player.traits && player.traits.map((tk, idx) => {
                    const levelKey = player.traitLevels?.[tk] || 'BEYAZ';
                    const levelInfo = (TRAIT_LEVELS as any)[levelKey] || TRAIT_LEVELS.BEYAZ;
                    const t = traitDescriptions[tk] || { name: tk, short: 'Özel yetenek.', type: 'pozitif' };

                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-extrabold shadow-lg ${levelInfo.color} cursor-default group relative`}
                      >
                        <span className="filter drop-shadow-sm">{levelInfo.icon}</span>
                        <span className="tracking-tight">{t.name}</span>

                        {/* Tooltip for traits */}
                        <div className="absolute top-full left-0 mt-3 w-64 p-3 bg-zinc-950 border border-white/20 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-[10px] font-medium text-white/70 z-[500] pointer-events-none shadow-2xl backdrop-blur-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">{levelInfo.icon}</span>
                            <p className="font-black text-white uppercase tracking-tighter text-xs">{t.name}</p>
                          </div>
                          <p className="mb-2 leading-relaxed text-white/50">{t.short}</p>

                          {t.engineEffect && (
                            <div className="space-y-1 mb-2 py-2 border-y border-white/5">
                              <div className="flex justify-between items-center text-emerald-400 font-bold">
                                <span>ETKİ ORANI:</span>
                                <span>%{Math.round(t.engineEffect.successRate * 100)}</span>
                              </div>
                              <div className="flex justify-between items-center text-blue-400 font-bold">
                                <span>MOTOR ETKİSİ:</span>
                                <span>%{Math.round(t.engineEffect.engineWeight * 100)}</span>
                              </div>
                            </div>
                          )}

                          {t.counterFor && (
                            <div className="bg-amber-500/10 text-amber-500 px-2 py-1.5 rounded border border-amber-500/20 text-[9px] font-black uppercase tracking-tighter text-center">
                              🚀 ANTİ: {t.counterFor}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  {player.negTraits && player.negTraits.map((nt, idx) => {
                    const t = traitDescriptions[nt] || { name: nt, short: 'Negatif özellik.', type: 'negatif' };
                    return (
                      <motion.div
                        key={`neg-${idx}`}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-100 text-[10px] font-black shadow-lg cursor-default group relative"
                      >
                        <span>🚩</span>
                        <span className="tracking-tight">{t.name}</span>

                        {/* Improved Tooltip for capsules too if needed, or just better visibility */}
                         <div className="absolute top-full left-0 mt-3 w-48 p-2 bg-zinc-950 border border-red-500/20 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-[8px] font-medium text-white/70 z-[500] pointer-events-none shadow-2xl backdrop-blur-xl">
                          {t.short}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Personality Traits as Capsules */}
                <div className="flex flex-wrap gap-2 pt-2">
                   {player.personalityTraits && player.personalityTraits.map((ptr, pidx) => {
                     const info = traitDescriptions[ptr] || { name: ptr, type: 'pozitif' };
                     const isNeg = info.type === 'negatif';
                     return (
                       <motion.div
                         key={`ptr-cap-${pidx}`}
                         whileHover={{ scale: 1.05 }}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black shadow-xl cursor-default transition-all ${
                           isNeg
                           ? 'border-red-500/40 bg-red-500/10 text-red-200'
                           : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                         }`}
                       >
                         <span className="text-[12px]">{isNeg ? '🚩' : '💠'}</span>
                         <span className="tracking-tight uppercase">{info.name}</span>
                       </motion.div>
                     );
                   })}
                </div>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <Zap size={20} className="text-white/20" />
                </div>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest text-center">Özel Karakter Özelliği Bulunmuyor</p>
              </div>
            )}
          </div>

          {/* ── SAKATLIK BİLGİSİ VE FİZYOTERAPEST ── */}
          {player.is_injured && (
            <div className="px-3 py-2 border-b border-white/[0.05]">
              <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25 mb-2">Sakatlık Durumu</div>
              <div className="bg-red-500/[0.08] border border-red-500/20 rounded-sm p-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <HeartPulse size={12} className="text-red-400 animate-pulse" />
                  <span className="text-[9px] font-bold text-red-300 uppercase tracking-wider">Sakat</span>
                  {player.injury?.severity !== undefined && (
                    <span className={`px-1.5 py-px rounded-sm text-[7px] font-black uppercase tracking-wider ${
                      player.injury.severity <= 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : player.injury.severity <= 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {player.injury_severity === 'light' ? 'Hafif' : player.injury_severity === 'medium' ? 'Orta' : player.injury_severity === 'heavy' ? 'Ağır' : 'Belirsiz'}
                    </span>
                  )}
                  {player.injury_severity && !player.injury?.severity && (
                    <span className={`px-1.5 py-px rounded-sm text-[7px] font-black uppercase tracking-wider ${
                      player.injury_severity === 'light' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : player.injury_severity === 'medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {player.injury_severity === 'light' ? 'Hafif' : player.injury_severity === 'medium' ? 'Orta' : 'Ağır'}
                    </span>
                  )}
                </div>
                {player.injury_end_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-white/40">Tahmini İyileşme</span>
                    <span className="text-[9px] font-bold text-red-300/80">
                      {new Date(player.injury_end_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                )}
                {player.injury?.remaining_days !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-white/40">Kalan Gün</span>
                    <span className="text-[9px] font-bold text-red-300/80">{player.injury.remaining_days} gün</span>
                  </div>
                )}
                {/* Fizyoterapist Tedavi Butonu */}
                {isOwned && physioInfo && physioInfo.totalHealing > 0 && (
                  <div className="pt-1.5 border-t border-red-500/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[8px] text-white/30">Fizyoterapist Gücü</span>
                      <div className="flex items-center gap-1">
                        {physioInfo.stars.map((s, i) => (
                          <div key={i} className="flex items-center gap-px">
                            {Array.from({ length: s }).map((_, si) => (
                              <Star key={si} size={6} className="text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                        ))}
                        <span className="text-[8px] font-bold text-emerald-400 ml-1">-{physioInfo.totalHealing} gün</span>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (!profileId) return;
                        setIsPhysioTreating(true);
                        try {
                          const res = await fetch('/api/physio-treat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ playerId: player.id, profileId }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            if (data.injuryCleared) {
                              toastSuccess(`${toTitleCase(player.name)} tamamen iyileşti! Sakatlık sona erdi.`);
                              setPlayer(prev => ({
                                ...prev,
                                is_injured: false,
                                injury_end_date: undefined,
                                injury_severity: undefined,
                                injury: undefined,
                              }));
                            } else {
                              toastSuccess(`Fizyoterapist tedavisi uygulandı! Sakatlık ${data.daysReduced} gün kısaldı.`);
                              setPlayer(prev => ({
                                ...prev,
                                injury_end_date: data.newEndDate || prev.injury_end_date,
                              }));
                            }
                            // Refresh physio info
                            setPhysioInfo(null);
                          } else {
                            toastError(data.userMessage || data.message || 'Tedavi uygulanamadı.');
                          }
                        } catch (err) {
                          console.error('[PhysioTreat] Exception:', err);
                          toastError('Bir hata oluştu. Lütfen tekrar deneyin.');
                        } finally {
                          setIsPhysioTreating(false);
                        }
                      }}
                      disabled={isPhysioTreating}
                      className="w-full py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-sm text-[8px] font-black uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {isPhysioTreating ? (
                        <>
                          <div className="w-2.5 h-2.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                          Tedavi Uygulanıyor...
                        </>
                      ) : (
                        <>
                          <Heart size={10} />
                          Fizyoterapist Kullan
                        </>
                      )}
                    </button>
                  </div>
                )}
                {isOwned && (!physioInfo || physioInfo.totalHealing === 0) && (
                  <div className="pt-1.5 border-t border-red-500/10">
                    <div className="flex items-center gap-1.5 text-[7px] text-white/20 italic">
                      <AlertTriangle size={8} className="text-amber-500/50" />
                      <span>Fizyoterapist yok — Personel sekmesinden işe alabilirsiniz</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* ─── CENTER PANEL: Attributes (Technical + Mental) ─── */}
        <div className="flex-1 min-w-0">
          <div className="flex">
            <div className="flex-1 min-w-0 p-2 border-r border-white/[0.04]">
              <AttrColumn
                title={player.position === 'GK' ? "Kalecilik" : "Teknik"}
                icon={<Target size={10} className="text-cyan-400/70" />}
                stats={technicalStats}
                isObserved={isScouted}
              />


            </div>
            <div className="flex-1 min-w-0 p-2">
              <AttrColumn
                title="Zihinsel"
                icon={<Activity size={10} className="text-purple-400/70" />}
                stats={mentalStats}
                isObserved={isScouted}
              />
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL: Physical Stats + Radar ─── */}
        <div className="w-full md:w-[200px] md:shrink-0 border-t md:border-t-0 md:border-l border-white/[0.05] bg-[#0a0f15]">
          <div className="p-2">
            <AttrColumn
              title="Fiziksel"
              icon={<Footprints size={10} className="text-red-400/70" />}
              stats={physicalStats}
              isObserved={isScouted}
            />
          </div>

          {/* Radar Chart — Hata sınırı ile sarılı (recharts + React 19 uyumsuzluk koruması) */}
          <div className="px-2 pb-2">
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-t-sm mb-px">
              <Shield size={10} className="text-amber-400/70" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Özet</span>
            </div>
            <div className="w-full h-[160px] bg-white/[0.02] border border-white/[0.05] rounded-b-sm p-1">
              <RadarChartErrorBoundary>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="#ffffff10" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff40', fontSize: 8, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#ffffff20', fontSize: 6 }} axisLine={false} />
                    <Radar name={toTitleCase(player.name)} dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.10} strokeWidth={1.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </RadarChartErrorBoundary>
            </div>
          </div>
        </div>
      </div>

      {/* Player Career Section */}
      {isOwned && (
        <div className="px-3 py-2 border-t border-white/[0.05]">
          <PlayerCareerSection
            playerId={player.id}
            currentOvr={rating}
            playerName={player.name}
          />
        </div>
      )}
    </div>
    );
  }, [player, activeTab, isScouted, isOwned, rating, sp, posBg, posColor, playStyle, isWatched, handlePhotoUpload, technicalStats, mentalStats, physicalStats, chartData, physioInfo, isPhysioTreating, profileId, scoutPlayer, setPlayer, toastSuccess, toastError, setPhysioInfo]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-2"
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="bg-[#111820] w-full max-w-full md:max-w-[960px] max-h-[90vh] md:max-h-[90vh] md:rounded-sm rounded-none overflow-y-auto border border-white/[0.08] shadow-[0_0_120px_rgba(0,0,0,0.9)] font-sans text-white relative"
        onClick={e => e.stopPropagation()}
        style={{ transform: `translate(${position.x}px, ${position.y}px)`, scrollbarWidth: 'thin', scrollbarColor: '#ffffff15 transparent', userSelect: isDragging ? 'none' : 'auto' }}
      >
        {/* Floating close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 md:top-3 md:right-3 z-[220] p-2.5 md:p-3 bg-red-600/20 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-2xl backdrop-blur-md border border-red-500/30"
        >
          <XIcon size={24} />
        </button>

        {/* ══════════════════════════════════════════════
            DRAG HANDLE — Modal'ı sürüklemek için tutun
        ══════════════════════════════════════════════ */}
        <div
          ref={handleRef}
          className="flex items-center justify-center px-4 py-1.5 bg-[#0d1218] border-b border-white/[0.04] cursor-grab active:cursor-grabbing hover:bg-[#0d1218]/80 transition-colors select-none"
          title="Sürüklemek için tutun · Çift tıklayın: sıfırla"
        >
          <div className="flex items-center gap-2 text-white/20">
            <div className="w-10 h-1 rounded-full bg-white/15" />
            <span className="text-[7px] font-black uppercase tracking-[0.2em]">sürükle</span>
            <div className="w-10 h-1 rounded-full bg-white/15" />
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 1 — TOP HEADER BAR
        ══════════════════════════════════════════════ */}
        <div className="flex items-center justify-between px-3 md:px-4 py-2.5 bg-[#0d1218] border-b border-white/[0.06]">
          {/* Left: Player identity */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {/* Rating badge */}
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/20 flex items-center justify-center shrink-0">
              <span className="text-[22px] font-display font-black italic text-amber-400 leading-none">{rating}</span>
            </div>
            <div>
              {/* Takım ismi - en üstte, her zaman görünür */}
              <div className="mb-0.5">
                {player.club || player.team_name ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-[0.15em] text-amber-300">
                    <Shield size={9} className="text-amber-400" />
                    {toTitleCase(player.club || player.team_name || '')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-white/[0.03] border border-white/10 text-[9px] font-black uppercase tracking-[0.15em] text-white/30">
                    Serbest Oyuncu
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">{toTitleCase(player.name)}</h1>
                {player.is_retiring && (
                  <span className="px-1.5 py-0.5 rounded-sm bg-red-500/20 border border-red-500/30 text-[8px] font-bold uppercase tracking-wider text-red-400 animate-pulse">
                    Emekli Olacak
                  </span>
                )}
                {onSign && (
                   <span className="px-1.5 py-0.5 rounded-sm bg-emerald-500/20 border border-emerald-500/30 text-[8px] font-bold uppercase tracking-wider text-emerald-400">
                    Keşfedilmiş Oyuncu
                   </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className={`px-1.5 py-px rounded-sm border text-[9px] font-bold uppercase tracking-wider ${posBg} ${posColor}`}>
                  {sp}
                </span>
                <span className="text-[9px] text-white/30 font-semibold">{localizePosFull(sp)}</span>
                {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                  <div className="flex items-center gap-1">
                    {player.secondaryPositions.map((sec: string, si: number) => {
                      const secG = getGroup(sec);
                      const secBadge = getPosBadgeStyle(secG);
                      const secColor = secBadge.split(' ').find(c => c.startsWith('text-')) || 'text-[#9B9B9B]';
                      const secBg = secBadge.split(' ').filter(c => !c.startsWith('text-')).join(' ');
                      return <span key={si} className={`px-1 py-px rounded-sm border text-[8px] font-bold uppercase tracking-wider ${secBg} ${secColor}`}>{sec} <span className="text-[7px] opacity-50">{localizePosFull(sec)}</span></span>;
                    })}
                    <span className="text-[7px] text-white/20 font-bold uppercase">yan</span>
                  </div>
                )}
                <span className="text-[10px] text-white/35 font-bold">{player.age || '—'} yaş</span>
                <span className="text-[10px] text-white/40 hidden md:inline">|</span>
                <div className="flex items-center gap-1">
                  <Ruler size={10} className="text-amber-500" />
                  <span className="text-[10px] text-amber-500/80 font-bold">{player.height || '—'} cm</span>
                </div>
                <span className="text-[10px] text-white/40 hidden md:inline">|</span>
                <div className="flex items-center gap-1 hidden md:flex">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{player.preferred_foot === 'Both' || player.preferred_foot === 'Her İki Ayak' ? 'Her İki Ayak' : (player.preferred_foot === 'Left' || player.preferred_foot === 'Sol' ? 'Sol Ayak' : 'Sağ Ayak')}</span>
                </div>
                <span className="text-[10px] text-white/40 hidden md:inline">|</span>
                <div className="flex items-center gap-1">
                  <Scale size={10} className="text-amber-500" />
                  <span className="text-[10px] text-amber-500/80 font-bold">{player.weight || '—'} kg</span>
                </div>
                {player.preferredFoot && (
                  <span className="text-[10px] text-white/25 hidden md:inline">| {player.preferredFoot}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Key info */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="text-right hidden md:block">
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/20 mb-0.5">Piyasa Değeri</div>
              <div className="text-[13px] font-black text-amber-400">{formatCurrency(marketValue)}</div>
            </div>
              <div className="text-right hidden md:block">
                <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/20 mb-0.5">Potansiyel</div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={12} 
                      className={star <= (player.scouting_stars || 0) ? "text-amber-400 fill-amber-400" : "text-white/10"} 
                    />
                  ))}
                </div>
              </div>
            <div className="text-right hidden md:block">
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/20 mb-0.5">Form</div>
              <div className={`text-[13px] font-black ${cap99(player.form || 50) >= 70 ? 'text-emerald-400' : cap99(player.form || 50) >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{cap99(player.form || 50)}%</div>
              {/* Mini sparkline in header */}
              {player.match_ratings && player.match_ratings.length > 0 && (
                <div className="flex items-end justify-end gap-px mt-1">
                  {player.match_ratings.slice(-5).map((r, i) => {
                    const h = Math.max(3, (r / 10) * 10);
                    const c = r >= 7 ? 'bg-emerald-500' : r >= 5 ? 'bg-yellow-500' : 'bg-red-500';
                    return <div key={i} className={`w-1 rounded-sm ${c}`} style={{ height: `${h}px`, opacity: 0.7 }} title={`${r.toFixed(1)}`} />;
                  })}
                </div>
              )}
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-sm border border-white/10 text-white/30 hover:text-white hover:border-white/30 transition-all ml-2">
              <XIcon size={14} />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 2 — TAB NAVIGATION + EYLEMLER
            DÜZELTME: Eylemler dropdown overflow-x-auto container
            içindeyken kırpılıyordu. Artık ayrı bir katmanda,
            overflow'dan etkilenmeden açılıyor.
        ══════════════════════════════════════════════ */}
        <div className="flex items-center bg-[#0d1218] border-b border-white/[0.06] relative">
          {/* Sekmeler — kaydırılabilir alan */}
          <div className="flex items-center gap-0 px-2 md:px-4 overflow-x-auto scrollbar-none flex-nowrap flex-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 md:px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] border-b-2 transition-all whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? 'text-white border-amber-500'
                    : 'text-white/30 border-transparent hover:text-white/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Eylemler butonu — overflow container DIŞINDA, sabit pozisyon */}
          {!marketListing && (
            <div ref={actionsRef} className="relative shrink-0 pr-2 md:pr-3">
              <button
                onClick={() => setShowActions(!showActions)}
                className="px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-[9px] font-bold uppercase tracking-[0.15em] rounded-sm transition-all flex items-center gap-2"
              >
                Eylemler <ChevronDown size={12} className={showActions ? 'rotate-180' : ''} />
              </button>
              {showActions && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-[#1a1e2a] border border-white/10 rounded-sm shadow-2xl z-[250] overflow-hidden">
                  <button
                    onClick={() => { setActiveTab('market'); setShowActions(false); if(isOwned) setSellPrice(corridor.min); }}
                    className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 text-white/70 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Target size={14} className={isOwned ? "text-emerald-400" : "text-amber-400"} />
                    {isOwned ? 'Transfer Listesine Koy' : 'Transfer Teklifi Yap'}
                  </button>
                  <button
                    onClick={() => {
                      toggleWatchlist(player);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 text-white/70 hover:text-white transition-all flex items-center gap-2 border-t border-white/5"
                  >
                    <Eye size={14} className={isWatched ? "text-amber-400" : "text-white/40"} />
                    {isWatched ? 'İzleme Listesinden Çıkar' : 'İzleme Listesine Ekle'}
                  </button>
                  {isOwned && (
                    <button
                      onClick={() => { setShowLoanForm(true); setShowActions(false); }}
                      className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 text-cyan-400/70 hover:text-cyan-300 transition-all flex items-center gap-2 border-t border-white/5"
                    >
                      <Globe size={14} className="text-cyan-400" />
                      Kiralık Olarak Gönder
                    </button>
                  )}
                  {isOwned && player.contract_end_week && (
                    <button
                      onClick={() => { setIsRenewingContract(true); setShowActions(false); }}
                      className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 text-emerald-400/70 hover:text-emerald-300 transition-all flex items-center gap-2 border-t border-white/5"
                    >
                      <FileText size={14} className="text-emerald-400" />
                      Sözleşme Uzat
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 3 — MAIN CONTENT (3-panel layout)
        ══════════════════════════════════════════════ */}
        {genelSection}

        {/* ══════════════════════════════════════════════
            SECTION 3B — Kişisel Bilgi TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'bilgi' && (
          <div className="p-4 md:p-6">
            <div className="max-w-[600px] mx-auto">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {[
                  { label: 'Piyasa Değeri', value: formatCurrency(marketValue), color: 'text-amber-400' },
                  { label: 'Gelişim Potansiyeli', value: `${potentialDiff >= 10 ? 'Yüksek' : potentialDiff >= 3 ? 'Orta' : 'Plato'}`, color: potentialDiff >= 10 ? 'text-emerald-400' : potentialDiff >= 3 ? 'text-yellow-400' : 'text-red-400' },
                  { label: 'Kişilik', value: (player.personality && typeof player.personality === 'object') ? getPersonalityLabel(player.personality as Record<string, number>) : (typeof player.personality === 'string' ? player.personality : 'Bilinmiyor'), color: 'text-white/70' },
                  { label: 'Arketip', value: player.archetype || 'Bilinmiyor', color: 'text-white/70' },
                  { label: 'Oyun Stili', value: playStyle?.name || 'Bilinmiyor', color: 'text-cyan-400' },
                  { label: 'Boy', value: `${player.height || 180} cm`, color: 'text-white/70' },
                  { label: 'Gol', value: `${player.goals ?? 0}`, color: 'text-white/70' },
                  { label: 'Asist', value: `${player.assists ?? 0}`, color: 'text-white/70' },
                  { label: 'Son Maç RT', value: player.last_match_rating?.toFixed(1) ?? '—', color: 'text-amber-400' },
                  { label: 'Kondisyon', value: `${cap99(player.cond || 100)}%`, color: cap99(player.cond || 100) >= 70 ? 'text-emerald-400' : 'text-red-400' },
                ].map(item => (
                  <div key={item.label} className="px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-sm">
                    <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/20 mb-1">{item.label}</div>
                    <div className={`text-[12px] font-bold ${item.color}`}>{item.value}</div>
                  </div>
                ))}
                {/* Form with visual match ratings graph */}
                <div className="px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-sm col-span-2">
                  <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/20 mb-1.5">Form</div>
                  <div className="flex items-center gap-3">
                    <div className={`text-[18px] font-black ${cap99(player.form || 50) >= 70 ? 'text-emerald-400' : cap99(player.form || 50) >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {cap99(player.form || 50)}%
                    </div>
                    {player.match_ratings && player.match_ratings.length > 0 && (
                      <div className="flex items-end gap-1 flex-1">
                        <span className="text-[7px] font-bold text-white/15 uppercase tracking-wider mr-1">Son 5 maç</span>
                        {player.match_ratings.slice(-5).map((rating, idx) => {
                          const barHeight = Math.max(8, (rating / 10) * 28);
                          const barColor = rating >= 7 ? 'bg-emerald-500' : rating >= 5 ? 'bg-yellow-500' : 'bg-red-500';
                          return (
                            <div key={idx} className="flex flex-col items-center gap-0.5">
                              <span className="text-[7px] font-mono font-bold text-white/40">{rating.toFixed(1)}</span>
                              <div
                                className={`w-5 rounded-sm ${barColor} transition-all`}
                                style={{ height: `${barHeight}px`, opacity: 0.8 }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 3C — PERFORMANS TAB
        ══════════════════════════════════════════════ */}
        {performansSection}

        {/* ══════════════════════════════════════════════
            SECTION 3D — İSTATİSTİKLER TAB
        ══════════════════════════════════════════════ */}
        {istatistiklerSection}

        {/* ══════════════════════════════════════════════
            SECTION — ANTRENMAN TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'antrenman' && (
          <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <Dumbbell className="text-emerald-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Bireysel Gelişim</h3>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Şahsi Antrenman Odak Noktası</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Focus Selection */}
              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 px-1">Geliştirilecek Özellik Seç</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Hız', key: 'speed' },
                    { label: 'Güç', key: 'power' },
                    { label: 'Pas', key: 'passing' },
                    { label: 'Şut', key: 'shooting' },
                    { label: 'Savunma', key: 'defending' },
                    { label: 'Vizyon', key: 'vision' },
                    { label: 'Top Kontrolü', key: 'control' },
                    { label: 'Kondisyon', key: 'stamina' },
                    { label: 'Kafa Topu', key: 'heading' },
                    { label: 'Kalecilik', key: 'goalkeeping' }
                  ].map(stat => {
                    const assignment = trainingState?.assignments?.find(a => a.playerId === player.id);
                    const isFocused = assignment?.focusedStat === stat.key;
                    
                    return (
                      <button
                        key={stat.key}
                        onClick={() => {
                          if (!trainingState || !onTrainingStateChange) return;
                          const assignments = trainingState.assignments || [];
                          const existing = assignments.find(a => a.playerId === player.id);
                          
                          let newAssignments;
                          if (existing) {
                            newAssignments = assignments.map(a => 
                              a.playerId === player.id ? { ...a, focusedStat: (isFocused ? undefined : stat.key as any) } : a
                            );
                          } else {
                            // If no assignment, create a basic one (defaulting to physical if needed, but FM usually needs a program)
                            // For simplicity, we'll assign them to 'fiziksel_yukleme' if they have none but want a focus
                            newAssignments = [...assignments, { 
                              playerId: player.id, 
                              programId: (player.position === 'GK' ? 'kaleci_antrenmani' : 'fiziksel_yukleme') as any, 
                              focusedStat: stat.key as any 
                            }];
                          }
                          
                          onTrainingStateChange({ ...trainingState, assignments: newAssignments });
                        }}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                          isFocused 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        <span className="text-[11px] font-bold uppercase">{stat.label}</span>
                        {isFocused && <TrendingUp size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Info */}
              <div className="p-6 bg-emerald-950/20 border border-emerald-500/10 rounded-[2rem] space-y-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/40">Mevcut Durum</div>
                {trainingState?.assignments?.find(a => a.playerId === player.id) ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center">
                        <Activity className="text-emerald-400" size={16} />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-white/90">Programda Aktif</div>
                        <div className="text-[9px] text-white/30 uppercase font-black">Genel Gelişim Sürüyor</div>
                      </div>
                    </div>
                    <p className="text-[10px] text-white/50 leading-relaxed italic">
                      &quot;Bu oyuncu şu an takım antrenman programına dahil. Seçtiğiniz odak noktası, antrenmanlardaki verimliliğini %25 oranında bu özelliğe kaydıracaktır.&quot;
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-amber-400/60">
                      <AlertTriangle className="animate-pulse" size={18} />
                      <div className="text-[11px] font-bold">PROGRAM DIŞI</div>
                    </div>
                    <p className="text-[10px] text-white/50 leading-relaxed italic">
                      &quot;Oyuncu herhangi bir antrenman programına dahil değil. Bireysel gelişim için önce bir program seçilmelidir.&quot;
                    </p>
                  </div>
                )  }
                
                <div className="pt-4 border-t border-white/5">
                  <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Gelişim Oranı</div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/40 w-[65%]" />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-white/20 font-black uppercase">Fizik: 65%</span>
                    <span className="text-[8px] text-white/20 font-black uppercase">Zihin: 40%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SECTION — MARKET TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'market' && (
          <div className="p-4 md:p-10 space-y-8">
            {/* TRANSFER OFFER HANDLING */}
            {player.transferOffer && (
              <div className="max-w-xl mx-auto mb-10 p-8 bg-amber-500/10 border border-amber-500/30 rounded-[3rem] animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-amber-500 rounded-[1.5rem] flex items-center justify-center shadow-lg">
                    <ShoppingCart size={32} className="text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Gelen Transfer Teklifi!</h3>
                    <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em]">{player.transferOffer.bidder} kulübünden resmi teklif.</p>
                  </div>
                </div>
                
                <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-8">
                   <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Bonservis Bedeli</div>
                   <div className="text-4xl font-black font-mono tracking-tighter italic text-amber-400">
                     {formatCurrency(player.transferOffer.amount)}
                   </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={async () => {
                       toastSuccess('Teklif Kabul Edildi! Oyuncu transfer süreci başlatıldı.');
                       // In a real app, we would update the DB here.
                       onClose();
                    }}
                    className="flex-1 bg-emerald-500 text-black py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl"
                  >
                    Kabul Et
                  </button>
                  <button 
                    onClick={() => {
                       toastWarning('Teklif Reddedildi.');
                       // Logic to clear offer could go here
                    }}
                    className="flex-1 bg-red-500/20 text-red-500 border border-red-500/30 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                  >
                    Reddet
                  </button>
                </div>
              </div>
            )}

            {onSign ? (
              <div className="max-w-xl mx-auto space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mx-auto w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center border border-emerald-500/20 rotate-12 mb-6">
                   <Footprints className="text-emerald-500" size={48} />
                </div>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter">Sözleşme Görüşmesi</h3>
                <p className="text-xs font-bold text-white/30 uppercase tracking-[0.4em]">Yeni Yetenek İmzala</p>

                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5">
                   <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Talep Edilen İmza Parası</div>
                   <div className="text-4xl font-black font-mono tracking-tighter italic text-emerald-400">
                     {formatCurrency(marketValue * 0.5)}
                   </div>
                   <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.2em] mt-4">
                     Scout ekibimiz bu oyuncu ile ön görüşme yaptı ve makul bir imza parası karşılığında katılmaya hazır.
                   </p>
                </div>

                <button 
                  onClick={() => onSign(player)}
                  disabled={profileMoney !== undefined && profileMoney < (marketValue * 0.5)}
                  className="w-full bg-emerald-500 text-black py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                  {profileMoney !== undefined && profileMoney < (marketValue * 0.5) ? 'YETERSİZ BAKİYE' : 'SÖZLEŞMEYİ İMZALA'}
                </button>
              </div>
            ) : marketListing ? (
              /* BUYING CONTEXT */
              <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-4">
                  <div className={`mx-auto w-24 h-24 rounded-[2rem] flex items-center justify-center border rotate-12 mb-6 ${marketListing.is_auction ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                    {marketListing.is_auction ? <Gavel className="text-amber-500" size={48} /> : <ShoppingCart className="text-emerald-500" size={48} />}
                  </div>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter">
                    {marketListing.is_auction ? 'Açık Artırma' : 'Transfer Görüşmesi'}
                  </h3>
                  <p className="text-xs font-bold text-white/30 uppercase tracking-[0.4em]">Global Oyuncu Pazarı</p>
                </div>

                {/* Badges: seller / highest bidder */}
                <div className="flex justify-center gap-3">
                  {isSeller && (
                    <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-[9px] font-black uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
                      <User size={12} /> SENİN İLANIN
                    </span>
                  )}
                  {isHighestBidder && !isSeller && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest text-emerald-300 flex items-center gap-1.5">
                      <Star size={12} className="fill-emerald-300" /> EN YÜKSEK TEKLİF: SEN
                    </span>
                  )}
                </div>

                {marketListing.is_auction ? (
                  /* ═══ AUCTION UI ═══ */
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-amber-500/10 p-5 rounded-[2rem] border border-amber-500/20 flex flex-col items-center gap-2">
                        <Gavel size={18} className="text-amber-500" />
                        <div className="text-[9px] font-black uppercase text-amber-500/50 tracking-widest">En Yüksek Teklif</div>
                        <div className="text-2xl font-black font-mono tracking-tighter italic text-amber-400">
                          {(marketListing.current_bid ?? marketListing.price) > 0 ? formatCurrency(marketListing.current_bid ?? marketListing.price) : '—'}
                        </div>
                        <div className="text-[8px] font-bold text-white/25 uppercase">
                          {(marketListing.current_bid ?? 0) <= 0 ? 'Henüz teklif yok' : `Teklifçi: ${marketListing.highest_bidder_name || 'Anonim'}`}
                        </div>
                      </div>
                      <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex flex-col items-center gap-2">
                        <Timer size={18} className={auctionTimeLeft === 'Sona Erdi' ? 'text-red-400' : 'text-white/40'} />
                        <div className="text-[9px] font-black uppercase text-white/20 tracking-widest">Kalan Süre</div>
                        <div className={`text-2xl font-black font-mono tracking-tighter italic ${auctionTimeLeft === 'Sona Erdi' ? 'text-red-400' : 'text-white/90'}`}>
                          {auctionTimeLeft || '—'}
                        </div>
                        <div className="text-[8px] font-bold text-white/25 uppercase">Gerçek zamanlı</div>
                      </div>
                      <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex flex-col items-center gap-2">
                        <Activity size={18} className="text-white/40" />
                        <div className="text-[9px] font-black uppercase text-white/20 tracking-widest">Teklif Sayısı</div>
                        <div className="text-2xl font-black font-mono tracking-tighter italic text-white/90">
                          {marketListing.bid_count ?? 0}
                        </div>
                        <div className="text-[8px] font-bold text-white/25 uppercase">Kişi</div>
                      </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-[8px] font-bold text-white/30 uppercase">Başlangıç Fiyatı</div>
                        <div className="text-sm font-black text-white/70 font-mono">{formatCurrency(marketListing.price)}</div>
                      </div>
                      {marketListing.max_price && (
                        <div className="text-right">
                          <div className="text-[8px] font-bold text-white/30 uppercase">Hemen Al Bedeli</div>
                          <div className="text-sm font-black text-amber-400 font-mono">{formatCurrency(marketListing.max_price)}</div>
                        </div>
                      )}
                    </div>

                    {/* Seller info */}
                    <div className="text-[8px] font-bold text-white/25 uppercase tracking-widest text-center">
                      Satıcı: {marketListing.seller_id === 'free-agent-system' ? 'SERBEST OYUNCU' : marketListing.seller_name}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-4">
                      {!isSeller && !isHighestBidder && (
                        <button
                          onClick={async () => {
                            setIsBuying(true);
                            try {
                              await onBid?.(marketListing);
                            } finally {
                              setIsBuying(false);
                            }
                          }}
                          disabled={isBuying || auctionTimeLeft === 'Sona Erdi'}
                          className="flex-[2] bg-amber-500 text-black py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 disabled:opacity-20 disabled:grayscale transition-all shadow-[0_20px_50px_rgba(245,158,11,0.2)] flex items-center justify-center gap-3"
                        >
                          {isBuying ? <Activity className="animate-spin" size={18} /> : 'TEKLİF VER'}
                        </button>
                      )}
                      {!isSeller && isHighestBidder && (
                        <div className="flex-[2] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                          <Star size={16} className="fill-emerald-400" /> EN YÜKSEK TEKLİF SAHİBİSİN
                        </div>
                      )}
                      {isSeller && (
                        <button
                          onClick={async () => {
                            setIsBuying(true);
                            try {
                              await onBuy?.(marketListing);
                            } finally {
                              setIsBuying(false);
                            }
                          }}
                          disabled={isBuying}
                          className="flex-[2] bg-red-500/20 border border-red-500/30 text-red-400 py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white disabled:opacity-20 disabled:grayscale transition-all flex items-center justify-center gap-3"
                        >
                          {isBuying ? <Activity className="animate-spin" size={18} /> : <><XCircle size={18} /> İPTAL ET</>}
                        </button>
                      )}
                    </div>

                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em] text-center max-w-sm mx-auto leading-relaxed">
                      Teklif verdikten sonra en yüksek teklif sahibi olarak kalırsanız, açık artırma sonunda oyuncu kadronuza eklenir.
                    </p>
                  </>
                ) : (
                  /* ═══ DIRECT BUY UI (original) ═══ */
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 group hover:border-white/10 transition-all">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Satış Fiyatı</div>
                        <div className="text-3xl font-black font-mono tracking-tighter italic text-white/90">{formatCurrency(marketListing.price)}</div>
                        <div className="text-[8px] font-bold text-white/30 uppercase mt-2">Satıcı: {marketListing.seller_id === 'free-agent-system' ? 'SERBEST OYUNCU' : marketListing.seller_name}</div>
                      </div>
                      <div className="bg-amber-500/10 p-6 rounded-[2rem] border border-amber-500/20 group hover:border-amber-500/30 transition-all">
                        <div className="text-[10px] font-black uppercase tracking-widest text-amber-500/40 mb-2">Maksimum Limit</div>
                        <div className="text-3xl font-black font-mono tracking-tighter italic text-amber-400">{formatCurrency(marketListing.max_price || marketListing.price * 1.5)}</div>
                        <div className="text-[8px] font-bold text-amber-500/30 uppercase mt-2">Hemen Al Bedeli</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center gap-2">
                        <div className="text-[9px] font-black uppercase text-white/20 tracking-widest">Kondisyon</div>
                        <div className="text-xl font-black italic">{player.cond || 100}%</div>
                      </div>
                      <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center gap-2">
                        <div className="text-[9px] font-black uppercase text-white/20 tracking-widest">Yaş</div>
                        <div className="text-xl font-black italic">{player.age}</div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={async () => {
                          setIsBuying(true);
                          try {
                            await onBuy?.(marketListing);
                          } finally {
                            setIsBuying(false);
                          }
                        }}
                        disabled={isBuying || (profileMoney !== undefined && profileMoney < marketListing.price)}
                        className="flex-[2] bg-emerald-500 text-black py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 disabled:opacity-20 disabled:grayscale transition-all shadow-[0_20px_50px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3"
                      >
                        {isBuying ? <Activity className="animate-spin" size={18} /> : (profileMoney !== undefined && profileMoney < marketListing.price ? 'YETERSİZ BAKİYE' : 'HEMEN SATIN AL')}
                      </button>
                    </div>

                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em] text-center max-w-sm mx-auto leading-relaxed">
                      Oyuncuyu satın aldığınızda bonservis bedeli anında hesabınızdan düşülür ve oyuncu kadronuza eklenir.
                    </p>
                  </>
                )}
              </div>
            ) : (
              /* SELLING/OFFER CONTEXT */
              <div className="text-center space-y-8">
                <div className={`mx-auto w-24 h-24 rounded-2xl flex items-center justify-center border rotate-12 ${isOwned ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                   <Target className={isOwned ? "text-emerald-500" : "text-amber-500"} size={48} />
                </div>
                
                <div className="space-y-3">
                   <h3 className="text-3xl font-black italic uppercase tracking-tighter">{isOwned ? 'Global Transfer Listesi' : 'Resmi Transfer Teklifi'}</h3>
                   {!isOwned && (
                     <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Bu oyuncu şu an {player.club || 'başka bir takım'} kadrosunda yer alıyor.</p>
                   )}
                   <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                     <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                       <div className="text-[8px] font-bold text-white/30 uppercase mb-1">Piyasa Değeri</div>
                       <div className="text-sm font-black text-white/80">{formatCurrency(marketValue)}</div>
                     </div>
                     <div className="px-4 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                       <div className="text-[8px] font-bold text-emerald-500/50 uppercase mb-1">{isOwned ? 'Min. Satış (Baz)' : 'Önerilen Min. Teklif'}</div>
                       <div className="text-sm font-black text-emerald-400">{formatCurrency(corridor.min)}</div>
                     </div>
                     {!isOwned && (
                       <div className="px-4 py-2 bg-amber-500/5 rounded-xl border border-amber-500/10">
                         <div className="text-[8px] font-bold text-amber-500/50 uppercase mb-1">Maks. Teklif</div>
                         <div className="text-sm font-black text-amber-400">{formatCurrency(corridor.max)}</div>
                       </div>
                     )}
                   </div>
                   <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
                      {isOwned 
                        ? 'Piyasa dengesini korumak için her oyuncunun bir "Koridor Fiyatı" vardır. Bu aralık dışındaki teklifler sistemsel olarak engellenir.'
                        : 'Kulüp yönetimine sunacağınız teklif, oyuncunun mevcut piyasa değeri ve kulübün stratejik hedefleri doğrultusunda değerlendirilecektir.'}
                   </p>
                </div>
                
                <div className="max-w-xs mx-auto space-y-6">
                   <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{isOwned ? 'Talep Edilecek Bonservis' : 'Teklif Edilecek Tutar'}</span>
                        <span className="text-[9px] font-mono font-bold text-white/20">ARALIK: {formatCurrency(corridor.min)} - {formatCurrency(corridor.max)}</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number"
                          value={sellPrice || ''}
                          onChange={(e) => setSellPrice(Number(e.target.value))}
                          placeholder={isOwned ? "Bedel giriniz..." : "Teklif giriniz..."}
                          className={`w-full bg-black border ${sellPrice > corridor.max || (sellPrice > 0 && sellPrice < corridor.min) ? 'border-red-500/50' : 'border-white/10'} rounded-xl py-4 px-6 text-center font-mono text-2xl font-black text-emerald-400 focus:border-emerald-500 transition-all outline-none`}
                        />
                        {sellPrice > corridor.max && (
                          <div className="absolute -bottom-6 left-0 right-0 text-[9px] text-red-400 font-bold uppercase tracking-wider">
                            {isOwned ? 'MAKSİMUM FİYAT LİMİTİ AŞILDI!' : 'KULÜP BU TUTARI KABUL ETMEYECEK KADAR YÜKSEK!'}
                          </div>
                        )}
                      </div>
                   </div>

                   <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05] text-left space-y-2">
                     <div className="text-[8px] font-black uppercase tracking-wider text-white/40">{isOwned ? 'AÇIK ARTIRMA ANALİZİ' : 'TEKLİF ANALİZİ'}</div>
                     <div className="text-[9px] text-white/60 leading-relaxed italic">
                       {isOwned 
                         ? `&quot;Bu oyuncu ${rating} KG ve ${player.traits?.length || 0} özel yeteneğe sahip. ${player.age < 23 ? 'Genç yetenek primi' : player.age >= 30 ? 'Tecrübe/Yaş dengesi' : 'Piyasa ortalaması'} dahilinde ${formatCurrency(sellPrice)} bedelle açık artırmaya çıkacak. Tahmini piyasa değeri: ${formatCurrency(marketValue)} (Koridor: ${formatCurrency(corridor.min)} – ${formatCurrency(corridor.max)}).&quot;`
                         : `&quot;${player.name} için yapacağınız ${formatCurrency(sellPrice)} tutarındaki teklif, kulübünün beklentilerini ${sellPrice > marketValue * 1.2 ? 'fazlasıyla karşılıyor' : 'karşılayabilir'}. Onaylanması durumunda oyuncu en geç 24 saat içinde kadronuza katılır.&quot;`}
                     </div>
                   </div>

                   {/* Auction notice for owned players */}
                   {isOwned && (
                     <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 flex items-start gap-2">
                       <Gavel size={14} className="text-amber-500 shrink-0 mt-0.5" />
                       <div className="text-[9px] text-amber-400/80 leading-relaxed">
                         <span className="font-black uppercase tracking-wider">Açık Artırma Modu</span><br />
                         Oyuncu açık artırmaya çıkacak. 4 saat sürecektir. En yüksek teklif sahibi oyuncuyu alır.
                       </div>
                     </div>
                   )}

                   <button 
                    onClick={async () => {
                      if (sellPrice < corridor.min || sellPrice > corridor.max) {
                        toastWarning(`Lütfen ${formatCurrency(corridor.min)} ile ${formatCurrency(corridor.max)} arasında bir değer giriniz.`);
                        return;
                      }
                      
                      if (!isOwned) {
                         toastInfo(`Teklifiniz ${player.club} kulübüne iletilmiştir. Onur bey değerlendirme yapacak.`);
                         onClose();
                         return;
                      }

                      setIsSelling(true);
                      try {
                        await onSell?.(player, sellPrice);
                      } finally {
                        setIsSelling(false);
                      }
                    }}
                    disabled={!sellPrice || sellPrice < corridor.min || sellPrice > corridor.max || isSelling}
                    className={`w-full py-5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${
                      isOwned 
                        ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20' 
                        : 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20'
                    } disabled:opacity-20 disabled:grayscale`}
                   >
                     {isSelling ? (
                       <Activity className="animate-spin" size={16} />
                     ) : (
                       isOwned ? <><Gavel size={16} /> AÇIK ARTIRMAYA GÖNDER</> : 'RESMİ TEKLİFİ İLET'
                     )}
                   </button>

                   {/* ─── KİRALIK LİSTESİNE GÖNDER BUTONU ─── */}
                   {isOwned && (
                     <div className="pt-2">
                       <div className="flex items-center gap-3 mb-3">
                         <div className="flex-1 h-px bg-white/[0.06]" />
                         <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">veya</span>
                         <div className="flex-1 h-px bg-white/[0.06]" />
                       </div>
                       <button
                         onClick={() => setShowLoanForm(true)}
                         className="w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 bg-cyan-500/15 border-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 hover:border-cyan-500/50 hover:text-cyan-300 shadow-cyan-500/10"
                       >
                         <Globe size={16} />
                         KİRALIK LİSTESİNE GÖNDER
                       </button>
                       <p className="text-[8px] text-cyan-400/40 font-bold uppercase tracking-wider text-center mt-2">
                         Oyuncuyu kiralık pazara çıkarın · 10 KR komisyon kiracıdan alınır
                       </p>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════ */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#080c12] border-t border-white/[0.06]">
          <div className="flex items-center gap-3 text-[8px] text-white/20">
            <span><span className="text-white/40 font-bold">{player.goals ?? 0}</span> Gol</span>
            <span className="text-white/8">|</span>
            <span><span className="text-white/40 font-bold">{player.assists ?? 0}</span> Asist</span>
            <span className="text-white/8">|</span>
            <span>Son RT: <span className="text-amber-400/70 font-bold">{player.last_match_rating?.toFixed(1) ?? '—'}</span></span>
          </div>
          <button onClick={onClose} className="px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-sm text-[8px] font-bold uppercase tracking-[0.2em] text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition-all">
            Kapat
          </button>
        </div>

        {/* ══════════════════════════════════════════════
            LOAN CONFIRMATION MODAL — Kiralık Pazarına Gönder
        ══════════════════════════════════════════════ */}
        {showLoanForm && isOwned && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            onClick={() => setShowLoanForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#111820] border border-cyan-500/20 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-[0_0_80px_rgba(0,200,255,0.08)]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                    <Globe size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400">Kiralık Pazarına Gönder</h3>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">{toTitleCase(player.name)} • {sp} • {rating} OVR</p>
                  </div>
                </div>
                <button onClick={() => setShowLoanForm(false)} className="p-2 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  <XIcon size={18} />
                </button>
              </div>

              {/* Description */}
              <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-white/60 leading-relaxed">
                    Oyuncunuz kiralık pazarına çıkacak. Diğer takımlar bu oyuncuyu kiralayabilir.
                    Kiralama gerçekleştiğinde{' '}<span className="text-cyan-400 font-bold">10 Kredi</span>{' '}sistem komisyonu olarak kiracıdan düşülecek.
                    <span className="text-cyan-400 font-bold"> Kiralık ücret (Euro)</span>{' '}kiralanan takıma ödenecek.
                  </p>
                </div>
              </div>

              {/* Daily Rental Fee Input (Euro) */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">
                  Günlük Kiralık Ücret (Euro)
                </label>
                <input
                  type="number"
                  value={loanFeeEuro}
                  onChange={(e) => setLoanFeeEuro(Number(e.target.value))}
                  min={0}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-base font-black text-cyan-400 focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/10"
                  placeholder="Günlük ücret girin..."
                />
                <div className="flex gap-1.5">
                  {[0.10, 0.15, 0.20, 0.30].map(pct => {
                    const suggested = calculateLoanFeeEuro(marketValue, 1, pct);
                    return (
                      <button
                        key={pct}
                        onClick={() => setLoanFeeEuro(suggested)}
                        className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-wider rounded-lg border border-white/5 transition-all text-white/50 hover:text-white/80"
                      >
                        %{Math.round(pct * 100)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration Input (Weeks) */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">
                  Süre (Hafta)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={34}
                    value={loanWeeks}
                    onChange={(e) => setLoanWeeks(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex items-center gap-1.5 min-w-[70px] justify-end">
                    <input
                      type="number"
                      min={1}
                      max={34}
                      value={loanWeeks}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (v >= 1 && v <= 34) setLoanWeeks(v);
                      }}
                      className="w-12 bg-black/50 border border-white/10 rounded-lg p-1.5 text-center text-sm font-black text-cyan-400 focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                    <span className="text-[9px] text-white/30 font-bold">hafta</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowLoanForm(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={async () => {
                    if (!profileId) {
                      toastError('Profil ID bulunamadı. Lütfen sayfayı yenileyin.');
                      return;
                    }
                    if (!player.id) {
                      toastError('Oyuncu ID bulunamadı.');
                      return;
                    }
                    if (loanFeeEuro <= 0) {
                      toastError('Kiralık ücret sıfırdan büyük olmalıdır.');
                      return;
                    }
                    setIsSendingLoan(true);
                    try {
                      const res = await fetch('/api/rental/list', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          playerId: player.id,
                          ownerTeamId: profileId,
                          dailyCost: loanFeeEuro,
                          durationWeeks: loanWeeks,
                        }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        toastSuccess(`${toTitleCase(player.name)} kiralık pazarına çıkarıldı!`);
                        setShowLoanForm(false);
                        // Refresh rental market data
                        window.dispatchEvent(new CustomEvent('rental-market-updated'));
                      } else {
                        const debugInfo = data.debug ? ` (${data.debug})` : '';
                        toastError(data.userMessage || data.error || 'Kiralık pazara çıkarılamadı.' + debugInfo);
                      }
                    } catch (err) {
                      console.error('[Loan] Exception:', err);
                      toastError('Bir hata oluştu. Lütfen tekrar deneyin.');
                    } finally {
                      setIsSendingLoan(false);
                    }
                  }}
                  disabled={isSendingLoan}
                  className="flex-1 py-3 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSendingLoan ? (
                    <>
                      <div className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Globe size={14} />
                      Onayla
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Sözleşme Uzatma Modal ── */}
        {isRenewingContract && isOwned && player.contract_end_week && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            onClick={() => setIsRenewingContract(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#111820] border border-emerald-500/20 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-[0_0_80px_rgba(0,200,100,0.08)]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <FileText size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400">Sözleşme Uzat</h3>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">{toTitleCase(player.name)} • {sp} • {rating} OVR</p>
                  </div>
                </div>
                <button onClick={() => setIsRenewingContract(false)} className="p-2 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  <XIcon size={18} />
                </button>
              </div>

              {/* Current Contract Info */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/60 leading-relaxed">
                      Mevcut sözleşme: <span className="text-emerald-400 font-bold">Hafta {player.contract_end_week}</span>'e kadar geçerli.
                    </p>
                    <p className="text-[10px] text-white/40 leading-relaxed mt-1">
                      Haftalık maaş: <span className="text-white/70 font-bold">{((player.salary || 0) / 1000).toFixed(0)}K €</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Renewal Duration */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">
                  Uzatma Süresi (Hafta)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={34}
                    defaultValue={17}
                    id="contract-renew-weeks"
                    className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex items-center gap-1.5 min-w-[70px] justify-end">
                    <span className="text-sm font-black text-emerald-400" id="contract-renew-weeks-display">17</span>
                    <span className="text-[9px] text-white/30 font-bold">hafta</span>
                  </div>
                </div>
                <div className="flex justify-between text-[8px] text-white/20">
                  <span>1 Hafta</span>
                  <span>17 Hafta (Yarım Sezon)</span>
                  <span>34 Hafta (Tam Sezon)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setIsRenewingContract(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={async () => {
                    const weeksInput = document.getElementById('contract-renew-weeks') as HTMLInputElement;
                    const renewWeeks = Number(weeksInput?.value || 17);
                    if (!profileId || !player.id) {
                      toastError('Profil veya oyuncu ID bulunamadı.');
                      return;
                    }
                    try {
                      const supabaseModule = await import('@/lib/supabase');
                      const { getSupabase } = supabaseModule;
                      const supabase = getSupabase();
                      if (!supabase) {
                        toastError('Veritabanı bağlantısı kurulamadı.');
                        return;
                      }
                      const newEndWeek = (player.contract_end_week || 0) + renewWeeks;
                      const { error: updateErr } = await supabase
                        .from('players')
                        .update({ contract_end_week: newEndWeek })
                        .eq('id', player.id);
                      if (updateErr) {
                        toastError('Sözleşme uzatma başarısız: ' + updateErr.message);
                      } else {
                        setPlayer(prev => ({ ...prev, contract_end_week: newEndWeek }));
                        toastSuccess(`${toTitleCase(player.name)} sözleşmesi ${newEndWeek}. haftaya kadar uzatıldı!`);
                        setIsRenewingContract(false);
                      }
                    } catch (err) {
                      console.error('[Contract Renew] Error:', err);
                      toastError('Bir hata oluştu. Lütfen tekrar deneyin.');
                    }
                  }}
                  className="flex-1 py-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={14} />
                  Sözleşmeyi Uzat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
