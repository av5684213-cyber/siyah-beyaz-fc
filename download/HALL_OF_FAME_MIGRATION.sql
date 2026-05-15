-- ═══════════════════════════════════════════════════════════════════════
-- ADIM 5: Hall of Fame Museum Migration (DÜZELTİLMİŞ)
-- hall_of_fame tablosu: Emekli olan efsane oyuncuların kalıcı kaydı
-- DÜZELTME: DROP TABLE IF EXISTS + DROP POLICY IF EXISTS ile temiz kurulum
-- ═══════════════════════════════════════════════════════════════════════

-- ─── TEMIZLİK: Eski tabloyu ve policy'leri temizle ────────────────────
DROP TABLE IF EXISTS hall_of_fame CASCADE;

-- ─── 1. hall_of_fame TABLOSU ─────────────────────────────────────────
-- Takımdan emekli olan oyuncuların kariyer özetlerini saklar
-- Sadece belirli kriterleri karşılayan oyuncular otomatik olarak alınır
CREATE TABLE hall_of_fame (
  id              TEXT PRIMARY KEY,            -- "hof_{playerId}_{profileId}"
  profile_id      TEXT NOT NULL,              -- profiles.id referansı (TEXT tipi)
  player_id       TEXT NOT NULL,              -- Orijinal player ID
  player_name     TEXT NOT NULL,              -- Oyuncu adı (denormalize)
  position        TEXT NOT NULL,              -- Pozisyon: GK, DEF, MID, FWD
  nationality     TEXT,                       -- Uyruk
  
  -- Kariyer İstatistikleri
  seasons_played  INTEGER DEFAULT 0,         -- Takımda geçirdiği sezon sayısı
  total_goals     INTEGER DEFAULT 0,         -- Toplam gol
  total_assists   INTEGER DEFAULT 0,         -- Toplam asist
  total_matches   INTEGER DEFAULT 0,         -- Toplam maç
  total_clean_sheets INTEGER DEFAULT 0,      -- Toplam clean sheet (kaleci)
  total_motm      INTEGER DEFAULT 0,         -- Toplam Maçın Adamı
  avg_rating      FLOAT DEFAULT 0,           -- Kariyer ortalama rating
  peak_rating     INTEGER DEFAULT 0,         -- En yüksek rating
  
  -- Efsane Kategorisi
  legend_tier     TEXT NOT NULL DEFAULT 'bronze',  -- platinum, gold, silver, bronze
  is_club_legend  BOOLEAN DEFAULT false,     -- Klüp efsanesi mi?
  
  -- Sezon Ödülleri
  awards_won      JSONB DEFAULT '[]',        -- ["golden_boot", "mvp"] gibi
  
  -- Metadata
  joined_day      INTEGER,                   -- Takıma katılma günü
  retired_day     INTEGER,                   -- Emekli olma günü
  retired_season  TEXT,                       -- "season-3" formatı
  inducted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexler
CREATE INDEX idx_hof_profile ON hall_of_fame(profile_id);
CREATE INDEX idx_hof_player ON hall_of_fame(player_id);
CREATE INDEX idx_hof_tier ON hall_of_fame(legend_tier);
CREATE INDEX idx_hof_legend ON hall_of_fame(is_club_legend) WHERE is_club_legend = true;
CREATE INDEX idx_hof_rating ON hall_of_fame(avg_rating DESC);

-- RLS: Her kullanıcı kendi HOF'unu görsün + service role tam erişim
ALTER TABLE hall_of_fame ENABLE ROW LEVEL SECURITY;

CREATE POLICY hof_select ON hall_of_fame
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY hof_insert ON hall_of_fame
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY hof_update ON hall_of_fame
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY hof_delete ON hall_of_fame
  FOR DELETE USING (profile_id = auth.uid()::text);

CREATE POLICY hof_service ON hall_of_fame
  FOR ALL USING (true) WITH CHECK (true);


-- ─── 2. profiles TABLOSUNA GÜNCELLEME ────────────────────────────────
-- HOF üye sayısı için hızlı erişim kolonu
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hof_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_hof ON profiles(hof_count) WHERE hof_count > 0;
