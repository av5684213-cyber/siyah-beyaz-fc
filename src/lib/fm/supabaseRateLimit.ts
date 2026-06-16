/**
 * Supabase Destekli Rate Limiter
 *
 * Rate limit durumunu veritabanında saklar, böylece serverless
 * örnekleri ve süreç yeniden başlatmaları arasında çalışır.
 * Supabase kullanılamadığında bellek içi fallback'e geçer.
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface RateLimitEntry {
  key: string;
  count: number;
  reset_time: number;
}

// ─── Bellek İçi Fallback ───────────────────────────────────────────
// Supabase yapılandırılmadığında veya erişilemediğinde kullanılır.

const memoryFallback = new Map<string, RateLimitEntry>();

// Bellek fallback sınırı — aşırı büyümeyi önler
const MEMORY_FALLBACK_MAX_SIZE = 10000;

function addToMemoryFallback(key: string, entry: RateLimitEntry): void {
  if (memoryFallback.size >= MEMORY_FALLBACK_MAX_SIZE) {
    // En eski girişleri temizle (ilk 1000 tanesini sil)
    let count = 0;
    for (const k of memoryFallback.keys()) {
      if (count >= 1000) break;
      memoryFallback.delete(k);
      count++;
    }
  }
  memoryFallback.set(key, entry);
}

function memoryFallbackCheck(
  key: string,
  maxRequests: number,
  windowMs: number,
  now: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const entry = memoryFallback.get(key);
  const resetTime = now + windowMs;

  if (!entry || now > entry.reset_time) {
    addToMemoryFallback(key, { key, count: 1, reset_time: resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.reset_time - now };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.reset_time - now };
}

// ─── Birincil: Supabase Destekli Rate Limiter ────────────────────────

/**
 * `key` ile tanımlanan bir isteğin izin verilen rate içinde olup olmadığını denetle.
 *
 * Önce Supabase'i dener; herhangi bir hata veya eksik yapılandırma durumunda
 * bellek içi depoya zarifçe geri düşer, böylece istek hiçbir zaman bir
 * altyapı sorunu tarafından engellenmez.
 *
 * @param key        Benzersiz tanımlayıcı (örn. `register:1.2.3.4`)
 * @param maxRequests  Pencere içinde izin verilen maksimum istek (varsayılan 10)
 * @param windowMs     Pencere uzunluğu milisaniye cinsinden (varsayılan 60 000)
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now();
  const resetTime = now + windowMs;

  // Hızlı yol: Supabase hiç yapılandırılmamışsa, bellek fallback kullan
  if (!isSupabaseConfigured()) {
    return memoryFallbackCheck(key, maxRequests, windowMs, now);
  }

  try {
    const supabase = getSupabase();
    if (!supabase) {
      return memoryFallbackCheck(key, maxRequests, windowMs, now);
    }

    // Atomik upsert yaklaşımı: Önce mevcut kaydı oku
    const { data, error } = await supabase
      .from('rate_limits')
      .select('count, reset_time')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.warn('[RateLimit] Supabase hatası, bellek fallback kullanılıyor:', error.message);
      return memoryFallbackCheck(key, maxRequests, windowMs, now);
    }

    // Yeni pencere veya süresi dolmuş kayıt — taze upsert
    if (!data || now > data.reset_time) {
      await supabase
        .from('rate_limits')
        .upsert({ key, count: 1, reset_time: resetTime }, { onConflict: 'key' });
      return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
    }

    // Rate limit aşıldı
    if (data.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetIn: data.reset_time - now };
    }

    // Sınır içinde — atomik artırma (RPC ile çözüm ideal ama şu an upsert kullanıyoruz)
    // Race condition riskini azaltmak için: mevcut count'tan bağımsız +1 yap
    // UPDATE ... SET count = count + 1 WHERE key = ... (daha güvenli)
    const { error: updateError } = await supabase
      .from('rate_limits')
      .update({ count: data.count + 1 })
      .eq('key', key)
      .eq('count', data.count); // Optimistic lock: sadece count değişmediyse güncelle

    // Optimistic lock başarısız olduysa (başka istek araya girdiyse),
    // izin ver — rate limit biraz gevşek olur ama kilitlenme önlenir
    if (updateError) {
      console.warn('[RateLimit] Optimistic lock başarısız, izin veriliyor');
    }

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - data.count - 1),
      resetIn: data.reset_time - now,
    };
  } catch (err) {
    console.warn('[RateLimit] İstisna, bellek fallback kullanılıyor:', err);
    return memoryFallbackCheck(key, maxRequests, windowMs, now);
  }
}

// ─── Kullanıcı Bazlı Rate Limit ──────────────────────────────────────

/**
 * Yaygın API aksiyonları için öntanımlı rate limit yapılandırması.
 * checkUserRateLimit içinde action parametresiyle eşleştirilir.
 */
export const ACTION_RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  'player_buy': { maxRequests: 5, windowMs: 60000 },        // 5/min
  'transfer_list': { maxRequests: 10, windowMs: 60000 },    // 10/min
  'team_create': { maxRequests: 1, windowMs: 3600000 },     // 1/hour
  'staff_hire': { maxRequests: 5, windowMs: 60000 },        // 5/min
  'scout_search': { maxRequests: 20, windowMs: 60000 },     // 20/min
  'notification_send': { maxRequests: 30, windowMs: 60000 }, // 30/min
};

/**
 * Kullanıcı bazlı API endpoint rate limiting.
 * userId ve action'ı birleştirerek benzersiz bir anahtar oluşturur.
 * ACTION_RATE_LIMITS'de tanımlı aksiyonlar için öntanımlı limitleri kullanır,
 * belirtilirse maxRequests/windowMs parametreleriyle override edebilir.
 *
 * Supabase kullanılamadığında mevcut bellek içi fallback mekanizmasına düşer.
 *
 * @param userId      Kullanıcı ID'si
 * @param action      Aksiyon adı (ör: 'player_buy', 'team_create')
 * @param maxRequests Pencere içinde izin verilen maksimum istek (ACTION_RATE_LIMITS'ten veya varsayılan 10)
 * @param windowMs    Pencere uzunluğu milisaniye cinsinden (ACTION_RATE_LIMITS'ten veya varsayılan 60000)
 * @returns İzin durumu, kalan hak ve sıfırlama süresi
 */
export async function checkUserRateLimit(
  userId: string,
  action: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  // ACTION_RATE_LIMITS'ten öntanımlı değerleri al, parametre olarak verilmişse onları kullan
  const actionConfig = ACTION_RATE_LIMITS[action];
  const effectiveMaxRequests = actionConfig?.maxRequests ?? maxRequests;
  const effectiveWindowMs = actionConfig?.windowMs ?? windowMs;

  // rate_limits tablosunda userId:action formatında anahtarla kontrol et
  const key = `user:${userId}:${action}`;
  return checkRateLimit(key, effectiveMaxRequests, effectiveWindowMs);
}

// ─── Temizlik ──────────────────────────────────────────────────────

/**
 * Süresi dolmuş rate limit satırlarını Supabase ve bellek içi fallback'ten kaldır.
 * Düzenli olarak çağrılmak üzere tasarlanmıştır (örn. setInterval veya cron job ile).
 */
export async function cleanupRateLimits(): Promise<void> {
  const now = Date.now();

  // Supabase'i temizle
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('rate_limits').delete().lt('reset_time', now);
      }
    } catch {
      // Sessiz — temizlik en iyi çabadır
    }
  }

  // Bellek fallback'i temizle
  for (const [key, entry] of memoryFallback.entries()) {
    if (now > entry.reset_time) {
      memoryFallback.delete(key);
    }
  }
}
