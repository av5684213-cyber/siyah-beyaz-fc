/**
 * Cron Job: Haftalık Fans Dalgalanması + league_position + reputation
 *
 * Her hafta bir kez çalışır:
 * 1. Takım performansına göre hayran sayısında doğal artış/azalış simüle eder
 * 2. league_position'ı league_standings'ten günceller (GRUP 2.1)
 * 3. reputation'ı form + pozisyon bazında günceller (GRUP 2.2)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { processWeeklyFansFluctuation } from '@/lib/fm/xpLevelFansService';
import { createErrorResponse } from '@/lib/api-error-handler';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Vercel Hobby plan: günde 1 kez çalışır — sadece Pazartesi işle
  const dayOfWeek = new Date().getUTCDay(); // 0=Pazar, 1=Pazartesi
  if (dayOfWeek !== 1) {
    return NextResponse.json({ message: `Haftalık taraftar güncellemesi sadece Pazartesi yapılır (bugün: ${['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'][dayOfWeek]})`, skipped: true });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'No Supabase client' }, { status: 500 });
  }

  try {
    console.log('[cron/weekly-fans] Starting weekly fans fluctuation...');

    // 1. Fans fluctuation (mevcut sistem)
    const result = await processWeeklyFansFluctuation();

    // ═══════════════════════════════════════════════════════════════
    // GRUP 2.1: league_position'ı standings'ten güncelle
    // ═══════════════════════════════════════════════════════════════
    let positionsUpdated = 0;
    try {
      const { data: standingsData } = await supabase
        .from('league_standings')
        .select('team_id, points, gd, gf, league_id')
        .order('league_id', { ascending: true })
        .order('points', { ascending: false })
        .order('gd', { ascending: false });

      if (standingsData && standingsData.length > 0) {
        // Ligleri grupla ve her takımın liğindeki sırasını bul
        const leagueGroups: Record<string, typeof standingsData> = {};
        for (const s of standingsData) {
          const lid = s.league_id || 'unknown';
          if (!leagueGroups[lid]) leagueGroups[lid] = [];
          leagueGroups[lid].push(s);
        }

        // Her ligde sıralama zaten points/gd'ye göre geldi, pozisyon hesapla
        const positionByTeam: Record<string, number> = {};
        for (const [_, teams] of Object.entries(leagueGroups)) {
          for (let i = 0; i < teams.length; i++) {
            positionByTeam[teams[i].team_id] = i + 1;
          }
        }

        // league_teams'den profile_id bul, profiles.league_position güncelle
        for (const [teamId, position] of Object.entries(positionByTeam)) {
          try {
            const { data: team } = await supabase
              .from('league_teams')
              .select('profile_id')
              .eq('id', teamId)
              .maybeSingle();

            if (team?.profile_id) {
              await supabase.from('profiles')
                .update({ league_position: position })
                .eq('id', team.profile_id);
              positionsUpdated++;
            }
          } catch (teamErr) {
            // Tek takım hatası tüm süreci durdurmasın
          }
        }
        console.log(`[weekly-fans] Updated league_position for ${positionsUpdated} profiles`);
      }
    } catch (posErr) {
      console.warn('[weekly-fans] league_position update failed:', posErr);
    }

    // ═══════════════════════════════════════════════════════════════
    // GRUP 2.2: reputation'ı form + pozisyon bazında güncelle
    // ═══════════════════════════════════════════════════════════════
    let reputationUpdated = 0;
    try {
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, league_position, league_tier, reputation');

      if (allProfiles && allProfiles.length > 0) {
        for (const profile of allProfiles) {
          const position = profile.league_position || 10;
          const tier = profile.league_tier || 4;
          const currentRep = profile.reputation || 50;

          // Pozisyon bazlı reputation değişimi
          const positionEffect = position <= 3 ? +2
            : position <= 6 ? +1
            : position >= 15 ? -2
            : position >= 12 ? -1
            : 0;

          // Tier bonusu: üst liglerde daha fazla değişim
          const tierMult = tier === 1 ? 1.5
            : tier === 2 ? 1.2
            : 1.0;

          const repChange = Math.round(positionEffect * tierMult);
          const newRep = Math.min(100, Math.max(10, currentRep + repChange));

          if (Math.abs(newRep - currentRep) >= 1) {
            await supabase.from('profiles')
              .update({ reputation: newRep })
              .eq('id', profile.id);
            reputationUpdated++;
          }
        }
        console.log(`[weekly-fans] Updated reputation for ${reputationUpdated} profiles`);
      }
    } catch (repErr) {
      console.warn('[weekly-fans] reputation update failed:', repErr);
    }

    return NextResponse.json({
      action: 'weekly_fans_fluctuation',
      processed: result.processed,
      positionsUpdated,
      reputationUpdated,
      errors: result.errors.length > 0 ? result.errors.slice(0, 5) : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/weekly-fans', method: 'GET' });
  }
}
