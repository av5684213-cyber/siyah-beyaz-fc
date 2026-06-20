'use client';

import React from 'react';
import { motion } from 'motion/react';

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-zinc-900 border border-white/5 rounded-xl p-4 ${className}`}>
    {children}
  </div>
);

export const NavButton = ({ icon, label, active, onClick, badge, className, disabled, dimmed }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: string, className?: string, disabled?: boolean, dimmed?: boolean }) => (
  <button 
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
      disabled ? 'text-white/15 cursor-not-allowed opacity-50' 
      : dimmed ? 'text-white/25 hover:text-white/40 hover:bg-white/[0.03]'
      : active ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'
    } ${className || ''}`}
  >
    {icon}
    <span>{label}</span>
    {disabled && (
      <span className="absolute right-2 text-[10px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-1.5 py-0.5 rounded">
        YAKINDA
      </span>
    )}
    {dimmed && !disabled && (
      <span className="absolute right-2 text-[10px] font-black uppercase tracking-widest text-amber-500/30 bg-amber-500/5 px-1.5 py-0.5 rounded">
        BETA
      </span>
    )}
    {badge && (
      <span className="absolute -right-1 -top-1 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse shadow-lg border border-white/20 whitespace-nowrap">
        {badge}
      </span>
    )}
  </button>
);

export function ComingSoon({ title, icon }: { title: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl relative"
      >
        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
        <div className="relative z-10 text-white/40">{icon}</div>
      </motion.div>
      <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white mb-2">{title}</h3>
      <div className="px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">YAKINDA</div>
      <p className="text-white/30 text-[10px] max-w-xs leading-relaxed font-bold uppercase tracking-[0.1em]">Bu bölüm geliştirme aşamasındadır. Çok yakında yeni özelliklerle burada olacağız.</p>
    </div>
  );
}
