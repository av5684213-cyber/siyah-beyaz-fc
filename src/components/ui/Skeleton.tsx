'use client';

import { motion } from 'motion/react';

// ═══════════════════════════════════════════════════════════════
// Skeleton — Yüklenme durumu için iskelet yükleyici
// Mobilde blank ekran yerine skeleton göster → daha iyi UX
// ═══════════════════════════════════════════════════════════════

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-white/5 rounded-lg animate-pulse ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={i === 0 ? 'h-4 w-2/3' : i === lines - 1 ? 'h-3 w-1/3' : 'h-3 w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonStatsBar() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="fm-card p-2 flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonMatchCard() {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-4 h-4 rounded" />
        <Skeleton className="h-2 w-20" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-2">
        <Skeleton className="w-3 h-3 rounded" />
        <Skeleton className="h-2 w-24" />
      </div>
      <Skeleton className="h-6 w-32" />
    </div>
  );
}

export function SkeletonNotificationGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <SkeletonCard key={i} lines={3} />
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <SkeletonStatsBar />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Skeleton className="h-32 rounded-2xl" />
        <SkeletonMatchCard />
      </div>
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <SkeletonNotificationGrid />
    </motion.div>
  );
}

// Stil animasyonu
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('shimmer-keyframes')) {
  style.id = 'shimmer-keyframes';
  document.head.appendChild(style);
}
