import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * POST /api/credits/purchase
 * Add credits to user profile (simulated purchase)
 * In production, this would verify payment before adding credits.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: true, message: 'Supabase not configured.' }, { status: 500 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: true, message: 'Supabase client null.' }, { status: 500 });
    }

    const { userId, credits } = await request.json();

    if (!userId || !credits || credits <= 0) {
      return NextResponse.json({ error: true, message: 'userId ve credits zorunlu.' }, { status: 400 });
    }

    // Cap maximum purchase amount to prevent abuse
    if (credits > 575) {
      return NextResponse.json({ error: true, message: 'Maksimum 575 kredi satin alabilirsiniz.' }, { status: 400 });
    }

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: true, message: 'Profil bulunamadi.' }, { status: 404 });
    }

    // Update credits
    const newCredits = (profile.credits || 0) + credits;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateError) {
      console.error('[POST /api/credits/purchase] Update error:', updateError.message);
      return NextResponse.json({ error: true, message: 'Kredi eklenemedi.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      creditsAdded: credits,
      remainingCredits: newCredits,
    });
  } catch (err) {
    console.error('[POST /api/credits/purchase] Exception:', err);
    return NextResponse.json({ error: true, message: 'Bir hata olustu.' }, { status: 500 });
  }
}
