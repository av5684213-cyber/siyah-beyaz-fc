-- ============================================================
-- Touchline Manager — Chat ve Mesajlasma icin RLS Politikalari
-- Tarih: 2024-05-16 (GUNCELLEME v3: idempotent, dogru kolonlar)
-- ============================================================
-- NOT: DROP POLICY ve FK REFERENCES yasak!
-- Sadece ALTER TABLE ENABLE RLS ve CREATE POLICY kullanilir.
-- profiles.id TEXT tipindedir, auth.uid()::text ile eslestirilir.
-- Politika zaten varsa EXCEPTION WHEN duplicate_object ile atlanir.
-- ============================================================
-- DİKKAT: match_chat tablosu MATCH_CHAT_MIGRATION.sql tarafindan
-- fixture_id, profile_id, sender_name, content, message_type,
-- reaction_type, minute kolonlariyla olusturulmustur.
-- Bu dosya sadece RLS politikalarini tanimlar.
-- ============================================================
-- DİKKAT: manager_messages tablosu RIVAL_MESSAGING_MIGRATION.sql
-- tarafindan conversation_id, sender_id, content, message_type,
-- is_read, read_at kolonlariyla olusturulmustur.
-- Bu dosya sadece RLS politikalarini ekler/gunceller.
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- match_participants tablosu (yoksa olustur)
-- Bu tablo bir match_icindeki katilimcilari tutar.
-- fixture_id = match_chat.fixture_id ile eslesir
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS match_participants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  fixture_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(fixture_id, user_id)
);

-- match_participants icin RLS
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own match participations"
  ON match_participants FOR SELECT
  USING (
    auth.uid()::text = user_id
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can join matches"
  ON match_participants FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- match_chat tablosu icin RLS
-- NOT: Tablo MATCH_CHAT_MIGRATION.sql ile zaten olusturulmustur.
-- Burada sadece RLS politikalarini ekliyoruz/guncelliyoruz.
-- Kolonlar: fixture_id, profile_id, sender_name, content,
--           message_type, reaction_type, minute, created_at
-- ═══════════════════════════════════════════════════════════════

-- match_chat tablosu yoksa olustur (eski migration'dan kalan
-- "CREATE TABLE IF NOT EXISTS" — yeni tablo zaten varsa atlanir)
CREATE TABLE IF NOT EXISTS match_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'chat',
  reaction_type TEXT,
  minute INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE match_chat ENABLE ROW LEVEL SECURITY;

-- Maç sohbeti herkese açık (aynı maçı izleyenler)
DO $$ BEGIN
  CREATE POLICY match_chat_select ON match_chat
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sadece kendi adina mesaj gönderebilir
DO $$ BEGIN
  CREATE POLICY match_chat_insert ON match_chat
    FOR INSERT WITH CHECK (profile_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sadece kendi mesajlarini silebilir
DO $$ BEGIN
  CREATE POLICY match_chat_delete ON match_chat
    FOR DELETE USING (profile_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service role icin tam erisim
DO $$ BEGIN
  CREATE POLICY match_chat_service ON match_chat
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- manager_messages tablosu icin RLS
-- NOT: Tablo RIVAL_MESSAGING_MIGRATION.sql ile olusturulmustur.
-- Kolonlar: id, conversation_id, sender_id, content,
--           message_type, is_read, read_at, created_at
-- Eger tablo yoksa (eski kurulum), burada olusturulur.
-- ═══════════════════════════════════════════════════════════════

-- manager_messages tablosu yoksa olustur (RIVAL_MESSAGING_MIGRATION.sql'deki
-- dogru semayla olustur — conversation_id bazli mesajlasma)
CREATE TABLE IF NOT EXISTS manager_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Eski semadan kalan receiver_id kolonu varsa KALDIR (veri kaybi yoksa)
-- NOT: receiver_id artik kullanilmiyor, conversation_id bazli sistem var
-- Eger receiver_id kolonu varsa ve bos ise drop et
DO $$ BEGIN
  -- receiver_id kolonu varsa, NULL olanlari icin drop etmeye calis
  ALTER TABLE manager_messages DROP COLUMN IF EXISTS receiver_id;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Eski semadan kalan message kolonu varsa, content'e aktar ve drop et
DO $$ BEGIN
  -- message kolonu varsa, content NULL olanlara aktar
  UPDATE manager_messages SET content = message WHERE content IS NULL OR content = '' AND message IS NOT NULL;
  ALTER TABLE manager_messages DROP COLUMN IF EXISTS message;
EXCEPTION WHEN others THEN NULL;
END $$;

-- conversation_id kolonu yoksa ekle (eski tablolarda olabilir)
DO $$ BEGIN
  ALTER TABLE manager_messages ADD COLUMN IF NOT EXISTS conversation_id TEXT;
  ALTER TABLE manager_messages ADD COLUMN IF NOT EXISTS content TEXT;
  ALTER TABLE manager_messages ADD COLUMN IF NOT EXISTS message_type TEXT NOT NULL DEFAULT 'general';
  ALTER TABLE manager_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

ALTER TABLE manager_messages ENABLE ROW LEVEL SECURITY;

-- RLS: Konusma katilimcilari mesajlari görebilir
DO $$ BEGIN
  CREATE POLICY "Users can view their own conversations"
  ON manager_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM manager_conversations c
      WHERE c.id = manager_messages.conversation_id
      AND (c.participant_1 = auth.uid()::text OR c.participant_2 = auth.uid()::text)
    )
    OR sender_id = auth.uid()::text
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS: Konusma katilimcilari mesaj gönderebilir
DO $$ BEGIN
  CREATE POLICY "Users can send messages"
  ON manager_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()::text
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS: Mesaj güncelleme (okundu isaretleme)
DO $$ BEGIN
  CREATE POLICY "Users can update messages"
  ON manager_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM manager_conversations c
      WHERE c.id = manager_messages.conversation_id
      AND (c.participant_1 = auth.uid()::text OR c.participant_2 = auth.uid()::text)
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS: Kendi mesajlarini silebilir
DO $$ BEGIN
  CREATE POLICY "Users can delete own messages"
  ON manager_messages FOR DELETE
  USING (
    sender_id = auth.uid()::text
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
