'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Contrast } from 'lucide-react';

type ThemeMode = 'dark' | 'light' | 'high-contrast';

const THEME_LABELS: Record<ThemeMode, { label: string; icon: React.ReactNode; desc: string }> = {
  dark: { label: 'Karanlık', icon: <Moon size={14} />, desc: 'Varsayılan koyu tema' },
  light: { label: 'Aydınlık', icon: <Sun size={14} />, desc: 'Açık arka planlı tema' },
  'high-contrast': { label: 'Yüksek Kontrast', icon: <Contrast size={14} />, desc: 'Parlak metin, koyu gri arka plan' },
};

const THEME_ORDER: ThemeMode[] = ['dark', 'light', 'high-contrast'];

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem('sb-fc-theme');
    if (stored && THEME_ORDER.includes(stored as ThemeMode)) return stored as ThemeMode;
  } catch (e) { console.warn("[silent-catch]", e); }
  return 'dark';
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  // Remove all theme classes
  html.classList.remove('dark', 'light', 'high-contrast');
  // Add the selected theme class
  html.classList.add(mode);
  // Also set as data attribute for CSS selectors
  html.setAttribute('data-theme', mode);
  // Persist
  try { localStorage.setItem('sb-fc-theme', mode); } catch (e) { console.warn("[silent-catch]", e); }
}

export default function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('dark');
  const [isOpen, setIsOpen] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const stored = getStoredTheme();
    setCurrentTheme(stored);
    applyTheme(stored);
  }, []);

  const cycleTheme = useCallback(() => {
    const currentIndex = THEME_ORDER.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % THEME_ORDER.length;
    const nextTheme = THEME_ORDER[nextIndex];
    setCurrentTheme(nextTheme);
    applyTheme(nextTheme);
    setIsOpen(false);
  }, [currentTheme]);

  const setTheme = useCallback((theme: ThemeMode) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    setIsOpen(false);
  }, []);

  const currentInfo = THEME_LABELS[currentTheme];

  return (
    <div className="relative">
      {/* Main toggle button */}
      <button
        onClick={cycleTheme}
        onContextMenu={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10 transition-all"
        title={`Tema: ${currentInfo.label} (Değiştirmek için tıklayın, menü için sağ tıklayın)`}
      >
        {currentInfo.icon}
        <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">
          {currentInfo.label}
        </span>
      </button>

      {/* Dropdown menu (right-click or long press) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[200]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-[201] bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[180px]"
            >
              <div className="p-1.5">
                <div className="px-2 py-1.5 text-[8px] font-black text-white/25 uppercase tracking-widest">
                  Tema Seçimi
                </div>
                {THEME_ORDER.map((theme) => {
                  const info = THEME_LABELS[theme];
                  const isActive = theme === currentTheme;
                  return (
                    <button
                      key={theme}
                      onClick={() => setTheme(theme)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                        isActive
                          ? 'bg-amber-500/10 border border-amber-500/20'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-500/25 text-amber-400'
                          : 'bg-white/5 border-white/10 text-white/40'
                      }`}>
                        {info.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[11px] font-bold ${isActive ? 'text-amber-300' : 'text-white/70'}`}>
                          {info.label}
                        </div>
                        <div className="text-[9px] text-white/30 leading-tight">
                          {info.desc}
                        </div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
