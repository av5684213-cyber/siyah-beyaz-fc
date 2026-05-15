import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  
  return supabaseInstance;
}

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
