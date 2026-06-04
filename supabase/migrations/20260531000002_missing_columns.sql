-- Hâlâ DB'de eksik olan kolonlar (manuel olarak Supabase Dashboard SQL Editor'de çalıştırılmalı)
-- Çoğu kolon zaten uygulanmış durumda, sadece bu 3 kolon eksik:

-- S3-5 FIX: Atmosphere data for match simulation
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_atmosphere JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_atmosphere JSONB DEFAULT '{}';

-- S3-6 FIX: Cup season ID on fixtures for reliable bracket matching
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS cup_season_id TEXT;
