import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getTeamNamesForDepartment } from '@/lib/fm/constants';
import { verifyCronSecret, sanitizeError } from '@/lib/fm/security';

// Takım ismini güvenli şekilde temizle - NULL/undefined/boş isimleri yakala
function sanitizeTeamName(raw: any): string {
  if (raw === null || raw === undefined) return '';
  if (typeof raw !== 'string') return '';
  const cleaned = raw.trim();
  if (!cleaned || cleaned.toLowerCase() === 'undefined' || cleaned.toLowerCase() === 'null') return '';
  if (cleaned.toLowerCase().includes('undefined')) return '';
  return cleaned;
}

export async function GET(request: NextRequest) {
  // Admin-only: cron secret doğrulama (fail-closed)
  const cronCheck = verifyCronSecret(request);
  if (!cronCheck.valid) {
    return NextResponse.json({ error: cronCheck.error }, { status: 401 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    console.log('League maintenance triggered');
    
    // 0. Ensure leagues exist
    const defaultLeagues = [
      { id: '11111111-1111-1111-1111-111111111111', name: '1. Lig', tier: 1 },
      { id: '22222222-2222-2222-2222-222222222222', name: '2. Lig', tier: 2 },
      { id: '33333333-3333-3333-3333-333333333333', name: '3. Lig', tier: 3 },
      { id: '44444444-4444-4444-4444-444444444444', name: '4. Lig', tier: 4 },
    ];

    for (const dl of defaultLeagues) {
      await supabase.from('leagues').upsert(dl, { onConflict: 'id' });
    }

    // 1. Get all leagues
    const { data: leagues, error: leagueError } = await supabase.from('leagues').select('*');
    if (leagueError) throw leagueError;

    const maintenanceResults = [];

    for (const league of (leagues || [])) {
      // 1. Check current season progress
      const { data: currentSeason } = await supabase
        .from('seasons')
        .select('*')
        .eq('league_id', league.id)
        .eq('is_finished', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (currentSeason) {
        // Check if all rounds are finished (34 fixtures expected for 18 teams)
        const { count: pendingFixtures } = await supabase
          .from('fixtures')
          .select('*', { count: 'exact', head: true })
          .eq('season_id', currentSeason.id)
          .eq('status', 'scheduled');

        // If today is Sunday and no more fixtures, or if it's the weekend after 34 rounds
        const todayDay = new Date().getDay(); // 0 is Sunday
        if (pendingFixtures === 0 && todayDay === 0) {
          console.log(`Season ${currentSeason.id} finished for ${league.name}. Finalizing...`);
          await supabase.rpc('finalize_season', { p_season_id: currentSeason.id });
          maintenanceResults.push({ league: league.name, status: 'Finalized' });
          // If we finalized, we might want to start the check again to create new season
        }
      }

      // Ensure teams exist for this league
      const { count: teamCount } = await supabase.from('league_teams').select('*', { count: 'exact', head: true }).eq('league_id', league.id);
      if (teamCount === 0) {
        // Tier ve departman sırasını hesapla
        const tier = (league.tier as number) || 4;
        const sameTierLeagues = (leagues || []).filter((l: any) => (l.tier as number) === tier).sort((a: any, b: any) => (a.created_at || '').localeCompare(b.created_at || ''));
        const deptIndex = sameTierLeagues.findIndex((l: any) => l.id === league.id) + 1;
        
        // getTeamNamesForDepartment her zaman 18 isim döndürür
        const names = getTeamNamesForDepartment(tier, deptIndex);
        const teamsToInsert = names.map((name, idx) => ({
          league_id: league.id,
          name: name || `${league.name} SK ${idx + 1}`, // NULL koruması
          strength: 85 - (tier - 1) * 10 - idx,
          is_npc: true
        }));
        await supabase.from('league_teams').insert(teamsToInsert);
      } else {
        // Takımlar var ama isimleri bozuk olabilir - NULL/undefined isimleri düzelt
        const { data: existingTeams } = await supabase
          .from('league_teams')
          .select('id, name, is_npc')
          .eq('league_id', league.id);
        
        if (existingTeams) {
          const tier = (league.tier as number) || 4;
          const sameTierLeagues = (leagues || []).filter((l: any) => (l.tier as number) === tier).sort((a: any, b: any) => (a.created_at || '').localeCompare(b.created_at || ''));
          const deptIndex = sameTierLeagues.findIndex((l: any) => l.id === league.id) + 1;
          const deptNames = getTeamNamesForDepartment(tier, deptIndex);
          
          for (let i = 0; i < existingTeams.length; i++) {
            const team = existingTeams[i];
            
            // Kullanıcı takımlarını atla (kullanıcı kendi ismini belirler)
            if (!team.is_npc) continue;
            
            const cleanName = sanitizeTeamName(team.name);
            
            // İsim geçerliyse atla
            if (cleanName) continue;
            
            // Bozuk isim → doğru isimle düzelt
            const correctName = deptNames[i];
            if (correctName) {
              await supabase.from('league_teams').update({ name: correctName }).eq('id', team.id);
              console.log(`[MAINTENANCE] Bozuk isim düzeltildi: "${team.name || '(NULL)'}" → "${correctName}" (${league.name})`);
            }
          }
        }
      }

      // Also ensure league_standings exist for active season
      const { data: activeSeasonForStandings } = await supabase
        .from('seasons')
        .select('id')
        .eq('league_id', league.id)
        .eq('is_finished', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeSeasonForStandings) {
        const { count: standingsCount } = await supabase
          .from('league_standings')
          .select('*', { count: 'exact', head: true })
          .eq('season_id', activeSeasonForStandings.id);

        if (!standingsCount || standingsCount === 0) {
          const { data: seasonTeams } = await supabase
            .from('league_teams')
            .select('id')
            .eq('league_id', league.id);

          if (seasonTeams && seasonTeams.length > 0) {
            const standingsRows = seasonTeams.map((t: { id: string }) => ({
              season_id: activeSeasonForStandings.id,
              team_id: t.id,
              played: 0, won: 0, drawn: 0, lost: 0,
              gf: 0, ga: 0, gd: 0, points: 0
            }));
            const { error: standingsError } = await supabase.from('league_standings').insert(standingsRows);
            if (standingsError) {
              console.error(`Error creating standings for league ${league.name}:`, standingsError);
            } else {
              console.log(`Created ${standingsRows.length} standings rows for league ${league.name}`);
              maintenanceResults.push({ league: league.name, status: 'Standings created' });
            }
          }
        }
      }

      // 2. Check if active season exists for this year (e.g. 2025/26)
      const year = '2025/26';
      const { data: existingSeason, error: seasonCheckError } = await supabase
        .from('seasons')
        .select('id, is_finished')
        .eq('league_id', league.id)
        .eq('year', year)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let seasonId = existingSeason?.id;

      if (!existingSeason || existingSeason.is_finished) {
        console.log(`Creating new season for league ${league.name}`);
        // 3. Create new season (Starting on Monday)
        const sNow = new Date();
        const sDay = sNow.getDay();
        const sDiff = sNow.getDate() - sDay + (sDay === 0 ? -6 : 1);
        const sMonday = new Date(sNow.setDate(sDiff));

        const { data: newSeason, error: createSeasonError } = await supabase
          .from('seasons')
          .insert({
            league_id: league.id,
            year: year,
            start_date: sMonday.toISOString().split('T')[0],
            current_tur: 1,
            is_finished: false
          })
          .select()
          .single();

        if (createSeasonError) {
          console.error(`Error creating season for league ${league.name}:`, createSeasonError);
          continue;
        }
        seasonId = newSeason.id;

        // 4. Generate fixtures for the new season
        const { error: fixtureError } = await supabase.rpc('generate_league_fixtures', { p_season_id: seasonId });
        if (fixtureError) {
          console.error(`Error generating fixtures for league ${league.name}:`, fixtureError);
        } else {
          console.log(`Fixtures generated for ${league.name}`);
        }
      }

      maintenanceResults.push({
        league: league.name,
        seasonId,
        status: existingSeason ? 'Existing' : 'Created'
      });
    }

    // 5. Update user team names in league_teams if profile changed
    const { data: profiles } = await supabase.from('profiles').select('id, team_name');
    for (const prof of (profiles || [])) {
      if (prof.team_name) {
        await supabase.from('league_teams')
          .update({ name: prof.team_name })
          .eq('profile_id', prof.id);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Maintenance completed successfully',
      results: maintenanceResults
    });
  } catch (error: any) {
    console.error('Maintenance error:', error);
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 });
  }
}
