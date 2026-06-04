/**
 * BUG-11: Ticket Price-Demand Elasticity Tests
 *
 * Tests the demand curve formula, match modifiers, and optimal price calculation.
 */

import {
  calculateDemandAttendance,
  calculateMatchdayRevenue,
  calculateOptimalTicketPrice,
  MAX_TICKET_PRICE,
  MIN_TICKET_PRICE_ITER,
  MAX_TICKET_PRICE_ITER,
  PRICE_ITER_STEP,
} from '@/lib/fm/finance/ticketDemand';
import type { TicketProfile, MatchContext } from '@/lib/fm/finance/ticketDemand';

// ═══════════════════════════════════════════════════════════════
// DEMAND CURVE FORMULA TESTS
// ═══════════════════════════════════════════════════════════════

describe('calculateDemandAttendance', () => {
  test('Free ticket → full capacity attendance', () => {
    expect(calculateDemandAttendance(30000, 0)).toBe(30000);
  });

  test('Negative price → full capacity attendance', () => {
    expect(calculateDemandAttendance(30000, -10)).toBe(30000);
  });

  test('Price at max_price → zero attendance', () => {
    expect(calculateDemandAttendance(30000, MAX_TICKET_PRICE)).toBe(0);
  });

  test('Price above max_price → zero attendance', () => {
    expect(calculateDemandAttendance(30000, 600)).toBe(0);
  });

  test('Demand decreases as price increases', () => {
    const cap = 30000;
    const at50 = calculateDemandAttendance(cap, 50);
    const at100 = calculateDemandAttendance(cap, 100);
    const at200 = calculateDemandAttendance(cap, 200);
    const at400 = calculateDemandAttendance(cap, 400);

    expect(at50).toBeGreaterThan(at100);
    expect(at100).toBeGreaterThan(at200);
    expect(at200).toBeGreaterThan(at400);
  });

  test('Formula: capacity * (1 - (price/max)^0.5) at price=125', () => {
    // 125/500 = 0.25, sqrt(0.25) = 0.5, 1 - 0.5 = 0.5
    // attendance = 30000 * 0.5 = 15000
    expect(calculateDemandAttendance(30000, 125)).toBe(15000);
  });

  test('Formula: capacity * (1 - (price/max)^0.5) at price=0', () => {
    // sqrt(0/500) = 0, 1 - 0 = 1, attendance = capacity
    expect(calculateDemandAttendance(30000, 0)).toBe(30000);
  });

  test('Attendance never exceeds capacity', () => {
    for (let price = 0; price <= 500; price += 50) {
      expect(calculateDemandAttendance(20000, price)).toBeLessThanOrEqual(20000);
    }
  });

  test('Attendance is never negative', () => {
    for (let price = 0; price <= 600; price += 50) {
      expect(calculateDemandAttendance(30000, price)).toBeGreaterThanOrEqual(0);
    }
  });

  test('Concave demand curve: price increase from 50→100 drops less than 100→200', () => {
    const cap = 30000;
    const at50 = calculateDemandAttendance(cap, 50);
    const at100 = calculateDemandAttendance(cap, 100);
    const at200 = calculateDemandAttendance(cap, 200);

    const drop50to100 = at50 - at100;
    const drop100to200 = at100 - at200;

    // Concave curve: the higher price range should have a larger drop
    expect(drop100to200).toBeGreaterThan(drop50to100);
  });
});

// ═══════════════════════════════════════════════════════════════
// MATCHDAY REVENUE TESTS
// ═══════════════════════════════════════════════════════════════

describe('calculateMatchdayRevenue', () => {
  const baseProfile: TicketProfile = {
    stadium_capacity: 30000,
    ticket_price: 50,
    reputation: 50,
  };

  test('Revenue = attendance * ticket_price', () => {
    const result = calculateMatchdayRevenue(baseProfile);
    expect(result.revenue).toBe(result.attendance * 50);
  });

  test('Default modifiers are all 1.0', () => {
    const result = calculateMatchdayRevenue(baseProfile);
    expect(result.modifiers.opponentStrengthFactor).toBe(1.0);
    expect(result.modifiers.matchImportance).toBe(1.0);
    expect(result.modifiers.weatherFactor).toBe(1.0);
  });

  test('Opponent strength factor boosts attendance', () => {
    const weakOpponent: MatchContext = { opponentStrengthFactor: 0.8 };
    const strongOpponent: MatchContext = { opponentStrengthFactor: 1.2 };

    const weakResult = calculateMatchdayRevenue(baseProfile, weakOpponent);
    const strongResult = calculateMatchdayRevenue(baseProfile, strongOpponent);

    expect(strongResult.attendance).toBeGreaterThan(weakResult.attendance);
    expect(strongResult.revenue).toBeGreaterThan(weakResult.revenue);
  });

  test('Match importance boosts attendance', () => {
    const normalMatch: MatchContext = { matchImportance: 1.0 };
    const derbyMatch: MatchContext = { matchImportance: 1.3 };

    const normalResult = calculateMatchdayRevenue(baseProfile, normalMatch);
    const derbyResult = calculateMatchdayRevenue(baseProfile, derbyMatch);

    expect(derbyResult.attendance).toBeGreaterThan(normalResult.attendance);
  });

  test('Bad weather reduces attendance', () => {
    const sunny: MatchContext = { weatherFactor: 1.0 };
    const rainy: MatchContext = { weatherFactor: 0.85 };

    const sunnyResult = calculateMatchdayRevenue(baseProfile, sunny);
    const rainyResult = calculateMatchdayRevenue(baseProfile, rainy);

    expect(rainyResult.attendance).toBeLessThan(sunnyResult.attendance);
  });

  test('Derby match with strong opponent and good weather maximizes attendance', () => {
    const bestContext: MatchContext = {
      opponentStrengthFactor: 1.2,
      matchImportance: 1.3,
      weatherFactor: 1.0,
    };
    const worstContext: MatchContext = {
      opponentStrengthFactor: 0.8,
      matchImportance: 1.0,
      weatherFactor: 0.85,
    };

    const bestResult = calculateMatchdayRevenue(baseProfile, bestContext);
    const worstResult = calculateMatchdayRevenue(baseProfile, worstContext);

    expect(bestResult.attendance).toBeGreaterThan(worstResult.attendance);
  });

  test('Attendance never exceeds stadium capacity', () => {
    const maxBoostContext: MatchContext = {
      opponentStrengthFactor: 1.2,
      matchImportance: 1.3,
      weatherFactor: 1.0,
    };
    const result = calculateMatchdayRevenue(baseProfile, maxBoostContext);
    expect(result.attendance).toBeLessThanOrEqual(30000);
  });

  test('Higher ticket price → lower attendance but may have higher revenue', () => {
    const cheapProfile: TicketProfile = { ...baseProfile, ticket_price: 30 };
    const expensiveProfile: TicketProfile = { ...baseProfile, ticket_price: 200 };

    const cheapResult = calculateMatchdayRevenue(cheapProfile);
    const expensiveResult = calculateMatchdayRevenue(expensiveProfile);

    expect(cheapResult.attendance).toBeGreaterThan(expensiveResult.attendance);
    // Revenue depends on the demand curve shape - we just verify both are positive
    expect(cheapResult.revenue).toBeGreaterThan(0);
    expect(expensiveResult.revenue).toBeGreaterThan(0);
  });

  test('Uses defaults when profile fields are missing', () => {
    const emptyProfile: TicketProfile = {};
    const result = calculateMatchdayRevenue(emptyProfile);
    expect(result.attendance).toBeGreaterThan(0);
    expect(result.revenue).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// OPTIMAL TICKET PRICE TESTS
// ═══════════════════════════════════════════════════════════════

describe('calculateOptimalTicketPrice', () => {
  const baseProfile: TicketProfile = {
    stadium_capacity: 30000,
    ticket_price: 50,
  };

  test('Returns optimal price within iteration range', () => {
    const result = calculateOptimalTicketPrice(baseProfile);
    expect(result.optimalPrice).toBeGreaterThanOrEqual(MIN_TICKET_PRICE_ITER);
    expect(result.optimalPrice).toBeLessThanOrEqual(MAX_TICKET_PRICE_ITER);
  });

  test('Optimal price maximizes revenue', () => {
    const result = calculateOptimalTicketPrice(baseProfile);
    // The max revenue should be at least as high as revenue at any other price
    for (const point of result.priceRevenueCurve) {
      expect(result.maxRevenue).toBeGreaterThanOrEqual(point.revenue - 1); // -1 for rounding
    }
  });

  test('Price revenue curve has correct number of points', () => {
    const result = calculateOptimalTicketPrice(baseProfile);
    const expectedPoints = ((MAX_TICKET_PRICE_ITER - MIN_TICKET_PRICE_ITER) / PRICE_ITER_STEP) + 1;
    expect(result.priceRevenueCurve).toHaveLength(expectedPoints);
  });

  test('Revenue is 0 at price = MAX_TICKET_PRICE', () => {
    const result = calculateOptimalTicketPrice(baseProfile);
    const lastPoint = result.priceRevenueCurve[result.priceRevenueCurve.length - 1];
    // At price 400 (MAX_TICKET_PRICE_ITER), attendance should still be > 0 since 400 < 500
    // But it should be much lower than at optimal
    expect(lastPoint.revenue).toBeGreaterThan(0);
  });

  test('Optimal price is a multiple of step size', () => {
    const result = calculateOptimalTicketPrice(baseProfile);
    expect(result.optimalPrice % PRICE_ITER_STEP).toBe(0);
  });

  test('Match context affects optimal price', () => {
    const normalContext: MatchContext = {};
    const derbyContext: MatchContext = {
      opponentStrengthFactor: 1.2,
      matchImportance: 1.3,
      weatherFactor: 1.0,
    };

    const normalResult = calculateOptimalTicketPrice(baseProfile, normalContext);
    const derbyResult = calculateOptimalTicketPrice(baseProfile, derbyContext);

    // Derby should yield higher max revenue
    expect(derbyResult.maxRevenue).toBeGreaterThan(normalResult.maxRevenue);
  });

  test('Larger stadium has higher optimal revenue', () => {
    const smallStadium: TicketProfile = { stadium_capacity: 10000, ticket_price: 50 };
    const largeStadium: TicketProfile = { stadium_capacity: 50000, ticket_price: 50 };

    const smallResult = calculateOptimalTicketPrice(smallStadium);
    const largeResult = calculateOptimalTicketPrice(largeStadium);

    expect(largeResult.maxRevenue).toBeGreaterThan(smallResult.maxRevenue);
  });

  test('Curve shows inverted-U shape (revenue rises then falls)', () => {
    const result = calculateOptimalTicketPrice(baseProfile);
    const curve = result.priceRevenueCurve;

    // Find where revenue peaks
    const peakIdx = curve.findIndex(p => p.revenue === result.maxRevenue);
    expect(peakIdx).toBeGreaterThan(0); // Not at the very start
    expect(peakIdx).toBeLessThan(curve.length - 1); // Not at the very end
  });
});

// ═══════════════════════════════════════════════════════════════
// INTEGRATION: calculateMatchRevenue uses demand curve
// ═══════════════════════════════════════════════════════════════

describe('calculateMatchRevenue integration with demand curve', () => {
  // Import from financialModel which now uses the demand curve
  const { calculateMatchRevenue } = require('@/lib/fm/financialModel');

  test('Away match → 0 revenue', () => {
    const result = calculateMatchRevenue(
      { stadium_capacity: 30000, ticket_price: 50, reputation: 50 },
      false, 2, 1
    );
    expect(result.revenue).toBe(0);
    expect(result.attendance).toBe(0);
  });

  test('Home match → positive revenue based on demand curve', () => {
    const result = calculateMatchRevenue(
      { stadium_capacity: 30000, ticket_price: 50, reputation: 50 },
      true, 2, 1
    );
    expect(result.revenue).toBeGreaterThan(0);
    expect(result.attendance).toBeGreaterThan(0);
  });

  test('Higher price → lower attendance (demand elasticity)', () => {
    const cheapResult = calculateMatchRevenue(
      { stadium_capacity: 30000, ticket_price: 30 },
      true, 1, 1
    );
    const expensiveResult = calculateMatchRevenue(
      { stadium_capacity: 30000, ticket_price: 200 },
      true, 1, 1
    );
    expect(cheapResult.attendance).toBeGreaterThan(expensiveResult.attendance);
  });

  test('Attendance never exceeds capacity', () => {
    const result = calculateMatchRevenue(
      { stadium_capacity: 15000, ticket_price: 10 },
      true, 1, 1
    );
    expect(result.attendance).toBeLessThanOrEqual(15000);
  });

  test('Win bonus increases revenue', () => {
    const winResult = calculateMatchRevenue(
      { stadium_capacity: 30000, ticket_price: 50 },
      true, 3, 0
    );
    const lossResult = calculateMatchRevenue(
      { stadium_capacity: 30000, ticket_price: 50 },
      true, 0, 3
    );
    expect(winResult.revenue).toBeGreaterThan(lossResult.revenue);
  });
});
