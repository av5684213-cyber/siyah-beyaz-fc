'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
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

export default function RegisterPage() {
  const { signUp, user } = useAuth();
  const { initTeam } = useFM();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [managerName, setManagerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // After signUp succeeds, the auth state updates and `user` becomes non-null.
  // userId is auto-derived from authUser.id in GameContext, so we just call initTeam.
  // Takım adı artık backend'de rastgele üretiliyor — boş string gönderilir.
  useEffect(() => {
    if (!user || !loading) return;

    const setupTeam = async () => {
      try {
        // Small delay to ensure GameContext has picked up the new userId
        await new Promise(r => setTimeout(r, 500));
        // initTeam'in teamName parametresi artık backend'de rastgele üretilecek
        await initTeam('', managerName, 'balanced', '#ffffff', '#000000');
        router.push('/');
      } catch (err: any) {
        setError('Takım kurulurken hata oluştu: ' + (err?.message || 'Bilinmeyen hata'));
        setLoading(false);
      }
    };

    setupTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || !managerName.trim()) {
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
      {/* Layer 1: Vignette — kenarları karartır, kart'a odaklanmayı sağlar */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 35%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.95) 100%)',
        }}
      />

      {/* Layer 2: Saha çizgisi deseni — çok hafif, futbol temalı */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      {/* Layer 3: Stadyum ışığı glow'ları — daha dramatik */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-25%] left-[-15%] w-[55%] h-[55%] bg-emerald-600/15 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-15%] w-[55%] h-[55%] bg-blue-600/15 blur-[160px] rounded-full" />
        <div className="absolute top-[35%] right-[15%] w-[30%] h-[30%] bg-purple-700/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[35%] left-[10%] w-[28%] h-[28%] bg-cyan-600/10 blur-[140px] rounded-full" />
      </div>

      {/* Layer 4: Üst/alt ince aksan çizgileri — premium his */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent z-0" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-md w-full bg-zinc-900/95 backdrop-blur-xl border border-white/5 rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_60px_rgba(16,185,129,0.05)] overflow-hidden"
      >
        {/* Header — logo + başlık */}
        <div className="bg-gradient-to-b from-white/5 to-transparent p-8 flex flex-col items-center border-b border-white/5">
          <img src="/touchline-manager-logo.png" alt="Touchline Manager" className="w-40 h-auto mb-3" />
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            Touchline Manager
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mt-2">
            Menajerlik Simülasyonu
          </p>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Hero text */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-white">
              Menajerlik Kariyerine Başla
            </h2>
            <p className="text-xs text-white/40 leading-relaxed">
              Hesap oluştur, sana rastgele bir kulüp, 50M € bütçe ve 200 kredi verelim.
              Hemen 4. Lig'de mücadeleye başla.
            </p>
          </div>

          {/* Feature badges */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Lig</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Transfer</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <Zap className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Altyapı</p>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-xs font-bold text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Registration form — tek adım, sadece hesap + menajer adı */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">
                <Mail size={12} /> E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                autoComplete="email"
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-3 text-sm font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
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
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-3 text-sm font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">
                <User size={12} /> Adın Soyadın
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="örn: Selim Porsuk"
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-3 text-sm font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Activity className="animate-spin" size={16} />
              ) : (
                <>KAYIT OL <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              Zaten hesabın var mı?
            </p>
            <Link
              href="/auth/login"
              className="inline-block mt-2 text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Giriş Yap &rarr;
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
