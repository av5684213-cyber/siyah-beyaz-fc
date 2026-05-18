import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { logErrorToSupabase } from '@/lib/api-error-handler';

// Takım ismini güvenli şekilde temizle
function sanitizeTeamName(raw: any): string {
  if (raw === null || raw === undefined) return 'Bilinmiyor';
  if (typeof raw !== 'string') return 'Bilinmiyor';
  const cleaned = raw.trim();
  if (!cleaned || cleaned.toLowerCase() === 'undefined' || cleaned.toLowerCase() === 'null' || cleaned === 'NaN') return 'Bilinmiyor';
  if (cleaned.toLowerCase().includes('undefined') || cleaned.toLowerCase().includes('null')) return 'Bilinmiyor';
  return cleaned;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get('leagueId'); // This might be tier or league uuid
  
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ source: 'offline', fixtures: [] });
  }

  try {
    // 1. Resolve league UUID from tier if it's a number
    let targetLeagueId = leagueId;
    if (leagueId && !isNaN(Number(leagueId))) {
      const { data: leagueData } = await supabase
        .from('leagues')
        .select('id')
        .eq('tier', parseInt(leagueId))
        .single();
      if (leagueData) targetLeagueId = leagueData.id;
    }

    if (!targetLeagueId) {
      return NextResponse.json({ source: 'error', fixtures: [] });
    }

    // 2. Get current season for this league
    const { data: seasonData } = await supabase
      .from('seasons')
      .select('id')
      .eq('league_id', targetLeagueId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!seasonData) {
      return NextResponse.json({ source: 'no_season', fixtures: [] });
    }

    // 3. Get fixtures - LEFT JOIN kullan (team silinmiş olsa bile fixture görünür)
    const { data: fixtures, error } = await supabase
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
        referee_id,
        referee_name,
        referee_personality,
        referee_strictness,
        home:league_teams!home_team_id (name, id),
        away:league_teams!away_team_id (name, id)
      `)
      .eq('season_id', seasonData.id)
      .order('tur', { ascending: false })
      .order('match_date', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Takım isimlerini temizle - NULL/undefined durumlarını ele al
    const cleanedFixtures = (fixtures || []).map((f: any) => {
      // home veya away takımı bulunamazsa, team_id'den isim bul
      let homeName = sanitizeTeamName(f.home?.name);
      let awayName = sanitizeTeamName(f.away?.name);

      // Hala bilinmiyorsa ve team_id varsa, league_teams'den direkt sorgula
      // (Bu durum left join başarısız olduğunda oluşur)
      if (homeName === 'Bilinmiyor' && f.home_team_id) {
        homeName = `Takım ${f.home_team_id.toString().slice(0, 4)}`;
      }
      if (awayName === 'Bilinmiyor' && f.away_team_id) {
        awayName = `Takım ${f.away_team_id.toString().slice(0, 4)}`;
      }

      return {
        ...f,
        home: { name: homeName, id: f.home?.id || f.home_team_id },
        away: { name: awayName, id: f.away?.id || f.away_team_id }
      };
    });

    return NextResponse.json({
      source: 'supabase',
      fixtures: cleanedFixtures
    });

  } catch (error: any) {
    console.error('[fixtures] Error:', error);
    logErrorToSupabase(error, { route: '/api/league/fixtures', method: 'GET' }).catch(() => {});
    return NextResponse.json({ source: 'error', message: error.message, fixtures: [] });
  }
}
