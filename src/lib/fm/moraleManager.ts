// =============================================================================
// Managerium — Moral ve Özgüven Yönetim Sistemi
// =============================================================================
// Maç sonuçlarına, bireysel performansa ve kulüp olaylarına göre
// oyuncuların moral ve özgüven değerlerini günceller.
// =============================================================================

import type { Player } from './types';

// ─── Moral Değişim Sabitleri ─────────────────────────────────────────────────
const MORALE_GAINS = {
  MATCH_WIN: 8,
  MATCH_DRAW: 2,
  MATCH_LOSS: -5,
  CONSECUTIVE_LOSSES_5: -20,     // 5 maç üst üste kayıp
  KEY_PLAYER_SOLD: -10,           // Kritik oyuncu satıldı
  GOAL_SCORED: 3,                 // Kişisel gol
  ASSIST_MADE: 2,                 // Kişisel asist
  CLEAN_SHEET_DEF: 4,             // Savunma oyuncusu gol yemedi
  RED_CARD: -8,                   // Kırmızı kart gördü
  INJURY: -5,                     // Sakatlık
  PROMOTION: 10,                  // Terfi
  RELEGATION: -15,                // Küme düşme
  NEW_SIGNING: 5,                 // Yeni transfer (takım arkadaşları için)
} as const;

const CONFIDENCE_GAINS = {
  HIGH_RATING: 6,                 // Rating 8.0+
  GOOD_RATING: 3,                 // Rating 7.0-7.9
  POOR_RATING: -4,                // Rating < 6.0
  VERY_POOR_RATING: -8,           // Rating < 5.0
  PENALTY_SCORED: 5,
  PENALTY_MISSED: -6,
  LATE_GOAL_CONCEDED: -3,
  COMEBACK_WIN: 5,                // Geriden gelip kazanma
} as const;

// ─── Maç Sonucu Tipi ─────────────────────────────────────────────────────────
export interface MatchOutcome {
  result: 'W' | 'D' | 'L';
  isHome: boolean;
  homeScore: number;
  awayScore: number;
  playerRatings: Record<string, number>;
  goalScorers: string[];          // Oyuncu ID'leri
  assisters: string[];
  redCarded: string[];
  injured: string[];
  consecutiveLosses?: number;
}

// ─── Moral Hesaplama ─────────────────────────────────────────────────────────
/**
 * Bir oyuncunun moral değerini maç sonucuna göre günceller.
 * @param player — Güncellenecek oyuncu
 * @param outcome — Maç sonucu detayları
 * @returns Yeni moral değeri (0-100 aralığında)
 */
export function calculateMoraleChange(player: Player, outcome: MatchOutcome): number {
  let delta = 0;

  // Maç sonucu etkisi
  if (outcome.result === 'W') delta += MORALE_GAINS.MATCH_WIN;
  else if (outcome.result === 'D') delta += MORALE_GAINS.MATCH_DRAW;
  else delta += MORALE_GAINS.MATCH_LOSS;

  // Üst üste kayıp cezası
  if (outcome.consecutiveLosses && outcome.consecutiveLosses >= 5 && outcome.result === 'L') {
    delta += MORALE_GAINS.CONSECUTIVE_LOSSES_5;
  }

  // Kişisel performans
  if (outcome.goalScorers.includes(player.id)) {
    delta += MORALE_GAINS.GOAL_SCORED;
  }
  if (outcome.assisters.includes(player.id)) {
    delta += MORALE_GAINS.ASSIST_MADE;
  }
  if (outcome.redCarded.includes(player.id)) {
    delta += MORALE_GAINS.RED_CARD;
  }
  if (outcome.injured.includes(player.id)) {
    delta += MORALE_GAINS.INJURY;
  }

  // Kaleci ve savunma için clean sheet bonus
  if (outcome.result !== 'L') {
    const oppScore = outcome.isHome ? outcome.awayScore : outcome.homeScore;
    if (oppScore === 0 && (player.position === 'GK' || player.position === 'DEF')) {
      delta += MORALE_GAINS.CLEAN_SHEET_DEF;
    }
  }

  // Geriden gelip kazanma
  if (outcome.result === 'W') {
    const myScore = outcome.isHome ? outcome.homeScore : outcome.awayScore;
    const oppScore = outcome.isHome ? outcome.awayScore : outcome.homeScore;
    // İlk yarı gerideydi mi bilmiyoruz ama ikinci yarı gol çoksa bonus
    if (myScore >= 3) delta += 2;
  }

  return clampMorale(player.morale + delta);
}

// ─── Özgüven Hesaplama ──────────────────────────────────────────────────────
/**
 * Bir oyuncunun özgüven değerini maç rating'ine göre günceller.
 * @param player — Güncellenecek oyuncu
 * @param matchRating — Maçtaki rating (1-10 arası)
 * @returns Yeni özgüven değeri (0-100 aralığında)
 */
export function calculateConfidenceChange(player: Player, matchRating: number): number {
  let delta = 0;

  if (matchRating >= 8.0) delta += CONFIDENCE_GAINS.HIGH_RATING;
  else if (matchRating >= 7.0) delta += CONFIDENCE_GAINS.GOOD_RATING;
  else if (matchRating < 5.0) delta += CONFIDENCE_GAINS.VERY_POOR_RATING;
  else if (matchRating < 6.0) delta += CONFIDENCE_GAINS.POOR_RATING;

  return clampConfidence(player.confidence + delta);
}

// ─── Toplu Güncelleme ───────────────────────────────────────────────────────
export interface MoraleUpdateResult {
  playerId: string;
  morale: number;
  confidence: number;
  moraleDelta: number;
  confidenceDelta: number;
  needsNotification: boolean;     // Moral 20'nin altına düştü
}

/**
 * Tüm kadro için moral ve özgüven güncellemelerini hesaplar.
 * Supabase'e yazmak için hazır results döner.
 */
export function calculateTeamMoraleUpdates(
  squad: Player[],
  outcome: MatchOutcome
): MoraleUpdateResult[] {
  return squad.map(player => {
    const newMorale = calculateMoraleChange(player, outcome);
    const rating = outcome.playerRatings[player.id] || 6.0;
    const newConfidence = calculateConfidenceChange(player, rating);

    return {
      playerId: player.id,
      morale: newMorale,
      confidence: newConfidence,
      moraleDelta: newMorale - player.morale,
      confidenceDelta: newConfidence - player.confidence,
      needsNotification: newMorale < 20 && player.morale >= 20,
    };
  });
}

// ─── Bildirim Metni ─────────────────────────────────────────────────────────
export function getMoraleNotificationText(moraleUpdates: MoraleUpdateResult[]): string | null {
  const lowMoraleCount = moraleUpdates.filter(u => u.morale < 20).length;
  if (lowMoraleCount >= 3) {
    return 'Soyunma odasında huzursuzluk var! Oyuncularınız motive değil. Birkaç oyuncunun moralı çok düşük.';
  }
  if (lowMoraleCount >= 1) {
    return 'Bazı oyuncuların moralı tehlike seviyesinde. Motivasyon çalışmalarına ağırlık verin.';
  }
  return null;
}

// ─── Supabase'e Yazma ───────────────────────────────────────────────────────
export async function saveMoraleUpdates(
  updates: MoraleUpdateResult[],
  supabase: any
): Promise<{ saved: number; failed: number }> {
  let saved = 0;
  let failed = 0;

  for (const update of updates) {
    try {
      const { error } = await supabase
        .from('players')
        .update({
          morale: update.morale,
          confidence: update.confidence,
        })
        .eq('id', update.playerId);

      if (error) failed++;
      else saved++;
    } catch {
      failed++;
    }
  }

  return { saved, failed };
}

// ─── Yardımcılar ────────────────────────────────────────────────────────────
function clampMorale(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
