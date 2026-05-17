/**
 * Facilities API — Tesis seviyelerini ve yükseltme durumunu getir
 * GET /api/facilities?profileId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: true, message: 'Supabase yapılandırılmamış.' }, { status: 500 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: true, message: 'Supabase client null.' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: true, message: 'profileId gerekli.' }, { status: 400 });
    }

    // Fetch user facilities
    const { data: facilities, error: facilitiesError } = await supabase
      .from('user_facilities')
      .select('*')
      .eq('profile_id', profileId);

    if (facilitiesError) {
      console.error('[GET /api/facilities] Error:', facilitiesError.message);
      return NextResponse.json({ error: true, message: 'Tesisler yüklenirken hata oluştu.' }, { status: 500 });
    }

    // Fetch upgrade costs
    const { data: upgradeCosts, error: costsError } = await supabase
      .from('facility_upgrade_costs')
      .select('*')
      .order('facility_type', { ascending: true })
      .order('target_level', { ascending: true });

    if (costsError) {
      console.error('[GET /api/facilities] Costs error:', costsError.message);
    }

    return NextResponse.json({
      facilities: facilities || [],
      upgradeCosts: upgradeCosts || [],
    });
  } catch (err) {
    console.error('[GET /api/facilities] Exception:', err);
    return NextResponse.json({ error: true, message: 'Bir hata oluştu.' }, { status: 500 });
  }
}
