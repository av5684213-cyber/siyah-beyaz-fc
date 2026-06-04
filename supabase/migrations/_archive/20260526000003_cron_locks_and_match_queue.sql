-- ═══════════════════════════════════════════════════════════════
-- Cron Lock Tablosu — Eşzamanlı cron job'ların çakışmasını önler
-- ═══════════════════════════════════════════════════════════════
-- Aynı job_name için sadece bir instance çalışabilir.
-- Süresi dolan kilitler otomatik olarak geçersiz sayılır.

CREATE TABLE IF NOT EXISTS cron_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(job_name)
);

-- Süresi dolan kilitleri hızlı bulmak için index
CREATE INDEX IF NOT EXISTS idx_cron_locks_expires ON cron_locks(expires_at);

-- match_simulation_queue tablosu (yoksa oluştur)
-- process-match-queue ve match-simulator cron'ları bu tabloyu kullanır
CREATE TABLE IF NOT EXISTS match_simulation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID NOT NULL UNIQUE,
  season_id UUID,
  league_id UUID,
  home_team_id UUID NOT NULL,
  away_team_id UUID NOT NULL,
  match_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- pending kuyruk sorguları için index
CREATE INDEX IF NOT EXISTS idx_match_queue_status ON match_simulation_queue(status);
CREATE INDEX IF NOT EXISTS idx_match_queue_fixture ON match_simulation_queue(fixture_id);

-- RLS etkinleştir (service_role tam erişim, anon sadece okuma)
ALTER TABLE cron_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_simulation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on cron_locks" ON cron_locks
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on match_queue" ON match_simulation_queue
  FOR ALL USING (auth.role() = 'service_role');
