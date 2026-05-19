// =============================================================================
// Siyah Beyaz FC — Bot Actions Module (TypeScript Migration)
// =============================================================================
// Migration of python/bot_actions.py v2
// Smart bot AI: personality-based transfers, position-balanced squad management,
// difficulty-based behavior, weekly transfer limits, opponent-aware formations.
// =============================================================================

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type BotPersonalityKey = 'youth_developer' | 'star_chaser' | 'bargain_hunter' | 'balanced_builder';
export type PositionGroup = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface BotPersonality {
  name: string;
  description: string;
  preferredAgeMax: number;
  potentialWeight: number;
  ratingWeight: number;
  priceTolerance: number;
  sellOldPlayers: boolean;
  sellAgeThreshold: number;
}

export interface DifficultyConfig {
  transferBudgetRatio: number;
  sellThresholdRating: number;
  buyRatingBoost: number;
  maxSquadSize: number;
  minSquadSize: number;
  sellChance: number;
  buyChance: number;
  maxWeeklyTransfers: number;
  youthInvestmentRatio: number;
  tacticChangeChance: number;
  description: string;
}

export interface BotTransferResult {
  bought: boolean;
  sold: boolean;
  details: string[];
  errors: string[];
  transferCount: number;
  maxWeekly: number;
  personality: BotPersonalityKey;
}

export interface BotSquadResult {
  starting: string[];
  subs: string[];
  formation: string;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MIN_PER_POSITION_GROUP = 2;
const SURPLUS_THRESHOLD = 3;
const MAX_WEEKLY_TRANSFERS = 2;

const IDEAL_SQUAD_DISTRIBUTION: Record<PositionGroup, number> = { GK: 2, DEF: 6, MID: 6, FWD: 5 };

const POSITION_GROUPS: Record<string, PositionGroup> = {
  GK: 'GK',
  CB: 'DEF', LB: 'DEF', RB: 'DEF', LWB: 'DEF', RWB: 'DEF',
  CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID',
  LW: 'FWD', RW: 'FWD', CF: 'FWD', ST: 'FWD',
};

const FORMATIONS: Record<string, Record<PositionGroup, number>> = {
  '4-4-2': { GK: 1, DEF: 4, MID: 4, FWD: 2 },
  '4-3-3': { GK: 1, DEF: 4, MID: 3, FWD: 3 },
  '4-5-1': { GK: 1, DEF: 4, MID: 5, FWD: 1 },
  '3-4-3': { GK: 1, DEF: 3, MID: 4, FWD: 3 },
  '5-4-1': { GK: 1, DEF: 5, MID: 4, FWD: 1 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DIFFICULTY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const DIFFICULTY_CONFIG: Record<number, DifficultyConfig> = {
  1: {
    transferBudgetRatio: 0.0,
    sellThresholdRating: 45,
    buyRatingBoost: 0,
    maxSquadSize: 22,
    minSquadSize: 16,
    sellChance: 0.0,
    buyChance: 0.0,
    maxWeeklyTransfers: 0,
    youthInvestmentRatio: 0.0,
    tacticChangeChance: 0.0,
    description: 'Kolay bot: Sadece kadro seçimi yapar, transfer yapmaz',
  },
  2: {
    transferBudgetRatio: 0.20,
    sellThresholdRating: 50,
    buyRatingBoost: 2,
    maxSquadSize: 22,
    minSquadSize: 16,
    sellChance: 0.25,
    buyChance: 0.35,
    maxWeeklyTransfers: 1,
    youthInvestmentRatio: 0.10,
    tacticChangeChance: 0.30,
    description: 'Orta bot: Haftada 1 transfer yapar, bütçeye dikkat eder',
  },
  3: {
    transferBudgetRatio: 0.35,
    sellThresholdRating: 55,
    buyRatingBoost: 5,
    maxSquadSize: 22,
    minSquadSize: 16,
    sellChance: 0.35,
    buyChance: 0.50,
    maxWeeklyTransfers: 2,
    youthInvestmentRatio: 0.25,
    tacticChangeChance: 0.70,
    description: 'Zor bot: Aktif transfer yapar, taktik değiştirir, gençlere yatırım yapar',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// BOT PERSONALITY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

export const BOT_PERSONALITIES: Record<BotPersonalityKey, BotPersonality> = {
  youth_developer: {
    name: 'Genç Yetenek Avcısı',
    description: 'Genç ve yüksek potansiyelli oyunculara yatırım yapar',
    preferredAgeMax: 22,
    potentialWeight: 2.5,
    ratingWeight: 0.8,
    priceTolerance: 1.3,
    sellOldPlayers: true,
    sellAgeThreshold: 30,
  },
  star_chaser: {
    name: 'Yıldız Oyuncu Takipçisi',
    description: 'Yüksek OVR\'li yıldız oyuncuları takip eder',
    preferredAgeMax: 30,
    potentialWeight: 0.5,
    ratingWeight: 2.0,
    priceTolerance: 1.5,
    sellOldPlayers: false,
    sellAgeThreshold: 34,
  },
  bargain_hunter: {
    name: 'Fırsat Avcısı',
    description: 'Ucuz ve değerli oyuncuları bulur',
    preferredAgeMax: 28,
    potentialWeight: 1.2,
    ratingWeight: 1.0,
    priceTolerance: 0.8,
    sellOldPlayers: true,
    sellAgeThreshold: 29,
  },
  balanced_builder: {
    name: 'Dengeli Kurucu',
    description: 'Dengeli bir kadro kurar, yaş/potansiyel/rating dengesine bakar',
    preferredAgeMax: 26,
    potentialWeight: 1.0,
    ratingWeight: 1.0,
    priceTolerance: 1.0,
    sellOldPlayers: true,
    sellAgeThreshold: 32,
  },
};

const PERSONALITY_WEIGHTS: Record<BotPersonalityKey, number> = {
  youth_developer: 3,
  star_chaser: 2,
  bargain_hunter: 3,
  balanced_builder: 2,
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function mapToGroup(position: string): PositionGroup {
  return POSITION_GROUPS[position] || 'MID';
}

function getRandomPrice(rating: number, difficulty: number): number {
  const base = Math.max(500_000, rating * 80_000);
  const variance = base * (0.8 + Math.random() * 0.4);
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.1;
  return Math.round(variance * difficultyMultiplier);
}

/**
 * Assign a bot personality based on difficulty level.
 */
export function assignBotPersonality(difficulty: number): BotPersonalityKey {
  if (difficulty === 1) return 'balanced_builder';
  
  if (difficulty === 2) {
    const roll = Math.random();
    if (roll < 0.40) return 'youth_developer';
    if (roll < 0.70) return 'bargain_hunter';
    return 'balanced_builder';
  }

  // Difficulty 3: weighted random
  const keys = Object.keys(PERSONALITY_WEIGHTS) as BotPersonalityKey[];
  const weights = keys.map(k => PERSONALITY_WEIGHTS[k]);
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < keys.length; i++) {
    r -= weights[i];
    if (r <= 0) return keys[i];
  }
  return 'balanced_builder';
}

/**
 * Evaluate a player's transfer score based on bot personality.
 * Higher score = more desirable player for this personality.
 */
export function evaluatePlayerForPersonality(
  playerData: Record<string, unknown>,
  personalityKey: BotPersonalityKey
): number {
  const personality = BOT_PERSONALITIES[personalityKey] || BOT_PERSONALITIES.balanced_builder;
  const rating = (playerData.rating as number) || 50;
  const potential = (playerData.potential as number) || rating;
  const age = (playerData.age as number) || 25;

  let score = rating * personality.ratingWeight + potential * personality.potentialWeight;

  if (age <= personality.preferredAgeMax) {
    score += (personality.preferredAgeMax - age) * 2;
  } else {
    score -= (age - personality.preferredAgeMax) * 3;
  }

  if (personalityKey === 'youth_developer' && age <= 22) {
    score += potential * 0.5;
  }

  return score;
}

/**
 * Get position needs for a squad.
 */
function getPositionNeeds(squad: Array<Record<string, unknown>>): Record<PositionGroup, number> {
  const current: Record<PositionGroup, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const p of squad) {
    const group = mapToGroup((p.position as string) || 'CM');
    current[group] = (current[group] || 0) + 1;
  }

  const needs: Record<PositionGroup, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const pos of Object.keys(IDEAL_SQUAD_DISTRIBUTION) as PositionGroup[]) {
    const minRequired = Math.max(MIN_PER_POSITION_GROUP, IDEAL_SQUAD_DISTRIBUTION[pos]);
    needs[pos] = Math.max(0, minRequired - (current[pos] || 0));
  }
  return needs;
}

/**
 * Get surplus positions (3+ same position → weakest are candidates for sale).
 */
function getSurplusPositions(squad: Array<Record<string, unknown>>): Record<string, Array<Record<string, unknown>>> {
  const grouped: Record<string, Array<Record<string, unknown>>> = {};
  for (const p of squad) {
    const group = mapToGroup((p.position as string) || 'CM');
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(p);
  }

  const surplus: Record<string, Array<Record<string, unknown>>> = {};
  for (const [group, players] of Object.entries(grouped)) {
    if (players.length >= SURPLUS_THRESHOLD) {
      const sorted = [...players].sort((a, b) => ((a.rating as number) || 0) - ((b.rating as number) || 0));
      const excessCount = players.length - MIN_PER_POSITION_GROUP;
      if (excessCount > 0) {
        surplus[group] = sorted.slice(0, excessCount);
      }
    }
  }
  return surplus;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOT TRANSFER PROCESSING (v2 — Smart Transfers with Personality)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Process bot transfers with personality-based decision making.
 * Matches python/bot_actions.py v2 logic.
 *
 * Rules:
 *   1. Easy bots (difficulty 1) do no transfers
 *   2. Sell: surplus positions (3+ same position → sell weakest) + personality-based old player sales
 *   3. Buy: missing positions prioritized, personality-based player evaluation
 *   4. Weekly transfer limit: difficulty-based (0/1/2)
 *   5. Price strategy: urgent sell (0.8x) or profitable sell (1.2x)
 */
export async function processBotTransfers(botUserId: string): Promise<BotTransferResult> {
  const result: BotTransferResult = {
    bought: false,
    sold: false,
    details: [],
    errors: [],
    transferCount: 0,
    maxWeekly: 0,
    personality: 'balanced_builder',
  };

  if (!isSupabaseConfigured()) {
    result.errors.push('Supabase not configured');
    return result;
  }

  const supabase = getSupabase();
  if (!supabase) {
    result.errors.push('No Supabase client');
    return result;
  }

  try {
    // 1. Fetch bot profile
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', botUserId);

    if (profError || !profiles || profiles.length === 0) {
      result.errors.push('Bot profili bulunamadı');
      return result;
    }

    const profile = profiles[0] as Record<string, unknown>;
    if (!profile.is_bot) {
      result.errors.push('Bu kullanıcı bir bot değil');
      return result;
    }

    const difficulty = (profile.bot_difficulty as number) || 1;
    const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[1];
    const teamName = (profile.team_name as string) || 'Bot Takımı';
    const money = (profile.money as number) || 0;

    // Assign personality
    const personalityKey = ((profile.bot_personality as BotPersonalityKey) || assignBotPersonality(difficulty));
    const personality = BOT_PERSONALITIES[personalityKey] || BOT_PERSONALITIES.balanced_builder;
    result.personality = personalityKey;
    result.maxWeekly = config.maxWeeklyTransfers;

    // Easy bots don't do transfers
    if (difficulty === 1) {
      result.details.push(`Kolay bot: Transfer yapılmıyor (${personality.name})`);
      return result;
    }

    // 2. Fetch bot's squad
    const { data: squad, error: squadError } = await supabase
      .from('players')
      .select('*')
      .eq('profile_id', botUserId);

    if (squadError || !squad) {
      result.errors.push('Kadro bulunamadı');
      return result;
    }

    // ── SELLING (Personality-based + Surplus) ──
    const surplus = getSurplusPositions(squad as Array<Record<string, unknown>>);

    // Personality-based: sell old players
    if (personality.sellOldPlayers && result.transferCount < config.maxWeeklyTransfers) {
      const oldPlayers = (squad as Array<Record<string, unknown>>)
        .filter(p => ((p.age as number) || 25) >= personality.sellAgeThreshold)
        .sort((a, b) => ((b.age as number) || 25) - ((a.age as number) || 25) || ((a.rating as number) || 0) - ((b.rating as number) || 0));

      if (oldPlayers.length > 0) {
        const sellCandidate = oldPlayers[0];
        const sellGroup = mapToGroup((sellCandidate.position as string) || 'CM');
        const alreadyInSurplus = (surplus[sellGroup] || []).some(p => p.id === sellCandidate.id);
        if (!alreadyInSurplus) {
          if (!surplus[sellGroup]) surplus[sellGroup] = [];
          surplus[sellGroup].push(sellCandidate);
        }
      }
    }

    if (Object.keys(surplus).length > 0 && result.transferCount < config.maxWeeklyTransfers) {
      const surplusGroups = Object.keys(surplus);
      const selectedGroup = surplusGroups[Math.floor(Math.random() * surplusGroups.length)];
      const candidates = surplus[selectedGroup];

      if (candidates && candidates.length > 0 && Math.random() < config.sellChance) {
        const sellPlayer = candidates[0];
        const playerCurrentPrice = (sellPlayer.current_price as number) || (sellPlayer.market_value as number) || 0;

        // Price strategy: urgent (0.8x) or profitable (1.2x)
        let sellPrice: number;
        let priceStrategy: string;
        if (playerCurrentPrice > 0) {
          if (Math.random() < 0.5) {
            sellPrice = Math.round(playerCurrentPrice * 0.8);
            priceStrategy = 'acil satış (0.8x)';
          } else {
            sellPrice = Math.round(playerCurrentPrice * 1.2);
            priceStrategy = 'karlı satış (1.2x)';
          }
        } else {
          sellPrice = getRandomPrice((sellPlayer.rating as number) || 30, difficulty);
          priceStrategy = 'varsayılan fiyat';
        }
        sellPrice = Math.max(100, sellPrice);

        try {
          await supabase.from('transfer_market').insert({
            player_id: sellPlayer.id,
            player_data: JSON.stringify(sellPlayer),
            seller_id: botUserId,
            seller_name: teamName,
            price: sellPrice,
            min_price: Math.round(sellPrice * 0.7),
            max_price: Math.round(sellPrice * 1.5),
            is_active: true,
            is_auction: true,
            starting_price: sellPrice,
            reserve_price: Math.round(sellPrice * 0.7),
            bid_count: 0,
            expires_at: new Date().toISOString(),
          });

          await supabase.from('players').delete().eq('id', sellPlayer.id);
          await supabase.from('profiles').update({ money: money + sellPrice }).eq('id', botUserId);

          result.transferCount++;
          result.sold = true;
          result.details.push(
            `Satıldı: ${sellPlayer.name || '?'} (OVR ${sellPlayer.rating || 0}, ${selectedGroup}) → ${sellPrice.toLocaleString()} € [${priceStrategy}]`
          );
        } catch (err) {
          result.errors.push(`Satış hatası: ${err}`);
        }
      }
    }

    // ── BUYING (Personality-based evaluation) ──
    if (result.transferCount < config.maxWeeklyTransfers && Math.random() < config.buyChance) {
      const needs = getPositionNeeds(squad as Array<Record<string, unknown>>);
      const neededPositions = (Object.entries(needs) as [PositionGroup, number][])
        .filter(([, count]) => count > 0)
        .map(([pos]) => pos);

      const budget = money * config.transferBudgetRatio;
      const effectiveBudget = budget * personality.priceTolerance;

      if (neededPositions.length > 0) {
        try {
          const { data: listings } = await supabase
            .from('transfer_market')
            .select('*')
            .eq('is_active', true);

          if (listings && listings.length > 0) {
            const otherListings = listings.filter((l: Record<string, unknown>) => l.seller_id !== botUserId);
            const affordable = otherListings.filter((l: Record<string, unknown>) => (l.price as number) <= effectiveBudget);

            if (affordable.length > 0) {
              // Try to find needed-position players with personality evaluation
              let target: Record<string, unknown> | null = null;
              let targetPlayerData: Record<string, unknown> | null = null;

              const matching: Array<{ listing: Record<string, unknown>; playerData: Record<string, unknown>; score: number }> = [];

              for (const l of affordable) {
                let playerData = l.player_data as Record<string, unknown>;
                if (typeof playerData === 'string') {
                  try { playerData = JSON.parse(playerData); } catch { continue; }
                }
                if (!playerData || typeof playerData !== 'object') continue;

                const pos = (playerData.position as string) || '';
                const group = mapToGroup(pos);
                if (neededPositions.includes(group)) {
                  const score = evaluatePlayerForPersonality(playerData, personalityKey);
                  matching.push({ listing: l, playerData, score });
                }
              }

              if (matching.length > 0) {
                matching.sort((a, b) => b.score - a.score);
                target = matching[0].listing;
                targetPlayerData = matching[0].playerData;
              } else {
                // Fall back to highest OVR in budget
                const allWithData: Array<{ listing: Record<string, unknown>; playerData: Record<string, unknown> }> = [];
                for (const l of affordable) {
                  let pd = l.player_data as Record<string, unknown>;
                  if (typeof pd === 'string') {
                    try { pd = JSON.parse(pd); } catch { continue; }
                  }
                  if (pd && typeof pd === 'object') allWithData.push({ listing: l, playerData: pd });
                }
                if (allWithData.length > 0) {
                  allWithData.sort((a, b) => ((b.playerData.rating as number) || 0) - ((a.playerData.rating as number) || 0));
                  target = allWithData[0].listing;
                  targetPlayerData = allWithData[0].playerData;
                }
              }

              if (target) {
                const buyPrice = (target.price as number) || 0;
                if (buyPrice <= budget) {
                  await supabase.from('profiles').update({ money: Math.max(0, money - buyPrice) }).eq('id', botUserId);
                  await supabase.from('players').update({
                    profile_id: botUserId,
                    team_name: teamName,
                  }).eq('id', target.player_id);
                  await supabase.from('transfer_market').update({ is_active: false }).eq('id', target.id);

                  // Credit seller
                  const sellerId = target.seller_id as string;
                  if (sellerId) {
                    try {
                      const { data: sellerProfiles } = await supabase
                        .from('profiles')
                        .select('money')
                        .eq('id', sellerId);
                      if (sellerProfiles && sellerProfiles.length > 0) {
                        const sellerMoney = (sellerProfiles[0].money as number) || 0;
                        const taxRate = 0.025;
                        const sellerRevenue = Math.round(buyPrice * (1 - taxRate));
                        await supabase.from('profiles').update({ money: sellerMoney + sellerRevenue }).eq('id', sellerId);
                      }
                    } catch { /* seller credit failure is not critical */ }
                  }

                  result.transferCount++;
                  result.bought = true;
                  result.details.push(
                    `Alındı: ${targetPlayerData?.name || 'Bilinmeyen'} (OVR ${targetPlayerData?.rating || 0}) → ${buyPrice.toLocaleString()} € (bütçe: ${budget.toLocaleString()} €)`
                  );
                } else {
                  result.details.push(`Bütçe yetersiz: ${buyPrice.toLocaleString()} € > ${budget.toLocaleString()} €`);
                }
              }
            } else {
              result.details.push('Bütçeye uygun oyuncu yok');
            }
          }
        } catch (err) {
          result.errors.push(`Alış hatası: ${err}`);
        }
      } else {
        result.details.push('Eksik mevki yok, alım gerekmiyor');
      }
    }

    // Save personality to profile for consistency
    try {
      await supabase.from('profiles').update({ bot_personality: personalityKey }).eq('id', botUserId);
    } catch { /* non-critical */ }

  } catch (err) {
    result.errors.push(`Bot transfer genel hata: ${err}`);
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOT SQUAD SELECTION (v2 — Condition + Formation)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Select the best starting XI for a bot team.
 * Matches python/bot_actions.py v2 logic:
 *   - Filter out injured and suspended players
 *   - Condition-based selection (stamina < 50 → bench)
 *   - Formation selection based on opponent weakness
 *   - Position-balanced starting XI
 */
export async function selectBotSquad(botUserId: string): Promise<BotSquadResult> {
  if (!isSupabaseConfigured()) return { starting: [], subs: [], formation: '4-4-2', error: 'Not configured' };

  const supabase = getSupabase();
  if (!supabase) return { starting: [], subs: [], formation: '4-4-2', error: 'No client' };

  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: allPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('profile_id', botUserId);

    if (!allPlayers || allPlayers.length < 11) {
      return { starting: [], subs: [], formation: '4-4-2', error: 'Yetersiz oyuncu' };
    }

    // Filter out injured and suspended
    const available = (allPlayers as Array<Record<string, unknown>>).filter(p => {
      const suspendedUntil = p.suspended_until as string;
      if (suspendedUntil && suspendedUntil >= today) return false;
      if (p.is_injured) return false;
      const injury = p.injury;
      if (injury) {
        try {
          const inj = typeof injury === 'string' ? JSON.parse(injury) : injury;
          if (inj.remaining_days > 0) return false;
        } catch { /* ignore */ }
      }
      return true;
    });

    if (available.length < 11) {
      return { starting: [], subs: [], formation: '4-4-2', error: 'Uygun oyuncu yetersiz' };
    }

    // Condition check: stamina < 50 → bench
    const highStamina = available.filter(p => ((p.stamina as number) || 100) >= 50);
    const pool = highStamina.length >= 11 ? highStamina : available;

    // Formation selection (random for now, opponent analysis can be added)
    const formationKeys = Object.keys(FORMATIONS);
    const formation = formationKeys[Math.floor(Math.random() * formationKeys.length)];
    const formationSlots = FORMATIONS[formation];

    // Sort by rating descending
    pool.sort((a, b) => ((b.rating as number) || 0) - ((a.rating as number) || 0));

    // Group by position
    const byPosition: Record<PositionGroup, Array<Record<string, unknown>>> = { GK: [], DEF: [], MID: [], FWD: [] };
    for (const p of pool) {
      const group = mapToGroup((p.position as string) || 'CM');
      byPosition[group].push(p);
    }

    // Select best players per position
    const starting: string[] = [];
    const usedIds = new Set<string>();

    for (const [pos, count] of Object.entries(formationSlots)) {
      const posPlayers = byPosition[pos as PositionGroup] || [];
      for (let i = 0; i < count && i < posPlayers.length; i++) {
        const player = posPlayers[i];
        if (!usedIds.has(player.id as string)) {
          starting.push(player.id as string);
          usedIds.add(player.id as string);
        }
      }
    }

    // Fill remaining with best available
    if (starting.length < 11) {
      const remaining = pool.filter(p => !usedIds.has(p.id as string));
      for (const p of remaining) {
        if (starting.length >= 11) break;
        starting.push(p.id as string);
        usedIds.add(p.id as string);
      }
    }

    // Substitutes: best 7 remaining
    const subsPool = available.filter(p => !usedIds.has(p.id as string));
    subsPool.sort((a, b) => ((b.stamina as number) || 100) - ((a.stamina as number) || 100));
    const subs = subsPool.slice(0, 7).map(p => p.id as string);

    return { starting, subs, formation };
  } catch (err) {
    return { starting: [], subs: [], formation: '4-4-2', error: String(err) };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUN ALL BOTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Process transfers for all bots in the system.
 */
export async function runAllBotTransfers(): Promise<{
  totalBots: number;
  results: Array<{ botId: string } & BotTransferResult>;
}> {
  if (!isSupabaseConfigured()) return { totalBots: 0, results: [] };

  const supabase = getSupabase();
  if (!supabase) return { totalBots: 0, results: [] };

  try {
    const { data: bots } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_bot', true);

    if (!bots || bots.length === 0) return { totalBots: 0, results: [] };

    const results: Array<{ botId: string } & BotTransferResult> = [];

    for (const bot of bots) {
      const result = await processBotTransfers(bot.id);
      results.push({ botId: bot.id, ...result });
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return { totalBots: bots.length, results };
  } catch {
    return { totalBots: 0, results: [] };
  }
}
