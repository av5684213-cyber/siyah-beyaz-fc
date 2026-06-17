'use client';

import React, { useEffect, useState } from 'react';
import { FootballLoaderScreen } from './FootballLoader';

/**
 * ClientOnly — çocuklarını SADECE client-side'da render eder.
 *
 * SSR sırasında FootballLoaderScreen gösterilir (hiç hook yok).
 * CSR'da useEffect mount=true set eder → children render olur.
 *
 * Bu, React #310 ("Rendered fewer hooks than expected") hatasını
 * KÖKTEN çözer:
 * - SSR'da hiçbir client component render olmaz → hook sayısı = 0
 * - CSR'da tüm component'ler aynı anda mount olur → hook sayısı sabit
 * - SSR/CSR hook uyumsuzluğu imkansız hale gelir
 *
 * layout.tsx seviyesinde tüm Provider'ları + children'ı sarmak için kullanılır.
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <FootballLoaderScreen label="Touchline Manager" />;
  }

  return <>{children}</>;
}
