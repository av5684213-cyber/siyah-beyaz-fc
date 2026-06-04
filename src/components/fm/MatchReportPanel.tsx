'use client';

import { useMemo } from 'react';

interface MatchEvent {
  type: string;
  minute: number;
  playerId?: string;
  playerName?: string;
  team: string;
  assistPlayerName?: string;
  assistPlayerId?: string;
  subtype?: string;
}

interface PlayerStats {
  id: string;
  name: string;
  rating: number;
  team: string;
  position: string;
}

interface MatchReportProps {
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  playerStats: PlayerStats[];
  homeTactic?: any;
  awayTactic?: any;
  substitutions?: any[];
}

export default function MatchReportPanel({
  homeTeamName, awayTeamName, homeScore, awayScore,
  events, playerStats, homeTactic, awayTactic, substitutions
}: MatchReportProps) {

  const analysis = useMemo(() => {
    if (!playerStats || playerStats.length === 0) return null;

    const allSorted = [...playerStats].sort((a, b) => b.rating - a.rating);
    const bestPlayer = allSorted[0];
    const worstPlayer = allSorted[allSorted.length - 1];

    // Tactical warning
    let tacticalWarning = '';
    const loserTeam = homeScore < awayScore ? 'home' : homeScore > awayScore ? 'away' : null;
    if (loserTeam) {
      const loserTactic = loserTeam === 'home' ? homeTactic : awayTactic;
      if (loserTactic) {
        if (loserTactic.formation?.includes('3') && events.filter(e => e.type === 'goal' && e.team !== loserTeam).length >= 3) {
          tacticalWarning = '3lü savunma hattı, rakibin kanat hücumlarına karşı yetersiz kaldı. 4lü savunmaya geçiş düşünebilirsiniz.';
        } else if (loserTactic.mentality === 'attacking' || loserTactic.mentality === 'very_attacking') {
          tacticalWarning = 'Yüksek hücum mentalitesi savunmada boşluklar yarattı. Rakip kontra ataklarla cezalandırdı.';
        } else if (loserTactic.pressing === 'high') {
          tacticalWarning = 'Yüksek pres, hızlı forvetlere karşı etkisiz kaldı. Rakip uzun toplarla bu presi aştı.';
        } else if (loserTactic.defensiveLine === 'high') {
          tacticalWarning = 'Yüksek savunma hattı hızlı forvetlere karşı etkisiz kaldı. Arkaya atılan uzun toplar gol getirdi.';
        }
      }
    }
    if (!tacticalWarning && (homeScore + awayScore) >= 5) {
      tacticalWarning = 'Her iki takımın da savunmasız oyun tarzı yüksek gollü bir maç yarattı. Defansif denge yeniden gözden geçirilmeli.';
    }

    // Breaking moment - find substitution that changed the game
    let breakingMoment = '';
    if (substitutions && substitutions.length > 0) {
      for (const sub of substitutions) {
        const afterSub = events.filter(e => e.minute >= sub.minute);
        const subTeamGoals = afterSub.filter(e => e.type === 'goal' && e.team === sub.team).length;
        if (subTeamGoals >= 2) {
          breakingMoment = `${sub.minute}. dakikada yapılan oyuncu değişikliği maçı çevirdi! ${sub.playerName || 'Değişen oyuncu'} sonradan giren takımın atağını canlandırdı.`;
          break;
        }
      }
    }
    if (!breakingMoment) {
      const goals = events.filter(e => e.type === 'goal');
      if (goals.length > 0) {
        const firstGoal = goals[0];
        const winner = homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : null;
        if (winner && firstGoal.team === winner) {
          breakingMoment = `${firstGoal.minute}. dakikada atılan ilk gol maça yön verdi ve ${firstGoal.team === 'home' ? homeTeamName : awayTeamName} maçı kontrol altına aldı.`;
        }
      }
    }

    // Worst player explanation
    let worstPlayerExplanation = '';
    if (worstPlayer) {
      if (worstPlayer.rating < 4.0) worstPlayerExplanation = 'Savunma hataları ve top kayıplarıyla takımını yalnız bıraktı.';
      else if (worstPlayer.rating < 5.0) worstPlayerExplanation = 'Pas isabeti düşük ve pozisyon değerlendirmelerinde başarısız.';
      else worstPlayerExplanation = 'Beklentilerin altında bir performans sergiledi. Top kayıpları ve etkisiz paslarla dikkat çekti.';
    }

    // Best player comment
    let bestPlayerComment = '';
    if (bestPlayer) {
      const bestGoals = events.filter(e => e.type === 'goal' && e.playerId === bestPlayer.id).length;
      const bestAssists = events.filter(e => e.type === 'goal' && e.assistPlayerId === bestPlayer.id).length;
      if (bestGoals >= 2) bestPlayerComment = `${bestGoals} golle maça damga vurdu!`;
      else if (bestGoals >= 1 && bestAssists >= 1) bestPlayerComment = 'Hem gol hem asistle maça yön verdi.';
      else if (bestGoals >= 1) bestPlayerComment = 'Kritik golü atarak takımını sırtladı.';
      else bestPlayerComment = 'Üstün performansıyla sahnenin yıldızı oldu.';
    }

    return {
      bestPlayer: { ...bestPlayer, comment: bestPlayerComment },
      worstPlayer: { ...worstPlayer, explanation: worstPlayerExplanation },
      tacticalWarning,
      breakingMoment,
    };
  }, [events, playerStats, homeScore, awayScore, homeTeamName, awayTeamName, homeTactic, awayTactic, substitutions]);

  if (!analysis) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">📊 Maç Raporu</h3>

      {/* Best Player */}
      {analysis.bestPlayer && (
        <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 rounded-xl p-3 border border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⭐</span>
            <span className="font-bold text-green-300">En İyi Oyuncu</span>
          </div>
          <div className="text-white font-semibold">{analysis.bestPlayer.name}</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-400 font-mono">{analysis.bestPlayer.rating?.toFixed(1)}</span>
            <span className="text-white/50">|</span>
            <span className="text-white/60 text-xs">{analysis.bestPlayer.comment}</span>
          </div>
        </div>
      )}

      {/* Worst Player */}
      {analysis.worstPlayer && analysis.worstPlayer.rating < 6.0 && (
        <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-xl p-3 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📉</span>
            <span className="font-bold text-red-300">En Kötü Oyuncu</span>
          </div>
          <div className="text-white font-semibold">{analysis.worstPlayer.name}</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-400 font-mono">{analysis.worstPlayer.rating?.toFixed(1)}</span>
            <span className="text-white/50">|</span>
            <span className="text-white/60 text-xs">{analysis.worstPlayer.explanation}</span>
          </div>
        </div>
      )}

      {/* Tactical Warning */}
      {analysis.tacticalWarning && (
        <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/20 rounded-xl p-3 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⚠️</span>
            <span className="font-bold text-amber-300">Taktik Uyarısı</span>
          </div>
          <div className="text-sm text-white/70">{analysis.tacticalWarning}</div>
        </div>
      )}

      {/* Breaking Moment */}
      {analysis.breakingMoment && (
        <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 rounded-xl p-3 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔄</span>
            <span className="font-bold text-blue-300">Kırılma Anı</span>
          </div>
          <div className="text-sm text-white/70">{analysis.breakingMoment}</div>
        </div>
      )}
    </div>
  );
}
