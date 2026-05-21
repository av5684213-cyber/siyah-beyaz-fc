/**
 * GET /api/cron/season-end
 * Her gün çalışacak cron endpoint — sezon sonu kontrolü
 *
 * Kontrol: Tüm takımlar played = 34 oldu mu?
 * Evetse:
 * 1. Şampiyonu, gol kralını, MVP'yi belirle
 * 2. season_awards tablosuna yaz
 * 3. Gençlik akademisinden yeni oyuncular üret
 * 4. Yeni sezon oluştur (seasons + fixtures)
 * 5. Takımların played değerlerini sıfırla
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const MATCHES_PER_SEASON = 34;

export async function GET(request: NextRequest) {
  // Cron secret doğrulama
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    // 1. Aktif sezonu bul
    const { data: activeSeason, error: seasonError } = await supabase
      .from('seasons')
      .select('id, league_id, name, status')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (seasonError || !activeSeason) {
      return NextResponse.json({ message: 'Aktif sezon bulunamadı', action: 'none' });
    }

    // 2. Tüm takımlar 34 maç oynadı mı?
    const { data: standings, error: standingsError } = await supabase
      .from('league_standings')
      .select('team_id, played, won, drawn, lost, goals_for, goals_against, points, teams:name')
      .eq('league_id', activeSeason.league_id);

    if (standingsError || !standings) {
      return NextResponse.json({ error: 'Standings alınamadı' }, { status: 500 });
    }

    const allPlayed = standings.every((s: any) => s.played >= MATCHES_PER_SEASON);
    if (!allPlayed) {
      const maxPlayed = Math.max(...standings.map((s: any) => s.played || 0));
      return NextResponse.json({
        message: `Sezon devam ediyor (${maxPlayed}/${MATCHES_PER_SEASON} maç)`,
        action: 'none',
        seasonId: activeSeason.id,
      });
    }

    console.log(`[season-end] Sezon ${activeSeason.name} tamamlandı!`);

    // 3. Şampiyonu belirle
    const sortedStandings = [...standings].sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      return (b.goals_for - b.goals_against) - (a.goals_for - a.goals_against);
    });

    const champion = sortedStandings[0];
    const championName = (champion as any).teams?.name || (champion as any).teams || 'Bilinmiyor';

    // 4. Gol kralını bul
    const { data: topScorer } = await supabase
      .from('players')
      .select('id, name, team_name')
      .order('goals', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 5. MVP'yi bul (en yüksek rating)
    const { data: mvpPlayer } = await supabase
      .from('players')
      .select('id, name, rating, team_name')
      .order('rating', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 6. season_awards tablosuna yaz (tablo yoksa atla)
    const awards = [
      { season_id: activeSeason.id, award_type: 'champion', team_name: championName, description: `Şampiyon: ${championName}` },
      { season_id: activeSeason.id, award_type: 'golden_boot', player_id: topScorer?.id, player_name: topScorer?.name, description: `Gol Kralı: ${topScorer?.name || 'Bilinmiyor'}` },
      { season_id: activeSeason.id, award_type: 'mvp', player_id: mvpPlayer?.id, player_name: mvpPlayer?.name, description: `MVP: ${mvpPlayer?.name || 'Bilinmiyor'}` },
    ];

    await supabase.from('season_awards').upsert(awards).then(({ error }) => {
      if (error) console.warn('[season-end] Awards insert skipped:', error.message);
    });

    // 7. Sezonu tamamlandı olarak işaretle
    await supabase
      .from('seasons')
      .update({ status: 'completed' })
      .eq('id', activeSeason.id);

    // 8. Kiralık oyuncuları geri çağır
    await supabase
      .from('players')
      .update({
        loan_status: 'returned',
        loaned_to_profile_id: null,
        loan_end_date: null,
        is_on_loan_market: false,
      })
      .eq('loan_status', 'active');

    // Loans tablosunu güncelle
    await supabase
      .from('loans')
      .update({ status: 'completed' })
      .eq('status', 'active');

    // 9. Gençlik akademisinden yeni oyuncular üret (her takım 2 genç)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, team_name')
      .limit(20);

    if (profiles && profiles.length > 0) {
      const youthPlayers = profiles.flatMap((profile: any) => {
        const positions = ['CB', 'CM', 'ST', 'LW', 'RB', 'CAM'];
        return [0, 1].map((i) => {
          const pos = positions[Math.floor(Math.random() * positions.length)];
          const rating = 55 + Math.floor(Math.random() * 15); // 55-69
          const firstName = ['Ali', 'Emre', 'Arda', 'Kerem', 'Efe', 'Yusuf'][Math.floor(Math.random() * 6)];
          const lastName = ['Yıldız', 'Demir', 'Kaya', 'Çelik', 'Şahin', 'Arslan'][Math.floor(Math.random() * 6)];
          return {
            id: `youth-${profile.id}-${i}-${Date.now()}`,
            name: `${firstName} ${lastName}`,
            position: pos === 'GK' ? 'GK' : ['CB', 'LB', 'RB'].includes(pos) ? 'DEF' : ['CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'].includes(pos) ? 'MID' : 'FWD',
            specific_position: pos,
            rating,
            potential: Math.min(92, rating + 15 + Math.floor(Math.random() * 10)),
            age: 16 + Math.floor(Math.random() * 2), // 16-17
            nation: 'Türkiye',
            team_name: profile.team_name,
            profile_id: profile.id,
            market_value: rating * rating * 80,
            salary: Math.round(rating * 100),
            speed: rating + Math.floor(Math.random() * 10) - 5,
            physical: rating + Math.floor(Math.random() * 10) - 5,
            passing: rating + Math.floor(Math.random() * 10) - 5,
            shooting: rating + Math.floor(Math.random() * 10) - 5,
            heading: rating + Math.floor(Math.random() * 10) - 5,
            goalkeeping: pos === 'GK' ? rating + 10 : Math.max(1, rating - 30),
            control: rating + Math.floor(Math.random() * 10) - 5,
            vision: rating + Math.floor(Math.random() * 10) - 5,
            defending: rating + Math.floor(Math.random() * 10) - 5,
            mental: rating + Math.floor(Math.random() * 10) - 5,
            cond: 100,
            morale: 80,
            is_injured: false,
            is_on_loan_market: false,
            loan_fee: 0,
          };
        });
      });

      await supabase.from('players').insert(youthPlayers).then(({ error }) => {
        if (error) console.warn('[season-end] Youth players insert error:', error.message);
        else console.log(`[season-end] ${youthPlayers.length} genç oyuncu üretildi`);
      });
    }

    // 10. Yeni sezon oluştur
    const nextSeasonNumber = parseInt(activeSeason.name.replace(/\D/g, '') || '1') + 1;
    const { data: newSeason, error: newSeasonError } = await supabase
      .from('seasons')
      .insert({
        league_id: activeSeason.league_id,
        name: `Sezon ${nextSeasonNumber}`,
        status: 'active',
      })
      .select()
      .single();

    if (newSeasonError || !newSeason) {
      console.error('[season-end] New season creation failed:', newSeasonError?.message);
      return NextResponse.json({ error: 'Yeni sezon oluşturulamadı' }, { status: 500 });
    }

    // 11. Standings'ı sıfırla (yeni sezon için)
    const newStandings = standings.map((s: any) => ({
      team_id: s.team_id,
      league_id: activeSeason.league_id,
      season: nextSeasonNumber,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_diff: 0,
      points: 0,
    }));

    await supabase.from('league_standings').insert(newStandings);

    // 12. Yeni sezon fikstürü oluştur (round-robin)
    const { data: leagueTeams } = await supabase
      .from('league_teams')
      .select('id')
      .eq('league_id', activeSeason.league_id);

    if (leagueTeams && leagueTeams.length >= 2) {
      const teamIds = leagueTeams.map((t: any) => t.id);
      const n = teamIds.length;
      const fixtures: any[] = [];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);

      const rotatingIds = [...teamIds];
      for (let round = 0; round < n - 1; round++) {
        for (let match = 0; match < n / 2; match++) {
          const home = rotatingIds[match];
          const away = rotatingIds[n - 1 - match];
          if (home && away) {
            const matchDate = new Date(tomorrow);
            matchDate.setDate(matchDate.getDate() + round * 7);

            fixtures.push({
              home_team_id: home,
              away_team_id: away,
              season_id: newSeason.id,
              tur: round + 1,
              match_date: matchDate.toISOString().split('T')[0],
              match_time: '15:00',
              status: 'scheduled',
            });

            const returnDate = new Date(matchDate);
            returnDate.setDate(returnDate.getDate() + (n - 1) * 7);
            fixtures.push({
              home_team_id: away,
              away_team_id: home,
              season_id: newSeason.id,
              tur: round + 1 + (n - 1),
              match_date: returnDate.toISOString().split('T')[0],
              match_time: '15:00',
              status: 'scheduled',
            });
          }
        }
        const last = rotatingIds.pop();
        if (last) rotatingIds.splice(1, 0, last);
      }

      for (let i = 0; i < fixtures.length; i += 100) {
        await supabase.from('fixtures').insert(fixtures.slice(i, i + 100));
      }
      console.log(`[season-end] ${fixtures.length} yeni fikstür oluşturuldu`);
    }

    return NextResponse.json({
      success: true,
      action: 'season_ended',
      champion: championName,
      goldenBoot: topScorer?.name || 'Bilinmiyor',
      mvp: mvpPlayer?.name || 'Bilinmiyor',
      newSeason: newSeason.name,
    });
  } catch (err) {
    console.error('[season-end] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
