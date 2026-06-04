-- Migration: player_development_log tablosunu ve VIEW'ı düzelt
-- Hata: SQL Error 42703 — column 'week' does not exist
-- Neden: VIEW, mevcut olmayan sütunları referans alıyor (week, ovr_before, ovr_after)
-- Ayrıca: season_week, old_ovr, new_ovr, change_reason, match_performance_contribution
-- sütunları hiç eklenmemiş (archive migrasyonu uygulanmamış)
--
-- Bu migration:
-- 1. Eksik sütunları tabloya ekler
-- 2. Mevcut veriyi yeni sütunlara taşır
-- 3. VIEW'ı doğru sütunlarla yeniden oluşturur
-- 4. League_teams is_bot/is_npc düzeltmesini yapar

-- ═══════════════════════════════════════════════════
-- ADIM 1: Eksik sütunları ekle
-- ═══════════════════════════════════════════════════

-- old_ovr (mevcut değilse ekle, old_rating'den kopyala)
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS old_ovr NUMERIC;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS new_ovr NUMERIC;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS change_reason TEXT DEFAULT 'weekly_training';
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS match_performance_contribution NUMERIC DEFAULT 0;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS season_week INTEGER;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS training_sessions INTEGER DEFAULT 0;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS training_contribution NUMERIC DEFAULT 0;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS potential_bonus NUMERIC DEFAULT 0;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS age_penalty NUMERIC DEFAULT 0;

-- ═══════════════════════════════════════════════════
-- ADIM 2: Mevcut veriyi yeni sütunlara taşı
-- ═══════════════════════════════════════════════════

-- old_rating → old_ovr (sadece old_ovr NULL olan kayıtlar için)
UPDATE player_development_log
SET old_ovr = old_rating
WHERE old_ovr IS NULL AND old_rating IS NOT NULL;

-- new_rating → new_ovr
UPDATE player_development_log
SET new_ovr = new_rating
WHERE new_ovr IS NULL AND new_rating IS NOT NULL;

-- reason → change_reason
UPDATE player_development_log
SET change_reason = COALESCE(reason, 'weekly_training')
WHERE change_reason = 'weekly_training' AND reason IS NOT NULL AND reason != 'weekly_training';

-- ═══════════════════════════════════════════════════
-- ADIM 3: VIEW'ı doğru sütunlarla oluştur
-- ═══════════════════════════════════════════════════

-- ADIM 3: VIEW'ı doğru sütunlarla oluştur
-- DİKKAT: Eski VIEW farklı sütunlara sahip, DROP+CREATE gerekli
DROP VIEW IF EXISTS player_development_log_summary;
CREATE VIEW player_development_log_summary AS
SELECT
  player_id,
  season_week,
  change_reason,
  match_performance_contribution,
  COALESCE(old_ovr, old_rating) as old_ovr,
  COALESCE(new_ovr, new_rating) as new_ovr,
  created_at
FROM player_development_log
ORDER BY created_at DESC;

-- ═══════════════════════════════════════════════════
-- ADIM 4: Index ekle
-- ═══════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_player_dev_log_player
  ON player_development_log(player_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_player_dev_log_profile
  ON player_development_log(profile_id, created_at DESC);

-- ═══════════════════════════════════════════════════
-- ADIM 5: league_teams is_bot/is_npc düzeltmesi
-- ═══════════════════════════════════════════════════

-- NPC takımlar is_bot=true olarak işaretle
UPDATE league_teams
SET is_bot = true
WHERE is_npc = true
  AND is_bot = false
  AND profile_id IS NULL;

-- ═══════════════════════════════════════════════════
-- ADIM 6: assign_bot_to_user RPC düzeltmesi
-- ═══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION assign_bot_to_user(
  p_profile_id UUID,
  p_team_name TEXT,
  p_manager_name TEXT DEFAULT 'Menajer',
  p_philosophy TEXT DEFAULT 'balanced',
  p_color1 TEXT DEFAULT '#ffffff',
  p_color2 TEXT DEFAULT '#000000',
  p_region TEXT DEFAULT 'TR'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_bot_team RECORD;
  v_league_id UUID;
  v_league_name TEXT;
  v_old_profile_id UUID;
BEGIN
  SET LOCAL lock_timeout = '5s';

  -- is_bot=true VEYA is_npc=true olan takımları devral
  SELECT lt.id, lt.league_id, lt.name AS old_team_name, lt.profile_id AS old_profile_id
  INTO v_bot_team
  FROM league_teams lt
  JOIN leagues l ON l.id = lt.league_id
  WHERE (lt.is_bot = true OR lt.is_npc = true)
    AND lt.profile_id IS NULL
    AND l.tier = 4
  ORDER BY lt.id
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'no_bot_available'
    );
  END IF;

  SELECT id, name INTO v_league_id, v_league_name
  FROM leagues WHERE id = v_bot_team.league_id;

  UPDATE league_teams
  SET profile_id = p_profile_id,
      is_bot = false,
      is_npc = false,
      name = p_team_name,
      color = p_color1
  WHERE id = v_bot_team.id;

  IF v_bot_team.old_profile_id IS NOT NULL THEN
    UPDATE players
    SET profile_id = p_profile_id,
        team_name = p_team_name
    WHERE profile_id = v_bot_team.old_profile_id;

    DELETE FROM profiles WHERE id = v_bot_team.old_profile_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'league_id', v_league_id,
    'league_name', COALESCE(v_league_name, '4. Lig'),
    'team_slot_id', v_bot_team.id,
    'took_over_bot', true
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'reason', SQLERRM
  );
END;
$$;

-- ═══════════════════════════════════════════════════
-- DOĞRULAMA
-- ═══════════════════════════════════════════════════

-- SELECT * FROM player_development_log_summary LIMIT 5;
-- SELECT tier, count(*) as lig_sayisi FROM leagues GROUP BY tier ORDER BY tier;
