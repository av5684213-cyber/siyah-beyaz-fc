'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Lock,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFM } from '@/lib/fm/GameContext';
import Link from 'next/link';

const PHILOSOPHIES = [
  { id: 'balanced', name: 'DENGELİ', icon: <Target className="text-blue-400" />, desc: 'Her alanda dengeli bir başlangıç.', bonus: 'Bonus yok' },
  { id: 'financial', name: 'ZENGİN BAŞKAN', icon: <TrendingUp className="text-emerald-400" />, desc: 'Daha yüksek transfer bütçesi.', bonus: '+50M € Bütçe' },
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

export default function RegisterPage() {
  const { signUp, user } = useAuth();
  const { initTeam } = useFM();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamName, setTeamName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [secondaryColor, setSecondaryColor] = useState('#000000');
  const [philosophy, setPhilosophy] = useState('balanced');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // After signUp succeeds, the auth state updates and `user` becomes non-null.
  // userId is now auto-derived from authUser.id in GameContext, so we just call initTeam.
  useEffect(() => {
    if (!user || !loading) return;

    const setupTeam = async () => {
      try {
        // Small delay to ensure GameContext has picked up the new userId
        await new Promise(r => setTimeout(r, 500));
        await initTeam(teamName, managerName, philosophy, primaryColor, secondaryColor);
        router.push('/');
      } catch (err: any) {
        setError('Takım kurulurken hata oluştu: ' + (err?.message || 'Bilinmeyen hata'));
        setLoading(false);
      }
    };

    setupTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || !teamName.trim() || !managerName.trim()) {
      setError('Tüm alanları doldurunuz.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await signUp(email, password, {
      team_name: teamName,
      manager_name: managerName,
    });

    if (authError) {
      setError(authError);
      setLoading(false);
      return;
    }

    // Auth state change will trigger the useEffect above → initTeam → redirect
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Gradient blurs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-zinc-900 border border-white/5 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left sidebar — step indicator */}
        <div className="md:w-48 bg-gradient-to-b from-white/5 to-transparent p-8 flex flex-col items-center justify-between border-r border-white/5">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-white/5">
              <Shield size={24} className="text-black" />
            </div>
            <div className="h-24 w-[1px] bg-gradient-to-b from-white/20 to-transparent" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center justify-center">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    step === s
                      ? 'bg-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                      : step > s
                        ? 'bg-emerald-400 scale-100'
                        : 'bg-white/10'
                  }`}
                />
              </div>
            ))}
          </div>

          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 rotate-[-90deg] whitespace-nowrap mb-4">
            FM PRO 2026
          </p>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8 md:p-12">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-xs font-bold text-red-400 mb-6"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: Account + Identity */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
                    Hesap Oluştur
                  </h2>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
                    Kariyerine başlamak için bilgilerini gir.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">
                      <Mail size={12} /> E-posta Adresi
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      autoComplete="email"
                      className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">
                      <Lock size={12} /> Şifre
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="En az 6 karakter"
                      autoComplete="new-password"
                      className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                    />
                  </div>

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
                </div>

                <button
                  disabled={!email || !password || !teamName || !managerName}
                  onClick={nextStep}
                  className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  İLERLE <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {/* STEP 2: Team Colors */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
                    4. LİG YOLCULUĞU
                  </h2>
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
                      {COLORS_LIST.map((c) => (
                        <button
                          key={`p-${c.value}`}
                          onClick={() => setPrimaryColor(c.value)}
                          className={`group relative w-10 h-10 rounded-xl transition-all ${
                            primaryColor === c.value
                              ? 'scale-110 ring-2 ring-white ring-offset-4 ring-offset-zinc-900 shadow-xl'
                              : 'opacity-40 hover:opacity-100 hover:scale-105'
                          }`}
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
                      {COLORS_LIST.map((c) => (
                        <button
                          key={`s-${c.value}`}
                          onClick={() => setSecondaryColor(c.value)}
                          className={`group relative w-10 h-10 rounded-xl transition-all ${
                            secondaryColor === c.value
                              ? 'scale-110 ring-2 ring-white ring-offset-4 ring-offset-zinc-900 shadow-xl'
                              : 'opacity-40 hover:opacity-100 hover:scale-105'
                          }`}
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
                      <div
                        className="w-8 h-8 rounded-full shadow-lg border-2 border-zinc-900"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <div
                        className="w-8 h-8 rounded-full shadow-lg border-2 border-zinc-900"
                        style={{ backgroundColor: secondaryColor }}
                      />
                    </div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">
                      Kulüp Kimliği Taslağı Hazır
                    </div>
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

            {/* STEP 3: Philosophy */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
                    Başlangıç Felsefesi
                  </h2>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
                    Seçtiğin felsefe başlangıç avantajlarını belirler.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {PHILOSOPHIES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPhilosophy(p.id)}
                      className={`p-4 rounded-3xl border transition-all text-left flex flex-col gap-2 ${
                        philosophy === p.id
                          ? 'bg-white border-white'
                          : 'bg-black/40 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 ${
                          philosophy === p.id ? 'bg-black' : 'bg-white/5'
                        }`}
                      >
                        {React.cloneElement(p.icon as React.ReactElement<any>, {
                          size: 16,
                          className: philosophy === p.id ? 'text-white' : (p.icon as React.ReactElement<any>).props.className,
                        })}
                      </div>
                      <div
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          philosophy === p.id ? 'text-black' : 'text-white'
                        }`}
                      >
                        {p.name}
                      </div>
                      <div
                        className={`text-[8px] font-bold uppercase ${
                          philosophy === p.id ? 'text-black/40' : 'text-emerald-400'
                        }`}
                      >
                        {p.bonus}
                      </div>
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
                    className="flex-1 h-16 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-0 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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

          {/* Link to login — always visible */}
          <div className="text-center mt-8 pt-6 border-t border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              Zaten hesabın var mı?
            </p>
            <Link
              href="/auth/login"
              className="inline-block mt-2 text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Giriş Yap →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
