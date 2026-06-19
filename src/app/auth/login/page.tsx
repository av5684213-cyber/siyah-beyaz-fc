'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, Activity, ArrowRight, Trophy, Users, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FootballLoader } from '@/components/ui/FootballLoader';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <FootballLoader size={64} label="Giriş Ekranı" />
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const { signIn, signInWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedOut = searchParams.get('logged_out') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleButtonReady, setGoogleButtonReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoutNotice, setLogoutNotice] = useState<boolean>(isLoggedOut);
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
      setLogoutNotice(false); // Kullanıcı aktif giriş yaptıyor, logout bildirimini kapat

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
    if (!clientId) {
      setError('Google Client ID yapılandırılmamış. Yönetici ile iletişime geçin.');
      return;
    }

    let attempts = 0;
    const maxAttempts = 50; // 10 saniye (200ms x 50)

    const tryRender = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id) {
        attempts++;
        if (attempts >= maxAttempts) {
          setError('Google Sign-In yüklenemedi. İnternet bağlantınızı kontrol edin.');
        }
        return false;
      }
      if (!gsiInitialized.current) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (window as any).handleGoogleSignIn,
          ux_mode: 'popup',
          auto_select: false,          // Asla otomatik seçim yapma
          cancel_on_tap_outside: true, // One Tap popup dış tıklayınca kapanır
        });
        gsiInitialized.current = true;

        // HER DURUMDA auto-select'i devre dışı bırak.
        // VPN ile yeni cihazdan giren kullanıcıda bile Google One Tap'in
        // otomatik popup açıp "X olarak devam et" göstermesini engeller.
        // Sadece ?logged_out=1 varken değil, her zaman.
        try {
          google.accounts.id.disableAutoSelect();
        } catch (e) { console.warn("[silent-catch]", e); }

        // One Tap prompt'u ASLA çağırma — sadece resmi Google butonu ile giriş yapılabilir.
        // Eski sürümde google.accounts.id.prompt() çağrılıyordu, bu One Tap popup'ı
        // zorla açıyordu ve kullanıcı farkında olmadan tıklayınca eski hesabına dönüyordu.
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
        setGoogleButtonReady(true);
      }
      return true;
    };

    // Try immediately, then retry every 200ms until GSI loads
    if (tryRender()) return;
    const interval = setInterval(() => {
      if (tryRender()) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, [isLoggedOut]);

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
        {/* Header */}
        <div className="bg-gradient-to-b from-white/5 to-transparent p-8 flex flex-col items-center border-b border-white/5">
          <img src="/touchline-manager-logo.png" alt="Touchline Manager" className="w-40 h-auto mb-3" />
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

          {/* Logout notification banner */}
          {logoutNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 text-xs font-bold text-emerald-400 flex items-center gap-2"
            >
              <Shield size={14} className="shrink-0" />
              <span>Başarıyla çıkış yapıldı. Tekrar giriş yapmak için Google ile devam edin.</span>
            </motion.div>
          )}

          {/* Google Sign-In — PRIMARY METHOD */}
          {googleClientId ? (
            <div className="space-y-4">
              <div className="flex justify-center relative min-h-[44px] items-center">
                {/* Official Google rendered button */}
                <div ref={googleButtonRef} className="overflow-hidden rounded-full" />

                {/* Loading placeholder while GSI script loads */}
                {!googleButtonReady && !googleLoading && (
                  <div className="flex items-center gap-2 text-white/30 text-xs font-bold uppercase tracking-wider">
                    <Activity className="animate-spin" size={14} />
                    <span>Google yükleniyor...</span>
                  </div>
                )}

                {/* Fallback button while GSI loads */}
                {googleLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
                    <Activity className="animate-spin text-white/50" size={24} />
                  </div>
                )}
              </div>

              {/* Manuel Google ile devam et butonu kaldırıldı.
                  Eskiden google.accounts.id.prompt() çağırıyordu, bu da
                  One Tap popup'ı zorla açıp kullanıcı farkında olmadan
                  tıklayınca otomatik giriş yaptırıyordu (VPN/arkadaş telefonu sorunu).
                  Artık sadece resmi Google renderButton ile giriş yapılabilir. */}

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
