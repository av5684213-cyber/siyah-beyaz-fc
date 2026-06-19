import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { TIER_TEAM_NAMES, getTeamNamesForDepartment } from '@/lib/fm/constants';
import { assignRefereesToSeason } from '@/lib/fm/referee';
import { createErrorResponse } from '@/lib/api-error-handler';

// Bu API, league_teams tablosundaki bozuk isimleri (NULL, "undefined", "Undefined" vb.)
// doğru isimlerle değiştirir. Ayrıca league_standings ile league_teams arasındaki kopuk bağları da tamir eder.
//
// Kullanım: GET /api/league/fix-teams

export async function GET(request: NextRequest) {
  // Admin-only: Authorization Bearer check
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const results: any[] = [];

    // ═══════════════════════════════════════════════════
    // 1. TÜM league_teams satırlarını getir
    // ═══════════════════════════════════════════════════
    const { data: allTeams, error: teamsError } = await supabase
      .from('league_teams')
      .select('id, league_id, name, is_npc, profile_id');

    if (teamsError) throw teamsError;
    if (!allTeams || allTeams.length === 0) {
      return NextResponse.json({ success: true, message: 'Düzeltilecek takım yok (tablo boş).' });
    }

    // ═══════════════════════════════════════════════════
    // 2. Her takımın lig bilgisini getir (tier ve departman sırası)
    // ═══════════════════════════════════════════════════
    const { data: allLeagues } = await supabase
      .from('leagues')
      .select('id, name, tier')
      .order('created_at', { ascending: true });

    if (!allLeagues) throw new Error('Leagues tablosu okunamadı');

    // Tier bazında lig sırasını hesapla (her tier'daki departman sırası)
    const tierLeagueMap: Record<number, string[]> = {};
    for (const league of allLeagues) {
      const tier = league.tier || 4;
      if (!tierLeagueMap[tier]) tierLeagueMap[tier] = [];
      tierLeagueMap[tier].push(league.id);
    }

    // ═══════════════════════════════════════════════════
    // 3. Bozuk isimleri tespit et ve düzelt
    // ═══════════════════════════════════════════════════
    let fixedNullNames = 0;
    let fixedUndefinedNames = 0;
    let fixedEmptyNames = 0;
    let fixedGenericNames = 0;

    for (const team of allTeams) {
      // Kullanıcı takımlarını atla (is_npc=false ve profile_id dolu)
      if (!team.is_npc && team.profile_id) continue;

      const isNull = !team.name || team.name === null;
      const isUndefined = team.name === 'undefined' || team.name === 'Undefined' || 
                          team.name === 'undefined undefined' || team.name === 'Undefined Undefined';
      const isEmpty = typeof team.name === 'string' && team.name.trim() === '';
      const isGeneric = typeof team.name === 'string' && 
                        (team.name.includes('Kulüp') || team.name.includes('Takım') || 
                         team.name.includes('undefined') || team.name.includes('Undefined'));

      if (!isNull && !isUndefined && !isEmpty && !isGeneric) continue;

      // Lig bilgisini bul
      const league = allLeagues.find(l => l.id === team.league_id);
      const tier = league?.tier || 4;
      const leagueIdsForTier = tierLeagueMap[tier] || [];
      const deptIndex = leagueIdsForTier.indexOf(team.league_id) + 1; // 1-based

      // Bu departman için isim havuzunu al
      const deptNames = getTeamNamesForDepartment(tier, deptIndex);

      // Bu takımın sırasını bul (aynı ligdeki sırası)
      const teamsInSameLeague = allTeams.filter(t => t.league_id === team.league_id);
      const teamOrder = teamsInSameLeague.indexOf(team);
      const newName = deptNames[teamOrder] || `${league?.name || tier + '. Lig'} SK ${teamOrder + 1}`;

      // Güncelle
      const { error: updateError } = await supabase
        .from('league_teams')
        .update({ name: newName })
        .eq('id', team.id);

      if (updateError) {
        console.error(`[FIX-TEAMS] Güncelleme hatası (id:${team.id}):`, updateError.message);
      } else {
        if (isNull || isEmpty) fixedNullNames++;
        if (isUndefined) fixedUndefinedNames++;
        if (isGeneric && !isNull && !isUndefined && !isEmpty) fixedGenericNames++;
        
        results.push({
          teamId: team.id,
          oldName: team.name || '(NULL)',
          newName,
          league: league?.name || '?',
          reason: isNull ? 'NULL isim' : isUndefined ? 'Undefined isim' : isGeneric ? 'Jenerik isim' : 'Boş isim'
        });
      }
    }

    // ═══════════════════════════════════════════════════
    // 4. Kopuk league_standings'leri temizle
    // (team_id'si league_teams tablosunda olmayan standings satırları)
    // ═══════════════════════════════════════════════════
    const validTeamIds = new Set(allTeams.map(t => t.id));

    // Tüm season'ları bul
    const { data: allSeasons } = await supabase
      .from('seasons')
      .select('id, league_id');

    let orphanedStandings = 0;
    if (allSeasons) {
      for (const season of allSeasons) {
        const { data: standings } = await supabase
          .from('league_standings')
          .select('id, team_id')
          .eq('season_id', season.id);

        if (!standings) continue;

        const orphaned = standings.filter(s => !validTeamIds.has(s.team_id));
        if (orphaned.length > 0) {
          // Kopuk standings'leri sil
          const orphanedIds = orphaned.map(s => s.team_id);
          await supabase
            .from('league_standings')
            .delete()
            .in('team_id', orphanedIds)
            .eq('season_id', season.id);
          orphanedStandings += orphaned.length;

          // Eksik standings'leri oluştur
          const leagueTeams = allTeams.filter(t => t.league_id === season.league_id);
          const existingTeamIds = new Set(standings.map(s => s.team_id));
          const missingTeams = leagueTeams.filter(t => !existingTeamIds.has(t.id));

          if (missingTeams.length > 0) {
            const newStandings = missingTeams.map(t => ({
              season_id: season.id,
              team_id: t.id,
              played: 0, won: 0, drawn: 0, lost: 0,
              gf: 0, ga: 0, gd: 0, points: 0
            }));
            await supabase.from('league_standings').insert(newStandings);
          }
        }
      }
    }

    // ═══════════════════════════════════════════════════
    // 5. Eksik season / standings oluşturma
    // ═══════════════════════════════════════════════════
    let newSeasons = 0;
    for (const league of allLeagues) {
      const { data: existingSeason } = await supabase
        .from('seasons')
        .select('id')
        .eq('league_id', league.id)
        .eq('is_finished', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!existingSeason) {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));

        const { data: newSeason, error: seasonError } = await supabase
          .from('seasons')
          .insert({
            league_id: league.id,
            year: '2025/26',
            start_date: monday.toISOString().split('T')[0],
            current_tur: 1,
            is_finished: false
          })
          .select()
          .maybeSingle();

        if (!seasonError && newSeason) {
          newSeasons++;
          // Standings oluştur
          const leagueTeams = allTeams.filter(t => t.league_id === league.id);
          if (leagueTeams.length > 0) {
            const standingsRows = leagueTeams.map(t => ({
              season_id: newSeason.id,
              team_id: t.id,
              played: 0, won: 0, drawn: 0, lost: 0,
              gf: 0, ga: 0, gd: 0, points: 0
            }));
            await supabase.from('league_standings').insert(standingsRows);
          }
          // Fixtures oluştur
          try {
            await supabase.rpc('generate_league_fixtures', { p_season_id: newSeason.id });
            // Hakemleri üret ve fikstürlere ata
            await assignRefereesToSeason(supabase, league.id, newSeason.id);
          } catch (e) {
            console.warn(`[FIX-TEAMS] Fixture üretilemedi (${league.name}):`, e);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalTeams: allTeams.length,
        fixedNullNames,
        fixedUndefinedNames,
        fixedEmptyNames,
        fixedGenericNames,
        orphanedStandingsCleaned: orphanedStandings,
        newSeasonsCreated: newSeasons
      },
      changes: results,
      message: `Toplam ${results.length} takım ismi düzeltildi, ${orphanedStandings} kopuk standings temizlendi.`
    });

  } catch (error: any) {
    return createErrorResponse(error, { route: '/api/league/fix-teams', method: 'GET' });
  }
}
