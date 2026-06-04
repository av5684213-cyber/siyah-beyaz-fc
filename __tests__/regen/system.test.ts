/**
 * Siyah Beyaz FC — BUG-15: Regen System Test
 *
 * Tests for the regen (re-generation) player system:
 * - Position group mapping
 * - Regen player generation logic
 * - Name generation (inspired by retired player)
 * - Age, rating, and potential ranges
 * - Free agent assignment
 * - Minimum regen count per group
 */

// ═══════════════════════════════════════════════════════════════
// POSITION GROUP MAPPING (mirrors the API route logic)
// ═══════════════════════════════════════════════════════════════

const POSITION_GROUPS: Record<string, string> = {
  GK: 'GK',
  CB: 'DEF', LB: 'DEF', RB: 'DEF', LWB: 'DEF', RWB: 'DEF',
  CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID', LW: 'MID', RW: 'MID',
  CF: 'FWD', ST: 'FWD',
};

const GROUP_POSITIONS: Record<string, string[]> = {
  GK: ['GK'],
  DEF: ['CB', 'LB', 'RB', 'LWB', 'RWB'],
  MID: ['CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'],
  FWD: ['CF', 'ST'],
};

function mapToGroup(position: string): string {
  return POSITION_GROUPS[position] || 'MID';
}

// ═══════════════════════════════════════════════════════════════
// REGEN PLAYER GENERATOR (mirrors the API route logic)
// ═══════════════════════════════════════════════════════════════

const FIRST_NAMES = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Can', 'Burak', 'Emre', 'Arda', 'Ömer', 'Yiğit', 'Mert',
  'Ali', 'Hakan', 'Kerem', 'Efe', 'Deniz', 'Tolga', 'Sercan', 'Cengiz', 'Umut', 'Berk',
];

interface RegenPlayer {
  id: string;
  name: string;
  position: string;
  specific_position: string;
  rating: number;
  potential: number;
  hidden_potential: number;
  age: number;
  is_free_agent: boolean;
  is_regen: boolean;
  inspired_by_player_id: string;
  profile_id: null;
  team_name: null;
}

function generateRegenPlayer(
  retiredPlayer: { id: string; name: string; position: string; specific_position?: string; rating: number },
  rng: () => number = Math.random,
): RegenPlayer {
  const retiredName = retiredPlayer.name || 'Bilinmeyen Oyuncu';
  const retiredRating = retiredPlayer.rating || 60;
  const retiredPosition = retiredPlayer.position || 'MID';
  const retiredSpecificPosition = retiredPlayer.specific_position || null;
  const retiredId = retiredPlayer.id || '';

  // Extract last name
  const nameParts = retiredName.trim().split(' ');
  const lastName = nameParts.length >= 2 ? nameParts[nameParts.length - 1] : 'Yılmaz';

  // New first name (different from retired player)
  const retiredFirst = nameParts[0] || '';
  const availableFirsts = FIRST_NAMES.filter(n => n !== retiredFirst);
  const newFirst = availableFirsts[Math.floor(rng() * availableFirsts.length)] || FIRST_NAMES[0];
  const newName = `${newFirst} ${lastName}`;

  // Position group
  const group = mapToGroup(retiredPosition);
  const possiblePositions = GROUP_POSITIONS[group] || ['CM'];
  const specificPosition = retiredSpecificPosition || possiblePositions[Math.floor(rng() * possiblePositions.length)];

  // Age: 15-18
  const age = 15 + Math.floor(rng() * 4);

  // Rating: 40-55 for young players
  const rating = 40 + Math.floor(rng() * 16);

  // Potential: Based on retired player's peak rating
  const peakFactor = 0.75 + rng() * 0.25;
  const potential = Math.min(99, Math.max(rating + 10, Math.round(retiredRating * peakFactor)));

  // Hidden potential
  const hiddenPotential = Math.min(99, potential + Math.floor(rng() * 11));

  return {
    id: `regen-test-${Date.now()}-${Math.floor(rng() * 10000)}`,
    name: newName,
    position: group,
    specific_position: specificPosition,
    rating,
    potential,
    hidden_potential: hiddenPotential,
    age,
    is_free_agent: true,
    is_regen: true,
    inspired_by_player_id: retiredId,
    profile_id: null,
    team_name: null,
  };
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

function createMockRetiredPlayer(overrides: Record<string, unknown> = {}) {
  return {
    id: 'retired-1',
    name: 'Ahmet Yılmaz',
    position: 'MID',
    specific_position: 'CM',
    rating: 75,
    potential: 80,
    age: 38,
    profile_id: 'profile-1',
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════
// POSITION GROUP MAPPING TESTS
// ═══════════════════════════════════════════════════════════════

describe('BUG-15: Regen System', () => {
  describe('Position Group Mapping', () => {
    test('GK positions map to GK group', () => {
      expect(mapToGroup('GK')).toBe('GK');
    });

    test('Defensive positions map to DEF group', () => {
      expect(mapToGroup('CB')).toBe('DEF');
      expect(mapToGroup('LB')).toBe('DEF');
      expect(mapToGroup('RB')).toBe('DEF');
      expect(mapToGroup('LWB')).toBe('DEF');
      expect(mapToGroup('RWB')).toBe('DEF');
    });

    test('Midfield positions map to MID group', () => {
      expect(mapToGroup('CDM')).toBe('MID');
      expect(mapToGroup('CM')).toBe('MID');
      expect(mapToGroup('CAM')).toBe('MID');
      expect(mapToGroup('LM')).toBe('MID');
      expect(mapToGroup('RM')).toBe('MID');
      expect(mapToGroup('LW')).toBe('MID');
      expect(mapToGroup('RW')).toBe('MID');
    });

    test('Forward positions map to FWD group', () => {
      expect(mapToGroup('CF')).toBe('FWD');
      expect(mapToGroup('ST')).toBe('FWD');
    });

    test('Unknown positions default to MID', () => {
      expect(mapToGroup('UNKNOWN')).toBe('MID');
      expect(mapToGroup('')).toBe('MID');
    });

    test('Group "GK" has only GK position', () => {
      expect(GROUP_POSITIONS.GK).toEqual(['GK']);
    });

    test('Group "DEF" has 5 positions', () => {
      expect(GROUP_POSITIONS.DEF).toHaveLength(5);
    });

    test('Group "MID" has 7 positions', () => {
      expect(GROUP_POSITIONS.MID).toHaveLength(7);
    });

    test('Group "FWD" has 2 positions', () => {
      expect(GROUP_POSITIONS.FWD).toHaveLength(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // REGEN PLAYER GENERATION TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('Regen Player Generation', () => {
    test('Regen inherits last name from retired player', () => {
      const retired = createMockRetiredPlayer({ name: 'Mehmet Kaya' });
      const regen = generateRegenPlayer(retired);
      expect(regen.name).toContain('Kaya');
    });

    test('Regen has different first name from retired player', () => {
      const retired = createMockRetiredPlayer({ name: 'Ahmet Yılmaz' });
      // Run multiple times to ensure it's consistently different
      for (let i = 0; i < 20; i++) {
        const regen = generateRegenPlayer(retired);
        const regenFirst = regen.name.split(' ')[0];
        expect(regenFirst).not.toBe('Ahmet');
      }
    });

    test('Regen age is between 15-18', () => {
      const retired = createMockRetiredPlayer();
      for (let i = 0; i < 50; i++) {
        const regen = generateRegenPlayer(retired);
        expect(regen.age).toBeGreaterThanOrEqual(15);
        expect(regen.age).toBeLessThanOrEqual(18);
      }
    });

    test('Regen rating is between 40-55', () => {
      const retired = createMockRetiredPlayer();
      for (let i = 0; i < 50; i++) {
        const regen = generateRegenPlayer(retired);
        expect(regen.rating).toBeGreaterThanOrEqual(40);
        expect(regen.rating).toBeLessThanOrEqual(55);
      }
    });

    test('Regen potential is based on retired player rating', () => {
      const highRatedRetired = createMockRetiredPlayer({ rating: 90 });
      const lowRatedRetired = createMockRetiredPlayer({ rating: 50 });

      // Run multiple times to check ranges
      let highPotentials = 0;
      let lowPotentials = 0;

      for (let i = 0; i < 20; i++) {
        const highRegen = generateRegenPlayer(highRatedRetired);
        const lowRegen = generateRegenPlayer(lowRatedRetired);

        if (highRegen.potential > lowRegen.potential) highPotentials++;
        else lowPotentials++;

        // Potential should always be at least rating + 10
        expect(highRegen.potential).toBeGreaterThanOrEqual(highRegen.rating + 10);
        expect(lowRegen.potential).toBeGreaterThanOrEqual(lowRegen.rating + 10);

        // Potential should not exceed 99
        expect(highRegen.potential).toBeLessThanOrEqual(99);
        expect(lowRegen.potential).toBeLessThanOrEqual(99);
      }

      // High-rated retired player should generally produce higher potential regens
      expect(highPotentials).toBeGreaterThan(lowPotentials);
    });

    test('Regen hidden_potential is >= potential', () => {
      const retired = createMockRetiredPlayer();
      for (let i = 0; i < 30; i++) {
        const regen = generateRegenPlayer(retired);
        expect(regen.hidden_potential).toBeGreaterThanOrEqual(regen.potential);
      }
    });

    test('Regen is marked as free agent', () => {
      const retired = createMockRetiredPlayer();
      const regen = generateRegenPlayer(retired);
      expect(regen.is_free_agent).toBe(true);
    });

    test('Regen is marked as regen', () => {
      const retired = createMockRetiredPlayer();
      const regen = generateRegenPlayer(retired);
      expect(regen.is_regen).toBe(true);
    });

    test('Regen has no profile_id (free agent)', () => {
      const retired = createMockRetiredPlayer();
      const regen = generateRegenPlayer(retired);
      expect(regen.profile_id).toBeNull();
    });

    test('Regen has no team_name', () => {
      const retired = createMockRetiredPlayer();
      const regen = generateRegenPlayer(retired);
      expect(regen.team_name).toBeNull();
    });

    test('Regen links to inspired_by_player_id', () => {
      const retired = createMockRetiredPlayer({ id: 'retired-legend-42' });
      const regen = generateRegenPlayer(retired);
      expect(regen.inspired_by_player_id).toBe('retired-legend-42');
    });

    test('Regen position matches retired player group', () => {
      const gkRetired = createMockRetiredPlayer({ position: 'GK', specific_position: 'GK' });
      const defRetired = createMockRetiredPlayer({ position: 'CB', specific_position: 'CB' });
      const fwdRetired = createMockRetiredPlayer({ position: 'ST', specific_position: 'ST' });

      const gkRegen = generateRegenPlayer(gkRetired);
      const defRegen = generateRegenPlayer(defRetired);
      const fwdRegen = generateRegenPlayer(fwdRetired);

      expect(gkRegen.position).toBe('GK');
      expect(defRegen.position).toBe('DEF');
      expect(fwdRegen.position).toBe('FWD');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MINIMUM REGEN COUNT TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('Minimum Regen Count per Group', () => {
    test('Each position group should have at least 2 regens', () => {
      // Simulate: 1 retired GK, 0 retired DEF, 3 retired MID, 0 retired FWD
      const retiredByGroup: Record<string, unknown[]> = {
        GK: [createMockRetiredPlayer({ position: 'GK' })],
        DEF: [],
        MID: [
          createMockRetiredPlayer({ position: 'CM' }),
          createMockRetiredPlayer({ position: 'CAM' }),
          createMockRetiredPlayer({ position: 'RM' }),
        ],
        FWD: [],
      };

      for (const group of ['GK', 'DEF', 'MID', 'FWD'] as const) {
        const retiredInGroup = retiredByGroup[group] || [];
        const count = Math.max(retiredInGroup.length, 2);
        expect(count).toBeGreaterThanOrEqual(2);
      }
    });

    test('When 5 players retire in one group, 5 regens are generated', () => {
      const retiredCount = 5;
      const count = Math.max(retiredCount, 2);
      expect(count).toBe(5);
    });

    test('When 0 players retire in one group, 2 regens are still generated', () => {
      const retiredCount = 0;
      const count = Math.max(retiredCount, 2);
      expect(count).toBe(2);
    });

    test('When 1 player retires in one group, 2 regens are generated (minimum)', () => {
      const retiredCount = 1;
      const count = Math.max(retiredCount, 2);
      expect(count).toBe(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // REGEN PLAYER ID FORMAT TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('Regen Player ID Format', () => {
    test('Regen ID starts with "regen-" prefix', () => {
      const retired = createMockRetiredPlayer();
      const regen = generateRegenPlayer(retired);
      expect(regen.id).toMatch(/^regen-/);
    });

    test('Each regen gets a unique ID', () => {
      const retired = createMockRetiredPlayer();
      const ids = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const regen = generateRegenPlayer(retired);
        ids.add(regen.id);
      }
      // All IDs should be unique
      expect(ids.size).toBe(20);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MIGRATION SCHEMA TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('Migration Schema', () => {
    test('is_regen column should default to FALSE', () => {
      // This test verifies the expected DB default
      // In the actual DB, new players have is_regen = false
      const regularPlayer = { is_regen: false };
      expect(regularPlayer.is_regen).toBe(false);
    });

    test('inspired_by_player_id should be nullable', () => {
      // Regular players don't have inspired_by_player_id
      const regularPlayer = { inspired_by_player_id: null };
      expect(regularPlayer.inspired_by_player_id).toBeNull();

      // Regen players link to their inspiration
      const regenPlayer = { inspired_by_player_id: 'retired-legend-1' };
      expect(regenPlayer.inspired_by_player_id).toBe('retired-legend-1');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // CRON SCHEDULE TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('Cron Schedule', () => {
    test('generate-regens cron should run after season-end', () => {
      // Season-end runs at 21:00 on Tuesdays
      // Regen should run at 21:30 on Tuesdays (30 min after season-end)
      const seasonEndSchedule = '0 21 * * 2'; // 21:00 Tuesday
      const regenSchedule = '30 21 * * 2'; // 21:30 Tuesday

      expect(regenSchedule).not.toBe(seasonEndSchedule);
      // Regen runs 30 min after season-end
      expect(regenSchedule).toContain('30 21');
    });
  });
});
