-- ═══════════════════════════════════════════════════
-- STAFF CONTRACT SYSTEM MIGRATION
-- Personel işe alım / işten çıkarma sistemi
-- ═══════════════════════════════════════════════════

-- staff_types reference table
CREATE TABLE IF NOT EXISTS staff_types (
  type TEXT PRIMARY KEY,
  name_tr TEXT NOT NULL,
  max_count INT NOT NULL,
  base_salary INT NOT NULL DEFAULT 0
);

INSERT INTO staff_types (type, name_tr, max_count, base_salary) VALUES
('scout', 'Gözlemci', 3, 50),
('coach', 'Yardımcı Antrenör', 3, 40),
('physio', 'Fizyoterapist', 3, 45),
('youth_coordinator', 'Gençlik Koordinatörü', 2, 60),
('sporting_director', 'Sportif Direktör', 1, 80),
('analyst', 'Maç Analisti', 2, 30)
ON CONFLICT (type) DO UPDATE SET name_tr = EXCLUDED.name_tr, max_count = EXCLUDED.max_count, base_salary = EXCLUDED.base_salary;

-- staff table (user's hired personnel)
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL REFERENCES staff_types(type),
  stars INT NOT NULL DEFAULT 1 CHECK (stars >= 1 AND stars <= 5),
  name TEXT NOT NULL,
  contract_start_week INT NOT NULL DEFAULT 1,
  contract_end_week INT NOT NULL DEFAULT 34,
  total_cost INT NOT NULL DEFAULT 0,
  hired_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_user ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_type ON staff(user_id, type);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "staff_select" ON staff FOR SELECT USING (user_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "staff_insert" ON staff FOR INSERT WITH CHECK (user_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "staff_delete" ON staff FOR DELETE USING (user_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
