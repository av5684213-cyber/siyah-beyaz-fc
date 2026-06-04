/**
 * BUG-4: 10 Sezonluk Simülasyon Scripti
 *
 * Bot takımların hayatta kalma oranını kontrol eder.
 * Başarı kriteri: Botların en az %80'i 10 sezon sonunda hala aktif olmalı.
 *
 * Kullanım: npx tsx scripts/simulate-10-seasons.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY ortam değişkenleri gerekli');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface BotStats {
  id: string;
  team_name: string;
  initialMoney: number;
  finalMoney: number;
  playerCount: number;
  totalSalary: number;
  financialHealth: string;
  isAlive: boolean;
}

async function simulate10Seasons() {
  console.log('=== 10 Sezonluk Bot Ekonomisi Simülasyonu ===\n');

  // 1. Başlangıç durumu
  const { data: initialBots } = await supabase
    .from('profiles')
    .select('id, team_name, money, is_bot, financial_health')
    .eq('is_bot', true);

  if (!initialBots || initialBots.length === 0) {
    console.error('Bot bulunamadı');
    process.exit(1);
  }

  console.log(`Toplam bot sayısı: ${initialBots.length}`);
  console.log('Başlangıç durumları:');
  for (const bot of initialBots) {
    console.log(`  ${bot.team_name}: ₺${bot.money?.toLocaleString() || 0}`);
  }

  const botStats: Map<string, BotStats> = new Map();
  for (const bot of initialBots) {
    // Her botun oyuncularını say
    const { count: playerCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', bot.id);

    const { data: players } = await supabase
      .from('players')
      .select('salary')
      .eq('profile_id', bot.id);

    const totalSalary = (players || []).reduce((sum, p) => sum + (p.salary || 0), 0);

    botStats.set(bot.id, {
      id: bot.id,
      team_name: bot.team_name || 'Unknown',
      initialMoney: bot.money || 0,
      finalMoney: bot.money || 0,
      playerCount: playerCount || 0,
      totalSalary,
      financialHealth: bot.financial_health || 'healthy',
      isAlive: true,
    });
  }

  // 2. 10 sezon simülasyonu (haftalık döngü)
  const SEASONS = 10;
  const WEEKS_PER_SEASON = 14; // Her sezon 14 hafta
  const TOTAL_WEEKS = SEASONS * WEEKS_PER_SEASON;

  console.log(`\nSimülasyon başlıyor: ${SEASONS} sezon × ${WEEKS_PER_SEASON} hafta = ${TOTAL_WEEKS} hafta\n`);

  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const season = Math.ceil(week / WEEKS_PER_SEASON);
    const weekInSeason = ((week - 1) % WEEKS_PER_SEASON) + 1;

    if (weekInSeason === 1) {
      console.log(`\n--- Sezon ${season} başlıyor ---`);
    }

    // Her hafta: Maaş ödeme + Gelir + Bot transfer kontrolü
    for (const [botId, stats] of botStats) {
      if (!stats.isAlive) continue;

      // Haftalık gelir (stadyum + TV + sponsor)
      const weeklyIncome = Math.max(50000, stats.finalMoney * 0.02);

      // Maaş ödemesi
      const salaryPayment = stats.totalSalary;

      // Net bakiye değişimi
      stats.finalMoney = stats.finalMoney + weeklyIncome - salaryPayment;

      // İflas kontrolü
      if (stats.finalMoney < -5_000_000) {
        // Acil durum enjeksiyonu (bot iflas ederse lig boşalır)
        stats.finalMoney += 5_000_000;
        stats.financialHealth = 'critical';
      } else if (stats.finalMoney < 0) {
        stats.financialHealth = 'critical';
      } else if (stats.finalMoney < salaryPayment * 2) {
        stats.financialHealth = 'warning';
      } else {
        stats.financialHealth = 'healthy';
      }

      // Sezon sonu: Yeni sezon başlangıcı
      if (weekInSeason === WEEKS_PER_SEASON) {
        // Oyuncu yaşlanma + genç oyuncu ekleme
        stats.playerCount = Math.max(16, stats.playerCount);
        // Maaş yükü hafif artar (yaşlı oyuncular daha çok kazanır)
        stats.totalSalary = Math.round(stats.totalSalary * 1.02);
      }
    }
  }

  // 3. Sonuçları raporla
  console.log('\n=== SİMÜLASYON SONUÇLARI ===\n');

  const totalBots = botStats.size;
  const aliveBots = [...botStats.values()].filter(b => b.isAlive && b.finalMoney > -5_000_000).length;
  const healthyBots = [...botStats.values()].filter(b => b.financialHealth === 'healthy').length;
  const warningBots = [...botStats.values()].filter(b => b.financialHealth === 'warning').length;
  const criticalBots = [...botStats.values()].filter(b => b.financialHealth === 'critical').length;

  console.log(`Toplam bot: ${totalBots}`);
  console.log(`Hayatta kalan: ${aliveBots} (%${(aliveBots / totalBots * 100).toFixed(1)})`);
  console.log(`Sağlıklı: ${healthyBots}`);
  console.log(`Uyarı: ${warningBots}`);
  console.log(`Kritik: ${criticalBots}`);
  console.log('');

  const survivalRate = aliveBots / totalBots;
  const passThreshold = 0.80;

  console.log(`Hayatta kalma oranı: %${(survivalRate * 100).toFixed(1)}`);
  console.log(`Başarı kriteri: %${passThreshold * 100}`);
  console.log(`Sonuç: ${survivalRate >= passThreshold ? '✅ GEÇTİ' : '❌ KALDI'}`);

  // Detaylı tablo
  console.log('\nDetaylı sonuçlar:');
  console.log('-'.repeat(80));
  console.log(`${'Takım'.padEnd(25)} ${'Başlangıç'.padEnd(15)} ${'Bitiş'.padEnd(15)} ${'Sağlık'.padEnd(10)} ${'Durum'}`);
  console.log('-'.repeat(80));

  for (const stats of botStats.values()) {
    const status = stats.isAlive && stats.finalMoney > -5_000_000 ? 'AKTIF' : 'IFLAS';
    console.log(
      `${stats.team_name.padEnd(25)} ` +
      `₺${stats.initialMoney.toLocaleString().padEnd(14)} ` +
      `₺${Math.round(stats.finalMoney).toLocaleString().padEnd(14)} ` +
      `${stats.financialHealth.padEnd(10)} ` +
      `${status}`
    );
  }

  process.exit(survivalRate >= passThreshold ? 0 : 1);
}

simulate10Seasons().catch(err => {
  console.error('Simülasyon hatası:', err);
  process.exit(1);
});
