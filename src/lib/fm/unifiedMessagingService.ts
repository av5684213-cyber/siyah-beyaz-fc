/**
 * Unified Messaging Service
 * Tek bir Supabase Realtime bağlantısı üzerinden hem özel mesajları (direct)
 * hem de maç odalarını (match chat) yönetir.
 *
 * Kanal adları:
 *   - direct:${sortedId1}-${sortedId2}  → Özel mesajlar
 *   - match:${matchId}                  → Maç sohbeti
 *
 * Supabase JS client, tüm kanalları tek bir WebSocket üzerinden çoklayarak
 * (multiplex) gönderir; bu servis katmanı abonelikleri merkezi olarak yönetir.
 */

import { getSupabase } from '@/lib/supabase';
import { sanitizeInput, isValidMessageType, sanitizeLikePattern } from '@/lib/fm/security';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════════
// TYPES — Direct (Rival) Messaging
// ═══════════════════════════════════════════════════════════════════════

export type MessageCategory = 'general' | 'trash_talk' | 'transfer' | 'alliance' | 'friendly_invite' | 'season_greeting';

export interface ManagerConversation {
  id: string;
  participant1: string;
  participant2: string;
  lastMessageAt: string;
  lastMessageContent: string;
  lastMessageSender: string;
  createdAt: string;
  otherManagerName?: string;
  otherManagerTeam?: string;
  unreadCount?: number;
}

export interface ManagerMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageCategory;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  senderName?: string;
  senderTeamName?: string;
}

export interface ManagerPresence {
  profileId: string;
  isOnline: boolean;
  lastSeen: string;
  statusText: string;
}

// ═══════════════════════════════════════════════════════════════════════
// TYPES — Match Chat
// ═══════════════════════════════════════════════════════════════════════

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
  eventType: 'goal' | 'yellow' | 'red' | 'injury' | 'halftime' | 'fulltime' | 'save' | 'substitution' | 'penalty_goal' | 'free_kick_goal' | 'second_yellow' | 'motm';
  minute: number;
  player?: string;
  team?: string;
  assistPlayer?: string;
  reason?: string;
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

export const MESSAGE_CATEGORIES: Record<MessageCategory, { label: string; emoji: string; color: string }> = {
  general:         { label: 'Genel',          emoji: '💬', color: '#6b7280' },
  trash_talk:      { label: 'Ses Savaşı',     emoji: '🔥', color: '#ef4444' },
  transfer:        { label: 'Transfer',       emoji: '💰', color: '#f59e0b' },
  alliance:        { label: 'İttifak',        emoji: '🤝', color: '#10b981' },
  friendly_invite: { label: 'Hazırlık Maçı',  emoji: '⚽', color: '#3b82f6' },
  season_greeting: { label: 'Sezon Tebriği',  emoji: '🎉', color: '#8b5cf6' },
};

export const QUICK_REPLIES: Record<MessageCategory, string[]> = {
  general: [
    'Nasılsın? Maça hazır mısın?',
    'Takımın bu sezon iyi görünüyor!',
    'Bir sonraki maçımıza kadar şanslı kal!',
  ],
  trash_talk: [
    'Sahada görüşürüz! Hazır ol!',
    'Takımın bizim karşımızda şanssız!',
    'Bu hafta yenileceksiniz, bilesin!',
    'Kupayı biz alacağız!',
  ],
  transfer: [
    'Oyuncun satılık mı?',
    'Transfer teklifim var, ilgilenir misin?',
    'Takas teklifi: 2 oyuncu against 1?',
  ],
  alliance: [
    'İttifak teklif ediyorum!',
    'Birlikte güçlü oluruz!',
    'Ligde birlikte hareket edelim mi?',
  ],
  friendly_invite: [
    'Hazırlık maçı ister misin?',
    'Bugün maç yapalım mı?',
    'Antrenman maçı teklif ediyorum!',
  ],
  season_greeting: [
    'Yeni sezonun kutlu olsun!',
    'Başarılar dilerim!',
    'Bu sezon şampiyon sen ol!',
  ],
};

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

// ═══════════════════════════════════════════════════════════════════════
// CHANNEL REGISTRY — aktif abonelikleri merkezi olarak takip eder
// ═══════════════════════════════════════════════════════════════════════

const activeChannels = new Map<string, RealtimeChannel>();

function getOrCreateChannel(channelName: string): RealtimeChannel {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase yapılandırılmamış');

  const existing = activeChannels.get(channelName);
  if (existing) return existing;

  const channel = supabase.channel(channelName);
  activeChannels.set(channelName, channel);
  return channel;
}

function removeChannel(channelName: string): void {
  const channel = activeChannels.get(channelName);
  if (channel) {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  }
}

/** Tüm aktif abonelikleri temizle (logout gibi durumlar için) */
export function unsubscribeAll(): void {
  for (const [, channel] of activeChannels) {
    channel.unsubscribe();
  }
  activeChannels.clear();
}

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateConversationId(p1: string, p2: string): string {
  const sorted = [p1, p2].sort();
  return `conv-${sorted[0]}-${sorted[1]}`.replace(/[^a-zA-Z0-9-]/g, '_');
}

function mapConversationFromRow(row: any): ManagerConversation {
  return {
    id: row.id,
    participant1: row.participant_1,
    participant2: row.participant_2,
    lastMessageAt: row.last_message_at || '',
    lastMessageContent: row.last_message_content || '',
    lastMessageSender: row.last_message_sender || '',
    createdAt: row.created_at || '',
  };
}

function mapMessageFromRow(row: any): ManagerMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content || '',
    messageType: row.message_type || 'general',
    isRead: row.is_read ?? false,
    readAt: row.read_at || null,
    createdAt: row.created_at || '',
    senderName: row.profiles?.manager_name || row.sender_name || '',
    senderTeamName: row.profiles?.team_name || row.sender_team_name || '',
  };
}

function mapPresenceFromRow(row: any): ManagerPresence {
  return {
    profileId: row.profile_id,
    isOnline: row.is_online ?? false,
    lastSeen: row.last_seen || '',
    statusText: row.status_text || '',
  };
}

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

// ═══════════════════════════════════════════════════════════════════════
// DIRECT (RIVAL) MESSAGING — Conversation Operations
// ═══════════════════════════════════════════════════════════════════════

export async function getOrCreateConversation(
  myId: string,
  otherId: string,
  _otherName?: string,
): Promise<{ conversation?: ManagerConversation; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase yapılandırılmamış' };
    const convId = generateConversationId(myId, otherId);

    const { data: existing, error: fetchErr } = await supabase
      .from('manager_conversations')
      .select('*')
      .eq('id', convId)
      .maybeSingle();

    if (fetchErr) {
      console.error('getOrCreateConversation fetch error:', fetchErr);
      return { error: fetchErr.message };
    }

    if (existing) {
      return { conversation: mapConversationFromRow(existing) };
    }

    const sorted = [myId, otherId].sort();
    const { data: created, error: insertErr } = await supabase
      .from('manager_conversations')
      .insert({
        id: convId,
        participant_1: sorted[0],
        participant_2: sorted[1],
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) {
      console.error('getOrCreateConversation insert error:', insertErr);
      return { error: insertErr.message };
    }

    return { conversation: mapConversationFromRow(created) };
  } catch (err: any) {
    return { error: err.message || 'Bilinmeyen hata' };
  }
}

export async function getMyConversations(
  myId: string,
): Promise<{ conversations?: (ManagerConversation & { otherManagerName?: string; otherManagerTeam?: string; unreadCount?: number })[]; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase yapılandırılmamış' };

    const { data, error } = await supabase
      .from('manager_conversations')
      .select(`
        *,
        p1:profiles!manager_conversations_participant_1_fkey(manager_name, team_name),
        p2:profiles!manager_conversations_participant_2_fkey(manager_name, team_name)
      `)
      .or(`participant_1.eq.${myId},participant_2.eq.${myId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('getMyConversations error:', error);
      return { error: error.message };
    }

    if (!data) return { conversations: [] };

    const convIds = data.map((c: any) => c.id);
    const { data: unreadData } = await supabase
      .from('manager_messages')
      .select('conversation_id')
      .in('conversation_id', convIds)
      .eq('is_read', false)
      .neq('sender_id', myId);

    const unreadMap = new Map<string, number>();
    (unreadData || []).forEach((r: any) => {
      unreadMap.set(r.conversation_id, (unreadMap.get(r.conversation_id) || 0) + 1);
    });

    const conversations = data.map((row: any) => {
      const conv = mapConversationFromRow(row);
      const isP1 = conv.participant1 === myId;
      const otherProfile = isP1 ? row.p2 : row.p1;
      return {
        ...conv,
        otherManagerName: otherProfile?.manager_name || 'Bilinmeyen',
        otherManagerTeam: otherProfile?.team_name || '',
        unreadCount: unreadMap.get(conv.id) || 0,
      };
    });

    return { conversations };
  } catch (err: any) {
    return { error: err.message || 'Bilinmeyen hata' };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// DIRECT (RIVAL) MESSAGING — Message Operations
// ═══════════════════════════════════════════════════════════════════════

export async function sendDirectMessage(
  conversationId: string,
  senderId: string,
  content: string,
  messageType: MessageCategory = 'general',
): Promise<{ message?: ManagerMessage; error?: string }> {
  try {
    if (!content.trim()) return { error: 'Mesaj boş olamaz' };

    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase yapılandırılmamış' };

    const trimmed = sanitizeInput(content, 500);
    if (!trimmed) return { error: 'Mesaj boş olamaz' };

    if (!isValidMessageType(messageType)) {
      return { error: 'Geçersiz mesaj türü' };
    }

    const msgId = generateId();

    const { data, error } = await supabase
      .from('manager_messages')
      .insert({
        id: msgId,
        conversation_id: conversationId,
        sender_id: senderId,
        content: trimmed,
        message_type: messageType,
        is_read: false,
      })
      .select(`
        *,
        profiles:sender_id(manager_name, team_name)
      `)
      .single();

    if (error) {
      console.error('sendDirectMessage error:', error);
      return { error: error.message };
    }

    // Update conversation's last message
    await supabase
      .from('manager_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_content: trimmed,
        last_message_sender: senderId,
      })
      .eq('id', conversationId);

    return { message: mapMessageFromRow(data) };
  } catch (err: any) {
    return { error: err.message || 'Bilinmeyen hata' };
  }
}

export async function getConversationMessages(
  conversationId: string,
  myId: string,
  limit = 50,
  beforeTimestamp?: string,
): Promise<{ messages?: ManagerMessage[]; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase yapılandırılmamış' };

    let query = supabase
      .from('manager_messages')
      .select(`
        *,
        profiles:sender_id(manager_name, team_name)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (beforeTimestamp) {
      query = query.lt('created_at', beforeTimestamp);
    }

    const { data, error } = await query;

    if (error) {
      console.error('getConversationMessages error:', error);
      return { error: error.message };
    }

    const messages = (data || []).map(mapMessageFromRow);
    await markMessagesAsRead(conversationId, myId);

    return { messages };
  } catch (err: any) {
    return { error: err.message || 'Bilinmeyen hata' };
  }
}

export async function markMessagesAsRead(
  conversationId: string,
  myId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase yapılandırılmamış' };

    const now = new Date().toISOString();

    const { error } = await supabase
      .from('manager_messages')
      .update({ is_read: true, read_at: now })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', myId);

    if (error) {
      console.error('markMessagesAsRead error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getTotalUnreadCount(
  myId: string,
): Promise<{ count: number; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { count: 0 };

    const { data: convs } = await supabase
      .from('manager_conversations')
      .select('id')
      .or(`participant_1.eq.${myId},participant_2.eq.${myId}`);

    if (!convs || convs.length === 0) return { count: 0 };

    const convIds = convs.map((c: any) => c.id);

    const { count, error } = await supabase
      .from('manager_messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .eq('is_read', false)
      .neq('sender_id', myId);

    if (error) {
      console.error('getTotalUnreadCount error:', error);
      return { count: 0, error: error.message };
    }

    return { count: count || 0 };
  } catch (err: any) {
    return { count: 0, error: err.message };
  }
}

export async function deleteMessage(
  messageId: string,
  senderId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase yapılandırılmamış' };

    const { error } = await supabase
      .from('manager_messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', senderId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PRESENCE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════

export async function updateMyPresence(
  myId: string,
  isOnline: boolean,
  statusText = '',
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase yapılandırılmamış' };

    const { error } = await supabase
      .from('manager_presence')
      .upsert({
        profile_id: myId,
        is_online: isOnline,
        last_seen: new Date().toISOString(),
        status_text: statusText,
      }, { onConflict: 'profile_id' });

    if (error) {
      console.error('updateMyPresence error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getManagerPresence(
  profileId: string,
): Promise<{ presence?: ManagerPresence; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase yapılandırılmamış' };

    const { data, error } = await supabase
      .from('manager_presence')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { presence: { profileId, isOnline: false, lastSeen: '', statusText: '' } };
    }

    return { presence: mapPresenceFromRow(data) };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getMultiplePresence(
  profileIds: string[],
): Promise<{ presences?: ManagerPresence[]; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase yapılandırılmamış' };

    const { data, error } = await supabase
      .from('manager_presence')
      .select('*')
      .in('profile_id', profileIds);

    if (error) {
      return { error: error.message };
    }

    const presences = (data || []).map(mapPresenceFromRow);
    return { presences };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SEARCH RIVAL MANAGERS
// ═══════════════════════════════════════════════════════════════════════

export async function searchRivalManagers(
  myId: string,
  query: string,
  limit = 10,
): Promise<{ managers?: { id: string; managerName: string; teamName: string; isOnline?: boolean }[]; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase yapılandırılmamış' };

    const safeQuery = sanitizeLikePattern(query);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, manager_name, team_name')
      .neq('id', myId)
      .ilike('team_name', `%${safeQuery}%`)
      .limit(limit);

    if (error) {
      return { error: error.message };
    }

    if (!data || data.length === 0) {
      return { managers: [] };
    }

    const ids = data.map((d: any) => d.id);
    const { presences } = await getMultiplePresence(ids);
    const presenceMap = new Map((presences || []).map(p => [p.profileId, p.isOnline]));

    const managers = data.map((d: any) => ({
      id: d.id,
      managerName: d.manager_name || 'Bilinmeyen',
      teamName: d.team_name || '',
      isOnline: presenceMap.get(d.id) || false,
    }));

    return { managers };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// REALTIME SUBSCRIPTIONS — Direct Messages
// ═══════════════════════════════════════════════════════════════════════

/**
 * Kullanıcının tüm konuşmalarındaki yeni mesajları dinler.
 * Kanal: direct:${myId}
 */
export function subscribeToDirectMessages(
  myId: string,
  onNewMessage: (msg: ManagerMessage) => void,
  onConversationUpdate?: (conv: ManagerConversation) => void,
): RealtimeChannel | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channelName = `direct:${myId}`;
  const channel = getOrCreateChannel(channelName);

  // Listen for new messages in any of user's conversations
  channel.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'manager_messages',
    },
    (payload) => {
      const msg = mapMessageFromRow(payload.new);
      onNewMessage(msg);
    },
  );

  // Listen for conversation updates (last message, etc.)
  if (onConversationUpdate) {
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'manager_conversations',
      },
      (payload) => {
        const conv = mapConversationFromRow(payload.new);
        if (conv.participant1 === myId || conv.participant2 === myId) {
          onConversationUpdate(conv);
        }
      },
    );
  }

  channel.subscribe();
  return channel;
}

/**
 * Belirli bir konuşmanın mesajlarını dinler.
 * Kanal: direct-conv:${conversationId}
 */
export function subscribeToConversationMessages(
  conversationId: string,
  onMessage: (msg: ManagerMessage) => void,
): RealtimeChannel | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channelName = `direct-conv:${conversationId}`;
  const channel = getOrCreateChannel(channelName);

  channel.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'manager_messages',
      filter: `conversation_id=eq.${conversationId}`,
    },
    (payload) => {
      const msg = mapMessageFromRow(payload.new);
      onMessage(msg);
    },
  );

  channel.subscribe();
  return channel;
}

/**
 * Çevrimiçi durumu dinler.
 * Kanal: presence:global
 */
export function subscribeToPresence(
  profileIds: string[],
  onPresenceChange: (presence: ManagerPresence) => void,
): RealtimeChannel | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channelName = 'presence:global';
  const channel = getOrCreateChannel(channelName);

  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'manager_presence',
    },
    (payload) => {
      const p = mapPresenceFromRow(payload.new);
      if (profileIds.includes(p.profileId)) {
        onPresenceChange(p);
      }
    },
  );

  channel.subscribe();
  return channel;
}

/** Kanal aboneliğini iptal eder */
export function unsubscribeFromChannel(channel: RealtimeChannel | null): void {
  if (channel) {
    channel.unsubscribe();
    // Registry'den de kaldır
    for (const [name, ch] of activeChannels) {
      if (ch === channel) {
        activeChannels.delete(name);
        break;
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// MATCH CHAT — Message Operations
// ═══════════════════════════════════════════════════════════════════════

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

    const trimmed = sanitizeInput(content, 200);
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
      goal: `⚽ GOL! ${event.player || ''} (${event.minute}')${event.assistPlayer ? ` | Asist: ${event.assistPlayer}` : ''}`,
      penalty_goal: `⚽ PENALTI GOLU! ${event.player || ''} (${event.minute}')`,
      free_kick_goal: `⚽ SERBEST VURUŞ GOLU! ${event.player || ''} (${event.minute}')`,
      yellow: `🟨 Sarı Kart ${event.player || ''} (${event.minute}')${event.reason ? ` - ${event.reason}` : ''}`,
      red: `🟥 Kırmızı Kart ${event.player || ''} (${event.minute}')${event.reason ? ` - ${event.reason}` : ''}`,
      second_yellow: `🟥 2. Sarı→Kırmızı ${event.player || ''} (${event.minute}')`,
      injury: `🏥 Sakatlık ${event.player || ''} (${event.minute}')`,
      halftime: `⏱️ Devre Arası`,
      fulltime: `🏁 Maç Sonu`,
      save: `🧤 Kurtarış ${event.player || ''} (${event.minute}')`,
      substitution: `🔄 Değişiklik ${event.player || ''} (${event.minute}')`,
      motm: `🏅 Maçın Adamı: ${event.player || ''}`,
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

// ═══════════════════════════════════════════════════════════════════════
// REALTIME SUBSCRIPTIONS — Match Chat
// ═══════════════════════════════════════════════════════════════════════

/**
 * Bir maç sohbetine Supabase Realtime aboneliği oluşturur.
 * Kanal: match:${matchId}
 */
export function subscribeToMatchChat(
  fixtureId: string,
  onMessage: (msg: MatchChatMessage) => void,
): RealtimeChannel | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channelName = `match:${fixtureId}`;
  const channel = getOrCreateChannel(channelName);

  channel.on(
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
  );

  channel.subscribe();
  return channel;
}

/**
 * Maç sohbeti aboneliğini iptal eder.
 */
export function unsubscribeFromMatchChat(channel: RealtimeChannel | null): void {
  if (channel) {
    channel.unsubscribe();
    for (const [name, ch] of activeChannels) {
      if (ch === channel) {
        activeChannels.delete(name);
        break;
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// FIXTURE ID HELPER
// ═══════════════════════════════════════════════════════════════════════

/**
 * Maç günü ve rakip bilgisinden fixture ID oluşturur.
 */
export function generateFixtureId(currentDay: number, opponentName?: string): string {
  const day = currentDay || 1;
  const week = Math.ceil(day / 7);
  const opp = opponentName?.replace(/\s+/g, '-').toLowerCase() || 'cpu';
  return `fixture-w${week}-${opp}`;
}
