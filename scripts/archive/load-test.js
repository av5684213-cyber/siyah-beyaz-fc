#!/usr/bin/env node
/**
 * Touchline Manager — Load Test Script
 * 
 * Kullanım:
 *   node load-test.js [--concurrent=10] [--duration=30] [--base-url=http://localhost:3000]
 * 
 * API endpoint'lerini eşzamanlı isteklerle test eder.
 * Supabase bağlantılarını ve Next.js sunucusunu yük altında test eder.
 */

const http = require('http');
const https = require('https');

// ═══════════════════════════════════════════════════
// Konfigürasyon
// ═══════════════════════════════════════════════════

const args = process.argv.slice(2);
function getArg(name, defaultVal) {
  const found = args.find(a => a.startsWith(`--${name}=`));
  return found ? found.split('=')[1] : defaultVal;
}

const CONFIG = {
  concurrent: parseInt(getArg('concurrent', '10')),
  duration: parseInt(getArg('duration', '30')),
  baseUrl: getArg('base-url', 'http://localhost:3000'),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

// ═══════════════════════════════════════════════════
// Test Endpoint'leri
// ═══════════════════════════════════════════════════

const ENDPOINTS = [
  { name: 'Home Page', path: '/', method: 'GET', expectStatus: 200 },
  { name: 'API League Standings', path: '/api/league/standings?leagueId=4', method: 'GET', expectStatus: [200, 404] },
  { name: 'API League Fixtures', path: '/api/league/fixtures?leagueId=4', method: 'GET', expectStatus: [200, 404] },
  { name: 'API Facilities', path: '/api/facilities', method: 'GET', expectStatus: [200, 401, 405] },
  { name: 'API Trainings', path: '/api/trainings', method: 'GET', expectStatus: [200, 401, 405] },
  { name: 'API Staff', path: '/api/staff', method: 'GET', expectStatus: [200, 404] },
];

// ═══════════════════════════════════════════════════
// İstatistikler
// ═══════════════════════════════════════════════════

const stats = {
  totalRequests: 0,
  successCount: 0,
  errorCount: 0,
  timeoutCount: 0,
  statusCodes: {},
  responseTimes: [],
  endpointStats: {},
  errors: [],
};

function recordRequest(endpoint, statusCode, responseTime, error = null) {
  stats.totalRequests++;
  
  if (!stats.endpointStats[endpoint.name]) {
    stats.endpointStats[endpoint.name] = {
      total: 0,
      success: 0,
      errors: 0,
      responseTimes: [],
    };
  }
  
  const epStat = stats.endpointStats[endpoint.name];
  epStat.total++;
  stats.responseTimes.push(responseTime);
  epStat.responseTimes.push(responseTime);
  
  const expectedStatuses = Array.isArray(endpoint.expectStatus) ? endpoint.expectStatus : [endpoint.expectStatus];
  const isSuccess = expectedStatuses.includes(statusCode);
  
  if (isSuccess) {
    stats.successCount++;
    epStat.success++;
  } else {
    stats.errorCount++;
    epStat.errors++;
    if (error) {
      stats.errors.push({ endpoint: endpoint.name, status: statusCode, error: error.message });
    }
  }
  
  stats.statusCodes[statusCode] = (stats.statusCodes[statusCode] || 0) + 1;
}

// ═══════════════════════════════════════════════════
// HTTP İstek Fonksiyonu
// ═══════════════════════════════════════════════════

function makeRequest(url, method = 'GET', timeout = 10000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;
    
    const req = lib.request(url, { method, timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const elapsed = Date.now() - start;
        resolve({ status: res.statusCode, elapsed, data: data.substring(0, 200) });
      });
    });
    
    req.on('error', (err) => {
      const elapsed = Date.now() - start;
      resolve({ status: 0, elapsed, error: err.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      const elapsed = Date.now() - start;
      stats.timeoutCount++;
      resolve({ status: 0, elapsed, error: 'TIMEOUT' });
    });
    
    req.end();
  });
}

// ═══════════════════════════════════════════════════
// Test Çalıştırıcı
// ═══════════════════════════════════════════════════

async function runEndpointTest(endpoint) {
  const url = `${CONFIG.baseUrl}${endpoint.path}`;
  const result = await makeRequest(url, endpoint.method);
  recordRequest(endpoint, result.status, result.elapsed, result.error ? new Error(result.error) : null);
  return result;
}

async function runConcurrentBatch(batchSize) {
  const promises = [];
  for (let i = 0; i < batchSize; i++) {
    const endpoint = ENDPOINTS[i % ENDPOINTS.length];
    promises.push(runEndpointTest(endpoint));
  }
  return Promise.all(promises);
}

async function runLoadTest() {
  console.log('════════════════════════════════════════════════════');
  console.log('  SİYAH BEYAZ FC — LOAD TEST');
  console.log('════════════════════════════════════════════════════');
  console.log(`  Hedef: ${CONFIG.baseUrl}`);
  console.log(`  Eşzamanlı: ${CONFIG.concurrent}`);
  console.log(`  Süre: ${CONFIG.duration}s`);
  console.log(`  Endpoint Sayısı: ${ENDPOINTS.length}`);
  console.log('════════════════════════════════════════════════════\n');
  
  const startTime = Date.now();
  const endTime = startTime + (CONFIG.duration * 1000);
  let batchNum = 0;
  
  while (Date.now() < endTime) {
    batchNum++;
    process.stdout.write(`\r  Batch #${batchNum} | İstek: ${stats.totalRequests} | Başarılı: ${stats.successCount} | Hata: ${stats.errorCount} | Timeout: ${stats.timeoutCount}`);
    
    await runConcurrentBatch(CONFIG.concurrent);
    
    // Kısa bekleme (rate limiting önleme)
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log('\n\n════════════════════════════════════════════════════');
  console.log('  SONUÇLAR');
  console.log('════════════════════════════════════════════════════\n');
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const avgResponse = stats.responseTimes.length > 0
    ? (stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length).toFixed(0)
    : 0;
  const maxResponse = stats.responseTimes.length > 0 ? Math.max(...stats.responseTimes) : 0;
  const minResponse = stats.responseTimes.length > 0 ? Math.min(...stats.responseTimes) : 0;
  const reqPerSec = stats.totalRequests > 0 ? (stats.totalRequests / parseFloat(totalTime)).toFixed(2) : 0;
  const successRate = stats.totalRequests > 0 ? ((stats.successCount / stats.totalRequests) * 100).toFixed(1) : 0;
  
  console.log(`  Toplam İstek:     ${stats.totalRequests}`);
  console.log(`  Başarılı:         ${stats.successCount} (${successRate}%)`);
  console.log(`  Hata:             ${stats.errorCount}`);
  console.log(`  Timeout:          ${stats.timeoutCount}`);
  console.log(`  Toplam Süre:      ${totalTime}s`);
  console.log(`  İstek/Saniye:     ${reqPerSec}`);
  console.log(`  Ort. Yanıt:       ${avgResponse}ms`);
  console.log(`  Min. Yanıt:       ${minResponse}ms`);
  console.log(`  Max. Yanıt:       ${maxResponse}ms`);
  
  console.log('\n  ── HTTP Durum Kodları ──');
  Object.entries(stats.statusCodes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([code, count]) => {
      console.log(`    ${code}: ${count}`);
    });
  
  console.log('\n  ── Endpoint Bazlı ──');
  Object.entries(stats.endpointStats).forEach(([name, s]) => {
    const avg = s.responseTimes.length > 0
      ? (s.responseTimes.reduce((a, b) => a + b, 0) / s.responseTimes.length).toFixed(0)
      : 0;
    console.log(`    ${name}: ${s.total} istek | ${s.success} başarılı | ${s.errors} hata | Ort: ${avg}ms`);
  });
  
  if (stats.errors.length > 0) {
    console.log('\n  ── Son Hatalar ──');
    stats.errors.slice(-5).forEach(e => {
      console.log(`    [${e.status}] ${e.endpoint}: ${e.error}`);
    });
  }
  
  console.log('\n════════════════════════════════════════════════════');
  
  // Exit code
  process.exit(stats.errorCount > stats.successCount ? 1 : 0);
}

// ═══════════════════════════════════════════════════
// Başlat
// ═══════════════════════════════════════════════════

runLoadTest().catch(err => {
  console.error('Load test hatası:', err);
  process.exit(1);
});
