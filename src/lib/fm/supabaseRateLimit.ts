/**
 * Supabase-based Rate Limiter
 *
 * Persists rate limit state in the database so it works across serverless
 * instances and process restarts. Falls back to in-memory when Supabase is
 * unavailable.
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface RateLimitEntry {
  key: string;
  count: number;
  reset_time: number;
}

// ─── In-Memory Fallback ───────────────────────────────────────────
// Used when Supabase is not configured or unreachable.

const memoryFallback = new Map<string, RateLimitEntry>();

function memoryFallbackCheck(
  key: string,
  maxRequests: number,
  windowMs: number,
  now: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const entry = memoryFallback.get(key);
  const resetTime = now + windowMs;

  if (!entry || now > entry.reset_time) {
    memoryFallback.set(key, { key, count: 1, reset_time: resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.reset_time - now };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.reset_time - now };
}

// ─── Primary: Supabase-backed Rate Limiter ────────────────────────

/**
 * Check whether a request identified by `key` is within the allowed rate.
 *
 * Tries Supabase first; on any error or missing configuration it gracefully
 * falls back to the in-memory store so the request is never blocked by an
 * infrastructure issue.
 *
 * @param key        Unique identifier (e.g. `register:1.2.3.4`)
 * @param maxRequests  Maximum allowed requests in the window (default 10)
 * @param windowMs     Window length in milliseconds (default 60 000)
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now();
  const resetTime = now + windowMs;

  // Fast path: if Supabase is not configured at all, use memory fallback
  if (!isSupabaseConfigured()) {
    return memoryFallbackCheck(key, maxRequests, windowMs, now);
  }

  try {
    const supabase = getSupabase();
    if (!supabase) {
      return memoryFallbackCheck(key, maxRequests, windowMs, now);
    }

    // Fetch current entry
    const { data, error } = await supabase
      .from('rate_limits')
      .select('count, reset_time')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.warn('[RateLimit] Supabase error, falling back to memory:', error.message);
      return memoryFallbackCheck(key, maxRequests, windowMs, now);
    }

    // New window or expired entry — upsert fresh
    if (!data || now > data.reset_time) {
      await supabase
        .from('rate_limits')
        .upsert({ key, count: 1, reset_time: resetTime }, { onConflict: 'key' });
      return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
    }

    // Rate limit exceeded
    if (data.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetIn: data.reset_time - now };
    }

    // Within limits — increment count
    await supabase
      .from('rate_limits')
      .update({ count: data.count + 1 })
      .eq('key', key);

    return {
      allowed: true,
      remaining: maxRequests - data.count - 1,
      resetIn: data.reset_time - now,
    };
  } catch (err) {
    console.warn('[RateLimit] Exception, falling back to memory:', err);
    return memoryFallbackCheck(key, maxRequests, windowMs, now);
  }
}

// ─── Cleanup ──────────────────────────────────────────────────────

/**
 * Remove expired rate-limit rows from Supabase and the in-memory fallback.
 * Intended to be called periodically (e.g. via setInterval or a cron job).
 */
export async function cleanupRateLimits(): Promise<void> {
  const now = Date.now();

  // Clean Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('rate_limits').delete().lt('reset_time', now);
      }
    } catch {
      // Silent — cleanup is best-effort
    }
  }

  // Clean memory fallback
  for (const [key, entry] of memoryFallback.entries()) {
    if (now > entry.reset_time) {
      memoryFallback.delete(key);
    }
  }
}
