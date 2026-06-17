import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/fm/supabaseRateLimit';
import { createErrorResponse } from '@/lib/api-error-handler';
import { v5 as uuidv5 } from 'uuid';

/**
 * POST /api/auth/google
 *
 * Google Sign-In callback endpoint.
 *
 * Akış:
 * 1. Google ID token'ı verify et (Google tokeninfo endpoint)
 * 2. googleId'den deterministik UUID v5 üret (profiles.id UUID tipinde)
 * 3. Profile var mı kontrol et → returning user, success döndür
 * 4. Yoksa: boşta bir bot takım bul, kullanıcına devret
 *    - league_teams.profile_id → yeni kullanıcı UUID
 *    - league_teams.is_bot → false
 *    - players.profile_id → yeni kullanıcı UUID
 *    - Diğer ilgili tablolar (active_tactics, training_state, vb.) migrate
 *    - Bot'un eski profiles satırını sil
 * 5. Bot yoksa: minimal profile oluştur, hasProfile=false döndür
 *    → ManagerRegistration gösterilir (kullanıcı manuel kulüp kurar)
 */

// UUID v5 namespace — Touchline Manager'ın sabit namespace'i
// Bu değer değişmezse, aynı googleId her zaman aynı UUID üretir
const TM_NAMESPACE = '7c1f9b3a-2d4e-5f6a-8b9c-0d1e2f3a4b5c';

/**
 * Google sub (kullanıcı ID) değerinden deterministik UUID v5 üretir.
 * Aynı googleId her zaman aynı UUID döndürür — bu sayede kullanıcı
 * tekrar giriş yaptığında aynı profile'a erişir.
 */
function generateUserIdFromGoogleId(googleId: string): string {
  return uuidv5(`google:${googleId}`, TM_NAMESPACE);
}

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

    // ─── 1. Google ID token verify ───────────────────────────────
    // [87] 5 saniye timeout — Vercel serverless 10sn limit
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    let verifyResponse;
    try {
      verifyResponse = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`,
        { method: 'GET', signal: controller.signal }
      );
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      console.error('[google-auth] Token verify timeout/error:', fetchErr.message);
      return NextResponse.json({ error: 'Google token doğrulama zaman aşımı' }, { status: 504 });
    }
    clearTimeout(timeoutId);

    if (!verifyResponse.ok) {
      console.warn('[google-auth] Token verification failed:', verifyResponse.status);
      return NextResponse.json({ error: 'Google token doğrulanamadı' }, { status: 401 });
    }

    const googleData = await verifyResponse.json();

    if (googleData.aud !== GOOGLE_CLIENT_ID) {
      console.warn('[google-auth] Audience mismatch:', googleData.aud);
      return NextResponse.json({ error: 'Geçersiz Google token' }, { status: 401 });
    }

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

    // ─── 2. Deterministik UUID üret ───────────────────────────────
    const internalUserId = generateUserIdFromGoogleId(googleId);

    let supabase = getServiceSupabase();
    if (!supabase) supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı kurulamadı' }, { status: 500 });
    }

    // ─── 3. Mevcut profil kontrolü ────────────────────────────────
    const { data: existingProfile, error: existingErr } = await supabase
      .from('profiles')
      .select('id, team_name, manager_name, league_name, is_bot, onboarding_completed, email')
      .eq('id', internalUserId)
      .maybeSingle();

    if (existingErr) {
      console.error('[google-auth] Profile query error:', existingErr.message);
    }

    if (existingProfile && !existingProfile.is_bot) {
      // Returning user — email'i güncelle (ilk girişte NULL olabilir)
      if (email && existingProfile.email !== email) {
        await supabase
          .from('profiles')
          .update({ email, team_logo: picture || null })
          .eq('id', internalUserId);
      }

      // KRİTİK: Eğer returning user'ın team_name'i YOKSA (minimal profile oluşturulmuş
      // ama ManagerRegistration henüz tamamlanmamışsa), hasProfile:false döndür.
      // Bu, client'ın ManagerRegistration ekranını göstermesini sağlar.
      // Eski sürümde her returning user hasProfile:true alıyordu → ManagerRegistration
      // atlanıyordu → kullanıcı direkt oyuna atıyordu (VPN sorununun temel nedeni).
      const hasTeam = !!existingProfile.team_name && existingProfile.team_name.length > 0;

      console.log(`[google-auth] Returning user: team_name="${existingProfile.team_name}" hasTeam=${hasTeam} (${internalUserId})`);

      if (!hasTeam) {
        // Takım kurulmamış — ManagerRegistration'a düşür
        // Minimal profile zaten var, hasProfile:false dön → client ManagerRegistration gösterir
        return NextResponse.json({
          success: true,
          userId: internalUserId,
          hasProfile: false,
          onboardingCompleted: false,
          teamName: null,
          managerName: existingProfile.manager_name,
          email,
          name,
          picture,
        });
      }

      return NextResponse.json({
        success: true,
        userId: internalUserId,
        hasProfile: true,
        onboardingCompleted: existingProfile.onboarding_completed ?? true,
        teamName: existingProfile.team_name,
        managerName: existingProfile.manager_name,
        email,
        name,
        picture,
      });
    }

    // ─── 4. Yeni kullanıcı → minimal profile + ManagerRegistration'a düş ───
    //
    // Bot takım claim işlemi BURADA YAPILMAZ. Kullanıcı önce ManagerRegistration
    // ekranına düşer, adını girer, "KULÜBÜ DEVRAL VE BAŞLA" butonuna basar —
    // o zaman /api/auth/register → assign_bot_to_user RPC ile bir bot takım
    // oyuncuya tahsis edilir. Bu sayede kullanıcı takım kurma ekranını görür.
    console.log(`[google-auth] New user → minimal profile (ManagerRegistration will assign bot team): ${internalUserId}`);

    return await createMinimalProfile(supabase, internalUserId, email, name, picture, null);
  } catch (err: any) {
    console.error('[google-auth] Error:', err);
    return createErrorResponse(err, { route: '/api/auth/google', method: 'POST' });
  }
}

/**
 * Bot takım yoksa minimal profile oluştur.
 * Kullanıcı ManagerRegistration adımına düşer — manuel kulüp kurar.
 */
async function createMinimalProfile(
  supabase: any,
  internalUserId: string,
  email: string,
  name: string,
  picture: string,
  fallbackTeamName: string | null
): Promise<NextResponse> {
  // selimporsuk@gmail.com → admin/kurucu rolü
  const FOUNDER_EMAIL = 'selimporsuk@gmail.com';
  const isFounder = email?.toLowerCase() === FOUNDER_EMAIL;

  const minimalProfile = {
    id: internalUserId,
    manager_name: name || 'Yeni Menajer',
    team_name: fallbackTeamName || null,
    email,
    team_logo: picture || null,
    money: 50_000_000,
    credits: 200,
    level: 1,
    xp: 0,
    fans: 1000,
    reputation: 30,
    league_tier: 4,
    academy_level: 1,
    stadium_capacity: 5000,
    ticket_price: 30,
    region: 'tr',
    role: isFounder ? 'admin' : 'user', // selimporsuk@gmail.com → admin/owner
    is_bot: false,
    onboarding_completed: false, // ManagerRegistration göster
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: minimalInsertError } = await supabase
    .from('profiles')
    .insert(minimalProfile);

  if (minimalInsertError) {
    console.error('[google-auth] Minimal profile insert error:', minimalInsertError.message);
    // Profile oluşturulamasa bile userId döndür — client ManagerRegistration'a yönlendirir
    // (ManagerRegistration initTeam'i profile oluşturmayı dener)
  }

  return NextResponse.json({
    success: true,
    userId: internalUserId,
    hasProfile: false, // ManagerRegistration göster
    onboardingCompleted: false,
    email,
    name,
    picture,
    noBotsAvailable: true,
  });
}
