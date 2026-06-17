'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  signUp: (email: string, password: string, metadata?: { team_name?: string; manager_name?: string }) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: (token: string) => Promise<{ error: string | null; userId?: string; hasProfile?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// localStorage key for persisted Google auth session
const GOOGLE_AUTH_STORAGE_KEY = 'sb_google_auth';

interface PersistedGoogleAuth {
  userId: string;
  email: string;
  name: string;
  picture: string;
  expires_at: number;
}

/**
 * Read persisted Google auth from localStorage (client-side only).
 * Returns null if not found, expired, or on server.
 */
function readPersistedAuth(): PersistedGoogleAuth | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GOOGLE_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedGoogleAuth;
    // Check expiry (24 hour session)
    if (Date.now() / 1000 > parsed.expires_at) {
      localStorage.removeItem(GOOGLE_AUTH_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persist Google auth to localStorage.
 */
function writePersistedAuth(data: PersistedGoogleAuth): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GOOGLE_AUTH_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage might be disabled
  }
}

/**
 * Clear persisted Google auth from localStorage.
 */
function clearPersistedAuth(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GOOGLE_AUTH_STORAGE_KEY);
  } catch {}
}

/**
 * Build a fake User object from persisted auth data.
 * This is used because Google Sign-In (One Tap) doesn't create a real
 * Supabase Auth session. We persist the userId in localStorage so the
 * user stays logged in across page refreshes.
 */
function buildUserFromPersisted(data: PersistedGoogleAuth): User {
  return {
    id: data.userId,
    email: data.email || '',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: { provider: 'google' },
    user_metadata: {
      full_name: data.name || '',
      avatar_url: data.picture || '',
    },
    created_at: new Date().toISOString(),
  } as unknown as User;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // DEV_MODE tamamen devre dışı — tüm kullanıcılar kayıt/giriş yapmak zorunda.
  // Eski demo-modu fallback'i (DEMO_USER_ID = '00000000-...-001') kaldırıldı
  // çünkü Supabase yapılandırılmadığında tüm tarayıcılarda aynı kullanıcıya
  // giriş yaptırıyordu (başka cihazdan girince başka kullanıcının takımını görme bug'ı).
  const isDevMode = false;

  useEffect(() => {
    // Supabase yapılandırılmamışsa kullanıcıyı giriş yapmış gibi gösterme —
    // bu durumda loading=false + user=null verilir ve sayfa login'e yönlendirir.
    if (!isSupabaseConfigured()) {
      console.warn('[AuthContext] Supabase yapılandırılmamış — kullanıcı giriş yapamaz.');
      setUser(null);
      setSession(null);
      setIsDemoMode(false);
      setLoading(false);
      return;
    }

    // Production: real auth flow
    const supabase = getSupabase()!;

    // ─── Persisted auth güvenlik kontrolü ─────────────────────────
    // VPN ile yeni cihazdan girildiğinde veya kullanıcı logout yaptıysa
    // persisted Google auth'u (localStorage) görmezden gel.
    // - URL'de ?logged_out=1 varsa → kullanıcı logout yapmış, persisted'i temizle
    const urlParams = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
    const isLoggedOutUrl = urlParams?.get('logged_out') === '1';

    if (isLoggedOutUrl) {
      clearPersistedAuth();
    }

    // 1. Check for persisted Google auth first (for users who logged in via Google)
    // Sadece yukarıdaki güvenlik kontrolünü geçen persisted auth kullanılır.
    const persisted = isLoggedOutUrl ? null : readPersistedAuth();
    const hasPersistedAuth = !!persisted;

    if (persisted) {
      const googleUser = buildUserFromPersisted(persisted);
      const googleToken = btoa(`google-${persisted.userId}-${Date.now()}-${Math.random()}`);
      const googleSession = {
        access_token: googleToken,
        token_type: 'bearer',
        expires_at: persisted.expires_at,
        user: googleUser,
      } as unknown as Session;
      setUser(googleUser);
      setSession(googleSession);
      setIsDemoMode(false);
      setLoading(false);
      // Still listen for Supabase Auth changes (in case user signs in via email/password later)
    } else {
      // 2. Check for Supabase Auth session (email/password users)
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
      });
    }

    // 3. Listen for auth state changes (real Supabase Auth sessions)
    //
    //    KRİTİK: Sadece gerçek Supabase oturum eventi olan SIGNED_IN ve SIGNED_OUT
    //    ile ilgileniyoruz. Eski sürümde her event (TOKEN_REFRESHED, INITIAL_SESSION vb.)
    //    user'ı null'a set ediyordu — bu da Google persisted user'ın silinmesine ve
    //    login ekranının sürekli refresh olmasına (gidip gelmesine) neden oluyordu.
    //
    //    Çözüm: Google persisted auth varken, Supabase session null gelse bile
    //    user'ı silme. Sadece gerçek SIGNED_OUT event'inde temizle.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') {
        // Gerçek logout — her şeyi temizle
        clearPersistedAuth();
        setUser(null);
        setSession(null);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' && s?.user) {
        // Gerçek email/password girişi — persisted auth'u ezip Supabase user'ını kullan
        setSession(s);
        setUser(s.user);
        setLoading(false);
        return;
      }

      // Diğer event'ler (INITIAL_SESSION, TOKEN_REFRESHED, USER_UPDATED vb.):
      // - Eğer persisted Google auth varsa → user'ı koru, Supabase session null olsa bile
      // - Eğer persisted auth yoksa → sadece session'ı güncelle, user null'sa null kalsın
      if (!hasPersistedAuth) {
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
      } else if (s?.user) {
        // Persisted auth var ama gerçek Supabase session da var — Supabase öncelikli
        setSession(s);
        setUser(s.user);
        setLoading(false);
      }
      // Persisted auth var ve Supabase session null → hiçbir şey yapma, user'ı koru
    });

    return () => subscription.unsubscribe();
  }, [isDevMode]);

  const signUp = useCallback(async (email: string, password: string, metadata?: { team_name?: string; manager_name?: string }) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase yapilandirilmamis' };
    const supabase = getSupabase()!;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {}
      }
    });

    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase yapilandirilmamis' };
    const supabase = getSupabase()!;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signInWithGoogle = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!data.success) {
        return { error: data.error || 'Google girisi basarisiz', userId: undefined, hasProfile: undefined };
      }

      // Persist Google auth session to localStorage so it survives page refreshes
      const persisted: PersistedGoogleAuth = {
        userId: data.userId,
        email: data.email || '',
        name: data.name || '',
        picture: data.picture || '',
        expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      };
      writePersistedAuth(persisted);

      // Build user object from response
      const googleUser = {
        id: data.userId,
        email: data.email || '',
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: { provider: 'google' },
        user_metadata: {
          full_name: data.name || '',
          avatar_url: data.picture || '',
        },
        created_at: new Date().toISOString(),
      } as unknown as User;

      const googleToken = btoa(`google-${data.userId}-${Date.now()}-${Math.random()}`);
      const googleSession = {
        access_token: googleToken,
        token_type: 'bearer',
        expires_at: persisted.expires_at,
        user: googleUser,
      } as unknown as Session;

      setUser(googleUser);
      setSession(googleSession);
      setIsDemoMode(false);

      return { error: null, userId: data.userId, hasProfile: data.hasProfile };
    } catch (err: any) {
      console.error('[AuthContext] Google sign-in error:', err);
      return { error: err.message || 'Bir hata olustu', userId: undefined, hasProfile: undefined };
    }
  }, []);

  const signOut = useCallback(async () => {
    // 1. Google GSI auto-select'i devre dışı bırak
    //    Bu, kullanıcı logout yaptıktan sonra Google'ın otomatik
    //    tekrar giriş yapmasını (One Tap) engeller
    if (typeof window !== 'undefined') {
      try {
        const google = (window as any).google;
        if (google?.accounts?.id) {
          google.accounts.id.disableAutoSelect();
        }
      } catch {}
    }

    // 2. Persisted Google auth'u temizle
    clearPersistedAuth();

    // 3. Tüm fm_ localStorage anahtarlarını temizle
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('fm_') || key.startsWith('sb_') || key.includes('auth'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch {}
    }

    // 4. Supabase Auth oturumunu kapat
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase()!;
        await supabase.auth.signOut();
      } catch {}
    }

    // 5. State'i temizle
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, isDemoMode, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
