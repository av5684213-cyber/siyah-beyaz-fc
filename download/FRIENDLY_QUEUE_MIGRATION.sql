-- ═══════════════════════════════════════════════════
-- FRIENDLY QUEUE: is_priority kolonu ekle
-- 1 Kredi ödeyenler öncelikli eşleşir
-- ═══════════════════════════════════════════════════

-- friendly_queue tablosu yoksa oluştur
CREATE TABLE IF NOT EXISTS friendly_queue (
  user_id TEXT PRIMARY KEY,
  team_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_priority BOOLEAN DEFAULT false
);

-- is_priority kolonu yoksa ekle
DO $$ BEGIN
  ALTER TABLE friendly_queue ADD COLUMN IF NOT EXISTS is_priority BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- friendly_matches tablosu yoksa oluştur
CREATE TABLE IF NOT EXISTS friendly_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id TEXT NOT NULL,
  away_team_id TEXT NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE friendly_queue ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY friendly_queue_select ON friendly_queue
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY friendly_queue_insert ON friendly_queue
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY friendly_queue_delete ON friendly_queue
    FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE friendly_matches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY friendly_matches_select ON friendly_matches
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY friendly_matches_insert ON friendly_matches
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
