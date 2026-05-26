-- ============================================================
-- FIX: profile_id UUID -> TEXT type mismatch
-- profiles.id is TEXT, so all profile_id FK columns must be TEXT
-- This migration repairs tables that were created with UUID type
-- ============================================================

-- Helper function to safely drop FK constraints
DO $$ BEGIN
  -- ── scouted_players ──
  -- Drop table if it exists with wrong UUID type and recreate with TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scouted_players' AND column_name = 'profile_id'
    AND data_type = 'uuid'
  ) THEN
    -- Drop existing policies first
    DROP POLICY IF EXISTS "Users can read own scouted players" ON scouted_players;
    DROP POLICY IF EXISTS "Users can insert own scouted players" ON scouted_players;

    -- Drop FK constraint if exists
    ALTER TABLE scouted_players DROP CONSTRAINT IF EXISTS scouted_players_profile_id_fkey;

    -- Change column type from UUID to TEXT
    ALTER TABLE scouted_players ALTER COLUMN profile_id TYPE TEXT USING profile_id::text;

    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouted_players' AND column_name = 'player_name') THEN
      ALTER TABLE scouted_players ADD COLUMN player_name VARCHAR(200);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouted_players' AND column_name = 'position') THEN
      ALTER TABLE scouted_players ADD COLUMN position VARCHAR(10);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouted_players' AND column_name = 'rating') THEN
      ALTER TABLE scouted_players ADD COLUMN rating INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouted_players' AND column_name = 'potential') THEN
      ALTER TABLE scouted_players ADD COLUMN potential INTEGER;
    END IF;

    -- Drop old columns that shouldn't exist in the new schema
    ALTER TABLE scouted_players DROP COLUMN IF EXISTS scout_level;
    ALTER TABLE scouted_players DROP COLUMN IF EXISTS notes;

    -- Add FK constraint with correct TEXT type
    ALTER TABLE scouted_players ADD CONSTRAINT scouted_players_profile_id_fkey
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

    -- Recreate RLS policies with auth.uid()::text
    CREATE POLICY "Users can read own scouted players" ON scouted_players FOR SELECT USING (profile_id = auth.uid()::text);
    CREATE POLICY "Users can insert own scouted players" ON scouted_players FOR INSERT WITH CHECK (profile_id = auth.uid()::text);
  END IF;

  -- ── user_facilities ──
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_facilities' AND column_name = 'profile_id'
    AND data_type = 'uuid'
  ) THEN
    DROP POLICY IF EXISTS "Users can read own facilities" ON user_facilities;
    DROP POLICY IF EXISTS "Users can insert own facilities" ON user_facilities;
    DROP POLICY IF EXISTS "Users can update own facilities" ON user_facilities;

    ALTER TABLE user_facilities DROP CONSTRAINT IF EXISTS user_facilities_profile_id_fkey;
    ALTER TABLE user_facilities ALTER COLUMN profile_id TYPE TEXT USING profile_id::text;
    ALTER TABLE user_facilities ADD CONSTRAINT user_facilities_profile_id_fkey
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

    CREATE POLICY "Users can read own facilities" ON user_facilities FOR SELECT USING (profile_id = auth.uid()::text);
    CREATE POLICY "Users can insert own facilities" ON user_facilities FOR INSERT WITH CHECK (profile_id = auth.uid()::text);
    CREATE POLICY "Users can update own facilities" ON user_facilities FOR UPDATE USING (profile_id = auth.uid()::text);
  END IF;

  -- ── player_achievements ──
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_achievements' AND column_name = 'profile_id'
    AND data_type = 'uuid'
  ) THEN
    DROP POLICY IF EXISTS "Users can read own achievements" ON player_achievements;

    ALTER TABLE player_achievements DROP CONSTRAINT IF EXISTS player_achievements_profile_id_fkey;
    ALTER TABLE player_achievements ALTER COLUMN profile_id TYPE TEXT USING profile_id::text;
    ALTER TABLE player_achievements ADD CONSTRAINT player_achievements_profile_id_fkey
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

    CREATE POLICY "Users can read own achievements" ON player_achievements FOR SELECT USING (profile_id = auth.uid()::text);
  END IF;

  -- ── hall_of_fame ──
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hall_of_fame' AND column_name = 'profile_id'
    AND data_type = 'uuid'
  ) THEN
    DROP POLICY IF EXISTS "Users can read own HOF" ON hall_of_fame;

    ALTER TABLE hall_of_fame DROP CONSTRAINT IF EXISTS hall_of_fame_profile_id_fkey;
    ALTER TABLE hall_of_fame ALTER COLUMN profile_id TYPE TEXT USING profile_id::text;
    ALTER TABLE hall_of_fame ADD CONSTRAINT hall_of_fame_profile_id_fkey
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

    CREATE POLICY "Users can read own HOF" ON hall_of_fame FOR SELECT USING (profile_id = auth.uid()::text);
  END IF;

  -- ── season_awards ──
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'season_awards' AND column_name = 'profile_id'
    AND data_type = 'uuid'
  ) THEN
    DROP POLICY IF EXISTS "Users can read own awards" ON season_awards;

    ALTER TABLE season_awards DROP CONSTRAINT IF EXISTS season_awards_profile_id_fkey;
    ALTER TABLE season_awards ALTER COLUMN profile_id TYPE TEXT USING profile_id::text;
    ALTER TABLE season_awards ADD CONSTRAINT season_awards_profile_id_fkey
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

    CREATE POLICY "Users can read own awards" ON season_awards FOR SELECT USING (profile_id = auth.uid()::text);
  END IF;

  -- ── Also handle scouted_players created with TEXT but missing FK/columns (from 20260526 migration) ──
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scouted_players' AND column_name = 'profile_id'
    AND data_type = 'text'
  ) THEN
    -- Add FK if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name = 'scouted_players' AND constraint_name = 'scouted_players_profile_id_fkey'
    ) THEN
      ALTER TABLE scouted_players ADD CONSTRAINT scouted_players_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouted_players' AND column_name = 'player_name') THEN
      ALTER TABLE scouted_players ADD COLUMN player_name VARCHAR(200);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouted_players' AND column_name = 'position') THEN
      ALTER TABLE scouted_players ADD COLUMN position VARCHAR(10);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouted_players' AND column_name = 'rating') THEN
      ALTER TABLE scouted_players ADD COLUMN rating INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouted_players' AND column_name = 'potential') THEN
      ALTER TABLE scouted_players ADD COLUMN potential INTEGER;
    END IF;

    -- Ensure RLS policies exist with auth.uid()::text
    DROP POLICY IF EXISTS "Users can read own scouted players" ON scouted_players;
    DROP POLICY IF EXISTS "Users can insert own scouted players" ON scouted_players;
    CREATE POLICY "Users can read own scouted players" ON scouted_players FOR SELECT USING (profile_id = auth.uid()::text);
    CREATE POLICY "Users can insert own scouted players" ON scouted_players FOR INSERT WITH CHECK (profile_id = auth.uid()::text);
  END IF;
END $$;
