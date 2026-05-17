import { isMatchDay } from './schedule';

// ═══════════════════════════════════════════════════
//  LİG FİKSÜR ÜRETİCİ
//  Sezon başlangıcı: Yarın sabah 12:00
//  İlk maç saati: 12:00 (varsayılan)
// ═══════════════════════════════════════════════════

/**
 * Yarının tarihini hesaplar (saat 12:00)
 */
export function getTomorrowNoon(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  return tomorrow;
}

/**
 * Round-robin fikstür üretici
 * @param teams Takım isimleri dizisi (18 takım)
 * @param startDate Başlangıç tarihi (varsayılan: yarın 12:00)
 * @returns Her hafta için maç listesi
 */
export function generateRoundRobin(teams: string[], startDate?: Date): { week: number; matches: { home: string; away: string }[] }[] {
  const n = teams.length;
  if (n < 2) return [];

  // Takım sayısı tekse "bye" ekle
  const teamList = [...teams];
  if (teamList.length % 2 !== 0) {
    teamList.push('BYE');
  }

  const totalRounds = teamList.length - 1;
  const halfSize = teamList.length / 2;
  const fixed = teamList[0];
  const rotating = teamList.slice(1);

  const weeks: { week: number; matches: { home: string; away: string }[] }[] = [];

  for (let round = 0; round < totalRounds; round++) {
    const roundTeams = [fixed, ...rotating];
    const matches: { home: string; away: string }[] = [];

    for (let i = 0; i < halfSize; i++) {
      const home = roundTeams[i];
      const away = roundTeams[roundTeams.length - 1 - i];
      if (home !== 'BYE' && away !== 'BYE') {
        matches.push({ home, away });
      }
    }

    weeks.push({ week: round + 1, matches });

    // Rotating dizisini döndür
    rotating.push(rotating.shift()!);
  }

  // İkinci yarışma (deplasmanlı) — home/away ters çevrilir
  const reverseWeeks = weeks.map(w => ({
    week: w.week + totalRounds,
    matches: w.matches.map(m => ({ home: m.away, away: m.home }))
  }));

  return [...weeks, ...reverseWeeks];
}

/**
 * Eski imza uyumlu sezon fikstür üretici
 * Round-robin yerine basit iteratif yaklaşım (gerçek DB RPC kullanıldığında override edilir)
 */
export const generateSeasonFixtures = (league: any, userTeamId: string, seasonId: string, startDate: Date) => {
  try {
    const fixtures: any[] = [];
    let week = 1;
    let currentDate = new Date(startDate || getTomorrowNoon());

    // Takım listesi yoksa varsayılan isimler kullan
    const teamNames = league?.teams || [
      'Anadolu Gücü', 'Demir Fırtına', 'Altın Ayak', 'Şimşek Gücü',
      'Bozkurt FK', 'Güneş Kulesi', 'Fırtına Kuşu', 'Siyah Şimşek',
      'Yıldırım Ordu', 'Spor 1923', 'Çelik Fabrikası', 'Mavi Cephane',
      'Sahil Güvenliği', 'Ateş Çemberi', 'Volkan Spor', 'Buz Kılıcı',
      'Kartal Yuvası', 'Aslan Yüreği'
    ];

    // Round-robin üret
    const rr = generateRoundRobin(teamNames, currentDate);

    // Her hafta için 2 maç günü ata (Pazartesi 12:00, Çarşamba 18:00 gibi)
    for (const weekData of rr) {
      if (week > 34) break; // 34 hafta limit

      const matchDate1 = new Date(currentDate.getTime());
      matchDate1.setHours(12, 0, 0, 0);

      const matchDate2 = new Date(currentDate.getTime());
      matchDate2.setDate(matchDate2.getDate() + 2);
      matchDate2.setHours(18, 0, 0, 0);

      // Her maç gününe en fazla 1 maç ata
      let matchIndex = 0;
      for (const match of weekData.matches) {
        const isUserMatch = match.home === userTeamId || match.away === userTeamId;
        const matchDate = matchIndex % 2 === 0 ? matchDate1 : matchDate2;

        fixtures.push({
          id: `fix-${fixtures.length + 1}`,
          week,
          homeTeam: match.home,
          awayTeam: match.away,
          isFinished: false,
          isUserMatch,
          importance: isUserMatch ? 'high' : 'medium',
          stadium: 'Stadyum',
          date: matchDate
        });
        matchIndex++;
      }

      // Sonraki hafta Pazartesi
      currentDate.setDate(currentDate.getDate() + 7);
      week++;
    }

    return fixtures;
  } catch (err) {
    console.error('[generateSeasonFixtures] Error:', err);
    return [];
  }
};
