// ─── Web Push Bildirim Yardımcısı ──────────────────────────────────────
// Service Worker kaydı, izin isteme, token kaydetme

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

/**
 * Push bildirim iznini iste
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[notifications] Tarayıcı bildirimleri desteklemiyor');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    console.warn('[notifications] Bildirim izni reddedildi');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Service Worker'ı kaydet
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[notifications] Service Worker desteklenmiyor');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('[notifications] Service Worker kaydedildi:', registration.scope);
    return registration;
  } catch (error) {
    console.error('[notifications] Service Worker kayıt hatası:', error);
    return null;
  }
}

/**
 * Push bildirim token'ı Supabase'e kaydet
 */
export async function savePushToken(
  supabaseUrl: string,
  supabaseKey: string,
  profileId: string,
  token: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/push_tokens`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        profile_id: profileId,
        token: token,
        platform: 'web',
        updated_at: new Date().toISOString(),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[notifications] Token kaydetme hatası:', error);
    return false;
  }
}

/**
 * Yerel bildirim gönder (Service Worker üzerinden)
 */
export async function sendLocalNotification(payload: NotificationPayload): Promise<void> {
  if (typeof window === 'undefined') return;

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-72x72.png',
      tag: payload.tag || 'default',
      data: {
        url: payload.url || '/',
      },
    });
  } catch (error) {
    console.error('[notifications] Bildirim gönderme hatası:', error);
  }
}

/**
 * Bildirim tıklanınca URL yönlendirmesi
 */
export function setupNotificationClickListener(): void {
  if (typeof window === 'undefined') return;

  navigator.serviceWorker?.addEventListener('message', (event) => {
    const data = event.data;
    if (data?.type === 'NOTIFICATION_CLICK' && data?.url) {
      window.location.href = data.url;
    }
  });
}

// ─── Bildirim Senaryoları ────────────────────────────────────────────

export const NOTIFICATION_TYPES = {
  MATCH_START: 'match_start',
  TRANSFER_OFFER: 'transfer_offer',
  TRANSFER_REJECTED: 'transfer_rejected',
  TRAINING_COMPLETE: 'training_complete',
  SEASON_AWARDS: 'season_awards',
  ACADEMY_UPGRADE: 'academy_upgrade',
  INJURY: 'injury',
  CARD_SUSPENSION: 'card_suspension',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_MESSAGES: Record<NotificationType, (data: Record<string, string>) => NotificationPayload> = {
  [NOTIFICATION_TYPES.MATCH_START]: (data) => ({
    title: '⚽ Maç Başlıyor!',
    body: `${data.home || 'Takımınız'} vs ${data.away || 'Rakip'} - 5 dakika içinde başlayacak`,
    url: '/match',
    tag: 'match-start',
  }),
  [NOTIFICATION_TYPES.TRANSFER_OFFER]: (data) => ({
    title: '📋 Transfer Teklifi!',
    body: `${data.player || 'Oyuncu'} için ${data.amount || '0'} teklif aldınız`,
    url: '/market',
    tag: 'transfer-offer',
  }),
  [NOTIFICATION_TYPES.TRANSFER_REJECTED]: (data) => ({
    title: '❌ Teklif Reddedildi',
    body: `${data.player || 'Oyuncu'} için yaptığınız teklif reddedildi`,
    url: '/market',
    tag: 'transfer-rejected',
  }),
  [NOTIFICATION_TYPES.TRAINING_COMPLETE]: (data) => ({
    title: '🏃 Antrenman Tamamlandı',
    body: `${data.summary || 'Antrenman seansı tamamlandı'}`,
    url: '/training',
    tag: 'training',
  }),
  [NOTIFICATION_TYPES.SEASON_AWARDS]: (data) => ({
    title: '🏆 Sezon Ödülleri!',
    body: `${data.award || 'Sezon sonu ödülleri açıklandı'}`,
    url: '/hall-of-fame',
    tag: 'season-awards',
  }),
  [NOTIFICATION_TYPES.ACADEMY_UPGRADE]: (data) => ({
    title: '🎓 Akademi Yükseltme!',
    body: `Akademi Seviye ${data.level || '?'} yükseltmesi tamamlandı`,
    url: '/academy',
    tag: 'academy',
  }),
  [NOTIFICATION_TYPES.INJURY]: (data) => ({
    title: '🏥 Sakatlık!',
    body: `${data.player || 'Oyuncu'} sakatlandı: ${data.type || 'Bilinmiyor'}`,
    url: '/team',
    tag: 'injury',
  }),
  [NOTIFICATION_TYPES.CARD_SUSPENSION]: (data) => ({
    title: '🟥 Kart Cezası',
    body: `${data.player || 'Oyuncu'} cezalı: ${data.reason || 'Kırmızı kart'}`,
    url: '/team',
    tag: 'card-suspension',
  }),
};
