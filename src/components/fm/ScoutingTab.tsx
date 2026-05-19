'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Map, Users, Star, Target, Zap, Shield, Activity, TrendingUp, Filter, AlertCircle, Eye, History, LayoutList, ChevronRight, X, Database, Lock, Ban } from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { Player, Scout } from '@/lib/fm/types';
import { toTitleCase, localizePos } from '@/lib/fm/ui-helpers';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── Advanced Filters Interface ───────────────────────────────────
interface AdvancedFilters {
  name: string;
  position: string;
  ageMin: number;
  ageMax: number;
  ovrMin: number;
  ovrMax: number;
  rarity: string;
  archetype: string;
  Klt: number;
  Klc: number;
  Sav: number;
  Pas: number;
  Sut: number;
  Kfa: number;
  Hiz: number;
  Guc: number;
  Alg: number;
  Top: number;
  Tplm: number;
  potentialMin: number;
}

const getDefaultFilters = (): AdvancedFilters => ({
  name: '',
  position: '',
  ageMin: 0,
  ageMax: 0,
  ovrMin: 0,
  ovrMax: 0,
  rarity: '',
  archetype: '',
  Klt: 0,
  Klc: 0,
  Sav: 0,
  Pas: 0,
  Sut: 0,
  Kfa: 0,
  Hiz: 0,
  Guc: 0,
  Alg: 0,
  Top: 0,
  Tplm: 0,
  potentialMin: 0,
});

// ─── Scout Level Descriptors ──────────────────────────────────────
const SCOUT_LEVEL_INFO: Record<number, { label: string; desc: string; color: string }> = {
  1: { label: 'Temel Arama', desc: 'İsim, pozisyon, yaş', color: 'text-white/40' },
  2: { label: 'Genişletilmiş', desc: '+ OVR aralığı, nadirlik filtreleri', color: 'text-amber-400' },
  3: { label: 'Detaylı Arama', desc: '+ Arketip, yetenekler, potansiyel', color: 'text-emerald-400' },
};

export default function ScoutingTab({ onPlayerClick, isAdmin }: { onPlayerClick?: (p: Player) => void, isAdmin?: boolean }) {
  const { profile, setProfile, squad, trainingState, setTrainingState, setSelectedTeamProfile, watchlist, toggleWatchlist, league } = useFM();
  const scouting = useMemo(() => trainingState?.scouting || { scouts: [], foundPlayersPool: [], history: [], watchlist: [] }, [trainingState?.scouting]);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [selectedScoutSlot, setSelectedScoutSlot] = useState<number | null>(null);

  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(getDefaultFilters());
  const [advancedResults, setAdvancedResults] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [watchlistPlayers, setWatchlistPlayers] = useState<Player[]>([]);

  // ── Determine active scout count from multiple sources ──
  const [staffScoutCount, setStaffScoutCount] = useState(0);

  React.useEffect(() => {
    // Supabase staff tablosundan aktif gözlemci sayısını çek
    const fetchStaffScouts = async () => {
      if (!profile?.id || !isSupabaseConfigured()) return;
      const supabase = getSupabase();
      if (!supabase) return;
      try {
        const { count } = await supabase
          .from('staff')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profile.id)
          .eq('type', 'scout');
        if (count && count > 0) setStaffScoutCount(count);
      } catch {
        // Tablo yoksa sessizce devam et
      }
    };
    fetchStaffScouts();
  }, [profile?.id]);

  // En yüksek değeri al: profile.scout_slots, yerel scouting.scouts, veya staff tablosu
  const activeScoutSlots = Math.max(
    profile?.scout_slots ?? 0,
    scouting.scouts.length ?? 0,
    staffScoutCount
  );
  const scoutLevel = Math.min(3, activeScoutSlots); // 1-3

  // Fetch watchlist details
  React.useEffect(() => {
    const fetchWatchlistDetails = async () => {
      if (watchlist?.length > 0) {
        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          const { data } = await supabase.from('players').select('*').in('id', watchlist);
          if (data && data.length > 0) {
            setWatchlistPlayers(data.map((p: Record<string, unknown>) => ({
              ...p,
              rating: (p.rating as number) ?? (p.klt as number) ?? 60,
              potential: (p.potential as number) ?? (p.klt as number) ?? 70,
              passing: (p.passing as number) ?? (p.pas as number) ?? 50,
              shooting: (p.shooting as number) ?? (p.sut as number) ?? 50,
              defending: (p.defending as number) ?? (p.tk as number) ?? 50,
              speed: (p.speed as number) ?? (p.hiz as number) ?? 50,
              power: (p.power as number) ?? (p.guc as number) ?? 50,
              vision: (p.vision as number) ?? (p.alg as number) ?? 50,
              control: (p.control as number) ?? (p.top as number) ?? 50,
            })));
            return;
          }
        }
        
        const squadPlayers = Array.isArray(squad) ? squad : [];
        const leaguePlayers = Array.isArray(league) ? league : [];
        
        const allPossiblePlayers = [
          ...squadPlayers,
          ...leaguePlayers,
          ...(scouting.foundPlayersPool || []),
          ...(scouting.history || []),
          ...advancedResults
        ];
        
        const uniquePool = Array.from(new Map(allPossiblePlayers.map(p => [p.id, p])).values());
        const matching = uniquePool.filter(p => watchlist.includes(p.id));
        setWatchlistPlayers(matching);
      } else {
        setWatchlistPlayers([]);
      }
    };
    fetchWatchlistDetails();
  }, [watchlist, league, scouting.foundPlayersPool, scouting.history, advancedResults, scouting, squad]);

  const [userTier, setUserTier] = useState<number>(4);

  // Fetch user tier 
  React.useEffect(() => {
    async function fetchTier() {
      if (!profile?.id) return;
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        const { data: teamData } = await supabase
          .from('league_teams')
          .select('league_id')
          .eq('profile_id', profile.id)
          .single();
        
        if (teamData) {
          const { data: leagueData } = await supabase
            .from('leagues')
            .select('tier')
            .eq('id', teamData.league_id)
            .single();
          
          if (leagueData) setUserTier(leagueData.tier);
        }
      }
    }
    fetchTier();
  }, [profile?.id]);

  const continents = [
    { id: 'EUROPE', name: 'AVRUPA', icon: '🌍', minStars: 1, duration: 3 },
    { id: 'SOUTH_AMERICA', name: 'GÜNEY AMERİKA', icon: '🌎', minStars: 3, duration: 5 },
    { id: 'AFRICA', name: 'AFRİKA', icon: '🌍', minStars: 2, duration: 4 },
    { id: 'ASIA', name: 'ASYA', icon: '🌏', minStars: 2, duration: 4 },
    { id: 'NORTH_AMERICA', name: 'KUZEY AMERİKA', icon: '🌎', minStars: 3, duration: 5 },
  ];

  const scoutPrices = [
    { stars: 1, minTier: 4, price: 500000, name: 'Çırak Gözlemci' },
    { stars: 2, minTier: 3, price: 1500000, name: 'Deneyimli Gözlemci' },
    { stars: 3, minTier: 2, price: 3500000, name: 'Uzman Gözlemci' },
    { stars: 4, minTier: 1, price: 7500000, name: 'Elit Gözlemci' },
    { stars: 5, minTier: 1, price: 15000000, name: 'Efsanevi Gözlemci' },
  ];

  const handleHireScout = (stars: number, price: number, minTier: number) => {
    if (userTier > minTier) {
       alert(`Bu gözlemciyi işe almak için ${minTier}. Lig'de olmalısınız! Şu an ${userTier}. Lig'desiniz.`);
       return;
    }

    if (!profile || profile.money < price) {
      alert('Yetersiz bütçe!');
      return;
    }

    const newScout = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Gözlemci #${scouting.scouts.length + 1}`,
      stars,
      status: 'IDLE' as const,
      remainingDays: 0
    };

    const newScouting = {
      ...scouting,
      scouts: [...scouting.scouts, newScout]
    };

    // Update profile scout_slots count
    const newScoutSlots = (profile.scout_slots ?? scouting.scouts.length) + 1;
    setProfile({ ...profile, money: profile.money - price, scout_slots: newScoutSlots });
    setTrainingState({ ...trainingState, scouting: newScouting });
    setShowRecruitModal(false);
  };

  const handleSendScout = (scoutId: string, continentId: string) => {
    const continent = continents.find(c => c.id === continentId);
    const scout = scouting.scouts.find((s: Scout) => s.id === scoutId);
    if (!continent || !scout) return;

    const newScouting = {
      ...scouting,
      scouts: scouting.scouts.map((s: Scout) => 
        s.id === scoutId 
          ? { ...s, status: 'SCOUTING' as const, location: continent.name, remainingDays: continent.duration } 
          : s
      )
    };

    setTrainingState({ ...trainingState, scouting: newScouting });
    setSelectedContinentId(null);
  };

  const [selectedContinentId, setSelectedContinentId] = useState<string | null>(null);

  // Arama hatası mesajı state'i
  const [searchError, setSearchError] = useState<string>('');

  const handleAdvancedSearch = async () => {
    if (!profile) return;

    // ── CHECK: Must have at least 1 scout slot ──
    if (activeScoutSlots < 1) {
      setSearchError('Gözlemciniz bulunmuyor. Personel sekmesinden gözlemci satın alabilirsiniz.');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    try {
      const isConfigured = isSupabaseConfigured();
      if (!isConfigured) {
        setSearchError('Supabase yapılandırılmamış. Bu özellik şu an kullanılamıyor.');
        setIsSearching(false);
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        setSearchError('Supabase bağlantısı kurulamadı.');
        setIsSearching(false);
        return;
      }

      // ── TÜM OYUNCULARI ARAYAN SORGU ──
      let query = supabase.from('players').select('*');
      
      // ── LEVEL 1: Basic filters (name, position, age) — always available ──
      if (advancedFilters.name && advancedFilters.name.trim().length > 0) {
        query = query.ilike('name', `%${advancedFilters.name.trim()}%`);
      }
      if (advancedFilters.position && advancedFilters.position.trim().length > 0) {
        query = query.eq('position', advancedFilters.position.toUpperCase());
      }
      if (advancedFilters.ageMin > 0) {
        query = query.gte('age', advancedFilters.ageMin);
      }
      if (advancedFilters.ageMax > 0) {
        query = query.lte('age', advancedFilters.ageMax);
      }

      // ── LEVEL 2: OVR range, rarity — requires 2+ scouts ──
      if (scoutLevel >= 2) {
        if (advancedFilters.ovrMin > 0) query = query.gte('rating', advancedFilters.ovrMin);
        if (advancedFilters.ovrMax > 0) query = query.lte('rating', advancedFilters.ovrMax);
      }

      // ── LEVEL 2: Detailed stat filters ──
      if (scoutLevel >= 2) {
        if (advancedFilters.Klt > 0) query = query.gte('rating', advancedFilters.Klt);
        if (advancedFilters.Klc > 0) query = query.gte('klc', advancedFilters.Klc);
        if (advancedFilters.Sav > 0) query = query.gte('tk', advancedFilters.Sav);
        if (advancedFilters.Pas > 0) query = query.gte('pas', advancedFilters.Pas);
        if (advancedFilters.Sut > 0) query = query.gte('sut', advancedFilters.Sut);
        if (advancedFilters.Kfa > 0) query = query.gte('kfa', advancedFilters.Kfa);
        if (advancedFilters.Hiz > 0) query = query.gte('hiz', advancedFilters.Hiz);
        if (advancedFilters.Guc > 0) query = query.gte('guc', advancedFilters.Guc);
        if (advancedFilters.Alg > 0) query = query.gte('alg', advancedFilters.Alg);
        if (advancedFilters.Top > 0) query = query.gte('top', advancedFilters.Top);
      }
      
      query = query.order('rating', { ascending: false }).limit(2000);
      
      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        setAdvancedResults([]);
        setSearchError('Hiç oyuncu bulunamadı. Filtrelerinizi genişletmeyi deneyin.');
        return;
      }

      const results = (data as Record<string, unknown>[]).filter(p => {
        const kltValue = (p.rating as number) ?? (p.klt as number) ?? 0;
        const klcValue = (p.goalkeeping as number) ?? (p.klc as number) ?? 0;
        const savValue = (p.defending as number) ?? (p.tk as number) ?? 0;
        const pasValue = (p.passing as number) ?? (p.pas as number) ?? 0;
        const sutValue = (p.shooting as number) ?? (p.sut as number) ?? 0;
        const kfaValue = (p.heading as number) ?? (p.kfa as number) ?? 0;
        const hizValue = (p.speed as number) ?? (p.hiz as number) ?? 0;
        const gucValue = (p.power as number) ?? (p.guc as number) ?? 0;
        const algValue = (p.vision as number) ?? (p.alg as number) ?? 0;
        const topValue = (p.control as number) ?? (p.top as number) ?? 0;

        const total = kltValue + klcValue + savValue + pasValue + sutValue + kfaValue + hizValue + gucValue + algValue + topValue;

        if (advancedFilters.Tplm > 0 && total < advancedFilters.Tplm) return false;

        // ── LEVEL 3: Potential filter ──
        if (scoutLevel >= 3 && advancedFilters.potentialMin > 0) {
          const potentialValue = (p.potential as number) ?? (p.klt as number) ?? 0;
          if (potentialValue < advancedFilters.potentialMin) return false;
        }

        // ── LEVEL 3: Archetype filter ──
        if (scoutLevel >= 3 && advancedFilters.archetype && advancedFilters.archetype.trim().length > 0) {
          const playerArchetype = (p.archetype as string) ?? (p.play_style as string) ?? '';
          if (!playerArchetype.toLowerCase().includes(advancedFilters.archetype.toLowerCase())) return false;
        }

        // ── LEVEL 2: Rarity filter ──
        if (scoutLevel >= 2 && advancedFilters.rarity && advancedFilters.rarity !== 'all') {
          const ratingVal = (p.rating as number) ?? (p.klt as number) ?? 60;
          const rarityMap: Record<string, [number, number]> = {
            'common': [0, 64],
            'uncommon': [65, 74],
            'rare': [75, 84],
            'epic': [85, 89],
            'legendary': [90, 100],
          };
          const range = rarityMap[advancedFilters.rarity];
          if (range && (ratingVal < range[0] || ratingVal > range[1])) return false;
        }

        return true;
      });

      // Sort results
      results.sort((a, b) => ((b.rating as number) || (b.klt as number)) - ((a.rating as number) || (a.klt as number)));
      
      const limitedResults = results.slice(0, 50).map(p => {
        const ratingVal = (p.rating as number) ?? (p.klt as number) ?? 60;
        const passingVal = (p.passing as number) ?? (p.pas as number) ?? 50;
        const shootingVal = (p.shooting as number) ?? (p.sut as number) ?? 50;
        const defendingVal = (p.defending as number) ?? (p.tk as number) ?? 50;
        const speedVal = (p.speed as number) ?? (p.hiz as number) ?? 50;
        const powerVal = (p.power as number) ?? (p.guc as number) ?? 50;
        const visionVal = (p.vision as number) ?? (p.alg as number) ?? 50;
        const controlVal = (p.control as number) ?? (p.top as number) ?? 50;
        const headingVal = (p.heading as number) ?? (p.kfa as number) ?? 50;
        const goalkeepingVal = (p.goalkeeping as number) ?? (p.klc as number) ?? 10;
        const resolvedTeamName = (p.team_name as string) || 'Serbest';

        return { 
          ...p,
          scouted: true,
          team_name: resolvedTeamName,
          rating: ratingVal,
          klt: ratingVal,
          passing: passingVal,
          pas: passingVal,
          shooting: shootingVal,
          sut: shootingVal,
          defending: defendingVal,
          tk: defendingVal,
          speed: speedVal,
          hiz: speedVal,
          power: powerVal,
          guc: powerVal,
          vision: visionVal,
          alg: visionVal,
          control: controlVal,
          top: controlVal,
          heading: headingVal,
          kfa: headingVal,
          goalkeeping: goalkeepingVal,
          klc: goalkeepingVal
        } as unknown as Player;
      });

      setAdvancedResults(limitedResults);
      
      if (limitedResults.length === 0) {
        setSearchError('Kriterlerinize uygun oyuncu bulunamadı. Filtre değerlerini düşürmeyi deneyin.');
      }
    } catch (e) {
      console.error('Advanced Search Error:', e);
      setSearchError('Arama sırasında bir hata oluştu: ' + (e instanceof Error ? e.message : 'Bilinmeyen hata'));
    } finally {
      setIsSearching(false);
    }
  };

  const idleScouts = scouting.scouts.filter((s: Scout) => s.status === 'IDLE');

  const handleDismissPlayer = (playerId: string) => {
    const player = scouting.foundPlayersPool.find((p: Player) => p.id === playerId);
    const newScouting = {
      ...scouting,
      foundPlayersPool: scouting.foundPlayersPool.filter((p: Player) => p.id !== playerId),
      history: player ? [player, ...(scouting.history || [])].slice(0, 20) : scouting.history
    };
    setTrainingState({ ...trainingState, scouting: newScouting });
  };

  // ── Helper: Get rarity label from rating ──
  const getRarityFromRating = (rating: number): { label: string; color: string } => {
    if (rating >= 90) return { label: 'Efsanevi', color: 'text-amber-400' };
    if (rating >= 85) return { label: 'Epik', color: 'text-purple-400' };
    if (rating >= 75) return { label: 'Nadir', color: 'text-blue-400' };
    if (rating >= 65) return { label: 'Sıra Dışı', color: 'text-emerald-400' };
    return { label: 'Yaygın', color: 'text-white/40' };
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-6 pb-20"
    >
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Gözlemcilik Ağı</h2>
          <p className="text-xs font-bold text-white/30 uppercase tracking-[0.4em] mt-1">Yetenek Avı ve Keşif</p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl">
             <span className="text-[10px] font-black text-white/20 uppercase block leading-none mb-1">Bütçe</span>
             <span className="text-sm font-mono font-bold text-emerald-400 leading-none">
               €{(profile?.money || 0).toLocaleString()}
             </span>
           </div>
           <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl">
             <span className="text-[10px] font-black text-white/20 uppercase block leading-none mb-1">Gözlemci</span>
             <span className={`text-sm font-mono font-bold leading-none ${activeScoutSlots > 0 ? 'text-amber-400' : 'text-red-400'}`}>
               {activeScoutSlots}/3
             </span>
           </div>
        </div>
      </div>

      {/* ── WARNING: No Scout Slots ── */}
      {activeScoutSlots < 1 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <Ban size={28} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-red-400 mb-1">Gözlemci Yok</h3>
            <p className="text-xs text-red-300/70 leading-relaxed">
              Gözlemciniz bulunmuyor. Personel sekmesinden gözlemci satın alabilirsiniz.
            </p>
            <a 
              href="/staff" 
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/30 transition-all"
            >
              <Users size={12} />
              Personel Sayfasına Git
            </a>
          </div>
        </motion.div>
      )}

      {/* ── Scout Level Indicator ── */}
      {activeScoutSlots > 0 && (
        <div className="bg-white/5 border border-white/5 rounded-[2rem] p-5">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={16} className="text-white/40" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white/70">Arama Yetkinliği</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((level) => {
              const info = SCOUT_LEVEL_INFO[level];
              const isActive = scoutLevel >= level;
              return (
                <div 
                  key={level}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive 
                      ? 'bg-amber-500/10 border-amber-500/20' 
                      : 'bg-white/[0.02] border-white/5 opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-lg font-black ${isActive ? 'text-amber-400' : 'text-white/20'}`}>{level}</span>
                    <div className="flex gap-0.5">
                      {[...Array(level)].map((_, i) => (
                        <Star key={i} size={8} className={isActive ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />
                      ))}
                    </div>
                    {!isActive && <Lock size={10} className="text-white/20 ml-auto" />}
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? info.color : 'text-white/20'}`}>
                    {info.label}
                  </p>
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
                    {info.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scouts Overview */}
      <details className="group" open={activeScoutSlots > 0}>
        <summary className="cursor-pointer flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 hover:bg-white/[0.07] transition-all list-none">
          <div className="flex items-center gap-3 flex-1">
            <Users className="text-white/40" size={18} />
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white/70">Gözlemci Slotları</h3>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                {activeScoutSlots > 0 
                  ? `${activeScoutSlots}/3 aktif — Seviye ${scoutLevel} arama` 
                  : 'Gözlemci yok — Arama devre dışı'}
              </p>
            </div>
          </div>
          <ChevronRight size={14} className="text-white/20 group-open:rotate-90 transition-transform" />
        </summary>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((slotIndex) => {
            const scout = scouting.scouts[slotIndex];
            return (
              <div key={slotIndex} className="bg-white/5 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col min-h-[160px]">
                {scout ? (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-black italic uppercase tracking-tighter text-white">{scout.name}</h3>
                        <div className="flex gap-1 mt-1">
                          {[...Array(scout.stars)].map((_, i) => (
                            <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${
                        scout.status === 'IDLE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500 animate-pulse'
                      }`}>
                        {scout.status === 'IDLE' ? 'BOŞTA' : 'GÖREVDE'}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      {scout.status === 'IDLE' ? (
                        <div className="text-center space-y-1 opacity-40">
                          <Activity className="mx-auto" size={18} />
                          <p className="text-[8px] font-black uppercase tracking-widest">Görev bekliyor</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <Map className="mx-auto text-amber-500/40" size={24} />
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{scout.location}</p>
                            <p className="text-base font-mono font-bold text-white tracking-widest">{scout.remainingDays} GÜN</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-3 border-2 border-dashed border-white/5 rounded-2xl p-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20">
                      <Users size={18} />
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Boş Slot</p>
                      <button 
                        onClick={() => {
                          setSelectedScoutSlot(slotIndex);
                          setShowRecruitModal(true);
                        }}
                        className="mt-2 px-4 py-1.5 bg-white text-black text-[8px] font-black uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all"
                      >
                        İŞE AL
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </details>

      {/* ── Advanced Attribute Search ── */}
      <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 overflow-hidden relative shadow-2xl">
         <div className="mb-8 flex items-center justify-between">
            <div>
               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Advanced Search & Keşif Merkezi</h3>
               <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.4em] mt-1">Oyuncu Özelliklerine Göre Detaylı Arama</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              activeScoutSlots < 1 
                ? 'bg-red-500/10 border border-red-500/20' 
                : scoutLevel === 3 
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : scoutLevel === 2
                    ? 'bg-amber-500/10 border border-amber-500/20'
                    : 'bg-white/5 border border-white/10'
            }`}>
               {activeScoutSlots < 1 ? (
                 <>
                   <Ban size={12} className="text-red-500" />
                   <span className="text-[10px] font-black text-red-500">GÖZLEMCİ GEREKLİ</span>
                 </>
               ) : (
                 <>
                   <Database size={12} className={scoutLevel === 3 ? 'text-emerald-500' : 'text-amber-500'} />
                   <span className={`text-[10px] font-black ${scoutLevel === 3 ? 'text-emerald-500' : 'text-amber-500'}`}>
                     SEVİYE {scoutLevel} ARAMA
                   </span>
                 </>
               )}
            </div>
         </div>

         {/* ── LEVEL 1: Basic Filters (always visible when scout >= 1) ── */}
         <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
               <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-[9px] font-black text-white">1</span>
               </div>
               <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Temel Arama — İsim, Pozisyon, Yaş</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="col-span-2 space-y-1.5">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Oyuncu İsmi</label>
                   <input 
                     type="text"
                     value={advancedFilters.name || ''}
                     onChange={(e) => setAdvancedFilters({ ...advancedFilters, name: e.target.value })}
                     placeholder="İsim ile ara..."
                     disabled={activeScoutSlots < 1}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                   />
               </div>
               <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pozisyon</label>
                   <select
                     value={advancedFilters.position}
                     onChange={(e) => setAdvancedFilters({ ...advancedFilters, position: e.target.value })}
                     disabled={activeScoutSlots < 1}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                   >
                     <option value="">Tümü</option>
                     <option value="GK">Kaleci (GK)</option>
                     <option value="DEF">Defans (DEF)</option>
                     <option value="MID">Orta Saha (MID)</option>
                     <option value="FWD">Forvet (FWD)</option>
                   </select>
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Min Yaş</label>
                     <input 
                       type="number"
                       value={advancedFilters.ageMin || ''}
                       onChange={(e) => setAdvancedFilters({ ...advancedFilters, ageMin: parseInt(e.target.value) || 0 })}
                       placeholder="16"
                       disabled={activeScoutSlots < 1}
                       className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                     />
                 </div>
                 <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Max Yaş</label>
                     <input 
                       type="number"
                       value={advancedFilters.ageMax || ''}
                       onChange={(e) => setAdvancedFilters({ ...advancedFilters, ageMax: parseInt(e.target.value) || 0 })}
                       placeholder="40"
                       disabled={activeScoutSlots < 1}
                       className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                     />
                 </div>
               </div>
            </div>
         </div>

         {/* ── LEVEL 2: OVR Range + Rarity + Stats (requires 2+ scouts) ── */}
         <div className={`space-y-4 mb-6 ${scoutLevel < 2 ? 'opacity-30 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
               <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${scoutLevel >= 2 ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                  <span className={`text-[9px] font-black ${scoutLevel >= 2 ? 'text-amber-400' : 'text-white/30'}`}>2</span>
               </div>
               <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Genişletilmiş — OVR, Nadirlik, İstatikler</span>
               {scoutLevel < 2 && <Lock size={10} className="text-white/20 ml-1" />}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
               <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Min OVR</label>
                     <input 
                       type="number"
                       value={advancedFilters.ovrMin || ''}
                       onChange={(e) => setAdvancedFilters({ ...advancedFilters, ovrMin: parseInt(e.target.value) || 0 })}
                       placeholder="0"
                       className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all"
                     />
                 </div>
                 <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Max OVR</label>
                     <input 
                       type="number"
                       value={advancedFilters.ovrMax || ''}
                       onChange={(e) => setAdvancedFilters({ ...advancedFilters, ovrMax: parseInt(e.target.value) || 0 })}
                       placeholder="99"
                       className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all"
                     />
                 </div>
               </div>
               <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Nadirlik</label>
                   <select
                     value={advancedFilters.rarity}
                     onChange={(e) => setAdvancedFilters({ ...advancedFilters, rarity: e.target.value })}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all"
                   >
                     <option value="all">Tümü</option>
                     <option value="common">Yaygın (0-64)</option>
                     <option value="uncommon">Sıra Dışı (65-74)</option>
                     <option value="rare">Nadir (75-84)</option>
                     <option value="epic">Epik (85-89)</option>
                     <option value="legendary">Efsanevi (90+)</option>
                   </select>
               </div>
               {[
                 { id: 'Klt' as const, label: 'Klt' },
                 { id: 'Klc' as const, label: 'Klc' },
                 { id: 'Sav' as const, label: 'Sav' },
                 { id: 'Pas' as const, label: 'Pas' },
                 { id: 'Sut' as const, label: 'Şut' },
                 { id: 'Kfa' as const, label: 'Kfa' },
                 { id: 'Hiz' as const, label: 'Hız' },
                 { id: 'Guc' as const, label: 'Güç' },
                 { id: 'Alg' as const, label: 'Alg' },
                 { id: 'Top' as const, label: 'Top' },
                 { id: 'Tplm' as const, label: 'Tplm' },
               ].map((attr) => (
                 <div key={attr.id} className="space-y-1.5">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{attr.label}</label>
                   <input 
                     type="number"
                     value={advancedFilters[attr.id] || ''}
                     onChange={(e) => setAdvancedFilters({ ...advancedFilters, [attr.id]: parseInt(e.target.value) || 0 })}
                     placeholder="Min"
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all"
                   />
                 </div>
               ))}
            </div>
         </div>

         {/* ── LEVEL 3: Archetype, Skills, Potential (requires 3+ scouts) ── */}
         <div className={`space-y-4 mb-8 ${scoutLevel < 3 ? 'opacity-30 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
               <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${scoutLevel >= 3 ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                  <span className={`text-[9px] font-black ${scoutLevel >= 3 ? 'text-emerald-400' : 'text-white/30'}`}>3</span>
               </div>
               <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Detaylı — Arketip, Yetenekler, Potansiyel</span>
               {scoutLevel < 3 && <Lock size={10} className="text-white/20 ml-1" />}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Arketip</label>
                   <input 
                     type="text"
                     value={advancedFilters.archetype || ''}
                     onChange={(e) => setAdvancedFilters({ ...advancedFilters, archetype: e.target.value })}
                     placeholder="Örn: Playmaker, Tank..."
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all"
                   />
               </div>
               <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Min Potansiyel</label>
                   <input 
                     type="number"
                     value={advancedFilters.potentialMin || ''}
                     onChange={(e) => setAdvancedFilters({ ...advancedFilters, potentialMin: parseInt(e.target.value) || 0 })}
                     placeholder="0"
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all"
                   />
               </div>
            </div>
         </div>

         {/* ── Search Button ── */}
         <div className="flex items-end gap-4 mb-6">
            <button 
              onClick={handleAdvancedSearch}
              disabled={isSearching || activeScoutSlots < 1}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                activeScoutSlots < 1 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed' 
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50'
              }`}
            >
              {isSearching ? <Activity size={14} className="animate-spin" /> : <Search size={14} />}
              {activeScoutSlots < 1 ? 'GÖZLEMCİ GEREKLİ' : 'ARA'}
            </button>
            <button 
              onClick={() => { setAdvancedFilters(getDefaultFilters()); setAdvancedResults([]); setSearchError(''); }}
              className="px-4 py-3 bg-white/5 text-white/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              SIFIRLA
            </button>
         </div>

         {/* ── Arama Hata Mesajı ── */}
         {searchError && (
           <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 mb-4">
             <AlertCircle className="text-red-400 shrink-0" size={16} />
             <p className="text-[10px] font-bold text-red-300 uppercase tracking-widest">{searchError}</p>
             <button onClick={() => setSearchError('')} className="ml-auto text-white/30 hover:text-white">
               <X size={14} />
             </button>
           </div>
         )}

         {advancedResults.length > 0 && (
           <div className="animate-in fade-in slide-in-from-top-4 space-y-4">
             <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">BULUNAN SONUÇLAR ({advancedResults.length})</span>
                <button 
                  onClick={() => { setAdvancedResults([]); setSearchError(''); }}
                  className="ml-auto text-[8px] font-black text-white/20 hover:text-white uppercase"
                >
                  TEMİZLE
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
               {advancedResults.map((p) => {
                 const rarity = getRarityFromRating(p.klt || p.rating);
                 return (
                   <div 
                     key={p.id}
                     className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer"
                     onClick={() => onPlayerClick?.(p)}
                   >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-sm font-black italic">
                          {p.klt || p.rating}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase italic leading-none mb-1 group-hover:text-amber-400 transition-colors">{(p && p.name) || 'Bilinmeyen'}</p>
                          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{localizePos(p.position)} • {p.age} YAŞ</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[7px] font-bold text-emerald-400/60 uppercase tracking-widest">{p.team_name || 'SERBEST'}</p>
                            {scoutLevel >= 2 && (
                              <span className={`text-[7px] font-black uppercase ${rarity.color}`}>{rarity.label}</span>
                            )}
                          </div>
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-1">
                        <div className="text-center">
                          <p className="text-[6px] text-white/40 uppercase">PAS</p>
                          <p className="text-[10px] font-mono font-bold">{p.pas || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[6px] text-white/40 uppercase">ŞUT</p>
                          <p className="text-[10px] font-mono font-bold">{p.sut || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[6px] text-white/40 uppercase">HIZ</p>
                          <p className="text-[10px] font-mono font-bold">{p.hiz || 0}</p>
                        </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
         )}

         {/* ── Sonuç yok + hata yok = İlk kullanım ipucu ── */}
         {advancedResults.length === 0 && !searchError && !isSearching && (
           <div className="py-12 text-center">
             <Search className="mx-auto text-white/10 mb-3" size={32} />
             <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Filtreleri ayarlayın ve ARA butonuna tıklayın</p>
             <p className="text-[9px] text-white/10 mt-1 uppercase">
               {activeScoutSlots < 1 
                 ? 'Arama için en az 1 gözlemci gereklidir' 
                 : `Seviye ${scoutLevel} arama aktif — ${SCOUT_LEVEL_INFO[scoutLevel].desc}`}
             </p>
           </div>
         )}
      </div>

      {/* Discovered Players Pool */}
      {scouting.foundPlayersPool.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Target className="text-red-500" />
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">BULUNAN OYUNCULAR</h3>
            <div className="flex-1 border-b border-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {scouting.foundPlayersPool.map((p: Player) => (
              <motion.div 
                layout
                key={p.id}
                className="bg-white/5 border border-white/5 rounded-3xl p-5 group hover:border-white/20 transition-all relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                     <span className="text-black font-black italic">{p.rating}</span>
                   </div>
                   <span className="px-2 py-0.5 bg-white/10 rounded text-[8px] font-black text-white/40">{p.position}</span>
                </div>
                <h4 className="text-sm font-black uppercase italic text-white mb-4 line-clamp-1">{p.name || 'Bilinmeyen'}</h4>
                <div className="flex gap-2">
                   <button 
                     onClick={() => toggleWatchlist(p as unknown as Player)}
                     className={`p-2 border rounded-xl transition-all ${watchlist?.includes(p.id as string) ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white hover:text-black'}`}
                     title="İzleme Listesine Ekle"
                   >
                     <Eye size={14} />
                   </button>
                   <button 
                     onClick={() => handleDismissPlayer(p.id as string)}
                     className="flex-1 py-2 bg-white/5 border border-white/5 rounded-xl text-[8px] font-black uppercase text-white/40 hover:bg-red-500/20 hover:text-red-500 transition-all"
                   >
                     REDDET
                   </button>
                   <button 
                     onClick={() => onPlayerClick?.(p as unknown as Player)}
                     className="flex-1 py-2 bg-emerald-500 text-black text-[8px] font-black uppercase rounded-xl hover:scale-105 transition-all"
                   >
                     TEKLİF YAP
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* History & Watchlist Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* History List */}
        <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <History className="text-white/40" size={20} />
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Geçmiş Aramalar</h3>
             </div>
             <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{scouting.history?.length || 0} KAYIT</span>
           </div>
           
           <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             {(scouting.history || []).map((p: Player) => (
               <div key={p.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center text-[10px] font-black italic text-white/40">
                     {p.rating}
                   </div>
                   <div>
                     <p className="text-[11px] font-black uppercase italic text-white/60">{p.name || 'Bilinmeyen'}</p>
                     <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{localizePos(p.position)} • {p.age} Yaş</p>
                   </div>
                 </div>
                 <button 
                   onClick={() => onPlayerClick?.(p as unknown as Player)}
                   className="p-2 text-white/20 hover:text-white transition-colors"
                 >
                   <ChevronRight size={14} />
                 </button>
               </div>
             ))}
             {(!scouting.history || scouting.history.length === 0) && (
               <div className="py-12 text-center text-white/10 italic text-[10px] uppercase tracking-widest">
                 Henüz geçmiş araması bulunmuyor.
               </div>
             )}
           </div>
        </div>

        {/* Watchlist */}
        <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <Eye className="text-amber-500" size={20} />
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">İzleme Listesi</h3>
             </div>
             <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{watchlistPlayers.length} OYUNCU</span>
           </div>

           <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             {(watchlistPlayers || []).map((p: Player) => (
               <div key={p.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-amber-500/20 transition-all">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-[10px] font-black italic text-amber-500">
                     {p.rating}
                   </div>
                   <div>
                     <p className="text-[11px] font-black uppercase italic text-white">{p.name || 'Bilinmeyen'}</p>
                     <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{localizePos(p.position)} • {p.age} Yaş</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onPlayerClick?.(p)}
                      className="p-2 text-white/20 hover:text-white transition-colors"
                    >
                      <Zap size={14} />
                    </button>
                    <button 
                      onClick={() => toggleWatchlist(p)}
                      className="p-2 text-white/10 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                 </div>
               </div>
             ))}
             {watchlistPlayers.length === 0 && (
               <div className="py-12 text-center text-white/10 italic text-[10px] uppercase tracking-widest">
                 İzleme listesi boş.
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Recycle Modal (HIRING) */}
      <AnimatePresence>
        {showRecruitModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/80"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#111] border border-white/10 rounded-[3rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Users size={120} />
              </div>

              <div className="mb-8">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">GÖZLEMCİ İŞE AL</h3>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mt-2">Ağına Yeni Bir Uzman Kat</p>
              </div>

              <div className="space-y-3">
                {scoutPrices.map(s => (
                  <button 
                    key={s.stars}
                    onClick={() => handleHireScout(s.stars, s.price, s.minTier)}
                    disabled={userTier > s.minTier}
                    className={`w-full flex items-center justify-between p-4 border rounded-2xl transition-all group ${userTier > s.minTier ? 'opacity-40 cursor-not-allowed bg-black/40 border-white/5' : 'bg-white/5 border-white/5 hover:bg-white hover:text-black'}`}
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-black/10">
                         <span className="text-lg">{s.stars}★</span>
                       </div>
                       <div className="text-left">
                         <p className="text-xs font-black uppercase">{s.name}</p>
                         <div className="flex gap-0.5">
                           {[...Array(5)].map((_, i) => (
                             <Star key={i} size={8} className={i < s.stars ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />
                           ))}
                         </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="mb-1">
                         <p className="text-[7px] font-black uppercase text-white/40 group-hover:text-black/40">GEREKLİ LİG</p>
                         <p className={`text-[9px] font-black ${userTier <= s.minTier ? 'text-emerald-500' : 'text-red-500'}`}>{s.minTier}. LİG</p>
                       </div>
                       <p className="text-[8px] font-black uppercase text-white/40 group-hover:text-black/40">MALİYET</p>
                       <p className="font-mono font-bold text-xs">${s.price.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setShowRecruitModal(false)}
                className="w-full mt-6 py-3 text-[10px] font-black uppercase text-white/20 hover:text-white transition-colors"
              >
                İPTAL ET
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
