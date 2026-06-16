#!/usr/bin/env node
/**
 * Touchline Manager — Yük Testi Scripti
 *
 * 100 eşzamanlı kullanıcıyı simüle ederek temel API endpoint'lerini test eder.
 * Sonuçları load-test-results.txt dosyasına yazar.
 *
 * Kullanım:
 *   node scripts/load-test.js
 *   BASE_URL=http://localhost:3000 node scripts/load-test.js
 */

const http = require('http');
const https = require('https');

// ═══════════════════════════════════════════════════════════════════════
// Yapılandırma
// ═══════════════════════════════════════════════════════════════════════

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENT_USERS = parseInt(process.env.USERS || '100', 10);
const TIMEOUT_MS = 15000;

const ENDPOINTS = [
  { name: 'Lig Sıralaması', method: 'GET', path: '/api/league/standings' },
  { name: 'Fikstür', method: 'GET', path: '/api/league/fixtures' },
  { name: 'Takım Oyuncuları', method: 'GET', path: '/api/league/team-players?teamId=test-team' },
  { name: 'Akademi Durumu', method: 'GET', path: '/api/academy/status?managerId=test-manager' },
  { name: 'Antrenmanlar', method: 'GET', path: '/api/trainings' },
];

// ═══════════════════════════════════════════════════════════════════════
// Yardımcı fonksiyonlar
// ═══════════════════════════════════════════════════════════════════════

/**
 * HTTP isteği gönderir ve yanıt süresini ölçer.
 */
function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = new URL(endpoint.path, BASE_URL);
    const transport = url.protocol === 'https:' ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: endpoint.method,
      timeout: TIMEOUT_MS,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SBFC-LoadTest/1.0',
      },
    };

    const req = transport.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          endpoint: endpoint.name,
          method: endpoint.method,
          path: endpoint.path,
          statusCode: res.statusCode,
          duration,
          bodyLength: body.length,
          success: res.statusCode >= 200 && res.statusCode < 400,
        });
      });
    });

    req.on('error', (err) => {
      const duration = Date.now() - startTime;
      resolve({
        endpoint: endpoint.name,
        method: endpoint.method,
        path: endpoint.path,
        statusCode: 0,
        duration,
        bodyLength: 0,
        success: false,
        error: err.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      resolve({
        endpoint: endpoint.name,
        method: endpoint.method,
        path: endpoint.path,
        statusCode: 0,
        duration,
        bodyLength: 0,
        success: false,
        error: 'TIMEOUT',
      });
    });

    req.end();
  });
}

/**
 * Bir kullanıcının tüm endpoint'leri sırayla ziyaret etmesini simüle eder.
 */
async function simulateUser(userId) {
  const results = [];
  for (const endpoint of ENDPOINTS) {
    const result = await makeRequest(endpoint);
    results.push({ userId, ...result });
  }
  return results;
}

/**
 * Sonuçları analiz eder.
 */
function analyzeResults(allResults) {
  const byEndpoint = {};
  for (const r of allResults) {
    if (!byEndpoint[r.endpoint]) {
      byEndpoint[r.endpoint] = { durations: [], successes: 0, failures: 0, errors: [] };
    }
    const group = byEndpoint[r.endpoint];
    group.durations.push(r.duration);
    if (r.success) group.successes++;
    else group.failures++;
    if (r.error) group.errors.push(r.error);
  }

  const summary = {};
  for (const [name, data] of Object.entries(byEndpoint)) {
    const sorted = [...data.durations].sort((a, b) => a - b);
    const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p90 = sorted[Math.floor(sorted.length * 0.9)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    summary[name] = {
      totalRequests: data.durations.length,
      successes: data.successes,
      failures: data.failures,
      avgMs: Math.round(avg),
      minMs: sorted[0],
      maxMs: sorted[sorted.length - 1],
      p50Ms: p50,
      p90Ms: p90,
      p99Ms: p99,
      errorRate: ((data.failures / data.durations.length) * 100).toFixed(1) + '%',
      errors: [...new Set(data.errors)],
    };
  }
  return summary;
}

/**
 * Rapor yazar.
 */
function formatReport(summary, totalDurationSec) {
  const lines = [];
  const sep = '═'.repeat(70);

  lines.push(sep);
  lines.push('  SİYAH BEYAZ FC — YÜK TESTİ RAPORU');
  lines.push(sep);
  lines.push('');
  lines.push(`  Tarih:           ${new Date().toISOString()}`);
  lines.push(`  Base URL:        ${BASE_URL}`);
  lines.push(`  Eşzamanlı Kullanıcı: ${CONCURRENT_USERS}`);
  lines.push(`  Test Süresi:     ${totalDurationSec.toFixed(1)} saniye`);
  lines.push(`  Endpoint Sayısı: ${ENDPOINTS.length}`);
  lines.push(`  Toplam İstek:    ${CONCURRENT_USERS * ENDPOINTS.length}`);
  lines.push('');

  for (const [name, stats] of Object.entries(summary)) {
    lines.push('─'.repeat(50));
    lines.push(`  📊 ${name}`);
    lines.push('─'.repeat(50));
    lines.push(`  Toplam İstek:   ${stats.totalRequests}`);
    lines.push(`  Başarılı:       ${stats.successes}`);
    lines.push(`  Başarısız:      ${stats.failures}`);
    lines.push(`  Hata Oranı:     ${stats.errorRate}`);
    lines.push('');
    lines.push(`  Ortalama:       ${stats.avgMs} ms`);
    lines.push(`  Minimum:        ${stats.minMs} ms`);
    lines.push(`  Maksimum:       ${stats.maxMs} ms`);
    lines.push(`  P50 (Medyan):   ${stats.p50Ms} ms`);
    lines.push(`  P90:            ${stats.p90Ms} ms`);
    lines.push(`  P99:            ${stats.p99Ms} ms`);
    if (stats.errors.length > 0) {
      lines.push(`  Hatalar:        ${stats.errors.join(', ')}`);
    }
    lines.push('');
  }

  // Genel özet
  const totalSuccesses = Object.values(summary).reduce((s, v) => s + v.successes, 0);
  const totalFailures = Object.values(summary).reduce((s, v) => s + v.failures, 0);
  const totalRequests = totalSuccesses + totalFailures;
  const overallErrorRate = ((totalFailures / totalRequests) * 100).toFixed(1);

  lines.push(sep);
  lines.push('  GENEL ÖZET');
  lines.push(sep);
  lines.push(`  Toplam İstek:    ${totalRequests}`);
  lines.push(`  Başarılı:        ${totalSuccesses}`);
  lines.push(`  Başarısız:       ${totalFailures}`);
  lines.push(`  Genel Hata Oranı: ${overallErrorRate}%`);
  lines.push('');

  // Performans değerlendirmesi
  const allP90s = Object.values(summary).map((s) => s.p90Ms);
  const avgP90 = allP90s.reduce((a, b) => a + b, 0) / allP90s.length;

  lines.push('  PERFORMANS DEĞERLENDİRMESİ');
  lines.push(`  Ortalama P90: ${Math.round(avgP90)} ms`);
  if (avgP90 < 500) {
    lines.push('  Durum: ✅ MÜKEMMEL — Tüm endpointler hızlı yanıt veriyor');
  } else if (avgP90 < 1500) {
    lines.push('  Durum: ⚠️ KABUL EDİLEBİLİR — Bazı endpointler yavaş');
  } else {
    lines.push('  Durum: ❌ YAVAŞ — Optimizasyon gerekli');
  }
  lines.push('');
  lines.push(sep);

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════
// Ana çalıştırma
// ═══════════════════════════════════════════════════════════════════════

async function main() {
  console.log(`\n🚀 Yük testi başlatılıyor...`);
  console.log(`   URL: ${BASE_URL}`);
  console.log(`   Kullanıcı: ${CONCURRENT_USERS}`);
  console.log(`   Endpoint: ${ENDPOINTS.length}\n`);

  const testStartTime = Date.now();

  // Kullanıcıları eşzamanlı başlat (10'arlı gruplar halinde)
  const allResults = [];
  const batchSize = 10;

  for (let i = 0; i < CONCURRENT_USERS; i += batchSize) {
    const batchCount = Math.min(batchSize, CONCURRENT_USERS - i);
    const batchPromises = [];

    for (let j = 0; j < batchCount; j++) {
      const userId = i + j + 1;
      batchPromises.push(simulateUser(userId));
    }

    const batchResults = await Promise.all(batchPromises);
    allResults.push(...batchResults.flat());

    console.log(`   İlerleme: ${Math.min(i + batchSize, CONCURRENT_USERS)}/${CONCURRENT_USERS} kullanıcı`);
  }

  const totalDurationSec = (Date.now() - testStartTime) / 1000;

  // Analiz ve rapor
  const summary = analyzeResults(allResults);
  const report = formatReport(summary, totalDurationSec);

  // Konsola yazdır
  console.log('\n' + report);

  // Dosyaya yaz
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(__dirname, '..', 'load-test-results.txt');
  fs.writeFileSync(outputPath, report, 'utf-8');
  console.log(`\n📄 Rapor kaydedildi: ${outputPath}\n`);
}

main().catch((err) => {
  console.error('Yük testi hatası:', err);
  process.exit(1);
});
