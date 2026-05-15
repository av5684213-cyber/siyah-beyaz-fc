'use client';

import React from 'react';
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
} from 'lucide-react';
import type { Player } from '@/lib/fm/types';

import { toTitleCase } from '@/lib/fm/ui-helpers';
import { useFM } from '@/lib/fm/GameContext';

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
  onRunEvolution: () => void;
  isAdmin?: boolean;
  transferOffers?: TransferOffer[];
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
  onRunEvolution,
  isAdmin,
  transferOffers
}: DashboardTabProps) {
  const { setProfile, setSquad } = useFM();

  return (
    <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
       
       {/* Random New Game Button for debugging/user request */}
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
               <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em]">selimporsuk@gmail.com Yetkili Girişi</p>
             </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             <button 
               onClick={() => {
                 if (profile) {
                   setProfile({ ...profile, money: (profile.money || 0) + 100000000 });
                   alert('HESABA $100M EKLENDİ!');
                 }
               }}
               className="bg-black/40 border border-red-600/20 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-red-600/20 transition-all text-xs font-black uppercase tracking-widest text-red-400"
             >
               <Wallet size={16} /> +$100M PARA
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
               onClick={() => {
                 for(let i=0; i<10; i++) onRunEvolution();
                 alert('10 GÜN İLERİ SARILDI!');
               }}
               className="bg-black/40 border border-red-600/20 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-red-600/20 transition-all text-xs font-black uppercase tracking-widest text-red-400"
             >
               <CalendarDays size={16} /> 10 GÜN ATLA
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
             <button 
               onClick={async () => {
                 try {
                   const res = await fetch('/api/league/maintenance');
                   const data = await res.json();
                   alert('LİG BAKIMI: ' + (data.success ? 'TAMAMLANDI' : 'HATA'));
                 } catch (err) { alert('HATA'); }
               }}
               className="bg-black/40 border border-red-600/20 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-red-600/20 transition-all text-xs font-black uppercase tracking-widest text-red-400"
             >
               <RefreshCw size={16} /> LİG BAKIMI
             </button>
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
                         <div key={`ret-${p.id || idx}`} className="text-xs font-bold text-white/80">• {toTitleCase(p.name)} ({p.age} Yaş, {p.position})</div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Altyapıdan Gelenler</p>
                    <div className="space-y-1">
                      {retiredLog.talents.filter(p => !!p).map((p, idx) => (
                         <div key={`tal-${p.id || idx}`} className="text-xs font-bold text-white/80">• {toTitleCase(p.name)} (17 Yaş, {p.position}) -Pot: {p.potential}</div>
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
           { label: 'Finansal Durum', value: `$${((profile?.money || 0) / 1000000).toFixed(1)}M`, icon: Wallet, sub: 'Kullanılabilir' },
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

       {/* Transfer Offers Panel */}
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
                     <span className="text-xs font-black text-emerald-400">€{(offer.amount / 1000000).toFixed(1)}M</span>
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
             { 
               id: 'evolve', 
               label: (profile?.current_day || 0) >= 34 ? 'Yeni Sezon' : 'Oyuncu Geliştir', 
               icon: (profile?.current_day || 0) >= 34 ? CalendarDays : Zap, 
               color: (profile?.current_day || 0) >= 34 ? 'hover:bg-amber-600' : 'hover:bg-emerald-600', 
               action: (profile?.current_day || 0) >= 34 ? onNextSeason : onRunEvolution 
             }
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
