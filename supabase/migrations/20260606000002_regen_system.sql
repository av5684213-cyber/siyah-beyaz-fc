-- ═══════════════════════════════════════════════════════════════════════════
-- BUG-15: Regen System — Add regen tracking columns to players table
-- Date: 2026-06-06
-- Description: Adds columns to track regenerated players (regens) that are
--              inspired by retired legends, keeping the player pool healthy.
-- ═══════════════════════════════════════════════════════════════════════════

-- Track whether a player is a regen (generated to replace a retired player)
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_regen BOOLEAN DEFAULT FALSE;

-- Link regen to the retired player that inspired it (nullable, self-referencing)
ALTER TABLE players ADD COLUMN IF NOT EXISTS inspired_by_player_id TEXT;

-- Add index for faster regen lookups
CREATE INDEX IF NOT EXISTS idx_players_is_regen ON players(is_regen) WHERE is_regen = TRUE;
CREATE INDEX IF NOT EXISTS idx_players_inspired_by ON players(inspired_by_player_id) WHERE inspired_by_player_id IS NOT NULL;
