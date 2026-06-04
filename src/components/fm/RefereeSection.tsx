'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Gavel,
  Star,
  Loader2,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';

// ─── Personality descriptions (Turkish) ───────────────────────────
const PERSONALITY_DESCRIPTIONS: Record<string, string> = {
  strict: 'Sert bir yonetim sergiler, kart gostermekten cekinmez.',
  balanced: 'Dengeli bir tutum sergiler, adil kararlar verir.',
  lenient: 'Oyunun akisini bozmamaya calisir, az faulcalar.',
  home_bias: 'Ev sahibine kucuk avantajlar saglar.',
  volatile: 'Kararlari tutarsiz, her mac farkli bir hakem gibi.',
  var_lover: 'VAR incelemelerini sikca kullanir, bol penalti karar.',
  // Geriye uyumluluk
  katil: 'Sert bir yonetim sergiler, kart gostermekten cekinmez.',
  dengeci: 'Dengeli bir tutum sergiler, adil kararlar verir.',
  hosgorulu: 'Oyunun akisini bozmamaya calisir, az faulcalar.',
  'hoşgörülü': 'Oyunun akisini bozmamaya calisir, az faulcalar.',
  ev_sahibi: 'Ev sahibine kucuk avantajlar saglar.',
  degisken: 'Kararlari tutarsiz, her mac farkli bir hakem gibi.',
  'değişken': 'Kararlari tutarsiz, her mac farkli bir hakem gibi.',
  var_sever: 'VAR incelemelerini sikca kullanir, bol penalti karar.',
};

// ─── Personality emoji mapping ────────────────────────────────────
const PERSONALITY_EMOJI: Record<string, string> = {
  strict: '🟥',
  balanced: '⚖️',
  lenient: '🤝',
  home_bias: '🏠',
  volatile: '🎲',
  var_lover: '📺',
  // Geriye uyumluluk
  katil: '🟥',
  dengeci: '⚖️',
  hosgorulu: '🤝',
  'hoşgörülü': '🤝',
  ev_sahibi: '🏠',
  degisken: '🎲',
  'değişken': '🎲',
  var_sever: '📺',
};

// ─── Personality color mapping ────────────────────────────────────
const PERSONALITY_COLORS: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  strict: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', bar: 'bg-red-500' },
  balanced: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', bar: 'bg-amber-500' },
  lenient: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  home_bias: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', bar: 'bg-sky-500' },
  volatile: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', bar: 'bg-purple-500' },
  var_lover: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', bar: 'bg-cyan-500' },
  // Geriye uyumluluk
  katil: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', bar: 'bg-red-500' },
  dengeci: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', bar: 'bg-amber-500' },
  hosgorulu: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  'hoşgörülü': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  ev_sahibi: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', bar: 'bg-sky-500' },
  degisken: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', bar: 'bg-purple-500' },
  'değişken': { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', bar: 'bg-purple-500' },
  var_sever: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', bar: 'bg-cyan-500' },
};

// ─── Personality Turkish label ────────────────────────────────────
const PERSONALITY_LABELS: Record<string, string> = {
  strict: 'Katılcı',
  balanced: 'Dengeci',
  lenient: 'Hoşgörülü',
  home_bias: 'Ev Sahibi',
  volatile: 'Değişken',
  var_lover: 'VAR Sever',
  // Geriye uyumluluk
  katil: 'Katılcı',
  dengeci: 'Dengeci',
  hosgorulu: 'Hoşgörülü',
  'hoşgörülü': 'Hoşgörülü',
  ev_sahibi: 'Ev Sahibi',
  degisken: 'Değişken',
  'değişken': 'Değişken',
  var_sever: 'VAR Sever',
};

interface RefereeData {
  id: string;
  name: string;
  personality: string;
  experience: number;
  strictness: number;
  total_matches?: number;
  total_yellows?: number;
  total_reds?: number;
  total_penalties?: number;
}

// ─── Main Component ───────────────────────────────────────────────
export default function RefereeSection() {
  const { profile } = useFM();
  const [referees, setReferees] = useState<RefereeData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferees = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      // Find the user's league_id via league_teams
      const supabaseModule = await import('@/lib/supabase');
      const isConfigured = supabaseModule.isSupabaseConfigured();
      const supabase = isConfigured ? supabaseModule.getSupabase() : null;

      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: leagueTeam } = await supabase
        .from('league_teams')
        .select('league_id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (!leagueTeam?.league_id) {
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/referees?leagueId=${leagueTeam.league_id}`);
      if (!res.ok) {
        // API hatası olsa bile sayfayı çökertme, boş liste göster
        console.warn('[RefereeSection] API responded with status:', res.status);
        setReferees([]);
      } else {
        const data = await res.json();
        setReferees(data.referees || []);
      }
    } catch (err) {
      // Network veya JSON parse hatası — sessizce boş liste göster
      console.warn('[RefereeSection] Fetch error (graceful fallback):', err);
      setReferees([]);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchReferees();
  }, [fetchReferees]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-amber-400" />
        <span className="ml-3 text-sm text-white/40 font-bold">Hakemler yukleniyor...</span>
      </div>
    );
  }

  // ── Empty state ──
  if (referees.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Section Header */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/[0.04] to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                <Gavel size={20} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">HAKEMLER</h2>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Lig Hakemleri</p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty message */}
        <div className="text-center py-16 bg-zinc-900 border border-white/5 rounded-[2rem]">
          <AlertTriangle size={32} className="mx-auto text-amber-400/30 mb-3" />
          <p className="text-sm text-white/20 font-bold uppercase">Hakemler yuklenmedi</p>
          <p className="text-xs text-white/10 mt-1">Liginizdeki hakemler henuz olusturulmadi.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/[0.04] to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
              <Gavel size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">HAKEMLER</h2>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Lig Hakemleri</p>
            </div>
          </div>
          <p className="text-sm text-white/40 max-w-lg leading-relaxed">
            Liginizdeki hakemler ve yonetim tarzlari. Her hakem farkli bir kisilige sahip ve maclarinizi dogrudan etkiler.
          </p>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg">
              <Gavel size={10} className="text-amber-400" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-wider">
                {referees.length} Hakem
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Referee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {referees.map((ref, i) => {
          const personality = ref.personality || 'balanced';
          const colors = PERSONALITY_COLORS[personality] || PERSONALITY_COLORS.balanced;
          const description = PERSONALITY_DESCRIPTIONS[personality] || PERSONALITY_DESCRIPTIONS.balanced;
          const label = PERSONALITY_LABELS[personality] || 'Bilinmiyor';
          const emoji = PERSONALITY_EMOJI[personality] || '⚖️';
          const strictness = ref.strictness || 50;
          const experience = ref.experience || 5;

          return (
            <motion.div
              key={ref.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-zinc-900 border border-white/5 rounded-2xl p-5 transition-all hover:border-white/10 group"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colors.bg} ${colors.border}`}>
                  <span className="text-lg">{emoji}</span>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${colors.text} ${colors.bg} ${colors.border}`}>
                    {label}
                  </span>
                </div>
              </div>

              {/* Name */}
              <h3 className="text-sm font-black italic uppercase tracking-tighter text-white mb-1 group-hover:text-amber-400 transition-colors">
                {ref.name}
              </h3>

              {/* Personality description */}
              <p className="text-[10px] text-white/30 leading-relaxed mb-4">
                {description}
              </p>

              {/* Strictness bar */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Sertlik</span>
                  <span className="text-[10px] font-mono font-bold text-white/50">{strictness}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${colors.bar}`}
                    style={{ width: `${strictness}%` }}
                  />
                </div>
              </div>

              {/* Experience stars */}
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Deneyim</span>
                <div className="flex gap-0.5">
                  {[...Array(10)].map((_, si) => (
                    <Star
                      key={si}
                      size={10}
                      className={si < experience ? 'text-amber-400 fill-amber-400' : 'text-white/10'}
                    />
                  ))}
                </div>
              </div>

              {/* Stats summary */}
              {(ref.total_matches != null && ref.total_matches > 0 || ref.total_yellows != null && ref.total_yellows > 0 || ref.total_reds != null && ref.total_reds > 0) && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3 text-[8px] font-bold text-white/20 uppercase">
                  {ref.total_matches != null && ref.total_matches > 0 && (
                    <span className="flex items-center gap-1">
                      <Shield size={8} />
                      {ref.total_matches} Mac
                    </span>
                  )}
                  {ref.total_yellows != null && ref.total_yellows > 0 && (
                    <span className="text-amber-400/50">{ref.total_yellows} Sari</span>
                  )}
                  {ref.total_reds != null && ref.total_reds > 0 && (
                    <span className="text-red-400/50">{ref.total_reds} Kirmizi</span>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
