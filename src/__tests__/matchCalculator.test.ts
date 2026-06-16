/**
 * Touchline Manager — Maç Hesaplayıcı Testleri
 * 
 * Poisson dağılımı, puan hesaplama, takım gücü hesaplama
 * ve maç olayı üretimi testleri.
 */

// ═══════════════════════════════════════════════════════════════════════
// POISSON DAĞILIMI TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

/**
 * Basit Poisson dağılımı simülasyonu.
 * Beklenen gol sayısına göre rastgele gol üretir.
 */
function poissonRandom(lambda: number): number {
  let L = Math.exp(-lambda);
  let k = 0;
  let p = 1;

  do {
    k++;
    p *= Math.random();
  } while (p > L);

  return k - 1;
}

/**
 * Maç gol simülasyonu: Her iki takım için Poisson bazlı gol üretir.
 */
function simulateGoals(homeExpected: number, awayExpected: number): { home: number; away: number } {
  return {
    home: Math.min(poissonRandom(homeExpected), 7),
    away: Math.min(poissonRandom(awayExpected), 7),
  };
}

describe('Poisson Dağılımı Testleri', () => {
  test('Beklenen gol sayısı 0-5 arası olmalı', () => {
    const results: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const goals = poissonRandom(1.3); // Ortalama 1.3 gol
      results.push(goals);
    }

    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    
    // Ortalama beklenen değere yakın olmalı (1.3 ± 0.3)
    expect(avg).toBeGreaterThan(0.8);
    expect(avg).toBeLessThan(2.0);

    // Negatif olmamalı
    expect(Math.min(...results)).toBeGreaterThanOrEqual(0);

    // Maksimum 7 gol sınırı
    expect(Math.max(...results)).toBeLessThanOrEqual(10); // Poisson sınırsız ama pratikte <10
  });

  test('Düşük expected goals (0.5) az gol üretir', () => {
    const results: number[] = [];
    for (let i = 0; i < 1000; i++) {
      results.push(poissonRandom(0.5));
    }
    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    expect(avg).toBeLessThan(1.0);
  });

  test('Yüksek expected goals (3.0) çok gol üretir', () => {
    const results: number[] = [];
    for (let i = 0; i < 1000; i++) {
      results.push(poissonRandom(3.0));
    }
    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    expect(avg).toBeGreaterThan(2.0);
    expect(avg).toBeLessThan(4.5);
  });

  test('Maç simülasyonu gol sonuçları makul aralıkta', () => {
    for (let i = 0; i < 100; i++) {
      const result = simulateGoals(1.3, 1.1);
      expect(result.home).toBeGreaterThanOrEqual(0);
      expect(result.away).toBeGreaterThanOrEqual(0);
      expect(result.home).toBeLessThanOrEqual(7);
      expect(result.away).toBeLessThanOrEqual(7);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// PUAN HESAPLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

interface StandingRow {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
}

/**
 * Maç sonucuna göre puan tablosunu günceller.
 */
function updateStanding(
  standing: StandingRow,
  goalsFor: number,
  goalsAgainst: number
): StandingRow {
  const isWin = goalsFor > goalsAgainst;
  const isDraw = goalsFor === goalsAgainst;

  return {
    played: standing.played + 1,
    won: standing.won + (isWin ? 1 : 0),
    drawn: standing.drawn + (isDraw ? 1 : 0),
    lost: standing.lost + (!isWin && !isDraw ? 1 : 0),
    gf: standing.gf + goalsFor,
    ga: standing.ga + goalsAgainst,
    points: standing.points + (isWin ? 3 : isDraw ? 1 : 0),
  };
}

describe('Puan Hesaplama Testleri', () => {
  const initialStanding: StandingRow = {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    points: 0,
  };

  test('Galibiyet 3 puan verir', () => {
    const result = updateStanding(initialStanding, 2, 0);
    expect(result.points).toBe(3);
    expect(result.won).toBe(1);
    expect(result.drawn).toBe(0);
    expect(result.lost).toBe(0);
    expect(result.played).toBe(1);
    expect(result.gf).toBe(2);
    expect(result.ga).toBe(0);
  });

  test('Beraberlik 1 puan verir', () => {
    const result = updateStanding(initialStanding, 1, 1);
    expect(result.points).toBe(1);
    expect(result.won).toBe(0);
    expect(result.drawn).toBe(1);
    expect(result.lost).toBe(0);
    expect(result.played).toBe(1);
  });

  test('Mağlubiyet 0 puan verir', () => {
    const result = updateStanding(initialStanding, 0, 3);
    expect(result.points).toBe(0);
    expect(result.won).toBe(0);
    expect(result.drawn).toBe(0);
    expect(result.lost).toBe(1);
    expect(result.played).toBe(1);
  });

  test('Kümülatif puan hesaplama doğru çalışır', () => {
    let standing = { ...initialStanding };
    
    // 3 galibiyet = 9 puan
    standing = updateStanding(standing, 2, 1);
    standing = updateStanding(standing, 3, 0);
    standing = updateStanding(standing, 1, 0);
    
    // 1 beraberlik = 1 puan
    standing = updateStanding(standing, 2, 2);
    
    // 1 mağlubiyet = 0 puan
    standing = updateStanding(standing, 0, 4);

    expect(standing.played).toBe(5);
    expect(standing.won).toBe(3);
    expect(standing.drawn).toBe(1);
    expect(standing.lost).toBe(1);
    expect(standing.points).toBe(10);
    expect(standing.gf).toBe(8);
    expect(standing.ga).toBe(7);
  });

  test('34 maçlık tam sezon puan hesaplama', () => {
    let standing = { ...initialStanding };
    
    // 20 galibiyet, 8 beraberlik, 6 mağlubiyet = 68 puan
    for (let i = 0; i < 20; i++) standing = updateStanding(standing, 2, 0);
    for (let i = 0; i < 8; i++) standing = updateStanding(standing, 1, 1);
    for (let i = 0; i < 6; i++) standing = updateStanding(standing, 0, 1);

    expect(standing.played).toBe(34);
    expect(standing.won).toBe(20);
    expect(standing.drawn).toBe(8);
    expect(standing.lost).toBe(6);
    expect(standing.points).toBe(68);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TAKIM GÜCÜ HESAPLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

interface Player {
  id: string;
  name: string;
  position: string;
  rating: number;
  form_rating: number;
}

/**
 * Takım gücünü hesaplar (rating ortalaması + form faktörü).
 */
function calculateTeamStrength(players: Player[]): number {
  if (!players || players.length === 0) return 50.0;
  
  const ratings = players.filter(p => p.rating).map(p => p.rating);
  if (ratings.length === 0) return 50.0;
  
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const formBonus = players.reduce((sum, p) => sum + (p.form_rating || 0), 0) / players.length * 0.1;
  
  return avgRating + formBonus;
}

describe('Takım Gücü Hesaplama Testleri', () => {
  test('Boş kadro 50.0 döner', () => {
    expect(calculateTeamStrength([])).toBe(50.0);
  });

  test('Tek oyunculu kadro rating döndürür', () => {
    const players: Player[] = [
      { id: '1', name: 'Test', position: 'ST', rating: 80, form_rating: 70 },
    ];
    const strength = calculateTeamStrength(players);
    expect(strength).toBeCloseTo(80 + 70 * 0.1, 1);
  });

  test('Rating olmayan oyuncular filtrelenir', () => {
    const players: Player[] = [
      { id: '1', name: 'Test1', position: 'ST', rating: 80, form_rating: 70 },
      { id: '2', name: 'Test2', position: 'CM', rating: 0, form_rating: 0 },
    ];
    const strength = calculateTeamStrength(players);
    // Sadece rating > 0 olanlar hesaba katılır
    expect(strength).toBeGreaterThan(0);
  });

  test('Yüksek ratingli takım daha güçlü', () => {
    const strongTeam: Player[] = [
      { id: '1', name: 'S1', position: 'GK', rating: 85, form_rating: 80 },
      { id: '2', name: 'S2', position: 'CB', rating: 82, form_rating: 75 },
      { id: '3', name: 'S3', position: 'ST', rating: 90, form_rating: 85 },
    ];
    const weakTeam: Player[] = [
      { id: '4', name: 'W1', position: 'GK', rating: 55, form_rating: 50 },
      { id: '5', name: 'W2', position: 'CB', rating: 50, form_rating: 45 },
      { id: '6', name: 'W3', position: 'ST', rating: 60, form_rating: 55 },
    ];

    const strongStrength = calculateTeamStrength(strongTeam);
    const weakStrength = calculateTeamStrength(weakTeam);

    expect(strongStrength).toBeGreaterThan(weakStrength);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// KART CEZASI HESAPLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

interface CardEvent {
  type: 'yellow_card' | 'red_card';
  playerId: string;
  playerName: string;
  reason?: string;
}

/**
 * Kart olaylarından cezalandırılacak oyuncuları belirler.
 * - Direkt kırmızı → cezalı
 * - 2 sarı kart (aynı maç) → cezalı
 * - 1 sarı kart → cezasız
 */
function computeSuspensions(cardEvents: CardEvent[]): { playerId: string; reason: string }[] {
  const cardCounts: Record<string, { yellow: number; red: number }> = {};

  for (const event of cardEvents) {
    const pid = event.playerId;
    if (!cardCounts[pid]) cardCounts[pid] = { yellow: 0, red: 0 };

    if (event.type === 'yellow_card') cardCounts[pid].yellow += 1;
    if (event.type === 'red_card') cardCounts[pid].red += 1;
  }

  const suspended: { playerId: string; reason: string }[] = [];

  for (const [pid, counts] of Object.entries(cardCounts)) {
    if (counts.red >= 1) {
      suspended.push({ playerId: pid, reason: `Kırmızı kart: ${counts.red} kırmızı` });
    } else if (counts.yellow >= 2) {
      suspended.push({ playerId: pid, reason: `Çift sarı kart: ${counts.yellow} sarı` });
    }
  }

  return suspended;
}

describe('Kart Cezası Hesaplama Testleri', () => {
  test('Kartsız maçta ceza yok', () => {
    expect(computeSuspensions([])).toEqual([]);
  });

  test('Tek sarı kart ceza vermez', () => {
    const events: CardEvent[] = [
      { type: 'yellow_card', playerId: 'p1', playerName: 'Oyuncu 1' },
    ];
    expect(computeSuspensions(events)).toEqual([]);
  });

  test('İki sarı kart ceza verir', () => {
    const events: CardEvent[] = [
      { type: 'yellow_card', playerId: 'p1', playerName: 'Oyuncu 1' },
      { type: 'yellow_card', playerId: 'p1', playerName: 'Oyuncu 1' },
    ];
    const result = computeSuspensions(events);
    expect(result).toHaveLength(1);
    expect(result[0].playerId).toBe('p1');
    expect(result[0].reason).toContain('Çift sarı');
  });

  test('Direkt kırmızı kart ceza verir', () => {
    const events: CardEvent[] = [
      { type: 'red_card', playerId: 'p2', playerName: 'Oyuncu 2', reason: 'Agresif davranış' },
    ];
    const result = computeSuspensions(events);
    expect(result).toHaveLength(1);
    expect(result[0].playerId).toBe('p2');
    expect(result[0].reason).toContain('Kırmızı kart');
  });

  test('Farklı oyuncuların kartları ayrı hesaplanır', () => {
    const events: CardEvent[] = [
      { type: 'yellow_card', playerId: 'p1', playerName: 'Oyuncu 1' },
      { type: 'yellow_card', playerId: 'p2', playerName: 'Oyuncu 2' },
      { type: 'red_card', playerId: 'p3', playerName: 'Oyuncu 3' },
    ];
    const result = computeSuspensions(events);
    expect(result).toHaveLength(1); // Sadece kırmızı kartlı oyuncu
    expect(result[0].playerId).toBe('p3');
  });

  test('Sarı + kırmızı kart ceza verir', () => {
    const events: CardEvent[] = [
      { type: 'yellow_card', playerId: 'p1', playerName: 'Oyuncu 1' },
      { type: 'red_card', playerId: 'p1', playerName: 'Oyuncu 1', reason: 'İkinci sarı kart' },
    ];
    const result = computeSuspensions(events);
    expect(result).toHaveLength(1);
    expect(result[0].playerId).toBe('p1');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// MVP PUANLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════════════

interface MVPCandidate {
  playerId: string;
  playerName: string;
  goals: number;
  assists: number;
  motm: number;
  matches: number;
  avgRating: number;
}

/**
 * MVP puanı hesaplar.
 * Puan = gol * 3 + asist * 2 + motm * 5 + maç * 0.1
 */
function computeMVPScore(candidate: MVPCandidate): number {
  return candidate.goals * 3 + candidate.assists * 2 + candidate.motm * 5 + candidate.matches * 0.1;
}

describe('MVP Puanlama Testleri', () => {
  test('Gol en yüksek katkı sağlar (3 puan)', () => {
    const scorer: MVPCandidate = { playerId: '1', playerName: 'Golcü', goals: 5, assists: 0, motm: 0, matches: 10, avgRating: 7 };
    const assister: MVPCandidate = { playerId: '2', playerName: 'Asistçi', goals: 0, assists: 5, motm: 0, matches: 10, avgRating: 7 };
    
    expect(computeMVPScore(scorer)).toBe(15 + 1); // 5*3 + 10*0.1
    expect(computeMVPScore(assister)).toBe(10 + 1); // 5*2 + 10*0.1
    expect(computeMVPScore(scorer)).toBeGreaterThan(computeMVPScore(assister));
  });

  test('MOTM büyük avantaj sağlar (5 puan)', () => {
    const withMotm: MVPCandidate = { playerId: '1', playerName: 'MOTM', goals: 0, assists: 0, motm: 3, matches: 10, avgRating: 7 };
    const withoutMotm: MVPCandidate = { playerId: '2', playerName: 'Normal', goals: 0, assists: 0, motm: 0, matches: 10, avgRating: 7 };
    
    expect(computeMVPScore(withMotm)).toBe(15 + 1); // 3*5 + 10*0.1
    expect(computeMVPScore(withoutMotm)).toBe(1); // 10*0.1
  });

  test('Sıfır istatistikli oyuncu düşük puan alır', () => {
    const zero: MVPCandidate = { playerId: '1', playerName: 'Yedek', goals: 0, assists: 0, motm: 0, matches: 0, avgRating: 5 };
    expect(computeMVPScore(zero)).toBe(0);
  });

  test('Kapsamlı MVP hesaplama', () => {
    const candidate: MVPCandidate = { 
      playerId: '1', playerName: 'Star', 
      goals: 10, assists: 8, motm: 5, matches: 30, avgRating: 8.2 
    };
    const expected = 10 * 3 + 8 * 2 + 5 * 5 + 30 * 0.1; // 30 + 16 + 25 + 3 = 74
    expect(computeMVPScore(candidate)).toBe(expected);
  });
});
