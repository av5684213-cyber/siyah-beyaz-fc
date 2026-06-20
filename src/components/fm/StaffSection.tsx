'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Dumbbell,
  Heart,
  GraduationCap,
  Briefcase,
  BarChart3,
  UserMinus,
  UserPlus,
  Star,
  Users,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { useToast } from '@/lib/fm/ToastContext';

// =============================================
// TYPES
// =============================================

interface StaffMember {
  id: string;
  user_id: string;
  type: string;
  stars: number;
  name: string;
  contract_start_week: number;
  contract_end_week: number;
  total_cost: number;
  hired_at: string;
  staff_types: {
    name_tr: string;
    max_count: number;
    base_salary: number;
  };
}

interface StaffTypeConfig {
  type: string;
  name: string;
  maxCount: number;
  icon: React.ElementType;
  color: string;
  /** Is alim ucreti - her yildiz seviyesi icin Kredi */
  hireFeeKredi: Record<number, number>;
  /** Is alim ucreti - her yildiz seviyesi icin Euro */
  hireFeeEuro: Record<number, number>;
}

// =============================================
// CONSTANTS - NEW PRICING (Kredi + Euro)
// =============================================

const STAFF_TYPES: StaffTypeConfig[] = [
  {
    type: 'scout',
    name: 'Gozlemci',
    maxCount: 3,
    icon: Search,
    color: 'blue',
    hireFeeKredi: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
    hireFeeEuro: { 1: 400000, 2: 600000, 3: 800000, 4: 1000000, 5: 1200000 },
  },
  {
    type: 'coach',
    name: 'Yardimci Antrenor',
    maxCount: 3,
    icon: Dumbbell,
    color: 'amber',
    hireFeeKredi: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
    hireFeeEuro: { 1: 650000, 2: 800000, 3: 950000, 4: 1100000, 5: 1250000 },
  },
  {
    type: 'physio',
    name: 'Fizyoterapist',
    maxCount: 3,
    icon: Heart,
    color: 'emerald',
    hireFeeKredi: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
    hireFeeEuro: { 1: 200000, 2: 280000, 3: 360000, 4: 440000, 5: 520000 },
  },
  {
    type: 'youth_coordinator',
    name: 'Genclik Koordinatoru',
    maxCount: 2,
    icon: GraduationCap,
    color: 'purple',
    hireFeeKredi: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
    hireFeeEuro: { 1: 450000, 2: 600000, 3: 750000, 4: 900000, 5: 1050000 },
  },
  {
    type: 'sporting_director',
    name: 'Sportif Direktor',
    maxCount: 1,
    icon: Briefcase,
    color: 'rose',
    hireFeeKredi: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
    hireFeeEuro: { 1: 350000, 2: 500000, 3: 650000, 4: 800000, 5: 950000 },
  },
  {
    type: 'analyst',
    name: 'Mac Analisti',
    maxCount: 2,
    icon: BarChart3,
    color: 'cyan',
    hireFeeKredi: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
    hireFeeEuro: { 1: 150000, 2: 250000, 3: 350000, 4: 450000, 5: 550000 },
  },
];

// Color mapping for staff types
const COLOR_MAP: Record<string, { bg: string; border: string; text: string; iconBg: string; iconBorder: string; glow: string }> = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    iconBorder: 'border-blue-500/20',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.15)]',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    iconBorder: 'border-amber-500/20',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.15)]',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    iconBorder: 'border-emerald-500/20',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    iconBorder: 'border-purple-500/20',
    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.15)]',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
    iconBorder: 'border-rose-500/20',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.15)]',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    iconBorder: 'border-cyan-500/20',
    glow: 'shadow-[0_0_12px_rgba(6,182,212,0.15)]',
  },
};

// =============================================
// HELPER FUNCTIONS
// =============================================

function formatEuro(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M €`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K €`;
  }
  return `${amount} €`;
}

// =============================================
// MAIN COMPONENT
// =============================================

export default function StaffSection() {
  const { profile, setProfile } = useFM();
  const { success, error, warning } = useToast();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [remainingWeeks, setRemainingWeeks] = useState(34);
  const [loading, setLoading] = useState(true);
  const [hiringType, setHiringType] = useState<string | null>(null);
  const [firingId, setFiringId] = useState<string | null>(null);
  const [selectedStars, setSelectedStars] = useState<Record<string, number>>({});

  // -- Fetch staff data --
  const fetchStaff = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/staff?userId=${profile.id}`);
      if (!res.ok) {
        // API hatası olsa bile sayfayı çökertme, boş liste göster
        console.warn('[StaffSection] API responded with status:', res.status);
        setStaffList([]);
        setCurrentWeek(0);
        setRemainingWeeks(34);
      } else {
        const data = await res.json();
        setStaffList(data.staff || []);
        setCurrentWeek(data.currentWeek || 0);
        setRemainingWeeks(data.remainingWeeks || 34);
      }
    } catch (err) {
      // Network veya JSON parse hatası — sessizce boş liste göster
      console.warn('[StaffSection] Fetch error (graceful fallback):', err);
      setStaffList([]);
      setCurrentWeek(0);
      setRemainingWeeks(34);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // -- Get count of staff by type --
  const getCountByType = (type: string) => staffList.filter(s => s.type === type).length;

  // -- Hire handler --
  const handleHire = async (type: string, stars: number) => {
    if (!profile?.id) return;
    setHiringType(type);
    try {
      const res = await fetch('/api/staff/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, type, stars }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        console.error('[StaffSection] Hire failed:', { status: res.status, data });
        // Detaylı hata mesajı — debug bilgisini de göster
        let errMsg = data.message || 'İşe alım başarısız.';
        if (data.debug) {
          errMsg += ` (Kod: ${data.debug.code}${data.debug.hint ? ', İpucu: ' + data.debug.hint : ''})`;
        }
        error(errMsg);
        return;
      }

      const stConfig = STAFF_TYPES.find(st => st.type === type);
      const krediCost = stConfig?.hireFeeKredi[stars] || 0;
      const euroCost = stConfig?.hireFeeEuro[stars] || 0;

      success(`${data.staff.name} ise alindi! (${krediCost} Kredi + ${formatEuro(euroCost)})`);
      // Update profile credits and money locally
      setProfile((prev: any) => prev ? {
        ...prev,
        credits: data.remainingCredits,
        money: data.remainingMoney ?? prev.money,
        // Eğer scout ise scout_slots'u da güncelle
        ...(type === 'scout' ? { scout_slots: (prev.scout_slots ?? 0) + 1 } : {}),
      } : prev);
      await fetchStaff();
    } catch (err) {
      console.error('[StaffSection] Hire error:', err);
      error('Ise alim sirasinda hata olustu.');
    } finally {
      setHiringType(null);
    }
  };

  // -- Fire handler --
  const handleFire = async (staffId: string, staffName: string) => {
    if (!profile?.id) return;
    if (!window.confirm(`${staffName} isten cikarilacak. Devam edilsin mi?`)) return;
    setFiringId(staffId);
    try {
      const res = await fetch('/api/staff/fire', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, staffId }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        error(data.message || 'Isten cikarma basarisiz.');
        return;
      }

      success(data.message || 'Personel cikarildi.');
      // Eğer scout ise scout_slots'u azalt
      const firedStaff = staffList.find(s => s.id === staffId);
      if (firedStaff?.type === 'scout') {
        setProfile((prev: any) => prev ? {
          ...prev,
          scout_slots: Math.max(0, (prev.scout_slots ?? 0) - 1),
        } : prev);
      }
      await fetchStaff();
    } catch (err) {
      console.error('[StaffSection] Fire error:', err);
      error('Isten cikarma sirasinda hata olustu.');
    } finally {
      setFiringId(null);
    }
  };

  // -- Loading state --
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-amber-400" />
        <span className="ml-3 text-sm text-white/40 font-bold">Personel yukleniyor...</span>
      </div>
    );
  }

  const profileKredi = profile?.credits || 0;
  const profileEuro = profile?.money || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6"
    >
      {/* -- Section Header -- */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/[0.04] to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
              <Users size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">PERSONEL</h2>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Kadro Yonetimi</p>
            </div>
          </div>
          <p className="text-sm text-white/40 max-w-lg leading-relaxed">
            Personel ise alarak takiminiza stratejik avantajlar kazandin. Her personel turunun farkli etkileri vardir. Yildiz sayisi arttikca etki artar, ancak maliyet de yukselir.
          </p>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg">
              <Star size={10} className="text-amber-400" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">
                Kalan Hafta: {remainingWeeks}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/[0.06] border border-amber-500/20 rounded-lg">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                Kredi: {profileKredi}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                Butce: {formatEuro(profileEuro)}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">
                Toplam: {staffList.length} Personel
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* -- Staff Type Cards Grid -- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAFF_TYPES.map((st) => {
          const IconComp = st.icon;
          const colors = COLOR_MAP[st.color];
          const currentCount = getCountByType(st.type);
          const isMaxed = currentCount >= st.maxCount;
          const stars = selectedStars[st.type] || 1;
          const hireFeeKredi = st.hireFeeKredi[stars] || 0;
          const hireFeeEuro = st.hireFeeEuro[stars] || 0;
          const canAffordKredi = profileKredi >= hireFeeKredi;
          const canAffordEuro = profileEuro >= hireFeeEuro;
          const canAfford = canAffordKredi && canAffordEuro;
          const isHiring = hiringType === st.type;

          return (
            <motion.div
              key={st.type}
              layout
              className={`bg-zinc-900 border rounded-2xl p-5 transition-all group relative overflow-hidden ${
                isMaxed ? 'border-white/5 opacity-60' : 'border-white/5 hover:border-white/10'
              }`}
            >
              {/* Maxed overlay */}
              {isMaxed && (
                <div className="absolute top-0 left-0 w-full h-full bg-black/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <div className={`px-4 py-2 rounded-xl ${colors.bg} border ${colors.border}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${colors.text}`}>
                      KOTA DOLU
                    </span>
                  </div>
                </div>
              )}

              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colors.iconBg} ${colors.iconBorder}`}>
                  <IconComp size={20} className={colors.text} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-white/40">
                    {currentCount}/{st.maxCount}
                  </span>
                  <div className="flex gap-0.5 mt-1 justify-end">
                    {[...Array(st.maxCount)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-1 rounded-full ${
                          i < currentCount ? colors.text.replace('text-', 'bg-') : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Name */}
              <h3 className="text-sm font-black italic uppercase tracking-tighter text-white mb-1 group-hover:text-amber-400 transition-colors">
                {st.name}
              </h3>

              {/* Star Selector */}
              <div className="mb-3">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1.5">
                  Yildiz Seviyesi
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedStars(prev => ({ ...prev, [st.type]: s }))}
                      className={`transition-all rounded-lg p-1.5 ${
                        s <= stars
                          ? `${colors.bg} border ${colors.border}`
                          : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05]'
                      }`}
                    >
                      <Star
                        size={12}
                        className={`transition-all ${
                          s <= stars ? `${colors.text} fill-current` : 'text-white/15'
                        }`}
                      />
                    </button>
                  ))}
                  <span className={`ml-2 text-xs font-black ${colors.text} self-center`}>
                    {stars}★
                  </span>
                </div>
              </div>

              {/* Cost Info - New Dual Currency */}
              <div className="space-y-1.5 mb-4 px-3 py-2.5 bg-black/30 rounded-xl border border-white/[0.04]">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider">Ise Alim Ucreti (Kredi)</span>
                  <span className={`text-[10px] font-black tabular-nums ${canAffordKredi ? 'text-amber-400' : 'text-red-400'}`}>
                    {hireFeeKredi} Kredi
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider">Ise Alim Ucreti (Euro)</span>
                  <span className={`text-[10px] font-black tabular-nums ${canAffordEuro ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatEuro(hireFeeEuro)}
                  </span>
                </div>
                <div className="h-px bg-white/5 my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Toplam Maliyet</span>
                  <span className="text-[10px] font-black text-white/80 tabular-nums">
                    {hireFeeKredi} Kredi + {formatEuro(hireFeeEuro)}
                  </span>
                </div>
              </div>

              {/* Insufficient balance warnings */}
              {!canAfford && !isMaxed && (
                <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    {!canAffordKredi && !canAffordEuro
                      ? 'YETERSIZ KREDI VE EURO'
                      : !canAffordKredi
                      ? 'YETERSIZ KREDI'
                      : 'YETERSIZ EURO'}
                  </p>
                </div>
              )}

              {/* Hire Button */}
              <button
                onClick={() => handleHire(st.type, stars)}
                disabled={isMaxed || !canAfford || isHiring}
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  isMaxed
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                    : !canAfford
                    ? 'bg-white/5 text-red-400/50 cursor-not-allowed'
                    : isHiring
                    ? 'bg-amber-500/20 text-amber-400 cursor-wait'
                    : 'bg-white text-black hover:bg-amber-500 hover:text-black active:scale-95'
                }`}
              >
                {isHiring ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Ise Aliniyor...
                  </>
                ) : isMaxed ? (
                  'KOTA DOLU'
                ) : !canAfford ? (
                  <>
                    <AlertCircle size={10} />
                    YETERSIZ BAKIYE
                  </>
                ) : (
                  <>
                    <UserPlus size={12} />
                    ISE AL - {hireFeeKredi} KREDI + {formatEuro(hireFeeEuro)}
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* -- Active Staff List -- */}
      {staffList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-white/5 rounded-[2rem] p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users size={14} className="text-amber-400" />
            <h3 className="text-sm font-black italic uppercase tracking-tighter text-white">
              Aktif Personel
            </h3>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">
              {staffList.length} KISI
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            <AnimatePresence>
              {staffList.map((staff) => {
                const stConfig = STAFF_TYPES.find(st => st.type === staff.type);
                const colors = stConfig ? COLOR_MAP[stConfig.color] : COLOR_MAP.amber;
                const IconComp = stConfig?.icon || Users;
                const isFiring = firingId === staff.id;

                return (
                  <motion.div
                    key={staff.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center justify-between p-3 rounded-xl ${colors.bg} border ${colors.border} transition-all hover:bg-white/[0.03]`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.iconBg} border ${colors.iconBorder}`}>
                        <IconComp size={14} className={colors.text} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{staff.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {/* Star rating */}
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                size={8}
                                className={s <= staff.stars ? `${colors.text} fill-current` : 'text-white/10'}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-white/20">|</span>
                          <span className="text-[10px] font-bold text-white/30">
                            {stConfig ? `${stConfig.hireFeeKredi[staff.stars]} Kredi + ${formatEuro(stConfig.hireFeeEuro[staff.stars])}` : `${staff.total_cost} Kredi`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleFire(staff.id, staff.name)}
                      disabled={isFiring}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-red-500/10 hover:border-red-500/20 transition-all text-[10px] font-black uppercase tracking-wider text-white/30 hover:text-red-400 disabled:opacity-50"
                    >
                      {isFiring ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <UserMinus size={10} />
                      )}
                      {isFiring ? 'Cikariliyor...' : 'Isten Cikar'}
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* -- Empty State -- */}
      {staffList.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users size={32} className="mx-auto text-white/10 mb-3" />
          <p className="text-sm text-white/20 font-bold">Henuz personel ise almadiniz.</p>
          <p className="text-xs text-white/10 mt-1">Yukaridaki kartlardan personel ise alarak baslayin.</p>
        </motion.div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </motion.div>
  );
}
