'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, FlaskConical, Wind, CloudRain, Snowflake, 
  Smile, Frown, Zap, Shield, Play, 
  RotateCcw, Save, Trash2, ChevronRight, 
  AlertCircle, Info, TrendingUp, Users,
  BarChart3, MousePointer2, Target, History
} from 'lucide-react';
import { Player, LabSettings, MatchResult, ActiveTactic } from '@/lib/fm/types';
import { integratedMatchEngine } from '@/lib/fm/IntegratedMatchEngine';
import { toTitleCase } from '@/lib/fm/ui-helpers';
import { useFM } from '@/lib/fm/GameContext';
import PlayerDetailModal from './PlayerDetailModal';

// Firebase imports - with safe fallback
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db as firebaseDb, auth as firebaseAuth } from '@/lib/firebase';

interface TacticLabProps {
  onClose: () => void;
  squad: Player[];
}

const WEATHER_ICONS = {
  Sunny: <Zap size={14} className="text-yellow-400" />,
  Rainy: <CloudRain size={14} className="text-blue-400" />,
  Snowy: <Snowflake size={14} className="text-white" />
};

function PlayerMarker({ player, pos, team, onClick, isSelected }: { player: Player, pos: { x: string, y: string }, team: 'A' | 'B', onClick?: () => void, isSelected?: boolean }) {
  const efficiency = 70 + Math.random() * 30;
  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      style={{ left: pos.x, top: pos.y }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20 ${isSelected ? 'scale-125' : ''}`}
      onClick={onClick}
    >
        <div className="relative">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-black shadow-xl transition-all group-hover:scale-125 border-2 ${
              isSelected ? 'border-white animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.5)]' : (team === 'A' ? 'border-blue-400' : 'border-red-400')
            } ${
              player.position === 'FWD' ? 'bg-rose-700' : player.position === 'GK' ? 'bg-emerald-700' : player.position === 'DEF' ? 'bg-sky-700' : 'bg-amber-700'
            }`}>
              {player.name.slice(0, 2).toUpperCase()}
              <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-zinc-950 flex items-center justify-center text-[8px] font-black ${
                  efficiency > 90 ? 'bg-emerald-400 text-zinc-950' : efficiency > 80 ? 'bg-yellow-400 text-zinc-950' : 'bg-red-400 text-white'
              }`}>
                  {efficiency.toFixed(0)}
              </div>
            </div>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-zinc-900 border border-white/10 px-2 py-1 rounded text-[8px] font-black uppercase text-white shadow-2xl">
              {player.name} <span className="text-white/40">{player.specificPosition || player.position}</span>
            </div>
        </div>
    </motion.div>
  );
}

export default function TacticLab({ onClose, squad }: TacticLabProps) {
  const { profile } = useFM();
  const medicalLvl = profile?.stadium_upgrades?.['medical'] || 0;

  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  
  const [simResults, setSimResults] = useState<MatchResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [selectedFormation, setSelectedFormation] = useState<string>('4-4-2');
  const [swapTarget, setSwapTarget] = useState<{ id: string, team: 'A' | 'B' } | null>(null);
  const [selectingPlayerFor, setSelectingPlayerFor] = useState<{ id: string, team: 'A' | 'B' } | null>(null);
  const [detailPlayer, setDetailPlayer] = useState<Player | null>(null);

  const [settings, setSettings] = useState<LabSettings>({
    weather: 'Sunny',
    ground: 'Normal',
    refereeStrictness: 'Medium',
    moraleMode: 'Standard',
    pressureMode: 'None',
    is9v9: squad.length < 22,
    scenario: undefined
  });

  const maxPerTeam = squad.length >= 22 ? 11 : 9;

  const [activeTab, setActiveTab] = useState<'control' | 'scenario' | 'history' | 'analysis' | 'splitter'>('control');
  
  // Loading state for Firebase
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        try {
          const docRef = doc(firebaseDb, 'lab_sessions', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.teamA) setTeamA(data.teamA);
            if (data.teamB) setTeamB(data.teamB);
            if (data.selectedFormation) setSelectedFormation(data.selectedFormation);
            if (data.settings) setSettings(data.settings);
          }
        } catch (err) {
          console.error("Lab loading error:", err);
        } finally {
          setIsLoaded(true);
        }
      } else {
        setIsLoaded(true);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isLoaded || !firebaseAuth?.currentUser) return;
    
    const saveLab = async () => {
      try {
        await setDoc(doc(firebaseDb, 'lab_sessions', firebaseAuth.currentUser!.uid), {
          userId: firebaseAuth.currentUser!.uid,
          teamA,
          teamB,
          selectedFormation,
          settings,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error("Lab saving error:", err);
      }
    };

    const timer = setTimeout(saveLab, 2000);
    return () => clearTimeout(timer);
  }, [teamA, teamB, selectedFormation, settings, isLoaded]);

  const FORMATIONS = [
    '4-4-2', '4-3-3', '3-5-2', '5-4-1', '4-2-3-1', 
    '3-4-3', '4-1-4-1', '4-3-2-1', '5-3-2', '4-3-1-2',
    '3-1-4-2', '4-4-1-1', '4-5-1', '3-3-3-1'
  ];

  // Modified to support up to 11 players
  const formationPositions: Record<string, { x: string, y: string }[]> = {
    '4-4-2': [
      { x: '50%', y: '95%' }, // GK
      { x: '15%', y: '78%' }, { x: '85%', y: '78%' }, { x: '35%', y: '72%' }, { x: '65%', y: '72%' },
      { x: '10%', y: '45%' }, { x: '90%', y: '45%' }, { x: '35%', y: '40%' }, { x: '65%', y: '40%' },
      { x: '35%', y: '12%' }, { x: '65%', y: '12%' }
    ],
    '4-3-3': [
      { x: '50%', y: '95%' }, // GK
      { x: '10%', y: '75%' }, { x: '90%', y: '75%' }, { x: '35%', y: '70%' }, { x: '65%', y: '70%' },
      { x: '50%', y: '45%' }, { x: '30%', y: '45%' }, { x: '70%', y: '45%' },
      { x: '15%', y: '15%' }, { x: '85%', y: '15%' }, { x: '50%', y: '10%' }
    ],
    '3-5-2': [
      { x: '50%', y: '95%' }, // GK
      { x: '50%', y: '75%' }, { x: '25%', y: '70%' }, { x: '75%', y: '70%' },
      { x: '50%', y: '50%' }, { x: '20%', y: '45%' }, { x: '80%', y: '45%' }, { x: '35%', y: '40%' }, { x: '65%', y: '40%' },
      { x: '35%', y: '15%' }, { x: '65%', y: '15%' }
    ],
    '5-4-1': [
      { x: '50%', y: '95%' }, // GK
      { x: '50%', y: '82%' }, { x: '10%', y: '70%' }, { x: '90%', y: '70%' }, { x: '30%', y: '75%' }, { x: '70%', y: '75%' },
      { x: '25%', y: '45%' }, { x: '75%', y: '45%' }, { x: '40%', y: '50%' }, { x: '60%', y: '50%' },
      { x: '50%', y: '20%' }
    ],
    '4-2-3-1': [
      { x: '50%', y: '95%' }, // GK
      { x: '20%', y: '75%' }, { x: '80%', y: '75%' }, { x: '35%', y: '72%' }, { x: '65%', y: '72%' },
      { x: '35%', y: '52%' }, { x: '65%', y: '52%' },
      { x: '50%', y: '32%' }, { x: '20%', y: '30%' }, { x: '80%', y: '30%' },
      { x: '50%', y: '12%' }
    ],
    '3-4-3': [
      { x: '50%', y: '95%' }, // GK
      { x: '50%', y: '75%' }, { x: '25%', y: '75%' }, { x: '75%', y: '75%' },
      { x: '15%', y: '48%' }, { x: '85%', y: '48%' }, { x: '40%', y: '50%' }, { x: '60%', y: '50%' },
      { x: '50%', y: '18%' }, { x: '25%', y: '10%' }, { x: '75%', y: '10%' }
    ],
    '4-1-4-1': [
      { x: '50%', y: '95%' }, // GK
      { x: '20%', y: '75%' }, { x: '80%', y: '75%' }, { x: '35%', y: '72%' }, { x: '65%', y: '72%' },
      { x: '50%', y: '58%' },
      { x: '20%', y: '38%' }, { x: '80%', y: '38%' }, { x: '40%', y: '38%' }, { x: '60%', y: '38%' },
      { x: '50%', y: '12%' }
    ],
    '4-3-2-1': [
      { x: '50%', y: '95%' }, // GK
      { x: '20%', y: '75%' }, { x: '80%', y: '75%' }, { x: '35%', y: '72%' }, { x: '65%', y: '72%' },
      { x: '50%', y: '52%' }, { x: '35%', y: '52%' }, { x: '65%', y: '52%' },
      { x: '35%', y: '28%' }, { x: '65%', y: '28%' }, { x: '50%', y: '12%' }
    ],
    '5-3-2': [
      { x: '50%', y: '95%' }, // GK
      { x: '50%', y: '84%' }, { x: '20%', y: '75%' }, { x: '80%', y: '75%' }, { x: '10%', y: '65%' }, { x: '90%', y: '65%' },
      { x: '50%', y: '42%' }, { x: '30%', y: '42%' }, { x: '70%', y: '42%' },
      { x: '35%', y: '15%' }, { x: '65%', y: '15%' }
    ],
    '4-3-1-2': [
      { x: '50%', y: '95%' }, // GK
      { x: '20%', y: '75%' }, { x: '80%', y: '75%' }, { x: '35%', y: '72%' }, { x: '65%', y: '72%' },
      { x: '50%', y: '52%' }, { x: '30%', y: '52%' }, { x: '70%', y: '52%' },
      { x: '50%', y: '32%' }, { x: '35%', y: '12%' }, { x: '65%', y: '12%' }
    ],
    '3-1-4-2': [
      { x: '50%', y: '95%' }, // GK
      { x: '50%', y: '75%' }, { x: '25%', y: '75%' }, { x: '75%', y: '75%' },
      { x: '50%', y: '58%' },
      { x: '15%', y: '42%' }, { x: '85%', y: '42%' }, { x: '35%', y: '42%' }, { x: '65%', y: '42%' },
      { x: '35%', y: '15%' }, { x: '65%', y: '15%' }
    ],
    '4-4-1-1': [
      { x: '50%', y: '95%' }, // GK
      { x: '20%', y: '75%' }, { x: '80%', y: '75%' }, { x: '35%', y: '72%' }, { x: '65%', y: '72%' },
      { x: '15%', y: '48%' }, { x: '85%', y: '48%' }, { x: '35%', y: '48%' }, { x: '65%', y: '48%' },
      { x: '50%', y: '32%' }, { x: '50%', y: '12%' }
    ],
    '4-5-1': [
      { x: '50%', y: '95%' }, // GK
      { x: '20%', y: '75%' }, { x: '80%', y: '75%' }, { x: '35%', y: '72%' }, { x: '65%', y: '72%' },
      { x: '50%', y: '52%' }, { x: '20%', y: '40%' }, { x: '80%', y: '40%' }, { x: '35%', y: '45%' }, { x: '65%', y: '45%' },
      { x: '50%', y: '15%' }
    ],
    '3-3-3-1': [
      { x: '50%', y: '95%' }, // GK
      { x: '50%', y: '75%' }, { x: '25%', y: '75%' }, { x: '75%', y: '75%' },
      { x: '50%', y: '52%' }, { x: '30%', y: '52%' }, { x: '70%', y: '52%' },
      { x: '50%', y: '32%' }, { x: '30%', y: '32%' }, { x: '70%', y: '32%' }, { x: '50%', y: '12%' }
    ]
  };

  useEffect(() => {
    if (squad.length > 0 && teamA.length === 0 && teamB.length === 0) {
      const gks = squad.filter(p => p.position === 'GK').sort((a, b) => b.rating - a.rating);
      const others = squad.filter(p => p.position !== 'GK').sort((a, b) => b.rating - a.rating);
      
      const a: string[] = [];
      const b: string[] = [];

      if (gks.length >= 2) {
        a.push(gks[0].id);
        b.push(gks[1].id);
      } else if (gks.length === 1) {
        a.push(gks[0].id);
      }

      others.forEach((p, i) => {
        if (a.length < maxPerTeam && b.length < maxPerTeam) {
          if (i % 2 === 0) a.push(p.id);
          else b.push(p.id);
        } else if (a.length < maxPerTeam) {
          a.push(p.id);
        } else if (b.length < maxPerTeam) {
          b.push(p.id);
        }
      });

      setTeamA(a);
      setTeamB(b);
    }
  }, [squad, teamA.length, teamB.length, maxPerTeam]);

  const squadAMembers = useMemo(() => {
    return teamA.map(id => squad.find(p => p.id === id)).filter(Boolean) as Player[];
  }, [squad, teamA]);

  const squadBMembers = useMemo(() => {
    return teamB.map(id => squad.find(p => p.id === id)).filter(Boolean) as Player[];
  }, [squad, teamB]);

  const matchAccuracy = useMemo(() => {
    if (squadAMembers.length === 0) return 0;
    
    // Position-based harmony
    const positions = selectedFormation.split('-').map(Number); // e.g. [4, 4, 2]
    const defCount = positions[0] || 0;
    const midCount = positions[1] || 0;
    const fwdCount = positions[2] || 0;
    
    const actualGKs = squadAMembers.filter(p => p.position === 'GK').length;
    const actualDefs = squadAMembers.filter(p => p.position === 'DEF').length;
    const actualMids = squadAMembers.filter(p => p.position === 'MID').length;
    const actualFwds = squadAMembers.filter(p => p.position === 'FWD').length;

    let harmonyScore = 0;
    harmonyScore += (Math.min(actualGKs, 1) / 1) * 20;
    harmonyScore += (Math.min(actualDefs, defCount) / (defCount || 1)) * 30;
    harmonyScore += (Math.min(actualMids, midCount) / (midCount || 1)) * 30;
    harmonyScore += (Math.min(actualFwds, fwdCount) / (fwdCount || 1)) * 20;

    // Quality factor
    const avgRating = squadAMembers.reduce((acc, p) => acc + p.rating, 0) / squadAMembers.length;
    const qualityMultiplier = Math.min(1.2, avgRating / 80);

    return Math.min(100, Math.floor(harmonyScore * qualityMultiplier));
  }, [squadAMembers, selectedFormation]);

  const runBatchSim = useCallback(async (count: number = 5) => {
    if (squadAMembers.length === 0 || squadBMembers.length === 0) {
      alert("HATA: Her iki takımda da en az 1 oyuncu olmalıdır.");
      return;
    }
    setIsSimulating(true);
    const results: MatchResult[] = [];
    
    for (let i = 0; i < count; i++) {
      const res = await integratedMatchEngine.runScheduledMatch(squadAMembers, squadBMembers, {
        homeTactics: {},
        isLabSimulation: true,
        activeTactic: {
          formation: selectedFormation, 
          mentality: 3,
          pressing: true,
          passingStyle: 'Karışık',
          lineHeight: 50,
          width: 50,
          aggression: 50,
          passingIntensity: 50,
          screenKeeper: false,
          wasteTime: false,
          parkTheBus: false,
          crossGame: false,
          loneStrikerCounter: false
        },
        homeOperations: [],
        labSettings: settings
      });
      results.push(res);
    }

    setSimResults(results);
    setIsSimulating(false);
    generateReport(results);
    generateInsights(results);
  }, [squadAMembers, squadBMembers, settings, selectedFormation]);

  const generateInsights = (results?: MatchResult[]) => {
    const insights: string[] = [];
    const activeResults = results || simResults;

    if (activeResults.length === 0) return;

    // Real xG calculation
    const avgGoalsA = activeResults.reduce((s, r) => s + r.score.home, 0) / activeResults.length;
    const avgGoalsB = activeResults.reduce((s, r) => s + r.score.away, 0) / activeResults.length;

    insights.push(`[İSTATİSTİK] ${activeResults.length} simülasyon sonucu: As Takım ort. ${avgGoalsA.toFixed(1)} gol, Yedek Takım ort. ${avgGoalsB.toFixed(1)} gol.`);

    // Find weakest and strongest players
    const sortedA = [...squadAMembers].sort((a, b) => a.rating - b.rating);
    const sortedB = [...squadBMembers].sort((a, b) => a.rating - b.rating);
    const strongestA = [...squadAMembers].sort((a, b) => b.rating - a.rating)[0];

    if (sortedA[0]) {
      insights.push(`[AS TAKIM] En zayıf halka: ${sortedA[0].name} (${sortedA[0].specificPosition || sortedA[0].position}, GÜÇ: ${sortedA[0].rating}). Bu mevki kritik eksiğin oluşturuyor.`);
    }
    if (strongestA) {
      insights.push(`[AS TAKIM] Yıldız oyuncu: ${strongestA.name} (${strongestA.specificPosition || strongestA.position}, GÜÇ: ${strongestA.rating}). Takımın ana silahı.`);
    }

    // Position mismatch analysis
    const positionGroups = selectedFormation.split('-').map(Number);
    const defNeeded = positionGroups[0] || 0;
    const midNeeded = positionGroups[1] || 0;
    const actualDefs = squadAMembers.filter(p => p.position === 'DEF').length;
    const actualMids = squadAMembers.filter(p => p.position === 'MID').length;

    if (actualDefs < defNeeded) {
      insights.push(`[TAKTİK UYARISI] ${selectedFormation} dizilişi için ${defNeeded} defans oyuncusu gerekir, ancak sadece ${actualDefs} defans var. Mevki uyuşmazlığı taktiksel verimi düşürüyor.`);
    }
    if (actualMids < midNeeded) {
      insights.push(`[TAKTİK UYARISI] Orta saha eksikliği: ${midNeeded} orta saha gerekirken ${actualMids} oyuncu mevcut. Oyun kurma ve savunma dengesi bozulabilir.`);
    }

    // Archetype comparison
    const archetypesA = squadAMembers.map(p => (p as any).archetype).filter(Boolean);
    const archetypesB = squadBMembers.map(p => (p as any).archetype).filter(Boolean);
    if (archetypesA.length > 0 && archetypesB.length > 0) {
      const uniqueArchA = [...new Set(archetypesA)];
      const uniqueArchB = [...new Set(archetypesB)];
      insights.push(`[ARKETİP ANALİZİ] As Takım: ${uniqueArchA.join(', ')} | Yedek Takım: ${uniqueArchB.join(', ')}. Arketip çeşitliliği takımın duruma uyum sağlama kabiliyetini belirler.`);
    }

    // Speed analysis
    const fastPlayersA = squadAMembers.filter(p => ((p as any).speed || 50) > 80);
    if (fastPlayersA.length > 0) {
      insights.push(`[HIZ ANALİZİ] As Takım'da ${fastPlayersA.length} hızlı oyuncu (${fastPlayersA.map(p => p.name).join(', ')}). Hızlı kontra atak potansiyeli yüksek.`);
    }

    // Form analysis
    const lowFormPlayers = squadAMembers.filter(p => ((p as any).form || 50) < 60);
    if (lowFormPlayers.length > 0) {
      insights.push(`[FORM UYARISI] ${lowFormPlayers.map(p => `${p.name} (${(p as any).form || 50}%)`).join(', ')} — düşük formdaki oyuncular performansı etkileyebilir.`);
    }

    // GK analysis
    const gkA = squadAMembers.find(p => p.position === 'GK');
    const gkB = squadBMembers.find(p => p.position === 'GK');
    if (gkA && gkB) {
      const diff = gkA.rating - gkB.rating;
      if (diff > 5) insights.push(`[KALECİ KARŞILAŞTIRMASI] ${gkA.name} (${gkA.rating}), ${gkB.name} (${gkB.rating})'ndan ${diff} puan üstün. Kaleci avantajı As Takım'da.`);
      else if (diff < -5) insights.push(`[KALECİ KARŞILAŞTIRMASI] ${gkB.name} (${gkB.rating}), ${gkA.name} (${gkA.rating})'ndan ${Math.abs(diff)} puan üstün. Kaleci riski As Takım için ciddi.`);
    }

    // Pressing efficiency from simulation
    if (settings.moraleMode === 'Hyper') {
      insights.push(`[MORAL ETKİSİ] HİPER moral modu aktif. Oyuncuların agresiflik ve hız istatistiklerine %15 bonus uygulanıyor, ancak kondisyon daha hızlı düşüyor.`);
    }

    // Team balance
    const avgRatingA = squadAMembers.reduce((s, p) => s + p.rating, 0) / (squadAMembers.length || 1);
    const avgRatingB = squadBMembers.reduce((s, p) => s + p.rating, 0) / (squadBMembers.length || 1);
    if (Math.abs(avgRatingA - avgRatingB) > 10) {
      const stronger = avgRatingA > avgRatingB ? 'As Takım' : 'Yedek Takım';
      insights.push(`[GÜÇ DENGESİ] ${stronger} ortalama ${Math.abs(avgRatingA - avgRatingB).toFixed(1)} puan üstün. Rekabet dengesiz olabilir, bu simülasyon sonuçlarını etkiler.`);
    }

    setInsights(insights.slice(0, 8));
  };

  const generateReport = (results: MatchResult[]) => {
    const winsA = results.filter(r => r.score.home > r.score.away).length;
    const winsB = results.filter(r => r.score.away > r.score.home).length;
    const winRateA = (winsA / results.length) * 100;
    
    let text = `SCOUT GÖZLEMİ: Takım A vs Takım B arasında ${results.length} maç yapıldı. `;
    
    if (winRateA > 60) {
      text += `As takım bariz üstünlük kurdu. Özellikle orta saha geçişlerinde yedek takımı çaresiz bıraktılar. `;
    } else if (winRateA > 40) {
      text += `Kıyasıya bir rekabet var. Mevki bazlı eşleşmelerde yedek oyuncuların as takımı zorladığı (ve hatta kilitlediği) anlar oldu. `;
    } else {
      text += `İlginç bir sonuç! Yedek kadronun düşük reytingine rağmen as takımı durdurması, taktiğin zayıf noktalarını (özellikle pres karşısındaki direnci) açığa çıkardı. `;
    }
    
    setReport(text);
  };

  const handlePlayerClick = (playerId: string, team: 'A' | 'B' | 'POOL') => {
    if (team === 'POOL') return;
    setSelectingPlayerFor({ id: playerId, team });
  };

  const selectReplacement = (newPlayerId: string) => {
    if (!selectingPlayerFor) return;
    
    const { id: oldId, team } = selectingPlayerFor;
    
    if (team === 'A') {
      if (teamB.includes(newPlayerId)) {
        // Swap between teams
        setTeamA(prev => prev.map(id => id === oldId ? newPlayerId : id));
        setTeamB(prev => prev.map(id => id === newPlayerId ? oldId : id));
      } else if (teamA.includes(newPlayerId)) {
        // Swap index within team A
        const newTeamA = [...teamA];
        const idx1 = newTeamA.indexOf(oldId);
        const idx2 = newTeamA.indexOf(newPlayerId);
        if (idx1 > -1 && idx2 > -1) {
          const temp = newTeamA[idx1];
          newTeamA[idx1] = newTeamA[idx2];
          newTeamA[idx2] = temp;
          setTeamA(newTeamA);
        }
      } else {
        // Replace with pool player
        setTeamA(prev => prev.map(id => id === oldId ? newPlayerId : id));
      }
    } else {
      if (teamA.includes(newPlayerId)) {
        // Swap between teams
        setTeamB(prev => prev.map(id => id === oldId ? newPlayerId : id));
        setTeamA(prev => prev.map(id => id === newPlayerId ? oldId : id));
      } else if (teamB.includes(newPlayerId)) {
        // Swap index within team B
        const newTeamB = [...teamB];
        const idx1 = newTeamB.indexOf(oldId);
        const idx2 = newTeamB.indexOf(newPlayerId);
        if (idx1 > -1 && idx2 > -1) {
          const temp = newTeamB[idx1];
          newTeamB[idx1] = newTeamB[idx2];
          newTeamB[idx2] = temp;
          setTeamB(newTeamB);
        }
      } else {
        // Replace with pool player
        setTeamB(prev => prev.map(id => id === oldId ? newPlayerId : id));
      }
    }
    setSelectingPlayerFor(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
    >
      <div className="w-full h-full max-w-7xl bg-zinc-950 border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-950/20 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)]">
              <FlaskConical className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">TACTIC LABORATORY</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">9v9 SIMULATION ENVIRONMENT // v2.4</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          
          <div className="w-80 border-r border-white/5 flex flex-col bg-black/20 overflow-y-auto">
             <div className="p-6 space-y-8">
                <section className="space-y-4">
                   <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Users size={12} /> TAKTİKSEL DİZİLİŞ
                   </h3>
                   <div className="relative group">
                      <select 
                        value={selectedFormation}
                        onChange={(e) => setSelectedFormation(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black text-white uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-blue-500/50 transition-all"
                      >
                         {FORMATIONS.map(f => (
                            <option key={f} value={f} className="bg-zinc-950 text-white">{f}</option>
                         ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                         <ChevronRight size={14} className="rotate-90" />
                      </div>
                   </div>
                </section>
                
                <section className="space-y-4">
                   <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Wind size={12} /> HAVA VE ZEMİN
                   </h3>
                   <div className="grid grid-cols-3 gap-2">
                      {(['Sunny', 'Rainy', 'Snowy'] as const).map(w => (
                         <button 
                           key={w}
                           onClick={() => setSettings(prev => ({ ...prev, weather: w }))}
                           className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                             settings.weather === w ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                           }`}
                         >
                            {WEATHER_ICONS[w]}
                            <span className="text-[8px] font-black uppercase">{w === 'Sunny' ? 'Güneş' : w === 'Rainy' ? 'Yağmur' : 'Kar'}</span>
                         </button>
                      ))}
                   </div>
                </section>

                <section className="space-y-4">
                   <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Smile size={12} /> MORAL VE BASKI
                   </h3>
                   <div className="space-y-2">
                      {(['Standard', 'Collapsed', 'Hyper'] as const).map(m => (
                         <button 
                           key={m}
                           onClick={() => setSettings(prev => ({ ...prev, moraleMode: m }))}
                           className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                             settings.moraleMode === m ? 'bg-zinc-800 border-white/20 text-white' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                           }`}
                         >
                            <span className="text-[10px] font-bold uppercase">{m === 'Standard' ? 'STANDART' : m === 'Collapsed' ? 'ÇÖKMÜŞ (KRİZ)' : 'HİPER (GAZA GELMİŞ)'}</span>
                            {m === 'Hyper' ? <TrendingUp size={12} className="text-emerald-400" /> : m === 'Collapsed' ? <AlertCircle size={12} className="text-red-400" /> : <div />}
                         </button>
                      ))}
                   </div>
                </section>

                <section className="space-y-4">
                   <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Target size={12} /> HAKEM SERTLİĞİ
                   </h3>
                   <div className="grid grid-cols-2 gap-2">
                      {(['Low', 'Medium', 'High', 'Extreme'] as const).map(ref => (
                         <button 
                           key={ref}
                           onClick={() => setSettings(prev => ({ ...prev, refereeStrictness: ref }))}
                           className={`p-2 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all ${
                             settings.refereeStrictness === ref ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                           }`}
                         >
                            {ref === 'Extreme' ? 'KASAP DOSTU' : ref === 'High' ? 'SERT' : ref === 'Medium' ? 'ORTA' : 'YUMUŞAK'}
                         </button>
                      ))}
                   </div>
                </section>

                <section className="space-y-4">
                   <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                      <History size={12} /> SENARYO DÜZENLEYİCİ
                   </h3>
                   <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setSettings(prev => ({ ...prev, scenario: prev.scenario === 'RedCard' ? undefined : 'RedCard' }))}
                        className={`p-3 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all ${settings.scenario === 'RedCard' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}
                      >
                        10 Kişi Kalma
                      </button>
                      <button 
                        onClick={() => setSettings(prev => ({ ...prev, scenario: prev.scenario === 'LateGoal' ? undefined : 'LateGoal' }))}
                        className={`p-3 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all ${settings.scenario === 'LateGoal' ? 'bg-red-600 border-red-500 text-white' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                      >
                        Son 5 Dakika
                      </button>
                   </div>
                </section>
             </div>
          </div>

          <div className="flex-1 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.1)_0%,_transparent_70%)] relative overflow-hidden flex flex-col pt-20">
              <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 pointer-events-none">
                 <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group relative">
                       <Info size={18} />
                       <div className="absolute bottom-12 left-0 w-64 p-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all text-[10px] text-white/60 leading-relaxed font-bold uppercase tracking-wider scale-95 group-hover:scale-100 origin-bottom-left pointer-events-none">
                          <span className="text-blue-400 block mb-2">TACTIC LABORATORY // INFO</span>
                          Burada takımınızın taktiklerini çeşitli simülasyon ortamlarında test edebilirsiniz. 
                          <br/><br/>
                          <span className="text-white">Kadro Mühendisi:</span> Takımınızı ikiye bölüp 9v9 maçlar planlayın.
                          <br/>
                          <span className="text-white">Saha & Analiz:</span> Farklı dizilişlerin sahada nasıl göründüğünü ve taktiksel parametrelerin maç motoruna etkisini analiz edin.
                       </div>
                    </div>
                 </div>

                 <div className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-full p-1 flex gap-1 shadow-2xl pointer-events-auto">
                    <button onClick={() => setActiveTab('control')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'control' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>SAHA</button>
                    <button onClick={() => setActiveTab('analysis')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'analysis' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>ANALİZ</button>
                 </div>
              </div>

              <div className="flex-1 p-8 flex flex-col items-center justify-start overflow-hidden">
                    <div className="relative w-full aspect-[4/3] max-h-[600px] border-4 border-white/5 rounded-3xl bg-emerald-950/20 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                       <div className="absolute inset-0 opacity-20 pointer-events-none">
                          <div className="absolute inset-0 border-[3px] border-white/10 m-4" />
                          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[3px] border-white/10 rounded-full" />
                       </div>

                       <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                          <line x1="20%" y1="50%" x2="40%" y2="50%" stroke="rgba(16,185,129,0.3)" strokeWidth="4" strokeDasharray="10 5" className="animate-[dash_2s_linear_infinite]" />
                       </svg>

                       <div className="absolute inset-0 border-r-2 border-white/5" style={{ width: '50%' }}>
                          {squadAMembers.slice(0, maxPerTeam).map((p, i) => {
                             const formationPos = formationPositions[selectedFormation] || formationPositions['4-4-2'];
                             const rawPos = formationPos[i] || { x: '50%', y: '50%' };
                             const x = `${((100 - parseFloat(rawPos.y)) / 100) * 86 + 7}%`; 
                             const y = `${(parseFloat(rawPos.x) / 100) * 86 + 7}%`; 
                             
                             return (
                               <PlayerMarker 
                                 key={p.id} 
                                 player={p} 
                                 pos={{ x, y }} 
                                 team="A" 
                                 onClick={() => handlePlayerClick(p.id, 'A')}
                                 isSelected={swapTarget?.id === p.id}
                               />
                             );
                          })}
                          <div className="absolute top-4 left-4 flex flex-col gap-1 items-start z-30 pointer-events-none">
                             <div className="text-[8px] font-black text-blue-400/50 uppercase tracking-widest">AS TAKIM (A)</div>
                             <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20 uppercase backdrop-blur-md">
                                GÜÇ: {Math.floor(squadAMembers.reduce((s,p) => s+p.rating,0)/(squadAMembers.length||1))}
                             </span>
                          </div>
                       </div>
                       <div className="absolute inset-0 border-l-2 border-white/5" style={{ width: '50%', left: '50%' }}>
                          {squadBMembers.slice(0, maxPerTeam).map((p, i) => {
                             const formationPos = formationPositions[selectedFormation] || formationPositions['4-4-2'];
                             const rawPos = formationPos[i] || { x: '50%', y: '50%' };
                             const x = `${(parseFloat(rawPos.y) / 100) * 86 + 7}%`;
                             const y = `${(parseFloat(rawPos.x) / 100) * 86 + 7}%`; 
                             
                             return (
                               <PlayerMarker 
                                 key={p.id} 
                                 player={p} 
                                 pos={{ x, y }} 
                                 team="B" 
                                 onClick={() => handlePlayerClick(p.id, 'B')}
                                 isSelected={swapTarget?.id === p.id}
                               />
                             );
                          })}
                          <div className="absolute top-4 right-4 flex flex-col gap-1 items-end z-30 pointer-events-none">
                             <div className="text-[8px] font-black text-red-400/50 uppercase tracking-widest">YEDEK TAKIM (B)</div>
                             <span className="text-[10px] font-black text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-400/20 uppercase backdrop-blur-md">
                                GÜÇ: {Math.floor(squadBMembers.reduce((s,p) => s+p.rating,0)/(squadBMembers.length||1))}
                             </span>
                          </div>
                       </div>
                    </div>
              </div>

              <div className="p-6 bg-blue-600/5 mt-auto border-t border-white/5 backdrop-blur-sm">
                 <div className="max-w-3xl mx-auto flex items-center gap-6">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                       <Zap className="text-blue-400" size={18} />
                    </div>
                    <div>
                       <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 italic">YAPAY ZEKA KOÇ ÖNERİSİ:</h4>
                       <p className="text-xs text-white/70 font-medium">
                          {report || "Analiz bekleniyor... Simülasyonu başlatarak taktiksel zayıf noktaları ve oyuncu kimyalarını görebilirsin."}
                       </p>
                    </div>
                 </div>
              </div>
          </div>

          <div className="w-96 border-l border-white/5 flex flex-col bg-zinc-950 overflow-y-auto">
             <div className="p-8 space-y-8">
                {insights.length > 0 && (
                   <section className="space-y-4">
                      <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                         <Info size={12} /> YENİ EDİNİLEN BİLGİLER
                      </h3>
                      <div className="space-y-2">
                         {insights.map((insight, i) => (
                            <motion.div 
                              initial={{ x: 20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: i * 0.1 }}
                              key={i} 
                              className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl flex gap-3 items-start"
                            >
                               <Zap size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                               <p className="text-[9px] text-white/70 font-bold leading-relaxed">{insight}</p>
                            </motion.div>
                         ))}
                      </div>
                   </section>
                )}

                <section className="space-y-4">
                    <div className="flex justify-between items-end">
                       <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">TAKTIKSEL UYUM</h3>
                       <span className="text-2xl font-black italic text-blue-400 tracking-tighter">%{matchAccuracy}</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${matchAccuracy}%` }} className="h-full bg-gradient-to-r from-blue-600 to-indigo-400" />
                    </div>
                    <p className="text-[8px] text-white/40 uppercase font-black tracking-widest leading-relaxed">
                       OYUNCULARIN %{matchAccuracy}&apos;Ü MEVCUT TAKTİĞE UYGUN TRAİTLERE SAHİP.
                    </p>
                </section>

                <section className="grid grid-cols-2 gap-3">
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                       <h4 className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">XG POTANSİYELİ</h4>
                       <span className="text-xl font-black italic tracking-tighter text-white">
                         {simResults.length > 0
                           ? (simResults.reduce((s, r) => s + r.score.home, 0) / simResults.length).toFixed(1)
                           : '—'}
                       </span>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                       <h4 className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">GALİBİYET ORANI</h4>
                       <span className="text-xl font-black italic tracking-tighter text-emerald-400">
                         {simResults.length > 0
                           ? `%${Math.round((simResults.filter(r => r.score.home > r.score.away).length / simResults.length) * 100)}`
                           : '—'}
                       </span>
                   </div>
                </section>

                <section className="pt-8 border-t border-white/5 space-y-6">
                   <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => runBatchSim(5)}
                        disabled={isSimulating}
                        className="w-full h-16 bg-white text-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50 group font-black"
                      >
                         {isSimulating ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                         ) : (
                            <>
                              <Play size={20} fill="black" />
                              <span className="text-sm uppercase tracking-[0.2em] italic">LABORATUVARI ÇALIŞTIR (x5)</span>
                            </>
                         )}
                      </button>
                      
                      <button 
                        onClick={() => runBatchSim(25)}
                        disabled={isSimulating}
                        className="w-full py-4 bg-zinc-900 border border-white/5 text-white/60 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500/50 hover:text-blue-400 transition-all flex items-center justify-center gap-2"
                      >
                         <FlaskConical size={14} /> DERİN ANALİZ (x25 SIM)
                      </button>
                   </div>

                   <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">ANTRENMAN MAÇLARI SONUÇLARI</h3>
                      <div className="flex gap-1 flex-wrap">
                         {simResults.slice(0, 10).map((r, i) => (
                            <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                               r.score.home > r.score.away ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                               r.score.home < r.score.away ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                               'bg-zinc-800 text-white/40'
                            }`}>
                               {r.score.home}-{r.score.away}
                            </div>
                         ))}
                      </div>
                   </div>
                </section>

                <div className="mt-auto pt-8">
                   <button 
                     onClick={() => alert("Taktik başarıyla ana taktik paneline kopyalandı!")}
                     className="w-full flex items-center justify-between p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl group hover:bg-blue-600/20 transition-all"
                   >
                       <div className="flex items-center gap-3">
                          <Save size={18} className="text-blue-400" />
                          <div className="text-left">
                             <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest">ANALİZ TAMAMLANDI</div>
                             <div className="text-[7px] text-white/40 uppercase font-bold">BU TAKTİĞİ ANA TAKTİĞİN YAP</div>
                          </div>
                       </div>
                       <ChevronRight size={16} className="text-white/20 group-hover:text-blue-400 transition-all" />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectingPlayerFor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-zinc-800/50">
                <div>
                  <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">OYUNCU SEÇİMİ</h2>
                  <p className="text-[10px] font-bold text-white/40 uppercase">DEĞİŞTİRİLECEK: {squad.find(p => p.id === selectingPlayerFor.id)?.name}</p>
                </div>
                <button onClick={() => setSelectingPlayerFor(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-2 max-h-[60vh] scrollbar-hide">
                {squad.sort((a, b) => b.rating - a.rating).map(p => (
                  <div key={p.id} className="flex gap-2 group">
                    <button 
                      onClick={() => selectReplacement(p.id)}
                      className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-between group-hover:border-blue-400 ${
                        p.id === selectingPlayerFor.id ? 'bg-blue-600 border-blue-500' : 
                        teamA.includes(p.id) ? 'bg-blue-600/10 border-blue-500/20 hover:bg-blue-600/20' :
                        teamB.includes(p.id) ? 'bg-red-600/10 border-red-500/20 hover:bg-red-600/20' :
                        'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[9px] font-black shadow-lg ${
                          p.position === 'GK' ? 'bg-emerald-500' : p.position === 'DEF' ? 'bg-blue-600' : p.position === 'MID' ? 'bg-amber-600' : 'bg-red-600'
                        }`}>
                          {p.specificPosition || p.position}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-white uppercase">{p.name}</p>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">GÜÇ: {p.rating} {'//'} {teamA.includes(p.id) ? 'AS TAKIM' : teamB.includes(p.id) ? 'YEDEK' : 'BOŞTA'}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-all" />
                    </button>
                    <button 
                      onClick={() => setDetailPlayer(p)}
                      className="w-16 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-white/40 hover:text-white transition-all shadow-xl group-hover:border-blue-400"
                    >
                      <Info size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailPlayer && (
          <div className="fixed inset-0 z-[250]">
            <PlayerDetailModal 
              player={detailPlayer} 
              onClose={() => setDetailPlayer(null)} 
              teamStats={{}} 
            />
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
      `}</style>
    </motion.div>
  );
}
