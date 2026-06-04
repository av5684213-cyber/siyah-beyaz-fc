-- Migration: Lig Sistemini Yeniden Yapılandırma
-- Problem: 18 duplicate lig var. 4 departman × 18 takım = 72 takım olmalı.
-- Çözüm: Mevcut tüm ligleri ve takımları yeniden düzenle.
--
-- HEDEF YAPI:
-- 1. Lig: 1 grup × 18 takım = 18 takım
-- 2. Lig: 1 grup × 18 takım = 18 takım
-- 3. Lig: 1 grup × 18 takım = 18 takım
-- 4. Lig: 4 bölüm × 18 takım = 72 takım (toplam 126 takım)
--
-- Bu migration mevcut veriyi bozmadan düzeltme yapar.
-- DİKKAT: Canlı veritabanında çalıştırmadan önce yedek alın!

-- ═══════════════════════════════════════════════════
-- ADIM 1: Mevcut lig durumunu analiz et
-- ═══════════════════════════════════════════════════

-- Kaç lig var?
-- SELECT tier, count(*) FROM leagues GROUP BY tier ORDER BY tier;

-- ═══════════════════════════════════════════════════
-- ADIM 2: 1-3. Liglerde duplicate varsa temizle
-- Her tier'da sadece 1 lig kalmalı
-- ═══════════════════════════════════════════════════

-- 1. Lig: En eski lig'i tut, diğerlerini 4. Lig'e taşı
DO $$
DECLARE
  primary_league_id UUID;
  duplicate_league RECORD;
  new_dept_index INTEGER;
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

    -- Diğer (duplicate) ligleri 4. Lig departmanlarına taşı
    new_dept_index := 0;
    FOR duplicate_league IN
      SELECT id, name FROM leagues
      WHERE tier = tier_val AND id != primary_league_id
      ORDER BY created_at ASC
    LOOP
      new_dept_index := new_dept_index + 1;

      -- LigTeams'leri yeni bir 4. Lig bölümüne taşı
      UPDATE league_teams
      SET league_id = (
        -- 4. Lig'de boş slotu olan bir bölüm bul veya oluştur
        -- Bu basit versiyon: takımları mevcut 4. Lig bölümlerine dağıt
        SELECT id FROM leagues WHERE tier = 4 ORDER BY created_at ASC LIMIT 1
      )
      WHERE league_id = duplicate_league.id;

      -- Duplicate lig'i sil (artık takımı yok)
      DELETE FROM league_teams WHERE league_id = duplicate_league.id;
      DELETE FROM league_standings WHERE league_id = duplicate_league.id;
      DELETE FROM seasons WHERE league_id = duplicate_league.id;
      DELETE FROM leagues WHERE id = duplicate_league.id;

      RAISE NOTICE 'Tier %: Duplicate lig "%" silindi, takımlar taşındı', tier_val, duplicate_league.name;
    END LOOP;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════
-- ADIM 3: 4. Lig departmanlarını düzelt
-- En fazla 4 bölüm olmalı (72 takım = 4×18)
-- ═══════════════════════════════════════════════════

-- Mevcut 4. Lig bölümlerini say ve isimlendir
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
    RAISE NOTICE '4. Lig bölüm %: "%" olarak yeniden adlandırıldı', dept_index, new_name;
  END LOOP;

  -- 4'ten fazla bölüm varsa, fazla olanları birleştir
  -- İlk 4 bölümü koru, geri kalanın takımlarını ilk 4'e dağıt
  IF dept_index > 4 THEN
    DECLARE
      target_league_id UUID;
      excess_league RECORD;
      team_count INTEGER;
      min_team_league RECORD;
    BEGIN
      FOR excess_league IN
        SELECT id FROM leagues
        WHERE tier = 4
        ORDER BY created_at ASC
        OFFSET 4 -- İlk 4'ü atla
      LOOP
        -- En az takımı olan bölüme taşı
        SELECT id INTO target_league_id FROM (
          SELECT l.id, COUNT(lt.id) as tc
          FROM leagues l
          LEFT JOIN league_teams lt ON lt.league_id = l.id
          WHERE l.tier = 4
          GROUP BY l.id
          ORDER BY tc ASC
          LIMIT 1
        ) sub;

        IF target_league_id IS NOT NULL THEN
          UPDATE league_teams SET league_id = target_league_id
          WHERE league_id = excess_league.id;

          DELETE FROM league_standings WHERE league_id = excess_league.id;
          DELETE FROM seasons WHERE league_id = excess_league.id;
          DELETE FROM leagues WHERE id = excess_league.id;

          RAISE NOTICE 'Fazla 4. Lig bölümü silindi, takımlar taşındı';
        END IF;
      END LOOP;
    END;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════
-- ADIM 4: Her bölümde 18 takım olduğundan emin ol
-- Eksik takımları bot olarak ekle
-- ═══════════════════════════════════════════════════

-- Bu adım uygulama kodu (leagueHelpers.ts) tarafından
-- createNewLeagueGroup ve assignUserToLeague fonksiyonları
-- ile otomatik olarak yapılır.

-- ═══════════════════════════════════════════════════
-- ADIM 5: player_development_log_summary VIEW düzeltmesi
-- (SQL Error 42703 — column 'week' does not exist)
-- ═══════════════════════════════════════════════════

-- DİKKAT: Eski VIEW farklı sütunlara sahip, DROP+CREATE gerekli
DROP VIEW IF EXISTS player_development_log_summary;
CREATE VIEW player_development_log_summary AS
SELECT
  player_id,
  season_week,
  change_reason,
  match_performance_contribution,
  old_ovr,
  new_ovr,
  created_at
FROM player_development_log
ORDER BY created_at DESC;

-- ═══════════════════════════════════════════════════
-- DOĞRULAMA SORGULARI
-- ═══════════════════════════════════════════════════

-- Lig sayısını kontrol et:
-- SELECT tier, count(*) as lig_sayisi FROM leagues GROUP BY tier ORDER BY tier;

-- Her ligdeki takım sayısını kontrol et:
-- SELECT l.name, l.tier, count(lt.id) as takim_sayisi
-- FROM leagues l LEFT JOIN league_teams lt ON lt.league_id = l.id
-- GROUP BY l.id, l.name, l.tier
-- ORDER BY l.tier, l.created_at;

-- Toplam takım sayısı:
-- SELECT count(*) as toplam_takim FROM league_teams;
