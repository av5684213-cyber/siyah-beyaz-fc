// =============================================================================
// Managerium — Bildirim Yönetim Sistemi
// =============================================================================
// Maç sırasındaki kritik olayları (gol, kırmızı kart, sakatlık, maç sonu)
// kullanıcıya push notification ve oyun içi bildirim olarak gönderir.
// =============================================================================

import type { Player } from './types';

// ─── Üstel Geri Çekilme ile Yeniden Deneme Yardımcı Fonksiyonu ──────────────
/**
 * Üstel geri çekilme ile yeniden deneme yardımcı fonksiyonu.
 * Geçici ağ hatalarında bildirimlerin kaybolmasını önler.
 *
 * @param fn - Denenecek asenkron fonksiyon
 * @param maxRetries - Maksimum deneme sayısı (varsayılan: 3)
 * @param baseDelayMs - İlk deneme arası bekleme süresi (varsayılan: 1000ms)
 * @returns Fonksiyonun sonucu veya hata
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Son denemeyse bekleme, hemen fırlat
      if (attempt === maxRetries) break;

      // Üstel geri çekilme: 1s, 2s, 4s...
      const delay = baseDelayMs * Math.pow(2, attempt);

      // Jitter ekle (çakışmaları önler): ±%25 rastgele sapma
      const jitter = delay * (0.75 + Math.random() * 0.5);

      console.warn(
        `[notificationManager] Deneme ${attempt + 1}/${maxRetries + 1} başarısız, ${Math.round(jitter)}ms sonra tekrar denenecek:`,
        error instanceof Error ? error.message : error
      );

      await new Promise(resolve => setTimeout(resolve, jitter));
    }
  }

  throw lastError;
}

// ─── Bildirim Olay Tipleri ──────────────────────────────────────────────────
export type NotificationEventType =
  | 'goal'
  | 'red_card'
  | 'yellow_card'
  | 'injury'
  | 'penalty'
  | 'var_review'
  | 'match_start'
  | 'match_end'
  | 'halftime'
  | 'morale_warning';

// ─── Bildirim Önceliği ──────────────────────────────────────────────────────
export type NotificationPriority = 'critical' | 'high' | 'normal' | 'low';

const EVENT_PRIORITY: Record<NotificationEventType, NotificationPriority> = {
  goal: 'high',
  red_card: 'critical',
  yellow_card: 'low',
  injury: 'high',
  penalty: 'critical',
  var_review: 'high',
  match_start: 'normal',
  match_end: 'critical',
  halftime: 'normal',
  morale_warning: 'high',
};

// ─── Bildirim Kaydı ─────────────────────────────────────────────────────────
export interface GameNotification {
  id: string;
  profileId: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  type: NotificationEventType;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
}

// ─── Olaydan Bildirim Üretme ────────────────────────────────────────────────
export interface MatchEventNotification {
  eventType: NotificationEventType;
  minute: number;
  playerName?: string;
  teamName?: string;
  isHomeTeam?: boolean;
  homeTeamName: string;
  awayTeamName: string;
  homeScore?: number;
  awayScore?: number;
  fixtureId?: string;
}

/**
 * Maç olayından bildirim metni oluşturur.
 */
export function createNotificationContent(event: MatchEventNotification): {
  title: string;
  body: string;
} {
  const teamLabel = event.isHomeTeam ? event.homeTeamName : event.awayTeamName;

  switch (event.eventType) {
    case 'goal':
      return {
        title: '⚽ GOL!',
        body: `${event.minute}' — ${event.playerName || 'Bilinmeyen'} (${teamLabel}) golü attı! ${event.homeTeamName} ${event.homeScore ?? 0} - ${event.awayScore ?? 0} ${event.awayTeamName}`,
      };
    case 'red_card':
      return {
        title: '🟥 KIRMIZI KART!',
        body: `${event.minute}' — ${event.playerName || 'Bilinmeyen'} (${teamLabel}) kırmızı kart gördü!`,
      };
    case 'injury':
      return {
        title: '🏥 SAKATLIK!',
        body: `${event.minute}' — ${event.playerName || 'Bilinmeyen'} (${teamLabel}) sakatlandı!`,
      };
    case 'penalty':
      return {
        title: '🎯 PENALTI!',
        body: `${event.minute}' — ${teamLabel} penaltı kazandı!`,
      };
    case 'var_review':
      return {
        title: '📺 VAR İNCELEMESİ',
        body: `${event.minute}' — VAR incelemesi başladı!`,
      };
    case 'match_start':
      return {
        title: '🏟️ Maç Başladı!',
        body: `${event.homeTeamName} vs ${event.awayTeamName} maçı başladı!`,
      };
    case 'match_end':
      return {
        title: '🏁 Maç Sona Erdi',
        body: `${event.homeTeamName} ${event.homeScore ?? 0} - ${event.awayScore ?? 0} ${event.awayTeamName}`,
      };
    case 'halftime':
      return {
        title: '⏸️ İlk Yarı Sonu',
        body: `${event.homeTeamName} ${event.homeScore ?? 0} - ${event.awayScore ?? 0} ${event.awayTeamName}`,
      };
    case 'morale_warning':
      return {
        title: '⚠️ Moral Uyarısı',
        body: event.playerName
          ? `${event.playerName} oyuncusunun moralı çok düşük!`
          : 'Soyunma odasında huzursuzluk var!',
      };
    default:
      return {
        title: 'Maç Olayı',
        body: `${event.minute}' — Yeni bir olay gerçekleşti.`,
      };
  }
}

// ─── Bildirim Tercihi Kontrolü (BUG-14) ──────────────────────────────────────
/**
 * Kullanıcının bildirim tercihini kontrol eder.
 * İlgili kategori kapalıysa bildirim gönderilmez.
 */
async function checkNotificationPreference(
  profileId: string,
  eventType: NotificationEventType,
  supabase: any
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('notification_preferences')
      .select('goal_alert, match_result, match_reminder, injury_update')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (!data) return true; // Tercih yoksa gönder (fail-open)

    // Map event types to preference columns
    switch (eventType) {
      case 'goal':
        return data.goal_alert !== false;
      case 'match_end':
      case 'halftime':
        return data.match_result !== false;
      case 'match_start':
        return data.match_reminder !== false;
      case 'injury':
        return data.injury_update !== false;
      // red_card, yellow_card, penalty, var_review, morale_warning
      // are always sent (no specific category toggle)
      default:
        return true;
    }
  } catch {
    // Hata durumunda bildirim gönder (fail-open)
    return true;
  }
}

// ─── Oyun İçi Bildirim Kaydetme (Supabase) ──────────────────────────────────
export async function saveInGameNotification(
  profileId: string,
  event: MatchEventNotification,
  supabase: any
): Promise<boolean> {
  // BUG-14: Check notification preferences before saving
  const shouldSend = await checkNotificationPreference(profileId, event.eventType, supabase);
  if (!shouldSend) {
    console.log(`[notificationManager] Notification skipped for ${event.eventType} (user preference disabled)`);
    return false;
  }

  const { title, body } = createNotificationContent(event);
  const priority = EVENT_PRIORITY[event.eventType];

  try {
    const result = await retryWithBackoff(async () => {
      const { error } = await supabase.from('notifications').insert({
        profile_id: profileId,
        title,
        body,
        url: event.fixtureId ? `/match/${event.fixtureId}` : null,
        tag: `match-${event.fixtureId}-${event.eventType}-${event.minute}`,
        type: event.eventType,
      });

      if (error) {
        // Tablo yoksa retry yapma — doğrudan false dön
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          return false;
        }
        throw error; // Retry için fırlat
      }
      return true;
    }, 2); // Maksimum 2 yeniden deneme (toplam 3 deneme)

    return result;
  } catch {
    console.warn('[notificationManager] Bildirim kaydedilemedi (tüm denemeler başarısız)');
    return false;
  }
}

// ─── Push Notification Gönderme ──────────────────────────────────────────────
/**
 * Web Push API ile push notification gönderir.
 * Kullanıcı push izni vermemişse oyun içi bildirime düşer.
 */
export async function sendPushNotification(
  profileId: string,
  event: MatchEventNotification
): Promise<boolean> {
  // Browser ortamında değilse atla
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  // Kullanıcı izin vermemişse atla
  if (Notification.permission !== 'granted') {
    return false;
  }

  const { title, body } = createNotificationContent(event);
  const priority = EVENT_PRIORITY[event.eventType];

  // Sadece kritik ve yüksek öncelikli bildirimler için retry yap
  const maxRetries = (priority === 'critical' || priority === 'high') ? 2 : 0;

  try {
    return await retryWithBackoff(async () => {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `match-${event.fixtureId}-${event.eventType}-${event.minute}`,
        data: {
          url: event.fixtureId ? `/match/${event.fixtureId}` : '/',
          eventType: event.eventType,
          minute: event.minute,
        },
      });

      notification.onclick = () => {
        window.focus();
        const url = event.fixtureId ? `/match/${event.fixtureId}` : '/';
        window.location.href = url;
        notification.close();
      };

      return true;
    }, maxRetries);
  } catch {
    return false;
  }
}

// ─── Birleşik Bildirim Gönderme ──────────────────────────────────────────────
/**
 * Push + oyun içi bildirimi birlikte gönderir.
 * Push başarısız olursa sadece oyun içi bildirim kalır.
 */
export async function notifyMatchEvent(
  profileId: string,
  event: MatchEventNotification,
  supabase: any
): Promise<void> {
  // Önce oyun içi bildirimi kaydet
  await saveInGameNotification(profileId, event, supabase);

  // Sonra push notification dene
  await sendPushNotification(profileId, event);
}

// ─── Bildirim İzni İste ─────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// ─── Okunmamış Bildirim Sayısı ──────────────────────────────────────────────
export async function getUnreadNotificationCount(
  profileId: string,
  supabase: any
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId)
      .eq('is_read', false);

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

// ─── Bildirimleri Okundu İşaretle ───────────────────────────────────────────
export async function markNotificationsRead(
  profileId: string,
  supabase: any
): Promise<void> {
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('profile_id', profileId)
      .eq('is_read', false);
  } catch {
    // Sessizce devam et
  }
}
