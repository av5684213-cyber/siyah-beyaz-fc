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
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin?: boolean;
}

const PRIMARY_TABS = [
  { id: 'dashboard', label: 'Ana Sayfa', icon: LayoutDashboard },
  { id: 'tactics', label: 'Kadro', icon: Shield },
  { id: 'multiplayer', label: 'Transfer', icon: Globe },
  { id: 'matchday', label: 'Maç', icon: Swords },
  { id: 'league', label: 'Lig', icon: Trophy },
];

const MORE_TABS = [
  { id: 'stadium', label: 'Yerleşke', icon: Building2 },
  { id: 'scouting', label: 'Gözlemcilik', icon: Binoculars },
  { id: 'training', label: 'Antrenman', icon: Dumbbell },
  { id: 'friendly', label: 'Hazırlık Maçı', icon: Activity },
  { id: 'fixtures', label: 'Fikstür', icon: Calendar },
  { id: 'financial', label: 'Finansal', icon: DollarSign },
  { id: 'youth', label: 'Gençlik Akad.', icon: Users },
  { id: 'inventory', label: 'Arşiv', icon: Archive },
  { id: 'newspaper', label: 'Haberler', icon: Newspaper },
  { id: 'cups', label: 'Kupalar', icon: Trophy },
  { id: 'awards', label: 'Ödüller', icon: Award },
  { id: 'reports', label: 'Raporlar', icon: Newspaper },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export default function MobileBottomNav({ activeTab, onTabChange, isAdmin }: MobileBottomNavProps) {
  const [showMore, setShowMore] = useState(false);

  const allMoreTabs = isAdmin
    ? [...MORE_TABS, { id: 'admin', label: 'Admin', icon: Shield }]
    : MORE_TABS;

  const isActiveInPrimary = PRIMARY_TABS.some(t => t.id === activeTab);
  const isActiveInMore = allMoreTabs.some(t => t.id === activeTab);

  return (
    <>
      {/* More Menu Overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-20 left-2 right-2 bg-zinc-900/98 border border-white/10 rounded-2xl p-4 z-[95] lg:hidden backdrop-blur-xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Tüm Sekmeler</span>
                <button onClick={() => setShowMore(false)} className="p-1 rounded-full hover:bg-white/10">
                  <X size={14} className="text-white/40" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {allMoreTabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        setShowMore(false);
                      }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-white/10 border border-white/20'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-amber-400' : 'text-white/40'} />
                      <span className={`text-[8px] font-bold uppercase tracking-wider ${
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

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-zinc-900/95 backdrop-blur-xl border-t border-white/10 px-2 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around h-16">
            {PRIMARY_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all relative ${
                    isActive ? 'text-amber-400' : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileNavIndicator"
                      className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-400 rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className="text-[8px] font-black uppercase tracking-wider">{tab.label}</span>
                </button>
              );
            })}
            {/* More button */}
            <button
              onClick={() => setShowMore(!showMore)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all relative ${
                isActiveInMore || showMore ? 'text-amber-400' : 'text-white/30 hover:text-white/50'
              }`}
            >
              {(isActiveInMore || showMore) && (
                <motion.div
                  layoutId="mobileNavIndicatorMore"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <MoreHorizontal size={20} strokeWidth={isActiveInMore || showMore ? 2.5 : 1.5} />
              <span className="text-[8px] font-black uppercase tracking-wider">Diğer</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
