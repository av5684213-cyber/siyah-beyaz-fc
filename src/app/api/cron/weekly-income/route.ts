import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { calculateWeeklyRevenue, calculateWeeklyExpenses, checkFinancialHealth } from '@/lib/fm/financialModel';
import { createErrorResponse } from '@/lib/api-error-handler';
export const maxDuration = 60;

/**
 * Cron: Haftalık Gelir Dağıtımı
 * Her hafta bir kez çalışır. Sponsorluk + TV yayını gelirlerini hesaplar ve kredilere ekler.
 * 
 * Gelir kaynakları:
 * - Sponsorluk: team_sponsorships tablosundan aktif anlaşmaların weekly_income toplamı
 * - TV Yayını: profiles.tv_revenue_weekly (Lig 1: 20, Lig 2: 10, diğer: 0)
 * 
 * Ayrıca her lig turunda sponsorluk remaining_rounds azaltılır.
 */
export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'No Supabase client' }, { status: 500 });
  }

  try {
    const results: { profile_id: string; sponsorship: number; tv: number; total: number }[] = [];

    // 1. Tüm profilleri getir (sponsors JSONB kolonu dahil)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, credits, tv_revenue_weekly, league_name, is_bot, sponsors, money, stadium_upgrades, academy_level, league_tier, league_position')
      .is('is_bot', null); // Bot olmayan gerçek kullanıcılar

    if (profileError) {
      console.error('[cron/weekly-income] Profile fetch error:', profileError);
      return NextResponse.json({ error: 'Profile fetch failed' }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        action: 'none',
        message: 'Aktif profil bulunamadı',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Aktif sponsorluk anlaşmalarını getir
    //    team_sponsorships tablosunun varlığını kontrol et; yoksa uyarı ver
    let sponsorshipTableExists = true;
    const { data: sponsorships, error: sponsorError } = await supabase
      .from('team_sponsorships')
      .select('profile_id, weekly_income, remaining_rounds')
      .eq('status', 'active');

    if (sponsorError) {
      const errMsg = sponsorError.message || String(sponsorError);
      // Tablo mevcut değilse karakteristik hata mesajları
      if (errMsg.includes('does not exist') || errMsg.includes('not found') || errMsg.includes('relation')) {
        console.warn('[cron/weekly-income] ⚠️ team_sponsorships tablosu mevcut değil! Migration çalıştırın: supabase/migrations/20250525_add_sponsorships.sql');
        sponsorshipTableExists = false;
      } else {
        console.error('[cron/weekly-income] Sponsorship fetch error:', sponsorError);
      }
    }

    // Sponsorluk gelirini profile_id bazında grupla
    const sponsorshipIncome: Record<string, number> = {};
    if (sponsorships) {
      for (const s of sponsorships) {
        if (!sponsorshipIncome[s.profile_id]) sponsorshipIncome[s.profile_id] = 0;
        sponsorshipIncome[s.profile_id] += s.weekly_income || 0;
      }
    }

    // 3. Her profil için gerçek finansal model ile gelir hesapla
    for (const profile of profiles) {
      // ── Oyuncu maaşlarını Supabase'ten yükle (profile_id ile) ──
      let totalWages = 0;
      let squadForExpenses: any[] = [];
      try {
        const { data: squadPlayers } = await supabase
          .from('players')
          .select('salary, market_value')
          .eq('profile_id', profile.id);
        if (squadPlayers && squadPlayers.length > 0) {
          totalWages = squadPlayers.reduce((sum: number, p: { salary: number }) => sum + (p.salary || 0), 0);
          squadForExpenses = squadPlayers;
        }
      } catch (squadErr) {
        console.warn('[cron/weekly-income] Squad fetch error for profile', profile.id, squadErr);
      }

      // Gerçek calculateWeeklyRevenue ile detaylı gelir hesabı
      const profileFull = profile as any;
      const revenueBreakdown = calculateWeeklyRevenue(
        profileFull,
        undefined,   // lastMatchAttendance — cron'da bilinmiyor
        false,       // isHome — haftalık ortalama için false
        profileFull.league_position ?? 10,
        profileFull.league_tier ?? 4,
      );
      const expenseBreakdown = calculateWeeklyExpenses(
        squadForExpenses as any, // pass real squad data
        profileFull.stadium_upgrades,
        profileFull.academy_level ?? 0,
        profileFull.league_tier ?? 4,
      );

      const totalIncome  = revenueBreakdown.total;
      const totalExpense = expenseBreakdown.total; // wages already included via squad
      const netChange    = totalIncome - totalExpense;

      // Stadium store daily revenue
      let storeRevenue = 0;
      try {
        const { getStoreDailyRevenue } = await import('@/lib/fm/stadiumMatrix');
        const storeLevel = profileFull.stadium_upgrades?.store || 0;
        storeRevenue = getStoreDailyRevenue(storeLevel) * 7; // weekly
      } catch {}

      // Profile.sponsors JSONB kolonundan sponsor geliri ekle
      let profileSponsorIncome = 0;
      const profileSponsors: any[] = Array.isArray(profileFull.sponsors) ? profileFull.sponsors : [];
      if (profileSponsors.length > 0) {
        profileSponsorIncome = profileSponsors.reduce((acc: number, s: any) => acc + (s.weeklyPayment || 0), 0);
      }

      const finalNetChange = netChange + storeRevenue + profileSponsorIncome;

      if (Math.abs(finalNetChange) > 0) {
        const newMoney = (profileFull.money || 0) + finalNetChange;

        // ── İFLAS MEKANİĞİ: Para negatife düştüyse en pahalı oyuncuyu serbest bırak ──
        if (newMoney < 0) {
          // En yüksek maaşlı oyuncuyu bul
          const { data: expensivePlayers } = await supabase
            .from('players')
            .select('id, name, salary')
            .eq('profile_id', profile.id)
            .order('salary', { ascending: false })
            .limit(1);

          if (expensivePlayers && expensivePlayers.length > 0) {
            const player = expensivePlayers[0];
            // Oyuncuyu serbest bırak
            await supabase.from('players').update({
              profile_id: null,
              team_name: null,
              is_free_agent: true,
              salary: 0,
            }).eq('id', player.id);

            // Profili log'la
            console.warn(`[weekly-income] ${profile.id} iflasa yakın — ${player.name} serbest bırakıldı.`);

            // Para sıfırla (negatif bırakma)
            const healthStatus = checkFinancialHealth(
              { weeklyRevenue: totalIncome, weeklyExpenses: totalExpense, weeklyProfit: totalIncome - totalExpense, monthlyRevenue: totalIncome * 4, monthlyExpenses: totalExpense * 4, monthlyProfit: (totalIncome - totalExpense) * 4, seasonRevenue: totalIncome * 34, seasonExpenses: totalExpense * 34, seasonProfit: (totalIncome - totalExpense) * 34, totalWages, wageBillLimit: totalIncome * 0.7, wageUtilization: totalWages / (totalIncome * 0.7 + 1) * 100, sponsorCount: profileSponsors.length, sponsorRevenue: profileSponsorIncome, matchdayRevenue: 0, broadcastRevenue: 0, transferRevenue: 0, transferSpending: 0 },
              0,
              0,
            );
            await supabase.from('profiles')
              .update({
                money: 0,
                last_weekly_income: totalIncome,
                last_weekly_expense: totalExpense,
                last_weekly_net: finalNetChange,
                financial_health: healthStatus,
              })
              .eq('id', profile.id);

            results.push({
              profile_id: profile.id,
              sponsorship: (revenueBreakdown.commercial?.reduce((s: number, r: any) => s + r.amount, 0) ?? 0) + profileSponsorIncome,
              tv: revenueBreakdown.broadcast?.reduce((s: number, r: any) => s + r.amount, 0) ?? 0,
              total: finalNetChange,
            });
          } else {
            // Serbest bırakılacak oyuncu yok — parayı sıfırla
            const healthStatus = checkFinancialHealth(
              { weeklyRevenue: totalIncome, weeklyExpenses: totalExpense, weeklyProfit: totalIncome - totalExpense, monthlyRevenue: totalIncome * 4, monthlyExpenses: totalExpense * 4, monthlyProfit: (totalIncome - totalExpense) * 4, seasonRevenue: totalIncome * 34, seasonExpenses: totalExpense * 34, seasonProfit: (totalIncome - totalExpense) * 34, totalWages, wageBillLimit: totalIncome * 0.7, wageUtilization: totalWages / (totalIncome * 0.7 + 1) * 100, sponsorCount: profileSponsors.length, sponsorRevenue: profileSponsorIncome, matchdayRevenue: 0, broadcastRevenue: 0, transferRevenue: 0, transferSpending: 0 },
              0,
              0,
            );
            await supabase.from('profiles')
              .update({
                money: 0,
                last_weekly_income: totalIncome,
                last_weekly_expense: totalExpense,
                last_weekly_net: finalNetChange,
                financial_health: healthStatus,
              })
              .eq('id', profile.id);

            results.push({
              profile_id: profile.id,
              sponsorship: (revenueBreakdown.commercial?.reduce((s: number, r: any) => s + r.amount, 0) ?? 0) + profileSponsorIncome,
              tv: revenueBreakdown.broadcast?.reduce((s: number, r: any) => s + r.amount, 0) ?? 0,
              total: finalNetChange,
            });
          }
        } else {
          // Normal güncelleme + financial_health hesapla
          const healthStatus = checkFinancialHealth(
            { weeklyRevenue: totalIncome, weeklyExpenses: totalExpense, weeklyProfit: totalIncome - totalExpense, monthlyRevenue: totalIncome * 4, monthlyExpenses: totalExpense * 4, monthlyProfit: (totalIncome - totalExpense) * 4, seasonRevenue: totalIncome * 34, seasonExpenses: totalExpense * 34, seasonProfit: (totalIncome - totalExpense) * 34, totalWages, wageBillLimit: totalIncome * 0.7, wageUtilization: totalWages / (totalIncome * 0.7 + 1) * 100, sponsorCount: profileSponsors.length, sponsorRevenue: profileSponsorIncome, matchdayRevenue: 0, broadcastRevenue: 0, transferRevenue: 0, transferSpending: 0 },
            newMoney,
            0,
          );
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              money: newMoney,
              last_weekly_income: totalIncome,
              last_weekly_expense: totalExpense,
              last_weekly_net: finalNetChange,
              financial_health: healthStatus,
            })
            .eq('id', profile.id);

          if (!updateError) {
            results.push({
              profile_id: profile.id,
              sponsorship: (revenueBreakdown.commercial?.reduce((s: number, r: any) => s + r.amount, 0) ?? 0) + profileSponsorIncome,
              tv: revenueBreakdown.broadcast?.reduce((s: number, r: any) => s + r.amount, 0) ?? 0,
              total: finalNetChange,
            });

            // profile.sponsors süresi dolanları temizle (remainingDays azalt)
            if (profileSponsors.length > 0) {
              const updatedSponsors = profileSponsors
                .map((s: any) => ({ ...s, remainingDays: Math.max(0, (s.remainingDays || 0) - 7) }))
                .filter((s: any) => s.remainingDays > 0);
              await supabase
                .from('profiles')
                .update({ sponsors: updatedSponsors })
                .eq('id', profile.id);
            }
          }
        }
      }
    }

    // 4. Aktif sponsorlukların remaining_rounds'ını azalt
    if (sponsorshipTableExists && sponsorships && sponsorships.length > 0) {
      const { error: decrementError } = await supabase.rpc('decrement_sponsorship_rounds');
      if (decrementError) {
        const decErrMsg = decrementError.message || String(decrementError);
        if (decErrMsg.includes('does not exist') || decErrMsg.includes('not found')) {
          console.warn('[cron/weekly-income] ⚠️ decrement_sponsorship_rounds RPC mevcut değil! Migration çalıştırın: supabase/migrations/20250525_add_sponsorships.sql');
        } else {
          // RPC hatası var ama tablo mevcut — manuel azaltma yap
          console.warn('[cron/weekly-income] RPC çağrısı başarısız, manuel azaltma yapılıyor:', decErrMsg);
          for (const s of sponsorships) {
            const newRounds = (s.remaining_rounds || 0) - 1;
            if (newRounds <= 0) {
              await supabase
                .from('team_sponsorships')
                .update({ remaining_rounds: 0, status: 'expired' })
                .eq('profile_id', s.profile_id)
                .eq('remaining_rounds', s.remaining_rounds);
            } else {
              await supabase
                .from('team_sponsorships')
                .update({ remaining_rounds: newRounds })
                .eq('profile_id', s.profile_id)
                .eq('remaining_rounds', s.remaining_rounds);
            }
          }
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. SÖZLEŞME BİTİŞ KONTROLÜ (HATA 3 düzeltme)
    // Sözleşmesi biten oyuncuları serbest bırak
    // ═══════════════════════════════════════════════════════════════
    let contractsExpired = 0;
    let contractsWarning = 0;
    try {
      // Her profil için mevcut sezonun haftasını hesapla
      for (const profile of profiles) {
        const profileFull = profile as any;
        const currentWeek = profileFull.current_day ? Math.ceil(profileFull.current_day / 7) : 1;

        // Sözleşmesi bu hafta biten oyuncuları serbest bırak
        const { data: expiredPlayers, error: expiredErr } = await supabase
          .from('players')
          .select('id, name, team_name, contract_end_week')
          .eq('profile_id', profile.id)
          .not('contract_end_week', 'is', null)
          .lte('contract_end_week', currentWeek);

        if (expiredErr) {
          console.warn('[cron/weekly-income] Contract expiry query error:', expiredErr.message);
          continue;
        }

        if (expiredPlayers && expiredPlayers.length > 0) {
          for (const p of expiredPlayers) {
            const { error: releaseErr } = await supabase
              .from('players')
              .update({
                team_name: null,
                is_free_agent: true,
              })
              .eq('id', p.id);
            if (!releaseErr) {
              contractsExpired++;
              console.log(`[cron/weekly-income] Contract expired: ${p.name} (week ${p.contract_end_week}) released from ${p.team_name}`);
            }
          }
        }

        // 2 hafta içinde sözleşmesi bitecek oyuncuları tespit et (uyarı için)
        const warningWeek = currentWeek + 2;
        const { data: warningPlayers } = await supabase
          .from('players')
          .select('id, name, contract_end_week')
          .eq('profile_id', profile.id)
          .gt('contract_end_week', currentWeek)
          .lte('contract_end_week', warningWeek);

        if (warningPlayers && warningPlayers.length > 0) {
          contractsWarning += warningPlayers.length;
          console.log(`[cron/weekly-income] ⚠️ ${warningPlayers.length} player(s) expiring soon for ${profileFull.team_name}:`, warningPlayers.map(p => `${p.name} (week ${p.contract_end_week})`));
        }
      }
    } catch (contractErr) {
      console.warn('[cron/weekly-income] Contract check failed:', contractErr);
    }

    return NextResponse.json({
      action: 'weekly_income_distributed',
      profiles_processed: results.length,
      sponsorship_table_exists: sponsorshipTableExists,
      total_sponsorship: results.reduce((sum, r) => sum + r.sponsorship, 0),
      total_tv: results.reduce((sum, r) => sum + r.tv, 0),
      total_credits_distributed: results.reduce((sum, r) => sum + r.total, 0),
      contracts_expired: contractsExpired,
      contracts_expiring_soon: contractsWarning,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/weekly-income', method: 'GET' });
  }
}
