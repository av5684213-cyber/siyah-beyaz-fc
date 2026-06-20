import { useEffect } from 'react';

/**
 * Modal/dialog açıkken body'nin scroll'unu kilitler.
 * iOS Safari'de position:fixed + scroll restore yöntemi kullanır
 * (sadece overflow:hidden iOS'ta yetersiz kalır).
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const originalStyle = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      body.style.position = originalStyle.position;
      body.style.top = originalStyle.top;
      body.style.width = originalStyle.width;
      body.style.overflow = originalStyle.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
