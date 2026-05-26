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
const BOT_MAX_WEEKLY_BUYS = 1;   // Haftada maksimum 1 alım
const BOT_MAX_WEEKLY_SELLS = 1;  // Haftada maksimum 1 satım

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
      .select('id, manager_name, team_name, money, credits, reputation, is_bot, bot_difficulty, region')
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
      .select('id, name, position, specific_position, rating, potential, age, market_value, salary, profile_id, team_name')
      .eq('profile_id', botUserId);

    if (squadError || !squad) {
      return { bought: false, sold: false, details: ['Failed to fetch squad'] };
    }

    // ── Haftalık transfer limiti kontrolü ──
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentTransfers } = await supabase
      .from('transfer_market')
      .select('id, seller_id')
      .or(`seller_id.eq.${botUserId},buyer_id.eq.${botUserId}`)
      .gte('created_at', oneWeekAgo);

    const weeklyBuys = (recentTransfers || []).filter((t: any) => t.buyer_id === botUserId).length;
    const weeklySells = (recentTransfers || []).filter((t: any) => t.seller_id === botUserId).length;

    // 3. SELL: Aynı mevkide fazla oyuncu varsa en düşük OVR'li veya en yüksek maaşlıyı satışa koy
    if (weeklySells < BOT_MAX_WEEKLY_SELLS && squad.length > BOT_MIN_SQUAD_SIZE && Math.random() < BOT_SELL_CHANCE) {
      // Mevki bazında sayım yap
      const posCount: Record<string, BotPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] };
      for (const p of squad as BotPlayer[]) {
        const group = mapToGroup(p.position);
        if (!posCount[group]) posCount[group] = [];
        posCount[group].push(p);
      }

      // Fazla oyuncu olan mevkileri tespit et (ideal: GK 2, DEF 6, MID 6, FWD 5)
      const idealCounts: Record<string, number> = { GK: 2, DEF: 6, MID: 6, FWD: 5 };
      let sellCandidate: BotPlayer | null = null;

      for (const [group, players] of Object.entries(posCount)) {
        if (players.length > idealCounts[group]) {
          // Bu mevkide fazla var: en düşük OVR'li + en yüksek maaşlıyı seç
          const sorted = [...players].sort((a, b) => {
            // Öncelik: düşük rating + yüksek maaş = satış adayı
            const scoreA = (a.rating || 30) - (a.salary || 0) / 100000;
            const scoreB = (b.rating || 30) - (b.salary || 0) / 100000;
            return scoreA - scoreB; // en düşük skor = satılacak oyuncu
          });
          sellCandidate = sorted[0];
          break; // İlk fazla mevkiiden bir oyuncu sat
        }
      }

      // Fallback: fazla mevki yoksa en düşük rating'li oyuncuyu sat
      if (!sellCandidate) {
        const sortedSquad = [...(squad as BotPlayer[])].sort((a, b) => (a.rating || 0) - (b.rating || 0));
        const worstPlayer = sortedSquad[0];
        if (worstPlayer && (worstPlayer.rating || 0) < 50 * config.sellThreshold + 30) {
          sellCandidate = worstPlayer;
        }
      }

      if (sellCandidate) {
        // Check if player is already listed on transfer_market
        const { data: existingListing } = await supabase
          .from('transfer_market')
          .select('id')
          .eq('player_id', sellCandidate.id)
          .eq('is_active', true)
          .maybeSingle();

        if (!existingListing) {
          const sellPrice = getRandomPrice(sellCandidate.rating || 30, difficulty);

          const { error: insertError } = await supabase.from('transfer_market').insert({
            player_id: sellCandidate.id,
            player_data: sellCandidate,
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
            sold = true;
            details.push(`Listed ${sellCandidate.name} (OVR ${sellCandidate.rating}) for ${sellPrice.toLocaleString()} €`);
          } else {
            details.push(`Failed to list ${sellCandidate.name}: ${insertError.message}`);
          }
        }
      }
    } else if (weeklySells >= BOT_MAX_WEEKLY_SELLS) {
      details.push(`Weekly sell limit reached (${weeklySells}/${BOT_MAX_WEEKLY_SELLS})`);
    }

    // 4. BUY: Eksik mevkileri tespit et, fiyat/performans oranına göre en uygun oyuncuyu seç
    if (weeklyBuys < BOT_MAX_WEEKLY_BUYS && Math.random() < BOT_TRANSFER_CHANCE) {
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
          // ── Fiyat/Performans oranı hesapla ──
          // En düşük fiyat/performans oranına sahip oyuncu = en iyi yatırım
          const scored = affordable.map((l: any) => {
            const pRating = l.player_data?.rating || 30;
            const pricePerRating = l.price / Math.max(1, pRating);
            const posMatch = neededPositions.length > 0 && neededPositions.some((np) => {
              const pos = l.player_data?.position;
              if (!pos) return false;
              if (np === 'GK' && pos === 'GK') return true;
              if (np === 'DEF' && ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return true;
              if (np === 'MID' && ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos)) return true;
              if (np === 'FWD' && ['LW', 'RW', 'CF', 'ST'].includes(pos)) return true;
              return false;
            });

            // Eksik mevki uyumu: büyük bonus
            const needBonus = posMatch ? 0.5 : 0;
            // Düşük fiyat/performans oranı = iyi yatırım
            const score = pRating * (1 + needBonus) - pricePerRating * 0.3;

            return { listing: l, score, pricePerRating, posMatch, pRating };
          });

          // En yüksek skora sahip oyuncuyu seç
          scored.sort((a: any, b: any) => b.score - a.score);
          const target = scored[0].listing;

          // Verify player still exists in players table before buying
          const { data: playerCheck } = await supabase
            .from('players')
            .select('id, name, rating')
            .eq('id', target.player_id)
            .maybeSingle();

          if (!playerCheck) {
            details.push(`Player ${target.player_id} no longer exists — skipping purchase`);
          } else {
            const buyPrice = target.price;

            // Deduct buyer's money
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
                club: profile.team_name,
              })
              .eq('id', target.player_id);

            // Deactivate listing
            await supabase.from('transfer_market').update({ is_active: false }).eq('id', target.id);

            // Credit seller (with 2.5% tax deduction)
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
            const ppr = Math.round(buyPrice / Math.max(1, playerCheck.rating));
            details.push(`Bought ${playerCheck.name} (OVR ${playerCheck.rating}) for ${buyPrice.toLocaleString()} € (€${ppr}/OVR, budget: ${budget.toLocaleString()} €)`);
          }
        } else {
          details.push('No affordable players on market');
        }
      }
    } else if (weeklyBuys >= BOT_MAX_WEEKLY_BUYS) {
      details.push(`Weekly buy limit reached (${weeklyBuys}/${BOT_MAX_WEEKLY_BUYS})`);
    }

    return { bought, sold, details };
  } catch (err) {
    console.error('[botService] processBotTransfers error:', err);
    return { bought: false, sold: false, details: [`Error: ${err}`] };
  }
}

// ---------------------------------------------------------------------------
// Formation Configuration
// ---------------------------------------------------------------------------

const FORMATION_SLOTS: Record<string, Record<string, number>> = {
  '4-4-2':   { GK: 1, DEF: 4, MID: 4, FWD: 2 },
  '4-3-3':   { GK: 1, DEF: 4, MID: 3, FWD: 3 },
  '5-3-2':   { GK: 1, DEF: 5, MID: 3, FWD: 2 },
  '4-2-3-1': { GK: 1, DEF: 4, MID: 5, FWD: 1 },
  '3-5-2':   { GK: 1, DEF: 3, MID: 5, FWD: 2 },
};

function selectFormationForBot(squad: BotPlayer[], difficulty: number): string {
  const fwdCount = squad.filter(p => mapToGroup(p.position) === 'FWD').length;
  const defCount = squad.filter(p => mapToGroup(p.position) === 'DEF').length;
  if (fwdCount >= 4 && difficulty >= 2) return '4-3-3';
  if (defCount >= 6 && difficulty <= 1) return '5-3-2';
  if (difficulty === 3) {
    const opts = ['4-3-3', '4-2-3-1', '3-5-2'];
    return opts[Math.floor(Math.random() * opts.length)];
  }
  if (difficulty === 2) return Math.random() > 0.5 ? '4-4-2' : '4-3-3';
  return '4-4-2';
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
    // Fetch bot profile for difficulty
    const { data: bot } = await supabase
      .from('profiles')
      .select('bot_difficulty')
      .eq('id', botUserId)
      .maybeSingle();

    // Fetch bot's squad
    const { data: squad, error } = await supabase
      .from('players')
      .select('*')
      .eq('profile_id', botUserId);

    if (error || !squad || squad.length < 11) return null;

    // Sort by rating descending
    const sorted = [...(squad as BotPlayer[])].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // Select formation based on squad composition and difficulty
    const difficulty = bot?.bot_difficulty || 1;
    const formation = selectFormationForBot(sorted, difficulty);
    const formationSlots = FORMATION_SLOTS[formation] || FORMATION_SLOTS['4-4-2'];

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

    // Upsert selected formation to active_tactics
    try {
      await supabase.from('active_tactics').upsert({
        id: botUserId,
        profile_id: botUserId,
        formation: formation,
        mentality: difficulty === 3 ? 4 : 3,
        pressing: difficulty >= 2,
      }, { onConflict: 'id' });
    } catch (tacticErr) {
      console.warn('[botService] active_tactics upsert failed:', tacticErr);
    }

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
  botUserId: string,
  _matchId: string,
  minute: number
): Promise<{ action: string; details: string } | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    // Sadece 60. dakikadan sonra taktik değişikliği yap
    if (minute < 60) return null;

    // Bot profilini al
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, team_name, is_bot')
      .eq('id', botUserId)
      .single();

    if (!profile?.is_bot) return null;

    // Aktif taktik bilgisi al
    const { data: tacticData } = await supabase
      .from('active_tactics')
      .select('*')
      .eq('profile_id', botUserId)
      .maybeSingle();

    const currentFormation = tacticData?.formation || '4-4-2';
    const currentMentality = Number(tacticData?.mentality || 3);
    const currentPressing = Boolean(tacticData?.pressing);

    // Maç skorunu kontrol et (fixtures tablosundan son maç)
    // Skor bilgisine erişilemiyorsa rastgele taktik değişikliği yapma
    // Bu fonksiyon maç motoru tarafından çağrıldığında skor parametresi de geçilebilir
    // Şimdilik dakikaya göre formasyon değişikliği yap

    let newFormation = currentFormation;
    let newMentality = currentMentality;
    let newPressing = currentPressing;
    const changes: string[] = [];

    // 60+ dakika: Geride olasılığı yüksek → daha hücumcu formasyona geç
    if (minute >= 60 && minute < 75) {
      // Defansif formasyondan ofansife geç
      if (['5-3-2', '5-4-1'].includes(currentFormation)) {
        newFormation = '4-4-2';
        changes.push('5-3-2/5-4-1 → 4-4-2');
      }
      if (currentMentality <= 2) {
        newMentality = 3; // Dengeli
        changes.push('mentality → dengeli');
      }
    }

    // 75+ dakika: Son çare — tam hücum
    if (minute >= 75) {
      if (['4-4-2', '4-5-1', '4-3-3'].includes(currentFormation) && currentMentality <= 3) {
        newFormation = '3-4-3';
        newMentality = 5; // Tam hücum
        newPressing = true;
        changes.push('→ 3-4-3 tam hücum');
      }
    }

    if (changes.length === 0) return null;

    // Taktik güncelle
    await supabase.from('active_tactics').upsert({
      profile_id: botUserId,
      formation: newFormation,
      mentality: newMentality,
      pressing: newPressing,
      defense_line: newMentality >= 4 ? 'onde' : 'standart',
      tempo: newMentality >= 4 ? 80 : 50,
    }, { onConflict: 'profile_id' });

    return {
      action: 'tactical_change',
      details: `Dk ${minute}: ${changes.join(', ')} (bot: ${profile.team_name})`,
    };
  } catch (err) {
    console.error('[botService] makeTacticalDecision error:', err);
    return null;
  }
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
      credits: 100,
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
// Run Transfer Cycle for All Bots — DELETED
// ---------------------------------------------------------------------------
// NOTE: runBotTransferCycle() was removed. Use getAllBotProfiles() + processBotTransfers()
// individually per bot instead (as /api/cron/bot-actions already does).
