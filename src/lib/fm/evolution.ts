import { Player, MatchResult } from './types';

export const UpdatePlayerStats = (player: Player, performance: number, farmingMult: number = 1.0): Player => {
  const p = { ...player };
  
  // Growth multiplier (young faster)
  const ageFactor = p.age < 21 ? 1.5 : (p.age > 30 ? 0.5 : 1.0);
  const growth = (performance - 6.0) * 0.05 * ageFactor * farmingMult;
  
  // Potansiyel Kontrolü
  const newRating = Math.min(p.hidden_potential || 99, p.rating + growth);

  // 2. Trait Evolution
  const newTraitLevels = { ...(p.traitLevels || {}) };
  let morCount = Object.values(newTraitLevels).filter(l => l === 'MOR').length;
  let altınCount = Object.values(newTraitLevels).filter(l => l === 'ALTIN').length;

  if (performance > 8.0 && Math.random() > 0.9) {
    const traitNames = p.traits || [];
    if (traitNames.length > 0) {
      const tToUpgrade = traitNames[Math.floor(Math.random() * traitNames.length)];
      const currentLvl = newTraitLevels[tToUpgrade] || 'BEYAZ';
      
      if (currentLvl === 'BEYAZ') newTraitLevels[tToUpgrade] = 'LACIVERT';
      else if (currentLvl === 'LACIVERT' && altınCount < 1) {
        newTraitLevels[tToUpgrade] = 'ALTIN';
        altınCount++;
      }
      else if (currentLvl === 'ALTIN' && morCount < 1) {
        newTraitLevels[tToUpgrade] = 'MOR';
        morCount++;
      }
    }
  }

  // 3. PlayStyle Evolution
  const newStyleLevels = { ...(p.styleLevels || {}) };
  if (p.playStyle && performance > 7.5 && Math.random() > 0.95) {
    const currentS = newStyleLevels[p.playStyle] || 1;
    if (currentS < 3) newStyleLevels[p.playStyle] = currentS + 1;
  }

  // NOT: Yaşa bağlı yetenek düşüşü (speed 31+, passing 33+) artık maç bazlı DEĞİL,
  // sezon bazlı uygulanıyor. Bkz: app/api/cron/season-end/route.ts adım 14c.
  // Buradan kaldırıldı — çift düşüş (match + season) engellendi.
  return {
    ...p,
    rating: newRating,
    traitLevels: newTraitLevels,
    styleLevels: newStyleLevels,
  };
};

export const applyMatchEvolution = (players: Player[], result: MatchResult, isHome: boolean): Player[] => {
  const teamScored = isHome ? result.score.home : result.score.away;
  const teamConceded = isHome ? result.score.away : result.score.home;
  const won = teamScored > teamConceded;
  const draw = teamScored === teamConceded;

  return players.map(player => {
    const matchRating = player.match_ratings && player.match_ratings.length > 0 
      ? player.match_ratings[player.match_ratings.length - 1] 
      : 6.5;
    
    let evolved = UpdatePlayerStats(player, matchRating);

    // 4. Form/Morale/Confidence
    let newForm = evolved.form || 60;
    let newMorale = evolved.morale || 60;
    let newConfidence = evolved.confidence || 60;

    if (won) {
      newMorale = Math.min(100, newMorale + 5);
      newConfidence = Math.min(100, newConfidence + 3);
    } else if (!draw) {
      newMorale = Math.max(0, newMorale - 5);
      newConfidence = Math.max(0, newConfidence - 2);
    }

    if (matchRating >= 7.5) newForm = Math.min(100, newForm + 8);
    else if (matchRating < 6.0) newForm = Math.max(0, newForm - 10);
    else newForm = Math.max(0, newForm - 2); // Idle decay

    return {
      ...evolved,
      form: newForm,
      morale: newMorale,
      confidence: newConfidence,
    };
  });
};

export const applyEvolution = applyMatchEvolution;

export const processDailyUpdates = (players: Player[]): Player[] => {
  return players.map(p => {
    let newForm = p.form || 60;
    let newMorale = p.morale || 60;
    let newConfidence = p.confidence || 60;

    // Daily decay/fluctuation
    newForm = Math.max(30, Math.min(100, newForm + (Math.random() * 4 - 2)));
    newMorale = Math.max(10, Math.min(100, newMorale + (Math.random() * 2 - 1.2))); // Slight negative bias
    newConfidence = Math.max(10, Math.min(100, newConfidence + (Math.random() * 1.5 - 1)));

    // Injury handling
    let newInjury = p.injury;
    if (newInjury && newInjury.remaining_days > 0) {
      const remaining = newInjury.remaining_days - 1;
      if (remaining <= 0) {
        newInjury = undefined;
      } else {
        newInjury = { ...newInjury, remaining_days: remaining };
      }
    }

    // 5. Tenure / Club Legend Logic
    const tenure = (p as any).tenure || 0;
    const newTenure = tenure + 1;
    let isLegend = p.is_legend || false;
    if (newTenure > 365 && !isLegend && (p.rating > 80 || (p as any).goals > 50)) {
      isLegend = true;
    }

    return {
      ...p,
      form: newForm,
      morale: newMorale,
      confidence: newConfidence,
      injury: newInjury,
      is_legend: isLegend,
      tenure: newTenure
    } as any;
  });
};