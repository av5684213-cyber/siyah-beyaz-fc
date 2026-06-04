'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface PlayerFormChartProps {
  playerId: string;
}

export default function PlayerFormChart({ playerId }: PlayerFormChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [trend, setTrend] = useState<'rising' | 'falling' | 'stable'>('stable');

  useEffect(() => {
    if (!isSupabaseConfigured() || !playerId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const fetchRatings = async () => {
      try {
        const { data: ratings } = await supabase
          .from('player_match_ratings')
          .select('rating, match_date')
          .eq('player_id', playerId)
          .order('match_date', { ascending: true })
          .limit(10);

        if (ratings && ratings.length > 0) {
          const chartData = ratings.map((r: any, i: number) => ({
            match: `M${i + 1}`,
            rating: Number(r.rating),
            date: r.match_date,
          }));
          setData(chartData);

          // Trend calculation
          if (chartData.length >= 3) {
            const recent = chartData.slice(-3).reduce((s: number, d: any) => s + d.rating, 0) / 3;
            const older = chartData.slice(0, 3).reduce((s: number, d: any) => s + d.rating, 0) / 3;
            if (recent - older > 0.5) setTrend('rising');
            else if (older - recent > 0.5) setTrend('falling');
          }
        }
      } catch (err) {
        console.error('Form chart error:', err);
      }
    };

    fetchRatings();
  }, [playerId]);

  if (data.length === 0) {
    return (
      <div className="text-center text-white/30 text-xs py-4">
        Henüz maç verisi bulunmuyor
      </div>
    );
  }

  const trendIcon = trend === 'rising' ? '📈' : trend === 'falling' ? '📉' : '➡️';
  const trendText = trend === 'rising' ? 'Yükselişte' : trend === 'falling' ? 'Düşüşte' : 'Stabil';
  const trendColor = trend === 'rising' ? 'text-green-400' : trend === 'falling' ? 'text-red-400' : 'text-white/50';

  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-white/70">Son 10 Maç Form Grafiği</h4>
        <span className={`text-[10px] ${trendColor}`}>{trendIcon} {trendText}</span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="match" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
            itemStyle={{ color: '#fbbf24' }}
          />
          <ReferenceLine y={6} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#fbbf24"
            strokeWidth={2}
            dot={{ fill: '#fbbf24', r: 3 }}
            activeDot={{ r: 5, fill: '#f59e0b' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
