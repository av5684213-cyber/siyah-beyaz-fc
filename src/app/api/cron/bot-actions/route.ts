import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { processBotTransfers, selectMatchSquad, getAllBotProfiles, makePreMatchTacticalDecision } from '@/lib/fm/botService';
import { createErrorResponse } from '@/lib/api-error-handler';

export const maxDuration = 60; // 5 minutes max for Vercel

// ═══════════════════════════════════════════════════════════════
// KATMAN 1.2: Bot takımlara antrenman kaydı yaz
// Bot'lar antrenman yapmıyor → training_attendances boş →
// weekly-evolution'da trainingBonus = 0 → gelişemiyorlar
// ═══════════════════════════════════════════════════════════════
const BOT_TRAINING_PROGRAMS = ['fiziksel_yukleme', 'teknik_driller', 'savunma_okulu', 'bitiricilik_kampi', 'kondisyon_toparlanma'];

async function recordBotTrainingAttendance(supabase: any, botProfileId: string): Promise<void> {
  try {
    const { data: botPlayers } = await supabase
      .from('players')
      .select('id')
      .eq('profile_id', botProfileId)
      .limit(11);

    if (!botPlayers || botPlayers.length === 0) return;

    const today = new Date().toISOString().split('T')[0];

    // Bugün zaten kayıt var mı kontrol et (idempotent)
    const { data: existingToday } = await supabase
      .from('training_attendances')
      .select('id')
      .eq('profile_id', botProfileId)
      .eq('training_date', today)
      .limit(1);

    if (existingToday && existingToday.length > 0) return; // Zaten bugün kayıt var

    const randomProgram = BOT_TRAINING_PROGRAMS[Math.floor(Math.random() * BOT_TRAINING_PROGRAMS.length)];

    const attendanceRows = botPlayers.map((p: any) => ({
      player_id: p.id,
      profile_id: botProfileId,
      training_date: today,
      training_type: 'morning',
      program_id: randomProgram,
    }));

    await supabase.from('training_attendances').insert(attendanceRows);
    console.log(`[bot-actions] Training attendance recorded for bot ${botProfileId}: ${attendanceRows.length} players (${randomProgram})`);
  } catch (err) {
    console.warn(`[bot-actions] Training attendance failed for bot ${botProfileId}:`, err);
  }
}

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  // SORUN-5 FIX: Maç saatinde bot transfer yapmasın — kadro değişikliği
  // sadece maç dışı saatlerde geçerli olsun. İstanbul saatini kontrol et.
  const istanbulTz = 'Europe/Istanbul';
  const nowInIstanbul = new Date(new Date().toLocaleString('en-US', { timeZone: istanbulTz }));
  const currentHour = nowInIstanbul.getHours();
  const currentMinute = nowInIstanbul.getMinutes();
  const isMatchHour = (currentHour === 12 || currentHour === 18) && currentMinute < 30;
  // Maç saatlerinde (12:00-12:30, 18:00-18:30) transferi atla
  if (isMatchHour) {
    console.log(`[cron/bot-actions] İstanbul ${currentHour}:${String(currentMinute).padStart(2, '0')} — maç saati, transfer atlanıyor`);
    // Taktik ve kadro seçimi hala yapılabilir
  }

  const results: { botId: string; teamName: string; transfers: any; preMatchTactic: any; squad: any }[] = [];
  const errors: string[] = [];

  try {
    const bots = await getAllBotProfiles();
    console.log(`[cron/bot-actions] Processing ${bots.length} bots`);

    // Process bots in parallel batches to avoid Vercel timeout
    const BATCH_SIZE = 8;
    for (let i = 0; i < bots.length; i += BATCH_SIZE) {
      const batch = bots.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map(async (bot) => {
          // SORUN-5: Maç saatinde transfer yapma, sadece taktik+kadro
          const transfers = isMatchHour
            ? { bought: false, sold: false, details: ['Maç saati — transfer atlandı'] }
            : await processBotTransfers(bot.id);

          // Pre-match tactical decision based on league position
          let preMatchTactic = null;
          try {
            preMatchTactic = await makePreMatchTacticalDecision(bot.id);
          } catch (tacticErr) {
            console.warn(`[cron/bot-actions] Pre-match tactic failed for ${bot.team_name}:`, tacticErr);
          }

          const squad = await selectMatchSquad(bot.id);

          // KATMAN 1.2: Bot antrenman kaydı — her bot için günlük training_attendances yaz
          const supabase = getSupabase();
          if (supabase) {
            await recordBotTrainingAttendance(supabase, bot.id);
          }

          return {
            botId: bot.id,
            teamName: bot.team_name,
            transfers,
            preMatchTactic: preMatchTactic ? { formation: preMatchTactic.formation, mentality: preMatchTactic.mentality, pressing: preMatchTactic.pressing } : null,
            squad: squad ? { formation: squad.formation, startingCount: squad.starting.length, subsCount: squad.subs.length } : null,
          };
        })
      );

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          const { teamName, transfers, preMatchTactic } = result.value;
          results.push(result.value);
          const tacticInfo = preMatchTactic ? ` | tactic: ${preMatchTactic.formation} M${preMatchTactic.mentality}${preMatchTactic.pressing ? ' P' : ''}` : '';
          console.log(`[cron/bot-actions] Bot ${teamName}: bought=${transfers.bought}, sold=${transfers.sold}, ${transfers.details.join('; ')}${tacticInfo}`);
        } else {
          const errMsg = `Bot processing error: ${result.reason}`;
          errors.push(errMsg);
          console.error(`[cron/bot-actions] ${errMsg}`);
        }
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
    return createErrorResponse(err, { route: '/api/cron/bot-actions', method: 'GET' });
  }
}
