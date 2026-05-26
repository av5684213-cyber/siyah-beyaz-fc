'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Star, Zap, Shield, Target, ArrowUp, RefreshCw,
  Eye, TrendingUp, AlertTriangle, ChevronRight, X, GraduationCap,
  ArrowUpCircle, Clock, Heart, Timer, FastForward
} from 'lucide-react';
import {
  YouthPlayer,
  YouthScoutReport,
  AcademyFacility,
  FacilityState,
  PromotionRecommendation,
  YOUTH_FACILITIES,
  generateYouthPlayer,
  generateScoutReport,
  processYouthWeeklyTraining,
  checkYouthPromotion,
  generateYouthIntake,
  calculateYouthValue,
  getYouthPotentialStars,
  getDevelopmentCurveLabel,
} from '@/lib/fm/youthAcademy';
import { canDoSeasonIntake } from '@/lib/fm/youthAcademySeasonSync';

// ─── Props ────────────────────────────────────────────────────────────

interface YouthAcademyTabProps {
  academyLevel: number;
  facilities: FacilityState;
  onUpgradeFacility: (facilityId: string, cost: number) => void;
  onPromotePlayer: (player: YouthPlayer) => void;
  budget: number;
  youthPlayers?: YouthPlayer[];
  onYouthPlayersChange?: (players: YouthPlayer[]) => void;
  upgradeEndAt?: string | null;
  speedUpUsed?: boolean;
  credits?: number;
  onStartUpgrade?: () => Promise<void>;
  onSpeedUp?: () => Promise<void>;
  onDeductCredits?: (amount: number) => void;
  currentWeek?: number;
  seasonIntakeUsed?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────

type CategoryFilter = 'ALL' | 'U17' | 'U19' | 'U21';

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M €`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K €`;
  return `${Math.round(value)} €`;
}

function getFacilityLevel(state: FacilityState, facilityId: string): number {
  if (Array.isArray(state)) {
    const found = state.find(f => f.facilityId === facilityId);
    return found?.currentLevel ?? 1;
  }
  if (state && typeof state === 'object') {
    // Handle FacilityState single object
    if ('facilityId' in state) {
      return (state as FacilityState).facilityId === facilityId
        ? (state as FacilityState).currentLevel
        : 1;
    }
    // Handle Record<string, number> (key-value map from parent)
    if (facilityId in state) {
      return (state as Record<string, number>)[facilityId] ?? 1;
    }
  }
  return 1;
}

function getAllFacilityLevels(state: FacilityState): Record<string, number> {
  const levels: Record<string, number> = {};
  if (Array.isArray(state)) {
    state.forEach(f => { levels[f.facilityId] = f.currentLevel; });
  } else if (state && typeof state === 'object') {
    if ('facilityId' in state) {
      // Single FacilityState object
      levels[(state as FacilityState).facilityId] = (state as FacilityState).currentLevel;
    } else {
      // Record<string, number> (key-value map from parent)
      Object.entries(state as Record<string, unknown>).forEach(([key, val]) => {
        if (typeof val === 'number') {
          levels[key] = val;
        }
      });
    }
  }
  return levels;
}

const POSITION_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  GK:   { bg: 'bg-[#7AB4E8]/10', text: 'text-[#7AB4E8]', border: 'border-[#7AB4E8]/20', badge: 'bg-[#7AB4E8]/15 text-[#7AB4E8] border-[#7AB4E8]/30' },
  DEF:  { bg: 'bg-[#7EDBC8]/10', text: 'text-[#7EDBC8]', border: 'border-[#7EDBC8]/20', badge: 'bg-[#7EDBC8]/15 text-[#7EDBC8] border-[#7EDBC8]/30' },
  MID:  { bg: 'bg-[#F0C87A]/10', text: 'text-[#F0C87A]', border: 'border-[#F0C87A]/20', badge: 'bg-[#F0C87A]/15 text-[#F0C87A] border-[#F0C87A]/30' },
  FWD:  { bg: 'bg-[#E87878]/10', text: 'text-[#E87878]', border: 'border-[#E87878]/20', badge: 'bg-[#E87878]/15 text-[#E87878] border-[#E87878]/30' },
};

const POTENTIAL_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  low:         { label: 'Düşük',        color: 'text-white/40',  bg: 'bg-white/5 border-white/10' },
  medium:      { label: 'Orta',          color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  high:        { label: 'Yüksek',        color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  world_class: { label: 'Dünya Sınıfı', color: 'text-amber-300', bg: 'bg-amber-500/15 border-amber-500/30' },
};

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'ALL', label: 'TÜMÜ' },
  { id: 'U17', label: 'U17' },
  { id: 'U19', label: 'U19' },
  { id: 'U21', label: 'U21' },
];

const STAT_LABELS: Record<string, string> = {
  speed: 'Hız', passing: 'Pas', shooting: 'Şut', defending: 'Tk',
  power: 'Güç', goalkeeping: 'Klc', finishing: 'Bit', dribbling: 'Drb',
  firstTouch: '1. Kont', crossing: 'Ort', marking: 'Mrk', tackling: 'Müd',
  technique: 'Tekn', longShots: 'U.Şut', offTheBall: 'Bşlk', heading: 'Kfa',
  anticipation: 'Öng', workRate: 'Çbş', composure: 'Skkn', decisions: 'Krar',
  determination: 'Krl', concentration: 'Kns', leadership: 'Ldr', flair: 'Flr',
  teamwork: 'Tkm', vision: 'Gz', stamina: 'Knd', agility: 'Çvk', balance: 'Dng',
  strength: 'Fzk', acceleration: 'Fır', jumping: 'Zpl',
};

function getKeyStatsForPosition(pos: string): string[] {
  const keyMap: Record<string, string[]> = {
    GK: ['goalkeeping', 'reflexes', 'positioning', 'jumping', 'composure', 'concentration'],
    CB: ['marking', 'tackling', 'heading', 'positioning', 'strength', 'anticipation'],
    LB: ['speed', 'stamina', 'crossing', 'tackling', 'workRate', 'acceleration'],
    RB: ['speed', 'stamina', 'crossing', 'tackling', 'workRate', 'acceleration'],
    LWB: ['speed', 'stamina', 'crossing', 'dribbling', 'acceleration', 'agility'],
    RWB: ['speed', 'stamina', 'crossing', 'dribbling', 'acceleration', 'agility'],
    CDM: ['tackling', 'positioning', 'passing', 'strength', 'anticipation', 'workRate'],
    CM: ['passing', 'vision', 'stamina', 'workRate', 'teamwork', 'firstTouch'],
    CAM: ['passing', 'vision', 'dribbling', 'technique', 'flair', 'offTheBall'],
    LM: ['speed', 'crossing', 'dribbling', 'stamina', 'workRate', 'acceleration'],
    RM: ['speed', 'crossing', 'dribbling', 'stamina', 'workRate', 'acceleration'],
    LW: ['speed', 'dribbling', 'acceleration', 'agility', 'flair', 'crossing'],
    RW: ['speed', 'dribbling', 'acceleration', 'agility', 'flair', 'crossing'],
    CF: ['shooting', 'finishing', 'passing', 'vision', 'dribbling', 'offTheBall'],
    ST: ['shooting', 'finishing', 'heading', 'speed', 'offTheBall', 'strength'],
  };
  return keyMap[pos] || ['speed', 'passing', 'shooting'];
}

function getDevelopmentCurveColor(curve: string): { text: string; bg: string } {
  switch (curve) {
    case 'early':        return { text: 'text-emerald-400', bg: 'bg-emerald-500/15' };
    case 'normal':       return { text: 'text-blue-400',    bg: 'bg-blue-500/15' };
    case 'late':         return { text: 'text-amber-400',   bg: 'bg-amber-500/15' };
    case 'injury_prone': return { text: 'text-red-400',     bg: 'bg-red-500/15' };
    default:             return { text: 'text-white/40',    bg: 'bg-white/5' };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function YouthAcademyTab({
  academyLevel,
  facilities,
  onUpgradeFacility,
  onPromotePlayer,
  budget,
  youthPlayers: externalYouthPlayers,
  onYouthPlayersChange,
  upgradeEndAt,
  speedUpUsed: speedUpUsedProp,
  credits,
  onStartUpgrade,
  onSpeedUp,
  onDeductCredits,
  currentWeek = 0,
  seasonIntakeUsed = false,
}: YouthAcademyTabProps) {
  // ─── State: External (controlled) or Internal ──────────────────────
  // Eğer parent bileşen youthPlayers prop'u veriyorsa, onu kullan; yoksa internal state
  const [internalYouthPlayers, setInternalYouthPlayers] = useState<YouthPlayer[]>([]);
  const youthPlayers = externalYouthPlayers !== undefined ? externalYouthPlayers : internalYouthPlayers;
  const setYouthPlayers = useCallback((update: YouthPlayer[] | ((prev: YouthPlayer[]) => YouthPlayer[])) => {
    if (onYouthPlayersChange) {
      // Parent kontrollü: yeni listeyi parent'a bildir
      const newList = typeof update === 'function' ? update(youthPlayers) : update;
      onYouthPlayersChange(newList);
    } else {
      setInternalYouthPlayers(update);
    }
  }, [onYouthPlayersChange, youthPlayers]);
  const [selectedPlayer, setSelectedPlayer] = useState<YouthPlayer | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [showIntakeConfirm, setShowIntakeConfirm] = useState(false);
  const [countdownMs, setCountdownMs] = useState<number>(0);
  const [isUpgradingAcademy, setIsUpgradingAcademy] = useState(false);

  // Geri sayım sayacı
  useEffect(() => {
    if (!upgradeEndAt) {
      setCountdownMs(0);
      return;
    }

    const updateCountdown = () => {
      const remaining = new Date(upgradeEndAt).getTime() - Date.now();
      setCountdownMs(Math.max(0, remaining));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [upgradeEndAt]);

  // Format geri sayım
  const formatCountdown = (ms: number): string => {
    if (ms <= 0) return 'Tamamlandı!';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    if (days > 0) return `${days}g ${hours}s ${minutes}dk`;
    if (hours > 0) return `${hours}s ${minutes}dk ${seconds}sn`;
    return `${minutes}dk ${seconds}sn`;
  };

  const isUpgradeActive = !!upgradeEndAt && countdownMs > 0;
  const canSpeedUp = isUpgradeActive && !speedUpUsedProp && (credits || 0) >= 5;

  // Facility levels helper
  const facilityLevels = useMemo(() => getAllFacilityLevels(facilities), [facilities]);

  // Calculate weekly upkeep
  const weeklyUpkeep = useMemo(() => {
    let total = 0;
    for (const fac of YOUTH_FACILITIES) {
      const lvl = facilityLevels[fac.id] ?? 1;
      total += fac.upgradeCost[0] * lvl * 0.01;
    }
    return Math.round(total + youthPlayers.length * 15_000);
  }, [facilityLevels, youthPlayers.length]);

  // ─── Filtered Players ───────────────────────────────────────────────
  const filteredPlayers = useMemo(() => {
    let list = [...youthPlayers];
    if (activeCategory !== 'ALL') {
      list = list.filter(p => p.category === activeCategory);
    }
    return list.sort((a, b) => {
      if (a.isWonderkid !== b.isWonderkid) return a.isWonderkid ? -1 : 1;
      return b.rating - a.rating;
    });
  }, [youthPlayers, activeCategory]);

  // ─── Actions ────────────────────────────────────────────────────────
  const handleIntake = useCallback(() => {
    // Sezon sonu kontrolü — 34 hafta tamamlanmamışsa uyarı ver (manuel tetikleme hala mümkün)
    const { canIntake, reason } = canDoSeasonIntake(currentWeek, seasonIntakeUsed);
    if (!canIntake && currentWeek > 0) {
      // Sezon bitmemişse uyarı göster ama engelleme (manual override)
      const proceed = confirm(`${reason}\n\nYine de alım yapmak istiyor musunuz? (Önerilmez)`);
      if (!proceed) {
        setShowIntakeConfirm(false);
        return;
      }
    }
    if (seasonIntakeUsed) {
      alert('Bu sezonun alımı zaten yapıldı!');
      setShowIntakeConfirm(false);
      return;
    }
    // Check if user has enough credits (10 KR required)
    const currentCredits = credits || 0;
    if (currentCredits < 10) {
      alert('Yetersiz kredi! 10 Kredi gerekli.');
      setShowIntakeConfirm(false);
      return;
    }
    // Deduct 10 credits
    if (onDeductCredits) {
      onDeductCredits(10);
    }
    const newPlayers = generateYouthIntake(academyLevel);
    // Generate scout reports for each
    const playersWithReports = newPlayers.map(p => ({
      ...p,
      scoutReport: generateScoutReport(p),
    }));
    setYouthPlayers(prev => [...prev, ...playersWithReports]);
    setShowIntakeConfirm(false);
  }, [academyLevel, credits, onDeductCredits, currentWeek, seasonIntakeUsed]);

  const handleScoutPlayer = useCallback((player: YouthPlayer) => {
    const report = generateScoutReport(player);
    const updated = youthPlayers.map(p =>
      p.id === player.id ? { ...p, scoutReport: report } : p
    );
    setYouthPlayers(updated);
    setSelectedPlayer({ ...player, scoutReport: report });
  }, [youthPlayers]);

  const handlePromote = useCallback((player: YouthPlayer) => {
    setYouthPlayers(prev => prev.filter(p => p.id !== player.id));
    setSelectedPlayer(null);
    onPromotePlayer(player);
  }, [onPromotePlayer]);

  const handleUpgrade = useCallback((facilityId: string, cost: number) => {
    onUpgradeFacility(facilityId, cost);
  }, [onUpgradeFacility]);

  const handleCloseReport = useCallback(() => {
    setSelectedPlayer(null);
  }, []);

  // ─── Aggregate Facility Effects ─────────────────────────────────────
  const aggregateEffects = useMemo(() => {
    let trainingSpeed = 0;
    let scoutQuality = 0;
    let injuryPrevention = 0;
    for (const fac of YOUTH_FACILITIES) {
      const lvl = facilityLevels[fac.id] ?? 1;
      trainingSpeed += fac.effects.trainingSpeed * lvl;
      scoutQuality += fac.effects.scoutQuality * lvl;
      injuryPrevention += fac.effects.injuryPrevention * lvl;
    }
    return { trainingSpeed, scoutQuality, injuryPrevention };
  }, [facilityLevels]);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20"
    >
      {/* ═══════════════════════════════════════════════════════════════
          1. ACADEMY OVERVIEW HEADER
          ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-[#0d1117] to-[#111820] border border-white/[0.06] rounded-[2rem] p-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 opacity-[0.03]">
          <GraduationCap size={180} />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <GraduationCap size={28} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                Gençlik Akademisi
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < academyLevel
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-white/10'}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                  Seviye {academyLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2.5 bg-black/40 border border-white/[0.06] rounded-xl">
              <span className="text-[9px] font-black text-white/20 uppercase block leading-none mb-1">
                Genç Oyuncu
              </span>
              <span className="text-sm font-mono font-bold text-white leading-none">
                {youthPlayers.length}
              </span>
            </div>
            <div className="px-4 py-2.5 bg-black/40 border border-white/[0.06] rounded-xl">
              <span className="text-[9px] font-black text-white/20 uppercase block leading-none mb-1">
                Haftalık Masraf
              </span>
              <span className="text-sm font-mono font-bold text-amber-400 leading-none">
                {formatCurrency(weeklyUpkeep)}
              </span>
            </div>

            {/* Geri sayım sayacı (yükseltme aktifse) */}
            {isUpgradeActive && (
              <div className="px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <span className="text-[9px] font-black text-amber-400/60 uppercase block leading-none mb-1 flex items-center gap-1">
                  <Timer size={8} /> YÜKSELTME
                </span>
                <span className="text-sm font-mono font-bold text-amber-400 leading-none">
                  {formatCountdown(countdownMs)}
                </span>
              </div>
            )}

            {/* Hızlandırma butonu */}
            {isUpgradeActive && canSpeedUp && onSpeedUp && (
              <button
                onClick={async () => {
                  setIsUpgradingAcademy(true);
                  try { await onSpeedUp(); } finally { setIsUpgradingAcademy(false); }
                }}
                disabled={isUpgradingAcademy}
                className="px-4 py-2.5 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-wider
                  hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]
                  disabled:opacity-50"
              >
                <FastForward size={12} />
                Hızlandır (5 Kredi)
              </button>
            )}
            {isUpgradeActive && !speedUpUsedProp && !canSpeedUp && (
              <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl opacity-50">
                <span className="text-[9px] font-black text-white/30 uppercase block leading-none mb-1 flex items-center gap-1">
                  <FastForward size={8} /> HIZLANDIR
                </span>
                <span className="text-[10px] font-bold text-white/20">5 Kredi gerekli</span>
              </div>
            )}
            {speedUpUsedProp && isUpgradeActive && (
              <div className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Zap size={10} /> Hızlandırıldı
                </span>
              </div>
            )}

            {/* Yükseltme başlat butonu */}
            {!isUpgradeActive && academyLevel < 10 && onStartUpgrade && (
              <button
                onClick={async () => {
                  setIsUpgradingAcademy(true);
                  try { await onStartUpgrade(); } finally { setIsUpgradingAcademy(false); }
                }}
                disabled={isUpgradingAcademy}
                className="px-4 py-2.5 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-wider
                  hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]
                  disabled:opacity-50"
              >
                <ArrowUp size={12} />
                Seviye {academyLevel + 1}
              </button>
            )}

            <button
              onClick={() => setShowIntakeConfirm(true)}
              disabled={(credits || 0) < 10 || seasonIntakeUsed}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider
                flex items-center gap-2 transition-all ${
                  seasonIntakeUsed
                    ? 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'
                    : (credits || 0) >= 10 && currentWeek >= 34
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : (credits || 0) >= 10
                        ? 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                        : 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'
                }`}
            >
              <RefreshCw size={14} />
              {seasonIntakeUsed ? 'Alım Yapıldı' : 'Yeni Sezon Alımı'}
              <span className="text-[9px] font-mono opacity-70">(10 KR)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          2. FACILITIES GRID
          ═══════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Shield size={18} className="text-white/40" />
          <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">
            Tesisler
          </h3>
          <div className="flex-1 border-b border-white/[0.06]" />
          {/* Aggregate effects */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/15 rounded-lg">
              <Zap size={10} className="text-emerald-400" />
              <span className="text-[9px] font-black text-emerald-400">+{(aggregateEffects.trainingSpeed * 100).toFixed(0)}%</span>
              <span className="text-[8px] text-emerald-400/50">Ant</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/15 rounded-lg">
              <Eye size={10} className="text-blue-400" />
              <span className="text-[9px] font-black text-blue-400">+{(aggregateEffects.scoutQuality * 100).toFixed(0)}%</span>
              <span className="text-[8px] text-blue-400/50">Göz</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/15 rounded-lg">
              <Heart size={10} className="text-red-400" />
              <span className="text-[9px] font-black text-red-400">-{(aggregateEffects.injuryPrevention * 100).toFixed(0)}%</span>
              <span className="text-[8px] text-red-400/50">Skt</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {YOUTH_FACILITIES.map((facility) => {
            const currentLevel = facilityLevels[facility.id] ?? 1;
            const isMaxLevel = currentLevel >= facility.maxLevel;
            const upgradeCost = isMaxLevel ? 0 : facility.upgradeCost[currentLevel];
            const canAfford = budget >= upgradeCost;

            return (
              <div
                key={facility.id}
                className="bg-[#111820] border border-white/[0.06] rounded-2xl p-5 group hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center text-lg">
                      {facility.icon}
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-white leading-tight">
                        {facility.name}
                      </h4>
                      <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed line-clamp-2">
                        {facility.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {[...Array(facility.maxLevel)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-5 rounded-full transition-colors ${
                          i < currentLevel ? 'bg-amber-400' : 'bg-white/[0.06]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Level bar */}
                <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentLevel / facility.maxLevel) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                  />
                </div>

                {/* Effects */}
                <div className="flex items-center gap-3 mb-4">
                  {facility.effects.trainingSpeed > 0 && (
                    <span className="text-[9px] font-bold text-emerald-400/60">
                      Ant: +{(facility.effects.trainingSpeed * currentLevel * 100).toFixed(0)}%
                    </span>
                  )}
                  {facility.effects.scoutQuality > 0 && (
                    <span className="text-[9px] font-bold text-blue-400/60">
                      Göz: +{(facility.effects.scoutQuality * currentLevel * 100).toFixed(0)}%
                    </span>
                  )}
                  {facility.effects.injuryPrevention > 0 && (
                    <span className="text-[9px] font-bold text-red-400/60">
                      Skt: -{(facility.effects.injuryPrevention * currentLevel * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                {/* Upgrade button */}
                {!isMaxLevel ? (
                  <button
                    onClick={() => handleUpgrade(facility.id, upgradeCost)}
                    disabled={!canAfford}
                    className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      canAfford
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 active:scale-[0.98]'
                        : 'bg-white/[0.02] border border-white/[0.06] text-white/20 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUp size={12} />
                    <span>Seviye {currentLevel + 1}</span>
                    <span className="font-mono">({formatCurrency(upgradeCost)})</span>
                  </button>
                ) : (
                  <div className="w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-center text-emerald-400/50 bg-emerald-500/5 border border-emerald-500/10">
                    Maksimum Seviye
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          3 & 5. CATEGORY FILTERS + YOUTH SQUAD LIST
          ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-[#0d1117] border border-white/[0.06] rounded-[2rem] overflow-hidden">
        {/* Header + Category Tabs */}
        <div className="p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-amber-400" />
              <div>
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">
                  Genç Kadro
                </h3>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] mt-0.5">
                  {filteredPlayers.length} Oyuncu
                </p>
              </div>
            </div>

            {/* Category filter tabs */}
            <div className="flex bg-black/40 border border-white/[0.06] rounded-xl p-1">
              {CATEGORY_TABS.map(tab => {
                const count = tab.id === 'ALL'
                  ? youthPlayers.length
                  : youthPlayers.filter(p => p.category === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                      activeCategory === tab.id
                        ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {tab.label}
                    <span className={`text-[8px] font-mono ${
                      activeCategory === tab.id ? 'text-black/40' : 'text-white/20'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Squad Table ───────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-t border-b border-white/[0.04]">
                {[
                  { label: 'İsim', w: 'w-44' },
                  { label: 'Yaş', w: 'w-12' },
                  { label: 'Pozisyon', w: 'w-20' },
                  { label: 'Rating', w: 'w-16' },
                  { label: 'Potansiyel', w: 'w-28' },
                  { label: 'Gelişim', w: 'w-28' },
                  { label: 'Scout', w: 'w-16' },
                  { label: 'Değer', w: 'w-20' },
                  { label: 'Aksiyon', w: 'w-32' },
                ].map(col => (
                  <th
                    key={col.label}
                    className={`${col.w} px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-white/25`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Users size={32} className="text-white/[0.06]" />
                      <p className="text-[11px] font-bold text-white/15 uppercase tracking-widest">
                        Henüz genç oyuncu yok
                      </p>
                      <button
                        onClick={() => setShowIntakeConfirm(true)}
                        disabled={(credits || 0) < 10}
                        className={`mt-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                          (credits || 0) >= 10
                            ? 'bg-amber-500 text-black hover:bg-amber-400'
                            : 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'
                        }`}
                      >
                        İlk Alımı Yap (10 KR)
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPlayers.map(player => {
                  const posColors = POSITION_COLORS[player.specificPosition || player.position] || POSITION_COLORS.MID;
                  const stars = getYouthPotentialStars(player);
                  const value = calculateYouthValue(player);
                  const promotion = checkYouthPromotion(player);
                  const devColor = getDevelopmentCurveColor(player.developmentCurve);
                  const keyStats = getKeyStatsForPosition(player.specificPosition);

                  return (
                    <tr
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors group"
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[10px] font-black ${posColors.badge}`}>
                            {player.specificPosition}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-black text-white truncate group-hover:text-amber-400 transition-colors">
                                {player.name}
                              </span>
                              {player.isWonderkid && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-400/15 border border-amber-400/25 rounded text-[8px] font-black text-amber-400 shrink-0">
                                  <Star size={8} fill="currentColor" />
                                  WK
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {player.injured && (
                                <span className="flex items-center gap-0.5 text-[8px] text-red-400 font-bold">
                                  <AlertTriangle size={8} />
                                  {player.injuryWeeksRemaining}h
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Age */}
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-mono font-bold ${player.age <= 17 ? 'text-amber-400' : player.age <= 19 ? 'text-white/60' : 'text-white/40'}`}>
                          {player.age}
                        </span>
                      </td>

                      {/* Position */}
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${posColors.bg} ${posColors.text} border ${posColors.border}`}>
                          {player.specificPosition || player.position}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-3">
                        <div className={`text-[12px] font-mono font-black ${
                          player.rating >= 65 ? 'text-amber-400' : player.rating >= 55 ? 'text-white' : 'text-white/50'
                        }`}>
                          {player.rating}
                        </div>
                      </td>

                      {/* Potential stars */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className={i < stars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-white/[0.06]'
                              }
                            />
                          ))}
                          <span className="text-[9px] font-mono text-white/30 ml-1.5">
                            {player.potential}
                          </span>
                        </div>
                      </td>

                      {/* Development curve */}
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${devColor.bg} ${devColor.text}`}>
                          {getDevelopmentCurveLabel(player.developmentCurve)}
                        </span>
                      </td>

                      {/* Scout status */}
                      <td className="px-4 py-3">
                        {player.scoutReport ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedPlayer(player); }}
                            className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            <Eye size={10} />
                            Rapor
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleScoutPlayer(player); }}
                            className="flex items-center gap-1 text-[9px] font-bold text-white/25 hover:text-blue-400 transition-colors"
                          >
                            <Eye size={10} />
                            Tara
                          </button>
                        )}
                      </td>

                      {/* Value */}
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-mono font-bold text-white/50">
                          {formatCurrency(value)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {promotion.ready ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handlePromote(player); }}
                              className="px-3 py-1.5 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider rounded-lg
                                hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            >
                              A Takımına Al
                            </button>
                          ) : (
                            <span className="text-[8px] text-white/15 font-bold uppercase tracking-wider">
                              {player.age < 17 ? 'Çok Genç' : `↑${95 - promotion.confidence}%`}
                            </span>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedPlayer(player); }}
                            className="p-1.5 rounded-md text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          4. SCOUT REPORT MODAL (inline overlay)
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-8 px-4 pb-4 backdrop-blur-xl bg-black/80 overflow-y-auto"
            onClick={handleCloseReport}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0d1117] border border-white/[0.06] rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleCloseReport}
                className="absolute top-4 right-4 p-2 rounded-xl text-white/20 hover:text-white hover:bg-white/10 transition-all z-10"
              >
                <X size={18} />
              </button>

              {/* Background decoration */}
              <div className="absolute top-0 right-0 opacity-[0.02]">
                <Eye size={200} />
              </div>

              {/* ── Player Header ─────────────────────────────────────── */}
              <div className="flex items-start gap-5 mb-6 relative z-10">
                <div className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-xl font-black italic"
                  style={{
                    borderColor: POSITION_COLORS[selectedPlayer.position]?.border || 'rgba(255,255,255,0.1)',
                    background: POSITION_COLORS[selectedPlayer.position]?.bg || 'rgba(255,255,255,0.03)',
                    color: POSITION_COLORS[selectedPlayer.position]?.text || 'rgba(255,255,255,0.5)',
                  }}
                >
                  {selectedPlayer.specificPosition}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                      {selectedPlayer.name}
                    </h3>
                    {selectedPlayer.isWonderkid && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-400/15 border border-amber-400/25 rounded-lg text-[10px] font-black text-amber-400">
                        <Star size={10} fill="currentColor" />
                        WONDERKID
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] text-white/50 font-bold">{selectedPlayer.age} Yaş</span>
                    <span className="text-white/10">•</span>
                    <span className={`text-[11px] font-bold ${POSITION_COLORS[selectedPlayer.position]?.text}`}>
                      {selectedPlayer.position}
                    </span>
                    <span className="text-white/10">•</span>
                    <span className="text-[11px] text-white/50 font-bold">{selectedPlayer.category}</span>
                    {selectedPlayer.injured && (
                      <>
                        <span className="text-white/10">•</span>
                        <span className="text-[11px] text-red-400 font-bold flex items-center gap-1">
                          <AlertTriangle size={11} />
                          Sakat ({selectedPlayer.injuryWeeksRemaining}h)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Rating + Potential */}
                <div className="flex gap-3 shrink-0">
                  <div className="text-center px-4 py-2 bg-black/40 border border-white/[0.06] rounded-xl">
                    <span className="text-[8px] font-black text-white/20 uppercase block mb-1">Rating</span>
                    <span className={`text-lg font-mono font-black ${
                      selectedPlayer.rating >= 65 ? 'text-amber-400' : selectedPlayer.rating >= 55 ? 'text-white' : 'text-white/50'
                    }`}>
                      {selectedPlayer.rating}
                    </span>
                  </div>
                  <div className="text-center px-4 py-2 bg-black/40 border border-white/[0.06] rounded-xl">
                    <span className="text-[8px] font-black text-white/20 uppercase block mb-1">Potansiyel</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < getYouthPotentialStars(selectedPlayer)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-white/[0.06]'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Scout Report Content ───────────────────────────────── */}
              {selectedPlayer.scoutReport ? (
                <div className="space-y-5 relative z-10">
                  {/* Scout info */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-black/30 border border-white/[0.04] rounded-xl">
                    <Eye size={12} className="text-blue-400" />
                    <span className="text-[9px] font-bold text-blue-400">{selectedPlayer.scoutReport.scoutName}</span>
                    <span className="text-[9px] text-white/15">•</span>
                    <span className="text-[9px] text-white/20 font-mono">
                      {new Date(selectedPlayer.scoutReport.date).toLocaleDateString('tr-TR')}
                    </span>
                    <span className="ml-auto text-[9px] text-white/15">
                      Önerilen: <span className="text-white/40 font-bold">{selectedPlayer.scoutReport.recommendedRole}</span>
                    </span>
                  </div>

                  {/* Overall Assessment */}
                  <div className="p-4 bg-black/30 border border-white/[0.04] rounded-xl">
                    <p className="text-[11px] text-white/70 leading-relaxed italic">
                      &ldquo;{selectedPlayer.scoutReport.overallAssessment}&rdquo;
                    </p>
                  </div>

                  {/* Potential Rating Badge */}
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-white/25 uppercase tracking-widest shrink-0">
                      Potansiyel Değerlendirme
                    </span>
                    <div className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider border ${
                      POTENTIAL_LABELS[selectedPlayer.scoutReport.potentialRating]?.bg || 'bg-white/5 border-white/10'
                    } ${
                      POTENTIAL_LABELS[selectedPlayer.scoutReport.potentialRating]?.color || 'text-white/40'
                    }`}>
                      {POTENTIAL_LABELS[selectedPlayer.scoutReport.potentialRating]?.label || selectedPlayer.scoutReport.potentialRating}
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div>
                      <span className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest block mb-2">
                        Güçlü Yönleri
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPlayer.scoutReport.keyStrengths.map((s, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/15 rounded-lg text-[10px] font-bold text-emerald-400"
                          >
                            {s}
                          </span>
                        ))}
                        {selectedPlayer.scoutReport.keyStrengths.length === 0 && (
                          <span className="text-[10px] text-white/15 italic">Belirlenemedi</span>
                        )}
                      </div>
                    </div>
                    {/* Weaknesses */}
                    <div>
                      <span className="text-[9px] font-black text-red-400/60 uppercase tracking-widest block mb-2">
                        Zayıf Yönleri
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPlayer.scoutReport.keyWeaknesses.map((w, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-red-500/10 border border-red-500/15 rounded-lg text-[10px] font-bold text-red-400"
                          >
                            {w}
                          </span>
                        ))}
                        {selectedPlayer.scoutReport.keyWeaknesses.length === 0 && (
                          <span className="text-[10px] text-white/15 italic">Belirlenemedi</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Comparison player */}
                  {selectedPlayer.scoutReport.comparisonPlayer && (
                    <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                      <Target size={14} className="text-amber-400 shrink-0" />
                      <p className="text-[11px] text-amber-200/70 italic">
                        {selectedPlayer.scoutReport.comparisonPlayer}
                      </p>
                    </div>
                  )}

                  {/* Development curve indicator */}
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-white/25 uppercase tracking-widest shrink-0">
                      Gelişim Eğrisi
                    </span>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                      getDevelopmentCurveColor(selectedPlayer.developmentCurve).bg
                    } border-white/[0.06]`}>
                      <TrendingUp size={12} className={getDevelopmentCurveColor(selectedPlayer.developmentCurve).text} />
                      <span className={`text-[10px] font-bold ${
                        getDevelopmentCurveColor(selectedPlayer.developmentCurve).text
                      }`}>
                        {getDevelopmentCurveLabel(selectedPlayer.developmentCurve)}
                      </span>
                    </div>
                    <span className="text-[9px] text-white/15 font-mono">
                      {selectedPlayer.totalTrainingWeeks} hafta eğitim
                    </span>
                  </div>

                  {/* Weekly training progress bars for key stats */}
                  <div>
                    <span className="text-[9px] font-black text-white/25 uppercase tracking-widest block mb-3">
                      Temel İstatistikler
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getKeyStatsForPosition(selectedPlayer.specificPosition).map(statKey => {
                        const statValue = (selectedPlayer as Record<string, any>)[statKey] as number | undefined ?? 50;
                        const gained = selectedPlayer.statsGainedThisSeason[statKey] ?? 0;
                        const label = STAT_LABELS[statKey] || statKey;
                        const barColor = statValue >= 70 ? 'bg-amber-400' : statValue >= 55 ? 'bg-emerald-400' : statValue >= 40 ? 'bg-blue-400' : 'bg-white/20';
                        return (
                          <div key={statKey} className="flex items-center gap-2.5 py-1.5 px-3 bg-black/20 rounded-lg">
                            <span className="text-[9px] font-bold text-white/30 w-12 shrink-0 uppercase">
                              {label}
                            </span>
                            <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${statValue}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
                                className={`h-full rounded-full ${barColor}`}
                              />
                            </div>
                            <span className={`text-[10px] font-mono font-bold w-6 text-right ${
                              statValue >= 70 ? 'text-amber-400' : statValue >= 55 ? 'text-emerald-400' : 'text-white/40'
                            }`}>
                              {statValue}
                            </span>
                            {gained > 0 && (
                              <span className="text-[8px] font-mono text-emerald-400/60 shrink-0">
                                +{gained}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Personality traits */}
                  {selectedPlayer.personalityTraits.length > 0 && (
                    <div>
                      <span className="text-[9px] font-black text-white/25 uppercase tracking-widest block mb-2">
                        Kişilik Özellikleri
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPlayer.personalityTraits.map((trait, i) => {
                          const isPositive = ['Profesyonel', 'Disiplinli', 'Çalışkan', 'Hırslı', 'Kazanan karakter', 'Takım oyuncusu', 'Sessiz lider', 'Sadık', 'Büyük maç oyuncusu', 'Soğukkanlı', 'Baskı sever'].includes(trait);
                          return (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                isPositive
                                  ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400/70'
                                  : 'bg-red-500/10 border-red-500/15 text-red-400/70'
                              }`}
                            >
                              {trait}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Position traits */}
                  {selectedPlayer.traits.length > 0 && (
                    <div>
                      <span className="text-[9px] font-black text-white/25 uppercase tracking-widest block mb-2">
                        Yetenek Özellikleri
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPlayer.traits.map((trait, i) => {
                          const level = selectedPlayer.traitLevels?.[trait];
                          const levelColor = level === 'MOR' ? 'text-red-400 border-red-400/25 bg-red-500/10'
                            : level === 'ALTIN' ? 'text-amber-300 border-amber-300/25 bg-amber-500/10'
                            : level === 'LACIVERT' ? 'text-blue-400 border-blue-400/25 bg-blue-500/10'
                            : 'text-white/40 border-white/10 bg-white/5';
                          return (
                            <span key={i} className={`px-2 py-0.5 rounded text-[9px] font-bold border ${levelColor}`}>
                              {trait}
                              {level && <span className="ml-1 opacity-60">[{level}]</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Value + Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                    <div>
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-1">
                        Tahmini Değer
                      </span>
                      <span className="text-lg font-mono font-black text-amber-400">
                        {formatCurrency(calculateYouthValue(selectedPlayer))}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {!selectedPlayer.scoutReport && (
                        <button
                          onClick={() => handleScoutPlayer(selectedPlayer)}
                          className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-500/20 transition-all flex items-center gap-2"
                        >
                          <Eye size={12} />
                          Scout Raporu Al
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const updated = youthPlayers.map(p =>
                            p.id === selectedPlayer.id
                              ? { ...p, scoutReport: generateScoutReport(p) }
                              : p
                          );
                          setYouthPlayers(updated);
                          setSelectedPlayer({ ...selectedPlayer, scoutReport: generateScoutReport(selectedPlayer) });
                        }}
                        className="px-4 py-2 bg-white/5 border border-white/[0.06] text-white/40 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
                      >
                        <RefreshCw size={12} />
                        Raporu Yenile
                      </button>
                      {checkYouthPromotion(selectedPlayer).ready && (
                        <button
                          onClick={() => handlePromote(selectedPlayer)}
                          className="px-5 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2"
                        >
                          <ArrowUpCircle size={14} />
                          A Takımına Al
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* No scout report yet */
                <div className="text-center py-12 space-y-4 relative z-10">
                  <Eye size={40} className="text-white/[0.06] mx-auto" />
                  <div>
                    <p className="text-[11px] font-bold text-white/20 uppercase tracking-widest">
                      Scout Raporu Yok
                    </p>
                    <p className="text-[10px] text-white/10 mt-1">
                      Bu oyuncu hakkında detaylı bilgi almak için scout görevi gönderin
                    </p>
                  </div>
                  <button
                    onClick={() => handleScoutPlayer(selectedPlayer)}
                    className="px-6 py-2.5 bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-400 transition-all flex items-center gap-2 mx-auto shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                  >
                    <Eye size={14} />
                    Scout Raporu Oluştur
                  </button>

                  {/* Still show basic stats even without scout report */}
                  <div className="mt-6 pt-6 border-t border-white/[0.04]">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-3">
                      Temel İstatistikler
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-md mx-auto">
                      {[
                        { key: 'speed', label: 'Hız' },
                        { key: 'passing', label: 'Pas' },
                        { key: 'shooting', label: 'Şut' },
                        { key: 'defending', label: 'Savunma' },
                        { key: 'power', label: 'Güç' },
                        { key: 'dribbling', label: 'Dribling' },
                        { key: 'stamina', label: 'Kondisyon' },
                        { key: 'vision', label: 'Görüş' },
                      ].map(stat => {
                        const val = (selectedPlayer as Record<string, any>)[stat.key] as number ?? 50;
                        return (
                          <div key={stat.key} className="text-center py-2 bg-black/20 rounded-lg">
                            <span className="text-[8px] text-white/20 block mb-0.5">{stat.label}</span>
                            <span className={`text-[12px] font-mono font-bold ${
                              val >= 65 ? 'text-amber-400' : val >= 55 ? 'text-white/60' : 'text-white/30'
                            }`}>
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          6. INTAKE CONFIRMATION DIALOG
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showIntakeConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-xl bg-black/80"
            onClick={() => setShowIntakeConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0d1117] border border-white/[0.06] rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 opacity-[0.03]">
                <Users size={150} />
              </div>

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
                  <RefreshCw size={28} className="text-amber-400" />
                </div>

                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white text-center mb-2">
                  Yeni Sezon Alımı
                </h3>
                <p className="text-[11px] text-white/40 text-center mb-6 leading-relaxed">
                  Akademi seviyenize uygun yeni genç oyuncular keşfedilecek. Her oyuncuya otomatik scout raporu oluşturulacak.
                </p>

                <div className="bg-black/30 border border-white/[0.04] rounded-xl p-4 mb-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30 font-bold uppercase">Beklenen Oyuncu</span>
                    <span className="text-[12px] font-mono font-bold text-white">1-3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30 font-bold uppercase">Yaş Aralığı</span>
                    <span className="text-[12px] font-mono font-bold text-white">15-21</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30 font-bold uppercase">Akademi Seviyesi</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < academyLevel ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-white/[0.04] pt-3 flex items-center justify-between">
                    <span className="text-[10px] text-amber-400/60 font-bold uppercase">Kredi Maliyeti</span>
                    <span className="text-[12px] font-mono font-bold text-amber-400">
                      10 KR
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30 font-bold uppercase">Mevcut Kredi</span>
                    <span className={`text-[12px] font-mono font-bold ${(credits || 0) >= 10 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {credits || 0} KR
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowIntakeConfirm(false)}
                    className="flex-1 py-3 bg-white/5 border border-white/[0.06] text-white/30 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-white/10 transition-all"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleIntake}
                    disabled={(credits || 0) < 10}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      (credits || 0) >= 10
                        ? 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                        : 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw size={14} />
                    Alımı Gerçekleştir (10 KR)
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
