-- ============================================================
-- GÖREV 1+6: Para birimi tutarlılığı + Hakem tablosu düzeltmeleri
-- ============================================================

-- 1. Para birimi tutarlılığı: Oyun içi tüm tutarlar Euro (€)
-- Bu migration veri tipi değişikliği yapmaz, sadece tutarlılık sağlar.
-- Kod tarafında TL → € dönüşümü yapılmıştır.

-- 2. referee_id kolonu fixtures tablosunda zaten mevcut (referee.ts tarafından kullanılıyor)
-- Kontrol edelim ve yoksa ekleyelim
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fixtures' AND column_name = 'referee_id'
  ) THEN
    ALTER TABLE fixtures ADD COLUMN referee_id UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fixtures' AND column_name = 'referee_name'
  ) THEN
    ALTER TABLE fixtures ADD COLUMN referee_name VARCHAR(200);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fixtures' AND column_name = 'referee_personality'
  ) THEN
    ALTER TABLE fixtures ADD COLUMN referee_personality VARCHAR(50);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fixtures' AND column_name = 'referee_strictness'
  ) THEN
    ALTER TABLE fixtures ADD COLUMN referee_strictness INTEGER DEFAULT 50;
  END IF;
END $$;

-- 3. referees tablosu (hakem kayıtları) — yoksa oluştur
CREATE TABLE IF NOT EXISTS referees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  personality VARCHAR(50) NOT NULL DEFAULT 'dengeci',
  strictness INTEGER DEFAULT 50,
  experience INTEGER DEFAULT 5,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  total_matches INTEGER DEFAULT 0,
  total_yellows INTEGER DEFAULT 0,
  total_reds INTEGER DEFAULT 0,
  total_penalties INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeks
CREATE INDEX IF NOT EXISTS idx_referees_league ON referees(league_id);

-- RLS
ALTER TABLE referees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Referees are readable by all" ON referees FOR SELECT USING (true);
