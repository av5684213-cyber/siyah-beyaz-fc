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
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Sabit demo ID — Supabase'de bu ID ile profil VARSA direkt oyuna girer
      // Profil YOKSA ManagerRegistration gösterilir, kullanıcı kendi kulübünü kurar
      const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
      // Eski localStorage demo ID'lerini temizle
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb_demo_user_id');
      }
      const demoId = DEMO_USER_ID;
      const demoUser = {
        id: demoId,
        email: 'demo@siyahbeyazfm.com',
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
      } as unknown as User;
      const demoToken = btoa(`demo-${demoId}-${Date.now()}-${Math.random()}`);
      const demoSession = {
        access_token: demoToken,
        token_type: 'bearer',
        expires_at: Math.floor(Date.now() / 1000) + 86400,
        user: demoUser,
      } as unknown as Session;
      setUser(demoUser);
      setSession(demoSession);
      setIsDemoMode(true);
      setLoading(false);
      // NOT: Profil otomatik oluşturulmuyor.
      // page.tsx'de profil yoksa ManagerRegistration gösterilir,
      // kullanıcı kendi takım ismi, renkleri ve felsefesini seçer.
      return;
    }

    const supabase = getSupabase()!;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: { team_name?: string; manager_name?: string }) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase yapılandırılmamış' };
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
    if (!isSupabaseConfigured()) return { error: 'Supabase yapılandırılmamış' };
    const supabase = getSupabase()!;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    // Supabase oturumunu kapat (yapılandırılmışsa)
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase()!;
        await supabase.auth.signOut();
      } catch {}
    }
    // Her durumda state'i ve localStorage'ı temizle
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, isDemoMode, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
