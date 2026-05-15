'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, MessageSquare, Zap, X } from 'lucide-react';
import type { MatchChatMessage, MatchMessageType } from '@/lib/fm/matchChatService';
import {
  loadMatchChat,
  sendMatchChatMessage,
  sendMatchReaction,
  subscribeToMatchChat,
  unsubscribeFromMatchChat,
  REACTION_EMOJIS,
} from '@/lib/fm/matchChatService';

// ─── Props ────────────────────────────────────────────────────────────

interface MatchChatPanelProps {
  fixtureId: string;
  profileId: string;
  teamName: string;
  currentMinute?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// ─── Message Type Styles ─────────────────────────────────────────────

const MESSAGE_STYLES: Record<MatchMessageType, {
  bg: string;
  border: string;
  textColor: string;
  prefix: string;
}> = {
  chat: {
    bg: 'bg-white/[0.02]',
    border: 'border-white/[0.06]',
    textColor: 'text-white/80',
    prefix: '',
  },
  reaction: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/15',
    textColor: 'text-amber-300',
    prefix: '',
  },
  event: {
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/15',
    textColor: 'text-emerald-300',
    prefix: '📣 ',
  },
  system: {
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/15',
    textColor: 'text-blue-300',
    prefix: 'ℹ️ ',
  },
};

// ─── Message Bubble ──────────────────────────────────────────────────

function MessageBubble({ msg, isOwn }: { msg: MatchChatMessage; isOwn: boolean }) {
  const style = MESSAGE_STYLES[msg.message_type] || MESSAGE_STYLES.chat;

  if (msg.message_type === 'reaction') {
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 py-1"
      >
        <span className="text-lg">{msg.content}</span>
        <span className="text-white/30 text-[10px]">{msg.sender_name}</span>
        {msg.minute && <span className="text-white/15 text-[9px]">{msg.minute}'</span>}
      </motion.div>
    );
  }

  if (msg.message_type === 'event') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-center py-1.5 px-3 rounded-lg ${style.bg} border ${style.border} ${style.textColor} text-xs font-medium`}
      >
        {style.prefix}{msg.content}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${style.bg} border ${style.border} rounded-xl p-2.5 ${isOwn ? 'ml-6' : 'mr-6'}`}
    >
      <div className="flex items-baseline gap-2">
        <span className={`text-[10px] font-bold ${isOwn ? 'text-red-400' : 'text-white/50'} uppercase tracking-tight`}>
          {msg.sender_name}
        </span>
        <span className="text-white/15 text-[8px]">
          {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <p className={`text-xs mt-0.5 ${style.textColor}`}>{msg.content}</p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function MatchChatPanel({
  fixtureId,
  profileId,
  teamName,
  currentMinute,
  isCollapsed = false,
  onToggleCollapse,
}: MatchChatPanelProps) {
  const [messages, setMessages] = useState<MatchChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showReactions, setShowReactions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof subscribeToMatchChat>>(null);

  // İlk yükleme
  useEffect(() => {
    if (!fixtureId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const loaded = await loadMatchChat(fixtureId, 50);
      if (!cancelled) {
        setMessages(loaded);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [fixtureId]);

  // Realtime abonelik
  useEffect(() => {
    if (!fixtureId || !profileId) return;

    const channel = subscribeToMatchChat(fixtureId, (msg) => {
      setMessages(prev => [...prev.slice(-49), msg]);
    });
    channelRef.current = channel;

    return () => {
      unsubscribeFromMatchChat(channelRef.current);
      channelRef.current = null;
    };
  }, [fixtureId, profileId]);

  // Otomatik scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mesaj gönderme
  const handleSend = useCallback(async () => {
    if (!newMessage.trim()) return;

    const content = newMessage.trim().slice(0, 200);
    setNewMessage('');

    await sendMatchChatMessage(fixtureId, profileId, teamName, content);
  }, [newMessage, fixtureId, profileId, teamName]);

  // Reaksiyon gönderme
  const handleReaction = useCallback(async (emoji: string) => {
    await sendMatchReaction(fixtureId, profileId, teamName, emoji, currentMinute);
    setShowReactions(false);
  }, [fixtureId, profileId, teamName, currentMinute]);

  // Chat sayacı
  const chatCount = messages.filter(m => m.message_type === 'chat').length;
  const reactionCount = messages.filter(m => m.message_type === 'reaction').length;

  // ─── Collapsed View ────────────────────────────────────────────
  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex items-center justify-between hover:bg-white/[0.04] transition-all"
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-amber-400" />
          <span className="text-white/60 text-xs font-medium">Maç Sohbeti</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/20 text-[10px]">{chatCount} mesaj</span>
          {messages.length > 0 && (
            <span className="text-lg">{messages[messages.length - 1]?.message_type === 'reaction' ? messages[messages.length - 1].content : '💬'}</span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="bg-[#0a0e14] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-white/70 text-xs font-bold uppercase tracking-wider">CANLI SOHBET</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/20 text-[9px]">{chatCount} mesaj • {reactionCount} reaksiyon</span>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="text-white/20 hover:text-white/60 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[400px]"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-6 h-6 border border-white/10 border-t-white/40 rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/15">
            <MessageSquare size={24} className="mb-2" />
            <p className="text-xs">Henüz mesaj yok</p>
            <p className="text-[10px] mt-1">İlk mesajı sen gönder!</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOwn={msg.profile_id === profileId}
            />
          ))
        )}
      </div>

      {/* Quick Reactions */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/[0.04]"
          >
            <div className="flex items-center justify-center gap-2 p-2">
              {REACTION_EMOJIS.map(r => (
                <button
                  key={r.emoji}
                  onClick={() => handleReaction(r.emoji)}
                  title={r.label}
                  className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-lg hover:bg-white/[0.08] hover:scale-110 transition-all active:scale-95"
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-3 bg-white/[0.01] border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          {/* Reaction Toggle */}
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
              showReactions
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                : 'bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white/60'
            }`}
          >
            <Zap size={16} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={newMessage}
            maxLength={200}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Mesaj yaz..."
            className="flex-1 bg-black/40 border border-white/[0.06] rounded-lg py-2 px-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/30"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="w-9 h-9 rounded-lg bg-amber-600 flex items-center justify-center hover:bg-amber-500 active:scale-95 transition-all disabled:opacity-30 disabled:hover:bg-amber-600 flex-shrink-0"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
