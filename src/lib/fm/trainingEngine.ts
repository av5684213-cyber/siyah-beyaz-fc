import { Player, TrainingState, TrainingSessionResult } from './types';
import { TRAINING_PROGRAMS } from './constants';

export const TRAINING_GROUND_XP_MULTIPLIER_BASE = 1.0;
export const TRAINING_GROUND_XP_MULTIPLIER_PER_LEVEL = 0.1;

export function getTrainingGroundMultiplier(trainingGroundLevel: number): number {
  return TRAINING_GROUND_XP_MULTIPLIER_BASE + trainingGroundLevel * TRAINING_GROUND_XP_MULTIPLIER_PER_LEVEL;
}

// ─── Pozisyon uyumluluk kontrolü ─────────────────────────────────────────────
export function isProgramCompatible(player: Player, programId: string): boolean {
  const program = TRAINING_PROGRAMS.find(p => p.id === programId);
  if (!program) return false;
  const allowed = program.allowedPositions;
  if (allowed === 'ALL') return true;
  if (allowed === 'GK')    return player.position === 'GK';
  if (allowed === 'FIELD') return player.position !== 'GK';
  if (Array.isArray(allowed)) return allowed.includes(player.position);
  return true;
}

// ─── Oyuncunun pozisyonuna göre önerilen program ─────────────────────────────
export function getRecommendedProgram(player: Player): string {
  if (player.position === 'GK') return 'kaleci_antrenmani';
  if (player.position === 'DEF') return 'savunma_okulu';
  if (player.position === 'MID') return 'teknik_driller';
  return 'bitiricilik_kampi';
}

export const runTrainingSession = (squad: Player[], state: TrainingState, multiplier: number = 1.0, options?: { trainingFacilityLevel?: number }) => {
  const results: Record<string, TrainingSessionResult> = {};

  // ── Mentor etkisi: Takımda Mentor trait'li oyuncu varsa 24 yaş altı oyuncular bonus alır ──
  const hasMentor = squad.some(p =>
    p.personalityTraits?.includes('Mentor') ||
    p.personalityTraits?.includes('mentor')
  );

  const updatedSquad = squad.map(player => {
    const assignment = state.assignments.find(a => a.playerId === player.id);
    if (!assignment) return player;

    const program = TRAINING_PROGRAMS.find(p => p.id === assignment.programId);
    if (!program) return player;

    // ── Pozisyon kısıtlaması ────────────────────────────────────────────────
    if (!isProgramCompatible(player, assignment.programId)) {
      results[player.id] = {
        statsGained: {},
        traitsGained: [],
        injuryRisk: false,
        staminaLost: 0,
        message: `${player.name} bu antrenman programına uygun değil (pozisyon: ${player.position}).`,
        skipped: true,
      } as any;
      return player;
    }

    // ── Sakatlık kontrolü ──────────────────────────────────────────────────
    if (player.injury && player.injury.remaining_days > 0) {
      const condGain = assignment.programId === 'kondisyon_toparlanma' ? 15 : 5;
      results[player.id] = {
        statsGained: {},
        traitsGained: [],
        injuryRisk: false,
        staminaLost: -condGain,
        message: 'Sakat. Aktif toparlanma modunda.',
      } as any;
      return { ...player, cond: Math.min(100, (player.cond || 100) + condGain) };
    }

    // ── Kondisyon & Toparlanma programı ───────────────────────────────────
    if (assignment.programId === 'kondisyon_toparlanma') {
      const condGain = 20;
      results[player.id] = {
        statsGained: {},
        traitsGained: [],
        injuryRisk: false,
        staminaLost: -condGain,
        message: `+${condGain} kondisyon. Aktif toparlanma.`,
      } as any;
      return {
        ...player,
        cond: Math.min(100, (player.cond || 100) + condGain),
        isResting: false,
      };
    }

    // ── Dinlenme ──────────────────────────────────────────────────────────
    if (player.isResting) {
      results[player.id] = {
        statsGained: {},
        traitsGained: [],
        injuryRisk: false,
        staminaLost: -20,
      } as any;
      return {
        ...player,
        cond: Math.min(100, (player.cond || 100) + 20),
        isResting: false,
      };
    }

    // ── Temel çarpanlar ───────────────────────────────────────────────────
    const intensityFactor = (program.intensity ?? 70) / 100;
    const coachFactor     = state.coachQuality ?? 1.0;
    const ageFactor       = player.age <= 21 ? 1.5 : player.age >= 30 ? 0.75 : 1.0;

    // Kişilik özellikleri
    let personalityFactor = 1.0;
    if (player.personalityTraits) {
      if (player.personalityTraits.includes('Profesyonel'))      personalityFactor *= 1.25;
      if (player.personalityTraits.includes('Antrenman yıldızı')) personalityFactor *= 1.5;
      if (player.personalityTraits.includes('Tembel'))           personalityFactor *= 0.75;
      if (player.personalityTraits.includes('Çalışkan'))         personalityFactor *= 1.2;
      if (player.personalityTraits.includes('Disiplinsiz'))      personalityFactor *= 0.9;
    }

    // Mentor etkisi: 24 yaş altı oyuncular için %25 gelişim bonusu
    if (hasMentor && player.age <= 24) {
      personalityFactor *= 1.25;
    }

    // ── Antrenman tesisi çarpanı ──
    // Seviye başına +0.1 (1.0 başlangıç, level 10 → 2.0)
    let facilityMult = 1.0;
    if (options?.trainingFacilityLevel && options.trainingFacilityLevel > 0) {
      facilityMult = 1.0 + options.trainingFacilityLevel * 0.1;
    }

    // ── Stat kazanımları ─────────────────────────────────────────────────
    const statsGained: Record<string, number> = {};
    const baseStats = [...(program.targetStats as unknown as string[])];
    if (assignment.focusedStat) baseStats.push(assignment.focusedStat as string);
    const allUniqueStats = Array.from(new Set(baseStats.filter(Boolean)));

    allUniqueStats.forEach(stat => {
      const currentVal = (player as any)[stat] ?? 50;
      const potential  = player.potential ?? 75;
      let gain: number;

      if (assignment.focusedStat === stat) {
        // Odaklanılan stat: potansiyele doğru açığın %10'u
        const gap = Math.max(0, potential - currentVal);
        gain = gap * 0.1 * coachFactor * ageFactor * personalityFactor * multiplier * facilityMult;
      } else {
        // Genel stat: rastgele küçük kazanım, stat ne kadar yüksekse o kadar yavaş
        const ceilingFactor = Math.max(0.05, (100 - currentVal) / 100);
        gain = (Math.random() * 0.15) * intensityFactor * coachFactor * ageFactor * personalityFactor * multiplier * ceilingFactor * facilityMult;
      }

      // Potansiyel tavanı
      const maxStat = Math.min(99, potential + 5);
      if (currentVal < maxStat) {
        statsGained[stat] = Math.max(0, gain);
      }
    });

    // ── Özel program etkileri ─────────────────────────────────────────────
    const specialEffect = (program as any).specialEffect;
    let moralGain = 0;
    let chemGain  = 0;

    if (specialEffect === 'chemistry_boost') {
      // Takım kimyası: moral +5, chemistry +3
      moralGain = 5;
      chemGain  = 3;
    }

    // ── Sakatlık riski ────────────────────────────────────────────────────
    // Yüksek yoğunluk + düşük kondisyon + yüksek antrenman yoğunluğu = risk
    const cond = player.cond ?? 100;
    const intensitySliderFactor = (coachFactor - 1.0) * 0.5; // coachQuality 0.5-2.0 → -0.25 to +0.50
    const baseRisk = intensityFactor * 0.03 + Math.max(0, intensitySliderFactor * 0.04);
    const condPenalty = cond < 40 ? 0.08 : cond < 60 ? 0.03 : 0;
    const injuryRisk = Math.random() < (baseRisk + condPenalty);

    // ── Kondisyon değişimi ────────────────────────────────────────────────
    const condChange = program.condCost ?? -8; // negatif = kayıp, pozitif = kazanç

    results[player.id] = {
      statsGained,
      traitsGained: [],
      injuryRisk,
      staminaLost: condChange,
    } as TrainingSessionResult;

    // ── Oyuncuyu güncelle ─────────────────────────────────────────────────
    const updated = { ...player } as any;
    Object.entries(statsGained).forEach(([stat, gain]) => {
      const cur = updated[stat] ?? 50;
      updated[stat] = Math.min(99, cur + gain);
    });

    // Rating etkisi (küçük)
    const totalGain = Object.values(statsGained).reduce((a, b) => a + b, 0);
    updated.rating    = Math.min(player.potential ?? 75, updated.rating + totalGain / 10);
    updated.cond      = Math.min(100, Math.max(0, cond + condChange));
    updated.morale    = Math.min(100, (updated.morale ?? 70) + moralGain);
    updated.chemistry = Math.min(100, (updated.chemistry ?? 70) + chemGain);
    updated.isResting = false;

    return updated as Player;
  });

  return { updatedSquad, results };
};

// ═══════════════════════════════════════════════════
//  ANTRENMAN SONUÇLARINI SUPABASE'E KAYDET
// ═══════════════════════════════════════════════════

/**
 * Antrenman sonucu hesaplanan stat artışlarını Supabase players tablosunda
 * kalıcı olarak günceller. Her antrenman seansı sonunda çağrılır.
 * Ayrıca trainings tablosuna seans kaydı ve training_attendances tablosuna
 * bireysel katılım kaydı ekler.
 */
export async function saveTrainingResults(
  results: Record<string, TrainingSessionResult>,
  updatedSquad: Player[],
  profileId: string,
  sessionType: 'morning' | 'afternoon' = 'morning',
  teamName: string = '',
): Promise<{ saved: number; errors: string[] }> {
  const errors: string[] = [];
  let saved = 0;

  try {
    const { getSupabase } = await import('@/lib/supabase');
    const supabase = getSupabase();
    if (!supabase) return { saved: 0, errors: ['Supabase not configured'] };

    // ── Katılan oyuncu ID'lerini topla ──
    const participatingPlayerIds: string[] = [];
    const playerResults: { player_id: string; player_name: string; position: string; stats_gained: Record<string, number>; cond_change: number; morale_change: number }[] = [];
    let totalCondChange = 0;
    let totalMoraleChange = 0;

    // Sadece stat kazancı olan oyuncuları güncelle
    for (const player of updatedSquad) {
      const result = results[player.id];
      if (!result || !result.statsGained || Object.keys(result.statsGained).length === 0) continue;

      participatingPlayerIds.push(player.id);
      const condChange = result.staminaLost || 0;
      const moraleChange = 0; // morale change tracking not in result
      totalCondChange += condChange;
      totalMoraleChange += moraleChange;

      playerResults.push({
        player_id: player.id,
        player_name: player.name,
        position: player.position,
        stats_gained: result.statsGained,
        cond_change: condChange,
        morale_change: moraleChange,
      });

      // DB'deki güncel değerleri oku (race condition önleme)
      const { data: currentData } = await supabase
        .from('players')
        .select('id, shooting, passing, defending, speed, power, heading, goalkeeping, control, vision, rating, cond, morale, form_rating')
        .eq('id', player.id)
        .single();

      if (!currentData) {
        errors.push(`Player ${player.id} not found in DB`);
        continue;
      }

      // Stat artışlarını mevcut DB değerlerine uygula
      const updates: Record<string, number> = {};
      const statToColumn: Record<string, string> = {
        'shooting': 'shooting', 'passing': 'passing', 'defending': 'defending',
        'speed': 'speed', 'power': 'power', 'heading': 'heading',
        'goalkeeping': 'goalkeeping', 'control': 'control', 'vision': 'vision',
        'finishing': 'finishing', 'dribbling': 'dribbling', 'first_touch': 'first_touch',
        'crossing': 'crossing', 'marking': 'marking', 'tackling': 'tackling',
        'technique': 'technique', 'long_shots': 'long_shots',
        'acceleration': 'acceleration', 'agility': 'agility', 'balance': 'balance',
        'strength': 'strength', 'stamina': 'stamina',
      };

      for (const [stat, gain] of Object.entries(result.statsGained)) {
        const column = statToColumn[stat];
        if (column && gain > 0) {
          const currentVal = (currentData as Record<string, unknown>)[column] as number ?? 50;
          updates[column] = Math.min(99, Math.round(currentVal + gain));
        }
      }

      // Kondisyon ve moral güncelle
      if (player.cond !== undefined) updates['cond'] = Math.round(player.cond);
      if (player.morale !== undefined) updates['morale'] = Math.round(player.morale);

      // Rating güncelle (küçük artış)
      const totalGain = Object.values(result.statsGained).reduce((a, b) => a + b, 0);
      if (totalGain > 0 && currentData.rating) {
        updates['rating'] = Math.min(99, Math.round((currentData.rating as number) + totalGain / 10));
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('players')
          .update(updates)
          .eq('id', player.id);

        if (error) {
          errors.push(`Update error for ${player.id}: ${error.message}`);
        } else {
          saved++;
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // ANTRENMAN KAYITLARINI SUPABASE'E YAZ
    // ═══════════════════════════════════════════════════════════

    // 1. trainings tablosuna seans kaydı ekle (player_ids dahil)
    if (participatingPlayerIds.length > 0 && profileId) {
      try {
        const trainingTime = sessionType === 'morning' ? '15:00' : '21:00';
        const trainingDate = new Date().toISOString().split('T')[0];
        const avgCond = participatingPlayerIds.length > 0 ? Math.round(totalCondChange / participatingPlayerIds.length * 10) / 10 : 0;
        const avgMorale = participatingPlayerIds.length > 0 ? Math.round(totalMoraleChange / participatingPlayerIds.length * 10) / 10 : 0;

        const { error: trainingErr } = await supabase
          .from('trainings')
          .insert({
            profile_id: profileId,
            team_name: teamName,
            session_type: sessionType,
            training_date: trainingDate,
            training_time: trainingTime,
            player_results: JSON.stringify(playerResults),
            player_ids: participatingPlayerIds,
            avg_cond_change: avgCond,
            avg_morale_change: avgMorale,
            total_players: participatingPlayerIds.length,
          });

        if (trainingErr) {
          console.warn('[saveTrainingResults] Training record insert error:', trainingErr.message);
        } else {
          console.log(`[saveTrainingResults] Training record saved: ${sessionType} session, ${participatingPlayerIds.length} players`);
        }
      } catch (trainingInsertErr) {
        console.warn('[saveTrainingResults] Training record insert exception:', trainingInsertErr);
      }

      // 2. training_attendances tablosuna bireysel katılım kayıtları ekle
      try {
        const attendanceRecords = participatingPlayerIds.map(playerId => ({
          player_id: playerId,
          profile_id: profileId,
          training_date: new Date().toISOString().split('T')[0],
          training_type: sessionType,
        }));

        const { error: attErr } = await supabase
          .from('training_attendances')
          .insert(attendanceRecords);

        if (attErr) {
          console.warn('[saveTrainingResults] Attendance insert error (table may not exist yet):', attErr.message);
        } else {
          console.log(`[saveTrainingResults] Attendance records saved for ${attendanceRecords.length} players`);
        }
      } catch (attInsertErr) {
        console.warn('[saveTrainingResults] Attendance insert exception:', attInsertErr);
      }
    }
  } catch (err) {
    errors.push(`Exception: ${String(err)}`);
  }

  return { saved, errors };
}

export const tryMatchTraitGrowth = (player: Player, performance: number) => {
  return { ...player };
};
