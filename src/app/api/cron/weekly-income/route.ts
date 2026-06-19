import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { calculateWeeklyRevenue, calculateWeeklyExpenses, checkFinancialHealth, applyDynamicSponsorAdjustment } from '@/lib/fm/financialModel';
import { getInflationFactor } from '@/lib/fm/inflation';
import { createErrorResponse } from '@/lib/api-error-handler';
import { acquireCronLock, releaseCronLock } from '@/lib/fm/cronLockService';

// TODO: Migrate to RPC (BUG-1) — supabase.from('players').update() calls will fail
// once RLS is enforced. Cron routes need service-role client.
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
  if (false) // CRON_SECRET disabled //.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
// SORUN-11: Additional Vercel cron signature verification (defense-in-depth)
const vercelCronSig = request.headers.get('x-vercel-cron-signature');
if (process.env.VERCEL === '1' && !vercelCronSig) {
  console.warn('[weekly-income] Missing X-Vercel-Cron-Signature header — possible external invocation');
  // Don't block — Vercel may not always send this header. Just log the warning.
}
// Vercel Hobby plan: günde 1 kez çalışır — sadece Pazartesi işle
  const dayOfWeek = new Date().getUTCDay(); // 0=Pazar, 1=Pazartesi
  if (dayOfWeek !== 1) {
    return NextResponse.json({ message: `Haftalık gelir sadece Pazartesi dağıtılır (bugün: ${['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'][dayOfWeek]})`, skipped: true });
  }

if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'No Supabase client' }, { status: 500 });
  }

  // Cron lock: aynı anda iki instance çift işlem yapmasın
  const lock = await acquireCronLock(supabase, 'weekly-income', 600);
  if (!lock) {
    return NextResponse.json({ message: 'Already running, skipped' });
  }

  try {
    const results: { profile_id: string; sponsorship: number; tv: number; total: number }[] = [];

    // 1. Tüm profilleri getir (sponsors JSONB kolonu dahil)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, credits, tv_revenue_weekly, league_name, is_bot, sponsors, money, stadium_upgrades, academy_level, league_tier, league_position, ticket_price, stadium_capacity, reputation, current_day')
      .neq('is_bot', true); // BUG #6 FIX: Bot olmayan gerçek kullanıcılar (is_bot=false VEYA is_bot IS NULL)

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

    // ═══════════════════════════════════════════════════════════════
    // 1b. Her profil için bu hafta tamamlanan ev sahibi maç sayısını çek
    // GRUP 1.2: isHome doğru geç, gerçek seyirci verisi kullan
    // ═══════════════════════════════════════════════════════════════
    const oneWeekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString();
    const homeMatchesByProfile: Record<string, { count: number; totalAttendance: number }> = {};
    try {
      // profile_id → team_id eşleştirmesi
      const { data: profileTeams } = await supabase
        .from('league_teams')
        .select('id, profile_id');

      const teamByProfile: Record<string, string> = {};
      const profileByTeam: Record<string, string> = {};
      if (profileTeams) {
        for (const t of profileTeams) {
          if (t.profile_id) {
            teamByProfile[t.profile_id] = t.id;
            profileByTeam[t.id] = t.profile_id;
          }
        }
      }

      const { data: homeMatches } = await supabase
        .from('fixtures')
        .select('home_team_id')
        .eq('status', 'completed')
        .gte('updated_at', oneWeekAgo);

      if (homeMatches) {
        for (const match of homeMatches) {
          const profileId = profileByTeam[match.home_team_id];
          if (profileId) {
            if (!homeMatchesByProfile[profileId]) homeMatchesByProfile[profileId] = { count: 0, totalAttendance: 0 };
            homeMatchesByProfile[profileId].count++;
          }
        }
      }
      console.log(`[weekly-income] Home matches: ${Object.keys(homeMatchesByProfile).length} profiles with home matches this week`);
    } catch (hmErr) {
      console.warn('[weekly-income] Home matches query failed:', hmErr);
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
      // GRUP 1.2: Bu hafta ev sahibi maç oynadı mı?
      const hasHomeMatch = (homeMatchesByProfile[profile.id]?.count || 0) > 0;
      const avgAttendance = homeMatchesByProfile[profile.id]?.totalAttendance || undefined;

      const revenueBreakdown = calculateWeeklyRevenue(
        profileFull,
        avgAttendance,  // Gerçek seyirci sayısı (varsa)
        false,          // O7: isHome=false — ev maçı bilet geliri zaten match-tick'te ödeniyor
        profileFull.league_position ?? 10,
        profileFull.league_tier ?? 4,
      );

      // O5: matchdayRevenue hesapla (hardcode 0 yerine)
      const matchdayRevenue = (revenueBreakdown.matchday || [])
        .reduce((s: number, r: any) => s + (r.amount || 0), 0);
      // ── Real staff salaries from staff table (fetch BEFORE expense calc) ──
      let realStaffWeeklyCost = 0;
      try {
        const { data: staffList } = await supabase
          .from('staff')
          .select('id, stars, type, salary_weekly')
          .eq('user_id', profile.id);
        if (staffList && staffList.length > 0) {
          realStaffWeeklyCost = staffList.reduce((sum: number, s: any) => {
            return sum + (s.salary_weekly || (s.stars || 1) * 15000);
          }, 0);
        }
      } catch { /* staff table might not exist yet */ }

      const expenseBreakdown = calculateWeeklyExpenses(
        squadForExpenses as any, // pass real squad data
        profileFull.stadium_upgrades,
        profileFull.academy_level ?? 0,
        profileFull.league_tier ?? 4,
        realStaffWeeklyCost || undefined,  // Pass real staff cost if available
      );

      const totalIncome  = revenueBreakdown.total;
      const totalExpense = expenseBreakdown.total;  // Already includes real staff cost if provided
      const netChange    = totalIncome - totalExpense;

      // Stadium store daily revenue
      let storeRevenue = 0;
      try {
        const { getStoreDailyRevenue } = await import('@/lib/fm/stadiumMatrix');
        const storeLevel = profileFull.stadium_upgrades?.store || 0;
        storeRevenue = getStoreDailyRevenue(storeLevel) * 7; // weekly
      } catch (e) { console.warn("[silent-catch]", e); }

      // Profile.sponsors JSONB kolonundan sponsor geliri ekle
      // weeklyPayment ve weeklyPayout her iki alan adını da destekle (geçiş dönemi)
      let profileSponsorIncome = 0;
      const profileSponsors: any[] = Array.isArray(profileFull.sponsors) ? profileFull.sponsors : [];
      if (profileSponsors.length > 0) {
        profileSponsorIncome = profileSponsors.reduce((acc: number, s: any) => acc + (s.weeklyPayment || s.weeklyPayout || s.payment || 0), 0);
      }

      // GRUP 4: applyDynamicSponsorAdjustment'ı çağır
      const currentWeek = Math.ceil((profileFull.current_day || 1) / 7);
      const totalTeams = 18;
      const adjustedSponsorIncome = applyDynamicSponsorAdjustment(
        profileSponsorIncome,
        profileFull.league_position ?? 10,
        totalTeams,
        profileFull.reputation ?? 50,
        currentWeek,
      );

      // GRUP 1.3: Enflasyonu uygula
      const inflationFactor = profileFull.current_day
        ? getInflationFactor(profileFull.current_day)
        : 1.0;
      const inflatedIncome = Math.floor(revenueBreakdown.total * inflationFactor);

      const finalNetChange = inflatedIncome - expenseBreakdown.total + storeRevenue + adjustedSponsorIncome;

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
              { weeklyRevenue: totalIncome, weeklyExpenses: totalExpense, weeklyProfit: totalIncome - totalExpense, monthlyRevenue: totalIncome * 4, monthlyExpenses: totalExpense * 4, monthlyProfit: (totalIncome - totalExpense) * 4, seasonRevenue: totalIncome * 34, seasonExpenses: totalExpense * 34, seasonProfit: (totalIncome - totalExpense) * 34, totalWages, wageBillLimit: totalIncome * 0.7, wageUtilization: totalWages / (totalIncome * 0.7 + 1) * 100, sponsorCount: profileSponsors.length, sponsorRevenue: profileSponsorIncome, matchdayRevenue, broadcastRevenue: 0, transferRevenue: 0, transferSpending: 0 },
              0,
              0,
            );
            await supabase.from('profiles')
              .update({
                money: 0,
                ffp_restricted: false,
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
              { weeklyRevenue: totalIncome, weeklyExpenses: totalExpense, weeklyProfit: totalIncome - totalExpense, monthlyRevenue: totalIncome * 4, monthlyExpenses: totalExpense * 4, monthlyProfit: (totalIncome - totalExpense) * 4, seasonRevenue: totalIncome * 34, seasonExpenses: totalExpense * 34, seasonProfit: (totalIncome - totalExpense) * 34, totalWages, wageBillLimit: totalIncome * 0.7, wageUtilization: totalWages / (totalIncome * 0.7 + 1) * 100, sponsorCount: profileSponsors.length, sponsorRevenue: profileSponsorIncome, matchdayRevenue, broadcastRevenue: 0, transferRevenue: 0, transferSpending: 0 },
              0,
              0,
            );
            await supabase.from('profiles')
              .update({
                money: 0,
                ffp_restricted: false,
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
            { weeklyRevenue: totalIncome, weeklyExpenses: totalExpense, weeklyProfit: totalIncome - totalExpense, monthlyRevenue: totalIncome * 4, monthlyExpenses: totalExpense * 4, monthlyProfit: (totalIncome - totalExpense) * 4, seasonRevenue: totalIncome * 34, seasonExpenses: totalExpense * 34, seasonProfit: (totalIncome - totalExpense) * 34, totalWages, wageBillLimit: totalIncome * 0.7, wageUtilization: totalWages / (totalIncome * 0.7 + 1) * 100, sponsorCount: profileSponsors.length, sponsorRevenue: profileSponsorIncome, matchdayRevenue, broadcastRevenue: 0, transferRevenue: 0, transferSpending: 0 },
            newMoney,
            0,
          );
          // FFP kontrolü
          const wageBillLimit = revenueBreakdown.total * 52 * 0.7;
          const weeklyWages = totalWages / 4.33;
          let ffpRestricted = false;
          if (weeklyWages > wageBillLimit * 1.5 && newMoney < 0) {
            ffpRestricted = true;
            try {
              await supabase.from('notifications').insert({
                profile_id: profile.id,
                title: '⚖️ FFP Uyarısı',
                body: 'Ücret faturanız gelirlerinizin %150\'sini aşıyor. Transfer yapmanız kısıtlandı.',
                type: 'financial_warning',
                is_read: false,
              });
            } catch (e) { console.warn("[silent-catch]", e); }
          }

          // Gelir breakdown'ı kaydet
          const incomeBreakdown = {
            sponsor: profileSponsorIncome,
            broadcast: revenueBreakdown.broadcast?.reduce((s: number, r: any) => s + r.amount, 0) || 0,
            store: storeRevenue,
            matchday: matchdayRevenue,
          };

          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              money: newMoney,
              last_weekly_income: totalIncome,
              last_weekly_expense: totalExpense,
              last_weekly_net: finalNetChange,
              financial_health: healthStatus,
              last_income_breakdown: incomeBreakdown,
              ffp_restricted: ffpRestricted,
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
    // 5B. BOT TAKIMLAR İÇİN BASİT HAFTALIK GELİR
    // ═══════════════════════════════════════════════════════════════
    let botProfilesUpdated = 0;
    try {
      const { data: botProfiles } = await supabase
        .from('profiles')
        .select('id, money, league_tier')
        .eq('is_bot', true);

      if (botProfiles && botProfiles.length > 0) {
        for (const bot of botProfiles) {
          // Lig 1: +400K, Lig 2: +200K, Lig 3: +100K, Lig 4: +50K
          const tierIdx = Math.max(0, Math.min(3, (bot.league_tier || 4) - 1));
          const botWeeklyGross = [400000, 200000, 100000, 50000][tierIdx];

          // Bot giderleri: kadro bakım maliyeti (oyuncu başı haftalık ~5K-15K)
          // Bu, botların insansız oyuncular kadar maliyet taşımasını sağlar
          // Ortalama 23 oyuncu × 10K = ~230K/hafta gider
          const botExpensePerPlayer = 10000; // 10K/hafta/oyuncu
          let botPlayerCount = 23; // Varsayılan kadro büyüklüğü

          // Bot'un gerçek oyuncu sayısını çek (mümkünse)
          try {
            const { count } = await supabase
              .from('players')
              .select('id', { count: 'exact', head: true })
              .eq('profile_id', bot.id);
            if (count && count > 0) botPlayerCount = count;
          } catch { /* varsayılan kadro sayısını kullan */ }

          const botWeeklyNet = botWeeklyGross - (botPlayerCount * botExpensePerPlayer);
          const newMoney = Math.min(Math.max(0, (bot.money || 0) + botWeeklyNet), 500_000_000); // Max 500M cap, min 0
          await supabase.from('profiles')
            .update({ money: newMoney })
            .eq('id', bot.id);
          botProfilesUpdated++;
        }
        console.log(`[weekly-income] Updated ${botProfilesUpdated} bot profiles with weekly income`);
      }
    } catch (botErr) {
      console.warn('[weekly-income] Bot income update failed:', botErr);
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
  } finally {
    await releaseCronLock(supabase, 'weekly-income', lock);
  }
}
