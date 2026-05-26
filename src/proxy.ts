import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, cleanupRateLimits } from '@/lib/fm/supabaseRateLimit';

/**
 * Security Middleware
 * - Adds security headers to all responses
 * - Rate limits API endpoints using Supabase-backed rate limit logic
 *   (with in-memory fallback when Supabase is unavailable)
 * - Protects cron endpoints with stricter limits
 * - Protects auth endpoints with very strict limits
 */

// Run periodic cleanup every 5 minutes (fire-and-forget)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupRateLimits().catch(() => {});
  }, 5 * 60 * 1000);
}

// ─── Security Headers ──────────────────────────────────────────────

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'self' https://*.chatglm.site https://*.space-z.ai http://*.space-z.ai https://*.space.chatglm.site http://*.space.chatglm.site",
  ].join('; '),
};

// ─── Rate Limit Configuration ──────────────────────────────────────

const RATE_LIMITS: Record<string, { prefix: string; limit: number; windowMs: number; message: string }> = {
  cron: { prefix: 'cron:', limit: 10, windowMs: 60000, message: 'Cron rate limit aşıldı.' },
  auth: { prefix: 'auth:', limit: 5, windowMs: 60000, message: 'Çok fazla kayıt denemesi. Lütfen bekleyin.' },
  general: { prefix: '', limit: 60, windowMs: 60000, message: 'Çok fazla istek. Lütfen bekleyin.' },
};

// ─── Middleware Logic ──────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Add security headers to all responses
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // 2. Override CSP for page routes (non-API) to allow preview iframes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors *"
    );
    // Remove X-Frame-Options for page routes so preview iframes work
    // CSP frame-ancestors is the modern replacement
    response.headers.delete('X-Frame-Options');
  }

  // 3. API route protection
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // General rate limit: 60 requests per minute
    const generalCheck = await checkRateLimit(clientIp, RATE_LIMITS.general.limit, RATE_LIMITS.general.windowMs);
    if (!generalCheck.allowed) {
      return NextResponse.json(
        { error: RATE_LIMITS.general.message },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    // Stricter rate limits for specific endpoint types
    for (const config of Object.values(RATE_LIMITS)) {
      if (!config.prefix) continue; // Skip general (already applied)
      const pathSegment = config.prefix.replace(':', ''); // e.g. 'cron' or 'auth'
      if (request.nextUrl.pathname.startsWith(`/api/${pathSegment}`)) {
        const specificCheck = await checkRateLimit(`${config.prefix}${clientIp}`, config.limit, config.windowMs);
        if (!specificCheck.allowed) {
          return NextResponse.json(
            { error: config.message },
            { status: 429, headers: SECURITY_HEADERS }
          );
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/:path*',
  ],
};
