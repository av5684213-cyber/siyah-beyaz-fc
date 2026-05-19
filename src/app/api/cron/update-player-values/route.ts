import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyCronSecret, sanitizeError } from '@/lib/fm/security';
import {
  calculatePlayerPrice,
  determineRarity,
  type PlayerValuationRecord,
} from '@/lib/fm/updatePlayerValues';

export const maxDuration = 300;

/**
 * Cron: Oyuncu değerlerini güncelle (v2 — Python spec'e tam uyumlu)
 * Her Pazar gecesi çalışır.
 * 
 * GET /api/cron/update-player-values
 */
export async function GET(request: NextRequest) {
  const cronCheck = verifyCronSecret(request);
  if (!cronCheck.valid) {
    return NextResponse.json({ error: cronCheck.error }, { status: 401 });
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
      .select('id, name, rating, potential, form_rating, age, is_injured, injury_end_date, injury_history, goals, assists, market_value, current_price');

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

    let totalUpdated = 0;
    let totalFailed = 0;
    const priceChanges: Array<{ name: string; old: number; newPrice: number; rarity: string }> = [];

    for (const player of players as PlayerValuationRecord[]) {
      try {
        const oldPrice = player.current_price || player.market_value || 0;

        // Fiyat hesaplama — hata durumunda eski fiyatı koru
        let newPrice: number;
        try {
          newPrice = calculatePlayerPrice(player);
        } catch {
          newPrice = oldPrice > 0 ? oldPrice : 100;
        }

        const rarity = determineRarity(player.rating || 50, player.potential || (player.rating || 50));

        // current_price alanını güncelle, yoksa market_value
        if (oldPrice !== newPrice) {
          const { error: updateError } = await supabase
            .from('players')
            .update({
              current_price: newPrice,
              market_value: newPrice, // Her iki alanı da güncelle
            })
            .eq('id', player.id);

          if (updateError) {
            totalFailed++;
            continue;
          }

          priceChanges.push({
            name: player.name || 'Unknown',
            old: oldPrice,
            newPrice,
            rarity,
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
        message: `Oyuncu değer güncelleme (v2): ${totalUpdated} oyuncu, ${priceChanges.length} fiyat değişti`,
        context: { totalUpdated, changes: priceChanges.length, failed: totalFailed, avgOld, avgNew },
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
      sampleChanges: priceChanges.slice(0, 10),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[cron/update-player-values] Fatal error:', err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
