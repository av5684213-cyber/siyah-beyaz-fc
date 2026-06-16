-- ═══════════════════════════════════════════════════════════════
-- match_sessions tablosuna eksik kolonlar
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.match_sessions ADD COLUMN IF NOT EXISTS match_date TEXT;
ALTER TABLE public.match_sessions ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_ms_match_date ON public.match_sessions(match_date);

NOTIFY pgrst, 'reload schema';
