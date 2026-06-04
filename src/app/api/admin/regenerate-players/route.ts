/**
 * POST /api/admin/regenerate-players
 * Tüm oyuncuları siler ve her takım için 24 oyuncu yeniden üretir.
 * Admin-only: Bearer token ile çağrılmalı.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateStableSquad } from '@/lib/fm/playerGenerator';

export async function POST(request: NextRequest) {
  // Authorization check
  const adminSecret = process.env.CRON_SECRET || process.env.ADMIN_SECRET || 'siyah-beyaz-admin-2026';
  if (!adminSecret || request.headers.get('authorization') !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client null' }, { status: 500 });
  }

  try {
    // 1. Get all league teams with their info
    const { data: teams, error: teamsError } = await supabase
      .from('league_teams')
      .select('id, name, profile_id, league_id')
      .order('name');

    if (teamsError) throw teamsError;
    if (!teams || teams.length === 0) {
      return NextResponse.json({ error: 'No teams found' }, { status: 404 });
    }

    // Get league tiers for rating distribution
    const { data: leagues } = await supabase
      .from('leagues')
      .select('id, tier');

    const leagueTiers = new Map(leagues?.map(l => [l.id, l.tier]) || []);

    // 2. Delete all existing players
    // Delete by profile_id batches to avoid timeout
    const { data: allProfiles } = await supabase
      .from('league_teams')
      .select('profile_id');
    const profileIds = allProfiles?.map((p: any) => p.profile_id).filter(Boolean) || [];

    // Delete players matching team profiles
    if (profileIds.length > 0) {
      // Batch delete in chunks of 50
      for (let i = 0; i < profileIds.length; i += 50) {
        const chunk = profileIds.slice(i, i + 50);
        await supabase
          .from('players')
          .delete()
          .in('profile_id', chunk);
      }
    }

    // Delete any remaining players (free agents, etc.)
    for (let attempt = 0; attempt < 10; attempt++) {
      const { data: remaining } = await supabase
        .from('players')
        .select('id')
        .limit(500);
      if (!remaining || remaining.length === 0) break;
      const ids = remaining.map((p: any) => p.id);
      await supabase.from('players').delete().in('id', ids);
    }

    console.log(`[regenerate-players] Deleted existing players, now generating for ${teams.length} teams`);

    // 3. Generate players for each team
    let totalGenerated = 0;
    const errors: string[] = [];

    for (const team of teams) {
      try {
        const tier = leagueTiers.get(team.league_id) || 4;
        const squad = generateStableSquad(team.name, tier);

        const playersToInsert = squad.map(p => ({
          id: p.id,
          name: p.name,
          position: p.position,
          specific_position: p.specificPosition || p.position,
          secondary_positions: p.secondaryPositions || null,
          rating: p.rating,
          age: p.age,
          height: p.height || (p.position === 'GK' ? 185 + Math.floor(Math.random() * 15) : 170 + Math.floor(Math.random() * 30)),
          weight: p.weight || (65 + Math.floor(Math.random() * 25)),
          potential: p.potential,
          hidden_potential: p.hidden_potential,
          market_value: p.market_value,
          salary: p.salary,
          nation: p.nation || 'Türkiye',
          preferred_foot: p.preferred_foot || 'Sağ',
          profile_id: team.profile_id,
          team_name: team.name,
          club: team.name,
          defending: p.defending,
          passing: p.passing,
          shooting: p.shooting,
          speed: p.speed,
          power: p.power,
          goalkeeping: p.goalkeeping,
          heading: p.heading || 50,
          control: p.dribbling || 50,
          vision: p.vision || 50,
          stamina: p.stamina || 60,
          cond: p.cond || 85,
          form: p.form || 60,
          morale: p.morale || 65,
          confidence: p.confidence || 60,
          form_rating: p.form_rating || 50,
          traits: p.traits || [],
          neg_traits: p.negTraits || [],
          personality_traits: p.personalityTraits || [],
          trait_levels: p.traitLevels || {},
          style_levels: p.styleLevels || {},
          play_style: p.playStyle || null,
          archetype: p.archetype || null,
          match_ratings: [],
          contract_end_week: p.contract_end_week || 35,
          is_free_agent: false,
          // Detailed stats
          finishing: p.finishing || 50,
          dribbling: p.dribbling || 50,
          first_touch: p.firstTouch || 50,
          crossing: p.crossing || 50,
          marking: p.marking || 50,
          tackling: p.tackling || 50,
          technique: p.technique || 50,
          long_shots: p.longShots || 50,
          off_the_ball: p.offTheBall || 50,
          // Mental stats — now with proper variance from specificPositionMentalPriorities
          determination: p.determination || 50,
          concentration: p.concentration || 50,
          leadership: p.leadership || 30,
          anticipation: p.anticipation || 50,
          flair: p.flair || 20,
          positioning: p.positioning || 50,
          composure: p.composure || 50,
          teamwork: p.teamwork || 50,
          work_rate: p.workRate || 50,
          workrate: p.workRate || 50,
          aggression: p.aggression || 40,
          bravery: p.bravery || 40,
          decisions: p.decisions || 50,
          // Physical stats
          acceleration: p.acceleration || 50,
          agility: p.agility || 50,
          balance: p.balance || 50,
          strength: p.strength || 50,
          jumping: p.jumping || 50,
          left_foot: p.leftFoot || 50,
          right_foot: p.rightFoot || 50,
        }));

        // Insert in batches of 24
        const CHUNK_SIZE = 24;
        for (let i = 0; i < playersToInsert.length; i += CHUNK_SIZE) {
          const chunk = playersToInsert.slice(i, i + CHUNK_SIZE);
          const { error: insertError } = await supabase.from('players').insert(chunk);
          if (insertError) {
            errors.push(`Team ${team.name}: ${insertError.message}`);
            // Try individual inserts
            for (const player of chunk) {
              const { error: singleError } = await supabase.from('players').insert([player]);
              if (singleError) {
                errors.push(`Team ${team.name} player ${player.id}: ${singleError.message}`);
              } else {
                totalGenerated++;
              }
            }
          } else {
            totalGenerated += chunk.length;
          }
        }

        console.log(`[regenerate-players] ${team.name}: ${playersToInsert.length} players generated (tier ${tier})`);
      } catch (teamErr) {
        const msg = `Team ${team.name}: ${teamErr}`;
        errors.push(msg);
        console.error(`[regenerate-players] ${msg}`);
      }
    }

    // Verify counts
    const { count: newCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });

    // Sample mental stats to verify variance
    const { data: samplePlayers } = await supabase
      .from('players')
      .select('name, specific_position, rating, aggression, bravery, work_rate, decisions, determination, concentration, leadership, anticipation, flair, positioning, composure, teamwork')
      .limit(5);

    return NextResponse.json({
      success: true,
      teamsProcessed: teams.length,
      totalGenerated,
      totalInDB: newCount,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      samplePlayers: samplePlayers || null,
      message: `${teams.length} teams processed, ${totalGenerated} players generated with position-specific mental attributes.`,
    });
  } catch (err) {
    console.error('[regenerate-players] Critical error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
