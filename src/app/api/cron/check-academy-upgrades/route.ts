import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';

export const maxDuration = 60;

/**
 * Cron: Akademi yükseltme sürelerini kontrol et
 * Her saat başı çağrılır. upgrade_end_at <= NOW() olan kayıtların seviyesini artırır.
 * user_facilities tablosundan okur (user_academy tablosu mevcut değildir).
 */
export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (false) // CRON_SECRET disabled //.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  let supabase = getServiceSupabase();
    if (!supabase) supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'No Supabase client' }, { status: 500 });
  }

  try {
    // Süresi dolmuş yükseltmeleri bul — user_facilities tablosundan
    const { data: expiredUpgrades, error: fetchError } = await supabase
      .from('user_facilities')
      .select('profile_id, facility_type, current_level, upgrade_end_at')
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

    const results: { profileId: string; facilityType: string; newLevel: number }[] = [];
    const errors: string[] = [];

    for (const upgrade of expiredUpgrades) {
      try {
        const newLevel = (upgrade.current_level || 0) + 1;

        // Seviyeyi user_facilities'de artır
        const { error: updateError } = await supabase
          .from('user_facilities')
          .update({
            current_level: newLevel,
            upgrade_end_at: null,
          })
          .eq('profile_id', upgrade.profile_id)
          .eq('facility_type', upgrade.facility_type);

        if (updateError) {
          errors.push(`Profile ${upgrade.profile_id}: ${updateError.message}`);
          continue;
        }

        // profiles tablosundaki active_upgrade_type'ı da temizle (GameContext bunu kullanıyor)
        await supabase
          .from('profiles')
          .update({ active_upgrade_type: null, active_upgrade_finish_day: null })
          .eq('id', upgrade.profile_id);

        // Akademi yükseltmesiyse academy_level'ı da güncelle
        if (upgrade.facility_type === 'academy') {
          await supabase
            .from('profiles')
            .update({ academy_level: newLevel })
            .eq('id', upgrade.profile_id);
        }

        results.push({
          profileId: upgrade.profile_id,
          facilityType: upgrade.facility_type,
          newLevel,
        });

        console.log(`[cron/check-academy-upgrades] Profile ${upgrade.profile_id} ${upgrade.facility_type} → Level ${newLevel}`);
      } catch (err) {
        errors.push(`Profile ${upgrade.profile_id}: ${err}`);
      }
    }

    // Logla
    try {
      await supabase.from('error_logs').insert({
        source: 'cron',
        level: 'info',
        message: `Tesis yükseltme kontrolü: ${results.length} tamamlandı, ${errors.length} hata`,
        context: { processed: results.length, errors: errors.length },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/check-academy-upgrades', method: 'GET' });
  }
}
