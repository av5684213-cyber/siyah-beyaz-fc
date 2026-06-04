'use client';

import { useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface PlayerCareerData {
  matches_played_for_club: number;
  goals_scored_for_club: number;
  purchase_date: string | null;
  purchase_price: number;
  purchase_ovr: number | null;
  currentOvr: number;
  name: string;
}

interface PlayerCareerSectionProps {
  playerId: string;
  currentOvr: number;
  playerName: string;
}

export default function PlayerCareerSection({ playerId, currentOvr, playerName }: PlayerCareerSectionProps) {
  const [careerData, setCareerData] = useState<PlayerCareerData | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !playerId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const fetchCareer = async () => {
      try {
        const { data } = await supabase
          .from('players')
          .select('matches_played_for_club, goals_scored_for_club, purchase_date, purchase_price, purchase_ovr')
          .eq('id', playerId)
          .maybeSingle();

        if (data) {
          setCareerData({ ...data, currentOvr, name: playerName });
        }
      } catch (err) {
        console.error('Career data fetch error:', err);
      }
    };

    fetchCareer();
  }, [playerId, currentOvr, playerName]);

  if (!careerData) return null;

  const ovrDiff = careerData.purchase_ovr ? currentOvr - careerData.purchase_ovr : null;

  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
      <h4 className="text-xs font-bold text-white/70 mb-3">🏟️ Kariyerinizdeki Yeri</h4>
      <div className="grid grid-cols-2 gap-3">
        {careerData.purchase_date && (
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-[10px] text-white/40">Satın Alınma</div>
            <div className="text-xs text-white font-medium">{new Date(careerData.purchase_date).toLocaleDateString('tr-TR')}</div>
          </div>
        )}
        {careerData.purchase_price > 0 && (
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-[10px] text-white/40">Transfer Bedeli</div>
            <div className="text-xs text-green-400 font-medium">{(careerData.purchase_price / 1000000).toFixed(1)}M €</div>
          </div>
        )}
        {careerData.purchase_ovr && (
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-[10px] text-white/40">OVR Gelişimi</div>
            <div className="text-xs">
              <span className="text-white/50">{careerData.purchase_ovr}</span>
              <span className="text-white/30 mx-1">→</span>
              <span className="text-white font-bold">{currentOvr}</span>
              {ovrDiff !== null && (
                <span className={`ml-1 ${ovrDiff > 0 ? 'text-green-400' : ovrDiff < 0 ? 'text-red-400' : 'text-white/40'}`}>
                  ({ovrDiff > 0 ? '+' : ''}{ovrDiff})
                </span>
              )}
            </div>
          </div>
        )}
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-[10px] text-white/40">Maç / Gol</div>
          <div className="text-xs text-white font-medium">{careerData.matches_played_for_club || 0} / {careerData.goals_scored_for_club || 0}</div>
        </div>
      </div>
    </div>
  );
}
