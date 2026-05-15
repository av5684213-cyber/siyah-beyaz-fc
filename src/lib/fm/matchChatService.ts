// ═══════════════════════════════════════════════════════════════════════
// Managerium — Match Chat Service (Adım 6)
// Maç sırasında gerçek zamanlı sohbet, reaksiyonlar, otomatik olaylar
// Supabase Realtime ile canlı mesajlaşma
// ═══════════════════════════════════════════════════════════════════════

import { getSupabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────

export type MatchMessageType = 'chat' | 'reaction' | 'event' | 'system';

export interface MatchChatMessage {
  id: string;
  fixture_id: string;
  profile_id: string;
  sender_name: string;
  content: string;
  message_type: MatchMessageType;
  reaction_type?: string;
  minute?: number;
  created_at: string;
}

export interface MatchEventPayload {
  fixtureId: string;
  profileId: string;
  senderName: string;
  eventType: 'goal' | 'yellow' | 'red' | 'injury' | 'halftime' | 'fulltime' | 'save' | 'substitution';
  minute: number;
  player?: string;
  team?: string;
}

// ─── Reaksiyon Tipleri ────────────────────────────────────────────────

export const REACTION_EMOJIS = [
  { emoji: '⚽', label: 'Gol!' },
  { emoji: '🔥', label: 'Ateşli' },
  { emoji: '😱', label: 'Şok' },
  { emoji: '👏', label: 'Alkış' },
  { emoji: '❤️', label: 'Sevgi' },
  { emoji: '😂', label: 'Komik' },
  { emoji: '😤', label: 'Sinirli' },
  { emoji: '🤦', label: 'Yuh' },
] as const;

// ─── Mesaj Gönderme ──────────────────────────────────────────────────

/**
 * Maç sohbetine mesaj gönderir.
 */
export async function sendMatchChatMessage(
  fixtureId: string,
  profileId: string,
  senderName: string,
  content: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    const trimmed = content.trim().slice(0, 200);
    if (!trimmed) return { success: false, error: 'Empty message' };

    const { error } = await supabase
      .from('match_chat')
      .insert({
        fixture_id: fixtureId,
        profile_id: profileId,
        sender_name: senderName,
        content: trimmed,
        message_type: 'chat',
      });

    if (error) {
      console.error('[sendMatchChatMessage] Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[sendMatchChatMessage] Exception:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Maç olayına reaksiyon gönderir (emoji).
 */
export async function sendMatchReaction(
  fixtureId: string,
  profileId: string,
  senderName: string,
  reaction: string,
  minute?: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    const { error } = await supabase
      .from('match_chat')
      .insert({
        fixture_id: fixtureId,
        profile_id: profileId,
        sender_name: senderName,
        content: reaction,
        message_type: 'reaction',
        reaction_type: reaction,
        minute: minute,
      });

    if (error) {
      console.error('[sendMatchReaction] Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Sistem olay mesajı gönderir (gol, kart, sakatlık vb.).
 * Bu mesajlar otomatik olarak match engine tarafından tetiklenir.
 */
export async function sendMatchEvent(
  event: MatchEventPayload,
): Promise<{ success: boolean }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false };

    const contentMap: Record<string, string> = {
      goal: `⚽ GOL! ${event.player || ''} (${event.minute}')`,
      yellow: `🟨 Sarı Kart ${event.player || ''} (${event.minute}')`,
      red: `🟥 Kırmızı Kart ${event.player || ''} (${event.minute}')`,
      injury: `🏥 Sakatlık ${event.player || ''} (${event.minute}')`,
      halftime: `⏱️ Devre Arası`,
      fulltime: `🏁 Maç Sonu`,
      save: `🧤 Kurtarış ${event.player || ''} (${event.minute}')`,
      substitution: `🔄 Değişiklik ${event.player || ''} (${event.minute}')`,
    };

    const { error } = await supabase
      .from('match_chat')
      .insert({
        fixture_id: event.fixtureId,
        profile_id: event.profileId,
        sender_name: event.senderName,
        content: contentMap[event.eventType] || event.eventType,
        message_type: 'event',
        minute: event.minute,
      });

    if (error) {
      console.error('[sendMatchEvent] Error:', error.message);
    }

    return { success: !error };
  } catch {
    return { success: false };
  }
}

// ─── Mesaj Yükleme ────────────────────────────────────────────────────

/**
 * Bir maçın sohbet geçmişini yükler.
 */
export async function loadMatchChat(
  fixtureId: string,
  limit: number = 50,
): Promise<MatchChatMessage[]> {
  try {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('match_chat')
      .select('*')
      .eq('fixture_id', fixtureId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error || !data) return [];

    return data.map(mapChatFromRow);
  } catch {
    return [];
  }
}

// ─── Realtime Abonelik ────────────────────────────────────────────────

/**
 * Bir maç sohbetine Supabase Realtime aboneliği oluşturur.
 * Yeni mesajlar geldiğinde callback çağrılır.
 */
export function subscribeToMatchChat(
  fixtureId: string,
  onMessage: (msg: MatchChatMessage) => void,
): RealtimeChannel | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channel = supabase
    .channel(`match_chat:${fixtureId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'match_chat',
        filter: `fixture_id=eq.${fixtureId}`,
      },
      (payload: any) => {
        const msg = mapChatFromRow(payload.new);
        onMessage(msg);
      },
    )
    .subscribe();

  return channel;
}

/**
 * Realtime aboneliğini iptal eder.
 */
export function unsubscribeFromMatchChat(channel: RealtimeChannel | null) {
  if (channel) {
    channel.unsubscribe();
  }
}

// ─── Yardımcı: Fixture ID Oluşturma ──────────────────────────────────

/**
 * Maç günü ve rakip bilgisinden fixture ID oluşturur.
 */
export function generateFixtureId(currentDay: number, opponentName?: string): string {
  const day = currentDay || 1;
  const week = Math.ceil(day / 7);
  const opp = opponentName?.replace(/\s+/g, '-').toLowerCase() || 'cpu';
  return `fixture-w${week}-${opp}`;
}

// ─── Row Mapping ─────────────────────────────────────────────────────

function mapChatFromRow(row: any): MatchChatMessage {
  return {
    id: row.id,
    fixture_id: row.fixture_id,
    profile_id: row.profile_id,
    sender_name: row.sender_name,
    content: row.content,
    message_type: row.message_type as MatchMessageType || 'chat',
    reaction_type: row.reaction_type,
    minute: row.minute,
    created_at: row.created_at,
  };
}
