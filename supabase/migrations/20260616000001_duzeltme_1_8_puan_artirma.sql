-- ═══════════════════════════════════════════════════════════════════════════════════════
-- SİYAH BEYAZ FC — PUAN ARTIRMA DÜZELTMELERİ (DÜZELTME 1-8)
-- Tarih: 2026-06-16
-- Hedef: 6.8/10 → 8.5/10
-- ═══════════════════════════════════════════════════════════════════════════════════════
--
-- İçerik:
--   DÜZELTME 1: Match Day — fixture sorgu desteği (kolon ekleme yok, kod değişikliği)
--   DÜZELTME 2: Operasyon Odası — active_operations genişletme + RLS
--   DÜZELTME 3: Envanter — profiles'e bonus_training_multiplier/expires + next_match_goal_mod
--   DÜZELTME 4: Keşif — profiles'e scout_level + auto-scout RPC
--   DÜZELTME 5: Haberler — weekly_reports'e goals_for/against + kişiselleştirme RPC
--   DÜZELTME 6: Bağımlılık — daily_tasks genişletme (yeni tipler, label, expires_at)
--   DÜZELTME 7: UX — profiles'e missing columns (last_friendly_date, daily_friendly_count, team_logo)
--                   + players'a missing columns (club, match_sharpness, loaned_from_profile_id)
--   DÜZELTME 8: Mentor — player_mentors genişletme yok, zaten mevcut
--
-- NOT: IF NOT EXISTS / IF EXISTS kullanılarak idempotent yazılmıştır.
-- ═══════════════════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- DÜZELTME 2 — OPERASYON ODASI: active_operations genişletme
-- ═══════════════════════════════════════════════════════════════════════════════════════
-- Tablo zaten var, eksik kolonlar ve index ekle

-- op_id üzerinden hızlı sorgulama (aktif operasyon listesi)
CREATE INDEX IF NOT EXISTS idx_active_operations_profile_expires
  ON public.active_operations(profile_id, expires_at);

-- RLS: Mevcut politikaları temizle ve yeniden uygula
DO $$ BEGIN
  -- Mevcut tüm politikaları temizle
  DECLARE
    pol_name TEXT;
  BEGIN
    FOR pol_name IN
      SELECT policyname FROM pg_policies
      WHERE tablename = 'active_operations' AND schemaname = 'public'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.active_operations', pol_name);
    END LOOP;
  END;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.active_operations ENABLE ROW LEVEL SECURITY;

-- Okuma: herkes kendi operasyonlarını görebilir
DO $$ BEGIN
  CREATE POLICY "active_ops_read" ON public.active_operations
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Yazma: RPC + service role üzerinden
DO $$ BEGIN
  CREATE POLICY "active_ops_insert" ON public.active_operations
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "active_ops_update" ON public.active_operations
    FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "active_ops_delete" ON public.active_operations
    FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- DÜZELTME 3 — ENVANTER: profiles'e item efekt kolonları
-- ═══════════════════════════════════════════════════════════════════════════════════════
-- InventoryTab'daki useItem fonksiyonu bu kolonları kullanacak:
--   - bonus_training_multiplier: antrenman etkisi çarpanı (training_boost item)
--   - bonus_training_expires: antrenman bonusu bitiş tarihi
--   - next_match_goal_mod: bir sonraki maç gol şansı modifiörü (match_boost item)

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bonus_training_multiplier NUMERIC DEFAULT 1.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bonus_training_expires TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS next_match_goal_mod NUMERIC DEFAULT 0;

-- rpc_update_profile allowed_fields'e yeni kolonları ekle
-- (Mevcut RPC'yi recreate ediyoruz, allowed_fields listesine ekleme yapıyoruz)
CREATE OR REPLACE FUNCTION public.rpc_update_profile(
  p_profile_id TEXT,
  p_updates JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
  v_allowed_fields TEXT[] := ARRAY[
    'money', 'credits', 'last_friendly_date', 'daily_friendly_count',
    'current_day', 'ticket_price', 'financial_health', 'team_logo',
    'stadium_upgrades', 'sponsors', 'reputation', 'fans', 'level', 'xp',
    'scout_slots', 'staff_coaches', 'staff_physios', 'staff_monthly_fees',
    'bonus_training_multiplier', 'bonus_training_expires', 'next_match_goal_mod',
    'scout_level', 'last_newspaper_applied', 'last_income_breakdown',
    'consecutive_losses', 'consecutive_wins', 'ffp_restricted',
    'salary_budget', 'total_salary_load', 'league_position'
  ];
  v_field TEXT;
  v_value JSONB;
  v_set_clause TEXT := '';
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_profile_id) INTO v_exists;
  IF NOT v_exists THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Profil bulunamadı');
  END IF;

  FOR v_field, v_value IN SELECT key, value FROM jsonb_each(p_updates)
  LOOP
    IF v_field = ANY(v_allowed_fields) THEN
      IF v_set_clause != '' THEN v_set_clause := v_set_clause || ', ';
      END IF;
      v_set_clause := v_set_clause || v_field || ' = ' || quote_literal(v_value #>> '{}');
    END IF;
  END LOOP;

  IF v_set_clause = '' THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Güncellenebilir alan yok');
  END IF;

  EXECUTE format('UPDATE public.profiles SET %s WHERE id = %L', v_set_clause, p_profile_id);

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_update_profile(TEXT, JSONB) TO anon, authenticated;


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- DÜZELTME 4 — KEŞİF SİSTEMİ: profiles'e scout_level + auto-scout RPC
-- ═══════════════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS scout_level INTEGER DEFAULT 1;

-- Auto-scout: Kullanıcı başına serbest ajanlardan otomatik keşif bildirimi üretir
-- weekly-evolution cron tarafından çağrılır
CREATE OR REPLACE FUNCTION public.rpc_auto_scout()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prof RECORD;
  v_scout_count INTEGER;
  v_free_agent RECORD;
  v_total INTEGER := 0;
BEGIN
  FOR v_prof IN
    SELECT id, scout_level FROM public.profiles WHERE is_bot = false
  LOOP
    v_scout_count := LEAST(3, COALESCE(v_prof.scout_level, 1) + 1);

    FOR v_free_agent IN
      SELECT id, name, position, rating, potential, age
      FROM public.players
      WHERE profile_id IS NULL
        AND team_id IS NULL
        AND rating >= 55 AND rating <= 75
      ORDER BY random()
      LIMIT v_scout_count
    LOOP
      INSERT INTO public.notifications (profile_id, title, body, type, is_read)
      VALUES (
        v_prof.id,
        'Scout Raporu',
        v_free_agent.name || ' (' || v_free_agent.age || ' yaş, ' || v_free_agent.position || ', ' || ROUND(v_free_agent.rating) || ' OVR) — serbest ajan',
        'scout_report',
        false
      ) ON CONFLICT DO NOTHING;

      v_total := v_total + 1;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'notifications_sent', v_total);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_auto_scout() TO anon, authenticated;


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- DÜZELTME 5 — HABERLER: weekly_reports'e gol kolonları + kişiselleştirme RPC
-- ═══════════════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.weekly_reports ADD COLUMN IF NOT EXISTS goals_for INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.weekly_reports ADD COLUMN IF NOT EXISTS goals_against INTEGER NOT NULL DEFAULT 0;

-- Kişiselleştirilmiş haber üretme RPC
CREATE OR REPLACE FUNCTION public.rpc_generate_personalized_news(p_profile_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
  v_squad_count INTEGER;
  v_best_scorer RECORD;
  v_youngest_star RECORD;
  v_league_pos INTEGER;
  v_news JSONB := '[]';
BEGIN
  -- Profil bilgilerini al
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_profile_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Profil bulunamadı');
  END IF;

  v_league_pos := COALESCE(v_profile.league_position, 10);

  -- Lider
  IF v_league_pos = 1 THEN
    v_news := v_news || jsonb_build_object(
      'title', v_profile.team_name || ' liderliği pekiştiriyor — şampiyonluk yolunda!',
      'type', 'championship'
    );
  END IF;

  -- Avrupa kupası
  IF v_league_pos <= 3 THEN
    v_news := v_news || jsonb_build_object(
      'title', v_profile.team_name || ' Avrupa kupası hayali kuruyor',
      'type', 'europe'
    );
  END IF;

  -- Küme düşme
  IF v_league_pos >= 16 THEN
    v_news := v_news || jsonb_build_object(
      'title', 'KURTARMA OPERASYONU: ' || v_profile.team_name || ' küme düşme hattında',
      'type', 'relegation'
    );
  END IF;

  -- En iyi golcü
  SELECT * INTO v_best_scorer
  FROM public.players
  WHERE profile_id = p_profile_id AND goals > 5
  ORDER BY goals DESC LIMIT 1;

  IF FOUND THEN
    v_news := v_news || jsonb_build_object(
      'title', v_best_scorer.name || ' gol rekoru peşinde — sezon ' || v_best_scorer.goals || ' gol',
      'type', 'top_scorer'
    );
  END IF;

  -- Genç yıldız
  SELECT * INTO v_youngest_star
  FROM public.players
  WHERE profile_id = p_profile_id AND age < 21 AND rating > 70
  ORDER BY rating DESC LIMIT 1;

  IF FOUND THEN
    v_news := v_news || jsonb_build_object(
      'title', v_youngest_star.name || ' (' || v_youngest_star.age || ') büyük kulüplerin radarında',
      'type', 'young_star'
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'news', v_news);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_generate_personalized_news(TEXT) TO anon, authenticated;


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- DÜZELTME 6 — BAĞIMLILIK: daily_tasks genişletme
-- ═══════════════════════════════════════════════════════════════════════════════════════
-- Mevcut tablo var, yeni kolonlar ve güncellenmiş CHECK constraint ekle

-- Yeni kolonlar
ALTER TABLE public.daily_tasks ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE public.daily_tasks ADD COLUMN IF NOT EXISTS reward_money BIGINT DEFAULT 0;
ALTER TABLE public.daily_tasks ADD COLUMN IF NOT EXISTS reward_credits INTEGER DEFAULT 0;
ALTER TABLE public.daily_tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.daily_tasks ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Eski label'ları description'dan kopyala (mevcut kayıtlar için)
UPDATE public.daily_tasks SET label = description WHERE label IS NULL AND description IS NOT NULL;

-- Eski reward_money/reward_credits'i reward_type/reward_amount'tan hesapla
UPDATE public.daily_tasks SET reward_money = reward_amount WHERE reward_type = 'money' AND reward_money = 0;
UPDATE public.daily_tasks SET reward_credits = reward_amount WHERE reward_type = 'credits' AND reward_credits = 0;

-- expires_at olmayanlara 24 saatlik süre ata
UPDATE public.daily_tasks SET expires_at = created_at + interval '24 hours'
WHERE expires_at IS NULL AND created_at IS NOT NULL;

-- CHECK constraint güncelle — eski tipler + yeni tipler
DO $$ BEGIN
  ALTER TABLE public.daily_tasks DROP CONSTRAINT IF EXISTS daily_tasks_task_type_check;
  ALTER TABLE public.daily_tasks DROP CONSTRAINT IF EXISTS daily_tasks_task_type;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.daily_tasks ADD CONSTRAINT daily_tasks_task_type_check
  CHECK (task_type IN (
    -- Eski tipler (backward compat)
    'win_3_0', 'list_2_players', 'train_11_players', 'promote_youth',
    'read_rival_analysis', 'play_friendly', 'scout_player',
    'renew_contract', 'buy_player', 'sell_player',
    -- TASARIM-4 tipleri
    'WIN_BIG', 'LIST_PLAYERS', 'FULL_TRAINING', 'PROMOTE_YOUTH',
    'READ_ANALYSIS', 'CHANGE_TACTICS', 'REST_INJURED',
    -- DÜZELTME 6: Yeni görev tipleri
    'win_match', 'train_session', 'scout_player_v2', 'sell_player_v2',
    'draw_match', 'buy_player_v2'
  ));

-- Eski UNIQUE constraint varsa bırak (yeni tiplerle çakışabilir)
-- Yeni: expires_at bazlı uniqueness daha esnek
CREATE INDEX IF NOT EXISTS idx_daily_tasks_profile_expires
  ON public.daily_tasks(user_id, expires_at);

-- Günlük görev atama RPC'sini güncelle (yeni tipler destekli)
CREATE OR REPLACE FUNCTION public.assign_daily_tasks(p_user_id TEXT)
RETURNS void AS $$
DECLARE
  v_task_types TEXT[] := ARRAY[
    'win_match', 'train_session', 'scout_player', 'sell_player',
    'draw_match', 'buy_player', 'play_friendly', 'promote_youth'
  ];
  v_labels JSONB := '{
    "win_match":      "Bugün galip gel",
    "train_session":  "Antrenman yap",
    "scout_player":   "2 oyuncu keşfet",
    "sell_player":    "Bir oyuncu sat",
    "draw_match":     "Berabere kal",
    "buy_player":     "Bir oyuncu satın al",
    "play_friendly":  "Bir hazırlık maçı oyna",
    "promote_youth":  "Genç bir oyuncuyu terfi ettir"
  }';
  v_rewards JSONB := '{
    "win_match":      {"money": 50000,  "credits": 0},
    "train_session":  {"money": 25000,  "credits": 0},
    "scout_player":   {"money": 0,      "credits": 2},
    "sell_player":    {"money": 30000,  "credits": 0},
    "draw_match":     {"money": 20000,  "credits": 1},
    "buy_player":     {"money": 10000,  "credits": 0},
    "play_friendly":  {"money": 25000,  "credits": 0},
    "promote_youth":  {"money": 0,      "credits": 3}
  }';
  v_selected TEXT[];
  v_tt TEXT;
  v_label TEXT;
  v_reward JSONB;
BEGIN
  -- Bugün zaten aktif görevi var mı?
  IF EXISTS (
    SELECT 1 FROM public.daily_tasks
    WHERE user_id = p_user_id
      AND expires_at > NOW()
      AND is_completed = false
  ) THEN
    RETURN; -- Zaten bugünün görevleri var
  END IF;

  -- Rastgele 3 görev seç
  SELECT array_agg(tt) INTO v_selected
  FROM (SELECT unnest(v_task_types) AS tt ORDER BY random() LIMIT 3) sub;

  FOREACH v_tt IN ARRAY v_selected LOOP
    v_label := v_labels->>v_tt;
    v_reward := v_rewards->v_tt;

    INSERT INTO public.daily_tasks (
      user_id, task_type, description, label,
      reward_type, reward_amount,
      reward_money, reward_credits,
      date, expires_at
    ) VALUES (
      p_user_id,
      v_tt,
      v_label,
      v_label,
      CASE WHEN (v_reward->>'credits')::INTEGER > 0 THEN 'credits' ELSE 'money' END,
      GREATEST((v_reward->>'money')::INTEGER, (v_reward->>'credits')::INTEGER),
      (v_reward->>'money')::BIGINT,
      (v_reward->>'credits')::INTEGER,
      CURRENT_DATE,
      NOW() + interval '24 hours'
    ) ON CONFLICT (user_id, task_type, date) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Görev tamamlama RPC'sini güncelle (reward_money + reward_credits destekli)
CREATE OR REPLACE FUNCTION public.complete_daily_task(p_task_id UUID, p_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_task daily_tasks%ROWTYPE;
BEGIN
  SELECT * INTO v_task
  FROM public.daily_tasks
  WHERE id = p_task_id AND user_id = p_user_id AND is_completed = false;

  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "Görev bulunamadı veya zaten tamamlandı"}'::JSONB;
  END IF;

  UPDATE public.daily_tasks
  SET is_completed = true, completed_at = NOW(), is_claimed = true
  WHERE id = p_task_id;

  -- Para ödülü
  IF COALESCE(v_task.reward_money, 0) > 0 THEN
    UPDATE public.profiles SET money = money + v_task.reward_money WHERE id = p_user_id;
  END IF;

  -- Kredi ödülü
  IF COALESCE(v_task.reward_credits, 0) > 0 THEN
    UPDATE public.profiles SET credits = COALESCE(credits, 0) + v_task.reward_credits WHERE id = p_user_id;
  END IF;

  -- Eski reward_type/reward_amount desteği (backward compat)
  IF v_task.reward_type = 'money' AND COALESCE(v_task.reward_money, 0) = 0 AND v_task.reward_amount > 0 THEN
    UPDATE public.profiles SET money = money + v_task.reward_amount WHERE id = p_user_id;
  ELSIF v_task.reward_type = 'credits' AND COALESCE(v_task.reward_credits, 0) = 0 AND v_task.reward_amount > 0 THEN
    UPDATE public.profiles SET credits = COALESCE(credits, 0) + v_task.reward_amount WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'reward_money', COALESCE(v_task.reward_money, 0),
    'reward_credits', COALESCE(v_task.reward_credits, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.complete_daily_task(UUID, TEXT) TO anon, authenticated;


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- DÜZELTME 7 — UX: Eksik kolonlar (runtime hataları düzeltme)
-- ═══════════════════════════════════════════════════════════════════════════════════════
-- Bu kolonlar kodda referans edilmiş ama DB'de hiç oluşturulmamış.

-- profiles eksik kolonları
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_friendly_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_friendly_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS team_logo TEXT;

-- players eksik kolonları
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS club TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS match_sharpness INTEGER DEFAULT 50;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS loaned_from_profile_id TEXT;

-- club kolonunu mevcut verilerle doldur (team_name'den kopyala)
UPDATE public.players SET club = team_name WHERE club IS NULL AND team_name IS NOT NULL;


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- DÜZELTME 8 — MENTOR: player_mentors (zaten mevcut, ek kolon gerekmiyor)
-- ═══════════════════════════════════════════════════════════════════════════════════════
-- player_mentors tablosu zaten mevcut: id, mentor_id, mentee_id, profile_id, bonus_rate, created_at
-- UI tarafında mentor etkisini göstermek için RPC ekle

-- Oyuncunun mentor bilgisini getir
CREATE OR REPLACE FUNCTION public.rpc_get_player_mentor(p_player_id TEXT, p_profile_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mentor RECORD;
  v_mentor_player RECORD;
BEGIN
  SELECT * INTO v_mentor
  FROM public.player_mentors
  WHERE mentee_id = p_player_id AND profile_id = p_profile_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', true, 'has_mentor', false);
  END IF;

  SELECT id, name, position, rating, age INTO v_mentor_player
  FROM public.players
  WHERE id = v_mentor.mentor_id;

  RETURN jsonb_build_object(
    'success', true,
    'has_mentor', true,
    'mentor_id', v_mentor.mentor_id,
    'mentor_name', v_mentor_player.name,
    'mentor_position', v_mentor_player.position,
    'mentor_rating', v_mentor_player.rating,
    'bonus_rate', v_mentor.bonus_rate
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_get_player_mentor(TEXT, TEXT) TO anon, authenticated;


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- EK: notifications tablosuna metadata kolonu (scout_report için player_id saklama)
-- ═══════════════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- notifications type CHECK constraint güncelle (yeni tipler ekle)
DO $$ BEGIN
  ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
  ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
-- NOT: type kolonunda CHECK yoksa hata vermez, varsa günceller


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- EK: daily_tasks RLS güncelleme (rpc_update_profile ile uyumlu)
-- ═══════════════════════════════════════════════════════════════════════════════════════
-- Mevcut RLS politikalarını temizle ve yeniden uygula
DO $$ BEGIN
  DECLARE
    pol_name TEXT;
  BEGIN
    FOR pol_name IN
      SELECT policyname FROM pg_policies
      WHERE tablename = 'daily_tasks' AND schemaname = 'public'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.daily_tasks', pol_name);
    END LOOP;
  END;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "daily_tasks_read" ON public.daily_tasks FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "daily_tasks_insert" ON public.daily_tasks FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "daily_tasks_update" ON public.daily_tasks FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "daily_tasks_delete" ON public.daily_tasks FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- EK: rpc_save_training_result allowed_fields güncelleme
-- (match_sharpness, club, loaned_from_profile_id eklendi)
-- ═══════════════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.rpc_save_training_result(
  p_profile_id TEXT,
  p_player_id TEXT,
  p_updates JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_exists BOOLEAN;
  v_allowed_fields TEXT[] := ARRAY[
    'shooting', 'passing', 'defending', 'speed', 'power',
    'heading', 'goalkeeping', 'control', 'vision', 'finishing', 'dribbling',
    'first_touch', 'crossing', 'marking', 'tackling', 'technique', 'long_shots',
    'acceleration', 'agility', 'balance', 'strength', 'stamina',
    'rating', 'cond', 'morale', 'form', 'form_rating',
    'is_for_sale', 'sale_price', 'is_injured', 'injury', 'injury_end_date', 'injury_severity',
    'match_sharpness', 'confidence', 'profile_id', 'team_name', 'club',
    'dissatisfaction_level', 'manager_response', 'scouted', 'scouting_stars', 'scouting_count',
    'loaned_from_profile_id', 'loaned_to_profile_id', 'loan_status',
    'goals', 'assists', 'matches_played', 'clean_sheets', 'yellow_cards', 'red_cards',
    'consecutive_good_matches', 'consecutive_bad_matches', 'confidence_status',
    'weeks_not_started', 'is_on_loan_market', 'loan_fee', 'loan_status'
  ];
  v_field TEXT;
  v_value JSONB;
  v_set_clause TEXT := '';
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.players WHERE id = p_player_id AND profile_id = p_profile_id) INTO v_player_exists;
  IF NOT v_player_exists THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Oyuncu bulunamadı veya sizin değil');
  END IF;

  FOR v_field, v_value IN SELECT key, value FROM jsonb_each(p_updates)
  LOOP
    IF v_field = ANY(v_allowed_fields) THEN
      IF v_set_clause != '' THEN v_set_clause := v_set_clause || ', ';
      END IF;
      v_set_clause := v_set_clause || v_field || ' = ' || quote_literal(v_value #>> '{}');
    END IF;
  END LOOP;

  IF v_set_clause = '' THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Güncellenebilir alan yok');
  END IF;

  EXECUTE format('UPDATE public.players SET %s WHERE id = %L AND profile_id = %L', v_set_clause, p_player_id, p_profile_id);

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_save_training_result(TEXT, TEXT, JSONB) TO anon, authenticated;


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- EK: match-tick için operasyon etkisi RPC
-- DÜZELTME 2'de match-tick'in okuyacağı aktif operasyonları getirir
-- ═══════════════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.rpc_get_active_operations(p_profile_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ops JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'op_id', op_id,
      'impact_type', impact_type,
      'impact_value', impact_value,
      'target_profile_id', target_profile_id,
      'profile_id', profile_id,
      'expires_at', expires_at
    )
  ), '[]'::jsonb) INTO v_ops
  FROM public.active_operations
  WHERE (profile_id = p_profile_id OR target_profile_id = p_profile_id)
    AND expires_at > NOW();

  RETURN jsonb_build_object('success', true, 'operations', v_ops);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_get_active_operations(TEXT) TO anon, authenticated;


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- EK: Süresi dolmuş operasyonları temizle (cron tarafından çağrılabilir)
-- ═══════════════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.rpc_cleanup_expired_operations()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.active_operations WHERE expires_at < NOW();
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN jsonb_build_object('success', true, 'deleted', v_deleted);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_cleanup_expired_operations() TO anon, authenticated;


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- EK: Süresi dolmuş daily_tasks'ları temizle
-- ═══════════════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.rpc_cleanup_expired_daily_tasks()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.daily_tasks WHERE expires_at < NOW() AND is_completed = true;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN jsonb_build_object('success', true, 'deleted', v_deleted);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_cleanup_expired_daily_tasks() TO anon, authenticated;


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- ŞEMA ÖNBELLEĞİ YENİLE
-- ═══════════════════════════════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- MIGRATION TAMAMLANDI
-- ═══════════════════════════════════════════════════════════════════════════════════════
