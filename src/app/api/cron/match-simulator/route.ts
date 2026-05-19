/**
 * Cron Job: Maç Simülasyonu (ADIM 2D)
 *
 * Tüm maçları sunucu tarafında hesaplar.
 * Client'dan gelen sonuçlara güvenilmez - sadece bu API sonucu kaydeder.
 *
 * GET /api/cron/match-simulator
 * Header: x-cron-secret veya Query: ?secret=<CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { simulateEnhancedMatch } from '@/lib/fm/enhancedMatchEngine';
import { integratedMatchEngine } from '@/lib/fm/IntegratedMatchEngine';
import { applyCardSuspensions, applyMatchInjuries, saveMatchEvents } from '@/lib/fm/matchConsequencesService';
import { verifyCronSecret, sanitizeError } from '@/lib/fm/security';
import { pickRefereeForMatch, generateLeagueReferees, getRefereeDisplayInfo, type Referee } from '@/lib/fm/referee';

export const maxDuration = 300; // 5 dakika (Vercel limiti)

export async function GET(request: NextRequest) {
  // Cron secret doğrulama (fail-closed, header-only)
  const cronCheck = verifyCronSecret(request);
  if (!cronCheck.valid) {
    return NextResponse.json({ error: cronCheck.error }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client is null' }, { status: 500 });
  }

  const results: Array<{
    fixtureId: string;
    homeTeam: string;
    awayTeam: string;
    score: string;
  }> = [];
  const errors: string[] = [];

  try {
    console.log('[cron/match-simulator] Starting match simulation...');

    // 1. Oynanmamış ve bugüne denk gelen fikstürleri bul
    const today = new Date().toISOString().split('T')[0];

    const { data: pendingFixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id, home_team_id, away_team_id, tur, season_id, match_date')
      .eq('status', 'scheduled')
      .lte('match_date', today)
      .limit(20);

    if (fixturesError) {
      console.error('[cron/match-simulator] Error fetching fixtures:', fixturesError);
      return NextResponse.json({ error: fixturesError.message }, { status: 500 });
    }

    if (!pendingFixtures || pendingFixtures.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending fixtures to simulate',
        simulated: 0,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`[cron/match-simulator] Found ${pendingFixtures.length} pending fixtures`);

    // 2. Her fikstür için maç simülasyonu yap
    for (const fixture of pendingFixtures) {
      try {
        // Ev sahibi takımın oyuncularını çek
        const { data: homeTeamData } = await supabase
          .from('league_teams')
          .select('id, name, profile_id')
          .eq('id', fixture.home_team_id)
          .single();

        const { data: awayTeamData } = await supabase
          .from('league_teams')
          .select('id, name, profile_id')
          .eq('id', fixture.away_team_id)
          .single();

        if (!homeTeamData || !awayTeamData) {
          errors.push(`Fixture ${fixture.id}: Team data not found`);
          continue;
        }

        // Oyuncuları çek (cezalı ve sakat olanları da dahil et, motor filtreleyecek)
        const { data: homePlayers } = await supabase
          .from('players')
          .select('*')
          .eq('team_name', homeTeamData.name);

        const { data: awayPlayers } = await supabase
          .from('players')
          .select('*')
          .eq('team_name', awayTeamData.name);

        if (!homePlayers || homePlayers.length < 7 || !awayPlayers || awayPlayers.length < 7) {
          errors.push(`Fixture ${fixture.id}: Not enough players (${homePlayers?.length || 0} vs ${awayPlayers?.length || 0})`);
          continue;
        }

        // Cezalı ve sakat oyuncuları filtrele
        const todayDate = new Date().toISOString().split('T')[0];
        const filterAvailable = (players: any[]) => players.filter(p => {
          if (p.suspended_until && p.suspended_until >= todayDate) return false;
          if (p.is_injured) return false;
          if (p.injury) {
            try {
              const inj = typeof p.injury === 'string' ? JSON.parse(p.injury) : p.injury;
              if (inj.remaining_days > 0) return false;
            } catch {}
          }
          return true;
        });

        const availableHome = filterAvailable(homePlayers);
        const availableAway = filterAvailable(awayPlayers);

        if (availableHome.length < 7 || availableAway.length < 7) {
          errors.push(`Fixture ${fixture.id}: Not enough available players after filtering (${availableHome.length} vs ${availableAway.length})`);
          continue;
        }

        // ── EV SAHİBİ VE DEPLASMAN GERÇEK TAKTİKLERİNİ ÇEK (active_tactics tablosundan) ──
        let homeTacticsData: Record<string, any> | null = null;
        let awayTacticsData: Record<string, any> | null = null;

        try {
          if (homeTeamData.profile_id) {
            const { data: tHome } = await supabase
              .from('active_tactics')
              .select('*')
              .eq('profile_id', homeTeamData.profile_id)
              .maybeSingle();
            if (tHome) homeTacticsData = tHome;
          }
        } catch (err) {
          console.warn(`[cron/match-simulator] Ev sahibi taktik çekilemedi, default kullanılacak:`, err);
        }

        try {
          if (awayTeamData.profile_id) {
            const { data: tAway } = await supabase
              .from('active_tactics')
              .select('*')
              .eq('profile_id', awayTeamData.profile_id)
              .maybeSingle();
            if (tAway) awayTacticsData = tAway;
          }
        } catch (err) {
          console.warn(`[cron/match-simulator] Deplasman taktik çekilemedi, default kullanılacak:`, err);
        }

        // 3. Hakem ata (lig bazlı rotasyon)
        let refereeForMatch: Referee | null = null;
        try {
          // Sezonun league_id'sini bul (seasons.league_id = leagues.id)
          let actualLeagueId: string | null = null;
          if (fixture.season_id) {
            const { data: seasonData } = await supabase
              .from('seasons')
              .select('league_id')
              .eq('id', fixture.season_id)
              .maybeSingle();
            actualLeagueId = seasonData?.league_id || null;
          }

          // Lig hakemlerini çek (league_id UUID ile)
          let refereeList: Referee[] = [];
          if (actualLeagueId) {
            const { data: existingReferees } = await supabase
              .from('referees')
              .select('*')
              .eq('league_id', actualLeagueId);
            refereeList = (existingReferees as Referee[]) || [];
          }

          // Hakem yoksa, bu lig için oluştur
          if (refereeList.length === 0 && actualLeagueId) {
            refereeList = generateLeagueReferees(actualLeagueId, 6);
            // Kaydet
            for (const ref of refereeList) {
              await supabase.from('referees').upsert({
                id: ref.id,
                name: ref.name,
                personality: ref.personality,
                experience: ref.experience,
                league_id: ref.league_id,
                strictness: ref.strictness,
                total_matches: ref.totalMatches,
                total_yellows: ref.totalYellows,
                total_reds: ref.totalReds,
                total_penalties: ref.totalPenalties,
              });
            }
          }

          const matchWeek = fixture.tur || 1;
          refereeForMatch = pickRefereeForMatch(refereeList, matchWeek);
        } catch (refErr) {
          console.warn('[cron/match-simulator] Referee assignment failed, using defaults:', refErr);
        }

        const refInfo = refereeForMatch ? getRefereeDisplayInfo(refereeForMatch) : null;

        // 4. Simülasyonu çalıştır — YENİ ENHANCED & INTEGRATED MATCH ENGINE
        //
        // active_tactics tablosu gerçek kolonları:
        //   formation, starting_eleven, position_assignments, tempo (number 0-100),
        //   defense_line (text: 'standart'|'onde'|'geride'), play_width (text: 'genis'|'dar'|'normal'),
        //   mentality (number), pressing (boolean), passing_style (text),
        //   player_roles (jsonb), focus_player_id
        //
        const matchResult = await integratedMatchEngine.runScheduledMatch(
          availableHome.slice(0, 11), // İlk 11 oyuncuları
          availableAway.slice(0, 11),
          {
            homeTactics: {
              formation: homeTacticsData?.formation || '4-4-2',
              playStyle: (homeTacticsData?.defense_line === 'onde' ? 'hucum' : homeTacticsData?.defense_line === 'geride' ? 'savunma' : 'dengeli'),
              mentality: Number(homeTacticsData?.mentality || 3),
              pressing: homeTacticsData?.pressing || false,
              intensity: (Number(homeTacticsData?.tempo) > 70 ? 'yuksek' : Number(homeTacticsData?.tempo) < 30 ? 'dusuk' : 'normal'),
              passingStyle: homeTacticsData?.passing_style || 'Karışık',
              lineHeight: homeTacticsData?.defense_line === 'onde' ? 70 : homeTacticsData?.defense_line === 'geride' ? 30 : 50,
              width: homeTacticsData?.play_width === 'genis' ? 70 : homeTacticsData?.play_width === 'dar' ? 30 : 50,
              aggression: Number(homeTacticsData?.tempo) > 70 ? 70 : 50,
              passingIntensity: Number(homeTacticsData?.tempo) || 50,
              screenKeeper: false,
              wasteTime: false,
              parkTheBus: homeTacticsData?.defense_line === 'geride',
              crossGame: homeTacticsData?.play_width === 'genis',
              loneStrikerCounter: false,
              offsideTrap: homeTacticsData?.pressing || false,
            },
            activeTactic: {
              formation: homeTacticsData?.formation || '4-4-2',
              mentality: Number(homeTacticsData?.mentality || 3),
              pressing: homeTacticsData?.pressing || false,
              passingStyle: homeTacticsData?.passing_style || 'Karışık',
              intensity: (Number(homeTacticsData?.tempo) > 70 ? 'yuksek' : Number(homeTacticsData?.tempo) < 30 ? 'dusuk' : 'normal'),
              lineHeight: homeTacticsData?.defense_line === 'onde' ? 70 : homeTacticsData?.defense_line === 'geride' ? 30 : 50,
              width: homeTacticsData?.play_width === 'genis' ? 70 : homeTacticsData?.play_width === 'dar' ? 30 : 50,
              aggression: Number(homeTacticsData?.tempo) > 70 ? 70 : 50,
              passingIntensity: Number(homeTacticsData?.tempo) || 50,
              screenKeeper: false,
              wasteTime: false,
              parkTheBus: homeTacticsData?.defense_line === 'geride',
              crossGame: homeTacticsData?.play_width === 'genis',
              loneStrikerCounter: false,
              offsideTrap: homeTacticsData?.pressing || false,
              playStyle: (homeTacticsData?.defense_line === 'onde' ? 'hucum' : homeTacticsData?.defense_line === 'geride' ? 'savunma' : 'dengeli'),
              tempo: (Number(homeTacticsData?.tempo) > 70 ? 'hizli' : Number(homeTacticsData?.tempo) < 30 ? 'yavas' : 'normal'),
              defensiveLine: (homeTacticsData?.defense_line === 'onde' ? 'onde' : homeTacticsData?.defense_line === 'geride' ? 'geride' : 'normal'),
            } as any,
            homeOperations: [], // Gelecekteki operasyon kartları altyapısı
            homeTeamName: homeTeamData.name,
            awayTeamName: awayTeamData.name,
            isDerby: false, // Lig fikstür durumuna göre ileride true çekilebilir
            isBigMatch: false,
            stadiumUpgrades: {}, // Gelecekte kulüp stadyum tablosundan join edilebilir
          }
        );

        // Skor uyumluluğu: MatchResult.score.home/away → finalHomeScore/finalAwayScore
        const finalHomeScore = matchResult.score?.home ?? (matchResult as any).homeScore ?? 0;
        const finalAwayScore = matchResult.score?.away ?? (matchResult as any).awayScore ?? 0;

        // 4. Sonucu kaydet (hakem bilgisiyle)
        const { error: updateError } = await supabase
          .from('fixtures')
          .update({
            status: 'completed',
            home_score: finalHomeScore,
            away_score: finalAwayScore,
            referee_id: refereeForMatch?.id ?? null,
            referee_name: refereeForMatch?.name ?? null,
            referee_personality: refereeForMatch?.personality ?? null,
            referee_strictness: refereeForMatch?.strictness ?? null,
          })
          .eq('id', fixture.id);

        if (updateError) {
          errors.push(`Fixture ${fixture.id}: Failed to update result: ${updateError.message}`);
          continue;
        }

        // 5. Maç olaylarını kaydet
        await saveMatchEvents(fixture.id, matchResult.events);

        // 6. Kart cezalarını uygula (büyük/küçük harf uyumlu)
        const cardEvents = matchResult.events
          .filter((e: any) => {
            const t = (e.type || '').toLowerCase();
            return t === 'yellow_card' || t === 'yellow' || t === 'red_card' || t === 'red';
          })
          .map((e: any) => {
            const t = (e.type || '').toLowerCase();
            const normalizedType = (t === 'yellow_card' || t === 'yellow') ? 'yellow_card' : 'red_card';
            return { type: normalizedType, playerId: e.playerId || e.player, team: e.team };
          });

        if (cardEvents.length > 0) {
          await applyCardSuspensions(cardEvents);
        }

        // 7. Sakatlıkları uygula (büyük/küçük harf uyumlu + IntegratedMatchEngine direkt oyuncu injury desteği)
        const injuryEvents = matchResult.events
          .filter((e: any) => {
            const t = (e.type || '').toLowerCase();
            return t === 'injury';
          })
          .map((e: any) => ({ playerId: e.playerId || e.player, playerName: e.playerName || e.player }));

        if (injuryEvents.length > 0) {
          await applyMatchInjuries(injuryEvents);
        }

        // 7b. IntegratedMatchEngine sakatlıkları doğrudan oyuncu objelerine yazar (event değil)
        // Bu motor kullanıldığında sakat oyuncuları yakala ve DB'ye kaydet
        const allMatchPlayers = [...availableHome.slice(0, 11), ...availableAway.slice(0, 11)];
        const playersWithNewInjury = allMatchPlayers.filter((p: any) => {
          // Sadece maç sırasında yeni sakatlık alan oyuncuları yakala
          // homePlayers/awayPlayers çekilirken is_injured=false olanlar filtrelendi,
          // şimdi injury varsa → maç sırasında sakatlandı
          return p.injury && p.injury.remaining_days > 0;
        });

        if (playersWithNewInjury.length > 0) {
          const engineInjuryEvents = playersWithNewInjury.map((p: any) => ({
            playerId: p.id,
            playerName: p.name,
          }));
          await applyMatchInjuries(engineInjuryEvents);
          console.log(`[cron/match-simulator] ${playersWithNewInjury.length} oyuncu maç sırasında sakatlandı (IntegratedMatchEngine)`);
        }

        // 8. Lig puanlarını güncelle
        await updateLeagueStandings(supabase, fixture.season_id, homeTeamData.id, awayTeamData.id, finalHomeScore, finalAwayScore);

        // 9. Hakem istatistiklerini güncelle
        if (refereeForMatch) {
          const yellowCount = matchResult.events.filter((e: any) => {
            const t = (e.type || '').toLowerCase();
            return t === 'yellow_card' || t === 'yellow';
          }).length;
          const redCount = matchResult.events.filter((e: any) => {
            const t = (e.type || '').toLowerCase();
            return t === 'red_card' || t === 'red';
          }).length;
          const penaltyCount = matchResult.events.filter((e: any) => {
            const t = (e.type || '').toLowerCase();
            return t === 'penalty';
          }).length;
          await supabase.from('referees').update({
            total_matches: (refereeForMatch.totalMatches || 0) + 1,
            total_yellows: (refereeForMatch.totalYellows || 0) + yellowCount,
            total_reds: (refereeForMatch.totalReds || 0) + redCount,
            total_penalties: (refereeForMatch.totalPenalties || 0) + penaltyCount,
          }).eq('id', refereeForMatch.id);
        }

        results.push({
          fixtureId: fixture.id,
          homeTeam: homeTeamData.name,
          awayTeam: awayTeamData.name,
          score: `${finalHomeScore}-${finalAwayScore}`,
        });

        console.log(`[cron/match-simulator] ${homeTeamData.name} ${finalHomeScore}-${finalAwayScore} ${awayTeamData.name}`);

      } catch (err) {
        errors.push(`Fixture ${fixture.id}: ${err}`);
        console.error(`[cron/match-simulator] Error simulating fixture ${fixture.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      simulated: results.length,
      results,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error('[cron/match-simulator] Fatal error:', err);
    return NextResponse.json(
      { error: sanitizeError(err) },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// LİG PUAN TABLOSU GÜNCELLEME
// ═══════════════════════════════════════════════════════════════

async function updateLeagueStandings(
  supabase: any,
  seasonId: string,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number
): Promise<void> {
  try {
    // Ev sahibi takım puan durumu
    const { data: homeStanding } = await supabase
      .from('league_standings')
      .select('*')
      .eq('team_id', homeTeamId)
      .eq('season_id', seasonId)
      .single();

    if (homeStanding) {
      const updated = {
        played: (homeStanding.played || 0) + 1,
        won: (homeStanding.won || 0) + (homeScore > awayScore ? 1 : 0),
        drawn: (homeStanding.drawn || 0) + (homeScore === awayScore ? 1 : 0),
        lost: (homeStanding.lost || 0) + (homeScore < awayScore ? 1 : 0),
        gf: (homeStanding.gf || 0) + homeScore,
        ga: (homeStanding.ga || 0) + awayScore,
        points: (homeStanding.points || 0) + (homeScore > awayScore ? 3 : homeScore === awayScore ? 1 : 0),
      };
      await supabase.from('league_standings').update(updated).eq('id', homeStanding.id);
    }

    // Deplasman takım puan durumu
    const { data: awayStanding } = await supabase
      .from('league_standings')
      .select('*')
      .eq('team_id', awayTeamId)
      .eq('season_id', seasonId)
      .single();

    if (awayStanding) {
      const updated = {
        played: (awayStanding.played || 0) + 1,
        won: (awayStanding.won || 0) + (awayScore > homeScore ? 1 : 0),
        drawn: (awayStanding.drawn || 0) + (awayScore === homeScore ? 1 : 0),
        lost: (awayStanding.lost || 0) + (awayScore < homeScore ? 1 : 0),
        gf: (awayStanding.gf || 0) + awayScore,
        ga: (awayStanding.ga || 0) + homeScore,
        points: (awayStanding.points || 0) + (awayScore > homeScore ? 3 : awayScore === homeScore ? 1 : 0),
      };
      await supabase.from('league_standings').update(updated).eq('id', awayStanding.id);
    }
  } catch (err) {
    console.error('[cron/match-simulator] Error updating standings:', err);
  }
}
