'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Shield,
  Swords,
  Globe,
  Trophy,
  Calendar,
  MoreHorizontal,
  Settings,
  Building2,
  Binoculars,
  Dumbbell,
  Archive,
  Newspaper,
  Activity,
  DollarSign,
  Users,
  Award,
  X,
  Zap,
} from 'lucide-react';
import { useHaptic } from '@/lib/hooks/useMobileGestures';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (newTab: string) => void;
  isAdmin?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// MOBİL NAVİGASYON — Üst + Alt bar
//
// Üst bar: 5 ana sekme (yatay scroll, kompakt)
// Alt bar: 5 ikincil sekme + Diğer butonu
// ═══════════════════════════════════════════════════════════════

// Üst bar — en önemli 5 sekme
const TOP_TABS = [
  { id: 'dashboard', label: 'Ev', icon: LayoutDashboard },
  { id: 'tactics', label: 'Kadro', icon: Shield },
  { id: 'matchday', label: 'Maç', icon: Swords },
  { id: 'multiplayer', label: 'Pazar', icon: Globe },
  { id: 'league', label: 'Lig', icon: Trophy },
];

// Alt bar — 5 ikincil sekme + Diğer
const BOTTOM_TABS = [
  { id: 'stadium', label: 'Yer', icon: Building2 },
  { id: 'scouting', label: 'Göz', icon: Binoculars },
  { id: 'training', label: 'Ant', icon: Dumbbell },
  { id: 'fixtures', label: 'Fik', icon: Calendar },
  { id: 'friendly', label: 'Haz', icon: Activity },
];

// "Diğer" menüsü — kalan sekmeler
const MORE_TABS = [
  { id: 'operations', label: 'Operasyon', icon: Zap },
  { id: 'financial', label: 'Finansal', icon: DollarSign },
  { id: 'youth', label: 'Akademi', icon: Users },
  { id: 'inventory', label: 'Arşiv', icon: Archive },
  { id: 'newspaper', label: 'Haberler', icon: Newspaper },
  { id: 'cups', label: 'Kupalar', icon: Trophy },
  { id: 'awards', label: 'Ödüller', icon: Award },
  { id: 'reports', label: 'Raporlar', icon: Newspaper },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export default function MobileBottomNav({ activeTab, onTabChange, isAdmin }: MobileBottomNavProps) {
  const [showMore, setShowMore] = useState(false);
  const haptic = useHaptic();

  const handleTabChange = (tabId: string) => {
    haptic(15);
    onTabChange(tabId);
  };

  const allMoreTabs = isAdmin
    ? [...MORE_TABS, { id: 'admin', label: 'Admin', icon: Shield }]
    : MORE_TABS;

  const isActiveInTop = TOP_TABS.some(t => t.id === activeTab);
  const isActiveInBottom = BOTTOM_TABS.some(t => t.id === activeTab);
  const isActiveInMore = allMoreTabs.some(t => t.id === activeTab);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          ÜST TAB BAR — 5 ana sekme (yatay, kompakt)
          Header'ın hemen altında, sadece mobilde
          ═══════════════════════════════════════════════════════════ */}
      <div className="lg:hidden sticky top-[48px] z-30 bg-black/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-around px-1 h-11">
          {TOP_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 transition-all relative mobile-tap-highlight ${
                  isActive ? 'text-amber-400' : 'text-white/40'
                }`}
                aria-label={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="topNavIndicator"
                    className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="text-[10px] font-black uppercase tracking-wider leading-none">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          "Diğer" MENÜSÜ — Bottom Sheet
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] lg:hidden"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 bg-zinc-900/98 border-t border-white/10 rounded-t-3xl p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] z-[95] lg:hidden backdrop-blur-xl shadow-2xl"
            >
              <div className="flex justify-center mb-3">
                <div className="w-10 h-1 bg-white/15 rounded-full" />
              </div>
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                  Tüm Sekmeler
                </span>
                <button
                  onClick={() => setShowMore(false)}
                  className="touch-target-44 flex items-center justify-center rounded-full hover:bg-white/10"
                  aria-label="Kapat"
                >
                  <X size={16} className="text-white/40" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-[50vh] overflow-y-auto no-scrollbar">
                {allMoreTabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        handleTabChange(tab.id);
                        setShowMore(false);
                      }}
                      className={`touch-target-44 flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all mobile-tap-highlight ${
                        isActive
                          ? 'bg-amber-500/15 border border-amber-500/40'
                          : 'hover:bg-white/5 border border-transparent active:bg-white/10'
                      }`}
                    >
                      <Icon size={20} className={isActive ? 'text-amber-400' : 'text-white/40'} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider leading-tight text-center ${
                        isActive ? 'text-amber-400' : 'text-white/30'
                      }`}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          ALT NAVIGATION BAR — 5 ikincil sekme + Diğer
          ═══════════════════════════════════════════════════════════ */}
      <nav
        className="lg:hidden mobile-bottom-nav mobile-tap-highlight"
        role="navigation"
        aria-label="İkincil navigasyon"
      >
        <div className="flex items-stretch justify-around h-14">
          {/* 5 İkincil Sekme */}
          {BOTTOM_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 transition-all relative mobile-tap-highlight ${
                  isActive ? 'text-amber-400' : 'text-white/40'
                }`}
                aria-label={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  style={isActive ? { transform: 'scale(1.08)' } : undefined}
                />
                <span className="text-[10px] font-black uppercase tracking-wider leading-none">
                  {tab.label}
                </span>
              </button>
            );
          })}
          {/* "Diğer" Butonu */}
          <button
            onClick={() => {
              haptic(15);
              setShowMore(!showMore);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 transition-all relative mobile-tap-highlight ${
              isActiveInMore || showMore ? 'text-amber-400' : 'text-white/40'
            }`}
            aria-label="Diğer sekmeler"
            aria-expanded={showMore}
          >
            {(isActiveInMore || showMore) && (
              <motion.div
                layoutId="bottomNavIndicatorMore"
                className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-400 rounded-full"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
            <MoreHorizontal
              size={18}
              strokeWidth={isActiveInMore || showMore ? 2.5 : 1.75}
              style={isActiveInMore || showMore ? { transform: 'scale(1.08)' } : undefined}
            />
            <span className="text-[10px] font-black uppercase tracking-wider leading-none">
              Diğer
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
