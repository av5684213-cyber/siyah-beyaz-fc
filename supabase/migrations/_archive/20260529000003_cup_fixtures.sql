-- ============================================================
-- GÖREV 4: Kupa fikstürü ve competition_type ayrımı
-- ============================================================

-- 1. competition_type kolonu (zaten eklendi ama kontrol edelim)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fixtures' AND column_name = 'competition_type'
  ) THEN
    ALTER TABLE fixtures ADD COLUMN competition_type VARCHAR(20) DEFAULT 'league'
      CHECK (competition_type IN ('league', 'cup', 'friendly'));
    COMMENT ON COLUMN fixtures.competition_type IS 'Maç türü: league (hafta içi lig), cup (hafta sonu kupa), friendly';
  END IF;
END $$;

-- 2. Mevcut maçları league olarak işaretle (NULL olanlar)
UPDATE fixtures SET competition_type = 'league' WHERE competition_type IS NULL;

-- 3. İndeks (zaten varsa atlanır)
CREATE INDEX IF NOT EXISTS idx_fixtures_competition_type ON fixtures(competition_type);

-- 4. fixture generation için zamanlama bilgisi:
-- Lig maçları: Hafta içi (Pazartesi-Cuma), 12:00 veya 18:00
-- Kupa maçları: Hafta sonu (Cumartesi-Pazar), 15:00 veya 20:00
-- Bu bilgi kod tarafında (season-end/route.ts ve reset-database.ts) uygulanmıştır.
