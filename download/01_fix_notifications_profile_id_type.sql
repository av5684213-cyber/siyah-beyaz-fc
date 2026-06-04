-- ═══════════════════════════════════════════════════════════════════════════════
-- DOSYA: 01_fix_notifications_profile_id_type.sql
-- TARIH: 2026-05-27
-- ACIKLAMA: notifications.profile_id UUID → TEXT donusumu
--
-- SORUN: notifications.profile_id tipi UUID, ama profiles.id tipi TEXT.
--        Bu yuzden FK constraint olusturulamiyor:
--        "foreign key constraint notifications_profile_id_fkey cannot be implemented"
--
-- COZUM: notifications.profile_id kolonunu UUID'den TEXT'e cevir.
--        Mevcut UUID veriler TEXT olarak korunur (UUID gecerli bir TEXT'tir).
--
-- KULLANIM: Supabase Dashboard → SQL Editor → Yapistir → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- Adim 1: Eski FK constraint'i kaldir (varsa)
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_profile_id_fkey;

-- Adim 2: profile_id kolonunu UUID'den TEXT'e donustur
-- NOT: Mevcut UUID degerler otomatik olarak TEXT'e cast edilir, veri kaybi olmaz
ALTER TABLE public.notifications
  ALTER COLUMN profile_id TYPE TEXT USING profile_id::TEXT;

-- Adim 3: Yeni FK constraint ekle (artik tipler uyusuyor: TEXT → TEXT)
DO $$
BEGIN
  ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'FK constraint notifications_profile_id_fkey already exists';
END $$;

-- Adim 4: Indeksi yeniden olustur (artik TEXT tipinde)
DROP INDEX IF EXISTS idx_notifications_profile_unread;
CREATE INDEX idx_notifications_profile_unread
  ON public.notifications(profile_id, is_read)
  WHERE is_read = FALSE;

-- Dogrulama
DO $$
DECLARE
  v_col_type TEXT;
BEGIN
  SELECT data_type INTO v_col_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'notifications'
    AND column_name = 'profile_id';

  IF v_col_type = 'text' THEN
    RAISE NOTICE 'BASARILI: notifications.profile_id artik TEXT tipinde';
  ELSE
    RAISE NOTICE 'UYARI: notifications.profile_id tipi = %, beklenen = text', v_col_type;
  END IF;
END $$;
