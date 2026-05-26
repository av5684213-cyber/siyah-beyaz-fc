/**
 * Cron Job: Haftalık Fans Dalgalanması
 *
 * Her hafta bir kez çalışır. Takım performansına göre
 * hayran sayısında doğal artış/azalış simüle eder.
 *
 * - İlk 3 sırada olan takımlar hayran kazanır
 * - Alt 3 sırada olan takımlar hayran kaybeder
 * - Orta sıralardaki takımlar küçük rastgele değişimler yaşar
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { processWeeklyFansFluctuation } from '@/lib/fm/xpLevelFansService';
import { createErrorResponse } from '@/lib/api-error-handler';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    console.log('[cron/weekly-fans] Starting weekly fans fluctuation...');

    const result = await processWeeklyFansFluctuation();

    return NextResponse.json({
      action: 'weekly_fans_fluctuation',
      processed: result.processed,
      errors: result.errors.length > 0 ? result.errors.slice(0, 5) : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/weekly-fans', method: 'GET' });
  }
}
