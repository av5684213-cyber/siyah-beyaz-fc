-- =============================================
-- ADIM 1: OYUNCU DEĞERLEME ALGORİTMASI MİGRASYONU
-- Form, Sakatlık Geçmişi, Yaş Faktörleri
-- =============================================

-- 1. players tablosuna injury_history (JSONB) ekle
-- Format: [{date: "2026-05-01", duration_days: 7, type: "hamstring"}, ...]
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_history JSONB DEFAULT '[]'::jsonb;

-- 2. players tablosuna form_rating (0-100) ekle
-- Son 5 maçtaki performansa göre hesaplanan değerleme faktörü
ALTER TABLE players ADD COLUMN IF NOT EXISTS form_rating INTEGER DEFAULT 50;

-- 3. form_rating için indeks (formu yüksek/düşük olanları hızlı bulmak için)
CREATE INDEX IF NOT EXISTS idx_players_form_rating ON players(form_rating) WHERE form_rating > 75 OR form_rating < 25;

-- 4. injury_history için GIN indeks (JSONB sorguları için)
CREATE INDEX IF NOT EXISTS idx_players_injury_history ON players USING GIN(injury_history);

-- 5. Mevcut oyuncular için form_rating başlangıç değeri ata
-- form alanını baz al (mevcut form 0-100 arası)
UPDATE players SET form_rating = COALESCE(form, 50) WHERE form_rating IS NULL OR form_rating = 50;

-- 6. Mevcut oyuncular için injury_history başlangıç değeri ata
-- Mevcut injury bilgisi varsa geçmişe ekle
UPDATE players
SET injury_history = CASE
  WHEN injury IS NOT NULL AND injury != 'null' AND injury != '' THEN
    jsonb_build_array(
      jsonb_build_object(
        'date', CURRENT_DATE - (COALESCE((injury::json->>'remaining_days')::int, 7)) || ' days',
        'duration_days', COALESCE((injury::json->>'remaining_days')::int, 7),
        'type', COALESCE(injury::json->>'type', 'unknown')
      )
    )
  ELSE '[]'::jsonb
END
WHERE injury_history IS NULL OR injury_history = '[]'::jsonb;

-- 7. potential alanını garanti et (eğer yoksa ekle)
ALTER TABLE players ADD COLUMN IF NOT EXISTS potential INTEGER DEFAULT 60;

-- 8. age < 22 olan oyuncularda potential > rating olmasını sağla
UPDATE players
SET potential = GREATEST(potential, rating + 5 + floor(random() * 10)::int)
WHERE age < 22 AND potential <= rating;
