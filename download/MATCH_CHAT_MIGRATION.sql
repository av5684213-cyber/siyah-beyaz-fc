-- ═══════════════════════════════════════════════════════════════════════
-- ADIM 6: Match Chat Migration
-- match_chat tablosu: Maç sırasında gerçek zamanlı sohbet
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 1. match_chat TABLOSU ────────────────────────────────────────────
-- Maç odası bazlı sohbet mesajları (fixture_id ile odaya gruplanır)
CREATE TABLE IF NOT EXISTS match_chat (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id    TEXT NOT NULL,              -- Maç ID (fixture ID veya "friendly-{timestamp}")
  profile_id    TEXT NOT NULL,              -- profiles.id referansı (TEXT tipi)
  sender_name   TEXT NOT NULL,              -- Takım adı (denormalize)
  content       TEXT NOT NULL,              -- Mesaj içeriği (max 200 karakter)
  message_type  TEXT NOT NULL DEFAULT 'chat', -- chat, reaction, event, system
  reaction_type TEXT,                       -- 👍 👎 ⚽ 🔥 😱 ❤️ (sadece reaction tipinde)
  minute        INTEGER,                    -- Maç dakikası (event/reaction için)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: fixture + zaman bazında hızlı sorgulama
CREATE INDEX IF NOT EXISTS idx_match_chat_fixture ON match_chat(fixture_id, created_at);
CREATE INDEX IF NOT EXISTS idx_match_chat_profile ON match_chat(profile_id);
CREATE INDEX IF NOT EXISTS idx_match_chat_type ON match_chat(message_type);

-- RLS: Herkes kendi maçlarının sohbetini görsün + mesaj gönderebilsin
ALTER TABLE match_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY match_chat_select ON match_chat
  FOR SELECT USING (true);  -- Maç sohbeti herkese açık (aynı maçı izleyenler)

CREATE POLICY match_chat_insert ON match_chat
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY match_chat_delete ON match_chat
  FOR DELETE USING (profile_id = auth.uid()::text);

CREATE POLICY match_chat_service ON match_chat
  FOR ALL USING (true) WITH CHECK (true);


-- ─── 2. Realtime Etkinleştirme ───────────────────────────────────────
-- Supabase Realtime'ın çalışması için tablonun yayınlanması gerekir
-- Bu komut Supabase Dashboard'dan da yapılabilir
ALTER PUBLICATION supabase_realtime ADD TABLE match_chat;
