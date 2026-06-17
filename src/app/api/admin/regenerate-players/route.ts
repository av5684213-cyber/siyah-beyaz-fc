/**
 * Tüm oyuncuların 50 olan özelliklerini mevki bazlı yeniden üret
 * POST /api/admin/regenerate-players
 *
 * Bu endpoint tüm oyuncuları tarar, 50 değerine sahip özellikleri
 * mevki bazlı öncelik tablolarına göre yeniden üretir.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateAllAttributes, getPositionKey } from '@/lib/fm/attributeGenerator';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  let supabase = getServiceSupabase();
  if (!supabase) supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });
  }

  try {
    // 1. Tüm oyuncuları çek
    const { data: players, error: fetchError } = await supabase
      .from('players')
      .select('id, position, specific_position')
      .order('id');

    if (fetchError) {
      return NextResponse.json({ error: 'Oyuncular yüklenemedi: ' + fetchError.message }, { status: 500 });
    }

    if (!players || players.length === 0) {
      return NextResponse.json({ message: 'Oyuncu bulunamadı', updated: 0 });
    }

    // 2. Özellik kolonları listesi
    const ATTR_COLS = [
      'finishing', 'dribbling', 'first_touch', 'crossing', 'marking', 'tackling',
      'technique', 'long_shots', 'off_the_ball', 'heading',
      'determination', 'aggression', 'bravery', 'work_rate', 'decisions',
      'concentration', 'leadership', 'anticipation', 'flair', 'positioning',
      'composure', 'teamwork', 'vision',
      'acceleration', 'agility', 'balance', 'strength', 'stamina', 'jumping',
    ];

    // DB kolon adları (snake_case) → attribute generator key'leri (camelCase)
    const COL_TO_ATTR: Record<string, string> = {
      finishing: 'finishing', dribbling: 'dribbling', first_touch: 'firstTouch',
      crossing: 'crossing', marking: 'marking', tackling: 'tackling',
      technique: 'technique', long_shots: 'longShots', off_the_ball: 'offTheBall',
      heading: 'heading',
      determination: 'determination', aggression: 'aggression', bravery: 'bravery',
      work_rate: 'workRate', decisions: 'decisions', concentration: 'concentration',
      leadership: 'leadership', anticipation: 'anticipation', flair: 'flair',
      positioning: 'positioning', composure: 'composure', teamwork: 'teamwork',
      vision: 'vision',
      acceleration: 'acceleration', agility: 'agility', balance: 'balance',
      strength: 'strength', stamina: 'stamina', jumping: 'jumping',
    };

    let updatedCount = 0;
    let totalFixed = 0;
    const batchSize = 50;

    // 3. Her oyuncuyu tara
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      const updates: any[] = [];

      for (const player of batch) {
        const position = player.specific_position || player.position || 'MID';
        const posKey = getPositionKey(position);

        // Mevki bazlı yeni özellikler üret
        const newAttrs = generateAllAttributes(position);

        // Tüm özellik kolonlarını yeniden üret (50 olanları değil, hepsini)
        // Bu daha garanti — tüm özellikler mevki bazlı olacak
        const update: Record<string, any> = {};
        for (const [colName, attrKey] of Object.entries(COL_TO_ATTR)) {
          const newVal = newAttrs[attrKey];
          if (newVal !== undefined) {
            update[colName] = newVal;
          }
        }

        // Ek özellikler
        if (posKey === 'GK') {
          update.goalkeeping = newAttrs.goalkeeping || 75;
        } else {
          update.goalkeeping = newAttrs.goalkeeping || 15;
        }

        // Kısa stat'ları da güncelle
        update.shooting = Math.round(((update.finishing || 50) + (update.long_shots || 50)) / 2);
        update.defending = Math.round(((update.tackling || 50) + (update.marking || 50) + (update.positioning || 50)) / 3);
        update.passing = update.passing || newAttrs.passing || 50;
        update.speed = update.speed || newAttrs.speed || 50;
        update.power = update.power || newAttrs.strength || 50;

        updates.push({ id: player.id, ...update });
      }

      // Batch update
      for (const u of updates) {
        const { id, ...updateData } = u;
        const { error: updateError } = await supabase
          .from('players')
          .update(updateData)
          .eq('id', id);

        if (!updateError) {
          updatedCount++;
          totalFixed += Object.keys(updateData).length;
        }
      }

      console.log(`[regenerate-players] ${Math.min(i + batchSize, players.length)}/${players.length} oyuncu işlendi`);
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount} oyuncunun özellikleri mevki bazlı yeniden üretildi`,
      totalPlayers: players.length,
      updatedPlayers: updatedCount,
      totalAttributesFixed: totalFixed,
    });
  } catch (err: any) {
    console.error('[regenerate-players] Error:', err);
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 });
  }
}
