-- ============================================================
-- Siyah Beyaz FC — Chat ve Mesajlasma icin RLS Politikalari
-- Tarih: 2024-05-16
-- ============================================================
-- NOT: DROP POLICY ve FK REFERENCES yasak!
-- Sadece ALTER TABLE ENABLE RLS ve CREATE POLICY kullanilir.
-- profiles.id TEXT tipindedir, auth.uid()::text ile eslestirilir.
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- match_participants tablosu (yoksa olustur)
-- Bu tablo bir match_icindeki katilimcilari tutar.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS match_participants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  match_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id, user_id)
);

-- match_participants icin RLS
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own match participations"
ON match_participants FOR SELECT
USING (
  auth.uid()::text = user_id
);

CREATE POLICY "Users can join matches"
ON match_participants FOR INSERT
WITH CHECK (
  auth.uid()::text = user_id
);

-- ═══════════════════════════════════════════════════════════════
-- match_chat tablosu icin RLS
-- ═══════════════════════════════════════════════════════════════

-- match_chat tablosu yoksa olustur (gercek tablo mevcut ise bu adim atlanir)
CREATE TABLE IF NOT EXISTS match_chat (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  match_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE match_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of their own matches"
ON match_chat FOR SELECT
USING (
  auth.uid()::text IN (
    SELECT mp.user_id FROM match_participants mp
    WHERE mp.match_id = match_chat.match_id
  )
);

CREATE POLICY "Users can insert messages to their own matches"
ON match_chat FOR INSERT
WITH CHECK (
  auth.uid()::text IN (
    SELECT mp.user_id FROM match_participants mp
    WHERE mp.match_id = match_chat.match_id
  )
);

-- ═══════════════════════════════════════════════════════════════
-- manager_messages tablosu icin RLS
-- ═══════════════════════════════════════════════════════════════

-- manager_messages tablosu yoksa olustur (gercek tablo mevcut ise bu adim atlanir)
CREATE TABLE IF NOT EXISTS manager_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE manager_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
ON manager_messages FOR SELECT
USING (
  auth.uid()::text = sender_id OR auth.uid()::text = receiver_id
);

CREATE POLICY "Users can send messages"
ON manager_messages FOR INSERT
WITH CHECK (
  auth.uid()::text = sender_id
);
