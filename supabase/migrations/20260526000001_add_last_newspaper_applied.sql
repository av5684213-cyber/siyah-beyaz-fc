-- PROMPT 4: Add last_newspaper_applied column to profiles table
-- Tracks when newspaper morale/reputation impact was last applied (once per day)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_newspaper_applied DATE;
