'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, MessageSquare, Check, X, Handshake, Phone, ChevronRight, Briefcase } from 'lucide-react';
import type { AgentMessageType, PlayerResponse } from '@/lib/fm/agentMessageEngine';

// ─── Types ────────────────────────────────────────────────────────────

interface AgentMessageRow {
  id: string;
  profile_id: string;
  player_id: string;
  message_type: AgentMessageType;
  message_text: string;
  player_response: PlayerResponse | null;
  is_read: boolean;
  created_at: string;
  players?: { name: string } | null;
}

interface AgentMessagesProps {
  userId: string;
  onUpdate?: () => void;
}

// ─── Config ───────────────────────────────────────────────────────────

const MSG_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string; label: string }> = {
  playing_time: {
    icon: <User size={14} />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    label: 'Süre Talebi',
  },
  contract: {
    icon: <MessageSquare size={14} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    label: 'Sözleşme',
  },
  transfer_interest: {
    icon: <Briefcase size={14} />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    label: 'Transfer',
  },
  relegation: {
    icon: <X size={14} />,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    label: 'Küme Düşme',
  },
  morale: {
    icon: <User size={14} />,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    label: 'Moral',
  },
};

const RESPONSE_OPTIONS: { key: PlayerResponse; label: string; icon: React.ReactNode; desc: string; colorClass: string }[] = [
  {
    key: 'promise',
    label: 'Söz Ver',
    icon: <Handshake size={12} />,
    desc: '+5 moral, +2 sadakat',
    colorClass: 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30',
  },
  {
    key: 'list_for_sale',
    label: 'Satışa Çıkar',
    icon: <Briefcase size={12} />,
    desc: '-10 moral, -5 sadakat',
    colorClass: 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border-red-500/30',
  },
  {
    key: 'ignore',
    label: 'Yok Say',
    icon: <X size={12} />,
    desc: '-3 moral, -1 sadakat',
    colorClass: 'bg-zinc-500/15 hover:bg-zinc-500/25 text-zinc-400 border-zinc-500/30',
  },
  {
    key: 'call_meeting',
    label: 'Görüşmeye Çağır',
    icon: <Phone size={12} />,
    desc: '+2 moral, +1 sadakat',
    colorClass: 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border-blue-500/30',
  },
];

const RESPONSE_LABELS: Record<PlayerResponse, string> = {
  promise: '🤝 Söz Verildi',
  list_for_sale: '💰 Satışa Çıkarıldı',
  ignore: '🚫 Yok Sayıldı',
  call_meeting: '📞 Görüşme Ayarlandı',
};

// ─── Component ────────────────────────────────────────────────────────

export default function AgentMessages({ userId, onUpdate }: AgentMessagesProps) {
  const [messages, setMessages] = useState<AgentMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data } = await supabase
        .from('agent_messages')
        .select('*, players(name)')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setMessages(data as AgentMessageRow[]);
      }
    } catch (err) {
      console.error('[AgentMessages] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel('agent_messages_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_messages',
        filter: `profile_id=eq.${userId}`,
      }, (payload) => {
        const newMsg = payload.new as AgentMessageRow;
        setMessages(prev => [newMsg, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // Mark as read
  const markRead = async (msgId: string) => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    await supabase.from('agent_messages').update({ is_read: true }).eq('id', msgId);
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_read: true } : m));
  };

  // Handle response
  const handleResponse = async (msgId: string, response: PlayerResponse) => {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setResponding(msgId);
    try {
      // Update the message with the response
      const { error: msgError } = await supabase
        .from('agent_messages')
        .update({ player_response: response, is_read: true })
        .eq('id', msgId);

      if (msgError) throw msgError;

      // Call the API to process the response effects
      const msg = messages.find(m => m.id === msgId);
      if (msg?.player_id) {
        try {
          await fetch('/api/agent-messages/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messageId: msgId,
              playerId: msg.player_id,
              response,
              profileId: userId,
            }),
          });
        } catch (apiErr) {
          console.error('[AgentMessages] API error:', apiErr);
        }
      }

      // Update local state
      setMessages(prev =>
        prev.map(m => m.id === msgId ? { ...m, player_response: response, is_read: true } : m)
      );
      setExpandedId(null);
      onUpdate?.();
    } catch (err) {
      console.error('[AgentMessages] Response error:', err);
    } finally {
      setResponding(null);
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 text-white/20 text-xs animate-pulse">
        <MessageSquare size={14} />
        <span>Ajan mesajları yükleniyor...</span>
      </div>
    );
  }

  if (messages.length === 0) return null;

  const unresolvedMessages = messages.filter(m => !m.player_response);

  return (
    <Card className="bg-zinc-900 border border-white/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <MessageSquare size={14} className="text-amber-400" />
            </div>
            <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-white/30">
              Ajan Mesajları
            </CardTitle>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black px-2 py-0.5">
              {unreadCount} yeni
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="max-h-96">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, idx) => {
                const config = MSG_TYPE_CONFIG[msg.message_type] || MSG_TYPE_CONFIG.playing_time;
                const playerName = msg.players?.name || 'Bilinmeyen Oyuncu';
                const isExpanded = expandedId === msg.id;
                const isResolved = !!msg.player_response;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05, duration: 0.25 }}
                    layout
                    className={`rounded-xl border transition-all ${
                      !msg.is_read
                        ? `${config.bg} ${config.border}`
                        : 'bg-white/[0.02] border-white/5'
                    } ${isResolved ? 'opacity-50' : ''}`}
                  >
                    {/* Header row */}
                    <button
                      className="w-full p-3 flex items-center gap-3 text-left"
                      onClick={() => {
                        if (!msg.is_read) markRead(msg.id);
                        setExpandedId(isExpanded ? null : msg.id);
                      }}
                    >
                      <div className={`shrink-0 p-1.5 rounded-lg ${config.bg} ${config.border} border`}>
                        <span className={config.color}>{config.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${!msg.is_read ? 'text-white/90' : 'text-white/60'} truncate`}>
                            {playerName}
                          </span>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className={`text-[10px] truncate ${!msg.is_read ? 'text-white/50' : 'text-white/30'}`}>
                          {msg.message_text.substring(0, 60)}...
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {!msg.is_read && (
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                        <ChevronRight
                          size={14}
                          className={`text-white/20 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 space-y-3">
                            {/* Full message text */}
                            <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                              <p className="text-xs text-white/70 leading-relaxed">
                                {msg.message_text}
                              </p>
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                                <span className="text-[9px] text-white/25">
                                  {new Date(msg.created_at).toLocaleString('tr-TR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Response buttons or response status */}
                            {isResolved ? (
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                <Check size={12} className="text-emerald-400" />
                                <span className="text-[10px] text-white/40 font-medium">
                                  {RESPONSE_LABELS[msg.player_response!]}
                                </span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-1.5">
                                {RESPONSE_OPTIONS.map(opt => (
                                  <button
                                    key={opt.key}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleResponse(msg.id, opt.key);
                                    }}
                                    disabled={responding === msg.id}
                                    className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all disabled:opacity-50 ${opt.colorClass}`}
                                  >
                                    {opt.icon}
                                    <div className="min-w-0">
                                      <div className="text-[10px] font-bold truncate">{opt.label}</div>
                                      <div className="text-[8px] opacity-60">{opt.desc}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
