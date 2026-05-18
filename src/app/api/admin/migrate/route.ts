import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmxbyaamwbpnvgbnjbmo.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI';

/**
 * Admin migration endpoint - applies database schema changes
 * Protected by CRON_SECRET header
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== 'siyah-beyaz-fc-cron-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const results: string[] = [];

  try {
    // ── Step 1: Create positions reference table ──
    // Using Supabase REST API since we can't run raw DDL with anon key
    // Check if positions table already exists by trying to select from it
    const { data: existingPositions, error: posCheckError } = await supabase
      .from('positions')
      .select('code')
      .limit(1);

    if (posCheckError && posCheckError.code === '42P01') {
      results.push('positions table does not exist - needs manual DDL creation');
    } else if (posCheckError) {
      results.push(`positions check error: ${posCheckError.message}`);
    } else {
      results.push(`positions table exists with ${existingPositions?.length || 0} entries`);
    }

    // ── Step 2: Upsert position data if table exists ──
    if (!posCheckError) {
      const positionData = [
        { code: 'GK',  name_tr: 'Kaleci', name_en: 'Goalkeeper', position_group: 'GK', sort_order: 0, pitch_zone: 'goal' },
        { code: 'CB',  name_tr: 'Merkez Defans', name_en: 'Center Back', position_group: 'DEF', sort_order: 10, pitch_zone: 'defense' },
        { code: 'LB',  name_tr: 'Sol Bek', name_en: 'Left Back', position_group: 'DEF', sort_order: 11, pitch_zone: 'defense' },
        { code: 'RB',  name_tr: 'Sağ Bek', name_en: 'Right Back', position_group: 'DEF', sort_order: 12, pitch_zone: 'defense' },
        { code: 'LWB', name_tr: 'Sol Kanat Bek', name_en: 'Left Wing Back', position_group: 'DEF', sort_order: 13, pitch_zone: 'defense_mid' },
        { code: 'RWB', name_tr: 'Sağ Kanat Bek', name_en: 'Right Wing Back', position_group: 'DEF', sort_order: 14, pitch_zone: 'defense_mid' },
        { code: 'CDM', name_tr: 'Defansif Orta Saha', name_en: 'Defensive Midfielder', position_group: 'MID', sort_order: 20, pitch_zone: 'defense_mid' },
        { code: 'CM',  name_tr: 'Merkez Orta Saha', name_en: 'Central Midfielder', position_group: 'MID', sort_order: 21, pitch_zone: 'midfield' },
        { code: 'CAM', name_tr: 'Ofansif Orta Saha', name_en: 'Attacking Midfielder', position_group: 'MID', sort_order: 22, pitch_zone: 'midfield_attack' },
        { code: 'LM',  name_tr: 'Sol Açık', name_en: 'Left Midfielder', position_group: 'MID', sort_order: 23, pitch_zone: 'midfield' },
        { code: 'RM',  name_tr: 'Sağ Açık', name_en: 'Right Midfielder', position_group: 'MID', sort_order: 24, pitch_zone: 'midfield' },
        { code: 'LW',  name_tr: 'Sol Kanat', name_en: 'Left Winger', position_group: 'MID', sort_order: 25, pitch_zone: 'attack' },
        { code: 'RW',  name_tr: 'Sağ Kanat', name_en: 'Right Winger', position_group: 'MID', sort_order: 26, pitch_zone: 'attack' },
        { code: 'CF',  name_tr: 'Göbek Forvet', name_en: 'Center Forward', position_group: 'FWD', sort_order: 30, pitch_zone: 'attack' },
        { code: 'ST',  name_tr: 'Santrfor', name_en: 'Striker', position_group: 'FWD', sort_order: 31, pitch_zone: 'attack' },
      ];

      const { error: upsertError } = await supabase
        .from('positions')
        .upsert(positionData, { onConflict: 'code' });

      if (upsertError) {
        results.push(`positions upsert error: ${upsertError.message}`);
      } else {
        results.push(`positions upserted: ${positionData.length} positions`);
      }
    }

    // ── Step 3: Fix players with missing specific_position ──
    // Players where specific_position is NULL or equals the position group
    const VALID_POSITIONS = ['GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','CF','ST'];
    const { data: badPlayers, error: badPlayersError } = await supabase
      .from('players')
      .select('id, position, specific_position')
      .or('specific_position.is.null,specific_position.eq.GK,specific_position.eq.DEF,specific_position.eq.MID,specific_position.eq.FWD')
      .limit(500);

    if (badPlayersError) {
      results.push(`bad players query error: ${badPlayersError.message}`);
    } else if (badPlayers && badPlayers.length > 0) {
      let fixed = 0;
      const DEF_POS = ['CB','LB','RB','LWB','RWB'];
      const MID_POS = ['CDM','CM','CAM','LM','RM','LW','RW'];
      const FWD_POS = ['CF','ST'];

      for (const p of badPlayers) {
        // Skip if already has valid specific_position
        if (p.specific_position && VALID_POSITIONS.includes(p.specific_position) && 
            p.specific_position !== p.position) continue;

        let newPos = p.specific_position;
        if (!p.specific_position || !VALID_POSITIONS.includes(p.specific_position) || p.specific_position === p.position) {
          switch (p.position) {
            case 'GK': newPos = 'GK'; break;
            case 'DEF': newPos = DEF_POS[Math.floor(Math.random() * DEF_POS.length)]; break;
            case 'MID': newPos = MID_POS[Math.floor(Math.random() * MID_POS.length)]; break;
            case 'FWD': newPos = FWD_POS[Math.floor(Math.random() * FWD_POS.length)]; break;
            default: newPos = 'CM';
          }
        }

        const { error: updateError } = await supabase
          .from('players')
          .update({ specific_position: newPos })
          .eq('id', p.id);

        if (!updateError) fixed++;
      }
      results.push(`Fixed ${fixed}/${badPlayers.length} players with missing specific_position`);
    } else {
      results.push('All players have valid specific_position');
    }

    // ── Step 4: Populate player_positions from existing data ──
    const { data: playerPositionsCheck, error: ppCheckError } = await supabase
      .from('player_positions')
      .select('id')
      .limit(1);

    if (ppCheckError && ppCheckError.code === '42P01') {
      results.push('player_positions table does not exist - needs manual DDL creation');
    } else if (ppCheckError) {
      results.push(`player_positions check error: ${ppCheckError.message}`);
    } else {
      // Table exists - populate primary positions
      const { data: allPlayers } = await supabase
        .from('players')
        .select('id, specific_position, secondary_positions')
        .not('specific_position', 'is', 'null');

      if (allPlayers && allPlayers.length > 0) {
        // Insert primary positions
        const primaryEntries = allPlayers
          .filter(p => p.specific_position && VALID_POSITIONS.includes(p.specific_position))
          .map(p => ({
            player_id: p.id,
            position_code: p.specific_position,
            is_primary: true,
            proficiency: 100,
          }));

        const { error: insertPrimaryError } = await supabase
          .from('player_positions')
          .upsert(primaryEntries, { onConflict: 'player_id,position_code' });

        if (insertPrimaryError) {
          results.push(`primary positions insert error: ${insertPrimaryError.message}`);
        } else {
          results.push(`primary positions inserted: ${primaryEntries.length}`);
        }

        // Insert secondary positions
        const secondaryEntries: Array<{player_id: string; position_code: string; is_primary: boolean; proficiency: number}> = [];
        for (const p of allPlayers) {
          if (p.secondary_positions && Array.isArray(p.secondary_positions) && p.secondary_positions.length > 0) {
            for (const sp of p.secondary_positions) {
              if (VALID_POSITIONS.includes(sp) && sp !== p.specific_position) {
                secondaryEntries.push({
                  player_id: p.id,
                  position_code: sp,
                  is_primary: false,
                  proficiency: 70,
                });
              }
            }
          }
        }

        if (secondaryEntries.length > 0) {
          const { error: insertSecondaryError } = await supabase
            .from('player_positions')
            .upsert(secondaryEntries, { onConflict: 'player_id,position_code' });

          if (insertSecondaryError) {
            results.push(`secondary positions insert error: ${insertSecondaryError.message}`);
          } else {
            results.push(`secondary positions inserted: ${secondaryEntries.length}`);
          }
        } else {
          results.push('No secondary positions to insert');
        }
      }
    }

    // ── Step 5: Assign secondary_positions to players who don't have them ──
    const COMPATIBLE: Record<string, string[]> = {
      GK: [],
      CB: ['LB', 'RB', 'CDM'],
      LB: ['CB', 'LWB', 'LM'],
      RB: ['CB', 'RWB', 'RM'],
      LWB: ['LB', 'LM', 'LW'],
      RWB: ['RB', 'RM', 'RW'],
      CDM: ['CM', 'CB'],
      CM: ['CDM', 'CAM'],
      CAM: ['CM', 'CF'],
      LM: ['LW', 'LB', 'LWB', 'CM'],
      RM: ['RW', 'RB', 'RWB', 'CM'],
      LW: ['LM', 'ST', 'CF'],
      RW: ['RM', 'ST', 'CF'],
      CF: ['ST', 'CAM', 'LW', 'RW'],
      ST: ['CF', 'LW', 'RW'],
    };

    const { data: playersWithoutSecondary } = await supabase
      .from('players')
      .select('id, specific_position, secondary_positions')
      .or('secondary_positions.is.null,and(specific_position.neq.GK)');

    if (playersWithoutSecondary && playersWithoutSecondary.length > 0) {
      const updates: Array<{id: string; secondary_positions: string[]}> = [];
      for (const p of playersWithoutSecondary) {
        if (p.specific_position === 'GK' || !p.specific_position) continue;
        if (p.secondary_positions && p.secondary_positions.length > 0) continue;

        const compatibles = COMPATIBLE[p.specific_position] || [];
        if (compatibles.length === 0) continue;

        const roll = Math.random();
        let secondaries: string[] = [];
        if (roll < 0.06 && compatibles.length >= 2) {
          secondaries = [...compatibles].sort(() => 0.5 - Math.random()).slice(0, 2);
        } else if (roll < 0.24) {
          secondaries = [compatibles[Math.floor(Math.random() * compatibles.length)]];
        }

        if (secondaries.length > 0) {
          updates.push({ id: p.id, secondary_positions: secondaries });
        }
      }

      // Batch update
      let updated = 0;
      for (const u of updates) {
        const { error: updateError } = await supabase
          .from('players')
          .update({ secondary_positions: u.secondary_positions })
          .eq('id', u.id);
        if (!updateError) updated++;
      }
      results.push(`Assigned secondary_positions to ${updated}/${updates.length} players`);
    } else {
      results.push('All non-GK players have secondary_positions');
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('[admin/migrate] Error:', error);
    return NextResponse.json({ error: error.message, results }, { status: 500 });
  }
}
