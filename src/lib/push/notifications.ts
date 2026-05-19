/**
 * Web Push Bildirim Yardımcı Fonksiyonları
 *
 * VAPID anahtarları ile push bildirim gönderme
 * auth_key sütun adı kullanılır (master migration şemasına uygun)
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
  const { getSupabase } = await import('@/lib/supabase');
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
  const { getSupabase } = await import('@/lib/supabase');
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
 * web-push kütüphanesi ile gerçek gönderim yapar
 */
export async function sendPushToProfile(
  profileId: string,
  payload: { title: string; body: string; icon?: string; url?: string }
): Promise<number> {
  const { getSupabase } = await import('@/lib/supabase');
  const supabase = getSupabase();
  if (!supabase) return 0;

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth_key')
    .eq('profile_id', profileId);

  if (!subs || subs.length === 0) return 0;

  // web-push kütüphanesini kullan
  let webpush: typeof import('web-push') | null = null;
  try {
    webpush = (await import('web-push')).default;
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@siyahbeyazfc.com';

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    } else {
      console.warn('[push] VAPID keys not configured, skipping real push');
      return 0;
    }
  } catch {
    console.warn('[push] web-push kütüphanesi yüklenemedi, stub modunda');
    return 0;
  }

  let sent = 0;
  for (const sub of subs) {
    try {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth_key || '',
        },
      };

      await webpush.sendNotification(pushSubscription, JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        url: payload.url || '/fixture',
      }));

      sent++;
    } catch (pushErr: unknown) {
      const statusCode = (pushErr as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        // Abonelik geçersiz, sil
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
}

/**
 * Maç hatırlatma bildirimi gönder
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
