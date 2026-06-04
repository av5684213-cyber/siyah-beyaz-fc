-- ═══════════════════════════════════════════════════════════════════════
-- BİRLEŞİK KRİTİK DÜZELTME MİGRASYONU
-- Tarih: 2026-05-29
-- ═══════════════════════════════════════════════════════════════════════
-- Bu dosyayı Supabase Dashboard > SQL Editor'de ÇALIŞTIRIN
-- (Dosya yolunu değil, İÇERİĞİ kopyalayın!)
--
-- Düzeltmeler:
-- 1. player_development_log eksik sütunları ekleme
-- 2. player_development_log_summary VIEW düzeltmesi (week → season_week)
-- 3. league_teams is_bot/is_npc düzeltmesi
-- 4. assign_bot_to_user RPC düzeltmesi
-- 5. Lig duplikasyonu temizleme
-- ═══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 1: player_development_log tablosunu düzelt
-- Hata: SQL Error 42703 — column 'week' does not exist
-- Neden: VIEW, mevcut olmayan sütunları referans alıyor
-- ═══════════════════════════════════════════════════════════════════════

-- 1a. Eksik sütunları ekle
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

-- 1b. Mevcut veriyi yeni sütunlara taşı
UPDATE player_development_log
SET old_ovr = old_rating
WHERE old_ovr IS NULL AND old_rating IS NOT NULL;

UPDATE player_development_log
SET new_ovr = new_rating
WHERE new_ovr IS NULL AND new_rating IS NOT NULL;

UPDATE player_development_log
SET change_reason = COALESCE(reason, 'weekly_training')
WHERE change_reason = 'weekly_training' AND reason IS NOT NULL AND reason != 'weekly_training';

-- 1c. VIEW'ı doğru sütunlarla oluştur
-- DİKKAT: Eski VIEW farklı sütunlara sahip (week, ovr_change, week_label),
-- CREATE OR REPLACE VIEW ile sütun düşülemeyeceği için önce DROP gerekli
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

-- 1d. Index ekle
CREATE INDEX IF NOT EXISTS idx_player_dev_log_player
  ON player_development_log(player_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_dev_log_profile
  ON player_development_log(profile_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 2: league_teams is_bot/is_npc düzeltmesi
-- Sorun: NPC takımlar is_bot=true olarak işaretlenmemiş
-- Bu, her kullanıcı kaydında yeni lig oluşturulmasına neden oluyor
-- ═══════════════════════════════════════════════════════════════════════

UPDATE league_teams
SET is_bot = true
WHERE is_npc = true
  AND is_bot = false
  AND profile_id IS NULL;

-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 3: assign_bot_to_user RPC düzeltmesi
-- is_bot=true VEYA is_npc=true olan takımları devral
-- ═══════════════════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 4: Lig duplikasyonu temizleme
-- 18 duplicate lig → 1.Lig×1, 2.Lig×1, 3.Lig×1, 4.Lig×4 bölüm
-- Toplam: 7 lig, 126 takım
-- ═══════════════════════════════════════════════════════════════════════

-- 4a. 1-3. Liglerde duplicate varsa temizle
DO $$
DECLARE
  primary_league_id UUID;
  duplicate_league RECORD;
  target_league_id UUID;
BEGIN
  FOR tier_val IN 1..3 LOOP
    -- Bu tier'daki ilk (en eski) lig'i bul
    SELECT id INTO primary_league_id
    FROM leagues
    WHERE tier = tier_val
    ORDER BY created_at ASC
    LIMIT 1;

    IF primary_league_id IS NULL THEN
      RAISE NOTICE 'Tier % için lig bulunamadı', tier_val;
      CONTINUE;
    END IF;

    -- 4. Lig'de bir hedef lig bul
    SELECT id INTO target_league_id
    FROM leagues WHERE tier = 4 ORDER BY created_at ASC LIMIT 1;

    -- Diğer (duplicate) liglerin takımlarını 4. Lig'e taşı
    FOR duplicate_league IN
      SELECT id, name FROM leagues
      WHERE tier = tier_val AND id != primary_league_id
      ORDER BY created_at ASC
    LOOP
      -- Takımları 4. Lig'e taşı
      IF target_league_id IS NOT NULL THEN
        UPDATE league_teams
        SET league_id = target_league_id
        WHERE league_id = duplicate_league.id;
      END IF;

      -- Duplicate lig'i temizle
      DELETE FROM league_teams WHERE league_id = duplicate_league.id;
      DELETE FROM league_standings WHERE league_id = duplicate_league.id;
      DELETE FROM seasons WHERE league_id = duplicate_league.id;
      DELETE FROM leagues WHERE id = duplicate_league.id;

      RAISE NOTICE 'Tier %: Duplicate lig "%" silindi, takımlar taşındı', tier_val, duplicate_league.name;
    END LOOP;
  END LOOP;
END $$;

-- 4b. 4. Lig departmanlarını isimlendir
DO $$
DECLARE
  dept_index INTEGER := 0;
  dept_record RECORD;
  new_name TEXT;
BEGIN
  FOR dept_record IN
    SELECT id FROM leagues WHERE tier = 4 ORDER BY created_at ASC
  LOOP
    dept_index := dept_index + 1;

    IF dept_index = 1 THEN
      new_name := '4. Lig';
    ELSE
      new_name := '4. Lig ' || dept_index || '. Bölüm';
    END IF;

    UPDATE leagues SET name = new_name WHERE id = dept_record.id;
  END LOOP;

  -- 4'ten fazla bölüm varsa, fazla olanları birleştir
  IF dept_index > 4 THEN
    DECLARE
      excess_league RECORD;
      min_team_league_id UUID;
    BEGIN
      FOR excess_league IN
        SELECT id FROM leagues
        WHERE tier = 4
        ORDER BY created_at ASC
        OFFSET 4
      LOOP
        -- En az takımı olan bölüme taşı
        SELECT id INTO min_team_league_id FROM (
          SELECT l.id, COUNT(lt.id) as tc
          FROM leagues l
          LEFT JOIN league_teams lt ON lt.league_id = l.id
          WHERE l.tier = 4
          GROUP BY l.id
          ORDER BY tc ASC
          LIMIT 1
        ) sub;

        IF min_team_league_id IS NOT NULL THEN
          UPDATE league_teams SET league_id = min_team_league_id
          WHERE league_id = excess_league.id;

          DELETE FROM league_standings WHERE league_id = excess_league.id;
          DELETE FROM seasons WHERE league_id = excess_league.id;
          DELETE FROM leagues WHERE id = excess_league.id;
        END IF;
      END LOOP;
    END;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- DOĞRULAMA
-- ═══════════════════════════════════════════════════════════════════════
-- Aşağıdaki sorguları çalıştırarak sonucu kontrol edin:

-- SELECT * FROM player_development_log_summary LIMIT 5;
-- SELECT tier, count(*) as lig_sayisi FROM leagues GROUP BY tier ORDER BY tier;
-- SELECT l.name, l.tier, count(lt.id) as takim_sayisi FROM leagues l LEFT JOIN league_teams lt ON lt.league_id = l.id GROUP BY l.id, l.name, l.tier ORDER BY l.tier, l.created_at;

-- PostgREST şema önbelleğini yenile
NOTIFY pgrst, 'reload schema';
