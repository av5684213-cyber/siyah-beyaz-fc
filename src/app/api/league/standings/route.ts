import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserLeagueId } from '@/lib/fm/leagueHelpers';
import { createErrorResponse } from '@/lib/api-error-handler';

// Takım ismini güvenli şekilde temizle
function sanitizeTeamName(raw: any): string {
  if (raw === null || raw === undefined) return 'Bilinmiyor';
  if (typeof raw !== 'string') return 'Bilinmiyor';
  const cleaned = raw.trim();
  if (!cleaned || cleaned === 'undefined' || cleaned === 'null' || cleaned === 'NaN') return 'Bilinmiyor';
  // "undefined undefined" gibi çift hataları yakala
  if (cleaned.toLowerCase().includes('undefined') || cleaned.toLowerCase().includes('null')) return 'Bilinmiyor';
  return cleaned;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let leagueId = searchParams.get('leagueId');
  const profileId = searchParams.get('profileId');
  const supabase = getSupabase();

  // Eğer profileId verilmişse ve leagueId yoksa, kullanıcının ligini bul
  if (profileId && !leagueId && supabase) {
    const userLeagueId = await getUserLeagueId(supabase, profileId);
    if (userLeagueId) {
      leagueId = userLeagueId;
    }
  }

  if (!supabase) {
    return NextResponse.json({
      source: 'error',
      leagues: [],
      standings: [],
      error: 'Lig verisi bulunamadı',
    });
  }

  try {
    let finalLeagueId = leagueId;
    const leagueTier = parseInt(leagueId || '1');
    
    // Check if leagueId is a UUID
    const isUuid = leagueId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(leagueId);

    // If NOT a UUID and NOT empty, treat as either a tier number or a numeric league ID
    if (!isUuid && leagueId && leagueId !== '') {
      // Try to find by string ID first (for auto-increment IDs)
      const { data: byId } = await supabase
        .from('leagues')
        .select('id, name, tier')
        .eq('id', leagueId)
        .maybeSingle();
      
      if (byId) {
        finalLeagueId = byId.id;
      } else {
        // Try as integer ID
        const { data: byIntId } = await supabase
          .from('leagues')
          .select('id, name, tier')
          .eq('id', parseInt(leagueId))
          .maybeSingle();
        
        if (byIntId) {
          finalLeagueId = byIntId.id;
        } else {
          // Otherwise treat as tier number
          const leagueTier = parseInt(leagueId);
          const { data: tierLeagues, error: tierError } = await supabase
            .from('leagues')
            .select('id')
            .eq('tier', leagueTier)
            .order('name', { ascending: true });
          
          if (!tierError && tierLeagues && tierLeagues.length > 0) {
            finalLeagueId = tierLeagues[0].id;
          }
        }
      }
    } else if (!leagueId || leagueId === 'undefined' || leagueId === '') {
      // No leagueId provided, default to Tier 1
      const { data: firstLeague } = await supabase.from('leagues').select('id').eq('tier', 1).order('id', { ascending: true }).limit(1).single();
      finalLeagueId = firstLeague?.id;
    }

    if (!finalLeagueId) {
      return NextResponse.json({
        source: 'error',
        leagues: [],
        standings: [],
        error: 'Lig verisi bulunamadı',
      });
    }

    return await getStandingsForLeague(supabase, String(finalLeagueId));

  } catch (error: any) {
    return createErrorResponse(error, { route: '/api/league/standings', method: 'GET' });
  }
}

async function getStandingsForLeague(supabase: any, leagueId: string) {
  console.log(`[standings] Getting standings for leagueId=${leagueId} (type: ${typeof leagueId})`);
  
  // Resolve the actual league UUID
  let resolvedLeagueId = leagueId;
  const { data: leagueRow } = await supabase
    .from('leagues')
    .select('id')
    .eq('id', leagueId)
    .maybeSingle();
  
  if (!leagueRow) {
    const { data: leagueRow2 } = await supabase
      .from('leagues')
      .select('id')
      .eq('id', parseInt(leagueId))
      .maybeSingle();
    if (leagueRow2) {
      resolvedLeagueId = leagueRow2.id;
    }
  }
  
  console.log(`[standings] Resolved leagueId: ${resolvedLeagueId}`);
  
  const { data: seasonData, error: seasonError } = await supabase
    .from('seasons')
    .select('id')
    .eq('league_id', resolvedLeagueId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (seasonError || !seasonData) {
    return NextResponse.json({
      source: 'error',
      leagues: [],
      standings: [],
      error: 'Lig verisi bulunamadı',
    });
  }

  // LEFT JOIN kullanarak, league_teams eşleşmese bile standings satırlarını getir
  // profile_id de çekilir ki kullanıcı takımlarının ismi profiles'tan alınsın
  const { data: standings, error: standingsError } = await supabase
    .from('league_standings')
    .select(`
      id,
      team_id,
      played,
      won,
      drawn,
      lost,
      gf,
      ga,
      gd,
      points,
      league_teams (
        name,
        is_npc,
        is_bot,
        profile_id
      )
    `)
    .eq('season_id', seasonData.id)
    .order('points', { ascending: false })
    .order('gd', { ascending: false })
    .order('gf', { ascending: false })
    .order('team_id', { ascending: true });

  if (standingsError) {
    console.error('[standings] Query error:', standingsError);
    return NextResponse.json({
      source: 'error',
      leagues: [],
      standings: [],
      error: 'Lig verisi bulunamadı',
    });
  }

  // Lig bilgisini al (fallback isimler için)
  const { data: leagueInfo } = await supabase
    .from('leagues')
    .select('name, tier')
    .eq('id', resolvedLeagueId)
    .single();

  const leagueName = leagueInfo?.name || '';
  const leagueTier = leagueInfo?.tier || 4;

  // Bu lig için tüm league_teams'leri getir (eksik standings tamiri + isim çözümleme için)
  const { data: allLeagueTeams } = await supabase
    .from('league_teams')
    .select('id, name, profile_id, is_npc')
    .eq('league_id', resolvedLeagueId);

  const teamNameMap: Record<string, string> = {};
  const teamProfileIdMap: Record<string, string | null> = {};
  if (allLeagueTeams) {
    for (const t of allLeagueTeams) {
      teamNameMap[t.id] = sanitizeTeamName(t.name);
      teamProfileIdMap[t.id] = t.profile_id || null;
    }
  }

  // ── profiles tablosundan kullanıcı takımlarının team_name'lerini çek ──
  // league_teams.is_npc = false olan takımlar gerçek kullanıcı takımlarıdır
  // Bunların ismi profiles.team_name'den gelmelidir
  const userProfileNames: Record<string, string> = {};
  const profileIds = (allLeagueTeams || [])
    .filter((t: any) => t.profile_id)
    .map((t: any) => t.profile_id as string);

  if (profileIds.length > 0) {
    try {
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('id, team_name')
        .in('id', profileIds);
      if (profileRows) {
        for (const p of profileRows) {
          if (p.team_name && sanitizeTeamName(p.team_name) !== 'Bilinmiyor') {
            userProfileNames[p.id] = p.team_name;
          }
        }
      }
    } catch (profileErr) {
      console.error('[standings] Profiles fetch error:', profileErr);
    }
  }

  // Eksik standings varsa oluştur (league_teams var ama standings yok)
  if (allLeagueTeams && allLeagueTeams.length > 0 && standings && standings.length < allLeagueTeams.length) {
    const existingTeamIds = new Set((standings || []).map((s: any) => s.team_id));
    const missingTeams = allLeagueTeams.filter(t => !existingTeamIds.has(t.id));
    
    if (missingTeams.length > 0) {
      console.log(`[standings] ${missingTeams.length} eksik standings oluşturuluyor...`);
      const newStandingsRows = missingTeams.map(t => ({
        season_id: seasonData.id,
        team_id: t.id,
        played: 0, won: 0, drawn: 0, lost: 0,
        gf: 0, ga: 0, gd: 0, points: 0
      }));
      try {
        await supabase.from('league_standings').insert(newStandingsRows);
        console.log(`[standings] ${newStandingsRows.length} standings oluşturuldu.`);
      } catch (insertErr) {
        console.error('[standings] Standings oluşturma hatası:', insertErr);
      }
    }
  }

  const formattedStandings = (standings || []).map((s: any) => {
    // ── İsim çözümleme önceliği: ──
    // 1. profiles.team_name (kullanıcı takımları için en güvenilir kaynak)
    // 2. league_teams join'den gelen name
    // 3. teamNameMap fallback (aynı ligdeki tüm league_teams sorgusundan)
    // 4. team_id bazlı deterministik fallback (idx değil!)
    let teamName = 'Bilinmiyor';
    const profileId = s.league_teams?.profile_id || teamProfileIdMap[s.team_id];
    const isNpc = s.league_teams?.is_npc !== false; // undefined = NPC kabul et

    // 1. Kullanıcı takımıysa profiles.team_name'den al
    if (!isNpc && profileId && userProfileNames[profileId]) {
      teamName = userProfileNames[profileId];
    }

    // 2. profiles'tan gelmediyse, join'den gelen ismi dene
    if (teamName === 'Bilinmiyor') {
      teamName = sanitizeTeamName(s.league_teams?.name);
    }

    // 3. Hala bilinmiyorsa teamNameMap'ten dene
    if (teamName === 'Bilinmiyor' && teamNameMap[s.team_id]) {
      teamName = teamNameMap[s.team_id];
    }

    // 4. Son fallback: team_id bazlı deterministik isim (idx DEĞİL, her sorguda aynı kalır)
    if (teamName === 'Bilinmiyor') {
      // team_id'nin son 8 karakterini kullanarak deterministik bir sıra numarası üret
      const stableIndex = (allLeagueTeams || []).findIndex((t: any) => t.id === s.team_id);
      teamName = `${leagueName || leagueTier + '. Lig'} Takım ${stableIndex >= 0 ? stableIndex + 1 : s.team_id.slice(-4)}`;
    }

    return {
      id: s.id,
      team_id: s.team_id,
      played: s.played ?? 0,
      won: s.won ?? 0,
      drawn: s.drawn ?? 0,
      lost: s.lost ?? 0,
      goals_for: s.gf ?? 0,
      goals_against: s.ga ?? 0,
      gd: s.gd ?? ((s.gf ?? 0) - (s.ga ?? 0)),
      points: s.points ?? ((s.won ?? 0) * 3 + (s.drawn ?? 0)),
      teams: {
        name: teamName,
        is_user_team: !isNpc,
        is_bot: s.league_teams?.is_bot || false,
        avg_rating: 70
      }
    };
  });

  // Deterministic sort: points → gd → gf → team_id (string compare)
  const sorted = formattedStandings.sort((a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
    // Final tiebreaker: team_id (stable, deterministic)
    return String(a.team_id).localeCompare(String(b.team_id));
  });

  return NextResponse.json({
    source: 'supabase',
    leagues: await getAllLeagues(supabase),
    standings: sorted
  });
}

async function getAllLeagues(supabase: any) {
  const { data } = await supabase.from('leagues').select('*').order('tier', { ascending: true });
  return data || [];
}
