import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyCronSecret, sanitizeError } from '@/lib/fm/security';

export const maxDuration = 120;

/**
 * Cron: Haftalık Gelir Dağıtımı
 * Her hafta bir kez çalışır. Sponsorluk + TV yayını gelirlerini hesaplar ve kredilere ekler.
 * 
 * Gelir kaynakları:
 * - Sponsorluk: team_sponsorships tablosundan aktif anlaşmaların weekly_income toplamı
 * - TV Yayını: profiles.tv_revenue_weekly (Lig 1: 20, Lig 2: 10, diğer: 0)
 * 
 * Ayrıca her lig turunda sponsorluk remaining_rounds azaltılır.
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
    const results: { profile_id: string; sponsorship: number; tv: number; total: number }[] = [];

    // 1. Tüm profilleri getir
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, credits, tv_revenue_weekly, league_name, is_bot')
      .is('is_bot', null); // Bot olmayan gerçek kullanıcılar

    if (profileError) {
      console.error('[cron/weekly-income] Profile fetch error:', profileError);
      return NextResponse.json({ error: 'Profile fetch failed' }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        action: 'none',
        message: 'Aktif profil bulunamadı',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Aktif sponsorluk anlaşmalarını getir
    const { data: sponsorships, error: sponsorError } = await supabase
      .from('team_sponsorships')
      .select('profile_id, weekly_income, remaining_rounds')
      .eq('status', 'active');

    if (sponsorError) {
      console.error('[cron/weekly-income] Sponsorship fetch error:', sponsorError);
      // Sponsorluk tablosu henüz oluşturulmamış olabilir, devam et
    }

    // Sponsorluk gelirini profile_id bazında grupla
    const sponsorshipIncome: Record<string, number> = {};
    if (sponsorships) {
      for (const s of sponsorships) {
        if (!sponsorshipIncome[s.profile_id]) sponsorshipIncome[s.profile_id] = 0;
        sponsorshipIncome[s.profile_id] += s.weekly_income || 0;
      }
    }

    // 3. Her profil için gelir hesapla ve kredilere ekle
    for (const profile of profiles) {
      const sponsorshipCredits = sponsorshipIncome[profile.id] || 0;
      const tvCredits = profile.tv_revenue_weekly || 0;
      const totalIncome = sponsorshipCredits + tvCredits;

      if (totalIncome > 0) {
        const newCredits = (profile.credits || 0) + totalIncome;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', profile.id);

        if (!updateError) {
          results.push({
            profile_id: profile.id,
            sponsorship: sponsorshipCredits,
            tv: tvCredits,
            total: totalIncome,
          });
        } else {
          console.error(`[cron/weekly-income] Update error for ${profile.id}:`, updateError.message);
        }
      }
    }

    // 4. Aktif sponsorlukların remaining_rounds'ını azalt
    if (sponsorships && sponsorships.length > 0) {
      const { error: decrementError } = await supabase.rpc('decrement_sponsorship_rounds');
      if (decrementError) {
        // RPC henüz oluşturulmamış olabilir, manuel azaltma yap
        for (const s of sponsorships) {
          const newRounds = (s.remaining_rounds || 0) - 1;
          if (newRounds <= 0) {
            await supabase
              .from('team_sponsorships')
              .update({ remaining_rounds: 0, status: 'expired' })
              .eq('profile_id', s.profile_id)
              .eq('remaining_rounds', s.remaining_rounds);
          } else {
            await supabase
              .from('team_sponsorships')
              .update({ remaining_rounds: newRounds })
              .eq('profile_id', s.profile_id)
              .eq('remaining_rounds', s.remaining_rounds);
          }
        }
      }
    }

    return NextResponse.json({
      action: 'weekly_income_distributed',
      profiles_processed: results.length,
      total_sponsorship: results.reduce((sum, r) => sum + r.sponsorship, 0),
      total_tv: results.reduce((sum, r) => sum + r.tv, 0),
      total_credits_distributed: results.reduce((sum, r) => sum + r.total, 0),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[cron/weekly-income] Fatal error:', err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
