-- ═══════════════════════════════════════════════════════════════
-- INJURY SYSTEM — Sakatlık Sistemi Migration
-- Görev 4: Injury System
-- ═══════════════════════════════════════════════════════════════
--
-- players tablosuna sakatlık ile ilgili kolonlar ekler.
-- IF NOT EXISTS kullanılarak idempotent hale getirilmiştir.
-- ═══════════════════════════════════════════════════════════════

-- is_injured: Oyuncu şu an sakat mı?
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'players'
      AND column_name = 'is_injured'
  ) THEN
    ALTER TABLE public.players ADD COLUMN is_injured BOOLEAN NOT NULL DEFAULT false;
  END IF;
END
$$;

-- injury_end_date: Sakatlık bitiş tarihi (null = sakat değil)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'players'
      AND column_name = 'injury_end_date'
  ) THEN
    ALTER TABLE public.players ADD COLUMN injury_end_date TIMESTAMPTZ;
  END IF;
END
$$;

-- injury_severity: Sakatlık şiddeti ('light', 'medium', 'heavy' veya null)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'players'
      AND column_name = 'injury_severity'
  ) THEN
    ALTER TABLE public.players ADD COLUMN injury_severity TEXT;
  END IF;
END
$$;

-- ── İndeks: Sakat oyuncuları hızlı bulmak için ──
CREATE INDEX IF NOT EXISTS idx_players_is_injured ON public.players (is_injured) WHERE is_injured = true;
