/**
 * GET /api/cron/season-end
 * BİRLEŞTİRİLMİŞ sezon sonu cron'u.
 *
 * Eski season-end ve season-end-trigger cron'ları tek bir endpoint'te birleştirildi.
 * league_standings tablosunu birincil veri kaynağı olarak kullanır.
 *
 * Kontrol: Tüm takımlar played = 34 oldu mu?
 * Evetse:
 * 1. Şampiyonu, gol kralını, MVP'yi belirle (ödüller)
 * 2. Yükselme / düşme mekanizmasını uygula
 * 3. Oyuncuların yaşını 1 artır (yaşlanma)
 * 4. Emeklilik kontrolü (40+: kesin, 38-39: koşullu, 36-37: ağır koşullar)
 * 5. Yaşa bağlı yetenek düşüşü (31+ hız, 33+ pas/dayanıklılık)
 * 6. Gençlik akademisinden yeni oyuncular üret
 * 7. Hall of Fame güncelle
 * 8. Kiralık oyuncuları geri çağır
 * 9. Sponsorlukları temizle
 * 10. Yeni sezon oluştur (seasons + fixtures + standings)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { processPromotionRelegation } from '@/lib/fm/leagueHelpers';
import { createErrorResponse } from '@/lib/api-error-handler';
import { AWARD_LABELS, type AwardType } from '@/lib/fm/types';

export const maxDuration = 60;

const MATCHES_PER_SEASON = 34;

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    // ─── 1. Tüm liglerde sezon tamamlanma kontrolü ───
    // league_teams tablosunda played >= 34 olan tüm takımları bul
    const { data: leagueTeams, error: fetchError } = await supabase
      .from('league_teams')
      .select('league_id, played');

    if (fetchError) {
      console.error('[cron/season-end] Fetch error:', fetchError);
      return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }

    if (!leagueTeams || leagueTeams.length === 0) {
      return NextResponse.json({
        action: 'none',
        message: 'Lig takımı bulunamadı',
        timestamp: new Date().toISOString(),
      });
    }

    // Lig bazında grupla
    const leagueMap = new Map<string, { total: number; allPlayed: boolean }>();
    for (const team of leagueTeams) {
      const league = team.league_id || 'unknown';
      const played = team.played || 0;
      if (!leagueMap.has(league)) {
        leagueMap.set(league, { total: 0, allPlayed: true });
      }
      const entry = leagueMap.get(league)!;
      entry.total++;
      if (played < MATCHES_PER_SEASON) {
        entry.allPlayed = false;
      }
    }

    const completedLeagues: string[] = [];
    const incompleteLeagues: string[] = [];

    for (const [leagueId, data] of leagueMap) {
      if (data.allPlayed && data.total >= 2) {
        completedLeagues.push(leagueId);
      } else {
        // Ek kontrol: Bu ligdeki tüm scheduled fikstürler tamamlandı mı?
        // Hiç scheduled fikstür kalmamışsa sezon tamamlanmış sayılır
        try {
          const { count: pendingCount } = await supabase
            .from('fixtures')
            .select('id', { count: 'exact', head: true })
            .eq('season_id', leagueId)
            .eq('competition_type', 'league')
            .eq('status', 'scheduled');

          const allFixturesPlayed = (pendingCount ?? 0) === 0;
          if (allFixturesPlayed && data.total >= 2) {
            completedLeagues.push(leagueId);
          } else {
            incompleteLeagues.push(leagueId);
          }
        } catch {
          incompleteLeagues.push(leagueId);
        }
      }
    }

    if (completedLeagues.length === 0) {
      return NextResponse.json({
        action: 'none',
        message: 'Sezon henüz tamamlanmadı',
        incompleteLeagues,
        timestamp: new Date().toISOString(),
      });
    }

    // ─── 2. Tamamlanan ligler için sezon sonu işlemleri ───
    const results: Record<string, unknown>[] = [];

    for (const leagueId of completedLeagues) {
      try {
        const leagueResult = await processLeagueSeasonEnd(supabase, leagueId);
        results.push(leagueResult);
      } catch (err) {
        console.error(`[cron/season-end] Error processing league ${leagueId}:`, err);
        results.push({ league: leagueId, error: String(err) });
      }
    }

    // Logla
    try {
      await supabase.from('error_logs').insert({
        source: 'cron',
        level: 'info',
        message: `Sezon sonu: ${completedLeagues.length} lig işlendi`,
        context: { completedLeagues, results: results.length },
      });
    } catch {}

    return NextResponse.json({
      action: 'season_end_processed',
      completedLeagues,
      incompleteLeagues,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/season-end', method: 'GET' });
  }
}

/**
 * Bir lig için tüm sezon sonu işlemleri
 * league_standings tablosunu birincil veri kaynağı olarak kullanır.
 */
async function processLeagueSeasonEnd(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  leagueId: string
): Promise<Record<string, unknown>> {
  // Lig bilgisini al
  const { data: leagueInfo } = await supabase
    .from('leagues')
    .select('id, name, tier')
    .eq('id', leagueId)
    .single();

  const leagueName = leagueInfo?.name || leagueId;
  const leagueTier = leagueInfo?.tier || 4;

  // ─── 1. Lig sıralamasını al (league_standings üzerinden) ───
  const { data: standings } = await supabase
    .from('league_standings')
    .select('*, league_teams(name, profile_id)')
    .eq('league_id', leagueId)
    .order('points', { ascending: false });

  if (!standings || standings.length === 0) {
    return { league: leagueName, status: 'no_teams' };
  }

  const champion = standings[0];
  const championName = (champion as any).league_teams?.name || 'Bilinmiyor';
  const championProfileId = (champion as any).league_teams?.profile_id || null;
  const profileIds = standings
    .map((t: Record<string, unknown>) => (t.league_teams as any)?.profile_id)
    .filter(Boolean) as string[];

  // ─── 2. Şampiyonluk bildirimi ───
  if (championProfileId) {
    try {
      const { sendPushToProfile } = await import('@/lib/push-notifications');
      await sendPushToProfile(championProfileId, {
        title: 'ŞAMPİYONLUK! 🏆',
        body: `${championName} ligi birinci bitirdi! Bu unutulmaz bir an!`,
        icon: '/icon-192x192.png',
      });
    } catch (champNotifErr) {
      console.warn('[season-end] Champion notification error:', champNotifErr);
    }
  }

  // ─── 3. Oyuncu bazlı ödüller ───
  const { data: topScorer } = await supabase
    .from('players')
    .select('id, name, team_name, goals')
    .in('profile_id', profileIds.length > 0 ? profileIds : ['__none__'])
    .order('goals', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: mvpPlayer } = await supabase
    .from('players')
    .select('id, name, rating, team_name, form_rating, age, position, specific_position, assists, goals, yellow_cards, red_cards, matches_played, clean_sheets, morale, profile_id, rating_start_of_season')
    .in('profile_id', profileIds.length > 0 ? profileIds : ['__none__']);

  const seasonId = `S${new Date().getFullYear()}_auto`;
  const awards: Record<string, unknown>[] = [];

  // Şampiyon ödülü
  const championAward = {
    id: `award_${seasonId}_${leagueId}_champion`,
    season_id: seasonId,
    profile_id: championProfileId,
    league_name: leagueName,
    award_type: 'champion',
    team_name: championName,
    stat_value: champion.points as number,
    stat_detail: {
      points: champion.points,
      won: champion.won,
      gf: champion.goals_for,
      ga: champion.goals_against,
    },
  };
  awards.push(championAward);

  if (mvpPlayer && mvpPlayer.length > 0) {
    // Altın Krampon
    const topScorerPlayer = [...mvpPlayer].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      ((b.goals as number) || 0) - ((a.goals as number) || 0)
    )[0];
    if ((topScorerPlayer.goals as number) > 0) {
      awards.push({
        id: `award_${seasonId}_${leagueId}_golden_boot`,
        season_id: seasonId,
        profile_id: topScorerPlayer.profile_id,
        league_name: leagueName,
        award_type: 'golden_boot',
        player_id: topScorerPlayer.id,
        player_name: topScorerPlayer.name,
        team_name: topScorerPlayer.team_name,
        stat_value: topScorerPlayer.goals,
      });
    }

    // Asist Kralı
    const topAssister = [...mvpPlayer].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      ((b.assists as number) || 0) - ((a.assists as number) || 0)
    )[0];
    if ((topAssister.assists as number) > 0) {
      awards.push({
        id: `award_${seasonId}_${leagueId}_top_assists`,
        season_id: seasonId,
        profile_id: topAssister.profile_id,
        league_name: leagueName,
        award_type: 'top_assists',
        player_id: topAssister.id,
        player_name: topAssister.name,
        team_name: topAssister.team_name,
        stat_value: topAssister.assists,
      });
    }

    // MVP
    const mvp = [...mvpPlayer].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      ((b.form_rating as number) || 0) - ((a.form_rating as number) || 0)
    )[0];
    awards.push({
      id: `award_${seasonId}_${leagueId}_mvp`,
      season_id: seasonId,
      profile_id: mvp.profile_id,
      league_name: leagueName,
      award_type: 'mvp',
      player_id: mvp.id,
      player_name: mvp.name,
      team_name: mvp.team_name,
      stat_value: mvp.form_rating || 0,
    });

    // En İyi Kaleci
    const goalkeepers = mvpPlayer.filter((p: Record<string, unknown>) => p.position === 'GK');
    if (goalkeepers.length > 0) {
      const bestGk = [...goalkeepers].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        ((b.clean_sheets as number) || 0) - ((a.clean_sheets as number) || 0)
      )[0];
      awards.push({
        id: `award_${seasonId}_${leagueId}_best_gk`,
        season_id: seasonId,
        profile_id: bestGk.profile_id,
        league_name: leagueName,
        award_type: 'best_gk',
        player_id: bestGk.id,
        player_name: bestGk.name,
        team_name: bestGk.team_name,
        stat_value: bestGk.clean_sheets || 0,
      });
    }

    // En İyi Genç (U21)
    const youngPlayers = mvpPlayer.filter((p: Record<string, unknown>) => (p.age as number) <= 21);
    if (youngPlayers.length > 0) {
      const bestYoung = [...youngPlayers].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        ((b.form_rating as number) || 0) - ((a.form_rating as number) || 0)
      )[0];
      awards.push({
        id: `award_${seasonId}_${leagueId}_best_young`,
        season_id: seasonId,
        profile_id: bestYoung.profile_id,
        league_name: leagueName,
        award_type: 'best_young',
        player_id: bestYoung.id,
        player_name: bestYoung.name,
        team_name: bestYoung.team_name,
        stat_value: bestYoung.form_rating || 0,
      });
    }

    // Fair Play
    const fairPlay = [...mvpPlayer].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const scoreA = ((a.yellow_cards as number) || 0) + ((a.red_cards as number) || 0) * 3;
      const scoreB = ((b.yellow_cards as number) || 0) + ((b.red_cards as number) || 0) * 3;
      return scoreA - scoreB;
    })[0];
    if ((fairPlay.matches_played as number) >= 10) {
      awards.push({
        id: `award_${seasonId}_${leagueId}_fair_play`,
        season_id: seasonId,
        profile_id: fairPlay.profile_id,
        league_name: leagueName,
        award_type: 'fair_play',
        player_id: fairPlay.id,
        player_name: fairPlay.name,
        team_name: fairPlay.team_name,
        stat_value: ((fairPlay.yellow_cards as number) || 0) + ((fairPlay.red_cards as number) || 0) * 3,
      });
    }
  }

  // ─── YENİ ÖDÜLLER: most_improved, unsung_hero, fan_favorite, best_11 ───
  if (mvpPlayer && mvpPlayer.length > 0) {
    // ─── En Çok Gelişen Oyuncu ───
    // Sezon başındaki rating ile şu anki rating farkı en büyük olan (U25)
    const improvedPlayers = mvpPlayer.filter((p: Record<string, unknown>) =>
      ((p.age as number) || 30) <= 25 && ((p.rating_start_of_season as number) || 0) > 0
    );
    if (improvedPlayers.length > 0) {
      const mostImproved = [...improvedPlayers].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        (((b.rating as number) || 0) - ((b.rating_start_of_season as number) || (b.rating as number) || 0)) -
        (((a.rating as number) || 0) - ((a.rating_start_of_season as number) || (a.rating as number) || 0))
      )[0];
      const improvement = ((mostImproved.rating as number) || 0) - ((mostImproved.rating_start_of_season as number) || (mostImproved.rating as number) || 0);
      if (improvement > 0) {
        awards.push({
          id: `award_${seasonId}_${leagueId}_most_improved`,
          season_id: seasonId,
          profile_id: mostImproved.profile_id,
          league_name: leagueName,
          award_type: 'most_improved',
          player_id: mostImproved.id,
          player_name: mostImproved.name,
          team_name: mostImproved.team_name,
          stat_value: improvement,
          stat_detail: { start: mostImproved.rating_start_of_season, end: mostImproved.rating, diff: improvement },
        });
      }
    }

    // ─── Görünmez Kahraman (Unsung Hero) ───
    // DEF veya DM pozisyonu, gol+asist < 3, ama avg_rating >= 65
    const defensivePlayers = mvpPlayer.filter((p: Record<string, unknown>) =>
      ['CB', 'LB', 'RB', 'CDM', 'DEF'].includes((p.position as string) || '') &&
      (((p.goals as number) || 0) + ((p.assists as number) || 0)) < 3 &&
      ((p.form_rating as number) || 0) >= 65
    );
    if (defensivePlayers.length > 0) {
      const unsungHero = [...defensivePlayers].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        ((b.form_rating as number) || 0) - ((a.form_rating as number) || 0)
      )[0];
      awards.push({
        id: `award_${seasonId}_${leagueId}_unsung_hero`,
        season_id: seasonId,
        profile_id: unsungHero.profile_id,
        league_name: leagueName,
        award_type: 'unsung_hero',
        player_id: unsungHero.id,
        player_name: unsungHero.name,
        team_name: unsungHero.team_name,
        stat_value: (unsungHero.form_rating as number) || 0,
      });
    }

    // ─── Taraftarın Sevgilisi ───
    // En yüksek morale'e sahip, gol+asist >= 2 olan oyuncu
    const fanFavs = mvpPlayer.filter((p: Record<string, unknown>) =>
      ((p.morale as number) || 0) >= 75 &&
      (((p.goals as number) || 0) + ((p.assists as number) || 0)) >= 2
    );
    if (fanFavs.length > 0) {
      const fanFav = [...fanFavs].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        (((b.morale as number) || 0) * 0.3 + ((b.goals as number) || 0) * 2 + ((b.assists as number) || 0)) -
        (((a.morale as number) || 0) * 0.3 + ((a.goals as number) || 0) * 2 + ((a.assists as number) || 0))
      )[0];
      awards.push({
        id: `award_${seasonId}_${leagueId}_fan_favorite`,
        season_id: seasonId,
        profile_id: fanFav.profile_id,
        league_name: leagueName,
        award_type: 'fan_favorite',
        player_id: fanFav.id,
        player_name: fanFav.name,
        team_name: fanFav.team_name,
        stat_value: (fanFav.morale as number) || 0,
      });
    }

    // ─── Yılın En İyi 11'i (PROMPT 3) ───
    const POSITION_SLOTS: Record<string, string[]> = {
      GK:  ['GK'],
      RB:  ['RB', 'LB'],
      CB1: ['CB'],
      CB2: ['CB'],
      LB:  ['LB', 'RB'],
      CDM: ['CDM', 'CM'],
      CM:  ['CM', 'CDM', 'CAM'],
      CAM: ['CAM', 'CM'],
      RW:  ['RW', 'LW', 'ST'],
      ST:  ['ST', 'CF'],
      LW:  ['LW', 'RW', 'ST'],
    };

    const usedPlayerIds = new Set<string>();
    const best11: { slot: string; player: Record<string, unknown> }[] = [];

    for (const [slot, positions] of Object.entries(POSITION_SLOTS)) {
      const candidates = mvpPlayer.filter((p: Record<string, unknown>) =>
        positions.includes((p.position as string) || (p.specific_position as string) || '') && !usedPlayerIds.has(p.id as string)
      );
      if (candidates.length > 0) {
        const best = [...candidates].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
          ((b.form_rating as number) || 0) - ((a.form_rating as number) || 0)
        )[0];
        usedPlayerIds.add(best.id as string);
        best11.push({ slot, player: best });
      }
    }

    if (best11.length >= 8) {
      const best11Detail = best11.reduce((obj: Record<string, unknown>, { slot, player }) => {
        obj[slot] = {
          id: player.id,
          name: player.name,
          position: player.position || player.specific_position,
          rating: player.form_rating,
        };
        return obj;
      }, {} as Record<string, unknown>);
      awards.push({
        id: `award_${seasonId}_${leagueId}_best_11`,
        season_id: seasonId,
        profile_id: championProfileId || null,
        league_name: leagueName,
        award_type: 'best_11',
        team_name: leagueName,
        stat_value: best11.length,
        stat_detail: best11Detail,
      });
    }
  }

  // ─── 4. Ödülleri kaydet ───
  for (const award of awards) {
    try {
      await supabase.from('season_awards').upsert(award);
    } catch (err) {
      console.warn('[season-end] Award insert error:', err);
    }
  }

  // ─── 4b. Ödül kazanan profillere bildirim gönder ───
  const profilesWithAwards = new Set(awards.map(a => a.profile_id).filter(Boolean) as string[]);
  for (const awardProfileId of profilesWithAwards) {
    const profileAwards = awards.filter(a => a.profile_id === awardProfileId);
    const awardNames = profileAwards.map(a => {
      const label = AWARD_LABELS[a.award_type as AwardType];
      return label ? label.title : a.award_type;
    }).join(', ');

    try {
      await supabase.from('notifications').insert({
        profile_id: awardProfileId,
        title: '🏆 Sezon Ödülü Kazandınız!',
        body: `Bu sezon şu ödülleri aldınız: ${awardNames}. Ödül kabinizi ziyaret edin!`,
        type: 'season_award',
        is_read: false,
      });
    } catch (notifErr) {
      console.warn('[season-end] Award notification error:', notifErr);
    }
  }

  // ─── 5. Hall of Fame güncelle ───
  const goldenBoot = awards.find(a => a.award_type === 'golden_boot');
  const topAssistsAward = awards.find(a => a.award_type === 'top_assists');
  const mvpAward = awards.find(a => a.award_type === 'mvp');

  const hofEntry = {
    id: `hof_${seasonId}_${leagueId}`,
    season_id: seasonId,
    league_name: leagueName,
    champion_team: championName,
    champion_profile_id: championProfileId,
    golden_boot_player: (goldenBoot?.player_name as string) || '',
    golden_boot_goals: (goldenBoot?.stat_value as number) || 0,
    top_assists_player: (topAssistsAward?.player_name as string) || '',
    top_assists_value: (topAssistsAward?.stat_value as number) || 0,
    mvp_player: (mvpAward?.player_name as string) || '',
  };

  try {
    await supabase.from('hall_of_fame').upsert(hofEntry);
  } catch (err) {
    console.warn('[season-end] HoF upsert error:', err);
  }

  // ─── 6. Şampiyon rozeti ekle ───
  if (championProfileId) {
    try {
      const { data: champProfData } = await supabase
        .from('profiles')
        .select('badges')
        .eq('id', championProfileId)
        .single();

      const existingBadges = Array.isArray(champProfData?.badges) ? champProfData.badges : [];
      const seasonLabel = `champion_${leagueName.replace(/\s+/g, '_')}`;
      if (!existingBadges.includes(seasonLabel)) {
        await supabase
          .from('profiles')
          .update({ badges: [...existingBadges, seasonLabel] })
          .eq('id', championProfileId);
      }
    } catch (badgeErr) {
      console.warn('[season-end] Champion badge error:', badgeErr);
    }
  }

  // ─── 7. Kiralık oyuncuları geri çağır ───
  try {
    const { data: activeLoans } = await supabase
      .from('loans')
      .select('id, player_id')
      .eq('status', 'active');

    if (activeLoans && activeLoans.length > 0) {
      await supabase.from('loans').update({ status: 'completed' }).eq('status', 'active');
      for (const loan of activeLoans) {
        try {
          await supabase
            .from('players')
            .update({
              loan_status: null,
              loaned_to_profile_id: null,
              loan_end_date: null,
              is_on_loan_market: false,
            })
            .eq('id', loan.player_id);
        } catch { /* ignore column errors */ }
      }
    }
  } catch (err) {
    console.warn('[season-end] Loan return error:', err);
  }

  // ─── 8. Süresi dolan sponsorlukları sonlandır ───
  try {
    await supabase
      .from('team_sponsorships')
      .update({ status: 'expired' })
      .lt('remaining_rounds', 1)
      .eq('status', 'active');
  } catch (err) {
    console.warn('[season-end] Sponsorship cleanup error:', err);
  }

  // ─── 9. YÜKSELME / DÜŞME ───
  const { data: currentSeason } = await supabase
    .from('seasons')
    .select('id')
    .eq('league_id', leagueId)
    .eq('is_finished', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let promotionRelegationResult = null;
  if (currentSeason) {
    try {
      promotionRelegationResult = await processPromotionRelegation(supabase, leagueId, currentSeason.id);
    } catch (prErr) {
      console.error(`[season-end] Promotion/Relegation error for ${leagueName}:`, prErr);
      promotionRelegationResult = { error: String(prErr) };
    }

    // Sezonu tamamlandı olarak işaretle
    await supabase
      .from('seasons')
      .update({ is_finished: true, status: 'completed' })
      .eq('id', currentSeason.id);
  }

  // ─── 10. Sezon sonu bildirimi ───
  try {
    const { data: allPushSubs } = await supabase
      .from('push_subscriptions')
      .select('profile_id');

    if (allPushSubs && allPushSubs.length > 0) {
      const { sendPushToProfile } = await import('@/lib/push-notifications');
      const uniqueProfileIds = [...new Set(allPushSubs.map((s: any) => s.profile_id).filter(Boolean))];
      for (const profileId of uniqueProfileIds) {
        try {
          await sendPushToProfile(profileId, {
            title: 'Sezon Sona Erdi!',
            body: `${championName} şampiyon oldu! Yeni sezon başlıyor.`,
            icon: '/icon-192x192.png',
          });
        } catch {}
      }
    }
  } catch (notifErr) {
    console.warn('[season-end] Push notification error:', notifErr);
  }

  // ─── 11. League history arşivi ───
  try {
    await supabase.from('league_history').insert({
      league_id: leagueId,
      season_id: currentSeason?.id,
      season_name: leagueName,
      champion_team_id: champion.team_id,
      champion_team_name: championName,
      top_scorer_id: topScorer?.id || null,
      top_scorer_name: topScorer?.name || null,
      mvp_id: (mvpAward?.player_id as string) || null,
      mvp_name: (mvpAward?.player_name as string) || null,
      completed_at: new Date().toISOString(),
    });
  } catch (histErr) {
    console.warn('[season-end] League history insert error:', histErr);
  }

  // ─── 12. Lig puanlarını sıfırla ───
  for (const team of standings) {
    await supabase
      .from('league_teams')
      .update({
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        points: 0,
      })
      .eq('id', team.team_id as string);
  }

  // ─── 13. Oyuncu istatistiklerini sıfırla ───
  for (const pid of profileIds) {
    const { data: oldPlayers } = await supabase
      .from('players')
      .select('id, goals, assists, yellow_cards, red_cards, matches_played, clean_sheets')
      .eq('profile_id', pid as string);

    if (oldPlayers) {
      for (const p of oldPlayers) {
        try {
          await supabase.from('season_stats').insert({
            player_id: p.id,
            season_id: seasonId,
            goals: p.goals || 0,
            assists: p.assists || 0,
            yellow_cards: p.yellow_cards || 0,
            red_cards: p.red_cards || 0,
            matches_played: p.matches_played || 0,
            clean_sheets: p.clean_sheets || 0,
          });
        } catch { /* ignore duplicate */ }
      }
    }

    // Save rating_start_of_season snapshot for "most_improved" award tracking
    const { data: currentRatings } = await supabase
      .from('players')
      .select('id, rating')
      .eq('profile_id', pid as string);

    await supabase
      .from('players')
      .update({
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        season_yellow_cards: 0,
        red_cards: 0,
        matches_played: 0,
        clean_sheets: 0,
        suspended_until: null,
        is_injured: false,
        injury_end_date: null,
      })
      .eq('profile_id', pid as string);

    // Set rating_start_of_season for each player (for next season's "most_improved" award)
    if (currentRatings && currentRatings.length > 0) {
      for (const p of currentRatings) {
        try {
          await supabase
            .from('players')
            .update({ rating_start_of_season: p.rating || 0 })
            .eq('id', p.id);
        } catch {}
      }
    }
  }

  // ─── 14. TÜM OYUNCULARIN YAŞINI 1 ARTIR ───
  try {
    // Önce RPC fonksiyonunu dene (en verimli yol)
    const { error: rpcError } = await supabase.rpc('increment_player_ages');
    if (!rpcError) {
      console.log('[season-end] Yaşlandırma: RPC ile tüm oyuncuların yaşı 1 artırıldı');
    } else {
      // RPC yoksa batch update yap (her 100 oyuncuda bir)
      const { data: allPlayers, error: fetchPlayersErr } = await supabase
        .from('players')
        .select('id, age')
        .not('age', 'is', null);

      if (!fetchPlayersErr && allPlayers && allPlayers.length > 0) {
        const updates = allPlayers.map(p => ({
          id: p.id,
          age: (p.age || 0) + 1,
        }));
        // Batch upsert: her 100 oyuncuda bir
        for (let i = 0; i < updates.length; i += 100) {
          const batch = updates.slice(i, i + 100);
          await supabase.from('players').upsert(batch, { onConflict: 'id' });
        }
        console.log(`[season-end] Yaşlandırma: ${allPlayers.length} oyuncunun yaşı 1 artırıldı (batch)`);
      }
    }
  } catch (ageErr) {
    console.warn('[season-end] Yaşlandırma hatası:', ageErr);
  }

  // ─── 14b. EMEKLİLİK İŞLEME ───
  // 40+ yaş: kesin emeklilik, 38-39: koşullu emeklilik
  try {
    // 40+ yaşındaki oyuncuları emekli et (is_retiring = true)
    const { data: retiringPlayers, error: retireErr } = await supabase
      .from('players')
      .update({ is_retiring: true })
      .gte('age', 40)
      .eq('is_retiring', false)
      .select('id, name, age, profile_id, position, team_name');

    if (!retireErr && retiringPlayers && retiringPlayers.length > 0) {
      console.log(`[season-end] Emeklilik: ${retiringPlayers.length} oyuncu emekli oldu (40+ yaş)`);

      // Emekli olan oyuncuların yerine genç yetenek üret
      const { generateStarterPlayer } = await import('@/lib/fm/playerGenerator');
      const profileGroups: Record<string, typeof retiringPlayers> = {};
      for (const rp of retiringPlayers) {
        const pid = rp.profile_id || '__none__';
        if (!profileGroups[pid]) profileGroups[pid] = [];
        profileGroups[pid].push(rp);
      }

      for (const [profileId, retired] of Object.entries(profileGroups)) {
        if (profileId === '__none__') continue;
        for (const retiredPlayer of retired) {
          try {
            const pos = retiredPlayer.position || 'MID';
            const talent = generateStarterPlayer(pos as any);
            const newPlayer = {
              id: `talent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: talent.name,
              position: talent.position,
              specific_position: talent.specific_position,
              rating: talent.rating,
              potential: talent.potential,
              hidden_potential: talent.hidden_potential,
              age: 17 + Math.floor(Math.random() * 3), // 17-19 yaş arası
              profile_id: profileId,
              team_name: retiredPlayer.team_name,
              is_free_agent: false,
              is_retiring: false,
              speed: talent.speed,
              power: talent.power,
              passing: talent.passing,
              shooting: talent.shooting,
              defending: talent.defending,
              vision: talent.vision,
              control: talent.control,
              heading: talent.heading,
              goalkeeping: talent.goalkeeping || 10,
              cond: 100,
              form: 60,
              morale: 70,
              confidence: 60,
              chemistry: 50,
              market_value: talent.market_value || 0,
              salary: talent.salary || 0,
            };
            await supabase.from('players').insert(newPlayer);
          } catch (talentErr) {
            console.warn(`[season-end] Yetenek üretme hatası:`, talentErr);
          }
        }
      }
    }

    // 38-39 yaş: düşük moral/sakatlık durumunda emeklilik
    const { data: oldPlayers38, error: old38Err } = await supabase
      .from('players')
      .select('id, name, age, profile_id, morale, form, injury, injury_history')
      .gte('age', 38)
      .lt('age', 40)
      .eq('is_retiring', false);

    if (!old38Err && oldPlayers38 && oldPlayers38.length > 0) {
      const toRetire38: string[] = [];
      for (const p of oldPlayers38) {
        const morale = p.morale ?? 60;
        const form = p.form ?? 50;
        const injury = p.injury as any;
        const hasChronicInjury = injury?.type === 'chronic';
        const injuryHistory = p.injury_history as any[] || [];
        const severeInjuries = injuryHistory.filter((i: any) => (i.duration_days || 0) >= 10).length;

        let shouldRetire = false;
        if (hasChronicInjury) shouldRetire = true;
        else if (morale < 30) shouldRetire = true;
        else if (form < 30 && severeInjuries >= 2) shouldRetire = true;
        else if (Math.random() < 0.4) shouldRetire = true; // %40 rastgele

        if (shouldRetire) toRetire38.push(p.id);
      }

      if (toRetire38.length > 0) {
        await supabase
          .from('players')
          .update({ is_retiring: true })
          .in('id', toRetire38);
        console.log(`[season-end] Emeklilik: ${toRetire38.length} oyuncu emekli oldu (38-39 yaş, koşullu)`);
      }
    }

    // 36-37 yaş: çok kötü koşullarda erken emeklilik
    const { data: oldPlayers36, error: old36Err } = await supabase
      .from('players')
      .select('id, name, age, profile_id, morale, form, injury, injury_history')
      .gte('age', 36)
      .lt('age', 38)
      .eq('is_retiring', false);

    if (!old36Err && oldPlayers36 && oldPlayers36.length > 0) {
      const toRetire36: string[] = [];
      for (const p of oldPlayers36) {
        const morale = p.morale ?? 60;
        const form = p.form ?? 50;
        const injury = p.injury as any;
        const hasChronicInjury = injury?.type === 'chronic';
        const injuryHistory = p.injury_history as any[] || [];
        const severeInjuries = injuryHistory.filter((i: any) => (i.duration_days || 0) >= 10).length;

        let shouldRetire = false;
        if (hasChronicInjury && morale < 25 && form < 25) shouldRetire = true;
        if (severeInjuries >= 4 && morale < 20) shouldRetire = true;

        if (shouldRetire) toRetire36.push(p.id);
      }

      if (toRetire36.length > 0) {
        await supabase
          .from('players')
          .update({ is_retiring: true })
          .in('id', toRetire36);
        console.log(`[season-end] Erken emeklilik: ${toRetire36.length} oyuncu (36-37 yaş, ağır koşullar)`);
      }
    }

    // Emekli oyuncuları takımdan kaldır (is_free_agent = true, takım ilişkisini kes)
    const { error: freeAgentErr } = await supabase
      .from('players')
      .update({
        is_free_agent: true,
        team_name: null,
        profile_id: null,
        is_on_loan_market: false,
        loan_status: null,
      })
      .eq('is_retiring', true);

    if (freeAgentErr) {
      console.warn('[season-end] Emekli oyuncu temizleme hatası:', freeAgentErr);
    }
  } catch (retirementErr) {
    console.warn('[season-end] Emeklilik işleme hatası:', retirementErr);
  }

  // ─── 14c. YAŞA BAĞLI YETENEK DÜŞÜŞÜ ───
  // 31+ hız düşüşü, 33+ pas düşüşü
  try {
    // 31+ yaş: hız düşüşü (-1 hız, -1 çabukluk)
    const { data: oldSpeed } = await supabase
      .from('players')
      .select('id, speed, acceleration, age')
      .gte('age', 31)
      .eq('is_retiring', false);

    if (oldSpeed && oldSpeed.length > 0) {
      for (const p of oldSpeed) {
        const decay = Math.max(1, Math.floor((p.age - 30) / 2)); // 31→1, 33→1, 34→2, 36→3
        const newSpeed = Math.max(20, (p.speed || 50) - decay);
        const newAccel = Math.max(20, (p.acceleration || 50) - decay);
        await supabase
          .from('players')
          .update({ speed: newSpeed, acceleration: newAccel })
          .eq('id', p.id);
      }
      console.log(`[season-end] Yaş düşüşü: ${oldSpeed.length} oyuncunun hızı azaltıldı (31+ yaş)`);
    }

    // 33+ yaş: pas ve dayanıklılık düşüşü
    const { data: oldPassing } = await supabase
      .from('players')
      .select('id, passing, stamina, age')
      .gte('age', 33)
      .eq('is_retiring', false);

    if (oldPassing && oldPassing.length > 0) {
      for (const p of oldPassing) {
        const decay = Math.max(1, Math.floor((p.age - 32) / 3)); // 33→0→1, 35→1, 36→1, 38→2
        const newPassing = Math.max(20, (p.passing || 50) - decay);
        const newStamina = Math.max(20, (p.stamina || 50) - decay);
        await supabase
          .from('players')
          .update({ passing: newPassing, stamina: newStamina })
          .eq('id', p.id);
      }
      console.log(`[season-end] Yaş düşüşü: ${oldPassing.length} oyuncunun pas/dayanıklılığı azaltıldı (33+ yaş)`);
    }
  } catch (decayErr) {
    console.warn('[season-end] Yaşa bağlı yetenek düşüşü hatası:', decayErr);
  }

  // ─── 14d. Gençlik akademisinden yeni oyuncular üret ───
  try {
    const { generateYouthPlayersForAllTeams } = await import('@/lib/fm/youthAcademySeasonSync');
    const youthResult = await generateYouthPlayersForAllTeams(supabase);
    console.log(`[season-end] Youth academy: ${youthResult.totalGenerated} genç oyuncu üretildi`);
  } catch (youthErr) {
    console.warn('[season-end] Youth academy generation error:', youthErr);
  }

  // ─── 15. Yeni sezon oluştur ───
  try {
    const { getTomorrowNoon } = await import('@/lib/fm/league');
    const seasonStart = getTomorrowNoon();

    const { data: newSeason } = await supabase
      .from('seasons')
      .insert({
        league_id: leagueId,
        year: new Date().getFullYear(),
        start_date: seasonStart.toISOString().split('T')[0],
        current_tur: 1,
        is_finished: false,
        status: 'active',
      })
      .select()
      .single();

    if (newSeason) {
      // Fikstür oluştur
      try {
        await supabase.rpc('generate_league_fixtures', { p_season_id: newSeason.id });
      } catch (fixErr) {
        console.warn(`[season-end] Fikstür oluşturma hatası:`, fixErr);
      }

      // Standings oluştur
      const { data: currentTeams } = await supabase
        .from('league_teams')
        .select('id')
        .eq('league_id', leagueId);

      if (currentTeams) {
        const standingsRows = currentTeams.map((t: any) => ({
          season_id: newSeason.id,
          team_id: t.id,
          league_id: leagueId,
          played: 0, won: 0, drawn: 0, lost: 0,
          gf: 0, ga: 0, gd: 0, points: 0,
        }));
        await supabase.from('league_standings').insert(standingsRows);
      }

      // Hakem ata
      try {
        const { assignRefereesToSeason } = await import('@/lib/fm/referee');
        await assignRefereesToSeason(supabase, leagueId, newSeason.id);
      } catch {}
    }
  } catch (newSeasonErr) {
    console.error(`[season-end] Yeni sezon oluşturma hatası:`, newSeasonErr);
  }

  // ─── 16. KUPA BAŞLATMA ───────────────────────────────────────────────
  // Sezon sonu işlemleri tamamlandıktan sonra, bu lig için aktif bir kupa
  // yoksa yeni bir kupa turnuvası başlat.
  try {
    // 1) Bu lig için aktif veya yaklaşan bir kupa var mı?
    const { data: existingCup } = await supabase
      .from('cup_seasons')
      .select('id')
      .eq('league_id', leagueId)
      .in('status', ['active', 'upcoming'])
      .limit(1)
      .maybeSingle();

    if (!existingCup) {
      // 2) Ligdeki tüm takım isimlerini çek (profil ID olsun ya da olmasın)
      const { data: leagueTeamNames } = await supabase
        .from('league_teams')
        .select('name')
        .eq('league_id', leagueId);

      if (leagueTeamNames && leagueTeamNames.length >= 2) {
        const teamNames = leagueTeamNames
          .map((t: Record<string, unknown>) => t.name as string)
          .filter(Boolean);

        if (teamNames.length >= 2) {
          // 3) cupSystem.ts'den generateCupDraw ve CUP_DEFINITIONS import et
          const { generateCupDraw, CUP_DEFINITIONS } = await import('@/lib/fm/cupSystem');

          // 'ulusal_kupa' veya ilk tanımlı kupayı seç
          const cupDef = CUP_DEFINITIONS.find(c => c.id === 'turkiye_kupasi') || CUP_DEFINITIONS[0];

          if (cupDef) {
            const cupSeason = generateCupDraw(teamNames, cupDef);

            // 4) CupSeason nesnesini cup_seasons tablosuna upsert et
            await supabase.from('cup_seasons').upsert({
              profile_id: championProfileId,
              team_name: championName,
              name: cupSeason.name,
              season: seasonId,
              cup_id: cupSeason.cupId,
              year: cupSeason.year,
              type: cupSeason.type,
              start_date: cupSeason.rounds[0]?.startDate || new Date().toISOString().slice(0, 10),
              end_date: cupSeason.rounds[cupSeason.rounds.length - 1]?.endDate || null,
              status: 'active',
              league_id: leagueId,
              is_completed: false,
              winner: null,
              runner_up: null,
              current_round: cupSeason.currentRound,
              max_rounds: cupSeason.rounds.length,
              prize_money: cupSeason.prizeMoney,
              champion_reward: cupSeason.championReward,
              data: cupSeason as any,
            }, { onConflict: 'id' });

            console.log(`[season-end] Kupa başlatıldı: ${cupSeason.name} — ${teamNames.length} takım, ${cupDef.rounds.length} tur`);
          }
        }
      }
    } else {
      console.log(`[season-end] Lig ${leagueName} için aktif kupa zaten var, atlanıyor`);
    }
  } catch (cupErr) {
    // 5) Hata olursa console.warn ile logla, sezon sonu işlemini durdurma
    console.warn(`[season-end] Kupa başlatma hatası (${leagueName}):`, cupErr);
  }

  return {
    league: leagueName,
    tier: leagueTier,
    status: 'completed',
    awards_count: awards.length,
    champion: championName,
    promotionRelegation: promotionRelegationResult,
  };
}
