import { Player, SpecificPosition, PositionGroup } from './types';
import { TRAITS_DATA, PLAY_STYLES, PERSONALITY_TRAITS } from './traitsData';
import { calculateMarketValue } from './valuation';
import { hasConflict } from './traitConflicts';

// ═══════════════════════════════════════════════════════════════
// POZISYON SİSTEMİ - Arketip Tabanlı Oyuncu Üretme Motoru
// ═══════════════════════════════════════════════════════════════

// Pozisyon → Grup haritası
export const POS_TO_GROUP: Record<SpecificPosition, PositionGroup> = {
  GK: 'GK',
  CB: 'DEF', LB: 'DEF', RB: 'DEF', LWB: 'DEF', RWB: 'DEF',
  CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID', LW: 'MID', RW: 'MID',
  CF: 'FWD', ST: 'FWD',
};

// Her grubun spesifik mevkileri
export const GROUP_POSITIONS: Record<PositionGroup, SpecificPosition[]> = {
  GK: ['GK'],
  DEF: ['CB', 'LB', 'RB', 'LWB', 'RWB'],
  MID: ['CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'],
  FWD: ['CF', 'ST'],
};

// Sıralama önceliği (Tüm oyun genelinde)
export const POS_ORDER: Record<string, number> = {
  GK: 0,
  CB: 10, LB: 11, RB: 12, LWB: 13, RWB: 14,
  CDM: 20, CM: 21, CAM: 22, LM: 23, RM: 24, LW: 25, RW: 26,
  CF: 30, ST: 31,
  DEF: 10, MID: 20, FWD: 30,
};

// Uyumlu yan mevki haritası
const COMPATIBLE_POSITIONS: Record<SpecificPosition, SpecificPosition[]> = {
  GK: [],
  CB: ['LB', 'RB', 'CDM'],
  LB: ['CB', 'LWB', 'LM'],
  RB: ['CB', 'RWB', 'RM'],
  LWB: ['LB', 'LM', 'LW'],
  RWB: ['RB', 'RM', 'RW'],
  CDM: ['CM', 'CB'],
  CM: ['CDM', 'CAM'],
  CAM: ['CM', 'CF'],
  LM: ['LW', 'LB', 'LWB', 'CM'],
  RM: ['RW', 'RB', 'RWB', 'CM'],
  LW: ['LM', 'ST', 'CF'],
  RW: ['RM', 'ST', 'CF'],
  CF: ['ST', 'CAM', 'LW', 'RW'],
  ST: ['CF', 'LW', 'RW'],
};

// Türkçe mevki isimleri
export const POS_LABELS: Record<string, string> = {
  GK: 'Kaleci', CB: 'Merkez Defans', LB: 'Sol Bek', RB: 'Sağ Bek',
  LWB: 'Sol Kanat Bek', RWB: 'Sağ Kanat Bek',
  CDM: 'Defansif Orta Saha', CM: 'Merkez Orta Saha', CAM: 'Ofansif Orta Saha',
  LM: 'Sol Açık', RM: 'Sağ Açık', LW: 'Sol Kanat', RW: 'Sağ Kanat',
  CF: 'Göbek Forvet', ST: 'Santrfor',
};

// ═══ ARKETİP TANIMLARI ═══
// Her arketip: isim, ana özellikler (yüksek), zayıf özellikler (düşük), stat ağırlıkları
interface Archetype {
  name: string;
  // Ana güçlü özellikler (baseRating civarında, variance düşük)
  strong: string[];   // Stats keys - baseRating ± 5, variance 8
  // Orta özellikler
  medium: string[];   // baseRating - 10, variance 12
  // Zayıf özellikler
  weak: string[];     // baseRating - 25, variance 10
  // Trait bonusları
  traitBoosts: Record<string, string[]>;  // traitName → boosted stats
}

// Stat key → Player field mapping
const STAT_FIELDS: Record<string, string> = {
  goalkeeping: 'goalkeeping', reflexes: 'goalkeeping',
  marking: 'marking', tackling: 'tackling', heading: 'heading',
  passing: 'passing', crossing: 'crossing', vision: 'vision', longShots: 'longShots',
  shooting: 'shooting', finishing: 'finishing', offTheBall: 'offTheBall',
  dribbling: 'dribbling', firstTouch: 'firstTouch', technique: 'technique',
  speed: 'speed', acceleration: 'acceleration', agility: 'agility', stamina: 'stamina',
  strength: 'strength', jumping: 'jumping', balance: 'balance',
  positioning: 'positioning', composure: 'composure', anticipation: 'anticipation',
  workRate: 'workRate', decisions: 'decisions', concentration: 'concentration',
  determination: 'determination', leadership: 'leadership', teamwork: 'teamwork',
  aggression: 'aggression', bravery: 'bravery', flair: 'flair',
};

// TR shortcut → stat key mapping
const TR_TO_STAT: Record<string, string> = {
  Klc: 'goalkeeping', Tk: 'tackling', Pas: 'passing', Sut: 'shooting',
  Kfa: 'heading', Hiz: 'speed', Guc: 'strength', Alg: 'anticipation', Top: 'dribbling',
};

const ARCHETYPES: Record<SpecificPosition, Archetype> = {
  GK: {
    name: 'Kaleci',
    strong: ['goalkeeping', 'reflexes', 'positioning', 'jumping', 'bravery', 'composure'],
    medium: ['concentration', 'determination', 'communication', 'strength', 'agility'],
    weak: ['speed', 'dribbling', 'shooting', 'crossing', 'finishing', 'tackling', 'marking'],
    traitBoosts: {
      'Refleks canavarı': ['goalkeeping', 'reflexes'],
      'Güvenli eller': ['goalkeeping', 'composure'],
      '1v1 ustası': ['goalkeeping', 'bravery'],
      'Hava hakimiyeti': ['heading', 'jumping'],
    },
  },
  CB: {
    name: 'Merkez Defans',
    strong: ['marking', 'tackling', 'heading', 'positioning', 'strength', 'anticipation'],
    medium: ['concentration', 'composure', 'jumping', 'passing', 'aggression', 'decisions'],
    weak: ['speed', 'dribbling', 'crossing', 'shooting', 'finishing', 'agility'],
    traitBoosts: {
      'Kale gibi': ['marking', 'tackling'],
      'Lider stoper': ['leadership', 'positioning'],
      'Hava hakimiyeti': ['heading', 'jumping'],
      'Topla çıkan stoper': ['passing', 'dribbling'],
      'Hızlı stoper': ['speed', 'acceleration'],
      'Markajcı': ['marking'],
      'Gölge Markajcı': ['marking'],
    },
  },
  LB: {
    name: 'Sol Bek',
    strong: ['speed', 'stamina', 'crossing', 'tackling', 'workRate', 'acceleration'],
    medium: ['dribbling', 'passing', 'marking', 'positioning', 'agility', 'teamwork'],
    weak: ['heading', 'shooting', 'finishing', 'strength', 'longShots', 'vision'],
    traitBoosts: {
      'Topla çıkan stoper': ['crossing', 'passing'],
      'Kanat bekçisi': ['marking', 'tackling'],
      'Uzun pas ustası': ['crossing', 'passing'],
      'Süpürücü (libero)': ['marking', 'positioning'],
    },
  },
  RB: {
    name: 'Sağ Bek',
    strong: ['speed', 'stamina', 'crossing', 'tackling', 'workRate', 'acceleration'],
    medium: ['dribbling', 'passing', 'marking', 'positioning', 'agility', 'teamwork'],
    weak: ['heading', 'shooting', 'finishing', 'strength', 'longShots', 'vision'],
    traitBoosts: {
      'Topla çıkan stoper': ['crossing', 'passing'],
      'Kanat bekçisi': ['marking', 'tackling'],
      'Uzun pas ustası': ['crossing', 'passing'],
    },
  },
  LWB: {
    name: 'Sol Kanat Beki',
    strong: ['speed', 'stamina', 'crossing', 'dribbling', 'acceleration', 'agility'],
    medium: ['workRate', 'passing', 'tackling', 'balance', 'teamwork', 'firstTouch'],
    weak: ['heading', 'shooting', 'strength', 'marking', 'longShots', 'finishing'],
    traitBoosts: {
      'Uzun pas ustası': ['crossing', 'passing'],
      'Top saklayan': ['dribbling', 'balance'],
    },
  },
  RWB: {
    name: 'Sağ Kanat Beki',
    strong: ['speed', 'stamina', 'crossing', 'dribbling', 'acceleration', 'agility'],
    medium: ['workRate', 'passing', 'tackling', 'balance', 'teamwork', 'firstTouch'],
    weak: ['heading', 'shooting', 'strength', 'marking', 'longShots', 'finishing'],
    traitBoosts: {
      'Uzun pas ustası': ['crossing', 'passing'],
      'Top saklayan': ['dribbling', 'balance'],
    },
  },
  CDM: {
    name: 'Defansif Orta Saha',
    strong: ['tackling', 'positioning', 'passing', 'strength', 'anticipation', 'workRate'],
    medium: ['marking', 'vision', 'decisions', 'concentration', 'teamwork', 'composure'],
    weak: ['dribbling', 'shooting', 'crossing', 'finishing', 'speed', 'flair'],
    traitBoosts: {
      'Pres ustası': ['tackling', 'workRate'],
      'Tempo kontrolcüsü': ['passing', 'vision'],
      'Regista': ['passing', 'vision'],
      'Oyun Bozan': ['tackling', 'anticipation'],
    },
  },
  CM: {
    name: 'Merkez Orta Saha',
    strong: ['passing', 'vision', 'stamina', 'workRate', 'teamwork', 'firstTouch'],
    medium: ['dribbling', 'technique', 'decisions', 'tackling', 'longShots', 'composure'],
    weak: ['heading', 'shooting', 'speed', 'marking', 'crossing', 'finishing'],
    traitBoosts: {
      'Oyun kurucu': ['passing', 'vision'],
      'Box-to-box': ['stamina', 'tackling', 'shooting'],
      'Top dağıtıcı': ['passing', 'firstTouch'],
      'Uzaktan şutçu': ['longShots', 'shooting'],
      'Pas arası ustası': ['anticipation', 'tackling'],
    },
  },
  CAM: {
    name: 'Ofansif Orta Saha',
    strong: ['passing', 'vision', 'dribbling', 'technique', 'flair', 'offTheBall'],
    medium: ['shooting', 'finishing', 'longShots', 'composure', 'creativity', 'decisions'],
    weak: ['tackling', 'marking', 'heading', 'strength', 'stamina', 'positioning'],
    traitBoosts: {
      '10 numara': ['passing', 'vision', 'dribbling'],
      'Boşluk bulucu': ['offTheBall', 'dribbling'],
      'Oyun görüşü yüksek': ['vision', 'passing'],
      'Uzaktan şutçu': ['longShots', 'shooting'],
    },
  },
  LM: {
    name: 'Sol Açık',
    strong: ['speed', 'crossing', 'dribbling', 'stamina', 'workRate', 'acceleration'],
    medium: ['passing', 'firstTouch', 'technique', 'agility', 'balance', 'teamwork'],
    weak: ['shooting', 'finishing', 'heading', 'marking', 'tackling', 'strength'],
    traitBoosts: {
      'Uzun pas ustası': ['crossing', 'passing'],
      'Koşu ustası': ['speed', 'stamina'],
      'Top saklayan': ['dribbling', 'balance'],
    },
  },
  RM: {
    name: 'Sağ Açık',
    strong: ['speed', 'crossing', 'dribbling', 'stamina', 'workRate', 'acceleration'],
    medium: ['passing', 'firstTouch', 'technique', 'agility', 'balance', 'teamwork'],
    weak: ['shooting', 'finishing', 'heading', 'marking', 'tackling', 'strength'],
    traitBoosts: {
      'Uzun pas ustası': ['crossing', 'passing'],
      'Koşu ustası': ['speed', 'stamina'],
      'Top saklayan': ['dribbling', 'balance'],
    },
  },
  LW: {
    name: 'Sol Kanat',
    strong: ['speed', 'dribbling', 'acceleration', 'agility', 'flair', 'crossing'],
    medium: ['finishing', 'firstTouch', 'technique', 'balance', 'offTheBall', 'vision'],
    weak: ['heading', 'strength', 'tackling', 'marking', 'stamina', 'positioning'],
    traitBoosts: {
      'Hızlı forvet': ['speed', 'acceleration'],
      'Boşluk avcısı': ['dribbling', 'offTheBall'],
      'Kontra canavarı': ['speed', 'dribbling'],
    },
  },
  RW: {
    name: 'Sağ Kanat',
    strong: ['speed', 'dribbling', 'acceleration', 'agility', 'flair', 'crossing'],
    medium: ['finishing', 'firstTouch', 'technique', 'balance', 'offTheBall', 'vision'],
    weak: ['heading', 'strength', 'tackling', 'marking', 'stamina', 'positioning'],
    traitBoosts: {
      'Hızlı forvet': ['speed', 'acceleration'],
      'Boşluk avcısı': ['dribbling', 'offTheBall'],
      'Kontra canavarı': ['speed', 'dribbling'],
    },
  },
  CF: {
    name: 'Göbek Forvet',
    strong: ['shooting', 'finishing', 'passing', 'vision', 'dribbling', 'offTheBall'],
    medium: ['technique', 'firstTouch', 'composure', 'flair', 'decisions', 'balance'],
    weak: ['heading', 'speed', 'strength', 'tackling', 'marking', 'stamina'],
    traitBoosts: {
      'Bitirici': ['shooting', 'finishing'],
      'Sahte 9': ['vision', 'passing', 'dribbling'],
      'Pozisyoncu': ['offTheBall', 'finishing'],
      'Fırsatçı': ['offTheBall', 'finishing'],
    },
  },
  ST: {
    name: 'Santrfor',
    strong: ['shooting', 'finishing', 'heading', 'speed', 'offTheBall', 'strength'],
    medium: ['acceleration', 'jumping', 'composure', 'aggression', 'determination', 'balance'],
    weak: ['vision', 'crossing', 'tackling', 'marking', 'dribbling', 'passing'],
    traitBoosts: {
      'Gol makinesi': ['shooting', 'finishing', 'offTheBall'],
      'Fiziksel santrafor': ['strength', 'heading'],
      'Hızlı forvet': ['speed', 'acceleration'],
      'Kafacı (forvet)': ['heading', 'finishing'],
      'Bitirici': ['shooting', 'finishing'],
    },
  },
};

// Eski POS_MAP backward compat
const POS_MAP = { GK: 'kaleci', DEF: 'defans', MID: 'orta_saha', FWD: 'forvet' } as const;

// Takım kadro şablonu (20 oyuncu)
const SQUAD_TEMPLATE: SpecificPosition[] = [
  'GK', 'GK',
  'CB', 'CB', 'CB', 'LB', 'RB',
  'CDM', 'CM', 'CM', 'CAM', 'LM', 'RM',
  'LW', 'ST', 'ST', 'CF',
];

// ═══ ÇİFT/ÜÇ MEVKİ SİSTEMİ ═══
function assignSecondaryPositions(
  mainPos: SpecificPosition,
  rng: () => number
): SpecificPosition[] | undefined {
  const roll = rng();
  if (mainPos === 'GK') return undefined; // Kaleci yan mevki oynayamaz
  
  const compatibles = COMPATIBLE_POSITIONS[mainPos] || [];
  if (compatibles.length === 0) return undefined;
  
  let count = 0;
  if (roll < 0.06) count = 2;       // %6 → 3 mevki
  else if (roll < 0.24) count = 1;  // %18 → 2 mevki
  else return undefined;              // %76 → 1 mevki
  
  const shuffled = [...compatibles].sort(() => 0.5 - rng());
  return shuffled.slice(0, count);
}

// ═══ STAT ÜRETME MOTORU ═══
function generateArchetypeStats(
  archetype: Archetype,
  baseRating: number,
  rng: () => number
): Record<string, number> {
  const stats: Record<string, number> = {};
  const allStats = new Set([...archetype.strong, ...archetype.medium, ...archetype.weak]);
  
  const genVal = (base: number, variance: number) => {
    return Math.min(99, Math.max(5, base + Math.floor(rng() * variance) - Math.floor(variance * 0.3)));
  };
  
  for (const stat of allStats) {
    if (archetype.strong.includes(stat)) {
      stats[stat] = genVal(baseRating, 8);
    } else if (archetype.medium.includes(stat)) {
      stats[stat] = genVal(baseRating - 10, 12);
    } else {
      stats[stat] = genVal(baseRating - 25, 10);
    }
  }
  
  // Mental statları her pozisyon için makul seviyede tut
  const mentalDefaults: Record<string, number> = {
    determination: baseRating - 5 + Math.floor(rng() * 20),
    concentration: baseRating - 10 + Math.floor(rng() * 20),
    leadership: 10 + Math.floor(rng() * 70),
    teamwork: 35 + Math.floor(rng() * 50),
    decisions: baseRating - 10 + Math.floor(rng() * 20),
    composure: baseRating - 10 + Math.floor(rng() * 20),
  };
  
  for (const [key, val] of Object.entries(mentalDefaults)) {
    if (!stats[key]) stats[key] = Math.min(99, Math.max(5, val));
  }
  
  // Physical defaults
  if (!stats.stamina) stats.stamina = 55 + Math.floor(rng() * 35);
  if (!stats.balance) stats.balance = baseRating - 10 + Math.floor(rng() * 20);
  if (!stats.agility) stats.agility = baseRating - 15 + Math.floor(rng() * 20);
  
  return stats;
}

// ═══ ANA ÜRETME FONKSİYONU ═══
export const generatePlayer = (
  positionOrGroup: SpecificPosition | PositionGroup,
  forcedRating?: number,
  randomFn: () => number = Math.random,
  specificPosOverride?: SpecificPosition
): Player => {
  const names = ['Ahmet', 'Mehmet', 'Can', 'Demir', 'Emre', 'Burak', 'Ozan', 'Arda', 'Kerem', 'Kaan', 'Mert', 'Yiğit', 'Onur', 'Deniz', 'Selim', 'Okan'];
  const surnames = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Yıldız', 'Aydın', 'Öztürk', 'Arslan', 'Doğan', 'Kılıç', 'Güneş', 'Aksoy', 'Özcan', 'Tekin'];
  
  const name = names[Math.floor(randomFn() * names.length)] + ' ' + surnames[Math.floor(randomFn() * surnames.length)];
  const age = 17 + Math.floor(randomFn() * 18);
  const baseRating = forcedRating || (60 + Math.floor(randomFn() * 25));
  
  // Determine specific position
  let specificPosition: SpecificPosition;
  let positionGroup: PositionGroup;
  
  if (specificPosOverride) {
    specificPosition = specificPosOverride;
    positionGroup = POS_TO_GROUP[specificPosOverride];
  } else if ((['GK', 'DEF', 'MID', 'FWD'] as string[]).includes(positionOrGroup)) {
    // Eski grup bazlı çağrı → rastgele spesifik pozisyon ata
    positionGroup = positionOrGroup as PositionGroup;
    const groupPos = GROUP_POSITIONS[positionGroup];
    specificPosition = groupPos[Math.floor(randomFn() * groupPos.length)];
  } else {
    specificPosition = positionOrGroup as SpecificPosition;
    positionGroup = POS_TO_GROUP[specificPosition];
  }
  
  // Yan mevki ata (%18 çift, %6 üçlü)
  const secondaryPositions = assignSecondaryPositions(specificPosition, randomFn);
  
  // Arketip al
  const archetype = ARCHETYPES[specificPosition];
  const posKey = POS_MAP[positionGroup];
  const posTraits = TRAITS_DATA[posKey];
  const posStyles = PLAY_STYLES[posKey];
  
  // ═══ TRAİT SEÇİMİ ═══
  const traitsToPick = randomFn() > 0.9 ? 3 : (randomFn() > 0.6 ? 2 : 1);
  const selectedTraits: string[] = [];
  const traitLevels: Record<string, any> = {};
  
  // Arketip uyumlu traitleri önce
  const archetypeTraits = archetype.traitBoosts;
  const archetypeTraitNames = Object.keys(archetypeTraits);
  const shuffledArchetypeTraits = [...archetypeTraitNames].sort(() => 0.5 - randomFn());
  
  const allPosTraits = [...posTraits.pozitif];
  
  for (let i = 0; i < shuffledArchetypeTraits.length && selectedTraits.length < traitsToPick; i++) {
    const traitName = shuffledArchetypeTraits[i];
    const conflictFound = selectedTraits.some(t => hasConflict(t, traitName));
    if (!conflictFound) {
      const traitDef = allPosTraits.find((t: any) => t.name === traitName);
      selectedTraits.push(traitName);
      traitLevels[traitName] = traitDef?.level || 'BEYAZ';
    }
  }
  
  // Eğer arketip traitleri yetersizse genel trait havuzundan ekle
  const shuffledPosTraits = [...allPosTraits].sort(() => 0.5 - randomFn());
  for (let i = 0; i < shuffledPosTraits.length && selectedTraits.length < traitsToPick; i++) {
    const trait = shuffledPosTraits[i];
    const conflictFound = selectedTraits.some(t => hasConflict(t, trait.name));
    if (!conflictFound && !selectedTraits.includes(trait.name)) {
      selectedTraits.push(trait.name);
      traitLevels[trait.name] = trait.level;
    }
  }

  // Negatif traitler
  const negTraits: string[] = [];
  const negRoll = randomFn();
  if (negRoll > 0.4 && posTraits?.negatif && posTraits.negatif.length > 0) {
    const shuffledNeg = [...posTraits.negatif].sort(() => 0.5 - randomFn());
    for (let i = 0; i < shuffledNeg.length; i++) {
      if (negTraits.length >= (negRoll > 0.8 ? 2 : 1)) break;
      const trait = shuffledNeg[i];
      const conflictWithPos = selectedTraits.some(t => hasConflict(t, trait.name));
      const conflictWithNeg = negTraits.some(t => hasConflict(t, trait.name));
      if (!conflictWithPos && !conflictWithNeg) negTraits.push(trait.name);
    }
  }

  // Kişilik traitleri
  const personalityTraits: string[] = [];
  const pickFromPool = (pool: any[], currentList: string[], allOtherTraits: string[]) => {
    if (!pool || pool.length === 0) return null;
    const shuffled = [...pool].sort(() => 0.5 - randomFn());
    for (const item of shuffled) {
      const hasAnyConflict = [...currentList, ...allOtherTraits].some(t => hasConflict(t, item.name));
      if (!hasAnyConflict) return item.name;
    }
    return null;
  };
  
  const mainCats = ['karakter', 'takim', 'kariyer', 'mental'] as const;
  const pickedCat = mainCats[Math.floor(randomFn() * mainCats.length)];
  const isNegMain = randomFn() < 0.35;
  const catPool = isNegMain 
    ? ((PERSONALITY_TRAITS as any)[pickedCat]?.negatif || (PERSONALITY_TRAITS as any)[pickedCat]?.pozitif) 
    : ((PERSONALITY_TRAITS as any)[pickedCat]?.pozitif || (PERSONALITY_TRAITS as any)[pickedCat]?.negatif);
  
  const mainTrait = pickFromPool(catPool, personalityTraits, [...selectedTraits, ...negTraits]);
  if (mainTrait) personalityTraits.push(mainTrait);

  const sideCats = mainCats.filter(c => c !== pickedCat);
  const pickedSideCat = sideCats[Math.floor(randomFn() * sideCats.length)];
  const isNegSide = randomFn() < 0.25;
  const sidePool = isNegSide 
    ? ((PERSONALITY_TRAITS as any)[pickedSideCat]?.negatif || (PERSONALITY_TRAITS as any)[pickedSideCat]?.pozitif) 
    : ((PERSONALITY_TRAITS as any)[pickedSideCat]?.pozitif || (PERSONALITY_TRAITS as any)[pickedSideCat]?.negatif);
  
  const sideTrait = pickFromPool(sidePool, personalityTraits, [...selectedTraits, ...negTraits]);
  if (sideTrait) personalityTraits.push(sideTrait);

  if (randomFn() < 0.15) {
    const negCat = mainCats[Math.floor(randomFn() * mainCats.length)];
    const negPool = (PERSONALITY_TRAITS as any)[negCat]?.negatif;
    const extraNeg = pickFromPool(negPool, personalityTraits, [...selectedTraits, ...negTraits]);
    if (extraNeg) personalityTraits.push(extraNeg);
  }

  // Ofsayt temizliği
  if (negTraits.includes("Ofsayta düşer")) {
    if (baseRating > 75 || selectedTraits.includes("Ofsayt ustası")) {
       const idx = negTraits.indexOf("Ofsayta düşer");
       negTraits.splice(idx, 1);
    }
  }

  // Nadir trait
  if (randomFn() < 0.05) {
    const rarePool = PERSONALITY_TRAITS.nadir;
    const rareTrait = pickFromPool(rarePool, personalityTraits, [...selectedTraits, ...negTraits]);
    if (rareTrait && personalityTraits.length > 1) personalityTraits[1] = rareTrait;
    else if (rareTrait) personalityTraits.push(rareTrait);
  }

  // PlayStyle
  let playStyle = '';
  const shuffledStyles = [...posStyles].sort(() => 0.5 - randomFn());
  for (const style of shuffledStyles) {
    const hasAnyConflict = [...selectedTraits, ...negTraits, ...personalityTraits].some(t => hasConflict(t, style.name));
    if (!hasAnyConflict) { playStyle = style.name; break; }
  }
  if (!playStyle) playStyle = posStyles[0].name;

  // Trait level kısıtlama
  let morPicked = 0, altınPicked = 0;
  const restrictedTraits: string[] = [];
  const restrictedLevels: Record<string, any> = {};
  selectedTraits.forEach((tName) => {
    let level = traitLevels[tName];
    if (level === 'MOR') { if (morPicked >= 1) level = 'ALTIN'; else morPicked++; }
    if (level === 'ALTIN') { if (altınPicked >= 1) level = 'LACIVERT'; else altınPicked++; }
    restrictedTraits.push(tName);
    restrictedLevels[tName] = level;
  });

  const potential = Math.min(99, baseRating + Math.floor(randomFn() * 15));
  const hidden_potential = Math.min(99, potential + Math.floor(randomFn() * 10));

  // ═══ ARKETİP BAZLI STAT ÜRETME ═══
  const aStats = generateArchetypeStats(archetype, baseRating, randomFn);
  
  // Trait boost uygula
  selectedTraits.forEach((tName) => {
    const boosts = archetypeTraits[tName];
    if (boosts) {
      boosts.forEach((stat: string) => {
        if (aStats[stat] !== undefined) aStats[stat] = Math.min(99, aStats[stat] + 4 + Math.floor(randomFn() * 4));
      });
    }
    // Genel boostlar
    if (tName.includes('Bitirici') || tName.includes('Gol')) { if (aStats.finishing) aStats.finishing = Math.min(99, aStats.finishing + 5); }
    if (tName.includes('Refleks') || tName.includes('Güvenli')) { if (aStats.goalkeeping) aStats.goalkeeping = Math.min(99, aStats.goalkeeping + 5); }
    if (tName.includes('Kale gibi') || tName.includes('Top kapma')) { if (aStats.tackling) aStats.tackling = Math.min(99, aStats.tackling + 5); }
    if (tName.includes('Oyun kurucu') || tName.includes('Pas')) { if (aStats.passing) aStats.passing = Math.min(99, aStats.passing + 5); }
  });

  // Yan mevki bonusu: Ek mevkisi olan oyuncular yan mevkinin en önemli statına küçük bonus alır
  if (secondaryPositions && secondaryPositions.length > 0) {
    secondaryPositions.forEach((sp) => {
      const secArchetype = ARCHETYPES[sp];
      if (secArchetype) {
        // Yan mevkinin en güçlü 2 statına +3 bonus
        const topStats = secArchetype.strong.slice(0, 2);
        topStats.forEach((stat: string) => {
          if (aStats[stat] !== undefined) aStats[stat] = Math.min(99, aStats[stat] + 3);
        });
      }
    });
  }

  const preferredFoot = randomFn() > 0.8 ? 'Left' : 'Right';
  const rightFoot = preferredFoot === 'Right' ? 100 : 20 + Math.floor(randomFn() * 60);
  const leftFoot = preferredFoot === 'Left' ? 100 : 20 + Math.floor(randomFn() * 60);

  // Kısa stat'lar (backward compat)
  const stats = {
    Klc: Math.min(99, Math.max(5, aStats.goalkeeping || (positionGroup === 'GK' ? baseRating : 10))),
    Tk: aStats.tackling || 50,
    Pas: aStats.passing || 50,
    Sut: aStats.finishing || aStats.shooting || 50,
    Kfa: aStats.heading || 50,
    Hiz: aStats.speed || 50,
    Guc: aStats.strength || 50,
    Alg: aStats.anticipation || 50,
    Top: aStats.dribbling || 50,
  };

  const partialPlayer: any = { rating: baseRating, age, potential, traitLevels: restrictedLevels };
  const marketValue = calculateMarketValue(partialPlayer);

  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    position: positionGroup,
    specificPosition,
    secondaryPositions: secondaryPositions && secondaryPositions.length > 0 ? secondaryPositions : undefined,
    rating: baseRating,
    age,
    height: positionGroup === 'GK' ? 185 + Math.floor(randomFn() * 15) : 170 + Math.floor(randomFn() * 30),
    weight: 65 + Math.floor(randomFn() * 25),
    potential,
    hidden_potential,
    market_value: marketValue,
    salary: Math.floor(baseRating * 950),
    nation: 'Turkey',
    preferred_foot: preferredFoot as any,
    defending: stats.Tk,
    passing: stats.Pas,
    shooting: stats.Sut,
    speed: stats.Hiz,
    power: stats.Guc,
    goalkeeping: stats.Klc,
    cond: 75 + Math.floor(randomFn() * 22), 
    form: 40 + Math.floor(randomFn() * 50),
    morale: 50 + Math.floor(randomFn() * 40),
    confidence: 40 + Math.floor(randomFn() * 50),
    traits: restrictedTraits,
    negTraits,
    personalityTraits,
    playStyle,
    traitLevels: restrictedLevels,
    styleLevels: { [playStyle]: 1 },
    match_ratings: [],
    scouted: false,
    
    // Detailed Technical
    finishing: aStats.finishing || 50,
    dribbling: aStats.dribbling || 50,
    firstTouch: aStats.firstTouch || 50,
    crossing: aStats.crossing || 50,
    marking: aStats.marking || 50,
    tackling: aStats.tackling || 50,
    technique: aStats.technique || 50,
    longShots: aStats.longShots || 50,
    offTheBall: aStats.offTheBall || 50,
    heading: aStats.heading || 50,
    passing: stats.Pas,

    // Detailed Mental
    determination: aStats.determination || 50,
    aggression: aStats.aggression || 40,
    bravery: aStats.bravery || 40,
    workRate: aStats.workRate || 50,
    decisions: aStats.decisions || 50,
    concentration: aStats.concentration || 50,
    leadership: aStats.leadership || 30,
    anticipation: stats.Alg,
    flair: aStats.flair || 20,
    positioning: aStats.positioning || 50,
    composure: aStats.composure || 50,
    teamwork: aStats.teamwork || 50,
    vision: aStats.vision || 50,

    // Detailed Physical
    acceleration: aStats.acceleration || stats.Hiz,
    speed: stats.Hiz,
    agility: aStats.agility || 50,
    balance: aStats.balance || 50,
    strength: stats.Guc,
    stamina: aStats.stamina || 60,
    jumping: aStats.jumping || 50,
    leftFoot,
    rightFoot,
    
    // Compatibility stats
    Klt: baseRating,
    Klc: stats.Klc,
    Tk: stats.Tk,
    Pas: stats.Pas,
    Sut: stats.Sut,
    Kfa: stats.Kfa,
    Hiz: stats.Hiz,
    Güç: stats.Guc,
    Alg: stats.Alg,
    Top: stats.Top,
    Kon: 100,
  };
};

export const generateStarterPlayer = generatePlayer;

// Kadro üretme fonksiyonu (NPC takımlar için)
export function generateStableSquad(teamName: string, tier: number, rng?: () => number) {
  const randomFn = rng || (() => Math.random());
  
  const TR_FIRST_NAMES = [
    "Ahmet", "Mehmet", "Mustafa", "Can", "Burak", "Emre", "Arda", "Ömer", "Yiğit", "Mert",
    "Ali", "Hakan", "Kerem", "Efe", "Deniz", "Tolga", "Sercan", "Cengiz", "Umut", "Berk",
    "Furkan", "Oğuz", "Salih", "İbrahim", "Yusuf", "Kaan", "Baran", "Alper", "Murat", "Cem",
    "Semih", "Batuhan", "Emirhan", "Taha", "Rıza", "Niyazi", "Tayfun", "Gökhan", "Savaş", "Erkan",
  ];
  const TR_LAST_NAMES = [
    "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Erdogan", "Aydın", "Özdemir", "Arslan",
    "Koç", "Öztürk", "Kılıç", "Doğan", "Keskin", "Akar", "Çetin", "Korkmaz", "Gündüz",
    "Polat", "Erdoğan", "Şen", "Güven", "Tan", "Aktaş", "Karadağ", "Uğur", "Başaran",
    "Söğüt", "Tuncel", "Balcı", "Kıraç", "Soysal", "Velioğlu", "Yavuz", "Dinç", "Köse", "Okutan",
  ];

  return SQUAD_TEMPLATE.map((pos, i) => {
    const baseRating = 80 - (tier * 10);
    const rating = baseRating + Math.floor(randomFn() * 15);
    const firstName = TR_FIRST_NAMES[Math.floor(randomFn() * TR_FIRST_NAMES.length)];
    const lastName = TR_LAST_NAMES[Math.floor(randomFn() * TR_LAST_NAMES.length)];
    
    const p = generatePlayer(pos, rating, randomFn);
    return {
      ...p,
      name: `${firstName} ${lastName}`,
      nation: 'Türkiye',
      id: `npc-${teamName.replace(/\s+/g, '-')}-${i}`,
      club: teamName,
      team_name: teamName,
    };
  });
}

export const aiTeamNames = [
  'Kartal Gücü', 'Aslan United', 'Kanarya City', 'Fırtına FC', 'Boğaz Spor', 'Yıldızlar Birliği', 
  'Anadolu Kartalı', 'Sahil Belediye', 'İç Anadolu FC', 'Akdeniz Spor', 'Ege United', 'Marmara Gücü', 
  'Zirve Spor', 'Güneşli City', 'Mavi Liman', 'Altınordu Yıldız', 'Demir Spor', 'Kuzey Gücü',
  'Körfez City', 'Yeşil Vadi', 'Çınar Spor', 'Gümüş Ok', 'Yıldırım United', 'Fırtına 1923',
  'Başkent Akademi', 'Ovada City', 'Dağ United', 'Liman Spor', 'Sanayi Gücü', 'Demir Bilek',
  'Altın Patiler', 'Gölge Spor', 'Işık City', 'Gece United', 'Toprak FC', 'Rüzgar Spor',
  'Buzul United', 'Lav Spor', 'Kutup City', 'Kumral FC', 'Çöl United', 'Vaha Spor',
  'Derin Su City', 'Zeytin Spor', 'Üzüm United', 'Pamuk FC', 'İpek City', 'Keten Spor',
  'Dantel United', 'Nakış Spor', 'Boya City', 'Fırça FC', 'Tuval United', 'Sergi Spor',
  'Yaz United', 'Kış Spor', 'Bahar City', 'Güz FC', 'Mevsim United', 'Zaman Spor',
  'Saat City', 'Dakika FC', 'Saniye United', 'An Spor', 'Rüya City', 'Gerçek FC',
  'Hayal United', 'Umut Spor', 'Barış City', 'Sevgi FC', 'Dost United', 'Kardeş Spor'
];

export const generateEliteWonderkid = (): Player => {
  const allPositions: SpecificPosition[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'CF', 'ST'];
  const pos = allPositions[Math.floor(Math.random() * allPositions.length)];
  
  const rating = 75 + Math.floor(Math.random() * 8);
  const player = generateStarterPlayer(pos, rating);
  
  return {
    ...player,
    age: 16 + Math.floor(Math.random() * 2),
    hidden_potential: 92 + Math.floor(Math.random() * 8),
    morale: 100,
    personalityTraits: [...(player.personalityTraits || []), 'Gelecek vaat eden', 'Elit Wonderkid'],
    is_legend: false,
  } as Player;
};
