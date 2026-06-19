'use client';

import React from 'react';
import { toast as shadcnToast } from '@/hooks/use-toast';
import { playSound } from '@/utils/sound';

/**
 * ToastNotifications — uygulama içi bildirim bileşeni.
 * Mevcut shadcn/ui toast sistemini kullanarak
 * success/error/info bildirimleri gösterir.
 *
 * NOT: Bu bileşen artık doğrudan render etmez.
 * shadcn/ui Toaster zaten root layout'ta mevcut.
 * Bu dosya sadece toast helper fonksiyonları sağlar.
 */

interface ToastNotificationsProps {
  showTrainingToast?: boolean;
  migrationResult?: { success: boolean; message?: string } | null;
  onDismissMigration?: () => void;
}

export function ToastNotifications({ showTrainingToast, migrationResult, onDismissMigration }: ToastNotificationsProps) {
  // Training toast gösterimi
  React.useEffect(() => {
    if (showTrainingToast) {
      showToast('Antrenman tamamlandı! Oyuncular form kazandı.', 'success');
    }
  }, [showTrainingToast]);

  // Migration sonucu toast
  React.useEffect(() => {
    if (migrationResult) {
      if (migrationResult.success) {
        showToast(migrationResult.message || 'Veri taşıma başarılı!', 'success');
      } else {
        showToast(migrationResult.message || 'Veri taşıma sırasında hata oluştu.', 'error');
      }
      onDismissMigration?.();
    }
  }, [migrationResult, onDismissMigration]);

  return null;
}

/**
 * Uygulama genelinde kullanılabilen toast gösterme fonksiyonu.
 * success = yeşil, error = kırmızı, info = mavi renk.
 *
 * Sayfa arka plandayken (başka sekmedeyken) toast gösterilmez.
 */
export function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success'): void {
  try {
    // ── Sayfa görünür değilse bildirim gösterme ──
    if (typeof document !== 'undefined' && document.hidden) {
      console.log(`[Toast] Sayfa arka planda, bildirim atlandı [${type}]: ${msg}`);
      return;
    }

    const variantMap: Record<string, 'default' | 'destructive'> = {
      success: 'default',
      error: 'destructive',
      info: 'default',
    };

    const titleMap: Record<string, string> = {
      success: '✓ Başarılı',
      error: '✗ Hata',
      info: 'ℹ Bilgi',
    };

    shadcnToast({
      title: titleMap[type] ?? titleMap.info,
      description: msg,
      variant: variantMap[type] ?? 'default',
      className: type === 'success'
        ? 'bg-green-900/90 border-green-500/30 text-green-100'
        : type === 'error'
        ? 'bg-red-900/90 border-red-500/30 text-red-100'
        : 'bg-blue-900/90 border-blue-500/30 text-blue-100',
    });

    // Play sound for error toasts
    if (type === 'error') {
      try { playSound('error'); } catch (e) { console.warn("[silent-catch]", e); }
    }
  } catch (err) {
    console.error('[ToastNotifications] showToast error:', err);
    // Fallback: console
    console.log(`TOAST [${type}]: ${msg}`);
  }
}
