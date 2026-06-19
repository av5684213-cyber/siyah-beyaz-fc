'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Map as MapIcon, Users, Star, Target, Zap, Shield, Activity, TrendingUp, Filter, AlertCircle, Eye, History, LayoutList, ChevronRight, X, Database, Lock, Ban, Check, ChevronDown } from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';
import { useToast } from '@/lib/fm/ToastContext';
import { Player, Scout } from '@/lib/fm/types';
import { toTitleCase, localizePos, getPlayerPos } from '@/lib/fm/ui-helpers';
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
  archetypes: string[];
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
}

const getDefaultFilters = (): AdvancedFilters => ({
  name: '',
  position: '',
  ageMin: 0,
  ageMax: 0,
  ovrMin: 0,
  ovrMax: 0,
  rarity: '',
  archetypes: [],
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
});

// ─── Scout Level Descriptors ──────────────────────────────────────
const SCOUT_LEVEL_INFO: Record<number, { label: string; desc: string; color: string }> = {
  1: { label: 'Temel Arama', desc: 'İsim, pozisyon, yaş', color: 'text-white/40' },
  2: { label: 'Genişletilmiş', desc: '+ OVR aralığı, nadirlik filtreleri', color: 'text-amber-400' },
  3: { label: 'Detaylı Arama', desc: '+ Arketip, yetenekler', color: 'text-emerald-400' },
};

// ─── Archetype Options (from playerGenerator.ts traitBoosts) ──────
const ARCHETYPE_OPTIONS = [
  // Kaleci
  'Refleks canavarı', 'Güvenli eller', '1v1 ustası', 'Hava hakimiyeti',
  // Defans
  'Kale gibi', 'Lider stoper', 'Topla çıkan stoper', 'Hızlı stoper', 'Markajcı', 'Gölge Markajcı',
  'Kanat bekçisi', 'Uzun pas ustası', 'Süpürücü (libero)', 'Top saklayan',
  // Orta Saha
  'Pres ustası', 'Tempo kontrolcüsü', 'Regista', 'Oyun Bozan', 'Oyun kurucu',
  'Box-to-box', 'Top dağıtıcı', 'Uzaktan şutçu', 'Pas arası ustası',
  '10 numara', 'Boşluk bulucu', 'Oyun görüşü yüksek', 'Koşu ustası',
  // Forvet
  'Hızlı forvet', 'Boşluk avcısı', 'Kontra canavarı', 'Bitirici',
  'Sahte 9', 'Pozisyoncu', 'Fırsatçı', 'Gol makinesi', 'Fiziksel santrafor', 'Kafacı (forvet)',
];

// ─── Archetype Multi-Select Component ─────────────────────────────
function ArchetypeMultiSelect({ selected, onChange, scoutLevel }: {
  selected: string[];
  onChange: (val: string[]) => void;
  scoutLevel: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleArchetype = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(a => a !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div className="space-y-1 relative">
      <label className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">Arketip</label>
      <button
        type="button"
        onClick={() => { if (scoutLevel >= 3) setIsOpen(!isOpen); }}
        className={`w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-[10px] sm:text-xs font-mono text-white focus:border-amber-500 outline-none transition-all flex items-center justify-between ${
          scoutLevel < 3 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-white/[0.07]'
        }`}
      >
        <span className={`truncate ${selected.length > 0 ? 'text-white' : 'text-white/30'}`}>
          {selected.length > 0 ? `${selected.length} arketip seçili` : 'Arketip Seç'}
        </span>
        <ChevronDown size={12} className={`text-white/30 transition-transform shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && scoutLevel >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1 left-0 right-0 bg-zinc-800 border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto custom-scrollbar"
          >
            <div className="p-2 space-y-0.5">
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="w-full text-left px-2 py-1.5 text-[9px] font-bold text-red-400/60 uppercase tracking-widest hover:bg-white/5 rounded-lg transition-colors"
                >
                  Seçimleri Temizle
                </button>
              )}
              {ARCHETYPE_OPTIONS.map((name) => {
                const isSelected = selected.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleArchetype(name)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                        : 'text-white/50 hover:bg-white/5 hover:text-white/70 border border-transparent'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                      isSelected
                        ? 'bg-amber-500 border-amber-500'
                        : 'border-white/20'
                    }`}>
                      {isSelected && <Check size={10} className="text-black" />}
                    </div>
                    {name}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// BUG-7: React.memo ile gereksiz yeniden render'lar önlenir
export default React.memo(function ScoutingTab({ onPlayerClick, isAdmin }: { onPlayerClick?: (p: Player) => void, isAdmin?: boolean }) {
  const { profile, setProfile, squad, trainingState, setTrainingState, setSelectedTeamProfile, watchlist, toggleWatchlist, league, setActiveTab } = useFM();
  const { warning: toastWarning } = useToast();
  const scouting = useMemo(() => trainingState?.scouting || { scouts: [], foundPlayersPool: [], history: [], watchlist: [] }, [trainingState?.scouting]);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [selectedScoutSlot, setSelectedScoutSlot] = useState<number | null>(null);

  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(getDefaultFilters());
  const [advancedResults, setAdvancedResults] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // ── Saved Search History ──
  interface SavedSearch {
    id: string;
    label: string;
    filters: AdvancedFilters;
    results: Player[];
    resultCount: number;
    timestamp: number;
  }

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    try {
      const saved = (typeof window !== "undefined" && localStorage).getItem('sbfc_scout_searches');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // savedSearches değişince localStorage'a yaz
  React.useEffect(() => {
    try {
      (typeof window !== "undefined" && localStorage).setItem('sbfc_scout_searches', JSON.stringify(savedSearches.slice(0, 20)));
    } catch { /* ignore */ }
  }, [savedSearches]);

  /** Arama filtrelerinden kısa bir etiket oluştur */
  const buildSearchLabel = (f: AdvancedFilters): string => {
    const parts: string[] = [];
    if (f.name) parts.push(`"${f.name}"`);
    if (f.position) parts.push(f.position);
    if (f.ageMin > 0 || f.ageMax > 0) parts.push(`${f.ageMin || 16}-${f.ageMax || 40} yaş`);
    if (f.ovrMin > 0) parts.push(`OVR≥${f.ovrMin}`);
    if (f.ovrMax > 0 && f.ovrMax < 99) parts.push(`OVR≤${f.ovrMax}`);
    if (f.archetypes.length > 0) parts.push(f.archetypes.slice(0, 2).join(', '));
    return parts.length > 0 ? parts.join(' • ') : 'Tüm Oyuncular';
  };
  
  // ── Watchlist: Supabase (via useFM) + localStorage fallback ──
  // GameContext'ten gelen watchlist Supabase'e kayıtlı.
  // Ama eğer GameContext'te watchlist boş gelirse, localStorage'dan oku.
  const [localWatchlist, setLocalWatchlist] = useState<string[]>(() => {
    if (watchlist && watchlist.length > 0) return watchlist;
    try {
      const saved = (typeof window !== "undefined" && localStorage).getItem('sbfc_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Supabase watchlist değişince localWatchlist'i güncelle
  React.useEffect(() => {
    if (watchlist && watchlist.length > 0) {
      setLocalWatchlist(watchlist);
    }
  }, [watchlist]);

  // localWatchlist değişince localStorage'a yaz
  React.useEffect(() => {
    try {
      (typeof window !== "undefined" && localStorage).setItem('sbfc_watchlist', JSON.stringify(localWatchlist));
    } catch { /* ignore */ }
  }, [localWatchlist]);

  // toggleWatchlist çağrılınca localWatchlist'i de güncelle
  const handleToggleWatchlist = React.useCallback(async (player: Player) => {
    await toggleWatchlist(player);
    setLocalWatchlist(prev => 
      prev.includes(player.id) ? prev.filter(id => id !== player.id) : [...prev, player.id]
    );
  }, [toggleWatchlist]);

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
        // staff tablosu user_id kullanır (profile_id değil)
        const { count } = await supabase
          .from('staff')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
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
      const activeWatchlist = localWatchlist.length > 0 ? localWatchlist : (watchlist || []);
      if (activeWatchlist.length > 0) {
        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          const { data } = await supabase.from('players').select('id,name,position,specific_position,rating,potential,age,market_value,team_name,profile_id,is_for_sale,is_free_agent,scouted,scouting_stars,scouting_count,form_rating,morale,cond,is_injured,injury,passing,shooting,defending,speed,power,vision,control,heading,goalkeeping,stamina,archetype,aggression,bravery,work_rate,workrate,decisions,determination,concentration,leadership,anticipation,flair,positioning,composure,teamwork,off_the_ball,acceleration,agility,balance,strength,jumping,finishing,dribbling,first_touch,crossing,marking,tackling,technique,long_shots,left_foot,right_foot,personality,traits,neg_traits,trait_levels,personality_traits').in('id', activeWatchlist);
          if (data && data.length > 0) {
            setWatchlistPlayers(data.map((p: Record<string, unknown>) => ({
              ...p,
              rating: (p.rating as number) ?? 60,
              potential: (p.potential as number) ?? 70,
              passing: (p.passing as number) ?? 50,
              shooting: (p.shooting as number) ?? 50,
              defending: (p.defending as number) ?? 50,
              speed: (p.speed as number) ?? 50,
              power: (p.power as number) ?? 50,
              vision: (p.vision as number) ?? 50,
              control: (p.control as number) ?? 50,
              // Zihinsel nitelikler
              aggression: (p.aggression as number) ?? 50,
              bravery: (p.bravery as number) ?? 50,
              workRate: (p.work_rate as number) ?? (p.workrate as number) ?? 50,
              decisions: (p.decisions as number) ?? 50,
              determination: (p.determination as number) ?? 50,
              concentration: (p.concentration as number) ?? 50,
              leadership: (p.leadership as number) ?? 50,
              anticipation: (p.anticipation as number) ?? 50,
              flair: (p.flair as number) ?? 50,
              positioning: (p.positioning as number) ?? 50,
              composure: (p.composure as number) ?? 50,
              teamwork: (p.teamwork as number) ?? 50,
              offTheBall: (p.off_the_ball as number) ?? 50,
              // Fiziksel nitelikler
              acceleration: (p.acceleration as number) ?? 50,
              agility: (p.agility as number) ?? 50,
              balance: (p.balance as number) ?? 50,
              strength: (p.strength as number) ?? 50,
              jumping: (p.jumping as number) ?? 50,
              leftFoot: (p.left_foot as number) ?? 50,
              rightFoot: (p.right_foot as number) ?? 50,
              // Teknik detay
              finishing: (p.finishing as number) ?? 50,
              dribbling: (p.dribbling as number) ?? 50,
              firstTouch: (p.first_touch as number) ?? 50,
              crossing: (p.crossing as number) ?? 50,
              marking: (p.marking as number) ?? 50,
              tackling: (p.tackling as number) ?? 50,
              technique: (p.technique as number) ?? 50,
              longShots: (p.long_shots as number) ?? 50,
              // Personality güvenli mapping
              negTraits: (p.neg_traits as string[]) || [],
              traitLevels: (p.trait_levels as Record<string, string>) || {},
              personalityTraits: (p.personality_traits as string[]) || [],
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
        const matching = uniquePool.filter(p => activeWatchlist.includes(p.id));
        setWatchlistPlayers(matching);
      } else {
        setWatchlistPlayers([]);
      }
    };
    fetchWatchlistDetails();
  }, [localWatchlist, watchlist, league, scouting.foundPlayersPool, scouting.history, advancedResults, scouting, squad]);

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
          .maybeSingle();
        
        if (teamData) {
          const { data: leagueData } = await supabase
            .from('leagues')
            .select('tier')
            .eq('id', teamData.league_id)
            .maybeSingle();
          
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
       toastWarning(`Bu gözlemciyi işe almak için ${minTier}. Lig'de olmalısınız! Şu an ${userTier}. Lig'desiniz.`);
       return;
    }

    if (!profile || profile.money < price) {
      toastWarning('Yetersiz bütçe!');
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

  const [diamondDiscovery, setDiamondDiscovery] = useState<{player: any; tier: 'diamond'|'elite'} | null>(null);

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
      // ── API Route ile arama (service_role key → RLS bypass) ──
      const res = await fetch('/api/scout/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          filters: {
            name: advancedFilters.name,
            position: advancedFilters.position,
            ageMin: advancedFilters.ageMin,
            ageMax: advancedFilters.ageMax,
            ovrMin: advancedFilters.ovrMin,
            ovrMax: advancedFilters.ovrMax,
            scoutLevel,
            Klt: advancedFilters.Klt,
            Klc: advancedFilters.Klc,
            Sav: advancedFilters.Sav,
            Pas: advancedFilters.Pas,
            Sut: advancedFilters.Sut,
            Kfa: advancedFilters.Kfa,
            Hiz: advancedFilters.Hiz,
            Guc: advancedFilters.Guc,
            Alg: advancedFilters.Alg,
            Top: advancedFilters.Top,
            Tplm: advancedFilters.Tplm,
            rarity: advancedFilters.rarity,
            archetypes: advancedFilters.archetypes,
          },
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        const errMsg = result?.error || result?.details || `HTTP ${res.status}`;
        setSearchError('Arama hatası: ' + errMsg);
        return;
      }

      const players = (result.players || []) as Record<string, unknown>[];

      if (players.length === 0) {
        setAdvancedResults([]);
        setSearchError(result.total > 0
          ? 'Kriterlerinize uygun oyuncu bulunamadı. Filtre değerlerini düşürmeyi deneyin.'
          : 'Hiç oyuncu bulunamadı. Filtrelerinizi genişletmeyi deneyin.');
        return;
      }

      // API'den gelen veriyi Player tipine dönüştür
      // API artık tüm nitelikleri (zihinsel, fiziksel, teknik) açıkça döndürüyor
      // ve camelCase ↔ snake_case çift anahtarlarını içeriyor.
      // Yine de güvenlik için eksik alanlar için fallback tutuyoruz.
      const mappedResults = players.map(p => {
        const resolvedTeamName = (p.team_name as string) || 'Serbest';

        // personality JSONB objesini güvenli şekilde işle — React child olarak render edilmesini önle
        const rawPersonality = p.personality;
        let safePersonality: { ambition: number; professionalism: number; temperament: number; loyalty: number; pressure_handling: number } | undefined;
        if (rawPersonality && typeof rawPersonality === 'object') {
          const pObj = rawPersonality as Record<string, unknown>;
          if ('ambition' in pObj || 'pressure_handling' in pObj) {
            safePersonality = {
              ambition: (pObj.ambition as number) ?? 10,
              professionalism: (pObj.professionalism as number) ?? 10,
              temperament: (pObj.temperament as number) ?? 10,
              loyalty: (pObj.loyalty as number) ?? 10,
              pressure_handling: (pObj.pressure_handling as number) ?? 10,
            };
          }
        }

        return {
          ...p,
          personality: safePersonality,
          scouted: true,
          team_name: resolvedTeamName,
          negTraits: (p.negTraits as string[]) || (p.neg_traits as string[]) || [],
          traitLevels: (p.traitLevels as Record<string, string>) || (p.trait_levels as Record<string, string>) || {},
          styleLevels: (p.styleLevels as Record<string, number>) || (p.style_levels as Record<string, number>) || {},
          personalityTraits: (p.personalityTraits as string[]) || (p.personality_traits as string[]) || [],
          // Zihinsel nitelikler — API artık camelCase ve snake_case olarak döndürüyor
          // Güvenlik fallback: eksikse API'nin snake_case'den maple
          aggression: (p.aggression as number) ?? 50,
          bravery: (p.bravery as number) ?? 50,
          workRate: (p.workRate as number) ?? (p.work_rate as number) ?? 50,
          decisions: (p.decisions as number) ?? 50,
          determination: (p.determination as number) ?? 50,
          concentration: (p.concentration as number) ?? 50,
          leadership: (p.leadership as number) ?? 50,
          anticipation: (p.anticipation as number) ?? 50,
          flair: (p.flair as number) ?? 50,
          positioning: (p.positioning as number) ?? 50,
          composure: (p.composure as number) ?? 50,
          teamwork: (p.teamwork as number) ?? 50,
          offTheBall: (p.offTheBall as number) ?? (p.off_the_ball as number) ?? 50,
          // Fiziksel nitelikler
          acceleration: (p.acceleration as number) ?? 50,
          agility: (p.agility as number) ?? 50,
          balance: (p.balance as number) ?? 50,
          strength: (p.strength as number) ?? 50,
          jumping: (p.jumping as number) ?? 50,
          leftFoot: (p.leftFoot as number) ?? (p.left_foot as number) ?? 50,
          rightFoot: (p.rightFoot as number) ?? (p.right_foot as number) ?? 50,
          // Teknik detay
          finishing: (p.finishing as number) ?? 50,
          dribbling: (p.dribbling as number) ?? 50,
          firstTouch: (p.firstTouch as number) ?? (p.first_touch as number) ?? 50,
          crossing: (p.crossing as number) ?? 50,
          marking: (p.marking as number) ?? 50,
          tackling: (p.tackling as number) ?? 50,
          technique: (p.technique as number) ?? 50,
          longShots: (p.longShots as number) ?? (p.long_shots as number) ?? 50,
          stamina: (p.stamina as number) ?? 50,
        } as unknown as Player;
      });

      setAdvancedResults(mappedResults);

      // Gizli yetenek keşif kontrolü
      if (mappedResults && mappedResults.length > 0) {
        for (const p of mappedResults) {
          const scoutedOvr = p.rating || 0;
          const hiddenPot = p.potential || 0;
          const isElite = hiddenPot >= 85 && scoutedOvr < 72;
          const isDiamond = hiddenPot >= 78 && scoutedOvr < 65;
          if (isDiamond || isElite) {
            setDiamondDiscovery({ player: p, tier: isDiamond ? 'diamond' : 'elite' });
            break;
          }
        }
      }

      // ── Aramayı geçmişe kaydet ──
      const searchRecord: SavedSearch = {
        id: Date.now().toString(36),
        label: buildSearchLabel(advancedFilters),
        filters: { ...advancedFilters },
        results: mappedResults,
        resultCount: mappedResults.length,
        timestamp: Date.now(),
      };
      setSavedSearches(prev => [searchRecord, ...prev].slice(0, 20));
    } catch (e) {
      console.error('Advanced Search Error:', e);
      const errMsg = e instanceof Error ? e.message : String(e);
      setSearchError('Arama sırasında bir hata oluştu: ' + errMsg);
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
      className="space-y-3 sm:space-y-4 pb-16"
    >
      {/* ── Header (kompakt) ── */}
      <div className="flex items-center justify-between gap-2 bg-white/5 p-3 sm:p-4 rounded-2xl border border-white/5">
        <div className="min-w-0">
          <h2 className="text-base sm:text-xl font-black italic uppercase tracking-tighter text-white truncate">Gözlemcilik Ağı</h2>
          <p className="text-[8px] sm:text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] sm:tracking-[0.4em] mt-0.5">Yetenek Avı</p>
        </div>
        <div className="flex gap-1.5 sm:gap-2 shrink-0">
           <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-black/40 border border-white/10 rounded-lg">
             <span className="text-[8px] font-black text-white/20 uppercase block leading-none mb-0.5">Bütçe</span>
             <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400 leading-none">
               €{((profile?.money || 0) / 1000000).toFixed(1)}M
             </span>
           </div>
           <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-black/40 border border-white/10 rounded-lg">
             <span className="text-[8px] font-black text-white/20 uppercase block leading-none mb-0.5">Gözlemci</span>
             <span className={`text-[10px] sm:text-xs font-mono font-bold leading-none ${activeScoutSlots > 0 ? 'text-amber-400' : 'text-red-400'}`}>
               {activeScoutSlots}/3
             </span>
           </div>
        </div>
      </div>

      {/* ── WARNING: No Scout Slots (kompakt) ── */}
      {activeScoutSlots < 1 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0">
            <Ban size={16} className="text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-red-400">Gözlemci Yok</h3>
            <p className="text-[9px] sm:text-[10px] text-red-300/70 leading-tight mt-0.5">
              Yerleşke {'>'} Personel'den gözlemci satın al.
            </p>
            <button 
              onClick={() => setActiveTab('stadium')}
              className="inline-flex items-center gap-1 mt-1.5 px-2 py-1 bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-md hover:bg-red-500/30 transition-all"
            >
              <Users size={10} />
              Yerleşke'ye Git
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Scout Level Indicator (kompakt) ── */}
      {activeScoutSlots > 0 && (
        <div className="bg-white/5 border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-white/40 shrink-0" />
            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-white/70 truncate">Arama Yetkinliği</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((level) => {
              const info = SCOUT_LEVEL_INFO[level];
              const isActive = scoutLevel >= level;
              return (
                <div 
                  key={level}
                  className={`p-2 sm:p-3 rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-amber-500/10 border-amber-500/20' 
                      : 'bg-white/[0.02] border-white/5 opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`text-sm sm:text-base font-black ${isActive ? 'text-amber-400' : 'text-white/20'}`}>{level}</span>
                    <div className="flex gap-0.5">
                      {[...Array(level)].map((_, i) => (
                        <Star key={i} size={6} className={isActive ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />
                      ))}
                    </div>
                    {!isActive && <Lock size={9} className="text-white/20 ml-auto" />}
                  </div>
                  <p className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${isActive ? info.color : 'text-white/20'} truncate`}>
                    {info.label}
                  </p>
                  <p className="hidden sm:block text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
                    {info.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scouts Overview (kompakt) */}
      <details className="group" open={activeScoutSlots > 0}>
        <summary className="cursor-pointer flex items-center gap-2 sm:gap-3 bg-white/5 border border-white/5 rounded-xl px-3 py-2 sm:py-3 hover:bg-white/[0.07] transition-all list-none">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Users className="text-white/40 shrink-0" size={14} />
            <div className="min-w-0">
              <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-white/70 truncate">Gözlemci Slotları</h3>
              <p className="text-[8px] sm:text-[9px] font-bold text-white/20 uppercase tracking-widest truncate">
                {activeScoutSlots > 0 
                  ? `${activeScoutSlots}/3 aktif — Seviye ${scoutLevel} arama` 
                  : 'Gözlemci yok — Arama devre dışı'}
              </p>
            </div>
          </div>
          <ChevronRight size={12} className="text-white/20 group-open:rotate-90 transition-transform shrink-0" />
        </summary>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
          {scouting.scouts.length > 0 ? scouting.scouts.map((scout: Scout) => (
              <div key={scout.id} className="bg-white/5 border border-white/5 rounded-xl p-3 relative overflow-hidden flex flex-col min-h-[100px]">
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black italic uppercase tracking-tighter text-white truncate">{scout.name}</h3>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(scout.stars)].map((_, i) => (
                        <Star key={i} size={8} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <div className={`px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shrink-0 ${
                    scout.status === 'IDLE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500 animate-pulse'
                  }`}>
                    {scout.status === 'IDLE' ? 'BOŞTA' : 'GÖREVDE'}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  {scout.status === 'IDLE' ? (
                    <div className="text-center space-y-1 opacity-40">
                      <Activity className="mx-auto" size={14} />
                      <p className="text-[8px] font-black uppercase tracking-widest">Görev bekliyor</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-1.5">
                      <MapIcon className="mx-auto text-amber-500/40" size={18} />
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/40 truncate">{scout.location}</p>
                        <p className="text-xs sm:text-sm font-mono font-bold text-white tracking-widest">{scout.remainingDays} GÜN</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
          )) : (
            <div className="col-span-full text-center py-6 text-white/30">
              <Users size={20} className="mx-auto mb-2 opacity-40" />
              <p className="text-[9px] font-black uppercase tracking-widest">Henüz gözlemci yok — Personel sekmesinden işe alabilirsiniz</p>
            </div>
          )}
        </div>
      </details>

      {/* ── Advanced Attribute Search (kompakt) ── */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-3 sm:p-4 overflow-hidden relative shadow-2xl">
         <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2">
            <div className="min-w-0">
               <h3 className="text-sm sm:text-base font-black italic uppercase tracking-tighter text-white truncate">Advanced Search & Keşif Merkezi</h3>
               <p className="hidden sm:block text-[9px] font-bold text-white/30 uppercase tracking-[0.4em] mt-1">Oyuncu Özelliklerine Göre Detaylı Arama</p>
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shrink-0 ${
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
                   <Ban size={10} className="text-red-500" />
                   <span className="text-[8px] sm:text-[10px] font-black text-red-500">GÖZLEMCİ GEREKLİ</span>
                 </>
               ) : (
                 <>
                   <Database size={10} className={scoutLevel === 3 ? 'text-emerald-500' : 'text-amber-500'} />
                   <span className={`text-[8px] sm:text-[10px] font-black ${scoutLevel === 3 ? 'text-emerald-500' : 'text-amber-500'}`}>
                     SEVİYE {scoutLevel}
                   </span>
                 </>
               )}
            </div>
         </div>

         {/* ── LEVEL 1: Basic Filters (always visible when scout >= 1) ── */}
         <div className="space-y-2 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/10 rounded-md flex items-center justify-center shrink-0">
                  <span className="text-[8px] sm:text-[9px] font-black text-white">1</span>
               </div>
               <span className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest truncate">Temel Arama — İsim, Pozisyon, Yaş</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
               <div className="col-span-2 space-y-1">
                   <label className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">Oyuncu İsmi</label>
                   <input 
                     type="text"
                     value={advancedFilters.name || ''}
                     onChange={(e) => setAdvancedFilters({ ...advancedFilters, name: e.target.value })}
                     placeholder="İsim ile ara..."
                     disabled={activeScoutSlots < 1}
                     className="w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-[10px] sm:text-xs font-mono text-white focus:border-amber-500 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                   />
               </div>
               <div className="space-y-1">
                   <label className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">Pozisyon</label>
                   <select
                     value={advancedFilters.position}
                     onChange={(e) => setAdvancedFilters({ ...advancedFilters, position: e.target.value })}
                     disabled={activeScoutSlots < 1}
                     className="w-full bg-zinc-800 border border-white/10 rounded-md px-2.5 py-1.5 text-[10px] sm:text-xs font-mono text-gray-200 focus:border-amber-500 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                   >
                     <option value="" className="bg-zinc-800 text-gray-200">Tümü</option>
                     <option value="GK" className="bg-zinc-800 text-gray-200">Kaleci (GK)</option>
                     <option value="DEF" className="bg-zinc-800 text-gray-200">Defans (DEF)</option>
                     <option value="MID" className="bg-zinc-800 text-gray-200">Orta Saha (MID)</option>
                     <option value="FWD" className="bg-zinc-800 text-gray-200">Forvet (FWD)</option>
                   </select>
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1">
                     <label className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">Min Yaş</label>
                     <input 
                       type="number"
                       value={advancedFilters.ageMin || ''}
                       onChange={(e) => setAdvancedFilters({ ...advancedFilters, ageMin: parseInt(e.target.value) || 0 })}
                       placeholder="16"
                       disabled={activeScoutSlots < 1}
                       className="w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-[10px] sm:text-xs font-mono text-white focus:border-amber-500 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                     />
                 </div>
                 <div className="space-y-1">
                     <label className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">Max Yaş</label>
                     <input 
                       type="number"
                       value={advancedFilters.ageMax || ''}
                       onChange={(e) => setAdvancedFilters({ ...advancedFilters, ageMax: parseInt(e.target.value) || 0 })}
                       placeholder="40"
                       disabled={activeScoutSlots < 1}
                       className="w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-[10px] sm:text-xs font-mono text-white focus:border-amber-500 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                     />
                 </div>
               </div>
            </div>
         </div>

         {/* ── LEVEL 2: OVR Range + Rarity + Stats (requires 2+ scouts) ── */}
         <div className={`space-y-2 mb-3 sm:mb-4 ${scoutLevel < 2 ? 'opacity-30 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
               <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center shrink-0 ${scoutLevel >= 2 ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                  <span className={`text-[8px] sm:text-[9px] font-black ${scoutLevel >= 2 ? 'text-amber-400' : 'text-white/30'}`}>2</span>
               </div>
               <span className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest truncate">Genişletilmiş — OVR, Nadirlik, İstatikler</span>
               {scoutLevel < 2 && <Lock size={9} className="text-white/20 ml-1 shrink-0" />}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
               <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1">
                     <label className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">Min OVR</label>
                     <input 
                       type="number"
                       value={advancedFilters.ovrMin || ''}
                       onChange={(e) => setAdvancedFilters({ ...advancedFilters, ovrMin: parseInt(e.target.value) || 0 })}
                       placeholder="0"
                       className="w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-[10px] sm:text-xs font-mono text-white focus:border-amber-500 outline-none transition-all"
                     />
                 </div>
                 <div className="space-y-1">
                     <label className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">Max OVR</label>
                     <input 
                       type="number"
                       value={advancedFilters.ovrMax || ''}
                       onChange={(e) => setAdvancedFilters({ ...advancedFilters, ovrMax: parseInt(e.target.value) || 0 })}
                       placeholder="99"
                       className="w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-[10px] sm:text-xs font-mono text-white focus:border-amber-500 outline-none transition-all"
                     />
                 </div>
               </div>
               <div className="space-y-1">
                   <label className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">Nadirlik</label>
                   <select
                     value={advancedFilters.rarity}
                     onChange={(e) => setAdvancedFilters({ ...advancedFilters, rarity: e.target.value })}
                     className="w-full bg-zinc-800 border border-white/10 rounded-md px-2.5 py-1.5 text-[10px] sm:text-xs font-mono text-gray-200 focus:border-amber-500 outline-none transition-all"
                   >
                     <option value="all" className="bg-zinc-800 text-gray-200">Tümü</option>
                     <option value="common" className="bg-zinc-800 text-gray-200">Yaygın (0-64)</option>
                     <option value="uncommon" className="bg-zinc-800 text-gray-200">Sıra Dışı (65-74)</option>
                     <option value="rare" className="bg-zinc-800 text-gray-200">Nadir (75-84)</option>
                     <option value="epic" className="bg-zinc-800 text-gray-200">Epik (85-89)</option>
                     <option value="legendary" className="bg-zinc-800 text-gray-200">Efsanevi (90+)</option>
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
                 <div key={attr.id} className="space-y-1">
                   <label className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">{attr.label}</label>
                   <input 
                     type="number"
                     value={advancedFilters[attr.id] || ''}
                     onChange={(e) => setAdvancedFilters({ ...advancedFilters, [attr.id]: parseInt(e.target.value) || 0 })}
                     placeholder="Min"
                     className="w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-[10px] sm:text-xs font-mono text-white focus:border-amber-500 outline-none transition-all"
                   />
                 </div>
               ))}
            </div>
         </div>

         {/* ── LEVEL 3: Archetype, Skills, Potential (requires 3+ scouts) ── */}
         <div className={`space-y-2 mb-4 sm:mb-6 ${scoutLevel < 3 ? 'opacity-30 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
               <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center shrink-0 ${scoutLevel >= 3 ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                  <span className={`text-[8px] sm:text-[9px] font-black ${scoutLevel >= 3 ? 'text-emerald-400' : 'text-white/30'}`}>3</span>
               </div>
               <span className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest truncate">Detaylı — Arketip, Yetenekler</span>
               {scoutLevel < 3 && <Lock size={9} className="text-white/20 ml-1 shrink-0" />}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
               <ArchetypeMultiSelect
                 selected={advancedFilters.archetypes}
                 onChange={(val) => setAdvancedFilters({ ...advancedFilters, archetypes: val })}
                 scoutLevel={scoutLevel}
               />
            </div>
         </div>

         {/* ── Search Button (kompakt) ── */}
         <div className="flex items-end gap-2 sm:gap-3 mb-4 sm:mb-6">
            <button 
              onClick={handleAdvancedSearch}
              disabled={isSearching || activeScoutSlots < 1}
              className={`min-h-[40px] px-4 sm:px-6 py-2 sm:py-2.5 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shrink-0 ${
                activeScoutSlots < 1 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed' 
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50'
              }`}
            >
              {isSearching ? <Activity size={12} className="animate-spin" /> : <Search size={12} />}
              {activeScoutSlots < 1 ? 'GÖZLEMCİ GEREKLİ' : 'ARA'}
            </button>
            <button 
              onClick={() => { setAdvancedFilters(getDefaultFilters()); setAdvancedResults([]); setSearchError(''); }}
              className="min-h-[40px] px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 text-white/30 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all shrink-0"
            >
              SIFIRLA
            </button>
         </div>

         {/* ── Arama Hata Mesajı (kompakt) ── */}
         {searchError && (
           <div className="bg-red-500/10 border border-red-500/20 p-2.5 sm:p-3 rounded-lg flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
             <AlertCircle className="text-red-400 shrink-0" size={14} />
             <p className="text-[9px] sm:text-[10px] font-bold text-red-300 uppercase tracking-widest min-w-0 flex-1">{searchError}</p>
             <button onClick={() => setSearchError('')} className="ml-auto text-white/30 hover:text-white shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center">
               <X size={12} />
             </button>
           </div>
         )}

         {advancedResults.length > 0 && (
           <div className="animate-in fade-in slide-in-from-top-4 space-y-2 sm:space-y-3">
             <div className="flex items-center gap-2 border-b border-white/5 pb-2 sm:pb-3">
                <span className="text-[9px] sm:text-[10px] font-black text-white/20 uppercase tracking-widest truncate">BULUNAN SONUÇLAR ({advancedResults.length})</span>
                <button 
                  onClick={() => { setAdvancedResults([]); setSearchError(''); }}
                  className="ml-auto text-[8px] font-black text-white/20 hover:text-white uppercase shrink-0"
                >
                  TEMİZLE
                </button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
               {advancedResults.map((p) => {
                 const rarity = getRarityFromRating(p.klt || p.rating);
                 const playerTraits = (Array.isArray(p.traits) ? p.traits : []) as string[];
                 const playerNegTraits = (Array.isArray(p.negTraits) ? p.negTraits : []) as string[];
                 const playerTraitLevels = (p.traitLevels || {}) as Record<string, string>;
                 return (
                   <div 
                     key={p.id}
                     className="bg-white/5 border border-white/5 p-2.5 sm:p-3 rounded-xl group hover:bg-white/10 transition-all cursor-pointer"
                     onClick={() => onPlayerClick?.(p)}
                   >
                     <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
                       <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black italic shrink-0">
                            {p.klt || p.rating}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-black uppercase italic leading-none mb-1 group-hover:text-amber-400 transition-colors truncate">{(p && p.name) || 'Bilinmeyen'}</p>
                            <p className="text-[7px] sm:text-[8px] font-black text-white/30 uppercase tracking-widest truncate">{getPlayerPos(p as Record<string, unknown>)} • {p.age} YAŞ</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-1 shrink-0 flex-col items-end">
                         {scoutLevel >= 2 && (
                           <span className={`text-[7px] font-black uppercase ${rarity.color}`}>{rarity.label}</span>
                         )}
                         <p className="text-[7px] font-bold text-emerald-400/60 uppercase tracking-widest truncate max-w-[80px]">{p.team_name || 'SERBEST'}</p>
                       </div>
                     </div>
                     {/* Arketip ve Özellikler */}
                     {scoutLevel >= 3 && (
                       <div className="flex flex-wrap gap-1 mb-2">
                         {p.archetype && (
                           <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-300 text-[7px] font-black uppercase tracking-wider rounded border border-amber-500/20">
                             {p.archetype}
                           </span>
                         )}
                         {playerTraits.filter(t => t !== p.archetype).map((t) => {
                           const lvl = playerTraitLevels[t] || 'BEYAZ';
                           const lvlColor = lvl === 'MOR' ? 'bg-purple-500/15 text-purple-300 border-purple-500/20' :
                                            lvl === 'ALTIN' ? 'bg-amber-500/15 text-amber-300 border-amber-500/20' :
                                            lvl === 'LACIVERT' ? 'bg-blue-500/15 text-blue-300 border-blue-500/20' :
                                            'bg-white/5 text-white/50 border-white/10';
                           return (
                             <span key={t} className={`px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider rounded border ${lvlColor}`}>
                               {t}
                             </span>
                           );
                         })}
                         {playerNegTraits.map((t) => (
                           <span key={t} className="px-1.5 py-0.5 bg-red-500/10 text-red-400/80 text-[7px] font-bold uppercase tracking-wider rounded border border-red-500/15">
                             {t}
                           </span>
                         ))}
                       </div>
                     )}
                     <div className="flex items-center justify-between gap-2">
                       <div className="grid grid-cols-3 gap-1.5">
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
                       <button
                         onClick={async (e) => {
                           e.stopPropagation();
                           if (!profile?.id) return;
                           try {
                             const supabase = getSupabase();
                             if (!supabase) return;
                             await supabase.from('scouted_players').upsert({
                               profile_id: profile.id,
                               player_id: p.id,
                               player_name: p.name,
                               position: p.position,
                               rating: p.rating,
                               potential: (p as any).potential,
                               discovered_at: new Date().toISOString(),
                             });
                           } catch (err) {
                             console.warn('Keşfet kaydı başarısız:', err);
                           }
                         }}
                         className="min-h-[36px] px-2 py-1 bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-md hover:bg-amber-500/30 transition-all shrink-0"
                       >
                         Keşfet
                       </button>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
         )}

         {/* ── Sonuç yok + hata yok = İlk kullanım ipucu (kompakt) ── */}
         {advancedResults.length === 0 && !searchError && !isSearching && (
           <div className="py-6 sm:py-12 text-center">
             <Search className="mx-auto text-white/10 mb-2 sm:mb-3" size={24} />
             <p className="text-[9px] sm:text-[10px] font-bold text-white/20 uppercase tracking-widest">Filtreleri ayarlayın ve ARA butonuna tıklayın</p>
             <p className="text-[8px] sm:text-[9px] text-white/10 mt-1 uppercase">
               {activeScoutSlots < 1 
                 ? 'Arama için en az 1 gözlemci gereklidir' 
                 : `Seviye ${scoutLevel} arama aktif — ${SCOUT_LEVEL_INFO[scoutLevel].desc}`}
             </p>
           </div>
         )}
      </div>

      {/* Discovered Players Pool (kompakt) */}
      {scouting.foundPlayersPool.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Target className="text-red-500 shrink-0" size={16} />
            <h3 className="text-sm sm:text-base font-black italic uppercase tracking-tighter text-white truncate">BULUNAN OYUNCULAR</h3>
            <div className="flex-1 border-b border-white/10" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {scouting.foundPlayersPool.map((p: Player) => (
              <motion.div 
                layout
                key={p.id}
                className="bg-white/5 border border-white/5 rounded-xl p-3 group hover:border-white/20 transition-all relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                   <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shrink-0">
                     <span className="text-black text-[10px] sm:text-xs font-black italic">{p.rating}</span>
                   </div>
                   <span className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] font-black text-white/40 shrink-0">{p.position}</span>
                </div>
                <h4 className="text-[10px] sm:text-xs font-black uppercase italic text-white mb-2 sm:mb-3 line-clamp-1">{p.name || 'Bilinmeyen'}</h4>
                <div className="flex gap-1.5 sm:gap-2">
                   <button 
                     onClick={() => handleToggleWatchlist(p as unknown as Player)}
                     className={`min-w-[36px] min-h-[36px] p-2 border rounded-lg sm:rounded-xl transition-all shrink-0 flex items-center justify-center ${localWatchlist?.includes(p.id as string) ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white hover:text-black'}`}
                     title="İzleme Listesine Ekle"
                   >
                     <Eye size={12} />
                   </button>
                   <button 
                     onClick={() => handleDismissPlayer(p.id as string)}
                     className="min-h-[36px] flex-1 py-1.5 sm:py-2 bg-white/5 border border-white/5 rounded-lg sm:rounded-xl text-[8px] font-black uppercase text-white/40 hover:bg-red-500/20 hover:text-red-500 transition-all"
                   >
                     REDDET
                   </button>
                   <button 
                     onClick={() => onPlayerClick?.(p as unknown as Player)}
                     className="min-h-[36px] flex-1 py-1.5 sm:py-2 bg-emerald-500 text-black text-[8px] font-black uppercase rounded-lg sm:rounded-xl hover:scale-105 transition-all"
                   >
                     TEKLİF YAP
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* History & Watchlist Section (kompakt) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Saved Search History */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 sm:p-4">
           <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
             <div className="flex items-center gap-2 min-w-0">
                <History className="text-white/40 shrink-0" size={16} />
                <h3 className="text-sm sm:text-base font-black italic uppercase tracking-tighter text-white truncate">Kayıtlı Aramalar</h3>
             </div>
             <div className="flex items-center gap-2 shrink-0">
               <span className="text-[8px] sm:text-[9px] font-black text-white/20 uppercase tracking-widest">{savedSearches.length} KAYIT</span>
               {savedSearches.length > 0 && (
                 <button
                   onClick={() => { setSavedSearches([]); try { (typeof window !== "undefined" && localStorage).removeItem('sbfc_scout_searches'); } catch (e) { console.warn("[silent-catch]", e); } }}
                   className="text-[8px] font-bold text-red-400/50 hover:text-red-400 uppercase tracking-widest min-h-[36px] px-1"
                 >
                   Temizle
                 </button>
               )}
             </div>
           </div>
           
           <div className="space-y-1.5 sm:space-y-2 max-h-[300px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
             {savedSearches.map((search) => (
               <div key={search.id} className="p-2 sm:p-3 bg-white/[0.02] border border-white/5 rounded-lg sm:rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                 onClick={() => {
                   setAdvancedFilters(search.filters);
                   if (search.results && search.results.length > 0) {
                     setAdvancedResults(search.results);
                   }
                 }}
               >
                 <div className="flex items-center justify-between gap-2">
                   <div className="flex-1 min-w-0">
                     <p className="text-[10px] font-black uppercase italic text-white/60 group-hover:text-amber-400 transition-colors truncate">{search.label}</p>
                     <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-[8px] font-bold text-emerald-400/60 uppercase tracking-widest">{search.resultCount} oyuncu</span>
                       <span className="text-[8px] font-bold text-white/15 uppercase tracking-widest truncate">
                         {new Date(search.timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                       </span>
                     </div>
                   </div>
                   <div className="flex items-center gap-1 shrink-0">
                     <button
                       onClick={(e) => { e.stopPropagation(); setSavedSearches(prev => prev.filter(s => s.id !== search.id)); }}
                       className="min-w-[36px] min-h-[36px] p-1 text-white/10 hover:text-red-400 transition-colors flex items-center justify-center"
                     >
                       <X size={12} />
                     </button>
                     <ChevronRight size={12} className="text-white/10 group-hover:text-white/40 transition-colors" />
                   </div>
                 </div>
               </div>
             ))}
             {savedSearches.length === 0 && (
               <div className="py-8 text-center text-white/10 italic text-[9px] sm:text-[10px] uppercase tracking-widest">
                 Henüz kayıtlı arama bulunmuyor. Arama yapınca otomatik kaydedilir.
               </div>
             )}
           </div>
        </div>

        {/* Watchlist */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 sm:p-4">
           <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
             <div className="flex items-center gap-2 min-w-0">
                <Eye className="text-amber-500 shrink-0" size={16} />
                <h3 className="text-sm sm:text-base font-black italic uppercase tracking-tighter text-white truncate">İzleme Listesi</h3>
             </div>
             <span className="text-[8px] sm:text-[9px] font-black text-white/20 uppercase tracking-widest shrink-0">{watchlistPlayers.length} OYUNCU</span>
           </div>

           <div className="space-y-1.5 sm:space-y-2 max-h-[300px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
             {(watchlistPlayers || []).map((p: Player) => (
               <div key={p.id} className="flex items-center justify-between p-2 sm:p-3 bg-white/[0.02] border border-white/5 rounded-lg sm:rounded-xl group hover:border-amber-500/20 transition-all gap-2">
                 <div className="flex items-center gap-2 min-w-0 flex-1">
                   <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-500/10 flex items-center justify-center text-[9px] sm:text-[10px] font-black italic text-amber-500 shrink-0">
                     {p.rating}
                   </div>
                   <div className="min-w-0">
                     <p className="text-[10px] font-black uppercase italic text-white truncate">{p.name || 'Bilinmeyen'}</p>
                     <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest truncate">{getPlayerPos(p as Record<string, unknown>)} • {p.age} Yaş</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => onPlayerClick?.(p)}
                      className="min-w-[36px] min-h-[36px] p-2 text-white/20 hover:text-white transition-colors flex items-center justify-center"
                    >
                      <Zap size={12} />
                    </button>
                    <button 
                      onClick={() => handleToggleWatchlist(p)}
                      className="min-w-[36px] min-h-[36px] p-2 text-white/10 hover:text-red-500 transition-colors flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                 </div>
               </div>
             ))}
             {watchlistPlayers.length === 0 && (
               <div className="py-8 text-center text-white/10 italic text-[9px] sm:text-[10px] uppercase tracking-widest">
                 İzleme listesi boş.
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Recycle Modal (HIRING) — kompakt */}
      <AnimatePresence>
        {showRecruitModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 backdrop-blur-xl bg-black/80"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-5 pointer-events-none">
                <Users size={80} />
              </div>

              <div className="mb-4 sm:mb-6 relative">
                <h3 className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter text-white truncate">GÖZLEMCİ İŞE AL</h3>
                <p className="text-[8px] sm:text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-1 sm:mt-2">Ağına Yeni Bir Uzman Kat</p>
              </div>

              <div className="space-y-2 sm:space-y-3 relative">
                {scoutPrices.map(s => (
                  <button 
                    key={s.stars}
                    onClick={() => handleHireScout(s.stars, s.price, s.minTier)}
                    disabled={userTier > s.minTier}
                    className={`w-full flex items-center justify-between p-2.5 sm:p-3 border rounded-lg sm:rounded-xl transition-all group ${userTier > s.minTier ? 'opacity-40 cursor-not-allowed bg-black/40 border-white/5' : 'bg-white/5 border-white/5 hover:bg-white hover:text-black'}`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                       <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-black/10 shrink-0">
                         <span className="text-sm sm:text-base">{s.stars}★</span>
                       </div>
                       <div className="text-left min-w-0">
                         <p className="text-[10px] sm:text-xs font-black uppercase truncate">{s.name}</p>
                         <div className="flex gap-0.5">
                           {[...Array(5)].map((_, i) => (
                             <Star key={i} size={7} className={i < s.stars ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />
                           ))}
                         </div>
                       </div>
                    </div>
                    <div className="text-right shrink-0">
                       <div className="mb-0.5 sm:mb-1">
                         <p className="text-[7px] font-black uppercase text-white/40 group-hover:text-black/40">GEREKLİ LİG</p>
                         <p className={`text-[9px] font-black ${userTier <= s.minTier ? 'text-emerald-500' : 'text-red-500'}`}>{s.minTier}. LİG</p>
                       </div>
                       <p className="text-[8px] font-black uppercase text-white/40 group-hover:text-black/40">MALİYET</p>
                       <p className="font-mono font-bold text-[10px] sm:text-xs">${s.price.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setShowRecruitModal(false)}
                className="w-full mt-4 sm:mt-6 min-h-[40px] py-2 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase text-white/20 hover:text-white transition-colors"
              >
                İPTAL ET
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gizli Yetenek Keşif Overlay */}
      {diamondDiscovery && (
        <motion.div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          initial={{ opacity:0 }} animate={{ opacity:1 }}
          onClick={() => setDiamondDiscovery(null)}
        >
          <motion.div
            initial={{ scale:0.5, opacity:0, rotate:-10 }}
            animate={{ scale:1, opacity:1, rotate:0 }}
            transition={{ type:'spring', stiffness:300, damping:20 }}
            className="bg-gradient-to-br from-amber-500/20 to-emerald-500/10 border border-amber-400/40 rounded-3xl p-8 text-center max-w-xs mx-4"
            onClick={e => e.stopPropagation()}
          >
            <motion.p className="text-6xl mb-4"
              animate={{ scale:[1,1.3,1], rotate:[0,15,-15,0] }}
              transition={{ duration:1, repeat:2 }}
            >
              {diamondDiscovery.tier === 'diamond' ? '💎' : '⭐'}
            </motion.p>
            <p className="text-[10px] uppercase tracking-widest font-black text-amber-400 mb-2">
              {diamondDiscovery.tier === 'diamond' ? 'GİZLİ ELMAS KEŞFEDİLDİ!' : 'YÜKSEK YETENEK!'}
            </p>
            <h2 className="text-xl font-black text-white mb-1">
              {diamondDiscovery.player.name?.split(' ').pop()}
            </h2>
            <p className="text-white/50 text-sm mb-4">
              {diamondDiscovery.player.age} yaş · Mevcut OVR: {Math.round(diamondDiscovery.player.rating || 0)}
            </p>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
              <p className="text-amber-400 font-black text-lg">
                Gerçek Potansiyel: {diamondDiscovery.player.potential}
              </p>
              <p className="text-white/30 text-[10px]">Senden önce kimse bilmiyordu.</p>
            </div>
            <button
              onClick={() => setDiamondDiscovery(null)}
              className="w-full py-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 font-black text-sm"
            >
              Kadroma Al →
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
});
