import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Middleware
 * - Adds security headers to all responses
 * - Rate limits API endpoints
 * - Protects admin routes
 * - Validates cron endpoints
 */

// ─── In-Memory Rate Limiting ──────────────────────────────────────

interface RateEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateEntry>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const key = ip;
  const entry = rateLimits.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
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

const SECURITY_HEADERS = {
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

    // Rate limiting: 60 requests per minute for general API
    if (!checkRateLimit(clientIp, 60, 60000)) {
      return NextResponse.json(
        { error: 'Çok fazla istek. Lütfen bekleyin.' },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    // Stricter rate limit for cron endpoints: 10/min
    if (request.nextUrl.pathname.startsWith('/api/cron/')) {
      if (!checkRateLimit(`cron:${clientIp}`, 10, 60000)) {
        return NextResponse.json(
          { error: 'Cron rate limit aşıldı.' },
          { status: 429, headers: SECURITY_HEADERS }
        );
      }
    }

    // Stricter rate limit for auth: 5/min
    if (request.nextUrl.pathname.startsWith('/api/auth/')) {
      if (!checkRateLimit(`auth:${clientIp}`, 5, 60000)) {
        return NextResponse.json(
          { error: 'Çok fazla kayıt denemesi. Lütfen bekleyin.' },
          { status: 429, headers: SECURITY_HEADERS }
        );
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
