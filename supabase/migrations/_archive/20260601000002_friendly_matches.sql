CREATE TABLE IF NOT EXISTS friendly_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id TEXT NOT NULL,
  away_team_id TEXT NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  home_team_name VARCHAR(200),
  away_team_name VARCHAR(200),
  match_data JSONB
);
CREATE INDEX IF NOT EXISTS idx_friendly_matches_home ON friendly_matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_friendly_matches_away ON friendly_matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_friendly_matches_played ON friendly_matches(played_at DESC);
