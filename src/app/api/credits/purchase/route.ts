import { NextRequest, NextResponse } from 'next/server';
import { verifyProfileExists } from '@/lib/fm/security';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

/**
 * POST /api/credits/purchase
 *
 * DISABLED: This route is disabled until a real payment integration is implemented.
 * In production, credits must only be added after verifying a real payment.
 * The simulation mode that previously allowed free credit addition has been removed
 * to prevent abuse.
 *
 * To re-enable for development, set ENABLE_SIMULATION_PURCHASE=true in .env.local
 */
export async function POST(request: NextRequest) {
  // Only allow in development if explicitly enabled via env var
  const enableSimulation = process.env.ENABLE_SIMULATION_PURCHASE === 'true';

  if (!enableSimulation) {
    return NextResponse.json(
      {
        error: true,
        message: 'Ödeme sistemi entegrasyonu devam ediyor. Kredi satın alma şu anda kullanılamıyor.',
      },
      { status: 403 }
    );
  }

  // ─── Development-only simulation (ENABLE_SIMULATION_PURCHASE=true) ───
  try {
    const { getSupabase, isSupabaseConfigured } = await import('@/lib/supabase');

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: true, message: 'Supabase not configured.' }, { status: 500 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: true, message: 'Supabase client null.' }, { status: 500 });
    }

    const { userId: bodyUserId, credits } = await request.json();
    const userId = getAuthenticatedUserId(request, bodyUserId);

    if (!userId || !credits || credits <= 0) {
      return NextResponse.json({ error: true, message: 'userId ve credits zorunlu.' }, { status: 400 });
    }

    // Cap maximum purchase amount to prevent abuse
    if (credits > 575) {
      return NextResponse.json({ error: true, message: 'Maksimum 575 kredi satin alabilirsiniz.' }, { status: 400 });
    }

    // Verify profile exists
    const { valid, profile, error: profileError, status: profileStatus } = await verifyProfileExists(supabase, userId);
    if (!valid) {
      return NextResponse.json({ error: true, message: profileError || 'Profil bulunamadi.' }, { status: profileStatus || 404 });
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
      _simulated: true, // Flag to indicate this is a simulation
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/credits/purchase', method: 'POST' });
  }
}
