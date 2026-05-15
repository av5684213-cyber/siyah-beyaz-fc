/**
 * Cron Job: Günlük Bakım (ADIM 1B + ADIM 2)
 *
 * Her gün:
 * - Tüm oyuncuların form_rating değerini hesaplar ve günceller
 * - Süresi dolan cezaları ve sakatlıkları temizler
 *
 * Vercel Cron ile günlük 03:00'da çalışacak şekilde zamanlanır.
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateAllFormRatings } from '@/lib/fm/formRatingService';
import { cleanupExpiredSuspensionsAndInjuries } from '@/lib/fm/matchConsequencesService';

export const maxDuration = 300; // 5 dakika (Vercel limiti)

export async function GET(request: NextRequest) {
  // Cron secret doğrulama
  const cronSecret = request.headers.get('x-cron-secret') || request.nextUrl.searchParams.get('secret');
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[cron/update-form-ratings] Starting daily maintenance...');

    // 1. Form rating güncelle
    const formResult = await updateAllFormRatings();
    console.log(`[cron/update-form-ratings] Form ratings: ${formResult.updated} updated, ${formResult.errors.length} errors`);

    // 2. Süresi dolan ceza ve sakatlıkları temizle (ADIM 2)
    const cleanupResult = await cleanupExpiredSuspensionsAndInjuries();
    console.log(`[cron/update-form-ratings] Cleanup: ${cleanupResult.unsuspended} unsuspended, ${cleanupResult.healed} healed`);

    return NextResponse.json({
      success: true,
      formRatingsUpdated: formResult.updated,
      unsuspended: cleanupResult.unsuspended,
      healed: cleanupResult.healed,
      errors: [
        ...formResult.errors.slice(0, 5),
        ...cleanupResult.errors.slice(0, 5),
      ].length > 0 ? [
        ...formResult.errors.slice(0, 5),
        ...cleanupResult.errors.slice(0, 5),
      ] : undefined,
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
