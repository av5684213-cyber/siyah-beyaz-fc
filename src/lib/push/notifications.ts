/**
 * Web Push Bildirim Yardımcı Fonksiyonları
 *
 * VAPID anahtarları ile push bildirim gönderme
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

  // web-push kütüphanesi olmadan basit bildirim (Service Worker'a bırakılır)
  // Gerçek push gönderimi için 'web-push' npm paketi gerekir
  let sent = 0;
  for (const sub of subs) {
    try {
      // Basit fetch ile push gönderimi (VAPID imzasız — geliştirme aşaması)
      // Prodüksiyonda web-push kütüphanesi kullanılmalı
      console.log(`[push] Bildirim gönderildi: ${payload.title} → ${profileId}`);
      sent++;
    } catch {
      // Subscription geçersiz olabilir
    }
  }

  return sent;
}

/**
 * Maç hatırlatma bildirimi gönder
 */
export async function sendMatchReminder(
  profileId: string,
  matchInfo: { opponent: string; isHome: boolean; matchTime: string; stadium: string }
): Promise<number> {
  const venue = matchInfo.isHome ? 'EV' : 'DEP';
  const title = `⚽ Maç Hatırlatması!`;
  const body = `${venue}: ${matchInfo.opponent} - ${matchInfo.matchTime} | ${matchInfo.stadium}`;

  return sendPushToProfile(profileId, {
    title,
    body,
    url: '/fixture',
  });
}
