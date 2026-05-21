-- ═══════════════════════════════════════════════════════════════════════
-- LİG TABLOSU PERFORMANS İNDEKSLERİ (DÜZELTİLMİŞ)
-- ═══════════════════════════════════════════════════════════════════════
-- Bu migration dosyasını Supabase Dashboard → SQL Editor'de çalıştırın.
-- anon key ile DDL yapılamaz, bu yüzden manuel olarak uygulanmalıdır.
-- ═══════════════════════════════════════════════════════════════════════

-- League standings sorguları için indeksler
-- NOT: league_standings tablosunda league_name ve profile_id kolonu YOKTUR.
-- Lig bilgisi league_teams → leagues üzerinden takip edilir.
-- Sorgular season_id ve team_id üzerinden yapılır.
CREATE INDEX IF NOT EXISTS idx_league_standings_season_id ON league_standings(season_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_team_id ON league_standings(team_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_points ON league_standings(points DESC);

-- Fixtures sorguları için indeksler
CREATE INDEX IF NOT EXISTS idx_fixtures_tur ON fixtures(tur);
CREATE INDEX IF NOT EXISTS idx_fixtures_match_date ON fixtures(match_date);
CREATE INDEX IF NOT EXISTS idx_fixtures_home_team_id ON fixtures(home_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_away_team_id ON fixtures(away_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_status ON fixtures(status);
CREATE INDEX IF NOT EXISTS idx_fixtures_season_id ON fixtures(season_id);

-- Players sorguları için indeksler
CREATE INDEX IF NOT EXISTS idx_players_profile_id ON players(profile_id);
CREATE INDEX IF NOT EXISTS idx_players_team_name ON players(team_name);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
