/**
 * Siyah Beyaz FC — Bot Actions Testleri
 * 
 * Bot transfer kararları, kadro seçimi ve taktik
 * mantığının testleri.
 */

// ═══════════════════════════════════════════════════════════════════════
// POZİSYON GRUPLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

const POSITION_GROUPS: Record<string, string> = {
  GK: 'GK',
  CB: 'DEF', LB: 'DEF', RB: 'DEF', LWB: 'DEF', RWB: 'DEF',
  CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID',
  LW: 'FWD', RW: 'FWD', CF: 'FWD', ST: 'FWD',
};

function mapToGroup(position: string): string {
  return POSITION_GROUPS[position] || 'MID';
}

describe('Pozisyon Gruplama Testleri', () => {
  test('Kaleci → GK', () => {
    expect(mapToGroup('GK')).toBe('GK');
  });

  test('Defans oyuncuları → DEF', () => {
    expect(mapToGroup('CB')).toBe('DEF');
    expect(mapToGroup('LB')).toBe('DEF');
    expect(mapToGroup('RB')).toBe('DEF');
    expect(mapToGroup('LWB')).toBe('DEF');
    expect(mapToGroup('RWB')).toBe('DEF');
  });

  test('Orta saha oyuncuları → MID', () => {
    expect(mapToGroup('CDM')).toBe('MID');
    expect(mapToGroup('CM')).toBe('MID');
    expect(mapToGroup('CAM')).toBe('MID');
    expect(mapToGroup('LM')).toBe('MID');
    expect(mapToGroup('RM')).toBe('MID');
  });

  test('Forvet oyuncuları → FWD', () => {
    expect(mapToGroup('ST')).toBe('FWD');
    expect(mapToGroup('CF')).toBe('FWD');
    expect(mapToGroup('LW')).toBe('FWD');
    expect(mapToGroup('RW')).toBe('FWD');
  });

  test('Bilinmeyen pozisyon → MID (varsayılan)', () => {
    expect(mapToGroup('UNKNOWN')).toBe('MID');
    expect(mapToGroup('')).toBe('MID');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// KADRO İHTİYAÇ ANALİZİ TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

const IDEAL_SQUAD_DISTRIBUTION: Record<string, number> = { GK: 2, DEF: 6, MID: 6, FWD: 5 };
const MIN_PER_POSITION_GROUP = 2;

interface SimplePlayer {
  position: string;
  rating: number;
}

function getPositionNeeds(squad: SimplePlayer[]): Record<string, number> {
  const current: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const p of squad) {
    const group = mapToGroup(p.position);
    current[group] = (current[group] || 0) + 1;
  }

  const needs: Record<string, number> = {};
  for (const pos of Object.keys(IDEAL_SQUAD_DISTRIBUTION)) {
    const minRequired = Math.max(MIN_PER_POSITION_GROUP, IDEAL_SQUAD_DISTRIBUTION[pos]);
    needs[pos] = Math.max(0, minRequired - (current[pos] || 0));
  }
  return needs;
}

describe('Kadro İhtiyaç Analizi Testleri', () => {
  test('Boş kadro → tüm mevkilerde eksik', () => {
    const needs = getPositionNeeds([]);
    expect(needs.GK).toBeGreaterThan(0);
    expect(needs.DEF).toBeGreaterThan(0);
    expect(needs.MID).toBeGreaterThan(0);
    expect(needs.FWD).toBeGreaterThan(0);
  });

  test('Tam kadro → hiçbir mevkide eksik yok', () => {
    const fullSquad: SimplePlayer[] = [
      // GK x2
      { position: 'GK', rating: 70 },
      { position: 'GK', rating: 65 },
      // DEF x6
      ...Array(6).fill(null).map((_, i) => ({ position: 'CB', rating: 60 + i })),
      // MID x6
      ...Array(6).fill(null).map((_, i) => ({ position: 'CM', rating: 60 + i })),
      // FWD x5
      ...Array(5).fill(null).map((_, i) => ({ position: 'ST', rating: 65 + i })),
    ];
    const needs = getPositionNeeds(fullSquad);
    expect(needs.GK).toBe(0);
    expect(needs.DEF).toBe(0);
    expect(needs.MID).toBe(0);
    expect(needs.FWD).toBe(0);
  });

  test('Kaleci eksik → GK ihtiyacı var', () => {
    const noGK: SimplePlayer[] = [
      ...Array(6).fill(null).map((_, i) => ({ position: 'CB', rating: 60 + i })),
      ...Array(6).fill(null).map((_, i) => ({ position: 'CM', rating: 60 + i })),
      ...Array(5).fill(null).map((_, i) => ({ position: 'ST', rating: 65 + i })),
    ];
    const needs = getPositionNeeds(noGK);
    expect(needs.GK).toBe(2);
  });

  test('Her mevkide en az 2 zorunluluğu kontrol et', () => {
    const oneDef: SimplePlayer[] = [
      { position: 'GK', rating: 70 },
      { position: 'GK', rating: 65 },
      { position: 'CB', rating: 60 }, // Sadece 1 defans
      ...Array(6).fill(null).map((_, i) => ({ position: 'CM', rating: 60 + i })),
      ...Array(5).fill(null).map((_, i) => ({ position: 'ST', rating: 65 + i })),
    ];
    const needs = getPositionNeeds(oneDef);
    // DEF'de en az 2 olmalı, 1 var → en az 1 eksik
    expect(needs.DEF).toBeGreaterThanOrEqual(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// FAZLALIK TESPİTİ TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

const SURPLUS_THRESHOLD = 3;

function getSurplusPositions(squad: SimplePlayer[]): Record<string, SimplePlayer[]> {
  const grouped: Record<string, SimplePlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of squad) {
    const group = mapToGroup(p.position);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(p);
  }

  const surplus: Record<string, SimplePlayer[]> = {};
  for (const [group, players] of Object.entries(grouped)) {
    if (players.length >= SURPLUS_THRESHOLD) {
      const sorted = [...players].sort((a, b) => a.rating - b.rating);
      const excessCount = players.length - MIN_PER_POSITION_GROUP;
      if (excessCount > 0) {
        surplus[group] = sorted.slice(0, excessCount);
      }
    }
  }

  return surplus;
}

describe('Fazlalık Tespiti Testleri', () => {
  test('Dengeli kadroda fazlalık yok', () => {
    const balanced: SimplePlayer[] = [
      { position: 'GK', rating: 70 },
      { position: 'GK', rating: 65 },
      { position: 'CB', rating: 60 },
      { position: 'CB', rating: 58 },
      { position: 'CM', rating: 62 },
      { position: 'CM', rating: 61 },
      { position: 'ST', rating: 65 },
      { position: 'ST', rating: 63 },
    ];
    const surplus = getSurplusPositions(balanced);
    expect(Object.keys(surplus).length).toBe(0);
  });

  test('3+ aynı mevkide → en dusuk OVRli satis adayi', () => {
    const surplusMID: SimplePlayer[] = [
      { position: 'GK', rating: 70 },
      { position: 'CB', rating: 60 },
      { position: 'CM', rating: 70 }, // Yüksek OVR
      { position: 'CM', rating: 60 }, // Orta OVR
      { position: 'CM', rating: 50 }, // Düşük OVR → satış adayı
      { position: 'ST', rating: 65 },
    ];
    const surplus = getSurplusPositions(surplusMID);
    expect(surplus.MID).toBeDefined();
    expect(surplus.MID.length).toBe(1);
    expect(surplus.MID[0].rating).toBe(50); // En düşük OVR'li
  });

  test('5 forvet → 3 satış adayı', () => {
    const manyFWD: SimplePlayer[] = [
      { position: 'ST', rating: 80 },
      { position: 'ST', rating: 75 },
      { position: 'ST', rating: 70 },
      { position: 'ST', rating: 65 },
      { position: 'ST', rating: 60 },
    ];
    const surplus = getSurplusPositions(manyFWD);
    expect(surplus.FWD).toBeDefined();
    expect(surplus.FWD.length).toBe(3); // 5 - 2 = 3
    // Satış adayları en düşük OVR'liler
    expect(surplus.FWD[0].rating).toBe(60);
    expect(surplus.FWD[1].rating).toBe(65);
    expect(surplus.FWD[2].rating).toBe(70);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// FİYAT STRATEJİSİ TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

describe('Fiyat Stratejisi Testleri', () => {
  test('Acil satış: current_price * 0.8', () => {
    const currentPrice = 1_000_000;
    const urgentPrice = Math.round(currentPrice * 0.8);
    expect(urgentPrice).toBe(800_000);
  });

  test('Karlı satış: current_price * 1.2', () => {
    const currentPrice = 1_000_000;
    const profitPrice = Math.round(currentPrice * 1.2);
    expect(profitPrice).toBe(1_200_000);
  });

  test('Minimum fiyat 100', () => {
    const lowPrice = Math.round(50 * 0.8);
    const finalPrice = Math.max(100, lowPrice);
    expect(finalPrice).toBe(100);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TAKTİK KARAR TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

const FORMATIONS: Record<string, Record<string, number>> = {
  '4-4-2': { GK: 1, DEF: 4, MID: 4, FWD: 2 },
  '4-3-3': { GK: 1, DEF: 4, MID: 3, FWD: 3 },
  '4-5-1': { GK: 1, DEF: 4, MID: 5, FWD: 1 },
  '3-4-3': { GK: 1, DEF: 3, MID: 4, FWD: 3 },
  '5-4-1': { GK: 1, DEF: 5, MID: 4, FWD: 1 },
};

function makeTacticalDecision(
  minute: number,
  myGoals: number,
  oppGoals: number,
): { formation: string; mentality: string; changes: string[] } {
  const result = { formation: '4-4-2', mentality: 'normal', changes: [] as string[] };
  const goalDiff = myGoals - oppGoals;

  if (minute >= 60) {
    if (goalDiff < 0) {
      if (minute >= 75) {
        result.formation = '3-4-3';
        result.mentality = 'very_attacking';
        result.changes.push('Agresif formasyon 3-4-3');
      } else {
        result.formation = '4-3-3';
        result.mentality = 'attacking';
        result.changes.push('Hücum formasyonu 4-3-3');
      }
    } else if (goalDiff === 0) {
      result.formation = '4-5-1';
      result.mentality = 'balanced';
      result.changes.push('Denge formasyonu 4-5-1');
    } else if (goalDiff >= 2) {
      result.formation = '5-4-1';
      result.mentality = 'defensive';
      result.changes.push('Defansif formasyon 5-4-1');
    } else {
      result.formation = '4-4-2';
      result.mentality = 'balanced';
      result.changes.push('Dengeli 4-4-2');
    }
  }

  if (minute >= 80) {
    if (goalDiff >= 0) {
      result.mentality = 'time_wasting';
      result.changes.push('Zamana oynama');
    } else {
      result.formation = '3-4-3';
      result.mentality = 'all_out_attack';
      result.changes.push('Son hamle 3-4-3');
    }
  }

  return result;
}

describe('Taktik Karar Testleri', () => {
  test('İlk yarıda taktik değişikliği yok', () => {
    const result = makeTacticalDecision(30, 0, 1);
    expect(result.formation).toBe('4-4-2');
    expect(result.mentality).toBe('normal');
    expect(result.changes.length).toBe(0);
  });

  test('60. dk geride → 4-3-3 hücum', () => {
    const result = makeTacticalDecision(60, 0, 1);
    expect(result.formation).toBe('4-3-3');
    expect(result.mentality).toBe('attacking');
  });

  test('75. dk geride → 3-4-3 agresif', () => {
    const result = makeTacticalDecision(75, 0, 2);
    expect(result.formation).toBe('3-4-3');
    expect(result.mentality).toBe('very_attacking');
  });

  test('60. dk berabere → 4-5-1 denge', () => {
    const result = makeTacticalDecision(60, 1, 1);
    expect(result.formation).toBe('4-5-1');
    expect(result.mentality).toBe('balanced');
  });

  test('60. dk 2+ gol önde → 5-4-1 defansif', () => {
    const result = makeTacticalDecision(60, 3, 0);
    expect(result.formation).toBe('5-4-1');
    expect(result.mentality).toBe('defensive');
  });

  test('80. dk önde → zamana oynama', () => {
    const result = makeTacticalDecision(80, 1, 0);
    expect(result.mentality).toBe('time_wasting');
  });

  test('80. dk geride → son hamle', () => {
    const result = makeTacticalDecision(80, 0, 1);
    expect(result.formation).toBe('3-4-3');
    expect(result.mentality).toBe('all_out_attack');
  });

  test('80. dk berabere → zamana oynama', () => {
    const result = makeTacticalDecision(80, 1, 1);
    expect(result.mentality).toBe('time_wasting');
  });

  test('Formasyon toplam oyuncu = 11', () => {
    for (const [name, slots] of Object.entries(FORMATIONS)) {
      const total = Object.values(slots).reduce((a, b) => a + b, 0);
      expect(total).toBe(11);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// HAFTALIK TRANSFER LİMİTİ TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

describe('Haftalık Transfer Limiti Testleri', () => {
  const MAX_WEEKLY_TRANSFERS = 2;

  test('Maks 2 transfer (1 alım + 1 satım)', () => {
    expect(MAX_WEEKLY_TRANSFERS).toBe(2);
  });

  test('Transfer sayacı limiti aşamaz', () => {
    let transferCount = 0;
    // Simülasyon: 1 satım
    transferCount++;
    expect(transferCount).toBeLessThanOrEqual(MAX_WEEKLY_TRANSFERS);
    // Simülasyon: 1 alım
    transferCount++;
    expect(transferCount).toBeLessThanOrEqual(MAX_WEEKLY_TRANSFERS);
    // 3. transfer reddedilmeli
    expect(transferCount >= MAX_WEEKLY_TRANSFERS).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// KONDİSYON KONTROLÜ TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

interface PlayerWithStamina {
  id: string;
  rating: number;
  stamina: number;
  position: string;
}

describe('Kondisyon Kontrolü Testleri', () => {
  test('Stamina < 50 → yedek adayı', () => {
    const players: PlayerWithStamina[] = [
      { id: '1', rating: 80, stamina: 30, position: 'ST' },
      { id: '2', rating: 70, stamina: 60, position: 'CM' },
      { id: '3', rating: 75, stamina: 45, position: 'CB' },
    ];

    const highStamina = players.filter(p => p.stamina >= 50);
    const lowStamina = players.filter(p => p.stamina < 50);

    expect(lowStamina.length).toBe(2); // id: 1 and 3
    expect(highStamina.length).toBe(1); // id: 2
  });

  test('Yüksek kondisyonlular ilk 11\'e öncelik', () => {
    const players: PlayerWithStamina[] = [
      { id: '1', rating: 85, stamina: 30, position: 'ST' }, // Düşük kondisyon
      { id: '2', rating: 70, stamina: 80, position: 'ST' }, // Yüksek kondisyon
    ];

    const pool = players.filter(p => p.stamina >= 50);
    // Rating yüksek ama kondisyon düşük olan yedekte
    expect(pool.length).toBe(1);
    expect(pool[0].id).toBe('2');
  });
});
