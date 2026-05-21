-- ═══════════════════════════════════════════════════
-- PERSONEL SİSTEMİ MİGRASYONU
-- scout_slots, staff_coaches, staff_physios alanları
-- ═══════════════════════════════════════════════════

-- profiles tablosuna personel alanları ekle
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scout_slots INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS staff_coaches INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS staff_physios INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
