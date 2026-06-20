'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { BADGE_DEFINITIONS, type BadgeType, type BadgeEntry } from '@/lib/fm/celebrationSystem';

// ─── Single Badge Component ────────────────────────────────────────

interface AchievementBadgeProps {
  badgeType: BadgeType;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ badgeType, earnedAt, size = 'md' }: AchievementBadgeProps) {
  const def = BADGE_DEFINITIONS[badgeType];
  if (!def) return null;

  const sizeClasses = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base',
  };

  const iconSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl ${sizeClasses[size]} hover:bg-white/[0.06] transition-colors`}
    >
      <div className={`shrink-0 ${iconSizes[size]}`}>{def.icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold ${def.color} truncate`}>{def.name}</p>
        <p className="text-white/30 text-[10px] truncate">{def.description}</p>
        {earnedAt && (
          <p className="text-white/15 text-[10px] mt-0.5">
            {new Date(earnedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Badge Grid Component ──────────────────────────────────────────

interface AchievementBadgeGridProps {
  badges: BadgeEntry[];
  /** Tüm rozetleri göster (kazanılmamışlar kilitli olarak) */
  showAll?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadgeGrid({ badges, showAll = false, size = 'md' }: AchievementBadgeGridProps) {
  const earnedTypes = new Set(badges.map(b => b.badge_type));

  // Kazanılmış rozetler
  const earnedBadges = badges.map(b => (
    <AchievementBadge
      key={b.id}
      badgeType={b.badge_type as BadgeType}
      earnedAt={b.earned_at}
      size={size}
    />
  ));

  // Kilitli rozetler (showAll ise göster)
  const lockedBadges = showAll
    ? Object.keys(BADGE_DEFINITIONS)
        .filter(type => !earnedTypes.has(type as BadgeType))
        .map(type => (
          <div
            key={type}
            className="flex items-center gap-2 bg-white/[0.01] border border-white/[0.03] rounded-xl p-3 opacity-30"
          >
            <div className="text-2xl grayscale">🔒</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white/30 truncate">{BADGE_DEFINITIONS[type as BadgeType].name}</p>
              <p className="text-white/15 text-[10px] truncate">{BADGE_DEFINITIONS[type as BadgeType].description}</p>
            </div>
          </div>
        ))
    : [];

  if (earnedBadges.length === 0 && lockedBadges.length === 0) {
    return (
      <div className="text-center py-6 text-white/20 text-sm">
        <Trophy size={24} className="mx-auto mb-2 opacity-30" />
        Henüz rozet kazanılmadı
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {earnedBadges}
      {lockedBadges}
    </div>
  );
}

// ─── Compact Badge List (for profile sidebar) ──────────────────────

interface CompactBadgeListProps {
  badges: BadgeEntry[];
  maxDisplay?: number;
}

export function CompactBadgeList({ badges, maxDisplay = 5 }: CompactBadgeListProps) {
  if (badges.length === 0) return null;

  const displayed = badges.slice(0, maxDisplay);
  const remaining = badges.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayed.map(b => {
        const def = BADGE_DEFINITIONS[b.badge_type as BadgeType];
        if (!def) return null;
        return (
          <motion.span
            key={b.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs"
            title={`${def.name}: ${def.description}`}
          >
            <span>{def.icon}</span>
            <span className={`${def.color} font-bold`}>{def.name}</span>
          </motion.span>
        );
      })}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs text-white/30">
          +{remaining} daha
        </span>
      )}
    </div>
  );
}

export default AchievementBadgeGrid;
