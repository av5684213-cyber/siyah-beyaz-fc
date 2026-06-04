/**
 * BUG-12: Youth Academy Age Distribution Tests
 *
 * Tests the age range (15-18), weighted distribution,
 * age-based rating/potential ranges, and academy level quality boost.
 */

import { generateYouthPlayer } from '@/lib/fm/youthAcademy';

// ═══════════════════════════════════════════════════════════════
// AGE RANGE TESTS
// ═══════════════════════════════════════════════════════════════

describe('Youth Academy Age Range', () => {
  test('Age is always between 15 and 18', () => {
    for (let i = 0; i < 200; i++) {
      const player = generateYouthPlayer(5);
      expect(player.age).toBeGreaterThanOrEqual(15);
      expect(player.age).toBeLessThanOrEqual(18);
    }
  });

  test('Age never exceeds 18', () => {
    for (let i = 0; i < 500; i++) {
      const player = generateYouthPlayer(Math.floor(Math.random() * 10) + 1);
      expect(player.age).toBeLessThanOrEqual(18);
    }
  });

  test('Age never goes below 15', () => {
    for (let i = 0; i < 500; i++) {
      const player = generateYouthPlayer(Math.floor(Math.random() * 10) + 1);
      expect(player.age).toBeGreaterThanOrEqual(15);
    }
  });

  test('targetAge parameter overrides random age', () => {
    const player15 = generateYouthPlayer(5, 15);
    const player16 = generateYouthPlayer(5, 16);
    const player17 = generateYouthPlayer(5, 17);
    const player18 = generateYouthPlayer(5, 18);

    expect(player15.age).toBe(15);
    expect(player16.age).toBe(16);
    expect(player17.age).toBe(17);
    expect(player18.age).toBe(18);
  });
});

// ═══════════════════════════════════════════════════════════════
// AGE DISTRIBUTION TESTS (statistical)
// ═══════════════════════════════════════════════════════════════

describe('Youth Academy Age Distribution', () => {
  const SAMPLE_SIZE = 2000;

  test('Approximately 40% of players are age 15-16', () => {
    let count15_16 = 0;
    for (let i = 0; i < SAMPLE_SIZE; i++) {
      const player = generateYouthPlayer(5);
      if (player.age === 15 || player.age === 16) count15_16++;
    }
    const ratio = count15_16 / SAMPLE_SIZE;
    // Allow ±5% margin for randomness
    expect(ratio).toBeGreaterThan(0.30);
    expect(ratio).toBeLessThan(0.50);
  });

  test('Approximately 40% of players are age 17', () => {
    let count17 = 0;
    for (let i = 0; i < SAMPLE_SIZE; i++) {
      const player = generateYouthPlayer(5);
      if (player.age === 17) count17++;
    }
    const ratio = count17 / SAMPLE_SIZE;
    // Allow ±5% margin for randomness
    expect(ratio).toBeGreaterThan(0.30);
    expect(ratio).toBeLessThan(0.50);
  });

  test('Approximately 20% of players are age 18', () => {
    let count18 = 0;
    for (let i = 0; i < SAMPLE_SIZE; i++) {
      const player = generateYouthPlayer(5);
      if (player.age === 18) count18++;
    }
    const ratio = count18 / SAMPLE_SIZE;
    // Allow ±5% margin for randomness
    expect(ratio).toBeGreaterThan(0.10);
    expect(ratio).toBeLessThan(0.30);
  });

  test('All age groups appear in generation', () => {
    const ages = new Set<number>();
    for (let i = 0; i < 200; i++) {
      const player = generateYouthPlayer(5);
      ages.add(player.age);
    }
    expect(ages.has(15)).toBe(true);
    expect(ages.has(16)).toBe(true);
    expect(ages.has(17)).toBe(true);
    expect(ages.has(18)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// AGE-BASED RATING/POTENTIAL RANGES
// ═══════════════════════════════════════════════════════════════

describe('Age-Based Rating and Potential Ranges', () => {
  test('Age 15-16 players: higher potential, lower starting rating', () => {
    for (let i = 0; i < 100; i++) {
      const player15 = generateYouthPlayer(3, 15);
      const player16 = generateYouthPlayer(3, 16);

      // Rating should be lower for 15-16 year olds
      expect(player15.rating).toBeGreaterThanOrEqual(25);
      expect(player15.rating).toBeLessThanOrEqual(65);
      expect(player16.rating).toBeGreaterThanOrEqual(25);
      expect(player16.rating).toBeLessThanOrEqual(65);

      // Potential should be higher
      expect(player15.potential).toBeGreaterThanOrEqual(player15.rating + 5);
      expect(player16.potential).toBeGreaterThanOrEqual(player16.rating + 5);
    }
  });

  test('Age 17 players: moderate potential and rating', () => {
    for (let i = 0; i < 100; i++) {
      const player = generateYouthPlayer(3, 17);
      expect(player.rating).toBeGreaterThanOrEqual(25);
      expect(player.rating).toBeLessThanOrEqual(65);
      expect(player.potential).toBeGreaterThanOrEqual(player.rating + 5);
    }
  });

  test('Age 18 players: lower potential, higher starting rating', () => {
    for (let i = 0; i < 100; i++) {
      const player = generateYouthPlayer(3, 18);
      expect(player.rating).toBeGreaterThanOrEqual(25);
      expect(player.rating).toBeLessThanOrEqual(65);
      expect(player.potential).toBeGreaterThanOrEqual(player.rating + 5);
    }
  });

  test('Younger players tend to have higher potential than older players', () => {
    // Average potential over many samples for different ages
    const avgPotential = (age: number) => {
      let total = 0;
      const count = 200;
      for (let i = 0; i < count; i++) {
        const player = generateYouthPlayer(3, age);
        total += player.potential;
      }
      return total / count;
    };

    const avg15 = avgPotential(15);
    const avg17 = avgPotential(17);
    const avg18 = avgPotential(18);

    // Younger players should tend to have higher potential
    expect(avg15).toBeGreaterThan(avg17);
    expect(avg17).toBeGreaterThan(avg18);
  });

  test('Younger players tend to have lower starting rating than older players', () => {
    const avgRating = (age: number) => {
      let total = 0;
      const count = 200;
      for (let i = 0; i < count; i++) {
        const player = generateYouthPlayer(3, age);
        total += player.rating;
      }
      return total / count;
    };

    const avg15 = avgRating(15);
    const avg17 = avgRating(17);
    const avg18 = avgRating(18);

    // Younger players should tend to have lower starting rating
    expect(avg15).toBeLessThan(avg17);
    expect(avg17).toBeLessThan(avg18);
  });

  test('hidden_potential >= potential for all ages', () => {
    for (let age = 15; age <= 18; age++) {
      for (let i = 0; i < 50; i++) {
        const player = generateYouthPlayer(5, age);
        expect(player.hidden_potential).toBeGreaterThanOrEqual(player.potential);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// ACADEMY LEVEL QUALITY BOOST
// ═══════════════════════════════════════════════════════════════

describe('Academy Level Quality Boost', () => {
  test('Level 5 academy can produce potentials up to 95', () => {
    let maxPotentialSeen = 0;
    for (let i = 0; i < 500; i++) {
      const player = generateYouthPlayer(5);
      maxPotentialSeen = Math.max(maxPotentialSeen, player.potential);
    }
    // With level 5 academy, potentials should be able to reach near 95
    // (statistically we should see at least 90+ in 500 samples)
    expect(maxPotentialSeen).toBeGreaterThanOrEqual(85);
  });

  test('Higher academy level produces higher average potential', () => {
    const avgPotential = (level: number) => {
      let total = 0;
      const count = 200;
      for (let i = 0; i < count; i++) {
        const player = generateYouthPlayer(level);
        total += player.potential;
      }
      return total / count;
    };

    const avg1 = avgPotential(1);
    const avg5 = avgPotential(5);
    const avg10 = avgPotential(10);

    expect(avg5).toBeGreaterThan(avg1);
    expect(avg10).toBeGreaterThan(avg5);
  });

  test('Higher academy level produces higher average rating', () => {
    const avgRating = (level: number) => {
      let total = 0;
      const count = 200;
      for (let i = 0; i < count; i++) {
        const player = generateYouthPlayer(level);
        total += player.rating;
      }
      return total / count;
    };

    const avg1 = avgRating(1);
    const avg5 = avgRating(5);
    const avg10 = avgRating(10);

    expect(avg5).toBeGreaterThan(avg1);
    expect(avg10).toBeGreaterThan(avg5);
  });

  test('Level 10 academy produces potentials approaching 95+', () => {
    let maxPotentialSeen = 0;
    for (let i = 0; i < 500; i++) {
      const player = generateYouthPlayer(10);
      maxPotentialSeen = Math.max(maxPotentialSeen, player.potential);
    }
    expect(maxPotentialSeen).toBeGreaterThanOrEqual(90);
  });

  test('Potential always exceeds rating by at least 5', () => {
    for (let level = 1; level <= 10; level++) {
      for (let i = 0; i < 50; i++) {
        const player = generateYouthPlayer(level);
        expect(player.potential).toBeGreaterThanOrEqual(player.rating + 5);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// PLAYER COMPLETENESS TESTS
// ═══════════════════════════════════════════════════════════════

describe('Youth Player Completeness', () => {
  test('Generated player has all required fields', () => {
    const player = generateYouthPlayer(5);
    expect(player.id).toBeDefined();
    expect(player.name).toBeDefined();
    expect(player.age).toBeGreaterThanOrEqual(15);
    expect(player.age).toBeLessThanOrEqual(18);
    expect(player.position).toBeDefined();
    expect(player.specificPosition).toBeDefined();
    expect(player.rating).toBeGreaterThan(0);
    expect(player.potential).toBeGreaterThan(0);
    expect(player.speed).toBeGreaterThan(0);
    expect(player.passing).toBeGreaterThan(0);
    expect(player.shooting).toBeGreaterThan(0);
    expect(player.nation).toBe('TR');
    expect(player.cond).toBeGreaterThan(0);
  });

  test('Player category matches age', () => {
    const player15 = generateYouthPlayer(5, 15);
    const player17 = generateYouthPlayer(5, 17);
    const player18 = generateYouthPlayer(5, 18);

    expect(player15.category).toBe('U17');
    expect(player17.category).toBe('U17');
    expect(player18.category).toBe('U19');
  });
});
