-- ═══════════════════════════════════════════════════════════════════════
-- Siyah Beyaz FC — Performans İndeksleri
-- Sorgu hızını artırmak için kritik sütunlara indeks ekler.
-- ═══════════════════════════════════════════════════════════════════════

-- players tablosu: Takım bazlı oyuncu sorguları (en sık kullanılan)
CREATE INDEX IF NOT EXISTS idx_players_owner_team_id ON players (owner_team_id);

-- matches tablosu: Maç tarihi, ev sahibi ve deplasman takımı sorguları
CREATE INDEX IF NOT EXISTS idx_matches_match_date ON matches (match_date);
CREATE INDEX IF NOT EXISTS idx_matches_home_team_id ON matches (home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team_id ON matches (away_team_id);

-- transfers tablosu: Aktif transfer aramaları ve süre kontrolü
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers (status);
CREATE INDEX IF NOT EXISTS idx_transfers_end_time ON transfers (end_time);

-- league_table tablosu: Sezon ve takım bazlı sıralama sorguları
CREATE INDEX IF NOT EXISTS idx_league_table_season ON league_table (season);
CREATE INDEX IF NOT EXISTS idx_league_table_team_id ON league_table (team_id);

-- Birleşik indeks: Sezon + takım (en sık yapılan sorgu)
CREATE INDEX IF NOT EXISTS idx_league_table_season_team ON league_table (season, team_id);
