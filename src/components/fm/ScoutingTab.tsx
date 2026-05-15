'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Map, Users, Star, Target, Zap, Shield, Activity, TrendingUp, Filter, AlertCircle, Eye, History, LayoutList, ChevronRight, X, Database } from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { Player } from '@/lib/fm/types';
import { toTitleCase, localizePos } from '@/lib/fm/ui-helpers';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export default function ScoutingTab({ onPlayerClick, isAdmin }: { onPlayerClick?: (p: Player) => void, isAdmin?: boolean }) {
  const { profile, setProfile, squad, trainingState, setTrainingState, setSelectedTeamProfile, watchlist, toggleWatchlist, league } = useFM();
  const scouting = useMemo(() => trainingState?.scouting || { scouts: [], foundPlayersPool: [], history: [], watchlist: [] }, [trainingState?.scouting]);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [selectedScoutSlot, setSelectedScoutSlot] = useState<number | null>(null);

  const [advancedFilters, setAdvancedFilters] = useState<any>({
    Klt: 0, Klc: 0, Sav: 0, Pas: 0, Sut: 0, Kfa: 0, Hiz: 0, Guc: 0, Alg: 0, Top: 0, Tplm: 0, name: ''
  });
  const [advancedResults, setAdvancedResults] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [watchlistPlayers, setWatchlistPlayers] = useState<Player[]>([]);

  // Fetch watchlist details
  React.useEffect(() => {
    const fetchWatchlistDetails = async () => {
      if (watchlist?.length > 0) {
        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          const { data } = await supabase.from('players').select('*').in('id', watchlist);
          if (data && data.length > 0) {
            setWatchlistPlayers(data.map((p: any) => ({
              ...p,
              rating: p.rating ?? p.klt ?? 60,
              potential: p.potential ?? p.klt ?? 70,
              passing: p.passing ?? p.pas ?? 50,
              shooting: p.shooting ?? p.sut ?? 50,
              defending: p.defending ?? p.tk ?? 50,
              speed: p.speed ?? p.hiz ?? 50,
              power: p.power ?? p.guc ?? 50,
              vision: p.vision ?? p.alg ?? 50,
              control: p.control ?? p.top ?? 50,
            })));
            return;
          }
        }
        
        // Fallback for local or if supabase data not found
        const squadPlayers = Array.isArray(squad) ? squad : [];
        const leaguePlayers = Array.isArray(league) ? league : [];
        
        const allPossiblePlayers = [
          ...squadPlayers,
          ...leaguePlayers,
          ...(scouting.foundPlayersPool || []),
          ...(scouting.history || []),
          ...advancedResults
        ];
        
        // Unique players by ID
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
    // Note: User tier 1 is highest, 4 is lowest.
    // minTier 1 means it needs Tier 1.
    // userTier 4 can only hire minTier 4.
    // userTier 1 can hire all (minTier 1,2,3,4).
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

    setProfile({ ...profile, money: profile.money - price });
    setTrainingState({ ...trainingState, scouting: newScouting });
    setShowRecruitModal(false);
  };

  const handleSendScout = (scoutId: string, continentId: string) => {
    const continent = continents.find(c => c.id === continentId);
    const scout = scouting.scouts.find((s: any) => s.id === scoutId);
    if (!continent || !scout) return;

    const newScouting = {
      ...scouting,
      scouts: scouting.scouts.map((s: any) => 
        s.id === scoutId 
          ? { ...s, status: 'SCOUTING', location: continent.name, remainingDays: continent.duration } 
          : s
      )
    };

    setTrainingState({ ...trainingState, scouting: newScouting });
    setSelectedContinentId(null);
  };

  const [selectedContinentId, setSelectedContinentId] = useState<string | null>(null);

  const handleAdvancedSearch = async () => {
    if (!profile) return;
    
    if (profile.credits < 2) {
      alert('Yetersiz Kredi! Detaylı arama için 2 Kredi gerekiyor.');
      return;
    }

    if (!confirm('Detaylı arama yapmak için 2 Kredi harcanacak. Devam etmek istiyor musunuz?')) {
      return;
    }

    setIsSearching(true);
    try {
      const isConfigured = isSupabaseConfigured();
      if (!isConfigured) {
        alert('Supabase yapılandırılmamış. Bu özellik şu an kullanılamıyor.');
        setIsSearching(false);
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        alert('Supabase bağlantısı kurulamadı.');
        setIsSearching(false);
        return;
      }

      // Spend coins
      setProfile({ ...profile, credits: profile.credits - 2 });

      // Fetch from Supabase with name filter if provided
      let query = supabase.from('players').select('*');
      
      if (advancedFilters.name && advancedFilters.name.trim().length > 0) {
        query = query.ilike('name', `%${advancedFilters.name.trim()}%`);
      }

      // Add server-side filters for performance where possible
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
      
      query = query.order('rating', { ascending: false }).limit(2000);
      
      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        setAdvancedResults([]);
        alert('Hiç oyuncu bulunamadı.');
        return;
      }

      const results = (data as any[]).filter(p => {
        // Robust attribute mapping (DB columns are usually lowercase)
        const kltValue = p.rating ?? p.klt ?? 0;
        const klcValue = p.goalkeeping ?? p.klc ?? 0;
        const savValue = p.defending ?? p.tk ?? 0;
        const pasValue = p.passing ?? p.pas ?? 0;
        const sutValue = p.shooting ?? p.sut ?? 0;
        const kfaValue = p.heading ?? p.kfa ?? 0;
        const hizValue = p.speed ?? p.hiz ?? 0;
        const gucValue = p.power ?? p.guc ?? 0;
        const algValue = p.vision ?? p.alg ?? 0;
        const topValue = p.control ?? p.top ?? 0;

        const total = kltValue + klcValue + savValue + pasValue + sutValue + kfaValue + hizValue + gucValue + algValue + topValue;

        if (advancedFilters.Tplm > 0 && total < advancedFilters.Tplm) return false;

        return true;
      });

      // Sort results
      results.sort((a, b) => (b.rating || b.klt) - (a.rating || a.klt));
      
      const limitedResults = results.slice(0, 50).map(p => {
        const ratingVal = p.rating ?? p.klt ?? 60;
        const passingVal = p.passing ?? p.pas ?? 50;
        const shootingVal = p.shooting ?? p.sut ?? 50;
        const defendingVal = p.defending ?? p.tk ?? 50;
        const speedVal = p.speed ?? p.hiz ?? 50;
        const powerVal = p.power ?? p.guc ?? 50;
        const visionVal = p.vision ?? p.alg ?? 50;
        const controlVal = p.control ?? p.top ?? 50;
        const headingVal = p.heading ?? p.kfa ?? 50;
        const goalkeepingVal = p.goalkeeping ?? p.klc ?? 10;

        return { 
          ...p, 
          scouted: true,
          // Ensure UI ready fields - both new and legacy names for max compatibility
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
        };
      });

      setAdvancedResults(limitedResults);
      
      if (limitedResults.length === 0) {
        alert('Kriterlerinize uygun oyuncu bulunamadı.');
      }
    } catch (e) {
      console.error('Advanced Search Error:', e);
      alert('Arama sırasında bir hata oluştu: ' + (e instanceof Error ? e.message : 'Bilinmeyen hata'));
    } finally {
      setIsSearching(false);
    }
  };

  const idleScouts = scouting.scouts.filter((s: any) => s.status === 'IDLE');

  const handleDismissPlayer = (playerId: string) => {
    const player = scouting.foundPlayersPool.find((p: any) => p.id === playerId);
    const newScouting = {
      ...scouting,
      foundPlayersPool: scouting.foundPlayersPool.filter((p: any) => p.id !== playerId),
      history: player ? [player, ...(scouting.history || [])].slice(0, 20) : scouting.history
    };
    setTrainingState({ ...trainingState, scouting: newScouting });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-6 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Gözlemcilik Ağı</h2>
          <p className="text-xs font-bold text-white/30 uppercase tracking-[0.4em] mt-1">Yetenek Avı ve Keşif</p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl">
             <span className="text-[10px] font-black text-white/20 uppercase block leading-none mb-1">Bütçe</span>
             <span className="text-sm font-mono font-bold text-emerald-400 leading-none">
               ${(profile?.money || 0).toLocaleString()}
             </span>
           </div>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center gap-3">
        <AlertCircle className="text-amber-500 shrink-0" size={18} />
        <p className="text-[10px] font-bold text-amber-200 uppercase tracking-widest leading-relaxed">
          BİLGİ: Takımlar bulundukları lige göre gözlemci işe alabilir. <br/>
          <span className="opacity-60 font-medium">1. Lig: 5★&apos;a kadar • 2. Lig: 3★&apos;a kadar • 3. Lig: 2★&apos;a kadar • 4. Lig: 1★ Gözlemci.</span>
        </p>
      </div>

      {/* Scouts Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((slotIndex) => {
          const scout = scouting.scouts[slotIndex];
          return (
            <div key={slotIndex} className="bg-white/5 border border-white/5 rounded-[2rem] p-6 relative overflow-hidden flex flex-col min-h-[220px]">
              {scout ? (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{scout.name}</h3>
                      <div className="flex gap-1 mt-1">
                        {[...Array(scout.stars)].map((_, i) => (
                          <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      scout.status === 'IDLE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500 animate-pulse'
                    }`}>
                      {scout.status === 'IDLE' ? 'BOŞTA' : 'GÖREVDE'}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    {scout.status === 'IDLE' ? (
                      <div className="text-center space-y-2 opacity-40">
                        <Activity className="mx-auto" size={24} />
                        <p className="text-[9px] font-black uppercase tracking-widest">Aşağıdaki menüden görev bekliyor</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                         <Map className="mx-auto text-amber-500/40" size={32} />
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Lokasyon: {scout.location}</p>
                            <p className="text-lg font-mono font-bold text-white tracking-widest">{scout.remainingDays} GÜN KALDI</p>
                         </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-white/5 rounded-3xl p-6">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20">
                    <Users size={24} />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/40">BOŞ GÖZLEMCİ SLOTU</h4>
                    <button 
                      onClick={() => {
                        setSelectedScoutSlot(slotIndex);
                        setShowRecruitModal(true);
                      }}
                      className="mt-3 px-6 py-2 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all"
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

      {/* Advanced Attribute Search */}
      <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 overflow-hidden relative shadow-2xl">
         <div className="mb-8 flex items-center justify-between">
            <div>
               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Advanced Search & Keşif Merkezi</h3>
               <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.4em] mt-1">Oyuncu Özelliklerine Göre Detaylı Arama</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
               <Zap size={12} className="text-amber-500" />
               <span className="text-[10px] font-black text-amber-500">2 MG COIN / ARAMA</span>
            </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Oyuncu İsmi</label>
                <input 
                  type="text"
                  value={advancedFilters.name || ''}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, name: e.target.value })}
                  placeholder="İsim ile ara..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none transition-all"
                />
            </div>
            {[
              { id: 'Klt', label: 'Klt' },
              { id: 'Klc', label: 'Klc' },
              { id: 'Sav', label: 'Sav' },
              { id: 'Pas', label: 'Pas' },
              { id: 'Sut', label: 'Şut' },
              { id: 'Kfa', label: 'Kfa' },
              { id: 'Hiz', label: 'Hız' },
              { id: 'Guc', label: 'Güç' },
              { id: 'Alg', label: 'Alg' },
              { id: 'Top', label: 'Top' },
              { id: 'Tplm', label: 'Tplm' },
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
            <div className="flex items-end">
               <button 
                 onClick={handleAdvancedSearch}
                 disabled={isSearching}
                 className="w-full bg-white text-black py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {isSearching ? <Activity size={14} className="animate-spin" /> : <Search size={14} />}
                 ARA
               </button>
            </div>
         </div>

         {advancedResults.length > 0 && (
           <div className="animate-in fade-in slide-in-from-top-4 space-y-4">
             <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">BULUNAN SONUÇLAR ({advancedResults.length})</span>
                <button 
                  onClick={() => setAdvancedResults([])}
                  className="ml-auto text-[8px] font-black text-white/20 hover:text-white uppercase"
                >
                  TEMİZLE
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
               {advancedResults.map((p) => (
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
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{p.position} • {p.age} YAŞ • {p.team_name || 'SERBEST'}</p>
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
               ))}
             </div>
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
            {scouting.foundPlayersPool.map((p: any) => (
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
                <h4 className="text-sm font-black uppercase italic text-white mb-4 line-clamp-1">{(p && p.name) || 'Bilinmeyen'}</h4>
                <div className="flex gap-2">
                   <button 
                     onClick={() => toggleWatchlist(p)}
                     className={`p-2 border rounded-xl transition-all ${watchlist?.includes(p.id) ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white hover:text-black'}`}
                     title="İzleme Listesine Ekle"
                   >
                     <Eye size={14} />
                   </button>
                   <button 
                     onClick={() => handleDismissPlayer(p.id)}
                     className="flex-1 py-2 bg-white/5 border border-white/5 rounded-xl text-[8px] font-black uppercase text-white/40 hover:bg-red-500/20 hover:text-red-500 transition-all"
                   >
                     REDDET
                   </button>
                   <button 
                     onClick={() => onPlayerClick?.(p)}
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
             {(scouting.history || []).map((p: any) => (
               <div key={p.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center text-[10px] font-black italic text-white/40">
                     {p.rating}
                   </div>
                   <div>
                     <p className="text-[11px] font-black uppercase italic text-white/60">{(p && p.name) || 'Bilinmeyen'}</p>
                     <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{p.position} • {p.age} Yaş</p>
                   </div>
                 </div>
                 <button 
                   onClick={() => onPlayerClick?.(p)}
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
             {(watchlistPlayers || []).map((p: any) => (
               <div key={p.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-amber-500/20 transition-all">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-[10px] font-black italic text-amber-500">
                     {p.klt || p.rating}
                   </div>
                   <div>
                     <p className="text-[11px] font-black uppercase italic text-white">{(p && p.name) || 'Bilinmeyen'}</p>
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
