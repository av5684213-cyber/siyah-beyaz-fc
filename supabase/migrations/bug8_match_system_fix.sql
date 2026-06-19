-- [BUG-8] Maç sistemi düzeltmeleri — Supabase SQL Editor'da çalıştırın
-- Tüm komutlar idempotent (tekrar çalıştırılabilir)

BEGIN;

-- ═════════════════════════════════════════════════════════════════
-- 1. MATCH_SESSIONS — home_tactic/away_tactic sütunlarını TEXT yap + eksik sütunları ekle
-- ═════════════════════════════════════════════════════════════════
-- [BUG-8 KÖK NEDEN] match-scheduler 'home_tactic' alanına 'tiki-taka' gibi düz string insert ediyor.
-- JSONB sütuna düz string insert edilemiyor → insert başarısız → 0 match_session!
ALTER TABLE match_sessions ALTER COLUMN home_tactic TYPE TEXT USING home_tactic::text;
ALTER TABLE match_sessions ALTER COLUMN away_tactic TYPE TEXT USING away_tactic::text;

ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_formation TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_formation TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_goal_mod FLOAT DEFAULT 1.0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_goal_mod FLOAT DEFAULT 1.0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_conceed_mod FLOAT DEFAULT 1.0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_conceed_mod FLOAT DEFAULT 1.0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_tactic_obj JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_tactic_obj JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS referee_data JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_team_name TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_team_name TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_team_id UUID;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_team_id UUID;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS simulation_speed FLOAT DEFAULT 1.0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_atmosphere JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_match_sessions_fixture ON match_sessions(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_sessions_home_team ON match_sessions(home_team_id);
CREATE INDEX IF NOT EXISTS idx_match_sessions_away_team ON match_sessions(away_team_id);
CREATE INDEX IF NOT EXISTS idx_match_sessions_status ON match_sessions(status);

-- ═════════════════════════════════════════════════════════════════
-- 2. LIVE_MATCHES — eksik sütunları ekle
-- ═════════════════════════════════════════════════════════════════
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS home_team_id UUID;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS away_team_id UUID;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS home_team_name TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS away_team_name TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS weather TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS referee_id TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS referee_name TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS referee_personality TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS referee_strictness FLOAT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS total_events INTEGER DEFAULT 0;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS revealed_events INTEGER DEFAULT 0;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS session_id UUID;

CREATE INDEX IF NOT EXISTS idx_live_matches_fixture ON live_matches(fixture_id);
CREATE INDEX IF NOT EXISTS idx_live_matches_session ON live_matches(session_id);
CREATE INDEX IF NOT EXISTS idx_live_matches_status ON live_matches(status);
CREATE INDEX IF NOT EXISTS idx_live_matches_home_team ON live_matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_live_matches_away_team ON live_matches(away_team_id);

-- ═════════════════════════════════════════════════════════════════
-- 3. MATCH_PARTICIPANTS — tablo yoksa oluştur, UNIQUE constraint ekle
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS match_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  team_id UUID NOT NULL,
  profile_id UUID,
  side TEXT NOT NULL CHECK (side IN ('home', 'away')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Duplicate temizle: aynı (fixture_id, team_id) çiftinden birden fazla varsa, en eskisini tut
DELETE FROM match_participants
WHERE id NOT IN (
  SELECT MIN(id) FROM match_participants
  GROUP BY fixture_id, team_id
);

-- UNIQUE constraint ekle (duplicate önlemi)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'match_participants_fixture_team_unique'
  ) THEN
    ALTER TABLE match_participants ADD CONSTRAINT match_participants_fixture_team_unique UNIQUE (fixture_id, team_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_match_participants_fixture ON match_participants(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_team ON match_participants(team_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_profile ON match_participants(profile_id);

ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "match_participants_select_all" ON match_participants;
DROP POLICY IF EXISTS "match_participants_insert_all" ON match_participants;
DROP POLICY IF EXISTS "match_participants_update_all" ON match_participants;
CREATE POLICY "match_participants_select_all" ON match_participants FOR SELECT USING (true);
CREATE POLICY "match_participants_insert_all" ON match_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "match_participants_update_all" ON match_participants FOR UPDATE USING (true);

COMMIT;

-- ═════════════════════════════════════════════════════════════════
-- 4. GENERATE_LEAGUE_FIXTURES — idempotent + 12:00/18:00 slot + Pzt-Per
-- ═════════════════════════════════════════════════════════════════
DROP FUNCTION IF EXISTS generate_league_fixtures;
CREATE OR REPLACE FUNCTION generate_league_fixtures(p_season_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
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
    v_existing_count integer;
    v_base_date date;
    v_target_dow integer;
    v_days_to_add integer;
    v_next_dow integer;
    v_next_offset integer;
    v_return_date date;
    v_return_dow integer;
    v_return_days_to_add integer;
BEGIN
    SELECT league_id INTO v_league_id FROM seasons WHERE id = p_season_id;
    IF v_league_id IS NULL THEN RETURN; END IF;

    -- İdempotency: Bu sezon için zaten fikstür varsa tekrar üretme
    SELECT count(*) INTO v_existing_count FROM fixtures WHERE season_id = p_season_id;
    IF v_existing_count > 0 THEN
        RAISE NOTICE 'Sezon % için zaten % fikstür mevcut, üretim atlanıyor.', p_season_id, v_existing_count;
        RETURN;
    END IF;

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

    -- İlk maç günü = yarın, Pzt-Cum arası iş günü
    -- Hafta içi = Pzt-Cum (1-5), hafta sonu = Cmt-Paz (0,6) lig maçı yok
    v_base_date := CURRENT_DATE + 1;
    v_target_dow := EXTRACT(DOW FROM v_base_date)::integer;
    IF v_target_dow = 6 THEN v_days_to_add := 2;
    ELSIF v_target_dow = 0 THEN v_days_to_add := 1;
    ELSE v_days_to_add := 0;
    END IF;
    v_match_date := v_base_date + v_days_to_add;

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

                -- 12:00 ve 18:00 slotları arasında sırayla değiştir
                IF v_match_count % 2 = 0 THEN
                    v_match_time := '12:00';
                ELSE
                    v_match_time := '18:00';
                END IF;

                INSERT INTO fixtures (home_team_id, away_team_id, season_id, tur, match_date, match_time, status, competition_type)
                VALUES (v_home_id, v_away_id, p_season_id, v_round, v_match_date, v_match_time, 'scheduled', 'league')
                ON CONFLICT DO NOTHING;

                -- Rövanş: v_total_rounds hafta sonra, ters slot
                v_return_date := v_match_date + (v_total_rounds * 7);
                v_return_dow := EXTRACT(DOW FROM v_return_date)::integer;
                IF v_return_dow = 6 THEN v_return_days_to_add := 2;
                ELSIF v_return_dow = 0 THEN v_return_days_to_add := 1;
                ELSE v_return_days_to_add := 0;
                END IF;
                v_return_date := v_return_date + v_return_days_to_add;

                INSERT INTO fixtures (home_team_id, away_team_id, season_id, tur, match_date, match_time, status, competition_type)
                VALUES (v_away_id, v_home_id, p_season_id, v_round + v_total_rounds,
                        v_return_date,
                        CASE WHEN v_match_time = '12:00' THEN '18:00' ELSE '12:00' END,
                        'scheduled', 'league')
                ON CONFLICT DO NOTHING;

                v_match_count := v_match_count + 1;
            END IF;
        END LOOP;

        v_last_id := v_team_ids_rotating[array_length(v_team_ids_rotating, 1)];
        FOR i IN array_length(v_team_ids_rotating, 1)..2 LOOP
            v_team_ids_rotating[i] := v_team_ids_rotating[i-1];
        END LOOP;
        v_team_ids_rotating[1] := v_last_id;

        -- Sonraki tur: 1 iş günü ileri (Cum → Pzt = +3, diğerleri +1)
        v_next_dow := EXTRACT(DOW FROM v_match_date)::integer;
        IF v_next_dow = 5 THEN v_next_offset := 3;
        ELSE v_next_offset := 1;
        END IF;
        v_match_date := v_match_date + v_next_offset;
    END LOOP;
END;
$$;

-- ═════════════════════════════════════════════════════════════════
-- 5. DİĞER TEMİZLİKLER
-- ═════════════════════════════════════════════════════════════════

-- Bugüne ait scheduled + geçmiş tarihli fixture'ları finished'a çek (eğer process edilemediyse)
-- Bu, "takılı kalmış" scheduled maçları temizler
UPDATE fixtures
SET status = 'finished',
    home_score = COALESCE(home_score, 0),
    away_score = COALESCE(away_score, 0)
WHERE status = 'scheduled'
  AND match_date < CURRENT_DATE - INTERVAL '2 days';

-- future-dated scheduled maçlar dokunma — cron onları zamanında başlatacak

-- Bilgi amaçlı
DO $$
DECLARE
  v_total_fixtures integer;
  v_finished integer;
  v_scheduled integer;
  v_sessions integer;
BEGIN
  SELECT count(*) INTO v_total_fixtures FROM fixtures;
  SELECT count(*) INTO v_finished FROM fixtures WHERE status = 'finished';
  SELECT count(*) INTO v_scheduled FROM fixtures WHERE status = 'scheduled';
  SELECT count(*) INTO v_sessions FROM match_sessions;

  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE ' Toplam fikstür: %', v_total_fixtures;
  RAISE NOTICE ' Finished: %', v_finished;
  RAISE NOTICE ' Scheduled: %', v_scheduled;
  RAISE NOTICE ' Match sessions: %', v_sessions;
  RAISE NOTICE '═══════════════════════════════════════════════';
END $$;
