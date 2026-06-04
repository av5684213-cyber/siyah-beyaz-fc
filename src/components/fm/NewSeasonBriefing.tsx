'use client';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Calendar, Users, Star, ArrowRight } from 'lucide-react';

interface SeasonAward {
  award_type: string;
  player_name?: string;
  team_name?: string;
  stat_value?: number;
}

interface NewSeasonBriefingProps {
  isOpen: boolean;
  onClose: () => void;
  newLeagueName: string;
  wasPromoted: boolean;
  wasRelegated: boolean;
  season: number;
  profileId?: string;
  leagueId?: string;
  retiredPlayers?: { name: string; age: number; goals: number; matches: number }[];
}

// Award type labels in Turkish
const AWARD_LABELS: Record<string, string> = {
  champion: 'Şampiyon',
  golden_boot: 'Altın Krampon',
  top_assists: 'Asist Kralı',
  mvp: 'En Değerli Oyuncu',
  best_gk: 'En İyi Kaleci',
  best_young: 'En İyi Genç',
  fair_play: 'Fair Play',
  most_improved: 'En Çok Gelişen',
  unsung_hero: 'Görünmez Kahraman',
  fan_favorite: 'Taraftarın Sevgilisi',
  best_11: 'Yılın En İyi 11\'i',
};

export default function NewSeasonBriefing({
  isOpen, onClose, newLeagueName, wasPromoted, wasRelegated, season, profileId, leagueId, retiredPlayers = []
}: NewSeasonBriefingProps) {
  const [awards, setAwards] = useState<SeasonAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextFixtures, setNextFixtures] = useState<{ opponent: string; is_home: boolean; match_date: string }[]>([]);

  // Fetch previous season awards and next fixtures
  useEffect(() => {
    if (!isOpen || !leagueId) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        // Fetch season awards for this league
        const seasonId = `S${new Date().getFullYear() - 1}_auto`;
        const params = new URLSearchParams({ leagueId, seasonId });
        const res = await fetch(`/api/season-awards?${params}`);
        if (res.ok) {
          const data = await res.json();
          setAwards(data.awards || []);
        }
      } catch {}

      try {
        // Fetch first 3 fixtures for the new season
        if (profileId) {
          const fixRes = await fetch(`/api/fixture/${profileId}`);
          if (fixRes.ok) {
            const fixData = await fixRes.json();
            const fixtures = fixData.fixtures || [];
            const upcoming = fixtures
              .filter((f: any) => f.status === 'scheduled')
              .slice(0, 3)
              .map((f: any) => ({
                opponent: f.opponent || f.away_team_name || 'Rakip',
                is_home: f.is_home ?? true,
                match_date: f.match_date || '',
              }));
            setNextFixtures(upcoming);
          }
        }
      } catch {}

      setLoading(false);
    };

    fetchData();
  }, [isOpen, leagueId, profileId]);

  // ── Yükselme konfeti efekti ──
  useEffect(() => {
    if (!isOpen || !wasPromoted) return;

    const style = document.createElement('style');
    style.id = 'nsb-confetti-style';
    style.textContent = `
      @keyframes nsbConfettiFall {
        0%   { transform: translateY(-10vh) rotate(0deg) scale(1); opacity: 1; }
        80%  { opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0; }
      }
      .nsb-conf-piece {
        position: fixed;
        pointer-events: none;
        z-index: 9998;
        top: -20px;
        animation: nsbConfettiFall linear forwards;
        border-radius: 2px;
      }
    `;
    document.head.appendChild(style);

    const COLORS = ['#10b981','#f59e0b','#3b82f6','#ef4444','#a855f7','#ec4899','#14b8a6'];
    const pieces: HTMLElement[] = [];

    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div');
      el.className = 'nsb-conf-piece';
      el.style.left             = `${Math.random() * 100}vw`;
      el.style.width            = `${6 + Math.random() * 8}px`;
      el.style.height           = `${6 + Math.random() * 8}px`;
      el.style.background       = COLORS[Math.floor(Math.random() * COLORS.length)];
      el.style.animationDuration = `${2 + Math.random() * 3}s`;
      el.style.animationDelay   = `${Math.random() * 2}s`;
      if (Math.random() > 0.5) el.style.borderRadius = '50%';
      document.body.appendChild(el);
      pieces.push(el);
    }

    const cleanup = () => {
      pieces.forEach(p => p.remove());
      document.getElementById('nsb-confetti-style')?.remove();
    };
    const timer = setTimeout(cleanup, 7000);
    return () => { clearTimeout(timer); cleanup(); };
  }, [isOpen, wasPromoted]);

  if (!isOpen) return null;

  const statusConfig = wasPromoted
    ? { icon: TrendingUp, color: 'amber', title: '🏆 YÜKSELDİNİZ!', emoji: '🎊', bgClass: 'bg-gradient-to-br from-amber-500/20 via-emerald-500/15 to-amber-400/10 border-amber-400/30', textClass: 'text-amber-400', desc: `${newLeagueName}'e hoş geldiniz! Daha zorlu rakipler, daha büyük sahneler. Bu anı hak ettiniz.` }
    : wasRelegated
    ? { icon: TrendingDown, color: 'red', title: 'DÜŞTÜNÜZ', emoji: '📉', bgClass: 'bg-red-500/10 border-red-500/20', textClass: 'text-red-400', desc: `${newLeagueName}'de yeniden inşa edin. Her büyük kulüp bir gün düşmüştür — şimdi dönüş hikayenizi yazın.` }
    : { icon: Minus, color: 'blue', title: 'YENİ SEZON', emoji: '⚽', bgClass: 'bg-blue-500/10 border-blue-500/20', textClass: 'text-blue-400', desc: `${newLeagueName}'te devam ediyoruz. Geçen sezonun tecrübeleriyle daha güçlüyüz.` };

  const StatusIcon = statusConfig.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="max-w-lg w-full space-y-4 text-center my-8"
          >
            {/* ── Status Banner ── */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: -40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.1 }}
              className={`${statusConfig.bgClass} border rounded-2xl p-8 relative overflow-hidden`}
            >
              {wasPromoted && (
                <motion.div
                  className="absolute inset-0 bg-amber-400/5 rounded-2xl"
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 1.5, repeat: 4 }}
                />
              )}
              <motion.p
                className="text-6xl mb-4"
                animate={wasPromoted ? {
                  scale: [1, 1.4, 1, 1.2, 1],
                  rotate: [0, -10, 10, -5, 0],
                } : {}}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {statusConfig.emoji}
              </motion.p>
              <h2 className={`text-4xl font-black ${statusConfig.textClass} tracking-tight`}>
                {statusConfig.title}
              </h2>
              <p className="text-white/50 text-sm mt-3 leading-relaxed">{statusConfig.desc}</p>
            </motion.div>

            {/* ── Season Info ── */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-3"
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar size={14} className="text-white/30" />
                <p className="text-[9px] uppercase tracking-widest text-white/20">{season}. Sezon</p>
              </div>
              <h3 className="text-xl font-black text-white">{newLeagueName}</h3>
              <p className="text-[10px] text-white/40">
                Fikstür çekildi. Pazartesi 12:00&apos;de ilk maç başlıyor.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="bg-white/[0.03] rounded-lg p-2">
                  <p className="text-[7px] text-white/20 uppercase font-bold">Maç Saatleri</p>
                  <p className="text-xs font-bold text-white/60">12:00 / 18:00</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-2">
                  <p className="text-[7px] text-white/20 uppercase font-bold">Toplam Maç</p>
                  <p className="text-xs font-bold text-white/60">34 Hafta</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-2">
                  <p className="text-[7px] text-white/20 uppercase font-bold">Maç Günleri</p>
                  <p className="text-xs font-bold text-white/60">Hafta İçi</p>
                </div>
              </div>
            </motion.div>

            {/* ── Previous Season Awards ── */}
            {awards.length > 0 && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-amber-500/[0.04] border border-amber-500/10 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-center gap-2">
                  <Trophy size={14} className="text-amber-400/60" />
                  <p className="text-[9px] uppercase tracking-widest text-amber-400/40 font-bold">
                    Geçen Sezon Ödülleri
                  </p>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {awards.slice(0, 6).map((award, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-white/[0.02] rounded-lg">
                      <div className="flex items-center gap-2">
                        <Star size={10} className="text-amber-400/40" />
                        <span className="text-[9px] font-bold text-amber-400/70 uppercase tracking-wider">
                          {AWARD_LABELS[award.award_type] || award.award_type}
                        </span>
                      </div>
                      <div className="text-right">
                        {award.player_name && (
                          <span className="text-[9px] text-white/60 font-semibold">{award.player_name}</span>
                        )}
                        {award.team_name && !award.player_name && (
                          <span className="text-[9px] text-white/40">{award.team_name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Upcoming Fixtures Preview ── */}
            {nextFixtures.length > 0 && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-center gap-2">
                  <Users size={14} className="text-white/30" />
                  <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold">
                    İlk Maçlar
                  </p>
                </div>
                <div className="space-y-1.5">
                  {nextFixtures.map((fix, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${
                          fix.is_home 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {fix.is_home ? 'EV' : 'DIŞ'}
                        </span>
                        <span className="text-[10px] font-semibold text-white/70">{fix.opponent}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowRight size={10} className="text-white/20" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Emekli Oyuncu Veda Kartı ── */}
            {retiredPlayers.length > 0 && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-left"
              >
                <p className="text-[9px] uppercase tracking-widest text-white/25 text-center mb-3">
                  Bu Sezon Vedaya Durdu
                </p>
                <div className="space-y-2">
                  {retiredPlayers.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-black text-white">{r.name}</p>
                        <p className="text-[10px] text-white/40">{r.age} yaşında emekli</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/50">{r.matches} maç</p>
                        <p className="text-[10px] text-emerald-400/70">{r.goals} gol</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-white/15 italic text-center mt-3">
                  "Her efsanenin bir son sahnesi vardır."
                </p>
              </motion.div>
            )}

            {/* ── Loading State ── */}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                <span className="text-[9px] text-white/30 uppercase tracking-widest">Yükleniyor...</span>
              </div>
            )}

            {/* ── Action Button ── */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={onClose}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-wider rounded-2xl hover:bg-white/90 transition-colors active:scale-95"
              >
                Yeni Sezonu Başlat
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
