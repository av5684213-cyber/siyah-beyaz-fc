'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, Activity, ArrowRight, Trophy, Users, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { signIn, signInWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const gsiInitialized = useRef(false);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Load Google GSI script
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    if (document.getElementById('google-gsi-script')) return;

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // Google callback handler
  useEffect(() => {
    (window as any).handleGoogleSignIn = async (response: any) => {
      setGoogleLoading(true);
      setError(null);

      const { error: authError, hasProfile } = await signInWithGoogle(response.credential);

      if (authError) {
        setError(authError);
        setGoogleLoading(false);
        return;
      }

      // Always go to home — ManagerRegistration shows there if no profile
      router.push('/');
    };

    return () => {
      delete (window as any).handleGoogleSignIn;
    };
  }, [signInWithGoogle, router]);

  // Render Google button when GSI is ready
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const tryRender = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id) return false;

      if (!gsiInitialized.current) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (window as any).handleGoogleSignIn,
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: false,
        });
        gsiInitialized.current = true;
      }

      // Render the official Google button
      if (googleButtonRef.current && googleButtonRef.current.children.length === 0) {
        google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 400,
          locale: 'tr',
        });
      }
      return true;
    };

    // Try immediately, then retry every 200ms until GSI loads
    if (tryRender()) return;
    const interval = setInterval(() => {
      if (tryRender()) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('E-posta ve sifre alanlari zorunludur.');
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

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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
        {/* Header */}
        <div className="bg-gradient-to-b from-white/5 to-transparent p-8 flex flex-col items-center border-b border-white/5">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-white/5">
            <Shield size={32} className="text-black" />
          </div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            Touchline Manager
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mt-2">
            Menajerlik Simulasyonu
          </p>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Hero text */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-white">
              Kulubunu Kur, Tarihe Yazil
            </h2>
            <p className="text-xs text-white/40 leading-relaxed">
              Google ile guvenli giris yap. Takimini yonet, transfer yap, sampiyonluguna kostur.
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
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Altyapi</p>
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

          {/* Google Sign-In — PRIMARY METHOD */}
          {googleClientId ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                {/* Official Google rendered button */}
                <div ref={googleButtonRef} className="overflow-hidden rounded-full" />

                {/* Fallback button while GSI loads */}
                {googleLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
                    <Activity className="animate-spin text-white/50" size={24} />
                  </div>
                )}
              </div>

              {/* Manual trigger fallback */}
              <button
                type="button"
                onClick={() => {
                  const google = (window as any).google;
                  if (!google?.accounts?.id) {
                    setError('Google Sign-In yukleniyor, lutfen bekleyin.');
                    return;
                  }
                  google.accounts.id.prompt();
                }}
                disabled={googleLoading}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-white/60">Google ile devam et</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/15">veya e-posta ile</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-4 py-3 text-xs font-bold text-yellow-400">
              Google girisi yapilandirilmamis. Lutfen yonetici ile iletisime gecin.
            </div>
          )}

          {/* Email/password — SECONDARY METHOD */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <Lock size={12} /> Sifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="* * * * * * * *"
                autoComplete="current-password"
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-3 text-sm font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Activity className="animate-spin" size={16} />
              ) : (
                <>GIRIS YAP <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              Hesabin yok mu?
            </p>
            <Link
              href="/auth/register"
              className="inline-block mt-2 text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Kayit Ol &rarr;
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
