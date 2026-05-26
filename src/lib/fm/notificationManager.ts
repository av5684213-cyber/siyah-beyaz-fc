// =============================================================================
// Managerium — Bildirim Yönetim Sistemi
// =============================================================================
// Maç sırasındaki kritik olayları (gol, kırmızı kart, sakatlık, maç sonu)
// kullanıcıya push notification ve oyun içi bildirim olarak gönderir.
// =============================================================================

import type { Player } from './types';

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

// ─── Oyun İçi Bildirim Kaydetme (Supabase) ──────────────────────────────────
export async function saveInGameNotification(
  profileId: string,
  event: MatchEventNotification,
  supabase: any
): Promise<boolean> {
  const { title, body } = createNotificationContent(event);
  const priority = EVENT_PRIORITY[event.eventType];

  try {
    // notifications tablosu varsa yaz, yoksa sessizce atla
    const { error } = await supabase.from('notifications').insert({
      profile_id: profileId,
      title,
      body,
      url: event.fixtureId ? `/match/${event.fixtureId}` : null,
      tag: `match-${event.fixtureId}-${event.eventType}-${event.minute}`,
      type: event.eventType,
    });

    if (error) {
      // Tablo yoksa sessizce devam et
      console.warn('[notificationManager] Could not save notification:', error.message);
      return false;
    }
    return true;
  } catch {
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

  try {
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
