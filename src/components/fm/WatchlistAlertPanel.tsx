'use client';

import { useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface WatchlistAlert {
  id: string;
  player_id: string;
  alert_type: 'listed' | 'price_drop' | 'sold' | 'contract_expiring';
  message: string;
  is_read: boolean;
  created_at: string;
}

interface WatchlistAlertPanelProps {
  userId: string;
}

const ALERT_ICONS: Record<string, string> = {
  listed: '🏷️',
  price_drop: '📉',
  sold: '💰',
  contract_expiring: '⏰',
};

const ALERT_COLORS: Record<string, string> = {
  listed: 'border-green-500/20 bg-green-500/5',
  price_drop: 'border-amber-500/20 bg-amber-500/5',
  sold: 'border-blue-500/20 bg-blue-500/5',
  contract_expiring: 'border-red-500/20 bg-red-500/5',
};

export default function WatchlistAlertPanel({ userId }: WatchlistAlertPanelProps) {
  const [alerts, setAlerts] = useState<WatchlistAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const fetchAlerts = async () => {
      try {
        const { data } = await supabase
          .from('watchlist_alerts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (data) setAlerts(data);
      } catch (err) {
        console.error('Watchlist alerts fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    // Realtime subscription
    const channel = supabase
      .channel('watchlist_alerts_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'watchlist_alerts',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setAlerts(prev => [payload.new as WatchlistAlert, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const markAsRead = async (alertId: string) => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    await supabase.from('watchlist_alerts').update({ is_read: true }).eq('id', alertId);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
  };

  const markAllRead = async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const unreadIds = alerts.filter(a => !a.is_read).map(a => a.id);
    if (unreadIds.length === 0) return;

    await supabase.from('watchlist_alerts').update({ is_read: true }).in('id', unreadIds);
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;
  const visibleAlerts = showAll ? alerts : alerts.slice(0, 5);

  if (loading) return <div className="text-white/30 text-xs animate-pulse">Takip bildirimleri...</div>;
  if (alerts.length === 0) return null;

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">
          🔔 Takip Bildirimleri
          {unreadCount > 0 && <span className="ml-2 text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>}
        </h3>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-[10px] text-amber-400 hover:text-amber-300">
            Tümünü okundu işaretle
          </button>
        )}
      </div>
      <div className="space-y-2">
        {visibleAlerts.map(alert => (
          <div
            key={alert.id}
            className={`rounded-lg p-2 border cursor-pointer transition-all ${ALERT_COLORS[alert.alert_type]} ${!alert.is_read ? 'ring-1 ring-amber-500/30' : 'opacity-60'}`}
            onClick={() => !alert.is_read && markAsRead(alert.id)}
          >
            <div className="flex items-start gap-2">
              <span className="text-sm">{ALERT_ICONS[alert.alert_type]}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/80">{alert.message}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{new Date(alert.created_at).toLocaleString('tr-TR')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {alerts.length > 5 && !showAll && (
        <button onClick={() => setShowAll(true)} className="text-xs text-amber-400 hover:text-amber-300 mt-2 w-full text-center">
          Tümünü göster ({alerts.length})
        </button>
      )}
    </div>
  );
}
