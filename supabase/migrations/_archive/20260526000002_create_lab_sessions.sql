-- =============================================================
-- lab_sessions tablosu: TacticLab oturum kayıt sistemi
-- Firebase Firestore'dan Supabase'a geçiş
-- =============================================================

CREATE TABLE IF NOT EXISTS public.lab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_a JSONB NOT NULL DEFAULT '[]',
  team_b JSONB NOT NULL DEFAULT '[]',
  selected_formation TEXT NOT NULL DEFAULT '4-4-2',
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Her kullanıcı için sadece bir oturum
  CONSTRAINT lab_sessions_user_id_unique UNIQUE (user_id)
);

-- RLS etkinleştir
ALTER TABLE public.lab_sessions ENABLE ROW LEVEL SECURITY;

-- Kullanıcı sadece kendi oturumunu okuyabilir
CREATE POLICY "Users can read own lab session"
  ON public.lab_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Kullanıcı sadece kendi oturumunu yazabilir
CREATE POLICY "Users can insert own lab session"
  ON public.lab_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcı sadece kendi oturumunu güncelleyebilir
CREATE POLICY "Users can update own lab session"
  ON public.lab_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Kullanıcı sadece kendi oturumunu silebilir
CREATE POLICY "Users can delete own lab session"
  ON public.lab_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION public.update_lab_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lab_sessions_updated_at
  BEFORE UPDATE ON public.lab_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lab_sessions_updated_at();

-- İndeks
CREATE INDEX IF NOT EXISTS idx_lab_sessions_user_id ON public.lab_sessions(user_id);
