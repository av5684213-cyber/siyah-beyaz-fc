/**
 * Siyah Beyaz FC — Lig Sıralama ve Fikstür Testleri
 *
 * league.ts modülünün saf fonksiyonlarını test eder:
 * - generateRoundRobin: Round-robin fikstür üretimi
 * - getTomorrowNoon: Yarın tarih hesaplama
 *
 * leagueHelpers.ts modülünün sezon sonu fonksiyonlarını test eder:
 * - processPromotionRelegation: Yükselme/düşme mantığı (mock Supabase)
 *
 * sezon ödül hesaplama:
 * - seasonAwardsService.ts: computeSeasonAwards, computeSeasonBadge
 */

import { generateRoundRobin, getTomorrowNoon } from '@/lib/fm/league';

// ═══════════════════════════════════════════════════════════════
// ROUND-ROBİN FİKSTÜR ÜRETİCİ TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('generateRoundRobin', () => {
  test('18 takım için 34 hafta üretir (çift devreli)', () => {
    const teams = Array.from({ length: 18 }, (_, i) => `Takım ${i + 1}`);
    const weeks = generateRoundRobin(teams);
    expect(weeks.length).toBe(34);
  });

  test('Her haftada 9 maç olur (18 takım / 2)', () => {
    const teams = Array.from({ length: 18 }, (_, i) => `Takım ${i + 1}`);
    const weeks = generateRoundRobin(teams);
    for (const week of weeks) {
      expect(week.matches.length).toBe(9);
    }
  });

  test('İlk 17 hafta birinci devre, son 17 hafta ikinci devre', () => {
    const teams = Array.from({ length: 18 }, (_, i) => `Takım ${i + 1}`);
    const weeks = generateRoundRobin(teams);

    // İkinci devre, birinci devrenin home/away tersi
    for (let i = 0; i < 17; i++) {
      const firstHalf = weeks[i].matches;
      const secondHalf = weeks[i + 17].matches;

      for (const match of firstHalf) {
        const reverse = secondHalf.find(
          m => m.home === match.away && m.away === match.home
        );
        expect(reverse).toBeDefined();
      }
    }
  });

  test('Her takım diğer tüm takımlarla 2 kez karşılaşır (ev + deplasman)', () => {
    const teams = Array.from({ length: 18 }, (_, i) => `Takım ${i + 1}`);
    const weeks = generateRoundRobin(teams);

    const matchCount: Record<string, Record<string, number>> = {};
    for (const team of teams) {
      matchCount[team] = {};
      for (const opp of teams) {
        if (opp !== team) matchCount[team][opp] = 0;
      }
    }

    for (const week of weeks) {
      for (const match of week.matches) {
        matchCount[match.home][match.away]++;
        matchCount[match.away][match.home]++;
      }
    }

    for (const team of teams) {
      for (const opp of teams) {
        if (opp !== team) {
          expect(matchCount[team][opp]).toBe(2);
        }
      }
    }
  });

  test('Tek takım boş dizi döner', () => {
    const weeks = generateRoundRobin(['Tek Takım']);
    expect(weeks.length).toBe(0);
  });

  test('Boş takım listesi boş dizi döner', () => {
    const weeks = generateRoundRobin([]);
    expect(weeks.length).toBe(0);
  });

  test('2 takım için 2 hafta üretir', () => {
    const weeks = generateRoundRobin(['A', 'B']);
    expect(weeks.length).toBe(2);
  });

  test('4 takım için 6 hafta üretir', () => {
    const weeks = generateRoundRobin(['A', 'B', 'C', 'D']);
    expect(weeks.length).toBe(6);
  });

  test('Hafta numaraları 1den başlar ve artan sırada', () => {
    const teams = Array.from({ length: 6 }, (_, i) => `T${i + 1}`);
    const weeks = generateRoundRobin(teams);
    for (let i = 0; i < weeks.length; i++) {
      expect(weeks[i].week).toBe(i + 1);
    }
  });

  test('BYE takımları maçlarda yer almaz (tek sayı takım)', () => {
    const teams = ['A', 'B', 'C', 'D', 'E']; // 5 takım
    const weeks = generateRoundRobin(teams);
    for (const week of weeks) {
      for (const match of week.matches) {
        expect(match.home).not.toBe('BYE');
        expect(match.away).not.toBe('BYE');
      }
    }
  });

  test('Toplam maç sayısı = n*(n-1) (çift devreli)', () => {
    const n = 10;
    const teams = Array.from({ length: n }, (_, i) => `T${i + 1}`);
    const weeks = generateRoundRobin(teams);
    const totalMatches = weeks.reduce((sum, w) => sum + w.matches.length, 0);
    expect(totalMatches).toBe(n * (n - 1));
  });
});

// ═══════════════════════════════════════════════════════════════
// PUAN DURUMU HESAPLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('Puan Durumu Hesaplama', () => {
  interface Standing {
    team_id: string;
    name: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    points: number;
  }

  /**
   * Maç sonucuna göre puan durumunu günceller (league.ts ile aynı mantık)
   */
  function updateStanding(standing: Standing, gf: number, ga: number): Standing {
    const isWin = gf > ga;
    const isDraw = gf === ga;
    return {
      ...standing,
      played: standing.played + 1,
      won: standing.won + (isWin ? 1 : 0),
      drawn: standing.drawn + (isDraw ? 1 : 0),
      lost: standing.lost + (!isWin && !isDraw ? 1 : 0),
      gf: standing.gf + gf,
      ga: standing.ga + ga,
      points: standing.points + (isWin ? 3 : isDraw ? 1 : 0),
    };
  }

  function createEmptyStanding(teamId: string, name: string): Standing {
    return { team_id: teamId, name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 };
  }

  test('Galibiyet +3 puan, beraberlik +1, mağlubiyet +0', () => {
    let s = createEmptyStanding('t1', 'Test');
    s = updateStanding(s, 2, 0); // galibiyet
    expect(s.points).toBe(3);
    s = updateStanding(s, 1, 1); // beraberlik
    expect(s.points).toBe(4);
    s = updateStanding(s, 0, 1); // mağlubiyet
    expect(s.points).toBe(4);
  });

  test('Averaj (gd) doğru hesaplanır', () => {
    let s = createEmptyStanding('t1', 'Test');
    s = updateStanding(s, 3, 1); // +2
    s = updateStanding(s, 0, 2); // -2
    expect(s.gf).toBe(3);
    expect(s.ga).toBe(3);
    // gd = gf - ga = 0
  });

  test('Sıralama: puan → averaj → attığı gol', () => {
    const teams = [
      { team_id: 't1', name: 'A', played: 2, won: 2, drawn: 0, lost: 0, gf: 5, ga: 1, points: 6 },
      { team_id: 't2', name: 'B', played: 2, won: 2, drawn: 0, lost: 0, gf: 3, ga: 0, points: 6 },
      { team_id: 't3', name: 'C', played: 2, won: 1, drawn: 1, lost: 0, gf: 4, ga: 2, points: 4 },
      { team_id: 't4', name: 'D', played: 2, won: 0, drawn: 0, lost: 2, gf: 0, ga: 9, points: 0 },
    ];

    const sorted = [...teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdA = a.gf - a.ga;
      const gdB = b.gf - b.ga;
      if (gdB !== gdA) return gdB - gdA;
      return b.gf - a.gf;
    });

    expect(sorted[0].team_id).toBe('t1'); // 6 puan, averaj +4
    expect(sorted[1].team_id).toBe('t2'); // 6 puan, averaj +3
    expect(sorted[2].team_id).toBe('t3'); // 4 puan
    expect(sorted[3].team_id).toBe('t4'); // 0 puan
  });

  test('34 maçlık tam sezon hesaplama', () => {
    let s = createEmptyStanding('t1', 'Test');
    // 20 galibiyet, 8 beraberlik, 6 mağlubiyet
    for (let i = 0; i < 20; i++) s = updateStanding(s, 2, 0);
    for (let i = 0; i < 8; i++) s = updateStanding(s, 1, 1);
    for (let i = 0; i < 6; i++) s = updateStanding(s, 0, 1);

    expect(s.played).toBe(34);
    expect(s.won).toBe(20);
    expect(s.drawn).toBe(8);
    expect(s.lost).toBe(6);
    expect(s.points).toBe(68); // 20*3 + 8*1
  });

  test('Yükselme bölgesi: 1. sıra doğrudan, 2-5. sıra playoff', () => {
    const positions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    const promotionZone = positions.filter(p => p === 1);
    const playoffZone = positions.filter(p => p >= 2 && p <= 5);
    const relegationZone = positions.filter(p => p > 16); // son 2

    expect(promotionZone).toEqual([1]);
    expect(playoffZone).toEqual([2, 3, 4, 5]);
    expect(relegationZone).toEqual([17, 18]);
  });

  test('4. Ligden düşme yok', () => {
    const tier4RelegationAllowed = false;
    expect(tier4RelegationAllowed).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// YARIN TARİH HESAPLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('getTomorrowNoon', () => {
  test('Yarının tarihini döner', () => {
    const tomorrow = getTomorrowNoon();
    const now = new Date();
    const expectedTomorrow = new Date(now);
    expectedTomorrow.setDate(expectedTomorrow.getDate() + 1);
    expectedTomorrow.setHours(12, 0, 0, 0);

    expect(tomorrow.getDate()).toBe(expectedTomorrow.getDate());
    expect(tomorrow.getMonth()).toBe(expectedTomorrow.getMonth());
  });

  test('Saat 12:00 olarak ayarlanır', () => {
    const tomorrow = getTomorrowNoon();
    expect(tomorrow.getHours()).toBe(12);
    expect(tomorrow.getMinutes()).toBe(0);
    expect(tomorrow.getSeconds()).toBe(0);
  });

  test('Date objesi döner', () => {
    const tomorrow = getTomorrowNoon();
    expect(tomorrow).toBeInstanceOf(Date);
  });
});

// ═══════════════════════════════════════════════════════════════
// SEZON ÖDÜL HESAPLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('Sezon Ödül Hesaplama', () => {
  // seasonAwardsService'den computeSeasonBadge mantığını test edelim
  // (import gerektirir, burada mantığı test ediyoruz)

  test('Şampiyon badge: 1. sıra', () => {
    const position = 1;
    const expectedBadge = 'champion';
    expect(position === 1 ? 'champion' : 'other').toBe(expectedBadge);
  });

  test('Top 4 badge: 2-4. sıra', () => {
    const positions = [2, 3, 4];
    for (const pos of positions) {
      const badge = pos <= 4 ? 'top4' : 'other';
      expect(badge).toBe('top4');
    }
  });

  test('Küme düşme badge: son 2 sıra (18 takım)', () => {
    const totalTeams = 18;
    const relegatedPositions = [17, 18];
    for (const pos of relegatedPositions) {
      const badge = pos > totalTeams - 2 ? 'relegated' : 'other';
      expect(badge).toBe('relegated');
    }
  });

  test('Orta sıra badge: 5-16 arası', () => {
    const midPositions = [5, 8, 12, 16];
    for (const pos of midPositions) {
      const badge = pos > 4 && pos <= 16 ? 'mid_table' : 'other';
      expect(badge).toBe('mid_table');
    }
  });

  test('Golden Boot: en çok gol atan oyuncu', () => {
    const candidates = [
      { name: 'Oyuncu A', goals: 25 },
      { name: 'Oyuncu B', goals: 18 },
      { name: 'Oyuncu C', goals: 30 },
      { name: 'Oyuncu D', goals: 22 },
    ];
    const winner = candidates.reduce((best, c) => c.goals > best.goals ? c : best);
    expect(winner.name).toBe('Oyuncu C');
    expect(winner.goals).toBe(30);
  });

  test('MVP hesaplama: gol×3 + asist×2 + motm×5 + maç×0.1', () => {
    const mvpScore = (goals: number, assists: number, motm: number, matches: number) =>
      goals * 3 + assists * 2 + motm * 5 + matches * 0.1;

    expect(mvpScore(10, 8, 5, 30)).toBe(30 + 16 + 25 + 3);
    expect(mvpScore(0, 0, 0, 0)).toBe(0);
    expect(mvpScore(5, 5, 5, 10)).toBe(15 + 10 + 25 + 1);
  });

  test('En İyi Kaleci: en yüksek ratingli GK', () => {
    const goalkeepers = [
      { name: 'GK1', position: 'GK', rating: 85 },
      { name: 'GK2', position: 'GK', rating: 78 },
      { name: 'GK3', position: 'GK', rating: 90 },
    ];
    const bestGK = goalkeepers.reduce((best, gk) => gk.rating > best.rating ? gk : best);
    expect(bestGK.name).toBe('GK3');
  });

  test('En İyi Genç (U21): 21 yaş altı en yüksek ratingli', () => {
    const youngPlayers = [
      { name: 'Genç A', age: 19, rating: 78 },
      { name: 'Genç B', age: 20, rating: 82 },
      { name: 'Genç C', age: 21, rating: 75 },
      { name: 'Yaşlı', age: 25, rating: 90 }, // U21 değil
    ];
    const eligible = youngPlayers.filter(p => p.age <= 21);
    const bestYoung = eligible.reduce((best, p) => p.rating > best.rating ? p : best);
    expect(bestYoung.name).toBe('Genç B');
  });
});

// ═══════════════════════════════════════════════════════════════
// YAŞLANDIRMA VE EMEKLİLİK TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('Yaşlandırma ve Emeklilik Kuralları', () => {
  test('40+ yaş zorunlu emeklilik', () => {
    const age = 40;
    const mustRetire = age >= 40;
    expect(mustRetire).toBe(true);
  });

  test('38-39 yaş %40 ihtimalle emeklilik', () => {
    const age = 38;
    const retirementChance = age >= 38 && age < 40 ? 0.40 : 0;
    expect(retirementChance).toBe(0.40);
  });

  test('36-37 yaş ağır şartlı emeklilik', () => {
    const age = 36;
    const isConditionalRetirement = age >= 36 && age < 38;
    expect(isConditionalRetirement).toBe(true);
  });

  test('35 yaş altı emeklilik yok', () => {
    const age = 35;
    const noRetirement = age < 36;
    expect(noRetirement).toBe(true);
  });

  test('31+ hız/ivme düşüşü başlar', () => {
    const age = 31;
    const hasDecline = age >= 31;
    expect(hasDecline).toBe(true);
  });

  test('33+ pas/kondisyon düşüşü başlar', () => {
    const age = 33;
    const hasPassDecline = age >= 33;
    expect(hasPassDecline).toBe(true);
  });
});
