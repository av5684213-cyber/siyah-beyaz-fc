import { getFitnessMultiplier, runTrainingSession } from '@/lib/fm/trainingEngine';
import { Player, TrainingState } from '@/lib/fm/types';

// ─── Helper: Create a minimal valid Player object ──────────────────────────
function makePlayer(overrides: Partial<Player> & { id: string }): Player {
  return {
    id: overrides.id,
    name: overrides.name ?? 'Test Player',
    position: overrides.position ?? 'MID',
    specificPosition: overrides.specificPosition ?? 'CM',
    rating: overrides.rating ?? 65,
    age: overrides.age ?? 25,
    potential: overrides.potential ?? 80,
    market_value: overrides.market_value ?? 1_000_000,
    salary: overrides.salary ?? 50_000,
    nation: overrides.nation ?? 'TR',
    defending: overrides.defending ?? 50,
    passing: overrides.passing ?? 55,
    shooting: overrides.shooting ?? 50,
    speed: overrides.speed ?? 60,
    power: overrides.power ?? 55,
    cond: overrides.cond ?? 100,
    form: overrides.form ?? 70,
    morale: overrides.morale ?? 70,
    confidence: overrides.confidence ?? 70,
    hidden_potential: overrides.hidden_potential ?? 75,
    traits: overrides.traits ?? [],
    ...overrides,
  } as Player;
}

function makeTrainingState(playerId: string, programId: string, focusedStat?: string): TrainingState {
  return {
    assignments: [
      {
        playerId,
        programId: programId as any,
        focusedStat: focusedStat as any,
      },
    ],
    coachQuality: 1.0,
    lastSessionResults: {},
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. getFitnessMultiplier tests
// ═══════════════════════════════════════════════════════════════════════════

describe('getFitnessMultiplier', () => {
  it('returns 1.0 for cond 90-100 (full efficiency)', () => {
    expect(getFitnessMultiplier(100)).toBe(1.0);
    expect(getFitnessMultiplier(95)).toBe(1.0);
    expect(getFitnessMultiplier(90)).toBe(1.0);
  });

  it('returns 0.85 for cond 70-89', () => {
    expect(getFitnessMultiplier(89)).toBe(0.85);
    expect(getFitnessMultiplier(80)).toBe(0.85);
    expect(getFitnessMultiplier(70)).toBe(0.85);
  });

  it('returns 0.65 for cond 50-69', () => {
    expect(getFitnessMultiplier(69)).toBe(0.65);
    expect(getFitnessMultiplier(60)).toBe(0.65);
    expect(getFitnessMultiplier(50)).toBe(0.65);
  });

  it('returns 0.40 for cond 30-49', () => {
    expect(getFitnessMultiplier(49)).toBe(0.40);
    expect(getFitnessMultiplier(40)).toBe(0.40);
    expect(getFitnessMultiplier(30)).toBe(0.40);
  });

  it('returns 0.20 for cond 0-29 (increased injury risk)', () => {
    expect(getFitnessMultiplier(29)).toBe(0.20);
    expect(getFitnessMultiplier(20)).toBe(0.20);
    expect(getFitnessMultiplier(10)).toBe(0.20);
    expect(getFitnessMultiplier(0)).toBe(0.20);
  });

  it('is monotonically non-increasing as cond decreases', () => {
    const values = [100, 95, 90, 89, 80, 70, 69, 60, 50, 49, 40, 30, 29, 20, 10, 0];
    const multipliers = values.map(c => getFitnessMultiplier(c));
    for (let i = 1; i < multipliers.length; i++) {
      expect(multipliers[i]).toBeLessThanOrEqual(multipliers[i - 1]);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Training gains scale with fitness multiplier
// ═══════════════════════════════════════════════════════════════════════════

describe('Training gains scale with fitness (cond)', () => {
  it('player with cond=20 gets approximately 20% of the focused stat gains of a player with cond=95', () => {
    // We need to control Math.random for deterministic general stat gains,
    // but for focused stat gains the formula is deterministic (gap-based).
    // We use 'teknik_driller' (intensity 70, FIELD) with focusedStat 'passing'.

    const lowCondPlayer = makePlayer({ id: 'low-cond', cond: 20, passing: 50, potential: 80 });
    const highCondPlayer = makePlayer({ id: 'high-cond', cond: 95, passing: 50, potential: 80 });

    const lowCondState = makeTrainingState('low-cond', 'teknik_driller', 'passing');
    const highCondState = makeTrainingState('high-cond', 'teknik_driller', 'passing');

    // Mock Math.random to return a consistent value for general stat gains
    const originalRandom = Math.random;
    let callCount = 0;
    Math.random = () => {
      callCount++;
      return 0.5; // Consistent value for all random calls
    };

    try {
      const lowResult = runTrainingSession([lowCondPlayer], lowCondState, 1.0);
      const highResult = runTrainingSession([highCondPlayer], highCondState, 1.0);

      const lowFocusedGain = lowResult.results['low-cond'].statsGained['passing'] ?? 0;
      const highFocusedGain = highResult.results['high-cond'].statsGained['passing'] ?? 0;

      // The ratio should be approximately 0.20 / 1.0 = 0.20 (20%)
      // Allow 10% tolerance due to multiplier capping
      const ratio = lowFocusedGain / highFocusedGain;
      expect(ratio).toBeGreaterThan(0.15);
      expect(ratio).toBeLessThan(0.25);
    } finally {
      Math.random = originalRandom;
    }
  });

  it('player with cond=60 gets reduced gains compared to cond=95', () => {
    const midCondPlayer = makePlayer({ id: 'mid-cond', cond: 60, passing: 50, potential: 80 });
    const highCondPlayer = makePlayer({ id: 'high-cond-2', cond: 95, passing: 50, potential: 80 });

    const midCondState = makeTrainingState('mid-cond', 'teknik_driller', 'passing');
    const highCondState = makeTrainingState('high-cond-2', 'teknik_driller', 'passing');

    const originalRandom = Math.random;
    Math.random = () => 0.5;

    try {
      const midResult = runTrainingSession([midCondPlayer], midCondState, 1.0);
      const highResult = runTrainingSession([highCondPlayer], highCondState, 1.0);

      const midGain = midResult.results['mid-cond'].statsGained['passing'] ?? 0;
      const highGain = highResult.results['high-cond-2'].statsGained['passing'] ?? 0;

      // 0.65 / 1.0 = 0.65 ratio
      const ratio = midGain / highGain;
      expect(ratio).toBeGreaterThan(0.55);
      expect(ratio).toBeLessThan(0.75);
    } finally {
      Math.random = originalRandom;
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Injury risk is higher for low-cond players
// ═══════════════════════════════════════════════════════════════════════════

describe('Injury risk increases for low-cond players', () => {
  it('cond < 30 adds 0.12 penalty to injury risk (condPenalty)', () => {
    // We test by running many sessions and checking that low-cond players
    // get flagged with injuryRisk more often than high-cond players.
    const iterations = 500;
    let lowCondInjuries = 0;
    let highCondInjuries = 0;

    for (let i = 0; i < iterations; i++) {
      const lowCondPlayer = makePlayer({ id: `low-${i}`, cond: 20, passing: 50, potential: 80 });
      const highCondPlayer = makePlayer({ id: `high-${i}`, cond: 95, passing: 50, potential: 80 });

      const lowCondState = makeTrainingState(`low-${i}`, 'teknik_driller', 'passing');
      const highCondState = makeTrainingState(`high-${i}`, 'teknik_driller', 'passing');

      const lowResult = runTrainingSession([lowCondPlayer], lowCondState, 1.0);
      const highResult = runTrainingSession([highCondPlayer], highCondState, 1.0);

      if (lowResult.results[`low-${i}`].injuryRisk) lowCondInjuries++;
      if (highResult.results[`high-${i}`].injuryRisk) highCondInjuries++;
    }

    // Low-cond players (condPenalty = 0.12) should have significantly more injuries
    // than high-cond players (condPenalty = 0).
    // Expected: low ≈ 3% + 1.2% + 12% ≈ 15%+, high ≈ 3% + 1.2% ≈ 4%
    // With 500 iterations, this difference should be very clear.
    expect(lowCondInjuries).toBeGreaterThan(highCondInjuries * 2);
  });

  it('cond 30-39 adds 0.08 penalty (more than cond 60+ but less than cond < 30)', () => {
    const iterations = 500;
    let midLowInjuries = 0;
    let lowInjuries = 0;

    for (let i = 0; i < iterations; i++) {
      const midLowPlayer = makePlayer({ id: `midlow-${i}`, cond: 35, passing: 50, potential: 80 });
      const lowPlayer = makePlayer({ id: `vlow-${i}`, cond: 20, passing: 50, potential: 80 });

      const midLowState = makeTrainingState(`midlow-${i}`, 'teknik_driller', 'passing');
      const lowState = makeTrainingState(`vlow-${i}`, 'teknik_driller', 'passing');

      const midLowResult = runTrainingSession([midLowPlayer], midLowState, 1.0);
      const lowResult = runTrainingSession([lowPlayer], lowState, 1.0);

      if (midLowResult.results[`midlow-${i}`].injuryRisk) midLowInjuries++;
      if (lowResult.results[`vlow-${i}`].injuryRisk) lowInjuries++;
    }

    // cond=20 (0.12 penalty) should have more injuries than cond=35 (0.08 penalty)
    expect(lowInjuries).toBeGreaterThan(midLowInjuries);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Intensity-based cond drain
// ═══════════════════════════════════════════════════════════════════════════

describe('Intensity-based condition drain', () => {
  it('high intensity program (>=80) drains 1.25x more condition', () => {
    // 'fiziksel_yukleme' has intensity=80, condCost=-12 → -12 * 1.25 = -15
    const player = makePlayer({ id: 'high-int', cond: 80, passing: 50, potential: 80 });
    const state = makeTrainingState('high-int', 'fiziksel_yukleme', 'passing');

    const originalRandom = Math.random;
    Math.random = () => 0.5;

    try {
      const result = runTrainingSession([player], state, 1.0);
      // staminaLost should be -12 * 1.25 = -15
      expect(result.results['high-int'].staminaLost).toBe(-15);
    } finally {
      Math.random = originalRandom;
    }
  });

  it('light intensity program (<60) drains 0.5x condition', () => {
    // 'zihinsel_hazirlik' has intensity=45, condCost=-2 → -2 * 0.5 = -1
    const player = makePlayer({ id: 'light-int', cond: 80, passing: 50, potential: 80 });
    const state = makeTrainingState('light-int', 'zihinsel_hazirlik', 'decisions');

    const originalRandom = Math.random;
    Math.random = () => 0.5;

    try {
      const result = runTrainingSession([player], state, 1.0);
      // staminaLost should be -2 * 0.5 = -1
      expect(result.results['light-int'].staminaLost).toBe(-1);
    } finally {
      Math.random = originalRandom;
    }
  });

  it('normal intensity program (60-79) keeps standard condition drain', () => {
    // 'teknik_driller' has intensity=70, condCost=-6 → stays -6
    const player = makePlayer({ id: 'normal-int', cond: 80, passing: 50, potential: 80 });
    const state = makeTrainingState('normal-int', 'teknik_driller', 'passing');

    const originalRandom = Math.random;
    Math.random = () => 0.5;

    try {
      const result = runTrainingSession([player], state, 1.0);
      expect(result.results['normal-int'].staminaLost).toBe(-6);
    } finally {
      Math.random = originalRandom;
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Low condition warning message
// ═══════════════════════════════════════════════════════════════════════════

describe('Low condition warning', () => {
  it('shows warning message when cond < 50', () => {
    const player = makePlayer({ id: 'warn-player', cond: 45, passing: 50, potential: 80 });
    const state = makeTrainingState('warn-player', 'teknik_driller', 'passing');

    const originalRandom = Math.random;
    Math.random = () => 0.5;

    try {
      const result = runTrainingSession([player], state, 1.0);
      expect((result.results['warn-player'] as any).message).toBe(
        'Düşük kondisyon! Antrenman verimi azalıyor.'
      );
    } finally {
      Math.random = originalRandom;
    }
  });

  it('does not show warning when cond >= 50', () => {
    const player = makePlayer({ id: 'no-warn-player', cond: 60, passing: 50, potential: 80 });
    const state = makeTrainingState('no-warn-player', 'teknik_driller', 'passing');

    const originalRandom = Math.random;
    Math.random = () => 0.5;

    try {
      const result = runTrainingSession([player], state, 1.0);
      expect((result.results['no-warn-player'] as any).message).toBeUndefined();
    } finally {
      Math.random = originalRandom;
    }
  });
});
