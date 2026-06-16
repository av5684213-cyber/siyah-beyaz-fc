CREATE TABLE IF NOT EXISTS league_forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  league_id TEXT NOT NULL,
  team_name TEXT,
  content TEXT NOT NULL CHECK (length(content) <= 280),
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE league_forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forum_public_read" ON league_forum_posts FOR SELECT USING (true);
CREATE POLICY "forum_owner_write" ON league_forum_posts FOR INSERT WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_forum_league ON league_forum_posts(league_id, created_at DESC);
