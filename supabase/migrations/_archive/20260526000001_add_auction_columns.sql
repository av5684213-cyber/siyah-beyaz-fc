-- ═══════════════════════════════════════════════════════════════════════════
-- Açık Artırma ve Bot Düzeltme Migration
-- Tarih: 2026-05-26
-- Açıklama:
--   1. transfer_market tablosuna açık artırma kolonları ekle
--   2. seller_profile_id → seller_id düzeltmesi
--   3. seller_name, price, min_price, max_price, is_active kolonları ekle
-- ═══════════════════════════════════════════════════════════════════════════

-- seller_id (kodda kullanılan doğru kolon adı)
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS seller_id TEXT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS seller_name TEXT;

-- Fiyat kolonları
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS price BIGINT DEFAULT 0;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS min_price BIGINT DEFAULT 0;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS max_price BIGINT DEFAULT 0;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Açık artırma kolonları
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS is_auction BOOLEAN DEFAULT false;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS current_bid BIGINT DEFAULT 0;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS highest_bidder_id TEXT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS highest_bidder_name TEXT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS bid_count INT DEFAULT 0;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS starting_price BIGINT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS reserve_price BIGINT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Eski seller_profile_id kolonu varsa seller_id'ye kopyala ve kaldır
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transfer_market' AND column_name = 'seller_profile_id'
  ) THEN
    UPDATE transfer_market SET seller_id = COALESCE(seller_id, seller_profile_id) WHERE seller_id IS NULL AND seller_profile_id IS NOT NULL;
    -- Kolonu kaldırmak yerine bırakıyoruz (backward compat), artık seller_id kullanılacak
    RAISE NOTICE 'seller_profile_id verileri seller_id''ye kopyalandı';
  END IF;
END $$;
