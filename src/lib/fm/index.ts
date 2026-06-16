// Touchline Manager — Barrel Export
// Tüm modüller bu dosya üzerinden erişilebilir.
// Yeni kodlar için domain bazlı import'lar tercih edilmelidir:
//   import { ... } from '@/lib/fm/engine'
//   import { ... } from '@/lib/fm/finance'
//   import { ... } from '@/lib/fm/squad'
//   import { ... } from '@/lib/fm/league'
//   import { ... } from '@/lib/fm/cup'

// ─── Engine ───────────────────────────────────────────
export * from './enhancedMatchEngine';
export * from './referee';
export * from './matchCommentaryGenerator';
export * from './injuryManager';
export * from './CommentaryManager';
export * from './commentary';
export * from './matchConsequencesService';
export * from './matchTypeUtils';
export * from './FitnessManager';
export * from './DefenseManager';
export * from './atmosphere';

// ─── Finance ──────────────────────────────────────────
export * from './financialModel';
export * from './stadiumMatrix';
export * from './inflation';
export * from './salaryUtils';

// ─── Squad ────────────────────────────────────────────
export * from './playerGenerator';
export * from './valuation';
export * from './trainingEngine';
export * from './evolutionDayService';
export * from './evolution';
export * from './attributeGenerator';
export * from './positionWeights';
export * from './positionEffectiveness';
export * from './moraleManager';
export * from './retirement';
export * from './careerStats';
export * from './region-generator';

// ─── League ───────────────────────────────────────────
export * from './leagueHelpers';
export * from './league';
export * from './seasonAwardsService';
export * from './formRatingService';
export * from './xpLevelFansService';
export * from './schedule';
export * from './confidenceSystem';

// ─── Cup ──────────────────────────────────────────────
export * from './cupSystem';
export * from './schedule/MatchScheduleManager';

// ─── Tactics ──────────────────────────────────────────
export * from './tacticsEngine';
export * from './tacticBuilder';
export * from './tacticsRoles';
export * from './playStyles';

// ─── Player / Scout ───────────────────────────────────
export * from './aiScout';
export * from './playerDemands';
export * from './traits';
export * from './traitsData';
export * from './traitConflicts';

// ─── Youth Academy ────────────────────────────────────
export * from './youthAcademy';
export * from './youthAcademySeasonSync';

// ─── Transfer / Market ────────────────────────────────
export * from './transferWindow';
export * from './botService';
export * from './botDifficulty';

// ─── Media / Comms ────────────────────────────────────
export * from './mediaSystem';
export * from './matchChatService';
export * from './rivalMessagingService';
export * from './unifiedMessagingService';
export * from './emotionalEvents';

// ─── Services ─────────────────────────────────────────
export * from './deepFootballService';
export * from './hallOfFameService';
export * from './cronLockService';
export * from './notificationManager';
export * from './InfoContentManager';
export * from './OperationManager';
export * from './operations';
export * from './multiplayer';
export * from './teamStats';

// ─── Persistence / Security ───────────────────────────
export * from './persistence';
export * from './security';
export * from './supabaseRateLimit';
export * from './migration';

// ─── UI / Hooks ───────────────────────────────────────
export * from './useActiveOperations';
export * from './useCupSeasons';
export * from './useDbHealth';
export * from './useEmotionalEvents';
export * from './useOnboarding';
export * from './useYouthAcademy';
// useShallowFM: GameContext.tsx üzerinden yeniden dışa aktarılır

// ─── Core / Shared ────────────────────────────────────
export * from './types';
export * from './constants';
export * from './helpers';
export * from './sharedUtils';
export * from './ui-helpers';
export * from './i18n';
export * from './themeSystem';

// ─── Contexts ─────────────────────────────────────────
export * from './MatchContext';
export * from './ToastContext';
export * from './GameContext';
export * from './contexts';
// FMContext ayrı dosyadan — döngüsel bağımlılık yok
export { FMContext } from './FMContext';
