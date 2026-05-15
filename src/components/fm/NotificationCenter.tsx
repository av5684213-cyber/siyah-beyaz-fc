'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, ChevronRight, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/fm/ui-helpers';

interface Notification {
  id: string;
  title: string;
  body: string;
  url?: string;
  type?: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationCenterProps {
  profileId: string;
  supabase: any;
}

export default function NotificationCenter({ profileId, supabase }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Bildirimleri getir
  useEffect(() => {
    if (!supabase || !profileId) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          setNotifications(data);
          setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
        }
      } catch (err) {
        console.error('[NotificationCenter] Fetch error:', err);
      }
    };

    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `profile_id=eq.${profileId}`,
      }, (payload: { new: Notification }) => {
        setNotifications((prev) => [payload.new, ...prev].slice(0, 20));
        setUnreadCount((prev) => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, profileId]);

  const markAsRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[NotificationCenter] Mark read error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('profile_id', profileId)
        .eq('is_read', false);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[NotificationCenter] Mark all read error:', err);
    }
  };

  const clearAll = async () => {
    try {
      await supabase.from('notifications').delete().eq('profile_id', profileId);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('[NotificationCenter] Clear error:', err);
    }
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-white/5 transition-all"
      >
        <Bell size={18} className="text-white/60" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-tight">
                Bildirimler
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[9px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Tümünü Oku
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="text-[9px] font-bold text-red-400 hover:text-red-300 transition-colors"
                >
                  Temizle
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={24} className="mx-auto text-white/10 mb-2" />
                  <p className="text-xs text-white/20 font-bold">Henüz bildirim yok</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => {
                      markAsRead(notif.id);
                      if (notif.url) window.location.href = notif.url;
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-all flex items-start gap-3 ${
                      !notif.is_read ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        !notif.is_read ? 'bg-amber-400' : 'bg-white/10'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-bold truncate ${
                          !notif.is_read ? 'text-white' : 'text-white/60'
                        }`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-[10px] text-white/40 line-clamp-2 mt-0.5">
                        {notif.body}
                      </p>
                      <p className="text-[9px] text-white/20 mt-1">
                        {formatDistanceToNow(new Date(notif.created_at))}
                      </p>
                    </div>
                    {notif.url && (
                      <ChevronRight size={12} className="text-white/20 shrink-0 mt-1" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
