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
      console.warn('[push] VAPID key not configured');
      return { success: false, error: 'Push bildirimleri bu sunucu yapılandırmasında desteklenmiyor. Lütfen yöneticiyle iletişime geçin.' };
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
  goal_alert: boolean;
  match_result: boolean;
  daily_task_reminder: boolean;
  weekly_report: boolean;
  injury_update: boolean;
  youth_academy: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  match_reminder: true,
  transfer_offer: true,
  training_report: true,
  push_enabled: false,
  goal_alert: true,
  match_result: true,
  daily_task_reminder: true,
  weekly_report: true,
  injury_update: true,
  youth_academy: true,
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
      goal_alert: data.goal_alert ?? true,
      match_result: data.match_result ?? true,
      daily_task_reminder: data.daily_task_reminder ?? true,
      weekly_report: data.weekly_report ?? true,
      injury_update: data.injury_update ?? true,
      youth_academy: data.youth_academy ?? true,
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
        goal_alert: prefs.goal_alert,
        match_result: prefs.match_result,
        daily_task_reminder: prefs.daily_task_reminder,
        weekly_report: prefs.weekly_report,
        injury_update: prefs.injury_update,
        youth_academy: prefs.youth_academy,
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

// ═══════════════════════════════════════════════════════════════
// Sunucu Tarafı Push Bildirim Fonksiyonları
// (push/notifications.ts'ten birleştirildi)
// ═══════════════════════════════════════════════════════════════

/**
 * Push abonelik verisi arayüzü
 */
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * VAPID genel anahtarı (istemci tarafında kullanılır)
 */
export function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
}

/**
 * VAPID özel anahtarı (sunucu tarafında kullanılır)
 */
export function getVapidPrivateKey(): string {
  return process.env.VAPID_PRIVATE_KEY || '';
}

/**
 * Push bildirim kaydını veritabanına kaydet
 */
export async function saveSubscription(
  profileId: string,
  subscription: PushSubscription
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      profile_id: profileId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth_key: subscription.keys.auth,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'profile_id,endpoint' });

  return !error;
}

/**
 * Push bildirim kaydını sil
 */
export async function removeSubscription(
  profileId: string,
  endpoint: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('profile_id', profileId)
    .eq('endpoint', endpoint);

  return !error;
}

/**
 * Belirli bir profile push bildirim gönder
 *
 * ⚠️ ÖNEMLİ: Bu fonksiyon SADECE sunucu tarafında (API route'ları, server actions)
 * çalıştırılabilir. İstemci (client) tarafında çağrılırsa hiçbir şey yapmaz.
 * web-push kütüphanesi dinamik import ile yüklendiğinden, client bundle'a
 * dahil edilmez ve VAPID özel anahtarı yalnızca sunucuda mevcuttur.
 *
 * Kullanım: API route dosyalarında (ör. src/app/api/push/route.ts)
 *   import { sendPushToProfile } from '@/lib/push-notifications';
 *   await sendPushToProfile(profileId, { title, body, type: 'match_reminder' });
 */
export async function sendPushToProfile(
  profileId: string,
  payload: { title: string; body: string; icon?: string; url?: string; tag?: string; type?: string }
): Promise<number> {
  // Sunucu tarafı kontrolü — istemcide çalıştırılmamalıdır
  if (typeof window !== 'undefined') {
    console.warn('[push] sendPushToProfile sadece sunucu tarafında çalışabilir — istemci çağrısı atlandı');
    return 0;
  }

  // ── Bildirim tercihi kontrolü (BUG-14: granular category checks) ──
  try {
    const prefs = await loadNotificationPreferences(profileId);
    if (prefs) {
      // Eğer kullanıcı belirli bir bildirim türünü kapatmışsa gönderme
      const notifType = payload.type || 'general';

      // BUG-14: Category-based preference checks
      // Goal alerts
      if (prefs.goal_alert === false && (notifType === 'goal' || notifType === 'goal_alert' || notifType === 'match_goal')) return 0;
      // Match results
      if (prefs.match_result === false && (notifType === 'match_end' || notifType === 'match_result' || notifType === 'season_award')) return 0;
      // Match reminders (legacy + new)
      if (prefs.match_reminder === false && (notifType === 'match_reminder' || notifType === 'match_start' || notifType === 'match_event')) return 0;
      // Transfer offers
      if (prefs.transfer_offer === false && (notifType === 'transfer' || notifType === 'transfer_offer')) return 0;
      // Training reports
      if (prefs.training_report === false && (notifType === 'training' || notifType === 'training_report')) return 0;
      // Daily task reminders
      if (prefs.daily_task_reminder === false && (notifType === 'daily_task' || notifType === 'daily_task_reminder')) return 0;
      // Weekly reports
      if (prefs.weekly_report === false && (notifType === 'weekly_report' || notifType === 'weekly_summary')) return 0;
      // Injury updates
      if (prefs.injury_update === false && (notifType === 'injury' || notifType === 'injury_update' || notifType === 'injury_recovery')) return 0;
      // Youth academy
      if (prefs.youth_academy === false && (notifType === 'youth_academy' || notifType === 'youth_intake' || notifType === 'youth_graduation')) return 0;
    }
  } catch (prefErr) {
    // Tercih okunamazsa bildirim gönder (fail-open)
    console.warn('[push-notifications] Preference check failed, sending anyway:', prefErr);
  }

  const supabase = getSupabase();
  if (!supabase) return 0;

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth_key')
    .eq('profile_id', profileId);

  if (!subs || subs.length === 0) return 0;

  // web-push kütüphanesini server-only dinamik import ile kullan
  try {
    const webpush = await import('web-push');
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@touchlinemanager.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('[push] VAPID keys not configured, skipping real push');
      return 0;
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    let sent = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth_key || '' },
        }, JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/favicon.ico',
          url: payload.url || '/fixture',
        }));
        sent++;
      } catch (pushErr: unknown) {
        const statusCode = (pushErr as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
            .eq('profile_id', profileId);
        }
        console.error('[push] Gönderim hatası:', pushErr);
      }
    }
    return sent;
  } catch {
    console.warn('[push] web-push kütüphanesi yüklenemedi, stub modunda');
    return 0;
  }
}

/**
 * Maç hatırlatma bildirimi gönder (server-only)
 */
export async function sendMatchReminder(
  profileId: string,
  matchInfo: { opponent: string; isHome: boolean; matchTime: string; stadium: string; matchId?: string }
): Promise<number> {
  const venue = matchInfo.isHome ? 'EV' : 'DEP';
  const title = '⚽ Maç Hatırlatması!';
  const body = `${venue}: ${matchInfo.opponent} - ${matchInfo.matchTime} | ${matchInfo.stadium}`;

  return sendPushToProfile(profileId, {
    title,
    body,
    url: matchInfo.matchId ? `/match/${matchInfo.matchId}` : '/fixture',
  });
}
