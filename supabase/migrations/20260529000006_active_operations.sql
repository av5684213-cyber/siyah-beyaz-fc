CREATE TABLE IF NOT EXISTS active_operations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL,
  op_id TEXT NOT NULL,
  impact_type TEXT NOT NULL,
  impact_value FLOAT NOT NULL,
  target_profile_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE active_operations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ops_all" ON active_operations USING (true) WITH CHECK (true);
