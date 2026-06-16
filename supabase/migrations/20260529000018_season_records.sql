CREATE TABLE IF NOT EXISTS season_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id TEXT NOT NULL,
  record_type TEXT NOT NULL,
  record_value INTEGER NOT NULL,
  player_name TEXT,
  season_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, record_type)
);
ALTER TABLE season_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "season_records_public" ON season_records USING (true);
