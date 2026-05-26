import { isMatchDay } from './schedule';

// ═══════════════════════════════════════════════════
//  LİG PUAN TABLOSU GÜNCELLEME (Client-side MatchDay için)
//  Sistem A (kullanıcının oynadığı maç) puan durumunu günceller.
//  Sistem B (cron match-simulator) ile aynı mantığı kullanır,
//  ancak satır yoksa oluşturur (upsert) ve fikstürü de tamamlanmış
//  olarak işaretler.
// ═══════════════════════════════════════════════════

/**
 * Client-side MatchDay maçından sonra league_standings tablosunu günceller.
 *
 * Mantık:
 * 1. Kullanıcının league_teams kaydından team_id ve league_id bul
 * 2. Aktif sezonu bul
 * 3. Kullanıcın bir sonraki programlanmış fikstürünü bul → rakip takım ID'sini al
 * 4. Ev sahibi ve deplasman için standings satırlarını güncelle veya oluştur
 * 5. Fikstürü completed olarak işaretle
 *
 * @param supabase Supabase client
 * @param profileId Kullanıcının profile ID'si
 * @param userScore Kullanıcının attığı gol (MatchDay'de homeScore)
 * @param opponentScore Rakibin attığı gol (MatchDay'de awayScore)
 * @returns Başarı durumu ve hata mesajı
 */
export async function updateLeagueStandingsAfterClientMatch(
  supabase: any,
  profileId: string,
  userScore: number,
  opponentScore: number
): Promise<{ success: boolean; error?: string; fixtureUpdated?: boolean }> {
  try {
    // ── 1. Kullanıcının league_teams kaydını bul ──
    const { data: userTeam, error: userTeamErr } = await supabase
      .from('league_teams')
      .select('id, name, league_id')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (userTeamErr || !userTeam) {
      console.warn('[updateLeagueStandingsAfterClientMatch] User team not found in league_teams:', userTeamErr?.message);
      return { success: false, error: 'Kullanıcının lig takımı bulunamadı' };
    }

    // ── 2. Aktif sezonu bul ──
    const { data: currentSeason, error: seasonErr } = await supabase
      .from('seasons')
      .select('id')
      .eq('league_id', userTeam.league_id)
      .eq('is_finished', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (seasonErr || !currentSeason) {
      console.warn('[updateLeagueStandingsAfterClientMatch] No active season found:', seasonErr?.message);
      return { success: false, error: 'Aktif sezon bulunamadı' };
    }

    const seasonId = currentSeason.id;

    // ── 3. Kullanıcının bir sonraki programlanmış fikstürünü bul ──
    const { data: nextFixture, error: fixtureErr } = await supabase
      .from('fixtures')
      .select('id, home_team_id, away_team_id, tur, season_id')
      .eq('status', 'scheduled')
      .eq('season_id', seasonId)
      .or(`home_team_id.eq.${userTeam.id},away_team_id.eq.${userTeam.id}`)
      .order('match_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fixtureErr) {
      console.warn('[updateLeagueStandingsAfterClientMatch] Fixture query error:', fixtureErr.message);
      return { success: false, error: 'Fikstür sorgulama hatası' };
    }

    // Fikstür yoksa sadece kullanıcının standings'ini güncelle (rakip belli değilse)
    let homeTeamId: string = userTeam.id;
    let awayTeamId: string | null = null;
    let fixtureUpdated = false;

    if (nextFixture) {
      // Fikstürde kullanıcı ev sahibi mi deplasman mı?
      const isUserHome = nextFixture.home_team_id === userTeam.id;
      homeTeamId = nextFixture.home_team_id;
      awayTeamId = nextFixture.away_team_id;

      // Skoru fikstüre göre eşleştir
      // MatchDay'de kullanıcı her zaman "home" olarak oynar,
      // ama gerçek fikstürde deplasmanda olabilir
      const fixtureHomeScore = isUserHome ? userScore : opponentScore;
      const fixtureAwayScore = isUserHome ? opponentScore : userScore;

      // ── 3a. Fikstürü completed olarak güncelle ──
      const { error: fixUpdateErr } = await supabase
        .from('fixtures')
        .update({
          status: 'completed',
          home_score: fixtureHomeScore,
          away_score: fixtureAwayScore,
        })
        .eq('id', nextFixture.id);

      if (fixUpdateErr) {
        console.warn('[updateLeagueStandingsAfterClientMatch] Fixture update failed:', fixUpdateErr.message);
      } else {
        fixtureUpdated = true;
        console.log(`[updateLeagueStandingsAfterClientMatch] Fixture ${nextFixture.id} completed: ${fixtureHomeScore}-${fixtureAwayScore}`);
      }

      // ── 4. Her iki takım için standings güncelle ──
      await upsertStanding(supabase, seasonId, userTeam.league_id, homeTeamId, fixtureHomeScore, fixtureAwayScore);
      if (awayTeamId) {
        await upsertStanding(supabase, seasonId, userTeam.league_id, awayTeamId, fixtureAwayScore, fixtureHomeScore);
      }
    } else {
      // Fikstür bulunamadı — sadece kullanıcının standings'ini güncelle
      console.log('[updateLeagueStandingsAfterClientMatch] No scheduled fixture found, updating user standings only');
      await upsertStanding(supabase, seasonId, userTeam.league_id, userTeam.id, userScore, opponentScore);
    }

    console.log(`[updateLeagueStandingsAfterClientMatch] Standings updated: user=${userTeam.name} (${userScore}-${opponentScore})`);
    return { success: true, fixtureUpdated };
  } catch (err) {
    console.error('[updateLeagueStandingsAfterClientMatch] Error:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Bir takımın league_standings satırını günceller veya yoksa oluşturur.
 * Cron'daki updateLeagueStandings ile aynı hesaplama mantığı.
 */
async function upsertStanding(
  supabase: any,
  seasonId: string,
  leagueId: string,
  teamId: string,
  goalsFor: number,
  goalsAgainst: number
): Promise<void> {
  // Mevcut standing satırını bul
  const { data: existing, error: selectErr } = await supabase
    .from('league_standings')
    .select('*')
    .eq('team_id', teamId)
    .eq('season_id', seasonId)
    .maybeSingle();

  if (selectErr) {
    console.warn('[upsertStanding] Select error:', selectErr.message);
  }

  const isWin = goalsFor > goalsAgainst;
  const isDraw = goalsFor === goalsAgainst;
  const isLoss = goalsFor < goalsAgainst;
  const pointsGained = isWin ? 3 : isDraw ? 1 : 0;

  if (existing) {
    // Mevcut satırı güncelle
    const updated = {
      played: (existing.played || 0) + 1,
      won: (existing.won || 0) + (isWin ? 1 : 0),
      drawn: (existing.drawn || 0) + (isDraw ? 1 : 0),
      lost: (existing.lost || 0) + (isLoss ? 1 : 0),
      gf: (existing.gf || 0) + goalsFor,
      ga: (existing.ga || 0) + goalsAgainst,
      gd: ((existing.gf || 0) + goalsFor) - ((existing.ga || 0) + goalsAgainst),
      points: (existing.points || 0) + pointsGained,
    };
    const { error: updateErr } = await supabase
      .from('league_standings')
      .update(updated)
      .eq('id', existing.id);

    if (updateErr) {
      console.error(`[upsertStanding] Update failed for team ${teamId}:`, updateErr.message);
    }
  } else {
    // Satır yoksa oluştur
    const newRow = {
      season_id: seasonId,
      league_id: leagueId,
      team_id: teamId,
      played: 1,
      won: isWin ? 1 : 0,
      drawn: isDraw ? 1 : 0,
      lost: isLoss ? 1 : 0,
      gf: goalsFor,
      ga: goalsAgainst,
      gd: goalsFor - goalsAgainst,
      points: pointsGained,
    };
    const { error: insertErr } = await supabase
      .from('league_standings')
      .insert(newRow);

    if (insertErr) {
      console.error(`[upsertStanding] Insert failed for team ${teamId}:`, insertErr.message);
    }
  }
}

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
