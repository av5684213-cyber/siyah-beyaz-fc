-- ============================================================
-- Match Sessions: Gerçek zamanlı maç simülasyonu için oturum tablosu
-- ============================================================
-- Maç artık önceden tüm 90 dakika simüle edilmiyor.
-- Bunun yerine match-tick cron'u her tick'te birkaç dakikalık
-- simülasyon yapar ve olayları canlı olarak üretir.
-- Taktik değişiklikleri kalan simülasyonu etkiler.
-- ============================================================

-- 1. match_sessions tablosu
CREATE TABLE IF NOT EXISTS match_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'initializing'
    CHECK (status IN ('initializing', 'waiting_for_players', 'live', 'halftime', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT now(),
  current_minute INTEGER NOT NULL DEFAULT 0,
  home_score INTEGER NOT NULL DEFAULT 0,
  away_score INTEGER NOT NULL DEFAULT 0,

  -- Taktik durumları (kullanıcı tarafından maç sırasında değiştirilebilir)
  home_tactic TEXT DEFAULT 'normal',
  away_tactic TEXT DEFAULT 'normal',
  home_formation TEXT DEFAULT '4-4-2',
  away_formation TEXT DEFAULT '4-4-2',
  home_goal_mod REAL DEFAULT 0,
  away_goal_mod REAL DEFAULT 0,
  home_conceed_mod REAL DEFAULT 0,
  away_conceed_mod REAL DEFAULT 0,

  -- Simülasyon bağlamı (JSONB: oyuncular, hakem, hava durumu vb.)
  home_players JSONB DEFAULT '[]',
  away_players JSONB DEFAULT '[]',
  home_tactic_obj JSONB DEFAULT '{}',
  away_tactic_obj JSONB DEFAULT '{}',
  referee_data JSONB DEFAULT '{}',
  weather TEXT DEFAULT 'sunny',
  home_team_name TEXT DEFAULT '',
  away_team_name TEXT DEFAULT '',
  home_team_id UUID,
  away_team_id UUID,
  season_id UUID,

  -- Kırmızı kart takımlar (oyuncu azalması simülasyonu için)
  home_red_cards INTEGER DEFAULT 0,
  away_red_cards INTEGER DEFAULT 0,

  -- Simülasyon hızı: 1 gerçek dakikada kaç maç dakikası
  simulation_speed REAL DEFAULT 2.0,

  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index: fixture_id ile hızlı erişim
CREATE INDEX IF NOT EXISTS idx_match_sessions_fixture_id ON match_sessions(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_sessions_status ON match_sessions(status);

-- 2. fixtures tablosuna session_id ekle (nullable)
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES match_sessions(id);

-- 3. RLS politikaları
ALTER TABLE match_sessions ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (maç izleme sayfası)
CREATE POLICY "Match sessions are readable by all" ON match_sessions
  FOR SELECT USING (true);

-- Sadece service_role yazabilir (cron jobs)
CREATE POLICY "Service role can insert match sessions" ON match_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update match sessions" ON match_sessions
  FOR UPDATE USING (true);

-- 4. Supabase Realtime için match_sessions tablosunu yayınla
-- (alter publication yapabilmek için superuser gerekli, mevcut değilse atlanır)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE match_sessions;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Could not add match_sessions to supabase_realtime publication: %', SQLERRM;
END $$;

-- 5. match_events tablosuna TACTICAL_CHANGE olayı için destek
-- (event_type zaten TEXT, kısıtlama yok, bu yüzden bir şey yapmaya gerek yok)

-- 6. live_matches tablosuna session_id ekle
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES match_sessions(id);

-- 7. Temizlik: Maç bittikten 24 saat sonra match_sessions kayıtlarını sil
-- (pg_cron eklentisi varsa)
DO $outer$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup-old-match-sessions',
      '0 4 * * *',
      $inner$DELETE FROM match_sessions WHERE status = 'completed' AND last_updated < now() - interval '24 hours'$inner$
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'pg_cron not available: %', SQLERRM;
END $outer$;
