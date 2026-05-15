import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { generatePlayer } from './playerGenerator';
import type { PositionGroup, SpecificPosition } from './types';
import { GROUP_POSITIONS, POS_TO_GROUP } from './playerGenerator';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BotProfile {
  id: string;
  manager_name: string;
  team_name: string;
  money: number;
  reputation: number;
  is_bot: boolean;
  bot_difficulty: number;
  league_name?: string;
  region?: string;
}

interface BotPlayer {
  id: string;
  name: string;
  position: string;
  specificPosition?: string;
  rating: number;
  potential: number;
  age: number;
  market_value: number;
  salary: number;
  profile_id: string;
  team_name: string;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BOT_TRANSFER_CHANCE = 0.3; // 30% chance to do a transfer per cycle
const BOT_SELL_CHANCE = 0.2;     // 20% chance to sell a player
const BOT_MAX_SQUAD_SIZE = 22;
const BOT_MIN_SQUAD_SIZE = 16;

const DIFFICULTY_CONFIG: Record<number, { transferBudget: number; sellThreshold: number; buyRatingBoost: number }> = {
  1: { transferBudget: 0.15, sellThreshold: 0.3, buyRatingBoost: 0 },    // Easy
  2: { transferBudget: 0.25, sellThreshold: 0.2, buyRatingBoost: 2 },    // Medium
  3: { transferBudget: 0.35, sellThreshold: 0.15, buyRatingBoost: 5 },   // Hard
};

// ---------------------------------------------------------------------------
// Helper: Map a specific position string to a broad position group
// ---------------------------------------------------------------------------

function mapToGroup(position: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
  if (position === 'GK') return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position)) return 'DEF';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position)) return 'MID';
  return 'FWD';
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function getPositionNeed(squad: BotPlayer[]): Record<string, number> {
  const ideal: Record<string, number> = { GK: 2, DEF: 6, MID: 6, FWD: 5 };
  const current: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };

  for (const p of squad) {
    const group = mapToGroup(p.position);
    current[group] = (current[group] || 0) + 1;
  }

  const needs: Record<string, number> = {};
  for (const [pos, idealCount] of Object.entries(ideal)) {
    needs[pos] = Math.max(0, idealCount - (current[pos] || 0));
  }
  return needs;
}

function getRandomPrice(rating: number, difficulty: number): number {
  const base = Math.max(500_000, rating * 80_000);
  const variance = base * (0.8 + Math.random() * 0.4);
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.1;
  return Math.round(variance * difficultyMultiplier);
}

// ---------------------------------------------------------------------------
// Process Bot Transfers
// ---------------------------------------------------------------------------

export async function processBotTransfers(
  botUserId: string
): Promise<{ bought: boolean; sold: boolean; details: string[] }> {
  if (!isSupabaseConfigured()) return { bought: false, sold: false, details: ['Supabase not configured'] };

  const supabase = getSupabase();
  if (!supabase) return { bought: false, sold: false, details: ['No Supabase client'] };

  const details: string[] = [];
  let bought = false;
  let sold = false;

  try {
    // 1. Fetch bot profile
    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('id, manager_name, team_name, money, reputation, is_bot, bot_difficulty, region')
      .eq('id', botUserId)
      .single();

    if (profError || !profile || !profile.is_bot) {
      return { bought: false, sold: false, details: ['Not a bot or profile not found'] };
    }

    const difficulty = profile.bot_difficulty || 1;
    const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[1];

    // 2. Fetch bot's squad
    const { data: squad, error: squadError } = await supabase
      .from('players')
      .select('*')
      .eq('profile_id', botUserId);

    if (squadError || !squad) {
      return { bought: false, sold: false, details: ['Failed to fetch squad'] };
    }

    // 3. SELL: Low-rated player to transfer market
    if (squad.length > BOT_MIN_SQUAD_SIZE && Math.random() < BOT_SELL_CHANCE) {
      // Sort by rating ascending
      const sortedSquad = [...squad].sort((a: BotPlayer, b: BotPlayer) => (a.rating || 0) - (b.rating || 0));
      const worstPlayer = sortedSquad[0];

      if (worstPlayer && (worstPlayer.rating || 0) < 50 * config.sellThreshold + 30) {
        const sellPrice = getRandomPrice(worstPlayer.rating || 30, difficulty);

        const { error: insertError } = await supabase.from('transfer_market').insert({
          player_id: worstPlayer.id,
          player_data: worstPlayer,
          seller_id: botUserId,
          seller_name: profile.team_name,
          price: sellPrice,
          min_price: Math.round(sellPrice * 0.7),
          max_price: Math.round(sellPrice * 1.5),
          is_active: true,
          is_auction: true,
          starting_price: sellPrice,
          reserve_price: Math.round(sellPrice * 0.7),
          bid_count: 0,
          expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        });

        if (!insertError) {
          // Remove from squad
          await supabase.from('players').delete().eq('id', worstPlayer.id);
          // Credit money
          await supabase
            .from('profiles')
            .update({ money: (profile.money || 0) + sellPrice })
            .eq('id', botUserId);

          sold = true;
          details.push(`Sold ${worstPlayer.name} (OVR ${worstPlayer.rating}) for ₺${sellPrice.toLocaleString()}`);
        }
      }
    }

    // 4. BUY: Find affordable player from market
    if (Math.random() < BOT_TRANSFER_CHANCE) {
      const needs = getPositionNeed(squad as BotPlayer[]);
      const neededPositions = Object.entries(needs)
        .filter(([, count]) => count > 0)
        .map(([pos]) => pos);

      // Get active market listings
      const { data: listings, error: listError } = await supabase
        .from('transfer_market')
        .select('*')
        .eq('is_active', true)
        .neq('seller_id', botUserId);

      if (!listError && listings && listings.length > 0) {
        const budget = (profile.money || 0) * config.transferBudget;
        const affordable = listings.filter((l: { price: number }) => l.price <= budget);

        if (affordable.length > 0) {
          // Prefer needed positions
          let target = affordable[Math.floor(Math.random() * affordable.length)];

          if (neededPositions.length > 0) {
            const matching = affordable.filter((l: { player_data?: { position?: string } }) => {
              const pos = l.player_data?.position;
              if (!pos) return false;
              return neededPositions.some((np) => {
                if (np === 'GK' && pos === 'GK') return true;
                if (np === 'DEF' && ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return true;
                if (np === 'MID' && ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos)) return true;
                if (np === 'FWD' && ['LW', 'RW', 'CF', 'ST'].includes(pos)) return true;
                return false;
              });
            });
            if (matching.length > 0) {
              target = matching[Math.floor(Math.random() * matching.length)];
            }
          }

          // Buy the player
          const buyPrice = target.price;
          await supabase
            .from('profiles')
            .update({ money: Math.max(0, (profile.money || 0) - buyPrice) })
            .eq('id', botUserId);

          // Transfer player ownership
          await supabase
            .from('players')
            .update({
              profile_id: botUserId,
              team_name: profile.team_name,
            })
            .eq('id', target.player_id);

          // Deactivate listing
          await supabase.from('transfer_market').update({ is_active: false }).eq('id', target.id);

          // Credit seller
          if (target.seller_id) {
            const { data: sellerProfile } = await supabase
              .from('profiles')
              .select('money')
              .eq('id', target.seller_id)
              .single();
            if (sellerProfile) {
              const taxRate = 0.025;
              const sellerRevenue = Math.round(buyPrice * (1 - taxRate));
              await supabase
                .from('profiles')
                .update({ money: (sellerProfile.money || 0) + sellerRevenue })
                .eq('id', target.seller_id);
            }
          }

          bought = true;
          details.push(`Bought player for ₺${buyPrice.toLocaleString()} (budget: ₺${budget.toLocaleString()})`);
        } else {
          details.push('No affordable players on market');
        }
      }
    }

    return { bought, sold, details };
  } catch (err) {
    console.error('[botService] processBotTransfers error:', err);
    return { bought: false, sold: false, details: [`Error: ${err}`] };
  }
}

// ---------------------------------------------------------------------------
// Select Match Squad
// ---------------------------------------------------------------------------

export async function selectMatchSquad(
  botUserId: string
): Promise<{ starting: string[]; subs: string[]; formation: string } | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    // Fetch bot's squad
    const { data: squad, error } = await supabase
      .from('players')
      .select('*')
      .eq('profile_id', botUserId);

    if (error || !squad || squad.length < 11) return null;

    // Sort by rating descending
    const sorted = [...(squad as BotPlayer[])].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // Default 4-4-2 formation
    const formation = '4-4-2';
    const formationSlots: Record<string, number> = { GK: 1, DEF: 4, MID: 4, FWD: 2 };

    // Group players by position
    const byPosition: Record<string, BotPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] };
    for (const p of sorted) {
      const group = mapToGroup(p.position);
      byPosition[group].push(p);
    }

    // Pick best players per position slot
    const starting: string[] = [];
    const used = new Set<string>();

    for (const [pos, count] of Object.entries(formationSlots)) {
      const available = byPosition[pos].filter((p) => !used.has(p.id));
      for (let i = 0; i < count && i < available.length; i++) {
        starting.push(available[i].id);
        used.add(available[i].id);
      }
    }

    // Fill remaining slots with best available if formation doesn't cover 11
    if (starting.length < 11) {
      const remaining = sorted.filter((p) => !used.has(p.id));
      for (const p of remaining) {
        if (starting.length >= 11) break;
        starting.push(p.id);
        used.add(p.id);
      }
    }

    // Substitutes: next 7 best players
    const subs = sorted.filter((p) => !used.has(p.id)).slice(0, 7).map((p) => p.id);

    return { starting, subs, formation };
  } catch (err) {
    console.error('[botService] selectMatchSquad error:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Make Tactical Decision (placeholder for future)
// ---------------------------------------------------------------------------

export async function makeTacticalDecision(
  _botUserId: string,
  _matchId: string,
  _minute: number
): Promise<{ action: string; details: string } | null> {
  // Placeholder for future implementation
  // Future: switch to attacking formation when losing, defensive when winning
  // Future: make substitutions based on stamina/fatigue
  return null;
}

// ---------------------------------------------------------------------------
// Get All Bot Profiles
// ---------------------------------------------------------------------------

export async function getAllBotProfiles(): Promise<BotProfile[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, manager_name, team_name, money, reputation, is_bot, bot_difficulty, league_name, region')
      .eq('is_bot', true);

    if (error || !data) return [];
    return data as BotProfile[];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Seed Bot Teams
// ---------------------------------------------------------------------------

export async function seedBotTeam(
  teamName: string,
  managerName: string,
  difficulty: number = 1,
  region: string = 'TR'
): Promise<{ success: boolean; profileId?: string; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };

  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'No Supabase client' };

  try {
    const profileId = crypto.randomUUID();

    // 1. Create bot profile
    const { error: profError } = await supabase.from('profiles').insert({
      id: profileId,
      manager_name: managerName,
      team_name: teamName,
      money: 50_000_000 + Math.floor(Math.random() * 50_000_000),
      mg_coins: 100,
      level: 1,
      xp: 0,
      fans: 1000 + Math.floor(Math.random() * 5000),
      reputation: 20 + Math.floor(Math.random() * 30),
      current_day: 1,
      ticket_price: 30,
      stadium_capacity: 8000 + Math.floor(Math.random() * 7000),
      region: region,
      philosophy: 'balanced',
      primary_color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      secondary_color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      is_bot: true,
      bot_difficulty: difficulty,
      created_at: new Date().toISOString(),
    });

    if (profError) return { success: false, error: profError.message };

    // 2. Generate squad (19 players: 2 GK, 6 DEF, 6 MID, 5 FWD)
    const posCounts: Record<string, number> = { GK: 2, DEF: 6, MID: 6, FWD: 5 };
    const playersToInsert: Record<string, unknown>[] = [];

    for (const [pos, count] of Object.entries(posCounts)) {
      const positionGroup = pos as PositionGroup;
      const specificPositions = GROUP_POSITIONS[positionGroup];

      for (let i = 0; i < count; i++) {
        // Determine a random specific position within the group
        const specificPos = specificPositions[Math.floor(Math.random() * specificPositions.length)];

        // Generate base rating based on difficulty tier (4 = lowest tier)
        const baseRating = 80 - 4 * 10; // tier 4 → baseRating ~40
        const rating = baseRating + Math.floor(Math.random() * 15);

        const p = generatePlayer(specificPos, rating);

        playersToInsert.push({
          ...p,
          position: positionGroup,
          specificPosition: specificPos,
          profile_id: profileId,
          team_name: teamName,
          club: teamName,
          nation: region === 'TR' ? 'Türkiye' : region,
        });
      }
    }

    // Batch insert players
    const CHUNK_SIZE = 20;
    for (let i = 0; i < playersToInsert.length; i += CHUNK_SIZE) {
      const chunk = playersToInsert.slice(i, i + CHUNK_SIZE);
      await supabase.from('players').insert(chunk);
    }

    return { success: true, profileId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[botService] seedBotTeam error:', err);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Assign Bot to League Team
// ---------------------------------------------------------------------------

export async function assignBotToLeagueSlot(profileId: string, leagueTeamId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('league_teams')
      .update({
        profile_id: profileId,
        is_npc: false,
        is_bot: true,
      })
      .eq('id', leagueTeamId);

    return !error;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Run Transfer Cycle for All Bots
// ---------------------------------------------------------------------------

export async function runBotTransferCycle(): Promise<{
  totalBots: number;
  results: { botId: string; bought: boolean; sold: boolean; details: string[] }[];
}> {
  if (!isSupabaseConfigured()) return { totalBots: 0, results: [] };

  const supabase = getSupabase();
  if (!supabase) return { totalBots: 0, results: [] };

  try {
    const { data: bots, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_bot', true);

    if (error || !bots || bots.length === 0) {
      return { totalBots: 0, results: [] };
    }

    const results: { botId: string; bought: boolean; sold: boolean; details: string[] }[] = [];

    // Process each bot with a small delay to avoid rate limiting
    for (const bot of bots) {
      const result = await processBotTransfers(bot.id);
      results.push({ botId: bot.id, ...result });

      // Small delay between bots to avoid hammering the DB
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    return { totalBots: bots.length, results };
  } catch (err) {
    console.error('[botService] runBotTransferCycle error:', err);
    return { totalBots: 0, results: [] };
  }
}
