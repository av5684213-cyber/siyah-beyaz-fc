/**
 * BUG-4: Bot Ekonomisi Monitörü Cron
 *
 * Haftada bir çalışır, tüm bot takımların mali durumunu kontrol eder.
 * Riskli botları tespit eder ve otomatik düzeltme uygular:
 * - Kritik bakiyeli botların yüksek maaşlı oyuncularını satışa çıkarır
 * - İflas eşiğindeki botlara enjeksiyon yapar (ölçeklenmiş)
 * - financial_health skorunu günceller
 *
 * GET /api/cron/bot-economy-check
 * Header: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';

const SALARY_BUDGET_RATIO = 0.60;
const CRITICAL_BALANCE_RATIO = 0.3; // Bakiye haftalık maaşın %30'undan azsa kritik
const EMERGENCY_INJECTION = 5_000_000; // 5M acil durum enjeksiyonu
const AT_RISK_RATIO = 0.9; // Maaş yükü bütçenin %90'ını aşarsa riskli

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Vercel Hobby plan: günde 1 kez çalışır — sadece Pazartesi işle
  const dayOfWeek = new Date().getUTCDay(); // 0=Pazar, 1=Pazartesi
  if (dayOfWeek !== 1) {
    return NextResponse.json({ message: `Bot ekonomi kontrolü sadece Pazartesi yapılır (bugün: ${['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'][dayOfWeek]})`, skipped: true });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client is null' }, { status: 500 });
  }

  const results: Array<{
    botId: string;
    teamName: string;
    money: number;
    salaryLoad: number;
    salaryBudget: number;
    availableSalarySpace: number;
    weeklyIncome: number;
    isOverloaded: boolean;
    isAtRisk: boolean;
    health: string;
    action: string;
  }> = [];

  try {
    // Tüm bot profillerini al
    const { data: bots, error: botsError } = await supabase
      .from('profiles')
      .select('id, team_name, money, is_bot, financial_health, last_weekly_income')
      .eq('is_bot', true);

    if (botsError || !bots) {
      return NextResponse.json({ error: 'Failed to fetch bots' }, { status: 500 });
    }

    for (const bot of bots) {
      // Toplam maaş yükünü hesapla
      const { data: players } = await supabase
        .from('players')
        .select('id, name, salary, rating, market_value')
        .eq('profile_id', bot.id);

      const totalSalary = (players || []).reduce((sum, p) => sum + (p.salary || 0), 0);
      const weeklyIncome = bot.last_weekly_income || Math.max(50000, (bot.money || 0) * 0.02);
      const salaryBudget = weeklyIncome * SALARY_BUDGET_RATIO;
      const availableSalarySpace = salaryBudget - totalSalary;
      const isOverloaded = totalSalary > salaryBudget;
      const isAtRisk = totalSalary > salaryBudget * AT_RISK_RATIO;

      let health: string = bot.financial_health || 'healthy';
      let action = 'none';

      // BUG-4: Riskli botları logla (salary_load > salary_budget * 0.9)
      if (isAtRisk) {
        console.warn(
          `[bot-economy-check] ⚠️ RİSKLİ BOT: ${bot.team_name} ` +
          `salary_load=₺${totalSalary.toLocaleString()} > ` +
          `salary_budget*0.9=₺${Math.round(salaryBudget * AT_RISK_RATIO).toLocaleString()} ` +
          `(${((totalSalary / salaryBudget) * 100).toFixed(1)}% yük), ` +
          `kalan alan=₺${availableSalarySpace.toLocaleString()}`
        );
      }

      // ── Sağlık durumu değerlendirmesi ──
      if (totalSalary > salaryBudget * 1.5) {
        health = 'critical';
      } else if (totalSalary > salaryBudget) {
        health = 'warning';
      } else if (bot.money < totalSalary * CRITICAL_BALANCE_RATIO) {
        health = 'critical';
      } else if (bot.money < totalSalary) {
        health = 'warning';
      } else {
        health = 'healthy';
      }

      // ── Otomatik düzeltme ──
      if (health === 'critical') {
        // 1. En yüksek maaşlı 3 oyuncuyu satışa çıkar
        const highSalaryPlayers = [...(players || [])]
          .sort((a, b) => (b.salary || 0) - (a.salary || 0))
          .slice(0, 3);

        for (const p of highSalaryPlayers) {
          // Zaten satılık mı kontrol et
          const { data: existingListing } = await supabase
            .from('transfer_market')
            .select('id')
            .eq('player_id', p.id)
            .eq('is_active', true)
            .maybeSingle();

          if (!existingListing) {
            const salePrice = Math.round((p.market_value || p.rating * 50000) * 0.7);
            // TODO: Migrate to RPC (BUG-1) — transfer_market.insert will fail once RLS is enforced;
            // cron routes may need service-role client to bypass RLS
            await supabase.from('transfer_market').insert({
              player_id: p.id,
              player_data: p,
              seller_id: bot.id,
              seller_name: bot.team_name,
              price: salePrice,
              min_price: Math.round(salePrice * 0.6),
              max_price: Math.round(salePrice * 1.3),
              is_active: true,
              is_auction: true,
              starting_price: salePrice,
              reserve_price: Math.round(salePrice * 0.6),
              bid_count: 0,
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              version: 1,
            });
          }
        }
        action = 'listed_high_salary_players';

        // 2. Acil durum para enjeksiyonu (bot iflas ederse lig boşalır)
        if (bot.money < 1_000_000) {
          const newMoney = (bot.money || 0) + EMERGENCY_INJECTION;
          await supabase.rpc('rpc_update_profile', {
            p_profile_id: bot.id,
            p_updates: { money: newMoney },
          });
          action += '+emergency_injection';
        }
      } else if (health === 'warning') {
        // Uyarı: En yüksek maaşlı 1 oyuncuyu satışa çıkar
        const topSalary = [...(players || [])]
          .sort((a, b) => (b.salary || 0) - (a.salary || 0))[0];

        if (topSalary && topSalary.salary > salaryBudget * 0.3) {
          const { data: existingListing } = await supabase
            .from('transfer_market')
            .select('id')
            .eq('player_id', topSalary.id)
            .eq('is_active', true)
            .maybeSingle();

          if (!existingListing) {
            const salePrice = Math.round((topSalary.market_value || topSalary.rating * 50000) * 0.75);
            // TODO: Migrate to RPC (BUG-1) — transfer_market.insert will fail once RLS is enforced;
            // cron routes may need service-role client to bypass RLS
            await supabase.from('transfer_market').insert({
              player_id: topSalary.id,
              player_data: topSalary,
              seller_id: bot.id,
              seller_name: bot.team_name,
              price: salePrice,
              min_price: Math.round(salePrice * 0.6),
              max_price: Math.round(salePrice * 1.3),
              is_active: true,
              is_auction: true,
              starting_price: salePrice,
              reserve_price: Math.round(salePrice * 0.6),
              bid_count: 0,
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              version: 1,
            });
            action = 'listed_top_salary_player';
          }
        }
      }

      // Health durumunu güncelle (RPC ile — RLS uyumlu)
      if (health !== (bot.financial_health || 'healthy')) {
        await supabase.rpc('rpc_update_profile', {
          p_profile_id: bot.id,
          p_updates: {
            financial_health: health,
            total_salary_load: totalSalary,
            salary_budget: Math.round(salaryBudget),
          },
        });
      }

      results.push({
        botId: bot.id,
        teamName: bot.team_name || 'Unknown',
        money: bot.money || 0,
        salaryLoad: totalSalary,
        salaryBudget: Math.round(salaryBudget),
        availableSalarySpace: Math.round(availableSalarySpace),
        weeklyIncome: Math.round(weeklyIncome),
        isOverloaded,
        isAtRisk,
        health,
        action,
      });
    }

    const criticalCount = results.filter(r => r.health === 'critical').length;
    const warningCount = results.filter(r => r.health === 'warning').length;
    const healthyCount = results.filter(r => r.health === 'healthy').length;
    const atRiskCount = results.filter(r => r.isAtRisk).length;
    const overloadedCount = results.filter(r => r.isOverloaded).length;

    return NextResponse.json({
      success: true,
      totalBots: results.length,
      healthy: healthyCount,
      warning: warningCount,
      critical: criticalCount,
      atRisk: atRiskCount,
      overloaded: overloadedCount,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[bot-economy-check] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
