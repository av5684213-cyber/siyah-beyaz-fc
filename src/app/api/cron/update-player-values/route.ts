import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyCronSecret, sanitizeError } from '@/lib/fm/security';

export const maxDuration = 300;

const MIN_PRICE = 100;
const MAX_PRICE = 10_000_000;
const BASE_MULTIPLIER = 1000;

type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

function determineRarity(rating: number, potential: number): Rarity {
  if (rating >= 85 || potential >= 90) return 'Legendary';
  if (rating >= 75 || potential >= 80) return 'Epic';
  if (rating >= 65 || potential >= 70) return 'Rare';
  return 'Common';
}

interface PlayerRecord {
  id: string;
  name?: string;
  rating?: number;
  potential?: number;
  form_rating?: number;
  age?: number;
  is_injured?: boolean;
  injury_end_date?: string | null;
  injury_history?: unknown;
  goals?: number;
  assists?: number;
  market_value?: number;
}

function calculatePlayerPrice(player: PlayerRecord): number {
  const overall = player.rating || 50;
  const formRating = player.form_rating || 50;
  const age = player.age || 25;
  const potential = player.potential || overall;
  const isInjured = player.is_injured || false;

  const goals = player.goals || 0;
  const assists = player.assists || 0;

  // 1. Baz fiyat
  const basePrice = overall * BASE_MULTIPLIER;

  // 2. Form etkisi
  const formModifier = 1.0 + ((formRating - 50) / 200.0);

  // 3. Sakatlık etkisi
  let injuryModifier = 1.0;
  if (isInjured) {
    injuryModifier = 0.90; // -%10
  }

  // Injury history check
  let history: Array<{ date?: string; duration_days?: number }> = [];
  if (player.injury_history) {
    try {
      history = typeof player.injury_history === 'string'
        ? JSON.parse(player.injury_history)
        : (player.injury_history as Array<{ date?: string; duration_days?: number }>);
    } catch { /* ignore */ }
  }

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const recentInjuries = history.filter(h => {
    if (!h.date) return false;
    return new Date(h.date) >= threeMonthsAgo;
  });

  for (const inj of recentInjuries) {
    if ((inj.duration_days || 0) >= 7) {
      injuryModifier *= 0.90;
      break;
    } else {
      injuryModifier *= 0.95;
    }
  }

  // 4. Yaş etkisi
  let ageModifier = 1.0;
  if (age < 22) {
    ageModifier = 1.20;
  } else if (age >= 33) {
    ageModifier = 0.80;
  } else if (age >= 30) {
    ageModifier = 0.90;
  }

  // 5. Performans bonusu
  const performanceBonus = goals * 500 + assists * 300;

  // 6. Nadirlik bonusu
  const rarity = determineRarity(overall, potential);
  const rarityModifiers: Record<Rarity, number> = {
    Common: 1.0,
    Rare: 1.5,
    Epic: 2.0,
    Legendary: 3.0,
  };
  const rarityModifier = rarityModifiers[rarity];

  // Toplam
  const totalPrice = Math.round(
    basePrice * formModifier * injuryModifier * ageModifier * rarityModifier + performanceBonus
  );

  return Math.max(MIN_PRICE, Math.min(MAX_PRICE, totalPrice));
}

/**
 * Cron: Oyuncu değerlerini güncelle
 * Her Pazartesi gece çalışır
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
      .select('id, name, rating, potential, form_rating, age, is_injured, injury_end_date, injury_history, goals, assists, market_value');

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
    const priceChanges: Array<{ name: string; old: number; newPrice: number }> = [];

    for (const player of players as PlayerRecord[]) {
      try {
        const oldPrice = player.market_value || 0;
        const newPrice = calculatePlayerPrice(player);

        if (oldPrice !== newPrice) {
          const { error: updateError } = await supabase
            .from('players')
            .update({ market_value: newPrice })
            .eq('id', player.id);

          if (updateError) {
            totalFailed++;
            continue;
          }

          priceChanges.push({
            name: player.name || 'Unknown',
            old: oldPrice,
            newPrice,
          });
        }

        totalUpdated++;
      } catch {
        totalFailed++;
      }
    }

    // Logla
    await supabase.from('error_logs').insert({
      source: 'cron',
      level: 'info',
      message: `Oyuncu değer güncelleme: ${totalUpdated} oyuncu, ${priceChanges.length} fiyat değişti`,
      context: { totalUpdated, changes: priceChanges.length, failed: totalFailed },
    });

    return NextResponse.json({
      success: true,
      totalPlayers: players.length,
      updated: totalUpdated,
      failed: totalFailed,
      priceChanges: priceChanges.length,
      sampleChanges: priceChanges.slice(0, 10),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[cron/update-player-values] Fatal error:', err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
