-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: match_simulation_queue tablosu
-- ═══════════════════════════════════════════════════════════════════
-- Vercel hobby/pro planında maxDuration 10-60 saniye sınırına takılmamak
-- için maç simülasyonu queue tabanlı hale getirildi.
-- match-simulator cron sadece bu queue'ya ekler.
-- process-match-queue cron her seferinde 1 maç işler.

CREATE TABLE IF NOT EXISTS match_simulation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',       -- pending, processing, completed, failed
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Aynı fixture'ın tekrar kuyruğa eklenmesini engelle
CREATE UNIQUE INDEX IF NOT EXISTS idx_match_sim_queue_fixture_pending
  ON match_simulation_queue (fixture_id)
  WHERE status IN ('pending', 'processing');

-- Pending sıradaki ilk kayıtları hızlı bulmak için
CREATE INDEX IF NOT EXISTS idx_match_sim_queue_status
  ON match_simulation_queue (status, created_at)
  WHERE status = 'pending';

-- Failed kayıtları izlemek için
CREATE INDEX IF NOT EXISTS idx_match_sim_queue_failed
  ON match_simulation_queue (status, retry_count)
  WHERE status = 'failed';

-- RLS
ALTER TABLE match_simulation_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Queue readable by all" ON match_simulation_queue FOR SELECT USING (true);
CREATE POLICY "Queue managed by service" ON match_simulation_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Queue updatable by service" ON match_simulation_queue FOR UPDATE USING (true);
