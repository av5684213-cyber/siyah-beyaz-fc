'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, Sparkles, Crown, Star } from 'lucide-react';
import type { TrophyType } from '@/lib/fm/celebrationSystem';

// ─── Confetti Particle (Pure CSS) ──────────────────────────────────

interface ConfettiParticle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

function generateConfetti(count: number = 60): ConfettiParticle[] {
  const colors = ['#FFD700', '#FF6347', '#00CED1', '#7FFF00', '#FF69B4', '#FFA500', '#8A2BE2', '#00FF7F'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
}

function CSSConfetti({ particles }: { particles: ConfettiParticle[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            borderRadius: p.size > 8 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Trophy Icon Animation ─────────────────────────────────────────

function AnimatedTrophy({ trophyType }: { trophyType: TrophyType }) {
  const iconMap: Record<TrophyType, { icon: React.ReactNode; label: string }> = {
    league: { icon: <Trophy size={64} className="text-yellow-400" />, label: 'Lig Şampiyonluğu' },
    cup: { icon: <Crown size={64} className="text-amber-300" />, label: 'Kupa Şampiyonluğu' },
    super_cup: { icon: <Star size={64} className="text-cyan-300" />, label: 'Süper Kupa' },
  };

  const { icon, label } = iconMap[trophyType] || iconMap.league;

  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
    >
      {/* Glow ring */}
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-yellow-400/10 blur-xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div className="relative">
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {icon}
        </motion.div>
        {/* Sparkle particles around trophy */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        >
          <Sparkles size={16} className="text-yellow-300" />
        </motion.div>
        <motion.div
          className="absolute -bottom-1 -left-3"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
        >
          <Sparkles size={12} className="text-amber-300" />
        </motion.div>
      </div>
      <span className="text-xs font-bold text-white/50 uppercase tracking-widest">{label}</span>
    </motion.div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────

interface TrophyCelebrationProps {
  /** Kupa tipi */
  trophyType: TrophyType;
  /** Gösterilecek takım adı */
  teamName?: string;
  /** Lig adı */
  leagueName?: string;
  /** Dışarıdan tetikleme — true olduğunda gösterilir */
  show: boolean;
  /** Kapatma callback */
  onClose: () => void;
  /** Otomatik kapanma süresi (ms) — varsayılan 8000 */
  autoDismissMs?: number;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function TrophyCelebration({
  trophyType,
  teamName,
  leagueName,
  show,
  onClose,
  autoDismissMs = 8000,
}: TrophyCelebrationProps) {
  const [confetti] = useState(() => generateConfetti(80));

  // Auto-dismiss
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [show, autoDismissMs, onClose]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Confetti */}
          <CSSConfetti particles={confetti} />

          {/* Content Card */}
          <motion.div
            className="relative z-10 bg-gradient-to-b from-zinc-900 via-zinc-900 to-black border border-yellow-500/30 rounded-3xl p-8 max-w-sm w-[90%] text-center shadow-[0_0_60px_rgba(255,215,0,0.15)]"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
            >
              <X size={16} />
            </button>

            {/* Trophy Animation */}
            <div className="flex justify-center mb-6 relative">
              <AnimatedTrophy trophyType={trophyType} />
            </div>

            {/* Title */}
            <motion.h1
              className="text-2xl font-black text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              Tebrikler!
            </motion.h1>

            <motion.p
              className="text-lg font-bold text-yellow-400 mb-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              Şampiyon oldunuz!
            </motion.p>

            {/* Team & League Info */}
            {teamName && (
              <motion.p
                className="text-sm text-white/50 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {teamName}
              </motion.p>
            )}
            {leagueName && (
              <motion.p
                className="text-xs text-white/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                {leagueName}
              </motion.p>
            )}

            {/* Dismiss hint */}
            <motion.p
              className="text-[10px] text-white/20 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              Tıklayarak kapat
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
