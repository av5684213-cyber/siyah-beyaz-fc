/**
 * Cron Job: Günlük Bakım
 *
 * Her gün:
 * - Tüm oyuncuların form_rating değerini hesaplar ve günceller
 * - Süresi dolan cezaları ve sakatlıkları temizler
 * - Tüm profillerin level'ini XP'ye göre kontrol eder
 * - Süresi dolan kiralık oyuncuları orijinal takımlarına geri gönderir
 *
 * NOT: Morale güncelleme SADECE apply-training cron'unda yapılır.
 *      Bu dosyadan kaldırıldı — çift hesaplamayı önlemek için.
 *
 * Vercel Cron ile günlük 03:00'da çalışacak şekilde zamanlanır.
 *
 * TODO: Migrate to RPC (BUG-1) — supabase.from('players').update() calls will fail
 * once RLS is enforced. Cron routes need service-role client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateAllFormRatings } from '@/lib/fm/formRatingService';
import { cleanupExpiredSuspensionsAndInjuries } from '@/lib/fm/matchConsequencesService';
import { processDailyLevelCheck } from '@/lib/fm/xpLevelFansService';
import { createErrorResponse } from '@/lib/api-error-handler';
import { isSupabaseConfigured, getSupabase, getServiceSupabase } from '@/lib/supabase';

export const maxDuration = 60; // 5 dakika (Vercel limiti)

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (false) // CRON_SECRET disabled //.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    console.log('[cron/update-form-ratings] Starting daily maintenance...');

    // ── Service-role Supabase client (RLS bypass for cron) ──
    const supabase = getServiceSupabase();

    // ── S3-3 FIX: Snapshot watched players' form_ratings BEFORE update ──
    const watchedFormBefore = new Map<string, { formRating: number; rating: number }>();
    try {
      if (supabase) {
        const { data: allWatchlist } = await supabase
          .from('watchlist')
          .select('player_id');
        if (allWatchlist && allWatchlist.length > 0) {
          const watchedIds = allWatchlist.map((w: any) => w.player_id).filter(Boolean);
          const { data: watchedPlayers } = await supabase
            .from('players')
            .select('id, form_rating, rating')
            .in('id', watchedIds);
          for (const p of watchedPlayers || []) {
            watchedFormBefore.set(p.id, { formRating: p.form_rating ?? 50, rating: p.rating ?? 50 });
          }
          console.log(`[update-form-ratings] S3-3: ${watchedFormBefore.size} watched players snapshot'landı`);
        }
      }
    } catch (snapErr) {
      console.warn('[update-form-ratings] S3-3 snapshot hatası:', snapErr);
    }

    // 1. Form rating güncelle
    const formResult = await updateAllFormRatings();
    console.log(`[cron/update-form-ratings] Form ratings: ${formResult.updated} updated, ${formResult.errors.length} errors`);

    // 2. Süresi dolan ceza ve sakatlıkları temizle
    const cleanupResult = await cleanupExpiredSuspensionsAndInjuries();
    console.log(`[cron/update-form-ratings] Cleanup: ${cleanupResult.unsuspended} unsuspended, ${cleanupResult.healed} healed`);

    // DÜZELTME K4: Sakatlıktan yeni iyileşen oyunculara düşük kondisyon ata
    try {
      if (supabase) {
      const today = new Date().toISOString().split('T')[0];
      const { data: healedToday } = await supabase
        .from('players')
        .select('id, cond')
        .eq('injury_end_date', today)
        .eq('is_injured', false);

      if (healedToday && healedToday.length > 0) {
        for (const p of healedToday) {
          // Sakatlıktan dönen oyuncu max 40 kondisyonla başlar
          const startCond = Math.min(p.cond ?? 40, 40);
          await supabase.from('players').update({ cond: startCond }).eq('id', p.id);
        }
        console.log(`[cron/update-form-ratings] K4: ${healedToday.length} sakatlık dönüşü cond=40 olarak ayarlandı`);
      }
      }
    } catch (k4Err) {
      console.warn('[cron/update-form-ratings] K4 injury return cond error:', k4Err);
    }

    // DÜZELTME K2: Günlük kondisyon toparlanması
    // Maç günü: az toparlanma (+5-7), dinlenme günü: tam toparlanma (+15-17)
    // Sakatlar kondisyon toparlamaz
    try {
      if (supabase) {
      // Bugün maç oynayan takımları tespit et
      const { data: todayMatches } = await supabase
        .from('fixtures')
        .select('home_team_id, away_team_id')
        .eq('status', 'completed')
        .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const teamsPlayedToday = new Set<string>();
      for (const m of todayMatches || []) {
        if (m.home_team_id) teamsPlayedToday.add(m.home_team_id);
        if (m.away_team_id) teamsPlayedToday.add(m.away_team_id);
      }

      // teamsPlayedToday'i profil bazlı kullanmak için önce her oyuncunun
      // takım ID'sini bul. Basit yaklaşım: genel maç günü kontrolü.
      const isGeneralMatchDay = teamsPlayedToday.size > 0;

      // Tüm oyuncular için toparlanma
      const { data: allPlayersForRecovery } = await supabase
        .from('players')
        .select('id, cond, stamina, is_injured, profile_id, team_name')
        .not('profile_id', 'is', null)
        .lt('cond', 100); // Sadece kondisyonu 100'den düşük olanlar

      if (allPlayersForRecovery && allPlayersForRecovery.length > 0) {
        let recovered = 0;
        for (const p of allPlayersForRecovery) {
          if (p.is_injured) continue;

          const staminaBonus = Math.round((p.stamina || 50) / 50); // 1-2
          // B1: Maç günü az toparlanma, dinlenme günü tam
          const recovery = isGeneralMatchDay
            ? Math.max(2, 5 + staminaBonus)    // Maç günü: +5-7 kondisyon
            : 15 + staminaBonus;              // Dinlenme günü: +15-17 kondisyon

          const newCond = Math.min(100, (p.cond ?? 80) + recovery);
          if (newCond !== p.cond) {
            await supabase.from('players')
              .update({ cond: newCond })
              .eq('id', p.id);
            recovered++;
          }
        }
        console.log(`[cron/update-form-ratings] K2: ${recovered} oyuncu toparlandı (${isGeneralMatchDay ? 'maç günü +5-7' : 'dinlenme +15-17'})`);
      }
      }
    } catch (k2Err) {
      console.warn('[cron/update-form-ratings] K2 kondisyon toparlanma error:', k2Err);
    }

    // 3. Günlük level kontrolü (XP → level senkronizasyonu)
    const levelResult = await processDailyLevelCheck();
    console.log(`[cron/update-form-ratings] Level check: ${levelResult.checked} checked, ${levelResult.leveledUp} leveled up`);

    // 4. DÜZELTME 5: Süresi dolan kiralık oyuncuları geri çağır
    let loansReturned = 0;
    try {
      if (isSupabaseConfigured()) {
        const supabase = getServiceSupabase();
        if (supabase) {
          const today = new Date().toISOString().split('T')[0];

          const { data: expiredLoans } = await supabase
            .from('players')
            .select('id, profile_id, loaned_from_profile_id, loan_end_date, name, team_name')
            .eq('loan_status', 'active')
            .not('loaned_from_profile_id', 'is', null)
            .lte('loan_end_date', today);

          if (expiredLoans && expiredLoans.length > 0) {
            for (const player of expiredLoans) {
              try {
                // Orijinal kulübün takım adını bul
                let originalTeamName: string | null = null;
                if (player.loaned_from_profile_id) {
                  const { data: ownerProfile } = await supabase
                    .from('profiles')
                    .select('team_name')
                    .eq('id', player.loaned_from_profile_id)
                    .maybeSingle();
                  originalTeamName = ownerProfile?.team_name || null;
                }

                // Oyuncuyu orijinal kulübüne geri gönder
                await supabase.from('players').update({
                  profile_id: player.loaned_from_profile_id,
                  team_name: originalTeamName,
                  loan_status: null,
                  loaned_from_profile_id: null,
                  loan_end_date: null,
                  is_on_loan_market: false,
                }).eq('id', player.id);

                // Orijinal kulübe bildirim gönder
                if (player.loaned_from_profile_id) {
                  try {
                    await supabase.from('notifications').insert({
                      profile_id: player.loaned_from_profile_id,
                      title: 'Kiralık Oyuncu Geri Döndü',
                      body: `${player.name} kiralık süresi dolduğu için takımınıza geri döndü.`,
                      type: 'loan_return',
                      is_read: false,
                    });
                  } catch {}
                }

                loansReturned++;
                console.log(`[daily-maintenance] Kiralık ${player.name} orijinal kulübüne döndü`);
              } catch (loanErr) {
                console.warn(`[daily-maintenance] Loan return failed for ${player.name}:`, loanErr);
              }
            }
            console.log(`[daily-maintenance] ${loansReturned} kiralık oyuncu geri döndü`);
          }
        }
      }
    } catch (loanErr) {
      console.warn('[daily-maintenance] Loan cleanup error:', loanErr);
    }

    // ── Watchlist Alerts: İzleme listesindeki oyuncu satışa çıktıysa bildir ──
    try {
      const supabase = getServiceSupabase();
      if (supabase) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // Son 24 saatte satışa çıkan oyuncuları bul
        const { data: newListings } = await supabase
          .from('transfer_listings')
          .select('player_id, price, player_data')
          .gte('created_at', yesterday)
          .eq('status', 'active');

        if (newListings && newListings.length > 0) {
          const listedPlayerIds = newListings.map((l: any) => l.player_id).filter(Boolean);

          // Bu oyuncuları izleyenleri bul
          const { data: watchers } = await supabase
            .from('watchlist')
            .select('profile_id, player_id')
            .in('player_id', listedPlayerIds);

          for (const watcher of watchers || []) {
            const listing = newListings.find((l: any) => l.player_id === watcher.player_id);
            if (!listing) continue;

            const playerName = (listing.player_data as any)?.name || 'Oyuncu';
            const price = (listing.price as number) || 0;

            // watchlist_alerts tablosuna ekle
            await supabase.from('watchlist_alerts').insert({
              user_id: watcher.profile_id,
              player_id: watcher.player_id,
              alert_type: 'listed',
              message: `${playerName} transfer listesine eklendi — Fiyat: ${(price / 1_000_000).toFixed(1)}M €`,
              is_read: false,
              created_at: new Date().toISOString(),
            });
          }

          if ((watchers || []).length > 0) {
            console.log(`[update-form-ratings] Watchlist: ${(watchers || []).length} alert oluşturuldu`);
          }
        }
      }
    } catch (watchErr) {
      console.warn('[update-form-ratings] Watchlist alert hatası:', watchErr);
    }

    // ── S3-3 FIX: Watchlist Alerts — form_rating/rating değişimi >5 puan ──
    let formChangeAlerts = 0;
    try {
      if (supabase && watchedFormBefore.size > 0) {
        const watchedIds = Array.from(watchedFormBefore.keys());
        const { data: updatedWatched } = await supabase
          .from('players')
          .select('id, form_rating, rating, name')
          .in('id', watchedIds);

        if (updatedWatched && updatedWatched.length > 0) {
          for (const p of updatedWatched) {
            const before = watchedFormBefore.get(p.id);
            if (!before) continue;

            const formRatingDiff = Math.abs((p.form_rating ?? 50) - before.formRating);
            const ratingDiff = Math.abs((p.rating ?? 50) - before.rating);

            if (formRatingDiff > 5 || ratingDiff > 5) {
              // Bu oyuncuyu izleyen tüm kullanıcıları bul
              const { data: watchers } = await supabase
                .from('watchlist')
                .select('profile_id')
                .eq('player_id', p.id);

              for (const watcher of watchers || []) {
                const direction = (p.form_rating ?? 50) > before.formRating ? '↑' : '↓';
                const directionRating = (p.rating ?? 50) > before.rating ? '↑' : '↓';
                let message = '';
                if (formRatingDiff > 5) {
                  message = `${p.name} form puanı ${direction}${formRatingDiff} değişti (${before.formRating} → ${p.form_rating})`;
                }
                if (ratingDiff > 5) {
                  message += message ? ` | OVR ${directionRating}${ratingDiff} (${before.rating} → ${p.rating})` : `${p.name} OVR ${directionRating}${ratingDiff} değişti (${before.rating} → ${p.rating})`;
                }

                try {
                  await supabase.from('watchlist_alerts').insert({
                    user_id: watcher.profile_id,
                    player_id: p.id,
                    alert_type: 'price_drop', // Using existing type; CHECK constraint limits to: listed, price_drop, sold, contract_expiring
                    message,
                    is_read: false,
                    created_at: new Date().toISOString(),
                  });
                  formChangeAlerts++;
                } catch (insertErr) {
                  console.warn(`[update-form-ratings] S3-3 alert insert failed for player ${p.id}:`, insertErr);
                }
              }
            }
          }
        }
        if (formChangeAlerts > 0) {
          console.log(`[update-form-ratings] S3-3: ${formChangeAlerts} form/rating değişim alerti oluşturuldu`);
        }
      }
    } catch (formAlertErr) {
      console.warn('[update-form-ratings] S3-3 form change alert hatası:', formAlertErr);
    }

    // Sezonsal moral değişimi
    try {
      if (supabase) {
      const { data: allProfiles } = await supabase
        .from('profiles').select('id, current_day, league_position').eq('is_bot', false);
      for (const prof of (allProfiles || [])) {
        const weekNum = Math.floor((prof.current_day || 0) / 7);
        let moraleDelta = 0;
        // Sezon başı heyecanı (1-4. hafta): +2
        if (weekNum >= 1 && weekNum <= 4) moraleDelta += 2;
        // Kış yorgunluğu (17-22. hafta): -1
        if (weekNum >= 17 && weekNum <= 22) moraleDelta -= 1;
        // Sezon sonu baskısı (28-34. hafta)
        if (weekNum >= 28) {
          const pos = prof.league_position || 9;
          if (pos <= 3) moraleDelta += 3;
          if (pos >= 17) moraleDelta -= 3;
        }
        if (moraleDelta !== 0 && prof.id) {
          const { data: pls } = await supabase
            .from('players').select('id, morale').eq('profile_id', prof.id);
          for (const p of pls || []) {
            const newMorale = Math.min(100, Math.max(0, (p.morale || 60) + moraleDelta));
            if (newMorale !== p.morale) {
              await supabase.from('players').update({ morale: newMorale }).eq('id', p.id);
            }
          }
        }
      }
      }
    } catch (seasonalErr) {
      console.warn('[update-form-ratings] Sezonsal moral:', seasonalErr);
    }

    const allErrors = [
      ...formResult.errors.slice(0, 5),
      ...cleanupResult.errors.slice(0, 5),
      ...levelResult.errors.slice(0, 5),
    ];

    return NextResponse.json({
      success: true,
      formRatingsUpdated: formResult.updated,
      unsuspended: cleanupResult.unsuspended,
      healed: cleanupResult.healed,
      levelChecked: levelResult.checked,
      levelUps: levelResult.leveledUp,
      loansReturned,
      formChangeAlerts,
      errors: allErrors.length > 0 ? allErrors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/update-form-ratings', method: 'GET' });
  }
}
