-- ═══════════════════════════════════════════════════════════════
-- Push Subscriptions Tablosu
-- Web Push bildirim aboneliklerini saklar
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL UNIQUE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (profile_id = auth.uid()::text);

CREATE POLICY "Users can insert own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "Users can update own subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (profile_id = auth.uid()::text);

CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (profile_id = auth.uid()::text);
