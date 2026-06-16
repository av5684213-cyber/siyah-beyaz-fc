'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Activity, 
  Settings, 
  LayoutDashboard,
  TrendingUp,
  Wallet,
  Target,
  Swords,
  Dumbbell,
  CalendarDays,
  Shield,
  Clock,
} from 'lucide-react';

import { toTitleCase } from '@/lib/fm/ui-helpers';
import { t } from '@/lib/fm/i18n';
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

export function AppHeader({ 
  profile
}: AppHeaderProps) {
  const [now, setNow] = React.useState<Date | null>(null);

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

  return (
    <header className="border-b border-white/5 p-4 sm:p-6 flex justify-between items-center sticky top-0 bg-black/60 backdrop-blur-2xl z-50">
      <div className="flex items-center gap-5">
        <div className="relative">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 overflow-hidden"
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
          </div>
          <div 
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 border-black flex items-center justify-center"
            style={{ backgroundColor: profile?.secondary_color || '#ef4444' }}
          >
             <Shield className="w-3 h-3 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter leading-none flex items-baseline gap-2 text-white">
            {toTitleCase(profile?.team_name || '')}
            <span className="text-[10px] not-italic bg-white/10 px-2 py-0.5 rounded text-white/60 tracking-normal">PRO</span>
          </h1>
          <div className="flex items-center gap-3 mt-1.5 text-[9px] uppercase font-bold tracking-[0.2em] text-white/40">
            <span className="flex items-center gap-1 font-black">
              <Activity size={10} style={{ color: profile?.secondary_color || '#ef4444' }} /> 
              {profile?.league_name?.toUpperCase() || t('header_super_lig')}
            </span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="flex items-center gap-1"><CalendarDays size={10} /> {profile?.current_day}. {t('header_day')}</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="flex items-center gap-1 text-amber-400/60"><Clock size={10} /> {t('header_remaining')} {Math.max(0, 34 - ((profile?.current_day || 1) % 34 || 34))} {t('header_days')}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="h-10 w-px bg-white/5 hidden sm:block" />

        <div className="flex flex-col items-end gap-0.5 text-right px-4 border-l border-white/5 whitespace-nowrap">
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

        <div className="text-right flex flex-col items-end border-l border-white/5 pl-4">
          <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-bold mb-0.5">{t('header_budget')}</p>
          <div className="flex items-center gap-2 justify-end">
            <Wallet size={12} className="text-emerald-400/60" />
            <p className="font-mono text-lg font-medium tracking-tighter text-emerald-400">
              {(profile?.money || 0) >= 1000000
                ? `${((profile?.money || 0) / 1000000).toFixed(2)}M`
                : (profile?.money || 0) >= 1000
                  ? `${((profile?.money || 0) / 1000).toFixed(0)}K`
                  : `${profile?.money || 0}`} €
            </p>
          </div>
        </div>

        <div className="text-right flex flex-col items-end border-l border-white/5 pl-4">
          <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-bold mb-0.5">{t('header_credits')}</p>
          <div className="flex items-center gap-2 justify-end">
            <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center border border-amber-600 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
               <span className="text-[8px] font-black text-amber-900">K</span>
            </div>
            <p className="font-mono text-lg font-medium tracking-tighter text-amber-400">
              {profile?.credits?.toLocaleString() || '0'} KR
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
