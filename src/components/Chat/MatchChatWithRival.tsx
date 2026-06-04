'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Users,
  Send,
  Search,
  ChevronLeft,
  Trash2,
  Smile,
  Flame,
  Handshake,
  DollarSign,
  PartyPopper,
  MessageCircle,
  Check,
  CheckCheck,
  Zap,
  X,
} from 'lucide-react';
import type { MatchChatMessage, MatchMessageType, ManagerConversation, ManagerMessage, MessageCategory } from '@/lib/fm/unifiedMessagingService';
import {
  MESSAGE_CATEGORIES,
  QUICK_REPLIES,
  REACTION_EMOJIS,
  loadMatchChat,
  sendMatchChatMessage,
  sendMatchReaction,
  subscribeToMatchChat,
  unsubscribeFromMatchChat,
  getOrCreateConversation,
  getMyConversations,
  sendDirectMessage,
  getConversationMessages,
  markMessagesAsRead,
  getTotalUnreadCount,
  updateMyPresence,
  getMultiplePresence,
  searchRivalManagers,
  deleteMessage,
  subscribeToDirectMessages,
  subscribeToConversationMessages,
  unsubscribeFromChannel,
} from '@/lib/fm/unifiedMessagingService';

// ─── Props ────────────────────────────────────────────────────────────

interface MatchChatWithRivalProps {
  matchId: string;
  profileId: string;
  teamName: string;
  /** Rakip menajerin profile ID'si (maç sayfasından sağlanabilir) */
  rivalProfileId?: string;
  rivalTeamName?: string;
  currentMinute?: number;
  className?: string;
}

// ─── Kategori İkon Haritası ─────────────────────────────────────────

const CATEGORY_ICONS: Record<MessageCategory, React.ReactNode> = {
  general: <MessageCircle size={12} />,
  trash_talk: <Flame size={12} />,
  transfer: <DollarSign size={12} />,
  alliance: <Handshake size={12} />,
  friendly_invite: <Users size={12} />,
  season_greeting: <PartyPopper size={12} />,
};

// ─── Zaman Formatlama ──────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'şimdi';
  if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}sa`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}g`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

// ─── Maç Sohbeti Mesaj Stilleri ──────────────────────────────────────

const MATCH_MSG_STYLES: Record<MatchMessageType, { container: string; text: string; prefix: string }> = {
  chat:     { container: 'bg-white/[0.03] border-white/[0.06]', text: 'text-white/80', prefix: '' },
  reaction: { container: 'bg-amber-500/5 border-amber-500/15', text: 'text-amber-300', prefix: '' },
  event:    { container: 'bg-emerald-500/5 border-emerald-500/15', text: 'text-emerald-300', prefix: '📣 ' },
  system:   { container: 'bg-blue-500/5 border-blue-500/15', text: 'text-blue-300', prefix: 'ℹ️ ' },
};

// ═══════════════════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ═══════════════════════════════════════════════════════════════════════

export default function MatchChatWithRival({
  matchId,
  profileId,
  teamName,
  rivalProfileId,
  rivalTeamName,
  currentMinute,
  className = '',
}: MatchChatWithRivalProps) {
  // ── Sekme durumu ──
  const [activeSubTab, setActiveSubTab] = useState<'match' | 'rival'>('match');

  // ═══ Maç Sohbeti State ═══
  const [matchMessages, setMatchMessages] = useState<MatchChatMessage[]>([]);
  const [matchInput, setMatchInput] = useState('');
  const [matchLoading, setMatchLoading] = useState(true);
  const [showReactions, setShowReactions] = useState(false);
  const matchScrollRef = useRef<HTMLDivElement>(null);
  const matchChannelRef = useRef<ReturnType<typeof subscribeToMatchChat>>(null);

  // ═══ Rakip Mesaj State ═══
  const [conversations, setConversations] = useState<(ManagerConversation & { otherManagerName?: string; otherManagerTeam?: string; unreadCount?: number })[]>([]);
  const [activeConversation, setActiveConversation] = useState<ManagerConversation | null>(null);
  const [dmMessages, setDmMessages] = useState<ManagerMessage[]>([]);
  const [presences, setPresences] = useState<Map<string, { profileId: string; isOnline: boolean; statusText: string }>>(new Map());
  const [totalUnread, setTotalUnread] = useState(0);
  const [dmInput, setDmInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>('general');
  const [showCategories, setShowCategories] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [dmView, setDmView] = useState<'conversations' | 'chat' | 'new'>('conversations');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; managerName: string; teamName: string; isOnline?: boolean }[]>([]);
  const [isSending, setIsSending] = useState(false);
  const dmScrollRef = useRef<HTMLDivElement>(null);
  const dmInputRef = useRef<HTMLInputElement>(null);
  const convChannelRef = useRef<any>(null);
  const msgChannelRef = useRef<any>(null);

  // ═══════════════════════════════════════════════════════════════════
  // MAÇ SOHBETİ — Yükleme ve Abonelik
  // ═══════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    (async () => {
      setMatchLoading(true);
      const loaded = await loadMatchChat(matchId, 50);
      if (!cancelled) {
        setMatchMessages(loaded);
        setMatchLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [matchId]);

  useEffect(() => {
    if (!matchId || !profileId) return;
    const channel = subscribeToMatchChat(matchId, (msg) => {
      setMatchMessages(prev => [...prev.slice(-49), msg]);
    });
    matchChannelRef.current = channel;
    return () => {
      unsubscribeFromMatchChat(matchChannelRef.current);
      matchChannelRef.current = null;
    };
  }, [matchId, profileId]);

  useEffect(() => {
    if (matchScrollRef.current) {
      matchScrollRef.current.scrollTop = matchScrollRef.current.scrollHeight;
    }
  }, [matchMessages]);

  const handleMatchSend = useCallback(async () => {
    if (!matchInput.trim() || !profileId || !teamName) return;
    const content = matchInput.trim().slice(0, 200);
    setMatchInput('');
    await sendMatchChatMessage(matchId, profileId, teamName, content);
  }, [matchInput, matchId, profileId, teamName]);

  const handleReaction = useCallback(async (emoji: string) => {
    if (!profileId || !teamName) return;
    await sendMatchReaction(matchId, profileId, teamName, emoji, currentMinute);
    setShowReactions(false);
  }, [matchId, profileId, teamName, currentMinute]);

  // ═══════════════════════════════════════════════════════════════════
  // RAKİP MESAJ — Yükleme ve Abonelik
  // ═══════════════════════════════════════════════════════════════════

  const loadConversations = useCallback(async () => {
    if (!profileId) return;
    const { conversations: convs } = await getMyConversations(profileId);
    if (convs) {
      setConversations(convs);
      const ids = convs.map(c =>
        c.participant1 === profileId ? c.participant2 : c.participant1
      );
      if (ids.length > 0) {
        const { presences: pList } = await getMultiplePresence(ids);
        if (pList) {
          const map = new Map<string, { profileId: string; isOnline: boolean; statusText: string }>();
          pList.forEach(p => map.set(p.profileId, p));
          setPresences(map);
        }
      }
    }
  }, [profileId]);

  const loadUnreadCount = useCallback(async () => {
    if (!profileId) return;
    const { count } = await getTotalUnreadCount(profileId);
    setTotalUnread(count);
  }, [profileId]);

  const openConversation = useCallback(async (conv: ManagerConversation & { otherManagerName?: string; otherManagerTeam?: string; unreadCount?: number }) => {
    setActiveConversation(conv);
    setDmView('chat');
    setDmMessages([]);
    setSelectedCategory('general');
    setShowCategories(false);
    setShowQuickReplies(false);
    const { messages: msgs } = await getConversationMessages(conv.id, profileId);
    if (msgs) setDmMessages(msgs);
    if (msgChannelRef.current) unsubscribeFromChannel(msgChannelRef.current);
    msgChannelRef.current = subscribeToConversationMessages(conv.id, (msg) => {
      setDmMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
    });
    await markMessagesAsRead(conv.id, profileId);
    await loadUnreadCount();
  }, [profileId, loadUnreadCount]);

  // Rakip direkt mesaj aç (eğer rivalProfileId verilmişse)
  useEffect(() => {
    if (rivalProfileId && profileId && activeSubTab === 'rival') {
      (async () => {
        const { conversation } = await getOrCreateConversation(profileId, rivalProfileId, rivalTeamName);
        if (conversation) {
          const existingConv = conversations.find(c => c.id === conversation.id);
          if (existingConv) {
            await openConversation(existingConv as any);
          } else {
            const convWithMeta = {
              ...conversation,
              otherManagerName: rivalTeamName || 'Rakip',
              otherManagerTeam: rivalTeamName || '',
              unreadCount: 0,
            };
            await openConversation(convWithMeta as any);
          }
        }
      })();
    }
  }, [rivalProfileId, profileId, activeSubTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Genel abonelik
  useEffect(() => {
    if (!profileId) return;
    loadConversations();
    loadUnreadCount();
    updateMyPresence(profileId, true, 'Çevrimiçi');

    convChannelRef.current = subscribeToDirectMessages(
      profileId,
      (msg) => {
        if (activeConversation && msg.conversationId === activeConversation.id) {
          setDmMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        }
        loadUnreadCount();
        loadConversations();
      },
      () => { loadConversations(); },
    );

    return () => {
      if (convChannelRef.current) unsubscribeFromChannel(convChannelRef.current);
      if (msgChannelRef.current) unsubscribeFromChannel(msgChannelRef.current);
      updateMyPresence(profileId, false, 'Çevrimdışı');
    };
  }, [profileId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dmScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dmMessages]);

  const handleDmSend = useCallback(async () => {
    if (!dmInput.trim() || !activeConversation || isSending) return;
    setIsSending(true);
    try {
      const { message } = await sendDirectMessage(activeConversation.id, profileId, dmInput, selectedCategory);
      if (message) {
        setDmMessages(prev => prev.some(m => m.id === message.id) ? prev : [...prev, message]);
        setDmInput('');
        loadConversations();
        loadUnreadCount();
      }
    } finally {
      setIsSending(false);
    }
  }, [dmInput, activeConversation, profileId, selectedCategory, isSending, loadConversations, loadUnreadCount]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) { setSearchResults([]); return; }
    const { managers } = await searchRivalManagers(profileId, query);
    if (managers) setSearchResults(managers);
  }, [profileId]);

  const startNewConversation = useCallback(async (manager: { id: string; managerName: string; teamName: string }) => {
    const { conversation } = await getOrCreateConversation(profileId, manager.id, manager.managerName);
    if (conversation) {
      const convWithMeta = { ...conversation, otherManagerName: manager.teamName || manager.managerName, otherManagerTeam: manager.teamName || '', unreadCount: 0 };
      await openConversation(convWithMeta as any);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [profileId, openConversation]);

  const handleDeleteMessage = useCallback(async (msgId: string) => {
    const { success } = await deleteMessage(msgId, profileId);
    if (success) setDmMessages(prev => prev.filter(m => m.id !== msgId));
  }, [profileId]);

  const getOtherInfo = useCallback((conv: ManagerConversation) => {
    const isP1 = conv.participant1 === profileId;
    const otherId = isP1 ? conv.participant2 : conv.participant1;
    const convWithMeta = conversations.find(c => c.id === conv.id);
    const presence = presences.get(otherId);
    return { otherId, name: convWithMeta?.otherManagerName || 'Bilinmeyen', team: convWithMeta?.otherManagerTeam || '', isOnline: presence?.isOnline || false };
  }, [profileId, conversations, presences]);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  const matchChatCount = matchMessages.filter(m => m.message_type === 'chat').length;

  return (
    <div className={`bg-[#0a0e14] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col ${className}`}>
      {/* ── Üst Başlık + Sekmeler ── */}
      <div className="flex items-center justify-between bg-white/[0.02] border-b border-white/[0.06]">
        {/* Sekmeler */}
        <div className="flex">
          <button
            onClick={() => setActiveSubTab('match')}
            className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeSubTab === 'match'
                ? 'text-amber-300 border-b-2 border-amber-500'
                : 'text-white/25 hover:text-white/40'
            }`}
          >
            <MessageSquare size={12} />
            Maç Sohbeti
            {matchChatCount > 0 && (
              <span className="text-[8px] text-white/15">({matchChatCount})</span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('rival')}
            className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeSubTab === 'rival'
                ? 'text-red-300 border-b-2 border-red-500'
                : 'text-white/25 hover:text-white/40'
            }`}
          >
            <Users size={12} />
            Rakip Mesaj
            {totalUnread > 0 && (
              <span className="min-w-[14px] h-[14px] bg-red-600 rounded-full text-[7px] font-black text-white flex items-center justify-center px-0.5">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </button>
        </div>
        <div className="pr-2">
          {activeSubTab === 'match' && (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
        </div>
      </div>

      {/* ── İçerik ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {/* ═══ MAÇ SOHBETİ ═══ */}
          {activeSubTab === 'match' && (
            <motion.div key="match-chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              {/* Mesajlar */}
              <div ref={matchScrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[250px] max-h-[400px]">
                {matchLoading ? (
                  <div className="flex items-center justify-center h-full py-8">
                    <div className="animate-spin w-6 h-6 border border-white/10 border-t-white/40 rounded-full" />
                  </div>
                ) : matchMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-white/15 py-8">
                    <MessageSquare size={28} className="mb-2" />
                    <p className="text-xs">Henüz mesaj yok</p>
                    <p className="text-[10px] mt-1">İlk mesajı sen gönder!</p>
                  </div>
                ) : (
                  matchMessages.map(msg => {
                    const style = MATCH_MSG_STYLES[msg.message_type] || MATCH_MSG_STYLES.chat;
                    if (msg.message_type === 'reaction') {
                      return (
                        <div key={msg.id} className="flex items-center gap-2 py-1 px-1">
                          <span className="text-lg">{msg.content}</span>
                          <span className="text-white/30 text-[10px]">{msg.sender_name}</span>
                          {msg.minute != null && <span className="text-white/15 text-[9px]">{msg.minute}&apos;</span>}
                        </div>
                      );
                    }
                    if (msg.message_type === 'event' || msg.message_type === 'system') {
                      return (
                        <div key={msg.id} className={`text-center py-1.5 px-3 rounded-lg ${style.container} ${style.text} text-xs font-medium`}>
                          {style.prefix}{msg.content}
                        </div>
                      );
                    }
                    const isOwn = msg.profile_id === profileId;
                    return (
                      <div key={msg.id} className={`border ${style.container} rounded-2xl px-3 py-2 ${isOwn ? 'ml-8 bg-red-600/5 border-red-500/10' : 'mr-8'}`}>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-[10px] font-bold ${isOwn ? 'text-red-400' : 'text-white/50'} uppercase tracking-tight`}>{msg.sender_name}</span>
                          <span className="text-white/15 text-[8px]">{new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className={`text-xs mt-0.5 ${style.text}`}>{msg.content}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reaksiyonlar */}
              <AnimatePresence>
                {showReactions && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/[0.04]">
                    <div className="flex items-center justify-center gap-2 p-2">
                      {REACTION_EMOJIS.map(r => (
                        <button key={r.emoji} onClick={() => handleReaction(r.emoji)} title={r.label} className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-lg hover:bg-white/[0.08] hover:scale-110 transition-all active:scale-95">
                          {r.emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Girdi */}
              <div className="p-3 bg-white/[0.01] border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowReactions(!showReactions)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${showReactions ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white/60'}`} title="Reaksiyonlar">
                    <Zap size={16} />
                  </button>
                  <input type="text" value={matchInput} maxLength={200} onChange={e => setMatchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleMatchSend()} placeholder="Mesaj yaz..." className="flex-1 bg-black/40 border border-white/[0.06] rounded-lg py-2 px-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/30" />
                  <button onClick={handleMatchSend} disabled={!matchInput.trim()} className="w-9 h-9 rounded-lg bg-amber-600 flex items-center justify-center hover:bg-amber-500 active:scale-95 transition-all disabled:opacity-30 flex-shrink-0" title="Gönder">
                    <Send size={14} className="text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ RAKİP MESAJ ═══ */}
          {activeSubTab === 'rival' && (
            <motion.div key="rival-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden min-h-[400px]">
              <AnimatePresence mode="wait">
                {/* ── Konuşma Listesi ── */}
                {dmView === 'conversations' && (
                  <motion.div key="conv-list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 overflow-y-auto p-2 space-y-1">
                    {conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full opacity-30 gap-3 py-8">
                        <Users size={32} />
                        <div className="text-center">
                          <p className="text-[11px] font-black uppercase">Henüz mesaj yok</p>
                          <p className="text-[9px] text-white/40 mt-1">Rakip menajere mesaj gönder</p>
                        </div>
                      </div>
                    ) : (
                      conversations.map(conv => {
                        const info = getOtherInfo(conv);
                        return (
                          <button key={conv.id} onClick={() => openConversation(conv)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left">
                            <div className="relative shrink-0">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-sm font-black text-white/60">
                                {info.name.charAt(0).toUpperCase()}
                              </div>
                              {info.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white truncate">{info.name}</span>
                                <span className="text-[9px] text-white/30 shrink-0 ml-2">{formatTimeAgo(conv.lastMessageAt)}</span>
                              </div>
                              <div className="flex items-center justify-between mt-0.5">
                                <p className="text-[10px] text-white/40 truncate pr-2">{conv.lastMessageContent || 'Henüz mesaj yok'}</p>
                                {(conv.unreadCount || 0) > 0 && (
                                  <span className="shrink-0 min-w-[18px] h-[18px] bg-red-600 rounded-full text-[9px] font-black text-white flex items-center justify-center">{conv.unreadCount}</span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                    {/* Yeni mesaj butonu */}
                    <button onClick={() => setDmView('new')} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/10 hover:bg-white/[0.05] transition-all">
                      <Send size={12} className="text-white/30" />
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Yeni Mesaj</span>
                    </button>
                  </motion.div>
                )}

                {/* ── Yeni Konuşma ── */}
                {dmView === 'new' && (
                  <motion.div key="new-conv" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 flex flex-col p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <button onClick={() => setDmView('conversations')} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                        <ChevronLeft size={14} className="text-white/40" />
                      </button>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Yeni Mesaj</span>
                    </div>
                    <div className="relative mb-3">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input type="text" value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="Takım adı ile ara..." className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 pl-9 pr-3 text-[11px] text-white focus:outline-none focus:border-red-500/50 placeholder:text-white/20" autoFocus />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1">
                      {searchResults.map(manager => (
                        <button key={manager.id} onClick={() => startNewConversation(manager)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-sm font-black text-white/60">{manager.teamName.charAt(0).toUpperCase()}</div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white truncate">{manager.teamName}</p>
                            <p className="text-[9px] text-white/30">{manager.managerName}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── Sohbet Görünümü ── */}
                {dmView === 'chat' && activeConversation && (
                  <motion.div key="dm-chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 flex flex-col overflow-hidden">
                    {/* Başlık */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
                      <button onClick={() => { setDmView('conversations'); setActiveConversation(null); if (msgChannelRef.current) { unsubscribeFromChannel(msgChannelRef.current); msgChannelRef.current = null; } }} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                        <ChevronLeft size={14} className="text-white/40" />
                      </button>
                      <div className="relative">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-500/20 flex items-center justify-center text-[10px] font-black text-red-400">
                          {getOtherInfo(activeConversation).name.charAt(0).toUpperCase()}
                        </div>
                        {getOtherInfo(activeConversation).isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-zinc-900" />
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white leading-none">{getOtherInfo(activeConversation).name}</p>
                        <p className="text-[8px] text-white/30">{getOtherInfo(activeConversation).isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</p>
                      </div>
                    </div>

                    {/* Mesajlar */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {dmMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-20">
                          <MessageCircle size={32} />
                          <p className="text-[10px] mt-2">Sohbeti başlat!</p>
                        </div>
                      )}
                      {dmMessages.map(msg => {
                        const isMine = msg.senderId === profileId;
                        const categoryMeta = MESSAGE_CATEGORIES[msg.messageType] || MESSAGE_CATEGORIES.general;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
                            <div className={`max-w-[85%] relative ${isMine ? 'bg-team-primary-bg border border-team-primary-border rounded-2xl rounded-br-sm' : 'bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm'}`}>
                              {msg.messageType !== 'general' && (
                                <div className="flex items-center gap-1 px-2.5 pt-2 text-[8px] font-bold uppercase tracking-widest" style={{ color: categoryMeta.color }}>
                                  {CATEGORY_ICONS[msg.messageType]}
                                  <span>{categoryMeta.label}</span>
                                </div>
                              )}
                              <div className="px-3 py-2">
                                <p className="text-[11px] leading-relaxed text-white/90">{msg.content}</p>
                              </div>
                              <div className={`flex items-center gap-1.5 px-3 pb-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[8px] text-white/20">{formatTimeAgo(msg.createdAt)}</span>
                                {isMine && (msg.isRead ? <CheckCheck size={10} className="text-blue-400" /> : <Check size={10} className="text-white/20" />)}
                              </div>
                              {isMine && (
                                <button onClick={() => handleDeleteMessage(msg.id)} className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 size={8} className="text-red-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={dmScrollRef} />
                    </div>

                    {/* Hızlı Cevaplar */}
                    <AnimatePresence>
                      {showQuickReplies && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5">
                          <div className="p-2 flex flex-wrap gap-1">
                            {(QUICK_REPLIES[selectedCategory] || QUICK_REPLIES.general).map((reply, i) => (
                              <button key={i} onClick={() => { setDmInput(reply); setShowQuickReplies(false); dmInputRef.current?.focus(); }} className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] text-white/60 hover:text-white transition-all">{reply}</button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Kategori Seçici */}
                    <AnimatePresence>
                      {showCategories && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5">
                          <div className="p-2 grid grid-cols-3 gap-1">
                            {(Object.entries(MESSAGE_CATEGORIES) as [MessageCategory, typeof MESSAGE_CATEGORIES.general][]).map(([key, meta]) => (
                              <button key={key} onClick={() => { setSelectedCategory(key); setShowCategories(false); setShowQuickReplies(true); }} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-bold transition-all ${selectedCategory === key ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-white/5 border border-transparent text-white/40 hover:text-white hover:bg-white/10'}`}>
                                {CATEGORY_ICONS[key]}
                                <span>{meta.label}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Mesaj Girdisi */}
                    <div className="p-2.5 bg-zinc-900/50 border-t border-white/5 shrink-0">
                      {selectedCategory !== 'general' && (
                        <div className="flex items-center gap-1.5 mb-2 px-1">
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-bold" style={{ background: `${MESSAGE_CATEGORIES[selectedCategory].color}15`, color: MESSAGE_CATEGORIES[selectedCategory].color, border: `1px solid ${MESSAGE_CATEGORIES[selectedCategory].color}30` }}>
                            {CATEGORY_ICONS[selectedCategory]}
                            <span>{MESSAGE_CATEGORIES[selectedCategory].label}</span>
                          </div>
                          <button onClick={() => setSelectedCategory('general')} className="text-white/20 hover:text-white/60"><X size={10} /></button>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setShowCategories(!showCategories); setShowQuickReplies(false); }} className={`shrink-0 p-2 rounded-lg transition-all ${showCategories ? 'bg-red-500/10 text-red-400' : 'hover:bg-white/5 text-white/20 hover:text-white/40'}`} title="Mesaj kategorisi">
                          <Smile size={14} />
                        </button>
                        <input ref={dmInputRef} type="text" value={dmInput} onChange={e => setDmInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleDmSend(); }} placeholder="Mesaj yaz..." maxLength={500} className="flex-1 bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-[11px] text-white focus:outline-none focus:border-red-500/50 placeholder:text-white/20" />
                        <button onClick={handleDmSend} disabled={!dmInput.trim() || isSending} className="shrink-0 w-9 h-9 bg-team-primary hover:bg-team-primary-hover disabled:bg-white/5 disabled:text-white/10 rounded-xl flex items-center justify-center transition-all active:scale-95">
                          <Send size={14} className="text-white" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
