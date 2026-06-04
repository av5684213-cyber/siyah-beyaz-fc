// ═══════════════════════════════════════════════════════════════════════
// TASARIM-1: Player Personalities & Agent Messages Engine
// Generates agent messages based on player conditions and handles responses
// ═══════════════════════════════════════════════════════════════════════

import type { Player, Profile } from './types';

// ─── Personality Interface ────────────────────────────────────────────
export interface PlayerPersonality {
  ambition: number;          // 1-20: desire for success and better club
  professionalism: number;  // 1-20: work ethic and attitude
  temperament: number;      // 1-20: emotional stability (lower = more volatile)
  loyalty: number;          // 1-20: attachment to current club
  pressure_handling: number; // 1-20: ability to cope with pressure
}

// ─── Agent Message Types ─────────────────────────────────────────────
export type AgentMessageType = 'playing_time' | 'contract' | 'transfer_interest' | 'relegation' | 'morale';
export type PlayerResponse = 'promise' | 'list_for_sale' | 'ignore' | 'call_meeting';

export interface AgentMessage {
  id: string;
  profile_id: string;
  player_id: string;
  player_name: string;
  message_type: AgentMessageType;
  message_text: string;
  player_response: PlayerResponse | null;
  is_read: boolean;
  created_at: string;
}

// ─── Message Generation Conditions ───────────────────────────────────

interface MessageGenerationContext {
  profile: Profile;
  squad: Player[];
  leaguePosition: number;
  currentWeek: number;
  totalTeamsInLeague: number;
}

/**
 * Weighted random value generator.
 * Produces values biased towards the `mid` point with a spread defined by `spread`.
 */
function weightedRandom(min: number, max: number, mid: number, spread: number): number {
  // Box-Muller transform for normal distribution approximation
  const u1 = Math.random();
  const u2 = Math.random();
  const normal = Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2);
  const value = mid + normal * spread;
  return Math.max(min, Math.min(max, Math.round(value)));
}

/**
 * Generates a random personality for a new player.
 * Values are weighted towards realistic distributions:
 * - ambition: 8-14 (most players are moderately ambitious)
 * - professionalism: 10-16 (most are professional)
 * - temperament: 6-12 (varies more)
 * - loyalty: 10-18 (most are loyal)
 * - pressure_handling: 8-15 (moderate)
 */
export function generateRandomPersonality(): PlayerPersonality {
  return {
    ambition: weightedRandom(1, 20, 11, 3.5),
    professionalism: weightedRandom(1, 20, 13, 3),
    temperament: weightedRandom(1, 20, 9, 3),
    loyalty: weightedRandom(1, 20, 14, 3.5),
    pressure_handling: weightedRandom(1, 20, 11.5, 3.2),
  };
}

/**
 * Gets personality from a player object (from DB personality JSONB column or generates default).
 */
export function getPlayerPersonality(player: Player): PlayerPersonality {
  const raw = (player as any).personality;
  if (raw && typeof raw === 'object' && raw.ambition !== undefined) {
    return raw as PlayerPersonality;
  }
  // Default personality based on existing traits
  const personalityTraits = player.personalityTraits || [];
  const ambitionBonus = personalityTraits.some(t =>
    ['Hırslı', 'Kazanan karakter', 'Baskı sever'].includes(t)
  ) ? 4 : 0;
  const professionalismBonus = personalityTraits.some(t =>
    ['Profesyonel', 'Disiplinli', 'Çalışkan'].includes(t)
  ) ? 5 : 0;
  const temperamentPenalty = personalityTraits.some(t =>
    ['Tembel', 'Disiplinsiz', 'Problem çıkaran', 'Egoist', 'Kibirli', 'Panikçi'].includes(t)
  ) ? 4 : 0;
  const loyaltyBonus = personalityTraits.some(t =>
    ['Sadık', 'Takım oyuncusu', 'Sessiz lider'].includes(t)
  ) ? 5 : 0;

  return {
    ambition: Math.min(20, 10 + ambitionBonus + Math.floor(Math.random() * 4)),
    professionalism: Math.min(20, 12 + professionalismBonus + Math.floor(Math.random() * 3)),
    temperament: Math.max(1, 10 - temperamentPenalty + Math.floor(Math.random() * 4)),
    loyalty: Math.min(20, 12 + loyaltyBonus + Math.floor(Math.random() * 3)),
    pressure_handling: 10 + Math.floor(Math.random() * 5),
  };
}

/**
 * Generates agent messages for a given profile based on squad conditions.
 * Returns an array of messages to be inserted into the database.
 */
export function generateAgentMessages(
  context: MessageGenerationContext
): { player_id: string; player_name: string; message_type: AgentMessageType; message_text: string }[] {
  const { profile, squad, leaguePosition, currentWeek, totalTeamsInLeague } = context;
  const messages: { player_id: string; player_name: string; message_type: AgentMessageType; message_text: string }[] = [];

  // Relegation zone: bottom 3 teams
  const relegationZoneStart = totalTeamsInLeague - 2; // bottom 3 positions
  const isRelegationZone = leaguePosition >= relegationZoneStart;
  // Top 3 check
  const isTop3 = leaguePosition <= 3;

  for (const player of squad) {
    const personality = getPlayerPersonality(player);
    const playerName = player.name;

    // ── Condition 1: Not in starting 11 for 4+ weeks ──
    const weeksNotStarted = (player as any).weeks_not_started || 0;
    if (weeksNotStarted >= 4) {
      // More ambitious and less loyal players complain sooner
      const complaintThreshold = Math.max(2, 6 - Math.floor(personality.ambition / 5) + Math.floor(personality.loyalty / 5));
      if (weeksNotStarted >= complaintThreshold) {
        // Don't generate duplicate messages — check professionalism
        if (personality.professionalism < 16 || personality.ambition > 12) {
          messages.push({
            player_id: player.id,
            player_name: playerName,
            message_type: 'playing_time',
            message_text: `Müvekkilim ${playerName} daha fazla süre istiyor. ${weeksNotStarted} haftadır ilk 11'de yer almıyor ve bu durumdan memnun değil.`,
          });
        }
      }
    }

    // ── Condition 2: Contract ending in 6 months (≈24 weeks) ──
    const contractEndWeek = player.contract_end_week || 0;
    const weeksRemaining = contractEndWeek - currentWeek;
    if (weeksRemaining > 0 && weeksRemaining <= 24) {
      // Only players with medium+ ambition or low loyalty push for contract
      if (personality.ambition >= 8 || personality.loyalty <= 12) {
        messages.push({
          player_id: player.id,
          player_name: playerName,
          message_type: 'contract',
          message_text: `Müvekkilim ${playerName} yeni sözleşme görüşmek istiyor. Mevcut sözleşmesi ${weeksRemaining} hafta sonra sona eriyor.`,
        });
      }
    }

    // ── Condition 3: Team in relegation zone ──
    if (isRelegationZone) {
      // High ambition or low loyalty players want to leave
      if (personality.ambition > 14 || personality.loyalty < 8) {
        messages.push({
          player_id: player.id,
          player_name: playerName,
          message_type: 'relegation',
          message_text: `Müvekkilim ${playerName} küme düşme durumunda ayrılmak istiyor. Takımın ligdeki durumu endişe verici.`,
        });
      } else if (personality.pressure_handling < 10) {
        // Low pressure handling = anxiety
        messages.push({
          player_id: player.id,
          player_name: playerName,
          message_type: 'relegation',
          message_text: `Müvekkilim ${playerName} küme düşme baskısı altında zorlanıyor. Durumun düzeltilmesi için acil önlem bekliyor.`,
        });
      }
    }

    // ── Condition 4: High ambition but team not in top 3 ──
    if (!isTop3 && personality.ambition > 15 && leaguePosition > 3) {
      // Only trigger if not already in relegation messages
      const alreadyHasRelegation = messages.some(
        m => m.player_id === player.id && m.message_type === 'relegation'
      );
      if (!alreadyHasRelegation) {
        messages.push({
          player_id: player.id,
          player_name: playerName,
          message_type: 'transfer_interest',
          message_text: `Müvekkilim ${playerName} daha iddialı bir takım arıyor. Şu anki lig pozisyonunuz hedeflerine uygun değil.`,
        });
      }
    }

    // ── Condition 5: Very low morale ──
    if (player.morale < 25) {
      const alreadyHasMessage = messages.some(m => m.player_id === player.id);
      if (!alreadyHasMessage) {
        messages.push({
          player_id: player.id,
          player_name: playerName,
          message_type: 'morale',
          message_text: `Müvekkilim ${playerName} çok düşük moralde. Durum düzelmezse takımdan ayrılmayı değerlendirecek.`,
        });
      }
    }
  }

  return messages;
}

/**
 * Processes a manager's response to an agent message and calculates
 * the effect on the player's morale and loyalty.
 *
 * Returns the morale and personality changes to apply.
 */
export function processAgentResponse(
  response: PlayerResponse,
  currentMorale: number,
  personality: PlayerPersonality
): { moraleChange: number; loyaltyChange: number; newMorale: number; followUpMessage?: string } {
  let moraleChange = 0;
  let loyaltyChange = 0;
  let followUpMessage: string | undefined;

  switch (response) {
    case 'promise':
      moraleChange = 5;
      loyaltyChange = 2;
      // Low professionalism players are skeptical
      if (personality.professionalism < 10) {
        moraleChange = 3; // Less相信d
      }
      break;

    case 'list_for_sale':
      moraleChange = -10;
      loyaltyChange = -5;
      // High professionalism players accept it better
      if (personality.professionalism > 15) {
        moraleChange = -6;
        loyaltyChange = -3;
      }
      break;

    case 'ignore':
      moraleChange = -3;
      loyaltyChange = -1;
      // Low temperament players react worse
      if (personality.temperament < 8) {
        moraleChange = -6;
        loyaltyChange = -3;
      }
      break;

    case 'call_meeting':
      moraleChange = 2;
      loyaltyChange = 1;
      // Creates a follow-up meeting message
      followUpMessage = 'Görüşme talebiniz alındı. Oyuncu ile yüz yüze görüşme ayarlanacak.';
      break;
  }

  const newMorale = Math.max(0, Math.min(100, currentMorale + moraleChange));

  return { moraleChange, loyaltyChange, newMorale, followUpMessage };
}

/**
 * Applies personality to a newly created player object.
 * Returns the player with personality field populated.
 */
export function applyPersonalityToPlayer<T extends Record<string, any>>(playerObj: T): T & { personality: PlayerPersonality } {
  const personality = generateRandomPersonality();
  return {
    ...playerObj,
    personality,
  };
}
