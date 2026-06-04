CREATE TABLE IF NOT EXISTS match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  minute INTEGER NOT NULL,
  player_id TEXT,
  team VARCHAR(10) CHECK (team IN ('home', 'away', 'neutral')),
  detail JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_match_events_fixture ON match_events(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_events_type ON match_events(event_type);
CREATE INDEX IF NOT EXISTS idx_match_events_player ON match_events(player_id);
