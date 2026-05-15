import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getTeamNamesForDepartment } from '@/lib/fm/constants';

// Mock data generator for fallback
const getMockStandings = (tier: number) => {
  const allLeagueTeams: Record<number, string[]> = {
    1: ['Kartal Gücü', 'Aslan United', 'Kanarya City', 'Fırtına FC', 'Boğaz Spor', 'Yıldızlar Birliği', 'Anadolu Kartalı', 'Sahil Belediye', 'İç Anadolu FC', 'Akdeniz Spor', 'Ege United', 'Marmara Gücü', 'Zirve Spor', 'Güneşli City', 'Mavi Liman', 'Altınordu Yıldız', 'Demir Spor', 'Kuzey Gücü'],
    2: ['Körfez City', 'Yeşil Vadi', 'Dağ Gücü', 'Ovalar Spor', 'Nehir United', 'Kale City', 'Bozkır FC', 'Rüzgar Spor', 'Toprak United', 'Bulut City', 'Yalnız Kurtlar', 'Sarp Kayalar', 'Kara Elmas', 'Gümüş Ay', 'Tunç Bilek', 'Çelik Kanat', 'Şimşek Spor', 'Poyraz FC'],
    3: ['Buzul United', 'Lav Spor', 'Kumsal City', 'Orman Birliği', 'Gök Kuşağı', 'Kutup FC', 'Ekvator United', 'Tropikal Spor', 'Çöl Fırtınası', 'Vaha City', 'Mağara FC', 'Zümrüt United', 'Safir Spor', 'Yakut City', 'Kehribar FC', 'Mercan United', 'İnci City', 'Sedef Spor'],
    4: ['Yaz United', 'Kış Spor', 'Bahar City', 'Güz Birliği', 'Ay Tutulması', 'Güneş Tutulması', 'Samanyolu FC', 'Andromeda United', 'Kozmos Spor', 'Bulutsu City', 'Kara Delik FC', 'Yıldız Tozu', 'Pulsar United', 'Kuasar Spor', 'Omega FC', 'Alfa Birliği', 'Beta United', 'Gama City']
  };

  const teamsForTier = allLeagueTeams[tier] || allLeagueTeams[1];
  const teams = teamsForTier.map((name, index) => ({
    name,
    is_npc: index !== 0
  }));

  return teams.map((team, i) => ({
    id: `mock-${tier}-${i}`,
    team_id: `team-${tier}-${i}`,
    played: 1,
    won: i === 0 ? 1 : 0,
    drawn: 0,
    lost: i === 0 ? 0 : 1,
    goals_for: i === 0 ? 3 : 0,
    goals_against: i === 0 ? 0 : 3,
    goal_diff: i === 0 ? 3 : -3,
    points: i === 0 ? 3 : 0,
    form: i === 0 ? 'W' : 'L',
    teams: {
      name: team.name,
      is_user_team: !team.is_npc,
      avg_rating: 75 - i
    }
  }));
};

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
  const leagueId = searchParams.get('leagueId');
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ 
      source: 'offline', 
      leagues: [
        { id: 1, name: '1. Lig', tier: 1 },
        { id: 2, name: '2. Lig', tier: 2 },
        { id: 3, name: '3. Lig', tier: 3 },
        { id: 4, name: '4. Lig 1. Grup', tier: 4 },
        { id: 5, name: '4. Lig 2. Grup', tier: 4 },
        { id: 6, name: '4. Lig 3. Grup', tier: 4 },
      ], 
      standings: getMockStandings(parseInt(leagueId || '1')) 
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
        source: 'fallback_no_league', 
        leagues: await getAllLeagues(supabase),
        standings: getMockStandings(leagueTier) 
      });
    }

    return await getStandingsForLeague(supabase, String(finalLeagueId));

  } catch (error: any) {
    console.error('API Error:', error.message, error.stack);
    return NextResponse.json({ 
      source: 'error_fallback',
      standings: getMockStandings(parseInt(leagueId || '1'))
    });
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
      source: 'fallback_no_season', 
      leagues: [
        { id: 1, name: '1. Lig', tier: 1 },
        { id: 2, name: '2. Lig', tier: 2 },
        { id: 3, name: '3. Lig', tier: 3 },
        { id: 4, name: '4. Lig', tier: 4 },
      ], 
      standings: getMockStandings(1) 
    });
  }

  // LEFT JOIN kullanarak, league_teams eşleşmese bile standings satırlarını getir
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
        is_npc
      )
    `)
    .eq('season_id', seasonData.id)
    .order('points', { ascending: false })
    .order('gd', { ascending: false });

  if (standingsError) {
    console.error('[standings] Query error:', standingsError);
    return NextResponse.json({ 
      source: 'error',
      standings: getMockStandings(1)
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

  // Bu lig için tüm league_teams'leri getir (eksik standings tamiri için)
  const { data: allLeagueTeams } = await supabase
    .from('league_teams')
    .select('id, name')
    .eq('league_id', resolvedLeagueId);

  const teamNameMap: Record<string, string> = {};
  if (allLeagueTeams) {
    for (const t of allLeagueTeams) {
      teamNameMap[t.id] = sanitizeTeamName(t.name);
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

  const formattedStandings = (standings || []).map((s: any, idx: number) => {
    // Önce join'den gelen ismi dene, sonra teamNameMap'ten, sonra fallback
    let teamName = sanitizeTeamName(s.league_teams?.name);
    
    if (teamName === 'Bilinmiyor' && teamNameMap[s.team_id]) {
      teamName = teamNameMap[s.team_id];
    }
    
    // Hala bilinmiyorsa, deterministik fallback isim üret
    if (teamName === 'Bilinmiyor') {
      teamName = `${leagueName || leagueTier + '. Lig'} Takım ${idx + 1}`;
    }

    return {
      id: s.id,
      team_id: s.team_id,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goals_for: s.gf,
      goals_against: s.ga,
      gd: s.gd ?? (s.gf - s.ga) ?? 0,
      points: s.points ?? (s.won * 3 + s.drawn) ?? 0,
      teams: {
        name: teamName,
        is_user_team: !s.league_teams?.is_npc,
        avg_rating: 70
      }
    };
  });

  // Sort by points, then gd, then gf
  const sorted = formattedStandings.sort((a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.goals_for - a.goals_for;
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
