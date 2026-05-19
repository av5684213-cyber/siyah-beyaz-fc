/**
 * GET /api/cron/bot-transfers
 * Haftada bir (Pazartesi 10:00) çalışacak cron endpoint
 * Bot takımlar için otomatik transfer AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { runBotTransfers } from '@/lib/fm/botActions';

export async function GET(request: NextRequest) {
  // Cron secret doğrulama
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const result = await runBotTransfers();

    return NextResponse.json({
      success: true,
      listed: result.listed,
      bought: result.bought,
      details: result.details,
    });
  } catch (err) {
    console.error('[bot-transfers] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
