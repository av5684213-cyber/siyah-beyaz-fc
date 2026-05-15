'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  MessageSquare,
  X,
  Search,
  ChevronLeft,
  Users,
  Trash2,
  Smile,
  Flame,
  Handshake,
  DollarSign,
  PartyPopper,
  MessageCircle,
  Check,
  CheckCheck,
} from 'lucide-react';
import {
  ManagerConversation,
  ManagerMessage,
  MessageCategory,
  MESSAGE_CATEGORIES,
  QUICK_REPLIES,
  getOrCreateConversation,
  getMyConversations,
  sendMessage,
  getConversationMessages,
  markMessagesAsRead,
  getTotalUnreadCount,
  updateMyPresence,
  getMultiplePresence,
  searchRivalManagers,
  deleteMessage,
  subscribeToConversations,
  subscribeToConversationMessages,
  unsubscribeFromChannel,
} from '@/lib/fm/rivalMessagingService';

// ─── Props ────────────────────────────────────────────────────────

interface RivalMessagingProps {
  userId: string;
  userName: string;
  teamName: string;
  /** Dışarıdan transfer teklifi mesajı göndermek için */
  initialMessage?: {
    recipientId: string;
    recipientName: string;
    recipientTeam: string;
    message: string;
  } | null;
  /** Transfer teklifi modalı içerisinden açılıyorsa true */
  isTransferContext?: boolean;
  onMessageSent?: () => void;
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

// ═══════════════════════════════════════════════════════════════════════
// ANA BİLEŞEN: RivalMessaging
// ═══════════════════════════════════════════════════════════════════════

export default function RivalMessaging({
  userId,
  userName,
  teamName,
  initialMessage,
  isTransferContext = false,
  onMessageSent,
  className = '',
}: RivalMessagingProps) {
  // Panel durumu
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'conversations' | 'chat' | 'new'>('conversations');

  // Veri durumu
  const [conversations, setConversations] = useState<(ManagerConversation & { otherManagerName?: string; otherManagerTeam?: string; unreadCount?: number })[]>([]);
  const [activeConversation, setActiveConversation] = useState<ManagerConversation | null>(null);
  const [messages, setMessages] = useState<ManagerMessage[]>([]);
  const [presences, setPresences] = useState<Map<string, { profileId: string; isOnline: boolean; statusText: string }>>(new Map());
  const [totalUnread, setTotalUnread] = useState(0);

  // Girdi durumu
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>('general');
  const [showCategories, setShowCategories] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; managerName: string; teamName: string; isOnline?: boolean }[]>([]);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const convChannelRef = useRef<any>(null);
  const msgChannelRef = useRef<any>(null);

  // ─── Sohbetleri yükle ──────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    if (!userId) return;
    const { conversations: convs } = await getMyConversations(userId);
    if (convs) {
      setConversations(convs);

      // Konuşma ortaklarının çevrimiçi durumunu yükle
      const ids = convs.map(c =>
        c.participant1 === userId ? c.participant2 : c.participant1
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
  }, [userId]);

  // ─── Okunmamış sayısını yükle ──────────────────────────────────

  const loadUnreadCount = useCallback(async () => {
    if (!userId) return;
    const { count } = await getTotalUnreadCount(userId);
    setTotalUnread(count);
  }, [userId]);

  // ─── Konuşma aç ────────────────────────────────────────────────

  const openConversation = useCallback(async (conv: ManagerConversation & { otherManagerName?: string; otherManagerTeam?: string; unreadCount?: number }) => {
    setActiveConversation(conv);
    setView('chat');
    setMessages([]);
    setSelectedCategory(isTransferContext ? 'transfer' : 'general');
    setShowCategories(false);
    setShowQuickReplies(false);

    // Mesajları yükle
    const { messages: msgs } = await getConversationMessages(conv.id, userId);
    if (msgs) {
      setMessages(msgs);
    }

    // Bu konuşmanın mesajlarına abone ol
    if (msgChannelRef.current) {
      unsubscribeFromChannel(msgChannelRef.current);
    }
    msgChannelRef.current = subscribeToConversationMessages(conv.id, (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    // Okundu olarak işaretle
    await markMessagesAsRead(conv.id, userId);
    await loadUnreadCount();
  }, [userId, loadUnreadCount, isTransferContext]);

  // ─── Dışarıdan gelen transfer teklifi mesajını işle ──────────

  useEffect(() => {
    if (initialMessage && userId) {
      (async () => {
        setIsOpen(true);
        const { conversation } = await getOrCreateConversation(
          userId,
          initialMessage.recipientId,
          initialMessage.recipientName,
        );
        if (conversation) {
          const convWithMeta = {
            ...conversation,
            otherManagerName: initialMessage.recipientName,
            otherManagerTeam: initialMessage.recipientTeam,
            unreadCount: 0,
          };
          await openConversation(convWithMeta as any);

          // Transfer teklifi mesajını gönder
          if (initialMessage.message) {
            setInputText(initialMessage.message);
          }
        }
      })();
    }
  }, [initialMessage, userId, openConversation]);

  // ─── Başlatma ──────────────────────────────────────────────────

  useEffect(() => {
    if (!userId || !isOpen) return;

    loadConversations();
    loadUnreadCount();
    updateMyPresence(userId, true, 'Çevrimiçi');

    convChannelRef.current = subscribeToConversations(
      userId,
      () => { loadUnreadCount(); loadConversations(); },
      () => { loadConversations(); },
    );

    return () => {
      if (convChannelRef.current) unsubscribeFromChannel(convChannelRef.current);
      if (msgChannelRef.current) unsubscribeFromChannel(msgChannelRef.current);
      updateMyPresence(userId, false, 'Çevrimdışı');
    };
  }, [userId, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Otomatik scroll ────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Mesaj gönder ──────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !activeConversation || isSending) return;
    setIsSending(true);
    try {
      const { message } = await sendMessage(activeConversation.id, userId, inputText, selectedCategory);
      if (message) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
        setInputText('');
        loadConversations();
        loadUnreadCount();
        onMessageSent?.();
      }
    } catch (err) {
      console.error('Mesaj gönderme hatası:', err);
    } finally {
      setIsSending(false);
    }
  }, [inputText, activeConversation, userId, selectedCategory, isSending, loadConversations, loadUnreadCount, onMessageSent]);

  // ─── Rakip ara ────────────────────────────────────────────────

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const { managers } = await searchRivalManagers(userId, query);
    if (managers) setSearchResults(managers);
  }, [userId]);

  // ─── Yeni konuşma başlat ────────────────────────────────────────

  const startNewConversation = useCallback(async (manager: { id: string; managerName: string; teamName: string }) => {
    const { conversation } = await getOrCreateConversation(userId, manager.id, manager.managerName);
    if (conversation) {
      const convWithMeta = {
        ...conversation,
        otherManagerName: manager.teamName || manager.managerName,
        otherManagerTeam: manager.teamName || '',
        unreadCount: 0,
      };
      await openConversation(convWithMeta as any);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [userId, openConversation]);

  // ─── Mesaj sil ──────────────────────────────────────────────────

  const handleDeleteMessage = useCallback(async (msgId: string) => {
    const { success } = await deleteMessage(msgId, userId);
    if (success) {
      setMessages(prev => prev.filter(m => m.id !== msgId));
    }
  }, [userId]);

  // ─── Diğer katılımcı bilgisi ───────────────────────────────────

  const getOtherInfo = useCallback((conv: ManagerConversation) => {
    const isP1 = conv.participant1 === userId;
    const otherId = isP1 ? conv.participant2 : conv.participant1;
    const convWithMeta = conversations.find(c => c.id === conv.id);
    const presence = presences.get(otherId);
    return {
      otherId,
      name: convWithMeta?.otherManagerName || 'Bilinmeyen',
      team: convWithMeta?.otherManagerTeam || '',
      isOnline: presence?.isOnline || false,
    };
  }, [userId, conversations, presences]);

  // ─── Render: Konuşma Listesi Öğesi ────────────────────────────

  const renderConversationItem = (conv: ManagerConversation & { otherManagerName?: string; otherManagerTeam?: string; unreadCount?: number }) => {
    const info = getOtherInfo(conv);
    const isActive = activeConversation?.id === conv.id;

    return (
      <motion.button
        key={conv.id}
        onClick={() => openConversation(conv)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
          isActive ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-white/5 border border-transparent'
        }`}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-sm font-black text-white/60">
            {info.name.charAt(0).toUpperCase()}
          </div>
          {info.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white truncate">{info.name}</span>
            <span className="text-[9px] text-white/30 shrink-0 ml-2">{formatTimeAgo(conv.lastMessageAt)}</span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[10px] text-white/40 truncate pr-2">
              {conv.lastMessageContent || 'Henüz mesaj yok'}
            </p>
            {(conv.unreadCount || 0) > 0 && (
              <span className="shrink-0 min-w-[18px] h-[18px] bg-red-600 rounded-full text-[9px] font-black text-white flex items-center justify-center">
                {conv.unreadCount}
              </span>
            )}
          </div>
        </div>
      </motion.button>
    );
  };

  // ─── Render: Mesaj Balonu ──────────────────────────────────────

  const renderMessageBubble = (msg: ManagerMessage) => {
    const isMine = msg.senderId === userId;
    const categoryMeta = MESSAGE_CATEGORIES[msg.messageType] || MESSAGE_CATEGORIES.general;

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}
      >
        <div className={`max-w-[85%] relative ${
          isMine
            ? 'bg-red-600/20 border border-red-500/20 rounded-2xl rounded-br-sm'
            : 'bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm'
        }`}>
          {msg.messageType !== 'general' && (
            <div className="flex items-center gap-1 px-2.5 pt-2 text-[8px] font-bold uppercase tracking-widest"
              style={{ color: categoryMeta.color }}
            >
              {CATEGORY_ICONS[msg.messageType]}
              <span>{categoryMeta.label}</span>
            </div>
          )}
          <div className="px-3 py-2">
            <p className="text-[11px] leading-relaxed text-white/90">{msg.content}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 pb-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[8px] text-white/20">{formatTimeAgo(msg.createdAt)}</span>
            {isMine && (
              msg.isRead
                ? <CheckCheck size={10} className="text-blue-400" />
                : <Check size={10} className="text-white/20" />
            )}
          </div>
          {isMine && (
            <button
              onClick={() => handleDeleteMessage(msg.id)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={8} className="text-red-400" />
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // ANA RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[360px] h-[540px] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* ─── Başlık ─────────────────────────────────────── */}
            <div className="p-3 bg-zinc-900/80 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                {view === 'chat' && activeConversation ? (
                  <button onClick={() => { setView('conversations'); setActiveConversation(null); if (msgChannelRef.current) { unsubscribeFromChannel(msgChannelRef.current); msgChannelRef.current = null; } }} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                    <ChevronLeft size={14} className="text-white/40" />
                  </button>
                ) : null}
                {view === 'chat' && activeConversation ? (
                  <div className="flex items-center gap-2">
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
                      <p className="text-[8px] text-white/30">
                        {getOtherInfo(activeConversation).isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                      </p>
                    </div>
                  </div>
                ) : view === 'new' ? (
                  <button onClick={() => setView('conversations')} className="flex items-center gap-1 text-white/40 hover:text-white transition-colors">
                    <ChevronLeft size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Yeni Mesaj</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Mesajlar</span>
                    {totalUnread > 0 && (
                      <span className="min-w-[16px] h-[16px] bg-red-600 rounded-full text-[8px] font-black text-white flex items-center justify-center px-1">
                        {totalUnread}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                {view === 'conversations' && (
                  <button onClick={() => setView('new')} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors" title="Yeni mesaj">
                    <Send size={12} className="text-white/30 hover:text-red-400" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                  <X size={14} className="text-white/30" />
                </button>
              </div>
            </div>

            {/* ─── İçerik ─────────────────────────────────────── */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                {/* ── Konuşma Listesi ── */}
                {view === 'conversations' && (
                  <motion.div key="conversations" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 overflow-y-auto p-2 space-y-1">
                    {conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full opacity-30 gap-3">
                        <MessageSquare size={40} />
                        <div className="text-center">
                          <p className="text-[11px] font-black uppercase">Henüz mesaj yok</p>
                          <p className="text-[9px] text-white/40 mt-1">Rakip menajerlere mesaj gönder</p>
                        </div>
                      </div>
                    ) : (
                      conversations.map(conv => renderConversationItem(conv as any))
                    )}
                  </motion.div>
                )}

                {/* ── Yeni Konuşma Arama ── */}
                {view === 'new' && (
                  <motion.div key="new" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 flex flex-col p-3">
                    <div className="relative mb-3">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Takım adı ile ara..." className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 pl-9 pr-3 text-[11px] text-white focus:outline-none focus:border-red-500/50 placeholder:text-white/20" autoFocus />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1">
                      {searchResults.map(manager => (
                        <button key={manager.id} onClick={() => startNewConversation(manager)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left">
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-sm font-black text-white/60">
                              {manager.teamName.charAt(0).toUpperCase()}
                            </div>
                            {manager.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white truncate">{manager.teamName}</p>
                            <p className="text-[9px] text-white/30">{manager.managerName}</p>
                          </div>
                        </button>
                      ))}
                      {searchQuery.length >= 2 && searchResults.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 opacity-30">
                          <Search size={24} />
                          <p className="text-[10px] mt-2">Sonuç bulunamadı</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── Sohbet Görünümü ── */}
                {view === 'chat' && activeConversation && (
                  <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 flex flex-col overflow-hidden">
                    {/* Mesajlar */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-20">
                          <MessageCircle size={32} />
                          <p className="text-[10px] mt-2">Sohbeti başlat!</p>
                        </div>
                      )}
                      {messages.map(msg => renderMessageBubble(msg))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Hızlı Cevaplar */}
                    <AnimatePresence>
                      {showQuickReplies && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5">
                          <div className="p-2 flex flex-wrap gap-1">
                            {(QUICK_REPLIES[selectedCategory] || QUICK_REPLIES.general).map((reply, i) => (
                              <button key={i} onClick={() => { setInputText(reply); setShowQuickReplies(false); inputRef.current?.focus(); }} className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] text-white/60 hover:text-white transition-all">
                                {reply}
                              </button>
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
                              <button key={key} onClick={() => { setSelectedCategory(key); setShowCategories(false); setShowQuickReplies(true); }} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                                selectedCategory === key ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-white/5 border border-transparent text-white/40 hover:text-white hover:bg-white/10'
                              }`}>
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
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-bold"
                            style={{ background: `${MESSAGE_CATEGORIES[selectedCategory].color}15`, color: MESSAGE_CATEGORIES[selectedCategory].color, border: `1px solid ${MESSAGE_CATEGORIES[selectedCategory].color}30` }}
                          >
                            {CATEGORY_ICONS[selectedCategory]}
                            <span>{MESSAGE_CATEGORIES[selectedCategory].label}</span>
                          </div>
                          <button onClick={() => setSelectedCategory('general')} className="text-white/20 hover:text-white/60">
                            <X size={10} />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setShowCategories(!showCategories); setShowQuickReplies(false); }} className={`shrink-0 p-2 rounded-lg transition-all ${showCategories ? 'bg-red-500/10 text-red-400' : 'hover:bg-white/5 text-white/20 hover:text-white/40'}`} title="Mesaj kategorisi">
                          <Smile size={14} />
                        </button>
                        <input ref={inputRef} type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} placeholder={isTransferContext ? 'Transfer teklifi mesajı yaz...' : 'Mesaj yaz...'} maxLength={500} className="flex-1 bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-[11px] text-white focus:outline-none focus:border-red-500/50 placeholder:text-white/20" />
                        <button onClick={() => { setShowQuickReplies(!showQuickReplies); setShowCategories(false); }} className={`shrink-0 p-2 rounded-lg transition-all ${showQuickReplies ? 'bg-blue-500/10 text-blue-400' : 'hover:bg-white/5 text-white/20 hover:text-white/40'}`} title="Hızlı cevaplar">
                          <Handshake size={14} />
                        </button>
                        <button onClick={handleSend} disabled={!inputText.trim() || isSending} className="shrink-0 w-9 h-9 bg-red-600 hover:bg-red-500 disabled:bg-white/5 disabled:text-white/10 rounded-xl flex items-center justify-center transition-all active:scale-95">
                          <Send size={14} className="text-white" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Açılır/Kapanır Buton ─────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-full shadow-2xl shadow-red-500/20 flex items-center justify-center group hover:scale-110 transition-all relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-14 group-hover:translate-y-0 transition-transform duration-500" />
        <MessageSquare className="relative z-10" size={22} />
        {totalUnread > 0 && !isOpen && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-black border-2 border-red-600 text-[9px] font-black text-white flex items-center justify-center rounded-full px-1">
            {totalUnread > 99 ? '99+' : totalUnread}
          </motion.span>
        )}
      </button>
    </div>
  );
}
