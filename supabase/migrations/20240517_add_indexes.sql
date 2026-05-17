-- ═══════════════════════════════════════════════════════════════════════
-- Siyah Beyaz FC — Performans İndeksleri (DUZELTILMIS VERSIYON)
-- Sorgu hızını artırmak için kritik sütunlara indeks ekler.
-- DÜZELTMELER:
--   - players.owner_team_id → players.profile_id (gerçek kolon adı)
--   - matches → fixtures (gerçek tablo adı)
--   - league_table → league_standings (gerçek tablo adı)
--   - league_table.season → league_standings.season_id (gerçek kolon adı)
-- ═══════════════════════════════════════════════════════════════════════

-- players tablosu: Takım bazlı oyuncu sorguları (en sık kullanılan)
CREATE INDEX IF NOT EXISTS idx_players_profile_id ON players (profile_id);
CREATE INDEX IF NOT EXISTS idx_players_team_name ON players (team_name);

-- fixtures tablosu: Maç tarihi, ev sahibi ve deplasman takımı sorguları
CREATE INDEX IF NOT EXISTS idx_fixtures_match_date ON fixtures (match_date);
CREATE INDEX IF NOT EXISTS idx_fixtures_home_team_id ON fixtures (home_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_away_team_id ON fixtures (away_team_id);

-- transfers tablosu: Aktif transfer aramaları ve süre kontrolü
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers (status);
CREATE INDEX IF NOT EXISTS idx_transfers_end_time ON transfers (end_time);

-- league_standings tablosu: Sezon ve takım bazlı sıralama sorguları
CREATE INDEX IF NOT EXISTS idx_league_standings_season_id ON league_standings (season_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_team_id ON league_standings (team_id);

-- Birleşik indeks: Sezon + takım (en sık yapılan sorgu)
CREATE INDEX IF NOT EXISTS idx_league_standings_season_team ON league_standings (season_id, team_id);
