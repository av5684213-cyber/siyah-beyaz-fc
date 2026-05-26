/**
 * POST /api/admin/set-role
 *
 * Bir kullanıcının rolünü 'admin' veya 'user' olarak ayarlar.
 *
 * Güvenlik: Bu endpoint sadece belirli e-posta adreslerinden çağrılabilir.
 * İstek gövdesinde { email, role } olmalıdır.
 * E-posta allowlist env variable ile korunur — izinsiz erişim engellenir.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';

// İzin verilen admin e-posta adresleri — env variable'dan oku
const ADMIN_EMAILS = (process.env.ADMIN_ALLOWED_EMAILS || '')
  .split(',').map(e => e.trim()).filter(Boolean);

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client null' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json({ error: 'email ve role zorunlu' }, { status: 400 });
    }

    if (!['admin', 'user'].includes(role)) {
      return NextResponse.json({ error: 'role "admin" veya "user" olmalıdır' }, { status: 400 });
    }

    // E-posta allowlist kontrolü
    if (ADMIN_EMAILS.length === 0) {
      return NextResponse.json({ error: 'Admin e-posta listesi yapılandırılmamış (ADMIN_ALLOWED_EMAILS env)' }, { status: 500 });
    }

    if (!ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: 'Bu e-posta adresi için yetki verilmiyor' }, { status: 403 });
    }

    // Profili email kolonu ile bul
    let targetProfileId: string | null = null;

    // 1. Önce profiles tablosunda email kolonunu ara
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, team_name, role, email')
      .eq('email', email)
      .maybeSingle();

    if (profile) {
      targetProfileId = profile.id;
    } else {
      // 2. profiles tablosunda email yoksa, Supabase Auth'tan ara
      // Not: admin.listUsers service_role key gerektirir, anon key ile çalışmaz
      // Bu durumda auth.users tablosundaki email ile eşleşen user'ın ID'sini bul
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (serviceRoleKey) {
          const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
          );
          const { data: { users } } = await adminClient.auth.admin.listUsers();
          const authUser = users?.find(u => u.email === email);
          if (authUser) {
            targetProfileId = authUser.id;
          }
        }
      } catch (authErr) {
        console.warn('[admin/set-role] Auth admin lookup failed:', authErr);
      }
    }

    if (!targetProfileId) {
      return NextResponse.json(
        { error: 'E-posta ile profil bulunamadı. Kullanıcı giriş yapmalı.' },
        { status: 404 }
      );
    }

    // Rolü güncelle
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', targetProfileId);

    if (updateError) {
      console.error('[admin/set-role] Update error:', updateError.message);
      return NextResponse.json({ error: 'Rol güncellenemedi' }, { status: 500 });
    }

    console.log(`[admin/set-role] ${email} → role: ${role} (profileId: ${targetProfileId})`);

    return NextResponse.json({
      success: true,
      message: `Rol "${role}" olarak güncellendi`,
      profileId: targetProfileId,
    });
  } catch (err) {
    console.error('[admin/set-role] Error:', err);
    return createErrorResponse(err, { route: '/api/admin/set-role', method: 'POST' });
  }
}
