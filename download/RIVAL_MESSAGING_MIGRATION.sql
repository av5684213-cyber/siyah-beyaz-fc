-- ============================================================
-- RIVAL MANAGER MESSAGING MIGRATION
-- Manager-to-manager conversations, messages, presence
-- ============================================================

-- DROP existing tables for clean re-run (CASCADE removes policies too)
DROP TABLE IF EXISTS manager_messages CASCADE;
DROP TABLE IF EXISTS manager_conversations CASCADE;
DROP TABLE IF EXISTS manager_presence CASCADE;

-- ============================================================
-- 1. MANAGER CONVERSATIONS
-- ============================================================
CREATE TABLE manager_conversations (
  id TEXT PRIMARY KEY,
  participant_1 TEXT NOT NULL,
  participant_2 TEXT NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_content TEXT DEFAULT '',
  last_message_sender TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

-- Index for quick lookup of a user's conversations
CREATE INDEX idx_conv_p1 ON manager_conversations(participant_1);
CREATE INDEX idx_conv_p2 ON manager_conversations(participant_2);

-- RLS
ALTER TABLE manager_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY conv_select ON manager_conversations
  FOR SELECT USING (
    participant_1 = auth.uid()::text OR participant_2 = auth.uid()::text
  );

CREATE POLICY conv_insert ON manager_conversations
  FOR INSERT WITH CHECK (
    participant_1 = auth.uid()::text OR participant_2 = auth.uid()::text
  );

CREATE POLICY conv_update ON manager_conversations
  FOR UPDATE USING (
    participant_1 = auth.uid()::text OR participant_2 = auth.uid()::text
  );

CREATE POLICY conv_delete ON manager_conversations
  FOR DELETE USING (
    participant_1 = auth.uid()::text OR participant_2 = auth.uid()::text
  );

-- ============================================================
-- 2. MANAGER MESSAGES
-- ============================================================
CREATE TABLE manager_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'general',
    -- 'general' | 'trash_talk' | 'transfer' | 'alliance' | 'friendly_invite' | 'season_greeting'
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for conversation message lookup
CREATE INDEX idx_msg_conv ON manager_messages(conversation_id);
CREATE INDEX idx_msg_sender ON manager_messages(sender_id);
CREATE INDEX idx_msg_unread ON manager_messages(conversation_id, is_read) WHERE is_read = FALSE;

-- RLS
ALTER TABLE manager_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY msg_select ON manager_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM manager_conversations c
      WHERE c.id = manager_messages.conversation_id
      AND (c.participant_1 = auth.uid()::text OR c.participant_2 = auth.uid()::text)
    )
  );

CREATE POLICY msg_insert ON manager_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM manager_conversations c
      WHERE c.id = manager_messages.conversation_id
      AND (c.participant_1 = auth.uid()::text OR c.participant_2 = auth.uid()::text)
    )
    AND sender_id = auth.uid()::text
  );

CREATE POLICY msg_update ON manager_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM manager_conversations c
      WHERE c.id = manager_messages.conversation_id
      AND (c.participant_1 = auth.uid()::text OR c.participant_2 = auth.uid()::text)
    )
  );

CREATE POLICY msg_delete ON manager_messages
  FOR DELETE USING (
    sender_id = auth.uid()::text
  );

-- ============================================================
-- 3. MANAGER PRESENCE (online status)
-- ============================================================
CREATE TABLE manager_presence (
  profile_id TEXT PRIMARY KEY,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  status_text TEXT DEFAULT ''
);

-- Index
CREATE INDEX idx_presence_online ON manager_presence(is_online) WHERE is_online = TRUE;

-- RLS
ALTER TABLE manager_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY presence_select ON manager_presence
  FOR SELECT USING (TRUE);

CREATE POLICY presence_insert ON manager_presence
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY presence_update ON manager_presence
  FOR UPDATE USING (profile_id = auth.uid()::text);

-- ============================================================
-- 4. REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE manager_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE manager_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE manager_presence;
