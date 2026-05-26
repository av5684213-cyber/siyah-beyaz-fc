// ═══════════════════════════════════════════════════════════════════════
// Evolution Day Service — Pure function for daily game evolution
// Extracted from page.tsx runEvolution callback (Task 2.2-e)
// ═══════════════════════════════════════════════════════════════════════

import type { Player, Profile, TrainingState } from './types';
import type { YouthPlayer } from './youthAcademy';

import { UpdatePlayerStats, processDailyUpdates } from './evolution';
import { shouldPlayerRetire, processSeasonEndRetirements } from './retirement';
import { generateStarterPlayer, generateEliteWonderkid } from './playerGenerator';
import {
  generateYouthPlayer,
  generateScoutReport,
  YOUTH_FACILITIES,
  processYouthWeeklyTraining,
} from './youthAcademy';
import { getSeasonId } from './seasonAwardsService';
import { OperationManager } from './OperationManager';

// ─── Input / Output types ─────────────────────────────────────────────

export interface EvolutionDayInput {
  squad: Player[];
  profile: Profile;
  trainingState: TrainingState;
  youthPlayers: YouthPlayer[];
  youthFacilities: Record<string, number>;
}

export interface EvolutionDayResult {
  updatedSquad: Player[];
  updatedProfile: Profile;
  updatedTrainingState: TrainingState;
  updatedYouthPlayers: YouthPlayer[];
  retiredLog: { retired: Player[]; talents: Player[] } | null;

  /** Info needed to trigger async Hall-of-Fame induction (caller handles the async call) */
  hofInduction: {
    retiredPlayers: Player[];
    profileId: string;
    currentDay: number;
    retiredSeason: string;
  } | null;

  /** Enemy attack alert info (caller handles toast notification) */
  alertInfo: { header: string; text: string } | null;

  /** Whether youth players should be persisted to Supabase */
  youthSaveNeeded: boolean;
}

// ─── Pure function ────────────────────────────────────────────────────

/**
 * Processes a single evolution day: player growth, season-end retirements,
 * youth aging/intake, weekly training, scouting progress, financial income,
 * and enemy attack simulation.
 *
 * This is a **pure function** — it does not call any React setState hooks.
 * All inputs are passed as parameters; all outputs are returned as a result object.
 * The caller is responsible for applying the returned values to state and
 * triggering async side-effects (HOF induction, Supabase saves, toast notifications).
 */
export function processEvolutionDay(input: EvolutionDayInput): EvolutionDayResult {
  const { squad, profile, trainingState, youthPlayers, youthFacilities } = input;

  const isSeasonEnd = profile.current_day > 0 && profile.current_day % 34 === 0;

  // ── 1. Daily player evolution ──────────────────────────────────────
  let updatedSquad = squad.map(player => {
    const matchRatings = player.match_ratings || [];
    let performance: number;
    if (matchRatings.length > 0) {
      performance = matchRatings.reduce((sum, r) => sum + r, 0) / matchRatings.length;
    } else {
      performance = 3;
    }
    let evolved = UpdatePlayerStats(player, performance);
    if (profile.current_day % 34 === 17 && !evolved.is_retiring) {
      if (shouldPlayerRetire(evolved)) evolved.is_retiring = true;
    }
    return evolved;
  });

  // Apply daily updates (injuries, form, morale)
  updatedSquad = processDailyUpdates(updatedSquad);

  // ── 2. Season-end processing ───────────────────────────────────────
  let retiredLog: EvolutionDayResult['retiredLog'] = null;
  let hofInduction: EvolutionDayResult['hofInduction'] = null;
  let updatedYouthPlayers = youthPlayers;
  let youthSaveNeeded = false;

  if (isSeasonEnd) {
    const { updatedSquad: nextSeasonSquad, retiredPlayers, newTalents } =
      processSeasonEndRetirements(updatedSquad, profile.id);
    updatedSquad = nextSeasonSquad;

    // Stadium Academy Bonus
    const academyLvl = (profile.stadium_upgrades || {})['academy'] || 0;
    if (academyLvl === 10) {
      const eliteWonderkid = generateEliteWonderkid();
      eliteWonderkid.id = `wonderkid-${Date.now()}`;
      newTalents.push(eliteWonderkid);
      updatedSquad.push(eliteWonderkid);
    }

    // Youth aging + intake
    const aged = updatedYouthPlayers.map(yp => {
      const newAge = yp.age + 1;
      const newCategory = newAge <= 17 ? 'U17' : newAge <= 19 ? 'U19' : 'U21';
      if (newAge > 21) return null;
      return { ...yp, age: newAge, category: newCategory };
    }).filter(Boolean) as YouthPlayer[];

    const academyLevel = profile.academy_level || 1;
    const intakeCount = Math.min(5, 1 + academyLevel);
    const newIntake: YouthPlayer[] = [];
    for (let i = 0; i < intakeCount; i++) {
      const yp = generateYouthPlayer(academyLevel);
      const withReport = { ...yp, scoutReport: generateScoutReport(yp) };
      newIntake.push(withReport);
    }
    updatedYouthPlayers = [...aged, ...newIntake];
    youthSaveNeeded = true;

    retiredLog = { retired: retiredPlayers, talents: newTalents };

    // HoF induction info (caller handles the async call)
    if (retiredPlayers.length > 0 && profile.id) {
      const retiredSeason = getSeasonId(profile.current_day);
      hofInduction = {
        retiredPlayers,
        profileId: profile.id,
        currentDay: profile.current_day,
        retiredSeason,
      };
    }
  }

  // ── 3. Weekly youth training (every 7 days) ────────────────────────
  const currentDay = profile.current_day ?? 1;
  if (currentDay > 0 && currentDay % 7 === 0) {
    if (updatedYouthPlayers.length > 0) {
      const facilityStates = YOUTH_FACILITIES.map(f => ({
        facilityId: f.id,
        currentLevel: youthFacilities[f.id] ?? 1,
      }));
      updatedYouthPlayers = updatedYouthPlayers.map(yp => {
        try {
          return processYouthWeeklyTraining(yp, facilityStates);
        } catch {
          return yp;
        }
      });
      youthSaveNeeded = true;
    }
  }

  // ── 4. Financial daily income + day increment ──────────────────────
  const stadiumUpgrades = profile.stadium_upgrades || {};
  const storeLvl = stadiumUpgrades['store'] || 0;
  const dailyIncome = storeLvl * 5000;
  const updatedProfile: Profile = {
    ...profile,
    current_day: (profile.current_day || 1) + 1,
    money: (profile.money || 0) + dailyIncome,
  };

  // ── 5. Scouting progress ───────────────────────────────────────────
  let updatedTrainingState = trainingState;
  if (trainingState?.scouting) {
    const newFoundPlayers: Player[] = [];
    const updatedScouts = trainingState.scouting.scouts.map((s: any) => {
      if (s.status === 'SCOUTING') {
        const remaining = s.remainingDays - 1;
        if (remaining <= 0) {
          const playerCount = 2 + Math.floor(Math.random() * s.stars);
          for (let i = 0; i < playerCount; i++) {
            const pos = (['GK', 'DEF', 'MID', 'FWD'] as const)[Math.floor(Math.random() * 4)];
            const p = generateStarterPlayer(pos);
            const bonus = (s.stars - 3) * 4;
            p.rating = Math.max(45, Math.min(94, p.rating + bonus));
            p.potential = Math.max(p.rating, Math.min(99, p.potential + bonus + 2));
            newFoundPlayers.push(p);
          }
          return { ...s, status: 'IDLE', remainingDays: 0, location: undefined };
        }
        return { ...s, remainingDays: remaining };
      }
      return s;
    });

    updatedTrainingState = {
      ...updatedTrainingState,
      scouting: {
        ...updatedTrainingState.scouting,
        scouts: updatedScouts,
        foundPlayersPool: [
          ...(updatedTrainingState.scouting?.foundPlayersPool || []),
          ...newFoundPlayers,
        ],
      },
    };
  }

  // ── 6. Enemy attack simulation (10% chance) ────────────────────────
  let alertInfo: EvolutionDayResult['alertInfo'] = null;
  if (Math.random() < 0.1) {
    const { updatedState, alertHeader, alertText } =
      OperationManager.getInstance().simulateEnemyAttack(updatedProfile, updatedTrainingState);
    updatedTrainingState = updatedState;
    if (alertHeader) {
      alertInfo = { header: alertHeader, text: alertText || '' };
    }
  }

  // ── Return ─────────────────────────────────────────────────────────
  return {
    updatedSquad,
    updatedProfile,
    updatedTrainingState,
    updatedYouthPlayers,
    retiredLog,
    hofInduction,
    alertInfo,
    youthSaveNeeded,
  };
}
