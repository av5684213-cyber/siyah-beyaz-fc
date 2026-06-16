/**
 * generate-fixtures-and-simulate.ts
 *
 * Tüm aktif sezonlar için:
 * 1. Fikstür üret (dünden başlayan tarihlerle)
 * 2. Geçmiş maçları simüle et
 * 3. Puan durumlarını güncelle
 * 4. league_teams istatistiklerini güncelle
 *
 * Çalıştırma: npx tsx scripts/generate-fixtures-and-simulate.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ortam değişkenleri gerekli!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ═══════════════════════════════════════════════════
// Yardımcı fonksiyonlar
// ═══════════════════════════════════════════════════

function simulateScore(homeStrength: number, awayStrength: number): { home: number; away: number } {
  const homeAdvantage = 1.15;
  const homeExpected = (homeStrength / 80) * homeAdvantage * 1.3;
  const awayExpected = (awayStrength / 80) * 1.0;

  const home = Math.min(7, Math.round(homeExpected + (Math.random() - 0.5) * 2));
  const away = Math.min(7, Math.round(awayExpected + (Math.random() - 0.5) * 2));

  return { home: Math.max(0, home), away: Math.max(0, away) };
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════
// ANA İŞLEM
// ═══════════════════════════════════════════════════

async function main() {
  const today = new Date().toISOString().split('T')[0]; // 2026-06-16
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]; // 2026-06-15

  console.log(`📅 Bugün: ${today}`);
  console.log(`📅 Dün: ${yesterday}`);
  console.log('');

  // ── 1. Aktif sezonları al ──
  const { data: activeSeasons, error: seasonErr } = await supabase
    .from('seasons')
    .select('id, league_id, year, start_date, is_finished')
    .eq('is_finished', false);

  if (seasonErr || !activeSeasons || activeSeasons.length === 0) {
    console.error('❌ Aktif sezon bulunamadı!', seasonErr?.message);
    process.exit(1);
  }

  console.log(`📊 ${activeSeasons.length} aktif sezon bulundu`);

  // Lig bilgilerini al
  const { data: leagues } = await supabase.from('leagues').select('id, name, tier');
  const leagueMap = new Map((leagues || []).map(l => [l.id, l]));

  for (const season of activeSeasons) {
    const league = leagueMap.get(season.league_id);
    const leagueName = league?.name || 'Bilinmeyen Lig';
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🏆 ${leagueName} (Sezon ${season.year})`);
    console.log(`${'='.repeat(60)}`);

    // ── 2. Fikstür var mı kontrol et ──
    const { count: existingFixtures } = await supabase
      .from('fixtures')
      .select('id', { count: 'exact', head: true })
      .eq('season_id', season.id);

    if (existingFixtures && existingFixtures > 0) {
      console.log(`  ℹ️  Bu sezon zaten ${existingFixtures} fikstür var, atlanıyor`);
      continue;
    }

    // ── 3. Fikstür üret (RPC ile) ──
    console.log(`  📋 Fikstür üretiliyor...`);

    const { error: rpcErr } = await supabase.rpc('generate_league_fixtures', {
      p_season_id: season.id,
    });

    if (rpcErr) {
      console.error(`  ❌ RPC hatası: ${rpcErr.message}`);
      console.log(`  🔄 Manuel fikstür üretimi deneniyor...`);
      await generateFixturesManually(season.id, season.league_id, yesterday);
    } else {
      console.log(`  ✅ RPC ile fikstür üretildi`);

      // ── 4. Fikstür tarihlerini düne kaydır ──
      // RPC CURRENT_DATE + 1'den başlıyor (yarın), biz dünden başlatmak istiyoruz
      // Fark: 2 gün geriye kaydır
      await shiftFixtureDates(season.id, 2);
    }

    // ── 5. Geçmiş maçları simüle et ──
    await simulatePastMatches(season.id, today, leagueName);

    // API rate limiting için bekle
    await sleep(500);
  }

  // ── 6. season start_date güncelle ──
  console.log(`\n${'='.repeat(60)}`);
  console.log('📅 Sezon start_date\'leri güncelleniyor...');
  for (const season of activeSeasons) {
    await supabase
      .from('seasons')
      .update({ start_date: yesterday })
      .eq('id', season.id);
  }
  console.log('✅ Tüm sezon start_date\'leri güncellendi');

  console.log('\n🎉 Tamamlandı!');
}

// ═══════════════════════════════════════════════════
// Manuel fikstür üretimi (RPC fallback)
// ═══════════════════════════════════════════════════

async function generateFixturesManually(
  seasonId: string,
  leagueId: string,
  startDate: string
): Promise<void> {
  // Takımları al
  const { data: teams } = await supabase
    .from('league_teams')
    .select('id, name')
    .eq('league_id', leagueId)
    .order('name');

  if (!teams || teams.length < 2) {
    console.error(`  ❌ Yeterli takım yok (${teams?.length || 0})`);
    return;
  }

  const teamIds = teams.map(t => t.id);
  const n = teamIds.length;

  // Round-robin algoritması
  const isEven = n % 2 === 0;
  const teamList = isEven ? [...teamIds] : [...teamIds, '00000000-0000-0000-0000-000000000000'];
  const totalTeams = teamList.length;
  const totalRounds = totalTeams - 1;
  const halfSize = totalTeams / 2;
  const fixed = teamList[0];
  const rotating = teamList.slice(1);

  let matchDate = new Date(startDate + 'T00:00:00Z');
  const fixtureRows: any[] = [];

  // ─── Yardımcı: İş günü hesaplama (Pzt-Per, hafta sonu atla) ───
  // Her tur 1 iş günü = 34 tur ~ 7 hafta (1-2 ayda bir sezon)
  const nextBusinessDay = (d: Date): Date => {
    const r = new Date(d);
    // JS: 0=Paz, 1=Pzt, ..., 5=Cmt, 6=Paz
    // İş günleri: Pzt(1)-Per(4)
    while (r.getDay() === 0 || r.getDay() >= 5) {
      r.setDate(r.getDate() + 1);
    }
    return r;
  };
  const addBusinessDays = (d: Date, n: number): Date => {
    const r = new Date(d);
    let added = 0;
    while (added < n) {
      r.setDate(r.getDate() + 1);
      if (r.getDay() >= 1 && r.getDay() <= 4) added++;
    }
    return r;
  };

  // İlk maç günü = startDate'in ilk iş günü (Pzt-Per)
  const firstMatchDay = nextBusinessDay(matchDate);

  for (let round = 0; round < totalRounds; round++) {
    // Bu turun tarihi: ilk maç günü + round iş günü
    const roundDate = addBusinessDays(firstMatchDay, round);
    const roundTeams = [fixed, ...rotating];
    let matchCount = 0;

    for (let i = 0; i < halfSize; i++) {
      const homeId = roundTeams[i];
      const awayId = roundTeams[totalTeams - 1 - i];

      if (
        homeId === '00000000-0000-0000-0000-000000000000' ||
        awayId === '00000000-0000-0000-0000-000000000000'
      ) {
        continue;
      }

      const matchTime = matchCount % 2 === 0 ? '12:00' : '18:00';
      const reverseMatchTime = matchCount % 2 === 0 ? '18:00' : '12:00';

      // İlk yarı
      fixtureRows.push({
        id: crypto.randomUUID(),
        home_team_id: homeId,
        away_team_id: awayId,
        season_id: seasonId,
        tur: round + 1,
        match_date: roundDate.toISOString().split('T')[0],
        match_time: matchTime,
        status: 'scheduled',
        competition_type: 'league',
        home_score: 0,
        away_score: 0,
      });

      // Rövanş (ikinci yarı) — totalRounds iş günü sonra
      const reverseDate = addBusinessDays(roundDate, totalRounds);
      fixtureRows.push({
        id: crypto.randomUUID(),
        home_team_id: awayId,
        away_team_id: homeId,
        season_id: seasonId,
        tur: round + 1 + totalRounds,
        match_date: reverseDate.toISOString().split('T')[0],
        match_time: reverseMatchTime,
        status: 'scheduled',
        competition_type: 'league',
        home_score: 0,
        away_score: 0,
      });

      matchCount++;
    }

    // Rotating dizisini döndür
    rotating.push(rotating.shift()!);
    // NOT: matchDate'i +7 gün eklemek yerine addBusinessDays kullanıyoruz
    // (round değişkeni zaten iş günü offset'i hesaplıyor)
  }

  // Toplu ekleme (50'şerli batch)
  for (let i = 0; i < fixtureRows.length; i += 50) {
    const batch = fixtureRows.slice(i, i + 50);
    const { error } = await supabase.from('fixtures').insert(batch);
    if (error) {
      console.error(`  ❌ Fikstür ekleme hatası (batch ${i}):`, error.message);
    }
  }

  console.log(`  ✅ ${fixtureRows.length} fikstür manuel olarak eklendi`);
}

// ═══════════════════════════════════════════════════
// Fikstür tarihlerini kaydır
// ═══════════════════════════════════════════════════

async function shiftFixtureDates(seasonId: string, daysBack: number): Promise<void> {
  // Tüm fikstürleri al
  const { data: fixtures } = await supabase
    .from('fixtures')
    .select('id, match_date')
    .eq('season_id', seasonId);

  if (!fixtures || fixtures.length === 0) return;

  let shifted = 0;
  for (const fixture of fixtures) {
    const currentDate = new Date(fixture.match_date + 'T00:00:00Z');
    currentDate.setDate(currentDate.getDate() - daysBack);
    const newDate = currentDate.toISOString().split('T')[0];

    const { error } = await supabase
      .from('fixtures')
      .update({ match_date: newDate })
      .eq('id', fixture.id);

    if (!error) shifted++;
  }

  console.log(`  📅 ${shifted} fikstür tarihi ${daysBack} gün geriye kaydırıldı`);
}

// ═══════════════════════════════════════════════════
// Geçmiş maçları simüle et
// ═══════════════════════════════════════════════════

async function simulatePastMatches(
  seasonId: string,
  today: string,
  leagueName: string
): Promise<void> {
  // Geçmiş tarihli scheduled maçları al
  const { data: pastFixtures, error: fixErr } = await supabase
    .from('fixtures')
    .select('id, home_team_id, away_team_id, tur, match_date, match_time')
    .eq('season_id', seasonId)
    .eq('status', 'scheduled')
    .lt('match_date', today) // Bugünden önceki maçlar
    .order('match_date', { ascending: true });

  if (fixErr || !pastFixtures || pastFixtures.length === 0) {
    console.log(`  ℹ️  Simüle edilecek geçmiş maç yok`);
    return;
  }

  console.log(`  ⚽ ${pastFixtures.length} geçmiş maç simüle ediliyor...`);

  // Takım güçlerini al
  const teamStrengths = new Map<string, number>();
  const { data: allTeams } = await supabase
    .from('league_teams')
    .select('id, strength');

  for (const team of allTeams || []) {
    teamStrengths.set(team.id, team.strength || 50);
  }

  // standings'leri al (güncelleme için)
  const { data: standings } = await supabase
    .from('league_standings')
    .select('*')
    .eq('season_id', seasonId);

  const standingsMap = new Map(
    (standings || []).map(s => [s.team_id, s])
  );

  let simulated = 0;
  let errors = 0;

  for (const fixture of pastFixtures) {
    try {
      const homeStrength = teamStrengths.get(fixture.home_team_id) || 50;
      const awayStrength = teamStrengths.get(fixture.away_team_id) || 50;
      const score = simulateScore(homeStrength, awayStrength);

      // Fikstürü güncelle
      const { error: updateErr } = await supabase
        .from('fixtures')
        .update({
          status: 'completed',
          home_score: score.home,
          away_score: score.away,
        })
        .eq('id', fixture.id);

      if (updateErr) {
        errors++;
        continue;
      }

      // Standings güncelle
      await updateStandings(standingsMap, fixture.home_team_id, score.home, score.away, seasonId);
      await updateStandings(standingsMap, fixture.away_team_id, score.away, score.home, seasonId);

      // league_teams güncelle
      await updateLeagueTeam(fixture.home_team_id, score.home, score.away);
      await updateLeagueTeam(fixture.away_team_id, score.away, score.home);

      simulated++;

      if (simulated % 50 === 0) {
        console.log(`    ... ${simulated}/${pastFixtures.length} maç simüle edildi`);
        await sleep(200); // Rate limiting
      }
    } catch (err) {
      errors++;
    }
  }

  console.log(`  ✅ ${simulated} maç simüle edildi${errors > 0 ? ` (${errors} hata)` : ''}`);
}

// ═══════════════════════════════════════════════════
// Standings güncelle
// ═══════════════════════════════════════════════════

async function updateStandings(
  standingsMap: Map<string, any>,
  teamId: string,
  goalsFor: number,
  goalsAgainst: number,
  seasonId: string
): Promise<void> {
  const existing = standingsMap.get(teamId);

  const isWin = goalsFor > goalsAgainst;
  const isDraw = goalsFor === goalsAgainst;
  const pointsGained = isWin ? 3 : isDraw ? 1 : 0;

  if (existing) {
    const updated = {
      played: (existing.played || 0) + 1,
      won: (existing.won || 0) + (isWin ? 1 : 0),
      drawn: (existing.drawn || 0) + (isDraw ? 1 : 0),
      lost: (existing.lost || 0) + (!isWin && !isDraw ? 1 : 0),
      gf: (existing.gf || 0) + goalsFor,
      ga: (existing.ga || 0) + goalsAgainst,
      gd: ((existing.gf || 0) + goalsFor) - ((existing.ga || 0) + goalsAgainst),
      points: (existing.points || 0) + pointsGained,
    };

    await supabase.from('league_standings').update(updated).eq('id', existing.id);

    // Map'i de güncelle (sonraki maçlar için)
    existing.played = updated.played;
    existing.won = updated.won;
    existing.drawn = updated.drawn;
    existing.lost = updated.lost;
    existing.gf = updated.gf;
    existing.ga = updated.ga;
    existing.points = updated.points;
  } else {
    // Satır yoksa oluştur
    const newRow = {
      season_id: seasonId,
      team_id: teamId,
      league_id: null, // sezon üzerinden çözülecek
      played: 1,
      won: isWin ? 1 : 0,
      drawn: isDraw ? 1 : 0,
      lost: (!isWin && !isDraw) ? 1 : 0,
      gf: goalsFor,
      ga: goalsAgainst,
      gd: goalsFor - goalsAgainst,
      points: pointsGained,
    };

    const { data: inserted } = await supabase
      .from('league_standings')
      .insert(newRow)
      .select()
      .single();

    if (inserted) {
      standingsMap.set(teamId, inserted);
    }
  }
}

// ═══════════════════════════════════════════════════
// league_teams güncelle
// ═══════════════════════════════════════════════════

const leagueTeamsCache = new Map<string, any>();

async function updateLeagueTeam(
  teamId: string,
  goalsFor: number,
  goalsAgainst: number
): Promise<void> {
  let team = leagueTeamsCache.get(teamId);

  if (!team) {
    const { data } = await supabase
      .from('league_teams')
      .select('id, played, won, drawn, lost, gf, ga, points')
      .eq('id', teamId)
      .single();

    if (!data) return;
    team = data;
    leagueTeamsCache.set(teamId, { ...team });
  }

  const isWin = goalsFor > goalsAgainst;
  const isDraw = goalsFor === goalsAgainst;
  const pointsGained = isWin ? 3 : isDraw ? 1 : 0;

  const updated = {
    played: (team.played || 0) + 1,
    won: (team.won || 0) + (isWin ? 1 : 0),
    drawn: (team.drawn || 0) + (isDraw ? 1 : 0),
    lost: (team.lost || 0) + (!isWin && !isDraw ? 1 : 0),
    gf: (team.gf || 0) + goalsFor,
    ga: (team.ga || 0) + goalsAgainst,
    points: (team.points || 0) + pointsGained,
  };

  await supabase.from('league_teams').update(updated).eq('id', teamId);

  // Cache'i güncelle
  Object.assign(team, updated);
}

// ═══════════════════════════════════════════════════
// BAŞLAT
// ═══════════════════════════════════════════════════

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
