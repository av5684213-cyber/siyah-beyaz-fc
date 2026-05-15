-- ═══════════════════════════════════════════════════════════════════════
-- PLAYER ACHIEVEMENTS TABLOSU MİGRASYONU
-- Oyunculara kazanılan ödül rozetlerini kaydeder
-- Rozet formatı: "2024_GOLDEN_BOOT", "2024_MVP" gibi
-- ═══════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS player_achievements CASCADE;

CREATE TABLE player_achievements (
  id            TEXT PRIMARY KEY,            -- "ach_season-1_golden_boot_playerId" formatı
  player_id     TEXT NOT NULL,              -- players.id referansı
  player_name   TEXT,                       -- Oyuncu adı (denormalize)
  team_name     TEXT,                       -- Takım adı
  season_id     TEXT NOT NULL,              -- "season-1", "season-2"
  badge_name    TEXT NOT NULL,              -- "2024_GOLDEN_BOOT" formatı rozet adı
  award_type    TEXT NOT NULL,              -- golden_boot, mvp, best_gk, vb.
  profile_id    TEXT NOT NULL,              -- profiles.id (TEXT tipi)
  awarded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_player_achievements_player ON player_achievements(player_id);
CREATE INDEX idx_player_achievements_season ON player_achievements(season_id);
CREATE INDEX idx_player_achievements_profile ON player_achievements(profile_id);
CREATE INDEX idx_player_achievements_badge ON player_achievements(badge_name);
CREATE INDEX idx_player_achievements_award_type ON player_achievements(award_type);

-- RLS
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY player_achievements_select ON player_achievements
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY player_achievements_insert ON player_achievements
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY player_achievements_update ON player_achievements
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY player_achievements_delete ON player_achievements
  FOR DELETE USING (profile_id = auth.uid()::text);

CREATE POLICY player_achievements_service ON player_achievements
  FOR ALL USING (true) WITH CHECK (true);
