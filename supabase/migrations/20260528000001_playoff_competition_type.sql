-- Playoff maçlarını lig maçlarından ayırmak için competition_type kolonu
-- Zaten varsa bu migration atlanır (IF NOT EXISTS)
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS competition_type TEXT DEFAULT 'league';
