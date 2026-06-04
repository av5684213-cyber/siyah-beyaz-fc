-- ============================================================
-- cup_seasons: Create table if missing, add missing columns if exists
-- ============================================================

-- 1) Tablo yoksa oluştur (tüm kolonlarla birlikte)
CREATE TABLE IF NOT EXISTS cup_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  team_name VARCHAR(200),
  name VARCHAR(200),
  season VARCHAR(100),
  cup_id VARCHAR(100),
  year INTEGER,
  type VARCHAR(30) DEFAULT 'domestic_cup',
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  league_id UUID,
  is_completed BOOLEAN DEFAULT FALSE,
  winner VARCHAR(200),
  runner_up VARCHAR(200),
  current_round INTEGER DEFAULT 1,
  prize_money NUMERIC DEFAULT 0,
  champion_reward NUMERIC DEFAULT 0,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Tablo zaten varsa eksik kolonları ekle
DO $$ BEGIN
  -- profile_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'profile_id') THEN
    ALTER TABLE cup_seasons ADD COLUMN profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- team_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'team_name') THEN
    ALTER TABLE cup_seasons ADD COLUMN team_name VARCHAR(200);
  END IF;

  -- name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'name') THEN
    ALTER TABLE cup_seasons ADD COLUMN name VARCHAR(200);
  END IF;

  -- season
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'season') THEN
    ALTER TABLE cup_seasons ADD COLUMN season VARCHAR(100);
  END IF;

  -- cup_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'cup_id') THEN
    ALTER TABLE cup_seasons ADD COLUMN cup_id VARCHAR(100);
  END IF;

  -- year
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'year') THEN
    ALTER TABLE cup_seasons ADD COLUMN year INTEGER;
  END IF;

  -- type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'type') THEN
    ALTER TABLE cup_seasons ADD COLUMN type VARCHAR(30) DEFAULT 'domestic_cup';
  END IF;

  -- start_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'start_date') THEN
    ALTER TABLE cup_seasons ADD COLUMN start_date DATE;
  END IF;

  -- end_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'end_date') THEN
    ALTER TABLE cup_seasons ADD COLUMN end_date DATE;
  END IF;

  -- status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'status') THEN
    ALTER TABLE cup_seasons ADD COLUMN status VARCHAR(20) DEFAULT 'upcoming';
    ALTER TABLE cup_seasons ADD CONSTRAINT cup_seasons_status_check CHECK (status IN ('upcoming', 'active', 'completed'));
  END IF;

  -- league_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'league_id') THEN
    ALTER TABLE cup_seasons ADD COLUMN league_id UUID;
  END IF;

  -- is_completed
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'is_completed') THEN
    ALTER TABLE cup_seasons ADD COLUMN is_completed BOOLEAN DEFAULT FALSE;
  END IF;

  -- winner
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'winner') THEN
    ALTER TABLE cup_seasons ADD COLUMN winner VARCHAR(200);
  END IF;

  -- runner_up
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'runner_up') THEN
    ALTER TABLE cup_seasons ADD COLUMN runner_up VARCHAR(200);
  END IF;

  -- current_round
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'current_round') THEN
    ALTER TABLE cup_seasons ADD COLUMN current_round INTEGER DEFAULT 1;
  END IF;

  -- prize_money
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'prize_money') THEN
    ALTER TABLE cup_seasons ADD COLUMN prize_money NUMERIC DEFAULT 0;
  END IF;

  -- champion_reward
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'champion_reward') THEN
    ALTER TABLE cup_seasons ADD COLUMN champion_reward NUMERIC DEFAULT 0;
  END IF;

  -- data (JSONB - full CupSeason object)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'data') THEN
    ALTER TABLE cup_seasons ADD COLUMN data JSONB;
  END IF;

  -- created_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cup_seasons' AND column_name = 'created_at') THEN
    ALTER TABLE cup_seasons ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 3) İndeksler (IF NOT EXISTS ile güvenli)
CREATE INDEX IF NOT EXISTS idx_cup_seasons_status ON cup_seasons(status);
CREATE INDEX IF NOT EXISTS idx_cup_seasons_profile ON cup_seasons(profile_id);

-- 4) RLS
ALTER TABLE cup_seasons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cup_seasons' AND policyname = 'Users can read own cup seasons') THEN
    CREATE POLICY "Users can read own cup seasons" ON cup_seasons FOR SELECT USING (profile_id = auth.uid()::text);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cup_seasons' AND policyname = 'Users can insert own cup seasons') THEN
    CREATE POLICY "Users can insert own cup seasons" ON cup_seasons FOR INSERT WITH CHECK (profile_id = auth.uid()::text);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cup_seasons' AND policyname = 'Users can update own cup seasons') THEN
    CREATE POLICY "Users can update own cup seasons" ON cup_seasons FOR UPDATE USING (profile_id = auth.uid()::text);
  END IF;
END $$;
