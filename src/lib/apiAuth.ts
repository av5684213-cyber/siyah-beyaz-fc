/**
 * BUG-18 Fix: Authenticated User ID Helper
 *
 * API routes previously accepted user_id directly from the request body or query params,
 * allowing anyone to spoof another user's identity. This module provides a centralized
 * function that prioritizes authenticated sources over user-supplied values.
 *
 * Priority:
 * 1. x-profile-id header (set by proxy middleware when Supabase Auth is configured)
 * 2. Fallback to body/query user_id (current behavior, to be removed when auth is fully integrated)
 *
 * TODO: BUG-18 — Remove the body fallback after Supabase Auth integration is complete.
 */

/**
 * Extracts an authenticated user ID from the request, falling back to a
 * caller-supplied value when auth headers are absent.
 *
 * @param request - The incoming Request/NextRequest object
 * @param fallbackUserId - The user_id extracted from request body or query params
 * @returns The authenticated user ID, or null if neither source provides one
 */
export function getAuthenticatedUserId(
  request: Request,
  fallbackUserId?: string | null
): string | null {
  // 1. Try authenticated header first (set by proxy middleware from Supabase Auth)
  const headerUserId = request.headers.get('x-profile-id');
  if (headerUserId) {
    return headerUserId;
  }

  // 2. Fallback to body/query user_id (current behavior, will be removed when auth is fully integrated)
  // TODO: BUG-18 — Remove this fallback after Supabase Auth integration
  if (fallbackUserId) {
    return fallbackUserId;
  }

  return null;
}

/**
 * Same as getAuthenticatedUserId but throws/returns a structured error response
 * when no user ID can be determined. Useful for routes that require authentication.
 *
 * @param request - The incoming Request/NextRequest object
 * @param fallbackUserId - The user_id extracted from request body or query params
 * @returns The authenticated user ID, or an error object with status and message
 */
export function requireAuthenticatedUserId(
  request: Request,
  fallbackUserId?: string | null
): { userId: string } | { error: true; message: string; status: number } {
  const userId = getAuthenticatedUserId(request, fallbackUserId);

  if (!userId) {
    return {
      error: true,
      message: 'Kimlik doğrulaması gerekli. Lütfen giriş yapın.',
      status: 401,
    };
  }

  return { userId };
}
