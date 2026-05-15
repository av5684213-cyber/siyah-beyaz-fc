-- =============================================
-- AÇIK ARTIRMA SİSTEMİ VERİTABANI MİGRASYONU
-- Managerium v3.0 — Auction & Bidding System
-- =============================================

-- 1. auction_bids tablosu (teklif geçmişi)
CREATE TABLE IF NOT EXISTS auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES transfer_market(id) ON DELETE CASCADE,
  bidder_id TEXT NOT NULL,
  bidder_name TEXT NOT NULL,
  bid_amount BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. auction_bids indeksleri
CREATE INDEX IF NOT EXISTS idx_auction_bids_listing ON auction_bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_bidder ON auction_bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_amount ON auction_bids(listing_id, bid_amount DESC);

-- 3. transfer_market tablosuna yeni sütunlar
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS bid_count INTEGER DEFAULT 0;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS is_auction BOOLEAN DEFAULT false;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS starting_price BIGINT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS reserve_price BIGINT;

-- 4. Mevcut serbest oyuncuları açık artırma dışında bırak (doğrudan satın al)
UPDATE transfer_market
SET is_auction = false
WHERE seller_id = 'free-agent-system' AND is_auction IS NULL;

-- 5. Mevcut kullanıcı ilanlarını açık artırma moduna al
UPDATE transfer_market
SET is_auction = true,
    expires_at = now() + INTERVAL '4 hours',
    bid_count = 0,
    starting_price = price,
    reserve_price = min_price
WHERE seller_id != 'free-agent-system' AND seller_id IS NOT NULL AND is_active = true;

-- 6. expires_at indeksi (süresi dolan artırmaları bulmak için)
CREATE INDEX IF NOT EXISTS idx_transfer_market_expires ON transfer_market(expires_at) WHERE is_active = true AND is_auction = true;

-- 7. RLS (Row Level Security) - Herkes okuyabilir, sadece ilgili kullanıcı yazabilir
ALTER TABLE auction_bids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auction_bids_select" ON auction_bids;
CREATE POLICY "auction_bids_select" ON auction_bids
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "auction_bids_insert" ON auction_bids;
CREATE POLICY "auction_bids_insert" ON auction_bids
  FOR INSERT WITH CHECK (true);

-- Not: transfer_market zaten RLS'de herkese açık

-- =============================================
-- OYUNCU KARİYER İSTATİSTİKLERİ TABLOSU
-- Managerium v3.0 — Player Career Stats
-- =============================================

-- 8. player_career_stats tablosu
-- NOT: Kolon isimleri careerStats.ts ile uyumlu olmalıdır.
--   - matches_played (kodda bu isim kullanılıyor, matches değil)
--   - team_id (profile_id değil, kod team_id kullanıyor)
--   - fouls, clean_sheets (SQL'de tanımlı, kodda da kullanılıyor)
CREATE TABLE IF NOT EXISTS player_career_stats (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  season_id TEXT NOT NULL,
  team_id TEXT,
  matches_played INT DEFAULT 0,
  goals INT DEFAULT 0,
  assists INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards INT DEFAULT 0,
  fouls INT DEFAULT 0,
  clean_sheets INT DEFAULT 0,
  avg_rating FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. player_career_stats: Eski tablo yapısından geçiş için eksik kolonları ekle
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS team_id TEXT;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS matches_played INT DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS fouls INT DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS clean_sheets INT DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Eski 'matches' kolonundaki veriyi 'matches_played' kolonuna taşı (eğer matches kolonu varsa)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_career_stats' AND column_name = 'matches'
  ) THEN
    UPDATE player_career_stats SET matches_played = COALESCE(matches_played, matches) WHERE matches_played IS NULL OR matches_played = 0;
  END IF;
END $$;

-- Eski 'profile_id' kolonundaki veriyi 'team_id' kolonuna taşı (eğer profile_id kolonu varsa)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_career_stats' AND column_name = 'profile_id'
  ) THEN
    UPDATE player_career_stats SET team_id = COALESCE(team_id, profile_id) WHERE team_id IS NULL;
  END IF;
END $$;

-- 10. player_career_stats indeksleri
CREATE INDEX IF NOT EXISTS idx_pcs_player_id ON player_career_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_pcs_season_id ON player_career_stats(season_id);
CREATE INDEX IF NOT EXISTS idx_pcs_team_id ON player_career_stats(team_id);
CREATE INDEX IF NOT EXISTS idx_pcs_player_season ON player_career_stats(player_id, season_id);

-- Eski profile_id indeksini bırak (artık kullanılmıyor)
DROP INDEX IF EXISTS idx_pcs_profile_id;

-- 11. RLS for player_career_stats
ALTER TABLE player_career_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "player_career_stats_select" ON player_career_stats;
CREATE POLICY "player_career_stats_select" ON player_career_stats
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "player_career_stats_insert" ON player_career_stats;
CREATE POLICY "player_career_stats_insert" ON player_career_stats
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "player_career_stats_update" ON player_career_stats;
CREATE POLICY "player_career_stats_update" ON player_career_stats
  FOR UPDATE USING (true);
