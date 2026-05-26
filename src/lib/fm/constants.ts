// ─── Antrenman Programları ─────────────────────────────────────────────────
// allowedPositions: hangi gruplar bu programı kullanabilir
//   'ALL' = hepsi, 'GK' = sadece kaleci, 'FIELD' = kaleci hariç
//   veya spesifik: ['DEF','MID'] vb.
// intensity: 1-100 arası antrenman yoğunluğu (gain çarpanı)
// condCost: antrenman sonrası kondisyon kaybı (negatif = kazanç)
export const TRAINING_PROGRAMS = [
  {
    id: 'fiziksel_yukleme',
    name: 'Fiziksel Yükleme',
    description: 'Dayanıklılık, güç ve hız odaklı kondisyon kampı.',
    targetStats: ['stamina', 'power', 'speed'],
    allowedPositions: 'FIELD' as const,
    intensity: 80,
    condCost: -12,
    color: 'red',
    icon: '💪',
  },
  {
    id: 'teknik_driller',
    name: 'Teknik Driller',
    description: 'Pas kalitesi, top kontrolü ve vizyon geliştirme.',
    targetStats: ['passing', 'control', 'vision'],
    allowedPositions: 'FIELD' as const,
    intensity: 70,
    condCost: -6,
    color: 'blue',
    icon: '🎯',
  },
  {
    id: 'savunma_okulu',
    name: 'Savunma Okulu',
    description: 'Pozisyon alma, markaj disiplini ve savunma.',
    targetStats: ['defending', 'vision', 'power'],
    allowedPositions: ['DEF', 'MID'] as string[],
    intensity: 75,
    condCost: -8,
    color: 'green',
    icon: '🛡️',
  },
  {
    id: 'bitiricilik_kampi',
    name: 'Bitiricilik Kampı',
    description: 'Ceza sahası etkinliği, şut gücü ve hız.',
    targetStats: ['shooting', 'control', 'speed'],
    allowedPositions: ['MID', 'FWD'] as string[],
    intensity: 85,
    condCost: -10,
    color: 'amber',
    icon: '⚽',
  },
  {
    id: 'kaleci_antrenmani',
    name: 'Kaleci Antrenmanı',
    description: 'Kalecilik, refleksler ve konsantrasyon. Sadece kaleciler.',
    targetStats: ['goalkeeping', 'reflexes', 'concentration'],
    allowedPositions: 'GK' as const,
    intensity: 80,
    condCost: -8,
    color: 'cyan',
    icon: '🧤',
  },
  {
    id: 'set_parcasi',
    name: 'Set Parçası Çalışması',
    description: 'Korner, frikik ve penaltı senaryoları. Kafa ve pas isabeti.',
    targetStats: ['vision', 'passing', 'heading'],
    allowedPositions: 'FIELD' as const,
    intensity: 55,
    condCost: -4,
    color: 'purple',
    icon: '📐',
  },
  {
    id: 'zihinsel_hazirlik',
    name: 'Zihinsel Hazırlık',
    description: 'Karar alma, soğukkanlılık ve konsantrasyon. Düşük kondisyon maliyeti.',
    targetStats: ['decisions', 'composure', 'concentration'],
    allowedPositions: 'ALL' as const,
    intensity: 45,
    condCost: -2,
    color: 'indigo',
    icon: '🧠',
  },
  {
    id: 'kondisyon_toparlanma',
    name: 'Kondisyon & Toparlanma',
    description: 'Aktif toparlanma. Sakatlık riski azalır, kondisyon hızla geri gelir.',
    targetStats: ['stamina'],
    allowedPositions: 'ALL' as const,
    intensity: 30,
    condCost: 20,   // kondisyon KAZANIR
    color: 'emerald',
    icon: '🔋',
  },
  {
    id: 'takim_kimyasi',
    name: 'Takım Kimyası',
    description: 'Kombine çalışmalar, iletişim ve takım ruhu. Moral ve kimya artar.',
    targetStats: ['teamwork', 'vision'],
    allowedPositions: 'ALL' as const,
    intensity: 50,
    condCost: -3,
    color: 'orange',
    icon: '🤝',
    specialEffect: 'chemistry_boost' as const,
  },
  {
    id: 'pozisyon_adaptasyonu',
    name: 'Pozisyon Adaptasyonu',
    description: 'Yan pozisyon için özel çalışma. Yeni mevkiye alışma hızı artar.',
    targetStats: ['positioning', 'decisions', 'stamina'],
    allowedPositions: 'FIELD' as const,
    intensity: 60,
    condCost: -7,
    color: 'yellow',
    icon: '🔄',
    specialEffect: 'position_adapt' as const,
  },
] as const;

export type TrainingProgram = typeof TRAINING_PROGRAMS[number];

export const INITIAL_TEAM_NAME = 'Siyahbeyazfc';
export const STARTING_MONEY = 10_000_000;

// ═══════════════════════════════════════════════════
//  RASTGELE TAKIM İSİMLERİ BANKI (50+ isim)
//  Gerçek futbolcu isimleri YOK, tamamen kurgusal
// ═══════════════════════════════════════════════════

export const TEAM_NAME_BANK: string[] = [
  // ─── Şehir/Bölge Temalı ─────────────────────
  'Anadolu Gücü', 'Ege Fırtınası', 'Karadeniz Yıldızı', 'Akdeniz Dalga',
  'İç Anadolu Kartalı', 'Marmara Rüzgarı', 'Doğu Anadolu Ateşi',
  'Güneydoğu Güneşi', 'Trakya Birlik', 'Boğaz Korelasi',
  // ─── FC / United / City Format ───────────────
  'FC Random 42', 'Spor Kulübü 17', 'United Anka', 'City Perspektif',
  'FC Volkan', 'United Çelik', 'City Horizon', 'FC Dayanışma',
  // ─── Doğa/Unsur Temalı ──────────────────────
  'Demir Fırtına', 'Altın Ayak', 'Gümüş Kanat', 'Bakır Kale',
  'Volkan Spor', 'Buz Kılıcı', 'Ateş Çemberi', 'Rüzgar Süpürücü',
  'Fırtına Kuşu', 'Güneş Kulesi', 'Yıldırım Ordu', 'Şimşek Gücü',
  // ─── Hayvan Sembol ──────────────────────────
  'Kartal Yuvası', 'Aslan Yüreği', 'Bozkurt FK', 'Çita Hızı',
  'Panter Spor', 'Doğan Akademi', 'Atmaca Birlik', 'Karga Şaşkınlık',
  // ─── Soyut/Kavram ──────────────────────────
  'Zirve Peşinde', 'Ufuk Ötesi', 'Vadi Yıldızı', 'Ova Birliği',
  'Tepe Kuşatı', 'Sahil Güvenliği', 'Liman Feneri', 'Adalet FK',
  // ─── Renk Temalı ───────────────────────────
  'Siyah Şimşek', 'Beyaz Fırtına', 'Kırmızı Kale', 'Yeşilova SK',
  'Mavi Cephane', 'Turuncu Güç', 'Mor Yıldız', 'Gri Duvar',
  // ─── Rakamlı / Retro ───────────────────────
  'Spor 1923', 'FK 57', 'United 38', 'City 74',
  'FC 91', 'Birlik 1905', 'Güç 1961', 'Yıldız 2010',
  // ─── Yedek (genişletilebilir) ──────────────
  'Yeni Ufuklar', 'Işık Yolu', 'Gelecek FK', 'Kömür Madeni',
  'Çelik Fabrikası', 'İpek Yolu SK', 'Bahar Canlılığı', 'Son Kale',
];

// Bank'tan rastgele benzersiz isim seçer (tekrarsız)
export function getRandomTeamNames(count: number, excludeNames: string[] = []): string[] {
  const available = TEAM_NAME_BANK.filter(n => !excludeNames.includes(n));
  const selected: string[] = [];
  const used = new Set<string>(excludeNames);

  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    const name = available[idx];
    if (!used.has(name)) {
      selected.push(name);
      used.add(name);
    }
    available.splice(idx, 1);
  }

  // Havuz yetersizse fallback: "FC Random XXX" formatı
  while (selected.length < count) {
    const fallback = `FC Random ${Math.floor(Math.random() * 900) + 100}`;
    if (!used.has(fallback)) {
      selected.push(fallback);
      used.add(fallback);
    }
  }

  return selected;
}

// ═══════════════════════════════════════════════════
//  LİG TAKIM İSİMLERİ HAVUZU
//  Her lig seviyesi için yeterli isim ( departman başına 18 )
// ═══════════════════════════════════════════════════

export const TIER_TEAM_NAMES: Record<number, string[]> = {
  1: [
    'Anadolu Gücü', 'Kartal Yuvası', 'Aslan Yüreği', 'Demir Fırtına',
    'Altın Ayak', 'Şimşek Gücü', 'Zirve Peşinde', 'Volkan Spor',
    'Bozkurt FK', 'Güneş Kulesi', 'Fırtına Kuşu', 'Siyah Şimşek',
    'Yıldırım Ordu', 'Spor 1923', 'Çelik Fabrikası', 'Mavi Cephane',
    'Sahil Güvenliği', 'Ateş Çemberi',
  ],
  2: [
    'Ege Fırtınası', 'Gümüş Kanat', 'Çita Hızı', 'Bakır Kale',
    'Buz Kılıcı', 'Doğan Akademi', 'Ufuk Ötesi', 'Yeşilova SK',
    'Liman Feneri', 'FK 57', 'İpek Yolu SK', 'Panter Spor',
    'Kırmızı Kale', 'Vadi Yıldızı', 'Atmaca Birlik', 'Rüzgar Süpürücü',
    'Adalet FK', 'Ova Birliği',
  ],
  3: [
    'Karadeniz Yıldızı', 'Akdeniz Dalga', 'İç Anadolu Kartalı', 'Marmara Rüzgarı',
    'Doğu Anadolu Ateşi', 'Güneydoğu Güneşi', 'Trakya Birlik', 'Boğaz Korelasi',
    'FC Random 42', 'Spor Kulübü 17', 'United Anka', 'City Perspektif',
    'Karga Şaşkınlık', 'Turuncu Güç', 'Mor Yıldız', 'Gri Duvar',
    'United 38', 'City 74',
  ],
  4: [
    // Departman 1
    'FC Volkan', 'United Çelik', 'City Horizon', 'FC Dayanışma',
    'Tepe Kuşatı', 'Son Kale', 'Yeni Ufuklar', 'Işık Yolu',
    'Gelecek FK', 'Kömür Madeni', 'Bahar Canlılık', 'FC 91',
    'Birlik 1905', 'Güç 1961', 'Yıldız 2010', 'Beyaz Fırtına',
    'Kale Duvarı', 'Savunma Hattı',
    // Departman 2
    'Savun Kalesi', 'Atak Birlik', 'Kontra FC', 'Pres Gücü',
    'Orta Saha HK', 'Kanat Açılımı', 'Derin Koşu SK', 'Baskı United',
    'Çevik FK', 'Dayanıklı Spor', 'Hızlı Counter', 'Sabit Pozisyon',
    'Geniş Alan', 'Dar Alan City', 'Serbest Vuruş FK', 'Penaltı Ustası',
    'Taç Atışı SK', 'Korner Birliği',
    // Departman 3
    'Akademi 1', 'Akademi 2', 'Akademi 3', 'Akademi 4',
    'Akademi 5', 'Akademi 6', 'Akademi 7', 'Akademi 8',
    'Akademi 9', 'Akademi 10', 'Akademi 11', 'Akademi 12',
    'Akademi 13', 'Akademi 14', 'Akademi 15', 'Akademi 16',
    'Akademi 17', 'Akademi 18',
    // Departman 4
    'Stadyum 1', 'Stadyum 2', 'Stadyum 3', 'Stadyum 4',
    'Stadyum 5', 'Stadyum 6', 'Stadyum 7', 'Stadyum 8',
    'Stadyum 9', 'Stadyum 10', 'Stadyum 11', 'Stadyum 12',
    'Stadyum 13', 'Stadyum 14', 'Stadyum 15', 'Stadyum 16',
    'Stadyum 17', 'Stadyum 18',
    // Departman 5
    'Yedek 1', 'Yedek 2', 'Yedek 3', 'Yedek 4',
    'Yedek 5', 'Yedek 6', 'Yedek 7', 'Yedek 8',
    'Yedek 9', 'Yedek 10', 'Yedek 11', 'Yedek 12',
    'Yedek 13', 'Yedek 14', 'Yedek 15', 'Yedek 16',
    'Yedek 17', 'Yedek 18',
  ],
};

// Verilen lig seviyesi ve departman indeksi için 18 takım ismi döndürür
// Eğer departman havuzu yetersizse TEAM_NAME_BANK'tan rastgele çeker
// NOT: 1-3. ligler TEK GRUP — departmentIndex her zaman 1 olmalı
//      Sadece 4. lig ve üstü birden fazla bölüm alabilir
export function getTeamNamesForDepartment(tier: number, departmentIndex: number): string[] {
  // 1-3. liglerde sadece 1 bölüm var
  if (tier >= 1 && tier <= 3 && departmentIndex > 1) {
    console.warn(`[getTeamNamesForDepartment] ${tier}. Lig tek gruplu — departmentIndex=1 olarak düzeltildi`);
    departmentIndex = 1;
  }
  const pool = TIER_TEAM_NAMES[tier] || TIER_TEAM_NAMES[4] || [];
  const start = (departmentIndex - 1) * 18; // departmentIndex 1-based
  let names = pool.slice(start, start + 18);
  
  // Havuz yetersizse TEAM_NAME_BANK'tan rastgele tamamla
  if (names.length < 18) {
    const existingNames = [...names];
    const randomExtra = getRandomTeamNames(18 - names.length, existingNames);
    names = [...names, ...randomExtra];
  }
  
  return names;
}

// ═══════════════════════════════════════════════════
//  OYUN GENEL SABİTLERİ
//  Tüm API route'ları ve modüller arasında paylaşılan
// ═══════════════════════════════════════════════════

// ─── Kiralama Komisyonu ────────────────────────────────────────────
/** Kiralama teklifi gönderirken kesilen komisyon (Kredi) */
export const RENTAL_COMMISSION_KR = 10;

// ─── Kayıt Başlangıç Değerleri ─────────────────────────────────────
export const BASE_MONEY = 100_000_000;       // 100M €
export const BASE_CREDITS = 250;
export const BASE_REPUTATION = 30;
export const BASE_ACADEMY_LEVEL = 1;

// ─── Felsefe Bonusları ─────────────────────────────────────────────
export const PHILOSOPHY_BONUSES = {
  financial: { moneyBonus: 50_000_000 },     // +50M €
  legend: { creditsBonus: 250 },              // +250 kredi (toplam 500)
  youth: { academyLevel: 3 },                 // Lv.3 akademi
  squad: { qualityMod: 1.1 },                 // +%10 kadro kalitesi
  reputation: { reputationBonus: 20 },        // +20 itibar (toplam 50)
  balanced: {},                               // Bonus yok
} as const;

// ─── Sezon Ayarları ────────────────────────────────────────────────
export const TEAMS_PER_LEAGUE = 18;
export const MAX_WEEKS_PER_SEASON = 34;

// ─── DB Sağlık Kontrolü ────────────────────────────────────────────
/** DB bağlantı kontrolü aralığı (ms) — 5 dakika */
export const DB_HEALTH_CHECK_INTERVAL = 300_000;

// ─── Formasyon Modifikatörleri ──────────────────────────────────────
// Her formasyonun hücum, orta saha ve savunma ağırlık çarpanları.
// enhancedMatchEngine'deki calculateTeamStrength() tarafından kullanılır.
export const FORMATION_MODS: Record<string, { attack: number; midfield: number; defense: number }> = {
  '4-4-2':   { attack: 1.0,  midfield: 1.0,  defense: 1.0  },
  '4-3-3':   { attack: 1.12, midfield: 0.95, defense: 0.97 },
  '4-5-1':   { attack: 0.90, midfield: 1.12, defense: 1.02 },
  '4-2-3-1': { attack: 1.05, midfield: 1.06, defense: 0.96 },
  '3-5-2':   { attack: 1.05, midfield: 1.08, defense: 0.94 },
  '3-4-3':   { attack: 1.15, midfield: 0.96, defense: 0.88 },
  '5-3-2':   { attack: 0.97, midfield: 0.96, defense: 1.14 },
  '5-4-1':   { attack: 0.85, midfield: 1.0,  defense: 1.18 },
  '4-1-4-1': { attack: 0.95, midfield: 1.10, defense: 1.00 },
  '4-4-1-1': { attack: 1.04, midfield: 1.02, defense: 0.98 },
};

// ═══════════════════════════════════════════════════
//  MAÇ MOTORU SABİTLERİ (MATCH ENGINE CONSTANTS)
//  enhancedMatchEngine.ts tarafından kullanılan tüm
//  sabitler burada merkezi olarak yönetilir.
// ═══════════════════════════════════════════════════

// ─── Moral / Form / Kondisyon Ağırlıkları ──────────────────────────────
/** Moral/form/kondisyon modifiyeri: taban = BASE, değişken = VAR */
export const STAT_MOD_BASE = 0.7;
export const STAT_MOD_VAR = 0.3;

// ─── Takım Gücü Ağırlıkları (Overall hesaplama) ────────────────────────
/** Hücum, orta saha, savunma ve kaleci ağırlıkları (3 yerde tekrarlanıyordu) */
export const OVERALL_WEIGHT_ATTACK = 0.3;
export const OVERALL_WEIGHT_MIDFIELD = 0.3;
export const OVERALL_WEIGHT_DEFENSE = 0.25;
export const OVERALL_WEIGHT_GK = 0.15;

// ─── Taktik Modifikatörleri ────────────────────────────────────────────
export const TACTIC_MENTALITY_BONUS = 0.05;      // Mentality >= 4 bonus per point above 3
export const TACTIC_MENTALITY_PENALTY = 0.03;    // Mentality <= 2 penalty per point below 3
export const TACTIC_PRESSING_BONUS = 0.04;        // Pressing bonus
export const TACTIC_HIGH_INTENSITY_BONUS = 0.06;  // High intensity bonus
export const TACTIC_LOW_INTENSITY_PENALTY = 0.04; // Low intensity penalty
export const TACTIC_AGGRESSION_SCALE = 0.0004;    // Aggression scaling factor
export const TACTIC_AGGRESSION_BASELINE = 50;      // Aggression baseline

// ─── Hava Durumu Modifikatörleri ───────────────────────────────────────
export const WEATHER_MODIFIERS: Record<string, { passingMod: number; speedMod: number; shootingMod: number; tacklingMod: number }> = {
  rainy:  { passingMod: 0.95, speedMod: 0.97, shootingMod: 0.96, tacklingMod: 0.98 },
  snowy:  { passingMod: 0.93, speedMod: 0.90, shootingMod: 0.92, tacklingMod: 0.95 },
  windy:  { passingMod: 0.96, speedMod: 0.98, shootingMod: 0.94, tacklingMod: 1.0  },
  sunny:  { passingMod: 1.0,  speedMod: 1.0,  shootingMod: 1.0,  tacklingMod: 1.0  },
};

// ─── Hava Durumu Dağılımı ─────────────────────────────────────────────
/** Rastgele hava durumu seçim havuzu (~%50 güneşli, ~%17 diğerleri) */
export const WEATHER_DISTRIBUTION: string[] = ['sunny', 'sunny', 'sunny', 'rainy', 'snowy', 'windy'];

// ─── Ev Sahibi Avantajı ───────────────────────────────────────────────
export const HOME_ADVANTAGE = {
  overall: 1.10,
  attack: 1.10,
  midfield: 1.08,
  defense: 1.05,
} as const;

// ─── Yorgunluk Eşikleri ve Modifiyerleri ───────────────────────────────
export const FATIGUE_COND_THRESHOLDS = { low: 50, mid: 70 } as const;
export const FATIGUE_COND_MODS = { low: 0.6, mid: 0.8, full: 1.0 } as const;
export const FATIGUE_MINUTE_THRESHOLDS = { late: 75, mid: 60 } as const;
export const FATIGUE_MINUTE_MODS = { late: 0.85, mid: 0.92, fresh: 1.0 } as const;

// ─── Olay Olasılıkları — Hücum Evresi ─────────────────────────────────
export const ATTACK_PROBS = {
  FWD: { shotMultiplier: 0.18, shotMin: 0.02, shotMax: 0.25, chanceMultiplier: 0.12, chanceMin: 0.02, chanceMax: 0.18, foul: 0.03 },
  MID: { shotMultiplier: 0.08, shotMin: 0.01, shotMax: 0.12, chanceMultiplier: 0.10, chanceMin: 0.01, chanceMax: 0.15, interceptionMultiplier: 0.08, interceptionMin: 0.01, interceptionMax: 0.12, foul: 0.04 },
  DEF: { tackleMultiplier: 0.07, tackleMin: 0.01, tackleMax: 0.10, interceptionMultiplier: 0.06, interceptionMin: 0.01, interceptionMax: 0.09, foul: 0.05 },
  GK:  { saveMultiplier: 0.04, saveMin: 0.01, saveMax: 0.06 },
} as const;

// ─── Olay Olasılıkları — Savunma Evresi ────────────────────────────────
export const DEFEND_PROBS = {
  DEF: { tackleMultiplier: 0.12, tackleMin: 0.02, tackleMax: 0.18, interceptionMultiplier: 0.09, interceptionMin: 0.01, interceptionMax: 0.14, foul: 0.06 },
  MID: { tackleMultiplier: 0.07, tackleMin: 0.01, tackleMax: 0.11, interceptionMultiplier: 0.08, interceptionMin: 0.01, interceptionMax: 0.12, foul: 0.04 },
  GK:  { saveMultiplier: 0.10, saveMin: 0.02, saveMax: 0.15 },
  FWD: { interceptionMultiplier: 0.04, interceptionMin: 0.01, interceptionMax: 0.06, foul: 0.03 },
} as const;

// ─── Güç Oranı Çarpanları ──────────────────────────────────────────────
export const STRENGTH_RATIO = {
  attackShot: 1.5,
  attackChance: 1.3,
  defendTackle: 1.3,
  defendSave: 1.5,
} as const;

// ─── Olasılık Üst Sınırları ────────────────────────────────────────────
export const PROB_CAPS = {
  shot: 0.35,
  tackle: 0.25,
  interception: 0.20,
  foul: 0.15,
  chance: 0.25,
  save: 0.20,
} as const;

// ─── Gol Olasılığı Sabitleri ───────────────────────────────────────────
export const GOAL_CHANCE = {
  base: 0.03,           // 3% base goal per attacking minute
  gkWeight: 0.5,        // GK rating weight in goal chance formula
  qualityGapBonus: 0.3,  // Quality gap bonus for stronger team
  qualityGapPenalty: 0.2, // Quality gap penalty for weaker team
  mentalityBonus: 0.12,   // Per-point mentality bonus (mentality >= 4)
  mentalityPenalty: 0.08, // Per-point mentality penalty (mentality <= 2)
  counterTriggerProb: 0.3, // Counter bonus trigger probability
  pressingGoalBoost: 0.3,  // Pressing → goal boost factor
  lateGameDesperation: 1.25, // Late game desperation multiplier (min > 80)
  clampMin: 0.005,        // Goal chance clamp minimum
  clampMax: 0.12,         // Goal chance clamp maximum
} as const;

// ─── Asist Olasılığı ──────────────────────────────────────────────────
export const ASSIST_CHANCE = 0.65;

// ─── Gol Türü Olasılıkları ────────────────────────────────────────────
export const GOAL_TYPE = {
  headerChance: 0.15,       // Header goal chance (if ST position)
  longShotChance: 0.10,     // Long shot goal chance
  longShotThreshold: 70,    // Long shots attribute threshold
  lateGoalMinute: 85,       // Minute threshold for late goal classification
} as const;

// ─── Derecelendirme Etki Değerleri ────────────────────────────────────
export const RATING_IMPACT = {
  goal: 1.2,
  assist: 0.7,
  shotSaved: 0.15,
  gkSave: 0.4,
  shotWide: -0.1,
  shotPost: 0.05,
  chanceCreated: 0.05,
  assistOnChance: 0.1,
  tackle: 0.15,
  interception: 0.12,
  foulCommitted: -0.15,
  yellowCard: -0.35,
  redCard: -2.0,
  penalty: 0.3,
  freeKick: 0.1,
  offside: -0.05,
  corner: 0.02,
  gkReactionarySave: 0.3,
} as const;

// ─── Kart / Hakem Olasılıkları ────────────────────────────────────────
export const CARD_RATES = {
  yellow: 0.15,       // Base yellow card probability
  red: 0.03,          // Base red card probability
  penalty: 0.1,       // Base penalty probability
  foulVisibility: 0.4, // Foul visibility threshold
} as const;

// ─── Ofsayt / Korner Olasılıkları ─────────────────────────────────────
export const SET_PIECE_RATES = {
  offside: 0.02,       // Base offside probability
  corner: 0.015,       // Base corner probability
} as const;

// ─── Olay Görünürlük Eşikleri ─────────────────────────────────────────
export const EVENT_VISIBILITY = {
  tackle: 0.3,          // Tackle event visibility probability
  interception: 0.25,   // Interception event visibility probability
  gkSaveScaling: 0.5,   // GK save scaling factor (probs.save * this)
  gkSave: 0.35,         // GK save event visibility probability
} as const;

// ─── Sakatlık Riski ───────────────────────────────────────────────────
export const INJURY_RISK = {
  low: 0.015,        // cond < 40
  mid: 0.005,        // cond < 60
  base: 0.001,       // otherwise
  condThresholdLow: 40,
  condThresholdMid: 60,
  ratingImpactHeavy: -1.5,
  ratingImpactMedium: -1.0,
  ratingImpactLight: -0.5,
} as const;

// ─── Kondisyon Tüketimi ───────────────────────────────────────────────
export const CONDITION_DRAIN = {
  base: 0.15,            // Base condition drain per minute
  staminaDivisor: 1000,   // Stamina drain divisor
  fallbackDrain: 0.2,     // Fallback stamina drain factor
} as const;

// ─── Maç Yapısı ───────────────────────────────────────────────────────
export const MATCH_STRUCTURE = {
  duration: 90,              // Match duration (minutes)
  halftime: 45,              // Halftime minute
  substitutionSlots: 3,      // Substitution slots per team
  autoSubMinutes: [60, 75],  // Auto-substitution check minutes
  tiredPlayerCondThreshold: 50, // Condition threshold for tired player substitution
} as const;

// ─── Momentum Sapmaları ───────────────────────────────────────────────
export const MOMENTUM_BIASES = {
  earlyHomeBias: 1.15,       // Home bias in first 15 minutes
  earlyHomeCutoff: 15,       // Minute cutoff for early home bias
  awayRallyBias: 1.08,       // Away rally bias (min 46-60)
  awayRallyStart: 45,        // Away rally start minute (exclusive)
  awayRallyEnd: 60,          // Away rally end minute (inclusive)
  leadSitBack: 0.85,         // Leading team sit-back factor (min > 75)
  leadSitBackCutoff: 75,     // Minute cutoff for sit-back
  losingTeamPush: 1.2,       // Losing team push factor (min > 60)
  losingPushCutoff: 60,      // Minute cutoff for losing push
  redCardPenalty: 0.75,      // Red card momentum penalty
} as const;

// ─── Pas Simülasyonu ──────────────────────────────────────────────────
export const PASS_SIMULATION = {
  minPasses: 1,                // Min passes per minute
  maxPasses: 4,                // Max passes per minute
  keyPassChance: 0.12,         // Key pass chance multiplier
  longBallShortPassPenalty: 0.1, // Long ball short-pass penalty factor
} as const;

// ─── Oyun Tarzı Kombinasyon Ağırlıkları ────────────────────────────────
export const PLAYSTYLE_WEIGHTS = {
  combinationWeight: 0.5,        // Weight for combining paired play style bonuses
  defenseWeight: 0.3,            // Defense weight in position selection for events
  pressingTackleBoost: 0.5,      // Pressing → tackle boost factor
} as const;

// ─── Oyuncu Derecelendirme Ağırlıkları ─────────────────────────────────
export const PLAYER_RATING_WEIGHTS = {
  baseRating: 6.0,
  GK: {
    perSave: 0.15,
    perGoalConceded: -0.3,
  },
  DEF: {
    perTackle: 0.08,
    perInterception: 0.06,
    perAssist: 0.25,
    perGoal: 0.5,
  },
  MID: {
    perKeyPass: 0.12,
    perPass: 0.003,
    perTackle: 0.04,
    perGoal: 0.4,
    perAssist: 0.3,
  },
  FWD: {
    perGoal: 0.5,
    perAssist: 0.3,
    perShotOnTarget: 0.05,
    perMissedShot: -0.02,
  },
  yellowCardPenalty: -0.2,
  redCardPenalty: -1.0,
  foulPenalty: -0.03,
  playingTimeFactors: { full85: 1.0, mid60: 0.9, low30: 0.8, sub30: 0.7 } as const,
  ratingShiftBase: 5.0,
  mentalModifierStrength: 0.5,
  ratingClamp: { min: 3.0, max: 10.0 } as const,
} as const;
