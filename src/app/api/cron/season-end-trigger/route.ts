import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyCronSecret, sanitizeError } from '@/lib/fm/security';

export const maxDuration = 300;

/**
 * Cron: Sezon sonu tetikleyicisi
 * Her Pazar gece çalışır. Tüm liglerde 34 hafta tamamlandıysa sezon sonunu işler.
 */
export async function GET(request: NextRequest) {
  const cronCheck = verifyCronSecret(request);
  if (!cronCheck.valid) {
    return NextResponse.json({ error: cronCheck.error }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'No Supabase client' }, { status: 500 });
  }

  try {
    // 1. Tüm liglerde sezon tamamlanma kontrolü
    const { data: leagueTeams, error: fetchError } = await supabase
      .from('league_teams')
      .select('league_name, played');

    if (fetchError) {
      console.error('[cron/season-end-trigger] Fetch error:', fetchError);
      return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }

    if (!leagueTeams || leagueTeams.length === 0) {
      return NextResponse.json({
        action: 'none',
        message: 'Lig takımı bulunamadı',
        timestamp: new Date().toISOString(),
      });
    }

    // Lig bazında grupla
    const leagueMap = new Map<string, { total: number; allPlayed: boolean }>();
    for (const team of leagueTeams) {
      const league = team.league_name || 'unknown';
      const played = team.played || 0;
      if (!leagueMap.has(league)) {
        leagueMap.set(league, { total: 0, allPlayed: true });
      }
      const entry = leagueMap.get(league)!;
      entry.total++;
      if (played < 34) {
        entry.allPlayed = false;
      }
    }

    const completedLeagues: string[] = [];
    const incompleteLeagues: string[] = [];

    for (const [league, data] of leagueMap) {
      if (data.allPlayed) {
        completedLeagues.push(league);
      } else {
        incompleteLeagues.push(league);
      }
    }

    if (completedLeagues.length === 0) {
      return NextResponse.json({
        action: 'none',
        message: 'Sezon henüz tamamlanmadı',
        incompleteLeagues,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Tamamlanan ligler için sezon sonu işlemleri
    const results: Record<string, unknown>[] = [];

    for (const leagueName of completedLeagues) {
      try {
        const leagueResult = await processLeagueSeasonEnd(supabase, leagueName);
        results.push(leagueResult);
      } catch (err) {
        console.error(`[cron/season-end-trigger] Error processing ${leagueName}:`, err);
        results.push({ league: leagueName, error: String(err) });
      }
    }

    // Logla
    await supabase.from('error_logs').insert({
      source: 'cron',
      level: 'info',
      message: `Sezon sonu: ${completedLeagues.length} lig işlendi`,
      context: { completedLeagues, results: results.length },
    });

    return NextResponse.json({
      action: 'season_end_processed',
      completedLeagues,
      incompleteLeagues,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[cron/season-end-trigger] Fatal error:', err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}

/**
 * Bir lig için sezon sonu işlemleri
 */
async function processLeagueSeasonEnd(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  leagueName: string
): Promise<Record<string, unknown>> {
  const seasonId = `S${new Date().getFullYear()}_auto`;

  // 1. Lig sıralamasını al
  const { data: standings } = await supabase
    .from('league_teams')
    .select('*')
    .eq('league_name', leagueName)
    .order('points', { ascending: false });

  if (!standings || standings.length === 0) {
    return { league: leagueName, status: 'no_teams' };
  }

  const champion = standings[0];
  const profileIds = standings.map((t: Record<string, unknown>) => t.profile_id).filter(Boolean) as string[];

  // 2. Ödülleri hesapla ve kaydet
  const awards: Record<string, unknown>[] = [];

  // Şampiyon ödülü
  const championAward = {
    id: `award_${seasonId}_${leagueName}_champion`,
    season_id: seasonId,
    profile_id: champion.profile_id as string,
    league_name: leagueName,
    award_type: 'champion',
    team_name: champion.name as string,
    stat_value: champion.points as number,
    stat_detail: {
      points: champion.points,
      won: champion.won,
      gf: champion.gf,
      ga: champion.ga,
    },
  };
  awards.push(championAward);

  // 3. Oyuncu bazlı ödüller
  const { data: players } = await supabase
    .from('players')
    .select('id, name, profile_id, team_name, position, rating, age, goals, assists, yellow_cards, red_cards, matches_played, clean_sheets, form_rating')
    .in('profile_id', profileIds);

  if (players && players.length > 0) {
    // Altın Krampon
    const topScorer = [...players].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      ((b.goals as number) || 0) - ((a.goals as number) || 0)
    )[0];
    if ((topScorer.goals as number) > 0) {
      awards.push({
        id: `award_${seasonId}_${leagueName}_golden_boot`,
        season_id: seasonId,
        profile_id: topScorer.profile_id,
        league_name: leagueName,
        award_type: 'golden_boot',
        player_id: topScorer.id,
        player_name: topScorer.name,
        team_name: topScorer.team_name,
        stat_value: topScorer.goals,
      });
    }

    // Asist Kralı
    const topAssister = [...players].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      ((b.assists as number) || 0) - ((a.assists as number) || 0)
    )[0];
    if ((topAssister.assists as number) > 0) {
      awards.push({
        id: `award_${seasonId}_${leagueName}_top_assists`,
        season_id: seasonId,
        profile_id: topAssister.profile_id,
        league_name: leagueName,
        award_type: 'top_assists',
        player_id: topAssister.id,
        player_name: topAssister.name,
        team_name: topAssister.team_name,
        stat_value: topAssister.assists,
      });
    }

    // MVP
    const mvp = [...players].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      ((b.form_rating as number) || 0) - ((a.form_rating as number) || 0)
    )[0];
    awards.push({
      id: `award_${seasonId}_${leagueName}_mvp`,
      season_id: seasonId,
      profile_id: mvp.profile_id,
      league_name: leagueName,
      award_type: 'mvp',
      player_id: mvp.id,
      player_name: mvp.name,
      team_name: mvp.team_name,
      stat_value: mvp.form_rating || 0,
    });

    // En İyi Kaleci
    const goalkeepers = players.filter((p: Record<string, unknown>) => p.position === 'GK');
    if (goalkeepers.length > 0) {
      const bestGk = [...goalkeepers].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        ((b.clean_sheets as number) || 0) - ((a.clean_sheets as number) || 0)
      )[0];
      awards.push({
        id: `award_${seasonId}_${leagueName}_best_gk`,
        season_id: seasonId,
        profile_id: bestGk.profile_id,
        league_name: leagueName,
        award_type: 'best_gk',
        player_id: bestGk.id,
        player_name: bestGk.name,
        team_name: bestGk.team_name,
        stat_value: bestGk.clean_sheets || 0,
      });
    }

    // En İyi Genç (U21)
    const youngPlayers = players.filter((p: Record<string, unknown>) => (p.age as number) <= 21);
    if (youngPlayers.length > 0) {
      const bestYoung = [...youngPlayers].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        ((b.form_rating as number) || 0) - ((a.form_rating as number) || 0)
      )[0];
      awards.push({
        id: `award_${seasonId}_${leagueName}_best_young`,
        season_id: seasonId,
        profile_id: bestYoung.profile_id,
        league_name: leagueName,
        award_type: 'best_young',
        player_id: bestYoung.id,
        player_name: bestYoung.name,
        team_name: bestYoung.team_name,
        stat_value: bestYoung.form_rating || 0,
      });
    }

    // Fair Play
    const fairPlay = [...players].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const scoreA = ((a.yellow_cards as number) || 0) + ((a.red_cards as number) || 0) * 3;
      const scoreB = ((b.yellow_cards as number) || 0) + ((b.red_cards as number) || 0) * 3;
      return scoreA - scoreB;
    })[0];
    if ((fairPlay.matches_played as number) >= 10) {
      awards.push({
        id: `award_${seasonId}_${leagueName}_fair_play`,
        season_id: seasonId,
        profile_id: fairPlay.profile_id,
        league_name: leagueName,
        award_type: 'fair_play',
        player_id: fairPlay.id,
        player_name: fairPlay.name,
        team_name: fairPlay.team_name,
        stat_value: ((fairPlay.yellow_cards as number) || 0) + ((fairPlay.red_cards as number) || 0) * 3,
      });
    }
  }

  // 4. Ödülleri kaydet
  for (const award of awards) {
    try {
      const { data: existing } = await supabase
        .from('season_awards')
        .select('id')
        .eq('id', award.id);
      if (!existing || existing.length === 0) {
        await supabase.from('season_awards').insert(award);
      }
    } catch (err) {
      console.error(`[season-end] Award insert error:`, err);
    }
  }

  // 5. Hall of Fame güncelle
  const goldenBoot = awards.find(a => a.award_type === 'golden_boot');
  const topAssistsAward = awards.find(a => a.award_type === 'top_assists');
  const mvpAward = awards.find(a => a.award_type === 'mvp');

  const hofEntry = {
    id: `hof_${seasonId}_${leagueName}`,
    season_id: seasonId,
    league_name: leagueName,
    champion_team: champion.name as string,
    champion_profile_id: champion.profile_id as string,
    golden_boot_player: (goldenBoot?.player_name as string) || '',
    golden_boot_goals: (goldenBoot?.stat_value as number) || 0,
    top_assists_player: (topAssistsAward?.player_name as string) || '',
    top_assists_value: (topAssistsAward?.stat_value as number) || 0,
    mvp_player: (mvpAward?.player_name as string) || '',
  };

  try {
    const { data: existingHof } = await supabase
      .from('hall_of_fame')
      .select('id')
      .eq('id', hofEntry.id);
    if (existingHof && existingHof.length > 0) {
      await supabase.from('hall_of_fame').update(hofEntry).eq('id', hofEntry.id);
    } else {
      await supabase.from('hall_of_fame').insert(hofEntry);
    }
  } catch (err) {
    console.error(`[season-end] HoF insert error:`, err);
  }

  // 6. Kiralamaları sonlandır (sezon sonu dönüşü)
  try {
    const { data: activeLoans } = await supabase
      .from('loans')
      .select('id, player_id')
      .eq('status', 'active');

    if (activeLoans && activeLoans.length > 0) {
      // loans tablosunu güncelle
      await supabase
        .from('loans')
        .update({ status: 'completed' })
        .eq('status', 'active');

      // Her kiralanan oyuncunun durumunu sıfırla
      for (const loan of activeLoans) {
        await supabase
          .from('players')
          .update({
            loan_status: null,
            loaned_to_profile_id: null,
            loan_end_date: null,
            is_on_loan_market: false,
          })
          .eq('id', loan.player_id);
      }
    }
  } catch (err) {
    console.error(`[season-end] Loan return error:`, err);
  }

  // 7. Süresi dolan sponsorlukları sonlandır
  try {
    await supabase
      .from('team_sponsorships')
      .update({ status: 'expired' })
      .lt('remaining_rounds', 1)
      .eq('status', 'active');
  } catch (err) {
    console.error(`[season-end] Sponsorship cleanup error:`, err);
  }

  // 8. Yeni sezon başlat
  // Lig puanlarını sıfırla
  for (const team of standings) {
    await supabase
      .from('league_teams')
      .update({
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        points: 0,
      })
      .eq('id', team.id as string);
  }

  // Oyuncu istatistiklerini sıfırla
  for (const pid of profileIds) {
    // Eski istatistikleri season_stats'a kaydet
    const { data: oldPlayers } = await supabase
      .from('players')
      .select('id, goals, assists, yellow_cards, red_cards, matches_played, clean_sheets')
      .eq('profile_id', pid as string);

    if (oldPlayers) {
      for (const p of oldPlayers) {
        try {
          await supabase.from('season_stats').insert({
            player_id: p.id,
            season_id: seasonId,
            goals: p.goals || 0,
            assists: p.assists || 0,
            yellow_cards: p.yellow_cards || 0,
            red_cards: p.red_cards || 0,
            matches_played: p.matches_played || 0,
            clean_sheets: p.clean_sheets || 0,
          });
        } catch { /* ignore duplicate */ }
      }
    }

    // İstatistikleri sıfırla
    await supabase
      .from('players')
      .update({
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0,
        matches_played: 0,
        clean_sheets: 0,
        suspended_until: null,
        is_injured: false,
        injury_end_date: null,
      })
      .eq('profile_id', pid as string);
  }

  return {
    league: leagueName,
    status: 'completed',
    awards_count: awards.length,
    champion: champion.name,
  };
}
