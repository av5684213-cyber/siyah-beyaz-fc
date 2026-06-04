-- ═══════════════════════════════════════════════════════════════
-- LİG SİSTEMİ MİGRASYONU
-- Kademeli lig sistemi: 1. Lig → 2. Lig → 3. Lig → 4. Lig
-- 4. Lig birden fazla gruba (departmana) ayrılabilir
-- Her grupta 18 takım
-- Yükselme/Düşme mekanizması
-- ═══════════════════════════════════════════════════════════════

-- 1. league_teams tablosuna league_id kolonu zaten var, eksikse ekle
-- NOT: Supabase'de kolon zaten varsa hata vermez (IF NOT EXISTS yoktur, ancak ADD COLUMN zaten varsa sessizce atlar)
-- Bu yüzden güvenli şekilde ekliyoruz:

-- 2. league_name kolonunu profiles tablosuna ekle (yoksa)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'league_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN league_name text DEFAULT '4. Lig';
  END IF;
END $$;

-- 3. league_standings tablosuna league_id kolonu ekle (yoksa)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'league_standings' AND column_name = 'league_id'
  ) THEN
    ALTER TABLE league_standings ADD COLUMN league_id uuid REFERENCES leagues(id);
  END IF;
END $$;

-- 4. seasons tablosuna is_finished kolonu ekle (yoksa)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'seasons' AND column_name = 'is_finished'
  ) THEN
    ALTER TABLE seasons ADD COLUMN is_finished boolean DEFAULT false;
  END IF;
END $$;

-- 5. Mevcut 4. Lig'i "4. Lig" olarak bırak (eski UUID'li kayıtlar zaten doğru)
-- Yeni 4. Lig bölümleri otomatik oluşturulacak (kullanıcı kaydoldukça)

-- 6. league_teams tablosuna is_bot kolonu ekle (yoksa)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'league_teams' AND column_name = 'is_bot'
  ) THEN
    ALTER TABLE league_teams ADD COLUMN is_bot boolean DEFAULT false;
  END IF;
END $$;

-- 7. league_teams tablosuna color kolonu ekle (yoksa)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'league_teams' AND column_name = 'color'
  ) THEN
    ALTER TABLE league_teams ADD COLUMN color text;
  END IF;
END $$;

-- 8. Varsayılan ligleri güncelle (eğer sadece 4 lig varsa, doğru isimlendirme)
-- Eski hardcoded UUID'leri koru ama yeni bölümler eklenebilir

-- 9. generate_league_fixtures RPC fonksiyonu (yoksa oluştur)
-- Bu fonksiyon seasons tablosundaki bir sezon için round-robin fikstür oluşturur
CREATE OR REPLACE FUNCTION generate_league_fixtures(p_season_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_league_id uuid;
    v_team_ids uuid[];
    v_n integer;
    v_total_rounds integer;
    v_round integer;
    v_match integer;
    v_half integer;
    v_home_id uuid;
    v_away_id uuid;
    v_match_date date;
    v_team_ids_rotating uuid[];
    v_fixed_id uuid;
    v_last_id uuid;
BEGIN
    -- Sezonun liginin ID'sini bul
    SELECT league_id INTO v_league_id FROM seasons WHERE id = p_season_id;
    IF v_league_id IS NULL THEN RETURN; END IF;
    
    -- Takımları al
    SELECT array_agg(id ORDER BY id) INTO v_team_ids
    FROM league_teams WHERE league_id = v_league_id;
    
    v_n := array_length(v_team_ids, 1);
    IF v_n IS NULL OR v_n < 2 THEN RETURN; END IF;
    
    -- Takım sayısı tekse "bye" ekle
    IF v_n % 2 != 0 THEN
        v_team_ids := v_team_ids || '00000000-0000-0000-0000-000000000000'::uuid;
        v_n := v_n + 1;
    END IF;
    
    v_total_rounds := v_n - 1;
    v_half := v_n / 2;
    v_fixed_id := v_team_ids[1];
    v_team_ids_rotating := v_team_ids[2:v_n];
    
    v_match_date := CURRENT_DATE + 1;
    
    FOR v_round IN 1..v_total_rounds LOOP
        -- Mevcut turdaki takımları oluştur
        v_team_ids := ARRAY[v_fixed_id];
        FOR i IN 1..array_length(v_team_ids_rotating, 1) LOOP
            v_team_ids := v_team_ids || v_team_ids_rotating[i];
        END LOOP;
        
        -- Maçları oluştur
        FOR v_match IN 0..(v_half - 1) LOOP
            v_home_id := v_team_ids[v_match + 1];
            v_away_id := v_team_ids[v_n - v_match];
            
            -- Bye takımlarını atla
            IF v_home_id != '00000000-0000-0000-0000-000000000000'::uuid AND
               v_away_id != '00000000-0000-0000-0000-000000000000'::uuid THEN
                
                -- İlk yarı
                INSERT INTO fixtures (home_team_id, away_team_id, season_id, tur, match_date, match_time, status)
                VALUES (v_home_id, v_away_id, p_season_id, v_round, v_match_date, '12:00', 'scheduled');
                
                -- İkinci yarı (deplasmanlı)
                INSERT INTO fixtures (home_team_id, away_team_id, season_id, tur, match_date, match_time, status)
                VALUES (v_away_id, v_home_id, p_season_id, v_round + v_total_rounds, 
                        v_match_date + (v_total_rounds * 7), '12:00', 'scheduled');
            END IF;
        END LOOP;
        
        -- Rotating dizisini döndür
        v_last_id := v_team_ids_rotating[array_length(v_team_ids_rotating, 1)];
        FOR i IN array_length(v_team_ids_rotating, 1)..2 LOOP
            v_team_ids_rotating[i] := v_team_ids_rotating[i-1];
        END LOOP;
        v_team_ids_rotating[1] := v_last_id;
        
        -- Sonraki hafta
        v_match_date := v_match_date + 7;
    END LOOP;
END;
$$;

-- 10. finalize_season RPC fonksiyonu (mevcut mu kontrol et, yoksa oluştur)
CREATE OR REPLACE FUNCTION finalize_season(p_season_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE seasons SET is_finished = true WHERE id = p_season_id;
END;
$$;

-- 11. Mevcut 4. Lig'i güncelle (isimlendirmeyi standartlaştır)
UPDATE leagues SET name = '4. Lig' WHERE tier = 4 AND name LIKE '4%Lig%' AND name NOT LIKE '%Bölüm%' AND name NOT LIKE '%Grup%';
