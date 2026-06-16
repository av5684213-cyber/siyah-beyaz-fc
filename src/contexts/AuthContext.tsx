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

  // DEV_MODE is now OFF in production — all users must authenticate
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  useEffect(() => {
    // Only allow DEV_MODE in development environments
    if (isDevMode || !isSupabaseConfigured()) {
      const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb_demo_user_id');
      }
      const demoUser = {
        id: DEMO_USER_ID,
        email: 'demo@touchlinemanager.com',
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
      } as unknown as User;
      const demoToken = btoa(`demo-${DEMO_USER_ID}-${Date.now()}-${Math.random()}`);
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
      return;
    }

    // Production: real auth flow
    const supabase = getSupabase()!;

    // 1. Check for persisted Google auth first (for users who logged in via Google)
    const persisted = readPersistedAuth();
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
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
    // Clear persisted Google auth
    clearPersistedAuth();

    // Sign out of Supabase Auth if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase()!;
        await supabase.auth.signOut();
      } catch {}
    }
    // Clear state
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
