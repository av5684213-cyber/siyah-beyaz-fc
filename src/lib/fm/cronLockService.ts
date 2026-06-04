/**
 * Cron Lock Service — Supabase tabanlı cron kilitleme sistemi
 *
 * Aynı anda birden fazla cron job'un aynı işi yapmasını önler.
 * Supabase `cron_locks` tablosu kullanır (pg_advisory_lock benzeri).
 *
 * Kullanım:
 *   const lock = await acquireCronLock(supabase, 'auction-cleanup', 300);
 *   if (!lock) return; // Başka bir instance çalışıyor
 *   try { ... } finally { await releaseCronLock(supabase, 'auction-cleanup', lock); }
 */

export interface CronLock {
  id: string;
  job_name: string;
  acquired_at: string;
  expires_at: string;
  instance_id: string;
}

/**
 * Cron kilidi almayı dener.
 * Aynı job_name için aktif kilit varsa (henüz süresi dolmamışsa) null döner.
 *
 * @param supabase Supabase client
 * @param jobName Job adı (ör: 'auction-cleanup', 'process-match-queue')
 * @param ttlSeconds Kilit süresi (saniye). Süre dolmadan kilit bırakılmazsa otomatik açılır.
 * @returns Kilit objesi veya null (başka instance çalışıyor)
 */
export async function acquireCronLock(
  supabase: any,
  jobName: string,
  ttlSeconds: number = 300
): Promise<CronLock | null> {
  try {
    const instanceId = `${process.pid || 'unknown'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

    // 0. cron_locks tablosu var mı kontrol et — yoksa graceful fallback (lock yokmuş gibi devam et)
    const { error: tableCheckErr } = await supabase
      .from('cron_locks')
      .select('id')
      .limit(1);

    if (tableCheckErr) {
      // Tablo yoksa veya erişilemiyorsa — lock mekanizmasını atla, fake lock dön
      if (tableCheckErr.code === '42P01' || tableCheckErr.message?.includes('not find') || tableCheckErr.message?.includes('does not exist')) {
        console.warn(`[cronLock] cron_locks tablosu bulunamadı, lock atlanıyor (${jobName})`);
        return { id: 'no-table', job_name: jobName, acquired_at: now.toISOString(), expires_at: expiresAt.toISOString(), instance_id: instanceId } as CronLock;
      }
      // RLS hatası veya başka hata — yine devam et
      console.warn(`[cronLock] cron_locks erişim hatası: ${tableCheckErr.message}, lock atlanıyor (${jobName})`);
      return { id: 'no-table', job_name: jobName, acquired_at: now.toISOString(), expires_at: expiresAt.toISOString(), instance_id: instanceId } as CronLock;
    }

    // 1. Süresi dolmuş kilitleri temizle
    await supabase
      .from('cron_locks')
      .delete()
      .lt('expires_at', now.toISOString());

    // 2. Bu job için aktif kilit var mı kontrol et
    const { data: existingLock } = await supabase
      .from('cron_locks')
      .select('id, instance_id, expires_at')
      .eq('job_name', jobName)
      .gte('expires_at', now.toISOString())
      .maybeSingle();

    if (existingLock) {
      // Başka bir instance çalışıyor
      console.log(`[cronLock] Job "${jobName}" already locked by ${existingLock.instance_id} (expires: ${existingLock.expires_at})`);
      return null;
    }

    // 3. Kilit al (atomik insert — eğer arada başka instance aldıysa unique constraint ihlali olur)
    const { data: newLock, error } = await supabase
      .from('cron_locks')
      .insert({
        job_name: jobName,
        instance_id: instanceId,
        acquired_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      // Unique constraint violation → başka instance kilit aldı
      if (error.code === '23505') {
        console.log(`[cronLock] Job "${jobName}" lock contention, another instance acquired it`);
        return null;
      }
      console.error(`[cronLock] Lock acquisition error for "${jobName}":`, error.message);
      return null;
    }

    console.log(`[cronLock] Job "${jobName}" locked by ${instanceId} (TTL: ${ttlSeconds}s)`);
    return newLock as CronLock;
  } catch (err) {
    console.error(`[cronLock] acquireCronLock error:`, err);
    // Graceful: hata durumunda bile devam et — fake lock dön
    const instanceId = `fallback-${Date.now()}`;
    return { id: 'error-fallback', job_name: jobName, acquired_at: new Date().toISOString(), expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(), instance_id: instanceId } as CronLock;
  }
}

/**
 * Cron kilidini bırakır.
 *
 * @param supabase Supabase client
 * @param jobName Job adı
 * @param lock Acquire sırasında dönen kilit objesi
 */
export async function releaseCronLock(
  supabase: any,
  jobName: string,
  lock: CronLock
): Promise<void> {
  // Fake lock (tablo yoktu) — serbest bırakmaya gerek yok
  if (lock.id === 'no-table' || lock.id === 'error-fallback') {
    return;
  }
  try {
    // Sadece kendi kilidini bırak (instance_id kontrolü)
    await supabase
      .from('cron_locks')
      .delete()
      .eq('job_name', jobName)
      .eq('instance_id', lock.instance_id);

    console.log(`[cronLock] Job "${jobName}" lock released by ${lock.instance_id}`);
  } catch (err) {
    console.error(`[cronLock] releaseCronLock error:`, err);
  }
}

/**
 * Cron lock tablosunun varlığını kontrol eder ve yoksa oluşturur.
 * Migration'dan bağımsız olarak güvenlik ağı sağlar.
 */
export async function ensureCronLocksTable(supabase: any): Promise<boolean> {
  try {
    // Tablo var mı test et
    const { error } = await supabase
      .from('cron_locks')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      // Tablo yok — oluştur (RPC ile)
      console.log('[cronLock] cron_locks tablosu bulunamadı, oluşturuluyor...');
      const createSQL = `
        CREATE TABLE IF NOT EXISTS cron_locks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          job_name TEXT NOT NULL,
          instance_id TEXT NOT NULL,
          acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMPTZ NOT NULL,
          UNIQUE(job_name)
        );
        CREATE INDEX IF NOT EXISTS idx_cron_locks_expires ON cron_locks(expires_at);
      `;
      const { error: rpcError } = await supabase.rpc('exec_sql', { sql: createSQL });
      if (rpcError) {
        console.error('[cronLock] Tablo oluşturma hatası (RPC):', rpcError.message);
        return false;
      }
      return true;
    }

    return !error;
  } catch (err) {
    console.error('[cronLock] ensureCronLocksTable error:', err);
    return false;
  }
}
