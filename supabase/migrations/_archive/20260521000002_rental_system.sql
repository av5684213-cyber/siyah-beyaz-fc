-- ═══════════════════════════════════════════════════════════════
-- Migration: 20260521000002_rental_system.sql
-- Description: Create rental_listings and loans tables for the
--              player loan/rental system.
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- rental_listings: Oyuncuların kiralık pazarındaki ilanları
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rental_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  owner_team_id TEXT,
  daily_cost NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'completed', 'cancelled')),
  duration_weeks INT DEFAULT 17,
  listed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_rental_listings_player_id ON rental_listings(player_id);
CREATE INDEX IF NOT EXISTS idx_rental_listings_status ON rental_listings(status);
CREATE INDEX IF NOT EXISTS idx_rental_listings_owner_team ON rental_listings(owner_team_id);

-- RLS
ALTER TABLE rental_listings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Sadece policy yoksa oluştur (idempotent)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rental_listings' AND policyname = 'rental_listings_select') THEN
    CREATE POLICY "rental_listings_select" ON rental_listings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rental_listings' AND policyname = 'rental_listings_insert') THEN
    CREATE POLICY "rental_listings_insert" ON rental_listings FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rental_listings' AND policyname = 'rental_listings_update') THEN
    CREATE POLICY "rental_listings_update" ON rental_listings FOR UPDATE USING (true);
  END IF;
END
$$;


-- ─────────────────────────────────────────────────────────────
-- loans: Kiralama anlaşmaları ve geçmişi
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  owner_team_id TEXT,
  loaned_to_team_id TEXT,
  loan_fee_paid NUMERIC DEFAULT 0,
  duration_weeks INT DEFAULT 17,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'listed' CHECK (status IN ('listed', 'pending', 'active', 'completed', 'cancelled', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_loans_player_id ON loans(player_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_owner_team ON loans(owner_team_id);
CREATE INDEX IF NOT EXISTS idx_loans_loaned_to_team ON loans(loaned_to_team_id);

-- RLS
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loans' AND policyname = 'loans_select') THEN
    CREATE POLICY "loans_select" ON loans FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loans' AND policyname = 'loans_insert') THEN
    CREATE POLICY "loans_insert" ON loans FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loans' AND policyname = 'loans_update') THEN
    CREATE POLICY "loans_update" ON loans FOR UPDATE USING (true);
  END IF;
END
$$;


-- ─────────────────────────────────────────────────────────────
-- players tablosuna kiralama kolonları ekle (yoksa)
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- is_on_loan_market
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'is_on_loan_market'
  ) THEN
    ALTER TABLE players ADD COLUMN is_on_loan_market BOOLEAN DEFAULT FALSE;
  END IF;

  -- loan_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'loan_status'
  ) THEN
    ALTER TABLE players ADD COLUMN loan_status TEXT DEFAULT NULL;
  END IF;

  -- loan_fee
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'loan_fee'
  ) THEN
    ALTER TABLE players ADD COLUMN loan_fee NUMERIC DEFAULT 0;
  END IF;

  -- loan_owner_profile_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'loan_owner_profile_id'
  ) THEN
    ALTER TABLE players ADD COLUMN loan_owner_profile_id TEXT DEFAULT NULL;
  END IF;
END
$$;
