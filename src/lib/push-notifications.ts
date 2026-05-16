/**
 * Web Push Bildirim Yardımcısı
 *
 * Kullanıcıdan izin isteme, abonelik kaydetme, ve bildirim gönderme.
 */

import { getSupabase } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════
// VAPID Public Key (.env'den alınacak)
// ═══════════════════════════════════════════════════════════════

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

/**
 * VAPID key'i Uint8Array'e çevirir (Application Server Key formatı)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ═══════════════════════════════════════════════════════════════
// Service Worker Kaydı
// ═══════════════════════════════════════════════════════════════

/**
 * Service Worker'ı kaydeder.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  try {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('[Push] Service Worker desteklenmiyor.');
      return null;
    }

    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[Push] Service Worker kaydedildi:', registration.scope);
    return registration;
  } catch (err) {
    console.error('[Push] Service Worker kayıt hatası:', err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Push İzni İsteme
// ═══════════════════════════════════════════════════════════════

/**
 * Kullanıcıdan push bildirim izni ister.
 * @returns 'granted' | 'denied' | 'default'
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('[Push] Notification API desteklenmiyor.');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('[Push] İzin durumu:', permission);
    return permission;
  } catch (err) {
    console.error('[Push] İzin hatası:', err);
    return 'denied';
  }
}

// ═══════════════════════════════════════════════════════════════
// Push Aboneliği Oluşturma ve Kaydetme
// ═══════════════════════════════════════════════════════════════

/**
 * Push aboneliği oluşturur ve Supabase'e kaydeder.
 */
export async function subscribeToPush(profileId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!VAPID_PUBLIC_KEY) {
      return { success: false, error: 'VAPID public key yapılandırılmamış.' };
    }

    // İzin al
    const permission = await requestPushPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Bildirim izni reddedildi.' };
    }

    // Service Worker kaydet
    const registration = await registerServiceWorker();
    if (!registration) {
      return { success: false, error: 'Service Worker kaydedilemedi.' };
    }

    // Mevcut aboneliği kontrol et
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Yeni abonelik oluştur
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Supabase'e kaydet
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'Supabase yapılandırılmamış.' };
    }

    const subscriptionJson = subscription.toJSON();
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        profile_id: profileId,
        endpoint: subscriptionJson.endpoint,
        p256dh: subscriptionJson.keys?.p256dh || '',
        auth: subscriptionJson.keys?.auth || '',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id' });

    if (error) {
      console.error('[Push] Supabase kayıt hatası:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Push] Abonelik kaydedildi:', subscriptionJson.endpoint);
    return { success: true };
  } catch (err) {
    console.error('[Push] Subscribe hatası:', err);
    return { success: false, error: String(err) };
  }
}

// ═══════════════════════════════════════════════════════════════
// Push Aboneliğini İptal Etme
// ═══════════════════════════════════════════════════════════════

/**
 * Push aboneliğini iptal eder ve Supabase'den siler.
 */
export async function unsubscribeFromPush(profileId: string): Promise<{ success: boolean }> {
  try {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return { success: false };
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }

    // Supabase'den sil
    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('profile_id', profileId);
    }

    return { success: true };
  } catch (err) {
    console.error('[Push] Unsubscribe hatası:', err);
    return { success: false };
  }
}
