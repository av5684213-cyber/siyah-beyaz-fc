import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
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
    const verifyResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`,
      { method: 'GET' }
    );

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

    const supabase = getServiceSupabase();
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

      console.log(`[google-auth] Returning user: ${existingProfile.team_name} (${internalUserId})`);

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

    // ─── 4. Yeni kullanıcı → Bot takım claim et ───────────────────
    // Online oyun: her yeni Google kullanıcısına otomatik bot kulüp ver

    // 4a. Boşta bot takım bul: is_bot=true ve profile_id'si hâlâ bot profile'ına ait
    //     (yani henüz gerçek kullanıcı tarafından claim edilmemiş)
    const { data: availableBotTeams, error: botQueryErr } = await supabase
      .from('league_teams')
      .select('id, name, league_id, profile_id, is_bot')
      .eq('is_bot', true)
      .limit(200);

    if (botQueryErr) {
      console.error('[google-auth] Bot team query error:', botQueryErr.message);
    }

    let botTeam: any = null;

    if (availableBotTeams && availableBotTeams.length > 0) {
      // Bot'ların profile_id'lerini topla
      const botProfileIds = availableBotTeams
        .map((t: any) => t.profile_id)
        .filter(Boolean);

      // Bu profile_id'lerden gerçek kullanıcı (is_bot=false) olanları bul
      // — onlar zaten claim edilmiş, atla
      let claimedProfileIds = new Set<string>();
      if (botProfileIds.length > 0) {
        const { data: realProfiles } = await supabase
          .from('profiles')
          .select('id')
          .in('id', botProfileIds)
          .eq('is_bot', false);
        claimedProfileIds = new Set((realProfiles || []).map(p => p.id));
      }

      // Henüz claim edilmemiş bot takımları filtrele
      const freeBots = availableBotTeams.filter((t: any) =>
        !t.profile_id || !claimedProfileIds.has(t.profile_id)
      );

      if (freeBots.length > 0) {
        // Rastgele bir bot seç — her kullanıcıya farklı bot verilir
        botTeam = freeBots[Math.floor(Math.random() * freeBots.length)];
      }
    }

    if (botTeam) {
      console.log(`[google-auth] Auto-assigning bot team "${botTeam.name}" (id=${botTeam.id}) to ${internalUserId}`);

      const botProfileId = botTeam.profile_id;

      // 4b. Bot profile'ını al — verilerini yeni kullanıcıya kopyalayacağız
      let botProfileData: any = null;
      if (botProfileId) {
        const { data: botProf } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', botProfileId)
          .maybeSingle();
        botProfileData = botProf;
      }

      // 4c. Yeni profile oluştur — bot'un verilerini kopyala, ama yeni UUID ve Google bilgileri ile
      const newProfileData: Record<string, any> = botProfileData
        ? { ...botProfileData }
        : {
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
          role: 'user',
          is_bot: false,
        };

      // Bot-specific alanları sıfırla
      newProfileData.id = internalUserId;
      newProfileData.email = email;
      newProfileData.team_logo = picture || newProfileData.team_logo || null;
      newProfileData.manager_name = name || newProfileData.manager_name || 'Yeni Menajer';
      newProfileData.is_bot = false;
      newProfileData.bot_difficulty = null;
      newProfileData.onboarding_completed = true; // ManagerRegistration atla
      newProfileData.created_at = new Date().toISOString();
      newProfileData.updated_at = new Date().toISOString();

      // Tüm yeni oyuncular SABİT 50M € ve 200 kredi ile başlar.
      // Bot'un eski para/kredi değerlerini override et — finansal eşitlik.
      newProfileData.money = 50_000_000;
      newProfileData.credits = 200;

      // team_name'i koru — bot'un takım adı kullanıcıya geçer
      // (Eğer bot'ta team_name yoksa, league_teams.name'i kullan)
      if (!newProfileData.team_name && botTeam.name) {
        newProfileData.team_name = botTeam.name;
      }

      const { error: profileInsertError } = await supabase
        .from('profiles')
        .insert(newProfileData);

      if (profileInsertError) {
        console.error('[google-auth] Profile insert error:', profileInsertError.message);
        // Profile insert başarısız — bot claim etmeden minimal profile dene
        return await createMinimalProfile(supabase, internalUserId, email, name, picture, botTeam.name);
      }

      // 4d. league_teams kaydını güncelle: profile_id = yeni kullanıcı, is_bot = false
      const { error: claimError } = await supabase
        .from('league_teams')
        .update({
          profile_id: internalUserId,
          is_bot: false,
          bot_difficulty: null,
        })
        .eq('id', botTeam.id);

      if (claimError) {
        console.error('[google-auth] league_teams update error:', claimError.message);
        // Profile oluşturuldu ama league_team claim edilemedi — kullanıcı yine de giriş yapabilir
        // (ManagerRegistration akışına düşebilir)
      }

      // 4e. Players tablosunu migrate: bot profile_id → yeni kullanıcı UUID
      if (botProfileId && botProfileId !== internalUserId) {
        const { error: playersMigrateError } = await supabase
          .from('players')
          .update({ profile_id: internalUserId })
          .eq('profile_id', botProfileId);

        if (playersMigrateError) {
          console.warn('[google-auth] Players migration error:', playersMigrateError.message);
        } else {
          console.log(`[google-auth] Players migrated: ${botProfileId} → ${internalUserId}`);
        }

        // 4f. Diğer ilişkili tabloları migrate
        const tableMigrations: Array<{ table: string; column: string }> = [
          { table: 'active_tactics', column: 'id' },
          { table: 'training_state', column: 'id' },
          { table: 'user_facilities', column: 'profile_id' },
          { table: 'watchlist', column: 'user_id' },
          { table: 'staff', column: 'user_id' },
          { table: 'notifications', column: 'profile_id' },
          { table: 'daily_tasks', column: 'user_id' },
          { table: 'scouted_players', column: 'profile_id' },
          { table: 'player_career_stats', column: 'profile_id' },
          { table: 'user_academy', column: 'profile_id' },
          { table: 'team_sponsorships', column: 'profile_id' },
        ];

        for (const { table, column } of tableMigrations) {
          try {
            const { error: migrateErr } = await supabase
              .from(table)
              .update({ [column]: internalUserId })
              .eq(column, botProfileId);
            if (migrateErr && !migrateErr.message.includes('does not exist') && !migrateErr.message.includes('schema cache')) {
              console.warn(`[google-auth] Migration warning for ${table}.${column}:`, migrateErr.message);
            }
          } catch (e: any) {
            // Tablo yoksa sessizce geç
          }
        }

        // 4g. Eski bot profile'ını sil
        const { error: botDeleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', botProfileId)
          .eq('is_bot', true);

        if (botDeleteError) {
          console.warn('[google-auth] Bot profile delete error:', botDeleteError.message);
        } else {
          console.log(`[google-auth] Old bot profile deleted: ${botProfileId}`);
        }
      }

      console.log(`[google-auth] ✅ New user onboarded: ${name} (${email}) — team: ${newProfileData.team_name}`);

      return NextResponse.json({
        success: true,
        userId: internalUserId,
        hasProfile: true,
        onboardingCompleted: true,
        teamName: newProfileData.team_name,
        managerName: newProfileData.manager_name,
        email,
        name,
        picture,
        autoAssigned: true,
        botTeamName: botTeam.name,
      });
    }

    // ─── 5. Bot yok → minimal profile + ManagerRegistration'a düş ───
    // Bot havuzu doldu (90 kullanıcı 90 bot'u aldı). Yeni kullanıcı
    // manuel kurulum akışına (ManagerRegistration) düşer.
    console.warn(`[google-auth] No free bot team available for ${internalUserId} — falling back to manual registration`);

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
    role: 'user',
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
