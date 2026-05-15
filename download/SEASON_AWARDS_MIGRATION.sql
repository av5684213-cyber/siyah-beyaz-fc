-- ═══════════════════════════════════════════════════════════════════════
-- ADIM 4: Sezon Sonu İstatistikleri ve Ödüller Migration
-- season_awards tablosu, player_awards tablosu, season_summaries tablosu
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 1. season_awards TABLOSU ────────────────────────────────────────
-- Her sezonun ödül kategorilerini ve kazananlarını saklar
CREATE TABLE IF NOT EXISTS season_awards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id     TEXT NOT NULL,              -- "season-1", "season-2" formatı
  profile_id    TEXT NOT NULL,              -- profiles.id referansı (TEXT tipi)
  league_name   TEXT,                       -- Lig adı (ödüllerin lige özel olması için)
  award_type    TEXT NOT NULL,              -- golden_boot, mvp, best_gk, top_assists, best_young, fair_play, champion
  player_id     TEXT,                       -- Kazanan oyuncu ID (null = takım ödülü)
  player_name   TEXT,                       -- Oyuncu adı (denormalize)
  team_name     TEXT,                       -- Takım adı
  stat_value    FLOAT DEFAULT 0,            -- Ödül değerini belirleyen istatistik (gol sayısı, rating vs.)
  stat_detail   JSONB DEFAULT '{}',         -- Ek detaylar: {"goals":25, "assists":8, "matches":34}
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: sezon + profile bazında hızlı sorgulama
CREATE INDEX IF NOT EXISTS idx_season_awards_season ON season_awards(season_id);
CREATE INDEX IF NOT EXISTS idx_season_awards_profile ON season_awards(profile_id);
CREATE INDEX IF NOT EXISTS idx_season_awards_type ON season_awards(award_type);
CREATE INDEX IF NOT EXISTS idx_season_awards_player ON season_awards(player_id);

-- RLS: Her kullanıcı kendi ödüllerini görsün + service role tam erişim
ALTER TABLE season_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY season_awards_select ON season_awards
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY season_awards_insert ON season_awards
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY season_awards_update ON season_awards
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY season_awards_delete ON season_awards
  FOR DELETE USING (profile_id = auth.uid()::text);

CREATE POLICY season_awards_service ON season_awards
  FOR ALL USING (true) WITH CHECK (true);


-- ─── 2. season_summaries TABLOSU ─────────────────────────────────────
-- Her profilin sezon özet istatistikleri (şampiyonluk sayısı, toplam ödül vs.)
CREATE TABLE IF NOT EXISTS season_summaries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id     TEXT NOT NULL,              -- "season-1", "season-2"
  profile_id    TEXT NOT NULL,              -- profiles.id referansı
  team_name     TEXT,                       -- Takım adı
  league_name   TEXT,                       -- Lig adı
  final_position INTEGER,                  -- Lig bitiş pozisyonu
  points        INTEGER DEFAULT 0,         -- Toplam puan
  won           INTEGER DEFAULT 0,
  drawn         INTEGER DEFAULT 0,
  lost          INTEGER DEFAULT 0,
  goals_for     INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  total_goals   INTEGER DEFAULT 0,         -- Takımın toplam golü
  total_assists INTEGER DEFAULT 0,
  total_yellow  INTEGER DEFAULT 0,
  total_red     INTEGER DEFAULT 0,
  total_clean_sheets INTEGER DEFAULT 0,
  avg_team_rating FLOAT DEFAULT 0,
  top_scorer_name TEXT,                     -- En golcü oyuncu adı
  top_scorer_goals INTEGER DEFAULT 0,
  top_assister_name TEXT,                   -- En asistli oyuncu adı
  top_assister_assists INTEGER DEFAULT 0,
  best_player_name TEXT,                    -- MVP oyuncu adı
  best_player_rating FLOAT DEFAULT 0,
  is_champion   BOOLEAN DEFAULT false,     -- Şampiyon mu?
  is_promoted   BOOLEAN DEFAULT false,     -- Terfi mi?
  is_relegated  BOOLEAN DEFAULT false,     -- Düşme mi?
  awards_count  INTEGER DEFAULT 0,         -- Toplam ödül sayısı
  badge_earned  TEXT,                       -- Sezon badge'i (champion_gold, top4_silver, vb.)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_season_summaries_season ON season_summaries(season_id);
CREATE INDEX IF NOT EXISTS idx_season_summaries_profile ON season_summaries(profile_id);
CREATE INDEX IF NOT EXISTS idx_season_summaries_champion ON season_summaries(is_champion) WHERE is_champion = true;

-- RLS
ALTER TABLE season_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY season_summaries_select ON season_summaries
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY season_summaries_insert ON season_summaries
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY season_summaries_update ON season_summaries
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY season_summaries_delete ON season_summaries
  FOR DELETE USING (profile_id = auth.uid()::text);

CREATE POLICY season_summaries_service ON season_summaries
  FOR ALL USING (true) WITH CHECK (true);


-- ─── 3. player_career_stats TABLOSUNA EK KOLONLAR ────────────────────
-- MotM sayısı ve clean_sheets zaten var ama kullanılmıyordu, şimdi motm ekliyoruz
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS motm INT DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS saves INT DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS rating INT;

-- motm ve saves için indeks
CREATE INDEX IF NOT EXISTS idx_pcs_motm ON player_career_stats(motm) WHERE motm > 0;
CREATE INDEX IF NOT EXISTS idx_pcs_clean_sheets ON player_career_stats(clean_sheets) WHERE clean_sheets > 0;


-- ─── 4. profiles TABLOSUNA GÜNCELLEME ────────────────────────────────
-- total_trophies: Toplam şampiyonluk/ödül sayısı (hızlı erişim)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_trophies INTEGER DEFAULT 0;
-- total_awards: Toplam bireysel ödül sayısı
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_awards INTEGER DEFAULT 0;
-- season_badges: JSONB - sezonluk kazanılan badge'ler
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS season_badges JSONB DEFAULT '[]';

-- Badge indeks
CREATE INDEX IF NOT EXISTS idx_profiles_trophies ON profiles(total_trophies) WHERE total_trophies > 0;
