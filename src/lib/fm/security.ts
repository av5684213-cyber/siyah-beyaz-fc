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

/**
 * Verify that a profileId exists in the profiles table AND
 * optionally that the profile owns a specific resource.
 *
 * This is a TEMPORARY solution until real Supabase Auth is integrated.
 * Currently the app uses localStorage UUID for identity, so we validate
 * that the profileId actually exists in the DB before allowing operations.
 *
 * @param supabase - Supabase client instance
 * @param profileId - The profileId from the request (claimed identity)
 * @param options.resourceTable - If provided, also check that this profile owns the resource
 * @param options.resourceId - The resource ID to check ownership of
 * @param options.resourceOwnerColumn - Column name in resource table that references profile (default: 'profile_id')
 * @returns { valid: boolean; profile: any; error?: string }
 */
export async function verifyProfileOwnership(
  supabase: any,
  profileId: string,
  options?: {
    resourceTable?: string;
    resourceId?: string;
    resourceOwnerColumn?: string;
  }
): Promise<{ valid: boolean; profile: any; error?: string; status?: number }> {
  // 1. Validate profileId format
  if (!isValidUserId(profileId)) {
    return { valid: false, profile: null, error: 'Geçersiz profil ID formatı', status: 400 };
  }

  // 2. Check that the profile exists in the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, team_name, money, role')
    .eq('id', profileId)
    .maybeSingle();

  if (profileError || !profile) {
    console.warn('[SECURITY] verifyProfileOwnership: Profile not found for id:', profileId);
    return { valid: false, profile: null, error: 'Profil bulunamadı', status: 404 };
  }

  // 3. If resource ownership check is requested
  if (options?.resourceTable && options?.resourceId) {
    const ownerCol = options.resourceOwnerColumn || 'profile_id';
    const { data: resource, error: resourceError } = await supabase
      .from(options.resourceTable)
      .select(ownerCol)
      .eq('id', options.resourceId)
      .maybeSingle();

    if (resourceError || !resource) {
      return { valid: false, profile: null, error: 'Kaynak bulunamadı', status: 404 };
    }

    if (resource[ownerCol] !== profileId) {
      console.warn('[SECURITY] verifyProfileOwnership: Resource ownership mismatch. Expected:', profileId, 'Got:', resource[ownerCol]);
      return { valid: false, profile: null, error: 'Bu kaynak üzerinde yetkiniz yok', status: 403 };
    }
  }

  return { valid: true, profile };
}

/**
 * Quick check that a profileId exists in the profiles table.
 * Lightweight version of verifyProfileOwnership without resource checks.
 */
export async function verifyProfileExists(
  supabase: any,
  profileId: string
): Promise<{ valid: boolean; profile: any; error?: string; status?: number }> {
  if (!isValidUserId(profileId)) {
    return { valid: false, profile: null, error: 'Geçersiz profil ID formatı', status: 400 };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, team_name, money, credits, role')
    .eq('id', profileId)
    .maybeSingle();

  if (error || !profile) {
    return { valid: false, profile: null, error: 'Profil bulunamadı', status: 404 };
  }

  return { valid: true, profile };
}

// ─── Rate Limiting (Supabase-backed, with in-memory fallback) ─────
// The implementation lives in supabaseRateLimit.ts so it can use the
// Supabase client directly. It is re-exported here for backward-
// compatible imports (e.g. `import { checkRateLimit } from '@/lib/fm/security'`).

export { checkRateLimit, cleanupRateLimits } from './supabaseRateLimit';

// Run periodic cleanup every 5 minutes (fire-and-forget — the function
// is async but we intentionally don't await the result in setInterval).
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    import('./supabaseRateLimit').then(({ cleanupRateLimits }) => cleanupRateLimits());
  }, 5 * 60 * 1000);
}

// ─── Cron Security ─────────────────────────────────────────────────
// verifyCronSecret (x-cron-secret header check) kaldırıldı.
// Tüm cron route'ları artık sadece Authorization: Bearer <CRON_SECRET> kullanıyor.
// Vercel cron standart olarak Authorization header'ı gönderir.

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
