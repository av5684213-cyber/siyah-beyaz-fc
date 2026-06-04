-- ============================================================
-- referee_stats: Hakem sezon bazlı istatistikleri
-- DİKKAT: referees.id gerçek tipte TEXT (UUID değil)
-- ============================================================

-- 1) Tablo yoksa oluştur (referee_id = TEXT, referees.id ile uyumlu)
CREATE TABLE IF NOT EXISTS referee_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referee_id TEXT NOT NULL REFERENCES referees(id) ON DELETE CASCADE,
  season_id VARCHAR(100),
  matches_managed INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  fouls_called INTEGER DEFAULT 0,
  penalties_awarded INTEGER DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referee_id, season_id)
);

-- 2) Tablo zaten varsa eksik kolonları ekle
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referee_stats' AND column_name = 'referee_id') THEN
    ALTER TABLE referee_stats ADD COLUMN referee_id TEXT NOT NULL REFERENCES referees(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referee_stats' AND column_name = 'season_id') THEN
    ALTER TABLE referee_stats ADD COLUMN season_id VARCHAR(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referee_stats' AND column_name = 'matches_managed') THEN
    ALTER TABLE referee_stats ADD COLUMN matches_managed INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referee_stats' AND column_name = 'yellow_cards') THEN
    ALTER TABLE referee_stats ADD COLUMN yellow_cards INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referee_stats' AND column_name = 'red_cards') THEN
    ALTER TABLE referee_stats ADD COLUMN red_cards INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referee_stats' AND column_name = 'fouls_called') THEN
    ALTER TABLE referee_stats ADD COLUMN fouls_called INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referee_stats' AND column_name = 'penalties_awarded') THEN
    ALTER TABLE referee_stats ADD COLUMN penalties_awarded INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referee_stats' AND column_name = 'avg_rating') THEN
    ALTER TABLE referee_stats ADD COLUMN avg_rating NUMERIC DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referee_stats' AND column_name = 'created_at') THEN
    ALTER TABLE referee_stats ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referee_stats' AND column_name = 'updated_at') THEN
    ALTER TABLE referee_stats ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 3) İndeksler
CREATE INDEX IF NOT EXISTS idx_referee_stats_referee ON referee_stats(referee_id);
CREATE INDEX IF NOT EXISTS idx_referee_stats_season ON referee_stats(season_id);

-- 4) RLS
ALTER TABLE referee_stats ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'referee_stats' AND policyname = 'Referee stats readable by all') THEN
    CREATE POLICY "Referee stats readable by all" ON referee_stats FOR SELECT USING (true);
  END IF;
END $$;
