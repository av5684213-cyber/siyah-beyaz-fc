-- ═══════════════════════════════════════════════════════════════
-- Error Logs Tablosu
-- API route hatalarını kaydeder
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS error_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  route TEXT,
  method TEXT DEFAULT 'GET',
  user_id TEXT,
  request_body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS — sadece service role erişebilir (admin)
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Index: route + created_at (en son hataları hızlı çekmek için)
CREATE INDEX IF NOT EXISTS idx_error_logs_route_date
  ON error_logs (route, created_at DESC);

-- Index: user_id (kullanıcı bazlı hatalar)
CREATE INDEX IF NOT EXISTS idx_error_logs_user
  ON error_logs (user_id, created_at DESC);
