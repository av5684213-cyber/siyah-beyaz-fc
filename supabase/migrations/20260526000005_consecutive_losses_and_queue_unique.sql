-- PROMPT 9: consecutive_losses column on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consecutive_losses INTEGER DEFAULT 0;

-- PROMPT 10: unique constraint on match_simulation_queue to prevent duplicate fixtures
-- PostgreSQL does not support ADD CONSTRAINT IF NOT EXISTS, use DO block instead
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uniq_queue_fixture'
  ) THEN
    ALTER TABLE match_simulation_queue ADD CONSTRAINT uniq_queue_fixture UNIQUE (fixture_id);
  END IF;
END $$;
