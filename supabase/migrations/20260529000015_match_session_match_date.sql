-- Match Sessions: match_date kolonu ekleme
-- Hava durumu tutarlılığı için maç tarihini match_sessions tablosuna kaydet
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS match_date TEXT;
