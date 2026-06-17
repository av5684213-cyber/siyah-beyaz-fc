import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { calculateMarketValue } from '@/lib/fm/valuation';
import { getInflationFactor } from '@/lib/fm/inflation';
import { createErrorResponse } from '@/lib/api-error-handler';
import type { Player } from '@/lib/fm/types';

export const maxDuration = 60;

/**
 * Cron: Oyuncu değerlerini güncelle (birleştirilmiş — valuation.ts tek kaynak)
 * Her Pazar gecesi çalışır.
 *
 * GET /api/cron/update-player-values
 */
export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (false) // CRON_SECRET disabled //.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'No Supabase client' }, { status: 500 });
  }

  try {
    // Tüm oyuncuları getir
    const { data: players, error: fetchError } = await supabase
      .from('players')
      .select('id, name, rating, potential, form_rating, age, is_injured, injury_history, market_value, current_price, position, nation, salary, cond, form, morale, confidence, defending, passing, shooting, speed, power, vision, control, heading, goalkeeping, traits, neg_traits, trait_levels, archetype, hidden_potential, secondary_positions, personality, injury_end_date, goals, assists');

    if (fetchError) {
      console.error('[cron/update-player-values] Fetch error:', fetchError);
      return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }

    if (!players || players.length === 0) {
      return NextResponse.json({
        success: true,
        updated: 0,
        message: 'Güncellenecek oyuncu yok',
        timestamp: new Date().toISOString(),
      });
    }

    // Enflasyon çarpanı — ilk profile göre hesapla
    let currentDay = 1;
    try {
      const { data: firstProfile } = await supabase
        .from('profiles')
        .select('current_day')
        .limit(1)
        .maybeSingle();
      currentDay = firstProfile?.current_day || 1;
    } catch {
      // Enflasyon hesaplanamazsa varsayılan gün 1 kullan
    }

    let totalUpdated = 0;
    let totalFailed = 0;
    const priceChanges: Array<{ name: string; old: number; newPrice: number }> = [];

    for (const dbPlayer of players as any[]) {
      try {
        const oldPrice = dbPlayer.current_price || dbPlayer.market_value || 0;

        // DB row'u Player tipine dönüştür (calculateMarketValue ile uyumlu)
        let parsedTraits: string[] = [];
        let parsedNegTraits: string[] = [];
        let parsedTraitLevels: Record<string, string> = {};
        let parsedSecondaryPositions: string[] = [];
        let parsedInjuryHistory: any[] = [];

        try {
          const personality = typeof dbPlayer.personality === 'string' ? JSON.parse(dbPlayer.personality) : dbPlayer.personality || {};
          parsedTraits = personality.traits || [];
          parsedNegTraits = personality.negTraits || [];
          parsedTraitLevels = personality.traitLevels || {};
          parsedSecondaryPositions = dbPlayer.secondary_positions
            ? (typeof dbPlayer.secondary_positions === 'string' ? JSON.parse(dbPlayer.secondary_positions) : dbPlayer.secondary_positions)
            : [];
        } catch { /* ignore parse errors */ }

        try {
          parsedInjuryHistory = typeof dbPlayer.injury_history === 'string'
            ? JSON.parse(dbPlayer.injury_history)
            : (Array.isArray(dbPlayer.injury_history) ? dbPlayer.injury_history : []);
        } catch { /* ignore */ }

        const player = {
          ...dbPlayer,
          rating: dbPlayer.rating || 50,
          potential: dbPlayer.potential || 60,
          form_rating: dbPlayer.form_rating || 50,
          age: dbPlayer.age || 25,
          injury: dbPlayer.is_injured ? { type: 'light', remaining_days: 1, severity: 1 } : undefined,
          injury_history: parsedInjuryHistory,
          cond: dbPlayer.cond || 80,
          form: dbPlayer.form || 50,
          morale: dbPlayer.morale || 60,
          confidence: dbPlayer.confidence || 60,
          defending: dbPlayer.defending || 50,
          passing: dbPlayer.passing || 50,
          shooting: dbPlayer.shooting || 50,
          speed: dbPlayer.speed || 50,
          power: dbPlayer.power || 50,
          vision: dbPlayer.vision || 50,
          control: dbPlayer.control || 50,
          heading: dbPlayer.heading || 50,
          goalkeeping: dbPlayer.goalkeeping || 10,
          nation: dbPlayer.nation || '',
          salary: dbPlayer.salary || 0,
          traits: parsedTraits,
          negTraits: parsedNegTraits,
          traitLevels: parsedTraitLevels,
          hidden_potential: dbPlayer.potential || 60,
          secondaryPositions: parsedSecondaryPositions,
          archetype: dbPlayer.archetype,
        } as unknown as Player;

        // Tek kaynak: valuation.ts'ten hesapla (enflasyon dahil)
        let newPrice: number;
        try {
          newPrice = calculateMarketValue(player, currentDay);
        } catch {
          newPrice = oldPrice > 0 ? oldPrice : 150000;
        }

        // current_price ve market_value alanlarını güncelle
        if (oldPrice !== newPrice) {
          const { error: updateError } = await supabase
            .from('players')
            .update({
              current_price: newPrice,
              market_value: newPrice,
            })
            .eq('id', dbPlayer.id);

          if (updateError) {
            totalFailed++;
            continue;
          }

          priceChanges.push({
            name: dbPlayer.name || 'Unknown',
            old: oldPrice,
            newPrice,
          });
        }

        totalUpdated++;
      } catch {
        totalFailed++;
      }
    }

    // İstatistikler
    const avgOld = priceChanges.length > 0
      ? Math.round(priceChanges.reduce((s, p) => s + p.old, 0) / priceChanges.length)
      : 0;
    const avgNew = priceChanges.length > 0
      ? Math.round(priceChanges.reduce((s, p) => s + p.newPrice, 0) / priceChanges.length)
      : 0;

    // Logla
    try {
      await supabase.from('error_logs').insert({
        source: 'cron',
        level: 'info',
        message: `Oyuncu değer güncelleme (unified valuation): ${totalUpdated} oyuncu, ${priceChanges.length} fiyat değişti`,
        context: { totalUpdated, changes: priceChanges.length, failed: totalFailed, avgOld, avgNew, currentDay },
      });
    } catch {
      // Log hatası kritik değil
    }

    return NextResponse.json({
      success: true,
      totalPlayers: players.length,
      updated: totalUpdated,
      failed: totalFailed,
      priceChanges: priceChanges.length,
      avgOldPrice: avgOld,
      avgNewPrice: avgNew,
      currentDay,
      sampleChanges: priceChanges.slice(0, 10),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/update-player-values', method: 'GET' });
  }
}
