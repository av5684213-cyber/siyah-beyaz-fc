-- ═══════════════════════════════════════════════════════════════════════════════
-- DOSYA: 02_fix_user_facilities_constraints_and_fk.sql
-- TARIH: 2026-05-27
-- ACIKLAMA: user_facilities tablosu constraint ve FK duzeltmeleri
--
-- SORUNLAR:
--   1. "constraint user_facilities_profile_id_key does not exist"
--      → Gercek constraint: user_facilities_profile_id_facility_type_key (composite)
--   2. user_facilities tablosunda FK constraint YOK (profile_id → profiles.id)
--   3. user_facilities tablosunda created_at kolonu YOK
--
-- KULLANIM: Supabase Dashboard → SQL Editor → Yapistir → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- Adim 1: Yanlis isimli constraint'i drop etmeye calismayi birak
-- (user_facilities_profile_id_key diye bir constraint yok, bu yuzden hata veriyordu)
-- Gercek constraint: user_facilities_profile_id_facility_type_key
-- Bu zaten var ve dogru, dokunmuyoruz.

-- Adim 2: FK constraint ekle (profile_id → profiles.id, ON DELETE CASCADE)
DO $$
BEGIN
  -- Oncelikle eski FK varsa kaldir
  ALTER TABLE public.user_facilities
    DROP CONSTRAINT IF EXISTS user_facilities_profile_id_fkey;

  -- Yeni FK constraint ekle
  ALTER TABLE public.user_facilities
    ADD CONSTRAINT user_facilities_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

  RAISE NOTICE 'user_facilities.profile_id → profiles.id FK eklendi';
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'FK constraint zaten var';
WHEN OTHERS THEN
  RAISE NOTICE 'FK ekleme hatasi: %', SQLERRM;
END $$;

-- Adim 3: created_at kolonu ekle (yoksa)
ALTER TABLE public.user_facilities
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Dogrulama
DO $$
DECLARE
  v_constraint_exists BOOLEAN;
  v_column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.user_facilities'::regclass
    AND conname = 'user_facilities_profile_id_fkey'
  ) INTO v_constraint_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_facilities'
    AND column_name = 'created_at'
  ) INTO v_column_exists;

  RAISE NOTICE 'FK exists: %, created_at exists: %', v_constraint_exists, v_column_exists;
END $$;
