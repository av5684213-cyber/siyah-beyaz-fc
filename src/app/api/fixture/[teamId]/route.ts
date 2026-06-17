/**
 * Fikstür API Route — Takımın sezon fikstürünü getirir
 *
 * GET /api/fixture/[teamId]?seasonId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: true, message: 'Supabase yapılandırılmamış.' }, { status: 500 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: true, message: 'Supabase client null.' }, { status: 500 });
    }

    const { teamId } = await params;
    if (!teamId) {
      return NextResponse.json({ error: true, message: 'teamId parametresi gerekli.' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');

    // 1. teamId ile league_teams kaydını bul
    const { data: teamData } = await supabase
      .from('league_teams')
      .select('id, name, league_id')
      .eq('profile_id', teamId)
      .maybeSingle();

    if (!teamData) {
      // Alternatif: profiles tablosundan team_name ile ara
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, team_name')
        .eq('id', teamId)
        .maybeSingle();

      if (!profile) {
        return NextResponse.json({ error: true, message: 'Takım bulunamadı.' }, { status: 404 });
      }

      const { data: altTeam } = await supabase
        .from('league_teams')
        .select('id, name, league_id')
        .eq('name', profile.team_name)
        .maybeSingle();

      if (!altTeam) {
        return NextResponse.json({ fixtures: [], nextMatch: null });
      }

      return await fetchFixturesForTeam(supabase, altTeam.id, altTeam.league_id, seasonId);
    }

    return await fetchFixturesForTeam(supabase, teamData.id, teamData.league_id, seasonId);
  } catch (err) {
    return createErrorResponse(err, { route: '/api/fixture/[teamId]', method: 'GET' });
  }
}

async function fetchFixturesForTeam(
  supabase: { from: (table: string) => any },
  leagueTeamId: string,
  leagueId: string | null,
  seasonId: string | null
): Promise<NextResponse> {
  try {
    let targetSeasonId = seasonId;
    if (!targetSeasonId && leagueId) {
      const { data: seasonData } = await supabase
        .from('seasons')
        .select('id')
        .eq('league_id', leagueId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      targetSeasonId = seasonData?.id || null;
    }

    if (!targetSeasonId) {
      return NextResponse.json({ fixtures: [], nextMatch: null });
    }

    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select(`
        id,
        tur,
        match_date,
        match_time,
        status,
        home_score,
        away_score,
        home_team_id,
        away_team_id,
        referee_name,
        home:league_teams!home_team_id (name, id),
        away:league_teams!away_team_id (name, id)
      `)
      .eq('season_id', targetSeasonId)
      .or(`home_team_id.eq.${leagueTeamId},away_team_id.eq.${leagueTeamId}`)
      .order('tur', { ascending: true });

    if (fixturesError) {
      console.error('[GET /api/fixture] Fixtures error:', fixturesError.message);
      return NextResponse.json({ error: true, message: 'Fikstür yüklenirken hata oluştu.' }, { status: 500 });
    }

    // ═══ SONRAKİ MAÇ HESAPLAMA — Akıllı mantık ═══
    //
    // Hafta içi 2 slot: 12:00 (Öğle) + 18:00 (Akşam)
    // Her slot 9 maç, 10'ar dk arayla (12:00-13:30, 18:00-19:30)
    //
    // Öncelik sırası:
    //   1. CANLI MAÇ (status='live') → kullanıcı takımının canlı maçı varsa onu göster
    //   2. BUGÜNÜN SCHEDULED MAÇI (status='scheduled' AND match_date=today AND match_time >= now)
    //      — Bugün 12:00-13:30 slot'undaysa 12:00-13:20 maçları
    //      — Bugün 13:30-17:59 arasındaysa 18:00 maçı
    //   3. GELECEK MAÇ (status='scheduled' AND match_date > today)
    //
    const nowTR = new Date(Date.now() + 3 * 60 * 60 * 1000); // TR saati
    const todayStr = nowTR.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentMinutes = nowTR.getHours() * 60 + nowTR.getMinutes();

    // Takımın tüm maçlarını tarihe + saate göre sırala
    const teamFixtures = (fixtures || []).filter((f: Record<string, unknown>) =>
      f.home_team_id === leagueTeamId || f.away_team_id === leagueTeamId
    );

    // Öncelik 1: Canlı maç
    const liveMatch = teamFixtures.find((f: Record<string, unknown>) => f.status === 'live');

    // Öncelik 2: Bugünün scheduled maçı (saat bazlı)
    // Eğer 12:00-13:30 arasındaysak → 12:00 slot'unun maçları bugüne ait scheduled
    // Eğer 13:30-17:59 arasındaysak → 18:00 maçı scheduled
    const todaysScheduled = teamFixtures
      .filter((f: Record<string, unknown>) =>
        f.status === 'scheduled' &&
        (f.match_date as string) === todayStr
      )
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        (a.match_time as string).localeCompare(b.match_time as string)
      );

    // Şu anki slot'ta scheduled maç var mı?
    // 12:00 slot (720-810): currentMinutes 720-810 arasındaysa, 12:00-13:20 saatli maçlar
    // 18:00 slot (1080-1170): currentMinutes 1080-1170 arasındaysa, 18:00-19:20 saatli maçlar
    let nextMatch: Record<string, unknown> | null = null;

    if (liveMatch) {
      // Canlı maç var → onu göster
      nextMatch = liveMatch;
    } else {
      // Bugünün scheduled maçlarından uygun olanı seç
      // Eğer 12:00 slot'undaysak (currentMinutes 720-810), 12:00-13:20 saatli scheduled maçları al
      // Eğer 13:30-17:59 arasındaysak, 18:00-19:20 saatli scheduled maçları al
      // Eğer 10:00-11:59 arasındaysak, 12:00 saatli maçı al (öğle slot bekleniyor)
      // Eğer 18:00 slot'undaysak ama canlı maç yoksa (henüz başlamadı), 18:00 saatli maçı al
      const isInNoonSlot = currentMinutes >= 720 && currentMinutes < 810;
      const isBetweenSlots = currentMinutes >= 810 && currentMinutes < 1080;
      const isPreNoon = currentMinutes >= 600 && currentMinutes < 720;
      const isPreEvening = currentMinutes >= 1080 - 60 && currentMinutes < 1080;
      const isInEveningSlot = currentMinutes >= 1080 && currentMinutes < 1170;

      let candidates = todaysScheduled;
      if (isInNoonSlot) {
        // 12:00-13:29 arası → 12:00-13:20 saatli scheduled maçları al
        candidates = todaysScheduled.filter((f: Record<string, unknown>) => {
          const t = (f.match_time as string) || '12:00';
          const [h, m] = t.split(':').map(Number);
          const mins = h * 60 + m;
          return mins >= 720 && mins <= 800; // 12:00 - 13:20
        });
      } else if (isBetweenSlots || isPreEvening) {
        // 13:30-17:59 → 18:00 saatli maçı al
        candidates = todaysScheduled.filter((f: Record<string, unknown>) => {
          const t = (f.match_time as string) || '12:00';
          const [h] = t.split(':').map(Number);
          return h === 18; // 18:00-18:50
        });
      } else if (isPreNoon) {
        // 10:00-11:59 → 12:00 saatli maçı al
        candidates = todaysScheduled.filter((f: Record<string, unknown>) => {
          const t = (f.match_time as string) || '12:00';
          const [h] = t.split(':').map(Number);
          return h === 12;
        });
      } else if (isInEveningSlot) {
        // 18:00-19:29 → 18:00-19:20 saatli maçı al
        candidates = todaysScheduled.filter((f: Record<string, unknown>) => {
          const t = (f.match_time as string) || '12:00';
          const [h, m] = t.split(':').map(Number);
          const mins = h * 60 + m;
          return mins >= 1080 && mins <= 1160;
        });
      }

      // İlk uygun scheduled maç
      nextMatch = candidates[0] || null;

      // Eğer hâlâ null ise, gelecek maç(lar)a bak
      if (!nextMatch) {
        const futureMatch = teamFixtures
          .filter((f: Record<string, unknown>) =>
            f.status === 'scheduled' &&
            ((f.match_date as string) > todayStr ||
             ((f.match_date as string) === todayStr && (f.match_time as string) > `${String(nowTR.getHours()).padStart(2,'0')}:${String(nowTR.getMinutes()).padStart(2,'0')}`))
          )
          .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
            const dateCmp = (a.match_date as string).localeCompare(b.match_date as string);
            if (dateCmp !== 0) return dateCmp;
            return (a.match_time as string).localeCompare(b.match_time as string);
          })[0];
        nextMatch = futureMatch || null;
      }
    }

    // Resolve team names for fixtures where join failed
    const unresolvedIds = new Set<string>();
    (fixtures || []).forEach((f: Record<string, unknown>) => {
      if (!(f.home as Record<string, string>)?.name && f.home_team_id) unresolvedIds.add(f.home_team_id as string);
      if (!(f.away as Record<string, string>)?.name && f.away_team_id) unresolvedIds.add(f.away_team_id as string);
    });

    let teamNameMap = new Map<string, string>();
    if (unresolvedIds.size > 0) {
      const { data: missingTeams } = await supabase
        .from('league_teams')
        .select('id, name')
        .in('id', Array.from(unresolvedIds));
      (missingTeams || []).forEach((t: Record<string, string>) => {
        teamNameMap.set(t.id, t.name);
      });
    }

    const cleanedFixtures = (fixtures || []).map((f: Record<string, unknown>) => ({
      id: f.id,
      tur: f.tur,
      match_date: f.match_date,
      match_time: f.match_time,
      status: f.status,
      home_score: f.home_score,
      away_score: f.away_score,
      home_team: (f.home as Record<string, string>)?.name || teamNameMap.get(f.home_team_id as string) || 'Bilinmiyor',
      away_team: (f.away as Record<string, string>)?.name || teamNameMap.get(f.away_team_id as string) || 'Bilinmiyor',
      home_team_id: f.home_team_id || (f.home as Record<string, string>)?.id || '',
      away_team_id: f.away_team_id || (f.away as Record<string, string>)?.id || '',
      is_home: f.home_team_id === leagueTeamId,
      referee_name: f.referee_name || null,
    }));

    const cleanedNextMatch = nextMatch ? {
      id: nextMatch.id,
      tur: nextMatch.tur,
      match_date: nextMatch.match_date,
      match_time: nextMatch.match_time,
      status: nextMatch.status,  // 'live' | 'scheduled' | 'completed'
      opponent: nextMatch.home_team_id === leagueTeamId
        ? ((nextMatch.away as Record<string, string>)?.name || 'Bilinmiyor')
        : ((nextMatch.home as Record<string, string>)?.name || 'Bilinmiyor'),
      is_home: nextMatch.home_team_id === leagueTeamId,
    } : null;

    return NextResponse.json({
      fixtures: cleanedFixtures,
      nextMatch: cleanedNextMatch,
    });
  } catch (err) {
    console.error('[fetchFixturesForTeam] Error:', err);
    return NextResponse.json({ fixtures: [], nextMatch: null });
  }
}
