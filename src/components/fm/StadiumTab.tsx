'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Zap, 
  TrendingUp, 
  ChevronRight,
  ChevronLeft,
  Star,
  X as XIcon,
  RefreshCw,
  Ticket,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
  Clock,
  Coins,
  Shield,
  Target,
  Heart,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { useToast } from '@/lib/fm/ToastContext';
import { formatCurrency } from '@/lib/fm/valuation';
import StaffSection from './StaffSection';
import RefereeSection from './RefereeSection';
import { 
  STADIUM_MATRIX, 
  calculateUpgradeCost, 
  getManagerLevelRequirement, 
  getFacilityBenefit, 
  getLevelEffect,
  FACILITY_LEVEL_BENEFITS,
  LevelEffectResult
} from '@/lib/fm/stadiumMatrix';

interface AcademyStep {
  level: number;
  name: string;
  buff: string;
  desc: string;
  cost: number;
}

const ACADEMY_STEPS: AcademyStep[] = [
  { level: 1, name: "Mahalle Okulu", buff: "+1 Oyuncu", desc: "Yılda 1 kez düşük potansiyelli (Tier 1) oyuncu çıkar.", cost: 500000 },
  { level: 2, name: "Toprak Saha", buff: "%5 Gelişim Hızı", desc: "Altyapı oyuncuları antrenmanlarda biraz daha hızlı gelişir.", cost: 1500000 },
  { level: 3, name: "Yatılı Yurt", buff: "Moral Koruması", desc: "Çıkan oyuncular takıma daha bağlı (Loyalty) başlar.", cost: 3000000 },
  { level: 4, name: "Bölge Gözlem Ağı", buff: "+2 Oyuncu", desc: "Her sezon 2 oyuncu seçme şansı verir.", cost: 7500000 },
  { level: 5, name: "Sentetik Tesisler", buff: "Kondisyon +10", desc: "Gençler as kadroya çıktığında maç kondisyonları daha yüksek olur.", cost: 15000000 },
  { level: 6, name: "Bilimsel Veri Merkezi", buff: "Mevki Odaklılık", desc: "Oyuncunun hangi mevkide çıkacağını seçme ihtimali doğar.", cost: 30000000 },
  { level: 7, name: "Elit Kolej Sistemi", buff: "Potansiyel +15", desc: "Çıkan oyuncuların maksimum ulaşabileceği yetenek sınırı artar.", cost: 75000000 },
  { level: 8, name: "Uluslararası Kamp", buff: "Pazar Değeri", desc: "Bu seviyeden çıkan oyuncuların başlangıç satış fiyatı %25 yüksektir.", cost: 150000000 },
  { level: 9, name: "Yüksek Performans Lab.", buff: "Özel Yetenek", desc: "Oyuncuların '%10 şansla' pasif özelliklerle doğma şansı olur.", cost: 300000000 },
  { level: 10, name: "Yıldız Fabrikası", buff: "Tier 10 Wonderkid", desc: "En yüksek seviye arketipli oyuncular (wonderkid) üretilir.", cost: 1000000000 },
];

// ═══════════════════════════════════════════════════
// ETKİ TİPİ İKON VE RENK EŞLEME
// ═══════════════════════════════════════════════════
type EffectCategory = 'income' | 'performance' | 'recovery' | 'special' | 'training';

function getEffectCategory(effectKey: string): EffectCategory {
  if (effectKey.includes('Revenue') || effectKey.includes('Income') || effectKey.includes('income'))
    return 'income';
  if (effectKey.includes('Performance') || effectKey.includes('Accuracy') || effectKey.includes('Pass') || effectKey.includes('Night'))
    return 'performance';
  if (effectKey.includes('Recovery') || effectKey.includes('Protection') || effectKey.includes('Winter'))
    return 'recovery';
  if (effectKey.includes('Sponsor') || effectKey.includes('Multiplier') || effectKey.includes('Quality'))
    return 'training';
  return 'special';
}

function getEffectStyle(category: EffectCategory) {
  const styles: Record<EffectCategory, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    income: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/25',
      text: 'text-emerald-400',
      icon: <Coins size={10} />,
    },
    performance: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/25',
      text: 'text-amber-400',
      icon: <Target size={10} />,
    },
    recovery: {
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/25',
      text: 'text-sky-400',
      icon: <Heart size={10} />,
    },
    training: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/25',
      text: 'text-purple-400',
      icon: <BarChart3 size={10} />,
    },
    special: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/25',
      text: 'text-rose-400',
      icon: <Sparkles size={10} />,
    },
  };
  return styles[category];
}

// ═══════════════════════════════════════════════════
// SEVİYE KARŞILAŞTIRMA KARTI
// ═══════════════════════════════════════════════════
function LevelComparisonPanel({ 
  facilityId, 
  currentLevel, 
  targetLevel,
  maxLevel 
}: { 
  facilityId: string; 
  currentLevel: number; 
  targetLevel: number;
  maxLevel: number;
}) {
  const currentEffect = currentLevel > 0 ? getLevelEffect(facilityId, currentLevel) : null;
  const targetEffect = getLevelEffect(facilityId, targetLevel);
  const currentBenefit = currentLevel > 0 ? getFacilityBenefit(facilityId, currentLevel) : 'Temel seviye — etki yok';
  const targetBenefit = getFacilityBenefit(facilityId, targetLevel);
  const isUpgrade = targetLevel > currentLevel;
  const isDowngrade = targetLevel < currentLevel;

  return (
    <div className={`rounded-xl border p-3 transition-all ${
      isUpgrade ? 'bg-amber-500/[0.06] border-amber-500/20' : 
      isDowngrade ? 'bg-red-500/[0.04] border-red-500/15' :
      'bg-black/40 border-white/[0.06]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
          OYUN ETKİSİ
        </span>
        {isUpgrade && (
          <span className="flex items-center gap-1 text-[7px] font-black text-amber-400 uppercase tracking-widest">
            <ArrowUpRight size={9} />
            YÜKSELTME ÖNİZLEME
          </span>
        )}
        {isDowngrade && (
          <span className="flex items-center gap-1 text-[7px] font-black text-red-400/60 uppercase tracking-widest">
            <ArrowDownRight size={9} />
            ÖNCEKİ SEVİYE
          </span>
        )}
      </div>

      {/* Effect comparison */}
      {targetEffect && (
        <div className="space-y-2">
          {/* Current Level Effect */}
          {currentEffect && currentLevel > 0 && (
            <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg ${
              isUpgrade ? 'bg-white/[0.03] border border-white/[0.06]' : ''
            }`}>
              <div className="flex items-center gap-2">
                {getEffectStyle(getEffectCategory(currentEffect.key)).icon}
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider">
                  Lv.{currentLevel} — {currentEffect.label}
                </span>
              </div>
              <span className="text-[10px] font-black text-white/50 tabular-nums">
                {currentEffect.key.includes('Multiplier') || currentEffect.key.includes('Bonus') || currentEffect.key.includes('Speed')
                  ? `×${currentEffect.value.toFixed(2)}`
                  : currentEffect.key.includes('Revenue') || currentEffect.key.includes('Income')
                    ? `${(currentEffect.value / 1000).toFixed(0)}K €`
                    : `${(currentEffect.value * 100).toFixed(0)}%`
                }
              </span>
            </div>
          )}

          {/* Arrow indicator for upgrades */}
          {isUpgrade && currentEffect && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-px bg-amber-500/30" />
                <ArrowUpRight size={10} className="text-amber-400" />
                <div className="w-8 h-px bg-amber-500/30" />
              </div>
            </div>
          )}

          {/* Target Level Effect */}
          <div className={`flex items-center justify-between px-2.5 py-2 rounded-lg ${
            isUpgrade ? getEffectStyle(getEffectCategory(targetEffect.key)).bg + ' ' + getEffectStyle(getEffectCategory(targetEffect.key)).border + ' border' : ''
          }`}>
            <div className="flex items-center gap-2">
              {getEffectStyle(getEffectCategory(targetEffect.key)).icon}
              <span className={`text-[8px] font-bold uppercase tracking-wider ${
                isUpgrade ? getEffectStyle(getEffectCategory(targetEffect.key)).text : 'text-white/40'
              }`}>
                Lv.{targetLevel} — {targetEffect.label}
              </span>
            </div>
            <span className={`text-[11px] font-black tabular-nums ${
              isUpgrade ? getEffectStyle(getEffectCategory(targetEffect.key)).text : 'text-white/50'
            }`}>
              {targetEffect.key.includes('Multiplier') || targetEffect.key.includes('Bonus') || targetEffect.key.includes('Speed')
                ? `×${targetEffect.value.toFixed(2)}`
                : targetEffect.key.includes('Revenue') || targetEffect.key.includes('Income')
                  ? `${(targetEffect.value / 1000).toFixed(0)}K €`
                  : `${(targetEffect.value * 100).toFixed(0)}%`
              }
            </span>
          </div>

          {/* Delta display for upgrades */}
          {isUpgrade && currentEffect && (
            <div className="flex justify-center pt-1">
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <ArrowUpRight size={8} className="text-emerald-400" />
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider">
                  +{((targetEffect.value - currentEffect.value) * 100).toFixed(0)}% etki artışı
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Text benefit description */}
      <div className="mt-2.5 pt-2 border-t border-white/[0.04]">
        <p className={`text-[9px] font-bold leading-relaxed uppercase ${
          isUpgrade ? 'text-amber-300/70' : isDowngrade ? 'text-red-300/40' : 'text-white/40'
        }`}>
          {targetBenefit}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
export default function StadiumTab() {
  const { profile, setProfile } = useFM();
  const { success, error, warning, info } = useToast();
  const stadiumUpgrades = profile?.stadium_upgrades || {};
  
  const [ticketPrice, setTicketPrice] = useState(profile?.ticket_price || 20);
  const [stadiumNameInput, setStadiumNameInput] = useState(profile?.stadium_name || '');
  const [previewLevels, setPreviewLevels] = useState<Record<string, number>>({});
  const [expandedFacility, setExpandedFacility] = useState<string | null>(null);
  const currentAcademyLevel = profile?.academy_level || 0;
  const nextAcademyStep = ACADEMY_STEPS[currentAcademyLevel];
  const isUpgrading = !!profile?.active_upgrade_type;
  const speedUpUsed = !!profile?.active_upgrade_speedup;
  const remainingDays = Math.max(0, (profile?.active_upgrade_finish_day || 0) - (profile?.current_day || 0));
  const canSpeedUp = isUpgrading && !speedUpUsed && remainingDays > 0 && (profile?.credits || 0) >= 5;

  // ── Real-time countdown for active upgrade ──
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number; totalMs: number } | null>(null);

  const computeCountdown = useCallback(() => {
    if (!profile?.active_upgrade_end_at) {
      setCountdown(null);
      return;
    }
    const endAt = new Date(profile.active_upgrade_end_at).getTime();
    const now = Date.now();
    const diff = endAt - now;
    if (diff <= 0) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    setCountdown({ days, hours, minutes, seconds, totalMs: diff });
  }, [profile?.active_upgrade_end_at]);

  useEffect(() => {
    computeCountdown();
    const interval = setInterval(computeCountdown, 1000);
    return () => clearInterval(interval);
  }, [computeCountdown]);

  const getUpgradeDuration = (level: number) => {
    if (level <= 2) return 2;
    return Math.floor(2 * Math.pow(1.5, level - 2));
  };

  const handleUpdateTicketPrice = (price: number) => {
    if (!profile) return;
    const finalPrice = Math.min(90, Math.max(0, price));
    setTicketPrice(finalPrice);
    setProfile({ ...profile, ticket_price: finalPrice });
  };

  const handleStartUpgrade = (id: string, cost: number, currentLvl: number) => {
    if (!profile) return;
    
    if (isUpgrading) {
      warning('Şu anda devam eden bir geliştirme var!');
      return;
    }

    const reqLevel = getManagerLevelRequirement(currentLvl + 1);
    if (profile.level < reqLevel) {
      warning(`Bu seviye için Menajer Seviyesi ${reqLevel} gerekiyor!`);
      return;
    }

    if (profile.money < cost) {
      error('Yetersiz bütçe!');
      return;
    }

    const duration = getUpgradeDuration(currentLvl + 1);
    const finishDay = profile.current_day + duration;
    const startedAt = new Date().toISOString();
    const endAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();

    setProfile({
      ...profile,
      money: profile.money - cost,
      active_upgrade_type: id === 'academy' ? 'academy' : 'stadium_matrix',
      active_upgrade_id: id,
      active_upgrade_finish_day: finishDay,
      active_upgrade_speedup: false,
      active_upgrade_started_at: startedAt,
      active_upgrade_end_at: endAt,
    });
  };

  const handleCancelUpgrade = () => {
    if (!profile) return;
    if (!confirm('İnşaatı iptal etmek istiyor musunuz? Harcanan bütçenin %50\'si iade edilir.')) return;
    let refundMoney = 0;
    if (profile.active_upgrade_type === 'stadium_matrix') {
      const currentLevel = stadiumUpgrades[profile.active_upgrade_id!] || 0;
      const cost = calculateUpgradeCost(250000, currentLevel + 1);
      refundMoney = Math.floor(cost * 0.5);
    } else if (profile.active_upgrade_type === 'academy') {
      const nextStep = ACADEMY_STEPS[currentAcademyLevel];
      if (nextStep) refundMoney = Math.floor(nextStep.cost * 0.5);
    }

    setProfile({
      ...profile,
      money: (profile.money || 0) + refundMoney,
      active_upgrade_type: null,
      active_upgrade_id: null,
      active_upgrade_finish_day: null,
      active_upgrade_speedup: null,
      active_upgrade_started_at: null,
      active_upgrade_end_at: null,
    });

    success(`İnşaat iptal edildi. ${formatCurrency(refundMoney)} iade edildi.`);
  };

  const handleSpeedUpUpgrade = () => {
    if (!profile || !canSpeedUp) return;
    const speedUpCost = 5;
    if ((profile.credits || 0) < speedUpCost) {
      error(`Yetersiz kredi! ${speedUpCost} kredi gerekli.`);
      return;
    }
    if (!confirm(`Geliştirme süresini yarıya indirmek için ${speedUpCost} Kredi harcanacak. Onaylıyor musun?`)) return;

    // Half the remaining real-time
    let newEndAt: string | null = null;
    if (profile.active_upgrade_end_at) {
      const currentEnd = new Date(profile.active_upgrade_end_at).getTime();
      const now = Date.now();
      const remaining = currentEnd - now;
      newEndAt = new Date(now + remaining / 2).toISOString();
    }

    // Half the game-day remaining too
    const currentDay = profile.current_day || 0;
    const finishDay = profile.active_upgrade_finish_day || 0;
    const halfWay = currentDay + Math.ceil((finishDay - currentDay) / 2);

    setProfile({
      ...profile,
      credits: (profile.credits || 0) - speedUpCost,
      active_upgrade_finish_day: halfWay,
      active_upgrade_speedup: true,
      active_upgrade_end_at: newEndAt,
    });

    success(`Yükseltme hızlandırıldı! ${speedUpCost} kredi harcandı.`);
  };

  const calculateTotalStars = () => {
    const sum = Object.values(stadiumUpgrades).reduce<number>((a, b) => a + (b as number), 0);
    return Math.min(5, Math.max(1, Math.ceil(sum / 20))); 
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 pb-24 relative"
    >
      {/* ── Active Upgrade Banner ── */}
      {isUpgrading && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white p-5 rounded-[2rem] flex items-center justify-between shadow-lg border border-amber-500/20 backdrop-blur-sm"
        >
          <div className="flex items-center gap-5">
             <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
               <RefreshCw size={22} className="text-amber-400 animate-spin" />
             </div>
             <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40">aktif yükseltme</p>
                <h4 className="text-lg font-black italic uppercase">
                  {profile.active_upgrade_type === 'academy' ? 'Yetiştirme Merkezi' : STADIUM_MATRIX.find(m => m.id === profile.active_upgrade_id)?.originalName} 
                  <span className="ml-3 text-amber-400 text-sm tracking-widest font-bold">LV. {(stadiumUpgrades[profile.active_upgrade_id!] || 0) + 1}</span>
                </h4>
                {/* Show the effect of the upgrade in progress */}
                {(() => {
                  const upgId = profile.active_upgrade_id!;
                  const nextLvl = (stadiumUpgrades[upgId] || 0) + 1;
                  const effect = getLevelEffect(upgId, nextLvl);
                  if (effect) {
                    const style = getEffectStyle(getEffectCategory(effect.key));
                    return (
                      <div className={`inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full ${style.bg} border ${style.border}`}>
                        {style.icon}
                        <span className={`text-[8px] font-black uppercase tracking-wider ${style.text}`}>
                          {effect.label}: {
                            effect.key.includes('Multiplier') || effect.key.includes('Bonus') || effect.key.includes('Speed')
                              ? `×${effect.value.toFixed(2)}`
                              : effect.key.includes('Revenue') || effect.key.includes('Income')
                                ? `${(effect.value / 1000).toFixed(0)}K €`
                                : `${(effect.value * 100).toFixed(0)}%`
                          }
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/30">tamamlanmasına</p>
                {countdown && countdown.totalMs > 0 ? (
                  <div className="flex items-center gap-1 justify-end">
                    {countdown.days > 0 && (
                      <span className="text-3xl font-black italic tracking-tighter text-white tabular-nums">
                        {countdown.days}<span className="text-sm opacity-40 not-italic uppercase font-bold ml-0.5">g</span>
                      </span>
                    )}
                    <span className="text-2xl font-black italic tracking-tighter text-white tabular-nums">
                      {String(countdown.hours).padStart(2, '0')}<span className="text-sm opacity-40 not-italic">:</span>
                      {String(countdown.minutes).padStart(2, '0')}<span className="text-sm opacity-40 not-italic">:</span>
                      {String(countdown.seconds).padStart(2, '0')}
                    </span>
                  </div>
                ) : (
                  <p className="text-3xl font-black italic tracking-tighter text-white">{remainingDays} <span className="text-sm opacity-40 not-italic uppercase font-bold">gün</span></p>
                )}
                {/* Progress bar based on real-time countdown */}
                {profile.active_upgrade_started_at && profile.active_upgrade_end_at && countdown && (
                  <div className="mt-1.5">
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      {(() => {
                        const total = new Date(profile.active_upgrade_end_at).getTime() - new Date(profile.active_upgrade_started_at).getTime();
                        const elapsed = total - countdown.totalMs;
                        const pct = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0;
                        return <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${pct}%` }} />;
                      })()}
                    </div>
                  </div>
                )}
             </div>
             {canSpeedUp && (
               <button 
                 onClick={handleSpeedUpUpgrade}
                 className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
               >
                 <Zap size={16} className="fill-black" />
                 <div className="flex flex-col leading-none">
                   <span className="text-[9px] font-black uppercase tracking-wider">Hızlandır</span>
                   <span className="text-[7px] font-bold opacity-70">5 Kredi</span>
                 </div>
               </button>
             )}
             {isUpgrading && !speedUpUsed && remainingDays > 0 && !canSpeedUp && (profile?.credits || 0) < 5 && (
               <div className="flex items-center gap-2 px-4 py-3 bg-white/5 text-white/20 border border-white/10 rounded-2xl">
                 <Zap size={16} />
                 <div className="flex flex-col leading-none">
                   <span className="text-[9px] font-black uppercase tracking-wider">Hızlandır</span>
                   <span className="text-[7px] font-bold opacity-50">Yetersiz Kredi (5 Kredi)</span>
                 </div>
               </div>
             )}
             {speedUpUsed && (
               <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl">
                 <Zap size={16} />
                 <span className="text-[9px] font-black uppercase tracking-wider">Hızlandırıldı</span>
               </div>
             )}
             <button 
               onClick={handleCancelUpgrade}
               className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all"
               title="İptal Et"
             >
               <XIcon size={18} className="text-white/30" />
             </button>
          </div>
        </motion.div>
      )}

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-white/5 p-10 rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/[0.04] to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="flex gap-1">
                 {[...Array(calculateTotalStars())].map((_, i) => (
                   <Star key={i} size={14} className="text-amber-500 fill-amber-500" />
                 ))}
                 {[...Array(5 - calculateTotalStars())].map((_, i) => (
                   <Star key={i} size={14} className="text-white/10" />
                 ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">{calculateTotalStars()} YILDIZ</span>
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">OPERASYONEL YERLEŞKE</h2>
            <p className="text-sm text-white/40 max-w-lg mb-8 leading-relaxed">
              Tesislerinizi geliştirerek hem pasif gelirlerinizi artırın hem de takımınıza sahada stratejik avantajlar kazandırın. Her seviye atlamada oyun içi etkileriniz artar.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Mevcut Kapasite</span>
                  <span className="text-xl font-black text-white italic">{5000 + ((stadiumUpgrades['capacity'] || 0) * 10000)} <span className="text-xs text-white/40 not-italic uppercase font-bold">KİŞİ</span></span>
               </div>
               <div className="w-px h-8 bg-white/5 hidden md:block" />
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Toplam Gelişim</span>
                  <span className="text-xl font-black text-amber-400 italic">{Object.values(stadiumUpgrades).reduce<number>((a, b) => a + (b as number), 0)} <span className="text-xs text-white/40 not-italic uppercase font-bold">PUAN</span></span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stadium Name Change ── */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-amber-500/[0.03] to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
              <Building2 size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-black italic uppercase tracking-tighter text-white">Stadyum İsmi</h3>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">5 Kredi karşılığında değiştir</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 w-full md:w-auto">
            <input 
              type="text"
              value={stadiumNameInput}
              onChange={(e) => setStadiumNameInput(e.target.value)}
              placeholder="Stadyum ismi girin..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:border-amber-500 outline-none transition-all placeholder:text-white/20"
            />
            <button
              onClick={() => {
                if (!profile) return;
                if ((profile.credits || 0) < 5) {
                  error('Yetersiz kredi! Stadyum ismi değiştirmek için 5 kredi gereklidir.');
                  return;
                }
                if (!stadiumNameInput.trim()) {
                  warning('Stadyum ismi boş olamaz!');
                  return;
                }
                setProfile({ ...profile, credits: (profile.credits || 0) - 5, stadium_name: stadiumNameInput.trim() });
                success(`Stadyum ismi "${stadiumNameInput.trim()}" olarak değiştirildi! 5 kredi harcandı.`);
              }}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
            >
              <Coins size={14} className="fill-black" />
              Stadyum İsmini Değiştir (5 KR)
            </button>
          </div>
        </div>
        {profile?.stadium_name && (
          <div className="mt-3 pt-3 border-t border-white/5 relative z-10">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
              Mevcut İsim: <span className="text-amber-400/80 normal-case tracking-normal">{profile.stadium_name}</span>
            </p>
          </div>
        )}
      </div>

      {/* ── Facility Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Ticket Price Card */}
        <div className="bg-zinc-900 border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between relative group overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
              <Ticket size={28} className="text-amber-500" />
            </div>
            <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Pricing</div>
          </div>
          <div>
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-white mb-2">Bilet Fiyatı</h3>
            <div className="flex items-end gap-2 mb-6">
               <input 
                 type="number"
                 value={ticketPrice}
                 onChange={(e) => handleUpdateTicketPrice(parseInt(e.target.value) || 0)}
                 className="bg-transparent text-4xl font-black text-white w-20 focus:outline-none"
               />
               <span className="text-xl font-bold text-white/20 mb-1">€</span>
            </div>
            <div className="flex flex-col gap-1">
               <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase">
                  <span>Talep Akışı</span>
                  <span>{Math.round((90 - ticketPrice) / 90 * 100)}%</span>
               </div>
               <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${(1 - ticketPrice / 90) * 100}%` }} />
               </div>
            </div>
          </div>
        </div>

        {/* Facility Cards */}
        {STADIUM_MATRIX.map((item) => {
          const level = stadiumUpgrades[item.id] || 0;
          const cost = calculateUpgradeCost(250000, level + 1);
          const reqLevel = getManagerLevelRequirement(level + 1);
          const isMax = level >= item.maxLevel;
          const canAfford = (profile?.money || 0) >= cost;
          const meetsLevel = (profile?.level || 1) >= reqLevel;
          const isBeingUpgraded = profile.active_upgrade_id === item.id;
          const previewLevel = previewLevels[item.id] ?? level;
          const duration = getUpgradeDuration(level + 1);
          const isExpanded = expandedFacility === item.id;

          // Current and next level effects for the main card display
          const nextLevelEffect = level < item.maxLevel ? getLevelEffect(item.id, level + 1) : null;
          const currentLevelEffect = level > 0 ? getLevelEffect(item.id, level) : null;

          return (
            <div 
              key={item.id} 
              className={`bg-zinc-900 border rounded-2xl p-5 transition-all group flex flex-col justify-between relative overflow-hidden ${
                isBeingUpgraded 
                  ? 'border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]' 
                  : isExpanded
                    ? 'border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                    : 'border-white/5 hover:border-white/10'
              }`}
            >
              {/* Upgrading overlay */}
              {isBeingUpgraded && (
                <div className="absolute top-0 left-0 w-full h-full bg-black/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                   <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center animate-spin mb-4 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                     <RefreshCw size={24} className="text-black" />
                   </div>
                   <h5 className="text-xs font-black italic text-amber-400 uppercase tracking-widest mb-1">YÜKSELTİLİYOR</h5>
                   {/* Real-time countdown per card */}
                   {countdown && countdown.totalMs > 0 ? (
                     <p className="text-lg font-black italic text-white tabular-nums">
                       {countdown.days > 0 && <>{countdown.days}g </>}
                       {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                     </p>
                   ) : (
                     <p className="text-[10px] font-bold text-white uppercase italic">İnşaat devam ediyor...</p>
                   )}
                   {/* Per-card speed up button */}
                   {canSpeedUp && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleSpeedUpUpgrade(); }}
                       className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition-all hover:scale-105 active:scale-95 text-[8px] font-black uppercase tracking-wider"
                     >
                       <Zap size={12} className="fill-black" />
                       Kredi ile Hızlandır (5 Kredi)
                     </button>
                   )}
                   {speedUpUsed && (
                     <span className="mt-2 flex items-center gap-1 text-[8px] font-black text-emerald-400 uppercase tracking-wider">
                       <Zap size={10} /> Hızlandırıldı
                     </span>
                   )}
                </div>
              )}

              <div className={isBeingUpgraded ? 'opacity-30' : ''}>
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors ${level > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-white/5 border-white/5 text-white/20'}`}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono font-bold text-white/40">LVL {level}/{item.maxLevel}</span>
                    {meetsLevel === false && (
                      <span className="text-[7px] font-black text-red-500 uppercase mt-1 flex items-center gap-0.5">
                        <Lock size={7} /> REQ LVL {reqLevel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Facility Name */}
                <div className="mb-2">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-0.5">{item.name}</p>
                  <h3 className="text-sm font-black italic uppercase tracking-tighter text-white group-hover:text-amber-400 transition-colors leading-tight">
                    {item.originalName}
                  </h3>
                </div>

                {/* ── Current Level Effect Badge (Always Visible) ── */}
                {currentLevelEffect && (
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg mb-2.5 ${getEffectStyle(getEffectCategory(currentLevelEffect.key)).bg} border ${getEffectStyle(getEffectCategory(currentLevelEffect.key)).border}`}>
                    {getEffectStyle(getEffectCategory(currentLevelEffect.key)).icon}
                    <span className={`text-[8px] font-black uppercase tracking-wider ${getEffectStyle(getEffectCategory(currentLevelEffect.key)).text}`}>
                      {currentLevelEffect.label}: {
                        currentLevelEffect.key.includes('Multiplier') || currentLevelEffect.key.includes('Bonus') || currentLevelEffect.key.includes('Speed')
                          ? `×${currentLevelEffect.value.toFixed(2)}`
                          : currentLevelEffect.key.includes('Revenue') || currentLevelEffect.key.includes('Income')
                            ? `${(currentLevelEffect.value / 1000).toFixed(0)}K €`
                            : `${(currentLevelEffect.value * 100).toFixed(0)}%`
                      }
                    </span>
                  </div>
                )}

                {/* ── Next Level Preview (if not max) ── */}
                {nextLevelEffect && !isMax && (
                  <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-amber-500/[0.04] border border-amber-500/10">
                    <ArrowUpRight size={9} className="text-amber-400 shrink-0" />
                    <span className="text-[8px] font-bold text-amber-400/60 uppercase tracking-wider">
                      LV.{level + 1}: {nextLevelEffect.label} → {
                        nextLevelEffect.key.includes('Multiplier') || nextLevelEffect.key.includes('Bonus') || nextLevelEffect.key.includes('Speed')
                          ? `×${nextLevelEffect.value.toFixed(2)}`
                          : nextLevelEffect.key.includes('Revenue') || nextLevelEffect.key.includes('Income')
                            ? `${(nextLevelEffect.value / 1000).toFixed(0)}K €`
                            : `${(nextLevelEffect.value * 100).toFixed(0)}%`
                      }
                    </span>
                  </div>
                )}

                {/* ── Level bar ── */}
                <div className="flex gap-0.5 mb-3">
                   {[...Array(item.maxLevel)].map((_, i) => (
                     <div 
                       key={i} 
                       className={`h-1.5 flex-1 rounded-full transition-all ${
                         i < level ? 'bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.3)]' : 
                         i < previewLevel && previewLevel > level ? 'bg-amber-500/20' : 
                         'bg-white/5'
                       }`} 
                     />
                   ))}
                </div>

                {/* ── Expand button ── */}
                <button
                  onClick={() => setExpandedFacility(isExpanded ? null : item.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all mb-3"
                >
                  <Info size={9} className="text-white/20" />
                  <span className="text-[7px] font-black text-white/25 uppercase tracking-widest">
                    {isExpanded ? 'DETAYLARI GİZLE' : 'TÜM SEVİYE ETKİLERİ'}
                  </span>
                </button>

                {/* ── Expanded: All Level Effects ── */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1.5 mb-3">
                        {Array.from({ length: item.maxLevel }, (_, i) => i + 1).map(lvl => {
                          const lvlEffect = getLevelEffect(item.id, lvl);
                          const isCurrentLevel = lvl === level;
                          const isNextLevel = lvl === level + 1;
                          const lvlBenefit = getFacilityBenefit(item.id, lvl);
                          
                          return (
                            <div
                              key={lvl}
                              className={`flex items-start gap-2 px-2 py-1.5 rounded-lg transition-all ${
                                isCurrentLevel
                                  ? 'bg-amber-500/10 border border-amber-500/20'
                                  : isNextLevel
                                    ? 'bg-emerald-500/[0.06] border border-emerald-500/15'
                                    : 'bg-white/[0.02]'
                              }`}
                            >
                              <span className={`text-[9px] font-black font-mono w-5 shrink-0 text-center ${
                                isCurrentLevel ? 'text-amber-400' : isNextLevel ? 'text-emerald-400' : 'text-white/25'
                              }`}>
                                {lvl}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  {lvlEffect && getEffectStyle(getEffectCategory(lvlEffect.key)).icon}
                                  <span className={`text-[8px] font-bold leading-tight ${
                                    isCurrentLevel ? 'text-amber-300' : isNextLevel ? 'text-emerald-300' : 'text-white/35'
                                  }`}>
                                    {lvlBenefit}
                                  </span>
                                </div>
                                {lvlEffect && (
                                  <span className={`text-[7px] font-mono mt-0.5 block ${
                                    isCurrentLevel ? 'text-amber-400/50' : 'text-white/20'
                                  }`}>
                                    {lvlEffect.label}: {
                                      lvlEffect.key.includes('Multiplier') || lvlEffect.key.includes('Bonus') || lvlEffect.key.includes('Speed')
                                        ? `×${lvlEffect.value.toFixed(2)}`
                                        : lvlEffect.key.includes('Revenue') || lvlEffect.key.includes('Income')
                                          ? `${(lvlEffect.value / 1000).toFixed(0)}K €`
                                          : `${(lvlEffect.value * 100).toFixed(0)}%`
                                    }
                                  </span>
                                )}
                              </div>
                              {isCurrentLevel && (
                                <span className="text-[6px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                                  AKTİF
                                </span>
                              )}
                              {isNextLevel && (
                                <span className="text-[6px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                                  SONRAKİ
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Upgrade Duration & Cost Info ── */}
                {!isMax && (
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <div className="flex items-center gap-1">
                      <Clock size={9} className="text-white/20" />
                      <span className="text-[8px] font-bold text-white/25">{duration} gün</span>
                    </div>
                    <div className="w-px h-3 bg-white/5" />
                    <div className="flex items-center gap-1">
                      <Coins size={9} className="text-white/20" />
                      <span className="text-[8px] font-bold text-white/25">{formatCurrency(cost)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Upgrade Button ── */}
              <button 
                onClick={() => handleStartUpgrade(item.id, cost, level)}
                disabled={isMax || isUpgrading || !canAfford || !meetsLevel}
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isMax 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : isBeingUpgraded 
                    ? 'hidden'
                    : 'bg-white text-black hover:bg-amber-500 hover:text-black disabled:opacity-10'
                }`}
              >
                {isMax ? 'MAKSİMUM SEVİYE' : `YÜKSELT: ${formatCurrency(cost)}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Staff / Personnel Section ── */}
      <StaffSection />
      <RefereeSection />
    </motion.div>
  );
}
