/**
 * GET /api/cron/auction-cleanup
 * Süresi dolan açık artırmaları çözümler.
 *
 * BUG-2: Artık rpc_expire_auctions() RPC fonksiyonunu kullanır.
 * Tüm işlemler veritabanında atomik olarak gerçekleştirilir.
 *
 * Cron job tarafından tetiklenir (her saat önerilir).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';
import { acquireCronLock, releaseCronLock } from '@/lib/fm/cronLockService';

export const maxDuration = 60;

const JOB_NAME = 'auction-cleanup';

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (false) { // CRON_SECRET disabled
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client could not be created' }, { status: 500 });
  }

  // ── Cron lock: aynı anda sadece bir instance çalışsın ──
  const lock = await acquireCronLock(supabase, JOB_NAME, 300); // 5 dk TTL
  if (!lock) {
    return NextResponse.json({ message: 'Another instance is already running', skipped: true });
  }

  try {
    // ── RPC ile süresi dolan müzayedeleri çözümle ──
    // Tüm işlem veritabanında atomik: ilan kapatma, transfer, ödeme
    const { data: rpcResult, error: rpcError } = await supabase.rpc('rpc_expire_auctions');

    if (rpcError) {
      console.error('[cron/auction-cleanup] RPC error:', rpcError.message);
      return NextResponse.json({ error: 'RPC call failed', details: rpcError.message }, { status: 500 });
    }

    const expiredAuctions = rpcResult?.expired_auctions || 0;

    console.log(`[cron/auction-cleanup] Complete: ${expiredAuctions} expired auctions processed`);

    return NextResponse.json({
      success: true,
      expired_auctions: expiredAuctions,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/auction-cleanup', method: 'GET' });
  } finally {
    // ── Cron lock'u serbest bırak ──
    await releaseCronLock(supabase, JOB_NAME, lock);
  }
}
