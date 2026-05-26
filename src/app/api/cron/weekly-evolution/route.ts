/**
 * Cron Job: Haftalık Oyuncu Evrimi (Weekly Evolution)
 *
 * Her hafta Pazar gecesi 23:55'te çalışır.
 * Tüm oyuncuların son 5 maç rating ortalamasını kullanarak evrim uygular.
 * Maç oynamayan oyunculara çok düşük (3.0) performans verilir.
 *
 * Akış:
 * 1. Tüm oyuncuları Supabase'den çek
 * 2. Her oyuncu için match_ratings ortalamasını hesapla
 * 3. UpdatePlayerStats ile evrim uygula
 * 4. processDailyUpdates ile form/moral/kondisyon güncelle
 * 5. Değişen oyuncuları Supabase'e kaydet
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { safeJsonParse } from '@/lib/fm/sharedUtils';
import { createErrorResponse } from '@/lib/api-error-handler';

export const maxDuration = 60; // 5 dakika (Vercel limiti)

// UpdatePlayerStats fonksiyonunu server-side için kopyalamak yerine,
// evolution.ts modülünü doğrudan import ediyoruz
import { UpdatePlayerStats, processDailyUpdates } from '@/lib/fm/evolution';
import type { Player } from '@/lib/fm/types';

/**
 * DB satırını Player tipine dönüştürür (evrim için gerekli alanlar)
 */
function mapDbPlayerToPlayer(dbPlayer: Record<string, unknown>): Player {
  return {
    id: dbPlayer.id as string,
    name: dbPlayer.name as string,
    position: dbPlayer.position as any,
    specificPosition: dbPlayer.specific_position as any,
    rating: (dbPlayer.rating as number) || 50,
    age: (dbPlayer.age as number) || 20,
    potential: (dbPlayer.potential as number) || 60,
    hidden_potential: (dbPlayer.hidden_potential as number) || 70,
    market_value: (dbPlayer.market_value as number) || 0,
    salary: (dbPlayer.salary as number) || 0,
    nation: (dbPlayer.nation as string) || 'Türkiye',
    club: dbPlayer.club as string | undefined,
    team_name: (dbPlayer.team_name as string) || '',
    defending: (dbPlayer.defending as number) || 50,
    passing: (dbPlayer.passing as number) || 50,
    shooting: (dbPlayer.shooting as number) || 50,
    speed: (dbPlayer.speed as number) || 50,
    power: (dbPlayer.power as number) || 50,
    goalkeeping: (dbPlayer.goalkeeping as number) || 1,
    heading: (dbPlayer.heading as number) || 50,
    control: (dbPlayer.control as number) || 50,
    vision: (dbPlayer.vision as number) || 50,
    stamina: (dbPlayer.stamina as number) || 50,
    cond: (dbPlayer.cond as number) ?? 75,
    form: (dbPlayer.form as number) ?? 60,
    morale: (dbPlayer.morale as number) ?? 60,
    confidence: (dbPlayer.confidence as number) ?? 60,
    match_ratings: safeJsonParse<number[]>(dbPlayer.match_ratings, []),
    traits: safeJsonParse<string[]>(dbPlayer.traits, []),
    traitLevels: safeJsonParse<Record<string, string>>(dbPlayer.trait_levels, {}),
    styleLevels: safeJsonParse<Record<string, number>>(dbPlayer.style_levels, {}),
    playStyle: dbPlayer.play_style as string | undefined,
    is_retiring: (dbPlayer.is_retiring as boolean) || false,
    is_legend: (dbPlayer.is_legend as boolean) || false,
    injury: safeJsonParse(dbPlayer.injury, undefined),
    preferred_foot: (dbPlayer.preferred_foot as any) || 'Right',
  } as Player;
}

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    console.log('[cron/weekly-evolution] Starting weekly player evolution...');

    // 1. Tüm oyuncuları çek (batch halinde)
    const { data: allPlayers, error: playersError } = await supabase
      .from('players')
      .select('*')
      .order('updated_at', { ascending: true });

    if (playersError) {
      console.error('[weekly-evolution] Error fetching players:', playersError);
      return NextResponse.json({ error: 'Oyuncular alınamadı' }, { status: 500 });
    }

    if (!allPlayers || allPlayers.length === 0) {
      return NextResponse.json({ message: 'Oyuncu bulunamadı', updated: 0 });
    }

    console.log(`[weekly-evolution] Processing ${allPlayers.length} players...`);

    // 2. Her oyuncu için evrim hesapla
    const updates: {
      id: string;
      rating: number;
      passing: number;
      speed: number;
      form: number;
      morale: number;
      confidence: number;
      trait_levels: any;
      style_levels: any;
      match_ratings: any;
      is_retiring?: boolean;
    }[] = [];

    let highGrowth = 0;
    let lowGrowth = 0;
    let noMatch = 0;

    for (const dbPlayer of allPlayers) {
      try {
        const player = mapDbPlayerToPlayer(dbPlayer);

        // Performans hesapla: son 5 maç rating ortalaması
        const matchRatings = player.match_ratings || [];
        let performance: number;

        if (matchRatings.length > 0) {
          performance = matchRatings.reduce((sum, r) => sum + r, 0) / matchRatings.length;
          if (performance >= 7.0) highGrowth++;
          else lowGrowth++;
        } else {
          // Maç oynamamış oyunculara çok düşük performans
          performance = 3;
          noMatch++;
        }

        // Evrim uygula
        let evolved = UpdatePlayerStats(player, performance);

        // processDailyUpdates ile form/moral/kondisyon güncelle
        const [dailyUpdated] = processDailyUpdates([evolved]);
        evolved = dailyUpdated;

        // Rating değişimini logla
        const ratingDiff = evolved.rating - player.rating;

        updates.push({
          id: player.id,
          rating: Math.round(evolved.rating * 100) / 100,
          passing: evolved.passing,
          speed: evolved.speed,
          form: evolved.form,
          morale: evolved.morale,
          confidence: evolved.confidence,
          trait_levels: evolved.traitLevels || {},
          style_levels: evolved.styleLevels || {},
          match_ratings: matchRatings, // match_ratings'i olduğu gibi geri yaz
          is_retiring: evolved.is_retiring || undefined,
        });

        if (Math.abs(ratingDiff) > 0.5) {
          console.log(`[weekly-evolution] ${player.name}: ${player.rating.toFixed(1)} → ${evolved.rating.toFixed(1)} (perf: ${performance.toFixed(1)}, Δ: ${ratingDiff.toFixed(2)})`);
        }
      } catch (err) {
        console.error(`[weekly-evolution] Error processing player ${dbPlayer.id}:`, err);
      }
    }

    // 3. Toplu güncelleme (batch upsert, 50'li gruplar)
    let updated = 0;
    const errors: string[] = [];

    for (let i = 0; i < updates.length; i += 50) {
      const batch = updates.slice(i, i + 50);
      try {
        const { error: updateError } = await supabase
          .from('players')
          .upsert(batch, { onConflict: 'id' });

        if (updateError) {
          errors.push(`Batch update error (offset ${i}): ${updateError.message}`);
          console.error(`[weekly-evolution] Batch update error:`, updateError);
        } else {
          updated += batch.length;
        }
      } catch (err) {
        errors.push(`Batch update exception (offset ${i}): ${err}`);
      }
    }

    console.log(`[weekly-evolution] Completed: ${updated}/${allPlayers.length} players updated`);
    console.log(`[weekly-evolution] Stats: highGrowth=${highGrowth}, lowGrowth=${lowGrowth}, noMatch=${noMatch}`);

    return NextResponse.json({
      success: true,
      updated,
      total: allPlayers.length,
      highGrowth,
      lowGrowth,
      noMatch,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/weekly-evolution', method: 'GET' });
  }
}
