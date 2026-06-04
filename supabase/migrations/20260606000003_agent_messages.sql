-- ═══════════════════════════════════════════════════════════════════════
-- TASARIM-1: Player Personalities & Agent Messages System
-- Creates agent_messages table and adds personality JSONB to players
-- ═══════════════════════════════════════════════════════════════════════

-- Agent messages table
CREATE TABLE IF NOT EXISTS public.agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_id TEXT REFERENCES public.players(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL, -- 'playing_time', 'contract', 'transfer_interest', 'relegation', 'morale'
  message_text TEXT NOT NULL,
  player_response TEXT, -- 'promise', 'list_for_sale', 'ignore', 'call_meeting'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_msgs_read_all" ON public.agent_messages FOR SELECT USING (true);
CREATE POLICY "agent_msgs_insert_rpc" ON public.agent_messages FOR INSERT WITH CHECK (false);
CREATE POLICY "agent_msgs_update_rpc" ON public.agent_messages FOR UPDATE USING (true) WITH CHECK (false);

-- Add personality JSONB column to players if not exists
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS personality JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_agent_messages_profile ON public.agent_messages(profile_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_unread ON public.agent_messages(profile_id, is_read) WHERE is_read = false;
