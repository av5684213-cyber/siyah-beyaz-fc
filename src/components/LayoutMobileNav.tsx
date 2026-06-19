'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import MobileNav from '@/components/fm/MobileNav';

/**
 * Layout-level mobile navigation wrapper.
 * Visible only on mobile (flex md:hidden).
 *
 * KRİTİK MOBİL DÜZELTME:
 * Ana sayfada (/) page.tsx kendi MobileBottomNav'ını render ediyor
 * (5 ana sekme + "Daha Fazla" overflow menüsü). Eğer LayoutMobileNav da
 * render olursa İKİ alt nav bar aynı anda görünür — bu mobilde ciddi UX
 * sorunudur (üst üste binme, çakışan dokunma alanları, kaydırma sorunları).
 *
 * Bu wrapper ana sayfada (/) kendini gizler, sadece alt sayfalarda
 * (/player/[id], /staff, /awards, /fixture vb.) route-based nav gösterir.
 */
export default function LayoutMobileNav() {
  const pathname = usePathname();

  // Ana sayfada MobileBottomNav zaten render ediliyor — duplicate önle
  if (pathname === '/') {
    return null;
  }

  // Auth sayfalarında da mobil nav'ı gizle
  if (pathname.startsWith('/auth/')) {
    return null;
  }

  // Admin sayfalarında da mobil nav'ı gizle (admin kendi layout'unu kullanır)
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return <MobileNav />;
}
