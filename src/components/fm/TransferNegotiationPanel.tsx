'use client';

import { useState, useEffect } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface TransferOffer {
  id: string;
  player_id: string;
  from_profile_id: string;
  to_profile_id: string | null;
  amount: number;
  status: 'pending' | 'countered' | 'accepted' | 'rejected' | 'expired';
  counter_amount: number | null;
  expires_at: string;
  player_name?: string;
}

interface TransferNegotiationPanelProps {
  userId: string;
}

export default function TransferNegotiationPanel({ userId }: TransferNegotiationPanelProps) {
  const [offers, setOffers] = useState<TransferOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [counterAmount, setCounterAmount] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const fetchOffers = async () => {
      try {
        // Incoming offers (to me)
        const { data: incoming } = await supabase
          .from('transfer_offers')
          .select('*, players(name)')
          .eq('to_profile_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        // My outgoing offers
        const { data: outgoing } = await supabase
          .from('transfer_offers')
          .select('*, players(name)')
          .eq('from_profile_id', userId)
          .in('status', ['pending', 'countered'])
          .order('created_at', { ascending: false });

        const allOffers = [
          ...(incoming || []).map((o: any) => ({ ...o, player_name: o.players?.name, direction: 'incoming' as const })),
          ...(outgoing || []).map((o: any) => ({ ...o, player_name: o.players?.name, direction: 'outgoing' as const })),
        ];

        setOffers(allOffers as any);
      } catch (err) {
        console.error('Transfer offers fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [userId]);

  const handleAction = async (offerId: string, action: string) => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      if (action === 'accept') {
        await supabase.rpc('accept_transfer_offer', { p_offer_id: offerId, p_profile_id: userId });
      } else if (action === 'reject') {
        await supabase.rpc('reject_transfer_offer', { p_offer_id: offerId, p_profile_id: userId });
      } else if (action === 'counter') {
        const amount = counterAmount[offerId];
        if (!amount || amount <= 0) return;
        await supabase.rpc('counter_transfer_offer', { p_offer_id: offerId, p_counter_amount: amount, p_profile_id: userId });
      }

      setOffers(prev => prev.filter(o => o.id !== offerId));
    } catch (err) {
      console.error('Offer action error:', err);
    }
  };

  if (loading) return <div className="text-white/30 text-xs animate-pulse">Teklifler yükleniyor...</div>;
  if (offers.length === 0) return null;

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h3 className="text-sm font-bold text-white mb-3">💼 Transfer Teklifleri</h3>
      <div className="space-y-3">
        {offers.map((offer: any) => (
          <div key={offer.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs text-white font-medium">{offer.player_name || 'Oyuncu'}</span>
                <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded ${
                  offer.direction === 'incoming' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {offer.direction === 'incoming' ? 'Gelen' : 'Giden'}
                </span>
              </div>
              <span className="text-xs text-white/40">{(offer.amount / 1000000).toFixed(1)}M €</span>
            </div>

            {offer.counter_amount && (
              <div className="text-[10px] text-amber-400 mb-2">Karşı teklif: {(offer.counter_amount / 1000000).toFixed(1)}M €</div>
            )}

            {offer.direction === 'incoming' && offer.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => handleAction(offer.id, 'accept')} className="text-[10px] px-2 py-1 rounded bg-green-600/80 hover:bg-green-500 text-white">Kabul</button>
                <button onClick={() => handleAction(offer.id, 'reject')} className="text-[10px] px-2 py-1 rounded bg-red-600/80 hover:bg-red-500 text-white">Reddet</button>
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="number"
                    placeholder="Karşı teklif"
                    className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-white w-full"
                    value={counterAmount[offer.id] || ''}
                    onChange={(e) => setCounterAmount(prev => ({ ...prev, [offer.id]: Number(e.target.value) }))}
                  />
                  <button onClick={() => handleAction(offer.id, 'counter')} className="text-[10px] px-2 py-1 rounded bg-amber-600/80 hover:bg-amber-500 text-white whitespace-nowrap">Teklif Et</button>
                </div>
              </div>
            )}

            <div className="text-[10px] text-white/20 mt-1">Son: {new Date(offer.expires_at).toLocaleString('tr-TR')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
