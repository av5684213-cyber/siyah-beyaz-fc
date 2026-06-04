'use client';

import { useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface AgentMessage {
  id: string;
  player_id: string;
  message_type: string;
  subject: string;
  body: string;
  is_read: boolean;
  manager_response: string | null;
  created_at: string;
  player_name?: string;
}

interface AgentInboxPanelProps {
  userId: string;
}

const MSG_ICONS: Record<string, string> = {
  contract_warning: '📝',
  offer_received: '💰',
  low_playtime: '⏱️',
  unhappy: '😤',
  transfer_request: '🔄',
  general: '📢',
};

export default function AgentInboxPanel({ userId }: AgentInboxPanelProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<AgentMessage | null>(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const fetchMessages = async () => {
      try {
        const { data } = await supabase
          .from('agent_messages')
          .select('*, players(name)')
          .eq('profile_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (data) {
          setMessages(data.map((m: any) => ({ ...m, player_name: m.players?.name })));
        }
      } catch (err) {
        console.error('Agent messages fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Realtime
    const channel = supabase
      .channel('agent_messages_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_messages',
        filter: `profile_id=eq.${userId}`,
      }, (payload) => {
        setMessages(prev => [payload.new as AgentMessage, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const markRead = async (msgId: string) => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    await supabase.from('agent_messages').update({ is_read: true }).eq('id', msgId);
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_read: true } : m));
  };

  const handleRespond = async () => {
    if (!selectedMsg || !response || !isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    await supabase.from('agent_messages').update({ manager_response: response }).eq('id', selectedMsg.id);
    setMessages(prev => prev.map(m => m.id === selectedMsg.id ? { ...m, manager_response: response } : m));
    setSelectedMsg(null);
    setResponse('');
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) return <div className="text-white/30 text-xs animate-pulse">Ajan mesajları...</div>;
  if (messages.length === 0) return null;

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">
          🤵 Ajan Mesajları
          {unreadCount > 0 && <span className="ml-2 text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>}
        </h3>
      </div>

      {selectedMsg ? (
        <div className="space-y-3">
          <button onClick={() => setSelectedMsg(null)} className="text-xs text-white/40 hover:text-white/60">← Geri</button>
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <span>{MSG_ICONS[selectedMsg.message_type] || '📢'}</span>
              <span className="text-xs font-bold text-white">{selectedMsg.subject}</span>
            </div>
            <div className="text-xs text-white/60 mb-2">{selectedMsg.body}</div>
            <div className="text-[10px] text-white/30">{selectedMsg.player_name} • {new Date(selectedMsg.created_at).toLocaleString('tr-TR')}</div>
          </div>

          {selectedMsg.manager_response ? (
            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
              <div className="text-[10px] text-blue-300 font-bold mb-1">Yanıtınız:</div>
              <div className="text-xs text-white/60">{selectedMsg.manager_response}</div>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Yanıtınızı yazın..."
                className="w-full text-xs p-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 resize-none h-16"
              />
              <button
                onClick={handleRespond}
                disabled={!response}
                className="w-full text-xs py-2 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white font-medium disabled:opacity-50"
              >
                Yanıtla
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {messages.slice(0, 5).map(msg => (
            <div
              key={msg.id}
              className={`rounded-lg p-2 border cursor-pointer transition-all ${
                !msg.is_read ? 'bg-white/5 border-amber-500/20' : 'bg-white/[0.02] border-white/5 opacity-60'
              }`}
              onClick={() => { markRead(msg.id); setSelectedMsg(msg); }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{MSG_ICONS[msg.message_type] || '📢'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/80 truncate">{msg.subject}</div>
                  <div className="text-[10px] text-white/30">{msg.player_name} • {new Date(msg.created_at).toLocaleDateString('tr-TR')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
