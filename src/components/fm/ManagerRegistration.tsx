'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Shield, 
    Users, 
    Trophy, 
    ArrowRight, 
    Zap, 
    Star, 
    TrendingUp, 
    Building2, 
    Target, 
    Palette,
    User,
    Mail,
    Activity
} from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';

const PHILOSOPHIES = [
    { id: 'balanced', name: 'DENGELİ', icon: <Target className="text-blue-400" />, desc: 'Her alanda dengeli bir başlangıç.', bonus: 'Bonus yok' },
    { id: 'financial', name: 'ZENGİN BAŞKAN', icon: <TrendingUp className="text-emerald-400" />, desc: 'Daha yüksek transfer bütçesi.', bonus: '+50M TL Bütçe' },
    { id: 'youth', name: 'ALTYAPI EKOLÜ', icon: <Building2 className="text-amber-400" />, desc: 'Gelişmiş altyapı tesisleri.', bonus: 'Lv.3 Akademi' },
    { id: 'squad', name: 'YILDIZLAR KARMASI', icon: <Users className="text-purple-400" />, desc: 'Daha yetenekli başlangıç kadrosu.', bonus: '+%10 Kadro Kalitesi' },
    { id: 'reputation', name: 'MARKA DEĞERİ', icon: <Trophy className="text-red-400" />, desc: 'Daha yüksek kulüp itibarı.', bonus: '+20 İtibar' },
    { id: 'legend', name: 'EFSANE ADAYI', icon: <Zap className="text-yellow-400" />, desc: 'Daha fazla Kredi ile başlar.', bonus: '+250 Kredi' },
];

const COLORS_LIST = [
    { name: 'Beyaz', value: '#ffffff' },
    { name: 'Siyah', value: '#000000' },
    { name: 'Kırmızı', value: '#ef4444' },
    { name: 'Sarı', value: '#facc15' },
    { name: 'Lacivert', value: '#1e3a8a' },
    { name: 'Yeşil', value: '#22c55e' },
    { name: 'Turuncu', value: '#f97316' },
    { name: 'Mor', value: '#a855f7' },
];

export default function ManagerRegistration() {
  const { initTeam, setAuthEmail } = useFM();
  const [step, setStep] = useState(1);
  const [managerName, setManagerName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [philosophy, setPhilosophy] = useState('balanced');
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [secondaryColor, setSecondaryColor] = useState('#000000');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !managerName.trim() || !teamName.trim()) return;
    setLoading(true);
    setAuthEmail(email);
    // teamName will be assigned automatically in initTeam logic in GameContext
    await initTeam(teamName, managerName, philosophy, primaryColor, secondaryColor);
    setLoading(false);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-zinc-900 border border-white/5 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row"
      >
        <div className="md:w-48 bg-gradient-to-b from-white/5 to-transparent p-8 flex flex-col items-center justify-between border-r border-white/5">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-white/5">
                    <Shield size={24} className="text-black" />
                </div>
                <div className="h-24 w-[1px] bg-gradient-to-b from-white/20 to-transparent" />
            </div>
            
            <div className="space-y-4">
                {[1, 2, 3].map(s => (
                    <div key={s} className="flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full transition-all duration-500 ${step === s ? 'bg-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/10'}`} />
                    </div>
                ))}
            </div>

            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 rotate-[-90deg] whitespace-nowrap mb-4">
                FM PRO 2026
            </p>
        </div>

        <div className="flex-1 p-8 md:p-12">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Managerium Kimliği</h2>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Kariyerine başlamak için yönetici bilgilerini girin.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">
                                    <Shield size={12} /> Kulüp İsmi
                                </label>
                                <input 
                                    type="text" 
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="örn: Yıldırım Spor"
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">
                                    <User size={12} /> Adınız Soyadınız
                                </label>
                                <input 
                                    type="text" 
                                    value={managerName}
                                    onChange={(e) => setManagerName(e.target.value)}
                                    placeholder="örn: Selim Porsuk"
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">
                                    <Mail size={12} /> İletişim Adresi
                                </label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="örn: selim@football.com"
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                                />
                            </div>
                        </div>

                        <button 
                            disabled={!managerName || !email || !teamName}
                            onClick={nextStep}
                            className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            İLERLE <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">4. LİG YOLCULUĞU</h2>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">
                                4. Lig&apos;deki rastgele bir kulübü devralarak kariyerine başlayacaksın. Kulübün adı senin belirlediğin isimle değişecek, kadro ise tamamen sana ait olacak.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">
                                    <Palette size={12} /> Birinci Renk (Ana Renk)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS_LIST.map(c => (
                                        <button 
                                            key={`p-${c.value}`}
                                            onClick={() => setPrimaryColor(c.value)}
                                            className={`group relative w-10 h-10 rounded-xl transition-all ${primaryColor === c.value ? 'scale-110 ring-2 ring-white ring-offset-4 ring-offset-zinc-900 shadow-xl' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                                            style={{ backgroundColor: c.value }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                                            {primaryColor === c.value && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">
                                    <Palette size={12} /> İkinci Renk (Detay Rengi)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS_LIST.map(c => (
                                        <button 
                                            key={`s-${c.value}`}
                                            onClick={() => setSecondaryColor(c.value)}
                                            className={`group relative w-10 h-10 rounded-xl transition-all ${secondaryColor === c.value ? 'scale-110 ring-2 ring-white ring-offset-4 ring-offset-zinc-900 shadow-xl' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                                            style={{ backgroundColor: c.value }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                                            {secondaryColor === c.value && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full shadow-lg border-2 border-zinc-900" style={{ backgroundColor: primaryColor }} />
                                    <div className="w-8 h-8 rounded-full shadow-lg border-2 border-zinc-900" style={{ backgroundColor: secondaryColor }} />
                                </div>
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Kulüp Kimliği Taslağı Hazır</div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={prevStep}
                                className="h-16 px-6 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                            >
                                GERİ
                            </button>
                            <button 
                                onClick={nextStep}
                                className="flex-1 h-16 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-0 transition-all"
                            >
                                SON ADIM <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div 
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Başlangıç Felsefesi</h2>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Seçtiğin felsefe başlangıç avantajlarını belirler.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {PHILOSOPHIES.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => setPhilosophy(p.id)}
                                    className={`p-4 rounded-3xl border transition-all text-left flex flex-col gap-2 ${philosophy === p.id ? 'bg-white border-white' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 ${philosophy === p.id ? 'bg-black' : 'bg-white/5'}`}>
                                        {React.cloneElement(p.icon as React.ReactElement, { size: 16, className: philosophy === p.id ? 'text-white' : (p.icon as React.ReactElement).props.className })}
                                    </div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest ${philosophy === p.id ? 'text-black' : 'text-white'}`}>{p.name}</div>
                                    <div className={`text-[8px] font-bold uppercase ${philosophy === p.id ? 'text-black/40' : 'text-emerald-400'}`}>{p.bonus}</div>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={prevStep}
                                className="h-16 px-6 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                            >
                                GERİ
                            </button>
                            <button 
                                disabled={loading}
                                onClick={handleSubmit}
                                className="flex-1 h-16 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-0 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                            >
                                {loading ? (
                                    <Activity className="animate-spin" size={18} />
                                ) : (
                                    <>KULÜBÜ KUR VE BAŞLA <Zap size={18} /></>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
