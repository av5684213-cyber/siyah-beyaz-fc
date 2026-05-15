-- =============================================
-- ADIM 2: MAÇ MOTORU DETAYLARI MİGRASYONU
-- Sarı/Kırmızı Kart Cezaları, Sakatlık, Maç Olayları
-- =============================================

-- 1. match_history tablosuna events (JSONB) alanı ekle
-- Maç simülasyonu sırasında gol, asist, sarı, kırmızı, sakatlık olaylarını dakika bazında kaydet
ALTER TABLE match_history ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]'::jsonb;

-- 2. match_history tablosuna status alanı ekle (sunucu tarafı doğrulama için)
ALTER TABLE match_history ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- 3. match_history tablosuna season_id alanı ekle
ALTER TABLE match_history ADD COLUMN IF NOT EXISTS season_id UUID;

-- 4. players tablosuna suspended_until (DATE) ekle - kart cezaları için
ALTER TABLE players ADD COLUMN IF NOT EXISTS suspended_until DATE;

-- 5. players tablosuna is_injured (BOOLEAN) ekle - sakatlık durumu
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_injured BOOLEAN DEFAULT false;

-- 6. players tablosuna injury_end_date (DATE) ekle - sakatlık bitiş tarihi
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_end_date DATE;

-- 7. İndeksler
CREATE INDEX IF NOT EXISTS idx_players_suspended ON players(suspended_until) WHERE suspended_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_injured ON players(is_injured) WHERE is_injured = true;
CREATE INDEX IF NOT EXISTS idx_match_history_season ON match_history(season_id) WHERE season_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_match_history_events ON match_history USING GIN(events);

-- 8. Mevcut injury verisinden is_injured ve injury_end_date güncelle
UPDATE players
SET
  is_injured = true,
  injury_end_date = CURRENT_DATE + COALESCE((injury::jsonb->>'remaining_days')::int, 7)
WHERE injury IS NOT NULL
  AND injury::text NOT IN ('null', '""', '{}')
  AND jsonb_typeof(injury::jsonb) != 'null'
  AND is_injured = false;
