/**
 * BUG-18 Test: API routes should use authenticated user ID, not request body
 *
 * These tests verify that the getAuthenticatedUserId helper:
 * 1. Prioritizes x-profile-id header over body/query user_id
 * 2. Falls back to body/query user_id when header is absent
 * 3. Returns null when neither source provides a user ID
 */

import { getAuthenticatedUserId, requireAuthenticatedUserId } from '@/lib/apiAuth';

// Minimal Request-like mock
function createMockRequest(headers: Record<string, string> = {}): Request {
  const h = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    h.set(key, value);
  }
  return new Request('http://localhost:3000/api/test', { headers: h });
}

describe('BUG-18: getAuthenticatedUserId', () => {
  it('should return the x-profile-id header value when present', () => {
    const request = createMockRequest({ 'x-profile-id': 'auth-user-123' });
    const result = getAuthenticatedUserId(request, 'body-user-456');
    expect(result).toBe('auth-user-123');
  });

  it('should fall back to body user_id when x-profile-id header is absent', () => {
    const request = createMockRequest();
    const result = getAuthenticatedUserId(request, 'body-user-456');
    expect(result).toBe('body-user-456');
  });

  it('should fall back to query param user_id when x-profile-id header is absent', () => {
    const request = createMockRequest();
    const result = getAuthenticatedUserId(request, 'query-user-789');
    expect(result).toBe('query-user-789');
  });

  it('should return null when neither header nor body/query provides a user ID', () => {
    const request = createMockRequest();
    const result = getAuthenticatedUserId(request);
    expect(result).toBeNull();
  });

  it('should return null when body user_id is empty string', () => {
    const request = createMockRequest();
    const result = getAuthenticatedUserId(request, '');
    expect(result).toBeNull();
  });

  it('should return null when body user_id is null', () => {
    const request = createMockRequest();
    const result = getAuthenticatedUserId(request, null);
    expect(result).toBeNull();
  });

  it('should prioritize header even when body user_id is provided', () => {
    const request = createMockRequest({ 'x-profile-id': 'auth-user-123' });
    const result = getAuthenticatedUserId(request, 'spoofed-user-999');
    expect(result).toBe('auth-user-123');
  });

  it('should use header value even if body user_id is different (anti-spoofing)', () => {
    const request = createMockRequest({ 'x-profile-id': 'real-user-1' });
    // Attacker tries to spoof a different user_id in the body
    const result = getAuthenticatedUserId(request, 'victim-user-2');
    expect(result).toBe('real-user-1');
  });
});

describe('BUG-18: requireAuthenticatedUserId', () => {
  it('should return userId when header is present', () => {
    const request = createMockRequest({ 'x-profile-id': 'auth-user-123' });
    const result = requireAuthenticatedUserId(request);
    expect(result).toEqual({ userId: 'auth-user-123' });
  });

  it('should return userId when fallback is provided', () => {
    const request = createMockRequest();
    const result = requireAuthenticatedUserId(request, 'fallback-user');
    expect(result).toEqual({ userId: 'fallback-user' });
  });

  it('should return error object when no user ID is available', () => {
    const request = createMockRequest();
    const result = requireAuthenticatedUserId(request);
    expect(result).toEqual({
      error: true,
      message: 'Kimlik doğrulaması gerekli. Lütfen giriş yapın.',
      status: 401,
    });
  });

  it('should return error object when fallback is empty string', () => {
    const request = createMockRequest();
    const result = requireAuthenticatedUserId(request, '');
    expect(result).toEqual({
      error: true,
      message: 'Kimlik doğrulaması gerekli. Lütfen giriş yapın.',
      status: 401,
    });
  });
});
