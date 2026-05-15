import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { processBotTransfers, selectMatchSquad, getAllBotProfiles } from '@/lib/fm/botService';
import { verifyCronSecret, sanitizeError } from '@/lib/fm/security';

export const maxDuration = 300; // 5 minutes max for Vercel

export async function GET(request: NextRequest) {
  // Cron secret doğrulama (fail-closed, header-only)
  const cronCheck = verifyCronSecret(request);
  if (!cronCheck.valid) {
    return NextResponse.json({ error: cronCheck.error }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const results: { botId: string; teamName: string; transfers: any; squad: any }[] = [];
  const errors: string[] = [];

  try {
    const bots = await getAllBotProfiles();
    console.log(`[cron/bot-actions] Processing ${bots.length} bots`);

    for (const bot of bots) {
      try {
        // Process transfers
        const transfers = await processBotTransfers(bot.id);
        
        // Select match squad (if squad exists)
        const squad = await selectMatchSquad(bot.id);

        results.push({
          botId: bot.id,
          teamName: bot.team_name,
          transfers,
          squad: squad ? { formation: squad.formation, startingCount: squad.starting.length, subsCount: squad.subs.length } : null,
        });

        console.log(`[cron/bot-actions] Bot ${bot.team_name}: bought=${transfers.bought}, sold=${transfers.sold}, ${transfers.details.join('; ')}`);
      } catch (err) {
        const errMsg = `Error processing bot ${bot.team_name}: ${err}`;
        errors.push(errMsg);
        console.error(`[cron/bot-actions] ${errMsg}`);
      }
    }

    return NextResponse.json({
      success: true,
      processedBots: bots.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[cron/bot-actions] Fatal error:', err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
