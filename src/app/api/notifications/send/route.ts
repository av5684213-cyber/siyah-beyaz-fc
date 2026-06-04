/**
 * API Route: POST /api/notifications/send
 * Push bildirim aboneliğini kaydet/sil
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { action, profileId: bodyProfileId, subscription } = body;
    const profileId = getAuthenticatedUserId(request, bodyProfileId);

    if (!profileId) {
      return NextResponse.json({ error: 'profileId zorunlu' }, { status: 400 });
    }

    if (action === 'subscribe' && subscription) {
      // Aboneliği kaydet
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          profile_id: profileId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys?.p256dh,
          auth_key: subscription.keys?.auth,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'profile_id,endpoint' });

      if (error) {
        console.error('[notifications/send] Subscribe error:', error.message);
        return NextResponse.json({ error: 'Abonelik kaydedilemedi' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Push bildirim aboneliği kaydedildi' });
    }

    if (action === 'unsubscribe' && subscription?.endpoint) {
      // Aboneliği sil
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('profile_id', profileId)
        .eq('endpoint', subscription.endpoint);

      if (error) {
        console.error('[notifications/send] Unsubscribe error:', error.message);
        return NextResponse.json({ error: 'Abonelik silinemedi' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Push bildirim aboneliği kaldırıldı' });
    }

    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/notifications/send', method: 'POST' });
  }
}
