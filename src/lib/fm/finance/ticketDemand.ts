// ═══════════════════════════════════════════════════════════════════
//  Managerium — Ticket Price-Demand Elasticity System
//  BUG-11: Implements demand curve for matchday revenue
// ═══════════════════════════════════════════════════════════════════

// ─── Constants ────────────────────────────────────────────────────

/** Maximum ticket price beyond which demand drops to zero */
export const MAX_TICKET_PRICE = 500;

/** Minimum ticket price for iteration */
export const MIN_TICKET_PRICE_ITER = 10;

/** Maximum ticket price for iteration */
export const MAX_TICKET_PRICE_ITER = 400;

/** Step size for price iteration */
export const PRICE_ITER_STEP = 10;

// ─── Match Context Modifiers ──────────────────────────────────────

export interface MatchContext {
  /** Opponent strength factor: 0.8 (weak) to 1.2 (strong) */
  opponentStrengthFactor?: number;
  /** Match importance: 1.0 for normal, 1.3 for derby/title match */
  matchImportance?: number;
  /** Weather factor: 0.85 for rain/snow, 1.0 for sunny */
  weatherFactor?: number;
}

// ─── Profile Interface ────────────────────────────────────────────

export interface TicketProfile {
  stadium_capacity?: number;
  ticket_price?: number;
  reputation?: number;
  stadium_upgrades?: Record<string, number>;
}

// ─── Core Demand Curve ────────────────────────────────────────────

/**
 * Calculates attendance using a demand curve formula.
 *
 * Formula: attendance = stadium_capacity * (1 - (ticket_price / max_price) ^ 0.5)
 *
 * The square root creates a concave demand curve where:
 * - Low prices have relatively high demand (inelastic region)
 * - High prices drop demand more steeply (elastic region)
 *
 * @param stadiumCapacity  Stadium capacity
 * @param ticketPrice      Current ticket price
 * @param maxPrice         Maximum price where demand = 0 (default 500)
 * @returns Expected attendance (can be 0 if price >= maxPrice)
 */
export function calculateDemandAttendance(
  stadiumCapacity: number,
  ticketPrice: number,
  maxPrice: number = MAX_TICKET_PRICE,
): number {
  if (ticketPrice <= 0) return stadiumCapacity;
  if (ticketPrice >= maxPrice) return 0;

  const demandFactor = 1 - Math.pow(ticketPrice / maxPrice, 0.5);
  const attendance = Math.floor(stadiumCapacity * demandFactor);

  return Math.max(0, Math.min(stadiumCapacity, attendance));
}

/**
 * Calculates matchday revenue with demand curve and match context modifiers.
 *
 * Attendance = capacity * (1 - (price/max_price)^0.5) * opponentFactor * matchImportance * weatherFactor
 * Revenue = attendance * ticket_price
 *
 * @param profile    Team profile with stadium_capacity and ticket_price
 * @param matchContext  Match context modifiers (opponent, importance, weather)
 * @returns Object with attendance, revenue, and breakdown of modifiers
 */
export function calculateMatchdayRevenue(
  profile: TicketProfile,
  matchContext: MatchContext = {},
): {
  attendance: number;
  revenue: number;
  baseAttendance: number;
  modifiedAttendance: number;
  modifiers: {
    opponentStrengthFactor: number;
    matchImportance: number;
    weatherFactor: number;
  };
} {
  const capacity = profile.stadium_capacity ?? 15000;
  const ticketPrice = profile.ticket_price ?? 50;

  // Apply default modifier values
  const opponentStrengthFactor = matchContext.opponentStrengthFactor ?? 1.0;
  const matchImportance = matchContext.matchImportance ?? 1.0;
  const weatherFactor = matchContext.weatherFactor ?? 1.0;

  // Base attendance from demand curve
  const baseAttendance = calculateDemandAttendance(capacity, ticketPrice);

  // Apply all modifiers
  const totalModifier = opponentStrengthFactor * matchImportance * weatherFactor;
  const modifiedAttendance = Math.floor(baseAttendance * totalModifier);

  // Clamp to stadium capacity
  const finalAttendance = Math.max(0, Math.min(capacity, modifiedAttendance));

  // Revenue = attendance × ticket price
  const revenue = finalAttendance * ticketPrice;

  return {
    attendance: finalAttendance,
    revenue,
    baseAttendance,
    modifiedAttendance,
    modifiers: {
      opponentStrengthFactor,
      matchImportance,
      weatherFactor,
    },
  };
}

/**
 * Finds the ticket price that maximizes revenue using simple iteration.
 * Tries prices from 10 to 400 in steps of 10.
 *
 * @param profile      Team profile with stadium_capacity
 * @param matchContext  Match context modifiers
 * @returns Optimal price, max revenue, and attendance at that price
 */
export function calculateOptimalTicketPrice(
  profile: TicketProfile,
  matchContext: MatchContext = {},
): {
  optimalPrice: number;
  maxRevenue: number;
  attendanceAtOptimal: number;
  priceRevenueCurve: Array<{ price: number; revenue: number; attendance: number }>;
} {
  const capacity = profile.stadium_capacity ?? 15000;
  let bestPrice = MIN_TICKET_PRICE_ITER;
  let bestRevenue = 0;
  let bestAttendance = 0;
  const priceRevenueCurve: Array<{ price: number; revenue: number; attendance: number }> = [];

  for (let price = MIN_TICKET_PRICE_ITER; price <= MAX_TICKET_PRICE_ITER; price += PRICE_ITER_STEP) {
    const tempProfile: TicketProfile = { ...profile, ticket_price: price, stadium_capacity: capacity };
    const result = calculateMatchdayRevenue(tempProfile, matchContext);
    priceRevenueCurve.push({
      price,
      revenue: result.revenue,
      attendance: result.attendance,
    });

    if (result.revenue > bestRevenue) {
      bestRevenue = result.revenue;
      bestPrice = price;
      bestAttendance = result.attendance;
    }
  }

  return {
    optimalPrice: bestPrice,
    maxRevenue: bestRevenue,
    attendanceAtOptimal: bestAttendance,
    priceRevenueCurve,
  };
}
