-- ═══════════════════════════════════════════════════════════════════════════
-- FIX: generate_league_fixtures - 12:00 VE 18:00 saatlerinde fikstür oluştur
--
-- SORUN: Önceki versiyon tüm maçları sadece 12:00'a atıyordu.
-- Bu durum 18:00 maçları için hiçbir fikstür oluşturmuyordu.
--
-- ÇÖZÜM: Her turdaki maçları yarı yarıya 12:00 ve 18:00 olarak dağıt.
-- İlk yarı maçları 12:00, ikinci yarı maçları 18:00 olarak planla.
-- Her turda birden fazla maç varsa, 12:00 ve 18:00'e böl.
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
BEGIN
    SELECT league_id INTO v_league_id FROM seasons WHERE id = p_season_id;
    IF v_league_id IS NULL THEN RETURN; END IF;

    SELECT array_agg(id ORDER BY id) INTO v_team_ids
    FROM league_teams WHERE league_id = v_league_id;

    v_n := array_length(v_team_ids, 1);
    IF v_n IS NULL OR v_n < 2 THEN RETURN; END IF;

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

                -- İlk yarı (round 1-v_total_rounds): maçları 12:00 ve 18:00'e dağıt
                -- Her turdaki maçları sırayla 12:00 ve 18:00'e ata
                IF v_match_count % 2 = 0 THEN
                    v_match_time := '12:00';
                ELSE
                    v_match_time := '18:00';
                END IF;

                INSERT INTO fixtures (home_team_id, away_team_id, season_id, tur, match_date, match_time, status, competition_type)
                VALUES (v_home_id, v_away_id, p_season_id, v_round, v_match_date, v_match_time, 'scheduled', 'league');

                -- Rövanş (ikinci yarı): saatleri tersine çevir (12→18, 18→12)
                IF v_match_count % 2 = 0 THEN
                    v_match_time := '18:00';
                ELSE
                    v_match_time := '12:00';
                END IF;

                INSERT INTO fixtures (home_team_id, away_team_id, season_id, tur, match_date, match_time, status, competition_type)
                VALUES (v_away_id, v_home_id, p_season_id, v_round + v_total_rounds,
                        v_match_date + (v_total_rounds * 7), v_match_time, 'scheduled', 'league');

                v_match_count := v_match_count + 1;
            END IF;
        END LOOP;

        v_last_id := v_team_ids_rotating[array_length(v_team_ids_rotating, 1)];
        FOR i IN array_length(v_team_ids_rotating, 1)..2 LOOP
            v_team_ids_rotating[i] := v_team_ids_rotating[i-1];
        END LOOP;
        v_team_ids_rotating[1] := v_last_id;
        v_match_date := v_match_date + 7;
    END LOOP;
END;
$$;
