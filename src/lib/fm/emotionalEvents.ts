/**
 * lib/emotionalEvents.ts
 *
 * Duygusal katman — kritik anları tespit eden sistem.
 * Rekor, şampiyonluk, büyük transfer, kariyer dönüm noktaları gibi
 * olayları algılar ve EmotionalEvent objesi döner.
 */

import type { Player, Profile, MatchResult, MatchEvent } from './types';
import { playSound } from '@/utils/sound';

// ─── Duygusal Olay Tipleri ────────────────────────────────────────

export type EmotionalEventType =
  | 'RECORD_TOP_SCORER'
  | 'RECORD_TOP_ASSIST'
  | 'RECORD_MOST_APPEARANCES'
  | 'CHAMPION'
  | 'PROMOTION'
  | 'BIG_TRANSFER'
  | 'CAREER_FIRST_MATCH'
  | 'CAREER_FIRST_GOAL'
  | 'CAREER_FIRST_ASSIST'
  | 'CAREER_HAT_TRICK'
  | 'CAREER_CLEAN_SHEET'
  | 'LATE_WINNER'
  | 'UPSET_WIN'
  | 'DERBY_WIN'
  | 'RELEGATION_ESCAPE';

export type EmotionalSeverity = 'low' | 'medium' | 'high' | 'legendary';

export interface EmotionalEvent {
  type: EmotionalEventType;
  severity: EmotionalSeverity;
  title: string;
  description: string;
  icon: string;
  player?: string;
  teamName?: string;
  metadata?: Record<string, string | number>;
  timestamp: number;
}

// ─── Yardımcı Fonksiyonlar ────────────────────────────────────────

/**
 * Oyuncunun toplam gol sayısını hesaplar (goalStats veya match_ratings üzerinden).
 */
function getPlayerTotalGoals(player: Player): number {
  try {
    if (player.goalStats) {
      const gs = player.goalStats;
      return (gs.plase ?? 0) + (gs.header ?? 0) + (gs.head_right ?? 0) +
        (gs.head_left ?? 0) + (gs.one_touch ?? 0) + (gs.postup_turn ?? 0) +
        (gs.sprint_finish ?? 0) + (gs.long_shot ?? 0) + (gs.penalty ?? 0) +
        (gs.freekick ?? 0);
    }
    // Fallback: rating bazlı tahmin
    return player.shooting ? Math.floor(player.shooting / 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Oyuncunun maç sayısını tahmin eder (match_ratings dizisi uzunluğundan).
 */
function getPlayerMatchCount(player: Player): number {
  try {
    return player.match_ratings?.length ?? 0;
  } catch {
    return 0;
  }
}

function formatMoney(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M €`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K €`;
  }
  return `${amount} €`;
}

// ─── Rekor Kontrol Fonksiyonları ──────────────────────────────────

/**
 * Takımın en golcüsü kontrolü.
 * Oyuncuların goalStats toplamına göre sıralar.
 */
export function checkTopScorerRecord(
  players: Player[],
  profile: Profile
): EmotionalEvent | null {
  try {
    if (!players || players.length === 0 || !profile) return null;

    const withGoals = players.map(p => ({ player: p, goals: getPlayerTotalGoals(p) }));
    withGoals.sort((a, b) => b.goals - a.goals);

    const topScorer = withGoals[0];
    if (!topScorer || topScorer.goals < 5) return null;

    const secondBest = withGoals[1]?.goals ?? 0;
    if (topScorer.goals > secondBest && topScorer.goals >= 8) {
      return {
        type: 'RECORD_TOP_SCORER',
        severity: topScorer.goals >= 20 ? 'legendary' : 'high',
        title: 'GOL KRALI REKORU!',
        description: `${topScorer.player.name}, takımın en golcü oyuncusu oldu! ${topScorer.goals} gol ile tarihe geçti.`,
        icon: '👢',
        player: topScorer.player.name,
        teamName: profile.team_name,
        metadata: { goals: topScorer.goals },
        timestamp: Date.now(),
      };
    }

    return null;
  } catch (err) {
    console.error('[emotionalEvents] checkTopScorerRecord error:', err);
    return null;
  }
}

/**
 * En çok maç oynayan oyuncu rekoru.
 */
export function checkMostAppearances(
  players: Player[],
  profile: Profile
): EmotionalEvent | null {
  try {
    if (!players || players.length === 0 || !profile) return null;

    const withMatches = players.map(p => ({ player: p, matches: getPlayerMatchCount(p) }));
    withMatches.sort((a, b) => b.matches - a.matches);

    const topPlayer = withMatches[0];
    if (!topPlayer || topPlayer.matches < 10) return null;

    const secondBest = withMatches[1]?.matches ?? 0;
    if (topPlayer.matches > secondBest && topPlayer.matches >= 20) {
      return {
        type: 'RECORD_MOST_APPEARANCES',
        severity: topPlayer.matches >= 50 ? 'legendary' : 'medium',
        title: 'EN ÇOK MAÇ OYNAYAN!',
        description: `${topPlayer.player.name}, ${topPlayer.matches} maçla takımın en sadık oyuncusu! Efsanevi bir bağlılık!`,
        icon: '👕',
        player: topPlayer.player.name,
        teamName: profile.team_name,
        metadata: { matches: topPlayer.matches },
        timestamp: Date.now(),
      };
    }

    return null;
  } catch (err) {
    console.error('[emotionalEvents] checkMostAppearances error:', err);
    return null;
  }
}

/**
 * Şampiyonluk kontrolü — takım ligi birinci bitirdiğinde.
 */
export function checkChampion(
  leagueStandings: { points: number; name: string; is_user_team?: boolean }[],
  profile: Profile
): EmotionalEvent | null {
  try {
    if (!leagueStandings || leagueStandings.length === 0 || !profile) return null;

    const sorted = [...leagueStandings].sort((a, b) => b.points - a.points);
    const champion = sorted[0];

    if (champion && (champion.is_user_team || champion.name === profile.team_name)) {
      return {
        type: 'CHAMPION',
        severity: 'legendary',
        title: 'ŞAMPİYONLUK!',
        description: `${profile.team_name} ligi birinci bitirdi! Taraftarlar çıldırmış durumda! Bu unutulmaz bir an!`,
        icon: '🏆',
        teamName: profile.team_name,
        metadata: { points: champion.points },
        timestamp: Date.now(),
      };
    }

    return null;
  } catch (err) {
    console.error('[emotionalEvents] checkChampion error:', err);
    return null;
  }
}

/**
 * Büyük transfer — transfer ücreti 1.000.000 krediyi geçtiğinde.
 */
export function checkBigTransfer(
  transferFee: number,
  playerName: string,
  profile: Profile,
  threshold: number = 1_000_000
): EmotionalEvent | null {
  try {
    if (!transferFee || !playerName || !profile) return null;
    const THRESHOLD = threshold;

    if (transferFee >= THRESHOLD) {
      return {
        type: 'BIG_TRANSFER',
        severity: transferFee >= 5_000_000 ? 'legendary' : 'high',
        title: 'BÜYÜK TRANSFER!',
        description: `${playerName}, ${formatMoney(transferFee)} karşılığında takıma katıldı! Bu kulüp tarihinin en pahalı transferi!`,
        icon: '💰',
        player: playerName,
        teamName: profile.team_name,
        metadata: { fee: transferFee },
        timestamp: Date.now(),
      };
    }

    return null;
  } catch (err) {
    console.error('[emotionalEvents] checkBigTransfer error:', err);
    return null;
  }
}

/**
 * Kariyer dönüm noktaları — ilk gol, ilk asist, hat-trick.
 */
export function checkCareerMilestones(
  player: Player,
  matchResult: MatchResult
): EmotionalEvent[] {
  try {
    const events: EmotionalEvent[] = [];
    if (!player || !matchResult) return events;

    const playerStats = matchResult.playerStats?.[player.id];
    if (!playerStats) return events;

    // İlk gol (oyuncunun hiç goalStats'ı yoksa veya gol sayısı 0 ise)
    if ((playerStats.goals ?? 0) > 0) {
      const totalGoals = getPlayerTotalGoals(player);
      if (totalGoals <= (playerStats.goals ?? 0)) {
        events.push({
          type: 'CAREER_FIRST_GOAL',
          severity: 'high',
          title: 'İLK GOL!',
          description: `${player.name} kariyerinin ilk golünü attı! Bu anı hiç unutmayacak!`,
          icon: '⚽',
          player: player.name,
          metadata: { goals: playerStats.goals },
          timestamp: Date.now(),
        });
      }
    }

    // İlk asist
    if ((playerStats.assists ?? 0) > 0 && getPlayerMatchCount(player) <= 1) {
      events.push({
        type: 'CAREER_FIRST_ASSIST',
        severity: 'medium',
        title: 'İLK ASİST!',
        description: `${player.name} kariyerinin ilk asistini yaptı! Harika bir başlangıç!`,
        icon: '🅰️',
        player: player.name,
        metadata: { assists: playerStats.assists },
        timestamp: Date.now(),
      });
    }

    // Hat-trick
    if ((playerStats.goals ?? 0) >= 3) {
      events.push({
        type: 'CAREER_HAT_TRICK',
        severity: 'legendary',
        title: 'HAT-TRICK!',
        description: `${player.name} bir maçta 3 gol attı! Muhteşem bir performans!`,
        icon: '🎩',
        player: player.name,
        metadata: { goals: playerStats.goals },
        timestamp: Date.now(),
      });
    }

    return events;
  } catch (err) {
    console.error('[emotionalEvents] checkCareerMilestones error:', err);
    return [];
  }
}

/**
 * Maç olaylarından heyecanlı anları tespit eder.
 */
export function checkMatchDrama(
  matchResult: MatchResult,
  teamName: string
): EmotionalEvent[] {
  try {
    const events: EmotionalEvent[] = [];
    if (!matchResult || !matchResult.events) return events;

    // Son dakika golü (85+ dakikada gol ve galibiyet)
    const lateGoals = matchResult.events.filter(
      (e: MatchEvent) =>
        e.type === 'GOAL' && e.minute >= 85
    );

    for (const goal of lateGoals) {
      const isWinner =
        matchResult.score.home > matchResult.score.away
          ? goal.team === 'HOME'
          : matchResult.score.away > matchResult.score.home
          ? goal.team === 'AWAY'
          : false;

      if (isWinner) {
        events.push({
          type: 'LATE_WINNER',
          severity: 'legendary',
          title: 'SON DAKİKA GOLÜ!',
          description: `${goal.player ?? 'Bilinmeyen'}, ${goal.minute}. dakikada takıma galibiyeti getirdi! Tribünler çıldırdı!`,
          icon: '🔥',
          player: goal.player,
          teamName,
          metadata: { minute: goal.minute },
          timestamp: Date.now(),
        });
      }
    }

    return events;
  } catch (err) {
    console.error('[emotionalEvents] checkMatchDrama error:', err);
    return [];
  }
}

/**
 * Birden fazla kontrolü bir arade çalıştırır.
 */
export function detectEmotionalEvents(params: {
  players: Player[];
  profile: Profile;
  leagueStandings?: { points: number; name: string; is_user_team?: boolean }[];
  matchResult?: MatchResult;
  transferFee?: number;
  transferPlayerName?: string;
}): EmotionalEvent[] {
  try {
    const results: EmotionalEvent[] = [];
    const { players, profile, leagueStandings, matchResult, transferFee, transferPlayerName } = params;

    const scorerRecord = checkTopScorerRecord(players, profile);
    if (scorerRecord) results.push(scorerRecord);

    const appearanceRecord = checkMostAppearances(players, profile);
    if (appearanceRecord) results.push(appearanceRecord);

    if (leagueStandings) {
      const champion = checkChampion(leagueStandings, profile);
      if (champion) results.push(champion);
    }

    if (transferFee && transferPlayerName) {
      const bigTransfer = checkBigTransfer(transferFee, transferPlayerName, profile);
      if (bigTransfer) results.push(bigTransfer);
    }

    if (matchResult) {
      for (const player of players) {
        const milestones = checkCareerMilestones(player, matchResult);
        results.push(...milestones);
      }
      const drama = checkMatchDrama(matchResult, profile.team_name);
      results.push(...drama);
    }

    const severityOrder: Record<EmotionalSeverity, number> = {
      legendary: 3,
      high: 2,
      medium: 1,
      low: 0,
    };

    results.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

    return results;
  } catch (err) {
    console.error('[emotionalEvents] detectEmotionalEvents error:', err);
    return [];
  }
}

// ─── Duygusal Olay Event Emitter ──────────────────────────────────

type EmotionalEventHandler = (event: EmotionalEvent) => void;

const listeners: Set<EmotionalEventHandler> = new Set();

/**
 * Duygusal olay dinleyicisi ekle.
 */
export function onEmotionalEvent(handler: EmotionalEventHandler): () => void {
  listeners.add(handler);
  return () => {
    listeners.delete(handler);
  };
}

/**
 * Duygusal olay yayınla — tüm dinleyicilere bildir.
 */
export function emitEmotionalEvent(event: EmotionalEvent): void {
  try {
    for (const handler of listeners) {
      handler(event);
    }
    // Play sound effect based on event type
    try {
      if (event.type === 'CHAMPION') playSound('champion');
      else if (event.type === 'PROMOTION') playSound('applause');
      else if (event.type === 'BIG_TRANSFER') playSound('transfer');
      else if (event.type.startsWith('RECORD_')) playSound('record');
    } catch {}
  } catch (err) {
    console.error('[emotionalEvents] emitEmotionalEvent error:', err);
  }
}
