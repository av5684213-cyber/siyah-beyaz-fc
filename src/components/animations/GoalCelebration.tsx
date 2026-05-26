'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * GoalCelebration — maç sırasında gol olduğunda kısa kutlama animasyonu.
 * Gol atan oyuncunun adını ve heyecanlı bir mesaj gösterir.
 * Otomatik olarak MatchEvent GOAL tipi ile tetiklenebilir.
 */

interface GoalCelebrationProps {
  /** Gol atan oyuncu adı */
  scorer?: string;
  /** Gol dakikası */
  minute?: number;
  /** Dışarıdan tetikleme */
  trigger?: boolean;
  /** Animasyon süresi (ms) */
  duration?: number;
  /** Callback — animasyon bittiğinde */
  onComplete?: () => void;
  /** Hat-trick kontrolü */
  isHatTrick?: boolean;
  /** Son dakika golü kontrolü */
  isLateWinner?: boolean;
}

const CELEBRATION_MESSAGES = [
  'GOOOL!',
  'MUHTEŞEM GOL!',
  'İNANILMAZ!',
  'TRİBÜNLER AYAĞA KALKTI!',
  'HARİKA BİR VURUŞ!',
  'KALECİNİN YAPACAĞI BİR ŞEY YOK!',
  'FUTBOL BÖYLE BİR OYUN!',
  'İŞTE BU!',
];

const getRandomMessage = (): string => {
  try {
    return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
  } catch {
    return 'GOOL!';
  }
};

export default function GoalCelebration({
  scorer,
  minute,
  trigger = false,
  duration = 2500,
  onComplete,
  isHatTrick = false,
  isLateWinner = false,
}: GoalCelebrationProps) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('GOOL!');

  const celebrate = useCallback(() => {
    try {
      setMessage(getRandomMessage());
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    } catch (err) {
      console.error('[GoalCelebration] celebrate error:', err);
      setShow(false);
    }
  }, [duration, onComplete]);

  useEffect(() => {
    if (trigger) {
      celebrate();
    }
  }, [trigger, celebrate]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[9998] flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        >
          {/* Arka plan parıltısı */}
          <motion.div
            className="absolute inset-0"
            initial={{ background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)' }}
            animate={{
              background: [
                'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(255,99,71,0.5) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
              ],
            }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />

          {/* Ana metin */}
          <motion.div
            className="relative text-center"
            initial={{ y: 20 }}
            animate={{ y: [20, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-6xl font-black tracking-wider text-yellow-400 drop-shadow-[0_0_30px_rgba(255,215,0,0.8)] md:text-8xl"
              animate={{
                scale: [1, 1.2, 1],
                textShadow: [
                  '0 0 20px rgba(255,215,0,0.8)',
                  '0 0 40px rgba(255,215,0,1)',
                  '0 0 20px rgba(255,215,0,0.8)',
                ],
              }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              {message}
            </motion.div>

            {isHatTrick && (
              <motion.div
                className="mt-2 text-3xl font-black tracking-wider text-purple-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.8)] md:text-5xl"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: [1, 1.3, 1] }}
                transition={{ delay: 0.2, duration: 0.6, repeat: 2 }}
              >
                HAT-TRICK! 🎩
              </motion.div>
            )}

            {isLateWinner && !isHatTrick && (
              <motion.div
                className="mt-2 text-3xl font-black tracking-wider text-red-400 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] md:text-5xl"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: [1, 1.3, 1] }}
                transition={{ delay: 0.2, duration: 0.6, repeat: 2 }}
              >
                SON DAKİKA GOLÜ! 🔥
              </motion.div>
            )}

            {scorer && (
              <motion.div
                className="mt-4 text-2xl font-bold text-white md:text-3xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                ⚽ {scorer}
                {minute !== undefined && (
                  <span className="ml-2 text-lg text-white/60">{minute}&apos;</span>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
