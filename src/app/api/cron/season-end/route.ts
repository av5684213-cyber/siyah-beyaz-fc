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
 *
 * TODO: Migrate to RPC (BUG-1) — All supabase.from('profiles').update() and
 * supabase.from('players').upsert/insert() calls in this file will fail once
 * RLS WITH CHECK (false) is enforced. Cron routes need service-role client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { processPromotionRelegation } from '@/lib/fm/leagueHelpers';
import { createErrorResponse } from '@/lib/api-error-handler';
import { AWARD_LABELS, type AwardType } from '@/lib/fm/types';
import { acquireCronLock, releaseCronLock } from '@/lib/fm/cronLockService';

export const maxDuration = 60;

const MATCHES_PER_SEASON = 34; // 18 takım × double round-robin = her takım 34 maç (17 ev + 17 deplasman)

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
// SORUN-11: Additional Vercel cron signature verification (defense-in-depth)
const vercelCronSig = request.headers.get('x-vercel-cron-signature');
if (process.env.VERCEL === '1' && !vercelCronSig) {
  console.warn('[season-end] Missing X-Vercel-Cron-Signature header — possible external invocation');
  // Don't block — Vercel may not always send this header. Just log the warning.
}
if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  // Cron lock: aynı anda iki instance çift işlem yapmasın
  const lock = await acquireCronLock(supabase, 'season-end', 90);
  if (!lock) {
    return NextResponse.json({ message: 'Already running, skipped' });
  }

  try {
    // ─── 0. SON TUR TAMAMLANMA KONTROLÜ ───
    // Salı akşamı tetiklense bile, son tur maçları henüz tamamlanmamışsa
    // sezonu kapatma — yanlış şampiyon seçilmesini önle
    try {
      const { count: pendingMatchCount } = await supabase
        .from('fixtures')
        .select('id', { count: 'exact', head: true })
        .in('status', ['scheduled', 'live'])
        .eq('competition_type', 'league');

      if (pendingMatchCount && pendingMatchCount > 0) {
        console.log(`[cron/season-end] ${pendingMatchCount} lig maçı hâlâ oynanıyor/bekliyor — sezon kapatılmıyor`);
        return NextResponse.json({
          action: 'postpone',
          message: `Son tur maçları henüz tamamlanmadı (${pendingMatchCount} maç bekliyor/canlı)`,
          pendingMatches: pendingMatchCount,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (pendingErr) {
      console.warn('[cron/season-end] Pending match check failed (continuing):', pendingErr);
      // Hata olursa devam et — güvenli tarafta kal, ama engel olma
    }

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
      // SIM-2 FIX: Skip leagues with too few teams (< 2) — can't process season end
      if (data.total < 2) {
        console.warn(`[cron/season-end] Skipping league ${leagueId}: only ${data.total} teams (need >= 2)`);
        continue;
      }
      if (data.allPlayed && data.total >= 2) {
        completedLeagues.push(leagueId);
      } else {
        // Ek kontrol: Bu ligdeki tüm scheduled fikstürler tamamlandı mı?
        // Hiç scheduled veya live fikstür kalmamışsa sezon tamamlanmış sayılır
        try {
          // BUG #1 FIX: league_id ile season_id karıştırılıyordu
          // Önce aktif sezonun ID'sini bul, sonra fikstürleri kontrol et
          const { data: activeSeason } = await supabase
            .from('seasons')
            .select('id')
            .eq('league_id', leagueId)
            .eq('is_finished', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (activeSeason) {
            // SIM-7 FIX: Also include 'finished' status (inconsistency fix)
            const { count: pendingCount } = await supabase
              .from('fixtures')
              .select('id', { count: 'exact', head: true })
              .eq('season_id', activeSeason.id)
              .eq('competition_type', 'league')
              .in('status', ['scheduled', 'live', 'in_progress']);

            const allFixturesPlayed = (pendingCount ?? 0) === 0;
            if (allFixturesPlayed && data.total >= 2) {
              completedLeagues.push(leagueId);
            } else {
              incompleteLeagues.push(leagueId);
            }
          } else {
            // Aktif sezon yok — muhtemelen zaten bitmiş
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
  } finally {
    await releaseCronLock(supabase, 'season-end', lock);
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

  // BUG #7 FIX: Aktif sezonun ID'sini bul, sadece o sezonun sıralamasını al
  const { data: currentSeasonForStandings } = await supabase
    .from('seasons')
    .select('id')
    .eq('league_id', leagueId)
    .eq('is_finished', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // ─── 1. Lig sıralamasını al (league_standings üzerinden) ───
  let standingsQuery = supabase
    .from('league_standings')
    .select('*, league_teams(name, profile_id)')
    .eq('league_id', leagueId);

  if (currentSeasonForStandings?.id) {
    standingsQuery = standingsQuery.eq('season_id', currentSeasonForStandings.id);
  }

  const { data: standings } = await standingsQuery
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
  const { data: mvpPlayer } = await supabase
    .from('players')
    .select('id, name, rating, team_name, form_rating, age, position, specific_position, assists, goals, yellow_cards, red_cards, matches_played, clean_sheets, morale, profile_id, rating_start_of_season')
    .in('profile_id', profileIds.length > 0 ? profileIds : ['__none__']);

  // Helper functions: Direct player columns are the source of truth for season awards
  // (player_career_stats is NOT selected in this query — always use direct columns)
  const getGoals = (p: any) => p.goals ?? 0;
  const getAssists = (p: any) => p.assists ?? 0;

  const seasonId = `S${new Date().getFullYear()}_${leagueId}`;
  const awardTs = Date.now(); // BUG C9 FIX: Timestamp suffix to prevent ID collisions across seasons
  const awards: Record<string, unknown>[] = [];

  // Şampiyon ödülü
  const championAward = {
    id: `award_${seasonId}_${leagueId}_champion_${awardTs}`,
    season_id: seasonId,
    profile_id: championProfileId,
    league_name: leagueName,
    award_type: 'champion',
    team_name: championName,
    stat_value: champion.points as number,
    stat_detail: {
      points: champion.points,
      won: champion.won,
      gf: champion.gf,  // BUG #5 FIX: goals_for → gf
      ga: champion.ga,  // BUG #5 FIX: goals_against → ga
    },
  };
  awards.push(championAward);

  if (mvpPlayer && mvpPlayer.length > 0) {
    // Altın Krampon
    const topScorerPlayer = [...mvpPlayer].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      getGoals(b) - getGoals(a)
    )[0];
    if (getGoals(topScorerPlayer) > 0) {
      awards.push({
        id: `award_${seasonId}_${leagueId}_golden_boot_${awardTs}`,
        season_id: seasonId,
        profile_id: topScorerPlayer.profile_id,
        league_name: leagueName,
        award_type: 'golden_boot',
        player_id: topScorerPlayer.id,
        player_name: topScorerPlayer.name,
        team_name: topScorerPlayer.team_name,
        stat_value: getGoals(topScorerPlayer),
      });
    }

    // Asist Kralı
    const topAssister = [...mvpPlayer].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      getAssists(b) - getAssists(a)
    )[0];
    if (getAssists(topAssister) > 0) {
      awards.push({
        id: `award_${seasonId}_${leagueId}_top_assists_${awardTs}`,
        season_id: seasonId,
        profile_id: topAssister.profile_id,
        league_name: leagueName,
        award_type: 'top_assists',
        player_id: topAssister.id,
        player_name: topAssister.name,
        team_name: topAssister.team_name,
        stat_value: getAssists(topAssister),
      });
    }

    // MVP
    const mvp = [...mvpPlayer].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      ((b.form_rating as number) || 0) - ((a.form_rating as number) || 0)
    )[0];
    awards.push({
      id: `award_${seasonId}_${leagueId}_mvp_${awardTs}`,
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
        id: `award_${seasonId}_${leagueId}_best_gk_${awardTs}`,
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
        id: `award_${seasonId}_${leagueId}_best_young_${awardTs}`,
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
        id: `award_${seasonId}_${leagueId}_fair_play_${awardTs}`,
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
          id: `award_${seasonId}_${leagueId}_most_improved_${awardTs}`,
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
      (getGoals(p) + getAssists(p)) < 3 &&
      ((p.form_rating as number) || 0) >= 65
    );
    if (defensivePlayers.length > 0) {
      const unsungHero = [...defensivePlayers].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        ((b.form_rating as number) || 0) - ((a.form_rating as number) || 0)
      )[0];
      awards.push({
        id: `award_${seasonId}_${leagueId}_unsung_hero_${awardTs}`,
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
      (getGoals(p) + getAssists(p)) >= 2
    );
    if (fanFavs.length > 0) {
      const fanFav = [...fanFavs].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        (((b.morale as number) || 0) * 0.3 + getGoals(b) * 2 + getAssists(b)) -
        (((a.morale as number) || 0) * 0.3 + getGoals(a) * 2 + getAssists(a))
      )[0];
      awards.push({
        id: `award_${seasonId}_${leagueId}_fan_favorite_${awardTs}`,
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
        id: `award_${seasonId}_${leagueId}_best_11_${awardTs}`,
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

  // ─── 3b. Kupa galibi ödülü ───
  try {
    const { data: cupSeasonResult } = await supabase
      .from('cup_seasons')
      .select('winner, cup_id, is_completed')
      .eq('league_id', leagueId)
      .eq('is_completed', true)
      .maybeSingle();

    if (cupSeasonResult?.winner) {
      awards.push({
        id: `award_${seasonId}_${leagueId}_cup_winner_${awardTs}`,
        season_id: seasonId,
        award_type: 'cup_winner',
        player_id: null,
        profile_id: null,
        team_name: cupSeasonResult.winner,
        value: null,
        cup_id: cupSeasonResult.cup_id,
      } as any);
    }
  } catch (cupAwardErr) {
    console.warn('[season-end] Cup winner award failed:', cupAwardErr);
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

  // ═══════════════════════════════════════════════════════════════
  // GRUP 3: Şampiyona para ödülü — lige göre büyük ödeme
  // Lig 1 şampiyonu: 50M, Lig 2: 15M, Lig 3: 5M, Lig 4: 1.5M
  // ═══════════════════════════════════════════════════════════════
  if (championProfileId) {
    try {
      const prizePools: Record<number, number> = { 1: 50_000_000, 2: 15_000_000, 3: 5_000_000, 4: 1_500_000 };
      const championPrize = prizePools[leagueTier as 1|2|3|4] || 1_500_000;

      const { data: champProfile } = await supabase
        .from('profiles')
        .select('money, team_name')
        .eq('id', championProfileId)
        .single();

      if (champProfile) {
        await supabase.from('profiles')
          .update({ money: (champProfile.money || 0) + championPrize })
          .eq('id', championProfileId);
        console.log(`[season-end] Champion prize: ${championPrize.toLocaleString('tr-TR')} € → ${champProfile.team_name || championProfileId}`);

        // Bildirim gönder
        try {
          await supabase.from('notifications').insert({
            profile_id: championProfileId,
            title: 'Şampiyonluk Priminiz!',
            body: `${championPrize.toLocaleString('tr-TR')} € şampiyonluk ödülü hesabınıza yatırıldı!`,
            type: 'season_award',
            is_read: false,
          });
        } catch {}
      }
    } catch (prizeErr) {
      console.warn('[season-end] Champion prize payment failed:', prizeErr);
    }
  }

  // GRUP 3: Diğer sıralama ödülleri (2. ve 3. sıra)
  for (let rank = 1; rank <= Math.min(3, standings.length); rank++) {
    const team = standings[rank - 1];
    const teamProfileId = (team as any).league_teams?.profile_id || null;
    if (!teamProfileId || teamProfileId === championProfileId) continue; // Champion already paid

    try {
      const positionPrizes: Record<number, Record<number, number>> = {
        1: { 2: 20_000_000, 3: 10_000_000 },
        2: { 2: 5_000_000, 3: 2_000_000 },
        3: { 2: 1_500_000, 3: 500_000 },
        4: { 2: 500_000, 3: 200_000 },
      };
      const prize = positionPrizes[leagueTier]?.[rank] || 0;
      if (prize > 0) {
        const { data: pp } = await supabase.from('profiles').select('money').eq('id', teamProfileId).single();
        if (pp) {
          await supabase.from('profiles').update({ money: (pp.money || 0) + prize }).eq('id', teamProfileId);
          console.log(`[season-end] Position ${rank} prize: ${prize.toLocaleString('tr-TR')} € → ${teamProfileId}`);
        }
      }
    } catch (posPrizeErr) {
      console.warn(`[season-end] Position ${rank} prize failed:`, posPrizeErr);
    }
  }

  // GRUP 3b: Tüm takımlara temel ödül dağıtımı (4. sıra ve sonrası)
  const prizePoolsAll: Record<number, number> = { 1: 50_000_000, 2: 15_000_000, 3: 5_000_000, 4: 1_500_000 };
  const basePrize = Math.round((prizePoolsAll[leagueTier as 1|2|3|4] || 1_500_000) * 0.01);
  for (let rank = 4; rank <= standings.length; rank++) {
    const team = standings[rank - 1];
    const teamProfileId = (team as any).league_teams?.profile_id || null;
    if (!teamProfileId) continue;
    try {
      const { data: pp } = await supabase.from('profiles').select('money').eq('id', teamProfileId).single();
      if (pp) {
        await supabase.from('profiles').update({ money: (pp.money || 0) + basePrize }).eq('id', teamProfileId);
        console.log(`[season-end] Position ${rank} base prize: ${basePrize.toLocaleString('tr-TR')} € → ${teamProfileId}`);
      }
    } catch (posPrizeErr) {
      console.warn(`[season-end] Position ${rank} base prize failed:`, posPrizeErr);
    }
  }

  // ─── 4c. Profil seasons_played güncelle ───
  for (const pid of profileIds) {
    try {
      const { data: profData } = await supabase
        .from('profiles')
        .select('id, seasons_played')
        .eq('id', pid as string)
        .maybeSingle();
      if (profData) {
        await supabase.from('profiles')
          .update({ seasons_played: (profData.seasons_played || 0) + 1 })
          .eq('id', pid as string);
      }
    } catch (profErr) {
      console.warn('[season-end] Profile seasons_played update error:', profErr);
    }
  }

  // ─── 5. Hall of Fame güncelle ───
  const goldenBoot = awards.find(a => a.award_type === 'golden_boot');
  const topAssistsAward = awards.find(a => a.award_type === 'top_assists');
  const mvpAward = awards.find(a => a.award_type === 'mvp');

  const hofEntry = {
    id: `hof_${seasonId}_${leagueId}_${awardTs}`,
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
      .select('id, player_id, owner_team_id')
      .eq('status', 'active');

    if (activeLoans && activeLoans.length > 0) {
      await supabase.from('loans').update({ status: 'completed' }).eq('status', 'active');
      for (const loan of activeLoans) {
        try {
          // Get loaned_from_profile_id to return player to original owner
          const { data: loanedPlayer } = await supabase
            .from('players')
            .select('id, name, loaned_from_profile_id, profile_id')
            .eq('id', loan.player_id)
            .maybeSingle();

          const originalOwnerId = loanedPlayer?.loaned_from_profile_id || null;

          if (originalOwnerId) {
            // Return player to original owner
            const { data: ownerTeam } = await supabase
              .from('profiles')
              .select('team_name')
              .eq('id', originalOwnerId)
              .maybeSingle();

            await supabase
              .from('players')
              .update({
                loan_status: null,
                loaned_to_profile_id: null,
                loaned_from_profile_id: null,
                loan_end_date: null,
                is_on_loan_market: false,
                profile_id: originalOwnerId,
                team_name: ownerTeam?.team_name || null,
              })
              .eq('id', loan.player_id);

            // Send notification to original owner
            try {
              await supabase.from('notifications').insert({
                profile_id: originalOwnerId,
                title: '🔄 Kiralık Oyuncu Geri Döndü',
                body: `${loanedPlayer?.name || 'Oyuncu'} kiralık süresi dolduğu için takımınıza geri döndü.`,
                type: 'loan_return',
                is_read: false,
              });
            } catch (notifErr) {
              console.warn('[season-end] Loan return notification error:', notifErr);
            }
          } else {
            // No original owner — set as free agent
            await supabase
              .from('players')
              .update({
                loan_status: null,
                loaned_to_profile_id: null,
                loaned_from_profile_id: null,
                loan_end_date: null,
                is_on_loan_market: false,
                is_free_agent: true,
                profile_id: null,
                team_name: null,
              })
              .eq('id', loan.player_id);
          }
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

  // ─── 8b. profiles.sponsors JSONB'sinden süresi dolanları temizle ──
  // current_day sıfırlanınca remainingDays hesabı bozulabilir;
  // bu yüzden kalan günü 0 veya negatif olanları JSONB'den çıkar
  try {
    const { data: allProfileSponsors } = await supabase
      .from('profiles')
      .select('id, sponsors')
      .not('sponsors', 'is', null);

    if (allProfileSponsors && allProfileSponsors.length > 0) {
      for (const p of allProfileSponsors) {
        const sponsors = Array.isArray(p.sponsors) ? p.sponsors : [];
        if (sponsors.length === 0) continue;
        const cleaned = sponsors.filter((s: any) => (s.remainingDays || 0) > 0);
        if (cleaned.length < sponsors.length) {
          await supabase
            .from('profiles')
            .update({ sponsors: cleaned })
            .eq('id', p.id);
        }
      }
    }
  } catch (jsonbErr) {
    console.warn('[season-end] JSONB sponsor cleanup error:', jsonbErr);
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

    // GRUP 3: Yükselme primini öde
    if (promotionRelegationResult && (promotionRelegationResult as any).promoted) {
      const prizePools: Record<number, number> = { 1: 50_000_000, 2: 15_000_000, 3: 5_000_000, 4: 1_500_000 };
      const promotionBonus = Math.round((prizePools[Math.max(1, leagueTier - 1) as 1|2|3|4] || 1_500_000) * 0.2);
      for (const promoted of (promotionRelegationResult as any).promoted || []) {
        try {
          const { data: proTeam } = await supabase
            .from('league_teams')
            .select('profile_id')
            .eq('id', promoted.teamId || promoted)
            .maybeSingle();
          if (proTeam?.profile_id) {
            const { data: pp } = await supabase.from('profiles').select('money').eq('id', proTeam.profile_id).single();
            if (pp) {
              await supabase.from('profiles').update({ money: (pp.money || 0) + promotionBonus }).eq('id', proTeam.profile_id);
              console.log(`[season-end] Promotion bonus: ${promotionBonus.toLocaleString('tr-TR')} € → ${proTeam.profile_id}`);
            }
          }
        } catch (promoErr) {
          console.warn('[season-end] Promotion bonus payment failed:', promoErr);
        }
      }
    }
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
      top_scorer_id: (goldenBoot?.player_id as string) || null,
      top_scorer_name: (goldenBoot?.player_name as string) || null,
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
      .select('id, goals, assists, yellow_cards, red_cards, matches_played, clean_sheets, position, rating')
      .eq('profile_id', pid as string);

    if (oldPlayers) {
      for (const p of oldPlayers) {
        try {
          // Save to season_stats (historical record per season)
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

        // PROMPT 8: Also sync to player_career_stats (unified career record)
        // This ensures career stats match season_stats even if per-match updates were missed
        try {
          const { data: existingCareer } = await supabase
            .from('player_career_stats')
            .select('id, goals, assists, yellow_cards, red_cards, matches_played, clean_sheets, avg_rating')
            .eq('player_id', p.id)
            .eq('season_id', seasonId)
            .maybeSingle();

          if (existingCareer) {
            // Update existing career stat entry — accumulate season totals
            await supabase.from('player_career_stats').update({
              goals: (existingCareer.goals || 0) + (p.goals || 0),
              assists: (existingCareer.assists || 0) + (p.assists || 0),
              yellow_cards: (existingCareer.yellow_cards || 0) + (p.yellow_cards || 0),
              red_cards: (existingCareer.red_cards || 0) + (p.red_cards || 0),
              matches_played: (existingCareer.matches_played || 0) + (p.matches_played || 0),
              clean_sheets: (existingCareer.clean_sheets || 0) + (p.clean_sheets || 0),
            }).eq('id', existingCareer.id);
          } else {
            // Create new career stat entry for this season
            await supabase.from('player_career_stats').insert({
              player_id: p.id,
              season_id: seasonId,
              goals: p.goals || 0,
              assists: p.assists || 0,
              yellow_cards: p.yellow_cards || 0,
              red_cards: p.red_cards || 0,
              matches_played: p.matches_played || 0,
              clean_sheets: p.clean_sheets || 0,
              avg_rating: p.rating || 50,
              position: p.position || null,
            });
          }
        } catch (careerErr) {
          console.warn('[season-end] Career stats sync failed for player', p.id, careerErr);
        }
      }
    }

  }

  // ─── 13b. Toplu istatistik sıfırlama (batch) ───
  try {
    // Tek sorguda tüm oyuncuları sıfırla
    const { error: batchResetErr } = await supabase
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
      .in('profile_id', profileIds as string[]);

    if (batchResetErr) {
      console.warn('[season-end] Batch stat reset failed:', batchResetErr);
    } else {
      console.log(`[season-end] Batch stat reset completed for ${profileIds.length} profiles`);
    }
  } catch (batchErr) {
    console.warn('[season-end] Batch stat reset error:', batchErr);
  }

  // ─── 13c. rating_start_of_season toplu güncelleme ───
  try {
    // Mevcut rating'leri toplu çek
    const { data: allRatings } = await supabase
      .from('players')
      .select('id, rating')
      .in('profile_id', profileIds as string[]);

    if (allRatings && allRatings.length > 0) {
      const ratingUpdates = allRatings.map(p => ({
        id: p.id,
        rating_start_of_season: p.rating || 0,
      }));
      // Batch upsert: her 100 oyuncuda bir
      for (let i = 0; i < ratingUpdates.length; i += 100) {
        const batch = ratingUpdates.slice(i, i + 100);
        await supabase.from('players').upsert(batch, { onConflict: 'id' });
      }
      console.log(`[season-end] rating_start_of_season updated for ${allRatings.length} players`);
    }
  } catch (rsosErr) {
    console.warn('[season-end] rating_start_of_season batch update error:', rsosErr);
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

      // Emeklilik veda bildirimleri
      for (const rp of retiringPlayers) {
        if (!(rp as any).profile_id) continue;
        try {
          const pid  = (rp as any).profile_id as string;
          const name = (rp as any).name         as string || 'Oyuncu';
          const age  = (rp as any).age          as number || 0;
          const g    = (rp as any).goals        as number || 0;
          const a    = (rp as any).assists      as number || 0;
          const m    = (rp as any).matches_played as number || 0;

          await supabase.from('notifications').insert({
            profile_id: pid,
            title: `${name} Emekli Oldu`,
            body: `${age} yaşında ${m} maçlık kariyerini noktaladı. ${g} gol, ${a} asist. Efsane olarak hatırlanacak.`,
            type: 'player_retirement',
            metadata: JSON.stringify({ player_id: (rp as any).id, goals: g, assists: a, matches: m }),
            is_read: false,
          });

          const { sendPushToProfile } = await import('@/lib/push-notifications');
          await sendPushToProfile(pid, {
            title: `${name} emekli oldu`,
            body: `${age} yaş · ${m} maç · ${g} gol. Güle güle.`,
          });
        } catch { /* sessizce geç */ }
      }

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
              season_id: newSeason?.id || null,   // B2: season_id ekle
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

            // DÜZELTME K5: Kupa maçlarını fixtures tablosuna da ekle
            try {
              const { generateCupFixtures } = await import('@/lib/fm/cupSystem');
              const cupFixtures = generateCupFixtures(cupSeason, leagueId);  // B2: newSeason.id değil, leagueId kullan

              // Takım adlarını ID'ye çevir
              const teamNameToId: Record<string, string> = {};
              const { data: leagueTeamsList } = await supabase
                .from('league_teams').select('id, name').eq('league_id', leagueId);
              for (const t of leagueTeamsList || []) teamNameToId[t.name] = t.id;

              const fixtureRows = cupFixtures
                .filter(f => teamNameToId[f.home_team_id] && teamNameToId[f.away_team_id])
                .map(f => ({
                  ...f,
                  home_team_id: teamNameToId[f.home_team_id],
                  away_team_id: teamNameToId[f.away_team_id],
                  // S3-6 FIX: cup_season_id for reliable bracket matching
                  cup_season_id: cupSeason?.id || null,
                }));

              if (fixtureRows.length > 0) {
                const { data: insertedCupFixtures } = await supabase
                  .from('fixtures')
                  .insert(fixtureRows)
                  .select('id, home_team_id, away_team_id');

                console.log(`[season-end] K5: ${fixtureRows.length} kupa fixture eklendi`);

                // Kupa fixture insert sonrası cup_seasons.data'yı fixture_id ile güncelle
                if (insertedCupFixtures && insertedCupFixtures.length > 0 && cupSeason?.id) {
                  const { data: csRow } = await supabase
                    .from('cup_seasons').select('id, data').eq('id', cupSeason.id).maybeSingle();

                  if (csRow?.data) {
                    const csData = typeof csRow.data === 'string' ? JSON.parse(csRow.data) : csRow.data;
                    for (const ins of insertedCupFixtures) {
                      for (const round of (csData.rounds || [])) {
                        for (const match of (round.matches || [])) {
                          const hId = (teamNameToId as Record<string, string>)[match.homeTeam];
                          const aId = (teamNameToId as Record<string, string>)[match.awayTeam];
                          if (hId === ins.home_team_id && aId === ins.away_team_id) {
                            (match as any).fixture_id = ins.id;
                          }
                        }
                      }
                    }
                    await supabase.from('cup_seasons').update({ data: csData }).eq('id', csRow.id);
                    console.log(`[season-end] Kupa: ${insertedCupFixtures.length} fixture_id → cup_seasons güncellendi`);
                  }
                }
              }
            } catch (cupFixErr) {
              console.warn('[season-end] K5 kupa fixture oluşturma hatası:', cupFixErr);
            }
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
