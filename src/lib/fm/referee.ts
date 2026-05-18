// =============================================================================
// Siyah Beyaz FC — Referee System
// =============================================================================
// 6 hakem/lig, kişilik tipleri, maç motoru entegrasyonu.
// Hakemler faul, kart, penaltı, ofsayt kararlarını etkiler.
// =============================================================================

// ─── Referee Personality Types ─────────────────────────────────────────────
export type RefereePersonality =
  | 'katil'       // Çok sert — bol sarı/kırmızı kart, faul çalar
  | 'dengeci'     // Dengeli — ortalama katılık
  | 'hoşgörülü'   // Oyunu akıtır — az kart, faule göz yumar
  | 'ev_sahibi'   // Ev sahibine avantaj — faul/kart ev sahibi lehine
  | 'değişken'    // Tutarsız — rastgele, öngörülemez
  | 'var_sever';  // VAR meraklısı — bol penaltı ve iptal gol

export interface RefereePersonalityConfig {
  key: RefereePersonality;
  label_tr: string;
  description_tr: string;
  // Multipliers: 1.0 = neutral, >1 = more, <1 = less
  foulMultiplier: number;          // Faul çalma sıklığı
  yellowCardMultiplier: number;    // Sarı kart olasılığı (faul sonrası)
  redCardMultiplier: number;       // Kırmızı kart olasılığı
  penaltyMultiplier: number;       // Penaltı çalma olasılığı
  offsideMultiplier: number;       // Ofsayt çalma sıklığı
  varReviewChance: number;         // VAR inceleme olasılığı (gol/penaltı sonrası)
  homeBias: number;                // Ev sahibi lehine bias (-0.1 ile +0.1 arası)
  consistency: number;             // Tutarlılık (0.5-1.0, düşük = değişken)
  emoji: string;                   // Görsel gösterim
}

export const REFEREE_PERSONALITIES: Record<RefereePersonality, RefereePersonalityConfig> = {
  katil: {
    key: 'katil',
    label_tr: 'Katılcı',
    description_tr: 'Sahada otorite kurar, her türlü ihlali faul çalar, kartları cömertçe dağıtır. Oyuncular ondan korkar.',
    foulMultiplier: 1.5,
    yellowCardMultiplier: 1.8,
    redCardMultiplier: 2.0,
    penaltyMultiplier: 1.1,
    offsideMultiplier: 1.2,
    varReviewChance: 0.15,
    homeBias: 0.0,
    consistency: 0.9,
    emoji: '🟥',
  },
  dengeci: {
    key: 'dengeci',
    label_tr: 'Dengeci',
    description_tr: 'Adil ve tutarlı. Ne çok sert ne çok yumuşak. FIFA\'nın aradığı ideal hakem profili.',
    foulMultiplier: 1.0,
    yellowCardMultiplier: 1.0,
    redCardMultiplier: 1.0,
    penaltyMultiplier: 1.0,
    offsideMultiplier: 1.0,
    varReviewChance: 0.10,
    homeBias: 0.0,
    consistency: 0.95,
    emoji: '⚖️',
  },
  hoşgörülü: {
    key: 'hoşgörülü',
    label_tr: 'Hoşgörülü',
    description_tr: 'Oyunun akmasını ister, küçük faullere göz yumar. Kart yerine uyarıyı tercih eder. Seyirciler sever.',
    foulMultiplier: 0.6,
    yellowCardMultiplier: 0.5,
    redCardMultiplier: 0.4,
    penaltyMultiplier: 0.8,
    offsideMultiplier: 0.7,
    varReviewChance: 0.05,
    homeBias: 0.0,
    consistency: 0.85,
    emoji: '🤝',
  },
  ev_sahibi: {
    key: 'ev_sahibi',
    label_tr: 'Ev Sahibi Taraftarı',
    description_tr: 'Deplasman takımına karşı daha sert, ev sahibine yakın. Kritik kararlar genelde ev sahibi lehine.',
    foulMultiplier: 1.1,
    yellowCardMultiplier: 1.2,
    redCardMultiplier: 1.1,
    penaltyMultiplier: 1.3,
    offsideMultiplier: 1.1,
    varReviewChance: 0.10,
    homeBias: 0.12,
    consistency: 0.7,
    emoji: '🏠',
  },
  değişken: {
    key: 'değişken',
    label_tr: 'Değişken',
    description_tr: 'Bir maç çok sert, diğer maç çok yumuşak. İlk 15 dakikadaki kararı tüm maça yansıtır. Öngörülemez.',
    foulMultiplier: 1.0,
    yellowCardMultiplier: 1.0,
    redCardMultiplier: 1.0,
    penaltyMultiplier: 1.0,
    offsideMultiplier: 1.0,
    varReviewChance: 0.12,
    homeBias: 0.0,
    consistency: 0.4,
    emoji: '🎲',
  },
  var_sever: {
    key: 'var_sever',
    label_tr: 'VAR Meraklısı',
    description_tr: 'Her şüpheli pozisyonda VAR\'a gider, bol penaltı çalar, şüpheli golleri iptal edebilir. Uzun maçlar.',
    foulMultiplier: 0.9,
    yellowCardMultiplier: 0.8,
    redCardMultiplier: 0.9,
    penaltyMultiplier: 1.6,
    offsideMultiplier: 1.3,
    varReviewChance: 0.35,
    homeBias: 0.0,
    consistency: 0.8,
    emoji: '📺',
  },
};

// ─── Referee Entity ────────────────────────────────────────────────────────
export interface Referee {
  id: string;
  name: string;
  personality: RefereePersonality;
  experience: number;    // 1-10 deneyim seviyesi
  league_id: string;     // Atandığı lig
  strictness: number;    // 1-100 katılık skoru (personality + experience'dan hesaplanır)
  totalMatches: number;
  totalYellows: number;
  totalReds: number;
  totalPenalties: number;
}

// ─── Referee Match Context (maç sırasında hesaplanan değerler) ─────────────
export interface RefereeMatchContext {
  referee: Referee;
  personalityConfig: RefereePersonalityConfig;
  // Runtime randomness for "değişken" personality
  runtimeFoulMod: number;
  runtimeCardMod: number;
  runtimePenaltyMod: number;
  // Tracking
  yellowsGiven: number;
  redsGiven: number;
  penaltiesGiven: number;
  varReviews: number;
  goalsOverturned: number;
}

// ─── Turkish Referee Names Pool ────────────────────────────────────────────
const REFEREE_NAMES = [
  'Cüneyt Çakır', 'Halil Özdemir', 'Fırat Aydınus', 'Hüseyin Göçek',
  'Mustafa Özbek', 'Ali Palabıyık', 'Yaşar Kemal Ugur', 'Mete Kalkavan',
  'Zorbay Küçük', 'Arda Kardeşler', 'Volkan Bayarslan', 'Koray Gencer',
  'Burak Şeker', 'Emre Kargın', 'Alper Ulusoy', 'Serdar Gözübüyük',
  'Barış Şimşek', 'Mert Güzenoğlu', 'Tugay Kaan Numanoğlu', 'Atilla Karaoğlan',
  'Esat Kurnaz', 'Oğuzhan Çakır', 'Deniz Ateş', 'Kubilay Öztürk',
  'Sinan Topal', 'Gökhan Yılmaz', 'Erkan Özdamar', 'Cem Akboy',
];

// ─── Generate Referees for a League ────────────────────────────────────────
export function generateLeagueReferees(
  leagueId: string,
  count: number = 6
): Referee[] {
  const personalities: RefereePersonality[] = [
    'katil', 'dengeci', 'hoşgörülü', 'ev_sahibi', 'değişken', 'var_sever',
  ];

  // Shuffle names
  const shuffledNames = [...REFEREE_NAMES].sort(() => Math.random() - 0.5);
  // Shuffle personalities for variety
  const shuffledPersonalities = [...personalities].sort(() => Math.random() - 0.5);

  const referees: Referee[] = [];
  for (let i = 0; i < count; i++) {
    const personality = shuffledPersonalities[i % shuffledPersonalities.length];
    const config = REFEREE_PERSONALITIES[personality];
    const experience = Math.floor(Math.random() * 7) + 3; // 3-10
    const name = shuffledNames[i % shuffledNames.length];

    // Strictness = personality-based baseline + experience modifier
    const baseStrictness: Record<RefereePersonality, number> = {
      katil: 75,
      dengeci: 50,
      hoşgörülü: 25,
      ev_sahibi: 55,
      değişken: 45,
      var_sever: 40,
    };
    const strictness = Math.min(99, Math.max(1,
      baseStrictness[personality] + (experience - 5) * 5 + (Math.random() * 10 - 5)
    ));

    referees.push({
      id: `ref-${leagueId}-${i + 1}`,
      name,
      personality,
      experience,
      league_id: leagueId,
      strictness: Math.round(strictness),
      totalMatches: 0,
      totalYellows: 0,
      totalReds: 0,
      totalPenalties: 0,
    });
  }

  return referees;
}

// ─── Create Match Context ──────────────────────────────────────────────────
export function createRefereeMatchContext(referee: Referee): RefereeMatchContext {
  const config = REFEREE_PERSONALITIES[referee.personality];

  // "Değişken" hakem için runtime random modları
  let runtimeFoulMod = 1.0;
  let runtimeCardMod = 1.0;
  let runtimePenaltyMod = 1.0;

  if (referee.personality === 'değişken') {
    // İlk 15 dakikadaki davranış tüm maça yansır
    const roll = Math.random();
    if (roll < 0.3) {
      // Sert maç
      runtimeFoulMod = 1.4;
      runtimeCardMod = 1.5;
      runtimePenaltyMod = 1.2;
    } else if (roll < 0.6) {
      // Yumuşak maç
      runtimeFoulMod = 0.6;
      runtimeCardMod = 0.5;
      runtimePenaltyMod = 0.8;
    }
    // else: ortalama (1.0)
  }

  // Deneyim modifier: tecrübeli hakem daha tutarlı
  const experienceMod = 0.9 + (referee.experience / 10) * 0.1; // 0.93 - 1.0

  return {
    referee,
    personalityConfig: config,
    runtimeFoulMod,
    runtimeCardMod,
    runtimePenaltyMod,
    yellowsGiven: 0,
    redsGiven: 0,
    penaltiesGiven: 0,
    varReviews: 0,
    goalsOverturned: 0,
  };
}

// ─── Referee Decision Functions ─────────────────────────────────────────────

/**
 * Hakem bir faul çalıyor mu? (Base foul probability modified by referee)
 */
export function shouldCallFoul(
  ctx: RefereeMatchContext,
  baseFoulProb: number,
  isHomeTeamFouling: boolean
): boolean {
  let prob = baseFoulProb * ctx.personalityConfig.foulMultiplier * ctx.runtimeFoulMod;

  // Ev sahibi bias: ev sahibinin faulini daha az çalar
  if (isHomeTeamFouling && ctx.personalityConfig.homeBias > 0) {
    prob *= (1 - ctx.personalityConfig.homeBias);
  }
  // Deplasmanın faulünü daha çok çalar
  if (!isHomeTeamFouling && ctx.personalityConfig.homeBias > 0) {
    prob *= (1 + ctx.personalityConfig.homeBias);
  }

  // Tutarlılık: düşük tutarlılık = rastgele varyans
  if (ctx.personalityConfig.consistency < 0.8) {
    const variance = (1 - ctx.personalityConfig.consistency) * 0.5;
    prob *= (1 + (Math.random() * 2 - 1) * variance);
  }

  return Math.random() < prob;
}

/**
 * Faul sonrası sarı kart çalıyor mu?
 */
export function shouldGiveYellowCard(
  ctx: RefereeMatchContext,
  baseYellowProb: number,
  isHomeTeam: boolean,
  minute: number
): boolean {
  let prob = baseYellowProb * ctx.personalityConfig.yellowCardMultiplier * ctx.runtimeCardMod;

  // Ev sahibi bias
  if (isHomeTeam && ctx.personalityConfig.homeBias > 0) {
    prob *= (1 - ctx.personalityConfig.homeBias * 0.5);
  } else if (!isHomeTeam && ctx.personalityConfig.homeBias > 0) {
    prob *= (1 + ctx.personalityConfig.homeBias * 0.5);
  }

  // Geç dakika: kart artar (gerginlik)
  if (minute > 75) prob *= 1.2;
  // İlk 15 dakika: daha az kart
  if (minute < 15) prob *= 0.7;

  // Zaten çok kart verdiyse biraz yavaşlar (gerçekçi)
  if (ctx.yellowsGiven > 5) prob *= 0.8;

  return Math.random() < prob;
}

/**
 * Faul sonrası kırmızı kart çalıyor mu?
 */
export function shouldGiveRedCard(
  ctx: RefereeMatchContext,
  baseRedProb: number,
  isHomeTeam: boolean
): boolean {
  let prob = baseRedProb * ctx.personalityConfig.redCardMultiplier * ctx.runtimeCardMod;

  // Ev sahibi bias (daha az kırmızı)
  if (isHomeTeam && ctx.personalityConfig.homeBias > 0) {
    prob *= (1 - ctx.personalityConfig.homeBias);
  } else if (!isHomeTeam && ctx.personalityConfig.homeBias > 0) {
    prob *= (1 + ctx.personalityConfig.homeBias);
  }

  return Math.random() < prob;
}

/**
 Faul sonrası penaltı çalıyor mu?
 */
export function shouldGivePenalty(
  ctx: RefereeMatchContext,
  basePenaltyProb: number,
  isHomeTeamAttacking: boolean,
  minute: number
): { penalty: boolean; varReview: boolean; overturned: boolean } {
  let prob = basePenaltyProb * ctx.personalityConfig.penaltyMultiplier * ctx.runtimePenaltyMod;

  // Ev sahibi bias
  if (isHomeTeamAttacking && ctx.personalityConfig.homeBias > 0) {
    prob *= (1 + ctx.personalityConfig.homeBias);
  } else if (!isHomeTeamAttacking && ctx.personalityConfig.homeBias > 0) {
    prob *= (1 - ctx.personalityConfig.homeBias * 0.5);
  }

  const penalty = Math.random() < prob;

  if (!penalty) {
    return { penalty: false, varReview: false, overturned: false };
  }

  // VAR review chance
  let varReview = false;
  let overturned = false;
  if (Math.random() < ctx.personalityConfig.varReviewChance) {
    varReview = true;
    ctx.varReviews++;

    // VAR overturn chance: ~20% of reviews overturn
    if (Math.random() < 0.2) {
      overturned = true;
      ctx.goalsOverturned++;
    }
  }

  if (penalty && !overturned) {
    ctx.penaltiesGiven++;
  }

  return { penalty, varReview, overturned };
}

/**
 * Ofsayt çalma olasılığını modifier
 */
export function getOffsideMultiplier(
  ctx: RefereeMatchContext,
  isHomeTeamOffside: boolean
): number {
  let mod = ctx.personalityConfig.offsideMultiplier;

  // Ev sahibi bias: ev sahibinin ofsaydını daha az çalar
  if (isHomeTeamOffside && ctx.personalityConfig.homeBias > 0) {
    mod *= (1 - ctx.personalityConfig.homeBias * 0.5);
  } else if (!isHomeTeamOffside && ctx.personalityConfig.homeBias > 0) {
    mod *= (1 + ctx.personalityConfig.homeBias * 0.5);
  }

  return mod;
}

/**
 * VAR inceleme sonucu gol iptali
 */
export function checkVARForGoal(
  ctx: RefereeMatchContext,
  isHomeTeamScoring: boolean
): { varReview: boolean; overturned: boolean } {
  let reviewChance = ctx.personalityConfig.varReviewChance;

  // Ev sahibi bias: ev sahibinin golünü daha az kontrol eder
  if (isHomeTeamScoring && ctx.personalityConfig.homeBias > 0) {
    reviewChance *= (1 - ctx.personalityConfig.homeBias * 0.5);
  } else if (!isHomeTeamScoring && ctx.personalityConfig.homeBias > 0) {
    reviewChance *= (1 + ctx.personalityConfig.homeBias * 0.3);
  }

  const varReview = Math.random() < reviewChance;

  if (!varReview) {
    return { varReview: false, overturned: false };
  }

  ctx.varReviews++;
  // Gol iptali şansı: ~15%
  const overturned = Math.random() < 0.15;
  if (overturned) ctx.goalsOverturned++;

  return { varReview, overturned };
}

/**
 * Pick a referee for a fixture match (rotating assignment)
 */
export function pickRefereeForMatch(
  referees: Referee[],
  matchWeek: number
): Referee {
  if (referees.length === 0) {
    // Fallback: generate a default balanced referee
    return {
      id: 'ref-default',
      name: 'Varsayılan Hakem',
      personality: 'dengeci',
      experience: 5,
      league_id: 'default',
      strictness: 50,
      totalMatches: 0,
      totalYellows: 0,
      totalReds: 0,
      totalPenalties: 0,
    };
  }

  // Rotating assignment based on week number
  const index = (matchWeek - 1) % referees.length;
  return referees[index];
}

/**
 * Get referee display info for UI
 */
export function getRefereeDisplayInfo(referee: Referee): {
  name: string;
  personalityLabel: string;
  personalityEmoji: string;
  strictnessLabel: string;
  strictnessColor: string;
} {
  const config = REFEREE_PERSONALITIES[referee.personality];
  let strictnessLabel: string;
  let strictnessColor: string;

  if (referee.strictness >= 75) {
    strictnessLabel = 'Çok Sert';
    strictnessColor = 'text-red-500';
  } else if (referee.strictness >= 55) {
    strictnessLabel = 'Sert';
    strictnessColor = 'text-orange-500';
  } else if (referee.strictness >= 40) {
    strictnessLabel = 'Dengeli';
    strictnessColor = 'text-yellow-500';
  } else if (referee.strictness >= 25) {
    strictnessLabel = 'Yumuşak';
    strictnessColor = 'text-green-500';
  } else {
    strictnessLabel = 'Çok Yumuşak';
    strictnessColor = 'text-emerald-400';
  }

  return {
    name: referee.name,
    personalityLabel: config.label_tr,
    personalityEmoji: config.emoji,
    strictnessLabel,
    strictnessColor,
  };
}
