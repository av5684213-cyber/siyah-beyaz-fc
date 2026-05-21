/**
 * simulateSeason.ts
 * 
 * Botların bir sezonu nasıl oynadığını simüle eder.
 * Her maçta rastgele skorlar üretir, standings günceller.
 * 
 * Çalıştırma: npx tsx scripts/simulateSeason.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmxbyaamwbpnvgbnjbmo.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function simulateScore(homeStrength: number, awayStrength: number): { home: number; away: number } {
  // Strength affects goal probability
  const homeAdvantage = 1.15;
  const homeExpected = (homeStrength / 80) * homeAdvantage * 1.3;
  const awayExpected = (awayStrength / 80) * 1.0;

  const home = Math.min(7, Math.round(homeExpected + (Math.random() - 0.5) * 2));
  const away = Math.min(7, Math.round(awayExpected + (Math.random() - 0.5) * 2));

  return { home: Math.max(0, home), away: Math.max(0, away) };
}

async function simulateSeason() {
  console.log('⚽ Sezon simülasyonu başlatılıyor...\n');

  // 1. Get first league
  const { data: leagues } = await supabase.from('leagues').select('id, name, tier').order('tier').limit(1);
  if (!leagues || leagues.length === 0) {
    console.error('❌ Lig bulunamadı!');
    return;
  }
  const league = leagues[0];
  console.log(`📍 Lig: ${league.name} (Tier ${league.tier})`);

  // 2. Get or create season
  const { data: seasons } = await supabase.from('seasons').select('id').eq('league_id', league.id).order('created_at', { ascending: false }).limit(1);
  let seasonId: string;
  if (seasons && seasons.length > 0) {
    seasonId = seasons[0].id;
  } else {
    const { data: newSeason } = await supabase.from('seasons').insert({
      league_id: league.id,
      year: '2025/26',
      start_date: new Date().toISOString().split('T')[0],
      current_tur: 1,
    }).select().single();
    if (!newSeason) {
      console.error('❌ Sezon oluşturulamadı!');
      return;
    }
    seasonId = newSeason.id;
  }
  console.log(`📅 Sezon: ${seasonId}`);

  // 3. Get teams in league
  const { data: teams } = await supabase.from('league_teams').select('id, name, strength').eq('league_id', league.id);
  if (!teams || teams.length < 2) {
    console.error('❌ Yeterli takım yok!');
    return;
  }
  console.log(`👥 ${teams.length} takım bulundu\n`);

  // 4. Generate round-robin fixtures
  const fixtures: { home: any; away: any; week: number }[] = [];
  const teamList = [...teams];
  const n = teamList.length;

  // Round-robin algorithm
  for (let round = 0; round < n - 1; round++) {
    for (let match = 0; match < n / 2; match++) {
      const home = teamList[match];
      const away = teamList[n - 1 - match];
      fixtures.push({ home, away, week: round + 1 });
    }
    // Rotate teams (keep first fixed)
    const last = teamList.pop()!;
    teamList.splice(1, 0, last);
  }

  console.log(`📊 ${fixtures.length} maç simüle edilecek\n`);

  // 5. Reset standings
  await supabase.from('league_standings').delete().eq('season_id', seasonId);

  // Create initial standings rows
  const standingsRows = teams.map(t => ({
    season_id: seasonId,
    team_id: t.id,
    played: 0, won: 0, drawn: 0, lost: 0,
    gf: 0, ga: 0, gd: 0, points: 0,
  }));
  await supabase.from('league_standings').insert(standingsRows);

  // 6. Simulate all matches
  let matchCount = 0;
  for (const fixture of fixtures) {
    const homeStrength = fixture.home.strength || 50;
    const awayStrength = fixture.away.strength || 50;
    const score = simulateScore(homeStrength, awayStrength);

    // Update standings for home team
    const { data: homeStanding } = await supabase.from('league_standings')
      .select('*').eq('season_id', seasonId).eq('team_id', fixture.home.id).single();

    if (homeStanding) {
      const hPlayed = (homeStanding.played || 0) + 1;
      const hWon = (homeStanding.won || 0) + (score.home > score.away ? 1 : 0);
      const hDrawn = (homeStanding.drawn || 0) + (score.home === score.away ? 1 : 0);
      const hLost = (homeStanding.lost || 0) + (score.home < score.away ? 1 : 0);
      const hGf = (homeStanding.gf || 0) + score.home;
      const hGa = (homeStanding.ga || 0) + score.away;
      const hPoints = hWon * 3 + hDrawn;

      await supabase.from('league_standings').update({
        played: hPlayed, won: hWon, drawn: hDrawn, lost: hLost,
        gf: hGf, ga: hGa, gd: hGf - hGa, points: hPoints,
      }).eq('id', homeStanding.id);
    }

    // Update standings for away team
    const { data: awayStanding } = await supabase.from('league_standings')
      .select('*').eq('season_id', seasonId).eq('team_id', fixture.away.id).single();

    if (awayStanding) {
      const aPlayed = (awayStanding.played || 0) + 1;
      const aWon = (awayStanding.won || 0) + (score.away > score.home ? 1 : 0);
      const aDrawn = (awayStanding.drawn || 0) + (score.away === score.home ? 1 : 0);
      const aLost = (awayStanding.lost || 0) + (score.away < score.home ? 1 : 0);
      const aGf = (awayStanding.gf || 0) + score.away;
      const aGa = (awayStanding.ga || 0) + score.home;
      const aPoints = aWon * 3 + aDrawn;

      await supabase.from('league_standings').update({
        played: aPlayed, won: aWon, drawn: aDrawn, lost: aLost,
        gf: aGf, ga: aGa, gd: aGf - aGa, points: aPoints,
      }).eq('id', awayStanding.id);
    }

    matchCount++;
    if (matchCount % 20 === 0) {
      console.log(`  ${matchCount}/${fixtures.length} maç tamamlandı...`);
    }
  }

  // 7. Show final standings
  const { data: finalStandings } = await supabase.from('league_standings')
    .select('*, league_teams(name)').eq('season_id', seasonId)
    .order('points', { ascending: false }).order('gd', { ascending: false });

  console.log('\n🏆 FİNAL PUAN DURUMU:');
  console.log('─'.repeat(60));
  if (finalStandings) {
    finalStandings.forEach((s: any, idx: number) => {
      const name = s.league_teams?.name || '???';
      console.log(`${(idx + 1).toString().padStart(2)} | ${name.padEnd(20)} | ${s.played}O ${s.won}G ${s.drawn}B ${s.lost}M | ${s.gf}-${s.ga} | ${s.points}p`);
    });
  }

  console.log(`\n⚽ Simülasyon tamamlandı! ${matchCount} maç oynandı.`);
}

simulateSeason().catch(console.error);
