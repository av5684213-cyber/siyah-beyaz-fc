'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, Activity, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google GSI script'ini yükle
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    // Zaten yüklü mü kontrol et
    if (document.getElementById('google-gsi-script')) return;

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup: script'i kaldırma (diğer sayfalarda da kullanılabilir)
    };
  }, []);

  // Google callback fonksiyonunu global scope'a kaydet
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

      // Profil varsa ana sayfaya, yoksa kayıt sayfasına
      if (hasProfile) {
        router.push('/');
      } else {
        router.push('/');
      }
    };

    return () => {
      delete (window as any).handleGoogleSignIn;
    };
  }, [signInWithGoogle, router]);

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

  const handleGoogleClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google girişi şu anda yapılandırılmamış.');
      return;
    }

    // Google GSI hazır mı?
    if (typeof (window as any).google?.accounts?.id === 'undefined') {
      setError('Google Sign-In yükleniyor, lütfen bekleyin.');
      return;
    }

    try {
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: (window as any).handleGoogleSignIn,
        ux_mode: 'popup',
      });

      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap gösterilemedi — manuel butonla devam et
          console.log('[login] Google One Tap skipped:', notification.getNotDisplayedReason?.());
        }
      });
    } catch (err) {
      console.error('[login] Google GSI error:', err);
      setError('Google girişi başlatılamadı.');
    }
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

          {/* Google Sign-In Button */}
          {googleClientId && (
            <>
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={googleLoading}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <Activity className="animate-spin" size={18} className="text-white/50" />
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-white/80">Google ile Giriş Yap</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/15">veya</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
            </>
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
