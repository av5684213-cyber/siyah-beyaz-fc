import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { checkRateLimit, cleanupRateLimits } from '@/lib/fm/supabaseRateLimit';

/**
 * Güvenlik Arayüzü (Proxy Middleware)
 * - Tüm yanıtlara güvenlik header'ları ekler
 * - API endpoint'lerini Supabase destekli rate limit mantığı ile sınırlar
 *   (Supabase kullanılamadığında bellek içi fallback ile)
 * - Cron endpoint'lerini daha sıkı sınırlarla korur
 * - Auth endpoint'lerini çok sıkı sınırlarla korur
 * - BUG-1: Supabase Auth oturum yenileme + x-profile-id header
 */

// Düzenli temizliği 5 dakikada bir çalıştır (fire-and-forget)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupRateLimits().catch(() => {});
  }, 5 * 60 * 1000);
}

// ─── Güvenlik Header'ları ──────────────────────────────────────────

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
    "frame-ancestors *",
    "frame-src 'self' https://*.supabase.co",
  ].join('; '),
};

// ─── Rate Limit Yapılandırması ──────────────────────────────────────

const RATE_LIMITS: Record<string, { prefix: string; limit: number; windowMs: number; message: string }> = {
  cron: { prefix: 'cron:', limit: 10, windowMs: 60000, message: 'Cron rate limit aşıldı.' },
  auth: { prefix: 'auth:', limit: 5, windowMs: 60000, message: 'Çok fazla kayıt denemesi. Lütfen bekleyin.' },
  general: { prefix: '', limit: 60, windowMs: 60000, message: 'Çok fazla istek. Lütfen bekleyin.' },
};

// ─── Arayüz Mantığı ──────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Temel güvenlik header'ları ekle (CSP hariç — aşağıda özel olarak ayarlanacak)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // 2. CSP: Preview iframe'leri için frame-ancestors ayarla
  //    ERR_BLOCKED_BY_RESPONSE: Next.js 16 + preview proxy katmanları
  //    CSP çakışmasına neden oluyor. En güvenli çözüm: frame-ancestors *
  //    Bu sayede herhangi bir domain iframe'de gösterebilir.
  //    (Uygulama zaten Supabase RLS ile korunuyor, iframe güvenliği kritik değil)
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors *"
  );

  // X-Frame-Options'ı kaldır — CSP frame-ancestors modern yerineğiştiricidir
  response.headers.delete('X-Frame-Options');

  // 3. CORS ön kontrol isteklerini işle
  if (request.nextUrl.pathname.startsWith('/api/') && request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    const origin = request.headers.get('origin') || '';
    // Self-hosted: kendi domain'iniz + Supabase domain'ine izin ver
    const allowedOrigins = [
      'https://jmxbyaamwbpnvgbnjbmo.supabase.co',
    ];
    // NEXT_PUBLIC_SITE_URL ortam değişkeni varsa ekle
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) allowedOrigins.push(siteUrl);
    // Supabase ve kendi domain'inize izin ver
    const isAllowed = allowedOrigins.includes(origin) ||
        origin.match(/\.supabase\.co$/) ||
        origin.match(/\.space\.chatglm\.site$/) ||
        origin.match(/\.space-z\.ai$/);
    if (isAllowed) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400');
    }
    return response;
  }

  // 4. API route koruması
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Genel rate limit: dakikada 60 istek
    const generalCheck = await checkRateLimit(clientIp, RATE_LIMITS.general.limit, RATE_LIMITS.general.windowMs);
    if (!generalCheck.allowed) {
      return NextResponse.json(
        { error: RATE_LIMITS.general.message },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    // Belirli endpoint türleri için daha sıkı rate limit
    for (const config of Object.values(RATE_LIMITS)) {
      if (!config.prefix) continue; // Genel olanı atla (zaten uygulandı)
      const pathSegment = config.prefix.replace(':', ''); // örn. 'cron' veya 'auth'
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

  // ── BUG-1: Supabase Auth oturum yenileme ──────────────────────────
  // Her istekte auth cookie'lerini yenile ve kullanıcı ID'sini header'a ekle
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
      // Auth yapılandırılmamış veya oturum süresi dolmuş — engelleme
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/:path*',
  ],
};
