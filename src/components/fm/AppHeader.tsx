'use client';

import React from 'react';
import {
  Activity,
  Wallet,
  CalendarDays,
  Shield,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { toTitleCase } from '@/lib/fm/ui-helpers';
import { t } from '@/lib/fm/i18n';
import { useScrollDirection } from '@/lib/hooks/useMobileGestures';
import Image from 'next/image';

interface AppHeaderProps {
  profile: {
    team_name: string;
    league_name?: string;
    money: number;
    credits?: number;
    current_day: number;
    primary_color?: string;
    secondary_color?: string;
  } | null;
}

export function AppHeader({ profile }: AppHeaderProps) {
  const [now, setNow] = React.useState<Date | null>(null);
  const { scrollDirection, isScrolled } = useScrollDirection();

  // Mobilde scroll down → header compact, scroll up → header geniş
  const isCompact = isScrolled && scrollDirection === 'down';

  React.useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTrTime = (date: Date | null) => {
    if (!date) return null;
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (3 * 3600000));
  };

  const trTime = getTrTime(now);

  const formatMoney = (money: number) => {
    if (money >= 1000000) return `${(money / 1000000).toFixed(1)}M`;
    if (money >= 1000) return `${(money / 1000).toFixed(0)}K`;
    return `${money}`;
  };

  return (
    <motion.header
      animate={{
        height: isCompact ? 48 : 'auto',
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="border-b border-white/5 px-2 sm:px-4 lg:px-6 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-2xl z-40 gap-2 safe-area-top overflow-hidden"
      style={{ minHeight: 48 }}
    >
      {/* Sol: Logo + Takım adı */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 min-w-0 flex-1">
        <div className="relative shrink-0">
          <motion.div
            animate={{ scale: isCompact ? 0.8 : 1 }}
            className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
            style={{ backgroundColor: '#000' }}
          >
            <Image
              src="/game-icon.png"
              alt="Touchline Manager"
              width={48}
              height={48}
              className="w-full h-full object-cover"
              priority
            />
          </motion.div>
          {!isCompact && (
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-lg border-2 border-black flex items-center justify-center"
              style={{ backgroundColor: profile?.secondary_color || '#ef4444' }}
            >
              <Shield className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-2xl font-black italic tracking-tighter leading-none flex items-baseline gap-1.5 text-white min-w-0">
            <span className="truncate">{toTitleCase(profile?.team_name || '')}</span>
            <span className="text-[8px] sm:text-[10px] not-italic bg-white/10 px-1.5 py-0.5 rounded text-white/60 tracking-normal shrink-0 hidden sm:inline">PRO</span>
          </h1>
          {/* Meta info — compact modda gizle */}
          <AnimatePresence>
            {!isCompact && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-1.5 sm:gap-3 mt-1 text-[9px] uppercase font-bold tracking-[0.15em] sm:tracking-[0.2em] text-white/40 flex-wrap min-w-0 overflow-hidden"
              >
                <span className="flex items-center gap-1 font-black min-w-0">
                  <Activity size={10} style={{ color: profile?.secondary_color || '#ef4444' }} className="shrink-0" />
                  <span className="truncate max-w-[60px] sm:max-w-none">{profile?.league_name?.toUpperCase() || t('header_super_lig')}</span>
                </span>
                <span className="w-1 h-1 bg-white/20 rounded-full shrink-0" />
                <span className="flex items-center gap-1 shrink-0"><CalendarDays size={10} /> {profile?.current_day}. {t('header_day')}</span>
                <span className="hidden sm:flex items-center gap-1 w-1 h-1 bg-white/20 rounded-full shrink-0" />
                <span className="hidden sm:flex items-center gap-1 text-amber-400/60"><Clock size={10} /> {Math.max(0, 34 - ((profile?.current_day || 1) % 34 || 34))} {t('header_days')}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sağ: Bütçe + Kredi + (sm+) TR saat */}
      <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-6 shrink-0">
        {/* TR Saat — sadece sm+ ve non-compact */}
        {!isCompact && (
          <div className="hidden sm:flex flex-col items-end gap-0.5 text-right px-2 lg:px-4 border-l border-white/5 whitespace-nowrap">
            <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-bold">{t('header_tr_time')}</p>
            <div className="flex flex-col items-end leading-none">
              <span className="font-mono text-sm font-bold text-white/80 tabular-nums">
                {trTime ? trTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
              </span>
              <span className="text-[8px] text-white/40 font-bold uppercase tracking-tight">
                {trTime ? trTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' }) : '---'}
              </span>
            </div>
          </div>
        )}

        {/* Bütçe — mobilde çok kompakt */}
        <div className="text-right flex flex-col items-end border-l border-white/5 pl-1.5 sm:pl-4">
          <div className="flex items-center gap-1 sm:gap-2 justify-end">
            <Wallet size={isCompact ? 10 : 12} className="text-emerald-400/60 shrink-0" />
            <p className="font-mono text-xs sm:text-lg font-medium tracking-tighter text-emerald-400 whitespace-nowrap">
              {formatMoney(profile?.money || 0)} €
            </p>
          </div>
        </div>

        {/* Kredi — mobilde çok kompakt */}
        <div className="text-right flex flex-col items-end border-l border-white/5 pl-1.5 sm:pl-4">
          <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
            <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center border border-amber-600 shadow-[0_0_10px_rgba(251,191,36,0.3)] shrink-0">
              <span className="text-[8px] font-black text-amber-900">K</span>
            </div>
            <p className="font-mono text-xs sm:text-lg font-medium tracking-tighter text-amber-400 whitespace-nowrap">
              {profile?.credits?.toLocaleString() || '0'}
            </p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
