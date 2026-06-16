/**
 * Touchline Manager — Oyuncu Değerleme Testleri
 * 
 * Python update_player_values.py'deki hesaplama mantığının
 * JavaScript versiyonu testleri.
 * 
 * Formül:
 *   total = base_price * form_modifier * injury_modifier * age_modifier * rarity_modifier + performance_bonus
 *   base_price = overall * 1000
 *   Minimum: 100, Maksimum: 10.000.000
 */

// ═══════════════════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR (Python mantığının JS karşılığı)
// ═══════════════════════════════════════════════════════════════════════

const MIN_PRICE = 100;
const MAX_PRICE = 10_000_000;
const BASE_MULTIPLIER = 1000;

type RarityLevel = 'Common' | 'Rare' | 'Epic' | 'Legendary';

interface PlayerData {
  rating: number;
  form_rating: number;
  age: number;
  potential: number;
  is_injured: boolean;
  injury_history_days: number; // Son 3 aydaki toplam sakatlık gün sayısı
  goals: number;
  assists: number;
}

function determineRarity(rating: number, potential: number): RarityLevel {
  if (rating >= 85 || potential >= 90) return 'Legendary';
  if (rating >= 75 || potential >= 80) return 'Epic';
  if (rating >= 65 || potential >= 70) return 'Rare';
  return 'Common';
}

function calculateFormModifier(formRating: number): number {
  const formPct = (formRating - 50) / 2.0; // -25 ile +25 arası
  return 1.0 + (formPct / 100.0);
}

function calculateInjuryModifier(isInjured: boolean, injuryHistoryDays: number): number {
  let modifier = 1.0;

  if (isInjured) {
    modifier *= 0.85;
  }

  // Son 3 aydaki sakatlık: her 5 gün -%5, max -%30
  if (injuryHistoryDays > 0) {
    const penaltyPct = Math.min(30, Math.floor(injuryHistoryDays / 5) * 5);
    modifier *= (1 - penaltyPct / 100);
  }

  return Math.max(0.70, modifier);
}

function calculateAgeModifier(age: number): number {
  if (age >= 36) return 0.70;
  if (age >= 32) return 0.85;
  if (age >= 28) return 1.00;
  if (age >= 22) return 1.10;
  if (age >= 18) return 1.20;
  return 1.25; // 18 altı
}

function calculatePlayerPrice(player: PlayerData): number {
  const overall = player.rating || 50;
  const formRating = player.form_rating || 50;
  const age = player.age || 25;
  const potential = player.potential || overall;

  // 1. Baz fiyat
  const basePrice = overall * BASE_MULTIPLIER;

  // 2. Form etkisi
  const formModifier = calculateFormModifier(formRating);

  // 3. Sakatlık etkisi
  const injuryModifier = calculateInjuryModifier(player.is_injured, player.injury_history_days);

  // 4. Yaş etkisi
  const ageModifier = calculateAgeModifier(age);

  // 5. Performans bonusu
  const performanceBonus = player.goals * 500 + player.assists * 300;

  // 6. Nadirlik
  const rarity = determineRarity(overall, potential);
  const rarityMultipliers: Record<RarityLevel, number> = {
    Common: 1.0,
    Rare: 1.5,
    Epic: 2.0,
    Legendary: 3.0,
  };
  const rarityModifier = rarityMultipliers[rarity];

  // Toplam
  const totalPrice = basePrice * formModifier * injuryModifier * ageModifier * rarityModifier + performanceBonus;

  return Math.max(MIN_PRICE, Math.min(MAX_PRICE, Math.round(totalPrice)));
}

// ═══════════════════════════════════════════════════════════════════════
// NADİRLİK TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

describe('Oyuncu Nadirlik Testleri', () => {
  test('Rating 65 altı → Common', () => {
    expect(determineRarity(60, 60)).toBe('Common');
    expect(determineRarity(50, 55)).toBe('Common');
  });

  test('Rating 65+ veya potential 70+ → Rare', () => {
    expect(determineRarity(65, 60)).toBe('Rare');
    expect(determineRarity(60, 70)).toBe('Rare');
  });

  test('Rating 75+ veya potential 80+ → Epic', () => {
    expect(determineRarity(75, 70)).toBe('Epic');
    expect(determineRarity(70, 80)).toBe('Epic');
  });

  test('Rating 85+ veya potential 90+ → Legendary', () => {
    expect(determineRarity(85, 80)).toBe('Legendary');
    expect(determineRarity(80, 90)).toBe('Legendary');
    expect(determineRarity(90, 95)).toBe('Legendary');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// FORM ETKİSİ TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

describe('Form Etkisi Testleri', () => {
  test('Form 50 (ortaalama) → modifier = 1.0', () => {
    expect(calculateFormModifier(50)).toBeCloseTo(1.0, 4);
  });

  test('Form 80 → +%15 artış', () => {
    // (80 - 50) / 2 = 15% artış → 1.15
    expect(calculateFormModifier(80)).toBeCloseTo(1.15, 4);
  });

  test('Form 20 → -%15 azalış', () => {
    // (20 - 50) / 2 = -15% → 0.85
    expect(calculateFormModifier(20)).toBeCloseTo(0.85, 4);
  });

  test('Form 100 → +%25 artış', () => {
    // (100 - 50) / 2 = 25% → 1.25
    expect(calculateFormModifier(100)).toBeCloseTo(1.25, 4);
  });

  test('Form 0 → -%25 azalış', () => {
    // (0 - 50) / 2 = -25% → 0.75
    expect(calculateFormModifier(0)).toBeCloseTo(0.75, 4);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SAKATLIK ETKİSİ TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

describe('Sakatlık Etkisi Testleri', () => {
  test('Sağlam oyuncu, geçmişi yok → modifier = 1.0', () => {
    expect(calculateInjuryModifier(false, 0)).toBeCloseTo(1.0, 4);
  });

  test('Mevcut sakatlık → -%15', () => {
    expect(calculateInjuryModifier(true, 0)).toBeCloseTo(0.85, 4);
  });

  test('5 gün sakatlık geçmişi → -%5', () => {
    // 5 gün / 5 = 1 * 5% = -%5
    const modifier = calculateInjuryModifier(false, 5);
    expect(modifier).toBeCloseTo(0.95, 4);
  });

  test('15 gün sakatlık geçmişi → -%15', () => {
    // 15 / 5 = 3 * 5% = -%15
    const modifier = calculateInjuryModifier(false, 15);
    expect(modifier).toBeCloseTo(0.85, 4);
  });

  test('30+ gün sakatlık → max -%30', () => {
    // 30 / 5 = 6 * 5% = -%30 (max)
    const modifier = calculateInjuryModifier(false, 50);
    expect(modifier).toBeCloseTo(0.70, 4);
  });

  test('Sakatlık + geçmişi birlikte → max -%30 sınırı', () => {
    const modifier = calculateInjuryModifier(true, 100);
    expect(modifier).toBeGreaterThanOrEqual(0.70);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// YAŞ ETKİSİ TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

describe('Yaş Etkisi Testleri', () => {
  test('18-21 yaş → +%20 potansiyel bonusu', () => {
    expect(calculateAgeModifier(18)).toBeCloseTo(1.20, 4);
    expect(calculateAgeModifier(20)).toBeCloseTo(1.20, 4);
    expect(calculateAgeModifier(21)).toBeCloseTo(1.20, 4);
  });

  test('22-27 yaş → +%10 prime', () => {
    expect(calculateAgeModifier(22)).toBeCloseTo(1.10, 4);
    expect(calculateAgeModifier(25)).toBeCloseTo(1.10, 4);
    expect(calculateAgeModifier(27)).toBeCloseTo(1.10, 4);
  });

  test('28-31 yaş → 0 (sabit)', () => {
    expect(calculateAgeModifier(28)).toBeCloseTo(1.00, 4);
    expect(calculateAgeModifier(30)).toBeCloseTo(1.00, 4);
    expect(calculateAgeModifier(31)).toBeCloseTo(1.00, 4);
  });

  test('32-35 yaş → -%15', () => {
    expect(calculateAgeModifier(32)).toBeCloseTo(0.85, 4);
    expect(calculateAgeModifier(35)).toBeCloseTo(0.85, 4);
  });

  test('36+ yaş → -%30', () => {
    expect(calculateAgeModifier(36)).toBeCloseTo(0.70, 4);
    expect(calculateAgeModifier(40)).toBeCloseTo(0.70, 4);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// PERFORMANS BONUSU TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

describe('Performans Bonusu Testleri', () => {
  test('Gol başına +500, asist başına +300', () => {
    const player: PlayerData = {
      rating: 50, form_rating: 50, age: 25, potential: 50,
      is_injured: false, injury_history_days: 0,
      goals: 10, assists: 5,
    };
    const price = calculatePlayerPrice(player);
    const basePrice = 50 * 1000; // 50.000
    const performanceBonus = 10 * 500 + 5 * 300; // 6.500
    // Common rarity (1.0), form 50 (1.0), no injury (1.0), age 25 (1.10)
    const expected = Math.round(basePrice * 1.0 * 1.0 * 1.10 * 1.0 + performanceBonus);
    expect(price).toBe(expected);
  });

  test('Sıfır istatistik → performans bonusu yok', () => {
    const player: PlayerData = {
      rating: 50, form_rating: 50, age: 25, potential: 50,
      is_injured: false, injury_history_days: 0,
      goals: 0, assists: 0,
    };
    const price = calculatePlayerPrice(player);
    const basePrice = 50 * 1000;
    const expected = Math.round(basePrice * 1.0 * 1.0 * 1.10 * 1.0 + 0);
    expect(price).toBe(expected);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// GENEL FİYAT HESAPLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

describe('Genel Fiyat Hesaplama Testleri', () => {
  test('Minimum fiyat = 100', () => {
    const player: PlayerData = {
      rating: 1, form_rating: 0, age: 40, potential: 1,
      is_injured: true, injury_history_days: 100,
      goals: 0, assists: 0,
    };
    const price = calculatePlayerPrice(player);
    expect(price).toBeGreaterThanOrEqual(100);
  });

  test('Maksimum fiyat = 10.000.000', () => {
    const player: PlayerData = {
      rating: 99, form_rating: 100, age: 20, potential: 99,
      is_injured: false, injury_history_days: 0,
      goals: 50, assists: 30,
    };
    const price = calculatePlayerPrice(player);
    expect(price).toBeLessThanOrEqual(10_000_000);
  });

  test('Legendary oyuncu Common\'dan pahalı', () => {
    const legendary: PlayerData = {
      rating: 90, form_rating: 50, age: 25, potential: 92,
      is_injured: false, injury_history_days: 0,
      goals: 0, assists: 0,
    };
    const common: PlayerData = {
      rating: 50, form_rating: 50, age: 25, potential: 50,
      is_injured: false, injury_history_days: 0,
      goals: 0, assists: 0,
    };
    expect(calculatePlayerPrice(legendary)).toBeGreaterThan(calculatePlayerPrice(common));
  });

  test('Genç oyuncu yaşlıdan pahalı (same rating)', () => {
    const young: PlayerData = {
      rating: 70, form_rating: 50, age: 19, potential: 80,
      is_injured: false, injury_history_days: 0,
      goals: 0, assists: 0,
    };
    const old: PlayerData = {
      rating: 70, form_rating: 50, age: 37, potential: 70,
      is_injured: false, injury_history_days: 0,
      goals: 0, assists: 0,
    };
    expect(calculatePlayerPrice(young)).toBeGreaterThan(calculatePlayerPrice(old));
  });

  test('Formda oyuncu formsuzdan pahalı (same rating)', () => {
    const inForm: PlayerData = {
      rating: 70, form_rating: 90, age: 25, potential: 70,
      is_injured: false, injury_history_days: 0,
      goals: 0, assists: 0,
    };
    const outOfForm: PlayerData = {
      rating: 70, form_rating: 10, age: 25, potential: 70,
      is_injured: false, injury_history_days: 0,
      goals: 0, assists: 0,
    };
    expect(calculatePlayerPrice(inForm)).toBeGreaterThan(calculatePlayerPrice(outOfForm));
  });

  test('Sağlam oyuncu sakatdan pahalı (same rating)', () => {
    const fit: PlayerData = {
      rating: 70, form_rating: 50, age: 25, potential: 70,
      is_injured: false, injury_history_days: 0,
      goals: 0, assists: 0,
    };
    const injured: PlayerData = {
      rating: 70, form_rating: 50, age: 25, potential: 70,
      is_injured: true, injury_history_days: 20,
      goals: 0, assists: 0,
    };
    expect(calculatePlayerPrice(fit)).toBeGreaterThan(calculatePlayerPrice(injured));
  });
});
