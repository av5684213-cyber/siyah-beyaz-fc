'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * usePageVisibility — Sayfa görünür mü diye izler.
 *
 * Kullanıcı başka bir tarayıcı sekmesine geçtiğinde veya uygulamayı
 * arka plana aldığında `isPageVisible = false` olur.
 * Bu durumda bildirim (toast, banner, kırmızı şerit) gösterilmemelidir.
 */
export function usePageVisibility(): boolean {
  const [isPageVisible, setIsPageVisible] = useState<boolean>(true);

  const handleVisibilityChange = useCallback(() => {
    setIsPageVisible(!document.hidden);
  }, []);

  useEffect(() => {
    // İlk yüklemede mevcut durumu ayarla
    setIsPageVisible(!document.hidden);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return isPageVisible;
}
