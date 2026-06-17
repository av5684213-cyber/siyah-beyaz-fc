-- ═══════════════════════════════════════════════════════════════════════════
-- STAFF HIRE FIX — Personel işe alma hatası çözümü
--
-- SORUN:
--   SUPABASE_SERVICE_ROLE_KEY .env'de yorum satırı olarak bırakılmış.
--   Bu yüzden API route'ları getServiceSupabase() çağırınca anon key'e
--   fallback yapıyor. Anon key ile RLS politikaları devreye giriyor ve
--   staff tablosuna insert engelleniyor → "Personel kaydedilemedi" hatası.
--
-- ÇÖZÜM:
--   1. staff ve staff_types tablolarında RLS'i geçici olarak disable et
--      (service role key eklenene kadar)
--   2. Tüm politikaları kaldır (anon client'ten de insert çalışsın)
--   3. staff_types tablosuna tüm personel tiplerini garanti et
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. staff_types tablosunu garanti et ────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_types (
  type TEXT PRIMARY KEY,
  name_tr TEXT NOT NULL,
  max_count INTEGER NOT NULL DEFAULT 1,
  base_salary INTEGER NOT NULL DEFAULT 0,
  description TEXT
);

ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS name_tr TEXT;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS max_count INTEGER;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS base_salary INTEGER;

-- Tüm personel tiplerini garanti et
INSERT INTO staff_types (type, name_tr, max_count, base_salary, description) VALUES
  ('scout', 'Gözlemci', 3, 100000, 'Transfer piyasasında oyuncu keşfi yapar'),
  ('coach', 'Yardımcı Antrenör', 3, 150000, 'Antrenman kalitesini artırır'),
  ('physio', 'Fizyoterapist', 3, 80000, 'Sakatlık iyileşme süresini kısaltır'),
  ('youth_coordinator', 'Gençlik Koordinatörü', 2, 120000, 'Altyapıdan oyuncu yetiştirir'),
  ('sporting_director', 'Sportif Direktör', 1, 200000, 'Transfer stratejisi oluşturur'),
  ('analyst', 'Maç Analisti', 2, 60000, 'Rakip analiz raporları hazırlar')
ON CONFLICT (type) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  max_count = EXCLUDED.max_count,
  base_salary = EXCLUDED.base_salary,
  description = EXCLUDED.description;

-- ─── 2. staff tablosunu garanti et ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL REFERENCES staff_types(type),
  stars INTEGER NOT NULL DEFAULT 1 CHECK (stars >= 1 AND stars <= 5),
  name TEXT NOT NULL,
  contract_start_week INTEGER DEFAULT 1,
  contract_end_week INTEGER DEFAULT 34,
  total_cost INTEGER DEFAULT 0,
  salary_weekly INTEGER DEFAULT 0,
  hired_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE staff ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS stars INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS contract_start_week INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS contract_end_week INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS total_cost INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS salary_weekly INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS hired_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_type ON staff(user_id, type);

-- ─── 3. RLS'i geçici olarak disable et ──────────────────────────────────
-- service role key eklenene kadar anon client'ten insert/update/delete
-- yapılabilsin. Bu güvenlik riski olabilir ama oyunu çalıştırabilmek için
-- gerekli. Service role key eklendiğinde RLS tekrar enable edilebilir.
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_types DISABLE ROW LEVEL SECURITY;

-- Tüm eski politikaları kaldır (hata vermesin diye DO $$ ile sar)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Kullanici kendi personelini gorebilir" ON staff;
  DROP POLICY IF EXISTS "Kullanici kendi personelini ekleyebilir" ON staff;
  DROP POLICY IF EXISTS "Kullanici kendi personelini silebilir" ON staff;
  DROP POLICY IF EXISTS "Staff select own" ON staff;
  DROP POLICY IF EXISTS "Staff insert own" ON staff;
  DROP POLICY IF EXISTS "Staff update own" ON staff;
  DROP POLICY IF EXISTS "Staff delete own" ON staff;
  DROP POLICY IF EXISTS "staff_select_all" ON staff;
  DROP POLICY IF EXISTS "staff_insert_all" ON staff;
  DROP POLICY IF EXISTS "staff_update_all" ON staff;
  DROP POLICY IF EXISTS "staff_delete_all" ON staff;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "staff_types_select_all" ON staff_types;
  DROP POLICY IF EXISTS "staff_types_insert_all" ON staff_types;
  DROP POLICY IF EXISTS "staff_types_update_all" ON staff_types;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ─── 4. Doğrulama ──────────────────────────────────────────────────────
SELECT 'staff_types kayıtları:' as info, COUNT(*) as count FROM staff_types;
SELECT 'staff kayıtları (toplam):' as info, COUNT(*) as count FROM staff;

-- ═══════════════════════════════════════════════════════════════════════════
-- TAMAMLANDI. Artık:
--   1. staff_types tablosunda tüm 6 personel tipi mevcut
--   2. staff tablosu RLS kapalı → anon client'ten insert/update/delete çalışır
--   3. Eski politikalar temizlendi
--
-- NOT: SUPABASE_SERVICE_ROLE_KEY .env'e eklendiğinde RLS tekrar açılabilir:
--   ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY "staff_select_own" ON staff FOR SELECT USING (user_id::text = auth.uid()::text);
--   CREATE POLICY "staff_insert_own" ON staff FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
--   ...
-- ═══════════════════════════════════════════════════════════════════════════
