'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, Activity, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('E-posta ve şifre alanları zorunludur.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError);
      setLoading(false);
      return;
    }

    router.push('/');
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
        className="max-w-md w-full bg-zinc-900 border border-white/5 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Sidebar-style header */}
        <div className="bg-gradient-to-b from-white/5 to-transparent p-8 flex flex-col items-center border-b border-white/5">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-white/5">
            <Shield size={32} className="text-black" />
          </div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            Giriş Yap
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mt-2">
            Touchline Manager
          </p>
        </div>

        {/* Form */}
        <div className="p-8 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-xs font-bold text-red-400"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-0 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <Activity className="animate-spin" size={18} />
              ) : (
                <>GİRİŞ YAP <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              Hesabın yok mu?
            </p>
            <Link
              href="/auth/register"
              className="inline-block mt-2 text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Kayıt Ol →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
