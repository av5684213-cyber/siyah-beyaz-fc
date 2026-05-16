/**
 * API Hata Yakalama Yardımcısı
 *
 * Tüm API route'larında kullanılacak standart try/catch ve hata loglama.
 * Hata durumlarında kullanıcı dostu mesaj döndürür ve Supabase error_logs tablosuna kaydeder.
 */

import { NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════
// Kullanıcı dostu hata mesajı
// ═══════════════════════════════════════════════════════════════

const USER_FRIENDLY_ERROR = 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';

// ═══════════════════════════════════════════════════════════════
// Supabase error_logs tablosuna hata kaydet
// ═══════════════════════════════════════════════════════════════

export async function logErrorToSupabase(
  error: unknown,
  context: {
    route: string;
    method?: string;
    userId?: string;
    requestBody?: string;
  }
): Promise<void> {
  try {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Service role ile kaydet (anon key ile çalışmayabilir — sessizce devam et)
    await supabase.from('error_logs').insert({
      error_message: errorMessage.slice(0, 1000),
      error_stack: errorStack ? errorStack.slice(0, 5000) : null,
      route: context.route,
      method: context.method || 'GET',
      user_id: context.userId || null,
      request_body: context.requestBody ? context.requestBody.slice(0, 2000) : null,
      created_at: new Date().toISOString(),
    });
  } catch (logErr) {
    // Logging hatası olursa sessizce devam et — ana akışı kesme
    console.error('[logErrorToSupabase] Logging error:', logErr);
  }
}

// ═══════════════════════════════════════════════════════════════
// Standart hata yanıtı oluştur
// ═══════════════════════════════════════════════════════════════

export function createErrorResponse(
  error: unknown,
  context: {
    route: string;
    method?: string;
    userId?: string;
    statusCode?: number;
  }
): NextResponse {
  const statusCode = context.statusCode || 500;
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Sunucu tarafında logla
  console.error(`[${context.route}] Error (${context.method || 'GET'}):`, errorMessage);

  // Supabase'e kaydet (asenkron, bekleme)
  logErrorToSupabase(error, context).catch(() => {
    // Hata loglama başarısız olursa sessizce devam et
  });

  // Kullanıcıya dostu mesaj döndür
  return NextResponse.json(
    {
      error: true,
      message: statusCode === 500 ? USER_FRIENDLY_ERROR : errorMessage,
    },
    { status: statusCode }
  );
}

// ═══════════════════════════════════════════════════════════════
// API Route Wrapper — try/catch otomatik sarıcı
// ═══════════════════════════════════════════════════════════════

type ApiHandler = (...args: unknown[]) => Promise<NextResponse>;

export function withErrorHandler(
  handler: ApiHandler,
  route: string
): ApiHandler {
  return async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return createErrorResponse(error, { route });
    }
  };
}
