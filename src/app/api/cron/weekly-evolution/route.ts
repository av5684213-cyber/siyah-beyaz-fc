/**
 * Cron Job: Haftalık Oyuncu Evrimi (Weekly Evolution)
 *
 * Her hafta Pazar gecesi 23:55'te çalışır.
 * Tüm oyuncuların son 5 maç rating ortalamasını kullanarak evrim uygular.
 * Maç oynamayan oyunculara nötr (6.0) performans verilir — ne bonus ne ceza.
 *
 * KATMAN 2: update-player-ovr bu cron'a birleştirildi.
 * Antrenman katılımı, koç yıldızı ve tesis seviyesi farmingMult'a eklenir.
 *
 * Akış:
 * 1. Tüm oyuncuları Supabase'den çek
 * 2. Training_attendances, training_state, user_facilities çek
 * 3. Her oyuncu için match_ratings ortalamasını hesapla
 * 4. farmingMult = training + coach + facility hesapla
 * 5. UpdatePlayerStats ile evrim uygula (farmingMult + personality traits dahil)
 * 6. processDailyUpdates ile form/moral/kondisyon güncelle
 * 7. Değişen oyuncuları Supabase'e kaydet (TÜM sub-statlar dahil)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
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
    form_rating: (dbPlayer.form_rating as number) ?? undefined,
    match_ratings: safeJsonParse<number[]>(dbPlayer.match_ratings, []),
    traits: safeJsonParse<string[]>(dbPlayer.traits, []),
    personalityTraits: safeJsonParse<string[]>(dbPlayer.personality_traits, []),
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
  if (false) // CRON_SECRET disabled //.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Vercel Hobby plan: günde 1 kez çalışır — sadece Pazar işle
  const dayOfWeek = new Date().getUTCDay(); // 0=Pazar
  if (dayOfWeek !== 0) {
    return NextResponse.json({ message: `Haftalık evrim sadece Pazar uygulanır (bugün: ${['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'][dayOfWeek]})`, skipped: true });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    console.log('[cron/weekly-evolution] Starting weekly player evolution (v3 — merged with update-player-ovr)...');

    // ═══════════════════════════════════════════════════════════
    // KATMAN 2.1: Training attendance, koç yıldızı, tesis seviyesi çek
    // (update-player-ovr'dan taşındı)
    // ═══════════════════════════════════════════════════════════

    // 1) Training attendance sayısını çek (son 7 gün)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const attendanceByPlayer: Record<string, number> = {};
    try {
      const { data: attendances } = await supabase
        .from('training_attendances')
        .select('player_id')
        .gte('training_date', sevenDaysAgo);

      if (attendances) {
        for (const a of attendances) {
          attendanceByPlayer[a.player_id as string] = (attendanceByPlayer[a.player_id as string] || 0) + 1;
        }
        console.log(`[weekly-evolution] Training attendances: ${attendances.length} records for ${Object.keys(attendanceByPlayer).length} players`);
      }
    } catch (attErr) {
      console.warn('[weekly-evolution] training_attendances fetch failed:', attErr);
    }

    // 2) Profil bazlı koç yıldızı çek
    const coachStarsByProfile: Record<string, number> = {};
    try {
      const { data: trainingStates } = await supabase
        .from('training_state')
        .select('id, state');  // O4: coaching kolonu yok, state JSONB'den oku

      if (trainingStates) {
        for (const ts of trainingStates) {
          const state = typeof (ts as any).state === 'string'
            ? JSON.parse((ts as any).state) : (ts as any).state;
          // state.coachQuality: 1.0-5.0 arası olabilir, veya stars direkt
          const coachQuality = state?.coachQuality || state?.stars || null;
          const stars = coachQuality
            ? Math.round(Number(coachQuality) * (Number(coachQuality) < 6 ? 1 : 0.4))
            : 1;
          coachStarsByProfile[ts.id] = Math.min(5, Math.max(1, stars));
        }
        console.log(`[weekly-evolution] Coach stars loaded for ${Object.keys(coachStarsByProfile).length} profiles (from state JSONB)`);
      }
    } catch (tsErr) {
      console.warn('[weekly-evolution] training_state fetch failed:', tsErr);
      // Fallback: profiles tablosundan staff_coaches kullan
      try {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, staff_coaches');
        if (profilesData) {
          for (const pr of profilesData) {
            coachStarsByProfile[pr.id] = Math.min(5, Math.max(1, (pr.staff_coaches || 1)));
          }
          console.log(`[weekly-evolution] Coach stars fallback (staff_coaches) for ${Object.keys(coachStarsByProfile).length} profiles`);
        }
      } catch {}
    }

    // B2: Analist yıldızı → farmingMult bonusu
    const analystStarsByProfile: Record<string, number> = {};
    try {
      const { data: analystStaff } = await supabase
        .from('staff')
        .select('profile_id, stars')
        .eq('type', 'analyst');
      for (const s of analystStaff || []) {
        if (s.profile_id) {
          analystStarsByProfile[s.profile_id] = Math.max(
            analystStarsByProfile[s.profile_id] || 0,
            s.stars || 0
          );
        }
      }
    } catch (analystErr) {
      console.warn('[weekly-evolution] Analyst fetch failed:', analystErr);
    }

    // ── Mentor bonusları (player_mentors tablosundan) ──────────────────────
    const mentorBonusByMentee: Record<string, number> = {};
    try {
      const { data: mentorRows } = await supabase
        .from('player_mentors')
        .select('mentee_id, bonus_rate');
      for (const row of mentorRows || []) {
        if (row.mentee_id) {
          mentorBonusByMentee[row.mentee_id] = Number(row.bonus_rate) || 0.20;
        }
      }
      console.log(`[weekly-evolution] Mentor: ${Object.keys(mentorBonusByMentee).length} mentee bulundu`);
    } catch (mentorErr) {
      console.warn('[weekly-evolution] Mentor fetch hatası:', mentorErr);
    }

    // 3) Profil bazlı tesis (training_ground) seviyesi çek
    const facilityByProfile: Record<string, number> = {};
    try {
      const { data: userFacilities } = await supabase
        .from('user_facilities')
        .select('profile_id, facility_type, current_level');

      if (userFacilities) {
        for (const f of userFacilities) {
          if (f.facility_type === 'training_ground') {
            facilityByProfile[f.profile_id] = f.current_level || 0;
          }
        }
        console.log(`[weekly-evolution] Training ground levels loaded for ${Object.keys(facilityByProfile).length} profiles`);
      }
    } catch (facErr) {
      console.warn('[weekly-evolution] user_facilities fetch failed:', facErr);
      // Fallback: stadium_upgrades'dan training seviyesi
      try {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, stadium_upgrades');
        if (profilesData) {
          for (const pr of profilesData) {
            const upgrades = typeof pr.stadium_upgrades === 'string'
              ? JSON.parse(pr.stadium_upgrades || '{}')
              : (pr.stadium_upgrades || {});
            facilityByProfile[pr.id] = upgrades['training'] || upgrades['training_ground'] || 0;
          }
          console.log(`[weekly-evolution] Training ground fallback (stadium_upgrades) for ${Object.keys(facilityByProfile).length} profiles`);
        }
      } catch {}
    }

    // 4) profile_id → player_id eşlemesi için (player'ların profile_id'sine ihtiyacımız var)
    // Bu bilgi zaten allPlayers sorgusunda geliyor

    // [BUG-13] Bonus training multiplier — envanterden kullanılan training_boost item'ı
    // bonus_training_multiplier sütununa 2.0 yazar, 7 gün sonra expires.
    // farmingMult'a çarpan olarak eklenir (sadece aktif ise).
    const bonusTrainingMultByProfile: Record<string, number> = {};
    try {
      const { data: profileBoosts } = await supabase
        .from('profiles')
        .select('id, bonus_training_multiplier, bonus_training_expires')
        .not('bonus_training_multiplier', 'is', null);
      if (profileBoosts) {
        const now = new Date();
        for (const pr of profileBoosts) {
          const mult = Number(pr.bonus_training_multiplier) || 1.0;
          const expires = pr.bonus_training_expires ? new Date(pr.bonus_training_expires) : null;
          // Sadece aktif boost'lar (mult > 1 ve expires yok veya gelecekte)
          if (mult > 1.0 && (!expires || expires > now)) {
            bonusTrainingMultByProfile[pr.id] = mult;
          }
        }
        console.log(`[weekly-evolution] Bonus training multiplier active for ${Object.keys(bonusTrainingMultByProfile).length} profiles`);
      }
    } catch (boostErr) {
      console.warn('[weekly-evolution] bonus_training_multiplier fetch failed:', boostErr);
    }

    // ═══════════════════════════════════════════════════════════
    // 1. Tüm oyuncuları çek (batch halinde)
    // ═══════════════════════════════════════════════════════════
    const { data: allPlayers, error: playersError } = await supabase
      .from('players')
      .select('id,profile_id,team_name,name,position,specific_position,rating,potential,hidden_potential,age,market_value,salary,nation,club,defending,passing,shooting,speed,power,goalkeeping,heading,control,vision,stamina,cond,form,morale,confidence,match_ratings,traits,trait_levels,style_levels,play_style,personality_traits,is_retiring,is_legend,injury,preferred_foot,form_rating,updated_at')
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
      // KATMAN 3.1: Eksik sub-statlar eklendi
      shooting: number;
      defending: number;
      control: number;
      heading: number;
      vision: number;
      stamina: number;
      goalkeeping: number;
      power: number;
      is_retiring?: boolean;
      cond: number;
    }[] = [];

    let highGrowth = 0;
    let lowGrowth = 0;
    let noMatch = 0;

    for (const dbPlayer of allPlayers) {
      try {
        const player = mapDbPlayerToPlayer(dbPlayer);
        const profileId = (dbPlayer as any).profile_id as string | undefined;

        // Performans hesapla: son 5 maç rating ortalaması
        const matchRatings = player.match_ratings || [];
        let performance: number;

        if (matchRatings.length > 0) {
          performance = matchRatings.reduce((sum, r) => sum + r, 0) / matchRatings.length;
          if (performance >= 7.0) highGrowth++;
          else lowGrowth++;
        } else if (player.team_name && player.team_name.trim() !== '' && player.team_name !== 'Transfer Listesi') {
          // Takıma ait oyuncu ama match_ratings yazılamamış.
          // KATMAN 2.2: Default 3.0 → 6.0 (nötr, ne bonus ne ceza)
          performance = Math.max(5.5, (player.form_rating || player.form || 65) / 10);
          lowGrowth++;
        } else {
          // Gerçekten takımı olmayan / serbest oyuncu — nötr
          performance = 6.0;
          noMatch++;
        }

        // ═══════════════════════════════════════════════════════════
        // KATMAN 2.3: farmingMult hesapla (training + koç + tesis)
        // ═══════════════════════════════════════════════════════════
        const trainCount = attendanceByPlayer[player.id] || 0;
        const coachStars = coachStarsByProfile[profileId || ''] || 1;
        const facilityLevel = facilityByProfile[profileId || ''] || 0;

        // Antrenman bonusu: her seans +0.1, max +0.4 (4 seans)
        const trainingBonus = Math.min(0.4, trainCount * 0.1);
        // Koç yıldızı bonusu: 5 yıldız → +25%
        const coachBonus = coachStars * 0.05;
        // Tesis bonusu: seviye 5 → +15%
        const facilityBonus = facilityLevel * 0.03;

        const analystBonus = (analystStarsByProfile[profileId || ''] || 0) * 0.04; // 5 yıldız → +%20
        const mentorBonus = mentorBonusByMentee[player.id] || 0;
        // [BUG-13] Envanter training_boost item'ı — çarpan olarak uygula
        const bonusTrainingMult = bonusTrainingMultByProfile[profileId || ''] || 1.0;
        const farmingMult = (1.0 + trainingBonus + coachBonus + facilityBonus + analystBonus + mentorBonus) * bonusTrainingMult;
        // Örnek: 5 yıldız koç + mentor = +25% + 20-30% ek gelişim
        // + training_boost item = 2x çarpan → toplam 2.5x-2.6x gelişim

        // Evrim uygula (farmingMult dahil → UpdatePlayerStats içinde personality traits de hesaplanır)
        let evolved = UpdatePlayerStats(player, performance, farmingMult);

        // ═══════════════════════════════════════════════════════════
        // POZİSYONA ÖZEL SUB-STAT BÜYÜME BONUSU (v2 — detaylı)
        // Her pozisyon için ana stat'lar artar, alakasız stat'lar durur
        // ═══════════════════════════════════════════════════════════
        if (performance > 6.0) {
          const gain = (performance - 6.0) * 0.015 * farmingMult;
          const pos = (player.position || '').toUpperCase();
          if (pos === 'GK') {
            evolved.goalkeeping = Math.min(99, (evolved.goalkeeping || 1) + gain * 2.5);
            evolved.defending = Math.min(99, (evolved.defending || 50) + gain * 0.5);
          } else if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEF'].includes(pos)) {
            evolved.defending = Math.min(99, (evolved.defending || 50) + gain * 2.0);
            evolved.heading = Math.min(99, (evolved.heading || 50) + gain * 1.0);
            evolved.power = Math.min(99, (evolved.power || 50) + gain * 0.8);
            evolved.passing = Math.min(99, (evolved.passing || 50) + gain * 0.5);
          } else if (['CDM', 'CM', 'CAM', 'LM', 'RM', 'MID'].includes(pos)) {
            evolved.passing = Math.min(99, (evolved.passing || 50) + gain * 2.0);
            evolved.vision = Math.min(99, (evolved.vision || 50) + gain * 1.5);
            evolved.control = Math.min(99, (evolved.control || 50) + gain * 1.0);
            evolved.stamina = Math.min(99, (evolved.stamina || 50) + gain * 0.8);
            evolved.shooting = Math.min(99, (evolved.shooting || 50) + gain * 0.5);
          } else if (['ST', 'CF', 'LW', 'RW', 'FWD'].includes(pos)) {
            evolved.shooting = Math.min(99, (evolved.shooting || 50) + gain * 2.5);
            evolved.speed = Math.min(99, (evolved.speed || 50) + gain * 1.5);
            evolved.control = Math.min(99, (evolved.control || 50) + gain * 0.8);
          }
        }

        // processDailyUpdates ile form/moral/kondisyon güncelle
        const [dailyUpdated] = processDailyUpdates([evolved]);
        evolved = dailyUpdated;

        // Rating değişimini logla
        const ratingDiff = evolved.rating - player.rating;

        // KATMAN 3.1: TÜM sub-statları updates'e ekle
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
          match_ratings: matchRatings,
          // KATMAN 3.1: Eksik sub-statlar
          shooting: evolved.shooting,
          defending: evolved.defending,
          control: evolved.control || 50,
          heading: evolved.heading || 50,
          vision: evolved.vision || 50,
          stamina: evolved.stamina || 50,
          goalkeeping: evolved.goalkeeping || 1,
          power: evolved.power,
          is_retiring: evolved.is_retiring || undefined,
          cond: Math.min(100, evolved.cond ?? 80),
        });

        if (Math.abs(ratingDiff) > 0.5) {
          console.log(`[weekly-evolution] ${player.name}: ${player.rating.toFixed(1)} → ${evolved.rating.toFixed(1)} (perf: ${performance.toFixed(1)}, farmingMult: ${farmingMult.toFixed(2)}, Δ: ${ratingDiff.toFixed(2)})`);
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
