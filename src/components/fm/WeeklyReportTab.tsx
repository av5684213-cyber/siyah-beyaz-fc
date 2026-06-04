'use client';

import { useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface WeeklyReport {
  id: string;
  week_number: number;
  wins: number;
  draws: number;
  losses: number;
  best_player_name: string | null;
  weekly_income: number;
  league_position: number | null;
  next_opponent: string | null;
  created_at: string;
}

interface WeeklyReportTabProps {
  userId: string;
}

export default function WeeklyReportTab({ userId }: WeeklyReportTabProps) {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const fetchReports = async () => {
      try {
        const { data } = await supabase
          .from('weekly_reports')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (data) setReports(data);
      } catch (err) {
        console.error('Weekly report fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId]);

  if (loading) return <div className="text-white/30 text-sm animate-pulse text-center py-8">Raporlar yükleniyor...</div>;

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-white/30">
        <div className="text-3xl mb-3">📊</div>
        <div className="text-sm">Henüz haftalık rapor bulunmuyor</div>
        <div className="text-xs mt-1">Her Pazartesi otomatik oluşturulur</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">📊 Haftalık Raporlar</h2>
      {reports.map(report => (
        <div key={report.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-white">Hafta {report.week_number}</span>
            <span className="text-[10px] text-white/30">{new Date(report.created_at).toLocaleDateString('tr-TR')}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center bg-green-500/10 rounded-lg p-2">
              <div className="text-green-400 font-bold text-lg">{report.wins}</div>
              <div className="text-[10px] text-white/40">Galibiyet</div>
            </div>
            <div className="text-center bg-yellow-500/10 rounded-lg p-2">
              <div className="text-yellow-400 font-bold text-lg">{report.draws}</div>
              <div className="text-[10px] text-white/40">Beraberlik</div>
            </div>
            <div className="text-center bg-red-500/10 rounded-lg p-2">
              <div className="text-red-400 font-bold text-lg">{report.losses}</div>
              <div className="text-[10px] text-white/40">Mağlubiyet</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {report.best_player_name && (
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span className="text-white/50">En İyi:</span>
                <span className="text-white font-medium">{report.best_player_name}</span>
              </div>
            )}
            {report.league_position && (
              <div className="flex items-center gap-2">
                <span>🏆</span>
                <span className="text-white/50">Lig Pozisyonu:</span>
                <span className="text-white font-medium">{report.league_position}.</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span>💰</span>
              <span className="text-white/50">Haftalık Gelir:</span>
              <span className="text-green-400 font-medium">{(report.weekly_income / 1000).toFixed(0)}K €</span>
            </div>
            {report.next_opponent && (
              <div className="flex items-center gap-2">
                <span>⚔️</span>
                <span className="text-white/50">Sonraki Rakip:</span>
                <span className="text-white font-medium">{report.next_opponent}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
