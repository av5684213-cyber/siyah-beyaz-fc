/**
 * Match Calculator Tests
 * Poisson dağılımı, puan hesaplama, ve maç motoru yardımcı fonksiyonları testleri
 */

// ─── Poisson Dağılımı Testleri ─────────────────────────────────────────

/**
 * Poisson dağılımından rastgele sayı üretir (Box-Muller dönüşümü ile)
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
 Beklenen gol sayısına göre gol olasılıklarını hesaplar (Poisson PMF)
 */
function poissonPMF(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

// ─── Puan Hesaplama ──────────────────────────────────────────────────

interface MatchScore {
  homeGoals: number;
  awayGoals: number;
}

interface TeamPoints {
  homePoints: number;
  awayPoints: number;
  homeWon: boolean;
  awayWon: boolean;
  drawn: boolean;
}

function calculatePoints(score: MatchScore): TeamPoints {
  if (score.homeGoals > score.awayGoals) {
    return { homePoints: 3, awayPoints: 0, homeWon: true, awayWon: false, drawn: false };
  } else if (score.homeGoals < score.awayGoals) {
    return { homePoints: 0, awayPoints: 3, homeWon: false, awayWon: true, drawn: false };
  } else {
    return { homePoints: 1, awayPoints: 1, homeWon: false, awayWon: false, drawn: true };
  }
}

/**
 * Sezon puan tablosunu hesaplar
 */
function calculateStandings(
  results: MatchScore[],
  isHome: boolean[]
): { points: number; won: number; drawn: number; lost: number; gf: number; ga: number } {
  let points = 0;
  let won = 0;
  let drawn = 0;
  let lost = 0;
  let gf = 0;
  let ga = 0;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const teamGoals = isHome[i] ? result.homeGoals : result.awayGoals;
    const oppGoals = isHome[i] ? result.awayGoals : result.homeGoals;

    gf += teamGoals;
    ga += oppGoals;

    const pts = calculatePoints(result);
    if (isHome[i]) {
      points += pts.homePoints;
      if (pts.homeWon) won++;
      else if (pts.drawn) drawn++;
      else lost++;
    } else {
      points += pts.awayPoints;
      if (pts.awayWon) won++;
      else if (pts.drawn) drawn++;
      else lost++;
    }
  }

  return { points, won, drawn, lost, gf, ga };
}

/**
 Maç sonucu beklenen gol sayısına göre mantıklı mı kontrol eder
 */
function isRealisticScore(homeGoals: number, awayGoals: number): boolean {
  // Toplam 10+ gol çok nadir
  if (homeGoals + awayGoals > 10) return false;
  // Tek takım 8+ gol çok nadir
  if (homeGoals > 8 || awayGoals > 8) return false;
  // Negatif gol olamaz
  if (homeGoals < 0 || awayGoals < 0) return false;
  return true;
}

/**
 * Gol diferansiyeli hesaplar
 */
function goalDifference(gf: number, ga: number): number {
  return gf - ga;
}

// ═══════════════════════════════════════════════════════════════════════
// TESTLER
// ═══════════════════════════════════════════════════════════════════════

describe('Match Calculator', () => {
  // ─── Poisson Dağılımı Testleri ────────────────────────────────────────

  describe('Poisson Distribution', () => {
    test('poissonRandom should return non-negative integers', () => {
      for (let i = 0; i < 100; i++) {
        const result = poissonRandom(1.3);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    test('poissonRandom with lambda=0 should always return 0', () => {
      for (let i = 0; i < 50; i++) {
        expect(poissonRandom(0)).toBe(0);
      }
    });

    test('poissonRandom mean should approximate lambda for large samples', () => {
      const lambda = 2.5;
      const samples = 10000;
      let sum = 0;
      for (let i = 0; i < samples; i++) {
        sum += poissonRandom(lambda);
      }
      const mean = sum / samples;
      // %10 tolerans
      expect(mean).toBeGreaterThan(lambda * 0.9);
      expect(mean).toBeLessThan(lambda * 1.1);
    });

    test('poissonPMF should sum to approximately 1', () => {
      const lambda = 1.5;
      let totalProbability = 0;
      for (let k = 0; k <= 20; k++) {
        totalProbability += poissonPMF(k, lambda);
      }
      expect(totalProbability).toBeCloseTo(1.0, 4);
    });

    test('poissonPMF peak should be near lambda', () => {
      const lambda = 3;
      let maxProb = 0;
      let maxK = 0;
      for (let k = 0; k <= 10; k++) {
        const prob = poissonPMF(k, lambda);
        if (prob > maxProb) {
          maxProb = prob;
          maxK = k;
        }
      }
      // Peak should be at k=2 or k=3 for lambda=3
      expect(maxK).toBeGreaterThanOrEqual(2);
      expect(maxK).toBeLessThanOrEqual(3);
    });

    test('higher lambda should produce higher expected goals', () => {
      const lowLambda = 0.8;
      const highLambda = 3.0;
      let lowSum = 0;
      let highSum = 0;
      const iterations = 5000;

      for (let i = 0; i < iterations; i++) {
        lowSum += poissonRandom(lowLambda);
        highSum += poissonRandom(highLambda);
      }

      expect(highSum / iterations).toBeGreaterThan(lowSum / iterations);
    });
  });

  // ─── Puan Hesaplama Testleri ──────────────────────────────────────────

  describe('Points Calculation', () => {
    test('home win should give 3 points to home, 0 to away', () => {
      const result = calculatePoints({ homeGoals: 2, awayGoals: 1 });
      expect(result.homePoints).toBe(3);
      expect(result.awayPoints).toBe(0);
      expect(result.homeWon).toBe(true);
      expect(result.awayWon).toBe(false);
      expect(result.drawn).toBe(false);
    });

    test('away win should give 0 points to home, 3 to away', () => {
      const result = calculatePoints({ homeGoals: 0, awayGoals: 3 });
      expect(result.homePoints).toBe(0);
      expect(result.awayPoints).toBe(3);
      expect(result.homeWon).toBe(false);
      expect(result.awayWon).toBe(true);
      expect(result.drawn).toBe(false);
    });

    test('draw should give 1 point each', () => {
      const result = calculatePoints({ homeGoals: 1, awayGoals: 1 });
      expect(result.homePoints).toBe(1);
      expect(result.awayPoints).toBe(1);
      expect(result.homeWon).toBe(false);
      expect(result.awayWon).toBe(false);
      expect(result.drawn).toBe(true);
    });

    test('0-0 is a draw', () => {
      const result = calculatePoints({ homeGoals: 0, awayGoals: 0 });
      expect(result.drawn).toBe(true);
      expect(result.homePoints).toBe(1);
      expect(result.awayPoints).toBe(1);
    });
  });

  // ─── Sezon Puan Tablosu Testleri ──────────────────────────────────────

  describe('Season Standings', () => {
    test('calculateStandings for a perfect season (all wins)', () => {
      const results: MatchScore[] = [
        { homeGoals: 2, awayGoals: 0 },
        { homeGoals: 3, awayGoals: 1 },
        { homeGoals: 1, awayGoals: 0 },
      ];
      const isHome = [true, true, true];

      const standings = calculateStandings(results, isHome);
      expect(standings.points).toBe(9);
      expect(standings.won).toBe(3);
      expect(standings.drawn).toBe(0);
      expect(standings.lost).toBe(0);
      expect(standings.gf).toBe(6);
      expect(standings.ga).toBe(1);
    });

    test('calculateStandings for mixed results', () => {
      const results: MatchScore[] = [
        { homeGoals: 2, awayGoals: 1 },   // Win (home) — takım ev sahibi, 2-1 kazandı
        { homeGoals: 3, awayGoals: 1 },   // Loss (away) — takım deplasman, 1-3 kaybetti
        { homeGoals: 0, awayGoals: 0 },   // Draw (home) — takım ev sahibi, 0-0 berabere
      ];
      const isHome = [true, false, true];

      const standings = calculateStandings(results, isHome);
      expect(standings.points).toBe(4); // 3 (win) + 0 (loss) + 1 (draw) = 4
      expect(standings.won).toBe(1);
      expect(standings.drawn).toBe(1);
      expect(standings.lost).toBe(1);
    });

    test('goal difference calculation', () => {
      expect(goalDifference(10, 5)).toBe(5);
      expect(goalDifference(3, 3)).toBe(0);
      expect(goalDifference(0, 4)).toBe(-4);
    });

    test('34-match season should have correct total', () => {
      // Simulate a 34-match season: 20W, 8D, 6L
      const results: MatchScore[] = [];
      const isHome: boolean[] = [];

      // 20 wins — takım her zaman daha çok gol atar
      for (let i = 0; i < 20; i++) {
        const isHomeMatch = i % 2 === 0;
        isHome.push(isHomeMatch);
        if (isHomeMatch) {
          results.push({ homeGoals: 2, awayGoals: 0 }); // Ev sahibi: 2-0 kazanır
        } else {
          results.push({ homeGoals: 0, awayGoals: 2 }); // Deplasman: 0-2 kazanır (away=2)
        }
      }
      // 8 draws
      for (let i = 0; i < 8; i++) {
        results.push({ homeGoals: 1, awayGoals: 1 });
        isHome.push(true);
      }
      // 6 losses — rakip her zaman daha çok gol atar
      for (let i = 0; i < 6; i++) {
        const isHomeMatch = i % 2 === 0;
        isHome.push(isHomeMatch);
        if (isHomeMatch) {
          results.push({ homeGoals: 0, awayGoals: 2 }); // Ev sahibi: 0-2 kaybeder
        } else {
          results.push({ homeGoals: 3, awayGoals: 0 }); // Deplasman: 3-0 kaybeder (away=0)
        }
      }

      const standings = calculateStandings(results, isHome);
      expect(standings.won).toBe(20);
      expect(standings.drawn).toBe(8);
      expect(standings.lost).toBe(6);
      expect(standings.points).toBe(20 * 3 + 8 * 1 + 6 * 0);
    });
  });

  // ─── Gerçekçilik Kontrol Testleri ─────────────────────────────────────

  describe('Score Realism', () => {
    test('common scores should be realistic', () => {
      expect(isRealisticScore(0, 0)).toBe(true);
      expect(isRealisticScore(1, 0)).toBe(true);
      expect(isRealisticScore(2, 1)).toBe(true);
      expect(isRealisticScore(3, 3)).toBe(true);
      expect(isRealisticScore(5, 0)).toBe(true);
    });

    test('unrealistic scores should be rejected', () => {
      expect(isRealisticScore(-1, 0)).toBe(false);
      expect(isRealisticScore(9, 2)).toBe(false);
      expect(isRealisticScore(5, 6)).toBe(false);
    });

    test('Poisson-generated scores should mostly be realistic', () => {
      let realisticCount = 0;
      const iterations = 1000;
      const homeLambda = 1.3;
      const awayLambda = 1.1;

      for (let i = 0; i < iterations; i++) {
        const homeGoals = poissonRandom(homeLambda);
        const awayGoals = poissonRandom(awayLambda);
        if (isRealisticScore(homeGoals, awayGoals)) {
          realisticCount++;
        }
      }

      // En az %95 gerçekçi olmalı
      expect(realisticCount / iterations).toBeGreaterThan(0.95);
    });
  });

  // ─── Factorial Testleri ───────────────────────────────────────────────

  describe('Factorial', () => {
    test('factorial of 0 is 1', () => {
      expect(factorial(0)).toBe(1);
    });

    test('factorial of 1 is 1', () => {
      expect(factorial(1)).toBe(1);
    });

    test('factorial of 5 is 120', () => {
      expect(factorial(5)).toBe(120);
    });

    test('factorial of 10 is 3628800', () => {
      expect(factorial(10)).toBe(3628800);
    });
  });
});
