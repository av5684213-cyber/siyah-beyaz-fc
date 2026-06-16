import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { checkRateLimit, cleanupRateLimits } from '@/lib/fm/supabaseRateLimit';

/**
 * Middleware — Auth oturum yenileme + güvenlik header'ları + rate limit
 *
 * - Her istekte Supabase Auth cookie'lerini yeniler
 * - x-profile-id header'ını ayarlar (API route'lar için)
 * - Güvenlik header'ları ekler
 * - API route'larını rate limit ile korur
 * - Auth gerekmeyen sayfalarda (login, register, api/auth) oturum kontrolü yapmaz
 */

// Düzenli temizliği 5 dakikada bir çalıştır (fire-and-forget)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupRateLimits().catch(() => {});
  }, 5 * 60 * 1000);
}

// Auth gerekmeyen sayfalar
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/api/auth/',
  '/api/cron/',
  '/api/admin/',
  '/_next/',
  '/favicon',
  '/manifest.json',
  '/sw.js',
  '/workbox-',
  '/icons/',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p));
}

// Rate limit yapılandırması
const RATE_LIMITS: Record<string, { prefix: string; limit: number; windowMs: number; message: string }> = {
  cron: { prefix: 'cron:', limit: 10, windowMs: 60000, message: 'Cron rate limit aşıldı.' },
  auth: { prefix: 'auth:', limit: 5, windowMs: 60000, message: 'Çok fazla kayıt denemesi. Lütfen bekleyin.' },
  general: { prefix: '', limit: 60, windowMs: 60000, message: 'Çok fazla istek. Lütfen bekleyin.' },
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Güvenlik header'ları
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', 'frame-ancestors *');
  response.headers.delete('X-Frame-Options');

  // 2. CORS ön kontrol istekleri
  if (request.nextUrl.pathname.startsWith('/api/') && request.method === 'OPTIONS') {
    const corsResponse = new NextResponse(null, { status: 204 });
    const origin = request.headers.get('origin') || '';
    const allowedOrigins = ['https://jmxbyaamwbpnvgbnjbmo.supabase.co'];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) allowedOrigins.push(siteUrl);

    const isAllowed = allowedOrigins.includes(origin) ||
      origin.match(/\.supabase\.co$/) ||
      origin.match(/\.space\.chatglm\.site$/) ||
      origin.match(/\.space-z\.ai$/);

    if (isAllowed) {
      corsResponse.headers.set('Access-Control-Allow-Origin', origin);
      corsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-profile-id');
      corsResponse.headers.set('Access-Control-Max-Age', '86400');
    }
    return corsResponse;
  }

  // 3. API route rate limit
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const generalCheck = await checkRateLimit(clientIp, RATE_LIMITS.general.limit, RATE_LIMITS.general.windowMs);
    if (!generalCheck.allowed) {
      return NextResponse.json(
        { error: RATE_LIMITS.general.message },
        { status: 429 }
      );
    }

    for (const config of Object.values(RATE_LIMITS)) {
      if (!config.prefix) continue;
      const pathSegment = config.prefix.replace(':', '');
      if (request.nextUrl.pathname.startsWith(`/api/${pathSegment}`)) {
        const specificCheck = await checkRateLimit(`${config.prefix}${clientIp}`, config.limit, config.windowMs);
        if (!specificCheck.allowed) {
          return NextResponse.json(
            { error: config.message },
            { status: 429 }
          );
        }
      }
    }
  }

  // 4. Supabase Auth oturum yenileme + x-profile-id header
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey && supabaseUrl.includes('.supabase.co')) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        response.headers.set('x-profile-id', user.id);
      }
    } catch {
      // Auth yapılandırılmamış veya oturum süresi dolmuş
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/:path*',
  ],
};
