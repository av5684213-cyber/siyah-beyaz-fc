'use client';

import React, { useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { onEmotionalEvent, type EmotionalEvent } from '@/lib/fm/emotionalEvents';

/**
 * Confetti bileşeni — şampiyonluk veya rekor durumunda ekranda konfeti patlaması.
 * Otomatik olarak emotionalEvent dinler ve uygun olaylarda tetiklenir.
 * Ayrıca manual olarak da tetiklenebilir (trigger prop).
 */
interface ConfettiProps {
  /** Dışarıdan tetikleme — true olduğunda konfeti patlar */
  trigger?: boolean;
  /** Süre (ms) — varsayılan 3000 */
  duration?: number;
  /** Parçacık sayısı — varsayılan 150 */
  particleCount?: number;
  /** Otomatik dinleme — varsayılan true */
  autoListen?: boolean;
  /** Callback — konfeti bittiğinde çağrılır */
  onComplete?: () => void;
}

export default function Confetti({
  trigger = false,
  duration = 3000,
  particleCount = 150,
  autoListen = true,
  onComplete,
}: ConfettiProps) {
  const [isActive, setIsActive] = useState(false);

  const fire = useCallback(() => {
    try {
      setIsActive(true);

      const end = Date.now() + duration;

      // İlk büyük patlama
      confetti({
        particleCount,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6347', '#00CED1', '#7FFF00', '#FF69B4'],
      });

      // Sağdan
      confetti({
        particleCount: Math.floor(particleCount / 3),
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FF6347', '#00CED1'],
      });

      // Soldan
      confetti({
        particleCount: Math.floor(particleCount / 3),
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#7FFF00', '#FF69B4', '#FFD700'],
      });

      // Sürekli küçük patlamalar
      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          setIsActive(false);
          onComplete?.();
          return;
        }

        confetti({
          particleCount: 30,
          angle: 60 + Math.random() * 60,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF6347', '#00CED1', '#7FFF00', '#FF69B4'],
        });
      }, 400);
    } catch (err) {
      console.error('[Confetti] fire error:', err);
      setIsActive(false);
    }
  }, [duration, particleCount, onComplete]);

  // Dış tetikleme
  useEffect(() => {
    if (trigger) {
      fire();
    }
  }, [trigger, fire]);

  // Duygusal olay dinleyicisi
  useEffect(() => {
    if (!autoListen) return;

    const unsubscribe = onEmotionalEvent((event: EmotionalEvent) => {
      if (
        event.type === 'CHAMPION' ||
        event.type === 'RECORD_TOP_SCORER' ||
        event.type === 'RECORD_TOP_ASSIST' ||
        event.type === 'CAREER_HAT_TRICK'
      ) {
        fire();
      }
    });

    return unsubscribe;
  }, [autoListen, fire]);

  // Bu bileşen görsel render etmez — canvas-confetti DOM'a doğrudan eklenir
  return isActive ? (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true" />
  ) : null;
}

/**
 * Manuel konfeti tetikleme fonksiyonu — bileşen olmadan kullanılabilir.
 */
export function fireConfetti(particleCount: number = 100): void {
  try {
    confetti({
      particleCount,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF6347', '#00CED1', '#7FFF00', '#FF69B4'],
    });
  } catch (err) {
    console.error('[Confetti] fireConfetti error:', err);
  }
}
