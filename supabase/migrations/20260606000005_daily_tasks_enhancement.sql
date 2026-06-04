-- ═══════════════════════════════════════════════════════════════════════
-- TASARIM-4: Daily Task System Enhancement
-- Günlük görev sistemini geliştirir: progress, target_value, is_claimed
-- sütunları ve yeni görev tipleri ekler.
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Yeni sütunlar ────────────────────────────────────────────────
ALTER TABLE public.daily_tasks ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.daily_tasks ADD COLUMN IF NOT EXISTS target_value INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.daily_tasks ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN NOT NULL DEFAULT false;

-- ─── CHECK constraint güncelle ─────────────────────────────────────
-- Eski constraint'i kaldır, yenisini ekle (hem eski hem yeni tipleri destekler)
DO $$ BEGIN
  -- Eski constraint adını bul ve kaldır
  ALTER TABLE public.daily_tasks DROP CONSTRAINT IF EXISTS daily_tasks_task_type_check;
  -- constraint adı farklı olabilir, generic olarak dene
  ALTER TABLE public.daily_tasks DROP CONSTRAINT IF EXISTS daily_tasks_task_type;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.daily_tasks ADD CONSTRAINT daily_tasks_task_type_check
  CHECK (task_type IN (
    -- Eski tipler (backward compat)
    'win_3_0', 'list_2_players', 'train_11_players', 'promote_youth',
    'read_rival_analysis', 'play_friendly', 'scout_player',
    'renew_contract', 'buy_player', 'sell_player',
    -- Yeni tipler (TASARIM-4)
    'WIN_BIG', 'LIST_PLAYERS', 'FULL_TRAINING', 'PROMOTE_YOUTH',
    'READ_ANALYSIS', 'CHANGE_TACTICS', 'REST_INJURED'
  ));
