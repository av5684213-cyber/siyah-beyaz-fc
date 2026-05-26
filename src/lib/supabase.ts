import {
  createServerClient as createSupabaseServerClient,
  createBrowserClient as createSupabaseBrowserClient,
} from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── Environment validation ────────────────────────────────────────

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  // Placeholder/örnek değerleri tespit et — gerçek Supabase URL'leri .supabase.co ile biter ve key JWT formatındadır
  if (url === 'placeholder' || url.includes('placeholder')) return false;
  if (key === 'placeholder') return false;
  if (!url.includes('.supabase.co')) return false;
  // Basit JWT formatı kontrolü (3 parça, base64)
  if (key.split('.').length < 3) return false;
  return true;
}

// ─── Server-side client (SSR compatible) ───────────────────────────
// Next.js server components ve API routes'ta her istekte yeni client
// oluşturulur. @supabase/ssr cookie yönetimini otomatik halleder ve
// Auth oturum izolasyonunu garanti eder.

/**
 * Server Component / Route Handler için Supabase client oluşturur.
 *
 * `@supabase/ssr` paketini kullanarak cookie okuma/yazma işlemlerini
 * Next.js `cookies()` API'si ile entegre eder. Her çağrıda yeni instance
 * döndürür — bu, birden fazla eş zamanlı istek arasında oturum
 * karışmasını engeller.
 *
 * Middleware'de session refresh yapıldığı durumlarda `setAll` içindeki
 * hata güvenle yoksayılabilir.
 *
 * @example
 * // Server Component / Route Handler'da:
 * const supabase = await createServerClient();
 * const { data } = await supabase.from('table').select('*');
 */
export async function createServerClient(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  // Dynamic import: `next/headers` sadece server-side çalışır,
  // client component'lerden import edildiğinde build hatası vermemesi için
  // lazy loading kullanıyoruz.
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

// ─── Browser-side client (singleton pattern) ───────────────────────
// Tarayıcıda tek oturum olduğu için singleton kullanımı güvenlidir.

let browserInstance: SupabaseClient | null = null;

/**
 * Client Component için Supabase client oluşturur (singleton).
 *
 * `@supabase/ssr` paketinin `createBrowserClient` fonksiyonunu kullanır.
 * Tarayıcıda sadece tek bir instance yaşar — gereksiz yeniden oluşturma
 * yapılmaz. Cookie yönetimi otomatik olarak tarayıcı cookie'leri üzerinden
 * halledilir ve SSR ile uyumlu auth state paylaşımı sağlar.
 *
 * @example
 * // Client Component'te:
 * const supabase = createBrowserClient();
 * const { data } = await supabase.from('table').select('*');
 */
export function createBrowserClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  if (!browserInstance) {
    browserInstance = createSupabaseBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return browserInstance;
}

// ─── Backward-compatible alias ─────────────────────────────────────
// Mevcut kodun bozulmaması için getSupabase() hâlâ senkron çalışır.
// Tarayıcıda `createBrowserClient()` temelli singleton kullanır.
// Sunucuda `@supabase/supabase-js` createClient ile cookie entegrasyonu
// olmayan instance döndürür (eski davranış). SSR Auth kullanımı için
// `await createServerClient()` tercih edilmelidir.

/**
 * Supabase client döndürür (backward-compatible, senkron).
 *
 * - Tarayıcıda (client): singleton pattern — `createBrowserClient()` temelinde
 * - Sunucuda (server): `@supabase/supabase-js` createClient ile (cookie entegrasyonu yok)
 *
 * **Önemli:** Sunucuda Auth/SSR cookie desteği gerektiren yerlerde
 * `await createServerClient()` kullanılmalıdır. Bu fonksiyon mevcut
 * kodun bozulmaması için senkron kalır.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  const isServer = typeof window === 'undefined';

  if (isServer) {
    // Server-side: cookie entegrasyonu olmayan basit client.
    // Auth oturum izolasyonu için `await createServerClient()` kullanın.
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Client-side: @supabase/ssr tabanlı singleton
  return createBrowserClient();
}

// ─── Realtime helpers ──────────────────────────────────────────────

/**
 * Supabase Realtime için tabloları etkinleştirir.
 *
 * Realtime'ın çalışması için tabloların REPLICA IDENTITY FULL olması gerekir.
 * Bu fonksiyon bir admin/service role client ile çağrılmalıdır.
 * Normal anon key ile çalışmaz — migration SQL ile yapılmalıdır.
 *
 * @param tableNames - Realtime'a açılacak tablo adları
 * @returns Başarı durumu
 *
 * @example
 * // Client tarafında sadece abone ol, enableRealtime'ı migration'da çalıştır
 * const channel = supabase.channel('match_chat:fixture-1')
 *   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_chat' }, callback)
 *   .subscribe();
 */
export function enableRealtime(tableNames: string[]): { enabled: string[]; note: string } {
  // Bu fonksiyon bilgi amaçlıdır. Gerçek etkinleştirme SQL migration ile yapılır.
  // Aşağıdaki SQL'i Supabase Dashboard > SQL Editor'de çalıştırın:
  //
  // ALTER TABLE match_chat REPLICA IDENTITY FULL;
  // ALTER TABLE manager_messages REPLICA IDENTITY FULL;
  // ALTER TABLE manager_conversations REPLICA IDENTITY FULL;
  // ALTER TABLE manager_presence REPLICA IDENTITY FULL;
  //
  // Ardından Dashboard > Database > Replication'da tabloları etkinleştirin.

  const note = [
    'Realtime etkinleştirme için şu SQL\'i Supabase Dashboard\'da çalıştırın:',
    ...tableNames.map(t => `ALTER TABLE ${t} REPLICA IDENTITY FULL;`),
    '',
    'Ardından Dashboard > Database > Replication\'da tabloları etkinleştirin.',
    'Client tarafında sadece .on("postgres_changes", ...) ile abone olun.',
  ].join('\n');

  return { enabled: tableNames, note };
}

/**
 * Realtime için önerilen tabloların listesi.
 * Bu tabloların REPLICA IDENTITY FULL olarak ayarlanması gerekir.
 */
export const REALTIME_TABLES = [
  'match_chat',
  'manager_messages',
  'manager_conversations',
  'manager_presence',
] as const;

export type RealtimeTable = typeof REALTIME_TABLES[number];
