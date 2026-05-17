'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  X as XIcon, Star, ChevronDown, ChevronRight, User, Activity,
  Target, Shield, Footprints, ShoppingCart, BarChart2, Dumbbell, TrendingUp, AlertTriangle, Zap,
  Ruler, Scale, Eye, Gavel, Timer, XCircle
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from 'recharts';
import { calculateMarketValue, getTransferCorridor, formatCurrency } from '@/lib/fm/valuation';
import { getPerformanceStats } from '@/lib/fm/engine';
import { traitDescriptions, getTraitTierLabel } from '@/lib/fm/traits';
import { TRAIT_LEVELS } from '@/lib/fm/traitsData';
import { useFM } from '@/lib/fm/GameContext';
import { getPlayStyleEffect } from '@/lib/fm/playStyles';
import { localizePos, getPosGroup, getPosDotColor, getPosBadgeStyle } from '@/lib/fm/ui-helpers';
import { POS_TO_GROUP, POS_LABELS } from '@/lib/fm/playerGenerator';
import { fmStatColor, fmStatBg, formatMoney, cap99, toTitleCase } from '@/lib/fm/ui-helpers';
import type { Player, TrainingState } from '@/lib/fm/types';
import type { MarketListing } from '@/lib/fm/multiplayer';
import PlayerStatsTab from './PlayerStatsTab';

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
  isAdmin?: boolean;
}

// ──────────── Helpers ────────────
const clamp = (base: number, mult: number) => cap99(base * mult);

const deriveStats = (player: Player, perf: ReturnType<typeof getPerformanceStats>) => {
  const base = {
    // Teknik — ÖNCELİKLE YENİ SPESİFİK ALANLAR, YOKSA ESKİ ALANLAR
    pas: cap99(player.passing || 50),
    sut: cap99(player.finishing || player.shooting || 50),
    topKontrol: cap99(player.firstTouch || player.control || 50),
    kalecilik: cap99(player.goalkeeping ?? (player.position === 'GK' ? player.rating || 65 : 10)),
    kurtaris: cap99(player.goalkeeping ?? (player.position === 'GK' ? (player.rating || 65) * 0.95 : 10)),
    tekik: cap99(player.technique || player.control || 50),
    dribling: cap99(player.dribbling || player.control || 50),
    ortayapma: cap99(player.crossing || player.passing || 50),
    topKapma: cap99(player.tackling || player.defending || 50),
    kafaVurusu: cap99(player.heading || player.power || 50),
    uzaktanSut: cap99(player.longShots || player.shooting || 50),
    markaj: cap99(player.marking || player.defending || 50),
    bitiricilik: cap99(player.finishing || player.shooting || 50),
    ilkKontrol: cap99(player.firstTouch || player.control || 50),
    // Zihinsel — HER STAT KENDİ ALANINDAN
    algı: cap99(player.anticipation || 50),
    vizyon: cap99(player.vision || 50),
    kararAlma: cap99(player.decisions || 50),
    pozisyonAlma: cap99(player.positioning || 50),
    soggukkanlilik: cap99(player.composure || 50),
    caliskanlik: cap99(player.workRate || 50),
    takimOyunu: cap99(player.teamwork || 50),
    liderlik: cap99(player.leadership || 50),
    onsez: cap99(player.anticipation || 50),
    ozelYetenek: cap99(player.flair || 20),
    kararllik: cap99(player.determination || 50),
    konsantrasyon: cap99(player.concentration || 50),
    agresiflik: cap99(player.aggression || 40),
    cesaret: cap99(player.bravery || 40),
    // Fiziksel — HER STAT KENDİ ALANINDAN
    hiz: cap99(player.speed || 50),
    hizlanma: cap99(player.acceleration || player.speed || 50),
    guc: cap99(player.strength || player.power || 50),
    dayaniklilik: cap99(player.stamina || player.cond || 50),
    ceviklik: cap99(player.agility || 50),
    denge: cap99(player.balance || 50),
    ziplama: cap99(player.jumping || player.power || 50),
    kondisyon: cap99(player.cond || 75),
    // Ayaklar
    sagAyak: cap99(player.rightFoot || (player.preferred_foot === 'Right' ? 100 : 50)),
    solAyak: cap99(player.leftFoot || (player.preferred_foot === 'Left' ? 100 : 50)),
    // Mücadele
    mudahale: cap99(player.tackling || player.defending || 50),
  };
  return base;
};

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
// ═══ Mini saha mevki noktası ═══
function PitchPositionDot({ position, specificPosition }: { position?: string; specificPosition?: string }) {
  const sp = (specificPosition || position || 'CM') as string;
  const group = POS_TO_GROUP[sp as keyof typeof POS_TO_GROUP] || position || 'MID';

  // X pozisyonu (yakın: GK 8%, DEF 25%, MID 50%, FWD 75%)
  // Y pozisyonu (sol: L* 20%, merkez: 50%, sağ: R* 80%)
  let leftPct = 50;
  let topPct = 50;

  // GK her zaman kale
  if (sp === 'GK') {
    leftPct = 8; topPct = 50;
  }
  // Defans
  else if (sp === 'CB') { leftPct = 25; topPct = 50; }
  else if (sp === 'LB' || sp === 'LWB') { leftPct = 22; topPct = 18; }
  else if (sp === 'RB' || sp === 'RWB') { leftPct = 22; topPct = 82; }
  // Orta saha
  else if (sp === 'CDM') { leftPct = 38; topPct = 50; }
  else if (sp === 'CM') { leftPct = 50; topPct = 50; }
  else if (sp === 'CAM') { leftPct = 62; topPct = 50; }
  else if (sp === 'LM') { leftPct = 50; topPct = 18; }
  else if (sp === 'RM') { leftPct = 50; topPct = 82; }
  else if (sp === 'LW') { leftPct = 62; topPct = 18; }
  else if (sp === 'RW') { leftPct = 62; topPct = 82; }
  // Forvet
  else if (sp === 'CF') { leftPct = 72; topPct = 50; }
  else if (sp === 'ST') { leftPct = 82; topPct = 50; }
  // Eski broad position fallback
  else if (group === 'GK') { leftPct = 8; topPct = 50; }
  else if (group === 'DEF') { leftPct = 25; topPct = 50; }
  else if (group === 'MID') { leftPct = 50; topPct = 50; }
  else if (group === 'FWD') { leftPct = 80; topPct = 50; }

  const colorClass = getPosDotColor(group);

  const label = POS_LABELS[sp] || POS_LABELS[group] || sp;

  return (
    <>
      <div
        className={`absolute w-3.5 h-3.5 rounded-full border-2 border-white/60 shadow-lg shadow-black/50 ${colorClass}`}
        style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: 'translate(-50%, -50%)' }}
      />
      <div
        className="absolute text-[7px] font-bold text-white/80 whitespace-nowrap pointer-events-none"
        style={{ left: `${leftPct}%`, top: `calc(${topPct}% + 10px)`, transform: 'translateX(-50%)' }}
      >
        {sp}
      </div>
    </>
  );
}

export default function PlayerDetailModal({ 
  player: initialPlayer, onClose, teamStats, onSell, marketListing, onBuy, onBid, onSign, trainingState, onTrainingStateChange, profileMoney, profileTeamName, isAdmin 
}: PlayerDetailModalProps) {
  const { scoutPlayer, watchlist, toggleWatchlist } = useFM();
  const [player, setPlayer] = useState<Player>(initialPlayer);
  const [activeTab, setActiveTab] = useState<'genel' | 'bilgi' | 'performans' | 'istatistikler' | 'market' | 'antrenman'>(marketListing ? 'market' : 'genel');

  // Keep local state in sync
  React.useEffect(() => {
    setPlayer(initialPlayer);
  }, [initialPlayer]);

  const isOwned = profileTeamName && player.club === profileTeamName;
  const isScouted = player.scouted || isAdmin || isOwned;
  const [showActions, setShowActions] = useState(false);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [isSelling, setIsSelling] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

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
  const potential = cap99(player?.potential || 70);
  const perf = getPerformanceStats(player, true, teamStats || {});
  const playStyle = getPlayStyleEffect(player?.playStyle || '');
  const marketValue = calculateMarketValue(player);
  const corridor = getTransferCorridor(marketValue);
  const potentialDiff = potential - rating;
  const stats = deriveStats(player, perf);
  
  const isWatched = watchlist?.includes(player.id);

  // Use real data if available, fallback to derived (derived is now based on new fields if I update deriveStats, but let's just use fields directly)
  const mentalData = {
    algı: player.anticipation || stats.algı,
    vizyon: player.vision || stats.vizyon,
    kararAlma: player.decisions || stats.kararAlma,
    pozisyonAlma: player.positioning || stats.pozisyonAlma,
    soggukkanlilik: player.composure || stats.soggukkanlilik,
    caliskanlik: player.workrate || stats.caliskanlik,
    takimOyunu: player.teamwork || stats.takimOyunu,
    liderlik: player.leadership || stats.liderlik,
    onsez: player.anticipation || stats.onsez,
    ozelYetenek: player.flair || stats.ozelYetenek,
    kararllik: player.determination || stats.kararllik,
    konsantrasyon: player.concentration || stats.konsantrasyon,
    agresiflik: player.aggression || stats.agresiflik,
    cesaret: player.bravery || stats.cesaret,
  };

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
  const sp = player.specificPosition || player.position || 'CM';
  const isGK = player.position === 'GK' || sp === 'GK';

  // Technical or Goalkeeping
  const technicalStats: { label: string; val: number }[] = isGK ? [
    { label: 'Refleksler', val: player.goalkeeping || stats.kurtaris },
    { label: 'Top Tutma', val: cap99((player.goalkeeping || stats.kurtaris) * 0.95) },
    { label: 'Bire Bir', val: cap99((player.goalkeeping || stats.kurtaris) * 1.05) },
    { label: 'Hava Hakimiyeti', val: player.jumping || stats.ziplama },
    { label: 'Alan Hakimiyeti', val: player.positioning || stats.pozisyonAlma },
    { label: 'Degaj', val: player.passing || stats.pas },
    { label: 'Elle Oyun', val: cap99((player.passing || stats.pas) * 1.1) },
    { label: 'İletişim', val: player.leadership || stats.liderlik },
    { label: 'Konsantrasyon', val: player.concentration || stats.konsantrasyon },
    { label: 'Çeviklik', val: player.agility || stats.ceviklik },
  ] : [
    { label: 'Bitiricilik', val: player.finishing || stats.bitiricilik },
    { label: 'Dribbling', val: player.dribbling || stats.dribling },
    { label: 'İlk Kontrol', val: player.firstTouch || stats.topKontrol },
    { label: 'Kafa Vuruşu', val: player.heading || stats.kafaVurusu },
    { label: 'Markaj', val: player.marking || stats.markaj },
    { label: 'Orta Yapma', val: player.crossing || stats.ortayapma },
    { label: 'Pas', val: player.passing || stats.pas },
    { label: 'Teknik', val: player.technique || stats.tekik },
    { label: 'Top Kapma', val: player.tackling || stats.topKapma },
    { label: 'Uzaktan Şut', val: player.longShots || stats.uzaktanSut },
  ];

  // Mental
  const mentalStats: { label: string; val: number }[] = [
    { label: 'Agresiflik', val: player.aggression || stats.agresiflik },
    { label: 'Cesaret', val: player.bravery || stats.cesaret },
    { label: 'Çalışkanlık', val: player.workRate || stats.caliskanlik },
    { label: 'Karar Alma', val: player.decisions || stats.kararAlma },
    { label: 'Kararlılık', val: player.determination || stats.kararllik },
    { label: 'Konsantrasyon', val: player.concentration || stats.konsantrasyon },
    { label: 'Liderlik', val: player.leadership || stats.liderlik },
    { label: 'Önsez', val: player.anticipation || stats.onsez },
    { label: 'Özel Yetenek', val: player.flair || stats.ozelYetenek },
    { label: 'Pozisyon Alma', val: player.positioning || stats.pozisyonAlma },
    { label: 'Soğukkanlılık', val: player.composure || stats.soggukkanlilik },
    { label: 'Takım Oyunu', val: player.teamwork || stats.takimOyunu },
    { label: 'Vizyon', val: player.vision || stats.vizyon },
  ];

  // Physical
  const physicalStats: { label: string; val: number }[] = [
    { label: 'Çeviklik', val: player.agility || stats.ceviklik },
    { label: 'Dayanıklılık', val: player.stamina || stats.dayaniklilik },
    { label: 'Denge', val: player.balance || stats.denge },
    { label: 'Güç', val: player.strength || stats.guc },
    { label: 'Hız', val: player.speed || stats.hiz },
    { label: 'Hızlanma', val: player.acceleration || stats.hizlanma },
    { label: 'Zıplama', val: player.jumping || stats.ziplama },
    { label: 'Sol Ayak', val: player.leftFoot || stats.solAyak },
    { label: 'Sağ Ayak', val: player.rightFoot || stats.sagAyak },
  ];

  // ── Radar — Mevki bazlı özet statlar (DYNAMIC) ──
  const chartData = isGK ? [
    { subject: 'REF', A: stats.kurtaris },
    { subject: 'PZS', A: stats.pozisyonAlma },
    { subject: 'KON', A: stats.konsantrasyon },
    { subject: 'LDR', A: stats.liderlik },
    { subject: 'HAV', A: stats.ziplama },
    { subject: '\u00c7VK', A: stats.ceviklik },
  ] : sp === 'CB' || sp === 'LB' || sp === 'RB' || sp === 'LWB' || sp === 'RWB' ? [
    // Defans: savunma odaklı
    { subject: 'MRK', A: stats.markaj },
    { subject: 'TKP', A: stats.topKapma },
    { subject: 'KAF', A: stats.kafaVurusu },
    { subject: 'POZ', A: stats.pozisyonAlma },
    { subject: 'G\u00c7', A: stats.guc },
    { subject: 'HIZ', A: stats.hiz },
  ] : sp === 'CDM' ? [
    // Ön Libero: dengeli savunma+pas
    { subject: 'TKP', A: stats.topKapma },
    { subject: 'PAS', A: stats.pas },
    { subject: 'POZ', A: stats.pozisyonAlma },
    { subject: 'VZN', A: stats.vizyon },
    { subject: '\u00c7LK', A: stats.caliskanlik },
    { subject: 'G\u00c7', A: stats.guc },
  ] : sp === 'CM' ? [
    // Orta Saha: dengeli
    { subject: 'PAS', A: stats.pas },
    { subject: 'DRB', A: stats.dribling },
    { subject: 'VZN', A: stats.vizyon },
    { subject: '\u00c7LK', A: stats.caliskanlik },
    { subject: 'HIZ', A: stats.hiz },
    { subject: 'SUT', A: stats.uzaktanSut },
  ] : sp === 'CAM' ? [
    // Ofansif Orta Saha: yaratıcılık odaklı
    { subject: 'VZN', A: stats.vizyon },
    { subject: 'PAS', A: stats.pas },
    { subject: 'DRB', A: stats.dribling },
    { subject: 'BIT', A: stats.bitiricilik },
    { subject: 'TEK', A: stats.tekik },
    { subject: '\u00d6NZ', A: stats.onsez },
  ] : sp === 'LW' || sp === 'RW' || sp === 'LM' || sp === 'RM' ? [
    // Kanat Oyuncuları: hız ve dribling odaklı
    { subject: 'HIZ', A: stats.hiz },
    { subject: 'DRB', A: stats.dribling },
    { subject: 'ORT', A: stats.ortayapma },
    { subject: 'TEK', A: stats.tekik },
    { subject: '\u00c7VK', A: stats.ceviklik },
    { subject: 'SUT', A: stats.bitiricilik },
  ] : [
    // Forvetler (CF, ST): gol odaklı
    { subject: 'BIT', A: stats.bitiricilik },
    { subject: 'SUT', A: stats.uzaktanSut },
    { subject: 'HIZ', A: stats.hiz },
    { subject: 'DRB', A: stats.dribling },
    { subject: 'POZ', A: stats.pozisyonAlma },
    { subject: 'KAF', A: stats.kafaVurusu },
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="bg-[#111820] w-full max-w-[960px] max-h-[90vh] overflow-y-auto border border-white/[0.08] shadow-[0_0_120px_rgba(0,0,0,0.9)] font-sans text-white rounded-sm"
        onClick={e => e.stopPropagation()}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffffff15 transparent' }}
      >
        {/* Floating close button */}
        <button 
          onClick={onClose}
          className="fixed top-4 right-4 z-[220] p-3 bg-red-600/20 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-2xl backdrop-blur-md border border-red-500/30"
        >
          <XIcon size={24} />
        </button>

        {/* ══════════════════════════════════════════════
            SECTION 1 — TOP HEADER BAR
        ══════════════════════════════════════════════ */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1218] border-b border-white/[0.06]">
          {/* Left: Player identity */}
          <div className="flex items-center gap-3">
            {/* Rating badge */}
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/20 flex items-center justify-center shrink-0">
              <span className="text-[22px] font-display font-black italic text-amber-400 leading-none">{rating}</span>
            </div>
            <div>
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
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`px-1.5 py-px rounded-sm border text-[9px] font-bold uppercase tracking-wider ${posBg} ${posColor}`}>
                  {localizePos(sp)}
                </span>
                {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                  <div className="flex items-center gap-1">
                    {player.secondaryPositions.map((sec: string, si: number) => {
                      const secG = getGroup(sec);
                      const secBadge = getPosBadgeStyle(secG);
                      const secColor = secBadge.split(' ').find(c => c.startsWith('text-')) || 'text-[#9B9B9B]';
                      const secBg = secBadge.split(' ').filter(c => !c.startsWith('text-')).join(' ');
                      return <span key={si} className={`px-1 py-px rounded-sm border text-[8px] font-bold uppercase tracking-wider ${secBg} ${secColor}`}>{localizePos(sec)}</span>;
                    })}
                    <span className="text-[7px] text-white/20 font-bold uppercase">yan</span>
                  </div>
                )}
                <span className="text-[10px] text-white/35 font-bold">{player.age || '—'} yaş</span>
                <span className="text-[10px] text-white/40">|</span>
                <div className="flex items-center gap-1">
                  <Ruler size={10} className="text-amber-500" />
                  <span className="text-[10px] text-amber-500/80 font-bold">{player.height || '—'} cm</span>
                </div>
                <span className="text-[10px] text-white/40">|</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{player.preferred_foot === 'Both' ? 'Her İki Ayak' : (player.preferred_foot === 'Left' ? 'Sol Ayak' : 'Sağ Ayak')}</span>
                </div>
                <span className="text-[10px] text-white/40">|</span>
                <div className="flex items-center gap-1">
                  <Scale size={10} className="text-amber-500" />
                  <span className="text-[10px] text-amber-500/80 font-bold">{player.weight || '—'} kg</span>
                </div>
                {player.preferredFoot && (
                  <span className="text-[10px] text-white/25">| {player.preferredFoot}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Key info */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/20 mb-0.5">Piyasa Değeri</div>
              <div className="text-[13px] font-black text-amber-400">{formatCurrency(marketValue)}</div>
            </div>
              <div className="text-right">
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
            <div className="text-right">
              <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/20 mb-0.5">Form</div>
              <div className="text-[13px] font-black text-emerald-400">{cap99(player.form || 50)}%</div>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-sm border border-white/10 text-white/30 hover:text-white hover:border-white/30 transition-all ml-2">
              <XIcon size={14} />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 2 — TAB NAVIGATION
        ══════════════════════════════════════════════ */}
        <div className="flex items-center gap-0 px-4 bg-[#0d1218] border-b border-white/[0.06]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'text-white border-amber-500'
                  : 'text-white/30 border-transparent hover:text-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {/* Actions button */}
          <div className="flex-1" />
          {!marketListing && (
            <div className="relative">
              <button 
                onClick={() => setShowActions(!showActions)}
                className="px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-[9px] font-bold uppercase tracking-[0.15em] rounded-sm transition-all flex items-center gap-2"
              >
                Eylemler <ChevronDown size={12} className={showActions ? 'rotate-180' : ''} />
              </button>
              {showActions && (
                <div className="absolute right-0 mt-1 w-48 bg-[#1a1e2a] border border-white/10 rounded-sm shadow-2xl z-[210] overflow-hidden">
                  <button 
                    onClick={() => { setActiveTab('market'); setShowActions(false); if(isOwned) setSellPrice(corridor.min); }}
                    className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 text-white/70 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Target size={14} className={isOwned ? "text-emerald-400" : "text-amber-400"} /> 
                    {isOwned ? 'Transfer Listesine Koy' : 'Transfer Teklifi Yap'}
                  </button>
                  <button 
                    onClick={() => { 
                      toggleWatchlist(player); 
                      setShowActions(false); 
                    }}
                    className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 text-white/70 hover:text-white transition-all flex items-center gap-2 border-t border-white/5"
                  >
                    <Eye size={14} className={isWatched ? "text-amber-400" : "text-white/40"} /> 
                    {isWatched ? 'İzleme Listesinden Çıkar' : 'İzleme Listesine Ekle'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 3 — MAIN CONTENT (3-panel layout)
        ══════════════════════════════════════════════ */}
        {activeTab === 'genel' && (
          <div className="flex">
            {/* ─── LEFT PANEL: Info & Character ─── */}
            <div className="w-[200px] shrink-0 border-r border-white/[0.05] bg-[#0a0f15]">
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
                      {localizePos(sp)}
                    </span>
                    {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1">
                        {player.secondaryPositions.map((sec: string, si: number) => {
                          const secG = getGroup(sec);
                          const secBadge = getPosBadgeStyle(secG);
                          const secColor = secBadge.split(' ').find(c => c.startsWith('text-')) || 'text-[#9B9B9B]';
                          const secBg = secBadge.split(' ').filter(c => !c.startsWith('text-')).join(' ');
                          return <span key={si} className={`px-1.5 py-px rounded-full border text-[8px] font-bold uppercase tracking-wider ${secBg} ${secColor}`}>{localizePos(sec)}</span>;
                        })}
                        <span className="text-[7px] text-white/15 font-bold uppercase w-full text-center">yan mevki</span>
                      </div>
                    )}
                  </div>
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
                          alert(res.reason);
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

                  <div className="px-3 py-2 border-b border-white/[0.05]">
                    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25 mb-2">Genel Karakter</div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between group/tooltip relative">
                        <span className="text-[9px] text-white/40">Zihniyet</span>
                        <span className="text-[9px] font-bold text-white/60">
                          {isScouted ? (player.personality || 'Dengeli') : 'Bilinmiyor'}
                        </span>
                        <div className="absolute top-full left-0 mt-3 w-48 p-2 bg-zinc-950 border border-white/20 rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all text-[9px] font-medium text-white/70 z-[500] pointer-events-none shadow-2xl backdrop-blur-xl">
                           <p className="font-bold text-white mb-1 uppercase tracking-tighter">Zihniyet: {player.personality || 'Dengeli'}</p>
                           <p className="text-white/50 text-[8px] leading-tight">Oyuncunun saha i\u00e7indeki genel karakteri ve bask\u0131 alt\u0131ndaki tavr\u0131n\u0131 belirler.</p>
                        </div>
                      </div>
                      {/* Arketip Profili — Profesyonel G\u00f6r\u00fcn\u00fcm */}
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
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-white/40">Potansiyel</span>
                        <span className="text-[9px] font-bold text-white/60 italic">
                          {isScouted ? `${player.potential} (G: ${player.hidden_potential})` : '??'}
                        </span>
                      </div>
                    </div>
                  </div>

              {/* Traits */}
              <div className="px-3 py-2">
                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25 mb-2">
                  Özel Yetenekler ({player.traits?.length || 0})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {isScouted && player.traits && player.traits.length > 0 ? (
                    player.traits.slice(0, 10).map((tk, idx) => {
                      const t = (traitDescriptions && traitDescriptions[tk]) || { name: tk, short: 'Özel yetenek.', type: 'pozitif' as const };
                      const isNeg = t.type === 'negatif';
                      return (
                        <div key={idx} className="relative group/trait">
                          <button className={`px-2 py-1 rounded-full border text-[7px] font-black uppercase tracking-tighter transition-all hover:scale-105 ${
                            isNeg ? 'border-red-400/20 bg-red-400/10 text-red-400'
                            : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400'
                          }`}>
                            {isNeg ? '🚩' : '💠'} {t.name}
                          </button>
                          <div className="absolute top-full left-0 mt-3 w-48 p-3 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/trait:opacity-100 group-hover/trait:visible transition-all z-[500] pointer-events-none backdrop-blur-xl">
                            <div className={`font-black text-[10px] mb-1 uppercase tracking-widest ${isNeg ? 'text-red-400' : 'text-emerald-400'}`}>{t.name}</div>
                            <p className="text-[9px] text-white/60 leading-relaxed font-medium">{t.short}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 w-full border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                       <Zap size={16} className="text-white/10 mb-2" />
                       <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">Rapor Bekleniyor</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ─── CENTER PANEL: Attributes (Technical + Mental) ─── */}
            <div className="flex-1 min-w-0">
              {/* Traits integrated into attributes area as requested */}
              <div className="p-3 border-b border-white/[0.04] bg-white/[0.01]">
                <div className="flex items-center gap-2 mb-2.5">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap size={11} className="text-amber-400" />
                  </motion.div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Özel Profil Yetenekleri</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isScouted ? (
                    player.traits && player.traits.length > 0 ? (
                      player.traits.map((tk: string, idx: number) => {
                        const info = traitDescriptions[tk] || { name: tk, short: 'Özel yetenek.' };
                        return (
                          <div key={idx} className="relative group/trait-main">
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-black uppercase text-amber-400 tracking-[0.1em] cursor-help shadow-lg"
                            >
                              ✨ {info.name}
                            </motion.div>
                            <div className="absolute top-full left-0 mt-3 w-64 p-4 bg-[#1a1e2a] border border-amber-500/20 rounded-lg shadow-[0_15px_40px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover/trait-main:opacity-100 group-hover/trait-main:visible transition-all z-[300] pointer-events-none">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 bg-amber-500/20 rounded-md">
                                  <Zap size={14} className="text-amber-400" />
                                </div>
                                <div className="font-black text-[11px] text-white uppercase tracking-widest">{info.name}</div>
                              </div>
                              <p className="text-[10px] text-white/60 leading-relaxed italic border-t border-white/5 pt-2">{info.short || 'Özel yetenek.'}</p>
                              {info.engineEffect && (
                                <div className="mt-2 py-2 border-t border-white/5 space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold text-emerald-400">
                                    <span>ETKİ ORANI:</span>
                                    <span>%{Math.round(info.engineEffect.successRate * 100)}</span>
                                  </div>
                                  <div className="flex justify-between text-[10px] font-bold text-blue-400">
                                    <span>MOTOR ETKİSİ:</span>
                                    <span>%{Math.round(info.engineEffect.engineWeight * 100)}</span>
                                  </div>
                                </div>
                              )}
                              {info.counterFor && (
                                <div className="mt-2 py-1.5 px-2 bg-amber-500/5 border border-amber-500/10 rounded-md text-[9px] font-black italic text-amber-400 uppercase tracking-widest">
                                  🚀 Karşı Güç: {info.counterFor}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-[9px] text-white/10 italic">Belirgin bir yetenek bulunamadı.</span>
                    )
                  ) : (
                    <span className="text-[9px] text-white/10 italic">Bu yetenekleri görmek için oyuncuyu gözlemleyin.</span>
                  )}
                </div>
              </div>

              <div className="flex">
                <div className="flex-1 min-w-0 p-2 border-r border-white/[0.04]">
                  <AttrColumn
                    title={player.position === 'GK' ? "Kalecilik" : "Teknik"}
                    icon={<Target size={10} className="text-cyan-400/70" />}
                    stats={technicalStats}
                    isObserved={isScouted}
                  />

                  {/* Pitch diagram moved here */}
                  <div className="mt-4 px-2">
                    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Saha Yerleşimi</div>
                    <div className="w-full aspect-[2/1] bg-[#1a3a1a] rounded-sm border border-white/[0.08] p-2 relative overflow-hidden">
                      {/* Pitch lines */}
                      <div className="absolute inset-1 border border-white/10 rounded-sm" />
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-white/10" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/10 rounded-full" />
                      <div className="absolute top-1/2 -translate-y-1/2 right-1 w-3 h-8 border border-white/10 rounded-l-sm" />
                      <div className="absolute top-1/2 -translate-y-1/2 left-1 w-3 h-8 border border-white/10 rounded-r-sm" />
                      {/* Player dot on pitch */}
                      <PitchPositionDot position={player.position} specificPosition={player.specificPosition} />
                    </div>
                  </div>
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
            <div className="w-[200px] shrink-0 border-l border-white/[0.05] bg-[#0a0f15]">
              <div className="p-2">
                <AttrColumn
                  title="Fiziksel"
                  icon={<Footprints size={10} className="text-red-400/70" />}
                  stats={physicalStats}
                  isObserved={isScouted}
                />
              </div>

              {/* Radar Chart */}
              <div className="px-2 pb-2">
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-t-sm mb-px">
                  <Shield size={10} className="text-amber-400/70" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Özet</span>
                </div>
                <div className="w-full h-[160px] bg-white/[0.02] border border-white/[0.05] rounded-b-sm p-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                      <PolarGrid stroke="#ffffff10" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff30', fontSize: 7, fontWeight: 700 }} />
                      <Radar name={toTitleCase(player.name)} dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.10} strokeWidth={1.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 3B — Kişisel Bilgi TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'bilgi' && (
          <div className="p-6">
            <div className="max-w-[600px] mx-auto">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Piyasa Değeri', value: formatCurrency(marketValue), color: 'text-amber-400' },
                  { label: 'Form', value: `${cap99(player.form || 50)}%`, color: 'text-emerald-400' },
                  { label: 'Gelişim Potansiyeli', value: `${potentialDiff >= 10 ? 'Yüksek' : potentialDiff >= 3 ? 'Orta' : 'Plato'}`, color: potentialDiff >= 10 ? 'text-emerald-400' : potentialDiff >= 3 ? 'text-yellow-400' : 'text-red-400' },
                  { label: 'Kişilik', value: player.personality || 'Bilinmiyor', color: 'text-white/70' },
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
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 3C — PERFORMANS TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'performans' && (
          <div className="p-6">
            <div className="max-w-[600px] mx-auto">
              <div className="grid grid-cols-4 gap-3 mb-6">
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
                  <div className={`text-[22px] font-black ${cap99(player.form || 50) >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {cap99(player.form || 50)}%
                  </div>
                  <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/25 mt-0.5">Form</div>
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
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 3D — İSTATİSTİKLER TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'istatistikler' && (
          <PlayerStatsTab player={player} />
        )}

        {/* ══════════════════════════════════════════════
            SECTION — ANTRENMAN TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'antrenman' && (
          <div className="p-8 space-y-6">
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
                              programId: 'fiziksel_yukleme', 
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
          <div className="p-10 space-y-8">
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
                       alert('Teklif Kabul Edildi! Oyuncu transfer süreci başlatıldı.');
                       // In a real app, we would update the DB here.
                       onClose();
                    }}
                    className="flex-1 bg-emerald-500 text-black py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl"
                  >
                    Kabul Et
                  </button>
                  <button 
                    onClick={() => {
                       alert('Teklif Reddedildi.');
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
                        alert(`Lütfen ${formatCurrency(corridor.min)} ile ${formatCurrency(corridor.max)} arasında bir değer giriniz.`);
                        return;
                      }
                      
                      if (!isOwned) {
                         alert(`Teklifiniz ${player.club} kulübüne iletilmiştir. Onur bey değerlendirme yapacak.`);
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
      </motion.div>
    </motion.div>
  );
}
