'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Eye,
  Dumbbell,
  Heart,
  Star,
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
  AlertCircle,
  Check,
  X,
  Plus,
  Minus,
  ArrowLeft,
  Binoculars,
  UserCheck,
} from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { formatCurrency } from '@/lib/fm/valuation';

// ─── Personnel Type Definitions ──────────────────────────────────
interface PersonnelType {
  id: 'scout' | 'coach' | 'physio';
  name: string;
  description: string;
  icon: React.ElementType;
  contractCost: number;     // One-time hiring fee (credits)
  monthlyFee: number;       // Monthly cost (in-game money)
  maxSlots: number;
  effect: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const PERSONNEL_TYPES: PersonnelType[] = [
  {
    id: 'scout',
    name: 'Gözlemci',
    description: 'Oyuncu keşif ağı genişler. Daha fazla gözlemci, daha detaylı arama yapmanızı sağlar.',
    icon: Binoculars,
    contractCost: 50,
    monthlyFee: 500000,
    maxSlots: 3,
    effect: 'Her gözlemci arama seviyesi açar: 1=Temel, 2=Genişletilmiş, 3=Detaylı',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    id: 'coach',
    name: 'Yardımcı Antrenör',
    description: 'Antrenman verimliliğini artırır. Oyuncular daha hızlı gelişir.',
    icon: Dumbbell,
    contractCost: 75,
    monthlyFee: 750000,
    maxSlots: 3,
    effect: 'Her antrenör antrenman verimliliğini +%15 artırır (max +%45)',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    id: 'physio',
    name: 'Fizyoterapist',
    description: 'Sakatlık iyileşme süresini kısaltır ve sakatlık riskini azaltır.',
    icon: Heart,
    contractCost: 60,
    monthlyFee: 600000,
    maxSlots: 3,
    effect: 'Her fizyoterapist sakatlık iyileşme hızını +%20 artırır (max +%60)',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
  },
];

export default function StaffPage() {
  const { profile, setProfile } = useFM();
  const [showHireModal, setShowHireModal] = useState<PersonnelType | null>(null);
  const [showFireModal, setShowFireModal] = useState<{ type: PersonnelType; slot: number } | null>(null);

  // ── Current staff counts ──
  const scoutCount = profile?.scout_slots ?? 0;
  const coachCount = profile?.staff_coaches ?? 0;
  const physioCount = profile?.staff_physios ?? 0;

  const staffCounts = useMemo(() => ({
    scout: scoutCount,
    coach: coachCount,
    physio: physioCount,
  }), [scoutCount, coachCount, physioCount]);

  const totalMonthlyFee = useMemo(() => {
    return PERSONNEL_TYPES.reduce((total, pt) => {
      return total + (staffCounts[pt.id] * pt.monthlyFee);
    }, 0);
  }, [staffCounts]);

  // ── Hire handler ──
  const handleHire = (type: PersonnelType) => {
    if (!profile) return;

    const currentCount = staffCounts[type.id];
    if (currentCount >= type.maxSlots) {
      alert('Maksimum slot sayısına ulaştınız!');
      return;
    }

    if ((profile.credits || 0) < type.contractCost) {
      alert(`Yetersiz kredi! ${type.contractCost} kredi gerekiyor.`);
      return;
    }

    const updatedProfile = { ...profile, credits: (profile.credits || 0) - type.contractCost };

    if (type.id === 'scout') {
      updatedProfile.scout_slots = (updatedProfile.scout_slots ?? 0) + 1;
    } else if (type.id === 'coach') {
      updatedProfile.staff_coaches = (updatedProfile.staff_coaches ?? 0) + 1;
    } else if (type.id === 'physio') {
      updatedProfile.staff_physios = (updatedProfile.staff_physios ?? 0) + 1;
    }

    setProfile(updatedProfile);
    setShowHireModal(null);
  };

  // ── Fire handler ──
  const handleFire = (type: PersonnelType, _slot: number) => {
    if (!profile) return;

    const currentCount = staffCounts[type.id];
    if (currentCount <= 0) return;

    const updatedProfile = { ...profile };

    if (type.id === 'scout') {
      updatedProfile.scout_slots = Math.max(0, (updatedProfile.scout_slots ?? 0) - 1);
    } else if (type.id === 'coach') {
      updatedProfile.staff_coaches = Math.max(0, (updatedProfile.staff_coaches ?? 0) - 1);
    } else if (type.id === 'physio') {
      updatedProfile.staff_physios = Math.max(0, (updatedProfile.staff_physios ?? 0) - 1);
    }

    setProfile(updatedProfile);
    setShowFireModal(null);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Activity className="w-8 h-8 text-white animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
              <ArrowLeft size={18} className="text-white/40" />
            </a>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter text-white">Personel Yönetimi</h1>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Gözlemci, Antrenör, Fizyoterapist</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl">
              <span className="text-[10px] font-black text-white/20 uppercase block leading-none mb-1">Kredi</span>
              <span className="text-sm font-mono font-bold text-amber-400 leading-none">
                {profile.credits || 0}
              </span>
            </div>
            <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl">
              <span className="text-[10px] font-black text-white/20 uppercase block leading-none mb-1">Aylık Personel</span>
              <span className="text-sm font-mono font-bold text-red-400 leading-none">
                -{formatCurrency(totalMonthlyFee)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-32">
        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-4">
          {PERSONNEL_TYPES.map((pt) => {
            const count = staffCounts[pt.id];
            return (
              <div key={pt.id} className={`${pt.bgColor} border ${pt.borderColor} rounded-2xl p-5`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${pt.bgColor} rounded-xl flex items-center justify-center border ${pt.borderColor}`}>
                    <pt.icon size={18} className={pt.color} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-white/70">{pt.name}</p>
                    <p className={`text-2xl font-black font-mono ${pt.color}`}>{count}<span className="text-white/20 text-sm">/{pt.maxSlots}</span></p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(pt.maxSlots)].map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i < count ? pt.color.replace('text-', 'bg-') : 'bg-white/5'}`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Personnel Cards */}
        <div className="space-y-6">
          {PERSONNEL_TYPES.map((pt) => {
            const count = staffCounts[pt.id];
            return (
              <motion.div
                key={pt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-white/5 rounded-[2rem] p-6 relative overflow-hidden"
              >
                <div className="absolute -right-8 -top-8 opacity-5">
                  <pt.icon size={120} />
                </div>

                {/* Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${pt.bgColor} rounded-2xl flex items-center justify-center border ${pt.borderColor}`}>
                      <pt.icon size={28} className={pt.color} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tighter text-white">{pt.name}</h2>
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">{pt.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 ${pt.bgColor} ${pt.borderColor} border rounded-xl text-sm font-black font-mono ${pt.color}`}>
                      {count}/{pt.maxSlots}
                    </span>
                    {count < pt.maxSlots && (
                      <button
                        onClick={() => setShowHireModal(pt)}
                        className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-all flex items-center gap-1.5"
                      >
                        <Plus size={12} />
                        İŞE AL
                      </button>
                    )}
                  </div>
                </div>

                {/* Effect Info */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={12} className={pt.color} />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Etki</span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{pt.effect}</p>
                </div>

                {/* Active Slots */}
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(pt.maxSlots)].map((_, i) => {
                    const isFilled = i < count;
                    return (
                      <div 
                        key={i}
                        className={`rounded-2xl p-5 border transition-all ${
                          isFilled 
                            ? `${pt.bgColor} ${pt.borderColor}` 
                            : 'bg-white/[0.02] border-dashed border-white/10'
                        }`}
                      >
                        {isFilled ? (
                          <div className="text-center space-y-2">
                            <div className={`w-10 h-10 ${pt.bgColor} rounded-xl flex items-center justify-center border ${pt.borderColor} mx-auto`}>
                              <pt.icon size={18} className={pt.color} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                                {pt.name} #{i + 1}
                              </p>
                              <p className="text-[8px] text-white/20 uppercase tracking-widest mt-0.5">
                                Aylık: {formatCurrency(pt.monthlyFee)}
                              </p>
                            </div>
                            <button
                              onClick={() => setShowFireModal({ type: pt, slot: i + 1 })}
                              className="px-3 py-1 bg-red-500/10 text-red-400 text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-red-500/20 transition-all"
                            >
                              İştiraf Et
                            </button>
                          </div>
                        ) : (
                          <div className="text-center space-y-2">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mx-auto">
                              <Plus size={18} className="text-white/20" />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Boş Slot</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Cost Summary */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                    Aylık Toplam Maliyet ({count} {pt.name})
                  </span>
                  <span className="text-xs font-black font-mono text-red-400">
                    -{formatCurrency(count * pt.monthlyFee)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-zinc-900 border border-white/5 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign size={18} className="text-white/40" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white/70">Personel Maliyet Özeti</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">İşe Alım Maliyeti</span>
                <span className="text-xs font-black font-mono text-amber-400">{PERSONNEL_TYPES.reduce((t, pt) => t + staffCounts[pt.id] * pt.contractCost, 0)} KR</span>
              </div>
              <p className="text-[8px] text-white/15 uppercase tracking-widest">Toplam harcanan kredi</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Aylık Ücret</span>
                <span className="text-xs font-black font-mono text-red-400">-{formatCurrency(totalMonthlyFee)}</span>
              </div>
              <p className="text-[8px] text-white/15 uppercase tracking-widest">Her ay kesilecek tutar</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Toplam Personel</span>
                <span className="text-xs font-black font-mono text-white/60">
                  {scoutCount + coachCount + physioCount}/{PERSONNEL_TYPES.reduce((t, pt) => t + pt.maxSlots, 0)}
                </span>
              </div>
              <p className="text-[8px] text-white/15 uppercase tracking-widest">Aktif / Maksimum</p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Hire Confirmation Modal ── */}
      <AnimatePresence>
        {showHireModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#111] border border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 ${showHireModal.bgColor} rounded-2xl flex items-center justify-center border ${showHireModal.borderColor}`}>
                  <showHireModal.icon size={28} className={showHireModal.color} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white">{showHireModal.name} İşe Al</h3>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">Yeni personel ekle</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-white/40">İşe Alım Ücreti</span>
                  <span className="text-sm font-black font-mono text-amber-400">{showHireModal.contractCost} Kredi</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-white/40">Aylık Ücret</span>
                  <span className="text-sm font-black font-mono text-red-400">{formatCurrency(showHireModal.monthlyFee)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-white/40">Etki</span>
                  <span className={`text-xs font-bold ${showHireModal.color}`}>{showHireModal.effect}</span>
                </div>
              </div>

              {(profile.credits || 0) < showHireModal.contractCost && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 mb-4">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <span className="text-[10px] font-bold text-red-300 uppercase tracking-widest">Yetersiz kredi!</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowHireModal(null)}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-white/5 text-white/40 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                >
                  İPTAL
                </button>
                <button
                  onClick={() => handleHire(showHireModal)}
                  disabled={(profile.credits || 0) < showHireModal.contractCost || staffCounts[showHireModal.id] >= showHireModal.maxSlots}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Check size={12} />
                  ONAYLA
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fire Confirmation Modal ── */}
      <AnimatePresence>
        {showFireModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#111] border border-red-500/20 rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                  <X size={28} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white">İştiraf Et</h3>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                    {showFireModal.type.name} #{showFireModal.slot}
                  </p>
                </div>
              </div>

              <p className="text-xs text-white/50 mb-6 leading-relaxed">
                Bu personeli iştiraf etmek istediğinize emin misiniz? İşe alım ücreti iade edilmez. Aylık ücret kesintisi durdurulacak.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFireModal(null)}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-white/5 text-white/40 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                >
                  VAZGEÇ
                </button>
                <button
                  onClick={() => handleFire(showFireModal.type, showFireModal.slot)}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                >
                  İŞTİRAF ET
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Activity({ className, size }: { className?: string; size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>
    </svg>
  );
}
