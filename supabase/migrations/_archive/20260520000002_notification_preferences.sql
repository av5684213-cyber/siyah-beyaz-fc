-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 11: NOTIFICATION_PREFERENCES TABLOSU (bildirim tercihleri)
-- Bu SQL'i Supabase Dashboard → SQL Editor'de çalıştırın
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT NOT NULL UNIQUE,
  match_reminder BOOLEAN DEFAULT true,
  transfer_offer BOOLEAN DEFAULT true,
  training_report BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_prefs_profile ON notification_preferences(profile_id);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "notif_prefs_select_all" ON notification_preferences FOR SELECT USING (true);
  CREATE POLICY "notif_prefs_insert_all" ON notification_preferences FOR INSERT WITH CHECK (true);
  CREATE POLICY "notif_prefs_update_all" ON notification_preferences FOR UPDATE USING (true);
  CREATE POLICY "notif_prefs_delete_all" ON notification_preferences FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
