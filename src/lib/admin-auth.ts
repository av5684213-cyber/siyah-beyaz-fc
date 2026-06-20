import { NextRequest } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

const ADMIN_EMAIL = 'selimporsuk@gmail.com';

/**
 * Admin doğrulaması — SADECE x-admin-user-id header'ını kabul eder,
 * bu ID'nin DB'deki gerçek rolünü kontrol eder. x-admin-email header'ı
 * ASLA güvenilir kimlik kanıtı olarak kullanılmaz (spoofable).
 *
 * [BUG-25 GÜVENLİK] Önceki kod x-admin-email header'ına güveniyordu —
 * saldırgan bu header'ı sahte değerle gönderip tam admin yetkisi kazanabiliyordu.
 * Artık sadece x-admin-user-id → DB'de role/email kontrolü yapılır.
 */
export async function verifyAdminRequest(request: NextRequest): Promise<{
  isAdmin: boolean;
  adminId: string | null;
}> {
  const adminUserId = request.headers.get('x-admin-user-id');
  if (!adminUserId) return { isAdmin: false, adminId: null };

  const supabase = getServiceSupabase();
  if (!supabase) return { isAdmin: false, adminId: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', adminUserId)
    .maybeSingle();

  const isAdmin = profile?.role === 'admin'
    || profile?.email?.toLowerCase() === ADMIN_EMAIL;

  return { isAdmin, adminId: isAdmin ? adminUserId : null };
}
