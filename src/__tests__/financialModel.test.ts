/**
 * Touchline Manager — Finansal Model Testleri
 *
 * financialModel.ts modülünün tüm fonksiyonlarını test eder:
 * - calculateWeeklyRevenue: Haftalık gelir hesaplama
 * - calculateWeeklyExpenses: Haftalık gider hesaplama
 * - calculateWageBillLimit: FFP maaş sınırı
 * - checkFinancialHealth: Finansal sağlık kontrolü
 * - generateSponsorOffer: Sponsor teklifi üretimi
 * - generateBroadcastDeal: Yayın anlaşması üretimi
 * - calculateStadiumCapacity: Stadyum kapasitesi
 * - calculateAttendance: Seyirci hesaplama
 * - calculateMatchRevenue: Maç geliri hesaplama
 * - buildFinancialOverview: Tam finansal özet
 */

import {
  calculateWeeklyRevenue,
  calculateWeeklyExpenses,
  calculateWageBillLimit,
  checkFinancialHealth,
  generateSponsorOffer,
  generateBroadcastDeal,
  calculateStadiumCapacity,
  calculateAttendance,
  calculateMatchRevenueLegacy,
  calculateMatchRevenue,
  buildFinancialOverview,
  FINANCIAL_DEFAULTS,
} from '@/lib/fm/financialModel';
import type { Player, Profile } from '@/lib/fm/types';

// ═══════════════════════════════════════════════════════════════
// TEST VERİLERİ
// ═══════════════════════════════════════════════════════════════

function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'test-profile-1',
    manager_name: 'Test Manager',
    team_name: 'Test FC',
    level: 5,
    xp: 1000,
    money: 10_000_000,
    fans: 5000,
    reputation: 50,
    credits: 100,
    current_day: 100,
    stadium_capacity: 30000,
    ticket_price: 50,
    academy_level: 2,
    stadium_upgrades: { capacity: 3, training: 2, medical: 1 },
    sponsors: [],
    ...overrides,
  };
}

function createMockPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Test Player',
    position: 'MID',
    specificPosition: 'CM',
    rating: 75,
    age: 25,
    potential: 80,
    market_value: 500_000,
    salary: 10_000,
    nation: 'TR',
    defending: 60,
    passing: 75,
    shooting: 70,
    speed: 65,
    power: 68,
    cond: 85,
    form: 70,
    morale: 75,
    confidence: 70,
    hidden_potential: 78,
    traits: [],
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════
// STADYUM KAPASİTE TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('calculateStadiumCapacity', () => {
  test('Seviye 0 → 10.000 kapasite', () => {
    expect(calculateStadiumCapacity(0)).toBe(10000);
  });

  test('Seviye 5 → 20.000 kapasite', () => {
    expect(calculateStadiumCapacity(5)).toBe(20000);
  });

  test('Seviye 10 → 30.000 kapasite', () => {
    expect(calculateStadiumCapacity(10)).toBe(30000);
  });

  test('Her seviye +2.000 kapasite ekler', () => {
    for (let level = 0; level <= 10; level++) {
      expect(calculateStadiumCapacity(level)).toBe(10000 + level * 2000);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// SEYİRCİ HESAPLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('calculateAttendance', () => {
  test('Lider takım yüksek seyirci çeker', () => {
    const attendance = calculateAttendance(5, 1, 18, 50);
    expect(attendance).toBeGreaterThan(0);
    expect(attendance).toBeLessThanOrEqual(calculateStadiumCapacity(5));
  });

  test('Son sıradaki takım daha az seyirci çeker', () => {
    const topAttendance = calculateAttendance(5, 1, 18, 50);
    const bottomAttendance = calculateAttendance(5, 18, 18, 50);
    expect(topAttendance).toBeGreaterThan(bottomAttendance);
  });

  test('Yüksek bilet fiyatı seyirci azaltır', () => {
    const cheapAttendance = calculateAttendance(5, 5, 18, 30);
    const expensiveAttendance = calculateAttendance(5, 5, 18, 80);
    expect(cheapAttendance).toBeGreaterThanOrEqual(expensiveAttendance);
  });

  test('Seyirci kapasiteyi aşamaz', () => {
    const capacity = calculateStadiumCapacity(3);
    const attendance = calculateAttendance(3, 1, 18, 10);
    expect(attendance).toBeLessThanOrEqual(capacity);
  });

  test('Seyirci negatif olamaz', () => {
    const attendance = calculateAttendance(0, 18, 18, 200);
    expect(attendance).toBeGreaterThanOrEqual(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// MAÇ GELİRİ TESTLERİ (Legacy)
// ═══════════════════════════════════════════════════════════════

describe('calculateMatchRevenueLegacy', () => {
  test('Seyirci × bilet fiyatı = gelir', () => {
    const revenue = calculateMatchRevenueLegacy(5, 5, 18, 50);
    const attendance = calculateAttendance(5, 5, 18, 50);
    expect(revenue).toBe(attendance * 50);
  });

  test('Lider takım daha fazla gelir elde eder', () => {
    const topRevenue = calculateMatchRevenueLegacy(5, 1, 18, 50);
    const bottomRevenue = calculateMatchRevenueLegacy(5, 18, 18, 50);
    expect(topRevenue).toBeGreaterThan(bottomRevenue);
  });

  test('Yüksek stadyum seviyesi daha fazla gelir', () => {
    const lowLevelRevenue = calculateMatchRevenueLegacy(1, 5, 18, 50);
    const highLevelRevenue = calculateMatchRevenueLegacy(8, 5, 18, 50);
    expect(highLevelRevenue).toBeGreaterThan(lowLevelRevenue);
  });
});

// ═══════════════════════════════════════════════════════════════
// MAÇ GELİRİ TESTLERİ (Server-side)
// ═══════════════════════════════════════════════════════════════

describe('calculateMatchRevenue', () => {
  test('Deplasman maçı → 0 gelir', () => {
    const result = calculateMatchRevenue(
      { stadium_capacity: 30000, ticket_price: 50, reputation: 50 },
      false, 2, 1
    );
    expect(result.revenue).toBe(0);
    expect(result.attendance).toBe(0);
  });

  test('Ev sahibi maç → pozitif gelir', () => {
    const result = calculateMatchRevenue(
      { stadium_capacity: 30000, ticket_price: 50, reputation: 50 },
      true, 2, 1
    );
    expect(result.revenue).toBeGreaterThan(0);
    expect(result.attendance).toBeGreaterThan(0);
  });

  test('Galibiyet bonusu geliri artırır (%10)', () => {
    const winResult = calculateMatchRevenue(
      { stadium_capacity: 30000, ticket_price: 50, reputation: 50 },
      true, 3, 0
    );
    const lossResult = calculateMatchRevenue(
      { stadium_capacity: 30000, ticket_price: 50, reputation: 50 },
      true, 0, 3
    );
    expect(winResult.revenue).toBeGreaterThan(lossResult.revenue);
  });

  test('VIP seviyesi geliri artırır', () => {
    const noVip = calculateMatchRevenue(
      { stadium_capacity: 30000, ticket_price: 50, reputation: 50, stadium_upgrades: {} },
      true, 1, 1
    );
    const withVip = calculateMatchRevenue(
      { stadium_capacity: 30000, ticket_price: 50, reputation: 50, stadium_upgrades: { vip: 5 } },
      true, 1, 1
    );
    expect(withVip.revenue).toBeGreaterThan(noVip.revenue);
  });

  test('Seyirci kapasiteyi aşamaz', () => {
    const result = calculateMatchRevenue(
      { stadium_capacity: 15000, ticket_price: 50, reputation: 99 },
      true, 1, 1
    );
    expect(result.attendance).toBeLessThanOrEqual(15000);
  });
});

// ═══════════════════════════════════════════════════════════════
// HAFTALIK GELİR TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('calculateWeeklyRevenue', () => {
  test('Ev sahibi maçta matchday gelir kaynakları oluşur', () => {
    const profile = createMockProfile();
    const result = calculateWeeklyRevenue(profile, 20000, true, 5, 1);
    expect(result.matchday.length).toBeGreaterThan(0);
    expect(result.matchday.some(s => s.id === 'ticket_sales')).toBe(true);
  });

  test('Deplasman maçında minimal matchday gelir', () => {
    const profile = createMockProfile();
    const result = calculateWeeklyRevenue(profile, 0, false, 5, 1);
    // Deplasmanda sadece mağaza satışları
    expect(result.matchday.length).toBeGreaterThan(0);
    expect(result.matchday.some(s => s.id === 'shop_sales_away')).toBe(true);
  });

  test('Yayın geliri lig seviyesine göre değişir', () => {
    const profile = createMockProfile();
    const tier1 = calculateWeeklyRevenue(profile, 20000, true, 5, 1);
    const tier3 = calculateWeeklyRevenue(profile, 20000, true, 5, 3);
    // Tier 1 yayın geliri tier 3'ten fazla olmalı
    const t1Broadcast = tier1.broadcast.reduce((s, r) => s + r.amount, 0);
    const t3Broadcast = tier3.broadcast.reduce((s, r) => s + r.amount, 0);
    expect(t1Broadcast).toBeGreaterThan(t3Broadcast);
  });

  test('Sponsor ödemeleri commercial kategorisinde listelenir', () => {
    const profile = createMockProfile({
      sponsors: [
        { id: 'sp1', name: 'Test Sponsor', type: 'kit', annualValue: 800000, weeklyPayout: 15384, durationWeeks: 78, weeksRemaining: 78, bonusConditions: [], prestige: 2, satisfaction: 60 },
      ] as any,
    });
    const result = calculateWeeklyRevenue(profile, 20000, true, 5, 1);
    expect(result.commercial.some(s => s.id === 'sponsor_payouts')).toBe(true);
  });

  test('Toplam gelir tüm kaynakların toplamına eşit', () => {
    const profile = createMockProfile();
    const result = calculateWeeklyRevenue(profile, 20000, true, 5, 1);
    const manualTotal =
      result.matchday.reduce((s, r) => s + r.amount, 0) +
      result.commercial.reduce((s, r) => s + r.amount, 0) +
      result.broadcast.reduce((s, r) => s + r.amount, 0) +
      result.transfer.reduce((s, r) => s + r.amount, 0) +
      result.prize.reduce((s, r) => s + r.amount, 0);
    expect(result.total).toBe(manualTotal);
  });

  test('Yüksek itibarlı takım daha fazla ticari gelir elde eder', () => {
    const lowRep = createMockProfile({ reputation: 20 });
    const highRep = createMockProfile({ reputation: 90 });
    const lowResult = calculateWeeklyRevenue(lowRep, 20000, true, 5, 1);
    const highResult = calculateWeeklyRevenue(highRep, 20000, true, 5, 1);
    const lowCommercial = lowResult.commercial.reduce((s, r) => s + r.amount, 0);
    const highCommercial = highResult.commercial.reduce((s, r) => s + r.amount, 0);
    expect(highCommercial).toBeGreaterThan(lowCommercial);
  });
});

// ═══════════════════════════════════════════════════════════════
// HAFTALIK GİDER TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('calculateWeeklyExpenses', () => {
  test('Boş kadro → sadece tesis giderleri', () => {
    const result = calculateWeeklyExpenses([], { stadium: 1, training: 1, medical: 1, youth: 1 }, 0, 1);
    expect(result.wages.reduce((s, e) => s + e.amount, 0)).toBe(0);
    expect(result.facility.length).toBeGreaterThan(0);
  });

  test('Oyuncu maaşları wages kategorisinde', () => {
    const squad = [
      createMockPlayer({ salary: 15000 }),
      createMockPlayer({ id: 'p2', salary: 20000 }),
      createMockPlayer({ id: 'p3', salary: 10000 }),
    ];
    const result = calculateWeeklyExpenses(squad);
    const totalWages = result.wages.find(w => w.id === 'player_wages')!.amount;
    expect(totalWages).toBe(45000);
  });

  test('Menajer komisyonu maaşların %3ü', () => {
    const squad = [createMockPlayer({ salary: 100000 })];
    const result = calculateWeeklyExpenses(squad);
    const agentFees = result.agent.find(a => a.id === 'agent_fees')!.amount;
    expect(agentFees).toBe(3000); // 100000 * 0.03
  });

  test('Akademi giderleri seviye ile doğru orantılı', () => {
    const result0 = calculateWeeklyExpenses([], {}, 0, 1);
    const result3 = calculateWeeklyExpenses([], {}, 3, 1);
    const result5 = calculateWeeklyExpenses([], {}, 5, 1);
    const academy0 = result0.operation.find(o => o.id === 'academy_running');
    const academy3 = result3.operation.find(o => o.id === 'academy_running');
    const academy5 = result5.operation.find(o => o.id === 'academy_running');
    expect(academy0).toBeUndefined(); // level 0 → gider yok
    expect(academy3!.amount).toBe(3 * 6000);
    expect(academy5!.amount).toBe(5 * 6000);
  });

  test('Tesis bakım maliyetleri seviye ile artar', () => {
    const lowLevel = calculateWeeklyExpenses([], { stadium: 1, training: 1, medical: 1, youth: 1 });
    const highLevel = calculateWeeklyExpenses([], { stadium: 5, training: 5, medical: 5, youth: 5 });
    const lowTotal = lowLevel.facility.reduce((s, e) => s + e.amount, 0);
    const highTotal = highLevel.facility.reduce((s, e) => s + e.amount, 0);
    expect(highTotal).toBeGreaterThan(lowTotal);
  });

  test('Toplam gider tüm kategorilerin toplamına eşit', () => {
    const squad = [createMockPlayer({ salary: 50000 })];
    const result = calculateWeeklyExpenses(squad, { stadium: 3, training: 2, medical: 1, youth: 1 }, 2, 1);
    const manualTotal =
      result.wages.reduce((s, e) => s + e.amount, 0) +
      result.facility.reduce((s, e) => s + e.amount, 0) +
      result.operation.reduce((s, e) => s + e.amount, 0) +
      result.transfer.reduce((s, e) => s + e.amount, 0) +
      result.agent.reduce((s, e) => s + e.amount, 0);
    expect(result.total).toBe(manualTotal);
  });

  test('Transfer amortismanı kadro değerine göre hesaplanır', () => {
    const squad = [
      createMockPlayer({ market_value: 1000000 }),
      createMockPlayer({ id: 'p2', market_value: 2000000 }),
    ];
    const result = calculateWeeklyExpenses(squad);
    const amort = result.transfer.find(t => t.id === 'transfer_amortisation');
    expect(amort).toBeDefined();
    expect(amort!.amount).toBeGreaterThan(0);
    // 3M / (42 * 3) = ~23,809
    expect(amort!.amount).toBeCloseTo(Math.round(3000000 / 126), -3);
  });
});

// ═══════════════════════════════════════════════════════════════
// FFP MAAŞ SINIRI TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('calculateWageBillLimit', () => {
  test('Gelirin %70i / 52 hafta', () => {
    const limit = calculateWageBillLimit(10_000_000);
    expect(limit).toBe(Math.round((10_000_000 * 0.70) / 52));
  });

  test('Yüksek gelir → yüksek maaş sınırı', () => {
    const lowLimit = calculateWageBillLimit(5_000_000);
    const highLimit = calculateWageBillLimit(50_000_000);
    expect(highLimit).toBeGreaterThan(lowLimit);
  });

  test('Sıfır gelir → sıfır maaş sınırı', () => {
    expect(calculateWageBillLimit(0)).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// FİNANSAL SAĞLIK KONTROLÜ TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('checkFinancialHealth', () => {
  const healthyOverview = {
    weeklyRevenue: 500000,
    weeklyExpenses: 300000,
    weeklyProfit: 200000,
    monthlyRevenue: 2000000,
    monthlyExpenses: 1200000,
    monthlyProfit: 800000,
    seasonRevenue: 20000000,
    seasonExpenses: 12000000,
    seasonProfit: 8000000,
    totalWages: 200000,
    wageBillLimit: 300000,
    wageUtilization: 66,
    sponsorCount: 3,
    sponsorRevenue: 100000,
    matchdayRevenue: 200000,
    broadcastRevenue: 150000,
    transferRevenue: 50000,
    transferSpending: 0,
  };

  test('Sağlıklı durum: pozitif nakit, düşük maaş oranı', () => {
    expect(checkFinancialHealth(healthyOverview, 10_000_000)).toBe('healthy');
  });

  test('Bankrot: negatif nakit', () => {
    expect(checkFinancialHealth(healthyOverview, -1)).toBe('bankrupt');
  });

  test('Kritik: maaş oranı %95 üstü', () => {
    const criticalOverview = {
      ...healthyOverview,
      wageUtilization: 96,
    };
    expect(checkFinancialHealth(criticalOverview, 10_000_000)).toBe('critical');
  });

  test('Kritik: 8+ hafta üst üste zarar', () => {
    expect(checkFinancialHealth(healthyOverview, 10_000_000, 9)).toBe('critical');
  });

  test('Uyarı: maaş oranı %85-95 arası', () => {
    const warningOverview = {
      ...healthyOverview,
      wageUtilization: 88,
    };
    expect(checkFinancialHealth(warningOverview, 10_000_000)).toBe('warning');
  });

  test('Uyarı: 4-8 hafta zarar', () => {
    expect(checkFinancialHealth(healthyOverview, 10_000_000, 5)).toBe('warning');
  });

  test('Uyarı: haftalık negatif kâr', () => {
    const lossOverview = {
      ...healthyOverview,
      weeklyProfit: -50000,
      weeklyRevenue: 250000,
      weeklyExpenses: 300000,
    };
    expect(checkFinancialHealth(lossOverview, 5_000_000)).toBe('warning');
  });

  test('Kritik: 3 haftadan az nakit rezervi', () => {
    const burningOverview = {
      ...healthyOverview,
      weeklyRevenue: 100000,
      weeklyExpenses: 500000,
      weeklyProfit: -400000,
    };
    // 1M nakit / 400K haftalık yanma = 2.5 hafta → kritik
    expect(checkFinancialHealth(burningOverview, 1_000_000)).toBe('critical');
  });
});

// ═══════════════════════════════════════════════════════════════
// SPONSOR TEKLİFİ TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('generateSponsorOffer', () => {
  test('Üst sıra takım daha fazla sponsor türüne erişir', () => {
    const topOffer = generateSponsorOffer(1, 80, 40000);
    const bottomOffer = generateSponsorOffer(18, 30, 8000);
    // Üst sıra takım her zaman geçerli bir teklif alır
    expect(topOffer).toBeDefined();
    expect(topOffer.annualValue).toBeGreaterThan(0);
    expect(bottomOffer).toBeDefined();
  });

  test('Yüksek itibarlı takım daha değerli teklif alır', () => {
    const lowRep = generateSponsorOffer(5, 20, 15000);
    const highRep = generateSponsorOffer(5, 80, 15000);
    expect(highRep.annualValue).toBeGreaterThan(lowRep.annualValue);
  });

  test('Sponsor tipi geçerli olmalı', () => {
    const offer = generateSponsorOffer(3, 60, 25000);
    expect(['kit', 'shirt', 'stadium', 'training_ground']).toContain(offer.type);
  });

  test('Haftalık ödeme yıllık değerin ~1/52si', () => {
    const offer = generateSponsorOffer(3, 60, 25000);
    const expectedWeekly = Math.round(offer.annualValue / 52);
    expect(offer.weeklyPayout).toBe(expectedWeekly);
  });

  test('Süre 78-156 hafta arası', () => {
    for (let i = 0; i < 50; i++) {
      const offer = generateSponsorOffer(5, 60, 25000);
      expect(offer.durationWeeks).toBeGreaterThanOrEqual(78);
      expect(offer.durationWeeks).toBeLessThanOrEqual(156);
    }
  });

  test('Prestij 1-5 arası', () => {
    for (let i = 0; i < 50; i++) {
      const offer = generateSponsorOffer(5, 60, 25000);
      expect(offer.prestige).toBeGreaterThanOrEqual(1);
      expect(offer.prestige).toBeLessThanOrEqual(5);
    }
  });

  test('Büyük stadyum → katılım bonusu koşulu', () => {
    const bigStadiumOffer = generateSponsorOffer(5, 60, 30000);
    const hasAttendanceBonus = bigStadiumOffer.bonusConditions.some(c => c.type === 'attendance');
    expect(hasAttendanceBonus).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// YAYIN ANLAŞMASI TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('generateBroadcastDeal', () => {
  test('Tier 1 (Süper Lig) en değerli anlaşma', () => {
    const deal = generateBroadcastDeal(1, 1);
    expect(deal.annualValue).toBeGreaterThan(10_000_000);
    expect(deal.perMatchBonus).toBeGreaterThan(100_000);
  });

  test('Tier 4 (3. Lig) en az değerli anlaşma', () => {
    const deal = generateBroadcastDeal(4, 1);
    expect(deal.annualValue).toBeLessThan(2_000_000);
  });

  test('Üst sıra → daha yüksek pozisyon bonusu', () => {
    const topDeal = generateBroadcastDeal(1, 1);
    const midDeal = generateBroadcastDeal(1, 10);
    expect(topDeal.annualValue).toBeGreaterThan(midDeal.annualValue);
  });

  test('Tier 1-2 anlaşmalar 3 yıl (156 hafta)', () => {
    const deal1 = generateBroadcastDeal(1, 5);
    const deal2 = generateBroadcastDeal(2, 5);
    expect(deal1.durationWeeks).toBe(156);
    expect(deal2.durationWeeks).toBe(156);
  });

  test('Tier 3-4 anlaşmalar 2 yıl (104 hafta)', () => {
    const deal3 = generateBroadcastDeal(3, 5);
    const deal4 = generateBroadcastDeal(4, 5);
    expect(deal3.durationWeeks).toBe(104);
    expect(deal4.durationWeeks).toBe(104);
  });

  test('Haftalık ödeme yıllık değerin ~1/52si', () => {
    const deal = generateBroadcastDeal(2, 5);
    const expected = Math.round(deal.annualValue / 52);
    expect(deal.weeklyPayout).toBe(expected);
  });
});

// ═══════════════════════════════════════════════════════════════
// FİNANSAL ÖZET TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('buildFinancialOverview', () => {
  test('Tam finansal özet hesaplanır', () => {
    const profile = createMockProfile({ money: 5_000_000 });
    const squad = [createMockPlayer({ salary: 30000 })];
    const overview = buildFinancialOverview(profile, squad, {
      isHome: true,
      lastMatchAttendance: 20000,
      leaguePosition: 5,
      tier: 1,
    });

    expect(overview.weeklyRevenue).toBeGreaterThan(0);
    expect(overview.weeklyExpenses).toBeGreaterThan(0);
    expect(overview.totalWages).toBe(30000);
    expect(overview.healthStatus).toBeDefined();
    expect(['healthy', 'warning', 'critical', 'bankrupt']).toContain(overview.healthStatus);
  });

  test('Haftalık kâr = gelir - gider', () => {
    const profile = createMockProfile({ money: 10_000_000 });
    const squad = [createMockPlayer({ salary: 20000 })];
    const overview = buildFinancialOverview(profile, squad);

    expect(overview.weeklyProfit).toBe(overview.weeklyRevenue - overview.weeklyExpenses);
  });

  test('Aylık kâr = haftalık kâr × 4.33', () => {
    const profile = createMockProfile({ money: 10_000_000 });
    const squad = [];
    const overview = buildFinancialOverview(profile, squad);
    expect(overview.monthlyProfit).toBe(Math.round(overview.weeklyProfit * 4.33));
  });

  test('Sezonluk kâr = haftalık kâr × 42', () => {
    const profile = createMockProfile({ money: 10_000_000 });
    const squad = [];
    const overview = buildFinancialOverview(profile, squad);
    expect(overview.seasonProfit).toBe(Math.round(overview.weeklyProfit * 42));
  });
});

// ═══════════════════════════════════════════════════════════════
// FİNANSAL VARSAYILAR TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('FINANCIAL_DEFAULTS', () => {
  test('Başlangıç parası 10.000.000', () => {
    expect(FINANCIAL_DEFAULTS.startingMoney).toBe(10_000_000);
  });

  test('FFP oranı %70', () => {
    expect(FINANCIAL_DEFAULTS.ffpWageRatio).toBe(0.70);
  });

  test('Maks sponsor sayısı 5', () => {
    expect(FINANCIAL_DEFAULTS.maxSponsors).toBe(5);
  });

  test('Bilet fiyatı varsayılanı 50', () => {
    expect(FINANCIAL_DEFAULTS.ticketPrice).toBe(50);
  });

  test('Ortalama doluluk oranı %70', () => {
    expect(FINANCIAL_DEFAULTS.averageFillRate).toBe(0.7);
  });

  test('4 yayın seviyesi tanımlı', () => {
    expect(Object.keys(FINANCIAL_DEFAULTS.broadcastTiers)).toHaveLength(4);
  });

  test('4 sponsor seviyesi tanımlı', () => {
    expect(Object.keys(FINANCIAL_DEFAULTS.sponsorTiers)).toHaveLength(4);
  });
});
