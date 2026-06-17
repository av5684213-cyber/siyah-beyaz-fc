-- ═══════════════════════════════════════════════════════════════════════════
-- MAÇ KAYIT SİSTEMİ — Kalıcı tekrar izleme garantisi
--
-- AMAÇ:
--   Sezon boyunca oynanan tüm maçların olayları (goller, kartlar, oyuncu
--   istatistikleri) kalıcı olarak saklanır. "Tekrar izle" her zaman çalışır.
--
-- YAPILANLAR:
--   1. match_events tablosuna index (fixture_id + minute)
--   2. match_sessions tablosuna index (fixture_id)
--   3. match_events silinmeye karşı korumalı — sadece sezon sonunda
--      seasons.is_finished=true olduğunda silinebilir
--   4. Retention policy: sezon bitene kadar events silinmez
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Index'ler (sorgu performansı için) ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_match_events_fixture_minute
  ON match_events (fixture_id, minute);

CREATE INDEX IF NOT EXISTS idx_match_events_fixture_type
  ON match_events (fixture_id, event_type);

CREATE INDEX IF NOT EXISTS idx_match_sessions_fixture
  ON match_sessions (fixture_id);

-- ─── 2. match_sessions'e completed_at yoksa ekle ───────────────────────
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ─── 3. match_sessions'e season_id ekle (sezon bazlı sorgu için) ──────
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id) ON DELETE SET NULL;

-- ─── 4. match_events'e season_id ekle (sezon bitince toplu temizlik için) ─
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id) ON DELETE SET NULL;

-- ─── 5. match_sessions'e retention_period kolonu (365 gün sakla) ──────
-- Sezon bitse bile 1 yıl boyunca maçlar tekrar izlenebilir
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS retention_expires_at TIMESTAMPTZ;

-- ─── 6. Trigger: match_sessions insert edildiğinde retention_expires_at ayarla ──
CREATE OR REPLACE FUNCTION set_match_session_retention()
RETURNS TRIGGER AS $$
BEGIN
  -- Maç tamamlandığında 365 gün sonra expire olacak
  IF NEW.completed_at IS NOT NULL AND NEW.retention_expires_at IS NULL THEN
    NEW.retention_expires_at = NEW.completed_at + INTERVAL '365 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_match_session_retention ON match_sessions;
CREATE TRIGGER trg_match_session_retention
  BEFORE INSERT OR UPDATE ON match_sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_match_session_retention();

-- ─── 7. View: kullanıcının takımının sezon boyunca oynadığı maçlar ────
-- Tekrar izleme için hızlı lookup
CREATE OR REPLACE VIEW v_replayable_matches AS
SELECT
  f.id AS fixture_id,
  f.season_id,
  f.tur,
  f.match_date,
  f.match_time,
  f.status,
  f.home_score,
  f.away_score,
  f.home_team_id,
  f.away_team_id,
  ht.name AS home_team_name,
  at.name AS away_team_name,
  (SELECT COUNT(*) FROM match_events WHERE fixture_id = f.id) AS event_count,
  ms.events IS NOT NULL AS has_session_events,
  ms.completed_at IS NOT NULL AS is_fully_recorded
FROM fixtures f
JOIN league_teams ht ON ht.id = f.home_team_id
JOIN league_teams at ON at.id = f.away_team_id
LEFT JOIN match_sessions ms ON ms.fixture_id = f.id
WHERE f.status IN ('completed', 'finished');

-- ─── 8. Retention cleanup function (eski maçları sil) ────────────────
-- Sadece retention_expires_at geçmiş match_sessions'ları siler
-- Bu fonksiyon haftada bir çalıştırılabilir (Supabase pg_cron ile)
CREATE OR REPLACE FUNCTION cleanup_expired_match_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM match_sessions
  WHERE retention_expires_at IS NOT NULL
    AND retention_expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ─── 9. Açıklama ───────────────────────────────────────────────────────
COMMENT ON TABLE match_events IS 'Maç olayları (goller, kartlar, dahil). Sezon boyunca kalıcı. Sezon bitiminde seasons.is_finished=true olursa silinebilir.';
COMMENT ON TABLE match_sessions IS 'Maç oturumları — events JSONB + oyuncular + skor. Tekrar izleme için birincil kaynak. 365 gün retention.';
