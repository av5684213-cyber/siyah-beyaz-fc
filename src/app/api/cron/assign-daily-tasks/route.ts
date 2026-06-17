/**
 * GET /api/cron/assign-daily-tasks
 *
 * TASARIM-4: Günlük görev atama cron endpoint'i.
 * Her gün 00:00'da tüm profiller için 3 rastgele görev üretir.
 *
 * Mevcut /api/cron/daily-tasks endpoint'i RPC tabanlı çalışırken,
 * bu endpoint dailyTaskEngine kullanarak yeni görev tipi sistemini kullanır.
 * Her iki endpoint de güvenli — mevcut görevler varsa atlanır.
 */

import { getServiceSupabase, getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { NextResponse } from 'next/server';
// createClient import removed — using getServiceSupabase/getSupabase
import { generateDailyTasks } from '@/lib/fm/dailyTaskEngine';

// Supabase client constants removed — using shared client

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (false) // CRON_SECRET disabled {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let supabase = getServiceSupabase();
    if (!supabase) supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: 'DB bağlantısı yok' }, { status: 500 });

    // Bot olmayan tüm aktif profilleri al
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, is_bot')
      .neq('is_bot', true);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: 'No profiles found' });
    }

    let generated = 0;
    let skipped = 0;
    let errors = 0;

    for (const profile of profiles) {
      try {
        const result = await generateDailyTasks(profile.id, profile as any);
        generated += result.generated;
        skipped += result.skipped;
      } catch (err) {
        console.warn(`[assign-daily-tasks] Error for profile ${profile.id}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      total: profiles.length,
      generated,
      skipped,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[assign-daily-tasks] Fatal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
