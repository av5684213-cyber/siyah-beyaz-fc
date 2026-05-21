'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onEmotionalEvent, type EmotionalEvent } from '@/lib/fm/emotionalEvents';

/**
 * RecordBreak — rekor kırıldığında özel bir banner/kart animasyonu.
 * Otomatik olarak emotionalEvent dinler.
 * Ayrıca manual olarak da tetiklenebilir.
 */

interface RecordBreakProps {
  /** Dışarıdan olay gönderme */
  event?: EmotionalEvent | null;
  /** Otomatik dinleme — varsayılan true */
  autoListen?: boolean;
  /** Animasyon süresi (ms) */
  duration?: number;
  /** Callback — animasyon bittiğinde */
  onComplete?: () => void;
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; glow: string; icon: string }> = {
  low: {
    bg: 'from-blue-900/90 to-blue-800/90',
    border: 'border-blue-500/50',
    glow: 'shadow-blue-500/30',
    icon: '📝',
  },
  medium: {
    bg: 'from-purple-900/90 to-purple-800/90',
    border: 'border-purple-500/50',
    glow: 'shadow-purple-500/30',
    icon: '⭐',
  },
  high: {
    bg: 'from-amber-900/90 to-amber-800/90',
    border: 'border-amber-500/50',
    glow: 'shadow-amber-500/40',
    icon: '🔥',
  },
  legendary: {
    bg: 'from-yellow-900/90 via-red-900/90 to-amber-900/90',
    border: 'border-yellow-400/60',
    glow: 'shadow-yellow-400/50',
    icon: '👑',
  },
};

export default function RecordBreak({
  event: externalEvent,
  autoListen = true,
  duration = 4000,
  onComplete,
}: RecordBreakProps) {
  const [currentEvent, setCurrentEvent] = useState<EmotionalEvent | null>(null);
  const [show, setShow] = useState(false);

  const displayEvent = useCallback(
    (evt: EmotionalEvent) => {
      try {
        setCurrentEvent(evt);
        setShow(true);
        setTimeout(() => {
          setShow(false);
          setTimeout(() => {
            setCurrentEvent(null);
            onComplete?.();
          }, 500);
        }, duration);
      } catch (err) {
        console.error('[RecordBreak] displayEvent error:', err);
        setShow(false);
      }
    },
    [duration, onComplete]
  );

  // Dışarıdan gelen event
  useEffect(() => {
    if (externalEvent) {
      displayEvent(externalEvent);
    }
  }, [externalEvent, displayEvent]);

  // Duygusal olay dinleyicisi
  useEffect(() => {
    if (!autoListen) return;

    const unsubscribe = onEmotionalEvent((evt: EmotionalEvent) => {
      if (
        evt.type.startsWith('RECORD_') ||
        evt.type === 'CAREER_FIRST_GOAL' ||
        evt.type === 'CAREER_FIRST_ASSIST' ||
        evt.type === 'CAREER_HAT_TRICK' ||
        evt.type === 'BIG_TRANSFER'
      ) {
        displayEvent(evt);
      }
    });

    return unsubscribe;
  }, [autoListen, displayEvent]);

  const style = currentEvent
    ? SEVERITY_STYLES[currentEvent.severity] ?? SEVERITY_STYLES.medium
    : SEVERITY_STYLES.medium;

  return (
    <AnimatePresence>
      {show && currentEvent && (
        <motion.div
          className="fixed inset-0 z-[9997] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Arka plan karartma */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Rekor kartı */}
          <motion.div
            className={`relative w-full max-w-md overflow-hidden rounded-2xl border ${style.border} bg-gradient-to-br ${style.bg} shadow-2xl ${style.glow}`}
            initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          >
            {/* Üst parıltı çizgisi */}
            <motion.div
              className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            <div className="p-6 text-center">
              {/* İkon */}
              <motion.div
                className="mb-3 text-5xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: 2 }}
              >
                {currentEvent.icon || style.icon}
              </motion.div>

              {/* Başlık */}
              <motion.h2
                className="mb-2 text-2xl font-black tracking-wider text-white md:text-3xl"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentEvent.title}
              </motion.h2>

              {/* Açıklama */}
              <motion.p
                className="text-sm leading-relaxed text-white/80 md:text-base"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {currentEvent.description}
              </motion.p>

              {/* Oyuncu adı */}
              {currentEvent.player && (
                <motion.div
                  className="mt-3 inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-yellow-300"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                >
                  {currentEvent.player}
                </motion.div>
              )}
            </div>

            {/* Alt parıltı çizgisi */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
