/**
 * Staff API — Kullanıcının personel listesini getir
 * GET /api/staff?userId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: true, message: 'Supabase yapılandırılmamış.' }, { status: 500 });
    }

    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ error: true, message: 'Supabase client null.' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const userId = getAuthenticatedUserId(request, searchParams.get('userId'));

    if (!userId) {
      return NextResponse.json({ error: true, message: 'userId gerekli.' }, { status: 400 });
    }

    // Fetch all staff for the user, joined with staff_types
    let staffList: any[] = [];
    let staffError: any = null;
    
    try {
      const result = await supabase
        .from('staff')
        .select('*, staff_types(name_tr, max_count, base_salary)')
        .eq('user_id', userId)
        .order('hired_at', { ascending: true });
      staffList = result.data || [];
      staffError = result.error;
    } catch (err: any) {
      console.warn('[GET /api/staff] Table might not exist yet:', err.message);
      return NextResponse.json({ staff: [], currentWeek: 0, remainingWeeks: 34 });
    }

    if (staffError) {
      console.error('[GET /api/staff] Error:', staffError.message);
      // If table doesn't exist yet or relation not found, return empty gracefully
      if (
        staffError.message?.includes('does not exist') ||
        staffError.message?.includes('schema cache') ||
        staffError.message?.includes('relation') ||
        staffError.message?.includes('not found') ||
        staffError.code === '42P01'
      ) {
        return NextResponse.json({ staff: [], currentWeek: 0, remainingWeeks: 34 });
      }
      return NextResponse.json({ error: true, message: 'Personel listesi yüklenirken hata oluştu.' }, { status: 500 });
    }

    // Get the user's profile to find their league_name
    const { data: profile } = await supabase
      .from('profiles')
      .select('league_name')
      .eq('id', userId)
      .maybeSingle();

    // Get current season week from seasons table
    let currentWeek = 0;
    if (profile?.league_name) {
      // Find the user's league via league_teams
      const { data: leagueTeam } = await supabase
        .from('league_teams')
        .select('league_id')
        .eq('profile_id', userId)
        .maybeSingle();

      if (leagueTeam?.league_id) {
        const { data: season } = await supabase
          .from('seasons')
          .select('current_tur')
          .eq('league_id', leagueTeam.league_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        currentWeek = season?.current_tur || 0;
      }
    }

    const remainingWeeks = currentWeek > 0 ? Math.max(1, 34 - currentWeek) : 34;

    return NextResponse.json({
      staff: staffList || [],
      currentWeek,
      remainingWeeks,
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/staff', method: 'GET' });
  }
}
