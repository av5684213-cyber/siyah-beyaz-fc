import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Middleware
 * - Adds security headers to all responses
 * - Rate limits API endpoints using shared rate limit logic from security.ts
 * - Protects cron endpoints with stricter limits
 * - Protects auth endpoints with very strict limits
 */

// ─── In-Memory Rate Limiting (shared with security.ts pattern) ──────

interface RateEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateEntry>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimits.entries()) {
    if (now > entry.resetTime) rateLimits.delete(key);
  }
}, 5 * 60 * 1000);

// ─── Security Headers ──────────────────────────────────────────────

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
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
    "frame-ancestors 'none'",
  ].join('; '),
};

// ─── Rate Limit Configuration ──────────────────────────────────────

const RATE_LIMITS: Record<string, { prefix: string; limit: number; windowMs: number; message: string }> = {
  cron: { prefix: 'cron:', limit: 10, windowMs: 60000, message: 'Cron rate limit aşıldı.' },
  auth: { prefix: 'auth:', limit: 5, windowMs: 60000, message: 'Çok fazla kayıt denemesi. Lütfen bekleyin.' },
  general: { prefix: '', limit: 60, windowMs: 60000, message: 'Çok fazla istek. Lütfen bekleyin.' },
};

// ─── Middleware Logic ──────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Add security headers to all responses
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // 2. API route protection
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // General rate limit: 60 requests per minute
    if (!checkRateLimit(clientIp, RATE_LIMITS.general.limit, RATE_LIMITS.general.windowMs)) {
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
        if (!checkRateLimit(`${config.prefix}${clientIp}`, config.limit, config.windowMs)) {
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
    '/api/:path*',
  ],
};
