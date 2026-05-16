/**
 * Cron Job: Bot Transfer Döngüsü
 *
 * Haftada bir Pazartesi 10:00'da çalışır.
 * Tüm bot takımlar için transfer işlemlerini gerçekleştirir:
 *   - En düşük OVR'li oyuncuyu satışa çıkar (mevkide 3+ oyuncu varsa)
 *   - Eksik mevkiye uygun en ucuz oyuncuyu satın al (bütçe yeterliyse)
 *
 * GET /api/cron/bot-transfers
 * Header: x-cron-secret veya Query: ?secret=<CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { runBotTransferCycle } from '@/lib/fm/botService';
import { verifyCronSecret, sanitizeError } from '@/lib/fm/security';

export const maxDuration = 300; // 5 dakika (Vercel limiti)

export async function GET(request: NextRequest) {
  // Cron secret doğrulama
  const cronCheck = verifyCronSecret(request);
  if (!cronCheck.valid) {
    return NextResponse.json({ error: cronCheck.error }, { status: 401 });
  }

  try {
    console.log('[cron/bot-transfers] Starting bot transfer cycle...');

    const result = await runBotTransferCycle();

    console.log(
      `[cron/bot-transfers] Completed: ${result.totalBots} bots processed, ` +
      `${result.results.filter(r => r.bought).length} bought, ` +
      `${result.results.filter(r => r.sold).length} sold`
    );

    return NextResponse.json({
      success: true,
      totalBots: result.totalBots,
      boughtCount: result.results.filter(r => r.bought).length,
      soldCount: result.results.filter(r => r.sold).length,
      results: result.results.slice(0, 20), // İlk 20 sonucu döndür (limitli)
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[cron/bot-transfers] Fatal error:', err);
    return NextResponse.json(
      { error: sanitizeError(err) },
      { status: 500 }
    );
  }
}
