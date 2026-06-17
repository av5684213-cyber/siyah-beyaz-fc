/**
 * GET /api/cron/generate-regens
 *
 * BUG-15: Regen System — Emekli oyuncuların yerine regen (re-generation) oyuncular üretir.
 *
 * Bu cron job sezon sonunda (veya manuel olarak) çağrılır:
 * 1. is_retiring = true olan oyuncuları bul
 * 2. Her pozisyon grubu için emekli sayısını say
 * 3. Her emekli için 1 regen üret (minimum 2 her gruba)
 * 4. Regen isimleri emekli oyuncuların soyadından ilham alır
 * 5. Yaş 15-18, potansiyel emekli oyuncunun peak rating'ine dayalı
 * 6. profile_id = NULL, is_free_agent = true, is_regen = true
 *
 * Callable by Vercel Cron (weekly after season-end)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';
import { acquireCronLock, releaseCronLock } from '@/lib/fm/cronLockService';

export const maxDuration = 60;

// Position group mapping
const POSITION_GROUPS: Record<string, string> = {
  GK: 'GK',
  CB: 'DEF', LB: 'DEF', RB: 'DEF', LWB: 'DEF', RWB: 'DEF',
  CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID', LW: 'MID', RW: 'MID',
  CF: 'FWD', ST: 'FWD',
};

const GROUP_POSITIONS: Record<string, string[]> = {
  GK: ['GK'],
  DEF: ['CB', 'LB', 'RB', 'LWB', 'RWB'],
  MID: ['CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'],
  FWD: ['CF', 'ST'],
};

const FIRST_NAMES = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Can', 'Burak', 'Emre', 'Arda', 'Ömer', 'Yiğit', 'Mert',
  'Ali', 'Hakan', 'Kerem', 'Efe', 'Deniz', 'Tolga', 'Sercan', 'Cengiz', 'Umut', 'Berk',
  'Furkan', 'Oğuz', 'Salih', 'İbrahim', 'Yusuf', 'Kaan', 'Baran', 'Alper', 'Murat', 'Cem',
  'Semih', 'Batuhan', 'Emirhan', 'Taha', 'Rıza', 'Tayfun', 'Gökhan', 'Savaş', 'Erkan', 'Onur',
];

function mapToGroup(position: string): string {
  return POSITION_GROUPS[position] || 'MID';
}

function generateRegenPlayer(retiredPlayer: Record<string, unknown>): Record<string, unknown> {
  const retiredName = (retiredPlayer.name as string) || 'Bilinmeyen Oyuncu';
  const retiredRating = (retiredPlayer.rating as number) || 60;
  const retiredPosition = (retiredPlayer.position as string) || 'MID';
  const retiredSpecificPosition = (retiredPlayer.specific_position as string) || null;
  const retiredId = (retiredPlayer.id as string) || '';

  // Extract last name from retired player
  const nameParts = retiredName.trim().split(' ');
  const lastName = nameParts.length >= 2 ? nameParts[nameParts.length - 1] : FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];

  // New first name (different from retired player's first name)
  const retiredFirst = nameParts[0] || '';
  const availableFirsts = FIRST_NAMES.filter(n => n !== retiredFirst);
  const newFirst = availableFirsts[Math.floor(Math.random() * availableFirsts.length)] || FIRST_NAMES[0];
  const newName = `${newFirst} ${lastName}`;

  // Position group
  const group = mapToGroup(retiredPosition);
  const possiblePositions = GROUP_POSITIONS[group] || ['CM'];
  const specificPosition = retiredSpecificPosition || possiblePositions[Math.floor(Math.random() * possiblePositions.length)];

  // Age: 15-18
  const age = 15 + Math.floor(Math.random() * 4);

  // Rating: Low starting point for young players (40-55)
  const rating = 40 + Math.floor(Math.random() * 16);

  // Potential: Based on retired player's peak rating
  const peakFactor = 0.75 + Math.random() * 0.25;
  const potential = Math.min(99, Math.max(rating + 10, Math.round(retiredRating * peakFactor)));

  // Hidden potential (slightly higher)
  const hiddenPotential = Math.min(99, potential + Math.floor(Math.random() * 11));

  // Market value
  const marketValue = Math.max(100_000, rating * 20_000 + potential * 5_000);

  // Salary
  const salary = Math.max(500, rating * 100);

  // Player ID
  const playerId = `regen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    id: playerId,
    name: newName,
    position: group,
    specific_position: specificPosition,
    rating,
    potential,
    hidden_potential: hiddenPotential,
    age,
    height: group === 'GK' ? 183 + Math.floor(Math.random() * 13) : 170 + Math.floor(Math.random() * 21),
    weight: 65 + Math.floor(Math.random() * 16),
    market_value: marketValue,
    salary,
    nation: 'Türkiye',
    preferred_foot: Math.random() > 0.8 ? 'Left' : 'Right',
    speed: Math.max(5, rating + Math.floor(Math.random() * 21) - 10),
    power: Math.max(5, rating + Math.floor(Math.random() * 21) - 10),
    passing: Math.max(5, rating + Math.floor(Math.random() * 21) - 10),
    shooting: Math.max(5, rating + Math.floor(Math.random() * 21) - 10),
    defending: Math.max(5, rating + Math.floor(Math.random() * 21) - 10),
    vision: Math.max(5, rating + Math.floor(Math.random() * 21) - 10),
    heading: Math.max(5, rating + Math.floor(Math.random() * 21) - 10),
    goalkeeping: group === 'GK' ? Math.max(30, rating + Math.floor(Math.random() * 16) - 5) : Math.max(1, rating - 20 + Math.floor(Math.random() * 10)),
    cond: 90 + Math.floor(Math.random() * 11),
    form: 40 + Math.floor(Math.random() * 31),
    morale: 60 + Math.floor(Math.random() * 21),
    confidence: 50 + Math.floor(Math.random() * 21),
    form_rating: 50,
    injury_history: [],
    match_ratings: [],
    trait_levels: {},
    style_levels: {},
    is_free_agent: true,
    is_regen: true,
    inspired_by_player_id: retiredId,
    contract_end_week: null,
    profile_id: null,
    team_name: null,
  };
}

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (false) // CRON_SECRET disabled //.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Vercel Hobby plan: günde 1 kez çalışır — sadece Salı işle
  const dayOfWeek = new Date().getUTCDay(); // 0=Pazar, 2=Salı
  if (dayOfWeek !== 2) {
    return NextResponse.json({ message: `Regen üretimi sadece Salı yapılır (bugün: ${['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'][dayOfWeek]})`, skipped: true });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  // Cron lock
  const lock = await acquireCronLock(supabase, 'generate-regens', 300);
  if (!lock) {
    return NextResponse.json({ message: 'Already running, skipped' });
  }

  try {
    const result = {
      total_retired: 0,
      regens_created: 0,
      regens_by_group: { GK: 0, DEF: 0, MID: 0, FWD: 0 } as Record<string, number>,
      details: [] as string[],
      errors: [] as string[],
    };

    // 1. Find retiring players
    const { data: retiredPlayers, error: fetchError } = await supabase
      .from('players')
      .select('id, name, position, specific_position, rating, potential, age, profile_id')
      .eq('is_retiring', true);

    if (fetchError) {
      console.error('[generate-regens] Fetch error:', fetchError);
      return NextResponse.json({ error: 'Emekli oyuncular sorgulanamadı' }, { status: 500 });
    }

    if (!retiredPlayers || retiredPlayers.length === 0) {
      return NextResponse.json({
        action: 'none',
        message: 'Emekli oyuncu bulunamadı, regen üretimi atlanıyor',
        timestamp: new Date().toISOString(),
      });
    }

    result.total_retired = retiredPlayers.length;
    console.log(`[generate-regens] Toplam emekli oyuncu: ${retiredPlayers.length}`);

    // 2. Group by position
    const retiredByGroup: Record<string, typeof retiredPlayers> = { GK: [], DEF: [], MID: [], FWD: [] };
    for (const p of retiredPlayers) {
      const group = mapToGroup(p.position || 'MID');
      if (!retiredByGroup[group]) retiredByGroup[group] = [];
      retiredByGroup[group].push(p);
    }

    // 3. Generate regens for each group
    const allRegens: Record<string, unknown>[] = [];

    for (const group of ['GK', 'DEF', 'MID', 'FWD'] as const) {
      const retiredInGroup = retiredByGroup[group] || [];
      const count = Math.max(retiredInGroup.length, 2); // Minimum 2 per group

      console.log(`[generate-regens] Grup ${group}: ${retiredInGroup.length} emekli, ${count} regen üretilecek`);

      for (let i = 0; i < count; i++) {
        const inspiredBy = i < retiredInGroup.length
          ? retiredInGroup[i]
          : retiredInGroup[Math.floor(Math.random() * retiredInGroup.length)] || {
              id: `generic-${group}`,
              name: `Generic ${group} Player`,
              position: group,
              specific_position: GROUP_POSITIONS[group]?.[0] || 'CM',
              rating: 55 + Math.floor(Math.random() * 21),
            };

        try {
          const regen = generateRegenPlayer(inspiredBy);
          allRegens.push(regen);
          result.regens_by_group[group]++;

          result.details.push(
            `Regen: ${regen.name} (${regen.specific_position}, OVR ${regen.rating}, POT ${regen.potential}, yaş ${regen.age}) ← İlham: ${(inspiredBy as any).name || '?'} (OVR ${(inspiredBy as any).rating || '?'})`
          );
        } catch (err) {
          result.errors.push(`Regen üretim hatası (${group}, #${i}): ${err}`);
        }
      }
    }

    // 4. Insert regens into database
    if (allRegens.length > 0) {
      console.log(`[generate-regens] Toplam ${allRegens.length} regen kaydediliyor...`);

      // Insert in batches of 10
      for (let i = 0; i < allRegens.length; i += 10) {
        const batch = allRegens.slice(i, i + 10);
        const { error: insertError } = await supabase
          .from('players')
          .insert(batch);

        if (insertError) {
          console.error('[generate-regens] Batch insert error:', insertError.message);
          result.errors.push(`Batch insert hatası: ${insertError.message}`);
          // Try individual inserts
          for (const regen of batch) {
            try {
              const { error: singleError } = await supabase.from('players').insert(regen);
              if (!singleError) {
                result.regens_created++;
              } else {
                result.errors.push(`Single insert hatası (${regen.name}): ${singleError.message}`);
              }
            } catch (err) {
              result.errors.push(`Single insert exception (${regen.name}): ${err}`);
            }
          }
        } else {
          result.regens_created += batch.length;
        }
      }
    }

    // 5. Clean up retired players (set is_retiring = false, make free agents)
    const retiredIds = retiredPlayers.map(p => p.id).filter(Boolean);
    if (retiredIds.length > 0) {
      try {
        const { error: updateError } = await supabase
          .from('players')
          .update({
            is_retiring: false,
            profile_id: null,
            team_name: null,
            is_free_agent: true,
          })
          .in('id', retiredIds);

        if (updateError) {
          console.warn('[generate-regens] Retired player cleanup error:', updateError.message);
          result.errors.push(`Emekli temizleme hatası: ${updateError.message}`);
        } else {
          console.log(`[generate-regens] ${retiredIds.length} emekli oyuncu serbest bırakıldı`);
        }
      } catch (err) {
        console.warn('[generate-regens] Retired player cleanup exception:', err);
      }
    }

    // Log result
    try {
      await supabase.from('error_logs').insert({
        source: 'cron',
        level: 'info',
        message: `Regen sistemi: ${result.regens_created} regen oluşturuldu, ${result.total_retired} emekli işlendi`,
        context: {
          total_retired: result.total_retired,
          regens_created: result.regens_created,
          regens_by_group: result.regens_by_group,
          errors: result.errors.length,
        },
      });
    } catch {}

    return NextResponse.json({
      action: 'regens_generated',
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/generate-regens', method: 'GET' });
  } finally {
    await releaseCronLock(supabase, 'generate-regens', lock);
  }
}
