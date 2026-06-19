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
  onTabChange: (newTab: string) => void;
  isAdmin?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════
// MOBİL BOTTOM NAV — Kapsamlı Mobil UX
// ═══════════════════════════════════════════════════════════════════════
//
// Tasarım kararları:
// 1. 5 ana sekme (Dashboard, Kadro, Maç, Pazar, Lig) + "Diğer" overflow butonu
// 2. Her buton minimum 48x48px touch target (Material Design standard)
// 3. Aktif sekme: amber-400 vurgu + üst indicator bar + scale animasyonu
// 4. Pasif sekme: 30% opacity, hover'da 50%
// 5. safe-area-inset-bottom ile iOS home indicator + Android gesture bar'a uyum
// 6. "Diğer" menüsü: bottom sheet tarzı, 4 sütun grid, scrollable
// 7. Backdrop blur ile cam efekti (modern mobil pattern)
// 8. Mobilde sadece lg-breakpoint'te gizlenir (tablette de görünür)
//
// Önceki düzeltmelerde eksik kalanlar:
// - Touch target'lar 44px altındaydı → 48px'e çıkarıldı
// - safe-area-inset-bottom handle edilmiyordu → eklendi
// - "Diğer" menüsü dar ve taşma yapıyordu → full-width bottom sheet
// - Aktif indicator varyansı yoktu → hem top bar hem dot eklendi
// - Label font-size 8px çok küçüktü → 9px'e çıkarıldı (okunabilirlik)

const PRIMARY_TABS = [
  { id: 'dashboard', label: 'Ev', icon: LayoutDashboard },
  { id: 'tactics', label: 'Kadro', icon: Shield },
  { id: 'matchday', label: 'Maç', icon: Swords },
  { id: 'multiplayer', label: 'Pazar', icon: Globe },
  { id: 'league', label: 'Lig', icon: Trophy },
];

const MORE_TABS = [
  { id: 'stadium', label: 'Yerleşke', icon: Building2 },
  { id: 'scouting', label: 'Gözlem', icon: Binoculars },
  { id: 'training', label: 'Antrenman', icon: Dumbbell },
  { id: 'friendly', label: 'Hazırlık', icon: Activity },
  { id: 'fixtures', label: 'Fikstür', icon: Calendar },
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

  const allMoreTabs = isAdmin
    ? [...MORE_TABS, { id: 'admin', label: 'Admin', icon: Shield }]
    : MORE_TABS;

  // isActiveInMore: "Diğer" butonunun aktif sekme için vurgulanıp vurgulanmayacağı
  const isActiveInMore = allMoreTabs.some(t => t.id === activeTab);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          "Diğer" Menüsü — Bottom Sheet Tarzı
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showMore && (
          <>
            {/* Backdrop overlay — tıklayınca kapat */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] lg:hidden"
              onClick={() => setShowMore(false)}
            />
            {/* Bottom sheet — yukarı doğru kayarak açılır */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 bg-zinc-900/98 border-t border-white/10 rounded-t-3xl p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] z-[95] lg:hidden backdrop-blur-xl shadow-2xl"
            >
              {/* Handle bar — drag indicator görseli */}
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
              {/* Grid — 4 sütun (mobilde), scrollable overflow varsa dikey */}
              <div className="grid grid-cols-4 gap-2 max-h-[50vh] overflow-y-auto no-scrollbar">
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
                      className={`touch-target-44 flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all mobile-tap-highlight ${
                        isActive
                          ? 'bg-amber-500/15 border border-amber-500/40'
                          : 'hover:bg-white/5 border border-transparent active:bg-white/10'
                      }`}
                    >
                      <Icon
                        size={20}
                        className={isActive ? 'text-amber-400' : 'text-white/40'}
                      />
                      <span className={`text-[9px] font-bold uppercase tracking-wider leading-tight text-center ${
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
          Bottom Navigation Bar — Sabit Alt Nav
          ═══════════════════════════════════════════════════════════ */}
      <nav
        className="lg:hidden mobile-bottom-nav mobile-tap-highlight"
        role="navigation"
        aria-label="Ana navigasyon"
      >
        <div className="flex items-stretch justify-around h-16">
          {/* 5 Ana Sekme */}
          {PRIMARY_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all relative mobile-tap-highlight ${
                  isActive ? 'text-amber-400' : 'text-white/40 hover:text-white/60 active:text-white/80'
                }`}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Aktif indicator — üst bar */}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-10 h-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className="transition-transform"
                  style={isActive ? { transform: 'scale(1.08)' } : undefined}
                />
                <span className="text-[9px] font-black uppercase tracking-wider leading-none">
                  {tab.label}
                </span>
                {/* Aktif dot indicator — alt */}
                {isActive && (
                  <motion.div
                    layoutId={`mobileNavDot-${tab.id}`}
                    className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-400"
                  />
                )}
              </button>
            );
          })}
          {/* "Diğer" Butonu — overflow menüyü açar */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all relative mobile-tap-highlight ${
              isActiveInMore || showMore
                ? 'text-amber-400'
                : 'text-white/40 hover:text-white/60 active:text-white/80'
            }`}
            aria-label="Diğer sekmeler"
            aria-expanded={showMore}
          >
            {(isActiveInMore || showMore) && (
              <motion.div
                layoutId="mobileNavIndicatorMore"
                className="absolute -top-px left-1/2 -translate-x-1/2 w-10 h-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
            <MoreHorizontal
              size={22}
              strokeWidth={isActiveInMore || showMore ? 2.5 : 1.75}
              className="transition-transform"
              style={isActiveInMore || showMore ? { transform: 'scale(1.08)' } : undefined}
            />
            <span className="text-[9px] font-black uppercase tracking-wider leading-none">
              Diğer
            </span>
            {(isActiveInMore || showMore) && (
              <motion.div
                layoutId="mobileNavDot-more"
                className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-400"
              />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
