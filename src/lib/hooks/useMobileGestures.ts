'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// useSwipe — Mobil dokunmatik kaydırma jesti algılama
// Sekmeler arası geçiş, modal kapatma, liste kaydırma için
// ═══════════════════════════════════════════════════════════════

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // min px hareket
  timeout?: number;   // max süre (ms)
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  timeout = 500,
}: SwipeHandlers) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.time;

    touchStart.current = null;

    // Çok yavaş hareketi yok say
    if (dt > timeout) return;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Yatay hareket > dikey hareket → yatay swipe
    if (absDx > absDy && absDx > threshold) {
      if (dx > 0 && onSwipeRight) onSwipeRight();
      else if (dx < 0 && onSwipeLeft) onSwipeLeft();
    }
    // Dikey hareket > yatay hareket → dikey swipe
    else if (absDy > absDx && absDy > threshold) {
      if (dy > 0 && onSwipeDown) onSwipeDown();
      else if (dy < 0 && onSwipeUp) onSwipeUp();
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, timeout]);

  return { onTouchStart, onTouchEnd };
}

// ═══════════════════════════════════════════════════════════════
// useScrollDirection — Header collapse için scroll yönü algılama
// ═══════════════════════════════════════════════════════════════

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY.current ? 'down' : 'up';
      
      // Sadece 10px'den fazla hareketlerde yön değiştir (titremeyi önle)
      if (Math.abs(scrollY - lastScrollY.current) > 10) {
        setScrollDirection(direction);
      }
      
      setIsScrolled(scrollY > 20);
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener('scroll', updateScrollDirection, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollDirection);
  }, []);

  return { scrollDirection, isScrolled };
}

// ═══════════════════════════════════════════════════════════════
// usePullToRefresh — Aşağı çekip yenile jesti
// ═══════════════════════════════════════════════════════════════

export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Sadece sayfa en üstteyse pull-to-refresh aktif
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) {
      // Direnç efekti: ne kadar çok çek o kadar yavaş artar
      const resisted = Math.min(dy * 0.4, 80);
      setPullDistance(resisted);
    }
  }, [isRefreshing]);

  const onTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    
    if (pullDistance > 50 && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(40); // loading durumunda sabit
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

  return {
    pullDistance,
    isRefreshing,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}

// ═══════════════════════════════════════════════════════════════
// useHapticFeedback — Dokunmatik titreşim (destekleyen cihazlarda)
// ═══════════════════════════════════════════════════════════════

export function useHaptic() {
  return useCallback((pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // sessizce geç
      }
    }
  }, []);
}
