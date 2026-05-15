/**
 * formRatingService.ts - Oyuncu Form Puanı Hesaplama Servisi (ADIM 1B)
 *
 * Her oyuncunun son 5 maçındaki performans ortalamasını (gol, asist, pas isabeti,
 * top çalma, kurtarış) hesaplayıp form_rating (0-100) alanına yazar.
 * Günlük cron job tarafından çağrılır.
 */

import { Player, InjuryRecord } from './types';
import { getSupabase, isSupabaseConfigured } from '../supabase';

// ═══════════════════════════════════════════════════════════════
// FORM RATING HESAPLAMA
// ═══════════════════════════════════════════════════════════════

/**
 * Tek bir oyuncunun form_rating değerini hesaplar.
 *
 * @param player - Oyuncu verisi (match_ratings, position, injury dahil)
 * @param careerStats - Oyuncunun son maç istatistikleri (opsiyonel)
 * @returns 0-100 arası form_rating değeri
 *
 * @example
 * const rating = calculateFormRating(player, { goals: 2, assists: 1, pass_accuracy: 78, tackles: 5, saves: 0 });
 * // rating: 82
 */
export function calculateFormRating(
  player: Player,
  careerStats?: {
    goals?: number;
    assists?: number;
    pass_accuracy?: number;
    tackles?: number;
    saves?: number;
    matches_played?: number;
  }
): number {
  let formScore = 50; // Başlangıç değeri (ortalam form)

  // 1. match_ratings dizisi varsa, son 5 maçın ortalamasını al
  if (player.match_ratings && player.match_ratings.length > 0) {
    const lastFive = player.match_ratings.slice(-5);
    const avgRating = lastFive.reduce((sum, r) => sum + r, 0) / lastFive.length;
    // match_ratings 0-10 arası olabilir (6.5, 7.2 gibi) veya 0-100 arası
    // 0-10 skalasıysa 10 ile çarp, 0-100 skalasıysa direkt kullan
    const normalizedRating = avgRating <= 10 ? avgRating * 10 : avgRating;
    formScore = normalizedRating;
  }

  // 2. career_stats varsa bonus/ceza uygula
  if (careerStats) {
    const matchesPlayed = careerStats.matches_played || 1;

    // Gol bonusu: forvetler için daha yüksek etki
    const goalsPerMatch = (careerStats.goals || 0) / matchesPlayed;
    if (player.position === 'FWD' || player.position === 'MID') {
      if (goalsPerMatch >= 0.8) formScore += 8;
      else if (goalsPerMatch >= 0.5) formScore += 5;
      else if (goalsPerMatch >= 0.3) formScore += 2;
    } else {
      if (goalsPerMatch >= 0.3) formScore += 3;
    }

    // Asist bonusu
    const assistsPerMatch = (careerStats.assists || 0) / matchesPlayed;
    if (assistsPerMatch >= 0.5) formScore += 5;
    else if (assistsPerMatch >= 0.3) formScore += 3;

    // Pas isabeti bonusu
    if (careerStats.pass_accuracy !== undefined) {
      if (careerStats.pass_accuracy >= 85) formScore += 5;
      else if (careerStats.pass_accuracy >= 75) formScore += 3;
      else if (careerStats.pass_accuracy < 60) formScore -= 3;
    }

    // Top çalma bonusu (defansif oyuncular için)
    if (player.position === 'DEF' || player.position === 'GK') {
      const tacklesPerMatch = (careerStats.tackles || 0) / matchesPlayed;
      if (tacklesPerMatch >= 4) formScore += 5;
      else if (tacklesPerMatch >= 2) formScore += 2;
    }

    // Kurtarış bonusu (kaleciler için)
    if (player.position === 'GK' && careerStats.saves !== undefined) {
      const savesPerMatch = careerStats.saves / matchesPlayed;
      if (savesPerMatch >= 5) formScore += 8;
      else if (savesPerMatch >= 3) formScore += 4;
    }
  }

  // 3. Mevcut kondisyon (cond) etkisi
  if (player.cond < 50) formScore -= 10;
  else if (player.cond < 70) formScore -= 5;
  else if (player.cond >= 90) formScore += 3;

  // 4. Moral etkisi
  if (player.morale < 30) formScore -= 8;
  else if (player.morale < 50) formScore -= 4;
  else if (player.morale >= 80) formScore += 3;

  // 5. Sakatlık durumunda form düşüşü
  if (player.injury) {
    formScore -= 15;
  }

  // 0-100 aralığına sınırla
  return Math.max(0, Math.min(100, Math.round(formScore)));
}

// ═══════════════════════════════════════════════════════════════
// TOPLU FORM RATING GÜNCELLEME (CRON JOB İÇİN)
// ═══════════════════════════════════════════════════════════════

/**
 * Tüm oyuncuların form_rating değerlerini günceller.
 * Cron job tarafından günlük olarak çağrılır.
 *
 * @returns Güncellenen oyuncu sayısı ve hata listesi
 */
export async function updateAllFormRatings(): Promise<{
  updated: number;
  errors: string[];
}> {
  if (!isSupabaseConfigured()) {
    return { updated: 0, errors: ['Supabase not configured'] };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { updated: 0, errors: ['Supabase client is null'] };
  }
  const errors: string[] = [];
  let updated = 0;

  try {
    // 1. Tüm oyuncuları çek (batch halinde)
    const { data: allPlayers, error: playersError } = await supabase
      .from('players')
      .select('id, match_ratings, position, cond, form, morale, injury, injury_history, goalkeeping, defending, passing, shooting, speed, profile_id, team_name')
      .order('updated_at', { ascending: true });

    if (playersError) {
      console.error('[formRatingService] Error fetching players:', playersError);
      return { updated: 0, errors: [playersError.message] };
    }

    if (!allPlayers || allPlayers.length === 0) {
      return { updated: 0, errors: [] };
    }

    console.log(`[formRatingService] Processing ${allPlayers.length} players for form_rating update`);

    // 2. Son maç istatistiklerini player_career_stats'dan çek
    const { data: careerStats } = await supabase
      .from('player_career_stats')
      .select('player_id, goals, assists, matches_played')
      .order('created_at', { ascending: false });

    // careerStats'i player_id bazında map'le
    const statsMap = new Map<string, any>();
    if (careerStats) {
      for (const stat of careerStats) {
        if (!statsMap.has(stat.player_id)) {
          statsMap.set(stat.player_id, stat);
        }
      }
    }

    // 3. Her oyuncu için form_rating hesapla ve güncelle
    const updates: { id: string; form_rating: number }[] = [];

    for (const dbPlayer of allPlayers) {
      try {
        // DB'den gelen player'ı Player tipine dönüştür
        const player: Partial<Player> = {
          id: dbPlayer.id,
          position: dbPlayer.position,
          cond: dbPlayer.cond ?? dbPlayer.form ?? 75,
          form: dbPlayer.form ?? 50,
          morale: dbPlayer.morale ?? 60,
          injury: dbPlayer.injury
            ? (typeof dbPlayer.injury === 'string'
                ? JSON.parse(dbPlayer.injury)
                : dbPlayer.injury)
            : undefined,
          match_ratings: dbPlayer.match_ratings
            ? (typeof dbPlayer.match_ratings === 'string'
                ? JSON.parse(dbPlayer.match_ratings)
                : dbPlayer.match_ratings)
            : [],
          injury_history: dbPlayer.injury_history
            ? (typeof dbPlayer.injury_history === 'string'
                ? JSON.parse(dbPlayer.injury_history)
                : dbPlayer.injury_history)
            : [],
        };

        // Career stats'ı al
        const stats = statsMap.get(dbPlayer.id);

        const formRating = calculateFormRating(player as Player, stats ? {
          goals: stats.goals,
          assists: stats.assists,
          matches_played: stats.matches_played,
        } : undefined);

        updates.push({ id: dbPlayer.id, form_rating: formRating });
      } catch (err) {
        const errMsg = `Error calculating form_rating for player ${dbPlayer.id}: ${err}`;
        errors.push(errMsg);
        console.error(`[formRatingService] ${errMsg}`);
      }
    }

    // 4. Toplu güncelleme (batch upsert, 100'erli gruplar)
    for (let i = 0; i < updates.length; i += 100) {
      const batch = updates.slice(i, i + 100);
      try {
        const { error: updateError } = await supabase
          .from('players')
          .upsert(batch, { onConflict: 'id' });

        if (updateError) {
          errors.push(`Batch update error (offset ${i}): ${updateError.message}`);
          console.error(`[formRatingService] Batch update error:`, updateError);
        } else {
          updated += batch.length;
        }
      } catch (err) {
        errors.push(`Batch update exception (offset ${i}): ${err}`);
      }
    }

    console.log(`[formRatingService] Updated ${updated}/${allPlayers.length} players, ${errors.length} errors`);
  } catch (err) {
    const errMsg = `Fatal error in updateAllFormRatings: ${err}`;
    errors.push(errMsg);
    console.error(`[formRatingService] ${errMsg}`);
  }

  return { updated, errors };
}

// ═══════════════════════════════════════════════════════════════
// SAKATLIK GEÇMİŞİ YARDIMCI FONKSİYONLARI
// ═══════════════════════════════════════════════════════════════

/** Sakatlık tipleri ve olasılıkları */
const INJURY_TYPES = [
  'hamstring', 'ankle', 'knee', 'shoulder', 'back',
  'groin', 'calf', 'thigh', 'wrist', 'rib',
  'concussion', 'muscle_strain', 'ligament', 'tendinitis'
];

/**
 * Rastgele bir sakatlık kaydı oluşturur.
 *
 * @param durationDays - Sakatlık süresi (belirtilmezse 3-21 arası rastgele)
 * @returns InjuryRecord nesnesi
 */
export function generateInjuryRecord(durationDays?: number): InjuryRecord {
  return {
    date: new Date().toISOString().split('T')[0],
    duration_days: durationDays || (3 + Math.floor(Math.random() * 19)), // 3-21 gün
    type: INJURY_TYPES[Math.floor(Math.random() * INJURY_TYPES.length)],
  };
}

/**
 * Oyuncunun sakatlık geçmişine yeni bir kayıt ekler.
 *
 * @param injuryHistory - Mevcut sakatlık geçmişi
 * @param record - Eklenecek sakatlık kaydı
 * @returns Güncellenmiş sakatlık geçmişi
 */
export function addInjuryRecord(
  injuryHistory: InjuryRecord[] | undefined,
  record: InjuryRecord
): InjuryRecord[] {
  const history = injuryHistory || [];
  return [...history, record];
}

/**
 * Son N gün içindeki sakatlık sayısını döndürür.
 *
 * @param injuryHistory - Sakatlık geçmişi
 * @param days - Gün sayısı (varsayılan: 30)
 * @returns Belirtilen süre içindeki sakatlık sayısı
 */
export function countRecentInjuries(
  injuryHistory: InjuryRecord[] | undefined,
  days: number = 30
): number {
  if (!injuryHistory || injuryHistory.length === 0) return 0;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return injuryHistory.filter(record => {
    try {
      const recordDate = new Date(record.date);
      return recordDate >= cutoffDate;
    } catch {
      return false;
    }
  }).length;
}

/**
 * Eski sakatlık kayıtlarını temizler (1 yıldan eskileri siler).
 *
 * @param injuryHistory - Sakatlık geçmişi
 * @returns Temizlenmiş sakatlık geçmişi
 */
export function cleanupOldInjuryRecords(
  injuryHistory: InjuryRecord[] | undefined
): InjuryRecord[] {
  if (!injuryHistory || injuryHistory.length === 0) return [];

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return injuryHistory.filter(record => {
    try {
      return new Date(record.date) >= oneYearAgo;
    } catch {
      return false;
    }
  });
}
