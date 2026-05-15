/**
 * Cron Job: Günlük Form Rating Güncelleme (ADIM 1B)
 *
 * Her gün tüm oyuncuların form_rating değerini hesaplar ve günceller.
 * Vercel Cron ile günlük 03:00'da çalışacak şekilde zamanlanır.
 *
 * GET /api/cron/update-form-ratings
 * Header: x-cron-secret veya Query: ?secret=<CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateAllFormRatings } from '@/lib/fm/formRatingService';

export const maxDuration = 300; // 5 dakika (Vercel limiti)

export async function GET(request: NextRequest) {
  // Cron secret doğrulama
  const cronSecret = request.headers.get('x-cron-secret') || request.nextUrl.searchParams.get('secret');
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[cron/update-form-ratings] Starting daily form rating update...');

    const result = await updateAllFormRatings();

    console.log(`[cron/update-form-ratings] Completed: ${result.updated} players updated, ${result.errors.length} errors`);

    return NextResponse.json({
      success: true,
      updated: result.updated,
      errors: result.errors.length > 0 ? result.errors.slice(0, 10) : undefined, // İlk 10 hatayı dön
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[cron/update-form-ratings] Fatal error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: String(err) },
      { status: 500 }
    );
  }
}
