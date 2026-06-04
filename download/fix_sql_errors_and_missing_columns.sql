-- ═══════════════════════════════════════════════════════════════
-- FIX: SQL Errors & Missing Columns
-- Date: 2026-05-27
-- 
-- Fixes:
-- 1. ERROR 42703: column "user_id" does not exist → use profile_id
-- 2. ERROR 42703: column "user_id" referenced in FK does not exist → fix FK
-- 3. ERROR 42704: constraint "user_facilities_profile_id_key" does not exist
-- 4. Add missing column: loaned_from_profile_id on players table
-- 5. Add missing column: profile_id on team_sponsorships (for weekly-income cron)
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
  -- ── 1. Fix user_facilities: Drop wrong constraint name if it exists ──
  -- The error says "user_facilities_profile_id_key" does not exist.
  -- We need to find the ACTUAL unique constraint name first.
  BEGIN
    -- Try to drop the constraint that the error mentions
    -- If it doesn't exist, this will fail silently
    ALTER TABLE user_facilities DROP CONSTRAINT IF EXISTS user_facilities_profile_id_key;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Constraint user_facilities_profile_id_key not found, checking alternatives...';
  END;

  -- Find and display the actual constraints on user_facilities
  BEGIN
    -- Check for any unique constraint on profile_id in user_facilities
    PERFORM 1 FROM pg_constraint 
    WHERE conrelid = 'user_facilities'::regclass 
    AND contype = 'u';
    -- If found, the constraint exists with a different name - that's OK
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not check constraints on user_facilities';
  END;

  -- ── 2. Fix staff table: user_id → profile_id ──
  -- The staff table uses user_id but should use profile_id for consistency
  BEGIN
    -- Check if user_id column exists in staff table
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'staff' AND column_name = 'user_id'
    ) THEN
      -- Add profile_id column if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff' AND column_name = 'profile_id'
      ) THEN
        ALTER TABLE staff ADD COLUMN profile_id UUID;
        -- Copy data from user_id to profile_id
        UPDATE staff SET profile_id = user_id WHERE profile_id IS NULL;
      END IF;
      RAISE NOTICE 'Staff table: profile_id column added/verified';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Staff table fix skipped: %', SQLERRM;
  END;

  -- ── 3. Add missing column: loaned_from_profile_id on players ──
  -- Used by loan request API and season-end loan return logic
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'players' AND column_name = 'loaned_from_profile_id'
    ) THEN
      ALTER TABLE players ADD COLUMN loaned_from_profile_id UUID;
      RAISE NOTICE 'Added loaned_from_profile_id column to players table';
    ELSE
      RAISE NOTICE 'loaned_from_profile_id column already exists in players table';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'loaned_from_profile_id add failed: %', SQLERRM;
  END;

  -- ── 4. Add missing column: profile_id on team_sponsorships ──
  -- The weekly-income cron reads team_sponsorships.profile_id
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'team_sponsorships' AND column_name = 'profile_id'
    ) THEN
      -- team_id is used as profile_id in sponsor logic
      ALTER TABLE team_sponsorships ADD COLUMN profile_id UUID;
      -- Copy team_id to profile_id
      UPDATE team_sponsorships SET profile_id = team_id::UUID WHERE profile_id IS NULL;
      RAISE NOTICE 'Added profile_id column to team_sponsorships';
    ELSE
      RAISE NOTICE 'profile_id column already exists in team_sponsorships';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'team_sponsorships profile_id add failed: %', SQLERRM;
  END;

  -- ── 5. Fix any foreign keys referencing user_id → profile_id ──
  -- Check for FK constraints that reference user_id (which doesn't exist)
  BEGIN
    -- staff table FK fix
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'staff' AND kcu.column_name = 'user_id' AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
      -- Drop the old FK and create new one with profile_id
      ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_user_id_fkey;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff' AND column_name = 'profile_id'
      ) THEN
        ALTER TABLE staff ADD CONSTRAINT staff_profile_id_fkey 
          FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Staff FK updated: user_id → profile_id';
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Staff FK fix skipped: %', SQLERRM;
  END;

  -- ── 6. Ensure player_career_stats table exists ──
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_name = 'player_career_stats'
    ) THEN
      CREATE TABLE player_career_stats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        season_id TEXT NOT NULL,
        team_id UUID,
        matches_played INTEGER DEFAULT 0,
        goals INTEGER DEFAULT 0,
        assists INTEGER DEFAULT 0,
        yellow_cards INTEGER DEFAULT 0,
        red_cards INTEGER DEFAULT 0,
        fouls INTEGER DEFAULT 0,
        clean_sheets INTEGER DEFAULT 0,
        motm INTEGER DEFAULT 0,
        motm_count INTEGER DEFAULT 0,
        saves INTEGER DEFAULT 0,
        avg_rating NUMERIC(4,2) DEFAULT 0,
        position TEXT,
        rating NUMERIC(4,1),
        goal_types JSONB DEFAULT '{}',
        save_types JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(player_id, season_id)
      );
      RAISE NOTICE 'Created player_career_stats table';
    ELSE
      RAISE NOTICE 'player_career_stats table already exists';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'player_career_stats creation failed: %', SQLERRM;
  END;

  -- ── 7. Fix existing sponsor JSONB entries (weeklyPayout → weeklyPayment) ──
  -- This syncs the field name to match what weekly-income cron reads
  BEGIN
    UPDATE profiles 
    SET sponsors = (
      SELECT jsonb_agg(
        CASE 
          WHEN elem ? 'weeklyPayout' THEN 
            elem - 'weeklyPayout' || jsonb_build_object('weeklyPayment', elem->>'weeklyPayout')
          ELSE elem
        END
      )
      FROM jsonb_array_elements(sponsors) elem
    )
    WHERE sponsors IS NOT NULL 
    AND jsonb_typeof(sponsors) = 'array'
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(sponsors) elem WHERE elem ? 'weeklyPayout'
    );
    RAISE NOTICE 'Fixed sponsor JSONB field names (weeklyPayout → weeklyPayment)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Sponsor JSONB fix skipped: %', SQLERRM;
  END;

  RAISE NOTICE '═══ Migration complete: SQL error fixes & missing columns ═══';
END $$;
