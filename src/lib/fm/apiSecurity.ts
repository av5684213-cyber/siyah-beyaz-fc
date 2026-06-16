/**
 * API Güvenlik Yardımcıları
 * 
 * Kritik API endpoint'leri için rate limiting ve profile_id doğrulama.
 * Her endpoint'te tekrarlanan güvenlik kontrollerini merkezi hale getirir.
 */

import { checkUserRateLimit, ACTION_RATE_LIMITS } from './supabaseRateLimit';
import { createClient } from '@supabase/supabase-js';

// Supabase service role client for server-side verification
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

/**
 * API isteği için rate limit kontrolü yapar.
 * Rate limit aşıldığında uygun HTTP yanıtını döndürür.
 * 
 * @param userId — Kullanıcı ID'si
 * @param action — Aksiyon adı (ör: 'player_buy', 'transfer_list')
 * @returns null (izin verildi) veya Response objesi (rate limit aşıldı)
 */
export async function checkApiRateLimit(
  userId: string,
  action: string
): Promise<Response | null> {
  try {
    const limits = ACTION_RATE_LIMITS[action] || { maxRequests: 10, windowMs: 60000 };
    const result = await checkUserRateLimit(userId, action, limits.maxRequests, limits.windowMs);
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit aşıldı',
          retryAfter: Math.ceil(result.resetIn / 1000),
          remaining: 0,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
            'Retry-After': Math.ceil(result.resetIn / 1000).toString(),
          },
        }
      );
    }
    
    return null; // Rate limit geçildi
  } catch (err) {
    // Rate limit hatası — isteği engelleme (graceful)
    console.warn('[apiSecurity] Rate limit check failed, allowing request:', err);
    return null;
  }
}

/**
 * Verilen profile_id'nin gerçekten var olduğunu doğrular.
 * Supabase service_role key kullanarak profiles tablosundan kontrol eder.
 * 
 * @param profileId — Doğrulanacak profile ID
 * @returns Profile verisi veya null
 */
export async function verifyProfile(
  profileId: string
): Promise<{ id: string; team_name: string; is_bot: boolean } | null> {
  try {
    const supabase = getServiceClient();
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, team_name, is_bot')
      .eq('id', profileId)
      .maybeSingle();
    
    if (error || !data) return null;
    return data as { id: string; team_name: string; is_bot: boolean };
  } catch {
    return null;
  }
}

/**
 * Oyuncunun gerçekten belirtilen profile'a ait olduğunu doğrular.
 * Başkasının oyuncusunu satmasını veya transfer etmesini önler.
 * 
 * @param playerId — Oyuncu ID
 * @param profileId — İddia edilen sahip profile ID
 * @returns Oyuncu verisi veya null (yetkisiz)
 */
export async function verifyPlayerOwnership(
  playerId: string,
  profileId: string
): Promise<{ id: string; name: string; profile_id: string } | null> {
  try {
    const supabase = getServiceClient();
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('players')
      .select('id, name, profile_id')
      .eq('id', playerId)
      .maybeSingle();
    
    if (error || !data) return null;
    if (data.profile_id !== profileId) return null; // Başkasının oyuncusu
    return data as { id: string; name: string; profile_id: string };
  } catch {
    return null;
  }
}

/**
 * Cron secret doğrulaması.
 * Vercel cron job'ları için CRON_SECRET header kontrolü.
 * 
 * @param request — Incoming request
 * @returns true if authorized, false otherwise
 */
export function verifyCronSecret(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // CRON_SECRET ayarlanmamışsa uyar ama engelleme (geçiş dönemi)
    console.warn('[apiSecurity] CRON_SECRET not configured — cron auth skipped');
    return true;
  }
  
  const authHeader = request.headers.get('Authorization');
  const providedSecret = authHeader?.replace('Bearer ', '');
  
  return providedSecret === cronSecret;
}
