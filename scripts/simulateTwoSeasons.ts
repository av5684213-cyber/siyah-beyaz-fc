/**
 * simulateTwoSeasons.ts
 *
 * 2 tam sezon simülasyonu — cron pipeline'ı gerçek API endpoint'leri
 * üzerinden çalıştırarak hata bulur.
 *
 * Pipeline sırası:
 * 1. match-scheduler → canlı maç oturumları oluştur
 * 2. match-tick → maçları ilerlet (0→90 dk)
 * 3. match-simulator + process-match-queue → bot maçlarını simüle et
 * 4. weekly-income → haftalık gelir/gider
 * 5. weekly-evolution → oyuncu gelişimi
 * 6. apply-training → antrenman uygulama
 * 7. season-end → sezon bitişi + yeni sezon oluşturma
 *
 * Çalıştırma: npx tsx scripts/simulateTwoSeasons.ts
 */

const CRON_SECRET = process.env.CRON_SECRET || 'migration-secret-2025';
const BASE_URL = process.env.SIM_BASE_URL || 'http://localhost:3000';

interface SimResult {
  endpoint: string;
  status: number;
  success: boolean;
  data: any;
  durationMs: number;
  error?: string;
}

// Cron endpoint çağır
async function callCron(path: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<SimResult> {
  const start = Date.now();
  try {
    const opts: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    };
    if (body && method === 'POST') {
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(`${BASE_URL}${path}`, opts);
    const durationMs = Date.now() - start;
    let data: any;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }
    return {
      endpoint: path,
      status: res.status,
      success: res.ok,
      data,
      durationMs,
    };
  } catch (err: any) {
    return {
      endpoint: path,
      status: 0,
      success: false,
      data: null,
      durationMs: Date.now() - start,
      error: err.message,
    };
  }
}

// Bekle
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Tüm canlı maçların tamamlanmasını bekle
async function waitForLiveMatchesToComplete(maxWaitMs = 300000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const tick = await callCron('/api/cron/match-tick', 'POST');
    if (!tick.success) {
      console.log(`  ⚠️ match-tick hatası: ${tick.error || JSON.stringify(tick.data)}`);
    }
    // Canlı maç var mı kontrol et
    const { data: liveSessions } = await (await createSupabaseClient())
      .from('match_sessions')
      .select('id')
      .in('status', ['live', 'halftime'])
      .limit(1);

    if (!liveSessions || liveSessions.length === 0) {
      return true;
    }
    await sleep(2000); // 2 sn bekle
  }
  return false;
}

// Basit Supabase client (doğrulama için)
async function createSupabaseClient() {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}

// Hata günlüğü
const bugs: string[] = [];
const warnings: string[] = [];

function logBug(msg: string) {
  bugs.push(msg);
  console.log(`  🐛 BUG: ${msg}`);
}

function logWarning(msg: string) {
  warnings.push(msg);
  console.log(`  ⚠️ UYARI: ${msg}`);
}

// ═══════════════════════════════════════════════════════════════════════
// ANA SİMÜLASYON
// ═══════════════════════════════════════════════════════════════════════

async function simulateTwoSeasons() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('⚽ SİYAH BEYAZ FC — 2 SEZON SİMÜLASYONU');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`🔗 Base URL: ${BASE_URL}`);
  console.log(`🔐 Cron Secret: ${CRON_SECRET ? '***' : 'YOK!'}`);
  console.log('');

  const supabase = await createSupabaseClient();

  // ─── Başlangıç durumu ────────────────────────────────────────────
  const { data: leagues } = await supabase.from('leagues').select('id, name, tier');
  console.log(`📊 Mevcut lig sayısı: ${leagues?.length || 0}`);
  if (leagues) {
    for (const l of leagues) {
      const { count } = await supabase.from('league_teams').select('*', { count: 'exact', head: true }).eq('league_id', l.id);
      console.log(`  ${l.name} (Tier ${l.tier}): ${count || 0} takım`);
    }
  }

  const { data: seasons } = await supabase.from('seasons').select('id, year, is_finished, league_id').order('created_at', { ascending: false }).limit(5);
  console.log(`📅 Son sezonlar: ${seasons?.length || 0}`);
  if (seasons) {
    for (const s of seasons) {
      console.log(`  ${s.year} - ${s.is_finished ? 'Bitti' : 'Devam ediyor'} (${s.id})`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SEZON DÖNGÜSÜ (2 sezon)
  // ═══════════════════════════════════════════════════════════════════

  for (let seasonNum = 1; seasonNum <= 2; seasonNum++) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`🏆 SEZON ${seasonNum} BAŞLIYOR`);
    console.log(`${'═'.repeat(60)}`);

    const seasonStart = Date.now();

    // ─── 34 maç haftası simülasyonu ────────────────────────────────
    for (let matchday = 1; matchday <= 34; matchday++) {
      console.log(`\n📅 Maç Günü ${matchday}/34`);

      // 1. Bot AI aksiyonları (ilk 5 hafta)
      if (matchday <= 5) {
        const botRes = await callCron('/api/cron/bot-actions', 'POST');
        if (!botRes.success) logWarning(`bot-actions başarısız: ${botRes.error || botRes.status}`);
      }

      // 2. Maç zamanlayıcı — canlı maç oturumları oluştur
      const schedRes = await callCron('/api/cron/match-scheduler', 'POST');
      if (!schedRes.success) {
        logWarning(`match-scheduler başarısız: ${schedRes.error || schedRes.status}`);
      } else {
        const scheduled = schedRes.data?.processed || schedRes.data?.scheduled || 0;
        if (scheduled > 0) console.log(`  ⚽ ${scheduled} maç zamanlandı`);
      }

      // 3. Bot maçlarını kuyruğa al
      const simRes = await callCron('/api/cron/match-simulator', 'POST');
      if (!simRes.success) logWarning(`match-simulator başarısız: ${simRes.error || simRes.status}`);

      // 4. Bot maç kuyruğunu işle
      const procRes = await callCron('/api/cron/process-match-queue', 'POST');
      if (!procRes.success) logWarning(`process-match-queue başarısız: ${procRes.error || procRes.status}`);

      // 5. Maçları ilerlet (tick) — canlı maçlar 90 dk'ya kadar
      let tickCount = 0;
      let liveRemaining = true;
      while (liveRemaining && tickCount < 50) {
        const tickRes = await callCron('/api/cron/match-tick', 'POST');
        tickCount++;
        if (!tickRes.success) {
          logWarning(`match-tick başarısız (tick #${tickCount}): ${tickRes.error || tickRes.status}`);
          break;
        }
        // Canlı maç kaldı mı?
        const { data: live } = await supabase.from('match_sessions')
          .select('id').in('status', ['live', 'halftime']).limit(1);
        liveRemaining = !!(live && live.length > 0);
        if (liveRemaining) await sleep(500);
      }

      // 6. Antrenman uygula
      const trainRes = await callCron('/api/cron/apply-training', 'POST');
      if (!trainRes.success) logWarning(`apply-training başarısız: ${trainRes.error || trainRes.status}`);

      // 7. Haftalık işlemler (her 4 maç gününde bir)
      if (matchday % 4 === 0) {
        console.log(`  💰 Haftalık gelir dağıtımı...`);
        const incomeRes = await callCron('/api/cron/weekly-income', 'POST');
        if (!incomeRes.success) logWarning(`weekly-income başarısız: ${incomeRes.error || incomeRes.status}`);

        console.log(`  🧬 Haftalık oyuncu gelişimi...`);
        const evoRes = await callCron('/api/cron/weekly-evolution', 'POST');
        if (!evoRes.success) logWarning(`weekly-evolution başarısız: ${evoRes.error || evoRes.status}`);

        // Form rating güncelle
        const formRes = await callCron('/api/cron/update-form-ratings', 'POST');
        if (!formRes.success) logWarning(`update-form-ratings başarısız: ${formRes.error || formRes.status}`);
      }

      // Durum raporu
      const { count: liveCount } = await supabase.from('match_sessions')
        .select('*', { count: 'exact', head: true }).in('status', ['live', 'halftime']);
      const { count: scheduledCount } = await supabase.from('fixtures')
        .select('*', { count: 'exact', head: true }).eq('status', 'scheduled');
      const { count: completedCount } = await supabase.from('fixtures')
        .select('*', { count: 'exact', head: true }).eq('status', 'completed');

      if (matchday % 5 === 0 || matchday === 34) {
        console.log(`  📊 Durum: ${completedCount || 0} tamamlanmış, ${scheduledCount || 0} planlanmış, ${liveCount || 0} canlı`);
      }
    }

    // ─── Sezon sonu ────────────────────────────────────────────────
    console.log(`\n🏁 Sezon ${seasonNum} — Sezon sonu işlemi...`);
    const seasonEndRes = await callCron('/api/cron/season-end', 'POST');
    if (!seasonEndRes.success) {
      logBug(`season-end başarısız: ${seasonEndRes.error || JSON.stringify(seasonEndRes.data)}`);
    } else {
      console.log(`  ✅ Sezon sonu başarıyla tamamlandı`);
      const result = seasonEndRes.data;
      if (result?.results) {
        console.log(`  📋 Sonuçlar: ${JSON.stringify(result.results).substring(0, 200)}...`);
      }
    }

    const seasonDuration = ((Date.now() - seasonStart) / 1000).toFixed(1);
    console.log(`\n⏱️ Sezon ${seasonNum} süresi: ${seasonDuration}s`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // DOĞRULAMA VE HATA RAPORU
  // ═══════════════════════════════════════════════════════════════════

  console.log(`\n${'═'.repeat(60)}`);
  console.log('📋 SİMÜLASYON SONU DOĞRULAMASI');
  console.log(`${'═'.repeat(60)}`);

  // Lig durumu
  const { data: finalLeagues } = await supabase.from('leagues').select('id, name, tier');
  if (finalLeagues) {
    for (const l of finalLeagues) {
      const { count: teamCount } = await supabase.from('league_teams')
        .select('*', { count: 'exact', head: true }).eq('league_id', l.id);
      console.log(`  ${l.name} (Tier ${l.tier}): ${teamCount || 0} takım`);
      if ((teamCount || 0) > 18) {
        logBug(`${l.name} — ${teamCount} takım var, 18'den fazla!`);
      }
    }
  }

  // Sezon durumu
  const { data: finalSeasons } = await supabase.from('seasons')
    .select('id, year, is_finished').order('created_at', { ascending: false }).limit(5);
  if (finalSeasons) {
    for (const s of finalSeasons) {
      console.log(`  Sezon ${s.year}: ${s.is_finished ? 'Bitti ✅' : 'Devam ediyor ⏳'}`);
    }
  }

  // Canlı maç kaldı mı?
  const { count: liveRemain } = await supabase.from('match_sessions')
    .select('*', { count: 'exact', head: true }).in('status', ['live', 'halftime']);
  if (liveRemain && liveRemain > 0) {
    logBug(`Simülasyon sonrası ${liveRemain} canlı maç kaldı!`);
  }

  // Fixture durumu
  const { count: scheduledRemain } = await supabase.from('fixtures')
    .select('*', { count: 'exact', head: true }).eq('status', 'scheduled');
  if (scheduledRemain && scheduledRemain > 0) {
    logBug(`${scheduledRemain} planlanmış fixture kaldı!`);
  }

  // Oyuncu kontrolü
  const { count: totalPlayers } = await supabase.from('players')
    .select('*', { count: 'exact', head: true });
  console.log(`  Toplam oyuncu: ${totalPlayers || 0}`);

  // Negatif bakiye kontrolü
  const { data: bankruptTeams } = await supabase.from('profiles')
    .select('id, team_name, money').lt('money', 0);
  if (bankruptTeams && bankruptTeams.length > 0) {
    for (const t of bankruptTeams) {
      logWarning(`Negatif bakiye: ${t.team_name} = ${t.money}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // HATA RAPORU
  // ═══════════════════════════════════════════════════════════════════

  console.log(`\n${'═'.repeat(60)}`);
  console.log('🐛 HATA RAPORU');
  console.log(`${'═'.repeat(60)}`);

  if (bugs.length === 0 && warnings.length === 0) {
    console.log('✅ Hiçbir hata veya uyarı bulunamadı!');
  } else {
    if (bugs.length > 0) {
      console.log(`\n🔴 BULUNAN HATALAR (${bugs.length}):`);
      bugs.forEach((b, i) => console.log(`  ${i + 1}. ${b}`));
    }
    if (warnings.length > 0) {
      console.log(`\n🟡 UYARILAR (${warnings.length}):`);
      warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('⚽ SİMÜLASYON TAMAMLANDI');
  console.log('═══════════════════════════════════════════════════════════════');
}

// Çalıştır
simulateTwoSeasons().catch(err => {
  console.error('❌ Simülasyon çöktü:', err);
  process.exit(1);
});
