import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyCronSecret, sanitizeError } from '@/lib/fm/security';

export const maxDuration = 60;

/**
 * Cron: Akademi yükseltme sürelerini kontrol et
 * Her saat başı çağrılır. upgrade_end_at <= NOW() olan kayıtların seviyesini artırır.
 */
export async function GET(request: NextRequest) {
  const cronCheck = verifyCronSecret(request);
  if (!cronCheck.valid) {
    return NextResponse.json({ error: cronCheck.error }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'No Supabase client' }, { status: 500 });
  }

  try {
    // Süresi dolmuş yükseltmeleri bul
    const { data: expiredUpgrades, error: fetchError } = await supabase
      .from('user_academy')
      .select('profile_id, current_level, upgrade_end_at')
      .not('upgrade_end_at', 'is', null)
      .lte('upgrade_end_at', new Date().toISOString());

    if (fetchError) {
      console.error('[cron/check-academy-upgrades] Fetch error:', fetchError);
      return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }

    if (!expiredUpgrades || expiredUpgrades.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tamamlanmış yükseltme yok',
        processed: 0,
        timestamp: new Date().toISOString(),
      });
    }

    const results: { profileId: string; newLevel: number }[] = [];
    const errors: string[] = [];

    for (const upgrade of expiredUpgrades) {
      try {
        const newLevel = upgrade.current_level + 1;

        // Seviyeyi artır, yükseltme zamanlarını sıfırla
        const { error: updateError } = await supabase
          .from('user_academy')
          .update({
            current_level: newLevel,
            upgrade_started_at: null,
            upgrade_end_at: null,
            speed_up_used: false,
            updated_at: new Date().toISOString(),
          })
          .eq('profile_id', upgrade.profile_id);

        if (updateError) {
          errors.push(`Profile ${upgrade.profile_id}: ${updateError.message}`);
          continue;
        }

        // profiles tablosundaki academy_level'ı da güncelle
        await supabase
          .from('profiles')
          .update({ academy_level: newLevel })
          .eq('id', upgrade.profile_id);

        results.push({
          profileId: upgrade.profile_id,
          newLevel,
        });

        console.log(`[cron/check-academy-upgrades] Profile ${upgrade.profile_id} → Level ${newLevel}`);
      } catch (err) {
        errors.push(`Profile ${upgrade.profile_id}: ${err}`);
      }
    }

    // Logla
    await supabase.from('error_logs').insert({
      source: 'cron',
      level: 'info',
      message: `Akademi yükseltme kontrolü: ${results.length} tamamlandı, ${errors.length} hata`,
      context: { processed: results.length, errors: errors.length },
    });

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[cron/check-academy-upgrades] Fatal error:', err);

    // Hata logla
    try {
      await supabase.from('error_logs').insert({
        source: 'cron',
        level: 'error',
        message: 'Akademi yükseltme cron hatası',
        stack_trace: err instanceof Error ? err.stack : String(err),
      });
    } catch { /* ignore */ }

    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
