// =============================================================================
// Managerium — Enhanced Match Engine
// =============================================================================
// Comprehensive football match simulation with realistic event generation,
// Turkish commentary, detailed statistics, and player rating calculation.
// =============================================================================

import type { Player, ActiveTactic } from './types';
import {
  type RefereeMatchContext,
  type RefereePersonality,
  REFEREE_PERSONALITIES,
  createRefereeMatchContext,
  shouldCallFoul,
  shouldGiveYellowCard,
  shouldGiveRedCard,
  shouldGivePenalty,
  getOffsideMultiplier,
  checkVARForGoal,
} from './referee';

// ─── Weather ────────────────────────────────────────────────────────────────
export type Weather = 'sunny' | 'rainy' | 'snowy' | 'windy';

// ─── Match Event ────────────────────────────────────────────────────────────
export type MatchEventType =
  | 'goal'
  | 'shot_saved'
  | 'shot_wide'
  | 'shot_post'
  | 'foul'
  | 'yellow_card'
  | 'red_card'
  | 'corner'
  | 'free_kick'
  | 'penalty'
  | 'offside'
  | 'substitution'
  | 'injury'
  | 'save'
  | 'tackle'
  | 'interception'
  | 'chance'
  | 'var_review'
  | 'goal_overturned';

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  team: 'home' | 'away';
  playerName: string;
  playerId: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  description: string;
  x: number; // 0-100 pitch coordinate
  y: number; // 0-100 pitch coordinate
  ratingImpact: number; // +/- impact on player rating
}

// ─── Match Statistics ───────────────────────────────────────────────────────
export interface MatchStats {
  possession: number; // %
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passAccuracy: number; // %
  tackles: number;
  interceptions: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  corners: number;
  freeKicks: number;
  offsides: number;
  injuries: number;
  saves: number;
}

// ─── Player Match Rating ────────────────────────────────────────────────────
export interface PlayerMatchRating {
  playerId: string;
  playerName: string;
  position: string;
  rating: number; // 1-10
  goals: number;
  assists: number;
  shots: number;
  tackles: number;
  passes: number;
  keyPasses: number;
  saves: number;
}

// ─── Enhanced Match Result ──────────────────────────────────────────────────
export interface EnhancedMatchResult {
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  homeStats: MatchStats;
  awayStats: MatchStats;
  homePlayerRatings: PlayerMatchRating[];
  awayPlayerRatings: PlayerMatchRating[];
  manOfTheMatch: string; // playerId
  homePossession: number;
  awayPossession: number;
  weather: Weather;
  refereeName?: string;
  refereePersonality?: RefereePersonality;
  refereeStrictness?: number;
  varReviews?: number;
  goalsOverturned?: number;
}

// ─── Simulation Options ─────────────────────────────────────────────────────
export interface SimulationOptions {
  weather?: Weather;
  seed?: number;
  extraTime?: boolean;
  homeTeamName?: string;
  awayTeamName?: string;
  substitutes?: {
    home: Player[];
    away: Player[];
  };
  // Referee system
  refereeStrictness?: number;  // 1-99, modifies foul/card/penalty rates
  refereePersonality?: 'katil' | 'dengeci' | 'hoşgörülü' | 'ev_sahibi' | 'değişken' | 'var_sever';
  refereeName?: string;
}

// ─── Internal Mutable Player State ──────────────────────────────────────────
interface MutablePlayerState {
  player: Player;
  team: 'home' | 'away';
  isSubbedOut: boolean;
  isSubbedIn: boolean;
  isInjured: boolean;
  currentCond: number;
  events: MatchEvent[];
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  tackles: number;
  interceptions: number;
  passes: number;
  keyPasses: number;
  saves: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  ratingDelta: number;
  minuteEntered: number;
  minuteLeft: number;
}

interface TeamState {
  players: MutablePlayerState[];
  tactic: ActiveTactic;
  overallStrength: number;
  attackStrength: number;
  midfieldStrength: number;
  defenseStrength: number;
  gkStrength: number;
  substitutionSlots: number;
  usedSubs: number;
  substitutes: MutablePlayerState[];
}

interface LiveStats {
  possessionTicks: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passSuccesses: number;
  tackles: number;
  interceptions: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  corners: number;
  freeKicks: number;
  offsides: number;
  injuries: number;
  saves: number;
}

// =============================================================================
// Utility helpers
// =============================================================================

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * totalWeight;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function getAttr(p: Player, attr: string, fallback = 50): number {
  const val = (p as unknown as Record<string, unknown>)[attr];
  return typeof val === 'number' ? val : fallback;
}

function positionGroup(p: Player): string {
  return p.position;
}

function isPosition(p: Player, group: string): boolean {
  return p.position === group;
}

// =============================================================================
// Team Strength Calculation
// =============================================================================

function calculateTeamStrength(players: Player[], tactic: ActiveTactic): {
  overall: number;
  attack: number;
  midfield: number;
  defense: number;
  gk: number;
} {
  const forwards = players.filter(p => isPosition(p, 'FWD'));
  const midfielders = players.filter(p => isPosition(p, 'MID'));
  const defenders = players.filter(p => isPosition(p, 'DEF'));
  const goalkeepers = players.filter(p => isPosition(p, 'GK'));

  const weightedRating = (group: Player[], ...attrs: string[]) => {
    if (group.length === 0) return 0;
    return group.reduce((sum, p) => {
      let attrSum = 0;
      for (const a of attrs) attrSum += getAttr(p, a, 50);
      const avg = attrSum / attrs.length;
      const moraleMod = 0.7 + (p.morale / 100) * 0.3;
      const formMod = 0.7 + (p.form / 100) * 0.3;
      const condMod = 0.7 + (p.cond / 100) * 0.3;
      return sum + avg * moraleMod * formMod * condMod;
    }, 0) / group.length;
  };

  const attack = weightedRating(forwards, 'finishing', 'shooting', 'speed', 'dribbling', 'offTheBall');
  const midfield = weightedRating(midfielders, 'passing', 'vision', 'control', 'stamina', 'technique');
  const defense = weightedRating(defenders, 'tackling', 'marking', 'positioning', 'strength', 'anticipation');
  const gk = goalkeepers.length > 0
    ? weightedRating(goalkeepers, 'goalkeeping', 'reflexes', 'positioning', 'composure', 'concentration')
    : weightedRating(goalkeepers, 'goalkeeping');

  const overall = (attack * 0.3 + midfield * 0.3 + defense * 0.25 + gk * 0.15);

  // Tactic modifiers
  let tacticMod = 1.0;
  // Mentality 1-5 scale
  if (tactic.mentality >= 4) tacticMod += (tactic.mentality - 3) * 0.05;
  else if (tactic.mentality <= 2) tacticMod -= (3 - tactic.mentality) * 0.03;

  // Pressing bonus
  if (tactic.pressing) tacticMod += 0.04;

  // Intensity
  if (tactic.intensity === 'high') tacticMod += 0.06;
  else if (tactic.intensity === 'low') tacticMod -= 0.04;

  // Aggression
  tacticMod += (tactic.aggression - 50) * 0.0004;

  return {
    overall: overall * tacticMod,
    attack: attack * tacticMod,
    midfield: midfield * tacticMod,
    defense: defense * tacticMod,
    gk: gk,
  };
}

// =============================================================================
// Commentary Generation (Turkish)
// =============================================================================

const COMMENTARY = {
  goal: {
    normal: [
      (p: string, a: string, m: number) =>
        `${m}. dakikada ${a}'ın mükemmel pasıyla ${p} golü buldu! Tribünler yerinden oynadı!`,
      (p: string, a: string, m: number) =>
        `${m}. dakikada harika bir organizasyon! ${a} topu ${p}'e aktardı ve fileler heyecanla sallandı!`,
      (p: string, a: string, m: number) =>
        `${m}. dakikada ${a}'ın kilit pasıyla ${p} şık bir vuruşla takımını öne geçirdi!`,
      (p: string, a: string, m: number) =>
        `${m}. dakikada muazzam bir hücum! ${a} serbest kalıp ${p}'e topu bıraktı, neticesi gol!`,
      (p: string, a: string, m: number) =>
        `${m}. dakikada ${a}'ın görkemli pası ve ${p}'in harika bitirişi! Seyirciler coştu!`,
    ],
    solo: [
      (p: string, m: number) =>
        `${m}. dakikada ${p} tek başına sahneye çıktı! Müthiş bir çalımla defansı geçip golü buldu!`,
      (p: string, m: number) =>
        `${m}. dakikada ${p} kendi çabasıyla topu kaptı, orta sahaya dek koştu ve ağları buldu!`,
      (p: string, m: number) =>
        `${m}. dakikada ${p}'in bireysel şaheseri! Birkaç oyuncuyu ezip geçti ve kalecinin solundan topu ağlara gönderdi!`,
    ],
    header: [
      (p: string, a: string, m: number) =>
        `${m}. dakikada kornere çıkan ${a} ortasını yaptı, ${p} havada asılı kaldı ve kafa golüyle takımını mutlu etti!`,
      (p: string, a: string, m: number) =>
        `${m}. dakikada ${a}'in muhteşem ortasına ${p} yükseldi ve kafayla topu ağlara gönderdi!`,
    ],
    longShot: [
      (p: string, m: number) =>
        `${m}. dakikada ${p} ceza sahası dışından harika bir şut attı! Top köşeden ağlarla buluştu! Uzaktan şut specialization!`,
      (p: string, m: number) =>
        `${m}. dakikada müthiş bir şut geldi! ${p} yaklaşık 25 metreden fileleri buldu! Kaleci şaşkınlık içinde kaldı!`,
    ],
    penalty: [
      (p: string, m: number) =>
        `${m}. dakikada penaltı vuruşunu kullanan ${p} topu ağlara gönderdi! Soğukkanlı bir vuruş!`,
    ],
    freeKick: [
      (p: string, m: number) =>
        `${m}. dakikada ${p} serbest vuruşu mükemmel kullandı! Top barajın üzerinden kavis yapıp ağlarla buluştu!`,
    ],
    counter: [
      (p: string, a: string, m: number) =>
        `${m}. dakikada nefes kesen bir kontra atak! ${a} topu hemen ileri attı, ${p} kaleciyle karşı karşıya golü buldu!`,
    ],
    lateGoal: [
      (p: string, a: string, m: number) =>
        `${m}. dakikada son anlarda dramatik bir gol! ${a}'ın pasıyla ${p} maçın kaderini değiştirdi! İnanılmaz bir son!`,
    ],
  },
  shot_saved: [
    (p: string, gk: string, m: number) =>
      `${m}. dakikada ${p} sert vurdu ama kaleci ${gk} harika bir refleksle topu kornere çeldi!`,
    (p: string, gk: string, m: number) =>
      `${m}. dakikada ${p}'in güçlü şutunu ${gk} çift yumrukla uzaklaştırdı! Müthiş bir kurtarış!`,
    (p: string, gk: string, m: number) =>
      `${m}. dakikada ${p} kaleyi test etti ama ${gk} yatarak topu kurtardı!`,
    (p: string, gk: string, m: number) =>
      `${m}. dakikada ${p} şık bir vuruş yaptı, ${gk} köşeyi iyi okuyup topu tuttu!`,
    (p: string, gk: string, m: number) =>
      `${m}. dakikada ${p}'in plase şutunu ${gk} parmak ucuyla kornere attı! Çok yakın!`,
  ],
  shot_wide: [
    (p: string, m: number) =>
      `${m}. dakikada ${p} şut attı ama top auta gitti. Fırsat kaçtı.`,
    (p: string, m: number) =>
      `${m}. dakikada ${p}'in şutu az farkla kaleyi bulmadı! İzleyiciler derin bir nefes aldı.`,
    (p: string, m: number) =>
      `${m}. dakikada ${p} vurdu ama direk dibinden dışarı çıktı!`,
    (p: string, m: number) =>
      `${m}. dakikada ${p} iyi bir pozisyon yakaladı ama vuruşu kalibrasyon eksikliğiyle auta gitti.`,
  ],
  shot_post: [
    (p: string, m: number) =>
      `${m}. dakikada ${p} harika vurdu ama top direkten döndü! Kaçan gol!`,
    (p: string, m: number) =>
      `${m}. dakikada ${p} inanılmaz bir şut çekti, kaleci çaresiz kalırken top direkten geri geldi!`,
    (p: string, m: number) =>
      `${m}. dakikada ${p}'in şutu kalecinin üzerinden auta çarptı! Canhıraç bir an!`,
  ],
  foul: [
    (p: string, m: number) =>
      `${m}. dakikada ${p} sert bir müdahale yaptı ve hakem faul düdüğü çaldı.`,
    (p: string, m: number) =>
      `${m}. dakikada ${p} top mücadelesinde rakibine faul yaptı.`,
    (p: string, m: number) =>
      `${m}. dakikada sert bir girişim! ${p} rakibini yere düşürdü, hakem durumu değerlendiriyor.`,
    (p: string, m: number) =>
      `${m}. dakikada ${p} pozisyon mücadelesinde hücuma engel oldu ama faul gerekçesiyle oyun durdu.`,
  ],
  yellow_card: [
    (p: string, m: number) =>
      `${m}. dakikada ${p} sarı kart gördü! Ciddi bir ihlal, hakem cebine el attı.`,
    (p: string, m: number) =>
      `${m}. dakikada ${p}'in tehlikeli müdahalesi sarı kartla sonuçlandı. Bu oyuncu dikkatli olmalı!`,
    (p: string, m: number) =>
      `${m}. dakikada taktiksel bir faul! ${p} sarı kart gördü, takımını organize olmaya çağırıyor.`,
    (p: string, m: number) =>
      `${m}. dakikada ${p} aşırı agresif bir müdahale yaptı ve sarı kart cezasını gördü.`,
  ],
  red_card: [
    (p: string, m: number) =>
      `${m}. dakikada kırmızı kart! ${p} sahadan ihraç edildi! Takımı 10 kişi kaldı!`,
    (p: string, m: number) =>
      `${m}. dakikada ${p} son çare bir faul yaptı ve hakem doğrudan kırmızı kartı gösterdi!`,
  ],
  corner: [
    (p: string, m: number) =>
      `${m}. dakikada ${p}'in şutunu savunma kornere çeldi. Korner kullanılacak.`,
    (p: string, m: number) =>
      `${m}. dakikada ${p} kanattan getirdi ama savunma topu uzaklaştırdı. Korner.`,
  ],
  free_kick: [
    (p: string, m: number) =>
      `${m}. dakikada ${p} tehlikeli bir bölgede faul yaptı. Serbest vuruş kullanılacak.`,
    (p: string, m: number) =>
      `${m}. dakikada ${p} serbest vuruş kazandı. Top tehlikeli bölgede duruyor.`,
  ],
  penalty: [
    (p: string, m: number) =>
      `${m}. dakikada ceza sahası içinde faul! Penaltı! ${p} penaltı kazandırdı!`,
  ],
  offside: [
    (p: string, m: number) =>
      `${m}. dakikada ${p} ofsayt pozisyonunda kaldı. Bayrak yukarıda.`,
    (p: string, m: number) =>
      `${m}. dakikada güzel bir koşu ama ${p} ofsayt çizgisini geçmiş. Oyun durdu.`,
  ],
  injury: [
    (p: string, m: number) =>
      `${m}. dakikada ${p} sakatlık durumuyla yerde kaldı. Sağlık ekibi sahaya giriyor.`,
    (p: string, m: number) =>
      `${m}. dakikada kötü bir düşme! ${p} ağrı içinde yerde. Maç duraksadı.`,
  ],
  save: [
    (p: string, m: number) =>
      `${m}. dakikada kaleci ${p} inanılmaz bir kurtarış yaptı! Topu çeliştirip kornere attı!`,
    (p: string, m: number) =>
      `${m}. dakikada ${p} altı pasta devleşti! Müthiş bir refleks!`,
    (p: string, m: number) =>
      `${m}. dakikada yakın mesafe şutunu ${p} muhteşem bir şekilde kurtardı!`,
  ],
  tackle: [
    (p: string, m: number) =>
      `${m}. dakikada ${p} mükemmel bir top kapma ile hücumu önledi!`,
    (p: string, m: number) =>
      `${m}. dakikada ${p} zamanlamasını harika ayarladı ve topu rakibin ayağından aldı!`,
    (p: string, m: number) =>
      `${m}. dakikada kritik bir müdahale! ${p} kanarya bir kalkan gibi savunmaya yardımcı oldu.`,
  ],
  interception: [
    (p: string, m: number) =>
      `${m}. dakikada ${p} pas yolunu kesti! Harika bir önsezi.`,
    (p: string, m: number) =>
      `${m}. dakikada ${p} rakibin pasını okudu ve topu kaptı. Akıllıca bir pozisyon alma.`,
  ],
  chance: [
    (p: string, m: number) =>
      `${m}. dakikada ${p} büyük bir fırsat yakaladı! Kaleciyle karşı karşıya kaldı!`,
    (p: string, m: number) =>
      `${m}. dakikada ${p} ceza sahasına girdi, tehlikeli bir pozisyon!`,
    (p: string, m: number) =>
      `${m}. dakikada muazzam bir pas! ${p} vuruş hazırlığı yapıyor!`,
  ],
  var_review: [
    (p: string, m: number) =>
      `${m}. dakikada VAR incelemesi! Hakem monitöre gidiyor. ${p} ile ilgili pozisyon inceleniyor...`,
    (p: string, m: number) =>
      `${m}. dakikada şüpheli pozisyon! VAR hakemi uyarıyor, ${p} olayı değerlendiriliyor.`,
  ],
  goal_overturned: [
    (p: string, m: number) =>
      `${m}. dakikada VAR incelemesi sonucu gol İPTAL EDİLDİ! ${p} ofsayttaydı!`,
    (p: string, m: number) =>
      `${m}. dakikada gol iptal! VAR incelemesinde ${p}'in pozisyonu düdüğü bozdu.`,
  ],
  substitution: [
    (outP: string, inP: string, m: number) =>
      `${m}. dakikada değişiklik! ${outP} oyundan çıkıyor, ${inP} sahaya giriyor.`,
  ],
  momentumStart: [
    (m: number) =>
      `${m}. dakikada tempolar yükseldi, atak yoğunluğu artıyor.`,
    (m: number) =>
      `${m}. dakikada oyunun kontrolü bir elden diğerine geçiyor.`,
    (m: number) =>
      `${m}. dakikada baskı artıyor, savunma altında kalan takım zor anlar yaşıyor.`,
  ],
  weatherComment: {
    rain: [
      'Yağmur yağmaya devam ediyor. Zemin kaygan, pas hataları artabilir.',
      'Sağanak yağış altında zorlu bir oyun. Oyuncuların ayakkabı tutuşu azaldı.',
    ],
    snow: [
      'Kar yağışı sahayı kaplamaya başladı. Oyun yavaşladı.',
      'Zemin buz gibi! Oyuncular top kontrolunde zorlanıyor.',
    ],
    windy: [
      'Rüzgar maçın görünmez oyuncusu bugün. Top beklenmeyen yönlerde savruluyor.',
      'Kuvvetli rüzgar topun uçuşunu etkiliyor, uzak şutlar riske giriyor.',
    ],
    sunny: [
      'Güneşli bir gün, harika futbol havası! Oyuncular keyifli oynuyor.',
      'Mükemmel hava koşulları, zemin futbol için ideal.',
    ],
  },
  halftime: [
    'İlk yarı sona erdi. Hakem düdüğü çaldı.',
    'İlk 45 dakika geride kaldı. Takımlar soyunma odasına gidiyor.',
  ],
  fulltime: [
    'Maç sona erdi! Hakem son düdüğü çaldı.',
    '90 dakika tamamlandı! Taraftarlar ellerini alkışla ovuşturuyor.',
  ],
};

function generateGoalCommentary(
  scorer: MutablePlayerState,
  assister: MutablePlayerState | undefined,
  minute: number,
  eventDetail: 'normal' | 'solo' | 'header' | 'longShot' | 'penalty' | 'freeKick' | 'counter' | 'lateGoal'
): string {
  const p = scorer.player.name;
  const a = assister ? assister.player.name : 'takım arkadaşı';

  const detail = minute >= 85 ? 'lateGoal' : eventDetail;

  // Solo / penalty / freeKick / longShot don't need an assister name
  if (!assister || detail === 'solo' || detail === 'penalty' || detail === 'freeKick' || detail === 'longShot') {
    const soloTemplates: Record<string, ((p: string, m: number) => string)[]> = {
      solo: COMMENTARY.goal.solo as unknown as ((p: string, m: number) => string)[],
      penalty: COMMENTARY.goal.penalty as unknown as ((p: string, m: number) => string)[],
      freeKick: COMMENTARY.goal.freeKick as unknown as ((p: string, m: number) => string)[],
      longShot: COMMENTARY.goal.longShot as unknown as ((p: string, m: number) => string)[],
    };
    const tpls = soloTemplates[detail];
    if (tpls) return pick(tpls)(p, minute);
  }

  // All other goal types use (p, a, m) signature
  const duoTemplates: Record<string, ((p: string, a: string, m: number) => string)[]> = {
    normal: COMMENTARY.goal.normal as unknown as ((p: string, a: string, m: number) => string)[],
    header: COMMENTARY.goal.header as unknown as ((p: string, a: string, m: number) => string)[],
    counter: COMMENTARY.goal.counter as unknown as ((p: string, a: string, m: number) => string)[],
    lateGoal: COMMENTARY.goal.lateGoal as unknown as ((p: string, a: string, m: number) => string)[],
  };
  const tpls = duoTemplates[detail] ?? duoTemplates.normal;
  return pick(tpls)(p, a, minute);
}

function generateEventCommentary(
  type: MatchEventType,
  player: MutablePlayerState,
  minute: number,
  secondaryPlayer?: MutablePlayerState
): string {
  const p = player.player.name;
  switch (type) {
    case 'shot_saved':
      return pick(COMMENTARY.shot_saved)(p, secondaryPlayer?.player.name || 'kaleci', minute);
    case 'shot_wide':
      return pick(COMMENTARY.shot_wide)(p, minute);
    case 'shot_post':
      return pick(COMMENTARY.shot_post)(p, minute);
    case 'foul':
      return pick(COMMENTARY.foul)(p, minute);
    case 'yellow_card':
      return pick(COMMENTARY.yellow_card)(p, minute);
    case 'red_card':
      return pick(COMMENTARY.red_card)(p, minute);
    case 'corner':
      return pick(COMMENTARY.corner)(p, minute);
    case 'free_kick':
      return pick(COMMENTARY.free_kick)(p, minute);
    case 'penalty':
      return pick(COMMENTARY.penalty)(p, minute);
    case 'offside':
      return pick(COMMENTARY.offside)(p, minute);
    case 'injury':
      return pick(COMMENTARY.injury)(p, minute);
    case 'save':
      return pick(COMMENTARY.save)(p, minute);
    case 'tackle':
      return pick(COMMENTARY.tackle)(p, minute);
    case 'interception':
      return pick(COMMENTARY.interception)(p, minute);
    case 'chance':
      return pick(COMMENTARY.chance)(p, minute);
    case 'substitution':
      return pick(COMMENTARY.substitution)(p, secondaryPlayer?.player.name || 'yedek oyuncu', minute);
    default:
      return `${minute}. dakikada ${p} bir olaya dahil oldu.`;
  }
}

// =============================================================================
// Pitch Coordinate Generation
// =============================================================================

function getPitchCoords(
  team: 'home' | 'away',
  position: string,
  type: MatchEventType
): { x: number; y: number } {
  // x: 0 = home goal, 100 = away goal; y: 0 = left touchline, 100 = right touchline
  const attacking = team === 'home';

  const baseX = () => {
    switch (type) {
      case 'goal':
      case 'shot_saved':
      case 'shot_wide':
      case 'shot_post':
      case 'chance':
        return attacking ? rand(78, 92) : rand(8, 22);
      case 'save':
        return attacking ? rand(3, 12) : rand(88, 97);
      case 'foul':
      case 'yellow_card':
      case 'red_card':
      case 'free_kick':
        return rand(30, 70);
      case 'corner':
        return attacking ? rand(95, 99) : rand(1, 5);
      case 'tackle':
      case 'interception':
        return attacking ? rand(30, 60) : rand(40, 70);
      default:
        return rand(25, 75);
    }
  };

  const baseY = () => {
    const side = Math.random() > 0.5 ? 1 : 0;
    if (type === 'corner') return side === 0 ? rand(1, 5) : rand(95, 99);
    switch (position) {
      case 'GK':
        return rand(38, 62);
      case 'DEF':
        return side === 0 ? rand(15, 40) : rand(60, 85);
      case 'MID':
        return rand(25, 75);
      case 'FWD':
        return side === 0 ? rand(25, 55) : rand(45, 75);
      default:
        return rand(20, 80);
    }
  };

  return {
    x: clamp(Math.round(baseX()), 0, 100),
    y: clamp(Math.round(baseY()), 0, 100),
  };
}

// =============================================================================
// Weather Effects
// =============================================================================

interface WeatherModifiers {
  passingMod: number;
  speedMod: number;
  shootingMod: number;
  tacklingMod: number;
  description: string;
}

function getWeatherModifiers(weather: Weather): WeatherModifiers {
  switch (weather) {
    case 'rainy':
      return {
        passingMod: 0.95,
        speedMod: 0.97,
        shootingMod: 0.96,
        tacklingMod: 0.98,
        description: pick(COMMENTARY.weatherComment.rain),
      };
    case 'snowy':
      return {
        passingMod: 0.93,
        speedMod: 0.90,
        shootingMod: 0.92,
        tacklingMod: 0.95,
        description: pick(COMMENTARY.weatherComment.snow),
      };
    case 'windy':
      return {
        passingMod: 0.96,
        speedMod: 0.98,
        shootingMod: 0.94,
        tacklingMod: 1.0,
        description: pick(COMMENTARY.weatherComment.windy),
      };
    case 'sunny':
    default:
      return {
        passingMod: 1.0,
        speedMod: 1.0,
        shootingMod: 1.0,
        tacklingMod: 1.0,
        description: pick(COMMENTARY.weatherComment.sunny),
      };
  }
}

// =============================================================================
// Event Probability Engine
// =============================================================================

interface ProbabilityWeights {
  shot: number;
  tackle: number;
  interception: number;
  foul: number;
  chance: number;
  save: number;
}

function getEventProbabilities(
  state: MutablePlayerState,
  teamStrength: number,
  oppositionStrength: number,
  weatherMods: WeatherModifiers,
  minute: number,
  isAttacking: boolean
): ProbabilityWeights {
  const p = state.player;
  const pos = positionGroup(p);

  let shot = 0;
  let tackle = 0;
  let interception = 0;
  let foul = 0;
  let chance = 0;
  let save = 0;

  const fatigueMod = state.currentCond < 50 ? 0.6 : state.currentCond < 70 ? 0.8 : 1.0;
  const moraleMod = 0.7 + (p.morale / 100) * 0.3;

  // Late game fatigue accumulation
  const fatigueMinute = minute > 75 ? 0.85 : minute > 60 ? 0.92 : 1.0;
  const effectiveMod = fatigueMod * moraleMod * fatigueMinute;

  if (isAttacking) {
    if (pos === 'FWD') {
      shot = clamp((getAttr(p, 'finishing') / 100) * 0.18 * effectiveMod, 0.02, 0.25);
      chance = clamp((getAttr(p, 'offTheBall') / 100) * 0.12 * effectiveMod, 0.02, 0.18);
      foul = 0.03;
    } else if (pos === 'MID') {
      shot = clamp((getAttr(p, 'longShots') / 100) * 0.08 * effectiveMod, 0.01, 0.12);
      chance = clamp((getAttr(p, 'vision') / 100) * 0.10 * effectiveMod, 0.01, 0.15);
      interception = clamp((getAttr(p, 'anticipation') / 100) * 0.08 * effectiveMod, 0.01, 0.12);
      foul = 0.04;
    } else if (pos === 'DEF') {
      tackle = clamp((getAttr(p, 'tackling') / 100) * 0.07 * effectiveMod, 0.01, 0.10);
      interception = clamp((getAttr(p, 'anticipation') / 100) * 0.06 * effectiveMod, 0.01, 0.09);
      foul = 0.05;
    } else if (pos === 'GK') {
      save = clamp((getAttr(p, 'goalkeeping') / 100) * 0.04 * effectiveMod, 0.01, 0.06);
    }
  } else {
    // Defending phase
    if (pos === 'DEF') {
      tackle = clamp((getAttr(p, 'tackling') / 100) * 0.12 * effectiveMod, 0.02, 0.18);
      interception = clamp((getAttr(p, 'anticipation') / 100) * 0.09 * effectiveMod, 0.01, 0.14);
      foul = 0.06;
    } else if (pos === 'MID') {
      tackle = clamp((getAttr(p, 'tackling') / 100) * 0.07 * effectiveMod, 0.01, 0.11);
      interception = clamp((getAttr(p, 'anticipation') / 100) * 0.08 * effectiveMod, 0.01, 0.12);
      foul = 0.04;
    } else if (pos === 'GK') {
      save = clamp((getAttr(p, 'goalkeeping') / 100) * 0.10 * effectiveMod, 0.02, 0.15);
    } else if (pos === 'FWD') {
      interception = clamp((getAttr(p, 'aggression') / 100) * 0.04 * effectiveMod, 0.01, 0.06);
      foul = 0.03;
    }
  }

  // Strength ratio modifier
  const strengthRatio = teamStrength / (teamStrength + oppositionStrength);

  if (isAttacking) {
    shot *= strengthRatio * 1.5;
    chance *= strengthRatio * 1.3;
  } else {
    tackle *= (1 - strengthRatio) * 1.3;
    save *= (1 - strengthRatio) * 1.5;
  }

  // Weather modifiers
  shot *= weatherMods.shootingMod;
  tackle *= weatherMods.tacklingMod;

  // Tactic aggression modifier
  foul *= 1.0; // Will be modified by team tactic externally

  return {
    shot: clamp(shot, 0, 0.35),
    tackle: clamp(tackle, 0, 0.25),
    interception: clamp(interception, 0, 0.20),
    foul: clamp(foul, 0, 0.15),
    chance: clamp(chance, 0, 0.25),
    save: clamp(save, 0, 0.20),
  };
}

// =============================================================================
// Main Simulation
// =============================================================================

export function simulateEnhancedMatch(
  homePlayers: Player[],
  awayPlayers: Player[],
  homeTactic: ActiveTactic,
  awayTactic: ActiveTactic,
  options?: SimulationOptions
): EnhancedMatchResult {
  // ── Pre-match Setup ─────────────────────────────────────────────────────
  const weather = options?.weather ?? (pick(['sunny', 'sunny', 'sunny', 'rainy', 'snowy', 'windy']) as Weather);
  const weatherMods = getWeatherModifiers(weather);

  // Initialize mutable player states
  const createMutableState = (players: Player[], team: 'home' | 'away'): MutablePlayerState[] => {
    return players.map(p => ({
      player: p,
      team,
      isSubbedOut: false,
      isSubbedIn: false,
      isInjured: false,
      currentCond: p.cond,
      events: [],
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnTarget: 0,
      tackles: 0,
      interceptions: 0,
      passes: 0,
      keyPasses: 0,
      saves: 0,
      fouls: 0,
      yellowCards: 0,
      redCards: 0,
      ratingDelta: 0,
      minuteEntered: 0,
      minuteLeft: 90,
    }));
  };

  const homeMutablePlayers = createMutableState(homePlayers, 'home');
  const awayMutablePlayers = createMutableState(awayPlayers, 'away');

  // Initialize substitutes
  const homeSubstitutes = createMutableState(options?.substitutes?.home || [], 'home');
  const awaySubstitutes = createMutableState(options?.substitutes?.away || [], 'away');

  // Initialize referee match context (uses referee.ts system)
  const defaultReferee = {
    id: 'ref-default',
    name: options?.refereeName ?? 'Varsayılan Hakem',
    personality: (options?.refereePersonality ?? 'dengeci') as RefereePersonality,
    experience: 5,
    league_id: 'default',
    strictness: options?.refereeStrictness ?? 50,
    totalMatches: 0,
    totalYellows: 0,
    totalReds: 0,
    totalPenalties: 0,
  };
  const refCtx: RefereeMatchContext = createRefereeMatchContext(defaultReferee);

  // Calculate strengths
  const homeStrength = calculateTeamStrength(homePlayers, homeTactic);
  const awayStrength = calculateTeamStrength(awayPlayers, awayTactic);

  // Home advantage: +10% base
  homeStrength.overall *= 1.10;
  homeStrength.attack *= 1.10;
  homeStrength.midfield *= 1.08;
  homeStrength.defense *= 1.05;

  const homeTeam: TeamState = {
    players: homeMutablePlayers,
    tactic: homeTactic,
    overallStrength: homeStrength.overall,
    attackStrength: homeStrength.attack,
    midfieldStrength: homeStrength.midfield,
    defenseStrength: homeStrength.defense,
    gkStrength: homeStrength.gk,
    substitutionSlots: 3,
    usedSubs: 0,
    substitutes: homeSubstitutes,
  };

  const awayTeam: TeamState = {
    players: awayMutablePlayers,
    tactic: awayTactic,
    overallStrength: awayStrength.overall,
    attackStrength: awayStrength.attack,
    midfieldStrength: awayStrength.midfield,
    defenseStrength: awayStrength.defense,
    gkStrength: awayStrength.gk,
    substitutionSlots: 3,
    usedSubs: 0,
    substitutes: awaySubstitutes,
  };

  // Score
  let homeScore = 0;
  let awayScore = 0;

  // All events
  const allEvents: MatchEvent[] = [];

  // Live statistics
  const homeLiveStats: LiveStats = {
    possessionTicks: 0,
    shots: 0,
    shotsOnTarget: 0,
    passes: 0,
    passSuccesses: 0,
    tackles: 0,
    interceptions: 0,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    corners: 0,
    freeKicks: 0,
    offsides: 0,
    injuries: 0,
    saves: 0,
  };
  const awayLiveStats: LiveStats = {
    possessionTicks: 0,
    shots: 0,
    shotsOnTarget: 0,
    passes: 0,
    passSuccesses: 0,
    tackles: 0,
    interceptions: 0,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    corners: 0,
    freeKicks: 0,
    offsides: 0,
    injuries: 0,
    saves: 0,
  };

  // ── Helper: Get active (on-pitch) players ──────────────────────────────
  const getActivePlayers = (team: TeamState): MutablePlayerState[] =>
    team.players.filter(p => !p.isSubbedOut && !p.isInjured);

  // ── Helper: Get players by position ─────────────────────────────────────
  const getByPosition = (team: TeamState, pos: string): MutablePlayerState[] =>
    getActivePlayers(team).filter(p => positionGroup(p.player) === pos);

  // ── Helper: Create an event ─────────────────────────────────────────────
  const createEvent = (
    minute: number,
    type: MatchEventType,
    team: TeamState,
    player: MutablePlayerState,
    secondary?: MutablePlayerState,
    ratingImpact = 0
  ): MatchEvent => {
    const coords = getPitchCoords(player.team, positionGroup(player.player), type);
    const event: MatchEvent = {
      minute,
      type,
      team: player.team,
      playerName: player.player.name,
      playerId: player.player.id,
      assistPlayerId: secondary?.player.id,
      assistPlayerName: secondary?.player.name,
      description: '',
      x: coords.x,
      y: coords.y,
      ratingImpact,
    };

    // Generate commentary
    if (type === 'goal') {
      event.description = generateGoalCommentary(
        player,
        secondary,
        minute,
        secondary ? 'normal' : 'solo'
      );
    } else {
      event.description = generateEventCommentary(type, player, minute, secondary);
    }

    return event;
  };

  // ── Helper: Determine momentum (which team has the ball) ────────────────
  const determineMomentum = (minute: number): 'home' | 'away' => {
    const homeWeight = homeTeam.overallStrength;
    const awayWeight = awayTeam.overallStrength;

    // Period-based adjustments
    let homeBias = 1.0;
    let awayBias = 1.0;

    // Home team tends to start stronger
    if (minute <= 15) homeBias = 1.15;
    // Second half away team sometimes rallies
    if (minute > 45 && minute <= 60) awayBias = 1.08;
    // Late game: leading team may sit back
    if (minute > 75) {
      if (homeScore > awayScore) homeBias = 0.85;
      if (awayScore > homeScore) awayBias = 0.85;
    }

    // If a team is down, they push forward
    if (homeScore < awayScore && minute > 60) homeBias = 1.2;
    if (awayScore < homeScore && minute > 60) awayBias = 1.2;

    // Red card penalty
    const homeReds = homeLiveStats.redCards;
    const awayReds = awayLiveStats.redCards;
    if (homeReds > 0) homeBias *= 0.75;
    if (awayReds > 0) awayBias *= 0.75;

    const totalWeight = homeWeight * homeBias + awayWeight * awayBias;
    return Math.random() * totalWeight < homeWeight * homeBias ? 'home' : 'away';
  };

  // ── Substitution logic ──────────────────────────────────────────────────
  const performSubstitution = (team: TeamState, minute: number, events: MatchEvent[], liveStats: LiveStats) => {
    if (team.usedSubs >= team.substitutionSlots) return;
    if (team.substitutes.length === 0) return;

    const active = getActivePlayers(team);
    const tiredPlayers = active
      .filter(p => p.currentCond < 50 && !p.isSubbedOut && p.minuteEntered < minute)
      .sort((a, b) => a.currentCond - b.currentCond);

    if (tiredPlayers.length === 0) return;

    // Find appropriate substitute by position
    const outPlayer = tiredPlayers[0];
    const outPos = positionGroup(outPlayer.player);

    const sub = team.substitutes.find(
      s => !s.isSubbedIn && positionGroup(s.player) === outPos
    ) ?? team.substitutes.find(s => !s.isSubbedIn);

    if (!sub) return;

    // Execute substitution
    outPlayer.isSubbedOut = true;
    outPlayer.minuteLeft = minute;
    sub.isSubbedIn = true;
    sub.minuteEntered = minute;
    sub.currentCond = sub.player.cond;

    // Move substitute into active roster
    team.players.push(sub);
    team.usedSubs++;

    const event = createEvent(minute, 'substitution', team, outPlayer, sub, 0);
    // Fix: for substitution, playerName should be the player coming in
    event.description = generateEventCommentary('substitution', outPlayer, minute, sub);
    events.push(event);
  };

  // ── Main match loop ─────────────────────────────────────────────────────
  let currentMinute = 1;
  let momentumShiftCounter = 0;

  while (currentMinute <= 90) {
    const minute = currentMinute;

    // Weather & referee commentary at start
    if (minute === 1) {
      const refConfig = refCtx.personalityConfig;
      const refInfo = refCtx.referee.name ? ` Hakem: ${refCtx.referee.name} (${refConfig.emoji} ${refConfig.label_tr}, Sertlik: ${refCtx.referee.strictness}).` : '';
      allEvents.push({
        minute: 0,
        type: 'chance',
        team: 'home',
        playerName: '',
        playerId: '',
        description: `Maç başlıyor! Hava durumu: ${weather === 'sunny' ? 'Güneşli' : weather === 'rainy' ? 'Yağmurlu' : weather === 'snowy' ? 'Karlı' : 'Rüzgarlı'}. ${weatherMods.description}${refInfo}`,
        x: 50,
        y: 50,
        ratingImpact: 0,
      });
    }

    // Determine momentum
    const hasMomentum = determineMomentum(minute);
    const attackingTeam = hasMomentum === 'home' ? homeTeam : awayTeam;
    const defendingTeam = hasMomentum === 'home' ? awayTeam : homeTeam;

    // Possession tracking
    if (hasMomentum === 'home') homeLiveStats.possessionTicks++;
    else awayLiveStats.possessionTicks++;

    // Pass simulation (background activity)
    const activeAttackers = getActivePlayers(attackingTeam);
    const passCount = randInt(1, 4);
    for (let i = 0; i < passCount; i++) {
      const passer = pick(activeAttackers);
      const passSkill = getAttr(passer.player, 'passing', 50) * weatherMods.passingMod / 100;
      passer.passes++;
      if (hasMomentum === 'home') homeLiveStats.passes++;
      else awayLiveStats.passes++;

      if (Math.random() < passSkill) {
        if (hasMomentum === 'home') homeLiveStats.passSuccesses++;
        else awayLiveStats.passSuccesses++;

        // Chance for key pass
        if (Math.random() < passSkill * 0.12) {
          passer.keyPasses++;
        }
      }
    }

    // Determine if an event happens this minute
    // Events every 1-3 minutes
    momentumShiftCounter++;
    if (momentumShiftCounter >= randInt(1, 3)) {
      momentumShiftCounter = 0;

      // Select a random player from the attacking team to generate an event for
      const posWeights = [
        { pos: 'FWD', weight: attackingTeam.attackStrength },
        { pos: 'MID', weight: attackingTeam.midfieldStrength },
        { pos: 'DEF', weight: attackingTeam.defenseStrength * 0.3 },
      ];

      const selectedPos = weightedPick(posWeights).pos;
      const candidates = getByPosition(attackingTeam, selectedPos);
      if (candidates.length === 0) {
        // Fallback: pick any active player
        const allActive = getActivePlayers(attackingTeam);
        if (allActive.length === 0) { currentMinute++; continue; }
      }

      const pool = candidates.length > 0 ? candidates : getActivePlayers(attackingTeam);
      const selectedPlayer = pick(pool);
      const opponentGKs = getByPosition(defendingTeam, 'GK');
      const opponentGK = opponentGKs.length > 0 ? opponentGKs[0] : undefined;
      const opponentDefenders = getByPosition(defendingTeam, 'DEF');
      const opponentDefender = opponentDefenders.length > 0 ? pick(opponentDefenders) : undefined;

      const probs = getEventProbabilities(
        selectedPlayer,
        attackingTeam.overallStrength,
        defendingTeam.overallStrength,
        weatherMods,
        minute,
        true
      );

      // ── Attempt a shot / chance ──────────────────────────────────────
      const shotRoll = Math.random();
      const baseGoalChance = 0.03; // 3% base goal per attacking minute
      const strengthRatio = attackingTeam.attackStrength / (attackingTeam.attackStrength + defendingTeam.defenseStrength);

      // Modified goal probability
      const finishing = getAttr(selectedPlayer.player, 'finishing', 50) / 100;
      const gkRating = opponentGK ? getAttr(opponentGK.player, 'goalkeeping', 50) / 100 : 0.5;

      let goalChance = baseGoalChance * strengthRatio * (finishing / (finishing + gkRating * 0.5));

      // Quality gap modifier — much stronger team creates more
      const qualityGap = Math.abs(attackingTeam.overallStrength - defendingTeam.overallStrength) / 100;
      if (attackingTeam.overallStrength > defendingTeam.overallStrength) {
        goalChance *= (1 + qualityGap * 0.3);
      } else {
        goalChance *= (1 - qualityGap * 0.2);
      }

      // Tactic mentality modifier
      const tacticMentalityMod = attackingTeam.tactic.mentality >= 4
        ? 1 + (attackingTeam.tactic.mentality - 3) * 0.12
        : attackingTeam.tactic.mentality <= 2
          ? 1 - (3 - attackingTeam.tactic.mentality) * 0.08
          : 1.0;
      goalChance *= tacticMentalityMod;

      // Late game desperation
      if (minute > 80) {
        if (hasMomentum === 'home' && homeScore < awayScore) goalChance *= 1.25;
        if (hasMomentum === 'away' && awayScore < homeScore) goalChance *= 1.25;
      }

      goalChance = clamp(goalChance, 0.005, 0.12);

      // Find potential assister (midfielder or other forward)
      const midfielders = getByPosition(attackingTeam, 'MID');
      const otherForwards = getByPosition(attackingTeam, 'FWD').filter(p => p.player.id !== selectedPlayer.player.id);
      const assistCandidates = [...midfielders, ...otherForwards].filter(p => p.player.id !== selectedPlayer.player.id);
      const assister = assistCandidates.length > 0 && Math.random() < 0.65
        ? pick(assistCandidates)
        : undefined;

      if (shotRoll < goalChance) {
        // ── GOAL ──────────────────────────────────────────────────────
        selectedPlayer.goals++;
        selectedPlayer.shots++;
        selectedPlayer.shotsOnTarget++;
        selectedPlayer.ratingDelta += 1.2;

        if (hasMomentum === 'home') {
          homeScore++;
          homeLiveStats.shots++;
          homeLiveStats.shotsOnTarget++;
        } else {
          awayScore++;
          awayLiveStats.shots++;
          awayLiveStats.shotsOnTarget++;
        }

        if (assister) {
          assister.assists++;
          assister.ratingDelta += 0.7;
          assister.keyPasses++;
        }

        // Determine goal type
        let goalDetail: 'normal' | 'solo' | 'header' | 'longShot' | 'penalty' | 'freeKick' | 'counter' | 'lateGoal' = 'normal';
        if (!assister) goalDetail = 'solo';
        if (Math.random() < 0.15 && selectedPlayer.player.specificPosition === 'ST') goalDetail = 'header';
        if (Math.random() < 0.10 && getAttr(selectedPlayer.player, 'longShots', 50) > 70) goalDetail = 'longShot';
        if (minute >= 85) goalDetail = 'lateGoal';

        const goalEvent = createEvent(
          minute,
          'goal',
          attackingTeam,
          selectedPlayer,
          assister,
          1.2
        );
        goalEvent.description = generateGoalCommentary(
          selectedPlayer,
          assister,
          minute,
          goalDetail
        );

        // VAR check for goal — referee.ts checkVARForGoal
        const isScorerHome = selectedPlayer.team === 'home';
        const varResult = checkVARForGoal(refCtx, isScorerHome);

        if (varResult.varReview && varResult.overturned) {
          // Goal overturned by VAR!
          selectedPlayer.goals--;
          selectedPlayer.ratingDelta -= 1.2;
          if (assister) {
            assister.assists--;
            assister.ratingDelta -= 0.7;
          }
          if (hasMomentum === 'home') {
            homeScore--;
            homeLiveStats.shotsOnTarget--;
          } else {
            awayScore--;
            awayLiveStats.shotsOnTarget--;
          }

          // Add VAR review event then overturned event
          const varEvent: MatchEvent = {
            minute,
            type: 'var_review',
            team: selectedPlayer.team,
            playerName: selectedPlayer.player.name,
            playerId: selectedPlayer.player.id,
            assistPlayerId: assister?.player.id,
            assistPlayerName: assister?.player.name,
            description: `${minute}. dakikada VAR incelemesi! ${selectedPlayer.player.name}'in golü inceleniyor...`,
            x: 50,
            y: 50,
            ratingImpact: 0,
          };
          allEvents.push(varEvent);

          const overturnedEvent: MatchEvent = {
            minute,
            type: 'goal_overturned',
            team: selectedPlayer.team,
            playerName: selectedPlayer.player.name,
            playerId: selectedPlayer.player.id,
            description: pick(COMMENTARY.goal_overturned)(selectedPlayer.player.name, minute),
            x: 50,
            y: 50,
            ratingImpact: -1.2,
          };
          allEvents.push(overturnedEvent);
          selectedPlayer.events.push(overturnedEvent);
        } else {
          // Goal confirmed (or no VAR review)
          allEvents.push(goalEvent);
          selectedPlayer.events.push(goalEvent);

          if (varResult.varReview) {
            // VAR reviewed but goal stands
            const varEvent: MatchEvent = {
              minute,
              type: 'var_review',
              team: selectedPlayer.team,
              playerName: selectedPlayer.player.name,
              playerId: selectedPlayer.player.id,
              description: `${minute}. dakikada VAR incelemesi — gol geçerli!`,
              x: 50,
              y: 50,
              ratingImpact: 0,
            };
            allEvents.push(varEvent);
          }
        }
        if (assister) assister.events.push(goalEvent);

      } else if (shotRoll < goalChance + probs.shot) {
        // ── Shot on target but saved ──────────────────────────────────
        selectedPlayer.shots++;
        selectedPlayer.shotsOnTarget++;
        selectedPlayer.ratingDelta += 0.15;
        if (hasMomentum === 'home') {
          homeLiveStats.shots++;
          homeLiveStats.shotsOnTarget++;
        } else {
          awayLiveStats.shots++;
          awayLiveStats.shotsOnTarget++;
        }

        if (opponentGK) {
          opponentGK.saves++;
          opponentGK.ratingDelta += 0.4;
          if (hasMomentum === 'home') awayLiveStats.saves++;
          else homeLiveStats.saves++;

          const saveEvent = createEvent(minute, 'shot_saved', attackingTeam, selectedPlayer, opponentGK, 0.15);
          allEvents.push(saveEvent);
          selectedPlayer.events.push(saveEvent);
          opponentGK.events.push(saveEvent);
        }

      } else if (shotRoll < goalChance + probs.shot * 2.5) {
        // ── Shot wide ────────────────────────────────────────────────
        selectedPlayer.shots++;
        selectedPlayer.ratingDelta -= 0.1;
        if (hasMomentum === 'home') homeLiveStats.shots++;
        else awayLiveStats.shots++;

        const wideEvent = createEvent(minute, 'shot_wide', attackingTeam, selectedPlayer, undefined, -0.1);
        allEvents.push(wideEvent);
        selectedPlayer.events.push(wideEvent);

      } else if (shotRoll < goalChance + probs.shot * 3.5) {
        // ── Shot hits post ───────────────────────────────────────────
        selectedPlayer.shots++;
        selectedPlayer.shotsOnTarget++;
        selectedPlayer.ratingDelta += 0.05;
        if (hasMomentum === 'home') {
          homeLiveStats.shots++;
          homeLiveStats.shotsOnTarget++;
        } else {
          awayLiveStats.shots++;
          awayLiveStats.shotsOnTarget++;
        }

        const postEvent = createEvent(minute, 'shot_post', attackingTeam, selectedPlayer, undefined, 0.05);
        allEvents.push(postEvent);
        selectedPlayer.events.push(postEvent);

      } else if (shotRoll < goalChance + probs.shot * 3.5 + probs.chance) {
        // ── Chance created ───────────────────────────────────────────
        selectedPlayer.ratingDelta += 0.05;
        if (assister) {
          assister.keyPasses++;
          assister.ratingDelta += 0.1;
        }

        const chanceEvent = createEvent(minute, 'chance', attackingTeam, selectedPlayer, assister, 0.05);
        allEvents.push(chanceEvent);
        selectedPlayer.events.push(chanceEvent);

      } else {
        // ── Defensive / general events ───────────────────────────────
        const activeDefenders = getActivePlayers(defendingTeam);
        if (activeDefenders.length > 0) {
          const defender = pick(activeDefenders);

          // Tackle
          if (Math.random() < probs.tackle) {
            defender.tackles++;
            defender.ratingDelta += 0.15;
            if (hasMomentum === 'home') awayLiveStats.tackles++;
            else homeLiveStats.tackles++;

            // Occasionally generate a notable tackle event
            if (Math.random() < 0.3) {
              const tackleEvent = createEvent(minute, 'tackle', defendingTeam, defender, undefined, 0.15);
              allEvents.push(tackleEvent);
              defender.events.push(tackleEvent);
            }
          }

          // Interception
          if (Math.random() < probs.interception) {
            defender.interceptions++;
            defender.ratingDelta += 0.12;
            if (hasMomentum === 'home') awayLiveStats.interceptions++;
            else homeLiveStats.interceptions++;

            if (Math.random() < 0.25) {
              const intEvent = createEvent(minute, 'interception', defendingTeam, defender, undefined, 0.12);
              allEvents.push(intEvent);
              defender.events.push(intEvent);
            }
          }

          // Fouls — Referee-modified system (uses referee.ts decision functions)
          const isDefenderHome = defender.team === 'home';
          const baseFoulProb = probs.foul * (attackingTeam.tactic.aggression / 50);

          if (shouldCallFoul(refCtx, baseFoulProb, isDefenderHome)) {
            defender.fouls++;
            defender.ratingDelta -= 0.15;
            if (hasMomentum === 'home') awayLiveStats.fouls++;
            else homeLiveStats.fouls++;

            // Yellow card — referee decision function
            const baseYellowProb = 0.15;
            if (shouldGiveYellowCard(refCtx, baseYellowProb, isDefenderHome, minute)) {
              defender.yellowCards++;
              refCtx.yellowsGiven++;
              defender.ratingDelta -= 0.35;
              if (hasMomentum === 'home') awayLiveStats.yellowCards++;
              else homeLiveStats.yellowCards++;

              const yellowEvent = createEvent(minute, 'yellow_card', defendingTeam, defender, undefined, -0.35);
              allEvents.push(yellowEvent);
              defender.events.push(yellowEvent);
            } else if (shouldGiveRedCard(refCtx, 0.03, isDefenderHome)) {
              // Red card — referee decision function
              defender.redCards++;
              refCtx.redsGiven++;
              defender.ratingDelta -= 2.0;
              defender.isSubbedOut = true;
              defender.minuteLeft = minute;
              if (hasMomentum === 'home') awayLiveStats.redCards++;
              else homeLiveStats.redCards++;

              const redEvent = createEvent(minute, 'red_card', defendingTeam, defender, undefined, -2.0);
              allEvents.push(redEvent);
              defender.events.push(redEvent);
            } else {
              // Regular foul event (sometimes visible)
              if (Math.random() < 0.4 * refCtx.personalityConfig.foulMultiplier * refCtx.runtimeFoulMod) {
                const foulEvent = createEvent(minute, 'foul', defendingTeam, defender, undefined, -0.15);
                allEvents.push(foulEvent);
                defender.events.push(foulEvent);

                // Award free kick or penalty — referee decision function with VAR
                const isAttackerHome = selectedPlayer.team === 'home';
                const penaltyResult = shouldGivePenalty(refCtx, 0.1, isAttackerHome, minute);

                if (penaltyResult.penalty && !penaltyResult.overturned) {
                  const penaltyEvent = createEvent(minute, 'penalty', attackingTeam, selectedPlayer, undefined, 0.3);
                  allEvents.push(penaltyEvent);
                  selectedPlayer.events.push(penaltyEvent);
                  if (hasMomentum === 'home') homeLiveStats.freeKicks++;
                  else awayLiveStats.freeKicks++;
                } else if (penaltyResult.varReview) {
                  // VAR review event (penalty overturned or confirmed)
                  const varEvent = createEvent(minute, 'var_review', attackingTeam, selectedPlayer, undefined, 0);
                  varEvent.description = pick(COMMENTARY.var_review)(selectedPlayer.player.name, minute);
                  if (penaltyResult.overturned) {
                    varEvent.description += ' Penaltı iptal edildi!';
                  }
                  allEvents.push(varEvent);
                } else {
                  const fkEvent = createEvent(minute, 'free_kick', attackingTeam, selectedPlayer, defender, 0.1);
                  allEvents.push(fkEvent);
                  selectedPlayer.events.push(fkEvent);
                  if (hasMomentum === 'home') homeLiveStats.freeKicks++;
                  else awayLiveStats.freeKicks++;
                }
              }
            }
          }
        }

        // Offside — referee-modified (uses referee.ts getOffsideMultiplier)
        const isAttHome = hasMomentum === 'home';
        const offsideMod = getOffsideMultiplier(refCtx, isAttHome);
        if (Math.random() < 0.02 * offsideMod) {
          const forwards = getByPosition(attackingTeam, 'FWD');
          if (forwards.length > 0) {
            const offsidePlayer = pick(forwards);
            const offsideEvent = createEvent(minute, 'offside', attackingTeam, offsidePlayer, undefined, -0.05);
            allEvents.push(offsideEvent);
            offsidePlayer.events.push(offsideEvent);
            if (hasMomentum === 'home') homeLiveStats.offsides++;
            else awayLiveStats.offsides++;
          }
        }

        // Corner
        if (Math.random() < 0.015) {
          const cornerPlayer = pick(getActivePlayers(attackingTeam));
          const cornerEvent = createEvent(minute, 'corner', attackingTeam, cornerPlayer, undefined, 0.02);
          allEvents.push(cornerEvent);
          cornerPlayer.events.push(cornerEvent);
          if (hasMomentum === 'home') homeLiveStats.corners++;
          else awayLiveStats.corners++;
        }

        // GK save (reactionary)
        if (opponentGK && Math.random() < probs.save * 0.5) {
          opponentGK.saves++;
          opponentGK.ratingDelta += 0.3;
          if (hasMomentum === 'home') awayLiveStats.saves++;
          else homeLiveStats.saves++;

          if (Math.random() < 0.35) {
            const saveEvent = createEvent(minute, 'save', defendingTeam, opponentGK, undefined, 0.3);
            allEvents.push(saveEvent);
            opponentGK.events.push(saveEvent);
          }
        }
      }

      // ── Injury check ────────────────────────────────────────────────
      const activeForInjury = getActivePlayers(attackingTeam).concat(getActivePlayers(defendingTeam));
      for (const p of activeForInjury) {
        if (p.currentCond < 40 && Math.random() < 0.01) {
          p.isInjured = true;
          p.minuteLeft = minute;
          p.ratingDelta -= 1.0;
          if (hasMomentum === 'home') homeLiveStats.injuries++;
          else awayLiveStats.injuries++;

          const injuryEvent = createEvent(minute, 'injury', p.team === 'home' ? homeTeam : awayTeam, p, undefined, -1.0);
          allEvents.push(injuryEvent);
          p.events.push(injuryEvent);
        }
      }
    }

    // ── Condition drain per minute ───────────────────────────────────────
    for (const p of getActivePlayers(homeTeam)) {
      const drain = 0.15 + (p.player.stamina ? (100 - getAttr(p.player, 'stamina', 50)) / 1000 : 0.2);
      p.currentCond = clamp(p.currentCond - drain, 0, 100);
    }
    for (const p of getActivePlayers(awayTeam)) {
      const drain = 0.15 + (p.player.stamina ? (100 - getAttr(p.player, 'stamina', 50)) / 1000 : 0.2);
      p.currentCond = clamp(p.currentCond - drain, 0, 100);
    }

    // ── Auto substitution at 60' and 75' ────────────────────────────────
    if (minute === 60 || minute === 75) {
      performSubstitution(homeTeam, minute, allEvents, homeLiveStats);
      performSubstitution(awayTeam, minute, allEvents, awayLiveStats);
    }

    // ── Halftime ────────────────────────────────────────────────────────
    if (minute === 45) {
      allEvents.push({
        minute: 45,
        type: 'chance',
        team: 'home',
        playerName: '',
        playerId: '',
        description: pick(COMMENTARY.halftime),
        x: 50,
        y: 50,
        ratingImpact: 0,
      });
    }

    currentMinute++;
  }

  // ── Fulltime ────────────────────────────────────────────────────────────
  allEvents.push({
    minute: 90,
    type: 'chance',
    team: 'home',
    playerName: '',
    playerId: '',
    description: pick(COMMENTARY.fulltime),
    x: 50,
    y: 50,
    ratingImpact: 0,
  });

  // Sort events by minute
  allEvents.sort((a, b) => a.minute - b.minute);

  // ── Calculate final statistics ──────────────────────────────────────────
  const totalPossessionTicks = homeLiveStats.possessionTicks + awayLiveStats.possessionTicks;
  const homePossession = totalPossessionTicks > 0
    ? Math.round((homeLiveStats.possessionTicks / totalPossessionTicks) * 100)
    : 50;
  const awayPossession = 100 - homePossession;

  const buildStats = (s: LiveStats): MatchStats => ({
    possession: homePossession,
    shots: s.shots,
    shotsOnTarget: s.shotsOnTarget,
    passes: s.passes,
    passAccuracy: s.passes > 0 ? Math.round((s.passSuccesses / s.passes) * 100) : 0,
    tackles: s.tackles,
    interceptions: s.interceptions,
    fouls: s.fouls,
    yellowCards: s.yellowCards,
    redCards: s.redCards,
    corners: s.corners,
    freeKicks: s.freeKicks,
    offsides: s.offsides,
    injuries: s.injuries,
    saves: s.saves,
  });

  const homeStats: MatchStats = { ...buildStats(homeLiveStats), possession: homePossession };
  const awayStats: MatchStats = { ...buildStats(awayLiveStats), possession: awayPossession };

  // ── Calculate player ratings ───────────────────────────────────────────
  const calculatePlayerRating = (state: MutablePlayerState): PlayerMatchRating => {
    // Base rating: 6.0
    let rating = 6.0;

    // Position-adjusted base
    const pos = positionGroup(state.player);
    switch (pos) {
      case 'GK':
        rating = 6.0;
        rating += state.saves * 0.15;
        rating -= (state.goals > 0 ? state.goals * 0.3 : 0);
        break;
      case 'DEF':
        rating = 6.0;
        rating += state.tackles * 0.08;
        rating += state.interceptions * 0.06;
        rating += state.assists * 0.25;
        rating += state.goals * 0.5;
        break;
      case 'MID':
        rating = 6.0;
        rating += state.keyPasses * 0.12;
        rating += state.passes * 0.003;
        rating += state.tackles * 0.04;
        rating += state.goals * 0.4;
        rating += state.assists * 0.3;
        break;
      case 'FWD':
        rating = 6.0;
        rating += state.goals * 0.5;
        rating += state.assists * 0.3;
        rating += state.shotsOnTarget * 0.05;
        rating -= (state.shots - state.shotsOnTarget) * 0.02;
        break;
    }

    // Card penalties
    rating -= state.yellowCards * 0.2;
    rating -= state.redCards * 1.0;

    // Fouls penalty
    rating -= state.fouls * 0.03;

    // Apply accumulated ratingDelta
    rating += state.ratingDelta;

    // Minutes played factor (less time = less impact on rating)
    const minutesPlayed = state.minuteLeft - state.minuteEntered;
    const playingTimeFactor = minutesPlayed >= 85 ? 1.0 : minutesPlayed >= 60 ? 0.9 : minutesPlayed >= 30 ? 0.8 : 0.7;
    rating = 5.0 + (rating - 5.0) * playingTimeFactor;

    // Morale, form, condition modifiers (subtle)
    const avgMental = (state.player.morale + state.player.form + state.player.confidence) / 300;
    rating += (avgMental - 0.5) * 0.5;

    rating = clamp(Math.round(rating * 10) / 10, 3.0, 10.0);

    return {
      playerId: state.player.id,
      playerName: state.player.name,
      position: state.player.specificPosition || pos,
      rating,
      goals: state.goals,
      assists: state.assists,
      shots: state.shots,
      tackles: state.tackles,
      passes: state.passes,
      keyPasses: state.keyPasses,
      saves: state.saves,
    };
  };

  const homePlayerRatings = homeTeam.players.map(calculatePlayerRating);
  const awayPlayerRatings = awayTeam.players.map(calculatePlayerRating);

  // ── Man of the Match ───────────────────────────────────────────────────
  const allRatings = [...homePlayerRatings, ...awayPlayerRatings];
  const motm = allRatings.reduce((best, r) => r.rating > best.rating ? r : best, allRatings[0]);

  return {
    homeScore,
    awayScore,
    events: allEvents,
    homeStats,
    awayStats,
    homePlayerRatings,
    awayPlayerRatings,
    manOfTheMatch: motm?.playerId || '',
    homePossession,
    awayPossession,
    weather,
    refereeName: refCtx.referee.name,
    refereePersonality: refCtx.referee.personality,
    refereeStrictness: refCtx.referee.strictness,
    varReviews: refCtx.varReviews,
    goalsOverturned: refCtx.goalsOverturned,
  };
}

// =============================================================================
// Match Report Generation (Turkish)
// =============================================================================

export function generateMatchReport(result: EnhancedMatchResult): string {
  const lines: string[] = [];

  const homeGoals = result.events.filter(e => e.type === 'goal' && e.team === 'home');
  const awayGoals = result.events.filter(e => e.type === 'goal' && e.team === 'away');
  const yellows = result.events.filter(e => e.type === 'yellow_card');
  const reds = result.events.filter(e => e.type === 'red_card');
  const injuries = result.events.filter(e => e.type === 'injury');
  const subs = result.events.filter(e => e.type === 'substitution');

  // Find MOTM details
  const allRatings = [...result.homePlayerRatings, ...result.awayPlayerRatings];
  const motm = allRatings.find(r => r.playerId === result.manOfTheMatch);

  // ── ÖZET ───────────────────────────────────────────────────────────────
  lines.push('═'.repeat(60));
  lines.push('                    MAÇ RAPORU');
  lines.push('═'.repeat(60));
  lines.push('');
  lines.push(`                    EV SAHİBİ ${result.homeScore} - ${result.awayScore} DEPLASMAN`);
  lines.push('');
  lines.push(`  Hava: ${result.weather === 'sunny' ? 'Güneşli ☀️' : result.weather === 'rainy' ? 'Yağmurlu 🌧️' : result.weather === 'snowy' ? 'Karlı ❄️' : 'Rüzgarlı 💨'}`);
  lines.push('');
  lines.push('─'.repeat(60));
  lines.push('  📋 ÖZET');
  lines.push('─'.repeat(60));
  lines.push('');

  // Goal descriptions
  if (homeGoals.length > 0 || awayGoals.length > 0) {
    lines.push('  ⚽ Goller:');
    for (const g of [...homeGoals, ...awayGoals]) {
      const teamLabel = g.team === 'home' ? '[EV]' : '[DP]';
      lines.push(`     ${teamLabel} ${g.minute}. dk — ${g.description}`);
    }
    lines.push('');
  }

  // Key events
  const keyEvents = [...yellows, ...reds, ...injuries, ...subs];
  if (keyEvents.length > 0) {
    lines.push('  📌 Önemli Olaylar:');
    for (const e of keyEvents) {
      lines.push(`     ${e.minute}. dk — ${e.description}`);
    }
    lines.push('');
  }

  // Match narrative
  lines.push('  📖 Maçın Hikayesi:');
  if (result.homeScore === 0 && result.awayScore === 0) {
    lines.push('     Her iki takım da net pozisyon bulmakta zorlandı.');
    lines.push('     Savunma ağırlıklı bir oyun izledik. Kaleciler az iş yaptı.');
  } else if (result.homeScore > result.awayScore) {
    const diff = result.homeScore - result.awayScore;
    if (diff >= 3) {
      lines.push('     Ev sahibi takım sahadan ezici bir galibiyetle ayrıldı.');
    } else if (diff === 1) {
      lines.push('     Çekişmeli bir maçtı. Ev sahibi, skoru lehine çevirmeyi başardı.');
    } else {
      lines.push('     Ev sahibi, deplasman ekibine üstünlük kurarak fark yaratmayı bildi.');
    }
  } else if (result.awayScore > result.homeScore) {
    const diff = result.awayScore - result.homeScore;
    if (diff >= 3) {
      lines.push('     Deplasman takımı adeta sahaya hükmetti! Net bir galibiyet.');
    } else if (diff === 1) {
      lines.push('     Deplasman takımı zorlu deplasmanda 3 puanı kaptı.');
    } else {
      lines.push('     Deplasman ekibi, ev sahibine karşın rahat bir galibiyet aldı.');
    }
  } else {
    lines.push('     Karşılıklı gollerle sonuçlanan dengeli bir mücadele oldu.');
    lines.push('     İki takım da puandan memnun görünüyor.');
  }
  lines.push('');

  // ── İSTATİSTİKLER ──────────────────────────────────────────────────────
  lines.push('─'.repeat(60));
  lines.push('  📊 İSTATİSTİKLER');
  lines.push('─'.repeat(60));
  lines.push('');

  const padStat = (home: string, label: string, away: string) => {
    return `  ${home.padStart(6)}  │  ${label.padEnd(20)}  │  ${away.padEnd(6)}`;
  };

  lines.push(padStat(
    String(result.homeStats.possession) + '%',
    'Topla Oynama',
    String(result.awayStats.possession) + '%'
  ));
  lines.push(padStat(
    String(result.homeStats.shots),
    'Toplam Şut',
    String(result.awayStats.shots)
  ));
  lines.push(padStat(
    String(result.homeStats.shotsOnTarget),
    'İsabetli Şut',
    String(result.awayStats.shotsOnTarget)
  ));
  lines.push(padStat(
    String(result.homeStats.passes),
    'Pas',
    String(result.awayStats.passes)
  ));
  lines.push(padStat(
    String(result.homeStats.passAccuracy) + '%',
    'Pas Başarısı',
    String(result.awayStats.passAccuracy) + '%'
  ));
  lines.push(padStat(
    String(result.homeStats.tackles),
    'Top Kapma',
    String(result.awayStats.tackles)
  ));
  lines.push(padStat(
    String(result.homeStats.interceptions),
    'Pas Yolu Kesme',
    String(result.awayStats.interceptions)
  ));
  lines.push(padStat(
    String(result.homeStats.fouls),
    'Faul',
    String(result.awayStats.fouls)
  ));
  lines.push(padStat(
    String(result.homeStats.yellowCards),
    'Sarı Kart',
    String(result.awayStats.yellowCards)
  ));
  lines.push(padStat(
    String(result.homeStats.redCards),
    'Kırmızı Kart',
    String(result.awayStats.redCards)
  ));
  lines.push(padStat(
    String(result.homeStats.corners),
    'Korner',
    String(result.awayStats.corners)
  ));
  lines.push(padStat(
    String(result.homeStats.freeKicks),
    'Serbest Vuruş',
    String(result.awayStats.freeKicks)
  ));
  lines.push(padStat(
    String(result.homeStats.offsides),
    'Ofsayt',
    String(result.awayStats.offsides)
  ));
  lines.push(padStat(
    String(result.homeStats.saves),
    'Kurtarış',
    String(result.awayStats.saves)
  ));
  lines.push('');

  // ── OYUNCU DEĞERLENDİRMELERİ ────────────────────────────────────────────
  lines.push('─'.repeat(60));
  lines.push('  👤 OYUNCU DEĞERLENDİRMELERİ');
  lines.push('─'.repeat(60));
  lines.push('');

  const formatRatings = (ratings: PlayerMatchRating[], teamLabel: string) => {
    lines.push(`  ── ${teamLabel} ──`);
    const sorted = [...ratings].sort((a, b) => b.rating - a.rating);
    for (const r of sorted) {
      const emoji = r.rating >= 8.0 ? '🌟' : r.rating >= 7.0 ? '✅' : r.rating >= 6.0 ? '➖' : '📉';
      const posLabel = r.position.padEnd(4);
      const name = r.playerName.padEnd(20);
      const ratingStr = r.rating.toFixed(1).padStart(4);
      let statStr = '';
      if (r.goals > 0) statStr += `⚽${r.goals} `;
      if (r.assists > 0) statStr += `🅰️${r.assists} `;
      if (r.saves > 0) statStr += `🧤${r.saves} `;
      if (r.tackles > 2) statStr += `🦵${r.tackles} `;
      if (r.keyPasses > 1) statStr += `🔑${r.keyPasses} `;
      lines.push(`  ${emoji} [${posLabel}] ${name} ${ratingStr}  ${statStr}`);
    }
    lines.push('');
  };

  formatRatings(result.homePlayerRatings, 'EV SAHİBİ');
  formatRatings(result.awayPlayerRatings, 'DEPLASMAN');

  // ── MAÇIN ADAMI ────────────────────────────────────────────────────────
  lines.push('─'.repeat(60));
  lines.push('  🏆 MAÇIN ADAMI');
  lines.push('─'.repeat(60));
  lines.push('');

  if (motm) {
    const motmEvents = result.events.filter(
      e => e.playerId === motm.playerId && e.type !== 'chance'
    );
    lines.push(`     ${motm.playerName} (${motm.position})`);
    lines.push(`     Puan: ${motm.rating.toFixed(1)}`);
    lines.push('');
    if (motm.goals > 0) lines.push(`     ⚽ Gol: ${motm.goals}`);
    if (motm.assists > 0) lines.push(`     🅰️ Asist: ${motm.assists}`);
    if (motm.saves > 0) lines.push(`     🧤 Kurtarış: ${motm.saves}`);
    if (motm.keyPasses > 0) lines.push(`     🔑 Ana Pas: ${motm.keyPasses}`);
    if (motm.tackles > 0) lines.push(`     🦵 Top Kapma: ${motm.tackles}`);
    lines.push('');
    lines.push('     Maçta Öne Çıkan Anlar:');
    for (const ev of motmEvents.slice(0, 5)) {
      lines.push(`     • ${ev.minute}. dk — ${ev.description}`);
    }
  } else {
    lines.push('     Maçın adamı belirlenemedi.');
  }
  lines.push('');
  lines.push('═'.repeat(60));
  lines.push('');

  return lines.join('\n');
}
