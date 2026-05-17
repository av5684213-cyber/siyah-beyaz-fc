'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Search, 
  Zap, 
  Shield, 
  TrendingUp, 
  ChevronRight,
  ChevronLeft,
  Landmark,
  Wifi,
  Users,
  Ticket,
  School,
  Lock,
  Star,
  X as XIcon,
  Crown,
  TrendingDown,
  RefreshCw,
  Truck,
  Plane,
  Monitor,
  Thermometer,
  Store,
  Activity,
  Dumbbell
} from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { InfoTrigger } from './InfoPopup';
import { formatCurrency } from '@/lib/fm/valuation';
import { STADIUM_MATRIX, calculateUpgradeCost, getManagerLevelRequirement, getFacilityBenefit, getLevelEffect } from '@/lib/fm/stadiumMatrix';

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

export default function StadiumTab() {
  const { profile, setProfile } = useFM();
  const stadiumUpgrades = profile?.stadium_upgrades || {};
  
  const [ticketPrice, setTicketPrice] = useState(profile?.ticket_price || 20);
  // Önizleme seviyesi state'i — her tesis için ayrı slider pozisyonu
  const [previewLevels, setPreviewLevels] = useState<Record<string, number>>({});
  const currentAcademyLevel = profile?.academy_level || 0;
  const nextAcademyStep = ACADEMY_STEPS[currentAcademyLevel];
  const isUpgrading = !!profile?.active_upgrade_type;
  const speedUpUsed = !!profile?.active_upgrade_speedup;
  const remainingDays = Math.max(0, (profile?.active_upgrade_finish_day || 0) - (profile?.current_day || 0));
  const canSpeedUp = isUpgrading && !speedUpUsed && remainingDays > 0 && (profile?.credits || 0) >= 5;

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
      alert('Şu anda devam eden bir geliştirme var!');
      return;
    }

    const reqLevel = getManagerLevelRequirement(currentLvl + 1);
    if (profile.level < reqLevel) {
      alert(`Bu seviye için Menajer Seviyesi ${reqLevel} gerekiyor!`);
      return;
    }

    if (profile.money < cost) {
      alert('Yetersiz bütçe!');
      return;
    }

    const duration = getUpgradeDuration(currentLvl + 1);
    const finishDay = profile.current_day + duration;

    setProfile({
      ...profile,
      money: profile.money - cost,
      active_upgrade_type: id === 'academy' ? 'academy' : 'stadium_matrix',
      active_upgrade_id: id,
      active_upgrade_finish_day: finishDay,
      active_upgrade_speedup: false
    });
  };

  const handleCancelUpgrade = () => {
    if (!profile) return;
    if (confirm('İnşaatı iptal etmek istiyor musunuz? Harcanan bütçenin %50\'si iade edilir.')) {
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
        active_upgrade_speedup: null
      });

      alert(`İnşaat iptal edildi. ${formatCurrency(refundMoney)} iade edildi.`);
    }
  };

  const handleSpeedUpUpgrade = () => {
    if (!profile || !canSpeedUp) return;
    if (!confirm('Geliştirme süresini yarıya indirmek için 5 Kredi harcanacak. Onaylıyor musun?')) return;
    
    const currentDay = profile.current_day || 0;
    const finishDay = profile.active_upgrade_finish_day || 0;
    const halfWay = currentDay + Math.ceil((finishDay - currentDay) / 2);
    
    setProfile({
      ...profile,
      credits: (profile.credits || 0) - 5,
      active_upgrade_finish_day: halfWay,
      active_upgrade_speedup: true
    });
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
      {isUpgrading && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-800/90 text-white p-5 rounded-2xl flex items-center justify-between shadow-lg border border-amber-500/20 mb-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-5">
             <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
               <RefreshCw size={20} className="text-amber-400 animate-spin" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">GELİŞTİRME SIRASINDAKİ YÜKSELTME</p>
                <h4 className="text-xl font-black italic uppercase">
                  {profile.active_upgrade_type === 'academy' ? 'Yetiştirme Merkezi' : STADIUM_MATRIX.find(m => m.id === profile.active_upgrade_id)?.originalName} 
                  <span className="ml-3 text-white/50 text-sm tracking-widest font-bold">LV. {(stadiumUpgrades[profile.active_upgrade_id!] || 0) + 1} HEDEFİ</span>
                </h4>
             </div>
          </div>
          <div className="flex items-center gap-8">
             <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">TAMAMLANMASINA</p>
                <p className="text-2xl font-black italic tracking-tighter">{remainingDays} <span className="text-sm opacity-50 not-italic uppercase font-bold">GÜN KALDI</span></p>
             </div>
             {isUpgrading && !speedUpUsed && remainingDays > 0 && !canSpeedUp && (profile?.credits || 0) < 5 && (
               <div className="flex items-center gap-2 px-4 py-3 bg-white/5 text-white/20 border border-white/10 rounded-2xl">
                 <Zap size={16} />
                 <div className="flex flex-col leading-none">
                   <span className="text-[9px] font-black uppercase tracking-wider">HIZLANDIR</span>
                   <span className="text-[7px] font-bold opacity-50">YETERSİZ KREDİ (5 KR)</span>
                 </div>
               </div>
             )}
             {canSpeedUp && (
               <button 
                 onClick={handleSpeedUpUpgrade}
                 className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
               >
                 <Zap size={16} className="fill-black" />
                 <div className="flex flex-col leading-none">
                   <span className="text-[9px] font-black uppercase tracking-wider">HIZLANDIR</span>
                   <span className="text-[7px] font-bold opacity-70">5 Kredi</span>
                 </div>
               </button>
             )}
             {speedUpUsed && (
               <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl">
                 <Zap size={16} />
                 <span className="text-[9px] font-black uppercase tracking-wider">HIZLANDIRILDI</span>
               </div>
             )}
             <button 
               onClick={handleCancelUpgrade}
               className="bg-black/20 hover:bg-black/40 p-4 rounded-2xl transition-all"
               title="İptal Et"
             >
               <XIcon size={20} />
             </button>
          </div>
        </motion.div>
      )}

      <div className="bg-zinc-900 border border-white/5 p-12 rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-besiktas-red/10 to-transparent pointer-events-none" />
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
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">STADYUM_MATRİSİ // {calculateTotalStars()} YILDIZ</span>
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">OPERASYONEL YERLEŞKE</h2>
            <p className="text-sm text-white/40 max-w-lg mb-8 leading-relaxed">
              Tesislerinizi geliştirerek hem pasif gelirlerinizi artırın hem de takımınıza sahada stratejik avantajlar kazandırın.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Mevcut Kapasite</span>
                  <span className="text-xl font-black text-white italic">{5000 + ((stadiumUpgrades['capacity'] || 0) * 10000)} <span className="text-xs text-white/40 not-italic uppercase font-bold">KİŞİ</span></span>
               </div>
               <div className="w-px h-8 bg-white/5 hidden md:block" />
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Gelişim Puanı</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-besiktas-red italic">{Object.values(stadiumUpgrades).reduce<number>((a, b) => a + (b as number), 0)}</span>
                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-besiktas-red" style={{ width: `${((profile?.xp || 0) % 1000) / 10}%` }} />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Ticket Price */}
        <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between relative group overflow-hidden">
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

        {STADIUM_MATRIX.map((item) => {
          const level = stadiumUpgrades[item.id] || 0;
          const cost = calculateUpgradeCost(250000, level + 1);
          const reqLevel = getManagerLevelRequirement(level + 1);
          const isMax = level >= item.maxLevel;
          const canAfford = (profile?.money || 0) >= cost;
          const meetsLevel = (profile?.level || 1) >= reqLevel;
          const isBeingUpgraded = profile.active_upgrade_id === item.id;
          // Önizleme seviyesi: slider ile seçilen, henüz kaydedilmemiş seviye
          const previewLevel = previewLevels[item.id] ?? level;

          return (
            <div 
              key={item.id} 
              className={`bg-zinc-900 border ${isBeingUpgraded ? 'border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)] scale-[1.02]' : 'border-white/5'} rounded-2xl p-6 hover:border-white/10 transition-all group flex flex-col justify-between relative overflow-hidden`}
            >
              {isBeingUpgraded && (
                <div className="absolute top-0 left-0 w-full h-full bg-black/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                   <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center animate-spin mb-4 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                     <RefreshCw size={24} className="text-black" />
                   </div>
                   <h5 className="text-xs font-black italic text-amber-400 uppercase tracking-widest mb-1">YÜKSELTİLİYOR</h5>
                   <p className="text-[10px] font-bold text-white uppercase italic">İnşaat devam ediyor...</p>
                </div>
              )}

              <div className={isBeingUpgraded ? 'opacity-30' : ''}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors ${level > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-white/5 border-white/5 text-white/20'}`}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono font-bold text-white/40">LVL {level}/{item.maxLevel}</span>
                    {meetsLevel === false && (
                      <span className="text-[8px] font-black text-red-500 uppercase mt-1">REQ LVL {reqLevel}</span>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{item.name}</p>
                  <h3 className="text-base font-black italic uppercase tracking-tighter text-white group-hover:text-amber-400 transition-colors leading-tight">
                    {item.originalName}
                  </h3>
                </div>

                <p className="text-[10px] text-white/40 font-medium leading-relaxed mb-4 min-h-[36px] line-clamp-2">
                  {item.description}
                </p>

                {/* ── Seviye Geçiş Okları ── */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Seviye Önizleme</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={() => setPreviewLevels(prev => ({ ...prev, [item.id]: Math.max(1, (prev[item.id] ?? level) - 1) }))}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-white/40 hover:text-white flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                      disabled={(previewLevels[item.id] ?? level) <= 1}
                      title="Önceki Seviye"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex flex-col items-center min-w-[48px]">
                      <span className={`text-2xl font-black font-mono leading-none ${previewLevel > level ? 'text-amber-400' : previewLevel < level ? 'text-red-400' : 'text-white/60'}`}>
                        {previewLevel}
                      </span>
                      <span className="text-[7px] font-bold text-white/20 mt-1">/ {item.maxLevel}</span>
                    </div>
                    <button 
                      onClick={() => setPreviewLevels(prev => ({ ...prev, [item.id]: Math.min(item.maxLevel, (prev[item.id] ?? level) + 1) }))}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-white/40 hover:text-white flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                      disabled={(previewLevels[item.id] ?? level) >= item.maxLevel}
                      title="Sonraki Seviye"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* ── Seviye faydası önizlemesi ── */}
                <div className={`p-3 rounded-xl border mb-4 transition-all ${previewLevel > level ? 'bg-amber-500/5 border-amber-500/20' : 'bg-black/40 border-white/5'}`}>
                  <p className="text-[8px] font-black uppercase tracking-widest mb-1">
                    {previewLevel > level ? (
                      <span className="text-amber-400">SEVİYE {previewLevel} FAYDASI (ÖNİZLEME)</span>
                    ) : previewLevel === level ? (
                      <span className="text-white/30">MEVCUT SEVİYE {level}</span>
                    ) : (
                      <span className="text-red-400/60">SEVİYE {previewLevel} (ÖNCEKİ)</span>
                    )}
                  </p>
                  <p className="text-[9px] font-bold leading-tight uppercase italic text-white/60">
                    {getFacilityBenefit(item.id, previewLevel)}
                  </p>
                  {/* levelEffect numeric değer */}
                  {(() => {
                    try {
                      const effect = getLevelEffect(item.id, previewLevel);
                      if (effect && previewLevel !== level) {
                        return (
                          <p className="text-[8px] font-bold text-amber-300/60 mt-1">
                            {effect.key}: {effect.value}
                          </p>
                        );
                      }
                    } catch { /* ignore */ }
                    return null;
                  })()}
                  {previewLevel > level && (
                    <p className="text-[8px] font-bold text-amber-400/50 mt-2">
                      Maliyet: {formatCurrency(calculateUpgradeCost(250000, level + 1))} → Seviye {level + 1} yükseltme
                    </p>
                  )}
                </div>

                {/* ── Mevcut seviye çubuğu ── */}
                <div className="flex gap-1 mb-2">
                   {[...Array(item.maxLevel)].map((_, i) => (
                     <div 
                       key={i} 
                       className={`h-1 flex-1 rounded-full transition-all ${i < level ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.3)]' : i < previewLevel ? 'bg-amber-500/20' : 'bg-white/5'}`} 
                     />
                   ))}
                </div>
              </div>

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
    </motion.div>
  );
}
