import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

/**
 * PUT /api/team/settings
 * Takım adı, renkleri ve amblemini günceller.
 *
 * Body: { managerId, team_name, primary_color, secondary_color, team_emblem }
 */
export async function PUT(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
    }

    const body = await request.json();
    const { managerId: bodyManagerId, team_name, primary_color, secondary_color, team_emblem } = body;
    const managerId = getAuthenticatedUserId(request, bodyManagerId);

    if (!managerId) {
      return NextResponse.json({ error: 'managerId zorunlu' }, { status: 400 });
    }

    // Güncellenecek alanları topla (sadece gönderilen alanları güncelle)
    const updateData: Record<string, string> = {};
    if (team_name !== undefined) updateData.team_name = String(team_name).slice(0, 50);
    if (primary_color !== undefined) updateData.primary_color = String(primary_color);
    if (secondary_color !== undefined) updateData.secondary_color = String(secondary_color);
    if (team_emblem !== undefined) updateData.team_emblem = String(team_emblem);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', managerId)
      .select()
      .single();

    if (error) {
      console.error('[team/settings] Supabase güncelleme hatası:', error.message);
      return createErrorResponse(error, { route: '/api/team/settings', method: 'PUT' });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/team/settings', method: 'PUT' });
  }
}
