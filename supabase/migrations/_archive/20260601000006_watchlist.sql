-- NOTE: profiles.id and players.id are both TEXT type in this database
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, player_id)
);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_player_id ON watchlist(player_id);

-- RLS
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own watchlist" ON watchlist
  FOR SELECT USING (user_id::uuid = auth.uid());
CREATE POLICY "Users can insert own watchlist" ON watchlist
  FOR INSERT WITH CHECK (user_id::uuid = auth.uid());
CREATE POLICY "Users can delete own watchlist" ON watchlist
  FOR DELETE USING (user_id::uuid = auth.uid());

-- watchlist_details view
CREATE OR REPLACE VIEW watchlist_details AS
SELECT
  w.id AS watchlist_id,
  w.user_id,
  w.player_id,
  w.created_at,
  p.name AS player_name,
  p.position,
  p.specific_position,
  p.rating,
  p.klt,
  p.market_value,
  p.age,
  p.nation,
  p.preferred_foot,
  p.salary,
  p.photo_url
FROM watchlist w
LEFT JOIN players p ON p.id = w.player_id;
