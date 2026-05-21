/**
 * Web Push Bildirim Yardımcısı
 *
 * Kullanıcıdan izin isteme, abonelik kaydetme, ve bildirim gönderme.
 * Sütun adı tutarlılığı: push_subscriptions tablosunda "auth_key" kullanılır
 * (supabase-migration.sql master şemasına uygun).
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
// Mevcut İzin Durumunu Kontrol Etme
// ═══════════════════════════════════════════════════════════════

/**
 * Tarayıcı bildirim izni durumunu döndürür.
 */
export function getNotificationPermissionStatus(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Kullanıcının push aboneliği olup olmadığını Supabase'den kontrol eder.
 */
export async function hasPushSubscription(profileId: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) {
      console.error('[Push] Abonelik kontrol hatası:', error.message);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error('[Push] Abonelik kontrol hatası:', err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// Push Aboneliği Oluşturma ve Kaydetme
// ═══════════════════════════════════════════════════════════════

/**
 * Push aboneliği oluşturur ve Supabase'e kaydeder.
 * Sütun adı: auth_key (master migration şemasına uygun)
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

    // Supabase'e kaydet (auth_key sütun adı kullanılır)
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
        auth_key: subscriptionJson.keys?.auth || '',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id,endpoint' });

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

// ═══════════════════════════════════════════════════════════════
// Bildirim Tercihleri
// ═══════════════════════════════════════════════════════════════

export interface NotificationPreferences {
  match_reminder: boolean;
  transfer_offer: boolean;
  training_report: boolean;
  push_enabled: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  match_reminder: true,
  transfer_offer: true,
  training_report: true,
  push_enabled: false,
};

/**
 * Kullanıcının bildirim tercihlerini Supabase'den oku
 */
export async function loadNotificationPreferences(profileId: string): Promise<NotificationPreferences> {
  try {
    const supabase = getSupabase();
    if (!supabase) return DEFAULT_NOTIFICATION_PREFERENCES;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }

    return {
      match_reminder: data.match_reminder ?? true,
      transfer_offer: data.transfer_offer ?? true,
      training_report: data.training_report ?? true,
      push_enabled: data.push_enabled ?? false,
    };
  } catch (err) {
    console.error('[Push] Tercih yükleme hatası:', err);
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

/**
 * Kullanıcının bildirim tercihlerini Supabase'e kaydet
 */
export async function saveNotificationPreferences(
  profileId: string,
  prefs: NotificationPreferences
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase yapılandırılmamış.' };

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        profile_id: profileId,
        match_reminder: prefs.match_reminder,
        transfer_offer: prefs.transfer_offer,
        training_report: prefs.training_report,
        push_enabled: prefs.push_enabled,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id' });

    if (error) {
      console.error('[Push] Tercih kaydetme hatası:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[Push] Tercih kaydetme hatası:', err);
    return { success: false, error: String(err) };
  }
}
