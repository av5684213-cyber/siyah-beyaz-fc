'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  MessageSquare, 
  X, 
  Mail, 
  ChevronRight, 
  Search, 
  User, 
  Info,
  Trash2
} from 'lucide-react';
import { Message } from '@/lib/fm/types';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { useFM } from '@/lib/fm/GameContext';

interface CommunicationPanelProps {
  userId: string;
  userName: string;
  teamName: string;
}

export default function CommunicationPanel({ userId, userName, teamName }: CommunicationPanelProps) {
  const { directMessageRecipient, setDirectMessageRecipient } = useFM();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'inbox'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inbox, setInbox] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<any | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Listen for direct messages from elsewhere
  useEffect(() => {
    if (directMessageRecipient) {
      setSelectedRecipient(directMessageRecipient);
      setActiveTab('inbox');
      setIsOpen(true);
      setDirectMessageRecipient(null); // Clear after opening
    }
  }, [directMessageRecipient, setDirectMessageRecipient]);

  // Real-time Chat Subscription
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    
    let subscription: any;
    
    const setupRealtime = async () => {
      const supabase = getSupabase();
      if (!supabase) return;

      // Initial Load
      const { data: chatData } = await supabase
        .from('messages')
        .select('*')
        .is('receiver_id', null)
        .order('timestamp', { ascending: false })
        .limit(30); // Limiting to 30 instead of 50
      
      if (chatData) setMessages(chatData.reverse());

      const { data: inboxData } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', userId)
        .order('timestamp', { ascending: false })
        .limit(20);
      
      if (inboxData) setInbox(inboxData);

      // Realtime subscription
      subscription = supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
          const nm = payload.new as Message;
          if (!nm.receiver_id) {
            setMessages(prev => [...prev.slice(-29), nm]); // Keep 30
          } else if (nm.receiver_id === userId) {
            setInbox(prev => [nm, ...prev.slice(0, 19)]); // Keep 20
          }
        })
        .subscribe();
    };

    setupRealtime();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!newMessage.trim() || !isSupabaseConfigured()) return;

    try {
      const supabase = getSupabase();
      if (!supabase) return;

      const isDM = selectedRecipient !== null;
      const msg: Partial<Message> = {
        sender_id: userId,
        sender_name: teamName,
        receiver_id: isDM ? selectedRecipient.id : null,
        content: newMessage.slice(0, 150),
        timestamp: new Date().toISOString(),
        is_read: false,
        type: isDM ? 'dm' : 'chat'
      };

      await supabase.from('messages').insert(msg);
      setNewMessage('');
      if (isDM) setSelectedRecipient(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (val: string) => {
    setRecipientSearch(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, team_name')
        .ilike('team_name', `%${val}%`)
        .neq('id', userId)
        .limit(10);
      
      setSearchResults(data || []);
    } catch (e) {
      console.error('Search error:', e);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 h-[500px] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-zinc-900 border-b border-white/5 flex items-center justify-between">
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'chat' ? 'text-red-500' : 'text-white/30'}`}
                >
                  GLOBAL CHAT
                </button>
                <button 
                  onClick={() => setActiveTab('inbox')}
                  className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'inbox' ? 'text-red-500' : 'text-white/30'}`}
                >
                  INBOX
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { if(confirm('Mesajları temizle?')) { setMessages([]); setInbox([]); } }} title="Temizle"><Trash2 size={12} className="text-white/20 hover:text-red-500" /></button>
                <button onClick={() => setIsOpen(false)}><X size={16} className="text-white/20 hover:text-white" /></button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10" ref={scrollRef}>
              {activeTab === 'chat' ? (
                messages.map((m) => (
                  <div key={m.id} className="text-[11px] leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                    <span className="font-black text-red-500 mr-2 uppercase tracking-tighter">[{m.sender_name}]:</span>
                    <span className="text-white/80">{m.content}</span>
                  </div>
                ))
              ) : (
                inbox.length > 0 ? (
                  inbox.map((m) => (
                    <div key={m.id} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-red-500 uppercase">{m.sender_name}</span>
                        <span className="text-[7px] text-white/20">{new Date(m.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[10px] text-white/70">{m.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-20">
                    <Mail size={32} />
                    <span className="text-[10px] font-black mt-2">MESAJ YOK</span>
                  </div>
                )
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-zinc-900 border-t border-white/5">
              {activeTab === 'inbox' && !selectedRecipient && (
                <div className="relative mb-3">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="text"
                    value={recipientSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Alıcı ara..."
                    className="w-full bg-black/40 border border-white/5 rounded-lg py-2 pl-8 pr-3 text-[10px] text-white focus:outline-none focus:border-red-500/50"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute bottom-full left-0 w-full bg-zinc-900 border border-white/10 rounded-lg mb-1 overflow-hidden">
                      {searchResults.map(r => (
                        <button
                          key={r.id}
                          onClick={() => { setSelectedRecipient(r); setSearchResults([]); setRecipientSearch(''); }}
                          className="w-full p-2 text-left text-[10px] text-white/60 hover:bg-white/5 hover:text-white"
                        >
                          {r.team_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedRecipient && (
                <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-lg p-2 mb-3">
                  <span className="text-[9px] font-black text-red-500 uppercase italic">ALICI: {selectedRecipient.team_name}</span>
                  <button onClick={() => setSelectedRecipient(null)}><X size={12} /></button>
                </div>
              )}

              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newMessage}
                  maxLength={150}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={activeTab === 'chat' ? "Sohbete yaz..." : "Mesaj yaz..."}
                  className="flex-1 bg-black/40 border border-white/5 rounded-lg py-2 px-3 text-[10px] text-white focus:outline-none focus:border-red-500/50"
                />
                <button 
                  onClick={handleSend}
                  className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-500 active:scale-95 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-red-600 rounded-full shadow-2xl flex items-center justify-center group hover:scale-110 transition-all relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-14 group-hover:translate-y-0 transition-transform duration-500" />
        <MessageSquare className="relative z-10" />
        {inbox.filter(m => !m.is_read).length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-black border-2 border-red-600 text-[10px] font-black flex items-center justify-center rounded-full">
            {inbox.filter(m => !m.is_read).length}
          </span>
        )}
      </button>
    </div>
  );
}
