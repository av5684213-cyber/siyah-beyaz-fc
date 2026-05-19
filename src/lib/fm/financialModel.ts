// ═══════════════════════════════════════════════════════════════════
//  Managerium – Financial Model
//  Comprehensive revenue, expense, sponsor, broadcast, and FFP system
// ═══════════════════════════════════════════════════════════════════

import type { Player, Profile } from './types';

// ─── Interfaces ──────────────────────────────────────────────────

export interface RevenueSource {
  id: string;
  name: string;                // Turkish
  nameEn: string;
  category: 'matchday' | 'commercial' | 'broadcast' | 'transfer' | 'prize';
  amount: number;
  frequency: 'weekly' | 'monthly' | 'seasonal' | 'per_match';
  isVariable: boolean;
  calculation: string;         // description of how it is derived
}

export interface ExpenseType {
  id: string;
  name: string;                // Turkish
  category: 'wages' | 'facility' | 'operation' | 'transfer' | 'agent';
  amount: number;
  frequency: 'weekly' | 'monthly' | 'seasonal';
}

export interface FinancialOverview {
  weeklyRevenue: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  seasonRevenue: number;
  seasonExpenses: number;
  seasonProfit: number;
  totalWages: number;
  wageBillLimit: number;
  wageUtilization: number;     // 0–100 %
  sponsorCount: number;
  sponsorRevenue: number;
  matchdayRevenue: number;
  broadcastRevenue: number;
  transferRevenue: number;
  transferSpending: number;
}

export interface Sponsor {
  id: string;
  name: string;
  type: 'kit' | 'shirt' | 'stadium' | 'training_ground';
  annualValue: number;
  weeklyPayout: number;
  durationWeeks: number;
  weeksRemaining: number;
  bonusConditions: SponsorBonusCondition[];
  prestige: 1 | 2 | 3 | 4 | 5;
  satisfaction: number;        // 0–100
}

export interface SponsorBonusCondition {
  type: 'league_position' | 'cup_round' | 'fan_milestone' | 'attendance';
  threshold: number;
  bonus: number;
}

export interface BroadcastDeal {
  id: string;
  name: string;
  annualValue: number;
  weeklyPayout: number;
  perMatchBonus: number;
  positionBonuses: BroadcastPositionBonus[];
  durationWeeks: number;
  weeksRemaining: number;
}

export interface BroadcastPositionBonus {
  minPosition: number;
  bonus: number;
}

export interface RevenueBreakdown {
  matchday: RevenueSource[];
  commercial: RevenueSource[];
  broadcast: RevenueSource[];
  transfer: RevenueSource[];
  prize: RevenueSource[];
  total: number;
}

export interface ExpenseBreakdown {
  wages: ExpenseType[];
  facility: ExpenseType[];
  operation: ExpenseType[];
  transfer: ExpenseType[];
  agent: ExpenseType[];
  total: number;
}

export type FinancialHealthStatus = 'healthy' | 'warning' | 'critical' | 'bankrupt';

// ─── Revenue Calculation ─────────────────────────────────────────

/**
 * Calculates weekly revenue for a team, broken down by source.
 *
 * @param profile          Team profile (capacity, ticket price, reputation, sponsors)
 * @param lastMatchAttendance  Attendance of the most recent match (default 0)
 * @param isHome           Whether the upcoming / last match was at home
 * @param leaguePosition   Current league position (1-based)
 * @param tier             League tier (1 = Süper Lig)
 */
export function calculateWeeklyRevenue(
  profile: Profile,
  lastMatchAttendance?: number,
  isHome?: boolean,
  leaguePosition?: number,
  tier: number = 1,
): RevenueBreakdown {
  const capacity = profile.stadium_capacity ?? 15000;
  const ticketPrice = profile.ticket_price ?? 50;
  const avgFillRate = 0.7;
  const isHomeMatch = isHome ?? false;

  const sources: RevenueSource[] = [];

  // ── Matchday Revenue ─────────────────────────────────────────
  const matchdaySources: RevenueSource[] = [];

  if (isHomeMatch) {
    const expectedAttendance = Math.round(capacity * avgFillRate);
    const actualAttendance = lastMatchAttendance ?? expectedAttendance;
    const ticketRevenue = actualAttendance * ticketPrice;

    matchdaySources.push({
      id: 'ticket_sales',
      name: 'Bilet Satışları',
      nameEn: 'Ticket Sales',
      category: 'matchday',
      amount: ticketRevenue,
      frequency: 'per_match',
      isVariable: true,
      calculation: `seyirci (${actualAttendance.toLocaleString('tr-TR')}) × bilet fiyatı (${ticketPrice} €)`,
    });

    // VIP / Hospitality revenue ≈ 8 % of ticket revenue
    const hospitalityRevenue = Math.round(ticketRevenue * 0.08);
    matchdaySources.push({
      id: 'hospitality',
      name: 'VIP ve Misafirlik',
      nameEn: 'Hospitality',
      category: 'matchday',
      amount: hospitalityRevenue,
      frequency: 'per_match',
      isVariable: true,
      calculation: 'bilet gelirinin %8\'i',
    });

    // Merchandise per home match ≈ reputation-dependent
    const merchBase = 15000;
    const merchRevenue = Math.round(merchBase * (profile.reputation / 50));
    matchdaySources.push({
      id: 'merchandise',
      name: 'Souvenir ve Forma Satışları',
      nameEn: 'Merchandise',
      category: 'matchday',
      amount: merchRevenue,
      frequency: 'per_match',
      isVariable: true,
      calculation: `temel matrah ${merchBase.toLocaleString('tr-TR')} € × itibar çarpanı (${(profile.reputation / 50).toFixed(2)})`,
    });

    // Parking & F&B
    const parkingFbRevenue = Math.round(actualAttendance * 12);
    matchdaySources.push({
      id: 'parking_fb',
      name: 'Otopark ve Yiyecek-İçecek',
      nameEn: 'Parking & Food & Beverage',
      category: 'matchday',
      amount: parkingFbRevenue,
      frequency: 'per_match',
      isVariable: true,
      calculation: `seyirci (${actualAttendance.toLocaleString('tr-TR')}) × ortalama 12 €`,
    });
  }

  // Away match – minimal merch at stadium shop
  if (!isHomeMatch) {
    matchdaySources.push({
      id: 'shop_sales_away',
      name: 'Mağaza Satışları (Deplasman)',
      nameEn: 'Club Shop Sales (Away)',
      category: 'matchday',
      amount: 5000,
      frequency: 'weekly',
      isVariable: true,
      calculation: 'sabit mağaza cirosu (deplasman haftası)',
    });
  }

  // ── Commercial Revenue ───────────────────────────────────────
  const commercialSources: RevenueSource[] = [];

  // Sponsor weekly payouts
  const existingSponsors = (profile.sponsors ?? []) as unknown as Sponsor[];
  let weeklySponsorIncome = 0;
  for (const sp of existingSponsors) {
    weeklySponsorIncome += sp.weeklyPayout;
  }
  if (weeklySponsorIncome > 0) {
    commercialSources.push({
      id: 'sponsor_payouts',
      name: 'Sponsor Ödemeleri',
      nameEn: 'Sponsor Payouts',
      category: 'commercial',
      amount: weeklySponsorIncome,
      frequency: 'weekly',
      isVariable: false,
      calculation: `${existingSponsors.length} aktif sponsorun haftalık ödemesi`,
    });
  }

  // Kit sales – reputation based
  const kitWeekly = Math.round(8000 * (profile.reputation / 50));
  commercialSources.push({
    id: 'kit_sales',
    name: 'Forma Satışları',
    nameEn: 'Kit Sales',
    category: 'commercial',
    amount: kitWeekly,
    frequency: 'weekly',
    isVariable: true,
    calculation: `temel 8.000 € × itibar çarpanı (${(profile.reputation / 50).toFixed(2)})`,
  });

  // Commercial partner income based on reputation
  const partnerIncome = Math.round(profile.reputation * 200);
  if (partnerIncome > 0) {
    commercialSources.push({
      id: 'commercial_partners',
      name: 'Ticari Ortak Gelirleri',
      nameEn: 'Commercial Partner Revenue',
      category: 'commercial',
      amount: partnerIncome,
      frequency: 'weekly',
      isVariable: true,
      calculation: `itibar (${profile.reputation}) × 200 €`,
    });
  }

  // ── Broadcast Revenue ────────────────────────────────────────
  const broadcastSources: RevenueSource[] = [];

  const tierMultiplier = { 1: 1, 2: 0.45, 3: 0.18, 4: 0.06 }[tier] ?? 0.06;
  const baseWeeklyBroadcast = Math.round(350_000 * tierMultiplier);

  broadcastSources.push({
    id: 'broadcast_weekly',
    name: 'Yayın Geliri',
    nameEn: 'Broadcast Revenue',
    category: 'broadcast',
    amount: baseWeeklyBroadcast,
    frequency: 'weekly',
    isVariable: false,
    calculation: `temel 350.000 € × lig seviye çarpanı (${tierMultiplier})`,
  });

  // Per-match broadcast bonus
  if (isHomeMatch) {
    const matchBonus = Math.round(120_000 * tierMultiplier);
    broadcastSources.push({
      id: 'broadcast_per_match',
      name: 'Maç Başı Yayın Bonusu',
      nameEn: 'Per-Match Broadcast Bonus',
      category: 'broadcast',
      amount: matchBonus,
      frequency: 'per_match',
      isVariable: true,
      calculation: `120.000 € × lig seviye çarpanı (${tierMultiplier})`,
    });
  }

  // Position bonus (paid weekly for top-half finish in higher tiers)
  if (leaguePosition && leaguePosition <= 9 && tier <= 2) {
    const posBonus = Math.round((10 - leaguePosition) * 30_000 * tierMultiplier);
    broadcastSources.push({
      id: 'broadcast_position',
      name: 'Sıralama Yayın Bonusu',
      nameEn: 'Position Broadcast Bonus',
      category: 'broadcast',
      amount: posBonus,
      frequency: 'weekly',
      isVariable: true,
      calculation: `lig pozisyonu ${leaguePosition} → 30.000 € × (10 - ${leaguePosition}) × seviye çarpanı`,
    });
  }

  // ── Transfer Revenue (weekly amortised) ──────────────────────
  const transferSources: RevenueSource[] = [];

  // Estimate weekly transfer revenue from profile data
  const avgTransferIncomePerSale = Math.round(500_000 * (profile.reputation / 50));
  const estimatedSalesPerSeason = Math.max(1, Math.floor(profile.reputation / 25));
  const weeklyAmortisedTransfer = Math.round((avgTransferIncomePerSale * estimatedSalesPerSeason) / 42);
  if (weeklyAmortisedTransfer > 0) {
    transferSources.push({
      id: 'transfer_sales_amortised',
      name: 'Oyuncu Satış Geliri (Amortisman)',
      nameEn: 'Player Sales Revenue (Amortised)',
      category: 'transfer',
      amount: weeklyAmortisedTransfer,
      frequency: 'weekly',
      isVariable: true,
      calculation: `ortalama satış ${avgTransferIncomePerSale.toLocaleString('tr-TR')} € × sezon başı ${estimatedSalesPerSeason} satış / 42 hafta`,
    });
  }

  // ── Prize Revenue (weekly amortised) ─────────────────────────
  const prizeSources: RevenueSource[] = [];

  // League prize money based on position and tier
  if (leaguePosition) {
    const tierPrizePool: Record<number, number> = { 1: 50_000_000, 2: 15_000_000, 3: 5_000_000, 4: 1_500_000 };
    const pool = tierPrizePool[tier] ?? tierPrizePool[4];
    const positionShare = Math.max(0.02, (20 - leaguePosition) / 190); // top team ≈ 10%, bottom ≈ 2%
    const seasonPrize = Math.round(pool * positionShare);
    const weeklyPrize = Math.round(seasonPrize / 42);
    if (weeklyPrize > 0) {
      prizeSources.push({
        id: 'league_prize',
        name: 'Lig Ödülü (Amortisman)',
        nameEn: 'League Prize (Amortised)',
        category: 'prize',
        amount: weeklyPrize,
        frequency: 'weekly',
        isVariable: true,
        calculation: `lig ${tier}. seviye havuz ${pool.toLocaleString('tr-TR')} € × pozisyon payı ${(positionShare * 100).toFixed(1)}% / 42 hafta`,
      });
    }
  }

  // Cup progress bonus (estimated based on reputation)
  const cupProgressBonus = Math.round(200_000 * (profile.reputation / 50));
  const weeklyCupPrize = Math.round(cupProgressBonus / 42);
  if (weeklyCupPrize > 0 && profile.reputation >= 20) {
    prizeSources.push({
      id: 'cup_prize',
      name: 'Kup Ödülü (Amortisman)',
      nameEn: 'Cup Prize (Amortised)',
      category: 'prize',
      amount: weeklyCupPrize,
      frequency: 'weekly',
      isVariable: true,
      calculation: `itibar çarpanı (${(profile.reputation / 50).toFixed(2)}) × temel 200.000 € / 42 hafta`,
    });
  }

  // ── Totals ───────────────────────────────────────────────────
  const sum = (arr: RevenueSource[]) => arr.reduce((s, r) => s + r.amount, 0);

  return {
    matchday: matchdaySources,
    commercial: commercialSources,
    broadcast: broadcastSources,
    transfer: transferSources,
    prize: prizeSources,
    total: sum(matchdaySources) + sum(commercialSources) + sum(broadcastSources) + sum(transferSources) + sum(prizeSources),
  };
}

// ─── Expense Calculation ─────────────────────────────────────────

/**
 * Calculates weekly expenses for a squad.
 *
 * @param squad              Array of players in the team
 * @param stadiumUpgrades    Stadium upgrade levels
 * @param academyLevel       Academy level (0–5)
 * @param tier               League tier (affects some costs)
 */
export function calculateWeeklyExpenses(
  squad: Player[],
  stadiumUpgrades?: Record<string, number>,
  academyLevel: number = 0,
  tier: number = 1,
): ExpenseBreakdown {
  const expenses: ExpenseType[] = [];
  const wages: ExpenseType[] = [];
  const facility: ExpenseType[] = [];
  const operation: ExpenseType[] = [];
  const transfer: ExpenseType[] = [];
  const agent: ExpenseType[] = [];

  // ── Wages ────────────────────────────────────────────────────
  const totalWages = squad.reduce((sum, p) => sum + p.salary, 0);
  wages.push({
    id: 'player_wages',
    name: 'Oyuncu Maaşları',
    category: 'wages',
    amount: totalWages,
    frequency: 'weekly',
  });

  // Agent fees – ~3 % of total wages
  const agentWeekly = Math.round(totalWages * 0.03);
  agent.push({
    id: 'agent_fees',
    name: 'Menajer Komisyonları',
    category: 'agent',
    amount: agentWeekly,
    frequency: 'weekly',
  });

  // ── Facility Maintenance ─────────────────────────────────────
  const upgrades = stadiumUpgrades ?? {};
  const stadiumLevel = upgrades['stadium'] ?? 1;
  const trainingLevel = upgrades['training'] ?? 1;
  const medicalLevel = upgrades['medical'] ?? 1;
  const youthLevel = upgrades['youth'] ?? 1;

  const stadiumMaint = Math.round(8_000 * stadiumLevel);
  const trainingMaint = Math.round(4_000 * trainingLevel);
  const medicalMaint = Math.round(3_500 * medicalLevel);
  const youthMaint = Math.round(2_500 * youthLevel);

  facility.push(
    {
      id: 'stadium_maintenance',
      name: 'Stadyum Bakım',
      category: 'facility',
      amount: stadiumMaint,
      frequency: 'weekly',
    },
    {
      id: 'training_ground_maint',
      name: 'Antrenman Tesisleri Bakım',
      category: 'facility',
      amount: trainingMaint,
      frequency: 'weekly',
    },
    {
      id: 'medical_center_maint',
      name: 'Tıbbi Merkez İşletme',
      category: 'facility',
      amount: medicalMaint,
      frequency: 'weekly',
    },
    {
      id: 'youth_facility_maint',
      name: 'Altyapı Tesisleri İşletme',
      category: 'facility',
      amount: youthMaint,
      frequency: 'weekly',
    },
  );

  // ── Academy Running Costs ────────────────────────────────────
  const academyCostPerLevel = 6_000;
  const academyWeekly = academyLevel * academyCostPerLevel;
  if (academyWeekly > 0) {
    operation.push({
      id: 'academy_running',
      name: 'Akademi İşletme Masrafları',
      category: 'operation',
      amount: academyWeekly,
      frequency: 'weekly',
    });
  }

  // ── Staff Costs ──────────────────────────────────────────────
  const staffCount = 15 + stadiumLevel * 3 + trainingLevel * 2;
  const staffCost = staffCount * 1_800;
  operation.push({
    id: 'staff_costs',
    name: 'Personel Giderleri',
    category: 'operation',
    amount: staffCost,
    frequency: 'weekly',
  });

  // Travel / logistics (higher for away weeks, averaged here)
  const travelBase = tier <= 2 ? 12_000 : 6_000;
  operation.push({
    id: 'travel_logistics',
    name: 'Seyahat ve Lojistik',
    category: 'operation',
    amount: travelBase,
    frequency: 'weekly',
  });

  // Security & insurance
  const securityInsurance = Math.round(5_000 * stadiumLevel);
  operation.push({
    id: 'security_insurance',
    name: 'Güvenlik ve Sigorta',
    category: 'operation',
    amount: securityInsurance,
    frequency: 'weekly',
  });

  // ── Transfer Amortisation ─────────────────────────────────────
  const totalSquadValue = squad.reduce((sum, p) => sum + (p.market_value ?? 0), 0);
  const amortisationWeekly = Math.round(totalSquadValue / (42 * 3)); // spread over 3 seasons (156 weeks)
  if (amortisationWeekly > 0) {
    transfer.push({
      id: 'transfer_amortisation',
      name: 'Transfer Amortismanı',
      category: 'transfer',
      amount: amortisationWeekly,
      frequency: 'weekly',
    });
  }

  // ── Totals ───────────────────────────────────────────────────
  const sumExp = (arr: ExpenseType[]) => arr.reduce((s, e) => s + e.amount, 0);

  return {
    wages,
    facility,
    operation,
    transfer,
    agent,
    total: sumExp(wages) + sumExp(facility) + sumExp(operation) + sumExp(transfer) + sumExp(agent),
  };
}

// ─── Sponsor Offer Generation ────────────────────────────────────

const SPONSOR_NAMES_KIT = [
  'AeroSport', 'TeknoFit', 'BüyükEnerji', 'KartalBeyaz', 'TurkcellMax',
  'YıldızYakıt', 'SaharaSoft', 'KırmızıFırtına', 'AltınBurun', 'BuzMavi',
];
const SPONSOR_NAMES_SHIRT = [
  'ZiraatBankası', 'HalkFinans', 'AnadoluGrup', 'TürkTelekom', 'GarantiBBVA',
  'AkbankYıldız', 'İşCep', 'VodafoneKırmızı', 'TürkHavaYolları', 'Pirelli',
];
const SPONSOR_NAMES_STADIUM = [
  'MegaStadyum', 'GüneşPark', 'BoğazArena', 'KartalArena', 'AnadoluPark',
  'YıldızStadyum', 'AltınSaha', 'FırtınaArena', 'MaviArena', 'EgePark',
];
const SPONSOR_NAMES_TRAINING = [
  'ProTraining', 'FitLife', 'SportMax', 'EurosportTR', 'PowerGym',
  'AktifYaşam', 'SporAkademi', 'PerformanceLab', 'FitPlus', 'MaxPower',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Generates a sponsor offer appropriate for the team's standing.
 */
export function generateSponsorOffer(
  leaguePosition: number,
  reputation: number,
  stadiumCapacity: number,
): Sponsor {
  const typePool = leaguePosition <= 5
    ? (['kit', 'shirt', 'stadium', 'training_ground'] as const)
    : leaguePosition <= 12
    ? (['kit', 'shirt', 'training_ground'] as const)
    : (['kit', 'training_ground'] as const);

  const type = pickRandom([...typePool]);

  const namePool =
    type === 'kit' ? SPONSOR_NAMES_KIT
    : type === 'shirt' ? SPONSOR_NAMES_SHIRT
    : type === 'stadium' ? SPONSOR_NAMES_STADIUM
    : SPONSOR_NAMES_TRAINING;

  const name = pickRandom(namePool);

  // Value scaled by reputation (0-100), position, and type
  const repMultiplier = reputation / 50;
  const posMultiplier = Math.max(0.3, (20 - leaguePosition) / 18);
  const typeMultiplier =
    type === 'kit' ? 1
    : type === 'shirt' ? 2.5
    : type === 'stadium' ? 4
    : 0.6;

  const baseValues: Record<string, number> = {
    kit: 800_000,
    shirt: 2_500_000,
    stadium: 5_000_000,
    training_ground: 400_000,
  };

  const annualValue = Math.round(
    baseValues[type] * repMultiplier * posMultiplier * typeMultiplier,
  );
  const weeklyPayout = Math.round(annualValue / 52);
  const durationWeeks = type === 'stadium' ? 156 : type === 'shirt' ? 104 : 78; // 3yr / 2yr / 1.5yr

  // Prestige 1–5
  const prestige = Math.min(5, Math.max(1, Math.ceil(repMultiplier * posMultiplier * 3))) as 1 | 2 | 3 | 4 | 5;

  // Bonus conditions
  const bonusConditions: SponsorBonusCondition[] = [];
  if (leaguePosition <= 10) {
    bonusConditions.push({
      type: 'league_position',
      threshold: 3,
      bonus: Math.round(annualValue * 0.15),
    });
  }
  if (stadiumCapacity > 20000) {
    bonusConditions.push({
      type: 'attendance',
      threshold: Math.round(stadiumCapacity * 0.85),
      bonus: Math.round(annualValue * 0.08),
    });
  }

  return {
    id: generateId(),
    name,
    type,
    annualValue,
    weeklyPayout,
    durationWeeks,
    weeksRemaining: durationWeeks,
    bonusConditions,
    prestige,
    satisfaction: 50 + Math.round(reputation / 10),
  };
}

// ─── Broadcast Deal Generation ───────────────────────────────────

/**
 * Generates a broadcast deal for a given league tier and position.
 */
export function generateBroadcastDeal(
  tier: number,
  leaguePosition: number,
): BroadcastDeal {
  const tierData: Record<number, { name: string; annual: number; match: number; positions: BroadcastPositionBonus[] }> = {
    1: {
      name: 'Süper Lig Yayın Hakları',
      annual: 18_000_000,
      match: 350_000,
      positions: [
        { minPosition: 1, bonus: 15_000_000 },
        { minPosition: 2, bonus: 12_000_000 },
        { minPosition: 3, bonus: 9_000_000 },
        { minPosition: 4, bonus: 6_000_000 },
        { minPosition: 6, bonus: 3_000_000 },
      ],
    },
    2: {
      name: '1. Lig Yayın Hakları',
      annual: 6_000_000,
      match: 120_000,
      positions: [
        { minPosition: 1, bonus: 5_000_000 },
        { minPosition: 2, bonus: 3_500_000 },
        { minPosition: 3, bonus: 2_000_000 },
      ],
    },
    3: {
      name: '2. Lig Yayın Hakları',
      annual: 1_800_000,
      match: 40_000,
      positions: [
        { minPosition: 1, bonus: 1_500_000 },
        { minPosition: 2, bonus: 800_000 },
      ],
    },
    4: {
      name: '3. Lig Yayın Hakları',
      annual: 500_000,
      match: 12_000,
      positions: [],
    },
  };

  const data = tierData[tier] ?? tierData[4];

  // Position bonus lookup
  const positionBonus = data.positions
    .filter((p) => leaguePosition >= p.minPosition)
    .sort((a, b) => b.minPosition - a.minPosition)[0]?.bonus ?? 0;

  // Adjusted annual value based on position
  const posMultiplier = Math.max(0.5, 1 - (leaguePosition - 1) * 0.03);
  const adjustedAnnual = Math.round((data.annual + positionBonus) * posMultiplier);
  const weeklyPayout = Math.round(adjustedAnnual / 52);

  const durationWeeks = tier <= 2 ? 156 : 104; // 3-year / 2-year deals

  return {
    id: generateId(),
    name: data.name,
    annualValue: adjustedAnnual,
    weeklyPayout,
    perMatchBonus: data.match,
    positionBonuses: data.positions,
    durationWeeks,
    weeksRemaining: durationWeeks,
  };
}

// ─── Wage Bill Limit (UEFA FFP-style) ───────────────────────────

/**
 * Calculates the maximum allowed total weekly wages based on revenue.
 * UEFA FFP rule: 70 % of revenue may go to wages.
 *
 * @param annualRevenue  Projected annual revenue (in currency units)
 */
export function calculateWageBillLimit(annualRevenue: number): number {
  const FFP_RATIO = 0.70;
  return Math.round((annualRevenue * FFP_RATIO) / 52);
}

// ─── Financial Health Check ──────────────────────────────────────

/**
 * Evaluates the financial health of a club.
 *
 * Criteria:
 * - weeklyProfit negative for > 4 weeks → warning
 * - wageUtilization > 90 % → warning
 * - cash (profile.money) < 4 weeks of expenses → critical
 * - cash < 0 → bankrupt
 */
export function checkFinancialHealth(
  financialOverview: FinancialOverview,
  currentCash: number,
  consecutiveLossWeeks: number = 0,
): FinancialHealthStatus {
  // Bankrupt – negative cash
  if (currentCash < 0) {
    return 'bankrupt';
  }

  // Weeks of runway
  const weeklyBurn = financialOverview.weeklyExpenses - financialOverview.weeklyRevenue;
  if (weeklyBurn > 0) {
    const weeksRunway = currentCash / weeklyBurn;
    if (weeksRunway < 2) {
      return 'critical';
    }
  }

  // Critical indicators
  const isCritical =
    financialOverview.wageUtilization > 95 ||
    consecutiveLossWeeks > 8 ||
    (weeklyBurn > 0 && currentCash / weeklyBurn < 3);

  if (isCritical) {
    return 'critical';
  }

  // Warning indicators
  const isWarning =
    financialOverview.wageUtilization > 85 ||
    consecutiveLossWeeks > 4 ||
    financialOverview.weeklyProfit < 0;

  if (isWarning) {
    return 'warning';
  }

  return 'healthy';
}

// ─── Helper: Build Financial Overview ────────────────────────────

/**
 * Convenience function to build a full FinancialOverview snapshot.
 */
export function buildFinancialOverview(
  profile: Profile,
  squad: Player[],
  options?: {
    isHome?: boolean;
    lastMatchAttendance?: number;
    leaguePosition?: number;
    tier?: number;
    consecutiveLossWeeks?: number;
    transferRevenueWeek?: number;
    transferSpendingWeek?: number;
  },
): FinancialOverview & { healthStatus: FinancialHealthStatus } {
  const {
    isHome = false,
    lastMatchAttendance,
    leaguePosition = 10,
    tier = 1,
    transferRevenueWeek = 0,
    transferSpendingWeek = 0,
  } = options ?? {};

  const revenueBreakdown = calculateWeeklyRevenue(
    profile,
    lastMatchAttendance,
    isHome,
    leaguePosition,
    tier,
  );
  const expenseBreakdown = calculateWeeklyExpenses(
    squad,
    profile.stadium_upgrades,
    profile.academy_level,
    tier,
  );

  const weeklyRevenue = revenueBreakdown.total + transferRevenueWeek;
  const weeklyExpenses = expenseBreakdown.total + transferSpendingWeek;
  const weeklyProfit = weeklyRevenue - weeklyExpenses;

  const WEEKS_PER_MONTH = 4.33;
  const WEEKS_PER_SEASON = 42;

  const monthlyRevenue = Math.round(weeklyRevenue * WEEKS_PER_MONTH);
  const monthlyExpenses = Math.round(weeklyExpenses * WEEKS_PER_MONTH);
  const monthlyProfit = monthlyRevenue - monthlyExpenses;

  const seasonRevenue = Math.round(weeklyRevenue * WEEKS_PER_SEASON);
  const seasonExpenses = Math.round(weeklyExpenses * WEEKS_PER_SEASON);
  const seasonProfit = seasonRevenue - seasonExpenses;

  const totalWages = expenseBreakdown.wages.reduce((s, e) => s + e.amount, 0);
  const projectedAnnual = seasonRevenue;
  const wageBillLimit = calculateWageBillLimit(projectedAnnual);
  const wageUtilization = wageBillLimit > 0
    ? Math.min(100, Math.round((totalWages / wageBillLimit) * 100))
    : 0;

  const sponsors = (profile.sponsors ?? []) as unknown as Sponsor[];
  const sponsorCount = sponsors.length;
  const sponsorRevenue = sponsors.reduce((s, sp) => s + sp.weeklyPayout, 0);

  const matchdayRevenue = revenueBreakdown.matchday.reduce((s, r) => s + r.amount, 0);
  const broadcastRevenue = revenueBreakdown.broadcast.reduce((s, r) => s + r.amount, 0);
  const transferRevenue = revenueBreakdown.transfer.reduce((s, r) => s + r.amount, 0) + transferRevenueWeek;

  const overview: FinancialOverview = {
    weeklyRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyRevenue,
    monthlyExpenses,
    monthlyProfit,
    seasonRevenue,
    seasonExpenses,
    seasonProfit,
    totalWages,
    wageBillLimit,
    wageUtilization,
    sponsorCount,
    sponsorRevenue,
    matchdayRevenue,
    broadcastRevenue,
    transferRevenue,
    transferSpending: transferSpendingWeek,
  };

  const healthStatus = checkFinancialHealth(overview, profile.money, options?.consecutiveLossWeeks);

  return { ...overview, healthStatus };
}

// ─── Financial Defaults ──────────────────────────────────────────

/** Default starting sponsors for a new team */
export const DEFAULT_STARTING_SPONSORS: Sponsor[] = [
  {
    id: 'default_kit_01',
    name: 'TeknoFit',
    type: 'kit',
    annualValue: 600_000,
    weeklyPayout: 11_538,
    durationWeeks: 78,
    weeksRemaining: 78,
    bonusConditions: [
      { type: 'league_position', threshold: 5, bonus: 60_000 },
    ],
    prestige: 2,
    satisfaction: 60,
  },
  {
    id: 'default_shirt_01',
    name: 'AnadoluGrup',
    type: 'shirt',
    annualValue: 1_200_000,
    weeklyPayout: 23_077,
    durationWeeks: 104,
    weeksRemaining: 104,
    bonusConditions: [
      { type: 'league_position', threshold: 3, bonus: 150_000 },
      { type: 'fan_milestone', threshold: 50_000, bonus: 80_000 },
    ],
    prestige: 3,
    satisfaction: 55,
  },
];

/** Default broadcast deal for a new team in tier 1 */
export const DEFAULT_BROADCAST_DEAL: BroadcastDeal = {
  id: 'default_broadcast_01',
  name: 'Süper Lig Yayın Hakları',
  annualValue: 10_000_000,
  weeklyPayout: 192_308,
  perMatchBonus: 200_000,
  positionBonuses: [
    { minPosition: 1, bonus: 8_000_000 },
    { minPosition: 2, bonus: 5_500_000 },
    { minPosition: 3, bonus: 3_500_000 },
    { minPosition: 4, bonus: 2_000_000 },
    { minPosition: 6, bonus: 800_000 },
  ],
  durationWeeks: 156,
  weeksRemaining: 156,
};

/** Default revenue sources for a new team */
export const FINANCIAL_DEFAULTS = {
  ticketPrice: 50,
  averageFillRate: 0.7,
  startingMoney: 10_000_000,
  maxSponsors: 5,
  maxBilateralDeals: 3,
  ffpWageRatio: 0.70,
  weeklyBaseExpenses: {
    stadiumMaintenance: 8_000,
    trainingGround: 4_000,
    medicalCenter: 3_500,
    youthFacility: 2_500,
    staffPerPerson: 1_800,
    baseStaffCount: 15,
    travelLowTier: 6_000,
    travelHighTier: 12_000,
  },
  revenuePerTicket: {
    vipMultiplier: 0.08,
    parkingPerPerson: 12,
    merchandiseBase: 15_000,
    kitSalesBase: 8_000,
  },
  sponsorTiers: {
    kit: { baseAnnual: 800_000 },
    shirt: { baseAnnual: 2_500_000 },
    stadium: { baseAnnual: 5_000_000 },
    training_ground: { baseAnnual: 400_000 },
  },
  broadcastTiers: {
    1: { label: 'Süper Lig', annualBase: 18_000_000, perMatch: 350_000 },
    2: { label: '1. Lig', annualBase: 6_000_000, perMatch: 120_000 },
    3: { label: '2. Lig', annualBase: 1_800_000, perMatch: 40_000 },
    4: { label: '3. Lig', annualBase: 500_000, perMatch: 12_000 },
  },
  financialHealthThresholds: {
    bankruptCash: 0,
    criticalRunwayWeeks: 3,
    warningWageUtilization: 85,
    criticalWageUtilization: 95,
    warningLossWeeks: 4,
    criticalLossWeeks: 8,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════
//  MAÇ GELİRİ FORMÜLLERİ (Match Revenue Formulas)
//  Stadyum seviyesi, lig pozisyonu ve bilet fiyatına göre
//  seyirci sayısı ve maç gelirini hesaplar.
//  GÖREV 6 → GÖREV 10 entegrasyonu
// ═══════════════════════════════════════════════════════════════════

/**
 * Stadyum seviyesine göre kapasiteyi hesaplar.
 * Temel 10.000 + seviye başına 2.000 kişi
 * @param stadiumLevel - Stadyum (capacity) seviyesi (0-10)
 * @returns Kapasite (seviye 0 → 10.000, seviye 5 → 20.000, seviye 10 → 30.000)
 */
export function calculateStadiumCapacity(stadiumLevel: number): number {
  return 10000 + stadiumLevel * 2000;
}

/**
 * Maç seyirci sayısını hesaplar.
 * Kapasite, lig pozisyonu ve bilet fiyatı etkili.
 * 
 * @param stadiumLevel - Stadyum seviyesi (0-10)
 * @param leaguePosition - Takımın lig sıralaması (1 = lider)
 * @param totalTeams - Toplam takım sayısı (ör: 18)
 * @param ticketPrice - Bilet fiyatı (ör: 50)
 * @returns Tahmini seyirci sayısı
 */
export function calculateAttendance(
  stadiumLevel: number,
  leaguePosition: number,
  totalTeams: number,
  ticketPrice: number,
): number {
  try {
    const capacity = calculateStadiumCapacity(stadiumLevel);
    // Lig pozisyonu faktörü: üst sıralar daha çok seyirci çeker
    const positionFactor = 0.5 + 0.5 * ((totalTeams - leaguePosition + 1) / totalTeams);
    const baseAttendance = capacity * positionFactor;
    // Fiyat faktörü: 50 ortalama fiyat, üstünde talep düşer, altında artar
    const priceFactor = Math.max(0.1, 1 - (ticketPrice - 50) / 100);
    return Math.floor(Math.min(capacity, baseAttendance * priceFactor));
  } catch {
    return 0;
  }
}

/**
 * Maç gelirini hesaplar (seyirci × bilet fiyatı).
 * 
 * @param stadiumLevel - Stadyum seviyesi (0-10)
 * @param leaguePosition - Takımın lig sıralaması (1 = lider)
 * @param totalTeams - Toplam takım sayısı (ör: 18)
 * @param ticketPrice - Bilet fiyatı (ör: 50)
 * @returns Maç geliri (Kredi)
 */
export function calculateMatchRevenue(
  stadiumLevel: number,
  leaguePosition: number,
  totalTeams: number,
  ticketPrice: number,
): number {
  try {
    const attendance = calculateAttendance(stadiumLevel, leaguePosition, totalTeams, ticketPrice);
    return attendance * ticketPrice;
  } catch {
    return 0;
  }
}
