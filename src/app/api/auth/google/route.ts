import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/fm/supabaseRateLimit';
import { createErrorResponse } from '@/lib/api-error-handler';

/**
 * POST /api/auth/google
 *
 * Google Sign-In callback endpoint.
 * Receives a Google ID token (JWT), verifies it, and:
 * 1. Checks if a profile exists for this Google user
 * 2. If yes → returns the profile + session
 * 3. If no  → creates a placeholder profile (user will complete registration)
 */
export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateCheck = await checkRateLimit(`google-auth:${clientIp}`, 10, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: 'Çok fazla deneme. Lütfen bekleyin.' }, { status: 429 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Google token gerekli' }, { status: 400 });
    }

    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!GOOGLE_CLIENT_ID) {
      console.error('[google-auth] NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured');
      return NextResponse.json({ error: 'Google Auth yapılandırılmamış' }, { status: 500 });
    }

    // Verify Google ID token via Google's tokeninfo endpoint
    const verifyResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`,
      { method: 'GET' }
    );

    if (!verifyResponse.ok) {
      console.warn('[google-auth] Token verification failed:', verifyResponse.status);
      return NextResponse.json({ error: 'Google token doğrulanamadı' }, { status: 401 });
    }

    const googleData = await verifyResponse.json();

    // Audience check
    if (googleData.aud !== GOOGLE_CLIENT_ID) {
      console.warn('[google-auth] Audience mismatch:', googleData.aud);
      return NextResponse.json({ error: 'Geçersiz Google token' }, { status: 401 });
    }

    // Token expiry check
    if (googleData.exp && Date.now() / 1000 > Number(googleData.exp)) {
      return NextResponse.json({ error: 'Google token süresi dolmuş' }, { status: 401 });
    }

    const googleId = googleData.sub;
    const email = googleData.email || '';
    const name = googleData.name || '';
    const picture = googleData.picture || '';

    if (!googleId) {
      return NextResponse.json({ error: 'Google ID alınamadı' }, { status: 400 });
    }

    // Consistent internal user ID from Google sub
    const internalUserId = `google-${googleId}`;

    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı kurulamadı' }, { status: 500 });
    }

    // Check existing profile for this Google user
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, team_name, manager_name, league_name, is_bot, onboarding_completed')
      .eq('id', internalUserId)
      .maybeSingle();

    if (existingProfile && !existingProfile.is_bot) {
      console.log(`[google-auth] Returning user: ${existingProfile.team_name}`);

      if (email) {
        await supabase.from('profiles').update({ email }).eq('id', internalUserId);
      }

      return NextResponse.json({
        success: true,
        userId: internalUserId,
        hasProfile: true,
        onboardingCompleted: existingProfile.onboarding_completed ?? false,
        teamName: existingProfile.team_name,
        managerName: existingProfile.manager_name,
        email,
        picture,
      });
    }

    // ─── Migration: Claim legacy demo profile if exists ───────────────
    // Demo modundan kalma profilleri (00000000-0000-0000-0000-000000000001)
    // yeni Google ID'sine taşı. Bu, kullanıcıların DEV_MODE=true iken
    // oluşturdukları takımlarını kaybetmemesini sağlar.
    const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

    const { data: demoProfile } = await supabase
      .from('profiles')
      .select('id, team_name, manager_name, is_bot, onboarding_completed')
      .eq('id', DEMO_USER_ID)
      .maybeSingle();

    if (demoProfile && demoProfile.team_name && !demoProfile.is_bot) {
      console.log(`[google-auth] Migrating demo profile "${demoProfile.team_name}" to ${internalUserId}`);

      // 1. Demo profilin tüm verilerini al
      const { data: fullDemoProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', DEMO_USER_ID)
        .maybeSingle();

      if (fullDemoProfile) {
        // 2. Yeni profil oluştur (eski verilerle, yeni ID ile)
        const newProfile = {
          ...fullDemoProfile,
          id: internalUserId,
          email,
          team_logo: picture || fullDemoProfile.team_logo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (insertError) {
          console.error('[google-auth] Profile migration insert error:', insertError.message);
        } else {
          // 3. Bağımlı tablolarda profile_id / user_id / id'yi güncelle
          const updates = [
            { table: 'league_teams', column: 'profile_id' },
            { table: 'players', column: 'profile_id' },
            { table: 'active_tactics', column: 'id' },
            { table: 'training_state', column: 'id' },
            { table: 'user_facilities', column: 'profile_id' },
            { table: 'watchlist', column: 'user_id' },
            { table: 'staff', column: 'user_id' },
            { table: 'notifications', column: 'profile_id' },
            { table: 'daily_tasks', column: 'user_id' },
            { table: 'scouted_players', column: 'profile_id' },
            { table: 'player_career_stats', column: 'profile_id' },
            { table: 'transfer_market', column: 'seller_profile_id' },
          ];

          for (const { table, column } of updates) {
            try {
              await supabase
                .from(table)
                .update({ [column]: internalUserId })
                .eq(column, DEMO_USER_ID);
            } catch (e) {
              // Tablo yoksa veya kolon yoksa sessizce geç
              console.warn(`[google-auth] Migration update skipped: ${table}.${column}`);
            }
          }

          // 4. Eski demo profili sil
          await supabase.from('profiles').delete().eq('id', DEMO_USER_ID);

          console.log(`[google-auth] Migration complete: ${demoProfile.team_name} -> ${internalUserId}`);

          return NextResponse.json({
            success: true,
            userId: internalUserId,
            hasProfile: true,
            onboardingCompleted: demoProfile.onboarding_completed ?? true,
            teamName: demoProfile.team_name,
            managerName: demoProfile.manager_name,
            email,
            name,
            picture,
            migrated: true,
          });
        }
      }
    }
    // ─── End migration ────────────────────────────────────────────────

    // New user — create placeholder profile
    const placeholderProfile = {
      id: internalUserId,
      manager_name: name || 'Yeni Menajer',
      team_name: null,
      email,
      team_logo: picture || null,
      money: 0,
      credits: 0,
      level: 1,
      xp: 0,
      fans: 0,
      reputation: 0,
      is_bot: false,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(placeholderProfile);

    if (profileError) {
      console.error('[google-auth] Profile upsert error:', profileError.message);
      if (!profileError.message.includes('duplicate') && !profileError.message.includes('unique')) {
        return NextResponse.json({ error: 'Profil oluşturulamadı' }, { status: 500 });
      }
    }

    console.log(`[google-auth] New user: ${name} (${email})`);

    return NextResponse.json({
      success: true,
      userId: internalUserId,
      hasProfile: false,
      onboardingCompleted: false,
      email,
      name,
      picture,
    });

  } catch (err: any) {
    console.error('[google-auth] Error:', err);
    return createErrorResponse(err, { route: '/api/auth/google', method: 'POST' });
  }
}
