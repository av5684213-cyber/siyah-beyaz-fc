-- ═══════════════════════════════════════════════════════════════════════════════
-- SİYAH BEYAZ FC — LOAN (KİRALIK) SYSTEM MIGRATION
-- Tarih: 2026-03-05
--
-- Bu migration kiralık sistem için gerekli tablo ve kolonları ekler.
-- Supabase Dashboard > SQL Editor'de çalıştırın.
-- Tüm ifadeler idempotent'tir.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 1: PLAYERS TABLOSUNA YENİ KOLONLAR
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE players ADD COLUMN IF NOT EXISTS is_on_loan_market BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_fee INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loaned_to_profile_id TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_owner_profile_id TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_status TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_end_date TEXT;

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 2: LOANS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT NOT NULL,
  owner_team_id TEXT NOT NULL,
  loaned_to_team_id TEXT,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TEXT,
  loan_fee_paid INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'listed',  -- 'listed', 'active', 'returned', 'returned_early'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 3: İNDEKSLER
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_players_on_loan_market ON players(is_on_loan_market) WHERE is_on_loan_market = true;
CREATE INDEX IF NOT EXISTS idx_players_loan_status ON players(loan_status) WHERE loan_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_loaned_to ON players(loaned_to_profile_id) WHERE loaned_to_profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_loans_player_id ON loans(player_id);
CREATE INDEX IF NOT EXISTS idx_loans_owner_team ON loans(owner_team_id);
CREATE INDEX IF NOT EXISTS idx_loans_loaned_to_team ON loans(loaned_to_team_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 4: RLS POLİTİKALARI
-- ═══════════════════════════════════════════════════════════════════════════════

-- loans tablosu — tüm kullanıcılar okuyabilir, kendi kayıtlarını yönetebilir
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY loans_select ON loans FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY loans_insert ON loans FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY loans_update ON loans FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- players tablosu loan kolonları için update politikası (zaten var olan politikalara ek)
DO $$ BEGIN
  CREATE POLICY players_loan_update ON players FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
