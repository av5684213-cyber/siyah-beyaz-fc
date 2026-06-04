-- Galibiyet serisi takibi için consecutive_wins kolonu
-- consecutive_losses zaten mevcut (20260526000005)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consecutive_wins INTEGER DEFAULT 0;
