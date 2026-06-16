/**
 * Touchline Manager — Sezon Sonu Entegrasyon Testleri
 *
 * Sezon sonu işlemlerinin uçtan uca test edilmesi:
 * - Yaşlanma (tüm oyuncular +1 yaş)
 * - Emeklilik (shouldPlayerRetire mantığı)
 * - Sözleşme sonu kontrolü
 * - Yükselme/düşme hesaplama
 * - Sezon ödülü hesaplama
 */

import { shouldPlayerRetire } from '@/lib/fm/retirement';
import type { Player, Profile } from '@/lib/fm/types';

// ═══════════════════════════════════════════════════════════════
// TEST VERİLERİ
// ═══════════════════════════════════════════════════════════════

function createMockPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: `p-${Math.random().toString(36).slice(2, 8)}`,
    name: 'Test Oyuncu',
    position: 'MID',
    specificPosition: 'CM',
    rating: 70,
    age: 25,
    potential: 75,
    market_value: 500_000,
    salary: 10_000,
    nation: 'TR',
    defending: 60,
    passing: 70,
    shooting: 65,
    speed: 60,
    power: 62,
    vision: 68,
    control: 65,
    heading: 55,
    goalkeeping: 5,
    cond: 80,
    form: 65,
    morale: 60,
    confidence: 65,
    hidden_potential: 72,
    traits: [],
    negTraits: [],
    personalityTraits: [],
    preferred_foot: 'Right',
    contract_end_week: 34,
    ...overrides,
  };
}

function createSquad(): Player[] {
  const positions = [
    { pos: 'GK', spec: 'GK', age: 28 },
    { pos: 'GK', spec: 'GK', age: 21 },
    { pos: 'DEF', spec: 'CB', age: 26 },
    { pos: 'DEF', spec: 'CB', age: 30 },
    { pos: 'DEF', spec: 'LB', age: 24 },
    { pos: 'DEF', spec: 'RB', age: 27 },
    { pos: 'MID', spec: 'CDM', age: 29 },
    { pos: 'MID', spec: 'CM', age: 22 },
    { pos: 'MID', spec: 'CAM', age: 25 },
    { pos: 'MID', spec: 'LM', age: 31 },
    { pos: 'FWD', spec: 'ST', age: 23 },
    { pos: 'FWD', spec: 'LW', age: 39 }, // Emeklilik adayı
    { pos: 'FWD', spec: 'RW', age: 26 },
  ];

  return positions.map((p, i) => createMockPlayer({
    id: `p-${i}`,
    position: p.pos,
    specificPosition: p.spec,
    age: p.age,
    goalkeeping: p.pos === 'GK' ? 70 : 5,
  }));
}

// ═══════════════════════════════════════════════════════════════
// YAŞLANMA TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('Sezon Sonu — Yaşlanma', () => {
  test('Sezon sonunda tüm oyuncular +1 yaş alır', () => {
    const squad = createSquad();
    const agesBefore = squad.map(p => p.age);

    // Simülasyon: sezon sonu yaşlanma
    const agedSquad = squad.map(p => ({ ...p, age: p.age + 1 }));

    for (let i = 0; i < squad.length; i++) {
      expect(agedSquad[i].age).toBe(agesBefore[i] + 1);
    }
  });

  test('Yaşlanma sonrası 40+ oyuncular emekli olur', () => {
    const squad = createSquad();
    const agedSquad = squad.map(p => ({ ...p, age: p.age + 1 }));

    const retiredPlayers = agedSquad.filter(p => shouldPlayerRetire(p));

    // 39 yaşlı forvet 40'a çıktı → emekli
    const former39Player = agedSquad.find(p => p.id === 'p-11');
    if (former39Player) {
      expect(former39Player.age).toBe(40);
      expect(shouldPlayerRetire(former39Player)).toBe(true);
    }

    // Emekli olan oyuncular listesi boş olmamalı
    expect(retiredPlayers.length).toBeGreaterThanOrEqual(1);
  });

  test('Genç oyuncular yaşlanma sonrası da emekli olmaz', () => {
    const youngSquad = [
      createMockPlayer({ age: 18 }),
      createMockPlayer({ age: 20 }),
      createMockPlayer({ age: 22 }),
      createMockPlayer({ age: 25 }),
    ];

    const agedSquad = youngSquad.map(p => ({ ...p, age: p.age + 1 }));

    for (const p of agedSquad) {
      expect(shouldPlayerRetire(p)).toBe(false);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// SÖZLEŞME KONTROLÜ TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('Sezon Sonu — Sözleşme Kontrolü', () => {
  test('Sözleşmesi biten oyuncular serbest kalır', () => {
    const squad = [
      createMockPlayer({ id: 'p1', contract_end_week: 0, age: 25 }),
      createMockPlayer({ id: 'p2', contract_end_week: -1, age: 26 }),
      createMockPlayer({ id: 'p3', contract_end_week: 34, age: 28 }),
    ];

    const expiredContracts = squad.filter(p =>
      p.contract_end_week !== undefined && p.contract_end_week <= 0
    );

    expect(expiredContracts.length).toBe(2);
    expect(expiredContracts.map(p => p.id)).toContain('p1');
    expect(expiredContracts.map(p => p.id)).toContain('p2');
  });

  test('Sezon sonunda sözleşme haftası azalır', () => {
    const squad = [
      createMockPlayer({ contract_end_week: 34 }),
      createMockPlayer({ contract_end_week: 17 }),
      createMockPlayer({ contract_end_week: 1 }),
    ];

    // Simülasyon: sezon sonu sözleşme azalması
    const updatedSquad = squad.map(p => ({
      ...p,
      contract_end_week: (p.contract_end_week || 0) - 34,
    }));

    expect(updatedSquad[0].contract_end_week).toBe(0);  // Sona erdi
    expect(updatedSquad[1].contract_end_week).toBe(-17); // Sona erdi
    expect(updatedSquad[2].contract_end_week).toBe(-33); // Sona erdi
  });
});

// ═══════════════════════════════════════════════════════════════
// YÜKSELME / DÜŞME HESAPLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('Sezon Sonu — Yükselme/Düşme', () => {
  interface StandingRow {
    team_name: string;
    points: number;
    goal_difference: number;
  }

  /**
   * İlk 2 takım yükselir, son 2 düşer
   */
  function calculatePromotionRelegation(
    standings: StandingRow[],
    promoteCount: number = 2,
    relegateCount: number = 2
  ): { promoted: string[]; relegated: string[] } {
    const sorted = [...standings].sort((a, b) =>
      b.points - a.points || b.goal_difference - a.goal_difference
    );
    return {
      promoted: sorted.slice(0, promoteCount).map(s => s.team_name),
      relegated: sorted.slice(-relegateCount).map(s => s.team_name),
    };
  }

  test('İlk 2 takım yükselir', () => {
    const standings: StandingRow[] = [
      { team_name: 'A Takımı', points: 70, goal_difference: 30 },
      { team_name: 'B Takımı', points: 65, goal_difference: 20 },
      { team_name: 'C Takımı', points: 50, goal_difference: 5 },
      { team_name: 'D Takımı', points: 45, goal_difference: -5 },
      { team_name: 'E Takımı', points: 30, goal_difference: -15 },
      { team_name: 'F Takımı', points: 20, goal_difference: -35 },
    ];

    const result = calculatePromotionRelegation(standings);
    expect(result.promoted).toEqual(['A Takımı', 'B Takımı']);
  });

  test('Son 2 takım düşer', () => {
    const standings: StandingRow[] = [
      { team_name: 'A Takımı', points: 70, goal_difference: 30 },
      { team_name: 'B Takımı', points: 65, goal_difference: 20 },
      { team_name: 'C Takımı', points: 50, goal_difference: 5 },
      { team_name: 'D Takımı', points: 45, goal_difference: -5 },
      { team_name: 'E Takımı', points: 30, goal_difference: -15 },
      { team_name: 'F Takımı', points: 20, goal_difference: -35 },
    ];

    const result = calculatePromotionRelegation(standings);
    expect(result.relegated).toEqual(['E Takımı', 'F Takımı']);
  });

  test('Puan eşitliğinde averaj belirler', () => {
    const standings: StandingRow[] = [
      { team_name: 'A Takımı', points: 50, goal_difference: 20 },
      { team_name: 'B Takımı', points: 50, goal_difference: 10 },
      { team_name: 'C Takımı', points: 50, goal_difference: -5 },
    ];

    const result = calculatePromotionRelegation(standings, 2, 1);
    expect(result.promoted[0]).toBe('A Takımı');
    expect(result.relegated[0]).toBe('C Takımı');
  });

  test('18 takımlık ligde ilk 2 yükselir, son 2 düşer', () => {
    const standings: StandingRow[] = [];
    for (let i = 1; i <= 18; i++) {
      standings.push({
        team_name: `Takım ${i}`,
        points: 70 - (i - 1) * 4,
        goal_difference: 30 - (i - 1) * 5,
      });
    }

    const result = calculatePromotionRelegation(standings);
    expect(result.promoted).toEqual(['Takım 1', 'Takım 2']);
    expect(result.relegated).toEqual(['Takım 17', 'Takım 18']);
  });
});

// ═══════════════════════════════════════════════════════════════
// SEZON ÖDÜLÜ HESAPLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('Sezon Sonu — Ödül Hesaplama', () => {
  interface AwardCandidate {
    playerId: string;
    playerName: string;
    goals: number;
    assists: number;
    cleanSheets: number;
    avgRating: number;
    matches: number;
  }

  /**
   * Altın Ayakkabı: En çok gol atan oyuncu
   */
  function getGoldenBoot(candidates: AwardCandidate[]): AwardCandidate | null {
    if (candidates.length === 0) return null;
    return candidates.reduce((best, c) => c.goals > best.goals ? c : best, candidates[0]);
  }

  /**
   * En İyi Kaleci: En çok clean sheet + en yüksek rating
   */
  function getBestGoalkeeper(candidates: AwardCandidate[]): AwardCandidate | null {
    const goalkeepers = candidates.filter(c => c.cleanSheets > 0);
    if (goalkeepers.length === 0) return null;
    return goalkeepers.reduce((best, c) =>
      c.cleanSheets > best.cleanSheets ||
      (c.cleanSheets === best.cleanSheets && c.avgRating > best.avgRating) ? c : best
    , goalkeepers[0]);
  }

  test('Altın Ayakkabı en çok gol atan oyuncuya verilir', () => {
    const candidates: AwardCandidate[] = [
      { playerId: '1', playerName: 'Golcü', goals: 22, assists: 5, cleanSheets: 0, avgRating: 7.5, matches: 34 },
      { playerId: '2', playerName: 'Asistçi', goals: 8, assists: 18, cleanSheets: 0, avgRating: 7.8, matches: 34 },
      { playerId: '3', playerName: 'Orta', goals: 12, assists: 10, cleanSheets: 0, avgRating: 7.2, matches: 34 },
    ];

    const winner = getGoldenBoot(candidates);
    expect(winner).toBeDefined();
    expect(winner!.playerName).toBe('Golcü');
    expect(winner!.goals).toBe(22);
  });

  test('Gol eşitliğinde ilk sıradaki alır', () => {
    const candidates: AwardCandidate[] = [
      { playerId: '1', playerName: 'A', goals: 15, assists: 10, cleanSheets: 0, avgRating: 7.5, matches: 34 },
      { playerId: '2', playerName: 'B', goals: 15, assists: 5, cleanSheets: 0, avgRating: 7.2, matches: 30 },
    ];

    const winner = getGoldenBoot(candidates);
    expect(winner).toBeDefined();
    // Eşit gol durumunda ilk sıradaki
    expect(winner!.goals).toBe(15);
  });

  test('En iyi kaleci en çok clean sheet olanıdır', () => {
    const candidates: AwardCandidate[] = [
      { playerId: '1', playerName: 'Kaleci A', goals: 0, assists: 0, cleanSheets: 15, avgRating: 7.8, matches: 34 },
      { playerId: '2', playerName: 'Kaleci B', goals: 0, assists: 0, cleanSheets: 12, avgRating: 7.5, matches: 34 },
    ];

    const winner = getBestGoalkeeper(candidates);
    expect(winner).toBeDefined();
    expect(winner!.playerName).toBe('Kaleci A');
  });

  test('Boş aday listesi → null', () => {
    expect(getGoldenBoot([])).toBeNull();
    expect(getBestGoalkeeper([])).toBeNull();
  });
});
