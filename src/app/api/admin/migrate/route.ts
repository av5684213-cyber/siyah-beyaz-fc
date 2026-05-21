import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmxbyaamwbpnvgbnjbmo.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI';

/**
 * Admin migration endpoint - applies database schema changes & data fixes
 * Protected by CRON_SECRET header
 * 
 * Bu endpoint:
 * 1. Eksik kolonları tespit eder (specific_position, secondary_positions, loan kolonları)
 * 2. Mevcut oyunculara specific_position atar
 * 3. Yan mevkileri (secondary_positions) atar
 * 4. loans tablosunun varlığını kontrol eder
 * 5. Eksik tabloları/kolonları bildirir
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== 'siyah-beyaz-fc-cron-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const results: string[] = [];
  const warnings: string[] = [];
  const missingColumns: string[] = [];

  try {
    // ═══════════════════════════════════════════════════════════════
    // ADIM 1: Kolon varlığını kontrol et
    // ═══════════════════════════════════════════════════════════════
    
    const columnsToCheck = [
      'specific_position', 'secondary_positions',
      'is_on_loan_market', 'loan_fee', 'loan_status', 'loan_end_date',
      'loaned_to_profile_id', 'loan_owner_profile_id',
    ];

    for (const col of columnsToCheck) {
      try {
        const { error } = await supabase
          .from('players')
          .select(col)
          .limit(1);
        
        if (error && (error.message?.includes('does not exist') || error.code === '42703')) {
          missingColumns.push(col);
          warnings.push(`❌ players.${col} kolonu mevcut değil — supabase-migration.sql çalıştırın`);
        }
      } catch {
        missingColumns.push(col);
      }
    }

    if (missingColumns.length > 0) {
      results.push(`⚠️ ${missingColumns.length} eksik kolon tespit edildi: ${missingColumns.join(', ')}`);
      results.push('→ Lütfen supabase-migration.sql dosyasını Supabase SQL Editor\'de çalıştırın');
    } else {
      results.push('✅ Tüm gerekli kolonlar mevcut');
    }

    // ═══════════════════════════════════════════════════════════════
    // ADIM 2: loans tablosu kontrolü
    // ═══════════════════════════════════════════════════════════════
    
    try {
      const { error: loansError } = await supabase.from('loans').select('id').limit(1);
      if (loansError && (loansError.code === '42P01' || loansError.message?.includes('does not exist'))) {
        warnings.push('❌ loans tablosu mevcut değil — supabase-migration.sql çalıştırın');
        results.push('⚠️ loans tablosu mevcut değil');
      } else {
        results.push('✅ loans tablosu mevcut');
      }
    } catch {
      warnings.push('❌ loans tablosu kontrol edilemedi');
    }

    // ═══════════════════════════════════════════════════════════════
    // ADIM 3: specific_position'ı olmayan oyuncuları düzelt
    // (Sadece kolon mevcutsa)
    // ═══════════════════════════════════════════════════════════════
    
    if (!missingColumns.includes('specific_position')) {
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
        results.push(`✅ ${fixed}/${badPlayers.length} oyuncuya specific_position atandı`);
      } else {
        results.push('✅ Tüm oyuncuların specific_position mevcut');
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // ADIM 4: secondary_positions'ı olmayan oyunculara ata
    // (Sadece kolon mevcutsa)
    // ═══════════════════════════════════════════════════════════════
    
    if (!missingColumns.includes('secondary_positions') && !missingColumns.includes('specific_position')) {
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
        .or('secondary_positions.is.null,and(specific_position.neq.GK)')
        .limit(500);

      if (playersWithoutSecondary && playersWithoutSecondary.length > 0) {
        const updates: Array<{id: string; secondary_positions: string[]}> = [];
        for (const p of playersWithoutSecondary) {
          if (p.specific_position === 'GK' || !p.specific_position) continue;
          if (p.secondary_positions && (p.secondary_positions as any[]).length > 0) continue;

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

        let updated = 0;
        for (const u of updates) {
          const { error: updateError } = await supabase
            .from('players')
            .update({ secondary_positions: u.secondary_positions })
            .eq('id', u.id);
          if (!updateError) updated++;
        }
        results.push(`✅ ${updated}/${updates.length} oyuncuya secondary_positions atandı`);
      } else {
        results.push('✅ Tüm GK-olmayan oyuncuların secondary_positions mevcut');
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // ADIM 5: is_on_loan_market varsayılan değerleri
    // ═══════════════════════════════════════════════════════════════
    
    if (!missingColumns.includes('is_on_loan_market')) {
      const { data: nullLoanPlayers } = await supabase
        .from('players')
        .select('id')
        .is('is_on_loan_market', null)
        .limit(500);

      if (nullLoanPlayers && nullLoanPlayers.length > 0) {
        const { error: bulkUpdateError } = await supabase
          .from('players')
          .update({ is_on_loan_market: false, loan_fee: 0 })
          .is('is_on_loan_market', null);

        if (!bulkUpdateError) {
          results.push(`✅ ${nullLoanPlayers.length} oyuncunun is_on_loan_market=false olarak ayarlandı`);
        }
      } else {
        results.push('✅ Tüm oyuncuların is_on_loan_market değeri mevcut');
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // ADIM 6: positions tablosu (referans tablo)
    // ═══════════════════════════════════════════════════════════════
    
    const { data: existingPositions, error: posCheckError } = await supabase
      .from('positions')
      .select('code')
      .limit(1);

    if (posCheckError && (posCheckError.code === '42P01' || posCheckError.message?.includes('does not exist'))) {
      warnings.push('❌ positions tablosu mevcut değil — supabase-migration.sql çalıştırın');
    } else if (!posCheckError) {
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
        results.push(`✅ positions tablosu güncellendi (${positionData.length} pozisyon)`);
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // SONUÇ RAPORU
    // ═══════════════════════════════════════════════════════════════

    return NextResponse.json({
      success: true,
      results,
      warnings,
      missingColumns,
      actionRequired: missingColumns.length > 0
        ? `supabase-migration.sql dosyasını Supabase Dashboard → SQL Editor'de çalıştırın. ${missingColumns.length} eksik kolon var.`
        : null,
    });
  } catch (error: any) {
    console.error('[admin/migrate] Error:', error);
    return NextResponse.json({ error: error.message, results, warnings }, { status: 500 });
  }
}
