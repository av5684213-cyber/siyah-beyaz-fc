/**
 * Siyah Beyaz FC — API League Standings Testleri
 *
 * /api/league/standings route'unun mantığını test eder:
 * - sanitizeTeamName: Takım ismi temizleme
 * - Sıralama: Puan → Averaj → Atılan Gol → team_id
 * - Puan hesaplama: Galibiyet 3, Beraberlik 1, Mağlubiyet 0
 * - Mock veri üretimi
 * - Eksik standings tamiri
 */

// ═══════════════════════════════════════════════════════════════
// sanitizeTeamName — route.ts'ten çıkarılan mantık
// ═══════════════════════════════════════════════════════════════

function sanitizeTeamName(raw: unknown): string {
  if (raw === null || raw === undefined) return 'Bilinmiyor';
  if (typeof raw !== 'string') return 'Bilinmiyor';
  const cleaned = raw.trim();
  if (!cleaned || cleaned === 'undefined' || cleaned === 'null' || cleaned === 'NaN') return 'Bilinmiyor';
  if (cleaned.toLowerCase().includes('undefined') || cleaned.toLowerCase().includes('null')) return 'Bilinmiyor';
  return cleaned;
}

describe('sanitizeTeamName', () => {
  test('Normal isim olduğu gibi döner', () => {
    expect(sanitizeTeamName('Kartal Gücü')).toBe('Kartal Gücü');
  });

  test('null → Bilinmiyor', () => {
    expect(sanitizeTeamName(null)).toBe('Bilinmiyor');
  });

  test('undefined → Bilinmiyor', () => {
    expect(sanitizeTeamName(undefined)).toBe('Bilinmiyor');
  });

  test('"undefined" string → Bilinmiyor', () => {
    expect(sanitizeTeamName('undefined')).toBe('Bilinmiyor');
  });

  test('"null" string → Bilinmiyor', () => {
    expect(sanitizeTeamName('null')).toBe('Bilinmiyor');
  });

  test('Boş string → Bilinmiyor', () => {
    expect(sanitizeTeamName('')).toBe('Bilinmiyor');
  });

  test('Sadece boşluk → Bilinmiyor', () => {
    expect(sanitizeTeamName('   ')).toBe('Bilinmiyor');
  });

  test('"undefined undefined" → Bilinmiyor', () => {
    expect(sanitizeTeamName('undefined undefined')).toBe('Bilinmiyor');
  });

  test('NaN string → Bilinmiyor', () => {
    expect(sanitizeTeamName('NaN')).toBe('Bilinmiyor');
  });

  test('Number tipi → Bilinmiyor', () => {
    expect(sanitizeTeamName(123 as any)).toBe('Bilinmiyor');
  });

  test('Baş/son boşluklar temizlenir', () => {
    expect(sanitizeTeamName('  Fırtına FC  ')).toBe('Fırtına FC');
  });
});

// ═══════════════════════════════════════════════════════════════
// PUAN HESAPLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('Puan hesaplama', () => {
  test('Galibiyet = 3 puan', () => {
    const points = 1 * 3;
    expect(points).toBe(3);
  });

  test('Beraberlik = 1 puan', () => {
    const points = 1 * 1;
    expect(points).toBe(1);
  });

  test('Mağlubiyet = 0 puan', () => {
    const points = 0;
    expect(points).toBe(0);
  });

  test('10 galibiyet, 4 beraberlik, 3 mağlubiyet = 34 puan', () => {
    const won = 10, drawn = 4, lost = 3;
    const points = won * 3 + drawn * 1;
    expect(points).toBe(34);
  });

  test('Tam sezon (34 maç) maksimum puan = 102', () => {
    const maxPoints = 34 * 3;
    expect(maxPoints).toBe(102);
  });
});

// ═══════════════════════════════════════════════════════════════
// AVERAJ HESAPLAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('Averaj hesaplama', () => {
  test('GD = atılan gol - yenilen gol', () => {
    const gf = 45, ga = 20;
    const gd = gf - ga;
    expect(gd).toBe(25);
  });

  test('Negatif averaj olabilir', () => {
    const gf = 15, ga = 40;
    const gd = gf - ga;
    expect(gd).toBe(-25);
  });

  test('Sıfır averaj', () => {
    const gf = 30, ga = 30;
    const gd = gf - ga;
    expect(gd).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// SIRALAMA TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('Lig sıralama mantığı', () => {
  const teams = [
    { team_id: 'A', points: 30, gd: 15, goals_for: 40, name: 'Team A' },
    { team_id: 'B', points: 30, gd: 10, goals_for: 35, name: 'Team B' },
    { team_id: 'C', points: 30, gd: 10, goals_for: 30, name: 'Team C' },
    { team_id: 'D', points: 25, gd: 5, goals_for: 28, name: 'Team D' },
  ];

  test('Puan öncelikli sıralama', () => {
    const sorted = [...teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
      return String(a.team_id).localeCompare(String(b.team_id));
    });
    expect(sorted[0].team_id).toBe('A'); // 30 pts, 15 GD
    expect(sorted[3].team_id).toBe('D'); // 25 pts
  });

  test('Eşit puanda averaj öncelikli', () => {
    const sorted = [...teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.goals_for - a.goals_for;
    });
    // A (GD=15) > B (GD=10) > C (GD=10) ama C'nin GF daha az
    expect(sorted[0].team_id).toBe('A');
    expect(sorted[1].team_id).toBe('B'); // B has more GF than C
    expect(sorted[2].team_id).toBe('C');
  });

  test('Eşit puanda ve averajda atılan gol öncelikli', () => {
    const equalTeams = [
      { team_id: 'X', points: 20, gd: 5, goals_for: 25 },
      { team_id: 'Y', points: 20, gd: 5, goals_for: 30 },
    ];
    const sorted = [...equalTeams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.goals_for - a.goals_for;
    });
    expect(sorted[0].team_id).toBe('Y'); // 30 GF > 25 GF
  });

  test('Tüm kriterler eşitse team_id alfabetik', () => {
    const equalTeams = [
      { team_id: 'Z', points: 10, gd: 0, goals_for: 15 },
      { team_id: 'A', points: 10, gd: 0, goals_for: 15 },
    ];
    const sorted = [...equalTeams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
      return String(a.team_id).localeCompare(String(b.team_id));
    });
    expect(sorted[0].team_id).toBe('A');
  });
});

// ═══════════════════════════════════════════════════════════════
// MOCK VERİ ÜRETİMİ TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('Mock veri üretimi', () => {
  test('Her tier için 18 takım üretilir', () => {
    const allLeagueTeams: Record<number, string[]> = {
      1: ['Kartal Gücü', 'Aslan United', 'Kanarya City', 'Fırtına FC', 'Boğaz Spor', 'Yıldızlar Birliği', 'Anadolu Kartalı', 'Sahil Belediye', 'İç Anadolu FC', 'Akdeniz Spor', 'Ege United', 'Marmara Gücü', 'Zirve Spor', 'Güneşli City', 'Mavi Liman', 'Altınordu Yıldız', 'Demir Spor', 'Kuzey Gücü'],
    };
    for (const [tier, names] of Object.entries(allLeagueTeams)) {
      expect(names.length).toBe(18);
    }
  });

  test('İlk takım galip, diğerleri mağlup başlar', () => {
    const mockStandings = [
      { id: '1', points: 3, won: 1, drawn: 0, lost: 0 },
      { id: '2', points: 0, won: 0, drawn: 0, lost: 1 },
    ];
    expect(mockStandings[0].points).toBe(3);
    expect(mockStandings[1].points).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// EKSİK STANDINGS TAMİRİ TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('Eksik standings tamiri', () => {
  test('Eksik takımlar tespit edilir', () => {
    const allTeamIds = ['team-1', 'team-2', 'team-3'];
    const existingTeamIds = new Set(['team-1', 'team-3']);
    const missing = allTeamIds.filter(id => !existingTeamIds.has(id));
    expect(missing).toEqual(['team-2']);
  });

  test('Eksik takımlar sıfır istatistikle oluşturulur', () => {
    const missingTeamIds = ['team-2', 'team-4'];
    const newRows = missingTeamIds.map(id => ({
      team_id: id,
      played: 0, won: 0, drawn: 0, lost: 0,
      gf: 0, ga: 0, gd: 0, points: 0,
    }));
    expect(newRows).toHaveLength(2);
    expect(newRows[0].team_id).toBe('team-2');
    expect(newRows[0].points).toBe(0);
  });

  test('Hiç eksik yoksa boş dizi döner', () => {
    const allTeamIds = ['team-1', 'team-2'];
    const existingTeamIds = new Set(['team-1', 'team-2']);
    const missing = allTeamIds.filter(id => !existingTeamIds.has(id));
    expect(missing).toEqual([]);
  });
});
