-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: Oyunculara contract_end_week ve is_free_agent ekle
-- ═══════════════════════════════════════════════════════════════════
-- Sözleşme bitiş haftası (integer) — mevcut sezonun hafta sayısına göre
-- Örnek: contract_end_week = 34 → sezonun 34. haftasında sözleşme biter
-- NULL = sözleşme bilgisi yok (eski oyuncular için)

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS contract_end_week INTEGER DEFAULT 34;

-- Serbest oyuncı flag'i
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS is_free_agent BOOLEAN DEFAULT false;

-- Mevcut oyuncuların sözleşmelerini ayarla (ilk sezon 34 hafta)
UPDATE players
SET contract_end_week = 34
WHERE contract_end_week IS NULL AND team_name IS NOT NULL AND team_name != '';

-- Takımı olmayan oyuncuları serbest işaretle
UPDATE players
SET is_free_agent = true
WHERE team_name IS NULL OR team_name = '';

-- İndeks: sözleşmesi yaklaşan oyuncuları hızlı bulmak için
CREATE INDEX IF NOT EXISTS idx_players_contract_end_week
  ON players (contract_end_week)
  WHERE contract_end_week IS NOT NULL;

-- İndeks: serbest oyuncuları hızlı bulmak için
CREATE INDEX IF NOT EXISTS idx_players_is_free_agent
  ON players (is_free_agent)
  WHERE is_free_agent = true;
