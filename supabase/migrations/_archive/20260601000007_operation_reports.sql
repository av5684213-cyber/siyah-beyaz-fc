CREATE TABLE IF NOT EXISTS operation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  operation_type VARCHAR(100) NOT NULL,
  result JSONB,
  reported_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_operation_reports_user ON operation_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_reports_type ON operation_reports(operation_type);
