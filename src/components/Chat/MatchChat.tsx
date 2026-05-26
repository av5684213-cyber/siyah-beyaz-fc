/**
 * @deprecated Kullanılmıyor. Aktif alternatifler:
 * - Maç sohbeti: src/components/fm/MatchChatPanel.tsx
 * - Rakip mesajlaşma: src/components/fm/RivalMessagingPanel.tsx
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, MessageSquare, Zap, ChevronDown } from 'lucide-react';
import type { MatchChatMessage, MatchMessageType } from '@/lib/fm/unifiedMessagingService';
import {
  loadMatchChat,
  sendMatchChatMessage,
  sendMatchReaction,
  subscribeToMatchChat,
  unsubscribeFromMatchChat,
  REACTION_EMOJIS,
} from '@/lib/fm/unifiedMessagingService';

// ─── Props ────────────────────────────────────────────────────────────

interface MatchChatProps {
  match_id: string;           // Fikstür/match ID
  profileId?: string;         // Opsiyonel — verilmezse localStorage'dan alınır
  teamName?: string;          // Opsiyonel — verilmezse localStorage'dan alınır
  currentMinute?: number;
  className?: string;
}

// ─── Mesaj Tipi Stilleri ──────────────────────────────────────────────

const MESSAGE_STYLE_MAP: Record<MatchMessageType, {
  container: string;
  text: string;
  prefix: string;
}> = {
  chat: {
    container: 'bg-white/[0.03] border-white/[0.06]',
    text: 'text-white/80',
    prefix: '',
  },
  reaction: {
    container: 'bg-amber-500/5 border-amber-500/15',
    text: 'text-amber-300',
    prefix: '',
  },
  event: {
    container: 'bg-emerald-500/5 border-emerald-500/15',
    text: 'text-emerald-300',
    prefix: '📣 ',
  },
  system: {
    container: 'bg-blue-500/5 border-blue-500/15',
    text: 'text-blue-300',
    prefix: 'ℹ️ ',
  },
};

// ─── Mesaj Balonu ─────────────────────────────────────────────────────

function ChatMessageBubble({ msg, isOwn }: { msg: MatchChatMessage; isOwn: boolean }) {
  const style = MESSAGE_STYLE_MAP[msg.message_type] || MESSAGE_STYLE_MAP.chat;

  // Reaksiyon mesajları
  if (msg.message_type === 'reaction') {
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 py-1 px-1"
      >
        <span className="text-lg">{msg.content}</span>
        <span className="text-white/30 text-[10px]">{msg.sender_name}</span>
        {msg.minute != null && <span className="text-white/15 text-[9px]">{msg.minute}&apos;</span>}
      </motion.div>
    );
  }

  // Olay mesajları (gol, kart, sakatlık bildirimi)
  if (msg.message_type === 'event' || msg.message_type === 'system') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-center py-2 px-4 rounded-xl border ${style.container} ${style.text} text-xs font-medium mx-4`}
      >
        {style.prefix}{msg.content}
      </motion.div>
    );
  }

  // Normal sohbet mesajı
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border ${style.container} rounded-2xl px-3 py-2 ${isOwn ? 'ml-8 bg-red-600/5 border-red-500/10' : 'mr-8'}`}
    >
      <div className="flex items-baseline gap-2">
        <span className={`text-[10px] font-bold ${isOwn ? 'text-red-400' : 'text-white/50'} uppercase tracking-tight`}>
          {msg.sender_name}
        </span>
        <span className="text-white/15 text-[8px]">
          {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        {msg.minute != null && (
          <span className="text-white/10 text-[8px]">{msg.minute}&apos;</span>
        )}
      </div>
      <p className={`text-xs mt-0.5 ${style.text}`}>{msg.content}</p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ANA BİLEŞEN: MatchChat
// ═══════════════════════════════════════════════════════════════════════

export default function MatchChat({
  match_id,
  profileId: profileIdProp,
  teamName: teamNameProp,
  currentMinute,
  className = '',
}: MatchChatProps) {
  // Oturumdan profil bilgilerini al (prop yoksa localStorage'dan)
  const [resolvedProfileId, setResolvedProfileId] = useState(profileIdProp || '');
  const [resolvedTeamName, setResolvedTeamName] = useState(teamNameProp || '');

  const [messages, setMessages] = useState<MatchChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showReactions, setShowReactions] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof subscribeToMatchChat>>(null);

  // Profil bilgilerini çözümle
  useEffect(() => {
    if (profileIdProp && teamNameProp) {
      setResolvedProfileId(profileIdProp);
      setResolvedTeamName(teamNameProp);
      return;
    }
    try {
      const stored = localStorage.getItem('fm_auth_email');
      if (stored) setResolvedProfileId(prev => prev || stored);
      const profileStr = localStorage.getItem('fm_profile');
      if (profileStr) {
        const parsed = JSON.parse(profileStr);
        if (parsed.id) setResolvedProfileId(prev => prev || parsed.id);
        if (parsed.team_name) setResolvedTeamName(prev => prev || parsed.team_name);
      }
    } catch (err) {
      console.error('[MatchChat] Profil yükleme hatası:', err);
    }
  }, [profileIdProp, teamNameProp]);

  // İlk yükleme — mevcut mesajları getir
  useEffect(() => {
    if (!match_id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const loaded = await loadMatchChat(match_id, 50);
      if (!cancelled) {
        setMessages(loaded);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [match_id]);

  // Supabase Realtime aboneliği — yeni mesajlar canlı gelir
  useEffect(() => {
    if (!match_id || !resolvedProfileId) return;

    const channel = subscribeToMatchChat(match_id, (msg) => {
      setMessages(prev => [...prev.slice(-49), msg]);
    });
    channelRef.current = channel;

    return () => {
      unsubscribeFromMatchChat(channelRef.current);
      channelRef.current = null;
    };
  }, [match_id, resolvedProfileId]);

  // Yeni mesaj geldiğinde otomatik scroll
  useEffect(() => {
    if (scrollRef.current && !isMinimized) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  // Mesaj gönderme
  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !resolvedProfileId || !resolvedTeamName) return;
    const content = newMessage.trim().slice(0, 200);
    setNewMessage('');
    await sendMatchChatMessage(match_id, resolvedProfileId, resolvedTeamName, content);
  }, [newMessage, match_id, resolvedProfileId, resolvedTeamName]);

  // Hızlı reaksiyon gönderme
  const handleReaction = useCallback(async (emoji: string) => {
    if (!resolvedProfileId || !resolvedTeamName) return;
    await sendMatchReaction(match_id, resolvedProfileId, resolvedTeamName, emoji, currentMinute);
    setShowReactions(false);
  }, [match_id, resolvedProfileId, resolvedTeamName, currentMinute]);

  // İstatistikler
  const chatCount = messages.filter(m => m.message_type === 'chat').length;
  const eventCount = messages.filter(m => m.message_type === 'event').length;

  // ─── Minimize edilmiş görünüm ───────────────────────────────────
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={`w-full bg-[#0a0e14] border border-white/[0.06] rounded-2xl p-3 flex items-center justify-between hover:bg-white/[0.03] transition-all ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <MessageSquare size={14} className="text-amber-400" />
          <span className="text-white/60 text-xs font-medium">Maç Sohbeti</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/20 text-[10px]">{chatCount} mesaj</span>
          {messages.length > 0 && (
            <span className="text-sm">
              {messages[messages.length - 1]?.message_type === 'reaction'
                ? messages[messages.length - 1].content
                : '💬'}
            </span>
          )}
          <ChevronDown size={14} className="text-white/20" />
        </div>
      </button>
    );
  }

  return (
    <div className={`bg-[#0a0e14] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col ${className}`}>
      {/* ─── Başlık ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-white/70 text-xs font-bold uppercase tracking-wider">
            CANLI SOHBET
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/20 text-[9px]">
            {chatCount} mesaj • {eventCount} olay
          </span>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white/20 hover:text-white/60 transition-colors"
            title="Küçült"
          >
            <ChevronDown size={14} className="rotate-180" />
          </button>
        </div>
      </div>

      {/* ─── Mesajlar ───────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[180px] max-h-[400px]"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full py-8">
            <div className="animate-spin w-6 h-6 border border-white/10 border-t-white/40 rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/15 py-8">
            <MessageSquare size={28} className="mb-2" />
            <p className="text-xs">Henüz mesaj yok</p>
            <p className="text-[10px] mt-1">İlk mesajı sen gönder!</p>
          </div>
        ) : (
          messages.map(msg => (
            <ChatMessageBubble
              key={msg.id}
              msg={msg}
              isOwn={msg.profile_id === resolvedProfileId}
            />
          ))
        )}
      </div>

      {/* ─── Hızlı Reaksiyonlar ──────────────────────────────────── */}
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

      {/* ─── Mesaj Girdisi ───────────────────────────────────────── */}
      <div className="p-3 bg-white/[0.01] border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          {/* Reaksiyon Toggle */}
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
              showReactions
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                : 'bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white/60'
            }`}
            title="Reaksiyonlar"
          >
            <Zap size={16} />
          </button>

          {/* Metin Girdisi */}
          <input
            type="text"
            value={newMessage}
            maxLength={200}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Mesaj yaz..."
            className="flex-1 bg-black/40 border border-white/[0.06] rounded-lg py-2 px-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/30"
          />

          {/* Gönder Butonu */}
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="w-9 h-9 rounded-lg bg-amber-600 flex items-center justify-center hover:bg-amber-500 active:scale-95 transition-all disabled:opacity-30 disabled:hover:bg-amber-600 flex-shrink-0"
            title="Gönder"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
