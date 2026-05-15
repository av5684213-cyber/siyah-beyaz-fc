// ═══════════════════════════════════════════════════════════════════════
// Managerium — Gençlik Akademisi Sistemi (Youth Academy System)
// Comprehensive youth development, scouting, and promotion logic
// ═══════════════════════════════════════════════════════════════════════

import { PositionGroup, SpecificPosition } from './types';

// ─── Enums ────────────────────────────────────────────────────────────

export enum YouthCategory {
  U17 = 'U17',
  U19 = 'U19',
  U21 = 'U21',
}

export type DevelopmentCurve = 'early' | 'late' | 'normal' | 'injury_prone';
export type PotentialRating = 'low' | 'medium' | 'high' | 'world_class';

// ─── Interfaces ───────────────────────────────────────────────────────

export interface YouthScoutReport {
  scoutName: string;
  date: string;
  overallAssessment: string;
  keyStrengths: string[];
  keyWeaknesses: string[];
  potentialRating: PotentialRating;
  comparisonPlayer: string | null;
  recommendedRole: string;
}

export interface AcademyFacility {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  upgradeCost: number[];
  effects: {
    trainingSpeed: number;   // multiplier per level
    scoutQuality: number;    // multiplier per level
    injuryPrevention: number; // flat reduction per level
  };
  icon: string;
}

export interface FacilityState {
  facilityId: string;
  currentLevel: number;
}

export interface YouthPlayer {
  // Core identity
  id: string;
  name: string;
  age: number;
  position: PositionGroup;
  specificPosition: SpecificPosition;

  // Ratings
  rating: number;
  potential: number;
  hidden_potential: number;

  // Academy context
  academyLevel: number;
  joinDate: string;
  weeklyTrainingHours: number;
  developmentCurve: DevelopmentCurve;
  isWonderkid: boolean;
  category: YouthCategory;

  // Scout data
  scoutReport: YouthScoutReport | null;

  // Traits
  personalityTraits: string[];
  traits: string[];
  traitLevels?: Record<string, 'MOR' | 'ALTIN' | 'LACIVERT' | 'BEYAZ'>;

  // Primary stats
  speed: number;
  passing: number;
  shooting: number;
  defending: number;
  power: number;
  goalkeeping: number;

  // Technical stats
  finishing?: number;
  dribbling?: number;
  firstTouch?: number;
  crossing?: number;
  marking?: number;
  tackling?: number;
  technique?: number;
  longShots?: number;
  offTheBall?: number;
  heading?: number;

  // Mental stats
  aggression?: number;
  bravery?: number;
  workRate?: number;
  decisions?: number;
  determination?: number;
  concentration?: number;
  leadership?: number;
  anticipation?: number;
  flair?: number;
  positioning?: number;
  composure?: number;
  teamwork?: number;
  vision?: number;

  // Physical stats
  agility?: number;
  balance?: number;
  strength?: number;
  acceleration?: number;
  jumping?: number;
  stamina?: number;
  control?: number;

  // Condition
  cond: number;
  form: number;
  morale: number;
  confidence: number;

  // Injury tracking
  injured: boolean;
  injuryWeeksRemaining: number;

  // Training tracking
  totalTrainingWeeks: number;
  statsGainedThisSeason: Record<string, number>;
}

export interface PromotionRecommendation {
  ready: boolean;
  confidence: number; // 0-100
  reasons: string[];
  warnings: string[];
  suggestedPosition: SpecificPosition;
}

// ─── Turkish Name Pools (40+ each) ───────────────────────────────────

const FIRST_NAMES: string[] = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Can', 'Burak', 'Emre', 'Arda', 'Ömer',
  'Yiğit', 'Mert', 'Ali', 'Hakan', 'Kerem', 'Efe', 'Deniz', 'Tolga',
  'Sercan', 'Cengiz', 'Umut', 'Berk', 'Furkan', 'Oğuz', 'Salih',
  'İbrahim', 'Yusuf', 'Kaan', 'Baran', 'Alper', 'Murat', 'Cem',
  'Semih', 'Batuhan', 'Emirhan', 'Taha', 'Rıza', 'Niyazi', 'Tayfun',
  'Gökhan', 'Savaş', 'Erkan', 'Eren', 'Kadir', 'Okan', 'Emrullah',
  'Doğukan', 'Sinan', 'Volkan', 'Çağrı', 'İlker', 'Melih', 'Tolga',
  'Bedirhan',
];

const LAST_NAMES: string[] = [
  'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Erdogan', 'Aydın',
  'Özdemir', 'Arslan', 'Koç', 'Öztürk', 'Kılıç', 'Doğan', 'Keskin', 'Akar',
  'Çetin', 'Korkmaz', 'Gündüz', 'Polat', 'Erdoğan', 'Şen', 'Güven', 'Tan',
  'Aktaş', 'Karadağ', 'Uğur', 'Başaran', 'Söğüt', 'Tuncel', 'Balcı', 'Kıraç',
  'Soysal', 'Velioğlu', 'Yavuz', 'Dinç', 'Köse', 'Okutan', 'Güneş', 'Aksoy',
  'Özcan', 'Tekin', 'Şimşek', 'Ateş', 'Turhan', 'Avci', 'Tamer', 'Önal',
  'Çevik', 'Dalga',
];

// ─── Scout Names ──────────────────────────────────────────────────────

const SCOUT_NAMES: string[] = [
  'Hasan Hoca', 'Ahmet Gözlemci', 'Murat Talentscout', 'İbrahim Genç',
  'Yusuf Akademi', 'Kemal Analist', 'Selçuk İzleyici', 'Ferhat Keşifçi',
  'Cem Tarayıcı', 'Oktay Gözlemci', 'Hüseyin Gençlik', 'Rıdvan Scout',
  'Nihat Yetenek Avcısı', 'Şafak Keşif', 'Bülent İzci',
];

// ─── Comparison Players (real player names for scout reports) ─────────

const COMPARISON_PLAYERS: Record<PositionGroup, string[]> = {
  GK: ['Cenk Gönay', 'Altay Bayındır', 'Volkan Demirel', 'Feyyaz Uçar'],
  DEF: ['Çağlar Söyüncü', 'Merih Demiral', 'Ozan Kabak', 'Zeki Çelik'],
  MID: ['Hakan Çalhanoğlu', 'Arda Güler', 'İlkay Gündoğan', 'Orkun Kökçü'],
  FWD: ['Cengiz Ünder', 'Burak Yılmaz', 'Enes Ünal', 'Kerem Aktürkoğlu'],
};

// ─── Position Config ─────────────────────────────────────────────────

const POSITION_ARCHETYPES: Record<SpecificPosition, {
  group: PositionGroup;
  keyStats: string[];
  secondaryStats: string[];
  weakStats: string[];
}> = {
  GK: {
    group: 'GK',
    keyStats: ['goalkeeping', 'reflexes', 'positioning', 'jumping', 'composure', 'concentration'],
    secondaryStats: ['strength', 'agility', 'determination', 'bravery', 'decisions'],
    weakStats: ['speed', 'dribbling', 'shooting', 'crossing', 'finishing', 'tackling', 'marking', 'passing'],
  },
  CB: {
    group: 'DEF',
    keyStats: ['marking', 'tackling', 'heading', 'positioning', 'strength', 'anticipation'],
    secondaryStats: ['concentration', 'composure', 'jumping', 'passing', 'aggression', 'decisions'],
    weakStats: ['speed', 'dribbling', 'crossing', 'shooting', 'finishing', 'agility', 'flair'],
  },
  LB: {
    group: 'DEF',
    keyStats: ['speed', 'stamina', 'crossing', 'tackling', 'workRate', 'acceleration'],
    secondaryStats: ['dribbling', 'passing', 'marking', 'positioning', 'agility', 'teamwork'],
    weakStats: ['heading', 'shooting', 'finishing', 'strength', 'longShots', 'vision'],
  },
  RB: {
    group: 'DEF',
    keyStats: ['speed', 'stamina', 'crossing', 'tackling', 'workRate', 'acceleration'],
    secondaryStats: ['dribbling', 'passing', 'marking', 'positioning', 'agility', 'teamwork'],
    weakStats: ['heading', 'shooting', 'finishing', 'strength', 'longShots', 'vision'],
  },
  LWB: {
    group: 'DEF',
    keyStats: ['speed', 'stamina', 'crossing', 'dribbling', 'acceleration', 'agility'],
    secondaryStats: ['workRate', 'passing', 'tackling', 'balance', 'teamwork', 'firstTouch'],
    weakStats: ['heading', 'shooting', 'strength', 'marking', 'longShots', 'finishing'],
  },
  RWB: {
    group: 'DEF',
    keyStats: ['speed', 'stamina', 'crossing', 'dribbling', 'acceleration', 'agility'],
    secondaryStats: ['workRate', 'passing', 'tackling', 'balance', 'teamwork', 'firstTouch'],
    weakStats: ['heading', 'shooting', 'strength', 'marking', 'longShots', 'finishing'],
  },
  CDM: {
    group: 'MID',
    keyStats: ['tackling', 'positioning', 'passing', 'strength', 'anticipation', 'workRate'],
    secondaryStats: ['marking', 'vision', 'decisions', 'concentration', 'teamwork', 'composure'],
    weakStats: ['dribbling', 'shooting', 'crossing', 'finishing', 'speed', 'flair'],
  },
  CM: {
    group: 'MID',
    keyStats: ['passing', 'vision', 'stamina', 'workRate', 'teamwork', 'firstTouch'],
    secondaryStats: ['dribbling', 'technique', 'decisions', 'tackling', 'longShots', 'composure'],
    weakStats: ['heading', 'shooting', 'speed', 'marking', 'crossing', 'finishing'],
  },
  CAM: {
    group: 'MID',
    keyStats: ['passing', 'vision', 'dribbling', 'technique', 'flair', 'offTheBall'],
    secondaryStats: ['shooting', 'finishing', 'longShots', 'composure', 'decisions', 'creativity' as string],
    weakStats: ['tackling', 'marking', 'heading', 'strength', 'stamina', 'positioning'],
  },
  LM: {
    group: 'MID',
    keyStats: ['speed', 'crossing', 'dribbling', 'stamina', 'workRate', 'acceleration'],
    secondaryStats: ['passing', 'firstTouch', 'technique', 'agility', 'balance', 'teamwork'],
    weakStats: ['shooting', 'finishing', 'heading', 'marking', 'tackling', 'strength'],
  },
  RM: {
    group: 'MID',
    keyStats: ['speed', 'crossing', 'dribbling', 'stamina', 'workRate', 'acceleration'],
    secondaryStats: ['passing', 'firstTouch', 'technique', 'agility', 'balance', 'teamwork'],
    weakStats: ['shooting', 'finishing', 'heading', 'marking', 'tackling', 'strength'],
  },
  LW: {
    group: 'MID',
    keyStats: ['speed', 'dribbling', 'acceleration', 'agility', 'flair', 'crossing'],
    secondaryStats: ['finishing', 'firstTouch', 'technique', 'balance', 'offTheBall', 'vision'],
    weakStats: ['heading', 'strength', 'tackling', 'marking', 'stamina', 'positioning'],
  },
  RW: {
    group: 'MID',
    keyStats: ['speed', 'dribbling', 'acceleration', 'agility', 'flair', 'crossing'],
    secondaryStats: ['finishing', 'firstTouch', 'technique', 'balance', 'offTheBall', 'vision'],
    weakStats: ['heading', 'strength', 'tackling', 'marking', 'stamina', 'positioning'],
  },
  CF: {
    group: 'FWD',
    keyStats: ['shooting', 'finishing', 'passing', 'vision', 'dribbling', 'offTheBall'],
    secondaryStats: ['technique', 'firstTouch', 'composure', 'flair', 'decisions', 'balance'],
    weakStats: ['heading', 'speed', 'strength', 'tackling', 'marking', 'stamina'],
  },
  ST: {
    group: 'FWD',
    keyStats: ['shooting', 'finishing', 'heading', 'speed', 'offTheBall', 'strength'],
    secondaryStats: ['acceleration', 'jumping', 'composure', 'aggression', 'determination', 'balance'],
    weakStats: ['vision', 'crossing', 'tackling', 'marking', 'dribbling', 'passing'],
  },
};

const GROUP_POSITIONS: Record<PositionGroup, SpecificPosition[]> = {
  GK: ['GK'],
  DEF: ['CB', 'LB', 'RB', 'LWB', 'RWB'],
  MID: ['CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'],
  FWD: ['CF', 'ST'],
};

// ─── Personality trait pools for youth ───────────────────────────────

const YOUTH_PERSONALITY_TRAITS: string[] = [
  // Positive
  'Profesyonel', 'Disiplinli', 'Çalışkan', 'Hırslı', 'Kazanan karakter',
  'Takım oyuncusu', 'Sessiz lider', 'Sadık', 'Gençlere destek olur',
  'Büyük maç oyuncusu', 'Soğukkanlı', 'Geri dönüş lideri', 'Baskı sever',
  // Negative
  'Tembel', 'Disiplinsiz', 'Gece hayatı düşkünü', 'Rahatına düşkün',
  'İsteksiz', 'Egoist', 'Problem çıkaran', 'Kibirli',
  'Panikçi', 'Kırılgan mental', 'Özgüven sorunu',
];

const POSITIVE_YOUTH_TRAITS: string[] = [
  'Profesyonel', 'Disiplinli', 'Çalışkan', 'Hırslı', 'Kazanan karakter',
  'Takım oyuncusu', 'Sessiz lider', 'Sadık', 'Gençlere destek olur',
  'Büyük maç oyuncusu', 'Soğukkanlı', 'Geri dönüş lideri', 'Baskı sever',
];

const NEGATIVE_YOUTH_TRAITS: string[] = [
  'Tembel', 'Disiplinsiz', 'Gece hayatı düşkünü', 'Rahatına düşkün',
  'İsteksiz', 'Egoist', 'Problem çıkaran', 'Kibirli',
  'Panikçi', 'Kırılgan mental', 'Özgüven sorunu',
];

// ─── Youth trait pools (position-based) ──────────────────────────────

const YOUTH_TRAITS_BY_GROUP: Record<PositionGroup, string[]> = {
  GK: ['Refleks canavarı', 'Güvenli eller', '1v1 ustası', 'Hava hakimiyeti', 'Lider kaleci', 'Sweeper keeper', 'Penaltı ustası', 'Büyük maç kalecisi'],
  DEF: ['Kale gibi', 'Top kapma uzmanı', 'Pozisyon ustası', 'Hava hakimiyeti', 'Markajcı', 'Lider stoper', 'Ofsayt ustası', 'Hızlı stoper', 'Topla çıkan stoper', 'Uzun pas ustası'],
  MID: ['Oyun kurucu', 'Top dağıtıcı', 'Box-to-box', 'Pres ustası', 'Top saklayan', 'Oyun görüşü yüksek', 'Boşluk bulucu', 'Tempo kontrolcüsü', '10 numara', 'Uzaktan şutçu'],
  FWD: ['Bitirici', 'Pozisyoncu', 'Hızlı forvet', 'Fiziksel santrafor', 'Fırsatçı', 'Boşluk avcısı', 'Gol makinesi', 'Kontra canavarı', 'Büyük maç oyuncusu'],
};

// ─── Academy Rating/Potential Ranges by Level ────────────────────────

const ACADEMY_LEVEL_CONFIG = {
  1: {
    ratingRange: [40, 52] as [number, number],
    potentialRange: [55, 68] as [number, number],
    wonderkidChance: 0.005,
    avgStatLevel: 42,
    positionDistribution: { GK: 0.1, DEF: 0.35, MID: 0.35, FWD: 0.2 },
  },
  2: {
    ratingRange: [42, 56] as [number, number],
    potentialRange: [58, 72] as [number, number],
    wonderkidChance: 0.01,
    avgStatLevel: 46,
    positionDistribution: { GK: 0.1, DEF: 0.3, MID: 0.35, FWD: 0.25 },
  },
  3: {
    ratingRange: [44, 60] as [number, number],
    potentialRange: [60, 78] as [number, number],
    wonderkidChance: 0.02,
    avgStatLevel: 50,
    positionDistribution: { GK: 0.1, DEF: 0.3, MID: 0.35, FWD: 0.25 },
  },
  4: {
    ratingRange: [46, 64] as [number, number],
    potentialRange: [62, 85] as [number, number],
    wonderkidChance: 0.035,
    avgStatLevel: 54,
    positionDistribution: { GK: 0.08, DEF: 0.3, MID: 0.35, FWD: 0.27 },
  },
  5: {
    ratingRange: [48, 68] as [number, number],
    potentialRange: [65, 90] as [number, number],
    wonderkidChance: 0.05,
    avgStatLevel: 58,
    positionDistribution: { GK: 0.08, DEF: 0.28, MID: 0.37, FWD: 0.27 },
  },
};

// ─── Turkish Assessment Templates ────────────────────────────────────

const OVERALL_ASSESSMENTS: Record<string, string[]> = {
  excellent: [
    'Bu oyuncu geleceğin yıldızı olabilir. Şu anki seviyesi yaşına göre oldukça yüksek.',
    'Mükemmel bir yetenek. Rakipleri arasında sıyrılacak kalitede.',
    'Nadir görülen bir potansiyel var. Her yönüyle dikkat çekiyor.',
    'Olağanüstü yetenekli bir genç. Özel ilgi gerektiriyor.',
  ],
  good: [
    'Güçlü bir yetenek. Düzenli antrenmanla ilk takıma çıkabilir.',
    'Üst düzey bir aday. Gelişime açık birçok alanı var.',
    'İyi bir temel var. Doğru yönlendirmeyle önemli bir oyuncu olabilir.',
    'Potansiyel yüksek. Zamanla açığa çıkacak bir yetenek.',
  ],
  average: [
    'Ortalama üstü bir yetenek. Sabırla geliştirilmeli.',
    'İdmanlı bir oyuncu. Beklentileri karşılayabilir.',
    'Kullanışlı bir genç. Belirli bir rolde değer katabilir.',
  ],
  below: [
    'Gelişmesi için çok çalışması gerekiyor. Şu an sınırlı etki.',
    'Potansiyeli düşük. Yedek kulübesi için düşünülmeli.',
    'Rakiplerinin gerisinde. Acil gelişim programı lazım.',
  ],
};

const STRENGTH_DESCRIPTIONS: Record<string, string[]> = {
  speed: ['Çok hızlı', 'İnanılmaz patlayıcı hız', 'Rüzgar gibi koşar', 'Hızlı'],
  passing: ['Pasları keskin', 'Harika pas vizyonu', 'Top dağıtımı mükemmel', 'Pas oranı yüksek'],
  shooting: ['Güçlü şut atar', 'Bitirici vuruşları etkili', 'Şut kalitesi iyi'],
  defending: ['Güçlü müdahaleler', 'Defansif açıdan sağlam', 'Top kapma becerisi gelişmiş'],
  power: ['Fiziksel olarak güçlü', 'İkili mücadelelerde üstün'],
  goalkeeping: ['Refleksleri hızlı', 'Kurtarışları güvenilir', 'Kale hakimiyeti iyi'],
  dribbling: ['Top kontrolü muazzam', 'Dribling yeteneği dikkat çekici', 'Boğazına kadar top saklar'],
  finishing: ['Bitiricilik gücü yüksek', 'Net fırsatları değerlendirir', 'Gol hissi gelişmiş'],
  heading: ['Hava toplarında etkili', 'Kafa vuruşları güçlü', 'Hakimiyeti iyi'],
  vision: ['Saha görüşü geniş', 'Oyun okuyucu', 'Önden görme yeteneği var'],
  tackling: ['Müdahaleleri temiz', 'Top çalma oranı yüksek', 'Zamanlaması iyi'],
  anticipation: ['Oyunu önceden okur', 'Hamleleri sezer', 'Pozisyon alma yeteneği gelişmiş'],
  workRate: ['Çalışkan bir oyuncu', 'Asla pes etmez', 'Sahayı ter dökmüş halde terk eder'],
  composure: ['Soğukkanlı', 'Baskı altında sakin kalır', 'Kritik anlarda güvenilir'],
  leadership: ['Doğal lider', 'Sahayı yönlendirir', 'Arkadaşlarını motive eder'],
  determination: ['Kararlı karakter', 'Mücadeleci ruhu var', 'Vazgeçmez'],
  flair: ['Özel yetenekli', 'Kreatif oyuncu', 'Sürpriz yapabilir'],
  stamina: ['Dayanıklılığı yüksek', '90 dakika boyunca etkili', 'Kondisyonu mükemmel'],
  crossing: ['Ortaları isabetli', 'Kanat bindirmeleri etkili'],
  longShots: ['Uzaktan şutları tehlikeli', 'Distan golcü'],
  offTheBall: ['Boşlukları iyi bulur', 'Pozisyon zekası yüksek'],
  technique: ['Tekniği gelişmiş', 'Top ayağında dans eder'],
  marking: ['Markajı sıkı', 'Rakibi izler'],
  firstTouch: ['İlk kontrolleri harika', 'Topu yumuşak indirir'],
  positioning: ['Pozisyon alması doğru', 'Sahada yerini bilir'],
  acceleration: ['Hızlanması muazzam', 'İlk adımları patlayıcı'],
  agility: ['Çevik hareket eder', 'Yön değiştirmesi hızlı'],
  jumping: ['Zıplaması etkileyici', 'Havada hakim'],
  strength: ['Fiziksel gücü yüksek', 'Güreş gücü var'],
  concentration: ['Konsantrasyonu uzun süreli', 'Dikkati dağılmaz'],
  decisions: ['Kararları doğru', 'Oyun zekası gelişmiş'],
  teamwork: ['Takım oyununa yatkın', 'Takım arkadaşı için oynar'],
  aggression: ['Agresif oyun tarzı', 'Rakipten korkmaz'],
  bravery: ['Cesur oyuncu', 'Risk almaktan çekinmez'],
  balance: ['Dengesi sağlam', 'İkili mücadelelerde yıkılmaz'],
  control: ['Top kontrolü iyi', 'Topu ayağında tutar'],
};

const WEAKNESS_DESCRIPTIONS: Record<string, string[]> = {
  speed: ['Hızı yetersiz', 'Patlayıcı hız eksik', 'Sprinter forvetlerin gerisinde'],
  passing: ['Pas oranı düşük', 'Kararlarında pas hatası var', 'Top dağıtımı zayıf'],
  shooting: ['Şut kalitesi düşük', 'Bitiricilik zayıf', 'Fırsatları kaçırıyor'],
  defending: ['Savunması yetersiz', 'Müdahalelerde geç kalıyor'],
  power: ['Fiziksel olarak zayıf', 'İkili mücadelelerde düşüyor'],
  dribbling: ['Top kontrolü zayıf', 'Basit kayıplar yapıyor', 'Baskı altında top kaybeder'],
  finishing: ['Bitiricilik vasat', 'Net fırsatları harcıyor'],
  heading: ['Hava toplarında etkisiz', 'Kafa vuruşları eksik'],
  vision: ['Saha görüşü dar', 'Pas opsiyonlarını görmekte geç kalıyor'],
  tackling: ['Top çalmada başarısız', 'Müdahalelerde hata yapıyor'],
  workRate: ['Çalışkanlığı yetersiz', 'Sahada pasif kalıyor'],
  composure: ['Soğukkanlı değil', 'Baskı altında panik yapıyor'],
  stamina: ['Dayanıklılığı düşük', 'Maç sonu yorgun düşüyor'],
  crossing: ['Ortaları isabetsiz', 'Kanat bindirmeleri zayıf'],
  longShots: ['Uzaktan şutları etkisiz'],
  offTheBall: ['Boşluk bulamıyor', 'Sahada kayboluyor'],
  technique: ['Tekniği ham', 'Top ayağında rahat değil'],
  marking: ['Markajı gevşek', 'Rakibini kaybediyor'],
  firstTouch: ['İlk kontrolleri kötü', 'Topu kontrol etmekte zorlanıyor'],
  positioning: ['Pozisyon alması hatalı', 'Yerini iyi seçemiyor'],
  concentration: ['Konsantrasyonu düşük', 'Maçın içinde kaybolabiliyor'],
  decisions: ['Kararları acele', 'Yanlış tercih yapıyor'],
  teamwork: ['Bencil oynuyor', 'Takım oyununa uzak'],
  aggression: ['Aşırı agresif', 'Kart görmeye meyilli'],
  leadership: ['Liderlik yok', 'Saha içinde pasif'],
  determination: ['Kararsız', 'Mücadele ruhu zayıf'],
  flair: ['Kreatif değil', 'Öngörülebilir oyun tarzı'],
  anticipation: ['Oyunu okuyamıyor', 'Hamleleri sezemiyor'],
  acceleration: ['Hızlanması yavaş', 'İlk adımlar ağır'],
  agility: ['Çevikliği yetersiz', 'Yön değiştirmekte zorlanıyor'],
  jumping: ['Zıplaması zayıf', 'Havada etkisiz'],
  strength: ['Fiziksel olarak yetersiz', 'Güç mücadelelerinde düşüyor'],
  balance: ['Dengesi zayıf', 'Basit çelme takılır'],
  control: ['Topu tutamıyor', 'Kontrolü kötü'],
};

const RECOMMENDED_ROLES: Record<SpecificPosition, string[]> = {
  GK: ['Birinci Kaleci', 'Yedek Kaleci', 'Uzun vadeli kaleci projesi'],
  CB: ['Merkez Defans', 'Sağ/Sol Stoper', 'Boşta oyuncu'],
  LB: ['Sol Bek', 'Alternatif Sol Bek', 'Kanat bek olarak geliştirilmeli'],
  RB: ['Sağ Bek', 'Alternatif Sağ Bek', 'Kanat bek olarak geliştirilmeli'],
  LWB: ['Sol Kanat Beki', 'Alternatif LWB'],
  RWB: ['Sağ Kanat Beki', 'Alternatif RWB'],
  CDM: ['Defansif Orta Saha', 'Pivot', 'Oyun bozan CDM'],
  CM: ['Merkez Orta Saha', 'Box-to-box', 'Saha genelinde 8 numara'],
  CAM: ['Ofansif Orta Saha', '10 numara', 'Göbek oyuncusu'],
  LM: ['Sol Açık', 'Kanat oyuncusu', 'Alternatif sol kanat'],
  RM: ['Sağ Açık', 'Kanat oyuncusu', 'Alternatif sağ kanat'],
  LW: ['Sol Kanat', 'Kanat forvet', 'Sol kanat hücumcusu'],
  RW: ['Sağ Kanat', 'Kanat forvet', 'Sağ kanat hücumcusu'],
  CF: ['Göbek Forvet', 'İkinci forvet', '10 numara rolünde'],
  ST: ['Santrfor', 'Golcü', 'Hedef adam'],
};

// ─── YOUTH_FACILITIES Constant ───────────────────────────────────────

export const YOUTH_FACILITIES: AcademyFacility[] = [
  {
    id: 'training_pitch',
    name: 'Antrenman Saha',
    description: 'Antrenman sahası kalitesi, genç oyuncuların temel gelişim hızını belirler.',
    level: 1,
    maxLevel: 5,
    upgradeCost: [500_000, 1_500_000, 4_000_000, 8_000_000, 15_000_000],
    effects: {
      trainingSpeed: 0.12,
      scoutQuality: 0.02,
      injuryPrevention: 0.01,
    },
    icon: '🏟️',
  },
  {
    id: 'gym',
    name: 'Spor Salonu',
    description: 'Modern ekipmanlar, fiziksel gelişimi hızlandırır ve sakatlık riskini azaltır.',
    level: 1,
    maxLevel: 5,
    upgradeCost: [300_000, 1_000_000, 3_000_000, 6_000_000, 12_000_000],
    effects: {
      trainingSpeed: 0.08,
      scoutQuality: 0.0,
      injuryPrevention: 0.03,
    },
    icon: '🏋️',
  },
  {
    id: 'medical_center',
    name: 'Tıp Merkezi',
    description: 'Tıbbi olanaklar, sakatlık iyileşme süresini kısaltır ve önleyici bakım sağlar.',
    level: 1,
    maxLevel: 5,
    upgradeCost: [400_000, 1_200_000, 3_500_000, 7_000_000, 14_000_000],
    effects: {
      trainingSpeed: 0.02,
      scoutQuality: 0.0,
      injuryPrevention: 0.06,
    },
    icon: '🏥',
  },
  {
    id: 'analysis_room',
    name: 'Analiz Odası',
    description: 'Video analiz ve istatistik araçları, zihinsel gelişimi destekler.',
    level: 1,
    maxLevel: 5,
    upgradeCost: [200_000, 800_000, 2_500_000, 5_000_000, 10_000_000],
    effects: {
      trainingSpeed: 0.06,
      scoutQuality: 0.04,
      injuryPrevention: 0.01,
    },
    icon: '📊',
  },
  {
    id: 'scout_network',
    name: 'Gözlem Ağı',
    description: 'Genişletilmiş gözlem ağı, daha kaliteli genç oyuncular keşfetmenizi sağlar.',
    level: 1,
    maxLevel: 5,
    upgradeCost: [600_000, 2_000_000, 5_000_000, 10_000_000, 20_000_000],
    effects: {
      trainingSpeed: 0.0,
      scoutQuality: 0.12,
      injuryPrevention: 0.0,
    },
    icon: '🔭',
  },
  {
    id: 'dormitory',
    name: 'Yurt',
    description: 'Konaklama imkanları, genç oyuncuların kulübe bağlılığını ve adaptasyonunu artırır.',
    level: 1,
    maxLevel: 5,
    upgradeCost: [350_000, 1_000_000, 3_000_000, 6_000_000, 12_000_000],
    effects: {
      trainingSpeed: 0.04,
      scoutQuality: 0.02,
      injuryPrevention: 0.02,
    },
    icon: '🏠',
  },
];

// ─── Helper Functions ────────────────────────────────────────────────

function rng(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getYouthCategory(age: number): YouthCategory {
  if (age <= 17) return YouthCategory.U17;
  if (age <= 19) return YouthCategory.U19;
  return YouthCategory.U21;
}

function pickPositionByGroup(group: PositionGroup, config: { positionDistribution: Record<string, number> }): SpecificPosition {
  const positions = GROUP_POSITIONS[group];
  return pickRandom(positions);
}

function rollPositionGroup(academyLevel: number): PositionGroup {
  const dist = ACADEMY_LEVEL_CONFIG[academyLevel].positionDistribution;
  const roll = Math.random();
  let cumulative = 0;

  for (const [group, chance] of Object.entries(dist)) {
    cumulative += chance as number;
    if (roll <= cumulative) {
      return group as PositionGroup;
    }
  }

  return 'MID';
}

// ─── Stat Generation ─────────────────────────────────────────────────

function generateYouthStats(
  specificPosition: SpecificPosition,
  baseRating: number,
  rngFn: () => number = Math.random,
): Record<string, number> {
  const arch = POSITION_ARCHETYPES[specificPosition];
  const stats: Record<string, number> = {};

  // Key stats — close to baseRating
  for (const stat of arch.keyStats) {
    stats[stat] = clamp(
      Math.round(baseRating + (rngFn() * 12 - 4)),
      10, 85
    );
  }

  // Secondary stats — below baseRating
  for (const stat of arch.secondaryStats) {
    stats[stat] = clamp(
      Math.round(baseRating - 8 + (rngFn() * 16 - 4)),
      8, 75
    );
  }

  // Weak stats — well below baseRating
  for (const stat of arch.weakStats) {
    stats[stat] = clamp(
      Math.round(baseRating - 20 + (rngFn() * 14 - 4)),
      5, 55
    );
  }

  // Ensure all standard stats have values
  const allStatKeys = [
    'speed', 'passing', 'shooting', 'defending', 'power', 'goalkeeping',
    'finishing', 'dribbling', 'firstTouch', 'crossing', 'marking', 'tackling',
    'technique', 'longShots', 'offTheBall', 'heading', 'aggression', 'bravery',
    'workRate', 'decisions', 'determination', 'concentration', 'leadership',
    'anticipation', 'flair', 'positioning', 'composure', 'teamwork', 'vision',
    'agility', 'balance', 'strength', 'acceleration', 'jumping', 'stamina', 'control',
  ];

  for (const key of allStatKeys) {
    if (!stats[key]) {
      stats[key] = clamp(Math.round(baseRating - 15 + (rngFn() * 20 - 6)), 5, 60);
    }
  }

  // Special: goalkeeping for non-GK should be very low
  if (specificPosition !== 'GK') {
    stats.goalkeeping = clamp(Math.round(10 + rngFn() * 20), 5, 35);
  }

  return stats;
}

function generatePersonalityTraits(isWonderkid: boolean): string[] {
  const traits: string[] = [];
  const positiveRoll = Math.random();

  // Wonderkids always get positive traits
  if (isWonderkid) {
    const shuffled = shuffleArray(POSITIVE_YOUTH_TRAITS);
    traits.push(shuffled[0]); // At least one strong positive
    if (Math.random() < 0.6) traits.push(shuffled[1]);
    if (Math.random() < 0.3) traits.push(shuffled[2]);
  } else {
    // Normal distribution: ~70% get at least one positive, ~30% get negative
    if (positiveRoll < 0.5) {
      traits.push(pickRandom(POSITIVE_YOUTH_TRAITS));
      if (Math.random() < 0.3) traits.push(pickRandom(POSITIVE_YOUTH_TRAITS));
    } else if (positiveRoll < 0.75) {
      traits.push(pickRandom(POSITIVE_YOUTH_TRAITS));
      traits.push(pickRandom(NEGATIVE_YOUTH_TRAITS));
    } else {
      traits.push(pickRandom(NEGATIVE_YOUTH_TRAITS));
      if (Math.random() < 0.4) traits.push(pickRandom(NEGATIVE_YOUTH_TRAITS));
    }
  }

  return traits;
}

function pickYouthTraits(positionGroup: PositionGroup): { traits: string[]; traitLevels: Record<string, 'MOR' | 'ALTIN' | 'LACIVERT' | 'BEYAZ'> } {
  const pool = YOUTH_TRAITS_BY_GROUP[positionGroup] || [];
  const traits: string[] = [];
  const traitLevels: Record<string, 'MOR' | 'ALTIN' | 'LACIVERT' | 'BEYAZ'> = {};

  const numTraits = Math.random() < 0.15 ? 3 : (Math.random() < 0.5 ? 2 : 1);
  const shuffled = shuffleArray(pool);

  const levels: ('MOR' | 'ALTIN' | 'LACIVERT' | 'BEYAZ')[] = ['MOR', 'ALTIN', 'LACIVERT', 'BEYAZ'];

  for (let i = 0; i < Math.min(numTraits, shuffled.length); i++) {
    const traitName = shuffled[i];
    traits.push(traitName);

    // First trait can be higher level
    if (i === 0) {
      const levelRoll = Math.random();
      if (levelRoll < 0.1) traitLevels[traitName] = 'MOR';
      else if (levelRoll < 0.35) traitLevels[traitName] = 'ALTIN';
      else if (levelRoll < 0.65) traitLevels[traitName] = 'LACIVERT';
      else traitLevels[traitName] = 'BEYAZ';
    } else {
      const levelRoll = Math.random();
      if (levelRoll < 0.05) traitLevels[traitName] = 'MOR';
      else if (levelRoll < 0.2) traitLevels[traitName] = 'ALTIN';
      else if (levelRoll < 0.5) traitLevels[traitName] = 'LACIVERT';
      else traitLevels[traitName] = 'BEYAZ';
    }
  }

  return { traits, traitLevels };
}

function determineDevelopmentCurve(): DevelopmentCurve {
  const roll = Math.random();
  if (roll < 0.60) return 'normal';
  if (roll < 0.75) return 'early';
  if (roll < 0.90) return 'late';
  return 'injury_prone';
}

// ─── Core Functions ──────────────────────────────────────────────────

/**
 * Generates a single youth player based on academy level.
 * Higher academy = better average stats and higher potential.
 */
export function generateYouthPlayer(
  academyLevel: number,
  targetAge?: number,
  rngFn: () => number = Math.random,
): YouthPlayer {
  const config = ACADEMY_LEVEL_CONFIG[clamp(academyLevel, 1, 5)];
  const age = targetAge ?? rng(15, 21);

  // Determine position
  const positionGroup = rollPositionGroup(clamp(academyLevel, 1, 5));
  const specificPosition = pickPositionByGroup(positionGroup, config);

  // Check wonderkid
  const isWonderkid = Math.random() < config.wonderkidChance;

  let rating: number;
  let potential: number;
  let hidden_potential: number;

  if (isWonderkid) {
    rating = rng(68, 75);
    potential = rng(85, 95);
    hidden_potential = rng(90, 99);
  } else {
    const [rMin, rMax] = config.ratingRange;
    const [pMin, pMax] = config.potentialRange;

    // Age adjustment: younger players have lower ratings but same potential
    const agePenalty = Math.max(0, (18 - age) * 1.5);
    rating = clamp(Math.round(rng(rMin, rMax) - agePenalty), 40, 75);
    potential = clamp(rng(pMin, pMax), rating + 5, 95);
    hidden_potential = clamp(potential + rng(2, 12), potential, 99);
  }

  // Generate stats
  const stats = generateYouthStats(specificPosition, rating, rngFn);

  // Pick traits
  const { traits, traitLevels } = pickYouthTraits(positionGroup);
  const personalityTraits = generatePersonalityTraits(isWonderkid);

  // Development curve
  const developmentCurve = determineDevelopmentCurve();

  // Training hours (10-25 based on personality)
  let weeklyTrainingHours = rng(10, 25);
  if (personalityTraits.includes('Çalışkan')) weeklyTrainingHours = Math.min(30, weeklyTrainingHours + 5);
  if (personalityTraits.includes('Profesyonel')) weeklyTrainingHours = Math.min(30, weeklyTrainingHours + 3);
  if (personalityTraits.includes('Tembel')) weeklyTrainingHours = Math.max(8, weeklyTrainingHours - 5);
  if (personalityTraits.includes('Disiplinsiz')) weeklyTrainingHours = Math.max(8, weeklyTrainingHours - 3);

  const name = `${pickRandom(FIRST_NAMES)} ${pickRandom(LAST_NAMES)}`;
  const category = getYouthCategory(age);
  const joinDate = new Date().toISOString();

  return {
    id: `youth_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name,
    age,
    position: positionGroup,
    specificPosition,
    rating,
    potential,
    hidden_potential,
    academyLevel,
    joinDate,
    weeklyTrainingHours,
    developmentCurve,
    isWonderkid,
    category,
    scoutReport: null,
    personalityTraits,
    traits,
    traitLevels: Object.keys(traitLevels).length > 0 ? traitLevels : undefined,
    speed: stats.speed ?? 50,
    passing: stats.passing ?? 50,
    shooting: stats.shooting ?? 50,
    defending: stats.defending ?? 50,
    power: stats.power ?? 50,
    goalkeeping: stats.goalkeeping ?? 15,
    finishing: stats.finishing ?? 50,
    dribbling: stats.dribbling ?? 50,
    firstTouch: stats.firstTouch ?? 50,
    crossing: stats.crossing ?? 50,
    marking: stats.marking ?? 50,
    tackling: stats.tackling ?? 50,
    technique: stats.technique ?? 50,
    longShots: stats.longShots ?? 50,
    offTheBall: stats.offTheBall ?? 50,
    heading: stats.heading ?? 50,
    aggression: stats.aggression ?? 50,
    bravery: stats.bravery ?? 50,
    workRate: stats.workRate ?? 50,
    decisions: stats.decisions ?? 50,
    determination: stats.determination ?? 50,
    concentration: stats.concentration ?? 50,
    leadership: stats.leadership ?? 30,
    anticipation: stats.anticipation ?? 50,
    flair: stats.flair ?? 20,
    positioning: stats.positioning ?? 50,
    composure: stats.composure ?? 50,
    teamwork: stats.teamwork ?? 50,
    vision: stats.vision ?? 50,
    agility: stats.agility ?? 50,
    balance: stats.balance ?? 50,
    strength: stats.strength ?? 50,
    acceleration: stats.acceleration ?? stats.speed ?? 50,
    jumping: stats.jumping ?? 50,
    stamina: stats.stamina ?? 60,
    control: stats.control ?? 50,
    cond: rng(75, 95),
    form: rng(40, 70),
    morale: rng(50, 80),
    confidence: rng(40, 70),
    injured: false,
    injuryWeeksRemaining: 0,
    totalTrainingWeeks: 0,
    statsGainedThisSeason: {},
  };
}

/**
 * Generates a scout report for a youth player.
 * Accuracy depends on player age — younger = less accurate.
 */
export function generateScoutReport(player: YouthPlayer): YouthScoutReport {
  const scoutName = pickRandom(SCOUT_NAMES);
  const date = new Date().toISOString();

  // Accuracy: younger players are harder to scout
  // Age 15: ~40% accurate, Age 21: ~85% accurate
  const accuracyBase = 0.4 + ((player.age - 15) / 6) * 0.45;
  const isAccurate = Math.random() < accuracyBase;

  // Potential assessment (may be inaccurate for young players)
  let potentialRating: PotentialRating;
  const truePotential = player.hidden_potential;

  if (isAccurate) {
    if (truePotential >= 88) potentialRating = 'world_class';
    else if (truePotential >= 78) potentialRating = 'high';
    else if (truePotential >= 65) potentialRating = 'medium';
    else potentialRating = 'low';
  } else {
    // Inaccurate — could be off by one tier
    const tiers: PotentialRating[] = ['low', 'medium', 'high', 'world_class'];
    const trueIndex = truePotential >= 88 ? 3 : truePotential >= 78 ? 2 : truePotential >= 65 ? 1 : 0;
    const offset = Math.random() < 0.5 ? -1 : 1;
    potentialRating = tiers[clamp(trueIndex + offset, 0, 3)];
  }

  // Overall assessment
  let assessmentTier: 'excellent' | 'good' | 'average' | 'below';
  if (player.rating >= 65) assessmentTier = 'excellent';
  else if (player.rating >= 58) assessmentTier = 'good';
  else if (player.rating >= 50) assessmentTier = 'average';
  else assessmentTier = 'below';

  // Wonderkids always get top assessment
  if (player.isWonderkid) assessmentTier = 'excellent';

  const overallAssessment = pickRandom(OVERALL_ASSESSMENTS[assessmentTier]);

  // Identify strengths and weaknesses
  const allStatEntries: { key: string; value: number; isKey: boolean }[] = [];
  const arch = POSITION_ARCHETYPES[player.specificPosition];

  const statMapping: Record<string, number | undefined> = {
    speed: player.speed, passing: player.passing, shooting: player.shooting,
    defending: player.defending, power: player.power, goalkeeping: player.goalkeeping,
    finishing: player.finishing, dribbling: player.dribbling, firstTouch: player.firstTouch,
    crossing: player.crossing, marking: player.marking, tackling: player.tackling,
    technique: player.technique, longShots: player.longShots, offTheBall: player.offTheBall,
    heading: player.heading, aggression: player.aggression, bravery: player.bravery,
    workRate: player.workRate, decisions: player.decisions, determination: player.determination,
    concentration: player.concentration, leadership: player.leadership,
    anticipation: player.anticipation, flair: player.flair, positioning: player.positioning,
    composure: player.composure, teamwork: player.teamwork, vision: player.vision,
    agility: player.agility, balance: player.balance, strength: player.strength,
    acceleration: player.acceleration, jumping: player.jumping, stamina: player.stamina,
    control: player.control,
  };

  for (const [key, value] of Object.entries(statMapping)) {
    if (value !== undefined) {
      const isKey = arch.keyStats.includes(key);
      allStatEntries.push({ key, value, isKey });
    }
  }

  // Sort by value descending for strengths, ascending for weaknesses
  const sortedDesc = [...allStatEntries].sort((a, b) => b.value - a.value);
  const sortedAsc = [...allStatEntries].sort((a, b) => a.value - b.value);

  // Key stats get priority for strengths, weak stats for weaknesses
  const keyStatsHigh = sortedDesc.filter(s => s.isKey && s.value >= 60);
  const keyStatsLow = sortedAsc.filter(s => s.isKey && s.value <= 50);

  // Pick 2-4 strengths
  const numStrengths = isAccurate ? rng(2, 4) : rng(1, 3);
  const keyStrengths: string[] = [];
  const usedKeys = new Set<string>();

  // Prioritize key stats that are high
  const strengthCandidates = [
    ...keyStatsHigh,
    ...sortedDesc.filter(s => !keyStatsHigh.includes(s) && s.value >= 62),
  ];

  for (const entry of strengthCandidates) {
    if (keyStrengths.length >= numStrengths) break;
    if (usedKeys.has(entry.key)) continue;

    const descriptions = STRENGTH_DESCRIPTIONS[entry.key];
    if (descriptions) {
      keyStrengths.push(pickRandom(descriptions));
      usedKeys.add(entry.key);
    }
  }

  // Pick 1-2 weaknesses
  const numWeaknesses = isAccurate ? rng(1, 2) : rng(0, 1);
  const keyWeaknesses: string[] = [];

  const weaknessCandidates = [
    ...keyStatsLow,
    ...sortedAsc.filter(s => !keyStatsLow.includes(s) && s.value <= 45),
  ];

  for (const entry of weaknessCandidates) {
    if (keyWeaknesses.length >= numWeaknesses) break;
    if (usedKeys.has(entry.key)) continue;

    const descriptions = WEAKNESS_DESCRIPTIONS[entry.key];
    if (descriptions) {
      keyWeaknesses.push(pickRandom(descriptions));
      usedKeys.add(entry.key);
    }
  }

  // If no weaknesses found, add a generic one
  if (keyWeaknesses.length === 0 && numWeaknesses > 0) {
    keyWeaknesses.push('Deneyim eksikliği var');
  }

  // Comparison player (only if rating > 70 and accurate)
  let comparisonPlayer: string | null = null;
  if (player.rating > 70 && isAccurate) {
    const comparisons = COMPARISON_PLAYERS[player.position];
    comparisonPlayer = comparisons ? `Bu oyuncu genç ${pickRandom(comparisons)}'e benziyor` : null;
  }

  // Recommended role
  const recommendedRole = pickRandom(RECOMMENDED_ROLES[player.specificPosition]);

  return {
    scoutName,
    date,
    overallAssessment,
    keyStrengths,
    keyWeaknesses,
    potentialRating,
    comparisonPlayer,
    recommendedRole,
  };
}

/**
 * Processes weekly training for a youth player.
 * Returns updated player with new stats.
 */
export function processYouthWeeklyTraining(
  player: YouthPlayer,
  facilities: FacilityState[],
): YouthPlayer {
  // If injured, just decrement injury timer
  if (player.injured) {
    return {
      ...player,
      injuryWeeksRemaining: Math.max(0, player.injuryWeeksRemaining - 1),
      injured: player.injuryWeeksRemaining > 1,
      totalTrainingWeeks: player.totalTrainingWeeks + 1,
    };
  }

  // Check for injury (injury_prone: 10%, others: 1-3%)
  const medicalFacility = facilities.find(f => f.facilityId === 'medical_center');
  const gymFacility = facilities.find(f => f.facilityId === 'gym');
  const injuryReduction =
    (medicalFacility ? medicalFacility.currentLevel * YOUTH_FACILITIES.find(f => f.id === 'medical_center')!.effects.injuryPrevention : 0) +
    (gymFacility ? gymFacility.currentLevel * YOUTH_FACILITIES.find(f => f.id === 'gym')!.effects.injuryPrevention : 0);

  let injuryChance = player.developmentCurve === 'injury_prone' ? 0.10 : 0.02;
  injuryChance = Math.max(0.005, injuryChance - injuryReduction);

  // Overtraining injury risk
  if (player.weeklyTrainingHours > 25) {
    injuryChance += 0.02;
  }

  if (Math.random() < injuryChance) {
    const injuryWeeks = player.developmentCurve === 'injury_prone' ? rng(2, 6) : rng(1, 3);
    return {
      ...player,
      injured: true,
      injuryWeeksRemaining: injuryWeeks,
      morale: Math.max(10, player.morale - rng(5, 15)),
      totalTrainingWeeks: player.totalTrainingWeeks + 1,
    };
  }

  // Calculate training speed
  const updated = { ...player };

  // --- Facility bonuses ---
  let trainingMultiplier = 1.0;
  for (const fac of facilities) {
    const facilityDef = YOUTH_FACILITIES.find(f => f.id === fac.facilityId);
    if (facilityDef) {
      trainingMultiplier += facilityDef.effects.trainingSpeed * fac.currentLevel;
    }
  }

  // --- Development curve modifiers ---
  let curveModifier = 1.0;
  switch (player.developmentCurve) {
    case 'early':
      // Faster gains 15-18, slower 19+
      if (player.age <= 18) curveModifier = 1.35;
      else if (player.age <= 20) curveModifier = 0.8;
      else curveModifier = 0.5;
      break;
    case 'late':
      // Slower 15-18, faster 19+
      if (player.age <= 17) curveModifier = 0.65;
      else if (player.age <= 18) curveModifier = 0.85;
      else if (player.age <= 20) curveModifier = 1.3;
      else curveModifier = 1.1;
      break;
    case 'injury_prone':
      // Normal when not injured, but overall slightly less
      curveModifier = 0.9;
      break;
    case 'normal':
    default:
      // Slight peak 17-19
      if (player.age >= 17 && player.age <= 19) curveModifier = 1.1;
      else curveModifier = 1.0;
      break;
  }

  // --- Age modifier (younger = more room to grow) ---
  let ageModifier = 1.0;
  if (player.age <= 16) ageModifier = 1.2;
  else if (player.age <= 18) ageModifier = 1.15;
  else if (player.age <= 20) ageModifier = 1.0;
  else ageModifier = 0.7;

  // --- Wonderkid bonus ---
  const wonderkidBonus = player.isWonderkid ? 1.2 : 1.0;

  // --- Personality trait modifiers ---
  let personalityModifier = 1.0;
  if (player.personalityTraits.includes('Profesyonel')) personalityModifier += 0.15;
  if (player.personalityTraits.includes('Çalışkan')) personalityModifier += 0.1;
  if (player.personalityTraits.includes('Disiplinli')) personalityModifier += 0.08;
  if (player.personalityTraits.includes('Hırslı')) personalityModifier += 0.1;
  if (player.personalityTraits.includes('Tembel')) personalityModifier -= 0.15;
  if (player.personalityTraits.includes('İsteksiz')) personalityModifier -= 0.1;
  if (player.personalityTraits.includes('Disiplinsiz')) personalityModifier -= 0.08;
  personalityModifier = Math.max(0.3, personalityModifier);

  // --- Training hours modifier ---
  const hoursModifier = player.weeklyTrainingHours / 20; // 20 hours = 1.0x

  // --- Potential cap: if approaching potential, slow down growth ---
  const potentialGap = player.hidden_potential - player.rating;
  let potentialCapModifier = 1.0;
  if (potentialGap <= 5) potentialCapModifier = 0.2;
  else if (potentialGap <= 10) potentialCapModifier = 0.5;
  else if (potentialGap <= 15) potentialCapModifier = 0.75;
  else if (potentialGap <= 20) potentialCapModifier = 0.9;

  // --- Final training speed ---
  const finalSpeed = trainingMultiplier * curveModifier * ageModifier * wonderkidBonus *
    personalityModifier * hoursModifier * potentialCapModifier;

  // --- Apply stat gains ---
  const arch = POSITION_ARCHETYPES[player.specificPosition];
  const statKeys = Object.keys(updated) as (keyof YouthPlayer)[];
  const mutableStatKeys = [
    'speed', 'passing', 'shooting', 'defending', 'power', 'goalkeeping',
    'finishing', 'dribbling', 'firstTouch', 'crossing', 'marking', 'tackling',
    'technique', 'longShots', 'offTheBall', 'heading', 'aggression', 'bravery',
    'workRate', 'decisions', 'determination', 'concentration', 'leadership',
    'anticipation', 'flair', 'positioning', 'composure', 'teamwork', 'vision',
    'agility', 'balance', 'strength', 'acceleration', 'jumping', 'stamina', 'control',
  ];

  const baseGainPerWeek = 0.35; // Base gain in stat points per week
  const statsGained: Record<string, number> = { ...player.statsGainedThisSeason };

  for (const key of mutableStatKeys) {
    const currentValue = (updated[key] as number) ?? 50;

    // Skip goalkeeping for non-GK
    if (key === 'goalkeeping' && player.specificPosition !== 'GK') continue;

    // Determine weight for this stat
    let statWeight = 0.3; // Default low weight
    if (arch.keyStats.includes(key)) statWeight = 1.0;
    else if (arch.secondaryStats.includes(key)) statWeight = 0.6;

    // Calculate gain
    const rawGain = baseGainPerWeek * finalSpeed * statWeight;

    // Random variance (±40%)
    const variance = 0.6 + Math.random() * 0.8;
    const gain = rawGain * variance;

    // Don't grow past hidden potential (loosely applied per stat)
    const statCap = Math.min(player.hidden_potential + 5, 99);
    const newValue = clamp(Math.round(currentValue + gain), 1, statCap);

    if (newValue !== currentValue) {
      (updated as Record<string, unknown>)[key] = newValue;
      statsGained[key] = (statsGained[key] || 0) + (newValue - currentValue);
    }
  }

  // Update overall rating based on stat average of key stats
  let keyStatSum = 0;
  let keyStatCount = 0;
  for (const stat of arch.keyStats) {
    const val = (updated as Record<string, unknown>)[stat] as number;
    if (val !== undefined) {
      keyStatSum += val;
      keyStatCount++;
    }
  }
  // Also include the 6 core stats
  const coreStats = [updated.speed, updated.passing, updated.shooting, updated.defending, updated.power, updated.goalkeeping];
  for (const val of coreStats) {
    if (val !== undefined) {
      keyStatSum += val;
      keyStatCount++;
    }
  }

  const avgStat = keyStatCount > 0 ? keyStatSum / keyStatCount : player.rating;
  const newRating = clamp(Math.round(avgStat * 0.6 + player.rating * 0.4), player.rating - 1, Math.min(player.hidden_potential, 95));

  // Update morale/confidence slightly based on growth
  const totalGained = Object.values(statsGained).reduce((a, b) => a + b, 0);
  const moraleChange = totalGained > 0 ? 1 : 0;
  const confidenceChange = Math.random() < 0.1 ? rng(-2, 3) : 0;

  return {
    ...updated,
    rating: newRating,
    morale: clamp(player.morale + moraleChange, 10, 100),
    confidence: clamp(player.confidence + confidenceChange, 10, 100),
    totalTrainingWeeks: player.totalTrainingWeeks + 1,
    statsGainedThisSeason: statsGained,
  };
}

/**
 * Checks if a youth player is ready for first team promotion.
 */
export function checkYouthPromotion(player: YouthPlayer): PromotionRecommendation {
  const reasons: string[] = [];
  const warnings: string[] = [];

  // --- Hard requirements ---
  const ageOk = player.age >= 17;
  const ratingOk = player.rating >= 65;

  // Count stats above 60
  const statValues: number[] = [
    player.speed, player.passing, player.shooting, player.defending,
    player.power, player.finishing ?? 50, player.dribbling ?? 50,
    player.firstTouch ?? 50, player.tackling ?? 50, player.marking ?? 50,
    player.heading ?? 50, player.vision ?? 50, player.stamina ?? 60,
    player.composure ?? 50, player.workRate ?? 50, player.decisions ?? 50,
    player.determination ?? 50,
  ];

  const statsAbove60 = statValues.filter(s => s >= 60).length;
  const statsAbove65 = statValues.filter(s => s >= 65).length;
  const statsAbove70 = statValues.filter(s => s >= 70).length;

  // --- Confidence scoring ---
  let confidence = 0;

  // Age factor (0-25)
  if (player.age >= 20) confidence += 25;
  else if (player.age >= 18) confidence += 20;
  else if (player.age >= 17) confidence += 10;
  else confidence += 0;

  // Rating factor (0-30)
  if (player.rating >= 72) confidence += 30;
  else if (player.rating >= 68) confidence += 25;
  else if (player.rating >= 65) confidence += 18;
  else if (player.rating >= 62) confidence += 8;
  else confidence += 0;

  // Stats above 60 factor (0-25)
  confidence += Math.min(25, statsAbove60 * 4);

  // Stats above 65 factor (0-10)
  confidence += Math.min(10, statsAbove65 * 2);

  // Stats above 70 factor (0-10)
  confidence += Math.min(10, statsAbove70 * 3);

  // Wonderkid bonus
  if (player.isWonderkid) confidence += 10;

  // High potential bonus
  if (player.potential >= 85) confidence += 5;

  // Positive personality traits
  if (player.personalityTraits.includes('Profesyonel')) confidence += 3;
  if (player.personalityTraits.includes('Soğukkanlı')) confidence += 2;
  if (player.personalityTraits.includes('Kazanan karakter')) confidence += 3;

  // Negative personality penalties
  if (player.personalityTraits.includes('Panikçi')) confidence -= 5;
  if (player.personalityTraits.includes('Kırılgan mental')) confidence -= 3;
  if (player.personalityTraits.includes('Tembel')) confidence -= 3;

  // Injury prone penalty
  if (player.developmentCurve === 'injury_prone') confidence -= 5;

  // Clamp confidence
  confidence = clamp(confidence, 0, 100);

  // --- Build reasons ---
  if (player.rating >= 68) reasons.push(`Reyting yeterli (${player.rating})`);
  if (statsAbove60 >= 8) reasons.push(`${statsAbove60} istatistik 60 üzerinde`);
  if (statsAbove65 >= 5) reasons.push(`${statsAbove65} istatistik 65 üzerinde`);
  if (player.age >= 19) reasons.push('Yaş gereksinimi karşılandı');
  if (player.isWonderkid) reasons.push('Wonderkid — özel yetenek');
  if (player.potential >= 85) reasons.push('Yüksek potansiyel tespit edildi');
  if (player.scoutReport && player.scoutReport.potentialRating === 'world_class') {
    reasons.push('Gözlem raporu: Dünya sınıfı potansiyel');
  }

  // --- Build warnings ---
  if (!ageOk) warnings.push(`Yaş ${player.age} — minimum 17 gerekli`);
  if (!ratingOk) warnings.push(`Reyting ${player.rating} — minimum 65 gerekli`);
  if (statsAbove60 < 5) warnings.push(`Sadece ${statsAbove60} istatistik 60 üzerinde — en az 5 gerekli`);
  if (player.injured) warnings.push('Şu anda sakat — iyileşmeyi bekleyin');
  if (player.morale < 40) warnings.push(`Moral düşük (${player.morale}) — takıma uyum sağlayamayabilir`);
  if (player.developmentCurve === 'injury_prone') warnings.push('Sakatlık eğilimli — dikkatli olun');
  if (player.age <= 17 && player.rating < 67) warnings.push('Çok genç ve reyting düşük — acele etmeyin');
  if (player.personalityTraits.includes('Panikçi')) warnings.push('Panikçi yapısı — büyük maçlarda sorun yaşayabilir');

  const ready = ageOk && ratingOk && statsAbove60 >= 5 && confidence >= 45;

  return {
    ready,
    confidence,
    reasons: reasons.length > 0 ? reasons : ['Henüz hazır değil'],
    warnings,
    suggestedPosition: player.specificPosition,
  };
}

/**
 * Generates the annual youth intake (6-10 players at start of season).
 * Mix of ages: 40% U17, 35% U19, 25% U21
 */
export function generateYouthIntake(
  academyLevel: number,
  rngFn: () => number = Math.random,
): YouthPlayer[] {
  const count = rng(6, 10);
  const players: YouthPlayer[] = [];

  // Age distribution: 40% U17, 35% U19, 25% U21
  const ageDistribution: { range: [number, number]; weight: number }[] = [
    { range: [15, 17], weight: 0.40 },
    { range: [17, 19], weight: 0.35 },
    { range: [19, 21], weight: 0.25 },
  ];

  for (let i = 0; i < count; i++) {
    // Pick age bucket
    const roll = rngFn();
    let ageRange: [number, number] = [15, 17];
    let cumulative = 0;

    for (const bucket of ageDistribution) {
      cumulative += bucket.weight;
      if (roll <= cumulative) {
        ageRange = bucket.range;
        break;
      }
    }

    const targetAge = rng(ageRange[0], ageRange[1]);
    const player = generateYouthPlayer(academyLevel, targetAge, rngFn);

    // Generate initial scout report for all intake players
    player.scoutReport = generateScoutReport(player);

    players.push(player);
  }

  // Sort by rating descending (best first)
  players.sort((a, b) => b.rating - a.rating);

  return players;
}

/**
 * Calculates the market value of a youth player.
 * Wonderkids worth 3-10x more.
 */
export function calculateYouthValue(player: YouthPlayer): number {
  // Base value from rating
  const ratingMultiplier = Math.pow(player.rating / 50, 2.5);

  // Potential gap bonus
  const potentialGap = player.hidden_potential - player.rating;
  const potentialBonus = 1 + (potentialGap / 10);

  // Age factor: younger = higher potential value
  let ageFactor: number;
  if (player.age <= 16) ageFactor = 2.5;
  else if (player.age <= 17) ageFactor = 2.2;
  else if (player.age <= 18) ageFactor = 1.8;
  else if (player.age <= 19) ageFactor = 1.5;
  else if (player.age <= 20) ageFactor = 1.2;
  else ageFactor = 1.0;

  // Wonderkid multiplier (3-10x)
  let wonderkidMultiplier = 1;
  if (player.isWonderkid) {
    if (player.hidden_potential >= 95) wonderkidMultiplier = 10;
    else if (player.hidden_potential >= 92) wonderkidMultiplier = 8;
    else if (player.hidden_potential >= 90) wonderkidMultiplier = 6;
    else wonderkidMultiplier = 4;
  }

  // Personality trait impact on value
  let personalityValue = 1.0;
  if (player.personalityTraits.includes('Profesyonel')) personalityValue += 0.1;
  if (player.personalityTraits.includes('Çalışkan')) personalityValue += 0.08;
  if (player.personalityTraits.includes('Hırslı')) personalityValue += 0.08;
  if (player.personalityTraits.includes('Soğukkanlı')) personalityValue += 0.05;
  if (player.personalityTraits.includes('Kazanan karakter')) personalityValue += 0.1;
  if (player.personalityTraits.includes('Tembel')) personalityValue -= 0.15;
  if (player.personalityTraits.includes('Kibirli')) personalityValue -= 0.1;
  if (player.personalityTraits.includes('Egoist')) personalityValue -= 0.1;
  if (player.personalityTraits.includes('Disiplinsiz')) personalityValue -= 0.12;

  // Scout report impact
  let scoutBonus = 1.0;
  if (player.scoutReport) {
    switch (player.scoutReport.potentialRating) {
      case 'world_class': scoutBonus = 1.4; break;
      case 'high': scoutBonus = 1.2; break;
      case 'medium': scoutBonus = 1.05; break;
      case 'low': scoutBonus = 0.9; break;
    }
  }

  // Trait value (higher level traits = more valuable)
  let traitValue = 1.0;
  if (player.traitLevels) {
    const levels = Object.values(player.traitLevels);
    const morCount = levels.filter(l => l === 'MOR').length;
    const altinCount = levels.filter(l => l === 'ALTIN').length;
    traitValue += morCount * 0.1 + altinCount * 0.05;
  }

  // Development curve impact
  let curveValue = 1.0;
  if (player.developmentCurve === 'early') curveValue = 1.1;
  if (player.developmentCurve === 'late') curveValue = 0.95;
  if (player.developmentCurve === 'injury_prone') curveValue = 0.75;

  // Injury status
  if (player.injured) curveValue *= 0.8;

  // Base price in thousands
  const basePrice = 50_000;

  const totalValue = Math.round(
    basePrice *
    ratingMultiplier *
    potentialBonus *
    ageFactor *
    wonderkidMultiplier *
    Math.max(0.5, personalityValue) *
    scoutBonus *
    traitValue *
    curveValue
  );

  // Minimum value is 10K
  return Math.max(10_000, totalValue);
}

// ─── Utility / Helper Exports ────────────────────────────────────────

/**
 * Get a facility by its ID.
 */
export function getFacilityById(id: string): AcademyFacility | undefined {
  return YOUTH_FACILITIES.find(f => f.id === id);
}

/**
 * Get total training speed multiplier from current facility levels.
 */
export function getTrainingSpeedMultiplier(facilities: FacilityState[]): number {
  let multiplier = 1.0;
  for (const fac of facilities) {
    const def = YOUTH_FACILITIES.find(f => f.id === fac.facilityId);
    if (def) {
      multiplier += def.effects.trainingSpeed * fac.currentLevel;
    }
  }
  return multiplier;
}

/**
 * Get total scout quality multiplier from current facility levels.
 */
export function getScoutQualityMultiplier(facilities: FacilityState[]): number {
  let multiplier = 1.0;
  for (const fac of facilities) {
    const def = YOUTH_FACILITIES.find(f => f.id === fac.facilityId);
    if (def) {
      multiplier += def.effects.scoutQuality * fac.currentLevel;
    }
  }
  return multiplier;
}

/**
 * Get total injury prevention from current facility levels.
 */
export function getInjuryPrevention(facilities: FacilityState[]): number {
  let prevention = 0;
  for (const fac of facilities) {
    const def = YOUTH_FACILITIES.find(f => f.id === fac.facilityId);
    if (def) {
      prevention += def.effects.injuryPrevention * fac.currentLevel;
    }
  }
  return prevention;
}

/**
 * Get cost to upgrade a facility to next level.
 * Returns null if already at max level.
 */
export function getUpgradeCost(facilityId: string, currentLevel: number): number | null {
  const facility = YOUTH_FACILITIES.find(f => f.id === facilityId);
  if (!facility) return null;
  if (currentLevel >= facility.maxLevel) return null;
  return facility.upgradeCost[currentLevel]; // Index 0 = cost to go from 1→2
}

/**
 * Get default facility state (all at level 1).
 */
export function getDefaultFacilityState(): FacilityState[] {
  return YOUTH_FACILITIES.map(f => ({
    facilityId: f.id,
    currentLevel: 1,
  }));
}

/**
 * Get total weekly facility upkeep cost.
 */
export function getWeeklyUpkeep(facilities: FacilityState[]): number {
  let total = 0;
  for (const fac of facilities) {
    total += fac.currentLevel * 5000; // 5K per level per week per facility
  }
  return total;
}

/**
 * Get Turkish label for potential rating.
 */
export function getPotentialRatingLabel(rating: PotentialRating): string {
  switch (rating) {
    case 'world_class': return 'Dünya Sınıfı';
    case 'high': return 'Yüksek';
    case 'medium': return 'Orta';
    case 'low': return 'Düşük';
  }
}

/**
 * Get Turkish label for development curve.
 */
export function getDevelopmentCurveLabel(curve: DevelopmentCurve): string {
  switch (curve) {
    case 'early': return 'Erken Gelişen';
    case 'late': return 'Geç Gelişen';
    case 'normal': return 'Normal';
    case 'injury_prone': return 'Sakatlığa Yatkın';
  }
}

/**
 * Format currency value (e.g., 1.5M, 500K).
 */
export function formatYouthValue(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return `${value}`;
}

/**
 * Get star rating for youth player potential (1-5 stars).
 */
export function getYouthPotentialStars(player: YouthPlayer): number {
  const p = player.hidden_potential;
  if (p >= 92) return 5;
  if (p >= 85) return 4;
  if (p >= 75) return 3;
  if (p >= 65) return 2;
  return 1;
}
