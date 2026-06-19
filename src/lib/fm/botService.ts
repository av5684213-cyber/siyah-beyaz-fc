import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { generatePlayer } from './playerGenerator';
import type { PositionGroup, SpecificPosition } from './types';
import { GROUP_POSITIONS, POS_TO_GROUP } from './playerGenerator';
import { calculateMarketValue } from './valuation';

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
const BOT_MAX_DAILY_BUYS = 1;   // Günlük maksimum 1 alım (DÜZELTME 5: cron her gün çalışır)
const BOT_MAX_DAILY_SELLS = 1;  // Günlük maksimum 1 satım

// BUG-4: Maaş bütçesi kontrolü — botların iflas etmesini önler
const SALARY_BUDGET_RATIO = 0.60; // Mevcut gelirin %60'ı maaş bütçesi
const TAX_RATE_STANDARD = 0.025;  // %2.5 standart vergi (botService'deki 0.08 hatası düzeltildi)

// BUG-4: Zorluk bazlı maaş yönetim agresifliği
const SALARY_DIFFICULTY_RATIO: Record<number, number> = {
  1: 0.50,  // Conservative — won't exceed 50% of salary budget
  2: 0.70,  // Normal — up to 70% of salary budget
  3: 0.90,  // Aggressive — up to 90% of salary budget
};

const DIFFICULTY_CONFIG: Record<number, { transferBudget: number; sellThreshold: number; buyRatingBoost: number }> = {
  1: { transferBudget: 0.15, sellThreshold: 0.3, buyRatingBoost: 0 },    // Easy
  2: { transferBudget: 0.25, sellThreshold: 0.2, buyRatingBoost: 2 },    // Medium
  3: { transferBudget: 0.35, sellThreshold: 0.15, buyRatingBoost: 5 },   // Hard
};

const TIER_TARGET_AVG_OVR: Record<number, number> = {
  1: 80,  // Süper Lig
  2: 72,  // 1. Lig
  3: 64,  // 2. Lig
  4: 56,  // 3. Lig
};

// ── Tier bazlı bütçe oranı (düşük tier botlar daha çok harcasın) ──
// Difficulty bazlı bütçe yerine, lig tier'ına göre bütçe oranı
const TIER_BUDGET_RATIO: Record<number, number> = {
  1: 0.20,  // Süper Lig: toplam paranın %20'si
  2: 0.25,  // 1. Lig: %25
  3: 0.32,  // 2. Lig: %32
  4: 0.40,  // 3. Lig: %40 (düşük tier botlar kadro kalitesini artırsın)
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

/**
 * BUG-4: Bot'un maaş bütçesini hesaplar.
 * Haftalık geliri baz alarak maaş bütçesi, mevcut maaş yükü ve
 * kalan maaş alanı hesaplar. Bot ekonomisinin çökmesini önler.
 */
function calculateSalaryBudget(
  profile: { money?: number; last_weekly_income?: number },
  squad: { salary?: number }[]
): {
  salaryBudget: number;
  currentSalaryLoad: number;
  availableSalarySpace: number;
  weeklyIncome: number;
  isOverloaded: boolean;
} {
  const money = profile.money || 0;
  const weeklyIncome = profile.last_weekly_income || Math.max(50000, money * 0.02);
  const salaryBudget = weeklyIncome * SALARY_BUDGET_RATIO;
  const currentSalaryLoad = squad.reduce((sum, p) => sum + (p.salary || 0), 0);
  const availableSalarySpace = salaryBudget - currentSalaryLoad;
  const isOverloaded = currentSalaryLoad > salaryBudget;

  return {
    salaryBudget,
    currentSalaryLoad,
    availableSalarySpace,
    weeklyIncome,
    isOverloaded,
  };
}

function getRandomPrice(rating: number, difficulty: number, age: number = 25, potential: number = 0): number {
  // Bot fiyatlandırması: gerçek değerleme formülüne dayalı
  // Eski: rating × 80K (üstel değerlemeden 3-5x düşük → arbitraj sömürüsü)
  // Yeni: calculateMarketValue tabanlı, zorluk seviyesine göre indirim

  // Basit oyuncu objesi oluştur (değerleme hesabı için)
  const mockPlayer = {
    rating,
    age,
    potential: potential || rating + 5,
    stamina: 60 + Math.floor(Math.random() * 20),
    form_rating: 50,
    injury_history: [],
    traitLevels: {},
    traits: [],
    negTraits: [],
    archetype: undefined,
    secondaryPositions: [],
    form: 50,
  } as any;

  const marketValue = calculateMarketValue(mockPlayer);

  // Zorluk seviyesine göre indirim/prim:
  // Easy (1): piyasa değerinin %60-80'i (ucuz listeler → oyuncular kâr eder)
  // Medium (2): piyasa değerinin %80-100'ü (dengeli)
  // Hard (3): piyasa değerinin %100-120'si (pahalı → oyuncular kâr edemez)
  const discountRanges: Record<number, [number, number]> = {
    1: [0.60, 0.80],
    2: [0.80, 1.00],
    3: [1.00, 1.20],
  };
  const [minMult, maxMult] = discountRanges[difficulty] || discountRanges[2];
  const multiplier = minMult + Math.random() * (maxMult - minMult);

  return Math.round(marketValue * multiplier);
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
      .select('id, manager_name, team_name, money, credits, reputation, is_bot, bot_difficulty, region, last_weekly_income')
      .eq('id', botUserId)
      .maybeSingle();

    if (profError || !profile || !profile.is_bot) {
      return { bought: false, sold: false, details: ['Not a bot or profile not found'] };
    }

    const difficulty = profile.bot_difficulty || 1;
    const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[1];

    // Lig tier'ını belirle (bütçe oranı için)
    const { data: botLeagueRow2 } = await supabase
      .from('league_teams').select('league_id').eq('profile_id', botUserId).maybeSingle();
    let botTier = 4;
    if (botLeagueRow2?.league_id) {
      const { data: lg2 } = await supabase
        .from('leagues').select('tier').eq('id', botLeagueRow2.league_id).maybeSingle();
      botTier = (lg2 as any)?.tier || 4;
    }
    const tierBudgetRatio = TIER_BUDGET_RATIO[botTier] || TIER_BUDGET_RATIO[4];

    // 2. Fetch bot's squad
    const { data: squad, error: squadError } = await supabase
      .from('players')
      .select('id, name, position, specific_position, rating, potential, age, market_value, salary, profile_id, team_name')
      .eq('profile_id', botUserId);

    if (squadError || !squad) {
      return { bought: false, sold: false, details: ['Failed to fetch squad'] };
    }

    // Lig tier'ına göre hedef OVR — TIER_TARGET_AVG_OVR kullan
    const targetOvr = TIER_TARGET_AVG_OVR[botTier] || 56;
    const currentAvgOvr = squad.length
      ? squad.reduce((s: number, p: any) => s + ((p as any).rating || 0), 0) / squad.length
      : 0;
    const needsUpgrade = currentAvgOvr < targetOvr - 3;
    const minBuyOvr = needsUpgrade ? Math.floor(currentAvgOvr) + 2 : 0;

    // ── Günlük transfer limiti kontrolü ──
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentTransfers } = await supabase
      .from('transfer_market')
      .select('id, seller_id')
      .or(`seller_id.eq.${botUserId},buyer_id.eq.${botUserId}`)
      .gte('created_at', oneDayAgo);

    const dailyBuys = (recentTransfers || []).filter((t: any) => t.buyer_id === botUserId).length;
    const dailySells = (recentTransfers || []).filter((t: any) => t.seller_id === botUserId).length;

    // 3. SELL: Aynı mevkide fazla oyuncu varsa en düşük OVR'li veya en yüksek maaşlıyı satışa koy
    if (dailySells < BOT_MAX_DAILY_SELLS && squad.length > BOT_MIN_SQUAD_SIZE && Math.random() < BOT_SELL_CHANCE) {
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

          // TODO: Migrate to RPC (BUG-1) — transfer_market.insert will fail once RLS is enforced;
          // consider using rpc_list_player_on_market for bot listings too
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
    } else if (dailySells >= BOT_MAX_DAILY_SELLS) {
      details.push(`Daily sell limit reached (${dailySells}/${BOT_MAX_DAILY_SELLS})`);
    }

    // BUG-4: Maaş bütçesi hesapla — calculateSalaryBudget kullan
    const salaryInfo = calculateSalaryBudget(profile, squad as BotPlayer[]);
    const difficultySalaryRatio = SALARY_DIFFICULTY_RATIO[difficulty] || SALARY_DIFFICULTY_RATIO[2];
    const effectiveSalaryCap = salaryInfo.salaryBudget * difficultySalaryRatio;

    console.log(
      `[BUG-4] Maaş Bütçesi: budget=₺${salaryInfo.salaryBudget.toLocaleString()}, ` +
      `load=₺${salaryInfo.currentSalaryLoad.toLocaleString()}, ` +
      `space=₺${salaryInfo.availableSalarySpace.toLocaleString()}, ` +
      `income=₺${salaryInfo.weeklyIncome.toLocaleString()}, ` +
      `overloaded=${salaryInfo.isOverloaded}, ` +
      `difficulty_ratio=${(difficultySalaryRatio * 100).toFixed(0)}%, ` +
      `effective_cap=₺${effectiveSalaryCap.toLocaleString()}`
    );

    // 4. BUY: Eksik mevkileri tespit et, fiyat/performans oranına göre en uygun oyuncuyu seç
    if (dailyBuys < BOT_MAX_DAILY_BUYS && Math.random() < BOT_TRANSFER_CHANCE) {
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
        const budget = (profile.money || 0) * tierBudgetRatio; // Tier bazlı bütçe

        // BUG-4: Maaş yükü etkili kapasiteyi aşıyorsa alım yapma
        if (salaryInfo.currentSalaryLoad > effectiveSalaryCap) {
          console.warn(
            `[BUG-4] Maaş yükü etkili kapasiteyi aşıyor — alım iptal. ` +
            `load=₺${salaryInfo.currentSalaryLoad.toLocaleString()} > cap=₺${effectiveSalaryCap.toLocaleString()}`
          );
          details.push(`Salary budget exceeded: buy cancelled (load=₺${salaryInfo.currentSalaryLoad.toLocaleString()})`);
        } else {
          const affordable = listings.filter((l: { price: number; player_data?: { rating?: number; salary?: number; age?: number } }) => {
            const pData = (l as any).player_data || {};
            const pSalary = pData.salary || Math.round((pData.rating || 40) * 500); // Tahmini maaş
            // BUG-4: Maaş bütçesi kontrolü — availableSalarySpace kullan
            if (pSalary > salaryInfo.availableSalarySpace && pSalary > 0) return false;
            return l.price <= budget;
          });

          // Tier bazlı minimum OVR filtresi
          const finalAffordable = affordable.filter((l: any) =>
            ((l as any).player_data?.rating || 0) >= minBuyOvr
          );

          if (finalAffordable.length > 0) {
          // ── Çok Kriterli Satın Alma Skoru + BUG-4 VFM ──
          // Ağırlıklar: mevki uyumu %30, fiyat/performans %20, yaş/potansiyel %15, form %10, VFM %25
          const scored = finalAffordable.map((l: any) => {
            const pData = l.player_data || {};
            const pRating = pData.rating || 30;
            const pAge = pData.age || 25;
            const pPotential = pData.potential || pRating + 5;
            const pForm = pData.form ?? 50;
            const pSalary = pData.salary || Math.round(pRating * 500);
            const pricePerRating = l.price / Math.max(1, pRating);

            // 1) Mevki uyumu skoru (0-100 arası normalize)
            const posMatch = neededPositions.length > 0 && neededPositions.some((np) => {
              const pos = pData.position;
              if (!pos) return false;
              if (np === 'GK' && pos === 'GK') return true;
              if (np === 'DEF' && ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return true;
              if (np === 'MID' && ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos)) return true;
              if (np === 'FWD' && ['LW', 'RW', 'CF', 'ST'].includes(pos)) return true;
              return false;
            });
            // Mevki uyumu: ihtiyaç varsa 100, yoksa 20
            const positionScore = posMatch ? 100 : 20;

            // 2) Fiyat/performans skoru (düşük ppr = iyi, normalize 0-100)
            const priceScore = Math.max(0, Math.min(100, 100 - (pricePerRating / 50)));

            // 3) Yaş/potansiyel skoru: genç + yüksek potansiyel = iyi
            const ageScore = Math.max(0, Math.min(100, 100 - (pAge - 15) * 4));
            const potentialBonus = Math.max(0, Math.min(100, (pPotential - 50) * 2));
            const agePotentialScore = ageScore * 0.5 + potentialBonus * 0.5;

            // 4) Form skoru: direkt form değerini kullan (0-100)
            const formScore = Math.max(0, Math.min(100, pForm));

            // 5) BUG-4: Value-for-money skoru
            // Yüksek rating + potansiyel, düşük maaş = yüksek VFM
            const vfmScore = Math.max(0, Math.min(100, ((pRating + pPotential * 0.5) / Math.max(1, pSalary / 1000)) * 10));

            // Ağırlıklı toplam (VFM eklendi)
            const score =
              positionScore * 0.30 +   // mevki uyumu %30
              priceScore * 0.20 +       // fiyat/performans %20
              agePotentialScore * 0.15 + // yaş/potansiyel %15
              formScore * 0.10 +         // form %10
              vfmScore * 0.25;           // BUG-4: VFM %25

            return { listing: l, score, pricePerRating, posMatch, pRating, vfmScore };
          });

          // Önce eksik mevki uyumlu oyunculara öncelik ver, sonra skora göre sırala
          scored.sort((a: any, b: any) => {
            // Eksik mevki uyumu olan her zaman öncelikli
            if (a.posMatch && !b.posMatch) return -1;
            if (!a.posMatch && b.posMatch) return 1;
            return b.score - a.score;
          });
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
            // TODO: Migrate to RPC (BUG-1) — transfer_market.update will fail once RLS is enforced
            await supabase.from('transfer_market').update({ is_active: false }).eq('id', target.id);

            // BUG-1/BUG-4: Satıcıya ödeme yap (standart %2.5 vergi — 0.08 hatası düzeltildi)
            if (target.seller_id) {
              const { data: sellerProfile } = await supabase
                .from('profiles')
                .select('money')
                .eq('id', target.seller_id)
                .maybeSingle();
              if (sellerProfile) {
                const taxRate = TAX_RATE_STANDARD; // %2.5 (eski 0.08 hatası düzeltildi)
                const sellerRevenue = Math.round(buyPrice * (1 - taxRate));
                await supabase
                  .from('profiles')
                  .update({ money: (sellerProfile.money || 0) + sellerRevenue })
                  .eq('id', target.seller_id);
              }
            }

            // BUG-4: Bot'un salary_load bilgisini güncelle
            try {
              await supabase
                .from('profiles')
                .update({ total_salary_load: salaryInfo.currentSalaryLoad + ((target.player_data?.salary || 0)) })
                .eq('id', botUserId);
            } catch (salErr) {
              console.warn('[botService] salary_load update failed:', salErr);
            }

            bought = true;
            const ppr = Math.round(buyPrice / Math.max(1, playerCheck.rating));
            details.push(`Bought ${playerCheck.name} (OVR ${playerCheck.rating}) for ${buyPrice.toLocaleString()} € (€${ppr}/OVR, budget: ${budget.toLocaleString()} €, VFM: ${scored[0].vfmScore.toFixed(1)})`);
          }
        } else {
          details.push('No affordable players on market');
        }
        } // end of else (salary not overloaded)
      }
    } else if (dailyBuys >= BOT_MAX_DAILY_BUYS) {
      details.push(`Daily buy limit reached (${dailyBuys}/${BOT_MAX_DAILY_BUYS})`);
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
      // TODO: Migrate to RPC (BUG-1) — active_tactics.upsert will fail once RLS is enforced;
      // could use rpc_update_tactics but bot context may need service-role bypass
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
// Make Tactical Decision — Score-aware in-match bot AI
// ---------------------------------------------------------------------------

export async function makeTacticalDecision(
  botUserId: string,
  _matchId: string,
  minute: number,
  scoreContext?: { botScore: number; oppScore: number; isHome: boolean }
): Promise<{ action: string; details: string; formation: string; mentality: number; pressing: boolean } | null> {
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
      .maybeSingle();

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

    let newFormation = currentFormation;
    let newMentality = currentMentality;
    let newPressing = currentPressing;
    const changes: string[] = [];

    // ── Score-aware tactical decisions ──
    if (scoreContext) {
      const { botScore, oppScore, isHome: _isHome } = scoreContext;
      const goalDiff = botScore - oppScore;

      // Losing by 2+ after minute 60 → switch to 3-4-3, mentality 5, pressing=true
      if (goalDiff <= -2 && minute >= 60) {
        newFormation = '3-4-3';
        newMentality = 5;
        newPressing = true;
        changes.push(`→ 3-4-3 tam hücum (geride: ${botScore}-${oppScore})`);
      }
      // Losing by 1 after minute 70 → switch to 4-3-3 or 3-4-3, mentality 4, pressing=true
      else if (goalDiff === -1 && minute >= 70) {
        newFormation = currentFormation === '4-4-2' ? '4-3-3' : '3-4-3';
        newMentality = 4;
        newPressing = true;
        changes.push(`→ ${newFormation} hücum (1 geri: ${botScore}-${oppScore})`);
      }
      // Winning by 2+ after minute 70 → switch to 5-3-2 or 5-4-1, mentality 2, pressing=false
      else if (goalDiff >= 2 && minute >= 70) {
        newFormation = '5-3-2';
        newMentality = 2;
        newPressing = false;
        changes.push(`→ 5-3-2 defansif (önde: ${botScore}-${oppScore})`);
      }
      // Drawing after minute 75 — check league position context
      else if (goalDiff === 0 && minute >= 75) {
        // Check if bot is in relegation zone
        const leaguePosition = await getBotLeaguePosition(botUserId);
        if (leaguePosition !== null && leaguePosition.isRelegationZone) {
          // Relegation zone: push for win
          newFormation = '3-4-3';
          newMentality = 4;
          newPressing = true;
          changes.push(`→ 3-4-3 galibiyet arayışı (düşme hattı, berabere: ${botScore}-${oppScore})`);
        } else {
          // Mid-table or top: stay balanced, no change
          changes.push(`Dengeli kal (berabere: ${botScore}-${oppScore})`);
        }
      }
    } else {
      // ── Fallback: minute-based logic (no score context) ──
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
    }

    if (changes.length === 0) return null;

    // Taktik güncelle
    // TODO: Migrate to RPC (BUG-1) — active_tactics.upsert will fail once RLS is enforced
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
      formation: newFormation,
      mentality: newMentality,
      pressing: newPressing,
    };
  } catch (err) {
    console.error('[botService] makeTacticalDecision error:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper: Get bot's league position context
// ---------------------------------------------------------------------------

async function getBotLeaguePosition(
  botUserId: string
): Promise<{ rank: number; totalTeams: number; isRelegationZone: boolean; isPromotionZone: boolean } | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    // Find the bot's league_team entry
    const { data: leagueTeam } = await supabase
      .from('league_teams')
      .select('id, league_id')
      .eq('profile_id', botUserId)
      .maybeSingle();

    if (!leagueTeam) return null;

    // Get all standings in the same league, sorted by points
    const { data: standings } = await supabase
      .from('league_standings')
      .select('team_id, points, gf, ga')
      .eq('league_id', leagueTeam.league_id)
      .order('points', { ascending: false });

    if (!standings || standings.length === 0) return null;

    // Determine rank by finding the bot's team position
    const totalTeams = standings.length;
    const botStandingIndex = standings.findIndex((s: any) => s.team_id === leagueTeam.id);
    if (botStandingIndex === -1) return null;

    const rank = botStandingIndex + 1;

    // Top 3 = promotion zone, Bottom 3 = relegation zone
    const isPromotionZone = rank <= 3;
    const isRelegationZone = rank > totalTeams - 3;

    return { rank, totalTeams, isRelegationZone, isPromotionZone };
  } catch (err) {
    console.warn('[botService] getBotLeaguePosition error:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Pre-Match Tactical Decision — considers league position
// ---------------------------------------------------------------------------

export async function makePreMatchTacticalDecision(
  botUserId: string,
  _leagueId?: string
): Promise<{ formation: string; mentality: number; pressing: boolean } | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    // Bot profilini al
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, team_name, is_bot, bot_difficulty')
      .eq('id', botUserId)
      .maybeSingle();

    if (!profile?.is_bot) return null;

    const difficulty = profile.bot_difficulty || 1;

    // Get league position context
    const leaguePosition = await getBotLeaguePosition(botUserId);

    // Fetch bot's squad for formation selection
    const { data: squad } = await supabase
      .from('players')
      .select('position, rating')
      .eq('profile_id', botUserId);

    const botSquad = (squad || []) as BotPlayer[];

    // Default balanced tactic
    let formation = '4-4-2';
    let mentality = 3;
    let pressing = false;

    if (leaguePosition) {
      if (leaguePosition.isPromotionZone) {
        // Top 3 (promotion zone) → balanced tactic
        formation = selectFormationForBot(botSquad, difficulty);
        // Prefer 4-4-2 or 4-3-3 for balanced play
        if (!['4-4-2', '4-3-3'].includes(formation)) {
          formation = '4-4-2';
        }
        mentality = 3; // Balanced
        pressing = difficulty >= 2;
      } else if (leaguePosition.isRelegationZone) {
        // Bottom 3 (relegation zone) → attacking tactic
        formation = botSquad.filter(p => mapToGroup(p.position) === 'FWD').length >= 4
          ? '4-3-3'
          : '3-4-3';
        mentality = 4 + (difficulty >= 3 ? 1 : 0); // 4-5
        mentality = Math.min(mentality, 5);
        pressing = true;
      } else {
        // Mid-table safe → give experienced players chance
        formation = selectFormationForBot(botSquad, Math.max(1, difficulty - 1));
        // Prefer defensive/balanced formations
        if (['3-4-3'].includes(formation)) {
          formation = '4-4-2';
        }
        mentality = 2 + (difficulty >= 2 ? 1 : 0); // 2-3
        pressing = false;
      }
    } else {
      // No league position data — use difficulty-based defaults
      formation = selectFormationForBot(botSquad, difficulty);
      mentality = difficulty === 3 ? 4 : 3;
      pressing = difficulty >= 2;
    }

    // Upsert pre-match tactic to active_tactics
    // TODO: Migrate to RPC (BUG-1) — active_tactics.upsert will fail once RLS is enforced
    await supabase.from('active_tactics').upsert({
      id: botUserId,
      profile_id: botUserId,
      formation,
      mentality,
      pressing,
      defense_line: mentality >= 4 ? 'onde' : 'standart',
      tempo: mentality >= 4 ? 80 : 50,
    }, { onConflict: 'id' });

    return { formation, mentality, pressing };
  } catch (err) {
    console.error('[botService] makePreMatchTacticalDecision error:', err);
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

    // 2. Generate squad (23 players: 2 GK, 8 DEF, 7 MID, 6 FWD)
    const posCounts: Record<string, number> = { GK: 2, DEF: 8, MID: 7, FWD: 6 };
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
