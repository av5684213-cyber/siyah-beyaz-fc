-- PROMPT 8: held_amount for auction bid reservation
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS held_amount BIGINT DEFAULT 0;

-- PROMPT 10: season_yellow_cards for cumulative yellow card tracking
ALTER TABLE players ADD COLUMN IF NOT EXISTS season_yellow_cards INTEGER DEFAULT 0;
