import { Player, MatchResult } from './types';

export const UpdatePlayerStats = (player: Player, performance: number, farmingMult: number = 1.0): Player => {
  const p = { ...player };
  
  // Growth multiplier (young faster)
  const ageFactor = p.age < 21 ? 1.5 : (p.age > 30 ? 0.5 : 1.0);

  // KATMAN 2.4: Kişilik trait etkisi — antrenman ve maç gelişimini etkiler
  let personalityMult = 1.0;
  const traits = p.personalityTraits || (p as any).traits || [];
  if (Array.isArray(traits)) {
    if (traits.includes('Profesyonel'))        personalityMult *= 1.25;
    if (traits.includes('Antrenman yıldızı'))  personalityMult *= 1.5;
    if (traits.includes('Çalışkan'))           personalityMult *= 1.2;
    if (traits.includes('Tembel'))             personalityMult *= 0.75;
    if (traits.includes('Disiplinsiz'))        personalityMult *= 0.9;
    if (traits.includes('Lider'))              personalityMult *= 1.1;
    if (traits.includes('Rekabetçi'))          personalityMult *= 1.15;
  }

  let growth = (performance - 6.0) * 0.05 * ageFactor * farmingMult * personalityMult;
  
  // Yaşa bağlı haftalık OVR kazanç sınır sistemi
  // Gerçekçi olmayan büyüme oranlarını önler ve yaşa bağlı gerilemeyi modeller.
  // Bir sezonda ~34 maç haftası var; sınırsız olursa 39+ OVR kazanılabilir.
  // Dengeli sınırlar (güncellenmiş):
  //   17-21 yaş: MAX_WEEKLY = 0.8 → sezonda max ~14 OVR (eski 1.5 çok yüksekti)
  //   22-27 yaş: MAX_WEEKLY = 0.5 → sezonda max ~8 OVR (eski 0.8'den düşürüldü)
  //   28-30 yaş: MAX_WEEKLY = 0.3 → yavaş gelişim (plato yaklaşımı)
  //   31-33 yaş: MAX_WEEKLY = -0.08 → hafif gerileme (eski -0.05'ten hızlandı)
  //   34+ yaş:   MAX_WEEKLY = -0.15 → belirgin gerileme (eski -0.1'den hızlandı)
  //
  // NOT: Eski -0.2/hafta çok sertti (sezonda -6.8 OVR garanti).
  // Yeni -0.08/hafta ile sezonda -2.7 OVR, performans kötüyse en fazla -3.4.
  // Bu gerçek futboldaki yaşa bağlı gerilemeye daha yakın.
  const getMaxWeeklyOvrGain = (age: number): number => {
    if (age <= 21) return 0.8;   // Eski 1.5'ten 0.8'e düşürüldü
    if (age <= 27) return 0.5;   // Eski 0.8'den 0.5'e
    if (age <= 30) return 0.3;   // Aynı
    if (age <= 33) return -0.08; // Eski -0.05'ten -0.08'e (gerileme biraz hızlandı)
    return -0.15;                // Eski -0.1'den -0.15'e (yaşlı gerilemesi belirginleştirildi)
  };

  const maxWeeklyGain = getMaxWeeklyOvrGain(p.age);

  if (p.age >= 31) {
    // 31+ yaş: Gerileme dönemi — mükemmel performans bile gerilemeyi tam durduramaz.
    // Ancak eski -1.0 sınır çok sertti, yeni -0.5 sınır daha gerçekçi.
    growth = Math.min(growth, maxWeeklyGain);
    growth = Math.max(-0.5, growth); // Haftada en fazla -0.5 gerileme (eski: -1.0)
  } else {
    // Ages 17-30: Cap positive growth at age-based limit; allow small negative.
    growth = Math.max(-0.5, Math.min(maxWeeklyGain, growth));
  }

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