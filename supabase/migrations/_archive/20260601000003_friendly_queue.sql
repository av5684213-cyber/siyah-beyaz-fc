CREATE TABLE IF NOT EXISTS friendly_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_name VARCHAR(200),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_priority BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_friendly_queue_expires ON friendly_queue(expires_at);
CREATE INDEX IF NOT EXISTS idx_friendly_queue_user ON friendly_queue(user_id);
