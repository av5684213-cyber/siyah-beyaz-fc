/**
 * BUG-7: useShallowFM — Seçici abonelik kancası
 *
 * Bileşenler yalnızca ihtiyaç duydukları alanlara abone olabilir.
 * Seçici değer değişmediğinde yeniden render önlenir.
 *
 * Shallow comparison: ilkel değerler referans ile, diziler ve nesneler
 * ise anahtar bazlı karşılaştırma ile kontrol edilir.
 *
 * Kullanım:
 *   const money = useShallowFM(s => s.profile?.money);
 *   const squadSize = useShallowFM(s => s.squad.length);
 */
'use client';
import { useContext, useRef, useEffect, useState } from 'react';
import { FMContext } from '../FMContext';

/**
 * Yüzeysel (shallow) karşılaştırma: iki değerin eşit olup olmadığını kontrol eder.
 * - İlkel değerler: referans karşılaştırma (===)
 * - Diziler: uzunluk + eleman bazlı referans karşılaştırma
 * - Nesneler: anahtar sayısı + değer referans karşılaştırma
 */
function shallowEqual<T>(prev: T, next: T): boolean {
  if (prev === next) return true;
  if (typeof prev !== 'object' || prev === null || typeof next !== 'object' || next === null) return false;

  if (Array.isArray(prev) && Array.isArray(next)) {
    if (prev.length !== next.length) return false;
    return prev.every((v, i) => v === (next as unknown[])[i]);
  }

  const prevKeys = Object.keys(prev as object);
  const nextKeys = Object.keys(next as object);
  if (prevKeys.length !== nextKeys.length) return false;
  return prevKeys.every(k => (prev as Record<string, unknown>)[k] === (next as Record<string, unknown>)[k]);
}

export function useShallowFM<T>(selector: (state: any) => T): T {
  const context = useContext(FMContext);
  if (!context) throw new Error('useShallowFM bir FMProvider içinde kullanılmalıdır');

  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const [selectedState, setSelectedState] = useState<T>(() => selector(context));
  const prevContextRef = useRef(context);

  useEffect(() => {
    // Bağlam referansı değişmişse seçiciyi yeniden değerlendir
    if (prevContextRef.current !== context) {
      const newSelected = selectorRef.current(context);
      setSelectedState(prev => {
        // Yüzeysel karşılaştırma: değer gerçekten değişmediyse eski referansı koru
        if (shallowEqual(prev, newSelected)) return prev;
        return newSelected;
      });
      prevContextRef.current = context;
    }
  }, [context]);

  return selectedState;
}
