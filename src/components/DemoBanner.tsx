'use client';

import { useAuth } from '@/contexts/AuthContext';

export function DemoBanner() {
  const { isDemoMode } = useAuth();

  if (!isDemoMode) return null;

  return (
    <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-1 text-center">
      <span className="text-amber-400 text-xs font-bold uppercase">
        Demo Modu — Veriler sadece bu tarayıcıda saklanıyor
      </span>
    </div>
  );
}
