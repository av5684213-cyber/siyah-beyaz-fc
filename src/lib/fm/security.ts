/**
 * Security Utilities
 * Input sanitization, auth helpers, rate limiting, validation
 */

// ─── Input Sanitization ────────────────────────────────────────────

/**
 * Strip HTML tags and dangerous characters from user input
 * Prevents XSS by removing <, >, &, ", ' and script-like patterns
 */
export function sanitizeInput(input: string, maxLength = 500): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .substring(0, maxLength)
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Encode dangerous characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Sanitize for LIKE/ILIKE patterns — escape % and _ wildcards
 */
export function sanitizeLikePattern(input: string): string {
  if (!input) return '';
  return input
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

/**
 * Validate that a string is a safe identifier (alphanumeric, dash, underscore)
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * Validate that a string looks like a UUID or our TEXT IDs
 */
export function isValidUserId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  // Allow UUID format or our custom text IDs (alphanumeric + dash + underscore + dot)
  return /^[a-zA-Z0-9._-]+$/.test(id) && id.length <= 128;
}

/**
 * Validate numeric input is within range
 */
export function isValidNumber(value: any, min: number, max: number): boolean {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validate message type is one of the allowed categories
 */
const VALID_MESSAGE_TYPES = ['general', 'trash_talk', 'transfer', 'alliance', 'friendly_invite', 'season_greeting'];

export function isValidMessageType(type: string): boolean {
  return VALID_MESSAGE_TYPES.includes(type);
}

/**
 * Validate match event type
 */
const VALID_MATCH_EVENT_TYPES = ['goal', 'yellow_card', 'red_card', 'injury', 'substitution', 'penalty', 'own_goal', 'var_check', 'half_time', 'full_time'];

export function isValidMatchEventType(type: string): boolean {
  return VALID_MATCH_EVENT_TYPES.includes(type);
}

// ─── Auth Helpers ──────────────────────────────────────────────────

/**
 * Check if a user ID matches the authenticated user
 * For server-side: compare against JWT-verified user ID
 */
export function isResourceOwner(resourceOwnerId: string, authenticatedUserId: string): boolean {
  return resourceOwnerId === authenticatedUserId;
}

/**
 * Verify admin access server-side
 * Uses the profile's role field, NOT client-side localStorage
 */
export function isAdminRole(profileRole: string | null | undefined): boolean {
  return profileRole === 'admin';
}

// ─── Rate Limiting (In-Memory, per-process) ────────────────────────

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter
 * Returns true if the request should be allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.resetTime - now };
}

/**
 * Clean up old rate limit entries periodically
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

// ─── Cron Security ─────────────────────────────────────────────────

/**
 * Verify cron secret from request header ONLY (not query params)
 * Fails closed if CRON_SECRET is not configured
 */
export function verifyCronSecret(request: Request): { valid: boolean; error?: string } {
  const CRON_SECRET = process.env.CRON_SECRET;

  if (!CRON_SECRET) {
    console.error('[SECURITY] CRON_SECRET not configured — rejecting cron request');
    return { valid: false, error: 'Server misconfigured' };
  }

  const providedSecret = request.headers.get('x-cron-secret');

  if (!providedSecret) {
    return { valid: false, error: 'Missing cron secret' };
  }

  if (providedSecret !== CRON_SECRET) {
    return { valid: false, error: 'Invalid cron secret' };
  }

  return { valid: true };
}

// ─── Error Sanitization ────────────────────────────────────────────

/**
 * Sanitize error messages for client responses
 * Never expose internal details, stack traces, or DB errors
 */
export function sanitizeError(err: unknown): string {
  // Log the full error server-side
  if (typeof console !== 'undefined') {
    console.error('[Server Error]', err);
  }

  // Return generic message to client
  return 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
}

// ─── Financial Validation ──────────────────────────────────────────

/**
 * Validate a monetary amount is reasonable
 */
export function isValidMonetaryAmount(amount: number, maxAmount = 10_000_000_000): boolean {
  return isValidNumber(amount, 0, maxAmount);
}

/**
 * Validate a player rating is within valid range
 */
export function isValidPlayerRating(rating: number): boolean {
  return isValidNumber(rating, 1, 99);
}

// ─── Column Whitelisting ───────────────────────────────────────────

/**
 * Filter an object to only include whitelisted keys
 * Prevents arbitrary column injection via spread operators
 */
export function whitelistColumns<T extends Record<string, any>>(
  obj: T,
  allowedKeys: string[]
): Partial<T> {
  const result: Record<string, any> = {};
  for (const key of allowedKeys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result as Partial<T>;
}
