// Pozisyon gruplari ve spesifik mevkiler
export type PositionGroup = 'GK' | 'DEF' | 'MID' | 'FWD';
export type SpecificPosition = 
  | 'GK'
  | 'CB' | 'LB' | 'RB' | 'LWB' | 'RWB'
  | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM' | 'LW' | 'RW'
  | 'CF' | 'ST';

export interface Player {
  id: string;
  name: string;
  position: PositionGroup;              // Geniş grup (GK, DEF, MID, FWD) - backward compat
  specificPosition: SpecificPosition;     // Spesifik mevki (CB, LB, CDM, ST vs.)
  secondaryPositions?: SpecificPosition[]; // Yan mevkiler (max 2)
  rating: number;
  age: number;
  potential: number;
  height?: number;
  weight?: number;
  market_value: number;
  salary: number;
  nation: string;
  club?: string;
  preferred_foot?: 'Left' | 'Right' | 'Both';
  defending: number;
  passing: number;
  shooting: number;
  speed: number;
  power: number;
  vision?: number;
  control?: number;
  stamina?: number;
  heading?: number;
  goalkeeping?: number;
  
  // TECHNICAL (TR: Teknik)
  finishing?: number;     // Bitiricilik
  dribbling?: number;     // Dribling
  firstTouch?: number;    // İlk Kontrol
  crossing?: number;      // Orta Yapma
  marking?: number;       // Markaj
  tackling?: number;      // Top Kapma
  technique?: number;     // Teknik
  longShots?: number;     // Uzaktan Şut
  offTheBall?: number;    // Saha Yerleşimi

  // MENTAL (TR: Zihinsel)
  aggression?: number;    // Agresiflik
  bravery?: number;       // Cesaret
  workRate?: number;      // Çalışkanlık
  decisions?: number;     // Karar Alma
  determination?: number; // Kararlılık
  concentration?: number; // Konsantrasyon
  leadership?: number;    // Liderlik
  anticipation?: number;  // Önsez
  flair?: number;         // Özel Yetenek
  positioning?: number;   // Pozisyon Alma
  composure?: number;     // Soğukkanlılık
  teamwork?: number;      // Takım Oyunu
  // vision already defined above

  // PHYSICAL (TR: Fiziksel)
  agility?: number;       // Çeviklik
  balance?: number;       // Denge
  strength?: number;      // Güç
  acceleration?: number;  // Hızlanma
  jumping?: number;       // Zıplama
  leftFoot?: number;      // Sol Ayak (0-100)
  rightFoot?: number;     // Sağ Ayak (0-100)
  
  cond: number; // 0-100
  form: number; // 0-100 (impacts match performance)
  morale: number; // 0-100 (impacts consistency)
  confidence: number; // 0-100 (impacts big decisions)
  chemistry?: number; // 0-100
  hidden_potential: number;
  scouted?: boolean;
  injury?: {
    type: 'light' | 'chronic' | 'risky';
    remaining_days: number;
    severity: number;
  };

  // SAKATLIK GEÇMİŞİ (ADIM 1A)
  // Format: [{date: "2026-05-01", duration_days: 7, type: "hamstring"}]
  injury_history?: InjuryRecord[];

  // FORM PUANI (ADIM 1B) - Son 5 maç performans ortalaması (0-100)
  // match_ratings dizisinden hesaplanır, günlük cron ile güncellenir
  form_rating?: number;
  traits: string[];
  negTraits?: string[];
  personalityTraits?: string[];
  playStyle?: string;
  archetype?: string;
  special_role?: string | null;
  is_legend?: boolean;
  traitLevels?: Record<string, 'MOR' | 'ALTIN' | 'LACIVERT' | 'BEYAZ'>;
  styleLevels?: Record<string, number>; // 1, 2, 3 (White, Blue, Purple)
  is_for_sale?: boolean;
  sale_price?: number;
  is_retiring?: boolean;
  isResting?: boolean;

  // ADIM 2: KART CEZALARI VE SAKATLIK
  suspended_until?: string;     // ISO date - oyuncu cezalı olduğu son tarih
  is_injured?: boolean;         // Aktif sakatlık durumu
  injury_end_date?: string;     // ISO date - sakatlık bitiş tarihi
  transferOffer?: {
    bidder: string;
    amount: number;
    deadline?: string;
  };
  match_ratings?: number[];
  photo_url?: string;
  scouting_stars?: number;
  scouting_count?: number;
  
  // DETAILED PERFORMANCE STATS (TR: Detaylı Performans Verileri)
  goalStats?: {
    plase?: number;
    header?: number;
    head_right?: number;
    head_left?: number;
    one_touch?: number;
    postup_turn?: number;
    sprint_finish?: number;
    long_shot?: number;
    penalty?: number;
    freekick?: number;
  };
  saveStats?: {
    long_shot?: number;
    freekick?: number;
    one_on_one?: number;
    shot_stopping?: number;
    penalty?: number;
  };

  // Mental attributes
  determination?: number;
  concentration?: number;
  leadership?: number;
  anticipation?: number;
  flair?: number;
  positioning?: number;
  composure?: number;
  teamwork?: number;
  workrate?: number;
  vision?: number; // Already exists but grouping for clarity if needed
  aggression?: number;
  bravery?: number;
  decisions?: number;
}

/** Sakatlık geçmişi kaydı (ADIM 1A) */
export interface InjuryRecord {
  date: string;           // Sakatlık tarihi (ISO format)
  duration_days: number;  // Sakatlık süresi (gün)
  type: string;           // Sakatlık tipi (hamstring, ankle, knee, vb.)
}

export interface Sponsor {
  id: string;
  name: string;
  type: 'Main' | 'Sleeve' | 'Stadium' | 'Global';
  weeklyPayment: number;
  duration: number; // in days
  remainingDays: number;
  bonus?: { type: 'win' | 'top3' | 'champion', amount: number };
}

export interface Profile {
  id: string;
  manager_name: string;
  team_name: string;
  league_name?: string;
  level: number;
  xp: number;
  money: number;
  fans: number;
  reputation: number;
  mg_coins: number;
  current_day: number;
  team_id?: string;
  defense_powers?: Record<string, number>; 
  ticket_price?: number;
  academy_level?: number;
  academy_extra_slots?: boolean;
  stadium_capacity?: number;
  region?: string;
  active_upgrade_type?: string | null;
  active_upgrade_id?: string | null;
  active_upgrade_finish_day?: number | null;
  stadium_upgrades?: Record<string, number>;
  sponsors?: Sponsor[];
  philosophy?: string;
  primary_color?: string;
  secondary_color?: string;
  is_bot?: boolean;
  bot_difficulty?: number;
  academy_weekly_budget?: number;
  last_youth_intake_season?: string;
  created_at?: string;
}

export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'YELLOW' | 'RED' | 'SUB' | 'INJURY' | 'COMMENTARY' | 'HALFTIME' | 'FULLTIME' | 'OFFSIDE' | 'CORNER';
  text: string;
  player?: string;
  team?: 'HOME' | 'AWAY';
}

export interface MatchResult {
  score: { home: number; away: number };
  events: MatchEvent[];
  playerRatings: Record<string, number>;
  staminaLoss: Record<string, number>;
  playerStats: Record<string, { 
    goals: number, 
    assists: number,
    goalDetails?: Record<string, number>,
    saveDetails?: Record<string, number>
  }>;
  stats: {
    home: { possession: number; shots: number; shotsOnTarget: number; passing: number };
    away: { possession: number; shots: number; shotsOnTarget: number; passing: number };
  };
  motm?: string;
}

export const FITNESS_THRESHOLDS = {
  CRITICAL: 70, // Injury risk
  LOW: 89,      // Performance penalty
  HIGH: 90,     // Optimal performance
};

export interface MatchState {
  minute: number;
  score: { home: number; away: number };
  result: any;
  visibleEvents: any[];
  matchSummaryEvents: { home: any[]; away: any[] };
  isActive: boolean;
  isFinished: boolean;
  isPaused: boolean;
  playerConditions: Record<string, number>;
  isReplay?: boolean;
}

export interface LeagueTeam {
  id: string;
  name: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  rating: number;
}

export interface ActiveTactic {
  formation: string;
  mentality: number;
  pressing: boolean;
  passingStyle: string;
  intensity?: 'low' | 'normal' | 'high';
  tactic_type?: string;
  lineHeight: number;      // 0-100
  width: number;           // 0-100
  aggression: number;       // 0-100
  passingIntensity: number; // 0-100
  screenKeeper: boolean;
  wasteTime: boolean;
  parkTheBus: boolean;
  crossGame: boolean;
  loneStrikerCounter: boolean;
  offsideTrap: boolean;
  playStyle?: string;
  tempo?: string;
  defensiveLine?: string;
}

export type GameTactics = ActiveTactic;

export type TrainingProgramId = 'fiziksel_yukleme' | 'teknik_driller' | 'savunma_okulu' | 'bitiricilik_kampi';

export interface TrainingAssignment {
  playerId: string;
  programId: TrainingProgramId;
  focusedStat?: keyof Player;
}

export interface TrainingSessionResult {
  statsGained: Record<string, number>;
  traitsGained: string[];
  injuryRisk: boolean;
  staminaLost: number;
}

export interface Operation {
  id: string;
  name: string;
  tier: number;
  description: string;
  cost: number;
  successRate: number;
  scandalRisk: number;
  impactType: 'stamina' | 'luck' | 'referee' | 'error_rate' | 'money' | 'points' | 'defense' | 'cleanup';
  impactValue: number;
  type?: 'ATTACK' | 'DEFENSE' | 'CLEANUP';
  category?: string;
  infoKey?: string;
}

export interface ActiveOperation {
  id: string;
  operationId: string;
  status: 'pending' | 'success' | 'scandal' | 'completed';
  timestamp: string;
  resultText?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string | null; // null for global chat
  content: string;
  timestamp: string;
  is_read: boolean;
  type: 'dm' | 'chat' | 'offer';
}

export interface MatchSchedule {
  nextMatchTime: string;
  isMatchActive: boolean;
  isTestMode: boolean;
}

export interface Scout {
  id: string;
  name: string;
  stars: number;
  status: 'IDLE' | 'SCOUTING';
  location?: string;
  remainingDays: number;
}

export interface ScoutingState {
  scouts: Scout[];
  foundPlayersPool: Player[];
  history?: Player[];
  watchlist?: Player[];
  stars?: number; // average stars of the network
  count?: number; // total scouts
}

export interface LabSettings {
  weather: 'Sunny' | 'Rainy' | 'Snowy';
  ground: 'Normal' | 'Muddy' | 'Icy';
  refereeStrictness: 'Low' | 'Medium' | 'High' | 'Extreme';
  moraleMode: 'Standard' | 'Collapsed' | 'Hyper';
  pressureMode: 'None' | 'High' | 'Panic';
  is9v9: boolean;
  scenario?: 'RedCard' | 'Last5Min' | 'SetPiece' | 'Chaos';
  ghostOpponent?: {
    playStyle: string;
    strength: number; // 0-100
    focusArea: 'Defensive' | 'Offensive' | 'Counter';
    weakPoint?: string;
  };
}

export interface TrainingState {
  assignments: TrainingAssignment[];
  coachQuality: number;
  lastSessionResults: Record<string, TrainingSessionResult>;
  activeOperations?: ActiveOperation[];
  operationReports?: string[];
  inbox?: Message[];
  scouting?: ScoutingState;
  labSettings?: LabSettings;
}

export const getDefaultActiveTactic = (): ActiveTactic => ({
  formation: '4-4-2',
  mentality: 3,
  pressing: false,
  passingStyle: 'Karışık',
  intensity: 'normal',
  lineHeight: 50,
  width: 50,
  aggression: 50,
  passingIntensity: 50,
  screenKeeper: false,
  wasteTime: false,
  parkTheBus: false,
  crossGame: false,
  loneStrikerCounter: false,
  offsideTrap: false,
  playStyle: 'dengeli',
  tempo: 'normal',
  defensiveLine: 'normal',
});

export const getDefaultGameTactics = (): GameTactics => ({
  ...getDefaultActiveTactic(),
});

export const getDefaultTrainingState = (): TrainingState => ({
  assignments: [],
  coachQuality: 1.0,
  lastSessionResults: {},
  scouting: {
    scouts: [],
    foundPlayersPool: [],
    history: [],
    watchlist: []
  }
});
