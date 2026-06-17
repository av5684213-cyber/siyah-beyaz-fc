-- ═══════════════════════════════════════════════════════════════════════════
-- YENİ: generate_league_fixtures — her turdaki maçlar 10'ar dakika arayla
--
-- KULLANICI İSTEĞİ:
--   Lig her gün 12:00'da başlamalı. Her turdaki 9 maç (18 takımlı lig)
--   sırayla 12:00, 12:10, 12:20, 12:30, 12:40, 12:50, 13:00, 13:10, 13:20
--   saatlerinde oynanmalı. Böylece maçlar 10'ar dakika arayla sırayla
--   simüle edilir, hepsi aynı anda değil.
--
-- ÇÖZÜM:
--   generate_league_fixtures RPC'sini güncelle. Her turdaki maçlar için
--   bir counter tut, 12:00 + (counter * 10 dakika) hesapla. Bu sayede
--   9 maçlı bir turda 12:00'dan 13:20'ye kadar 10'ar dakika arayla 9 slot.
-- ═══════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS generate_league_fixtures(uuid);
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
    v_match_time text;
    v_match_count integer;
    v_match_hour integer;
    v_match_minute integer;
BEGIN
    SELECT league_id INTO v_league_id FROM seasons WHERE id = p_season_id;
    IF v_league_id IS NULL THEN RETURN; END IF;

    SELECT array_agg(id ORDER BY id) INTO v_team_ids
    FROM league_teams WHERE league_id = v_league_id;

    v_n := array_length(v_team_ids, 1);
    IF v_n IS NULL OR v_n < 2 THEN RETURN; END IF;

    -- Tek sayı takım varsa, bye (dummy) ekle
    IF v_n % 2 != 0 THEN
        v_team_ids := v_team_ids || '00000000-0000-0000-0000-000000000000'::uuid;
        v_n := v_n + 1;
    END IF;

    v_total_rounds := v_n - 1;
    v_half := v_n / 2;
    v_fixed_id := v_team_ids[1];
    v_team_ids_rotating := v_team_ids[2:v_n];

    -- Maçlar yarından itibaren başlasın (lig başlangıcı)
    v_match_date := CURRENT_DATE + 1;

    FOR v_round IN 1..v_total_rounds LOOP
        v_team_ids := ARRAY[v_fixed_id];
        FOR i IN 1..array_length(v_team_ids_rotating, 1) LOOP
            v_team_ids := v_team_ids || v_team_ids_rotating[i];
        END LOOP;

        v_match_count := 0;

        FOR v_match IN 0..(v_half - 1) LOOP
            v_home_id := v_team_ids[v_match + 1];
            v_away_id := v_team_ids[v_n - v_match];

            IF v_home_id != '00000000-0000-0000-0000-000000000000'::uuid AND
               v_away_id != '00000000-0000-0000-0000-000000000000'::uuid THEN

                -- Maç saati hesapla: 12:00'dan başla, her maç 10 dakika sonra
                -- Örn: v_match_count=0 → 12:00, =1 → 12:10, =2 → 12:20, ..., =8 → 13:20
                v_match_hour := 12 + FLOOR(v_match_count * 10 / 60);
                v_match_minute := (v_match_count * 10) % 60;
                v_match_time := LPAD(v_match_hour::text, 2, '0') || ':' || LPAD(v_match_minute::text, 2, '0');

                -- İlk yarı (round 1..v_total_rounds)
                INSERT INTO fixtures (home_team_id, away_team_id, season_id, tur, match_date, match_time, status, competition_type)
                VALUES (v_home_id, v_away_id, p_season_id, v_round, v_match_date, v_match_time, 'scheduled', 'league');

                -- Rövanş (ikinci yarı): aynı saat slotu, ama rövanş tarihi
                INSERT INTO fixtures (home_team_id, away_team_id, season_id, tur, match_date, match_time, status, competition_type)
                VALUES (v_away_id, v_home_id, p_season_id, v_round + v_total_rounds,
                        v_match_date + (v_total_rounds * 7), v_match_time, 'scheduled', 'league');

                v_match_count := v_match_count + 1;
            END IF;
        END LOOP;

        -- Round-robin rotation
        v_last_id := v_team_ids_rotating[array_length(v_team_ids_rotating, 1)];
        FOR i IN array_length(v_team_ids_rotating, 1)..2 LOOP
            v_team_ids_rotating[i] := v_team_ids_rotating[i-1];
        END LOOP;
        v_team_ids_rotating[1] := v_last_id;
        v_match_date := v_match_date + 7;
    END LOOP;
END;
$$;

-- ─── Mevcut fikstürleri sil ki yeniden üretilsin ───
-- (Opsiyonel — sadece yeni RPC'nin çalışmasını test etmek için)
-- DELETE FROM fixtures WHERE competition_type = 'league';
